/**
 * Semantic Agent System
 * Goal-directed agency with semantic action selection
 */

export interface AgentGoal {
  id: string;
  description: string;
  embedding: number[]; // Prime-based semantic embedding
  priority: number;
  progress: number;
  status: 'active' | 'achieved' | 'paused' | 'failed';
  createdAt: number;
  targetCondition: (state: AgentState) => boolean;
}

export interface AgentAction {
  id: string;
  name: string;
  description: string;
  embedding: number[];
  preconditions: (state: AgentState) => boolean;
  effects: (state: AgentState) => Partial<AgentState>;
  cost: number;
}

export interface AgentState {
  coherence: number;
  entropy: number;
  explorationProgress: number;
  memoryCount: number;
  activeOscillatorCount: number;
  lastInputTime: number;
  tickCount: number;
  temperature: number;
  coupling: number;
  [key: string]: number | string | boolean;
}

export interface ActionRecord {
  id: string;
  actionId: string;
  actionName: string;
  timestamp: number;
  stateBefore: Partial<AgentState>;
  stateAfter: Partial<AgentState>;
  goalId: string;
  confidence: number;
  reasoning: string;
}

export interface SemanticAgent {
  goals: AgentGoal[];
  availableActions: AgentAction[];
  actionHistory: ActionRecord[];
  currentPlan: string[]; // Action IDs
  state: AgentState;
}

// First N primes for semantic embedding
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
  
  for (let i = 0; i < normalized.length; i++) {
    const idx = normalized.charCodeAt(i) % 16;
    embedding[idx] += 1 / (i + 1); // Positional decay
  }
  
  // Normalize
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0)) || 1;
  return embedding.map(v => v / norm);
}

// Cosine similarity between embeddings
function embeddingSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 0.0001);
}

export function createSemanticAgent(initialState: AgentState): SemanticAgent {
  return {
    goals: [],
    availableActions: [],
    actionHistory: [],
    currentPlan: [],
    state: initialState
  };
}

export function addGoal(
  agent: SemanticAgent,
  description: string,
  priority: number,
  targetCondition: (state: AgentState) => boolean
): SemanticAgent {
  const goal: AgentGoal = {
    id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    description,
    embedding: textToEmbedding(description),
    priority,
    progress: 0,
    status: 'active',
    createdAt: Date.now(),
    targetCondition
  };
  
  return {
    ...agent,
    goals: [...agent.goals, goal].sort((a, b) => b.priority - a.priority)
  };
}

export function registerAction(
  agent: SemanticAgent,
  name: string,
  description: string,
  preconditions: (state: AgentState) => boolean,
  effects: (state: AgentState) => Partial<AgentState>,
  cost: number = 1
): SemanticAgent {
  const action: AgentAction = {
    id: `action_${name.toLowerCase().replace(/\s+/g, '_')}`,
    name,
    description,
    embedding: textToEmbedding(description),
    preconditions,
    effects,
    cost
  };
  
  return {
    ...agent,
    availableActions: [...agent.availableActions, action]
  };
}

export interface ActionSelection {
  action: AgentAction;
  targetGoal: AgentGoal;
  confidence: number;
  reasoning: string;
}

export function selectAction(agent: SemanticAgent): ActionSelection | null {
  // Get highest priority active goal
  const activeGoals = agent.goals.filter(g => g.status === 'active');
  if (activeGoals.length === 0) return null;
  
  const targetGoal = activeGoals[0]; // Already sorted by priority
  
  // Find best action for this goal
  const validActions = agent.availableActions.filter(a => a.preconditions(agent.state));
  if (validActions.length === 0) return null;
  
  let bestAction: AgentAction | null = null;
  let bestScore = -Infinity;
  let reasoning = '';
  
  for (const action of validActions) {
    // Score based on semantic alignment with goal
    const semanticAlignment = embeddingSimilarity(action.embedding, targetGoal.embedding);
    
    // Simulate action effect
    const projectedState = { ...agent.state, ...action.effects(agent.state) };
    
    // Check if action moves toward goal
    const currentProgress = targetGoal.progress;
    const progressBonus = targetGoal.targetCondition(projectedState) ? 1 : 0;
    
    // Cost penalty
    const costPenalty = action.cost * 0.1;
    
    const score = semanticAlignment * 0.4 + progressBonus * 0.5 - costPenalty;
    
    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
      reasoning = `${action.name} aligns ${(semanticAlignment * 100).toFixed(0)}% with goal "${targetGoal.description}"`;
    }
  }
  
  if (!bestAction) return null;
  
  return {
    action: bestAction,
    targetGoal,
    confidence: Math.max(0, Math.min(1, bestScore)),
    reasoning
  };
}

