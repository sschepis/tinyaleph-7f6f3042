import { ComplexNumber, GateInstance } from './types';
import { applyGateToState, computeEntropy } from './simulation';

export interface DebugState {
  stepIndex: number;
  state: ComplexNumber[];
  gate: GateInstance | null;
  entropy: number;
  probabilities: number[];
}

export interface BreakCondition {
  type: 'probability' | 'entropy' | 'entanglement';
  qubit?: number;
  threshold: number;
  comparison: 'above' | 'below';
}

export interface WatchItem {
  id: string;
  type: 'qubit_prob' | 'entropy' | 'amplitude';
  qubit?: number;
  basisState?: number;
  label: string;
}

export interface WatchValue {
  watchId: string;
  value: number;
  history: number[];
}

export interface DebugSession {
  gates: GateInstance[];
  numWires: number;
  breakpoints: Set<string>; // gate IDs
  breakConditions: BreakCondition[];
  watchList: WatchItem[];
  watchValues: WatchValue[];
  history: DebugState[];
  currentStep: number;
  isRunning: boolean;
  hitBreakpoint: string | null;
  hitCondition: BreakCondition | null;
}

// Initialize a fresh debug session
export const initDebugSession = (
  gates: GateInstance[],
  numWires: number
): DebugSession => {
  const dimensions = Math.pow(2, numWires);
  const initialState: ComplexNumber[] = Array.from({ length: dimensions }, (_, i) =>
    i === 0 ? { real: 1, imag: 0 } : { real: 0, imag: 0 }
  );
  const probs = initialState.map(s => s.real * s.real + s.imag * s.imag);
  
  return {
    gates: [...gates].sort((a, b) => a.position - b.position),
    numWires,
    breakpoints: new Set(),
    breakConditions: [],
    watchList: [],
    watchValues: [],
    history: [{
      stepIndex: 0,
      state: initialState,
      gate: null,
      entropy: 0,
      probabilities: probs,
    }],
    currentStep: 0,
    isRunning: false,
    hitBreakpoint: null,
    hitCondition: null,
  };
};

// Execute a single step
export const stepForward = (session: DebugSession): DebugSession => {
  if (session.currentStep >= session.gates.length) {
    return session; // Already at end
  }
  
  const nextGateIndex = session.currentStep;
  const gate = session.gates[nextGateIndex];
  const prevState = session.history[session.history.length - 1].state;
  
  const newState = applyGateToState(
    prevState,
    gate.type,
    gate.wireIndex,
    session.numWires,
    gate.controlWire,
    gate.controlWire2,
    gate.parameter
  );
  
  const probs = newState.map(s => s.real * s.real + s.imag * s.imag);
  const entropy = computeEntropy(newState);
  
  const debugState: DebugState = {
    stepIndex: nextGateIndex + 1,
    state: newState,
    gate,
    entropy,
    probabilities: probs,
  };
  
  const updatedSession: DebugSession = {
    ...session,
    history: [...session.history, debugState],
    currentStep: session.currentStep + 1,
    hitBreakpoint: null,
    hitCondition: null,
  };
  
  // Update watch values
  updatedSession.watchValues = updateWatchValues(updatedSession);
  
  return updatedSession;
};

// Step backward (use history)
export const stepBackward = (session: DebugSession): DebugSession => {
  if (session.currentStep <= 0) {
    return session; // Already at start
  }
  
  return {
    ...session,
    history: session.history.slice(0, -1),
    currentStep: session.currentStep - 1,
    hitBreakpoint: null,
    hitCondition: null,
  };
};

// Check if a condition is met
const checkCondition = (
  condition: BreakCondition,
  state: ComplexNumber[],
  numWires: number
): boolean => {
  const probs = state.map(s => s.real * s.real + s.imag * s.imag);
  
  if (condition.type === 'probability' && condition.qubit !== undefined) {
    // Calculate probability of |1⟩ on the specified qubit
    const mask = 1 << (numWires - 1 - condition.qubit);
    let prob1 = 0;
    for (let i = 0; i < probs.length; i++) {
      if ((i & mask) !== 0) prob1 += probs[i];
    }
    
    return condition.comparison === 'above' 
      ? prob1 > condition.threshold 
      : prob1 < condition.threshold;
  }
  
  if (condition.type === 'entropy') {
    const entropy = computeEntropy(state);
    return condition.comparison === 'above'
      ? entropy > condition.threshold
      : entropy < condition.threshold;
  }
  
  if (condition.type === 'entanglement') {
    // Check for entanglement using entropy of reduced density matrix approximation
    const entropy = computeEntropy(state);
    return condition.comparison === 'above'
      ? entropy > condition.threshold
      : entropy < condition.threshold;
  }
  
  return false;
};

