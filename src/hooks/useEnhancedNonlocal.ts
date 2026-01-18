import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  NodeState, 
  CommunicationEvent, 
  NonLocalSystemState,
  NodeCommLogEntry 
} from '@/lib/quaternion-nonlocal/communication-types';
import {
  createNodeState,
  encodeMessage,
  evolveNodeState,
  initializeEntanglement,
  calculateNonLocalCorrelation
} from '@/lib/quaternion-nonlocal/communication-engine';
import { calculateResonanceStrength } from '@/lib/quaternion-nonlocal/octonion';
import { AVAILABLE_SPLIT_PRIMES, PRESETS } from '@/lib/quaternion-nonlocal/engine';

const TICK_RATE = 50; // ms

export function useEnhancedNonlocal() {
  // Node states
  const [nodeA, setNodeA] = useState<NodeState>(() => createNodeState('A'));
  const [nodeB, setNodeB] = useState<NodeState>(() => createNodeState('B'));
  
  // System state
  const [entanglementState, setEntanglementState] = useState<NonLocalSystemState['entanglementState']>('disconnected');
  const [isEvolving, setIsEvolving] = useState(false);
  const [entanglementStrength, setEntanglementStrength] = useState(0);
  const [nonLocalCorrelation, setNonLocalCorrelation] = useState(0);
  const [quantumCoherence, setQuantumCoherence] = useState(0);
  const [resonanceStrength, setResonanceStrength] = useState(0);
  const [separationTime, setSeparationTime] = useState(0);
  const [evolutionStartTime, setEvolutionStartTime] = useState(0);
  
  // Communication history
  const [communicationHistory, setCommunicationHistory] = useState<CommunicationEvent[]>([]);
  const [nodeACommLog, setNodeACommLog] = useState<NodeCommLogEntry[]>([]);
  const [nodeBCommLog, setNodeBCommLog] = useState<NodeCommLogEntry[]>([]);
  
  // Animation ref
  const animationRef = useRef<number | null>(null);
  
  // Get current system state for operations
  const getSystemState = useCallback((): NonLocalSystemState => ({
    nodeA,
    nodeB,
    entanglementState,
    isEvolving,
    entanglementStrength,
    nonLocalCorrelation,
    quantumCoherence,
    resonanceStrength,
    sharedQuaternion: null,
    communicationHistory,
    separationTime,
    evolutionStartTime
  }), [nodeA, nodeB, entanglementState, isEvolving, entanglementStrength, 
      nonLocalCorrelation, quantumCoherence, resonanceStrength, 
      communicationHistory, separationTime, evolutionStartTime]);

  // Evolution loop
  useEffect(() => {
    if (!isEvolving) return;
    
    const tick = () => {
      setNodeA(prev => evolveNodeState(prev, evolutionStartTime));
      setNodeB(prev => evolveNodeState(prev, evolutionStartTime));
      
      // Update correlation and resonance
      setNonLocalCorrelation(calculateNonLocalCorrelation(nodeA, nodeB));
      setResonanceStrength(calculateResonanceStrength(nodeA.primeAmplitudes, nodeB.primeAmplitudes));
      
      // Decay entanglement if separated
      if (entanglementState === 'separated') {
        const timeElapsed = (Date.now() - separationTime) / 1000;
        const decay = Math.exp(-timeElapsed * 0.01);
        setEntanglementStrength(0.95 * decay);
        setQuantumCoherence(resonanceStrength * decay);
      }
      
      animationRef.current = window.setTimeout(tick, TICK_RATE);
    };
    
    tick();
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isEvolving, evolutionStartTime, entanglementState, separationTime, nodeA, nodeB, resonanceStrength]);

  // Start evolution
  const startEvolution = useCallback(() => {
    setEvolutionStartTime(Date.now());
    setIsEvolving(true);
  }, []);

  // Pause evolution
  const pauseEvolution = useCallback(() => {
    setIsEvolving(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
  }, []);

  // Initialize entanglement
  const initEntanglement = useCallback(() => {
    setEntanglementState('initializing');
    
    setTimeout(() => {
      const { nodeA: entangledA, nodeB: entangledB } = initializeEntanglement(
        nodeA,
        nodeB,
        AVAILABLE_SPLIT_PRIMES
      );
      
      setNodeA(entangledA);
      setNodeB(entangledB);
      setEntanglementState('entangled');
      setEntanglementStrength(0.95);
      setQuantumCoherence(0.9);
    }, 2000);
  }, [nodeA, nodeB]);

  // Separate nodes
  const separateNodes = useCallback(() => {
    if (entanglementState !== 'entangled') return;
    setEntanglementState('separated');
    setSeparationTime(Date.now());
  }, [entanglementState]);

  // Send message from a node
  const sendMessage = useCallback((nodeId: 'A' | 'B', message: string) => {
    const systemState = getSystemState();
    const senderNode = nodeId === 'A' ? nodeA : nodeB;
    const targetNode = nodeId === 'A' ? nodeB : nodeA;
    
    const result = encodeMessage(message, senderNode, targetNode, systemState);
    
    // Update nodes
    if (nodeId === 'A') {
      setNodeA(result.updatedNode);
      setNodeB(result.updatedTarget);
    } else {
      setNodeB(result.updatedNode);
      setNodeA(result.updatedTarget);
    }
    
    // Add to sender's comm log
    const sentEntry: NodeCommLogEntry = {
      id: `log-${Date.now()}-sent`,
      timestamp: new Date(),
      message,
      type: 'sent'
    };
    
    if (nodeId === 'A') {
      setNodeACommLog(prev => [...prev.slice(-9), sentEntry]);
    } else {
      setNodeBCommLog(prev => [...prev.slice(-9), sentEntry]);
    }
    
    // Add to receiver's comm log (if message was transmitted)
    if (result.commEvent) {
      const receivedEntry: NodeCommLogEntry = {
        id: `log-${Date.now()}-received`,
        timestamp: new Date(),
        message,
        type: 'received'
      };
      
      if (nodeId === 'A') {
        setNodeBCommLog(prev => [...prev.slice(-9), receivedEntry]);
      } else {
        setNodeACommLog(prev => [...prev.slice(-9), receivedEntry]);
      }
      
      // Add to global history
      setCommunicationHistory(prev => {
        const updated = [...prev, result.commEvent!];
        return updated.slice(-10);
      });
    }
    
    // Update metrics
    setNonLocalCorrelation(result.newCorrelation);
    setResonanceStrength(result.newResonance);
  }, [nodeA, nodeB, getSystemState]);

  // Reset system
  const reset = useCallback(() => {
    pauseEvolution();
    setNodeA(createNodeState('A'));
    setNodeB(createNodeState('B'));
    setEntanglementState('disconnected');
    setEntanglementStrength(0);
    setNonLocalCorrelation(0);
    setQuantumCoherence(0);
    setResonanceStrength(0);
    setCommunicationHistory([]);
    setNodeACommLog([]);
    setNodeBCommLog([]);
    setSeparationTime(0);
  }, [pauseEvolution]);

  return {
    // Node states
    nodeA,
    nodeB,
    
    // System state
    entanglementState,
    isEvolving,
    entanglementStrength,
    nonLocalCorrelation,
    quantumCoherence,
    resonanceStrength,
    
    // Communication
    communicationHistory,
    nodeACommLog,
    nodeBCommLog,
    
    // Actions
    startEvolution,
    pauseEvolution,
    initEntanglement,
    separateNodes,
    sendMessage,
    reset,
    
    // Constants
    AVAILABLE_SPLIT_PRIMES,
    PRESETS
  };
}
