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
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center justify-between">
          Quantum Parameters
          <div className="flex gap-1">
            <Button size="sm" variant="outline" className="h-5 text-[9px] px-1.5" onClick={onReset}>
              <RotateCcw className="h-2.5 w-2.5 mr-0.5" /> Reset
            </Button>
            <Button size="sm" variant="default" className="h-5 text-[9px] px-1.5" onClick={onUseOptimal}>
              <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Optimal
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {paramConfig.map(({ key, label, symbol, min, max, step, description }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{label}</span>
              <Badge variant="outline" className="text-[9px] font-mono h-4">
                {symbol} = {params[key].toFixed(3)}
              </Badge>
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
        <div className="pt-2 border-t border-border">
          <div className="text-[10px] text-muted-foreground mb-1.5">Riemann Zeros γₙ</div>
          <div className="flex flex-wrap gap-1">
            {RIEMANN_ZEROS.slice(0, 5).map((zero, i) => (
              <Button
                key={i}
                size="sm"
                variant={Math.abs(params.t - zero) < 0.01 ? "default" : "outline"}
                className="h-5 text-[9px] px-1.5"
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