// Run until breakpoint or condition
export const runUntilBreak = (session: DebugSession): DebugSession => {
  let current = { ...session, isRunning: true, hitBreakpoint: null, hitCondition: null };
  
  while (current.currentStep < current.gates.length) {
    const nextGate = current.gates[current.currentStep];
    
    // Check gate breakpoint BEFORE executing
    if (current.breakpoints.has(nextGate.id)) {
      return { ...current, isRunning: false, hitBreakpoint: nextGate.id };
    }
    
    // Execute the gate
    current = stepForward(current);
    
    // Check conditions AFTER executing
    const latestState = current.history[current.history.length - 1].state;
    for (const condition of current.breakConditions) {
      if (checkCondition(condition, latestState, current.numWires)) {
        return { ...current, isRunning: false, hitCondition: condition };
      }
    }
  }
  
  return { ...current, isRunning: false };
};

// Run to a specific gate index
export const runToGate = (session: DebugSession, gateIndex: number): DebugSession => {
  let current = { ...session };
  
  // If we need to go backward, reset to beginning
  if (gateIndex < current.currentStep) {
    current = initDebugSession(session.gates, session.numWires);
    current.breakpoints = session.breakpoints;
    current.breakConditions = session.breakConditions;
  }
  
  while (current.currentStep < gateIndex && current.currentStep < current.gates.length) {
    current = stepForward(current);
  }
  
  return current;
};

// Toggle breakpoint on a gate
export const toggleBreakpoint = (session: DebugSession, gateId: string): DebugSession => {
  const breakpoints = new Set(session.breakpoints);
  if (breakpoints.has(gateId)) {
    breakpoints.delete(gateId);
  } else {
    breakpoints.add(gateId);
  }
  return { ...session, breakpoints };
};

// Add a conditional break
export const addBreakCondition = (
  session: DebugSession,
  condition: BreakCondition
): DebugSession => {
  return {
    ...session,
    breakConditions: [...session.breakConditions, condition],
  };
};

// Remove a conditional break
export const removeBreakCondition = (
  session: DebugSession,
  index: number
): DebugSession => {
  return {
    ...session,
    breakConditions: session.breakConditions.filter((_, i) => i !== index),
  };
};

// Get qubit probability at current state
export const getQubitProbability = (
  state: ComplexNumber[],
  qubit: number,
  numWires: number
): { prob0: number; prob1: number } => {
  const probs = state.map(s => s.real * s.real + s.imag * s.imag);
  const mask = 1 << (numWires - 1 - qubit);
  let prob1 = 0;
  for (let i = 0; i < probs.length; i++) {
    if ((i & mask) !== 0) prob1 += probs[i];
  }
  return { prob0: 1 - prob1, prob1 };
};

// Calculate a watch item's value for a given state
export const calculateWatchValue = (
  watch: WatchItem,
  state: ComplexNumber[],
  numWires: number
): number => {
  const probs = state.map(s => s.real * s.real + s.imag * s.imag);
  
  switch (watch.type) {
    case 'qubit_prob':
      if (watch.qubit !== undefined) {
        const mask = 1 << (numWires - 1 - watch.qubit);
        let prob1 = 0;
        for (let i = 0; i < probs.length; i++) {
          if ((i & mask) !== 0) prob1 += probs[i];
        }
        return prob1;
      }
      return 0;
      
    case 'entropy':
      return computeEntropy(state);
      
    case 'amplitude':
      if (watch.basisState !== undefined && watch.basisState < state.length) {
        const amp = state[watch.basisState];
        return Math.sqrt(amp.real * amp.real + amp.imag * amp.imag);
      }
      return 0;
      
    default:
      return 0;
  }
};

// Update all watch values for current state
export const updateWatchValues = (session: DebugSession): WatchValue[] => {
  const currentState = session.history[session.history.length - 1].state;
  
  return session.watchList.map(watch => {
    const value = calculateWatchValue(watch, currentState, session.numWires);
    const existing = session.watchValues.find(wv => wv.watchId === watch.id);
    const history = existing ? [...existing.history, value] : [value];
    
    return {
      watchId: watch.id,
      value,
      history: history.slice(-50), // Keep last 50 values
    };
  });
};

// Add a watch item
export const addWatch = (
  session: DebugSession,
  watch: Omit<WatchItem, 'id'>
): DebugSession => {
  const id = `watch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newWatch: WatchItem = { ...watch, id };
  const currentState = session.history[session.history.length - 1].state;
  const value = calculateWatchValue(newWatch, currentState, session.numWires);
  
  return {
    ...session,
    watchList: [...session.watchList, newWatch],
    watchValues: [...session.watchValues, { watchId: id, value, history: [value] }],
  };
};

// Remove a watch item
export const removeWatch = (session: DebugSession, watchId: string): DebugSession => {
  return {
    ...session,
    watchList: session.watchList.filter(w => w.id !== watchId),
    watchValues: session.watchValues.filter(wv => wv.watchId !== watchId),
  };
};
