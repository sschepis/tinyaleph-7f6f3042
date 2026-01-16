import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  Activity,
  Clock,
  Shield,
  Target,
  Waves,
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  Sparkles,
  Cpu,
  Settings,
  Zap
} from 'lucide-react';
import type { MemoryFragment } from '@/lib/sentient-observer/holographic-memory';

import { useSentientObserver } from '@/hooks/useSentientObserver';
import { useCognitiveObserver } from '@/hooks/useCognitiveObserver';
import {
  SMFRadarChart,
  OscillatorPhaseViz,
  HolographicFieldViz,
  ExplorationHeatmap,
  ResultsPanel,
  SymbolicCore,
  ActiveSymbolsPanel,
  SemanticPrimeMapperPanel,
  LearningChaperonePanel,
  SMF_AXES
} from '@/components/sentient-observer';
import { CognitiveTab } from '@/components/sentient-observer/cognitive';
import { LearningEngine } from '@/lib/sentient-observer/learning-engine';
import { getSemanticPrimeMapper } from '@/lib/sentient-observer/semantic-prime-mapper';
import { Atom } from 'lucide-react';

const SentientObserverApp: React.FC = () => {
  const {
    isRunning,
    tickCount,
    coherence,
    entropy,
    temperature,
    coupling,
    thermalEnabled,
    oscillators,
    smfState,
    moments,
    subjectiveTime,
    goals,
    attentionFoci,
    safetyStats,
    holoIntensity,
    userInput,
    inputHistory,
    initMode,
    peakCoherence,
    explorationTemperature,
    explorationFrequency,
    recentlyExploredIndices,
    explorationProgress,
    oscillatorActivationCounts,
    autoExploreEnabled,
    setIsRunning,
    setCoupling,
    setTemperature,
    setThermalEnabled,
    setUserInput,
    handleInput,
    handleReset,
    setInitMode,
    boostCoherence,
    exciteByPrimes,
    setExplorationTemperature,
    setExplorationFrequency,
    setAutoExploreEnabled
  } = useSentientObserver();

  // Initialize cognitive systems
  const cognitive = useCognitiveObserver(
    oscillators,
    coherence,
    entropy,
    explorationProgress,
    tickCount,
    isRunning
  );

  // Memory integration state
  // Reinject memory content callback for the cognitive tab
  const [recalledMemories, setRecalledMemories] = useState<{ fragment: MemoryFragment; similarity: number }[]>([]);
  
  // Learning Engine
  const [learningEngine] = useState(() => new LearningEngine(getSemanticPrimeMapper()));
  const [learningState, setLearningState] = useState(() => learningEngine.getState());
  
  React.useEffect(() => {
    learningEngine.setOnUpdate(setLearningState);
    return () => learningEngine.stopLearningSession();
  }, [learningEngine]);
  
  // Reinject memory content into the system
  const handleReinjectMemory = useCallback((content: string) => {
    // Process through cognitive memory system 
    const result = cognitive.processUserInput(content, coherence);
    setRecalledMemories(result.recalled);
    
    // Set it as input and excite oscillators
    setUserInput(content);
    
    // Excite oscillators directly based on the content
    setTimeout(() => {
      handleInput();
    }, 50);
  }, [coherence, cognitive, setUserInput, handleInput]);

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-7xl mx-auto space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">Sentient Observer</h1>
            <Badge variant={safetyStats.isSafe ? 'outline' : 'destructive'} className="text-xs">
              {safetyStats.alertLevel}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Inline key stats */}
            <div className="hidden md:flex items-center gap-3 mr-3 text-xs font-mono">
              <span className={coherence > 0.7 ? 'text-green-500' : coherence > 0.4 ? 'text-yellow-500' : 'text-muted-foreground'}>
                C:{(coherence * 100).toFixed(0)}%
              </span>
              <span className="text-muted-foreground">H:{entropy.toFixed(2)}</span>
              <span className="text-muted-foreground">t:{tickCount}</span>
            </div>
            <Button
              variant={isRunning ? 'destructive' : 'default'}
              size="sm"
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Main Content Grid - Chat-Centric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left column - Compact Visualizations */}
          <div className="lg:col-span-3 space-y-3">
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">Phase Sync</CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex justify-center">
                <OscillatorPhaseViz 
                  oscillators={oscillators} 
                  coherence={coherence}
                  recentlyExploredIndices={recentlyExploredIndices}
                  explorationProgress={explorationProgress}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">SMF State</CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex justify-center">
                <SMFRadarChart smf={smfState} size={140} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">Holo Field</CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex justify-center">
                <HolographicFieldViz intensity={holoIntensity} size={120} />
              </CardContent>
            </Card>

            {/* Prime Oscillator Bank - Always Visible */}
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">Prime Oscillator Bank</CardTitle>
                <p className="text-[10px] text-muted-foreground">
                  {oscillators.length} oscillators, {oscillators.filter(o => o.amplitude > 0.1).length} active
                </p>
              </CardHeader>
              <CardContent className="p-2">
                <ScrollArea className="h-[180px]">
                  <div className="space-y-1">
                    {oscillators.slice(0, 10).map((osc, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-6 text-right font-mono text-xs">{osc.prime}</span>
                        <Progress value={osc.amplitude * 100} className="flex-1 h-2" />
                        <span className="w-12 text-right font-mono text-[10px] text-muted-foreground">
                          ψ={osc.phase.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Exploration Heatmap - Always Visible */}
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Activity className="h-3 w-3" />
                  Exploration
                  <Badge variant="outline" className="ml-auto text-[10px]">
                    {(explorationProgress * 100).toFixed(0)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <ExplorationHeatmap
                  oscillators={oscillators}
                  activationCounts={oscillatorActivationCounts}
                  recentlyExploredIndices={recentlyExploredIndices}
                  size={160}
                />
                <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
                  <span>{Math.round(explorationProgress * oscillators.length)}/{oscillators.length} explored</span>
                  <span>{oscillatorActivationCounts.reduce((a, b) => a + b, 0)} hits</span>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <ResultsPanel
              coherence={coherence}
              entropy={entropy}
              oscillators={oscillators}
              smfState={smfState}
              moments={moments}
              subjectiveTime={subjectiveTime}
              tickCount={tickCount}
              peakCoherence={peakCoherence}
            />
          </div>

          {/* Center column - Chat/Symbolic Core (Main Focus) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {/* Symbolic Communication Interface - PRIMARY */}
            <SymbolicCore
              oscillators={oscillators}
              coherence={coherence}
              onExciteOscillators={exciteByPrimes}
              isRunning={isRunning}
              onConversationFact={cognitive.addConversationFact}
              onSearchMemory={(query) => {
                const results = cognitive.searchMemory(query);
                return results.map(r => ({ content: r.fragment.content, similarity: r.similarity }));
              }}
            />
            
            {/* Active Symbols Panel */}
            <ActiveSymbolsPanel
              oscillators={oscillators}
              coherence={coherence}
            />
            
            {/* Learning Chaperone Panel */}
            <LearningChaperonePanel
              state={learningState}
              onStartLearning={() => learningEngine.startLearningSession(8000)}
              onStopLearning={() => learningEngine.stopLearningSession()}
              onRequestLearn={(desc, prime) => learningEngine.requestLearn(desc, prime)}
            />
          </div>

          {/* Right column - Analysis Tabs */}
          <div className="lg:col-span-4">
            <Tabs defaultValue="primes" className="space-y-4">
              <TabsList className="grid grid-cols-5 w-full">
                <TabsTrigger value="primes" className="text-xs">
                  <Atom className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="cognitive" className="text-xs">
                  <Cpu className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="oscillators" className="text-xs">
                  <Waves className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="temporal" className="text-xs">
                  <Clock className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs">
                  <Settings className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>

              {/* Semantic Prime Mapper Tab */}
              <TabsContent value="primes" className="space-y-4">
                <SemanticPrimeMapperPanel
                  oscillatorPrimes={oscillators.map(o => o.prime)}
                  activeOscillatorIndices={oscillators
                    .map((o, i) => (o.amplitude > 0.1 ? i : -1))
                    .filter(i => i >= 0)}
                />
              </TabsContent>

              {/* Cognitive Tab */}
              <TabsContent value="cognitive" className="space-y-4">
                <CognitiveTab
                  memory={cognitive.memory}
                  agent={cognitive.agent}
                  currentSuperposition={cognitive.currentSuperposition}
                  reasoning={cognitive.reasoning}
                  coherence={coherence}
                  isSimulationRunning={isRunning}
                  isAgentAutonomous={cognitive.isAgentAutonomous}
                  onSetAgentAutonomous={cognitive.setAgentAutonomous}
                  lastAgentAction={cognitive.lastAgentAction}
                  onSearchMemory={cognitive.searchMemory}
                  onReinjectMemory={handleReinjectMemory}
                  onRunAgentStep={cognitive.runAgentStep}
                  onCreateSuperposition={cognitive.createMeaningSuperposition}
                  onTriggerCollapse={cognitive.triggerCollapse}
                  getMemoryStats={cognitive.getMemoryStats}
                  getReasoningStats={cognitive.getReasoningStats}
                  getCollapseStats={cognitive.getCollapseStats}
                  onReset={cognitive.resetCognitive}
                />
              </TabsContent>

              {/* Oscillators Tab */}
              <TabsContent value="oscillators" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Prime Oscillator Bank</CardTitle>
                    <CardDescription className="text-xs">
                      {oscillators.length} oscillators, {oscillators.filter(o => o.amplitude > 0.1).length} active
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[250px]">
                      <div className="space-y-2">
                        {oscillators.slice(0, 16).map((osc, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-8 text-right font-mono text-sm">{osc.prime}</span>
                            <Progress value={osc.amplitude * 100} className="flex-1" />
                            <span className="w-16 text-right font-mono text-xs">
                              φ={osc.phase.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Exploration Heatmap */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Exploration
                      <Badge variant="outline" className="ml-auto text-xs">
                        {(explorationProgress * 100).toFixed(0)}%
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExplorationHeatmap
                      oscillators={oscillators}
                      activationCounts={oscillatorActivationCounts}
                      recentlyExploredIndices={recentlyExploredIndices}
                      size={200}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Temporal Tab */}
              <TabsContent value="temporal" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Emergent Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="p-3 bg-muted rounded">
                        <div className="text-xl font-mono">{moments.length}</div>
                        <div className="text-xs text-muted-foreground">Moments</div>
                      </div>
                      <div className="p-3 bg-muted rounded">
                        <div className="text-xl font-mono">{subjectiveTime.toFixed(3)}</div>
                        <div className="text-xs text-muted-foreground">τ</div>
                      </div>
                    </div>

                    <ScrollArea className="h-[200px]">
                      <div className="space-y-2">
                        {moments
                          .slice()
                          .reverse()
                          .slice(0, 10)
                          .map(moment => (
                            <div key={moment.id} className="p-2 bg-muted/50 rounded text-sm">
                              <div className="flex justify-between">
                                <Badge variant="outline" className="text-xs">
                                  {moment.trigger}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  C={moment.coherence.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

                {/* Goals & Attention */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Goals & Attention</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {goals.slice(0, 3).map(goal => (
                        <div key={goal.id} className="p-2 border rounded text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs truncate flex-1">{goal.description}</span>
                            <Badge variant={goal.status === 'active' ? 'default' : 'secondary'} className="text-xs ml-2">
                              {goal.status}
                            </Badge>
                          </div>
                          <Progress value={goal.progress * 100} className="h-1" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">System Parameters</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Initialization Mode */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Init Mode</div>
                      <div className="flex gap-2">
                        {(['random', 'clustered', 'aligned'] as const).map(mode => (
                          <Button
                            key={mode}
                            size="sm"
                            variant={initMode === mode ? 'default' : 'outline'}
                            onClick={() => setInitMode(mode)}
                            className="capitalize text-xs"
                          >
                            {mode}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={boostCoherence}
                      variant="secondary"
                      size="sm"
                      className="w-full"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Boost Coherence
                    </Button>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Coupling</span>
                          <span className="font-mono">{coupling.toFixed(2)}</span>
                        </div>
                        <Slider
                          value={[coupling]}
                          onValueChange={([v]) => setCoupling(v)}
                          min={0}
                          max={1}
                          step={0.01}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            Temperature
                          </span>
                          <span className="font-mono">{temperature.toFixed(2)}</span>
                        </div>
                        <Slider
                          value={[temperature]}
                          onValueChange={([v]) => setTemperature(v)}
                          min={0.1}
                          max={3}
                          step={0.1}
                          disabled={!thermalEnabled}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="thermal"
                        checked={thermalEnabled}
                        onChange={e => setThermalEnabled(e.target.checked)}
                      />
                      <label htmlFor="thermal" className="text-xs">
                        Enable Thermal Dynamics
                      </label>
                    </div>

                    {/* Auto-explore */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="auto-explore"
                          checked={autoExploreEnabled}
                          onChange={e => setAutoExploreEnabled(e.target.checked)}
                          disabled={explorationProgress >= 1}
                        />
                        <label htmlFor="auto-explore" className="text-xs">
                          Auto-Explore Mode
                        </label>
                        {autoExploreEnabled && (
                          <Sparkles className="h-3 w-3 text-amber-500 animate-pulse ml-auto" />
                        )}
                      </div>
                    </div>

                    {/* Safety */}
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4" />
                        <span className="text-sm font-medium">Safety</span>
                        <Badge variant={safetyStats.isSafe ? 'default' : 'destructive'} className="ml-auto">
                          {safetyStats.isSafe ? 'Safe' : 'Warning'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-muted rounded text-center">
                          <div className="font-mono">{safetyStats.constraintCount}</div>
                          <div className="text-muted-foreground">Constraints</div>
                        </div>
                        <div className="p-2 bg-muted rounded text-center">
                          <div className="font-mono">{safetyStats.totalViolations}</div>
                          <div className="text-muted-foreground">Violations</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Sentient Observer • PRSC • SMF • HQE</p>
        </div>
      </div>
    </div>
  );
};

export default SentientObserverApp;
