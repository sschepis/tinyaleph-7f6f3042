/**
 * Non-Local Communication Engine
 * Implements message encoding, transmission, and correlation
 */

import { 
  Octonion, 
  createOctonion, 
  messageToOctonion, 
  octonionConjugate, 
  octonionMultiply, 
  octonionNormalize,
  octonionCorrelation,
  octonionToQuaternion,
  PRIME_BASIS,
  PrimeAmplitude,
  normalizePrimeState,
  calculateResonanceStrength,
  createPrimeAmplitudes,
  createPhaseOffsets
} from './octonion';
import { NodeState, CommunicationEvent, NonLocalSystemState } from './communication-types';
import { Quaternion } from './types';

// Initialize a node state
export function createNodeState(id: 'A' | 'B'): NodeState {
  const isAntiPhase = id === 'B';
  return {
    id,
    quaternion: { a: 1, b: 0, c: 0, d: 0 },
    octonion: createOctonion(),
    blochVector: { x: 0, y: 0, z: 1 },
    twist: 0,
    precession: 0,
    entropy: 1.0,
    coherence: 0.0,
    message: '',
    primeAmplitudes: createPrimeAmplitudes(isAntiPhase),
    phaseOffsets: createPhaseOffsets(isAntiPhase),
    commChannel: id === 'A' ? 0 : 1
  };
}

// Encode a message into the node's quantum state
export function encodeMessage(
  message: string,
  node: NodeState,
  targetNode: NodeState,
  systemState: NonLocalSystemState
): { 
  updatedNode: NodeState; 
  updatedTarget: NodeState;
  commEvent: CommunicationEvent | null;
  newCorrelation: number;
  newResonance: number;
} {
  if (!message.trim()) {
    return { 
      updatedNode: node, 
      updatedTarget: targetNode, 
      commEvent: null,
      newCorrelation: systemState.nonLocalCorrelation,
      newResonance: systemState.resonanceStrength
    };
  }

  // Create octonion from message
  const messageOctonion = messageToOctonion(message, node.commChannel);
  
  // Update node's octonion state
  const updatedNode: NodeState = {
    ...node,
    octonion: messageOctonion,
    quaternion: octonionToQuaternion(messageOctonion),
    message
  };
  
  // Modulate prime amplitudes with message encoding
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = ((hash << 5) - hash) + message.charCodeAt(i);
    hash = hash & hash;
  }
  const messagePhase = (hash % 360) * Math.PI / 180;
  
  // Apply message encoding to prime amplitudes
  const newAmplitudes = [...updatedNode.primeAmplitudes];
  for (let i = 0; i < newAmplitudes.length; i++) {
    const charIndex = i % message.length;
    const charCode = message.charCodeAt(charIndex);
    const primePhase = (charCode * PRIME_BASIS.primes[i]) % (2 * Math.PI);
    
    const octonionComponents = [
      messageOctonion.e0, messageOctonion.e1, messageOctonion.e2, messageOctonion.e3,
      messageOctonion.e4, messageOctonion.e5, messageOctonion.e6, messageOctonion.e7
    ];
    const octonionComponent = octonionComponents[i % 8];
    
    const amp = { ...newAmplitudes[i] };
    const magnitude = Math.sqrt(amp.real * amp.real + amp.imag * amp.imag);
    const currentPhase = Math.atan2(amp.imag, amp.real);
    const newPhase = currentPhase + primePhase + messagePhase + (octonionComponent * Math.PI / 4);
    
    amp.real = magnitude * Math.cos(newPhase);
    amp.imag = magnitude * Math.sin(newPhase);
    newAmplitudes[i] = amp;
  }
  
  normalizePrimeState(newAmplitudes);
  updatedNode.primeAmplitudes = newAmplitudes;
  
  // Update quaternion and Bloch vector from prime state
  updateQuaternionFromPrimeState(updatedNode);
  
  // Check if we should apply non-local correlation
  let updatedTarget = { ...targetNode };
  let commEvent: CommunicationEvent | null = null;
  let newCorrelation = systemState.nonLocalCorrelation;
  let newResonance = systemState.resonanceStrength;
  
  if (systemState.entanglementState === 'separated' || systemState.entanglementState === 'entangled') {
    // Create non-local correlation using octonion conjugate
    const conjugateOctonion = octonionConjugate(messageOctonion);
    
    // Mix channels for non-local correlation
    const channelMixer = createOctonion(
      Math.cos(targetNode.commChannel * Math.PI / 4),
      Math.sin(targetNode.commChannel * Math.PI / 4),
      Math.cos(node.commChannel * Math.PI / 3),
      Math.sin(node.commChannel * Math.PI / 3),
      Math.cos((targetNode.commChannel + node.commChannel) * Math.PI / 5),
      Math.sin((targetNode.commChannel + node.commChannel) * Math.PI / 5),
      Math.cos((targetNode.commChannel - node.commChannel) * Math.PI / 7),
      Math.sin((targetNode.commChannel - node.commChannel) * Math.PI / 7)
    );
    
    const correlatedOctonion = octonionNormalize(octonionMultiply(conjugateOctonion, channelMixer));
    
    updatedTarget = {
      ...targetNode,
      octonion: correlatedOctonion,
      quaternion: octonionToQuaternion(correlatedOctonion),
      message: `[Non-local: ${message}]`
    };
    
    // Apply anti-correlated prime modulation
    const targetAmplitudes = [...updatedTarget.primeAmplitudes];
    for (let i = 0; i < targetAmplitudes.length; i++) {
      const charIndex = i % message.length;
      const charCode = message.charCodeAt(charIndex);
      const primePhase = (charCode * PRIME_BASIS.primes[i]) % (2 * Math.PI);
      
      const octonionComponents = [
        correlatedOctonion.e0, correlatedOctonion.e1, correlatedOctonion.e2, correlatedOctonion.e3,
        correlatedOctonion.e4, correlatedOctonion.e5, correlatedOctonion.e6, correlatedOctonion.e7
      ];
      const octonionComponent = octonionComponents[i % 8];
      
      const amp = { ...targetAmplitudes[i] };
      const magnitude = Math.sqrt(amp.real * amp.real + amp.imag * amp.imag);
      const currentPhase = Math.atan2(amp.imag, amp.real);
      // Anti-correlated phase
      const newPhase = currentPhase - primePhase - messagePhase - (octonionComponent * Math.PI / 4);
      
      amp.real = magnitude * Math.cos(newPhase);
      amp.imag = magnitude * Math.sin(newPhase);
      targetAmplitudes[i] = amp;
    }
    
    normalizePrimeState(targetAmplitudes);
    updatedTarget.primeAmplitudes = targetAmplitudes;
    updateQuaternionFromPrimeState(updatedTarget);
    
    // Calculate new correlation
    newCorrelation = octonionCorrelation(updatedNode.octonion, updatedTarget.octonion);
    newResonance = calculateResonanceStrength(updatedNode.primeAmplitudes, updatedTarget.primeAmplitudes);
    
    // Create communication event
    commEvent = {
      id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      from: node.id,
      to: targetNode.id,
      message,
      type: 'non-local',
      correlation: newCorrelation,
      octonion: messageOctonion
    };
  }
  
  return {
    updatedNode,
    updatedTarget,
    commEvent,
    newCorrelation,
    newResonance
  };
}

