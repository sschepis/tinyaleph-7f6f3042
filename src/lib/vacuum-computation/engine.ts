/**
 * Vacuum Computation Engine
 * Implements entropy-based logical operations
 */

import {
  VacuumFluctuation,
  EntropyGate,
  LogicGateType,
  VacuumCircuit,
  FluctuationField,
  StructuredRegion,
  ComputationStep,
  ComputationResult,
  ThermodynamicMetrics,
  CircuitPreset
} from './types';

// Physical constants
const K_BOLTZMANN = 1.380649e-23; // J/K
const LN_2 = Math.log(2);
const ROOM_TEMP = 300; // Kelvin

// Calculate kT at given temperature
export function thermalEnergy(T: number = ROOM_TEMP): number {
  return K_BOLTZMANN * T;
}

// Landauer limit: minimum energy to erase one bit
export function landauerLimit(T: number = ROOM_TEMP): number {
  return thermalEnergy(T) * LN_2;
}

// Generate random fluctuation
export function createFluctuation(id: string): VacuumFluctuation {
  return {
    id,
    position: [
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 10
    ],
    amplitude: Math.random() * 0.5 + 0.1,
    phase: Math.random() * Math.PI * 2,
    frequency: Math.random() * 100 + 10,
    entropy: Math.random(),
    lifetime: Math.random() * 100 + 20
  };
}

// Generate fluctuation field
export function createFluctuationField(density: number = 50): FluctuationField {
  const fluctuations: VacuumFluctuation[] = [];
  for (let i = 0; i < density; i++) {
    fluctuations.push(createFluctuation(`f-${i}`));
  }
  
  return {
    fluctuations,
    averageAmplitude: fluctuations.reduce((s, f) => s + f.amplitude, 0) / density,
    averageEntropy: fluctuations.reduce((s, f) => s + f.entropy, 0) / density,
    fieldDensity: density,
    structuredRegions: []
  };
}

// Evolve fluctuation field
export function evolveField(field: FluctuationField, dt: number): FluctuationField {
  const evolved = field.fluctuations.map(f => {
    // Decay lifetime
    const newLifetime = f.lifetime - dt;
    if (newLifetime <= 0) {
      // Respawn fluctuation
      return createFluctuation(f.id);
    }
    
    // Evolve phase
    const newPhase = (f.phase + f.frequency * dt * 0.01) % (Math.PI * 2);
    
    // Random walk amplitude
    const newAmplitude = Math.max(0.01, f.amplitude + (Math.random() - 0.5) * 0.02);
    
    return {
      ...f,
      phase: newPhase,
      amplitude: newAmplitude,
      lifetime: newLifetime,
      entropy: f.entropy * 0.99 + Math.random() * 0.01
    };
  });
  
  return {
    ...field,
    fluctuations: evolved,
    averageAmplitude: evolved.reduce((s, f) => s + f.amplitude, 0) / evolved.length,
    averageEntropy: evolved.reduce((s, f) => s + f.entropy, 0) / evolved.length
  };
}

// Logic gate truth tables
const GATE_LOGIC: Record<LogicGateType, (inputs: boolean[]) => boolean> = {
  AND: (inputs) => inputs.every(Boolean),
  OR: (inputs) => inputs.some(Boolean),
  NOT: (inputs) => !inputs[0],
  XOR: (inputs) => inputs.reduce((a, b) => a !== b, false),
  NAND: (inputs) => !inputs.every(Boolean),
  NOR: (inputs) => !inputs.some(Boolean),
  XNOR: (inputs) => !inputs.reduce((a, b) => a !== b, false)
};

// Calculate entropy change for gate
function gateEntropyChange(type: LogicGateType, inputs: boolean[]): { entropyIn: number; entropyOut: number } {
  // Input entropy: sum of input bit entropies
  const entropyIn = inputs.length * 1; // Each bit has max 1 bit of entropy
  
  // Output entropy: depends on gate type
  // Irreversible gates lose entropy (information destruction)
  let entropyOut: number;
  
  switch (type) {
    case 'NOT':
      // Reversible: no entropy loss
      entropyOut = 1;
      break;
    case 'AND':
    case 'OR':
      // Irreversible: 2 bits in, 1 bit out, lose information
      entropyOut = 1;
      break;
    case 'XOR':
    case 'XNOR':
      // XOR is reversible if one input is known
      entropyOut = 1;
      break;
    case 'NAND':
    case 'NOR':
      // Irreversible
      entropyOut = 1;
      break;
    default:
      entropyOut = 1;
  }
  
  return { entropyIn, entropyOut };
}

