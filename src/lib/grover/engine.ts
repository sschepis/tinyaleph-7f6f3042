// Grover's Algorithm Engine

import {
  GroverState,
  GeometricState,
  IterationResult,
  GroverConfig,
  calculateOptimalIterations,
  calculateTheta0,
} from './types';

/**
 * Initialize the quantum state to uniform superposition
 */
export function initializeState(config: GroverConfig): GroverState {
  const numStates = Math.pow(2, config.numQubits);
  const amplitude = 1 / Math.sqrt(numStates);
  const amplitudes = new Array(numStates).fill(amplitude);
  
  const M = config.markedStates.length;
  const optimalIterations = calculateOptimalIterations(numStates, M);
  
  // Calculate initial probability of finding marked state
  const probabilityMarked = config.markedStates.reduce(
    (sum, idx) => sum + amplitudes[idx] * amplitudes[idx],
    0
  );
  
  return {
    numQubits: config.numQubits,
    numStates,
    markedStates: [...config.markedStates],
    amplitudes,
    iteration: 0,
    optimalIterations,
    probabilityMarked,
    phase: 'initial',
  };
}

/**
 * Apply the Oracle operator: flip phase of marked states
 * O|x⟩ = -|x⟩ if x is marked, |x⟩ otherwise
 */
export function applyOracle(state: GroverState): GroverState {
  const newAmplitudes = [...state.amplitudes];
  
  for (const marked of state.markedStates) {
    if (marked >= 0 && marked < state.numStates) {
      newAmplitudes[marked] = -newAmplitudes[marked];
    }
  }
  
  return {
    ...state,
    amplitudes: newAmplitudes,
    phase: 'oracle',
  };
}

/**
 * Apply the Diffusion operator (Grover diffuser)
 * D = 2|s⟩⟨s| - I where |s⟩ is uniform superposition
 * This reflects amplitudes about the mean
 */
export function applyDiffusion(state: GroverState): GroverState {
  const mean = state.amplitudes.reduce((a, b) => a + b, 0) / state.numStates;
  
  const newAmplitudes = state.amplitudes.map(amp => 2 * mean - amp);
  
  const probabilityMarked = state.markedStates.reduce(
    (sum, idx) => sum + newAmplitudes[idx] * newAmplitudes[idx],
    0
  );
  
  return {
    ...state,
    amplitudes: newAmplitudes,
    iteration: state.iteration + 1,
    probabilityMarked,
    phase: 'diffusion',
  };
}

/**
 * Perform one complete Grover iteration (Oracle + Diffusion)
 */
export function performIteration(state: GroverState): GroverState {
  const afterOracle = applyOracle(state);
  return applyDiffusion(afterOracle);
}

/**
 * Run multiple iterations
 */
export function runIterations(state: GroverState, count: number): GroverState {
  let current = state;
  for (let i = 0; i < count; i++) {
    current = performIteration(current);
  }
  return current;
}

/**
 * Run to optimal number of iterations
 */
export function runToOptimal(state: GroverState): GroverState {
  const remaining = state.optimalIterations - state.iteration;
  if (remaining <= 0) return state;
  return runIterations(state, remaining);
}

/**
 * Calculate geometric interpretation
 */
export function getGeometricState(state: GroverState): GeometricState {
  const N = state.numStates;
  const M = state.markedStates.length;
  
  const theta0 = calculateTheta0(N, M);
  const deltaTheta = 2 * theta0;
  
  // Current angle after k iterations: (2k + 1) * theta0
  const theta = (2 * state.iteration + 1) * theta0;
  
  return {
    theta,
    theta0,
    deltaTheta,
  };
}

/**
 * Get amplitude history for visualization
 */
export function getIterationHistory(config: GroverConfig, maxIterations: number): IterationResult[] {
  const history: IterationResult[] = [];
  let state = initializeState(config);
  
  const N = state.numStates;
  const M = config.markedStates.length;
  const theta0 = calculateTheta0(N, M);
  
  // Record initial state
  history.push({
    iteration: 0,
    amplitudes: [...state.amplitudes],
    probabilityMarked: state.probabilityMarked,
    geometricAngle: theta0,
  });
  
  // Record each iteration
  for (let i = 0; i < maxIterations; i++) {
    state = performIteration(state);
    history.push({
      iteration: state.iteration,
      amplitudes: [...state.amplitudes],
      probabilityMarked: state.probabilityMarked,
      geometricAngle: (2 * state.iteration + 1) * theta0,
    });
  }
  
  return history;
}

/**
 * Simulate measurement - returns index of measured state
 */
export function measureState(state: GroverState): { result: number; isMarked: boolean } {
  const probabilities = state.amplitudes.map(a => a * a);
  const random = Math.random();
  
  let cumulative = 0;
  for (let i = 0; i < probabilities.length; i++) {
    cumulative += probabilities[i];
    if (random < cumulative) {
      return {
        result: i,
        isMarked: state.markedStates.includes(i),
      };
    }
  }
  
  // Fallback to last state
  const last = probabilities.length - 1;
  return {
    result: last,
    isMarked: state.markedStates.includes(last),
  };
}

/**
 * Format state index as binary string
 */
export function formatBinary(index: number, numQubits: number): string {
  return index.toString(2).padStart(numQubits, '0');
}

/**
 * Calculate success probability for given number of iterations
 */
export function calculateSuccessProbability(N: number, M: number, k: number): number {
  if (M === 0 || N === 0) return 0;
  const theta = Math.asin(Math.sqrt(M / N));
  return Math.pow(Math.sin((2 * k + 1) * theta), 2);
}
