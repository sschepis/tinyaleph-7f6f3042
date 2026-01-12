import React from 'react';
import { SMFState, SMF_AXES } from '../types';

interface SMFRadarChartProps {
  smf: SMFState | null;
  size?: number;
}

export const SMFRadarChart: React.FC<SMFRadarChartProps> = ({ smf, size = 300 }) => {
  const center = size / 2;
  const radius = size / 2 - 40;
  const numAxes = 16;

  const getPoint = (index: number, value: number) => {
    const angle = (index / numAxes) * 2 * Math.PI - Math.PI / 2;
    const r = Math.abs(value) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const values = smf?.s ? Array.from(smf.s) : new Array(16).fill(0.1);

  // Create polygon points
  const polygonPoints = values
    .map((v, i) => {
      const point = getPoint(i, Math.min(1, Math.abs(v)));
      return `${point.x},${point.y}`;
    })
    .join(' ');

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* Background circles */}
      {[0.25, 0.5, 0.75, 1].map(scale => (
        <circle
          key={scale}
          cx={center}
          cy={center}
          r={radius * scale}
          fill="none"
          stroke="hsl(var(--muted-foreground))"
          strokeOpacity={0.2}
        />
      ))}

      {/* Axis lines */}
      {SMF_AXES.map((axis, i) => {
        const angle = (i / numAxes) * 2 * Math.PI - Math.PI / 2;
        const endX = center + radius * Math.cos(angle);
        const endY = center + radius * Math.sin(angle);
        const labelX = center + (radius + 25) * Math.cos(angle);
        const labelY = center + (radius + 25) * Math.sin(angle);

        return (
          <g key={axis}>
            <line
              x1={center}
              y1={center}
              x2={endX}
              y2={endY}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.3}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[8px] fill-muted-foreground"
            >
              {axis.slice(0, 4)}
            </text>
          </g>
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPoints}
        fill="hsl(var(--primary))"
        fillOpacity={0.3}
        stroke="hsl(var(--primary))"
        strokeWidth={2}
      />

      {/* Data points */}
      {values.map((v, i) => {
        const point = getPoint(i, Math.min(1, Math.abs(v)));
        const hue = (i / 16) * 360;
        return (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={4}
            fill={`hsl(${hue}, 70%, 50%)`}
          />
        );
      })}
    </svg>
  );
};
