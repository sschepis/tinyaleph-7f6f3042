/**
 * Coordinate Tooltip - Shows astronomical coordinates on hover in 3D map
 */

import React, { useState, useCallback } from 'react';
import { Html } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface CoordinateData {
  // Galactic coordinates
  galacticL: number; // Galactic longitude (degrees)
  galacticB: number; // Galactic latitude (degrees)
  // Cartesian (kpc)
  x: number;
  y: number;
  z: number;
  // Distance from galactic center
  distFromCenter: number;
  // Distance from Sun (if applicable)
  distFromSun: number;
}

interface CoordinateTooltipProps {
  position: THREE.Vector3 | null;
  visible: boolean;
}

// Convert visualization coordinates back to galactic
function vizToGalactic(vizX: number, vizY: number, vizZ: number): CoordinateData {
  // Reverse the scaling: viz = galactic * 2 for x/y, * 10 for z
  const x = vizX / 2; // kpc
  const y = vizZ / 2; // Note: y and z are swapped in viz
  const z = vizY / 10;
  
  // Calculate galactic longitude and latitude
  const r = Math.sqrt(x * x + y * y);
  const galacticL = Math.atan2(y, x) * (180 / Math.PI);
  const galacticB = Math.atan2(z, r) * (180 / Math.PI);
  
  // Distance from galactic center
  const distFromCenter = Math.sqrt(x * x + y * y + z * z);
  
  // Distance from Sun (Sun is at approximately (0, 8.5, 0.025) kpc)
  const sunX = 0, sunY = 8.5, sunZ = 0.025;
  const distFromSun = Math.sqrt(
    Math.pow(x - sunX, 2) + 
    Math.pow(y - sunY, 2) + 
    Math.pow(z - sunZ, 2)
  );
  
  return {
    galacticL: galacticL < 0 ? galacticL + 360 : galacticL,
    galacticB,
    x, y, z,
    distFromCenter,
    distFromSun
  };
}

// Format coordinate for display
function formatDegrees(deg: number, precision: number = 2): string {
  const sign = deg >= 0 ? '+' : '';
  return `${sign}${deg.toFixed(precision)}°`;
}

function formatDistance(kpc: number): string {
  if (kpc < 0.001) {
    return `${(kpc * 1000000).toFixed(0)} pc`;
  } else if (kpc < 1) {
    return `${(kpc * 1000).toFixed(0)} pc`;
  } else {
    return `${kpc.toFixed(2)} kpc`;
  }
}

// The tooltip HTML component rendered in 3D space
function TooltipContent({ data }: { data: CoordinateData }) {
  return (
    <div className="bg-slate-900/95 border border-cyan-500/50 rounded-lg p-3 backdrop-blur-sm min-w-[200px] pointer-events-none">
      <div className="text-xs font-bold text-cyan-400 mb-2 flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        Galactic Coordinates
      </div>
      
      {/* Galactic coords */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
        <div className="text-gray-400">Longitude (l)</div>
        <div className="text-cyan-300 font-mono">{formatDegrees(data.galacticL)}</div>
        
        <div className="text-gray-400">Latitude (b)</div>
        <div className="text-cyan-300 font-mono">{formatDegrees(data.galacticB)}</div>
      </div>
      
      <div className="border-t border-slate-700 my-2" />
      
      {/* Cartesian */}
      <div className="text-xs font-semibold text-purple-400 mb-1">Cartesian (Galactocentric)</div>
      <div className="grid grid-cols-3 gap-1 text-xs mb-2">
        <div className="bg-slate-800 rounded px-2 py-1 text-center">
          <div className="text-gray-500">X</div>
          <div className="text-purple-300 font-mono">{data.x.toFixed(2)}</div>
        </div>
        <div className="bg-slate-800 rounded px-2 py-1 text-center">
          <div className="text-gray-500">Y</div>
          <div className="text-purple-300 font-mono">{data.y.toFixed(2)}</div>
        </div>
        <div className="bg-slate-800 rounded px-2 py-1 text-center">
          <div className="text-gray-500">Z</div>
          <div className="text-purple-300 font-mono">{data.z.toFixed(3)}</div>
        </div>
      </div>
      
      <div className="border-t border-slate-700 my-2" />
      
      {/* Distances */}
      <div className="text-xs font-semibold text-green-400 mb-1">Distances</div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <div className="text-gray-400">From GC</div>
        <div className="text-green-300 font-mono">{formatDistance(data.distFromCenter)}</div>
        
        <div className="text-gray-400">From Sol</div>
        <div className="text-green-300 font-mono">{formatDistance(data.distFromSun)}</div>
      </div>
      
      {/* Light travel info */}
      <div className="mt-2 pt-2 border-t border-slate-700 text-[10px] text-gray-500">
        Light travel from Sol: ~{(data.distFromSun * 3261.56).toFixed(0)} years
      </div>
    </div>
  );
}

export function CoordinateTooltip({ position, visible }: CoordinateTooltipProps) {
  if (!visible || !position) return null;
  
  const data = vizToGalactic(position.x, position.y, position.z);
  
  return (
    <Html
      position={[position.x, position.y + 0.3, position.z]}
      center
      style={{ pointerEvents: 'none' }}
    >
      <TooltipContent data={data} />
    </Html>
  );
}

// Hook to track mouse position for tooltip
export function useCoordinateTooltip() {
  const [tooltipPosition, setTooltipPosition] = useState<THREE.Vector3 | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setTooltipPosition(event.point.clone());
    setIsVisible(true);
  }, []);
  
  const handlePointerOut = useCallback(() => {
    setIsVisible(false);
  }, []);
  
  return {
    tooltipPosition,
    isVisible,
    handlePointerMove,
    handlePointerOut
  };
}

export default CoordinateTooltip;
