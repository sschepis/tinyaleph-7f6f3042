import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { GalacticRegion } from '@/lib/cosmic-holographic/types';
import { Globe } from 'lucide-react';

interface RegionStatsPanelProps {
  regions: GalacticRegion[];
}

const regionColors: Record<string, string> = {
  core: 'bg-yellow-500',
  inner: 'bg-blue-500',
  solar: 'bg-green-500',
  outer: 'bg-purple-500'
};

export function RegionStatsPanel({ regions }: RegionStatsPanelProps) {
  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="w-4 h-4" /> Galactic Regions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {regions.map((region) => {
          const usagePercent = region.totalCapacity > 0 
            ? (region.usedCapacity / region.totalCapacity) * 100 
            : 0;
          
          return (
            <div key={region.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${regionColors[region.id] || 'bg-muted'}`} />
                  {region.name}
                </span>
                <span className="text-muted-foreground">
                  {region.nodeCount} nodes
                </span>
              </div>
              <Progress value={usagePercent} className="h-1.5" />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{region.usedCapacity} / {region.totalCapacity} units</span>
                <span>r={region.radius} kpc</span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
