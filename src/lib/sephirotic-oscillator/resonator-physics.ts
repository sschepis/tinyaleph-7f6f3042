// Cavity Resonator Physics for Sephirotic Tree
// Each Sephirah acts as a resonant cavity with specific properties
// Paths between Sephirot act as waveguides with Hebrew letter properties

import type { SephirahName, OscillatorNode, PathFlow, PillarType } from './types';
import { SEPHIROT, SEPHIRAH_IDS } from './tree-config';
import { getPathBetween, calculatePathTransmission } from './path-letters';

// Resonator properties fixed by Kabbalistic meaning
export interface ResonatorProperties {
  // Resonant frequency (Hz conceptual)
  resonantFreq: number;
  // Q-factor: how much energy is trapped vs transmitted (higher = more trapping)
  qFactor: number;
  // Impedance: resistance to energy flow
  impedance: number;
  // Harmonic modes supported (1 = fundamental, 2 = 1st harmonic, etc.)
  modes: number[];
}

// Each Sephirah's resonator properties based on its nature
export const RESONATOR_PROPERTIES: Record<SephirahName, ResonatorProperties> = {
  // Crown - highest frequency, infinite Q (perfect trap for divine energy)
  keter: { resonantFreq: 963, qFactor: 100, impedance: 0.1, modes: [1] },
  
  // Wisdom - creative spark, medium-high Q, multiple harmonics
  hokhmah: { resonantFreq: 852, qFactor: 30, impedance: 0.3, modes: [1, 2, 3] },
  
  // Understanding - receptive form, high Q (holds patterns)
  binah: { resonantFreq: 741, qFactor: 60, impedance: 0.4, modes: [1, 2] },
  
  // Knowledge - hidden bridge, low Q (transmits freely)
  daat: { resonantFreq: 639, qFactor: 5, impedance: 0.2, modes: [1, 2, 3, 4] },
  
  // Mercy - expansive flow, low impedance
  hesed: { resonantFreq: 528, qFactor: 15, impedance: 0.2, modes: [1, 2, 3] },
  
  // Severity - restriction, high impedance
  gevurah: { resonantFreq: 417, qFactor: 50, impedance: 0.7, modes: [1, 2] },
  
  // Beauty - heart center, balanced Q, all modes
  tiferet: { resonantFreq: 396, qFactor: 25, impedance: 0.3, modes: [1, 2, 3, 4, 5] },
  
  // Victory - passionate drive, medium Q
  nezah: { resonantFreq: 285, qFactor: 20, impedance: 0.35, modes: [1, 2, 3] },
  
  // Glory - intellectual precision, higher Q
  hod: { resonantFreq: 174, qFactor: 40, impedance: 0.5, modes: [1, 2] },
  
  // Foundation - liminal threshold, low Q (gateway)
  yesod: { resonantFreq: 136.1, qFactor: 10, impedance: 0.25, modes: [1, 2, 3, 4] },
  
  // Kingdom - physical manifestation, lowest freq, grounds energy
  malkhut: { resonantFreq: 7.83, qFactor: 8, impedance: 0.6, modes: [1, 2, 3, 4, 5, 6, 7] }
};

// Extended oscillator node with resonator state
export interface ResonatorNode extends OscillatorNode {
  // Standing wave amplitudes for each mode
  modeAmplitudes: number[];
  // Current resonance level (0-1, peaks when input matches resonant freq)
  resonance: number;
  // Stored energy in the cavity
  storedEnergy: number;
  // Transmitted energy this frame
  transmittedEnergy: number;
}

// Calculate path length between two sephirot (affects standing wave modes)
function getPathLength(from: SephirahName, to: SephirahName): number {
  const fromPos = SEPHIROT[from].position;
  const toPos = SEPHIROT[to].position;
  return Math.sqrt(
    Math.pow(toPos.x - fromPos.x, 2) + 
    Math.pow(toPos.y - fromPos.y, 2)
  ) / 50; // Normalize to ~1-2 range
}

