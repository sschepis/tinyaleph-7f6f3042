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
    <div className="bg-gray-800/50 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-indigo-300">PRIME GENERATOR</h2>
        <span className={`px-3 py-1 rounded-full text-xs ${
          isPoweredOn ? 'bg-green-900/50 text-green-300' : 'bg-indigo-900/50 text-indigo-300'
        }`}>
          {isPoweredOn ? 'ACTIVE' : 'IDLE'}
        </span>
      </div>
      
      {/* Prime selectors */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Alice's Prime</label>
          <select
            value={selectedPrimeAlice}
            onChange={(e) => setSelectedPrimeAlice(parseInt(e.target.value))}
            className="w-full bg-gray-800 rounded px-3 py-2 text-sm border border-gray-700 text-green-300"
          >
            {availablePrimes.map(p => (
              <option key={p} value={p}>p = {p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-2">Bob's Prime</label>
          <select
            value={selectedPrimeBob}
            onChange={(e) => setSelectedPrimeBob(parseInt(e.target.value))}
            className="w-full bg-gray-800 rounded px-3 py-2 text-sm border border-gray-700 text-blue-300"
          >
            {availablePrimes.map(p => (
              <option key={p} value={p}>p = {p}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Spectrum visualization */}
      <div className="relative h-32 mb-4 bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700/30">
        <svg className="w-full h-full">
          {/* Grid lines */}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={`${i * 10}%`}
              y1="0"
              x2={`${i * 10}%`}
              y2="100%"
              stroke="#334155"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0"
              y1={`${i * 20}%`}
              x2="100%"
              y2={`${i * 20}%`}
              stroke="#334155"
              strokeWidth="1"
            />
          ))}
          
          {/* Spectrum path */}
          {isPoweredOn && (
            <motion.path
              d={spectrumPath}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </svg>
      </div>
      
      {/* Prime info */}
      <div className="grid grid-cols-2 text-sm text-gray-400">
        <div>
          <span>Alice p:</span>
          <span className="text-green-300 block text-lg font-mono">{selectedPrimeAlice}</span>
          {alicePrime && (
            <span className="text-[10px] text-gray-500">
              G:({alicePrime.gaussian.a},{alicePrime.gaussian.b.toFixed(0)})
            </span>
          )}
        </div>
        <div className="text-right">
          <span>Bob p:</span>
          <span className="text-blue-300 block text-lg font-mono">{selectedPrimeBob}</span>
          {bobPrime && (
            <span className="text-[10px] text-gray-500">
              G:({bobPrime.gaussian.a},{bobPrime.gaussian.b.toFixed(0)})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
