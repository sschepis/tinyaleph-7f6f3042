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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Highlight, themes } from 'prism-react-renderer';
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
  MessageSquare,
  Gauge,
  Timer,
  Zap,
  HardDrive,
  FileJson,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DEFAULT_SYSTEM_PROMPT, 
  DEFAULT_JSON_SCHEMA, 
  AVAILABLE_MODELS,
  ModelOption 
} from '@/lib/webllm/types';

// JSON Syntax Highlighting component
function JSONHighlight({ code }: { code: string }) {
  return (
    <Highlight theme={themes.nightOwl} code={code} language="json">
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre 
          className="text-xs font-mono bg-background/50 p-2 rounded overflow-x-auto"
          style={{ ...style, background: 'transparent' }}
        >
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Highlight>
  );
}

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
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState(config.modelId);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const userScrolledUpRef = useRef(false);

  // Track if user has scrolled up (to prevent hijacking their scroll)
  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    // Consider "at bottom" if within 100px of the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    userScrolledUpRef.current = !isAtBottom;
  };

  // Auto-scroll to bottom only if user hasn't scrolled up
  useEffect(() => {
    if (!userScrolledUpRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingContent]);

  // Reset scroll lock when generation completes
  useEffect(() => {
    if (!state.isGenerating) {
      userScrolledUpRef.current = false;
    }
  }, [state.isGenerating]);

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

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId);
    if (state.modelLoaded && modelId !== config.modelId) {
      // Model will be loaded when user clicks the load button
    }
    updateConfig({ modelId });
  };

  const handleSchemaChange = (schema: string) => {
    setSchemaError(null);
    if (schema.trim()) {
      try {
        JSON.parse(schema);
        updateConfig({ jsonSchema: schema });
      } catch (e) {
        setSchemaError('Invalid JSON schema');
      }
    } else {
      updateConfig({ jsonSchema: null });
    }
  };

  const formatJSON = (content: string): string => {
    try {
      // First try direct parse
      const parsed = JSON.parse(content);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Try to extract JSON from markdown code blocks
      const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        try {
          const parsed = JSON.parse(codeBlockMatch[1].trim());
          return JSON.stringify(parsed, null, 2);
        } catch {
          // Fall through
        }
      }
      
      // Try to find JSON object/array in the string
      const jsonMatch = content.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          return JSON.stringify(parsed, null, 2);
        } catch {
          // Fall through
        }
      }
      
      return content;
    }
  };

  const isJSON = (str: string): boolean => {
    if (!str || str.trim().length === 0) return false;
    
    const trimmed = str.trim();
    
    // Quick check: must start with { or [
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
      // Check for markdown code blocks with JSON
      if (trimmed.includes('```json') || trimmed.includes('```\n{')) {
        const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          try {
            JSON.parse(match[1].trim());
            return true;
          } catch {
            return false;
          }
        }
      }
      return false;
    }
    
    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  };

  const selectedModel = AVAILABLE_MODELS.find(m => m.id === selectedModelId);
  const groupedModels = AVAILABLE_MODELS.reduce((acc, model) => {
    if (!acc[model.family]) acc[model.family] = [];
    acc[model.family].push(model);
    return acc;
  }, {} as Record<string, ModelOption[]>);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">WebLLM Chat</h1>
              <p className="text-sm text-muted-foreground">
                Local AI • Runs entirely in your browser
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
            {/* Model Selection & Loading */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  Model Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedModelId} onValueChange={handleModelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent className="max-h-80">
                    {Object.entries(groupedModels).map(([family, models]) => (
                      <div key={family}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                          {family}
                        </div>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex items-center gap-2">
                              <span>{model.name}</span>
                              <span className="text-xs text-muted-foreground">({model.size})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>

                {selectedModel && (
                  <div className="p-2 bg-muted/50 rounded text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{selectedModel.size}</span>
                    </div>
                    <p className="text-muted-foreground">{selectedModel.description}</p>
                  </div>
                )}
                
                <Button
                  onClick={() => loadModel(selectedModelId)}
                  disabled={state.isLoading}
                  className="w-full"
                  variant={state.modelLoaded && selectedModelId === config.modelId ? "secondary" : "default"}
                >
                  {state.isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : state.modelLoaded && selectedModelId === config.modelId ? (
                    <>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reload Model
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Load Model
                    </>
                  )}
                </Button>

                {state.loadProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="truncate max-w-[70%]">{state.loadProgress.text}</span>
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

            {/* Performance Stats */}
            {state.performanceStats && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Zap className="w-3 h-3" />
                        Tokens/sec
                      </div>
                      <p className="text-lg font-bold text-primary">
                        {state.performanceStats.tokensPerSecond}
                      </p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Timer className="w-3 h-3" />
                        Inference
                      </div>
                      <p className="text-lg font-bold">
                        {(state.performanceStats.inferenceTimeMs / 1000).toFixed(1)}s
                      </p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MessageSquare className="w-3 h-3" />
                        Tokens
                      </div>
                      <p className="text-sm font-medium">
                        <span className="text-muted-foreground">{state.performanceStats.promptTokens}</span>
                        <span className="mx-1">→</span>
                        <span className="text-primary">{state.performanceStats.completionTokens}</span>
                      </p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <HardDrive className="w-3 h-3" />
                        Memory
                      </div>
                      <p className="text-sm font-medium">
                        {state.performanceStats.memoryUsedMB 
                          ? `${state.performanceStats.memoryUsedMB} MB`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                    Model loaded in {(state.performanceStats.loadTimeMs / 1000).toFixed(1)}s
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Configuration Tabs */}
            <Card>
              <Tabs defaultValue="prompt" className="w-full">
                <CardHeader className="pb-2">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="prompt" className="text-xs">
                      <Settings className="w-3 h-3 mr-1" />
                      Prompt
                    </TabsTrigger>
                    <TabsTrigger value="schema" className="text-xs">
                      <FileJson className="w-3 h-3 mr-1" />
                      Schema
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <TabsContent value="prompt" className="mt-0">
                  <CardContent className="space-y-4 pt-2">
                    <Textarea
                      value={config.systemPrompt}
                      onChange={(e) => updateConfig({ systemPrompt: e.target.value })}
                      placeholder="Enter system prompt..."
                      className="min-h-[180px] text-xs font-mono"
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
                </TabsContent>

                <TabsContent value="schema" className="mt-0">
                  <CardContent className="space-y-4 pt-2">
                    <div className="text-xs text-muted-foreground mb-2">
                      Define a JSON schema for structured responses. The model will attempt to match this format.
                    </div>
                    <Textarea
                      value={config.jsonSchema || ''}
                      onChange={(e) => handleSchemaChange(e.target.value)}
                      placeholder="Enter JSON schema (optional)..."
                      className={`min-h-[160px] text-xs font-mono ${schemaError ? 'border-destructive' : ''}`}
                    />
                    {schemaError && (
                      <p className="text-xs text-destructive">{schemaError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSchemaChange(DEFAULT_JSON_SCHEMA)}
                        className="flex-1"
                      >
                        Use Example
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          updateConfig({ jsonSchema: null });
                          setSchemaError(null);
                        }}
                        className="flex-1"
                      >
                        Clear
                      </Button>
                    </div>
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>

            {/* Generation Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Generation
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

              <ScrollArea 
                className="flex-1 p-4" 
                ref={chatContainerRef}
                onScrollCapture={handleChatScroll}
              >
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
                              <JSONHighlight code={formatJSON(msg.content)} />
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
                          <JSONHighlight code={formatJSON(streamingContent)} />
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
                {state.modelLoaded && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Using {AVAILABLE_MODELS.find(m => m.id === config.modelId)?.name || config.modelId}
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
