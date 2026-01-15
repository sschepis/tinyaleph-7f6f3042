import { motion, AnimatePresence } from 'framer-motion';
import { Route, Zap, TrendingUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { PathFlow, SephirahName } from '@/lib/sephirotic-oscillator/types';
import { HEBREW_PATHS, getPathBetween, getAssociationColor } from '@/lib/sephirotic-oscillator/path-letters';
import { SEPHIROT } from '@/lib/sephirotic-oscillator/tree-config';

interface PathAnalysisPanelProps {
  flows: PathFlow[];
  oscillators: Map<SephirahName, unknown>;
}

interface ActivePath {
  letter: string;
  letterName: string;
  from: string;
  to: string;
  energy: number;
  efficiency: number;
  color: string;
}

export function PathAnalysisPanel({ flows, oscillators }: PathAnalysisPanelProps) {
  // Calculate active paths from flows
  const activePaths: ActivePath[] = [];
  const pathEnergyMap = new Map<string, number>();
  
  flows.forEach(flow => {
    const path = getPathBetween(flow.from, flow.to);
    if (path) {
      const key = path.id;
      const currentEnergy = pathEnergyMap.get(key) || 0;
      pathEnergyMap.set(key, currentEnergy + flow.strength);
    }
  });
  
  // Also check oscillator energy to find paths between active nodes
  const activeNodes = Array.from(oscillators.entries())
    .filter(([_, node]) => (node as { energy: number }).energy > 0.1)
    .map(([id]) => id);
  
  activeNodes.forEach(nodeId => {
    const sephirah = SEPHIROT[nodeId];
    sephirah.connections.forEach(connId => {
      if (activeNodes.includes(connId)) {
        const path = getPathBetween(nodeId, connId);
        if (path && !pathEnergyMap.has(path.id)) {
          const node1 = oscillators.get(nodeId) as { energy: number } | undefined;
          const node2 = oscillators.get(connId) as { energy: number } | undefined;
          const avgEnergy = ((node1?.energy || 0) + (node2?.energy || 0)) / 2;
          pathEnergyMap.set(path.id, avgEnergy * 0.5);
        }
      }
    });
  });
  
  // Convert to active paths array
  pathEnergyMap.forEach((energy, pathId) => {
    const path = HEBREW_PATHS.find(p => p.id === pathId);
    if (path && energy > 0.01) {
      // Calculate efficiency based on impedance
      const efficiency = (1 - path.impedance) * 100;
      
      activePaths.push({
        letter: path.letter,
        letterName: path.letterName,
        from: SEPHIROT[path.from].name,
        to: SEPHIROT[path.to].name,
        energy: energy,
        efficiency,
        color: getAssociationColor(path.association)
      });
    }
  });
  
  // Sort by energy
  activePaths.sort((a, b) => b.energy - a.energy);
  
  const totalFlow = activePaths.reduce((sum, p) => sum + p.energy, 0);
  const avgEfficiency = activePaths.length > 0 
    ? activePaths.reduce((sum, p) => sum + p.efficiency, 0) / activePaths.length 
    : 0;

  return (
    <div className="bg-black/60 border border-primary/30 rounded-lg p-3 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <Route className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-primary">Path Analysis</h3>
      </div>
      
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-black/40 rounded p-2 border border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
            <Zap className="w-3 h-3" />
            Total Flow
          </div>
          <div className="text-lg font-mono text-cyan-400">
            {(totalFlow * 100).toFixed(1)}
          </div>
        </div>
        <div className="bg-black/40 rounded p-2 border border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
            <TrendingUp className="w-3 h-3" />
            Avg Efficiency
          </div>
          <div className="text-lg font-mono text-emerald-400">
            {avgEfficiency.toFixed(0)}%
          </div>
        </div>
      </div>
      
      {/* Active paths list */}
      <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">
        Active Paths ({activePaths.length}/22)
      </div>
      
      <ScrollArea className="flex-1 -mx-1 px-1">
        <AnimatePresence mode="popLayout">
          {activePaths.length === 0 ? (
            <div className="text-xs text-muted-foreground/50 italic py-4 text-center">
              No active paths
            </div>
          ) : (
            <div className="space-y-1.5">
              {activePaths.slice(0, 10).map((path, idx) => (
                <motion.div
                  key={path.letterName}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-2 bg-black/30 rounded p-1.5 border border-white/5"
                >
                  {/* Letter badge */}
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center text-base font-serif"
                    style={{ 
                      backgroundColor: `${path.color}20`,
                      border: `1.5px solid ${path.color}`,
                      color: path.color,
                      boxShadow: `0 0 8px ${path.color}40`
                    }}
                  >
                    {path.letter}
                  </div>
                  
                  {/* Path info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-foreground truncate">
                        {path.letterName}
                      </span>
                      <span className="text-[9px] font-mono" style={{ color: path.color }}>
                        {(path.energy * 100).toFixed(0)}
                      </span>
                    </div>
                    <div className="text-[9px] text-muted-foreground truncate">
                      {path.from} → {path.to}
                    </div>
                    {/* Energy bar */}
                    <div className="h-1 bg-black/50 rounded-full mt-1 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: path.color }}
                        animate={{ width: `${Math.min(100, path.energy * 200)}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
