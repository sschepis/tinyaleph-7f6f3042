import React, { useMemo, useRef, useCallback } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Star } from "@/lib/pulsar-transceiver/star-catalog";
import { starToVizPositionTuple } from "@/lib/pulsar-transceiver/star-viz";

function hexToRgb01(hex: string): [number, number, number] {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return [1, 1, 1];
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  return [r / 255, g / 255, b / 255];
}

export function StarFieldPoints({
  stars,
  onSelect,
  onHover,
  onUnhover,
}: {
  stars: Star[];
  onSelect: (star: Star, position: THREE.Vector3) => void;
  onHover?: (position: THREE.Vector3) => void;
  onUnhover?: () => void;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(stars.length * 3);
    const col = new Float32Array(stars.length * 3);

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const [x, y, z] = starToVizPositionTuple(s);
      const [r, g, b] = hexToRgb01(s.color);

      const j = i * 3;
      pos[j] = x;
      pos[j + 1] = y;
      pos[j + 2] = z;

      col[j] = r;
      col[j + 1] = g;
      col[j + 2] = b;
    }

    return { positions: pos, colors: col };
  }, [stars]);

  // Subtle global twinkle (cheap & effective for dense point clouds)
  useFrame(({ clock }) => {
    const mat = pointsRef.current?.material;
    if (mat && mat instanceof THREE.PointsMaterial) {
      mat.opacity = 0.75 + 0.10 * Math.sin(clock.elapsedTime * 0.9);
    }
  });

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      const idx = (e as unknown as { index?: number }).index;
      if (typeof idx !== "number") return;

      const star = stars[idx];
      const [x, y, z] = starToVizPositionTuple(star);
      onSelect(star, new THREE.Vector3(x, y, z));
    },
    [onSelect, stars]
  );

  const handleMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      onHover?.(e.point.clone());
    },
    [onHover]
  );

  return (
    <points
      ref={pointsRef}
      onClick={handleClick}
      onPointerMove={handleMove}
      onPointerLeave={onUnhover}
    >
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          itemSize={3}
          count={stars.length}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          itemSize={3}
          count={stars.length}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        transparent
        opacity={0.8}
        size={0.09}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
