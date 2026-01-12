/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { Play, Hash, Shuffle } from 'lucide-react';
import SedenionVisualizer from '../components/SedenionVisualizer';
import { Button } from '@/components/ui/button';
import ExamplePageWrapper, { ExampleConfig } from '../components/ExamplePageWrapper';
import {
  SemanticBackend,
  hash,
  Hypercomplex,
} from '@aleph-ai/tinyaleph';
import { minimalConfig } from '@/lib/tinyaleph-config';

// Example metadata with descriptions
const examples: ExampleConfig[] = [
  {
    id: 'hello-world',
    number: '01',
    title: 'Hello Semantic World',
    subtitle: 'Your First Semantic Encoding',
    description: 'Learn the fundamental building blocks of TinyAleph. This example shows how to take natural language text and convert it into a mathematical representation using prime numbers and hypercomplex states. The semantic backend tokenizes your input, encodes each token as a prime number, then projects everything into a 16-dimensional sedenion space where meaning can be measured mathematically.',
    concepts: ['Tokenization', 'Prime Encoding', 'Sedenion States', 'Entropy'],
    code: `import { SemanticBackend } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

const backend = new SemanticBackend(config);

// Tokenize and filter stop words
const tokens = backend.tokenize('What is love?', true);

// Encode to prime signature
const primes = backend.encode('What is love?');

// Convert to hypercomplex state
const state = backend.primesToState(primes);

console.log('Entropy:', state.entropy());
console.log('Decoded:', backend.decode(primes));`,
    codeTitle: '01-hello-world.js',
  },
  {
    id: 'basic-hash',
    number: '02',
    title: 'Basic Hashing',
    subtitle: 'Semantic-Aware Cryptographic Hashing',
    description: "Traditional hashes treat input as meaningless bytes. TinyAleph's hash function is semantic-aware: similar meanings produce similar hash prefixes while maintaining cryptographic properties. This makes it useful for both security applications and semantic similarity detection. Choose from 16D, 32D, or 64D output dimensions based on your collision resistance needs.",
    concepts: ['Cryptographic Hashing', 'Semantic Similarity', 'Determinism'],
    code: `import { hash } from '@aleph-ai/tinyaleph';

// Hash any string to a semantic hash
const h = hash('my secret password', 32);
console.log(h);

// Hashes are deterministic:
// hash('hello') === hash('hello')  // true

// Similar meanings → similar hashes:
// hash('love') is close to hash('affection')`,
    codeTitle: '02-basic-hash.js',
  },
  {
    id: 'quantum-coin',
    number: '03',
    title: 'Quantum Coin Flip',
    subtitle: 'Superposition & Measurement',
    description: 'Experience quantum mechanics in action. This demo creates a quantum superposition state |+⟩ = (|0⟩ + |1⟩)/√2 where the coin exists as both heads AND tails simultaneously. When you measure, the wavefunction collapses according to the Born rule, giving truly random results. Watch the statistics converge to 50/50 over many flips—a hallmark of quantum randomness.',
    concepts: ['Superposition', 'Born Rule', 'Wavefunction Collapse', 'Quantum Randomness'],
    code: `import { Hypercomplex } from '@aleph-ai/tinyaleph';

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
psi.c[1] = result === 'tails' ? 1 : 0;`,
    codeTitle: '03-quantum-coin.js',
  },
];

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
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
          placeholder="Enter a question..."
        />
        <Button onClick={run} className="gap-2">
          <Play className="w-4 h-4" /> Run
        </Button>
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
          <Button onClick={run} className="gap-2">
            <Hash className="w-4 h-4" /> Hash
          </Button>
        </div>
      </div>

      {hashResult && (
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-xs text-muted-foreground mb-2">Hash Output ({dimension}D)</p>
          <code className="text-sm font-mono text-primary break-all block">{hashResult}</code>
        </div>
      )}
    </div>
  );
};

// Example 3: Quantum Coin Flip
const QuantumCoinExample = () => {
  const [state, setState] = useState<InstanceType<typeof Hypercomplex> | null>(null);
  const [measurement, setMeasurement] = useState<'heads' | 'tails' | null>(null);
  const [history, setHistory] = useState<('heads' | 'tails')[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const createSuperposition = useCallback(() => {
    const psi = new Hypercomplex(16);
    const norm = 1 / Math.sqrt(2);
    (psi as any).c[0] = norm;
    (psi as any).c[1] = norm;
    setState(psi);
    setMeasurement(null);
    setCollapsed(false);
  }, []);

  const measure = useCallback(() => {
    if (!state) return;
    
    const c = (state as any).c;
    const probHeads = c[0] * c[0] / (c[0] * c[0] + c[1] * c[1]);
    const result = Math.random() < probHeads ? 'heads' : 'tails';
    
    setMeasurement(result);
    setCollapsed(true);
    setHistory(prev => [...prev.slice(-19), result]);
    
    const collapsedState = new Hypercomplex(16);
    (collapsedState as any).c[result === 'heads' ? 0 : 1] = 1;
    setState(collapsedState);
  }, [state]);

  const headsCount = history.filter(h => h === 'heads').length;
  const tailsCount = history.length - headsCount;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="secondary" onClick={createSuperposition} className="gap-2">
              <Shuffle className="w-4 h-4" /> Prepare |+⟩
            </Button>
            <Button onClick={measure} disabled={!state || collapsed} className="gap-2">
              <Play className="w-4 h-4" /> Measure
            </Button>
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
  );
};

// Map example IDs to components
const exampleComponents: Record<string, React.FC> = {
  'hello-world': HelloWorldExample,
  'basic-hash': BasicHashExample,
  'quantum-coin': QuantumCoinExample,
};

const QuickstartExamplesPage = () => {
  return (
    <ExamplePageWrapper
      category="Getting Started"
      title="Quickstart Examples"
      description="Simple, copy-paste examples to get you started immediately with TinyAleph."
      examples={examples}
      exampleComponents={exampleComponents}
      nextSection={{ title: 'Semantic Examples', path: '/semantic' }}
    />
  );
};

export default QuickstartExamplesPage;
