/**
 * Network Topology Graph - Animated visualization of party connections with phase lock strength
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Network, Link, Unlink, Activity, Zap
} from 'lucide-react';
import { ObserverLocation } from '@/lib/pulsar-transceiver/types';

interface PartyNode {
  name: string;
  location: ObserverLocation;
  phaseLockWith: string[];
  color: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
  strength: number; // 0-1
  isLocked: boolean;
}

interface NetworkTopologyProps {
  parties: Array<{
    location: ObserverLocation;
    phaseLockWith: string[];
    color: string;
  }>;
  time: number;
}

export function NetworkTopology({ parties, time }: NetworkTopologyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Calculate node positions in a circle
  const nodes = useMemo((): PartyNode[] => {
    const centerX = 200;
    const centerY = 150;
    const radius = 100;
    
    return parties.map((party, i) => {
      const angle = (2 * Math.PI * i) / parties.length - Math.PI / 2;
      return {
        name: party.location.name,
        location: party.location,
        phaseLockWith: party.phaseLockWith,
        color: party.color,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
  }, [parties]);
  
  // Calculate connections
  const connections = useMemo((): Connection[] => {
    const conns: Connection[] = [];
    const processed = new Set<string>();
    
    nodes.forEach(node => {
      node.phaseLockWith.forEach(targetName => {
        const key = [node.name, targetName].sort().join('-');
        if (processed.has(key)) return;
        processed.add(key);
        
        const targetNode = nodes.find(n => n.name === targetName);
        if (!targetNode) return;
        
        // Check if bidirectional lock
        const isLocked = targetNode.phaseLockWith.includes(node.name);
        
        conns.push({
          from: node.name,
          to: targetName,
          strength: isLocked ? 1 : 0.5,
          isLocked
        });
      });
    });
    
    return conns;
  }, [nodes]);
  
  // Calculate total network metrics
  const metrics = useMemo(() => {
    const totalPossible = (nodes.length * (nodes.length - 1)) / 2;
    const lockedCount = connections.filter(c => c.isLocked).length;
    const connectivity = totalPossible > 0 ? lockedCount / totalPossible : 0;
    
    return {
      totalNodes: nodes.length,
      lockedConnections: lockedCount,
      totalPossible,
      connectivity
    };
  }, [nodes, connections]);
  
  // Animated pulse effect for connections
  const pulseOffset = (time * 50) % 100;
  
  return (
    <Card className="bg-slate-800/50 border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-400">Network Topology</h3>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="border-green-600 text-green-300">
            <Link className="w-3 h-3 mr-1" />
            {metrics.lockedConnections} Locked
          </Badge>
          <Badge variant="outline" className="border-purple-600 text-purple-300">
            {(metrics.connectivity * 100).toFixed(0)}% Connected
          </Badge>
        </div>
      </div>
      
      {/* SVG Network Graph */}
      <div ref={containerRef} className="relative bg-slate-900/50 rounded-lg overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 400 300"
          className="w-full h-64"
        >
          <defs>
            {/* Gradient for locked connections */}
            <linearGradient id="lockGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            
            {/* Animated dash pattern */}
            <pattern id="dashPattern" width="20" height="1" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="10" height="1" fill="#6b7280" />
            </pattern>
            
            {/* Glow filter */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Connection lines */}
          {connections.map((conn, i) => {
            const fromNode = nodes.find(n => n.name === conn.from);
            const toNode = nodes.find(n => n.name === conn.to);
            if (!fromNode || !toNode) return null;
            
            const dx = toNode.x - fromNode.x;
            const dy = toNode.y - fromNode.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            return (
              <g key={`${conn.from}-${conn.to}`}>
                {/* Base line */}
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={conn.isLocked ? "url(#lockGradient)" : "#374151"}
                  strokeWidth={conn.isLocked ? 3 : 1}
                  strokeDasharray={conn.isLocked ? undefined : "5,5"}
                  opacity={conn.isLocked ? 0.8 : 0.3}
                  filter={conn.isLocked ? "url(#glow)" : undefined}
                />
                
                {/* Animated pulse for locked connections */}
                {conn.isLocked && (
                  <>
                    <circle
                      cx={fromNode.x + (dx * ((pulseOffset) % 100)) / 100}
                      cy={fromNode.y + (dy * ((pulseOffset) % 100)) / 100}
                      r="4"
                      fill="#22d3ee"
                      opacity={0.8}
                    >
                      <animate
                        attributeName="r"
                        values="2;6;2"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0.2;0.8"
                        dur="1s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    
                    {/* Reverse direction pulse */}
                    <circle
                      cx={toNode.x - (dx * ((pulseOffset + 50) % 100)) / 100}
                      cy={toNode.y - (dy * ((pulseOffset + 50) % 100)) / 100}
                      r="4"
                      fill="#a855f7"
                      opacity={0.8}
                    >
                      <animate
                        attributeName="r"
                        values="2;6;2"
                        dur="1s"
                        begin="0.5s"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values="0.8;0.2;0.8"
                        dur="1s"
                        begin="0.5s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </>
                )}
                
                {/* Strength indicator at midpoint */}
                {conn.isLocked && (
                  <g transform={`translate(${(fromNode.x + toNode.x) / 2}, ${(fromNode.y + toNode.y) / 2})`}>
                    <circle r="8" fill="#1e293b" stroke="#22d3ee" strokeWidth="1" />
                    <text
                      textAnchor="middle"
                      dy="3"
                      fontSize="8"
                      fill="#22d3ee"
                      fontFamily="monospace"
                    >
                      ✓
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          
          {/* Nodes */}
          {nodes.map((node, i) => {
            const isConnected = node.phaseLockWith.length > 0;
            
            return (
              <g key={node.name} transform={`translate(${node.x}, ${node.y})`}>
                {/* Outer ring for connected nodes */}
                {isConnected && (
                  <circle
                    r="24"
                    fill="none"
                    stroke={node.color}
                    strokeWidth="2"
                    strokeDasharray="4,4"
                    opacity="0.5"
                  >
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0"
                      to="360"
                      dur="10s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                
                {/* Main node */}
                <motion.circle
                  r="18"
                  fill={node.color}
                  stroke="#1e293b"
                  strokeWidth="3"
                  filter="url(#glow)"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ cursor: 'pointer' }}
                />
                
                {/* Inner highlight */}
                <circle
                  r="8"
                  fill="white"
                  opacity="0.2"
                />
                
                {/* Connection count */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fontSize="10"
                  fill="white"
                  fontWeight="bold"
                >
                  {node.phaseLockWith.length}
                </text>
                
                {/* Label */}
                <text
                  textAnchor="middle"
                  dy="35"
                  fontSize="9"
                  fill="#9ca3af"
                  className="select-none"
                >
                  {node.name.length > 12 ? node.name.slice(0, 10) + '...' : node.name}
                </text>
              </g>
            );
          })}
          
          {/* Center info */}
          <g transform="translate(200, 150)">
            <text
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
              dy="-5"
            >
              Network
            </text>
            <text
              textAnchor="middle"
              fontSize="14"
              fill="#22d3ee"
              fontWeight="bold"
              dy="12"
            >
              {metrics.lockedConnections}/{metrics.totalPossible}
            </text>
          </g>
        </svg>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-3 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-400" />
          <span className="text-gray-400">Phase Locked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-8 h-0.5 border-t border-dashed border-gray-500" />
          <span className="text-gray-400">Seeking</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-gray-400">Data Flow</span>
        </div>
      </div>
      
      {/* Node list */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {nodes.map(node => (
          <div
            key={node.name}
            className="flex items-center gap-2 p-2 bg-slate-700/30 rounded text-xs"
          >
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: node.color }}
            />
            <span className="truncate text-gray-300">{node.name}</span>
            <Badge 
              variant="outline" 
              className={`ml-auto text-[10px] ${
                node.phaseLockWith.length > 0 ? 'border-green-600 text-green-300' : 'border-gray-600 text-gray-400'
              }`}
            >
              {node.phaseLockWith.length > 0 ? (
                <><Link className="w-2 h-2 mr-0.5" />{node.phaseLockWith.length}</>
              ) : (
                <><Unlink className="w-2 h-2 mr-0.5" />0</>
              )}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default NetworkTopology;
