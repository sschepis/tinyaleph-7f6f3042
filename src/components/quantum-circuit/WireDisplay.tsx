import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { GATE_DEFINITIONS, GateInstance, Wire } from '@/lib/quantum-circuit/types';
import { Circle } from 'lucide-react';

interface WireDisplayProps {
  wire: Wire;
  gates: GateInstance[];
  onDropGate: (position: number) => void;
  onRemoveGate: (gateId: string) => void;
  isActive: boolean;
  numWires: number;
  wireIndex: number;
  // Debug mode props
  debugMode?: boolean;
  breakpoints?: Set<string>;
  onToggleBreakpoint?: (gateId: string) => void;
  currentDebugGateId?: string | null;
}

export const WireDisplay = ({
  wire,
  gates,
  onDropGate,
  onRemoveGate,
  isActive,
  numWires,
  wireIndex,
  debugMode = false,
  breakpoints = new Set(),
  onToggleBreakpoint,
  currentDebugGateId,
}: WireDisplayProps) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    onDropGate(position);
  };

  const handleGateClick = (gate: GateInstance, e: React.MouseEvent) => {
    if (debugMode && onToggleBreakpoint) {
      e.stopPropagation();
      onToggleBreakpoint(gate.id);
    } else {
      onRemoveGate(gate.id);
    }
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
          const hasBreakpoint = gateAtSlot && breakpoints.has(gateAtSlot.id);
          const isCurrentDebugGate = gateAtSlot && gateAtSlot.id === currentDebugGateId;
          
          return (
            <div
              key={slotIdx}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, slotIdx)}
              className={`w-12 h-12 rounded border-2 border-dashed flex items-center justify-center transition-all ${
                gateAtSlot 
                  ? 'border-transparent' 
                  : 'border-border/50 hover:border-primary/50 hover:bg-primary/10'
              } ${isCurrentDebugGate ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-background' : ''}`}
            >
              {gateAtSlot ? (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`${GATE_DEFINITIONS[gateAtSlot.type].color} text-white w-10 h-10 rounded flex items-center justify-center font-bold cursor-pointer hover:scale-105 transition-transform relative group`}
                        onClick={(e) => handleGateClick(gateAtSlot, e)}
                      >
                        {/* Rotation angle arc indicator for RX, RY, RZ gates */}
                        {['RX', 'RY', 'RZ'].includes(gateAtSlot.type) && gateAtSlot.parameter !== undefined && (
                          <>
                            {/* Background ring */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 40 40">
                              <circle
                                cx="20"
                                cy="20"
                                r="18"
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="2"
                              />
                              {/* Progress arc showing rotation angle (normalized to 2π) */}
                              <circle
                                cx="20"
                                cy="20"
                                r="18"
                                fill="none"
                                stroke="rgba(255,255,255,0.9)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeDasharray={`${(Math.abs(gateAtSlot.parameter) / (2 * Math.PI)) * 113.1} 113.1`}
                                className="drop-shadow-[0_0_3px_rgba(255,255,255,0.5)]"
                              />
                            </svg>
                            {/* Angle value badge */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background/90 text-[8px] font-mono px-1 rounded text-foreground border border-border/50 whitespace-nowrap">
                              {(gateAtSlot.parameter / Math.PI).toFixed(1)}π
                            </div>
                          </>
                        )}
                        
                        <span className="relative z-10 text-xs">{gateAtSlot.type}</span>
                        
                        {/* Breakpoint indicator */}
                        {hasBreakpoint && (
                          <Circle className="absolute -left-1 -top-1 w-3 h-3 text-red-500 fill-red-500 z-20" />
                        )}
                        
                        {/* Remove button (only in non-debug mode) */}
                        {!debugMode && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            ×
                          </div>
                        )}
                        
                        {/* Debug mode: toggle breakpoint hint */}
                        {debugMode && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500/80 rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                            <Circle className="w-2 h-2" />
                          </div>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-semibold">{GATE_DEFINITIONS[gateAtSlot.type].name}</p>
                      <p className="text-xs font-mono text-primary">{GATE_DEFINITIONS[gateAtSlot.type].matrix}</p>
                      {gateAtSlot.parameter !== undefined && (
                        <p className="text-xs text-muted-foreground">θ = {gateAtSlot.parameter.toFixed(3)} rad ({(gateAtSlot.parameter / Math.PI).toFixed(2)}π)</p>
                      )}
                      {debugMode && (
                        <p className="text-xs text-yellow-500 mt-1">
                          Click to {hasBreakpoint ? 'remove' : 'set'} breakpoint
                        </p>
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
