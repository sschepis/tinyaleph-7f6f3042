/**
 * 3D Pulsar Map Visualization using Three.js
 * Shows pulsar positions and nearby stars in galactic coordinates with phase animations
 */

import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Pulsar, ObserverLocation } from '@/lib/pulsar-transceiver/types';
import { equatorialToGalactic } from '@/lib/pulsar-transceiver/pulsar-catalog';
import { ALL_STARS, Star, starEquatorialToGalactic } from '@/lib/pulsar-transceiver/star-catalog';

interface PulsarMap3DProps {
  pulsars: Pulsar[];
  activePulsars: Pulsar[];
  referencePulsar: Pulsar;
  referencePhase: number;
  locations: ObserverLocation[];
  phases: Map<string, number>;
  onPulsarClick?: (pulsar: Pulsar) => void;
}

// Convert visualization coordinates back to galactic for tooltip
function vizToGalactic(vizX: number, vizY: number, vizZ: number) {
  const x = vizX / 2;
  const y = vizZ / 2;
  const z = vizY / 10;
  const r = Math.sqrt(x * x + y * y);
  const galacticL = Math.atan2(y, x) * (180 / Math.PI);
  const galacticB = Math.atan2(z, r) * (180 / Math.PI);
  const distFromCenter = Math.sqrt(x * x + y * y + z * z);
  const sunX = 0, sunY = 8.5, sunZ = 0.025;
  const distFromSun = Math.sqrt(Math.pow(x - sunX, 2) + Math.pow(y - sunY, 2) + Math.pow(z - sunZ, 2));
  
  return {
    galacticL: galacticL < 0 ? galacticL + 360 : galacticL,
    galacticB,
    x, y, z,
    distFromCenter,
    distFromSun
  };
}

// Coordinate Tooltip Component
function CoordinateTooltip({ position }: { position: THREE.Vector3 }) {
  const data = vizToGalactic(position.x, position.y, position.z);
  
  return (
    <Html position={[position.x, position.y + 0.4, position.z]} center>
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg p-2 backdrop-blur-sm min-w-[160px] pointer-events-none text-xs">
        <div className="font-bold text-cyan-400 mb-1 text-[10px]">GALACTIC COORDS</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <span className="text-gray-400">l:</span>
          <span className="text-cyan-300 font-mono">{data.galacticL.toFixed(1)}°</span>
          <span className="text-gray-400">b:</span>
          <span className="text-cyan-300 font-mono">{data.galacticB.toFixed(1)}°</span>
          <span className="text-gray-400">r:</span>
          <span className="text-purple-300 font-mono">{data.distFromCenter.toFixed(2)} kpc</span>
          <span className="text-gray-400">d☉:</span>
          <span className="text-green-300 font-mono">{data.distFromSun.toFixed(2)} kpc</span>
        </div>
        <div className="mt-1 pt-1 border-t border-slate-700 text-[9px] text-gray-500">
          ~{(data.distFromSun * 3261.56).toFixed(0)} ly from Sol
        </div>
      </div>
    </Html>
  );
}

