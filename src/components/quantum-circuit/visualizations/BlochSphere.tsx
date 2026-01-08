import { ComplexNumber } from '@/lib/quantum-circuit/types';

interface BlochSphereProps {
  state: ComplexNumber[];
}

export const BlochSphere = ({ state }: BlochSphereProps) => {
  const alpha = state[0] || { real: 1, imag: 0 };
  const beta = state[1] || { real: 0, imag: 0 };
  
  const alphaAbs = Math.sqrt(alpha.real * alpha.real + alpha.imag * alpha.imag);
  const betaAbs = Math.sqrt(beta.real * beta.real + beta.imag * beta.imag);
  
  const theta = 2 * Math.acos(Math.min(1, alphaAbs));
  const phi = Math.atan2(beta.imag, beta.real) - Math.atan2(alpha.imag, alpha.real);
  
  const x = Math.sin(theta) * Math.cos(phi);
  const z = Math.cos(theta);
  
  return (
    <div className="aspect-square bg-muted/30 rounded-lg border border-border p-4">
      <svg viewBox="-1.5 -1.5 3 3" className="w-full h-full">
        <circle cx="0" cy="0" r="1" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.02" />
        <ellipse cx="0" cy="0" rx="1" ry="0.3" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="0.015" />
        
        <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.01" />
        <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.01" />
        
        <text x="0" y="-1.1" textAnchor="middle" fontSize="0.12" fill="currentColor" opacity="0.5">|0⟩</text>
        <text x="0" y="1.18" textAnchor="middle" fontSize="0.12" fill="currentColor" opacity="0.5">|1⟩</text>
        <text x="1.1" y="0.04" textAnchor="start" fontSize="0.1" fill="currentColor" opacity="0.5">|+⟩</text>
        <text x="-1.1" y="0.04" textAnchor="end" fontSize="0.1" fill="currentColor" opacity="0.5">|-⟩</text>
        
        <line x1="0" y1="0" x2={x} y2={-z} stroke="hsl(var(--primary))" strokeWidth="0.03" />
        <circle cx={x} cy={-z} r="0.06" fill="hsl(var(--primary))" />
      </svg>
    </div>
  );
};
