import { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Waves, Settings2, Loader2, Activity, TrendingUp, Zap } from 'lucide-react';
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
  FourierSpectrum,
  FourierSpectrogram
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
    <div className="min-h-screen bg-background p-2 lg:p-3">
      <div className="max-w-[1800px] mx-auto space-y-2">
        {/* Compact Header */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Waves className="h-4 w-4 text-primary" />
              Quantum Prime Wavefunction
            </h1>
            <div className="hidden md:flex items-center gap-1.5">
              <Badge variant="outline" className="text-[10px] py-0 h-5">
                γ = {params.t.toFixed(2)}
              </Badge>
              <Badge 
                variant={spectrum.stats.significance === 'very-high' ? 'default' : 'secondary'} 
                className="text-[10px] py-0 h-5"
              >
                ρ = {spectrum.stats.waveCorrelation.toFixed(3)}
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0 h-5">
                p = {spectrum.stats.pValue.toExponential(1)}
              </Badge>
            </div>
          </div>
          
          {/* Inline Range Controls */}
          <div className="hidden lg:flex items-center gap-4 text-[10px]">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Range:</span>
              <Slider
                value={[xRange[1]]}
                onValueChange={([v]) => setXRange([2, v])}
                min={20}
                max={200}
                step={10}
                className="w-24"
              />
              <span className="font-mono w-8">{xRange[1]}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Res:</span>
              <Slider
                value={[resolution]}
                onValueChange={([v]) => setResolution(v)}
                min={100}
                max={1000}
                step={100}
                className="w-20"
              />
              <span className="font-mono w-8">{resolution}</span>
            </div>
          </div>
        </div>

        {/* Main Grid - 6 column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-2">
          {/* Left Column: Parameters (1 col) */}
          <div className="lg:col-span-1 space-y-2">
            <ParameterControls
              params={params}
              onParamChange={handleParamChange}
              onReset={reset}
              onUseOptimal={useOptimalParams}
              onUseRiemannZero={useRiemannZero}
            />
            
            {/* Mobile Range Controls */}
            <Card className="lg:hidden">
              <CardHeader className="py-1.5 px-2">
                <CardTitle className="text-[10px] flex items-center gap-1">
                  <Settings2 className="h-3 w-3" />
                  Range
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="text-muted-foreground">Max X</span>
                    <span className="font-mono">{xRange[1]}</span>
                  </div>
                  <Slider
                    value={[xRange[1]]}
                    onValueChange={([v]) => setXRange([2, v])}
                    min={20}
                    max={200}
                    step={10}
                  />
                </div>
              </CardContent>
            </Card>

            <CorrelationPanel stats={spectrum.stats} />
            <TunnelingViz spectrum={spectrum} height={100} />
          </div>

          {/* Center: Primary Visualizations (3 cols) */}
          <div className="lg:col-span-3 space-y-2">
            {/* 2D and 3D side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <WavefunctionPlot spectrum={spectrum} height={220} />
              <Suspense fallback={
                <Card className="h-[280px]">
                  <CardContent className="h-full flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </CardContent>
                </Card>
              }>
                <ComplexHelix3D spectrum={spectrum} />
              </Suspense>
            </div>
            
            {/* Phase & Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <PhasePortrait params={params} xRange={xRange} />
              <WavefunctionComparison baseParams={params} xRange={xRange} />
            </div>
          </div>

          {/* Right Column: Analysis (2 cols) */}
          <div className="lg:col-span-2 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
              <PrimeGapAnalysis spectrum={spectrum} />
              <FourierSpectrum spectrum={spectrum} />
            </div>
            <PrimeWaveTable primeWaves={primeWaves} maxDisplay={8} />
            <FormalismInfo />
          </div>
        </div>

        {/* Full Width Spectrogram */}
        <FourierSpectrogram params={params} xRange={xRange} />
      </div>
    </div>
  );
}
