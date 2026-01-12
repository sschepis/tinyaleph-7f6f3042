import React from 'react';

interface HolographicFieldVizProps {
  intensity: number[][];
  size?: number;
}

export const HolographicFieldViz: React.FC<HolographicFieldVizProps> = ({ intensity, size = 150 }) => {
  const gridSize = intensity.length || 16;
  const cellSize = size / gridSize;

  // Find max for normalization
  let maxVal = 0;
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (intensity[x]?.[y] > maxVal) maxVal = intensity[x][y];
    }
  }
  if (maxVal === 0) maxVal = 1;

  return (
    <svg width={size} height={size} className="mx-auto border rounded">
      {intensity.map((row, x) =>
        row.map((val, y) => {
          const normalized = val / maxVal;
          const brightness = Math.floor(normalized * 255);
          return (
            <rect
              key={`${x}-${y}`}
              x={y * cellSize}
              y={x * cellSize}
              width={cellSize}
              height={cellSize}
              fill={`rgb(${brightness}, ${Math.floor(brightness * 0.5)}, ${255 - brightness})`}
            />
          );
        })
      )}
    </svg>
  );
};
