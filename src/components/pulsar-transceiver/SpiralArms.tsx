/**
 * 3D Spiral Arm Visualization for the Milky Way
 * Renders translucent bands representing the major spiral arms
 */

import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { SPIRAL_ARMS, generateSpiralPoints, SpiralArm } from '@/lib/pulsar-transceiver/spiral-arms';

interface SpiralArmsProps {
  /** Scale factor for visualization (matches PulsarMap3D scaling) */
  scale?: number;
  /** Whether to show arm labels */
  showLabels?: boolean;
  /** Visibility toggle */
  visible?: boolean;
}

/**
 * Single spiral arm band component
 */
function SpiralArmBand({ 
  arm, 
  scale,
  showLabel 
}: { 
  arm: SpiralArm; 
  scale: number;
  showLabel: boolean;
}) {
  // Generate the arm geometry
  const geometry = useMemo(() => {
    const points = generateSpiralPoints(arm, 150);
    const halfWidth = arm.width / 2;
    
    // Create shape from points
    const shape = new THREE.Shape();
    
    // Build inner edge (going forward)
    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      const r = Math.sqrt(x * x + y * y);
      const nx = -y / r;
      const ny = x / r;
      
      const px = (x - nx * halfWidth) * scale;
      const py = (y - ny * halfWidth) * scale;
      
      if (i === 0) {
        shape.moveTo(px, py);
      } else {
        shape.lineTo(px, py);
      }
    }
    
    // Build outer edge (going backward)
    for (let i = points.length - 1; i >= 0; i--) {
      const [x, y] = points[i];
      const r = Math.sqrt(x * x + y * y);
      const nx = -y / r;
      const ny = x / r;
      
      const px = (x + nx * halfWidth) * scale;
      const py = (y + ny * halfWidth) * scale;
      
      shape.lineTo(px, py);
    }
    
    shape.closePath();
    
    return new THREE.ShapeGeometry(shape);
  }, [arm, scale]);
  
  // Calculate label position (middle of the arm)
  const labelPosition = useMemo(() => {
    const points = generateSpiralPoints(arm, 100);
    const midPoint = points[Math.floor(points.length / 2)];
    return [midPoint[0] * scale, 0.15, midPoint[1] * scale] as [number, number, number];
  }, [arm, scale]);
  
  return (
    <group>
      {/* Arm band mesh - rotated to lie on XZ plane (Y is up) */}
      <mesh 
        geometry={geometry} 
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]} // Slightly above the grid
      >
        <meshBasicMaterial
          color={arm.color}
          transparent
          opacity={arm.opacity}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Arm edge glow */}
      <mesh 
        geometry={geometry} 
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
      >
        <meshBasicMaterial
          color={arm.color}
          transparent
          opacity={arm.opacity * 0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      
      {/* Label */}
      {showLabel && (
        <Text
          position={labelPosition}
          fontSize={0.25}
          color={arm.color}
          anchorX="center"
          anchorY="middle"
          fillOpacity={0.7}
        >
          {arm.name}
        </Text>
      )}
    </group>
  );
}

/**
 * Galactic Center marker with enhanced visuals
 */
function GalacticCenterMarker({ scale }: { scale: number }) {
  return (
    <group position={[0, 0.02, 0]}>
      {/* Central black hole representation (Sgr A*) */}
      <mesh>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Accretion disk glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.4, 64]} />
        <meshBasicMaterial 
          color="#fbbf24" 
          transparent 
          opacity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Outer halo */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.6, 64]} />
        <meshBasicMaterial 
          color="#fbbf24" 
          transparent 
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Label */}
      <Text
        position={[0, 0.25, 0]}
        fontSize={0.12}
        color="#fbbf24"
        anchorX="center"
      >
        Sgr A* (Galactic Center)
      </Text>
    </group>
  );
}

/**
 * Main SpiralArms component
 */
export function SpiralArms({ 
  scale = 2, 
  showLabels = true,
  visible = true 
}: SpiralArmsProps) {
  if (!visible) return null;
  
  return (
    <group>
      {/* Render all spiral arms */}
      {SPIRAL_ARMS.map((arm) => (
        <SpiralArmBand
          key={arm.name}
          arm={arm}
          scale={scale}
          showLabel={showLabels}
        />
      ))}
      
      {/* Enhanced galactic center */}
      <GalacticCenterMarker scale={scale} />
    </group>
  );
}

export default SpiralArms;