// Update quaternion from prime state
export function updateQuaternionFromPrimeState(node: NodeState): void {
  const q = node.quaternion;
  
  // Map first 4 prime amplitudes to quaternion
  q.a = node.primeAmplitudes[0]?.real ?? 1;
  q.b = node.primeAmplitudes[1]?.real ?? 0;
  q.c = node.primeAmplitudes[2]?.real ?? 0;
  q.d = node.primeAmplitudes[3]?.real ?? 0;
  
  // Normalize
  const qNorm = Math.sqrt(q.a*q.a + q.b*q.b + q.c*q.c + q.d*q.d);
  if (qNorm > 0) {
    q.a /= qNorm;
    q.b /= qNorm;
    q.c /= qNorm;
    q.d /= qNorm;
  }
  
  // Update Bloch vector
  node.blochVector = {
    x: 2 * (q.a * q.b + q.c * q.d),
    y: 2 * (q.a * q.c - q.b * q.d),
    z: q.a * q.a - q.b * q.b - q.c * q.c + q.d * q.d
  };
  
  // Update twist from phase distribution
  let phaseVariance = 0;
  let meanPhase = 0;
  
  for (const amp of node.primeAmplitudes) {
    meanPhase += Math.atan2(amp.imag, amp.real);
  }
  meanPhase /= node.primeAmplitudes.length;
  
  for (const amp of node.primeAmplitudes) {
    const phase = Math.atan2(amp.imag, amp.real);
    phaseVariance += Math.pow(phase - meanPhase, 2);
  }
  phaseVariance /= node.primeAmplitudes.length;
  
  node.twist = Math.sqrt(phaseVariance);
  
  // Calculate entropy
  let entropy = 0;
  for (const amp of node.primeAmplitudes) {
    const prob = amp.real * amp.real + amp.imag * amp.imag;
    if (prob > 0) {
      entropy -= prob * Math.log(prob);
    }
  }
  node.entropy = Math.min(1.0, entropy / Math.log(node.primeAmplitudes.length));
  node.coherence = 1.0 - node.entropy;
}

