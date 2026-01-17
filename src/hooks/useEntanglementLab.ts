import { useState, useCallback, useMemo } from 'react';
import {
  BellState,
  MeasurementResult,
  MeasurementStats,
  CHSHResult,
  CorrelationPoint,
  BELL_STATE_INFO,
  createBellState,
  measureEntangledPair,
  runMeasurementSeries,
  theoreticalCorrelation,
  generateCorrelationCurve,
  calculateTheoreticalCHSH,
  runCHSHExperiment,
  OPTIMAL_ANGLES,
  CLASSICAL_BOUND,
  QUANTUM_BOUND
} from '@/lib/entanglement-lab';

export function useEntanglementLab() {
  // State
  const [bellState, setBellState] = useState<BellState>('Φ+');
  const [aliceAngle, setAliceAngle] = useState(0);
  const [bobAngle, setBobAngle] = useState(Math.PI / 4);
  const [measurementHistory, setMeasurementHistory] = useState<MeasurementResult[]>([]);
  const [seed, setSeed] = useState(42);
  const [shotsPerRun, setShotsPerRun] = useState(100);
  
  // CHSH angles
  const [chshAngles, setChshAngles] = useState(OPTIMAL_ANGLES);
  
  // Current Bell state info
  const stateInfo = useMemo(() => BELL_STATE_INFO[bellState], [bellState]);
  
  // Theoretical correlation at current angles
  const theoreticalCorr = useMemo(() => 
    theoreticalCorrelation(bellState, aliceAngle, bobAngle),
    [bellState, aliceAngle, bobAngle]
  );
  
  // Correlation curve (Bob's angle varies, Alice fixed)
  const correlationCurve = useMemo(() => 
    generateCorrelationCurve(bellState, aliceAngle, 72),
    [bellState, aliceAngle]
  );
  
  // Measurement statistics from history
  const measurementStats = useMemo((): MeasurementStats => {
    if (measurementHistory.length === 0) {
      return {
        total: 0,
        outcomes: { '00': 0, '01': 0, '10': 0, '11': 0 },
        correlation: 0
      };
    }
    
    const outcomes = { '00': 0, '01': 0, '10': 0, '11': 0 };
    let correlationSum = 0;
    
    for (const result of measurementHistory) {
      const key = `${result.alice}${result.bob}` as keyof typeof outcomes;
      outcomes[key]++;
      correlationSum += result.correlation;
    }
    
    return {
      total: measurementHistory.length,
      outcomes,
      correlation: correlationSum / measurementHistory.length
    };
  }, [measurementHistory]);
  
  // Theoretical CHSH result
  const theoreticalCHSH = useMemo(() => 
    calculateTheoreticalCHSH(bellState, chshAngles),
    [bellState, chshAngles]
  );
  
  // Actions
  const runSingleMeasurement = useCallback(() => {
    const newSeed = seed + measurementHistory.length;
    const result = measureEntangledPair(bellState, aliceAngle, bobAngle, newSeed);
    setMeasurementHistory(prev => [...prev, result]);
    return result;
  }, [bellState, aliceAngle, bobAngle, seed, measurementHistory.length]);
  
  const runManyMeasurements = useCallback((count: number = shotsPerRun) => {
    const baseSeed = seed + measurementHistory.length;
    const newResults: MeasurementResult[] = [];
    
    for (let i = 0; i < count; i++) {
      const result = measureEntangledPair(bellState, aliceAngle, bobAngle, baseSeed + i);
      newResults.push(result);
    }
    
    setMeasurementHistory(prev => [...prev, ...newResults]);
    return newResults;
  }, [bellState, aliceAngle, bobAngle, seed, shotsPerRun, measurementHistory.length]);
  
  const runCHSHTest = useCallback((): CHSHResult => {
    const baseSeed = seed + measurementHistory.length;
    return runCHSHExperiment(bellState, chshAngles, shotsPerRun, baseSeed);
  }, [bellState, chshAngles, shotsPerRun, seed, measurementHistory.length]);
  
  const clearHistory = useCallback(() => {
    setMeasurementHistory([]);
  }, []);
  
  const resetSeed = useCallback(() => {
    setSeed(Math.floor(Math.random() * 10000));
    setMeasurementHistory([]);
  }, []);
  
  const useOptimalAngles = useCallback(() => {
    setChshAngles(OPTIMAL_ANGLES);
  }, []);
  
  const setChshAngle = useCallback((
    which: 'a' | 'a_prime' | 'b' | 'b_prime',
    value: number
  ) => {
    setChshAngles(prev => ({ ...prev, [which]: value }));
  }, []);
  
  return {
    // State
    bellState,
    setBellState,
    aliceAngle,
    setAliceAngle,
    bobAngle,
    setBobAngle,
    measurementHistory,
    seed,
    setSeed,
    shotsPerRun,
    setShotsPerRun,
    
    // CHSH
    chshAngles,
    setChshAngles,
    setChshAngle,
    
    // Computed
    stateInfo,
    theoreticalCorr,
    correlationCurve,
    measurementStats,
    theoreticalCHSH,
    
    // Actions
    runSingleMeasurement,
    runManyMeasurements,
    runCHSHTest,
    clearHistory,
    resetSeed,
    useOptimalAngles,
    
    // Constants
    CLASSICAL_BOUND,
    QUANTUM_BOUND,
    OPTIMAL_ANGLES,
    BELL_STATE_INFO
  };
}
