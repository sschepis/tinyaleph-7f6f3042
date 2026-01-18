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
    <div className="bg-card rounded-lg p-4 border border-border shadow-sm">
      <h2 className="text-sm font-semibold text-primary mb-3">System Controls</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        {/* Epsilon threshold */}
        <div className="bg-muted/50 rounded p-2.5 border border-border/50">
          <h3 className="text-[10px] text-muted-foreground mb-1.5">Phase Threshold ε</h3>
          <div className="flex items-center">
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.01"
              value={epsilon}
              onChange={(e) => onEpsilonChange(parseFloat(e.target.value))}
              disabled={!isPoweredOn}
              className="w-full mr-2 h-1.5 accent-primary"
            />
            <span className="text-[10px] w-8 text-primary font-mono">{epsilon.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
            <span>Tight</span>
            <span>Loose</span>
          </div>
        </div>
        
        {/* Twist coupling */}
        <div className="bg-muted/50 rounded p-2.5 border border-border/50">
          <h3 className="text-[10px] text-muted-foreground mb-1.5">Twist Coupling γ</h3>
          <div className="flex items-center">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={twistCoupling}
              onChange={(e) => onTwistChange(parseFloat(e.target.value))}
              disabled={!isPoweredOn}
              className="w-full mr-2 h-1.5 accent-primary"
            />
            <span className="text-[10px] w-8 text-primary font-mono">{twistCoupling.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
            <span>Weak</span>
            <span>Strong</span>
          </div>
        </div>
        
        {/* Preset selector */}
        <div className="bg-muted/50 rounded p-2.5 border border-border/50">
          <h3 className="text-[10px] text-muted-foreground mb-1.5">Configuration Preset</h3>
          <select
            onChange={(e) => onPresetSelect(parseInt(e.target.value))}
            disabled={!isPoweredOn}
            className="w-full bg-muted rounded px-2 py-1 text-[10px] border border-border disabled:opacity-50"
          >
            <option value="">Select preset...</option>
            {presets.map((preset, i) => (
              <option key={i} value={i}>{preset.name}</option>
            ))}
          </select>
        </div>
        
        {/* Reset button */}
        <div className="bg-muted/50 rounded p-2.5 border border-border/50 flex flex-col justify-center">
          <button
            onClick={onReset}
            disabled={!isPoweredOn}
            className="px-3 py-1.5 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded text-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            RESET SYSTEM
          </button>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="pt-3 border-t border-border flex justify-between">
        <div className="flex space-x-1.5">
          <button 
            onClick={onOpenPrimeExplorer}
            disabled={!isPoweredOn}
            className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded text-[10px] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Dna className="w-3 h-3 mr-1" />
            Prime Explorer
          </button>
          <button 
            onClick={onOpenTopologyView}
            disabled={!isPoweredOn}
            className="px-2 py-1 bg-muted hover:bg-muted/80 border border-border rounded text-[10px] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Network className="w-3 h-3 mr-1" />
            Topology View
          </button>
        </div>
        <button 
          onClick={onOpenAdvancedControls}
          disabled={!isPoweredOn}
          className="px-2 py-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded text-[10px] flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Settings className="w-3 h-3 mr-1" />
          Advanced
        </button>
      </div>
    </div>
  );
}
