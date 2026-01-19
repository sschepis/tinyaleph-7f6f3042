/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from 'react';
import { Play, Hash, Dna, FlaskConical, Brain, AtomIcon, Shield, Sparkles, BookOpen, Zap, ArrowRight } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  hash,
  deriveKey,
} from '@aleph-ai/tinyaleph';
import { minimalConfig } from '@/lib/tinyaleph-config';
import { createBackend } from '@/lib/tinyaleph-engine';
import { AppHelpDialog, HelpButton, useFirstRun } from '@/components/app-help';
import { helpSteps } from '@/components/backends/HelpContent';

// ==========================================
// SEMANTIC BACKEND DEMO
// ==========================================
const SemanticBackendDemo = () => {
  const [input, setInput] = useState('love and wisdom');
  const [result, setResult] = useState<{
    tokens: any[];
    primes: number[];
    entropy: number;
    coherence: number;
    stateComponents: number[];
  } | null>(null);
  const [backend] = useState(() => createBackend(minimalConfig));

  const runEncode = useCallback(() => {
    try {
      const tokens = backend.tokenize(input, true);
      const primes = backend.encode(input);
      const state = backend.primesToState(primes);
      
      setResult({
        tokens,
        primes,
        entropy: state.entropy(),
        coherence: (state as any).coherence?.() ?? 1 - state.entropy() / Math.log2(16),
        stateComponents: state.components?.slice(0, 16) || (state as any).c?.slice(0, 16) || [],
      });
    } catch (e) {
      console.error(e);
    }
  }, [input, backend]);

  const [compareA, setCompareA] = useState('love');
  const [compareB, setCompareB] = useState('affection');
  const [similarity, setSimilarity] = useState<number | null>(null);

  const runCompare = useCallback(() => {
    try {
      const primesA = backend.encode(compareA);
      const primesB = backend.encode(compareB);
      const stateA = backend.primesToState(primesA);
      const stateB = backend.primesToState(primesB);
      const coherence = (stateA as any).coherence?.(stateB) ?? 0;
      setSimilarity(coherence);
    } catch (e) {
      console.error(e);
    }
  }, [compareA, compareB, backend]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">SemanticBackend</h3>
            <p className="text-sm text-muted-foreground">Natural language understanding via prime encoding</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Encoding Demo */}
          <div className="space-y-4">
            <h4 className="font-medium">Text Encoding</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
                placeholder="Enter text to encode..."
              />
              <Button onClick={runEncode} className="gap-2">
                <Play className="w-4 h-4" /> Encode
              </Button>
            </div>

            {result && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">Tokens</h5>
                  <div className="flex flex-wrap gap-1">
                    {result.tokens.map((token, i) => (
                      <span 
                        key={i}
                        className={`px-2 py-0.5 rounded text-xs font-mono ${
                          token.known 
                            ? 'bg-primary/20 text-primary' 
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {token.word}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-muted/50">
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">Prime Signature</h5>
                  <div className="flex flex-wrap gap-1">
                    {result.primes.slice(0, 12).map((p, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-primary/20 text-primary font-mono text-xs">
                        {p}
                      </span>
                    ))}
                    {result.primes.length > 12 && (
                      <span className="text-muted-foreground text-xs">+{result.primes.length - 12}</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Entropy</p>
                    <p className="text-xl font-mono text-primary">{result.entropy.toFixed(3)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">Coherence</p>
                    <p className="text-xl font-mono text-primary">{result.coherence.toFixed(3)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Similarity Demo */}
          <div className="space-y-4">
            <h4 className="font-medium">Semantic Similarity</h4>
            <div className="space-y-2">
              <input
                type="text"
                value={compareA}
                onChange={(e) => setCompareA(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
                placeholder="Word A"
              />
              <input
                type="text"
                value={compareB}
                onChange={(e) => setCompareB(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
                placeholder="Word B"
              />
              <Button onClick={runCompare} variant="secondary" className="w-full gap-2">
                <Sparkles className="w-4 h-4" /> Compare
              </Button>
            </div>

            {similarity !== null && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <p className="text-sm text-muted-foreground mb-1">Coherence</p>
                <p className="text-3xl font-mono text-primary">{similarity.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {similarity > 0.7 ? 'High similarity' : similarity > 0.3 ? 'Moderate' : 'Low similarity'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-primary">tokenize()</h4>
          <p className="text-xs text-muted-foreground">Split text into tokens with vocabulary lookup</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-primary">encode()</h4>
          <p className="text-xs text-muted-foreground">Convert text to prime signature array</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-primary">primesToState()</h4>
          <p className="text-xs text-muted-foreground">Map primes to hypercomplex sedenion</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-primary">coherence()</h4>
          <p className="text-xs text-muted-foreground">Measure semantic similarity between states</p>
        </div>
      </div>

      <CodeBlock
        code={`import { SemanticBackend } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

const backend = new SemanticBackend(config);

// Tokenize text (with stop word filtering)
const tokens = backend.tokenize('love and wisdom', true);
// [{ word: 'love', known: true, primes: [2,3,5] }, ...]

// Encode to prime signature
const primes = backend.encode('love and wisdom');
// [2, 3, 5, 7, 11, 13]

// Convert to hypercomplex state (16D sedenion)
const state = backend.primesToState(primes);
console.log('Entropy:', state.entropy());   // Semantic focus
console.log('Norm:', state.norm());         // State magnitude

// Compare concepts via coherence
const s1 = backend.primesToState(backend.encode('love'));
const s2 = backend.primesToState(backend.encode('affection'));
console.log('Coherence:', s1.coherence(s2)); // ~0.85 (high)`}
        language="javascript"
        title="semantic-backend.js"
      />
    </div>
  );
};

// ==========================================
// CRYPTOGRAPHIC BACKEND DEMO
// ==========================================
const CryptographicBackendDemo = () => {
  const [hashInput, setHashInput] = useState('secret message');
  const [hashResult, setHashResult] = useState<string | null>(null);
  const [compareInputs, setCompareInputs] = useState(['love', 'loving', 'hate']);
  const [compareResults, setCompareResults] = useState<string[]>([]);

  const runHash = useCallback(() => {
    try {
      const h = hash(hashInput, 32);
      setHashResult(h);
    } catch (e) {
      console.error(e);
    }
  }, [hashInput]);

  const runCompare = useCallback(() => {
    try {
      const results = compareInputs.map(text => hash(text, 32));
      setCompareResults(results);
    } catch (e) {
      console.error(e);
    }
  }, [compareInputs]);

  const [keyInput, setKeyInput] = useState('password123');
  const [keySalt, setKeySalt] = useState('random-salt');
  const [keyResult, setKeyResult] = useState<string | null>(null);

  const runDeriveKey = useCallback(() => {
    try {
      const key = deriveKey(keyInput, keySalt, 32, 10000);
      // deriveKey may return a state object or string
      const keyStr = typeof key === 'string' ? key : JSON.stringify((key as any).components?.slice(0, 8) ?? key);
      setKeyResult(keyStr);
    } catch (e) {
      console.error(e);
    }
  }, [keyInput, keySalt]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">CryptographicBackend</h3>
            <p className="text-sm text-muted-foreground">Semantic-aware hashing & key derivation</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Hash Demo */}
          <div className="space-y-4">
            <h4 className="font-medium">Semantic Hash</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={hashInput}
                onChange={(e) => setHashInput(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
                placeholder="Enter text to hash..."
              />
              <Button onClick={runHash} variant="secondary" className="gap-2">
                <Hash className="w-4 h-4" /> Hash
              </Button>
            </div>

            {hashResult && (
              <div className="p-3 rounded-lg bg-muted/50">
                <h5 className="text-xs font-medium text-muted-foreground mb-2">Hash Output</h5>
                <code className="text-xs font-mono text-primary break-all">{hashResult}</code>
              </div>
            )}

            <div className="pt-4 border-t border-border">
              <h5 className="text-sm font-medium mb-3">Semantic Similarity in Hashes</h5>
              <p className="text-xs text-muted-foreground mb-3">Similar meanings produce similar hashes:</p>
              <div className="flex gap-2 mb-3">
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
                    className="flex-1 px-2 py-1 rounded bg-secondary border border-border text-foreground text-sm"
                  />
                ))}
                <Button onClick={runCompare} size="sm" variant="outline">Compare</Button>
              </div>
              {compareResults.length > 0 && (
                <div className="space-y-1">
                  {compareResults.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-14 font-mono text-xs">{compareInputs[i]}</span>
                      <code className="text-[10px] font-mono text-muted-foreground truncate flex-1">{h}</code>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Key Derivation Demo */}
          <div className="space-y-4">
            <h4 className="font-medium">Key Derivation</h4>
            <div className="space-y-2">
              <input
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
                placeholder="Password"
              />
              <input
                type="text"
                value={keySalt}
                onChange={(e) => setKeySalt(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
                placeholder="Salt"
              />
              <Button onClick={runDeriveKey} variant="secondary" className="w-full gap-2">
                <Zap className="w-4 h-4" /> Derive Key
              </Button>
            </div>

            {keyResult && (
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                <h5 className="text-xs font-medium text-muted-foreground mb-2">Derived Key</h5>
                <code className="text-xs font-mono text-orange-500 break-all">{keyResult}</code>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-orange-500">hash()</h4>
          <p className="text-xs text-muted-foreground">Semantic-aware hash function</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-orange-500">deriveKey()</h4>
          <p className="text-xs text-muted-foreground">PBKDF2-style key derivation</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-orange-500">hmac()</h4>
          <p className="text-xs text-muted-foreground">Message authentication codes</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-orange-500">verify()</h4>
          <p className="text-xs text-muted-foreground">Content integrity verification</p>
        </div>
      </div>

      <CodeBlock
        code={`import { CryptographicBackend, hash, deriveKey } from '@aleph-ai/tinyaleph';

// Quick semantic hash (similar meanings → similar hashes)
const h1 = hash('love', 32);
const h2 = hash('loving', 32);  // Similar to h1!
const h3 = hash('hate', 32);    // Different from h1

// Key derivation (PBKDF2-style with prime resonance)
const key = deriveKey('password', 'salt', 32, 10000);
console.log(key);

// Full backend for more control
const backend = new CryptographicBackend({ dimension: 32 });
const semanticHash = backend.hash('hello world');

// HMAC for message authentication
const mac = backend.hmac('message', 'secret-key');
const isValid = backend.verify('message', mac, 'secret-key');`}
        language="javascript"
        title="cryptographic-backend.js"
      />
    </div>
  );
};

// ==========================================
// SCIENTIFIC BACKEND DEMO
// ==========================================
const ScientificBackendDemo = () => {
  const [stateNotation, setStateNotation] = useState('|0⟩');
  const [encodedState, setEncodedState] = useState<{ components: number[]; entropy: number } | null>(null);
  const [gate, setGate] = useState<'H' | 'X' | 'Z'>('H');
  const [gateResult, setGateResult] = useState<{ before: number[]; after: number[]; gateName: string } | null>(null);
  const [measurementResults, setMeasurementResults] = useState<{ result: string; counts: Record<string, number> } | null>(null);
  const [backend] = useState(() => createBackend(minimalConfig));

  const stateMap: Record<string, number[]> = {
    '|0⟩': [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    '|1⟩': [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    '|+⟩': [0.707, 0.707, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    '|-⟩': [0.707, -0.707, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  };

  const runEncode = useCallback(() => {
    const components = stateMap[stateNotation] || stateMap['|0⟩'];
    const entropy = -components.filter(c => c !== 0).reduce((sum, c) => sum + c * c * Math.log2(c * c + 0.0001), 0);
    setEncodedState({ components, entropy: Math.max(0, entropy) });
  }, [stateNotation]);

  const applyGate = useCallback(() => {
    const before = stateMap[stateNotation] || stateMap['|0⟩'];
    let after = [...before];
    
    // Apply gate transformation
    if (gate === 'H') {
      // Hadamard: creates superposition
      const a = before[0], b = before[1];
      after[0] = (a + b) / Math.sqrt(2);
      after[1] = (a - b) / Math.sqrt(2);
    } else if (gate === 'X') {
      // Pauli-X: bit flip
      [after[0], after[1]] = [before[1], before[0]];
    } else if (gate === 'Z') {
      // Pauli-Z: phase flip
      after[1] = -before[1];
    }
    
    setGateResult({ before: before.slice(0, 4), after: after.slice(0, 4), gateName: gate });
  }, [stateNotation, gate]);

  const runMeasurement = useCallback(() => {
    const components = stateMap[stateNotation] || stateMap['|0⟩'];
    const prob0 = components[0] * components[0];
    const prob1 = components[1] * components[1];
    
    // Run 100 measurements
    const counts: Record<string, number> = { '0': 0, '1': 0 };
    for (let i = 0; i < 100; i++) {
      const outcome = Math.random() < prob0 ? '0' : '1';
      counts[outcome]++;
    }
    
    const result = Math.random() < prob0 ? '0' : '1';
    setMeasurementResults({ result, counts });
  }, [stateNotation]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <AtomIcon className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">ScientificBackend</h3>
            <p className="text-sm text-muted-foreground">Quantum computing & physics simulation</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* State Encoding Demo */}
          <div className="space-y-4">
            <h4 className="font-medium">Quantum State Encoding</h4>
            <div className="flex gap-2">
              <select
                value={stateNotation}
                onChange={(e) => setStateNotation(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
              >
                <option value="|0⟩">|0⟩ - Ground state</option>
                <option value="|1⟩">|1⟩ - Excited state</option>
                <option value="|+⟩">|+⟩ - Superposition (+)</option>
                <option value="|-⟩">|-⟩ - Superposition (-)</option>
              </select>
              <Button onClick={runEncode} className="gap-2" variant="secondary">
                <Play className="w-4 h-4" /> Encode
              </Button>
            </div>

            {encodedState && (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">State Vector (first 4 components)</h5>
                  <div className="flex gap-2">
                    {encodedState.components.slice(0, 4).map((c, i) => (
                      <span key={i} className="px-2 py-1 rounded bg-purple-500/20 text-purple-500 font-mono text-xs">
                        {c.toFixed(3)}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Entropy</p>
                  <p className="text-xl font-mono text-purple-500">{encodedState.entropy.toFixed(4)}</p>
                </div>
              </div>
            )}

            {/* Gate Application */}
            <div className="pt-4 border-t border-border">
              <h5 className="text-sm font-medium mb-3">Apply Quantum Gate</h5>
              <div className="flex gap-2">
                <select
                  value={gate}
                  onChange={(e) => setGate(e.target.value as 'H' | 'X' | 'Z')}
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm"
                >
                  <option value="H">Hadamard (H) - Superposition</option>
                  <option value="X">Pauli-X - Bit Flip</option>
                  <option value="Z">Pauli-Z - Phase Flip</option>
                </select>
                <Button onClick={applyGate} size="sm" variant="outline">Apply</Button>
              </div>
              {gateResult && (
                <div className="mt-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono">[{gateResult.before.map(v => v.toFixed(2)).join(', ')}]</span>
                    <ArrowRight className="w-3 h-3 text-purple-500" />
                    <span className="font-medium text-purple-500">{gateResult.gateName}</span>
                    <ArrowRight className="w-3 h-3 text-purple-500" />
                    <span className="font-mono">[{gateResult.after.map(v => v.toFixed(2)).join(', ')}]</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Measurement Demo */}
          <div className="space-y-4">
            <h4 className="font-medium">Quantum Measurement</h4>
            <p className="text-sm text-muted-foreground">
              Measurement collapses superposition via the Born rule. Run 100 trials:
            </p>
            <Button onClick={runMeasurement} className="w-full gap-2">
              <Sparkles className="w-4 h-4" /> Measure 100x
            </Button>

            {measurementResults && (
              <div className="space-y-3">
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                  <p className="text-sm text-muted-foreground mb-1">Last Measurement</p>
                  <p className="text-4xl font-mono text-purple-500">|{measurementResults.result}⟩</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">|0⟩ outcomes</p>
                    <p className="text-2xl font-mono text-purple-500">{measurementResults.counts['0']}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground">|1⟩ outcomes</p>
                    <p className="text-2xl font-mono text-purple-500">{measurementResults.counts['1']}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  For |+⟩ state, expect ~50/50 distribution
                </p>
              </div>
            )}

            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <p className="text-sm">
                <strong>Try more:</strong> Visit <a href="/quantum" className="text-primary hover:underline">Quantum Examples</a> or the <a href="/quantum-circuit-runner" className="text-primary hover:underline">Circuit Runner</a> for advanced simulations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-purple-500">encode()</h4>
          <p className="text-xs text-muted-foreground">Encode quantum state notation</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-purple-500">applyGate()</h4>
          <p className="text-xs text-muted-foreground">Apply quantum gates to states</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-purple-500">measure()</h4>
          <p className="text-xs text-muted-foreground">Collapse state via Born rule</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-purple-500">createEntangledPair()</h4>
          <p className="text-xs text-muted-foreground">Generate Bell states</p>
        </div>
      </div>

      <CodeBlock
        code={`import { ScientificBackend, Hypercomplex } from '@aleph-ai/tinyaleph';

const backend = new ScientificBackend({ dimension: 4 });

// Encode quantum states
const ket0 = backend.encode('|0⟩');  // [1, 0]
const ket1 = backend.encode('|1⟩');  // [0, 1]
const plus = backend.encode('|+⟩');  // [0.707, 0.707]

// Create Bell state |Φ+⟩ = (|00⟩ + |11⟩) / √2
const bell = backend.createEntangledPair('Φ+');
console.log('Bell state:', bell);

// Apply Hadamard gate
const state = new Hypercomplex([1, 0]);  // |0⟩
const hadamard = [[1, 1], [1, -1]].map(r => r.map(v => v / Math.sqrt(2)));
const superposition = backend.applyGate(state, 'H');

// Measure (Born rule collapse)
const result = backend.measure(superposition);
console.log('Collapsed to:', result); // '0' or '1' with equal probability`}
        language="javascript"
        title="scientific-backend.js"
      />
    </div>
  );
};

// ==========================================
// BIOINFORMATICS BACKEND DEMO
// ==========================================
const BioinformaticsBackendDemo = () => {
  const [dnaInput, setDnaInput] = useState('ATGCGATCGATCG');
  const [transcriptionResult, setTranscriptionResult] = useState<{ rna: string; complement: string } | null>(null);
  const [translationResult, setTranslationResult] = useState<string | null>(null);
  const [primeResult, setPrimeResult] = useState<{ primes: number[]; entropy: number; gcContent: number } | null>(null);
  const [backend] = useState(() => createBackend(minimalConfig));

  const nucleotidePrimes: Record<string, number> = { 'A': 7, 'T': 2, 'G': 11, 'C': 3, 'U': 5 };

  const runTranscription = useCallback(() => {
    const cleanDna = dnaInput.toUpperCase().replace(/[^ATGC]/g, '');
    const rna = cleanDna.replace(/T/g, 'U');
    const complement = cleanDna.split('').map(n => {
      const comp: Record<string, string> = { 'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G' };
      return comp[n] || n;
    }).join('');
    setTranscriptionResult({ rna, complement });
  }, [dnaInput]);

  const codonTable: Record<string, string> = {
    'AUG': 'Met', 'UUU': 'Phe', 'UUC': 'Phe', 'UUA': 'Leu', 'UUG': 'Leu',
    'CUU': 'Leu', 'CUC': 'Leu', 'CUA': 'Leu', 'CUG': 'Leu',
    'AUU': 'Ile', 'AUC': 'Ile', 'AUA': 'Ile', 'GUU': 'Val', 'GUC': 'Val',
    'GUA': 'Val', 'GUG': 'Val', 'UCU': 'Ser', 'UCC': 'Ser', 'UCA': 'Ser',
    'UCG': 'Ser', 'CCU': 'Pro', 'CCC': 'Pro', 'CCA': 'Pro', 'CCG': 'Pro',
    'ACU': 'Thr', 'ACC': 'Thr', 'ACA': 'Thr', 'ACG': 'Thr',
    'GCU': 'Ala', 'GCC': 'Ala', 'GCA': 'Ala', 'GCG': 'Ala',
    'UAU': 'Tyr', 'UAC': 'Tyr', 'CAU': 'His', 'CAC': 'His',
    'CAA': 'Gln', 'CAG': 'Gln', 'AAU': 'Asn', 'AAC': 'Asn',
    'AAA': 'Lys', 'AAG': 'Lys', 'GAU': 'Asp', 'GAC': 'Asp',
    'GAA': 'Glu', 'GAG': 'Glu', 'UGU': 'Cys', 'UGC': 'Cys',
    'UGG': 'Trp', 'CGU': 'Arg', 'CGC': 'Arg', 'CGA': 'Arg', 'CGG': 'Arg',
    'AGU': 'Ser', 'AGC': 'Ser', 'AGA': 'Arg', 'AGG': 'Arg',
    'GGU': 'Gly', 'GGC': 'Gly', 'GGA': 'Gly', 'GGG': 'Gly',
    'UAA': 'STOP', 'UAG': 'STOP', 'UGA': 'STOP',
  };

  const runTranslation = useCallback(() => {
    const cleanDna = dnaInput.toUpperCase().replace(/[^ATGC]/g, '');
    const rna = cleanDna.replace(/T/g, 'U');
    const codons: string[] = [];
    for (let i = 0; i < rna.length - 2; i += 3) {
      const codon = rna.slice(i, i + 3);
      const aa = codonTable[codon] || '?';
      if (aa === 'STOP') break;
      codons.push(aa);
    }
    setTranslationResult(codons.join('-') || 'No valid codons');
  }, [dnaInput]);

  const runPrimeEncode = useCallback(() => {
    const cleanDna = dnaInput.toUpperCase().replace(/[^ATGC]/g, '');
    const primes = cleanDna.split('').map(n => nucleotidePrimes[n] || 0);
    
    // Calculate entropy from prime distribution
    const counts: Record<number, number> = {};
    primes.forEach(p => { counts[p] = (counts[p] || 0) + 1; });
    const total = primes.length;
    const entropy = -Object.values(counts).reduce((sum, c) => {
      const p = c / total;
      return sum + (p > 0 ? p * Math.log2(p) : 0);
    }, 0);
    
    // GC content
    const gc = (cleanDna.match(/[GC]/g) || []).length / cleanDna.length;
    
    setPrimeResult({ primes, entropy, gcContent: gc });
  }, [dnaInput]);

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Dna className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">BioinformaticsBackend</h3>
            <p className="text-sm text-muted-foreground">DNA/RNA/protein analysis with prime encoding</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* DNA Input */}
          <div>
            <h4 className="font-medium mb-2">DNA Sequence</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={dnaInput}
                onChange={(e) => setDnaInput(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono"
                placeholder="Enter DNA sequence (A, T, G, C)..."
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Transcription */}
            <div className="space-y-2">
              <Button onClick={runTranscription} variant="secondary" className="w-full gap-2">
                <Play className="w-4 h-4" /> Transcribe
              </Button>
              {transcriptionResult && (
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">DNA → RNA</p>
                    <code className="text-xs font-mono text-green-500 break-all">{transcriptionResult.rna}</code>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Complement</p>
                    <code className="text-xs font-mono text-green-500 break-all">{transcriptionResult.complement}</code>
                  </div>
                </div>
              )}
            </div>

            {/* Translation */}
            <div className="space-y-2">
              <Button onClick={runTranslation} variant="secondary" className="w-full gap-2">
                <Play className="w-4 h-4" /> Translate
              </Button>
              {translationResult && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">RNA → Protein</p>
                  <code className="text-xs font-mono text-green-500 break-all">{translationResult}</code>
                </div>
              )}
            </div>

            {/* Prime Encoding */}
            <div className="space-y-2">
              <Button onClick={runPrimeEncode} variant="secondary" className="w-full gap-2">
                <Hash className="w-4 h-4" /> Prime Encode
              </Button>
              {primeResult && (
                <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Prime Signature</p>
                    <div className="flex flex-wrap gap-1">
                      {primeResult.primes.slice(0, 8).map((p, i) => (
                        <span key={i} className="px-1 py-0.5 rounded bg-green-500/20 text-green-500 font-mono text-xs">
                          {p}
                        </span>
                      ))}
                      {primeResult.primes.length > 8 && (
                        <span className="text-xs text-muted-foreground">+{primeResult.primes.length - 8}</span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Entropy</p>
                      <p className="text-sm font-mono text-green-500">{primeResult.entropy.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">GC%</p>
                      <p className="text-sm font-mono text-green-500">{(primeResult.gcContent * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prime mapping reference */}
          <div className="pt-4 border-t border-border">
            <h5 className="text-sm font-medium mb-2">Nucleotide → Prime Mapping</h5>
            <div className="flex gap-4">
              {Object.entries(nucleotidePrimes).filter(([k]) => k !== 'U').map(([nuc, prime]) => (
                <div key={nuc} className="flex items-center gap-2">
                  <code className="text-lg font-bold text-green-500">{nuc}</code>
                  <ArrowRight className="w-3 h-3 text-muted-foreground" />
                  <span className="font-mono text-sm">{prime}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
            <p className="text-sm">
              <strong>Try more:</strong> Visit <a href="/dna-computer" className="text-primary hover:underline">DNA Computer</a> for advanced sequence analysis and computation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-green-500">transcribe()</h4>
          <p className="text-xs text-muted-foreground">DNA → RNA transcription</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-green-500">translate()</h4>
          <p className="text-xs text-muted-foreground">RNA → Protein translation</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-green-500">complement()</h4>
          <p className="text-xs text-muted-foreground">Generate complementary strand</p>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 text-green-500">findORFs()</h4>
          <p className="text-xs text-muted-foreground">Locate open reading frames</p>
        </div>
      </div>

      <CodeBlock
        code={`import { BioinformaticsBackend } from '@aleph-ai/tinyaleph/bio';

const bio = new BioinformaticsBackend();

// Central dogma operations
const dna = 'ATGCGATCGATCG';
const rna = bio.transcribe(dna);        // 'AUGCGAUCGAUCG'
const protein = bio.translate(rna);      // 'Met-Arg-Ser-Ile'
const complement = bio.complement(dna);  // 'TACGCTAGCTAGC'

// Prime encoding for semantic analysis
const primes = bio.encode(dna);          // [7, 2, 11, 3, ...]
const state = bio.primesToState(primes);
console.log('Entropy:', state.entropy());

// GC content analysis
const gcContent = bio.gcContent(dna);    // 0.538

// Find restriction sites
const sites = bio.findRestrictionSites(dna, 'EcoRI');

// Open reading frame detection
const orfs = bio.findORFs(dna);`}
        language="javascript"
        title="bioinformatics-backend.js"
      />
    </div>
  );
};

// ==========================================
// MAIN PAGE
// ==========================================
const BackendsExamplesPage = () => {
  const [isFirstRun, markAsSeen] = useFirstRun('backends-examples');
  const [helpOpen, setHelpOpen] = useState(false);

  // Show help on first run
  useEffect(() => {
    if (isFirstRun) {
      setHelpOpen(true);
      markAsSeen();
    }
  }, [isFirstRun, markAsSeen]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <a href="/" className="text-primary hover:underline text-sm">← Back to Examples</a>
            <h1 className="text-3xl font-display font-bold mt-4 mb-2">Library Backends</h1>
            <p className="text-muted-foreground max-w-3xl">
              The @aleph-ai/tinyaleph library provides four specialized backends for different domains, 
              all unified by prime-based hypercomplex algebra.
            </p>
          </div>
          <HelpButton onClick={() => setHelpOpen(true)} className="mt-4" />
        </div>

        {/* Help Dialog */}
        <AppHelpDialog
          open={helpOpen}
          onOpenChange={setHelpOpen}
          steps={helpSteps}
          appName="Library Backends"
        />

        {/* Architecture Overview */}
        <div className="mb-10 p-6 rounded-xl border border-border bg-card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Backend Architecture
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-primary" />
                <h4 className="font-semibold text-primary">semantic</h4>
              </div>
              <p className="text-xs text-muted-foreground">NLP, concept mapping, semantic similarity</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-orange-500" />
                <h4 className="font-semibold text-orange-500">cryptographic</h4>
              </div>
              <p className="text-xs text-muted-foreground">Hashing, key derivation, HMAC</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <AtomIcon className="w-4 h-4 text-purple-500" />
                <h4 className="font-semibold text-purple-500">scientific</h4>
              </div>
              <p className="text-xs text-muted-foreground">Quantum states, gates, measurement</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Dna className="w-4 h-4 text-green-500" />
                <h4 className="font-semibold text-green-500">bioinformatics</h4>
              </div>
              <p className="text-xs text-muted-foreground">DNA/RNA/protein analysis</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            All backends share a common interface: <code className="px-1 py-0.5 bg-muted rounded text-xs">encode()</code> → primes, 
            <code className="px-1 py-0.5 bg-muted rounded text-xs mx-1">primesToState()</code> → hypercomplex state,
            <code className="px-1 py-0.5 bg-muted rounded text-xs">entropy()</code> / <code className="px-1 py-0.5 bg-muted rounded text-xs">coherence()</code> → analysis.
          </p>
        </div>

        <Tabs defaultValue="semantic" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="semantic" className="gap-2">
              <Brain className="w-4 h-4" /> Semantic
            </TabsTrigger>
            <TabsTrigger value="cryptographic" className="gap-2">
              <Shield className="w-4 h-4" /> Crypto
            </TabsTrigger>
            <TabsTrigger value="scientific" className="gap-2">
              <AtomIcon className="w-4 h-4" /> Scientific
            </TabsTrigger>
            <TabsTrigger value="bioinformatics" className="gap-2">
              <Dna className="w-4 h-4" /> Bio
            </TabsTrigger>
          </TabsList>

          <TabsContent value="semantic">
            <SemanticBackendDemo />
          </TabsContent>

          <TabsContent value="cryptographic">
            <CryptographicBackendDemo />
          </TabsContent>

          <TabsContent value="scientific">
            <ScientificBackendDemo />
          </TabsContent>

          <TabsContent value="bioinformatics">
            <BioinformaticsBackendDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BackendsExamplesPage;
