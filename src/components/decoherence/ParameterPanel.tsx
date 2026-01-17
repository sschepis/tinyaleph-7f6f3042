import { DecoherenceParams, QUBIT_SYSTEMS, INITIAL_STATES } from '@/lib/decoherence/types';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, FastForward } from 'lucide-react';

interface ParameterPanelProps {
  params: DecoherenceParams;
  onParamsChange: (params: Partial<DecoherenceParams>) => void;
  onSystemSelect: (system: keyof typeof QUBIT_SYSTEMS) => void;
  onInitialStateChange: (state: keyof typeof INITIAL_STATES) => void;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  time: number;
}

export function ParameterPanel({
  params,
  onParamsChange,
  onSystemSelect,
  onInitialStateChange,
  isRunning,
  onStart,
  onPause,
  onReset,
  speed,
  onSpeedChange,
  time,
}: ParameterPanelProps) {
  const stateLabels: Record<string, string> = {
    plus_x: '|+⟩ (x+)',
    minus_x: '|-⟩ (x-)',
    plus_y: '|+i⟩ (y+)',
    minus_y: '|-i⟩ (y-)',
    excited: '|1⟩ (z+)',
    ground: '|0⟩ (z-)',
    superposition: 'Superposition',
  };

  return (
    <Card className="p-4 space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Qubit System</Label>
        <Select onValueChange={(v) => onSystemSelect(v as keyof typeof QUBIT_SYSTEMS)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select system" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(QUBIT_SYSTEMS).map(([key, sys]) => (
              <SelectItem key={key} value={key}>
                {sys.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label className="text-xs text-muted-foreground">Initial State</Label>
        <Select onValueChange={(v) => onInitialStateChange(v as keyof typeof INITIAL_STATES)}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(stateLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between">
            <Label className="text-xs">T₁ (Relaxation)</Label>
            <span className="text-xs font-mono text-primary">{params.T1} μs</span>
          </div>
          <Slider
            value={[params.T1]}
            onValueChange={([v]) => onParamsChange({ T1: v })}
            min={1}
            max={10000}
            step={1}
            className="mt-1"
          />
        </div>
        
        <div>
          <div className="flex justify-between">
            <Label className="text-xs">T₂ (Dephasing)</Label>
            <span className="text-xs font-mono text-primary">{params.T2} μs</span>
          </div>
          <Slider
            value={[params.T2]}
            onValueChange={([v]) => onParamsChange({ T2: Math.min(v, 2 * params.T1) })}
            min={1}
            max={Math.min(2 * params.T1, 10000)}
            step={1}
            className="mt-1"
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">T₂ ≤ 2T₁</p>
        </div>
        
        <div>
          <div className="flex justify-between">
            <Label className="text-xs">ω₀ (Frequency)</Label>
            <span className="text-xs font-mono text-primary">{params.omega} MHz</span>
          </div>
          <Slider
            value={[params.omega]}
            onValueChange={([v]) => onParamsChange({ omega: v })}
            min={100}
            max={50000}
            step={100}
            className="mt-1"
          />
        </div>
        
        <div>
          <div className="flex justify-between">
            <Label className="text-xs">Temperature</Label>
            <span className="text-xs font-mono text-primary">{params.temperature} mK</span>
          </div>
          <Slider
            value={[Math.log10(params.temperature + 1) * 100]}
            onValueChange={([v]) => onParamsChange({ temperature: Math.round(Math.pow(10, v / 100) - 1) })}
            min={0}
            max={600}
            step={1}
            className="mt-1"
          />
        </div>
      </div>
      
      <div className="border-t pt-3">
        <div className="flex justify-between mb-2">
          <Label className="text-xs">Simulation Speed</Label>
          <span className="text-xs font-mono">{speed}x</span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={([v]) => onSpeedChange(v)}
          min={0.1}
          max={10}
          step={0.1}
          className="mb-3"
        />
        
        <div className="flex gap-2">
          <Button
            variant={isRunning ? "secondary" : "default"}
            size="sm"
            onClick={isRunning ? onPause : onStart}
            className="flex-1"
          >
            {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-center mt-2">
          <span className="text-sm font-mono text-primary">t = {time.toFixed(2)} μs</span>
        </div>
      </div>
    </Card>
  );
}
