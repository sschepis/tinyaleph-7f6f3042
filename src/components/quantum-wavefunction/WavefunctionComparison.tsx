import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { WaveformParams, RIEMANN_ZEROS, SMALL_PRIMES } from '@/lib/quantum-wavefunction/types';
import { waveFunction, getPrimesUpTo } from '@/lib/quantum-wavefunction/engine';

interface WavefunctionComparisonProps {
  baseParams: WaveformParams;
  xRange: [number, number];
}

export function WavefunctionComparison({ baseParams, xRange }: WavefunctionComparisonProps) {
  const [zeroIndex1, setZeroIndex1] = useState(0);
  const [zeroIndex2, setZeroIndex2] = useState(1);
  const [showInterference, setShowInterference] = useState(true);
  const [showDifference, setShowDifference] = useState(false);

  const width = 600;
  const height = 200;
  const nPoints = 150;

  const comparisonData = useMemo(() => {
    const primes = getPrimesUpTo(xRange[1] + 5);
    const params1 = { ...baseParams, t: RIEMANN_ZEROS[zeroIndex1] };
    const params2 = { ...baseParams, t: RIEMANN_ZEROS[zeroIndex2] };
    
    const data: Array<{
      x: number;
      psi1: { real: number; imag: number; mag: number };
      psi2: { real: number; imag: number; mag: number };
      interference: number;
      difference: number;
    }> = [];
    
    let maxMag = 0;
    let maxInterference = 0;
    
    for (let i = 0; i < nPoints; i++) {
      const x = xRange[0] + (xRange[1] - xRange[0]) * i / (nPoints - 1);
      const psi1 = waveFunction(x, params1, primes);
      const psi2 = waveFunction(x, params2, primes);
      
      // Interference: |ψ₁ + ψ₂|²
      const sumReal = psi1.real + psi2.real;
      const sumImag = psi1.imag + psi2.imag;
      const interference = sumReal * sumReal + sumImag * sumImag;
      
      // Difference: |ψ₁| - |ψ₂|
      const difference = psi1.magnitude - psi2.magnitude;
      
      data.push({
        x,
        psi1: { real: psi1.real, imag: psi1.imag, mag: psi1.magnitude },
        psi2: { real: psi2.real, imag: psi2.imag, mag: psi2.magnitude },
        interference,
        difference
      });
      
      maxMag = Math.max(maxMag, psi1.magnitude, psi2.magnitude);
      maxInterference = Math.max(maxInterference, interference);
    }
    
    return { data, maxMag, maxInterference };
  }, [baseParams, xRange, zeroIndex1, zeroIndex2]);

  const primeMarkers = useMemo(() => {
    return SMALL_PRIMES
      .filter(p => p >= xRange[0] && p <= xRange[1])
      .map(p => ({
        prime: p,
        xPos: ((p - xRange[0]) / (xRange[1] - xRange[0])) * width
      }));
  }, [xRange]);

  const { data, maxMag, maxInterference } = comparisonData;

  // Generate SVG paths
  const path1 = data.map((point, i) => {
    const x = (i / (nPoints - 1)) * width;
    const y = height / 2 - (point.psi1.mag / (maxMag || 1)) * (height / 2 - 10);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const path2 = data.map((point, i) => {
    const x = (i / (nPoints - 1)) * width;
    const y = height / 2 - (point.psi2.mag / (maxMag || 1)) * (height / 2 - 10);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const interferencePath = data.map((point, i) => {
    const x = (i / (nPoints - 1)) * width;
    const y = height - 10 - (point.interference / (maxInterference || 1)) * (height - 20);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const differencePath = data.map((point, i) => {
    const x = (i / (nPoints - 1)) * width;
    const y = height / 2 - (point.difference / (maxMag || 1)) * (height / 2 - 10);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Calculate correlation between the two wavefunctions
  const correlation = useMemo(() => {
    const n = data.length;
    const mean1 = data.reduce((s, d) => s + d.psi1.mag, 0) / n;
    const mean2 = data.reduce((s, d) => s + d.psi2.mag, 0) / n;
    
    let cov = 0, var1 = 0, var2 = 0;
    for (const d of data) {
      const d1 = d.psi1.mag - mean1;
      const d2 = d.psi2.mag - mean2;
      cov += d1 * d2;
      var1 += d1 * d1;
      var2 += d2 * d2;
    }
    
    return cov / Math.sqrt(var1 * var2 + 0.0001);
  }, [data]);

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500" />
          Wavefunction Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Riemann Zero 1</Label>
            <Select value={zeroIndex1.toString()} onValueChange={(v) => setZeroIndex1(parseInt(v))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RIEMANN_ZEROS.map((z, i) => (
                  <SelectItem key={i} value={i.toString()} className="text-xs">
                    γ_{i+1} = {z.toFixed(3)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Riemann Zero 2</Label>
            <Select value={zeroIndex2.toString()} onValueChange={(v) => setZeroIndex2(parseInt(v))}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RIEMANN_ZEROS.map((z, i) => (
                  <SelectItem key={i} value={i.toString()} className="text-xs">
                    γ_{i+1} = {z.toFixed(3)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="interference"
              checked={showInterference}
              onCheckedChange={setShowInterference}
            />
            <Label htmlFor="interference" className="text-xs">Interference</Label>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch
              id="difference"
              checked={showDifference}
              onCheckedChange={setShowDifference}
            />
            <Label htmlFor="difference" className="text-xs">Difference</Label>
          </div>
        </div>

        {/* Correlation stat */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-xs">
            Correlation: {correlation.toFixed(4)}
          </Badge>
          <Badge variant="outline" className="text-xs bg-cyan-500/10 border-cyan-500/30">
            t₁ = {RIEMANN_ZEROS[zeroIndex1].toFixed(3)}
          </Badge>
          <Badge variant="outline" className="text-xs bg-purple-500/10 border-purple-500/30">
            t₂ = {RIEMANN_ZEROS[zeroIndex2].toFixed(3)}
          </Badge>
        </div>

        {/* Visualization */}
        <svg width={width} height={height + 30} className="w-full" viewBox={`0 0 ${width} ${height + 30}`}>
          {/* Grid */}
          <line x1={0} y1={height/2} x2={width} y2={height/2} stroke="currentColor" strokeOpacity={0.1} />
          
          {/* Prime markers */}
          {primeMarkers.map(({ prime, xPos }) => (
            <g key={prime}>
              <line
                x1={xPos}
                y1={0}
                x2={xPos}
                y2={height}
                stroke="currentColor"
                strokeWidth={1}
                strokeDasharray="2,4"
                opacity={0.2}
              />
              <text
                x={xPos}
                y={height + 15}
                textAnchor="middle"
                className="fill-muted-foreground text-[9px]"
              >
                {prime}
              </text>
            </g>
          ))}
          
          {/* Interference pattern (background) */}
          {showInterference && (
            <path
              d={interferencePath}
              fill="none"
              stroke="url(#interferenceGradient)"
              strokeWidth={2}
              opacity={0.6}
            />
          )}
          
          {/* Difference */}
          {showDifference && (
            <path
              d={differencePath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth={1.5}
              strokeDasharray="4,2"
              opacity={0.7}
            />
          )}
          
          {/* Wavefunction 1 */}
          <path
            d={path1}
            fill="none"
            stroke="#06b6d4"
            strokeWidth={2}
          />
          
          {/* Wavefunction 2 */}
          <path
            d={path2}
            fill="none"
            stroke="#a855f7"
            strokeWidth={2}
          />
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="interferenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-cyan-500" />
            <span>ψ(t₁)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-purple-500" />
            <span>ψ(t₂)</span>
          </div>
          {showInterference && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gradient-to-r from-cyan-500 via-emerald-500 to-purple-500" />
              <span>|ψ₁ + ψ₂|² interference</span>
            </div>
          )}
          {showDifference && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-amber-500 border-dashed" style={{ borderTopWidth: 2, borderStyle: 'dashed' }} />
              <span>|ψ₁| - |ψ₂| difference</span>
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground">
          Compare wave functions at two different Riemann zeros. 
          Interference shows constructive/destructive patterns where waves overlap.
        </p>
      </CardContent>
    </Card>
  );
}
