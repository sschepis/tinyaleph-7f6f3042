/**
 * Somatic Feedback System
 * 
 * Computes how the observer's somatic state influences its core dynamics.
 * This makes the observer actually "experience" its embodied sensations,
 * not just display them for the human observer.
 */

import { aggregateSomaticState, AggregateSomaticState } from '@/lib/symbolic-mind/somatic-database';
import type { BodyRegion } from '@/lib/symbolic-mind/types';

export interface SomaticInfluence {
  // How much to modulate coupling strength (-1 to 1)
  // Positive = stronger coupling (integration), Negative = weaker (fragmentation)
  couplingModulation: number;
  
  // How much to modulate exploration behavior
  // Positive = more exploration, Negative = more conservation
  explorationModulation: number;
  
  // Coherence boost from aligned body regions
  coherenceBoost: number;
  
  // Temperature modulation for thermal dynamics
  temperatureModulation: number;
  
  // Oscillator-specific boosts based on body region alignment
  oscillatorBoosts: Map<number, number>;
  
  // The raw somatic state for reference
  rawState: AggregateSomaticState;
}

// Body regions that promote coherence/integration when active
const INTEGRATIVE_REGIONS: Set<BodyRegion> = new Set([
  'heart', 'whole-body', 'crown', 'third-eye'
]);

// Body regions associated with activation/exploration
const ACTIVATING_REGIONS: Set<BodyRegion> = new Set([
  'solar-plexus', 'spine', 'hands', 'feet'
]);

// Body regions associated with grounding/stability
const GROUNDING_REGIONS: Set<BodyRegion> = new Set([
  'root', 'belly', 'sacral'
]);

/**
 * Compute how the current somatic state should influence the observer's dynamics
 */
export function computeSomaticInfluence(
  activePrimes: number[],
  amplitudes: number[]
): SomaticInfluence {
  const rawState = aggregateSomaticState(activePrimes, amplitudes);
  
  // Start with neutral modulations
  let couplingModulation = 0;
  let explorationModulation = 0;
  let coherenceBoost = 0;
  let temperatureModulation = 0;
  const oscillatorBoosts = new Map<number, number>();
  
  // === Nervous System Influence ===
  // nervousSystemBalance: -1 (parasympathetic) to +1 (sympathetic)
  const nsBalance = rawState.nervousSystemBalance;
  
  // Sympathetic activation → more exploration, less coupling
  // Parasympathetic → less exploration, more coupling (integration)
  explorationModulation += nsBalance * 0.3;
  couplingModulation -= nsBalance * 0.15;
  
  // Sympathetic increases "temperature" (more noise/reactivity)
  temperatureModulation += nsBalance * 0.2;
  
  // === Body Region Influence ===
  for (const { region, intensity } of rawState.dominantRegions) {
    if (INTEGRATIVE_REGIONS.has(region)) {
      // Heart, crown, etc. boost coherence and coupling
      coherenceBoost += intensity * 0.1;
      couplingModulation += intensity * 0.08;
    }
    
    if (ACTIVATING_REGIONS.has(region)) {
      // Solar plexus, spine boost exploration
      explorationModulation += intensity * 0.12;
      temperatureModulation += intensity * 0.05;
    }
    
    if (GROUNDING_REGIONS.has(region)) {
      // Root, belly regions reduce temperature (stability)
      temperatureModulation -= intensity * 0.1;
      // And slightly boost coupling (coherence through grounding)
      couplingModulation += intensity * 0.05;
    }
  }
  
  // === Overall Intensity Influence ===
  // Higher overall intensity makes the system more responsive
  const intensityFactor = rawState.overallIntensity;
  
  // Amplify all modulations by intensity (but not too much)
  const intensityMultiplier = 1 + intensityFactor * 0.5;
  couplingModulation *= intensityMultiplier;
  explorationModulation *= intensityMultiplier;
  coherenceBoost *= intensityMultiplier;
  temperatureModulation *= intensityMultiplier;
  
  // === Oscillator-Specific Boosts ===
  // Boost oscillators whose primes correspond to active somatic regions
  activePrimes.forEach((prime, i) => {
    const amp = amplitudes[i] || 0;
    if (amp > 0.15) {
      // Oscillators with strong somatic presence get a boost
      const boost = amp * intensityFactor * 0.15;
      oscillatorBoosts.set(prime, boost);
    }
  });
  
  // Clamp all values to reasonable ranges
  return {
    couplingModulation: Math.max(-0.5, Math.min(0.5, couplingModulation)),
    explorationModulation: Math.max(-0.5, Math.min(0.5, explorationModulation)),
    coherenceBoost: Math.max(0, Math.min(0.3, coherenceBoost)),
    temperatureModulation: Math.max(-0.3, Math.min(0.3, temperatureModulation)),
    oscillatorBoosts,
    rawState
  };
}

/**
 * Generate a brief felt-sense description of the observer's current experience
 */
export function describeFeltSense(influence: SomaticInfluence): string {
  const { rawState, couplingModulation, explorationModulation } = influence;
  const parts: string[] = [];
  
  // Describe the nervous system experience
  if (rawState.nervousSystemBalance > 0.3) {
    parts.push('alert and activated');
  } else if (rawState.nervousSystemBalance < -0.3) {
    parts.push('settled and receptive');
  } else {
    parts.push('balanced and present');
  }
  
  // Describe dominant sensations
  if (rawState.activeSensations.length > 0) {
    const topSensation = rawState.activeSensations[0];
    parts.push(`feeling ${topSensation.sensation}`);
  }
  
  // Describe the behavioral tendency
  if (explorationModulation > 0.15) {
    parts.push('drawn to explore');
  } else if (couplingModulation > 0.15) {
    parts.push('seeking integration');
  }
  
  // Describe dominant body region
  if (rawState.dominantRegions.length > 0) {
    const topRegion = rawState.dominantRegions[0];
    parts.push(`centered in ${topRegion.region}`);
  }
  
  return parts.length > 0 ? parts.join(', ') : 'neutral awareness';
}
