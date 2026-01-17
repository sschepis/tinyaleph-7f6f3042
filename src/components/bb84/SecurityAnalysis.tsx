import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { SECURITY_THRESHOLD } from '@/lib/bb84/types';
import { Shield, ShieldAlert, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface SecurityAnalysisProps {
  errorRate: number;
  theoreticalError: number;
  evePresent: boolean;
  eveInterceptionRate: number;
  secureKeyEstablished: boolean;
  interceptedCount: number;
  totalPhotons: number;
}

export function SecurityAnalysis({
  errorRate,
  theoreticalError,
  evePresent,
  eveInterceptionRate,
  secureKeyEstablished,
  interceptedCount,
  totalPhotons
}: SecurityAnalysisProps) {
  const thresholdPercent = SECURITY_THRESHOLD * 100;
  const errorPercent = errorRate * 100;
  const isSecure = errorRate < SECURITY_THRESHOLD;
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Security Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Rate Meter */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Measured Error Rate</span>
            <span className={errorPercent > thresholdPercent ? 'text-red-400' : 'text-green-400'}>
              {errorPercent.toFixed(1)}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={Math.min(errorPercent / (thresholdPercent * 2), 100) * 100} 
              className="h-3"
            />
            {/* Threshold marker */}
            <div 
              className="absolute top-0 bottom-0 w-0.5 bg-yellow-400"
              style={{ left: `${50}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span className="text-yellow-400">Threshold: {thresholdPercent}%</span>
            <span>{thresholdPercent * 2}%</span>
          </div>
        </div>
        
        {/* Theoretical vs Measured */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/30 rounded p-2">
            <div className="text-muted-foreground">Theoretical</div>
            <div className="font-medium">{(theoreticalError * 100).toFixed(1)}%</div>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <div className="text-muted-foreground">Measured</div>
            <div className="font-medium">{errorPercent.toFixed(1)}%</div>
          </div>
        </div>
        
        {/* Eve Detection */}
        <div className={`flex items-center gap-2 p-2 rounded text-xs ${
          evePresent ? 'bg-red-500/20' : 'bg-muted/30'
        }`}>
          {evePresent ? (
            <>
              <Eye className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-red-300 font-medium">Eve Present</div>
                <div className="text-muted-foreground">
                  {interceptedCount}/{totalPhotons} intercepted ({(eveInterceptionRate * 100).toFixed(0)}%)
                </div>
              </div>
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">No eavesdropper</span>
            </>
          )}
        </div>
        
        {/* Security Verdict */}
        <div className={`flex items-center gap-2 p-3 rounded ${
          secureKeyEstablished 
            ? 'bg-green-500/20 border border-green-500/40' 
            : errorRate > 0 
              ? 'bg-red-500/20 border border-red-500/40'
              : 'bg-muted/30 border border-muted/40'
        }`}>
          {secureKeyEstablished ? (
            <>
              <ShieldCheck className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-green-300 font-medium text-sm">Key Secure</div>
                <div className="text-xs text-muted-foreground">
                  Error rate below threshold
                </div>
              </div>
            </>
          ) : errorRate > 0 ? (
            <>
              <ShieldAlert className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-red-300 font-medium text-sm">Key Compromised!</div>
                <div className="text-xs text-muted-foreground">
                  Eavesdropping detected - abort key
                </div>
              </div>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                Run protocol to analyze security
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
