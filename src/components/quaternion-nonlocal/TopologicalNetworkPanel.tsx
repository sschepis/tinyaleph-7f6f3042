import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { EntangledPair, SplitPrime, TransmissionEvent } from '@/lib/quaternion-nonlocal/types';

interface TopologicalNetworkPanelProps {
  isPoweredOn: boolean;
  entangledPair: EntangledPair | null;
  alicePrime: SplitPrime | null;
  bobPrime: SplitPrime | null;
  time: number;
  transmissionHistory: TransmissionEvent[];
}

interface PrimeNode {
  x: number;
  y: number;
  prime: number;
  label: string;
  color: string;
}

export function TopologicalNetworkPanel({
  isPoweredOn,
  entangledPair,
  alicePrime,
  bobPrime,
  time,
  transmissionHistory
}: TopologicalNetworkPanelProps) {
  // Generate network nodes
  const nodes = useMemo<PrimeNode[]>(() => {
    if (!alicePrime || !bobPrime) return [];
    
    const result: PrimeNode[] = [];
    
    // Center nodes for Alice and Bob
    result.push({
      x: 20,
      y: 50,
      prime: alicePrime.p,
      label: 'A',
      color: '#22c55e'
    });
    
    result.push({
      x: 80,
      y: 50,
      prime: bobPrime.p,
      label: 'B',
      color: '#3b82f6'
    });
    
    // Add transmission history nodes
    transmissionHistory.slice(-8).forEach((tx, i) => {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 25 + (i % 3) * 10;
      result.push({
        x: 50 + Math.cos(angle + time * 0.1) * radius,
        y: 50 + Math.sin(angle + time * 0.1) * radius,
        prime: tx.prime.p,
        label: '',
        color: tx.phaseLockAchieved ? '#a855f7' : '#6b7280'
      });
    });
    
    return result;
  }, [alicePrime, bobPrime, transmissionHistory, time]);

  // Generate connection lines
  const connections = useMemo(() => {
    if (nodes.length < 2) return [];
    
    const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
    
    // Connect Alice and Bob
    lines.push({
      x1: nodes[0].x,
      y1: nodes[0].y,
      x2: nodes[1].x,
      y2: nodes[1].y,
      opacity: entangledPair?.isSynchronized ? 0.8 : 0.3
    });
    
    // Connect to transmission nodes
    nodes.slice(2).forEach((node, i) => {
      // Connect to nearest main node
      const closest = Math.abs(node.x - nodes[0].x) < Math.abs(node.x - nodes[1].x) ? nodes[0] : nodes[1];
      lines.push({
        x1: closest.x,
        y1: closest.y,
        x2: node.x,
        y2: node.y,
        opacity: 0.2 + (i * 0.05)
      });
    });
    
    return lines;
  }, [nodes, entangledPair]);

  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-primary">Topological Prime Network</h2>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[10px]">QUATERNIONIC</span>
          <span className="text-[10px] text-muted-foreground">
            Nodes: <span className="text-primary font-mono">{nodes.length}</span>
          </span>
        </div>
      </div>
      
      <div className="relative h-48 rounded-lg overflow-hidden bg-muted/30 border border-border">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.5" />
            </pattern>
            <radialGradient id="nodePulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Connection lines */}
          {isPoweredOn && connections.map((line, i) => (
            <motion.line
              key={`line-${i}`}
              x1={`${line.x1}%`}
              y1={`${line.y1}%`}
              x2={`${line.x2}%`}
              y2={`${line.y2}%`}
              stroke="url(#lineGrad)"
              strokeWidth="0.5"
              opacity={line.opacity}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
          ))}
          
          {/* Nodes */}
          {isPoweredOn && nodes.map((node, i) => (
            <g key={`node-${i}`}>
              {/* Pulse effect for main nodes */}
              {node.label && (
                <motion.circle
                  cx={`${node.x}%`}
                  cy={`${node.y}%`}
                  r="4"
                  fill={node.color}
                  opacity={0.2}
                  animate={{ r: [4, 6, 4], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              {/* Node circle */}
              <motion.circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r={node.label ? 3 : 1.5}
                fill={node.color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
              />
              
              {/* Label */}
              {node.label && (
                <text
                  x={`${node.x}%`}
                  y={`${node.y}%`}
                  fill="white"
                  fontSize="2"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              )}
              
              {/* Prime number */}
              <text
                x={`${node.x}%`}
                y={`${node.y + (node.label ? 6 : 4)}%`}
                fill="hsl(var(--primary))"
                fontSize="1.5"
                textAnchor="middle"
              >
                {node.prime}
              </text>
            </g>
          ))}
          
          {/* Entanglement wave between Alice and Bob */}
          {isPoweredOn && entangledPair && nodes.length >= 2 && (
            <motion.path
              d={generateEntanglementPath(nodes[0], nodes[1], time)}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="0.3"
              strokeDasharray="2 1"
              opacity={0.6}
            />
          )}
        </svg>
        
        {/* Not powered overlay */}
        {!isPoweredOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="text-muted-foreground text-xs">System offline</span>
          </div>
        )}
      </div>
    </div>
  );
}

function generateEntanglementPath(a: PrimeNode, b: PrimeNode, time: number): string {
  const midX = (a.x + b.x) / 2;
  const midY = (a.y + b.y) / 2;
  const wave = Math.sin(time * 2) * 5;
  
  return `M ${a.x} ${a.y} Q ${midX} ${midY + wave} ${b.x} ${b.y}`;
}
