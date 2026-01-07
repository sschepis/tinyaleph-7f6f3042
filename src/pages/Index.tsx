import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { Layers, Waves, Database, Cpu, ArrowRight, Play, Server, Atom, MessageSquare, Languages, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      
      {/* Documentation Quick Links */}
      <section className="py-12 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { path: '/docs/getting-started', label: 'Getting Started', desc: 'Installation & setup' },
              { path: '/docs/user-guide', label: 'User Guide', desc: 'Deep dive tutorials' },
              { path: '/docs/app-ideas', label: 'App Ideas', desc: 'Build inspiration' },
              { path: '/docs/reference', label: 'API Reference', desc: 'Complete documentation' },
            ].map((doc) => (
              <Link key={doc.path} to={doc.path} className="group">
                <Card className="h-full hover:border-primary/50 transition-all">
                  <CardContent className="pt-4 pb-4 flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium group-hover:text-primary transition-colors">{doc.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Diagram - Mermaid Style */}
      <section className="py-16 border-t border-border bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4">System Design</Badge>
            <h2 className="text-3xl font-display font-bold mb-3">Architecture</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              TinyAleph's modular architecture enables flexible semantic computation across multiple backends.
            </p>
          </div>
          
          {/* Main Engine Diagram */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Core Engine Flow */}
            <Card className="overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Core Engine Flow</h3>
              </div>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Input */}
                  <div className="flex items-center justify-center">
                    <div className="px-6 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-sm">
                      Input Text
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="w-px h-6 bg-gradient-to-b from-blue-500/50 to-purple-500/50" />
                  </div>
                  
                  {/* Transform Pipeline */}
                  <div className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5">
                    <p className="text-xs text-center text-muted-foreground mb-3 font-medium">ALEPH ENGINE</p>
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      <div className="px-3 py-2 rounded-md bg-card border border-border text-xs font-mono">
                        Tokenize
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <div className="px-3 py-2 rounded-md bg-card border border-border text-xs font-mono">
                        Prime Encode
                      </div>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <div className="px-3 py-2 rounded-md bg-card border border-border text-xs font-mono">
                        Sedenion Map
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="w-px h-6 bg-gradient-to-b from-purple-500/50 to-green-500/50" />
                  </div>
                  
                  {/* Processing */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center">
                      <Waves className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                      <p className="text-xs font-medium text-purple-400">Kuramoto</p>
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                      <Atom className="w-4 h-4 mx-auto mb-1 text-green-400" />
                      <p className="text-xs font-medium text-green-400">Field Ops</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-center">
                      <Layers className="w-4 h-4 mx-auto mb-1 text-orange-400" />
                      <p className="text-xs font-medium text-orange-400">Entropy</p>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="w-px h-6 bg-gradient-to-b from-green-500/50 to-cyan-500/50" />
                  </div>
                  
                  {/* Output */}
                  <div className="flex items-center justify-center">
                    <div className="px-6 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-sm">
                      Semantic State
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backend Architecture */}
            <Card className="overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Backend Architecture</h3>
              </div>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* AlephEngine */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30">
                    <div className="flex items-center justify-center gap-3">
                      <Server className="w-5 h-5 text-primary" />
                      <span className="font-semibold text-primary">AlephEngine</span>
                    </div>
                  </div>
                  
                  {/* Connection Lines */}
                  <div className="flex justify-center items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border" />
                    <div className="w-2 h-2 rounded-full bg-primary/50" />
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border" />
                  </div>
                  
                  {/* Backends Grid */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Database className="w-4 h-4 text-blue-400" />
                        <span className="font-medium text-sm text-blue-400">SemanticBackend</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">Tokenization</Badge>
                        <Badge variant="secondary" className="text-xs">Prime Encode</Badge>
                        <Badge variant="secondary" className="text-xs">Similarity</Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Layers className="w-4 h-4 text-green-400" />
                        <span className="font-medium text-sm text-green-400">CryptoBackend</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">Hash</Badge>
                        <Badge variant="secondary" className="text-xs">HMAC</Badge>
                        <Badge variant="secondary" className="text-xs">Key Derive</Badge>
                      </div>
                    </div>
                    
                    <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/5">
                      <div className="flex items-center gap-3 mb-2">
                        <Atom className="w-4 h-4 text-purple-400" />
                        <span className="font-medium text-sm text-purple-400">ScientificBackend</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="secondary" className="text-xs">Quantum Sim</Badge>
                        <Badge variant="secondary" className="text-xs">Wave Collapse</Badge>
                        <Badge variant="secondary" className="text-xs">Measurement</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Data Flow Diagram */}
          <Card className="overflow-hidden">
            <div className="bg-primary/5 px-4 py-3 border-b border-border">
              <h3 className="font-semibold text-sm">Semantic Processing Pipeline</h3>
            </div>
            <CardContent className="pt-6 overflow-x-auto">
              <div className="flex items-center justify-center gap-3 min-w-max px-4">
                {/* Text Input */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-blue-500/40 flex items-center justify-center mb-2">
                    <span className="text-2xl">📝</span>
                  </div>
                  <p className="text-xs font-medium">Text</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                
                {/* Prime Encoding */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-purple-500/10 border-2 border-purple-500/40 flex items-center justify-center mb-2">
                    <span className="text-2xl">🔢</span>
                  </div>
                  <p className="text-xs font-medium">Primes</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                
                {/* Sedenion */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/40 flex items-center justify-center mb-2">
                    <span className="text-2xl">🔮</span>
                  </div>
                  <p className="text-xs font-medium">Sedenion</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                
                {/* Oscillators */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500/40 flex items-center justify-center mb-2">
                    <span className="text-2xl">〰️</span>
                  </div>
                  <p className="text-xs font-medium">Oscillate</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                
                {/* Sync */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-cyan-500/40 flex items-center justify-center mb-2">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <p className="text-xs font-medium">Sync</p>
                </div>
                
                <ArrowRight className="w-6 h-6 text-muted-foreground" />
                
                {/* Output */}
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center mb-2">
                    <span className="text-2xl">✨</span>
                  </div>
                  <p className="text-xs font-medium">Result</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
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
    </>
  );
};

export default Index;
