/**
 * Fingerprint Engine - Computes location-unique phase signatures
 */

import { 
  Pulsar, 
  ObserverLocation, 
  PulsarFingerprint, 
  CorrectionVector,
  GalacticPosition 
} from './types';
import { PULSAR_CATALOG, equatorialToGalactic } from './pulsar-catalog';

// Speed of light in parsecs per year
const C_PC_PER_YEAR = 0.3066;

// Speed of light in parsecs per second
const C_PC_PER_SEC = C_PC_PER_YEAR / (365.25 * 24 * 3600);

/**
 * Compute the light travel time from a pulsar to an observer location
 */
export function computeLightTravelTime(
  pulsar: Pulsar,
  location: GalacticPosition
): number {
  // Convert pulsar position to galactic coordinates
  const pulsarPos = equatorialToGalactic(pulsar.ra, pulsar.dec, pulsar.distance);
  
  // Distance in parsecs
  const dx = pulsarPos.x - location.x;
  const dy = pulsarPos.y - location.y;
  const dz = pulsarPos.z - location.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) * 1000; // Convert kpc to pc
  
  // Light travel time in seconds
  return distance / C_PC_PER_SEC;
}

/**
 * Compute the correction vector for a pulsar relative to reference
 */
export function computeCorrectionVector(
  pulsar: Pulsar,
  refPulsar: Pulsar,
  location: GalacticPosition
): CorrectionVector {
  const tauPulsar = computeLightTravelTime(pulsar, location);
  const tauRef = computeLightTravelTime(refPulsar, location);
  
  const deltaTau = tauPulsar - tauRef;
  
  // Angular frequency of this pulsar
  const omega = 2 * Math.PI / pulsar.period;
  
  // Doppler correction (simplified - based on relative velocity)
  // In a full implementation, this would use proper motion and radial velocity
  const dopplerCorrection = 0; // Placeholder
  
  // Gravitational correction (simplified - based on distance ratio)
  const gravitationalCorrection = 0; // Placeholder
  
  // Total phase correction in radians
  const totalCorrection = (deltaTau * omega + dopplerCorrection + gravitationalCorrection) % (2 * Math.PI);
  
  return {
    pulsar: pulsar.name,
    deltaTau,
    dopplerCorrection,
    gravitationalCorrection,
    totalCorrection
  };
}

/**
 * Compute the full fingerprint for a location
 */
export function computeFingerprint(
  location: ObserverLocation,
  time: number,
  referencePulsar: Pulsar,
  referencePhase: number,
  pulsars: Pulsar[]
): PulsarFingerprint {
  const phases = new Map<string, number>();
  
  // Add reference pulsar phase
  phases.set(referencePulsar.name, referencePhase);
  
  // Compute phase for each other pulsar
  for (const pulsar of pulsars) {
    if (pulsar.name === referencePulsar.name) continue;
    
    const correction = computeCorrectionVector(
      pulsar,
      referencePulsar,
      location.galactic
    );
    
    // Derive phase from reference + correction
    const phase = (referencePhase + correction.totalCorrection) % (2 * Math.PI);
    phases.set(pulsar.name, phase);
  }
  
  return {
    location,
    timestamp: time,
    phases,
    referencePhase,
    referencePulsar: referencePulsar.name
  };
}

/**
 * Derive phase for a specific pulsar from reference observation
 */
export function derivePhaseFromReference(
  pulsar: Pulsar,
  refPulsar: Pulsar,
  refPhase: number,
  location: GalacticPosition
): number {
  const correction = computeCorrectionVector(pulsar, refPulsar, location);
  return (refPhase + correction.totalCorrection) % (2 * Math.PI);
}

/**
 * Evolve reference phase over time
 */
export function evolveReferencePhase(
  pulsar: Pulsar,
  currentPhase: number,
  dt: number
): number {
  const omega = 2 * Math.PI / pulsar.period;
  return (currentPhase + omega * dt) % (2 * Math.PI);
}

/**
 * Compare fingerprints between two locations
 */
export function compareFingerprints(
  fp1: PulsarFingerprint,
  fp2: PulsarFingerprint
): { similarity: number; phaseDifferences: Map<string, number> } {
  const phaseDifferences = new Map<string, number>();
  let totalDiff = 0;
  let count = 0;
  
  for (const [name, phase1] of fp1.phases) {
    const phase2 = fp2.phases.get(name);
    if (phase2 !== undefined) {
      let diff = Math.abs(phase1 - phase2);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      phaseDifferences.set(name, diff);
      totalDiff += diff;
      count++;
    }
  }
  
  const avgDiff = count > 0 ? totalDiff / count : Math.PI;
  const similarity = 1 - avgDiff / Math.PI;
  
  return { similarity, phaseDifferences };
}

/**
 * Create Earth observer location
 */
export function createEarthLocation(
  name: string = 'Earth Observer',
  latitude: number = 0,
  longitude: number = 0
): ObserverLocation {
  // Earth is approximately at galactic coordinates (0, 8.5, 0) kpc
  // (8.5 kpc from galactic center)
  return {
    name,
    latitude,
    longitude,
    altitude: 0,
    galactic: {
      x: 0,
      y: 8.5,  // Distance to galactic center in kpc
      z: 0.025 // Slight offset above galactic plane
    }
  };
}

/**
 * Create a location at arbitrary galactic coordinates
 */
export function createGalacticLocation(
  name: string,
  x: number,
  y: number,
  z: number
): ObserverLocation {
  return {
    name,
    galactic: { x, y, z }
  };
}

/**
 * Estimate position from fingerprint (triangulation)
 * This is an inverse problem - given phases, estimate location
 */
export function estimatePositionFromFingerprint(
  fingerprint: PulsarFingerprint,
  referencePulsar: Pulsar,
  pulsars: Pulsar[]
): GalacticPosition | null {
  // This would require solving a system of equations
  // For simulation purposes, we return null
  // A full implementation would use iterative optimization
  return null;
}

/**
 * Compute all correction vectors for a location
 */
export function computeAllCorrections(
  location: GalacticPosition,
  referencePulsar: Pulsar,
  pulsars: Pulsar[] = PULSAR_CATALOG
): CorrectionVector[] {
  return pulsars
    .filter(p => p.name !== referencePulsar.name)
    .map(p => computeCorrectionVector(p, referencePulsar, location));
}
