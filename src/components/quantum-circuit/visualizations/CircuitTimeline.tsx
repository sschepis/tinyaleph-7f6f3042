import { Clock } from 'lucide-react';
import { GateInstance, Wire, GATE_DEFINITIONS } from '@/lib/quantum-circuit/types';

interface CircuitTimelineProps {
  gates: GateInstance[];
  wires: Wire[];
}

export const CircuitTimeline = ({ gates, wires }: CircuitTimelineProps) => {
  if (gates.length === 0) {
    return (
      <div className="h-24 bg-muted/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
        Add gates to see timeline
      </div>
    );
  }
  
  const maxPosition = Math.max(...gates.map(g => g.position), 0);
  const sortedGates = [...gates].sort((a, b) => a.position - b.position);
  
  const utilization: number[] = [];
  for (let t = 0; t <= maxPosition; t++) {
    const gatesAtT = gates.filter(g => g.position === t);
    const activeQubits = new Set<number>();
    gatesAtT.forEach(g => {
      activeQubits.add(g.wireIndex);
      if (g.controlWire !== undefined) activeQubits.add(g.controlWire);
      if (g.controlWire2 !== undefined) activeQubits.add(g.controlWire2);
    });
    utilization.push(activeQubits.size / wires.length);
  }
  
  return (
    <div className="bg-muted/30 rounded-lg border border-border p-3">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Execution Timeline</span>
      </div>
      
      <div className="space-y-1">
        {wires.map((wire, wireIdx) => (
          <div key={wire.id} className="flex items-center gap-1">
            <span className="text-[10px] font-mono text-muted-foreground w-8">q[{wireIdx}]</span>
            <div className="flex-1 flex gap-px h-4">
              {Array.from({ length: maxPosition + 1 }).map((_, t) => {
                const gateAtT = gates.find(g => 
                  g.position === t && (
                    g.wireIndex === wireIdx || 
                    g.controlWire === wireIdx ||
                    g.controlWire2 === wireIdx
                  )
                );
                const isTarget = gateAtT?.wireIndex === wireIdx;
                const isControl = gateAtT?.controlWire === wireIdx || gateAtT?.controlWire2 === wireIdx;
                
                return (
                  <div
                    key={t}
                    className={`flex-1 rounded-sm transition-colors ${
                      gateAtT
                        ? isTarget
                          ? 'bg-primary'
                          : isControl
                            ? 'bg-primary/50'
                            : 'bg-muted'
                        : 'bg-muted/50'
                    }`}
                    title={gateAtT ? `t=${t}: ${gateAtT.type}` : `t=${t}: idle`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2 pt-2 border-t border-border/50">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground w-8">Util</span>
          <div className="flex-1 flex gap-px h-3">
            {utilization.map((u, t) => (
              <div
                key={t}
                className="flex-1 rounded-sm"
                style={{ backgroundColor: `hsl(${120 * u}, 70%, ${30 + 25 * u}%)` }}
                title={`t=${t}: ${(u * 100).toFixed(0)}% utilization`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex mt-1">
        <div className="w-8" />
        <div className="flex-1 flex justify-between text-[8px] text-muted-foreground px-1">
          <span>t=0</span>
          {maxPosition > 0 && <span>t={maxPosition}</span>}
        </div>
      </div>
      
      <div className="mt-2 pt-2 border-t border-border/50">
        <div className="text-[10px] text-muted-foreground mb-1">Gate Sequence:</div>
        <div className="flex flex-wrap gap-1">
          {sortedGates.slice(0, 12).map((gate) => (
            <span 
              key={gate.id}
              className={`px-1.5 py-0.5 rounded text-[9px] font-mono text-white ${GATE_DEFINITIONS[gate.type].color}`}
              title={`Position ${gate.position}: ${gate.type} on q[${gate.wireIndex}]`}
            >
              {gate.type}
            </span>
          ))}
          {sortedGates.length > 12 && (
            <span className="text-[9px] text-muted-foreground">+{sortedGates.length - 12} more</span>
          )}
        </div>
      </div>
    </div>
  );
};
