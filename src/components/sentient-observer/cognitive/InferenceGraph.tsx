/**
 * Inference Graph - Visual node diagram showing reasoning chain derivations
 * Connects facts with inference rules in an interactive force-directed layout
 */

import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, Circle, ArrowRight, Maximize2, Minimize2 } from 'lucide-react';
import type { Fact, ReasoningStep, ReasoningEngine } from '@/lib/sentient-observer/reasoning-engine';

interface GraphNode {
  id: string;
  type: 'fact' | 'rule';
  label: string;
  data: Fact | { ruleId: string; ruleName: string };
  x: number;
  y: number;
  vx: number;
  vy: number;
  source?: 'input' | 'inferred' | 'observation';
  confidence?: number;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: 'premise' | 'conclusion';
}

interface InferenceGraphProps {
  reasoning: ReasoningEngine;
  onSelectFact?: (fact: Fact) => void;
}

export const InferenceGraph: React.FC<InferenceGraphProps> = ({
  reasoning,
  onSelectFact
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 300, height: 200 });
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);

  // Measure container size
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(rect.width, 200),
          height: isExpanded ? 350 : 220
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [isExpanded]);

  // Build graph from reasoning engine
  const graphData = useMemo(() => {
    const graphNodes: GraphNode[] = [];
    const graphEdges: GraphEdge[] = [];
    const nodeMap = new Map<string, GraphNode>();

    // Add fact nodes
    reasoning.facts.forEach((fact, id) => {
      const node: GraphNode = {
        id: fact.id,
        type: 'fact',
        label: fact.name.slice(0, 20),
        data: fact,
        x: dimensions.width * 0.2 + Math.random() * dimensions.width * 0.6,
        y: dimensions.height * 0.2 + Math.random() * dimensions.height * 0.6,
        vx: 0,
        vy: 0,
        source: fact.source,
        confidence: fact.confidence
      };
      graphNodes.push(node);
      nodeMap.set(fact.id, node);
    });

    // Add reasoning step nodes and edges
    const processedRules = new Set<string>();
    reasoning.reasoningHistory.forEach((step, idx) => {
      const ruleNodeId = `rule_${step.ruleId}_${idx}`;
      
      // Add rule node
      const ruleNode: GraphNode = {
        id: ruleNodeId,
        type: 'rule',
        label: step.ruleName.slice(0, 15),
        data: { ruleId: step.ruleId, ruleName: step.ruleName },
        x: dimensions.width * 0.3 + Math.random() * dimensions.width * 0.4,
        y: dimensions.height * 0.3 + Math.random() * dimensions.height * 0.4,
        vx: 0,
        vy: 0
      };
      graphNodes.push(ruleNode);
      
      // Add edges from input facts to rule
      step.inputFacts.forEach(inputFact => {
        if (nodeMap.has(inputFact.id)) {
          graphEdges.push({
            id: `edge_${inputFact.id}_${ruleNodeId}`,
            source: inputFact.id,
            target: ruleNodeId,
            type: 'premise'
          });
        }
      });
      
      // Add edge from rule to output fact
      if (nodeMap.has(step.outputFact.id)) {
        graphEdges.push({
          id: `edge_${ruleNodeId}_${step.outputFact.id}`,
          source: ruleNodeId,
          target: step.outputFact.id,
          type: 'conclusion'
        });
      }
    });

    return { nodes: graphNodes, edges: graphEdges };
  }, [reasoning.facts, reasoning.reasoningHistory]);

  // Initialize and run force simulation
  useEffect(() => {
    setNodes(graphData.nodes.map(n => ({ ...n })));
    setEdges(graphData.edges);
  }, [graphData]);

  // Simple force-directed layout simulation
  useEffect(() => {
    if (nodes.length === 0) return;

    const simulate = () => {
      setNodes(prevNodes => {
        const newNodes = prevNodes.map(n => ({ ...n }));
        
        // Apply forces
        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i];
          
          // Repulsion between nodes
          for (let j = 0; j < newNodes.length; j++) {
            if (i === j) continue;
            const other = newNodes[j];
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = 800 / (dist * dist);
            node.vx += (dx / dist) * force * 0.01;
            node.vy += (dy / dist) * force * 0.01;
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
                node.vx += dx * 0.005;
                node.vy += dy * 0.005;
              }
            }
          });
          
          // Center gravity - use actual dimensions
          const centerX = dimensions.width / 2;
          const centerY = dimensions.height / 2;
          node.vx += (centerX - node.x) * 0.002;
          node.vy += (centerY - node.y) * 0.002;
          
          // Apply velocity with damping
          node.x += node.vx;
          node.y += node.vy;
          node.vx *= 0.85;
          node.vy *= 0.85;
          
          // Bounds - use actual dimensions with padding
          const padding = 25;
          node.x = Math.max(padding, Math.min(dimensions.width - padding, node.x));
          node.y = Math.max(padding, Math.min(dimensions.height - padding, node.y));
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
  }, [nodes.length, edges, dimensions.width, dimensions.height]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNodeId(node.id);
    if (node.type === 'fact' && onSelectFact) {
      onSelectFact(node.data as Fact);
    }
  }, [onSelectFact]);

  const getNodeColor = (node: GraphNode): string => {
    if (node.type === 'rule') return 'hsl(var(--primary))';
    const fact = node.data as Fact;
    switch (fact.source) {
      case 'input': return 'hsl(210, 80%, 55%)';
      case 'inferred': return 'hsl(280, 70%, 55%)';
      case 'observation': return 'hsl(140, 70%, 45%)';
      default: return 'hsl(var(--muted-foreground))';
    }
  };

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (nodes.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <GitBranch className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No inference chains yet</p>
          <p className="text-xs mt-1">Run inference to see the reasoning graph</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Inference Graph
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Graph SVG */}
        <div 
          ref={containerRef}
          className="relative border rounded-lg bg-muted/20 overflow-hidden"
          style={{ height: isExpanded ? 350 : 220 }}
        >
          <svg 
            width={dimensions.width} 
            height={dimensions.height} 
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            className="w-full h-full"
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="6"
                markerHeight="4"
                refX="6"
                refY="2"
                orient="auto"
              >
                <polygon 
                  points="0 0, 6 2, 0 4" 
                  fill="hsl(var(--muted-foreground))"
                  opacity="0.6"
                />
              </marker>
            </defs>
            
            {/* Edges */}
            {edges.map(edge => {
              const source = nodes.find(n => n.id === edge.source);
              const target = nodes.find(n => n.id === edge.target);
              if (!source || !target) return null;
              
              return (
                <line
                  key={edge.id}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke={edge.type === 'conclusion' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                  strokeWidth={edge.type === 'conclusion' ? 2 : 1}
                  strokeOpacity={0.4}
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
            
            {/* Nodes */}
            {nodes.map(node => {
              const isSelected = node.id === selectedNodeId;
              const radius = node.type === 'rule' ? 8 : (isExpanded ? 10 : 8);
              
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => handleNodeClick(node)}
                  className="cursor-pointer"
                >
                  {/* Selection ring */}
                  {isSelected && (
                    <circle
                      r={radius + 4}
                      fill="none"
                      stroke={getNodeColor(node)}
                      strokeWidth="2"
                      opacity="0.5"
                    />
                  )}
                  
                  {/* Node circle */}
                  {node.type === 'rule' ? (
                    <rect
                      x={-radius}
                      y={-radius * 0.7}
                      width={radius * 2}
                      height={radius * 1.4}
                      rx="2"
                      fill={getNodeColor(node)}
                      opacity={node.confidence ?? 0.8}
                    />
                  ) : (
                    <circle
                      r={radius}
                      fill={getNodeColor(node)}
                      opacity={node.confidence ?? 0.8}
                    />
                  )}
                  
                  {/* Label (only in expanded mode) */}
                  {isExpanded && (
                    <text
                      y={radius + 12}
                      textAnchor="middle"
                      className="fill-foreground text-[8px] pointer-events-none"
                    >
                      {node.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-3 text-xs justify-center">
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
            <span className="text-muted-foreground">Input</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 fill-green-500 text-green-500" />
            <span className="text-muted-foreground">Observed</span>
          </div>
          <div className="flex items-center gap-1">
            <Circle className="h-3 w-3 fill-purple-500 text-purple-500" />
            <span className="text-muted-foreground">Inferred</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-2 bg-primary rounded-sm" />
            <span className="text-muted-foreground">Rule</span>
          </div>
        </div>

        {/* Selected Node Details */}
        {selectedNode && (
          <div className="p-2 bg-muted/30 rounded-lg text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium">{selectedNode.label}</span>
              <Badge variant="outline" className="text-xs">
                {selectedNode.type}
              </Badge>
            </div>
            {selectedNode.type === 'fact' && (
              <>
                <p className="text-muted-foreground">
                  {(selectedNode.data as Fact).statement.slice(0, 80)}...
                </p>
                <div className="flex gap-2 mt-1">
                  <span>Confidence: {((selectedNode.confidence ?? 0) * 100).toFixed(0)}%</span>
                  <span>Source: {(selectedNode.data as Fact).source}</span>
                </div>
              </>
            )}
            {selectedNode.type === 'rule' && (
              <p className="text-muted-foreground">
                Inference rule: {(selectedNode.data as { ruleName: string }).ruleName}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InferenceGraph;
