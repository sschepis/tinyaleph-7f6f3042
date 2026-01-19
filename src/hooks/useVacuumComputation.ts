import { useState, useCallback, useEffect, useRef } from 'react';
import {
  VacuumComputationState,
  FluctuationField,
  VacuumCircuit,
  EntropyGate,
  ComputationResult,
  ThermodynamicMetrics,
  ComputationStep,
  CircuitPreset
} from '@/lib/vacuum-computation/types';
import {
  createFluctuationField,
  evolveField,
  createEntropyGate,
  simulateCircuit,
  calculateMetrics,
  CIRCUIT_PRESETS,
  buildFromPreset,
  landauerLimit
} from '@/lib/vacuum-computation/engine';

const TICK_RATE = 50; // ms
const DT = 1;

export function useVacuumComputation() {
  // State
  const [field, setField] = useState<FluctuationField>(() => createFluctuationField(100));
  const [circuit, setCircuit] = useState<VacuumCircuit | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [mode, setMode] = useState<'design' | 'simulate' | 'analyze'>('design');
  const [inputs, setInputs] = useState<boolean[]>([false, false]);
  const [result, setResult] = useState<ComputationResult | null>(null);
  const [metrics, setMetrics] = useState<ThermodynamicMetrics | null>(null);
  const [history, setHistory] = useState<ComputationStep[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<number>(0);
  const [temperature, setTemperature] = useState(300); // Kelvin
  
  const animationRef = useRef<number | null>(null);
  
  // Animation loop for field evolution
  useEffect(() => {
    if (!isRunning) return;
    
    const tick = () => {
      setField(prev => evolveField(prev, DT));
      setTime(t => t + DT);
      animationRef.current = window.setTimeout(tick, TICK_RATE);
    };
    
    tick();
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isRunning]);
  
  // Load preset circuit
  const loadPreset = useCallback((index: number) => {
    const preset = CIRCUIT_PRESETS[index];
    if (!preset) return;
    
    setSelectedPreset(index);
    
    // Set default inputs based on preset
    const defaultInputs = new Array(preset.inputLabels.length).fill(false);
    setInputs(defaultInputs);
    
    const newCircuit = buildFromPreset(preset, defaultInputs);
    setCircuit(newCircuit);
    setResult(null);
    setMetrics(null);
    setHistory([]);
  }, []);
  
  // Toggle input
  const toggleInput = useCallback((index: number) => {
    setInputs(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  }, []);
  
  // Run simulation
  const runSimulation = useCallback(() => {
    if (!circuit) return;
    
    setMode('simulate');
    
    // Build circuit with current inputs
    const preset = CIRCUIT_PRESETS[selectedPreset];
    const updatedCircuit = buildFromPreset(preset, inputs);
    
    const simResult = simulateCircuit(updatedCircuit, inputs);
    setResult(simResult);
    setHistory(simResult.steps);
    
    const thermMetrics = calculateMetrics(simResult, temperature);
    setMetrics(thermMetrics);
    
    // Update circuit with results
    setCircuit({
      ...updatedCircuit,
      outputs: simResult.output,
      totalEntropy: simResult.totalEntropy,
      totalEnergy: simResult.totalEnergy
    });
  }, [circuit, inputs, selectedPreset, temperature]);
  
  // Reset simulation
  const reset = useCallback(() => {
    setResult(null);
    setMetrics(null);
    setHistory([]);
    setMode('design');
    
    if (circuit) {
      const preset = CIRCUIT_PRESETS[selectedPreset];
      setCircuit(buildFromPreset(preset, inputs));
    }
  }, [circuit, selectedPreset, inputs]);
  
  // Start/stop field animation
  const toggleRunning = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  // Get Landauer limit
  const getLandauerLimit = useCallback(() => {
    return landauerLimit(temperature);
  }, [temperature]);
  
  // Calculate efficiency
  const efficiency = result ? result.landauerEfficiency : null;
  
  return {
    // State
    field,
    circuit,
    isRunning,
    time,
    mode,
    inputs,
    result,
    metrics,
    history,
    selectedPreset,
    temperature,
    efficiency,
    
    // Actions
    setMode,
    loadPreset,
    toggleInput,
    runSimulation,
    reset,
    toggleRunning,
    setTemperature,
    setInputs,
    getLandauerLimit,
    
    // Constants
    presets: CIRCUIT_PRESETS
  };
}
