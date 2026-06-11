# COT: R-022b Ethics Charter v1

## Contexto

Após Fases 0-4 (Research + Synthesis + Mentor + UX + Tech) e
R-030 (Algorithm TS puro), o Akasha tem 8 axiomas na VISION.md
§3, 12 regras E1-E12 no persona_v1.md §4, 8 anti-gaps rejeitados
no gaps.md, 10 limites éticos no synthesis_v1.md §5.5-5.6 — **mas
nenhum documento canônico consolida TUDO em um único Charter
operacional com governança (4 aprovações), 5% earmark por Pilar,
protocolo crise CVV 188, e white paper anual**.

Pendente desde 2026-06-10 (notas paralelas do claude-progress.txt
e CHECKPOINT.md).

## Hipóteses

1. Consolidar 8 axiomas + 12 regras E1-E12 + 8 anti-gaps em 1
   documento de governança é mais útil que espalhá-los em 4 docs.
2. Os 8 Pilares de Ética propostos (Citação, Tradição Viva, LGPD
   by Design, Híbrido IA+Humano, Não-Objetivos, PT-BR Primeiro,
   Atualização Opcional, Aprovação Humana) são **exaustivos e
   não-redundantes** — cobrem todos os 8 axiomas da VISION sem
   duplicação.
3. 5% earmark por Pilar × 5 Pilares = 25% da receita líquida
   earmark é meta Ano 5 agressiva mas viável (CHANI faz 5%
   genérico, não por Pilar — diferenciação Akasha).
4. Mecânica de 4 aprovações (Pilar vivo + Curador + Comitê Ético
   + Usuário) é viável sem burocracia excessiva em 30 dias de RFC
   público.
5. Crise → CVV 188 com regex expandido + resposta não-LLM é
   **padrão-ouro** em apps espirituais brasileiros (Calm, Headspace
   não fazem; CHANI também não — gap explorável).

## Evidências

- VISION.md §3 axiomas 1-8 (canônica).
- VISION.md §5 (6 itens "Akasha NÃO é").
- VISION.md §7 (5 não-objetivos).
- VISION.md §9 (3 anti-visões).
- persona_v1.md §3 (RAG mandatório) — origem Pilar 1.
- persona_v1.md §4 (12 regras E1-E12) — origem §2.
- synthesis_v1.md §5.5-5.6 (10 limites éticos Algorithm) — origem
  §6.
- gaps.md 8 anti-gaps (rejeitados) — origem §5.
- R-030 akasha-core.ts:97 (CRISE_REGEX + detectarCrise) — origem
  §3.1.
- CHANI App 5%→FreeFrom (RQ-007) — origem 5% earmark, mas sem
  diferenciação por Pilar.
- LGPD Lei 13.709/2018 — base legal Pilar 3.
- CVV 188 (Centro de Valorização da Vida) — recurso oficial
  gratuito, 24/7, anônimo, Brasil.

## Conclusão

**R-022b entregue: ethics_charter_v1.md (~600 linhas, 11 seções).**
Confidence HIGH.

**Decisões-chave (D1-D8):**

- **D1:** 8 Pilares de Ética (não 4, não 12). Cobre todos os 8
  axiomas da VISION sem redundância. Adiciona Pilar 7
  (Atualização Opcional) e Pilar 8 (Aprovação Humana) que estavam
  implícitos no R-021 gaps mas não-canônicos.
- **D2:** 12 regras E1-E12 mantidas como subset do Pilar Ético 3-4
  (escopo Mentor), consolidadas em tabela no §2 para referência
  única.
- **D3:** 5% × 5 Pilares = 25% earmark total — meta Ano 5 R$ 500k.
  Operacionalização: 5 parcerias formalizadas (1 por Pilar) + 5%
  rastreado por Pilar via EarmarkAudit (preview §4.2).
- **D4:** Crise → CVV 188 com regex expandido (§6.1) + resposta
  não-LLM padronizada (§6.2) + 5 estados saúde espiritual
  monitorados pelo Mentor (§6.3). **Ponto de honra**: LLM nunca
  oferece "conselho espiritual" em crise — só CVV 188.
- **D5:** Sem feed social / sem comparação / sem gamificação (§3.3)
  como **padrão técnico** (não só guideline).
- **D6:** 4 aprovações para mudar Charter (Pilar 8) — RFC pública
  30 dias + 4 aprovações nomeadas. Anti-burocracia: mudanças
  menores (texto) só comitê ético.
- **D7:** White paper anual em Janeiro (público) + auditoria
  externa 1 firma/1 ano + DPO mensal. Cita TODAS as críticas
  (Manohar 2018, Sheldrake, Dreamspell, Pittenger 2005, JASNH).
- **D8:** PT-BR primeiro, EN opt-in, com EN-curador nomeado.
  Termos preservados (Tikkun, Tiferet, Odu, Tridosha, Orixá,
  Kether, Tzimtzum). Transliteração reversível, não mágica.

## Próximos passos

### Curto prazo
- D-005 (refinar) — Validar este Charter contra 3 perfis
  (Ana/Bruno/Carla). Ajustar §3.1, §4, §6 se necessário.
- D-006 (iteração v2) — Coletar feedback interno + curadores
  convidados (1 por Pilar) → v2 do Charter.

### Médio prazo (Fase 5)
- D-040 Prisma schema: tabela `ethics_changelog` (RFCs públicas)
  + `earmark_audit` (rastreamento 5% por Pilar).
- D-042 Zod types: `EarmarkAuditSchema`, `CriseResponseSchema`,
  `SaudeEspiritualState` enum.
- cabala-corr-validator (Fase 5+) — skill para validar
  correspondências esotéricas antes de entrarem no Grimório.

### Longo prazo (Fase 6+)
- White paper Ano 1 — primeira auditoria pública + 5% earmark
  rastreado.
- 5 parcerias formalizadas (1 por Pilar) + 5% earmark Ano 1.
- DPO contratado para LGPD review mensal.

## Citações Canônicas deste COT

- 8 axiomas VISION.md §3
- 12 regras E1-E12 persona_v1.md §4
- 8 anti-gaps gaps.md
- 10 limites éticos synthesis_v1.md §5.5-5.6
- R-030 CRISE_REGEX akasha-core.ts:97
- LGPD Lei 13.709/2018
- CVV 188 (Centro de Valorização da Vida)
- CHANI 5%→FreeFrom (RQ-007)

---

**Akasha não é perfeito. É responsável.**
