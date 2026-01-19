import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, RotateCcw, Zap, Thermometer, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useVacuumComputation } from '@/hooks/useVacuumComputation';
import { AppHelpDialog, HelpButton } from '@/components/app-help';
import { helpSteps } from '@/components/vacuum-computation/HelpContent';
import { useFirstRun } from '@/hooks/useFirstRun';

const VacuumComputationLab = () => {
  const {
    field, circuit, isRunning, time, mode, inputs, result, metrics,
    history, selectedPreset, temperature, efficiency, presets,
    loadPreset, toggleInput, runSimulation, reset, toggleRunning, setTemperature
  } = useVacuumComputation();

  const [isFirstRun, markAsSeen] = useFirstRun('vacuum-computation-lab');
  const [helpOpen, setHelpOpen] = useState(isFirstRun);

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Vacuum Computation Lab</h1>
              <p className="text-xs text-muted-foreground">Entropy-based logical operations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isRunning ? 'default' : 'secondary'}>
              {isRunning ? 'Running' : 'Paused'}
            </Badge>
            <Button variant="outline" size="sm" onClick={toggleRunning}>
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <HelpButton onClick={() => setHelpOpen(true)} />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel - Controls */}
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Circuit Preset</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={String(selectedPreset)} onValueChange={v => loadPreset(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {presets.map((p, i) => (
                      <SelectItem key={i} value={String(i)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {circuit && (
                  <p className="text-xs text-muted-foreground">{presets[selectedPreset]?.description}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {presets[selectedPreset]?.inputLabels.map((label, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{label}</span>
                    <Button
                      size="sm"
                      variant={inputs[i] ? 'default' : 'outline'}
                      onClick={() => toggleInput(i)}
                    >
                      {inputs[i] ? '1' : '0'}
                    </Button>
                  </div>
                ))}
                <Button className="w-full mt-2" onClick={runSimulation}>
                  <Zap className="w-4 h-4 mr-2" /> Run Simulation
                </Button>
                <Button variant="outline" className="w-full" onClick={reset}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Thermometer className="w-4 h-4" /> Temperature
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Slider
                  value={[temperature]}
                  onValueChange={([v]) => setTemperature(v)}
                  min={1}
                  max={1000}
                  step={1}
                />
                <p className="text-xs text-center mt-2">{temperature} K</p>
              </CardContent>
            </Card>
          </div>

          {/* Center - Visualization */}
          <div className="col-span-6 space-y-4">
            <Card className="h-[300px]">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Vacuum Fluctuation Field</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-60px)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5">
                  {field.fluctuations.slice(0, 50).map((f, i) => (
                    <motion.div
                      key={f.id}
                      className="absolute w-2 h-2 rounded-full bg-primary/40"
                      style={{
                        left: `${50 + f.position[0] * 4}%`,
                        top: `${50 + f.position[1] * 4}%`,
                      }}
                      animate={{
                        scale: [1, 1 + f.amplitude, 1],
                        opacity: [0.3, 0.7, 0.3]
                      }}
                      transition={{
                        duration: 1 / (f.frequency * 0.01),
                        repeat: Infinity
                      }}
                    />
                  ))}
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">
                  Fluctuations: {field.fluctuations.length} | Avg Amplitude: {field.averageAmplitude.toFixed(3)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Circuit Diagram</CardTitle>
              </CardHeader>
              <CardContent>
                {circuit ? (
                  <div className="flex items-center justify-center gap-8 py-4">
                    <div className="space-y-2">
                      {presets[selectedPreset]?.inputLabels.map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Badge variant={inputs[i] ? 'default' : 'outline'}>{label}: {inputs[i] ? '1' : '0'}</Badge>
                          <div className="w-8 h-0.5 bg-border" />
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {circuit.gates.map(g => (
                        <Badge key={g.id} variant="secondary" className="block">
                          {g.type} {g.output !== null ? `→ ${g.output ? '1' : '0'}` : ''}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {result?.output.map((o, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-8 h-0.5 bg-border" />
                          <Badge variant={o ? 'default' : 'outline'}>
                            {presets[selectedPreset]?.outputLabels[i]}: {o ? '1' : '0'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">Select a circuit preset</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Metrics */}
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Thermodynamic Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {metrics ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">kT</span>
                      <span>{(metrics.kT * 1e21).toFixed(3)} × 10⁻²¹ J</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Landauer Cost</span>
                      <span>{(metrics.landauerCost * 1e21).toFixed(3)} × 10⁻²¹ J/bit</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Actual Cost</span>
                      <span>{(metrics.actualCost * 1e21).toFixed(3)} × 10⁻²¹ J</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Efficiency</span>
                        <span className={efficiency && efficiency > 0.8 ? 'text-green-500' : 'text-yellow-500'}>
                          {((efficiency || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-secondary rounded-full mt-1 overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(efficiency || 0) * 100}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">Run simulation to see metrics</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Computation Log</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[200px] overflow-y-auto">
                {history.length > 0 ? (
                  <div className="space-y-1">
                    {history.map((step, i) => (
                      <div key={i} className="text-xs flex justify-between">
                        <span className="text-muted-foreground">{step.action}</span>
                        <span>ΔS: {step.entropy.toFixed(2)} | E: {step.energy.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center">No steps yet</p>
                )}
              </CardContent>
            </Card>

            {result && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Result Summary</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Entropy</span>
                    <span>{result.totalEntropy.toFixed(2)} bits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Energy</span>
                    <span>{result.totalEnergy.toFixed(2)} kT ln(2)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exec Time</span>
                    <span>{result.executionTime} ms</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <AppHelpDialog
          open={helpOpen}
          onOpenChange={(open) => { setHelpOpen(open); if (!open) markAsSeen(); }}
          appName="Vacuum Computation Lab"
          steps={helpSteps}
        />
      </div>
    </Layout>
  );
};

export default VacuumComputationLab;
