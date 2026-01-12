import React from 'react';
import { SEMITONE_NAMES } from '@/lib/jam-partner/types';

interface HarmonyHeatmapProps {
  matrix: number[][];
}

export const HarmonyHeatmap: React.FC<HarmonyHeatmapProps> = ({ matrix }) => {
  const maxVal = Math.max(...matrix.flat(), 0.01);

  return (
    <div className="space-y-2">
      <div className="text-xs text-muted-foreground text-center">Input → Output Harmony</div>
      <div className="grid gap-0.5" style={{ gridTemplateColumns: `auto repeat(12, 1fr)` }}>
        <div />
        {SEMITONE_NAMES.map(name => (
          <div key={name} className="text-[10px] text-center text-muted-foreground">{name}</div>
        ))}
        {matrix.map((row, i) => (
          <React.Fragment key={i}>
            <div className="text-[10px] text-muted-foreground pr-1">{SEMITONE_NAMES[i]}</div>
            {row.map((val, j) => {
              const intensity = val / maxVal;
              return (
                <div
                  key={j}
                  className="aspect-square rounded-sm"
                  style={{
                    backgroundColor: `hsl(45, ${intensity * 100}%, ${20 + intensity * 40}%)`,
                  }}
                  title={`${SEMITONE_NAMES[i]}→${SEMITONE_NAMES[j]}: ${val.toFixed(2)}`}
                />
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
