import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { WaveformParams, RIEMANN_ZEROS, DEFAULT_PARAMS } from '@/lib/quantum-wavefunction';
import { RotateCcw, Sparkles } from 'lucide-react';

interface ParameterControlsProps {
  params: WaveformParams;
  onParamChange: (key: keyof WaveformParams, value: number) => void;
  onReset: () => void;
  onUseOptimal: () => void;
  onUseRiemannZero: (index: number) => void;
}

export function ParameterControls({
  params,
  onParamChange,
  onReset,
  onUseOptimal,
  onUseRiemannZero
}: ParameterControlsProps) {
  const paramConfig = [
    { 
      key: 't' as const, 
      label: 't (Riemann zero)', 
      symbol: 'γ',
      min: 10, 
      max: 55, 
      step: 0.1,
      description: 'Critical line parameter'
    },
    { 
      key: 'V0' as const, 
      label: 'V₀ (Potential)', 
      symbol: 'V₀',
      min: 0.01, 
      max: 2.0, 
      step: 0.01,
      description: 'Quantum potential strength'
    },
    { 
      key: 'epsilon' as const, 
      label: 'ε (Tunneling)', 
      symbol: 'ε',
      min: 0.01, 
      max: 0.5, 
      step: 0.01,
      description: 'Tunneling amplitude'
    },
    { 
      key: 'beta' as const, 
      label: 'β (Spectral)', 
      symbol: 'β',
      min: 0.01, 
      max: 2.0, 
      step: 0.01,
      description: 'Phase velocity'
    },
    { 
      key: 'resonanceWidth' as const, 
      label: 'σ (Resonance width)', 
      symbol: 'σ',
      min: 0.1, 
      max: 2.0, 
      step: 0.05,
      description: 'Gaussian peak width'
    }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="py-1.5 px-2">
        <CardTitle className="text-[10px] flex items-center justify-between">
          Parameters
          <div className="flex gap-0.5">
            <Button size="sm" variant="ghost" className="h-4 text-[8px] px-1" onClick={onReset}>
              <RotateCcw className="h-2.5 w-2.5" />
            </Button>
            <Button size="sm" variant="default" className="h-4 text-[8px] px-1.5" onClick={onUseOptimal}>
              <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Opt
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        {paramConfig.map(({ key, symbol, min, max, step }) => (
          <div key={key} className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-muted-foreground">{symbol}</span>
              <span className="text-[9px] font-mono text-primary">
                {params[key].toFixed(2)}
              </span>
            </div>
            <Slider
              value={[params[key]]}
              onValueChange={([v]) => onParamChange(key, v)}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
          </div>
        ))}
        
        {/* Riemann Zero Presets */}
        <div className="pt-1.5 border-t border-border">
          <div className="text-[9px] text-muted-foreground mb-1">Riemann γₙ</div>
          <div className="flex flex-wrap gap-0.5">
            {RIEMANN_ZEROS.slice(0, 5).map((zero, i) => (
              <Button
                key={i}
                size="sm"
                variant={Math.abs(params.t - zero) < 0.01 ? "default" : "outline"}
                className="h-4 text-[8px] px-1 flex-1"
                onClick={() => onUseRiemannZero(i)}
              >
                γ{i + 1}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
