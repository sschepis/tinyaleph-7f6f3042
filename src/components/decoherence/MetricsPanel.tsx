import { DecoherenceState } from '@/lib/decoherence/types';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface MetricsPanelProps {
  state: DecoherenceState;
  decayRates: {
    gamma1: number;
    gamma2: number;
    gammaPhi: number;
  };
}

export function MetricsPanel({ state, decayRates }: MetricsPanelProps) {
  const { bloch, purity, fidelity, params } = state;
  
  const r = Math.sqrt(bloch.x ** 2 + bloch.y ** 2 + bloch.z ** 2);
  const theta = Math.acos(Math.max(-1, Math.min(1, bloch.z / (r || 1))));
  const phi = Math.atan2(bloch.y, bloch.x);
  
  return (
    <div className="space-y-3">
      <Card className="p-3">
        <h4 className="text-sm font-medium mb-2">State Vector</h4>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">⟨σ_x⟩</p>
            <p className="font-mono text-sm">{bloch.x.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">⟨σ_y⟩</p>
            <p className="font-mono text-sm">{bloch.y.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">⟨σ_z⟩</p>
            <p className="font-mono text-sm">{bloch.z.toFixed(4)}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center mt-2 border-t pt-2">
          <div>
            <p className="text-xs text-muted-foreground">|r|</p>
            <p className="font-mono text-sm">{r.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">θ</p>
            <p className="font-mono text-sm">{(theta * 180 / Math.PI).toFixed(1)}°</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">φ</p>
            <p className="font-mono text-sm">{(phi * 180 / Math.PI).toFixed(1)}°</p>
          </div>
        </div>
      </Card>
      
      <Card className="p-3">
        <h4 className="text-sm font-medium mb-2">Quality Metrics</h4>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Purity Tr(ρ²)</span>
              <span className="font-mono">{(purity * 100).toFixed(1)}%</span>
            </div>
            <Progress value={purity * 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Fidelity</span>
              <span className="font-mono">{(fidelity * 100).toFixed(1)}%</span>
            </div>
            <Progress value={fidelity * 100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Coherence</span>
              <span className="font-mono">{(Math.sqrt(bloch.x ** 2 + bloch.y ** 2) * 100).toFixed(1)}%</span>
            </div>
            <Progress value={Math.sqrt(bloch.x ** 2 + bloch.y ** 2) * 100} className="h-2" />
          </div>
        </div>
      </Card>
      
      <Card className="p-3">
        <h4 className="text-sm font-medium mb-2">Decay Rates</h4>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">γ₁ = 1/T₁</span>
            <span className="font-mono">{(decayRates.gamma1 * 1000).toFixed(4)} kHz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">γ₂ = 1/T₂</span>
            <span className="font-mono">{(decayRates.gamma2 * 1000).toFixed(4)} kHz</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">γ_φ (pure dephasing)</span>
            <span className="font-mono">{(decayRates.gammaPhi * 1000).toFixed(4)} kHz</span>
          </div>
        </div>
      </Card>
      
      <Card className="p-3 bg-muted/30">
        <h4 className="text-sm font-medium mb-1">Physics</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong>T₁</strong> (longitudinal relaxation): Energy decay to thermal equilibrium via spontaneous emission.
          <br />
          <strong>T₂</strong> (transverse relaxation): Loss of phase coherence. T₂ ≤ 2T₁ always.
          <br />
          <strong>T₂*</strong>: Includes inhomogeneous broadening effects.
        </p>
      </Card>
    </div>
  );
}
