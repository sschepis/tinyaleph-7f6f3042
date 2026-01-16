// Quantum Prime Wavefunction Types

export interface WaveformParams {
  t: number;              // Riemann zero (default 14.134725142)
  V0: number;             // Potential strength
  epsilon: number;        // Tunneling/regularization parameter
  beta: number;           // Spectral parameter
  resonanceWidth: number; // σ - Gaussian width for prime resonance
}

export interface WaveformPoint {
  x: number;
  psiReal: number;
  psiImag: number;
  psiMag: number;
  resonance: number;
  gapModulation: number;
  tunneling: number;
  isPrime: boolean;
}

export interface CorrelationStats {
  waveCorrelation: number;
  resonanceCorrelation: number;
  pValue: number;
  significance: 'low' | 'medium' | 'high' | 'very-high';
}

export interface SpectrumAnalysis {
  points: WaveformPoint[];
  stats: CorrelationStats;
  primes: number[];
  maxMagnitude: number;
}

export const DEFAULT_PARAMS: WaveformParams = {
  t: 14.134725142,    // First Riemann zero
  V0: 0.1,            // Optimal from notebook
  epsilon: 0.2,       // Optimal from notebook
  beta: 0.1,          // Optimal from notebook
  resonanceWidth: 0.5 // Optimal from notebook
};

export const RIEMANN_ZEROS = [
  14.134725142, // γ₁
  21.022039639, // γ₂
  25.010857580, // γ₃
  30.424876126, // γ₄
  32.935061588, // γ₅
  37.586178159, // γ₆
  40.918719012, // γ₇
  43.327073281, // γ₈
  48.005150881, // γ₉
  49.773832478  // γ₁₀
];

export const SMALL_PRIMES = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47,
  53, 59, 61, 67, 71, 73, 79, 83, 89, 97
];
