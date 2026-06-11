# TODO — Backlog de Pesquisa e Design (Fases 0-4)

> **Regra:** Este TODO governa Fase 0 (Research) → Fase 4 (Tech Stack).
> **Nenhum código de feature antes da Fase 5.** Até lá, só:
> - Pesquisa web / context7
> - Markdown em `.autonomous/research/`
> - Chain-of-thought logs
> - Schema/YAML (não TS executável)

## Convenções
- `RQ-NNN` = research question
- `D-NNN` = design task (Fase 1-4)
- `[ ]` pending · `[~]` in progress · `[x]` done · `!` blocked

## FASE 0 — Research (PRIORIDADE MÁXIMA)

### Sistemas modernos a estudar (mínimo 8)
- [x] RQ-001 — Gene Keys (Richard Rudd) — modelo primário de síntese
- [x] RQ-002 — Human Design (Ra Uru Hu) — modelo de UX/visualização
- [x] RQ-003 — MBTI / funções cognitivas Jung — base psicológica
- [x] RQ-004 — Enneagrama — modelo de tipos **+ dinâmica temporal (9 levels)**
- [x] RQ-005 — Co-Star — UX minimalista astrologia
- [x] RQ-006 — The Pattern — linguagem íntima, narrativa
- [x] RQ-007 — CHANI App — astrologia + ritual
- [x] RQ-008 — Cabala Clássica / Árvore da Vida — base cabalística
- [x] RQ-009 — Numerologia Cabalística ocidental — fonte direta
- [x] RQ-010 — Tzolkin / Mayan Calendar — outro sistema de ciclos
- [x] RQ-011 — Ayurveda — síntese corpo/mente (explorar)
- [x] RQ-012 — Sheldrake (Campos Morfogenéticos) + Cymatics — base conceitual "por que tradições funcionam"

### Para cada sistema, investigar
1. **Síntese:** como combinaram múltiplas tradições?
2. **Mapeamento:** como codificaram a tradução? (ex: hex→gene key)
3. **UX:** como apresentar sem sobrecarregar?
4. **Linguagem:** tom, mito, ritual, identidade.
5. **Negócio:** modelo, público, monetização.
6. **Lições para Akasha:** o que copiar, melhorar, evitar.

## FASE 1 — Synthesis Design

- [x] D-001 — Extrair padrões comuns entre sistemas estudados (RQ-020)
- [x] D-002 — Identificar gaps que nenhum sistema cobre (RQ-021)
- [x] D-003 — Definir eixo central do Akasha (qual a UNIDADE de
       síntese? — Mandala? Linha do tempo? Persona?)
- [x] D-004 — Propor Akasha Core Algorithm v1 (markdown, não código)
       — ✅ synthesis/synthesis_v1.md (RQ-022)
- [~] D-005 — Validar v1 com 3 perfis de teste (descrever só)
       — Ana/Bruno/Carla já em synthesis §13; expandindo em R-024
- [ ] D-006 — Iterar até v3 com feedback interno
- [x] **R-022b (sessão N+1) — Ethics Charter v1 (consolida governança)**
       — ✅ ethics/ethics_charter_v1.md (8 Pilares de Ética + 12 regras
       E1-E12 + 8 anti-visões + 5% earmark × 5 Pilares + protocolo crise
       CVV 188 + 4 aprovações governança + white paper anual)
       — 11 seções, ~600 linhas, sem código (research/design puro)
       — COT: `cot-20260611-ethics-charter-v1.md` (D1-D8 decisões)

## FASE 2 — AI Mentor

- [x] D-010 — Definir persona do Mentor (nome, voz, história)
       — ✅ mentor/persona_v1.md §1
- [x] D-011 — Escrever system prompt base (com guard-rails)
       — ✅ mentor/persona_v1.md §7
- [x] D-012 — Protocolo de RAG (citação obrigatória do Grimório)
       — ✅ mentor/persona_v1.md §3
- [x] D-013 — Comportamento ético (crise, fatalismo, vício)
       — ✅ mentor/persona_v1.md §4 + §5 (E1-E12)
- [x] D-014 — Tom de voz: exemplos de dialog (5+ samples)
       — ✅ mentor/persona_v1.md §8 (5 samples canônicos)
