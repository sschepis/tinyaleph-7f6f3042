import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from '../_shared/cors.ts';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // requests per minute
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

interface MeaningToRefine {
  prime: number;
  rawMeaning: string;
  derivedFrom: Array<{ meaning: string; prime: number }>;
  resonantPrimes: number[];
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
    const { meanings } = body as { meanings: MeaningToRefine[] };
    
    if (!Array.isArray(meanings) || meanings.length === 0 || meanings.length > 20) {
      return new Response(
        JSON.stringify({ error: "meanings must be an array of 1-20 items" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build prompt for batch refinement
    const meaningsList = meanings.map((m, i) => 
      `${i + 1}. Prime ${m.prime}: "${m.rawMeaning}"
   Derived from: ${m.derivedFrom.map(d => `${d.meaning} (${d.prime})`).join(', ') || 'N/A'}
   Resonates with primes: ${m.resonantPrimes.slice(0, 5).join(', ')}`
    ).join('\n\n');

    const systemPrompt = `You are a semantic meaning refiner for a prime-based symbolic system.

Your task: Convert raw, mechanically-generated meanings into clear, evocative single concepts.

Rules:
1. Each refined meaning should be 1-3 words maximum
2. Preserve the ESSENCE of the original meaning
3. Use elegant, philosophical vocabulary
4. Make meanings feel archetypal and universal
5. Avoid prefixes like "meta-", "proto-", etc.
6. Return ONLY a JSON array of objects: [{"prime": number, "refined": "string"}, ...]

Examples of good refinements:
- "meta-coherence-identity-resonance" → "unified self"
- "proto-change-life-essence" → "transformation"
- "trans-wisdom-harmony-aspect" → "enlightened balance"
- "structure_duality_change" → "dynamic polarity"`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Refine these raw semantic meanings into clear concepts:\n\n${meaningsList}\n\nRespond ONLY with the JSON array.` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let refinements: Array<{ prime: number; refined: string }> = [];
    try {
      // Extract JSON array from response (may have markdown code blocks)
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        refinements = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error("Failed to parse refinements:", content);
      // Return empty on parse failure - caller will use raw meanings
    }

    return new Response(
      JSON.stringify({ refinements }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("refine-meanings error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
