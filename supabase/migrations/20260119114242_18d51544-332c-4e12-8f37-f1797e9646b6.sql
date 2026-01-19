-- Create table for holographic records (phase-encoded storage)
CREATE TABLE public.holographic_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_snapshot JSONB NOT NULL, -- Record<string, number> pulsarId → phase
  pulsar_ids TEXT[] NOT NULL,
  encoding_basis TEXT NOT NULL,
  amplitude_modulation DOUBLE PRECISION[] NOT NULL,
  content_hash TEXT NOT NULL,
  content_length INTEGER NOT NULL,
  redundancy INTEGER NOT NULL DEFAULT 1,
  coherence_at_storage DOUBLE PRECISION NOT NULL,
  stored_at BIGINT NOT NULL, -- simulation timestamp
  preset_name TEXT, -- optional: which network preset was used
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for content hash lookups
CREATE INDEX idx_holographic_records_content_hash ON public.holographic_records(content_hash);

-- Index for preset filtering
CREATE INDEX idx_holographic_records_preset ON public.holographic_records(preset_name);

-- Enable RLS (public read/write for this demo - no auth required)
ALTER TABLE public.holographic_records ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Anyone can read holographic records"
  ON public.holographic_records
  FOR SELECT
  USING (true);

-- Allow public insert
CREATE POLICY "Anyone can create holographic records"
  ON public.holographic_records
  FOR INSERT
  WITH CHECK (true);

-- Allow public delete (for cleanup)
CREATE POLICY "Anyone can delete holographic records"
  ON public.holographic_records
  FOR DELETE
  USING (true);