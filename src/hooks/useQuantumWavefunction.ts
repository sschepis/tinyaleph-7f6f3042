import { useState, useCallback, useMemo } from 'react';
import {
  WaveformParams,
  SpectrumAnalysis,
  DEFAULT_PARAMS,
  RIEMANN_ZEROS,
  analyzeSpectrum,
  getWaveAtPrimes
} from '@/lib/quantum-wavefunction';

export function useQuantumWavefunction() {
  const [params, setParams] = useState<WaveformParams>(DEFAULT_PARAMS);
  const [xRange, setXRange] = useState<[number, number]>([2, 100]);
  const [resolution, setResolution] = useState(500);

  // Analyze spectrum with current parameters
  const spectrum = useMemo(() => {
    return analyzeSpectrum(xRange[0], xRange[1], resolution, params);
  }, [params, xRange, resolution]);

  // Wave values at prime locations
  const primeWaves = useMemo(() => {
    return getWaveAtPrimes(params, xRange[1]);
  }, [params, xRange]);

  // Update individual parameters
  const setT = useCallback((t: number) => {
    setParams(p => ({ ...p, t }));
  }, []);

  const setV0 = useCallback((V0: number) => {
    setParams(p => ({ ...p, V0 }));
  }, []);

  const setEpsilon = useCallback((epsilon: number) => {
    setParams(p => ({ ...p, epsilon }));
  }, []);

  const setBeta = useCallback((beta: number) => {
    setParams(p => ({ ...p, beta }));
  }, []);

  const setResonanceWidth = useCallback((resonanceWidth: number) => {
    setParams(p => ({ ...p, resonanceWidth }));
  }, []);

  // Preset configurations
  const useOptimalParams = useCallback(() => {
    setParams(DEFAULT_PARAMS);
  }, []);

  const useRiemannZero = useCallback((index: number) => {
    if (index >= 0 && index < RIEMANN_ZEROS.length) {
      setParams(p => ({ ...p, t: RIEMANN_ZEROS[index] }));
    }
  }, []);

  // Reset to defaults
  const reset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setXRange([2, 100]);
    setResolution(500);
  }, []);

  return {
    params,
    setParams,
    spectrum,
    primeWaves,
    xRange,
    setXRange,
    resolution,
    setResolution,
    
    // Individual setters
    setT,
    setV0,
    setEpsilon,
    setBeta,
    setResonanceWidth,
    
    // Presets
    useOptimalParams,
    useRiemannZero,
    reset,
    
    // Constants
    RIEMANN_ZEROS
  };
}
