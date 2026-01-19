import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { MemoryNode, MemoryPattern, PulsarReference, HolographicRecord } from '@/lib/cosmic-holographic/types';
import { reconstructFromRecord } from '@/lib/cosmic-holographic/engine';

interface GalaxyVisualizationProps {
  nodes: MemoryNode[];
  patterns: MemoryPattern[];
  pulsars: PulsarReference[];
  selectedNode: string | null;
  highlightedPattern: string | null;
  onSelectNode: (nodeId: string) => void;
  showLabels?: boolean;
  showLightTimeRings?: boolean;
  holographicRecords?: HolographicRecord[];
  simulationTime?: number;
}

// Pulsar with animated pulse rings
function AnimatedPulsar({ pulsar }: { pulsar: PulsarReference }) {
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const mat1Ref = useRef<THREE.MeshBasicMaterial>(null);
  const mat2Ref = useRef<THREE.MeshBasicMaterial>(null);
  
  useFrame(() => {
    // Expand ring based on phase
    const scale1 = 0.2 + (pulsar.phase / (Math.PI * 2)) * 0.8;
    const scale2 = 0.2 + ((pulsar.phase + Math.PI) % (Math.PI * 2)) / (Math.PI * 2) * 0.8;
    
    if (ring1Ref.current && mat1Ref.current) {
      ring1Ref.current.scale.set(scale1, scale1, 1);
      mat1Ref.current.opacity = 1 - scale1;
    }
    
    if (ring2Ref.current && mat2Ref.current) {
      ring2Ref.current.scale.set(scale2, scale2, 1);
      mat2Ref.current.opacity = 1 - scale2;
    }
  });

  const color = pulsar.isReference ? '#ffff00' : '#00ffff';
  
  return (
    <group position={pulsar.position}>
      {/* Core */}
      <mesh>
        <octahedronGeometry args={[0.15]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Pulse ring 1 */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial 
          ref={mat1Ref}
          color={color} 
          transparent 
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Pulse ring 2 */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial 
          ref={mat2Ref}
          color={color} 
          transparent 
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

// Connection lines between nodes sharing patterns
function PatternConnections({ 
  nodes, 
  patterns, 
  highlightedPattern 
}: { 
  nodes: MemoryNode[];
  patterns: MemoryPattern[];
  highlightedPattern: string | null;
}) {
  const lines = useMemo(() => {
    const connections: { start: [number, number, number]; end: [number, number, number]; patternId: string }[] = [];
    
    for (const pattern of patterns) {
      const nodeIds = pattern.storedAt;
      // Create lines between all pairs of nodes storing this pattern
      for (let i = 0; i < nodeIds.length; i++) {
        for (let j = i + 1; j < nodeIds.length; j++) {
          const startNode = nodes.find(n => n.id === nodeIds[i]);
          const endNode = nodes.find(n => n.id === nodeIds[j]);
          if (startNode && endNode) {
            connections.push({
              start: startNode.position,
              end: endNode.position,
              patternId: pattern.id
            });
          }
        }
      }
    }
    
    return connections;
  }, [nodes, patterns]);

  return (
    <group>
      {lines.map((line, i) => {
        const isHighlighted = highlightedPattern === line.patternId;
        const points: [number, number, number][] = [line.start, line.end];
        
        return (
          <Line
            key={i}
            points={points}
            color={isHighlighted ? '#00ff88' : '#66aaff'}
            lineWidth={isHighlighted ? 4 : 2}
            transparent
            opacity={isHighlighted ? 1 : 0.6}
          />
        );
      })}
    </group>
  );
}

// Light-time rings from observer (Sun position)
function LightTimeRings({ show }: { show: boolean }) {
  if (!show) return null;
  
  const SUN_POSITION: [number, number, number] = [8.2, 0, 0.02];
  // Rings at 1kpc, 5kpc, 10kpc intervals (showing ~3000, 16000, 32000 year delays)
  const distances = [1, 5, 10];
  
  return (
    <group position={SUN_POSITION}>
      {distances.map((dist, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[dist - 0.08, dist + 0.08, 64]} />
          <meshBasicMaterial 
            color="#ffaa44" 
            transparent 
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

// Check if this is the Sol/Earth node
function isSolNode(node: MemoryNode): boolean {
  return node.id === 'sol' || node.name.toLowerCase() === 'sol' || node.name.toLowerCase().includes('earth');
}

// Memory node with optional label and fidelity glow
function MemoryNodeMesh({ 
  node, 
  isSelected,
  isHighlighted,
  showLabel,
  fidelity,
  onClick 
}: { 
  node: MemoryNode;
  isSelected: boolean;
  isHighlighted: boolean;
  showLabel: boolean;
  fidelity: number; // 0-1, affects glow intensity
  onClick: () => void;
}) {
  const glowRef = useRef<THREE.Mesh>(null);
  const isSol = isSolNode(node);
  
  // Animate glow based on fidelity
  useFrame((_, delta) => {
    if (glowRef.current && fidelity < 1) {
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      // Pulse faster as fidelity decreases
      const pulseSpeed = 2 + (1 - fidelity) * 4;
      const pulse = Math.sin(Date.now() * pulseSpeed * 0.001) * 0.5 + 0.5;
      material.opacity = fidelity * 0.3 + pulse * (1 - fidelity) * 0.4;
    }
  });
  
  const getColor = () => {
    if (isSol) return '#00ff00'; // Bright green for Sol/Earth
    if (isSelected) return '#00ff88';
    if (isHighlighted) return '#ffaa00';
    if (node.type === 'pulsar') return '#00ffff';
    if (node.type === 'cluster') return '#ff88ff';
    if (node.type === 'nebula') return '#88ffff';
    if (node.type === 'artificial') return '#ffffff';
    return '#8888ff';
  };
  
  // Fidelity-based glow color: green (high) -> yellow -> red (low)
  const getFidelityGlowColor = () => {
    if (fidelity >= 0.8) return '#00ff88';
    if (fidelity >= 0.5) return '#ffaa00';
    return '#ff4444';
  };

  const color = getColor();
  const size = isSol ? 0.25 : 0.1 + node.capacity * 0.00005;
  const hasStoredPatterns = fidelity < 1; // fidelity = 1 means no patterns stored
  
  return (
    <group position={node.position}>
      {/* Fidelity glow ring (only for nodes with stored patterns) */}
      {hasStoredPatterns && (
        <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size + 0.1, size + 0.25, 32]} />
          <meshBasicMaterial 
            color={getFidelityGlowColor()} 
            transparent 
            opacity={fidelity * 0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      
      <mesh onClick={(e) => { e.stopPropagation(); onClick(); }}>
        <sphereGeometry args={[size, isSol ? 16 : 8, isSol ? 16 : 8]} />
        <meshStandardMaterial
          color={color}
          emissive={hasStoredPatterns ? getFidelityGlowColor() : color}
          emissiveIntensity={isSol ? 1.0 : hasStoredPatterns ? fidelity * 0.8 : node.coherence * 0.5 + (isHighlighted ? 0.3 : 0)}
        />
      </mesh>
      
      {/* Sol indicator ring */}
      {isSol && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.4, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
      
      {/* Always show label for Sol, otherwise respect showLabel */}
      {(showLabel || isSol) && (
        <Html distanceFactor={15} style={{ pointerEvents: 'none' }}>
          <div className={`px-1.5 py-0.5 rounded text-[10px] whitespace-nowrap ${
            isSol 
              ? 'bg-green-500/90 text-white font-bold border border-green-300' 
              : 'bg-background/80 text-foreground'
          }`}>
            {isSol ? '🌍 Sol (Earth)' : node.name}
            {hasStoredPatterns && !isSol && (
              <span className={`ml-1 ${fidelity >= 0.8 ? 'text-green-400' : fidelity >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                ({(fidelity * 100).toFixed(0)}%)
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

export function GalaxyVisualization({
  nodes,
  patterns,
  pulsars,
  selectedNode,
  highlightedPattern,
  onSelectNode,
  showLabels = false,
  showLightTimeRings = true,
  holographicRecords = [],
  simulationTime = 0
}: GalaxyVisualizationProps) {
  // Find nodes that are part of the highlighted pattern
  const highlightedNodeIds = useMemo(() => {
    if (!highlightedPattern) return new Set<string>();
    const pattern = patterns.find(p => p.id === highlightedPattern);
    return new Set(pattern?.storedAt || []);
  }, [patterns, highlightedPattern]);

  // Calculate fidelity per node based on stored patterns
  const nodeFidelities = useMemo(() => {
    const fidelities: Record<string, number> = {};
    
    if (holographicRecords.length === 0 || pulsars.length === 0) {
      return fidelities;
    }
    
    // Group records by node (using storedAt from patterns)
    for (const pattern of patterns) {
      if (!pattern.holographicRecord) continue;
      
      const reconstruction = reconstructFromRecord(pattern.holographicRecord, pulsars, simulationTime);
      
      for (const nodeId of pattern.storedAt) {
        if (fidelities[nodeId] === undefined) {
          fidelities[nodeId] = reconstruction.fidelity;
        } else {
          // Average if multiple patterns on same node
          fidelities[nodeId] = (fidelities[nodeId] + reconstruction.fidelity) / 2;
        }
      }
    }
    
    return fidelities;
  }, [patterns, holographicRecords, pulsars, simulationTime]);

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffd700" />
      <Stars radius={50} depth={50} count={2000} factor={2} />
      
      {/* Galactic center */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffd700" emissive="#ff8800" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Light-time rings */}
      <LightTimeRings show={showLightTimeRings} />
      
      {/* Pattern connection lines */}
      <PatternConnections 
        nodes={nodes} 
        patterns={patterns} 
        highlightedPattern={highlightedPattern}
      />
      
      {/* Memory nodes */}
      {nodes.map((node) => (
        <MemoryNodeMesh
          key={node.id}
          node={node}
          isSelected={node.id === selectedNode}
          isHighlighted={highlightedNodeIds.has(node.id)}
          showLabel={showLabels}
          fidelity={nodeFidelities[node.id] ?? 1}
          onClick={() => onSelectNode(node.id)}
        />
      ))}
      
      {/* Animated pulsars */}
      {pulsars.map((pulsar) => (
        <AnimatedPulsar key={pulsar.id} pulsar={pulsar} />
      ))}
      
      <OrbitControls enablePan enableZoom enableRotate />
    </>
  );
}
