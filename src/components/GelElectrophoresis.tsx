import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface Band {
  length: number;
  label?: string;
  intensity?: number;
  isMarker?: boolean;
}

interface GelElectrophoresisProps {
  bands: Band[];
  maxLength?: number;
  showLadder?: boolean;
  highlightIndex?: number;
  animated?: boolean;
}

const GelElectrophoresis = ({
  bands,
  maxLength = 1000,
  showLadder = true,
  highlightIndex,
  animated = true,
}: GelElectrophoresisProps) => {
  // Standard DNA ladder (bp)
  const ladder = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000];
  
  // Calculate position based on length (smaller = further down = larger y)
  const getPosition = (length: number) => {
    // Logarithmic scale for better separation
    const minLen = 50;
    const logMin = Math.log10(minLen);
    const logMax = Math.log10(maxLength);
    const logLen = Math.log10(Math.max(length, minLen));
    
    // Invert so smaller goes further down
    return 1 - (logLen - logMin) / (logMax - logMin);
  };

  const sortedBands = useMemo(() => 
    [...bands].sort((a, b) => b.length - a.length),
    [bands]
  );

  const wellWidth = 40;
  const laneSpacing = 50;
  const gelHeight = 300;
  const startY = 30;
  const numLanes = sortedBands.length + (showLadder ? 1 : 0);
  const totalWidth = numLanes * laneSpacing + 60;

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg p-4 overflow-x-auto">
      <svg width={totalWidth} height={gelHeight + 60} className="overflow-visible">
        {/* Gel background */}
        <defs>
          <linearGradient id="gel-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#16213e" />
          </linearGradient>
        </defs>
        
        <rect
          x={20}
          y={startY}
          width={totalWidth - 40}
          height={gelHeight}
          fill="url(#gel-gradient)"
          rx={4}
          stroke="#333"
          strokeWidth={1}
        />

        {/* Loading wells */}
        {Array.from({ length: numLanes }).map((_, i) => (
          <rect
            key={`well-${i}`}
            x={30 + i * laneSpacing + (laneSpacing - wellWidth) / 2}
            y={startY - 8}
            width={wellWidth}
            height={12}
            fill="#222"
            stroke="#444"
            strokeWidth={1}
            rx={2}
          />
        ))}

        {/* DNA Ladder */}
        {showLadder && (
          <g transform={`translate(${30 + (laneSpacing - wellWidth) / 2}, ${startY})`}>
            <text
              x={wellWidth / 2}
              y={-15}
              textAnchor="middle"
              className="fill-muted-foreground text-xs"
            >
              Ladder
            </text>
            {ladder.map((bp, i) => {
              const y = getPosition(bp) * (gelHeight - 40) + 20;
              return (
                <g key={`ladder-${bp}`}>
                  <motion.rect
                    x={4}
                    y={y - 3}
                    width={wellWidth - 8}
                    height={6}
                    fill="#0ff"
                    opacity={0.5 + (1000 - bp) / 2000}
                    rx={1}
                    initial={animated ? { opacity: 0, y: 0 } : undefined}
                    animate={animated ? { opacity: 0.5 + (1000 - bp) / 2000, y } : undefined}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  />
                  <text
                    x={-5}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-muted-foreground text-[8px] font-mono"
                  >
                    {bp}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Sample lanes */}
        {sortedBands.map((band, laneIndex) => {
          const laneOffset = showLadder ? 1 : 0;
          const x = 30 + (laneIndex + laneOffset) * laneSpacing + (laneSpacing - wellWidth) / 2;
          const y = getPosition(band.length) * (gelHeight - 40) + 20 + startY;
          const isHighlighted = highlightIndex === laneIndex;
          
          return (
            <g key={`lane-${laneIndex}`} transform={`translate(${x}, 0)`}>
              {/* Lane label */}
              <text
                x={wellWidth / 2}
                y={startY - 15}
                textAnchor="middle"
                className="fill-muted-foreground text-xs"
              >
                {band.label || `S${laneIndex + 1}`}
              </text>
              
              {/* Band */}
              <motion.rect
                x={6}
                y={y - 4}
                width={wellWidth - 12}
                height={8}
                fill={isHighlighted ? '#22c55e' : '#0ff'}
                opacity={band.intensity ?? 0.8}
                rx={2}
                initial={animated ? { opacity: 0, y: startY } : undefined}
                animate={animated ? { opacity: band.intensity ?? 0.8, y: y - 4 } : undefined}
                transition={{ delay: laneIndex * 0.15 + 0.5, duration: 0.8, type: 'spring' }}
                style={{
                  filter: isHighlighted ? 'drop-shadow(0 0 8px #22c55e)' : 'drop-shadow(0 0 4px #0ff60)',
                }}
              />
              
              {/* Length label */}
              <motion.text
                x={wellWidth + 5}
                y={y + 3}
                className={`text-[10px] font-mono ${isHighlighted ? 'fill-green-400' : 'fill-cyan-400'}`}
                initial={animated ? { opacity: 0 } : undefined}
                animate={animated ? { opacity: 1 } : undefined}
                transition={{ delay: laneIndex * 0.15 + 1, duration: 0.3 }}
              >
                {band.length}bp
              </motion.text>
            </g>
          );
        })}

        {/* Electrode indicators */}
        <text x={10} y={startY + 10} className="fill-red-400 text-xs font-bold">−</text>
        <text x={10} y={startY + gelHeight - 5} className="fill-blue-400 text-xs font-bold">+</text>
        
        {/* Direction arrow */}
        <line
          x1={12}
          y1={startY + 25}
          x2={12}
          y2={startY + gelHeight - 20}
          stroke="#666"
          strokeWidth={1}
          markerEnd="url(#arrowhead)"
        />
        <defs>
          <marker
            id="arrowhead"
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 Z" fill="#666" />
          </marker>
        </defs>
      </svg>
      
      <div className="mt-2 text-center text-xs text-muted-foreground">
        Agarose Gel Electrophoresis
      </div>
    </div>
  );
};

export default GelElectrophoresis;
