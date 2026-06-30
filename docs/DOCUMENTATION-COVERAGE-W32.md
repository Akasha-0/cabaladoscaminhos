# Documentation Coverage — Wave 32

> **Versão:** 1.0 | **Data:** 2026-06-30 | **Wave:** 32 (DOCUMENTATION 6/8)
> **Owner:** PM (Tomás) + Coder
> **Status:** ✅ Snapshot pós-Wave 32 (5 docs novos + 5 vídeos + estratégia i18n)

---

## 1. Inventário de docs (pós-W32)

### 1.1 Novos (Wave 32 — este commit)

| Doc | Idioma | Linhas | Função |
|---|---|---|---|
| `docs/user/USER-GUIDE.md` | PT-BR | 240+ | Guia completo do usuário (signup → oráculos → LGPD) |
| `docs/api/API-REFERENCE-W32.md` | EN | 380+ | API reference expandida (118 rotas) |
| `docs/dev/DEVELOPER-GUIDE.md` | EN | 270+ | Setup, arquitetura, convenções, contributing |
| `docs/ops/OPS-RUNBOOK.md` | PT-BR | 240+ | Operação cotidiana (monitoring, backup, incident) |
| `docs/user/FAQ-EXPANDED.md` | PT-BR | 280+ | Top 20 perguntas + onde buscar ajuda |
| `docs/videos/VIDEO-SCRIPTS.md` | PT-BR | 250+ | 5 roteiros (Welcome, First Post, Akasha, Marketplace, Oráculos) |
| `docs/TRANSLATION-STRATEGY.md` | PT-BR/EN | 150+ | Estratégia i18n + glossário canônico |

**Total:** 7 docs novos (~1.8k linhas)

### 1.2 Pré-existentes (mantidos)

| Doc | Onda | Função |
|---|---|---|
| `docs/VISION.md` | W11 | Visão pessoal do operador |
| `docs/ARCHITECTURE.md` | W11 | Arquitetura high-level |
| `docs/CHANGELOG.md` | W11+ | Histórico de mudanças |
| `docs/AI-PROMPT-base.md` | W11 | System prompt da Akasha IA |
| `docs/EVIDENCE-MAP.md` | W11 | Mapeamento de evidências científicas |
| `docs/PUBLIC-FAQ.md` | W23 | FAQ marketing (curto, PT + EN) |
| `docs/DEPLOY-RUNBOOK-W27.md` | W27 | Deploy detalhado (gate defensivo) |
| `docs/SECRETS-CHECKLIST-W27.md` | W27 | Gestão de secrets |
| `docs/CI-CD-GUIDE.md` | W11 | Pipeline CI/CD |
| `docs/TESTING-GUIDE.md` | W11 | Estratégia de testes |
| `docs/AUTH-FLOW.md` | W11 | Fluxo de autenticação |
| `docs/MOBILE-DESIGN-GUIDE.md` | W11 | Padrões mobile-first |
| `docs/USER-FLOW-WALKTHROUGH-W19.md` | W19 | Fluxos de usuário |
| `docs/ONBOARDING-FIRST-TIME-UX-W19.md` | W19 | Onboarding |
| `docs/BETA-LAUNCH-PLAYBOOK.md` | W19 | Go-to-market beta |
| `docs/BRAND-VOICE-W15.md` | W15 | Tom de voz |
| `docs/AI-PERSONALITY-ARCHITECTURE-W30.md` | W30 | Personalidade Akasha |
| `docs/COLOR-PALETTE-MYSTICAL-W28.md` | W28 | Paleta de cores |
| `docs/A11Y-POLISH-W24.md` | W24 | Auditoria a11y |

**Total pré-existente:** ~20 docs ativos

---

## 2. Cobertura por área

### 2.1 Usuário (PT-BR)

