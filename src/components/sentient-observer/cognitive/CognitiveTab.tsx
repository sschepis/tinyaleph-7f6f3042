/**
 * Cognitive Tab - Unified view of all cognitive systems
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Database,
  Target,
  Sparkles,
  GitBranch,
  Play,
  Zap,
  AlertCircle,
  Bot,
  RotateCcw
} from 'lucide-react';
import { MemoryBrowserPanel } from './MemoryBrowserPanel';
import { ReasoningPanel } from './ReasoningPanel';
import { InferenceGraph } from './InferenceGraph';

import type { HolographicMemory, MemoryFragment } from '@/lib/sentient-observer/holographic-memory';
import type { SemanticAgent } from '@/lib/sentient-observer/semantic-agent';
import type { Superposition, CollapseEvent } from '@/lib/sentient-observer/semantic-collapse';
import type { ReasoningEngine } from '@/lib/sentient-observer/reasoning-engine';

interface CognitiveTabProps {
  // State
  memory: HolographicMemory;
  agent: SemanticAgent;
  currentSuperposition: Superposition | null;
  reasoning: ReasoningEngine;
  coherence: number;
  isSimulationRunning: boolean;
  
  // Autonomous agent
  isAgentAutonomous: boolean;
  onSetAgentAutonomous: (enabled: boolean) => void;
  lastAgentAction: string | null;
  
  // Memory actions
  onSearchMemory: (query: string) => { fragment: MemoryFragment; similarity: number; location: { x: number; y: number } }[];
  onReinjectMemory: (content: string) => void;
  
  // Agent actions
  onRunAgentStep: () => import('@/lib/sentient-observer/semantic-agent').ActionSelection | null;
  
  // Collapse actions
  onCreateSuperposition: (input: string) => void;
  onTriggerCollapse: (coherence: number) => CollapseEvent | null;
  
  // Stats
  getMemoryStats: () => { totalMemories: number; peakCount: number; fieldEnergy: number; oldestMemory: number | null; newestMemory: number | null };
  getReasoningStats: () => { totalFacts: number; inputFacts: number; inferredFacts: number; observationFacts: number; ruleCount: number; inferenceSteps: number; averageConfidence: number };
  getCollapseStats: () => { totalCollapses: number; averageCoherence: number; mostCommonInterpretation: string | null; reanalysisRate: number };
  
  // Reset
  onReset: () => void;
}

export const CognitiveTab: React.FC<CognitiveTabProps> = ({
  memory,
  agent,
  currentSuperposition,
  reasoning,
  coherence,
  isSimulationRunning,
  isAgentAutonomous,
  onSetAgentAutonomous,
  lastAgentAction,
  onSearchMemory,
  onReinjectMemory,
  onRunAgentStep,
  onCreateSuperposition,
  onTriggerCollapse,
  getMemoryStats,
  getReasoningStats,
  getCollapseStats,
  onReset
}) => {
  const [collapseInput, setCollapseInput] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [isDaydreaming, setIsDaydreaming] = useState(false);
  
  const memStats = getMemoryStats();
  const reasoningStats = getReasoningStats();
  const collapseStats = getCollapseStats();
  
  const handleReinjectMemory = useCallback((content: string) => {
    onReinjectMemory(content);
    setLastAction(`Re-injected: "${content.slice(0, 30)}..."`);
  }, [onReinjectMemory]);
  
  const handleCreateSuperposition = useCallback(() => {
    if (!collapseInput.trim()) return;
    onCreateSuperposition(collapseInput);
    setCollapseInput('');
  }, [collapseInput, onCreateSuperposition]);
  
  const handleCollapse = useCallback(() => {
    const event = onTriggerCollapse(coherence);
    if (event) {
      setLastAction(`Collapsed to: ${event.collapsedState.interpretation}`);
    }
  }, [coherence, onTriggerCollapse]);
  
  
  const handleAgentStep = useCallback(() => {
    const selection = onRunAgentStep();
    if (selection) {
      setLastAction(`Agent: ${selection.action.name} (${(selection.confidence * 100).toFixed(0)}% confidence)`);
    } else {
      setLastAction('No valid action available');
    }
  }, [onRunAgentStep]);

  return (
    <div className="space-y-3">
      {/* Compact Overview Stats */}
      <div className="grid grid-cols-4 gap-2 text-center p-2 rounded-lg bg-muted/30">
        <div>
          <div className="text-lg font-mono text-blue-500">{memStats.totalMemories}</div>
          <div className="text-[9px] text-muted-foreground">Mem</div>
        </div>
        <div>
          <div className="text-lg font-mono text-purple-500">{reasoningStats.totalFacts}</div>
          <div className="text-[9px] text-muted-foreground">Facts</div>
        </div>
        <div>
          <div className="text-lg font-mono text-amber-500">{collapseStats.totalCollapses}</div>
          <div className="text-[9px] text-muted-foreground">Coll</div>
        </div>
        <div>
          <div className="text-lg font-mono text-green-500">{agent.actionHistory.length}</div>
          <div className="text-[9px] text-muted-foreground">Acts</div>
        </div>
      </div>

      {/* Cognitive Sub-tabs */}
      <Tabs defaultValue="reasoning" className="space-y-3">
        <TabsList className="grid grid-cols-4 w-full h-8">
          <TabsTrigger value="memory" className="text-[10px] h-7">
            <Database className="h-3 w-3 mr-1" />
            Mem
          </TabsTrigger>
          <TabsTrigger value="agency" className="text-[10px] h-7">
            <Target className="h-3 w-3 mr-1" />
            Agent
          </TabsTrigger>
          <TabsTrigger value="collapse" className="text-[10px] h-7">
            <Sparkles className="h-3 w-3 mr-1" />
            Collapse
          </TabsTrigger>
          <TabsTrigger value="reasoning" className="text-[10px] h-7">
            <GitBranch className="h-3 w-3 mr-1" />
            Logic
          </TabsTrigger>
        </TabsList>

        {/* Memory Tab */}
        <TabsContent value="memory" className="space-y-3 mt-0">
          <MemoryBrowserPanel
            memory={memory}
            onReinjectMemory={handleReinjectMemory}
            selectedMemoryId={selectedMemoryId || undefined}
            onSelectMemory={setSelectedMemoryId}
            onSearchMemory={onSearchMemory}
            isDaydreamingEnabled={isDaydreaming}
            onToggleDaydreaming={() => setIsDaydreaming(prev => !prev)}
            isSimulationRunning={isSimulationRunning}
          />
        </TabsContent>

        {/* Agency Tab - Simplified */}
        <TabsContent value="agency" className="space-y-3 mt-0">
          {/* Autonomous toggle - compact */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border">
            <div className="flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium">Auto</span>
            </div>
            <Switch
              checked={isAgentAutonomous}
              onCheckedChange={onSetAgentAutonomous}
              disabled={!isSimulationRunning}
              className="scale-75"
            />
          </div>
          
          {/* Last action indicator */}
          {lastAgentAction && (
            <div className="p-1.5 bg-primary/10 rounded text-[10px] flex items-center gap-1.5">
              <Zap className="h-2.5 w-2.5 text-primary animate-pulse" />
              <span className="truncate text-primary">{lastAgentAction}</span>
            </div>
          )}
          
          {/* Manual step button */}
          <Button onClick={handleAgentStep} size="sm" className="w-full h-7 text-xs" disabled={isAgentAutonomous}>
            <Play className="h-3 w-3 mr-1" />
            Step
          </Button>
          
          {/* Active Goals - Compact */}
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground font-medium">Goals</div>
            <ScrollArea className="h-[120px]">
              <div className="space-y-1">
                {agent.goals.filter(g => g.status === 'active').map(goal => (
                  <div key={goal.id} className="p-1.5 border rounded bg-muted/20">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] truncate flex-1">{goal.description}</span>
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {(goal.priority * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={goal.progress * 100} className="h-0.5 mt-1" />
                  </div>
                ))}
                {agent.goals.filter(g => g.status === 'active').length === 0 && (
                  <div className="text-center text-muted-foreground text-[10px] py-3">
                    No active goals
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Recent Actions - Compact */}
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground font-medium">Actions</div>
            <ScrollArea className="h-[80px]">
              <div className="space-y-0.5">
                {agent.actionHistory.slice(-4).reverse().map(record => (
                  <div key={record.id} className="p-1 bg-muted/20 rounded text-[10px] flex justify-between">
                    <span className="truncate">{record.actionName}</span>
                    <span className="font-mono text-muted-foreground ml-1">{(record.confidence * 100).toFixed(0)}%</span>
                  </div>
                ))}
                {agent.actionHistory.length === 0 && (
                  <div className="text-center text-muted-foreground text-[10px] py-2">—</div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Collapse Tab - Simplified */}
        <TabsContent value="collapse" className="space-y-3 mt-0">
          {/* Create Superposition - Compact */}
          <div className="flex gap-1.5">
            <Input
              value={collapseInput}
              onChange={e => setCollapseInput(e.target.value)}
              placeholder="Input for superposition..."
              onKeyDown={e => e.key === 'Enter' && handleCreateSuperposition()}
              className="h-7 text-xs"
            />
            <Button onClick={handleCreateSuperposition} size="sm" className="h-7 w-7 p-0">
              <Zap className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Current Superposition - Compact */}
          {currentSuperposition && (
            <div className="p-2 border rounded bg-muted/20 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] truncate flex-1 text-muted-foreground">
                  {currentSuperposition.input.slice(0, 30)}...
                </span>
                <Badge variant={currentSuperposition.collapsed ? 'secondary' : 'default'} className="text-[9px] h-4">
                  {currentSuperposition.collapsed ? 'Collapsed' : 'Active'}
                </Badge>
              </div>
              
              {/* Entropy bar */}
              <div className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground w-6">H</span>
                <Progress value={currentSuperposition.entropy * 20} className="flex-1 h-1" />
                <span className="text-[9px] font-mono w-6">{currentSuperposition.entropy.toFixed(1)}</span>
              </div>
              
              {/* States */}
              <ScrollArea className="h-[100px]">
                <div className="space-y-0.5">
                  {currentSuperposition.states.slice(0, 5).map(state => (
                    <div 
                      key={state.id} 
                      className={`p-1 rounded text-[10px] flex justify-between ${
                        currentSuperposition.collapsedTo === state.id 
                          ? 'bg-primary/20 border border-primary/30' 
                          : 'bg-muted/30'
                      }`}
                    >
                      <span className="truncate flex-1">{state.interpretation}</span>
                      <span className="font-mono ml-1">{(state.probability * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {!currentSuperposition.collapsed && (
                <Button onClick={handleCollapse} size="sm" className="w-full h-6 text-[10px]">
                  <Sparkles className="h-2.5 w-2.5 mr-1" />
                  Collapse
                </Button>
              )}
            </div>
          )}
          
          {!currentSuperposition && (
            <div className="text-center py-4 text-muted-foreground text-[10px]">
              Enter input above to create superposition
            </div>
          )}
          
          {/* Collapse Stats - Compact */}
          <div className="grid grid-cols-3 gap-1 text-center">
            <div className="p-1.5 bg-muted/20 rounded">
              <div className="text-sm font-mono">{collapseStats.totalCollapses}</div>
              <div className="text-[8px] text-muted-foreground">Total</div>
            </div>
            <div className="p-1.5 bg-muted/20 rounded">
              <div className="text-sm font-mono">{(collapseStats.averageCoherence * 100).toFixed(0)}%</div>
              <div className="text-[8px] text-muted-foreground">Avg C</div>
            </div>
            <div className="p-1.5 bg-muted/20 rounded">
              <div className="text-sm font-mono">{(collapseStats.reanalysisRate * 100).toFixed(0)}%</div>
              <div className="text-[8px] text-muted-foreground">Rean</div>
            </div>
          </div>
        </TabsContent>

        {/* Reasoning Tab */}
        <TabsContent value="reasoning" className="space-y-4">
          {/* Inference Graph */}
          <InferenceGraph reasoning={reasoning} />
          
          {/* Autonomous Reasoning Panel */}
          <ReasoningPanel
            engine={reasoning}
            isSimulationRunning={isSimulationRunning}
          />
        </TabsContent>
      </Tabs>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Cognitive Systems
        </Button>
      </div>
    </div>
  );
};
