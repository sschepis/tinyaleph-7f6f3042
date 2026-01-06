import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import ExampleSection from '../components/ExampleSection';
import Footer from '../components/Footer';
import SedenionVisualizer from '../components/SedenionVisualizer';
import OscillatorVisualizer from '../components/OscillatorVisualizer';
import EntropyVisualizer from '../components/EntropyVisualizer';
import PrimeVisualizer from '../components/PrimeVisualizer';
import ModuleCard from '../components/ModuleCard';
import { Layers, Waves, Database, Cpu, Hash, Atom, Binary, Braces } from 'lucide-react';

const coreExamples = {
  sedenion: `const { SedenionState } = require('@aleph-ai/tinyaleph');

// Create a 16-dimensional state
const state = new SedenionState([
  1, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0
]);

// Hypercomplex multiplication (non-commutative!)
const a = new SedenionState([1, 0, 0, ...]);
const b = new SedenionState([0, 1, 0, ...]);
const product = a.multiply(b);

// a * b ≠ b * a (this is what makes sedenions special)
console.log(a.multiply(b) !== b.multiply(a)); // true

// Calculate entropy
console.log('Entropy:', state.entropy());
console.log('Norm:', state.norm());`,

  primes: `const { isPrime, nextPrime, factor } = require('@aleph-ai/tinyaleph');

// Prime checking
isPrime(17);  // true
isPrime(18);  // false

// Find next prime
nextPrime(10);  // 11
nextPrime(11);  // 11

// Prime factorization
factor(60);  // [2, 2, 3, 5]

// Semantic encoding uses primes as meaning atoms
const vocabulary = {
  'love': [2, 3, 5],      // Unique prime signature
  'truth': [7, 11, 13],   // Different meaning = different primes
  'wisdom': [2, 7, 17]    // Shared primes = shared concepts
};`,
};

const physicsExamples = {
  oscillators: `const { createOscillator, kuramotoStep } = require('@aleph-ai/tinyaleph');

// Create oscillator bank
const oscillators = [];
for (let i = 0; i < 16; i++) {
  oscillators.push(createOscillator({
    frequency: 1.0 + 0.1 * (i - 8),  // Distributed frequencies
    phase: Math.random() * 2 * Math.PI,
    amplitude: 1.0
  }));
}

// Kuramoto synchronization dynamics
// dθᵢ/dt = ωᵢ + (K/N) Σⱼ sin(θⱼ - θᵢ)
const coupling = 0.3;
const dt = 0.01;

for (let t = 0; t < 1000; t++) {
  kuramotoStep(oscillators, coupling, dt);
}

// Measure synchronization (order parameter)
const { r, psi } = kuramotoOrderParameter(oscillators);
console.log('Synchronization r:', r);  // 0 = chaos, 1 = sync`,

  entropy: `const { computeEntropy, entropyRate } = require('@aleph-ai/tinyaleph');

// Shannon entropy of hypercomplex state
const pureState = createBasisState(0);
console.log(computeEntropy(pureState));  // 0.0 (fully concentrated)

const mixedState = createRandomState();
console.log(computeEntropy(mixedState)); // Higher entropy

// Track entropy reduction during reasoning
const trajectory = [];
for (const step of reasoningSteps) {
  trajectory.push(step.state);
}

const rate = entropyRate(trajectory);
// Negative rate = entropy decreasing = convergence!
console.log('Entropy rate:', rate);`,
};

const backendExamples = {
  semantic: `const { SemanticBackend, createEngine } = require('@aleph-ai/tinyaleph');

// Load configuration with vocabulary and ontology
const config = require('@aleph-ai/tinyaleph/data.json');
const backend = new SemanticBackend(config);

// Encode text to prime signatures
const primes = backend.encode('love and wisdom');
console.log(primes);  // [2, 3, 5, 7, 17, ...]

// Decode primes back to semantic content
const decoded = backend.decode(primes);

// Compare concepts via coherence
const state1 = backend.textToOrderedState('wisdom');
const state2 = backend.textToOrderedState('knowledge');
console.log('Similarity:', state1.coherence(state2));

// Process a query
const result = backend.process('What is the nature of truth?');`,

  scientific: `const { ScientificBackend } = require('@aleph-ai/tinyaleph');

const backend = new ScientificBackend(config);

// Create quantum-like states
const state = backend.createRandomState();
const basis = backend.createBasisState(0);

// Superposition: α|ψ₁⟩ + β|ψ₂⟩
const superposition = backend.superpose(
  state, 0.5,   // 50% state
  basis, 0.5    // 50% basis
);

// Measurement (collapses to basis)
const result = backend.measure(superposition, [basis]);
console.log('Probability:', result.probability);`,
};

