/**
 * 3D Pulsar Map Visualization using Three.js
 * Shows pulsar positions and nearby stars in GALACTOCENTRIC coordinates with phase animations
 * Origin (0,0,0) = Galactic Center (Sgr A*)
 * Sun positioned at ~8.2 kpc from center in the Orion Spur
 */

import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Text, Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Pulsar, ObserverLocation } from '@/lib/pulsar-transceiver/types';
import { equatorialToGalactic } from '@/lib/pulsar-transceiver/pulsar-catalog';
import { ALL_STARS, Star } from '@/lib/pulsar-transceiver/star-catalog';
import { loadHipparcosStars } from '@/lib/pulsar-transceiver/hyg-star-loader';
import { starToVizPositionTuple } from '@/lib/pulsar-transceiver/star-viz';
import { StarFieldPoints } from '@/components/pulsar-transceiver/StarFieldPoints';
import { SpiralArms } from '@/components/pulsar-transceiver/SpiralArms';
import { 
  heliocentricToGalactocentric, 
  SUN_GALACTOCENTRIC_POSITION,
  distanceFromSun
} from '@/lib/pulsar-transceiver/galactic-coordinates';

interface PulsarMap3DProps {
  pulsars: Pulsar[];
  activePulsars: Pulsar[];
  referencePulsar: Pulsar;
  referencePhase: number;
  locations: ObserverLocation[];
  phases: Map<string, number>;
  onPulsarClick?: (pulsar: Pulsar) => void;
  selectedStar?: Star | null;
  onStarSelect?: (star: Star | null) => void;
}

// Visualization scale constant
const VIZ_SCALE = 2;

// Convert visualization coordinates back to galactocentric for tooltip
function vizToGalactocentric(vizX: number, vizY: number, vizZ: number) {
  // Reverse the viz scaling: vizX = galacto.x * 2, vizY = galacto.z * 10, vizZ = galacto.y * 2
  const x = vizX / VIZ_SCALE;
  const y = vizZ / VIZ_SCALE;
  const z = vizY / 10;
  
  const r = Math.sqrt(x * x + y * y);
  const galacticL = Math.atan2(y, x) * (180 / Math.PI);
  const galacticB = Math.atan2(z, r) * (180 / Math.PI);
  const distFromCenter = Math.sqrt(x * x + y * y + z * z);
  
  // Calculate distance from Sun (which is at SUN_GALACTOCENTRIC_POSITION)
  const sunX = SUN_GALACTOCENTRIC_POSITION.x;
  const sunY = SUN_GALACTOCENTRIC_POSITION.y;
  const sunZ = SUN_GALACTOCENTRIC_POSITION.z;
  const distFromSunVal = Math.sqrt(
    Math.pow(x - sunX, 2) + 
    Math.pow(y - sunY, 2) + 
    Math.pow(z - sunZ, 2)
  );
  
  return {
    galacticL: galacticL < 0 ? galacticL + 360 : galacticL,
    galacticB,
    x, y, z,
    distFromCenter,
    distFromSun: distFromSunVal
  };
}

// Camera controller for zoom-to-star feature
function CameraController({ 
  targetPosition, 
  isAnimating,
  onAnimationComplete 
}: { 
  targetPosition: THREE.Vector3 | null;
  isAnimating: boolean;
  onAnimationComplete: () => void;
}) {
  const { camera } = useThree();
  const targetRef = useRef<THREE.Vector3 | null>(null);
  const startPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const progressRef = useRef(0);
  
  useEffect(() => {
    if (targetPosition && isAnimating) {
      startPosRef.current.copy(camera.position);
      targetRef.current = targetPosition.clone();
      // Calculate offset to view the target from a nice angle
      const offset = new THREE.Vector3(0.5, 0.3, 0.5).normalize().multiplyScalar(2);
      targetRef.current.add(offset);
      progressRef.current = 0;
    }
  }, [targetPosition, isAnimating, camera]);
  
  useFrame((_, delta) => {
    if (isAnimating && targetRef.current) {
      progressRef.current += delta * 1.5;
      const t = Math.min(1, progressRef.current);
      const eased = 1 - Math.pow(1 - t, 3); // ease out cubic
      
      camera.position.lerpVectors(startPosRef.current, targetRef.current, eased);
      
      if (t >= 1) {
        onAnimationComplete();
      }
    }
  });
  
  return null;
}

