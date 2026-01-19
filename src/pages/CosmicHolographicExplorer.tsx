import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Pause, Database, Search, Radio, Globe, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useCosmicHolographic } from '@/hooks/useCosmicHolographic';
import { AppHelpDialog, HelpButton } from '@/components/app-help';
import { helpSteps } from '@/components/cosmic-holographic/HelpContent';
import { useFirstRun } from '@/hooks/useFirstRun';

// 3D Galaxy visualization
function GalaxyViz({ nodes, pulsars, selectedNode, onSelectNode }: any) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={2} color="#ffd700" />
      <Stars radius={50} depth={50} count={2000} factor={2} />
      
      {/* Galactic center */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#ffd700" emissive="#ff8800" emissiveIntensity={0.5} />
      </mesh>
      
      {/* Memory nodes */}
      {nodes.map((node: any) => (
        <mesh
          key={node.id}
          position={node.position}
          onClick={() => onSelectNode(node.id)}
        >
          <sphereGeometry args={[0.1 + node.capacity * 0.00005, 8, 8]} />
          <meshStandardMaterial
            color={node.id === selectedNode ? '#00ff88' : node.type === 'pulsar' ? '#00ffff' : '#8888ff'}
            emissive={node.id === selectedNode ? '#00ff88' : '#4444ff'}
            emissiveIntensity={node.coherence * 0.5}
          />
        </mesh>
      ))}
      
      {/* Pulsars */}
      {pulsars.map((pulsar: any) => (
        <mesh key={pulsar.id} position={pulsar.position}>
          <octahedronGeometry args={[0.15]} />
          <meshStandardMaterial
            color={pulsar.isReference ? '#ffff00' : '#00ffff'}
            emissive={pulsar.isReference ? '#ffff00' : '#00ffff'}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      
      <OrbitControls enablePan enableZoom enableRotate />
    </>
  );
}

const CosmicHolographicExplorer = () => {
  const {
    nodes, patterns, pulsars, syncState, regions, metrics,
    selectedNode, selectedNodeData, activeQuery, queryResults,
    mode, time, isRunning, selectedPreset, presets,
    loadPreset, store, query, selectNode, setMode, toggleRunning
  } = useCosmicHolographic();

  const [helpOpen, setHelpOpen] = useState(false);
  const [storeInput, setStoreInput] = useState('');
  const [queryInput, setQueryInput] = useState('');
  
  useFirstRun('cosmic-holographic-explorer', () => setHelpOpen(true));

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Cosmic Holographic Explorer</h1>
              <p className="text-xs text-muted-foreground">Galactic-scale holographic memory</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Network Preset</CardTitle>
              </CardHeader>
              <CardContent>
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

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="w-4 h-4" /> Store Memory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Enter content to store..."
                  value={storeInput}
                  onChange={e => setStoreInput(e.target.value)}
                />
                <Button
                  className="w-full"
                  onClick={() => { store(storeInput); setStoreInput(''); }}
                  disabled={!storeInput}
                >
                  Store Pattern
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Search className="w-4 h-4" /> Query Memory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Search for content..."
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
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
              <CardHeader className="py-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Radio className="w-4 h-4" /> Pulsar Sync
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Pulsars</span>
                  <span>{pulsars.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sync Quality</span>
                  <span className={syncState.isSynchronized ? 'text-green-500' : 'text-yellow-500'}>
                    {(syncState.syncQuality * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
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
            <Card className="h-[500px]">
              <CardHeader className="py-2">
                <CardTitle className="text-sm">Galactic Memory Network</CardTitle>
              </CardHeader>
              <CardContent className="h-[calc(100%-48px)] p-0">
                <Canvas camera={{ position: [15, 10, 15], fov: 60 }}>
                  <GalaxyViz
                    nodes={nodes}
                    pulsars={pulsars}
                    selectedNode={selectedNode}
                    onSelectNode={selectNode}
                  />
                </Canvas>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel */}
          <div className="col-span-3 space-y-4">
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">System Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
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

            {selectedNodeData && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm">Selected: {selectedNodeData.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Badge>{selectedNodeData.type}</Badge>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Capacity</span>
                    <span>{selectedNodeData.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coherence</span>
                    <span>{(selectedNodeData.coherence * 100).toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Query Results</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[200px] overflow-y-auto">
                {queryResults.length > 0 ? (
                  <div className="space-y-2">
                    {queryResults.map((r, i) => (
                      <div key={i} className="p-2 bg-secondary/50 rounded text-xs">
                        <div className="font-medium truncate">{r.pattern.content}</div>
                        <div className="flex justify-between mt-1 text-muted-foreground">
                          <span>Sim: {(r.similarity * 100).toFixed(0)}%</span>
                          <span>{r.latency.toFixed(0)} ly</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">No results</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <AppHelpDialog
          open={helpOpen}
          onOpenChange={setHelpOpen}
          title="Cosmic Holographic Explorer"
          steps={helpSteps}
        />
      </div>
    </Layout>
  );
};

export default CosmicHolographicExplorer;
