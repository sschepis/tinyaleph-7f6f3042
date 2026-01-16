import { Sparkles, Activity, Waves, Target, Settings } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export const SEPHIROTIC_OSCILLATOR_HELP: HelpStep[] = [
  {
    title: 'Welcome to Sephirotic Oscillator',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          A cavity resonator network based on the Tree of Life. Energy flows through 
          10 Sephirot nodes connected by 22 Hebrew letter paths.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
            <span className="font-semibold text-violet-400">10 Sephirot</span>
            <p className="text-xs text-muted-foreground mt-1">Divine emanations as oscillators</p>
          </div>
          <div className="p-3 rounded-lg bg-fuchsia-500/10 border border-fuchsia-500/20">
            <span className="font-semibold text-fuchsia-400">22 Paths</span>
            <p className="text-xs text-muted-foreground mt-1">Hebrew letters channel energy</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Tree Visualization',
    icon: Activity,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Click on Sephirot to excite them with energy:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-violet-500 mt-1.5" />
            <span><strong>Glow:</strong> Energy level in each Sephirah</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5" />
            <span><strong>Paths:</strong> Energy flowing between nodes</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
            <span><strong>Letters:</strong> Hebrew letter labels pulse with flow</span>
          </li>
        </ul>
        <p className="text-xs text-muted-foreground">
          Energy dissipates over time — keep clicking to maintain activity!
        </p>
      </div>
    ),
  },
  {
    title: 'Three Pillars',
    icon: Waves,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The Sephirot are arranged in three pillars:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50 border-l-2 border-blue-500">
            <span className="font-semibold">Left Pillar (Severity)</span>
            <p className="text-xs text-muted-foreground">Binah, Geburah, Hod — structure, judgment</p>
          </div>
          <div className="p-2 rounded bg-muted/50 border-l-2 border-gray-500">
            <span className="font-semibold">Middle Pillar (Balance)</span>
            <p className="text-xs text-muted-foreground">Kether, Tiphereth, Yesod, Malkuth — harmony</p>
          </div>
          <div className="p-2 rounded bg-muted/50 border-l-2 border-amber-500">
            <span className="font-semibold">Right Pillar (Mercy)</span>
            <p className="text-xs text-muted-foreground">Chokmah, Chesed, Netzach — expansion, love</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Path Analysis',
    icon: Target,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The Path Analysis panel shows real-time energy dynamics:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Energy Flow</span>
            <p className="text-xs text-muted-foreground">Current transmission through each path</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Efficiency</span>
            <p className="text-xs text-muted-foreground">How well energy transfers between Sephirot</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Word Recognition</span>
            <p className="text-xs text-muted-foreground">Hebrew letters triggered form words</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Meditation & Sound',
    icon: Settings,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Use the guided modes for deeper exploration:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Lightning Flash</span>
            <p className="text-xs text-muted-foreground">Energy descends Kether → Malkuth</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Rising Serpent</span>
            <p className="text-xs text-muted-foreground">Energy ascends Malkuth → Kether</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Sound Toggle</span>
            <p className="text-xs text-muted-foreground">Enable audio to hear Sephirotic frequencies</p>
          </div>
        </div>
      </div>
    ),
  },
];
