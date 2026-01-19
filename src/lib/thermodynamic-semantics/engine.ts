/**
 * Thermodynamic Semantics Engine
 * Simulates entropy-meaning relationships and computational thermodynamics
 */

import {
  SemanticState,
  EntropyMeaningPoint,
  ComputationProcess,
  ProcessStep,
  EnergyLandscape,
  LandscapeState,
  LocalMinimum,
  LandauerMetrics,
  DemonMetrics,
  MeaningEmergence,
  ThermodynamicTimeSeries,
  SystemConfig,
  ThermodynamicPreset
} from './types';

// Physical constants
const K_BOLTZMANN = 1.380649e-23; // J/K
const ROOM_TEMP = 300; // K
const LN2 = Math.log(2);

// Calculate thermal energy
export function thermalEnergy(T: number = ROOM_TEMP): number {
  return K_BOLTZMANN * T;
}

// Landauer limit: minimum energy to erase 1 bit
export function landauerLimit(T: number = ROOM_TEMP): number {
  return K_BOLTZMANN * T * LN2;
}

// Shannon entropy of a probability distribution
export function shannonEntropy(probs: number[]): number {
  return -probs.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum + p * Math.log2(p);
  }, 0);
}

// Generate entropy from text
export function textEntropy(text: string): number {
  if (!text) return 0;
  
  const freq: Record<string, number> = {};
  for (const char of text.toLowerCase()) {
    freq[char] = (freq[char] || 0) + 1;
  }
  
  const total = text.length;
  const probs = Object.values(freq).map(f => f / total);
  return shannonEntropy(probs);
}

// Measure meaning as compression ratio + pattern detection
export function measureMeaning(text: string): number {
  if (!text || text.length < 2) return 0;
  
  // Unique character ratio (lower = more structured)
  const uniqueChars = new Set(text.toLowerCase()).size;
  const compressionRatio = 1 - (uniqueChars / Math.min(text.length, 26));
  
  // Word pattern detection
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;
  const wordStructure = words.length > 0 ? 1 - (uniqueWords / words.length) : 0;
  
  // Combine metrics
  return Math.min(1, compressionRatio * 0.4 + wordStructure * 0.3 + Math.min(words.length / 10, 0.3));
}

// Create a semantic state from text
export function createSemanticState(id: string, content: string, T: number = ROOM_TEMP): SemanticState {
  const entropy = textEntropy(content);
  const meaning = measureMeaning(content);
  const kT = thermalEnergy(T);
  
  // Free energy: F = E - TS (simplified model)
  const freeEnergy = (1 - meaning) * kT - T * entropy * 0.1;
  
  return {
    id,
    content,
    entropy,
    freeEnergy,
    temperature: T,
    coherence: meaning,
    meaning
  };
}

// Create a computation process
export function createProcess(
  id: string,
  name: string,
  steps: Omit<ProcessStep, 'energyUsed'>[],
  T: number = ROOM_TEMP
): ComputationProcess {
  const landauer = landauerLimit(T);
  
  // Calculate energy for each step
  const processedSteps: ProcessStep[] = steps.map(step => ({
    ...step,
    energyUsed: step.isReversible ? 0 : Math.abs(step.entropyChange) * landauer
  }));
  
  const entropyIn = processedSteps.reduce((sum, s) => sum + Math.max(0, s.entropyChange), 0);
  const entropyOut = processedSteps.reduce((sum, s) => sum + Math.max(0, -s.entropyChange), 0);
  const meaningGain = processedSteps.reduce((sum, s) => sum + s.meaningChange, 0);
  const energyCost = processedSteps.reduce((sum, s) => sum + s.energyUsed, 0);
  const landauerCost = entropyOut * landauer;
  
  return {
    id,
    name,
    entropyIn,
    entropyOut,
    meaningGain,
    energyCost,
    landauerCost,
    efficiency: landauerCost > 0 ? landauerCost / energyCost : 1,
    steps: processedSteps
  };
}

