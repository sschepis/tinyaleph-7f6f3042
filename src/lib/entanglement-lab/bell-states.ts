// Bell State Operations and Measurements

import { 
  BellState, 
  ComplexNumber, 
  QubitState, 
  MeasurementResult,
  MeasurementStats,
  BELL_STATE_INFO 
} from './types';

/**
 * Create a Bell state
 */
export function createBellState(type: BellState): QubitState {
  return {
    amplitudes: [...BELL_STATE_INFO[type].amplitudes] as [ComplexNumber, ComplexNumber, ComplexNumber, ComplexNumber]
  };
}

/**
 * Complex number magnitude squared
 */
function magnitudeSquared(c: ComplexNumber): number {
  return c.re * c.re + c.im * c.im;
}

/**
 * Complex multiplication
 */
function complexMul(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re
  };
}

/**
 * Complex addition
 */
function complexAdd(a: ComplexNumber, b: ComplexNumber): ComplexNumber {
  return { re: a.re + b.re, im: a.im + b.im };
}

/**
 * Get rotation matrix for measurement in basis at angle theta
 * Returns the projector onto |0⟩ in the rotated basis
 */
function getRotationCoeffs(theta: number): { cos: number; sin: number } {
  return {
    cos: Math.cos(theta / 2),
    sin: Math.sin(theta / 2)
  };
}

/**
 * Calculate theoretical correlation for a Bell state
 * E(a,b) = ⟨ψ|σₐ⊗σᵦ|ψ⟩
 */
export function theoreticalCorrelation(
  bellState: BellState,
  aliceAngle: number,
  bobAngle: number
): number {
  // For Bell states, correlation depends on angle difference
  const angleDiff = aliceAngle - bobAngle;
  
  switch (bellState) {
    case 'Φ+':
      // E(a,b) = cos(a-b) for Φ+
      return Math.cos(angleDiff);
    case 'Φ-':
      // E(a,b) = -cos(a-b) for Φ-
      return -Math.cos(angleDiff);
    case 'Ψ+':
      // E(a,b) = cos(a-b) for Ψ+
      return Math.cos(angleDiff);
    case 'Ψ-':
      // E(a,b) = -cos(a-b) for Ψ- (singlet)
      return -Math.cos(angleDiff);
    default:
      return 0;
  }
}

/**
 * Simulate a single measurement on entangled pair
 * Uses deterministic seeded random for reproducibility
 */
export function measureEntangledPair(
  bellState: BellState,
  aliceAngle: number,
  bobAngle: number,
  seed: number
): MeasurementResult {
  // Seeded random number generator
  const random = seededRandom(seed);
  
  const state = createBellState(bellState);
  
  // Get rotation coefficients for both parties
  const aliceRot = getRotationCoeffs(aliceAngle);
  const bobRot = getRotationCoeffs(bobAngle);
  
  // Calculate probability amplitudes for each outcome in rotated basis
  // |ψ⟩ = α|00⟩ + β|01⟩ + γ|10⟩ + δ|11⟩
  const [alpha, beta, gamma, delta] = state.amplitudes;
  
  // Transform to Alice's and Bob's measurement bases
  // Probability of Alice getting 0: P(A=0) 
  // This requires proper basis transformation
  
  // For simplicity, use the correlation structure of Bell states
  // The joint probability distribution follows quantum mechanics
  
  // Calculate probabilities for each outcome
  const probs = calculateJointProbabilities(bellState, aliceAngle, bobAngle);
  
  // Sample from distribution
  const r = random();
  let cumulative = 0;
  let alice: 0 | 1 = 0;
  let bob: 0 | 1 = 0;
  
  const outcomes: Array<[0 | 1, 0 | 1]> = [[0, 0], [0, 1], [1, 0], [1, 1]];
  const probArray = [probs['00'], probs['01'], probs['10'], probs['11']];
  
  for (let i = 0; i < 4; i++) {
    cumulative += probArray[i];
    if (r < cumulative) {
      [alice, bob] = outcomes[i];
      break;
    }
  }
  
  // Correlation: +1 if same, -1 if different
  const correlation = alice === bob ? 1 : -1;
  
  return {
    alice,
    bob,
    aliceAngle,
    bobAngle,
    correlation
  };
}

/**
 * Calculate joint probability distribution for measurements
 */
