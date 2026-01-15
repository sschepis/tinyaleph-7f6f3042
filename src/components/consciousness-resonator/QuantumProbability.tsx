import type { QuantumState } from '@/lib/consciousness-resonator/types';

interface QuantumProbabilityProps {
  quantumState: QuantumState;
}

export function QuantumProbability({ quantumState }: QuantumProbabilityProps) {
  // Attractor hexagram (more stable pattern)
  const attractorLines = [true, true, false, true, false, true];

  return (
    <section className="bg-black/50 border border-green-500/60 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-green-400">Quantum Probability Layer</h2>
      
      <div className="grid grid-cols-2 gap-6 mb-4">
        <div className="flex flex-col items-center">
          <div className="flex flex-col gap-1 w-16 mb-2">
            {quantumState.hexagramLines.map((solid, i) => (
              <div 
                key={i}
                className={`h-2 ${solid ? 'bg-white' : 'bg-transparent border-t-2 border-white'}`}
              />
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">Current State</p>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="flex flex-col gap-1 w-16 mb-2">
            {attractorLines.map((solid, i) => (
              <div 
                key={i}
                className={`h-2 ${solid ? 'bg-green-400' : 'bg-transparent border-t-2 border-green-400'}`}
              />
            ))}
          </div>
          <p className="text-center text-xs text-muted-foreground">Attractor State</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 text-xs gap-2 mb-4">
        <div className="text-center">
          <div className="bg-secondary/50 p-1.5 rounded text-muted-foreground">Entropy</div>
          <div className="font-mono mt-1">{quantumState.entropy.toFixed(2)}</div>
        </div>
        <div className="text-center">
          <div className="bg-secondary/50 p-1.5 rounded text-muted-foreground">Stability</div>
          <div className="font-mono mt-1">{(quantumState.stability * 100).toFixed(0)}%</div>
        </div>
        <div className="text-center">
          <div className="bg-secondary/50 p-1.5 rounded text-muted-foreground">Proximity</div>
          <div className="font-mono mt-1">{(quantumState.proximity * 100).toFixed(0)}%</div>
        </div>
      </div>
      
      <div className="text-xs bg-secondary/30 p-2 rounded font-mono text-center">
        Eigenstate |{quantumState.eigenstate}
      </div>
    </section>
  );
}
