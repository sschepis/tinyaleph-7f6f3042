/**
 * Reasoning Chain Engine
 * Implements fact storage, inference rules, and reasoning traces
 */

export interface Fact {
  id: string;
  name: string;
  statement: string;
  embedding: number[];
  confidence: number;
  source: 'input' | 'inferred' | 'observation';
  timestamp: number;
  derivedFrom: string[]; // IDs of facts this was derived from
}

export interface InferenceRule {
  id: string;
  name: string;
  premises: string[]; // Semantic patterns to match
  conclusion: string;
  confidenceDecay: number; // How much confidence decreases through inference
  transform?: (facts: Fact[]) => Partial<Fact>;
}

export interface ReasoningStep {
  id: string;
  ruleId: string;
  ruleName: string;
  inputFacts: Fact[];
  outputFact: Fact;
  confidence: number;
  timestamp: number;
}

export interface ReasoningEngine {
  facts: Map<string, Fact>;
  rules: InferenceRule[];
  reasoningHistory: ReasoningStep[];
  inferenceDepth: number;
}

// First N primes for embedding
const firstNPrimes = (n: number): number[] => {
  const primes: number[] = [];
  let candidate = 2;
  while (primes.length < n) {
    let isPrime = true;
    for (let i = 2; i <= Math.sqrt(candidate); i++) {
      if (candidate % i === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) primes.push(candidate);
    candidate++;
  }
  return primes;
};

const EMBEDDING_PRIMES = firstNPrimes(16);

// Generate semantic embedding from text
function textToEmbedding(text: string): number[] {
  const embedding = new Array(16).fill(0);
  const normalized = text.toLowerCase();
  
  // Word-level hashing
  const words = normalized.split(/\s+/);
  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    for (let i = 0; i < word.length; i++) {
      const idx = (word.charCodeAt(i) + w) % 16;
      embedding[idx] += 1 / (w + 1) / (i + 1);
    }
  }
  
  // Normalize
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)) || 1;
  return embedding.map(v => v / norm);
}

// Cosine similarity
function similarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 0.0001);
}

export function createReasoningEngine(): ReasoningEngine {
  return {
    facts: new Map(),
    rules: [],
    reasoningHistory: [],
    inferenceDepth: 0
  };
}

export function addFact(
  engine: ReasoningEngine,
  name: string,
  statement: string,
  confidence: number = 1,
  source: 'input' | 'inferred' | 'observation' = 'input',
  derivedFrom: string[] = []
): ReasoningEngine {
  const fact: Fact = {
    id: `fact_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name,
    statement,
    embedding: textToEmbedding(statement),
    confidence: Math.max(0, Math.min(1, confidence)),
    source,
    timestamp: Date.now(),
    derivedFrom
  };
  
  const newFacts = new Map(engine.facts);
  newFacts.set(fact.id, fact);
  
  return { ...engine, facts: newFacts };
}

export function addRule(
  engine: ReasoningEngine,
  name: string,
  premises: string[],
  conclusion: string,
  confidenceDecay: number = 0.9
): ReasoningEngine {
  const rule: InferenceRule = {
    id: `rule_${name.toLowerCase().replace(/\s+/g, '_')}`,
    name,
    premises,
    conclusion,
    confidenceDecay
  };
  
  return { ...engine, rules: [...engine.rules, rule] };
}

// Check if facts match rule premises
function matchPremises(
  facts: Fact[],
  premises: string[],
  threshold: number = 0.4
): Fact[] | null {
  const matchedFacts: Fact[] = [];
  
  for (const premise of premises) {
    const premiseEmb = textToEmbedding(premise);
    let bestMatch: Fact | null = null;
    let bestScore = 0;
    
    for (const fact of facts) {
      if (matchedFacts.includes(fact)) continue;
      
      const score = similarity(premiseEmb, fact.embedding);
      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = fact;
      }
    }
    
    if (bestMatch) {
      matchedFacts.push(bestMatch);
    } else {
      return null; // Not all premises satisfied
    }
  }
  
  return matchedFacts;
}

// Run one step of inference
export function reason(engine: ReasoningEngine): {
  engine: ReasoningEngine;
  newFacts: Fact[];
  steps: ReasoningStep[];
} {
  const facts = Array.from(engine.facts.values());
  const newFacts: Fact[] = [];
  const steps: ReasoningStep[] = [];
  
  for (const rule of engine.rules) {
    const matchedFacts = matchPremises(facts, rule.premises);
    if (!matchedFacts) continue;
    
    // Calculate derived confidence
    const baseConfidence = matchedFacts.reduce((min, f) => Math.min(min, f.confidence), 1);
    const derivedConfidence = baseConfidence * rule.confidenceDecay;
    
    // Check if this conclusion already exists with higher confidence
    const conclusionEmb = textToEmbedding(rule.conclusion);
    const existingFact = facts.find(f => similarity(f.embedding, conclusionEmb) > 0.85);
    
    if (existingFact && existingFact.confidence >= derivedConfidence) {
      continue; // Already have this fact with same or higher confidence
    }
    
    // Create new inferred fact
    const newFact: Fact = {
      id: `fact_inferred_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: `Inferred: ${rule.name}`,
      statement: rule.conclusion,
      embedding: conclusionEmb,
      confidence: derivedConfidence,
      source: 'inferred',
      timestamp: Date.now(),
      derivedFrom: matchedFacts.map(f => f.id)
    };
    
    newFacts.push(newFact);
    
    const step: ReasoningStep = {
      id: `step_${Date.now()}`,
      ruleId: rule.id,
      ruleName: rule.name,
      inputFacts: matchedFacts,
      outputFact: newFact,
      confidence: derivedConfidence,
      timestamp: Date.now()
    };
    
    steps.push(step);
  }
  
  // Add new facts to engine
  const updatedFacts = new Map(engine.facts);
  newFacts.forEach(f => updatedFacts.set(f.id, f));
  
  return {
    engine: {
      ...engine,
      facts: updatedFacts,
      reasoningHistory: [...engine.reasoningHistory.slice(-49), ...steps],
      inferenceDepth: engine.inferenceDepth + 1
    },
    newFacts,
    steps
  };
}

