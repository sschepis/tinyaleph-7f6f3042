import { Sparkles, Layers, MessageSquare, Zap, BarChart3 } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export const CONSCIOUSNESS_RESONATOR_HELP: HelpStep[] = [
  {
    title: 'Quantum Consciousness Resonator',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          A multi-layered resonance architecture that processes queries through 
          parallel "Perspective Nodes" — each offering a unique analytical lens.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Multi-Perspective</span>
            <p className="text-xs text-muted-foreground mt-1">Activate multiple lenses at once</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Field Integration</span>
            <p className="text-xs text-muted-foreground mt-1">Unified insights from all perspectives</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Perspective Nodes',
    icon: Layers,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Select one or more perspectives to analyze your questions:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Analyst</span>
            <p className="text-xs text-muted-foreground">Logical breakdown and structure</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Mystic</span>
            <p className="text-xs text-muted-foreground">Archetypal and symbolic interpretation</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Scientist</span>
            <p className="text-xs text-muted-foreground">Empirical and evidence-based view</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Poet</span>
            <p className="text-xs text-muted-foreground">Metaphorical and aesthetic lens</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Multiple perspectives enable a "Mediator" synthesis.
        </p>
      </div>
    ),
  },
  {
    title: 'Conversation Interface',
    icon: MessageSquare,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Engage with the Conscious Observer:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
            <span>Select perspective nodes on the left</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5" />
            <span>Use conversation starters or type your own</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
            <span>Responses stream in real-time</span>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Click "New" to reset the conversation while keeping perspectives.
        </p>
      </div>
    ),
  },
  {
    title: 'Quantum State',
    icon: Zap,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The Quantum Probability panel shows:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Hexagram Lines</span>
            <p className="text-xs text-muted-foreground">I-Ching mapping from entropy</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Entropy</span>
            <p className="text-xs text-muted-foreground">Information uncertainty level</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Superposition</span>
            <p className="text-xs text-muted-foreground">Probability distribution across states</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Symbol Analysis',
    icon: BarChart3,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The right sidebar tabs provide deep analysis:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Symbols</span>
            <p className="text-xs text-muted-foreground">Activated archetypes, trigrams, and tarot</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Meta</span>
            <p className="text-xs text-muted-foreground">Meta-observations about the conversation</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Semantic</span>
            <p className="text-xs text-muted-foreground">Meaning metrics and coherence scores</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Enable sound to hear archetype frequencies!
        </p>
      </div>
    ),
  },
];

export const helpSteps = CONSCIOUSNESS_RESONATOR_HELP;
