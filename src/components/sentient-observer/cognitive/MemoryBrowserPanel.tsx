/**
 * Memory Browser Panel
 * Displays all stored memories with locations, content, and re-injection capability
 */

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  MapPin,
  Clock,
  Zap,
  RefreshCw,
  Trash2,
  MoreVertical,
  Waves
} from 'lucide-react';
import { HolographicMemory, MemoryFragment, getFieldVisualization } from '@/lib/sentient-observer/holographic-memory';

interface MemoryBrowserPanelProps {
  memory: HolographicMemory;
  onReinjectMemory: (content: string) => void;
  selectedMemoryId?: string;
  onSelectMemory?: (id: string | null) => void;
}

export const MemoryBrowserPanel: React.FC<MemoryBrowserPanelProps> = ({
  memory,
  onReinjectMemory,
  selectedMemoryId,
  onSelectMemory
}) => {
  // Get all memories as array, sorted by timestamp
  const allMemories = useMemo(() => {
    return Array.from(memory.fragments.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [memory.fragments]);
  
  // Generate field visualization
  const fieldViz = useMemo(() => {
    const field = getFieldVisualization(memory);
    const size = 16; // Display as 16x16 grid (downsampled from 32x32)
    const cellSize = 8;
    
    // Find memory locations for highlighting
    const memoryLocations = new Map<string, { x: number; y: number }>();
    memory.peaks.forEach(peak => {
      peak.fragments.forEach(fragId => {
        memoryLocations.set(fragId, { x: peak.x, y: peak.y });
      });
    });
    
    return (
      <svg 
        viewBox={`0 0 ${size * cellSize} ${size * cellSize}`}
        className="w-full h-full"
      >
        {/* Background field */}
        {Array.from({ length: size }, (_, i) =>
          Array.from({ length: size }, (_, j) => {
            // Sample from the 32x32 field
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
        
        {/* Memory peaks */}
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
  
  // Format timestamp
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
      
      {/* Memory Browser */}
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
            Click any memory to re-inject it into the oscillator system
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[280px]">
            <div className="p-3 space-y-2">
              <AnimatePresence>
                {allMemories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <Database className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No memories stored yet</p>
                    <p className="text-xs mt-1">
                      Store high-coherence inputs to build the memory field
                    </p>
                  </div>
                ) : (
                  allMemories.map((fragment, idx) => (
                    <motion.div
                      key={fragment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                      className={`
                        group p-3 rounded-lg border cursor-pointer transition-all
                        hover:bg-primary/5 hover:border-primary/30
                        ${selectedMemoryId === fragment.id ? 'bg-primary/10 border-primary/40' : ''}
                      `}
                      onClick={() => onSelectMemory?.(fragment.id === selectedMemoryId ? null : fragment.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">
                            {fragment.content}
                          </p>
                          
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(fragment.timestamp)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              {(fragment.coherenceAtStore * 100).toFixed(0)}%
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {fragment.primeSignature.slice(0, 3).join(',')}...
                            </span>
                          </div>
                          
                          {/* Amplitude decay visualization */}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Strength:</span>
                            <Progress 
                              value={Math.max(...fragment.amplitudes) * 100} 
                              className="h-1 flex-1"
                            />
                          </div>
                        </div>
                        
                        {/* Re-inject button */}
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onReinjectMemory(fragment.content);
                                }}
                              >
                                <RefreshCw className="h-4 w-4 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Re-inject into system</p>
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
