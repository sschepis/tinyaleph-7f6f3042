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
  Send,
  Play,
  RotateCcw,
  Search,
  Zap,
  AlertCircle,
  Bot
} from 'lucide-react';
import { HolographicMemoryPanel } from './HolographicMemoryPanel';
import { MemoryBrowserPanel } from './MemoryBrowserPanel';
import { AgencyPanel } from './AgencyPanel';
import { CollapseVisualization } from './CollapseVisualization';
import { ReasoningPanel } from './ReasoningPanel';
import { InferenceGraph } from './InferenceGraph';

import type { HolographicMemory, MemoryFragment } from '@/lib/sentient-observer/holographic-memory';
import type { SemanticAgent, ActionRecord, AgentGoal } from '@/lib/sentient-observer/semantic-agent';
import type { Superposition, CollapseHistory, CollapseEvent } from '@/lib/sentient-observer/semantic-collapse';
import type { ReasoningEngine, Fact, ReasoningStep } from '@/lib/sentient-observer/reasoning-engine';

interface CognitiveTabProps {
  // State
  memory: HolographicMemory;
  agent: SemanticAgent;
  currentSuperposition: Superposition | null;
  collapseHistory: CollapseHistory;
  reasoning: ReasoningEngine;
  coherence: number;
  isSimulationRunning: boolean;
  
  // Autonomous agent
  isAgentAutonomous: boolean;
  onSetAgentAutonomous: (enabled: boolean) => void;
  lastAgentAction: string | null;
  
  // Memory actions
  onStoreMemory: (content: string, coherence: number) => { fragmentId: string; location: { x: number; y: number } };
  onSearchMemory: (query: string) => { fragment: MemoryFragment; similarity: number; location: { x: number; y: number } }[];
  onProcessUserInput: (input: string, coherence: number) => { stored: boolean; recalled: { fragment: MemoryFragment; similarity: number }[] };
  onReinjectMemory: (content: string) => void;
  
  // Agent actions
  onRunAgentStep: () => import('@/lib/sentient-observer/semantic-agent').ActionSelection | null;
  getAgentGoals: () => AgentGoal[];
  getAgentActions: () => ActionRecord[];
  
  // Collapse actions
  onCreateSuperposition: (input: string) => void;
  onTriggerCollapse: (coherence: number) => CollapseEvent | null;
  
