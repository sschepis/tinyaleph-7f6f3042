import React from 'react';
import { motion } from 'framer-motion';
import { NodeState } from '@/lib/quaternion-nonlocal/communication-types';

interface DualBlochSpheresProps {
  nodeA: NodeState | null;
  nodeB: NodeState | null;
  isEvolving: boolean;
  isSeparated?: boolean;
}

export function DualBlochSpheres({ 
  nodeA, 
  nodeB, 
  isEvolving,
  isSeparated = false
}: DualBlochSpheresProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <BlochSphere 
        node={nodeA} 
        label="Node A" 
        color="hsl(142 76% 36%)" 
        isEvolving={isEvolving}
        isSeparated={isSeparated}
      />
      <BlochSphere 
        node={nodeB} 
        label="Node B" 
        color="hsl(220 90% 56%)" 
        isEvolving={isEvolving}
        isSeparated={isSeparated}
      />
    </div>
  );
}

interface BlochSphereProps {
  node: NodeState | null;
  label: string;
  color: string;
  isEvolving: boolean;
  isSeparated: boolean;
}

function BlochSphere({ node, label, color, isEvolving, isSeparated }: BlochSphereProps) {
  const size = 120;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;

  // Get Bloch vector coordinates
  const blochX = node?.blochVector?.x ?? 0;
  const blochY = node?.blochVector?.y ?? 0;
  const blochZ = node?.blochVector?.z ?? 1;
  
  // Project 3D to 2D (simple orthographic)
  const vectorX = centerX + blochX * radius;
  const vectorY = centerY - blochZ * radius;
  
  // Clamp to valid range
  const validX = Math.min(size - 5, Math.max(5, isNaN(vectorX) ? centerX : vectorX));
  const validY = Math.min(size - 5, Math.max(5, isNaN(vectorY) ? centerY : vectorY));

  // Twist angle for color
  const twistAngle = (node?.twist ?? 0) * 180 / Math.PI;
  const hue = ((twistAngle + 180) % 360);

  return (
    <div className="flex flex-col items-center">
      <div className="text-xs font-semibold mb-1 flex items-center gap-2">
        <span style={{ color }}>{label}</span>
        {isSeparated && (
          <span className="text-red-400 text-[10px]">📵</span>
        )}
      </div>
      
      <svg width={size} height={size} className="overflow-visible">
        {/* Sphere outline */}
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={1}
          opacity={0.3}
        />
        
        {/* Latitude lines */}
        <ellipse
          cx={centerX}
          cy={centerY}
          rx={radius}
          ry={radius * 0.3}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={0.5}
          opacity={0.2}
        />
        
        {/* Vertical axis */}
        <line
          x1={centerX}
          y1={centerY - radius}
          x2={centerX}
          y2={centerY + radius}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={0.5}
          opacity={0.3}
        />
        
        {/* Horizontal axis */}
        <line
          x1={centerX - radius}
          y1={centerY}
          x2={centerX + radius}
          y2={centerY}
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={0.5}
          opacity={0.3}
        />
        
        {/* Bloch vector line */}
        <line
          x1={centerX}
          y1={centerY}
          x2={validX}
          y2={validY}
          stroke={`hsl(${hue}, 70%, 60%)`}
          strokeWidth={2}
        />
        
        {/* Vector endpoint */}
        <motion.circle
          cx={validX}
          cy={validY}
          r={4}
          fill={`hsl(${hue}, 70%, 60%)`}
          stroke="white"
          strokeWidth={1}
          animate={isEvolving ? {
            scale: [1, 1.3, 1],
          } : {}}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Coordinate labels */}
        <text x={5} y={centerY + 3} fontSize={8} fill="hsl(var(--muted-foreground))">-X</text>
        <text x={size - 15} y={centerY + 3} fontSize={8} fill="hsl(var(--muted-foreground))">+X</text>
        <text x={centerX - 5} y={12} fontSize={8} fill="hsl(var(--muted-foreground))">+Z</text>
        <text x={centerX - 5} y={size - 5} fontSize={8} fill="hsl(var(--muted-foreground))">-Z</text>
      </svg>
      
      {/* Metrics */}
      <div className="mt-2 text-[9px] font-mono text-muted-foreground space-y-0.5">
        <div>
          <span className="text-primary">q:</span>{' '}
          {(node?.quaternion?.a ?? 1).toFixed(2)} + {(node?.quaternion?.b ?? 0).toFixed(2)}i + 
          {(node?.quaternion?.c ?? 0).toFixed(2)}j + {(node?.quaternion?.d ?? 0).toFixed(2)}k
        </div>
        <div className="flex gap-3">
          <span><span className="text-primary">θ:</span> {twistAngle.toFixed(1)}°</span>
          <span><span className="text-green-400">C:</span> {(node?.coherence ?? 0).toFixed(3)}</span>
        </div>
      </div>
    </div>
  );
}
