-- v0.0.4-T10 (Doc 14 §2): I-Ching como 5º sistema opt-in
-- Cached no cadastro (Doc 09 §5.3 — "calcule uma vez"); null até o
-- usuário solicitar a tiragem do hexagrama natal.

ALTER TABLE "users" ADD COLUMN "ichingMap" JSONB;
