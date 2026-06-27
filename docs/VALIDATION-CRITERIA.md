# 📏 Critérios de Validação — Akasha Portal

> **Versão:** 1.0 | **Data:** 2026-06-26
> **Pergunta respondida:** "Quando decidimos seguir, pivotar ou matar o projeto?"

---

## TL;DR

| Janela | Métrica principal | Meta | Decisão |
|---|---|---|---|
| **7 dias** | Conversion rate da landing | >5% | Continuar |
| **30 dias** | Signups totais | >300 | Continuar |
| **60 dias** | D7 retention | >25% | Continuar |
| **90 dias** | DAU/MAU + NPS | >25% + >40 | Scale up |

Se qualquer métrica ficar **< 50% da meta em 2 janelas consecutivas**, **PIVOTAR**.

---

## Fase 0 — Landing de validação (1 dia → 7 dias)

### Objetivo
Medir se as pessoas **querem** o que a gente tá oferecendo.

### Métricas

| Métrica | Meta | Como medir |
|---|---|---|
| **Visitantes únicos** | >500 | PostHog ou GA |
| **Conversion rate** | >5% (visitante → signup) | `(signups / visitors) × 100` |
| **Bounce rate** | <70% | PostHog |
| **Scroll depth (50%)** | >30% | PostHog (tracking pixel) |
| **Tempo médio na página** | >1min | PostHog |
| **CTA click rate** | >20% | Clicks / visitors |

### Critérios de Pivot

| Resultado | Ação |
|---|---|
| Conversion > 5% | ✅ Continuar pra Fase 1 |
| Conversion 2-5% | 🟡 Iterar copy + targeting |
| Conversion < 2% | 🔴 Pivotar mensagem ou matar |

### Distribuição de tradições (sinal de interesse)

| Tradição | Meta de share |
|---|---|
| Cabala | >15% |
| Ifá | >10% |
| Xamanismo | >15% |
| Meditação | >20% |
| Tantra | >5% |
| Reiki | >10% |
| Astrologia | >15% |
| Outros | <10% |

> **Por que importa:** mostra qual tradição puxa mais atenção e ajuda a priorizar curadoria inicial.

---

## Fase 1 — Beta privado (8 semanas, 50-100 pessoas)

### Objetivo
Validar que **quem chega, fica**.

### Métricas

| Métrica | Meta | Como medir |
|---|---|---|
| **Signups totais** | >300 | API |
| **Usuários ativos (DAU/MAU)** | >25% | PostHog |
| **D7 retention** | >25% | Cohort analysis |
| **D30 retention** | >15% | Cohort |
| **Posts/usuário/semana** | >0.5 | DB |
| **Comments/usuário/semana** | >1 | DB |
| **Cross-tradition reads** | >30% | % que viu outras tradições |
| **Tempo médio sessão** | >5min | PostHog |
| **NPS** | >40 | Survey mensal |
| **Moderação: tempo de resposta** | <2h | DB |

### Critérios de Pivot

| Resultado após 4 semanas | Ação |
|---|---|
| DAU/MAU > 25% + D7 > 25% | ✅ Continuar pra Fase 2 |
| DAU/MAU 15-25% | 🟡 Investigar fricção; iterar onboarding |
| DAU/MAU < 15% | 🔴 Pivotar feature core ou target |

### Sinais qualitativos (observar nos comentários, DMs)

| Sinal de saúde | Sinal de alerta |
|---|---|
| "Finalmente um espaço que respeita X" | "Mais um app genérico" |
| Posts de vulnerabilidade (com disclosures) | Performance/superficialidade |
| Debates cross-tradição respeitosos | Ataques entre tradições |
| Perguntas de "como funciona X?" | Perguntas só de marketing |
| Relatos pessoais profundos | Só horóscopo e tarot genérico |

---

## Fase 2 — Lançamento público (12 semanas, 1k-10k pessoas)

### Objetivo
Validar **escala** (comunidade + IA + biblioteca).

### Métricas

| Métrica | Meta | Notas |
|---|---|---|
| **MAU** | >5.000 | Meta da Fase 3 do roadmap |
| **DAU/MAU** | >25% | Indicador de hábito |
| **Posts/dia** | >100 | Conteúdo gerado |
| **Biblioteca: artigos lidos/usuário/mês** | >5 | Engajamento com conhecimento |
| **IA: % respostas marcadas úteis** | >60% | Co-evolução funciona |
| **% citações científicas em posts** | >30% | Cultura de evidência |
| **Cross-tradition reads** | >30% | Universalismo funcionando |
| **NPS** | >50 | Saúde da comunidade |
| **Moderação: tempo de resposta** | <30min | Mods funcionando |
| **Churn mensal** | <10% | |

### Critérios de Scale up

| Resultado | Ação |
|---|---|
| Tudo acima de 80% das metas | 🚀 Scale up + fundraising |
| 60-80% | ✅ Iterar e continuar |
| <60% em 2 métricas chave | 🔴 Pivotar ou hibernar |

---

## Fase 3 — Comunidade madura (6-12 meses)

### Métricas de "comunidade saudável"