// Calculate resonance response (how well input frequency matches cavity)
function resonanceResponse(
  inputFreq: number, 
  resonantFreq: number, 
  qFactor: number
): number {
  const bandwidth = resonantFreq / qFactor;
  const detuning = Math.abs(inputFreq - resonantFreq);
  // Lorentzian response curve
  return 1 / (1 + Math.pow(2 * detuning / bandwidth, 2));
}

// Calculate transmission coefficient based on impedance matching
function transmissionCoeff(
  sourceImpedance: number, 
  targetImpedance: number
): number {
  // Maximum transmission when impedances match
  const ratio = sourceImpedance / targetImpedance;
  return 4 * ratio / Math.pow(1 + ratio, 2);
}

// Initialize resonator nodes
export function initializeResonators(): Map<SephirahName, ResonatorNode> {
  const resonators = new Map<SephirahName, ResonatorNode>();
  
  SEPHIRAH_IDS.forEach((id) => {
    const props = RESONATOR_PROPERTIES[id];
    resonators.set(id, {
      id,
      phase: Math.random() * Math.PI * 2,
      amplitude: 0.05,
      frequency: props.resonantFreq / 100, // Normalized for animation
      energy: 0,
      coupling: 0.15,
      modeAmplitudes: props.modes.map(() => 0),
      resonance: 0,
      storedEnergy: 0,
      transmittedEnergy: 0
    });
  });
  
  return resonators;
}

// Inject energy into a sephirah's cavity
export function energizeResonator(
  resonators: Map<SephirahName, ResonatorNode>,
  sephirahId: SephirahName,
  amount: number = 1.0,
  inputFreq?: number
): Map<SephirahName, ResonatorNode> {
  const newResonators = new Map(resonators);
  const node = newResonators.get(sephirahId);
  const props = RESONATOR_PROPERTIES[sephirahId];
  
  if (node) {
    // Calculate how much energy is absorbed based on resonance match
    const effectiveFreq = inputFreq ?? props.resonantFreq;
    const absorption = resonanceResponse(effectiveFreq, props.resonantFreq, props.qFactor);
    
    // Distribute energy across modes
    const newModeAmplitudes = [...node.modeAmplitudes];
    const energyPerMode = (amount * absorption) / props.modes.length;
    props.modes.forEach((mode, i) => {
      // Higher modes get less energy naturally
      newModeAmplitudes[i] = Math.min(1, newModeAmplitudes[i] + energyPerMode / mode);
    });
    
    const totalModeEnergy = newModeAmplitudes.reduce((a, b) => a + b, 0);
    
    newResonators.set(sephirahId, {
      ...node,
      modeAmplitudes: newModeAmplitudes,
      storedEnergy: Math.min(2, node.storedEnergy + amount * absorption),
      energy: Math.min(1, totalModeEnergy / props.modes.length),
      resonance: absorption,
      amplitude: Math.min(1, 0.1 + totalModeEnergy * 0.3)
    });
  }
  
  return newResonators;
}

