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
    <div className="bg-gray-800/50 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow border border-gray-700/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-indigo-300">TRANSMITTER</h2>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs ${
            isPoweredOn ? 'bg-indigo-900/50 text-indigo-300' : 'bg-gray-700 text-gray-400'
          }`}>
            {isPoweredOn ? 'STANDBY' : 'OFFLINE'}
          </span>
        </div>
      </div>
      
      {/* Mode selector and controls */}
      <div className="mb-4">
        <div className="flex space-x-2 mb-3">
          <select
            value={transmitMode}
            onChange={(e) => setTransmitMode(e.target.value as 'alice' | 'bob')}
            className="flex-grow bg-gray-800 rounded px-3 py-2 text-sm border border-gray-700"
          >
            <option value="alice">Alice's Channel</option>
            <option value="bob">Bob's Channel</option>
          </select>
          <button
            onClick={() => setInputText('')}
            className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>
        
        {/* Symbolic input */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter symbolic message to transmit..."
          className="w-full h-24 bg-gray-900 rounded p-3 text-sm font-mono mb-3 border border-gray-700 resize-none placeholder-gray-600"
          disabled={!isPoweredOn}
        />
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleTransmit}
            disabled={!isPoweredOn}
            className={`flex-1 px-4 py-2 rounded-md text-sm flex items-center justify-center gap-2 ${
              transmitMode === 'alice' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Send className="w-4 h-4" />
            TRANSMIT ({transmitMode.toUpperCase()})
          </button>
          <button
            onClick={handleMeasure}
            disabled={!isPoweredOn}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Target className="w-4 h-4" />
            MEASURE
          </button>
        </div>
      </div>
      
      {/* Last projection result */}
      {lastProjection && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 mb-4 bg-purple-900/30 rounded-lg border border-purple-500/30"
        >
          <div className="text-xs text-gray-400 mb-1">Collapse Result</div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`px-2 py-0.5 rounded text-xs ${
              lastProjection.eigenvalue > 0 ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
            }`}>
              {lastProjection.eigenvalue > 0 ? '+' : ''}√p = {lastProjection.eigenvalue.toFixed(4)}
            </span>
            <span className="text-indigo-300 text-xs">{lastProjection.symbolicMeaning}</span>
          </div>
        </motion.div>
      )}
      
      {/* Transmission history */}
      <div className="pt-4 border-t border-gray-700">
        <div className="text-sm text-gray-400 mb-2">Transmission History</div>
        <div className="h-20 overflow-y-auto text-xs font-mono bg-gray-900 p-2 rounded border border-gray-700">
          {transmissionHistory.length === 0 ? (
            <div className="text-gray-500">[SYSTEM] Transmitter initialized</div>
          ) : (
            transmissionHistory.slice(-5).reverse().map((tx, i) => (
              <div key={i} className={tx.phaseLockAchieved ? 'text-green-400' : 'text-gray-400'}>
                [{new Date(tx.timestamp).toLocaleTimeString()}] TX: p={tx.prime.p} γ={tx.twistApplied.toFixed(2)}
                {tx.phaseLockAchieved ? ' ✓' : ' ✗'}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
