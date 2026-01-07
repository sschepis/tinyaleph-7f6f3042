import { useState, useCallback, useMemo } from 'react';
import { Play, RefreshCw, ArrowRight, Brain, Zap, GitBranch, Scale, Lightbulb, Layers, BookOpen, Network } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import SedenionVisualizer from '../components/SedenionVisualizer';
import {
  createEngine,
  SemanticBackend,
} from '@aleph-ai/tinyaleph';
import { minimalConfig } from '@/lib/tinyaleph-config';

const EngineExample = () => {
  const [input, setInput] = useState('What is the nature of wisdom?');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{
    output: string;
    entropy: number;
    steps: number;
    orderParameter: number;
    state: number[];
    stepLog: { step: number; entropy: number; transform?: string }[];
  } | null>(null);

  const runEngine = useCallback(async () => {
    setRunning(true);
    setResult(null);

    try {
      const engine = createEngine('semantic', {
        ...minimalConfig,
        engineOptions: {
          oscillatorCount: 16,
          coupling: 0.2,
          entropyThreshold: 0.1,
          maxIterations: 50,
        }
      });

      // Run the engine
      const engineResult = engine.run(input);

      const stepLog = engineResult.steps?.map((s: any, i: number) => ({
        step: i + 1,
        entropy: s.entropyAfter || s.entropy || 0,
        transform: s.transform || 'transform',
      })) || [];

      // Get state components safely
      let stateComponents: number[] = [];
      if (engineResult.state) {
        if (engineResult.state.components) {
          stateComponents = engineResult.state.components.slice(0, 16);
        } else if ((engineResult.state as any).c) {
          stateComponents = [...(engineResult.state as any).c].slice(0, 16);
        }
      }

      setResult({
        output: engineResult.output || input,
        entropy: engineResult.entropy || 0,
        steps: engineResult.steps?.length || 0,
        orderParameter: engineResult.oscillators?.orderParameter || 0,
        state: stateComponents.length > 0 ? stateComponents : Array(16).fill(0),
        stepLog,
      });
    } catch (e) {
      console.error('Engine error:', e);
      setResult({
        output: `Error: ${(e as Error).message}`,
        entropy: 0,
        steps: 0,
        orderParameter: 0,
        state: Array(16).fill(0),
        stepLog: [],
      });
    }

    setRunning(false);
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Full Pipeline</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
              placeholder="Enter a query..."
            />
            <button
              onClick={runEngine}
              disabled={running}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {running ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Run
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Final State</h4>
                  <div className="flex justify-center">
                    <SedenionVisualizer 
                      components={result.state.map((c: number) => Math.abs(c))}
                      animated={false}
                      size="lg"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Final Entropy:</span>
                    <span className="font-mono text-primary">{result.entropy.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transform Steps:</span>
                    <span className="font-mono text-primary">{result.steps}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Parameter:</span>
                    <span className="font-mono text-primary">{result.orderParameter.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {result.stepLog.length > 0 && (
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Entropy Reduction</h4>
                  <div className="space-y-1">
                    {result.stepLog.slice(0, 10).map((step, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-8 font-mono text-muted-foreground">#{step.step}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, (step.entropy / 4) * 100)}%` }}
                          />
                        </div>
                        <span className="w-16 font-mono text-xs text-right">
                          {step.entropy.toFixed(3)}
                        </span>
                      </div>
                    ))}
                    {result.stepLog.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        ...+{result.stepLog.length - 10} more steps
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="text-sm font-medium text-primary mb-2">Output</h4>
                <p className="text-sm">{result.output}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { createEngine } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

// Create semantic engine
const engine = createEngine('semantic', {
  ...config,
  engineOptions: {
    oscillatorCount: 16,
    coupling: 0.2,
    entropyThreshold: 0.1,
    maxIterations: 50
  }
});

// Run computation pipeline
const result = engine.run('${input}');

console.log('Output:', result.output);
console.log('Entropy:', result.entropy);
console.log('Steps:', result.steps.length);
console.log('Order Parameter:', result.oscillators.orderParameter);

// Trace entropy reduction
for (const step of result.steps) {
  console.log(\`Step \${step.step}: entropy \${step.entropyAfter.toFixed(3)}\`);
}`}
        language="javascript"
        title="engine-example.js"
      />
    </div>
);
};

// Helper to safely extract state components
const safeComponents = (state: any): number[] => {
  const c = state?.c || state?.components || [];
  if (!Array.isArray(c)) return Array(16).fill(0);
  return c.slice(0, 16).map((val: number) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  });
};

// Helper to compute coherence between two state arrays
const computeCoherence = (a: number[], b: number[]): number => {
  const normA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const normB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  if (normA === 0 || normB === 0) return 0;
  const dot = a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
  return Math.abs(dot) / (normA * normB);
};

// Analogical Reasoning Demo
const AnalogicalReasoningDemo = () => {
  const [baseA, setBaseA] = useState('king');
  const [baseB, setBaseB] = useState('queen');
  const [targetA, setTargetA] = useState('man');
  const [result, setResult] = useState<{ predicted: string; confidence: number; candidates: { word: string; score: number }[] } | null>(null);
  const [running, setRunning] = useState(false);

  const backend = useMemo(() => new SemanticBackend(minimalConfig), []);

  const runAnalogy = useCallback(() => {
    setRunning(true);
    try {
      // Encode terms to primes then to state
      const primesA = backend.encode(baseA);
      const primesB = backend.encode(baseB);
      const primesTarget = backend.encode(targetA);
      
      const stateA = safeComponents(backend.primesToState(primesA));
      const stateB = safeComponents(backend.primesToState(primesB));
      const stateTarget = safeComponents(backend.primesToState(primesTarget));

      // Compute difference vector (B - A)
      const diff = stateB.map((v, i) => v - stateA[i]);
      
      // Apply to target: targetA + diff = predicted
      const predictedComponents = stateTarget.map((v, i) => v + diff[i] * 0.8);
      
      // Find closest matches in vocabulary
      const candidates = ['woman', 'boy', 'girl', 'prince', 'princess', 'child', 'person', 'human', 'wisdom', 'truth', 'love', 'power']
        .map(word => {
          const wordPrimes = backend.encode(word);
          const wordState = safeComponents(backend.primesToState(wordPrimes));
          const similarity = computeCoherence(predictedComponents, wordState);
          return { word, score: similarity };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

      setResult({
        predicted: candidates[0]?.word || 'unknown',
        confidence: candidates[0]?.score || 0,
        candidates
      });
    } catch (e) {
      console.error(e);
    }
    setRunning(false);
  }, [baseA, baseB, targetA, backend]);

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Analogical Reasoning</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Vector arithmetic: A is to B as C is to ?
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          value={baseA}
          onChange={(e) => setBaseA(e.target.value)}
          className="w-24 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
          placeholder="A"
        />
        <span className="text-muted-foreground">:</span>
        <input
          value={baseB}
          onChange={(e) => setBaseB(e.target.value)}
          className="w-24 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
          placeholder="B"
        />
        <span className="text-muted-foreground">::</span>
        <input
          value={targetA}
          onChange={(e) => setTargetA(e.target.value)}
          className="w-24 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
          placeholder="C"
        />
        <span className="text-muted-foreground">:</span>
        <span className="px-3 py-2 rounded-lg bg-primary/20 text-primary font-semibold min-w-[80px]">
          {result?.predicted || '?'}
        </span>
        <button
          onClick={runAnalogy}
          disabled={running}
          className="ml-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        </button>
      </div>

      {result && (
        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Confidence:</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full bg-primary transition-all"
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
            <span className="font-mono text-primary">{(result.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.candidates.map((c, i) => (
              <span 
                key={c.word}
                className={`px-2 py-1 rounded text-xs ${i === 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
              >
                {c.word} ({(c.score * 100).toFixed(0)}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Semantic Entailment Demo
const EntailmentDemo = () => {
  const [premise, setPremise] = useState('knowledge');
  const [hypothesis, setHypothesis] = useState('wisdom');
  const [result, setResult] = useState<{ entails: boolean; confidence: number; sharedPrimes: number[]; explanation: string } | null>(null);

  const backend = useMemo(() => new SemanticBackend(minimalConfig), []);

  const checkEntailment = useCallback(() => {
    const premisePrimes = backend.encode(premise);
    const hypothesisPrimes = backend.encode(hypothesis);
    
    const premiseState = safeComponents(backend.primesToState(premisePrimes));
    const hypothesisState = safeComponents(backend.primesToState(hypothesisPrimes));
    
    const coherence = computeCoherence(premiseState, hypothesisState);
    
    // Find shared semantic primes
    const premisePrimeSet = new Set(premisePrimes);
    const shared = hypothesisPrimes.filter((p: number) => premisePrimeSet.has(p));
    
    // Entailment if high coherence and shared primes
    const entails = coherence > 0.4 && shared.length > 0;
    
    const explanation = entails 
      ? `"${premise}" semantically entails "${hypothesis}" via shared primes [${shared.join(', ')}]`
      : `"${premise}" does not directly entail "${hypothesis}" (low overlap)`;

    setResult({ entails, confidence: coherence, sharedPrimes: shared, explanation });
  }, [premise, hypothesis, backend]);

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <GitBranch className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Semantic Entailment</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Does the premise semantically entail the hypothesis?
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          value={premise}
          onChange={(e) => setPremise(e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
          placeholder="Premise"
        />
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <input
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
          className="flex-1 min-w-[120px] px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
          placeholder="Hypothesis"
        />
        <button
          onClick={checkEntailment}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Check
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.entails ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg font-semibold ${result.entails ? 'text-green-500' : 'text-red-500'}`}>
              {result.entails ? '✓ Entails' : '✗ Does Not Entail'}
            </span>
            <span className="text-sm text-muted-foreground">
              (confidence: {(result.confidence * 100).toFixed(1)}%)
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{result.explanation}</p>
          {result.sharedPrimes.length > 0 && (
            <div className="mt-2 flex gap-1">
              {result.sharedPrimes.map(p => (
                <span key={p} className="px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-mono">{p}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Chain of Thought Reasoning
const ChainOfThoughtDemo = () => {
  const [query, setQuery] = useState('What leads to understanding?');
  const [chain, setChain] = useState<{ step: number; concept: string; entropy: number; reasoning: string }[]>([]);
  const [running, setRunning] = useState(false);

  const backend = useMemo(() => new SemanticBackend(minimalConfig), []);

  const runChainOfThought = useCallback(async () => {
    setRunning(true);
    setChain([]);
    
    const concepts = ['curiosity', 'learning', 'knowledge', 'wisdom', 'understanding'];
    const thoughtChain: { step: number; concept: string; entropy: number; reasoning: string }[] = [];
    
    const queryPrimes = backend.encode(query.split(' ')[0] || 'question');
    let prevState = safeComponents(backend.primesToState(queryPrimes));
    
    for (let i = 0; i < concepts.length; i++) {
      const currentPrimes = backend.encode(concepts[i]);
      const currentStateObj = backend.primesToState(currentPrimes);
      const currentState = safeComponents(currentStateObj);
      const coherence = computeCoherence(prevState, currentState);
      const entropy = typeof currentStateObj.entropy === 'function' ? currentStateObj.entropy() : 0;
      
      const reasoning = coherence > 0.4
        ? `High coherence (${(coherence * 100).toFixed(0)}%) suggests logical progression`
        : `Moderate coherence (${(coherence * 100).toFixed(0)}%) indicates conceptual leap`;
      
      thoughtChain.push({
        step: i + 1,
        concept: concepts[i],
        entropy: Number.isFinite(entropy) ? entropy : 0,
        reasoning
      });
      
      setChain([...thoughtChain]);
      await new Promise(r => setTimeout(r, 400));
      prevState = currentState;
    }
    
    setRunning(false);
  }, [query, backend]);

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Chain of Thought Reasoning</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Step-by-step reasoning through semantic space.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
          placeholder="Enter a query..."
        />
        <button
          onClick={runChainOfThought}
          disabled={running}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {running ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Reason'}
        </button>
      </div>

      {chain.length > 0 && (
        <div className="space-y-2">
          {chain.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 animate-in fade-in slide-in-from-left-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold shrink-0">
                {step.step}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{step.concept}</span>
                  <span className="text-xs text-muted-foreground font-mono">H={step.entropy.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground">{step.reasoning}</p>
              </div>
              {i < chain.length - 1 && (
                <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Contradiction Detection
const ContradictionDemo = () => {
  const [statements, setStatements] = useState(['light', 'darkness']);
  const [result, setResult] = useState<{ contradicts: boolean; score: number; explanation: string } | null>(null);

  const backend = useMemo(() => new SemanticBackend(minimalConfig), []);

  const detectContradiction = useCallback(() => {
    if (statements.length < 2) return;
    
    const primes1 = backend.encode(statements[0]);
    const primes2 = backend.encode(statements[1]);
    const state1 = safeComponents(backend.primesToState(primes1));
    const state2 = safeComponents(backend.primesToState(primes2));
    
    const coherence = computeCoherence(state1, state2);
    
    // Check for opposing semantic dimensions
    const dotProduct = state1.reduce((sum, v, i) => sum + v * state2[i], 0);
    const contradicts = dotProduct < 0 || coherence < 0.2;
    
    const explanation = contradicts
      ? `Semantic opposition detected: "${statements[0]}" and "${statements[1]}" occupy opposing regions of semantic space`
      : `No clear contradiction: concepts share semantic overlap (coherence: ${(coherence * 100).toFixed(0)}%)`;

    setResult({ contradicts, score: 1 - coherence, explanation });
  }, [statements, backend]);

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Contradiction Detection</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Detect semantic contradictions between concepts.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          value={statements[0]}
          onChange={(e) => setStatements([e.target.value, statements[1]])}
          className="flex-1 min-w-[100px] px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
          placeholder="Concept A"
        />
        <Scale className="w-4 h-4 text-muted-foreground" />
        <input
          value={statements[1]}
          onChange={(e) => setStatements([statements[0], e.target.value])}
          className="flex-1 min-w-[100px] px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
          placeholder="Concept B"
        />
        <button
          onClick={detectContradiction}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Detect
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg ${result.contradicts ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-lg font-semibold ${result.contradicts ? 'text-amber-500' : 'text-green-500'}`}>
              {result.contradicts ? '⚡ Contradiction Detected' : '✓ Compatible'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{result.explanation}</p>
        </div>
      )}
    </div>
  );
};

// Inference Engine Demo
const InferenceDemo = () => {
  const [premises, setPremises] = useState(['fire', 'heat']);
  const [conclusion, setConclusion] = useState<{ inferred: string; strength: number; path: string[] } | null>(null);

  const backend = useMemo(() => new SemanticBackend(minimalConfig), []);

  const runInference = useCallback(() => {
    // Encode premises to states
    const premiseStates = premises.map(p => {
      const primes = backend.encode(p);
      return safeComponents(backend.primesToState(primes));
    });
    
    // Combine premise states
    const combinedComponents = premiseStates[0].map((_, i) => 
      premiseStates.reduce((sum, state) => sum + state[i], 0) / premises.length
    );
    
    // Find best matching conclusion from candidates
    const candidates = ['energy', 'light', 'warmth', 'destruction', 'power', 'change', 'transformation'];
    const scored = candidates.map(word => {
      const wordPrimes = backend.encode(word);
      const wordState = safeComponents(backend.primesToState(wordPrimes));
      const similarity = computeCoherence(combinedComponents, wordState);
      return { word, score: similarity };
    }).sort((a, b) => b.score - a.score);

    setConclusion({
      inferred: scored[0].word,
      strength: scored[0].score,
      path: [...premises, '→', scored[0].word]
    });
  }, [premises, backend]);

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Semantic Inference</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Infer conclusions from combined premises.
      </p>

      <div className="space-y-3 mb-4">
        {premises.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground w-16">Premise {i + 1}:</span>
            <input
              value={p}
              onChange={(e) => {
                const newPremises = [...premises];
                newPremises[i] = e.target.value;
                setPremises(newPremises);
              }}
              className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
            />
          </div>
        ))}
        <button
          onClick={() => setPremises([...premises, ''])}
          className="text-xs text-primary hover:underline"
        >
          + Add premise
        </button>
      </div>

      <button
        onClick={runInference}
        className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-4"
      >
        Run Inference
      </button>

      {conclusion && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg font-semibold text-primary">Inferred: {conclusion.inferred}</span>
            <span className="text-sm text-muted-foreground">
              (strength: {(conclusion.strength * 100).toFixed(0)}%)
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {conclusion.path.map((p, i) => (
              <span key={i} className={p === '→' ? '' : 'px-2 py-0.5 rounded bg-muted'}>{p}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Formal Logic Validation Demo
type LogicForm = 'syllogism' | 'modus_ponens' | 'modus_tollens' | 'hypothetical' | 'disjunctive';

const SyllogismDemo = () => {
  const [logicForm, setLogicForm] = useState<LogicForm>('syllogism');
  const [syllogism, setSyllogism] = useState({
    majorPremise: { quantifier: 'All', subject: 'humans', predicate: 'mortal' },
    minorPremise: { quantifier: '', subject: 'Socrates', predicate: 'human' },
    conclusion: { quantifier: '', subject: 'Socrates', predicate: 'mortal' }
  });
  const [modusPonens, setModusPonens] = useState({
    conditional: { antecedent: 'rain', consequent: 'wet' },
    assertion: 'rain',
    conclusion: 'wet'
  });
  const [modusTollens, setModusTollens] = useState({
    conditional: { antecedent: 'fire', consequent: 'smoke' },
    negation: 'smoke',
    conclusion: 'fire'
  });
  const [hypothetical, setHypothetical] = useState({
    first: { antecedent: 'study', consequent: 'knowledge' },
    second: { antecedent: 'knowledge', consequent: 'wisdom' },
    conclusion: { antecedent: 'study', consequent: 'wisdom' }
  });
  const [disjunctive, setDisjunctive] = useState({
    disjunction: { left: 'rain', right: 'sun' },
    negation: 'rain',
    conclusion: 'sun'
  });
  const [result, setResult] = useState<{
    valid: boolean;
    confidence: number;
    reasoning: string[];
    keyStrength: number;
    formName: string;
  } | null>(null);

  const backend = useMemo(() => new SemanticBackend(minimalConfig), []);

  const validateLogic = useCallback(() => {
    const reasoning: string[] = [];
    let valid = false;
    let confidence = 0;
    let keyStrength = 0;
    let formName = '';

    if (logicForm === 'syllogism') {
      formName = 'Syllogism';
      const majorSubjectState = safeComponents(backend.primesToState(backend.encode(syllogism.majorPremise.subject)));
      const majorPredicateState = safeComponents(backend.primesToState(backend.encode(syllogism.majorPremise.predicate)));
      const minorSubjectState = safeComponents(backend.primesToState(backend.encode(syllogism.minorPremise.subject)));
      const minorPredicateState = safeComponents(backend.primesToState(backend.encode(syllogism.minorPremise.predicate)));
      const conclusionSubjectState = safeComponents(backend.primesToState(backend.encode(syllogism.conclusion.subject)));
      const conclusionPredicateState = safeComponents(backend.primesToState(backend.encode(syllogism.conclusion.predicate)));

      const middleTermCoherence = computeCoherence(majorSubjectState, minorPredicateState);
      reasoning.push(`Middle term: "${syllogism.majorPremise.subject}" ↔ "${syllogism.minorPremise.predicate}" = ${(middleTermCoherence * 100).toFixed(0)}%`);

      const subjectMatch = computeCoherence(conclusionSubjectState, minorSubjectState);
      const predicateMatch = computeCoherence(conclusionPredicateState, majorPredicateState);
      reasoning.push(`Subject preservation: ${(subjectMatch * 100).toFixed(0)}% | Predicate transfer: ${(predicateMatch * 100).toFixed(0)}%`);

      keyStrength = middleTermCoherence;
      confidence = (middleTermCoherence * 0.4 + subjectMatch * 0.3 + predicateMatch * 0.3);
      valid = middleTermCoherence > 0.3 && subjectMatch > 0.5 && predicateMatch > 0.5;

    } else if (logicForm === 'modus_ponens') {
      formName = 'Modus Ponens (P → Q, P ⊢ Q)';
      const antecedentState = safeComponents(backend.primesToState(backend.encode(modusPonens.conditional.antecedent)));
      const consequentState = safeComponents(backend.primesToState(backend.encode(modusPonens.conditional.consequent)));
      const assertionState = safeComponents(backend.primesToState(backend.encode(modusPonens.assertion)));
      const conclusionState = safeComponents(backend.primesToState(backend.encode(modusPonens.conclusion)));

      const assertionMatch = computeCoherence(assertionState, antecedentState);
      reasoning.push(`Assertion ↔ Antecedent: ${(assertionMatch * 100).toFixed(0)}%`);

      const conclusionMatch = computeCoherence(conclusionState, consequentState);
      reasoning.push(`Conclusion ↔ Consequent: ${(conclusionMatch * 100).toFixed(0)}%`);

      keyStrength = assertionMatch;
      confidence = (assertionMatch * 0.5 + conclusionMatch * 0.5);
      valid = assertionMatch > 0.5 && conclusionMatch > 0.5;

    } else if (logicForm === 'modus_tollens') {
      formName = 'Modus Tollens (P → Q, ¬Q ⊢ ¬P)';
      const antecedentState = safeComponents(backend.primesToState(backend.encode(modusTollens.conditional.antecedent)));
      const consequentState = safeComponents(backend.primesToState(backend.encode(modusTollens.conditional.consequent)));
      const negationState = safeComponents(backend.primesToState(backend.encode(modusTollens.negation)));
      const conclusionState = safeComponents(backend.primesToState(backend.encode(modusTollens.conclusion)));

      const negationMatch = computeCoherence(negationState, consequentState);
      reasoning.push(`Negation targets consequent: ${(negationMatch * 100).toFixed(0)}%`);

      const conclusionMatch = computeCoherence(conclusionState, antecedentState);
      reasoning.push(`Conclusion targets antecedent: ${(conclusionMatch * 100).toFixed(0)}%`);

      keyStrength = negationMatch;
      confidence = (negationMatch * 0.5 + conclusionMatch * 0.5);
      valid = negationMatch > 0.4 && conclusionMatch > 0.4;

    } else if (logicForm === 'hypothetical') {
      formName = 'Hypothetical Syllogism (P → Q, Q → R ⊢ P → R)';
      const p1State = safeComponents(backend.primesToState(backend.encode(hypothetical.first.antecedent)));
      const q1State = safeComponents(backend.primesToState(backend.encode(hypothetical.first.consequent)));
      const q2State = safeComponents(backend.primesToState(backend.encode(hypothetical.second.antecedent)));
      const rState = safeComponents(backend.primesToState(backend.encode(hypothetical.second.consequent)));
      const concPState = safeComponents(backend.primesToState(backend.encode(hypothetical.conclusion.antecedent)));
      const concRState = safeComponents(backend.primesToState(backend.encode(hypothetical.conclusion.consequent)));

      // Check middle term connection (Q1 ↔ Q2)
      const middleMatch = computeCoherence(q1State, q2State);
      reasoning.push(`Middle term: "${hypothetical.first.consequent}" ↔ "${hypothetical.second.antecedent}" = ${(middleMatch * 100).toFixed(0)}%`);

      // Check conclusion antecedent matches first antecedent
      const antecedentMatch = computeCoherence(concPState, p1State);
      reasoning.push(`Conclusion antecedent: "${hypothetical.conclusion.antecedent}" ↔ "${hypothetical.first.antecedent}" = ${(antecedentMatch * 100).toFixed(0)}%`);

      // Check conclusion consequent matches second consequent
      const consequentMatch = computeCoherence(concRState, rState);
      reasoning.push(`Conclusion consequent: "${hypothetical.conclusion.consequent}" ↔ "${hypothetical.second.consequent}" = ${(consequentMatch * 100).toFixed(0)}%`);

      keyStrength = middleMatch;
      confidence = (middleMatch * 0.4 + antecedentMatch * 0.3 + consequentMatch * 0.3);
      valid = middleMatch > 0.4 && antecedentMatch > 0.5 && consequentMatch > 0.5;

      reasoning.push(`Chain: ${hypothetical.first.antecedent} → ${hypothetical.first.consequent} → ${hypothetical.second.consequent}`);

    } else if (logicForm === 'disjunctive') {
      formName = 'Disjunctive Syllogism (P ∨ Q, ¬P ⊢ Q)';
      const leftState = safeComponents(backend.primesToState(backend.encode(disjunctive.disjunction.left)));
      const rightState = safeComponents(backend.primesToState(backend.encode(disjunctive.disjunction.right)));
      const negationState = safeComponents(backend.primesToState(backend.encode(disjunctive.negation)));
      const conclusionState = safeComponents(backend.primesToState(backend.encode(disjunctive.conclusion)));

      // Check negation matches one disjunct
      const negatesLeft = computeCoherence(negationState, leftState);
      const negatesRight = computeCoherence(negationState, rightState);
      reasoning.push(`Negation ↔ Left: ${(negatesLeft * 100).toFixed(0)}% | Negation ↔ Right: ${(negatesRight * 100).toFixed(0)}%`);

      // Determine which is negated
      const negatesLeftDisjunct = negatesLeft > negatesRight;
      const targetDisjunct = negatesLeftDisjunct ? rightState : leftState;
      const targetName = negatesLeftDisjunct ? disjunctive.disjunction.right : disjunctive.disjunction.left;

      // Check conclusion matches the remaining disjunct
      const conclusionMatch = computeCoherence(conclusionState, targetDisjunct);
      reasoning.push(`Conclusion ↔ Remaining ("${targetName}"): ${(conclusionMatch * 100).toFixed(0)}%`);

      // Check disjuncts are distinct (low coherence between them)
      const disjunctDistinction = 1 - computeCoherence(leftState, rightState);
      reasoning.push(`Disjunct distinctness: ${(disjunctDistinction * 100).toFixed(0)}%`);

      keyStrength = Math.max(negatesLeft, negatesRight);
      confidence = (keyStrength * 0.4 + conclusionMatch * 0.4 + disjunctDistinction * 0.2);
      valid = keyStrength > 0.4 && conclusionMatch > 0.4 && disjunctDistinction > 0.3;
    }

    if (valid) {
      reasoning.push(`✓ Valid ${formName}`);
    } else {
      reasoning.push(`✗ Invalid: semantic connections too weak`);
    }

    setResult({ valid, confidence, reasoning, keyStrength, formName });
  }, [logicForm, syllogism, modusPonens, modusTollens, hypothetical, disjunctive, backend]);

  const presets: Record<LogicForm, { name: string; data: any }[]> = {
    syllogism: [
      { name: 'Mortality', data: { majorPremise: { quantifier: 'All', subject: 'humans', predicate: 'mortal' }, minorPremise: { quantifier: '', subject: 'Socrates', predicate: 'human' }, conclusion: { quantifier: '', subject: 'Socrates', predicate: 'mortal' } } },
      { name: 'Knowledge', data: { majorPremise: { quantifier: 'All', subject: 'wisdom', predicate: 'knowledge' }, minorPremise: { quantifier: '', subject: 'philosophy', predicate: 'wisdom' }, conclusion: { quantifier: '', subject: 'philosophy', predicate: 'knowledge' } } },
    ],
    modus_ponens: [
      { name: 'Rain→Wet', data: { conditional: { antecedent: 'rain', consequent: 'wet' }, assertion: 'rain', conclusion: 'wet' } },
      { name: 'Fire→Heat', data: { conditional: { antecedent: 'fire', consequent: 'heat' }, assertion: 'fire', conclusion: 'heat' } },
    ],
    modus_tollens: [
      { name: '¬Smoke→¬Fire', data: { conditional: { antecedent: 'fire', consequent: 'smoke' }, negation: 'smoke', conclusion: 'fire' } },
      { name: '¬Wet→¬Rain', data: { conditional: { antecedent: 'rain', consequent: 'wet' }, negation: 'wet', conclusion: 'rain' } },
    ],
    hypothetical: [
      { name: 'Study→Wisdom', data: { first: { antecedent: 'study', consequent: 'knowledge' }, second: { antecedent: 'knowledge', consequent: 'wisdom' }, conclusion: { antecedent: 'study', consequent: 'wisdom' } } },
      { name: 'Cause→Effect', data: { first: { antecedent: 'fire', consequent: 'heat' }, second: { antecedent: 'heat', consequent: 'expansion' }, conclusion: { antecedent: 'fire', consequent: 'expansion' } } },
      { name: 'Invalid Chain', data: { first: { antecedent: 'rain', consequent: 'wet' }, second: { antecedent: 'fire', consequent: 'smoke' }, conclusion: { antecedent: 'rain', consequent: 'smoke' } } },
    ],
    disjunctive: [
      { name: 'Rain∨Sun, ¬Rain', data: { disjunction: { left: 'rain', right: 'sun' }, negation: 'rain', conclusion: 'sun' } },
      { name: 'Truth∨Lie, ¬Lie', data: { disjunction: { left: 'truth', right: 'lie' }, negation: 'lie', conclusion: 'truth' } },
      { name: 'Hot∨Cold, ¬Hot', data: { disjunction: { left: 'hot', right: 'cold' }, negation: 'hot', conclusion: 'cold' } },
    ]
  };

  const logicForms = [
    { id: 'syllogism', label: 'Syllogism', desc: 'All A→B, C∈A ⊢ C∈B' },
    { id: 'modus_ponens', label: 'Modus Ponens', desc: 'P→Q, P ⊢ Q' },
    { id: 'modus_tollens', label: 'Modus Tollens', desc: 'P→Q, ¬Q ⊢ ¬P' },
    { id: 'hypothetical', label: 'Hypothetical', desc: 'P→Q, Q→R ⊢ P→R' },
    { id: 'disjunctive', label: 'Disjunctive', desc: 'P∨Q, ¬P ⊢ Q' },
  ];

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Formal Logic Validation</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Validate syllogisms, modus ponens/tollens, hypothetical and disjunctive syllogisms.
      </p>

      {/* Logic Form Selector */}
      <div className="grid grid-cols-5 gap-1 mb-4">
        {logicForms.map(form => (
          <button
            key={form.id}
            onClick={() => { setLogicForm(form.id as LogicForm); setResult(null); }}
            className={`p-2 rounded-lg border text-center transition-colors ${
              logicForm === form.id 
                ? 'bg-primary/10 border-primary text-primary' 
                : 'bg-muted/50 border-border hover:bg-muted'
            }`}
          >
            <p className="font-medium text-xs">{form.label}</p>
            <p className="text-[10px] text-muted-foreground font-mono">{form.desc}</p>
          </button>
        ))}
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2 mb-4">
        {presets[logicForm].map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              if (logicForm === 'syllogism') setSyllogism(preset.data);
              else if (logicForm === 'modus_ponens') setModusPonens(preset.data);
              else if (logicForm === 'modus_tollens') setModusTollens(preset.data);
              else if (logicForm === 'hypothetical') setHypothetical(preset.data);
              else setDisjunctive(preset.data);
            }}
            className="px-3 py-1 rounded-full text-xs bg-muted hover:bg-primary/20 transition-colors"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Syllogism Form */}
      {logicForm === 'syllogism' && (
        <div className="space-y-3 mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Major Premise</p>
            <div className="flex items-center gap-2 flex-wrap">
              <select value={syllogism.majorPremise.quantifier} onChange={(e) => setSyllogism({ ...syllogism, majorPremise: { ...syllogism.majorPremise, quantifier: e.target.value } })} className="px-2 py-1 rounded bg-secondary border border-border text-sm">
                <option value="All">All</option>
                <option value="Some">Some</option>
                <option value="No">No</option>
              </select>
              <input value={syllogism.majorPremise.subject} onChange={(e) => setSyllogism({ ...syllogism, majorPremise: { ...syllogism.majorPremise, subject: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
              <span className="text-muted-foreground">are</span>
              <input value={syllogism.majorPremise.predicate} onChange={(e) => setSyllogism({ ...syllogism, majorPremise: { ...syllogism.majorPremise, predicate: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Minor Premise</p>
            <div className="flex items-center gap-2 flex-wrap">
              <input value={syllogism.minorPremise.subject} onChange={(e) => setSyllogism({ ...syllogism, minorPremise: { ...syllogism.minorPremise, subject: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
              <span className="text-muted-foreground">is a</span>
              <input value={syllogism.minorPremise.predicate} onChange={(e) => setSyllogism({ ...syllogism, minorPremise: { ...syllogism.minorPremise, predicate: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-primary mb-2">∴ Conclusion</p>
            <div className="flex items-center gap-2 flex-wrap">
              <input value={syllogism.conclusion.subject} onChange={(e) => setSyllogism({ ...syllogism, conclusion: { ...syllogism.conclusion, subject: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
              <span className="text-muted-foreground">is</span>
              <input value={syllogism.conclusion.predicate} onChange={(e) => setSyllogism({ ...syllogism, conclusion: { ...syllogism.conclusion, predicate: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Modus Ponens Form */}
      {logicForm === 'modus_ponens' && (
        <div className="space-y-3 mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Conditional (P → Q)</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">If</span>
              <input value={modusPonens.conditional.antecedent} onChange={(e) => setModusPonens({ ...modusPonens, conditional: { ...modusPonens.conditional, antecedent: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
              <span className="text-muted-foreground">then</span>
              <input value={modusPonens.conditional.consequent} onChange={(e) => setModusPonens({ ...modusPonens, conditional: { ...modusPonens.conditional, consequent: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Assertion (P)</p>
            <input value={modusPonens.assertion} onChange={(e) => setModusPonens({ ...modusPonens, assertion: e.target.value })} className="w-32 px-2 py-1 rounded bg-secondary border border-border text-sm" />
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-primary mb-2">∴ Conclusion (Q)</p>
            <input value={modusPonens.conclusion} onChange={(e) => setModusPonens({ ...modusPonens, conclusion: e.target.value })} className="w-32 px-2 py-1 rounded bg-secondary border border-border text-sm" />
          </div>
        </div>
      )}

      {/* Modus Tollens Form */}
      {logicForm === 'modus_tollens' && (
        <div className="space-y-3 mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Conditional (P → Q)</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">If</span>
              <input value={modusTollens.conditional.antecedent} onChange={(e) => setModusTollens({ ...modusTollens, conditional: { ...modusTollens.conditional, antecedent: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
              <span className="text-muted-foreground">then</span>
              <input value={modusTollens.conditional.consequent} onChange={(e) => setModusTollens({ ...modusTollens, conditional: { ...modusTollens.conditional, consequent: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-600 mb-2">Negation (¬Q)</p>
            <div className="flex items-center gap-2">
              <span className="text-amber-600">Not</span>
              <input value={modusTollens.negation} onChange={(e) => setModusTollens({ ...modusTollens, negation: e.target.value })} className="w-32 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-primary mb-2">∴ Conclusion (¬P)</p>
            <div className="flex items-center gap-2">
              <span className="text-primary">Not</span>
              <input value={modusTollens.conclusion} onChange={(e) => setModusTollens({ ...modusTollens, conclusion: e.target.value })} className="w-32 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Hypothetical Syllogism Form */}
      {logicForm === 'hypothetical' && (
        <div className="space-y-3 mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">First Conditional (P → Q)</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">If</span>
              <input value={hypothetical.first.antecedent} onChange={(e) => setHypothetical({ ...hypothetical, first: { ...hypothetical.first, antecedent: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
              <span className="text-muted-foreground">then</span>
              <input value={hypothetical.first.consequent} onChange={(e) => setHypothetical({ ...hypothetical, first: { ...hypothetical.first, consequent: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Second Conditional (Q → R)</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-muted-foreground">If</span>
              <input value={hypothetical.second.antecedent} onChange={(e) => setHypothetical({ ...hypothetical, second: { ...hypothetical.second, antecedent: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
              <span className="text-muted-foreground">then</span>
              <input value={hypothetical.second.consequent} onChange={(e) => setHypothetical({ ...hypothetical, second: { ...hypothetical.second, consequent: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-primary mb-2">∴ Conclusion (P → R)</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-primary">If</span>
              <input value={hypothetical.conclusion.antecedent} onChange={(e) => setHypothetical({ ...hypothetical, conclusion: { ...hypothetical.conclusion, antecedent: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
              <span className="text-primary">then</span>
              <input value={hypothetical.conclusion.consequent} onChange={(e) => setHypothetical({ ...hypothetical, conclusion: { ...hypothetical.conclusion, consequent: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
        </div>
      )}

      {/* Disjunctive Syllogism Form */}
      {logicForm === 'disjunctive' && (
        <div className="space-y-3 mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Disjunction (P ∨ Q)</p>
            <div className="flex items-center gap-2 flex-wrap">
              <input value={disjunctive.disjunction.left} onChange={(e) => setDisjunctive({ ...disjunctive, disjunction: { ...disjunctive.disjunction, left: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
              <span className="text-muted-foreground font-bold">OR</span>
              <input value={disjunctive.disjunction.right} onChange={(e) => setDisjunctive({ ...disjunctive, disjunction: { ...disjunctive.disjunction, right: e.target.value } })} className="w-24 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <p className="text-xs text-amber-600 mb-2">Negation (¬P or ¬Q)</p>
            <div className="flex items-center gap-2">
              <span className="text-amber-600">Not</span>
              <input value={disjunctive.negation} onChange={(e) => setDisjunctive({ ...disjunctive, negation: e.target.value })} className="w-32 px-2 py-1 rounded bg-secondary border border-border text-sm" />
            </div>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-primary mb-2">∴ Conclusion (remaining disjunct)</p>
            <input value={disjunctive.conclusion} onChange={(e) => setDisjunctive({ ...disjunctive, conclusion: e.target.value })} className="w-32 px-2 py-1 rounded bg-secondary border border-border text-sm" />
          </div>
        </div>
      )}

      <button onClick={validateLogic} className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mb-4">
        Validate Logic
      </button>

      {result && (
        <div className={`p-4 rounded-lg ${result.valid ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-lg font-semibold ${result.valid ? 'text-green-500' : 'text-red-500'}`}>
              {result.valid ? '✓ Valid' : '✗ Invalid'} {result.formName}
            </span>
            <span className="text-sm text-muted-foreground">({(result.confidence * 100).toFixed(0)}%)</span>
          </div>
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Key Connection Strength</p>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${result.keyStrength * 100}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            {result.reasoning.map((r, i) => (
              <p key={i} className="text-sm text-muted-foreground">{r}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Interactive Concept Graph Visualization
const ConceptGraphDemo = () => {
  const [startConcept, setStartConcept] = useState('knowledge');
  const [targetConcept, setTargetConcept] = useState('wisdom');
  const [graph, setGraph] = useState<{
    nodes: { id: string; x: number; y: number; state: number[]; visited: boolean }[];
    edges: { from: string; to: string; weight: number }[];
    path: string[];
  } | null>(null);
  const [animating, setAnimating] = useState(false);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [selectedEdge, setSelectedEdge] = useState<{ from: string; to: string; weight: number; fromState: number[]; toState: number[] } | null>(null);
  const [selectedNode, setSelectedNode] = useState<{ id: string; state: number[] } | null>(null);
  const svgRef = useState<SVGSVGElement | null>(null);

  const backend = useMemo(() => new SemanticBackend(minimalConfig), []);

  const buildGraph = useCallback(async () => {
    setAnimating(true);
    setSelectedEdge(null);
    setSelectedNode(null);
    
    const concepts = [
      startConcept, targetConcept,
      'truth', 'understanding', 'learning', 'experience', 
      'insight', 'reason', 'intuition', 'awareness'
    ].filter((v, i, a) => a.indexOf(v) === i);

    const nodes = concepts.map((concept, i) => {
      const angle = (i / concepts.length) * Math.PI * 2 - Math.PI / 2;
      const radius = 130;
      const primes = backend.encode(concept);
      const state = safeComponents(backend.primesToState(primes));
      return {
        id: concept,
        x: 175 + Math.cos(angle) * radius,
        y: 175 + Math.sin(angle) * radius,
        state,
        visited: false
      };
    });

    const edges: { from: string; to: string; weight: number }[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const weight = computeCoherence(nodes[i].state, nodes[j].state);
        if (weight > 0.2) {
          edges.push({ from: nodes[i].id, to: nodes[j].id, weight });
        }
      }
    }

    setGraph({ nodes, edges, path: [] });
    await new Promise(r => setTimeout(r, 500));

    const path: string[] = [startConcept];
    const visited = new Set([startConcept]);
    let current = startConcept;

    while (current !== targetConcept && path.length < 6) {
      const currentNode = nodes.find(n => n.id === current);
      const targetNode = nodes.find(n => n.id === targetConcept);
      if (!currentNode || !targetNode) break;

      const candidates = edges
        .filter(e => (e.from === current || e.to === current) && !visited.has(e.from === current ? e.to : e.from))
        .map(e => {
          const nextId = e.from === current ? e.to : e.from;
          const nextNode = nodes.find(n => n.id === nextId);
          const targetProximity = nextNode ? computeCoherence(nextNode.state, targetNode.state) : 0;
          return { id: nextId, score: e.weight * 0.5 + targetProximity * 0.5 };
        })
        .sort((a, b) => b.score - a.score);

      if (candidates.length === 0) break;

      const next = candidates[0].id;
      path.push(next);
      visited.add(next);
      current = next;

      setGraph(g => g ? {
        ...g,
        path: [...path],
        nodes: g.nodes.map(n => ({ ...n, visited: visited.has(n.id) }))
      } : null);

      await new Promise(r => setTimeout(r, 600));
    }

    setAnimating(false);
  }, [startConcept, targetConcept, backend]);

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (animating) return;
    const node = graph?.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const svg = (e.target as SVGElement).closest('svg');
    if (!svg) return;
    
    const rect = svg.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    });
    setDragging(nodeId);
    setSelectedNode({ id: nodeId, state: node.state });
    setSelectedEdge(null);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging || !graph) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(20, Math.min(330, e.clientX - rect.left - dragOffset.x));
    const y = Math.max(20, Math.min(330, e.clientY - rect.top - dragOffset.y));
    
    setGraph({
      ...graph,
      nodes: graph.nodes.map(n => n.id === dragging ? { ...n, x, y } : n)
    });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const handleEdgeClick = (edge: { from: string; to: string; weight: number }) => {
    if (animating) return;
    const fromNode = graph?.nodes.find(n => n.id === edge.from);
    const toNode = graph?.nodes.find(n => n.id === edge.to);
    if (fromNode && toNode) {
      setSelectedEdge({ ...edge, fromState: fromNode.state, toState: toNode.state });
      setSelectedNode(null);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (animating || dragging) return;
    const node = graph?.nodes.find(n => n.id === nodeId);
    if (node) {
      setSelectedNode({ id: nodeId, state: node.state });
      setSelectedEdge(null);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Interactive Concept Graph</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Drag nodes to rearrange. Click edges to see coherence details. Click nodes to inspect state.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <input
          value={startConcept}
          onChange={(e) => setStartConcept(e.target.value)}
          className="w-28 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
          placeholder="Start"
        />
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <input
          value={targetConcept}
          onChange={(e) => setTargetConcept(e.target.value)}
          className="w-28 px-3 py-2 rounded-lg bg-secondary border border-border text-sm"
          placeholder="Target"
        />
        <button
          onClick={buildGraph}
          disabled={animating}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {animating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Find Path'}
        </button>
      </div>

      {graph && (
        <div className="grid md:grid-cols-[350px_1fr] gap-4">
          <svg 
            width="350" 
            height="350" 
            className="bg-muted/30 rounded-lg cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Edges */}
            {graph.edges.map((edge, i) => {
              const fromNode = graph.nodes.find(n => n.id === edge.from);
              const toNode = graph.nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              
              const isOnPath = graph.path.includes(edge.from) && graph.path.includes(edge.to) &&
                Math.abs(graph.path.indexOf(edge.from) - graph.path.indexOf(edge.to)) === 1;
              const isSelected = selectedEdge?.from === edge.from && selectedEdge?.to === edge.to;
              
              return (
                <g key={i}>
                  {/* Wider invisible hitbox for clicking */}
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke="transparent"
                    strokeWidth={12}
                    className="cursor-pointer"
                    onClick={() => handleEdgeClick(edge)}
                  />
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isSelected ? 'hsl(var(--primary))' : isOnPath ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                    strokeWidth={isSelected ? 4 : isOnPath ? 3 : Math.max(1, edge.weight * 3)}
                    strokeOpacity={isSelected ? 1 : isOnPath ? 1 : edge.weight * 0.6}
                    strokeDasharray={isSelected ? '5,3' : 'none'}
                    className="transition-all duration-300 pointer-events-none"
                  />
                  {/* Edge weight label */}
                  {(isSelected || edge.weight > 0.4) && (
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 - 5}
                      textAnchor="middle"
                      fontSize="8"
                      fill="hsl(var(--muted-foreground))"
                      className="pointer-events-none"
                    >
                      {(edge.weight * 100).toFixed(0)}%
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Nodes */}
            {graph.nodes.map((node) => {
              const isStart = node.id === startConcept;
              const isTarget = node.id === targetConcept;
              const isOnPath = graph.path.includes(node.id);
              const pathIndex = graph.path.indexOf(node.id);
              const isSelected = selectedNode?.id === node.id;
              const isDragging = dragging === node.id;
              
              return (
                <g 
                  key={node.id}
                  onMouseDown={(e) => handleMouseDown(node.id, e)}
                  onClick={() => handleNodeClick(node.id)}
                  className={`cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isStart || isTarget ? 20 : isSelected ? 18 : 16}
                    fill={isStart ? 'hsl(var(--primary))' : isTarget ? 'hsl(142, 76%, 36%)' : isOnPath ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--muted))'}
                    stroke={isSelected ? 'hsl(var(--primary))' : isOnPath ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                    strokeWidth={isSelected ? 3 : isOnPath ? 2 : 1}
                    className="transition-all duration-200"
                  />
                  {isOnPath && pathIndex >= 0 && (
                    <text x={node.x} y={node.y + 4} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold" className="pointer-events-none">
                      {pathIndex + 1}
                    </text>
                  )}
                  <text x={node.x} y={node.y + 32} textAnchor="middle" fontSize="10" fill="hsl(var(--foreground))" className="font-medium pointer-events-none">
                    {node.id}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Details Panel */}
          <div className="space-y-4">
            {selectedEdge && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <h4 className="font-semibold text-sm mb-2">Edge: {selectedEdge.from} ↔ {selectedEdge.to}</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Coherence: {(selectedEdge.weight * 100).toFixed(1)}%</p>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${selectedEdge.weight * 100}%` }} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">{selectedEdge.from}</p>
                      <SedenionVisualizer components={selectedEdge.fromState.map(Math.abs)} size="sm" animated={false} />
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">{selectedEdge.to}</p>
                      <SedenionVisualizer components={selectedEdge.toState.map(Math.abs)} size="sm" animated={false} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedNode && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <h4 className="font-semibold text-sm mb-2">Node: {selectedNode.id}</h4>
                <div className="flex justify-center mb-3">
                  <SedenionVisualizer components={selectedNode.state.map(Math.abs)} size="md" animated={false} />
                </div>
                <div className="grid grid-cols-4 gap-1 text-xs font-mono">
                  {selectedNode.state.slice(0, 8).map((v, i) => (
                    <div key={i} className="text-center p-1 rounded bg-muted">
                      <span className="text-muted-foreground">e{i}:</span> {v.toFixed(2)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {graph.path.length > 0 && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-xs text-muted-foreground mb-2">Reasoning Path ({graph.path.length} steps)</p>
                <div className="flex flex-wrap items-center gap-1">
                  {graph.path.map((step, i) => (
                    <span key={i} className="flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        i === 0 ? 'bg-primary text-primary-foreground' :
                        i === graph.path.length - 1 ? 'bg-green-500 text-white' :
                        'bg-muted text-foreground'
                      }`}>
                        {step}
                      </span>
                      {i < graph.path.length - 1 && <ArrowRight className="w-3 h-3 text-primary" />}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!selectedEdge && !selectedNode && !graph.path.length && (
              <div className="p-4 rounded-lg bg-muted/30 text-center text-sm text-muted-foreground">
                Click "Find Path" to start, then click nodes or edges to inspect details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const EngineExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline text-sm">← Back to Examples</a>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Engine & Reasoning Module</h1>
          <p className="text-muted-foreground">
            Interactive examples of reasoning capabilities: analogies, entailment, inference, and contradiction detection.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
              AlephEngine Pipeline
            </h2>
            <EngineExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">2</span>
              Analogical Reasoning
            </h2>
            <AnalogicalReasoningDemo />
            <div className="mt-4">
              <CodeBlock
                code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

// Encode analogy terms: A is to B as C is to ?
const king = backend.encode('king');
const queen = backend.encode('queen');
const man = backend.encode('man');

// Compute difference vector: B - A
const diff = queen.c.map((v, i) => v - king.c[i]);

// Apply to target: C + diff = predicted
const predicted = man.c.map((v, i) => v + diff[i]);

// Find closest word in vocabulary
const result = backend.findNearest({ c: predicted });
console.log(result); // "woman"`}
                language="javascript"
                title="analogical-reasoning.js"
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">3</span>
              Semantic Entailment
            </h2>
            <EntailmentDemo />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">4</span>
              Chain of Thought
            </h2>
            <ChainOfThoughtDemo />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">5</span>
              Contradiction Detection
            </h2>
            <ContradictionDemo />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">6</span>
              Semantic Inference
            </h2>
            <InferenceDemo />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">7</span>
              Syllogistic Reasoning
            </h2>
            <SyllogismDemo />
            <div className="mt-4">
              <CodeBlock
                code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';

const backend = new SemanticBackend(config);

// Validate: All A are B, C is A, therefore C is B
function validateSyllogism(majorSubject, majorPredicate, minorSubject, minorPredicate) {
  const A = backend.primesToState(backend.encode(majorSubject));
  const B = backend.primesToState(backend.encode(majorPredicate));
  const C = backend.primesToState(backend.encode(minorSubject));
  const A2 = backend.primesToState(backend.encode(minorPredicate));
  
  // Middle term must connect: A ↔ A2
  const middleTermStrength = coherence(A.c, A2.c);
  
  // Conclusion follows if middle term is strong
  return middleTermStrength > 0.3;
}

console.log(validateSyllogism('humans', 'mortal', 'Socrates', 'human'));
// → true`}
                language="javascript"
                title="syllogism-validation.js"
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">8</span>
              Concept Graph Traversal
            </h2>
            <ConceptGraphDemo />
          </section>
        </div>
      </div>
    </div>
  );
};

export default EngineExamplesPage;
