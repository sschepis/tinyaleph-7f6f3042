import React from 'react';
import { Dna, Network, Settings } from 'lucide-react';

interface Preset {
  name: string;
  primeAlice: number;
  primeBob: number;
  twistCoupling: number;
  epsilon: number;
}

interface SystemControlsPanelProps {
  isPoweredOn: boolean;
  epsilon: number;
  onEpsilonChange: (value: number) => void;
  twistCoupling: number;
  onTwistChange: (value: number) => void;
  presets: Preset[];
  onPresetSelect: (index: number) => void;
  onReset: () => void;
  onOpenPrimeExplorer: () => void;
  onOpenTopologyView: () => void;
  onOpenAdvancedControls: () => void;
}

export function SystemControlsPanel({
  isPoweredOn,
  epsilon,
  onEpsilonChange,
  twistCoupling,
  onTwistChange,
  presets,
  onPresetSelect,
  onReset,
  onOpenPrimeExplorer,
  onOpenTopologyView,
  onOpenAdvancedControls
}: SystemControlsPanelProps) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-shadow border border-gray-700/50">
      <h2 className="text-xl font-semibold text-indigo-300 mb-4">SYSTEM CONTROLS</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Epsilon threshold */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
          <h3 className="text-sm text-gray-400 mb-2">Phase Threshold ε</h3>
          <div className="flex items-center">
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.01"
              value={epsilon}
              onChange={(e) => onEpsilonChange(parseFloat(e.target.value))}
              disabled={!isPoweredOn}
              className="w-full mr-2"
            />
            <span className="text-xs w-12 text-indigo-300">{epsilon.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Tight</span>
            <span>Loose</span>
          </div>
        </div>
        
        {/* Twist coupling */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
          <h3 className="text-sm text-gray-400 mb-2">Twist Coupling γ</h3>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={twistCoupling}
              onChange={(e) => onTwistChange(parseFloat(e.target.value))}
              disabled={!isPoweredOn}
              className="w-full mr-2"
            />
            <span className="text-xs w-12 text-indigo-300">{twistCoupling.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Weak</span>
            <span>Strong</span>
          </div>
        </div>
        
        {/* Preset selector */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
          <h3 className="text-sm text-gray-400 mb-2">Configuration Preset</h3>
          <select
            onChange={(e) => onPresetSelect(parseInt(e.target.value))}
            disabled={!isPoweredOn}
            className="w-full bg-gray-800 rounded px-3 py-2 text-sm border border-gray-700 disabled:opacity-50"
          >
            <option value="">Select preset...</option>
            {presets.map((preset, i) => (
              <option key={i} value={i}>{preset.name}</option>
            ))}
          </select>
        </div>
        
        {/* Reset button */}
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30 flex flex-col justify-center">
          <button
            onClick={onReset}
            disabled={!isPoweredOn}
            className="px-4 py-2 bg-red-600/80 hover:bg-red-600 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            RESET SYSTEM
          </button>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="pt-4 border-t border-gray-700 flex justify-between">
        <div className="flex space-x-2">
          <button 
            onClick={onOpenPrimeExplorer}
            disabled={!isPoweredOn}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Dna className="w-3 h-3 mr-1" />
            Prime Explorer
          </button>
          <button 
            onClick={onOpenTopologyView}
            disabled={!isPoweredOn}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Network className="w-3 h-3 mr-1" />
            Topology View
          </button>
        </div>
        <button 
          onClick={onOpenAdvancedControls}
          disabled={!isPoweredOn}
          className="px-3 py-1 bg-purple-700 hover:bg-purple-600 rounded text-xs flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Settings className="w-3 h-3 mr-1" />
          Advanced Controls
        </button>
      </div>
    </div>
  );
}
