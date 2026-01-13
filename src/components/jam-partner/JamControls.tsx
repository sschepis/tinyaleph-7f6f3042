import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, Mic, Music2, Zap } from 'lucide-react';
import { JamMode } from '@/lib/jam-partner/types';

interface JamControlsProps {
  mode: JamMode;
  tempo: number;
  coherence: number;
  responsiveness: number;
  midiConnected: boolean;
  onModeChange: (mode: JamMode) => void;
  onTempoChange: (tempo: number) => void;
  onResponsivenessChange: (value: number) => void;
  onConnectMIDI: () => void;
  onReset: () => void;
}

export const JamControls: React.FC<JamControlsProps> = ({
  mode,
  tempo,
  coherence,
  responsiveness,
  midiConnected,
  onModeChange,
  onTempoChange,
  onResponsivenessChange,
  onConnectMIDI,
  onReset,
}) => {
  // Format responsiveness as descriptive label
  const responsivenessLabel = responsiveness < 0.3 
    ? 'Sparse' 
    : responsiveness < 0.6 
      ? 'Balanced' 
      : responsiveness < 0.8 
        ? 'Active' 
        : 'Dense';

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        <Button
          variant={mode === 'training' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('training')}
          className="flex-1"
        >
          Train
        </Button>
        <Button
          variant={mode === 'jamming' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onModeChange('jamming')}
          className="flex-1"
        >
          <Music2 className="w-4 h-4 mr-1" />
          Jam
        </Button>
      </div>

      {/* Coherence meter */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Musical Coherence</span>
          <span className="font-mono">{(coherence * 100).toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${coherence * 100}%` }}
          />
        </div>
      </div>

      {/* Responsiveness slider */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Zap className="w-3 h-3" />
            AI Responsiveness
          </span>
          <span className="font-mono text-xs">{responsivenessLabel}</span>
        </div>
        <Slider
          value={[responsiveness * 100]}
          onValueChange={([v]) => onResponsivenessChange(v / 100)}
          min={0}
          max={100}
          step={5}
        />
        <p className="text-xs text-muted-foreground">
          Controls note count, speed & chord richness
        </p>
      </div>

      {/* Tempo */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Tempo</span>
          <span className="font-mono">{tempo} BPM</span>
        </div>
        <Slider
          value={[tempo]}
          onValueChange={([v]) => onTempoChange(v)}
          min={60}
          max={180}
          step={5}
        />
      </div>

      {/* MIDI */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4" />
          <span className="text-sm">MIDI</span>
        </div>
        {midiConnected ? (
          <Badge variant="secondary">Connected</Badge>
        ) : (
          <Button variant="outline" size="sm" onClick={onConnectMIDI}>
            Connect
          </Button>
        )}
      </div>

      {/* Reset */}
      <Button variant="ghost" size="sm" onClick={onReset} className="w-full">
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset
      </Button>
    </div>
  );
};
