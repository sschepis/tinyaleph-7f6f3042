import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GATE_DEFINITIONS, GateType } from '@/lib/quantum-circuit/types';

interface GatePaletteProps {
  onDragStart: (gate: GateType) => void;
}

export const GatePalette = ({ onDragStart }: GatePaletteProps) => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(GATE_DEFINITIONS) as GateType[]).map((gateType) => {
          const gate = GATE_DEFINITIONS[gateType];
          return (
            <Tooltip key={gateType}>
              <TooltipTrigger asChild>
                <div
                  draggable
                  onDragStart={() => onDragStart(gateType)}
                  className={`${gate.color} text-white p-3 rounded-lg text-center cursor-grab hover:opacity-90 transition-all hover:-translate-y-0.5 select-none`}
                >
                  <div className="font-bold text-lg">{gateType}</div>
                  <div className="text-[10px] opacity-80">{gate.name}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-[200px]">
                <p className="font-semibold">{gate.name}</p>
                <p className="text-xs text-muted-foreground">{gate.description}</p>
                <p className="text-xs font-mono mt-1 text-primary">{gate.matrix}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
