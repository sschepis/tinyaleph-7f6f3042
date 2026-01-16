import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpectrumAnalysis } from '@/lib/quantum-wavefunction';

interface WavefunctionPlotProps {
  spectrum: SpectrumAnalysis;
  showResonance?: boolean;
  showTunneling?: boolean;
  height?: number;
}

export function WavefunctionPlot({ 
  spectrum, 
  showResonance = true, 
  showTunneling = true,
  height = 200 
}: WavefunctionPlotProps) {
  const { points, primes, maxMagnitude } = spectrum;
  
  // Create SVG path for wave function magnitude
  const wavePath = useMemo(() => {
    if (points.length === 0) return '';
    
    const width = 100;
    const xMin = points[0].x;
    const xMax = points[points.length - 1].x;
    const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const yScale = (y: number) => (1 - y / (maxMagnitude * 1.2)) * 100;
    
    let path = `M ${xScale(points[0].x)} ${yScale(points[0].psiMag)}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${xScale(points[i].x)} ${yScale(points[i].psiMag)}`;
    }
    return path;
  }, [points, maxMagnitude]);

  // Create path for resonance
  const resonancePath = useMemo(() => {
    if (!showResonance || points.length === 0) return '';
    
    const width = 100;
    const xMin = points[0].x;
    const xMax = points[points.length - 1].x;
    const xScale = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const maxRes = Math.max(...points.map(p => p.resonance), 0.1);
    const yScale = (y: number) => (1 - y / (maxRes * 1.2)) * 100;
    
    let path = `M ${xScale(points[0].x)} ${yScale(points[0].resonance)}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${xScale(points[i].x)} ${yScale(points[i].resonance)}`;
    }
    return path;
  }, [points, showResonance]);

  // Prime markers
  const primeMarkers = useMemo(() => {
    if (points.length === 0) return [];
    
    const xMin = points[0].x;
    const xMax = points[points.length - 1].x;
    
    return primes
      .filter(p => p >= xMin && p <= xMax)
      .map(p => ({
        prime: p,
        x: ((p - xMin) / (xMax - xMin)) * 100
      }));
  }, [points, primes]);

  return (
    <Card>
      <CardHeader className="py-2 px-3">
        <CardTitle className="text-xs flex items-center justify-between">
          Wave Function |ψ(x)|
          <div className="flex gap-1">
            <Badge variant="outline" className="text-[9px] bg-cyan-500/10 text-cyan-400">ψ(x)</Badge>
            {showResonance && (
              <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-400">R(x)</Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <svg 
          viewBox="0 0 100 100" 
          className="w-full" 
          style={{ height }}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.1" opacity="0.1" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          
          {/* Prime vertical lines */}
          {primeMarkers.map(({ prime, x }) => (
            <g key={prime}>
              <line
                x1={x}
                y1={0}
                x2={x}
                y2={100}
                stroke="hsl(var(--primary))"
                strokeWidth="0.3"
                opacity="0.3"
              />
              <text
                x={x}
                y={98}
                fontSize="3"
                fill="hsl(var(--primary))"
                textAnchor="middle"
                opacity="0.7"
              >
                {prime}
              </text>
            </g>
          ))}
          
          {/* Resonance path */}
          {showResonance && resonancePath && (
            <path
              d={resonancePath}
              fill="none"
              stroke="hsl(142 76% 36%)"
              strokeWidth="0.5"
              opacity="0.6"
            />
          )}
          
          {/* Wave function path */}
          {wavePath && (
            <path
              d={wavePath}
              fill="none"
              stroke="hsl(187 92% 50%)"
              strokeWidth="0.8"
              className="drop-shadow-sm"
            />
          )}
          
          {/* Prime markers on wave */}
          {primeMarkers.map(({ prime, x }) => {
            const point = points.find(p => Math.abs(p.x - prime) < 0.5);
            if (!point) return null;
            const y = (1 - point.psiMag / (maxMagnitude * 1.2)) * 100;
            return (
              <circle
                key={`marker-${prime}`}
                cx={x}
                cy={y}
                r="1.5"
                fill="hsl(var(--primary))"
                className="animate-pulse"
              />
            );
          })}
        </svg>
        
        {/* X-axis label */}
        <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
          <span>{points[0]?.x.toFixed(0)}</span>
          <span>x →</span>
          <span>{points[points.length - 1]?.x.toFixed(0)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