- [x] D-015 — Memória de conversa (estrutura)
       — ✅ mentor/persona_v1.md §6 (3 camadas)

## FASE 3 — UX Architecture

- [x] D-020 — Decisão mobile-first PWA vs app nativo
       — ✅ ux/architecture_v1.md §3 (PWA-first, nativo Fase 7+)
- [x] D-021 — Estrutura de descoberta progressiva (micro-doses)
       — ✅ ux/architecture_v1.md §4 (3-7 cliques, 7 camadas)
- [x] D-022 — Telas-chave: Mandala, Mandato, Mural, Ritual, Mentor
       — ✅ ux/architecture_v1.md §5 (5 telas canônicas)
- [x] D-023 — Interação com IA (streaming, voz, texto)
       — ✅ ux/architecture_v1.md §6 (SSE + Web Speech Fase 5+)
- [x] D-024 — Acessibilidade WCAG 2.2 AA
       — ✅ ux/architecture_v1.md §7 (12 critérios AA + testes)
- [x] D-025 — Internacionalização (PT-BR primeiro, EN depois)
       — ✅ ux/architecture_v1.md §8 (Next.js 16 [lang] pattern)

## FASE 4 — Tech Stack

- [x] D-030 — Confirmar Next.js 16 + Turbopack
       — ✅ tech/stack_v1.md §1 (Next.js 16.2+ Turbopack, 7168MB heap, 16.2+ mandatory)
- [x] D-031 — DB: Postgres + pgvector (embeddings)
       — ✅ tech/stack_v1.md §2 (Supabase Cloud sa-east-1, HNSW 1536-dim, $30-45/mo)
- [x] D-032 — LLM: OpenAI (gpt-4) + Minimax fallback
       — ✅ tech/stack_v1.md §3 (Sonnet 4.6 primary + Haiku 4.5 router/crise + Minimax M3 fallback, prompt cache 90%)
- [x] D-033 — Realtime: SSE vs WebSocket
       — ✅ tech/stack_v1.md §4 (SSE Edge Runtime; WebSocket = zero uso)
- [x] D-034 — Auth: JWT próprio vs Supabase vs Clerk
       — ✅ tech/stack_v1.md §5 (Supabase Auth + RLS nativo, R$ 25/mo, MFA+passkeys built-in)
- [x] D-035 — Payments: Stripe (mantém)
       — ✅ tech/stack_v1.md §6 (mantém; PIX/Boleto via Stripe nativo)
- [x] D-036 — Deploy: VPS vs Vercel vs edge
       — ✅ tech/stack_v1.md §7 (Vercel Pro + Supabase Cloud; migration Hetzner @ MAU 50k)
- [x] **D-025 (sessão N) — Tech Stack v1 (consolidar D-030..D-036 em 1 doc)**
       — ✅ tech/stack_v1.md (981 linhas, 14 seções, 30+ fontes 2026, 5 incertezas, 10 decisões abertas O-1..O-10)
       — ✅ D-037 bônus: Prisma 7 mantém (não migrar Drizzle; já no stack, edge nativo)
       — Custo MVP $50-60/mo (R$ 250-300/mo) → ano 1 10k MAU $150-250/mo → ano 3 50k MAU $1-2k/mo
- 2026-06-10 — R-025 ✅ Tech Stack v1 (Fase 4) — 981 linhas consolidando D-030..D-036 (+ D-037 Prisma bônus). Decisão-chave: **Vercel Pro + Supabase Cloud sa-east-1 + Sonnet 4.6 + pgvector + SSE Edge + Supabase Auth RLS + Stripe mantém**. 30+ fontes 2026 citadas (next-16, devopsness pgvector 6mo prod, claudeguide benchmark, thanosk SSE, makerkit Auth 2026, techplained PaaS, encore Prisma 7). 5 incertezas honestas (Vercel viral bill, PT-BR esotérico, pgvector > 1M, Supabase MFA UX, region switch). 10 decisões abertas O-1..O-10 (gateway LLM, i18n next-intl, Highlight.io observability, Resend email, Inngest jobs, Vercel Cron). COT `cot-20260610-tech-stack-decisions.md`. Próxima sessão: R-030 Akasha Core Algorithm prototype (TS puro) — primeira tarefa de Fase 5. Paralelo: R-022b Ethics Charter v1.

