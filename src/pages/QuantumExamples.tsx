import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import SedenionVisualizer from '../components/SedenionVisualizer';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import { Play, Dice1, Atom, Waves } from 'lucide-react';

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

  const resetState = useCallback((type: 'uniform' | 'basis' | 'random') => {
    let newComponents: number[];
    switch (type) {
      case 'uniform':
        newComponents = Array(dims).fill(1 / Math.sqrt(dims));
        break;
      case 'basis':
        newComponents = Array(dims).fill(0);
        newComponents[0] = 1;
        break;
      case 'random':
        newComponents = Array(dims).fill(0).map(() => Math.random() - 0.5);
        const norm = Math.sqrt(newComponents.reduce((s, v) => s + v * v, 0));
        newComponents = newComponents.map(v => v / norm);
        break;
      default:
        newComponents = Array(dims).fill(0);
        newComponents[0] = 1;
    }
    setComponents(newComponents);
    setHistory([]);
  }, [dims]);

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
            <Button onClick={() => resetState('random')} variant="outline" size="sm">Random</Button>
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
];

const exampleComponents: Record<string, React.FC> = {
  'prime-state': PrimeStateDemo,
  'resonance-operators': ResonanceOperatorDemo,
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
