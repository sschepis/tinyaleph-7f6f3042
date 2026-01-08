import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Scan, Play } from 'lucide-react';
import { GateInstance, TomographyResult } from '@/lib/quantum-circuit/types';
import { performTomography } from '@/lib/quantum-circuit/simulation';

interface StateTomographyProps {
  gates: GateInstance[];
  numWires: number;
  seed: number;
}

export const StateTomography = ({ gates, numWires, seed }: StateTomographyProps) => {
  const [result, setResult] = useState<TomographyResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTomography = useCallback(() => {
    setIsRunning(true);
    
    // Small delay for UX
    setTimeout(() => {
      const tomoResult = performTomography(gates, numWires, 1024, seed);
      setResult(tomoResult);
      setIsRunning(false);
    }, 100);
  }, [gates, numWires, seed]);

  const dim = Math.pow(2, numWires);

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Scan className="w-4 h-4" /> State Tomography
      </h3>
      
      <Button 
        onClick={runTomography} 
        size="sm" 
        className="w-full mb-3"
        disabled={isRunning || gates.length === 0}
      >
        <Play className="w-4 h-4 mr-2" />
        {isRunning ? 'Measuring...' : 'Reconstruct Density Matrix'}
      </Button>
      
      {result && (
        <div className="space-y-3">
          {/* Purity and entropy metrics */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-muted/30 rounded p-2">
              <p className={`text-lg font-mono ${result.purity > 0.95 ? 'text-green-500' : result.purity > 0.7 ? 'text-yellow-500' : 'text-orange-500'}`}>
                {(result.purity * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-muted-foreground">Purity Tr(ρ²)</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <p className="text-lg font-mono text-primary">
                {result.vonNeumannEntropy.toFixed(3)}
              </p>
              <p className="text-[10px] text-muted-foreground">S(ρ) bits</p>
            </div>
          </div>
          
          {/* Density matrix visualization (simplified for small systems) */}
          <div className="bg-muted/30 rounded-lg p-2">
            <p className="text-[10px] text-muted-foreground mb-2 text-center">Density Matrix |ρ|</p>
            <div className="grid gap-px" style={{ gridTemplateColumns: `repeat(${Math.min(dim, 4)}, 1fr)` }}>
              {result.densityMatrix.slice(0, Math.min(dim, 4)).map((row, i) => (
                row.slice(0, Math.min(dim, 4)).map((cell, j) => {
                  const magnitude = Math.sqrt(cell.real * cell.real + cell.imag * cell.imag);
                  return (
                    <div
                      key={`${i}-${j}`}
                      className="aspect-square rounded-sm flex items-center justify-center text-[8px] font-mono"
                      style={{
                        backgroundColor: `hsl(${i === j ? 200 : 280}, 70%, ${20 + 60 * magnitude}%)`,
                      }}
                      title={`ρ[${i},${j}] = ${cell.real.toFixed(3)} + ${cell.imag.toFixed(3)}i`}
                    >
                      {magnitude.toFixed(2)}
                    </div>
                  );
                })
              ))}
            </div>
            {dim > 4 && (
              <p className="text-[8px] text-muted-foreground text-center mt-1">
                Showing 4×4 of {dim}×{dim}
              </p>
            )}
          </div>
          
          {/* Measurement basis probabilities */}
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground text-center">Measurement Bases</p>
            {(['Z', 'X', 'Y'] as const).map((basis) => {
              const probs = basis === 'Z' ? result.zBasisProbs :
                           basis === 'X' ? result.xBasisProbs : result.yBasisProbs;
              const color = basis === 'Z' ? 'bg-blue-500' : basis === 'X' ? 'bg-green-500' : 'bg-purple-500';
              return (
                <div key={basis} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono w-6">{basis}:</span>
                  <div className="flex-1 flex gap-px h-3">
                    {probs.slice(0, 8).map((p, i) => (
                      <div
                        key={i}
                        className={`flex-1 ${color} rounded-sm`}
                        style={{ opacity: 0.2 + 0.8 * p }}
                        title={`|${i}⟩: ${(p * 100).toFixed(1)}%`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="text-[10px] text-muted-foreground text-center">
            {result.purity > 0.99 ? '✓ Pure state detected' : '⚠ Mixed state (decoherence present)'}
          </p>
        </div>
      )}
      
      {gates.length === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Execute a circuit first to perform tomography
        </p>
      )}
    </div>
  );
};
