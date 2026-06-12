# Akasha v0.0.19 — Checklist de Verificação

## R-023 — Synthesis Framework

- [ ] 9 dimensões de vida documentadas com matriz de contribuição
- [ ] Akasha Authority definido: "paz vs ansiedade"
- [ ] Fluxo: dados → síntese → narrativa → ação
- [ ] Documento criado em `.autonomous/research/synthesis/akasha-synthesis-framework.md`
- [ ] Typecheck passa
- [ ] 0 novos erros de lint

## F-223 — Caixa Akasha

- [ ] `components/akasha/CaixaUnificada/DimensaoCard.tsx` criado
- [ ] `components/akasha/CaixaUnificada/SinteseNarrativa.tsx` criado
- [ ] Página `/minha-caixa` renderiza 9 dimensões
- [ ] Accordion mobile-first funciona
- [ ] Grid 3x3 no desktop
- [ ] Síntese de 5 pilares por dimensão
- [ ] Typecheck passa
- [ ] Tests passam

## F-224 — Meu Dia (Homepage Mobile)

- [ ] Página `/meu-dia` criada
- [ ] ONE SCREEN sem navegação por mapas
- [ ] Saudação personalizada com posição astral
- [ ] Clima energético (1 frase)
- [ ] Prática do dia (baseada no Corpo Tântrico em tensão HOJE)
- [ ] Janela de clareza (horário)
- [ ] Alerta
- [ ] Botão "Ver minha Caixa" → `/minha-caixa`
- [ ] Typecheck passa
- [ ] Tests passam

## F-225 — Sexualidade Deep Dive

- [ ] `lib/grimoire/sexualidade-curados.ts` criado
- [ ] Tantra: 11 Corpos × Sexualidade
- [ ] Cabala: Números Mestres + sexualidade
- [ ] Odu: padrão sexual por Odu
- [ ] Astrologia: Venus + Marte + Lilith + Casa 8
- [ ] I Ching: hexagramas relevantes
- [ ] `components/akasha/SexualidadePanel/` criado
- [ ] Integrado na Caixa como dimensão
- [ ] Typecheck passa
- [ ] Tests passam

## F-226 — Narrative Generator

- [ ] `lib/grimoire/narrativa-generator.ts` criado
- [ ] Conecta dados brutos → parágrafo narrativo
- [ ] Usa RAG (pgvector + Ollama) + significados-curados.ts
- [ ] Não inventa conteúdo (só sintetiza existente)
- [ ] Integrado na Caixa (F-223)
- [ ] Typecheck passa
- [ ] Tests passam

## F-227 — Akasha Authority

- [ ] `lib/grimoire/akasha-authority.ts` criado
- [ ] Regra: Corpo 3 (paz) = aja, Corpo 4 (ansiedade) = espere
- [ ] `components/akasha/AkashaAuthorityPrompt/` criado
- [ ] Aparece antes de ações importantes
- [ ] Integrado no Meu Dia (F-224)
- [ ] Typecheck passa
- [ ] Tests passam

## F-228 — Mobile Strategy

- [ ] Análise React Native vs Expo vs Flutter vs PWA
- [ ] Recomendação clara documentada
- [ ] Próximos passos definidos

## Validação Geral

- [ ] Suite completa passa: `pnpm test:run`
- [ ] Typecheck: `pnpm typecheck` → 0 erros
- [ ] Lint: `pnpm lint` → 0 avisos bloqueantes
- [ ] Quality gates: `pnpm quality` → verde
