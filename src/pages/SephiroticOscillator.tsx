import { useSephiroticOscillator } from '@/hooks/useSephiroticOscillator';
import {
  TreeVisualization,
  MeditationPanel,
  SystemMetrics,
  SoundControls,
  PathAnalysisPanel,
  WordAnalysisPanel
} from '@/components/sephirotic-oscillator';

export default function SephiroticOscillator() {
  const {
    state,
    soundEnabled,
    toggleSound,
    clickSephirah,
    startMeditation,
    stopMeditation,
    reset
  } = useSephiroticOscillator();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-black/50 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-4 relative z-10">
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Sephirotic Oscillator
            </span>
          </h1>
          <p className="text-xs text-muted-foreground">
            Cavity resonator network • 22 Hebrew letter paths • Click to excite
          </p>
        </header>

        {/* Main Layout - responsive grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-3">
          {/* Left Sidebar - System & Meditation */}
          <div className="xl:col-span-2 space-y-3">
            <SystemMetrics
              totalEnergy={state.totalEnergy}
              coherence={state.coherence}
              dominantPillar={state.dominantPillar}
              activeSephirot={state.activeSephirot}
              oscillators={state.oscillators}
            />
            <MeditationPanel
              activeMeditation={state.meditationMode}
              meditationStep={state.meditationStep}
              onStart={startMeditation}
              onStop={stopMeditation}
            />
          </div>

          {/* Center - Tree Visualization */}
          <div className="xl:col-span-5">
            <div className="bg-black/40 border border-primary/20 rounded-lg p-2 aspect-[3/4]">
              <TreeVisualization
                oscillators={state.oscillators}
                flows={state.flows}
                activeSephirot={state.activeSephirot}
                onClickSephirah={clickSephirah}
                meditationActive={!!state.meditationMode}
              />
            </div>
          </div>

          {/* Right Side - Analysis Panels */}
          <div className="xl:col-span-5 space-y-3">
            <div className="h-[300px]">
              <PathAnalysisPanel
                flows={state.flows}
                oscillators={state.oscillators}
              />
            </div>
            <div className="h-[320px]">
              <WordAnalysisPanel flows={state.flows} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Sound Controls */}
      <SoundControls soundEnabled={soundEnabled} onToggle={toggleSound} />
    </div>
  );
}
