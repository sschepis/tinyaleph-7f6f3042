/**
 * Message Decoding Visualization
 * Shows real-time message propagation with light-delay animation across the network
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Radio, CheckCircle, Clock, Zap, ArrowRight, 
  Lock, Unlock, Activity, Waves
} from 'lucide-react';
import { SRCTransmission, SemanticMapping, ObserverLocation } from '@/lib/pulsar-transceiver/types';

interface PropagatingMessage {
  id: string;
  transmission: SRCTransmission;
  senderName: string;
  targets: string[];
  sentAt: number;
  arrivals: Map<string, { arrivedAt: number; decoded: boolean; lightDelay: number }>;
}

interface MessageDecodingVizProps {
  transmissions: SRCTransmission[];
  parties: Array<{
    location: ObserverLocation;
    phaseLockWith: string[];
    color: string;
  }>;
  semanticMap: SemanticMapping[];
  time: number;
  broadcastMode: boolean;
}

// Calculate simulated light delay between two galactic positions (scaled for visualization)
function calculateLightDelay(
  from: { x: number; y: number; z: number },
  to: { x: number; y: number; z: number }
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const distanceKpc = Math.sqrt(dx * dx + dy * dy + dz * dz);
  // Scale: 1 kpc = ~3260 light years, but we'll use accelerated time
  // Return delay in simulation seconds (scaled for UX)
  return distanceKpc * 0.5; // 0.5 seconds per kpc for visualization
}

export function MessageDecodingViz({
  transmissions,
  parties,
  semanticMap,
  time,
  broadcastMode
}: MessageDecodingVizProps) {
  const [propagatingMessages, setPropagatingMessages] = useState<PropagatingMessage[]>([]);
  const [decodedHistory, setDecodedHistory] = useState<Array<{
    id: string;
    prime: number;
    meaning: string;
    sender: string;
    receiver: string;
    receivedAt: number;
    wasLocked: boolean;
  }>>([]);
  
  // Track new transmissions and create propagating messages
  useEffect(() => {
    if (transmissions.length === 0) return;
    
    const latestTx = transmissions[transmissions.length - 1];
    
    // Check if we already have this message
    if (propagatingMessages.some(pm => pm.id === latestTx.id)) return;
    
    // Find sender party
    const senderParty = parties.find(p => 
      latestTx.id.includes(p.location.name) || p.location.name === 'Earth Observer'
    ) || parties[0];
    
    if (!senderParty) return;
    
    // Determine targets
    const targets = broadcastMode 
      ? senderParty.phaseLockWith 
      : parties.filter(p => p.location.name !== senderParty.location.name).slice(0, 1).map(p => p.location.name);
    
    if (targets.length === 0) return;
    
    // Calculate arrivals with light delays
    const arrivals = new Map<string, { arrivedAt: number; decoded: boolean; lightDelay: number }>();
    targets.forEach(targetName => {
      const targetParty = parties.find(p => p.location.name === targetName);
      if (targetParty) {
        const delay = calculateLightDelay(
          senderParty.location.galactic,
          targetParty.location.galactic
        );
        arrivals.set(targetName, {
          arrivedAt: time + delay,
          decoded: false,
          lightDelay: delay
        });
      }
    });
    
    const newMessage: PropagatingMessage = {
      id: latestTx.id,
      transmission: latestTx,
      senderName: senderParty.location.name,
      targets,
      sentAt: time,
      arrivals
    };
    
    setPropagatingMessages(prev => [...prev, newMessage]);
  }, [transmissions.length]);
  
  // Update arrivals based on time
  useEffect(() => {
    setPropagatingMessages(prev => {
      let updated = false;
      const newMessages = prev.map(msg => {
        const newArrivals = new Map(msg.arrivals);
        
        msg.arrivals.forEach((arrival, targetName) => {
          if (!arrival.decoded && time >= arrival.arrivedAt) {
            newArrivals.set(targetName, { ...arrival, decoded: true });
            updated = true;
            
            // Add to decoded history
            setDecodedHistory(h => [...h, {
              id: `${msg.id}-${targetName}`,
              prime: msg.transmission.prime,
              meaning: msg.transmission.meaning,
              sender: msg.senderName,
              receiver: targetName,
              receivedAt: time,
              wasLocked: msg.transmission.wasLocked
            }].slice(-50)); // Keep last 50
          }
        });
        
        return { ...msg, arrivals: newArrivals };
      });
      
      // Remove fully decoded messages after a delay
      return newMessages.filter(msg => {
        const allDecoded = Array.from(msg.arrivals.values()).every(a => a.decoded);
        return !allDecoded || time - msg.sentAt < 5; // Keep for 5 seconds after completion
      });
    });
  }, [time]);
  
  const activeMessages = propagatingMessages.filter(msg => 
    Array.from(msg.arrivals.values()).some(a => !a.decoded)
  );

  return (
    <div className="space-y-4">
      {/* Active Propagations */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Waves className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h3 className="text-lg font-semibold text-cyan-400">Signal Propagation</h3>
          {activeMessages.length > 0 && (
            <Badge className="bg-cyan-600 animate-pulse">{activeMessages.length} Active</Badge>
          )}
        </div>
        
        <AnimatePresence mode="popLayout">
          {activeMessages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <Radio className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No signals in transit</p>
              <p className="text-xs">Transmit a message to see propagation</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {activeMessages.map(msg => {
                const senderParty = parties.find(p => p.location.name === msg.senderName);
                const meaning = semanticMap.find(m => m.prime === msg.transmission.prime)?.meaning || '?';
                
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-slate-700/50 rounded-lg p-3 border border-slate-600"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: senderParty?.color || '#10b981' }}
                      />
                      <span className="font-semibold text-sm" style={{ color: senderParty?.color }}>
                        {msg.senderName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        <span className="font-mono mr-1">{msg.transmission.prime}</span>
                        {meaning}
                      </Badge>
                      {broadcastMode && (
                        <Badge className="bg-purple-600 text-xs">BROADCAST</Badge>
                      )}
                    </div>
                    
                    {/* Propagation to each target */}
                    <div className="space-y-2">
                      {Array.from(msg.arrivals.entries()).map(([targetName, arrival]) => {
                        const targetParty = parties.find(p => p.location.name === targetName);
                        const progress = arrival.decoded 
                          ? 100 
                          : Math.min(100, ((time - msg.sentAt) / arrival.lightDelay) * 100);
                        const timeRemaining = Math.max(0, arrival.arrivedAt - time);
                        
                        return (
                          <div key={targetName} className="flex items-center gap-2">
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: targetParty?.color || '#8b5cf6' }}
                            />
                            <span className="text-xs text-gray-300 w-24 truncate">{targetName}</span>
                            
                            {/* Progress bar */}
                            <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{ 
                                  background: arrival.decoded 
                                    ? 'linear-gradient(90deg, #10b981, #22d3ee)'
                                    : 'linear-gradient(90deg, #8b5cf6, #ec4899)'
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.1 }}
                              />
                            </div>
                            
                            {/* Status */}
                            {arrival.decoded ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <span className="text-xs text-gray-400 font-mono w-12">
                                {timeRemaining.toFixed(1)}s
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </Card>
      
      {/* Decoded Messages */}
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-green-400">Decoded Messages</h3>
        </div>
        
        <ScrollArea className="h-40">
          {decodedHistory.length === 0 ? (
            <p className="text-gray-500 text-center text-sm py-4">
              Messages will appear here when decoded
            </p>
          ) : (
            <div className="space-y-2">
              {decodedHistory.slice().reverse().map(decoded => {
                const senderParty = parties.find(p => p.location.name === decoded.sender);
                const receiverParty = parties.find(p => p.location.name === decoded.receiver);
                
                return (
                  <motion.div
                    key={decoded.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-xs bg-slate-700/30 p-2 rounded"
                  >
                    {decoded.wasLocked ? (
                      <Lock className="w-3 h-3 text-green-400" />
                    ) : (
                      <Unlock className="w-3 h-3 text-yellow-400" />
                    )}
                    
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: senderParty?.color }}
                    />
                    <span className="text-gray-400 truncate max-w-[60px]">{decoded.sender}</span>
                    
                    <ArrowRight className="w-3 h-3 text-gray-500" />
                    
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: receiverParty?.color }}
                    />
                    <span className="text-gray-400 truncate max-w-[60px]">{decoded.receiver}</span>
                    
                    <Badge variant="outline" className="ml-auto">
                      <span className="font-mono mr-1">{decoded.prime}</span>
                      <span className="text-cyan-300">{decoded.meaning}</span>
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}

export default MessageDecodingViz;
