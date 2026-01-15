import { useSephiroticOscillator } from '@/hooks/useSephiroticOscillator';
import {
  TreeVisualization,
  MeditationPanel,
  SystemMetrics,
  OracleChat
} from '@/components/sephirotic-oscillator';

export default function SephiroticOscillator() {
  const {
    state,
    clickSephirah,
    startMeditation,
    stopMeditation,
    sendMessage,
    reset
  } = useSephiroticOscillator();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-black/50 relative">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-900/10 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header */}
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              Sephirotic Oscillator
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Tree of Life as coupled oscillator network • Click nodes to energize
          </p>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <SystemMetrics
              totalEnergy={state.totalEnergy}
              coherence={state.coherence}
              dominantPillar={state.dominantPillar}
              activeSephirot={state.activeSephirot}
            />
            <MeditationPanel
              activeMeditation={state.meditationMode}
              meditationStep={state.meditationStep}
              onStart={startMeditation}
              onStop={stopMeditation}
            />
          </div>

          {/* Center - Tree Visualization */}
          <div className="lg:col-span-5">
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

          {/* Right Sidebar - Chat */}
          <div className="lg:col-span-4 h-[600px]">
            <OracleChat
              messages={state.messages}
              isProcessing={state.isProcessing}
              onSendMessage={sendMessage}
              onReset={reset}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
