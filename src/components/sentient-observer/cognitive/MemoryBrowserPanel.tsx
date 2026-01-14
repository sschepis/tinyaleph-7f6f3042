/**
 * Memory Browser Panel
 * Displays all stored memories with search, daydreaming mode, and re-injection capability
 */

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  MapPin,
  Clock,
  Zap,
  RefreshCw,
  Waves,
  Search,
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

  // Get all memories as array, sorted by timestamp
  const allMemories = useMemo(() => {
    return Array.from(memory.fragments.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [memory.fragments]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const results = onSearchMemory(searchQuery);
    setSearchResults(results);
  }, [searchQuery, onSearchMemory]);

  // Auto-search as user types (debounced)
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

  // Daydreaming mode - randomly re-inject memories
  useEffect(() => {
    if (isDaydreamingEnabled && isSimulationRunning && allMemories.length > 0) {
      daydreamIntervalRef.current = setInterval(() => {
        // Pick a random memory weighted by strength
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
        
        // Clear the daydream indicator after 2 seconds
        setTimeout(() => setCurrentDaydream(null), 2000);
      }, 5000); // Daydream every 5 seconds
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
  
  // Generate field visualization
  const fieldViz = useMemo(() => {
    const field = getFieldVisualization(memory);
    const size = 16;
    const cellSize = 8;
    
    return (
      <svg 
        viewBox={`0 0 ${size * cellSize} ${size * cellSize}`}
        className="w-full h-full"
      >
        {Array.from({ length: size }, (_, i) =>
          Array.from({ length: size }, (_, j) => {
            const fx = Math.floor(i * 2);
            const fy = Math.floor(j * 2);
            const intensity = field[fx]?.[fy] ?? 0.5;
            
            return (
              <rect
                key={`${i}-${j}`}
                x={i * cellSize}
                y={j * cellSize}
                width={cellSize}
                height={cellSize}
                fill={`hsl(var(--primary) / ${intensity * 0.5})`}
                stroke="hsl(var(--border) / 0.2)"
                strokeWidth={0.5}
              />
            );
          })
        )}
        
        {memory.peaks.map((peak, idx) => {
          const px = (peak.x / 32) * size * cellSize;
          const py = (peak.y / 32) * size * cellSize;
          const isSelected = peak.fragments.includes(selectedMemoryId || '');
          
          return (
            <g key={idx}>
              <circle
                cx={px}
                cy={py}
                r={4 + peak.intensity * 4}
                fill={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.6)'}
                className={isSelected ? 'animate-pulse' : ''}
              />
              {isSelected && (
                <circle
                  cx={px}
                  cy={py}
                  r={8 + peak.intensity * 6}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  className="animate-spin"
                  style={{ animationDuration: '3s' }}
                />
              )}
            </g>
          );
        })}
      </svg>
    );
  }, [memory, selectedMemoryId]);
  
  const formatTime = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };
  
  return (
    <div className="space-y-4">
      {/* Field Visualization */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Waves className="h-4 w-4" />
            Memory Field
          </CardTitle>
          <CardDescription className="text-xs">
            Holographic interference pattern with {memory.peaks.length} active peaks
          </CardDescription>
        </CardHeader>
        <CardContent className="p-2">
          <div className="aspect-square rounded bg-background/50 overflow-hidden border">
            {fieldViz}
          </div>
        </CardContent>
      </Card>
      
      {/* Memory Browser with Integrated Search */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Stored Memories
            </div>
            <Badge variant="outline" className="font-mono">
              {allMemories.length}
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Memories are stored automatically from high-coherence conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Daydreaming Mode Toggle */}
          <div className="p-2 border rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4 text-purple-500" />
                <span className="text-xs font-medium">Daydreaming Mode</span>
              </div>
              <Switch
                checked={isDaydreamingEnabled}
                onCheckedChange={onToggleDaydreaming}
                disabled={!isSimulationRunning || allMemories.length === 0}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {!isSimulationRunning 
                ? 'Start simulation to enable'
                : allMemories.length === 0
                  ? 'No memories to daydream about'
                  : isDaydreamingEnabled 
                    ? 'Agent is recalling random memories...'
                    : 'Let the agent wander through its memories'
              }
            </p>
            
            {/* Current daydream indicator */}
            <AnimatePresence>
              {currentDaydream && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-2 p-2 bg-purple-500/10 rounded flex items-center gap-2"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Sparkles className="h-3 w-3 text-purple-500" />
                  </motion.div>
                  <span className="text-xs text-purple-300 truncate">
                    Recalling: "{currentDaydream.slice(0, 40)}..."
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Section */}
          <div className="space-y-2">
            <label className="text-xs font-medium flex items-center gap-1">
              <Search className="h-3 w-3" />
              Search Memories
            </label>
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for memories..."
              className="h-8 text-xs"
            />
            
            {/* Search Results */}
            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 pt-2 border-t"
                >
                  <label className="text-[10px] text-muted-foreground">
                    Found {searchResults.length} matching memories (click to re-inject)
                  </label>
                  <div className="space-y-1">
                    {searchResults.map((result, i) => (
                      <motion.div 
                        key={result.fragment.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-2 bg-primary/5 rounded text-xs cursor-pointer hover:bg-primary/10 border border-primary/20 transition-all"
                        onClick={() => onReinjectMemory(result.fragment.content)}
                      >
                        <div className="flex justify-between items-center gap-2">
                          <span className="truncate flex-1">
                            {result.fragment.content.slice(0, 50)}...
                          </span>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            {(result.similarity * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Memory List */}
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              <AnimatePresence>
                {allMemories.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs">
                    <Database className="h-6 w-6 mx-auto mb-2 opacity-40" />
                    <p>No memories stored yet</p>
                    <p className="text-[10px] mt-1">
                      Chat with the agent to build memories
                    </p>
                  </div>
                ) : (
                  allMemories.map((fragment, idx) => (
                    <motion.div
                      key={fragment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.03 }}
                      className={`
                        group p-2 rounded-lg border cursor-pointer transition-all
                        hover:bg-primary/5 hover:border-primary/30
                        ${selectedMemoryId === fragment.id ? 'bg-primary/10 border-primary/40' : ''}
                      `}
                      onClick={() => onSelectMemory?.(fragment.id === selectedMemoryId ? null : fragment.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs line-clamp-2">
                            {fragment.content}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-2.5 w-2.5" />
                              {formatTime(fragment.timestamp)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Zap className="h-2.5 w-2.5" />
                              {(fragment.coherenceAtStore * 100).toFixed(0)}%
                            </span>
                          </div>
                          
                          <Progress 
                            value={Math.max(...fragment.amplitudes) * 100} 
                            className="h-0.5 mt-1.5"
                          />
                        </div>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onReinjectMemory(fragment.content);
                                }}
                              >
                                <RefreshCw className="h-3 w-3 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">Re-inject into system</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};