// Calculate energy dissipation
function gateEnergyDissipation(type: LogicGateType, inputs: boolean[]): number {
  const { entropyIn, entropyOut } = gateEntropyChange(type, inputs);
  const entropyLoss = entropyIn - entropyOut;
  
  // Landauer: each bit erased costs kT ln(2)
  return Math.max(0, entropyLoss);
}

// Create entropy gate
export function createEntropyGate(
  id: string,
  type: LogicGateType,
  position: [number, number],
  inputs: boolean[] = []
): EntropyGate {
  const { entropyIn, entropyOut } = gateEntropyChange(type, inputs);
  const output = inputs.length > 0 && inputs.every(v => v !== null) 
    ? GATE_LOGIC[type](inputs) 
    : null;
  
  return {
    id,
    type,
    inputs,
    output,
    entropyIn,
    entropyOut,
    energyDissipated: gateEnergyDissipation(type, inputs),
    position
  };
}

// Evaluate gate with inputs
export function evaluateGate(gate: EntropyGate, inputs: boolean[]): EntropyGate {
  const output = GATE_LOGIC[gate.type](inputs);
  const { entropyIn, entropyOut } = gateEntropyChange(gate.type, inputs);
  
  return {
    ...gate,
    inputs,
    output,
    entropyIn,
    entropyOut,
    energyDissipated: gateEnergyDissipation(gate.type, inputs)
  };
}

// Create circuit from gates
export function createCircuit(
  name: string,
  gates: EntropyGate[],
  wires: { from: string | number; to: string; toPort: number }[]
): VacuumCircuit {
  const circuitWires = wires.map((w, i) => ({
    id: `w-${i}`,
    from: typeof w.from === 'number' 
      ? { type: 'input' as const, index: w.from }
      : { gateId: w.from, port: 'output' as const },
    to: { gateId: w.to, port: 'input' as const, index: w.toPort },
    value: null,
    entropyFlow: 0
  }));
  
  return {
    id: `circuit-${Date.now()}`,
    name,
    gates,
    wires: circuitWires,
    inputs: [],
    outputs: [],
    totalEntropy: gates.reduce((s, g) => s + g.entropyIn - g.entropyOut, 0),
    totalEnergy: gates.reduce((s, g) => s + g.energyDissipated, 0),
    landauerLimit: gates.filter(g => g.type !== 'NOT').length // Non-reversible gates
  };
}

