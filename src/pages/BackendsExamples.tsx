import { useState, useCallback } from 'react';
import { Play, RefreshCw, Hash } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import {
  SemanticBackend,
  hash,
} from '@aleph-ai/tinyaleph';
// @ts-ignore
import config from '@aleph-ai/tinyaleph/data.json';

const SemanticExample = () => {
  const [input, setInput] = useState('love and wisdom');
  const [result, setResult] = useState<{
    tokens: any[];
    primes: number[];
    entropy: number;
    stateComponents: number[];
  } | null>(null);
  const [backend] = useState(() => new SemanticBackend(config));

  const runEncode = useCallback(() => {
    try {
      const tokens = backend.tokenize(input, true);
      const primes = backend.encode(input);
      const state = backend.primesToState(primes);
      
      setResult({
        tokens,
        primes,
        entropy: state.entropy(),
        stateComponents: state.components?.slice(0, 16) || (state as any).c?.slice(0, 16) || [],
      });
    } catch (e) {
      console.error(e);
    }
  }, [input, backend]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Semantic Encoding</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
              placeholder="Enter text to encode..."
            />
            <button
              onClick={runEncode}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Play className="w-4 h-4" /> Encode
            </button>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Tokens</h4>
                <div className="flex flex-wrap gap-2">
                  {result.tokens.map((token, i) => (
                    <span 
                      key={i}
                      className={`px-3 py-1 rounded-full text-sm font-mono ${
                        token.known 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {token.word}
                      {token.known && token.primes?.length > 0 && (
                        <span className="ml-1 text-xs opacity-60">
                          [{token.primes.slice(0, 3).join(',')}...]
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Prime Encoding</h4>
                <div className="flex flex-wrap gap-2">
                  {result.primes.slice(0, 20).map((p, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 rounded bg-primary/20 text-primary font-mono text-sm"
                    >
                      {p}
                    </span>
                  ))}
                  {result.primes.length > 20 && (
                    <span className="text-muted-foreground text-sm">
                      ...+{result.primes.length - 20} more
                    </span>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">State Entropy</h4>
                  <p className="text-2xl font-mono text-primary">{result.entropy.toFixed(4)} bits</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Prime Count</h4>
                  <p className="text-2xl font-mono text-primary">{result.primes.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

const backend = new SemanticBackend(config);

// Tokenize text (with stop word filtering)
const tokens = backend.tokenize('${input}', true);
console.log(tokens);

// Encode to prime signature
const primes = backend.encode('${input}');
console.log('Primes:', primes);

// Convert to hypercomplex state
const state = backend.primesToState(primes);
console.log('Entropy:', state.entropy());

// Compare concepts via coherence
const state1 = backend.primesToState(backend.encode('love'));
const state2 = backend.primesToState(backend.encode('wisdom'));
console.log('Coherence:', state1.coherence(state2));`}
        language="javascript"
        title="semantic-example.js"
      />
    </div>
  );
};

const HashingExample = () => {
  const [input, setInput] = useState('secret message');
  const [hashResult, setHashResult] = useState<string | null>(null);
  const [compareInputs, setCompareInputs] = useState(['love', 'loving', 'hate']);
  const [compareResults, setCompareResults] = useState<string[]>([]);

  const runHash = useCallback(() => {
    try {
      const h = hash(input, 32);
      setHashResult(h);
    } catch (e) {
      console.error(e);
    }
  }, [input]);

  const runCompare = useCallback(() => {
    try {
      const results = compareInputs.map(text => hash(text, 32));
      setCompareResults(results);
    } catch (e) {
      console.error(e);
    }
  }, [compareInputs]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold mb-4">Cryptographic Hashing</h3>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
              placeholder="Enter text to hash..."
            />
            <button
              onClick={runHash}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Hash className="w-4 h-4" /> Hash
            </button>
          </div>

          {hashResult && (
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Hash Output</h4>
              <code className="text-sm font-mono text-primary break-all">{hashResult}</code>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium mb-4">Semantic Similarity Demo</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Similar meanings produce similar hashes. Compare these words:
          </p>
          
          <div className="flex gap-2 mb-4">
            {compareInputs.map((text, i) => (
              <input
                key={i}
                type="text"
                value={text}
                onChange={(e) => {
                  const newInputs = [...compareInputs];
                  newInputs[i] = e.target.value;
                  setCompareInputs(newInputs);
                }}
                className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
              />
            ))}
            <button
              onClick={runCompare}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-primary/20 transition-colors"
            >
              Compare
            </button>
          </div>

          {compareResults.length > 0 && (
            <div className="space-y-2">
              {compareResults.map((h, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-16 font-mono text-sm">{compareInputs[i]}</span>
                  <code className="text-xs font-mono text-muted-foreground flex-1 truncate">
                    {h}
                  </code>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CodeBlock
        code={`import { hash, deriveKey, CryptographicBackend } from '@aleph-ai/tinyaleph';

// Quick semantic hash
const h = hash('${input}', 32);
console.log(h);

// Key derivation
const key = deriveKey('password', 'salt', 32, 10000);
console.log(key);

// Full backend for more control
const backend = new CryptographicBackend({ dimension: 32 });
const semanticHash = backend.hash('similar meanings → similar hashes');`}
        language="javascript"
        title="crypto-example.js"
      />
    </div>
  );
};

const BackendsExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline text-sm">← Back to Examples</a>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Backends Module</h1>
          <p className="text-muted-foreground">
            Interactive examples of semantic and cryptographic backends.
          </p>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">1</span>
              Semantic Encoding
            </h2>
            <SemanticExample />
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-mono text-sm">2</span>
              Cryptographic Hashing
            </h2>
            <HashingExample />
          </section>
        </div>
      </div>
    </div>
  );
};

export default BackendsExamplesPage;
