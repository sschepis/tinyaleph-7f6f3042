import { ComplexNumber } from '@/lib/quantum-circuit/types';

interface AmplitudePlotProps {
  state: ComplexNumber[];
}

export const AmplitudePlot = ({ state }: AmplitudePlotProps) => {
  const maxAmp = Math.max(...state.map(s => Math.sqrt(s.real * s.real + s.imag * s.imag)), 0.01);
  
  return (
    <div className="bg-muted/30 rounded-lg border border-border p-4">
      <div className="flex items-end gap-1 h-24">
        {state.slice(0, 8).map((s, i) => {
          const amplitude = Math.sqrt(s.real * s.real + s.imag * s.imag);
          const heightPercent = (amplitude / maxAmp) * 100;
          const phase = Math.atan2(s.imag, s.real);
          const hue = ((phase + Math.PI) / (2 * Math.PI)) * 360;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div 
                className="w-full rounded-t transition-all duration-300"
                style={{ 
                  height: `${Math.max(4, heightPercent)}%`,
                  backgroundColor: `hsl(${hue}, 70%, 50%)`,
                }}
                title={`|${i.toString(2).padStart(Math.ceil(Math.log2(state.length)), '0')}⟩: ${amplitude.toFixed(3)}`}
              />
              <span className="text-[8px] text-muted-foreground font-mono">|{i}⟩</span>
            </div>
          );
        })}
      </div>
      <div className="text-center text-xs text-muted-foreground mt-2">Amplitude (color = phase)</div>
    </div>
  );
};
