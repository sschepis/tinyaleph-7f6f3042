import { useState, useCallback, useEffect, useRef } from 'react';
import {
  MemoryNode,
  MemoryPattern,
  PulsarReference,
  SyncState,
  GalacticRegion,
  CosmicMetrics,
  QueryResult,
  QueryParams,
  StoreParams,
  HolographicRecord
} from '@/lib/cosmic-holographic/types';
import {
  evolveNodes,
  evolvePulsars,
  calculateSyncState,
  storePattern,
  queryPatterns,
  calculateRegions,
  calculateMetrics,
  COSMIC_PRESETS,
  initializeFromPreset,
  reconstructFromRecord
} from '@/lib/cosmic-holographic/engine';
import {
  saveHolographicRecord,
  loadHolographicRecords
} from '@/lib/cosmic-holographic/persistence';
import { toast } from 'sonner';

const TICK_RATE = 50; // ms
const DT = 0.1;

export function useCosmicHolographic() {
  // Initialize from first preset
  const [nodes, setNodes] = useState<MemoryNode[]>([]);
  const [patterns, setPatterns] = useState<MemoryPattern[]>([]);
  const [pulsars, setPulsars] = useState<PulsarReference[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({
    referencePhase: 0,
    localPhase: 0,
    phaseDifference: 0,
    isSynchronized: false,
    syncQuality: 0,
    lastSyncTime: 0
  });
  const [regions, setRegions] = useState<GalacticRegion[]>([]);
  const [metrics, setMetrics] = useState<CosmicMetrics>({
    totalNodes: 0,
    totalCapacity: 0,
    usedCapacity: 0,
    averageCoherence: 0,
    activePulsars: 0,
    syncQuality: 0,
    queriesPerSecond: 0,
    averageLatency: 0
  });
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [activeQuery, setActiveQuery] = useState<QueryResult | null>(null);
  const [queryResults, setQueryResults] = useState<QueryResult[]>([]);
  const [mode, setMode] = useState<'explore' | 'store' | 'query' | 'sync'>('explore');
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(1); // Galactic Network
  const [holographicRecords, setHolographicRecords] = useState<HolographicRecord[]>([]);
  
  const animationRef = useRef<number | null>(null);
  
  // Initialize on mount
  useEffect(() => {
    loadPreset(1);
  }, []);
  
  // Animation loop with simulation time tracking
  const [simulationTime, setSimulationTime] = useState(0);
  
  useEffect(() => {
    if (!isRunning) return;
    
    const tick = () => {
      setNodes(prev => evolveNodes(prev, DT));
      setSimulationTime(t => {
        const newTime = t + DT;
        setPulsars(prev => evolvePulsars(prev, DT, newTime));
        return newTime;
      });
      setTime(t => t + DT);
      animationRef.current = window.setTimeout(tick, TICK_RATE);
    };
    
    tick();
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isRunning]);
  
  // Update sync state when pulsars change
  useEffect(() => {
    setSyncState(calculateSyncState(pulsars));
  }, [pulsars]);
  
  // Update regions and metrics
  useEffect(() => {
    setRegions(calculateRegions(nodes));
    setMetrics(calculateMetrics(nodes, patterns, pulsars, syncState));
  }, [nodes, patterns, pulsars, syncState]);
  
  // Load preset and persisted records
  const loadPreset = useCallback(async (index: number) => {
    const preset = COSMIC_PRESETS[index];
    if (!preset) return;
    
    setSelectedPreset(index);
    const { nodes: newNodes, pulsars: newPulsars } = initializeFromPreset(preset);
    setNodes(newNodes);
    setPulsars(newPulsars);
    setPatterns([]);
    setHolographicRecords([]);
    setActiveQuery(null);
    setQueryResults([]);
    setSelectedNode(null);
    setSimulationTime(0);
    
    // Load persisted records for this preset
    const { records, error } = await loadHolographicRecords(preset.name);
    if (error) {
      console.warn('Failed to load persisted records:', error);
    } else if (records.length > 0) {
      setHolographicRecords(records);
      // Reconstruct patterns from records
      const reconstructedPatterns: MemoryPattern[] = records.map((record, i) => ({
        id: `restored-${record.id}`,
        content: `[Phase-encoded: ${record.contentHash}]`,
        encoding: record.amplitudeModulation,
        interferencePattern: [],
        storedAt: record.pulsarIds,
        timestamp: record.timestamp,
        coherenceLevel: record.coherenceAtStorage,
        accessCount: 0,
        holographicRecord: record
      }));
      setPatterns(reconstructedPatterns);
      toast.success(`Loaded ${records.length} persisted pattern(s)`);
    }
  }, []);
  
  // Store content using holographic encoding with persistence
  const store = useCallback(async (content: string, redundancy: number = 3) => {
    const preset = COSMIC_PRESETS[selectedPreset];
    const params: StoreParams = {
      content,
      redundancy,
      coherenceThreshold: 0.8
    };
    
    const { pattern, updatedNodes, record } = storePattern(
      content, 
      nodes, 
      pulsars, 
      simulationTime, 
      params
    );
    setNodes(updatedNodes);
    setPatterns(prev => [...prev, pattern]);
    setHolographicRecords(prev => [...prev, record]);
    
    // Persist to database
    const { success, error } = await saveHolographicRecord(record, preset?.name);
    if (success) {
      toast.success('Pattern stored & persisted');
    } else {
      console.warn('Failed to persist record:', error);
      toast.warning('Pattern stored locally (persistence failed)');
    }
    
    return pattern;
  }, [nodes, pulsars, simulationTime, selectedPreset]);
  
  // Query content using holographic reconstruction
  const query = useCallback((content: string) => {
    const params: QueryParams = {
      content,
      maxResults: 5,
      minSimilarity: 0.3,
      requireSync: syncState.isSynchronized
    };
    
    const results = queryPatterns(patterns, nodes, pulsars, simulationTime, params);
    setQueryResults(results);
    
    if (results.length > 0) {
      setActiveQuery(results[0]);
      // Increment access count
      setPatterns(prev => prev.map(p => 
        p.id === results[0].pattern.id 
          ? { ...p, accessCount: p.accessCount + 1 }
          : p
      ));
    }
    
    return results;
  }, [patterns, nodes, pulsars, simulationTime, syncState]);
  
  // Select node
  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNode(nodeId);
  }, []);
  
  // Toggle running
  const toggleRunning = useCallback(() => {
    setIsRunning(prev => !prev);
  }, []);
  
  // Get selected node data
  const selectedNodeData = nodes.find(n => n.id === selectedNode) || null;
  
  return {
    // State
    nodes,
    patterns,
    pulsars,
    syncState,
    regions,
    metrics,
    selectedNode,
    selectedNodeData,
    activeQuery,
    queryResults,
    mode,
    time,
    isRunning,
    selectedPreset,
    simulationTime,
    holographicRecords,
    
    // Actions
    loadPreset,
    store,
    query,
    selectNode,
    setMode,
    toggleRunning,
    
    // Constants
    presets: COSMIC_PRESETS
  };
}
