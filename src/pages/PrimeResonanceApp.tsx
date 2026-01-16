import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Zap, Target } from 'lucide-react';
import { usePrimeResonance } from '@/hooks/usePrimeResonance';
import {
  HilbertSpaceViz,
  ProbabilityBars,
  EntropyTimeline,
  OperatorButtons,
  StateDisplay,
  FormalismPanel
} from '@/components/prime-resonance';

export default function PrimeResonanceApp() {
  const {
    state, evolution, history, isEvolving, measurements,
    initUniform, initBasis, applyOperator, performMeasurement,
    startEvolution, stopEvolution, getStateInfo, PRIMES
  } = usePrimeResonance();
  
  const [superpositionSize, setSuperpositionSize] = useState(16);
  const stateInfo = getStateInfo();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Prime Resonance Formalism
            </h1>
            <p className="text-xs text-muted-foreground">Quantum-like computation in Prime Hilbert Space ℋ_P</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => initUniform(superpositionSize)}>
              <RotateCcw className="h-3 w-3 mr-1" /> Reset
            </Button>
            {isEvolving ? (
              <Button size="sm" variant="destructive" onClick={stopEvolution}>
                <Pause className="h-3 w-3 mr-1" /> Stop
              </Button>
            ) : (
              <Button size="sm" onClick={() => startEvolution()}>
                <Play className="h-3 w-3 mr-1" /> Evolve
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: State Visualization */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs flex items-center justify-between">
                  Hilbert Space |ψ⟩
                  <Badge variant="outline" className="text-[10px]">
                    {evolution.collapsed ? 'Collapsed' : 'Superposition'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 flex justify-center">
                <HilbertSpaceViz state={state} size={260} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">Entropy Evolution S(t)</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <EntropyTimeline history={history} current={evolution} height={100} />
              </CardContent>
            </Card>
          </div>

          {/* Center: Controls & Probability */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">State Initialization</CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-16">dim(ℋ):</span>
                  <Slider
                    value={[superpositionSize]}
                    onValueChange={([v]) => setSuperpositionSize(v)}
                    min={2} max={32} step={1}
                    className="flex-1"
                  />
                  <span className="text-xs font-mono w-6">{superpositionSize}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => initUniform(superpositionSize)}>
                    Uniform |ψ⟩
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => initBasis(PRIMES[0])}>
                    |2⟩
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => initBasis(7)}>
                    |7⟩
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs">Resonance Operators</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <OperatorButtons onApply={applyOperator} disabled={isEvolving} />
                <div className="mt-3">
                  <StateDisplay
                    primes={stateInfo.primes}
                    dominant={evolution.dominant}
                    entropy={evolution.entropy}
                    collapsed={evolution.collapsed}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2 px-3">
                <CardTitle className="text-xs flex items-center justify-between">
                  Probability Distribution |α_p|²
                  <Button size="sm" variant="secondary" className="h-6 text-[10px]" onClick={performMeasurement}>
                    <Target className="h-3 w-3 mr-1" /> Measure
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <ProbabilityBars state={state} measurements={measurements} height={140} />
              </CardContent>
            </Card>
          </div>

          {/* Right: Formalism */}
          <div>
            <FormalismPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
