import { useState, useCallback } from 'react';
import { Play, RefreshCw } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import SedenionVisualizer from '../components/SedenionVisualizer';
import {
  Hypercomplex,
  isPrime,
  factorize,
  primesUpTo,
  nthPrime,
} from '@aleph-ai/tinyaleph';

const HypercomplexExample = () => {
  const [dim, setDim] = useState(16);
  const [components, setComponents] = useState<number[]>(() => {
    const c = new Array(16).fill(0);
    c[0] = 1;
    return c;
  });
  const [result, setResult] = useState<{
    norm: number;
    entropy: number;
    dominantAxes: { i: number; v: number }[];
  } | null>(null);
  const [multiplyResult, setMultiplyResult] = useState<number[] | null>(null);

  const runExample = useCallback(() => {
    // Create state using the constructor and manually set components
    const state = new Hypercomplex(dim);
    components.slice(0, dim).forEach((c, i) => {
      (state as any).c[i] = c;
    });
    
    setResult({
      norm: state.norm(),
      entropy: state.entropy(),
      dominantAxes: (state as any).dominantAxes ? (state as any).dominantAxes(3) : 
        components.map((v, i) => ({ i, v: Math.abs(v) }))
          .sort((a, b) => b.v - a.v)
          .slice(0, 3),
    });
  }, [components, dim]);

  const runMultiply = useCallback(() => {
    // Create two basis states and multiply them (non-commutative!)
    const e1 = new Hypercomplex(dim);
    (e1 as any).c[1] = 1;
    const e2 = new Hypercomplex(dim);
    (e2 as any).c[2] = 1;
    const product = e1.multiply(e2);
    setMultiplyResult([...(product as any).c]);
  }, [dim]);

  const randomize = useCallback(() => {
    const newComponents = Array.from({ length: dim }, () => Math.random() * 2 - 1);
    setComponents(newComponents);
  }, [dim]);

  const setBasis = useCallback((index: number) => {
    const newComponents = new Array(dim).fill(0);
    newComponents[index] = 1;
    setComponents(newComponents);
  }, [dim]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Hypercomplex State</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Dimension</label>
              <select
                value={dim}
                onChange={(e) => {
                  const newDim = Number(e.target.value);
                  setDim(newDim);
                  const newC = new Array(newDim).fill(0);
                  newC[0] = 1;
                  setComponents(newC);
                }}
                className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
              >
                <option value={4}>4 (Quaternion)</option>
                <option value={8}>8 (Octonion)</option>
                <option value={16}>16 (Sedenion)</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Quick Set</label>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3].map(i => (
                  <button
                    key={i}
                    onClick={() => setBasis(i)}
                    className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm font-mono transition-colors"
                  >
                    e{i}
                  </button>
                ))}
                <button
                  onClick={randomize}
                  className="px-3 py-1 rounded-md bg-secondary hover:bg-primary/20 text-sm transition-colors flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Random
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={runExample}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Play className="w-4 h-4" /> Compute
              </button>
              <button
                onClick={runMultiply}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                Multiply e₁ × e₂
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-muted/30">
            <SedenionVisualizer 
              components={components.slice(0, 16).map(c => Math.abs(c))}
              animated={false}
              size="lg"
            />
            <p className="text-xs text-muted-foreground mt-3 font-mono">
              {dim}D State
            </p>
          </div>
        </div>

        {result && (
          <div className="mt-6 p-4 rounded-lg bg-muted/50 font-mono text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Norm:</span>
              <span className="text-primary">{result.norm.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entropy:</span>
              <span className="text-primary">{result.entropy.toFixed(6)} bits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dominant Axes:</span>
              <span className="text-primary">
                {result.dominantAxes.map(a => `e${a.i}`).join(', ')}
              </span>
            </div>
          </div>
        )}

        {multiplyResult && (
          <div className="mt-4 p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-primary mb-2">e₁ × e₂ = </p>
            <code className="text-xs font-mono text-muted-foreground block overflow-x-auto">
              [{multiplyResult.map((c, i) => c !== 0 ? `${c > 0 ? '+' : ''}${c.toFixed(1)}e${i}` : '').filter(Boolean).join(' ') || '0'}]
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              Non-commutative: e₁ × e₂ ≠ e₂ × e₁
            </p>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { Hypercomplex } from '@aleph-ai/tinyaleph';

// Create a 16D sedenion state
const state = new Hypercomplex(16);
state.c[0] = 1;  // Set first component

// Compute properties
console.log('Norm:', state.norm());
console.log('Entropy:', state.entropy());

// Non-commutative multiplication
const e1 = new Hypercomplex(16);
e1.c[1] = 1;
const e2 = new Hypercomplex(16);
e2.c[2] = 1;

const product = e1.multiply(e2);
// e1 * e2 ≠ e2 * e1 (non-commutative!)`}
        language="javascript"
        title="hypercomplex-example.js"
      />
    </div>
  );
};

const PrimeExample = () => {
  const [input, setInput] = useState(60);
  const [primeResult, setPrimeResult] = useState<{
    isPrime: boolean;
    factors: number[];
    primesBelow: number[];
    nthPrime: number;
  } | null>(null);

  const runPrimeAnalysis = useCallback(() => {
    const n = Math.min(Math.max(2, input), 10000);
    const factorResult = factorize(n) as any;
    // Handle both array and Map return types
    let factors: number[];
    if (Array.isArray(factorResult)) {
      factors = factorResult;
    } else if (factorResult && typeof factorResult.entries === 'function') {
      factors = Array.from(factorResult.entries()).flatMap(([prime, exp]: [number, number]) => Array(exp).fill(prime));
    } else {
      factors = [n];
    }
    setPrimeResult({
      isPrime: isPrime(n),
      factors,
      primesBelow: primesUpTo(Math.min(n, 200)),
      nthPrime: nthPrime(Math.min(n, 100)),
    });
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Prime Analysis</h3>
        
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            value={input}
            onChange={(e) => setInput(Number(e.target.value))}
            className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono"
            placeholder="Enter a number"
            min={2}
            max={10000}
          />
          <button
            onClick={runPrimeAnalysis}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Analyze
          </button>
        </div>

        {primeResult && (
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Is Prime?</span>
                  <p className={`font-mono font-bold ${primeResult.isPrime ? 'text-primary' : 'text-destructive'}`}>
                    {primeResult.isPrime ? 'Yes ✓' : 'No ✗'}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">nth Prime (n={Math.min(input, 100)})</span>
                  <p className="font-mono text-primary">{primeResult.nthPrime}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Prime Factorization:</span>
              <p className="font-mono text-lg mt-1">
                {input} = {primeResult.factors.join(' × ')}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Primes below {Math.min(input, 200)}:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {primeResult.primesBelow.slice(0, 30).map(p => (
                  <span key={p} className="px-2 py-1 rounded bg-primary/20 text-primary font-mono text-sm">
                    {p}
                  </span>
                ))}
                {primeResult.primesBelow.length > 30 && (
                  <span className="px-2 py-1 text-muted-foreground text-sm">
                    ...+{primeResult.primesBelow.length - 30} more
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { isPrime, factorize, primesUpTo, nthPrime } from '@aleph-ai/tinyaleph';

const n = ${input};

// Check if prime
console.log(isPrime(n));  // ${isPrime(Math.min(input, 10000))}

// Get prime factorization (returns Map of prime -> exponent)
console.log(factorize(n));  // Map { prime -> exponent }

// Get all primes up to n
console.log(primesUpTo(n));  // [2, 3, 5, 7, ...]

// Get the nth prime
console.log(nthPrime(10));  // 29`}
        language="javascript"
        title="prime-example.js"
      />
    </div>
  );
};

const CoreExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline text-sm">← Back to Examples</a>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Core Module</h1>
          <p className="text-muted-foreground">
            Interactive examples of hypercomplex algebra and prime utilities.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
              Hypercomplex States (Sedenions)
            </h2>
            <HypercomplexExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">2</span>
              Prime Utilities
            </h2>
            <PrimeExample />
          </section>
        </div>
      </div>
    </div>
  );
};

export default CoreExamplesPage;
