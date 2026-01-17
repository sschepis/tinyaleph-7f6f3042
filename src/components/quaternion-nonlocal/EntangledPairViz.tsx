import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EntangledPair } from '@/lib/quaternion-nonlocal/types';
import { Link2, Unlink } from 'lucide-react';

interface EntangledPairVizProps {
  pair: EntangledPair | null;
  time: number;
}

export function EntangledPairViz({ pair, time }: EntangledPairVizProps) {
  if (!pair) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="py-8 text-center text-muted-foreground">
          Select primes to create entangled pair
        </CardContent>
      </Card>
    );
  }
  
  const waveOffset = time * 50;
  
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50 overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Entangled Quaternionic Pair</span>
          {pair.isSynchronized ? (
            <Badge className="bg-green-500/20 text-green-400 border-green-500/50">
              <Link2 className="w-3 h-3 mr-1" />
              Phase Locked
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <Unlink className="w-3 h-3 mr-1" />
              Precessing
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-4">
        <div className="relative h-32">
          {/* Entanglement wave */}
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="entangleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(142 76% 36%)" />
                <stop offset="50%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(221 83% 53%)" />
              </linearGradient>
            </defs>
            
            {/* Wave pattern */}
            <motion.path
              d={generateWavePath(waveOffset, pair.correlationStrength)}
              stroke="url(#entangleGrad)"
              strokeWidth={2}
              fill="none"
              opacity={0.6}
            />
            
            {/* Second wave (phase shifted) */}
            <motion.path
              d={generateWavePath(waveOffset + Math.PI, pair.correlationStrength)}
              stroke="url(#entangleGrad)"
              strokeWidth={1.5}
              fill="none"
              opacity={0.3}
              strokeDasharray="4 4"
            />
          </svg>
          
          {/* Alice node */}
          <motion.div
            className="absolute left-4 top-1/2 -translate-y-1/2"
            animate={{ 
              scale: pair.isSynchronized ? [1, 1.1, 1] : 1,
              boxShadow: pair.isSynchronized 
                ? ['0 0 0 0 rgba(34, 197, 94, 0)', '0 0 20px 10px rgba(34, 197, 94, 0.3)', '0 0 0 0 rgba(34, 197, 94, 0)']
                : '0 0 0 0 transparent'
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/30 to-green-600/10 border-2 border-green-500/50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-green-400">Alice</div>
                <div className="text-sm font-bold text-green-300">p={pair.alice.p}</div>
              </div>
            </div>
          </motion.div>
          
          {/* Bob node */}
          <motion.div
            className="absolute right-4 top-1/2 -translate-y-1/2"
            animate={{ 
              scale: pair.isSynchronized ? [1, 1.1, 1] : 1,
              boxShadow: pair.isSynchronized 
                ? ['0 0 0 0 rgba(59, 130, 246, 0)', '0 0 20px 10px rgba(59, 130, 246, 0.3)', '0 0 0 0 rgba(59, 130, 246, 0)']
                : '0 0 0 0 transparent'
            }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/30 to-blue-600/10 border-2 border-blue-500/50 flex items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-blue-400">Bob</div>
                <div className="text-sm font-bold text-blue-300">p={pair.bob.p}</div>
              </div>
            </div>
          </motion.div>
          
          {/* Twist coupling indicator */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
            <div className="text-[10px] text-muted-foreground">Twist Coupling</div>
            <div className="text-sm font-mono text-primary">γ = {pair.twistCoupling.toFixed(2)}</div>
          </div>
        </div>
        
        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
          <div className="p-2 bg-muted/30 rounded text-center">
            <div className="text-muted-foreground">Δφ_q</div>
            <div className="font-mono">{pair.phaseDifference.toFixed(3)} rad</div>
          </div>
          <div className="p-2 bg-muted/30 rounded text-center">
            <div className="text-muted-foreground">Correlation</div>
            <div className="font-mono">{(pair.correlationStrength * 100).toFixed(1)}%</div>
          </div>
          <div className="p-2 bg-muted/30 rounded text-center">
            <div className="text-muted-foreground">H Norm</div>
            <div className="font-mono">
              {Math.sqrt(
                pair.compositeHamiltonian.b ** 2 +
                pair.compositeHamiltonian.c ** 2 +
                pair.compositeHamiltonian.d ** 2
              ).toFixed(3)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function generateWavePath(offset: number, amplitude: number): string {
  const width = 300;
  const height = 128;
  const midY = height / 2;
  const waveAmp = 20 * amplitude;
  
  let d = `M 80 ${midY}`;
  
  for (let x = 80; x <= width - 80; x += 5) {
    const progress = (x - 80) / (width - 160);
    const y = midY + Math.sin(progress * Math.PI * 4 + offset) * waveAmp * Math.sin(progress * Math.PI);
    d += ` L ${x} ${y}`;
  }
  
  return d;
}
