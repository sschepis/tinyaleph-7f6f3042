import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Satellite, Zap } from 'lucide-react';
import { EntangledPair, PhaseData, TransmissionEvent } from '@/lib/quaternion-nonlocal/types';

interface ReceiverPanelProps {
  isPoweredOn: boolean;
  entangledPair: EntangledPair | null;
  phaseData: PhaseData | null;
  transmissionHistory: TransmissionEvent[];
  syncEvents: number[];
}

export function ReceiverPanel({
  isPoweredOn,
  entangledPair,
  phaseData,
  transmissionHistory,
  syncEvents
}: ReceiverPanelProps) {
  const isReceiving = isPoweredOn && transmissionHistory.length > 0;
  const lastLock = transmissionHistory.filter(t => t.phaseLockAchieved).pop();
  
  const integrity = phaseData 
    ? Math.max(0, (1 - Math.abs(phaseData.difference) / Math.PI) * 100).toFixed(0)
    : '100';
  
  const messageEntropy = entangledPair
    ? (0.1 + entangledPair.correlationStrength * 0.1).toFixed(4)
    : '0.0000';

  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-primary">Receiver</h2>
        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
          isReceiving ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
        }`}>
          {isPoweredOn ? 'LISTENING' : 'OFFLINE'}
        </span>
      </div>
      
      {/* Receiver display */}
      <div className="relative mb-3">
        <div className="w-full h-24 bg-muted/50 rounded p-2 text-xs font-mono overflow-y-auto border border-border">
          <AnimatePresence mode="wait">
            {!isPoweredOn || transmissionHistory.length === 0 ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-muted-foreground py-6"
              >
                <Satellite className="w-5 h-5 mx-auto mb-1" />
                <div className="text-[10px]">Waiting for signal...</div>
              </motion.div>
            ) : (
              <motion.div
                key="receiving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1"
              >
                {/* Active receiver indicator */}
                {phaseData?.isLocked && (
                  <motion.div 
                    className="text-center mb-1"
                    animate={{ color: ['hsl(var(--primary))', 'hsl(var(--primary) / 0.7)', 'hsl(var(--primary))'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-6 h-6 mx-auto text-green-400" />
                  </motion.div>
                )}
                
                {/* Display received primes */}
                {transmissionHistory.slice(-3).reverse().map((tx, i) => (
                  <div key={i} className={`p-1.5 rounded ${tx.phaseLockAchieved ? 'bg-green-500/10' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${tx.sender === 'alice' ? 'bg-green-400' : 'bg-cyan-400'}`} />
                      <span className="text-[10px] text-muted-foreground">{tx.sender.toUpperCase()}</span>
                      <span className="text-primary text-[10px]">p = {tx.prime.p}</span>
                      {tx.phaseLockAchieved && <span className="text-green-400 text-[9px]">LOCKED</span>}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Integrity metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="text-[10px] text-muted-foreground">
          <span>Integrity:</span>
          <span className="text-primary ml-1 font-mono">{integrity}%</span>
        </div>
        <div className="text-[10px] text-muted-foreground text-right">
          <span>Entropy:</span>
          <span className="text-primary ml-1 font-mono">{messageEntropy}</span>
        </div>
      </div>
      
      {/* Signal log */}
      <div className="pt-3 border-t border-border">
        <div className="text-[10px] text-muted-foreground mb-1">Signal Log</div>
        <div className="h-16 overflow-y-auto text-[10px] font-mono bg-muted/50 p-1.5 rounded border border-border">
          <div className="text-muted-foreground">[SYS] Receiver ready</div>
          {syncEvents.slice(-5).map((t, i) => (
            <div key={i} className="text-green-400">
              [t={t.toFixed(2)}s] Phase lock
            </div>
          ))}
          {transmissionHistory.slice(-3).reverse().map((tx, i) => (
            <div key={`tx-${i}`} className={tx.phaseLockAchieved ? 'text-green-400' : 'text-muted-foreground'}>
              [{new Date(tx.timestamp).toLocaleTimeString()}] <span className="text-green-400">RX</span>: p={tx.prime.p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