// Evolve quantum state with phase-locked oscillators
export function evolveNodeState(
  node: NodeState,
  evolutionStartTime: number
): NodeState {
  const t = (Date.now() - evolutionStartTime) * 0.001;
  const updated = { ...node };
  const newAmplitudes = [...updated.primeAmplitudes];
  
  for (let i = 0; i < PRIME_BASIS.primes.length && i < newAmplitudes.length; i++) {
    const freq = PRIME_BASIS.frequencies[i];
    const phase = updated.phaseOffsets[i] || 0;
    
    const omega = 2 * Math.PI * freq * 0.1;
    const totalPhase = omega * t + phase;
    
    const amplitude = 1 / Math.sqrt(PRIME_BASIS.primes.length);
    newAmplitudes[i] = {
      real: amplitude * Math.cos(totalPhase),
      imag: amplitude * Math.sin(totalPhase)
    };
  }
  
  normalizePrimeState(newAmplitudes);
  updated.primeAmplitudes = newAmplitudes;
  updateQuaternionFromPrimeState(updated);
  
  // Update precession
  updated.precession = t * 0.5 + updated.twist;
  
  return updated;
}

// Calculate non-local correlation between nodes
export function calculateNonLocalCorrelation(nodeA: NodeState, nodeB: NodeState): number {
  return octonionCorrelation(nodeA.octonion, nodeB.octonion);
}

// Initialize entanglement between nodes
export function initializeEntanglement(
  nodeA: NodeState,
  nodeB: NodeState,
  splitPrimes: number[]
): { nodeA: NodeState; nodeB: NodeState; sharedQuaternion: Quaternion } {
  const basePrime = splitPrimes[Math.floor(Math.random() * splitPrimes.length)] || 13;
  
  const gaussian_a = Math.floor(Math.sqrt(basePrime)) + (Date.now() % 3) - 1;
  const gaussian_b = Math.floor(Math.sqrt(basePrime - gaussian_a * gaussian_a)) + (Date.now() % 2);
  const eisenstein_c = Math.floor(basePrime / 4) + (Date.now() % 4) - 1;
  const eisenstein_d = Math.floor(Math.sqrt(basePrime / 3)) + (Date.now() % 3);
  
  const sharedQuaternion: Quaternion = {
    a: gaussian_a,
    b: gaussian_b,
    c: eisenstein_c,
    d: eisenstein_d
  };
  
  // Normalize
  const norm = Math.sqrt(sharedQuaternion.a**2 + sharedQuaternion.b**2 + sharedQuaternion.c**2 + sharedQuaternion.d**2);
  if (norm > 0) {
    sharedQuaternion.a /= norm;
    sharedQuaternion.b /= norm;
    sharedQuaternion.c /= norm;
    sharedQuaternion.d /= norm;
  }
  
  const blochA = {
    x: sharedQuaternion.b,
    y: sharedQuaternion.c,
    z: sharedQuaternion.d
  };
  
  const blochB = {
    x: -sharedQuaternion.b,
    y: sharedQuaternion.c,
    z: -sharedQuaternion.d
  };
  
  const twist = Math.atan2(
    sharedQuaternion.d * Math.sqrt(3) / 2,
    sharedQuaternion.c
  );
  
  const entangledA: NodeState = {
    ...nodeA,
    quaternion: { ...sharedQuaternion },
    blochVector: blochA,
    twist,
    coherence: 0.9,
    entropy: 0.2
  };
  
  const entangledB: NodeState = {
    ...nodeB,
    quaternion: {
      a: sharedQuaternion.a,
      b: -sharedQuaternion.b,
      c: sharedQuaternion.c,
      d: -sharedQuaternion.d
    },
    blochVector: blochB,
    twist: -twist,
    coherence: 0.9,
    entropy: 0.2
  };
  
  return { nodeA: entangledA, nodeB: entangledB, sharedQuaternion };
}
