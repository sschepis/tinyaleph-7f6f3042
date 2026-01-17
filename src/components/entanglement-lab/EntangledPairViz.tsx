import { motion } from 'framer-motion';
import { BellState, BELL_STATE_INFO } from '@/lib/entanglement-lab';
import { QubitVisualizer } from './QubitVisualizer';

interface EntangledPairVizProps {
  bellState: BellState;
  aliceAngle: number;
  bobAngle: number;
  aliceResult?: 0 | 1 | null;
  bobResult?: 0 | 1 | null;
  onAliceAngleChange: (angle: number) => void;
  onBobAngleChange: (angle: number) => void;
}

export function EntangledPairViz({
  bellState,
  aliceAngle,
  bobAngle,
  aliceResult,
  bobResult,
  onAliceAngleChange,
  onBobAngleChange
}: EntangledPairVizProps) {
  // Entanglement line animation
  const isEntangled = aliceResult === null || aliceResult === undefined;
  
  return (
    <div className="relative p-6 bg-gradient-to-b from-primary/5 to-transparent rounded-xl border border-primary/20">
      {/* Title */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
        <div className="text-lg font-mono text-primary">|{bellState}⟩</div>
        <div className="text-xs text-muted-foreground">{BELL_STATE_INFO[bellState].name}</div>
      </div>
      
      <div className="flex items-center justify-around pt-8">
        {/* Alice */}
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold mb-2 text-blue-400">Alice</div>
          <QubitVisualizer
            angle={aliceAngle}
            label="Qubit A"
            color="hsl(210, 100%, 60%)"
            result={aliceResult}
            onAngleChange={onAliceAngleChange}
          />
        </div>
        
        {/* Entanglement visualization */}
        <div className="flex-1 flex items-center justify-center px-4">
          <svg width="100%" height="60" className="overflow-visible">
            {/* Entanglement wave pattern */}
            <motion.path
              d="M 0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30"
              fill="none"
              stroke="url(#entanglementGradient)"
              strokeWidth={2}
              strokeDasharray={isEntangled ? "0" : "4 4"}
              initial={false}
              animate={{
                opacity: isEntangled ? [0.3, 0.8, 0.3] : 0.2,
                strokeWidth: isEntangled ? [2, 3, 2] : 1
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Gradient definition */}
            <defs>
              <linearGradient id="entanglementGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(210, 100%, 60%)" />
                <stop offset="50%" stopColor="hsl(280, 100%, 70%)" />
                <stop offset="100%" stopColor="hsl(0, 100%, 60%)" />
              </linearGradient>
            </defs>
            
            {/* Entanglement symbol */}
            <motion.text
              x="50%"
              y="30"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={16}
              fill="currentColor"
              opacity={isEntangled ? 1 : 0.3}
              animate={isEntangled ? { 
                scale: [1, 1.1, 1],
                opacity: [0.6, 1, 0.6]
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⟨⊗⟩
            </motion.text>
          </svg>
        </div>
        
        {/* Bob */}
        <div className="flex flex-col items-center">
          <div className="text-sm font-semibold mb-2 text-red-400">Bob</div>
          <QubitVisualizer
            angle={bobAngle}
            label="Qubit B"
            color="hsl(0, 100%, 60%)"
            result={bobResult}
            onAngleChange={onBobAngleChange}
          />
        </div>
      </div>
      
      {/* Correlation indicator */}
      {aliceResult !== null && aliceResult !== undefined && bobResult !== null && bobResult !== undefined && (
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-sm text-muted-foreground">Outcome: </span>
          <span className="font-mono text-lg">
            |{aliceResult}{bobResult}⟩
          </span>
          <span className={`ml-3 text-sm font-medium ${
            aliceResult === bobResult ? 'text-green-400' : 'text-yellow-400'
          }`}>
            {aliceResult === bobResult ? 'Correlated' : 'Anti-correlated'}
          </span>
        </motion.div>
      )}
    </div>
  );
}
