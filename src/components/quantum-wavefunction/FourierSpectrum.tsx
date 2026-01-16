import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SpectrumAnalysis } from '@/lib/quantum-wavefunction/types';

interface FourierSpectrumProps {
  spectrum: SpectrumAnalysis;
  height?: number;
}

// Simple DFT implementation (for visualization purposes)
function computeDFT(signal: number[]): { frequency: number; magnitude: number; phase: number }[] {
  const N = signal.length;
  const result: { frequency: number; magnitude: number; phase: number }[] = [];
  
  // Only compute first half (Nyquist limit)
  const halfN = Math.floor(N / 2);
  
  for (let k = 0; k < halfN; k++) {
    let realSum = 0;
    let imagSum = 0;
    
    for (let n = 0; n < N; n++) {
      const angle = (2 * Math.PI * k * n) / N;
      realSum += signal[n] * Math.cos(angle);
      imagSum -= signal[n] * Math.sin(angle);
    }
    
    const magnitude = Math.sqrt(realSum * realSum + imagSum * imagSum) / N;
    const phase = Math.atan2(imagSum, realSum);
    
    result.push({
      frequency: k,
      magnitude: isFinite(magnitude) ? magnitude : 0,
      phase: isFinite(phase) ? phase : 0
    });
  }
  
  return result;
}

export function FourierSpectrum({ spectrum, height = 180 }: FourierSpectrumProps) {
  const width = 500;
  
  const fourierData = useMemo(() => {
    // Extract wavefunction magnitudes as signal
    const signal = spectrum.points.map(p => isFinite(p.psiMag) ? p.psiMag : 0);
    
    if (signal.length < 4) {
      return { spectrum: [], maxMag: 0, dominantFreqs: [] };
    }
    
    const dft = computeDFT(signal);
    const maxMag = Math.max(...dft.map(d => d.magnitude), 0.001);
    
    // Find dominant frequencies (peaks)
    const dominantFreqs = dft
      .map((d, i) => ({ ...d, index: i }))
      .filter((d, i, arr) => {
        if (i === 0 || i === arr.length - 1) return false;
        return d.magnitude > arr[i - 1].magnitude && d.magnitude > arr[i + 1].magnitude;
      })
      .sort((a, b) => b.magnitude - a.magnitude)
      .slice(0, 5);
    
    return { spectrum: dft, maxMag, dominantFreqs };
  }, [spectrum.points]);

  const { spectrum: dftSpectrum, maxMag, dominantFreqs } = fourierData;
  
  if (dftSpectrum.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur border-primary/20">
        <CardContent className="p-4 text-center text-muted-foreground text-sm">
          Insufficient data for Fourier analysis
        </CardContent>
      </Card>
    );
  }

  const barWidth = width / dftSpectrum.length;

  // Generate path for magnitude spectrum
  const spectrumPath = dftSpectrum.map((point, i) => {
    const x = (i / dftSpectrum.length) * width;
    const y = height - 20 - (point.magnitude / maxMag) * (height - 30);
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Generate filled area
  const areaPath = spectrumPath + ` L ${width} ${height - 20} L 0 ${height - 20} Z`;

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500" />
          Fourier Spectrum
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Dominant frequencies */}
        <div className="flex flex-wrap gap-2">
          {dominantFreqs.slice(0, 4).map((freq, i) => (
            <Badge 
              key={i} 
              variant="outline" 
              className="text-[10px] bg-orange-500/10 border-orange-500/30"
            >
              f={freq.frequency} | A={freq.magnitude.toFixed(3)}
            </Badge>
          ))}
        </div>

        {/* Spectrum visualization */}
        <svg 
          width={width} 
          height={height} 
          className="w-full" 
          viewBox={`0 0 ${width} ${height}`}
        >
          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(frac => (
            <line
              key={frac}
              x1={0}
              y1={height - 20 - frac * (height - 30)}
              x2={width}
              y2={height - 20 - frac * (height - 30)}
              stroke="currentColor"
              strokeOpacity={0.1}
            />
          ))}
          
          {/* Filled spectrum area */}
          <path
            d={areaPath}
            fill="url(#spectrumGradient)"
            opacity={0.3}
          />
          
          {/* Spectrum line */}
          <path
            d={spectrumPath}
            fill="none"
            stroke="url(#spectrumLineGradient)"
            strokeWidth={2}
          />
          
          {/* Peak markers */}
          {dominantFreqs.slice(0, 4).map((freq, i) => {
            const x = (freq.index / dftSpectrum.length) * width;
            const y = height - 20 - (freq.magnitude / maxMag) * (height - 30);
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r={4}
                  fill="#f97316"
                  stroke="white"
                  strokeWidth={1}
                />
                <text
                  x={x}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-orange-400 text-[9px] font-mono"
                >
                  {freq.frequency}
                </text>
              </g>
            );
          })}
          
          {/* X-axis labels */}
          <text
            x={0}
            y={height - 5}
            className="fill-muted-foreground text-[9px]"
          >
            0
          </text>
          <text
            x={width / 2}
            y={height - 5}
            textAnchor="middle"
            className="fill-muted-foreground text-[9px]"
          >
            Frequency (cycles)
          </text>
          <text
            x={width}
            y={height - 5}
            textAnchor="end"
            className="fill-muted-foreground text-[9px]"
          >
            {Math.floor(dftSpectrum.length)}
          </text>
          
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="spectrumGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#f97316" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="spectrumLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>

        {/* Info */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Samples:</span>
            <span className="font-mono">{spectrum.points.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Freq bins:</span>
            <span className="font-mono">{dftSpectrum.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max amplitude:</span>
            <span className="font-mono">{maxMag.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dominant:</span>
            <span className="font-mono">f={dominantFreqs[0]?.frequency || 0}</span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          DFT of |ψ(x)| reveals periodic structures in the wavefunction. 
          Peaks indicate resonant frequencies correlated with prime distribution patterns.
        </p>
      </CardContent>
    </Card>
  );
}
