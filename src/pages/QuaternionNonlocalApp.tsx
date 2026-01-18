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
      <div className="min-h-screen bg-[radial-gradient(circle_at_center,#1e1b4b_0%,#0f172a_100%)] text-gray-100 font-mono p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-600">
                QUATERNIONIC NON-LOCAL TRANSCEIVER
              </h1>
              <p className="text-indigo-300 text-sm">Split Prime Encoded Symbolic Communication System</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <motion.div 
                  className={`w-3 h-3 rounded-full mr-2 ${isPoweredOn ? 'bg-green-500' : 'bg-gray-500'}`}
                  animate={isPoweredOn ? { opacity: [1, 0.5, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-sm">{isPoweredOn ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePowerToggle}
                  className={`px-4 py-2 rounded-md transition-colors flex items-center ${
                    isPoweredOn 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  <Power className="w-4 h-4 mr-2" />
                  {isPoweredOn ? 'SHUTDOWN' : 'POWER'}
                </button>
                <button
                  onClick={() => isRunning ? pause() : start()}
                  disabled={!isPoweredOn}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Radio className="w-4 h-4 mr-2" />
                  TRANSMIT
                </button>
                <HelpButton onClick={() => setShowHelp(true)} />
              </div>
            </div>
          </header>

          {/* Main Dashboard - Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
          <TopologicalNetworkPanel
            isPoweredOn={isPoweredOn}
            entangledPair={entangledPair}
            alicePrime={alicePrime}
            bobPrime={bobPrime}
            time={time}
            transmissionHistory={transmissionHistory}
          />

          {/* System Controls */}
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

          {/* Status Bar */}
          <footer className="mt-6 bg-gray-800 rounded-lg p-2 text-xs flex flex-wrap justify-between items-center">
            <div className="flex items-center px-2 py-1">
              <Cpu className="w-3 h-3 text-gray-400 mr-1" />
              <span>CPU: <span className="text-indigo-300">{isPoweredOn ? `${Math.round(30 + Math.sin(time) * 20)}%` : '0%'}</span></span>
            </div>
            <div className="flex items-center px-2 py-1">
              <HardDrive className="w-3 h-3 text-gray-400 mr-1" />
              <span>MEM: <span className="text-indigo-300">{isPoweredOn ? '1.2GB/4GB' : '0.0GB/4GB'}</span></span>
            </div>
            <div className="flex items-center px-2 py-1">
              <Wifi className="w-3 h-3 text-gray-400 mr-1" />
              <span>TX: <span className="text-indigo-300">{isPoweredOn && isRunning ? `${Math.round(50 + Math.random() * 100)}bps` : '0bps'}</span></span>
            </div>
            <div className="flex items-center px-2 py-1">
              <Satellite className="w-3 h-3 text-gray-400 mr-1" />
              <span>RX: <span className="text-indigo-300">{isPoweredOn && isRunning ? `${Math.round(30 + Math.random() * 80)}bps` : '0bps'}</span></span>
            </div>
            <div className="flex items-center px-2 py-1">
              <Shield className="w-3 h-3 text-gray-400 mr-1" />
              <span>SECURITY: <span className="text-indigo-300">QUATERNION ENCRYPTED</span></span>
            </div>
            <div className="flex items-center px-2 py-1">
              <Clock className="w-3 h-3 text-gray-400 mr-1" />
              <span>UPTIME: <span className="text-indigo-300">{formatUptime(uptime)}</span></span>
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
