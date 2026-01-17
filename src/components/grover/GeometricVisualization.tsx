import { motion } from 'framer-motion';
import { GeometricState } from '@/lib/grover';

interface GeometricVisualizationProps {
  geometricState: GeometricState | null;
  iteration: number;
  optimalIterations: number;
}

export function GeometricVisualization({
  geometricState,
  iteration,
  optimalIterations,
}: GeometricVisualizationProps) {
  const size = 280;
  const center = size / 2;
  const radius = size / 2 - 30;
  
  if (!geometricState) {
    return (
      <div className="bg-secondary/20 rounded-lg p-4">
        <h3 className="text-sm font-medium mb-3">Geometric Interpretation</h3>
        <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
          Initialize to see amplitude rotation
        </div>
      </div>
    );
  }
  
  const { theta, theta0 } = geometricState;
  
  // State vector endpoint
  const stateX = center + radius * Math.cos(Math.PI / 2 - theta);
  const stateY = center - radius * Math.sin(Math.PI / 2 - theta);
  
  // |w⟩ is at 90° (vertical, target)
  const targetX = center;
  const targetY = center - radius;
  
  // |s⊥⟩ is at 0° (horizontal, orthogonal to target)
  const orthoX = center + radius;
  const orthoY = center;
  
  // Initial state direction
  const initialX = center + radius * Math.cos(Math.PI / 2 - theta0);
  const initialY = center - radius * Math.sin(Math.PI / 2 - theta0);
  
  // Optimal state direction
  const optimalTheta = (2 * optimalIterations + 1) * theta0;
  const optimalX = center + radius * Math.cos(Math.PI / 2 - optimalTheta);
  const optimalY = center - radius * Math.sin(Math.PI / 2 - optimalTheta);
  
  // Arc for showing rotation
  const createArc = (startAngle: number, endAngle: number, r: number) => {
    const start = {
      x: center + r * Math.cos(Math.PI / 2 - startAngle),
      y: center - r * Math.sin(Math.PI / 2 - startAngle),
    };
    const end = {
      x: center + r * Math.cos(Math.PI / 2 - endAngle),
      y: center - r * Math.sin(Math.PI / 2 - endAngle),
    };
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };
  
  return (
    <div className="bg-secondary/20 rounded-lg p-4">
      <h3 className="text-sm font-medium mb-3">Geometric Interpretation</h3>
      
      <div className="flex justify-center">
        <svg width={size} height={size} className="overflow-visible">
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
          
          {/* Axes */}
          <line
            x1={center}
            y1={center}
            x2={targetX}
            y2={targetY}
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            strokeDasharray="4 2"
            opacity={0.5}
          />
          <line
            x1={center}
            y1={center}
            x2={orthoX}
            y2={orthoY}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
            strokeDasharray="4 2"
            opacity={0.3}
          />
          
          {/* Initial state direction */}
          <line
            x1={center}
            y1={center}
            x2={initialX}
            y2={initialY}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="2 2"
            opacity={0.4}
          />
          
          {/* Arc showing rotation */}
          {theta > theta0 && (
            <path
              d={createArc(theta0, theta, radius * 0.3)}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              opacity={0.4}
            />
          )}
          
          {/* State vector */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.line
              x1={center}
              y1={center}
              x2={stateX}
              y2={stateY}
              stroke="hsl(142 76% 50%)"
              strokeWidth={3}
              initial={{ x2: center, y2: center }}
              animate={{ x2: stateX, y2: stateY }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <motion.circle
              cx={stateX}
              cy={stateY}
              r={6}
              fill="hsl(142 76% 50%)"
              initial={{ cx: center, cy: center }}
              animate={{ cx: stateX, cy: stateY }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </motion.g>
          
          {/* Target indicator */}
          <circle
            cx={targetX}
            cy={targetY}
            r={8}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
          />
          
          {/* Labels */}
          <text
            x={targetX}
            y={targetY - 15}
            textAnchor="middle"
            className="text-xs fill-primary"
          >
            |w⟩
          </text>
          <text
            x={orthoX + 15}
            y={orthoY}
            textAnchor="start"
            className="text-xs fill-muted-foreground"
          >
            |s⊥⟩
          </text>
          <text
            x={initialX + 10}
            y={initialY}
            textAnchor="start"
            className="text-[10px] fill-muted-foreground"
          >
            |s⟩
          </text>
          
          {/* Angle annotation */}
          <text
            x={center + 50}
            y={center - 20}
            textAnchor="start"
            className="text-[10px] fill-muted-foreground"
          >
            θ = {(theta * 180 / Math.PI).toFixed(1)}°
          </text>
        </svg>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
        <div className="bg-secondary/30 p-2 rounded">
          <div className="text-muted-foreground">θ₀</div>
          <div className="font-mono">{(theta0 * 180 / Math.PI).toFixed(2)}°</div>
        </div>
        <div className="bg-secondary/30 p-2 rounded">
          <div className="text-muted-foreground">Δθ</div>
          <div className="font-mono">{(2 * theta0 * 180 / Math.PI).toFixed(2)}°</div>
        </div>
        <div className="bg-secondary/30 p-2 rounded">
          <div className="text-muted-foreground">Current θ</div>
          <div className="font-mono">{(theta * 180 / Math.PI).toFixed(2)}°</div>
        </div>
      </div>
    </div>
  );
}
