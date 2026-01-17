import { BellState, BELL_STATE_INFO } from '@/lib/entanglement-lab';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BellStateSelectorProps {
  selected: BellState;
  onSelect: (state: BellState) => void;
}

export function BellStateSelector({ selected, onSelect }: BellStateSelectorProps) {
  const states: BellState[] = ['Φ+', 'Φ-', 'Ψ+', 'Ψ-'];
  
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Bell State</h3>
      
      <div className="grid grid-cols-2 gap-2">
        {states.map(state => (
          <Button
            key={state}
            variant={selected === state ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(state)}
            className={cn(
              "font-mono text-lg h-12",
              selected === state && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
          >
            |{state}⟩
          </Button>
        ))}
      </div>
      
      <div className="p-3 bg-secondary/30 rounded-lg space-y-1">
        <p className="text-xs font-mono text-primary">
          {BELL_STATE_INFO[selected].latex}
        </p>
        <p className="text-xs text-muted-foreground">
          {BELL_STATE_INFO[selected].description}
        </p>
      </div>
    </div>
  );
}
