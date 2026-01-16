import { useState, useEffect, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface HelpStep {
  title: string;
  icon: LucideIcon;
  content: ReactNode;
}

interface AppHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: HelpStep[];
  appName?: string;
}

export const AppHelpDialog = ({ open, onOpenChange, steps, appName }: AppHelpDialogProps) => {
  const [step, setStep] = useState(0);
  
  const currentStep = steps[step];
  if (!currentStep) return null;
  
  const Icon = currentStep.icon;
  
  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      onOpenChange(false);
    }
  };
  
  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };
  
  // Reset step when dialog opens
  useEffect(() => {
    if (open) setStep(0);
  }, [open]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-left">{currentStep.title}</DialogTitle>
              <DialogDescription className="text-left">
                {appName ? `${appName} • ` : ''}Step {step + 1} of {steps.length}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {currentStep.content}
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 py-2">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-primary w-4' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
        
        <div className="flex justify-between pt-2">
          <Button variant="ghost" onClick={prevStep} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button onClick={nextStep}>
            {step === steps.length - 1 ? (
              <>Get Started</>
            ) : (
              <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