const engineExamples = {
  full: `const { createEngine } = require('@aleph-ai/tinyaleph');

// Create semantic engine with configuration
const engine = createEngine('semantic', config);

// Run full computation pipeline
const result = engine.run('What is the relationship between wisdom and truth?');

console.log('Output:', result.output);
console.log('Entropy:', result.entropy);
console.log('Steps:', result.steps.length);

// Watch entropy decrease through transforms
for (const step of result.steps) {
  console.log(\`Step \${step.step}: entropy \${step.entropyAfter.toFixed(3)}\`);
}

// Access oscillator synchronization state
console.log('Order parameter:', result.oscillators.orderParameter);`,

  batch: `const { AlephEngine, SemanticBackend } = require('@aleph-ai/tinyaleph');

// Create engine with custom config
const backend = new SemanticBackend(config);
const engine = new AlephEngine(backend, {
  oscillatorCount: 16,
  coupling: 0.2,
  entropyThreshold: 0.05,
  maxIterations: 100
});

// Batch processing
const queries = [
  'What is consciousness?',
  'Define love and beauty',
  'Explain the nature of time'
];

const results = engine.runBatch(queries);

// Analyze all results
results.forEach((result, i) => {
  console.log(\`Query \${i + 1}:\`);
  console.log(\`  Output: \${result.output}\`);
  console.log(\`  Final entropy: \${result.entropy.toFixed(3)}\`);
});`,
};

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      {/* Module Overview */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-4">Library Modules</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              TinyAleph is organized into four core modules that work together 
              to enable prime-resonant semantic computing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModuleCard
              icon={Layers}
              title="Core"
              description="Hypercomplex algebra, prime utilities, and sedenion states"
            />
            <ModuleCard
              icon={Waves}
              title="Physics"
              description="Oscillator dynamics, Kuramoto sync, and entropy"
            />
            <ModuleCard
              icon={Database}
              title="Backends"
              description="Semantic, cryptographic, and scientific processing"
            />
            <ModuleCard
              icon={Cpu}
              title="Engine"
              description="Unified computation orchestration and pipelines"
            />
          </div>
        </div>
      </section>

      {/* Examples Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Core Module */}
        <div id="core" className="pt-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Core Module</h2>
              <p className="text-muted-foreground">Mathematical primitives for hypercomplex computing</p>
            </div>
          </div>
          
          <ExampleSection
            id="sedenion"
            title="SedenionState"
            description="The primary state object representing a point in 16-dimensional hypercomplex space. Sedenions extend octonions and have unique properties like non-associativity and zero-divisors."
            code={coreExamples.sedenion}
            visualization={
              <div className="space-y-4">
                <SedenionVisualizer 
                  components={[0.9, 0.1, 0.4, 0.2, 0.7, 0.3, 0.5, 0.1, 0.3, 0.6, 0.2, 0.8, 0.1, 0.4, 0.6, 0.2]}
                  size="lg"
                />
                <p className="text-xs text-muted-foreground text-center font-mono">
                  Live 16D state visualization
                </p>
              </div>
            }
            features={[
              'Non-commutative multiplication: a×b ≠ b×a',
              'Non-associative: (a×b)×c ≠ a×(b×c)',
              'Zero-divisors indicate semantic contradictions',
              'Entropy measures semantic uncertainty'
            ]}
          />
          
          <ExampleSection
            id="primes"
            title="Prime Encoding"
            description="Every concept maps to a unique set of prime numbers. This creates a universal semantic fingerprint where shared primes indicate shared meaning."
            code={coreExamples.primes}
            visualization={<PrimeVisualizer />}
            features={[
              'Unique prime signatures for each concept',
              'Shared primes = shared semantic content',
              'Prime factorization reveals concept structure',
              'Composable through multiplication'
            ]}
          />
        </div>

        {/* Physics Module */}
        <div id="physics" className="pt-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Waves className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Physics Module</h2>
              <p className="text-muted-foreground">Dynamical systems and synchronization</p>
            </div>
          </div>
          
          <ExampleSection
            id="oscillators"
            title="Kuramoto Oscillators"
            description="A bank of coupled phase oscillators that synchronize through the Kuramoto model. Synchronization (order parameter r → 1) indicates coherent semantic states."
            code={physicsExamples.oscillators}
            visualization={<OscillatorVisualizer count={12} coupling={0.4} />}
            features={[
              'Phase-amplitude oscillators with natural frequencies',
              'Kuramoto coupling drives synchronization',
              'Order parameter r measures coherence (0 = chaos, 1 = sync)',
              'Critical coupling threshold for phase transition'
            ]}
          />
          
          <ExampleSection
            id="entropy"
            title="Entropy Dynamics"
            description="Reasoning is modeled as entropy reduction. Transforms are applied until the system reaches a low-entropy stable state representing the answer."
            code={physicsExamples.entropy}
            visualization={<EntropyVisualizer steps={10} />}
            features={[
              'Shannon entropy measures semantic uncertainty',
              'Reasoning reduces entropy over time',
              'Negative entropy rate indicates convergence',
              'KL divergence for distribution comparison'
            ]}
          />
        </div>

        {/* Backends Module */}
        <div id="backends" className="pt-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Backends Module</h2>
              <p className="text-muted-foreground">Domain-specific computation engines</p>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-4 mb-8">
            <ModuleCard
              icon={Braces}
              title="Semantic"
              description="Natural language processing with prime encoding and ontology mapping"
            />
            <ModuleCard
              icon={Hash}
              title="Cryptographic"
              description="Semantic hashing and key derivation based on meaning"
            />
            <ModuleCard
              icon={Atom}
              title="Scientific"
              description="Quantum-inspired superposition and measurement"
            />
          </div>
          
          <ExampleSection
            id="semantic-backend"
            title="Semantic Backend"
            description="Natural language understanding through prime encoding. Text is tokenized, mapped to prime signatures via vocabulary, and embedded in hypercomplex space."
            code={backendExamples.semantic}
            features={[
              'Tokenization with stop word filtering',
              'Vocabulary-based prime assignment',
              'Ontology mapping for semantic meaning',
              'Coherence-based concept comparison'
            ]}
          />
          
          <ExampleSection
            id="scientific-backend"
            title="Scientific Backend"
            description="Quantum-inspired computation with superposition states and measurement. Enables probabilistic reasoning and interference effects."
            code={backendExamples.scientific}
            visualization={
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 text-lg font-mono text-primary">
                  <span>|ψ⟩</span>
                  <span className="text-muted-foreground">=</span>
                  <span>α|0⟩</span>
                  <span className="text-muted-foreground">+</span>
                  <span>β|1⟩</span>
                </div>
                <p className="text-xs text-muted-foreground">Quantum superposition notation</p>
              </div>
            }
            features={[
              'Random and basis state creation',
              'Superposition with complex amplitudes',
              'Measurement with probability distribution',
              'Interference and entanglement patterns'
            ]}
          />
        </div>

        {/* Engine Module */}
        <div id="engine" className="pt-20 pb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-lg bg-primary/10">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold">Engine Module</h2>
              <p className="text-muted-foreground">High-level orchestration for Aleph computations</p>
            </div>
          </div>
          
          <ExampleSection
            id="full-pipeline"
            title="Full Pipeline"
            description="The AlephEngine coordinates backends, oscillators, and transforms into a unified computation. Input is encoded, transformed until entropy is minimized, then decoded."
            code={engineExamples.full}
            features={[
              'Automatic backend coordination',
              'Iterative transform application',
              'Entropy-based convergence criteria',
              'Full metrics and step tracing'
            ]}
          />
          
          <ExampleSection
            id="batch-processing"
            title="Batch Processing"
            description="Process multiple queries efficiently with shared oscillator state. The engine maintains field coherence across sequential computations."
            code={engineExamples.batch}
            features={[
              'Sequential query processing',
              'Shared oscillator dynamics',
              'Configurable coupling and thresholds',
              'Performance metrics per query'
            ]}
          />
        </div>
      </div>

      {/* Install Section */}
      <section className="py-20 border-t border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-display font-bold mb-4">Get Started</h2>
          <p className="text-muted-foreground mb-8">
            Install tinyaleph and start exploring prime-resonant semantic computing
          </p>
          <div className="inline-block">
            <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-card border border-border">
              <Binary className="w-5 h-5 text-primary" />
              <code className="font-mono text-lg">npm install @aleph-ai/tinyaleph</code>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
