import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Database } from 'lucide-react';

interface StoreMemoryPanelProps {
  onStore: (content: string, redundancy: number) => void;
  maxNodes: number;
}

export function StoreMemoryPanel({ onStore, maxNodes }: StoreMemoryPanelProps) {
  const [content, setContent] = useState('');
  const [redundancy, setRedundancy] = useState(3);

  const handleStore = () => {
    if (content.trim()) {
      onStore(content, redundancy);
      setContent('');
    }
  };

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Database className="w-4 h-4" /> Store Memory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input
          placeholder="Enter content to store..."
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleStore()}
        />
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-xs">Redundancy</Label>
            <span className="text-xs text-muted-foreground">
              {redundancy} node{redundancy !== 1 ? 's' : ''}
            </span>
          </div>
          <Slider
            value={[redundancy]}
            onValueChange={([v]) => setRedundancy(v)}
            min={1}
            max={Math.max(1, Math.min(maxNodes, 10))}
            step={1}
            className="w-full"
          />
          <p className="text-[10px] text-muted-foreground">
            Higher redundancy = more distributed storage, better fault tolerance
          </p>
        </div>
        
        <Button
          className="w-full"
          onClick={handleStore}
          disabled={!content.trim()}
        >
          Store Pattern
        </Button>
      </CardContent>
    </Card>
  );
}
