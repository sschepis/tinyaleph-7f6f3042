import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useQuaternionNonlocal } from '@/hooks/useQuaternionNonlocal';
import { useFirstRun } from '@/hooks/useFirstRun';
import { AppHelpDialog, HelpButton } from '@/components/app-help';
import { helpSteps } from '@/components/quaternion-nonlocal/HelpContent';
import { motion } from 'framer-motion';
import { 
  Power, 
  Radio, 
  Lock, 
  LockOpen, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Satellite,
  Shield,
  Clock
} from 'lucide-react';

// Import redesigned components
import { PrimeGeneratorPanel } from '@/components/quaternion-nonlocal/PrimeGeneratorPanel';
import { ResonanceControlPanel } from '@/components/quaternion-nonlocal/ResonanceControlPanel';
import { EntropyAnalysisPanel } from '@/components/quaternion-nonlocal/EntropyAnalysisPanel';
import { TransmitterPanel } from '@/components/quaternion-nonlocal/TransmitterPanel';
import { ReceiverPanel } from '@/components/quaternion-nonlocal/ReceiverPanel';
import { TopologicalNetworkPanel } from '@/components/quaternion-nonlocal/TopologicalNetworkPanel';
import { SystemControlsPanel } from '@/components/quaternion-nonlocal/SystemControlsPanel';
import { PrimeExplorerDialog } from '@/components/quaternion-nonlocal/PrimeExplorerDialog';
import { TopologyViewDialog } from '@/components/quaternion-nonlocal/TopologyViewDialog';
import { AdvancedControlsDialog } from '@/components/quaternion-nonlocal/AdvancedControlsDialog';

