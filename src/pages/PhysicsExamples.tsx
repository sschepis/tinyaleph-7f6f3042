import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Zap, Network, Sparkles } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import {
  OscillatorBank,
  shannonEntropy,
  Hypercomplex,
  KuramotoModel,
  physics,
} from '@aleph-ai/tinyaleph';

// Access advanced models from physics submodule
const { NetworkKuramoto, AdaptiveKuramoto, SakaguchiKuramoto } = physics as any;

const KuramotoExample = () => {
  const [oscillatorCount, setOscillatorCount] = useState(12);
  const [coupling, setCoupling] = useState(0.3);
  const [running, setRunning] = useState(false);
  const [phases, setPhases] = useState<number[]>([]);
  const [amplitudes, setAmplitudes] = useState<number[]>([]);
  const [orderParameter, setOrderParameter] = useState(0);
  const [meanPhase, setMeanPhase] = useState(0);
  const bankRef = useRef<OscillatorBank | null>(null);
  const couplingRef = useRef(coupling);

  // Keep coupling ref updated
  useEffect(() => {
    couplingRef.current = coupling;
  }, [coupling]);

  // Initialize bank
  useEffect(() => {
    bankRef.current = new OscillatorBank(oscillatorCount);
    
    // Excite all oscillators and randomize phases
    const primes = Array.from({ length: oscillatorCount }, (_, i) => i);
    bankRef.current.excite(primes);
    
    // Randomize initial phases
    bankRef.current.oscillators.forEach(osc => {
      osc.phase = Math.random() * 2 * Math.PI;
      osc.amplitude = 0.8;
    });
    
    updateState();
  }, [oscillatorCount]);

  const updateState = () => {
    if (!bankRef.current) return;
    setPhases(bankRef.current.getPhases());
    setAmplitudes(bankRef.current.getAmplitudes());
    setOrderParameter(bankRef.current.orderParameter());
    
    // Compute mean phase
    let sx = 0, sy = 0;
    bankRef.current.oscillators.forEach(osc => {
      sx += Math.cos(osc.phase);
      sy += Math.sin(osc.phase);
    });
    setMeanPhase(Math.atan2(sy, sx));
  };

  // Animation loop with Kuramoto coupling
  useEffect(() => {
    if (!running || !bankRef.current) return;
    
    const interval = setInterval(() => {
      const bank = bankRef.current!;
      const N = bank.oscillators.length;
      const K = couplingRef.current;
      const dt = 0.05;
      
      // Apply Kuramoto dynamics manually
      bank.oscillators.forEach((osc, i) => {
        // Natural frequency variation
        const freq = 1 + (i - N / 2) * 0.1;
        
        // Kuramoto coupling: K/N * sum(sin(theta_j - theta_i))
        let couplingSum = 0;
        bank.oscillators.forEach((other, j) => {
          if (i !== j) {
            couplingSum += Math.sin(other.phase - osc.phase);
          }
        });
        
        const dPhase = freq * dt + (K / N) * couplingSum * dt;
        osc.phase = (osc.phase + dPhase) % (2 * Math.PI);
        
        // Slight amplitude decay
        osc.amplitude *= (1 - 0.001);
      });
      
      updateState();
    }, 30);
    
    return () => clearInterval(interval);
  }, [running]);

  const reset = useCallback(() => {
    if (!bankRef.current) return;
    bankRef.current.oscillators.forEach(osc => {
      osc.phase = Math.random() * 2 * Math.PI;
      osc.amplitude = 0.8;
    });
    updateState();
  }, []);

  const centerX = 120;
  const centerY = 120;
  const radius = 90;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Kuramoto Synchronization</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Oscillators: {oscillatorCount}
              </label>
              <input
                type="range"
                min="4"
                max="24"
                value={oscillatorCount}
                onChange={(e) => {
                  setOscillatorCount(Number(e.target.value));
                  setRunning(false);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Coupling Strength (K): {coupling.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={coupling}
                onChange={(e) => setCoupling(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRunning(!running)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  running 
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90' 
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Parameter (r):</span>
                <span className={orderParameter > 0.7 ? 'text-primary' : 'text-muted-foreground'}>
                  {orderParameter.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mean Phase (ψ):</span>
                <span className="text-primary">{meanPhase.toFixed(4)} rad</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sync Status:</span>
                <span className={orderParameter > 0.8 ? 'text-primary' : orderParameter > 0.5 ? 'text-accent' : 'text-destructive'}>
                  {orderParameter > 0.8 ? 'Synchronized' : orderParameter > 0.5 ? 'Partial' : 'Desynchronized'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <svg width="240" height="240" className="overflow-visible">
              {/* Background circle */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              
              {/* Order parameter indicator */}
              <circle
                cx={centerX}
                cy={centerY}
                r={radius * orderParameter}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                opacity={0.3}
              />
              
              {/* Oscillator dots */}
              {phases.map((phase, i) => {
                const amp = amplitudes[i] || 0;
                const x = centerX + Math.cos(phase) * radius;
                const y = centerY + Math.sin(phase) * radius;
                const hue = 180 + (i / oscillatorCount) * 40;
                
                return (
                  <g key={i}>
                    <line
                      x1={centerX}
                      y1={centerY}
                      x2={x}
                      y2={y}
                      stroke={`hsla(${hue}, 70%, 50%, ${0.1 + amp * 0.3})`}
                      strokeWidth="1"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={4 + amp * 4}
                      fill={`hsl(${hue}, 70%, 50%)`}
                      opacity={0.5 + amp * 0.5}
                      style={{
                        filter: amp > 0.5 ? `drop-shadow(0 0 ${amp * 8}px hsla(${hue}, 70%, 50%, 0.8))` : 'none'
                      }}
                    />
                  </g>
                );
              })}
              
              {/* Mean phase indicator */}
              <line
                x1={centerX}
                y1={centerY}
                x2={centerX + Math.cos(meanPhase) * (radius * 0.5)}
                y2={centerY + Math.sin(meanPhase) * (radius * 0.5)}
                stroke="hsl(var(--accent))"
                strokeWidth="3"
                strokeLinecap="round"
              />
              
              {/* Center dot */}
              <circle
                cx={centerX}
                cy={centerY}
                r="4"
                fill="hsl(var(--accent))"
              />
            </svg>
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { OscillatorBank } from '@aleph-ai/tinyaleph';

// Create oscillator bank
const bank = new OscillatorBank(${oscillatorCount});

// Excite oscillators
bank.excite([0, 1, 2, 3, 4, 5, 6, 7]);

// Randomize phases
bank.oscillators.forEach(osc => {
  osc.phase = Math.random() * 2 * Math.PI;
  osc.amplitude = 0.8;
});

// Kuramoto dynamics
const K = ${coupling.toFixed(2)}; // Coupling strength
const dt = 0.05;

// Each step: dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ - θᵢ)
bank.oscillators.forEach((osc, i) => {
  let coupling = 0;
  bank.oscillators.forEach((other, j) => {
    if (i !== j) coupling += Math.sin(other.phase - osc.phase);
  });
  osc.phase += (K / N) * coupling * dt;
});

// Order parameter r measures synchronization
console.log('r =', bank.orderParameter());`}
        language="javascript"
        title="kuramoto-example.js"
      />
    </div>
  );
};

const EntropyExample = () => {
  const [components, setComponents] = useState<number[]>([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [entropy, setEntropy] = useState(0);

  const presets = [
    { name: 'Pure e₀', components: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: '2 Equal', components: [0.707, 0.707, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: '4 Equal', components: [0.5, 0.5, 0.5, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
    { name: 'Uniform', components: Array(16).fill(0.25) },
  ];

  const calculateEntropy = useCallback((c: number[]) => {
    const state = new Hypercomplex(16);
    c.forEach((v, i) => {
      (state as any).c[i] = v;
    });
    const e = state.entropy();
    setEntropy(e);
    setComponents(c);
  }, []);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Shannon Entropy</h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Presets</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, i) => (
                <button
                  key={i}
                  onClick={() => calculateEntropy(preset.components)}
                  className="px-3 py-1.5 rounded-md bg-secondary hover:bg-primary/20 text-sm transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Components (first 8)</label>
              <div className="grid grid-cols-4 gap-2">
                {components.slice(0, 8).map((c, i) => (
                  <input
                    key={i}
                    type="number"
                    step="0.1"
                    min="-1"
                    max="1"
                    value={c.toFixed(2)}
                    onChange={(e) => {
                      const newC = [...components];
                      newC[i] = Number(e.target.value);
                      calculateEntropy(newC);
                    }}
                    className="w-full px-2 py-1 rounded bg-muted border border-border text-center font-mono text-sm"
                  />
                ))}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-center">
                <span className="text-sm text-muted-foreground">Entropy</span>
                <p className="text-4xl font-mono font-bold text-primary mt-2">
                  {entropy.toFixed(4)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">bits</p>
                
                {/* Entropy bar */}
                <div className="mt-4 h-4 rounded-full bg-muted overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${(entropy / 4) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  0 = pure state | 4 = max entropy (uniform)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { Hypercomplex, shannonEntropy } from '@aleph-ai/tinyaleph';

// Pure state (single component = 1)
const pure = new Hypercomplex(16);
pure.c[0] = 1;
console.log('Pure entropy:', pure.entropy());  // ~0.0

// Uniform state (all components equal)
const uniform = new Hypercomplex(16);
for (let i = 0; i < 16; i++) uniform.c[i] = 0.25;
console.log('Uniform entropy:', uniform.entropy());  // ~4.0 (max for 16D)

// Shannon entropy of a probability distribution
const probs = [0.25, 0.25, 0.25, 0.25];
console.log('Shannon:', shannonEntropy(probs));`}
        language="javascript"
        title="entropy-example.js"
      />
    </div>
  );
};

// NetworkKuramoto Example - Topology-aware coupling
const NetworkKuramotoExample = () => {
  const [nodeCount, setNodeCount] = useState(8);
  const [coupling, setCoupling] = useState(0.4);
  const [running, setRunning] = useState(false);
  const [topology, setTopology] = useState<'ring' | 'star' | 'random'>('ring');
  const modelRef = useRef<any>(null);
  const [phases, setPhases] = useState<number[]>([]);
  const [orderParameter, setOrderParameter] = useState(0);
  const [adjacency, setAdjacency] = useState<number[][]>([]);
  const couplingRef = useRef(coupling);

  useEffect(() => {
    couplingRef.current = coupling;
    if (modelRef.current) {
      modelRef.current.K = coupling;
    }
  }, [coupling]);

  // Initialize network
  useEffect(() => {
    const freqs = Array.from({ length: nodeCount }, (_, i) => 1 + (i - nodeCount / 2) * 0.15);
    
    // Build adjacency based on topology
    const adj: number[][] = Array(nodeCount).fill(null).map(() => Array(nodeCount).fill(0));
    
    if (topology === 'ring') {
      for (let i = 0; i < nodeCount; i++) {
        adj[i][(i + 1) % nodeCount] = 1;
        adj[(i + 1) % nodeCount][i] = 1;
      }
    } else if (topology === 'star') {
      for (let i = 1; i < nodeCount; i++) {
        adj[0][i] = 1;
        adj[i][0] = 1;
      }
    } else {
      // Random with ~40% connection probability
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (Math.random() < 0.4) {
            adj[i][j] = 1;
            adj[j][i] = 1;
          }
        }
      }
    }
    
    modelRef.current = new NetworkKuramoto(freqs, adj, coupling);
    
    // Randomize phases
    modelRef.current.oscillators.forEach((osc: any) => {
      osc.phase = Math.random() * 2 * Math.PI;
      osc.amplitude = 1;
    });
    
    setAdjacency(adj);
    updateState();
  }, [nodeCount, topology]);

  const updateState = () => {
    if (!modelRef.current) return;
    setPhases(modelRef.current.oscillators.map((o: any) => o.phase));
    setOrderParameter(modelRef.current.orderParameter());
  };

  useEffect(() => {
    if (!running || !modelRef.current) return;
    
    const interval = setInterval(() => {
      modelRef.current.tick(0.05);
      updateState();
    }, 30);
    
    return () => clearInterval(interval);
  }, [running]);

  const reset = useCallback(() => {
    if (!modelRef.current) return;
    modelRef.current.oscillators.forEach((osc: any) => {
      osc.phase = Math.random() * 2 * Math.PI;
    });
    updateState();
  }, []);

  const centerX = 140;
  const centerY = 140;
  const radius = 100;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          Network Kuramoto
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Nodes: {nodeCount}
              </label>
              <input
                type="range"
                min="4"
                max="16"
                value={nodeCount}
                onChange={(e) => {
                  setNodeCount(Number(e.target.value));
                  setRunning(false);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Coupling (K): {coupling.toFixed(2)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={coupling}
                onChange={(e) => setCoupling(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Topology</label>
              <div className="flex gap-2">
                {(['ring', 'star', 'random'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTopology(t); setRunning(false); }}
                    className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                      topology === t ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRunning(!running)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  running ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
                }`}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Parameter (r):</span>
                <span className={orderParameter > 0.7 ? 'text-primary' : 'text-muted-foreground'}>
                  {orderParameter.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Edges:</span>
                <span className="text-accent">{adjacency.flat().filter(v => v > 0).length / 2}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <svg width="280" height="280" className="overflow-visible">
              {/* Draw edges */}
              {adjacency.map((row, i) => 
                row.map((w, j) => {
                  if (w > 0 && i < j) {
                    const angle1 = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
                    const angle2 = (j / nodeCount) * 2 * Math.PI - Math.PI / 2;
                    const x1 = centerX + Math.cos(angle1) * radius;
                    const y1 = centerY + Math.sin(angle1) * radius;
                    const x2 = centerX + Math.cos(angle2) * radius;
                    const y2 = centerY + Math.sin(angle2) * radius;
                    
                    return (
                      <line
                        key={`${i}-${j}`}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="hsl(var(--border))"
                        strokeWidth="1"
                        opacity={0.5}
                      />
                    );
                  }
                  return null;
                })
              )}
              
              {/* Draw nodes */}
              {phases.map((phase, i) => {
                const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                const hue = ((phase / (2 * Math.PI)) * 60) + 180;
                
                return (
                  <g key={i}>
                    <circle
                      cx={x} cy={y} r={12}
                      fill={`hsl(${hue}, 70%, 50%)`}
                      style={{ filter: `drop-shadow(0 0 6px hsla(${hue}, 70%, 50%, 0.6))` }}
                    />
                    <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fill="white">
                      {i}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { physics } from '@aleph-ai/tinyaleph';
const { NetworkKuramoto } = physics;

// Natural frequencies
const frequencies = [1.0, 1.1, 0.9, 1.05, 0.95, 1.02, 0.98, 1.08];

// Ring topology adjacency matrix
const adjacency = Array(8).fill(null).map((_, i) => {
  const row = Array(8).fill(0);
  row[(i + 1) % 8] = 1;
  row[(i - 1 + 8) % 8] = 1;
  return row;
});

const model = new NetworkKuramoto(frequencies, adjacency, 0.4);

// Randomize phases
model.oscillators.forEach(osc => {
  osc.phase = Math.random() * 2 * Math.PI;
});

// Simulate
for (let i = 0; i < 100; i++) {
  model.tick(0.05);
}

console.log('Order parameter:', model.orderParameter());
console.log('Clusters:', model.findClusters());`}
        language="javascript"
        title="network-kuramoto.js"
      />
    </div>
  );
};

// AdaptiveKuramoto Example - Hebbian plasticity
const AdaptiveKuramotoExample = () => {
  const [nodeCount, setNodeCount] = useState(6);
  const [learningRate, setLearningRate] = useState(0.02);
  const [running, setRunning] = useState(false);
  const modelRef = useRef<any>(null);
  const [phases, setPhases] = useState<number[]>([]);
  const [couplingMatrix, setCouplingMatrix] = useState<number[][]>([]);
  const [orderParameter, setOrderParameter] = useState(0);
  const [totalCoupling, setTotalCoupling] = useState(0);

  useEffect(() => {
    const freqs = Array.from({ length: nodeCount }, (_, i) => 1 + (i - nodeCount / 2) * 0.2);
    modelRef.current = new AdaptiveKuramoto(freqs, 0.3, learningRate);
    
    // Randomize phases
    modelRef.current.oscillators.forEach((osc: any) => {
      osc.phase = Math.random() * 2 * Math.PI;
    });
    
    updateState();
  }, [nodeCount, learningRate]);

  const updateState = () => {
    if (!modelRef.current) return;
    setPhases(modelRef.current.oscillators.map((o: any) => o.phase));
    setCouplingMatrix(modelRef.current.getCouplingSnapshot());
    setOrderParameter(modelRef.current.orderParameter());
    setTotalCoupling(modelRef.current.totalCoupling());
  };

  useEffect(() => {
    if (!running || !modelRef.current) return;
    
    const interval = setInterval(() => {
      modelRef.current.tick(0.05);
      updateState();
    }, 30);
    
    return () => clearInterval(interval);
  }, [running]);

  const reset = useCallback(() => {
    if (!modelRef.current) return;
    modelRef.current.resetCoupling(0.3);
    modelRef.current.oscillators.forEach((osc: any) => {
      osc.phase = Math.random() * 2 * Math.PI;
    });
    updateState();
  }, []);

  // Get max coupling for normalization
  const maxCoupling = Math.max(...couplingMatrix.flat(), 0.5);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-accent" />
          Adaptive Kuramoto (Hebbian Plasticity)
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Oscillators: {nodeCount}
              </label>
              <input
                type="range"
                min="3"
                max="8"
                value={nodeCount}
                onChange={(e) => {
                  setNodeCount(Number(e.target.value));
                  setRunning(false);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Learning Rate (ε): {learningRate.toFixed(3)}
              </label>
              <input
                type="range"
                min="0.001"
                max="0.1"
                step="0.001"
                value={learningRate}
                onChange={(e) => {
                  setLearningRate(Number(e.target.value));
                  setRunning(false);
                }}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRunning(!running)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  running ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
                }`}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Parameter:</span>
                <span className={orderParameter > 0.7 ? 'text-primary' : 'text-muted-foreground'}>
                  {orderParameter.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Coupling:</span>
                <span className="text-accent">{totalCoupling.toFixed(2)}</span>
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Coupling evolves via Hebbian rule: synchronized pairs strengthen their connections.
            </p>
          </div>

          <div className="space-y-4">
            {/* Coupling Matrix Heatmap */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Coupling Matrix (Kᵢⱼ)</label>
              <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${nodeCount}, 1fr)` }}>
                {couplingMatrix.map((row, i) =>
                  row.map((k, j) => (
                    <div
                      key={`${i}-${j}`}
                      className="aspect-square rounded-sm transition-colors"
                      style={{
                        backgroundColor: i === j 
                          ? 'transparent' 
                          : `hsla(var(--primary), ${(k / maxCoupling) * 0.8 + 0.1})`,
                        border: i === j ? '1px dashed hsl(var(--border))' : 'none'
                      }}
                      title={`K[${i}][${j}] = ${k.toFixed(3)}`}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Phase circle */}
            <div className="flex justify-center">
              <svg width="120" height="120" className="overflow-visible">
                <circle cx="60" cy="60" r="45" fill="none" stroke="hsl(var(--border))" strokeDasharray="2 2" />
                {phases.map((phase, i) => {
                  const x = 60 + Math.cos(phase) * 45;
                  const y = 60 + Math.sin(phase) * 45;
                  return (
                    <circle
                      key={i}
                      cx={x} cy={y} r={6}
                      fill={`hsl(${180 + i * 30}, 70%, 50%)`}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { physics } from '@aleph-ai/tinyaleph';
const { AdaptiveKuramoto } = physics;

// "Concepts that sync together, link together"
const frequencies = [1.0, 1.2, 0.8, 1.1, 0.9, 1.05];
const model = new AdaptiveKuramoto(
  frequencies,
  0.3,  // Initial coupling strength
  0.02  // Learning rate ε
);

// Hebbian update: dKᵢⱼ/dt = ε(cos(θⱼ - θᵢ) - Kᵢⱼ)
for (let i = 0; i < 500; i++) {
  model.tick(0.05);
}

// Pairs that synchronized have stronger coupling
console.log('Coupling matrix:', model.getCouplingSnapshot());
console.log('Total coupling:', model.totalCoupling());`}
        language="javascript"
        title="adaptive-kuramoto.js"
      />
    </div>
  );
};

// SakaguchiKuramoto Example - Phase frustration & chimera states
const SakaguchiExample = () => {
  const [oscillatorCount, setOscillatorCount] = useState(16);
  const [coupling, setCoupling] = useState(0.5);
  const [phaseLag, setPhaseLag] = useState(0);
  const [running, setRunning] = useState(false);
  const modelRef = useRef<any>(null);
  const [phases, setPhases] = useState<number[]>([]);
  const [orderParameter, setOrderParameter] = useState(0);
  const [chimeraRatio, setChimeraRatio] = useState(0);
  const [stateClass, setStateClass] = useState('incoherent');

  useEffect(() => {
    const freqs = Array.from({ length: oscillatorCount }, (_, i) => 1 + (i - oscillatorCount / 2) * 0.1);
    modelRef.current = new SakaguchiKuramoto(freqs, coupling, phaseLag);
    
    modelRef.current.oscillators.forEach((osc: any) => {
      osc.phase = Math.random() * 2 * Math.PI;
    });
    
    updateState();
  }, [oscillatorCount, coupling, phaseLag]);

  const updateState = () => {
    if (!modelRef.current) return;
    setPhases(modelRef.current.oscillators.map((o: any) => o.phase));
    setOrderParameter(modelRef.current.orderParameter());
    setChimeraRatio(modelRef.current.chimeraRatio());
    setStateClass(modelRef.current.classifyState());
  };

  useEffect(() => {
    if (!running || !modelRef.current) return;
    
    const interval = setInterval(() => {
      modelRef.current.tick(0.05);
      updateState();
    }, 30);
    
    return () => clearInterval(interval);
  }, [running]);

  const reset = useCallback(() => {
    if (!modelRef.current) return;
    modelRef.current.oscillators.forEach((osc: any) => {
      osc.phase = Math.random() * 2 * Math.PI;
    });
    updateState();
  }, []);

  const centerX = 120;
  const centerY = 120;
  const radius = 90;
  const meanPhase = phases.length > 0
    ? Math.atan2(
        phases.reduce((s, p) => s + Math.sin(p), 0),
        phases.reduce((s, p) => s + Math.cos(p), 0)
      )
    : 0;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-destructive" />
          Sakaguchi-Kuramoto (Phase Frustration)
        </h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Oscillators: {oscillatorCount}
              </label>
              <input
                type="range"
                min="8"
                max="32"
                value={oscillatorCount}
                onChange={(e) => {
                  setOscillatorCount(Number(e.target.value));
                  setRunning(false);
                }}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Coupling (K): {coupling.toFixed(2)}
              </label>
              <input
                type="range"
                min="0.1"
                max="1.5"
                step="0.05"
                value={coupling}
                onChange={(e) => setCoupling(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                Phase Lag (α): {phaseLag.toFixed(2)} rad ({(phaseLag * 180 / Math.PI).toFixed(0)}°)
              </label>
              <input
                type="range"
                min="0"
                max={Math.PI / 2}
                step="0.05"
                value={phaseLag}
                onChange={(e) => setPhaseLag(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Critical α ≈ {SakaguchiKuramoto.criticalPhaseLag(coupling).toFixed(2)} rad for chimera
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRunning(!running)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  running ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground'
                }`}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Parameter:</span>
                <span className={orderParameter > 0.7 ? 'text-primary' : 'text-muted-foreground'}>
                  {orderParameter.toFixed(4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chimera Ratio:</span>
                <span className="text-accent">{(chimeraRatio * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">State:</span>
                <span className={
                  stateClass === 'synchronized' ? 'text-primary' :
                  stateClass === 'chimera' ? 'text-destructive' :
                  stateClass === 'partial' ? 'text-accent' : 'text-muted-foreground'
                }>
                  {stateClass}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <svg width="240" height="240" className="overflow-visible">
              <circle
                cx={centerX} cy={centerY} r={radius}
                fill="none" stroke="hsl(var(--border))" strokeDasharray="4 4"
              />
              
              {/* Phase lag indicator arc */}
              {phaseLag > 0 && (
                <path
                  d={`M ${centerX + 30} ${centerY} A 30 30 0 0 1 ${centerX + 30 * Math.cos(phaseLag)} ${centerY - 30 * Math.sin(phaseLag)}`}
                  fill="none"
                  stroke="hsl(var(--destructive))"
                  strokeWidth="2"
                  opacity={0.5}
                />
              )}
              
              {phases.map((phase, i) => {
                const x = centerX + Math.cos(phase) * radius;
                const y = centerY + Math.sin(phase) * radius;
                
                // Check if synchronized with mean
                const diff = Math.abs(phase - meanPhase);
                const wrapped = Math.min(diff, 2 * Math.PI - diff);
                const isSynced = wrapped < 0.3;
                
                const hue = isSynced ? 180 : 0; // Green if synced, red if not
                
                return (
                  <circle
                    key={i}
                    cx={x} cy={y}
                    r={4}
                    fill={`hsl(${hue}, 70%, 50%)`}
                    opacity={0.8}
                    style={{ filter: `drop-shadow(0 0 4px hsla(${hue}, 70%, 50%, 0.6))` }}
                  />
                );
              })}
              
              <circle cx={centerX} cy={centerY} r={3} fill="hsl(var(--accent))" />
            </svg>
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { physics } from '@aleph-ai/tinyaleph';
const { SakaguchiKuramoto } = physics;

// Sakaguchi-Kuramoto with phase frustration
// dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ - θᵢ - α)
const frequencies = Array.from({ length: 16 }, (_, i) => 1 + (i - 8) * 0.1);
const phaseLag = 0.8; // α in radians

const model = new SakaguchiKuramoto(frequencies, 0.5, phaseLag);

// The phase lag creates "chimera states" where some
// oscillators synchronize while others don't
for (let i = 0; i < 200; i++) {
  model.tick(0.05);
}

console.log('State:', model.classifyState()); // 'synchronized', 'chimera', 'partial', 'incoherent'
console.log('Chimera ratio:', model.chimeraRatio()); // Fraction synchronized

// Critical phase lag for chimera formation
console.log('Critical α:', SakaguchiKuramoto.criticalPhaseLag(0.5));`}
        language="javascript"
        title="sakaguchi-kuramoto.js"
      />
    </div>
  );
};

const PhysicsExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline text-sm">← Back to Examples</a>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Physics Module</h1>
          <p className="text-muted-foreground">
            Interactive examples of oscillator dynamics, synchronization models, and entropy.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
              Basic Kuramoto Synchronization
            </h2>
            <KuramotoExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">2</span>
              Network Kuramoto (Topology-Aware)
            </h2>
            <NetworkKuramotoExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">3</span>
              Adaptive Kuramoto (Hebbian Learning)
            </h2>
            <AdaptiveKuramotoExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">4</span>
              Sakaguchi-Kuramoto (Chimera States)
            </h2>
            <SakaguchiExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">5</span>
              Entropy & Information
            </h2>
            <EntropyExample />
          </section>
        </div>
      </div>
    </div>
  );
};

export default PhysicsExamplesPage;
