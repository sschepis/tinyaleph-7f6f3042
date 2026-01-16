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
}

export interface ModelLoadProgress {
  progress: number;
  text: string;
  timeElapsed?: number;
}

export interface WebLLMState {
  isLoading: boolean;
  isGenerating: boolean;
  loadProgress: ModelLoadProgress | null;
  error: string | null;
  modelLoaded: boolean;
}

export const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI assistant. When JSON mode is enabled, always respond with valid JSON objects.

For structured responses, use this format:
{
  "response": "your main response text",
  "confidence": 0.0-1.0,
  "topics": ["relevant", "topics"],
  "followUp": "optional follow-up question"
}`;

export const DEFAULT_CONFIG: WebLLMConfig = {
  modelId: 'DeepSeek-R1-Distill-Qwen-7B-q4f32_1-MLC',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
  maxTokens: 2048,
  jsonMode: true,
};
