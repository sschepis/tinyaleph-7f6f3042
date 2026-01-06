import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowLeft, Brain, Zap, GitBranch, Grid3X3, TrendingDown, Layers } from 'lucide-react';
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
  if (sum === 0) return 0;
  const normalized = weights.map(w => w / sum);
  const entropy = -normalized.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
  return 1 - entropy / Math.log2(normalized.length);
};

// Simple SparsePrimeState class for demo
class SparsePrimeState {
  constructor(public primes: number[], public weights: number[]) {}
}

// Resonance score between two states
const resonanceScore = (s1: SparsePrimeState, s2: SparsePrimeState) => {
  const overlap = s1.primes.filter(p => s2.primes.includes(p));
  if (overlap.length === 0) return 0;
  let score = 0;
  for (const p of overlap) {
    const i1 = s1.primes.indexOf(p);
    const i2 = s2.primes.indexOf(p);
    score += s1.weights[i1] * s2.weights[i2];
  }
  return score;
};

// Halting decision based on coherence threshold
const haltingDecision = (coherence: number, threshold: number) => coherence >= threshold;

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
    const coh = computeCoherence(weightList);
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

// Embeddings Visualization
const EmbeddingsExample = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [words, setWords] = useState('king,queen,man,woman,prince,princess');
  const [embeddings, setEmbeddings] = useState<{ word: string; x: number; y: number }[]>([]);

  const generateEmbeddings = useCallback(() => {
    const wordList = words.split(',').map(w => w.trim()).filter(Boolean);
    
    // Simple hash-based pseudo-embeddings for demo
    const hashToVec = (s: string) => {
      let h1 = 0, h2 = 0;
      for (let i = 0; i < s.length; i++) {
        h1 = (h1 * 31 + s.charCodeAt(i)) % 1000;
        h2 = (h2 * 37 + s.charCodeAt(i)) % 1000;
      }
      return { x: (h1 / 1000) * 0.8 + 0.1, y: (h2 / 1000) * 0.8 + 0.1 };
    };

    // Add semantic clustering simulation
    const baseVecs = wordList.map(w => ({ word: w, ...hashToVec(w) }));
    
    // Apply simple semantic adjustment (words ending similarly cluster)
    const adjusted = baseVecs.map((v, i) => {
      const suffix = v.word.slice(-3);
      const similar = baseVecs.filter(b => b.word.slice(-3) === suffix);
      if (similar.length > 1) {
        const avgX = similar.reduce((s, b) => s + b.x, 0) / similar.length;
        const avgY = similar.reduce((s, b) => s + b.y, 0) / similar.length;
        return { ...v, x: v.x * 0.5 + avgX * 0.5, y: v.y * 0.5 + avgY * 0.5 };
      }
      return v;
    });
    
    setEmbeddings(adjusted);
  }, [words]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || embeddings.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.fillStyle = 'hsl(var(--muted))';
    ctx.fillRect(0, 0, w, h);
    
    // Draw grid
    ctx.strokeStyle = 'hsl(var(--border))';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(i * w / 10, 0);
      ctx.lineTo(i * w / 10, h);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * h / 10);
      ctx.lineTo(w, i * h / 10);
      ctx.stroke();
    }
    
    // Draw embeddings
    embeddings.forEach((e, i) => {
      const px = e.x * w;
      const py = e.y * h;
      
      // Point
      ctx.beginPath();
      ctx.arc(px, py, 8, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${(i * 60) % 360}, 70%, 50%)`;
      ctx.fill();
      ctx.strokeStyle = 'hsl(var(--foreground))';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Label
      ctx.fillStyle = 'hsl(var(--foreground))';
      ctx.font = '12px monospace';
      ctx.fillText(e.word, px + 12, py + 4);
    });
    
    // Draw similarity lines between close embeddings
    ctx.strokeStyle = 'hsl(var(--primary) / 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < embeddings.length; i++) {
      for (let j = i + 1; j < embeddings.length; j++) {
        const dist = Math.sqrt(
          Math.pow(embeddings[i].x - embeddings[j].x, 2) +
          Math.pow(embeddings[i].y - embeddings[j].y, 2)
        );
        if (dist < 0.2) {
          ctx.beginPath();
          ctx.moveTo(embeddings[i].x * w, embeddings[i].y * h);
          ctx.lineTo(embeddings[j].x * w, embeddings[j].y * h);
          ctx.stroke();
        }
      }
    }
  }, [embeddings]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Word Embeddings Visualization
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Words (comma-separated)</label>
              <input
                type="text"
                value={words}
                onChange={(e) => setWords(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm"
                placeholder="king,queen,man,woman"
              />
            </div>

            <button
              onClick={generateEmbeddings}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Generate Embeddings
            </button>

            {embeddings.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2">Embedding Coordinates</p>
                <div className="space-y-1 font-mono text-xs">
                  {embeddings.map((e, i) => (
                    <div key={i} className="flex justify-between">
                      <span>{e.word}</span>
                      <span className="text-muted-foreground">({e.x.toFixed(3)}, {e.y.toFixed(3)})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full aspect-square rounded-lg border border-border"
            />
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { encodeWord, cosineSimilarity } from '@aleph-ai/tinyaleph';

// Encode words to prime-based vectors
const kingVec = encodeWord('king', vocabulary);
const queenVec = encodeWord('queen', vocabulary);
const manVec = encodeWord('man', vocabulary);
const womanVec = encodeWord('woman', vocabulary);

// Measure semantic similarity
const sim = cosineSimilarity(kingVec, queenVec);
console.log('Similarity:', sim);

// Vector arithmetic: king - man + woman ≈ queen
const result = kingVec.subtract(manVec).add(womanVec);
const nearest = findNearest(result, vocabulary);
console.log('Nearest:', nearest); // "queen"`}
        language="javascript"
        title="embeddings.js"
      />
    </div>
  );
};

