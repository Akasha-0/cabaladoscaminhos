# Research INDEX — Sistema Akasha (Fase 0)

> **Mapa vivo** de toda a pesquisa realizada.
> Última atualização: 2026-06-11 — R-022b ✅ Ethics Charter v1 (governança consolidada).

---

## Sistemas Estudados

| ID | Sistema | Status | Arquivo | Tempo | Prioridade |
|----|---------|--------|---------|-------|------------|
| RQ-001 | **Gene Keys** (Richard Rudd) | ✅ DONE | [systems/gene-keys.md](systems/gene-keys.md) | 90 min | P0 |
| RQ-002 | **Human Design** (Ra Uru Hu) | ✅ DONE | [systems/human-design.md](systems/human-design.md) | 90 min | P0 |
| RQ-003 | **MBTI / Jung** | ✅ DONE | [systems/mbti-jung.md](systems/mbti-jung.md) | 60 min | P1 |
| RQ-004 | **Enneagrama** | ✅ DONE | [systems/enneagram.md](systems/enneagram.md) | 75 min | P1 |
| RQ-005 | **Co-Star** | ✅ DONE | [systems/costar.md](systems/costar.md) | 90 min | P0 |
| RQ-006 | **The Pattern** (Lisa Donovan) | ✅ DONE | [systems/the-pattern.md](systems/the-pattern.md) | 30 min | P1 |
| RQ-007 | **CHANI App** (Chani Nicholas) | ✅ DONE | [systems/chani-app.md](systems/chani-app.md) | 75 min | P1 |
| RQ-008 | **Cabala Clássica / Árvore da Vida** | ✅ DONE | [systems/kabbalah.md](systems/kabbalah.md) | 75 min | P0 |
| RQ-009 | **Numerologia Cabalística Ocidental** | ✅ DONE | [systems/cabalistic-numerology.md](systems/cabalistic-numerology.md) | 60 min | P1 |
| RQ-010 | Tzolkin / Mayan Calendar | ✅ DONE | [systems/tzolkin.md](systems/tzolkin.md) | 45 min | P2 |
| RQ-011 | Ayurveda | ✅ DONE | [systems/ayurveda.md](systems/ayurveda.md) | 60 min | P2 |
| RQ-012 | Sheldrake + Cymatics | ✅ DONE | [systems/sheldrake-cymatics.md](systems/sheldrake-cymatics.md) | 30 min | P2 |
| R-013 | **I Ching 64 Hexagramas** (King Wen + Wilhelm/Baynes) | ✅ DONE | [systems/iching-64.md](systems/iching-64.md) | 110 min | P0 |

**Progresso:** 13/13 sistemas (108%) — **Fase 0 (Research) EXPANDIDA** com Pilar 5.

---

## Síntese & Design (Fase 1-4)

| ID | Tarefa | Status | Arquivo | Dependências |
|----|--------|--------|---------|--------------|
| RQ-020 | Patterns (padrões comuns) | ✅ | patterns.md | R-001..R-012 |
| RQ-021 | Gaps (o que ninguém cobre) | ✅ | gaps.md | R-020 |
| RQ-022 | Eixo central Akasha (síntese) | ✅ | synthesis_v1.md | R-021 |
| RQ-023 | AI Mentor persona | ✅ | mentor/persona_v1.md | R-022 |
| RQ-024 | UX architecture | ✅ | ux/architecture_v1.md | R-022, R-023 |
| RQ-025 | Tech stack | ✅ | tech_decisions.md | R-024 |
| R-022b | **Ethics Charter v1** (governança) | ✅ | ethics/ethics_charter_v1.md | R-022, R-023, R-021 |
| R-030 | Akasha Core Algorithm (TS puro) | ✅ | packages/akasha-core/src/akasha-core.ts | R-022 |
| D-043 | 10 perfis representativos (fixtures+tests) | ✅ | packages/akasha-core/src/profiles-fixtures.ts + profiles.test.ts | R-030 |
| D-044 | Validação knowledge base (correlation-map) | ✅ | packages/akasha-core/src/correlation-validation.test.ts | R-030 |
| D-040 | Schema Prisma 5 Pilares (design proposal) | 🟡 design | .autonomous/research/designs/d-040-prisma-5-pilares-design.md | R-030, D-044 |

---

## Chain-of-Thought (decisões importantes)

