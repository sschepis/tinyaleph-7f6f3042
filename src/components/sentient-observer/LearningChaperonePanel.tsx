/**
 * Learning Chaperone Panel
 * 
 * UI for the autonomous learning system where the agent
 * queries an LLM to learn new symbols and relationships.
 */

import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  GraduationCap,
  Play,
  Pause,
  Lightbulb,
  Link2,
  Sparkles,
  Clock,
  Check,
  X,
  Loader2,
  Brain,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LearningEngineState, LearningGoal, LearnedSymbol, LearnedRelationship } from '@/lib/sentient-observer/learning-engine';

interface LearningChaperonePanelProps {
  state: LearningEngineState;
  onStartLearning: () => void;
  onStopLearning: () => void;
  onRequestLearn: (description: string, targetPrime?: number) => void;
}

const goalTypeIcon = (type: LearningGoal['type']) => {
  switch (type) {
    case 'define_symbol': return <Lightbulb className="h-3 w-3" />;
    case 'find_relationship': return <Link2 className="h-3 w-3" />;
    case 'expand_concept': return <Sparkles className="h-3 w-3" />;
    default: return <Brain className="h-3 w-3" />;
  }
};

const goalTypeColor = (type: LearningGoal['type']) => {
  switch (type) {
    case 'define_symbol': return 'text-amber-500';
    case 'find_relationship': return 'text-blue-500';
    case 'expand_concept': return 'text-purple-500';
    default: return 'text-muted-foreground';
  }
};

const statusBadge = (status: LearningGoal['status']) => {
  switch (status) {
    case 'pending': return <Badge variant="outline" className="text-[9px] h-4"><Clock className="h-2 w-2 mr-0.5" />Queue</Badge>;
    case 'in_progress': return <Badge variant="default" className="text-[9px] h-4 animate-pulse"><Loader2 className="h-2 w-2 mr-0.5 animate-spin" />Active</Badge>;
    case 'completed': return <Badge variant="secondary" className="text-[9px] h-4 bg-green-500/20 text-green-400"><Check className="h-2 w-2 mr-0.5" />Done</Badge>;
    case 'failed': return <Badge variant="destructive" className="text-[9px] h-4"><X className="h-2 w-2 mr-0.5" />Failed</Badge>;
    default: return null;
  }
};

const relationshipTypeLabel = (type: LearnedRelationship['relationshipType']) => {
  const labels: Record<LearnedRelationship['relationshipType'], string> = {
    similar: '≈',
    opposite: '⊕',
    contains: '⊃',
    part_of: '⊂',
    transforms_to: '→',
    resonates_with: '∿'
  };
  return labels[type] || '?';
};

