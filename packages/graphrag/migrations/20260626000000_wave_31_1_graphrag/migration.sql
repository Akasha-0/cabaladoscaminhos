-- Wave 31.1 — GraphRAG MVP schema (kg_nodes + kg_edges + kg_triplets)
-- PROPOSAL ONLY: per apps/akasha-portal/prisma/AGENTS.md Work Guidance §1,
-- this migration is a proposal. A human applies it via:
--   pnpm --filter akasha-portal exec prisma migrate dev --name wave_31_1_graphrag

-- Requires: pgvector extension (already enabled — see schema.prisma `extensions`).

BEGIN;

-- ============================================================================
-- kg_nodes — canonical entities (Pilar, Odu, Sefira, Hexagrama, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS kg_nodes (
  id              TEXT        PRIMARY KEY,
  label           TEXT        NOT NULL,
  name            TEXT        NOT NULL,
  name_normalized TEXT        NOT NULL,
  description     TEXT        NOT NULL DEFAULT '',
  embedding       vector(768),                 -- nullable for in-memory MVP
  metadata        JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT kg_nodes_label_name_uniq UNIQUE (label, name_normalized)
);

CREATE INDEX IF NOT EXISTS kg_nodes_label_idx ON kg_nodes (label);
CREATE INDEX IF NOT EXISTS kg_nodes_embedding_hnsw_idx
  ON kg_nodes USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================================
-- kg_edges — typed relationships between nodes
-- ============================================================================
CREATE TABLE IF NOT EXISTS kg_edges (
  id          BIGSERIAL    PRIMARY KEY,
  source_id   TEXT         NOT NULL REFERENCES kg_nodes(id) ON DELETE CASCADE,
  target_id   TEXT         NOT NULL REFERENCES kg_nodes(id) ON DELETE CASCADE,
  relation    TEXT         NOT NULL,
  weight      REAL         NOT NULL DEFAULT 1.0
                 CHECK (weight >= 0.0 AND weight <= 1.0),
  metadata    JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT kg_edges_unique UNIQUE (source_id, target_id, relation)
);

CREATE INDEX IF NOT EXISTS kg_edges_source_idx ON kg_edges (source_id);
CREATE INDEX IF NOT EXISTS kg_edges_target_idx ON kg_edges (target_id);

-- ============================================================================
-- kg_triplets — append-only audit trail of inserted (h, r, t) triplets
-- (LGPD Art. 37 — knowledge provenance traceability)
-- ============================================================================
CREATE TABLE IF NOT EXISTS kg_triplets (
  id          BIGSERIAL    PRIMARY KEY,
  head_id     TEXT         NOT NULL,
  relation    TEXT         NOT NULL,
  tail_id     TEXT         NOT NULL,
  source      TEXT         NOT NULL,          -- e.g. "wave-31.1-seed"
  confidence  REAL         NOT NULL DEFAULT 1.0
                 CHECK (confidence >= 0.0 AND confidence <= 1.0),
  metadata    JSONB        NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS kg_triplets_head_idx ON kg_triplets (head_id);
CREATE INDEX IF NOT EXISTS kg_triplets_tail_idx ON kg_triplets (tail_id);

COMMIT;
