import React from 'react';
import { motion } from 'framer-motion';
import MarkdownRenderer from '@/components/MarkdownRenderer';
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
        {/* Input symbols (user messages) */}
        {isUser && message.symbols && message.symbols.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2 justify-end">
            <span className="text-xs text-muted-foreground mr-1">→</span>
            {message.symbols.map((s, i) => (
              <motion.span 
                key={i} 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/20"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                title={s.meaning}
              >
                <span className="text-base">{s.unicode}</span>
                <span className="opacity-80">{s.name}</span>
              </motion.span>
            ))}
          </div>
        )}

        {/* Output symbols (assistant messages) */}
        {!isUser && message.symbols && message.symbols.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            <span className="text-xs text-muted-foreground mr-1">←</span>
            {message.symbols.map((s, i) => (
              <motion.span 
                key={i} 
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/30 text-accent-foreground text-xs border border-accent/30"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                title={s.meaning}
              >
                <span className="text-base">{s.unicode}</span>
                <span className="opacity-80">{s.name}</span>
              </motion.span>
            ))}
            {message.coherence !== undefined && (
              <span className="text-xs text-muted-foreground ml-auto self-center">
                {Math.round(message.coherence * 100)}% coherence
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
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          ) : (
            <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
              <MarkdownRenderer content={message.content} />
              {isStreaming && (
                <motion.span
                  className="inline-block w-2 h-4 ml-1 bg-current"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
}
