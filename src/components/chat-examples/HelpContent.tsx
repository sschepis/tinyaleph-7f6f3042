import { Bot, Activity, Sparkles, MessageSquare } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export const ALEPH_CHAT_HELP: HelpStep[] = [
  {
    title: 'Welcome to Aleph Chat',
    icon: Bot,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Chat with an AI that understands meaning through prime-based hypercomplex algebra. 
          Every message is encoded as a semantic state in 16D sedenion space.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Prime Encoding</span>
            <p className="text-xs text-muted-foreground mt-1">Words → prime sequences</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Sedenion State</span>
            <p className="text-xs text-muted-foreground mt-1">16D hypercomplex representation</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Semantic Metrics',
    icon: Activity,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Each message displays semantic analysis:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">H (Entropy)</span>
            <p className="text-xs text-muted-foreground">Information distribution — lower = more focused</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">C (Coherence)</span>
            <p className="text-xs text-muted-foreground">Internal meaning alignment (0-1)</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">P (Primes)</span>
            <p className="text-xs text-muted-foreground">Number of prime encodings used</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Sedenion Visualization',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The state visualizer shows your message's 16D representation:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
            <span><strong>Radial bars:</strong> Component magnitudes</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5" />
            <span><strong>Quadrants:</strong> Different dimensional groups</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
            <span><strong>Balance:</strong> Symmetric = coherent meaning</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Cross-Coherence',
    icon: MessageSquare,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The Semantic Analysis panel compares your message with AI responses:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Cross-Coherence</span>
            <p className="text-xs text-muted-foreground">How well your message and response resonate</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Entropy Comparison</span>
            <p className="text-xs text-muted-foreground">Information density in each message</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Prime Signature</span>
            <p className="text-xs text-muted-foreground">The specific primes encoding your meaning</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Toggle "Show Semantics" to see per-message metrics inline.
        </p>
      </div>
    ),
  },
];