// Star Info Panel (HTML overlay)
function StarInfoPanel({ star, position, onClose }: { 
  star: Star; 
  position: THREE.Vector3;
  onClose: () => void;
}) {
  return (
    <Html position={[position.x, position.y + 0.3, position.z]} center>
      <div className="bg-slate-900/95 border border-primary/50 rounded-lg p-3 backdrop-blur-sm min-w-[200px] pointer-events-auto text-xs shadow-xl">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="font-bold text-primary text-sm">{star.commonName || star.name}</div>
            {star.commonName && <div className="text-muted-foreground text-[10px]">{star.name}</div>}
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            ✕
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
          <span className="text-muted-foreground">Spectral:</span>
          <span className="font-mono" style={{ color: star.color }}>{star.spectralType}</span>
          
          <span className="text-muted-foreground">Distance:</span>
          <span className="text-cyan-300 font-mono">{star.distance.toFixed(2)} pc</span>
          
          <span className="text-muted-foreground">Magnitude:</span>
          <span className="text-yellow-300 font-mono">{star.magnitude.toFixed(2)}</span>
          
          <span className="text-muted-foreground">Luminosity:</span>
          <span className="text-orange-300 font-mono">{star.luminosity >= 1000 ? `${(star.luminosity / 1000).toFixed(1)}k` : star.luminosity.toFixed(2)} L☉</span>
          
          {star.constellation && (
            <>
              <span className="text-muted-foreground">Constellation:</span>
              <span className="text-purple-300">{star.constellation}</span>
            </>
          )}
          
          {star.hip && (
            <>
              <span className="text-muted-foreground">HIP:</span>
              <span className="text-gray-400 font-mono">{star.hip}</span>
            </>
          )}
        </div>
        
        <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] text-muted-foreground">
          ~{(star.distance * 3.26156).toFixed(1)} light years from Sol
        </div>
      </div>
    </Html>
  );
}

