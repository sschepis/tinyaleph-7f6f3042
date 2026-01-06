import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowLeft, Brain, Zap, GitBranch } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';

// Simple quaternion implementation for demo
class Quaternion {
  constructor(public w: number, public x: number, public y: number, public z: number) {}
}

const hamiltonCompose = (q1: Quaternion, q2: Quaternion) => new Quaternion(
  q1.w*q2.w - q1.x*q2.x - q1.y*q2.y - q1.z*q2.z,
  q1.w*q2.x + q1.x*q2.w + q1.y*q2.z - q1.z*q2.y,
  q1.w*q2.y - q1.x*q2.z + q1.y*q2.w + q1.z*q2.x,
  q1.w*q2.z + q1.x*q2.y - q1.y*q2.x + q1.z*q2.w
);

const measureNonCommutativity = (q1: Quaternion, q2: Quaternion) => {
  const ab = hamiltonCompose(q1, q2);
  const ba = hamiltonCompose(q2, q1);
  return Math.sqrt((ab.w-ba.w)**2 + (ab.x-ba.x)**2 + (ab.y-ba.y)**2 + (ab.z-ba.z)**2);
};

const computeCoherence = (weights: number[]) => {
  const sum = weights.reduce((a, b) => a + b, 0);
  const normalized = weights.map(w => w / sum);
  const entropy = -normalized.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
  return 1 - entropy / Math.log2(normalized.length);
};

