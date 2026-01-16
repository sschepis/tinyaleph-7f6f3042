import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaveformParams, SMALL_PRIMES } from '@/lib/quantum-wavefunction/types';
import { waveFunction, getPrimesUpTo } from '@/lib/quantum-wavefunction/engine';

interface PhasePortraitProps {
  params: WaveformParams;
  xRange: [number, number];
}

// Convert phase (-π to π) to HSL color (rainbow spectrum)
function phaseToColor(phase: number): string {
  // Map phase from [-π, π] to [0, 360] for hue
  const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
  return `hsl(${hue}, 80%, 50%)`;
}

export function PhasePortrait({ params, xRange }: PhasePortraitProps) {
  const width = 600;
  const height = 80;
  const nPoints = 200;

  const phaseData = useMemo(() => {
    const primes = getPrimesUpTo(xRange[1] + 5);
    const data: Array<{ x: number; phase: number; magnitude: number; isPrime: boolean }> = [];
    
    for (let i = 0; i < nPoints; i++) {
      const x = xRange[0] + (xRange[1] - xRange[0]) * i / (nPoints - 1);
      const psi = waveFunction(x, params, primes);
      const phase = Math.atan2(psi.imag, psi.real);
      const isPrime = SMALL_PRIMES.includes(Math.round(x)) && Math.abs(x - Math.round(x)) < 0.5;
      
      data.push({ x, phase, magnitude: psi.magnitude, isPrime });
    }
    
    return data;
  }, [params, xRange]);

  const primeMarkers = useMemo(() => {
    return SMALL_PRIMES
      .filter(p => p >= xRange[0] && p <= xRange[1])
      .map(p => ({
        prime: p,
        xPos: ((p - xRange[0]) / (xRange[1] - xRange[0])) * width
      }));
  }, [xRange]);

  const barWidth = width / nPoints;

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500" />
          Phase Portrait: arg(ψ)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <svg width={width} height={height + 40} className="w-full" viewBox={`0 0 ${width} ${height + 40}`}>
            {/* Phase color bars */}
            {phaseData.map((point, i) => (
              <rect
                key={i}
                x={i * barWidth}
                y={0}
                width={barWidth + 0.5}
                height={height}
                fill={phaseToColor(point.phase)}
                opacity={0.3 + 0.7 * Math.min(point.magnitude * 2, 1)}
              />
            ))}
            
            {/* Magnitude overlay line */}
            <path
              d={phaseData.map((point, i) => {
                const x = i * barWidth;
                const y = height - (point.magnitude * height * 0.8);
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke="white"
              strokeWidth={2}
              opacity={0.8}
            />
            
            {/* Prime markers */}
            {primeMarkers.map(({ prime, xPos }) => (
              <g key={prime}>
                <line
                  x1={xPos}
                  y1={0}
                  x2={xPos}
                  y2={height}
                  stroke="white"
                  strokeWidth={1}
                  strokeDasharray="2,2"
                  opacity={0.5}
                />
                <circle
                  cx={xPos}
                  cy={height}
                  r={3}
                  fill="white"
                />
                <text
                  x={xPos}
                  y={height + 15}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {prime}
                </text>
              </g>
            ))}
          </svg>
          
          {/* Color legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-32 h-3 rounded" style={{
                background: 'linear-gradient(to right, hsl(0, 80%, 50%), hsl(60, 80%, 50%), hsl(120, 80%, 50%), hsl(180, 80%, 50%), hsl(240, 80%, 50%), hsl(300, 80%, 50%), hsl(360, 80%, 50%))'
              }} />
              <span>Phase: -π → +π</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-white" />
              <span>|ψ| magnitude</span>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Color represents complex phase arg(ψ) = atan2(Im(ψ), Re(ψ)). Brightness modulated by magnitude.
            White line shows |ψ|. Dashed lines mark prime positions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
