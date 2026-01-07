import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CodeBlock from "@/components/CodeBlock";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ReferenceGuide = () => {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4">
        <Badge variant="outline" className="mb-4">Documentation</Badge>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          API Reference
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Complete API documentation for the TinyAleph library.
        </p>
      </section>

      {/* Quick Reference */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Quick Reference</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Key Exports</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-sm">@aleph-ai/tinyaleph</TableCell>
                <TableCell>Core library</TableCell>
                <TableCell className="font-mono text-xs">AlephEngine, JSBackend, WASMBackend</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">@aleph-ai/tinyaleph/math</TableCell>
                <TableCell>Mathematical utilities</TableCell>
                <TableCell className="font-mono text-xs">Sedenion, PrimeEncoder, Complex</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">@aleph-ai/tinyaleph/physics</TableCell>
                <TableCell>Physics simulations</TableCell>
                <TableCell className="font-mono text-xs">KuramotoOscillator, EntropyCalculator</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-sm">@aleph-ai/tinyaleph/crypto</TableCell>
                <TableCell>Cryptographic functions</TableCell>
                <TableCell className="font-mono text-xs">hash, hmac, commit, verify</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* AlephEngine */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">AlephEngine</h2>
        <p className="text-muted-foreground">
          The main orchestration class that coordinates semantic operations.
        </p>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg">constructor(backend: Backend)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">Creates a new AlephEngine instance with the specified backend.</p>
            <CodeBlock
              code={`import { AlephEngine, JSBackend } from '@aleph-ai/tinyaleph';

const backend = new JSBackend();
const engine = new AlephEngine(backend);`}
              language="typescript"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg">coherence(stateA: number[], stateB: number[]): number</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Computes the coherence (similarity) between two sedenion states. Returns a value between 0 and 1.
            </p>
            <CodeBlock
              code={`const similarity = engine.coherence(stateA, stateB);
// 1.0 = identical, 0.0 = orthogonal`}
              language="typescript"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg">kuramotoStep(oscillators: Oscillator[], coupling: number, dt?: number): void</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Advances the Kuramoto oscillator network by one timestep. Modifies oscillators in place.
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parameter</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono">oscillators</TableCell>
                  <TableCell className="font-mono text-xs">Oscillator[]</TableCell>
                  <TableCell>Array of oscillator objects</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">coupling</TableCell>
                  <TableCell className="font-mono text-xs">number</TableCell>
                  <TableCell>Coupling strength (0-1 typical)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono">dt</TableCell>
                  <TableCell className="font-mono text-xs">number</TableCell>
                  <TableCell>Time step size (default: 0.1)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg">orderParameter(oscillators: Oscillator[]): number</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Computes the Kuramoto order parameter, measuring global synchronization (0 = incoherent, 1 = synchronized).
            </p>
            <CodeBlock
              code={`const sync = engine.orderParameter(oscillators);
console.log(\`Network is \${(sync * 100).toFixed(1)}% synchronized\`);`}
              language="typescript"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg">shannonEntropy(state: number[]): number</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Calculates the Shannon entropy of a state distribution. Lower entropy = more focused/certain.
            </p>
            <CodeBlock
              code={`const entropy = engine.shannonEntropy(state);
// Range: 0 (single value) to log2(16) ≈ 4 (uniform)`}
              language="typescript"
            />
          </CardContent>
        </Card>
      </section>

      {/* Backend Interface */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Backend Interface</h2>
        <p className="text-muted-foreground">
          All backends implement this interface for consistent behavior.
        </p>

        <Tabs defaultValue="encode">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="encode">encode()</TabsTrigger>
            <TabsTrigger value="primes">primesToState()</TabsTrigger>
            <TabsTrigger value="hash">hash()</TabsTrigger>
            <TabsTrigger value="multiply">sedenionMultiply()</TabsTrigger>
          </TabsList>

          <TabsContent value="encode">
            <Card>
              <CardHeader>
                <CardTitle className="font-mono text-lg">encode(text: string): number[]</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Encodes a string into an array of prime numbers using character-to-prime mapping.
                </p>
                <CodeBlock
                  code={`const primes = backend.encode('hello');
// Returns: [2, 3, 5, 5, 7] (example mapping)`}
                  language="typescript"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="primes">
            <Card>
              <CardHeader>
                <CardTitle className="font-mono text-lg">primesToState(primes: number[]): number[]</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Converts an array of primes into a 16-dimensional sedenion state vector.
                </p>
                <CodeBlock
                  code={`const state = backend.primesToState([2, 3, 5, 7]);
// Returns: [0.23, -0.15, 0.42, ...] (16 components)`}
                  language="typescript"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hash">
            <Card>
              <CardHeader>
                <CardTitle className="font-mono text-lg">hash(data: string | Uint8Array): string</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Computes a cryptographic hash of the input data.
                </p>
                <CodeBlock
                  code={`const digest = backend.hash('my secret data');
// Returns: "a7f3b2c1..." (hex string)`}
                  language="typescript"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="multiply">
            <Card>
              <CardHeader>
                <CardTitle className="font-mono text-lg">sedenionMultiply(a: number[], b: number[]): number[]</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Performs sedenion multiplication (16D hypercomplex product).
                </p>
                <CodeBlock
                  code={`const product = backend.sedenionMultiply(stateA, stateB);
// Returns: 16-component sedenion product`}
                  language="typescript"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      {/* Types */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Type Definitions</h2>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg">Oscillator</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`interface Oscillator {
  phase: number;      // Current phase (0 to 2π)
  frequency: number;  // Natural frequency
  state: number[];    // Associated 16D sedenion state
}`}
              language="typescript"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg">Backend</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`interface Backend {
  encode(text: string): number[];
  primesToState(primes: number[]): number[];
  hash(data: string | Uint8Array): string;
  sedenionMultiply(a: number[], b: number[]): number[];
  sedenionConjugate(s: number[]): number[];
  sedenionNorm(s: number[]): number;
}`}
              language="typescript"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-lg">EngineConfig</CardTitle>
          </CardHeader>
          <CardContent>
            <CodeBlock
              code={`interface EngineConfig {
  entropyThreshold?: number;  // Default: 0.1
  maxIterations?: number;     // Default: 1000
  convergenceEpsilon?: number; // Default: 1e-6
  couplingStrength?: number;  // Default: 0.5
}`}
              language="typescript"
            />
          </CardContent>
        </Card>
      </section>

      {/* Constants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Constants</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Constant</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">SEDENION_DIM</TableCell>
                <TableCell className="font-mono">16</TableCell>
                <TableCell>Dimension of sedenion space</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">FIRST_100_PRIMES</TableCell>
                <TableCell className="font-mono">[2, 3, 5, ...]</TableCell>
                <TableCell>First 100 prime numbers for encoding</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">TAU</TableCell>
                <TableCell className="font-mono">6.283...</TableCell>
                <TableCell>2π constant for oscillator calculations</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Navigation */}
      <section className="flex justify-between pt-8 border-t">
        <Link to="/docs/app-ideas" className="text-muted-foreground hover:text-primary transition-colors">
          ← App Ideas
        </Link>
        <Link to="/quickstart" className="text-primary hover:underline">
          Try Examples →
        </Link>
      </section>
    </div>
  );
};

export default ReferenceGuide;
