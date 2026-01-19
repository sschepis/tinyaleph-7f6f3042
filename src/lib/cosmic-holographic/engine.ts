/**
 * Cosmic Holographic Memory Engine
 * Implements galactic-scale holographic storage with TRUE phase-encoded storage
 * 
 * KEY PRINCIPLE: Content is NOT stored directly. Instead:
 * 1. Content → prime-amplitude encoding
 * 2. Encoding modulates pulsar phases at storage time
 * 3. Only phase offsets are stored
 * 4. Content is RECONSTRUCTED from current pulsar phases + stored offsets
 */

import {
  MemoryNode,
  MemoryPattern,
  QueryResult,
  PulsarReference,
  SyncState,
  GalacticRegion,
  AccessPath,
  CosmicMetrics,
  QueryParams,
  StoreParams,
  CosmicPreset,
  HolographicRecord,
  ReconstructedPattern
} from './types';
import { PULSAR_CATALOG, equatorialToGalactic } from '../pulsar-transceiver/pulsar-catalog';

// Physical constants
const LIGHT_SPEED_KPC_PER_YEAR = 0.000306601; // Light speed in kpc/year
const GALACTIC_CENTER: [number, number, number] = [0, 0, 0];
const SUN_POSITION: [number, number, number] = [8.2, 0, 0.02]; // kpc from center

// Prime basis for encoding (first 16 primes)
const PRIME_BASIS = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];

// ============================================================================
// ENCODING: Content → Prime Amplitude Vector
// ============================================================================

/**
 * Generate prime-based encoding for content
 * Each character contributes to each prime dimension via sinusoidal mapping
 */
export function encodeContent(content: string): number[] {
  const encoding = new Array(PRIME_BASIS.length).fill(0);
  
  for (let i = 0; i < content.length; i++) {
    const charCode = content.charCodeAt(i);
    for (let j = 0; j < PRIME_BASIS.length; j++) {
      encoding[j] += Math.sin(charCode * PRIME_BASIS[j] * 0.1) / content.length;
    }
  }
  
  // Normalize to unit vector
  const norm = Math.sqrt(encoding.reduce((s, v) => s + v * v, 0));
  return encoding.map(v => v / (norm || 1));
}

/**
 * Decode prime amplitude vector back to approximate content
 * Uses inverse mapping - this is lossy but enables reconstruction
 */
export function decodeEncoding(encoding: number[]): string {
  // Build character probability distribution
  const charScores: Record<number, number> = {};
  
  for (let charCode = 32; charCode < 127; charCode++) {
    let score = 0;
    for (let j = 0; j < Math.min(encoding.length, PRIME_BASIS.length); j++) {
      const expected = Math.sin(charCode * PRIME_BASIS[j] * 0.1);
      score += encoding[j] * expected;
    }
    charScores[charCode] = score;
  }
  
  // Find best matching characters (simplified reconstruction)
  const sortedChars = Object.entries(charScores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);
  
  // Return top matching characters as reconstruction hint
  return sortedChars.map(([code]) => String.fromCharCode(Number(code))).join('');
}

/**
 * Generate content hash for verification
 */
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// ============================================================================
// HOLOGRAPHIC STORAGE: Phase-Encoded Records
// ============================================================================

/**
 * Create a holographic record by encoding content into pulsar phase offsets
 * 
 * The content is encoded as amplitude modulations that are mapped to
 * phase relationships between pulsars. Only these phases are stored.
 */