// Generate energy landscape
export function generateLandscape(width: number = 50, height: number = 50): EnergyLandscape {
  const states: LandscapeState[] = [];
  const minima: LocalMinimum[] = [];
  
  // Create landscape with multiple basins
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const nx = (x / width) * 2 - 1;
      const ny = (y / height) * 2 - 1;
      
      // Multi-well potential
      const basin1 = Math.exp(-((nx + 0.5) ** 2 + (ny + 0.5) ** 2) * 10);
      const basin2 = Math.exp(-((nx - 0.5) ** 2 + (ny - 0.5) ** 2) * 8);
      const basin3 = Math.exp(-((nx) ** 2 + (ny - 0.5) ** 2) * 12);
      
      const energy = 1 - Math.max(basin1, basin2 * 0.8, basin3 * 0.9);
      const entropy = 1 - energy + Math.random() * 0.1;
      const meaning = Math.max(basin1, basin2 * 0.8, basin3 * 0.9);
      
      states.push({ x, y, energy, entropy, meaning });
    }
  }
  
  // Identify local minima
  minima.push(
    { id: 'min1', position: [12, 12], energy: 0.1, meaning: 0.9, stability: 0.8 },
    { id: 'min2', position: [37, 37], energy: 0.2, meaning: 0.8, stability: 0.7 },
    { id: 'min3', position: [25, 12], energy: 0.15, meaning: 0.85, stability: 0.75 }
  );
  
  return {
    states,
    barriers: [
      { from: 'min1', to: 'min2', height: 0.6, width: 5 },
      { from: 'min1', to: 'min3', height: 0.4, width: 3 },
      { from: 'min2', to: 'min3', height: 0.5, width: 4 }
    ],
    minima,
    globalMinimum: minima[0]
  };
}

// Calculate Landauer metrics
export function calculateLandauer(
  bitsErased: number,
  actualEnergy: number,
  T: number = ROOM_TEMP
): LandauerMetrics {
  const kT = thermalEnergy(T);
  const limit = landauerLimit(T);
  const theoreticalMin = bitsErased * limit;
  
  return {
    temperature: T,
    kT,
    landauerLimit: limit,
    actualCost: actualEnergy,
    efficiency: theoreticalMin / Math.max(actualEnergy, theoreticalMin),
    bitsErased,
    irreversibleFraction: Math.min(1, actualEnergy / theoreticalMin - 1)
  };
}

// Maxwell's demon analysis
export function analyzeMaxwellDemon(
  informationGained: number,
  workExtracted: number,
  T: number = ROOM_TEMP
): DemonMetrics {
  const kT = thermalEnergy(T);
  const entropyExported = informationGained * LN2 * kT;
  const netGain = workExtracted - entropyExported;
  
  return {
    informationGained,
    entropyExported,
    workExtracted,
    netGain,
    isViolating: netGain > 0 // Would violate 2nd law
  };
}

// Calculate meaning emergence
export function calculateEmergence(
  rawEntropy: number,
  structuredEntropy: number,
  correlations: number
): MeaningEmergence {
  const mutualInformation = Math.max(0, rawEntropy - structuredEntropy);
  const integratedInformation = mutualInformation * correlations;
  const compressionRatio = structuredEntropy > 0 ? rawEntropy / structuredEntropy : 1;
  
  return {
    rawEntropy,
    structuredEntropy,
    mutualInformation,
    integratedInformation,
    emergentMeaning: Math.tanh(integratedInformation),
    compressionRatio
  };
}

// Evolve time series
export function evolveTimeSeries(
  series: ThermodynamicTimeSeries,
  config: SystemConfig,
  dt: number
): ThermodynamicTimeSeries {
  const lastIdx = series.timestamps.length - 1;
  const t = lastIdx >= 0 ? series.timestamps[lastIdx] + dt : 0;
  
  // Simulate entropy evolution
  const noise = (Math.random() - 0.5) * config.noiseLevel;
  const baseEntropy = 4 + 2 * Math.sin(t * 0.01) + noise;
  const entropy = Math.max(0, baseEntropy);
  
  // Meaning emerges as entropy reduces (inverse relationship)
  const meaning = Math.max(0, Math.min(1, 1 - entropy / 6 + config.couplingStrength * 0.2));
  
  // Efficiency depends on how close we are to Landauer limit
  const landauer = landauerLimit(config.temperature);
  const actualCost = entropy * landauer * (1 + config.noiseLevel);
  const efficiency = (entropy * landauer) / actualCost;
  
  // Free energy
  const freeEnergy = (1 - meaning) * thermalEnergy(config.temperature) - entropy * 0.1;
  
  // Keep last 100 points
  const maxPoints = 100;
  const newTimestamps = [...series.timestamps, t].slice(-maxPoints);
  const newEntropy = [...series.entropy, entropy].slice(-maxPoints);
  const newMeaning = [...series.meaning, meaning].slice(-maxPoints);
  const newEfficiency = [...series.efficiency, efficiency].slice(-maxPoints);
  const newFreeEnergy = [...series.freeEnergy, freeEnergy].slice(-maxPoints);
  
  return {
    timestamps: newTimestamps,
    entropy: newEntropy,
    meaning: newMeaning,
    efficiency: newEfficiency,
    freeEnergy: newFreeEnergy
  };
}

// Default configuration
export function defaultConfig(): SystemConfig {
  return {
    temperature: ROOM_TEMP,
    noiseLevel: 0.1,
    couplingStrength: 0.5,
    measurementRate: 10
  };
}

