// Quantum Prime Wavefunction Engine
// Implements the quantum mechanical framework for prime number patterns

import { 
  WaveformParams, 
  WaveformPoint, 
  CorrelationStats, 
  SpectrumAnalysis,
  SMALL_PRIMES,
  DEFAULT_PARAMS
} from './types';

// Check if a number is prime
function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

// Get primes up to n
export function getPrimesUpTo(n: number): number[] {
  return SMALL_PRIMES.filter(p => p <= n);
}

// Prime potential - Gaussian peaks at prime locations
export function primePotential(x: number, width: number, primes: number[]): number {
  let potential = 0;
  for (const p of primes) {
    if (Math.abs(x - p) < 5 * width) {
      potential += Math.exp(-Math.pow(x - p, 2) / (2 * width * width));
    }
  }
  return potential;
}

// Gap modulation - captures rhythm of prime spacing
export function gapModulation(x: number, primes: number[]): number {
  for (let i = 0; i < primes.length - 1; i++) {
    const p1 = primes[i];
    const p2 = primes[i + 1];
    if (x >= p1 && x < p2) {
      const gap = p2 - p1;
      const phase = 2 * Math.PI * (x - p1) / gap;
      return Math.cos(phase);
    }
  }
  return 0;
}

// Quantum tunneling between prime pairs
export function quantumTunneling(
  x: number, 
  primes: number[], 
  epsilon: number, 
  beta: number
): { real: number; imag: number } {
  let tunnelReal = 0;
  let tunnelImag = 0;
  
  for (let i = 0; i < primes.length - 1; i++) {
    const p1 = primes[i];
    const p2 = primes[i + 1];
    
    if (x > p1 && x < p2) {
      const tunnelAmp = Math.exp(-(x - p1) * (p2 - x) / epsilon);
      const phase = beta * (x - p1);
      tunnelReal += 0.2 * tunnelAmp * Math.cos(phase);
      tunnelImag += 0.2 * tunnelAmp * Math.sin(phase);
    }
  }
  
  return { real: tunnelReal, imag: tunnelImag };
}

// Complete wave function ψ(x)
export function waveFunction(
  x: number, 
  params: WaveformParams,
  primes: number[]
): { real: number; imag: number; magnitude: number } {
  const { t, V0, epsilon, beta, resonanceWidth } = params;
  
  // Normalization factor
  const N = 1.0 / (2 * Math.PI * t);
  
  // Basic wave component: ψ_basic = N^(-1/2) * cos(2πtx) * e^(-|t|x)
  const decay = Math.exp(-Math.abs(t) * x * 0.01); // Scaled for visualization
  const psiBasic = Math.sqrt(1/N) * Math.cos(2 * Math.PI * t * x * 0.1) * decay;
  
  // Prime resonance component
  const resonance = primePotential(x, resonanceWidth, primes);
  
  // Gap modulation
  const gapMod = gapModulation(x, primes);
  
  // Combined wave with modulations (scaled by V0)
  let psiReal = psiBasic * (1 + V0 * 0.5 * resonance) * (1 + V0 * 0.3 * gapMod);
  let psiImag = 0;
  
  // Add quantum tunneling effects
  const tunnel = quantumTunneling(x, primes, epsilon, beta);
  psiReal += tunnel.real;
  psiImag += tunnel.imag;
  
  const magnitude = Math.sqrt(psiReal * psiReal + psiImag * psiImag);
  
  return { real: psiReal, imag: psiImag, magnitude };
}

