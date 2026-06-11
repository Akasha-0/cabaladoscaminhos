# COT: Akasha Core Algorithm v1 — escolha do eixo central

## Contexto

RQ-022 é o artefato central da Fase 1 (Synthesis). Os 12 RQs da
Fase 0 (Gene Keys → Sheldrake/Cymatics) estão completos. Patterns
(RQ-020) e Gaps (RQ-021) já extraíram 20 lições convergentes e 20
oportunidades únicas. Falta responder 4 perguntas:

1. Mapa visual (Mandala) vs linha do tempo (jornada) vs persona
   (mentor)?
2. Que narrativa única conecta os 5 pilares?
3. Como o usuário SENTE a unidade, não a justaposição?
4. Proposta inicial do Akasha Core Algorithm.

O app_spec §1 e §8 é explícito: "Sistema Akasha ainda é 'soma de 4
sistemas lado a lado' — falta a síntese unificada."

## Hipóteses

**H1 — UNIDADE é Mandala pessoal** (analogia direta com bodygraph
HD e 64 Gene Keys).

**H2 — UNIDADE VIVIDA é Mandato diário + Mentor** (analogia com
Co-Star 1-push e CHANI bundle semanal).

**H3 — NARRATIVA é "Cicatriz vira Joia"** = Tikkun (Luria 1570) +
Shadow→Gift→Siddhi (Rudd 2009). Eixo Luriânico + Gene Keys, que
compartilham "quebra-remendo" como processo.

**H4 — TEMPO é 4 escalas (D/S/Z/V)** — única no mercado (CHANI=1,
Co-Star=2, Gene Keys=3, HD=2). Síntese mais completa que
qualquer referência.

**H5 — ISOMORFISMO ≠ SINCRETISMO** — Akasha NÃO funde os 5
Pilares; mostra estruturas comuns. Esta é a fronteira que evita
New Age.

## Evidências

- Patterns §3.2 (patterns.md): "Todo sistema de visualização tem
  1 diagrama-mãe" → Mandala é resposta para H1.
- Patterns §4.3 + 4.4: "Mnemônica identidade" + "micro-doses 1/dia"
  → Mandato é resposta para H2.
- Gaps #14 (gaps.md): "4 escalas temporais simultâneas" → valida
  H4 como gap único.
- RQ-001 (Gene Keys): Shadow→Gift→Siddhi = espinha narrativa;
  RQ-008 (Cabala): Luria Tikkun = espinha narrativa — ambos
  convergem em "quebra-remendo" (valida H3).
- COT `cot-20260610-patterns-extraction.md` fixou D1-D4 que
  estruturam este v1.

## Conclusão

UNIDADE = PESSOA × 5 PILARES sobre Mandala com 4 camadas
temporais. NARRATIVA = "Cicatriz vira Joia" (Tikkun + Shadow→Gift→Siddhi).
SENTIDA ATRAVÉS DE = Mandato diário + Mentor que cita Grimório.

Algoritmo em 6 estágios (normalize → 5 pilares → Mandala →
Memória → Mandato → Mentor). Limites éticos (5 NÃO principais
+ 5 NÃO éticos específicos) derivados dos 8 anti-gaps do
RQ-021 e das críticas dos 12 RQs.

## Decisões registradas

- **D1 (patterns):** UNIDADE = PESSOA × 5 PILARES sobre Mandala
  — escolhida e formalizada.
- **D2 (patterns):** TEMPO = 4 escalas — escolhida e
  detalhada (D/S/Z/V com triggers e conteúdo típico por
  Pilar).
- **D3 (patterns):** MNEMÔNICA = "Akasha nº X" — esboçada em
  D-003; v2 deve prototipar (ex: "Akasha 7 — Tiferet", "Akasha
  22 — Malkhut"). v1 não a usa ainda; é output futuro.
- **D4 (patterns):** ÉTICA = citação + transparência + 5% causa
  + LGPD — v1 cita as 4 dimensões; Ethics Charter v1
  (RQ-022b) vai formalizar.
- **D5 (nova):** Pilar 3 (Numerologia Tântrica) — adotado
  "11 corpos" com nota de honestidade sobre canonicidade
  heterogênea; v2 pode revisar.
- **D6 (nova):** Pilar 4 (Odu) — só ativa com parceria com
  axé/terreiro firmada (anti-apropriação, RQ-010 lição).
  Versão "escolar" sem parceria fica em fila de RQ futuro.
- **D7 (nova):** Ordem dos anéis da Mandala — proposto 1 dentro,
  5 fora; v2 pode testar.

## Princípios éticos ativos no v1

(herdados do RQ-021 anti-gaps e dos 12 RQs)

- Citação obrigatória de fonte em cada afirmação do Mandato/
  Mentor.
- "Não sei" permitido quando a fonte não existe.
- Detecção de crise → CVV 188 + recurso humano.
- LGPD: dados do usuário são do usuário, opt-out de
  qualquer uso secundário.
- 5% receita por Pilar earmark (Pilar 1 → causa judaica BR;
  Pilar 2 → Casa 1 / Casa Chama; Pilar 3 → tradição tântrica
  honesta; Pilar 4 → Saq Be/axé; Pilar 5 → tradição chinesa).
- Sem fatalismo ("você vai"), sem gamificação (streak), sem
  feed social, sem dating/match.

## Próximos passos

1. **Imediato:** RQ-023 (Mentor persona v1) — dependência direta
   de §7 deste doc.
2. **Curto prazo:** RQ-024 (UX architecture v1) — depende de
   §4 (Mandala) e §6 (Mandato) deste doc.
3. **Médio prazo:** Ethics Charter v1 — dependência de D4
   deste COT.
4. **Médio prazo:** Synthesis v2 — após feedback interno +
   perfis fictícios (D-005) + RQ-023 + RQ-024.
5. **Fase 5:** transpor §5 (algoritmo) para TS puro em
   `packages/akasha-core/`. Tipos Zod para inputs/outputs
   (D-041, D-042).

## Métricas do v1

- **13 seções** + TL;DR.
- **5 Pilares** definidos canonicamente.
- **4 Camadas** temporais especificadas com triggers.
- **1 Mandala** especificada visualmente (ASCII) e tecnicamente
  (SVG, 3-4 cores).
- **1 Algoritmo** em pseudo-código (6 estágios + 2 funções
  detalhadas).
- **10 Limites éticos** (5 gerais + 5 específicos por Pilar).
- **3 Perfis** de validação teórica (Ana mainstream, Bruno
  cético, Carla vocacional).
- **7 Decisões em aberto** documentadas para v2.
- **~600 linhas** markdown.
- **Citação honesta de incerteza** em §13.
