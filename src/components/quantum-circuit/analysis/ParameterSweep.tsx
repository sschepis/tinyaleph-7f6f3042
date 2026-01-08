import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { TrendingDown, Play } from 'lucide-react';
import { GateInstance, ParameterSweepResult } from '@/lib/quantum-circuit/types';
import { executeCircuit, calculateExpectationZZ } from '@/lib/quantum-circuit/simulation';

interface ParameterSweepProps {
  gates: GateInstance[];
  numWires: number;
  onSweepComplete?: (result: ParameterSweepResult) => void;
}

export const ParameterSweep = ({ gates, numWires, onSweepComplete }: ParameterSweepProps) => {
  const [sweepResult, setSweepResult] = useState<ParameterSweepResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Find parameterized gates (RZ, or we'll treat T as Rz(π/4) variations)
  const parameterizedGates = gates.filter(g => g.type === 'RZ' || g.type === 'T' || g.type === 'S');
  
  const runSweep = useCallback(() => {
    if (parameterizedGates.length === 0) return;
    
    setIsRunning(true);
    
    const numPoints = 20;
    const parameterValues: number[] = [];
    const energies: number[] = [];
    
    // Sweep parameter from 0 to 2π
    for (let i = 0; i <= numPoints; i++) {
      const theta = (i / numPoints) * 2 * Math.PI;
      parameterValues.push(theta);
      
      // Create parameter overrides for all parameterized gates
      const overrides = new Map<string, number>();
      parameterizedGates.forEach(g => {
        overrides.set(g.id, theta);
      });
      
      // Execute circuit with this parameter
      const state = executeCircuit(gates, numWires, overrides);
      
      // Calculate "energy" as sum of ZZ expectations (for QAOA-style cost)
      let energy = 0;
      for (let q1 = 0; q1 < numWires; q1++) {
        for (let q2 = q1 + 1; q2 < numWires; q2++) {
          energy += calculateExpectationZZ(state, q1, q2, numWires);
        }
      }
      // For VQE we want to minimize, for MaxCut we want edges where qubits differ
      // Use negative ZZ sum as energy (lower is better when qubits differ)
      energy = -energy;
      energies.push(energy);
    }
    
    const minEnergy = Math.min(...energies);
    const minIndex = energies.indexOf(minEnergy);
    const optimalParameter = parameterValues[minIndex];
    
    const result: ParameterSweepResult = {
      parameterValues,
      energies,
      minEnergy,
      optimalParameter,
    };
    
    setSweepResult(result);
    onSweepComplete?.(result);
    setIsRunning(false);
  }, [gates, numWires, parameterizedGates, onSweepComplete]);

  if (parameterizedGates.length === 0) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <TrendingDown className="w-4 h-4" /> Parameter Sweep
        </h3>
        <p className="text-xs text-muted-foreground">
          Load a VQE or QAOA preset to use parameter sweep
        </p>
      </div>
    );
  }

  const maxEnergy = sweepResult ? Math.max(...sweepResult.energies) : 0;
  const minEnergy = sweepResult ? Math.min(...sweepResult.energies) : 0;
  const energyRange = maxEnergy - minEnergy || 1;

  return (
    <div className="p-4 rounded-lg border border-border bg-card">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <TrendingDown className="w-4 h-4" /> VQE/QAOA Parameter Sweep
      </h3>
      
      <Button 
        onClick={runSweep} 
        size="sm" 
        className="w-full mb-3"
        disabled={isRunning}
      >
        <Play className="w-4 h-4 mr-2" />
        {isRunning ? 'Running...' : 'Run Parameter Sweep'}
      </Button>
      
      {sweepResult && (
        <div className="space-y-3">
          {/* Energy landscape visualization */}
          <div className="h-24 bg-muted/30 rounded-lg p-2 relative">
            <div className="absolute inset-2 flex items-end gap-px">
              {sweepResult.energies.map((energy, i) => {
                const height = ((energy - minEnergy) / energyRange) * 100;
                const isOptimal = i === sweepResult.energies.indexOf(sweepResult.minEnergy);
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t transition-all ${isOptimal ? 'bg-green-500' : 'bg-primary/60'}`}
                    style={{ height: `${Math.max(4, 100 - height)}%` }}
                    title={`θ = ${(sweepResult.parameterValues[i] / Math.PI).toFixed(2)}π, E = ${energy.toFixed(3)}`}
                  />
                );
              })}
            </div>
            <div className="absolute bottom-0 left-2 right-2 flex justify-between text-[8px] text-muted-foreground">
              <span>0</span>
              <span>θ</span>
              <span>2π</span>
            </div>
          </div>
          
          {/* Results summary */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-muted/30 rounded p-2">
              <p className="text-lg font-mono text-green-500">
                {(sweepResult.optimalParameter / Math.PI).toFixed(3)}π
              </p>
              <p className="text-[10px] text-muted-foreground">Optimal θ</p>
            </div>
            <div className="bg-muted/30 rounded p-2">
              <p className="text-lg font-mono text-primary">
                {sweepResult.minEnergy.toFixed(3)}
              </p>
              <p className="text-[10px] text-muted-foreground">Min Energy</p>
            </div>
          </div>
          
          <p className="text-[10px] text-muted-foreground text-center">
            Sweep over {parameterizedGates.length} parameterized gate(s)
          </p>
        </div>
      )}
    </div>
  );
};
