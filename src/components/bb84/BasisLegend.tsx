import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export function BasisLegend() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="py-2">
        <CardTitle className="text-xs flex items-center gap-2">
          <Info className="w-3 h-3 text-primary" />
          Polarization Bases
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          {/* Rectilinear basis */}
          <div className="bg-muted/30 rounded p-2">
            <div className="font-medium text-primary mb-1">Rectilinear (+)</div>
            <div className="flex gap-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-current" />
                <span>0 = H</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-0.5 h-4 bg-current" />
                <span>1 = V</span>
              </div>
            </div>
          </div>
          
          {/* Diagonal basis */}
          <div className="bg-muted/30 rounded p-2">
            <div className="font-medium text-primary mb-1">Diagonal (×)</div>
            <div className="flex gap-3 text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-current rotate-45" />
                <span>0 = ↗</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-0.5 bg-current -rotate-45" />
                <span>1 = ↘</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-[10px] text-muted-foreground p-2 bg-muted/20 rounded">
          <strong>Key insight:</strong> Measuring in the wrong basis gives random results.
          Eve can't intercept without disturbing the quantum state!
        </div>
      </CardContent>
    </Card>
  );
}