// Empty time series
export function emptyTimeSeries(): ThermodynamicTimeSeries {
  return {
    timestamps: [],
    entropy: [],
    meaning: [],
    efficiency: [],
    freeEnergy: []
  };
}

// Preset scenarios
export const THERMODYNAMIC_PRESETS: ThermodynamicPreset[] = [
  {
    name: 'Semantic Compression',
    description: 'Language processing reduces entropy while extracting meaning',
    processes: [
      { id: 'parse', name: 'Parsing', entropyIn: 5, entropyOut: 4, meaningGain: 0.2, energyCost: 0.5, landauerCost: 0.3, efficiency: 0.6 },
      { id: 'compress', name: 'Compression', entropyIn: 4, entropyOut: 2, meaningGain: 0.5, energyCost: 1.2, landauerCost: 0.6, efficiency: 0.5 },
      { id: 'extract', name: 'Meaning Extraction', entropyIn: 2, entropyOut: 1, meaningGain: 0.3, energyCost: 0.8, landauerCost: 0.3, efficiency: 0.375 }
    ],
    config: { temperature: 300, noiseLevel: 0.1, couplingStrength: 0.7, measurementRate: 10 }
  },
  {
    name: 'Neural Computation',
    description: 'Brain-like processing with near-Landauer efficiency',
    processes: [
      { id: 'input', name: 'Sensory Input', entropyIn: 10, entropyOut: 8, meaningGain: 0.1, energyCost: 0.2, landauerCost: 0.15, efficiency: 0.75 },
      { id: 'process', name: 'Neural Processing', entropyIn: 8, entropyOut: 3, meaningGain: 0.6, energyCost: 0.5, landauerCost: 0.4, efficiency: 0.8 },
      { id: 'output', name: 'Decision Output', entropyIn: 3, entropyOut: 1, meaningGain: 0.3, energyCost: 0.15, landauerCost: 0.12, efficiency: 0.8 }
    ],
    config: { temperature: 310, noiseLevel: 0.05, couplingStrength: 0.9, measurementRate: 100 }
  },
  {
    name: 'Quantum Error Correction',
    description: 'Fighting decoherence with redundant encoding',
    processes: [
      { id: 'encode', name: 'Logical Encoding', entropyIn: 1, entropyOut: 0.1, meaningGain: 0.1, energyCost: 0.3, landauerCost: 0.05, efficiency: 0.17 },
      { id: 'syndrome', name: 'Syndrome Measurement', entropyIn: 0.5, entropyOut: 0.3, meaningGain: 0.4, energyCost: 0.2, landauerCost: 0.1, efficiency: 0.5 },
      { id: 'correct', name: 'Error Correction', entropyIn: 0.3, entropyOut: 0.05, meaningGain: 0.5, energyCost: 0.1, landauerCost: 0.02, efficiency: 0.2 }
    ],
    config: { temperature: 0.015, noiseLevel: 0.02, couplingStrength: 0.95, measurementRate: 1000 }
  },
  {
    name: 'Maxwell Demon Cycle',
    description: 'Information-work trade-off in a feedback loop',
    processes: [
      { id: 'measure', name: 'Measurement', entropyIn: 0, entropyOut: 0, meaningGain: 1, energyCost: 0, landauerCost: 0, efficiency: 1 },
      { id: 'sort', name: 'Sorting', entropyIn: 0, entropyOut: 0, meaningGain: 0, energyCost: 0.1, landauerCost: 0, efficiency: 0 },
      { id: 'erase', name: 'Memory Erasure', entropyIn: 1, entropyOut: 0, meaningGain: -1, energyCost: 0.7, landauerCost: 0.69, efficiency: 0.99 }
    ],
    config: { temperature: 300, noiseLevel: 0.01, couplingStrength: 1.0, measurementRate: 50 }
  }
];

// Build initial state from preset
export function initializeFromPreset(preset: ThermodynamicPreset): {
  processes: ComputationProcess[];
  config: SystemConfig;
} {
  const baseConfig = defaultConfig();
  const config = { ...baseConfig, ...preset.config };
  
  const processes = preset.processes.map(p => ({
    ...p,
    steps: generateProcessSteps(p.name, p.entropyIn - p.entropyOut)
  }));
  
  return { processes, config };
}

// Generate process steps
function generateProcessSteps(name: string, entropyReduction: number): ProcessStep[] {
  const numSteps = Math.max(2, Math.floor(entropyReduction * 2));
  const steps: ProcessStep[] = [];
  
  for (let i = 0; i < numSteps; i++) {
    const isReversible = Math.random() > 0.3;
    steps.push({
      name: `${name} Step ${i + 1}`,
      entropyChange: -entropyReduction / numSteps,
      meaningChange: 0.1 / numSteps,
      energyUsed: isReversible ? 0 : entropyReduction / numSteps * 0.2,
      isReversible
    });
  }
  
  return steps;
}
