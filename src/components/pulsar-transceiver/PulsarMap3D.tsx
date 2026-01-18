/**
 * 3D Pulsar Map Visualization using Three.js
 * Shows pulsar positions in galactic coordinates with phase animations
 */

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Line } from '@react-three/drei';
import * as THREE from 'three';
import { Pulsar, ObserverLocation } from '@/lib/pulsar-transceiver/types';
import { equatorialToGalactic } from '@/lib/pulsar-transceiver/pulsar-catalog';

interface PulsarMap3DProps {
  pulsars: Pulsar[];
  activePulsars: Pulsar[];
  referencePulsar: Pulsar;
  referencePhase: number;
  locations: ObserverLocation[];
  phases: Map<string, number>;
  onPulsarClick?: (pulsar: Pulsar) => void;
}

// Pulsing pulsar sphere with phase animation
function PulsarSphere({ 
  pulsar, 
  isActive, 
  isReference, 
  phase,
  onClick 
}: { 
  pulsar: Pulsar; 
  isActive: boolean; 
  isReference: boolean;
  phase: number;
  onClick?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  // Convert pulsar position to 3D coordinates (scaled for visualization)
  const position = useMemo(() => {
    const galactic = equatorialToGalactic(pulsar.ra, pulsar.dec, pulsar.distance);
    // Scale to reasonable visualization size (1 unit = 0.5 kpc)
    return [galactic.x * 2, galactic.z * 10, galactic.y * 2] as [number, number, number];
  }, [pulsar]);
  
  // Animate based on pulsar rotation
  useFrame((state) => {
    if (meshRef.current && isActive) {
      // Pulse intensity based on phase
      const intensity = 0.5 + 0.5 * Math.sin(phase);
      meshRef.current.scale.setScalar(0.08 + intensity * 0.04);
    }
    if (glowRef.current && isActive) {
      const glowIntensity = 0.3 + 0.7 * Math.sin(phase);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = glowIntensity * 0.6;
    }
  });
  
  const color = isReference ? '#fbbf24' : isActive ? '#22d3ee' : '#6b7280';
  
  return (
    <group position={position} onClick={onClick}>
      {/* Core pulsar */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={isActive ? 2 : 0.3}
        />
      </mesh>
      
      {/* Glow effect for active pulsars */}
      {isActive && (
        <mesh ref={glowRef} scale={2.5}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.4}
          />
        </mesh>
      )}
      
      {/* Rotation beam indicator */}
      {isActive && (
        <group rotation={[0, phase, 0]}>
          <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.03, 0.15, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.7} />
          </mesh>
        </group>
      )}
      
      {/* Label */}
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.08}
        color={isActive ? '#22d3ee' : '#9ca3af'}
        anchorX="center"
        anchorY="bottom"
      >
        {pulsar.name}
      </Text>
    </group>
  );
}

// Observer location marker
function LocationMarker({ 
  location, 
  color = '#10b981',
  showConnections,
  activePulsars 
}: { 
  location: ObserverLocation;
  color?: string;
  showConnections: boolean;
  activePulsars: Pulsar[];
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const position = useMemo(() => {
    const g = location.galactic;
    return [g.x * 2, g.z * 10, g.y * 2] as [number, number, number];
  }, [location]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  // Connection lines to active pulsars
  const connectionPoints = useMemo(() => {
    if (!showConnections) return [];
    return activePulsars.map(pulsar => {
      const galactic = equatorialToGalactic(pulsar.ra, pulsar.dec, pulsar.distance);
      return {
        pulsar: pulsar.name,
        points: [
          new THREE.Vector3(position[0], position[1], position[2]),
          new THREE.Vector3(galactic.x * 2, galactic.z * 10, galactic.y * 2)
        ]
      };
    });
  }, [showConnections, activePulsars, position]);
  
  return (
    <group position={position}>
      {/* Location marker - octahedron */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.15]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={1}
          wireframe
        />
      </mesh>
      
      {/* Solid inner core */}
      <mesh scale={0.6}>
        <octahedronGeometry args={[0.15]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Connection lines */}
      {connectionPoints.map(({ pulsar, points }) => (
        <Line
          key={pulsar}
          points={points}
          color={color}
          lineWidth={1}
          transparent
          opacity={0.3}
          dashed
          dashSize={0.1}
          gapSize={0.05}
        />
      ))}
      
      {/* Label */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.1}
        color={color}
        anchorX="center"
        anchorY="bottom"
        fontWeight="bold"
      >
        {location.name}
      </Text>
    </group>
  );
}

// Galactic plane grid
function GalacticPlane() {
  return (
    <group>
      {/* Grid */}
      <gridHelper 
        args={[20, 20, '#1e3a5f', '#0f172a']} 
        rotation={[0, 0, 0]}
      />
      
      {/* Galactic center marker */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.3, 0.02, 8, 32]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      
      {/* Galactic center label */}
      <Text
        position={[0, 0.1, 0]}
        fontSize={0.12}
        color="#fbbf24"
        anchorX="center"
      >
        Galactic Center
      </Text>
      
      {/* Axis labels */}
      <Text position={[5, 0.1, 0]} fontSize={0.15} color="#4b5563">X (kpc)</Text>
      <Text position={[0, 0.1, 5]} fontSize={0.15} color="#4b5563">Y (kpc)</Text>
    </group>
  );
}

// Main 3D scene
function Scene({
  pulsars,
  activePulsars,
  referencePulsar,
  referencePhase,
  locations,
  phases,
  onPulsarClick
}: PulsarMap3DProps) {
  const locationColors = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];
  
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {/* Background stars */}
      <Stars 
        radius={50} 
        depth={50} 
        count={2000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.5}
      />
      
      {/* Galactic plane */}
      <GalacticPlane />
      
      {/* Pulsars */}
      {pulsars.map(pulsar => (
        <PulsarSphere
          key={pulsar.name}
          pulsar={pulsar}
          isActive={activePulsars.some(p => p.name === pulsar.name)}
          isReference={pulsar.name === referencePulsar.name}
          phase={phases.get(pulsar.name) || 0}
          onClick={() => onPulsarClick?.(pulsar)}
        />
      ))}
      
      {/* Observer locations */}
      {locations.map((location, i) => (
        <LocationMarker
          key={location.name}
          location={location}
          color={locationColors[i % locationColors.length]}
          showConnections={true}
          activePulsars={activePulsars}
        />
      ))}
      
      {/* Camera controls */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={30}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </>
  );
}

export function PulsarMap3D(props: PulsarMap3DProps) {
  return (
    <div className="w-full h-full min-h-[400px] bg-slate-950 rounded-lg overflow-hidden">
      <Canvas
        camera={{ position: [5, 5, 10], fov: 60 }}
        gl={{ antialias: true }}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
}

export default PulsarMap3D;
