import { useState, useCallback } from 'react';
import { Play, RotateCcw } from 'lucide-react';

const GradientDescentDemo = () => {
  const [step, setStep] = useState(0);
  const [loss, setLoss] = useState(100);
  const [lossHistory, setLossHistory] = useState<number[]>([100]);

  const computeLoss = (s: number) => {
    const baseLoss = 100 * Math.exp(-0.1 * s);
    const variation = Math.sin(s * 0.5) * 2;
    return Math.max(0.5, baseLoss + variation);
  };

  const runStep = useCallback(() => {
    setStep(s => {
      const newStep = s + 1;
      const newLoss = computeLoss(newStep);
      setLoss(newLoss);
      setLossHistory(h => [...h, newLoss]);
      return newStep;
    });
  }, []);

  const runMany = useCallback(() => {
    for (let i = 0; i < 10; i++) {
      setTimeout(() => runStep(), i * 100);
    }
  }, [runStep]);

  const reset = useCallback(() => {
    setStep(0);
    setLoss(100);
    setLossHistory([100]);
  }, []);

  const maxLoss = Math.max(...lossHistory, 1);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button onClick={runStep} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground"><Play className="w-4 h-4" /> Step</button>
        <button onClick={runMany} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground border border-border"><Play className="w-4 h-4" /> ×10</button>
        <button onClick={reset} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground border border-border"><RotateCcw className="w-4 h-4" /> Reset</button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Step</p>
          <p className="text-2xl font-mono text-primary">{step}</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">Loss</p>
          <p className="text-2xl font-mono text-primary">{loss.toFixed(2)}</p>
        </div>
      </div>

      {/* Loss History Chart */}
      <div className="p-4 rounded-lg bg-muted/30">
        <p className="text-xs text-muted-foreground mb-2">Loss History ({lossHistory.length} steps)</p>
        <div className="h-24 flex items-end gap-[2px]">
          {lossHistory.slice(-50).map((l, i) => (
            <div 
              key={i} 
              className="flex-1 bg-primary/70 rounded-t transition-all min-w-[3px]"
              style={{ height: `${(l / maxLoss) * 100}%` }}
              title={`Step ${i}: ${l.toFixed(2)}`}
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>0</span>
          <span>{maxLoss.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};

export default GradientDescentDemo;
