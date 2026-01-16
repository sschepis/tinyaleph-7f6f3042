/**
 * Memory Browser Panel - Compact version
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Clock,
  Zap,
  RefreshCw,
  Moon,
  Sparkles
} from 'lucide-react';
import { HolographicMemory, MemoryFragment, getFieldVisualization } from '@/lib/sentient-observer/holographic-memory';

interface MemoryBrowserPanelProps {
  memory: HolographicMemory;
  onReinjectMemory: (content: string) => void;
  selectedMemoryId?: string;
  onSelectMemory?: (id: string | null) => void;
  onSearchMemory: (query: string) => { fragment: MemoryFragment; similarity: number; location: { x: number; y: number } }[];
  isDaydreamingEnabled: boolean;
  onToggleDaydreaming: () => void;
  isSimulationRunning: boolean;
}

export const MemoryBrowserPanel: React.FC<MemoryBrowserPanelProps> = ({
  memory,
  onReinjectMemory,
  selectedMemoryId,
  onSelectMemory,
  onSearchMemory,
  isDaydreamingEnabled,
  onToggleDaydreaming,
  isSimulationRunning
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ fragment: MemoryFragment; similarity: number; location: { x: number; y: number } }[]>([]);
  const daydreamIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentDaydream, setCurrentDaydream] = useState<string | null>(null);

  const allMemories = useMemo(() => {
    return Array.from(memory.fragments.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [memory.fragments]);

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = onSearchMemory(searchQuery);
    setSearchResults(results);
  }, [searchQuery, onSearchMemory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  useEffect(() => {
    if (isDaydreamingEnabled && isSimulationRunning && allMemories.length > 0) {
      daydreamIntervalRef.current = setInterval(() => {
        const weights = allMemories.map(m => Math.max(...m.amplitudes));
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * totalWeight;
        
        let selectedMemory = allMemories[0];
        for (let i = 0; i < allMemories.length; i++) {
          random -= weights[i];
          if (random <= 0) {
            selectedMemory = allMemories[i];
            break;
          }
        }
        
        setCurrentDaydream(selectedMemory.content);
        onReinjectMemory(selectedMemory.content);
        setTimeout(() => setCurrentDaydream(null), 2000);
      }, 5000);
    } else {
      if (daydreamIntervalRef.current) {
        clearInterval(daydreamIntervalRef.current);
        daydreamIntervalRef.current = null;
      }
    }
    
    return () => {
      if (daydreamIntervalRef.current) {
        clearInterval(daydreamIntervalRef.current);
      }
    };
  }, [isDaydreamingEnabled, isSimulationRunning, allMemories, onReinjectMemory]);
  
  const fieldViz = useMemo(() => {
    const field = getFieldVisualization(memory);
    const size = 10;
    const cellSize = 8;
    
    return (
      <svg 
        viewBox={`0 0 ${size * cellSize} ${size * cellSize}`}
        className="w-full h-full"
      >
        {Array.from({ length: size }, (_, i) =>
          Array.from({ length: size }, (_, j) => {
            const fx = Math.floor(i * 3.2);
            const fy = Math.floor(j * 3.2);
            const intensity = field[fx]?.[fy] ?? 0.5;
            
            return (
              <rect
                key={`${i}-${j}`}
                x={i * cellSize}
                y={j * cellSize}
                width={cellSize}
                height={cellSize}
                fill={`hsl(var(--primary) / ${intensity * 0.6})`}
              />
            );
          })
        )}
        
        {memory.peaks.slice(0, 5).map((peak, idx) => {
          const px = (peak.x / 32) * size * cellSize;
          const py = (peak.y / 32) * size * cellSize;
          
          return (
            <circle
              key={idx}
              cx={px}
              cy={py}
              r={2 + peak.intensity * 2}
              fill="hsl(var(--primary))"
            />
          );
        })}
      </svg>
    );
  }, [memory]);
  
  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h`;
  };
  
  return (
    <div className="space-y-2">
      {/* Top row: Field viz + controls */}
      <div className="flex gap-2 items-start">
        <div className="w-16 h-16 rounded bg-muted/30 overflow-hidden border shrink-0">
          {fieldViz}
        </div>
        <div className="flex-1 space-y-1">
          {/* Daydream toggle */}
          <div className="flex items-center justify-between p-1.5 rounded bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-1">
              <Moon className="h-3 w-3 text-purple-500" />
              <span className="text-[10px]">Daydream</span>
            </div>
            <Switch
              checked={isDaydreamingEnabled}
              onCheckedChange={onToggleDaydreaming}
              disabled={!isSimulationRunning || allMemories.length === 0}
              className="scale-[0.6]"
            />
          </div>
          
          {/* Stats */}
          <div className="flex gap-1 text-center">
            <div className="flex-1 p-1 bg-muted/30 rounded">
              <div className="text-xs font-mono">{allMemories.length}</div>
              <div className="text-[7px] text-muted-foreground">mem</div>
            </div>
            <div className="flex-1 p-1 bg-muted/30 rounded">
              <div className="text-xs font-mono">{memory.peaks.length}</div>
              <div className="text-[7px] text-muted-foreground">peaks</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Daydream indicator */}
      <AnimatePresence>
        {currentDaydream && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-1 bg-purple-500/10 rounded flex items-center gap-1"
          >
            <Sparkles className="h-2.5 w-2.5 text-purple-500 animate-pulse" />
            <span className="text-[9px] text-purple-300 truncate">{currentDaydream.slice(0, 30)}...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <Input
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        placeholder="Search..."
        className="h-6 text-[10px]"
      />
      
      {/* Search Results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-0.5 p-1 border rounded bg-primary/5"
          >
            {searchResults.slice(0, 3).map((result, i) => (
              <div 
                key={result.fragment.id}
                className="p-1 bg-muted/30 rounded text-[9px] cursor-pointer hover:bg-muted/50 flex justify-between"
                onClick={() => onReinjectMemory(result.fragment.content)}
              >
                <span className="truncate flex-1">{result.fragment.content.slice(0, 35)}...</span>
                <span className="font-mono text-muted-foreground ml-1">{(result.similarity * 100).toFixed(0)}%</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Memory List */}
      <ScrollArea className="h-[140px]">
        <div className="space-y-1">
          {allMemories.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground text-[10px]">
              <Database className="h-4 w-4 mx-auto mb-1 opacity-40" />
              No memories yet
            </div>
          ) : (
            allMemories.slice(0, 10).map((fragment) => (
              <div
                key={fragment.id}
                className={`
                  group p-1.5 rounded border cursor-pointer transition-all text-[10px]
                  hover:bg-primary/5 hover:border-primary/30
                  ${selectedMemoryId === fragment.id ? 'bg-primary/10 border-primary/40' : 'bg-muted/20'}
                `}
                onClick={() => onSelectMemory?.(fragment.id === selectedMemoryId ? null : fragment.id)}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="flex-1 min-w-0">
                    <p className="line-clamp-1">{fragment.content}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[8px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2 w-2" />
                        {formatTime(fragment.timestamp)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Zap className="h-2 w-2" />
                        {(fragment.coherenceAtStore * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReinjectMemory(fragment.content);
                    }}
                  >
                    <RefreshCw className="h-2.5 w-2.5 text-primary" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
