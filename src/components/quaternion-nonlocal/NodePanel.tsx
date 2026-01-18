import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Radio } from 'lucide-react';
import { NodeState, NodeCommLogEntry, CommunicationEvent } from '@/lib/quaternion-nonlocal/communication-types';

interface NodePanelProps {
  node: NodeState;
  isPoweredOn: boolean;
  isEntangled: boolean;
  isSeparated: boolean;
  onSendMessage: (message: string) => void;
  commLog: NodeCommLogEntry[];
}

export function NodePanel({
  node,
  isPoweredOn,
  isEntangled,
  isSeparated,
  onSendMessage,
  commLog
}: NodePanelProps) {
  const [inputText, setInputText] = useState('');
  const logRef = useRef<HTMLDivElement>(null);
  
  const nodeColor = node.id === 'A' ? 'hsl(142 76% 36%)' : 'hsl(220 90% 56%)';
  const nodeBgClass = node.id === 'A' ? 'bg-green-500/5' : 'bg-blue-500/5';
  
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [commLog]);
  
  const handleTransmit = () => {
    if (!inputText.trim() || !isPoweredOn) return;
    onSendMessage(inputText);
    setInputText('');
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTransmit();
    }
  };

  return (
    <div className={`bg-card rounded-lg p-4 border border-border shadow-sm ${nodeBgClass}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <Radio className="w-4 h-4" style={{ color: nodeColor }} />
          <span style={{ color: nodeColor }}>Node {node.id}</span>
          {isSeparated && <span className="text-red-400 text-xs">📵</span>}
        </h2>
        <div className="text-[10px] text-muted-foreground">
          Physically {isSeparated ? (
            <span className="text-red-400">Disconnected</span>
          ) : (
            <span className="text-green-400">Connected</span>
          )}
        </div>
      </div>
      
      {/* Bloch Sphere Mini */}
      <div className="flex justify-center mb-3">
        <MiniBlochSphere node={node} isPoweredOn={isPoweredOn} />
      </div>
      
      {/* Message Input */}
      <div className="space-y-2 mb-3">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter message for quaternionic encoding..."
          className="w-full h-16 bg-muted/50 rounded p-2 text-xs font-mono border border-border resize-none placeholder-muted-foreground focus:outline-none focus:border-primary/50"
          disabled={!isPoweredOn}
        />
        <button
          onClick={handleTransmit}
          disabled={!isPoweredOn || !inputText.trim()}
          className="w-full px-3 py-2 rounded text-xs flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            background: `linear-gradient(135deg, ${nodeColor}, hsl(var(--primary)))`,
            color: 'white'
          }}
        >
          <Send className="w-3 h-3" />
          Encode & Transmit
        </button>
      </div>
      
      {/* Current Message Display */}
      <AnimatePresence>
        {node.message && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 p-2 rounded border-l-4"
            style={{ 
              borderColor: nodeColor,
              background: `${nodeColor}10`
            }}
          >
            <div className="text-[10px] text-muted-foreground mb-1">Current Message:</div>
            <div className="text-xs">{node.message}</div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
        <div className="bg-muted/50 p-1.5 rounded">
          <div className="text-muted-foreground">Quaternion</div>
          <div className="font-mono text-primary truncate">
            {node.quaternion.a.toFixed(1)}+{node.quaternion.b.toFixed(1)}i+{node.quaternion.c.toFixed(1)}j+{node.quaternion.d.toFixed(1)}k
          </div>
        </div>
        <div className="bg-muted/50 p-1.5 rounded">
          <div className="text-muted-foreground">Twist</div>
          <div className="font-mono text-primary">
            {(node.twist * 180 / Math.PI).toFixed(1)}°
          </div>
        </div>
        <div className="bg-muted/50 p-1.5 rounded">
          <div className="text-muted-foreground">Entropy</div>
          <div className="font-mono text-red-400">
            {node.entropy.toFixed(3)}
          </div>
        </div>
        <div className="bg-muted/50 p-1.5 rounded">
          <div className="text-muted-foreground">Coherence</div>
          <div className="font-mono text-green-400">
            {node.coherence.toFixed(3)}
          </div>
        </div>
      </div>
      
      {/* Communication Log */}
      <div className="border-t border-border pt-2">
        <h4 className="text-[10px] font-medium mb-1" style={{ color: nodeColor }}>
          📨 Node {node.id} Communications
        </h4>
        <div 
          ref={logRef}
          className="h-20 overflow-y-auto bg-muted/30 border border-border rounded p-1 text-[10px] font-mono"
        >
          {commLog.length === 0 ? (
            <div className="text-muted-foreground text-center py-2">No messages yet</div>
          ) : (
            commLog.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: entry.type === 'sent' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-1 mb-1 rounded text-xs ${
                  entry.type === 'sent' 
                    ? 'bg-green-500/20 border-l-2 border-green-500 text-right' 
                    : 'bg-blue-500/20 border-l-2 border-blue-500'
                }`}
              >
                <div>{entry.type === 'sent' ? '→' : '←'} {entry.message}</div>
                <div className="text-[8px] text-muted-foreground">
                  {entry.timestamp.toLocaleTimeString()}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Mini Bloch Sphere for Node Panel
function MiniBlochSphere({ node, isPoweredOn }: { node: NodeState; isPoweredOn: boolean }) {
  const size = 100;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;

  const blochX = node.blochVector?.x ?? 0;
  const blochZ = node.blochVector?.z ?? 1;
  
  const vectorX = centerX + blochX * radius;
  const vectorY = centerY - blochZ * radius;
  
  const validX = Math.min(size - 5, Math.max(5, isNaN(vectorX) ? centerX : vectorX));
  const validY = Math.min(size - 5, Math.max(5, isNaN(vectorY) ? centerY : vectorY));

  const twistAngle = (node.twist ?? 0) * 180 / Math.PI;
  const hue = ((twistAngle + 180) % 360);

  return (
    <svg width={size} height={size}>
      {/* Sphere outline */}
      <circle
        cx={centerX}
        cy={centerY}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={1}
        opacity={0.3}
      />
      
      {/* Equator */}
      <ellipse
        cx={centerX}
        cy={centerY}
        rx={radius}
        ry={radius * 0.25}
        fill="none"
        stroke="hsl(var(--muted-foreground))"
        strokeWidth={0.5}
        opacity={0.2}
      />
      
      {/* Axes */}
      <line x1={centerX} y1={centerY - radius} x2={centerX} y2={centerY + radius}
        stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} opacity={0.2} />
      <line x1={centerX - radius} y1={centerY} x2={centerX + radius} y2={centerY}
        stroke="hsl(var(--muted-foreground))" strokeWidth={0.5} opacity={0.2} />
      
      {/* Arrow marker */}
      <defs>
        <marker id={`arrowhead-${node.id}`} markerWidth="6" markerHeight="6" 
          refX="3" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={`hsl(${hue}, 70%, 60%)`} />
        </marker>
      </defs>
      
      {/* Bloch vector */}
      <line
        x1={centerX}
        y1={centerY}
        x2={validX}
        y2={validY}
        stroke={`hsl(${hue}, 70%, 60%)`}
        strokeWidth={2.5}
        markerEnd={`url(#arrowhead-${node.id})`}
      />
      
      {/* Vector endpoint */}
      <motion.circle
        cx={validX}
        cy={validY}
        r={3}
        fill={`hsl(${hue}, 70%, 60%)`}
        stroke="white"
        strokeWidth={1}
        animate={isPoweredOn ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </svg>
  );
}
