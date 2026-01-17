import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, StepForward, FastForward, Target } from 'lucide-react';

interface ControlPanelProps {
  numQubits: number;
  currentIteration: number;
  optimalIterations: number;
  probabilityMarked: number;
  phase: string;
  isAnimating: boolean;
  hasState: boolean;
  animationSpeed: number;
  onNumQubitsChange: (n: number) => void;
  onInitialize: () => void;
  onStepFull: () => void;
  onRunToOptimal: () => void;
  onMeasure: () => void;
  onReset: () => void;
  onRunAnimated: () => void;
  onAnimationSpeedChange: (speed: number) => void;
}

export function ControlPanel({
  numQubits,
  currentIteration,
  optimalIterations,
  probabilityMarked,
  phase,
  isAnimating,
  hasState,
  animationSpeed,
  onNumQubitsChange,
  onInitialize,
  onStepFull,
  onRunToOptimal,
  onMeasure,
  onReset,
  onRunAnimated,
  onAnimationSpeedChange,
}: ControlPanelProps) {
  const phaseLabels: Record<string, string> = {
    idle: 'Not initialized',
    initial: 'Uniform superposition',
    oracle: 'After oracle (phase flip)',
    diffusion: 'After diffusion',
    measured: 'Measured',
  };
  
  return (
    <div className="bg-secondary/20 rounded-lg p-4 space-y-4">
      <h3 className="text-sm font-medium">Controls</h3>
      
      {/* Qubit slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Number of Qubits</span>
          <span className="font-mono">{numQubits} ({Math.pow(2, numQubits)} states)</span>
        </div>
        <Slider
          value={[numQubits]}
          onValueChange={([v]) => onNumQubitsChange(v)}
          min={2}
          max={8}
          step={1}
          disabled={hasState}
        />
      </div>
      
      {/* Animation speed */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Animation Speed</span>
          <span className="font-mono">{animationSpeed}ms</span>
        </div>
        <Slider
          value={[animationSpeed]}
          onValueChange={([v]) => onAnimationSpeedChange(v)}
          min={100}
          max={1500}
          step={100}
        />
      </div>
      
      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2">
        {!hasState ? (
          <Button onClick={onInitialize} className="col-span-2">
            <Play className="w-4 h-4 mr-2" />
            Initialize
          </Button>
        ) : (
          <>
            <Button onClick={onStepFull} disabled={isAnimating || phase === 'measured'}>
              <StepForward className="w-4 h-4 mr-2" />
              Step
            </Button>
            <Button onClick={onRunAnimated} variant={isAnimating ? 'destructive' : 'secondary'}>
              {isAnimating ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Animate
                </>
              )}
            </Button>
            <Button onClick={onRunToOptimal} disabled={isAnimating || phase === 'measured'}>
              <FastForward className="w-4 h-4 mr-2" />
              To Optimal
            </Button>
            <Button onClick={onMeasure} variant="outline" disabled={isAnimating || phase === 'measured'}>
              <Target className="w-4 h-4 mr-2" />
              Measure
            </Button>
          </>
        )}
      </div>
      
      <Button onClick={onReset} variant="ghost" className="w-full" disabled={isAnimating}>
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>
      
      {/* Status */}
      <div className="border-t border-border/50 pt-3 space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phase</span>
          <span className="font-mono">{phaseLabels[phase] || phase}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Iteration</span>
          <span className="font-mono">{currentIteration} / {optimalIterations} optimal</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">P(marked)</span>
          <span className={`font-mono ${probabilityMarked > 0.5 ? 'text-green-400' : ''}`}>
            {(probabilityMarked * 100).toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}
