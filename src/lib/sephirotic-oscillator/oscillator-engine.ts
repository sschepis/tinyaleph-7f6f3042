import type { SephirahName, OscillatorNode, PathFlow, PillarType } from './types';
import { SEPHIROT, SEPHIRAH_IDS } from './tree-config';

// Initialize oscillator states for all sephirot
export function initializeOscillators(): Map<SephirahName, OscillatorNode> {
  const oscillators = new Map<SephirahName, OscillatorNode>();
  
  SEPHIRAH_IDS.forEach((id, index) => {
    // Each sephirah has a unique base frequency based on position in tree
    const baseFreq = 0.5 + (index * 0.1);
    oscillators.set(id, {
      id,
      phase: Math.random() * Math.PI * 2,
      amplitude: 0.1, // Low baseline
      frequency: baseFreq,
      energy: 0,
      coupling: 0.15 // Coupling strength to connected nodes
    });
  });
  
  return oscillators;
}

// Inject energy into a sephirah
export function energizeSephirah(
  oscillators: Map<SephirahName, OscillatorNode>,
  sephirahId: SephirahName,
  amount: number = 1.0
): Map<SephirahName, OscillatorNode> {
  const newOscillators = new Map(oscillators);
  const node = newOscillators.get(sephirahId);
  
  if (node) {
    newOscillators.set(sephirahId, {
      ...node,
      energy: Math.min(1, node.energy + amount),
      amplitude: Math.min(1, node.amplitude + amount * 0.5)
    });
  }
  
  return newOscillators;
}

// Propagate energy through the tree based on Kuramoto-like coupling
export function propagateEnergy(
  oscillators: Map<SephirahName, OscillatorNode>,
  dt: number = 0.05
): { oscillators: Map<SephirahName, OscillatorNode>; flows: PathFlow[] } {
  const newOscillators = new Map<SephirahName, OscillatorNode>();
  const flows: PathFlow[] = [];
  
  oscillators.forEach((node, id) => {
    const sephirah = SEPHIROT[id];
    let phaseInfluence = 0;
    let energyGain = 0;
    
    // Calculate influence from connected nodes
    sephirah.connections.forEach(connectedId => {
      const connectedNode = oscillators.get(connectedId);
      if (connectedNode) {
        // Kuramoto coupling
        const phaseDiff = Math.sin(connectedNode.phase - node.phase);
        phaseInfluence += node.coupling * phaseDiff;
        
        // Energy flows from high to low
        const energyDiff = connectedNode.energy - node.energy;
        if (energyDiff > 0) {
          const flowStrength = energyDiff * 0.1;
          energyGain += flowStrength;
          
          // Record significant flows for visualization
          if (connectedNode.energy > 0.2) {
            flows.push({
              from: connectedId,
              to: id,
              strength: flowStrength,
              particles: Array.from({ length: Math.ceil(flowStrength * 5) }, () => Math.random())
            });
          }
        }
      }
    });
    
    // Update oscillator state
    const newPhase = (node.phase + node.frequency * dt + phaseInfluence * dt) % (Math.PI * 2);
    const newEnergy = Math.max(0, node.energy * 0.98 + energyGain - 0.01); // Natural decay
    const newAmplitude = 0.1 + newEnergy * 0.9; // Amplitude follows energy
    
    newOscillators.set(id, {
      ...node,
      phase: newPhase,
      energy: newEnergy,
      amplitude: newAmplitude
    });
  });
  
  return { oscillators: newOscillators, flows };
}

// Calculate overall system coherence (Kuramoto order parameter)
export function calculateCoherence(oscillators: Map<SephirahName, OscillatorNode>): number {
  let realSum = 0;
  let imagSum = 0;
  let count = 0;
  
  oscillators.forEach(node => {
    if (node.energy > 0.1) { // Only count active oscillators
      realSum += Math.cos(node.phase) * node.amplitude;
      imagSum += Math.sin(node.phase) * node.amplitude;
      count++;
    }
  });
  
  if (count === 0) return 0;
  
  const r = Math.sqrt(realSum * realSum + imagSum * imagSum) / count;
  return Math.min(1, r);
}

// Calculate total system energy
export function calculateTotalEnergy(oscillators: Map<SephirahName, OscillatorNode>): number {
  let total = 0;
  oscillators.forEach(node => {
    total += node.energy;
  });
  return total;
}

// Determine dominant pillar based on energy distribution
export function getDominantPillar(oscillators: Map<SephirahName, OscillatorNode>): PillarType | null {
  const pillarEnergy: Record<PillarType, number> = {
    structure: 0,
    consciousness: 0,
    dynamic: 0
  };
  
  oscillators.forEach((node, id) => {
    const sephirah = SEPHIROT[id];
    pillarEnergy[sephirah.pillar] += node.energy;
  });
  
  const max = Math.max(pillarEnergy.structure, pillarEnergy.consciousness, pillarEnergy.dynamic);
  if (max < 0.1) return null;
  
  if (pillarEnergy.structure === max) return 'structure';
  if (pillarEnergy.consciousness === max) return 'consciousness';
  return 'dynamic';
}

// Get list of active sephirot (energy above threshold)
export function getActiveSephirot(
  oscillators: Map<SephirahName, OscillatorNode>,
  threshold: number = 0.2
): SephirahName[] {
  const active: SephirahName[] = [];
  oscillators.forEach((node, id) => {
    if (node.energy >= threshold) {
      active.push(id);
    }
  });
  return active;
}
