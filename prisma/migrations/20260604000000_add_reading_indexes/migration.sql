-- Add indexes on Reading model for query performance
-- Fixes S6 gap from Phase 55 validation (database-reviewer)
-- Refs: docs/06_ai-engine-spec.md (Doc 04 data model)

BEGIN;

-- Index on clientId for client-scoped reading queries
CREATE INDEX "readings_client_id_idx" ON "readings" ("clientId");

-- Index on operatorId for operator-scoped reading queries
CREATE INDEX "readings_operator_id_idx" ON "readings" ("operatorId");

COMMIT;
