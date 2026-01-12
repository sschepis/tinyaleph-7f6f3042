import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SYMBOL_DATABASE } from '@/lib/symbolic-mind/symbol-database';
import type { SymbolicSymbol } from '@/lib/symbolic-mind/types';

interface TransitionNetworkGraphProps {
  transitionMatrix: Map<string, Map<string, number>>;
  startSymbols: Map<string, number>;
  width?: number;
  height?: number;
}

interface Node {
  id: string;
  symbol: SymbolicSymbol;
  x: number;
  y: number;
  isStart: boolean;
  totalOutgoing: number;
}

interface Edge {
  from: string;
  to: string;
  weight: number;
  probability: number;
}

// Force-directed layout simulation
function simulateLayout(
  nodes: Node[],
  edges: Edge[],
  width: number,
  height: number,
  iterations: number = 50
): Node[] {
  const positions = nodes.map(n => ({ ...n }));
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Initialize positions in a circle
  positions.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / positions.length;
    const radius = Math.min(width, height) * 0.35;
    node.x = centerX + radius * Math.cos(angle);
    node.y = centerY + radius * Math.sin(angle);
  });
  
  const nodeMap = new Map(positions.map(n => [n.id, n]));
  
  for (let iter = 0; iter < iterations; iter++) {
    const forces = new Map<string, { fx: number; fy: number }>();
    positions.forEach(n => forces.set(n.id, { fx: 0, fy: 0 }));
    
    // Repulsion between all nodes
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i];
        const b = positions[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const repulsion = 2000 / (dist * dist);
        
        const fx = (dx / dist) * repulsion;
        const fy = (dy / dist) * repulsion;
        
        forces.get(a.id)!.fx -= fx;
        forces.get(a.id)!.fy -= fy;
        forces.get(b.id)!.fx += fx;
        forces.get(b.id)!.fy += fy;
      }
    }
    
    // Attraction along edges
    for (const edge of edges) {
      const a = nodeMap.get(edge.from);
      const b = nodeMap.get(edge.to);
      if (!a || !b) continue;
      
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const attraction = dist * 0.01 * edge.probability;
      
      const fx = (dx / dist) * attraction;
      const fy = (dy / dist) * attraction;
      
      forces.get(a.id)!.fx += fx;
      forces.get(a.id)!.fy += fy;
      forces.get(b.id)!.fx -= fx;
      forces.get(b.id)!.fy -= fy;
    }
    
    // Center gravity
    positions.forEach(node => {
      const dx = centerX - node.x;
      const dy = centerY - node.y;
      forces.get(node.id)!.fx += dx * 0.01;
      forces.get(node.id)!.fy += dy * 0.01;
    });
    
    // Apply forces with damping
    const damping = 0.85 - (iter / iterations) * 0.3;
    positions.forEach(node => {
      const f = forces.get(node.id)!;
      node.x += f.fx * damping;
      node.y += f.fy * damping;
      
      // Keep in bounds
      const padding = 30;
      node.x = Math.max(padding, Math.min(width - padding, node.x));
      node.y = Math.max(padding, Math.min(height - padding, node.y));
    });
  }
  
  return positions;
}