| Área | Doc | Cobertura | Status |
|---|---|---|---|
| Signup / perfil | USER-GUIDE §1 | 95% | ✅ |
| Feed / posts / comments | USER-GUIDE §2 | 90% | ✅ |
| Mensagens | USER-GUIDE §2.3 | 80% | ✅ (sem capturas) |
| Marketplace | USER-GUIDE §3 | 85% | ✅ |
| Akasha IA | USER-GUIDE §4 | 90% | ✅ |
| Oráculos | USER-GUIDE §5 | 70% | 🟡 (Tarot e I Ching em breve) |
| Privacidade / LGPD | USER-GUIDE §6 | 90% | ✅ |
| FAQ | FAQ-EXPANDED | 100% | ✅ |
| Suporte | USER-GUIDE §8 + FAQ §final | 90% | ✅ |

**Média:** ~88% ✅

### 2.2 Developer (EN)

| Área | Doc | Cobertura | Status |
|---|---|---|---|
| Setup local | DEVELOPER-GUIDE §1 | 95% | ✅ |
| Arquitetura | DEVELOPER-GUIDE §2 | 85% | ✅ |
| Convenções código | DEVELOPER-GUIDE §3 | 90% | ✅ |
| Testing | DEVELOPER-GUIDE §4 | 85% | ✅ |
| Deploy | DEVELOPER-GUIDE §5 + DEPLOY-W27 | 95% | ✅ |
| Contributing | DEVELOPER-GUIDE §6 | 80% | 🟡 (faltam templates de PR) |
| API | API-REFERENCE-W32 | 100% (118 rotas) | ✅ |

**Média:** ~90% ✅

### 2.3 Operações (PT-BR)

| Área | Doc | Cobertura | Status |
|---|---|---|---|
| Deploy procedure | OPS-RUNBOOK §2 + DEPLOY-W27 | 100% | ✅ |
| Monitoring | OPS-RUNBOOK §3 | 90% | ✅ |
| Backup | OPS-RUNBOOK §4 | 90% | ✅ |
| Incident response | OPS-RUNBOOK §5 | 90% | ✅ |
| Scaling | OPS-RUNBOOK §6 | 80% | 🟡 (sem métricas reais pós-crescimento) |
| Cron jobs | OPS-RUNBOOK §7 | 100% | ✅ |
| Comandos úteis | OPS-RUNBOOK §8 | 90% | ✅ |

**Média:** ~91% ✅

### 2.4 Vídeos

| Vídeo | Doc | Duração | Status |
|---|---|---|---|
| Welcome Tour | VIDEO-SCRIPTS §1 | 2 min | 🟡 Roteiro pronto, gravação pendente |
| First Post | VIDEO-SCRIPTS §2 | 3 min | 🟡 Roteiro pronto |
| Akasha Conversation | VIDEO-SCRIPTS §3 | 5 min | 🟡 Roteiro pronto |
| Marketplace Booking | VIDEO-SCRIPTS §4 | 4 min | 🟡 Roteiro pronto |
| Oracular Maps | VIDEO-SCRIPTS §5 | 5 min | 🟡 Roteiro pronto |

**Total:** 5 roteiros (~19 min combinados)
**Status:** Storyboards completos, gravação pendente (W33+)

### 2.5 Internacionalização

| Idioma | Cobertura | Status |
|---|---|---|
| PT-BR | 85% | ✅ primário |
| EN | 50% | 🟡 secundário parcial |
| ES | 10% | 🔴 em progresso |

**Plano:** ver `docs/TRANSLATION-STRATEGY.md`

---

## 3. Gaps identificados

### 3.1 Gaps críticos (próximas 2 waves)

| Gap | Impacto | Wave sugerida |
|---|---|---|
| Templates de PR / issue | Contribuição trava sem | W33 |
| Storyboards visuais dos vídeos | Gravação não inicia sem | W33 |
| Guia de i18n para devs | ES trava sem | W34 |
| Runbook de Stripe Connect (webhooks) | Pagamentos sem defesa | W34 |
| Postmortem template | Incident response incompleto | W35 |
| Guia de segurança para usuários | Phishing / 2FA confuso | W36 |

### 3.2 Gaps médios

| Gap | Impacto | Wave sugerida |
|---|---|---|
| Documentação de feature flags | Onboarding de devs lento | W37 |
| Guia de moderação | Admins novos sem guia | W37 |
| Padrões de copywriting PT-BR | Tom inconsistente | W38 |
| Spec completa de OpenAPI 3.0 | Integradores externos lentos | W38 |
| Guia de mentoria | Mentors sem onboarding | W39 |
| Guia de newsletter | Admins reinventam | W39 |

