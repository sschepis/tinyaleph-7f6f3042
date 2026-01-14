import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Target,
  Zap,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Brain,
  Pause
} from 'lucide-react';
import type { 
  SemanticAgent, 
  AgentGoal, 
  ActionRecord, 
  ActionSelection 
} from '@/lib/sentient-observer/semantic-agent';

interface AgencyPanelProps {
  agent: SemanticAgent;
  currentAction: ActionSelection | null;
  isActing: boolean;
  onToggleGoal: (goalId: string) => void;
}

function GoalCard({ goal, onToggle }: { goal: AgentGoal; onToggle: () => void }) {
  const statusIcon = {
    active: <Target className="h-3.5 w-3.5 text-primary" />,
    achieved: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
    paused: <Pause className="h-3.5 w-3.5 text-yellow-500" />,
    failed: <Activity className="h-3.5 w-3.5 text-red-500" />
  };
  
  const statusColors = {
    active: 'border-primary/30 bg-primary/5',
    achieved: 'border-green-500/30 bg-green-500/5',
    paused: 'border-yellow-500/30 bg-yellow-500/5',
    failed: 'border-red-500/30 bg-red-500/5'
  };
  
  return (
    <motion.div
      layout
      className={`p-2.5 rounded-lg border ${statusColors[goal.status]} cursor-pointer hover:opacity-80 transition-opacity`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5">
          {statusIcon[goal.status]}
          <span className="text-xs font-medium truncate">{goal.description}</span>
        </div>
        <Badge variant="outline" className="text-[10px] shrink-0">
          P{(goal.priority * 10).toFixed(0)}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={goal.progress * 100} className="h-1.5 flex-1" />
        <span className="text-[10px] text-muted-foreground">
          {(goal.progress * 100).toFixed(0)}%
        </span>
      </div>
    </motion.div>
  );
}

function ActionRecordCard({ record }: { record: ActionRecord }) {
  const confidenceColor = record.confidence > 0.7 
    ? 'text-green-500' 
    : record.confidence > 0.4 
      ? 'text-yellow-500' 
      : 'text-red-500';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-2 bg-muted/30 rounded border text-xs"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1">
          <Zap className="h-3 w-3 text-primary" />
          <span className="font-medium">{record.actionName}</span>
        </div>
        <span className={`font-mono ${confidenceColor}`}>
          {(record.confidence * 100).toFixed(0)}%
        </span>
      </div>
      <p className="text-muted-foreground text-[10px] leading-relaxed">
        {record.reasoning}
      </p>
      <div className="flex items-center gap-1 mt-1 text-muted-foreground text-[10px]">
        <Clock className="h-2.5 w-2.5" />
        {new Date(record.timestamp).toLocaleTimeString()}
      </div>
    </motion.div>
  );
}

export function AgencyPanel({
  agent,
  currentAction,
  isActing,
  onToggleGoal
}: AgencyPanelProps) {
  const activeGoals = useMemo(() => 
    agent.goals.filter(g => g.status === 'active'),
    [agent.goals]
  );
  
  const achievedGoals = useMemo(() => 
    agent.goals.filter(g => g.status === 'achieved'),
    [agent.goals]
  );
  
  const recentActions = useMemo(() => 
    agent.actionHistory.slice(-5).reverse(),
    [agent.actionHistory]
  );
  
  const averageConfidence = useMemo(() => {
    if (agent.actionHistory.length === 0) return 0;
    return agent.actionHistory.reduce((s, a) => s + a.confidence, 0) / agent.actionHistory.length;
  }, [agent.actionHistory]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          Semantic Agency
        </CardTitle>
        <CardDescription className="text-xs">
          Goal-directed autonomous behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-1.5 bg-muted/50 rounded">
            <div className="text-sm font-mono">{activeGoals.length}</div>
            <div className="text-[9px] text-muted-foreground">Active</div>
          </div>
          <div className="p-1.5 bg-muted/50 rounded">
            <div className="text-sm font-mono text-green-500">{achievedGoals.length}</div>
            <div className="text-[9px] text-muted-foreground">Done</div>
          </div>
          <div className="p-1.5 bg-muted/50 rounded">
            <div className="text-sm font-mono">{agent.actionHistory.length}</div>
            <div className="text-[9px] text-muted-foreground">Actions</div>
          </div>
          <div className="p-1.5 bg-muted/50 rounded">
            <div className="text-sm font-mono">{(averageConfidence * 100).toFixed(0)}%</div>
            <div className="text-[9px] text-muted-foreground">Avg Conf</div>
          </div>
        </div>
        
        {/* Current Action */}
        {currentAction && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-2.5 rounded-lg border border-primary/30 bg-primary/5"
          >
            <div className="flex items-center gap-2 mb-1">
              {isActing ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Zap className="h-4 w-4 text-primary" />
                </motion.div>
              ) : (
                <Zap className="h-4 w-4 text-primary" />
              )}
              <span className="text-xs font-medium">
                {isActing ? 'Executing:' : 'Next:'} {currentAction.action.name}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              {currentAction.reasoning}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <TrendingUp className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                Targeting: {currentAction.targetGoal.description.slice(0, 30)}...
              </span>
            </div>
          </motion.div>
        )}
        
        {/* Active Goals */}
        <div className="space-y-1.5">
          <div className="text-xs font-medium flex items-center gap-1">
            <Target className="h-3 w-3" />
            Active Goals
          </div>
          <ScrollArea className="h-28">
            <div className="space-y-1.5 pr-2">
              <AnimatePresence>
                {activeGoals.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onToggle={() => onToggleGoal(goal.id)}
                  />
                ))}
              </AnimatePresence>
              {activeGoals.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-4">
                  All goals achieved!
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Action History */}
        <div className="space-y-1.5">
          <div className="text-xs font-medium flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Recent Actions
          </div>
          <ScrollArea className="h-28">
            <div className="space-y-1.5 pr-2">
              {recentActions.map(record => (
                <ActionRecordCard key={record.id} record={record} />
              ))}
              {recentActions.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-4">
                  No actions taken yet
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}

export default AgencyPanel;
