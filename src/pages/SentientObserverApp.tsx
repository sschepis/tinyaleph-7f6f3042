import React from 'react';
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
  Eye,
  Clock,
  Shield,
  Target,
  Waves,
  Play,
  Pause,
  RotateCcw,
  Send,
  AlertTriangle,
  CheckCircle,
  Zap,
  Thermometer
} from 'lucide-react';

import { useSentientObserver } from '@/hooks/useSentientObserver';
import {
  SMFRadarChart,
  OscillatorPhaseViz,
  HolographicFieldViz,
  IntroductionSection,
  ResultsPanel,
  SymbolicCore,
  SMF_AXES
} from '@/components/sentient-observer';

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
    setIsRunning,
    setCoupling,
    setTemperature,
    setThermalEnabled,
    setUserInput,
    handleInput,
    handleReset,
    setInitMode,
    boostCoherence,
    exciteByPrimes
  } = useSentientObserver();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Sentient Observer</h1>
              <p className="text-muted-foreground text-sm">
                Prime Resonance Semantic Computation Demo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={safetyStats.isSafe ? 'default' : 'destructive'}>
              {safetyStats.alertLevel}
            </Badge>
            <Button
              variant={isRunning ? 'destructive' : 'default'}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isRunning ? 'Pause' : 'Run'}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Introduction */}
        <IntroductionSection />

        {/* Stats Bar */}
        <Card>
          <CardContent className="py-3">
            <div className="grid grid-cols-7 gap-4 text-center">
              <div>
                <div className="text-2xl font-mono">{tickCount}</div>
                <div className="text-xs text-muted-foreground">Ticks</div>
              </div>
              <div>
                <div className={`text-2xl font-mono ${coherence > 0.7 ? 'text-green-500' : coherence > 0.4 ? 'text-yellow-500' : 'text-red-500'}`}>
                  {(coherence * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">Coherence</div>
              </div>
              <div>
                <div className="text-2xl font-mono text-primary">{(peakCoherence * 100).toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Peak</div>
              </div>
              <div>
                <div className="text-2xl font-mono">{entropy.toFixed(3)}</div>
                <div className="text-xs text-muted-foreground">Entropy</div>
              </div>
              <div>
                <div className="text-2xl font-mono">{moments.length}</div>
                <div className="text-xs text-muted-foreground">Moments</div>
              </div>
              <div>
                <div className="text-2xl font-mono">{subjectiveTime.toFixed(2)}</div>
                <div className="text-xs text-muted-foreground">τ (subjective)</div>
              </div>
              <div>
                <div className="text-2xl font-mono">
                  {oscillators.filter(o => o.amplitude > 0.1).length}
                </div>
                <div className="text-xs text-muted-foreground">Active Primes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column - Visualizations and Controls */}
          <div className="lg:col-span-2 space-y-4">
            {/* Main Tabs */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid grid-cols-6 w-full">
                <TabsTrigger value="overview">
                  <Eye className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="oscillators">
                  <Waves className="h-4 w-4 mr-2" />
                  PRSC
                </TabsTrigger>
                <TabsTrigger value="smf">
                  <Brain className="h-4 w-4 mr-2" />
                  SMF
                </TabsTrigger>
                <TabsTrigger value="temporal">
                  <Clock className="h-4 w-4 mr-2" />
                  Temporal
                </TabsTrigger>
                <TabsTrigger value="agency">
                  <Target className="h-4 w-4 mr-2" />
                  Agency
                </TabsTrigger>
                <TabsTrigger value="safety">
                  <Shield className="h-4 w-4 mr-2" />
                  Safety
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Phase Circle */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Phase Synchronization</CardTitle>
                      <CardDescription className="text-xs">
                        Kuramoto order parameter visualization
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <OscillatorPhaseViz oscillators={oscillators} coherence={coherence} />
                    </CardContent>
                  </Card>

                  {/* SMF Radar */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">SMF Orientation</CardTitle>
                      <CardDescription className="text-xs">
                        16-dimensional semantic state
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SMFRadarChart smf={smfState} size={200} />
                    </CardContent>
                  </Card>

                  {/* Holographic Field */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Holographic Field</CardTitle>
                      <CardDescription className="text-xs">
                        Prime-mode interference pattern
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <HolographicFieldViz intensity={holoIntensity} size={180} />
                    </CardContent>
                  </Card>
                </div>

                {/* Input Section */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Sensory Input
                    </CardTitle>
                    <CardDescription>
                      Enter text to excite oscillators and influence the observer state
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder="Enter text to encode..."
                        onKeyDown={e => e.key === 'Enter' && handleInput()}
                      />
                      <Button onClick={handleInput}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                    {inputHistory.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {inputHistory.slice(-5).map((input, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {input.slice(0, 20)}
                            {input.length > 20 ? '...' : ''}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Controls */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      System Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Initialization Mode */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Initialization Mode</div>
                      <div className="flex gap-2">
                        {(['random', 'clustered', 'aligned'] as const).map(mode => (
                          <Button
                            key={mode}
                            size="sm"
                            variant={initMode === mode ? 'default' : 'outline'}
                            onClick={() => setInitMode(mode)}
                            className="capitalize"
                          >
                            {mode}
                          </Button>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {initMode === 'aligned' && 'Oscillators start nearly synchronized (high coherence)'}
                        {initMode === 'clustered' && 'Oscillators form groups (moderate coherence, interesting dynamics)'}
                        {initMode === 'random' && 'Oscillators start with random phases (low coherence, harder to sync)'}
                      </p>
                    </div>

                    {/* Coherence Boost Button */}
                    <Button
                      onClick={boostCoherence}
                      variant="secondary"
                      className="w-full"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Boost Coherence (Nudge Phases)
                    </Button>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Coupling (K)</span>
                          <span className="font-mono">{coupling.toFixed(2)}</span>
                        </div>
                        <Slider
                          value={[coupling]}
                          onValueChange={([v]) => setCoupling(v)}
                          min={0}
                          max={1}
                          step={0.01}
                        />
                        <p className="text-xs text-muted-foreground">
                          Higher coupling → faster synchronization
                        </p>
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
                        <p className="text-xs text-muted-foreground">
                          Higher temperature → more noise/exploration
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="thermal"
                        checked={thermalEnabled}
                        onChange={e => setThermalEnabled(e.target.checked)}
                      />
                      <label htmlFor="thermal" className="text-sm">
                        Enable Thermal Dynamics (adds noise, fights coherence)
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Oscillators Tab */}
              <TabsContent value="oscillators" className="space-y-4">
                <Card className="border-primary/20 bg-primary/5 mb-4">
                  <CardContent className="py-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>PRSC (Prime Resonance Semantic Computation)</strong> uses prime-frequency 
                      oscillators as the computational substrate. Each prime number drives an oscillator 
                      at a unique frequency, and their collective synchronization encodes semantic meaning.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Prime Oscillator Bank</CardTitle>
                      <CardDescription>
                        {oscillators.length} oscillators, {oscillators.filter(o => o.amplitude > 0.1).length} active
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Phase Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <OscillatorPhaseViz oscillators={oscillators} coherence={coherence} />
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="p-2 bg-muted rounded">
                          <div className="font-medium">Order Parameter</div>
                          <div className="font-mono">{coherence.toFixed(4)}</div>
                        </div>
                        <div className="p-2 bg-muted rounded">
                          <div className="font-medium">Mean Phase</div>
                          <div className="font-mono">
                            {Math.atan2(
                              oscillators.reduce((s, o) => s + Math.sin(o.phase), 0),
                              oscillators.reduce((s, o) => s + Math.cos(o.phase), 0)
                            ).toFixed(3)}{' '}
                            rad
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* SMF Tab */}
              <TabsContent value="smf" className="space-y-4">
                <Card className="border-primary/20 bg-primary/5 mb-4">
                  <CardContent className="py-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>SMF (Sedenion Memory Field)</strong> represents the observer's orientation 
                      in a 16-dimensional semantic space. Each axis corresponds to a fundamental concept, 
                      and the system's position in this space determines its "semantic stance."
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Sedenion Memory Field</CardTitle>
                      <CardDescription>16-dimensional semantic orientation space</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SMFRadarChart smf={smfState} size={300} />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Axis Values</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[350px]">
                        <div className="space-y-2">
                          {SMF_AXES.map((axis, i) => {
                            const value = smfState.s?.[i] || 0;
                            return (
                              <div key={axis} className="flex items-center gap-2">
                                <span className="w-24 text-sm">{axis}</span>
                                <Progress value={Math.abs(value as number) * 100} className="flex-1" />
                                <span className="w-16 text-right font-mono text-xs">
                                  {(value as number).toFixed(3)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Temporal Tab */}
              <TabsContent value="temporal" className="space-y-4">
                <Card className="border-primary/20 bg-primary/5 mb-4">
                  <CardContent className="py-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Emergent Time</strong> demonstrates how subjective time can arise from 
                      information processing. "Moments" are created when coherence peaks, and subjective 
                      time τ accumulates faster during high-coherence states—analogous to how engaged 
                      attention makes time "fly."
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Emergent Time</CardTitle>
                      <CardDescription>Moments triggered by coherence peaks</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="p-3 bg-muted rounded">
                          <div className="text-2xl font-mono">{moments.length}</div>
                          <div className="text-xs text-muted-foreground">Total Moments</div>
                        </div>
                        <div className="p-3 bg-muted rounded">
                          <div className="text-2xl font-mono">{subjectiveTime.toFixed(3)}</div>
                          <div className="text-xs text-muted-foreground">Subjective Time τ</div>
                        </div>
                      </div>

                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2">
                          {moments
                            .slice()
                            .reverse()
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

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Holographic Memory</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center">
                      <HolographicFieldViz intensity={holoIntensity} size={200} />
                      <div className="mt-4 text-sm text-center text-muted-foreground">
                        Interference pattern from prime-mode superposition
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Agency Tab */}
              <TabsContent value="agency" className="space-y-4">
                <Card className="border-primary/20 bg-primary/5 mb-4">
                  <CardContent className="py-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Agency</strong> emerges from goal-directed behavior. The observer maintains 
                      active goals and allocates attention based on priority. External inputs create 
                      attention foci that influence oscillator dynamics.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Active Goals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {goals.map(goal => (
                          <div key={goal.id} className="p-3 border rounded">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-sm font-medium">{goal.description}</span>
                              <Badge variant={goal.status === 'active' ? 'default' : 'secondary'}>
                                {goal.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={goal.progress * 100} className="flex-1" />
                              <span className="text-xs text-muted-foreground">
                                {(goal.progress * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Priority: {goal.priority.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Attention Foci</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {attentionFoci.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          No active attention foci.
                          <br />
                          Send input to create attention.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {attentionFoci.map(focus => (
                            <div key={focus.id} className="p-2 border rounded flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <div className="flex-1">
                                <div className="text-sm font-medium">
                                  {typeof focus.target === 'string'
                                    ? focus.target.slice(0, 30)
                                    : `Prime ${focus.target}`}
                                </div>
                                <div className="text-xs text-muted-foreground">{focus.type}</div>
                              </div>
                              <Progress value={focus.intensity * 100} className="w-20" />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Safety Tab */}
              <TabsContent value="safety" className="space-y-4">
                <Card className="border-primary/20 bg-primary/5 mb-4">
                  <CardContent className="py-3">
                    <p className="text-sm text-muted-foreground">
                      <strong>Safety Constraints</strong> ensure the observer operates within acceptable 
                      bounds. The system monitors coherence, amplitude, and entropy to prevent unstable 
                      or harmful states.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Safety Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div className="p-3 bg-muted rounded text-center">
                        <div className="flex justify-center mb-2">
                          {safetyStats.isSafe ? (
                            <CheckCircle className="h-8 w-8 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-8 w-8 text-yellow-500" />
                          )}
                        </div>
                        <div className="text-sm font-medium">
                          {safetyStats.isSafe ? 'Safe' : 'Warning'}
                        </div>
                      </div>
                      <div className="p-3 bg-muted rounded text-center">
                        <div className="text-2xl font-mono">{safetyStats.alertLevel}</div>
                        <div className="text-xs text-muted-foreground">Alert Level</div>
                      </div>
                      <div className="p-3 bg-muted rounded text-center">
                        <div className="text-2xl font-mono">{safetyStats.constraintCount}</div>
                        <div className="text-xs text-muted-foreground">Constraints</div>
                      </div>
                      <div className="p-3 bg-muted rounded text-center">
                        <div className="text-2xl font-mono">{safetyStats.totalViolations}</div>
                        <div className="text-xs text-muted-foreground">Violations</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Active Constraints</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          'coherence_minimum',
                          'amplitude_maximum',
                          'smf_bounds',
                          'entropy_balance',
                          'honesty',
                          'harm_prevention'
                        ].map(constraint => (
                          <div key={constraint} className="p-2 border rounded flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{constraint.replace(/_/g, ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right column - Symbolic Core & Results */}
          <div className="space-y-4">
            {/* Symbolic Communication Interface */}
            <SymbolicCore
              oscillators={oscillators}
              coherence={coherence}
              onExciteOscillators={exciteByPrimes}
              isRunning={isRunning}
            />
            
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
        </div>

        {/* Footer info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Sentient Observer architecture based on the paper "A Design for a Sentient Observer"</p>
          <p className="mt-1">
            Powered by tinyaleph: PRSC (Prime Resonance Semantic Computation) • SMF (Sedenion Memory
            Field) • HQE (Holographic Quantum Encoding)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SentientObserverApp;
