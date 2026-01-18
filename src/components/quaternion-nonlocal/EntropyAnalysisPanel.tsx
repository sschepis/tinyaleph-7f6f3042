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
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-primary">Entropy Analysis</h2>
        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
          isOptimal ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
        }`}>
          {isPoweredOn ? (isOptimal ? 'OPTIMAL' : 'MONITORING') : 'OFFLINE'}
        </span>
      </div>
      
      {/* Entropy gauge */}
      <div className="h-20 relative mb-4">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="10"
            strokeLinecap="round"
          />
          
          {/* Optimal zone */}
          <path
            d="M 53 60 A 80 80 0 0 1 67 52"
            fill="none"
            stroke="rgba(34, 197, 94, 0.3)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          
          {/* Value arc */}
          {isPoweredOn && (
            <motion.path
              d="M 20 90 A 80 80 0 0 1 180 90"
              fill="none"
              stroke={entropyValue < 0.25 ? '#22c55e' : entropyValue < 0.5 ? '#eab308' : '#ef4444'}
              strokeWidth="10"
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
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                opacity="0.5"
              />
            );
          })}
        </svg>
        
        <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 text-center">
          <span className="text-xl font-bold text-primary">{entropyValue.toFixed(2)}</span>
          <div className="text-[9px] text-muted-foreground mt-0.5">OPTIMAL: 0.23-0.27</div>
        </div>
      </div>
      
      {/* Cost breakdown */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <div className="bg-muted rounded p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground mb-0.5">Prime</div>
          <div className="text-primary font-mono text-xs">{primeCost.toFixed(2)}</div>
        </div>
        <div className="bg-muted rounded p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground mb-0.5">Wave</div>
          <div className="text-primary font-mono text-xs">{waveCost.toFixed(2)}</div>
        </div>
        <div className="bg-muted rounded p-1.5 text-center">
          <div className="text-[9px] text-muted-foreground mb-0.5">Noise</div>
          <div className="text-primary font-mono text-xs">{noiseCost.toFixed(2)}</div>
        </div>
      </div>
      
      {/* Signal detected indicator */}
      <motion.div
        className={`px-2 py-1.5 rounded bg-muted text-center text-[10px] ${signalDetected ? '' : 'hidden'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: signalDetected ? 1 : 0 }}
      >
        <span className="text-green-400">
          <Satellite className="w-3 h-3 inline mr-1" />
          SIGNAL DETECTED ({syncEvents.length} events)
        </span>
      </motion.div>
    </div>
  );
}
