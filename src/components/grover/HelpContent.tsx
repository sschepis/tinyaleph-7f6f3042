import { Search, Zap, BarChart3, Compass, Clock, Play } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export function HelpContent(): HelpStep[] {
  return [
    {
      title: "Welcome to Grover's Search Visualizer",
      icon: <Search className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p>
            Grover's algorithm finds marked items with <strong>quadratic speedup</strong>—O(√N) instead of O(N).
          </p>
        </div>
      ),
    },
    {
      title: "The Oracle",
      icon: <Zap className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p>The oracle marks solution states by flipping their phase: O|x⟩ = −|x⟩ if marked.</p>
        </div>
      ),
    },
    {
      title: "Amplitude Amplification",
      icon: <BarChart3 className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p>Each iteration: <strong>Oracle</strong> (flip marked) → <strong>Diffusion</strong> (reflect about mean).</p>
        </div>
      ),
    },
    {
      title: "Geometric Interpretation",
      icon: <Compass className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p>The state vector rotates by 2θ₀ toward the target |w⟩ each iteration.</p>
        </div>
      ),
    },
    {
      title: "Optimal Iterations",
      icon: <Clock className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p>k<sub>opt</sub> ≈ (π/4)√(N/M). More iterations decreases success probability!</p>
        </div>
      ),
    },
    {
      title: "Using the Simulator",
      icon: <Play className="w-5 h-5" />,
      content: (
        <div className="space-y-3">
          <p>Set qubits → Mark states → Initialize → Step/Animate → Measure at peak probability.</p>
        </div>
      ),
    },
  ];
}
