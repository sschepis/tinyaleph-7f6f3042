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

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. You ALWAYS respond with valid JSON objects matching the specified schema.

Your responses must follow this exact structure:
{
  "response": "your main response text here",
  "confidence": 0.85,
  "topics": ["topic1", "topic2"],
  "followUp": "optional follow-up question or null"
}

Rules:
- "response" (required): Your complete answer as a string
- "confidence" (required): A number between 0.0 and 1.0 indicating your certainty
- "topics" (required): An array of 1-5 relevant topic strings
- "followUp" (optional): A suggested follow-up question, or null

Always output valid JSON. Do not include any text outside the JSON object.`;

export const DEFAULT_JSON_SCHEMA = `{
  "type": "object",
  "properties": {
    "response": {
      "type": "string",
      "description": "The main response text"
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Confidence level from 0.0 to 1.0"
    },
    "topics": {
      "type": "array",
      "items": { "type": "string" },
      "minItems": 1,
      "maxItems": 5,
      "description": "List of relevant topics"
    },
    "followUp": {
      "type": ["string", "null"],
      "description": "Optional follow-up question"
    }
  },
  "required": ["response", "confidence", "topics"],
  "additionalProperties": false
}`;

export const DEFAULT_CONFIG: WebLLMConfig = {
  modelId: 'DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
  maxTokens: 2048,
  jsonMode: true,
  jsonSchema: DEFAULT_JSON_SCHEMA,
};
