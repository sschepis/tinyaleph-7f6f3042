/**
 * Unified AI client for all AI-powered features.
 * Provides consistent error handling, retry logic, and streaming support.
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIInvokeOptions {
  maxRetries?: number;
  baseDelay?: number;
  showToasts?: boolean;
}

export interface AIResponse<T = unknown> {
  data: T | null;
  error: Error | null;
}

export interface StreamCallbacks {
  onDelta: (content: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}

// Error messages for user-friendly display
const ERROR_MESSAGES: Record<number, string> = {
  429: '⏳ Rate limit exceeded. Please wait a moment before trying again.',
  402: '💳 Usage credits exhausted. Please add credits to continue.',
  400: '⚠️ Invalid request. Please check your input.',
  500: '🔧 Server error. Please try again in a moment.',
  502: '🔧 AI service temporarily unavailable. Please try again.',
  503: '🔧 Service temporarily unavailable. Please try again later.',
};

/**
 * Format error for display
 */
function formatError(error: unknown): string {
  if (!error) return 'An unknown error occurred.';
  
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('network') || error.name === 'TypeError') {
      return '🌐 Network error. Please check your connection and try again.';
    }
    // Timeout
    if (error.message.includes('timeout')) {
      return '⏱️ Request timed out. Please try again.';
    }
    return `❌ ${error.message}`;
  }
  
  // Handle response-like errors
  const status = (error as { status?: number }).status;
  if (status && ERROR_MESSAGES[status]) {
    return ERROR_MESSAGES[status];
  }
  
  return '❌ An unexpected error occurred.';
}

/**
 * Check if error is retryable
 */
function isRetryable(error: unknown): boolean {
  if (!error) return false;
  
  const status = (error as { status?: number }).status;
  // Don't retry client errors except rate limits
  if (status && status >= 400 && status < 500 && status !== 429) {
    return false;
  }
  
  return true;
}

/**
 * Sleep with exponential backoff and jitter
 */
function backoffDelay(attempt: number, baseDelay: number): Promise<void> {
  const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 500;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Invoke a Supabase function with retry and error handling.
 * Works for non-streaming responses.
 */
export async function invokeAI<T = unknown>(
  functionName: string,
  body: Record<string, unknown>,
  options: AIInvokeOptions = {}
): Promise<AIResponse<T>> {
  const { maxRetries = 3, baseDelay = 1000, showToasts = true } = options;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await supabase.functions.invoke(functionName, { body });
      
      if (!result.error) {
        return { data: result.data as T, error: null };
      }
      
      // Don't retry non-retryable errors
      if (!isRetryable(result.error)) {
        const message = formatError(result.error);
        if (showToasts) toast.error(message);
        return { data: null, error: new Error(message) };
      }
      
      lastError = result.error as Error;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (!isRetryable(err)) {
        const message = formatError(err);
        if (showToasts) toast.error(message);
        return { data: null, error: new Error(message) };
      }
    }
    
    // Wait before retry
    if (attempt < maxRetries - 1) {
      await backoffDelay(attempt, baseDelay);
    }
  }
  
  const message = formatError(lastError);
  if (showToasts) toast.error(message);
  return { data: null, error: lastError };
}

/**
 * Stream AI response from a Supabase function.
 * Handles SSE parsing, retries, and error handling.
 */
export async function streamAI(
  functionName: string,
  body: Record<string, unknown>,
  callbacks: StreamCallbacks,
  options: AIInvokeOptions = {}
): Promise<void> {
  const { maxRetries = 3, baseDelay = 1000, showToasts = true } = options;
  const { onDelta, onDone, onError } = callbacks;
  
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      });
      
      // Handle HTTP errors
      if (!response.ok) {
        const status = response.status;
        
        // Non-retryable errors
        if (status >= 400 && status < 500 && status !== 429) {
          const message = ERROR_MESSAGES[status] || `Request failed with status ${status}`;
          if (showToasts) toast.error(message);
          onError?.(new Error(message));
          onDone();
          return;
        }
        
        // Retryable error
        lastError = new Error(`HTTP ${status}`);
        if (attempt < maxRetries - 1) {
          await backoffDelay(attempt, baseDelay);
          continue;
        }
      }
      
      // Handle missing body
      if (!response.body) {
        throw new Error('No response body');
      }
      
      // Stream the response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        // Process line-by-line
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          
          // Handle CRLF
          if (line.endsWith('\r')) line = line.slice(0, -1);
          
          // Skip SSE comments and empty lines
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            onDone();
            return;
          }
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            // Incomplete JSON - put it back and wait for more
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }
      
      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) onDelta(content);
          } catch {
            // Ignore partial leftovers
          }
        }
      }
      
      onDone();
      return;
      
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      
      if (!isRetryable(err) || attempt >= maxRetries - 1) {
        const message = formatError(lastError);
        if (showToasts) toast.error(message);
        onError?.(lastError);
        onDone();
        return;
      }
      
      await backoffDelay(attempt, baseDelay);
    }
  }
  
  // All retries exhausted
  const message = formatError(lastError);
  if (showToasts) toast.error(message);
  onError?.(lastError || new Error('Request failed'));
  onDone();
}

/**
 * Convenience function for aleph-chat (non-streaming)
 */
export async function invokeAlephChat(
  messages: AIMessage[],
  temperature = 0.7,
  options?: AIInvokeOptions
) {
  return invokeAI<{
    content: string;
    semantic: {
      user: { primes: number[]; entropy: number; coherence: number };
      response: { primes: number[]; entropy: number; coherence: number };
      crossCoherence: number;
    };
    usage: Record<string, unknown>;
  }>('aleph-chat', { messages, temperature }, options);
}

/**
 * Convenience function for symbolic-mind streaming
 */
export async function streamSymbolicMind(
  params: {
    userMessage: string;
    symbolicOutput: unknown[];
    anchoringSymbols: unknown[];
    coherenceScore: number;
    conversationHistory?: Array<{ role: string; content: string }>;
    systemPromptOverride?: string;
    somaticState?: {
      feltSense: string;
      nervousSystemBalance: number;
      dominantRegions: Array<{ region: string; intensity: number }>;
      activeSensations: Array<{ sensation: string; intensity: string }>;
      overallIntensity: number;
    };
  },
  callbacks: StreamCallbacks,
  options?: AIInvokeOptions
) {
  return streamAI('symbolic-mind', params, callbacks, options);
}
