/**
 * Cosmic Holographic Memory Types
 * Galactic-scale holographic storage with pulsar synchronization
 * 
 * KEY CONCEPT: Content is encoded as phase offsets relative to pulsar timing.
 * The pulsars ARE the storage medium - content is reconstructed from timing alone.
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

/**
 * Holographic Record - True phase-encoded storage
 * 
 * Content is NOT stored directly. Instead, we store:
 * 1. Phase offsets at encoding time for each pulsar
 * 2. The timestamp (epoch reference)
 * 
 * Content is RECONSTRUCTED by:
 * 1. Getting current pulsar phases
 * 2. Calculating phase evolution since storage
 * 3. Extracting the encoded phase modulation
 * 4. Decoding the interference pattern back to content
 */
export interface HolographicRecord {
  id: string;
  
  // Phase snapshot at encoding time (pulsarId → phase in radians)
  phaseSnapshot: Record<string, number>;
  
  // Which pulsars were used for encoding
  pulsarIds: string[];
  
  // Encoding parameters
  encodingBasis: number[]; // Prime basis used
  amplitudeModulation: number[]; // How content modulated each pulsar's phase contribution
  
  // Timing reference
  timestamp: number; // Unix ms - when the pattern was encoded
  simulationTime: number; // Simulation time at encoding
  
  // Metadata (for display, but content is reconstructed from phases)
  contentHash: string; // Hash to verify reconstruction
  contentLength: number;
  
  // Redundancy
  redundancy: number;
  coherenceAtStorage: number;
}

// Reconstructed pattern (result of decoding a HolographicRecord)
export interface ReconstructedPattern {
  record: HolographicRecord;
  reconstructedContent: string;
  reconstructedEncoding: number[];
  fidelity: number; // 0-1, how well the reconstruction matches
  phaseError: number; // Total phase drift since storage
}

// Legacy pattern type (keeping for compatibility during transition)
export interface MemoryPattern {
  id: string;
  content: string;
  encoding: number[]; // Prime amplitude encoding
  interferencePattern: number[]; // Holographic interference
  storedAt: string[]; // Node IDs
  timestamp: number;
  coherenceLevel: number;
  accessCount: number;
  
  // NEW: Link to holographic record
  holographicRecord?: HolographicRecord;
}

// Query result
export interface QueryResult {
  pattern: MemoryPattern;
  similarity: number;
  accessPath: string[]; // Node IDs in access chain
  reconstructionFidelity: number;
  latency: number; // Simulated light-years
  
  // NEW: Reconstruction info
  phaseError?: number;
  timeSinceStorage?: number;
}

// Pulsar timing reference
export interface PulsarReference {
  id: string;
  name: string;
  position: [number, number, number];
  period: number; // ms (display)
  periodSeconds?: number; // seconds (for phase calculation)
  epoch?: number; // MJD
  phase0?: number; // radians at epoch
  phase: number; // current phase (radians)
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
  redundancy: number; // Number of pulsars to encode across
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
  
  // NEW: Holographic records
  holographicRecords: HolographicRecord[];
}

// Preset configurations
export interface CosmicPreset {
  name: string;
  description: string;
  nodes: Omit<MemoryNode, 'stored' | 'phase'>[];
  pulsars: Omit<PulsarReference, 'phase'>[];
}
