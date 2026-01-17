import { useState, useEffect } from 'react';
import { useDecoherence } from '@/hooks/useDecoherence';
import { INITIAL_STATES } from '@/lib/decoherence/types';
import {
  BlochSphereViz,
  DecayPlot,
  ParameterPanel,
  MetricsPanel,
  HelpContent,
} from '@/components/decoherence';
import { AppHelpDialog, HelpButton } from '@/components/app-help';
import { useFirstRun } from '@/hooks/useFirstRun';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DecoherenceSimulator() {
  const {
    state,
    start,
    pause,
    reset,
    setInitialState,
    setParams,
    selectQubitSystem,
    speed,
    setSpeed,
    decayRates,
    isRunning,
  } = useDecoherence('plus_x');

  const [isFirstRun, markAsSeen] = useFirstRun('decoherence-simulator');
  const [showHelp, setShowHelp] = useState(false);
  const helpSteps = HelpContent();

  useEffect(() => {
    if (isFirstRun) {
      setShowHelp(true);
    }
  }, [isFirstRun]);

  const handleCloseHelp = (open: boolean) => {
    setShowHelp(open);
    if (!open && isFirstRun) {
      markAsSeen();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Decoherence Simulator</h1>
            <p className="text-sm text-muted-foreground">
              Visualize quantum state decay through T₁/T₂ relaxation processes
            </p>
          </div>
          <HelpButton onClick={() => setShowHelp(true)} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Control Panel */}
          <div className="lg:col-span-1">
            <ParameterPanel
              params={state.params}
              onParamsChange={setParams}
              onSystemSelect={selectQubitSystem}
              onInitialStateChange={(s) => setInitialState(s as keyof typeof INITIAL_STATES)}
              isRunning={isRunning}
              onStart={start}
              onPause={pause}
              onReset={reset}
              speed={speed}
              onSpeedChange={setSpeed}
              time={state.time}
            />
          </div>

          {/* Main Visualization */}
          <div className="lg:col-span-2">
            <Card className="p-4">
              <Tabs defaultValue="bloch" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="bloch">Bloch Sphere</TabsTrigger>
                  <TabsTrigger value="decay">Decay Curves</TabsTrigger>
                </TabsList>
                
                <TabsContent value="bloch" className="flex justify-center">
                  <BlochSphereViz
                    bloch={state.bloch}
                    history={state.history}
                    showTrajectory={true}
                  />
                </TabsContent>
                
                <TabsContent value="decay">
                  <DecayPlot state={state} />
                </TabsContent>
              </Tabs>
            </Card>

            {/* Decay channel indicator */}
            <Card className="p-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-xs">T₁ (energy decay)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-xs">T₂ (dephasing)</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  T₁ = {state.params.T1}μs | T₂ = {state.params.T2}μs
                </div>
              </div>
            </Card>
          </div>

          {/* Metrics Panel */}
          <div className="lg:col-span-1">
            <MetricsPanel state={state} decayRates={decayRates} />
          </div>
        </div>

        {/* Formula Card */}
        <Card className="p-4 mt-4 bg-muted/30">
          <h3 className="text-sm font-medium mb-2">Bloch Equation Dynamics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-mono">
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Transverse decay</p>
              <p>⟨σ_x,y(t)⟩ = ⟨σ_x,y(0)⟩ e<sup>-t/T₂</sup></p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Longitudinal decay</p>
              <p>⟨σ_z(t)⟩ = z_eq + (⟨σ_z(0)⟩ - z_eq) e<sup>-t/T₁</sup></p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground text-xs mb-1">Constraint</p>
              <p>1/T₂ = 1/(2T₁) + 1/T_φ</p>
            </div>
          </div>
        </Card>
      </div>

      <AppHelpDialog
        open={showHelp}
        onOpenChange={handleCloseHelp}
        steps={helpSteps}
        appName="Decoherence Simulator"
      />
    </div>
  );
}
