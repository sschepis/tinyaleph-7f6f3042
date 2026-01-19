import { Brain, Shield, AtomIcon, Dna, BookOpen, Sparkles, Layers, Code } from 'lucide-react';
import { HelpStep } from '@/components/app-help';

export const BACKENDS_HELP_STEPS: HelpStep[] = [
  {
    title: 'Welcome to Library Backends',
    icon: BookOpen,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          This page demonstrates the <strong className="text-foreground">four specialized backends</strong> of 
          the @aleph-ai/tinyaleph library, all unified by prime-based hypercomplex algebra.
        </p>
        <p>
          Each backend transforms domain-specific data into hypercomplex states for analysis, 
          comparison, and computation.
        </p>
      </div>
    ),
  },
  {
    title: 'Semantic Backend',
    icon: Brain,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          The <strong className="text-foreground">Semantic Backend</strong> processes natural language 
          by encoding words into prime signatures based on a semantic vocabulary.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">tokenize()</strong> - Split text into tokens with vocabulary lookup</li>
          <li><strong className="text-foreground">encode()</strong> - Convert text to prime signature array</li>
          <li><strong className="text-foreground">primesToState()</strong> - Map primes to 16D sedenion states</li>
          <li><strong className="text-foreground">coherence()</strong> - Measure semantic similarity</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Cryptographic Backend',
    icon: Shield,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          The <strong className="text-foreground">Cryptographic Backend</strong> provides semantic-aware 
          hashing and key derivation, where similar meanings produce similar hashes.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">hash()</strong> - Semantic-aware hash function</li>
          <li><strong className="text-foreground">deriveKey()</strong> - PBKDF2-style key derivation</li>
          <li><strong className="text-foreground">hmac()</strong> - Message authentication codes</li>
          <li><strong className="text-foreground">verify()</strong> - Content integrity verification</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Scientific Backend',
    icon: AtomIcon,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          The <strong className="text-foreground">Scientific Backend</strong> simulates quantum computing 
          concepts using hypercomplex states representing qubits.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">encode()</strong> - Encode quantum state notation (|0⟩, |+⟩, etc.)</li>
          <li><strong className="text-foreground">applyGate()</strong> - Apply quantum gates (H, X, CNOT...)</li>
          <li><strong className="text-foreground">measure()</strong> - Born rule collapse to classical outcome</li>
          <li><strong className="text-foreground">createEntangledPair()</strong> - Generate Bell states</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Bioinformatics Backend',
    icon: Dna,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          The <strong className="text-foreground">Bioinformatics Backend</strong> performs DNA/RNA/protein 
          analysis with prime encoding of nucleotides.
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong className="text-foreground">transcribe()</strong> - DNA → RNA transcription</li>
          <li><strong className="text-foreground">translate()</strong> - RNA → Protein translation</li>
          <li><strong className="text-foreground">complement()</strong> - Generate complementary strand</li>
          <li><strong className="text-foreground">findORFs()</strong> - Locate open reading frames</li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Unified Architecture',
    icon: Layers,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          All four backends share a <strong className="text-foreground">common interface</strong>:
        </p>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="p-2 rounded bg-muted/50 text-center">
            <code className="text-xs font-mono text-primary">encode()</code>
            <p className="text-xs mt-1">Domain → Primes</p>
          </div>
          <div className="p-2 rounded bg-muted/50 text-center">
            <code className="text-xs font-mono text-primary">primesToState()</code>
            <p className="text-xs mt-1">Primes → Hypercomplex</p>
          </div>
          <div className="p-2 rounded bg-muted/50 text-center">
            <code className="text-xs font-mono text-primary">entropy()</code>
            <p className="text-xs mt-1">Measure disorder</p>
          </div>
          <div className="p-2 rounded bg-muted/50 text-center">
            <code className="text-xs font-mono text-primary">coherence()</code>
            <p className="text-xs mt-1">Measure similarity</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Try the Demos',
    icon: Code,
    content: (
      <div className="space-y-3 text-sm text-muted-foreground">
        <p>
          Each tab contains <strong className="text-foreground">interactive demos</strong> where you can:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Enter your own input data</li>
          <li>See real-time encoding and analysis results</li>
          <li>Compare similarity between different inputs</li>
          <li>View example code for each operation</li>
        </ul>
        <p className="pt-2">
          Use the tabs to switch between backends and explore each domain's unique capabilities.
        </p>
      </div>
    ),
  },
];

export const helpSteps = BACKENDS_HELP_STEPS;
