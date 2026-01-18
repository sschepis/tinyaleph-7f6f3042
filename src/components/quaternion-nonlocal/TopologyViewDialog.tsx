import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Network, Layers, GitBranch, RotateCcw } from 'lucide-react';
import { EntangledPair, SplitPrime, TransmissionEvent } from '@/lib/quaternion-nonlocal/types';

interface TopologyViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entangledPair: EntangledPair | null;
  alicePrime: SplitPrime | null;
  bobPrime: SplitPrime | null;
  transmissionHistory: TransmissionEvent[];
  time: number;
}

type ViewMode = 'network' | 'fiber' | 'phase';

export function TopologyViewDialog({
  open,
  onOpenChange,
  entangledPair,
  alicePrime,
  bobPrime,
  transmissionHistory,
  time
}: TopologyViewDialogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('network');
  const [rotation, setRotation] = useState(0);

  // Generate fiber bundle visualization
  const fiberData = useMemo(() => {
    if (!alicePrime || !bobPrime) return [];
    
    const fibers: { x: number; y: number; z: number; phase: number }[] = [];
    const baseRadius = 80;
    
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const phase = (angle + time * 0.5) % (Math.PI * 2);
      const z = Math.sin(phase) * 30;
      
      fibers.push({
        x: 200 + Math.cos(angle + rotation) * baseRadius,
        y: 150 + Math.sin(angle + rotation) * (baseRadius * 0.6) + z * 0.3,
        z,
        phase
      });
    }
    
    return fibers;
  }, [alicePrime, bobPrime, time, rotation]);

  // Generate phase space trajectory
  const phaseTrajectory = useMemo(() => {
    if (!entangledPair) return '';
    
    const points: string[] = [];
    for (let t = 0; t < 100; t++) {
      const phase = (t / 100) * Math.PI * 4 + time;
      const r = 50 + Math.sin(phase * 2) * 30;
      const x = 200 + Math.cos(phase) * r;
      const y = 150 + Math.sin(phase) * r * 0.7;
      points.push(t === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
    }
    return points.join(' ');
  }, [entangledPair, time]);

  // Network graph data
  const networkNodes = useMemo(() => {
    const nodes: { id: string; x: number; y: number; type: string; value: number }[] = [];
    
    if (alicePrime) {
      nodes.push({ id: 'alice', x: 100, y: 150, type: 'primary', value: alicePrime.p });
    }
    if (bobPrime) {
      nodes.push({ id: 'bob', x: 300, y: 150, type: 'primary', value: bobPrime.p });
    }
    
    // Add intermediate nodes representing quaternion components
    if (entangledPair) {
      const q = entangledPair.alice.quaternion;
      nodes.push({ id: 'q0', x: 150, y: 80, type: 'quaternion', value: q.a });
      nodes.push({ id: 'q1', x: 250, y: 80, type: 'quaternion', value: q.b });
      nodes.push({ id: 'q2', x: 150, y: 220, type: 'quaternion', value: q.c });
      nodes.push({ id: 'q3', x: 250, y: 220, type: 'quaternion', value: q.d });
    }
    
    // Add transmission nodes
    transmissionHistory.slice(-4).forEach((tx, i) => {
      nodes.push({
        id: `tx-${i}`,
        x: 200 + Math.cos(i * Math.PI / 2) * 100,
        y: 150 + Math.sin(i * Math.PI / 2) * 60,
        type: 'transmission',
        value: tx.prime.p
      });
    });
    
    return nodes;
  }, [alicePrime, bobPrime, entangledPair, transmissionHistory]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center gap-2">
            <Network className="w-6 h-6" />
            Topology Viewer
          </DialogTitle>
        </DialogHeader>

        {/* View Mode Selector */}
        <div className="flex gap-2 mb-4">
          {[
            { mode: 'network' as ViewMode, icon: Network, label: 'Network Graph' },
            { mode: 'fiber' as ViewMode, icon: Layers, label: 'Fiber Bundle' },
            { mode: 'phase' as ViewMode, icon: GitBranch, label: 'Phase Space' }
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === mode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          
          <button
            onClick={() => setRotation(r => r + Math.PI / 6)}
            className="ml-auto px-3 py-2 bg-card hover:bg-muted rounded-lg text-muted-foreground"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Main Visualization */}
        <div className="bg-card/50 rounded-xl p-4 border border-border">
          <div className="relative h-80 bg-background/50 rounded-lg overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 400 300">
              {/* Grid */}
              <defs>
                <pattern id="topoGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />
                </pattern>
                <linearGradient id="fiberGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
              <rect width="400" height="300" fill="url(#topoGrid)" />

              {viewMode === 'network' && (
                <>
                  {/* Network edges */}
                  {networkNodes.length >= 2 && (
                    <>
                      <line x1="100" y1="150" x2="300" y2="150" stroke="hsl(var(--primary))" strokeWidth="2" opacity="0.5" />
                      {networkNodes.filter(n => n.type === 'quaternion').map(node => (
                        <g key={node.id}>
                          <line x1="100" y1="150" x2={node.x} y2={node.y} stroke="#22c55e" strokeWidth="1" opacity="0.3" />
                          <line x1="300" y1="150" x2={node.x} y2={node.y} stroke="#3b82f6" strokeWidth="1" opacity="0.3" />
                        </g>
                      ))}
                    </>
                  )}
                  
                  {/* Network nodes */}
                  {networkNodes.map(node => (
                    <g key={node.id}>
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={node.type === 'primary' ? 20 : node.type === 'quaternion' ? 12 : 8}
                        fill={
                          node.type === 'primary' 
                            ? (node.id === 'alice' ? '#22c55e' : '#3b82f6')
                            : node.type === 'quaternion' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'
                        }
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <text
                        x={node.x}
                        y={node.y}
                        fill="white"
                        fontSize={node.type === 'primary' ? 12 : 8}
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        {node.type === 'primary' 
                          ? node.id.charAt(0).toUpperCase()
                          : node.value.toFixed(2)}
                      </text>
                    </g>
                  ))}
                </>
              )}

              {viewMode === 'fiber' && (
                <>
                  {/* Fiber bundle base circle */}
                  <ellipse cx="200" cy="150" rx="80" ry="48" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
                  
                  {/* Fiber strands */}
                  {fiberData.map((fiber, i) => (
                    <g key={i}>
                      {/* Vertical fiber */}
                      <motion.line
                        x1={fiber.x}
                        y1={fiber.y - 30}
                        x2={fiber.x}
                        y2={fiber.y + 30}
                        stroke={`hsl(${(fiber.phase / (Math.PI * 2)) * 360}, 70%, 60%)`}
                        strokeWidth="2"
                        opacity={0.6}
                        animate={{ y1: [fiber.y - 30, fiber.y - 35, fiber.y - 30] }}
                        transition={{ duration: 1 + i * 0.1, repeat: Infinity }}
                      />
                      {/* Base point */}
                      <circle
                        cx={fiber.x}
                        cy={fiber.y}
                        r="3"
                        fill={`hsl(${(fiber.phase / (Math.PI * 2)) * 360}, 70%, 60%)`}
                      />
                    </g>
                  ))}
                  
                  {/* Alice and Bob markers */}
                  <circle cx="120" cy="150" r="10" fill="#22c55e" />
                  <text x="120" y="150" fill="white" fontSize="10" textAnchor="middle" dominantBaseline="central">A</text>
                  <circle cx="280" cy="150" r="10" fill="#3b82f6" />
                  <text x="280" y="150" fill="white" fontSize="10" textAnchor="middle" dominantBaseline="central">B</text>
                </>
              )}

              {viewMode === 'phase' && (
                <>
                  {/* Phase space axes */}
                  <line x1="50" y1="150" x2="350" y2="150" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
                  <line x1="200" y1="50" x2="200" y2="250" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" />
                  
                  {/* Phase trajectory */}
                  <motion.path
                    d={phaseTrajectory}
                    fill="none"
                    stroke="url(#fiberGrad)"
                    strokeWidth="2"
                    opacity="0.8"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2 }}
                  />
                  
                  {/* Current phase point */}
                  {entangledPair && (
                    <motion.circle
                      cx={200 + Math.cos(time) * 60}
                      cy={150 + Math.sin(time) * 40}
                      r="6"
                      fill="hsl(var(--primary))"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                  )}
                  
                  {/* Labels */}
                  <text x="340" y="145" fill="hsl(var(--muted-foreground))" fontSize="10">φ₁</text>
                  <text x="205" y="60" fill="hsl(var(--muted-foreground))" fontSize="10">φ₂</text>
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="bg-card/50 rounded-lg p-3 border border-border">
            <div className="text-muted-foreground mb-1">Entanglement</div>
            <div className={`text-lg font-mono ${entangledPair?.isSynchronized ? 'text-green-400' : 'text-yellow-400'}`}>
              {entangledPair?.isSynchronized ? 'SYNCHRONIZED' : 'DECOHERED'}
            </div>
          </div>
          <div className="bg-card/50 rounded-lg p-3 border border-border">
            <div className="text-muted-foreground mb-1">Twist Coupling</div>
            <div className="text-lg font-mono text-primary">
              γ = {entangledPair?.twistCoupling.toFixed(3) || '0.000'}
            </div>
          </div>
          <div className="bg-card/50 rounded-lg p-3 border border-border">
            <div className="text-muted-foreground mb-1">Transmissions</div>
            <div className="text-lg font-mono text-primary">
              {transmissionHistory.length} events
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
