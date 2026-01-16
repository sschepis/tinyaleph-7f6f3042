import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ConsciousnessMessage, PerspectiveType } from '@/lib/consciousness-resonator/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
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
            className={`${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`
                inline-block max-w-[85%] px-4 py-2 rounded-lg text-sm
                ${message.role === 'user' 
                  ? 'bg-blue-500/80 text-white' 
                  : message.role === 'system'
                    ? 'bg-gray-600/80 text-white'
                    : 'bg-gray-700/80 text-white'}
                ${isProcessing && message.role === 'assistant' && message === messages[messages.length - 1]
                  ? 'animate-pulse'
                  : ''}
              `}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-invert prose-sm max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_pre]:bg-black/50 [&_code]:bg-black/30 [&_code]:px-1 [&_code]:rounded">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: message.content }} />
              )}
              
              {/* Thinking indicator */}
              {isProcessing && message.role === 'assistant' && message === messages[messages.length - 1] && (
                <span className="inline-flex ml-2">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 bg-white rounded-full mx-0.5"
                      animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </span>
              )}
            </div>
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
