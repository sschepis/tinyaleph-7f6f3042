/**
 * Vacuum Computation Types
 * Entropy-based logical operations through structured fluctuations
 */

// Basic fluctuation unit
export interface VacuumFluctuation {
  id: string;
  position: [number, number, number]; // 3D position
  amplitude: number;
  phase: number;
  frequency: number;
  entropy: number;
  lifetime: number; // ms until decay
}

// Logical gate types
export type LogicGateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR' | 'XNOR';

// Entropy-based logic gate
export interface EntropyGate {
  id: string;
  type: LogicGateType;
  inputs: boolean[];
  output: boolean | null;
  entropyIn: number;
  entropyOut: number;
  energyDissipated: number; // kT ln(2) units
  position: [number, number];
}

// Circuit wire
export interface CircuitWire {
  id: string;
  from: { gateId: string; port: 'output' } | { type: 'input'; index: number };
  to: { gateId: string; port: 'input'; index: number };
  value: boolean | null;
  entropyFlow: number;
}

// Complete circuit
export interface VacuumCircuit {
  id: string;
  name: string;
  gates: EntropyGate[];
  wires: CircuitWire[];
  inputs: boolean[];
  outputs: boolean[];
  totalEntropy: number;
  totalEnergy: number; // kT ln(2) units
  landauerLimit: number; // Theoretical minimum
}

// Fluctuation field state
export interface FluctuationField {
  fluctuations: VacuumFluctuation[];
  averageAmplitude: number;
  averageEntropy: number;
  fieldDensity: number; // fluctuations per unit volume
  structuredRegions: StructuredRegion[];
}

// Structured region in the vacuum
export interface StructuredRegion {
  id: string;
  center: [number, number, number];
  radius: number;
  structure: 'gate' | 'wire' | 'memory' | 'buffer';
  coherence: number; // 0-1
  entropyReduction: number;
}

// Computation step
export interface ComputationStep {
  timestamp: number;
  action: 'input' | 'gate' | 'propagate' | 'collapse' | 'output';
  gateId?: string;
  values: boolean[];
  entropy: number;
  energy: number;
}

// Full computation result
export interface ComputationResult {
  success: boolean;
  output: boolean[];
  steps: ComputationStep[];
  totalEntropy: number;
  totalEnergy: number;
  landauerEfficiency: number; // actual / theoretical minimum
  executionTime: number;
}

// Thermodynamic metrics
export interface ThermodynamicMetrics {
  temperature: number; // Kelvin
  kT: number; // thermal energy
  landauerCost: number; // kT ln(2)
  actualCost: number;
  efficiency: number;
  reversibleFraction: number;
}

// System state
export interface VacuumComputationState {
  field: FluctuationField;
  circuit: VacuumCircuit | null;
  isRunning: boolean;
  time: number;
  metrics: ThermodynamicMetrics;
  history: ComputationStep[];
  mode: 'design' | 'simulate' | 'analyze';
}

// Preset circuits
export interface CircuitPreset {
  name: string;
  description: string;
  gates: Omit<EntropyGate, 'output' | 'entropyIn' | 'entropyOut' | 'energyDissipated'>[];
  wires: CircuitWire[];
  inputLabels: string[];
  outputLabels: string[];
}
