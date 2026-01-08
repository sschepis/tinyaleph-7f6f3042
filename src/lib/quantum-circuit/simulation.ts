import { ComplexNumber, GateType, GateInstance, TomographyResult } from './types';

// Seeded random for deterministic behavior
export const seededRandom = (seed: number): number => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// Quantum state simulation
export const applyGateToState = (
  state: ComplexNumber[],
  gateType: GateType,
  wireIndex: number,
  numWires: number,
  controlWire?: number,
  controlWire2?: number,
  parameter?: number
): ComplexNumber[] => {
  const newState = state.map(s => ({ ...s }));
  const wirePositionMask = 1 << (numWires - 1 - wireIndex);
  
  switch (gateType) {
    case 'H':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) === 0) {
          const j = i | wirePositionMask;
          const temp = {
            real: (state[i].real + state[j].real) / Math.SQRT2,
            imag: (state[i].imag + state[j].imag) / Math.SQRT2,
          };
          newState[j] = {
            real: (state[i].real - state[j].real) / Math.SQRT2,
            imag: (state[i].imag - state[j].imag) / Math.SQRT2,
          };
          newState[i] = temp;
        }
      }
      break;
      
    case 'X':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) === 0) {
          const j = i | wirePositionMask;
          [newState[i], newState[j]] = [{ ...state[j] }, { ...state[i] }];
        }
      }
      break;
      
    case 'Y':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) === 0) {
          const j = i | wirePositionMask;
          newState[i] = { real: state[j].imag, imag: -state[j].real };
          newState[j] = { real: -state[i].imag, imag: state[i].real };
        }
      }
      break;
      
    case 'Z':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) !== 0) {
          newState[i] = { real: -state[i].real, imag: -state[i].imag };
        }
      }
      break;
      
    case 'S':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) !== 0) {
          newState[i] = { real: -state[i].imag, imag: state[i].real };
        }
      }
      break;
      
    case 'T':
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) !== 0) {
          const cos = Math.cos(Math.PI / 4);
          const sin = Math.sin(Math.PI / 4);
          newState[i] = {
            real: state[i].real * cos - state[i].imag * sin,
            imag: state[i].real * sin + state[i].imag * cos,
          };
        }
      }
      break;

    case 'RZ':
      const theta = parameter ?? Math.PI / 4;
      for (let i = 0; i < state.length; i++) {
        if ((i & wirePositionMask) !== 0) {
          const cos = Math.cos(theta / 2);
          const sin = Math.sin(theta / 2);
          newState[i] = {
            real: state[i].real * cos - state[i].imag * sin,
            imag: state[i].real * sin + state[i].imag * cos,
          };
        }
      }
      break;
      
    case 'CNOT':
      if (controlWire !== undefined) {
        const controlMask = 1 << (numWires - 1 - controlWire);
        for (let i = 0; i < state.length; i++) {
          if ((i & controlMask) !== 0 && (i & wirePositionMask) === 0) {
            const j = i | wirePositionMask;
            [newState[i], newState[j]] = [{ ...state[j] }, { ...state[i] }];
          }
        }
      }
      break;
    
    case 'CZ':
      if (controlWire !== undefined) {
        const controlMask = 1 << (numWires - 1 - controlWire);
        for (let i = 0; i < state.length; i++) {
          if ((i & controlMask) !== 0 && (i & wirePositionMask) !== 0) {
            newState[i] = { real: -state[i].real, imag: -state[i].imag };
          }
        }
      }
      break;
    
    case 'CPHASE':
      if (controlWire !== undefined) {
        const controlMask = 1 << (numWires - 1 - controlWire);
        const cos = Math.cos(Math.PI / 4);
        const sin = Math.sin(Math.PI / 4);
        for (let i = 0; i < state.length; i++) {
          if ((i & controlMask) !== 0 && (i & wirePositionMask) !== 0) {
            newState[i] = {
              real: state[i].real * cos - state[i].imag * sin,
              imag: state[i].real * sin + state[i].imag * cos,
            };
          }
        }
      }
      break;
      
    case 'SWAP':
      if (wireIndex < numWires - 1) {
        const otherWireMask = 1 << (numWires - 2 - wireIndex);
        for (let i = 0; i < state.length; i++) {
          const bit1 = (i & wirePositionMask) !== 0;
          const bit2 = (i & otherWireMask) !== 0;
          if (bit1 !== bit2) {
            const j = i ^ wirePositionMask ^ otherWireMask;
            if (i < j) {
              [newState[i], newState[j]] = [{ ...state[j] }, { ...state[i] }];
            }
          }
        }
      }
      break;
    
    case 'CCX':
      if (controlWire !== undefined && controlWire2 !== undefined) {
        const control1Mask = 1 << (numWires - 1 - controlWire);
        const control2Mask = 1 << (numWires - 1 - controlWire2);
        for (let i = 0; i < state.length; i++) {
          if ((i & control1Mask) !== 0 && (i & control2Mask) !== 0 && (i & wirePositionMask) === 0) {
            const j = i | wirePositionMask;
            [newState[i], newState[j]] = [{ ...state[j] }, { ...state[i] }];
          }
        }
      }
      break;
    
    case 'CSWAP':
      if (controlWire !== undefined && wireIndex < numWires - 1) {
        const controlMask = 1 << (numWires - 1 - controlWire);
        const target2Mask = 1 << (numWires - 2 - wireIndex);
        for (let i = 0; i < state.length; i++) {
          if ((i & controlMask) !== 0) {
            const bit1 = (i & wirePositionMask) !== 0;
            const bit2 = (i & target2Mask) !== 0;
            if (bit1 !== bit2) {
              const j = i ^ wirePositionMask ^ target2Mask;
              if (i < j) {
                [newState[i], newState[j]] = [{ ...state[j] }, { ...state[i] }];
              }
            }
          }
        }
      }
      break;
  }
  
  return newState;
};

