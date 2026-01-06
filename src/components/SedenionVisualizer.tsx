import { useEffect, useState } from 'react';

interface SedenionVisualizerProps {
  components?: number[];
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const SedenionVisualizer = ({ 
  components = [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 
  animated = true,
  size = 'md'
}: SedenionVisualizerProps) => {
  const [displayComponents, setDisplayComponents] = useState(components);
  
  useEffect(() => {
    if (!animated) {
      setDisplayComponents(components);
      return;
    }
    
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      setDisplayComponents(prev => 
        prev.map((c, i) => {
          const phase = (frame * 0.02 + i * 0.4);
          const oscillation = Math.sin(phase) * 0.1;
          return Math.max(0, Math.min(1, components[i] + oscillation));
        })
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, [components, animated]);

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const gapClasses = {
    sm: 'gap-0.5',
    md: 'gap-1',
    lg: 'gap-1.5'
  };

  return (
    <div className="relative">
      <div className={`grid grid-cols-4 ${gapClasses[size]}`}>
        {displayComponents.map((value, index) => {
          const normalizedValue = Math.abs(value);
          const hue = 180 + (index * 10); // Cyan to blue range
          
          return (
            <div
              key={index}
              className={`${sizeClasses[size]} rounded-sm transition-all duration-100`}
              style={{
                backgroundColor: `hsla(${hue}, 70%, 50%, ${0.2 + normalizedValue * 0.8})`,
                boxShadow: normalizedValue > 0.3 
                  ? `0 0 ${normalizedValue * 12}px hsla(${hue}, 70%, 50%, ${normalizedValue * 0.6})`
                  : 'none',
                transform: `scale(${0.8 + normalizedValue * 0.2})`
              }}
              title={`e${index}: ${value.toFixed(3)}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default SedenionVisualizer;