// Analyze spectrum over a range
export function analyzeSpectrum(
  xMin: number,
  xMax: number,
  nPoints: number,
  params: WaveformParams
): SpectrumAnalysis {
  const primes = getPrimesUpTo(xMax + 5);
  const points: WaveformPoint[] = [];
  
  // Use logarithmic spacing for better sampling near small primes
  const logMin = Math.log10(Math.max(xMin, 1));
  const logMax = Math.log10(xMax);
  
  let maxMagnitude = 0;
  
  for (let i = 0; i < nPoints; i++) {
    const logX = logMin + (logMax - logMin) * i / (nPoints - 1);
    const x = Math.pow(10, logX);
    
    const psi = waveFunction(x, params, primes);
    const resonance = primePotential(x, params.resonanceWidth, primes);
    const gapMod = gapModulation(x, primes);
    const tunnel = quantumTunneling(x, primes, params.epsilon, params.beta);
    const tunnelMag = Math.sqrt(tunnel.real * tunnel.real + tunnel.imag * tunnel.imag);
    
    const point: WaveformPoint = {
      x,
      psiReal: psi.real,
      psiImag: psi.imag,
      psiMag: psi.magnitude,
      resonance,
      gapModulation: gapMod,
      tunneling: tunnelMag,
      isPrime: isPrime(Math.round(x)) && Math.abs(x - Math.round(x)) < 0.1
    };
    
    points.push(point);
    maxMagnitude = Math.max(maxMagnitude, psi.magnitude);
  }
  
  // Calculate correlations
  const stats = calculateCorrelations(points, primes);
  
  return { points, stats, primes, maxMagnitude };
}

// Calculate point-biserial correlation between wave function and prime locations
function calculateCorrelations(points: WaveformPoint[], primes: number[]): CorrelationStats {
  // Create arrays for correlation calculation
  const primeSet = new Set(primes);
  
  const waveValues: number[] = [];
  const resonanceValues: number[] = [];
  const isPrimeValues: number[] = [];
  
  for (const point of points) {
    const nearPrime = primes.some(p => Math.abs(point.x - p) < 0.5);
    waveValues.push(point.psiMag);
    resonanceValues.push(point.resonance);
    isPrimeValues.push(nearPrime ? 1 : 0);
  }
  
  // Point-biserial correlation
  const waveCorr = pointBiserialCorrelation(isPrimeValues, waveValues);
  const resCorr = pointBiserialCorrelation(isPrimeValues, resonanceValues);
  
  // Approximate p-value using t-distribution
  const n = points.length;
  const tStat = waveCorr * Math.sqrt((n - 2) / (1 - waveCorr * waveCorr + 0.0001));
  const pValue = Math.exp(-Math.abs(tStat) * 0.5); // Simplified approximation
  
  let significance: 'low' | 'medium' | 'high' | 'very-high' = 'low';
  if (pValue < 0.001) significance = 'very-high';
  else if (pValue < 0.01) significance = 'high';
  else if (pValue < 0.05) significance = 'medium';
  
  return {
    waveCorrelation: waveCorr,
    resonanceCorrelation: resCorr,
    pValue,
    significance
  };
}

// Point-biserial correlation coefficient
function pointBiserialCorrelation(binary: number[], continuous: number[]): number {
  const n = binary.length;
  if (n === 0) return 0;
  
  // Separate into two groups
  const group0: number[] = [];
  const group1: number[] = [];
  
  for (let i = 0; i < n; i++) {
    if (binary[i] === 0) {
      group0.push(continuous[i]);
    } else {
      group1.push(continuous[i]);
    }
  }
  
  if (group0.length === 0 || group1.length === 0) return 0;
  
  const mean0 = group0.reduce((a, b) => a + b, 0) / group0.length;
  const mean1 = group1.reduce((a, b) => a + b, 0) / group1.length;
  
  const n0 = group0.length;
  const n1 = group1.length;
  
  // Standard deviation of all values
  const allMean = continuous.reduce((a, b) => a + b, 0) / n;
  const variance = continuous.reduce((sum, x) => sum + Math.pow(x - allMean, 2), 0) / n;
  const sd = Math.sqrt(variance);
  
  if (sd === 0) return 0;
  
  // Point-biserial correlation
  const rpb = (mean1 - mean0) / sd * Math.sqrt((n0 * n1) / (n * n));
  
  return Math.max(-1, Math.min(1, rpb));
}

// Get wave function at specific prime locations
export function getWaveAtPrimes(params: WaveformParams, maxPrime: number = 50): Array<{
  prime: number;
  magnitude: number;
  phase: number;
}> {
  const primes = getPrimesUpTo(maxPrime);
  return primes.map(p => {
    const psi = waveFunction(p, params, primes);
    return {
      prime: p,
      magnitude: psi.magnitude,
      phase: Math.atan2(psi.imag, psi.real)
    };
  });
}