// Run multiple inference steps until no new facts
export function runReasoningChain(
  engine: ReasoningEngine,
  maxSteps: number = 5
): { engine: ReasoningEngine; allNewFacts: Fact[]; allSteps: ReasoningStep[] } {
  let current = engine;
  const allNewFacts: Fact[] = [];
  const allSteps: ReasoningStep[] = [];
  
  for (let i = 0; i < maxSteps; i++) {
    const result = reason(current);
    current = result.engine;
    allNewFacts.push(...result.newFacts);
    allSteps.push(...result.steps);
    
    if (result.newFacts.length === 0) break; // No more inferences possible
  }
  
  return { engine: current, allNewFacts, allSteps };
}

// Query facts semantically
export function query(
  engine: ReasoningEngine,
  question: string,
  threshold: number = 0.3
): { fact: Fact; similarity: number }[] {
  const queryEmb = textToEmbedding(question);
  const results: { fact: Fact; similarity: number }[] = [];
  
  engine.facts.forEach(fact => {
    const sim = similarity(queryEmb, fact.embedding);
    if (sim >= threshold) {
      results.push({ fact, similarity: sim });
    }
  });
  
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
}

// Get facts that were sources for a derived fact
export function getDerivationChain(engine: ReasoningEngine, factId: string): Fact[] {
  const chain: Fact[] = [];
  const visited = new Set<string>();
  
  function traverse(id: string) {
    if (visited.has(id)) return;
    visited.add(id);
    
    const fact = engine.facts.get(id);
    if (!fact) return;
    
    chain.push(fact);
    fact.derivedFrom.forEach(sourceId => traverse(sourceId));
  }
  
  traverse(factId);
  return chain.reverse(); // Root facts first
}

// Get reasoning statistics
export function getReasoningStats(engine: ReasoningEngine): {
  totalFacts: number;
  inputFacts: number;
  inferredFacts: number;
  observationFacts: number;
  ruleCount: number;
  inferenceSteps: number;
  averageConfidence: number;
} {
  const facts = Array.from(engine.facts.values());
  const inputFacts = facts.filter(f => f.source === 'input').length;
  const inferredFacts = facts.filter(f => f.source === 'inferred').length;
  const observationFacts = facts.filter(f => f.source === 'observation').length;
  
  const avgConfidence = facts.length > 0
    ? facts.reduce((s, f) => s + f.confidence, 0) / facts.length
    : 0;
  
  return {
    totalFacts: facts.length,
    inputFacts,
    inferredFacts,
    observationFacts,
    ruleCount: engine.rules.length,
    inferenceSteps: engine.reasoningHistory.length,
    averageConfidence: avgConfidence
  };
}

// Create default reasoning rules
export function addDefaultRules(engine: ReasoningEngine): ReasoningEngine {
  let updated = engine;
  
  // Modus Ponens style
  updated = addRule(
    updated,
    'Coherent Understanding',
    ['high coherence', 'semantic pattern'],
    'The observer has understood the input meaningfully',
    0.85
  );
  
  updated = addRule(
    updated,
    'Memory Formation',
    ['understood input', 'stable state'],
    'A new memory has been consolidated',
    0.8
  );
  
  updated = addRule(
    updated,
    'Goal Progress',
    ['action taken', 'goal alignment'],
    'Progress has been made toward the objective',
    0.9
  );
  
  updated = addRule(
    updated,
    'Exploration Discovery',
    ['new territory explored', 'pattern detected'],
    'A novel semantic region has been discovered',
    0.75
  );
  
  updated = addRule(
    updated,
    'Synthesis',
    ['multiple concepts', 'coherent integration'],
    'Concepts have been synthesized into new understanding',
    0.7
  );
  
  return updated;
}

// Add fact from observation (oscillator state, coherence, etc.)
export function addObservationFact(
  engine: ReasoningEngine,
  observation: string,
  confidence: number
): ReasoningEngine {
  return addFact(engine, `Observation`, observation, confidence, 'observation');
}
