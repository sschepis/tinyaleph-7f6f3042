import React, { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Dna, Atom, Zap, Grid3X3 } from 'lucide-react';

interface PrimeExplorerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availablePrimes: number[];
  selectedPrimeAlice: number;
  selectedPrimeBob: number;
  onSelectPrime: (prime: number, target: 'alice' | 'bob') => void;
}

// Check if p ≡ 1 (mod 12) - split prime condition
const isSplitPrime = (p: number): boolean => p % 12 === 1;

// Simple primality check
const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
};

// Get Gaussian factorization info
const getGaussianInfo = (p: number): { a: number; b: number } | null => {
  if (!isSplitPrime(p)) return null;
  // Find a² + b² = p
  for (let a = 1; a < Math.sqrt(p); a++) {
    const bSquared = p - a * a;
    const b = Math.sqrt(bSquared);
    if (b === Math.floor(b)) {
      return { a, b };
    }
  }
  return null;
};

export function PrimeExplorerDialog({
  open,
  onOpenChange,
  availablePrimes,
  selectedPrimeAlice,
  selectedPrimeBob,
  onSelectPrime
}: PrimeExplorerDialogProps) {
  // Generate extended prime data
  const primeData = useMemo(() => {
    return availablePrimes.map(p => ({
      prime: p,
      mod12: p % 12,
      isSplit: isSplitPrime(p),
      gaussian: getGaussianInfo(p),
      quadraticResidue: p % 4 === 1
    }));
  }, [availablePrimes]);

  // Generate prime spiral visualization data
  const spiralNodes = useMemo(() => {
    return primeData.map((data, i) => {
      const angle = (i / primeData.length) * Math.PI * 4;
      const radius = 30 + i * 8;
      return {
        ...data,
        x: 200 + Math.cos(angle) * radius,
        y: 150 + Math.sin(angle) * radius
      };
    });
  }, [primeData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-gray-900 border-indigo-500/30 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-2xl text-indigo-300 flex items-center gap-2">
            <Dna className="w-6 h-6" />
            Prime Explorer
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prime Spiral Visualization */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Atom className="w-4 h-4" />
              Split Prime Spiral
            </h3>
            <div className="relative h-72 bg-gray-900/50 rounded-lg overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 300">
                {/* Grid */}
                <defs>
                  <pattern id="explorerGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="400" height="300" fill="url(#explorerGrid)" />
                
                {/* Connection spiral */}
                <path
                  d={`M ${spiralNodes[0]?.x || 200} ${spiralNodes[0]?.y || 150} ${spiralNodes.map(n => `L ${n.x} ${n.y}`).join(' ')}`}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="1"
                  opacity="0.3"
                />
                
                {/* Prime nodes */}
                {spiralNodes.map((node, i) => (
                  <g key={node.prime}>
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={node.prime === selectedPrimeAlice || node.prime === selectedPrimeBob ? 12 : 8}
                      fill={
                        node.prime === selectedPrimeAlice ? '#22c55e' :
                        node.prime === selectedPrimeBob ? '#3b82f6' :
                        node.isSplit ? '#a855f7' : '#6b7280'
                      }
                      className="cursor-pointer"
                      whileHover={{ scale: 1.3 }}
                      onClick={() => onSelectPrime(node.prime, 'alice')}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onSelectPrime(node.prime, 'bob');
                      }}
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      fill="white"
                      fontSize="8"
                      textAnchor="middle"
                      dominantBaseline="central"
                      pointerEvents="none"
                    >
                      {node.prime}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                Click: Alice | Right-click: Bob
              </div>
            </div>
          </div>

          {/* Prime Properties Table */}
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Split Prime Properties
            </h3>
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-gray-800">
                  <tr className="text-gray-400">
                    <th className="text-left py-2 px-2">p</th>
                    <th className="text-left py-2 px-2">p mod 12</th>
                    <th className="text-left py-2 px-2">Gaussian</th>
                    <th className="text-left py-2 px-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {primeData.map(data => (
                    <tr 
                      key={data.prime}
                      className={`border-t border-gray-700/30 hover:bg-gray-700/30 cursor-pointer transition-colors ${
                        data.prime === selectedPrimeAlice ? 'bg-green-900/30' :
                        data.prime === selectedPrimeBob ? 'bg-blue-900/30' : ''
                      }`}
                      onClick={() => onSelectPrime(data.prime, 'alice')}
                    >
                      <td className="py-2 px-2 font-mono text-indigo-300">{data.prime}</td>
                      <td className="py-2 px-2 font-mono">
                        <span className={data.isSplit ? 'text-purple-400' : 'text-gray-500'}>
                          ≡ {data.mod12}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-mono">
                        {data.gaussian ? (
                          <span className="text-cyan-400">
                            ({data.gaussian.a} + {data.gaussian.b}i)
                          </span>
                        ) : (
                          <span className="text-gray-500">—</span>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        {data.prime === selectedPrimeAlice && (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Alice</span>
                        )}
                        {data.prime === selectedPrimeBob && (
                          <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">Bob</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Current Selection Info */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-green-900/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-semibold">Alice's Prime</span>
            </div>
            <div className="text-2xl font-mono text-green-300">{selectedPrimeAlice}</div>
            {getGaussianInfo(selectedPrimeAlice) && (
              <div className="text-xs text-green-400/70 mt-1">
                = ({getGaussianInfo(selectedPrimeAlice)!.a} + {getGaussianInfo(selectedPrimeAlice)!.b}i)({getGaussianInfo(selectedPrimeAlice)!.a} - {getGaussianInfo(selectedPrimeAlice)!.b}i)
              </div>
            )}
          </div>
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/30">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 font-semibold">Bob's Prime</span>
            </div>
            <div className="text-2xl font-mono text-blue-300">{selectedPrimeBob}</div>
            {getGaussianInfo(selectedPrimeBob) && (
              <div className="text-xs text-blue-400/70 mt-1">
                = ({getGaussianInfo(selectedPrimeBob)!.a} + {getGaussianInfo(selectedPrimeBob)!.b}i)({getGaussianInfo(selectedPrimeBob)!.a} - {getGaussianInfo(selectedPrimeBob)!.b}i)
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