export const LearningChaperonePanel: React.FC<LearningChaperonePanelProps> = ({
  state,
  onStartLearning,
  onStopLearning,
  onRequestLearn
}) => {
  const [manualInput, setManualInput] = useState('');
  const [showSymbols, setShowSymbols] = useState(true);

  const handleManualRequest = useCallback(() => {
    if (!manualInput.trim()) return;
    onRequestLearn(manualInput.trim());
    setManualInput('');
  }, [manualInput, onRequestLearn]);

  const isActive = state.currentSession?.isActive || false;
  const pendingGoals = state.learningQueue.filter(g => g.status === 'pending').length;
  const activeGoal = state.learningQueue.find(g => g.status === 'in_progress');
  const recentCompleted = state.learningQueue
    .filter(g => g.status === 'completed')
    .slice(-5)
    .reverse();

  const learnedSymbols = Array.from(state.learnedSymbols.values())
    .sort((a, b) => b.learnedAt - a.learnedAt)
    .slice(0, 10);

  const recentRelationships = state.learnedRelationships
    .slice(-8)
    .reverse();

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="py-2 px-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            Learning Chaperone
          </CardTitle>
          <div className="flex items-center gap-2">
            {isActive && (
              <Badge variant="default" className="text-[9px] h-4 bg-green-500/20 text-green-400 animate-pulse">
                <Loader2 className="h-2 w-2 mr-0.5 animate-spin" />
                Active
              </Badge>
            )}
            <Button
              variant={isActive ? "destructive" : "default"}
              size="sm"
              className="h-6 text-[10px] px-2"
              onClick={isActive ? onStopLearning : onStartLearning}
            >
              {isActive ? <><Pause className="h-2.5 w-2.5 mr-1" />Stop</> : <><Play className="h-2.5 w-2.5 mr-1" />Learn</>}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-2 pt-0 space-y-2 overflow-hidden">
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-1 text-center">
          <div className="p-1 bg-muted/30 rounded">
            <div className="text-sm font-mono text-amber-500">{state.learnedSymbols.size}</div>
            <div className="text-[8px] text-muted-foreground">Symbols</div>
          </div>
          <div className="p-1 bg-muted/30 rounded">
            <div className="text-sm font-mono text-blue-500">{state.learnedRelationships.length}</div>
            <div className="text-[8px] text-muted-foreground">Relations</div>
          </div>
          <div className="p-1 bg-muted/30 rounded">
            <div className="text-sm font-mono text-purple-500">{state.totalGoalsCompleted}</div>
            <div className="text-[8px] text-muted-foreground">Learned</div>
          </div>
          <div className="p-1 bg-muted/30 rounded">
            <div className="text-sm font-mono text-muted-foreground">{pendingGoals}</div>
            <div className="text-[8px] text-muted-foreground">Queue</div>
          </div>
        </div>

        {/* Last Action */}
        {state.lastLearningAction && (
          <div className="p-1.5 bg-primary/10 rounded text-[10px] flex items-center gap-1.5">
            <Brain className="h-2.5 w-2.5 text-primary flex-shrink-0" />
            <span className="truncate text-primary">{state.lastLearningAction}</span>
          </div>
        )}

        {/* Active Goal */}
        {activeGoal && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 border border-primary/30 rounded bg-primary/5"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Loader2 className="h-3 w-3 text-primary animate-spin" />
              <span className="text-[10px] font-medium">Currently Learning</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={goalTypeColor(activeGoal.type)}>{goalTypeIcon(activeGoal.type)}</span>
              <span className="text-[9px] text-muted-foreground truncate">{activeGoal.description}</span>
            </div>
          </motion.div>
        )}

        {/* Manual Learning Request */}
        <div className="flex gap-1.5">
          <Input
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            placeholder="Ask to learn something..."
            onKeyDown={e => e.key === 'Enter' && handleManualRequest()}
            className="h-7 text-xs"
          />
          <Button onClick={handleManualRequest} size="sm" className="h-7 w-7 p-0" disabled={!manualInput.trim()}>
            <Send className="h-3 w-3" />
          </Button>
        </div>

        {/* Toggle between symbols and relationships */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground">Show:</span>
          <div className="flex gap-2">
            <Button
              variant={showSymbols ? "default" : "ghost"}
              size="sm"
              className="h-5 text-[9px] px-2"
              onClick={() => setShowSymbols(true)}
            >
              <Lightbulb className="h-2.5 w-2.5 mr-1" />
              Symbols
            </Button>
            <Button
              variant={!showSymbols ? "default" : "ghost"}
              size="sm"
              className="h-5 text-[9px] px-2"
              onClick={() => setShowSymbols(false)}
            >
              <Link2 className="h-2.5 w-2.5 mr-1" />
              Relations
            </Button>
          </div>
        </div>

        {/* Learned Content */}
        <ScrollArea className="flex-1 h-[180px]">
          <AnimatePresence mode="wait">
            {showSymbols ? (
              <motion.div
                key="symbols"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-1"
              >
                {learnedSymbols.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-[10px]">
                    No symbols learned yet. Start learning to discover new meanings!
                  </div>
                ) : (
                  learnedSymbols.map(symbol => (
                    <motion.div
                      key={symbol.prime}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-1.5 bg-muted/30 rounded"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-amber-500">p{symbol.prime}</span>
                          <span className="text-[10px] font-medium">{symbol.meaning}</span>
                        </div>
                        <span className="text-[8px] text-muted-foreground font-mono">
                          {(symbol.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      {symbol.category && (
                        <Badge variant="outline" className="text-[8px] h-3 px-1">
                          {symbol.category}
                        </Badge>
                      )}
                      {symbol.reasoning && (
                        <div className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                          {symbol.reasoning}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div
                key="relationships"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-1"
              >
                {recentRelationships.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-[10px]">
                    No relationships discovered yet. Learning will find connections between symbols!
                  </div>
                ) : (
                  recentRelationships.map((rel, idx) => (
                    <motion.div
                      key={`${rel.primeA}-${rel.primeB}-${idx}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-1.5 bg-muted/30 rounded flex items-center gap-2"
                    >
                      <span className="font-mono text-[10px] text-blue-400">p{rel.primeA}</span>
                      <span className="text-primary text-sm font-bold">{relationshipTypeLabel(rel.relationshipType)}</span>
                      <span className="font-mono text-[10px] text-blue-400">p{rel.primeB}</span>
                      <div className="flex-1" />
                      <Progress value={rel.strength * 100} className="h-1 w-12" />
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollArea>

        {/* Recent Completed Goals */}
        {recentCompleted.length > 0 && (
          <div className="space-y-1">
            <div className="text-[9px] text-muted-foreground">Recent</div>
            <div className="space-y-0.5">
              {recentCompleted.slice(0, 3).map(goal => (
                <div key={goal.id} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                  <Check className="h-2 w-2 text-green-500" />
                  <span className={goalTypeColor(goal.type)}>{goalTypeIcon(goal.type)}</span>
                  <span className="truncate flex-1">{goal.description}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
