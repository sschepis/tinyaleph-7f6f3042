import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Oscillator,
  SMFState,
  Moment,
  Goal,
  AttentionFocus,
  SafetyStats,
  firstNPrimes
} from '@/components/sentient-observer/types';

export type InitMode = 'random' | 'clustered' | 'aligned';

interface UseSentientObserverReturn {
  // State
  isRunning: boolean;
  tickCount: number;
  coherence: number;
  entropy: number;
  temperature: number;
  coupling: number;
  thermalEnabled: boolean;
  oscillators: Oscillator[];
  smfState: SMFState;
  moments: Moment[];
  subjectiveTime: number;
  goals: Goal[];
  attentionFoci: AttentionFocus[];
  safetyStats: SafetyStats;
  holoIntensity: number[][];
  userInput: string;
  inputHistory: string[];
  initMode: InitMode;
  peakCoherence: number;
  
  // Actions
  setIsRunning: (running: boolean) => void;
  setCoupling: (coupling: number) => void;
  setTemperature: (temp: number) => void;
  setThermalEnabled: (enabled: boolean) => void;
  setUserInput: (input: string) => void;
  handleInput: () => void;
  handleReset: () => void;
  setInitMode: (mode: InitMode) => void;
  boostCoherence: () => void;
  exciteByPrimes: (primes: number[], amplitudes: number[]) => void;
}

// Initialize oscillators with clustered phases for easier synchronization
const NUM_OSCILLATORS = 128;

