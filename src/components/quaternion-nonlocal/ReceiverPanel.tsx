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
    <div className="bg-gray-800/50 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-indigo-300">RECEIVER</h2>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs ${
            isReceiving ? 'bg-purple-900/50 text-purple-300' : 'bg-gray-700 text-gray-400'
          }`}>
            {isPoweredOn ? 'LISTENING' : 'OFFLINE'}
          </span>
        </div>
      </div>
      
      {/* Receiver display */}
      <div className="relative mb-4">
        <div className="w-full h-32 bg-gray-900 rounded p-3 text-sm font-mono overflow-y-auto border border-gray-700">
          <AnimatePresence mode="wait">
            {!isPoweredOn || transmissionHistory.length === 0 ? (
              <motion.div
                key="waiting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-gray-600 py-8"
              >
                <Satellite className="w-6 h-6 mx-auto mb-2" />
                <div className="text-sm">Waiting for incoming signal...</div>
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
                    className="text-center mb-2"
                    animate={{ color: ['#818cf8', '#a78bfa', '#818cf8'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Zap className="w-8 h-8 mx-auto text-green-400" />
                  </motion.div>
                )}
                
                {/* Display received primes */}
                {transmissionHistory.slice(-3).reverse().map((tx, i) => (
                  <div key={i} className={`p-2 rounded ${tx.phaseLockAchieved ? 'bg-green-900/20' : 'bg-gray-800/50'}`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${tx.sender === 'alice' ? 'bg-green-400' : 'bg-blue-400'}`} />
                      <span className="text-xs text-gray-400">{tx.sender.toUpperCase()}</span>
                      <span className="text-indigo-300">p = {tx.prime.p}</span>
                      {tx.phaseLockAchieved && <span className="text-green-400 text-xs">LOCKED</span>}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">
                      q = {tx.prime.quaternion.a.toFixed(2)} + {tx.prime.quaternion.b.toFixed(2)}i + {tx.prime.quaternion.c.toFixed(2)}j + {tx.prime.quaternion.d.toFixed(2)}k
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Integrity metrics */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="text-xs text-gray-400">
          <span>Message Integrity:</span>
          <span className="text-indigo-300 ml-1">{integrity}%</span>
        </div>
        <div className="text-xs text-gray-400 text-right">
          <span>Entropy:</span>
          <span className="text-indigo-300 ml-1">{messageEntropy}</span>
        </div>
      </div>
      
      {/* Signal log */}
      <div className="pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 mb-2">Signal Log</div>
        <div className="h-20 overflow-y-auto text-xs font-mono bg-gray-900 p-2 rounded border border-gray-700">
          <div className="text-gray-500">[SYSTEM] Receiver initialized</div>
          {syncEvents.slice(-5).map((t, i) => (
            <div key={i} className="text-green-400">
              [t={t.toFixed(2)}s] Phase lock achieved
            </div>
          ))}
          {transmissionHistory.slice(-3).reverse().map((tx, i) => (
            <div key={`tx-${i}`} className={tx.phaseLockAchieved ? 'text-green-400' : 'text-gray-400'}>
              [{new Date(tx.timestamp).toLocaleTimeString()}] <span className="text-green-400">RX</span>: p={tx.prime.p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
