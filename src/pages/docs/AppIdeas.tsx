import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, MessageSquare, Search, FileText, Network, Sparkles, 
  BookOpen, Tags, AlertTriangle, Music, Gamepad2, Bot, Dna, Atom,
  Lock, Calculator, Lightbulb, Layers, Zap, Globe, HeartPulse, Code2
} from "lucide-react";

const appIdeas = [
  // === AI & Machine Learning ===
  {
    title: "ResoFormer Text Generator",
    description: "Build a character-level language model using the ResoFormer architecture with prime-encoded attention and coherence-gated halting.",
    icon: Brain,
    difficulty: "Advanced",
    tags: ["ResoFormer", "Text Generation", "ML"],
    features: [
      "Prime-encoded token embeddings",
      "Resonant attention with Jaccard similarity",
      "Adaptive depth via coherence gating",
      "Entropy collapse for token selection"
    ]
  },
  {
    title: "AI Agent with Semantic Memory",
    description: "Create an autonomous agent that maintains long-term semantic memory using PR-Graph storage and quaternion-based state composition.",
    icon: Bot,
    difficulty: "Advanced",
    tags: ["Agents", "Memory", "Quaternions"],
    features: [
      "Hamilton product state mixing",
      "Prime resonance identity for memory keys",
      "Holographic memory field retrieval",
      "Goal-oriented reasoning chains"
    ]
  },
  {
    title: "RAG System with Prime Semantics",
    description: "Build a Retrieval-Augmented Generation system using prime-encoded document embeddings for precise semantic matching.",
    icon: FileText,
    difficulty: "Intermediate",
    tags: ["RAG", "Search", "Documents"],
    features: [
      "Document chunking with prime signatures",
      "Hybrid keyword + semantic search",
      "Context window optimization",
      "Source attribution with similarity scores"
    ]
  },
  {
    title: "Concept Learning Dashboard",
    description: "Visualize how AI learns new concepts by mapping them to prime Hilbert space and tracking entropy reduction over time.",
    icon: Lightbulb,
    difficulty: "Intermediate",
    tags: ["Visualization", "Learning", "Entropy"],
    features: [
      "Real-time concept embedding visualization",
      "Entropy trajectory plots",
      "Concept clustering with Kuramoto sync",
      "Similarity heatmaps"
    ]
  },

  // === Quantum Computing ===
  {
    title: "Quantum Circuit Educator",
    description: "Interactive platform for learning quantum computing with step-by-step circuit visualization and Bloch sphere animations.",
    icon: Atom,
    difficulty: "Intermediate",
    tags: ["Quantum", "Education", "Circuits"],
    features: [
      "Drag-and-drop gate construction",
      "Real-time state vector display",
      "Bell state and entanglement demos",
      "Algorithm walkthroughs (Grover, QFT)"
    ]
  },
  {
    title: "Quantum Random Oracle",
    description: "Generate cryptographically secure random numbers using quantum measurement simulation with verifiable entropy.",
    icon: Lock,
    difficulty: "Beginner",
    tags: ["Quantum", "Cryptography", "Random"],
    features: [
      "True random bit generation",
      "Entropy verification metrics",
      "Random integer/float generation",
      "Lottery & dice applications"
    ]
  },
  {
    title: "Quantum Algorithm Benchmarker",
    description: "Compare classical vs quantum algorithm performance with visual complexity analysis and speedup demonstrations.",
    icon: Zap,
    difficulty: "Advanced",
    tags: ["Quantum", "Algorithms", "Benchmarking"],
    features: [
      "Deutsch-Jozsa speedup demo",
      "Grover search complexity plots",
      "VQE energy landscape visualization",
      "Circuit depth vs accuracy tradeoffs"
    ]
  },

  // === Bioinformatics & DNA Computing ===
  {
    title: "DNA Sequence Analyzer",
    description: "Analyze DNA sequences using hypercomplex encoding to detect patterns, mutations, and structural features.",
    icon: Dna,
    difficulty: "Intermediate",
    tags: ["Bioinformatics", "DNA", "Analysis"],
    features: [
      "Nucleotide to sedenion encoding",
      "Codon frequency analysis",
      "Mutation impact scoring",
      "Protein property prediction"
    ]
  },
  {
    title: "Molecular Binding Simulator",
    description: "Simulate Watson-Crick base pairing and molecular hybridization using coherence-based affinity calculations.",
    icon: HeartPulse,
    difficulty: "Advanced",
    tags: ["Molecular", "Simulation", "Biology"],
    features: [
      "Complementary strand matching",
      "Binding affinity visualization",
      "Mispairing detection",
      "Melting temperature estimation"
    ]
  },
  {
    title: "DNA Computing Playground",
    description: "Solve NP-hard problems like Hamiltonian Path using Adleman's DNA computing algorithm with strand pool visualization.",
    icon: Network,
    difficulty: "Advanced",
    tags: ["DNA Computing", "Algorithms", "NP-hard"],
    features: [
      "Strand pool generation",
      "Kuramoto-driven parallel reactions",
      "Solution extraction visualization",
      "Graph coloring solver"
    ]
  },

  // === Mathematics & Physics ===
  {
    title: "Hypercomplex Calculator",
    description: "Advanced calculator supporting quaternions, octonions, and sedenions with visualization of algebraic operations.",
    icon: Calculator,
    difficulty: "Beginner",
    tags: ["Math", "Calculator", "Hypercomplex"],
    features: [
      "Quaternion rotation calculator",
      "Octonion multiplication table",
      "Sedenion zero divisor finder",
      "Fano plane visualizer"
    ]
  },
  {
    title: "Chaos & Synchronization Lab",
    description: "Explore dynamical systems with Kuramoto oscillator networks, Lyapunov stability analysis, and entropy dynamics.",
    icon: Layers,
    difficulty: "Intermediate",
    tags: ["Physics", "Chaos", "Oscillators"],
    features: [
      "Real-time Kuramoto synchronization",
      "Lyapunov exponent estimation",
      "Phase-locked ring visualization",
      "Small-world network topology"
    ]
  },
  {
    title: "Prime Hilbert Space Explorer",
    description: "Visualize quantum-like states in prime basis, apply resonance operators, and observe entropy-driven evolution.",
    icon: Sparkles,
    difficulty: "Advanced",
    tags: ["Quantum Semantics", "Primes", "Hilbert Space"],
    features: [
      "Prime basis state visualization",
      "Resonance operator application (P̂, R̂, Ĥ)",
      "Born measurement simulation",
      "Entropy collapse dynamics"
    ]
  },

  // === Original Ideas (Enhanced) ===
  {
    title: "Semantic Search Engine",
    description: "Build a search that understands meaning using prime signature matching. Find documents by concept even when exact terms don't match.",
    icon: Search,
    difficulty: "Beginner",
    tags: ["NLP", "Search", "Documents"],
    features: [
      "Query expansion via semantic neighbors",
      "Relevance ranking by coherence scores",
      "Typo-tolerant prime encoding",
      "Sedenion similarity metrics"
    ]
  },
  {
    title: "Knowledge Graph Builder",
    description: "Automatically construct knowledge graphs from text using prime resonance identity for entity linking and relationship extraction.",
    icon: Network,
    difficulty: "Intermediate",
    tags: ["Knowledge Graph", "NLP", "Entities"],
    features: [
      "Entity extraction with prime signatures",
      "Relationship inference via entanglement",
      "Graph traversal with phase coherence",
      "Interactive visualization"
    ]
  },
  {
    title: "Neuro-Symbolic Reasoning Engine",
    description: "Combine neural pattern recognition with symbolic logic using the prime resonance framework for explainable AI.",
    icon: Code2,
    difficulty: "Advanced",
    tags: ["Neuro-Symbolic", "Reasoning", "AI"],
    features: [
      "Symbol grounding in prime space",
      "Logic rule extraction",
      "Abductive inference",
      "Explanation generation"
    ]
  },
  {
    title: "Smart Note-Taking App",
    description: "Notes that automatically link related ideas using semantic similarity and surface relevant past entries.",
    icon: FileText,
    difficulty: "Beginner",
    tags: ["Productivity", "Notes", "PKM"],
    features: [
      "Auto-linking by prime resonance",
      "Related notes sidebar",
      "Semantic search across all notes",
      "Concept graph visualization"
    ]
  },
  {
    title: "Content Recommendation System",
    description: "Recommend articles, products, or media based on user preferences modeled in sedenion semantic space.",
    icon: Sparkles,
    difficulty: "Intermediate",
    tags: ["Recommendations", "E-commerce", "Media"],
    features: [
      "User taste modeling in sedenion space",
      "Cold-start handling via prime semantics",
      "Diversity-aware recommendations",
      "Quaternion-based preference mixing"
    ]
  },
  {
    title: "Interactive Story Engine",
    description: "Generate branching narratives where story elements maintain semantic coherence using entropy constraints.",
    icon: Gamepad2,
    difficulty: "Advanced",
    tags: ["Gaming", "Narrative", "Creative"],
    features: [
      "Plot consistency via coherence gating",
      "Character relationship in quaternion space",
      "Theme-aware branch generation",
      "Player preference adaptation"
    ]
  },
  {
    title: "Music Mood Mapper",
    description: "Analyze and organize music by emotional content using oscillator synchronization for smooth playlist transitions.",
    icon: Music,
    difficulty: "Advanced",
    tags: ["Music", "Emotion", "Playlists"],
    features: [
      "Lyric semantic analysis",
      "Kuramoto-smooth transitions",
      "Mood trajectory visualization",
      "Genre-independent similarity"
    ]
  },
  {
    title: "Multi-Language Semantic Bridge",
    description: "Create cross-language semantic mappings using prime resonance to find concept equivalents across languages.",
    icon: Globe,
    difficulty: "Advanced",
    tags: ["Translation", "NLP", "Multi-language"],
    features: [
      "Language-agnostic prime signatures",
      "Concept alignment without parallel corpora",
      "Cultural nuance preservation",
      "Translation quality scoring"
    ]
  }
];

