-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to grimoire_entries (nullable for existing rows)
ALTER TABLE grimoire_entries
  ADD COLUMN IF NOT EXISTS embedding vector(768);

-- Create IVFFlat index for ANN similarity search
-- NOTE: Run VACUUM ANALYZE on grimoire_entries before this index becomes effective.
CREATE INDEX IF NOT EXISTS grimoire_entries_embedding_idx
  ON grimoire_entries
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);