export function TransitionNetworkGraph({ 
  transitionMatrix, 
  startSymbols,
  width = 400,
  height = 300 
}: TransitionNetworkGraphProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<{ from: string; to: string } | null>(null);
  
  const { nodes, edges } = useMemo(() => {
    const allSymbols = Object.values(SYMBOL_DATABASE);
    const nodeIds = new Set<string>();
    const edgeList: Edge[] = [];
    
    // Collect all nodes and edges from transition matrix
    transitionMatrix.forEach((toMap, fromId) => {
      nodeIds.add(fromId);
      let totalFromThis = 0;
      toMap.forEach(count => totalFromThis += count);
      
      toMap.forEach((count, toId) => {
        nodeIds.add(toId);
        edgeList.push({
          from: fromId,
          to: toId,
          weight: count,
          probability: count / totalFromThis
        });
      });
    });
    
    // Also add start symbols
    startSymbols.forEach((_, symbolId) => nodeIds.add(symbolId));
    
    // Create node objects
    const nodeList: Node[] = [];
    nodeIds.forEach(id => {
      const symbol = allSymbols.find(s => s.id === id);
      if (symbol) {
        let totalOutgoing = 0;
        const outMap = transitionMatrix.get(id);
        if (outMap) {
          outMap.forEach(count => totalOutgoing += count);
        }
        
        nodeList.push({
          id,
          symbol,
          x: 0,
          y: 0,
          isStart: startSymbols.has(id),
          totalOutgoing
        });
      }
    });
    
    // Sort nodes for consistent layout (starts first, then by outgoing)
    nodeList.sort((a, b) => {
      if (a.isStart !== b.isStart) return a.isStart ? -1 : 1;
      return b.totalOutgoing - a.totalOutgoing;
    });
    
    return { nodes: nodeList, edges: edgeList };
  }, [transitionMatrix, startSymbols]);
  
  // Run layout simulation
  const positionedNodes = useMemo(() => {
    if (nodes.length === 0) return [];
    return simulateLayout(nodes, edges, width, height, 80);
  }, [nodes, edges, width, height]);
  
  const nodeMap = useMemo(() => 
    new Map(positionedNodes.map(n => [n.id, n])), 
    [positionedNodes]
  );
  
  // Calculate edge paths with curves for bidirectional edges
  const edgePaths = useMemo(() => {
    return edges.map(edge => {
      const from = nodeMap.get(edge.from);
      const to = nodeMap.get(edge.to);
      if (!from || !to) return null;
      
      // Check for reverse edge
      const hasReverse = edges.some(e => e.from === edge.to && e.to === edge.from);
      
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // Offset for node radius
      const nodeRadius = 18;
      const startX = from.x + (dx / dist) * nodeRadius;
      const startY = from.y + (dy / dist) * nodeRadius;
      const endX = to.x - (dx / dist) * nodeRadius;
      const endY = to.y - (dy / dist) * nodeRadius;
      
      let path: string;
      if (hasReverse && edge.from < edge.to) {
        // Curve outward for one direction
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const perpX = -dy / dist * 20;
        const perpY = dx / dist * 20;
        path = `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`;
      } else if (hasReverse) {
        // Curve other way for reverse
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const perpX = dy / dist * 20;
        const perpY = -dx / dist * 20;
        path = `M ${startX} ${startY} Q ${midX + perpX} ${midY + perpY} ${endX} ${endY}`;
      } else {
        path = `M ${startX} ${startY} L ${endX} ${endY}`;
      }
      
      // Arrow position (at 80% of path)
      const arrowPos = 0.75;
      let arrowX: number, arrowY: number, arrowAngle: number;
      
      if (hasReverse) {
        // Approximate position on curve
        const t = arrowPos;
        const midX = (startX + endX) / 2 + (edge.from < edge.to ? -dy : dy) / dist * 20;
        const midY = (startY + endY) / 2 + (edge.from < edge.to ? dx : -dx) / dist * 20;
        arrowX = (1-t)*(1-t)*startX + 2*(1-t)*t*midX + t*t*endX;
        arrowY = (1-t)*(1-t)*startY + 2*(1-t)*t*midY + t*t*endY;
        const tangentX = 2*(1-t)*(midX-startX) + 2*t*(endX-midX);
        const tangentY = 2*(1-t)*(midY-startY) + 2*t*(endY-midY);
        arrowAngle = Math.atan2(tangentY, tangentX) * 180 / Math.PI;
      } else {
        arrowX = startX + (endX - startX) * arrowPos;
        arrowY = startY + (endY - startY) * arrowPos;
        arrowAngle = Math.atan2(dy, dx) * 180 / Math.PI;
      }
      
      return {
        ...edge,
        path,
        arrowX,
        arrowY,
        arrowAngle,
        startX,
        startY,
        endX,
        endY
      };
    }).filter(Boolean);
  }, [edges, nodeMap]);
  
  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        Add patterns to see the transition network
      </div>
    );
  }
  
  const maxWeight = Math.max(...edges.map(e => e.weight), 1);
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <marker
          id="arrowhead"
          markerWidth="6"
          markerHeight="4"
          refX="3"
          refY="2"
          orient="auto"
        >
          <polygon points="0 0, 6 2, 0 4" fill="hsl(var(--primary))" opacity="0.7" />
        </marker>
        <marker
          id="arrowhead-hover"
          markerWidth="8"
          markerHeight="5"
          refX="4"
          refY="2.5"
          orient="auto"
        >
          <polygon points="0 0, 8 2.5, 0 5" fill="hsl(var(--primary))" />
        </marker>
      </defs>
      
      {/* Edges */}
      <g>
        {edgePaths.map((edge, i) => {
          if (!edge) return null;
          const isHovered = hoveredEdge?.from === edge.from && hoveredEdge?.to === edge.to;
          const isConnectedToHovered = hoveredNode === edge.from || hoveredNode === edge.to;
          const opacity = hoveredNode ? (isConnectedToHovered ? 1 : 0.15) : 0.6;
          const strokeWidth = 1 + (edge.weight / maxWeight) * 3;
          
          return (
            <g key={`${edge.from}-${edge.to}`}>
              <motion.path
                d={edge.path}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth={isHovered ? strokeWidth + 1 : strokeWidth}
                opacity={isHovered ? 1 : opacity}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: i * 0.02 }}
                onMouseEnter={() => setHoveredEdge({ from: edge.from, to: edge.to })}
                onMouseLeave={() => setHoveredEdge(null)}
                style={{ cursor: 'pointer' }}
              />
              {/* Arrow */}
              <polygon
                points="-5,-3 5,0 -5,3"
                fill="hsl(var(--primary))"
                opacity={isHovered ? 1 : opacity}
                transform={`translate(${edge.arrowX}, ${edge.arrowY}) rotate(${edge.arrowAngle})`}
              />
              {/* Probability label on hover */}
              {isHovered && (
                <text
                  x={(edge.startX + edge.endX) / 2}
                  y={(edge.startY + edge.endY) / 2 - 8}
                  textAnchor="middle"
                  className="text-[10px] fill-foreground font-mono"
                >
                  {(edge.probability * 100).toFixed(0)}%
                </text>
              )}
            </g>
          );
        })}
      </g>
      
      {/* Nodes */}
      <g>
        {positionedNodes.map((node, i) => {
          const isHovered = hoveredNode === node.id;
          const isConnected = hoveredNode ? 
            edges.some(e => (e.from === hoveredNode && e.to === node.id) || (e.to === hoveredNode && e.from === node.id)) : 
            false;
          const opacity = hoveredNode ? (isHovered || isConnected ? 1 : 0.3) : 1;
          
          return (
            <motion.g
              key={node.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Start indicator ring */}
              {node.isStart && (
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={22}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  strokeDasharray="4 2"
                  opacity={0.6}
                />
              )}
              
              {/* Node circle */}
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? 20 : 18}
                fill={node.isStart ? 'hsl(var(--primary) / 0.2)' : 'hsl(var(--background))'}
                stroke={node.isStart ? 'hsl(var(--primary))' : 'hsl(var(--border))'}
                strokeWidth={isHovered ? 2 : 1.5}
                className="transition-all duration-150"
              />
              
              {/* Symbol unicode */}
              <text
                x={node.x}
                y={node.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-lg select-none pointer-events-none"
              >
                {node.symbol.unicode}
              </text>
              
              {/* Label on hover */}
              {isHovered && (
                <g>
                  <rect
                    x={node.x - 40}
                    y={node.y + 24}
                    width={80}
                    height={18}
                    rx={4}
                    fill="hsl(var(--popover))"
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                  />
                  <text
                    x={node.x}
                    y={node.y + 35}
                    textAnchor="middle"
                    className="text-[10px] fill-foreground"
                  >
                    {node.symbol.name}
                  </text>
                </g>
              )}
            </motion.g>
          );
        })}
      </g>
      
      {/* Legend */}
      <g transform={`translate(${width - 80}, 10)`}>
        <rect x={0} y={0} width={75} height={50} rx={4} fill="hsl(var(--background) / 0.8)" stroke="hsl(var(--border))" />
        <circle cx={12} cy={15} r={6} fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeDasharray="2 1" />
        <text x={22} y={18} className="text-[9px] fill-muted-foreground">Start</text>
        <line x1={8} y1={35} x2={25} y2={35} stroke="hsl(var(--primary))" strokeWidth={2} />
        <polygon points="25,32 31,35 25,38" fill="hsl(var(--primary))" />
        <text x={36} y={38} className="text-[9px] fill-muted-foreground">Flow</text>
      </g>
    </svg>
  );
}
