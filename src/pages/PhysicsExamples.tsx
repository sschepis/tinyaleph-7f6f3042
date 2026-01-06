import { useState, useCallback, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import {
  OscillatorBank,
  shannonEntropy,
  Hypercomplex,
} from '@aleph-ai/tinyaleph';

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

const PhysicsExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline text-sm">← Back to Examples</a>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Physics Module</h1>
          <p className="text-muted-foreground">
            Interactive examples of oscillator dynamics and entropy.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
              Kuramoto Oscillator Synchronization
            </h2>
            <KuramotoExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">2</span>
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
