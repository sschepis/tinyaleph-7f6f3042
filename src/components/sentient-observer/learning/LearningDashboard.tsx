/**
 * Learning Dashboard
 * 
 * Unified learning visualization that combines status, current goal,
 * discovery timeline, knowledge graph, and growth stats.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  GraduationCap,
  Play,
  Pause,
  Send,
  ScrollText,
  Network,
  BarChart3
} from 'lucide-react';
import type { LearningEngineState } from '@/lib/sentient-observer/learning-engine';
import { LearningStatusBar } from './LearningStatusBar';
import { CurrentGoalCard } from './CurrentGoalCard';
import { DiscoveryTimeline } from './DiscoveryTimeline';
import { KnowledgeGrowthStats } from './KnowledgeGrowthStats';
import { LearnedRelationshipsGraph } from '../LearnedRelationshipsGraph';

interface LearningDashboardProps {
  state: LearningEngineState;
  onStartLearning: () => void;
  onStopLearning: () => void;
  onRequestLearn: (description: string, targetPrime?: number) => void;
}

export const LearningDashboard: React.FC<LearningDashboardProps> = ({
  state,
  onStartLearning,
  onStopLearning,
  onRequestLearn
}) => {
  const [manualInput, setManualInput] = useState('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'graph' | 'stats'>('timeline');
  const [sessionStartTime] = useState(() => Date.now());

  const handleManualRequest = useCallback(() => {
    if (!manualInput.trim()) return;
    onRequestLearn(manualInput.trim());
    setManualInput('');
  }, [manualInput, onRequestLearn]);

  const isActive = state.currentSession?.isActive || false;
  const pendingGoals = state.learningQueue.filter(g => g.status === 'pending');
  const activeGoal = state.learningQueue.find(g => g.status === 'in_progress') || null;
  const nextGoal = pendingGoals[0];

  // Convert Map to array for components
  const symbolsArray = useMemo(() => 
    Array.from(state.learnedSymbols.values()),
    [state.learnedSymbols]
  );

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="py-2 px-3 flex-shrink-0 space-y-0">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-xs flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            Learning Dashboard
          </CardTitle>
          <Button
            variant={isActive ? "destructive" : "default"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={isActive ? onStopLearning : onStartLearning}
          >
            {isActive ? (
              <><Pause className="h-2.5 w-2.5 mr-1" />Stop</>
            ) : (
              <><Play className="h-2.5 w-2.5 mr-1" />Learn</>
            )}
          </Button>
        </div>
        
        {/* Status Bar */}
        <LearningStatusBar 
          state={state} 
          isActive={isActive}
          sessionStartTime={sessionStartTime}
        />
      </CardHeader>

      <CardContent className="flex-1 p-2 pt-0 space-y-2 overflow-hidden flex flex-col min-h-0">
        {/* Current Goal Card */}
        <CurrentGoalCard
          activeGoal={activeGoal}
          pendingCount={pendingGoals.length}
          nextGoal={nextGoal}
        />

        {/* Manual Learning Request */}
        <div className="flex gap-1.5 flex-shrink-0">
          <Input
            value={manualInput}
            onChange={e => setManualInput(e.target.value)}
            placeholder="Ask to learn something..."
            onKeyDown={e => e.key === 'Enter' && handleManualRequest()}
            className="h-7 text-xs"
          />
          <Button 
            onClick={handleManualRequest} 
            size="sm" 
            className="h-7 w-7 p-0" 
            disabled={!manualInput.trim()}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>

        {/* Tabbed Content Area */}
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as typeof activeTab)}
          className="flex-1 flex flex-col min-h-0"
        >
          <TabsList className="grid grid-cols-3 w-full h-7 flex-shrink-0">
            <TabsTrigger value="timeline" className="text-[10px] h-6 gap-1">
              <ScrollText className="h-3 w-3" />
              Discoveries
            </TabsTrigger>
            <TabsTrigger value="graph" className="text-[10px] h-6 gap-1">
              <Network className="h-3 w-3" />
              Graph
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-[10px] h-6 gap-1">
              <BarChart3 className="h-3 w-3" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-2 flex-1 min-h-0 overflow-hidden">
            <DiscoveryTimeline
              symbols={symbolsArray}
              relationships={state.learnedRelationships}
            />
          </TabsContent>

          <TabsContent value="graph" className="mt-2 flex-1 min-h-0">
            <LearnedRelationshipsGraph
              symbols={symbolsArray}
              relationships={state.learnedRelationships}
              width={380}
              height={280}
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-2 flex-1 min-h-0 overflow-auto">
            <KnowledgeGrowthStats
              symbols={symbolsArray}
              relationships={state.learnedRelationships}
              goalsCompleted={state.totalGoalsCompleted}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
