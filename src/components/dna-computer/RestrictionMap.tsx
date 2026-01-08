import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { NUCLEOTIDE_COLORS } from '@/lib/dna-computer/types';

interface RestrictionSite {
  enzyme: string;
  position: number;
  recognition: string;
}

interface RestrictionMapProps {
  sequence: string;
  sites: RestrictionSite[];
  highlightSite?: number;
}

const RestrictionMap = ({ sequence, sites, highlightSite }: RestrictionMapProps) => {
  const width = 600;
  const height = 200;
  const seqLength = sequence.length;
  
  const scale = (pos: number) => (pos / seqLength) * (width - 100) + 50;
  
  const sortedSites = useMemo(() => 
    [...sites].sort((a, b) => a.position - b.position),
    [sites]
  );
  
  // Group overlapping labels
  const labelPositions = useMemo(() => {
    const positions: Array<{ site: RestrictionSite; yOffset: number }> = [];
    let lastX = -100;
    let currentRow = 0;
    
    for (const site of sortedSites) {
      const x = scale(site.position);
      if (x - lastX < 60) {
        currentRow = (currentRow + 1) % 3;
      } else {
        currentRow = 0;
      }
      positions.push({ site, yOffset: currentRow * 25 });
      lastX = x;
    }
    
    return positions;
  }, [sortedSites, seqLength]);

  return (
    <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
      <svg width={width} height={height} className="overflow-visible">
        {/* Sequence backbone */}
        <line
          x1={50}
          y1={height / 2}
          x2={width - 50}
          y2={height / 2}
          stroke="hsl(var(--border))"
          strokeWidth={8}
          strokeLinecap="round"
        />
        
        {/* Position markers */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const pos = Math.floor(frac * seqLength);
          const x = scale(pos);
          return (
            <g key={i}>
              <line
                x1={x}
                y1={height / 2 + 10}
                x2={x}
                y2={height / 2 + 20}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
              />
              <text
                x={x}
                y={height / 2 + 35}
                textAnchor="middle"
                className="fill-muted-foreground text-xs font-mono"
              >
                {pos}
              </text>
            </g>
          );
        })}
        
        {/* Cut sites */}
        {labelPositions.map(({ site, yOffset }, i) => {
          const x = scale(site.position);
          const isHighlighted = highlightSite === i;
          
          return (
            <g key={i}>
              {/* Cut line */}
              <motion.line
                x1={x}
                y1={height / 2 - 30}
                x2={x}
                y2={height / 2 + 4}
                stroke={isHighlighted ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                strokeWidth={isHighlighted ? 3 : 2}
                strokeDasharray={isHighlighted ? undefined : '4 2'}
                initial={{ opacity: 0, y1: height / 2 }}
                animate={{ opacity: 1, y1: height / 2 - 30 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              />
              
              {/* Enzyme label */}
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.2, duration: 0.3 }}
              >
                <rect
                  x={x - 25}
                  y={height / 2 - 55 - yOffset}
                  width={50}
                  height={20}
                  rx={4}
                  fill={isHighlighted ? 'hsl(var(--primary))' : 'hsl(var(--accent))'}
                  opacity={0.2}
                />
                <text
                  x={x}
                  y={height / 2 - 41 - yOffset}
                  textAnchor="middle"
                  className={`text-xs font-bold ${isHighlighted ? 'fill-primary' : 'fill-accent'}`}
                >
                  {site.enzyme}
                </text>
              </motion.g>
              
              {/* Recognition sequence */}
              <text
                x={x}
                y={height / 2 - 65 - yOffset}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px] font-mono"
              >
                {site.recognition}
              </text>
            </g>
          );
        })}
        
        {/* Legend */}
        <text
          x={50}
          y={height - 10}
          className="fill-muted-foreground text-xs"
        >
          5'
        </text>
        <text
          x={width - 50}
          y={height - 10}
          textAnchor="end"
          className="fill-muted-foreground text-xs"
        >
          3' ({seqLength} bp)
        </text>
      </svg>
    </div>
  );
};

export default RestrictionMap;