// Simulate circuit execution
export function simulateCircuit(circuit: VacuumCircuit, inputs: boolean[]): ComputationResult {
  const steps: ComputationStep[] = [];
  const startTime = Date.now();
  
  // Input step
  steps.push({
    timestamp: Date.now(),
    action: 'input',
    values: [...inputs],
    entropy: inputs.length,
    energy: 0
  });
  
  // Build dependency graph
  const gateInputs: Map<string, (boolean | null)[]> = new Map();
  circuit.gates.forEach(g => {
    gateInputs.set(g.id, new Array(g.type === 'NOT' ? 1 : 2).fill(null));
  });
  
  // Initialize from circuit inputs
  circuit.wires.forEach(w => {
    if ('type' in w.from && w.from.type === 'input') {
      const arr = gateInputs.get(w.to.gateId);
      if (arr) {
        arr[w.to.index] = inputs[w.from.index];
      }
    }
  });
  
  // Topological sort and evaluate
  const evaluated = new Set<string>();
  let totalEntropy = 0;
  let totalEnergy = 0;
  const outputs: Map<string, boolean> = new Map();
  
  const evaluateGateById = (gateId: string): boolean | null => {
    if (evaluated.has(gateId)) {
      return outputs.get(gateId) ?? null;
    }
    
    const gate = circuit.gates.find(g => g.id === gateId);
    if (!gate) return null;
    
    const inputValues = gateInputs.get(gateId);
    if (!inputValues || inputValues.some(v => v === null)) {
      // Need to evaluate dependencies first
      circuit.wires
        .filter(w => w.to.gateId === gateId && 'gateId' in w.from)
        .forEach(w => {
          if ('gateId' in w.from) {
            const depResult = evaluateGateById(w.from.gateId);
            if (depResult !== null && inputValues) {
              inputValues[w.to.index] = depResult;
            }
          }
        });
    }
    
    const finalInputs = inputValues?.filter((v): v is boolean => v !== null) ?? [];
    if (finalInputs.length < (gate.type === 'NOT' ? 1 : 2)) {
      return null;
    }
    
    const result = GATE_LOGIC[gate.type](finalInputs);
    outputs.set(gateId, result);
    evaluated.add(gateId);
    
    const { entropyIn, entropyOut } = gateEntropyChange(gate.type, finalInputs);
    const energy = gateEnergyDissipation(gate.type, finalInputs);
    totalEntropy += entropyIn - entropyOut;
    totalEnergy += energy;
    
    steps.push({
      timestamp: Date.now(),
      action: 'gate',
      gateId,
      values: [result],
      entropy: entropyIn - entropyOut,
      energy
    });
    
    return result;
  };
  
  // Evaluate all gates
  circuit.gates.forEach(g => evaluateGateById(g.id));
  
  // Collect outputs (gates with no outgoing wires)
  const outputGates = circuit.gates.filter(g => 
    !circuit.wires.some(w => 'gateId' in w.from && w.from.gateId === g.id)
  );
  
  const finalOutputs = outputGates.map(g => outputs.get(g.id) ?? false);
  
  // Output step
  steps.push({
    timestamp: Date.now(),
    action: 'output',
    values: finalOutputs,
    entropy: 0,
    energy: 0
  });
  
  const executionTime = Date.now() - startTime;
  const theoreticalMin = circuit.landauerLimit;
  
  return {
    success: true,
    output: finalOutputs,
    steps,
    totalEntropy,
    totalEnergy,
    landauerEfficiency: theoreticalMin > 0 ? theoreticalMin / totalEnergy : 1,
    executionTime
  };
}

// Calculate thermodynamic metrics
export function calculateMetrics(
  result: ComputationResult,
  temperature: number = ROOM_TEMP
): ThermodynamicMetrics {
  const kT = thermalEnergy(temperature);
  const landauerCost = landauerLimit(temperature);
  const actualCost = result.totalEnergy * landauerCost;
  
  return {
    temperature,
    kT,
    landauerCost,
    actualCost,
    efficiency: result.landauerEfficiency,
    reversibleFraction: result.totalEnergy > 0 
      ? 1 - (result.totalEntropy / result.totalEnergy)
      : 1
  };
}

