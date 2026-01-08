import { GateInstance, Wire } from './types';

export interface SavedCircuit {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  numQubits: number;
  gates: Array<{
    type: string;
    wireIndex: number;
    position: number;
    controlWire?: number;
    controlWire2?: number;
    parameter?: number;
  }>;
}

export interface CircuitSnapshot {
  timestamp: number;
  gates: GateInstance[];
  wires: Wire[];
  label?: string;
}

const STORAGE_KEY = 'quantum-circuit-saved-circuits';

// Get all saved circuits
export const getSavedCircuits = (): SavedCircuit[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save a circuit
export const saveCircuit = (
  name: string,
  numQubits: number,
  gates: GateInstance[],
  existingId?: string
): SavedCircuit => {
  const circuits = getSavedCircuits();
  const now = Date.now();
  
  const circuitData = {
    id: existingId || `circuit-${now}`,
    name,
    createdAt: existingId ? circuits.find(c => c.id === existingId)?.createdAt || now : now,
    updatedAt: now,
    numQubits,
    gates: gates.map(g => ({
      type: g.type,
      wireIndex: g.wireIndex,
      position: g.position,
      controlWire: g.controlWire,
      controlWire2: g.controlWire2,
      parameter: g.parameter,
    })),
  };
  
  if (existingId) {
    const index = circuits.findIndex(c => c.id === existingId);
    if (index >= 0) {
      circuits[index] = circuitData;
    } else {
      circuits.unshift(circuitData);
    }
  } else {
    circuits.unshift(circuitData);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(circuits));
  return circuitData;
};

// Load a circuit
export const loadCircuit = (id: string): SavedCircuit | null => {
  const circuits = getSavedCircuits();
  return circuits.find(c => c.id === id) || null;
};

// Delete a circuit
export const deleteCircuit = (id: string): void => {
  const circuits = getSavedCircuits().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(circuits));
};

// Rename a circuit
export const renameCircuit = (id: string, newName: string): void => {
  const circuits = getSavedCircuits();
  const circuit = circuits.find(c => c.id === id);
  if (circuit) {
    circuit.name = newName;
    circuit.updatedAt = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(circuits));
  }
};

// Convert saved circuit to runtime format
export const savedCircuitToRuntime = (
  saved: SavedCircuit
): { wires: Wire[]; gates: GateInstance[] } => {
  const wires: Wire[] = Array.from({ length: saved.numQubits }, (_, i) => ({
    id: i + 1,
    label: `q[${i}]`,
  }));
  
  const gates: GateInstance[] = saved.gates.map((g, idx) => ({
    id: `gate-${idx + 1}`,
    type: g.type as any,
    wireIndex: g.wireIndex,
    position: g.position,
    controlWire: g.controlWire,
    controlWire2: g.controlWire2,
    parameter: g.parameter,
  }));
  
  return { wires, gates };
};

// Circuit history management
export class CircuitHistoryManager {
  private undoStack: CircuitSnapshot[] = [];
  private redoStack: CircuitSnapshot[] = [];
  private maxHistory = 50;
  
  push(gates: GateInstance[], wires: Wire[], label?: string): void {
    this.undoStack.push({
      timestamp: Date.now(),
      gates: JSON.parse(JSON.stringify(gates)),
      wires: JSON.parse(JSON.stringify(wires)),
      label,
    });
    
    // Clear redo stack on new action
    this.redoStack = [];
    
    // Limit history size
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
  }
  
  undo(): CircuitSnapshot | null {
    if (this.undoStack.length <= 1) return null;
    
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);
    
    return this.undoStack[this.undoStack.length - 1] || null;
  }
  
  redo(): CircuitSnapshot | null {
    if (this.redoStack.length === 0) return null;
    
    const snapshot = this.redoStack.pop()!;
    this.undoStack.push(snapshot);
    
    return snapshot;
  }
  
  canUndo(): boolean {
    return this.undoStack.length > 1;
  }
  
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }
  
  getHistory(): CircuitSnapshot[] {
    return [...this.undoStack];
  }
  
  getUndoStack(): CircuitSnapshot[] {
    return [...this.undoStack];
  }
  
  getRedoStack(): CircuitSnapshot[] {
    return [...this.redoStack];
  }
  
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
  
  initialize(gates: GateInstance[], wires: Wire[]): void {
    this.clear();
    this.push(gates, wires, 'Initial state');
  }
}