const QuaternionNonlocalApp = () => {
  const [isFirstRun, markAsSeen] = useFirstRun('quaternion-nonlocal-help');
  const [showHelp, setShowHelp] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  
  // Dialog states
  const [showPrimeExplorer, setShowPrimeExplorer] = useState(false);
  const [showTopologyView, setShowTopologyView] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  useEffect(() => {
    if (isFirstRun) setShowHelp(true);
  }, [isFirstRun]);

  // Uptime counter
  useEffect(() => {
    if (!isPoweredOn) return;
    const interval = setInterval(() => {
      setUptime(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPoweredOn]);

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

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handlePowerToggle = () => {
    if (isPoweredOn) {
      pause();
      setUptime(0);
    } else {
      start();
    }
    setIsPoweredOn(!isPoweredOn);
  };

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground p-2 lg:p-3">
        <div className="max-w-[1920px] mx-auto space-y-2">
          {/* Compact Header */}
          <header className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" />
                Quaternionic Non-Local Transceiver
              </h1>
              <div className="hidden md:flex items-center gap-1.5">
                <motion.div 
                  className={`w-2 h-2 rounded-full ${isPoweredOn ? 'bg-green-500' : 'bg-muted-foreground'}`}
                  animate={isPoweredOn ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-xs text-muted-foreground">{isPoweredOn ? 'ONLINE' : 'OFFLINE'}</span>
                {isPoweredOn && (
                  <>
                    <span className="text-muted-foreground">|</span>
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs text-primary font-mono">{formatUptime(uptime)}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLockToggle}
                className="p-2 rounded-md hover:bg-muted transition-colors"
                title={isLocked ? 'Unlock controls' : 'Lock controls'}
              >
                {isLocked ? <Lock className="w-4 h-4 text-amber-400" /> : <LockOpen className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button
                onClick={handlePowerToggle}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isPoweredOn 
                    ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }`}
              >
                <Power className="w-3 h-3" />
                {isPoweredOn ? 'Stop' : 'Start'}
              </button>
              <HelpButton onClick={() => setShowHelp(true)} />
            </div>
          </header>

          {/* Main Dashboard - Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            <PrimeGeneratorPanel
              isPoweredOn={isPoweredOn}
              selectedPrimeAlice={selectedPrimeAlice}
              selectedPrimeBob={selectedPrimeBob}
              setSelectedPrimeAlice={setSelectedPrimeAlice}
              setSelectedPrimeBob={setSelectedPrimeBob}
              availablePrimes={AVAILABLE_SPLIT_PRIMES}
              alicePrime={alicePrime}
              bobPrime={bobPrime}
              time={time}
            />
            
            <ResonanceControlPanel
              isPoweredOn={isPoweredOn}
              isLocked={isLocked}
              onLockToggle={handleLockToggle}
              twistCoupling={twistCoupling}
              onTwistChange={setTwistCoupling}
              phaseData={phaseData}
              entangledPair={entangledPair}
            />
            
            <EntropyAnalysisPanel
              isPoweredOn={isPoweredOn}
              phaseData={phaseData}
              entangledPair={entangledPair}
              syncEvents={syncEvents}
            />
          </div>

          {/* Transmission Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mt-2">
            <TransmitterPanel
              isPoweredOn={isPoweredOn}
              onTransmit={sendTransmission}
              onMeasure={measureProjection}
              transmissionHistory={transmissionHistory}
              lastProjection={lastProjection}
            />
            
            <ReceiverPanel
              isPoweredOn={isPoweredOn}
              entangledPair={entangledPair}
              phaseData={phaseData}
              transmissionHistory={transmissionHistory}
              syncEvents={syncEvents}
            />
          </div>

          {/* Network Visualization */}
          <div className="mt-2">
            <TopologicalNetworkPanel
              isPoweredOn={isPoweredOn}
              entangledPair={entangledPair}
              alicePrime={alicePrime}
              bobPrime={bobPrime}
              time={time}
              transmissionHistory={transmissionHistory}
            />
          </div>

          {/* System Controls */}
          <div className="mt-2">
            <SystemControlsPanel
              isPoweredOn={isPoweredOn}
              epsilon={epsilon}
              onEpsilonChange={setEpsilon}
              twistCoupling={twistCoupling}
              onTwistChange={setTwistCoupling}
              presets={PRESETS}
              onPresetSelect={applyPreset}
              onReset={reset}
              onOpenPrimeExplorer={() => setShowPrimeExplorer(true)}
              onOpenTopologyView={() => setShowTopologyView(true)}
              onOpenAdvancedControls={() => setShowAdvancedControls(true)}
            />
          </div>

          {/* Status Bar */}
          <footer className="mt-2 bg-card border border-border rounded-lg p-2 text-xs flex flex-wrap justify-between items-center">
            <div className="flex items-center px-2 py-0.5">
              <Cpu className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">CPU: <span className="text-primary font-mono">{isPoweredOn ? `${Math.round(30 + Math.sin(time) * 20)}%` : '0%'}</span></span>
            </div>
            <div className="flex items-center px-2 py-0.5">
              <HardDrive className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">MEM: <span className="text-primary font-mono">{isPoweredOn ? '1.2GB/4GB' : '0.0GB/4GB'}</span></span>
            </div>
            <div className="flex items-center px-2 py-0.5">
              <Wifi className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">TX: <span className="text-primary font-mono">{isPoweredOn && isRunning ? `${Math.round(50 + Math.random() * 100)}bps` : '0bps'}</span></span>
            </div>
            <div className="flex items-center px-2 py-0.5">
              <Satellite className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">RX: <span className="text-primary font-mono">{isPoweredOn && isRunning ? `${Math.round(30 + Math.random() * 80)}bps` : '0bps'}</span></span>
            </div>
            <div className="flex items-center px-2 py-0.5">
              <Shield className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">SECURITY: <span className="text-primary font-mono">QUATERNION ENCRYPTED</span></span>
            </div>
          </footer>
        </div>

        {/* Dialogs */}
        <AppHelpDialog
          open={showHelp}
          onOpenChange={handleCloseHelp}
          steps={helpSteps}
          appName="Quaternionic Non-Local Transceiver"
        />
        
        <PrimeExplorerDialog
          open={showPrimeExplorer}
          onOpenChange={setShowPrimeExplorer}
          availablePrimes={AVAILABLE_SPLIT_PRIMES}
          selectedPrimeAlice={selectedPrimeAlice}
          selectedPrimeBob={selectedPrimeBob}
          onSelectPrime={(prime, target) => {
            if (target === 'alice') setSelectedPrimeAlice(prime);
            else setSelectedPrimeBob(prime);
          }}
        />
        
        <TopologyViewDialog
          open={showTopologyView}
          onOpenChange={setShowTopologyView}
          entangledPair={entangledPair}
          alicePrime={alicePrime}
          bobPrime={bobPrime}
          transmissionHistory={transmissionHistory}
          time={time}
        />
        
        <AdvancedControlsDialog
          open={showAdvancedControls}
          onOpenChange={setShowAdvancedControls}
          epsilon={epsilon}
          onEpsilonChange={setEpsilon}
          twistCoupling={twistCoupling}
          onTwistChange={setTwistCoupling}
          presets={PRESETS}
          onPresetSelect={applyPreset}
          onReset={reset}
          selectedPrimeAlice={selectedPrimeAlice}
          selectedPrimeBob={selectedPrimeBob}
        />
      </div>
    </Layout>
  );
};

export default QuaternionNonlocalApp;
