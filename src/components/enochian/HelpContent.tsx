import { Languages, Grid3X3, Sparkles, Zap, Scale } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export const ENOCHIAN_HELP: HelpStep[] = [
  {
    title: 'Welcome to Enochian Language',
    icon: Languages,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Explore the "Angelic" language through hypercomplex algebra. Each of the 
          21 Enochian letters maps to a prime number and elemental correspondence.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">21 Letters</span>
            <p className="text-xs text-muted-foreground mt-1">Each with prime & element</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">16D Sedenions</span>
            <p className="text-xs text-muted-foreground mt-1">Hypercomplex word states</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Angelic Alphabet',
    icon: Grid3X3,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The 21-letter alphabet with elemental correspondences:
        </p>
        <div className="grid grid-cols-5 gap-2 text-sm">
          <div className="p-1 rounded bg-yellow-500/20 text-center">
            <span className="text-yellow-400">Air</span>
          </div>
          <div className="p-1 rounded bg-green-500/20 text-center">
            <span className="text-green-400">Earth</span>
          </div>
          <div className="p-1 rounded bg-red-500/20 text-center">
            <span className="text-red-400">Fire</span>
          </div>
          <div className="p-1 rounded bg-blue-500/20 text-center">
            <span className="text-blue-400">Water</span>
          </div>
          <div className="p-1 rounded bg-purple-500/20 text-center">
            <span className="text-purple-400">Spirit</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Click letters in the Alphabet Grid to see their properties.
        </p>
      </div>
    ),
  },
  {
    title: 'Word Encoding',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Words are encoded as sedenion states:
        </p>
        <ol className="space-y-2 text-sm list-decimal list-inside">
          <li>Each letter → prime number</li>
          <li>Primes → 16D sedenion components</li>
          <li>Normalized to unit hypersphere</li>
          <li>Visualized as radial plot</li>
        </ol>
        <p className="text-xs text-muted-foreground">
          Try encoding words like LIGHT, TRUTH, or WISDOM in the Word Encoder.
        </p>
      </div>
    ),
  },
  {
    title: 'Sedenion Multiplication',
    icon: Zap,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Sedenions are <strong>non-commutative</strong>: A×B ≠ B×A
        </p>
        <div className="p-3 rounded-lg bg-muted/50">
          <p className="text-sm">
            The Multiplication tool shows the <strong>interference</strong> 
            between word states. High non-commutativity means the order matters!
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Try multiplying FIRE × WATER and see the interference pattern.
        </p>
      </div>
    ),
  },
  {
    title: 'Advanced Tools',
    icon: Scale,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Explore deeper with advanced examples:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Invocation Builder</span>
            <p className="text-xs text-muted-foreground">Construct words letter-by-letter, see element balance</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Zero Divisors</span>
            <p className="text-xs text-muted-foreground">Find word pairs that multiply to zero</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Entropy Analysis</span>
            <p className="text-xs text-muted-foreground">Information content of sedenion states</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">AI Oracle</span>
            <p className="text-xs text-muted-foreground">Get interpretations of your constructions</p>
          </div>
        </div>
      </div>
    ),
  },
];
