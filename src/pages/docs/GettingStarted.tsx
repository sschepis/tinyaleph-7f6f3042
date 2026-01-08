import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CodeBlock from "@/components/CodeBlock";
import { ArrowRight, Package, Zap, BookOpen } from "lucide-react";
import DocsLayout from "@/components/docs/DocsLayout";

const GettingStarted = () => {
  return (
    <DocsLayout>
      {/* Hero */}
      <section className="text-center space-y-4">
        <Badge variant="outline" className="mb-4">Documentation</Badge>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Getting Started
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get up and running with TinyAleph in minutes. Build semantic-aware applications with quantum-inspired mathematics.
        </p>
      </section>

      {/* Installation */}
      <section id="installation" className="space-y-6 scroll-mt-24">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Installation</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">npm / yarn / pnpm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CodeBlock
              code={`# Using npm
npm install @aleph-ai/tinyaleph

# Using yarn
yarn add @aleph-ai/tinyaleph

# Using pnpm
pnpm add @aleph-ai/tinyaleph`}
              language="bash"
            />
          </CardContent>
        </Card>
      </section>

      {/* Quick Start */}
      <section id="quick-start" className="space-y-6 scroll-mt-24">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Quick Start</h2>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">1. Initialize the Engine</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`import { AlephEngine, JSBackend } from '@aleph-ai/tinyaleph';

// Create the backend and engine
const backend = new JSBackend();
const engine = new AlephEngine(backend);

console.log('TinyAleph initialized!');`}
                language="typescript"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">2. Encode Semantic Concepts</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`// Encode words into prime-based semantic representations
const catPrimes = backend.encode('cat');
const dogPrimes = backend.encode('dog');

console.log('Cat primes:', catPrimes);
console.log('Dog primes:', dogPrimes);

// Convert to 16D sedenion states
const catState = backend.primesToState(catPrimes);
const dogState = backend.primesToState(dogPrimes);`}
                language="typescript"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">3. Measure Semantic Similarity</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`// Compute coherence between concepts
const similarity = engine.coherence(catState, dogState);
console.log('Cat-Dog similarity:', similarity.toFixed(4));

// Higher coherence = more semantically related
// Values range from 0 (unrelated) to 1 (identical)`}
                language="typescript"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">4. Optimize with Kuramoto Dynamics</CardTitle>
            </CardHeader>
            <CardContent>
              <CodeBlock
                code={`// Create an oscillator network for semantic clustering
const oscillators = engine.createOscillatorNetwork(5);

// Run synchronization steps
for (let i = 0; i < 100; i++) {
  engine.kuramotoStep(oscillators, 0.1); // coupling = 0.1
}

// Measure network synchronization
const sync = engine.orderParameter(oscillators);
console.log('Network sync:', sync.toFixed(4));`}
                language="typescript"
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Core Concepts */}
      <section id="core-concepts" className="space-y-6 scroll-mt-24">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Core Concepts</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle>Prime Semantics</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Words are encoded as products of prime numbers, creating unique mathematical fingerprints. 
              This allows semantic relationships to be computed through number-theoretic operations.
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <CardHeader>
              <CardTitle>16D Sedenion Space</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Concepts exist as vectors in 16-dimensional sedenion hypercomplex space. 
              This rich structure captures nuanced semantic relationships beyond simple embeddings.
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle>Kuramoto Synchronization</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Networks of coupled oscillators naturally synchronize related concepts. 
              This physics-inspired approach enables emergent clustering and pattern discovery.
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle>Entropy Minimization</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              The system seeks low-entropy configurations representing coherent semantic states. 
              This thermodynamic principle drives meaningful organization of information.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Next Steps */}
      <section id="next-steps" className="space-y-6 scroll-mt-24">
        <h2 className="text-2xl font-bold">Next Steps</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/docs/user-guide" className="group">
            <Card className="h-full transition-all hover:border-primary">
              <CardContent className="pt-6 flex items-center justify-between">
                <span className="font-medium">User Guide</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/docs/app-ideas" className="group">
            <Card className="h-full transition-all hover:border-primary">
              <CardContent className="pt-6 flex items-center justify-between">
                <span className="font-medium">App Ideas</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
          <Link to="/docs/reference" className="group">
            <Card className="h-full transition-all hover:border-primary">
              <CardContent className="pt-6 flex items-center justify-between">
                <span className="font-medium">API Reference</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </DocsLayout>
  );
};

export default GettingStarted;
