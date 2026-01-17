import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CHSHResult, CLASSICAL_BOUND, QUANTUM_BOUND, explainViolation } from '@/lib/entanglement-lab';
import { Play, RotateCcw, Zap } from 'lucide-react';

interface CHSHPanelProps {
  theoreticalResult: CHSHResult;
  angles: { a: number; a_prime: number; b: number; b_prime: number };
  onAngleChange: (which: 'a' | 'a_prime' | 'b' | 'b_prime', value: number) => void;
  onRunExperiment: () => CHSHResult;
  onUseOptimal: () => void;
}

export function CHSHPanel({
  theoreticalResult,
  angles,
  onAngleChange,
  onRunExperiment,
  onUseOptimal
}: CHSHPanelProps) {
  const [experimentResult, setExperimentResult] = useState<CHSHResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  
  const handleRunExperiment = async () => {
    setIsRunning(true);
    // Small delay for visual feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    const result = onRunExperiment();
    setExperimentResult(result);
    setIsRunning(false);
  };
  
  const angleLabels = {
    a: 'Alice α',
    a_prime: "Alice α'",
    b: 'Bob β',
    b_prime: "Bob β'"
  };
  
  const displayResult = experimentResult || theoreticalResult;
  const absS = Math.abs(displayResult.S);
  
  // Calculate position on violation meter
  const meterPosition = Math.min(absS / 3, 1) * 100;
  const classicalPosition = (CLASSICAL_BOUND / 3) * 100;
  const quantumPosition = (QUANTUM_BOUND / 3) * 100;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">CHSH Inequality Test</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onUseOptimal}>
            <Zap className="w-3 h-3 mr-1" />
            Optimal
          </Button>
          <Button size="sm" onClick={handleRunExperiment} disabled={isRunning}>
            <Play className="w-3 h-3 mr-1" />
            {isRunning ? 'Running...' : 'Run Test'}
          </Button>
        </div>
      </div>
      
      {/* Angle controls */}
      <div className="grid grid-cols-2 gap-3">
        {(['a', 'a_prime', 'b', 'b_prime'] as const).map(key => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className={key.includes('a') ? 'text-blue-400' : 'text-red-400'}>
                {angleLabels[key]}
              </span>
              <span className="font-mono text-muted-foreground">
                {(angles[key] * 180 / Math.PI).toFixed(0)}°
              </span>
            </div>
            <Slider
              value={[angles[key] * 180 / Math.PI]}
              onValueChange={([v]) => onAngleChange(key, v * Math.PI / 180)}
              min={0}
              max={360}
              step={5}
              className="h-1"
            />
          </div>
        ))}
      </div>
      
      {/* CHSH Violation Meter */}
      <div className="p-4 bg-secondary/20 rounded-lg space-y-3">
        <div className="text-center">
          <span className="text-xs text-muted-foreground">CHSH Parameter</span>
          <div className="text-3xl font-mono font-bold">
            S = <span className={displayResult.violation ? 'text-green-400' : 'text-muted-foreground'}>
              {displayResult.S.toFixed(3)}
            </span>
          </div>
        </div>
        
        {/* Visual meter */}
        <div className="relative h-8 bg-secondary/50 rounded-full overflow-hidden">
          {/* Classical region */}
          <div 
            className="absolute inset-y-0 left-0 bg-muted-foreground/20"
            style={{ width: `${classicalPosition}%` }}
          />
          
          {/* Quantum region */}
          <div 
            className="absolute inset-y-0 bg-gradient-to-r from-green-500/30 to-green-500/50"
            style={{ 
              left: `${classicalPosition}%`, 
              width: `${quantumPosition - classicalPosition}%` 
            }}
          />
          
          {/* Classical bound marker */}
          <div 
            className="absolute inset-y-0 w-0.5 bg-yellow-500"
            style={{ left: `${classicalPosition}%` }}
          />
          
          {/* Quantum bound marker */}
          <div 
            className="absolute inset-y-0 w-0.5 bg-green-500"
            style={{ left: `${quantumPosition}%` }}
          />
          
          {/* Current value indicator */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-primary shadow-lg"
            initial={false}
            animate={{ left: `calc(${meterPosition}% - 8px)` }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
          
          {/* Labels */}
          <div 
            className="absolute bottom-full mb-1 text-[10px] text-yellow-500 -translate-x-1/2"
            style={{ left: `${classicalPosition}%` }}
          >
            2
          </div>
          <div 
            className="absolute bottom-full mb-1 text-[10px] text-green-500 -translate-x-1/2"
            style={{ left: `${quantumPosition}%` }}
          >
            2√2
          </div>
        </div>
        
        {/* Correlation values */}
        <div className="grid grid-cols-4 gap-1 text-xs">
          <div className="text-center p-1 bg-secondary/30 rounded">
            <div className="text-muted-foreground">E(α,β)</div>
            <div className="font-mono">{displayResult.correlations.E_ab.toFixed(2)}</div>
          </div>
          <div className="text-center p-1 bg-secondary/30 rounded">
            <div className="text-muted-foreground">E(α,β')</div>
            <div className="font-mono">{displayResult.correlations.E_ab_prime.toFixed(2)}</div>
          </div>
          <div className="text-center p-1 bg-secondary/30 rounded">
            <div className="text-muted-foreground">E(α',β)</div>
            <div className="font-mono">{displayResult.correlations.E_a_prime_b.toFixed(2)}</div>
          </div>
          <div className="text-center p-1 bg-secondary/30 rounded">
            <div className="text-muted-foreground">E(α',β')</div>
            <div className="font-mono">{displayResult.correlations.E_a_prime_b_prime.toFixed(2)}</div>
          </div>
        </div>
        
        {/* Explanation */}
        <p className="text-xs text-muted-foreground">
          {explainViolation(displayResult)}
        </p>
      </div>
    </div>
  );
}
