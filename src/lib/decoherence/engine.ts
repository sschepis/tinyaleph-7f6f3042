// Decoherence Simulation Engine

import { BlochState, DecoherenceParams, DecoherenceState, DEFAULT_PARAMS, INITIAL_STATES } from './types';

/**
 * Calculate Bloch vector evolution under T1 and T2 decay
 * 
 * T1 (Energy Relaxation): z component decays to thermal equilibrium
 *   dz/dt = -(z - z_eq) / T1
 *   
 * T2 (Dephasing): x,y components decay to zero
 *   dx/dt = -x / T2
 *   dy/dt = -y / T2
 *   
 * Additionally, Larmor precession rotates x,y in the xy-plane
 */
export function evolveBlochVector(
  initial: BlochState,
  time: number,
  params: DecoherenceParams
): BlochState {
  const { T1, T2, omega } = params;
  
  // Thermal equilibrium z value (approaches -1 at low temp, 0 at high temp)
  // For typical qubit temperatures, z_eq ≈ -1 (ground state)
  const kB = 1.380649e-23; // Boltzmann constant
  const hbar = 1.054571817e-34;
  const omega_rad = omega * 1e6 * 2 * Math.PI; // Convert MHz to rad/s
  const T_kelvin = params.temperature * 1e-3; // mK to K
  
  // Boltzmann factor for thermal equilibrium
  const beta = (hbar * omega_rad) / (kB * T_kelvin);
  const z_eq = beta > 30 ? -1 : -Math.tanh(beta / 2);
  
  // T1 decay (longitudinal relaxation)
  const z = z_eq + (initial.z - z_eq) * Math.exp(-time / T1);
  
  // T2 decay with Larmor precession (transverse relaxation)
  const decay_T2 = Math.exp(-time / T2);
  const phi = omega * 2 * Math.PI * time * 1e-3; // Phase from precession (MHz * μs = rad)
  
  const x = decay_T2 * (initial.x * Math.cos(phi) - initial.y * Math.sin(phi));
  const y = decay_T2 * (initial.x * Math.sin(phi) + initial.y * Math.cos(phi));
  
  return { x, y, z };
}

/**
 * Calculate purity of the quantum state
 * Purity = Tr(ρ²) = (1 + |r|²) / 2
 * For pure states: Purity = 1
 * For maximally mixed: Purity = 0.5
 */
export function calculatePurity(bloch: BlochState): number {
  const r2 = bloch.x ** 2 + bloch.y ** 2 + bloch.z ** 2;
  return (1 + r2) / 2;
}

/**
 * Calculate fidelity with initial state
 * F = (1 + r_init · r_current) / 2
 */
export function calculateFidelity(initial: BlochState, current: BlochState): number {
  const dot = initial.x * current.x + initial.y * current.y + initial.z * current.z;
  const r_init = Math.sqrt(initial.x ** 2 + initial.y ** 2 + initial.z ** 2);
  const r_curr = Math.sqrt(current.x ** 2 + current.y ** 2 + current.z ** 2);
  
  if (r_init === 0 || r_curr === 0) return 0.5;
  
  return (1 + dot / (r_init * r_curr)) / 2;
}

/**
 * Get decay rates for visualization
 */
export function getDecayRates(params: DecoherenceParams) {
  const gamma1 = 1 / params.T1;  // T1 decay rate
  const gamma2 = 1 / params.T2;  // T2 decay rate
  const gammaPhi = gamma2 - gamma1 / 2; // Pure dephasing rate
  
  return {
    gamma1,
    gamma2,
    gammaPhi,
    T1: params.T1,
    T2: params.T2,
    coherenceTime: params.T2,
    relaxationTime: params.T1,
  };
}

/**
 * Generate time evolution history
 */
export function generateHistory(
  initial: BlochState,
  params: DecoherenceParams,
  duration: number,
  steps: number = 100
): BlochState[] {
  const history: BlochState[] = [];
  const dt = duration / steps;
  
  for (let i = 0; i <= steps; i++) {
    const t = i * dt;
    history.push(evolveBlochVector(initial, t, params));
  }
  
  return history;
}

/**
 * Initialize decoherence state
 */
export function initializeState(
  initialStateName: keyof typeof INITIAL_STATES = 'plus_x',
  params: DecoherenceParams = DEFAULT_PARAMS
): DecoherenceState {
  const initialBloch = INITIAL_STATES[initialStateName];
  
  return {
    bloch: { ...initialBloch },
    initialBloch: { ...initialBloch },
    time: 0,
    isRunning: false,
    params,
    history: [{ ...initialBloch }],
    purity: 1,
    fidelity: 1,
  };
}

/**
 * Step the simulation forward
 */
export function stepSimulation(
  state: DecoherenceState,
  dt: number
): DecoherenceState {
  const newTime = state.time + dt;
  const newBloch = evolveBlochVector(state.initialBloch, newTime, state.params);
  const purity = calculatePurity(newBloch);
  const fidelity = calculateFidelity(state.initialBloch, newBloch);
  
  return {
    ...state,
    bloch: newBloch,
    time: newTime,
    history: [...state.history, newBloch].slice(-200), // Keep last 200 points
    purity,
    fidelity,
  };
}
