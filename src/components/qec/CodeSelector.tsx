import { CodeType, CODE_INFO } from '@/lib/qec';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface CodeSelectorProps {
  selectedCode: CodeType;
  onSelect: (code: CodeType) => void;
  disabled?: boolean;
}

export function CodeSelector({ selectedCode, onSelect, disabled }: CodeSelectorProps) {
  const info = CODE_INFO[selectedCode];
  
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          Error Correction Code
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedCode} onValueChange={(v) => onSelect(v as CodeType)} disabled={disabled}>
          <SelectTrigger className="bg-background/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.values(CODE_INFO).map(code => (
              <SelectItem key={code.type} value={code.type}>
                {code.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {info.numPhysical} physical
            </Badge>
            <Badge variant="outline" className="text-xs">
              {info.numLogical} logical
            </Badge>
            <Badge variant="outline" className="text-xs">
              d = {info.distance}
            </Badge>
          </div>
          
          <p className="text-muted-foreground text-xs leading-relaxed">
            {info.description}
          </p>
          
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Corrects:</span>
            <Badge className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
              {info.correctable}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
