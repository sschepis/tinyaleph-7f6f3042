import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Play, RotateCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { PrimeState, measure, getProbabilities } from '@/lib/prime-resonance';

interface MeasurementStatsProps {
  state: PrimeState;
  onMeasure: () => void;
}

export function MeasurementStats({ state, onMeasure }: MeasurementStatsProps) {
  const [measurements, setMeasurements] = useState<Map<number, number>>(new Map());
  const [isRunning, setIsRunning] = useState(false);
  const [totalMeasurements, setTotalMeasurements] = useState(0);
  const intervalRef = useRef<number>();

  const theoreticalProbs = getProbabilities(state);
  const theoreticalMap = new Map(theoreticalProbs.map(p => [p.prime, p.probability]));
  const maxMeasured = Math.max(1, ...measurements.values());
  const totalCount = Array.from(measurements.values()).reduce((a, b) => a + b, 0) || 1;

  // Calculate KL divergence between empirical and theoretical
  const klDivergence = (): number => {
    if (measurements.size === 0) return 0;
    let kl = 0;
    for (const [prime, count] of measurements) {
      const p = count / totalCount;
      const q = theoreticalMap.get(prime) || 0.001;
      if (p > 0) {
        kl += p * Math.log2(p / q);
      }
    }
    return Math.max(0, kl);
  };

  const runMeasurement = () => {
    const result = measure(state);
    setMeasurements(prev => {
      const next = new Map(prev);
      next.set(result.prime, (next.get(result.prime) || 0) + 1);
      return next;
    });
    setTotalMeasurements(n => n + 1);
  };

  const startAutoMeasure = () => {
    setIsRunning(true);
    intervalRef.current = window.setInterval(runMeasurement, 50);
  };

  const stopAutoMeasure = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    stopAutoMeasure();
    setMeasurements(new Map());
    setTotalMeasurements(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Get sorted primes for display
  const sortedPrimes = Array.from(new Set([
    ...state.primes,
    ...measurements.keys()
  ])).sort((a, b) => a - b).slice(0, 12);

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3 text-primary" />
            Measurement Statistics
          </span>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-[10px] font-mono">
              n={totalMeasurements}
            </Badge>
            <Badge variant={klDivergence() < 0.1 ? "default" : "secondary"} className="text-[10px]">
              KL={klDivergence().toFixed(3)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Controls */}
        <div className="flex items-center gap-1">
          {isRunning ? (
            <Button size="sm" variant="destructive" className="h-6 text-[10px]" onClick={stopAutoMeasure}>
              Stop
            </Button>
          ) : (
            <Button size="sm" variant="default" className="h-6 text-[10px]" onClick={startAutoMeasure}>
              <Play className="h-3 w-3 mr-1" />
              Auto-Measure
            </Button>
          )}
          <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={runMeasurement} disabled={isRunning}>
            +1
          </Button>
          <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={reset}>
            <RotateCcw className="h-3 w-3" />
          </Button>
        </div>

        {/* Histogram */}
        <div className="space-y-1">
          {sortedPrimes.map(prime => {
            const measured = measurements.get(prime) || 0;
            const empirical = totalCount > 0 ? measured / totalCount : 0;
            const theoretical = theoreticalMap.get(prime) || 0;
            
            return (
              <div key={prime} className="flex items-center gap-2 text-[10px]">
                <span className="w-6 text-right font-mono text-muted-foreground">{prime}</span>
                <div className="flex-1 h-3 bg-secondary rounded relative overflow-hidden">
                  {/* Theoretical (background) */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-primary/20 rounded"
                    style={{ width: `${theoretical * 100}%` }}
                  />
                  {/* Empirical (foreground) */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-primary rounded transition-all duration-150"
                    style={{ width: `${empirical * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right font-mono">{measured}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-[9px] text-muted-foreground pt-1 border-t border-border">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-primary" /> Measured
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded bg-primary/20" /> Born Rule
          </span>
        </div>

        {totalMeasurements > 0 && (
          <p className="text-[9px] text-center text-muted-foreground">
            {klDivergence() < 0.05 
              ? "✓ Converged to Born rule distribution"
              : klDivergence() < 0.2
              ? "Approaching Born rule..."
              : "Continue measuring for convergence"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
