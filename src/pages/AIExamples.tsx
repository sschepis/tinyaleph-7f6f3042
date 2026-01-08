import { useState, useMemo, useCallback, useEffect } from 'react';
import ExamplePageWrapper, { ExampleConfig } from '@/components/ExamplePageWrapper';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import SedenionVisualizer from '@/components/SedenionVisualizer';
import { motion } from 'framer-motion';

// Import code examples
import reasoningCode from '@/examples/ai/03-reasoning.js?raw';
import knowledgeGraphCode from '@/examples/ai/04-knowledge-graph.js?raw';
import llmIntegrationCode from '@/examples/ai/05-llm-integration.js?raw';
import agentCode from '@/examples/ai/06-agent.js?raw';
import hybridAICode from '@/examples/ai/07-hybrid-ai.js?raw';
import entropyReasoningCode from '@/examples/ai/08-entropy-reasoning.js?raw';
import conceptLearningCode from '@/examples/ai/09-concept-learning.js?raw';
import promptPrimesCode from '@/examples/ai/10-prompt-primes.js?raw';
import ragCode from '@/examples/ai/11-rag.js?raw';
import neuroSymbolicCode from '@/examples/ai/12-neuro-symbolic.js?raw';

// Simulated SemanticBackend functions
function textToSedenion(text: string): number[] {
  const sedenion = new Array(16).fill(0);
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  
  for (let w = 0; w < words.length; w++) {
    const word = words[w];
    for (let i = 0; i < word.length; i++) {
      const idx = (word.charCodeAt(i) * (w + 1) + i) % 16;
      sedenion[idx] += Math.cos(word.charCodeAt(i) * 0.1) / Math.sqrt(words.length);
    }
  }
  
  const norm = Math.sqrt(sedenion.reduce((s, c) => s + c * c, 0));
  return norm > 0 ? sedenion.map(c => c / norm) : sedenion;
}

function similarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1);
}

function calculateEntropy(state: number[]): number {
  const components = state.map(c => Math.abs(c));
  const sum = components.reduce((s, c) => s + c, 0);
  if (sum === 0) return 0;
  
  const probs = components.map(c => c / sum);
  let entropy = 0;
  for (const p of probs) {
    if (p > 0) entropy -= p * Math.log2(p);
  }
  return entropy / Math.log2(16); // Normalized
}

