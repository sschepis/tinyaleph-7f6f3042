import React, { useState } from 'react';
import { usePulsarTransceiver } from '@/hooks/usePulsarTransceiver';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  PulsarMap3D, 
  MultiPartyPanel, 
  PulsarInfoPanel,
  MessageDecodingViz,
  BroadcastPanel,
  TransmissionReplay,
  NetworkTopology,
  MessageComposer,
  MessageDecoder
} from '@/components/pulsar-transceiver';
import { Pulsar } from '@/lib/pulsar-transceiver/types';
import { 
  Power, Radio, Satellite, Search, Send, Lock, Unlock,
  Activity, Waves, Globe, AlertTriangle, CheckCircle,
  Clock, Cpu, Wifi, MapPin, Users, Box
} from 'lucide-react';

const PulsarTransceiver = () => {
  const {
    isRunning, time, referencePulsar, setReferencePulsar, activePulsars, referencePhase,
    localLocation, remoteLocation, semanticMap, phaseLock,
    transmissionHistory, setiMode, setSetiMode, setiCandidates,
    spectrum, simParams, setSimParams, localFingerprint,
    allPulsars, start, pause, reset, togglePulsar, transmit, transmitSequence, runSETIScan,
    // Multi-party
    parties, addParty, removeParty, multiPartyTransmit, broadcastTransmit,
    broadcastMode, setBroadcastMode, selectedPulsar, setSelectedPulsar,
    allLocations, allPhases
  } = usePulsarTransceiver();

  const [selectedPrime, setSelectedPrime] = useState(13);

  const formatTime = (t: number) => t.toFixed(3);
  const formatPhase = (p: number) => `${(p * 180 / Math.PI).toFixed(1)}°`;

  return (
    <div className="min-h-screen bg-background text-foreground p-2 lg:p-3">
      <div className="max-w-[1920px] mx-auto space-y-2">
        {/* Compact Header */}
        <header className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              Pulsar-Synchronized Transceiver
            </h1>
            <div className="hidden md:flex items-center gap-1.5">
              <Badge variant={isRunning ? "default" : "secondary"} className="text-[10px] py-0 h-5">
                {isRunning ? 'ONLINE' : 'OFFLINE'}
              </Badge>
              <Badge variant="outline" className="text-[10px] py-0 h-5">
                φ = {formatPhase(referencePhase)}
              </Badge>
              <Badge 
                variant={phaseLock.isLocked ? 'default' : 'secondary'} 
                className="text-[10px] py-0 h-5"
              >
                {phaseLock.isLocked ? 'LOCKED' : 'SEEKING'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={isRunning ? pause : start} variant={isRunning ? "destructive" : "default"}>
              <Power className="w-3 h-3 mr-1" />
              {isRunning ? 'Stop' : 'Start'}
            </Button>
            <Button size="sm" onClick={reset} variant="outline">Reset</Button>
          </div>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="transceiver" className="space-y-2">
          <TabsList className="grid w-full grid-cols-4 h-8">
            <TabsTrigger value="transceiver" className="text-xs gap-1"><Radio className="w-3 h-3" />Transceiver</TabsTrigger>
            <TabsTrigger value="map3d" className="text-xs gap-1"><Box className="w-3 h-3" />3D Map</TabsTrigger>
            <TabsTrigger value="multiparty" className="text-xs gap-1"><Users className="w-3 h-3" />Multi-Party</TabsTrigger>
            <TabsTrigger value="seti" className="text-xs gap-1"><Search className="w-3 h-3" />SETI Scanner</TabsTrigger>
          </TabsList>

          {/* Transceiver Tab */}
          <TabsContent value="transceiver" className="space-y-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              {/* Phase Lock Status */}
              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5" />
                    Phase Lock
                  </h3>
                  {phaseLock.isLocked ? 
                    <Lock className="w-4 h-4 text-green-500" /> : 
                    <Unlock className="w-4 h-4 text-yellow-500" />
                  }
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={phaseLock.isLocked ? "default" : "secondary"} className="text-[10px] h-4">
                      {phaseLock.isLocked ? 'LOCKED' : 'SEEKING'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Δφ</span>
                    <span className="font-mono text-primary">{formatPhase(phaseLock.phaseDifference)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Strength</span>
                    <span className="font-mono text-primary">{(phaseLock.lockStrength * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-green-500"
                      animate={{ width: `${phaseLock.lockStrength * 100}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Reference Pulsar */}
              <Card className="p-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-2">
                  <Satellite className="h-3.5 w-3.5" />
                  Reference Pulsar
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-mono text-primary">{referencePulsar.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Period</span>
                    <span className="font-mono text-primary">{(referencePulsar.period * 1000).toFixed(3)} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Current Phase</span>
                    <span className="font-mono text-primary">{formatPhase(referencePhase)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distance</span>
                    <span className="font-mono text-primary">{referencePulsar.distance} pc</span>
                  </div>
                </div>
              </Card>

              {/* System Time */}
              <Card className="p-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-2">
                  <Cpu className="h-3.5 w-3.5" />
                  System Status
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-mono text-primary">{formatTime(time)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Pulsars</span>
                    <span className="font-mono text-primary">{activePulsars.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transmissions</span>
                    <span className="font-mono text-primary">{transmissionHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Local</span>
                    <span className="font-mono text-primary text-[10px]">{localLocation.name}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Transmission Panel */}
            <Card className="p-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-2">
                <Send className="h-3.5 w-3.5" />
                Symbolic Transmission
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-1.5 mb-2">
                {semanticMap.slice(0, 10).map(mapping => (
                  <Button
                    key={mapping.prime}
                    variant={selectedPrime === mapping.prime ? "default" : "outline"}
                    size="sm"
                    className="text-[10px] h-7"
                    onClick={() => setSelectedPrime(mapping.prime)}
                  >
                    <span className="font-mono mr-1">{mapping.prime}</span>
                    <span className="truncate">{mapping.meaning}</span>
                  </Button>
                ))}
              </div>
              <Button 
                size="sm"
                onClick={() => transmit(selectedPrime)} 
                disabled={!phaseLock.isLocked}
                className="w-full"
              >
                <Send className="w-3 h-3 mr-1" />
                Transmit "{semanticMap.find(m => m.prime === selectedPrime)?.meaning}"
                {!phaseLock.isLocked && " (Requires Lock)"}
              </Button>
            </Card>

            {/* Message Composer & Decoder */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <MessageComposer
                semanticMap={semanticMap}
                phaseLocked={phaseLock.isLocked}
                onTransmitSequence={transmitSequence}
                referencePhase={referencePhase}
              />
              
              <MessageDecoder
                semanticMap={semanticMap}
                transmissions={transmissionHistory}
              />
            </div>

            {/* Transmission History */}
            <Card className="p-3">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-2">
                <Clock className="h-3.5 w-3.5" />
                Transmission Log
              </h3>
              <ScrollArea className="h-28">
                {transmissionHistory.length === 0 ? (
                  <p className="text-muted-foreground text-center text-xs py-4">No transmissions yet</p>
                ) : (
                  <div className="space-y-1">
                    {transmissionHistory.slice(-10).reverse().map(tx => (
                      <div key={tx.id} className="flex items-center justify-between text-xs bg-muted/50 p-1.5 rounded">
                        <div className="flex items-center gap-1.5">
                          {tx.wasLocked ? 
                            <CheckCircle className="w-3 h-3 text-green-500" /> : 
                            <AlertTriangle className="w-3 h-3 text-yellow-500" />
                          }
                          <span className="font-mono text-primary">{tx.prime}</span>
                          <span className="text-muted-foreground">→</span>
                          <span>{tx.meaning}</span>
                        </div>
                        <span className="text-muted-foreground font-mono text-[10px]">{tx.timestamp.toFixed(2)}s</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* 3D Map Tab */}
          <TabsContent value="map3d" className="space-y-2">
            <Card className="p-3 relative">
              <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-2">
                <Globe className="h-3.5 w-3.5" />
                Galactic Pulsar Network
              </h3>
              <div className="h-[500px] relative">
                <PulsarMap3D
                  pulsars={allPulsars}
                  activePulsars={activePulsars}
                  referencePulsar={referencePulsar}
                  referencePhase={referencePhase}
                  locations={allLocations}
                  phases={allPhases}
                  onPulsarClick={(p: Pulsar) => setSelectedPulsar(p)}
                />
                
                {/* Pulsar Info Panel Overlay */}
                {selectedPulsar && (
                  <PulsarInfoPanel
                    pulsar={selectedPulsar}
                    isActive={activePulsars.some(p => p.name === selectedPulsar.name)}
                    isReference={referencePulsar.name === selectedPulsar.name}
                    phase={allPhases.get(selectedPulsar.name) || 0}
                    onClose={() => setSelectedPulsar(null)}
                    onToggleActive={() => togglePulsar(selectedPulsar.name)}
                    onSetReference={() => {
                      setReferencePulsar(selectedPulsar);
                      setSelectedPulsar(null);
                    }}
                  />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 text-center">
                Click pulsars for details • Set reference pulsar • Drag to rotate • Scroll to zoom
              </p>
            </Card>
          </TabsContent>

          {/* Multi-Party Tab */}
          <TabsContent value="multiparty" className="space-y-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              <div className="space-y-2">
                <MultiPartyPanel
                  parties={parties}
                  onAddParty={addParty}
                  onRemoveParty={removeParty}
                  onTransmit={multiPartyTransmit}
                  semanticMap={semanticMap}
                  time={time}
                  isRunning={isRunning}
                />
                
                <BroadcastPanel
                  parties={parties}
                  semanticMap={semanticMap}
                  onBroadcast={broadcastTransmit}
                  isRunning={isRunning}
                  broadcastMode={broadcastMode}
                  onToggleBroadcastMode={setBroadcastMode}
                />
              </div>
              
              <div className="space-y-2">
                <NetworkTopology
                  parties={parties}
                  time={time}
                />
                
                <TransmissionReplay
                  transmissionHistory={transmissionHistory}
                  parties={parties}
                  semanticMap={semanticMap}
                />
              </div>
              
              <MessageDecodingViz
                transmissions={transmissionHistory}
                parties={parties}
                semanticMap={semanticMap}
                time={time}
                broadcastMode={broadcastMode}
              />
            </div>
          </TabsContent>

          {/* SETI Tab */}
          <TabsContent value="seti" className="space-y-2">
            <Card className="p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5">
                  <Search className="h-3.5 w-3.5" />
                  SETI Scanner
                </h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Inject Alien Signal</span>
                    <Switch
                      checked={simParams.setiInjection}
                      onCheckedChange={(v) => setSimParams({...simParams, setiInjection: v})}
                    />
                  </div>
                  <Button size="sm" onClick={runSETIScan}>
                    <Search className="w-3 h-3 mr-1" />
                    Run Scan
                  </Button>
                </div>
              </div>

              {simParams.setiInjection && (
                <div className="mb-3 p-2 bg-accent/10 border border-accent/30 rounded text-xs">
                  <p className="text-accent">
                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                    Alien signal injection enabled (primes: {simParams.alienPrimes.join(', ')})
                  </p>
                </div>
              )}

              {setiCandidates.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="font-semibold text-xs text-accent">Candidates Detected: {setiCandidates.length}</h4>
                  {setiCandidates.map(candidate => (
                    <div key={candidate.id} className="p-2 bg-muted/50 rounded border border-border">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs">{candidate.id}</span>
                        <Badge variant={
                          candidate.intelligenceProbability > 0.7 ? 'destructive' :
                          candidate.intelligenceProbability > 0.4 ? 'default' : 'secondary'
                        } className="text-[10px] h-4">
                          {(candidate.intelligenceProbability * 100).toFixed(0)}% Intelligence
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-muted-foreground">
                        <div>
                          <span className="block">Pulsars</span>
                          <span className="text-primary">{candidate.pulsars.join(', ')}</span>
                        </div>
                        <div>
                          <span className="block">Correlation</span>
                          <span className="text-primary">{(candidate.correlationStrength * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="block">Prime Match</span>
                          <span className="text-primary">{candidate.associatedPrime || 'None'}</span>
                        </div>
                        <div>
                          <span className="block">SNR</span>
                          <span className="text-primary">{candidate.snr.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No scans performed yet. Click "Run Scan" to analyze pulsar timing data.</p>
                </div>
              )}
            </Card>

            {spectrum && (
              <Card className="p-3">
                <h3 className="text-sm font-semibold text-primary flex items-center gap-1.5 mb-2">
                  <Waves className="h-3.5 w-3.5" />
                  Frequency Spectrum
                </h3>
                <div className="h-32 flex items-end gap-0.5">
                  {spectrum.powers.slice(0, 100).map((power, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t"
                      style={{ height: `${Math.min(power / spectrum.noiseFloor * 10, 100)}%` }}
                    />
                  ))}
                </div>
                {spectrum.splitPrimeMatches.length > 0 && (
                  <div className="mt-2 p-1.5 bg-accent/10 border border-accent/30 rounded">
                    <span className="text-accent text-xs">
                      ⚠️ Split prime frequencies detected: {spectrum.splitPrimeMatches.join(', ')}
                    </span>
                  </div>
                )}
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PulsarTransceiver;