export function executeAction(
  agent: SemanticAgent,
  selection: ActionSelection
): SemanticAgent {
  const stateBefore = { ...agent.state };
  const stateChanges = selection.action.effects(agent.state);
  const stateAfter = { ...agent.state, ...stateChanges };
  
  const record: ActionRecord = {
    id: `record_${Date.now()}`,
    actionId: selection.action.id,
    actionName: selection.action.name,
    timestamp: Date.now(),
    stateBefore,
    stateAfter,
    goalId: selection.targetGoal.id,
    confidence: selection.confidence,
    reasoning: selection.reasoning
  };
  
  // Update goal progress
  const newGoals = agent.goals.map(goal => {
    if (goal.id === selection.targetGoal.id) {
      const achieved = goal.targetCondition(stateAfter);
      return {
        ...goal,
        progress: achieved ? 1 : Math.min(goal.progress + 0.1, 0.99),
        status: achieved ? 'achieved' as const : goal.status
      };
    }
    return goal;
  });
  
  return {
    ...agent,
    state: stateAfter,
    goals: newGoals,
    actionHistory: [...agent.actionHistory.slice(-49), record]
  };
}

export function updateAgentState(
  agent: SemanticAgent,
  stateUpdate: Partial<AgentState>
): SemanticAgent {
  return {
    ...agent,
    state: { ...agent.state, ...stateUpdate }
  };
}

export function getActiveGoals(agent: SemanticAgent): AgentGoal[] {
  return agent.goals.filter(g => g.status === 'active');
}

export function getRecentActions(agent: SemanticAgent, count: number = 5): ActionRecord[] {
  return agent.actionHistory.slice(-count).reverse();
}

// Preset goals for the observer
export function createDefaultGoals(agent: SemanticAgent): SemanticAgent {
  let updated = agent;
  
  updated = addGoal(
    updated,
    'Maintain coherence above 0.6',
    0.9,
    state => state.coherence > 0.6
  );
  
  updated = addGoal(
    updated,
    'Explore 50% of semantic space',
    0.7,
    state => state.explorationProgress > 0.5
  );
  
  updated = addGoal(
    updated,
    'Store at least 3 memories',
    0.6,
    state => state.memoryCount >= 3
  );
  
  updated = addGoal(
    updated,
    'Reduce entropy below 0.5',
    0.5,
    state => state.entropy < 0.5
  );
  
  return updated;
}

// Preset actions for the observer
export function createDefaultActions(agent: SemanticAgent): SemanticAgent {
  let updated = agent;
  
  updated = registerAction(
    updated,
    'Boost Coupling',
    'Increase oscillator coupling to promote synchronization and coherence',
    state => state.coupling < 0.9,
    state => ({ coupling: Math.min(0.95, state.coupling + 0.1) }),
    0.5
  );
  
  updated = registerAction(
    updated,
    'Reduce Temperature',
    'Lower thermal noise to stabilize the system',
    state => state.temperature > 0.2,
    state => ({ temperature: Math.max(0.1, state.temperature - 0.2) }),
    0.3
  );
  
  updated = registerAction(
    updated,
    'Explore New Territory',
    'Excite unexplored oscillators to expand semantic coverage',
    state => state.explorationProgress < 0.9,
    state => ({ explorationProgress: state.explorationProgress + 0.05 }),
    0.8
  );
  
  updated = registerAction(
    updated,
    'Consolidate Memories',
    'Focus on strengthening existing memories by increasing coherence',
    state => state.coherence < 0.8,
    state => ({ coherence: Math.min(1, state.coherence + 0.1) }),
    0.6
  );
  
  updated = registerAction(
    updated,
    'Wait and Observe',
    'Passive observation to let the system naturally evolve',
    () => true,
    state => state, // No change
    0.1
  );
  
  return updated;
}
