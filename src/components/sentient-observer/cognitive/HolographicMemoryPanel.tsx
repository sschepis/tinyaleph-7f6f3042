import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Database,
  Search,
  Sparkles,
  Clock,
  MapPin,
  Trash2,
  Waves
} from 'lucide-react';
import type { HolographicMemory, MemoryFragment, MemoryLocation } from '@/lib/sentient-observer/holographic-memory';

interface HolographicMemoryPanelProps {
  memory: HolographicMemory;
  onStoreMemory: (content: string) => void;
  onRecallMemory: (query: string) => void;
  onClickLocation: (x: number, y: number) => void;
  recallResults: { fragment: MemoryFragment; similarity: number; location: { x: number; y: number } }[];
  selectedLocation: { x: number; y: number } | null;
  isRecalling: boolean;
}

export function HolographicMemoryPanel({
  memory,
  onStoreMemory,
  onRecallMemory,
  onClickLocation,
  recallResults,
  selectedLocation,
  isRecalling
}: HolographicMemoryPanelProps) {
  const [storeInput, setStoreInput] = React.useState('');
  const [searchInput, setSearchInput] = React.useState('');
  
  const handleStore = useCallback(() => {
    if (storeInput.trim()) {
      onStoreMemory(storeInput.trim());
      setStoreInput('');
    }
  }, [storeInput, onStoreMemory]);
  
  const handleSearch = useCallback(() => {
    if (searchInput.trim()) {
      onRecallMemory(searchInput.trim());
    }
  }, [searchInput, onRecallMemory]);
  
  // Visualization of the holographic field
  const fieldVisualization = useMemo(() => {
    const size = 200;
    const gridSize = memory.field.length || 16;
    const cellSize = size / gridSize;
    
    // Find max for normalization
    let maxVal = 0;
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        if (Math.abs(memory.field[x]?.[y] || 0) > maxVal) {
          maxVal = Math.abs(memory.field[x][y]);
        }
      }
    }
    if (maxVal === 0) maxVal = 1;
    
    const cells: React.ReactNode[] = [];
    for (let x = 0; x < gridSize; x++) {
      for (let y = 0; y < gridSize; y++) {
        const val = memory.field[x]?.[y] || 0;
        const normalized = (val + maxVal) / (2 * maxVal);
        const brightness = Math.floor(normalized * 255);
        const isSelected = selectedLocation && 
          Math.abs(selectedLocation.x - x) < 2 && 
          Math.abs(selectedLocation.y - y) < 2;
        
        cells.push(
          <rect
            key={`${x}-${y}`}
            x={y * cellSize}
            y={x * cellSize}
            width={cellSize}
            height={cellSize}
            fill={`rgb(${brightness}, ${Math.floor(brightness * 0.6)}, ${255 - brightness})`}
            stroke={isSelected ? 'hsl(var(--primary))' : 'none'}
            strokeWidth={isSelected ? 2 : 0}
            style={{ cursor: 'pointer' }}
            onClick={() => onClickLocation(x, y)}
          />
        );
      }
    }
    
    // Add peak markers
    memory.peaks.forEach((peak, idx) => {
      cells.push(
        <circle
          key={`peak-${idx}`}
          cx={(peak.y + 0.5) * cellSize}
          cy={(peak.x + 0.5) * cellSize}
          r={4 + peak.intensity * 4}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={1.5}
          opacity={0.8}
        />
      );
    });
    
    return (
      <svg width={size} height={size} className="mx-auto border rounded-lg">
        {cells}
      </svg>
    );
  }, [memory.field, memory.peaks, selectedLocation, onClickLocation]);
  
  const stats = useMemo(() => ({
    totalMemories: memory.fragments.size,
    peakCount: memory.peaks.length,
    fieldEnergy: Math.sqrt(memory.field.flat().reduce((sum, v) => sum + v * v, 0))
  }), [memory]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="h-4 w-4 text-primary" />
          Holographic Memory Field
        </CardTitle>
        <CardDescription className="text-xs">
          Click the field to recall memories at that location
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-lg font-mono">{stats.totalMemories}</div>
            <div className="text-[10px] text-muted-foreground">Memories</div>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-lg font-mono">{stats.peakCount}</div>
            <div className="text-[10px] text-muted-foreground">Peaks</div>
          </div>
          <div className="p-2 bg-muted/50 rounded">
            <div className="text-lg font-mono">{stats.fieldEnergy.toFixed(1)}</div>
            <div className="text-[10px] text-muted-foreground">Energy</div>
          </div>
        </div>
        
        {/* Field Visualization */}
        <div className="flex justify-center">
          {fieldVisualization}
        </div>
        
        {/* Store Memory */}
        <div className="space-y-1">
          <div className="text-xs font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Store Memory
          </div>
          <div className="flex gap-2">
            <Input
              value={storeInput}
              onChange={e => setStoreInput(e.target.value)}
              placeholder="Enter memory content..."
              className="h-8 text-xs"
              onKeyDown={e => e.key === 'Enter' && handleStore()}
            />
            <Button size="sm" onClick={handleStore} className="h-8">
              <Database className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Search Memory */}
        <div className="space-y-1">
          <div className="text-xs font-medium flex items-center gap-1">
            <Search className="h-3 w-3" />
            Search Memories
          </div>
          <div className="flex gap-2">
            <Input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Query memories..."
              className="h-8 text-xs"
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <Button size="sm" onClick={handleSearch} disabled={isRecalling} className="h-8">
              <Search className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Recall Results */}
        {recallResults.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-medium">Found Memories</div>
            <ScrollArea className="h-32">
              <div className="space-y-1">
                <AnimatePresence>
                  {recallResults.map((result, idx) => (
                    <motion.div
                      key={result.fragment.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ delay: idx * 0.1 }}
                      className="p-2 bg-muted/30 rounded text-xs border cursor-pointer hover:bg-muted/50"
                      onClick={() => onClickLocation(result.location.x, result.location.y)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="truncate flex-1">{result.fragment.content}</span>
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {(result.similarity * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-1 text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-2.5 w-2.5" />
                          ({result.location.x}, {result.location.y})
                        </span>
                        <span className="flex items-center gap-0.5">
                          <Clock className="h-2.5 w-2.5" />
                          {new Date(result.fragment.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HolographicMemoryPanel;
