import { Atom, Link2, Compass, Binary, Waves, Play, Zap, RotateCcw } from 'lucide-react';

export const helpSteps = [
  {
    title: 'Quaternionic Non-Local Communication',
    content: 'This simulator implements symbolic non-local communication using quaternionic representations of split primes (p ≡ 1 mod 12). Based on the paper by Sebastian Schepis.',
    icon: Atom
  },
  {
    title: 'How to Use: Order of Operations',
    content: '1. **Start** - Click "Start" to begin the simulation loop.\n2. **Initialize Entanglement** - Click to create a quantum-correlated pair between Node A and Node B.\n3. **Evolve** - The system evolves automatically; watch the Bloch spheres synchronize.\n4. **Separate Nodes** - Click to break entanglement and observe independent evolution.',
    icon: Play
  },
  {
    title: 'Sending Messages',
    content: 'Type a message in Node A\'s input field and click "Send". The message is encoded into octonion form, modulating the prime basis amplitudes. Node B receives the transmission via non-local correlation when entangled.',
    icon: Zap
  },
  {
    title: 'Split Prime Quaternions',
    content: 'Split primes factor in both Gaussian (Z[i]) and Eisenstein (Z[ω]) integers. These are embedded into quaternion form: q_p = a + bi + jc\' + kd\'.',
    icon: Binary
  },
  {
    title: 'Quaternionic Bloch Dynamics',
    content: 'The imaginary components define a Bloch vector n_p = (b, c\', d\'). Time evolution follows U_p(t) = exp(-iH_q t) visualized on the Bloch sphere.',
    icon: Compass
  },
  {
    title: 'Entangled Transmission',
    content: 'Two nodes form an entangled pair with composite Hamiltonian including twist coupling γ(σ_z⊗σ_z) for non-local correlation. Higher correlation = better transmission fidelity.',
    icon: Link2
  },
  {
    title: 'Phase Synchronization',
    content: 'Communication succeeds when Δφ_q = arg(q_A*·q_B) < ε. Watch the correlation meter approach 1.0 as the Bloch spheres synchronize their phase orientations.',
    icon: Waves
  }
];
