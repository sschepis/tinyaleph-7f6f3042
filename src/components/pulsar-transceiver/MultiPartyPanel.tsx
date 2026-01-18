/**
 * Multi-Party SRC Simulation Panel
 * Allows multiple locations to synchronize and communicate through the pulsar network
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { 
  Plus, Trash2, MapPin, Link, Unlink, Send, Radio, 
  Users, Globe, Activity, ArrowRight
} from 'lucide-react';
import { ObserverLocation, SRCTransmission, SemanticMapping } from '@/lib/pulsar-transceiver/types';
import { createGalacticLocation, createEarthLocation } from '@/lib/pulsar-transceiver/fingerprint-engine';

interface PartyState {
  location: ObserverLocation;
  phaseLockWith: string[]; // Names of locations this party is locked with
  transmissions: SRCTransmission[];
  color: string;
}

interface MultiPartyPanelProps {
  parties: PartyState[];
  onAddParty: (location: ObserverLocation) => void;
  onRemoveParty: (name: string) => void;
  onTransmit: (senderName: string, targetName: string, prime: number) => void;
  semanticMap: SemanticMapping[];
  time: number;
  isRunning: boolean;
}

// Preset locations for quick add
const PRESET_LOCATIONS = [
  { name: 'Earth Observer', x: 0, y: 8.5, z: 0.025 },
  { name: 'Alpha Centauri', x: 0.5, y: 8.5, z: 0.01 },
  { name: 'Proxima Station', x: 0.4, y: 8.48, z: 0.02 },
  { name: 'Tau Ceti Base', x: 2.1, y: 7.8, z: -0.1 },
  { name: 'Vega Outpost', x: 5.2, y: 12.1, z: 0.3 },
  { name: 'Galactic Hub', x: 0, y: 0.1, z: 0 },
  { name: 'Orion Arm', x: -1.5, y: 9.2, z: 0.05 },
  { name: 'Sagittarius Relay', x: 0.5, y: 3.0, z: -0.5 },
];

const PARTY_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export function MultiPartyPanel({
  parties,
  onAddParty,
  onRemoveParty,
  onTransmit,
  semanticMap,
  time,
  isRunning
}: MultiPartyPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customX, setCustomX] = useState(0);
  const [customY, setCustomY] = useState(8.5);
  const [customZ, setCustomZ] = useState(0);
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [selectedPrime, setSelectedPrime] = useState(13);
  
  const handleAddPreset = useCallback((preset: typeof PRESET_LOCATIONS[0]) => {
    if (parties.some(p => p.location.name === preset.name)) return;
    onAddParty(createGalacticLocation(preset.name, preset.x, preset.y, preset.z));
  }, [parties, onAddParty]);
  
  const handleAddCustom = useCallback(() => {
    if (!customName.trim() || parties.some(p => p.location.name === customName)) return;
    onAddParty(createGalacticLocation(customName, customX, customY, customZ));
    setCustomName('');
    setShowAddForm(false);
  }, [customName, customX, customY, customZ, parties, onAddParty]);
  
  const handleTransmit = useCallback(() => {
    if (selectedSender && selectedTarget && selectedSender !== selectedTarget) {
      onTransmit(selectedSender, selectedTarget, selectedPrime);
    }
  }, [selectedSender, selectedTarget, selectedPrime, onTransmit]);
  
  const availablePresets = PRESET_LOCATIONS.filter(
    p => !parties.some(party => party.location.name === p.name)
  );

  return (
    <div className="space-y-4">
      {/* Active Parties */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-cyan-400">Network Nodes</h3>
          </div>
          <Badge variant="outline" className="border-cyan-600 text-cyan-300">
            {parties.length} Active
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {parties.map((party, i) => (
              <motion.div
                key={party.location.name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="p-3 rounded-lg border-2 transition-all"
                style={{ 
                  backgroundColor: `${party.color}15`,
                  borderColor: selectedSender === party.location.name || selectedTarget === party.location.name 
                    ? party.color 
                    : `${party.color}40`
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: party.color }}
                    />
                    <span className="font-semibold text-sm" style={{ color: party.color }}>
                      {party.location.name}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-400"
                    onClick={() => onRemoveParty(party.location.name)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                
                <div className="text-xs text-gray-400 space-y-1 mb-2">
                  <div className="flex justify-between">
                    <span>Position:</span>
                    <span className="font-mono text-cyan-300">
                      ({party.location.galactic.x.toFixed(1)}, 
                      {party.location.galactic.y.toFixed(1)}, 
                      {party.location.galactic.z.toFixed(2)})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Links:</span>
                    <span className="text-green-400">
                      {party.phaseLockWith.length > 0 
                        ? party.phaseLockWith.join(', ') 
                        : 'Seeking...'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={selectedSender === party.location.name ? "default" : "outline"}
                    className="flex-1 h-7 text-xs"
                    style={{ 
                      backgroundColor: selectedSender === party.location.name ? party.color : undefined,
                    }}
                    onClick={() => setSelectedSender(
                      selectedSender === party.location.name ? null : party.location.name
                    )}
                  >
                    <Send className="w-3 h-3 mr-1" />
                    TX
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedTarget === party.location.name ? "default" : "outline"}
                    className="flex-1 h-7 text-xs"
                    style={{ 
                      backgroundColor: selectedTarget === party.location.name ? party.color : undefined,
                    }}
                    onClick={() => setSelectedTarget(
                      selectedTarget === party.location.name ? null : party.location.name
                    )}
                  >
                    <Radio className="w-3 h-3 mr-1" />
                    RX
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Add New Party Button */}
          <motion.div
            className="p-3 rounded-lg border-2 border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-600 transition-colors min-h-[120px]"
            onClick={() => setShowAddForm(!showAddForm)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-8 h-8 text-slate-500 mb-1" />
            <span className="text-sm text-slate-500">Add Node</span>
          </motion.div>
        </div>
      </Card>
      
      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 p-4">
              <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Add Network Node
              </h4>
              
              {/* Preset locations */}
              {availablePresets.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs text-gray-400 mb-2 block">Quick Add:</span>
                  <div className="flex flex-wrap gap-2">
                    {availablePresets.slice(0, 4).map(preset => (
                      <Button
                        key={preset.name}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => handleAddPreset(preset)}
                      >
                        <MapPin className="w-3 h-3 mr-1" />
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Custom location form */}
              <div className="border-t border-slate-700 pt-4 mt-4">
                <span className="text-xs text-gray-400 mb-2 block">Custom Location:</span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="Node Name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="bg-slate-700 border-slate-600"
                  />
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">X (kpc)</label>
                    <Slider
                      value={[customX]}
                      onValueChange={([v]) => setCustomX(v)}
                      min={-10}
                      max={10}
                      step={0.1}
                    />
                    <span className="text-xs text-cyan-300 font-mono">{customX.toFixed(1)}</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Y (kpc)</label>
                    <Slider
                      value={[customY]}
                      onValueChange={([v]) => setCustomY(v)}
                      min={0}
                      max={20}
                      step={0.1}
                    />
                    <span className="text-xs text-cyan-300 font-mono">{customY.toFixed(1)}</span>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400">Z (kpc)</label>
                    <Slider
                      value={[customZ]}
                      onValueChange={([v]) => setCustomZ(v)}
                      min={-2}
                      max={2}
                      step={0.01}
                    />
                    <span className="text-xs text-cyan-300 font-mono">{customZ.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="mt-3 w-full bg-cyan-600 hover:bg-cyan-700"
                  onClick={handleAddCustom}
                  disabled={!customName.trim()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Node
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Transmission Panel */}
      {selectedSender && selectedTarget && selectedSender !== selectedTarget && (
        <Card className="bg-slate-800/50 border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-purple-400">Multi-Party Transmission</h3>
          </div>
          
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-center">
              <Badge 
                className="mb-1"
                style={{ backgroundColor: parties.find(p => p.location.name === selectedSender)?.color }}
              >
                {selectedSender}
              </Badge>
              <p className="text-xs text-gray-400">Sender</p>
            </div>
            <ArrowRight className="w-6 h-6 text-cyan-400" />
            <div className="text-center">
              <Badge 
                className="mb-1"
                style={{ backgroundColor: parties.find(p => p.location.name === selectedTarget)?.color }}
              >
                {selectedTarget}
              </Badge>
              <p className="text-xs text-gray-400">Receiver</p>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-4">
            {semanticMap.slice(0, 10).map(mapping => (
              <Button
                key={mapping.prime}
                variant={selectedPrime === mapping.prime ? "default" : "outline"}
                className={`text-xs p-2 h-auto flex-col ${
                  selectedPrime === mapping.prime ? 'bg-purple-600' : ''
                }`}
                onClick={() => setSelectedPrime(mapping.prime)}
              >
                <span className="font-mono text-lg">{mapping.prime}</span>
                <span className="text-[10px] opacity-70 truncate w-full">{mapping.meaning}</span>
              </Button>
            ))}
          </div>
          
          <Button
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
            onClick={handleTransmit}
            disabled={!isRunning}
          >
            <Send className="w-4 h-4 mr-2" />
            Transmit "{semanticMap.find(m => m.prime === selectedPrime)?.meaning}" 
            from {selectedSender} to {selectedTarget}
          </Button>
        </Card>
      )}
      
      {/* Network Activity Log */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Network Activity
        </h4>
        <ScrollArea className="h-32">
          {parties.flatMap(p => p.transmissions).length === 0 ? (
            <p className="text-gray-500 text-center text-sm">No network activity yet</p>
          ) : (
            <div className="space-y-2">
              {parties.flatMap(p => 
                p.transmissions.map(tx => ({ ...tx, partyColor: p.color }))
              )
              .sort((a, b) => b.timestamp - a.timestamp)
              .slice(0, 20)
              .map((tx: any) => (
                <div 
                  key={tx.id}
                  className="flex items-center gap-2 text-xs bg-slate-700/50 p-2 rounded"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tx.partyColor }}
                  />
                  <span className="font-mono text-cyan-300">{tx.prime}</span>
                  <span className="text-gray-400">→</span>
                  <span>{tx.meaning}</span>
                  <span className="ml-auto text-gray-500">{tx.timestamp.toFixed(2)}s</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}

export default MultiPartyPanel;
