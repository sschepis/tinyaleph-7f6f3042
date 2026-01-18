/**
 * Pulsar Catalog - Real millisecond pulsars from ATNF catalog
 * All data from Australia Telescope National Facility Pulsar Catalogue
 */

import { Pulsar } from './types';

// Convert HMS to radians
function hmsToRad(h: number, m: number, s: number): number {
  return ((h + m / 60 + s / 3600) / 24) * 2 * Math.PI;
}

// Convert DMS to radians  
function dmsToRad(d: number, m: number, s: number): number {
  const sign = d >= 0 ? 1 : -1;
  return sign * ((Math.abs(d) + m / 60 + s / 3600) * Math.PI) / 180;
}

// Catalog of real millisecond pulsars from ATNF database
export const PULSAR_CATALOG: Pulsar[] = [
  // Primary timing array pulsars (most stable MSPs used in PTA experiments)
  {
    name: 'PSR J0437-4715',
    ra: hmsToRad(4, 37, 15.9),
    dec: dmsToRad(-47, 15, 9.1),
    distance: 156.3,
    period: 0.005757451936712637,
    periodDot: 5.729e-20,
    frequency: 173.688,
    epoch: 58000,
    phase0: 0,
    isActive: true,
    isReference: true
  },
  {
    name: 'PSR J1909-3744',
    ra: hmsToRad(19, 9, 47.4),
    dec: dmsToRad(-37, 44, 14.5),
    distance: 1140,
    period: 0.002947108069,
    periodDot: 1.40e-20,
    frequency: 339.316,
    epoch: 58000,
    phase0: 0,
    isActive: true,
    isReference: false
  },
  {
    name: 'PSR J1713+0747',
    ra: hmsToRad(17, 13, 49.5),
    dec: dmsToRad(7, 47, 37.5),
    distance: 1050,
    period: 0.00457013614,
    periodDot: 8.54e-21,
    frequency: 218.812,
    epoch: 58000,
    phase0: 0,
    isActive: true,
    isReference: false
  },
  {
    name: 'PSR B1937+21',
    ra: hmsToRad(19, 39, 38.6),
    dec: dmsToRad(21, 34, 59.1),
    distance: 3600,
    period: 0.001557806468819794,
    periodDot: 1.051e-19,
    frequency: 641.928,
    epoch: 58000,
    phase0: 0,
    isActive: true,
    isReference: false
  },
  {
    name: 'PSR J0030+0451',
    ra: hmsToRad(0, 30, 27.4),
    dec: dmsToRad(4, 51, 39.7),
    distance: 325,
    period: 0.004865378911,
    periodDot: 1.02e-20,
    frequency: 205.531,
    epoch: 58000,
    phase0: 0,
    isActive: true,
    isReference: false
  },
  {
    name: 'PSR J2145-0750',
    ra: hmsToRad(21, 45, 50.5),
    dec: dmsToRad(-7, 50, 18.5),
    distance: 613,
    period: 0.016052431937,
    periodDot: 2.98e-20,
    frequency: 62.296,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J1857+0943',
    ra: hmsToRad(18, 57, 36.4),
    dec: dmsToRad(9, 43, 17.2),
    distance: 910,
    period: 0.005361878847,
    periodDot: 1.78e-20,
    frequency: 186.494,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J1614-2230',
    ra: hmsToRad(16, 14, 36.5),
    dec: dmsToRad(-22, 30, 31.2),
    distance: 700,
    period: 0.003150809721,
    periodDot: 9.62e-21,
    frequency: 317.379,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J0613-0200',
    ra: hmsToRad(6, 13, 43.9),
    dec: dmsToRad(-2, 0, 47.2),
    distance: 780,
    period: 0.003061809411,
    periodDot: 9.6e-22,
    frequency: 326.601,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J1012+5307',
    ra: hmsToRad(10, 12, 33.4),
    dec: dmsToRad(53, 7, 2.6),
    distance: 840,
    period: 0.005255749014,
    periodDot: 1.71e-20,
    frequency: 190.268,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J1744-1134',
    ra: hmsToRad(17, 44, 29.4),
    dec: dmsToRad(-11, 34, 54.7),
    distance: 420,
    period: 0.004074545727,
    periodDot: 8.93e-21,
    frequency: 245.426,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J2124-3358',
    ra: hmsToRad(21, 24, 43.8),
    dec: dmsToRad(-33, 58, 44.9),
    distance: 410,
    period: 0.004931212086,
    periodDot: 2.06e-20,
    frequency: 202.794,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  // Additional notable pulsars
  {
    name: 'PSR J0737-3039A',
    ra: hmsToRad(7, 37, 51.2),
    dec: dmsToRad(-30, 39, 40.7),
    distance: 1150,
    period: 0.022699378599,
    periodDot: 1.76e-18,
    frequency: 44.054,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR B1821-24A',
    ra: hmsToRad(18, 24, 32.0),
    dec: dmsToRad(-24, 52, 10.8),
    distance: 5500,
    period: 0.003054307778,
    periodDot: 1.62e-18,
    frequency: 327.406,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J0534+2200',
    ra: hmsToRad(5, 34, 31.9),
    dec: dmsToRad(22, 0, 52.1),
    distance: 2000,
    period: 0.0334,
    periodDot: 4.21e-13,
    frequency: 29.946,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR B0833-45',
    ra: hmsToRad(8, 35, 20.6),
    dec: dmsToRad(-45, 10, 34.8),
    distance: 287,
    period: 0.089328385024,
    periodDot: 1.25e-13,
    frequency: 11.195,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J1748-2446ad',
    ra: hmsToRad(17, 48, 52.8),
    dec: dmsToRad(-24, 46, 47.3),
    distance: 7600,
    period: 0.001395949,
    periodDot: 2.4e-20,
    frequency: 716.356,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J1903+0327',
    ra: hmsToRad(19, 3, 5.8),
    dec: dmsToRad(3, 27, 19.2),
    distance: 6400,
    period: 0.002149878286,
    periodDot: 1.88e-20,
    frequency: 465.135,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J1807-2459A',
    ra: hmsToRad(18, 7, 38.5),
    dec: dmsToRad(-24, 59, 41.4),
    distance: 8400,
    period: 0.003059320797,
    periodDot: 2.32e-20,
    frequency: 326.869,
    epoch: 58000,
    phase0: 0,
    isActive: false,
    isReference: false
  },
  {
    name: 'PSR J0751+1807',
    ra: hmsToRad(7, 51, 9.2),
    dec: dmsToRad(18, 7, 38.5),
    distance: 620,
    period: 0.003478648854,
    periodDot: 7.79e-21,
    frequency: 287.458,
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
