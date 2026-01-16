import { Brain, Download, Settings, MessageSquare, Code } from 'lucide-react';
import type { HelpStep } from '@/components/app-help';

export const WEBLLM_HELP: HelpStep[] = [
  {
    title: 'Welcome to WebLLM Chat',
    icon: Brain,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Run large language models directly in your browser using WebGPU. 
          No server needed — everything runs locally on your device!
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">100% Private</span>
            <p className="text-xs text-muted-foreground mt-1">Your data never leaves your device</p>
          </div>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <span className="font-semibold text-primary">WebGPU Powered</span>
            <p className="text-xs text-muted-foreground mt-1">Hardware-accelerated inference</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Model Selection',
    icon: Download,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Choose from a variety of open-source models:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">DeepSeek R1</span>
            <p className="text-xs text-muted-foreground">Reasoning with chain-of-thought</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Llama 3.x</span>
            <p className="text-xs text-muted-foreground">Meta's general-purpose models</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Qwen 2.5/3</span>
            <p className="text-xs text-muted-foreground">Strong multilingual & reasoning</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Phi 3.5</span>
            <p className="text-xs text-muted-foreground">Microsoft's efficient small model</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Models are downloaded once and cached. Larger models need more VRAM.
        </p>
      </div>
    ),
  },
  {
    title: 'Configuration',
    icon: Settings,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Customize model behavior in the settings panel:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">System Prompt</span>
            <p className="text-xs text-muted-foreground">Set the AI's personality and behavior</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Temperature</span>
            <p className="text-xs text-muted-foreground">Creativity vs consistency (0.0–1.0)</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Max Tokens</span>
            <p className="text-xs text-muted-foreground">Maximum response length</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'JSON Mode',
    icon: Code,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Enable structured output for programmatic use:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">JSON Mode Toggle</span>
            <p className="text-xs text-muted-foreground">Force structured JSON responses</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Custom Schema</span>
            <p className="text-xs text-muted-foreground">Define expected output structure</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          JSON responses are syntax-highlighted for easy reading.
        </p>
      </div>
    ),
  },
  {
    title: 'Chat & Performance',
    icon: MessageSquare,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Monitoring your chat session:
        </p>
        <div className="space-y-2 text-sm">
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Streaming</span>
            <p className="text-xs text-muted-foreground">Watch responses appear token-by-token</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Reasoning Display</span>
            <p className="text-xs text-muted-foreground">DeepSeek R1 shows thinking process</p>
          </div>
          <div className="p-2 rounded bg-muted/50">
            <span className="font-semibold">Performance Stats</span>
            <p className="text-xs text-muted-foreground">Tokens/sec, memory usage, inference time</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Use "Clear" to reset the conversation history.
        </p>
      </div>
    ),
  },
];

export const helpSteps = WEBLLM_HELP;
