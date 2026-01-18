import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Sliders, Zap, Gauge, RotateCcw, Save, Upload } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface Preset {
  name: string;
  primeAlice: number;
  primeBob: number;
  twistCoupling: number;
  epsilon: number;
}

interface AdvancedControlsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epsilon: number;
  onEpsilonChange: (value: number) => void;
  twistCoupling: number;
  onTwistChange: (value: number) => void;
  presets: Preset[];
  onPresetSelect: (index: number) => void;
  onReset: () => void;
  selectedPrimeAlice: number;
  selectedPrimeBob: number;
}

export function AdvancedControlsDialog({
  open,
  onOpenChange,
  epsilon,
  onEpsilonChange,
  twistCoupling,
  onTwistChange,
  presets,
  onPresetSelect,
  onReset,
  selectedPrimeAlice,
  selectedPrimeBob
}: AdvancedControlsDialogProps) {
  const [customPresetName, setCustomPresetName] = useState('');
  const [savedPresets, setSavedPresets] = useState<Preset[]>([]);

  // Advanced parameters (local state for demonstration)
  const [decoherenceRate, setDecoherenceRate] = useState(0.05);
  const [couplingStrength, setCouplingStrength] = useState(0.8);
  const [phaseNoise, setPhaseNoise] = useState(0.02);
  const [measurementBasis, setMeasurementBasis] = useState<'computational' | 'bell' | 'custom'>('computational');

  const handleSavePreset = () => {
    if (!customPresetName.trim()) return;
    
    const newPreset: Preset = {
      name: customPresetName,
      primeAlice: selectedPrimeAlice,
      primeBob: selectedPrimeBob,
      twistCoupling,
      epsilon
    };
    
    setSavedPresets(prev => [...prev, newPreset]);
    setCustomPresetName('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-gray-900 border-indigo-500/30 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-2xl text-indigo-300 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Advanced Controls
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Core Parameters */}
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Core Parameters
              </h3>

              {/* Phase Threshold */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Phase Threshold (ε)</span>
                  <span className="text-indigo-300 font-mono">{epsilon.toFixed(3)}</span>
                </div>
                <Slider
                  value={[epsilon]}
                  onValueChange={([v]) => onEpsilonChange(v)}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Precise</span>
                  <span>Tolerant</span>
                </div>
              </div>

              {/* Twist Coupling */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Twist Coupling (γ)</span>
                  <span className="text-indigo-300 font-mono">{twistCoupling.toFixed(3)}</span>
                </div>
                <Slider
                  value={[twistCoupling]}
                  onValueChange={([v]) => onTwistChange(v)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Decoupled</span>
                  <span>Maximal</span>
                </div>
              </div>

              {/* Decoherence Rate */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Decoherence Rate</span>
                  <span className="text-indigo-300 font-mono">{decoherenceRate.toFixed(3)}</span>
                </div>
                <Slider
                  value={[decoherenceRate]}
                  onValueChange={([v]) => setDecoherenceRate(v)}
                  min={0}
                  max={0.2}
                  step={0.005}
                  className="w-full"
                />
              </div>

              {/* Coupling Strength */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Coupling Strength</span>
                  <span className="text-indigo-300 font-mono">{couplingStrength.toFixed(2)}</span>
                </div>
                <Slider
                  value={[couplingStrength]}
                  onValueChange={([v]) => setCouplingStrength(v)}
                  min={0}
                  max={1}
                  step={0.05}
                  className="w-full"
                />
              </div>

              {/* Phase Noise */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Phase Noise</span>
                  <span className="text-indigo-300 font-mono">{phaseNoise.toFixed(3)}</span>
                </div>
                <Slider
                  value={[phaseNoise]}
                  onValueChange={([v]) => setPhaseNoise(v)}
                  min={0}
                  max={0.1}
                  step={0.005}
                  className="w-full"
                />
              </div>
            </div>

            {/* Measurement Basis */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4" />
                Measurement Basis
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(['computational', 'bell', 'custom'] as const).map(basis => (
                  <button
                    key={basis}
                    onClick={() => setMeasurementBasis(basis)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      measurementBasis === basis
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {basis.charAt(0).toUpperCase() + basis.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="space-y-6">
            {/* Built-in Presets */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Configuration Presets
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => onPresetSelect(i)}
                    className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors"
                  >
                    <div className="text-sm text-gray-200">{preset.name}</div>
                    <div className="text-xs text-gray-500">
                      A:{preset.primeAlice} B:{preset.primeBob} γ:{preset.twistCoupling} ε:{preset.epsilon}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Presets */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="text-sm font-semibold text-indigo-400 mb-3 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Current Configuration
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customPresetName}
                  onChange={(e) => setCustomPresetName(e.target.value)}
                  placeholder="Preset name..."
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm"
                />
                <button
                  onClick={handleSavePreset}
                  disabled={!customPresetName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </div>
              
              {savedPresets.length > 0 && (
                <div className="space-y-2 max-h-24 overflow-y-auto">
                  {savedPresets.map((preset, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        onEpsilonChange(preset.epsilon);
                        onTwistChange(preset.twistCoupling);
                      }}
                      className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-left transition-colors text-sm"
                    >
                      <div className="text-gray-200">{preset.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current State Summary */}
            <div className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-500/30">
              <h3 className="text-sm font-semibold text-indigo-400 mb-3">Current Configuration</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-400">Alice Prime:</span>
                  <span className="text-green-400 ml-2 font-mono">{selectedPrimeAlice}</span>
                </div>
                <div>
                  <span className="text-gray-400">Bob Prime:</span>
                  <span className="text-blue-400 ml-2 font-mono">{selectedPrimeBob}</span>
                </div>
                <div>
                  <span className="text-gray-400">ε:</span>
                  <span className="text-indigo-300 ml-2 font-mono">{epsilon.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-gray-400">γ:</span>
                  <span className="text-indigo-300 ml-2 font-mono">{twistCoupling.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={onReset}
              className="w-full px-4 py-3 bg-red-600/80 hover:bg-red-600 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset All Parameters
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
