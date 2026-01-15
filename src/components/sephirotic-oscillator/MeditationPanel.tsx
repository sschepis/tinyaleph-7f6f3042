import { motion } from 'framer-motion';
import { Play, Square, Sparkles } from 'lucide-react';
import type { MeditationSequence } from '@/lib/sephirotic-oscillator/types';
import { MEDITATION_SEQUENCES } from '@/lib/sephirotic-oscillator/tree-config';

interface MeditationPanelProps {
  activeMeditation: MeditationSequence | null;
  meditationStep: number;
  onStart: (sequence: MeditationSequence) => void;
  onStop: () => void;
}

export function MeditationPanel({
  activeMeditation,
  meditationStep,
  onStart,
  onStop
}: MeditationPanelProps) {
  return (
    <div className="bg-black/60 border border-primary/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-primary">Meditation Pathways</h3>
      </div>

      {activeMeditation ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{activeMeditation.name}</span>
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
            >
              <Square className="w-3 h-3" />
              Stop
            </button>
          </div>
          
          <p className="text-xs text-muted-foreground">{activeMeditation.description}</p>
          
          {/* Progress indicator */}
          <div className="flex gap-1">
            {activeMeditation.path.map((sephirah, idx) => (
              <motion.div
                key={`${sephirah}-${idx}`}
                className={`
                  flex-1 h-2 rounded-full transition-colors
                  ${idx < meditationStep 
                    ? 'bg-primary' 
                    : idx === meditationStep 
                      ? 'bg-primary/50' 
                      : 'bg-secondary/30'}
                `}
                animate={idx === meditationStep ? {
                  opacity: [0.5, 1, 0.5]
                } : undefined}
                transition={{
                  duration: 0.8,
                  repeat: Infinity
                }}
              />
            ))}
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            Step {meditationStep + 1} of {activeMeditation.path.length}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {MEDITATION_SEQUENCES.map(sequence => (
            <button
              key={sequence.id}
              onClick={() => onStart(sequence)}
              className="w-full flex items-center justify-between p-2 rounded bg-secondary/20 hover:bg-secondary/40 transition-colors text-left group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium group-hover:text-primary transition-colors">
                  {sequence.name}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {sequence.description}
                </p>
              </div>
              <Play className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors ml-2 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
