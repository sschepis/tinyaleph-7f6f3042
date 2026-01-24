/**
 * Knowledge Growth Stats
 * 
 * Progress bars showing symbol/relationship/category completeness.
 */

import React, { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Link2, 
  Folder,
  TrendingUp,
  Target
} from 'lucide-react';
import type { LearnedSymbol, LearnedRelationship } from '@/lib/sentient-observer/learning-engine';

interface KnowledgeGrowthStatsProps {
  symbols: LearnedSymbol[];
  relationships: LearnedRelationship[];
  goalsCompleted: number;
  targetSymbols?: number;
  targetRelationships?: number;
}

const ARCHETYPE_CATEGORIES = [
  'consciousness',
  'structure', 
  'dynamics',
  'relation',
  'creation',
  'destruction',
  'transformation',
  'unity',
  'duality',
  'infinity',
  'time',
  'space'
];

export const KnowledgeGrowthStats: React.FC<KnowledgeGrowthStatsProps> = ({
  symbols,
  relationships,
  goalsCompleted,
  targetSymbols = 100,
  targetRelationships = 80
}) => {
  // Calculate category distribution
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {};
    symbols.forEach(s => {
      const cat = s.category || 'uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    
    // Sort by count, take top categories
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [symbols]);

  const symbolProgress = Math.min((symbols.length / targetSymbols) * 100, 100);
  const relationProgress = Math.min((relationships.length / targetRelationships) * 100, 100);
  const uniqueCategories = new Set(symbols.map(s => s.category).filter(Boolean)).size;
  const categoryProgress = Math.min((uniqueCategories / ARCHETYPE_CATEGORIES.length) * 100, 100);

  return (
    <div className="space-y-3">
      {/* Progress Bars */}
      <div className="space-y-2">
        {/* Symbols Progress */}
        <div className="flex items-center gap-2">
          <Brain className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-muted-foreground">Symbols</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {symbols.length}/{targetSymbols}
              </span>
            </div>
            <Progress value={symbolProgress} className="h-1.5" />
          </div>
        </div>

        {/* Relations Progress */}
        <div className="flex items-center gap-2">
          <Link2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-muted-foreground">Relations</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {relationships.length}/{targetRelationships}
              </span>
            </div>
            <Progress value={relationProgress} className="h-1.5" />
          </div>
        </div>

        {/* Categories Progress */}
        <div className="flex items-center gap-2">
          <Folder className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[10px] text-muted-foreground">Categories</span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {uniqueCategories}/{ARCHETYPE_CATEGORIES.length}
              </span>
            </div>
            <Progress value={categoryProgress} className="h-1.5" />
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      {categoryStats.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[9px] text-muted-foreground">Top Categories:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {categoryStats.map(([category, count]) => (
              <Badge 
                key={category} 
                variant="outline" 
                className="text-[9px] h-5 gap-1"
              >
                <span>{category}</span>
                <span className="opacity-60">×{count}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Session Summary */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Target className="h-3 w-3" />
          <span>{goalsCompleted} goals completed</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" />
          <span>
            {((symbols.length + relationships.length) / Math.max(goalsCompleted, 1)).toFixed(1)} discoveries/goal
          </span>
        </div>
      </div>
    </div>
  );
};