// Coordinate Tooltip Component (uses galactocentric)
function CoordinateTooltip({ position }: { position: THREE.Vector3 }) {
  const data = vizToGalactocentric(position.x, position.y, position.z);
  
  return (
    <Html position={[position.x, position.y + 0.4, position.z]} center>
      <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg p-2 backdrop-blur-sm min-w-[180px] pointer-events-none text-xs">
        <div className="font-bold text-cyan-400 mb-1 text-[10px]">GALACTOCENTRIC COORDS</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
          <span className="text-gray-400">l:</span>
          <span className="text-cyan-300 font-mono">{data.galacticL.toFixed(1)}°</span>
          <span className="text-gray-400">b:</span>
          <span className="text-cyan-300 font-mono">{data.galacticB.toFixed(1)}°</span>
          <span className="text-gray-400">r<sub>GC</sub>:</span>
          <span className="text-amber-300 font-mono">{data.distFromCenter.toFixed(2)} kpc</span>
          <span className="text-gray-400">r<sub>☉</sub>:</span>
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
  
  // Convert pulsar position to GALACTOCENTRIC 3D coordinates (scaled for visualization)
  const position = useMemo(() => {
    // Get heliocentric galactic coordinates
    const helio = equatorialToGalactic(pulsar.ra, pulsar.dec, pulsar.distance);
    // Convert to galactocentric
    const galacto = heliocentricToGalactocentric(helio);
    // Scale to visualization space (1 unit = 0.5 kpc in viz)
    return [galacto.x * VIZ_SCALE, galacto.z * 10, galacto.y * VIZ_SCALE] as [number, number, number];
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
  
  // Convert observer location to GALACTOCENTRIC coordinates
  const position = useMemo(() => {
    const helio = location.galactic;
    const galacto = heliocentricToGalactocentric(helio);
    return [galacto.x * VIZ_SCALE, galacto.z * 10, galacto.y * VIZ_SCALE] as [number, number, number];
  }, [location]);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });
  
  // Connection lines to active pulsars (in galactocentric coordinates)
  const connectionPoints = useMemo(() => {
    if (!showConnections) return [];
    return activePulsars.map(pulsar => {
      const helio = equatorialToGalactic(pulsar.ra, pulsar.dec, pulsar.distance);
      const galacto = heliocentricToGalactocentric(helio);
      return {
        pulsar: pulsar.name,
        points: [
          new THREE.Vector3(position[0], position[1], position[2]),
          new THREE.Vector3(galacto.x * VIZ_SCALE, galacto.z * 10, galacto.y * VIZ_SCALE)
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
  isSelected,
  onClick,
  onHover,
  onUnhover
}: { 
  star: Star;
  isSelected?: boolean;
  onClick?: (star: Star, position: THREE.Vector3) => void;
  onHover?: (position: THREE.Vector3, name: string) => void;
  onUnhover?: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const position = useMemo(() => starToVizPositionTuple(star), [star]);
  
  // Size based on magnitude (brighter = larger)
  const size = useMemo(() => {
    // Brighter stars (lower magnitude) should be larger
    const magFactor = Math.max(0, (6 - star.magnitude) / 6);
    return 0.05 + magFactor * 0.12;
  }, [star.magnitude]);
  
  // Subtle twinkle animation
  useFrame((state) => {
    if (meshRef.current) {
      const twinkle = 0.9 + 0.1 * Math.sin(state.clock.elapsedTime * 2 + star.ra * 10);
      const selectedScale = isSelected ? 1.5 : 1;
      meshRef.current.scale.setScalar(size * twinkle * selectedScale);
    }
  });
  
  const handlePointerEnter = useCallback((e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover?.(new THREE.Vector3(...position), star.commonName || star.name);
  }, [onHover, position, star]);
  
  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick?.(star, new THREE.Vector3(...position));
  }, [onClick, star, position]);
  
  return (
    <group position={position}>
      <mesh 
        ref={meshRef}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={onUnhover}
        onClick={handleClick}
      >
        <sphereGeometry args={[size, 8, 8]} />
        <meshBasicMaterial 
          color={star.color} 
          transparent 
          opacity={isSelected ? 1 : 0.9}
        />
      </mesh>
      
      {/* Glow for bright stars or selected */}
      {(star.magnitude < 2 || isSelected) && (
        <mesh scale={isSelected ? 3 : 2}>
          <sphereGeometry args={[size, 8, 8]} />
          <meshBasicMaterial 
            color={star.color} 
            transparent 
            opacity={isSelected ? 0.5 : 0.3}
          />
        </mesh>
      )}
      
      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size * 2.5, size * 3, 32]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Label for notable stars or selected */}
      {(star.magnitude < 1.5 || star.distance < 5 || isSelected) && (
        <Text
          position={[0, size + 0.05, 0]}
          fontSize={isSelected ? 0.07 : 0.05}
          color={isSelected ? '#22d3ee' : star.color}
          anchorX="center"
          anchorY="bottom"
        >
          {star.commonName || star.name}
        </Text>
      )}
    </group>
  );
}

// Sun marker at its correct galactocentric position (~8.2 kpc from center)
function SunMarker() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Sun's position in visualization coordinates
  const sunPos: [number, number, number] = [
    SUN_GALACTOCENTRIC_POSITION.x * VIZ_SCALE,  // ~16.4 units from origin
    SUN_GALACTOCENTRIC_POSITION.z * 10,          // slightly above plane
    SUN_GALACTOCENTRIC_POSITION.y * VIZ_SCALE    // y=0 in galactic coords
  ];
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = 1 + 0.1 * Math.sin(state.clock.elapsedTime * 3);
      meshRef.current.scale.setScalar(pulse);
    }
  });
  
  return (
    <group position={sunPos}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#fff700" />
      </mesh>
      <mesh scale={2}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshBasicMaterial color="#fff700" transparent opacity={0.3} />
      </mesh>
      <Text
        position={[0, 0.2, 0]}
        fontSize={0.1}
        color="#fff700"
        anchorX="center"
      >
        ☉ Sol ({SUN_GALACTOCENTRIC_POSITION.x.toFixed(1)} kpc from GC)
      </Text>
    </group>
  );
}

// Galactic plane grid (galactocentric - origin at center)
function GalacticPlane() {
  return (
    <group>
      {/* Grid - larger to accommodate galactocentric view */}
      <gridHelper 
        args={[40, 40, '#1e3a5f', '#0f172a']} 
        rotation={[0, 0, 0]}
      />
      
      {/* Distance ring markers */}
      {[4, 8, 12, 16].map(radius => (
        <mesh key={radius} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[radius * VIZ_SCALE - 0.02, radius * VIZ_SCALE + 0.02, 64]} />
          <meshBasicMaterial color="#334155" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
      ))}
      
      {/* Distance labels */}
      {[4, 8, 12].map(radius => (
        <Text
          key={`label-${radius}`}
          position={[radius * VIZ_SCALE, 0.1, 0]}
          fontSize={0.12}
          color="#64748b"
          anchorX="center"
        >
          {radius} kpc
        </Text>
      ))}
      
      {/* Axis labels */}
      <Text position={[10, 0.15, 0]} fontSize={0.18} color="#4b5563">X (kpc)</Text>
      <Text position={[0, 0.15, 10]} fontSize={0.18} color="#4b5563">Y (kpc)</Text>
    </group>
  );
}

type SceneProps = Omit<PulsarMap3DProps, 'selectedStar' | 'onStarSelect'> & {
  stars: Star[];
  selectedStar: Star | null;
  onStarSelect: (star: Star | null) => void;
};

