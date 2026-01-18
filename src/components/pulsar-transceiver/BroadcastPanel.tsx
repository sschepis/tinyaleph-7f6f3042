/**
 * Broadcast Mode Panel
 * Transmit to all phase-locked parties with animated light-delay propagation
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Radio, Send, Users, Zap, Globe, 
  Lock, Waves, Satellite, ArrowRight
} from 'lucide-react';
import { SemanticMapping, ObserverLocation } from '@/lib/pulsar-transceiver/types';

interface BroadcastPanelProps {
  parties: Array<{
    location: ObserverLocation;
    phaseLockWith: string[];
    color: string;
  }>;
  semanticMap: SemanticMapping[];
  onBroadcast: (senderName: string, prime: number) => void;
  isRunning: boolean;
  broadcastMode: boolean;
  onToggleBroadcastMode: (enabled: boolean) => void;
}

export function BroadcastPanel({
  parties,
  semanticMap,
  onBroadcast,
  isRunning,
  broadcastMode,
  onToggleBroadcastMode
}: BroadcastPanelProps) {
  const [selectedSender, setSelectedSender] = useState<string | null>(null);
  const [selectedPrime, setSelectedPrime] = useState(13);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  const selectedParty = parties.find(p => p.location.name === selectedSender);
  const lockedTargets = selectedParty?.phaseLockWith || [];
  
  const handleBroadcast = useCallback(() => {
    if (!selectedSender || lockedTargets.length === 0 || !isRunning) return;
    
    setIsBroadcasting(true);
    onBroadcast(selectedSender, selectedPrime);
    
    // Reset animation state
    setTimeout(() => setIsBroadcasting(false), 2000);
  }, [selectedSender, selectedPrime, lockedTargets.length, isRunning, onBroadcast]);
  
  return (
    <Card className="bg-slate-800/50 border-slate-700 p-4">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Satellite className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-400">Broadcast Mode</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Enable</span>
          <Switch
            checked={broadcastMode}
            onCheckedChange={onToggleBroadcastMode}
          />
        </div>
      </div>
      
      {!broadcastMode ? (
        <div className="text-center py-6 text-gray-500">
          <Radio className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Enable broadcast mode to transmit to all phase-locked nodes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sender selection */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Select Transmitter</label>
            <div className="flex flex-wrap gap-2">
              {parties.map(party => {
                const hasTargets = party.phaseLockWith.length > 0;
                return (
                  <Button
                    key={party.location.name}
                    size="sm"
                    variant={selectedSender === party.location.name ? "default" : "outline"}
                    className="text-xs"
                    style={{ 
                      backgroundColor: selectedSender === party.location.name ? party.color : undefined,
                      borderColor: party.color,
                      opacity: hasTargets ? 1 : 0.5
                    }}
                    onClick={() => setSelectedSender(party.location.name)}
                    disabled={!hasTargets}
                  >
                    <div 
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: party.color }}
                    />
                    {party.location.name}
                    {hasTargets && (
                      <Badge className="ml-1 bg-green-600 text-[10px] px-1">
                        {party.phaseLockWith.length}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Target visualization */}
          {selectedParty && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-700/50 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">
                  {lockedTargets.length} Phase-Locked Targets
                </span>
              </div>
              
              {/* Broadcast visualization */}
              <div className="relative py-4">
                {/* Center - sender */}
                <div className="flex items-center justify-center">
                  <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center relative z-10"
                    style={{ backgroundColor: selectedParty.color }}
                    animate={isBroadcasting ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <Radio className="w-6 h-6 text-white" />
                  </motion.div>
                </div>
                
                {/* Broadcast wave animation */}
                <AnimatePresence>
                  {isBroadcasting && (
                    <>
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          initial={{ opacity: 0.8, scale: 0.5 }}
                          animate={{ opacity: 0, scale: 2.5 }}
                          exit={{ opacity: 0 }}
                          transition={{ 
                            duration: 1.5, 
                            delay: i * 0.3,
                            ease: "easeOut"
                          }}
                        >
                          <div 
                            className="w-12 h-12 rounded-full border-2"
                            style={{ borderColor: selectedParty.color }}
                          />
                        </motion.div>
                      ))}
                    </>
                  )}
                </AnimatePresence>
                
                {/* Target nodes around the sender */}
                <div className="flex justify-center gap-4 mt-4">
                  {lockedTargets.map((targetName, i) => {
                    const targetParty = parties.find(p => p.location.name === targetName);
                    return (
                      <motion.div
                        key={targetName}
                        className="flex flex-col items-center"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <ArrowRight className="w-3 h-3 text-gray-500 mb-1 rotate-90" />
                        <motion.div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: targetParty?.color || '#6b7280' }}
                          animate={isBroadcasting ? { 
                            scale: [1, 1.3, 1],
                            boxShadow: [
                              `0 0 0 0 ${targetParty?.color || '#6b7280'}`,
                              `0 0 20px 5px ${targetParty?.color || '#6b7280'}`,
                              `0 0 0 0 ${targetParty?.color || '#6b7280'}`
                            ]
                          } : {}}
                          transition={{ 
                            duration: 0.5, 
                            delay: 0.3 + i * 0.2 
                          }}
                        >
                          <Zap className="w-4 h-4 text-white" />
                        </motion.div>
                        <span className="text-[10px] text-gray-400 mt-1 truncate max-w-[60px]">
                          {targetName}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Prime selection */}
          {selectedSender && lockedTargets.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Select Symbol</label>
              <div className="grid grid-cols-5 gap-2">
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
            </div>
          )}
          
          {/* Broadcast button */}
          {selectedSender && lockedTargets.length > 0 && (
            <Button
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 
                         bg-size-200 animate-gradient-x"
              onClick={handleBroadcast}
              disabled={!isRunning || isBroadcasting}
            >
              <Waves className="w-4 h-4 mr-2" />
              {isBroadcasting ? 'Broadcasting...' : `Broadcast to ${lockedTargets.length} Nodes`}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

export default BroadcastPanel;
