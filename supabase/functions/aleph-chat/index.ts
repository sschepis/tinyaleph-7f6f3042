import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';

// Minimal vocabulary for semantic encoding (same as frontend config)
const vocabulary: Record<string, number[]> = {
  "love": [2, 3, 5], "affection": [2, 3, 7], "wisdom": [7, 11, 13], 
  "truth": [17, 19, 23], "honesty": [17, 19, 29], "harmony": [29, 31, 37],
  "power": [41, 43, 47], "life": [53, 59, 61], "death": [67, 71, 73],
  "creation": [79, 83, 89], "destruction": [97, 101, 103], "knowledge": [107, 109, 113],
  "ignorance": [127, 131, 137], "light": [139, 149, 151], "darkness": [157, 163, 167],
  "order": [173, 179, 181], "chaos": [191, 193, 197], "peace": [199, 211, 223],
  "conflict": [227, 229, 233], "hope": [239, 241, 251], "fear": [257, 263, 269],
  "spirit": [271, 277, 281], "mind": [283, 293, 307], "body": [311, 313, 317],
  "cat": [331, 337, 347], "dog": [349, 353, 359], "bird": [367, 373, 379], "fish": [383, 389, 397],
  "soul": [2, 7, 17], "essence": [3, 11, 19], "unity": [5, 13, 23],
  "duality": [7, 17, 29], "eternity": [11, 19, 31], "infinity": [13, 23, 37],
  "beauty": [17, 29, 41], "justice": [19, 31, 43], "mercy": [23, 37, 47],
  "science": [29, 41, 53], "philosophy": [31, 43, 59], "art": [37, 47, 61],
  "hello": [2, 5, 11], "world": [3, 7, 13], "help": [5, 11, 17], "thank": [7, 13, 19], "please": [11, 17, 23],
};

// Encode text to prime array
function encodeText(text: string): number[] {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
  const primes: number[] = [];
  for (const word of words) {
    if (vocabulary[word]) {
      primes.push(...vocabulary[word]);
    }
  }
  return primes;
}

// Create sedenion state from primes
function primesToState(primes: number[]): number[] {
  const components = Array(16).fill(0);
  for (const p of primes) {
    const idx = p % 16;
    components[idx] += 1 / Math.sqrt(p);
  }
  // Normalize
  const norm = Math.sqrt(components.reduce((s, c) => s + c * c, 0));
  if (norm > 0) {
    for (let i = 0; i < 16; i++) components[i] /= norm;
  }
  return components;
}

// Calculate entropy of state
function entropy(components: number[]): number {
  const n = Math.sqrt(components.reduce((s, c) => s + c * c, 0));
  if (n === 0) return 0;
  const probs = components.map(c => (c * c) / (n * n));
  return -probs.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);
}

// Calculate coherence
function coherence(components: number[]): number {
  const maxEntropy = Math.log2(components.length);
  const e = entropy(components);
  return maxEntropy > 0 ? 1 - e / maxEntropy : 1;
}

// Semantic coherence between two states
function semanticCoherence(a: number[], b: number[]): number {
  const dot = a.reduce((s, v, i) => s + v * (b[i] || 0), 0);
  const normA = Math.sqrt(a.reduce((s, c) => s + c * c, 0));
  const normB = Math.sqrt(b.reduce((s, c) => s + c * c, 0));
  if (normA === 0 || normB === 0) return 0;
  return Math.abs(dot) / (normA * normB);
}

// Build system prompt with semantic context
function buildSystemPrompt(semanticContext: {
  userPrimes: number[];
  userState: number[];
  userEntropy: number;
  userCoherence: number;
}): string {
  const { userPrimes, userState, userEntropy, userCoherence } = semanticContext;
  
  // Find dominant semantic axes
  const dominantAxes = userState
    .map((v, i) => ({ index: i, value: Math.abs(v) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);
  
  return `You are Aleph, a semantic AI assistant powered by tinyaleph's hypercomplex algebra engine.

Your responses are grounded in prime-based meaning representation. The user's message has been encoded:
- Prime signature: [${userPrimes.slice(0, 10).join(', ')}${userPrimes.length > 10 ? '...' : ''}]
- Semantic entropy: ${userEntropy.toFixed(3)} (${userEntropy < 1.5 ? 'focused' : userEntropy < 2.5 ? 'moderate' : 'dispersed'})
- Coherence: ${userCoherence.toFixed(3)} (${userCoherence > 0.7 ? 'high' : userCoherence > 0.4 ? 'medium' : 'low'})
- Dominant semantic axes: ${dominantAxes.map(a => `e${a.index}`).join(', ')}

Guidelines:
1. Respond naturally and helpfully while being aware of the semantic structure
2. When discussing concepts like love, wisdom, truth etc., you can reference their prime signatures
3. Keep responses concise but insightful
4. You can explain how the prime algebra works if asked
5. Be warm, thoughtful, and engage with the meaning behind the words`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, temperature = 0.7 } = await req.json();
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get the latest user message for semantic analysis
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    const userText = lastUserMessage?.content || '';
    
    // Semantic encoding
    const userPrimes = encodeText(userText);
    const userState = primesToState(userPrimes);
    const userEntropy = entropy(userState);
    const userCoherence = coherence(userState);
    
    console.log('Semantic analysis:', { 
      text: userText.slice(0, 50),
      primeCount: userPrimes.length,
      entropy: userEntropy,
      coherence: userCoherence
    });

    // Build enhanced messages with semantic system prompt
    const systemPrompt = buildSystemPrompt({
      userPrimes,
      userState,
      userEntropy,
      userCoherence
    });

    const enhancedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    // Call Lovable AI
    const response = await fetch(LOVABLE_AI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: enhancedMessages,
        temperature,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantContent = data.choices?.[0]?.message?.content || '';

    // Encode response for semantic metadata
    const responsePrimes = encodeText(assistantContent);
    const responseState = primesToState(responsePrimes);
    const responseEntropy = entropy(responseState);
    const responseCoherence = coherence(responseState);
    const crossCoherence = semanticCoherence(userState, responseState);

    return new Response(
      JSON.stringify({
        content: assistantContent,
        semantic: {
          user: {
            primes: userPrimes.slice(0, 20),
            entropy: userEntropy,
            coherence: userCoherence,
          },
          response: {
            primes: responsePrimes.slice(0, 20),
            entropy: responseEntropy,
            coherence: responseCoherence,
          },
          crossCoherence,
        },
        usage: data.usage,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in aleph-chat:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
