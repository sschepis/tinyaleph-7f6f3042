/**
 * Learning Debug Overlay
 * 
 * Shows real-time deduplication statistics, learning efficiency metrics,
 * and goal processing history in a collapsible overlay.
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Bug,
  ChevronDown,
  ChevronUp,
  SkipForward,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
  Clock,
  Target,
  Filter,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { LearningGoal, LearningEngineState } from '@/lib/sentient-observer/learning-engine';

interface DeduplicationStats {
  totalGoalsCreated: number;
  goalsSkippedDuplicate: number;
  goalsProcessed: number;
  goalsFailed: number;
  uniquePrimesTargeted: Set<number>;
  efficiencyOverTime: { timestamp: number; efficiency: number }[];
}

interface LearningDebugOverlayProps {
  state: LearningEngineState;
  deduplicationStats: DeduplicationStats;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export const LearningDebugOverlay: React.FC<LearningDebugOverlayProps> = ({
  state,
  deduplicationStats,
  isVisible,
  onToggleVisibility
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['stats', 'queue']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Calculate efficiency metrics
  const efficiency = useMemo(() => {
    const { goalsProcessed, goalsSkippedDuplicate, goalsFailed, totalGoalsCreated } = deduplicationStats;
    const total = goalsProcessed + goalsSkippedDuplicate + goalsFailed;
    
    return {
      successRate: total > 0 ? (goalsProcessed / total) * 100 : 0,
      skipRate: total > 0 ? (goalsSkippedDuplicate / total) * 100 : 0,
      failRate: total > 0 ? (goalsFailed / total) * 100 : 0,
      deduplicationEfficiency: totalGoalsCreated > 0 
        ? ((totalGoalsCreated - goalsSkippedDuplicate) / totalGoalsCreated) * 100 
        : 100
    };
  }, [deduplicationStats]);

  // Group goals by status
  const goalsByStatus = useMemo(() => {
    const pending = state.learningQueue.filter(g => g.status === 'pending');
    const inProgress = state.learningQueue.filter(g => g.status === 'in_progress');
    const completed = state.learningQueue.filter(g => g.status === 'completed');
    const failed = state.learningQueue.filter(g => g.status === 'failed');
    
    return { pending, inProgress, completed, failed };
  }, [state.learningQueue]);

  // Recent efficiency trend
  const recentTrend = useMemo(() => {
    const history = deduplicationStats.efficiencyOverTime;
    if (history.length < 2) return null;
    
    const recent = history.slice(-10);
    const first = recent[0]?.efficiency || 0;
    const last = recent[recent.length - 1]?.efficiency || 0;
    
    return {
      trend: last - first,
      isImproving: last > first
    };
  }, [deduplicationStats.efficiencyOverTime]);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 h-8 gap-1.5 bg-background/95 backdrop-blur"
        onClick={onToggleVisibility}
      >
        <Bug className="h-3.5 w-3.5" />
        <span className="text-xs">Debug</span>
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="fixed bottom-4 right-4 z-50 w-80"
    >
      <Card className="bg-background/95 backdrop-blur border-primary/30 shadow-xl">
        <CardHeader className="py-2 px-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs flex items-center gap-1.5">
              <Bug className="h-3.5 w-3.5 text-primary" />
              Learning Debug
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={onToggleVisibility}
            >
              <XCircle className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-2 space-y-2">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCard
              icon={CheckCircle2}
              label="Processed"
              value={deduplicationStats.goalsProcessed}
              color="text-green-500"
            />
            <StatCard
              icon={SkipForward}
              label="Skipped (Dup)"
              value={deduplicationStats.goalsSkippedDuplicate}
              color="text-amber-500"
            />
            <StatCard
              icon={XCircle}
              label="Failed"
              value={deduplicationStats.goalsFailed}
              color="text-red-500"
            />
            <StatCard
              icon={Target}
              label="Unique Primes"
              value={deduplicationStats.uniquePrimesTargeted.size}
              color="text-blue-500"
            />
          </div>

          {/* Efficiency Section */}
          <Collapsible 
            open={expandedSections.has('stats')}
            onOpenChange={() => toggleSection('stats')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1.5 rounded hover:bg-muted/50">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium">Efficiency Metrics</span>
              </div>
              {expandedSections.has('stats') ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1.5 space-y-1.5">
              <EfficiencyBar 
                label="Success Rate" 
                value={efficiency.successRate} 
                color="bg-green-500" 
              />
              <EfficiencyBar 
                label="Skip Rate" 
                value={efficiency.skipRate} 
                color="bg-amber-500" 
              />
              <EfficiencyBar 
                label="Dedup Efficiency" 
                value={efficiency.deduplicationEfficiency} 
                color="bg-blue-500" 
              />
              
              {recentTrend && (
                <div className="flex items-center gap-1.5 pt-1">
                  <Activity className="h-3 w-3 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Trend:</span>
                  <Badge 
                    variant="outline" 
                    className={`text-[9px] h-4 ${
                      recentTrend.isImproving ? 'text-green-500 border-green-500/30' : 'text-red-500 border-red-500/30'
                    }`}
                  >
                    {recentTrend.isImproving ? '↑' : '↓'} {Math.abs(recentTrend.trend).toFixed(1)}%
                  </Badge>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Queue Status Section */}
          <Collapsible 
            open={expandedSections.has('queue')}
            onOpenChange={() => toggleSection('queue')}
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-1.5 rounded hover:bg-muted/50">
              <div className="flex items-center gap-1.5">
                <Filter className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-medium">Queue Status</span>
                <Badge variant="secondary" className="text-[9px] h-4 ml-1">
                  {state.learningQueue.length}
                </Badge>
              </div>
              {expandedSections.has('queue') ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1.5">
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  <QueueSection 
                    label="In Progress" 
                    goals={goalsByStatus.inProgress} 
                    color="text-blue-500"
                    icon={Activity}
                  />
                  <QueueSection 
                    label="Pending" 
                    goals={goalsByStatus.pending.slice(0, 5)} 
                    color="text-muted-foreground"
                    icon={Clock}
                    moreCount={Math.max(0, goalsByStatus.pending.length - 5)}
                  />
                  <QueueSection 
                    label="Recent Completed" 
                    goals={goalsByStatus.completed.slice(-3)} 
                    color="text-green-500"
                    icon={CheckCircle2}
                  />
                  {goalsByStatus.failed.length > 0 && (
                    <QueueSection 
                      label="Failed" 
                      goals={goalsByStatus.failed.slice(-3)} 
                      color="text-red-500"
                      icon={XCircle}
                    />
                  )}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>

          {/* Last Action */}
          {state.lastLearningAction && (
            <div className="p-2 bg-muted/30 rounded text-[10px]">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                <Sparkles className="h-3 w-3" />
                <span>Last Action:</span>
              </div>
              <p className="text-foreground truncate">{state.lastLearningAction}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Helper Components

interface StatCardProps {
  icon: React.FC<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
  <div className="p-2 bg-muted/30 rounded">
    <div className="flex items-center gap-1 mb-0.5">
      <Icon className={`h-3 w-3 ${color}`} />
      <span className="text-[9px] text-muted-foreground">{label}</span>
    </div>
    <span className="text-lg font-bold">{value}</span>
  </div>
);

interface EfficiencyBarProps {
  label: string;
  value: number;
  color: string;
}

const EfficiencyBar: React.FC<EfficiencyBarProps> = ({ label, value, color }) => (
  <div className="space-y-0.5">
    <div className="flex items-center justify-between text-[10px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono">{value.toFixed(1)}%</span>
    </div>
    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
      <div 
        className={`h-full transition-all duration-300 ${color}`} 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
      />
    </div>
  </div>
);

interface QueueSectionProps {
  label: string;
  goals: LearningGoal[];
  color: string;
  icon: React.FC<{ className?: string }>;
  moreCount?: number;
}

const QueueSection: React.FC<QueueSectionProps> = ({ label, goals, color, icon: Icon, moreCount }) => {
  if (goals.length === 0 && !moreCount) return null;
  
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1">
        <Icon className={`h-2.5 w-2.5 ${color}`} />
        <span className="text-[9px] font-medium text-muted-foreground">{label}</span>
      </div>
      {goals.map(goal => (
        <div key={goal.id} className="pl-3.5 text-[10px] truncate flex items-center gap-1">
          <span className="text-muted-foreground">•</span>
          <span className="truncate">{goal.description}</span>
          {goal.targetPrime && (
            <Badge variant="outline" className="text-[8px] h-3 px-1 ml-auto shrink-0">
              p{goal.targetPrime}
            </Badge>
          )}
        </div>
      ))}
      {moreCount && moreCount > 0 && (
        <div className="pl-3.5 text-[9px] text-muted-foreground">
          +{moreCount} more...
        </div>
      )}
    </div>
  );
};
