import { useState, useCallback, useRef, useEffect } from 'react';
import {
  PrimeState,
  EvolutionState,
  uniformSuperposition,
  basisState,
  conceptState,
  entropy,
  stateNorm,
  getProbabilities,
  getDominant,
  measure,
  evolve,
  applyPrimeOperator,
  applyRotationOperator,
  applyCouplingOperator,
  applyHadamardOperator,
  resonanceScore,
  complex,
  FIRST_64_PRIMES
} from '@/lib/prime-resonance';

export interface UseResonanceState {
  state: PrimeState;
  evolution: EvolutionState;
  history: EvolutionState[];
  isEvolving: boolean;
  measurements: { prime: number; count: number }[];
}

export function usePrimeResonance() {
  const [currentState, setCurrentState] = useState<PrimeState>(() => uniformSuperposition(16));
  const [evolution, setEvolution] = useState<EvolutionState>({
    time: 0,
    entropy: Math.log2(16),
    collapseProb: 0,
    dominant: [2, 3, 5],
    collapsed: false
  });
  const [history, setHistory] = useState<EvolutionState[]>([]);
  const [isEvolving, setIsEvolving] = useState(false);
  const [measurements, setMeasurements] = useState<Map<number, number>>(new Map());
  
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  
  // Initialize state from uniform superposition
  const initUniform = useCallback((n: number = 16) => {
    const state = uniformSuperposition(n);
    setCurrentState(state);
    setEvolution({
      time: 0,
      entropy: entropy(state),
      collapseProb: 0,
      dominant: getDominant(state).map(d => d.prime),
      collapsed: false
    });
    setHistory([]);
    setMeasurements(new Map());
    timeRef.current = 0;
  }, []);
  
  // Initialize from basis state |p⟩
  const initBasis = useCallback((prime: number) => {
    const state = basisState(prime);
    setCurrentState(state);
    setEvolution({
      time: 0,
      entropy: 0,
      collapseProb: 0,
      dominant: [prime],
      collapsed: true
    });
    setHistory([]);
    setMeasurements(new Map());
    timeRef.current = 0;
  }, []);
  
  // Initialize from concept primes
  const initConcept = useCallback((primes: number[]) => {
    const state = conceptState(primes);
    setCurrentState(state);
    setEvolution({
      time: 0,
      entropy: entropy(state),
      collapseProb: 0,
      dominant: getDominant(state).map(d => d.prime),
      collapsed: false
    });
    setHistory([]);
    setMeasurements(new Map());
    timeRef.current = 0;
  }, []);
  
  // Apply operators
  const applyOperator = useCallback((operator: 'P' | 'R' | 'C' | 'H', param?: number) => {
    setCurrentState(prev => {
      let newState: PrimeState;
      switch (operator) {
        case 'P':
          newState = applyPrimeOperator(prev);
          break;
        case 'R':
          newState = applyRotationOperator(prev, param || 5);
          break;
        case 'C':
          newState = applyCouplingOperator(prev, param || 7);
          break;
        case 'H':
          newState = applyHadamardOperator(prev);
          break;
        default:
          newState = prev;
      }
      
      const S = entropy(newState);
      setEvolution(e => ({
        ...e,
        entropy: S,
        dominant: getDominant(newState).map(d => d.prime),
        collapsed: S < 0.1
      }));
      
      return newState;
    });
  }, []);
  
  // Perform measurement
  const performMeasurement = useCallback(() => {
    const result = measure(currentState);
    
    setMeasurements(prev => {
      const next = new Map(prev);
      next.set(result.prime, (next.get(result.prime) || 0) + 1);
      return next;
    });
    
    // Collapse to measured state
    const collapsed = basisState(result.prime);
    setCurrentState(collapsed);
    setEvolution(e => ({
      ...e,
      entropy: 0,
      collapseProb: 1,
      dominant: [result.prime],
      collapsed: true
    }));
    
    return result;
  }, [currentState]);
  
  // Start evolution
  const startEvolution = useCallback((params = { lambda: 0.1, rStable: 2.0, dt: 0.05 }) => {
    setIsEvolving(true);
    
    const step = () => {
      setCurrentState(prev => {
        const { state, entropy: S, collapseProb } = evolve(prev, params);
        
        timeRef.current += params.dt;
        
        const newEvolution: EvolutionState = {
          time: timeRef.current,
          entropy: S,
          collapseProb,
          dominant: getDominant(state).map(d => d.prime),
          collapsed: S < 0.5 || Math.random() < collapseProb
        };
        
        setEvolution(newEvolution);
        setHistory(h => [...h.slice(-100), newEvolution]);
        
        if (newEvolution.collapsed) {
          setIsEvolving(false);
          return state;
        }
        
        animationRef.current = requestAnimationFrame(step);
        return state;
      });
    };
    
    animationRef.current = requestAnimationFrame(step);
  }, []);
  
  // Stop evolution
  const stopEvolution = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsEvolving(false);
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Get state info
  const getStateInfo = useCallback(() => {
    return {
      primes: currentState.primes,
      amplitudes: Array.from(currentState.amplitudes.entries()).map(([p, a]) => ({
        prime: p,
        amplitude: complex.toString(a),
        magnitude: complex.magnitude(a),
        phase: complex.phase(a)
      })),
      probabilities: getProbabilities(currentState),
      norm: stateNorm(currentState),
      entropy: entropy(currentState)
    };
  }, [currentState]);
  
  // Compare two states
  const compareStates = useCallback((other: PrimeState) => {
    return resonanceScore(currentState, other);
  }, [currentState]);
  
  return {
    state: currentState,
    evolution,
    history,
    isEvolving,
    measurements: Array.from(measurements.entries()).map(([prime, count]) => ({ prime, count })),
    
    // Initialization
    initUniform,
    initBasis,
    initConcept,
    
    // Operations
    applyOperator,
    performMeasurement,
    
    // Evolution
    startEvolution,
    stopEvolution,
    
    // Info
    getStateInfo,
    compareStates,
    
    // Utilities
    PRIMES: FIRST_64_PRIMES
  };
}
