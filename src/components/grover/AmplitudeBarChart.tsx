import { motion } from 'framer-motion';
import { formatBinary } from '@/lib/grover';

interface AmplitudeBarChartProps {
  amplitudes: number[];
  markedStates: number[];
  numQubits: number;
  highlightedIndex?: number | null;
}

export function AmplitudeBarChart({
  amplitudes,
  markedStates,
  numQubits,
  highlightedIndex,
}: AmplitudeBarChartProps) {
  const maxAmp = Math.max(...amplitudes.map(Math.abs), 0.1);
  const showLabels = amplitudes.length <= 32;
  
  return (
    <div className="bg-secondary/20 rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Amplitude Distribution</h3>
      
      <div className="relative h-48 flex items-end gap-[2px] overflow-x-auto">
        {amplitudes.map((amp, idx) => {
          const isMarked = markedStates.includes(idx);
          const isHighlighted = highlightedIndex === idx;
          const height = Math.abs(amp) / maxAmp * 100;
          const isNegative = amp < 0;
          
          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-end flex-shrink-0"
              style={{ minWidth: showLabels ? '24px' : '8px' }}
            >
              <motion.div
                className={`w-full rounded-t-sm relative ${
                  isMarked
                    ? isNegative
                      ? 'bg-red-500'
                      : 'bg-green-500'
                    : isNegative
                      ? 'bg-red-400/50'
                      : 'bg-primary/60'
                } ${isHighlighted ? 'ring-2 ring-yellow-400' : ''}`}
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(height, 2)}%` }}
                transition={{ duration: 0.3 }}
              >
                {isMarked && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full" />
                )}
              </motion.div>
              {showLabels && (
                <span className="text-[8px] font-mono text-muted-foreground mt-1 rotate-45 origin-left">
                  {formatBinary(idx, numQubits)}
                </span>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Marked (positive)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded" />
          <span>Marked (negative)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-primary/60 rounded" />
          <span>Unmarked</span>
        </div>
      </div>
    </div>
  );
}
