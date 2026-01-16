import { useState, useRef, useEffect } from 'react';
import { useWebLLM } from '@/hooks/useWebLLM';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Send, 
  Loader2, 
  Download, 
  Trash2, 
  Settings, 
  ChevronDown,
  Brain,
  Cpu,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Code,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DEFAULT_SYSTEM_PROMPT } from '@/lib/webllm/types';

export default function WebLLMChat() {
  const {
    config,
    messages,
    state,
    loadModel,
    sendMessage,
    streamMessage,
    stopGeneration,
    clearMessages,
    updateConfig,
  } = useWebLLM();

  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const [useStreaming, setUseStreaming] = useState(true);
  const [showSettings, setShowSettings] = useState(true);
  const [showReasoning, setShowReasoning] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || state.isGenerating) return;

    const userInput = input.trim();
    setInput('');

    if (useStreaming) {
      setStreamingContent('');
      await streamMessage(userInput, (token) => {
        setStreamingContent(prev => prev + token);
      });
      setStreamingContent('');
    } else {
      await sendMessage(userInput);
    }
  };

  const formatJSON = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return content;
    }
  };

  const isJSON = (str: string) => {
    try {
      JSON.parse(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">WebLLM Chat</h1>
              <p className="text-sm text-muted-foreground">
                Local AI with DeepSeek R1 • Runs in your browser
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {state.modelLoaded ? (
              <Badge variant="outline" className="text-green-500 border-green-500/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Model Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-500 border-yellow-500/30">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Loaded
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Model Loading */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-xs font-mono bg-muted/50 p-2 rounded">
                  {config.modelId}
                </div>
                
                {!state.modelLoaded && (
                  <Button
                    onClick={loadModel}
                    disabled={state.isLoading}
                    className="w-full"
                  >
                    {state.isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Load Model
                      </>
                    )}
                  </Button>
                )}

                {state.loadProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{state.loadProgress.text}</span>
                      <span>{Math.round(state.loadProgress.progress * 100)}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${state.loadProgress.progress * 100}%` }}
                      />
                    </div>
                    {state.loadProgress.timeElapsed && (
                      <p className="text-xs text-muted-foreground text-center">
                        {state.loadProgress.timeElapsed.toFixed(1)}s elapsed
                      </p>
                    )}
                  </div>
                )}

                {state.error && (
                  <div className="p-2 bg-destructive/10 border border-destructive/30 rounded text-xs text-destructive">
                    {state.error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* System Prompt */}
            <Card>
              <Collapsible open={showSettings} onOpenChange={setShowSettings}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        System Prompt
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`} />
                    </CardTitle>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={config.systemPrompt}
                      onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                      placeholder="Enter system prompt..."
                      className="min-h-[200px] text-xs font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateConfig({ systemPrompt: DEFAULT_SYSTEM_PROMPT })}
                      className="w-full"
                    >
                      Reset to Default
                    </Button>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Generation Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generation Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="json-mode" className="text-sm">JSON Mode</Label>
                  <Switch
                    id="json-mode"
                    checked={config.jsonMode}
                    onCheckedChange={(checked) => updateConfig({ jsonMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="streaming" className="text-sm">Streaming</Label>
                  <Switch
                    id="streaming"
                    checked={useStreaming}
                    onCheckedChange={setUseStreaming}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-reasoning" className="text-sm">Show Reasoning</Label>
                  <Switch
                    id="show-reasoning"
                    checked={showReasoning}
                    onCheckedChange={setShowReasoning}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Temperature</Label>
                    <span className="text-muted-foreground">{config.temperature}</span>
                  </div>
                  <Slider
                    value={[config.temperature]}
                    onValueChange={([val]) => updateConfig({ temperature: val })}
                    min={0}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <Label>Max Tokens</Label>
                    <span className="text-muted-foreground">{config.maxTokens}</span>
                  </div>
                  <Slider
                    value={[config.maxTokens]}
                    onValueChange={([val]) => updateConfig({ maxTokens: val })}
                    min={256}
                    max={4096}
                    step={256}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
              <CardHeader className="pb-3 border-b flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Conversation
                  {messages.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {messages.length} messages
                    </Badge>
                  )}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessages}
                  disabled={messages.length === 0}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardHeader>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          {/* Reasoning (for DeepSeek R1) */}
                          {msg.reasoning && showReasoning && (
                            <div className="mb-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs">
                              <div className="flex items-center gap-1 text-yellow-600 mb-1">
                                <Brain className="w-3 h-3" />
                                <span className="font-medium">Thinking...</span>
                              </div>
                              <p className="text-muted-foreground whitespace-pre-wrap">
                                {msg.reasoning}
                              </p>
                            </div>
                          )}

                          {/* Content */}
                          {msg.role === 'assistant' && isJSON(msg.content) ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Code className="w-3 h-3" />
                                <span>JSON Response</span>
                              </div>
                              <pre className="text-xs font-mono bg-background/50 p-2 rounded overflow-x-auto">
                                {formatJSON(msg.content)}
                              </pre>
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          )}

                          {/* Timestamp */}
                          {msg.timestamp && (
                            <p className="text-[10px] opacity-50 mt-1">
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Streaming content */}
                  {streamingContent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="max-w-[85%] rounded-lg p-3 bg-muted">
                        {isJSON(streamingContent) ? (
                          <pre className="text-xs font-mono">{formatJSON(streamingContent)}</pre>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                        )}
                        <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                      </div>
                    </motion.div>
                  )}

                  {/* Loading indicator */}
                  {state.isGenerating && !streamingContent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </motion.div>
                  )}

                  <div ref={chatEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={state.modelLoaded ? "Type your message..." : "Load model first..."}
                    disabled={!state.modelLoaded || state.isGenerating}
                    className="flex-1"
                  />
                  {state.isGenerating ? (
                    <Button type="button" variant="destructive" onClick={stopGeneration}>
                      Stop
                    </Button>
                  ) : (
                    <Button type="submit" disabled={!state.modelLoaded || !input.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  )}
                </form>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