// Main propagation with cavity resonator physics
export function propagateResonance(
  resonators: Map<SephirahName, ResonatorNode>,
  dt: number = 0.05
): { resonators: Map<SephirahName, ResonatorNode>; flows: PathFlow[] } {
  const newResonators = new Map<SephirahName, ResonatorNode>();
  const flows: PathFlow[] = [];
  
  // First pass: calculate what each cavity transmits
  const transmissions: Map<SephirahName, { to: SephirahName; energy: number; freq: number }[]> = new Map();
  
  resonators.forEach((node, id) => {
    const props = RESONATOR_PROPERTIES[id];
    const sephirah = SEPHIROT[id];
    const outgoing: { to: SephirahName; energy: number; freq: number }[] = [];
    
    if (node.storedEnergy > 0.01) {
      // Calculate energy that leaks out (inversely proportional to Q)
      const leakRate = 1 / props.qFactor;
      const availableEnergy = node.storedEnergy * leakRate * dt * 10;
      
      // Distribute to connected nodes based on path (Hebrew letter) properties
      const connections = sephirah.connections;
      
      // Calculate total weighted transmission through all paths
      const transmissionWeights = connections.map(connId => {
        const path = getPathBetween(id, connId);
        if (path) {
          // Use path's own transmission properties based on letter associations
          return calculatePathTransmission(path, props.resonantFreq);
        }
        // Fallback for paths without Hebrew letters (like Daat connections)
        const targetProps = RESONATOR_PROPERTIES[connId];
        return transmissionCoeff(props.impedance, targetProps.impedance);
      });
      
      const totalTransmission = transmissionWeights.reduce((a, b) => a + b, 0);
      
      connections.forEach((connId, idx) => {
        const path = getPathBetween(id, connId);
        const pathTransmission = transmissionWeights[idx];
        const pathLength = getPathLength(id, connId);
        
        // Standing wave condition: path length + path bandwidth affects which modes propagate
        const pathBandwidth = path?.bandwidth || 0.2;
        const modeEnergy = node.modeAmplitudes.reduce((sum, amp, i) => {
          const mode = props.modes[i];
          // Modes that match the path's resonance propagate better
          const wavelength = 2 / mode;
          const fits = Math.abs((pathLength % wavelength) - wavelength / 2) < wavelength * pathBandwidth;
          return sum + (fits ? amp : amp * 0.15);
        }, 0) / props.modes.length;
        
        const energyOut = availableEnergy * (pathTransmission / Math.max(0.01, totalTransmission)) * modeEnergy;
        
        if (energyOut > 0.001) {
          // Frequency is modulated by the path's resonant frequency
          const pathFreq = path?.resonantFreq || props.resonantFreq;
          outgoing.push({ 
            to: connId, 
            energy: energyOut,
            freq: pathFreq * (1 + (node.phase % 0.1 - 0.05))
          });
        }
      });
    }
    
    transmissions.set(id, outgoing);
  });
  
  // Second pass: update each cavity with incoming and outgoing energy
  resonators.forEach((node, id) => {
    const props = RESONATOR_PROPERTIES[id];
    const sephirah = SEPHIROT[id];
    
    // Calculate incoming energy
    let incomingEnergy = 0;
    let incomingFreqSum = 0;
    let incomingCount = 0;
    
    sephirah.connections.forEach(connId => {
      const connTransmissions = transmissions.get(connId) || [];
      connTransmissions.forEach(t => {
        if (t.to === id) {
          incomingEnergy += t.energy;
          incomingFreqSum += t.energy * t.freq;
          incomingCount++;
          
          // Record flow for visualization
          if (t.energy > 0.01) {
            flows.push({
              from: connId,
              to: id,
              strength: t.energy,
              particles: Array.from({ length: Math.ceil(t.energy * 8) }, () => Math.random())
            });
          }
        }
      });
    });
    
    // Calculate outgoing energy
    const outgoing = transmissions.get(id) || [];
    const outgoingEnergy = outgoing.reduce((sum, t) => sum + t.energy, 0);
    
    // Resonance with incoming frequency
    const avgIncomingFreq = incomingCount > 0 ? incomingFreqSum / incomingEnergy : props.resonantFreq;
    const resonanceMatch = resonanceResponse(avgIncomingFreq, props.resonantFreq, props.qFactor);
    
    // Natural decay of stored energy (cavity losses)
    const cavityLoss = 0.02 / props.qFactor;
    
    // Update mode amplitudes with wave evolution
    const newModeAmplitudes = node.modeAmplitudes.map((amp, i) => {
      const mode = props.modes[i];
      const modePhase = (node.phase * mode) % (Math.PI * 2);
      
      // Mode gains energy from incoming, loses from outgoing and decay
      const modeGain = (incomingEnergy * resonanceMatch) / props.modes.length;
      const modeLoss = amp * (cavityLoss + outgoingEnergy * 0.5);
      
      // Standing wave envelope
      const envelope = Math.abs(Math.sin(modePhase));
      
      return Math.max(0, Math.min(1, amp + modeGain - modeLoss) * (0.95 + 0.05 * envelope));
    });
    
    // Update stored energy
    const newStoredEnergy = Math.max(0, Math.min(2,
      node.storedEnergy 
      + incomingEnergy * resonanceMatch 
      - outgoingEnergy 
      - node.storedEnergy * cavityLoss
    ));
    
    // Phase evolution (frequency determined by dominant mode)
    const dominantModeIdx = newModeAmplitudes.indexOf(Math.max(...newModeAmplitudes));
    const effectiveFreq = props.modes[dominantModeIdx] || 1;
    const newPhase = (node.phase + (props.resonantFreq / 100) * effectiveFreq * dt) % (Math.PI * 2);
    
    // Visible amplitude is standing wave envelope
    const standingWaveAmplitude = newModeAmplitudes.reduce((sum, amp, i) => {
      const mode = props.modes[i];
      return sum + amp * Math.abs(Math.sin(newPhase * mode));
    }, 0) / Math.max(1, newModeAmplitudes.length);
    
    newResonators.set(id, {
      ...node,
      phase: newPhase,
      modeAmplitudes: newModeAmplitudes,
      storedEnergy: newStoredEnergy,
      energy: Math.min(1, newStoredEnergy / 2),
      resonance: resonanceMatch,
      transmittedEnergy: outgoingEnergy,
      amplitude: Math.min(1, 0.05 + standingWaveAmplitude * 0.7 + newStoredEnergy * 0.2)
    });
  });
  
  return { resonators: newResonators, flows };
}