## FASE 5 — Protótipo (após Fases 0-4)

- [~] D-040 — Schema Prisma com 5 pilares (DESIGN PROPOSAL, awaiting approval)
       — `.autonomous/research/designs/d-040-prisma-5-pilares-design.md`
       Proposta: unificar 5 Pilares em BirthChart (Pilar 5 sai de
       User.ichingMap), criar MandalaSnapshot cache + MandatoDiario
       com criseDetectada/recursoCv188, backward compat 1 release.
       NÃO aplicado: migration prod DB sem staging test.
       Aguarda aprovação humana antes de `pnpm db:migrate`.
- [x] D-041 — Akasha Core Algorithm em TS puro (entregue R-030)
- [x] D-042 — Tipos Zod para inputs/outputs (entregue R-030)
- [x] D-043 — Testes com 10 perfis representativos ✅ 2026-06-11
       — 10 fixtures (`profiles-fixtures.ts`) + 69 testes verdes
       (208/208 em packages/akasha-core/).
       Cobre: Ana mainstream, Bruno sem-hora, Carla 1ª-ger, Daniel
       sênior, Eduardo desorientação-NÃO-crise, Fernanda multi-tópico,
       Gabriel first-toucher, Helena multi-tradição, Igor datas
       alinhadas, Júlia identidade-trans. + PERFIL_CRISIS (CVV-188).
       Commit 2aada43b.
- [x] D-044 — Validar com cabala-corr-validator ✅ 2026-06-11
       — `packages/akasha-core/src/correlation-validation.test.ts`
       (90 testes verdes; 298/298 em packages/akasha-core/).
       Valida ranges canônicos, inversão bijetiva, cobertura.
       Achados: (F1) IFA_ODUS tem 15 (não 16) — Eji substitui Ogbe
       por design Phase 1; (F2) stub R-030 diverge em Ogbe+Ofun;
       (F3) ranges 100% conformes; (F4) inversão bijetiva.
       Hook bloqueou vacuous test (removido).
       COT `cot-20260611-d-044-correlation-validation.md`.

## FASE 6 — Implementação (futuro)

(migrar research items para F-NNN quando Fase 5 começar)

## Bloqueadas
- (nenhuma)

## Backlog
- B-100 — Considerar i18n espanhol, francês, hebraico
- B-101 — Versão em áudio (podcast diário)
- B-102 — Modo offline (PWA puro)

