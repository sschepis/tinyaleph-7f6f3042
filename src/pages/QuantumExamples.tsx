import { useState, useCallback, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import SedenionVisualizer from '../components/SedenionVisualizer';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import { Play, Dice1, Atom, Waves, Zap, Target, Link2, Footprints, Circle } from 'lucide-react';

// PrimeState: quantum-like state built from prime factors
interface PrimeState {
  primes: number[];
  amplitudes: number[];
  phases: number[];
}

function createPrimeState(n: number): PrimeState {
  const primes: number[] = [];
  const amplitudes: number[] = [];
  const phases: number[] = [];
  
  let remaining = n;
  for (let p = 2; p <= Math.sqrt(remaining); p++) {
    let count = 0;
    while (remaining % p === 0) {
      count++;
      remaining /= p;
    }
    if (count > 0) {
      primes.push(p);
      amplitudes.push(Math.sqrt(count / Math.log2(n + 1)));
      phases.push((p * count) % (2 * Math.PI));
    }
  }
  if (remaining > 1) {
    primes.push(remaining);
    amplitudes.push(1 / Math.sqrt(primes.length + 1));
    phases.push(remaining % (2 * Math.PI));
  }
  
  const norm = Math.sqrt(amplitudes.reduce((s, a) => s + a * a, 0));
  return {
    primes,
    amplitudes: amplitudes.map(a => a / (norm || 1)),
    phases,
  };
}

function bornMeasurement(state: PrimeState): { outcome: number; probability: number } {
  const probabilities = state.amplitudes.map(a => a * a);
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (rand <= cumulative) {
      return { outcome: state.primes[i], probability: probabilities[i] };
    }
  }
  return { outcome: state.primes[state.primes.length - 1], probability: probabilities[probabilities.length - 1] };
}

type OperatorType = 'P' | 'R' | 'H';

function applyOperator(components: number[], operator: OperatorType): number[] {
  const n = components.length;
  const result = [...components];
  
  switch (operator) {
    case 'P':
      for (let i = 0; i < n; i++) {
        const phase = (i / n) * Math.PI / 2;
        const cos = Math.cos(phase);
        const sin = Math.sin(phase);
        const j = (i + 1) % n;
        const newI = result[i] * cos - result[j] * sin;
        const newJ = result[i] * sin + result[j] * cos;
        result[i] = newI;
        result[j] = newJ;
      }
      break;
    case 'R':
      const dominant = result.reduce((max, v, i) => Math.abs(v) > Math.abs(result[max]) ? i : max, 0);
      for (let i = 0; i < n; i++) {
        result[i] *= i === dominant ? 1.2 : 0.9;
      }
      break;
    case 'H':
      for (let i = 0; i < n; i += 2) {
        if (i + 1 < n) {
          const a = result[i];
          const b = result[i + 1];
          result[i] = (a + b) / Math.SQRT2;
          result[i + 1] = (a - b) / Math.SQRT2;
        }
      }
      break;
  }
  
  const norm = Math.sqrt(result.reduce((s, v) => s + v * v, 0));
  return result.map(v => v / (norm || 1));
}

function computeEntropy(components: number[]): number {
  const norm = Math.sqrt(components.reduce((s, v) => s + v * v, 0));
  if (norm === 0) return 0;
  const probs = components.map(v => (v * v) / (norm * norm));
  return -probs.reduce((s, p) => s + (p > 0 ? p * Math.log2(p) : 0), 0);
}

function computeCoherence(components: number[]): number {
  const maxEntropy = Math.log2(components.length);
  const entropy = computeEntropy(components);
  return maxEntropy > 0 ? 1 - entropy / maxEntropy : 1;
}

