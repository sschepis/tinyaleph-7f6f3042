import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Atom,
  Sparkles,
  Waves,
  TrendingDown,
  Zap,
  AlertCircle
} from 'lucide-react';
import type { 
  Superposition, 
  CollapseHistory,
  MeaningState 
} from '@/lib/sentient-observer/semantic-collapse';

interface CollapseVisualizationProps {
  superposition: Superposition | null;
  collapseHistory: CollapseHistory;
  collapseProbability: number;
  onTriggerCollapse: () => void;
  isCollapsing: boolean;
}

function MeaningStateBar({ state, isCollapsed }: { state: MeaningState; isCollapsed: boolean }) {
  const barWidth = Math.max(5, state.probability * 100);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-2 ${isCollapsed ? 'opacity-50' : ''}`}
    >
      <div className="w-32 truncate text-[10px]" title={state.interpretation}>
        {state.interpretation.slice(0, 25)}...
      </div>
      <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary/60 to-primary"
          initial={{ width: 0 }}
          animate={{ width: `${barWidth}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="w-10 text-right text-[10px] font-mono">
        {(state.probability * 100).toFixed(1)}%
      </div>
    </motion.div>
  );
}

function EntropyGauge({ entropy, maxEntropy }: { entropy: number; maxEntropy: number }) {
  const normalizedEntropy = entropy / maxEntropy;
  const gaugeRotation = -90 + normalizedEntropy * 180;
  
  return (
    <div className="flex flex-col items-center">
      <svg width={100} height={60} viewBox="0 0 100 60">
        {/* Background arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={8}
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="url(#entropyGradient)"
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${normalizedEntropy * 126} 126`}
        />
        {/* Needle */}
        <motion.line
          x1={50}
          y1={50}
          x2={50}
          y2={15}
          stroke="hsl(var(--foreground))"
          strokeWidth={2}
          strokeLinecap="round"
          animate={{ rotate: gaugeRotation }}
          style={{ transformOrigin: '50px 50px' }}
        />
        <circle cx={50} cy={50} r={4} fill="hsl(var(--foreground))" />
        <defs>
          <linearGradient id="entropyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="50%" stopColor="hsl(45 100% 60%)" />
            <stop offset="100%" stopColor="hsl(0 100% 60%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-xs text-muted-foreground mt-1">
        Entropy: <span className="font-mono">{entropy.toFixed(2)}</span>
      </div>
    </div>
  );
}

export function CollapseVisualization({
  superposition,
  collapseHistory,
  collapseProbability,
  onTriggerCollapse,
  isCollapsing
}: CollapseVisualizationProps) {
  const sortedStates = useMemo(() => {
    if (!superposition) return [];
    return [...superposition.states].sort((a, b) => b.probability - a.probability);
  }, [superposition]);
  
  const collapsedState = useMemo(() => {
    if (!superposition?.collapsed || !superposition.collapsedTo) return null;
    return superposition.states.find(s => s.id === superposition.collapsedTo);
  }, [superposition]);
  
  const recentCollapses = useMemo(() => 
    collapseHistory.events.slice(-3).reverse(),
    [collapseHistory.events]
  );
  
  const maxEntropy = Math.log2(8); // 8 possible states
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Atom className="h-4 w-4 text-primary" />
          Semantic Superposition
        </CardTitle>
        <CardDescription className="text-xs">
          Meaning states and collapse dynamics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Status Row */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={superposition?.collapsed ? 'secondary' : 'default'}
            className="text-[10px]"
          >
            {superposition?.collapsed ? 'Collapsed' : superposition ? 'Superposition' : 'No Input'}
          </Badge>
          
          {superposition && !superposition.collapsed && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onTriggerCollapse}
              disabled={isCollapsing}
              className="px-2.5 py-1 text-[10px] font-medium rounded-full bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {isCollapsing ? (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  Collapsing...
                </motion.span>
              ) : (
                <>
                  <Zap className="h-3 w-3 inline mr-1" />
                  Collapse ({(collapseProbability * 100).toFixed(0)}%)
                </>
              )}
            </motion.button>
          )}
        </div>
        
        {/* Entropy Gauge */}
        {superposition && (
          <div className="flex justify-center">
            <EntropyGauge entropy={superposition.entropy} maxEntropy={maxEntropy} />
          </div>
        )}
        
        {/* Collapsed State Display */}
        {collapsedState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-center"
          >
            <Sparkles className="h-5 w-5 mx-auto text-primary mb-1" />
            <div className="text-sm font-medium">{collapsedState.interpretation}</div>
            <div className="text-[10px] text-muted-foreground mt-1">
              Probability was {(collapsedState.probability * 100).toFixed(1)}%
            </div>
          </motion.div>
        )}
        
        {/* Superposition States */}
        {superposition && !superposition.collapsed && sortedStates.length > 0 && (
          <div className="space-y-1.5">
            <div className="text-xs font-medium flex items-center gap-1">
              <Waves className="h-3 w-3" />
              Possible Interpretations
            </div>
            <ScrollArea className="h-32">
              <div className="space-y-1 pr-2">
                {sortedStates.slice(0, 6).map(state => (
                  <MeaningStateBar 
                    key={state.id} 
                    state={state}
                    isCollapsed={false}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* No Superposition */}
        {!superposition && (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Send input to create superposition</p>
          </div>
        )}
        
        {/* Collapse History */}
        {recentCollapses.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t">
            <div className="text-xs font-medium flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Recent Collapses
            </div>
            <div className="space-y-1">
              {recentCollapses.map(event => (
                <div 
                  key={event.id}
                  className="flex items-center justify-between p-1.5 bg-muted/30 rounded text-[10px]"
                >
                  <span className="truncate">{event.collapsedState.interpretation.slice(0, 30)}...</span>
                  <span className="font-mono text-muted-foreground">
                    @{(event.coherenceAtCollapse * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CollapseVisualization;