// Execute a circuit
export const executeCircuit = (
  gates: GateInstance[],
  numWires: number,
  parameterOverrides?: Map<string, number>
): ComplexNumber[] => {
  const dimensions = Math.pow(2, numWires);
  let state: ComplexNumber[] = Array.from({ length: dimensions }, (_, i) => 
    i === 0 ? { real: 1, imag: 0 } : { real: 0, imag: 0 }
  );
  
  const sortedGates = [...gates].sort((a, b) => a.position - b.position);
  
  for (const gate of sortedGates) {
    const param = parameterOverrides?.get(gate.id) ?? gate.parameter;
    state = applyGateToState(state, gate.type, gate.wireIndex, numWires, gate.controlWire, gate.controlWire2, param);
  }
  
  return state;
};

// Convert state to sedenion for visualization
export const stateToSedenion = (state: ComplexNumber[]): number[] => {
  const components = new Array(16).fill(0);
  state.forEach((s, i) => {
    const amplitude = Math.sqrt(s.real * s.real + s.imag * s.imag);
    components[i % 16] += amplitude;
  });
  const norm = Math.sqrt(components.reduce((sum, v) => sum + v * v, 0)) || 1;
  return components.map(v => v / norm);
};

// Compute entropy from state
export const computeEntropy = (state: ComplexNumber[]): number => {
  const probs = state.map(s => s.real * s.real + s.imag * s.imag);
  const total = probs.reduce((a, b) => a + b, 0) || 1;
  return -probs.reduce((h, p) => {
    const normalized = p / total;
    return normalized > 0 ? h + normalized * Math.log2(normalized) : h;
  }, 0);
};

// Calculate expectation value of Z operator (for VQE/QAOA energy)
export const calculateExpectationZ = (state: ComplexNumber[], qubit: number, numWires: number): number => {
  const mask = 1 << (numWires - 1 - qubit);
  let expectation = 0;
  for (let i = 0; i < state.length; i++) {
    const prob = state[i].real * state[i].real + state[i].imag * state[i].imag;
    expectation += ((i & mask) === 0 ? 1 : -1) * prob;
  }
  return expectation;
};