// Pulsing pulsar sphere with phase animation and hover tooltip
function PulsarSphere({ 
  pulsar, 
  isActive, 
  isReference, 
  phase,
  onClick,
  onHover,
  onUnhover
}: { 
  pulsar: Pulsar; 
  isActive: boolean; 
  isReference: boolean;
  phase: number;
  onClick?: () => void;
  onHover?: (position: THREE.Vector3) => void;
  onUnhover?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
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
  
  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (groupRef.current) {
      onHover?.(new THREE.Vector3(...position));
    }
  }, [onHover, position]);
  
  const color = isReference ? '#fbbf24' : isActive ? '#22d3ee' : '#6b7280';
  
  return (
    <group 
      ref={groupRef}
      position={position} 
      onClick={onClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={onUnhover}
    >
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

// Real Star visualization
function StarSphere({ 
  star, 
  onHover,
  onUnhover
}: { 
  star: Star;
  onHover?: (position: THREE.Vector3, name: string) => void;
  onUnhover?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Convert star position to 3D coordinates (scaled for visualization)
  // Stars are much closer than pulsars, scale differently
  const position = useMemo(() => {
    const galactic = starEquatorialToGalactic(star.ra, star.dec, star.distance);
    // Scale stars more aggressively since they're nearby (pc not kpc)
    // 1 unit = 5 parsecs for nearby stars
    const scale = star.distance < 100 ? 0.4 : 2;
    return [galactic.x * 1000 * scale, galactic.z * 10000 * scale, galactic.y * 1000 * scale] as [number, number, number];
  }, [star]);
  
  // Size based on luminosity (log scale)
  const size = useMemo(() => {
    const baseSize = 0.02;
    const lumFactor = Math.log10(star.luminosity + 1) * 0.015;
    return Math.max(0.015, Math.min(0.08, baseSize + lumFactor));
  }, [star.luminosity]);
  
  // Subtle twinkle animation
  useFrame((state) => {
    if (meshRef.current) {
      const twinkle = 0.9 + 0.1 * Math.sin(state.clock.elapsedTime * 2 + star.ra * 10);
      meshRef.current.scale.setScalar(size * twinkle);
    }
  });
  
  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover?.(new THREE.Vector3(...position), star.commonName || star.name);
  }, [onHover, position, star]);
  
  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={onUnhover}
      >
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial 
          color={star.color} 
          transparent 
          opacity={0.9}
        />
      </mesh>
      
      {/* Glow for bright stars */}
      {star.magnitude < 2 && (
        <mesh scale={2}>
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial 
            color={star.color} 
            transparent 
            opacity={0.3}
          />
        </mesh>
      )}
      
      {/* Label for notable stars */}
      {(star.magnitude < 1.5 || star.distance < 5) && (
        <Text
          position={[0, size + 0.05, 0]}
          fontSize={0.05}
          color={star.color}
          anchorX="center"
          anchorY="bottom"
        >
          {star.commonName || star.name}
        </Text>
      )}
    </group>
  );
}

// Sun marker at origin
function SunMarker() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + 0.1 * Math.sin(state.clock.elapsedTime * 3);
      meshRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <group position={[0, 0.02, 0.017]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#fff700" />
      </mesh>
      <mesh scale={2}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color="#fff700" transparent opacity={0.3} />
      </mesh>
      <Text
        position={[0, 0.08, 0]}
        fontSize={0.06}
        color="#fff700"
        anchorX="center"
      >
        ☉ Sol
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

// Main 3D scene with hover tooltip
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
  const [hoveredPosition, setHoveredPosition] = useState<THREE.Vector3 | null>(null);
  
  const handleHover = useCallback((position: THREE.Vector3) => {
    setHoveredPosition(position);
  }, []);
  
  const handleUnhover = useCallback(() => {
    setHoveredPosition(null);
  }, []);
  
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
      
      {/* Sun marker */}
      <SunMarker />
      
      {/* Real stars from catalog */}
      {ALL_STARS.map(star => (
        <StarSphere
          key={star.name}
          star={star}
          onHover={(pos, name) => handleHover(pos)}
          onUnhover={handleUnhover}
        />
      ))}
      
      {/* Coordinate Tooltip */}
      {hoveredPosition && <CoordinateTooltip position={hoveredPosition} />}
      
      {/* Pulsars */}
      {pulsars.map(pulsar => (
        <PulsarSphere
          key={pulsar.name}
          pulsar={pulsar}
          isActive={activePulsars.some(p => p.name === pulsar.name)}
          isReference={pulsar.name === referencePulsar.name}
          phase={phases.get(pulsar.name) || 0}
          onClick={() => onPulsarClick?.(pulsar)}
          onHover={handleHover}
          onUnhover={handleUnhover}
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
        minDistance={0.5}
        maxDistance={50}
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
