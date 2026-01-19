import { useMemo, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Activity, Clock, Waves, Zap, AlertTriangle, TrendingDown, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { HolographicRecord, PulsarReference, ReconstructedPattern } from '@/lib/cosmic-holographic/types';
import { reconstructFromRecord } from '@/lib/cosmic-holographic/engine';
import { toast } from 'sonner';

interface ReconstructionFidelityPanelProps {
  holographicRecords: HolographicRecord[];
  pulsars: PulsarReference[];
  simulationTime: number;
  isRunning: boolean;
  onRefreshEncoding?: (recordId: string) => Promise<HolographicRecord | null>;
  onRefreshAllCritical?: (threshold?: number) => Promise<void>;
}

interface RecordFidelity {
  record: HolographicRecord;
  reconstruction: ReconstructedPattern;
  timeSinceStorage: number;
  phaseDriftRate: number;
  // Forecasting
  timeToWarning: number | null; // Time until fidelity < 0.8
  timeToCritical: number | null; // Time until fidelity < 0.5
  timeToLoss: number | null; // Time until fidelity < 0.2
}

// Critical thresholds
const THRESHOLD_WARNING = 0.8;
const THRESHOLD_CRITICAL = 0.5;
const THRESHOLD_LOSS = 0.2;

// Estimate time to reach threshold based on current drift
function estimateTimeToThreshold(
  currentFidelity: number,
  driftRate: number,
  threshold: number
): number | null {
  if (driftRate <= 0 || currentFidelity <= threshold) return null;
  
  // Simple linear model: fidelity decreases proportionally to phase error
  const fidelityLossRate = driftRate * 0.1;
  if (fidelityLossRate <= 0) return null;
  
  const fidelityToLose = currentFidelity - threshold;
  const estimatedTime = fidelityToLose / fidelityLossRate;
  
  return estimatedTime > 0 ? estimatedTime : null;
}

// Alert tone generator using Web Audio API
function playAlertTone(type: 'warning' | 'critical' | 'loss') {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different tones for different alert levels
    switch (type) {
      case 'warning':
        oscillator.frequency.value = 440; // A4
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        break;
      case 'critical':
        oscillator.frequency.value = 880; // A5
        oscillator.type = 'triangle';
        gainNode.gain.value = 0.15;
        break;
      case 'loss':
        oscillator.frequency.value = 220; // A3
        oscillator.type = 'sawtooth';
        gainNode.gain.value = 0.2;
        break;
    }
    
    // Envelope
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(gainNode.gain.value, now + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
    
    oscillator.start(now);
    oscillator.stop(now + 0.3);
    
    // Cleanup
    setTimeout(() => audioContext.close(), 500);
  } catch (e) {
    console.warn('Audio alert failed:', e);
  }
}

export function ReconstructionFidelityPanel({
  holographicRecords,
  pulsars,
  simulationTime,
  isRunning,
  onRefreshEncoding,
  onRefreshAllCritical
}: ReconstructionFidelityPanelProps) {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState(false);
  
  // Track previous alert states to avoid repeat alerts
  const prevAlertStatesRef = useRef<Map<string, 'ok' | 'warning' | 'critical' | 'loss'>>(new Map());
  const flashRef = useRef<HTMLDivElement>(null);
  
  // Calculate real-time fidelity for all records with forecasting
  const fidelityData = useMemo(() => {
    if (holographicRecords.length === 0 || pulsars.length === 0) return [];
    
    return holographicRecords.map(record => {
      const reconstruction = reconstructFromRecord(record, pulsars, simulationTime);
      const timeSinceStorage = simulationTime - record.simulationTime;
      const phaseDriftRate = timeSinceStorage > 0 
        ? reconstruction.phaseError / timeSinceStorage 
        : 0;
      
      const currentFidelity = reconstruction.fidelity;
      const timeToWarning = estimateTimeToThreshold(currentFidelity, phaseDriftRate, THRESHOLD_WARNING);
      const timeToCritical = estimateTimeToThreshold(currentFidelity, phaseDriftRate, THRESHOLD_CRITICAL);
      const timeToLoss = estimateTimeToThreshold(currentFidelity, phaseDriftRate, THRESHOLD_LOSS);
      
      return {
        record,
        reconstruction,
        timeSinceStorage,
        phaseDriftRate,
        timeToWarning,
        timeToCritical,
        timeToLoss
      } as RecordFidelity;
    }).sort((a, b) => b.timeSinceStorage - a.timeSinceStorage);
  }, [holographicRecords, pulsars, simulationTime]);

  // Alert system for threshold crossings
  useEffect(() => {
    if (!isRunning || fidelityData.length === 0) return;
    
    for (const data of fidelityData) {
      const { record, reconstruction } = data;
      const fidelity = reconstruction.fidelity;
      const prevState = prevAlertStatesRef.current.get(record.id) || 'ok';
      
      let newState: 'ok' | 'warning' | 'critical' | 'loss' = 'ok';
      if (fidelity < THRESHOLD_LOSS) newState = 'loss';
      else if (fidelity < THRESHOLD_CRITICAL) newState = 'critical';
      else if (fidelity < THRESHOLD_WARNING) newState = 'warning';
      
      // Only alert on threshold crossing (state transition)
      if (newState !== prevState && newState !== 'ok') {
        // Visual flash
        if (flashRef.current) {
          flashRef.current.classList.remove('animate-pulse');
          void flashRef.current.offsetWidth; // Trigger reflow
          flashRef.current.classList.add('animate-pulse');
        }
        
        // Toast notification
        const hashSlice = record.contentHash.slice(0, 8);
        switch (newState) {
          case 'warning':
            toast.warning(`Pattern #${hashSlice} below 80% fidelity`, {
              description: 'Consider refreshing encoding',
              duration: 3000
            });
            if (audioEnabled) playAlertTone('warning');
            break;
          case 'critical':
            toast.error(`Pattern #${hashSlice} critical - below 50%`, {
              description: 'Refresh encoding to prevent data loss',
              duration: 5000
            });
            if (audioEnabled) playAlertTone('critical');
            break;
          case 'loss':
            toast.error(`ALERT: Pattern #${hashSlice} near data loss!`, {
              description: 'Fidelity below 20% - immediate action required',
              duration: 8000
            });
            if (audioEnabled) playAlertTone('loss');
            break;
        }
      }
      
      prevAlertStatesRef.current.set(record.id, newState);
    }
  }, [fidelityData, isRunning, audioEnabled]);

  // Aggregate metrics
  const aggregateMetrics = useMemo(() => {
    if (fidelityData.length === 0) {
      return {
        avgFidelity: 0,
        avgPhaseError: 0,
        avgDriftRate: 0,
        minFidelity: 0,
        criticalCount: 0,
        warningCount: 0,
        lossCount: 0,
        nearestCritical: null as number | null,
        nearestLoss: null as number | null
      };
    }
    
    const fidelities = fidelityData.map(d => d.reconstruction.fidelity);
    const phaseErrors = fidelityData.map(d => d.reconstruction.phaseError);
    const driftRates = fidelityData.map(d => d.phaseDriftRate);
    
    const criticalTimes = fidelityData
      .map(d => d.timeToCritical)
      .filter((t): t is number => t !== null);
    const lossTimes = fidelityData
      .map(d => d.timeToLoss)
      .filter((t): t is number => t !== null);
    
    return {
      avgFidelity: fidelities.reduce((s, v) => s + v, 0) / fidelities.length,
      avgPhaseError: phaseErrors.reduce((s, v) => s + v, 0) / phaseErrors.length,
      avgDriftRate: driftRates.reduce((s, v) => s + v, 0) / driftRates.length,
      minFidelity: Math.min(...fidelities),
      criticalCount: fidelities.filter(f => f < THRESHOLD_CRITICAL && f >= THRESHOLD_LOSS).length,
      warningCount: fidelities.filter(f => f < THRESHOLD_WARNING && f >= THRESHOLD_CRITICAL).length,
      lossCount: fidelities.filter(f => f < THRESHOLD_LOSS).length,
      nearestCritical: criticalTimes.length > 0 ? Math.min(...criticalTimes) : null,
      nearestLoss: lossTimes.length > 0 ? Math.min(...lossTimes) : null
    };
  }, [fidelityData]);

  const getFidelityColor = (fidelity: number) => {
    if (fidelity >= THRESHOLD_WARNING) return 'text-green-500';
    if (fidelity >= THRESHOLD_CRITICAL) return 'text-yellow-500';
    if (fidelity >= THRESHOLD_LOSS) return 'text-orange-500';
    return 'text-red-500';
  };
  
  const getFidelityBgClass = (fidelity: number) => {
    if (fidelity >= THRESHOLD_WARNING) return '';
    if (fidelity >= THRESHOLD_CRITICAL) return 'bg-yellow-500/10 border-yellow-500/30';
    if (fidelity >= THRESHOLD_LOSS) return 'bg-orange-500/10 border-orange-500/30 animate-pulse';
    return 'bg-red-500/20 border-red-500/50 animate-pulse';
  };

  const formatTimeEstimate = (time: number | null) => {
    if (time === null) return '—';
    if (time < 10) return `${time.toFixed(1)}t`;
    if (time < 100) return `${time.toFixed(0)}t`;
    return `${(time / 100).toFixed(1)}×10²t`;
  };

  const handleRefresh = async (recordId: string) => {
    if (!onRefreshEncoding) return;
    setRefreshingId(recordId);
    await onRefreshEncoding(recordId);
    setRefreshingId(null);
  };

  const handleRefreshAllCritical = async () => {
    if (!onRefreshAllCritical) return;
    setRefreshingAll(true);
    await onRefreshAllCritical(THRESHOLD_CRITICAL);
    setRefreshingAll(false);
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
    <Card className="relative overflow-hidden">
      {/* Visual alert flash overlay */}
      <div 
        ref={flashRef}
        className="absolute inset-0 pointer-events-none bg-red-500/0 transition-colors"
        style={{ animationDuration: '0.5s' }}
      />
      
      <CardHeader className="py-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4" /> Reconstruction Fidelity
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setAudioEnabled(!audioEnabled)}
              title={audioEnabled ? 'Mute alerts' : 'Enable audio alerts'}
            >
              {audioEnabled ? (
                <Volume2 className="w-3 h-3" />
              ) : (
                <VolumeX className="w-3 h-3 text-muted-foreground" />
              )}
            </Button>
            {isRunning && (
              <Badge variant="outline" className="text-[10px] animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
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

        {/* Phase Drift Forecast */}
        <div className="bg-secondary/20 p-2 rounded border border-border/50">
          <div className="flex items-center gap-1 text-muted-foreground text-[10px] mb-2">
            <TrendingDown className="w-3 h-3" /> Phase Drift Forecast
          </div>
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div className="text-center">
              <div className="text-muted-foreground">Warning</div>
              <div className="text-yellow-500 font-mono">
                {formatTimeEstimate(aggregateMetrics.nearestCritical)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Critical</div>
              <div className="text-orange-500 font-mono">
                {formatTimeEstimate(
                  fidelityData.find(d => d.timeToCritical !== null)?.timeToCritical ?? null
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-muted-foreground">Data Loss</div>
              <div className="text-red-500 font-mono">
                {formatTimeEstimate(aggregateMetrics.nearestLoss)}
              </div>
            </div>
          </div>
        </div>

        {/* Drift Rate & Warnings */}
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Drift:</span>
            <span>{aggregateMetrics.avgDriftRate.toFixed(4)} rad/t</span>
          </div>
          <div className="flex gap-1">
            {aggregateMetrics.warningCount > 0 && (
              <Badge variant="outline" className="text-[10px] text-yellow-500 border-yellow-500/50">
                {aggregateMetrics.warningCount} warn
              </Badge>
            )}
            {aggregateMetrics.criticalCount > 0 && (
              <Badge variant="outline" className="text-[10px] text-orange-500 border-orange-500/50">
                {aggregateMetrics.criticalCount} crit
              </Badge>
            )}
            {aggregateMetrics.lossCount > 0 && (
              <Badge variant="destructive" className="text-[10px]">
                <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                {aggregateMetrics.lossCount}
              </Badge>
            )}
          </div>
        </div>

        {/* Refresh All Critical Button */}
        {(aggregateMetrics.criticalCount > 0 || aggregateMetrics.lossCount > 0) && onRefreshAllCritical && (
          <Button
            size="sm"
            variant="destructive"
            className="w-full text-xs"
            onClick={handleRefreshAllCritical}
            disabled={refreshingAll}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${refreshingAll ? 'animate-spin' : ''}`} />
            {refreshingAll ? 'Refreshing...' : `Refresh ${aggregateMetrics.criticalCount + aggregateMetrics.lossCount} Critical Pattern(s)`}
          </Button>
        )}

        {/* Individual Records */}
        <div className="max-h-[180px] overflow-y-auto space-y-2">
          {fidelityData.slice(0, 6).map(({ record, reconstruction, timeSinceStorage, timeToCritical }) => (
            <div 
              key={record.id} 
              className={`bg-secondary/20 p-2 rounded border border-border/50 transition-colors ${getFidelityBgClass(reconstruction.fidelity)}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted-foreground font-mono">
                  #{record.contentHash.slice(0, 8)}
                </span>
                <div className="flex items-center gap-1">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] ${getFidelityColor(reconstruction.fidelity)}`}
                  >
                    {(reconstruction.fidelity * 100).toFixed(0)}%
                  </Badge>
                  {onRefreshEncoding && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => handleRefresh(record.id)}
                      disabled={refreshingId === record.id}
                      title="Refresh encoding"
                    >
                      <RefreshCw className={`w-3 h-3 ${refreshingId === record.id ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
              
              <Progress 
                value={reconstruction.fidelity * 100} 
                className="h-1.5 mb-1"
              />
              
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Δφ: {reconstruction.phaseError.toFixed(3)}</span>
                <span>t+{timeSinceStorage.toFixed(1)}</span>
                {timeToCritical !== null && (
                  <span className="text-yellow-500">
                    ⚠ {formatTimeEstimate(timeToCritical)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {fidelityData.length > 6 && (
          <p className="text-[10px] text-muted-foreground text-center">
            +{fidelityData.length - 6} more records
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Export fidelity calculation for use in visualization
export function calculateNodeFidelity(
  nodeId: string,
  holographicRecords: HolographicRecord[],
  pulsars: PulsarReference[],
  simulationTime: number
): number {
  const nodeRecords = holographicRecords.filter(r => r.pulsarIds.includes(nodeId));
  if (nodeRecords.length === 0 || pulsars.length === 0) return 1;
  
  const fidelities = nodeRecords.map(record => {
    const reconstruction = reconstructFromRecord(record, pulsars, simulationTime);
    return reconstruction.fidelity;
  });
  
  return fidelities.reduce((s, v) => s + v, 0) / fidelities.length;
}