const PrimeStateDemo = () => {
  const [inputNumber, setInputNumber] = useState(360);
  const [state, setState] = useState<PrimeState | null>(null);
  const [measurements, setMeasurements] = useState<{ outcome: number; probability: number }[]>([]);

  const buildState = useCallback(() => {
    const newState = createPrimeState(inputNumber);
    setState(newState);
    setMeasurements([]);
  }, [inputNumber]);

  const measure = useCallback(() => {
    if (!state) return;
    const result = bornMeasurement(state);
    setMeasurements(prev => [...prev.slice(-9), result]);
  }, [state]);

  const measureMany = useCallback(() => {
    if (!state) return;
    const results = Array.from({ length: 100 }, () => bornMeasurement(state));
    setMeasurements(results.slice(-10));
  }, [state]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Atom className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">PrimeState Builder</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Input Number: {inputNumber}</label>
            <Slider
              value={[inputNumber]}
              onValueChange={([v]) => setInputNumber(v)}
              min={2}
              max={10000}
              step={1}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={buildState} className="flex-1">
              <Play className="w-4 h-4 mr-2" /> Build State
            </Button>
            <Button onClick={measure} disabled={!state} variant="outline">
              <Dice1 className="w-4 h-4 mr-2" /> Measure
            </Button>
            <Button onClick={measureMany} disabled={!state} variant="outline">
              ×100
            </Button>
          </div>

          {state && (
            <div className="p-4 rounded-lg bg-muted border border-border space-y-3">
              <div>
                <span className="text-sm font-medium">Prime Basis:</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {state.primes.map((p, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-primary/20 text-primary text-sm font-mono">
                      |{p}⟩: {(state.amplitudes[i] * state.amplitudes[i] * 100).toFixed(1)}%
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                Total states: {state.primes.length} | 
                Max entropy: {Math.log2(state.primes.length).toFixed(2)} bits
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium mb-2 block">Measurement Results</label>
          <div className="p-4 rounded-lg bg-card border border-border min-h-[150px]">
            {measurements.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {measurements.map((m, i) => (
                  <div 
                    key={i} 
                    className="px-3 py-2 rounded-lg bg-primary/10 border border-primary/30 text-center"
                  >
                    <div className="font-mono font-bold text-primary">{m.outcome}</div>
                    <div className="text-xs text-muted-foreground">{(m.probability * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Build a state and measure to see outcomes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResonanceOperatorDemo = () => {
  const [dims, setDims] = useState(8);
  const [components, setComponents] = useState<number[]>(() => {
    const c = Array(8).fill(0);
    c[0] = 1;
    return c;
  });
  const [history, setHistory] = useState<{ op: string; entropy: number; coherence: number }[]>([]);

  const [initSeed, setInitSeed] = useState(1);

  const resetState = useCallback((type: 'uniform' | 'basis' | 'seeded') => {
    let newComponents: number[];
    switch (type) {
      case 'uniform':
        newComponents = Array(dims).fill(1 / Math.sqrt(dims));
        break;
      case 'basis':
        newComponents = Array(dims).fill(0);
        newComponents[0] = 1;
        break;
      case 'seeded':
        // Deterministic "random" based on seed
        const seed = initSeed;
        setInitSeed(s => s + 1);
        newComponents = Array(dims).fill(0).map((_, i) => {
          const h = Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453;
          return (h - Math.floor(h)) - 0.5;
        });
        const norm = Math.sqrt(newComponents.reduce((s, v) => s + v * v, 0));
        newComponents = newComponents.map(v => v / norm);
        break;
      default:
        newComponents = Array(dims).fill(0);
        newComponents[0] = 1;
    }
    setComponents(newComponents);
    setHistory([]);
  }, [dims, initSeed]);

  const apply = useCallback((op: OperatorType) => {
    const newComponents = applyOperator(components, op);
    setComponents(newComponents);
    setHistory(prev => [...prev, {
      op,
      entropy: computeEntropy(newComponents),
      coherence: computeCoherence(newComponents),
    }]);
  }, [components]);

  const entropy = useMemo(() => computeEntropy(components), [components]);
  const coherence = useMemo(() => computeCoherence(components), [components]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Waves className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">Resonance Operators</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Dimension: {dims}</label>
            <Slider
              value={[dims]}
              onValueChange={([v]) => {
                setDims(v);
                const c = Array(v).fill(0);
                c[0] = 1;
                setComponents(c);
                setHistory([]);
              }}
              min={2}
              max={16}
              step={1}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => resetState('basis')} variant="outline" size="sm">|0⟩ Basis</Button>
            <Button onClick={() => resetState('uniform')} variant="outline" size="sm">Uniform</Button>
            <Button onClick={() => resetState('seeded')} variant="outline" size="sm">Seed #{initSeed}</Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => apply('P')} className="flex-1">P̂ Phase</Button>
            <Button onClick={() => apply('R')} className="flex-1">R̂ Resonance</Button>
            <Button onClick={() => apply('H')} className="flex-1">Ĥ Hadamard</Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-muted border border-border text-center">
              <div className="text-2xl font-mono font-bold text-primary">{entropy.toFixed(3)}</div>
              <div className="text-xs text-muted-foreground">Entropy (bits)</div>
            </div>
            <div className="p-3 rounded-lg bg-muted border border-border text-center">
              <div className="text-2xl font-mono font-bold text-primary">{(coherence * 100).toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Coherence</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <SedenionVisualizer components={components} size="lg" />
          
          {history.length > 0 && (
            <div className="p-3 rounded-lg bg-muted border border-border">
              <div className="text-sm font-medium mb-2">Operator History</div>
              <div className="flex gap-1 flex-wrap">
                {history.slice(-10).map((h, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-primary/20 text-primary text-xs font-mono">
                    {h.op}̂
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Superposition & Interference Demo
const SuperpositionDemo = () => {
  const [phase1, setPhase1] = useState(0);
  const [phase2, setPhase2] = useState(Math.PI);
  const [amplitude1, setAmplitude1] = useState(0.7);
  const [amplitude2, setAmplitude2] = useState(0.7);

  const combined = useMemo(() => {
    // Two-path interference: |ψ⟩ = a₁e^(iφ₁)|0⟩ + a₂e^(iφ₂)|1⟩
    const real0 = amplitude1 * Math.cos(phase1) + amplitude2 * Math.cos(phase2);
    const imag0 = amplitude1 * Math.sin(phase1) + amplitude2 * Math.sin(phase2);
    const prob0 = real0 * real0 + imag0 * imag0;
    
    // Constructive/destructive interference
    const phaseDiff = Math.abs(phase1 - phase2);
    const interferenceType = phaseDiff < 0.5 ? 'constructive' : phaseDiff > 2.5 ? 'destructive' : 'partial';
    
    // Build 8D state from interference pattern
    const components = Array(8).fill(0).map((_, i) => {
      const ph = phase1 + (phase2 - phase1) * (i / 7);
      return amplitude1 * Math.cos(ph) * Math.cos(i * Math.PI / 4);
    });
    const norm = Math.sqrt(components.reduce((s, v) => s + v * v, 0)) || 1;
    
    return {
      probability: prob0 / ((amplitude1 + amplitude2) ** 2),
      interference: interferenceType,
      components: components.map(v => v / norm),
    };
  }, [phase1, phase2, amplitude1, amplitude2]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Superposition & Interference</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Path 1 Phase: {(phase1 / Math.PI).toFixed(2)}π</label>
            <Slider value={[phase1]} onValueChange={([v]) => setPhase1(v)} min={0} max={2 * Math.PI} step={0.1} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Path 2 Phase: {(phase2 / Math.PI).toFixed(2)}π</label>
            <Slider value={[phase2]} onValueChange={([v]) => setPhase2(v)} min={0} max={2 * Math.PI} step={0.1} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Amplitude 1: {amplitude1.toFixed(2)}</label>
            <Slider value={[amplitude1]} onValueChange={([v]) => setAmplitude1(v)} min={0.1} max={1} step={0.05} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Amplitude 2: {amplitude2.toFixed(2)}</label>
            <Slider value={[amplitude2]} onValueChange={([v]) => setAmplitude2(v)} min={0.1} max={1} step={0.05} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-muted border border-border text-center">
            <div className={`text-2xl font-bold ${
              combined.interference === 'constructive' ? 'text-green-400' :
              combined.interference === 'destructive' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {combined.interference.charAt(0).toUpperCase() + combined.interference.slice(1)}
            </div>
            <div className="text-xs text-muted-foreground">Interference Type</div>
          </div>
          
          <SedenionVisualizer components={combined.components} animated={false} size="lg" />
          
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-center">
            <div className="text-xl font-mono text-primary">{(combined.probability * 100).toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Detection Probability</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// State Collapse Demo
const CollapseDemo = () => {
  const [dims] = useState(8);
  const [superposition, setSuperposition] = useState<number[]>(() => Array(8).fill(1 / Math.sqrt(8)));
  const [collapsed, setCollapsed] = useState<number[] | null>(null);
  const [collapsedIndex, setCollapsedIndex] = useState<number | null>(null);
  const [seed, setSeed] = useState(42);

  const reset = useCallback(() => {
    setSuperposition(Array(dims).fill(1 / Math.sqrt(dims)));
    setCollapsed(null);
    setCollapsedIndex(null);
  }, [dims]);

  const collapse = useCallback(() => {
    // Deterministic "random" based on seed
    const hash = Math.sin(seed * 12.9898) * 43758.5453;
    const rand = hash - Math.floor(hash);
    setSeed(s => s + 1);
    
    const probs = superposition.map(v => v * v);
    let cumulative = 0;
    let idx = 0;
    for (let i = 0; i < probs.length; i++) {
      cumulative += probs[i];
      if (rand <= cumulative) {
        idx = i;
        break;
      }
    }
    
    const newState = Array(dims).fill(0);
    newState[idx] = 1;
    setCollapsed(newState);
    setCollapsedIndex(idx);
  }, [superposition, dims, seed]);

  const applyHadamard = useCallback(() => {
    const newState = applyOperator(superposition, 'H');
    setSuperposition(newState);
    setCollapsed(null);
    setCollapsedIndex(null);
  }, [superposition]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">State Collapse</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Measurement collapses a superposition into a definite basis state with probability |α|².
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Superposition (before)</p>
            <SedenionVisualizer components={superposition} animated={false} size="md" />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={reset} variant="outline" size="sm">Reset</Button>
            <Button onClick={applyHadamard} variant="outline" size="sm">Apply Ĥ</Button>
            <Button onClick={collapse} className="flex-1">
              <Target className="w-4 h-4 mr-2" /> Measure (Seed #{seed})
            </Button>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Probabilities</p>
            <div className="flex gap-1">
              {superposition.map((v, i) => (
                <div key={i} className="flex-1 text-center">
                  <div 
                    className={`h-16 rounded-t flex items-end justify-center ${collapsedIndex === i ? 'bg-green-500' : 'bg-primary/50'}`}
                    style={{ height: `${Math.max(8, v * v * 100)}px` }}
                  >
                    <span className="text-[8px] text-white pb-0.5">{(v * v * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">|{i}⟩</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          {collapsed ? (
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
              <p className="text-sm text-green-400 mb-2">Collapsed to |{collapsedIndex}⟩</p>
              <SedenionVisualizer components={collapsed} animated={false} size="lg" />
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-muted/30 border border-border h-full flex items-center justify-center">
              <p className="text-muted-foreground text-sm">Click "Measure" to collapse</p>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-lg bg-muted border border-border text-center">
              <div className="text-lg font-mono text-primary">{computeEntropy(superposition).toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Entropy (before)</div>
            </div>
            <div className="p-3 rounded-lg bg-muted border border-border text-center">
              <div className="text-lg font-mono text-primary">{collapsed ? '0.00' : '—'}</div>
              <div className="text-xs text-muted-foreground">Entropy (after)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Entanglement Demo
const EntanglementDemo = () => {
  const [stateA, setStateA] = useState<number[]>([1, 0, 0, 0]);
  const [stateB, setStateB] = useState<number[]>([1, 0, 0, 0]);
  const [entangled, setEntangled] = useState(false);
  const [measurements, setMeasurements] = useState<{ a: number; b: number }[]>([]);
  const [seed, setSeed] = useState(1);

  const entangle = useCallback(() => {
    // Create Bell state: |00⟩ + |11⟩ / √2
    const bellA = [1 / Math.SQRT2, 0, 0, 1 / Math.SQRT2];
    const bellB = [1 / Math.SQRT2, 0, 0, 1 / Math.SQRT2];
    setStateA(bellA);
    setStateB(bellB);
    setEntangled(true);
    setMeasurements([]);
  }, []);

  const separate = useCallback(() => {
    setStateA([1, 0, 0, 0]);
    setStateB([0, 1, 0, 0]);
    setEntangled(false);
    setMeasurements([]);
  }, []);

  const measureBoth = useCallback(() => {
    // Deterministic measurement
    const hash = Math.sin(seed * 12.9898) * 43758.5453;
    const rand = hash - Math.floor(hash);
    setSeed(s => s + 1);
    
    let aResult: number, bResult: number;
    
    if (entangled) {
      // Correlated outcomes for entangled state
      aResult = rand < 0.5 ? 0 : 3;
      bResult = aResult; // Perfect correlation
    } else {
      // Independent outcomes
      const hash2 = Math.sin(seed * 78.233) * 43758.5453;
      const rand2 = hash2 - Math.floor(hash2);
      aResult = Math.floor(rand * 4);
      bResult = Math.floor(rand2 * 4);
    }
    
    setMeasurements(prev => [...prev.slice(-7), { a: aResult, b: bResult }]);
  }, [entangled, seed]);

  const correlation = useMemo(() => {
    if (measurements.length < 2) return 0;
    const matches = measurements.filter(m => m.a === m.b).length;
    return matches / measurements.length;
  }, [measurements]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Link2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Entanglement Simulation</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Entangled particles show correlated measurements regardless of distance. Measure both and observe the correlations.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p className="text-sm font-medium text-blue-400 mb-2">Particle A</p>
          <SedenionVisualizer components={stateA} animated={entangled} size="md" />
        </div>
        <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
          <p className="text-sm font-medium text-purple-400 mb-2">Particle B</p>
          <SedenionVisualizer components={stateB} animated={entangled} size="md" />
        </div>
      </div>
      
      <div className="flex gap-2 flex-wrap">
        <Button onClick={entangle} variant={entangled ? 'default' : 'outline'}>
          <Link2 className="w-4 h-4 mr-2" /> Entangle
        </Button>
        <Button onClick={separate} variant={!entangled ? 'default' : 'outline'}>
          Separate
        </Button>
        <Button onClick={measureBoth} className="flex-1">
          <Dice1 className="w-4 h-4 mr-2" /> Measure Both (#{seed})
        </Button>
      </div>
      
      <div className={`p-4 rounded-lg text-center ${entangled ? 'bg-green-500/10 border border-green-500/30' : 'bg-muted/50'}`}>
        <p className="text-sm">{entangled ? '🔗 Particles are ENTANGLED' : '⚪ Particles are SEPARATED'}</p>
      </div>
      
      {measurements.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Measurement History:</p>
          <div className="flex gap-2 flex-wrap">
            {measurements.map((m, i) => (
              <div key={i} className={`px-3 py-2 rounded-lg text-center ${m.a === m.b ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <div className="text-xs text-muted-foreground">A: |{m.a}⟩ B: |{m.b}⟩</div>
                <div className="text-xs">{m.a === m.b ? '✓' : '✗'}</div>
              </div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-muted text-center">
            <div className="text-xl font-mono text-primary">{(correlation * 100).toFixed(0)}%</div>
            <div className="text-xs text-muted-foreground">Correlation</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Quantum Walk Demo
const QuantumWalkDemo = () => {
  const [position, setPosition] = useState<number[]>(() => {
    const pos = Array(16).fill(0);
    pos[8] = 1; // Start at center
    return pos;
  });
  const [coinState, setCoinState] = useState<[number, number]>([1 / Math.SQRT2, 1 / Math.SQRT2]);
  const [steps, setSteps] = useState(0);

  const step = useCallback(() => {
    // Quantum walk: apply coin flip then shift
    const newPos = Array(16).fill(0);
    
    for (let i = 0; i < 16; i++) {
      if (position[i] === 0) continue;
      
      // Hadamard on coin
      const c0 = coinState[0];
      const c1 = coinState[1];
      const newC0 = (c0 + c1) / Math.SQRT2;
      const newC1 = (c0 - c1) / Math.SQRT2;
      
      // Shift based on coin state
      const leftIdx = (i - 1 + 16) % 16;
      const rightIdx = (i + 1) % 16;
      
      newPos[leftIdx] += position[i] * newC0 * newC0;
      newPos[rightIdx] += position[i] * newC1 * newC1;
      
      setCoinState([newC0, newC1]);
    }
    
    // Normalize
    const norm = Math.sqrt(newPos.reduce((s, v) => s + v * v, 0)) || 1;
    setPosition(newPos.map(v => v / norm));
    setSteps(s => s + 1);
  }, [position, coinState]);

  const reset = useCallback(() => {
    const pos = Array(16).fill(0);
    pos[8] = 1;
    setPosition(pos);
    setCoinState([1 / Math.SQRT2, 1 / Math.SQRT2]);
    setSteps(0);
  }, []);

  const runMany = useCallback(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => step(), i * 200);
    }
  }, [step]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Footprints className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Quantum Walk</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        A quantum random walk spreads faster than classical due to interference. Watch the probability distribution evolve.
      </p>
      
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-2">Position Probability Distribution (Step {steps})</p>
          <div className="flex gap-0.5 h-24 items-end">
            {position.map((p, i) => (
              <div 
                key={i} 
                className="flex-1 bg-primary rounded-t transition-all duration-300"
                style={{ height: `${Math.max(4, Math.abs(p) * 100)}%`, opacity: 0.3 + Math.abs(p) * 0.7 }}
                title={`Position ${i - 8}: ${(p * p * 100).toFixed(1)}%`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>-8</span>
            <span>0</span>
            <span>+7</span>
          </div>
        </div>
        
        <SedenionVisualizer components={position} animated={false} size="lg" />
        
        <div className="flex gap-2">
          <Button onClick={reset} variant="outline">Reset</Button>
          <Button onClick={step} className="flex-1">
            <Footprints className="w-4 h-4 mr-2" /> Step
          </Button>
          <Button onClick={runMany} variant="outline">×5 Steps</Button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted border border-border text-center">
            <div className="text-2xl font-mono text-primary">{steps}</div>
            <div className="text-xs text-muted-foreground">Steps Taken</div>
          </div>
          <div className="p-3 rounded-lg bg-muted border border-border text-center">
            <div className="text-2xl font-mono text-primary">{computeEntropy(position).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Spread (bits)</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bloch Sphere Visualization
const BlochSphereDemo = () => {
  const [theta, setTheta] = useState(Math.PI / 4);
  const [phi, setPhi] = useState(0);
  
  const state = useMemo(() => {
    // |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩
    const alpha = Math.cos(theta / 2);
    const betaReal = Math.sin(theta / 2) * Math.cos(phi);
    const betaImag = Math.sin(theta / 2) * Math.sin(phi);
    
    // Bloch vector coordinates
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    
    // 8D projection for visualization
    const components = [
      alpha, betaReal, betaImag, 0,
      x * 0.3, y * 0.3, z * 0.3, 0
    ];
    const norm = Math.sqrt(components.reduce((s, v) => s + v * v, 0)) || 1;
    
    return {
      alpha,
      beta: { real: betaReal, imag: betaImag },
      bloch: { x, y, z },
      components: components.map(v => v / norm),
    };
  }, [theta, phi]);

  const presets = [
    { name: '|0⟩', theta: 0, phi: 0 },
    { name: '|1⟩', theta: Math.PI, phi: 0 },
    { name: '|+⟩', theta: Math.PI / 2, phi: 0 },
    { name: '|-⟩', theta: Math.PI / 2, phi: Math.PI },
    { name: '|i⟩', theta: Math.PI / 2, phi: Math.PI / 2 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Circle className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Bloch Sphere</h3>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Any pure qubit state can be represented as a point on the Bloch sphere using angles θ and φ.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">θ (polar): {(theta / Math.PI).toFixed(2)}π</label>
            <Slider value={[theta]} onValueChange={([v]) => setTheta(v)} min={0} max={Math.PI} step={0.05} />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">φ (azimuthal): {(phi / Math.PI).toFixed(2)}π</label>
            <Slider value={[phi]} onValueChange={([v]) => setPhi(v)} min={0} max={2 * Math.PI} step={0.05} />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {presets.map(p => (
              <Button 
                key={p.name} 
                variant="outline" 
                size="sm"
                onClick={() => { setTheta(p.theta); setPhi(p.phi); }}
              >
                {p.name}
              </Button>
            ))}
          </div>
          
          <div className="p-4 rounded-lg bg-muted border border-border space-y-2">
            <p className="text-sm font-medium">State Vector:</p>
            <p className="font-mono text-sm">
              |ψ⟩ = <span className="text-primary">{state.alpha.toFixed(3)}</span>|0⟩ + 
              (<span className="text-cyan-400">{state.beta.real.toFixed(3)}</span> + 
              <span className="text-purple-400">{state.beta.imag.toFixed(3)}</span>i)|1⟩
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Simple Bloch sphere visualization */}
          <div className="aspect-square relative bg-muted/30 rounded-lg border border-border overflow-hidden">
            <svg viewBox="-1.5 -1.5 3 3" className="w-full h-full">
              {/* Sphere outline */}
              <circle cx="0" cy="0" r="1" fill="none" stroke="currentColor" strokeOpacity="0.2" />
              <ellipse cx="0" cy="0" rx="1" ry="0.3" fill="none" stroke="currentColor" strokeOpacity="0.2" />
              
              {/* Axes */}
              <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.02" />
              <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.02" />
              
              {/* Labels */}
              <text x="0" y="-1.15" textAnchor="middle" fontSize="0.15" fill="currentColor">|0⟩</text>
              <text x="0" y="1.25" textAnchor="middle" fontSize="0.15" fill="currentColor">|1⟩</text>
              <text x="1.15" y="0.05" textAnchor="start" fontSize="0.12" fill="currentColor">|+⟩</text>
              <text x="-1.15" y="0.05" textAnchor="end" fontSize="0.12" fill="currentColor">|-⟩</text>
              
              {/* State vector */}
              <line 
                x1="0" y1="0" 
                x2={state.bloch.x} y2={-state.bloch.z}
                stroke="hsl(var(--primary))" 
                strokeWidth="0.04" 
              />
              <circle 
                cx={state.bloch.x} 
                cy={-state.bloch.z} 
                r="0.08" 
                fill="hsl(var(--primary))" 
              />
            </svg>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded bg-red-500/20">
              <div className="text-sm font-mono text-red-400">{state.bloch.x.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">X</div>
            </div>
            <div className="p-2 rounded bg-green-500/20">
              <div className="text-sm font-mono text-green-400">{state.bloch.y.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Y</div>
            </div>
            <div className="p-2 rounded bg-blue-500/20">
              <div className="text-sm font-mono text-blue-400">{state.bloch.z.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground">Z</div>
            </div>
          </div>
          
          <SedenionVisualizer components={state.components} animated={false} size="md" />
        </div>
      </div>
    </div>
  );
};

const examples: ExampleConfig[] = [
  {
    id: 'prime-state',
    number: '1',
    title: 'PrimeState Builder',
    subtitle: 'Quantum-like states from factorization',
    description: 'Build quantum-like superposition states from the prime factorization of integers. Each prime factor becomes a basis state with amplitude proportional to its multiplicity.',
    concepts: ['Prime Factorization', 'Superposition', 'Born Rule', 'Measurement'],
    code: `// Create a PrimeState from a number
const state = createPrimeState(360);
// state.primes = [2, 3, 5]
// state.amplitudes = normalized amplitudes

// Perform Born measurement
const { outcome, probability } = bornMeasurement(state);
console.log(\`Measured |\${outcome}⟩ with p=\${probability}\`);

// Multiple measurements follow the probability distribution
const results = Array.from({ length: 100 }, () => bornMeasurement(state));`,
    codeTitle: 'quantum/01-prime-state.js',
  },
  {
    id: 'resonance-operators',
    number: '2',
    title: 'Resonance Operators',
    subtitle: 'State manipulation',
    description: 'Apply unitary-like operators to transform state vectors. Phase rotation, resonance contraction, and Hadamard mixing demonstrate different aspects of state evolution.',
    concepts: ['Unitary Operators', 'Phase Rotation', 'Hadamard Gate', 'State Evolution'],
    code: `// Initialize a basis state
let components = [1, 0, 0, 0, 0, 0, 0, 0];

// Apply operators
components = applyOperator(components, 'H'); // Hadamard
components = applyOperator(components, 'P'); // Phase
components = applyOperator(components, 'R'); // Resonance

// Measure entropy and coherence
const entropy = computeEntropy(components);
const coherence = computeCoherence(components);

console.log('Entropy:', entropy, 'bits');
console.log('Coherence:', (coherence * 100).toFixed(1), '%');`,
    codeTitle: 'quantum/02-operators.js',
  },
  {
    id: 'superposition',
    number: '3',
    title: 'Superposition & Interference',
    subtitle: 'Wave mechanics',
    description: 'Explore how quantum amplitudes interfere. Two paths with different phases combine constructively or destructively, demonstrating the wave-like nature of quantum states.',
    concepts: ['Superposition', 'Interference', 'Phase', 'Probability Amplitudes'],
    code: `// Two-path interference
const amplitude1 = 0.7;
const amplitude2 = 0.7;
const phase1 = 0;
const phase2 = Math.PI; // Opposite phase

// Complex amplitude addition
const real = amplitude1 * Math.cos(phase1) + amplitude2 * Math.cos(phase2);
const imag = amplitude1 * Math.sin(phase1) + amplitude2 * Math.sin(phase2);

// Probability = |amplitude|²
const probability = real * real + imag * imag;
// With opposite phases: destructive interference → low probability`,
    codeTitle: 'quantum/03-interference.js',
  },
  {
    id: 'collapse',
    number: '4',
    title: 'State Collapse',
    subtitle: 'Measurement dynamics',
    description: 'Witness quantum measurement in action. A superposition state collapses probabilistically to a single basis state, with entropy dropping to zero.',
    concepts: ['Measurement', 'Wave Function Collapse', 'Decoherence', 'Entropy'],
    code: `// Start in uniform superposition
let state = Array(8).fill(1 / Math.sqrt(8));
console.log('Entropy before:', computeEntropy(state)); // ~3 bits

// Measure: collapse to basis state
const probabilities = state.map(a => a * a);
const random = Math.random();
let collapsed = 0;
let sum = 0;
for (let i = 0; i < probabilities.length; i++) {
  sum += probabilities[i];
  if (random <= sum) { collapsed = i; break; }
}

// After collapse: pure state
state = Array(8).fill(0);
state[collapsed] = 1;
console.log('Entropy after:', computeEntropy(state)); // 0 bits`,
    codeTitle: 'quantum/04-collapse.js',
  },
  {
    id: 'entanglement',
    number: '5',
    title: 'Entanglement Simulation',
    subtitle: 'Correlated particles',
    description: 'Simulate quantum entanglement where measuring one particle instantly determines the state of another. Observe how entangled particles show perfect correlations.',
    concepts: ['Entanglement', 'Bell States', 'Non-locality', 'Correlation'],
    code: `// Create Bell state: (|00⟩ + |11⟩) / √2
const bellState = {
  particleA: [1/Math.SQRT2, 0, 0, 1/Math.SQRT2],
  particleB: [1/Math.SQRT2, 0, 0, 1/Math.SQRT2],
  entangled: true
};

// When entangled, measurements are correlated
function measureBoth(state) {
  const outcome = Math.random() < 0.5 ? 0 : 3;
  return {
    a: outcome,  // If A measures |0⟩
    b: outcome   // B also measures |0⟩ (100% correlation)
  };
}`,
    codeTitle: 'quantum/05-entanglement.js',
  },
  {
    id: 'quantum-walk',
    number: '6',
    title: 'Quantum Walk',
    subtitle: 'Faster spreading',
    description: 'A quantum random walk spreads quadratically faster than classical due to interference effects. Watch the probability distribution evolve with each step.',
    concepts: ['Quantum Walk', 'Interference', 'Spreading', 'Coin Operator'],
    code: `// Initialize walker at origin
let position = Array(16).fill(0);
position[8] = 1; // Start at center

// Coin state: superposition of left/right
let coin = [1/Math.SQRT2, 1/Math.SQRT2];

function step() {
  // Apply Hadamard to coin
  const [c0, c1] = coin;
  coin = [(c0 + c1) / Math.SQRT2, (c0 - c1) / Math.SQRT2];
  
  // Shift position based on coin
  // Left if coin=0, right if coin=1
  // Results in interference pattern
}`,
    codeTitle: 'quantum/06-walk.js',
  },
  {
    id: 'bloch-sphere',
    number: '7',
    title: 'Bloch Sphere',
    subtitle: 'Qubit geometry',
    description: 'Visualize any pure qubit state as a point on the Bloch sphere. Adjust the polar angle θ and azimuthal angle φ to explore the full state space.',
    concepts: ['Bloch Sphere', 'Qubit', 'State Geometry', 'Polar Coordinates'],
    code: `// Any qubit state can be written as:
// |ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩

function qubitState(theta, phi) {
  const alpha = Math.cos(theta / 2);
  const beta = {
    real: Math.sin(theta / 2) * Math.cos(phi),
    imag: Math.sin(theta / 2) * Math.sin(phi)
  };
  
  // Bloch vector coordinates
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);
  
  return { alpha, beta, bloch: { x, y, z } };
}`,
    codeTitle: 'quantum/07-bloch.js',
  },
];

const exampleComponents: Record<string, React.FC> = {
  'prime-state': PrimeStateDemo,
  'resonance-operators': ResonanceOperatorDemo,
  'superposition': SuperpositionDemo,
  'collapse': CollapseDemo,
  'entanglement': EntanglementDemo,
  'quantum-walk': QuantumWalkDemo,
  'bloch-sphere': BlochSphereDemo,
};

const QuantumExamplesPage = () => {
  return (
    <ExamplePageWrapper
      category="Quantum"
      title="Quantum State Examples"
      description="Interactive demos for PrimeState construction and ResonanceOperators. Explore quantum-like state building and Born measurements."
      examples={examples}
      exampleComponents={exampleComponents}
      previousSection={{ title: 'Enochian', path: '/enochian' }}
      nextSection={{ title: 'Quickstart', path: '/quickstart' }}
    />
  );
};

export default QuantumExamplesPage;
