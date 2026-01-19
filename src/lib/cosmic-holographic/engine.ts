/**
 * Cosmic Holographic Memory Engine
 * Implements galactic-scale holographic storage
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
  CosmicPreset
} from './types';

// Physical constants
const LIGHT_SPEED_KPC_PER_YEAR = 0.000306601; // Light speed in kpc/year
const GALACTIC_CENTER: [number, number, number] = [0, 0, 0];
const SUN_POSITION: [number, number, number] = [8.2, 0, 0.02]; // kpc from center

// Prime basis for encoding
const PRIME_BASIS = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];

// Generate prime-based encoding for content
export function encodeContent(content: string): number[] {
  const encoding = new Array(PRIME_BASIS.length).fill(0);
  
  for (let i = 0; i < content.length; i++) {
    const charCode = content.charCodeAt(i);
    for (let j = 0; j < PRIME_BASIS.length; j++) {
      encoding[j] += Math.sin(charCode * PRIME_BASIS[j] * 0.1) / content.length;
    }
  }
  
  // Normalize
  const norm = Math.sqrt(encoding.reduce((s, v) => s + v * v, 0));
  return encoding.map(v => v / (norm || 1));
}

// Generate interference pattern from encoding
export function generateInterference(encoding: number[], nodePositions: [number, number, number][]): number[] {
  const pattern: number[] = [];
  
  for (const pos of nodePositions) {
    let interference = 0;
    for (let i = 0; i < encoding.length; i++) {
      const k = PRIME_BASIS[i] * 0.1; // Wave number
      const phase = k * (pos[0] + pos[1] + pos[2]);
      interference += encoding[i] * Math.cos(phase);
    }
    pattern.push(interference);
  }
  
  return pattern;
}

// Calculate distance between points in kpc
export function distance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 +
    (a[1] - b[1]) ** 2 +
    (a[2] - b[2]) ** 2
  );
}

// Calculate light-time latency in years
export function lightTimeLatency(dist: number): number {
  return dist / LIGHT_SPEED_KPC_PER_YEAR;
}

// Calculate similarity between two encodings
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

// Create memory node
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

// Create pulsar reference
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
    stability: 1e-15 + Math.random() * 1e-14, // nanosecond precision
    isReference
  };
}

// Evolve node phases
export function evolveNodes(nodes: MemoryNode[], dt: number): MemoryNode[] {
  return nodes.map(node => ({
    ...node,
    phase: (node.phase + node.frequency * dt * 0.01) % (Math.PI * 2),
    coherence: Math.min(1, node.coherence * 0.999 + 0.001) // Slight coherence decay
  }));
}

// Evolve pulsar phases
export function evolvePulsars(pulsars: PulsarReference[], dt: number): PulsarReference[] {
  return pulsars.map(pulsar => ({
    ...pulsar,
    phase: (pulsar.phase + (2 * Math.PI / pulsar.period) * dt) % (Math.PI * 2)
  }));
}

// Calculate sync state from pulsars
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
  
  // Calculate average phase difference from reference
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

// Store pattern in nodes
export function storePattern(
  content: string,
  nodes: MemoryNode[],
  params: StoreParams
): { pattern: MemoryPattern; updatedNodes: MemoryNode[] } {
  const encoding = encodeContent(content);
  
  // Select nodes for storage based on coherence and capacity
  const eligibleNodes = nodes
    .filter(n => n.coherence >= params.coherenceThreshold && n.stored < n.capacity)
    .sort((a, b) => b.coherence - a.coherence)
    .slice(0, params.redundancy);
  
  const nodePositions = eligibleNodes.map(n => n.position);
  const interferencePattern = generateInterference(encoding, nodePositions);
  
  const pattern: MemoryPattern = {
    id: `pattern-${Date.now()}`,
    content,
    encoding,
    interferencePattern,
    storedAt: eligibleNodes.map(n => n.id),
    timestamp: Date.now(),
    coherenceLevel: eligibleNodes.reduce((s, n) => s + n.coherence, 0) / eligibleNodes.length,
    accessCount: 0
  };
  
  // Update node storage
  const updatedNodes = nodes.map(n => {
    if (eligibleNodes.find(e => e.id === n.id)) {
      return { ...n, stored: n.stored + 1 };
    }
    return n;
  });
  
  return { pattern, updatedNodes };
}

// Query patterns
export function queryPatterns(
  patterns: MemoryPattern[],
  nodes: MemoryNode[],
  params: QueryParams
): QueryResult[] {
  const queryEncoding = encodeContent(params.content);
  
  const results: QueryResult[] = [];
  
  for (const pattern of patterns) {
    const similarity = encodingSimilarity(queryEncoding, pattern.encoding);
    
    if (similarity >= params.minSimilarity) {
      // Calculate access path
      const storageNodes = pattern.storedAt
        .map(id => nodes.find(n => n.id === id))
        .filter((n): n is MemoryNode => n !== undefined);
      
      const accessPath = storageNodes.map(n => n.id);
      const totalDistance = storageNodes.reduce((s, n) => s + distance(SUN_POSITION, n.position), 0);
      const latency = lightTimeLatency(totalDistance / storageNodes.length);
      
      // Reconstruction fidelity based on coherence
      const avgCoherence = storageNodes.reduce((s, n) => s + n.coherence, 0) / storageNodes.length;
      
      results.push({
        pattern,
        similarity,
        accessPath,
        reconstructionFidelity: avgCoherence * similarity,
        latency
      });
    }
  }
  
  return results
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, params.maxResults);
}

// Calculate access path details
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
    
    hops.push({
      nodeId: node.id,
      latency,
      coherenceLoss
    });
    
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

// Calculate galactic regions
export function calculateRegions(nodes: MemoryNode[]): GalacticRegion[] {
  const regions: GalacticRegion[] = [
    {
      id: 'core',
      name: 'Galactic Core',
      center: [0, 0, 0],
      radius: 3,
      nodeCount: 0,
      totalCapacity: 0,
      usedCapacity: 0,
      dominantType: 'cluster'
    },
    {
      id: 'inner',
      name: 'Inner Disk',
      center: [0, 0, 0],
      radius: 8,
      nodeCount: 0,
      totalCapacity: 0,
      usedCapacity: 0,
      dominantType: 'star'
    },
    {
      id: 'solar',
      name: 'Solar Neighborhood',
      center: SUN_POSITION,
      radius: 1,
      nodeCount: 0,
      totalCapacity: 0,
      usedCapacity: 0,
      dominantType: 'star'
    },
    {
      id: 'outer',
      name: 'Outer Rim',
      center: [0, 0, 0],
      radius: 15,
      nodeCount: 0,
      totalCapacity: 0,
      usedCapacity: 0,
      dominantType: 'nebula'
    }
  ];
  
  // Classify nodes into regions
  for (const node of nodes) {
    const distFromCenter = distance(node.position, GALACTIC_CENTER);
    const distFromSun = distance(node.position, SUN_POSITION);
    
    let region: GalacticRegion | undefined;
    
    if (distFromSun <= 1) {
      region = regions.find(r => r.id === 'solar');
    } else if (distFromCenter <= 3) {
      region = regions.find(r => r.id === 'core');
    } else if (distFromCenter <= 8) {
      region = regions.find(r => r.id === 'inner');
    } else {
      region = regions.find(r => r.id === 'outer');
    }
    
    if (region) {
      region.nodeCount++;
      region.totalCapacity += node.capacity;
      region.usedCapacity += node.stored;
    }
  }
  
  return regions;
}

// Calculate system metrics
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

// Preset configurations
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
    pulsars: [
      { id: 'psr-j0437', name: 'PSR J0437-4715', position: [8.2 + 0.046, -0.02, 0], period: 5.757, stability: 1e-15, isReference: true }
    ]
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
    pulsars: [
      { id: 'crab-psr', name: 'Crab Pulsar', position: [2, 0.5, 0], period: 33.5, stability: 1e-14, isReference: true },
      { id: 'vela', name: 'Vela Pulsar', position: [7.9, -0.3, 0], period: 89.3, stability: 1e-13, isReference: false },
      { id: 'psr-b1919', name: 'PSR B1919+21', position: [9, 1, 0.2], period: 1337, stability: 1e-12, isReference: false }
    ]
  },
  {
    name: 'Pulsar Array',
    description: 'High-precision timing network',
    nodes: [
      { id: 'sol', name: 'Sol', position: SUN_POSITION, type: 'star', capacity: 100, coherence: 1, frequency: 1 }
    ],
    pulsars: [
      { id: 'psr-j0437', name: 'PSR J0437-4715', position: [8.15, -0.02, 0], period: 5.757, stability: 1e-15, isReference: true },
      { id: 'psr-j1909', name: 'PSR J1909-3744', position: [3.5, -1.2, 0], period: 2.947, stability: 2e-15, isReference: false },
      { id: 'psr-j0030', name: 'PSR J0030+0451', position: [10.2, 0.8, 0.1], period: 4.865, stability: 3e-15, isReference: false },
      { id: 'psr-b1937', name: 'PSR B1937+21', position: [4.8, 2.1, 0], period: 1.558, stability: 1e-14, isReference: false },
      { id: 'psr-j0613', name: 'PSR J0613-0200', position: [9.1, -0.5, 0], period: 3.062, stability: 2e-15, isReference: false }
    ]
  }
];

// Initialize from preset
export function initializeFromPreset(preset: CosmicPreset): {
  nodes: MemoryNode[];
  pulsars: PulsarReference[];
} {
  const nodes = preset.nodes.map(n => ({
    ...n,
    stored: 0,
    phase: Math.random() * Math.PI * 2
  }));
  
  const pulsars = preset.pulsars.map(p => ({
    ...p,
    phase: Math.random() * Math.PI * 2
  }));
  
  return { nodes, pulsars };
}