// Calculate system coherence based on phase relationships
export function calculateResonatorCoherence(resonators: Map<SephirahName, ResonatorNode>): number {
  let realSum = 0;
  let imagSum = 0;
  let weightSum = 0;
  
  resonators.forEach(node => {
    if (node.storedEnergy > 0.05) {
      const weight = node.storedEnergy * node.resonance;
      realSum += Math.cos(node.phase) * weight;
      imagSum += Math.sin(node.phase) * weight;
      weightSum += weight;
    }
  });
  
  if (weightSum < 0.01) return 0;
  
  return Math.min(1, Math.sqrt(realSum * realSum + imagSum * imagSum) / weightSum);
}

// Calculate total system energy
export function calculateTotalStoredEnergy(resonators: Map<SephirahName, ResonatorNode>): number {
  let total = 0;
  resonators.forEach(node => {
    total += node.storedEnergy;
  });
  return total;
}

// Get dominant pillar based on stored energy
export function getResonatorDominantPillar(resonators: Map<SephirahName, ResonatorNode>): PillarType | null {
  const pillarEnergy: Record<PillarType, number> = {
    structure: 0,
    consciousness: 0,
    dynamic: 0
  };
  
  resonators.forEach((node, id) => {
    const sephirah = SEPHIROT[id];
    pillarEnergy[sephirah.pillar] += node.storedEnergy;
  });
  
  const max = Math.max(pillarEnergy.structure, pillarEnergy.consciousness, pillarEnergy.dynamic);
  if (max < 0.1) return null;
  
  if (pillarEnergy.structure === max) return 'structure';
  if (pillarEnergy.consciousness === max) return 'consciousness';
  return 'dynamic';
}

// Get active sephirot (those with significant stored energy)
export function getActiveResonators(
  resonators: Map<SephirahName, ResonatorNode>,
  threshold: number = 0.15
): SephirahName[] {
  const active: SephirahName[] = [];
  resonators.forEach((node, id) => {
    if (node.storedEnergy >= threshold) {
      active.push(id);
    }
  });
  return active;
}
