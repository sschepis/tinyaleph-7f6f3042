import { useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Play, Pause, Search, Radio, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { useCosmicHolographic } from '@/hooks/useCosmicHolographic';
import { AppHelpDialog, HelpButton } from '@/components/app-help';
import { helpSteps } from '@/components/cosmic-holographic/HelpContent';
import { useFirstRun } from '@/hooks/useFirstRun';
import { GalaxyVisualization } from '@/components/cosmic-holographic/GalaxyVisualization';
import { RegionStatsPanel } from '@/components/cosmic-holographic/RegionStatsPanel';
import { PatternListPanel } from '@/components/cosmic-holographic/PatternListPanel';
import { StoreMemoryPanel } from '@/components/cosmic-holographic/StoreMemoryPanel';

const CosmicHolographicExplorer = () => {
  const {
    nodes, patterns, pulsars, syncState, regions, metrics,
    selectedNode, selectedNodeData, activeQuery, queryResults,
    mode, time, isRunning, selectedPreset, presets,
    loadPreset, store, query, selectNode, setMode, toggleRunning
  } = useCosmicHolographic();

  const [isFirstRun, markAsSeen] = useFirstRun('cosmic-holographic-explorer');
  const [helpOpen, setHelpOpen] = useState(isFirstRun);
  const [queryInput, setQueryInput] = useState('');
  const [highlightedPattern, setHighlightedPattern] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(false);
  const [showLightTimeRings, setShowLightTimeRings] = useState(true);

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Radio className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Cosmic Holographic Explorer</h1>
              <p className="text-xs text-muted-foreground">Galactic-scale holographic memory network</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch 
                id="labels" 
                checked={showLabels} 
                onCheckedChange={setShowLabels}
              />
              <Label htmlFor="labels" className="text-xs">Labels</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                id="light-rings" 
                checked={showLightTimeRings} 
                onCheckedChange={setShowLightTimeRings}
              />
              <Label htmlFor="light-rings" className="text-xs">Light-time</Label>
            </div>
            <Badge variant={syncState.isSynchronized ? 'default' : 'secondary'}>
              Sync: {(syncState.syncQuality * 100).toFixed(0)}%
            </Badge>
            <Button variant="outline" size="sm" onClick={toggleRunning}>
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <HelpButton onClick={() => setHelpOpen(true)} />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Panel */}
          <div className="col-span-3 space-y-3">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Network Preset</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Select value={String(selectedPreset)} onValueChange={v => loadPreset(Number(v))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {presets.map((p, i) => (
                      <SelectItem key={i} value={String(i)}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <StoreMemoryPanel 
              onStore={store} 
              maxNodes={nodes.length} 
            />

            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="w-4 h-4" /> Query Memory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <Input
                  placeholder="Search for content..."
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && query(queryInput)}
                />
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => query(queryInput)}
                  disabled={!queryInput}
                >
                  Search
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4" /> Pulsar Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm pt-0">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Active Pulsars</span>
                  <span>{pulsars.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Sync Quality</span>
                  <span className={syncState.isSynchronized ? 'text-green-500' : 'text-yellow-500'}>
                    {(syncState.syncQuality * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    animate={{ width: `${syncState.syncQuality * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center - 3D Visualization */}
          <div className="col-span-6">
            <Card className="h-[520px]">
              <CardHeader className="py-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Galactic Memory Network</CardTitle>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500" /> Sol
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500" /> Reference
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" /> Pulsar
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-orange-500" /> Highlighted
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[calc(100%-48px)] p-0">
                <Canvas camera={{ position: [15, 10, 15], fov: 60 }}>
                  <GalaxyVisualization
                    nodes={nodes}
                    patterns={patterns}
                    pulsars={pulsars}
                    selectedNode={selectedNode}
                    highlightedPattern={highlightedPattern}
                    onSelectNode={selectNode}
                    showLabels={showLabels}
                    showLightTimeRings={showLightTimeRings}
                  />
                </Canvas>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="col-span-3 space-y-3">
            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">System Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs pt-0">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Nodes</span>
                  <span>{metrics.totalNodes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stored Patterns</span>
                  <span>{patterns.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Coherence</span>
                  <span>{(metrics.averageCoherence * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Latency</span>
                  <span>{metrics.averageLatency.toFixed(0)} ly</span>
                </div>
              </CardContent>
            </Card>

            <RegionStatsPanel regions={regions} />

            {selectedNodeData && (
              <Card>
                <CardHeader className="py-2">
                  <CardTitle className="text-sm">Selected: {selectedNodeData.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs pt-0">
                  <Badge variant="outline">{selectedNodeData.type}</Badge>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span>{selectedNodeData.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coherence</span>
                    <span>{(selectedNodeData.coherence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stored</span>
                    <span>{selectedNodeData.stored} patterns</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <PatternListPanel
              patterns={patterns}
              highlightedPattern={highlightedPattern}
              onHighlightPattern={setHighlightedPattern}
            />

            <Card>
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Query Results</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[150px] overflow-y-auto pt-0">
                {queryResults.length > 0 ? (
                  <div className="space-y-1.5">
                    {queryResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setHighlightedPattern(r.pattern.id)}
                        className="w-full text-left p-2 bg-secondary/50 hover:bg-secondary/70 rounded text-xs transition-colors"
                      >
                        <div className="font-medium truncate">{r.pattern.content}</div>
                        <div className="flex justify-between mt-1 text-muted-foreground">
                          <span>Sim: {(r.similarity * 100).toFixed(0)}%</span>
                          <span>{r.latency.toFixed(0)} ly</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-3">No results</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <AppHelpDialog
          open={helpOpen}
          onOpenChange={(open) => { setHelpOpen(open); if (!open) markAsSeen(); }}
          appName="Cosmic Holographic Explorer"
          steps={helpSteps}
        />
      </div>
    </Layout>
  );
};

export default CosmicHolographicExplorer;
