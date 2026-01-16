/**
 * Learned Relationships Graph
 * 
 * Interactive force-directed graph showing relationships learned by the LLM chaperone.
 * Similar to TriadicFusionGraph but for chaperone-discovered connections.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut, RotateCcw, Expand, Minimize2 } from 'lucide-react';
import type { LearnedSymbol, LearnedRelationship } from '@/lib/sentient-observer/learning-engine';

interface RelationshipNode {
  id: string;
  prime: number;
  meaning: string;
  confidence: number;
  category?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  connectionCount: number;
}

interface RelationshipEdge {
  id: string;
  source: string;
  target: string;
  relationshipType: LearnedRelationship['relationshipType'];
  strength: number;
  explanation: string;
}

interface LearnedRelationshipsGraphProps {
  symbols: LearnedSymbol[];
  relationships: LearnedRelationship[];
  width?: number;
  height?: number;
  onNodeSelect?: (prime: number) => void;
  selectedPrime?: number;
}

const RELATIONSHIP_COLORS: Record<LearnedRelationship['relationshipType'], string> = {
  similar: 'hsl(142, 70%, 45%)',         // green
  opposite: 'hsl(0, 70%, 50%)',           // red
  contains: 'hsl(280, 70%, 50%)',         // purple
  part_of: 'hsl(200, 70%, 50%)',          // blue
  transforms_to: 'hsl(45, 90%, 50%)',     // amber
  resonates_with: 'hsl(180, 70%, 45%)'    // cyan
};

const RELATIONSHIP_SYMBOLS: Record<LearnedRelationship['relationshipType'], string> = {
  similar: '≈',
  opposite: '⊕',
  contains: '⊃',
  part_of: '⊂',
  transforms_to: '→',
  resonates_with: '∿'
};

const CATEGORY_COLORS: Record<string, string> = {
  consciousness: 'hsl(280, 70%, 50%)',
  structure: 'hsl(200, 70%, 50%)',
  dynamics: 'hsl(45, 90%, 50%)',
  relation: 'hsl(142, 70%, 45%)',
  quality: 'hsl(320, 70%, 50%)',
  quantity: 'hsl(180, 70%, 45%)',
  archetype: 'hsl(0, 70%, 50%)',
  process: 'hsl(100, 70%, 45%)'
};

export function LearnedRelationshipsGraph({
  symbols,
  relationships,
  width = 400,
  height = 350,
  onNodeSelect,
  selectedPrime
}: LearnedRelationshipsGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const animationRef = useRef<number>(0);
  
  const [nodes, setNodes] = useState<RelationshipNode[]>([]);
  const [edges, setEdges] = useState<RelationshipEdge[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [minStrength, setMinStrength] = useState(0.2);
  const [isExpanded, setIsExpanded] = useState(false);

  const actualWidth = isExpanded ? Math.min(800, window.innerWidth - 100) : width;
  const actualHeight = isExpanded ? 500 : height;

  // Build graph from learned data
  const buildGraph = useCallback(() => {
    if (symbols.length === 0 && relationships.length === 0) {
      setNodes([]);
      setEdges([]);
      return;
    }

    // Get all primes involved in relationships
    const primesInRelationships = new Set<number>();
    relationships.forEach(r => {
      primesInRelationships.add(r.primeA);
      primesInRelationships.add(r.primeB);
    });

    // Count connections per prime
    const connectionCounts = new Map<number, number>();
    relationships.forEach(r => {
      connectionCounts.set(r.primeA, (connectionCounts.get(r.primeA) || 0) + 1);
      connectionCounts.set(r.primeB, (connectionCounts.get(r.primeB) || 0) + 1);
    });

    // Create nodes from symbols that have relationships
    const symbolMap = new Map(symbols.map(s => [s.prime, s]));
    const allPrimes = new Set([
      ...symbols.map(s => s.prime),
      ...Array.from(primesInRelationships)
    ]);

    const newNodes: RelationshipNode[] = Array.from(allPrimes).map((prime, i) => {
      const symbol = symbolMap.get(prime);
      const connCount = connectionCounts.get(prime) || 0;
      
      // Position in a spiral pattern
      const angle = (i / allPrimes.size) * Math.PI * 3;
      const radius = 40 + (i / allPrimes.size) * 80;
      
      return {
        id: `p${prime}`,
        prime,
        meaning: symbol?.meaning || `Prime ${prime}`,
        confidence: symbol?.confidence || 0.5,
        category: symbol?.category,
        x: actualWidth / 2 + Math.cos(angle) * radius * zoom,
        y: actualHeight / 2 + Math.sin(angle) * radius * zoom,
        vx: 0,
        vy: 0,
        radius: 8 + Math.min(connCount * 2, 10) + (symbol?.confidence || 0.5) * 4,
        connectionCount: connCount
      };
    });

    // Create edges from relationships
    const newEdges: RelationshipEdge[] = relationships
      .filter(r => r.strength >= minStrength)
      .map((r, i) => ({
        id: `rel-${r.primeA}-${r.primeB}-${i}`,
        source: `p${r.primeA}`,
        target: `p${r.primeB}`,
        relationshipType: r.relationshipType,
        strength: r.strength,
        explanation: r.explanation
      }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [symbols, relationships, actualWidth, actualHeight, zoom, minStrength]);

  // Rebuild graph when data changes
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
            const minDist = (node.radius + other.radius) * 2.5;
            
            if (dist < minDist * 3) {
              const force = 600 / (dist * dist);
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
                const targetDist = 70 / zoom;
                const force = (dist - targetDist) * edge.strength * 0.004;
                node.vx += (dx / dist) * force;
                node.vy += (dy / dist) * force;
              }
            }
          });
          
          // Center gravity
          const centerX = actualWidth / 2;
          const centerY = actualHeight / 2;
          node.vx += (centerX - node.x) * 0.002;
          node.vy += (centerY - node.y) * 0.002;
          
          // Apply velocity with damping
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.88;
          node.vy *= 0.88;
          
          // Bounds
          const padding = node.radius + 10;
          node.x = Math.max(padding, Math.min(actualWidth - padding, node.x));
          node.y = Math.max(padding, Math.min(actualHeight - padding, node.y));
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
  }, [nodes.length, edges, draggedNode, actualWidth, actualHeight, zoom]);

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

  const handleNodeClick = (node: RelationshipNode) => {
    onNodeSelect?.(node.prime);
  };

  // Get node color
  const getNodeColor = (node: RelationshipNode) => {
    if (selectedPrime === node.prime) return 'hsl(var(--primary))';
    if (node.category && CATEGORY_COLORS[node.category]) {
      return CATEGORY_COLORS[node.category];
    }
    return `hsl(${(node.prime * 37) % 360}, 60%, 50%)`;
  };

  // Get edge path (curved for certain relationship types)
  const getEdgePath = (edge: RelationshipEdge) => {
    const source = nodes.find(n => n.id === edge.source);
    const target = nodes.find(n => n.id === edge.target);
    if (!source || !target) return '';

    // Curved path for transforms_to relationships
    if (edge.relationshipType === 'transforms_to') {
      const midX = (source.x + target.x) / 2;
      const midY = (source.y + target.y) / 2;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const curvature = 20;
      const ctrlX = midX - dy * curvature / Math.sqrt(dx * dx + dy * dy);
      const ctrlY = midY + dx * curvature / Math.sqrt(dx * dx + dy * dy);
      return `M ${source.x} ${source.y} Q ${ctrlX} ${ctrlY} ${target.x} ${target.y}`;
    }

    return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  };

  if (symbols.length === 0 && relationships.length === 0) {
    return (
      <Card className="border-primary/30">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-sm">Knowledge Graph</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Start learning to build the knowledge graph
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/30 ${isExpanded ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="py-2 px-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Knowledge Graph</CardTitle>
          <div className="flex items-center gap-1">
            <Badge variant="outline" className="text-xs">
              {nodes.length} concepts
            </Badge>
            <Badge variant="outline" className="text-xs">
              {edges.length} links
            </Badge>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 ml-1"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Expand className="h-3 w-3" />}
            </Button>
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
            <span className="text-muted-foreground text-[10px]">Min:</span>
            <Slider
              value={[minStrength]}
              onValueChange={([v]) => setMinStrength(v)}
              min={0}
              max={1}
              step={0.1}
              className="flex-1"
            />
            <span className="w-8 text-right text-[10px]">{(minStrength * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Graph SVG */}
        <svg
          ref={svgRef}
          width={actualWidth}
          height={actualHeight}
          className="bg-muted/20 rounded-lg cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Arrow markers for directed relationships */}
          <defs>
            {Object.entries(RELATIONSHIP_COLORS).map(([type, color]) => (
              <marker
                key={type}
                id={`arrow-${type}`}
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill={color} fillOpacity={0.7} />
              </marker>
            ))}
          </defs>

          {/* Edges */}
          <g className="edges">
            {edges.map(edge => {
              const source = nodes.find(n => n.id === edge.source);
              const target = nodes.find(n => n.id === edge.target);
              if (!source || !target) return null;
              
              const isHighlighted = hoveredNode === edge.source || 
                                   hoveredNode === edge.target || 
                                   hoveredEdge === edge.id;
              const color = RELATIONSHIP_COLORS[edge.relationshipType];
              const isDirected = ['transforms_to', 'contains', 'part_of'].includes(edge.relationshipType);
              
              return (
                <g key={edge.id}>
                  <path
                    d={getEdgePath(edge)}
                    fill="none"
                    stroke={color}
                    strokeWidth={isHighlighted ? 3 : 1.5 + edge.strength}
                    strokeOpacity={isHighlighted ? 0.9 : 0.5}
                    strokeDasharray={edge.relationshipType === 'similar' ? '5,3' : undefined}
                    markerEnd={isDirected ? `url(#arrow-${edge.relationshipType})` : undefined}
                    onMouseEnter={() => setHoveredEdge(edge.id)}
                    onMouseLeave={() => setHoveredEdge(null)}
                    className="cursor-pointer"
                  />
                  {/* Relationship symbol at midpoint */}
                  {isHighlighted && (
                    <text
                      x={(source.x + target.x) / 2}
                      y={(source.y + target.y) / 2 - 8}
                      textAnchor="middle"
                      fontSize={12}
                      fill={color}
                      className="pointer-events-none font-bold"
                    >
                      {RELATIONSHIP_SYMBOLS[edge.relationshipType]}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
          
          {/* Nodes */}
          <g className="nodes">
            {nodes.map(node => {
              const isHovered = hoveredNode === node.id;
              const isSelected = selectedPrime === node.prime;
              const nodeColor = getNodeColor(node);
              
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
                  {/* Glow effect */}
                  <circle
                    r={node.radius + 5}
                    fill="none"
                    stroke={nodeColor}
                    strokeWidth={2}
                    strokeOpacity={isHovered || isSelected ? 0.5 : 0.15}
                  />
                  
                  {/* Main circle */}
                  <circle
                    r={node.radius}
                    fill={nodeColor}
                    fillOpacity={0.85}
                    stroke={isHovered || isSelected ? 'white' : 'transparent'}
                    strokeWidth={2}
                    className="transition-all duration-150"
                  />
                  
                  {/* Prime number label */}
                  <text
                    textAnchor="middle"
                    dy="0.35em"
                    fontSize={node.radius > 12 ? 9 : 7}
                    fill="white"
                    className="pointer-events-none select-none font-mono font-bold"
                  >
                    {node.prime}
                  </text>
                  
                  {/* Meaning label on hover */}
                  {isHovered && (
                    <text
                      textAnchor="middle"
                      y={node.radius + 12}
                      fontSize={10}
                      fill="hsl(var(--foreground))"
                      className="pointer-events-none select-none"
                    >
                      {node.meaning.slice(0, 15)}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Hover tooltips */}
        {hoveredNode && (
          <div className="text-xs bg-popover border rounded p-2 space-y-1">
            {(() => {
              const node = nodes.find(n => n.id === hoveredNode);
              if (!node) return null;
              return (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-primary font-bold">p{node.prime}</span>
                    <span className="font-medium">{node.meaning}</span>
                  </div>
                  <div className="flex gap-2 items-center">
                    {node.category && (
                      <Badge 
                        variant="outline" 
                        className="text-[9px] h-4"
                        style={{ borderColor: CATEGORY_COLORS[node.category] || undefined }}
                      >
                        {node.category}
                      </Badge>
                    )}
                    <span className="text-muted-foreground text-[10px]">
                      {(node.confidence * 100).toFixed(0)}% conf · {node.connectionCount} links
                    </span>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {hoveredEdge && !hoveredNode && (
          <div className="text-xs bg-popover border rounded p-2 space-y-1">
            {(() => {
              const edge = edges.find(e => e.id === hoveredEdge);
              if (!edge) return null;
              const source = nodes.find(n => n.id === edge.source);
              const target = nodes.find(n => n.id === edge.target);
              return (
                <>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{source?.meaning}</span>
                    <span 
                      className="text-lg font-bold"
                      style={{ color: RELATIONSHIP_COLORS[edge.relationshipType] }}
                    >
                      {RELATIONSHIP_SYMBOLS[edge.relationshipType]}
                    </span>
                    <span className="font-mono">{target?.meaning}</span>
                  </div>
                  <div className="text-muted-foreground capitalize">
                    {edge.relationshipType.replace('_', ' ')} · {(edge.strength * 100).toFixed(0)}% strength
                  </div>
                  {edge.explanation && (
                    <div className="text-muted-foreground italic text-[10px] max-w-[250px]">
                      {edge.explanation}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[9px] text-muted-foreground">
          {Object.entries(RELATIONSHIP_SYMBOLS).map(([type, symbol]) => (
            <div key={type} className="flex items-center gap-1">
              <span 
                className="text-sm font-bold"
                style={{ color: RELATIONSHIP_COLORS[type as LearnedRelationship['relationshipType']] }}
              >
                {symbol}
              </span>
              <span className="capitalize">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default LearnedRelationshipsGraph;
