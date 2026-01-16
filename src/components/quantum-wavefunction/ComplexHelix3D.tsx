import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Line } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpectrumAnalysis, SMALL_PRIMES } from '@/lib/quantum-wavefunction';
import * as THREE from 'three';

interface ComplexHelix3DProps {
  spectrum: SpectrumAnalysis;
}

function HelixCurve({ spectrum }: { spectrum: SpectrumAnalysis }) {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  // Generate helix points from wave function
  const { helixPoints, primeMarkers, maxMag } = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const markers: Array<{ position: THREE.Vector3; prime: number }> = [];
    
    const { points: spectrumPoints, primes } = spectrum;
    const primeSet = new Set(primes);
    
    // Normalize and scale
    const maxMagnitude = Math.max(...spectrumPoints.map(p => p.psiMag), 0.1);
    const xMin = spectrumPoints[0]?.x || 2;
    const xMax = spectrumPoints[spectrumPoints.length - 1]?.x || 100;
    const xRange = xMax - xMin;
    
    // Sample every nth point for performance
    const step = Math.max(1, Math.floor(spectrumPoints.length / 200));
    
    for (let i = 0; i < spectrumPoints.length; i += step) {
      const pt = spectrumPoints[i];
      
      // Map x to z-axis (depth)
      const z = ((pt.x - xMin) / xRange) * 8 - 4;
      
      // Re(ψ) and Im(ψ) as x and y
      const scale = 2 / maxMagnitude;
      const x = pt.psiReal * scale;
      const y = pt.psiImag * scale;
      
      points.push(new THREE.Vector3(x, y, z));
      
      // Check if near a prime
      const nearPrime = SMALL_PRIMES.find(p => Math.abs(pt.x - p) < 0.5);
      if (nearPrime && !markers.some(m => m.prime === nearPrime)) {
        markers.push({ position: new THREE.Vector3(x, y, z), prime: nearPrime });
      }
    }
    
    return { helixPoints: points, primeMarkers: markers, maxMag: maxMagnitude };
  }, [spectrum]);

  return (
    <group ref={meshRef}>
      {/* Main helix curve */}
      {helixPoints.length > 1 && (
        <Line
          points={helixPoints}
          color="#22d3ee"
          lineWidth={2}
          transparent
          opacity={0.8}
        />
      )}
      
      {/* Prime markers as glowing spheres */}
      {primeMarkers.map(({ position, prime }) => (
        <group key={prime} position={position}>
          <mesh>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial 
              color="#a855f7" 
              emissive="#a855f7"
              emissiveIntensity={0.5}
            />
          </mesh>
          <Text
            position={[0, 0.25, 0]}
            fontSize={0.15}
            color="#a855f7"
            anchorX="center"
            anchorY="middle"
          >
            {prime}
          </Text>
        </group>
      ))}
      
      {/* Axis lines */}
      <Line points={[[-3, 0, 0], [3, 0, 0]]} color="#334155" lineWidth={1} />
      <Line points={[[0, -3, 0], [0, 3, 0]]} color="#334155" lineWidth={1} />
      <Line points={[[0, 0, -5], [0, 0, 5]]} color="#334155" lineWidth={1} />
      
      {/* Axis labels */}
      <Text position={[3.3, 0, 0]} fontSize={0.2} color="#64748b">Re(ψ)</Text>
      <Text position={[0, 3.3, 0]} fontSize={0.2} color="#64748b">Im(ψ)</Text>
      <Text position={[0, 0, 5.3]} fontSize={0.2} color="#64748b">x</Text>
    </group>
  );
}

export function ComplexHelix3D({ spectrum }: ComplexHelix3DProps) {
  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center justify-between">
          <span>3D Complex Wavefunction ψ(x) ∈ ℂ</span>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-[9px] bg-cyan-500/10 text-cyan-400">Re(ψ)</Badge>
            <Badge variant="outline" className="text-[9px] bg-violet-500/10 text-violet-400">Im(ψ)</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] w-full bg-black/50 rounded-b-lg">
          <Canvas
            camera={{ position: [5, 3, 5], fov: 50 }}
            style={{ background: 'transparent' }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
            <HelixCurve spectrum={spectrum} />
            <OrbitControls 
              enableZoom={true} 
              enablePan={false}
              minDistance={3}
              maxDistance={15}
            />
          </Canvas>
        </div>
        <div className="px-3 py-2 text-[9px] text-muted-foreground text-center border-t border-border">
          Drag to rotate • Scroll to zoom • Purple spheres mark primes
        </div>
      </CardContent>
    </Card>
  );
}
