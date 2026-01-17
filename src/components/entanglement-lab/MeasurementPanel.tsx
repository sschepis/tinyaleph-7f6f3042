import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MeasurementStats, MeasurementResult } from '@/lib/entanglement-lab';
import { Play, Zap, Trash2 } from 'lucide-react';

interface MeasurementPanelProps {
  stats: MeasurementStats;
  recentResults: MeasurementResult[];
  theoreticalCorrelation: number;
  onRunSingle: () => void;
  onRunMany: () => void;
  onClear: () => void;
}

export function MeasurementPanel({
  stats,
  recentResults,
  theoreticalCorrelation,
  onRunSingle,
  onRunMany,
  onClear
}: MeasurementPanelProps) {
  const lastResults = recentResults.slice(-10).reverse();
  
  // Calculate outcome percentages
  const total = stats.total || 1;
  const percentages = {
    '00': (stats.outcomes['00'] / total * 100),
    '01': (stats.outcomes['01'] / total * 100),
    '10': (stats.outcomes['10'] / total * 100),
    '11': (stats.outcomes['11'] / total * 100)
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Measurement Lab</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onRunSingle}>
            <Play className="w-3 h-3 mr-1" />
            ×1
          </Button>
          <Button size="sm" variant="outline" onClick={onRunMany}>
            <Zap className="w-3 h-3 mr-1" />
            ×100
          </Button>
          <Button size="sm" variant="ghost" onClick={onClear}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      {/* Outcome histogram */}
      <div className="space-y-2">
        <div className="text-xs text-muted-foreground">Outcome Distribution</div>
        <div className="grid grid-cols-4 gap-2">
          {(['00', '01', '10', '11'] as const).map(outcome => (
            <div key={outcome} className="space-y-1">
              <div className="h-20 bg-secondary/30 rounded relative overflow-hidden flex flex-col justify-end">
                <motion.div
                  className={`w-full ${
                    outcome === '00' || outcome === '11' 
                      ? 'bg-green-500/60' 
                      : 'bg-yellow-500/60'
                  }`}
                  initial={false}
                  animate={{ height: `${percentages[outcome]}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-xs font-bold">
                    {stats.outcomes[outcome]}
                  </span>
                </div>
              </div>
              <div className="text-center text-xs font-mono">|{outcome}⟩</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-secondary/30 rounded">
          <div className="text-xs text-muted-foreground">Measured ⟨σ_A·σ_B⟩</div>
          <div className="text-lg font-mono">
            {stats.total > 0 ? stats.correlation.toFixed(3) : '—'}
          </div>
        </div>
        <div className="p-2 bg-secondary/30 rounded">
          <div className="text-xs text-muted-foreground">Theoretical</div>
          <div className="text-lg font-mono text-primary">
            {theoreticalCorrelation.toFixed(3)}
          </div>
        </div>
      </div>
      
      {/* Error from theory */}
      {stats.total > 0 && (
        <div className="p-2 bg-secondary/20 rounded text-center">
          <div className="text-xs text-muted-foreground">
            Deviation from Theory
          </div>
          <div className="font-mono">
            {((stats.correlation - theoreticalCorrelation) * 100).toFixed(1)}%
            <span className="text-xs text-muted-foreground ml-2">
              (n = {stats.total})
            </span>
          </div>
        </div>
      )}
      
      {/* Recent results */}
      {lastResults.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Recent Measurements</div>
          <div className="flex flex-wrap gap-1">
            {lastResults.map((result, i) => (
              <motion.div
                key={recentResults.length - i}
                className={`px-2 py-0.5 rounded text-xs font-mono ${
                  result.correlation > 0 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.02 }}
              >
                {result.alice}{result.bob}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
