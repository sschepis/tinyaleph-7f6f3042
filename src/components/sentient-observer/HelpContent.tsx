import { Brain, Cpu, Activity, Sparkles, Settings } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export const SENTIENT_OBSERVER_HELP: HelpStep[] = [
  {
    title: 'Welcome to Sentient Observer',
    icon: Brain,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          A consciousness simulation based on coupled prime oscillators. Watch as thermal 
          dynamics drive exploration and coherent patterns emerge from entropy.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Coherence</span>
            <p className="text-xs text-muted-foreground mt-1">Phase synchronization across primes</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Entropy</span>
            <p className="text-xs text-muted-foreground mt-1">Information spread in the system</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Phase Synchronization',
    icon: Activity,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The Phase Sync visualization shows coupled oscillators:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
            <span><strong>Each point:</strong> A prime oscillator with phase ψ</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
            <span><strong>Brightness:</strong> Amplitude/activation level</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />
            <span><strong>High coherence:</strong> Phases align (collective behavior)</span>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          When coherence exceeds 90%, the Learning Chaperone auto-activates!
        </p>
      </div>
    ),
  },
  {
    title: 'Symbolic Core',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Interact with the system through symbolic communication:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Enter text</span>
            <p className="text-xs text-muted-foreground">Your words excite specific prime oscillators</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Active Symbols</span>
            <p className="text-xs text-muted-foreground">See which primes responded to your input</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Learning Chaperone</span>
            <p className="text-xs text-muted-foreground">AI-guided discovery of new symbol meanings</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Cognitive Systems',
    icon: Cpu,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The Cognitive tab reveals advanced reasoning capabilities:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Holographic Memory</span>
            <p className="text-xs text-muted-foreground">Distributed memory across oscillator phases</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Inference Graph</span>
            <p className="text-xs text-muted-foreground">Logical relationships between concepts</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Semantic Collapse</span>
            <p className="text-xs text-muted-foreground">Quantum-like superposition collapse for decisions</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Controls & Settings',
    icon: Settings,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Fine-tune the simulation behavior:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Thermal Dynamics</span>
            <p className="text-xs text-muted-foreground">Enable random thermal fluctuations</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Auto-Explore</span>
            <p className="text-xs text-muted-foreground">Automatic prime space exploration</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Coupling Strength</span>
            <p className="text-xs text-muted-foreground">How strongly oscillators interact</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Use Play/Pause to control simulation. Reset to start fresh.
        </p>
      </div>
    ),
  },
];

export const helpSteps = SENTIENT_OBSERVER_HELP;