  // Reasoning actions
  onAddFact: (name: string, statement: string, confidence?: number) => void;
  onRunInference: () => { newFacts: Fact[]; steps: ReasoningStep[] };
  onQueryFacts: (question: string) => { fact: Fact; similarity: number }[];
  
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
  collapseHistory,
  reasoning,
  coherence,
  isSimulationRunning,
  isAgentAutonomous,
  onSetAgentAutonomous,
  lastAgentAction,
  onStoreMemory,
  onSearchMemory,
  onProcessUserInput,
  onReinjectMemory,
  onRunAgentStep,
  getAgentGoals,
  getAgentActions,
  onCreateSuperposition,
  onTriggerCollapse,
  onAddFact,
  onRunInference,
  onQueryFacts,
  getMemoryStats,
  getReasoningStats,
  getCollapseStats,
  onReset
}) => {
  const [memoryInput, setMemoryInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ fragment: MemoryFragment; similarity: number; location: { x: number; y: number } }[]>([]);
  const [collapseInput, setCollapseInput] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [recalledMemories, setRecalledMemories] = useState<{ fragment: MemoryFragment; similarity: number }[]>([]);
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  
  const memStats = getMemoryStats();
  const reasoningStats = getReasoningStats();
  const collapseStats = getCollapseStats();
  
  const handleStoreMemory = useCallback(() => {
    if (!memoryInput.trim()) return;
    const result = onStoreMemory(memoryInput, coherence);
    setMemoryInput('');
  }, [memoryInput, coherence, onStoreMemory]);
  
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    const results = onSearchMemory(searchQuery);
    setSearchResults(results);
  }, [searchQuery, onSearchMemory]);
  
  const handleReinjectMemory = useCallback((content: string) => {
    onReinjectMemory(content);
    setLastAction(`Re-injected: "${content.slice(0, 30)}..."`);
  }, [onReinjectMemory]);
  
  const handleSearchResultClick = useCallback((fragment: MemoryFragment) => {
    handleReinjectMemory(fragment.content);
  }, [handleReinjectMemory]);
  
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
    <div className="space-y-4">
      {/* Overview Stats */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-4">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-mono">{memStats.totalMemories}</span>
              </div>
              <div className="text-xs text-muted-foreground">Memories</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <GitBranch className="h-4 w-4 text-purple-500" />
                <span className="text-2xl font-mono">{reasoningStats.totalFacts}</span>
              </div>
              <div className="text-xs text-muted-foreground">Facts</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-2xl font-mono">{collapseStats.totalCollapses}</span>
              </div>
              <div className="text-xs text-muted-foreground">Collapses</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-mono">{agent.actionHistory.length}</span>
              </div>
              <div className="text-xs text-muted-foreground">Actions</div>
            </div>
          </div>
          
          {lastAction && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                <span>{lastAction}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cognitive Sub-tabs */}
      <Tabs defaultValue="memory" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="memory" className="text-xs sm:text-sm">
            <Database className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Memory
          </TabsTrigger>
          <TabsTrigger value="agency" className="text-xs sm:text-sm">
            <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Agency
          </TabsTrigger>
          <TabsTrigger value="collapse" className="text-xs sm:text-sm">
            <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Collapse
          </TabsTrigger>
          <TabsTrigger value="reasoning" className="text-xs sm:text-sm">
            <GitBranch className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            Reasoning
          </TabsTrigger>
        </TabsList>

        {/* Memory Tab */}
        <TabsContent value="memory" className="space-y-4">
          {/* Store/Search Controls */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4" />
                Store & Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Store Memory */}
              <div className="flex gap-2">
                <Input
                  value={memoryInput}
                  onChange={e => setMemoryInput(e.target.value)}
                  placeholder="Enter content to store..."
                  onKeyDown={e => e.key === 'Enter' && handleStoreMemory()}
                />
                <Button onClick={handleStoreMemory} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search Memory */}
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search for memories..."
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm" variant="outline">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search Results - clickable for re-injection */}
              {searchResults.length > 0 && (
                <div className="space-y-1 pt-2 border-t">
                  <label className="text-xs font-medium text-muted-foreground">Search Results (click to re-inject)</label>
                  <div className="space-y-1">
                    {searchResults.map((result, i) => (
                      <div 
                        key={i} 
                        className="p-2 bg-muted/50 rounded text-sm cursor-pointer hover:bg-primary/10 hover:border-primary/30 border border-transparent transition-all"
                        onClick={() => handleSearchResultClick(result.fragment)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium truncate flex-1 mr-2">
                            {result.fragment.content.slice(0, 40)}...
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {(result.similarity * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Memory Browser Panel */}
          <MemoryBrowserPanel
            memory={memory}
            onReinjectMemory={handleReinjectMemory}
            selectedMemoryId={selectedMemoryId || undefined}
            onSelectMemory={setSelectedMemoryId}
          />
        </TabsContent>

        {/* Agency Tab */}
        <TabsContent value="agency" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Goal-Directed Agency
              </CardTitle>
              <CardDescription>
                The observer autonomously pursues goals through semantic action selection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Autonomous Mode Toggle */}
              <div className="p-3 border rounded-lg bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Autonomous Mode</span>
                  </div>
                  <Switch
                    checked={isAgentAutonomous}
                    onCheckedChange={onSetAgentAutonomous}
                    disabled={!isSimulationRunning}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {!isSimulationRunning 
                    ? 'Start simulation to enable autonomous mode'
                    : isAgentAutonomous 
                      ? 'Agent runs automatically every 2 seconds'
                      : 'Agent waits for manual steps'
                  }
                </p>
                {isAgentAutonomous && lastAgentAction && (
                  <div className="mt-2 p-2 bg-primary/10 rounded text-xs flex items-center gap-2">
                    <Zap className="h-3 w-3 text-primary animate-pulse" />
                    <span className="text-primary">{lastAgentAction}</span>
                  </div>
                )}
              </div>
              
              {/* Action Controls */}
              <div className="flex gap-2">
                <Button onClick={handleAgentStep} className="flex-1" disabled={isAgentAutonomous}>
                  <Play className="h-4 w-4 mr-2" />
                  Run Agent Step
                </Button>
              </div>
              
              {/* Active Goals */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Active Goals</label>
                <ScrollArea className="h-[180px]">
                  <div className="space-y-2">
                    {agent.goals.filter(g => g.status === 'active').map(goal => (
                      <div key={goal.id} className="p-2 border rounded">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm">{goal.description}</span>
                          <Badge variant={goal.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                            {(goal.priority * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        <Progress value={goal.progress * 100} className="h-1" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Recent Actions */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Recent Actions</label>
                <ScrollArea className="h-[120px]">
                  <div className="space-y-1">
                    {agent.actionHistory.slice(-5).reverse().map(record => (
                      <div key={record.id} className="p-2 bg-muted/30 rounded text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">{record.actionName}</span>
                          <span className="text-muted-foreground">
                            {(record.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="text-muted-foreground truncate">{record.reasoning}</div>
                      </div>
                    ))}
                    {agent.actionHistory.length === 0 && (
                      <div className="text-center text-muted-foreground py-4">
                        No actions taken yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collapse Tab */}
        <TabsContent value="collapse" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Semantic State Collapse
              </CardTitle>
              <CardDescription>
                Quantum-like superposition and collapse of meaning states
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Create Superposition */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Create Meaning Superposition</label>
                <div className="flex gap-2">
                  <Input
                    value={collapseInput}
                    onChange={e => setCollapseInput(e.target.value)}
                    placeholder="Enter input to create superposition..."
                    onKeyDown={e => e.key === 'Enter' && handleCreateSuperposition()}
                  />
                  <Button onClick={handleCreateSuperposition} size="sm">
                    <Zap className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Current Superposition */}
              {currentSuperposition && (
                <div className="space-y-2 p-3 border rounded bg-muted/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current Superposition</span>
                    <Badge variant={currentSuperposition.collapsed ? 'secondary' : 'default'}>
                      {currentSuperposition.collapsed ? 'Collapsed' : 'Superposed'}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    Input: "{currentSuperposition.input.slice(0, 40)}..."
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs">Entropy:</span>
                    <Progress value={currentSuperposition.entropy * 20} className="flex-1 h-2" />
                    <span className="text-xs font-mono">{currentSuperposition.entropy.toFixed(2)}</span>
                  </div>
                  
                  {/* Meaning States */}
                  <ScrollArea className="h-[120px]">
                    <div className="space-y-1">
                      {currentSuperposition.states.slice(0, 5).map(state => (
                        <div 
                          key={state.id} 
                          className={`p-2 rounded text-xs ${
                            currentSuperposition.collapsedTo === state.id 
                              ? 'bg-primary/20 border border-primary/40' 
                              : 'bg-muted/30'
                          }`}
                        >
                          <div className="flex justify-between">
                            <span className="truncate flex-1 mr-2">{state.interpretation}</span>
                            <span className="font-mono">{(state.probability * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  {!currentSuperposition.collapsed && (
                    <Button onClick={handleCollapse} size="sm" className="w-full mt-2">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Trigger Collapse
                    </Button>
                  )}
                </div>
              )}
              
              {/* Collapse Stats */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="p-2 bg-muted/30 rounded text-center">
                  <div className="text-lg font-mono">{collapseStats.totalCollapses}</div>
                  <div className="text-xs text-muted-foreground">Collapses</div>
                </div>
                <div className="p-2 bg-muted/30 rounded text-center">
                  <div className="text-lg font-mono">{(collapseStats.averageCoherence * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Avg Coherence</div>
                </div>
                <div className="p-2 bg-muted/30 rounded text-center">
                  <div className="text-lg font-mono">{(collapseStats.reanalysisRate * 100).toFixed(0)}%</div>
                  <div className="text-xs text-muted-foreground">Reanalysis</div>
                </div>
              </div>
            </CardContent>
          </Card>
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