function calculateJointProbabilities(
  bellState: BellState,
  aliceAngle: number,
  bobAngle: number
): { '00': number; '01': number; '10': number; '11': number } {
  const a = aliceAngle;
  const b = bobAngle;
  
  // Use exact quantum mechanical formulas for Bell states
  const cosA = Math.cos(a / 2);
  const sinA = Math.sin(a / 2);
  const cosB = Math.cos(b / 2);
  const sinB = Math.sin(b / 2);
  
  let p00: number, p01: number, p10: number, p11: number;
  
  switch (bellState) {
    case 'Φ+':
      // |Φ+⟩ = (|00⟩ + |11⟩)/√2
      p00 = 0.5 * Math.pow(cosA * cosB + sinA * sinB, 2);
      p01 = 0.5 * Math.pow(cosA * sinB - sinA * cosB, 2);
      p10 = 0.5 * Math.pow(sinA * cosB - cosA * sinB, 2);
      p11 = 0.5 * Math.pow(sinA * sinB + cosA * cosB, 2);
      break;
    case 'Φ-':
      // |Φ-⟩ = (|00⟩ - |11⟩)/√2
      p00 = 0.5 * Math.pow(cosA * cosB - sinA * sinB, 2);
      p01 = 0.5 * Math.pow(cosA * sinB + sinA * cosB, 2);
      p10 = 0.5 * Math.pow(sinA * cosB + cosA * sinB, 2);
      p11 = 0.5 * Math.pow(sinA * sinB - cosA * cosB, 2);
      break;
    case 'Ψ+':
      // |Ψ+⟩ = (|01⟩ + |10⟩)/√2
      p00 = 0.5 * Math.pow(cosA * sinB + sinA * cosB, 2);
      p01 = 0.5 * Math.pow(cosA * cosB - sinA * sinB, 2);
      p10 = 0.5 * Math.pow(sinA * sinB - cosA * cosB, 2);
      p11 = 0.5 * Math.pow(sinA * cosB + cosA * sinB, 2);
      break;
    case 'Ψ-':
      // |Ψ-⟩ = (|01⟩ - |10⟩)/√2 - singlet state
      p00 = 0.5 * Math.pow(cosA * sinB - sinA * cosB, 2);
      p01 = 0.5 * Math.pow(cosA * cosB + sinA * sinB, 2);
      p10 = 0.5 * Math.pow(sinA * sinB + cosA * cosB, 2);
      p11 = 0.5 * Math.pow(sinA * cosB - cosA * sinB, 2);
      break;
    default:
      p00 = p01 = p10 = p11 = 0.25;
  }
  
  // Normalize to ensure probabilities sum to 1
  const total = p00 + p01 + p10 + p11;
  return {
    '00': p00 / total,
    '01': p01 / total,
    '10': p10 / total,
    '11': p11 / total
  };
}

/**
 * Run multiple measurements and collect statistics
 */
export function runMeasurementSeries(
  bellState: BellState,
  aliceAngle: number,
  bobAngle: number,
  numShots: number,
  baseSeed: number
): MeasurementStats {
  const outcomes = { '00': 0, '01': 0, '10': 0, '11': 0 };
  let correlationSum = 0;
  
  for (let i = 0; i < numShots; i++) {
    const result = measureEntangledPair(bellState, aliceAngle, bobAngle, baseSeed + i);
    const key = `${result.alice}${result.bob}` as keyof typeof outcomes;
    outcomes[key]++;
    correlationSum += result.correlation;
  }
  
  return {
    total: numShots,
    outcomes,
    correlation: correlationSum / numShots
  };
}

/**
 * Seeded random number generator (Mulberry32)
 */
function seededRandom(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Generate correlation curve data
 */
export function generateCorrelationCurve(
  bellState: BellState,
  aliceAngle: number,
  numPoints: number = 36
): Array<{ bobAngle: number; correlation: number }> {
  const points: Array<{ bobAngle: number; correlation: number }> = [];
  
  for (let i = 0; i <= numPoints; i++) {
    const bobAngle = (i / numPoints) * 2 * Math.PI;
    const correlation = theoreticalCorrelation(bellState, aliceAngle, bobAngle);
    points.push({ bobAngle, correlation });
  }
  
  return points;
}
