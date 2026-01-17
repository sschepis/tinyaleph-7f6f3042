// CHSH Inequality Testing

import { BellState, CHSHResult } from './types';
import { theoreticalCorrelation, runMeasurementSeries } from './bell-states';

/**
 * Classical bound for CHSH inequality: |S| ≤ 2
 */
export const CLASSICAL_BOUND = 2;

/**
 * Quantum bound (Tsirelson bound): |S| ≤ 2√2 ≈ 2.828
 */
export const QUANTUM_BOUND = 2 * Math.sqrt(2);

/**
 * Optimal angles for maximum CHSH violation
 * These angles give S = 2√2 for the Φ+ state
 */
export const OPTIMAL_ANGLES = {
  a: 0,                    // Alice's first measurement: 0°
  a_prime: Math.PI / 2,    // Alice's second measurement: 90°
  b: Math.PI / 4,          // Bob's first measurement: 45°
  b_prime: 3 * Math.PI / 4 // Bob's second measurement: 135°
};

/**
 * Calculate theoretical CHSH value
 * S = E(a,b) - E(a,b') + E(a',b) + E(a',b')
 */
export function calculateTheoreticalCHSH(
  bellState: BellState,
  angles: { a: number; a_prime: number; b: number; b_prime: number }
): CHSHResult {
  const E_ab = theoreticalCorrelation(bellState, angles.a, angles.b);
  const E_ab_prime = theoreticalCorrelation(bellState, angles.a, angles.b_prime);
  const E_a_prime_b = theoreticalCorrelation(bellState, angles.a_prime, angles.b);
  const E_a_prime_b_prime = theoreticalCorrelation(bellState, angles.a_prime, angles.b_prime);
  
  const S = E_ab - E_ab_prime + E_a_prime_b + E_a_prime_b_prime;
  
  return {
    S,
    classicalBound: CLASSICAL_BOUND,
    quantumBound: QUANTUM_BOUND,
    violation: Math.abs(S) > CLASSICAL_BOUND,
    correlations: {
      E_ab,
      E_ab_prime,
      E_a_prime_b,
      E_a_prime_b_prime
    },
    angles
  };
}

/**
 * Run experimental CHSH test with simulated measurements
 */
export function runCHSHExperiment(
  bellState: BellState,
  angles: { a: number; a_prime: number; b: number; b_prime: number },
  shotsPerSetting: number,
  baseSeed: number
): CHSHResult {
  // Run measurements for each angle combination
  const stats_ab = runMeasurementSeries(bellState, angles.a, angles.b, shotsPerSetting, baseSeed);
  const stats_ab_prime = runMeasurementSeries(bellState, angles.a, angles.b_prime, shotsPerSetting, baseSeed + shotsPerSetting);
  const stats_a_prime_b = runMeasurementSeries(bellState, angles.a_prime, angles.b, shotsPerSetting, baseSeed + 2 * shotsPerSetting);
  const stats_a_prime_b_prime = runMeasurementSeries(bellState, angles.a_prime, angles.b_prime, shotsPerSetting, baseSeed + 3 * shotsPerSetting);
  
  const E_ab = stats_ab.correlation;
  const E_ab_prime = stats_ab_prime.correlation;
  const E_a_prime_b = stats_a_prime_b.correlation;
  const E_a_prime_b_prime = stats_a_prime_b_prime.correlation;
  
  const S = E_ab - E_ab_prime + E_a_prime_b + E_a_prime_b_prime;
  
  return {
    S,
    classicalBound: CLASSICAL_BOUND,
    quantumBound: QUANTUM_BOUND,
    violation: Math.abs(S) > CLASSICAL_BOUND,
    correlations: {
      E_ab,
      E_ab_prime,
      E_a_prime_b,
      E_a_prime_b_prime
    },
    angles
  };
}

/**
 * Generate CHSH value as function of one angle
 * Useful for visualization
 */
export function generateCHSHCurve(
  bellState: BellState,
  varyingAngle: 'a' | 'a_prime' | 'b' | 'b_prime',
  fixedAngles: Partial<{ a: number; a_prime: number; b: number; b_prime: number }>,
  numPoints: number = 36
): Array<{ angle: number; S: number }> {
  const points: Array<{ angle: number; S: number }> = [];
  
  const baseAngles = { ...OPTIMAL_ANGLES, ...fixedAngles };
  
  for (let i = 0; i <= numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const angles = { ...baseAngles, [varyingAngle]: angle };
    const result = calculateTheoreticalCHSH(bellState, angles);
    points.push({ angle, S: result.S });
  }
  
  return points;
}

/**
 * Explain violation in plain terms
 */
export function explainViolation(result: CHSHResult): string {
  const absS = Math.abs(result.S);
  
  if (!result.violation) {
    return `No violation detected (|S| = ${absS.toFixed(3)} ≤ 2). The correlations could be explained by local hidden variables.`;
  }
  
  const violationPercent = ((absS - CLASSICAL_BOUND) / CLASSICAL_BOUND * 100).toFixed(1);
  const ofQuantumMax = (absS / QUANTUM_BOUND * 100).toFixed(1);
  
  return `Bell inequality violated! |S| = ${absS.toFixed(3)} exceeds classical bound by ${violationPercent}%. ` +
    `This is ${ofQuantumMax}% of the maximum quantum value (2√2 ≈ 2.828). ` +
    `No local hidden variable theory can explain these correlations.`;
}