// Demo 1: Reasoning Chains
const ReasoningDemo = () => {
  const [facts, setFacts] = useState<{name: string; statement: string; confidence: number; embedding: number[]}[]>([
    { name: 'all_men_mortal', statement: 'All men are mortal', confidence: 1.0, embedding: textToSedenion('All men are mortal') },
    { name: 'socrates_man', statement: 'Socrates is a man', confidence: 1.0, embedding: textToSedenion('Socrates is a man') },
  ]);
  const [newFact, setNewFact] = useState('');
  const [query, setQuery] = useState('Is Socrates mortal?');
  const [results, setResults] = useState<{statement: string; similarity: number; confidence: number}[]>([]);

  const addFact = () => {
    if (!newFact.trim()) return;
    const embedding = textToSedenion(newFact);
    setFacts([...facts, {
      name: `fact_${facts.length}`,
      statement: newFact,
      confidence: 1.0,
      embedding
    }]);
    setNewFact('');
  };

  const runQuery = () => {
    if (!query.trim()) return;
    const queryEmbed = textToSedenion(query);
    const scored = facts.map(f => ({
      statement: f.statement,
      similarity: similarity(queryEmbed, f.embedding),
      confidence: f.confidence
    }));
    scored.sort((a, b) => b.similarity * b.confidence - a.similarity * a.confidence);
    // Always show top results, even if similarity is low
    setResults(scored.slice(0, 5));
  };

  const runInference = () => {
    // Simple syllogism: if we have "All X are Y" and "Z is X", conclude "Z is Y"
    const allStatements = facts.filter(f => f.statement.toLowerCase().startsWith('all '));
    const newConclusions: typeof facts = [];
    
    for (const universal of allStatements) {
      for (const particular of facts) {
        if (particular === universal) continue;
        const combinedEmbed = new Array(16).fill(0);
        for (let i = 0; i < 16; i++) {
          combinedEmbed[i] = (universal.embedding[i] + particular.embedding[i]) / 2;
        }
        const norm = Math.sqrt(combinedEmbed.reduce((s, c) => s + c * c, 0));
        const normalized = norm > 0 ? combinedEmbed.map(c => c / norm) : combinedEmbed;
        
        // Check if conclusion already exists
        const existsSimilar = facts.some(f => similarity(f.embedding, normalized) > 0.9);
        if (!existsSimilar) {
          newConclusions.push({
            name: `derived_${facts.length + newConclusions.length}`,
            statement: `Derived: ${particular.statement} implies ${universal.statement.replace('All ', '')}`,
            confidence: universal.confidence * particular.confidence * 0.9,
            embedding: normalized
          });
        }
      }
    }
    
    if (newConclusions.length > 0) {
      setFacts([...facts, ...newConclusions.slice(0, 2)]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Knowledge Base ({facts.length} facts)</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {facts.map((f, i) => (
              <Card key={i} className="p-2 flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-sm">{f.statement}</p>
                  <p className="text-xs text-muted-foreground">Confidence: {(f.confidence * 100).toFixed(0)}%</p>
                </div>
                <SedenionVisualizer components={f.embedding} size="sm" />
              </Card>
            ))}
          </div>
          
          <div className="flex gap-2 mt-4">
            <Input
              value={newFact}
              onChange={(e) => setNewFact(e.target.value)}
              placeholder="Add new fact..."
              className="flex-1"
            />
            <Button onClick={addFact} size="sm">Add</Button>
          </div>
          <Button onClick={runInference} variant="outline" size="sm" className="mt-2 w-full">
            Run Inference
          </Button>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Query Knowledge Base</h4>
          <div className="flex gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1"
            />
            <Button onClick={runQuery}>Query</Button>
          </div>
          
          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Results (ranked by relevance):</h4>
              {results.map((r, i) => (
                <Card key={i} className={`p-2 ${r.similarity > 0.5 ? 'border-primary/50' : ''}`}>
                  <p className="text-sm">{r.statement}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span className={r.similarity > 0.5 ? 'text-green-500' : ''}>
                      Similarity: {(r.similarity * 100).toFixed(1)}%
                    </span>
                    <span>Confidence: {(r.confidence * 100).toFixed(0)}%</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Demo 2: Knowledge Graph
const KnowledgeGraphDemo = () => {
  const [entities, setEntities] = useState<{id: number; name: string; type: string; embedding: number[]}[]>([
    { id: 1, name: 'Alice', type: 'Person', embedding: textToSedenion('Alice is a person engineer') },
    { id: 2, name: 'Bob', type: 'Person', embedding: textToSedenion('Bob is a person designer') },
    { id: 3, name: 'TechCorp', type: 'Company', embedding: textToSedenion('TechCorp is a company technology') },
    { id: 4, name: 'AI', type: 'Topic', embedding: textToSedenion('AI artificial intelligence topic') },
  ]);
  const [relations, setRelations] = useState<{from: number; to: number; type: string}[]>([
    { from: 1, to: 3, type: 'works_at' },
    { from: 2, to: 3, type: 'works_at' },
    { from: 1, to: 4, type: 'interested_in' },
    { from: 1, to: 2, type: 'knows' },
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof entities>([]);
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);

  const search = () => {
    if (!searchQuery.trim()) return;
    const queryEmbed = textToSedenion(searchQuery);
    const scored = entities.map(e => ({
      ...e,
      score: similarity(queryEmbed, e.embedding)
    }));
    scored.sort((a, b) => b.score - a.score);
    setSearchResults(scored.slice(0, 3));
  };

  const getEntityRelations = (id: number) => {
    return relations.filter(r => r.from === id || r.to === id);
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex gap-2">
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entities (e.g., 'engineers in tech')"
          className="flex-1"
        />
        <Button onClick={search}>Search</Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Search Results:</h4>
          {searchResults.map(e => (
            <Card key={e.id} className="p-2 cursor-pointer hover:bg-muted/50" onClick={() => setSelectedEntity(e.id)}>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{e.type}</Badge>
                <span className="font-medium">{e.name}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Graph Visualization */}
      <div className="relative h-[300px] border rounded-lg bg-muted/20 p-4">
        <svg className="w-full h-full">
          {/* Draw relations */}
          {relations.map((r, i) => {
            const from = entities.find(e => e.id === r.from);
            const to = entities.find(e => e.id === r.to);
            if (!from || !to) return null;
            
            const fromX = (from.id * 80) % 300 + 50;
            const fromY = (from.id * 60) % 200 + 50;
            const toX = (to.id * 80) % 300 + 50;
            const toY = (to.id * 60) % 200 + 50;
            
            return (
              <g key={i}>
                <line 
                  x1={fromX} y1={fromY} 
                  x2={toX} y2={toY} 
                  className="stroke-primary/30" 
                  strokeWidth={2}
                />
                <text 
                  x={(fromX + toX) / 2} 
                  y={(fromY + toY) / 2 - 5} 
                  className="fill-muted-foreground text-[8px]"
                >
                  {r.type}
                </text>
              </g>
            );
          })}
          
          {/* Draw entities */}
          {entities.map(e => {
            const x = (e.id * 80) % 300 + 50;
            const y = (e.id * 60) % 200 + 50;
            const isSelected = selectedEntity === e.id;
            
            return (
              <g 
                key={e.id} 
                className="cursor-pointer"
                onClick={() => setSelectedEntity(e.id)}
              >
                <circle 
                  cx={x} cy={y} r={isSelected ? 25 : 20}
                  className={`transition-all ${isSelected ? 'fill-primary' : 'fill-secondary'}`}
                  stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                  strokeWidth={2}
                />
                <text 
                  x={x} y={y + 4} 
                  textAnchor="middle" 
                  className={`text-xs font-medium ${isSelected ? 'fill-primary-foreground' : 'fill-foreground'}`}
                >
                  {e.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Entity Details */}
      {selectedEntity && (
        <Card className="p-4">
          {(() => {
            const e = entities.find(e => e.id === selectedEntity);
            if (!e) return null;
            const rels = getEntityRelations(selectedEntity);
            return (
              <div className="flex gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{e.name}</h3>
                  <Badge variant="outline">{e.type}</Badge>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Relations:</p>
                    {rels.map((r, i) => {
                      const other = entities.find(e => e.id === (r.from === selectedEntity ? r.to : r.from));
                      return (
                        <p key={i} className="text-xs text-muted-foreground">
                          {r.from === selectedEntity ? '→' : '←'} {r.type} {other?.name}
                        </p>
                      );
                    })}
                  </div>
                </div>
                <SedenionVisualizer components={e.embedding} size="md" animated />
              </div>
            );
          })()}
        </Card>
      )}
    </div>
  );
};

// Demo 3: LLM Integration with Semantic Context
const LLMIntegrationDemo = () => {
  const [history, setHistory] = useState<{query: string; response: string; embedding: number[]}[]>([]);
  const [currentQuery, setCurrentQuery] = useState('Explain machine learning');
  const [knownFacts] = useState([
    'Machine learning is a type of artificial intelligence',
    'Deep learning uses neural networks',
    'AI systems can learn from data'
  ]);

  const simulateLLM = (prompt: string): string => {
    const lower = prompt.toLowerCase();
    if (lower.includes('machine learning')) {
      return 'Machine learning enables systems to learn from data automatically, finding patterns without explicit programming.';
    }
    if (lower.includes('deep learning')) {
      return 'Deep learning uses multi-layered neural networks to extract hierarchical features from raw data.';
    }
    if (lower.includes('summarize') || lower.includes('summary')) {
      return 'AI encompasses ML and DL: autonomous pattern learning from data at various abstraction levels.';
    }
    return 'I can explain AI concepts including machine learning, deep learning, and neural networks.';
  };

  const getRelevantContext = (query: string) => {
    const queryEmbed = textToSedenion(query);
    return history
      .map(h => ({ ...h, relevance: similarity(queryEmbed, h.embedding) }))
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 2);
  };

  const askQuestion = () => {
    if (!currentQuery.trim()) return;
    
    const relevantContext = getRelevantContext(currentQuery);
    const contextStr = relevantContext.length > 0 
      ? relevantContext.map(c => `Q: ${c.query}\nA: ${c.response}`).join('\n\n')
      : '';
    
    const enhancedPrompt = contextStr 
      ? `Context:\n${contextStr}\n\nNew question: ${currentQuery}`
      : currentQuery;
    
    const response = simulateLLM(enhancedPrompt);
    const embedding = textToSedenion(currentQuery + ' ' + response);
    
    setHistory([...history, { query: currentQuery, response, embedding }]);
    setCurrentQuery('');
  };

  const verifyResponse = (response: string) => {
    const responseEmbed = textToSedenion(response);
    let maxAlignment = 0;
    let relatedFact = '';
    
    for (const fact of knownFacts) {
      const factEmbed = textToSedenion(fact);
      const align = similarity(responseEmbed, factEmbed);
      if (align > maxAlignment) {
        maxAlignment = align;
        relatedFact = fact;
      }
    }
    
    return { alignment: maxAlignment, verified: maxAlignment > 0.3, relatedFact };
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium mb-2">Knowledge Base (for verification)</h4>
          <div className="space-y-1">
            {knownFacts.map((f, i) => (
              <p key={i} className="text-xs text-muted-foreground p-2 bg-muted/30 rounded">• {f}</p>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Ask Question</h4>
          <div className="flex gap-2">
            <Input
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              placeholder="Ask about AI..."
            />
            <Button onClick={askQuestion}>Ask</Button>
          </div>
        </div>
      </div>

      {/* Conversation History */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {history.map((h, i) => {
          const verification = verifyResponse(h.response);
          return (
            <Card key={i} className="p-3">
              <p className="text-sm font-medium text-primary">Q: {h.query}</p>
              <p className="text-sm mt-1">A: {h.response}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant={verification.verified ? 'default' : 'outline'}>
                  {verification.verified ? '✓ Verified' : '? Uncertain'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Alignment: {(verification.alignment * 100).toFixed(0)}%
                </span>
                <SedenionVisualizer components={h.embedding} size="sm" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

// Demo 4: Semantic Agent
const AgentDemo = () => {
  const [agentState, setAgentState] = useState<Record<string, string>>({
    location: 'home',
    has_coffee: 'no',
    is_working: 'no',
    task_complete: 'no'
  });
  const [goals] = useState([
    { description: 'Complete the work task', priority: 2.0 },
    { description: 'Get energized with coffee', priority: 1.0 }
  ]);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const actions = [
    { name: 'go_to_office', description: 'Travel to office', pre: { location: 'home' }, effects: { location: 'office' } },
    { name: 'make_coffee', description: 'Make coffee', pre: { location: 'office' }, effects: { has_coffee: 'yes' } },
    { name: 'start_work', description: 'Begin working', pre: { location: 'office', has_coffee: 'yes' }, effects: { is_working: 'yes' } },
    { name: 'finish_work', description: 'Complete task', pre: { is_working: 'yes' }, effects: { task_complete: 'yes', is_working: 'no' } }
  ];

  const step = useCallback(() => {
    // Find applicable action
    for (const action of actions) {
      const preConditionsMet = Object.entries(action.pre).every(
        ([key, value]) => agentState[key] === value
      );
      
      if (preConditionsMet) {
        setAgentState(prev => ({ ...prev, ...action.effects }));
        setActionLog(prev => [...prev, `${action.name}: ${action.description}`]);
        return true;
      }
    }
    return false;
  }, [agentState]);

  const runAgent = async () => {
    setIsRunning(true);
    setActionLog([]);
    setAgentState({ location: 'home', has_coffee: 'no', is_working: 'no', task_complete: 'no' });
    
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 800));
      const continued = step();
      if (!continued) break;
    }
    
    setIsRunning(false);
  };

  useEffect(() => {
    if (isRunning && agentState.task_complete !== 'yes') {
      const timer = setTimeout(step, 800);
      return () => clearTimeout(timer);
    } else if (agentState.task_complete === 'yes') {
      setIsRunning(false);
    }
  }, [isRunning, agentState, step]);

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {/* State */}
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Agent State</h4>
          <div className="space-y-1">
            {Object.entries(agentState).map(([key, value]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{key}:</span>
                <Badge variant={value === 'yes' || value === 'office' ? 'default' : 'outline'}>{value}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Goals */}
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Goals</h4>
          <div className="space-y-2">
            {goals.map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                <Badge variant="outline">P{g.priority}</Badge>
                <span className="text-sm">{g.description}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Available Actions</h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            {actions.map((a, i) => (
              <p key={i}>• {a.name}</p>
            ))}
          </div>
        </Card>
      </div>

      <Button onClick={runAgent} disabled={isRunning}>
        {isRunning ? 'Running...' : 'Run Agent'}
      </Button>

      {/* Action Log */}
      {actionLog.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Execution Log</h4>
          <div className="space-y-1">
            {actionLog.map((log, i) => (
              <motion.p 
                key={i} 
                className="text-sm font-mono"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {i + 1}. {log}
              </motion.p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// Demo 5: Hybrid AI
const HybridAIDemo = () => {
  const [symbolicWeight, setSymbolicWeight] = useState(0.6);
  const [text1, setText1] = useState('The cat sat on the mat');
  const [text2, setText2] = useState('The dog sat on the rug');
  
  const getSymbolic = (text: string) => textToSedenion(text);
  
  const getNeural = (text: string) => {
    // Simulated neural embedding
    const embedding = new Array(16).fill(0);
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      embedding[i % 16] += Math.sin(charCode * (i + 1) * 0.1);
    }
    const mag = Math.sqrt(embedding.reduce((s, x) => s + x * x, 0));
    return embedding.map(x => x / (mag || 1));
  };
  
  const getHybrid = (text: string) => {
    const symbolic = getSymbolic(text);
    const neural = getNeural(text);
    return symbolic.map((s, i) => symbolicWeight * s + (1 - symbolicWeight) * neural[i]);
  };

  const analysis = useMemo(() => {
    const sym1 = getSymbolic(text1);
    const sym2 = getSymbolic(text2);
    const neu1 = getNeural(text1);
    const neu2 = getNeural(text2);
    const hyb1 = getHybrid(text1);
    const hyb2 = getHybrid(text2);
    
    return {
      symbolic: similarity(sym1, sym2),
      neural: similarity(neu1, neu2),
      hybrid: similarity(hyb1, hyb2),
      hybrid1: hyb1,
      hybrid2: hyb2
    };
  }, [text1, text2, symbolicWeight]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Text 1</label>
            <Input value={text1} onChange={(e) => setText1(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Text 2</label>
            <Input value={text2} onChange={(e) => setText2(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">
            Symbolic Weight: {(symbolicWeight * 100).toFixed(0)}% (Neural: {((1 - symbolicWeight) * 100).toFixed(0)}%)
          </label>
          <Slider
            value={[symbolicWeight]}
            onValueChange={([v]) => setSymbolicWeight(v)}
            min={0}
            max={1}
            step={0.05}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <h4 className="text-sm font-medium mb-2">Symbolic</h4>
          <p className="text-3xl font-bold text-primary">{(analysis.symbolic * 100).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Prime-based deterministic</p>
        </Card>
        <Card className="p-4 text-center">
          <h4 className="text-sm font-medium mb-2">Neural</h4>
          <p className="text-3xl font-bold text-blue-500">{(analysis.neural * 100).toFixed(1)}%</p>
          <p className="text-xs text-muted-foreground">Simulated transformer</p>
        </Card>
        <Card className="p-4 text-center border-primary">
          <h4 className="text-sm font-medium mb-2">Hybrid</h4>
          <p className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            {(analysis.hybrid * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-muted-foreground">Weighted combination</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Hybrid State 1</h4>
          <SedenionVisualizer components={analysis.hybrid1} size="md" animated />
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Hybrid State 2</h4>
          <SedenionVisualizer components={analysis.hybrid2} size="md" animated />
        </Card>
      </div>
    </div>
  );
};

// Demo 6: Entropy-Based Reasoning
const EntropyReasoningDemo = () => {
  const [hypotheses, setHypotheses] = useState([
    { description: 'Dead battery - no electrical power', probability: 0.25 },
    { description: 'Empty fuel tank - no gas', probability: 0.25 },
    { description: 'Failed starter motor', probability: 0.25 },
    { description: 'Electrical system failure', probability: 0.25 }
  ]);
  const [evidenceLog, setEvidenceLog] = useState<string[]>([]);

  const addEvidence = (evidence: string) => {
    const evidenceEmbed = textToSedenion(evidence);
    
    const likelihoods = hypotheses.map(h => {
      const hEmbed = textToSedenion(h.description);
      return Math.max(0.1, similarity(evidenceEmbed, hEmbed));
    });
    
    const totalLikelihood = likelihoods.reduce((s, l) => s + l, 0);
    
    const updated = hypotheses.map((h, i) => {
      const likelihood = likelihoods[i] / totalLikelihood;
      const newProb = (h.probability * likelihood) / 
        (h.probability * likelihood + (1 - h.probability) * (1 - likelihood));
      return { ...h, probability: newProb };
    });
    
    // Normalize
    const total = updated.reduce((s, h) => s + h.probability, 0);
    setHypotheses(updated.map(h => ({ ...h, probability: h.probability / total })));
    setEvidenceLog([...evidenceLog, evidence]);
  };

  const getBeliefEntropy = () => {
    let entropy = 0;
    for (const h of hypotheses) {
      if (h.probability > 0) {
        entropy -= h.probability * Math.log2(h.probability);
      }
    }
    return entropy / Math.log2(hypotheses.length);
  };

  const entropy = getBeliefEntropy();
  const interpretation = entropy < 0.3 ? { level: 'LOW', action: 'Proceed with confidence', color: 'text-green-500' }
    : entropy < 0.6 ? { level: 'MEDIUM', action: 'Consider alternatives', color: 'text-yellow-500' }
    : entropy < 0.8 ? { level: 'HIGH', action: 'Gather more information', color: 'text-orange-500' }
    : { level: 'VERY HIGH', action: 'Cannot make reliable inference', color: 'text-red-500' };

  const bestHypothesis = [...hypotheses].sort((a, b) => b.probability - a.probability)[0];

  const reset = () => {
    setHypotheses(hypotheses.map(h => ({ ...h, probability: 0.25 })));
    setEvidenceLog([]);
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 text-center">
        <p className="text-sm text-muted-foreground">Scenario: Car won't start. What's wrong?</p>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Hypotheses</h4>
          <div className="space-y-2">
            {hypotheses.map((h, i) => (
              <Card key={i} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">{h.description}</span>
                  <Badge variant={h === bestHypothesis ? 'default' : 'outline'}>
                    {(h.probability * 100).toFixed(0)}%
                  </Badge>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${h.probability * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Entropy Analysis</h4>
          <Card className="p-4">
            <div className="text-center mb-4">
              <p className="text-4xl font-bold">{entropy.toFixed(3)}</p>
              <p className={`text-sm font-medium ${interpretation.color}`}>{interpretation.level}</p>
              <p className="text-xs text-muted-foreground mt-1">{interpretation.action}</p>
            </div>
            
            {bestHypothesis && (
              <div className="border-t pt-3 mt-3">
                <p className="text-xs text-muted-foreground">Best hypothesis:</p>
                <p className="text-sm font-medium">{bestHypothesis.description}</p>
              </div>
            )}
          </Card>

          <h4 className="text-sm font-medium mt-4 mb-2">Add Evidence</h4>
          <div className="space-y-2">
            <Button size="sm" variant="outline" className="w-full" onClick={() => addEvidence('Dashboard lights dont turn on')}>
              "Dashboard lights don't work"
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={() => addEvidence('Headlights are dead no power')}>
              "Headlights also don't work"
            </Button>
            <Button size="sm" variant="outline" className="w-full" onClick={() => addEvidence('Clicking sound when turning key')}>
              "Clicking sound on key turn"
            </Button>
            <Button size="sm" variant="ghost" onClick={reset}>Reset</Button>
          </div>

          {evidenceLog.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">Evidence added:</p>
              {evidenceLog.map((e, i) => (
                <p key={i} className="text-xs">• {e}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Demo 7: Concept Learning
const ConceptLearningDemo = () => {
  const [concepts, setConcepts] = useState<{
    name: string;
    centroid: number[];
    positiveExamples: string[];
    threshold: number;
  }[]>([]);
  const [newConceptName, setNewConceptName] = useState('bird');
  const [positiveExamples, setPositiveExamples] = useState('flying creature with feathers\nanimal with wings and beak\nfeathered creature that lays eggs');
  const [testInstance, setTestInstance] = useState('a sparrow with colorful feathers');
  const [classification, setClassification] = useState<{concept: string; similarity: number; isMember: boolean}[]>([]);

  const learnConcept = () => {
    if (!newConceptName.trim() || !positiveExamples.trim()) return;
    
    const examples = positiveExamples.split('\n').filter(e => e.trim());
    const embeddings = examples.map(e => textToSedenion(e));
    
    // Compute centroid
    const centroid = new Array(16).fill(0);
    for (const emb of embeddings) {
      for (let i = 0; i < 16; i++) {
        centroid[i] += emb[i] / embeddings.length;
      }
    }
    
    setConcepts([...concepts, {
      name: newConceptName,
      centroid,
      positiveExamples: examples,
      threshold: 0.5
    }]);
    setNewConceptName('');
    setPositiveExamples('');
  };

  const classify = () => {
    if (!testInstance.trim() || concepts.length === 0) return;
    
    const instanceEmbed = textToSedenion(testInstance);
    const results = concepts.map(c => {
      const sim = similarity(instanceEmbed, c.centroid);
      return {
        concept: c.name,
        similarity: sim,
        isMember: sim > c.threshold
      };
    });
    results.sort((a, b) => b.similarity - a.similarity);
    setClassification(results);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Learn New Concept</h4>
          <Input
            value={newConceptName}
            onChange={(e) => setNewConceptName(e.target.value)}
            placeholder="Concept name (e.g., 'bird')"
            className="mb-2"
          />
          <Textarea
            value={positiveExamples}
            onChange={(e) => setPositiveExamples(e.target.value)}
            placeholder="Positive examples (one per line)"
            className="mb-2 h-32"
          />
          <Button onClick={learnConcept}>Learn Concept</Button>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Learned Concepts ({concepts.length})</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {concepts.map((c, i) => (
              <Card key={i} className="p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{c.name}</span>
                  <SedenionVisualizer components={c.centroid} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground">{c.positiveExamples.length} examples</p>
              </Card>
            ))}
            {concepts.length === 0 && (
              <p className="text-sm text-muted-foreground">No concepts learned yet</p>
            )}
          </div>
        </div>
      </div>

      {concepts.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Classify Instance</h4>
          <div className="flex gap-2">
            <Input
              value={testInstance}
              onChange={(e) => setTestInstance(e.target.value)}
              placeholder="Instance to classify..."
              className="flex-1"
            />
            <Button onClick={classify}>Classify</Button>
          </div>

          {classification.length > 0 && (
            <div className="mt-4 space-y-2">
              {classification.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <span className="flex items-center gap-2">
                    <span className={c.isMember ? 'text-green-500' : 'text-red-500'}>
                      {c.isMember ? '✓' : '✗'}
                    </span>
                    {c.concept}
                  </span>
                  <span className="text-sm font-mono">{(c.similarity * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

// Demo 8: Prompt Engineering
const PromptEngineeringDemo = () => {
  const [prompt, setPrompt] = useState('Explain how transformer neural networks use attention mechanisms to process sequential data. Focus on the self-attention layer.');

  const analyzePrompt = (text: string) => {
    const embedding = textToSedenion(text);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    // Coherence
    let coherence = 1;
    if (sentences.length > 1) {
      const sentenceEmbeddings = sentences.map(s => textToSedenion(s.trim()));
      let pairSum = 0, pairCount = 0;
      for (let i = 0; i < sentenceEmbeddings.length; i++) {
        for (let j = i + 1; j < sentenceEmbeddings.length; j++) {
          pairSum += similarity(sentenceEmbeddings[i], sentenceEmbeddings[j]);
          pairCount++;
        }
      }
      coherence = pairCount > 0 ? pairSum / pairCount : 1;
    }

    // Specificity (inverse entropy)
    const specificity = 1 - calculateEntropy(embedding);
    
    // Length score
    const wordCount = text.split(/\s+/).length;
    const optimalWords = 30;
    const lengthScore = Math.max(0, 1 - Math.abs(wordCount - optimalWords) / optimalWords);
    
    // Overall score
    const score = 0.3 * coherence + 0.3 * specificity + 0.2 * lengthScore + 0.2 * Math.min(1, embedding.reduce((s, c) => s + c * c, 0) / 2);

    return {
      wordCount,
      sentenceCount: sentences.length,
      coherence,
      specificity,
      lengthScore,
      score,
      embedding
    };
  };

  const analysis = analyzePrompt(prompt);

  const samplePrompts = [
    { name: 'Vague', text: 'Tell me about AI.' },
    { name: 'Specific', text: 'Explain how transformer neural networks use attention mechanisms to process sequential data. Focus on the self-attention layer and its mathematical foundation.' },
    { name: 'Incoherent', text: 'Tell me about cats. What is the weather today? Calculate 2+2. Write a poem.' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium">Prompt</label>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-2 h-24"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Overall Score</p>
          <p className="text-3xl font-bold text-primary">{(analysis.score * 100).toFixed(0)}%</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Coherence</p>
          <p className="text-2xl font-bold">{(analysis.coherence * 100).toFixed(0)}%</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Specificity</p>
          <p className="text-2xl font-bold">{(analysis.specificity * 100).toFixed(0)}%</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Words / Sentences</p>
          <p className="text-2xl font-bold">{analysis.wordCount} / {analysis.sentenceCount}</p>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <SedenionVisualizer components={analysis.embedding} size="lg" animated />
        <div className="flex-1">
          <p className="text-sm font-medium">Semantic Embedding</p>
          <p className="text-xs text-muted-foreground">
            16D sedenion representation of prompt semantics
          </p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2">Try Sample Prompts</h4>
        <div className="flex flex-wrap gap-2">
          {samplePrompts.map((p, i) => (
            <Button key={i} size="sm" variant="outline" onClick={() => setPrompt(p.text)}>
              {p.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Demo 9: RAG System
const RAGDemo = () => {
  const [documents] = useState([
    { id: 'doc1', title: 'Machine Learning Intro', content: 'Machine learning is a subset of AI that enables systems to learn from experience without explicit programming.' },
    { id: 'doc2', title: 'Deep Learning', content: 'Deep learning uses neural networks with many layers to extract hierarchical features from data.' },
    { id: 'doc3', title: 'Neural Networks', content: 'Neural networks consist of interconnected nodes that process information similar to the human brain.' }
  ]);
  const [query, setQuery] = useState('What is machine learning?');
  const [retrievedDocs, setRetrievedDocs] = useState<{title: string; score: number; content: string}[]>([]);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const retrieve = () => {
    if (!query.trim()) return;
    const queryEmbed = textToSedenion(query);
    const scored = documents.map(d => ({
      ...d,
      score: similarity(queryEmbed, textToSedenion(d.content))
    }));
    scored.sort((a, b) => b.score - a.score);
    // Always show top docs ranked by relevance
    setRetrievedDocs(scored.slice(0, 3));
    
    // Generate prompt
    const context = scored.slice(0, 2).map(d => `${d.title}: ${d.content}`).join('\n');
    setGeneratedPrompt(`Context:\n${context}\n\nQuestion: ${query}\n\nAnswer based on the context above.`);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Document Store ({documents.length})</h4>
          <div className="space-y-2">
            {documents.map(d => (
              <Card key={d.id} className="p-3">
                <p className="font-medium text-sm">{d.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{d.content}</p>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Query</h4>
          <div className="flex gap-2">
            <Input value={query} onChange={(e) => setQuery(e.target.value)} />
            <Button onClick={retrieve}>Retrieve</Button>
          </div>

          {retrievedDocs.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Retrieved Chunks</h4>
              <div className="space-y-2">
                {retrievedDocs.map((d, i) => (
                  <Card key={i} className="p-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{d.title}</span>
                      <Badge>{(d.score * 100).toFixed(0)}%</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {generatedPrompt && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2">Generated RAG Prompt</h4>
          <pre className="text-xs bg-muted/30 p-3 rounded overflow-x-auto whitespace-pre-wrap">
            {generatedPrompt}
          </pre>
        </Card>
      )}
    </div>
  );
};

// Demo 10: Neuro-Symbolic Bridge
const NeuroSymbolicDemo = () => {
  const [concepts] = useState(['cat', 'dog', 'animal', 'vehicle', 'computer']);
  const [testPhrase, setTestPhrase] = useState('a furry feline pet');
  const [groundings, setGroundings] = useState<{concept: string; alignment: number}[]>([]);
  const [analysis, setAnalysis] = useState<{text: string; alignment: number; projected: number[]; symbolic: number[]} | null>(null);

  useEffect(() => {
    // Ground concepts
    const g = concepts.map(c => {
      const symbolic = textToSedenion(c);
      const neural = simulateNeural(c);
      const projected = projectToSymbolic(neural);
      return {
        concept: c,
        alignment: similarity(projected, symbolic)
      };
    });
    setGroundings(g);
  }, [concepts]);

  const simulateNeural = (text: string): number[] => {
    const embedding = new Array(384).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      for (let i = 0; i < word.length; i++) {
        const idx = (word.charCodeAt(i) * (w + 1) * (i + 1)) % 384;
        embedding[idx] += Math.cos(word.charCodeAt(i) * 0.1);
      }
    }
    const mag = Math.sqrt(embedding.reduce((s, x) => s + x * x, 0));
    return embedding.map(x => x / (mag || 1));
  };

  const projectToSymbolic = (neural: number[]): number[] => {
    const symbolic = new Array(16).fill(0);
    for (let i = 0; i < 16; i++) {
      for (let j = 0; j < 384; j++) {
        symbolic[i] += Math.sin(i * 7 + j * 13) * Math.cos(i * 11 + j * 17) * 0.1 * neural[j];
      }
    }
    const mag = Math.sqrt(symbolic.reduce((s, x) => s + x * x, 0));
    return symbolic.map(x => x / (mag || 1));
  };

  const analyze = () => {
    const neural = simulateNeural(testPhrase);
    const projected = projectToSymbolic(neural);
    const symbolic = textToSedenion(testPhrase);
    const alignment = similarity(projected, symbolic);
    setAnalysis({ text: testPhrase, alignment, projected, symbolic });
  };

  const findGrounding = () => {
    const neural = simulateNeural(testPhrase);
    const projected = projectToSymbolic(neural);
    
    let best = { concept: '', score: -1 };
    for (const c of concepts) {
      const sym = textToSedenion(c);
      const score = similarity(projected, sym);
      if (score > best.score) {
        best = { concept: c, score };
      }
    }
    return best;
  };

  const grounding = findGrounding();

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Grounded Concepts</h4>
          <div className="space-y-2">
            {groundings.map((g, i) => (
              <Card key={i} className="p-2 flex items-center justify-between">
                <span className="font-medium">{g.concept}</span>
                <span className="text-sm font-mono">{(g.alignment * 100).toFixed(1)}% aligned</span>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2">Test Neural → Symbolic Projection</h4>
          <div className="flex gap-2">
            <Input value={testPhrase} onChange={(e) => setTestPhrase(e.target.value)} />
            <Button onClick={analyze}>Analyze</Button>
          </div>

          {grounding.score > 0 && (
            <Card className="mt-4 p-4">
              <p className="text-sm">Best grounding: <span className="font-bold text-primary">{grounding.concept}</span></p>
              <p className="text-xs text-muted-foreground">Match score: {(grounding.score * 100).toFixed(1)}%</p>
            </Card>
          )}
        </div>
      </div>

      {analysis && (
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-4">Neural-Symbolic Alignment Analysis</h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Projected (Neural→Symbolic)</p>
              <SedenionVisualizer components={analysis.projected} size="md" animated />
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{(analysis.alignment * 100).toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Alignment</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Direct Symbolic</p>
              <SedenionVisualizer components={analysis.symbolic} size="md" animated />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

// Example configurations
const examples: ExampleConfig[] = [
  { id: 'reasoning', number: '03', title: 'Reasoning Chains', subtitle: 'Multi-step inference', description: 'Build reasoning chains with confidence tracking', concepts: ['Syllogism', 'Inference', 'Confidence'], code: reasoningCode },
  { id: 'knowledge-graph', number: '04', title: 'Knowledge Graph', subtitle: 'Entity relations', description: 'Prime-based semantic knowledge graphs', concepts: ['Entities', 'Relations', 'Path finding'], code: knowledgeGraphCode },
  { id: 'llm-integration', number: '05', title: 'LLM Integration', subtitle: 'Context & verification', description: 'Semantic context management for LLMs', concepts: ['Context', 'Verification', 'Memory'], code: llmIntegrationCode },
  { id: 'agent', number: '06', title: 'Semantic Agent', subtitle: 'Goal-directed AI', description: 'Agent with semantic state and action selection', concepts: ['Goals', 'Actions', 'Planning'], code: agentCode },
  { id: 'hybrid-ai', number: '07', title: 'Hybrid AI', subtitle: 'Symbolic + Neural', description: 'Combine symbolic primes with neural embeddings', concepts: ['Hybrid', 'Weighting', 'Flexibility'], code: hybridAICode },
  { id: 'entropy-reasoning', number: '08', title: 'Entropy Reasoning', subtitle: 'Uncertainty tracking', description: 'Entropy minimization for inference guidance', concepts: ['Entropy', 'Bayesian', 'Evidence'], code: entropyReasoningCode },
  { id: 'concept-learning', number: '09', title: 'Concept Learning', subtitle: 'Few-shot learning', description: 'Learn concepts from examples with centroids', concepts: ['Centroids', 'Threshold', 'Classification'], code: conceptLearningCode },
  { id: 'prompt-engineering', number: '10', title: 'Prompt Engineering', subtitle: 'Prompt analysis', description: 'Analyze prompt coherence and specificity', concepts: ['Coherence', 'Specificity', 'Templates'], code: promptPrimesCode },
  { id: 'rag', number: '11', title: 'RAG System', subtitle: 'Retrieval augmentation', description: 'Retrieval Augmented Generation with primes', concepts: ['Chunking', 'Retrieval', 'Context'], code: ragCode },
  { id: 'neuro-symbolic', number: '12', title: 'Neuro-Symbolic Bridge', subtitle: 'Neural→Symbolic', description: 'Map neural embeddings to symbolic representations', concepts: ['Projection', 'Grounding', 'Alignment'], code: neuroSymbolicCode }
];

const exampleComponents: Record<string, React.FC> = {
  'reasoning': ReasoningDemo,
  'knowledge-graph': KnowledgeGraphDemo,
  'llm-integration': LLMIntegrationDemo,
  'agent': AgentDemo,
  'hybrid-ai': HybridAIDemo,
  'entropy-reasoning': EntropyReasoningDemo,
  'concept-learning': ConceptLearningDemo,
  'prompt-engineering': PromptEngineeringDemo,
  'rag': RAGDemo,
  'neuro-symbolic': NeuroSymbolicDemo
};

const AIExamples = () => {
  return (
    <ExamplePageWrapper
      category="AI Integration"
      title="AI Integration Examples"
      description="Advanced AI techniques using TinyAleph's prime-based semantic computing"
      examples={examples}
      exampleComponents={exampleComponents}
    />
  );
};

export default AIExamples;
