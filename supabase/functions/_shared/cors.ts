/**
 * Centralized CORS configuration for all edge functions.
 * Edit this file to add/remove allowed origins.
 */

// Explicitly allowed origins (add custom domains here)
const ALLOWED_ORIGINS = [
  'https://lovable.dev',
  'https://www.lovable.dev',
  'https://tinyaleph.lovable.app',
  'https://www.tinyaleph.lovable.app',
  'https://tinyaleph.com',
  'https://www.tinyaleph.com',
  'https://tinyaleph.dev',
  'https://www.tinyaleph.dev',
];

/**
 * Check if an origin is allowed based on:
 * 1. Explicit allowlist
 * 2. Localhost for development
 * 3. Lovable preview domains (.lovable.app, .lovableproject.com)
 */
function isOriginAllowed(origin: string): boolean {
  if (!origin) return false;
  
  // Explicit allowlist
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  
  // Localhost for development
  if (origin.includes('localhost') || origin.includes('127.0.0.1')) return true;
  
  // Lovable preview domains (including id-preview-- subdomains)
  if (origin.includes('.lovable.app')) return true;
  if (origin.includes('.lovableproject.com')) return true;
  if (origin.includes('lovableproject.com')) return true;
  
  return false;
}

/**
 * Get CORS headers for a request.
 * Returns the origin if allowed, otherwise defaults to first allowed origin.
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';

  // If the browser provides an Origin, we should only ever echo it back when allowed.
  // Falling back to a different origin causes hard-to-debug CORS failures.
  const allowedOrigin = origin && isOriginAllowed(origin) ? origin : (origin ? '' : ALLOWED_ORIGINS[0]);
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (allowedOrigin) {
    headers['Access-Control-Allow-Origin'] = allowedOrigin;
  }

  return headers;
}

/**
 * Handle CORS preflight (OPTIONS) request.
 */
export function handleCorsPreflightIfNeeded(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin') || '';
    if (origin && !isOriginAllowed(origin)) {
      return new Response('CORS origin not allowed', { status: 403 });
    }
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  return null;
}
