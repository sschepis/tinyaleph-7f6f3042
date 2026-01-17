import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SplitPrime } from '@/lib/quaternion-nonlocal/types';

interface PrimeSelectorProps {
  label: string;
  selectedPrime: number;
  onSelect: (prime: number) => void;
  primeData: SplitPrime | null;
  availablePrimes: number[];
  color: string;
}

export function PrimeSelector({
  label,
  selectedPrime,
  onSelect,
  primeData,
  availablePrimes,
  color
}: PrimeSelectorProps) {
  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4 space-y-3">
        <Select
          value={selectedPrime.toString()}
          onValueChange={(v) => onSelect(parseInt(v))}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availablePrimes.map(p => (
              <SelectItem key={p} value={p.toString()}>
                p = {p} (≡ 1 mod 12)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {primeData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2 text-xs"
          >
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-[10px]">
                Gaussian: {primeData.gaussian.a} + {primeData.gaussian.b.toFixed(1)}i
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                Eisenstein: {primeData.eisenstein.c} + {primeData.eisenstein.d}ω
              </Badge>
            </div>
            
            <div className="p-2 bg-muted/30 rounded text-[10px] font-mono">
              <div className="text-muted-foreground mb-1">Quaternion q_p:</div>
              <div>
                {primeData.quaternion.a.toFixed(2)} + 
                {primeData.quaternion.b.toFixed(2)}i + 
                {primeData.quaternion.c.toFixed(2)}j + 
                {primeData.quaternion.d.toFixed(2)}k
              </div>
            </div>
            
            <div className="text-muted-foreground">
              Bloch: ({primeData.blochVector.map(v => v.toFixed(2)).join(', ')})
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
