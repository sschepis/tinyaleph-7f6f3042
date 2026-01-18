/**
 * SETI Analyzer - Detect anomalous correlations in pulsar timing
 */

import {
  Pulsar,
  SETICandidate,
  CorrelationResult,
  SpectrumAnalysis
} from './types';
import { SPLIT_PRIMES, PULSAR_CATALOG } from './pulsar-catalog';

/**
 * Generate simulated timing residuals for a pulsar
 * In reality, these would come from pulsar timing observations
 */
export function generateTimingResiduals(
  pulsar: Pulsar,
  time: number,
  noiseLevel: number,
  injectedSignal?: { frequency: number; amplitude: number; phase: number }
): number {
  // Base noise
  const noise = (Math.random() - 0.5) * 2 * noiseLevel;
  
  // Injected alien signal (for testing)
  let signal = 0;
  if (injectedSignal) {
    signal = injectedSignal.amplitude * 
      Math.sin(2 * Math.PI * injectedSignal.frequency * time + injectedSignal.phase);
  }
  
  return noise + signal;
}

/**
 * Compute cross-correlation between two pulsar residual time series
 */
export function computeCrossCorrelation(
  residuals1: number[],
  residuals2: number[],
  maxLag: number
): { correlation: number[]; lags: number[] } {
  const n = Math.min(residuals1.length, residuals2.length);
  const correlation: number[] = [];
  const lags: number[] = [];
  
  // Normalize
  const mean1 = residuals1.reduce((a, b) => a + b, 0) / residuals1.length;
  const mean2 = residuals2.reduce((a, b) => a + b, 0) / residuals2.length;
  const std1 = Math.sqrt(residuals1.reduce((a, b) => a + (b - mean1) ** 2, 0) / residuals1.length);
  const std2 = Math.sqrt(residuals2.reduce((a, b) => a + (b - mean2) ** 2, 0) / residuals2.length);
  
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    let sum = 0;
    let count = 0;
    
    for (let i = 0; i < n; i++) {
      const j = i + lag;
      if (j >= 0 && j < n) {
        sum += (residuals1[i] - mean1) * (residuals2[j] - mean2);
        count++;
      }
    }
    
    const corr = count > 0 ? sum / (count * std1 * std2) : 0;
    correlation.push(corr);
    lags.push(lag);
  }
  
  return { correlation, lags };
}

/**
 * Compute FFT-based power spectrum of residuals
 */
export function computeSpectrum(
  residuals: number[],
  sampleRate: number
): { frequencies: number[]; powers: number[] } {
  const n = residuals.length;
  const frequencies: number[] = [];
  const powers: number[] = [];
  
  // Simple DFT (for small arrays; use FFT library for production)
  for (let k = 0; k < n / 2; k++) {
    let re = 0;
    let im = 0;
    
    for (let t = 0; t < n; t++) {
      const angle = 2 * Math.PI * k * t / n;
      re += residuals[t] * Math.cos(angle);
      im -= residuals[t] * Math.sin(angle);
    }
    
    const power = (re * re + im * im) / n;
    const freq = k * sampleRate / n;
    
    frequencies.push(freq);
    powers.push(power);
  }
  
  return { frequencies, powers };
}

/**
 * Check if a frequency corresponds to a split prime
 */
export function matchSplitPrime(frequency: number, tolerance: number = 0.1): number | null {
  for (const prime of SPLIT_PRIMES) {
    const primeFreq = Math.sqrt(prime);
    if (Math.abs(frequency - primeFreq) < tolerance) {
      return prime;
    }
    // Also check for harmonics
    if (Math.abs(frequency - primeFreq / 2) < tolerance) {
      return prime;
    }
    if (Math.abs(frequency - primeFreq * 2) < tolerance) {
      return prime;
    }
  }
  return null;
}

/**
 * Analyze spectrum for split-prime frequencies
 */
