import React, { useState, useEffect } from 'react';
import { usePulsarTransceiver } from '@/hooks/usePulsarTransceiver';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PulsarMap3D, MultiPartyPanel } from '@/components/pulsar-transceiver';
import { 
  Power, Radio, Satellite, Search, Send, Lock, Unlock,
  Activity, Waves, Globe, AlertTriangle, CheckCircle,
  Clock, Cpu, Wifi, MapPin, Users, Box
} from 'lucide-react';

const PulsarTransceiver = () => {
  const {
    isRunning, time, referencePulsar, activePulsars, referencePhase,
    localLocation, remoteLocation, semanticMap, phaseLock,
    transmissionHistory, setiMode, setSetiMode, setiCandidates,
    spectrum, simParams, setSimParams, localFingerprint,
    allPulsars, start, pause, reset, togglePulsar, transmit, runSETIScan,
    // Multi-party
    parties, addParty, removeParty, multiPartyTransmit, allLocations, allPhases
  } = usePulsarTransceiver();

  const [selectedPrime, setSelectedPrime] = useState(13);

  const formatTime = (t: number) => t.toFixed(3);
  const formatPhase = (p: number) => `${(p * 180 / Math.PI).toFixed(1)}°`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-gray-100 p-4 pt-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              PULSAR-SYNCHRONIZED TRANSCEIVER
            </h1>
            <p className="text-cyan-300/70 text-sm">Cosmic Symbolic Resonance Communication System</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={isRunning ? "default" : "secondary"} className={isRunning ? "bg-green-600" : ""}>
              {isRunning ? 'ONLINE' : 'OFFLINE'}
            </Badge>
            <Button onClick={isRunning ? pause : start} variant={isRunning ? "destructive" : "default"}>
              <Power className="w-4 h-4 mr-2" />
              {isRunning ? 'STOP' : 'START'}
            </Button>
            <Button onClick={reset} variant="outline">Reset</Button>
          </div>
        </header>

        {/* Main Content */}
        <Tabs defaultValue="transceiver" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50">
            <TabsTrigger value="transceiver"><Radio className="w-4 h-4 mr-2" />Transceiver</TabsTrigger>
            <TabsTrigger value="map3d"><Box className="w-4 h-4 mr-2" />3D Map</TabsTrigger>
            <TabsTrigger value="multiparty"><Users className="w-4 h-4 mr-2" />Multi-Party</TabsTrigger>
            <TabsTrigger value="seti"><Search className="w-4 h-4 mr-2" />SETI Scanner</TabsTrigger>
          </TabsList>

          {/* Transceiver Tab */}
          <TabsContent value="transceiver" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Phase Lock Status */}
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyan-400">Phase Lock</h3>
                  {phaseLock.isLocked ? 
                    <Lock className="w-5 h-5 text-green-400" /> : 
                    <Unlock className="w-5 h-5 text-yellow-400" />
                  }
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <Badge variant={phaseLock.isLocked ? "default" : "secondary"} 
                           className={phaseLock.isLocked ? "bg-green-600" : "bg-yellow-600"}>
                      {phaseLock.isLocked ? 'LOCKED' : 'SEEKING'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Δφ</span>
                    <span className="font-mono text-cyan-300">{formatPhase(phaseLock.phaseDifference)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Strength</span>
                    <span className="font-mono text-cyan-300">{(phaseLock.lockStrength * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-green-500"
                      animate={{ width: `${phaseLock.lockStrength * 100}%` }}
                    />
                  </div>
                </div>
              </Card>

              {/* Reference Pulsar */}
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Reference Pulsar</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Name</span>
                    <span className="font-mono text-cyan-300">{referencePulsar.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Period</span>
                    <span className="font-mono text-cyan-300">{(referencePulsar.period * 1000).toFixed(3)} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Phase</span>
                    <span className="font-mono text-cyan-300">{formatPhase(referencePhase)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Distance</span>
                    <span className="font-mono text-cyan-300">{referencePulsar.distance} pc</span>
                  </div>
                </div>
              </Card>

              {/* System Time */}
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">System Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time</span>
                    <span className="font-mono text-cyan-300">{formatTime(time)} s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Pulsars</span>
                    <span className="font-mono text-cyan-300">{activePulsars.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transmissions</span>
                    <span className="font-mono text-cyan-300">{transmissionHistory.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Local</span>
                    <span className="font-mono text-cyan-300 text-xs">{localLocation.name}</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Transmission Panel */}
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Symbolic Transmission</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 mb-4">
                {semanticMap.slice(0, 10).map(mapping => (
                  <Button
                    key={mapping.prime}
                    variant={selectedPrime === mapping.prime ? "default" : "outline"}
                    className={`text-xs ${selectedPrime === mapping.prime ? 'bg-cyan-600' : ''}`}
                    onClick={() => setSelectedPrime(mapping.prime)}
                  >
                    <span className="font-mono mr-1">{mapping.prime}</span>
                    <span className="truncate">{mapping.meaning}</span>
                  </Button>
                ))}
              </div>
              <Button 
                onClick={() => transmit(selectedPrime)} 
                disabled={!phaseLock.isLocked}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600"
              >
                <Send className="w-4 h-4 mr-2" />
                Transmit "{semanticMap.find(m => m.prime === selectedPrime)?.meaning}"
                {!phaseLock.isLocked && " (Requires Lock)"}
              </Button>
            </Card>

            {/* Transmission History */}
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Transmission Log</h3>
              <ScrollArea className="h-40">
                {transmissionHistory.length === 0 ? (
                  <p className="text-gray-500 text-center">No transmissions yet</p>
                ) : (
                  <div className="space-y-2">
                    {transmissionHistory.slice(-10).reverse().map(tx => (
                      <div key={tx.id} className="flex items-center justify-between text-sm bg-slate-700/50 p-2 rounded">
                        <div className="flex items-center gap-2">
                          {tx.wasLocked ? 
                            <CheckCircle className="w-4 h-4 text-green-400" /> : 
                            <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          }
                          <span className="font-mono text-cyan-300">{tx.prime}</span>
                          <span className="text-gray-400">→</span>
                          <span>{tx.meaning}</span>
                        </div>
                        <span className="text-gray-500 font-mono text-xs">{tx.timestamp.toFixed(2)}s</span>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </Card>
          </TabsContent>

          {/* 3D Map Tab */}
          <TabsContent value="map3d" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h3 className="text-lg font-semibold text-cyan-400 mb-4">Galactic Pulsar Network</h3>
              <div className="h-[500px]">
                <PulsarMap3D
                  pulsars={allPulsars}
                  activePulsars={activePulsars}
                  referencePulsar={referencePulsar}
                  referencePhase={referencePhase}
                  locations={allLocations}
                  phases={allPhases}
                  onPulsarClick={(p) => togglePulsar(p.name)}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Click pulsars to toggle. Drag to rotate. Scroll to zoom.
              </p>
            </Card>
          </TabsContent>

          {/* Multi-Party Tab */}
          <TabsContent value="multiparty" className="space-y-4">
            <MultiPartyPanel
              parties={parties}
              onAddParty={addParty}
              onRemoveParty={removeParty}
              onTransmit={multiPartyTransmit}
              semanticMap={semanticMap}
              time={time}
              isRunning={isRunning}
            />
          </TabsContent>

          {/* SETI Tab */}
          <TabsContent value="seti" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-cyan-400">SETI Scanner</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Inject Alien Signal</span>
                    <Switch
                      checked={simParams.setiInjection}
                      onCheckedChange={(v) => setSimParams({...simParams, setiInjection: v})}
                    />
                  </div>
                  <Button onClick={runSETIScan} className="bg-purple-600 hover:bg-purple-700">
                    <Search className="w-4 h-4 mr-2" />
                    Run Scan
                  </Button>
                </div>
              </div>

              {simParams.setiInjection && (
                <div className="mb-4 p-3 bg-purple-900/30 border border-purple-600 rounded-lg">
                  <p className="text-sm text-purple-300">
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Alien signal injection enabled (primes: {simParams.alienPrimes.join(', ')})
                  </p>
                </div>
              )}

              {setiCandidates.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold text-yellow-400">Candidates Detected: {setiCandidates.length}</h4>
                  {setiCandidates.map(candidate => (
                    <div key={candidate.id} className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm">{candidate.id}</span>
                        <Badge className={
                          candidate.intelligenceProbability > 0.7 ? 'bg-red-600' :
                          candidate.intelligenceProbability > 0.4 ? 'bg-yellow-600' : 'bg-gray-600'
                        }>
                          {(candidate.intelligenceProbability * 100).toFixed(0)}% Intelligence
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-400">
                        <div>
                          <span className="block">Pulsars</span>
                          <span className="text-cyan-300">{candidate.pulsars.join(', ')}</span>
                        </div>
                        <div>
                          <span className="block">Correlation</span>
                          <span className="text-cyan-300">{(candidate.correlationStrength * 100).toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="block">Prime Match</span>
                          <span className="text-cyan-300">{candidate.associatedPrime || 'None'}</span>
                        </div>
                        <div>
                          <span className="block">SNR</span>
                          <span className="text-cyan-300">{candidate.snr.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No scans performed yet. Click "Run Scan" to analyze pulsar timing data.</p>
                </div>
              )}
            </Card>

            {spectrum && (
              <Card className="bg-slate-800/50 border-slate-700 p-4">
                <h3 className="text-lg font-semibold text-cyan-400 mb-4">Frequency Spectrum</h3>
                <div className="h-40 flex items-end gap-0.5">
                  {spectrum.powers.slice(0, 100).map((power, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-cyan-600 to-purple-600 rounded-t"
                      style={{ height: `${Math.min(power / spectrum.noiseFloor * 10, 100)}%` }}
                    />
                  ))}
                </div>
                {spectrum.splitPrimeMatches.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-600 rounded">
                    <span className="text-yellow-400 text-sm">
                      ⚠️ Split prime frequencies detected: {spectrum.splitPrimeMatches.join(', ')}
                    </span>
                  </div>
                )}
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-6 bg-slate-800/50 rounded-lg p-2 text-xs flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span>T: <span className="text-cyan-300 font-mono">{formatTime(time)}</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Satellite className="w-3 h-3 text-gray-400" />
            <span>Pulsars: <span className="text-cyan-300">{activePulsars.length}/{allPulsars.length}</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Waves className="w-3 h-3 text-gray-400" />
            <span>φ_ref: <span className="text-cyan-300 font-mono">{formatPhase(referencePhase)}</span></span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-gray-400" />
            <span>Lock: <span className={phaseLock.isLocked ? "text-green-400" : "text-yellow-400"}>
              {phaseLock.isLocked ? 'LOCKED' : 'SEEKING'}
            </span></span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PulsarTransceiver;