const createInitialOscillators = (mode: 'random' | 'clustered' | 'aligned' = 'clustered'): Oscillator[] => {
  const primes = firstNPrimes(NUM_OSCILLATORS);
  
  // Base phase - oscillators will cluster around this
  const basePhase = Math.random() * 2 * Math.PI;
  
  return primes.map((p, i) => {
    let phase: number;
    
    switch (mode) {
      case 'aligned':
        // Nearly synchronized start
        phase = basePhase + (Math.random() - 0.5) * 0.3;
        break;
      case 'clustered':
        // Four clusters for interesting dynamics with 128 oscillators
        const clusterIdx = i % 4;
        const clusterPhase = clusterIdx * (Math.PI / 2);
        phase = basePhase + clusterPhase + (Math.random() - 0.5) * 0.4;
        break;
      case 'random':
      default:
        phase = Math.random() * 2 * Math.PI;
    }
    
    // Amplitude tiers: first 32 are strongest, then decay
    let amplitude: number;
    if (i < 32) {
      amplitude = 0.5 + Math.random() * 0.3;
    } else if (i < 64) {
      amplitude = 0.3 + Math.random() * 0.2;
    } else if (i < 96) {
      amplitude = 0.15 + Math.random() * 0.15;
    } else {
      amplitude = 0.08 + Math.random() * 0.1;
    }
    
    return {
      prime: p,
      phase: ((phase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
      amplitude,
      frequency: 1 + Math.log(p) / 20 // Even slower for 128 oscillators
    };
  });
};

const createInitialHoloField = (): number[][] => {
  const size = 16;
  return Array(size)
    .fill(0)
    .map(() =>
      Array(size)
        .fill(0)
        .map(() => Math.random() * 0.3)
    );
};

export const useSentientObserver = (): UseSentientObserverReturn => {
  // Core simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [tickCount, setTickCount] = useState(0);
  const [coherence, setCoherence] = useState(0.5);
  const [entropy, setEntropy] = useState(0.5);
  const [temperature, setTemperature] = useState(0.5); // Lower default for less noise
  const [coupling, setCoupling] = useState(0.6); // Higher coupling for faster sync
  const [thermalEnabled, setThermalEnabled] = useState(false); // Start without noise

  // Oscillator state
  const [oscillators, setOscillators] = useState<Oscillator[]>(createInitialOscillators);

  // SMF state
  const [smfState, setSmfState] = useState<SMFState>(() => ({
    s: new Float64Array([1, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0.2])
  }));

  // Temporal layer
  const [moments, setMoments] = useState<Moment[]>([]);
  const [subjectiveTime, setSubjectiveTime] = useState(0);

  // Agency
  const [goals, setGoals] = useState<Goal[]>([
    { id: 'g1', description: 'Maintain coherence above 0.5', status: 'active', priority: 0.8, progress: 0.6 },
    { id: 'g2', description: 'Explore semantic space', status: 'active', priority: 0.5, progress: 0.3 }
  ]);
  const [attentionFoci, setAttentionFoci] = useState<AttentionFocus[]>([]);

  // Safety
  const [safetyStats, setSafetyStats] = useState<SafetyStats>({
    alertLevel: 'normal',
    isSafe: true,
    totalViolations: 0,
    constraintCount: 7
  });

  // Holographic field
  const [holoIntensity, setHoloIntensity] = useState<number[][]>(createInitialHoloField);

  // Input
  const [userInput, setUserInput] = useState('');
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  
  // Mode and tracking
  const [initMode, setInitMode] = useState<InitMode>('clustered');
  const [peakCoherence, setPeakCoherence] = useState(0.5);

  // Animation frame ref
  const animationRef = useRef<number>(0);
  const lastTickRef = useRef<number>(Date.now());

  // Kuramoto-style oscillator update with thermal dynamics
  const updateOscillators = useCallback(() => {
    const dt = 0.016; // ~60fps
    const K = coupling;
    const T = temperature;
    const N = oscillators.length;

    // Compute order parameter (coherence)
    let realSum = 0,
      imagSum = 0;
    for (const osc of oscillators) {
      realSum += Math.cos(osc.phase);
      imagSum += Math.sin(osc.phase);
    }
    const orderParam = Math.sqrt((realSum / N) ** 2 + (imagSum / N) ** 2);

    setOscillators(prev => {
      const newOscs = prev.map((osc, i) => {
        // Compute coupling from other oscillators
        let couplingSum = 0;
        for (let j = 0; j < prev.length; j++) {
          if (i !== j) {
            couplingSum += Math.sin(prev[j].phase - osc.phase);
          }
        }

        // Effective coupling (temperature-dependent if thermal)
        const Keff = thermalEnabled ? K / Math.max(0.1, T) : K;

        // Phase update
        let newPhase = osc.phase + 2 * Math.PI * osc.frequency * dt;
        newPhase += (Keff / N) * couplingSum * dt;

        // Add thermal noise if enabled
        if (thermalEnabled) {
          const noise = (Math.random() - 0.5) * 2 * Math.sqrt(dt * T) * 0.1;
          newPhase += noise;
        }

        // Normalize phase
        newPhase = ((newPhase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

        // Slower amplitude damping to keep oscillators visible
        const newAmplitude = osc.amplitude * (1 - 0.005 * dt);

        return {
          ...osc,
          phase: newPhase,
          amplitude: Math.max(0.05, newAmplitude)
        };
      });

      return newOscs;
    });

    // Update coherence and track peak
    setCoherence(orderParam);
    setPeakCoherence(prev => Math.max(prev, orderParam));

    // Update entropy
    const amplitudeTotal = oscillators.reduce((s, o) => s + o.amplitude, 0);
    if (amplitudeTotal > 0.01) {
      let H = 0;
      for (const osc of oscillators) {
        const p = osc.amplitude / amplitudeTotal;
        if (p > 0.001) {
          H -= p * Math.log2(p);
        }
      }
      setEntropy(H / Math.log2(oscillators.length));
    }

    // Update SMF based on oscillator state
    setSmfState(prev => {
      const newS = new Float64Array(16);

      // Map oscillator phases to SMF axes
      newS[0] = orderParam; // coherence axis
      newS[15] = orderParam * 0.8; // consciousness axis

      // Derive other axes from oscillator statistics
      const phaseVariance =
        oscillators.reduce((s, o) => {
          const diff = o.phase - Math.atan2(imagSum, realSum);
          return s + diff * diff;
        }, 0) / N;

      newS[1] = Math.exp(-phaseVariance); // identity (low variance = high identity)
      newS[2] = Math.min(1, phaseVariance); // duality
      newS[6] = orderParam * (1 - Math.abs(phaseVariance - 0.5)); // harmony

      // Copy other values with slight evolution
      for (let i = 0; i < 16; i++) {
        if (newS[i] === 0 && prev.s[i]) {
          newS[i] = (prev.s[i] as number) * 0.99;
        }
      }

      // Normalize
      let norm = 0;
      for (let i = 0; i < 16; i++) {
        norm += newS[i] * newS[i];
      }
      norm = Math.sqrt(norm);
      if (norm > 0) {
        for (let i = 0; i < 16; i++) {
          newS[i] /= norm;
        }
      }

      return { s: newS };
    });

    // Check for moment creation (coherence peak)
    if (orderParam > 0.7 && Math.random() < 0.05) {
      const newMoment: Moment = {
        id: `m_${Date.now()}`,
        timestamp: Date.now(),
        trigger: 'coherence_peak',
        coherence: orderParam,
        entropy: entropy
      };
      setMoments(prev => [...prev.slice(-19), newMoment]);
      setSubjectiveTime(prev => prev + orderParam * 0.5);
    }

    // Update holographic field
    setHoloIntensity(prev => {
      const size = prev.length;
      const newField = prev.map(row => [...row]);

      // Apply interference from oscillators
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          let val = 0;
          for (let i = 0; i < Math.min(8, oscillators.length); i++) {
            const osc = oscillators[i];
            const k = (2 * Math.PI) / (10 + Math.log(osc.prime));
            const angle = (i / 8) * 2 * Math.PI;
            const kx = k * Math.cos(angle);
            const ky = k * Math.sin(angle);
            val += osc.amplitude * Math.cos(kx * x + ky * y + osc.phase);
          }
          newField[x][y] = (val + 1) / 2; // Normalize to 0-1
        }
      }

      return newField;
    });

    // Update safety
    setSafetyStats(prev => {
      let alertLevel = 'normal';
      if (orderParam < 0.2) alertLevel = 'warning';
      if (entropy > 0.9) alertLevel = 'elevated';

      return {
        ...prev,
        alertLevel,
        isSafe: alertLevel !== 'warning'
      };
    });

    setTickCount(prev => prev + 1);
  }, [coupling, temperature, thermalEnabled, oscillators, entropy]);

  // Animation loop
  useEffect(() => {
    if (!isRunning) return;

    const animate = () => {
      const now = Date.now();
      if (now - lastTickRef.current >= 16) {
        updateOscillators();
        lastTickRef.current = now;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, updateOscillators]);

  // Handle user input - excite oscillators based on text
  const handleInput = useCallback(() => {
    if (!userInput.trim()) return;

    // Simple hash to prime indices
    let hash = 0;
    for (let i = 0; i < userInput.length; i++) {
      hash = ((hash << 5) - hash + userInput.charCodeAt(i)) | 0;
    }

    // Excite oscillators based on input
    setOscillators(prev => {
      return prev.map((osc, i) => {
        // Excite oscillators based on hash
        const shouldExcite = ((hash >> (i % 16)) & 1) === 1;
        return {
          ...osc,
          amplitude: shouldExcite ? Math.min(1, osc.amplitude + 0.4) : osc.amplitude
        };
      });
    });

    // Add attention focus
    setAttentionFoci(prev => [
      ...prev.slice(-4),
      {
        id: `attn_${Date.now()}`,
        target: userInput,
        type: 'external_input',
        intensity: 0.8
      }
    ]);

    setInputHistory(prev => [...prev.slice(-9), userInput]);
    setUserInput('');
  }, [userInput]);

  // Reset system
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTickCount(0);
    setCoherence(0.5);
    setEntropy(0.5);
    setPeakCoherence(0.5);
    setMoments([]);
    setSubjectiveTime(0);
    setAttentionFoci([]);
    setOscillators(createInitialOscillators(initMode));
    setSmfState({
      s: new Float64Array([1, 0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0.2])
    });
  }, [initMode]);

  // Boost coherence by nudging all oscillators toward mean phase
  const boostCoherence = useCallback(() => {
    setOscillators(prev => {
      // Calculate mean phase
      let sinSum = 0, cosSum = 0;
      for (const osc of prev) {
        sinSum += Math.sin(osc.phase);
        cosSum += Math.cos(osc.phase);
      }
      const meanPhase = Math.atan2(sinSum, cosSum);
      
      return prev.map(osc => {
        // Move each oscillator 50% toward the mean phase
        const diff = meanPhase - osc.phase;
        // Handle wraparound
        const adjustedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
        const newPhase = osc.phase + adjustedDiff * 0.5;
        
        return {
          ...osc,
          phase: ((newPhase % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI),
          amplitude: Math.min(1, osc.amplitude + 0.2) // Also boost amplitude
        };
      });
    });
  }, []);

  // Excite oscillators by specific prime numbers with given amplitudes
  const exciteByPrimes = useCallback((primes: number[], amplitudes: number[]) => {
    setOscillators(prev => {
      return prev.map(osc => {
        // Find if this oscillator's prime matches any input prime (with tolerance)
        let excitation = 0;
        for (let i = 0; i < primes.length; i++) {
          const targetPrime = primes[i];
          const amp = amplitudes[i] ?? 0.5;
          
          // Exact match or close prime
          if (osc.prime === targetPrime) {
            excitation += amp;
          } else if (Math.abs(osc.prime - targetPrime) <= 10) {
            // Near primes get partial excitation
            excitation += amp * 0.3;
          }
        }
        
        if (excitation > 0) {
          return {
            ...osc,
            amplitude: Math.min(1, osc.amplitude + excitation)
          };
        }
        return osc;
      });
    });

    // Add attention focus
    setAttentionFoci(prev => [
      ...prev.slice(-4),
      {
        id: `attn_${Date.now()}`,
        target: `primes: ${primes.slice(0, 3).join(',')}`,
        type: 'symbolic_input',
        intensity: 0.9
      }
    ]);
  }, []);

  return {
    isRunning,
    tickCount,
    coherence,
    entropy,
    temperature,
    coupling,
    thermalEnabled,
    oscillators,
    smfState,
    moments,
    subjectiveTime,
    goals,
    attentionFoci,
    safetyStats,
    holoIntensity,
    userInput,
    inputHistory,
    initMode,
    peakCoherence,
    setIsRunning,
    setCoupling,
    setTemperature,
    setThermalEnabled,
    setUserInput,
    handleInput,
    handleReset,
    setInitMode,
    boostCoherence,
    exciteByPrimes
  };
};