export function analyzeSpectrum(
  residuals: number[],
  sampleRate: number,
  noiseFloor: number
): SpectrumAnalysis {
  const { frequencies, powers } = computeSpectrum(residuals, sampleRate);
  
  // Find peaks above noise floor
  const peaks: SpectrumAnalysis['peaks'] = [];
  const splitPrimeMatches: number[] = [];
  
  for (let i = 1; i < frequencies.length - 1; i++) {
    if (powers[i] > powers[i - 1] && powers[i] > powers[i + 1]) {
      const significance = powers[i] / noiseFloor;
      if (significance > 2) { // 2-sigma threshold
        const associatedPrime = matchSplitPrime(frequencies[i]);
        peaks.push({
          frequency: frequencies[i],
          power: powers[i],
          associatedPrime,
          significance
        });
        if (associatedPrime) {
          splitPrimeMatches.push(associatedPrime);
        }
      }
    }
  }
  
  return {
    frequencies,
    powers,
    peaks,
    noiseFloor,
    splitPrimeMatches
  };
}

/**
 * Scan for SETI candidates across all pulsar pairs
 */
export function scanForCandidates(
  residualsMap: Map<string, number[]>,
  sampleRate: number,
  threshold: number
): SETICandidate[] {
  const candidates: SETICandidate[] = [];
  const pulsarNames = Array.from(residualsMap.keys());
  
  // Analyze correlations between all pairs
  for (let i = 0; i < pulsarNames.length; i++) {
    for (let j = i + 1; j < pulsarNames.length; j++) {
      const res1 = residualsMap.get(pulsarNames[i])!;
      const res2 = residualsMap.get(pulsarNames[j])!;
      
      const { correlation, lags } = computeCrossCorrelation(res1, res2, 50);
      
      // Find maximum correlation
      let maxCorr = 0;
      let maxLag = 0;
      for (let k = 0; k < correlation.length; k++) {
        if (Math.abs(correlation[k]) > Math.abs(maxCorr)) {
          maxCorr = correlation[k];
          maxLag = lags[k];
        }
      }
      
      // Check if anomalous
      if (Math.abs(maxCorr) > threshold) {
        // Analyze combined spectrum
        const combined = res1.map((v, idx) => v + (res2[idx] || 0));
        const spectrum = analyzeSpectrum(combined, sampleRate, 1e-6);
        
        const candidate: SETICandidate = {
          id: `SETI-${Date.now()}-${i}-${j}`,
          timestamp: Date.now(),
          pulsars: [pulsarNames[i], pulsarNames[j]],
          frequency: spectrum.peaks[0]?.frequency || 0,
          associatedPrime: spectrum.peaks[0]?.associatedPrime || null,
          correlationStrength: Math.abs(maxCorr),
          snr: spectrum.peaks[0]?.significance || 0,
          falseAlarmProbability: estimateFAP(maxCorr, res1.length),
          isRepeating: detectRepetition(correlation),
          periodicity: findPeriodicity(correlation, sampleRate),
          structureScore: computeStructureScore(spectrum),
          intelligenceProbability: 0, // Computed below
          status: 'candidate',
          notes: ''
        };
        
        // Compute intelligence probability heuristic
        candidate.intelligenceProbability = computeIntelligenceProbability(candidate);
        
        candidates.push(candidate);
      }
    }
  }
  
  // Sort by intelligence probability
  candidates.sort((a, b) => b.intelligenceProbability - a.intelligenceProbability);
  
  return candidates;
}

/**
 * Estimate false alarm probability
 */
function estimateFAP(correlation: number, n: number): number {
  // Fisher z-transformation
  const z = 0.5 * Math.log((1 + correlation) / (1 - correlation));
  const se = 1 / Math.sqrt(n - 3);
  const zScore = Math.abs(z) / se;
  
  // Approximate p-value from z-score
  return 2 * (1 - normalCDF(zScore));
}

/**
 * Normal CDF approximation
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);
  
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
  return 0.5 * (1.0 + sign * y);
}

/**
 * Detect if correlation shows repetitive structure
 */
