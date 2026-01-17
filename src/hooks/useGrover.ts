import { useState, useCallback, useMemo } from 'react';
import {
  GroverState,
  GroverConfig,
  DEFAULT_CONFIG,
  GeometricState,
  IterationResult,
  initializeState,
  performIteration,
  runToOptimal,
  applyOracle,
  applyDiffusion,
  getGeometricState,
  getIterationHistory,
  measureState,
  calculateOptimalIterations,
} from '@/lib/grover';

export interface UseGroverReturn {
  // State
  state: GroverState | null;
  config: GroverConfig;
  geometricState: GeometricState | null;
  iterationHistory: IterationResult[];
  measurementResult: { result: number; isMarked: boolean } | null;
  
  // Config setters
  setNumQubits: (n: number) => void;
  setMarkedStates: (states: number[]) => void;
  toggleMarkedState: (index: number) => void;
  
  // Actions
  initialize: () => void;
  stepOracle: () => void;
  stepDiffusion: () => void;
  stepFull: () => void;
  runToOptimalIterations: () => void;
  measure: () => void;
  reset: () => void;
  
  // Animation
  isAnimating: boolean;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  runAnimated: () => void;
  stopAnimation: () => void;
}

export function useGrover(): UseGroverReturn {
  const [config, setConfig] = useState<GroverConfig>(DEFAULT_CONFIG);
  const [state, setState] = useState<GroverState | null>(null);
  const [measurementResult, setMeasurementResult] = useState<{ result: number; isMarked: boolean } | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(500);
  const [animationRef, setAnimationRef] = useState<NodeJS.Timeout | null>(null);
  
  // Geometric interpretation
  const geometricState = useMemo(() => {
    if (!state) return null;
    return getGeometricState(state);
  }, [state]);
  
  // Full iteration history for visualization
  const iterationHistory = useMemo(() => {
    const numStates = Math.pow(2, config.numQubits);
    const M = config.markedStates.length;
    const optimal = calculateOptimalIterations(numStates, M);
    return getIterationHistory(config, Math.min(optimal + 3, 20));
  }, [config]);
  
  // Config setters
  const setNumQubits = useCallback((n: number) => {
    const clamped = Math.max(2, Math.min(8, n));
    setConfig(c => ({
      ...c,
      numQubits: clamped,
      markedStates: c.markedStates.filter(s => s < Math.pow(2, clamped)),
    }));
    setState(null);
    setMeasurementResult(null);
  }, []);
  
  const setMarkedStates = useCallback((states: number[]) => {
    setConfig(c => ({
      ...c,
      markedStates: states.filter(s => s >= 0 && s < Math.pow(2, c.numQubits)),
    }));
    setState(null);
    setMeasurementResult(null);
  }, []);
  
  const toggleMarkedState = useCallback((index: number) => {
    setConfig(c => {
      const exists = c.markedStates.includes(index);
      return {
        ...c,
        markedStates: exists
          ? c.markedStates.filter(s => s !== index)
          : [...c.markedStates, index].sort((a, b) => a - b),
      };
    });
    setState(null);
    setMeasurementResult(null);
  }, []);
  
  // Actions
  const initialize = useCallback(() => {
    setState(initializeState(config));
    setMeasurementResult(null);
  }, [config]);
  
  const stepOracle = useCallback(() => {
    if (!state) return;
    setState(applyOracle(state));
  }, [state]);
  
  const stepDiffusion = useCallback(() => {
    if (!state) return;
    setState(applyDiffusion(state));
  }, [state]);
  
  const stepFull = useCallback(() => {
    if (!state) return;
    setState(performIteration(state));
  }, [state]);
  
  const runToOptimalIterations = useCallback(() => {
    if (!state) return;
    setState(runToOptimal(state));
  }, [state]);
  
  const measure = useCallback(() => {
    if (!state) return;
    const result = measureState(state);
    setMeasurementResult(result);
    setState(s => s ? { ...s, phase: 'measured' } : null);
  }, [state]);
  
  const reset = useCallback(() => {
    setState(null);
    setMeasurementResult(null);
    if (animationRef) {
      clearInterval(animationRef);
      setAnimationRef(null);
    }
    setIsAnimating(false);
  }, [animationRef]);
  
  // Animation
  const stopAnimation = useCallback(() => {
    if (animationRef) {
      clearInterval(animationRef);
      setAnimationRef(null);
    }
    setIsAnimating(false);
  }, [animationRef]);
  
  const runAnimated = useCallback(() => {
    if (isAnimating) {
      stopAnimation();
      return;
    }
    
    let currentState = state ?? initializeState(config);
    setState(currentState);
    setIsAnimating(true);
    
    const interval = setInterval(() => {
      setState(prev => {
        if (!prev) return null;
        if (prev.iteration >= prev.optimalIterations) {
          clearInterval(interval);
          setIsAnimating(false);
          return prev;
        }
        return performIteration(prev);
      });
    }, animationSpeed);
    
    setAnimationRef(interval);
  }, [isAnimating, state, config, animationSpeed, stopAnimation]);
  
  return {
    state,
    config,
    geometricState,
    iterationHistory,
    measurementResult,
    
    setNumQubits,
    setMarkedStates,
    toggleMarkedState,
    
    initialize,
    stepOracle,
    stepDiffusion,
    stepFull,
    runToOptimalIterations,
    measure,
    reset,
    
    isAnimating,
    animationSpeed,
    setAnimationSpeed,
    runAnimated,
    stopAnimation,
  };
}
