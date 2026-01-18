/**
 * Transmission Replay - Playback past communications with timing and light-delay effects
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, Pause, SkipBack, SkipForward, Rewind, FastForward,
  Clock, Radio, ArrowRight, Zap, History, RotateCcw
} from 'lucide-react';
import { SRCTransmission, SemanticMapping, ObserverLocation } from '@/lib/pulsar-transceiver/types';

interface ReplayState {
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  startTime: number;
  endTime: number;
}

interface PropagationEvent {
  transmission: SRCTransmission;
  sender: string;
  receiver: string;
  sentAt: number;
  arrivedAt: number;
  lightDelay: number;
  progress: number; // 0-1
  status: 'pending' | 'in-transit' | 'arrived';
}

interface TransmissionReplayProps {
  transmissionHistory: SRCTransmission[];
  parties: Array<{
    location: ObserverLocation;
    phaseLockWith: string[];
    color: string;
  }>;
  semanticMap: SemanticMapping[];
}

// Calculate light delay between positions
function calculateLightDelay(
  from: { x: number; y: number; z: number },
  to: { x: number; y: number; z: number }
): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const distanceKpc = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return distanceKpc * 0.5; // 0.5s per kpc for visualization
}

export function TransmissionReplay({
  transmissionHistory,
  parties,
  semanticMap
}: TransmissionReplayProps) {
  const [replay, setReplay] = useState<ReplayState>({
    isPlaying: false,
    currentTime: 0,
    playbackSpeed: 1,
    startTime: 0,
    endTime: 10
  });
  
  const [propagationEvents, setPropagationEvents] = useState<PropagationEvent[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  
  // Build propagation events from history
  useEffect(() => {
    if (transmissionHistory.length === 0) {
      setPropagationEvents([]);
      return;
    }
    
    const events: PropagationEvent[] = [];
    const timestamps = transmissionHistory.map(tx => tx.timestamp);
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    
    transmissionHistory.forEach(tx => {
      // Extract sender from ID (format: TX-timestamp-senderName or TX-timestamp)
      const parts = tx.id.split('-');
      const senderName = parts.length > 2 ? parts.slice(2).join('-') : parties[0]?.location.name || 'Unknown';
      
      const senderParty = parties.find(p => p.location.name === senderName) || parties[0];
      if (!senderParty) return;
      
      // Create events for each potential receiver
      parties.forEach(receiverParty => {
        if (receiverParty.location.name === senderName) return;
        
        const delay = calculateLightDelay(
          senderParty.location.galactic,
          receiverParty.location.galactic
        );
        
        events.push({
          transmission: tx,
          sender: senderName,
          receiver: receiverParty.location.name,
          sentAt: tx.timestamp,
          arrivedAt: tx.timestamp + delay,
          lightDelay: delay,
          progress: 0,
          status: 'pending'
        });
      });
    });
    
    setPropagationEvents(events);
    setReplay(prev => ({
      ...prev,
      startTime: minTime,
      endTime: Math.max(maxTime + 5, minTime + 10),
      currentTime: minTime
    }));
  }, [transmissionHistory, parties]);
  
  // Update events based on current replay time
  const updateEvents = useCallback(() => {
    setPropagationEvents(prev => 
      prev.map(event => {
        if (replay.currentTime < event.sentAt) {
          return { ...event, progress: 0, status: 'pending' as const };
        } else if (replay.currentTime >= event.arrivedAt) {
          return { ...event, progress: 1, status: 'arrived' as const };
        } else {
          const elapsed = replay.currentTime - event.sentAt;
          const progress = Math.min(1, elapsed / event.lightDelay);
          return { ...event, progress, status: 'in-transit' as const };
        }
      })
    );
  }, [replay.currentTime]);
  
  useEffect(() => {
    updateEvents();
  }, [replay.currentTime, updateEvents]);
  
  // Playback loop
  useEffect(() => {
    if (!replay.isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }
    
    const tick = (timestamp: number) => {
      if (lastTickRef.current === 0) {
        lastTickRef.current = timestamp;
      }
      
      const delta = (timestamp - lastTickRef.current) / 1000;
      lastTickRef.current = timestamp;
      
      setReplay(prev => {
        const newTime = prev.currentTime + delta * prev.playbackSpeed;
        if (newTime >= prev.endTime) {
          return { ...prev, isPlaying: false, currentTime: prev.endTime };
        }
        return { ...prev, currentTime: newTime };
      });
      
      animationRef.current = requestAnimationFrame(tick);
    };
    
    lastTickRef.current = 0;
    animationRef.current = requestAnimationFrame(tick);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [replay.isPlaying, replay.playbackSpeed]);
  
  const togglePlay = () => setReplay(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  const resetReplay = () => setReplay(prev => ({ 
    ...prev, 
    isPlaying: false, 
    currentTime: prev.startTime 
  }));
  const skipToEnd = () => setReplay(prev => ({ 
    ...prev, 
    isPlaying: false, 
    currentTime: prev.endTime 
  }));
  
  const inTransitEvents = propagationEvents.filter(e => e.status === 'in-transit');
  const arrivedEvents = propagationEvents.filter(e => e.status === 'arrived');
  
  if (transmissionHistory.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-amber-400">Transmission Replay</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <History className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No transmissions to replay</p>
          <p className="text-xs">Transmit messages to build history</p>
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="bg-slate-800/50 border-slate-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-amber-400">Transmission Replay</h3>
        </div>
        <Badge variant="outline" className="border-amber-600 text-amber-300">
          {transmissionHistory.length} Events
        </Badge>
      </div>
      
      {/* Timeline */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
          <span>{replay.startTime.toFixed(2)}s</span>
          <span className="text-cyan-300 font-mono">{replay.currentTime.toFixed(2)}s</span>
          <span>{replay.endTime.toFixed(2)}s</span>
        </div>
        <Slider
          value={[replay.currentTime]}
          min={replay.startTime}
          max={replay.endTime}
          step={0.01}
          onValueChange={([v]) => setReplay(prev => ({ ...prev, currentTime: v, isPlaying: false }))}
          className="mb-2"
        />
        
        {/* Event markers on timeline */}
        <div className="relative h-4 bg-slate-700 rounded overflow-hidden">
          {transmissionHistory.map((tx, i) => {
            const pos = ((tx.timestamp - replay.startTime) / (replay.endTime - replay.startTime)) * 100;
            return (
              <div
                key={tx.id}
                className="absolute w-1 h-full bg-cyan-500"
                style={{ left: `${pos}%` }}
                title={`${tx.prime}: ${tx.meaning}`}
              />
            );
          })}
          {/* Playhead */}
          <motion.div
            className="absolute w-0.5 h-full bg-amber-400 z-10"
            style={{ 
              left: `${((replay.currentTime - replay.startTime) / (replay.endTime - replay.startTime)) * 100}%` 
            }}
          />
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Button size="sm" variant="outline" onClick={resetReplay}>
          <SkipBack className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setReplay(prev => ({ ...prev, playbackSpeed: Math.max(0.25, prev.playbackSpeed / 2) }))}
        >
          <Rewind className="w-4 h-4" />
        </Button>
        <Button 
          size="sm" 
          className={replay.isPlaying ? 'bg-amber-600' : 'bg-green-600'}
          onClick={togglePlay}
        >
          {replay.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => setReplay(prev => ({ ...prev, playbackSpeed: Math.min(4, prev.playbackSpeed * 2) }))}
        >
          <FastForward className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={skipToEnd}>
          <SkipForward className="w-4 h-4" />
        </Button>
        <Badge variant="outline" className="ml-2">
          {replay.playbackSpeed}x
        </Badge>
      </div>
      
      {/* In-Transit Signals */}
      <div className="mb-4">
        <h4 className="text-xs font-semibold text-cyan-400 mb-2 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Signals In Transit ({inTransitEvents.length})
        </h4>
        <AnimatePresence mode="popLayout">
          {inTransitEvents.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">No signals in transit</p>
          ) : (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {inTransitEvents.slice(0, 5).map(event => {
                const senderParty = parties.find(p => p.location.name === event.sender);
                const receiverParty = parties.find(p => p.location.name === event.receiver);
                
                return (
                  <motion.div
                    key={`${event.transmission.id}-${event.receiver}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 text-xs bg-slate-700/50 p-2 rounded"
                  >
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: senderParty?.color }}
                    />
                    <span className="truncate max-w-[50px]">{event.sender}</span>
                    <ArrowRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: receiverParty?.color }}
                    />
                    <span className="truncate max-w-[50px]">{event.receiver}</span>
                    
                    {/* Progress bar */}
                    <div className="flex-1 h-1.5 bg-slate-600 rounded-full overflow-hidden mx-2">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${event.progress * 100}%` }}
                      />
                    </div>
                    
                    <Badge variant="outline" className="text-[10px]">
                      {event.transmission.prime}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Arrived Signals */}
      <div>
        <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1">
          <Radio className="w-3 h-3" />
          Decoded at Current Time ({arrivedEvents.length})
        </h4>
        <ScrollArea className="h-24">
          {arrivedEvents.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">No decoded signals yet</p>
          ) : (
            <div className="space-y-1">
              {arrivedEvents.slice(-10).reverse().map(event => (
                <div
                  key={`${event.transmission.id}-${event.receiver}-arrived`}
                  className="flex items-center gap-2 text-[10px] bg-green-900/20 p-1.5 rounded"
                >
                  <span className="text-gray-400">{event.arrivedAt.toFixed(2)}s</span>
                  <span className="font-mono text-cyan-300">{event.transmission.prime}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-300 truncate">{event.receiver}</span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </Card>
  );
}

export default TransmissionReplay;
