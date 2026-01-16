/**
 * Triadic Fusion Network Graph
 * 
 * Interactive force-directed graph showing prime relationships and fusion connections
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { 
  PrimeMeaning, 
  TriadicFusion,
  SemanticPrimeMapper 
} from '@/lib/sentient-observer/semantic-prime-mapper';
import { ZoomIn, ZoomOut, RotateCcw, Filter } from 'lucide-react';

interface FusionNode {
  id: string;
  prime: number;
  meaning: string;
  confidence: number;
  isSeeded: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  fusionCount: number;
}

interface FusionEdge {
  id: string;
  source: string;
  target: string;
  strength: number;
  fusionType: 'additive' | 'multiplicative' | 'harmonic';
  via: number; // Third prime in the triad
}

interface TriadicFusionGraphProps {
  mapper: SemanticPrimeMapper;
  width?: number;
  height?: number;
  onNodeSelect?: (prime: number) => void;
  selectedPrime?: number;
}

export function TriadicFusionGraph({
  mapper,
  width = 400,
  height = 300,
  onNodeSelect,
  selectedPrime
}: TriadicFusionGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>(0);
  
  const [nodes, setNodes] = useState<FusionNode[]>([]);
  const [edges, setEdges] = useState<FusionEdge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [minConfidence, setMinConfidence] = useState(0.3);
  const [showSeededOnly, setShowSeededOnly] = useState(false);

  // Build graph from mapper
  const buildGraph = useCallback(() => {
    const field = mapper.getField();
    const meanings = Array.from(field.primes.values());
    
    // Filter by confidence and seeded status
    const filteredMeanings = meanings.filter(m => 
      m.confidence >= minConfidence && 
      (!showSeededOnly || m.isSeeded)
    );
    
    // Create nodes
    const newNodes: FusionNode[] = filteredMeanings.map((m, i) => {
      // Position in a spiral pattern initially
      const angle = (i / filteredMeanings.length) * Math.PI * 4;
      const radius = 50 + (i / filteredMeanings.length) * 100;
      
      return {
        id: `p${m.prime}`,
        prime: m.prime,
        meaning: m.meaning,
        confidence: m.confidence,
        isSeeded: m.isSeeded,
        x: width / 2 + Math.cos(angle) * radius * zoom,
        y: height / 2 + Math.sin(angle) * radius * zoom,
        vx: 0,
        vy: 0,
        radius: m.isSeeded ? 12 : 8 + m.confidence * 6,
        fusionCount: m.derivedFrom.length
      };
    });
    
    // Create edges from fusion relationships
    const newEdges: FusionEdge[] = [];
    const edgeSet = new Set<string>();
    
    for (const m of filteredMeanings) {
      for (const fusion of m.derivedFrom) {
        // Create edges for each pair in the triad
        const pairs: [number, number, number][] = [
          [fusion.p, fusion.q, fusion.r],
          [fusion.q, fusion.r, fusion.p],
          [fusion.r, fusion.p, fusion.q]
        ];
        
        for (const [a, b, via] of pairs) {
          const sourceId = `p${a}`;
          const targetId = `p${b}`;
          const edgeId = [a, b].sort((x, y) => x - y).join('-');
          
          if (!edgeSet.has(edgeId) && 
              newNodes.some(n => n.id === sourceId) && 
              newNodes.some(n => n.id === targetId)) {
            edgeSet.add(edgeId);
            newEdges.push({
              id: edgeId,
              source: sourceId,
              target: targetId,
              strength: fusion.strength,
              fusionType: fusion.fusionType,
              via
            });
          }
        }
      }
      
      // Also add resonance edges
      for (const resonantPrime of m.resonantWith.slice(0, 5)) {
        const sourceId = `p${m.prime}`;
        const targetId = `p${resonantPrime}`;
        const edgeId = [m.prime, resonantPrime].sort((x, y) => x - y).join('-r-');
        
        if (!edgeSet.has(edgeId) && newNodes.some(n => n.id === targetId)) {
          edgeSet.add(edgeId);
          newEdges.push({
            id: edgeId,
            source: sourceId,
            target: targetId,
            strength: 0.3,
            fusionType: 'harmonic',
            via: 0
          });
        }
      }
    }
    
    setNodes(newNodes);
    setEdges(newEdges);
  }, [mapper, width, height, zoom, minConfidence, showSeededOnly]);

  // Rebuild graph when mapper changes
  useEffect(() => {
    buildGraph();
  }, [buildGraph]);

  // Force simulation
  useEffect(() => {
    if (nodes.length === 0) return;
    
    const simulate = () => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(n => ({ ...n }));
        
        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i];
          if (node.id === draggedNode) continue;
          
          // Repulsion between nodes
          for (let j = 0; j < newNodes.length; j++) {
            if (i === j) continue;
            const other = newNodes[j];
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = (node.radius + other.radius) * 2;
            
            if (dist < minDist * 3) {
              const force = 500 / (dist * dist);
              node.vx += (dx / dist) * force * 0.01;
              node.vy += (dy / dist) * force * 0.01;
            }
          }
          
          // Attraction along edges
          edges.forEach(edge => {
            if (edge.source === node.id || edge.target === node.id) {
              const otherId = edge.source === node.id ? edge.target : edge.source;
              const other = newNodes.find(n => n.id === otherId);
              if (other) {
                const dx = other.x - node.x;
                const dy = other.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const targetDist = 60 / zoom;
                const force = (dist - targetDist) * edge.strength * 0.003;
                node.vx += (dx / dist) * force;
                node.vy += (dy / dist) * force;
              }
            }
          });
          
          // Center gravity
          const centerX = width / 2;
          const centerY = height / 2;
          node.vx += (centerX - node.x) * 0.001;
          node.vy += (centerY - node.y) * 0.001;
          
          // Apply velocity with damping
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.9;
          node.vy *= 0.9;
          
          // Bounds
          const padding = node.radius + 5;
          node.x = Math.max(padding, Math.min(width - padding, node.x));
          node.y = Math.max(padding, Math.min(height - padding, node.y));
        }
        
        return newNodes;
      });
      
      animationRef.current = requestAnimationFrame(simulate);
    };
    
    animationRef.current = requestAnimationFrame(simulate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [nodes.length, edges, draggedNode, width, height, zoom]);

  // Mouse handlers
  const handleMouseDown = (nodeId: string) => {
    setDraggedNode(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedNode || !svgRef.current) return;
    
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setNodes(prev => prev.map(n => 
      n.id === draggedNode 
        ? { ...n, x, y, vx: 0, vy: 0 }
        : n
    ));
  };

  const handleMouseUp = () => {
    setDraggedNode(null);
  };

  const handleNodeClick = (node: FusionNode) => {
    onNodeSelect?.(node.prime);
  };

  // Edge color based on fusion type
  const getEdgeColor = (edge: FusionEdge) => {
    switch (edge.fusionType) {
      case 'additive': return 'hsl(var(--primary))';
      case 'multiplicative': return 'hsl(var(--chart-2))';
      case 'harmonic': return 'hsl(var(--chart-3))';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  // Node color based on properties
  const getNodeColor = (node: FusionNode) => {
    if (selectedPrime === node.prime) return 'hsl(var(--primary))';
    if (node.isSeeded) return 'hsl(var(--chart-1))';
    if (node.confidence > 0.7) return 'hsl(var(--chart-2))';
    return 'hsl(var(--muted-foreground))';
  };

  return (
    <Card className="border-primary/30">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Fusion Network</CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {nodes.length} nodes
            </Badge>
            <Badge variant="outline" className="text-xs">
              {edges.length} links
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-2 space-y-2">
        {/* Controls */}
        <div className="flex items-center gap-2 text-xs">
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 w-6 p-0"
            onClick={() => setZoom(z => Math.min(2, z + 0.2))}
          >
            <ZoomIn className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 w-6 p-0"
            onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}
          >
            <ZoomOut className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="h-6 w-6 p-0"
            onClick={buildGraph}
          >
            <RotateCcw className="h-3 w-3" />
          </Button>
          <div className="flex-1 flex items-center gap-1">
            <Filter className="h-3 w-3 text-muted-foreground" />
            <Slider
              value={[minConfidence]}
              onValueChange={([v]) => setMinConfidence(v)}
              min={0}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <span className="w-8 text-right">{(minConfidence * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Graph SVG */}
        <svg
          ref={svgRef}
          width={width}
          height={height}
          className="bg-muted/20 rounded-lg cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Edges */}
          <g className="edges">
            {edges.map(edge => {
              const source = nodes.find(n => n.id === edge.source);
              const target = nodes.find(n => n.id === edge.target);
              if (!source || !target) return null;
              
              const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;
              
              return (
                <line
                  key={edge.id}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={getEdgeColor(edge)}
                  strokeWidth={isHighlighted ? 2 : 1}
                  strokeOpacity={isHighlighted ? 0.8 : 0.3}
                  strokeDasharray={edge.fusionType === 'harmonic' ? '3,3' : undefined}
                />
              );
            })}
          </g>
          
          {/* Nodes */}
          <g className="nodes">
            {nodes.map(node => {
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedPrime === node.prime;
              
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onMouseDown={() => handleMouseDown(node.id)}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer"
                >
                  {/* Glow for seeded nodes */}
                  {node.isSeeded && (
                    <circle
                      r={node.radius + 4}
                      fill="none"
                      stroke={getNodeColor(node)}
                      strokeWidth={2}
                      strokeOpacity={0.3}
                    />
                  )}
                  
                  {/* Main circle */}
                  <circle
                    r={node.radius}
                    fill={getNodeColor(node)}
                    fillOpacity={0.8}
                    stroke={isHovered || isSelected ? 'white' : 'transparent'}
                    strokeWidth={2}
                    className="transition-all duration-150"
                  />
                  
                  {/* Prime number label */}
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fontSize={node.radius > 10 ? 8 : 6}
                    fill="white"
                    className="pointer-events-none select-none font-mono"
                  >
                    {node.prime}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover tooltip */}
        {hoveredNode && (
          <div className="text-xs bg-popover border rounded p-2 space-y-1">
            {(() => {
              const node = nodes.find(n => n.id === hoveredNode);
              if (!node) return null;
              return (
                <>
                  <div className="font-mono text-primary">Prime {node.prime}</div>
                  <div className="text-muted-foreground truncate max-w-[250px]">{node.meaning}</div>
                  <div className="flex gap-2">
                    <Badge variant={node.isSeeded ? 'default' : 'secondary'} className="text-xs">
                      {node.isSeeded ? 'Seeded' : 'Derived'}
                    </Badge>
                    <span className="text-muted-foreground">
                      {(node.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-primary" />
            <span>Additive</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-chart-2" />
            <span>Multiplicative</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-chart-3 border-dashed border-t" style={{ borderStyle: 'dashed' }} />
            <span>Harmonic</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TriadicFusionGraph;
