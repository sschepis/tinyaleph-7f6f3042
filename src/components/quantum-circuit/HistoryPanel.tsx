import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Undo2, Redo2, History, Clock, GitCompare, ChevronDown, ChevronUp
} from 'lucide-react';
import { CircuitSnapshot } from '@/lib/quantum-circuit/storage';
import { GateInstance } from '@/lib/quantum-circuit/types';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface HistoryPanelProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  history: CircuitSnapshot[];
  currentGates: GateInstance[];
  onRestoreSnapshot: (snapshot: CircuitSnapshot) => void;
}

export const HistoryPanel = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  history,
  currentGates,
  onRestoreSnapshot,
}: HistoryPanelProps) => {
  const [expanded, setExpanded] = useState(false);
  const [compareIndex, setCompareIndex] = useState<number | null>(null);
  
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  
  const getGateDiff = (snapshotGates: GateInstance[]) => {
    const added = currentGates.filter(
      cg => !snapshotGates.some(sg => sg.id === cg.id)
    ).length;
    const removed = snapshotGates.filter(
      sg => !currentGates.some(cg => cg.id === sg.id)
    ).length;
    return { added, removed };
  };
  
  return (
    <div className="space-y-3">
      {/* Undo/Redo Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 h-8"
        >
          <Undo2 className="w-3 h-3 mr-1" /> Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          className="flex-1 h-8"
        >
          <Redo2 className="w-3 h-3 mr-1" /> Redo
        </Button>
      </div>
      
      {/* History List */}
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full justify-between h-8 text-xs">
            <span className="flex items-center gap-1">
              <History className="w-3 h-3" />
              {history.length} versions
            </span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-2 space-y-1 max-h-[200px] overflow-y-auto">
            {history.slice().reverse().map((snapshot, idx) => {
              const actualIdx = history.length - 1 - idx;
              const isLatest = idx === 0;
              const isCurrent = actualIdx === history.length - 1;
              const diff = !isCurrent ? getGateDiff(snapshot.gates) : null;
              const isComparing = compareIndex === actualIdx;
              
              return (
                <div
                  key={snapshot.timestamp}
                  className={`p-2 rounded text-xs border transition-colors ${
                    isCurrent 
                      ? 'bg-primary/10 border-primary/30' 
                      : isComparing
                        ? 'bg-yellow-500/10 border-yellow-500/30'
                        : 'bg-muted/30 border-transparent hover:border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono">{formatTime(snapshot.timestamp)}</span>
                      {isLatest && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                          Current
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {snapshot.gates.length} gates
                    </span>
                  </div>
                  
                  {snapshot.label && (
                    <div className="text-muted-foreground mt-1">{snapshot.label}</div>
                  )}
                  
                  {diff && (diff.added > 0 || diff.removed > 0) && (
                    <div className="flex items-center gap-2 mt-1 text-[10px]">
                      {diff.added > 0 && (
                        <span className="text-green-500">+{diff.added} added</span>
                      )}
                      {diff.removed > 0 && (
                        <span className="text-red-500">-{diff.removed} removed</span>
                      )}
                    </div>
                  )}
                  
                  {!isCurrent && (
                    <div className="flex items-center gap-1 mt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => onRestoreSnapshot(snapshot)}
                      >
                        Restore
                      </Button>
                      <Button
                        variant={isComparing ? 'secondary' : 'ghost'}
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={() => setCompareIndex(isComparing ? null : actualIdx)}
                      >
                        <GitCompare className="w-3 h-3 mr-1" />
                        {isComparing ? 'Comparing' : 'Compare'}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
