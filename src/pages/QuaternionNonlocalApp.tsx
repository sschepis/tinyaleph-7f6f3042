import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useQuaternionNonlocal } from '@/hooks/useQuaternionNonlocal';
import { useFirstRun } from '@/hooks/useFirstRun';
import { AppHelpDialog, HelpButton } from '@/components/app-help';
import {
  PrimeSelector,
  BlochSphereViz,
  EntangledPairViz,
  PhaseSyncMeter,
  ControlPanel,
  ProjectionPanel,
  helpSteps
} from '@/components/quaternion-nonlocal';

const QuaternionNonlocalApp = () => {
  const [isFirstRun, markAsSeen] = useFirstRun('quaternion-nonlocal-help');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isFirstRun) setShowHelp(true);
  }, [isFirstRun]);

  const handleCloseHelp = (open: boolean) => {
    setShowHelp(open);
    if (!open && isFirstRun) markAsSeen();
  };

  const {
    selectedPrimeAlice, selectedPrimeBob,
    setSelectedPrimeAlice, setSelectedPrimeBob,
    twistCoupling, setTwistCoupling,
    epsilon, setEpsilon,
    isRunning, time,
    entangledPair, phaseData,
    transmissionHistory, syncEvents, lastProjection,
    alicePrime, bobPrime,
    start, pause, reset,
    sendTransmission, measureProjection, applyPreset,
    AVAILABLE_SPLIT_PRIMES, PRESETS
  } = useQuaternionNonlocal();

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Quaternionic Non-Local Communication</h1>
              <p className="text-sm text-muted-foreground">
                Split prime embedding • Bloch dynamics • Entangled transmission
              </p>
            </div>
            <HelpButton onClick={() => setShowHelp(true)} />
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Left: Prime selectors */}
            <div className="space-y-4">
              <PrimeSelector
                label="Alice's Prime"
                selectedPrime={selectedPrimeAlice}
                onSelect={setSelectedPrimeAlice}
                primeData={alicePrime}
                availablePrimes={AVAILABLE_SPLIT_PRIMES}
                color="bg-green-500"
              />
              <PrimeSelector
                label="Bob's Prime"
                selectedPrime={selectedPrimeBob}
                onSelect={setSelectedPrimeBob}
                primeData={bobPrime}
                availablePrimes={AVAILABLE_SPLIT_PRIMES}
                color="bg-blue-500"
              />
              <ControlPanel
                isRunning={isRunning}
                time={time}
                twistCoupling={twistCoupling}
                epsilon={epsilon}
                onStart={start}
                onPause={pause}
                onReset={reset}
                onTwistChange={setTwistCoupling}
                onEpsilonChange={setEpsilon}
                onTransmit={sendTransmission}
                onMeasure={measureProjection}
                onPreset={applyPreset}
                presets={PRESETS}
              />
            </div>

            {/* Center: Visualizations */}
            <div className="lg:col-span-2 space-y-4">
              <EntangledPairViz pair={entangledPair} time={time} />
              <BlochSphereViz alice={alicePrime} bob={bobPrime} time={time} />
            </div>

            {/* Right: Phase and projection */}
            <div className="space-y-4">
              <PhaseSyncMeter
                phaseData={phaseData}
                epsilon={epsilon}
                syncEvents={syncEvents}
              />
              <ProjectionPanel
                lastProjection={lastProjection}
                transmissionHistory={transmissionHistory}
              />
            </div>
          </div>
        </div>

        <AppHelpDialog
          open={showHelp}
          onOpenChange={handleCloseHelp}
          steps={helpSteps}
          appName="Quaternionic Non-Local Communication"
        />
      </div>
    </Layout>
  );
};

export default QuaternionNonlocalApp;
