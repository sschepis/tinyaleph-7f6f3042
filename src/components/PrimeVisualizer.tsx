import { useEffect, useState } from 'react';

const PrimeVisualizer = () => {
  const [highlightedPrimes, setHighlightedPrimes] = useState<number[]>([]);
  const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

  useEffect(() => {
    // Animate through different prime combinations
    let index = 0;
    const combinations = [
      [2, 3, 5],      // love
      [7, 11, 13],    // truth
      [2, 7, 17],     // wisdom
      [3, 5, 11, 19], // knowledge
    ];

    const interval = setInterval(() => {
      setHighlightedPrimes(combinations[index % combinations.length]);
      index++;
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {primes.map(prime => {
        const isHighlighted = highlightedPrimes.includes(prime);
        
        return (
          <div
            key={prime}
            className={`
              w-10 h-10 rounded-lg flex items-center justify-center font-mono text-sm font-medium
              transition-all duration-300 border
              ${isHighlighted 
                ? 'bg-primary/20 border-primary text-primary glow-box' 
                : 'bg-muted border-border text-muted-foreground'
              }
            `}
            style={{
              transform: isHighlighted ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            {prime}
          </div>
        );
      })}
    </div>
  );
};

export default PrimeVisualizer;
