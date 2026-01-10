import { useState, useCallback } from 'react';
import { Play, Hash, Server, Cpu, Brain, Zap, Database, Shield, Activity, Code2, Layers } from 'lucide-react';
import CodeBlock from '../components/CodeBlock';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SemanticBackend,
  hash,
} from '@aleph-ai/tinyaleph';
import { minimalConfig } from '@/lib/tinyaleph-config';
import { supabase } from '@/integrations/supabase/client';

// TinyAleph Compute Demo
const TinyAlephComputeDemo = () => {
  const [operation, setOperation] = useState('hypercomplex.create');
  const [params, setParams] = useState('{"components": [1, 0, 0, 0, 0.5, 0.5, 0, 0]}');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runOperation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tinyaleph-compute', {
        body: { operation, params: JSON.parse(params) },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const operations = [
    { value: 'hypercomplex.create', label: 'Create Hypercomplex', example: '{"components": [1, 0, 0, 0, 0.5, 0.5, 0, 0]}' },
    { value: 'hypercomplex.multiply', label: 'Multiply', example: '{"a": [1, 0, 0, 0], "b": [0, 1, 0, 0]}' },
    { value: 'hypercomplex.normalize', label: 'Normalize', example: '{"components": [3, 4, 0, 0]}' },
    { value: 'prime.check', label: 'Is Prime?', example: '{"n": 17}' },
    { value: 'prime.factorize', label: 'Factorize', example: '{"n": 360}' },
    { value: 'prime.upTo', label: 'Primes Up To', example: '{"limit": 100}' },
    { value: 'engine.run', label: 'Semantic Engine', example: '{"input": "love and wisdom", "dims": 16, "maxSteps": 50}' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">tinyaleph-compute</h3>
            <p className="text-sm text-muted-foreground">Hypercomplex algebra & prime operations</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Operation</label>
              <select
                value={operation}
                onChange={(e) => {
                  setOperation(e.target.value);
                  const op = operations.find(o => o.value === e.target.value);
                  if (op) setParams(op.example);
                }}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
              >
                {operations.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Parameters (JSON)</label>
              <input
                type="text"
                value={params}
                onChange={(e) => setParams(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm"
              />
            </div>
          </div>
          
          <Button onClick={runOperation} disabled={isLoading} className="gap-2">
            <Play className="w-4 h-4" />
            {isLoading ? 'Running...' : 'Execute'}
          </Button>

          {result && (
            <div className="p-4 rounded-lg bg-muted/50 overflow-auto max-h-64">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Hypercomplex Ops
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Create quaternions/octonions/sedenions</li>
            <li>• Cayley-Dickson multiplication</li>
            <li>• Normalization & conjugation</li>
            <li>• Entropy & coherence metrics</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Hash className="w-4 h-4 text-primary" /> Prime Operations
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Primality testing</li>
            <li>• Prime factorization</li>
            <li>• Sieve of Eratosthenes</li>
            <li>• Nth prime computation</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" /> Semantic Engine
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Text → hypercomplex state</li>
            <li>• Iterative evolution</li>
            <li>• Coherence collapse</li>
            <li>• Dominant axis extraction</li>
          </ul>
        </div>
      </div>

      <CodeBlock
        code={`// Call tinyaleph-compute edge function
const { data, error } = await supabase.functions.invoke('tinyaleph-compute', {
  body: {
    operation: 'hypercomplex.multiply',
    params: {
      a: [1, 0, 0, 0],  // Quaternion 1
      b: [0, 1, 0, 0],  // Quaternion i
    }
  }
});

console.log(data.result);
// { components: [0, 0, 0, -1, 0, 0, 0, 0], norm: 1, entropy: 0, ... }

// Semantic engine
const engineResult = await supabase.functions.invoke('tinyaleph-compute', {
  body: {
    operation: 'engine.run',
    params: { input: 'love and wisdom', dims: 16, maxSteps: 100 }
  }
});`}
        language="typescript"
        title="tinyaleph-compute-example.ts"
      />
    </div>
  );
};

// TensorFlow Compute Demo
const TensorFlowComputeDemo = () => {
  const [operation, setOperation] = useState('tensor.random');
  const [params, setParams] = useState('{"shape": [3, 3]}');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runOperation = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('tensorflow-compute', {
        body: { operation, params: JSON.parse(params) },
      });
      if (error) throw error;
      setResult(data);
    } catch (e: any) {
      setResult({ error: e.message });
    } finally {
      setIsLoading(false);
    }
  };

  const operations = [
    { value: 'tensor.random', label: 'Random Tensor', example: '{"shape": [3, 3]}' },
    { value: 'tensor.zeros', label: 'Zeros', example: '{"shape": [4, 4]}' },
    { value: 'tensor.ones', label: 'Ones', example: '{"shape": [2, 5]}' },
    { value: 'activation.softmax', label: 'Softmax', example: '{"data": [1, 2, 3, 4]}' },
    { value: 'activation.relu', label: 'ReLU', example: '{"data": [-1, 0, 1, 2, -0.5]}' },
    { value: 'nn.dense', label: 'Dense Layer', example: '{"inputSize": 4, "outputSize": 2, "activation": "relu", "input": [1, 0.5, -1, 2]}' },
    { value: 'decomposition.pca', label: 'PCA', example: '{"data": [[1,2],[2,3],[3,5],[4,6],[5,8]], "shape": [5, 2], "numComponents": 1}' },
    { value: 'stats.describe', label: 'Statistics', example: '{"data": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}' },
  ];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">tensorflow-compute</h3>
            <p className="text-sm text-muted-foreground">ML operations: tensors, activations, neural networks</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Operation</label>
              <select
                value={operation}
                onChange={(e) => {
                  setOperation(e.target.value);
                  const op = operations.find(o => o.value === e.target.value);
                  if (op) setParams(op.example);
                }}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
              >
                {operations.map(op => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Parameters (JSON)</label>
              <input
                type="text"
                value={params}
                onChange={(e) => setParams(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-secondary border border-border text-foreground font-mono text-sm"
              />
            </div>
          </div>
          
          <Button onClick={runOperation} disabled={isLoading} variant="secondary" className="gap-2">
            <Play className="w-4 h-4" />
            {isLoading ? 'Running...' : 'Execute'}
          </Button>

          {result && (
            <div className="p-4 rounded-lg bg-muted/50 overflow-auto max-h-64">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-orange-500" /> Tensor Ops
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Create/zeros/ones/random</li>
            <li>• Add/sub/mul/matmul</li>
            <li>• Transpose/reshape</li>
            <li>• Sum/mean/max/argmax</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-orange-500" /> Activations
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• ReLU / Leaky ReLU</li>
            <li>• Sigmoid</li>
            <li>• Tanh</li>
            <li>• Softmax</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-orange-500" /> Neural Nets
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Dense layers</li>
            <li>• Sequential models</li>
            <li>• Conv1D/Pooling</li>
            <li>• MSE/CrossEntropy loss</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" /> Analysis
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• SVD decomposition</li>
            <li>• PCA</li>
            <li>• Descriptive stats</li>
          </ul>
        </div>
      </div>

      <CodeBlock
        code={`// TensorFlow-like operations via edge function
const { data } = await supabase.functions.invoke('tensorflow-compute', {
  body: {
    operation: 'nn.sequential',
    params: {
      layers: [
        { inputSize: 4, outputSize: 8, activation: 'relu' },
        { inputSize: 8, outputSize: 2, activation: 'softmax' }
      ],
      input: [1, 0.5, -1, 2]
    }
  }
});

// PCA dimensionality reduction
const pcaResult = await supabase.functions.invoke('tensorflow-compute', {
  body: {
    operation: 'decomposition.pca',
    params: {
      data: [[1,2,3], [2,4,5], [3,5,6], [4,6,8]],
      shape: [4, 3],
      numComponents: 2
    }
  }
});`}
        language="typescript"
        title="tensorflow-compute-example.ts"
      />
    </div>
  );
};

// Aleph Chat Backend Demo
const AlephChatDemo = () => {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">aleph-chat</h3>
            <p className="text-sm text-muted-foreground">Semantic AI chat with prime-based meaning encoding</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">How It Works</h4>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>User message is encoded to a <strong>prime signature</strong></li>
              <li>Primes are mapped to a <strong>16D sedenion state</strong></li>
              <li>Semantic metrics (entropy, coherence) are computed</li>
              <li>A contextual system prompt is built from the encoding</li>
              <li>AI response is generated with semantic grounding</li>
              <li>Response is also encoded for <strong>cross-coherence</strong> analysis</li>
            </ol>
          </div>
          <div className="space-y-4">
            <h4 className="font-medium">Semantic Metrics</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Entropy</p>
                <p className="font-mono text-lg">H(ψ)</p>
                <p className="text-xs text-muted-foreground mt-1">Measures semantic focus/dispersion</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Coherence</p>
                <p className="font-mono text-lg">C(ψ)</p>
                <p className="text-xs text-muted-foreground mt-1">Meaning alignment (1 - H/H_max)</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Cross-Coherence</p>
                <p className="font-mono text-lg">⟨ψ_u|ψ_r⟩</p>
                <p className="text-xs text-muted-foreground mt-1">User-response semantic overlap</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">Prime Signature</p>
                <p className="font-mono text-lg">[p₁, p₂, ...]</p>
                <p className="text-xs text-muted-foreground mt-1">Word → prime mapping</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-sm">
            <strong>Try it:</strong> Visit the <a href="/chat" className="text-primary hover:underline">Aleph Chat</a> page to interact with the semantic AI assistant.
          </p>
        </div>
      </div>

      <CodeBlock
        code={`// Call aleph-chat edge function
const { data, error } = await supabase.functions.invoke('aleph-chat', {
  body: {
    messages: [
      { role: 'user', content: 'What is the relationship between wisdom and truth?' }
    ],
    temperature: 0.7,
  }
});

console.log(data.content);       // AI response text
console.log(data.semantic.user); // { primes: [...], entropy: 1.23, coherence: 0.85 }
console.log(data.semantic.response);
console.log(data.semantic.crossCoherence); // 0.72 - semantic similarity

// The system prompt includes semantic context:
// "Prime signature: [7, 11, 13, 17, 19, 23]"
// "Semantic entropy: 1.234 (focused)"
// "Coherence: 0.856 (high)"`}
        language="typescript"
        title="aleph-chat-example.ts"
      />
    </div>
  );
};

// Client-side Backends Demo
const ClientBackendsDemo = () => {
  const [input, setInput] = useState('love and wisdom');
  const [result, setResult] = useState<{
    tokens: any[];
    primes: number[];
    entropy: number;
    stateComponents: number[];
  } | null>(null);
  const [backend] = useState(() => new SemanticBackend(minimalConfig));

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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Client-Side Backends</h3>
            <p className="text-sm text-muted-foreground">Run tinyaleph directly in the browser</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg bg-secondary border border-border text-foreground"
              placeholder="Enter text to encode..."
            />
            <Button onClick={runEncode} variant="secondary" className="gap-2">
              <Play className="w-4 h-4" /> Encode
            </Button>
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
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Prime Encoding</h4>
                <div className="flex flex-wrap gap-2">
                  {result.primes.slice(0, 15).map((p, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-primary/20 text-primary font-mono text-sm">
                      {p}
                    </span>
                  ))}
                  {result.primes.length > 15 && (
                    <span className="text-muted-foreground text-sm">+{result.primes.length - 15} more</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Entropy</h4>
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

      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4 text-purple-500" /> SemanticBackend
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Text tokenization with vocabulary</li>
            <li>• Prime signature encoding</li>
            <li>• Sedenion state mapping</li>
            <li>• Entropy & coherence calculation</li>
          </ul>
        </div>
        <div className="p-4 rounded-lg border border-border bg-card">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-500" /> CryptographicBackend
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Semantic hashing (similar → similar)</li>
            <li>• Key derivation (PBKDF2-like)</li>
            <li>• HMAC for message authentication</li>
            <li>• Content integrity verification</li>
          </ul>
        </div>
      </div>

      <CodeBlock
        code={`import { SemanticBackend, CryptographicBackend, hash } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

// Semantic encoding
const semantic = new SemanticBackend(config);
const primes = semantic.encode('love and wisdom');
const state = semantic.primesToState(primes);
console.log('Entropy:', state.entropy());
console.log('Coherence:', state.coherence());

// Semantic similarity
const s1 = semantic.primesToState(semantic.encode('love'));
const s2 = semantic.primesToState(semantic.encode('affection'));
console.log('Coherence:', s1.coherence(s2)); // High for similar meanings

// Cryptographic hashing
const h = hash('secret message', 32);
console.log(h); // Semantic-aware hash

// Similar meanings produce similar hashes
console.log(hash('love', 16));
console.log(hash('loving', 16)); // Similar to 'love'`}
        language="javascript"
        title="client-backends-example.js"
      />
    </div>
  );
};

const BackendsExamplesPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <a href="/" className="text-primary hover:underline text-sm">← Back to Examples</a>
          <h1 className="text-3xl font-display font-bold mt-4 mb-2">Backend Services</h1>
          <p className="text-muted-foreground max-w-3xl">
            tinyaleph provides both client-side libraries and serverless edge functions for semantic computing, 
            machine learning operations, and AI-powered chat.
          </p>
        </div>

        {/* Architecture Overview */}
        <div className="mb-10 p-6 rounded-xl border border-border bg-card">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-primary" /> Architecture Overview
          </h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <h4 className="font-semibold text-primary mb-2">tinyaleph-compute</h4>
              <p className="text-xs text-muted-foreground">Hypercomplex algebra, prime operations, semantic engine</p>
            </div>
            <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
              <h4 className="font-semibold text-orange-500 mb-2">tensorflow-compute</h4>
              <p className="text-xs text-muted-foreground">Tensor operations, neural networks, ML primitives</p>
            </div>
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <h4 className="font-semibold text-green-500 mb-2">aleph-chat</h4>
              <p className="text-xs text-muted-foreground">Semantic AI chat with Lovable AI integration</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <h4 className="font-semibold text-purple-500 mb-2">Client Libraries</h4>
              <p className="text-xs text-muted-foreground">Browser-side semantic & crypto backends</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="tinyaleph" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="tinyaleph" className="gap-2">
              <Cpu className="w-4 h-4" /> tinyaleph
            </TabsTrigger>
            <TabsTrigger value="tensorflow" className="gap-2">
              <Activity className="w-4 h-4" /> tensorflow
            </TabsTrigger>
            <TabsTrigger value="chat" className="gap-2">
              <Brain className="w-4 h-4" /> aleph-chat
            </TabsTrigger>
            <TabsTrigger value="client" className="gap-2">
              <Code2 className="w-4 h-4" /> Client
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tinyaleph">
            <TinyAlephComputeDemo />
          </TabsContent>

          <TabsContent value="tensorflow">
            <TensorFlowComputeDemo />
          </TabsContent>

          <TabsContent value="chat">
            <AlephChatDemo />
          </TabsContent>

          <TabsContent value="client">
            <ClientBackendsDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BackendsExamplesPage;
