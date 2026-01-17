import { HelpStep } from '@/components/app-help/AppHelpDialog';
import { Atom, Timer, LineChart, Settings2, Cpu } from 'lucide-react';

export function HelpContent(): HelpStep[] {
  return [
    {
      title: 'Quantum Decoherence',
      content: 'Explore how quantum states lose their coherence over time due to interaction with the environment. This simulator models T₁ (energy relaxation) and T₂ (dephasing) processes that limit quantum computer performance.',
      icon: Atom,
    },
    {
      title: 'T₁ and T₂ Times',
      content: 'T₁ (longitudinal relaxation) measures how quickly a qubit loses energy and returns to ground state. T₂ (transverse relaxation) measures how quickly phase coherence is lost. The constraint T₂ ≤ 2T₁ always holds.',
      icon: Timer,
    },
    {
      title: 'Bloch Sphere',
      content: 'The Bloch sphere represents qubit states as vectors. Pure states lie on the surface (|r|=1), while mixed states are inside. Decoherence causes the vector to shrink toward the center (maximally mixed) and drift toward |0⟩.',
      icon: LineChart,
    },
    {
      title: 'Qubit Systems',
      content: 'Different physical implementations have vastly different coherence times. Superconducting qubits: ~50μs. Trapped ions: ~1000μs. Spin qubits: ~10000μs. These differences drive quantum hardware choices.',
      icon: Cpu,
    },
    {
      title: 'Parameters',
      content: 'Adjust T₁, T₂, Larmor frequency (ω₀), and temperature to see their effects. Higher temperatures increase thermal noise. The initial state determines which decay channel dominates: |1⟩ shows T₁ decay, |+⟩ shows T₂ decay.',
      icon: Settings2,
    },
  ];
}
