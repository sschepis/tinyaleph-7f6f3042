import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MemoryPattern } from '@/lib/cosmic-holographic/types';
import { Layers, Clock } from 'lucide-react';

interface PatternListPanelProps {
  patterns: MemoryPattern[];
  highlightedPattern: string | null;
  onHighlightPattern: (patternId: string | null) => void;
}

export function PatternListPanel({ 
  patterns, 
  highlightedPattern,
  onHighlightPattern 
}: PatternListPanelProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers className="w-4 h-4" /> Stored Patterns ({patterns.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[180px]">
          {patterns.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4 px-4">
              No patterns stored yet
            </p>
          ) : (
            <div className="space-y-1 p-2">
              {patterns.map((pattern) => {
                const isHighlighted = highlightedPattern === pattern.id;
                const age = Math.floor((Date.now() - pattern.timestamp) / 1000);
                
                return (
                  <button
                    key={pattern.id}
                    onClick={() => onHighlightPattern(isHighlighted ? null : pattern.id)}
                    className={`w-full text-left p-2 rounded transition-colors ${
                      isHighlighted 
                        ? 'bg-primary/20 border border-primary/40' 
                        : 'bg-secondary/30 hover:bg-secondary/50 border border-transparent'
                    }`}
                  >
                    <div className="text-xs font-medium truncate">
                      {pattern.content}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {pattern.storedAt.length} nodes
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {age}s ago
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {(pattern.coherenceLevel * 100).toFixed(0)}% coh
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
