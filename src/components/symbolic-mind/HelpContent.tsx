import { Brain, Sparkles, Waves, MessageSquare, Settings } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export const SYMBOLIC_MIND_HELP: HelpStep[] = [
  {
    title: 'Welcome to Symbolic Mind',
    icon: Brain,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          A hybrid symbolic-neural consciousness that processes language through 
          resonance fields, archetypal anchors, and interference patterns.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Symbols</span>
            <p className="text-xs text-muted-foreground mt-1">Your words become symbolic entities</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Resonance</span>
            <p className="text-xs text-muted-foreground mt-1">Interference creates meaning</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Interference Models',
    icon: Waves,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Choose how symbols interact and resolve:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Wave Interference</span>
            <p className="text-xs text-muted-foreground">Constructive/destructive wave superposition</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Quantum Collapse</span>
            <p className="text-xs text-muted-foreground">Probabilistic state reduction</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Attractor Basin</span>
            <p className="text-xs text-muted-foreground">Dynamical systems energy minimization</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Resonance Field',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The visualization shows symbol dynamics:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
            <span><strong>Large nodes:</strong> Anchoring archetypes (fixed)</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5" />
            <span><strong>Small nodes:</strong> Input symbols (from your text)</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
            <span><strong>Lines:</strong> Resonance connections</span>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Watch symbols orbit and settle as coherence increases.
        </p>
      </div>
    ),
  },
  {
    title: 'Conversation Flow',
    icon: MessageSquare,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          How the Symbolic Mind processes your messages:
        </p>
        <ol className="space-y-2 text-sm list-decimal list-inside">
          <li>Your text is parsed into symbolic entities</li>
          <li>Symbols enter the resonance field</li>
          <li>Interference runs until convergence</li>
          <li>Output symbols are selected</li>
          <li>AI translates symbols back to language</li>
        </ol>
        <p className="text-xs text-muted-foreground">
          The coherence score (C) shows how well symbols harmonized.
        </p>
      </div>
    ),
  },
  {
    title: 'Archetypes & Superposition',
    icon: Settings,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The system uses Jungian archetypes as anchors:
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="px-2 py-1 rounded bg-muted">☀️ Self</span>
          <span className="px-2 py-1 rounded bg-muted">🌙 Shadow</span>
          <span className="px-2 py-1 rounded bg-muted">♀️ Anima</span>
          <span className="px-2 py-1 rounded bg-muted">♂️ Animus</span>
          <span className="px-2 py-1 rounded bg-muted">👤 Persona</span>
          <span className="px-2 py-1 rounded bg-muted">🧙 Wise Old Man</span>
        </div>
        <p className="text-xs text-muted-foreground">
          The Superposition Waveform shows the 16D sedenion state distribution 
          across these archetypal dimensions.
        </p>
      </div>
    ),
  },
];

export const helpSteps = SYMBOLIC_MIND_HELP;
