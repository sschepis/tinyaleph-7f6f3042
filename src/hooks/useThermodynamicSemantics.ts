/**
 * useThermodynamicSemantics Hook
 * Manages thermodynamic semantics simulation state
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ComputationProcess,
  EnergyLandscape,
  LandauerMetrics,
  DemonMetrics,
  MeaningEmergence,
  ThermodynamicTimeSeries,
  SystemConfig,
  ThermodynamicSemanticState
} from '@/lib/thermodynamic-semantics/types';
import {
  generateLandscape,
  calculateLandauer,
  analyzeMaxwellDemon,
  calculateEmergence,
  evolveTimeSeries,
  defaultConfig,
  emptyTimeSeries,
  initializeFromPreset,
  THERMODYNAMIC_PRESETS
} from '@/lib/thermodynamic-semantics/engine';

export function useThermodynamicSemantics() {
  // State
  const [processes, setProcesses] = useState<ComputationProcess[]>([]);
  const [landscape, setLandscape] = useState<EnergyLandscape>(() => generateLandscape());
  const [landauer, setLandauer] = useState<LandauerMetrics>(() => 
    calculateLandauer(1, 1e-20, 300)
  );
  const [demon, setDemon] = useState<DemonMetrics>(() => 
    analyzeMaxwellDemon(1, 0, 300)
  );
  const [emergence, setEmergence] = useState<MeaningEmergence>(() => 
    calculateEmergence(5, 2, 0.5)
  );
  const [timeSeries, setTimeSeries] = useState<ThermodynamicTimeSeries>(() => 
    emptyTimeSeries()
  );
  const [config, setConfig] = useState<SystemConfig>(() => defaultConfig());
  const [activeProcess, setActiveProcess] = useState<string | null>(null);
  const [mode, setMode] = useState<ThermodynamicSemanticState['mode']>('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedPreset, setSelectedPreset] = useState(0);

  // Animation ref
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Load preset
  const loadPreset = useCallback((index: number) => {
    if (index < 0 || index >= THERMODYNAMIC_PRESETS.length) return;
    
    const preset = THERMODYNAMIC_PRESETS[index];
    const { processes: newProcesses, config: newConfig } = initializeFromPreset(preset);
    
    setSelectedPreset(index);
    setProcesses(newProcesses);
    setConfig(newConfig);
    setTimeSeries(emptyTimeSeries());
    setTime(0);
    setActiveProcess(null);
    
    // Update derived metrics
    const totalBitsErased = newProcesses.reduce((sum, p) => sum + p.entropyOut, 0);
    const totalEnergy = newProcesses.reduce((sum, p) => sum + p.energyCost, 0);
    setLandauer(calculateLandauer(totalBitsErased, totalEnergy * 1e-21, newConfig.temperature));
    
    // Update emergence
    const avgEntropy = newProcesses.reduce((sum, p) => sum + p.entropyIn, 0) / newProcesses.length;
    const avgMeaning = newProcesses.reduce((sum, p) => sum + p.meaningGain, 0);
    setEmergence(calculateEmergence(avgEntropy, avgEntropy * 0.5, newConfig.couplingStrength));
  }, []);

  // Initial load
  useEffect(() => {
    loadPreset(0);
  }, [loadPreset]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      const dt = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 1000 : 0.016;
      lastTimeRef.current = timestamp;

      setTime(t => t + dt);
      setTimeSeries(series => evolveTimeSeries(series, config, dt * 100));

      // Update demon metrics based on time
      const infoGained = 1 + 0.5 * Math.sin(time * 0.5);
      const workExtracted = infoGained * 0.6; // Never violates 2nd law
      setDemon(analyzeMaxwellDemon(infoGained, workExtracted, config.temperature));

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, config, time]);

  // Toggle running
  const toggleRunning = useCallback(() => {
    setIsRunning(r => !r);
    lastTimeRef.current = 0;
  }, []);

  // Reset
  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setTimeSeries(emptyTimeSeries());
    setActiveProcess(null);
    loadPreset(selectedPreset);
  }, [selectedPreset, loadPreset]);

  // Update configuration
  const updateConfig = useCallback((updates: Partial<SystemConfig>) => {
    setConfig(c => {
      const newConfig = { ...c, ...updates };
      // Recalculate Landauer with new temperature
      const totalBitsErased = processes.reduce((sum, p) => sum + p.entropyOut, 0);
      const totalEnergy = processes.reduce((sum, p) => sum + p.energyCost, 0);
      setLandauer(calculateLandauer(totalBitsErased, totalEnergy * 1e-21, newConfig.temperature));
      return newConfig;
    });
  }, [processes]);

  // Select process
  const selectProcess = useCallback((processId: string | null) => {
    setActiveProcess(processId);
    if (processId) {
      setMode('process');
    }
  }, []);

  // Get entropy-meaning data for chart
  const getEntropyMeaningData = useCallback(() => {
    return timeSeries.timestamps.map((t, i) => ({
      time: t,
      entropy: timeSeries.entropy[i] || 0,
      meaning: timeSeries.meaning[i] || 0,
      efficiency: timeSeries.efficiency[i] || 0,
      freeEnergy: timeSeries.freeEnergy[i] || 0
    }));
  }, [timeSeries]);

  // Get process comparison data
  const getProcessComparisonData = useCallback(() => {
    return processes.map(p => ({
      name: p.name,
      entropyReduction: p.entropyIn - p.entropyOut,
      meaningGain: p.meaningGain,
      efficiency: p.efficiency * 100,
      energyCost: p.energyCost
    }));
  }, [processes]);

  return {
    // State
    processes,
    landscape,
    landauer,
    demon,
    emergence,
    timeSeries,
    config,
    activeProcess,
    mode,
    isRunning,
    time,
    selectedPreset,
    presets: THERMODYNAMIC_PRESETS,

    // Actions
    loadPreset,
    toggleRunning,
    reset,
    updateConfig,
    selectProcess,
    setMode,

    // Computed
    getEntropyMeaningData,
    getProcessComparisonData
  };
}
