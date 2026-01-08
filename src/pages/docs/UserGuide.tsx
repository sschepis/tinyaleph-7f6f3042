import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Lightbulb } from "lucide-react";
import DocsLayout from "@/components/docs/DocsLayout";

const UserGuide = () => {
  return (
    <DocsLayout>
      {/* Hero */}
      <section className="text-center space-y-4">
        <Badge variant="outline" className="mb-4">Documentation</Badge>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          User Guide
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Deep dive into TinyAleph's features and learn how to build sophisticated semantic applications.
        </p>
      </section>

      {/* Working with Backends */}
      <section id="backends" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-bold">Working with Backends</h2>
        <p className="text-muted-foreground">
          TinyAleph supports multiple computational backends. Choose based on your performance needs.
        </p>

        <Tabs defaultValue="js" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="wasm">WebAssembly</TabsTrigger>
            <TabsTrigger value="gpu">WebGPU</TabsTrigger>
          </TabsList>
          <TabsContent value="js">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  JSBackend - Universal Compatibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Pure JavaScript implementation. Works everywhere, ideal for development and small-scale applications.
                </p>
                <CodeBlock
                  code={`import { JSBackend, AlephEngine } from '@aleph-ai/tinyaleph';

const backend = new JSBackend();
const engine = new AlephEngine(backend);

// Full API access with universal browser support
const state = backend.primesToState([2, 3, 5]);`}
                  language="typescript"
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="wasm">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  WASMBackend - High Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  WebAssembly backend for 10-50x speedup on numerical operations. Ideal for production.
                </p>
                <CodeBlock
                  code={`import { WASMBackend, AlephEngine } from '@aleph-ai/tinyaleph';

// Async initialization required
const backend = await WASMBackend.create();
const engine = new AlephEngine(backend);

// Same API, much faster execution
const state = backend.primesToState([2, 3, 5]);`}
                  language="typescript"
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="gpu">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  WebGPU - Experimental
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  GPU-accelerated backend for massive parallelism. Requires WebGPU-enabled browser.
                </p>
                <CodeBlock
                  code={`import { WebGPUBackend, AlephEngine } from '@aleph-ai/tinyaleph';

// Check for WebGPU support
if (!navigator.gpu) {
  throw new Error('WebGPU not supported');
}

const backend = await WebGPUBackend.create();
const engine = new AlephEngine(backend);

// Batch operations are significantly faster
const states = backend.batchPrimesToState(primeArrays);`}
                  language="typescript"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Semantic Operations */}
      <section id="semantic-ops" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-bold">Semantic Operations</h2>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Encoding Text</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Convert text into prime-based semantic representations.
              </p>
              <CodeBlock
                code={`// Single word encoding
const primes = backend.encode('philosophy');

// The encoding maps characters to primes
// 'p' -> 2, 'h' -> 3, 'i' -> 5, etc.
console.log(primes); // [2, 3, 5, 7, 11, ...]

// Sentence encoding (splits and encodes each word)
const sentence = "The quick brown fox";
const wordPrimes = sentence.split(' ').map(w => backend.encode(w));`}
                language="typescript"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Computing Similarity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Measure semantic relationships between concepts.
              </p>
              <CodeBlock
                code={`// Convert to sedenion states
const kingState = backend.primesToState(backend.encode('king'));
const queenState = backend.primesToState(backend.encode('queen'));
const carState = backend.primesToState(backend.encode('car'));

// Compute coherence (similarity)
const kingQueen = engine.coherence(kingState, queenState);
const kingCar = engine.coherence(kingState, carState);

console.log('king-queen:', kingQueen); // Higher
console.log('king-car:', kingCar);     // Lower`}
                language="typescript"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Semantic Arithmetic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Perform vector operations on semantic states (like word2vec analogies).
              </p>
              <CodeBlock
                code={`// king - man + woman ≈ queen
const king = backend.primesToState(backend.encode('king'));
const man = backend.primesToState(backend.encode('man'));
const woman = backend.primesToState(backend.encode('woman'));

// Vector arithmetic in sedenion space
const result = king.map((v, i) => v - man[i] + woman[i]);

// Find nearest concept to result
const queen = backend.primesToState(backend.encode('queen'));
const similarity = engine.coherence(result, queen);`}
                language="typescript"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Oscillator Networks */}
      <section id="oscillators" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-bold">Oscillator Networks</h2>
        
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6 flex gap-4">
            <Lightbulb className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <p className="font-medium">Why Oscillators?</p>
              <p className="text-muted-foreground text-sm mt-1">
                Kuramoto oscillators naturally synchronize based on coupling strength. 
                By linking oscillators to semantic concepts, related ideas cluster together 
                through emergent synchronization—no explicit clustering algorithm needed.
              </p>
            </div>
          </CardContent>
        </Card>

        <CodeBlock
          code={`// Create a network of oscillators
const concepts = ['cat', 'dog', 'fish', 'car', 'truck', 'bus'];
const oscillators = concepts.map(c => ({
  phase: Math.random() * 2 * Math.PI,
  frequency: 1.0,
  state: backend.primesToState(backend.encode(c))
}));

// Run Kuramoto synchronization
const coupling = 0.5;
const dt = 0.1;

for (let step = 0; step < 200; step++) {
  engine.kuramotoStep(oscillators, coupling, dt);
}

// Measure cluster formation
const orderParam = engine.orderParameter(oscillators);
console.log('Synchronization:', orderParam);

// Animals and vehicles will have synchronized phases within their groups`}
          language="typescript"
        />
      </section>

      {/* Entropy & Energy */}
      <section id="entropy" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-bold">Entropy & Energy</h2>
        
        <p className="text-muted-foreground">
          TinyAleph uses thermodynamic principles to measure semantic coherence.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Shannon Entropy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Measures information content / uncertainty in a state distribution.
              </p>
              <CodeBlock
                code={`const state = backend.primesToState(primes);
const entropy = engine.shannonEntropy(state);

// Lower entropy = more focused/certain
// Higher entropy = more distributed/uncertain`}
                language="typescript"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Semantic Energy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Measures the "cost" of a semantic configuration. Lower = more stable.
              </p>
              <CodeBlock
                code={`const energy = engine.computeEnergy(states);

// System naturally evolves toward lower energy
// Coherent clusters have lower total energy`}
                language="typescript"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Best Practices */}
      <section id="best-practices" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-bold">Best Practices</h2>
        
        <div className="grid gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Normalize States</p>
                  <p className="text-muted-foreground text-sm">
                    Always normalize sedenion states before computing coherence for consistent results.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Batch Operations</p>
                  <p className="text-muted-foreground text-sm">
                    Use batch methods when processing many items—especially with WASM/WebGPU backends.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Cache Encodings</p>
                  <p className="text-muted-foreground text-sm">
                    Prime encodings are deterministic—cache them for frequently used terms.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Navigation */}
      <section className="flex justify-between pt-8 border-t">
        <Link to="/docs/getting-started" className="text-muted-foreground hover:text-primary transition-colors">
          ← Getting Started
        </Link>
        <Link to="/docs/app-ideas" className="text-primary hover:underline">
          App Ideas →
        </Link>
      </section>
    </DocsLayout>
  );
};

export default UserGuide;
