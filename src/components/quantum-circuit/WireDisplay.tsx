import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GATE_DEFINITIONS, GateInstance, Wire } from '@/lib/quantum-circuit/types';

interface WireDisplayProps {
  wire: Wire;
  gates: GateInstance[];
  onDropGate: (position: number) => void;
  onRemoveGate: (gateId: string) => void;
  isActive: boolean;
  numWires: number;
  wireIndex: number;
}

export const WireDisplay = ({
  wire,
  gates,
  onDropGate,
  onRemoveGate,
  isActive,
  numWires,
  wireIndex,
}: WireDisplayProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    onDropGate(position);
  };

  const slots = 10;
  
  return (
    <div className={`relative flex items-center gap-2 p-3 rounded-lg border ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}>
      <div className="w-16 px-2 py-1 bg-primary text-primary-foreground rounded text-center text-sm font-mono">
        q[{wireIndex}]
      </div>
      
      <div className="absolute left-20 right-4 h-0.5 bg-primary/30 top-1/2 -translate-y-1/2 pointer-events-none" />
      
      <div className="flex gap-1 flex-1 relative z-10">
        {Array.from({ length: slots }).map((_, slotIdx) => {
          const gateAtSlot = gates.find(g => g.position === slotIdx);
          
          return (
            <div
              key={slotIdx}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slotIdx)}
              className={`w-12 h-12 rounded border-2 border-dashed flex items-center justify-center transition-all ${
                gateAtSlot 
                  ? 'border-transparent' 
                  : 'border-border/50 hover:border-primary/50 hover:bg-primary/10'
              }`}
            >
              {gateAtSlot ? (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`${GATE_DEFINITIONS[gateAtSlot.type].color} text-white w-10 h-10 rounded flex items-center justify-center font-bold cursor-pointer hover:scale-105 transition-transform relative group`}
                        onClick={() => onRemoveGate(gateAtSlot.id)}
                      >
                        {gateAtSlot.type}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          ×
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{GATE_DEFINITIONS[gateAtSlot.type].name}</p>
                      <p className="text-xs font-mono text-primary">{GATE_DEFINITIONS[gateAtSlot.type].matrix}</p>
                      {gateAtSlot.parameter !== undefined && (
                        <p className="text-xs text-muted-foreground">θ = {gateAtSlot.parameter.toFixed(3)}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <span className="text-muted-foreground/30 text-xs">{slotIdx}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
