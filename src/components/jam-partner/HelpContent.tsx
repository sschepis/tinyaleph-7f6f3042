import { Music, Keyboard, Brain, Waves, Settings } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export const JAM_PARTNER_HELP: HelpStep[] = [
  {
    title: 'Welcome to Jam Partner',
    icon: Music,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          An AI music companion that learns harmonic patterns and plays alongside you. 
          Train it with musical phrases, then jam together in real-time!
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Training Mode</span>
            <p className="text-xs text-muted-foreground mt-1">Teach the AI musical patterns</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Jamming Mode</span>
            <p className="text-xs text-muted-foreground mt-1">Play together with AI responses</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Virtual Piano',
    icon: Keyboard,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The interface has two piano keyboards:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Your Input (bottom)</span>
            <p className="text-xs text-muted-foreground">Click keys or use your keyboard to play</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">AI Output (top)</span>
            <p className="text-xs text-muted-foreground">Watch the AI respond to your notes</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Keyboard mapping: A-K for white keys, W-U for black keys.
        </p>
      </div>
    ),
  },
  {
    title: 'Auto-Train Mode',
    icon: Brain,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Let the AI learn from pre-programmed musical patterns:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Scale Patterns</span>
            <p className="text-xs text-muted-foreground">Major, minor, pentatonic progressions</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Chord Sequences</span>
            <p className="text-xs text-muted-foreground">Common jazz and pop chord patterns</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Arpeggios</span>
            <p className="text-xs text-muted-foreground">Broken chord exercises</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Start Auto-Train and watch the harmony matrix fill in!
        </p>
      </div>
    ),
  },
  {
    title: 'Harmony Visualization',
    icon: Waves,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The Learned Harmony heatmap shows what the AI has learned:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
            <span><strong>Rows:</strong> Input note</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5" />
            <span><strong>Columns:</strong> Response note</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
            <span><strong>Color:</strong> Association strength</span>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          The diagonal shows self-responses; clusters show learned harmonic relationships.
        </p>
      </div>
    ),
  },
  {
    title: 'Controls & MIDI',
    icon: Settings,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Fine-tune your jamming experience:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Mode</span>
            <p className="text-xs text-muted-foreground">Switch between training and jamming</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Tempo</span>
            <p className="text-xs text-muted-foreground">Adjust the speed of AI responses</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Responsiveness</span>
            <p className="text-xs text-muted-foreground">How quickly AI reacts to your playing</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Connect MIDI</span>
            <p className="text-xs text-muted-foreground">Use a real MIDI keyboard</p>
          </div>
        </div>
      </div>
    ),
  },
];

export const helpSteps = JAM_PARTNER_HELP;
