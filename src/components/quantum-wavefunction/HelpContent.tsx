import { Waves, Settings, BarChart3, Target, Sparkles } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export const QUANTUM_WAVEFUNCTION_HELP: HelpStep[] = [
  {
    title: 'Welcome to Quantum Wavefunction Explorer',
    icon: Waves,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Explore the deep connection between prime numbers and quantum-like wavefunctions. 
          This tool visualizes ψ(x) constructed from Riemann zeta zeros and prime harmonics.
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Prime Patterns</span>
            <p className="text-xs text-muted-foreground mt-1">Detect prime signatures in wavefunction</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">Riemann Zeros</span>
            <p className="text-xs text-muted-foreground mt-1">γ parameter explores zeta zeros</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Parameter Controls',
    icon: Settings,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Adjust the wavefunction parameters to explore different regimes:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">γ (gamma)</span>
            <p className="text-xs text-muted-foreground">Riemann zero parameter - imaginary part of ζ(½ + iγ) = 0</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">V₀ (potential depth)</span>
            <p className="text-xs text-muted-foreground">Controls prime-localized potential wells</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">ε (epsilon)</span>
            <p className="text-xs text-muted-foreground">Tunneling parameter between wells</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">β (beta)</span>
            <p className="text-xs text-muted-foreground">Coupling strength in resonance network</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Wavefunction Visualization',
    icon: Target,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The main plot shows ψ(x) = Re(ψ) + i·Im(ψ) with key features:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500 mt-1.5" />
            <span><strong>Blue curve:</strong> Real part Re(ψ)</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5" />
            <span><strong>Pink curve:</strong> Imaginary part Im(ψ)</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
            <span><strong>Dashed:</strong> Probability density |ψ|²</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5" />
            <span><strong>Markers:</strong> Prime number positions</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: '3D Complex Helix',
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          The 3D visualization shows the complex wavefunction as a helix in 3D space:
        </p>
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <ul className="space-y-1 text-sm">
            <li><strong>X-axis:</strong> Position x (number line)</li>
            <li><strong>Y-axis:</strong> Real part Re(ψ)</li>
            <li><strong>Z-axis:</strong> Imaginary part Im(ψ)</li>
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">
          Prime positions are highlighted with glowing spheres. The helical structure 
          reveals phase relationships between different x values.
        </p>
      </div>
    ),
  },
  {
    title: 'Analysis Tools',
    icon: BarChart3,
    content: (
      <div className="space-y-3 text-sm">
        <div className="p-2 rounded bg-muted/50">
          <span className="font-semibold">Correlation Panel</span>
          <p className="text-xs text-muted-foreground">Measures wave-prime correlation ρ and statistical significance</p>
        </div>
        <div className="p-2 rounded bg-muted/50">
          <span className="font-semibold">Phase Portrait</span>
          <p className="text-xs text-muted-foreground">Re(ψ) vs Im(ψ) trajectory showing phase dynamics</p>
        </div>
        <div className="p-2 rounded bg-muted/50">
          <span className="font-semibold">Fourier Spectrum</span>
          <p className="text-xs text-muted-foreground">Frequency decomposition revealing periodic structures</p>
        </div>
        <div className="p-2 rounded bg-muted/50">
          <span className="font-semibold">Prime Gap Analysis</span>
          <p className="text-xs text-muted-foreground">Statistical analysis of gaps between consecutive primes</p>
        </div>
      </div>
    ),
  },
];