| Data | Slug | Título |
|------|------|--------|
| 2026-06-10 | cot-20260610-gene-keys-synthesis | Por que Gene Keys é o modelo primário de Akasha |
| 2026-06-10 | cot-20260610-human-design-synthesis | Por que Human Design é o modelo de UX/visualização (não síntese) |
| 2026-06-10 | cot-20260610-mbti-jung-position | Por que Akasha usa Jung (funções), não Myers (dicotomia forçada) |
| 2026-06-10 | cot-20260610-enneagram-position | Por que Enneagrama é o Pilar DINÂMICO (tempo) do Akasha |
| 2026-06-10 | cot-20260610-costar-position | Por que Co-Star é referência de UX/micro-dose, NÃO de voz/tom |
| 2026-06-10 | cot-20260610-kabbalah-position | Árvore da Vida = esqueleto topológico do Pilar 1 (herda+filtra+cita) |
| 2026-06-10 | cot-20260610-cabalistic-numerology-position | Numerologia Cabalística = engine numérica do Pilar 1 (Mispar Hechrachi + Katan Mispari) |
| 2026-06-10 | cot-20260610-the-pattern-position | The Pattern = referência de LINGUAGEM DO MENTOR (Pilar 5), não de UX nem síntese |
| 2026-06-10 | cot-20260610-chani-app-position | CHANI App = Pilar 2 (Astrologia) + Pilar 4 (Ritual) — Whole Sign + Rising>Sol>Lua + bundle semanal lunar |
| 2026-06-10 | cot-20260610-tzolkin-position | Tzolkin = inspiração estrutural Pilar 4 + MAIOR aviso ético (Dreamspell = apropriação; 5 compromissos éticos) |
| 2026-06-10 | cot-20260610-ayurveda-position | Ayurveda = Tridosha Pilar 3 + Ritucharya Pilar 4 (escala sazonal 4m única) + 7 decisões Akasha |
| 2026-06-10 | cot-20260610-sheldrake-cymatics-position | Sheldrake = metafora pedagógica (NÃO mecanismo) + Cymatics = visual Pilar 4 (NÃO 528/432Hz); 5 decisões éticas; memetics > morphic fields |
| 2026-06-10 | cot-20260610-patterns-extraction | 20 patterns convergentes em 5 famílias (algorítmica/visual/temporal/linguagem/negócio) + 12 anti-padrões; 4 decisões estruturantes para RQ-022 |
| 2026-06-10 | cot-20260610-gaps-extraction | 20 gaps em 6 famílias (multi-tradição/geografia/ética/AI/tempo/negócio) + 8 anti-gaps rejeitados; 16 HIGH + 4 MED-HIGH confidence; 5 outputs esperados para RQ-022 |
| 2026-06-10 | cot-20260610-synthesis-v1-axis | RQ-022 Eixo central: PESSOA × 5 PILARES sobre Mandala com 4 camadas (D/S/Z/V); narrativa "Cicatriz vira Joia" (Tikkun + Shadow→Gift→Siddhi); 7 decisões D1-D7; 10 limites éticos |
| 2026-06-10 | cot-20260610-tech-stack-decisions | R-025 7 decisões: Next.js 16.2+Turbopack / Postgres 16+pgvector (Supabase sa-east-1) / Sonnet 4.6+Haiku 4.5+Minimax / SSE Edge / Supabase Auth+RLS / Stripe mantém / Vercel+Supabase; D-037 Prisma 7 mantém; 5 incertezas + 10 decisões abertas O-1..O-10; Custo MVP $50-60/mo; 30+ fontes 2026 |
| 2026-06-10 | cot-20260610-mentor-persona-v1 | RQ-023 Mentor Persona v1: 6 decisões D1-D6 (sem-nome, 3ª pessoa, LLM redige, citação obrigatória, 5 estados saúde, híbrido IA+humano); 12 regras éticas E1-E12; 5 samples de diálogo; system prompt base v1; 3 camadas de memória; LGPD by design |
| 2026-06-11 | cot-20260611-ethics-charter-v1 | R-022b Ethics Charter v1: 8 decisões D1-D8 (8 Pilares de Ética exaustivos cobrindo 8 axiomas VISION; 12 regras E1-E12 subset Pilar 3-4; 5% earmark × 5 = 25% Ano 5; Crise→CVV 188 não-LLM; sem feed/gamificação; 4 aprovações governança; white paper anual+auditoria+DPO; PT-BR primeiro EN opt-in); 11 seções, ~600 linhas; governança com 4 aprovações + RFC pública 30d; 5 parcerias vivas mapeadas (Casa de Cabala/FAA/BAMS/Saq Be/Book of Changes Academy) |
| 2026-06-11 | cot-20260611-d-043-10-perfis | D-043 10 perfis representativos: 6 decisões D1-D6 (1 vetor por perfil, contrato≠snapshot, cisão crise explícita, sem PII real, fontes whitelisted FONTES_VALIDAS, Pilar 4 ethics invariant); 11 personas = 10 normais + 1 crise; 69 testes verdes; valida R-030 antes Fase 6 |
| 2026-06-11 | cot-20260611-d-044-correlation-validation | D-044 knowledge base: 5 decisões D1-D5 (15 canônico não 16, divergência documentada não corrigida, hook bloqueou vacuous test, tipos como auditoria, ranges>enums); 4 achados F1-F4 (Eji substitui Ogbe, stub diverge 2 Odus, ranges 100% conformes, inversão bijetiva); 90 testes verdes; 298/298 packages/akasha-core |
| 2026-06-11 | cot-20260611-d-040-prisma-design-proposal | D-040 Prisma 5 Pilares: 6 decisões D1-D6 (DESIGN PROPOSAL não aplicação, backward compat 1 release, 3 achados, 5 riscos, feature_list status pending, 3 horizontes próximos passos); 3 achados (Pilar 5 em User.ichingMap, Mandala sem persistência, Pilar 4 ethics invariant não enforced); aguarda aprovação humana antes de pnpm db:migrate |
| 2026-06-11 | cot-20260611-r-013-iching-pilar-5 | R-013 I Ching 64 Pilar 5: 7 decisões D1-D7 (Pilar 5 = Motor de Mutação NÃO oráculo; Hex. dia via solstício OU Jiazi 60; 12 fases 長生 como eixo D/S/Z/V; Phillips 1994 hexagrama↔Sefirá citável; tríade Shadow/Gift/Siddhi vocabulário público Rudd 2009; 24 fontes verificadas Exa; 8 decisões Pilar 5 D-045..D-052); 13/13 sistemas Akasha; fecha GAP 5ª tradição VISION.md |

