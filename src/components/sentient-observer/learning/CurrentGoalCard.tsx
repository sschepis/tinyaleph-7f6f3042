/**
 * Current Goal Card
 * 
 * Prominent display of what the agent is currently working on.
 */

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Loader2, 
  Lightbulb, 
  Link2, 
  Sparkles,
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { LearningGoal } from '@/lib/sentient-observer/learning-engine';

interface CurrentGoalCardProps {
  activeGoal: LearningGoal | null;
  pendingCount: number;
  nextGoal?: LearningGoal;
}

const goalTypeConfig = {
  define_symbol: {
    icon: Lightbulb,
    label: 'Defining Symbol',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30'
  },
  find_relationship: {
    icon: Link2,
    label: 'Finding Relationship',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30'
  },
  expand_concept: {
    icon: Sparkles,
    label: 'Expanding Concept',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30'
  }
};

export const CurrentGoalCard: React.FC<CurrentGoalCardProps> = ({
  activeGoal,
  pendingCount,
  nextGoal
}) => {
  if (!activeGoal) {
    return (
      <Card className="p-4 border-dashed border-muted-foreground/30">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Target className="h-4 w-4" />
          <span className="text-sm">No active learning goal</span>
        </div>
        {pendingCount > 0 && (
          <div className="mt-2 text-center text-[10px] text-muted-foreground">
            {pendingCount} goals queued • Start learning to begin
          </div>
        )}
      </Card>
    );
  }

  const config = goalTypeConfig[activeGoal.type] || goalTypeConfig.define_symbol;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className={`p-4 ${config.bgColor} ${config.borderColor} border overflow-hidden`}>
        {/* Animated background shimmer */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Progress bar at top */}
        <motion.div
          className={`absolute top-0 left-0 h-0.5 ${config.color.replace('text-', 'bg-')}`}
          animate={{ width: ['0%', '100%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Loader2 className={`h-4 w-4 ${config.color} animate-spin`} />
                <motion.div
                  className={`absolute inset-0 rounded-full ${config.bgColor}`}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>
              <Badge variant="outline" className={`${config.color} ${config.borderColor} text-[10px]`}>
                <Icon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>
            </div>
            <motion.span 
              className="text-xs text-muted-foreground font-mono"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              Processing...
            </motion.span>
          </div>

          {/* Goal Description */}
          <div className="mb-3">
            <p className="text-sm font-medium leading-relaxed">
              {activeGoal.description}
            </p>
            {activeGoal.targetPrime && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground">Target:</span>
                <Badge variant="secondary" className="text-[10px] h-4 font-mono">
                  Prime {activeGoal.targetPrime}
                </Badge>
              </div>
            )}
          </div>

          {/* Queue Info */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/30 pt-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{pendingCount} goals in queue</span>
            </div>
            {nextGoal && (
              <div className="flex items-center gap-1">
                <span>Next:</span>
                <ChevronRight className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{nextGoal.description}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
