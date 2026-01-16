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
  Zap, Play, Target, Sparkles, Waves, BarChart3,
  ChevronRight, ChevronLeft, RotateCcw
} from 'lucide-react';

interface HelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HELP_STEPS = [
  {
    title: 'Welcome to Prime Resonance',
    icon: Zap,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Explore quantum-like computation in Prime Hilbert Space ℋ_P. This simulator models 
          how prime numbers can form superposition states and evolve through resonance operators.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Superposition</span>
            <p className="text-xs text-muted-foreground mt-1">Prime states exist in parallel</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Resonance</span>
            <p className="text-xs text-muted-foreground mt-1">Golden ratio (φ) interactions</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Collapse</span>
            <p className="text-xs text-muted-foreground mt-1">Measure to select a prime</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Entropy</span>
            <p className="text-xs text-muted-foreground mt-1">Track information dynamics</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Initialize Your State',
    icon: RotateCcw,
    content: (
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Uniform Superposition |ψ⟩</h4>
          <p className="text-sm text-muted-foreground">
            Creates an equal superposition across the first N primes. Use the dimension 
            slider to control how many primes are in your Hilbert space.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="px-3 py-1.5 rounded bg-muted text-xs font-mono">dim(ℋ) = 16</div>
          <div className="px-3 py-1.5 rounded bg-muted text-xs">→ primes 2 to 53</div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Basis States |p⟩</h4>
          <p className="text-sm text-muted-foreground">
            Click <span className="font-mono text-primary">|2⟩</span> or <span className="font-mono text-primary">|7⟩</span> to 
            initialize in a pure basis state — 100% probability on a single prime.
          </p>
        </div>
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-semibold">Tip:</span> Start with uniform 
            superposition to see how operators redistribute probability across primes.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Apply Resonance Operators',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Operators transform the quantum state, redistributing amplitudes across primes:
        </p>
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-2 rounded bg-muted/50">
            <div className="w-8 h-8 rounded bg-blue-500/20 flex items-center justify-center font-mono text-blue-400 font-bold shrink-0">
              P̂
            </div>
            <div>
              <span className="font-semibold text-sm">Phase Shift</span>
              <p className="text-xs text-muted-foreground">
                Rotates phase proportional to log(p). Higher primes get more rotation.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded bg-muted/50">
            <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center font-mono text-amber-400 font-bold shrink-0">
              R̂
            </div>
            <div>
              <span className="font-semibold text-sm">Resonance Coupling</span>
              <p className="text-xs text-muted-foreground">
                Couples primes whose ratio approximates φ (golden ratio). Creates entanglement-like correlations.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded bg-muted/50">
            <div className="w-8 h-8 rounded bg-green-500/20 flex items-center justify-center font-mono text-green-400 font-bold shrink-0">
              Ĉ
            </div>
            <div>
              <span className="font-semibold text-sm">Collapse Tendency</span>
              <p className="text-xs text-muted-foreground">
                Amplifies dominant probabilities, pushing state toward measurement.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2 rounded bg-muted/50">
            <div className="w-8 h-8 rounded bg-purple-500/20 flex items-center justify-center font-mono text-purple-400 font-bold shrink-0">
              Ĥ
            </div>
            <div>
              <span className="font-semibold text-sm">Hadamard-like</span>
              <p className="text-xs text-muted-foreground">
                Spreads amplitude evenly, increasing entropy and superposition.
              </p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Evolution & Measurement',
    icon: Waves,
    content: (
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Play className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h4 className="font-semibold">Evolve</h4>
            <p className="text-sm text-muted-foreground">
              Starts continuous evolution, applying resonance dynamics over time. 
              Watch entropy and the Hilbert space visualization change.
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
              Collapses the superposition to a single prime according to Born rule 
              probabilities |α_p|². The histogram tracks measurement outcomes.
            </p>
          </div>
        </div>
        
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary font-semibold">Experiment:</span> Initialize uniform, 
            apply R̂ multiple times, then measure. Notice how φ-resonant primes get favored!
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Analysis Tools',
    icon: BarChart3,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Use the analysis panels to understand your quantum state:
        </p>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Hilbert Space Visualization
            </h4>
            <p className="text-xs text-muted-foreground ml-4">
              Polar plot showing amplitude (radius) and phase (angle) for each prime basis vector.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Probability Distribution
            </h4>
            <p className="text-xs text-muted-foreground ml-4">
              Bar chart of |α_p|² with measurement history overlay.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" /> Entropy Timeline
            </h4>
            <p className="text-xs text-muted-foreground ml-4">
              Tracks von Neumann entropy S(t) over evolution — lower means more collapsed.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Resonance Comparison
            </h4>
            <p className="text-xs text-muted-foreground ml-4">
              Compare two states via inner product ⟨ψ|φ⟩ and Jaccard similarity.
            </p>
          </div>
        </div>
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
  const storageKey = `prime-resonance-${key}`;
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
