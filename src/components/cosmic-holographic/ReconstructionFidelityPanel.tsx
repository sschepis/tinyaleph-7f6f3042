import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Clock, Waves, Zap } from 'lucide-react';
import { HolographicRecord, PulsarReference, ReconstructedPattern } from '@/lib/cosmic-holographic/types';
import { reconstructFromRecord } from '@/lib/cosmic-holographic/engine';

interface ReconstructionFidelityPanelProps {
  holographicRecords: HolographicRecord[];
  pulsars: PulsarReference[];
  simulationTime: number;
  isRunning: boolean;
}

interface RecordFidelity {
  record: HolographicRecord;
  reconstruction: ReconstructedPattern;
  timeSinceStorage: number;
  phaseDriftRate: number;
}

export function ReconstructionFidelityPanel({
  holographicRecords,
  pulsars,
  simulationTime,
  isRunning
}: ReconstructionFidelityPanelProps) {
  // Calculate real-time fidelity for all records
  const fidelityData = useMemo(() => {
    if (holographicRecords.length === 0 || pulsars.length === 0) return [];
    
    return holographicRecords.map(record => {
      const reconstruction = reconstructFromRecord(record, pulsars, simulationTime);
      const timeSinceStorage = simulationTime - record.simulationTime;
      const phaseDriftRate = timeSinceStorage > 0 
        ? reconstruction.phaseError / timeSinceStorage 
        : 0;
      
      return {
        record,
        reconstruction,
        timeSinceStorage,
        phaseDriftRate
      } as RecordFidelity;
    }).sort((a, b) => b.timeSinceStorage - a.timeSinceStorage);
  }, [holographicRecords, pulsars, simulationTime]);

  // Calculate aggregate metrics
  const aggregateMetrics = useMemo(() => {
    if (fidelityData.length === 0) {
      return {
        avgFidelity: 0,
        avgPhaseError: 0,
        avgDriftRate: 0,
        minFidelity: 0,
        criticalCount: 0
      };
    }
    
    const fidelities = fidelityData.map(d => d.reconstruction.fidelity);
    const phaseErrors = fidelityData.map(d => d.reconstruction.phaseError);
    const driftRates = fidelityData.map(d => d.phaseDriftRate);
    
    return {
      avgFidelity: fidelities.reduce((s, v) => s + v, 0) / fidelities.length,
      avgPhaseError: phaseErrors.reduce((s, v) => s + v, 0) / phaseErrors.length,
      avgDriftRate: driftRates.reduce((s, v) => s + v, 0) / driftRates.length,
      minFidelity: Math.min(...fidelities),
      criticalCount: fidelities.filter(f => f < 0.5).length
    };
  }, [fidelityData]);

  const getFidelityColor = (fidelity: number) => {
    if (fidelity >= 0.8) return 'text-green-500';
    if (fidelity >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getFidelityBg = (fidelity: number) => {
    if (fidelity >= 0.8) return 'bg-green-500';
    if (fidelity >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (holographicRecords.length === 0) {
    return (
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" /> Reconstruction Fidelity
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground text-center py-3">
            No holographic records stored
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" /> Reconstruction Fidelity
          </CardTitle>
          {isRunning && (
            <Badge variant="outline" className="text-[10px] animate-pulse">
              LIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Aggregate Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-secondary/30 p-2 rounded">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Zap className="w-3 h-3" /> Avg Fidelity
            </div>
            <div className={`text-lg font-bold ${getFidelityColor(aggregateMetrics.avgFidelity)}`}>
              {(aggregateMetrics.avgFidelity * 100).toFixed(1)}%
            </div>
          </div>
          <div className="bg-secondary/30 p-2 rounded">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <Waves className="w-3 h-3" /> Phase Error
            </div>
            <div className="text-lg font-bold text-primary">
              {aggregateMetrics.avgPhaseError.toFixed(3)} rad
            </div>
          </div>
        </div>

        {/* Drift Rate & Critical Count */}
        <div className="flex justify-between text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Drift Rate:</span>
            <span>{aggregateMetrics.avgDriftRate.toFixed(4)} rad/t</span>
          </div>
          {aggregateMetrics.criticalCount > 0 && (
            <Badge variant="destructive" className="text-[10px]">
              {aggregateMetrics.criticalCount} critical
            </Badge>
          )}
        </div>

        {/* Individual Records */}
        <div className="max-h-[180px] overflow-y-auto space-y-2">
          {fidelityData.slice(0, 5).map(({ record, reconstruction, timeSinceStorage }) => (
            <div 
              key={record.id} 
              className="bg-secondary/20 p-2 rounded border border-border/50"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground font-mono">
                  #{record.contentHash.slice(0, 8)}
                </span>
                <Badge 
                  variant="outline" 
                  className={`text-[10px] ${getFidelityColor(reconstruction.fidelity)}`}
                >
                  {(reconstruction.fidelity * 100).toFixed(0)}%
                </Badge>
              </div>
              
              <Progress 
                value={reconstruction.fidelity * 100} 
                className="h-1.5 mb-1"
              />
              
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Δφ: {reconstruction.phaseError.toFixed(3)} rad</span>
                <span>t+{timeSinceStorage.toFixed(1)}</span>
              </div>
              
              {reconstruction.reconstructedContent && (
                <div className="mt-1 text-[10px] font-mono text-primary/70 truncate">
                  ≈ "{reconstruction.reconstructedContent}"
                </div>
              )}
            </div>
          ))}
        </div>

        {fidelityData.length > 5 && (
          <p className="text-[10px] text-muted-foreground text-center">
            +{fidelityData.length - 5} more records
          </p>
        )}
      </CardContent>
    </Card>
  );
}
