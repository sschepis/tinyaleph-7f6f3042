/**
 * Learning Status Bar
 * 
 * Compact horizontal bar showing the agent's learning state at a glance.
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Brain, 
  Link2, 
  TrendingUp, 
  Clock,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LearningEngineState } from '@/lib/sentient-observer/learning-engine';

interface LearningStatusBarProps {
  state: LearningEngineState;
  isActive: boolean;
  sessionStartTime?: number;
}

export const LearningStatusBar: React.FC<LearningStatusBarProps> = ({
  state,
  isActive,
  sessionStartTime
}) => {
  const symbolCount = state.learnedSymbols.size;
  const relationCount = state.learnedRelationships.length;
  const completedCount = state.totalGoalsCompleted;
  
  // Calculate session duration
  const sessionDuration = sessionStartTime 
    ? Math.floor((Date.now() - sessionStartTime) / 60000)
    : 0;
  
  // Calculate session progress (goals completed vs target)
  const targetGoals = 20;
  const progressPercent = Math.min((completedCount / targetGoals) * 100, 100);
  
  // Calculate learning streak (consecutive completions without failures)
  const recentGoals = state.learningQueue.slice(-10);
  let streak = 0;
  for (let i = recentGoals.length - 1; i >= 0; i--) {
    if (recentGoals[i].status === 'completed') streak++;
    else if (recentGoals[i].status === 'failed') break;
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50">
      {/* Learning Mode Indicator */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isActive ? 'active' : 'paused'}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex-shrink-0"
        >
          {isActive ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
              <Zap className="h-3 w-3" />
              <span className="text-[10px] font-medium">LEARNING</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <Pause className="h-3 w-3" />
              <span className="text-[10px] font-medium">PAUSED</span>
            </Badge>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Divider */}
      <div className="h-6 w-px bg-border/50" />

      {/* Stats */}
      <div className="flex items-center gap-3 flex-1">
        {/* Concepts */}
        <div className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5 text-amber-500" />
          <span className="text-sm font-mono font-medium">{symbolCount}</span>
          <span className="text-[9px] text-muted-foreground">concepts</span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1.5">
          <Link2 className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-sm font-mono font-medium">{relationCount}</span>
          <span className="text-[9px] text-muted-foreground">links</span>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span className="text-sm font-mono font-medium">{streak}</span>
            <span className="text-[9px] text-muted-foreground">streak</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Progress value={progressPercent} className="h-1.5 w-16" />
        <span className="text-[9px] text-muted-foreground font-mono">
          {Math.round(progressPercent)}%
        </span>
      </div>

      {/* Session Duration */}
      {isActive && sessionDuration > 0 && (
        <>
          <div className="h-6 w-px bg-border/50" />
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-mono">{sessionDuration}m</span>
          </div>
        </>
      )}
    </div>
  );
};
