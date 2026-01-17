import { useQEC } from '@/hooks/useQEC';
import { CODE_INFO } from '@/lib/qec';
import {
  CodeSelector,
  PhysicalQubitsViz,
  SyndromePanel,
  LogicalQubitViz,
  ErrorInjector,
  CorrectionPanel,
  ControlPanel,
  StatsPanel,
  HelpContent,
} from '@/components/qec';
import { AppHelpDialog, HelpButton } from '@/components/app-help';
import { useFirstRun } from '@/hooks/useFirstRun';

export default function QuantumErrorCorrectionLab() {
  const {
    state,
    isAnimating,
    changeCode,
    encode,
    addError,
    addRandomError,
    measure,
    correct,
    reset,
    runFullCycle,
  } = useQEC('bit_flip_3');
  
  const [showHelp, setShowHelp] = useFirstRun('qec-lab');
  const helpSteps = HelpContent();
  const codeInfo = CODE_INFO[state.codeType];

  const handleCloseHelp = () => {
    setShowHelp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
              Quantum Error Correction Lab
            </h1>
            <p className="text-sm text-muted-foreground">
              Explore syndrome detection and error correction with various QEC codes
            </p>
          </div>
          <HelpButton onClick={() => setShowHelp(true)} />
        </div>

        {/* Control Panel */}
        <ControlPanel
          state={state}
          isAnimating={isAnimating}
          onEncode={() => encode(1, 0)}
          onMeasure={measure}
          onCorrect={correct}
          onReset={reset}
          onRunCycle={runFullCycle}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-4">
            <CodeSelector
              selectedCode={state.codeType}
              onSelect={changeCode}
              disabled={isAnimating || state.step !== 'idle'}
            />
            <LogicalQubitViz
              logicalQubit={state.logicalQubit}
              step={state.step}
            />
            <StatsPanel stats={state.stats} />
          </div>

          {/* Center - Physical Qubits */}
          <div className="lg:col-span-5">
            <PhysicalQubitsViz
              qubits={state.physicalQubits}
              codeType={state.codeType}
            />
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <ErrorInjector
              codeType={state.codeType}
              numQubits={codeInfo.numPhysical}
              onInjectError={addError}
              onRandomError={addRandomError}
              disabled={isAnimating || state.step === 'idle'}
            />
            <SyndromePanel
              syndromes={state.syndromes}
              measured={state.step === 'syndrome_measured' || state.step === 'corrected'}
            />
            <CorrectionPanel
              corrections={state.corrections}
              step={state.step}
            />
          </div>
        </div>
      </div>

      <AppHelpDialog
        open={showHelp}
        onOpenChange={setShowHelp}
        onComplete={markSeen}
        steps={helpSteps}
        appName="QEC Lab"
      />
    </div>
  );
}
