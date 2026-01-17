// Grover's Search Algorithm Types

export interface GroverState {
  numQubits: number;
  numStates: number; // 2^numQubits
  markedStates: number[];
  amplitudes: number[]; // Real amplitudes (simplified for visualization)
  iteration: number;
  optimalIterations: number;
  probabilityMarked: number;
  phase: 'initial' | 'oracle' | 'diffusion' | 'measured' | 'idle';
}

export interface GeometricState {
  // Angle from |s⟩ toward |w⟩ in the 2D subspace
  theta: number;
  // Initial angle (arcsin of sqrt(M/N))
  theta0: number;
  // Rotation per iteration (2*theta0)
  deltaTheta: number;
}

export interface OracleVisualization {
  markedIndices: number[];
  phaseFlipped: boolean;
}

export interface IterationResult {
  iteration: number;
  amplitudes: number[];
  probabilityMarked: number;
  geometricAngle: number;
}

export interface GroverConfig {
  numQubits: number;
  markedStates: number[];
}

export const DEFAULT_CONFIG: GroverConfig = {
  numQubits: 4,
  markedStates: [7], // Search for |0111⟩
};

// Helper to calculate optimal iterations
export function calculateOptimalIterations(N: number, M: number): number {
  if (M === 0 || M >= N) return 0;
  return Math.round((Math.PI / 4) * Math.sqrt(N / M));
}

// Helper to calculate initial angle theta0
export function calculateTheta0(N: number, M: number): number {
  if (M === 0 || N === 0) return 0;
  return Math.asin(Math.sqrt(M / N));
}
