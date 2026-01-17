import React from 'react';
import { motion } from 'framer-motion';
import { Lock, LockOpen } from 'lucide-react';
import { PhaseData, EntangledPair } from '@/lib/quaternion-nonlocal/types';

interface ResonanceControlPanelProps {
  isPoweredOn: boolean;
  isLocked: boolean;
  onLockToggle: () => void;
  twistCoupling: number;
  onTwistChange: (value: number) => void;
  phaseData: PhaseData | null;
  entangledPair: EntangledPair | null;
}

export function ResonanceControlPanel({
  isPoweredOn,
  isLocked,
  onLockToggle,
  twistCoupling,
  onTwistChange,
  phaseData,
  entangledPair
}: ResonanceControlPanelProps) {
  const signalStrength = phaseData 
    ? Math.max(0, Math.min(100, (1 - Math.abs(phaseData.difference) / Math.PI) * 100))
    : 0;

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-indigo-300">RESONANCE CONTROL</h2>
        <span className={`px-3 py-1 rounded-full text-xs ${
          isLocked ? 'bg-green-900/50 text-green-300' : 'bg-indigo-900/50 text-indigo-300'
        }`}>
          {isPoweredOn ? (isLocked ? 'LOCKED' : 'SEARCHING') : 'OFFLINE'}
        </span>
      </div>
      
      {/* Signal strength meter */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">Signal Strength</span>
          <span className="text-indigo-300">{signalStrength.toFixed(0)}%</span>
        </div>
        <div className="relative h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500">
          <motion.div
            className="absolute w-1 h-3 -top-0.5 bg-white rounded-sm shadow-lg"
            animate={{ left: `${signalStrength}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>
      
      {/* Lock controls */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Resonance Lock</label>
          <div className="flex items-center gap-2">
            <button
              onClick={onLockToggle}
              disabled={!isPoweredOn}
              className="px-3 py-1 rounded text-xs bg-gray-700 hover:bg-gray-600 flex items-center disabled:opacity-50"
            >
              {isLocked ? <Lock className="w-3 h-3 mr-1" /> : <LockOpen className="w-3 h-3 mr-1" />}
              {isLocked ? 'UNLOCK' : 'LOCK'}
            </button>
            <div className={`flex-1 px-2 py-1 rounded text-xs bg-gray-800 text-center relative ${
              isLocked ? '' : 'after:absolute after:top-0 after:right-0 after:w-2 after:h-2 after:rounded-full after:bg-red-500 after:animate-pulse'
            }`}>
              {signalStrength.toFixed(2)}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Twist Coupling γ</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={twistCoupling}
            onChange={(e) => onTwistChange(parseFloat(e.target.value))}
            disabled={!isPoweredOn}
            className="w-full"
          />
          <div className="text-xs text-indigo-300 text-center">{twistCoupling.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Resonance wave visualization */}
      <div className="relative h-20 rounded-lg overflow-hidden bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent bg-[length:200%_100%] animate-[wave_3s_linear_infinite]">
        <svg className="w-full h-full">
          {isPoweredOn && phaseData && (
            <motion.path
              d={generateResonancePath(phaseData.difference, signalStrength)}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

function generateResonancePath(phaseDiff: number, strength: number): string {
  const width = 300;
  const height = 80;
  const midY = height / 2;
  let d = `M 0 ${midY}`;
  
  for (let x = 0; x < width; x += 3) {
    const y = midY + Math.sin(x * 0.1 + phaseDiff * 2) * (strength / 100) * 30;
    d += ` L ${x} ${y}`;
  }
  
  return d;
}