// Main 3D scene with hover tooltip
function Scene({
  pulsars,
  activePulsars,
  referencePulsar,
  referencePhase,
  locations,
  phases,
  onPulsarClick,
  stars,
  selectedStar,
  onStarSelect
}: SceneProps) {
  const locationColors = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];
  const [hoveredPosition, setHoveredPosition] = useState<THREE.Vector3 | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleHover = useCallback((position: THREE.Vector3) => {
    if (!selectedStar) {
      setHoveredPosition(position);
    }
  }, [selectedStar]);
  
  const handleUnhover = useCallback(() => {
    setHoveredPosition(null);
  }, []);
  
  const handleStarClick = useCallback((star: Star) => {
    if (selectedStar?.name === star.name) {
      onStarSelect?.(null);
    } else {
      onStarSelect?.(star);
      setIsAnimating(true);
    }
  }, [selectedStar, onStarSelect]);
  
  const handleClosePanel = useCallback(() => {
    onStarSelect?.(null);
  }, [onStarSelect]);
  
  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);
  
  return (
    <>
      {/* Camera controller for zoom animation */}
      <CameraController 
        targetPosition={selectedStar ? new THREE.Vector3(...starToVizPositionTuple(selectedStar)) : null}
        isAnimating={isAnimating}
        onAnimationComplete={handleAnimationComplete}
      />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8b5cf6" />
      
      {/* No fake stars - only real astronomical objects */}
      
      {/* Spiral arms (rendered first, below other elements) */}
      <SpiralArms scale={VIZ_SCALE} showLabels={true} visible={true} />
      
      {/* Galactic plane grid */}
      <GalacticPlane />
      
      {/* Sun marker at correct galactocentric position */}
      <SunMarker />
      
      {/* Real stars (dense Hipparcos field rendered as GPU points) */}
      <StarFieldPoints
        stars={stars}
        onHover={handleHover}
        onUnhover={handleUnhover}
        onSelect={handleStarClick}
      />

      {/* Selected star overlay (ring + label) */}
      {selectedStar && (
        <StarSphere
          star={selectedStar}
          isSelected
          onClick={handleStarClick}
          onHover={(pos) => handleHover(pos)}
          onUnhover={handleUnhover}
        />
      )}
      
      {/* Star info panel when selected */}
      {selectedStar && (
        <StarInfoPanel
          star={selectedStar}
          position={new THREE.Vector3(...starToVizPositionTuple(selectedStar))}
          onClose={handleClosePanel}
        />
      )}
      
      {/* Coordinate Tooltip for non-selected hover */}
      {hoveredPosition && !selectedStar && <CoordinateTooltip position={hoveredPosition} />}
      
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
        autoRotate={false}
        autoRotateSpeed={0}
      />
    </>
  );
}

export function PulsarMap3D(props: PulsarMap3DProps) {
  const [selectedStar, setSelectedStar] = useState<Star | null>(null);
  const [hipStars, setHipStars] = useState<Star[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadHipparcosStars({ maxStars: 2500, maxMagnitude: 7.0, maxDistancePc: 300 })
      .then((stars) => {
        if (!cancelled) setHipStars(stars);
      })
      .catch(() => {
        // network failures should not break the visualization
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stars = useMemo(() => {
    const byKey = new Map<string, Star>();
    for (const s of [...ALL_STARS, ...hipStars]) {
      const key = s.hip ? `hip:${s.hip}` : `name:${s.name}`;
      if (!byKey.has(key)) byKey.set(key, s);
    }
    return Array.from(byKey.values());
  }, [hipStars]);

  return (
    <div
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden relative"
      style={{ background: '#000000' }}
    >
      {/* Star count indicator */}
      <div className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-sm rounded px-2 py-1 text-xs text-muted-foreground">
        <span className="text-primary font-mono">{stars.length}</span> stars •{' '}
        <span className="text-cyan-400 font-mono">{props.pulsars.length}</span> pulsars
      </div>

      {/* Selected star name */}
      {selectedStar && (
        <div className="absolute top-2 right-2 z-10 bg-primary/20 backdrop-blur-sm rounded px-3 py-1 text-xs text-primary border border-primary/30">
          Focused: {selectedStar.commonName || selectedStar.name}
        </div>
      )}

      <Canvas
        camera={{ position: [5, 5, 10], fov: 60 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000000', 1);
        }}
      >
        <Scene
          {...props}
          stars={stars}
          selectedStar={selectedStar}
          onStarSelect={setSelectedStar}
        />
      </Canvas>
    </div>
  );
}

export default PulsarMap3D;
