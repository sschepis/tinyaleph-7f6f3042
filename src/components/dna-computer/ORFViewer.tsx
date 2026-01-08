import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { NUCLEOTIDE_COLORS, PROPERTY_COLORS, GENETIC_CODE } from '@/lib/dna-computer/types';

interface ORF {
  start: number;
  end: number;
  frame: number;
  protein: string;
}

interface ORFViewerProps {
  sequence: string;
  orfs: ORF[];
  selectedOrf?: number;
  onSelectOrf?: (index: number) => void;
}

const ORFViewer = ({ sequence, orfs, selectedOrf, onSelectOrf }: ORFViewerProps) => {
  const width = 600;
  const height = 200;
  const seqLength = sequence.length;
  
  const scale = (pos: number) => (pos / seqLength) * (width - 100) + 50;
  
  const frameColors = ['hsl(var(--primary))', 'hsl(150 70% 50%)', 'hsl(280 70% 50%)'];
  
  return (
    <div className="bg-muted/30 rounded-lg p-4 overflow-x-auto">
      <svg width={width} height={height} className="overflow-visible">
        {/* Frame labels */}
        {[0, 1, 2].map(frame => (
          <text
            key={frame}
            x={25}
            y={50 + frame * 35}
            className="fill-muted-foreground text-xs font-mono"
          >
            +{frame + 1}
          </text>
        ))}
        
        {/* Reading frame lines */}
        {[0, 1, 2].map(frame => (
          <line
            key={frame}
            x1={50}
            y1={50 + frame * 35}
            x2={width - 50}
            y2={50 + frame * 35}
            stroke="hsl(var(--border))"
            strokeWidth={2}
            opacity={0.3}
          />
        ))}
        
        {/* ORFs */}
        {orfs.map((orf, i) => {
          const x1 = scale(orf.start);
          const x2 = scale(orf.end);
          const y = 50 + orf.frame * 35;
          const isSelected = selectedOrf === i;
          
          return (
            <motion.g
              key={i}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectOrf?.(i)}
            >
              {/* ORF bar */}
              <rect
                x={x1}
                y={y - 10}
                width={x2 - x1}
                height={20}
                rx={4}
                fill={frameColors[orf.frame]}
                opacity={isSelected ? 0.9 : 0.6}
                stroke={isSelected ? 'hsl(var(--foreground))' : 'none'}
                strokeWidth={2}
              />
              
              {/* Start codon marker (arrow) */}
              <polygon
                points={`${x1},${y - 10} ${x1 + 8},${y} ${x1},${y + 10}`}
                fill={PROPERTY_COLORS.start}
              />
              
              {/* Stop codon marker */}
              <rect
                x={x2 - 6}
                y={y - 8}
                width={6}
                height={16}
                fill={PROPERTY_COLORS.stop}
              />
              
              {/* Length label */}
              {x2 - x1 > 50 && (
                <text
                  x={(x1 + x2) / 2}
                  y={y + 3}
                  textAnchor="middle"
                  className="fill-white text-xs font-bold"
                  style={{ pointerEvents: 'none' }}
                >
                  {orf.protein.length} aa
                </text>
              )}
            </motion.g>
          );
        })}
        
        {/* Scale bar */}
        <line
          x1={50}
          y1={height - 20}
          x2={width - 50}
          y2={height - 20}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
        
        {/* Position labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((frac, i) => {
          const pos = Math.floor(frac * seqLength);
          const x = scale(pos);
          return (
            <g key={i}>
              <line
                x1={x}
                y1={height - 25}
                x2={x}
                y2={height - 20}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
              />
              <text
                x={x}
                y={height - 5}
                textAnchor="middle"
                className="fill-muted-foreground text-xs font-mono"
              >
                {pos}
              </text>
            </g>
          );
        })}
        
        {/* Legend */}
        <g transform="translate(50, 8)">
          <rect x={0} y={0} width={12} height={12} rx={2} fill={PROPERTY_COLORS.start} />
          <text x={18} y={10} className="fill-muted-foreground text-xs">Start (ATG)</text>
          
          <rect x={80} y={0} width={12} height={12} rx={2} fill={PROPERTY_COLORS.stop} />
          <text x={98} y={10} className="fill-muted-foreground text-xs">Stop</text>
          
          {frameColors.map((color, i) => (
            <g key={i} transform={`translate(${170 + i * 50}, 0)`}>
              <rect x={0} y={0} width={12} height={12} rx={2} fill={color} opacity={0.7} />
              <text x={18} y={10} className="fill-muted-foreground text-xs">+{i + 1}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default ORFViewer;