// Preset circuits
export const CIRCUIT_PRESETS: CircuitPreset[] = [
  {
    name: 'Half Adder',
    description: 'Sum = A XOR B, Carry = A AND B',
    gates: [
      { id: 'xor1', type: 'XOR', inputs: [], position: [100, 100] },
      { id: 'and1', type: 'AND', inputs: [], position: [100, 200] }
    ],
    wires: [
      { from: { type: 'input', index: 0 }, to: { gateId: 'xor1', port: 'input', index: 0 }, id: 'w1', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 1 }, to: { gateId: 'xor1', port: 'input', index: 1 }, id: 'w2', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 0 }, to: { gateId: 'and1', port: 'input', index: 0 }, id: 'w3', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 1 }, to: { gateId: 'and1', port: 'input', index: 1 }, id: 'w4', value: null, entropyFlow: 0 }
    ],
    inputLabels: ['A', 'B'],
    outputLabels: ['Sum', 'Carry']
  },
  {
    name: 'Full Adder',
    description: 'Sum and Carry with carry-in',
    gates: [
      { id: 'xor1', type: 'XOR', inputs: [], position: [100, 100] },
      { id: 'xor2', type: 'XOR', inputs: [], position: [200, 100] },
      { id: 'and1', type: 'AND', inputs: [], position: [100, 200] },
      { id: 'and2', type: 'AND', inputs: [], position: [200, 200] },
      { id: 'or1', type: 'OR', inputs: [], position: [300, 200] }
    ],
    wires: [
      { from: { type: 'input', index: 0 }, to: { gateId: 'xor1', port: 'input', index: 0 }, id: 'w1', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 1 }, to: { gateId: 'xor1', port: 'input', index: 1 }, id: 'w2', value: null, entropyFlow: 0 },
      { from: { gateId: 'xor1', port: 'output' }, to: { gateId: 'xor2', port: 'input', index: 0 }, id: 'w3', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 2 }, to: { gateId: 'xor2', port: 'input', index: 1 }, id: 'w4', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 0 }, to: { gateId: 'and1', port: 'input', index: 0 }, id: 'w5', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 1 }, to: { gateId: 'and1', port: 'input', index: 1 }, id: 'w6', value: null, entropyFlow: 0 },
      { from: { gateId: 'xor1', port: 'output' }, to: { gateId: 'and2', port: 'input', index: 0 }, id: 'w7', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 2 }, to: { gateId: 'and2', port: 'input', index: 1 }, id: 'w8', value: null, entropyFlow: 0 },
      { from: { gateId: 'and1', port: 'output' }, to: { gateId: 'or1', port: 'input', index: 0 }, id: 'w9', value: null, entropyFlow: 0 },
      { from: { gateId: 'and2', port: 'output' }, to: { gateId: 'or1', port: 'input', index: 1 }, id: 'w10', value: null, entropyFlow: 0 }
    ],
    inputLabels: ['A', 'B', 'Cin'],
    outputLabels: ['Sum', 'Cout']
  },
  {
    name: 'NOT Gate',
    description: 'Single reversible inverter (no energy cost)',
    gates: [
      { id: 'not1', type: 'NOT', inputs: [], position: [150, 150] }
    ],
    wires: [
      { from: { type: 'input', index: 0 }, to: { gateId: 'not1', port: 'input', index: 0 }, id: 'w1', value: null, entropyFlow: 0 }
    ],
    inputLabels: ['In'],
    outputLabels: ['Out']
  },
  {
    name: 'NAND Universal',
    description: 'AND from NAND gates (universal gate)',
    gates: [
      { id: 'nand1', type: 'NAND', inputs: [], position: [100, 150] },
      { id: 'nand2', type: 'NAND', inputs: [], position: [200, 150] }
    ],
    wires: [
      { from: { type: 'input', index: 0 }, to: { gateId: 'nand1', port: 'input', index: 0 }, id: 'w1', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 1 }, to: { gateId: 'nand1', port: 'input', index: 1 }, id: 'w2', value: null, entropyFlow: 0 },
      { from: { gateId: 'nand1', port: 'output' }, to: { gateId: 'nand2', port: 'input', index: 0 }, id: 'w3', value: null, entropyFlow: 0 },
      { from: { gateId: 'nand1', port: 'output' }, to: { gateId: 'nand2', port: 'input', index: 1 }, id: 'w4', value: null, entropyFlow: 0 }
    ],
    inputLabels: ['A', 'B'],
    outputLabels: ['A AND B']
  },
  {
    name: 'XOR Parity',
    description: '3-input parity check (reversible)',
    gates: [
      { id: 'xor1', type: 'XOR', inputs: [], position: [100, 150] },
      { id: 'xor2', type: 'XOR', inputs: [], position: [200, 150] }
    ],
    wires: [
      { from: { type: 'input', index: 0 }, to: { gateId: 'xor1', port: 'input', index: 0 }, id: 'w1', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 1 }, to: { gateId: 'xor1', port: 'input', index: 1 }, id: 'w2', value: null, entropyFlow: 0 },
      { from: { gateId: 'xor1', port: 'output' }, to: { gateId: 'xor2', port: 'input', index: 0 }, id: 'w3', value: null, entropyFlow: 0 },
      { from: { type: 'input', index: 2 }, to: { gateId: 'xor2', port: 'input', index: 1 }, id: 'w4', value: null, entropyFlow: 0 }
    ],
    inputLabels: ['A', 'B', 'C'],
    outputLabels: ['Parity']
  }
];

// Build circuit from preset
export function buildFromPreset(preset: CircuitPreset, inputs: boolean[]): VacuumCircuit {
  const gates = preset.gates.map(g => createEntropyGate(
    g.id,
    g.type,
    g.position,
    []
  ));
  
  return {
    id: `circuit-${Date.now()}`,
    name: preset.name,
    gates,
    wires: preset.wires,
    inputs,
    outputs: [],
    totalEntropy: 0,
    totalEnergy: 0,
    landauerLimit: gates.filter(g => g.type !== 'NOT' && g.type !== 'XOR' && g.type !== 'XNOR').length
  };
}
