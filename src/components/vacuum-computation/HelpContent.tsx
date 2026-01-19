import { Atom, Zap, Thermometer, Binary, RotateCcw } from 'lucide-react';

export const helpSteps = [
  {
    title: 'Vacuum Computation Lab',
    content: 'Explore entropy-based computation through structured vacuum fluctuations. This simulator demonstrates how logical operations can be performed using thermodynamic principles.',
    icon: Atom
  },
  {
    title: 'Vacuum Fluctuations',
    content: 'The fluctuation field visualizes quantum vacuum energy—the "seething" activity of empty space. By structuring these fluctuations, we create computational regions.',
    icon: Zap
  },
  {
    title: 'Logic Gates & Entropy',
    content: 'Each logic gate has an entropy cost. Irreversible gates (AND, OR) erase information and must dissipate energy. Reversible gates (NOT, XOR) can theoretically operate at zero energy cost.',
    icon: Binary
  },
  {
    title: 'Landauer\'s Principle',
    content: 'Erasing one bit of information requires at least kT ln(2) of energy (about 2.85×10⁻²¹ J at room temperature). The efficiency meter shows how close to this theoretical limit we operate.',
    icon: Thermometer
  },
  {
    title: 'Running Simulations',
    content: '1. Select a circuit preset\n2. Set input values (click to toggle)\n3. Click "Run" to simulate\n4. Observe entropy flow and energy dissipation\n5. Compare actual vs. Landauer limit',
    icon: RotateCcw
  }
];
