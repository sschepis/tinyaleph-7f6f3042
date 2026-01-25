import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from '../_shared/cors.ts';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

interface LearningRequest {
  type: 'define_symbol' | 'find_relationship' | 'expand_concept' | 'generate_examples';
  context: {
    knownSymbols?: Array<{ prime: number; meaning: string }>;
    targetPrime?: number;
    concepts?: string[];
    question?: string;
  };
}

interface SymbolDefinition {
  prime: number;
  meaning: string;
  category?: string;
  relatedConcepts: string[];
  examples: string[];
  confidence: number;
}

interface Relationship {
  primeA: number;
  primeB: number;
  relationshipType: 'similar' | 'opposite' | 'contains' | 'part_of' | 'transforms_to' | 'resonates_with';
  strength: number;
  explanation: string;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  
  if (!checkRateLimit(clientIP)) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded" }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const request = body as LearningRequest;
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";
    let responseSchema: any = null;

    const knownSymbolsContext = request.context.knownSymbols?.slice(0, 20)
      .map(s => `Prime ${s.prime}: "${s.meaning}"`)
      .join('\n') || 'None provided';

    switch (request.type) {
      case 'define_symbol':
        systemPrompt = `You are a semantic symbol teacher for a prime-based symbolic AI system.

The system maps prime numbers to archetypal meanings. Your role is to help define or clarify meanings for primes based on their mathematical and philosophical properties.

Known symbols in the system:
${knownSymbolsContext}

Guidelines:
- Meanings should be 1-3 words, archetypal and universal
- Consider the prime's numerical properties (small primes = fundamental, larger = complex combinations)
- Twin primes often represent dualities
- Primes that differ by 6 often relate to transformation
- Consider how the meaning relates to existing symbols`;

        userPrompt = request.context.targetPrime 
          ? `Define a meaning for prime ${request.context.targetPrime}. Consider its position relative to known symbols and suggest what archetypal concept it might represent.`
          : `Help me understand what concept would fit well in this symbol system based on the patterns you see.`;

        responseSchema = {
          type: "object",
          properties: {
            prime: { type: "number" },
            meaning: { type: "string", description: "1-3 word archetypal meaning" },
            category: { type: "string", enum: ["consciousness", "structure", "dynamics", "relation", "quality", "quantity", "archetype", "process"] },
            relatedConcepts: { type: "array", items: { type: "string" }, maxItems: 5 },
            examples: { type: "array", items: { type: "string" }, maxItems: 3 },
            confidence: { type: "number", minimum: 0, maximum: 1 },
            reasoning: { type: "string" }
          },
          required: ["prime", "meaning", "confidence", "reasoning"]
        };
        break;

      case 'find_relationship':
        systemPrompt = `You are analyzing relationships between symbolic primes in a semantic system.

Known symbols:
${knownSymbolsContext}

Your task is to identify meaningful relationships between symbols based on:
- Semantic similarity or opposition
- Hierarchical containment (e.g., "love" contains "compassion")
- Transformation paths (e.g., "chaos" transforms to "order")
- Resonance (symbols that naturally combine well)`;

        userPrompt = request.context.concepts 
          ? `Find relationships between these concepts: ${request.context.concepts.join(', ')}`
          : `Analyze the relationships between all provided symbols and identify the most significant connections.`;

        responseSchema = {
          type: "object",
          properties: {
            relationships: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  primeA: { type: "number" },
                  primeB: { type: "number" },
                  relationshipType: { 
                    type: "string", 
                    enum: ["similar", "opposite", "contains", "part_of", "transforms_to", "resonates_with"] 
                  },
                  strength: { type: "number", minimum: 0, maximum: 1 },
                  explanation: { type: "string" }
                },
                required: ["primeA", "primeB", "relationshipType", "strength"]
              }
            }
          },
          required: ["relationships"]
        };
        break;

      case 'expand_concept':
        systemPrompt = `You are helping expand the semantic coverage of a prime-based symbol system.

Known symbols:
${knownSymbolsContext}

Your task is to identify conceptual gaps in the system and suggest new symbol meanings that would make the system more complete and coherent.`;

        userPrompt = request.context.question || 
          `What important archetypal concepts are missing from this symbol system? Suggest 3-5 new meanings that would fill semantic gaps.`;

        responseSchema = {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  concept: { type: "string" },
                  category: { type: "string" },
                  relatedTo: { type: "array", items: { type: "number" } },
                  reasoning: { type: "string" }
                },
                required: ["concept", "reasoning"]
              }
            },
            overallAnalysis: { type: "string" }
          },
          required: ["suggestions"]
        };
        break;

      case 'generate_examples':
        systemPrompt = `You are a teacher demonstrating how symbols combine in a prime-based semantic system.

Known symbols:
${knownSymbolsContext}

Your task is to generate concrete examples of how these symbols might be used or combined to express complex ideas.`;

        userPrompt = request.context.concepts
          ? `Generate examples of how these concepts could be expressed: ${request.context.concepts.join(', ')}`
          : `Generate 5 examples showing how the known symbols can combine to express complex philosophical or experiential concepts.`;

        responseSchema = {
          type: "object",
          properties: {
            examples: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  expression: { type: "string" },
                  primesUsed: { type: "array", items: { type: "number" } },
                  interpretation: { type: "string" },
                  context: { type: "string" }
                },
                required: ["expression", "primesUsed", "interpretation"]
              }
            }
          },
          required: ["examples"]
        };
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid request type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Use JSON schema in system prompt for more reliable structured output
    const schemaInstructions = `\n\nIMPORTANT: Respond ONLY with valid JSON matching this schema:\n${JSON.stringify(responseSchema, null, 2)}`;
    
    // Retry logic for transient errors (503, 502, network issues)
    const MAX_RETRIES = 3;
    const RETRY_DELAYS = [1000, 2000, 4000]; // exponential backoff
    let lastError: Error | null = null;
    let response: Response | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt + schemaInstructions },
              { role: "user", content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 2500
          }),
        });

        // Handle non-retryable errors immediately
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Credits exhausted" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
        if (response.status === 400) {
          return new Response(JSON.stringify({ error: "Invalid request" }), {
            status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Retry on 502, 503, 504 (transient gateway errors)
        if (response.status >= 500 && response.status < 600) {
          lastError = new Error(`AI gateway error: ${response.status}`);
          console.log(`Attempt ${attempt + 1} failed with ${response.status}, retrying...`);
          if (attempt < MAX_RETRIES - 1) {
            await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
            continue;
          }
        }

        // Success or other error
        if (response.ok) {
          break;
        } else {
          lastError = new Error(`AI gateway error: ${response.status}`);
        }
      } catch (fetchError) {
        lastError = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
        console.log(`Attempt ${attempt + 1} network error:`, lastError.message);
        if (attempt < MAX_RETRIES - 1) {
          await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
        }
      }
    }

    if (!response || !response.ok) {
      // Return a 503 with retry-after hint instead of 500
      return new Response(
        JSON.stringify({ 
          error: "AI service temporarily unavailable. Please try again in a moment.",
          retryable: true 
        }),
        { 
          status: 503, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "5"
          } 
        }
      );
    }

    const data = await response.json();
    
    // Extract result from content (JSON format)
    const content = data.choices?.[0]?.message?.content || "{}";
    let result: Record<string, unknown> = {};
    
    try {
      // Try to parse JSON directly from content
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Clean up common JSON issues from LLM output
        let jsonStr = jsonMatch[0];
        
        // Remove trailing commas before ] or }
        jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
        
        // Try parsing
        result = JSON.parse(jsonStr);
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      
      // Attempt a more aggressive cleanup
      try {
        let cleanedContent = content
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .replace(/,\s*([\]}])/g, '$1')  // Remove trailing commas
          .replace(/[\x00-\x1F\x7F]/g, ' '); // Remove control characters
        
        const retryMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (retryMatch) {
          result = JSON.parse(retryMatch[0]);
        } else {
          result = { error: "Failed to parse response", rawContent: content.slice(0, 200) };
        }
      } catch (retryError) {
        console.error("Retry parse also failed:", retryError);
        result = { error: "Failed to parse response", rawContent: content.slice(0, 200) };
      }
    }

    return new Response(
      JSON.stringify({ 
        type: request.type,
        result 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("symbol-chaperone error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
