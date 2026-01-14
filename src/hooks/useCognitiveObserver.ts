/**
 * Unified Cognitive Observer Hook
 * Combines holographic memory, semantic agent, collapse dynamics, and reasoning engine
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  HolographicMemory,
  createHolographicMemory,
  encodeMemory,
  recallMemory,
  applyMemoryDecay,
  getMemoryStats,
  MemoryFragment
} from '@/lib/sentient-observer/holographic-memory';
import {
  SemanticAgent,
  AgentState,
  ActionSelection,
  createSemanticAgent,
  createDefaultGoals,
  createDefaultActions,
  updateAgentState,
  selectAction,
  executeAction,
  getActiveGoals,
  getRecentActions,
  ActionRecord,
  AgentGoal
} from '@/lib/sentient-observer/semantic-agent';
import {
  Superposition,
  CollapseHistory,
  CollapseEvent,
  createSuperposition,
  applyMeasurementContext,
  collapseState,
  triggerReanalysis,
  getDominantInterpretation,
  getCollapseProbability,
  createCollapseHistory,
  addCollapseEvent,
  getCollapseStats
} from '@/lib/sentient-observer/semantic-collapse';
import {
  ReasoningEngine,
  createReasoningEngine,
  addDefaultRules,
  addObservationFact,
  addFact,
  runReasoningChain,
  getReasoningStats,
  query,
  getDerivationChain,
  Fact,
  ReasoningStep
} from '@/lib/sentient-observer/reasoning-engine';
import { Oscillator } from '@/components/sentient-observer/types';

interface CognitiveState {
  memory: HolographicMemory;
  agent: SemanticAgent;
  currentSuperposition: Superposition | null;
  collapseHistory: CollapseHistory;
  reasoning: ReasoningEngine;
}

interface CognitiveObserverReturn {
  // State
  memory: HolographicMemory;
  agent: SemanticAgent;
  currentSuperposition: Superposition | null;
  collapseHistory: CollapseHistory;
  reasoning: ReasoningEngine;
  
  // Autonomous agent
  isAgentAutonomous: boolean;
  setAgentAutonomous: (enabled: boolean) => void;
  lastAgentAction: string | null;
  
  // Memory actions
  storeMemory: (content: string, coherence: number) => { fragmentId: string; location: { x: number; y: number } };
  searchMemory: (query: string) => { fragment: MemoryFragment; similarity: number; location: { x: number; y: number } }[];
  processUserInput: (input: string, coherence: number) => { stored: boolean; recalled: { fragment: MemoryFragment; similarity: number }[] };
  reinjectMemory: (content: string) => void;
  
  // Agent actions
  updateObserverState: (update: Partial<AgentState>) => void;
  runAgentStep: () => ActionSelection | null;
  getAgentGoals: () => AgentGoal[];
  getAgentActions: () => ActionRecord[];
  
  // Collapse actions
  createMeaningSuperposition: (input: string) => void;
  applyContext: (contextPrimes: number[], coherence: number) => void;
  triggerCollapse: (coherence: number) => CollapseEvent | null;
  checkReanalysis: (newInput: string) => boolean;
  
  // Reasoning actions
  addInputFact: (name: string, statement: string, confidence?: number) => void;
  addObservation: (observation: string, confidence: number) => void;
  runInference: () => { newFacts: Fact[]; steps: ReasoningStep[] };
  queryFacts: (question: string) => { fact: Fact; similarity: number }[];
  getFactChain: (factId: string) => Fact[];
  
  // Stats
  getMemoryStats: () => ReturnType<typeof getMemoryStats>;
  getReasoningStats: () => ReturnType<typeof getReasoningStats>;
  getCollapseStats: () => ReturnType<typeof getCollapseStats>;
  
  // Reset
  resetCognitive: () => void;
}

// Generate prime signature from oscillators for context
function oscillatorsToPrimes(oscillators: Oscillator[], threshold: number = 0.3): number[] {
  return oscillators
    .filter(o => o.amplitude > threshold)
    .slice(0, 16)
    .map(o => o.prime);
}

export function useCognitiveObserver(
  oscillators: Oscillator[],
  coherence: number,
  entropy: number,
  explorationProgress: number,
  tickCount: number,
  isSimulationRunning: boolean = false
): CognitiveObserverReturn {
  // Initialize cognitive systems
  const [memory, setMemory] = useState<HolographicMemory>(() => createHolographicMemory());
  
  const [agent, setAgent] = useState<SemanticAgent>(() => {
    const initialState: AgentState = {
      coherence: 0.5,
      entropy: 0.5,
      explorationProgress: 0,
      memoryCount: 0,
      activeOscillatorCount: 0,
      lastInputTime: Date.now(),
      tickCount: 0,
      temperature: 0.5,
      coupling: 0.5
    };
    let a = createSemanticAgent(initialState);
    a = createDefaultGoals(a);
    a = createDefaultActions(a);
    return a;
  });
  
  const [currentSuperposition, setCurrentSuperposition] = useState<Superposition | null>(null);
  const [collapseHistory, setCollapseHistory] = useState<CollapseHistory>(() => createCollapseHistory());
  
  const [reasoning, setReasoning] = useState<ReasoningEngine>(() => {
    let r = createReasoningEngine();
    r = addDefaultRules(r);
    return r;
  });
  
  // Autonomous agent state
  const [isAgentAutonomous, setAgentAutonomous] = useState(false);
  const [lastAgentAction, setLastAgentAction] = useState<string | null>(null);
  const agentStepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track state changes for auto-observations
  const lastCoherenceRef = useRef(coherence);
  const lastEntropyRef = useRef(entropy);
  const observationCooldownRef = useRef(0);
  
  // Auto-sync agent state with oscillator state
  useEffect(() => {
    const activeCount = oscillators.filter(o => o.amplitude > 0.1).length;
    
    setAgent(prev => updateAgentState(prev, {
      coherence,
      entropy,
      explorationProgress,
      memoryCount: memory.fragments.size,
      activeOscillatorCount: activeCount,
      tickCount
    }));
  }, [coherence, entropy, explorationProgress, memory.fragments.size, oscillators, tickCount]);
  
  // Auto-observations based on state changes
  useEffect(() => {
    if (observationCooldownRef.current > 0) {
      observationCooldownRef.current--;
      return;
    }
    
    const coherenceDelta = coherence - lastCoherenceRef.current;
    const entropyDelta = entropy - lastEntropyRef.current;
    
    // Significant coherence change
    if (Math.abs(coherenceDelta) > 0.15) {
      const direction = coherenceDelta > 0 ? 'increased' : 'decreased';
      const observation = `Coherence ${direction} significantly to ${coherence.toFixed(2)}`;
      setReasoning(prev => addObservationFact(prev, observation, Math.abs(coherenceDelta)));
      observationCooldownRef.current = 30; // Cooldown
    }
    
    // High coherence peak
    if (coherence > 0.8 && lastCoherenceRef.current <= 0.8) {
      setReasoning(prev => addObservationFact(prev, 'High coherence state achieved', coherence));
      observationCooldownRef.current = 30;
    }
    
    // Entropy threshold crossing
    if (entropy < 0.4 && lastEntropyRef.current >= 0.4) {
      setReasoning(prev => addObservationFact(prev, 'Low entropy stable state reached', 0.8));
      observationCooldownRef.current = 30;
    }
    
    // Exploration milestone
    if (explorationProgress > 0.5 && explorationProgress - 0.05 < 0.5) {
      setReasoning(prev => addObservationFact(prev, 'Exploration passed 50% coverage', 0.9));
      observationCooldownRef.current = 60;
    }
    
    lastCoherenceRef.current = coherence;
    lastEntropyRef.current = entropy;
  }, [coherence, entropy, explorationProgress]);
  
  // Memory decay effect
  useEffect(() => {
    const interval = setInterval(() => {
      setMemory(prev => applyMemoryDecay(prev, 0.1));
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
  // Track memory storage from autonomous agent
  const storeMemoryRef = useRef<(content: string, coh: number) => void>(() => {});
  
  // Autonomous agent execution when simulation is running
  useEffect(() => {
    if (isAgentAutonomous && isSimulationRunning) {
      agentStepIntervalRef.current = setInterval(() => {
        setAgent(prevAgent => {
          const selection = selectAction(prevAgent);
          if (selection) {
            const updatedAgent = executeAction(prevAgent, selection);
            setLastAgentAction(`${selection.action.name} → ${selection.targetGoal.description.slice(0, 30)}`);
            
            // If the action is memory-related and we need to store memories, actually store one
            if (selection.action.name === 'Store Memory' && prevAgent.state.memoryCount < 3) {
              // Generate a meaningful memory from current state
              const memoryContent = `Observation at tick ${prevAgent.state.tickCount}: coherence=${prevAgent.state.coherence.toFixed(2)}, entropy=${prevAgent.state.entropy.toFixed(2)}`;
              storeMemoryRef.current(memoryContent, prevAgent.state.coherence);
            }
            
            // Add observation about action taken
            setReasoning(prev => addObservationFact(
              prev,
              `Autonomous action: ${selection.action.name} for "${selection.targetGoal.description}"`,
              selection.confidence
            ));
            
            return updatedAgent;
          }
          return prevAgent;
        });
      }, 2000); // Run agent step every 2 seconds
    } else {
      if (agentStepIntervalRef.current) {
        clearInterval(agentStepIntervalRef.current);
        agentStepIntervalRef.current = null;
      }
    }
    
    return () => {
      if (agentStepIntervalRef.current) {
        clearInterval(agentStepIntervalRef.current);
      }
    };
  }, [isAgentAutonomous, isSimulationRunning]);
  
  // Memory actions
  const storeMemory = useCallback((content: string, coh: number) => {
    const result = encodeMemory(memory, content, coh);
    setMemory(result.memory);
    
    // Add observation about memory storage
    setReasoning(prev => addObservationFact(
      prev,
      `Stored memory: "${content.slice(0, 30)}..."`,
      coh
    ));
    
    return { fragmentId: result.fragmentId, location: result.location };
  }, [memory]);
  
  // Keep ref updated for autonomous agent access
  useEffect(() => {
    storeMemoryRef.current = storeMemory;
  }, [storeMemory]);
  
  const searchMemory = useCallback((q: string) => {
    return recallMemory(memory, q);
  }, [memory]);
  
  // Process user input: auto-store high coherence, recall related memories
  const processUserInput = useCallback((input: string, coh: number): { stored: boolean; recalled: { fragment: MemoryFragment; similarity: number }[] } => {
    const recalled = recallMemory(memory, input, 0.3);
    let stored = false;
    
    // Auto-store if coherence is high enough (> 0.5)
    if (coh > 0.5 && input.length > 5) {
      const result = encodeMemory(memory, input, coh);
      setMemory(result.memory);
      stored = true;
      
      setReasoning(prev => addObservationFact(
        prev,
        `Auto-stored high-coherence input: "${input.slice(0, 25)}..."`,
        coh
      ));
    }
    
    // If we recalled related memories, add observation
    if (recalled.length > 0) {
      setReasoning(prev => addObservationFact(
        prev,
        `Recalled ${recalled.length} related memories for input`,
        recalled[0].similarity
      ));
    }
    
    return { stored, recalled: recalled.map(r => ({ fragment: r.fragment, similarity: r.similarity })) };
  }, [memory]);
  
  // Reinject memory - this callback will be passed up to trigger oscillator effects
  const reinjectMemoryCallbackRef = useRef<((content: string) => void) | null>(null);
  
  const reinjectMemory = useCallback((content: string) => {
    // Add observation about reinjection
    setReasoning(prev => addObservationFact(
      prev,
      `Memory re-injected: "${content.slice(0, 30)}..."`,
      0.8
    ));
    
    // Call the external callback if set
    if (reinjectMemoryCallbackRef.current) {
      reinjectMemoryCallbackRef.current(content);
    }
  }, []);
  
  // Allow external code to set the reinject callback
  const setReinjectCallback = useCallback((callback: (content: string) => void) => {
    reinjectMemoryCallbackRef.current = callback;
  }, []);
  
  // Agent actions
  const updateObserverState = useCallback((update: Partial<AgentState>) => {
    setAgent(prev => updateAgentState(prev, update));
  }, []);
  
  const runAgentStep = useCallback(() => {
    const selection = selectAction(agent);
    if (selection) {
      setAgent(prev => executeAction(prev, selection));
      
      // Add observation about action taken
      setReasoning(prev => addObservationFact(
        prev,
        `Action taken: ${selection.action.name} for goal "${selection.targetGoal.description}"`,
        selection.confidence
      ));
    }
    return selection;
  }, [agent]);
  
  const getAgentGoals = useCallback(() => getActiveGoals(agent), [agent]);
  const getAgentActions = useCallback(() => getRecentActions(agent, 10), [agent]);
  
  // Collapse actions
  const createMeaningSuperposition = useCallback((input: string) => {
    const superposition = createSuperposition(input);
    setCurrentSuperposition(superposition);
    
    // Add observation
    setReasoning(prev => addObservationFact(
      prev,
      `Meaning superposition created for: "${input.slice(0, 30)}..."`,
      0.7
    ));
  }, []);
  
  const applyContext = useCallback((contextPrimes: number[], coh: number) => {
    if (!currentSuperposition) return;
    setCurrentSuperposition(prev => 
      prev ? applyMeasurementContext(prev, contextPrimes, coh) : null
    );
  }, [currentSuperposition]);
  
  const triggerCollapse = useCallback((coh: number): CollapseEvent | null => {
    if (!currentSuperposition || currentSuperposition.collapsed) return null;
    
    const { superposition, event } = collapseState(currentSuperposition, coh);
    setCurrentSuperposition(superposition);
    setCollapseHistory(prev => addCollapseEvent(prev, event));
    
    // Add observation about collapse
    setReasoning(prev => addObservationFact(
      prev,
      `Meaning collapsed to: ${event.collapsedState.interpretation}`,
      event.probability
    ));
    
    return event;
  }, [currentSuperposition]);
  
  const checkReanalysis = useCallback((newInput: string): boolean => {
    if (!currentSuperposition || !currentSuperposition.collapsed) return false;
    
    const reanalyzed = triggerReanalysis(currentSuperposition, newInput);
    if (!reanalyzed.collapsed) {
      setCurrentSuperposition(reanalyzed);
      setCollapseHistory(prev => ({ ...prev, reanalysisCount: prev.reanalysisCount + 1 }));
      
      setReasoning(prev => addObservationFact(
        prev,
        `Reanalysis triggered by contradictory input`,
        0.6
      ));
      
      return true;
    }
    return false;
  }, [currentSuperposition]);
  
  // Reasoning actions
  const addInputFact = useCallback((name: string, statement: string, confidence: number = 1) => {
    setReasoning(prev => addFact(prev, name, statement, confidence, 'input'));
  }, []);
  
  const addObservation = useCallback((observation: string, confidence: number) => {
    setReasoning(prev => addObservationFact(prev, observation, confidence));
  }, []);
  
  const runInference = useCallback(() => {
    const result = runReasoningChain(reasoning, 3);
    setReasoning(result.engine);
    return { newFacts: result.allNewFacts, steps: result.allSteps };
  }, [reasoning]);
  
  const queryFacts = useCallback((question: string) => {
    return query(reasoning, question);
  }, [reasoning]);
  
  const getFactChain = useCallback((factId: string) => {
    return getDerivationChain(reasoning, factId);
  }, [reasoning]);
  
  // Stats
  const getMemoryStatsCallback = useCallback(() => getMemoryStats(memory), [memory]);
  const getReasoningStatsCallback = useCallback(() => getReasoningStats(reasoning), [reasoning]);
  const getCollapseStatsCallback = useCallback(() => getCollapseStats(collapseHistory), [collapseHistory]);
  
  // Reset
  const resetCognitive = useCallback(() => {
    setMemory(createHolographicMemory());
    
    const initialState: AgentState = {
      coherence: 0.5,
      entropy: 0.5,
      explorationProgress: 0,
      memoryCount: 0,
      activeOscillatorCount: 0,
      lastInputTime: Date.now(),
      tickCount: 0,
      temperature: 0.5,
      coupling: 0.5
    };
    let a = createSemanticAgent(initialState);
    a = createDefaultGoals(a);
    a = createDefaultActions(a);
    setAgent(a);
    
    setCurrentSuperposition(null);
    setCollapseHistory(createCollapseHistory());
    
    let r = createReasoningEngine();
    r = addDefaultRules(r);
    setReasoning(r);
  }, []);
  
  return {
    memory,
    agent,
    currentSuperposition,
    collapseHistory,
    reasoning,
    
    // Autonomous agent
    isAgentAutonomous,
    setAgentAutonomous,
    lastAgentAction,
    
    storeMemory,
    searchMemory,
    processUserInput,
    reinjectMemory,
    
    updateObserverState,
    runAgentStep,
    getAgentGoals,
    getAgentActions,
    
    createMeaningSuperposition,
    applyContext,
    triggerCollapse,
    checkReanalysis,
    
    addInputFact,
    addObservation,
    runInference,
    queryFacts,
    getFactChain,
    
    getMemoryStats: getMemoryStatsCallback,
    getReasoningStats: getReasoningStatsCallback,
    getCollapseStats: getCollapseStatsCallback,
    
    resetCognitive
  };
}
