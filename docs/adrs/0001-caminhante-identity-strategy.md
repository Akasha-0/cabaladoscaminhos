# 0001 — Caminhante identity strategy

**Status:** accepted (applied via migration `20260622000000_041_caminhante_caminhada/`, 2026-06-22)

Caminhante é identificado por surrogate cuid + `UNIQUE (zeladorId, dataNascimento, nomeLowercaseNormalized)` usando o **nome preferido** (não o nome legal completo). A normalização `nomeLowercaseNormalized` é `trim() + NFKD-strip-accents + lowercase` (ex.: `"  Mária  "` → `"maria"`). Resolve o problema das "duas Marias" via UI-level desambiguation: ao tentar cadastrar um Caminhante que colide na UNIQUE, a API retorna 409 e a UI obriga o Zelador a escolher um apelido distinto ("Maria (mãe)", "Maria (filha)").

**Considered alternatives (rejected):**

- ULID distribuído — rejeitado porque a UX exige encontrar o Caminhante pelo nome na próxima sessão (Zelador não decora ULID).
- UNIQUE em `nomeCompleto` (legal) — rejeitado porque o Zelador trata pelo nome preferred, não pelo nome da certidão; UX pior.
- Sem UNIQUE rígida (só índice + warning) — rejeitado porque permite drift de identidade ao longo do tempo; mesmo Caminhante pode acabar duplicado em fichas separadas.
- Soundex / metaphone — rejeitado por over-grouping ("Maria" e "Mário" virariam o mesmo) e under-grouping ("Maria" e "Marya" ficariam separados).

A normalização NFKD-strip-accents é deliberada: "Mária", "Maria" e "MARIA" são a mesma pessoa para o Zelador. Manter acentos quebraria a busca. Trade-off aceito: homônimos cross-grafo ("Maria" sem acento vs "Maria" com acento perdido na digitalização) colidem — risco baixo, Zelador pode desambiguar via apelido.