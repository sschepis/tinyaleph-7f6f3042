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

// Party state for multi-party simulation
export interface PartyState {
  location: ObserverLocation;
  fingerprint: PulsarFingerprint | null;
  phaseLockWith: string[];
  transmissions: SRCTransmission[];
  color: string;
}

const PARTY_COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

export function usePulsarTransceiver() {
  // Core state
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [referencePulsar, setReferencePulsar] = useState<Pulsar>(getReferencePulsar());
  const [activePulsars, setActivePulsars] = useState<Pulsar[]>(getActivePulsars());
  const [referencePhase, setReferencePhase] = useState(0);
  
  // Multi-party state
  const [parties, setParties] = useState<PartyState[]>([
    {
      location: createEarthLocation('Earth Observer', 40.7128, -74.0060),
      fingerprint: null,
      phaseLockWith: [],
      transmissions: [],
      color: PARTY_COLORS[0]
    }
  ]);
  
  // Legacy single-location state (for backwards compatibility)
  const localLocation = parties[0]?.location || createEarthLocation();
  const remoteLocation = parties[1]?.location || null;
  
  // Semantic map
  const [semanticMap, setSemanticMap] = useState<SemanticMapping[]>(DEFAULT_SEMANTIC_MAP);
  
  // Phase lock (legacy - now computed from party relationships)
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
  
  // Computed fingerprints for all parties
  const partyFingerprints = useMemo(() => {
    return parties.map(party => 
      computeFingerprint(
        party.location,
        time,
        referencePulsar,
        referencePhase,
        activePulsars
      )
    );
  }, [parties, time, referencePulsar, referencePhase, activePulsars]);
  
  // All phases (for 3D visualization)
  const allPhases = useMemo(() => {
    const phases = new Map<string, number>();
    if (partyFingerprints[0]) {
      partyFingerprints[0].phases.forEach((phase, name) => {
        phases.set(name, phase);
      });
    }
    // Add reference phase
    phases.set(referencePulsar.name, referencePhase);
    return phases;
  }, [partyFingerprints, referencePulsar.name, referencePhase]);
  
  // Legacy fingerprints
  const localFingerprint = partyFingerprints[0] || null;
  const remoteFingerprint = partyFingerprints[1] || null;
  
  // Animation loop
  useEffect(() => {
    if (!isRunning) return;
    
    const tick = () => {
      setReferencePhase(prev => evolveReferencePhase(referencePulsar, prev, DT * simParams.timeScale));
      setTime(t => t + DT * simParams.timeScale);
      
      // Update phase locks between all parties
      setParties(prev => {
        const newParties = [...prev];
        
        for (let i = 0; i < newParties.length; i++) {
          const fp1 = partyFingerprints[i];
          if (!fp1) continue;
          
          const locks: string[] = [];
          for (let j = 0; j < newParties.length; j++) {
            if (i === j) continue;
            const fp2 = partyFingerprints[j];
            if (!fp2) continue;
            
            const comparison = compareFingerprints(fp1, fp2);
            if (comparison.similarity > 0.9) {
              locks.push(newParties[j].location.name);
            }
          }
          newParties[i] = { ...newParties[i], phaseLockWith: locks };
        }
        
        return newParties;
      });
      
      // Legacy phase lock for first two parties
      if (partyFingerprints[0] && partyFingerprints[1]) {
        const comparison = compareFingerprints(partyFingerprints[0], partyFingerprints[1]);
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
  }, [isRunning, referencePulsar, simParams.timeScale, partyFingerprints]);
  
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
    setParties(prev => prev.map(p => ({ ...p, transmissions: [], phaseLockWith: [] })));
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
  
  // Legacy transmit (for first party)
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
  
  // Multi-party transmit
  const multiPartyTransmit = useCallback((senderName: string, targetName: string, prime: number) => {
    const mapping = semanticMap.find(m => m.prime === prime);
    if (!mapping) return;
    
    const senderParty = parties.find(p => p.location.name === senderName);
    const targetParty = parties.find(p => p.location.name === targetName);
    if (!senderParty || !targetParty) return;
    
    const isLocked = senderParty.phaseLockWith.includes(targetName);
    
    const transmission: SRCTransmission = {
      id: `TX-${Date.now()}-${senderName}`,
      timestamp: time,
      sender: 'local',
      prime,
      meaning: mapping.meaning,
      phaseAtTransmit: referencePhase,
      eigenvalue: isLocked ? Math.sqrt(prime) : -Math.sqrt(prime),
      wasLocked: isLocked
    };
    
    // Add to sender's transmissions
    setParties(prev => prev.map(p => 
      p.location.name === senderName 
        ? { ...p, transmissions: [...p.transmissions, transmission] }
        : p
    ));
    
    // Also add to global history
    setTransmissionHistory(prev => [...prev, transmission]);
  }, [time, referencePhase, semanticMap, parties]);
  
  // Add party
  const addParty = useCallback((location: ObserverLocation) => {
    setParties(prev => {
      if (prev.some(p => p.location.name === location.name)) return prev;
      return [
        ...prev,
        {
          location,
          fingerprint: null,
          phaseLockWith: [],
          transmissions: [],
          color: PARTY_COLORS[prev.length % PARTY_COLORS.length]
        }
      ];
    });
  }, []);
  
  // Remove party
  const removeParty = useCallback((name: string) => {
    setParties(prev => prev.filter(p => p.location.name !== name));
  }, []);
  
  // Legacy location setters (update first party)
  const setLocalLocation = useCallback((location: ObserverLocation) => {
    setParties(prev => {
      const newParties = [...prev];
      if (newParties[0]) {
        newParties[0] = { ...newParties[0], location };
      }
      return newParties;
    });
  }, []);
  
  const setRemoteLocation = useCallback((location: ObserverLocation | null) => {
    if (!location) {
      setParties(prev => prev.slice(0, 1));
      return;
    }
    setParties(prev => {
      if (prev.length < 2) {
        return [...prev, {
          location,
          fingerprint: null,
          phaseLockWith: [],
          transmissions: [],
          color: PARTY_COLORS[1]
        }];
      }
      const newParties = [...prev];
      newParties[1] = { ...newParties[1], location };
      return newParties;
    });
  }, []);
  
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
  
  // All locations for 3D map
  const allLocations = useMemo(() => parties.map(p => p.location), [parties]);
  
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
    
    // Multi-party
    parties,
    addParty,
    removeParty,
    multiPartyTransmit,
    allLocations,
    allPhases,
    
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
