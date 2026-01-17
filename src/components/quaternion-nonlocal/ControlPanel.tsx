import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Send, Target } from 'lucide-react';
import { PresetConfig } from '@/lib/quaternion-nonlocal/types';

interface ControlPanelProps {
  isRunning: boolean;
  time: number;
  twistCoupling: number;
  epsilon: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onTwistChange: (value: number) => void;
  onEpsilonChange: (value: number) => void;
  onTransmit: (sender: 'alice' | 'bob') => void;
  onMeasure: (who: 'alice' | 'bob') => void;
  onPreset: (index: number) => void;
  presets: PresetConfig[];
}

export function ControlPanel({
  isRunning,
  time,
  twistCoupling,
  epsilon,
  onStart,
  onPause,
  onReset,
  onTwistChange,
  onEpsilonChange,
  onTransmit,
  onMeasure,
  onPreset,
  presets
}: ControlPanelProps) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>System Controls</span>
          <span className="font-mono text-xs text-muted-foreground">
            t = {time.toFixed(2)}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Playback controls */}
        <div className="flex gap-2">
          {isRunning ? (
            <Button variant="outline" size="sm" onClick={onPause} className="flex-1">
              <Pause className="w-4 h-4 mr-1" />
              Pause
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={onStart} className="flex-1">
              <Play className="w-4 h-4 mr-1" />
              Evolve
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Presets */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Presets</label>
          <Select onValueChange={(v) => onPreset(parseInt(v))}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select preset..." />
            </SelectTrigger>
            <SelectContent>
              {presets.map((preset, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Twist coupling slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Twist Coupling γ_pq</span>
            <span className="font-mono">{twistCoupling.toFixed(2)}</span>
          </div>
          <Slider
            value={[twistCoupling]}
            onValueChange={([v]) => onTwistChange(v)}
            min={0}
            max={2}
            step={0.05}
            className="py-1"
          />
        </div>
        
        {/* Epsilon threshold slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Lock Threshold ε</span>
            <span className="font-mono">{epsilon.toFixed(2)} rad</span>
          </div>
          <Slider
            value={[epsilon]}
            onValueChange={([v]) => onEpsilonChange(v)}
            min={0.01}
            max={0.5}
            step={0.01}
            className="py-1"
          />
        </div>
        
        {/* Transmission buttons */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Transmit Symbol</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTransmit('alice')}
              className="text-xs border-green-500/50 hover:bg-green-500/10"
            >
              <Send className="w-3 h-3 mr-1" />
              Alice →
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTransmit('bob')}
              className="text-xs border-blue-500/50 hover:bg-blue-500/10"
            >
              ← Bob
              <Send className="w-3 h-3 ml-1 rotate-180" />
            </Button>
          </div>
        </div>
        
        {/* Measurement buttons */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Projection Measurement</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onMeasure('alice')}
              className="text-xs"
            >
              <Target className="w-3 h-3 mr-1" />
              Measure A
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onMeasure('bob')}
              className="text-xs"
            >
              <Target className="w-3 h-3 mr-1" />
              Measure B
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
