export function ArchitectureFlow() {
  const layers = [
    { num: 1, name: 'Base Layer', desc: 'Perspective Nodes', sub: 'Input Processing', color: 'border-blue-500', textColor: 'text-blue-400' },
    { num: 2, name: 'Field Layer', desc: 'Pattern Synthesis', sub: 'Standing Waves', color: 'border-purple-500', textColor: 'text-purple-400' },
    { num: 3, name: 'Meta Layer', desc: 'Self-Reflection', sub: 'Quality Feedback', color: 'border-orange-500', textColor: 'text-orange-400' },
    { num: 4, name: 'Quantum Layer', desc: 'Hexagram States', sub: 'Probability Waves', color: 'border-green-500', textColor: 'text-green-400' },
    { num: 5, name: 'Semantic Layer', desc: 'Concept Resonance', sub: 'Hilbert Space', color: 'border-pink-500', textColor: 'text-pink-400' },
    { num: 6, name: 'Observer Layer', desc: 'Conscious Interface', sub: 'Natural Expression', color: 'border-gray-400', textColor: 'text-gray-300' }
  ];

  return (
    <section className="bg-black/60 border border-border rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-muted-foreground">Resonance Architecture Flow</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-center text-xs">
        {layers.map((layer) => (
          <div 
            key={layer.num}
            className={`border-l-4 ${layer.color} pl-3 text-left transition-transform hover:translate-x-1`}
          >
            <div className={`font-bold ${layer.textColor} mb-1`}>{layer.num}. {layer.name}</div>
            <div className="text-foreground">{layer.desc}</div>
            <div className="text-muted-foreground">{layer.sub}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 relative h-1">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-orange-500 via-green-500 via-pink-500 to-gray-300 rounded-full" />
      </div>
    </section>
  );
}
