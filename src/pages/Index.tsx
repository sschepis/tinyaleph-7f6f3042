import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ModuleCard from '../components/ModuleCard';
import { Layers, Waves, Database, Cpu, ArrowRight, Play, Server, Atom, Network, MessageSquare, Languages } from 'lucide-react';

const exampleCategories = [
  {
    id: 'quickstart',
    path: '/quickstart',
    icon: Play,
    title: 'Quickstart',
    description: 'Hello World, hashing, and quantum coin flip',
    examples: ['Basic engine setup', 'Prime hashing', 'Quantum randomness', 'First semantic query']
  },
  {
    id: 'core',
    path: '/core',
    icon: Layers,
    title: 'Core Module',
    description: 'Hypercomplex algebra and prime utilities',
    examples: ['Sedenion states', 'Prime factorization', 'Entropy calculations', 'Non-commutative algebra']
  },
  {
    id: 'math',
    path: '/math',
    icon: Layers,
    title: 'Mathematics',
    description: 'Fano plane, algebraic integers, prime geometry',
    examples: ['Fano plane visualization', 'Gaussian integers', 'Eisenstein integers', 'Prime angles']
  },
  {
    id: 'physics',
    path: '/physics',
    icon: Waves,
    title: 'Physics Module',
    description: 'Oscillator dynamics and Kuramoto synchronization',
    examples: ['Kuramoto oscillators', 'Order parameter', 'Phase dynamics', 'Entropy tracking']
  },
  {
    id: 'scientific',
    path: '/scientific',
    icon: Waves,
    title: 'Scientific Computing',
    description: 'Information theory, Lyapunov stability, state collapse',
    examples: ['Shannon entropy', 'Lyapunov exponents', 'Born measurement', 'Decoherence']
  },
  {
    id: 'semantic',
    path: '/semantic',
    icon: Database,
    title: 'Semantic Processing',
    description: 'Vocabulary, similarity, and clustering',
    examples: ['Text encoding', 'Semantic similarity', 'Word clustering', 'Concept vectors']
  },
  {
    id: 'crypto',
    path: '/crypto',
    icon: Database,
    title: 'Cryptography',
    description: 'Hashing, key derivation, commitments',
    examples: ['Password hashing', 'HMAC', 'Key derivation', 'Commitment schemes']
  },
  {
    id: 'ml',
    path: '/ml',
    icon: Cpu,
    title: 'AI / Machine Learning',
    description: 'ResoFormer primitives and quaternion operations',
    examples: ['Quaternion composition', 'Sparse prime states', 'Resonance scoring', 'Coherence gating']
  },
  {
    id: 'typesystem',
    path: '/typesystem',
    icon: Cpu,
    title: 'Type System',
    description: 'Formal types, reduction semantics, lambda calculus',
    examples: ['Type checking', 'Reduction traces', 'Normal forms', 'Lambda translation']
  },
  {
    id: 'quantum',
    path: '/quantum',
    icon: Atom,
    title: 'Quantum States',
    description: 'PrimeState and ResonanceOperators',
    examples: ['Prime states', 'Born measurement', 'Operators P̂, R̂, Ĥ', 'Coherence tracking']
  },
  {
    id: 'engine',
    path: '/engine',
    icon: Server,
    title: 'Engine Module',
    description: 'Unified computation pipelines',
    examples: ['AlephEngine', 'Transform pipelines', 'Entropy minimization', 'Field states']
  },
  {
    id: 'api',
    path: '/api',
    icon: Server,
    title: 'Backend API',
    description: 'Server-side edge functions',
    examples: ['API calls', 'Heavy computations', 'Prime endpoints', 'Engine execution']
  },
  {
    id: 'chat',
    path: '/chat',
    icon: MessageSquare,
    title: 'Aleph Chat',
    description: 'Semantic AI chat with prime algebra',
    examples: ['LLM integration', 'Semantic encoding', 'Cross-coherence', 'Real-time visualization']
  },
  {
    id: 'enochian',
    path: '/enochian',
    icon: Languages,
    title: 'Enochian Module',
    description: '21-letter angelic alphabet with sedenion encoding',
    examples: ['Prime basis P_E', 'Word encoding', 'Sedenion multiplication', '16D visualization']
  },
];

const Index = () => {
  return (
    <>
      <Hero />
      
      {/* Interactive Examples Section */}
      <section className="py-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-4">
              <Play className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Interactive Examples</span>
            </div>
            <h2 className="text-3xl font-display font-bold mb-4">Try It Live</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore the @aleph-ai/tinyaleph library with real, running examples. 
              Each module has interactive demos that let you experiment with the API.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {exampleCategories.map((category) => (
              <Link 
                key={category.id} 
                to={category.path}
                className="group"
              >
                <div className="h-full p-6 rounded-xl border border-border bg-card hover:border-primary/50 hover:glow-box transition-all duration-300">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <category.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  
                  <ul className="space-y-2 mt-4 pt-4 border-t border-border">
                    {category.examples.map((example, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-20 border-t border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-display font-bold text-center mb-8">Quick Start</h2>
          
          <div className="space-y-6">
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-3">1. Install the package</h3>
              <div className="px-4 py-3 rounded-lg bg-muted font-mono text-sm">
                npm install @aleph-ai/tinyaleph
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-3">2. Create an engine</h3>
              <div className="px-4 py-3 rounded-lg bg-muted font-mono text-sm overflow-x-auto">
                <pre className="text-primary">{`import { createEngine } from '@aleph-ai/tinyaleph';
import config from '@aleph-ai/tinyaleph/data.json';

const engine = createEngine('semantic', config);`}</pre>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="font-semibold mb-3">3. Run a query</h3>
              <div className="px-4 py-3 rounded-lg bg-muted font-mono text-sm overflow-x-auto">
                <pre className="text-primary">{`const result = engine.run('What is wisdom?');

console.log('Output:', result.output);
console.log('Entropy:', result.entropy);
console.log('Order Parameter:', result.oscillators.orderParameter);`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="py-20 border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-display font-bold text-center mb-8">Architecture</h2>
          
          <div className="p-8 rounded-xl border border-border bg-card overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm text-muted-foreground leading-relaxed">
{`┌─────────────────────────────────────────────────────────────────┐
│                        AlephEngine                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Oscillators │◄─┤   Field     │◄─┤      Transform          │ │
│  │  (Kuramoto) │  │  (Sedenion) │  │      Pipeline           │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ SemanticBackend │ │CryptographicBack│ │ScientificBackend│
│                 │ │                 │ │                 │
│ • Tokenization  │ │ • Hash          │ │ • Quantum sim   │
│ • Prime encode  │ │ • Key derive    │ │ • Wave collapse │
│ • Transforms    │ │ • Verify        │ │ • Measurement   │
└─────────────────┘ └─────────────────┘ └─────────────────┘`}
            </pre>
          </div>
        </div>
      </section>
    </>
  );
};

export default Index;
