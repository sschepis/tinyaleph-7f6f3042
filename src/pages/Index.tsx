import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { Layers, Waves, Database, Cpu, ArrowRight, Play, Server, Atom, MessageSquare, Languages, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 }
};

const slideInFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 }
};

const slideInFromRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0 }
};

const pulseAnimation = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  }
};

const flowAnimation = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { duration: 1, ease: "easeInOut" }
  }
};

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
          <motion.div 
            className="grid lg:grid-cols-2 gap-8 mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {/* Core Engine Flow */}
            <motion.div variants={slideInFromLeft}>
              <Card className="overflow-hidden h-full">
                <div className="bg-primary/5 px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-sm">Core Engine Flow</h3>
                </div>
                <CardContent className="pt-6">
                  <motion.div 
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {/* Input */}
                    <motion.div 
                      className="flex items-center justify-center"
                      variants={fadeInUp}
                    >
                      <motion.div 
                        className="px-6 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono text-sm"
                        whileHover={{ scale: 1.05, borderColor: "rgba(59, 130, 246, 0.6)" }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        Input Text
                      </motion.div>
                    </motion.div>
                    
                    {/* Animated Arrow */}
                    <motion.div 
                      className="flex justify-center"
                      variants={fadeInUp}
                    >
                      <motion.div 
                        className="w-px h-6 bg-gradient-to-b from-blue-500/50 to-purple-500/50"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </motion.div>
                    
                    {/* Transform Pipeline */}
                    <motion.div 
                      className="p-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5"
                      variants={scaleIn}
                      whileHover={{ borderColor: "hsl(var(--primary))", scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <p className="text-xs text-center text-muted-foreground mb-3 font-medium">ALEPH ENGINE</p>
                      <motion.div 
                        className="flex items-center justify-center gap-2 flex-wrap"
                        variants={staggerContainer}
                      >
                        {["Tokenize", "Prime Encode", "Sedenion Map"].map((step, i) => (
                          <motion.div key={step} className="flex items-center gap-2">
                            <motion.div 
                              className="px-3 py-2 rounded-md bg-card border border-border text-xs font-mono"
                              variants={scaleIn}
                              whileHover={{ scale: 1.1, backgroundColor: "hsl(var(--primary) / 0.1)" }}
                            >
                              {step}
                            </motion.div>
                            {i < 2 && (
                              <motion.div
                                initial={{ opacity: 0, x: -5 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                              >
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                    
                    {/* Arrow */}
                    <motion.div 
                      className="flex justify-center"
                      variants={fadeInUp}
                    >
                      <motion.div 
                        className="w-px h-6 bg-gradient-to-b from-purple-500/50 to-green-500/50"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      />
                    </motion.div>
                    
                    {/* Processing */}
                    <motion.div 
                      className="grid grid-cols-3 gap-2"
                      variants={staggerContainer}
                    >
                      {[
                        { icon: Waves, label: "Kuramoto", color: "purple" },
                        { icon: Atom, label: "Field Ops", color: "green" },
                        { icon: Layers, label: "Entropy", color: "orange" }
                      ].map((item, i) => (
                        <motion.div 
                          key={item.label}
                          className={`p-3 rounded-lg bg-${item.color}-500/10 border border-${item.color}-500/30 text-center`}
                          variants={scaleIn}
                          whileHover={{ scale: 1.08, y: -2 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <motion.div
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                          >
                            <item.icon className={`w-4 h-4 mx-auto mb-1 text-${item.color}-400`} />
                          </motion.div>
                          <p className={`text-xs font-medium text-${item.color}-400`}>{item.label}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                    
                    {/* Arrow */}
                    <motion.div 
                      className="flex justify-center"
                      variants={fadeInUp}
                    >
                      <motion.div 
                        className="w-px h-6 bg-gradient-to-b from-green-500/50 to-cyan-500/50"
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                      />
                    </motion.div>
                    
                    {/* Output */}
                    <motion.div 
                      className="flex items-center justify-center"
                      variants={fadeInUp}
                    >
                      <motion.div 
                        className="px-6 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono text-sm"
                        whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)" }}
                        animate={{ boxShadow: ["0 0 0px rgba(34, 211, 238, 0)", "0 0 15px rgba(34, 211, 238, 0.2)", "0 0 0px rgba(34, 211, 238, 0)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Semantic State
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Backend Architecture */}
            <motion.div variants={slideInFromRight}>
              <Card className="overflow-hidden h-full">
                <div className="bg-primary/5 px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-sm">Backend Architecture</h3>
                </div>
                <CardContent className="pt-6">
                  <motion.div 
                    className="space-y-4"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {/* AlephEngine */}
                    <motion.div 
                      className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/30"
                      variants={scaleIn}
                      whileHover={{ scale: 1.02 }}
                      animate={{ 
                        boxShadow: ["0 0 0px hsl(var(--primary) / 0)", "0 0 20px hsl(var(--primary) / 0.2)", "0 0 0px hsl(var(--primary) / 0)"]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <div className="flex items-center justify-center gap-3">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Server className="w-5 h-5 text-primary" />
                        </motion.div>
                        <span className="font-semibold text-primary">AlephEngine</span>
                      </div>
                    </motion.div>
                    
                    {/* Connection Lines */}
                    <motion.div 
                      className="flex justify-center items-center gap-4"
                      variants={fadeInUp}
                    >
                      <motion.div 
                        className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-border"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      />
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-primary/50"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <motion.div 
                        className="flex-1 h-px bg-gradient-to-l from-transparent via-border to-border"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      />
                    </motion.div>
                    
                    {/* Backends Grid */}
                    <motion.div 
                      className="grid grid-cols-1 gap-3"
                      variants={staggerContainer}
                    >
                      {[
                        { icon: Database, name: "SemanticBackend", color: "blue", badges: ["Tokenization", "Prime Encode", "Similarity"] },
                        { icon: Layers, name: "CryptoBackend", color: "green", badges: ["Hash", "HMAC", "Key Derive"] },
                        { icon: Atom, name: "ScientificBackend", color: "purple", badges: ["Quantum Sim", "Wave Collapse", "Measurement"] }
                      ].map((backend, i) => (
                        <motion.div 
                          key={backend.name}
                          className={`p-4 rounded-lg border border-${backend.color}-500/30 bg-${backend.color}-500/5`}
                          variants={fadeInUp}
                          whileHover={{ scale: 1.02, x: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <motion.div
                              whileHover={{ rotate: 180 }}
                              transition={{ duration: 0.3 }}
                            >
                              <backend.icon className={`w-4 h-4 text-${backend.color}-400`} />
                            </motion.div>
                            <span className={`font-medium text-sm text-${backend.color}-400`}>{backend.name}</span>
                          </div>
                          <motion.div 
                            className="flex flex-wrap gap-1"
                            variants={staggerContainer}
                          >
                            {backend.badges.map((badge, j) => (
                              <motion.div
                                key={badge}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 + j * 0.05 }}
                              >
                                <Badge variant="secondary" className="text-xs">{badge}</Badge>
                              </motion.div>
                            ))}
                          </motion.div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Data Flow Diagram */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeInUp}
          >
            <Card className="overflow-hidden">
              <div className="bg-primary/5 px-4 py-3 border-b border-border">
                <h3 className="font-semibold text-sm">Semantic Processing Pipeline</h3>
              </div>
              <CardContent className="pt-6 overflow-x-auto">
                <motion.div 
                  className="flex items-center justify-center gap-3 min-w-max px-4"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                >
                  {[
                    { emoji: "📝", label: "Text", color: "blue" },
                    { emoji: "🔢", label: "Primes", color: "purple" },
                    { emoji: "🔮", label: "Sedenion", color: "green" },
                    { emoji: "〰️", label: "Oscillate", color: "orange" },
                    { emoji: "🎯", label: "Sync", color: "cyan" },
                    { emoji: "✨", label: "Result", color: "primary" }
                  ].map((step, i, arr) => (
                    <motion.div key={step.label} className="flex items-center gap-3">
                      <motion.div 
                        className="text-center"
                        variants={scaleIn}
                        transition={{ delay: i * 0.1 }}
                      >
                        <motion.div 
                          className={`w-20 h-20 rounded-full bg-${step.color}-500/10 border-2 border-${step.color}-500/40 flex items-center justify-center mb-2`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          animate={i === arr.length - 1 ? {
                            boxShadow: ["0 0 0px rgba(var(--primary), 0)", "0 0 20px hsl(var(--primary) / 0.4)", "0 0 0px rgba(var(--primary), 0)"]
                          } : undefined}
                          transition={i === arr.length - 1 ? { duration: 2, repeat: Infinity } : { type: "spring" }}
                        >
                          <motion.span 
                            className="text-2xl"
                            animate={{ y: [0, -3, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                          >
                            {step.emoji}
                          </motion.span>
                        </motion.div>
                        <p className="text-xs font-medium">{step.label}</p>
                      </motion.div>
                      
                      {i < arr.length - 1 && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1 }}
                        >
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                          >
                            <ArrowRight className="w-6 h-6 text-muted-foreground" />
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
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
