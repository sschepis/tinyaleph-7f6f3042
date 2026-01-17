import { PROTOCOL_STEPS } from '@/lib/bb84/types';
import { Check, Circle } from 'lucide-react';

interface ProtocolExplanationProps {
  currentPhase: 'idle' | 'transmitting' | 'sifting' | 'error-checking' | 'complete';
}

const phaseToStep: Record<string, number> = {
  'idle': 0,
  'transmitting': 1,
  'sifting': 3,
  'error-checking': 4,
  'complete': 5
};

export function ProtocolExplanation({ currentPhase }: ProtocolExplanationProps) {
  const activeStep = phaseToStep[currentPhase] || 0;
  
  return (
    <div className="space-y-2">
      {PROTOCOL_STEPS.map((step) => {
        const isComplete = step.step < activeStep;
        const isActive = step.step === activeStep;
        
        return (
          <div 
            key={step.step}
            className={`flex items-start gap-2 p-2 rounded text-xs transition-colors ${
              isActive 
                ? 'bg-primary/20 border border-primary/40' 
                : isComplete 
                  ? 'bg-green-500/10 border border-green-500/20' 
                  : 'bg-muted/20 border border-transparent'
            }`}
          >
            <div className={`mt-0.5 ${
              isComplete ? 'text-green-400' : isActive ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {isComplete ? (
                <Check className="w-3 h-3" />
              ) : (
                <Circle className="w-3 h-3" />
              )}
            </div>
            <div>
              <div className={`font-medium ${
                isActive ? 'text-primary' : isComplete ? 'text-green-300' : 'text-muted-foreground'
              }`}>
                {step.step}. {step.title}
              </div>
              <div className="text-muted-foreground text-[10px]">
                {step.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
