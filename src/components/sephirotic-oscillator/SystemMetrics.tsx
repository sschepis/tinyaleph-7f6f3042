import { motion } from 'framer-motion';
import { Activity, Zap, BarChart3 } from 'lucide-react';
import type { PillarType, SephirahName } from '@/lib/sephirotic-oscillator/types';
import { SEPHIROT } from '@/lib/sephirotic-oscillator/tree-config';
import { describeTreeState } from '@/lib/sephirotic-oscillator/semantic-analyzer';

interface SystemMetricsProps {
  totalEnergy: number;
  coherence: number;
  dominantPillar: PillarType | null;
  activeSephirot: SephirahName[];
}

const PILLAR_COLORS = {
  structure: '#06b6d4',
  consciousness: '#fbbf24',
  dynamic: '#8b5cf6'
};

const PILLAR_LABELS = {
  structure: 'Severity',
  consciousness: 'Balance',
  dynamic: 'Mercy'
};

export function SystemMetrics({
  totalEnergy,
  coherence,
  dominantPillar,
  activeSephirot
}: SystemMetricsProps) {
  const stateDescription = describeTreeState(
    activeSephirot, 
    coherence, 
    dominantPillar
  );

  return (
    <div className="bg-black/60 border border-primary/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-primary">System State</h3>
      </div>

      {/* Energy Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Zap className="w-3 h-3" />
            Total Energy
          </span>
          <span className="font-mono">{(totalEnergy * 10).toFixed(1)}</span>
        </div>
        <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
            animate={{ width: `${Math.min(100, totalEnergy * 20)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Coherence Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <BarChart3 className="w-3 h-3" />
            Coherence
          </span>
          <span className="font-mono">{(coherence * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"
            animate={{ width: `${coherence * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Dominant Pillar */}
      <div className="space-y-2">
        <span className="text-xs text-muted-foreground">Dominant Pillar</span>
        <div className="flex gap-2">
          {(['structure', 'consciousness', 'dynamic'] as PillarType[]).map(pillar => (
            <div
              key={pillar}
              className={`
                flex-1 py-1.5 rounded text-center text-[10px] font-medium uppercase tracking-wide
                transition-all duration-300
                ${dominantPillar === pillar 
                  ? 'bg-opacity-30 border' 
                  : 'bg-secondary/20 text-muted-foreground'}
              `}
              style={{
                backgroundColor: dominantPillar === pillar ? `${PILLAR_COLORS[pillar]}30` : undefined,
                borderColor: dominantPillar === pillar ? PILLAR_COLORS[pillar] : 'transparent',
                color: dominantPillar === pillar ? PILLAR_COLORS[pillar] : undefined
              }}
            >
              {PILLAR_LABELS[pillar]}
            </div>
          ))}
        </div>
      </div>

      {/* Active Sephirot */}
      {activeSephirot.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs text-muted-foreground">Active Centers</span>
          <div className="flex flex-wrap gap-1">
            {activeSephirot.map(id => {
              const sephirah = SEPHIROT[id];
              return (
                <span
                  key={id}
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: `${sephirah.color}20`,
                    color: sephirah.color,
                    border: `1px solid ${sephirah.color}40`
                  }}
                >
                  {sephirah.name}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* State Description */}
      <p className="text-xs text-muted-foreground italic border-t border-border/30 pt-3">
        {stateDescription}
      </p>
    </div>
  );
}
