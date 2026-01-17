import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bit } from '@/lib/bb84/types';
import { Key, Check, X } from 'lucide-react';

interface KeyComparisonProps {
  aliceKey: Bit[];
  bobKey: Bit[];
  aliceKeyHex: string;
  bobKeyHex: string;
  matchPercentage: number;
}

export function KeyComparison({
  aliceKey,
  bobKey,
  aliceKeyHex,
  bobKeyHex,
  matchPercentage
}: KeyComparisonProps) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          Sifted Keys
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Alice's Key */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-400 font-medium w-12">Alice:</span>
            <div className="flex-1 font-mono text-xs bg-blue-500/10 rounded px-2 py-1 overflow-x-auto">
              {aliceKey.length > 0 ? (
                <div className="flex gap-0.5">
                  {aliceKey.map((bit, i) => (
                    <span 
                      key={i} 
                      className={`w-4 text-center ${bit !== bobKey[i] ? 'text-red-400' : 'text-blue-300'}`}
                    >
                      {bit}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground ml-14">
            Hex: {aliceKeyHex || '—'}
          </div>
        </div>
        
        {/* Bob's Key */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-green-400 font-medium w-12">Bob:</span>
            <div className="flex-1 font-mono text-xs bg-green-500/10 rounded px-2 py-1 overflow-x-auto">
              {bobKey.length > 0 ? (
                <div className="flex gap-0.5">
                  {bobKey.map((bit, i) => (
                    <span 
                      key={i} 
                      className={`w-4 text-center ${bit !== aliceKey[i] ? 'text-red-400' : 'text-green-300'}`}
                    >
                      {bit}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
          </div>
          <div className="text-[10px] text-muted-foreground ml-14">
            Hex: {bobKeyHex || '—'}
          </div>
        </div>
        
        {/* Match indicator */}
        <div className={`flex items-center justify-between p-2 rounded text-xs ${
          matchPercentage === 100 
            ? 'bg-green-500/20 text-green-300' 
            : matchPercentage > 0 
              ? 'bg-yellow-500/20 text-yellow-300'
              : 'bg-muted/30 text-muted-foreground'
        }`}>
          <span>Key Agreement:</span>
          <span className="flex items-center gap-1 font-medium">
            {matchPercentage.toFixed(1)}%
            {matchPercentage === 100 ? (
              <Check className="w-3 h-3" />
            ) : matchPercentage > 0 ? (
              <X className="w-3 h-3" />
            ) : null}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
