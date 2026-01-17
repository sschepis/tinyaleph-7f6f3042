import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, SkipForward, Zap } from 'lucide-react';

interface ControlPanelProps {
  keyLength: number;
  evePresent: boolean;
  eveInterceptionRate: number;
  animationSpeed: number;
  isAnimating: boolean;
  hasState: boolean;
  onKeyLengthChange: (n: number) => void;
  onEvePresentChange: (v: boolean) => void;
  onEveInterceptionRateChange: (r: number) => void;
  onAnimationSpeedChange: (s: number) => void;
  onRun: () => void;
  onRunAnimated: () => void;
  onReset: () => void;
  onStep: () => void;
}

export function ControlPanel({
  keyLength,
  evePresent,
  eveInterceptionRate,
  animationSpeed,
  isAnimating,
  hasState,
  onKeyLengthChange,
  onEvePresentChange,
  onEveInterceptionRateChange,
  onAnimationSpeedChange,
  onRun,
  onRunAnimated,
  onReset,
  onStep
}: ControlPanelProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          Protocol Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Length */}
        <div className="space-y-2">
          <Label className="text-xs">Key Length: {keyLength} bits</Label>
          <Slider
            value={[keyLength]}
            onValueChange={([v]) => onKeyLengthChange(v)}
            min={8}
            max={64}
            step={8}
            disabled={isAnimating}
          />
        </div>
        
        {/* Eve Toggle */}
        <div className="flex items-center justify-between">
          <Label className="text-xs">Eavesdropper (Eve)</Label>
          <Switch
            checked={evePresent}
            onCheckedChange={onEvePresentChange}
            disabled={isAnimating}
          />
        </div>
        
        {/* Eve Interception Rate */}
        {evePresent && (
          <div className="space-y-2">
            <Label className="text-xs">
              Interception Rate: {(eveInterceptionRate * 100).toFixed(0)}%
            </Label>
            <Slider
              value={[eveInterceptionRate]}
              onValueChange={([v]) => onEveInterceptionRateChange(v)}
              min={0.1}
              max={1}
              step={0.1}
              disabled={isAnimating}
            />
          </div>
        )}
        
        {/* Animation Speed */}
        <div className="space-y-2">
          <Label className="text-xs">Animation Speed: {animationSpeed}ms</Label>
          <Slider
            value={[animationSpeed]}
            onValueChange={([v]) => onAnimationSpeedChange(v)}
            min={20}
            max={500}
            step={20}
            disabled={isAnimating}
          />
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={onRunAnimated} 
            disabled={isAnimating}
            size="sm"
            className="w-full"
          >
            <Play className="w-3 h-3 mr-1" />
            Animate
          </Button>
          <Button 
            onClick={onRun} 
            disabled={isAnimating}
            size="sm"
            variant="secondary"
            className="w-full"
          >
            <SkipForward className="w-3 h-3 mr-1" />
            Instant
          </Button>
        </div>
        
        {hasState && (
          <Button 
            onClick={onReset} 
            disabled={isAnimating}
            size="sm"
            variant="outline"
            className="w-full"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
