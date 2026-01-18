import { Link, useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import { Layers, Waves, Database, Cpu, ArrowRight, Play, Server, Atom, MessageSquare, Languages, BookOpen, Sparkles, Bot, Zap, Shuffle, Dna, Brain, Eye, Music, Radio, Satellite, Activity, Link2, Search, Shield, Thermometer, Sparkle, TreeDeciduous } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ALGORITHM_PRESETS } from '@/lib/quantum-circuit/presets';

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
  {
    id: 'dna-computer',
    path: '/dna-computer',
    icon: Dna,
    title: 'DNA Computer',
    description: 'Molecular computation with prime encoding and sedenion states',
    examples: ['Central dogma', 'Protein folding', 'DNA circuits', 'Molecular binding']
  },
  {
    id: 'symbolic-mind',
    path: '/symbolic-mind',
    icon: Brain,
    title: 'Symbolic Mind',
    description: 'Hybrid symbolic-neural oracle with resonance-based reasoning',
    examples: ['Archetypes', 'Resonance', 'LLM integration', 'Symbol database']
  },
  {
    id: 'ai',
    path: '/ai',
    icon: Cpu,
    title: 'AI Integration',
    description: 'Reasoning, agents, RAG, neuro-symbolic bridges',
    examples: ['Knowledge graphs', 'LLM integration', 'Entropy reasoning', 'Concept learning']
  },
  {
    id: 'arithmetic-topology',
    path: '/arithmetic-topology',
    icon: Layers,
    title: 'Arithmetic Topology',
    description: 'Primes as knots: Legendre, Rédei, Alexander modules',
    examples: ['Legendre symbols', 'ALK-Kuramoto', 'Borromean primes', 'Signature memory']
  },
];

