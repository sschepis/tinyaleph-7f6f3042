import { useState, useCallback, useEffect, useRef } from 'react';
import {
  DecoherenceState,
  DecoherenceParams,
  BlochState,
  DEFAULT_PARAMS,
  INITIAL_STATES,
  QUBIT_SYSTEMS,
} from '@/lib/decoherence/types';
import {
  initializeState,
  stepSimulation,
  evolveBlochVector,
  calculatePurity,
  calculateFidelity,
  getDecayRates,
} from '@/lib/decoherence/engine';

export function useDecoherence(
  initialStateName: keyof typeof INITIAL_STATES = 'plus_x'
) {
  const [state, setState] = useState<DecoherenceState>(() =>
    initializeState(initialStateName, DEFAULT_PARAMS)
  );
  const [speed, setSpeed] = useState(1); // Simulation speed multiplier
  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Animation loop
  useEffect(() => {
    if (!state.isRunning) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = timestamp;
      }

      const elapsed = timestamp - lastTimeRef.current;
      
      // Update every 16ms (~60fps), step by 0.1 μs * speed
      if (elapsed > 16) {
        const dt = 0.1 * speed; // μs per frame
        setState(prev => {
          // Stop if state has mostly decayed
          if (prev.purity < 0.501 && prev.time > prev.params.T1 * 3) {
            return { ...prev, isRunning: false };
          }
          return stepSimulation(prev, dt);
        });
        lastTimeRef.current = timestamp;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state.isRunning, speed]);

  const start = useCallback(() => {
    lastTimeRef.current = 0;
    setState(prev => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setState(prev => ({ ...prev, isRunning: false }));
  }, []);

  const reset = useCallback(() => {
    setState(prev => ({
      ...initializeState(
        Object.keys(INITIAL_STATES).find(
          k => JSON.stringify(INITIAL_STATES[k as keyof typeof INITIAL_STATES]) === 
               JSON.stringify(prev.initialBloch)
        ) as keyof typeof INITIAL_STATES || 'plus_x',
        prev.params
      ),
    }));
  }, []);

  const setInitialState = useCallback((stateName: keyof typeof INITIAL_STATES) => {
    setState(prev => initializeState(stateName, prev.params));
  }, []);

  const setParams = useCallback((params: Partial<DecoherenceParams>) => {
    setState(prev => {
      const newParams = { ...prev.params, ...params };
      // Ensure T2 ≤ 2*T1 constraint
      if (newParams.T2 > 2 * newParams.T1) {
        newParams.T2 = 2 * newParams.T1;
      }
      if (newParams.T2Star > newParams.T2) {
        newParams.T2Star = newParams.T2;
      }
      return {
        ...prev,
        params: newParams,
        // Recalculate current state with new params
        bloch: evolveBlochVector(prev.initialBloch, prev.time, newParams),
        purity: calculatePurity(evolveBlochVector(prev.initialBloch, prev.time, newParams)),
        fidelity: calculateFidelity(prev.initialBloch, evolveBlochVector(prev.initialBloch, prev.time, newParams)),
      };
    });
  }, []);

  const selectQubitSystem = useCallback((systemKey: keyof typeof QUBIT_SYSTEMS) => {
    const system = QUBIT_SYSTEMS[systemKey];
    setState(prev => initializeState(
      Object.keys(INITIAL_STATES).find(
        k => JSON.stringify(INITIAL_STATES[k as keyof typeof INITIAL_STATES]) === 
             JSON.stringify(prev.initialBloch)
      ) as keyof typeof INITIAL_STATES || 'plus_x',
      {
        T1: system.T1,
        T2: system.T2,
        T2Star: system.T2Star,
        omega: system.omega,
        temperature: system.temperature,
      }
    ));
  }, []);

  const jumpToTime = useCallback((time: number) => {
    setState(prev => {
      const newBloch = evolveBlochVector(prev.initialBloch, time, prev.params);
      return {
        ...prev,
        time,
        bloch: newBloch,
        purity: calculatePurity(newBloch),
        fidelity: calculateFidelity(prev.initialBloch, newBloch),
        history: [], // Clear history on jump
      };
    });
  }, []);

  const decayRates = getDecayRates(state.params);

  return {
    state,
    start,
    pause,
    reset,
    setInitialState,
    setParams,
    selectQubitSystem,
    jumpToTime,
    speed,
    setSpeed,
    decayRates,
    isRunning: state.isRunning,
  };
}