---

## Arquivos Gerados até Agora

```
.autonomous/research/
├── INDEX.md                        ← este arquivo
├── systems/
│   ├── gene-keys.md                ✅ (R-001)
│   ├── human-design.md             ✅ (R-002)
│   ├── mbti-jung.md                ✅ (R-003)
│   ├── enneagram.md                ✅ (R-004)
│   ├── costar.md                   ✅ (R-005)
│   ├── kabbalah.md                 ✅ (R-008)
│   ├── cabalistic-numerology.md    ✅ (R-009)
│   ├── the-pattern.md              ✅ (R-006)
│   ├── chani-app.md                 ✅ (R-007)
│   └── tzolkin.md                   ✅ (R-010)
│   ├── ayurveda.md                  ✅ (R-011)
│   └── sheldrake-cymatics.md        ✅ (R-012)
└── chain-of-thought/
    ├── cot-20260610-gene-keys-synthesis.md
    ├── cot-20260610-human-design-synthesis.md
    ├── cot-20260610-mbti-jung-position.md
    ├── cot-20260610-enneagram-position.md
    ├── cot-20260610-costar-position.md
    ├── cot-20260610-kabbalah-position.md
    ├── cot-20260610-cabalistic-numerology-position.md
    ├── cot-20260610-the-pattern-position.md
    ├── cot-20260610-chani-app-position.md
    ├── cot-20260610-tzolkin-position.md
    ├── cot-20260610-ayurveda-position.md
    ├── cot-20260610-sheldrake-cymatics-position.md
    ├── cot-20260610-patterns-extraction.md
    ├── cot-20260610-gaps-extraction.md
    └── cot-20260610-synthesis-v1-axis.md
├── synthesis/
│   └── synthesis_v1.md             ✅ (R-022)
├── mentor/
│   └── persona_v1.md               ✅ (R-023)
├── ethics/
│   └── ethics_charter_v1.md        ✅ (R-022b)
```

---

## Próximo Passo

**RQ-022 ✅ Synthesis v1 (Fase 1) COMPLETO — Akasha Core Algorithm definido.** Eixo central: PESSOA × 5 PILARES sobre Mandala com 4 camadas temporais (D/S/Z/V); narrativa "Cicatriz vira Joia" (Tikkun + Shadow→Gift→Siddhi). Próxima fase: **RQ-023 Mentor persona v1** (Fase 2 — AI Mentor). Dependência direta: synthesis_v1.md §7.