const difficultyColors = {
  "Beginner": "bg-green-500/10 text-green-500 border-green-500/20",
  "Intermediate": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  "Advanced": "bg-red-500/10 text-red-500 border-red-500/20"
};

const AppIdeas = () => {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4">
        <Badge variant="outline" className="mb-4">Documentation</Badge>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          App Ideas
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Inspiration for what you can build with TinyAleph. From quantum circuits to AI agents to DNA computing.
        </p>
      </section>

      {/* Category Sections */}
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-muted-foreground">Categories</h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">AI & ML</Badge>
          <Badge variant="secondary">Quantum</Badge>
          <Badge variant="secondary">Bioinformatics</Badge>
          <Badge variant="secondary">Mathematics</Badge>
          <Badge variant="secondary">NLP</Badge>
          <Badge variant="secondary">Creative</Badge>
        </div>
      </section>

      {/* Filter Legend */}
      <section className="flex flex-wrap gap-4 justify-center">
        <div className="flex items-center gap-2">
          <Badge className={difficultyColors["Beginner"]}>Beginner</Badge>
          <span className="text-sm text-muted-foreground">Good first project</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={difficultyColors["Intermediate"]}>Intermediate</Badge>
          <span className="text-sm text-muted-foreground">Some experience needed</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={difficultyColors["Advanced"]}>Advanced</Badge>
          <span className="text-sm text-muted-foreground">Complex implementation</span>
        </div>
      </section>

      {/* App Ideas Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appIdeas.map((app) => (
          <Card key={app.title} className="flex flex-col hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-lg bg-primary/10 w-fit">
                  <app.icon className="w-6 h-6 text-primary" />
                </div>
                <Badge className={difficultyColors[app.difficulty as keyof typeof difficultyColors]}>
                  {app.difficulty}
                </Badge>
              </div>
              <CardTitle className="mt-4">{app.title}</CardTitle>
              <CardDescription>{app.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex flex-wrap gap-1 mb-4">
                {app.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="mt-auto">
                <p className="text-sm font-medium mb-2">Key Features:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {app.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Call to Action */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold">Ready to Build?</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Explore the interactive examples to see TinyAleph in action. Try the Quantum Circuit Runner, AI Integration demos, or DNA Computer.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link 
            to="/quantum-circuit" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Atom className="w-4 h-4" />
            Quantum Circuits
          </Link>
          <Link 
            to="/ai" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
          >
            <Brain className="w-4 h-4" />
            AI Examples
          </Link>
          <Link 
            to="/dna-computer" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
          >
            <Dna className="w-4 h-4" />
            DNA Computer
          </Link>
          <Link 
            to="/docs/reference" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
          >
            API Reference
          </Link>
        </div>
      </section>

      {/* Navigation */}
      <section className="flex justify-between pt-8 border-t">
        <Link to="/docs/user-guide" className="text-muted-foreground hover:text-primary transition-colors">
          ← User Guide
        </Link>
        <Link to="/docs/reference" className="text-primary hover:underline">
          Reference Guide →
        </Link>
      </section>
    </div>
  );
};

export default AppIdeas;