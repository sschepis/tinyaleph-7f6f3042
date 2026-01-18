/**
 * Pulsar Catalog - Known millisecond pulsars for SRC
 */

import { Pulsar } from './types';

// Catalog of millisecond pulsars suitable for SRC timing
export const PULSAR_CATALOG: Pulsar[] = [
  // Primary reference candidates (most stable MSPs)
  {
    name: 'J0437-4715',
    ra: 1.2073,      // 04h 37m
    dec: -0.8243,    // -47° 15'
    distance: 156,
    period: 0.005757,
    periodDot: 5.73e-20,
    frequency: 173.69,
    epoch: 58000,
    phase0: 0,
    isActive: true,
    isReference: true
  },
  {
    name: 'J1909-3744',
    ra: 5.0052,
    dec: -0.6585,
    distance: 1140,
    period: 0.002947,
    periodDot: 1.4e-20,
    frequency: 339.32,
    epoch: 58000,
    phase0: 0,
    isActive: true,
    isReference: false
  },
  {
    name: 'J1713+0747',
    ra: 4.4842,
    dec: 0.1355,
    distance: 1180,
    period: 0.00457,
    periodDot: 8.5e-21,
    frequency: 218.81,
    epoch: 58000,
    phase0: 0,
    isActive: true,
    isReference: false
  },
  {
    name: 'J1939+2134',
    ra: 5.1216,
    dec: 0.3729,
    distance: 3600,
    period: 0.001558,
    periodDot: 1.05e-19,
    frequency: 641.93,
    epoch: 58000,
    phase0: 0,
    isActive: true,
    isReference: false
  },
  {
    name: 'J0030+0451',
    ra: 0.1328,
    dec: 0.0843,
    distance: 300,
    period: 0.004865,
    periodDot: 1.0e-20,
    frequency: 205.53,
    epoch: 58000,
    phase0: 0,
    isActive: true,
    isReference: false
  },
  {
    name: 'J2145-0750',
    ra: 5.6197,
    dec: -0.1379,
    distance: 500,
    period: 0.016052,
    periodDot: 2.98e-20,
    frequency: 62.30,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'J1857+0943',
    ra: 4.9288,
    dec: 0.1682,
    distance: 900,
    period: 0.005362,
    periodDot: 1.78e-20,
    frequency: 186.49,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'J1614-2230',
    ra: 4.2143,
    dec: -0.3903,
    distance: 700,
    period: 0.003151,
    periodDot: 9.6e-21,
    frequency: 317.36,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'J0613-0200',
    ra: 1.6119,
    dec: -0.0349,
    distance: 780,
    period: 0.003062,
    periodDot: 9.6e-22,
    frequency: 326.60,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'J1012+5307',
    ra: 2.6477,
    dec: 0.9277,
    distance: 840,
    period: 0.005256,
    periodDot: 1.71e-20,
    frequency: 190.27,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'J1744-1134',
    ra: 4.5764,
    dec: -0.1983,
    distance: 420,
    period: 0.004075,
    periodDot: 8.9e-21,
    frequency: 245.40,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'J2124-3358',
    ra: 5.5394,
    dec: -0.5882,
    distance: 410,
    period: 0.004931,
    periodDot: 2.06e-20,
    frequency: 202.80,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  }
];

// Get the default reference pulsar
export function getReferencePulsar(): Pulsar {
  return PULSAR_CATALOG.find(p => p.isReference) || PULSAR_CATALOG[0];
}

// Get all active pulsars
export function getActivePulsars(): Pulsar[] {
  return PULSAR_CATALOG.filter(p => p.isActive);
}

// Get pulsar by name
export function getPulsarByName(name: string): Pulsar | undefined {
  return PULSAR_CATALOG.find(p => p.name === name);
}

// Convert equatorial to galactic coordinates (simplified)
export function equatorialToGalactic(ra: number, dec: number, distance: number): {
  x: number;
  y: number;
  z: number;
} {
  // North Galactic Pole: RA = 192.25°, Dec = 27.4°
  // Galactic center: RA = 266.4°, Dec = -28.9°
  
  const l0 = 1.681; // RA of ascending node
  const d0 = 0.478; // Dec of NGP
  
  // Convert to galactic longitude/latitude (simplified)
  const sinB = Math.sin(dec) * Math.sin(d0) + 
               Math.cos(dec) * Math.cos(d0) * Math.cos(ra - l0);
  const b = Math.asin(sinB);
  
  const cosL = (Math.sin(dec) - sinB * Math.sin(d0)) / 
               (Math.cos(b) * Math.cos(d0));
  const sinL = Math.cos(dec) * Math.sin(ra - l0) / Math.cos(b);
  const l = Math.atan2(sinL, cosL) + Math.PI / 3; // Offset to galactic center
  
  // Convert to Cartesian
  const distKpc = distance / 1000;
  return {
    x: distKpc * Math.cos(b) * Math.cos(l),
    y: distKpc * Math.cos(b) * Math.sin(l),
    z: distKpc * Math.sin(b)
  };
}

// Split primes for semantic mapping (p ≡ 1 mod 12)
export const SPLIT_PRIMES = [
  13, 37, 61, 73, 97, 109, 157, 181, 193, 229,
  241, 277, 313, 337, 349, 373, 397, 409, 421, 433
];

// Check if a number is a split prime
export function isSplitPrime(n: number): boolean {
  if (n < 2) return false;
  if (n % 12 !== 1) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

// Default semantic map (primes -> mathematical/universal meanings)
export const DEFAULT_SEMANTIC_MAP = [
  { prime: 13, meaning: 'existence', category: 'ontology' },
  { prime: 37, meaning: 'observation', category: 'epistemology' },
  { prime: 61, meaning: 'intelligence', category: 'cognition' },
  { prime: 73, meaning: 'communication', category: 'interaction' },
  { prime: 97, meaning: 'structure', category: 'mathematics' },
  { prime: 109, meaning: 'causation', category: 'physics' },
  { prime: 157, meaning: 'time', category: 'physics' },
  { prime: 181, meaning: 'space', category: 'physics' },
  { prime: 193, meaning: 'pattern', category: 'mathematics' },
  { prime: 229, meaning: 'recursion', category: 'computation' },
  { prime: 241, meaning: 'emergence', category: 'complexity' },
  { prime: 277, meaning: 'symmetry', category: 'mathematics' },
  { prime: 313, meaning: 'resonance', category: 'physics' },
  { prime: 337, meaning: 'harmony', category: 'aesthetics' },
  { prime: 349, meaning: 'unity', category: 'metaphysics' },
  { prime: 373, meaning: 'plurality', category: 'metaphysics' },
  { prime: 397, meaning: 'boundary', category: 'topology' },
  { prime: 409, meaning: 'continuity', category: 'mathematics' },
  { prime: 421, meaning: 'transformation', category: 'dynamics' },
  { prime: 433, meaning: 'conservation', category: 'physics' }
];
