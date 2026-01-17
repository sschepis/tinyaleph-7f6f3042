import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PhaseData } from '@/lib/quaternion-nonlocal/types';

interface PhaseSyncMeterProps {
  phaseData: PhaseData | null;
  epsilon: number;
  syncEvents: number[];
}

export function PhaseSyncMeter({ phaseData, epsilon, syncEvents }: PhaseSyncMeterProps) {
  if (!phaseData) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardContent className="py-8 text-center text-muted-foreground text-sm">
          No phase data available
        </CardContent>
      </Card>
    );
  }
  
  const normalizedDiff = Math.abs(phaseData.difference) / Math.PI;
  const lockProgress = Math.max(0, 1 - Math.abs(phaseData.difference) / epsilon);
  
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm">Phase Synchronization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Phase dial */}
        <div className="relative h-40 flex justify-center">
          <svg width={160} height={160} className="overflow-visible">
            {/* Background arc */}
            <circle
              cx={80}
              cy={80}
              r={60}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${Math.PI * 60} ${Math.PI * 60}`}
              transform="rotate(-90 80 80)"
            />
            
            {/* Lock zone indicator */}
            <circle
              cx={80}
              cy={80}
              r={60}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={8}
              strokeLinecap="round"
              strokeDasharray={`${(epsilon / Math.PI) * Math.PI * 60} ${Math.PI * 120}`}
              strokeOpacity={0.3}
              transform="rotate(-90 80 80)"
            />
            
            {/* Alice phase indicator */}
            <motion.line
              x1={80}
              y1={80}
              x2={80 + 50 * Math.cos(phaseData.alicePhase - Math.PI / 2)}
              y2={80 + 50 * Math.sin(phaseData.alicePhase - Math.PI / 2)}
              stroke="hsl(142 76% 36%)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            
            {/* Bob phase indicator */}
            <motion.line
              x1={80}
              y1={80}
              x2={80 + 50 * Math.cos(phaseData.bobPhase - Math.PI / 2)}
              y2={80 + 50 * Math.sin(phaseData.bobPhase - Math.PI / 2)}
              stroke="hsl(221 83% 53%)"
              strokeWidth={3}
              strokeLinecap="round"
            />
            
            {/* Center */}
            <circle cx={80} cy={80} r={8} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth={2} />
            
            {/* Lock indicator */}
            {phaseData.isLocked && (
              <motion.circle
                cx={80}
                cy={80}
                r={70}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.1, opacity: [0, 0.8, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </svg>
          
          {/* Labels */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
            0
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">
            π
          </div>
        </div>
        
        {/* Phase values */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-green-500/10 rounded border border-green-500/20">
            <div className="text-green-400">Alice φ</div>
            <div className="font-mono">{phaseData.alicePhase.toFixed(3)} rad</div>
          </div>
          <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
            <div className="text-blue-400">Bob φ</div>
            <div className="font-mono">{phaseData.bobPhase.toFixed(3)} rad</div>
          </div>
        </div>
        
        {/* Lock progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Lock Progress</span>
            <span className={phaseData.isLocked ? 'text-primary' : 'text-muted-foreground'}>
              {(lockProgress * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full"
              animate={{ width: `${lockProgress * 100}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
          <div className="text-[10px] text-muted-foreground">
            ε threshold: {epsilon.toFixed(2)} rad
          </div>
        </div>
        
        {/* Sync event counter */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Sync Events</span>
          <span className="font-mono text-primary">{syncEvents.length}</span>
        </div>
      </CardContent>
    </Card>
  );
}
