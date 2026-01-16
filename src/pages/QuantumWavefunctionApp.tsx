import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Waves, Settings2, Loader2 } from 'lucide-react';
import { useQuantumWavefunction } from '@/hooks/useQuantumWavefunction';
import {
  WavefunctionPlot,
  ParameterControls,
  CorrelationPanel,
  TunnelingViz,
  PrimeWaveTable,
  FormalismInfo,
  ComplexHelix3D,
  PrimeGapAnalysis,
  PhasePortrait,
  WavefunctionComparison,
  FourierSpectrum
} from '@/components/quantum-wavefunction';

export default function QuantumWavefunctionApp() {
  const {
    params,
    spectrum,
    primeWaves,
    xRange,
    setXRange,
    resolution,
    setResolution,
    setT,
    setV0,
    setEpsilon,
    setBeta,
    setResonanceWidth,
    useOptimalParams,
    useRiemannZero,
    reset
  } = useQuantumWavefunction();

  const handleParamChange = (key: string, value: number) => {
    switch (key) {
      case 't': setT(value); break;
      case 'V0': setV0(value); break;
      case 'epsilon': setEpsilon(value); break;
      case 'beta': setBeta(value); break;
      case 'resonanceWidth': setResonanceWidth(value); break;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Waves className="h-5 w-5 text-cyan-400" />
              Quantum Prime Wavefunction
            </h1>
            <p className="text-xs text-muted-foreground">
              Exploring prime patterns through quantum mechanical wave functions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              t = {params.t.toFixed(3)}
            </Badge>
            <Badge 
              variant={spectrum.stats.significance === 'very-high' ? 'default' : 'secondary'} 
              className="text-[10px]"
            >
              p = {spectrum.stats.pValue.toExponential(2)}
            </Badge>
          </div>
        </div>

        {/* Top Row: 2D Plot and 3D Visualization */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WavefunctionPlot spectrum={spectrum} height={280} />
          <Suspense fallback={
            <Card>
              <CardContent className="h-[340px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          }>
            <ComplexHelix3D spectrum={spectrum} />
          </Suspense>
        </div>

        {/* Phase Portrait & Comparison Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PhasePortrait params={params} xRange={xRange} />
          <WavefunctionComparison baseParams={params} xRange={xRange} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Column 1: Parameters */}
          <div className="space-y-4">
            <ParameterControls
              params={params}
              onParamChange={handleParamChange}
              onReset={reset}
              onUseOptimal={useOptimalParams}
              onUseRiemannZero={useRiemannZero}
            />
            
            {/* Range Controls */}
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs flex items-center gap-1.5">
                  <Settings2 className="h-3 w-3" />
                  Analysis Range
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Range</span>
                    <span className="font-mono">[{xRange[0]}, {xRange[1]}]</span>
                  </div>
                  <Slider
                    value={[xRange[1]]}
                    onValueChange={([v]) => setXRange([2, v])}
                    min={20}
                    max={200}
                    step={10}
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">Resolution</span>
                    <span className="font-mono">{resolution} pts</span>
                  </div>
                  <Slider
                    value={[resolution]}
                    onValueChange={([v]) => setResolution(v)}
                    min={100}
                    max={1000}
                    step={100}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Correlation & Tunneling */}
          <div className="space-y-4">
            <CorrelationPanel stats={spectrum.stats} />
            <TunnelingViz spectrum={spectrum} height={140} />
          </div>

          {/* Column 3: Prime Gap Analysis & Fourier */}
          <div className="space-y-4">
            <PrimeGapAnalysis spectrum={spectrum} />
            <FourierSpectrum spectrum={spectrum} />
          </div>

          {/* Column 4: Tables & Info */}
          <div className="space-y-4">
            <PrimeWaveTable primeWaves={primeWaves} maxDisplay={10} />
            <FormalismInfo />
          </div>
        </div>
      </div>
    </div>
  );
}
