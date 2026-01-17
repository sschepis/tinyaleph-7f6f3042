import { DecoherenceState } from '@/lib/decoherence/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { evolveBlochVector, calculatePurity, calculateFidelity } from '@/lib/decoherence/engine';
import { useMemo } from 'react';

interface DecayPlotProps {
  state: DecoherenceState;
}

export function DecayPlot({ state }: DecayPlotProps) {
  const data = useMemo(() => {
    const maxTime = Math.max(state.params.T1 * 3, state.time + 10);
    const points = 100;
    const dt = maxTime / points;
    
    return Array.from({ length: points + 1 }, (_, i) => {
      const t = i * dt;
      const bloch = evolveBlochVector(state.initialBloch, t, state.params);
      const purity = calculatePurity(bloch);
      const fidelity = calculateFidelity(state.initialBloch, bloch);
      
      return {
        time: t,
        x: Math.abs(bloch.x),
        y: Math.abs(bloch.y),
        z: bloch.z,
        xy: Math.sqrt(bloch.x ** 2 + bloch.y ** 2),
        purity,
        fidelity,
      };
    });
  }, [state.params, state.initialBloch]);
  
  const currentPoint = {
    time: state.time,
    xy: Math.sqrt(state.bloch.x ** 2 + state.bloch.y ** 2),
    z: state.bloch.z,
    purity: state.purity,
    fidelity: state.fidelity,
  };
  
  return (
    <div className="space-y-4">
      <div className="h-[200px]">
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Coherence Decay (T₂)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              tickFormatter={(v) => `${v.toFixed(0)}`}
              label={{ value: 'Time (μs)', position: 'bottom', offset: -5 }}
              fontSize={10}
            />
            <YAxis domain={[0, 1]} fontSize={10} />
            <Tooltip 
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label) => `t = ${Number(label).toFixed(2)} μs`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="xy" 
              name="⟨σ_xy⟩" 
              stroke="hsl(280, 70%, 60%)" 
              dot={false} 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="fidelity" 
              name="Fidelity" 
              stroke="hsl(160, 70%, 50%)" 
              dot={false} 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <ReferenceLine x={state.params.T2} stroke="hsl(280, 50%, 50%)" strokeDasharray="3 3" label="T₂" />
            <ReferenceLine x={state.time} stroke="hsl(var(--primary))" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="h-[200px]">
        <h4 className="text-sm font-medium mb-2 text-muted-foreground">Population Decay (T₁)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="time" 
              tickFormatter={(v) => `${v.toFixed(0)}`}
              label={{ value: 'Time (μs)', position: 'bottom', offset: -5 }}
              fontSize={10}
            />
            <YAxis domain={[-1, 1]} fontSize={10} />
            <Tooltip 
              formatter={(value: number) => value.toFixed(4)}
              labelFormatter={(label) => `t = ${Number(label).toFixed(2)} μs`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="z" 
              name="⟨σ_z⟩" 
              stroke="hsl(220, 70%, 60%)" 
              dot={false} 
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="purity" 
              name="Purity" 
              stroke="hsl(45, 70%, 50%)" 
              dot={false} 
              strokeWidth={2}
              strokeDasharray="5 5"
            />
            <ReferenceLine x={state.params.T1} stroke="hsl(220, 50%, 50%)" strokeDasharray="3 3" label="T₁" />
            <ReferenceLine x={state.time} stroke="hsl(var(--primary))" strokeWidth={2} />
            <ReferenceLine y={-1} stroke="hsl(var(--muted-foreground))" strokeDasharray="2 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
