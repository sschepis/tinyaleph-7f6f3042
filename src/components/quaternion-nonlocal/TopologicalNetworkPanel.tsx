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
    <div className="bg-gray-800/50 rounded-xl p-6 mb-6 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-indigo-300">TOPOLOGICAL PRIME NETWORK</h2>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-xs">QUATERNIONIC</span>
          <div className="text-sm text-gray-400">
            <span>Nodes:</span>
            <span className="text-indigo-300 ml-2">{nodes.length}</span>
          </div>
        </div>
      </div>
      
      <div className="relative h-64 rounded-lg overflow-hidden bg-gray-900 border border-gray-700">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {/* Background grid */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.3" />
            </pattern>
            <radialGradient id="nodePulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </radialGradient>
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
          
          {/* Line gradient */}
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#818cf8" stopOpacity="1" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          
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
                fill="#a5b4fc"
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
              stroke="#a855f7"
              strokeWidth="0.3"
              strokeDasharray="2 1"
              opacity={0.6}
            />
          )}
        </svg>
        
        {/* Not powered overlay */}
        {!isPoweredOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <span className="text-gray-500">System offline</span>
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
