import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ConsciousnessMessage, PerspectiveType } from '@/lib/consciousness-resonator/types';
import { AssistantMessage } from '@/components/AssistantMessage';

interface ChatInterfaceProps {
  messages: ConsciousnessMessage[];
  isProcessing: boolean;
  activePerspective: PerspectiveType | null;
  onSendMessage: (message: string) => void;
}

export function ChatInterface({
  messages,
  isProcessing,
  activePerspective,
  onSendMessage
}: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <section className="bg-black/50 border border-gray-500/60 rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-300">Conscious Observer Layer</h2>
      
      <div 
        ref={chatContainerRef}
        className="h-64 overflow-y-auto mb-4 bg-secondary/20 rounded-lg p-4 space-y-3"
      >
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'user' ? (
              <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md bg-primary/80 text-primary-foreground text-sm">
                {message.content}
              </div>
            ) : message.role === 'system' ? (
              <div className="max-w-[90%] px-4 py-2 rounded-lg bg-muted/50 border border-border/50 text-muted-foreground text-xs italic">
                {message.content}
              </div>
            ) : (
              <div className={`
                max-w-[90%] rounded-2xl rounded-bl-md overflow-hidden
                bg-card/80 border border-border/30
                ${isProcessing && message === messages[messages.length - 1] ? 'animate-pulse' : ''}
              `}>
                {/* Perspective header */}
                {message.perspective && (
                  <div className="px-4 py-2 bg-accent/20 border-b border-border/30 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-medium text-accent capitalize">
                      {message.perspective} Perspective
                    </span>
                  </div>
                )}
                
                {/* Message content */}
                <div className="px-4 py-3 text-sm text-foreground/90 prose prose-invert prose-sm max-w-none
                  prose-headings:text-accent prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-2
                  prose-p:my-2 prose-p:leading-relaxed
                  prose-ul:my-2 prose-ul:pl-4 prose-li:my-0.5
                  prose-strong:text-accent prose-strong:font-semibold
                  prose-em:text-muted-foreground">
                  <AssistantMessage content={message.content} showCopyButton={true} />
                </div>
                
                {/* Thinking indicator */}
                {isProcessing && message === messages[messages.length - 1] && (
                  <div className="px-4 py-2 border-t border-border/30 flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 bg-accent rounded-full"
                        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-2">Processing...</span>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={activePerspective ? "Enter your query..." : "Select a perspective node first..."}
          disabled={isProcessing || !activePerspective}
          className="flex-1 bg-secondary/30 border-border"
        />
        <Button 
          type="submit" 
          disabled={isProcessing || !input.trim() || !activePerspective}
          className="px-6"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </section>
  );
}
