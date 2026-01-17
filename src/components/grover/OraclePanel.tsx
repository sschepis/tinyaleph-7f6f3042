import { Button } from '@/components/ui/button';
import { formatBinary } from '@/lib/grover';

interface OraclePanelProps {
  numQubits: number;
  markedStates: number[];
  onToggle: (index: number) => void;
  disabled?: boolean;
}

export function OraclePanel({
  numQubits,
  markedStates,
  onToggle,
  disabled = false,
}: OraclePanelProps) {
  const numStates = Math.pow(2, numQubits);
  const showAll = numStates <= 32;
  
  return (
    <div className="bg-secondary/20 rounded-lg p-4">
      <h3 className="text-sm font-medium mb-2">Oracle Configuration</h3>
      <p className="text-xs text-muted-foreground mb-3">
        Select states to mark (the "needle" in the haystack)
      </p>
      
      {showAll ? (
        <div className="grid grid-cols-4 gap-1 max-h-48 overflow-y-auto">
          {Array.from({ length: numStates }, (_, i) => (
            <Button
              key={i}
              variant={markedStates.includes(i) ? 'default' : 'outline'}
              size="sm"
              className={`text-xs font-mono h-8 ${
                markedStates.includes(i)
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'hover:bg-green-600/20'
              }`}
              onClick={() => onToggle(i)}
              disabled={disabled}
            >
              |{formatBinary(i, numQubits)}⟩
            </Button>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Too many states to show ({numStates}). Enter marked states manually.
          </p>
          <div className="flex flex-wrap gap-1">
            {markedStates.map(s => (
              <Button
                key={s}
                variant="default"
                size="sm"
                className="text-xs font-mono bg-green-600 hover:bg-green-700"
                onClick={() => onToggle(s)}
                disabled={disabled}
              >
                |{formatBinary(s, numQubits)}⟩ ×
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-3 text-xs text-muted-foreground">
        <span className="font-medium">{markedStates.length}</span> of {numStates} states marked
        {markedStates.length > 0 && (
          <span className="ml-2">
            (M/N = {(markedStates.length / numStates * 100).toFixed(2)}%)
          </span>
        )}
      </div>
    </div>
  );
}
