import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useEnhancedNonlocal } from '@/hooks/useEnhancedNonlocal';
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
  Clock,
  Link2,
  Unlink,
  Play,
  Pause
} from 'lucide-react';

// Import components
import { NodePanel } from '@/components/quaternion-nonlocal/NodePanel';
import { DualBlochSpheres } from '@/components/quaternion-nonlocal/DualBlochSpheres';
import { CommunicationLog } from '@/components/quaternion-nonlocal/CommunicationLog';

const QuaternionNonlocalApp = () => {
  const [isFirstRun, markAsSeen] = useFirstRun('quaternion-nonlocal-help');
  const [showHelp, setShowHelp] = useState(false);
  const [isPoweredOn, setIsPoweredOn] = useState(false);
  const [uptime, setUptime] = useState(0);

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
    nodeA,
    nodeB,
    entanglementState,
    isEvolving,
    entanglementStrength,
    nonLocalCorrelation,
    quantumCoherence,
    resonanceStrength,
    communicationHistory,
    nodeACommLog,
    nodeBCommLog,
    startEvolution,
    pauseEvolution,
    initEntanglement,
    separateNodes,
    sendMessage,
    reset
  } = useEnhancedNonlocal();

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const handlePowerToggle = () => {
    if (isPoweredOn) {
      pauseEvolution();
      setUptime(0);
      setIsPoweredOn(false);
    } else {
      // Start: Power on, initialize entanglement, evolve, then separate
      setIsPoweredOn(true);
      initEntanglement();
      startEvolution();
      // Separate nodes after entanglement completes (2.5s delay to account for init time)
      setTimeout(() => {
        separateNodes();
      }, 2500);
    }
  };

  const handleEvolutionToggle = () => {
    if (isEvolving) {
      pauseEvolution();
    } else {
      startEvolution();
    }
  };
  
  const handleReset = () => {
    pauseEvolution();
    setUptime(0);
    setIsPoweredOn(false);
    reset();
  };

  const isSeparated = entanglementState === 'separated';
  const isEntangled = entanglementState === 'entangled' || entanglementState === 'separated';

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground p-2 lg:p-4">
        <div className="max-w-[1920px] mx-auto space-y-3">
          {/* Header */}
          <header className="bg-card border border-border rounded-lg p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold flex items-center gap-2">
                  <Radio className="h-5 w-5 text-primary" />
                  Quaternionic Non-Local Communication
                </h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <motion.div 
                    className={`w-2 h-2 rounded-full ${isPoweredOn ? 'bg-green-500' : 'bg-muted-foreground'}`}
                    animate={isPoweredOn ? { opacity: [1, 0.5, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span>{isPoweredOn ? 'ONLINE' : 'OFFLINE'}</span>
                  {isPoweredOn && (
                    <>
                      <span className="text-muted-foreground">|</span>
                      <Clock className="w-3 h-3" />
                      <span className="font-mono text-primary">{formatUptime(uptime)}</span>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Evolution toggle */}
                <button
                  onClick={handleEvolutionToggle}
                  disabled={!isPoweredOn}
                  className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    isEvolving 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isEvolving ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isEvolving ? 'Pause' : 'Evolve'}
                </button>
                
                {/* Power toggle */}
                <button
                  onClick={handlePowerToggle}
                  className={`px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                    isPoweredOn 
                      ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  <Power className="w-3 h-3" />
                  {isPoweredOn ? 'Stop' : 'Start'}
                </button>
                
                {/* Reset button */}
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded text-xs font-medium flex items-center gap-1.5 transition-colors bg-muted hover:bg-muted/80 text-foreground border border-border"
                >
                  Reset
                </button>
                
                <HelpButton onClick={() => setShowHelp(true)} />
              </div>
            </div>
            
            {/* Status Bar */}
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  entanglementState === 'separated' ? 'bg-red-500' :
                  entanglementState === 'entangled' ? 'bg-green-500' :
                  entanglementState === 'initializing' ? 'bg-amber-500' :
                  'bg-muted-foreground'
                }`} />
                <span className="text-muted-foreground">{entanglementState.toUpperCase()}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Entanglement:</span>
                <span className="font-mono text-primary">{entanglementStrength.toFixed(3)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Correlation:</span>
                <span className="font-mono text-primary">{nonLocalCorrelation.toFixed(3)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Coherence:</span>
                <span className="font-mono text-primary">{quantumCoherence.toFixed(3)}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Resonance:</span>
                <span className="font-mono text-primary">{resonanceStrength.toFixed(3)}</span>
              </div>
            </div>
          </header>

          {/* Status Panel */}
          <div className="bg-card border border-border rounded-lg p-3 flex flex-wrap items-center gap-3">
            <div className="text-xs text-muted-foreground">
              {entanglementState === 'disconnected' && 
                "Press Start to initialize entanglement and begin non-local communication."}
              {entanglementState === 'initializing' && 
                "Creating shared quaternionic state..."}
              {entanglementState === 'entangled' && 
                "Nodes entangled! Separating for non-local communication test..."}
              {entanglementState === 'separated' && (
                <span className="text-amber-400">
                  ⚡ Nodes separated but quaternionically entangled! Messages transmit non-locally.
                </span>
              )}
            </div>
          </div>

          {/* Bloch Spheres Visualization */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
              <Satellite className="w-4 h-4" />
              Quaternionic Bloch Spheres
            </h3>
            <DualBlochSpheres 
              nodeA={nodeA}
              nodeB={nodeB}
              isEvolving={isEvolving}
              isSeparated={isSeparated}
            />
          </div>

          {/* Node Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <NodePanel
              node={nodeA}
              isPoweredOn={isPoweredOn}
              isEntangled={isEntangled}
              isSeparated={isSeparated}
              onSendMessage={(msg) => sendMessage('A', msg)}
              commLog={nodeACommLog}
            />
            
            <NodePanel
              node={nodeB}
              isPoweredOn={isPoweredOn}
              isEntangled={isEntangled}
              isSeparated={isSeparated}
              onSendMessage={(msg) => sendMessage('B', msg)}
              commLog={nodeBCommLog}
            />
          </div>

          {/* Communication Log */}
          <CommunicationLog 
            history={communicationHistory}
            isPoweredOn={isPoweredOn}
          />

          {/* Theory Panel */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h3 className="text-sm font-semibold text-primary mb-3">
              Quaternionic Entanglement Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-primary mb-1">
                  Current Phase: {entanglementState.toUpperCase()}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {entanglementState === 'disconnected' && 
                    "Nodes are independent. Initialize entanglement to begin."}
                  {entanglementState === 'initializing' && 
                    "Creating shared quaternionic state with split prime factorizations..."}
                  {entanglementState === 'entangled' && 
                    "Nodes share quaternionic entanglement. Ready for separation test!"}
                  {entanglementState === 'separated' && 
                    "🔥 GOLD STANDARD: Nodes are physically disconnected but quaternionically entangled!"}
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-primary mb-1">Quaternionic Mechanics</h4>
                <p className="text-muted-foreground text-xs">
                  Split primes p≡1 mod 12 provide Gaussian (a+bi) and Eisenstein (c+dω) factorizations. 
                  These embed into quaternions qₚ = a+bi+jc'+dk, creating 4D geometric states with twist dynamics.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-primary mb-1">Non-Local Transmission</h4>
                <p className="text-muted-foreground text-xs">
                  When separated, changes to one node's quaternionic state create anti-correlated responses 
                  in the entangled partner through preserved geometric relationships and octonion channel mixing.
                </p>
              </div>
            </div>
            
            {isSeparated && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 p-3 rounded bg-amber-500/10 border-l-4 border-amber-500"
              >
                <div className="font-medium text-amber-400 mb-1">Non-Local Mode Active</div>
                <div className="text-xs text-muted-foreground">
                  Nodes are physically disconnected. Any messages sent will be transmitted through 
                  quaternionic entanglement correlation - demonstrating non-local communication effects!
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Status */}
          <footer className="bg-card border border-border rounded-lg p-2 text-xs flex flex-wrap justify-between items-center">
            <div className="flex items-center px-2 py-0.5">
              <Cpu className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">CPU: <span className="text-primary font-mono">{isPoweredOn ? `${Math.round(30 + Math.sin(Date.now() * 0.001) * 20)}%` : '0%'}</span></span>
            </div>
            <div className="flex items-center px-2 py-0.5">
              <HardDrive className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">MEM: <span className="text-primary font-mono">{isPoweredOn ? '1.2GB/4GB' : '0.0GB/4GB'}</span></span>
            </div>
            <div className="flex items-center px-2 py-0.5">
              <Wifi className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">TX: <span className="text-primary font-mono">{isPoweredOn && isEvolving ? `${Math.round(50 + Math.random() * 100)}bps` : '0bps'}</span></span>
            </div>
            <div className="flex items-center px-2 py-0.5">
              <Satellite className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">RX: <span className="text-primary font-mono">{isPoweredOn && isEvolving ? `${Math.round(30 + Math.random() * 80)}bps` : '0bps'}</span></span>
            </div>
            <div className="flex items-center px-2 py-0.5">
              <Shield className="w-3 h-3 text-muted-foreground mr-1" />
              <span className="text-muted-foreground">SECURITY: <span className="text-primary font-mono">OCTONION ENCRYPTED</span></span>
            </div>
          </footer>
        </div>

        {/* Help Dialog */}
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
