import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  Pulsar,
  ObserverLocation,
  PulsarFingerprint,
  SETICandidate,
  SRCTransmission,
  PhaseLockStatus,
  SemanticMapping,
  SpectrumAnalysis,
  SimulationParams
} from '@/lib/pulsar-transceiver/types';
import {
  PULSAR_CATALOG,
  DEFAULT_SEMANTIC_MAP,
  getReferencePulsar,
  getActivePulsars
} from '@/lib/pulsar-transceiver/pulsar-catalog';
import {
  computeFingerprint,
  evolveReferencePhase,
  createEarthLocation,
  createGalacticLocation,
  compareFingerprints
} from '@/lib/pulsar-transceiver/fingerprint-engine';
import {
  generateTestDataset,
  scanForCandidates,
  analyzeSpectrum
} from '@/lib/pulsar-transceiver/seti-analyzer';

const TICK_RATE = 50;
const DT = 0.001;

export function usePulsarTransceiver() {
  // Core state
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [referencePulsar, setReferencePulsar] = useState<Pulsar>(getReferencePulsar());
  const [activePulsars, setActivePulsars] = useState<Pulsar[]>(getActivePulsars());
  const [referencePhase, setReferencePhase] = useState(0);
  
  // Locations
  const [localLocation, setLocalLocation] = useState<ObserverLocation>(
    createEarthLocation('Earth Observer', 40.7128, -74.0060)
  );
  const [remoteLocation, setRemoteLocation] = useState<ObserverLocation | null>(
    createGalacticLocation('Alpha Centauri', 0, 8.5 + 0.00133, 0)
  );
  
  // Semantic map
  const [semanticMap, setSemanticMap] = useState<SemanticMapping[]>(DEFAULT_SEMANTIC_MAP);
  
  // Phase lock
  const [phaseLock, setPhaseLock] = useState<PhaseLockStatus>({
    isLocked: false,
    phaseDifference: Math.PI,
    lockStrength: 0,
    timeSinceLock: 0,
    lockHistory: []
  });
  
  // Communication
  const [transmissionHistory, setTransmissionHistory] = useState<SRCTransmission[]>([]);
  
  // SETI mode
  const [setiMode, setSetiMode] = useState(false);
  const [setiCandidates, setSetiCandidates] = useState<SETICandidate[]>([]);
  const [spectrum, setSpectrum] = useState<SpectrumAnalysis | null>(null);
  
  // Simulation params
  const [simParams, setSimParams] = useState<SimulationParams>({
    timeScale: 1,
    noiseLevel: 1e-7,
    setiInjection: false,
    alienSignalStrength: 1e-6,
    alienPrimes: [13, 37, 61]
  });
  
  // Animation
  const animationRef = useRef<number | null>(null);
  
  // Computed fingerprints
  const localFingerprint = useMemo(() => {
    return computeFingerprint(
      localLocation,
      time,
      referencePulsar,
      referencePhase,
      activePulsars
    );
  }, [localLocation, time, referencePulsar, referencePhase, activePulsars]);
  
  const remoteFingerprint = useMemo(() => {
    if (!remoteLocation) return null;
    return computeFingerprint(
      remoteLocation,
      time,
      referencePulsar,
      referencePhase,
      activePulsars
    );
  }, [remoteLocation, time, referencePulsar, referencePhase, activePulsars]);
  
  // Animation loop
  useEffect(() => {
    if (!isRunning) return;
    
    const tick = () => {
      setReferencePhase(prev => evolveReferencePhase(referencePulsar, prev, DT * simParams.timeScale));
      setTime(t => t + DT * simParams.timeScale);
      
      // Update phase lock
      if (remoteFingerprint && localFingerprint) {
        const comparison = compareFingerprints(localFingerprint, remoteFingerprint);
        const phaseDiff = 1 - comparison.similarity;
        const isLocked = phaseDiff < 0.1;
        
        setPhaseLock(prev => ({
          isLocked,
          phaseDifference: phaseDiff * Math.PI,
          lockStrength: comparison.similarity,
          timeSinceLock: isLocked ? prev.timeSinceLock + DT : 0,
          lockHistory: [...prev.lockHistory.slice(-99), phaseDiff]
        }));
      }
      
      animationRef.current = window.setTimeout(tick, TICK_RATE);
    };
    
    tick();
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, [isRunning, referencePulsar, simParams.timeScale]);
  
  // Actions
  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
    setReferencePhase(0);
    setTransmissionHistory([]);
    setSetiCandidates([]);
    setPhaseLock({
      isLocked: false,
      phaseDifference: Math.PI,
      lockStrength: 0,
      timeSinceLock: 0,
      lockHistory: []
    });
  }, []);
  
  const togglePulsar = useCallback((name: string) => {
    setActivePulsars(prev => {
      const pulsar = PULSAR_CATALOG.find(p => p.name === name);
      if (!pulsar) return prev;
      
      const isActive = prev.some(p => p.name === name);
      if (isActive) {
        return prev.filter(p => p.name !== name);
      } else {
        return [...prev, { ...pulsar, isActive: true }];
      }
    });
  }, []);
  
  const transmit = useCallback((prime: number) => {
    const mapping = semanticMap.find(m => m.prime === prime);
    if (!mapping) return;
    
    const transmission: SRCTransmission = {
      id: `TX-${Date.now()}`,
      timestamp: time,
      sender: 'local',
      prime,
      meaning: mapping.meaning,
      phaseAtTransmit: referencePhase,
      eigenvalue: phaseLock.isLocked ? Math.sqrt(prime) : -Math.sqrt(prime),
      wasLocked: phaseLock.isLocked
    };
    
    setTransmissionHistory(prev => [...prev, transmission]);
  }, [time, referencePhase, phaseLock.isLocked, semanticMap]);
  
  const runSETIScan = useCallback(() => {
    const dataset = generateTestDataset(
      100,
      10,
      simParams.noiseLevel,
      simParams.setiInjection ? {
        primes: simParams.alienPrimes,
        amplitude: simParams.alienSignalStrength
      } : undefined
    );
    
    const candidates = scanForCandidates(dataset, 10, 0.3);
    setSetiCandidates(candidates);
    
    // Analyze first pulsar spectrum
    const firstResiduals = Array.from(dataset.values())[0];
    if (firstResiduals) {
      const spec = analyzeSpectrum(firstResiduals, 10, simParams.noiseLevel);
      setSpectrum(spec);
    }
  }, [simParams]);
  
  return {
    // State
    isRunning,
    time,
    referencePulsar,
    setReferencePulsar,
    activePulsars,
    referencePhase,
    localLocation,
    setLocalLocation,
    remoteLocation,
    setRemoteLocation,
    semanticMap,
    phaseLock,
    transmissionHistory,
    setiMode,
    setSetiMode,
    setiCandidates,
    spectrum,
    simParams,
    setSimParams,
    
    // Computed
    localFingerprint,
    remoteFingerprint,
    allPulsars: PULSAR_CATALOG,
    
    // Actions
    start,
    pause,
    reset,
    togglePulsar,
    transmit,
    runSETIScan
  };
}
