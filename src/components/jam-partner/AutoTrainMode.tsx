import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Play, Square, Music } from 'lucide-react';
import { getAllTrainingScripts, TrainingScript } from '@/lib/jam-partner/training-scripts';

interface AutoTrainModeProps {
  isTraining: boolean;
  progress: number;
  currentScript: TrainingScript | null;
  sequenceIndex: number;
  onStart: (script: TrainingScript) => void;
  onStop: () => void;
}

export const AutoTrainMode: React.FC<AutoTrainModeProps> = ({
  isTraining,
  progress,
  currentScript,
  sequenceIndex,
  onStart,
  onStop,
}) => {
  const [selectedId, setSelectedId] = React.useState('blues-call-response');
  const scripts = getAllTrainingScripts();

  const handleStart = () => {
    const script = scripts.find(s => s.id === selectedId);
    if (script) onStart(script);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Music className="w-4 h-4 text-primary" />
        <span className="font-medium">Auto-Train Demo</span>
        {isTraining && <Badge variant="secondary" className="animate-pulse">Learning...</Badge>}
      </div>

      <Select value={selectedId} onValueChange={setSelectedId} disabled={isTraining}>
        <SelectTrigger>
          <SelectValue placeholder="Select training script" />
        </SelectTrigger>
        <SelectContent>
          {scripts.map(s => (
            <SelectItem key={s.id} value={s.id}>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">{s.style}</Badge>
                {s.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentScript && (
        <div className="text-sm text-muted-foreground">
          {currentScript.description}
        </div>
      )}

      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        {isTraining && currentScript && (
          <div className="text-xs text-muted-foreground">
            Sequence {sequenceIndex + 1} of {currentScript.sequences.length}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!isTraining ? (
          <Button onClick={handleStart} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            Start Demo
          </Button>
        ) : (
          <Button onClick={onStop} variant="destructive" className="flex-1">
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        )}
      </div>
    </div>
  );
};
