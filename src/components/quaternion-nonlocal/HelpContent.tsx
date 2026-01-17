import { Atom, Link2, Compass, Binary, Waves } from 'lucide-react';

export const helpSteps = [
  {
    title: 'Quaternionic Non-Local Communication',
    description: 'This simulator implements symbolic non-local communication using quaternionic representations of split primes (p ≡ 1 mod 12). Based on the paper by Sebastian Schepis.',
    icon: Atom
  },
  {
    title: 'Split Prime Quaternions',
    description: 'Split primes factor in both Gaussian (Z[i]) and Eisenstein (Z[ω]) integers. These are embedded into quaternion form: q_p = a + bi + jc\' + kd\'.',
    icon: Binary
  },
  {
    title: 'Quaternionic Bloch Dynamics',
    description: 'The imaginary components define a Bloch vector n_p = (b, c\', d\'). Time evolution follows U_p(t) = exp(-iH_q t) visualized on the Bloch sphere.',
    icon: Compass
  },
  {
    title: 'Entangled Transmission',
    description: 'Two primes form an entangled pair with composite Hamiltonian including twist coupling γ_pq(σ_z⊗σ_z) for non-local correlation.',
    icon: Link2
  },
  {
    title: 'Phase Synchronization',
    description: 'Communication succeeds when Δφ_q = arg(q_p*·q_q) < ε. Projection collapses states to eigenvalues ±√p representing symbolic meaning.',
    icon: Waves
  }
];