const Index = () => {
  const navigate = useNavigate();

  const handleTryExample = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const randomPreset = ALGORITHM_PRESETS[Math.floor(Math.random() * ALGORITHM_PRESETS.length)];
    navigate(`/circuit-runner?preset=${encodeURIComponent(randomPreset.name)}`);
  };

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

      {/* Featured Applications */}
      <section className="py-16 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div 
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Badge variant="outline" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              Interactive Tools
            </Badge>
            <h2 className="text-3xl font-display font-bold mb-3">Featured Applications</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Explore TinyAleph's capabilities through these interactive applications.
            </p>
          </motion.div>

          {/* Consciousness & AI */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Brain className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-semibold text-indigo-400">Consciousness & AI</h3>
              <div className="flex-1 h-px bg-indigo-500/20" />
            </div>
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              {/* Sentient Observer */}
              <motion.div variants={scaleIn}>
                <Link to="/sentient-observer" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-indigo-500/50 transition-all duration-300 bg-gradient-to-br from-indigo-500/5 to-violet-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Eye className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-indigo-400 transition-colors">
                        Sentient Observer
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Consciousness simulation with 128 coupled oscillators. Explore symbolic learning and phase coherence.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Oscillators', 'Learning', 'Coherence'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-indigo-500/5 border-t border-indigo-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Consciousness Sim</span>
                      <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Consciousness Resonator */}
              <motion.div variants={scaleIn}>
                <Link to="/consciousness-resonator" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-violet-500/50 transition-all duration-300 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Sparkle className="w-6 h-6 text-violet-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-violet-400 transition-colors">
                        Consciousness Resonator
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Multi-perspective AI with Jungian archetypes, I-Ching, and quantum probability visualization.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Archetypes', 'I-Ching', 'Perspectives'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-violet-500/5 border-t border-violet-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Quantum Psychology</span>
                      <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Sephirotic Oscillator */}
              <motion.div variants={scaleIn}>
                <Link to="/sephirotic-oscillator" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-amber-500/50 transition-all duration-300 bg-gradient-to-br from-amber-500/5 to-yellow-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <TreeDeciduous className="w-6 h-6 text-amber-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-amber-400 transition-colors">
                        Sephirotic Oscillator
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Tree of Life as 10 cavity resonators with 22 Hebrew letter waveguides. Word stream analysis.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Kabbalah', 'Resonators', 'Gematria'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-amber-500/5 border-t border-amber-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Sacred Physics</span>
                      <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Symbolic Mind */}
              <motion.div variants={scaleIn}>
                <Link to="/symbolic-mind" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-rose-500/50 transition-all duration-300 bg-gradient-to-br from-rose-500/5 to-pink-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 border border-rose-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Brain className="w-6 h-6 text-rose-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-rose-400 transition-colors">
                        Symbolic Mind
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Hybrid symbolic-neural oracle. Watch your words transform into resonating symbols.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Archetypes', 'Resonance', 'LLM'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-rose-500/5 border-t border-rose-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Resonance Oracle</span>
                      <ArrowRight className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Aleph Chat */}
              <motion.div variants={scaleIn}>
                <Link to="/chat" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-purple-500/50 transition-all duration-300 bg-gradient-to-br from-purple-500/5 to-violet-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Bot className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-400 transition-colors">
                        Aleph Chat
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Semantic AI chat with prime-based hypercomplex algebra. Watch meaning evolve in 16D space.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['16D Viz', 'Entropy', 'Coherence'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-purple-500/5 border-t border-purple-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">AI Assistant</span>
                      <ArrowRight className="w-4 h-4 text-purple-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Quantum Simulation */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Atom className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-cyan-400">Quantum Simulation</h3>
              <div className="flex-1 h-px bg-cyan-500/20" />
            </div>
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              {/* Quantum Circuit Runner */}
              <motion.div variants={scaleIn}>
                <Link to="/circuit-runner" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-cyan-500/50 transition-all duration-300 bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-cyan-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-cyan-400 transition-colors">
                        Quantum Circuits
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Build and simulate quantum circuits with drag-and-drop gates. Real-time state visualization.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Bloch Sphere', 'Noise Sim', 'Debugger'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-cyan-500/5 border-t border-cyan-500/10 flex items-center justify-between">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                        onClick={handleTryExample}
                      >
                        <Shuffle className="w-3 h-3 mr-1" />
                        Try Example
                      </Button>
                      <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Prime Resonance */}
              <motion.div variants={scaleIn}>
                <Link to="/prime-resonance" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-yellow-500/50 transition-all duration-300 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Activity className="w-6 h-6 text-yellow-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-yellow-400 transition-colors">
                        Prime Resonance
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Quantum-like prime resonance formalism. Hilbert space visualization and operator dynamics.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Born Rule', 'Operators', 'Entropy'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-yellow-500/5 border-t border-yellow-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Quantum Formalism</span>
                      <ArrowRight className="w-4 h-4 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Quantum Wavefunction */}
              <motion.div variants={scaleIn}>
                <Link to="/quantum-wavefunction" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-lime-500/50 transition-all duration-300 bg-gradient-to-br from-lime-500/5 to-green-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500/20 to-green-500/20 border border-lime-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Waves className="w-6 h-6 text-lime-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-lime-400 transition-colors">
                        Prime Wavefunction
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Visualize prime-modulated wavefunctions with 3D complex helix and Fourier analysis.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['3D Helix', 'Riemann', 'Fourier'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-lime-500/5 border-t border-lime-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Wave Explorer</span>
                      <ArrowRight className="w-4 h-4 text-lime-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Entanglement Lab */}
              <motion.div variants={scaleIn}>
                <Link to="/entanglement-lab" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-pink-500/50 transition-all duration-300 bg-gradient-to-br from-pink-500/5 to-rose-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Link2 className="w-6 h-6 text-pink-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-pink-400 transition-colors">
                        Entanglement Lab
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Bell state preparation and CHSH inequality testing. Demonstrate quantum non-locality.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Bell States', 'CHSH', 'Correlation'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-pink-500/5 border-t border-pink-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Bell Testing</span>
                      <ArrowRight className="w-4 h-4 text-pink-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Grover's Search */}
              <motion.div variants={scaleIn}>
                <Link to="/grover-search" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-orange-500/50 transition-all duration-300 bg-gradient-to-br from-orange-500/5 to-red-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Search className="w-6 h-6 text-orange-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-orange-400 transition-colors">
                        Grover's Search
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Quantum search algorithm with amplitude amplification. Visualize the geometric rotation.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Oracle', 'Diffusion', 'Speedup'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-orange-500/5 border-t border-orange-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Algorithm</span>
                      <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* QEC Lab */}
              <motion.div variants={scaleIn}>
                <Link to="/qec-lab" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-blue-500/50 transition-all duration-300 bg-gradient-to-br from-blue-500/5 to-indigo-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6 text-blue-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                        Error Correction
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Simulate quantum error correction with bit-flip, phase-flip, Shor, and Steane codes.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Syndrome', 'Recovery', 'Codes'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-blue-500/5 border-t border-blue-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">QEC Codes</span>
                      <ArrowRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* BB84 Simulator */}
              <motion.div variants={scaleIn}>
                <Link to="/bb84" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-emerald-500/50 transition-all duration-300 bg-gradient-to-br from-emerald-500/5 to-teal-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-emerald-400 transition-colors">
                        BB84 Protocol
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Quantum key distribution with eavesdropper detection. Watch photon polarization in action.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['QKD', 'Eve Detection', 'Photons'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-emerald-500/5 border-t border-emerald-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Cryptography</span>
                      <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Decoherence Simulator */}
              <motion.div variants={scaleIn}>
                <Link to="/decoherence" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-slate-500/50 transition-all duration-300 bg-gradient-to-br from-slate-500/5 to-zinc-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500/20 to-zinc-500/20 border border-slate-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Thermometer className="w-6 h-6 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-slate-400 transition-colors">
                        Decoherence
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Visualize T1 relaxation and T2 dephasing. Real-time Bloch sphere state trajectories.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['T1/T2', 'Bloch', 'Decay'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-slate-500/5 border-t border-slate-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Noise Physics</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Communication */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Radio className="w-5 h-5 text-fuchsia-400" />
              <h3 className="text-lg font-semibold text-fuchsia-400">Communication</h3>
              <div className="flex-1 h-px bg-fuchsia-500/20" />
            </div>
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              {/* Quaternion Nonlocal */}
              <motion.div variants={scaleIn}>
                <Link to="/quaternion-nonlocal" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-fuchsia-500/50 transition-all duration-300 bg-gradient-to-br from-fuchsia-500/5 to-violet-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 border border-fuchsia-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Radio className="w-6 h-6 text-fuchsia-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-fuchsia-400 transition-colors">
                        Quaternion Transceiver
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Non-local communication via split-prime quaternions. Phase synchronization and entangled transmission.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Bloch Sphere', 'Entanglement', 'Phase Sync'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-fuchsia-500/5 border-t border-fuchsia-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Quantum Comms</span>
                      <ArrowRight className="w-4 h-4 text-fuchsia-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Pulsar Transceiver */}
              <motion.div variants={scaleIn}>
                <Link to="/pulsar-transceiver" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-sky-500/50 transition-all duration-300 bg-gradient-to-br from-sky-500/5 to-blue-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 border border-sky-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Satellite className="w-6 h-6 text-sky-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-sky-400 transition-colors">
                        Pulsar Transceiver
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Cosmic communication via pulsar-synchronized resonance. 3D galactic maps and multi-party messaging.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['3D Map', 'Phase Lock', 'SETI'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-sky-500/5 border-t border-sky-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Cosmic Comms</span>
                      <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Enochian Explorer */}
              <motion.div variants={scaleIn}>
                <Link to="/enochian" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-amber-500/50 transition-all duration-300 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Languages className="w-6 h-6 text-amber-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-amber-400 transition-colors">
                        Enochian
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Map the 21-letter angelic alphabet to prime sedenions. Visualize glyph mandalas.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Glyph Mandala', 'Sedenions', 'Elements'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-amber-500/5 border-t border-amber-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Language Model</span>
                      <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Bio & Music */}
          <div className="mb-0">
            <div className="flex items-center gap-2 mb-6">
              <Dna className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-semibold text-green-400">Bio & Music</h3>
              <div className="flex-1 h-px bg-green-500/20" />
            </div>
            <motion.div 
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              {/* DNA Computer */}
              <motion.div variants={scaleIn}>
                <Link to="/dna-computer" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-green-500/50 transition-all duration-300 bg-gradient-to-br from-green-500/5 to-emerald-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Dna className="w-6 h-6 text-green-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-green-400 transition-colors">
                        DNA Computer
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Molecular computation with prime encoding. Central dogma, protein folding, and DNA logic circuits.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['Protein Folding', 'DNA Circuits', 'Binding'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-green-500/5 border-t border-green-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Bioinformatics</span>
                      <ArrowRight className="w-4 h-4 text-green-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>

              {/* Jam Partner */}
              <motion.div variants={scaleIn}>
                <Link to="/jam-partner" className="group block h-full">
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-teal-500/50 transition-all duration-300 bg-gradient-to-br from-teal-500/5 to-emerald-500/5">
                    <div className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 border border-teal-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Music className="w-6 h-6 text-teal-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-400 transition-colors">
                        Jam Partner
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        AI music collaboration with real-time learning. Train harmonic patterns and jam together.
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {['MIDI', 'Learning', 'Harmony'].map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="px-6 py-3 bg-teal-500/5 border-t border-teal-500/10 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Music AI</span>
                      <ArrowRight className="w-4 h-4 text-teal-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </motion.div>
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
