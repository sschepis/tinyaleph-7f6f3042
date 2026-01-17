import { useState } from 'react';
import { motion } from 'framer-motion';
import { Atom, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEntanglementLab } from '@/hooks/useEntanglementLab';
import {
  BellStateSelector,
  EntangledPairViz,
  CorrelationPlot,
  CHSHPanel,
  MeasurementPanel,
  HelpContent
} from '@/components/entanglement-lab';

export default function QuantumEntanglementLab() {
  const lab = useEntanglementLab();
  const [lastAliceResult, setLastAliceResult] = useState<0 | 1 | null>(null);
  const [lastBobResult, setLastBobResult] = useState<0 | 1 | null>(null);
  
  const handleRunSingle = () => {
    const result = lab.runSingleMeasurement();
    setLastAliceResult(result.alice);
    setLastBobResult(result.bob);
    
    // Clear results after animation
    setTimeout(() => {
      setLastAliceResult(null);
      setLastBobResult(null);
    }, 1500);
  };
  
  const handleRunMany = () => {
    setLastAliceResult(null);
    setLastBobResult(null);
    lab.runManyMeasurements(100);
  };
  
  const handleClear = () => {
    setLastAliceResult(null);
    setLastBobResult(null);
    lab.clearHistory();
  };
  
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <Atom className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Quantum Entanglement Lab</h1>
              <p className="text-xs text-muted-foreground">Bell States · EPR Correlations · CHSH Violation</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground mr-4">
              Seed: <span className="font-mono">{lab.seed}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-1 h-6 px-2"
                onClick={lab.resetSeed}
              >
                Reset
              </Button>
            </div>
            <HelpContent />
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden p-4">
        <div className="h-full grid grid-cols-12 gap-4">
          {/* Left sidebar - Controls */}
          <div className="col-span-3 space-y-4 overflow-y-auto">
            <BellStateSelector
              selected={lab.bellState}
              onSelect={lab.setBellState}
            />
            
            <div className="p-3 bg-secondary/20 rounded-lg space-y-3">
              <h3 className="text-sm font-medium">Measurement Settings</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-blue-400">Alice's Angle</span>
                  <span className="font-mono">{(lab.aliceAngle * 180 / Math.PI).toFixed(0)}°</span>
                </div>
                <Slider
                  value={[lab.aliceAngle * 180 / Math.PI]}
                  onValueChange={([v]) => lab.setAliceAngle(v * Math.PI / 180)}
                  min={0}
                  max={360}
                  step={5}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">Bob's Angle</span>
                  <span className="font-mono">{(lab.bobAngle * 180 / Math.PI).toFixed(0)}°</span>
                </div>
                <Slider
                  value={[lab.bobAngle * 180 / Math.PI]}
                  onValueChange={([v]) => lab.setBobAngle(v * Math.PI / 180)}
                  min={0}
                  max={360}
                  step={5}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Shots per Run</span>
                  <span className="font-mono">{lab.shotsPerRun}</span>
                </div>
                <Slider
                  value={[lab.shotsPerRun]}
                  onValueChange={([v]) => lab.setShotsPerRun(v)}
                  min={10}
                  max={1000}
                  step={10}
                />
              </div>
            </div>
          </div>
          
          {/* Center - Visualizations */}
          <div className="col-span-6 space-y-4 overflow-y-auto">
            {/* Entangled pair visualization */}
            <EntangledPairViz
              bellState={lab.bellState}
              aliceAngle={lab.aliceAngle}
              bobAngle={lab.bobAngle}
              aliceResult={lastAliceResult}
              bobResult={lastBobResult}
              onAliceAngleChange={lab.setAliceAngle}
              onBobAngleChange={lab.setBobAngle}
            />
            
            {/* Tabs for different views */}
            <Tabs defaultValue="correlation" className="flex-1">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="correlation">Correlation Curve</TabsTrigger>
                <TabsTrigger value="chsh">CHSH Test</TabsTrigger>
              </TabsList>
              
              <TabsContent value="correlation" className="mt-4">
                <div className="bg-secondary/10 rounded-lg p-4 h-[300px]">
                  <CorrelationPlot
                    bellState={lab.bellState}
                    aliceAngle={lab.aliceAngle}
                    bobAngle={lab.bobAngle}
                    measuredCorrelation={lab.measurementStats.correlation}
                    measurementCount={lab.measurementStats.total}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="chsh" className="mt-4">
                <div className="bg-secondary/10 rounded-lg p-4">
                  <CHSHPanel
                    theoreticalResult={lab.theoreticalCHSH}
                    angles={lab.chshAngles}
                    onAngleChange={lab.setChshAngle}
                    onRunExperiment={lab.runCHSHTest}
                    onUseOptimal={lab.useOptimalAngles}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Right sidebar - Measurements */}
          <div className="col-span-3 overflow-y-auto">
            <MeasurementPanel
              stats={lab.measurementStats}
              recentResults={lab.measurementHistory}
              theoreticalCorrelation={lab.theoreticalCorr}
              onRunSingle={handleRunSingle}
              onRunMany={handleRunMany}
              onClear={handleClear}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
