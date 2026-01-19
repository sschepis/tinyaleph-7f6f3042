/**
 * Cosmic Holographic Memory Types
 * Galactic-scale holographic storage with pulsar synchronization
 */

// Memory node in the galaxy
export interface MemoryNode {
  id: string;
  name: string;
  position: [number, number, number]; // Galactic coordinates (kpc)
  type: 'pulsar' | 'star' | 'nebula' | 'cluster' | 'artificial';
  capacity: number; // Semantic units
  stored: number;
  coherence: number; // 0-1
  phase: number;
  frequency: number; // Natural resonance frequency
}

// Stored memory pattern
export interface MemoryPattern {
  id: string;
  content: string;
  encoding: number[]; // Prime amplitude encoding
  interferencePattern: number[]; // Holographic interference
  storedAt: string[]; // Node IDs
  timestamp: number;
  coherenceLevel: number;
  accessCount: number;
}

// Query result
export interface QueryResult {
  pattern: MemoryPattern;
  similarity: number;
  accessPath: string[]; // Node IDs in access chain
  reconstructionFidelity: number;
  latency: number; // Simulated light-years
}

// Pulsar timing reference
export interface PulsarReference {
  id: string;
  name: string;
  position: [number, number, number];
  period: number; // ms
  phase: number;
  stability: number; // Parts per billion
  isReference: boolean;
}

// Synchronization state
export interface SyncState {
  referencePhase: number;
  localPhase: number;
  phaseDifference: number;
  isSynchronized: boolean;
  syncQuality: number;
  lastSyncTime: number;
}

// Interference pattern for storage
export interface InterferenceField {
  nodes: MemoryNode[];
  patterns: number[][];
  globalCoherence: number;
  activeQueries: string[];
}

// Galaxy region
export interface GalacticRegion {
  id: string;
  name: string;
  center: [number, number, number];
  radius: number;
  nodeCount: number;
  totalCapacity: number;
  usedCapacity: number;
  dominantType: MemoryNode['type'];
}

// Access path for retrieval
export interface AccessPath {
  sourceNode: string;
  targetPattern: string;
  hops: Array<{
    nodeId: string;
    latency: number;
    coherenceLoss: number;
  }>;
  totalLatency: number;
  finalFidelity: number;
}

// System metrics
export interface CosmicMetrics {
  totalNodes: number;
  totalCapacity: number;
  usedCapacity: number;
  averageCoherence: number;
  activePulsars: number;
  syncQuality: number;
  queriesPerSecond: number;
  averageLatency: number;
}

// Query parameters
export interface QueryParams {
  content: string;
  maxResults: number;
  minSimilarity: number;
  preferredRegion?: string;
  requireSync: boolean;
}

// Store parameters
export interface StoreParams {
  content: string;
  redundancy: number; // Number of nodes to store across
  preferredRegion?: string;
  coherenceThreshold: number;
}

// Full system state
export interface CosmicHolographicState {
  nodes: MemoryNode[];
  patterns: MemoryPattern[];
  pulsars: PulsarReference[];
  syncState: SyncState;
  regions: GalacticRegion[];
  metrics: CosmicMetrics;
  selectedNode: string | null;
  activeQuery: QueryResult | null;
  mode: 'explore' | 'store' | 'query' | 'sync';
  time: number;
  isRunning: boolean;
}

// Preset configurations
export interface CosmicPreset {
  name: string;
  description: string;
  nodes: Omit<MemoryNode, 'stored' | 'phase'>[];
  pulsars: Omit<PulsarReference, 'phase'>[];
}
