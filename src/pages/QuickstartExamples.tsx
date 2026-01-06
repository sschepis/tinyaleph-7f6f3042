import { useState, useCallback } from 'react';
import { Play, Hash, Shuffle } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SedenionVisualizer from '../components/SedenionVisualizer';
import {
  SemanticBackend,
  hash,
  Hypercomplex,
} from '@aleph-ai/tinyaleph';
import { minimalConfig } from '@/lib/tinyaleph-config';

// Example 1: Hello World - Minimal semantic encoding
const HelloWorldExample = () => {
  const [input, setInput] = useState('What is love?');
  const [result, setResult] = useState<{
    input: string;
    tokens: string[];
    primes: number[];
    entropy: number;
    output: string;
  } | null>(null);
  const [backend] = useState(() => new SemanticBackend(minimalConfig));

  const run = useCallback(() => {
    try {
      const tokens = backend.tokenize(input, true);
      const primes = backend.encode(input);
      const state = backend.primesToState(primes);
      const decoded = backend.decode(primes);
      
      setResult({
        input,
        tokens: tokens.map((t: any) => t.word),
        primes,
        entropy: state.entropy(),
        output: decoded,
      });
    } catch (e) {
      console.error(e);
    }
  }, [input, backend]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">01</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Hello Semantic World</h3>
            <p className="text-sm text-muted-foreground">Minimal example: encode text → get semantic state</p>
          </div>
        </div>
        
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
            placeholder="Enter a question..."
          />
          <button
            onClick={run}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Play className="w-4 h-4" /> Run
          </button>
        </div>

        {result && (
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Tokens</p>
                <p className="font-mono text-primary">{result.tokens.join(', ')}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Prime Signature</p>
                <p className="font-mono text-primary text-sm">[{result.primes.slice(0, 8).join(', ')}{result.primes.length > 8 ? '...' : ''}]</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">State Entropy</p>
                <p className="font-mono text-2xl text-primary">{result.entropy.toFixed(3)} <span className="text-sm">bits</span></p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Decoded Output</p>
                <p className="font-mono text-primary">{result.output}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

const backend = new SemanticBackend(config);

// Tokenize and filter stop words
const tokens = backend.tokenize('${input}', true);

// Encode to prime signature
const primes = backend.encode('${input}');

// Convert to hypercomplex state
const state = backend.primesToState(primes);

console.log('Entropy:', state.entropy());
console.log('Decoded:', backend.decode(primes));`}
        language="javascript"
        title="01-hello-world.js"
      />
    </div>
  );
};

// Example 2: Basic Hashing
const BasicHashExample = () => {
  const [input, setInput] = useState('my secret password');
  const [dimension, setDimension] = useState(32);
  const [hashResult, setHashResult] = useState<string | null>(null);

  const run = useCallback(() => {
    try {
      const h = hash(input, dimension);
      setHashResult(h);
    } catch (e) {
      console.error(e);
    }
  }, [input, dimension]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">02</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Basic Hashing</h3>
            <p className="text-sm text-muted-foreground">Hash a password/message in 3 lines</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
              placeholder="Enter text to hash..."
            />
          </div>
          <div className="flex gap-2">
            <select
              value={dimension}
              onChange={(e) => setDimension(Number(e.target.value))}
              className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground"
            >
              <option value={16}>16D</option>
              <option value={32}>32D</option>
              <option value={64}>64D</option>
            </select>
            <button
              onClick={run}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Hash className="w-4 h-4" /> Hash
            </button>
          </div>
        </div>

        {hashResult && (
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs text-muted-foreground mb-2">Hash Output ({dimension}D)</p>
            <code className="text-sm font-mono text-primary break-all block">{hashResult}</code>
          </div>
        )}
      </div>

      <CodeBlock
        code={`import { hash } from '@aleph-ai/tinyaleph';

// Hash any string to a semantic hash
const h = hash('${input}', ${dimension});
console.log(h);

// Hashes are deterministic:
// hash('hello') === hash('hello')  // true

// Similar meanings → similar hashes:
// hash('love') is close to hash('affection')`}
        language="javascript"
        title="02-basic-hash.js"
      />
    </div>
  );
};

// Example 3: Quantum Coin Flip
const QuantumCoinExample = () => {
  const [state, setState] = useState<Hypercomplex | null>(null);
  const [measurement, setMeasurement] = useState<'heads' | 'tails' | null>(null);
  const [history, setHistory] = useState<('heads' | 'tails')[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const createSuperposition = useCallback(() => {
    // Create |+⟩ = (|0⟩ + |1⟩)/√2 superposition
    const psi = new Hypercomplex(16);
    const norm = 1 / Math.sqrt(2);
    (psi as any).c[0] = norm; // |0⟩ = heads
    (psi as any).c[1] = norm; // |1⟩ = tails
    setState(psi);
    setMeasurement(null);
    setCollapsed(false);
  }, []);

  const measure = useCallback(() => {
    if (!state) return;
    
    // Born rule measurement - probability from amplitudes
    const c = (state as any).c;
    const probHeads = c[0] * c[0] / (c[0] * c[0] + c[1] * c[1]);
    const result = Math.random() < probHeads ? 'heads' : 'tails';
    
    setMeasurement(result);
    setCollapsed(true);
    setHistory(prev => [...prev.slice(-19), result]);
    
    // Collapse state
    const collapsed = new Hypercomplex(16);
    (collapsed as any).c[result === 'heads' ? 0 : 1] = 1;
    setState(collapsed);
  }, [state]);

  const headsCount = history.filter(h => h === 'heads').length;
  const tailsCount = history.length - headsCount;

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold">03</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Quantum Coin Flip</h3>
            <p className="text-sm text-muted-foreground">Create superposition, measure, see true randomness</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={createSuperposition}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Shuffle className="w-4 h-4" /> Prepare |+⟩
              </button>
              <button
                onClick={measure}
                disabled={!state || collapsed}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> Measure
              </button>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">State:</span>
                <span className="text-primary">
                  {!state ? '∅' : collapsed 
                    ? (measurement === 'heads' ? '|0⟩' : '|1⟩')
                    : '(|0⟩ + |1⟩)/√2'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Collapsed:</span>
                <span className={collapsed ? 'text-accent' : 'text-muted-foreground'}>
                  {collapsed ? 'Yes' : 'No'}
                </span>
              </div>
              {measurement && (
                <div className="flex justify-between items-center pt-2 border-t border-border">
                  <span className="text-muted-foreground">Result:</span>
                  <span className="text-2xl">{measurement === 'heads' ? '🪙' : '🔴'} {measurement.toUpperCase()}</span>
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Statistics ({history.length} flips)</p>
                <div className="flex gap-4">
                  <div>
                    <span className="text-muted-foreground">Heads:</span>
                    <span className="ml-2 font-mono text-primary">{headsCount} ({(headsCount/history.length*100).toFixed(0)}%)</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tails:</span>
                    <span className="ml-2 font-mono text-primary">{tailsCount} ({(tailsCount/history.length*100).toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center">
            {state && (
              <SedenionVisualizer 
                components={(() => {
                  const c = (state as any).c;
                  if (!c || !Array.isArray(c)) {
                    return Array(16).fill(0);
                  }
                  return c.slice(0, 16).map((val: number) => {
                    const n = Math.abs(val);
                    return Number.isFinite(n) ? n : 0;
                  });
                })()}
                animated={!collapsed}
                size="lg"
              />
            )}
          </div>
        </div>
      </div>

      <CodeBlock
        code={`import { Hypercomplex } from '@aleph-ai/tinyaleph';

// Create superposition: |+⟩ = (|0⟩ + |1⟩)/√2
const psi = new Hypercomplex(16);
psi.c[0] = 1 / Math.sqrt(2);  // |0⟩ amplitude
psi.c[1] = 1 / Math.sqrt(2);  // |1⟩ amplitude

// Born rule measurement
const probHeads = psi.c[0] ** 2;
const probTails = psi.c[1] ** 2;

// Measure (collapse wavefunction)
const result = Math.random() < probHeads ? 'heads' : 'tails';

// State collapses to |0⟩ or |1⟩
psi.c[0] = result === 'heads' ? 1 : 0;
psi.c[1] = result === 'tails' ? 1 : 0;`}
        language="javascript"
        title="03-quantum-coin.js"
      />
    </div>
  );
};

const QuickstartExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline text-sm">← Back to Examples</a>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Quickstart Examples</h1>
          <p className="text-muted-foreground">
            Simple, copy-paste examples to get you started immediately with TinyAleph.
          </p>
        </div>

        <div className="space-y-12">
          <HelloWorldExample />
          <BasicHashExample />
          <QuantumCoinExample />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default QuickstartExamplesPage;
