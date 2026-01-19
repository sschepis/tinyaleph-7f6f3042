/**
 * Thermodynamic Semantics Dashboard
 * Visualizes entropy-meaning relationships and computational thermodynamics
 */

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, Pause, RotateCcw, Thermometer, Zap, Brain, 
  TrendingDown, Activity, Gauge, Bot, HelpCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useThermodynamicSemantics } from '@/hooks/useThermodynamicSemantics';
import { AppHelpDialog, HelpButton } from '@/components/app-help';
import { HelpContent } from '@/components/thermodynamic-semantics/HelpContent';
import { useFirstRun } from '@/hooks/useFirstRun';

const ThermodynamicSemanticsDashboard = () => {
  const {
    processes,
    landscape,
    landauer,
    demon,
    emergence,
    config,
    isRunning,
    time,
    selectedPreset,
    presets,
    loadPreset,
    toggleRunning,
    reset,
    updateConfig,
    getEntropyMeaningData,
    getProcessComparisonData
  } = useThermodynamicSemantics();

  const [isFirstRun, markAsSeen] = useFirstRun('thermodynamic-semantics');
  const [helpOpen, setHelpOpen] = useState(isFirstRun);

  const entropyMeaningData = getEntropyMeaningData();
  const processComparisonData = getProcessComparisonData();

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
              <Thermometer className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Thermodynamic Semantics</h1>
              <p className="text-sm text-muted-foreground">
                Entropy-meaning relationships in computation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={selectedPreset.toString()}
              onValueChange={(v) => loadPreset(parseInt(v))}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {presets.map((preset, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={isRunning ? "destructive" : "default"}
              size="icon"
              onClick={toggleRunning}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={reset}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <HelpButton onClick={() => setHelpOpen(true)} />
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Landauer Metrics */}
          <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-red-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-400" />
                Landauer Limit
              </CardTitle>
              <CardDescription>Minimum energy cost per bit</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-2xl font-mono font-bold text-orange-400">
                    {(landauer.landauerLimit * 1e21).toFixed(3)}
                  </div>
                  <div className="text-xs text-muted-foreground">kT ln(2) × 10²¹ J</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-2xl font-mono font-bold text-emerald-400">
                    {(landauer.efficiency * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Efficiency</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-2xl font-mono font-bold text-sky-400">
                    {landauer.bitsErased.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Bits Erased</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-background/50">
                  <div className="text-2xl font-mono font-bold text-rose-400">
                    {(landauer.irreversibleFraction * 100).toFixed(0)}%
                  </div>
                  <div className="text-xs text-muted-foreground">Irreversible</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meaning Emergence */}
          <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-400" />
                Meaning Emergence
              </CardTitle>
              <CardDescription>From entropy to structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Raw Entropy</span>
                  <span className="font-mono text-violet-400">{emergence.rawEntropy.toFixed(2)} bits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Structured Entropy</span>
                  <span className="font-mono text-purple-400">{emergence.structuredEntropy.toFixed(2)} bits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Mutual Information</span>
                  <span className="font-mono text-fuchsia-400">{emergence.mutualInformation.toFixed(2)} bits</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Integrated Info (Φ)</span>
                  <span className="font-mono text-lg text-violet-300">{emergence.integratedInformation.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Emergent Meaning</span>
                  <Badge variant="secondary" className="bg-violet-500/20 text-violet-300">
                    {(emergence.emergentMeaning * 100).toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maxwell's Demon */}
          <Card className={`border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 ${demon.isViolating ? 'ring-2 ring-red-500' : ''}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                Maxwell's Demon
                {demon.isViolating && (
                  <Badge variant="destructive" className="ml-2">VIOLATION!</Badge>
                )}
              </CardTitle>
              <CardDescription>Information-work trade-off</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Information Gained</span>
                  <span className="font-mono text-cyan-400">{demon.informationGained.toFixed(3)} bits</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Work Extracted</span>
                  <span className="font-mono text-emerald-400">{(demon.workExtracted * 1e21).toFixed(3)} ×10⁻²¹ J</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Entropy Exported</span>
                  <span className="font-mono text-rose-400">{(demon.entropyExported * 1e21).toFixed(3)} ×10⁻²¹ J</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Net Gain</span>
                  <span className={`font-mono text-lg ${demon.netGain > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {(demon.netGain * 1e21).toFixed(3)} ×10⁻²¹ J
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {demon.isViolating 
                    ? "⚠️ This would violate the 2nd law!" 
                    : "✓ 2nd law preserved: erasure cost ≥ extracted work"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Entropy-Meaning Time Series */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Entropy-Meaning Evolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={entropyMeaningData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="time" 
                      tickFormatter={(v) => v.toFixed(0)}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="entropy" 
                      stroke="hsl(220, 70%, 50%)" 
                      fill="hsl(220, 70%, 50%)" 
                      fillOpacity={0.3}
                      name="Entropy"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="meaning" 
                      stroke="hsl(280, 70%, 50%)" 
                      fill="hsl(280, 70%, 50%)" 
                      fillOpacity={0.3}
                      name="Meaning"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Process Comparison */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                Process Efficiency Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={processComparisonData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100}
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="efficiency" 
                      fill="hsl(150, 70%, 45%)" 
                      name="Efficiency %"
                      radius={[0, 4, 4, 0]}
                    />
                    <Bar 
                      dataKey="meaningGain" 
                      fill="hsl(280, 70%, 50%)" 
                      name="Meaning Gain"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuration & Energy Landscape */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Configuration Panel */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Temperature</span>
                  <span className="font-mono text-sm">{config.temperature.toFixed(1)} K</span>
                </div>
                <Slider
                  value={[config.temperature]}
                  min={0.01}
                  max={500}
                  step={1}
                  onValueChange={([v]) => updateConfig({ temperature: v })}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Noise Level</span>
                  <span className="font-mono text-sm">{(config.noiseLevel * 100).toFixed(0)}%</span>
                </div>
                <Slider
                  value={[config.noiseLevel * 100]}
                  min={0}
                  max={50}
                  step={1}
                  onValueChange={([v]) => updateConfig({ noiseLevel: v / 100 })}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Coupling Strength</span>
                  <span className="font-mono text-sm">{config.couplingStrength.toFixed(2)}</span>
                </div>
                <Slider
                  value={[config.couplingStrength * 100]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => updateConfig({ couplingStrength: v / 100 })}
                />
              </div>
              <div className="pt-2 border-t border-border">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Higher temperature → more thermal noise</p>
                  <p>• Higher coupling → faster meaning emergence</p>
                  <p>• Lower noise → closer to Landauer limit</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Energy Landscape Heatmap */}
          <Card className="lg:col-span-2 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-primary" />
                Free Energy Landscape
              </CardTitle>
              <CardDescription>
                Meaning basins and transition barriers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-64 rounded-lg overflow-hidden bg-gradient-to-br from-background to-muted/20">
                {/* Simplified landscape visualization */}
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Background gradient representing energy */}
                  <defs>
                    <radialGradient id="basin1" cx="25%" cy="25%" r="30%">
                      <stop offset="0%" stopColor="hsl(280, 70%, 40%)" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <radialGradient id="basin2" cx="75%" cy="75%" r="25%">
                      <stop offset="0%" stopColor="hsl(200, 70%, 40%)" stopOpacity="0.7" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                    <radialGradient id="basin3" cx="50%" cy="25%" r="20%">
                      <stop offset="0%" stopColor="hsl(150, 70%, 40%)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>
                  
                  <rect x="0" y="0" width="100" height="100" fill="url(#basin1)" />
                  <rect x="0" y="0" width="100" height="100" fill="url(#basin2)" />
                  <rect x="0" y="0" width="100" height="100" fill="url(#basin3)" />
                  
                  {/* Energy contours */}
                  {[0.2, 0.4, 0.6, 0.8].map((r, i) => (
                    <g key={i}>
                      <ellipse 
                        cx="25" cy="25" 
                        rx={r * 20} ry={r * 20} 
                        fill="none" 
                        stroke="hsl(280, 50%, 50%)" 
                        strokeWidth="0.3"
                        strokeOpacity={0.5 - i * 0.1}
                      />
                      <ellipse 
                        cx="75" cy="75" 
                        rx={r * 15} ry={r * 15} 
                        fill="none" 
                        stroke="hsl(200, 50%, 50%)" 
                        strokeWidth="0.3"
                        strokeOpacity={0.5 - i * 0.1}
                      />
                    </g>
                  ))}
                  
                  {/* Minimum markers */}
                  {landscape.minima.map((min, i) => (
                    <g key={min.id}>
                      <circle 
                        cx={min.position[0] * 2} 
                        cy={min.position[1] * 2} 
                        r="3" 
                        fill="hsl(var(--primary))"
                        className="animate-pulse"
                      />
                      <text 
                        x={min.position[0] * 2} 
                        y={min.position[1] * 2 + 8} 
                        textAnchor="middle" 
                        fill="hsl(var(--foreground))"
                        fontSize="4"
                      >
                        M{i + 1}
                      </text>
                    </g>
                  ))}
                  
                  {/* Transition paths */}
                  <path 
                    d="M 25 25 Q 50 50 75 75" 
                    fill="none" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth="0.5" 
                    strokeDasharray="2 2"
                  />
                  <path 
                    d="M 25 25 Q 37 12 50 25" 
                    fill="none" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth="0.5" 
                    strokeDasharray="2 2"
                  />
                </svg>
                
                {/* Legend overlay */}
                <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-violet-500" />
                    <span>High Meaning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-cyan-500" />
                    <span>Local Minimum</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                {landscape.minima.map((min, i) => (
                  <div key={min.id} className="p-2 rounded bg-muted/30">
                    <div className="text-xs text-muted-foreground">Basin {i + 1}</div>
                    <div className="text-sm font-mono">E={min.energy.toFixed(2)}</div>
                    <div className="text-xs text-violet-400">M={min.meaning.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Dialog */}
        <AppHelpDialog
          open={helpOpen}
          onOpenChange={(open) => { setHelpOpen(open); if (!open) markAsSeen(); }}
          appName="Thermodynamic Semantics"
          steps={HelpContent()}
        />
      </div>
    </Layout>
  );
};

export default ThermodynamicSemanticsDashboard;