function detectRepetition(correlation: number[]): boolean {
  // Look for periodic peaks
  let peaks = 0;
  for (let i = 1; i < correlation.length - 1; i++) {
    if (correlation[i] > correlation[i - 1] && 
        correlation[i] > correlation[i + 1] &&
        correlation[i] > 0.3) {
      peaks++;
    }
  }
  return peaks >= 3;
}

/**
 * Find periodicity in correlation function
 */
function findPeriodicity(correlation: number[], sampleRate: number): number | null {
  // Find distance between peaks
  const peakIndices: number[] = [];
  for (let i = 1; i < correlation.length - 1; i++) {
    if (correlation[i] > correlation[i - 1] && 
        correlation[i] > correlation[i + 1] &&
        correlation[i] > 0.3) {
      peakIndices.push(i);
    }
  }
  
  if (peakIndices.length < 2) return null;
  
  // Average peak spacing
  let totalSpacing = 0;
  for (let i = 1; i < peakIndices.length; i++) {
    totalSpacing += peakIndices[i] - peakIndices[i - 1];
  }
  const avgSpacing = totalSpacing / (peakIndices.length - 1);
  
  return avgSpacing / sampleRate;
}

/**
 * Compute structure score (how "ordered" the signal is)
 */
function computeStructureScore(spectrum: SpectrumAnalysis): number {
  if (spectrum.peaks.length === 0) return 0;
  
  let score = 0;
  
  // More peaks = more structure
  score += Math.min(spectrum.peaks.length / 10, 0.3);
  
  // Split prime matches = high structure
  score += spectrum.splitPrimeMatches.length * 0.2;
  
  // High significance = more confidence
  const avgSignificance = spectrum.peaks.reduce((a, b) => a + b.significance, 0) / spectrum.peaks.length;
  score += Math.min(avgSignificance / 20, 0.3);
  
  return Math.min(score, 1);
}

/**
 * Compute heuristic intelligence probability
 */
function computeIntelligenceProbability(candidate: SETICandidate): number {
  let prob = 0;
  
  // Split prime association strongly suggests intelligence
  if (candidate.associatedPrime !== null) {
    prob += 0.4;
  }
  
  // Repetition suggests intentional signal
  if (candidate.isRepeating) {
    prob += 0.2;
  }
  
  // High correlation strength
  prob += candidate.correlationStrength * 0.2;
  
  // Structure score
  prob += candidate.structureScore * 0.2;
  
  // Low false alarm probability
  if (candidate.falseAlarmProbability < 0.001) {
    prob += 0.1;
  }
  
  return Math.min(prob, 1);
}

/**
 * Inject simulated alien signal for testing
 */
export function injectAlienSignal(
  residuals: number[],
  prime: number,
  amplitude: number,
  phaseOffset: number = 0,
  sampleRate: number = 1
): number[] {
  const frequency = Math.sqrt(prime);
  return residuals.map((r, i) => {
    const t = i / sampleRate;
    const signal = amplitude * Math.sin(2 * Math.PI * frequency * t + phaseOffset);
    return r + signal;
  });
}

/**
 * Generate test dataset with optional alien signal
 */
export function generateTestDataset(
  duration: number,
  sampleRate: number,
  noiseLevel: number,
  alienConfig?: {
    primes: number[];
    amplitude: number;
  }
): Map<string, number[]> {
  const residualsMap = new Map<string, number[]>();
  const activePulsars = PULSAR_CATALOG.filter(p => p.isActive);
  const numSamples = Math.floor(duration * sampleRate);
  
  for (const pulsar of activePulsars) {
    let residuals: number[] = [];
    
    // Generate noise
    for (let i = 0; i < numSamples; i++) {
      residuals.push((Math.random() - 0.5) * 2 * noiseLevel);
    }
    
    // Inject alien signal if configured
    if (alienConfig) {
      for (const prime of alienConfig.primes) {
        residuals = injectAlienSignal(
          residuals, 
          prime, 
          alienConfig.amplitude, 
          Math.random() * 2 * Math.PI,
          sampleRate
        );
      }
    }
    
    residualsMap.set(pulsar.name, residuals);
  }
  
  return residualsMap;
}