// Quaternion Operations
const QuaternionExample = () => {
  const [q1, setQ1] = useState({ w: 1, x: 0, y: 0, z: 0 });
  const [q2, setQ2] = useState({ w: 0, x: 1, y: 0, z: 0 });
  const [result, setResult] = useState<{
    product: { w: number; x: number; y: number; z: number };
    nonComm: number;
  } | null>(null);

  const runCompute = useCallback(() => {
    const quat1 = new Quaternion(q1.w, q1.x, q1.y, q1.z);
    const quat2 = new Quaternion(q2.w, q2.x, q2.y, q2.z);
    const composed = hamiltonCompose(quat1, quat2);
    const nonComm = measureNonCommutativity(quat1, quat2);
    
    setResult({
      product: { w: composed.w, x: composed.x, y: composed.y, z: composed.z },
      nonComm
    });
  }, [q1, q2]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          Quaternion Composition (Hamilton Product)
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <label className="text-sm font-medium mb-2 block">Quaternion Q₁ (w + xi + yj + zk)</label>
              <div className="grid grid-cols-4 gap-2">
                {(['w', 'x', 'y', 'z'] as const).map(key => (
                  <div key={key}>
                    <span className="text-xs text-muted-foreground">{key}</span>
                    <input
                      type="number"
                      step={0.1}
                      value={q1[key]}
                      onChange={(e) => setQ1({ ...q1, [key]: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded bg-secondary border border-border text-foreground font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <label className="text-sm font-medium mb-2 block">Quaternion Q₂</label>
              <div className="grid grid-cols-4 gap-2">
                {(['w', 'x', 'y', 'z'] as const).map(key => (
                  <div key={key}>
                    <span className="text-xs text-muted-foreground">{key}</span>
                    <input
                      type="number"
                      step={0.1}
                      value={q2[key]}
                      onChange={(e) => setQ2({ ...q2, [key]: Number(e.target.value) })}
                      className="w-full px-2 py-1 rounded bg-secondary border border-border text-foreground font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={runCompute}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Compose
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="font-semibold mb-2">Q₁ × Q₂ (Hamilton Product)</p>
                <p className="font-mono text-sm">
                  {result.product.w.toFixed(3)} + {result.product.x.toFixed(3)}i + {result.product.y.toFixed(3)}j + {result.product.z.toFixed(3)}k
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm text-muted-foreground">Non-Commutativity Measure</p>
                <p className="font-mono text-2xl text-primary">{result.nonComm.toFixed(6)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {result.nonComm > 0.01 ? '⚠️ Significant non-commutativity' : '✓ Nearly commutative'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { Quaternion, hamiltonCompose, measureNonCommutativity } from '@aleph-ai/tinyaleph';

// Create quaternions
const q1 = new Quaternion(1, 0, 0, 0); // Real unit
const q2 = new Quaternion(0, 1, 0, 0); // i

// Hamilton product: q1 * q2
const product = hamiltonCompose(q1, q2);
console.log(product); // { w: 0, x: 1, y: 0, z: 0 }

// Measure non-commutativity: ||q1*q2 - q2*q1||
const nonComm = measureNonCommutativity(q1, q2);
console.log(nonComm); // 0 for commutative, >0 for non-commutative`}
        language="javascript"
        title="quaternion-ops.js"
      />
    </div>
  );
};

// Sparse Prime State
const SparsePrimeStateExample = () => {
  const [primes, setPrimes] = useState('2,3,5,7');
  const [weights, setWeights] = useState('0.5,0.3,0.15,0.05');
  const [result, setResult] = useState<{
    coherence: number;
    resonance: number;
    shouldHalt: boolean;
  } | null>(null);

  const runCompute = useCallback(() => {
    const primeList = primes.split(',').map(p => parseInt(p.trim())).filter(p => !isNaN(p));
    const weightList = weights.split(',').map(w => parseFloat(w.trim())).filter(w => !isNaN(w));
    
    if (primeList.length === 0 || weightList.length === 0) return;

    const state = new SparsePrimeState(primeList, weightList);
    const coh = computeCoherence(state);
    const res = resonanceScore(state, state);
    const halt = haltingDecision(coh, 0.8);

    setResult({
      coherence: coh,
      resonance: res,
      shouldHalt: halt
    });
  }, [primes, weights]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Sparse Prime State & Resonance
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Prime Bases (comma-separated)</label>
              <input
                type="text"
                value={primes}
                onChange={(e) => setPrimes(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono"
                placeholder="2,3,5,7"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Weights (comma-separated)</label>
              <input
                type="text"
                value={weights}
                onChange={(e) => setWeights(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono"
                placeholder="0.5,0.3,0.15,0.05"
              />
            </div>

            <button
              onClick={runCompute}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Compute State
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Coherence</p>
                  <p className="font-mono text-2xl text-primary">{result.coherence.toFixed(4)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">Self-Resonance</p>
                  <p className="font-mono text-2xl text-primary">{result.resonance.toFixed(4)}</p>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${result.shouldHalt ? 'bg-green-500/20 border border-green-500/50' : 'bg-yellow-500/20 border border-yellow-500/50'}`}>
                <p className="font-semibold">
                  {result.shouldHalt ? '✓ Halting Condition Met' : '⟳ Continue Computation'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Coherence {result.shouldHalt ? '≥' : '<'} threshold (0.8)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { 
  SparsePrimeState, 
  resonanceScore, 
  computeCoherence, 
  haltingDecision 
} from '@aleph-ai/tinyaleph';

// Create sparse state with prime bases and weights
const state = new SparsePrimeState(
  [2, 3, 5, 7],      // Prime bases
  [0.5, 0.3, 0.15, 0.05] // Weights (should sum to 1)
);

// Compute coherence (measure of state "sharpness")
const coherence = computeCoherence(state);
console.log('Coherence:', coherence);

// Resonance score between two states
const score = resonanceScore(state, state); // Self-resonance = 1
console.log('Resonance:', score);

// Coherence-gated halting decision
const shouldHalt = haltingDecision(coherence, 0.8);
console.log('Halt?', shouldHalt);`}
        language="javascript"
        title="sparse-prime-state.js"
      />
    </div>
  );
};

// Resonant Attention
const ResonantAttentionExample = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          ResoFormer Architecture
        </h3>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            ResoFormer replaces standard attention with prime resonance-based computation:
          </p>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2 text-primary">Resonant Attention</h4>
              <p className="text-sm text-muted-foreground">
                Attention weights based on prime resonance scores instead of dot-product similarity.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2 text-primary">Entropy Collapse Head</h4>
              <p className="text-sm text-muted-foreground">
                Output layer that collapses high-entropy states to low-entropy predictions.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2 text-primary">Coherence Gating</h4>
              <p className="text-sm text-muted-foreground">
                Dynamic computation that halts when coherence exceeds threshold.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 font-mono text-sm">
            <pre className="overflow-x-auto">{`┌──────────────────────────────────────────────────────┐
│              ResoFormer Layer                        │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐ │
│  │ Prime      │ → │ Resonant   │ → │ Hamilton   │ │
│  │ Encoding   │    │ Attention  │    │ Compose    │ │
│  └────────────┘    └────────────┘    └────────────┘ │
│         ↓                ↓                ↓         │
│  ┌────────────────────────────────────────────────┐ │
│  │         Coherence-Gated Output                 │ │
│  │    if coherence > θ: halt else: continue      │ │
│  └────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘`}</pre>
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { 
  resonantAttention,
  EntropyCollapseHead,
  coherenceGatedCompute,
  generateAttractorCodebook
} from '@aleph-ai/tinyaleph';

// Generate attractor codebook from vocabulary
const codebook = generateAttractorCodebook(vocabulary, 256);

// Resonant attention replaces softmax(QK^T)V
const attended = resonantAttention(query, keys, values);

// Entropy collapse for output projection
const head = new EntropyCollapseHead(hiddenDim, vocabSize);
const logits = head.forward(hiddenState);

// Coherence-gated compute (adaptive depth)
const output = coherenceGatedCompute(
  input,
  layers,
  coherenceThreshold: 0.9
);`}
        language="javascript"
        title="resoformer.js"
      />
    </div>
  );
};

const MLExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Examples
          </Link>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">AI / Machine Learning</h1>
          <p className="text-muted-foreground">
            ResoFormer primitives: quaternions, sparse prime states, and resonance-based attention.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
              Quaternion Composition
            </h2>
            <QuaternionExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">2</span>
              Sparse Prime States
            </h2>
            <SparsePrimeStateExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">3</span>
              ResoFormer Architecture
            </h2>
            <ResonantAttentionExample />
          </section>
        </div>
      </div>
    </div>
  );
};

export default MLExamplesPage;
