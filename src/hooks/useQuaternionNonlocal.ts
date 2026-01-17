import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  SplitPrime,
  EntangledPair,
  TransmissionEvent,
  NonlocalSystemState,
  QuaternionState,
  ProjectionResult
} from '@/lib/quaternion-nonlocal/types';
import {
  createSplitPrime,
  createEntangledPair,
  evolveEntangledPair,
  transmit,
  projectState,
  getPhaseData,
  AVAILABLE_SPLIT_PRIMES,
  PRESETS
} from '@/lib/quaternion-nonlocal/engine';

const TICK_RATE = 50; // ms
const DT = 0.05;

export function useQuaternionNonlocal() {
  // State
  const [selectedPrimeAlice, setSelectedPrimeAlice] = useState<number>(13);
  const [selectedPrimeBob, setSelectedPrimeBob] = useState<number>(37);
  const [twistCoupling, setTwistCoupling] = useState(0.5);
  const [epsilon, setEpsilon] = useState(0.1);
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [transmissionHistory, setTransmissionHistory] = useState<TransmissionEvent[]>([]);
  const [lastProjection, setLastProjection] = useState<ProjectionResult | null>(null);
  
  // Computed split primes
  const alicePrime = useMemo(() => 
    createSplitPrime(selectedPrimeAlice),
    [selectedPrimeAlice]
  );
  
  const bobPrime = useMemo(() =>
    createSplitPrime(selectedPrimeBob),
    [selectedPrimeBob]
  );
  
  // Entangled pair state
  const [entangledPair, setEntangledPair] = useState<EntangledPair | null>(null);
  
  // Initialize entangled pair when primes change
  useEffect(() => {
    if (alicePrime && bobPrime) {
      setEntangledPair(createEntangledPair(alicePrime, bobPrime, twistCoupling));
      setTime(0);
      setTransmissionHistory([]);
      setLastProjection(null);
    }
  }, [alicePrime, bobPrime, twistCoupling]);
  
  // Animation loop
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!isRunning || !entangledPair) return;
    
    const tick = () => {
      setEntangledPair(prev => {
        if (!prev) return prev;
        return evolveEntangledPair(prev, DT, epsilon);
      });
      setTime(t => t + DT);
      animationRef.current = window.setTimeout(tick, TICK_RATE);
    };
    
    tick();
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isRunning, epsilon]);
  
  // Phase data
  const phaseData = useMemo(() => {
    if (!entangledPair) return null;
    return getPhaseData(entangledPair);
  }, [entangledPair]);
  
  // Synchronization events
  const [syncEvents, setSyncEvents] = useState<number[]>([]);
  
  useEffect(() => {
    if (entangledPair?.isSynchronized) {
      setSyncEvents(prev => [...prev.slice(-19), time]);
    }
  }, [entangledPair?.isSynchronized, time]);
  
  // Actions
  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setTransmissionHistory([]);
    setSyncEvents([]);
    setLastProjection(null);
    if (alicePrime && bobPrime) {
      setEntangledPair(createEntangledPair(alicePrime, bobPrime, twistCoupling));
    }
  }, [alicePrime, bobPrime, twistCoupling]);
  
  const sendTransmission = useCallback((sender: 'alice' | 'bob') => {
    if (!entangledPair) return;
    
    const event = transmit(sender, entangledPair, time);
    setTransmissionHistory(prev => [...prev, event]);
  }, [entangledPair, time]);
  
  const measureProjection = useCallback((who: 'alice' | 'bob') => {
    if (!entangledPair) return;
    
    const prime = who === 'alice' ? entangledPair.alice : entangledPair.bob;
    const state: QuaternionState = {
      quaternion: prime.quaternion,
      phase: 0,
      amplitude: 1,
      blochVector: prime.blochVector
    };
    
    const result = projectState(prime, state);
    setLastProjection(result);
    return result;
  }, [entangledPair]);
  
  const applyPreset = useCallback((presetIndex: number) => {
    const preset = PRESETS[presetIndex];
    if (!preset) return;
    
    setSelectedPrimeAlice(preset.primeAlice);
    setSelectedPrimeBob(preset.primeBob);
    setTwistCoupling(preset.twistCoupling);
    setEpsilon(preset.epsilon);
    setIsRunning(false);
    setTime(0);
    setTransmissionHistory([]);
    setSyncEvents([]);
  }, []);
  
  const updateTwistCoupling = useCallback((value: number) => {
    setTwistCoupling(value);
    if (entangledPair) {
      setEntangledPair(prev => prev ? { ...prev, twistCoupling: value } : null);
    }
  }, [entangledPair]);
  
  return {
    // State
    selectedPrimeAlice,
    selectedPrimeBob,
    setSelectedPrimeAlice,
    setSelectedPrimeBob,
    twistCoupling,
    setTwistCoupling: updateTwistCoupling,
    epsilon,
    setEpsilon,
    isRunning,
    time,
    entangledPair,
    phaseData,
    transmissionHistory,
    syncEvents,
    lastProjection,
    
    // Computed
    alicePrime,
    bobPrime,
    
    // Actions
    start,
    pause,
    reset,
    sendTransmission,
    measureProjection,
    applyPreset,
    
    // Constants
    AVAILABLE_SPLIT_PRIMES,
    PRESETS
  };
}
