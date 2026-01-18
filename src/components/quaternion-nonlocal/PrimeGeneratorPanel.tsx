import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SplitPrime } from '@/lib/quaternion-nonlocal/types';

interface PrimeGeneratorPanelProps {
  isPoweredOn: boolean;
  selectedPrimeAlice: number;
  selectedPrimeBob: number;
  setSelectedPrimeAlice: (p: number) => void;
  setSelectedPrimeBob: (p: number) => void;
  availablePrimes: number[];
  alicePrime: SplitPrime | null;
  bobPrime: SplitPrime | null;
  time: number;
}

export function PrimeGeneratorPanel({
  isPoweredOn,
  selectedPrimeAlice,
  selectedPrimeBob,
  setSelectedPrimeAlice,
  setSelectedPrimeBob,
  availablePrimes,
  alicePrime,
  bobPrime,
  time
}: PrimeGeneratorPanelProps) {
  // Generate spectrum data
  const spectrumPath = useMemo(() => {
    const width = 300;
    const height = 120;
    const midY = height / 2;
    let d = `M 0 ${midY}`;
    
    for (let x = 0; x < width; x += 3) {
      const primeFreq = Math.sin(x * 0.05 + time * 2) * 0.8 + 
                       Math.sin(x * 0.12 + time) * 0.5;
      const y = midY - primeFreq * (height / 3);
      d += ` L ${x} ${y}`;
    }
    
    return d;
  }, [time]);

  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-primary">Prime Generator</h2>
        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
          isPoweredOn ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'
        }`}>
          {isPoweredOn ? 'ACTIVE' : 'IDLE'}
        </span>
      </div>
      
      {/* Prime selectors */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Alice's Prime</label>
          <select
            value={selectedPrimeAlice}
            onChange={(e) => setSelectedPrimeAlice(parseInt(e.target.value))}
            className="w-full bg-muted rounded px-2 py-1.5 text-xs border border-border text-green-400"
          >
            {availablePrimes.map(p => (
              <option key={p} value={p}>p = {p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">Bob's Prime</label>
          <select
            value={selectedPrimeBob}
            onChange={(e) => setSelectedPrimeBob(parseInt(e.target.value))}
            className="w-full bg-muted rounded px-2 py-1.5 text-xs border border-border text-cyan-400"
          >
            {availablePrimes.map(p => (
              <option key={p} value={p}>p = {p}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Spectrum visualization */}
      <div className="relative h-24 mb-3 bg-muted/50 rounded-lg overflow-hidden border border-border/50">
        <svg className="w-full h-full">
          {/* Grid lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${i * 10}%`}
              y1="0"
              x2={`${i * 10}%`}
              y2="100%"
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={`${i * 20}%`}
              x2="100%"
              y2={`${i * 20}%`}
              stroke="hsl(var(--border))"
              strokeWidth="1"
              opacity="0.3"
            />
          ))}
          
          {/* Spectrum path */}
          {isPoweredOn && (
            <motion.path
              d={spectrumPath}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </svg>
      </div>
      
      {/* Prime info */}
      <div className="grid grid-cols-2 text-xs text-muted-foreground">
        <div>
          <span>Alice p:</span>
          <span className="text-green-400 block text-base font-mono">{selectedPrimeAlice}</span>
          {alicePrime && (
            <span className="text-[9px] text-muted-foreground">
              G:({alicePrime.gaussian.a},{alicePrime.gaussian.b.toFixed(0)})
            </span>
          )}
        </div>
        <div className="text-right">
          <span>Bob p:</span>
          <span className="text-cyan-400 block text-base font-mono">{selectedPrimeBob}</span>
          {bobPrime && (
            <span className="text-[9px] text-muted-foreground">
              G:({bobPrime.gaussian.a},{bobPrime.gaussian.b.toFixed(0)})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
