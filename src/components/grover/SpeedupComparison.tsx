import { calculateOptimalIterations } from '@/lib/grover';

interface SpeedupComparisonProps {
  numQubits: number;
  numMarked: number;
}

export function SpeedupComparison({ numQubits, numMarked }: SpeedupComparisonProps) {
  const N = Math.pow(2, numQubits);
  const M = Math.max(numMarked, 1);
  
  const classicalAvg = M > 0 ? N / (2 * M) : N;
  const quantumIterations = calculateOptimalIterations(N, M);
  const speedup = classicalAvg / Math.max(quantumIterations, 1);
  
  return (
    <div className="bg-secondary/20 rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Quadratic Speedup</h3>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Classical (average)</div>
            <div className="h-4 bg-secondary/50 rounded overflow-hidden">
              <div 
                className="h-full bg-orange-500/60"
                style={{ width: '100%' }}
              />
            </div>
            <div className="text-xs font-mono mt-1">
              O(N/M) ≈ {classicalAvg.toFixed(0)} queries
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Grover's Algorithm</div>
            <div className="h-4 bg-secondary/50 rounded overflow-hidden">
              <div 
                className="h-full bg-green-500/60"
                style={{ width: `${Math.min((quantumIterations / classicalAvg) * 100, 100)}%` }}
              />
            </div>
            <div className="text-xs font-mono mt-1">
              O(√(N/M)) ≈ {quantumIterations} iterations
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-primary/10 rounded-lg text-center">
        <div className="text-xs text-muted-foreground">Speedup Factor</div>
        <div className="text-2xl font-bold text-primary">
          {speedup.toFixed(1)}×
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          √{N} = {Math.sqrt(N).toFixed(1)}
        </div>
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        <p>
          For N = {N} items with M = {M} marked, classical search needs ~{classicalAvg.toFixed(0)} queries 
          on average, while Grover's needs only ~{quantumIterations} iterations.
        </p>
      </div>
    </div>
  );
}
