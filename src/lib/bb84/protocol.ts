// BB84 Protocol Simulation Engine

import { Basis, Bit, TransmittedPhoton, BB84State, SECURITY_THRESHOLD } from './types';

// Seeded random number generator for reproducibility
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function randomBit(rng: () => number): Bit {
  return rng() < 0.5 ? 0 : 1;
}

function randomBasis(rng: () => number): Basis {
  return rng() < 0.5 ? 'rectilinear' : 'diagonal';
}

/**
 * Simulate Eve's interception
 * When Eve measures, she disturbs the quantum state if she chose the wrong basis
 */
function eveIntercept(
  aliceBit: Bit,
  aliceBasis: Basis,
  rng: () => number
): { eveBit: Bit; eveBasis: Basis; stateDisturbed: boolean } {
  const eveBasis = randomBasis(rng);
  
  if (eveBasis === aliceBasis) {
    // Eve measured in correct basis - gets correct bit, no disturbance
    return { eveBit: aliceBit, eveBasis, stateDisturbed: false };
  } else {
    // Wrong basis - 50% chance of getting wrong bit, state is re-prepared in Eve's basis
    const eveBit = randomBit(rng);
    return { eveBit, eveBasis, stateDisturbed: true };
  }
}

/**
 * Bob's measurement
 * If bases match: deterministic result
 * If bases don't match: random result (50/50)
 */
function bobMeasure(
  incomingBit: Bit,
  incomingBasis: Basis,
  bobBasis: Basis,
  rng: () => number
): Bit {
  if (bobBasis === incomingBasis) {
    return incomingBit;
  } else {
    // Measurement in wrong basis gives random result
    return randomBit(rng);
  }
}

/**
 * Run the BB84 protocol simulation
 */
export function runBB84Protocol(
  keyLength: number,
  evePresent: boolean,
  eveInterceptionRate: number,
  seed: number = Date.now()
): BB84State {
  const rng = seededRandom(seed);
  const photons: TransmittedPhoton[] = [];
  
  // We need to transmit more photons than desired key length
  // because ~50% will be discarded due to basis mismatch
  const transmissionCount = Math.ceil(keyLength * 2.5);
  
  for (let i = 0; i < transmissionCount; i++) {
    // Alice's preparation
    const aliceBit = randomBit(rng);
    const aliceBasis = randomBasis(rng);
    
    // Eve's potential interception
    let currentBit = aliceBit;
    let currentBasis = aliceBasis;
    let intercepted = false;
    let eveIntroducedError = false;
    
    if (evePresent && rng() < eveInterceptionRate) {
      const eveResult = eveIntercept(aliceBit, aliceBasis, rng);
      intercepted = true;
      
      // Eve re-prepares the photon with her measurement result
      currentBit = eveResult.eveBit;
      currentBasis = eveResult.eveBasis;
      eveIntroducedError = eveResult.stateDisturbed;
    }
    
    // Bob's measurement
    const bobBasis = randomBasis(rng);
    const bobMeasurement = bobMeasure(currentBit, currentBasis, bobBasis, rng);
    const basisMatch = aliceBasis === bobBasis;
    
    photons.push({
      index: i,
      aliceBit,
      aliceBasis,
      bobBasis,
      bobMeasurement,
      basisMatch,
      intercepted,
      eveIntroducedError
    });
  }
  
  // Sifting: keep only bits where bases matched
  const matchingPhotons = photons.filter(p => p.basisMatch);
  const siftedKeyAlice = matchingPhotons.map(p => p.aliceBit);
  const siftedKeyBob = matchingPhotons.map(p => p.bobMeasurement);
  
  // Error estimation: compare a sample of the sifted key
  const sampleSize = Math.min(Math.floor(siftedKeyAlice.length * 0.2), 20);
  let errors = 0;
  for (let i = 0; i < sampleSize; i++) {
    if (siftedKeyAlice[i] !== siftedKeyBob[i]) {
      errors++;
    }
  }
  const errorRate = sampleSize > 0 ? errors / sampleSize : 0;
  
  // Security check
  const secureKeyEstablished = errorRate < SECURITY_THRESHOLD && siftedKeyAlice.length >= keyLength;
  
  return {
    keyLength,
    evePresent,
    eveInterceptionRate,
    photons,
    siftedKeyAlice: siftedKeyAlice.slice(0, keyLength),
    siftedKeyBob: siftedKeyBob.slice(0, keyLength),
    errorRate,
    secureKeyEstablished,
    phase: 'complete'
  };
}

/**
 * Calculate theoretical error rate when Eve intercepts
 * If Eve intercepts with rate p, she introduces errors with probability:
 * - She gets wrong basis 50% of time
 * - When wrong basis, 50% chance of introducing error when Bob matches Alice's basis
 * Overall: p * 0.5 * 0.5 = p * 0.25
 */
export function theoreticalErrorRate(eveInterceptionRate: number): number {
  return eveInterceptionRate * 0.25;
}

/**
 * Format key as hex string
 */
export function formatKeyAsHex(bits: Bit[]): string {
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    const nibble = bits.slice(i, i + 4);
    const value = nibble.reduce((acc, bit, idx) => acc + (bit << (3 - idx)), 0);
    hex += value.toString(16).toUpperCase();
  }
  return hex;
}

/**
 * Compare two keys and return matching percentage
 */
export function keyMatchPercentage(key1: Bit[], key2: Bit[]): number {
  if (key1.length === 0) return 0;
  let matches = 0;
  for (let i = 0; i < Math.min(key1.length, key2.length); i++) {
    if (key1[i] === key2[i]) matches++;
  }
  return (matches / key1.length) * 100;
}