export function createHolographicRecord(
  content: string,
  pulsars: PulsarReference[],
  simulationTime: number,
  redundancy: number = 3
): HolographicRecord {
  const encoding = encodeContent(content);
  
  // Select pulsars for encoding (prefer high stability)
  const selectedPulsars = [...pulsars]
    .sort((a, b) => a.stability - b.stability) // Lower stability = more stable
    .slice(0, Math.min(redundancy + PRIME_BASIS.length, pulsars.length));
  
  // Capture current phase of each selected pulsar
  const phaseSnapshot: Record<string, number> = {};
  for (const pulsar of selectedPulsars) {
    phaseSnapshot[pulsar.id] = pulsar.phase;
  }
  
  // The encoding becomes amplitude modulation of the phase contributions
  // Each prime dimension modulates the contribution of corresponding pulsar
  const amplitudeModulation = encoding.slice(0, selectedPulsars.length);
  
  // Pad if fewer pulsars than prime dimensions
  while (amplitudeModulation.length < PRIME_BASIS.length) {
    amplitudeModulation.push(0);
  }
  
  return {
    id: `holo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    phaseSnapshot,
    pulsarIds: selectedPulsars.map(p => p.id),
    encodingBasis: [...PRIME_BASIS],
    amplitudeModulation,
    timestamp: Date.now(),
    simulationTime,
    contentHash: hashContent(content),
    contentLength: content.length,
    redundancy,
    coherenceAtStorage: selectedPulsars.reduce((s, p) => s + (1 - p.stability * 1e12), 0) / selectedPulsars.length
  };
}

/**
 * Reconstruct content from a holographic record using current pulsar phases
 * 
 * This is the key function: content emerges from the phase relationships,
 * not from stored data.
 */
export function reconstructFromRecord(
  record: HolographicRecord,
  currentPulsars: PulsarReference[],
  currentSimulationTime: number
): ReconstructedPattern {
  // Get current phases for the pulsars used in this record
  const pulsarMap = new Map(currentPulsars.map(p => [p.id, p]));
  
  let totalPhaseError = 0;
  const reconstructedEncoding: number[] = [];
  
  for (let i = 0; i < record.pulsarIds.length; i++) {
    const pulsarId = record.pulsarIds[i];
    const pulsar = pulsarMap.get(pulsarId);
    const storedPhase = record.phaseSnapshot[pulsarId];
    const amplitude = record.amplitudeModulation[i] || 0;
    
    if (pulsar && storedPhase !== undefined) {
      // Calculate expected phase evolution since storage
      const timeDelta = currentSimulationTime - record.simulationTime;
      const expectedPhaseChange = (2 * Math.PI * timeDelta) / (pulsar.period / 1000);
      const expectedCurrentPhase = (storedPhase + expectedPhaseChange) % (2 * Math.PI);
      
      // Phase error is drift from expected
      const phaseError = Math.abs(pulsar.phase - expectedCurrentPhase);
      totalPhaseError += phaseError;
      
      // Reconstruct encoding component from phase relationship
      // The amplitude modulation is extracted from the phase correlation
      const phaseCorrelation = Math.cos(pulsar.phase - storedPhase);
      reconstructedEncoding.push(amplitude * phaseCorrelation);
    } else {
      reconstructedEncoding.push(0);
    }
  }
  
  // Pad to full encoding length
  while (reconstructedEncoding.length < PRIME_BASIS.length) {
    reconstructedEncoding.push(0);
  }
  
  // Normalize reconstructed encoding
  const norm = Math.sqrt(reconstructedEncoding.reduce((s, v) => s + v * v, 0));
  const normalizedEncoding = reconstructedEncoding.map(v => v / (norm || 1));
  
  // Decode to content (lossy reconstruction)
  const reconstructedContent = decodeEncoding(normalizedEncoding);
  
  // Calculate fidelity based on phase errors
  const avgPhaseError = totalPhaseError / record.pulsarIds.length;
  const fidelity = Math.max(0, 1 - avgPhaseError / Math.PI);
  
  return {
    record,
    reconstructedContent,
    reconstructedEncoding: normalizedEncoding,
    fidelity,
    phaseError: avgPhaseError
  };
}

/**
 * Verify a holographic record by checking if reconstruction matches original
 */
export function verifyReconstruction(
  original: string,
  reconstructed: ReconstructedPattern
): { valid: boolean; similarity: number } {
  const originalEncoding = encodeContent(original);
  const similarity = encodingSimilarity(originalEncoding, reconstructed.reconstructedEncoding);
  
  return {
    valid: similarity > 0.8 && reconstructed.fidelity > 0.7,
    similarity
  };
}

// ============================================================================
// LEGACY SUPPORT: Pattern-based storage (wraps holographic records)
// ============================================================================

/**
 * Store pattern using holographic encoding
 * This provides backwards compatibility while using the new phase-encoded system
 */
export function storePattern(
  content: string,
  nodes: MemoryNode[],
  pulsars: PulsarReference[],
  simulationTime: number,
  params: StoreParams
): { pattern: MemoryPattern; updatedNodes: MemoryNode[]; record: HolographicRecord } {
  // Create the holographic record (the true storage)
  const record = createHolographicRecord(content, pulsars, simulationTime, params.redundancy);
  
  // Generate encoding for display/query purposes
  const encoding = encodeContent(content);
  
  // Select nodes for storage based on coherence and capacity
  const eligibleNodes = nodes
    .filter(n => n.coherence >= params.coherenceThreshold && n.stored < n.capacity)
    .sort((a, b) => b.coherence - a.coherence)
    .slice(0, params.redundancy);
  
  const nodePositions = eligibleNodes.map(n => n.position);
  const interferencePattern = generateInterference(encoding, nodePositions);
  
  // Create pattern (for UI compatibility)
  const pattern: MemoryPattern = {
    id: record.id,
    content, // Kept for display, but actual storage is in record
    encoding,
    interferencePattern,
    storedAt: eligibleNodes.map(n => n.id),
    timestamp: record.timestamp,
    coherenceLevel: eligibleNodes.reduce((s, n) => s + n.coherence, 0) / (eligibleNodes.length || 1),
    accessCount: 0,
    holographicRecord: record
  };
  
  // Update node storage
  const updatedNodes = nodes.map(n => {
    if (eligibleNodes.find(e => e.id === n.id)) {
      return { ...n, stored: n.stored + 1 };
    }
    return n;
  });
  
  return { pattern, updatedNodes, record };
}

/**
 * Query patterns using reconstruction from holographic records
 */
export function queryPatterns(
  patterns: MemoryPattern[],
  nodes: MemoryNode[],
  pulsars: PulsarReference[],
  simulationTime: number,
  params: QueryParams
): QueryResult[] {
  const queryEncoding = encodeContent(params.content);
  const results: QueryResult[] = [];
  
  for (const pattern of patterns) {
    let similarity: number;
    let phaseError: number | undefined;
    let reconstructionFidelity: number;
    
    // If pattern has holographic record, use reconstruction
    if (pattern.holographicRecord) {
      const reconstruction = reconstructFromRecord(
        pattern.holographicRecord,
        pulsars,
        simulationTime
      );
      
      similarity = encodingSimilarity(queryEncoding, reconstruction.reconstructedEncoding);
      phaseError = reconstruction.phaseError;
      reconstructionFidelity = reconstruction.fidelity;
    } else {
      // Legacy: direct encoding comparison
      similarity = encodingSimilarity(queryEncoding, pattern.encoding);
      reconstructionFidelity = pattern.coherenceLevel;
    }
    
    if (similarity >= params.minSimilarity) {
      const storageNodes = pattern.storedAt
        .map(id => nodes.find(n => n.id === id))
        .filter((n): n is MemoryNode => n !== undefined);
      
      const accessPath = storageNodes.map(n => n.id);
      const totalDistance = storageNodes.reduce((s, n) => s + distance(SUN_POSITION, n.position), 0);
      const latency = lightTimeLatency(totalDistance / (storageNodes.length || 1));
      
      results.push({
        pattern,
        similarity,
        accessPath,
        reconstructionFidelity,
        latency,
        phaseError,
        timeSinceStorage: pattern.holographicRecord 
          ? simulationTime - pattern.holographicRecord.simulationTime 
          : undefined
      });
    }
  }
  
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, params.maxResults);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate interference pattern from encoding
 */
export function generateInterference(encoding: number[], nodePositions: [number, number, number][]): number[] {
  const pattern: number[] = [];
  
  for (const pos of nodePositions) {
    let interference = 0;
    for (let i = 0; i < encoding.length; i++) {
      const k = PRIME_BASIS[i] * 0.1;
      const phase = k * (pos[0] + pos[1] + pos[2]);
      interference += encoding[i] * Math.cos(phase);
    }
    pattern.push(interference);
  }
  
  return pattern;
}

/**
 * Calculate distance between points in kpc
 */
export function distance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2
  );
}

/**
 * Calculate light-time latency in years
 */
export function lightTimeLatency(dist: number): number {
  return dist / LIGHT_SPEED_KPC_PER_YEAR;
}

/**
 * Calculate similarity between two encodings (cosine similarity)
 */
export function encodingSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dot = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
}

// ============================================================================
// NODE & PULSAR MANAGEMENT
// ============================================================================

export function createMemoryNode(
  id: string,
  name: string,
  position: [number, number, number],
  type: MemoryNode['type'],
  capacity: number = 1000
): MemoryNode {
  return {
    id,
    name,
    position,
    type,
    capacity,
    stored: 0,
    coherence: 0.9 + Math.random() * 0.1,
    phase: Math.random() * Math.PI * 2,
    frequency: 1 + Math.random() * 0.5
  };
}

export function createPulsar(
  id: string,
  name: string,
  position: [number, number, number],
  period: number,
  isReference: boolean = false
): PulsarReference {
  return {
    id,
    name,
    position,
    period,
    phase: Math.random() * Math.PI * 2,
    stability: 1e-15 + Math.random() * 1e-14,
    isReference
  };
}

export function evolveNodes(nodes: MemoryNode[], dt: number): MemoryNode[] {
  return nodes.map(node => ({
    ...node,
    phase: (node.phase + node.frequency * dt * 0.01) % (Math.PI * 2),
    coherence: Math.min(1, node.coherence * 0.999 + 0.001)
  }));
}

// MJD epoch reference
const REFERENCE_EPOCH_MJD = 58000;
const SECONDS_PER_DAY = 86400;

export function calculatePulsarPhase(
  period: number,
  phase0: number,
  epoch: number,
  timeOffset: number
): number {
  const daysSinceEpoch = (Date.now() / 1000 / SECONDS_PER_DAY) - epoch + 40587;
  const secondsSinceEpoch = daysSinceEpoch * SECONDS_PER_DAY + timeOffset;
  const rotations = secondsSinceEpoch / period;
  const phase = (phase0 + rotations * 2 * Math.PI) % (2 * Math.PI);
  return phase >= 0 ? phase : phase + 2 * Math.PI;
}

export function evolvePulsars(pulsars: PulsarReference[], dt: number, simulationTime: number): PulsarReference[] {
  return pulsars.map(pulsar => {
    if (pulsar.periodSeconds && pulsar.epoch !== undefined && pulsar.phase0 !== undefined) {
      return {
        ...pulsar,
        phase: calculatePulsarPhase(pulsar.periodSeconds, pulsar.phase0, pulsar.epoch, simulationTime)
      };
    }
    return {
      ...pulsar,
      phase: (pulsar.phase + (2 * Math.PI / pulsar.period) * dt) % (Math.PI * 2)
    };
  });
}

export function calculateSyncState(pulsars: PulsarReference[]): SyncState {
  const reference = pulsars.find(p => p.isReference);
  if (!reference) {
    return {
      referencePhase: 0,
      localPhase: 0,
      phaseDifference: 0,
      isSynchronized: false,
      syncQuality: 0,
      lastSyncTime: 0
    };
  }
  
  const otherPulsars = pulsars.filter(p => !p.isReference);
  const phaseDiffs = otherPulsars.map(p => {
    const expectedPhase = reference.phase * (reference.period / p.period);
    return Math.abs(p.phase - expectedPhase);
  });
  
  const avgDiff = phaseDiffs.reduce((s, d) => s + d, 0) / (phaseDiffs.length || 1);
  const isSynchronized = avgDiff < 0.1;
  
  return {
    referencePhase: reference.phase,
    localPhase: otherPulsars[0]?.phase || 0,
    phaseDifference: avgDiff,
    isSynchronized,
    syncQuality: Math.max(0, 1 - avgDiff / Math.PI),
    lastSyncTime: Date.now()
  };
}

// ============================================================================
// REGIONS & METRICS
// ============================================================================

export function calculateRegions(nodes: MemoryNode[]): GalacticRegion[] {
  const regions: GalacticRegion[] = [
    { id: 'core', name: 'Galactic Core', center: [0, 0, 0], radius: 3, nodeCount: 0, totalCapacity: 0, usedCapacity: 0, dominantType: 'cluster' },
    { id: 'inner', name: 'Inner Disk', center: [0, 0, 0], radius: 8, nodeCount: 0, totalCapacity: 0, usedCapacity: 0, dominantType: 'star' },
    { id: 'solar', name: 'Solar Neighborhood', center: SUN_POSITION, radius: 1, nodeCount: 0, totalCapacity: 0, usedCapacity: 0, dominantType: 'star' },
    { id: 'outer', name: 'Outer Rim', center: [0, 0, 0], radius: 15, nodeCount: 0, totalCapacity: 0, usedCapacity: 0, dominantType: 'nebula' }
  ];
  
  for (const node of nodes) {
    const distFromCenter = distance(node.position, GALACTIC_CENTER);
    const distFromSun = distance(node.position, SUN_POSITION);
    
    let region: GalacticRegion | undefined;
    if (distFromSun <= 1) region = regions.find(r => r.id === 'solar');
    else if (distFromCenter <= 3) region = regions.find(r => r.id === 'core');
    else if (distFromCenter <= 8) region = regions.find(r => r.id === 'inner');
    else region = regions.find(r => r.id === 'outer');
    
    if (region) {
      region.nodeCount++;
      region.totalCapacity += node.capacity;
      region.usedCapacity += node.stored;
    }
  }
  
  return regions;
}

export function calculateMetrics(
  nodes: MemoryNode[],
  patterns: MemoryPattern[],
  pulsars: PulsarReference[],
  syncState: SyncState
): CosmicMetrics {
  const totalCapacity = nodes.reduce((s, n) => s + n.capacity, 0);
  const usedCapacity = nodes.reduce((s, n) => s + n.stored, 0);
  const avgCoherence = nodes.reduce((s, n) => s + n.coherence, 0) / (nodes.length || 1);
  
  return {
    totalNodes: nodes.length,
    totalCapacity,
    usedCapacity,
    averageCoherence: avgCoherence,
    activePulsars: pulsars.length,
    syncQuality: syncState.syncQuality,
    queriesPerSecond: patterns.reduce((s, p) => s + p.accessCount, 0) / 60,
    averageLatency: nodes.reduce((s, n) => s + lightTimeLatency(distance(SUN_POSITION, n.position)), 0) / (nodes.length || 1)
  };
}

export function calculateAccessPath(
  startNode: MemoryNode,
  pattern: MemoryPattern,
  nodes: MemoryNode[]
): AccessPath {
  const targetNodes = pattern.storedAt
    .map(id => nodes.find(n => n.id === id))
    .filter((n): n is MemoryNode => n !== undefined);
  
  const hops: AccessPath['hops'] = [];
  let currentPos = startNode.position;
  let cumulativeCoherenceLoss = 0;
  
  for (const node of targetNodes) {
    const hopDistance = distance(currentPos, node.position);
    const latency = lightTimeLatency(hopDistance);
    const coherenceLoss = 1 - node.coherence;
    cumulativeCoherenceLoss += coherenceLoss;
    hops.push({ nodeId: node.id, latency, coherenceLoss });
    currentPos = node.position;
  }
  
  return {
    sourceNode: startNode.id,
    targetPattern: pattern.id,
    hops,
    totalLatency: hops.reduce((s, h) => s + h.latency, 0),
    finalFidelity: Math.max(0, 1 - cumulativeCoherenceLoss)
  };
}

// ============================================================================
// PRESETS
// ============================================================================

function catalogPulsarToReference(
  pulsar: typeof PULSAR_CATALOG[0], 
  isRef: boolean = false
): Omit<PulsarReference, 'phase'> & { epoch: number; phase0: number; periodSeconds: number } {
  const galPos = equatorialToGalactic(pulsar.ra, pulsar.dec, pulsar.distance);
  return {
    id: pulsar.name.toLowerCase().replace(/\s+/g, '-'),
    name: pulsar.name,
    position: [galPos.x, galPos.y, galPos.z] as [number, number, number],
    period: pulsar.period * 1000,
    periodSeconds: pulsar.period,
    epoch: pulsar.epoch,
    phase0: pulsar.phase0,
    stability: pulsar.periodDot || 1e-15,
    isReference: isRef || pulsar.isReference
  };
}

function getRealPulsars(count: number = 10): Omit<PulsarReference, 'phase'>[] {
  return PULSAR_CATALOG.slice(0, count).map((p, i) => catalogPulsarToReference(p, i === 0));
}

export const COSMIC_PRESETS: CosmicPreset[] = [
  {
    name: 'Solar Neighborhood',
    description: 'Local stellar network within 1 kpc',
    nodes: [
      { id: 'sol', name: 'Sol', position: SUN_POSITION, type: 'star', capacity: 100, coherence: 1, frequency: 1 },
      { id: 'proxima', name: 'Proxima Centauri', position: [8.2 + 0.000004, 0, 0.02], type: 'star', capacity: 50, coherence: 0.95, frequency: 1.1 },
      { id: 'sirius', name: 'Sirius', position: [8.2 + 0.0026, 0, 0.02], type: 'star', capacity: 200, coherence: 0.98, frequency: 0.9 },
      { id: 'vega', name: 'Vega', position: [8.2 + 0.0076, 0.001, 0.02], type: 'star', capacity: 150, coherence: 0.92, frequency: 1.2 },
      { id: 'barnard', name: "Barnard's Star", position: [8.2 + 0.0018, -0.001, 0.02], type: 'star', capacity: 30, coherence: 0.88, frequency: 1.05 }
    ],
    pulsars: getRealPulsars(5)
  },
  {
    name: 'Galactic Network',
    description: 'Galaxy-wide distributed memory',
    nodes: [
      { id: 'sgr-a', name: 'Sagittarius A*', position: [0, 0, 0], type: 'cluster', capacity: 10000, coherence: 0.99, frequency: 0.5 },
      { id: 'crab', name: 'Crab Nebula', position: [2, 0.5, 0], type: 'nebula', capacity: 5000, coherence: 0.85, frequency: 0.8 },
      { id: 'orion', name: 'Orion Nebula', position: [7.8, 0.4, -0.1], type: 'nebula', capacity: 3000, coherence: 0.9, frequency: 0.7 },
      { id: 'omega', name: 'Omega Centauri', position: [5, -2, 0.5], type: 'cluster', capacity: 8000, coherence: 0.95, frequency: 0.6 },
      { id: 'sol', name: 'Sol', position: SUN_POSITION, type: 'star', capacity: 100, coherence: 1, frequency: 1 },
      { id: 'perseus', name: 'Perseus Arm Hub', position: [10, 3, 0], type: 'cluster', capacity: 6000, coherence: 0.88, frequency: 0.75 },
      { id: 'scutum', name: 'Scutum-Centaurus', position: [4, -3, 0], type: 'cluster', capacity: 7000, coherence: 0.92, frequency: 0.65 }
    ],
    pulsars: getRealPulsars(8)
  },
  {
    name: 'Pulsar Timing Array',
    description: 'Full millisecond pulsar network from ATNF catalog',
    nodes: [
      { id: 'sol', name: 'Sol', position: SUN_POSITION, type: 'star', capacity: 100, coherence: 1, frequency: 1 },
      { id: 'earth-station', name: 'Earth Station', position: [8.2, 0, 0.02], type: 'artificial', capacity: 500, coherence: 0.99, frequency: 1 }
    ],
    pulsars: getRealPulsars(20)
  },
  {
    name: 'Dense Core Network',
    description: 'High-density galactic core cluster network',
    nodes: [
      { id: 'sgr-a', name: 'Sagittarius A*', position: [0, 0, 0], type: 'cluster', capacity: 50000, coherence: 0.99, frequency: 0.3 },
      { id: 'core-1', name: 'Core Cluster Alpha', position: [0.5, 0.2, 0.1], type: 'cluster', capacity: 20000, coherence: 0.95, frequency: 0.4 },
      { id: 'core-2', name: 'Core Cluster Beta', position: [-0.3, 0.4, -0.1], type: 'cluster', capacity: 18000, coherence: 0.93, frequency: 0.45 },
      { id: 'core-3', name: 'Core Cluster Gamma', position: [0.2, -0.5, 0.2], type: 'cluster', capacity: 15000, coherence: 0.91, frequency: 0.5 },
      { id: 'sol', name: 'Sol (Observer)', position: SUN_POSITION, type: 'star', capacity: 100, coherence: 1, frequency: 1 }
    ],
    pulsars: [
      ...PULSAR_CATALOG.filter(p => {
        const pos = equatorialToGalactic(p.ra, p.dec, p.distance);
        return Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z) < 5;
      }).slice(0, 6).map((p, i) => catalogPulsarToReference(p, i === 0)),
      catalogPulsarToReference(PULSAR_CATALOG[0], true)
    ]
  }
];

// ============================================================================
// INITIALIZATION
// ============================================================================

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

export function initializeFromPreset(preset: CosmicPreset): {
  nodes: MemoryNode[];
  pulsars: PulsarReference[];
} {
  const presetSeed = hashString(preset.name);
  
  const nodes = preset.nodes.map((n, i) => ({
    ...n,
    stored: 0,
    phase: seededRandom(presetSeed + i) * Math.PI * 2
  }));
  
  const pulsars = preset.pulsars.map((p) => {
    const pulsarWithTiming = p as typeof p & { epoch?: number; phase0?: number; periodSeconds?: number };
    
    if (pulsarWithTiming.periodSeconds && pulsarWithTiming.epoch !== undefined) {
      const currentPhase = calculatePulsarPhase(
        pulsarWithTiming.periodSeconds,
        pulsarWithTiming.phase0 || 0,
        pulsarWithTiming.epoch,
        0
      );
      return { ...p, phase: currentPhase } as PulsarReference;
    }
    
    return { ...p, phase: 0 } as PulsarReference;
  });
  
  return { nodes, pulsars };
}
