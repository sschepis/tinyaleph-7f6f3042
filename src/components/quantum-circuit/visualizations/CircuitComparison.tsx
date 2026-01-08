import { ComparisonResult } from '@/lib/quantum-circuit/types';

interface CircuitComparisonProps {
  comparison: ComparisonResult;
  numQubits: number;
}

export const CircuitComparison = ({ comparison, numQubits }: CircuitComparisonProps) => {
  const maxStates = Math.min(comparison.idealProbs.length, 8);
  const maxProb = Math.max(
    ...comparison.idealProbs.slice(0, maxStates), 
    ...comparison.noisyProbs.slice(0, maxStates),
    0.01
  );
  
  const formatBasis = (index: number) => {
    return `|${index.toString(2).padStart(numQubits, '0')}⟩`;
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
        <div className="text-center flex-1">
          <p className="text-xs text-muted-foreground">State Fidelity</p>
          <p className={`text-2xl font-mono font-bold ${
            comparison.fidelity > 0.95 ? 'text-green-500' : 
            comparison.fidelity > 0.8 ? 'text-yellow-500' : 'text-destructive'
          }`}>
            {(comparison.fidelity * 100).toFixed(1)}%
          </p>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center flex-1">
          <p className="text-xs text-muted-foreground">Avg Prob Error</p>
          <p className="text-xl font-mono text-muted-foreground">
            {(comparison.probDifference.reduce((a, b) => a + Math.abs(b), 0) / comparison.probDifference.length * 100).toFixed(2)}%
          </p>
        </div>
      </div>
      
      <div className="p-3 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-3 text-center">
          Probability Distribution: <span className="text-blue-400">Ideal</span> vs <span className="text-orange-400">Noisy</span>
        </p>
        <div className="flex items-end gap-1 h-28">
          {Array.from({ length: maxStates }).map((_, i) => {
            const idealHeight = (comparison.idealProbs[i] / maxProb) * 100;
            const noisyHeight = (comparison.noisyProbs[i] / maxProb) * 100;
            const diff = comparison.probDifference[i];
            
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-0.5 items-end h-20">
                  <div 
                    className="flex-1 bg-blue-500 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(4, idealHeight)}%` }}
                    title={`Ideal: ${(comparison.idealProbs[i] * 100).toFixed(1)}%`}
                  />
                  <div 
                    className="flex-1 bg-orange-500 rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(4, noisyHeight)}%` }}
                    title={`Noisy: ${(comparison.noisyProbs[i] * 100).toFixed(1)}%`}
                  />
                </div>
                <div className={`text-[8px] font-mono ${
                  Math.abs(diff) < 0.01 ? 'text-green-500' : 
                  Math.abs(diff) < 0.05 ? 'text-yellow-500' : 'text-destructive'
                }`}>
                  {diff >= 0 ? '+' : ''}{(diff * 100).toFixed(1)}%
                </div>
                <span className="text-[8px] text-muted-foreground font-mono">
                  {formatBasis(i)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="p-3 bg-muted/30 rounded-lg">
        <p className="text-xs text-muted-foreground mb-2 text-center">State Amplitude Overlap</p>
        <div className="flex gap-1">
          {comparison.stateOverlap.slice(0, maxStates).map((overlap, i) => (
            <div
              key={i}
              className="flex-1 h-4 rounded-sm"
              style={{ 
                backgroundColor: `hsl(${120 * overlap}, 70%, 45%)`,
                opacity: 0.3 + 0.7 * overlap
              }}
              title={`${formatBasis(i)}: ${(overlap * 100).toFixed(1)}% overlap`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[8px] text-muted-foreground mt-1 px-1">
          <span>Low overlap</span>
          <span>High overlap</span>
        </div>
      </div>
    </div>
  );
};
