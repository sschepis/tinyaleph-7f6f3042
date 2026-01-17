import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SplitPrime } from '@/lib/quaternion-nonlocal/types';

interface BlochSphereVizProps {
  alice: SplitPrime | null;
  bob: SplitPrime | null;
  time: number;
}

export function BlochSphereViz({ alice, bob, time }: BlochSphereVizProps) {
  const size = 200;
  const center = size / 2;
  const radius = size * 0.4;
  
  // Project 3D to 2D with perspective
  const project = (x: number, y: number, z: number, rotY: number) => {
    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);
    const x2 = x * cosR - z * sinR;
    const z2 = x * sinR + z * cosR;
    const scale = 1 / (1 - z2 * 0.3);
    return {
      x: center + x2 * radius * scale,
      y: center - y * radius * scale,
      scale
    };
  };
  
  const rotation = time * 0.3;
  
  // Generate sphere wireframe
  const sphereLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = [];
    
    // Latitude lines
    for (let lat = -60; lat <= 60; lat += 30) {
      const latRad = (lat * Math.PI) / 180;
      const r = Math.cos(latRad);
      const y = Math.sin(latRad);
      
      for (let i = 0; i < 24; i++) {
        const lon1 = (i * 15 * Math.PI) / 180;
        const lon2 = ((i + 1) * 15 * Math.PI) / 180;
        
        const p1 = project(r * Math.cos(lon1), y, r * Math.sin(lon1), rotation);
        const p2 = project(r * Math.cos(lon2), y, r * Math.sin(lon2), rotation);
        
        lines.push({
          x1: p1.x, y1: p1.y,
          x2: p2.x, y2: p2.y,
          opacity: Math.max(0.1, p1.scale * 0.3)
        });
      }
    }
    
    // Longitude lines
    for (let lon = 0; lon < 360; lon += 30) {
      const lonRad = (lon * Math.PI) / 180;
      
      for (let i = 0; i < 12; i++) {
        const lat1 = ((i - 6) * 15 * Math.PI) / 180;
        const lat2 = ((i - 5) * 15 * Math.PI) / 180;
        
        const p1 = project(
          Math.cos(lat1) * Math.cos(lonRad),
          Math.sin(lat1),
          Math.cos(lat1) * Math.sin(lonRad),
          rotation
        );
        const p2 = project(
          Math.cos(lat2) * Math.cos(lonRad),
          Math.sin(lat2),
          Math.cos(lat2) * Math.sin(lonRad),
          rotation
        );
        
        lines.push({
          x1: p1.x, y1: p1.y,
          x2: p2.x, y2: p2.y,
          opacity: Math.max(0.1, p1.scale * 0.3)
        });
      }
    }
    
    return lines;
  }, [rotation]);
  
  // Axis endpoints
  const axes = useMemo(() => [
    { label: 'X', end: project(1, 0, 0, rotation), color: 'hsl(var(--destructive))' },
    { label: 'Y', end: project(0, 1, 0, rotation), color: 'hsl(var(--primary))' },
    { label: 'Z', end: project(0, 0, 1, rotation), color: 'hsl(var(--accent))' }
  ], [rotation]);
  
  // Bloch vectors
  const alicePoint = alice ? project(
    alice.blochVector[0],
    alice.blochVector[1],
    alice.blochVector[2],
    rotation
  ) : null;
  
  const bobPoint = bob ? project(
    bob.blochVector[0],
    bob.blochVector[1],
    bob.blochVector[2],
    rotation
  ) : null;
  
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm">Quaternionic Bloch Sphere</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-2">
        <svg width={size} height={size} className="overflow-visible">
          {/* Sphere wireframe */}
          {sphereLines.map((line, i) => (
            <line
              key={i}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={0.5}
              opacity={line.opacity}
            />
          ))}
          
          {/* Axes */}
          {axes.map((axis, i) => (
            <g key={i}>
              <line
                x1={center}
                y1={center}
                x2={axis.end.x}
                y2={axis.end.y}
                stroke={axis.color}
                strokeWidth={1.5}
                opacity={0.6}
              />
              <text
                x={axis.end.x + (axis.end.x - center) * 0.15}
                y={axis.end.y + (axis.end.y - center) * 0.15}
                fill={axis.color}
                fontSize={10}
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {axis.label}
              </text>
            </g>
          ))}
          
          {/* Alice's Bloch vector */}
          {alicePoint && (
            <g>
              <line
                x1={center}
                y1={center}
                x2={alicePoint.x}
                y2={alicePoint.y}
                stroke="hsl(142 76% 36%)"
                strokeWidth={2}
              />
              <motion.circle
                cx={alicePoint.x}
                cy={alicePoint.y}
                r={6 * alicePoint.scale}
                fill="hsl(142 76% 36%)"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <text
                x={alicePoint.x + 10}
                y={alicePoint.y - 10}
                fill="hsl(142 76% 36%)"
                fontSize={9}
                fontWeight="bold"
              >
                Alice
              </text>
            </g>
          )}
          
          {/* Bob's Bloch vector */}
          {bobPoint && (
            <g>
              <line
                x1={center}
                y1={center}
                x2={bobPoint.x}
                y2={bobPoint.y}
                stroke="hsl(221 83% 53%)"
                strokeWidth={2}
              />
              <motion.circle
                cx={bobPoint.x}
                cy={bobPoint.y}
                r={6 * bobPoint.scale}
                fill="hsl(221 83% 53%)"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
              />
              <text
                x={bobPoint.x + 10}
                y={bobPoint.y + 10}
                fill="hsl(221 83% 53%)"
                fontSize={9}
                fontWeight="bold"
              >
                Bob
              </text>
            </g>
          )}
          
          {/* Center point */}
          <circle cx={center} cy={center} r={3} fill="hsl(var(--foreground))" opacity={0.5} />
        </svg>
      </CardContent>
    </Card>
  );
}
