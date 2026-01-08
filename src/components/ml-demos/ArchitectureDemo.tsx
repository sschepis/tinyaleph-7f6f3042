import { useState, useCallback, useRef } from 'react';
import { Play, Pause, Zap, Brain, GitBranch, Target, Sparkles, Cpu, ChevronRight, Network } from 'lucide-react';

const ArchitectureDemo = () => {
  const [activeStage, setActiveStage] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  const stages = [
    { id: 'input', label: 'Input Tokens', icon: Cpu, color: 'from-blue-500 to-cyan-500', description: 'Raw text tokens are fed into the model' },
    { id: 'prime', label: 'Prime Encoding', icon: Zap, color: 'from-cyan-500 to-teal-500', description: 'Each character maps to a unique prime number, creating algebraic semantic signatures' },
    { id: 'attention', label: 'Resonant Attention', icon: Brain, color: 'from-teal-500 to-emerald-500', description: 'Attention weights computed via prime signature overlap (Jaccard similarity)' },
    { id: 'quaternion', label: 'Quaternion Mix', icon: GitBranch, color: 'from-emerald-500 to-green-500', description: 'Hamilton product rotates semantic states in 4D hypercomplex space' },
    { id: 'coherence', label: 'Coherence Gate', icon: Target, color: 'from-green-500 to-lime-500', description: 'Measures state sharpness; if coherence > θ, halt early' },
    { id: 'output', label: 'Entropy Collapse', icon: Sparkles, color: 'from-lime-500 to-yellow-500', description: 'Select token with minimum entropy (maximum certainty)' },
  ];

  const runAnimation = useCallback(() => {
    if (isAnimating) {
      setIsAnimating(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    setIsAnimating(true);
    let stage = 0;
    
    const animate = () => {
      setActiveStage(stage);
      stage++;
      
      if (stage < stages.length) {
        animationRef.current = window.setTimeout(() => {
          requestAnimationFrame(animate);
        }, 1000) as unknown as number;
      } else {
        setTimeout(() => {
          setActiveStage(null);
          setIsAnimating(false);
        }, 1500);
      }
    };
    
    animate();
  }, [isAnimating, stages.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Network className="w-5 h-5 text-primary" />
          ResoFormer Architecture
        </h3>
        <button
          onClick={runAnimation}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isAnimating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isAnimating ? 'Pause' : 'Animate Flow'}
        </button>
      </div>

      {/* Pipeline Visualization */}
      <div className="relative p-4 rounded-xl border border-border bg-card overflow-x-auto">
        <div className="flex items-stretch gap-2 min-w-max">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === idx;
            const isPast = activeStage !== null && idx < activeStage;
            
            return (
              <div key={stage.id} className="flex items-center">
                <div 
                  className={`
                    relative p-3 rounded-xl border-2 transition-all duration-500 cursor-pointer min-w-[120px]
                    ${isActive 
                      ? 'border-primary bg-primary/20 scale-105 shadow-lg shadow-primary/20' 
                      : isPast
                        ? 'border-primary/50 bg-primary/10'
                        : 'border-border bg-muted/30 hover:bg-muted/50'
                    }
                  `}
                  onClick={() => setActiveStage(idx)}
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${stage.color} opacity-0 transition-opacity ${isActive ? 'opacity-20' : ''}`} />
                  
                  <div className="relative flex flex-col items-center gap-2 text-center">
                    <div className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">{stage.label}</span>
                  </div>

                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </div>
                
                {idx < stages.length - 1 && (
                  <ChevronRight className={`w-5 h-5 mx-1 transition-colors flex-shrink-0 ${isPast || isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Description */}
      {activeStage !== null && (
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            {(() => {
              const Icon = stages[activeStage].icon;
              return <Icon className="w-5 h-5 text-primary mt-0.5" />;
            })()}
            <div>
              <p className="font-semibold text-primary">{stages[activeStage].label}</p>
              <p className="text-sm text-muted-foreground mt-1">{stages[activeStage].description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitectureDemo;
