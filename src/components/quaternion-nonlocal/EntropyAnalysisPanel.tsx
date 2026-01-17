import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Satellite } from 'lucide-react';
import { PhaseData, EntangledPair } from '@/lib/quaternion-nonlocal/types';

interface EntropyAnalysisPanelProps {
  isPoweredOn: boolean;
  phaseData: PhaseData | null;
  entangledPair: EntangledPair | null;
  syncEvents: number[];
}

export function EntropyAnalysisPanel({
  isPoweredOn,
  phaseData,
  entangledPair,
  syncEvents
}: EntropyAnalysisPanelProps) {
  // Calculate entropy value based on phase coherence
  const entropyValue = useMemo(() => {
    if (!phaseData || !entangledPair) return 0.5;
    return Math.max(0, Math.min(1, 0.3 - entangledPair.correlationStrength * 0.3 + Math.random() * 0.05));
  }, [phaseData, entangledPair]);

  const isOptimal = entropyValue >= 0.23 && entropyValue <= 0.27;
  const signalDetected = isPoweredOn && phaseData?.isLocked;

  // Costs
  const primeCost = entangledPair ? (entangledPair.alice.p % 10) / 100 : 0.05;
  const waveCost = phaseData ? Math.abs(phaseData.difference) / (Math.PI * 10) : 0.08;
  const noiseCost = entropyValue * 0.2;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-indigo-300">ENTROPY ANALYSIS</h2>
        <span className={`px-3 py-1 rounded-full text-xs ${
          isOptimal ? 'bg-green-900/50 text-green-300' : 'bg-indigo-900/50 text-indigo-300'
        }`}>
          {isPoweredOn ? (isOptimal ? 'OPTIMAL' : 'MONITORING') : 'OFFLINE'}
        </span>
      </div>
      
      {/* Entropy gauge */}
      <div className="h-24 relative mb-6">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#334155"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Optimal zone */}
          <path
            d="M 53 60 A 80 80 0 0 1 67 52"
            fill="none"
            stroke="rgba(16, 185, 129, 0.3)"
            strokeWidth="14"
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          {isPoweredOn && (
            <motion.path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke={entropyValue < 0.25 ? '#4ade80' : entropyValue < 0.5 ? '#facc15' : '#f87171'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${entropyValue * 251} 251`}
              initial={{ strokeDasharray: '0 251' }}
              animate={{ strokeDasharray: `${entropyValue * 251} 251` }}
            />
          )}
          
          {/* Tick marks */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
            const angle = Math.PI - tick * Math.PI;
            const x1 = 100 + Math.cos(angle) * 70;
            const y1 = 90 - Math.sin(angle) * 70;
            const x2 = 100 + Math.cos(angle) * 80;
            const y2 = 90 - Math.sin(angle) * 80;
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#4b5563"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 text-center">
          <span className="text-2xl font-bold text-indigo-300">{entropyValue.toFixed(2)}</span>
          <div className="text-xs text-gray-400 mt-1">OPTIMAL RANGE: 0.23-0.27</div>
        </div>
      </div>
      
      {/* Cost breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-gray-800 rounded p-2 text-center">
          <div className="text-xs text-gray-400 mb-1">Prime Cost</div>
          <div className="text-indigo-300 font-mono">{primeCost.toFixed(2)}</div>
        </div>
        <div className="bg-gray-800 rounded p-2 text-center">
          <div className="text-xs text-gray-400 mb-1">Wave Cost</div>
          <div className="text-indigo-300 font-mono">{waveCost.toFixed(2)}</div>
        </div>
        <div className="bg-gray-800 rounded p-2 text-center">
          <div className="text-xs text-gray-400 mb-1">Noise Cost</div>
          <div className="text-indigo-300 font-mono">{noiseCost.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Signal detected indicator */}
      <motion.div
        className={`px-3 py-2 rounded bg-gray-800 text-center text-xs ${signalDetected ? '' : 'hidden'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: signalDetected ? 1 : 0 }}
      >
        <span className="text-green-400">
          <Satellite className="w-4 h-4 inline mr-1" />
          SIGNAL DETECTED ({syncEvents.length} events)
        </span>
      </motion.div>
    </div>
  );
}
