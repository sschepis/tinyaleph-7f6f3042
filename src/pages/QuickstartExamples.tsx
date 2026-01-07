import { useState, useCallback } from 'react';
import { Play, Hash, Shuffle, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import SedenionVisualizer from '../components/SedenionVisualizer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SemanticBackend,
  hash,
  Hypercomplex,
} from '@aleph-ai/tinyaleph';
import { minimalConfig } from '@/lib/tinyaleph-config';

// Example metadata with descriptions
const examples = [
  {
    id: 'hello-world',
    number: '01',
    title: 'Hello Semantic World',
    subtitle: 'Your First Semantic Encoding',
    description: 'Learn the fundamental building blocks of TinyAleph. This example shows how to take natural language text and convert it into a mathematical representation using prime numbers and hypercomplex states. The semantic backend tokenizes your input, encodes each token as a prime number, then projects everything into a 16-dimensional sedenion space where meaning can be measured mathematically.',
    concepts: ['Tokenization', 'Prime Encoding', 'Sedenion States', 'Entropy'],
  },
  {
    id: 'basic-hash',
    number: '02',
    title: 'Basic Hashing',
    subtitle: 'Semantic-Aware Cryptographic Hashing',
    description: 'Traditional hashes treat input as meaningless bytes. TinyAleph\'s hash function is semantic-aware: similar meanings produce similar hash prefixes while maintaining cryptographic properties. This makes it useful for both security applications and semantic similarity detection. Choose from 16D, 32D, or 64D output dimensions based on your collision resistance needs.',
    concepts: ['Cryptographic Hashing', 'Semantic Similarity', 'Determinism'],
  },
  {
    id: 'quantum-coin',
    number: '03',
    title: 'Quantum Coin Flip',
    subtitle: 'Superposition & Measurement',
    description: 'Experience quantum mechanics in action. This demo creates a quantum superposition state |+⟩ = (|0⟩ + |1⟩)/√2 where the coin exists as both heads AND tails simultaneously. When you measure, the wavefunction collapses according to the Born rule, giving truly random results. Watch the statistics converge to 50/50 over many flips—a hallmark of quantum randomness.',
    concepts: ['Superposition', 'Born Rule', 'Wavefunction Collapse', 'Quantum Randomness'],
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
  const [state, setState] = useState<Hypercomplex | null>(null);
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentExample = examples[currentIndex];
  const ExampleComponent = exampleComponents[currentExample.id];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? examples.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === examples.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="pt-20">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-2">Getting Started</Badge>
          <h1 className="text-3xl font-display font-bold mb-2">Quickstart Examples</h1>
          <p className="text-muted-foreground">
            Simple, copy-paste examples to get you started immediately with TinyAleph.
          </p>
        </div>

        {/* Navigation Pills */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {examples.map((example, index) => (
            <button
              key={example.id}
              onClick={() => setCurrentIndex(index)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all
                ${index === currentIndex 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                }
              `}
            >
              {example.number}. {example.title}
            </button>
          ))}
        </div>

        {/* Example Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentExample.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Example Header Card */}
            <Card className="mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 px-6 py-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">{currentExample.number}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{currentExample.title}</h2>
                    <p className="text-sm text-muted-foreground">{currentExample.subtitle}</p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-4">
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {currentExample.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {currentExample.concepts.map((concept) => (
                    <Badge key={concept} variant="secondary">
                      {concept}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interactive Demo */}
            <Card className="mb-6">
              <div className="px-6 py-3 border-b border-border bg-muted/30">
                <h3 className="font-semibold text-sm">Interactive Demo</h3>
              </div>
              <CardContent className="pt-6">
                <ExampleComponent />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={goToPrevious}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {examples.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="p-1"
              >
                <Circle
                  className={`w-2 h-2 transition-colors ${
                    index === currentIndex 
                      ? 'fill-primary text-primary' 
                      : 'fill-muted text-muted'
                  }`}
                />
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            onClick={goToNext}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickstartExamplesPage;
