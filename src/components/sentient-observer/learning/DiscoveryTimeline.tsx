/**
 * Discovery Timeline
 * 
 * Chronological feed of learned symbols and relationships.
 */

import React, { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  Link2, 
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LearnedSymbol, LearnedRelationship } from '@/lib/sentient-observer/learning-engine';

interface DiscoveryTimelineProps {
  symbols: LearnedSymbol[];
  relationships: LearnedRelationship[];
  maxItems?: number;
}

type DiscoveryItem = {
  type: 'symbol' | 'relationship';
  timestamp: number;
  data: LearnedSymbol | LearnedRelationship;
};

const relationshipLabels: Record<string, string> = {
  similar: 'is similar to',
  opposite: 'opposes',
  contains: 'contains',
  part_of: 'is part of',
  transforms_to: 'transforms into',
  resonates_with: 'resonates with'
};

const relationshipSymbols: Record<string, string> = {
  similar: '≈',
  opposite: '⊕',
  contains: '⊃',
  part_of: '⊂',
  transforms_to: '→',
  resonates_with: '∿'
};

const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const SymbolCard: React.FC<{ symbol: LearnedSymbol; isNew: boolean }> = ({ symbol, isNew }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -20, scale: 0.95 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="p-2.5 bg-amber-500/5 border border-amber-500/20 rounded-lg"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-500/20 rounded">
            <Lightbulb className="h-3 w-3 text-amber-500" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-amber-500">p{symbol.prime}</span>
              <span className="text-xs font-medium">{symbol.meaning}</span>
            </div>
            {symbol.category && (
              <Badge variant="outline" className="text-[8px] h-3 mt-0.5">
                {symbol.category}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-muted-foreground font-mono">
            {Math.round(symbol.confidence * 100)}%
          </span>
          {symbol.reasoning && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-0.5 hover:bg-muted rounded"
            >
              {expanded ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && symbol.reasoning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-amber-500/10 leading-relaxed">
              {symbol.reasoning}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const RelationshipCard: React.FC<{ 
  relationship: LearnedRelationship; 
  symbolMap: Map<number, LearnedSymbol>;
  isNew: boolean;
}> = ({ relationship, symbolMap, isNew }) => {
  const symbolA = symbolMap.get(relationship.primeA);
  const symbolB = symbolMap.get(relationship.primeB);
  const relSymbol = relationshipSymbols[relationship.relationshipType] || '?';
  const relLabel = relationshipLabels[relationship.relationshipType] || relationship.relationshipType;

  return (
    <motion.div
      initial={isNew ? { opacity: 0, x: -20, scale: 0.95 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      className="p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg"
    >
      <div className="flex items-center gap-2">
        <div className="p-1 bg-blue-500/20 rounded">
          <Link2 className="h-3 w-3 text-blue-500" />
        </div>
        <div className="flex items-center gap-1.5 flex-1 flex-wrap">
          <Badge variant="secondary" className="text-[10px] h-5 font-mono">
            p{relationship.primeA}
            {symbolA && <span className="ml-1 font-normal opacity-70">{symbolA.meaning}</span>}
          </Badge>
          <span className="text-primary text-sm font-bold" title={relLabel}>
            {relSymbol}
          </span>
          <Badge variant="secondary" className="text-[10px] h-5 font-mono">
            p{relationship.primeB}
            {symbolB && <span className="ml-1 font-normal opacity-70">{symbolB.meaning}</span>}
          </Badge>
        </div>
        <span className="text-[9px] text-muted-foreground font-mono">
          {Math.round(relationship.strength * 100)}%
        </span>
      </div>
      {relationship.explanation && (
        <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-blue-500/10 leading-relaxed line-clamp-2">
          {relationship.explanation}
        </p>
      )}
    </motion.div>
  );
};

export const DiscoveryTimeline: React.FC<DiscoveryTimelineProps> = ({
  symbols,
  relationships,
  maxItems = 15
}) => {
  // Create a map for quick symbol lookup
  const symbolMap = useMemo(() => {
    const map = new Map<number, LearnedSymbol>();
    symbols.forEach(s => map.set(s.prime, s));
    return map;
  }, [symbols]);

  // Combine and sort by timestamp
  const timeline = useMemo(() => {
    const items: DiscoveryItem[] = [];
    
    symbols.forEach(symbol => {
      items.push({
        type: 'symbol',
        timestamp: symbol.learnedAt,
        data: symbol
      });
    });
    
    relationships.forEach(rel => {
      items.push({
        type: 'relationship',
        timestamp: rel.learnedAt,
        data: rel
      });
    });
    
    // Sort newest first
    items.sort((a, b) => b.timestamp - a.timestamp);
    
    return items.slice(0, maxItems);
  }, [symbols, relationships, maxItems]);

  // Track which items are "new" (within last 10 seconds)
  const now = Date.now();
  const isNew = (timestamp: number) => now - timestamp < 10000;

  if (timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <Lightbulb className="h-8 w-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">No discoveries yet</p>
        <p className="text-[10px] text-muted-foreground/70 mt-1">
          Start learning to discover symbols and relationships
        </p>
      </div>
    );
  }

  // Group by time periods
  const groupedTimeline = useMemo(() => {
    const groups: { label: string; items: DiscoveryItem[] }[] = [];
    let currentGroup: { label: string; items: DiscoveryItem[] } | null = null;

    timeline.forEach(item => {
      const timeAgo = formatTimeAgo(item.timestamp);
      
      if (!currentGroup || currentGroup.label !== timeAgo) {
        currentGroup = { label: timeAgo, items: [] };
        groups.push(currentGroup);
      }
      currentGroup.items.push(item);
    });

    return groups;
  }, [timeline]);

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 p-1">
        {groupedTimeline.map((group, groupIdx) => (
          <div key={groupIdx}>
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-medium">
                {group.label}
              </span>
              <div className="flex-1 h-px bg-border/50" />
            </div>
            
            <div className="space-y-2 pl-5">
              {group.items.map((item, idx) => (
                <div key={`${item.type}-${idx}`}>
                  {item.type === 'symbol' ? (
                    <SymbolCard 
                      symbol={item.data as LearnedSymbol} 
                      isNew={isNew(item.timestamp)}
                    />
                  ) : (
                    <RelationshipCard 
                      relationship={item.data as LearnedRelationship}
                      symbolMap={symbolMap}
                      isNew={isNew(item.timestamp)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
