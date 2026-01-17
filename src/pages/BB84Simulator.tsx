import { useState } from 'react';
import { useBB84 } from '@/hooks/useBB84';
import {
  ControlPanel,
  PhotonChannel,
  KeyComparison,
  SecurityAnalysis,
  ProtocolExplanation,
  BasisLegend,
  HelpContent
} from '@/components/bb84';
import { AppHelpDialog, HelpButton } from '@/components/app-help';
import { Lock, Unlock } from 'lucide-react';

export default function BB84Simulator() {
  const bb84 = useBB84();
  const [helpOpen, setHelpOpen] = useState(false);
  
  const interceptedCount = bb84.state?.photons.filter(p => p.intercepted).length ?? 0;
  const totalPhotons = bb84.state?.photons.length ?? 0;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-primary/20 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              {bb84.state?.secureKeyEstablished ? (
                <Lock className="w-4 h-4 text-green-400" />
              ) : (
                <Unlock className="w-4 h-4 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold">BB84 QKD Simulator</h1>
              <p className="text-xs text-muted-foreground">Quantum Key Distribution with Eavesdropper Detection</p>
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
              keyLength={bb84.keyLength}
              evePresent={bb84.evePresent}
              eveInterceptionRate={bb84.eveInterceptionRate}
              animationSpeed={bb84.animationSpeed}
              isAnimating={bb84.isAnimating}
              hasState={bb84.state !== null}
              onKeyLengthChange={bb84.setKeyLength}
              onEvePresentChange={bb84.setEvePresent}
              onEveInterceptionRateChange={bb84.setEveInterceptionRate}
              onAnimationSpeedChange={bb84.setAnimationSpeed}
              onRun={bb84.runProtocol}
              onRunAnimated={bb84.runWithAnimation}
              onReset={bb84.reset}
              onStep={bb84.stepForward}
            />
            
            <BasisLegend />
          </div>
          
          {/* Center - Visualization */}
          <div className="col-span-12 md:col-span-6 space-y-4">
            <PhotonChannel
              photons={bb84.state?.photons ?? []}
              currentIndex={bb84.currentPhotonIndex}
              isAnimating={bb84.isAnimating}
            />
            
            <KeyComparison
              aliceKey={bb84.state?.siftedKeyAlice ?? []}
              bobKey={bb84.state?.siftedKeyBob ?? []}
              aliceKeyHex={bb84.aliceKeyHex}
              bobKeyHex={bb84.bobKeyHex}
              matchPercentage={bb84.keyMatch}
            />
          </div>
          
          {/* Right Sidebar - Analysis */}
          <div className="col-span-12 md:col-span-3 space-y-4">
            <SecurityAnalysis
              errorRate={bb84.state?.errorRate ?? 0}
              theoreticalError={bb84.theoreticalError}
              evePresent={bb84.evePresent}
              eveInterceptionRate={bb84.eveInterceptionRate}
              secureKeyEstablished={bb84.state?.secureKeyEstablished ?? false}
              interceptedCount={interceptedCount}
              totalPhotons={totalPhotons}
            />
            
            <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-3">
              <h3 className="text-xs font-medium mb-2">Protocol Steps</h3>
              <ProtocolExplanation currentPhase={bb84.state?.phase ?? 'idle'} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Help Dialog */}
      <AppHelpDialog
        open={helpOpen}
        onOpenChange={setHelpOpen}
        appName="BB84 Quantum Key Distribution"
        steps={HelpContent()}
      />
    </div>
  );
}
