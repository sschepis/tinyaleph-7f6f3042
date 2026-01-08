import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  GripVertical, Zap, Play, Target, Bug, Sparkles, 
  ChevronRight, ChevronLeft, Circle, X
} from 'lucide-react';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HELP_STEPS = [
  {
    title: 'Welcome to Quantum Circuit Runner',
    icon: Zap,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Build and simulate quantum circuits visually. This interactive tool lets you explore 
          quantum computing concepts hands-on.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Drag & Drop</span>
            <p className="text-xs text-muted-foreground mt-1">Place gates on quantum wires</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Visualize</span>
            <p className="text-xs text-muted-foreground mt-1">See states on Bloch sphere</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Debug</span>
            <p className="text-xs text-muted-foreground mt-1">Step through gate-by-gate</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Analyze</span>
            <p className="text-xs text-muted-foreground mt-1">Measure and compare results</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Building Your Circuit',
    icon: GripVertical,
    content: (
      <div className="space-y-4">
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <h4 className="font-semibold mb-2">1. Drag Gates</h4>
            <p className="text-sm text-muted-foreground">
              Drag quantum gates from the palette on the left onto the circuit wires. 
              Each wire represents a qubit.
            </p>
          </div>
          <div className="flex flex-wrap gap-1">
            {['H', 'X', 'Z', 'CNOT'].map(g => (
              <div key={g} className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {g}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">2. Position Matters</h4>
          <p className="text-sm text-muted-foreground">
            Gates execute left-to-right. Gates in the same column run in parallel.
            Click a gate to remove it.
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-semibold">Tip:</span> Use presets to load 
            famous algorithms like Bell State, GHZ, or Grover's search.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Running & Measuring',
    icon: Play,
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Play className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold">Execute</h4>
              <p className="text-sm text-muted-foreground">
                Runs the circuit and computes the final quantum state. Watch the Bloch 
                sphere and amplitude plots update.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <h4 className="font-semibold">Measure</h4>
              <p className="text-sm text-muted-foreground">
                Simulates 1024 measurements, collapsing the quantum state. See the 
                probability distribution of outcomes.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <Circle className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-semibold">Compare</h4>
              <p className="text-sm text-muted-foreground">
                Compare ideal vs noisy execution. Adjust noise level to see how 
                errors affect fidelity.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Debug Mode',
    icon: Bug,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Debug mode lets you step through your circuit one gate at a time, 
          understanding exactly how the quantum state evolves.
        </p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center">
              <ChevronRight className="w-4 h-4 text-yellow-500" />
            </div>
            <span className="text-sm">Step forward/backward through gates</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-6 h-6 rounded bg-red-500/20 flex items-center justify-center">
              <Circle className="w-3 h-3 text-red-500 fill-current" />
            </div>
            <span className="text-sm">Set breakpoints by clicking gates</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded bg-muted/50">
            <div className="w-6 h-6 rounded bg-orange-500/20 flex items-center justify-center">
              <Target className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-sm">Add conditional breaks on probability/entropy</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          The current gate is highlighted with a yellow ring. Qubit probabilities 
          update in real-time as you step.
        </p>
      </div>
    ),
  },
];

export const HelpDialog = ({ open, onOpenChange }: HelpDialogProps) => {
  const [step, setStep] = useState(0);
  
  const currentStep = HELP_STEPS[step];
  const Icon = currentStep.icon;
  
  const nextStep = () => {
    if (step < HELP_STEPS.length - 1) {
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
                Step {step + 1} of {HELP_STEPS.length}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {currentStep.content}
        </div>
        
        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 py-2">
          {HELP_STEPS.map((_, i) => (
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
            {step === HELP_STEPS.length - 1 ? (
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

// Hook to manage first-run state
export const useFirstRun = (key: string): [boolean, () => void] => {
  const storageKey = `quantum-circuit-runner-${key}`;
  const [isFirstRun, setIsFirstRun] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(storageKey) !== 'seen';
  });
  
  const markAsSeen = () => {
    localStorage.setItem(storageKey, 'seen');
    setIsFirstRun(false);
  };
  
  return [isFirstRun, markAsSeen];
};
