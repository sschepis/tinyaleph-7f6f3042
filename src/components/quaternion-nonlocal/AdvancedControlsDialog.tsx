import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Settings, Sliders, Zap, Gauge, RotateCcw, Save } from 'lucide-react';
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
      <DialogContent className="max-w-3xl bg-background border-border text-foreground">
        <DialogHeader>
          <DialogTitle className="text-2xl text-primary flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Advanced Controls
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Core Parameters */}
          <div className="space-y-6">
            <div className="bg-card/50 rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold text-primary mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                Core Parameters
              </h3>

              {/* Phase Threshold */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Phase Threshold (ε)</span>
                  <span className="text-primary font-mono">{epsilon.toFixed(3)}</span>
                </div>
                <Slider
                  value={[epsilon]}
                  onValueChange={([v]) => onEpsilonChange(v)}
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Precise</span>
                  <span>Tolerant</span>
                </div>
              </div>

              {/* Twist Coupling */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Twist Coupling (γ)</span>
                  <span className="text-primary font-mono">{twistCoupling.toFixed(3)}</span>
                </div>
                <Slider
                  value={[twistCoupling]}
                  onValueChange={([v]) => onTwistChange(v)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Decoupled</span>
                  <span>Maximal</span>
                </div>
              </div>

              {/* Decoherence Rate */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Decoherence Rate</span>
                  <span className="text-primary font-mono">{decoherenceRate.toFixed(3)}</span>
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
                  <span className="text-muted-foreground">Coupling Strength</span>
                  <span className="text-primary font-mono">{couplingStrength.toFixed(2)}</span>
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
                  <span className="text-muted-foreground">Phase Noise</span>
                  <span className="text-primary font-mono">{phaseNoise.toFixed(3)}</span>
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
            <div className="bg-card/50 rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
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
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-muted-foreground hover:bg-muted'
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
            <div className="bg-card/50 rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Configuration Presets
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {presets.map((preset, i) => (
                  <button
                    key={i}
                    onClick={() => onPresetSelect(i)}
                    className="w-full px-3 py-2 bg-card hover:bg-muted rounded-lg text-left transition-colors"
                  >
                    <div className="text-sm text-foreground">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      A:{preset.primeAlice} B:{preset.primeBob} γ:{preset.twistCoupling} ε:{preset.epsilon}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Presets */}
            <div className="bg-card/50 rounded-xl p-4 border border-border">
              <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Current Configuration
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={customPresetName}
                  onChange={(e) => setCustomPresetName(e.target.value)}
                  placeholder="Preset name..."
                  className="flex-1 px-3 py-2 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground"
                />
                <button
                  onClick={handleSavePreset}
                  disabled={!customPresetName.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full px-3 py-2 bg-card hover:bg-muted rounded-lg text-left transition-colors text-sm"
                    >
                      <div className="text-foreground">{preset.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current State Summary */}
            <div className="bg-primary/10 rounded-xl p-4 border border-primary/30">
              <h3 className="text-sm font-semibold text-primary mb-3">Current Configuration</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Alice Prime:</span>
                  <span className="text-green-400 ml-2 font-mono">{selectedPrimeAlice}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Bob Prime:</span>
                  <span className="text-blue-400 ml-2 font-mono">{selectedPrimeBob}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">ε:</span>
                  <span className="text-primary ml-2 font-mono">{epsilon.toFixed(3)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">γ:</span>
                  <span className="text-primary ml-2 font-mono">{twistCoupling.toFixed(3)}</span>
                </div>
              </div>
            </div>

            {/* Reset Button */}
            <button
              onClick={onReset}
              className="w-full px-4 py-3 bg-destructive/80 hover:bg-destructive text-destructive-foreground rounded-lg flex items-center justify-center gap-2 transition-colors"
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
