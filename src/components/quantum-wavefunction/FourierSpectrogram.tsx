import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WaveformParams, RIEMANN_ZEROS, SMALL_PRIMES } from '@/lib/quantum-wavefunction/types';
import { Badge } from '@/components/ui/badge';

interface FourierSpectrogramProps {
  params: WaveformParams;
  xRange: [number, number];
}

export function FourierSpectrogram({ params, xRange }: FourierSpectrogramProps) {
  const spectrogramData = useMemo(() => {
    const resolution = 128;
    const numFreqs = 32;
    const results: { t: number; spectrum: number[]; maxAmp: number }[] = [];
    
    // Generate spectrum for each Riemann zero
    for (const t of RIEMANN_ZEROS) {
      const signal: number[] = [];
      
      // Generate wavefunction for this t value
      for (let i = 0; i < resolution; i++) {
        const x = xRange[0] + (i / (resolution - 1)) * (xRange[1] - xRange[0]);
        if (x <= 1) {
          signal.push(0);
          continue;
        }
        
        const logX = Math.log(x);
        const sqrtX = Math.sqrt(x);
        
        // Compute wavefunction magnitude
        let psiReal = Math.cos(t * logX) / sqrtX;
        let psiImag = Math.sin(t * logX) / sqrtX;
        
        // Add prime resonance
        for (const p of SMALL_PRIMES) {
          if (p > x) break;
          const logP = Math.log(p);
          const dist = Math.abs(x - p);
          const resonance = Math.exp(-dist * dist / (2 * params.resonanceWidth * params.resonanceWidth));
          psiReal += resonance * Math.cos(t * logP) * params.V0;
          psiImag += resonance * Math.sin(t * logP) * params.V0;
        }
        
        signal.push(Math.sqrt(psiReal * psiReal + psiImag * psiImag));
      }
      
      // Compute DFT for selected frequencies
      const spectrum: number[] = [];
      for (let k = 0; k < numFreqs; k++) {
        let real = 0, imag = 0;
        for (let n = 0; n < signal.length; n++) {
          const angle = (2 * Math.PI * k * n) / signal.length;
          real += signal[n] * Math.cos(angle);
          imag -= signal[n] * Math.sin(angle);
        }
        spectrum.push(Math.sqrt(real * real + imag * imag) / signal.length);
      }
      
      const maxAmp = Math.max(...spectrum.slice(1)); // Skip DC
      results.push({ t, spectrum, maxAmp });
    }
    
    return results;
  }, [params, xRange]);

  // Find global max for normalization
  const globalMax = useMemo(() => {
    return Math.max(...spectrogramData.flatMap(d => d.spectrum.slice(1)));
  }, [spectrogramData]);

  // Color mapping function (viridis-like)
  const getColor = (value: number, max: number) => {
    const normalized = max > 0 ? value / max : 0;
    const hue = 260 - normalized * 200; // Purple to yellow
    const saturation = 70 + normalized * 30;
    const lightness = 20 + normalized * 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  const cellWidth = 20;
  const cellHeight = 24;
  const labelWidth = 50;
  const topPadding = 30;

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-primary">📊</span>
          Fourier Spectrogram
          <Badge variant="outline" className="ml-auto text-xs">
            γ₁ → γ₁₀
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          Frequency spectrum evolution across first 10 Riemann zeros. Brighter = stronger component.
        </p>
        
        <div className="overflow-x-auto">
          <svg 
            width={labelWidth + 32 * cellWidth + 60} 
            height={topPadding + RIEMANN_ZEROS.length * cellHeight + 40}
            className="mx-auto"
          >
            {/* Frequency axis labels */}
            <text x={labelWidth + 16 * cellWidth} y={15} textAnchor="middle" className="fill-muted-foreground text-xs">
              Frequency Index (k)
            </text>
            {[0, 8, 16, 24, 31].map(k => (
              <text 
                key={k} 
                x={labelWidth + k * cellWidth + cellWidth/2} 
                y={topPadding - 5} 
                textAnchor="middle" 
                className="fill-muted-foreground text-[10px]"
              >
                {k}
              </text>
            ))}
            
            {/* Y-axis label */}
            <text 
              x={12} 
              y={topPadding + (RIEMANN_ZEROS.length * cellHeight) / 2} 
              textAnchor="middle" 
              className="fill-muted-foreground text-xs"
              transform={`rotate(-90, 12, ${topPadding + (RIEMANN_ZEROS.length * cellHeight) / 2})`}
            >
              Riemann Zero (γ)
            </text>
            
            {/* Spectrogram cells */}
            {spectrogramData.map((row, rowIdx) => (
              <g key={row.t}>
                {/* Row label */}
                <text 
                  x={labelWidth - 5} 
                  y={topPadding + rowIdx * cellHeight + cellHeight/2 + 4} 
                  textAnchor="end" 
                  className="fill-muted-foreground text-[10px]"
                >
                  γ{rowIdx + 1}
                </text>
                
                {/* Spectrum cells */}
                {row.spectrum.slice(0, 32).map((amp, freqIdx) => (
                  <rect
                    key={freqIdx}
                    x={labelWidth + freqIdx * cellWidth}
                    y={topPadding + rowIdx * cellHeight}
                    width={cellWidth - 1}
                    height={cellHeight - 1}
                    fill={getColor(amp, globalMax)}
                    rx={2}
                  >
                    <title>
                      γ{rowIdx + 1} = {row.t.toFixed(2)}, k={freqIdx}, amp={amp.toFixed(4)}
                    </title>
                  </rect>
                ))}
                
                {/* Max amplitude indicator */}
                <text 
                  x={labelWidth + 32 * cellWidth + 5} 
                  y={topPadding + rowIdx * cellHeight + cellHeight/2 + 4} 
                  className="fill-muted-foreground text-[9px]"
                >
                  {row.maxAmp.toFixed(3)}
                </text>
              </g>
            ))}
            
            {/* Color legend */}
            <defs>
              <linearGradient id="spectrogramGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={getColor(0, 1)} />
                <stop offset="50%" stopColor={getColor(0.5, 1)} />
                <stop offset="100%" stopColor={getColor(1, 1)} />
              </linearGradient>
            </defs>
            
            <g transform={`translate(${labelWidth + 32 * cellWidth + 25}, ${topPadding})`}>
              <rect width={15} height={RIEMANN_ZEROS.length * cellHeight} fill="url(#spectrogramGradient)" rx={2} />
              <text x={20} y={10} className="fill-muted-foreground text-[9px]">max</text>
              <text x={20} y={RIEMANN_ZEROS.length * cellHeight} className="fill-muted-foreground text-[9px]">0</text>
            </g>
          </svg>
        </div>
        
        {/* Observations */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <h4 className="text-sm font-medium mb-2">Pattern Analysis</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• <strong>Vertical bands:</strong> Frequencies that persist across all zeros</li>
            <li>• <strong>Horizontal variation:</strong> Spectral signature unique to each γ</li>
            <li>• <strong>Diagonal patterns:</strong> Frequency-zero coupling effects</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
