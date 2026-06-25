-- Wave 31.1 — GraphRAG MVP schema
-- PROPOSAL ONLY: per apps/akasha-portal/prisma/AGENTS.md Work Guidance §1,
-- this migration is a proposal. A human applies it via:
--   pnpm --filter akasha-portal exec prisma migrate dev --name wave_31_1_graphrag
--
-- Design notes:
-- - `kg_nodes`: knowledge graph nodes (5 Pilares + 15 Odus + 10 Sefirot +
--   64 hexagrams + medicinas + discoveries). Embedding vector(768) aligned
--   with sessao_chunks / grimoire (Wave 30.3 §3.2).
-- - `kg_edges`: typed relationships. Composite UNIQUE (source, target,
--   relation) enables idempotent upserts.
-- - `kg_triplets`: append-only audit trail (LGPD Art. 37 + D-040).
-- - No FK to User: KG nodes are shareable across users (consent at app layer).
-- - ON DELETE CASCADE on edges: deleting a node removes its edges.

BEGIN;

CREATE TABLE IF NOT EXISTS "kg_nodes" (
  "id"                text        PRIMARY KEY,
  "label"             text        NOT NULL,
  "name"              text        NOT NULL,
  "name_normalized"   text        NOT NULL,
  "description"       text,
  "metadata"          jsonb       NOT NULL DEFAULT '{}'::jsonb,
  "embedding"         vector(768),
  "created_at"        timestamptz NOT NULL DEFAULT NOW(),
  "updated_at"        timestamptz NOT NULL DEFAULT NOW(),

  CONSTRAINT "kg_nodes_label_name_normalized_unique"
    UNIQUE ("label", "name_normalized")
);

CREATE INDEX IF NOT EXISTS "kg_nodes_label_idx"
  ON "kg_nodes" ("label");

-- HNSW index for cosine search. m=16, ef_construction=64 are pgvector
-- defaults; align with sessao_chunks / grimoire if Wave 31.6 standardizes.
CREATE INDEX IF NOT EXISTS "kg_nodes_embedding_hnsw_idx"
  ON "kg_nodes"
  USING hnsw ("embedding" vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE TABLE IF NOT EXISTS "kg_edges" (
  "id"          text        PRIMARY KEY,
  "source_id"   text        NOT NULL,
  "target_id"   text        NOT NULL,
  "relation"    text        NOT NULL,
  "weight"      double precision NOT NULL DEFAULT 1.0,
  "metadata"    jsonb       NOT NULL DEFAULT '{}'::jsonb,
  "created_at"  timestamptz NOT NULL DEFAULT NOW(),

  CONSTRAINT "kg_edges_source_target_relation_unique"
    UNIQUE ("source_id", "target_id", "relation"),

  CONSTRAINT "kg_edges_source_fk"
    FOREIGN KEY ("source_id") REFERENCES "kg_nodes"("id") ON DELETE CASCADE,
  CONSTRAINT "kg_edges_target_fk"
    FOREIGN KEY ("target_id") REFERENCES "kg_nodes"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "kg_edges_source_idx"
  ON "kg_edges" ("source_id");
CREATE INDEX IF NOT EXISTS "kg_edges_target_idx"
  ON "kg_edges" ("target_id");
CREATE INDEX IF NOT EXISTS "kg_edges_relation_idx"
  ON "kg_edges" ("relation");

CREATE TABLE IF NOT EXISTS "kg_triplets" (
  "id"            bigserial  PRIMARY KEY,
  "source"        text       NOT NULL,
  "relation"      text       NOT NULL,
  "target"        text       NOT NULL,
  "source_doc_id" text,
  "confidence"    double precision NOT NULL DEFAULT 1.0,
  "extracted_at"  timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "kg_triplets_source_idx"
  ON "kg_triplets" ("source");
CREATE INDEX IF NOT EXISTS "kg_triplets_target_idx"
  ON "kg_triplets" ("target");

COMMIT;
