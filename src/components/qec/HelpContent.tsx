import { Shield, Zap, Activity, Wrench, BookOpen, Play } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export function HelpContent(): HelpStep[] {
  return [
    {
      title: 'Welcome to QEC Lab',
      icon: Shield,
      content: (
        <div className="space-y-3">
          <p>
            Quantum Error Correction protects quantum information by encoding logical qubits into 
            multiple physical qubits, enabling detection and correction of errors.
          </p>
        </div>
      ),
    },
    {
      title: 'Error Types',
      icon: Zap,
      content: (
        <div className="space-y-3">
          <p><strong>Bit-flip (X):</strong> Swaps |0⟩ ↔ |1⟩</p>
          <p><strong>Phase-flip (Z):</strong> Adds phase: |1⟩ → −|1⟩</p>
          <p><strong>Both (Y):</strong> Combination of X and Z</p>
        </div>
      ),
    },
    {
      title: 'Syndrome Measurement',
      icon: Activity,
      content: (
        <div className="space-y-3">
          <p>
            Syndromes measure <strong>parity</strong> between qubits without collapsing the logical state.
            The pattern of syndrome values reveals the error location.
          </p>
        </div>
      ),
    },
    {
      title: 'Error Correction',
      icon: Wrench,
      content: (
        <div className="space-y-3">
          <p>
            Based on the syndrome pattern, apply the inverse operation to correct the error 
            and restore the logical qubit to its original state.
          </p>
        </div>
      ),
    },
    {
      title: 'Code Types',
      icon: BookOpen,
      content: (
        <div className="space-y-3">
          <p><strong>3-Qubit Bit-Flip:</strong> Corrects single X errors</p>
          <p><strong>3-Qubit Phase-Flip:</strong> Corrects single Z errors</p>
          <p><strong>Shor 9-Qubit:</strong> Corrects any single-qubit error</p>
          <p><strong>Steane 7-Qubit:</strong> Efficient CSS code</p>
        </div>
      ),
    },
    {
      title: 'Using the Lab',
      icon: Play,
      content: (
        <div className="space-y-3">
          <p>
            1. Select a code type<br />
            2. Encode a logical qubit<br />
            3. Inject an error<br />
            4. Measure syndromes<br />
            5. Apply correction
          </p>
          <p className="text-sm text-muted-foreground">
            Or click <strong>Auto Demo</strong> to see the full cycle!
          </p>
        </div>
      ),
    },
  ];
}
