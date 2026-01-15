import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, RotateCcw, MessageCircle } from 'lucide-react';
import type { ChatMessage, SephirahName } from '@/lib/sephirotic-oscillator/types';
import { SEPHIROT } from '@/lib/sephirotic-oscillator/tree-config';

interface OracleChatProps {
  messages: ChatMessage[];
  isProcessing: boolean;
  onSendMessage: (content: string) => void;
  onReset: () => void;
}

// Typing indicator component
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-secondary/60 rounded-lg inline-block">
      <span className="text-xs text-muted-foreground mr-2">Channeling</span>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary/70 rounded-full"
          animate={{
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
}

// Conversation starters
const CONVERSATION_STARTERS = [
  { label: 'Purpose', message: 'What is the nature of my true purpose in life?' },
  { label: 'Balance', message: 'How can I find balance between mercy and severity?' },
  { label: 'Shadow', message: 'How do I integrate my shadow self?' },
  { label: 'Wisdom', message: 'What wisdom do I need to embrace at this moment?' },
];

export function OracleChat({
  messages,
  isProcessing,
  onSendMessage,
  onReset
}: OracleChatProps) {
  const [input, setInput] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isProcessing) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const showStarters = messages.length <= 1;

  return (
    <div className="bg-black/60 border border-primary/30 rounded-lg flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-primary">Tree Oracle</h3>
        </div>
        {messages.length > 1 && (
          <button
            onClick={onReset}
            disabled={isProcessing}
            className="flex items-center gap-1.5 text-xs px-2 py-1 rounded bg-secondary/30 hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RotateCcw className="w-3 h-3" />
            New
          </button>
        )}
      </div>

      {/* Messages */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {showStarters ? (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              Ask the Tree for guidance, or choose a starting question
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CONVERSATION_STARTERS.map((starter) => (
                <motion.button
                  key={starter.label}
                  onClick={() => onSendMessage(starter.message)}
                  disabled={isProcessing}
                  className="p-2 rounded border border-primary/30 bg-primary/5 hover:bg-primary/10 text-left transition-colors disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-xs font-medium text-primary">{starter.label}</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">
                    {starter.message}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${message.role === 'user' ? 'text-right' : 'text-left'} animate-fade-in`}
              >
                <div
                  className={`
                    inline-block max-w-[90%] px-3 py-2 rounded-lg text-sm
                    ${message.role === 'user' 
                      ? 'bg-primary/80 text-primary-foreground' 
                      : message.role === 'system'
                        ? 'bg-muted/80 text-muted-foreground text-xs'
                        : 'bg-secondary/80 text-foreground'}
                  `}
                >
                  {message.role === 'user' && message.activatedSephirot && message.activatedSephirot.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1 justify-end">
                      {message.activatedSephirot.map(id => (
                        <span
                          key={id}
                          className="text-[9px] px-1 py-0.5 rounded"
                          style={{
                            backgroundColor: `${SEPHIROT[id].color}30`,
                            color: SEPHIROT[id].color
                          }}
                        >
                          {SEPHIROT[id].name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={message.role === 'assistant' ? 'prose prose-invert prose-sm max-w-none' : ''}>
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="text-left animate-fade-in">
                <TypingIndicator />
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-border/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the Tree..."
            disabled={isProcessing}
            className="flex-1 bg-secondary/30 border border-primary/30 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