// Attention Matrix Visualization
const AttentionMatrixExample = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tokens, setTokens] = useState('The,cat,sat,on,the,mat');
  const [attentionWeights, setAttentionWeights] = useState<number[][]>([]);

  const computeAttention = useCallback(() => {
    const tokenList = tokens.split(',').map(t => t.trim()).filter(Boolean);
    const n = tokenList.length;
    
    // Simulate attention weights (scaled dot-product attention)
    const weights: number[][] = [];
    for (let i = 0; i < n; i++) {
      weights[i] = [];
      let sum = 0;
      for (let j = 0; j < n; j++) {
        // Simple similarity based on character overlap + position bias
        let sim = 0;
        for (const c of tokenList[i].toLowerCase()) {
          if (tokenList[j].toLowerCase().includes(c)) sim += 0.1;
        }
        // Causal mask (can only attend to previous tokens)
        if (j > i) {
          weights[i][j] = 0;
        } else {
          // Position bias (attend more to nearby tokens)
          const posBias = Math.exp(-Math.abs(i - j) * 0.3);
          weights[i][j] = (sim + posBias) * (1 + Math.random() * 0.2);
        }
        sum += weights[i][j];
      }
      // Softmax normalization
      for (let j = 0; j < n; j++) {
        weights[i][j] = sum > 0 ? weights[i][j] / sum : 0;
      }
    }
    
    setAttentionWeights(weights);
  }, [tokens]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || attentionWeights.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const tokenList = tokens.split(',').map(t => t.trim()).filter(Boolean);
    const n = tokenList.length;
    const cellSize = Math.min(50, (canvas.width - 80) / n);
    const offset = 60;
    
    ctx.fillStyle = 'hsl(var(--background))';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw attention matrix
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const weight = attentionWeights[i][j];
        const intensity = Math.floor(weight * 255);
        
        ctx.fillStyle = `rgba(139, 92, 246, ${weight})`;
        ctx.fillRect(offset + j * cellSize, offset + i * cellSize, cellSize - 1, cellSize - 1);
        
        // Show weight value
        if (weight > 0.01) {
          ctx.fillStyle = weight > 0.5 ? 'white' : 'hsl(var(--foreground))';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(
            weight.toFixed(2),
            offset + j * cellSize + cellSize / 2,
            offset + i * cellSize + cellSize / 2 + 4
          );
        }
      }
    }
    
    // Draw labels
    ctx.fillStyle = 'hsl(var(--foreground))';
    ctx.font = '11px monospace';
    ctx.textAlign = 'right';
    for (let i = 0; i < n; i++) {
      ctx.fillText(tokenList[i], offset - 5, offset + i * cellSize + cellSize / 2 + 4);
    }
    ctx.textAlign = 'center';
    for (let j = 0; j < n; j++) {
      ctx.save();
      ctx.translate(offset + j * cellSize + cellSize / 2, offset - 5);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(tokenList[j], 0, 0);
      ctx.restore();
    }
    
    // Axis labels
    ctx.fillStyle = 'hsl(var(--muted-foreground))';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Keys', offset + (n * cellSize) / 2, 20);
    ctx.save();
    ctx.translate(15, offset + (n * cellSize) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Queries', 0, 0);
    ctx.restore();
  }, [attentionWeights, tokens]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Grid3X3 className="w-5 h-5 text-primary" />
          Self-Attention Matrix
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Tokens (comma-separated)</label>
              <input
                type="text"
                value={tokens}
                onChange={(e) => setTokens(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm"
                placeholder="The,cat,sat,on,the,mat"
              />
            </div>

            <button
              onClick={computeAttention}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Compute Attention
            </button>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                <strong>Causal Self-Attention:</strong> Each token can only attend to itself and previous tokens. 
                Brighter cells indicate stronger attention weights.
              </p>
            </div>
          </div>

          <div>
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full aspect-square rounded-lg border border-border bg-background"
            />
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { selfAttention, softmax, causalMask } from '@aleph-ai/tinyaleph';

// Token embeddings (d_model = 64)
const embeddings = tokenize(sentence).map(t => embed(t));

// Compute Q, K, V projections
const Q = matmul(embeddings, W_q);
const K = matmul(embeddings, W_k);
const V = matmul(embeddings, W_v);

// Scaled dot-product attention with causal mask
const scores = matmul(Q, transpose(K)) / Math.sqrt(d_k);
const masked = causalMask(scores);  // -inf for future positions
const weights = softmax(masked);    // Attention weights
const output = matmul(weights, V);  // Weighted sum of values

console.log('Attention weights:', weights);`}
        language="javascript"
        title="attention.js"
      />
    </div>
  );
};

// Gradient Descent Visualization
const GradientDescentExample = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [learningRate, setLearningRate] = useState(0.1);
  const [steps, setSteps] = useState(50);
  const [path, setPath] = useState<{ x: number; y: number; loss: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Rosenbrock function: f(x,y) = (a-x)² + b(y-x²)²
  const rosenbrock = (x: number, y: number) => {
    const a = 1, b = 100;
    return Math.pow(a - x, 2) + b * Math.pow(y - x * x, 2);
  };

  // Gradient of Rosenbrock
  const gradient = (x: number, y: number) => {
    const a = 1, b = 100;
    const dx = -2 * (a - x) - 4 * b * x * (y - x * x);
    const dy = 2 * b * (y - x * x);
    return { dx, dy };
  };

  const runGradientDescent = useCallback(() => {
    setIsRunning(true);
    const newPath: { x: number; y: number; loss: number }[] = [];
    
    // Start from random position
    let x = -1.5 + Math.random();
    let y = 2 + Math.random() * 0.5;
    
    for (let i = 0; i < steps; i++) {
      const loss = rosenbrock(x, y);
      newPath.push({ x, y, loss });
      
      const grad = gradient(x, y);
      // Gradient clipping for stability
      const gradNorm = Math.sqrt(grad.dx * grad.dx + grad.dy * grad.dy);
      const clipNorm = 10;
      const scale = gradNorm > clipNorm ? clipNorm / gradNorm : 1;
      
      x -= learningRate * grad.dx * scale;
      y -= learningRate * grad.dy * scale;
      
      // Clamp to visualization bounds
      x = Math.max(-2, Math.min(2, x));
      y = Math.max(-1, Math.min(3, y));
    }
    
    setPath(newPath);
    setIsRunning(false);
  }, [learningRate, steps]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const w = canvas.width;
    const h = canvas.height;
    
    // Draw loss landscape
    const imageData = ctx.createImageData(w, h);
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const x = (px / w) * 4 - 2;
        const y = (py / h) * 4 - 1;
        const loss = rosenbrock(x, y);
        const logLoss = Math.log10(loss + 1);
        const intensity = Math.min(255, Math.floor(logLoss * 40));
        
        const idx = (py * w + px) * 4;
        imageData.data[idx] = intensity;
        imageData.data[idx + 1] = Math.floor(intensity * 0.5);
        imageData.data[idx + 2] = 255 - intensity;
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
    
    // Draw contour lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    const contourLevels = [0.1, 1, 10, 100, 1000];
    
    // Draw global minimum marker
    const minPx = ((1 + 2) / 4) * w;
    const minPy = ((1 + 1) / 4) * h;
    ctx.beginPath();
    ctx.arc(minPx, minPy, 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw optimization path
    if (path.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 0, 0.9)';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < path.length; i++) {
        const px = ((path[i].x + 2) / 4) * w;
        const py = ((path[i].y + 1) / 4) * h;
        
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      
      // Draw points along path
      for (let i = 0; i < path.length; i += Math.max(1, Math.floor(path.length / 20))) {
        const px = ((path[i].x + 2) / 4) * w;
        const py = ((path[i].y + 1) / 4) * h;
        
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${60 - (i / path.length) * 60}, 100%, 50%)`;
        ctx.fill();
      }
      
      // Start point
      const startPx = ((path[0].x + 2) / 4) * w;
      const startPy = ((path[0].y + 1) / 4) * h;
      ctx.beginPath();
      ctx.arc(startPx, startPy, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.stroke();
    }
  }, [path]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-primary" />
          Gradient Descent on Rosenbrock Function
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Learning Rate: {learningRate.toFixed(3)}
              </label>
              <input
                type="range"
                min={0.001}
                max={0.5}
                step={0.001}
                value={learningRate}
                onChange={(e) => setLearningRate(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Steps: {steps}
              </label>
              <input
                type="range"
                min={10}
                max={200}
                step={10}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={runGradientDescent}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Play className="w-4 h-4" /> {isRunning ? 'Running...' : 'Run Optimization'}
            </button>

            {path.length > 0 && (
              <div className="space-y-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Initial Loss</p>
                      <p className="font-mono text-lg">{path[0].loss.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Final Loss</p>
                      <p className="font-mono text-lg text-primary">{path[path.length - 1].loss.toFixed(4)}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                  <p className="text-sm">
                    <span className="text-green-500">●</span> Global minimum at (1, 1)
                  </p>
                  <p className="text-sm">
                    <span className="text-red-500">●</span> Start → <span className="text-yellow-500">●</span> End
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full aspect-square rounded-lg border border-border"
            />
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { gradientDescent, rosenbrock, adam } from '@aleph-ai/tinyaleph';

// Define loss function and gradient
const loss = (params) => rosenbrock(params.x, params.y);
const grad = (params) => rosenbrockGradient(params.x, params.y);

// Vanilla gradient descent
const result = gradientDescent({
  initial: { x: -1.5, y: 2.0 },
  learningRate: 0.001,
  maxSteps: 10000,
  convergenceThreshold: 1e-8,
  loss,
  grad
});

// Or use Adam optimizer for faster convergence
const adamResult = adam({
  initial: { x: -1.5, y: 2.0 },
  learningRate: 0.1,
  beta1: 0.9,
  beta2: 0.999,
  loss,
  grad
});

console.log('Optimized:', adamResult.params);
console.log('Final loss:', adamResult.loss);`}
        language="javascript"
        title="gradient-descent.js"
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
            ResoFormer primitives: quaternions, sparse prime states, embeddings, attention, and optimization.
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
              Word Embeddings
            </h2>
            <EmbeddingsExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">4</span>
              Self-Attention Matrix
            </h2>
            <AttentionMatrixExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">5</span>
              Gradient Descent Optimization
            </h2>
            <GradientDescentExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">6</span>
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