| Métrica | Meta saudável |
|---|---|
| **DAU/MAU** | >25% (mantém) |
| **Novos usuários/mês** | >500 |
| **% usuários que postam alguma coisa** | >20% (1 em 5) |
| **% usuários que comentam** | >40% |
| **% usuários que salvam artigos** | >50% |
| **% usuários ativos há 30+ dias** | >30% |
| **Mods ativos** | >5 (cresceu junto) |
| **Conteúdo com evidência alta** | >40% dos posts |
| **Reports de charlatanismo resolvidos em <2h** | >95% |
| **NPS** | >50 |
| **Net Promoter (se recomenda)** | >40% recomendaria |
| **LTV (se houver monetização)** | >CAC |

### Sinais de "comunidade morrendo"

- DAU/MAU < 10%
- Posts novos/dia < 10
- Mods esgotados / trocando muito
- Crescimento de conflito inter-tradição
- IA cita cada vez mais desatualizado
- "Boa sorte"取代 "Akasha" no vocabulário dos early adopters

---

## 🔴 Sinais de "MORREU" — parar tudo

| Sinal | Ação |
|---|---|
| **DAU/MAU < 5%** por 60 dias seguidos | Matar projeto |
| **Mods todos saíram** | Pausar; repensar modelo |
| **Churn > 50%/mês** | Matar ou pivotar drástico |
| **NPS < 0** com tendência negativa | Pausar |
| **Pressão legal/regulatória grave** | Pausar; consultar jurídico |

---

## 🟢 Sinais de "VOANDO" — acelerar

| Sinal | Ação |
|---|---|
| Crescimento viral orgânico >20%/mês | Contratar 2-3 mods dedicados |
| % usuários ativos há 30+ dias >40% | Considerar mobile app |
| IA tem 70%+ respostas "úteis" | Fine-tuning com base da comunidade |
| Influenciadores espiritualizados pedindo parceria | Selecionar 3-5 com cuidado |
| Convites para conferências/palestras | Aumentar visibilidade do fundador |

---

## Quando pivotar (não matar)

Às vezes o produto tem sinais mistos. Exemplos de pivot:

| Sinal original | Pivot possível |
|---|---|
| Curioso acadêmico engajado mas praticante não | Foco em biblioteca + IA, menos comunidade |
| Comunidade forte mas biblioteca fraca | Remover biblioteca, focar em social |
| IA popular mas comunidade fraca | Separar Akasha IA como produto standalone |
| Tradição específica dominante | Criar vertical (Akasha Cabala, Akasha Ifá, ...) |
| Crescimento em Brasil fraco mas no EN forte | Pivotar pra inglês |

---

## Critérios de "ir embora" do projeto

Se **2 janelas consecutivas** mostrarem:

- DAU/MAU < 10% E
- D7 < 15% E
- NPS < 20 E
- Mods esgotados

**Então:** parar, agradecer a comunidade, arquivar conteúdo abertamente (open source), seguir com vida.

Comunidades que **morre devagar** são piores que comunidades que **morrem com dignidade**.

---

## Decisões automáticas (heurísticas)

| Métrica | Auto-decisão |
|---|---|
| 5+ usuários ativos na primeira semana | Continuar |
| 0 usuários ativos na primeira semana | Matar |
| 50+ signups em 24h | Scale up (mais infraestrutura) |
| <10% conversion rate | Iterar copy |
| 3+ reports de charlatanismo na mesma semana | Pausar; revisar moderação |
| IA cita fonte errada | Corrigir + transparência |

---

## Como vamos medir (tooling)

### Mínimo viável (MVP)

- **PostHog** (auto-hosted, gratuito, privacidade)
- Eventos: pageview, signup, scroll, click, submit, post_created, comment_added
- Cohorts: D1, D7, D30 retention
- Funnels: visit → signup → first post

### Ideal (Fase 2+)

- **Mixpanel** ou **Amplitude** (analytics mais robusto)
- **Hotjar** ou **Microsoft Clarity** (heatmaps, gravações)
- **Custom dashboard** interno (PostHog + Metabase)
- **Surveys** in-app (Typeform ou custom)

---

## Comunicação de métricas

| Audiência | O que compartilhar |
|---|---|
| **Time interno** | Todas as métricas, diariamente |
| **Comunidade (transparência)** | DAU/MAU, posts/dia, NPS — mensal |
| **Investidores (se houver)** | Retention, LTV, CAC, NPS — trimestral |
| **Público (blog/twitter)** | Marcos alcançados (1k usuários, 100k posts) |

> **Princípio:** comunidade que se importa com as próprias métricas, se importa com a própria sustentabilidade.

---

## Próximo passo (esta sprint)

1. ✅ Criar landing `/early-access` (FEITO)
2. ✅ Criar API `/api/early-access` (FEITO)
3. ⏳ Configurar PostHog ou alternativa simples
4. ⏳ Divulgar landing em grupos de espiritualidade (Reddit, Facebook, Discord)
5. ⏳ Medir por 7 dias
6. Decidir: continuar / iterar / pivotar

---

> Última atualização: 2026-06-26
> Próxima revisão: 7 dias após o lançamento da landing