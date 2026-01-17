import { ErrorType, CodeType } from '@/lib/qec';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, RotateCcw, AlertTriangle, Shuffle } from 'lucide-react';

interface ErrorInjectorProps {
  codeType: CodeType;
  numQubits: number;
  onInjectError: (qubitIndex: number, errorType: ErrorType) => void;
  onRandomError: () => void;
  disabled?: boolean;
}

export function ErrorInjector({ 
  codeType, 
  numQubits, 
  onInjectError, 
  onRandomError,
  disabled 
}: ErrorInjectorProps) {
  const canInjectPhase = codeType !== 'bit_flip_3';
  const canInjectBit = codeType !== 'phase_flip_3';
  
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          Error Injection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRandomError}
            disabled={disabled}
            className="col-span-2 border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Random Error
          </Button>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Click to inject specific errors:</p>
          
          <div className="space-y-2">
            {Array.from({ length: Math.min(numQubits, 4) }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-mono w-8">q{i + 1}</span>
                {canInjectBit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInjectError(i, 'bit_flip')}
                    disabled={disabled}
                    className="flex-1 h-7 text-xs border-red-500/30 hover:bg-red-500/10"
                  >
                    <Zap className="w-3 h-3 mr-1 text-red-400" />
                    X
                  </Button>
                )}
                {canInjectPhase && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInjectError(i, 'phase_flip')}
                    disabled={disabled}
                    className="flex-1 h-7 text-xs border-blue-500/30 hover:bg-blue-500/10"
                  >
                    <RotateCcw className="w-3 h-3 mr-1 text-blue-400" />
                    Z
                  </Button>
                )}
                {canInjectBit && canInjectPhase && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInjectError(i, 'both')}
                    disabled={disabled}
                    className="flex-1 h-7 text-xs border-purple-500/30 hover:bg-purple-500/10"
                  >
                    <AlertTriangle className="w-3 h-3 mr-1 text-purple-400" />
                    Y
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          {codeType === 'bit_flip_3' && 'This code can only correct X (bit-flip) errors'}
          {codeType === 'phase_flip_3' && 'This code can only correct Z (phase-flip) errors'}
          {(codeType === 'shor_9' || codeType === 'steane_7') && 'This code can correct any single-qubit error'}
        </p>
      </CardContent>
    </Card>
  );
}
