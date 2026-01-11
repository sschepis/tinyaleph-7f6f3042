import React from 'react';
import { motion } from 'framer-motion';
import type { Message } from '@/lib/symbolic-mind/types';

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming = false }: ChatMessageProps) {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Symbols indicator */}
        {message.symbols && message.symbols.length > 0 && (
          <div className={`flex gap-1 mb-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {message.symbols.map((s, i) => (
              <span 
                key={i} 
                className="text-sm opacity-70"
                title={`${s.name}: ${s.meaning}`}
              >
                {s.unicode}
              </span>
            ))}
            {message.coherence !== undefined && (
              <span className="text-xs text-muted-foreground ml-1">
                ({Math.round(message.coherence * 100)}%)
              </span>
            )}
          </div>
        )}
        
        {/* Message bubble */}
        <div
          className={`
            px-4 py-3 rounded-2xl
            ${isUser 
              ? 'bg-primary text-primary-foreground rounded-br-md' 
              : 'bg-muted/60 text-foreground rounded-bl-md border border-border/30'}
          `}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
            {isStreaming && (
              <motion.span
                className="inline-block w-2 h-4 ml-1 bg-current"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </p>
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}
