// Decoherence Simulator Types

export interface BlochState {
  x: number;  // σx expectation
  y: number;  // σy expectation  
  z: number;  // σz expectation (population difference)
}

export interface DecoherenceParams {
  T1: number;       // Energy relaxation time (μs)
  T2: number;       // Dephasing time (μs)
  T2Star: number;   // Inhomogeneous dephasing (T2* ≤ T2 ≤ 2*T1)
  omega: number;    // Larmor frequency (MHz)
  temperature: number; // Environment temperature (mK)
}

export interface DecoherenceState {
  bloch: BlochState;
  initialBloch: BlochState;
  time: number;
  isRunning: boolean;
  params: DecoherenceParams;
  history: BlochState[];
  purity: number;
  fidelity: number;
}

export interface DecayChannel {
  name: string;
  rate: number;
  description: string;
}

export const DEFAULT_PARAMS: DecoherenceParams = {
  T1: 50,        // 50 μs typical for superconducting qubits
  T2: 30,        // T2 ≤ 2*T1
  T2Star: 20,    // T2* ≤ T2
  omega: 5000,   // 5 GHz = 5000 MHz
  temperature: 20, // 20 mK
};

export const INITIAL_STATES: Record<string, BlochState> = {
  plus_x: { x: 1, y: 0, z: 0 },    // |+⟩
  minus_x: { x: -1, y: 0, z: 0 },  // |-⟩
  plus_y: { x: 0, y: 1, z: 0 },    // |+i⟩
  minus_y: { x: 0, y: -1, z: 0 },  // |-i⟩
  excited: { x: 0, y: 0, z: 1 },   // |1⟩
  ground: { x: 0, y: 0, z: -1 },   // |0⟩
  superposition: { x: 0.707, y: 0.707, z: 0 }, // Equal superposition with phase
};

export const QUBIT_SYSTEMS = {
  superconducting: {
    name: 'Superconducting Transmon',
    T1: 50,
    T2: 30,
    T2Star: 20,
    omega: 5000,
    temperature: 20,
  },
  trapped_ion: {
    name: 'Trapped Ion',
    T1: 1000,
    T2: 500,
    T2Star: 300,
    omega: 12600,
    temperature: 0.5,
  },
  spin_qubit: {
    name: 'Silicon Spin Qubit',
    T1: 10000,
    T2: 1000,
    T2Star: 100,
    omega: 40000,
    temperature: 100,
  },
  nitrogen_vacancy: {
    name: 'NV Center (Diamond)',
    T1: 5000,
    T2: 2000,
    T2Star: 50,
    omega: 2870,
    temperature: 300000, // Room temp in mK
  },
};