// Calculate ZZ expectation for QAOA cost
export const calculateExpectationZZ = (state: ComplexNumber[], q1: number, q2: number, numWires: number): number => {
  const mask1 = 1 << (numWires - 1 - q1);
  const mask2 = 1 << (numWires - 1 - q2);
  let expectation = 0;
  for (let i = 0; i < state.length; i++) {
    const prob = state[i].real * state[i].real + state[i].imag * state[i].imag;
    const z1 = (i & mask1) === 0 ? 1 : -1;
    const z2 = (i & mask2) === 0 ? 1 : -1;
    expectation += z1 * z2 * prob;
  }
  return expectation;
};

// Perform state tomography
export const performTomography = (
  gates: GateInstance[],
  numWires: number,
  numShots: number,
  seed: number
): TomographyResult => {
  // Execute in Z basis (computational)
  const zState = executeCircuit(gates, numWires);
  const zBasisProbs = zState.map(s => s.real * s.real + s.imag * s.imag);
  
  // Execute with H gates for X basis measurement
  const xGates: GateInstance[] = [...gates];
  const maxPos = gates.length > 0 ? Math.max(...gates.map(g => g.position)) + 1 : 0;
  for (let q = 0; q < numWires; q++) {
    xGates.push({ id: `tomo-h-x-${q}`, type: 'H', wireIndex: q, position: maxPos });
  }
  const xState = executeCircuit(xGates, numWires);
  const xBasisProbs = xState.map(s => s.real * s.real + s.imag * s.imag);
  
  // Execute with S†H for Y basis measurement
  const yGates: GateInstance[] = [...gates];
  for (let q = 0; q < numWires; q++) {
    yGates.push({ id: `tomo-s-y-${q}`, type: 'S', wireIndex: q, position: maxPos });
    yGates.push({ id: `tomo-s2-y-${q}`, type: 'S', wireIndex: q, position: maxPos + 1 });
    yGates.push({ id: `tomo-s3-y-${q}`, type: 'S', wireIndex: q, position: maxPos + 2 });
    yGates.push({ id: `tomo-h-y-${q}`, type: 'H', wireIndex: q, position: maxPos + 3 });
  }
  const yState = executeCircuit(yGates, numWires);
  const yBasisProbs = yState.map(s => s.real * s.real + s.imag * s.imag);
  
  // Construct density matrix from state vector (pure state approximation)
  const dim = zState.length;
  const densityMatrix: ComplexNumber[][] = Array.from({ length: dim }, () =>
    Array.from({ length: dim }, () => ({ real: 0, imag: 0 }))
  );
  
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      densityMatrix[i][j] = {
        real: zState[i].real * zState[j].real + zState[i].imag * zState[j].imag,
        imag: zState[i].imag * zState[j].real - zState[i].real * zState[j].imag,
      };
    }
  }
  
  // Calculate purity: Tr(ρ²)
  let purity = 0;
  for (let i = 0; i < dim; i++) {
    for (let j = 0; j < dim; j++) {
      purity += densityMatrix[i][j].real * densityMatrix[j][i].real +
                densityMatrix[i][j].imag * densityMatrix[j][i].imag;
    }
  }
  purity = Math.min(1, Math.max(0, purity));
  
  // Von Neumann entropy: -Tr(ρ log ρ)
  // For pure state it's 0, for mixed states we approximate
  const vonNeumannEntropy = purity > 0.99 ? 0 : -Math.log2(purity);
  
  return {
    densityMatrix,
    purity,
    vonNeumannEntropy,
    xBasisProbs,
    yBasisProbs,
    zBasisProbs,
  };
};

// Generate code example
export const generateCodeExample = (numQubits: number, gates: GateInstance[], entropy: number): string => {
  const gateList = gates.map(g => g.type).join(' → ') || 'none';
  const gateCode = gates.length > 0 
    ? gates.map(g => `applyGate(stateVector, '${g.type}', ${g.wireIndex});`).join('\n')
    : '// Add gates to the circuit above';
  
  return `// Build quantum circuit with tinyaleph
import { Hypercomplex, PrimeState } from '@aleph-ai/tinyaleph';

// Initialize quantum state as sedenion
const numQubits = ${numQubits};
const stateVector = new Hypercomplex(16);

// Apply gates: ${gateList}
${gateCode}

// Measure entropy and coherence
const entropy = stateVector.entropy();    // ${entropy.toFixed(3)} bits
const coherence = stateVector.coherence();`;
};
