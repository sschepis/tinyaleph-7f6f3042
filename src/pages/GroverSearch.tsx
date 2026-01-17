import { useState } from 'react';
import { Search } from 'lucide-react';
import { useGrover } from '@/hooks/useGrover';
import {
  AmplitudeBarChart,
  GeometricVisualization,
  OraclePanel,
  ControlPanel,
  ProbabilityTimeline,
  MeasurementResult,
  SpeedupComparison,
  HelpContent,
} from '@/components/grover';
import { AppHelpDialog, HelpButton } from '@/components/app-help';

export default function GroverSearch() {
  const grover = useGrover();
  const [helpOpen, setHelpOpen] = useState(false);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Search className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Grover's Search Visualizer</h1>
              <p className="text-xs text-muted-foreground">Quantum Amplitude Amplification</p>
            </div>
          </div>
          <HelpButton onClick={() => setHelpOpen(true)} />
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar - Controls */}
          <div className="col-span-12 md:col-span-3 space-y-4">
            <ControlPanel
              numQubits={grover.config.numQubits}
              currentIteration={grover.state?.iteration ?? 0}
              optimalIterations={grover.state?.optimalIterations ?? grover.iterationHistory[0]?.iteration ?? 0}
              probabilityMarked={grover.state?.probabilityMarked ?? (grover.config.markedStates.length / Math.pow(2, grover.config.numQubits))}
              phase={grover.state?.phase ?? 'idle'}
              isAnimating={grover.isAnimating}
              hasState={grover.state !== null}
              animationSpeed={grover.animationSpeed}
              onNumQubitsChange={grover.setNumQubits}
              onInitialize={grover.initialize}
              onStepFull={grover.stepFull}
              onRunToOptimal={grover.runToOptimalIterations}
              onMeasure={grover.measure}
              onReset={grover.reset}
              onRunAnimated={grover.runAnimated}
              onAnimationSpeedChange={grover.setAnimationSpeed}
            />
            
            <OraclePanel
              numQubits={grover.config.numQubits}
              markedStates={grover.config.markedStates}
              onToggle={grover.toggleMarkedState}
              disabled={grover.state !== null}
            />
          </div>
          
          {/* Center - Visualizations */}
          <div className="col-span-12 md:col-span-6 space-y-4">
            {/* Amplitude distribution */}
            <AmplitudeBarChart
              amplitudes={grover.state?.amplitudes ?? Array(Math.pow(2, grover.config.numQubits)).fill(1 / Math.sqrt(Math.pow(2, grover.config.numQubits)))}
              markedStates={grover.config.markedStates}
              numQubits={grover.config.numQubits}
              highlightedIndex={grover.measurementResult?.result}
            />
            
            {/* Geometric visualization */}
            <GeometricVisualization
              geometricState={grover.geometricState}
              iteration={grover.state?.iteration ?? 0}
              optimalIterations={grover.state?.optimalIterations ?? Math.round((Math.PI / 4) * Math.sqrt(Math.pow(2, grover.config.numQubits) / Math.max(grover.config.markedStates.length, 1)))}
            />
            
            {/* Probability timeline */}
            <ProbabilityTimeline
              history={grover.iterationHistory}
              currentIteration={grover.state?.iteration ?? 0}
              optimalIterations={Math.round((Math.PI / 4) * Math.sqrt(Math.pow(2, grover.config.numQubits) / Math.max(grover.config.markedStates.length, 1)))}
            />
          </div>
          
          {/* Right Sidebar - Results & Info */}
          <div className="col-span-12 md:col-span-3 space-y-4">
            <MeasurementResult
              result={grover.measurementResult}
              numQubits={grover.config.numQubits}
              probabilityMarked={grover.state?.probabilityMarked ?? (grover.config.markedStates.length / Math.pow(2, grover.config.numQubits))}
            />
            
            <SpeedupComparison
              numQubits={grover.config.numQubits}
              numMarked={grover.config.markedStates.length}
            />
          </div>
        </div>
      </main>
      
      {/* Help Dialog */}
      <AppHelpDialog
        open={helpOpen}
        onOpenChange={setHelpOpen}
        appName="Grover's Search Algorithm"
        steps={HelpContent()}
      />
    </div>
  );
}
