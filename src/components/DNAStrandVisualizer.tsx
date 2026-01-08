import { useMemo } from 'react';
import { NUCLEOTIDE_COLORS } from '@/lib/dna-computer/types';
import { getComplement } from '@/lib/dna-computer/encoding';

interface DNAStrandVisualizerProps {
  sequence: string;
  showComplement?: boolean;
  showLabels?: boolean;
  animated?: boolean;
  compact?: boolean;
}

const DNAStrandVisualizer = ({
  sequence,
  showComplement = true,
  showLabels = true,
  animated = true,
  compact = false,
}: DNAStrandVisualizerProps) => {
  const complement = useMemo(() => getComplement(sequence), [sequence]);
  const nucleotides = useMemo(() => [...sequence.toUpperCase()], [sequence]);
  
  const baseSize = compact ? 24 : 32;
  const gapSize = compact ? 4 : 8;
  const height = showComplement ? (compact ? 80 : 120) : (compact ? 40 : 60);
  const width = nucleotides.length * (baseSize + gapSize) + 40;

  if (nucleotides.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
        Enter a DNA sequence above
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <svg 
        width={Math.max(width, 200)} 
        height={height}
        className="overflow-visible"
      >
        {/* 5' label for top strand */}
        {showLabels && (
          <text
            x={10}
            y={showComplement ? 30 : height / 2 + 4}
            className="fill-muted-foreground text-xs font-mono"
          >
            5'
          </text>
        )}

        {/* Top strand (sense) */}
        <g transform={`translate(30, ${showComplement ? 20 : height / 2 - baseSize / 2})`}>
          {nucleotides.map((nuc, i) => {
            const color = NUCLEOTIDE_COLORS[nuc] || '#888';
            const x = i * (baseSize + gapSize);
            
            return (
              <g key={`top-${i}`}>
                {/* Backbone line */}
                {i > 0 && (
                  <line
                    x1={x - gapSize}
                    y1={baseSize / 2}
                    x2={x}
                    y2={baseSize / 2}
                    stroke="hsl(var(--border))"
                    strokeWidth={2}
                  />
                )}
                
                {/* Nucleotide circle */}
                <circle
                  cx={x + baseSize / 2}
                  cy={baseSize / 2}
                  r={baseSize / 2 - 2}
                  fill={color}
                  opacity={0.9}
                  style={{
                    filter: `drop-shadow(0 0 4px ${color}60)`,
                    animation: animated ? `pulse 2s ease-in-out ${i * 0.1}s infinite` : undefined,
                  }}
                />
                
                {/* Nucleotide label */}
                <text
                  x={x + baseSize / 2}
                  y={baseSize / 2 + 4}
                  textAnchor="middle"
                  className="fill-white font-bold text-xs"
                  style={{ fontSize: compact ? 10 : 12 }}
                >
                  {nuc}
                </text>
              </g>
            );
          })}
        </g>

        {/* 3' label for top strand */}
        {showLabels && (
          <text
            x={30 + nucleotides.length * (baseSize + gapSize) + 5}
            y={showComplement ? 30 : height / 2 + 4}
            className="fill-muted-foreground text-xs font-mono"
          >
            3'
          </text>
        )}

        {/* Hydrogen bonds (base pairing) */}
        {showComplement && nucleotides.map((nuc, i) => {
          const x = 30 + i * (baseSize + gapSize) + baseSize / 2;
          const isGC = nuc === 'G' || nuc === 'C';
          
          return (
            <g key={`bond-${i}`}>
              {/* Hydrogen bonds: 3 for G-C, 2 for A-T */}
              {isGC ? (
                <>
                  <line x1={x - 3} y1={20 + baseSize + 4} x2={x - 3} y2={height - 20 - baseSize - 4} stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="2 2" opacity={0.5} />
                  <line x1={x} y1={20 + baseSize + 4} x2={x} y2={height - 20 - baseSize - 4} stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="2 2" opacity={0.5} />
                  <line x1={x + 3} y1={20 + baseSize + 4} x2={x + 3} y2={height - 20 - baseSize - 4} stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="2 2" opacity={0.5} />
                </>
              ) : (
                <>
                  <line x1={x - 2} y1={20 + baseSize + 4} x2={x - 2} y2={height - 20 - baseSize - 4} stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="2 2" opacity={0.5} />
                  <line x1={x + 2} y1={20 + baseSize + 4} x2={x + 2} y2={height - 20 - baseSize - 4} stroke="hsl(var(--primary))" strokeWidth={1} strokeDasharray="2 2" opacity={0.5} />
                </>
              )}
            </g>
          );
        })}

        {/* Bottom strand (antisense/complement) */}
        {showComplement && (
          <>
            {/* 3' label for bottom strand */}
            {showLabels && (
              <text
                x={10}
                y={height - 10}
                className="fill-muted-foreground text-xs font-mono"
              >
                3'
              </text>
            )}
            
            <g transform={`translate(30, ${height - 20 - baseSize})`}>
              {[...complement].map((nuc, i) => {
                const color = NUCLEOTIDE_COLORS[nuc] || '#888';
                const x = i * (baseSize + gapSize);
                
                return (
                  <g key={`bottom-${i}`}>
                    {/* Backbone line */}
                    {i > 0 && (
                      <line
                        x1={x - gapSize}
                        y1={baseSize / 2}
                        x2={x}
                        y2={baseSize / 2}
                        stroke="hsl(var(--border))"
                        strokeWidth={2}
                      />
                    )}
                    
                    {/* Nucleotide circle */}
                    <circle
                      cx={x + baseSize / 2}
                      cy={baseSize / 2}
                      r={baseSize / 2 - 2}
                      fill={color}
                      opacity={0.9}
                      style={{
                        filter: `drop-shadow(0 0 4px ${color}60)`,
                        animation: animated ? `pulse 2s ease-in-out ${i * 0.1 + 0.5}s infinite` : undefined,
                      }}
                    />
                    
                    {/* Nucleotide label */}
                    <text
                      x={x + baseSize / 2}
                      y={baseSize / 2 + 4}
                      textAnchor="middle"
                      className="fill-white font-bold text-xs"
                      style={{ fontSize: compact ? 10 : 12 }}
                    >
                      {nuc}
                    </text>
                  </g>
                );
              })}
            </g>

            {/* 5' label for bottom strand */}
            {showLabels && (
              <text
                x={30 + nucleotides.length * (baseSize + gapSize) + 5}
                y={height - 10}
                className="fill-muted-foreground text-xs font-mono"
              >
                5'
              </text>
            )}
          </>
        )}
      </svg>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.9; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default DNAStrandVisualizer;
