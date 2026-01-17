import { QECState } from '@/lib/qec';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, RotateCcw, Layers, Search, Wrench, Zap } from 'lucide-react';

interface ControlPanelProps {
  state: QECState;
  isAnimating: boolean;
  onEncode: () => void;
  onMeasure: () => void;
  onCorrect: () => void;
  onReset: () => void;
  onRunCycle: () => void;
}

export function ControlPanel({
  state,
  isAnimating,
  onEncode,
  onMeasure,
  onCorrect,
  onReset,
  onRunCycle,
}: ControlPanelProps) {
  const { step } = state;
  
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={onEncode}
            disabled={isAnimating || step !== 'idle'}
            variant={step === 'idle' ? 'default' : 'outline'}
            size="sm"
          >
            <Layers className="w-4 h-4 mr-2" />
            Encode |0⟩<sub>L</sub>
          </Button>
          
          <Button
            onClick={onMeasure}
            disabled={isAnimating || step !== 'error_injected'}
            variant={step === 'error_injected' ? 'default' : 'outline'}
            size="sm"
          >
            <Search className="w-4 h-4 mr-2" />
            Measure Syndromes
          </Button>
          
          <Button
            onClick={onCorrect}
            disabled={isAnimating || step !== 'syndrome_measured'}
            variant={step === 'syndrome_measured' ? 'default' : 'outline'}
            size="sm"
          >
            <Wrench className="w-4 h-4 mr-2" />
            Apply Correction
          </Button>
          
          <div className="flex-1" />
          
          <Button
            onClick={onRunCycle}
            disabled={isAnimating}
            variant="outline"
            size="sm"
            className="border-primary/50 text-primary hover:bg-primary/10"
          >
            <Zap className="w-4 h-4 mr-2" />
            Auto Demo
          </Button>
          
          <Button
            onClick={onReset}
            disabled={isAnimating}
            variant="outline"
            size="sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {['idle', 'encoded', 'error_injected', 'syndrome_measured', 'corrected'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`
                  w-3 h-3 rounded-full transition-colors
                  ${step === s ? 'bg-primary' : 
                    ['idle', 'encoded', 'error_injected', 'syndrome_measured', 'corrected'].indexOf(step) > i 
                      ? 'bg-primary/50' 
                      : 'bg-muted'
                  }
                `}
              />
              {i < 4 && (
                <div className={`w-8 h-0.5 ${
                  ['idle', 'encoded', 'error_injected', 'syndrome_measured', 'corrected'].indexOf(step) > i 
                    ? 'bg-primary/50' 
                    : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-2 flex justify-center gap-4 text-[10px] text-muted-foreground">
          <span>Encode</span>
          <span>Error</span>
          <span>Measure</span>
          <span>Correct</span>
        </div>
      </CardContent>
    </Card>
  );
}
