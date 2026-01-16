import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface OperatorButtonsProps {
  onApply: (operator: 'P' | 'R' | 'C' | 'H', param?: number) => void;
  disabled?: boolean;
}

const operators = [
  {
    id: 'P' as const,
    symbol: 'P̂',
    name: 'Prime Eigenvalue',
    description: 'P̂|p⟩ = p|p⟩ — Extracts prime value as eigenvalue',
    color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30'
  },
  {
    id: 'R' as const,
    symbol: 'R̂',
    name: 'Phase Rotation',
    description: 'e^(2πi log_p(n)) — Rotates phase logarithmically',
    color: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border-purple-500/30'
  },
  {
    id: 'C' as const,
    symbol: 'Ĉ',
    name: 'Coupling',
    description: 'Creates phase interference between primes via modular coupling',
    color: 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/30'
  },
  {
    id: 'H' as const,
    symbol: 'Ĥ',
    name: 'Hadamard-like',
    description: 'Creates superposition, spreads amplitude across basis states',
    color: 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border-emerald-500/30'
  }
];

export function OperatorButtons({ onApply, disabled }: OperatorButtonsProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {operators.map(op => (
          <Tooltip key={op.id}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`${op.color} border font-mono text-base px-3`}
                onClick={() => onApply(op.id)}
                disabled={disabled}
              >
                {op.symbol}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[200px]">
              <p className="font-semibold">{op.name}</p>
              <p className="text-xs text-muted-foreground">{op.description}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}

interface StateDisplayProps {
  primes: number[];
  dominant: number[];
  entropy: number;
  collapsed: boolean;
}

export function StateDisplay({ primes, dominant, entropy, collapsed }: StateDisplayProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">|ψ⟩ =</span>
        {dominant.slice(0, 3).map((p, i) => (
          <Badge key={p} variant="outline" className="font-mono text-xs">
            {i > 0 && <span className="mr-1 text-muted-foreground">+</span>}
            α|{p}⟩
          </Badge>
        ))}
        {primes.length > 3 && (
          <span className="text-xs text-muted-foreground">+ {primes.length - 3} more</span>
        )}
      </div>
      
      <div className="flex items-center gap-3 text-xs">
        <span className="text-muted-foreground">
          dim(ℋ) = <span className="text-foreground font-mono">{primes.length}</span>
        </span>
        <span className="text-muted-foreground">
          S = <span className="text-foreground font-mono">{entropy.toFixed(2)}</span> bits
        </span>
        {collapsed && (
          <Badge variant="destructive" className="text-[10px]">COLLAPSED</Badge>
        )}
      </div>
    </div>
  );
}
