# Diagnóstico DOX

## Purpose

Alertas e diagnósticos astrológicos situacionais — entradas curtas e
diretas que sinalizam tensões ou aberturas temporais (ex: Mercúrio
Retrógrado, Tensão Lua-Escorpião, Abertura de Caminho com Júpiter).
Diferente de `botanica/` (ervas) e `ancestral/` (Odus): foco em
**janelas temporais** que o usuário precisa saber AGORA.

## Ownership

- 4 entries canônicas:
  - `alerta-mercurio-retrogrado.md`: revisão, cautela em comunicação
  - `tensao-lua-escorpiao.md`: intensidade emocional, transformação
  - `tensao-saturno-retrogrado.md`: reestruturação, karma
  - `abertura-caminho-jupiter.md`: expansão, oportunidade

## Local Contracts

- Formato MD com frontmatter YAML (id, slug, title, title_en,
  categoria, biblioteca, Elementos_Regentes, Orixas_Associados,
  Numeros_Kabalisticos, Corpos_Tantricos_Alvo, Odus_Associados,
  Acao_Principal)
- `biblioteca: diagnostico` em todos os entries (consistente)
- `categoria: Ritual` ou `Alerta` ou `Tensão` (varia por tipo)
- Inclui `## EN` section (translation-status note + English summary,
  NÃO full translation — pattern matching `botanica/erva-001`)
- Cobertura de teste: `grimoire-completeness.test.ts` CATEGORIES
  inclui `diagnostico` (4 of 4 covered)

## Work Guidance

- PT-BR primeiro (i18n config). Manter padrão en.json ↔ pt-BR.json.
- Pilar 4 (Odu) ethics invariant: avisar `requer consentimento +
  terreiro` quando a entry tocar em Odus sensíveis.
- Não inventar correspondências esotéricas — toda referência a
  planeta/casa/signo deve ser astrologicamente correta.
- Updates em pares (PT-BR e EN juntos).
- Entries de diagnóstico são SHORTER que entries de botanica (~80
  linhas vs ~150). Manter concisão — o user quer saber AGORA.

## Verification

- `pnpm test:run tests/lib/i18n/grimoire-completeness.test.ts` —
  cobre este dir (lesson N+18 fix: `findGrimoireRoot()` deve achar
  `grimoire/diagnostico/`)
- Antes de adicionar entry: checar Pilar 1-4 koréby (canonical
  whitelist, NÃO inventar)

## Child DOX Index
(Nenhum subdiretório com AGENTS.md)
