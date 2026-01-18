import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Eraser, Target } from 'lucide-react';
import { ProjectionResult, TransmissionEvent } from '@/lib/quaternion-nonlocal/types';

interface TransmitterPanelProps {
  isPoweredOn: boolean;
  onTransmit: (sender: 'alice' | 'bob') => void;
  onMeasure: (who: 'alice' | 'bob') => void;
  transmissionHistory: TransmissionEvent[];
  lastProjection: ProjectionResult | null;
}

export function TransmitterPanel({
  isPoweredOn,
  onTransmit,
  onMeasure,
  transmissionHistory,
  lastProjection
}: TransmitterPanelProps) {
  const [inputText, setInputText] = useState('');
  const [transmitMode, setTransmitMode] = useState<'alice' | 'bob'>('alice');

  const handleTransmit = () => {
    if (!isPoweredOn) return;
    onTransmit(transmitMode);
  };

  const handleMeasure = () => {
    if (!isPoweredOn) return;
    onMeasure(transmitMode);
  };

  return (
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-primary">Transmitter</h2>
        <span className={`px-2 py-0.5 rounded-full text-[10px] ${
          isPoweredOn ? 'bg-muted text-muted-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          {isPoweredOn ? 'STANDBY' : 'OFFLINE'}
        </span>
      </div>
      
      {/* Mode selector and controls */}
      <div className="mb-3">
        <div className="flex space-x-2 mb-2">
          <select
            value={transmitMode}
            onChange={(e) => setTransmitMode(e.target.value as 'alice' | 'bob')}
            className="flex-grow bg-muted rounded px-2 py-1.5 text-xs border border-border"
          >
            <option value="alice">Alice's Channel</option>
            <option value="bob">Bob's Channel</option>
          </select>
          <button
            onClick={() => setInputText('')}
            className="px-2 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded text-xs"
          >
            <Eraser className="w-3 h-3" />
          </button>
        </div>
        
        {/* Symbolic input */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter symbolic message..."
          className="w-full h-16 bg-muted/50 rounded p-2 text-xs font-mono mb-2 border border-border resize-none placeholder-muted-foreground"
          disabled={!isPoweredOn}
        />
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleTransmit}
            disabled={!isPoweredOn}
            className={`flex-1 px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1 ${
              transmitMode === 'alice' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-cyan-600 hover:bg-cyan-700 text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send className="w-3 h-3" />
            TX ({transmitMode.toUpperCase()})
          </button>
          <button
            onClick={handleMeasure}
            disabled={!isPoweredOn}
            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-xs flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Target className="w-3 h-3" />
            MEASURE
          </button>
        </div>
      </div>
      
      {/* Last projection result */}
      {lastProjection && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-2 mb-3 bg-primary/10 rounded border border-primary/30"
        >
          <div className="text-[10px] text-muted-foreground mb-1">Collapse Result</div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${
              lastProjection.eigenvalue > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {lastProjection.eigenvalue > 0 ? '+' : ''}√p = {lastProjection.eigenvalue.toFixed(4)}
            </span>
            <span className="text-primary text-[10px]">{lastProjection.symbolicMeaning}</span>
          </div>
        </motion.div>
      )}
      
      {/* Transmission history */}
      <div className="pt-3 border-t border-border">
        <div className="text-[10px] text-muted-foreground mb-1">TX History</div>
        <div className="h-16 overflow-y-auto text-[10px] font-mono bg-muted/50 p-1.5 rounded border border-border">
          {transmissionHistory.length === 0 ? (
            <div className="text-muted-foreground">[SYS] Transmitter ready</div>
          ) : (
            transmissionHistory.slice(-5).reverse().map((tx, i) => (
              <div key={i} className={tx.phaseLockAchieved ? 'text-green-400' : 'text-muted-foreground'}>
                [{new Date(tx.timestamp).toLocaleTimeString()}] p={tx.prime.p} γ={tx.twistApplied.toFixed(2)}
                {tx.phaseLockAchieved ? ' ✓' : ' ✗'}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
