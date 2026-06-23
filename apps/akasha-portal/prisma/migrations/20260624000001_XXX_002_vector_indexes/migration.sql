-- D-XXX.002: Vector index (ivfflat) para sessao_chunks.embedding.
--
-- Aplicado APOS 20260624000000_XXX_001_multitenant_core (que cria a
-- tabela sessao_chunks e a coluna embedding vector(768)).
--
-- Por que ivfflat (e nao hnsw) para v1?
-- -----------------------------------
-- ivfflat:
--   + Mais rapido de construir (BUILDs em datasets com ate ~100k vetores
--     em minutos vs horas para hnsw)
--   + Menor uso de RAM (~2x o tamanho do dataset para o indice)
--   + Suficiente para o caso de uso Wave 3 (grimorios pessoais + sessoes
--     de um Zelador — tipicamente < 10k chunks no primeiro ano)
--   + Tweakavel: o parametro "lists" precisa de ajuste apos dados reais
--     (regra pratica: rows/1000 para < 1M, rows/sqrt(rows) para >= 1M)
--   - Recall ligeiramente menor (~95-97% vs ~99% do hnsw)
--   - Requer treino (CREATE INDEX popula listas; inserts subsequentes
--     nao sao indexados ate VACUUM/REINDEX)
--
-- hnsw (considerar em Wave 5+, ver D-XXX risk no proposal):
--   + Melhor recall (~99%)
--   + Inserts incrementais (nao precisa VACUUM)
--   + Query time mais estavel (logaritimico vs sqrt do ivfflat)
--   - ~3-5x mais RAM
--   - Builds mais lentas em datasets grandes
--   - Menos tweakable (parametros M, ef_construction, ef_search)
--
-- Decisao: ivfflat com lists=100 (ponto de partida). Se o dataset do
-- Zelador crescer alem de 50k chunks, migrar para hnsw via nova
-- migration (DROP INDEX + CREATE INDEX com hnsw).
--
-- Operador: vector_cosine_ops (similaridade de cosseno). Esta e a metrica
-- canonica do @xenova/transformers (embeddings ja vem normalizados
-- para L2, entao cosine similarity ~= dot product, mas usamos cosine
-- explicitamente por seguranca e portabilidade do schema).
--
-- Performance baseline esperado (estimado para 10k chunks 768d):
--   - Build time: ~10-30s
--   - Query time (k=10, com filtro WHERE zeladorId=$1): <50ms
--   - Recall@10 vs brute force: ~95-97%

CREATE INDEX "sessao_chunks_embedding_idx"
    ON "sessao_chunks"
    USING ivfflat ("embedding" vector_cosine_ops)
    WITH (lists = 100);
