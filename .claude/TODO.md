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
- [ ] D-003 — Definir eixo central do Akasha (qual a UNIDADE de
       síntese? — Mandala? Linha do tempo? Persona?)
- [ ] D-004 — Propor Akasha Core Algorithm v1 (markdown, não código)
- [ ] D-005 — Validar v1 com 3 perfis de teste (descrever só)
- [ ] D-006 — Iterar até v3 com feedback interno

## FASE 2 — AI Mentor

- [ ] D-010 — Definir persona do Mentor (nome, voz, história)
- [ ] D-011 — Escrever system prompt base (com guard-rails)
- [ ] D-012 — Protocolo de RAG (citação obrigatória do Grimório)
- [ ] D-013 — Comportamento ético (crise, fatalismo, vício)
- [ ] D-014 — Tom de voz: exemplos de dialog (5+ samples)
- [ ] D-015 — Memória de conversa (estrutura)

## FASE 3 — UX Architecture

- [ ] D-020 — Decisão mobile-first PWA vs app nativo
- [ ] D-021 — Estrutura de descoberta progressiva (micro-doses)
- [ ] D-022 — Telas-chave: Mandala, Mandato, Mural, Ritual, Mentor
- [ ] D-023 — Interação com IA (streaming, voz, texto)
- [ ] D-024 — Acessibilidade WCAG 2.2 AA
- [ ] D-025 — Internacionalização (PT-BR primeiro, EN depois)

## FASE 4 — Tech Stack

- [ ] D-030 — Confirmar Next.js 16 + Turbopack
- [ ] D-031 — DB: Postgres + pgvector (embeddings)
- [ ] D-032 — LLM: OpenAI (gpt-4) + Minimax fallback
- [ ] D-033 — Realtime: SSE vs WebSocket
- [ ] D-034 — Auth: JWT próprio vs Supabase vs Clerk
- [ ] D-035 — Payments: Stripe (mantém)
- [ ] D-036 — Deploy: VPS vs Vercel vs edge

## FASE 5 — Protótipo (após Fases 0-4)

- [ ] D-040 — Schema Prisma com 5 pilares
- [ ] D-041 — Akasha Core Algorithm em TS puro
- [ ] D-042 — Tipos Zod para inputs/outputs
- [ ] D-043 — Testes com 10 perfis representativos
- [ ] D-044 — Validar com cabala-corr-validator

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
- 2026-06-10 — RQ-010 ✅ Tzolkin / Mayan Calendar — **inspiração ESTRUTURAL Pilar 4 (não engine) + maior AVISO ÉTICO do projeto**. 26+ fontes citadas (18 acadêmicas/científicas: Biémont 2025 Springer, Biémont 2008 Wiley, Klokocnik 2010 serbian AJ, Aveni 2001 Skywatchers, Aveni 1995 JHA, Coe 1993/2005, Rice 2007 UT Press, Bricker 2011, Aldana 2022 EncyHistSci, Jenkins 2010 Tortuguero, Thompson 1950, Lounsbury 1978, Böhm 1991/1996, Hochleitner 1970-74, Tedlock 1982, Justeson 1989, Hofling 1992; 5 oficiais/culturais: NMAI Smithsonian, Davies 2016 Maya Archaeologist, MyMayanSign 2020, Gran Consejo Ajq'ij, Saq Be Adam Rubel; 7 críticas: Calleman 2020 x3, Maya-Portal.net Wolak, Wikipedia Dreamspell/Argüelles, Mesoweb 2011 Correlation; 4 técnicas: EECIS Delaware, Mandala.net, Encyclopedia.com, Traced-Ideas). **Posição Akasha**: Tzolkin NÃO é engine; é inspiração estrutural. Adota: **nahual (kin de nascimento)** como paralelo ao orixá de cabeça (Pilar 4); **Calendar Round 52 anos** como 3ª escala temporal (vs Saturn 29.5 / Uranus 42); **5 unidades Long Count** como paralelo aos 5 pilares; **astronomia (Vênus 584d, sol zenital, eclipses pentalunex 148d)** como base conceitual. NÃO adota: contagem Tzolkin (Akasha não é calendário); Dreamspell (jamais); 2012 apocalipse marketing. **MAIOR LIÇÃO ÉTICA**: Dreamspell (Argüelles 1990) vampirizou 30+ anos de percepção pública com shift 50-60 dias + Hunab Ku invented + hidden agenda (Calleman 2020: "Dreamspell foi desenhado para que Argüelles+Lloydine tivessem kins 11+22=33"). Gran Consejo de Ajq'ij rejeita explicitamente. **5 Compromissos Akasha derivados**: (1) toda referência a tradição viva = citação obrigatória + parceria + consentimento; (2) toda "calibração" = proibida; (3) toda "fusão" = justificativa textual + fonte; (4) todo sistema "alternativo" = nomeado "Akasha" (não tradicional); (5) 5% receita Pilar 4 → Saq Be (ou similar). **Aplicação a Pilar 5 (I Ching)**: Akasha usa King Wen sequence (clássica) + cita Wilhelm/Baynes (1950) como "versão popular" + NUNCA segue Argüelles (DNA 4D = pseudo-ciência). COT em `cot-20260610-tzolkin-position.md`. Próximo: RQ-011 Ayurveda.
- 2026-06-10 — RQ-021 ✅ Gaps — **20 oportunidades únicas do Akasha** extraídas em `gaps.md` (~600+ linhas, 6 famílias, 8 anti-gaps rejeitados; 16 HIGH + 4 MED-HIGH confidence). **6 famílias**: (1) **Cobertura multi-tradição** — #1 ≥3 tradições em 1 algoritmo, #2 igual dignidade epistêmica, #3 isomorfismo explícito (não sincretismo); (2) **Geografia/Sul Global** — #4 PT-BR first, #5 Tradições Matriz Africana/Indígena como Pilar vivo, #6 Ayurveda com rigor acadêmico; (3) **Ética** — #7 LGPD by design + crise, #8 burnout espiritual como estado, #9 AI Mentor transparente + híbrido humano, #10 white paper anual + auditoria externa; (4) **AI+Cert** — #11 Grimório curado + RAG mandatório, #12 memória de conversa estruturada, #13 cert 3-níveis acessível (R$295/895/1995); (5) **Temporalidade** — #14 4 escalas simultâneas, #15 Tikkun Luriânico como 2ª camada, #16 determinismo técnico + abertura existencial; (6) **Negócio** — #17 precificação escalonada ética, #18 5% causa earmark por Pilar, #19 institucional sem guru-dependência, #20 atualização opcional + leitura fixa. **8 anti-gaps rejeitados** (com razão ética explícita): feed social / gamificação+streaks / AI como espírito / eleição astrológica / 528-432Hz / MBTI dating / consulta avulsa paga / comentários públicos sobre usuários. **Princípio unificador**: Akasha = 1ª tentativa institucional brasileira de síntese multi-tradição com ética pública + LGPD nativo + AI híbrido + tradição viva creditada + 5% causa + precificação escalonada. **Conexão RQ-022**: 5 outputs esperados (Algorithm + Mandala + Mentor + Pricing + Ethics Charter). COT em `cot-20260610-gaps-extraction.md`. Próximo: RQ-022 Synthesis v1 → RQ-023 Mentor persona.