## Notas de Iteração
<!-- agente adiciona data+commit+resumo por RQ completada -->
- 2026-06-10 — RQ-004 ✅ Enneagrama — **dinâmica temporal confirmada como Pilar 4 do Akasha**. 43 fontes citadas (9 oficiais R-H/TNE, 8 origens Ichazo/Naranjo, 8 estrutura técnica, 4 subtypes/wings, 6 crítica científica, 6 business/coaching, 2 Narrative vs R-H). **Posição Akasha: Enneagrama = "termômetro de saúde"** — único sistema com 3 dimensões em 1 modelo: tipo fixo + 9 Levels (Riso 1977) + direções Integration/Disintegration. Onde Gene Keys/HD/MBTI são fotos, Enneagrama é o filme. Trifix (3 fixações, 1 por centro Head/Heart/Gut) substitui "1 tipo" do MBTI com mais fidelidade. 27 Subtypes (Naranjo) viram upsell B2B. iEQ9 $450/individual + $4,500/team valida mercado (SAP/Cisco/NASA/FBI). Críticas honestas citadas (Hook 2020 — 104 estudos, "limited evidence"; Kastelein 2021 — OEPS test-retest r=0.68, CFA CFI=0.56). White paper Akasha cita TUDO. Implementação Fase 5+: type detection sem 1 (motivação, não comportamento — Narrative Trad está certa), trifix sem 2-4, health check semanal (Level 1-9), B2B dia 60+ ($295-895). COT em `cot-20260610-enneagram-position.md`. Próximo: RQ-005 Co-Star.
- 2026-06-10 — RQ-011 ✅ Ayurveda — **3ª maior contribuição NÃO-OCIDENTAL ao Akasha** (depois de Cabala e Gene Keys). 47+ fontes citadas (12 acadêmicas, 7 oficiais WHO/NAMA, 7 críticas, 12 apps modernos, 4 mercado, 5 conceituais). **Posição Akasha — 7 decisões**: (1) Pilar 3 ganha **Tridosha (Vata/Pitta/Kapha) + Ojas/Tejas/Prana + 5 Koshas (Taittiriya Upanishad)** como taxonomia dominante — pedagogicamente superior a 7 chakras/11 corpos para iniciantes. BPI 2026 (Tiwari et al., N=1857, IRT-validated CFI=0.967) valida Prakriti com **divergent validity** vs Mini-IPIP (Prakriti ≠ personalidade ocidental) → Pilar 3 separado de Pilar 1 e tipos psicológicos. (2) Pilar 4 ganha **Ritucharya** (6 estações × 2 meses + Ritu Sandhi 14d) como **3ª escala temporal** (única sazonal 4-meses no portfolio: vs lunar CHANI 29.5d, linear Gene Keys, fixed-natal HD, 9-Levels Enneagrama, fixed MBTI). (3) Pilar 5 ganha "Triagem Tridosha" 3min como alternativa simplificada ao I Ching 64. (4) UX herda **3 doses/dia + weekly check-in + Ritu Sandhi** de Ritu/Nirogyam/AyuRythm. (5) Pricing: freemium + R$ 19-29/mo + R$ 199/ano + R$ 295-895 B2B. (6) **Ética (5 compromissos)**: cita 8 fontes canônicas (Charaka/Sushruta/Vagbhata/Madhava/WHO 2014-2023/2025-2034/NAMA/BAMS); **NÃO cita** Patanjali/Baba Ramdev/Chopra sem qualificar; declara Tridosha como **heurística, não ciência** (Manohar 2018 IJME). (7) Crise saúde → BAMS + CVV 188. **Surpresas**: Ritucharya é única sazonal 4-meses; BPI 2026 valida com divergent validity; mercado 4 fontes independentes confirmam CAGR 15-20%, crescimento 4-6× até 2033-2035 → Akasha entra em mercado aquecido. White paper cita TUDO (12 acadêmicas + Manohar 2018 crítico + Saper 2008 JAMA heavy metals). COT em `cot-20260610-ayurveda-position.md`. Próximo: RQ-012 Sheldrake+Cymatics OU RQ-020 Patterns (Fase 1, desbloqueado agora com 11 sistemas).
- 2026-06-10 — RQ-003 ✅ MBTI / Jung — base psicológica confirmada. **Decisão Akasha: usar Jung (4 funções + 2 atitudes + stack de 4 posições), NÃO Myers (dicotomia forçada)**. 30 fontes citadas (APTi, Myers-Briggs Company oficial, Jung CW6, McCrae & Costa 1989, Pittenger 2005, Stein & Arnau 2019, Nardi neuroscience, NERIS CFA 2020). Posição híbrida: 5 dimensões contínuas internas, 16 perfis mnemônicos externos. Função inferior vira "trabalho de vida" do usuário (Beebe 8-positions). Certificação Akasha 3-níveis ($295/$895/$1,995) em vez de gatekeeper $2,895 do MBTI. White paper público cita as críticas. 16Personalities (1.5B+ testes grátis) = lição de "freemium digital vence escala". COT em `cot-20260610-mbti-jung-position.md`. Próximo: RQ-004 Enneagrama.
- 2026-06-10 — RQ-002 ✅ Human Design (Ra Uru Hu) — modelo de UX/visualização confirmado. Bodygraph (9 centers / 36 channels / 64 gates) é a referência de visualização; 88° solar arc é a técnica replicável de "segunda camada temporal"; 7-etapas do usuário é o esqueleto de UX. Decisão de Florença 2020 (sem copyright sobre sistemas espirituais) é precedente legal. COT em `cot-20260610-human-design-synthesis.md`. Próximo: RQ-003 MBTI/Jung.
- 2026-06-10 — RQ-009 ✅ Numerologia Cabalística Ocidental — **engine numérica do Pilar 1 do Mandato Akasha confirmada**. 30 fontes citadas (12 judaicas/acadêmicas: Wikipedia, Chabad, Aish, GalEinai/Inner.org, Hebrew4Christians, Sefaria, TorahCalc, Satyori, Duncan/Bethelkhem, LingoDigest; 4 Golden Dawn/Hermetic: Liber 777 PDF + 3 explainers; 9 prática moderna: Numerologist.com, MyPandit, Insights by Omkar, Thalira, Quantum Merlin, Infinity, Divination Foundation, ToolCalcs; 5 críticas: UCL/Huffman 2013, JASNH, ASSAP, Skepdic, Africa Check). **Posição Akasha: Pilar 1 = Gematria Cabalística transposta para PT-BR** (Mispar Hechrachi padrão + Mispar Katan Mispari como digital root). Pilagorismo refutado (UCL: "no evidence that Pythagoras practiced this") — evita apropriação retroativa. **6 métodos mapeados** (Hechrachi/Gadol/Katan/Mispari/Siduri/Milui/Atbash). **3 escolas comparadas** (Pitagórica vs Caldeia vs Cabalística) — Akasha escolhe Cabalística. **22 letras = 22 Caminhos = 22 Tarôs = 12 signos + 7 planetas + 3 elementos** (ponte Golden Dawn/Liber 777). **Algoritmo do Mandato** (Life Path/Birthday/Expression/Soul Urge/Personality) + Master Numbers 11/22/33. Decisão ética: transliteração PT-BR→hebraico reversível e auditável (não mágica). Implementação Fase 5+ usa tabela canônica em `src/lib/constants/`. White paper cita TODAS as críticas (Huffman, JASNH, ASSAP, Carroll, Africa Check). COT em `cot-20260610-cabalistic-numerology-position.md`. Próximo: RQ-006 The Pattern.
- 2026-06-10 — RQ-012 ✅ Sheldrake + Cymatics — **base conceitual final da Fase 0** (12/12 = 100%, Fase 0 Research COMPLETA). 32+ fontes citadas (Sheldrake 1981/1999/2003/2012/2017/2020 + criticas Maddox Nature 1981/1999, Wiseman-Smith-Milton 1998 PubMed 9734300, Shermer 2005 SAIC, Rose 1990, Skepdic 2025, Wikipedia 2026, Schmidt-Böbel meta 2004 BJP d=0.13; cymatics Jenny 1967/1972/2001, Chladni 1787, Faraday 1831, Reid 2014 CymaScope, Park-Ji-Reid 2021 WaterJournal, McGowan-Leplâtre 2017 ACM, E3S 2024, Codrops 2025, Cymatics Lab 2025-26; criticas 528 Hz DNA repair/432 Hz healing/Solfeggio Puleo 1970s). **Posição Akasha — 5 decisões éticas**: (1) **morphic fields = METÁFORA PEDAGÓGICA, não mecanismo** (cita pró Sheldrake 1981, Schmidt 2004 + contra Nature 1981, Wiseman 1998, Shermer 2005, Rose 1990, Skepdic); (2) **Cymatics = visual UX Pilar 4** (Chladni animado, Three.js Web Audio API open-source), núcleo sólido Faraday 1831 — **rejeita** extrapolação 528/432 Hz; (3) **NUNCA afirma mecanismo físico** (white paper seção "O que Akasha NÃO afirma"); (4) **I Ching ≠ frequências místicas** (Gene Keys evitou essa fusão, Akasha mantém); (5) **Memetics (Dawkins 1976) > Morphic fields (Sheldrake 1981)** no framework acadêmico — Sheldrake é **poesia**, memetics é **ciência**. UX: Pilar 4 Ritual com "campo mórfico" como narrativa; Pilar 5 Hexagrama com Chladni animado; Mentor cita Sheldrake COMO POESIA + disclaimer; áudio Web Audio API binaural 4-8 Hz (placebo honesto) + cantos tradicionais creditados; rejeita 528/432/Solfeggio. White paper Akasha cita TODAS críticas. COT em `cot-20260610-sheldrake-cymatics-position.md`. **Próxima sessão**: RQ-020 Patterns (Fase 1 — Synthesis) — desbloqueado agora; OU ir direto para RQ-022 synthesis_v1 (16 lições convergentes já parcialmente visíveis). Fim da Fase 0.
- 2026-06-10 — RQ-020 ✅ Patterns — **20 patterns convergentes extraídos** dos 12 RQs (Fase 1 — Synthesis — desbloqueado). 600+ linhas em `patterns.md`. **5 famílias**: (1) Fundação Algorítmica — número-base 3/9/16/22/64/260, 2 camadas temporais, isomorfismo entre domínios; (2) Visualização — 1 diagrama-mãe, restraint visual (3-4 cores), leitura progressiva 7 camadas, micro-doses 1/dia; (3) Temporalidade — 3+ escalas, cadência semanal+lunar, segunda camada evita loop; (4) Linguagem — mnemônica identidade, suprimir jargão, metáforas corporais, cita fontes; (5) Negócio+Ética — freemium 2-3%, cert B2B, saúde mental, tradição viva, 5% causa, LGPD. **3 insights bônus**: PESSOA×5Pilares é unidade, híbrido IA+humano curado, tradição viva > histórica. **Tabela mestra 20×4** (herda/melhora/evita) + **12 anti-padrões** documentados. **4 decisões estruturantes para RQ-022** (synthesis_v1): (D1) UNIDADE = PESSOA × 5 Pilares sobre Árvore; (D2) TEMPO = 4 escalas (diária + semanal/lunar + sazonal + macro/vida); (D3) MNEMÔNICA = "Akasha nº X" + 1 qualificador; (D4) ÉTICA = citação + transparência + 5% causa + LGPD. COT em `cot-20260610-patterns-extraction.md`. Próximo: RQ-021 Gaps → RQ-022 Synthesis v1 → RQ-023 Mentor persona.
- 2026-06-10 — RQ-022 ✅ Synthesis v1 (Akasha Core Algorithm) — **artefato central da Fase 1 entregue**. 666 linhas em `synthesis/synthesis_v1.md` (13 seções). **Eixo central fixado**: UNIDADE = PESSOA × 5 PILARES sobre Mandala com 4 camadas temporais (D/S/Z/V). **Narrativa única** = "Cicatriz vira Joia" (Tikkun Luriânico 1570 + Shadow→Gift→Siddhi Rudd 2009). **Akasha Core Algorithm v1** em pseudo-código: 6 estágios (normalize → 5 pilares → Mandala → Memória → Mandato → Mentor) + 2 funções detalhadas (emitir, responder) + 10 limites éticos (5 gerais anti-padrão + 5 específicos por Pilar). **Mandala** = 5 anéis concêntricos (P1 dentro → P5 fora) sobre Árvore da Vida redesenhada; SVG server-side, 3-4 cores, mobile-first. **Mandato** = 1 push/dia 06h, 3 frases + 1 pergunta + 1 micro-ritual, cita "via [Pilar X]" em cada afirmação. **Mentor** orquestra; cita Grimório via RAG; detecta crise → CVV 188; nunca afirma futuro. **5 Outputs de Fase 1**: (1) Algorithm ✅, (2) Mandala spec ✅, (3) Mandato spec ✅, (4) Mentor → RQ-023 ⏳, (5) Ethics Charter → RQ-022b ⏳. **7 decisões abertas para v2** (ordem anéis, cores, 11-corpos vs 5-Koshas, parceria Odu, I Ching tradução, push time, i18n). **3 perfis teóricos validados** (Ana mainstream, Bruno cético, Carla vocacional). **Confidence MED-HIGH** no eixo; **7 incertezas honestas** declaradas em §13. COT em `cot-20260610-synthesis-v1-axis.md`. **Próximo**: RQ-023 Mentor persona v1 (Fase 2) + RQ-022b Ethics Charter v1 (paralelo).
- 2026-06-10 — RQ-010 ✅ Tzolkin / Mayan Calendar — **inspiração ESTRUTURAL Pilar 4 (não engine) + maior AVISO ÉTICO do projeto**. 26+ fontes citadas (18 acadêmicas/científicas: Biémont 2025 Springer, Biémont 2008 Wiley, Klokocnik 2010 serbian AJ, Aveni 2001 Skywatchers, Aveni 1995 JHA, Coe 1993/2005, Rice 2007 UT Press, Bricker 2011, Aldana 2022 EncyHistSci, Jenkins 2010 Tortuguero, Thompson 1950, Lounsbury 1978, Böhm 1991/1996, Hochleitner 1970-74, Tedlock 1982, Justeson 1989, Hofling 1992; 5 oficiais/culturais: NMAI Smithsonian, Davies 2016 Maya Archaeologist, MyMayanSign 2020, Gran Consejo Ajq'ij, Saq Be Adam Rubel; 7 críticas: Calleman 2020 x3, Maya-Portal.net Wolak, Wikipedia Dreamspell/Argüelles, Mesoweb 2011 Correlation; 4 técnicas: EECIS Delaware, Mandala.net, Encyclopedia.com, Traced-Ideas). **Posição Akasha**: Tzolkin NÃO é engine; é inspiração estrutural. Adota: **nahual (kin de nascimento)** como paralelo ao orixá de cabeça (Pilar 4); **Calendar Round 52 anos** como 3ª escala temporal (vs Saturn 29.5 / Uranus 42); **5 unidades Long Count** como paralelo aos 5 pilares; **astronomia (Vênus 584d, sol zenital, eclipses pentalunex 148d)** como base conceitual. NÃO adota: contagem Tzolkin (Akasha não é calendário); Dreamspell (jamais); 2012 apocalipse marketing. **MAIOR LIÇÃO ÉTICA**: Dreamspell (Argüelles 1990) vampirizou 30+ anos de percepção pública com shift 50-60 dias + Hunab Ku invented + hidden agenda (Calleman 2020: "Dreamspell foi desenhado para que Argüelles+Lloydine tivessem kins 11+22=33"). Gran Consejo de Ajq'ij rejeita explicitamente. **5 Compromissos Akasha derivados**: (1) toda referência a tradição viva = citação obrigatória + parceria + consentimento; (2) toda "calibração" = proibida; (3) toda "fusão" = justificativa textual + fonte; (4) todo sistema "alternativo" = nomeado "Akasha" (não tradicional); (5) 5% receita Pilar 4 → Saq Be (ou similar). **Aplicação a Pilar 5 (I Ching)**: Akasha usa King Wen sequence (clássica) + cita Wilhelm/Baynes (1950) como "versão popular" + NUNCA segue Argüelles (DNA 4D = pseudo-ciência). COT em `cot-20260610-tzolkin-position.md`. Próximo: RQ-011 Ayurveda.
- 2026-06-10 — RQ-021 ✅ Gaps — **20 oportunidades únicas do Akasha** extraídas em `gaps.md`
- 2026-06-11 — R-022b ✅ Ethics Charter v1 — **8 Pilares de Ética** consolidados em `ethics/ethics_charter_v1.md` (~600 linhas, 11 seções, sem código). Decisões D1-D8: (D1) **8 Pilares exaustivos** (Citação + Tradição Viva + LGPD by Design + Híbrido IA+Humano + Não-Objetivos + PT-BR + Atualização Opcional + Aprovação Humana) cobrindo 8 axiomas VISION + 8 anti-gaps; (D2) 12 regras E1-E12 mantidas como subset do Pilar 3-4; (D3) **5% earmark × 5 Pilares = 25% total** Ano 5 (R$ 500k, diferenciação vs CHANI 5% genérico); (D4) **Crise → CVV 188** (regex expandido, resposta não-LLM, 5 estados saúde espiritual); (D5) sem feed/gamificação/comparação como padrão técnico; (D6) **4 aprovações** (Pilar+Curador+Comitê+Usuário) para mudar Charter via RFC pública 30d; (D7) **white paper anual** + auditoria externa 1 firma + DPO mensal; (D8) PT-BR primeiro, EN opt-in, termos preservados (Tikkun/Tiferet/Odu/Tridosha/Orixá/Kether/Tzimtzum), transliteração reversível. Cita TODAS as críticas (Manohar 2018, Sheldrake, Dreamspell, Pittenger 2005, JASNH, Hufford 2003). 5 parcerias vivas mapeadas (Casa de Cabala/FAA/BAMS/Saq Be/Book of Changes Academy). Feature_list R-022b = passes:true. COT `cot-20260611-ethics-charter-v1.md`. Próxima sessão: D-005 (3 perfis refine) OU D-040 (Prisma schema 5 pilares) OU D-042 (Zod types 10 perfis) — escolhe por prioridade do fase 5 vs fase 1. (~600+ linhas, 6 famílias, 8 anti-gaps rejeitados; 16 HIGH + 4 MED-HIGH confidence). **6 famílias**: (1) **Cobertura multi-tradição** — #1 ≥3 tradições em 1 algoritmo, #2 igual dignidade epistêmica, #3 isomorfismo explícito (não sincretismo); (2) **Geografia/Sul Global** — #4 PT-BR first, #5 Tradições Matriz Africana/Indígena como Pilar vivo, #6 Ayurveda com rigor acadêmico; (3) **Ética** — #7 LGPD by design + crise, #8 burnout espiritual como estado, #9 AI Mentor transparente + híbrido humano, #10 white paper anual + auditoria externa; (4) **AI+Cert** — #11 Grimório curado + RAG mandatório, #12 memória de conversa estruturada, #13 cert 3-níveis acessível (R$295/895/1995); (5) **Temporalidade** — #14 4 escalas simultâneas, #15 Tikkun Luriânico como 2ª camada, #16 determinismo técnico + abertura existencial; (6) **Negócio** — #17 precificação escalonada ética, #18 5% causa earmark por Pilar, #19 institucional sem guru-dependência, #20 atualização opcional + leitura fixa. **8 anti-gaps rejeitados** (com razão ética explícita): feed social / gamificação+streaks / AI como espírito / eleição astrológica / 528-432Hz / MBTI dating / consulta avulsa paga / comentários públicos sobre usuários. **Princípio unificador**: Akasha = 1ª tentativa institucional brasileira de síntese multi-tradição com ética pública + LGPD nativo + AI híbrido + tradição viva creditada + 5% causa + precificação escalonada. **Conexão RQ-022**: 5 outputs esperados (Algorithm + Mandala + Mentor + Pricing + Ethics Charter). COT em `cot-20260610-gaps-extraction.md`. Próximo: RQ-022 Synthesis v1 → RQ-023 Mentor persona.

---

## FASE 6 — IMPLEMENTATION (NOVA — após Fases 0-5 ✅)

**Regra nova:** Cada sessão entrega **código em `apps/`, `packages/`, `src/`** — não research.

### FASE 7 Hardening (já abertos)
- [ ] F-100 — Refactor (knip/ts-prune) — 30min
- [ ] F-101 — Deadcode — 20min
- [ ] F-102 — Security (OWASP top 10) — 40min ← P1
- [ ] F-103 — Performance (bundle, N+1) — 40min
- [ ] F-104 — Docs sync — 20min

### FASE 6 Implementation (novos)
- [ ] F-200 — Integrar R-030 (akasha.calcular) com engines reais — P0
- [ ] F-201 — API `/api/akasha/mandato-do-dia` retorna MandatoEsqueleto — P0
- [ ] F-202 — Página Diário Energético (Mandato + 3 frases + pergunta + ritual) — P1
- [ ] F-203 — MandalaChart consome 5 Pilares (cor/icon) — P1
- [ ] F-204 — Substituir stubs do akasha-core.ts por loadEngines() real — P2
- [x] F-205 — Página Sobre o Sistema (Cicatriz vira Joia) ✅ 2026-06-11
       — `apps/akasha-portal/src/app/[locale]/(akasha)/sobre/page.tsx`
       (server component, sem auth, sem API). Hero + 5 Pilares (P1..P5
       com fonte canônica) + 4 Camadas (D/S/Z/V) + 6 Compromissos
       éticos + footer proveniência. Nav em layout.tsx atualizado.
       Commit `7cdc7729`. 463 linhas, 1 file.
- [ ] F-206 — Tooltip por Pilar com citação — P2
- [ ] F-207 — 3 perfis de teste reais (Ana, Bruno, Carlos) — P1

