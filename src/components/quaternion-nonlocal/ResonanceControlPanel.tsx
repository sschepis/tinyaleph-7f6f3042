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
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-primary">Resonance Control</h2>
        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
          isLocked ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
        }`}>
          {isPoweredOn ? (isLocked ? 'LOCKED' : 'SEEKING') : 'OFFLINE'}
        </span>
      </div>
      
      {/* Signal strength meter */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">Signal Strength</span>
          <span className="text-primary">{signalStrength.toFixed(0)}%</span>
        </div>
        <div className="relative h-1.5 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500">
          <motion.div
            className="absolute w-1 h-2.5 -top-0.5 bg-white rounded-sm shadow-lg"
            animate={{ left: `${signalStrength}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>
      
      {/* Lock controls */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Resonance Lock</label>
          <div className="flex items-center gap-2">
            <button
              onClick={onLockToggle}
              disabled={!isPoweredOn}
              className="px-2 py-1 rounded text-[10px] bg-muted hover:bg-muted/80 flex items-center disabled:opacity-50 border border-border"
            >
              {isLocked ? <Lock className="w-3 h-3 mr-1" /> : <LockOpen className="w-3 h-3 mr-1" />}
              {isLocked ? 'UNLOCK' : 'LOCK'}
            </button>
            <div className={`flex-1 px-2 py-1 rounded text-[10px] bg-muted text-center font-mono relative ${
              isLocked ? '' : 'after:absolute after:top-0 after:right-0 after:w-1.5 after:h-1.5 after:rounded-full after:bg-red-500 after:animate-pulse'
            }`}>
              {signalStrength.toFixed(2)}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-[10px] text-muted-foreground mb-1">Twist Coupling γ</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={twistCoupling}
            onChange={(e) => onTwistChange(parseFloat(e.target.value))}
            disabled={!isPoweredOn}
            className="w-full h-1.5 accent-primary"
          />
          <div className="text-[10px] text-primary text-center font-mono">{twistCoupling.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Resonance wave visualization */}
      <div className="relative h-16 rounded-lg overflow-hidden bg-muted/30 border border-border/50">
        <svg className="w-full h-full">
          {isPoweredOn && phaseData && (
            <motion.path
              d={generateResonancePath(phaseData.difference, signalStrength)}
              fill="none"
              stroke="hsl(var(--primary))"
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
  const height = 64;
  const midY = height / 2;
  let d = `M 0 ${midY}`;
  
  for (let x = 0; x < width; x += 3) {
    const y = midY + Math.sin(x * 0.1 + phaseDiff * 2) * (strength / 100) * 25;
    d += ` L ${x} ${y}`;
  }
  
  return d;
}
