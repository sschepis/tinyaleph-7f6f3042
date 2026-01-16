import { Suspense, useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Waves, Loader2 } from 'lucide-react';
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
import { AppHelpDialog, HelpButton, useFirstRun } from '@/components/app-help';
import { QUANTUM_WAVEFUNCTION_HELP } from '@/components/quantum-wavefunction/HelpContent';

export default function QuantumWavefunctionApp() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [isFirstRun, markAsSeen] = useFirstRun('quantum-wavefunction');
  
  useEffect(() => {
    if (isFirstRun) {
      setHelpOpen(true);
      markAsSeen();
    }
  }, [isFirstRun, markAsSeen]);
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
      <div className="max-w-[1920px] mx-auto space-y-2">
        {/* Compact Header */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Waves className="h-4 w-4 text-primary" />
              Quantum Prime Wavefunction
            </h1>
            <HelpButton onClick={() => setHelpOpen(true)} />
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

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-2">
          {/* Left Sidebar - Controls */}
          <div className="hidden lg:flex flex-col gap-2 w-[200px] shrink-0">
            <ParameterControls
              params={params}
              onParamChange={handleParamChange}
              onReset={reset}
              onUseOptimal={useOptimalParams}
              onUseRiemannZero={useRiemannZero}
            />
            <CorrelationPanel stats={spectrum.stats} />
            <TunnelingViz spectrum={spectrum} height={100} />
            <PrimeWaveTable primeWaves={primeWaves} maxDisplay={8} />
            <FormalismInfo />
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-2 min-w-0">
            {/* Row 1: Wavefunction Plot + 3D */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-2">
              <div className="xl:col-span-3">
                <WavefunctionPlot spectrum={spectrum} height={260} />
              </div>
              <div className="xl:col-span-2">
                <Suspense fallback={
                  <Card className="h-[320px]">
                    <CardContent className="h-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </CardContent>
                  </Card>
                }>
                  <ComplexHelix3D spectrum={spectrum} />
                </Suspense>
              </div>
            </div>

            {/* Row 2: Phase Portrait + Comparison */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
              <PhasePortrait params={params} xRange={xRange} />
              <WavefunctionComparison baseParams={params} xRange={xRange} />
            </div>

            {/* Row 3: Fourier Spectrum + Prime Gap Analysis */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2">
              <FourierSpectrum spectrum={spectrum} />
              <PrimeGapAnalysis spectrum={spectrum} />
            </div>

            {/* Row 4: Spectrogram */}
            <FourierSpectrogram params={params} xRange={xRange} />
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="lg:hidden grid grid-cols-2 gap-2">
          <ParameterControls
            params={params}
            onParamChange={handleParamChange}
            onReset={reset}
            onUseOptimal={useOptimalParams}
            onUseRiemannZero={useRiemannZero}
          />
          <div className="space-y-2">
            <CorrelationPanel stats={spectrum.stats} />
            <TunnelingViz spectrum={spectrum} height={80} />
          </div>
        </div>
      </div>
      
      <AppHelpDialog 
        open={helpOpen} 
        onOpenChange={setHelpOpen} 
        steps={QUANTUM_WAVEFUNCTION_HELP}
        appName="Quantum Wavefunction"
      />
    </div>
  );
}
