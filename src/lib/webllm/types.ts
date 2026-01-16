export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  reasoning?: string; // For DeepSeek R1's thinking process
}

export interface WebLLMConfig {
  modelId: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  jsonMode: boolean;
  jsonSchema: string | null; // Custom JSON schema
}

export interface ModelLoadProgress {
  progress: number;
  text: string;
  timeElapsed?: number;
}

export interface PerformanceStats {
  tokensPerSecond: number;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  inferenceTimeMs: number;
  loadTimeMs: number;
  memoryUsedMB: number | null;
}

export interface WebLLMState {
  isLoading: boolean;
  isGenerating: boolean;
  loadProgress: ModelLoadProgress | null;
  error: string | null;
  modelLoaded: boolean;
  performanceStats: PerformanceStats | null;
}

export interface ModelOption {
  id: string;
  name: string;
  size: string;
  family: string;
  description: string;
}

// Available models - curated list of popular options
export const AVAILABLE_MODELS: ModelOption[] = [
  // DeepSeek R1 Series
  {
    id: 'DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC',
    name: 'DeepSeek R1 Distill Qwen 7B',
    size: '~4GB',
    family: 'DeepSeek',
    description: 'Reasoning model with chain-of-thought capabilities',
  },
  {
    id: 'DeepSeek-R1-Distill-Qwen-1.5B-q4f16_1-MLC',
    name: 'DeepSeek R1 Distill Qwen 1.5B',
    size: '~1GB',
    family: 'DeepSeek',
    description: 'Smaller reasoning model, faster inference',
  },
  // Llama Series
  {
    id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.2 3B Instruct',
    size: '~2GB',
    family: 'Llama',
    description: 'Meta\'s latest compact model with strong instruction following',
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    name: 'Llama 3.1 8B Instruct',
    size: '~4.5GB',
    family: 'Llama',
    description: 'Powerful general-purpose model',
  },
  // Mistral Series
  {
    id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC',
    name: 'Mistral 7B Instruct v0.3',
    size: '~4GB',
    family: 'Mistral',
    description: 'Excellent for creative and analytical tasks',
  },
  // Phi Series
  {
    id: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
    name: 'Phi 3.5 Mini Instruct',
    size: '~2GB',
    family: 'Phi',
    description: 'Microsoft\'s efficient small model',
  },
  {
    id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
    name: 'Phi 3 Mini 4K',
    size: '~2GB',
    family: 'Phi',
    description: 'Compact but capable reasoning model',
  },
  // Qwen Series
  {
    id: 'Qwen3-8B-q4f16_1-MLC',
    name: 'Qwen3 8B',
    size: '~5GB',
    family: 'Qwen',
    description: 'Alibaba\'s latest reasoning model with hybrid thinking',
  },
  {
    id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 3B Instruct',
    size: '~2GB',
    family: 'Qwen',
    description: 'Alibaba\'s efficient multilingual model',
  },
  {
    id: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    name: 'Qwen 2.5 7B Instruct',
    size: '~4GB',
    family: 'Qwen',
    description: 'Strong reasoning and coding capabilities',
  },
  // SmolLM (tiny models)
  {
    id: 'SmolLM2-1.7B-Instruct-q4f16_1-MLC',
    name: 'SmolLM2 1.7B Instruct',
    size: '~1GB',
    family: 'SmolLM',
    description: 'Hugging Face\'s tiny but capable model',
  },
];

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful assistant.

You MUST reply with a single valid JSON object and nothing else.

The JSON object must match this shape:
{
  "response": string,          // your actual answer to the user
  "confidence": number,        // 0.0 to 1.0
  "topics": string[],          // 0-5 short topic tags
  "followUp"?: string          // optional: a short follow-up question
}

Rules:
- Write the user's requested answer in "response" (do NOT describe what the user asked).
- Respond in the SAME language as the user's last message.
- "topics" may be an empty array if no clear topics.
- If you include "followUp", it must be a string (omit the field if none).

Return JSON only (no markdown, no code fences, no extra text).`;

export const DEFAULT_JSON_SCHEMA = `{
  "type": "object",
  "properties": {
    "response": {
      "type": "string"
    },
    "confidence": {
      "type": "number"
    },
    "topics": {
      "type": "array",
      "items": { "type": "string" }
    },
    "followUp": {
      "type": "string"
    }
  },
  "required": ["response", "confidence", "topics"]
}`;

export const DEFAULT_CONFIG: WebLLMConfig = {
  modelId: 'DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC',
  systemPrompt: 'You are a helpful assistant. Respond naturally and conversationally.',
  temperature: 0.7,
  maxTokens: 2048,
  jsonMode: false,
  jsonSchema: null,
};
