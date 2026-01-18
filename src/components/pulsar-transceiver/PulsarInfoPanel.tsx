/**
 * Pulsar Info Panel - Shows detailed information about selected pulsar
 * Allows setting as reference pulsar and toggling active state
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, Star, Activity, Clock, MapPin, Zap, 
  Radio, Target, Info
} from 'lucide-react';
import { Pulsar } from '@/lib/pulsar-transceiver/types';
import { equatorialToGalactic } from '@/lib/pulsar-transceiver/pulsar-catalog';

interface PulsarInfoPanelProps {
  pulsar: Pulsar | null;
  isActive: boolean;
  isReference: boolean;
  phase: number;
  onClose: () => void;
  onToggleActive: () => void;
  onSetReference: () => void;
}

export function PulsarInfoPanel({
  pulsar,
  isActive,
  isReference,
  phase,
  onClose,
  onToggleActive,
  onSetReference
}: PulsarInfoPanelProps) {
  if (!pulsar) return null;
  
  const galactic = equatorialToGalactic(pulsar.ra, pulsar.dec, pulsar.distance);
  const formatPhase = (p: number) => `${(p * 180 / Math.PI).toFixed(1)}°`;
  const formatRA = (ra: number) => `${((ra * 180 / Math.PI) / 15).toFixed(2)}h`;
  const formatDec = (dec: number) => `${(dec * 180 / Math.PI).toFixed(2)}°`;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="absolute top-4 right-4 w-72 z-10"
      >
        <Card className="bg-slate-900/95 border-slate-700 backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div 
            className="p-3 flex items-center justify-between"
            style={{ 
              background: isReference 
                ? 'linear-gradient(135deg, #b45309 0%, #92400e 100%)'
                : isActive
                ? 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)'
                : 'linear-gradient(135deg, #374151 0%, #1f2937 100%)'
            }}
          >
            <div className="flex items-center gap-2">
              <Star className={`w-5 h-5 ${isReference ? 'fill-yellow-400' : ''}`} />
              <span className="font-bold">{pulsar.name}</span>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 w-6 p-0 text-white/70 hover:text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Status badges */}
          <div className="px-3 py-2 flex gap-2 border-b border-slate-700">
            {isReference && (
              <Badge className="bg-amber-600 text-white">
                <Target className="w-3 h-3 mr-1" />
                Reference
              </Badge>
            )}
            <Badge className={isActive ? "bg-cyan-600" : "bg-slate-600"}>
              <Activity className={`w-3 h-3 mr-1 ${isActive ? 'animate-pulse' : ''}`} />
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          
          {/* Details */}
          <div className="p-3 space-y-3">
            {/* Timing */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Timing Parameters
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-gray-400 block">Period</span>
                  <span className="text-cyan-300 font-mono">{(pulsar.period * 1000).toFixed(3)} ms</span>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-gray-400 block">Frequency</span>
                  <span className="text-cyan-300 font-mono">{pulsar.frequency.toFixed(2)} Hz</span>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-gray-400 block">Ṗ</span>
                  <span className="text-cyan-300 font-mono">{pulsar.periodDot.toExponential(2)}</span>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-gray-400 block">Current φ</span>
                  <span className="text-cyan-300 font-mono">{formatPhase(phase)}</span>
                </div>
              </div>
            </div>
            
            {/* Position */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-purple-400 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Position
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-gray-400 block">RA</span>
                  <span className="text-purple-300 font-mono">{formatRA(pulsar.ra)}</span>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-gray-400 block">Dec</span>
                  <span className="text-purple-300 font-mono">{formatDec(pulsar.dec)}</span>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-gray-400 block">Distance</span>
                  <span className="text-purple-300 font-mono">{pulsar.distance} pc</span>
                </div>
                <div className="bg-slate-800 rounded p-2">
                  <span className="text-gray-400 block">Galactic</span>
                  <span className="text-purple-300 font-mono text-[10px]">
                    ({galactic.x.toFixed(2)}, {galactic.y.toFixed(2)}, {galactic.z.toFixed(2)})
                  </span>
                </div>
              </div>
            </div>
            
            {/* Phase visualization */}
            <div className="space-y-1">
              <h4 className="text-xs font-semibold text-green-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Phase Rotation
              </h4>
              <div className="relative h-16 bg-slate-800 rounded overflow-hidden">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  animate={{ rotate: phase * (180 / Math.PI) }}
                  transition={{ duration: 0.05 }}
                >
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-green-400" />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
                </div>
                {/* Phase markers */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <div className="w-14 h-14 rounded-full border border-green-400" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="p-3 border-t border-slate-700 space-y-2">
            <Button
              className={`w-full ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-cyan-600 hover:bg-cyan-700'}`}
              size="sm"
              onClick={onToggleActive}
            >
              <Radio className="w-4 h-4 mr-2" />
              {isActive ? 'Deactivate' : 'Activate'} Pulsar
            </Button>
            
            {!isReference && (
              <Button
                className="w-full bg-amber-600 hover:bg-amber-700"
                size="sm"
                onClick={onSetReference}
              >
                <Target className="w-4 h-4 mr-2" />
                Set as Reference
              </Button>
            )}
          </div>
          
          {/* Info footer */}
          <div className="px-3 py-2 bg-slate-800/50 text-[10px] text-gray-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Click elsewhere to close • Epoch: MJD {pulsar.epoch}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

export default PulsarInfoPanel;
