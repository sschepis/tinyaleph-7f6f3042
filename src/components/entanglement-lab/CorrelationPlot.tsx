import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ReferenceLine, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { theoreticalCorrelation, BellState } from '@/lib/entanglement-lab';

interface CorrelationPlotProps {
  bellState: BellState;
  aliceAngle: number;
  bobAngle: number;
  measuredCorrelation?: number;
  measurementCount?: number;
}

export function CorrelationPlot({
  bellState,
  aliceAngle,
  bobAngle,
  measuredCorrelation,
  measurementCount = 0
}: CorrelationPlotProps) {
  // Generate theoretical curve
  const data = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 72; i++) {
      const bobAngleDeg = i * 5;
      const bobAngleRad = bobAngleDeg * Math.PI / 180;
      const correlation = theoreticalCorrelation(bellState, aliceAngle, bobAngleRad);
      points.push({
        angle: bobAngleDeg,
        correlation,
        classical: 0 // Classical bound comparison
      });
    }
    return points;
  }, [bellState, aliceAngle]);
  
  // Current Bob angle in degrees
  const currentBobDeg = (bobAngle * 180 / Math.PI) % 360;
  const currentTheoretical = theoreticalCorrelation(bellState, aliceAngle, bobAngle);
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Correlation E(θ_A, θ_B)</h3>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-primary" />
            Quantum
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-muted-foreground/50 border-dashed border-t" />
            Classical
          </span>
        </div>
      </div>
      
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            {/* Quantum advantage region */}
            <defs>
              <linearGradient id="quantumAdvantage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="angle" 
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => `${v}°`}
              domain={[0, 360]}
            />
            <YAxis 
              domain={[-1, 1]} 
              tick={{ fontSize: 10 }}
              tickFormatter={(v) => v.toFixed(1)}
            />
            
            {/* Classical bound lines */}
            <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} />
            
            {/* Current Bob angle marker */}
            <ReferenceLine 
              x={currentBobDeg} 
              stroke="hsl(var(--destructive))" 
              strokeDasharray="4 4"
              strokeWidth={2}
            />
            
            {/* Correlation curve */}
            <Area
              type="monotone"
              dataKey="correlation"
              fill="url(#quantumAdvantage)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="correlation"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
            />
            
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                fontSize: '12px'
              }}
              formatter={(value: number) => [value.toFixed(3), 'E(a,b)']}
              labelFormatter={(label) => `Bob: ${label}°`}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Stats */}
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div className="p-2 bg-secondary/30 rounded text-center">
          <div className="text-muted-foreground">Theoretical</div>
          <div className="font-mono text-primary">{currentTheoretical.toFixed(3)}</div>
        </div>
        <div className="p-2 bg-secondary/30 rounded text-center">
          <div className="text-muted-foreground">Measured</div>
          <div className="font-mono">
            {measurementCount > 0 ? measuredCorrelation?.toFixed(3) : '—'}
          </div>
        </div>
        <div className="p-2 bg-secondary/30 rounded text-center">
          <div className="text-muted-foreground">Samples</div>
          <div className="font-mono">{measurementCount}</div>
        </div>
      </div>
    </div>
  );
}