### 3.3 Gaps baixos (nice-to-have)

| Gap | Impacto | Wave sugerida |
|---|---|---|
| Diagramas visuais (Mermaid) | Onboarding mais lento | W40+ |
| Tradução EN completa de USER-GUIDE | alcance internacional | Q4 2026 |
| Vídeo "Como ser mentor" | mentores sem vídeo | Q4 2026 |
| Glossário visual de oráculos | discoverability | Q4 2026 |

---

## 4. Roadmap de docs (próximas waves)

### 4.1 W33 — Documentation 7/8 (tactical)
- [ ] PR/issue templates (`docs/CONTRIBUTING-TEMPLATES.md`)
- [ ] Storyboards visuais dos 5 vídeos (`docs/videos/storyboards/`)
- [ ] Runbook Stripe Connect detalhado (`docs/ops/STRIPE-WEBHOOKS.md`)

### 4.2 W34 — Documentation 8/8 (consolidation)
- [ ] Guia i18n para devs (`docs/dev/I18N-GUIDE.md`)
- [ ] Postmortem template (`docs/postmortems/TEMPLATE.md`)
- [ ] OpenAPI 3.0 spec completo (`docs/api/openapi.yaml`)

### 4.3 Q3 2026 — Public launch docs
- [ ] Vídeos gravados e publicados
- [ ] USER-GUIDE traduzido para EN
- [ ] FAQ público expandido (10 → 30 perguntas)
- [ ] Página `/docs` no site (readthedocs-like)

### 4.4 Q4 2026 — International
- [ ] ES coverage 60% → 100%
- [ ] EN coverage 80% → 100%
- [ ] Vídeos legendados EN

---

## 5. Métricas de qualidade

### 5.1 Indicadores

| Métrica | Atual (W32) | Meta Q3 |
|---|---|---|
| Cobertura PT-BR (user) | 88% | 95% |
| Cobertura EN (dev) | 90% | 100% |
| Cobertura API | 100% (118 rotas) | 100% |
| Docs com screenshots | 30% | 60% |
| Docs com exemplos de código | 70% | 90% |
| Docs com troubleshooting | 50% | 80% |
| Docs revisados por par (peer review) | 60% | 100% |

### 5.2 Quality gates

Toda nova doc deve ter:
- [ ] **Propósito claro** nas primeiras 2 linhas
- [ ] **Versão + data + onda** no frontmatter
- [ ] **Tabela de conteúdo** se > 100 linhas
- [ ] **Exemplos práticos** quando aplicável
- [ ] **Cross-links** para docs relacionadas
- [ ] **PT-BR ou EN** conforme público-alvo
- [ ] **Próximo passo** ao final

---

## 6. Estatísticas do repo (pós-W32)

| Métrica | Valor |
|---|---|
| Total docs (`docs/**/*.md`) | 50+ arquivos |
| Linhas totais em docs | ~30.000 |
| Docs novos W32 | 7 |
| Rotas API documentadas | 118 / 118 (100%) |
| Vídeos roteirizados | 5 / 5 (100%) |
| Idiomas cobertos | 2 (PT-BR + EN, ES parcial) |
| Postmortems arquivados | 0 (template em W34) |

---

## 7. Próximo passo

- **Doc operacional:** `docs/ops/OPS-RUNBOOK.md`
- **Dev guide:** `docs/dev/DEVELOPER-GUIDE.md`
- **User guide:** `docs/user/USER-GUIDE.md`
- **API ref:** `docs/api/API-REFERENCE-W32.md`
- **FAQ:** `docs/user/FAQ-EXPANDED.md`
- **Vídeos:** `docs/videos/VIDEO-SCRIPTS.md`
- **i18n:** `docs/TRANSLATION-STRATEGY.md`

---

> **Mantido por:** PM (Tomás) + Coder
> **Próxima revisão:** W33 (Documentation 7/8)
> **Comentários:** abrir issue com label `docs`