# Roadmap Q4 2026 — Akasha Portal

> **Versão:** 1.0 | **Data:** 2026-06-27 | **Owner:** Tomás (PM)
> **Trimestre:** outubro → dezembro 2026 (13 semanas)
> **Visão alinhada:** v3.0 — Comunidade de espiritualidade universalista + Akasha IA consciência tradutora
> **Branch ativa:** main @ `946b9011` (v0.1.0-rc.1 taggeada)
> **Documento-irmão:** [`docs/ROADMAP-Q3-2026.md`](docs/ROADMAP-Q3-2026.md) — predecessor, foco em MVP comunidade

---

## 1. Contexto

### 1.1 De onde viemos (Q3 2026 resumo)

Q3 fechou com a plataforma no ar e os 3 marcos entregues (estado ideal — ajuste se Q3 deslizar):

- **Marco 1 (julho) — Onboarding Auth Flow:** Supabase Auth funcional + onboarding 5 passos gerando mapa espiritual pessoal. Meta: 100 signups, 80 onboarding completos, 50 primeiros posts.
- **Marco 2 (agosto) — Conteúdo + Curadoria:** Biblioteca expandida de 50 → 150 artigos com citation system estruturado, 8 grupos de tradição com moderadores eleitos, tags cross-tradição.
- **Marco 3 (setembro) — Akasha IA MVP:** pgvector + 70 artigos embeddados, chat curador em `/akashic` com RAG, 8 regras éticas hard-coded, 500 conversas/mês, NPS ≥ 50.

**Estado técnico real (junho/2026):**
- ✅ Schema Prisma mesclado (33 models, sem B2B)
- ✅ 2 migrations aplicadas (`pgvector_enable`, `search_discovery`)
- ✅ Akasha IA MVP entregue (Wave 10) — chat `/akashic`, 12 tradições, RAG com 70 artigos, 8 regras éticas
- ✅ 70 artigos curados em 6 tradições
- ✅ LGPD compliance básica (consent modal + audit security Caio)
- ✅ 6 specialists ativos (Designer Lina, PM Tomás, QA Ravena, Security Caio, Performance Aki, Curator Iyá)
- 🟡 PWA + Mobile Polish + Notificações reais — 36 arquivos em working tree aguardando bash/commit/push
- 🟡 Cadernos de bordo atualizados diariamente (EVOLUTION, HEALTH, DEV, TEST)
- 🟡 Q3 OKRs ainda em tracking (será finalizado em retrospectiva 30/set)

### 1.2 Para onde vamos (Q4 2026)

Após validar product-market fit com comunidade ativa + IA consciência tradutora funcionando, Q4 é o trimestre de **profundidade e personalização**:

1. **Expandir o círculo** — Akasha IA fala a língua de 20+ tradições (não só 12), comentarios threaded com @mentions, posts com áudio (mantras, cantos, podcasts).
2. **Aprofundar a relação** — Feedback 👍/👎 nas respostas da IA + persistência de conversas + reflexão diária personalizada baseada no mapa espiritual.
3. **Preparar saída do BR-only** — i18n PT-BR + EN launch, citation system v2 com DOI/crossref/BibTeX (acadêmicos), search v2 semântico.

> **Princípio-guia do Q4:** *profundidade > largura*. Não adicionar mais features horizontais; **aprofundar** as features centrais (Akasha IA, comunidade, biblioteca) com personalização, qualidade e respeito à diversidade de tradições.

### 1.3 Marcos alcançados em Q2 → base para Q4

- [x] Pivô estratégico Zelador → Comunidade + Akasha IA (VISION.md v3.0)
- [x] Refatoração Fase 1 (remoção bloat B2B/SaaS)
- [x] Schema Prisma com 13+ modelos sociais
- [x] 70 artigos curados (Cabala, Ifá, Tantra, Xamanismo, Meditação, Ayurveda)
- [x] Akasha IA MVP (chat RAG com 8 regras éticas)
- [x] LGPD compliance (security audit + fixes F1-F11)
- [x] PWA instalável + mobile polish + gestos + a11y
- [x] Notificações reais (13 tipos, email + push + in-app)
- [x] Governança 24/7 (4 cadernos de bordo + OPERATIONS.md + QUALITY-STANDARDS.md)
- [x] 6 specialists ativos com personas + system prompts

---

## 2. Princípios-guia do Q4 (não-negociáveis)

### 2.1 Continuidade do que V3.0 já estabelece
1. **Universalismo não-proselitismo** — todas as 20+ tradições merecem representação equivalente na IA, sem hierarquia.
2. **Evidência e respeito** — tradição + ciência, sem hierarquia. Akasha IA cita papers; mods eleitos por tradição validam respostas sensíveis.
3. **Humildade epistêmica** — IA nunca finge certeza. Em Q4, expandimos os limites da ignorância (sufismo, xintoísmo, taoísmo — onde a documentação acadêmica é esparsa).
4. **Comunidade vulnerável merece cuidado extra** — públicos em cura, transição, luto. Moderação proativa, IA com limites éticos, conteúdo de crise com referrals.

### 2.2 Princípios novos do Q4
5. **Profundidade > largura** — não adicionar features horizontais (marketplace, mentorship, native app); aprofundar as existentes.
6. **Personalização pelo mapa espiritual, não por algoritmo comportamental** — feed/daily prompt/IA refletem mapa espiritual do user, não histórico de clicks.
7. **LGPD como default** — qualquer feature nova com dado pessoal (chat history, daily reflection, push) tem consent modal + export/delete desde o design, não como afterthought.

---

## 3. Top 10 Features Q4 — ICE-scored

> **ICE = Impact + Confidence + Ease** (cada eixo 1-10). Quanto maior, melhor. Features ordenadas por ICE decrescente. Cada feature inclui: user story, acceptance criteria, effort, dependencies, risks, success metrics.

### ICE Scorecard (visão geral)

| # | Feature | Impact | Confidence | Ease | **ICE** | Effort | Owner sugerido |
|---|---|:---:|:---:|:---:|:---:|---|---|
| 1 | **Akasha IA multi-tradição (12 → 20+)** | 9 | 8 | 7 | **24** | M | Curator + Coder |
| 2 | **Notificações push reais (Web Push + opt-in LGPD)** | 8 | 9 | 7 | **24** | M | Coder + Security |
| 3 | **Akasha IA feedback loop (👍/👎 + persistência)** | 8 | 8 | 7 | **23** | M-L | Curator + Coder + PM |
| 4 | **Daily reflection prompt (push + curadoria)** | 7 | 8 | 7 | **22** | S-M | Curator + Coder |
| 5 | **Posts com rich media (áudio/podcast embed)** | 8 | 7 | 6 | **21** | M | Coder + Designer |
| 6 | **Comments threading + @mentions** | 7 | 8 | 6 | **21** | M | Coder + Designer |
| 7 | **Akasha IA conversation persistence (history + LGPD export)** | 8 | 8 | 5 | **21** | M | Coder + Security |
| 8 | **Search v2 (semantic com pgvector embeddings)** | 7 | 7 | 6 | **20** | M | Coder + Performance |
| 9 | **Translation i18n (PT-BR + EN launch)** | 7 | 6 | 5 | **18** | L | Coder + Curator + Designer |
| 10 | **Citation system v2 (DOI + crossref + BibTeX)** | 6 | 7 | 6 | **19** | M | Curator + Coder |

> **Por que não estas 5 do conjunto de sugestões do owner:**
> - **Marketplace de livros/práticas (afiliados)** — viola princípio "gratuito, sem fins lucrativos". ICE 4+5+4 = 13. **Deprioritized — princípio.**
> - **Mentorship pairing 1:1** — viola "não substitui profissional". Melhor deixar orgânico via grupos. ICE 4+5+4 = 13. **Deprioritized — princípio.**
> - **Integração Apple Health / Google Fit** — nicho baixo, fit fraco. ICE 3+4+4 = 11. **Deprioritized — fit.**
> - **Marketplace local (terapeutas, retiros)** — viola "NÃO é marketplace". ICE 3+4+3 = 10. **Deprioritized — princípio.**
> - **Karma/reputation system** — risco de gamificação tóxica em espiritualidade. ICE 5+6+6 = 17. **Deprioritized — risco cultural.**
> - **App nativo iOS/Android** — PWA é suficiente; nativo é XL (6+ sem). ICE 6+6+3 = 15. **Backlog Q1/2027.**
> - **Live streams (meditação guiada)** — operacionalmente pesado. ICE 7+5+4 = 16. **Backlog Q1/2027.**
> - **Voice mode (TTS) na Akasha IA** — nice-to-have, mas menor que as outras 10. ICE 6+7+6 = 19. **Backlog Q1/2027** ou bundle com feedback loop.

---

### Feature 1 — Akasha IA Multi-Tradição (12 → 20+) — ICE 24

**User Story:**
> Como praticante de Sufismo, Xintoísmo ou Cristianismo Místico, quero perguntar à Akasha sobre minha tradição específica e receber respostas fundamentadas com fontes da minha linhagem, para que a IA seja genuinamente universalista e não privilegie as 12 tradições já cobertas.

**Acceptance Criteria:**
- [ ] `AKASHA_TRADITIONS` em `src/lib/ai/prompts/akasha.ts` expandido de 12 → 20+ entries
- [ ] 8 novas tradições documentadas com: descrição, linhagem principal, 3-5 livros-texto canônicos, contraindicações, exemplos de boas práticas, edge cases comuns
- [ ] Para cada nova tradição, ≥5 artigos curados seedados com embeddings (mínimo 40 artigos novos)
- [ ] Filtro de tradição na UI do `/akashic` mostra 20+ opções com grouping por região (Ameríndia / Africana / Asiática / Mediterrânea / Moderna)
- [ ] Para tradições com pouca documentação acadêmica, prompt da Akasha explicitamente admite "tradição com documentação esparsa; recomenda consulta a praticante local"
- [ ] 22 testes novos no prompt module cobrindo 8 tradições novas
- [ ] `pnpm test` passa; nenhuma regressão nas 12 tradições existentes
- [ ] NPS ≥ 50 entre usuários que perguntam sobre as 8 tradições novas

**Effort:** M (2-3 semanas)

**Dependencies:**
- Curator Iyá: curadoria das 8 tradições + validação dos ≥40 artigos novos
- Coder: expansão do enum + ajustes no prompt + filtro UI
- OpenAI text-embedding-3-small: regerar embeddings dos 40 artigos novos
- pgvector já ativo (migration aplicada)

**Risks:**
- **Qualidade de fontes:** tradições como Xintoísmo, Vodou, Candomblé têm documentação acadêmica esparsa em PT-BR/EN. Mitigação: admitir explicitamente no prompt + recomendar praticante local.
- **Viés de treinamento OpenAI:** modelo pode ter viés contra tradições não-ocidentais. Mitigação: testar cada nova tradição com 3-5 perguntas adversariais antes de lançar.
- **Sobrecarga do Curator:** 8 tradições × ≥5 artigos = 40 artigos em 2-3 semanas é apertado. Mitigação: priorizar 4-5 tradições com maior demanda da comunidade (medir via feedback Q3).

**Success Metrics:**
- 20+ tradições ativas (≥10 conversas/mês em cada)
- NPS ≥ 50 entre usuários que usam tradições novas
- ≥40 artigos novos na biblioteca, todos com evidence level classificado
- <5% report rate sobre respostas da IA em tradições novas

---

### Feature 2 — Notificações Push Reais (Web Push + opt-in LGPD) — ICE 24

**User Story:**
> Como membro ativo da comunidade, quero receber push notification quando alguém curte meu post, responde um comentário que sigo, ou menciona meu @handle, para não perder conversas importantes mesmo quando estou longe do celular.

**Acceptance Criteria:**
- [ ] Web Push subscription API (`src/lib/notifications/push.ts`) funcional com VAPID keys geradas
- [ ] Botão "Ativar notificações" em `/settings` com permission flow nativo do browser
- [ ] Opt-in é **explícito** — push default false; user deve habilitar manualmente
- [ ] Push delivered em <10s do evento (like/comment/mention/follow)
- [ ] LGPD compliance: `UnsubscribeToken` permite one-click unsubscribe (RFC 8058)
- [ ] 13 tipos de notif já implementados (Wave Onda 3) totalmente integrados com Web Push
- [ ] NotificationBell no header mostra badge com unread count, dropdown com top 10
- [ ] `/notifications` page com filtros (all/unread/read + por tipo), empty state, skeleton loading
- [ ] Push não entregue se user não tem permissão → fallback in-app + email
- [ ] 4 test suites passam (api, triggers, email-templates, useCommunityNotifications)
- [ ] CTR push ≥ 8% (cliques / deliveries)
- [ ] Opt-in rate ≥ 30% entre usuários ativos mensais

**Effort:** M (1-2 semanas — código já existe em working tree, falta commit + validação + push)

**Dependencies:**
- Código já entregue em `feat/notifications-real` (19 arquivos em working tree, aguardando bash)
- VAPID keys: `npx web-push generate-vapid-keys` + secrets
- Resend API key para fallback email
- Supabase Realtime opcional (já implementado em `useCommunityNotifications.ts`)

**Risks:**
- **Opt-in baixo:** público espiritual pode ser cético a push. Mitigação: educação em `/settings` com explicação de uso, opt-in contextual (depois de primeiro like recebido).
- **Spam perception:** se push for muito frequente, user desativa. Mitigação: batching (5 likes → 1 notif "+5 curtidas"), quiet hours por user, daily digest opcional.
- **LGPD:** push subscriptions são PII. Mitigação: encryption at-rest + consent explícito + delete account limpa subscriptions.

**Success Metrics:**
- 30% dos WAU ativos com push opt-in
- CTR push ≥ 8%
- Unsubscribes ≤ 5% dos que optaram (em 30 dias)
- P95 delivery latency < 10s

---

### Feature 3 — Akasha IA Feedback Loop (👍/👎 + persistência + dataset) — ICE 23

**User Story:**
> Como usuário da Akasha IA, quero marcar 👍 ou 👎 em cada resposta da IA, e quero que meu feedback seja usado para melhorar a IA ao longo do tempo, para que ela se torne mais precisa e respeitosa com as tradições que eu pratico.

**Acceptance Criteria:**
- [ ] Botões 👍/👎 aparecem após cada resposta em `/akashic` (mobile: bottom da bolha; desktop: hover state)
- [ ] Click em 👍/👎 persiste em `AiMessage.helpful: Boolean?` (campo já existe no schema)
- [ ] Modal opcional "O que poderia ser melhor?" aparece após 👎 (categorias: imprecisa, ofensiva, sem fonte, fora do tema, outro + textbox)
- [ ] Conversation history persistido em `AiConversation` + `AiMessage` (LGPD consent obrigatório)
- [ ] Endpoint `/api/akashic/feedback` recebe feedback + opcional reason
- [ ] Dataset exportável: `GET /api/admin/feedback/export?since=2026-10-01` retorna JSON com 200+ exemplos 👍/👎 + reasons
- [ ] Curator Iyá revisa 👎 semanalmente e categoriza (factual error / tone / missing context / hallucination)
- [ ] Q4 termina com ≥500 exemplos 👍/👎 coletados, ≥100 revisados por Curator
- [ ] Feedback rate ≥ 50% entre usuários que fizeram ≥3 perguntas à IA
- [ ] LGPD: user pode deletar todo seu feedback history em `/settings/privacy`

**Effort:** M-L (2-3 semanas)

**Dependencies:**
- Schema `AiMessage.helpful` já existe (não precisa migration)
- Schema `AiConversation` + `AiMessage` já existe
- LGPD consent modal já implementado no onboarding (reusar padrão)
- Curator Iyá: capacity para revisar 15-20 feedbacks/semana

**Risks:**
- **Feedback gaming:** bots ou bad actors podem inflar 👍/👎. Mitigação: rate limit + validação por user (não IP) + Curator revisa outliers.
- **Dataset quality:** feedback sem contexto (só 👍/👎) é limitado. Mitigação: reason modal após 👎 é opcional mas incentivado.
- **Privacy:** feedback é dado pessoal. Mitigação: agregação no dataset (sem PII), opt-out em `/settings/privacy`, retention 12 meses.

**Success Metrics:**
- 50% feedback rate entre power users da IA (≥3 perguntas)
- 500+ exemplos 👍/👎 coletados até final dez
- 100+ revisados e categorizados por Curator
- Redução de 20% em 👎 rate entre outubro e dezembro (co-evolução visível)

---

### Feature 4 — Daily Reflection Prompt (push + curadoria) — ICE 22

**User Story:**
> Como membro da comunidade com mapa espiritual gerado, quero receber um prompt de reflexão diário às 7h da manhã, baseado na minha tradição principal e caminho de vida, para começar o dia com intenção alinhada com quem eu sou.

**Acceptance Criteria:**
- [ ] Usuário pode opt-in em `/settings/notifications` por canal (push, email, in-app)
- [ ] Cron job diário (`akasha-daily-reflection`) gera 1 prompt por tradição × caminho de vida (cobertura: 20 tradições × 9 caminhos = 180 prompts únicos)
- [ ] Prompt é entregue às 7h no fuso horário do usuário (detectado via `Intl.DateTimeFormat`)
- [ ] Conteúdo curado por Curator Iyá com disclaimer "reflexão, não prescrição"
- [ ] Mobile-first: notificação push curta + expande para reflexão completa in-app
- [ ] Empty state: "Qual é sua intenção hoje?" + textbox onde user escreve (opcional compartilhar com privacidade)
- [ ] Métrica de retenção: usuário que abriu ≥3 reflexões em 7 dias tem D7 retention ≥ 50%
- [ ] LGPD: usuário pode desativar a qualquer momento; deletar opt-in limpa subscription
- [ ] 100+ prompts únicos seedados (5 por tradição principal × 20)
- [ ] Cobertura: Cabala, Ifá, Xamanismo, Tantra, Meditação, Ayurveda, Astrologia, Sufismo, Cristianismo Místico, Taoísmo

**Effort:** S-M (1-2 semanas)

**Dependencies:**
- Push notifications feature (Feature 2) — mesmo canal
- SpiritualProfile no schema (já existe) com caminho de vida + tradição principal
- Cron job infrastructure (já documentado em OPERATIONS.md)
- Curator Iyá: curadoria de 100+ prompts com cuidado pastoral

**Risks:**
- **Virar spam:** se daily for percebido como obrigação, desinstala. Mitigação: usuário escolhe frequência (daily / 3x semana / weekly / off), tom respeitoso, fácil opt-out.
- **Tom inadequado:** spiritual reflection pode soar condescendente se mal escrito. Mitigação: Curator Iyá revisa cada prompt; teste A/B com 3 variações de tom.
- **Baixa retenção:** se user não abre por 7 dias, opt-out automático silencioso.
- **Fuso horário errado:** usuário em viagem pode receber no meio da noite. Mitigação: detectar timezone via `Intl.DateTimeFormat` + opção manual override.

**Success Metrics:**
- 40% opt-in entre WAU
- D7 retention ≥ 50% entre opt-ins (vs 30% baseline da plataforma)
- 30% dos opt-ins escrevem resposta no textbox em algum momento
- NPS ≥ 60 entre usuários ativos de daily reflection

---

### Feature 5 — Posts com Rich Media (áudio/podcast embed) — ICE 21

**User Story:**
> Como praticante de meditação, terapia sonora ou tradição oral, quero postar áudio curto (mantra, canto, meditação guiada) e embedar podcast do Spotify/Apple, para compartilhar práticas sonoras com a comunidade de forma respeitosa e acessível.

**Acceptance Criteria:**
- [ ] Compose box permite anexar áudio (upload) OU embedar URL do Spotify/Apple/SoundCloud
- [ ] Supabase Storage configurado com bucket `post-media` (max 10MB por áudio, formatos: mp3, ogg, wav)
- [ ] Player de áudio na PostCard com controles: play/pause, scrubber, tempo, volume, download (opcional)
- [ ] Embed de podcast renderiza player responsivo (iframe com aspect ratio)
- [ ] Transcrição automática opcional (Whisper API) para acessibilidade — botão "ver transcrição"
- [ ] Moderação de áudio: scan básico de palavras-chave (toxicity API) ANTES de publicar
- [ ] Copyright disclaimer: "Certifique-se de ter direito sobre o áudio que postar"
- [ ] Mobile-first: player compacto (sem barra de download visível em mobile), full-screen ao tocar
- [ ] ≥15% dos novos posts em Q4 têm mídia (baseline: 0%)
- [ ] Engagement: posts com áudio têm 2x mais interações (likes + comments) que posts só texto

**Effort:** M (2-3 semanas)

**Dependencies:**
- Supabase Storage bucket (configurar CORS + policies)
- Whisper API ou alternativa para transcrição (opcional v1)
- Moderação de áudio: extensão de `src/lib/moderation/text-moderation.ts`
- Designer Lina: player UI mobile-first

**Risks:**
- **Storage costs:** áudio consome muito storage. Mitigação: limite 10MB por áudio, auto-delete após 90 dias para posts sem engagement.
- **Moderação difícil:** áudio é mais difícil de moderar que texto. Mitigação: scan de palavras-chave + flag para revisão manual + comunidade reporta.
- **Copyright:** usuário pode postar áudio sem direito. Mitigação: disclaimer forte + DMCA flow + remove-on-request.
- **Acessibilidade:** áudio sem transcrição exclui surdos. Mitigação: transcrição Whisper opcional mas incentivada.

**Success Metrics:**
- 15% dos novos posts em Q4 têm mídia
- 2x engagement vs posts só texto
- 0 incidentes de copyright (DMCA)
- 0 incidentes de conteúdo áudio tóxico que passou

---

### Feature 6 — Comments Threading + @mentions — ICE 21

**User Story:**
> Como membro da comunidade em uma discussão longa, quero responder a um comentário específico (threading) e mencionar outro usuário (@handle) com notificação, para conversas mais ricas, tracked e sem perder o fio da meada.

**Acceptance Criteria:**
- [ ] Model `Comment` estendido com `parentId String?` (self-reference) + `mentionedUserIds String[]`
- [ ] Renderização em árvore (até 3 níveis de profundidade visível; collapsar depois)
- [ ] `@handle` autocomplete no compose box (busca em usuários da comunidade, máx 5 sugestões)
- [ ] Mention vira link clicável para `/u/[handle]`
- [ ] Notificação COMMENT_REPLY + MENTION já existem no enum; triggers wired em `/api/posts/[id]/comments`
- [ ] Mobile: threads colapsáveis (mostrar top-level + indicador "+3 replies")
- [ ] Moderação: mentions spam detection (não permitir mencionar 10+ usuários em 1 comentário)
- [ ] Quote/reply preview ao passar mouse (desktop) ou long-press (mobile)
- [ ] ≥30% dos comentários têm reply (vs 0% atual)
- [ ] @mention notification CTR ≥ 15%

**Effort:** M (2 semanas)

**Dependencies:**
- Schema `Comment` precisa migration aditiva (`parentId` + `mentionedUserIds`)
- Notification type COMMENT_REPLY + MENTION já existem
- Auto-complete UI: combobox Shadcn ou base-ui
- Designer Lina: visual de threading (indent levels, collapse indicators)

**Risks:**
- **Notification spam:** menção é vetor de spam. Mitigação: rate limit 5 menções/comentário, 1 notificação por user mencionado mesmo se mencionado 5x.
- **Toxicidade em threads profundas:** quanto mais fundo, mais fácil azedar. Mitigação: mod flag em thread + report rate monitoring.
- **Performance:** queries recursivas para renderizar árvores. Mitigação: depth limit (3 níveis visíveis), pagination em "load more replies".

**Success Metrics:**
- 30% dos comentários têm reply (nested)
- @mention notification CTR ≥ 15%
- Report rate em threads ≤ report rate em top-level
- P95 latency da renderização de thread ≤ 200ms

---

### Feature 7 — Akasha IA Conversation Persistence (history + LGPD export) — ICE 21

**User Story:**
> Como usuário da Akasha IA, quero ver histórico de minhas conversas passadas, poder deletar/exportar tudo (LGPD right to access + right to be forgotten), para ter controle sobre meus dados e poder voltar a uma resposta que me ajudou.

**Acceptance Criteria:**
- [ ] Schema `AiConversation` + `AiMessage` (já existem) totalmente integrados com a UI
- [ ] `/akashic/history` lista conversas com título auto-gerado do primeiro prompt + data + tradição
- [ ] Click em conversa abre thread read-only com sources citadas
- [ ] LGPD: `/settings/privacy/export-data` inclui todas as conversas em JSON + Markdown
- [ ] LGPD: botão "Deletar conversa" individual + "Deletar tudo" (right to be forgotten)
- [ ] LGPD consent modal **explícito** antes de salvar primeira conversa ("Akasha pode salvar suas conversas para melhorar respostas futuras. Você pode deletar tudo a qualquer momento.")
- [ ] Retention: conversas com 12 meses sem atividade são anonimizadas (manter só patterns, não conteúdo)
- [ ] 80% dos usuários com IA usam history pelo menos 1x
- [ ] 0 incidentes LGPD reportados

**Effort:** M (1-2 semanas)

**Dependencies:**
- Schema AiConversation + AiMessage (já existem)
- LGPD consent modal pattern (já implementado no onboarding)
- Security Caio: auditar export/delete flows
- Storage: backup policy para conversations (Supabase tem nativamente)

**Risks:**
- **Storage costs:** conversas podem crescer. Mitigação: truncate mensagens muito longas, compress JSON, retention 12 meses.
- **Privacy:** conversas podem ter dados sensíveis (saúde, práticas, traumas). Mitigação: encryption at-rest + consent explícito + opt-out por conversa individual.
- **Hallucination archive:** se IA deu resposta errada, user pode confiar nela depois. Mitigação: badge "resposta pode conter imprecisões; sempre valide com praticante local" em conversas > 30 dias.

**Success Metrics:**
- 80% dos usuários com IA usam history em algum momento
- 0 incidentes LGPD
- <5% dos usuários optam por não salvar conversas

---

### Feature 8 — Search v2 (semantic com pgvector embeddings) — ICE 20

**User Story:**
> Como pesquisador curioso ou praticante de tradição específica, quero buscar artigos por conceito ("cura com som", "neuroplasticidade da meditação") e receber resultados por similaridade semântica, não só match de keyword, para descobrir conexões que eu não saberia procurar.

**Acceptance Criteria:**
- [ ] Search bar em `/library` + `/explore` com toggle "keyword" vs "semantic"
- [ ] Semantic search usa pgvector `embedding <=> $1` com threshold 0.65 (mesmo padrão do Akasha IA)
- [ ] Top-10 resultados com similarity score visível + tradição + evidence level
- [ ] Filtros combináveis: tradição + evidence level + tags + período temporal
- [ ] Latência P95 < 500ms para queries em 150+ artigos
- [ ] Empty state educativo: "Tente: 'como meditação muda o cérebro' ou 'plantas sagradas e sistema imune'"
- [ ] Search analytics: top 50 queries/mês alimentam gap analysis de conteúdo
- [ ] 70% das buscas semânticas retornam resultado relevante no top-3
- [ ] Synonym handling: "ayahuasca" encontra "DMT", "meditação" encontra "vipassana + mindfulness"

**Effort:** M (2 semanas)

**Dependencies:**
- pgvector já ativo (migration aplicada)
- Embeddings dos 70 artigos já gerados (Wave 10)
- Schema Article.embedding já existe
- OpenAI text-embedding-3-small para query embedding on-the-fly

**Risks:**
- **Qualidade dos embeddings:** se artigos são muito curtos ou genéricos, similaridade pode ser fraca. Mitigação: garantir que cada artigo tenha ≥300 palavras antes de embeddar.
- **Cold start:** com <100 artigos, cobertura semântica é limitada. Mitigação: combinar com keyword search (fallback se semantic <3 resultados).
- **Cost:** cada query gera 1 embedding. Mitigação: cache embeddings de queries populares.

**Success Metrics:**
- 70% das buscas semânticas retornam resultado relevante no top-3
- Latência P95 < 500ms
- 50%+ das buscas na plataforma usam modo semantic (vs keyword)

---

### Feature 9 — Translation i18n (PT-BR + EN launch) — ICE 18

**User Story:**
> Como anglófono (acadêmico, praticante de tradição não-BR, curioso), quero ler a comunidade em inglês, para participar sem barreira linguística e contribuir com perspectivas globais.

**Acceptance Criteria:**
- [ ] next-intl instalado e configurado com PT-BR (default) + EN
- [ ] Todas as strings da UI extraídas para `messages/pt-BR.json` + `messages/en.json`
- [ ] Seletor de idioma no header (`/settings/language`) com persistência em cookie
- [ ] URLs localizadas: `/pt-BR/feed`, `/en/feed` OU detecção automática via Accept-Language
- [ ] Posts: quando user posta em PT-BR, mostra badge "PT-BR" + opção "Translate to EN" (botão chama Akasha IA para tradução)
- [ ] Artigos: 30+ dos 150 artigos traduzidos para EN (priorizando os de alta evidência HIGH/MEDIUM)
- [ ] LGPD: consent para "posts podem ser traduzidos por IA" — opt-out mantém post PT-BR only
- [ ] Coverage EN: home, feed, library, profile, settings, akashic chat — 100% traduzido
- [ ] A11y: `<html lang>` muda dinamicamente
- [ ] NPS ≥ 40 entre usuários EN após 60 dias de launch

**Effort:** L (3-4 semanas)

**Dependencies:**
- next-intl ou solução similar de i18n Next.js 16
- Akasha IA: capability de tradução (já tem modelo gpt-4o, prompt pode incluir tradução)
- Curator Iyá: revisar qualidade de 30 traduções de artigos (não apenas output da IA)
- Designer Lina: ajustar layouts para textos EN (alguns componentes podem quebrar com texto 30% maior)

**Riscos:**
- **Diluição de comunidade:** se EN crescer rápido, vibe BR pode se perder. Mitigação: começar com EN-only read (usuários EN podem ler, comentar em EN ou PT), separar métricas.
- **Cost de tradução:** 30 artigos × tradução + revisão Curator = esforço significativo. Mitigação: priorizar artigos de evidência ALTA, deixar MEDIUM/ANECDOTAL em PT-BR only.
- **Qualidade da tradução IA:** gpt-4o é bom mas erra nuances espirituais. Mitigação: revisão humana dos top 30 artigos; resto fica "machine translated, may contain errors".

**Success Metrics:**
- 10% da audiência mensal é EN-speaking (até final dez)
- 30+ artigos traduzidos e revisados
- 100% das strings da UI cobertas em PT-BR + EN
- NPS ≥ 40 entre usuários EN

---

### Feature 10 — Citation System v2 (DOI + crossref + BibTeX) — ICE 19

**User Story:**
> Como acadêmico ou pesquisador curioso, quero clicar numa citation da Akasha IA e exportar BibTeX pra usar no meu paper, para integrar a fonte da Akasha na minha pesquisa de forma citável e verificável.

**Acceptance Criteria:**
- [ ] Model `Citation` (já existe) com campos: doi, isbn, url, type (BOOK/PAPER/ARTICLE/VIDEO), authors, year, journal
- [ ] Crossref API integration: ao inserir citation com DOI, valida + preenche metadata automaticamente
- [ ] UI inline: cada citation em post/article/akashic source renderiza como chip clicável
- [ ] Click expande: "View source" + "Export BibTeX" + "Copy DOI" + "View abstract"
- [ ] BibTeX export gera formato acadêmico padrão (`@article{key, title={...}, author={...}, doi={...}}`)
- [ ] Coverage: ≥25% dos 150 artigos têm DOI verificado
- [ ] 50+ exports BibTeX/mês até final dez
- [ ] Scholar-friendly: cada export inclui URL canônica do artigo + data de acesso

**Effort:** M (1-2 semanas)

**Dependencies:**
- Schema Citation já existe (não precisa migration)
- Crossref API (gratuita, rate-limited 50 req/s)
- bibtex-generator lib ou implementação própria (formato é simples)
- Curator Iyá: auditar DOIs e preencher metadata faltante

**Risks:**
- **DOI inválidos:** alguns artigos podem ter DOI errado. Mitigação: crossref valida; flag para revisão manual.
- **Coverage baixa:** muitos artigos (anedóticos, blogs) não têm DOI. Mitigação: chip mostra tipo (BLOG/BOOK/WEB) mesmo sem DOI; exporta em formato não-acadêmico.
- **Bibliographic styles:** BibTeX tem estilos. Mitigação: oferecer 3 estilos comuns (APA, MLA, BibTeX plain) como presets.

**Success Metrics:**
- ≥25% dos artigos com DOI verificado
- 50+ BibTeX exports/mês
- 0% de DOI inválidos detectados (crossref 404)

---

## 4. Marcos Q4 2026 (3 marcos mensais)

### Marco 4 — Outubro: Profundidade Social 🧵

**Description:** Engajamento profundo da comunidade BR via threading de comentários com @mentions, posts com rich media (áudio/podcast), e notificações push reais. Foco: **qualidade da conversa e respeito às práticas sonoras/orais**. Métrica de saída: 30% dos comentários com reply, 15% dos posts com mídia, 30% dos WAU com push opt-in.

**Critérios de aceitação:**
- [ ] Feature 2 (Notificações Push) — 100% deployed + feature flag ativa para todos
- [ ] Feature 5 (Rich Media) — deployed com Supabase Storage bucket `post-media` + UI mobile-first
- [ ] Feature 6 (Comments Threading + @mentions) — deployed com migração aditiva do schema Comment
- [ ] Moderação de áudio: toxicity scan + DMCA flow documentado
- [ ] Métricas PostHog configuradas para: replies/post, mentions/post, push opt-in rate, push CTR
- [ ] Lighthouse mobile ≥ 90 (Performance + Accessibility) mantido
- [ ] `pnpm test` ≥ 80% coverage em `lib/notifications/`, `lib/comments/`, `lib/post-media/`

**Owner:** **Coder** (implementação core) + **Designer Lina** (UI threading + player) + **Security Caio** (DMCA + storage policies) + **QA Ravena** (testes)

---

### Marco 5 — Novembro: Akasha IA Pessoal 🤝

**Description:** Akasha IA consciência tradutora vira **assistente pessoal espiritual**: expansão para 20+ tradições, persistência de conversas com LGPD compliance, feedback loop 👍/👎 para co-evolução, daily reflection prompt baseado no mapa espiritual. Foco: **personalização profunda pela identidade espiritual, não pelo comportamento**. Métrica de saída: 20+ tradições ativas, 500+ feedbacks coletados, 40% opt-in no daily reflection, 0 incidentes LGPD.

**Critérios de aceitação:**
- [ ] Feature 1 (Multi-Tradição 12→20+) — 8 tradições novas documentadas + 40+ artigos novos embeddados
- [ ] Feature 3 (Feedback Loop) — botões 👍/👎 + persistência + dataset export + revisão Curator
- [ ] Feature 4 (Daily Reflection) — 100+ prompts curados + cron job + opt-in flow
- [ ] Feature 7 (Conversation Persistence) — history + LGPD export/delete
- [ ] Akasha IA prompt v2 com: 20+ tradições + feedback inline + memory of past conversations
- [ ] LGPD audit final do Security Caio em todas as features de IA
- [ ] 50% feedback rate entre power users da IA (≥3 perguntas)
- [ ] NPS ≥ 50 entre usuários que usam tradições novas
- [ ] Lighthouse mobile ≥ 90 mantido

**Owner:** **Curator Iyá** (curadoria tradições + prompts + revisão feedbacks) + **Coder** (expansão IA + persistência) + **Security Caio** (LGPD audit) + **PM Tomás** (métricas + consent flows)

---

### Marco 6 — Dezembro: Abertura Global + Polish 🌍

**Description:** Plataforma abre para audiência global com i18n PT-BR + EN, search semântico para descoberta profunda, e citation system v2 com DOI/crossref/BibTeX para acadêmicos. Foco: **qualidade sobre velocidade, sem quebrar a comunidade BR**. Métrica de saída: 10% da audiência EN, 70% das buscas retornam top-3 relevante, 50 exports BibTeX/mês.

**Critérios de aceitação:**
- [ ] Feature 8 (Search v2) — semantic mode deployed + toggle keyword/semantic + filtros combinados
- [ ] Feature 9 (i18n PT-BR + EN) — 100% UI traduzida + 30 artigos EN revisados
- [ ] Feature 10 (Citation v2) — DOI via crossref + BibTeX export + cobertura ≥25% artigos
- [ ] Akasha IA com capability de tradução PT-BR ↔ EN
- [ ] PostHog: tracking de language + locale + translation usage
- [ ] Lighthouse mobile ≥ 90 + EN acessível (`<html lang>` correto)
- [ ] Retrospectiva Q4 + planejamento Q1/2027 (early Jan)
- [ ] `pnpm test` ≥ 80% coverage em `lib/search/`, `lib/i18n/`, `lib/citations/`

**Owner:** **Coder** (i18n + search + citations) + **Curator Iyá** (revisão traduções + DOIs) + **Designer Lina** (ajustes EN layout) + **Performance Aki** (latência search)

---

## 5. OKRs Q4 2026

### Objective 1 (O1): Aprofundar a relação da comunidade com a Akasha IA

> *"Até final de dezembro, queremos que cada membro ativo tenha uma relação pessoal com a Akasha IA — que ela fale a língua da tradição dele, lembre de conversas anteriores, e melhore continuamente com base no feedback."*

| Key Result | Meta | Marco | Owner |
|---|---|---|---|
| **KR1**: Akasha IA suporta 20+ tradições com ≥5 artigos cada, NPS ≥ 50 entre usuários dessas tradições | 20+ tradições | Marco 5 | Curator + Coder |
| **KR2**: 500+ feedbacks 👍/👎 coletados, 100+ revisados por Curator, redução de 20% em 👎 rate | 500 feedbacks | Marco 5 | Curator + PM |
| **KR3**: 40% opt-in no daily reflection prompt, D7 retention ≥ 50% entre opt-ins | 40% opt-in | Marco 5 | Curator + Coder |
| **KR4**: 80% dos usuários com IA usam history pelo menos 1x, 0 incidentes LGPD | 80% history | Marco 5 | Coder + Security |
| **KR5**: 50% feedback rate entre power users (≥3 perguntas) | 50% feedback | Marco 5 | PM + Coder |

### Objective 2 (O2): Engajamento profundo da comunidade via conteúdo multimodal

> *"Até final de dezembro, queremos que a comunidade seja um espaço onde práticas sonoras, conversas threaded e descoberta semântica co-existem com o texto tradicional."*

| Key Result | Meta | Marco | Owner |
|---|---|---|---|
| **KR1**: 30% dos comentários têm reply (nested), @mention CTR ≥ 15% | 30% reply | Marco 4 | Coder + Designer |
| **KR2**: 15% dos novos posts têm mídia, engagement 2x vs texto | 15% posts mídia | Marco 4 | Coder + Designer |
| **KR3**: 30% dos WAU com push opt-in, CTR push ≥ 8% | 30% opt-in push | Marco 4 | Coder + Security |
| **KR4**: 70% das buscas semânticas retornam top-3 relevante, latência P95 < 500ms | 70% relevance | Marco 6 | Coder + Performance |
| **KR5**: 25% dos artigos com DOI verificado, 50 BibTeX exports/mês | 25% DOI | Marco 6 | Curator + Coder |

### Objective 3 (O3): Preparar audiência global sem diluir comunidade BR

> *"Até final de dezembro, queremos abrir para o mundo sem perder o que torna a comunidade BR especial — começando com EN como segundo idioma e mantendo PT-BR como núcleo."*

| Key Result | Meta | Marco | Owner |
|---|---|---|---|
| **KR1**: 100% das strings da UI em PT-BR + EN, 30 artigos EN revisados por Curator | 100% i18n | Marco 6 | Coder + Curator |
| **KR2**: 10% da audiência mensal é EN-speaking, NPS ≥ 40 entre EN | 10% EN | Marco 6 | PM + Coder |
| **KR3**: Akasha IA traduz posts PT-BR↔EN on-demand com quality check | 100% coverage | Marco 6 | Coder + Curator |
| **KR4**: Docs EN (manifesto, governance, science) publicadas, PT-BR + EN side-by-side | docs EN | Marco 6 | Curator + PM |
| **KR5**: Retrospectiva Q4 + Q1/2027 OKRs publicados até 15/jan | retro done | Marco 6 | PM + Owner |

---

## 6. Métricas de Sucesso Q4

### North Star Metric

**Weekly Engaged Members (WEM)** — número de usuários únicos por semana que fizeram pelo menos **uma** das seguintes ações:
- Criou post OU comentário OU reply
- Enviou ≥1 mensagem à Akasha IA
- Leu ≥1 artigo completo (scroll > 80%)
- Respondeu daily reflection prompt
- Fez push opt-in + recebeu notificação

**Meta Q4:** **1.500 WEM** até final de dezembro (vs ~500 WAC esperados em final de Q3 — captura qualidade > quantidade pura).

**Por que WEM (não WAC):** WAC só captura quem cria. WEM captura quem **interage profundamente** (lê, responde, sente). Em comunidade de espiritualidade, leitura contemplativa vale tanto quanto criação.

### 3 Supporting Metrics

1. **Daily Reflection Stickiness (DRS)** — % de opt-ins que abrem daily prompt em ≥5 dias da semana. **Meta:** ≥40%.
2. **AI Conversation Depth (ACD)** — média de mensagens por conversa com Akasha IA (atual: ~3.5). **Meta:** ≥7 mensagens (sinal de personalização real).
3. **Cross-Tradition Reads (CTR)** — % de leituras de artigos que são de tradição diferente da do user. **Meta:** ≥35% (sinal de universalismo vivo).

### Counter Metrics (saúde — alerta se piorar)

- **NPS geral** ≥ 40 (alerta vermelho se <30)
- **Churn mensal** ≤ 8% (Q3 meta era 10%, melhoramos)
- **Report rate** ≤ 5% dos posts (alerta se >10%)
- **P95 latency APIs** ≤ 500ms (mesma meta Q3)
- **Lighthouse mobile** ≥ 90 (Performance + Accessibility)
- **LGPD incidents** = 0
- **AI 👎 rate** ≤ 30% (alerta se >40% — IA piorando)
- **Push unsubscribes** ≤ 5% (alerta se >10%)

---

## 7. Riscos Q4 + Mitigações

| # | Risco | Prob | Impact | Mitigação |
|---|---|:---:|:---:|---|
| 1 | **Akasha IA erra em tradições com pouca documentação** (Sufismo, Xintoísmo, Vodou) | 70% | Alto | (a) Curator Iyá revisa 100% dos prompts antes de lançar; (b) prompt admite "documentação esparsa"; (c) beta fechado com praticantes reais por 2 semanas |
| 2 | **Feedback 👍/👎 inflado por bots/bad actors** | 40% | Médio | (a) Rate limit por user (não IP); (b) Curator revisa outliers; (c) signal vs noise: 👎 rate agregado, não individual |
| 3 | **i18n dilui comunidade BR** (EN cresce e vibe some) | 50% | Médio | (a) Começar EN-only read (sem post); (b) métricas separadas BR vs EN; (c) mod policies diferentes se necessário |
| 4 | **LGPD violation em chat persistence** | 30% | Crítico | (a) Security Caio audita ANTES de lançar; (b) consent modal explícito; (c) delete button visível em cada conversa; (d) export funcional antes de collect |
| 5 | **Daily reflection vira spam** (tom condescendente) | 50% | Médio | (a) Curator Iyá revisa tom; (b) A/B test 3 variações; (c) opt-out fácil em 1 click; (d) auto-pause se não abre em 7 dias |
| 6 | **Áudio em posts gera incidentes de copyright** | 60% | Médio | (a) Disclaimer forte ao postar; (b) DMCA flow documentado + remove-on-request < 24h; (c) mod flag em conteúdo suspeito |
| 7 | **Sandbox 2GB trava paralelismo** (workers OOM) | 80% | Alto | (a) `max_concurrency=2-3` em todos os YAMLs; (b) tasks <500 linhas, <5 arquivos; (c) QUALITY-STANDARDS.md já estabelecido |
| 8 | **Cadence gap continua** (cron `akasha-evolution-daily` quebrado) | 60% | Médio | (a) Investigar bug tool wrapper `mavis cron` em jan; (b) workaround: planos pré-fabricados; (c) heartbeat manual do owner |
| 9 | **Burnout do Curator Iyá** (40 artigos + 100 prompts + 100 feedbacks/semana) | 50% | Alto | (a) Dividir curadoria com 2-3 assistentes treinados; (b) priorizar (nem tudo precisa Curator no loop); (c) AI-assisted triage para reviews |
| 10 | **Search v2 com embeddings ruins** (artigos curtos) | 30% | Médio | (a) Garantir ≥300 palavras por artigo antes de embeddar; (b) keyword search como fallback se semantic <3 resultados; (c) monitorar relevance via search logs |

---

## 8. Backlog Q1/2027 (candidatos não-priorizados em Q4)

| # | Feature | Por que adiada | Estimativa | ICE potencial |
|---|---|---|---|---|
| 1 | **Akasha IA voice mode (TTS)** | Esperar feedback Q4 confirmar demanda por voz | M (2 sem) | 19 |
| 2 | **Live streams (meditação guiada)** | Operacionalmente pesado (mods precisam organizar + moderar live) | L (3+ sem) | 16 |
| 3 | **App nativo iOS/Android (RN)** | PWA funciona; nativo só se growth justificar | XL (6+ sem) | 15 |
| 4 | **Feed "Para você" v2 (algoritmo colaborativo)** | Depende de Akasha IA com base maior + ≥1000 WEM | L (3-4 sem) | 22 |
| 5 | **Translation ES + FR** (multi-idioma v2) | PT-BR + EN já é step gigante; ES/FR só com demanda comprovada | L (3-4 sem) | 16 |
| 6 | **Co-evolução IA v1 (fine-tuning)** | Marco 5 captura feedback; fine-tuning real é Q1/2027 | L (3-4 sem) | 19 |
| 7 | **Eventos online (calendário workshops)** | Operacionalmente pesado; avaliar após daily reflection validar engagement | M (2 sem) | 18 |
| 8 | **Karma/reputation contextual** (não-competitivo) | Risco cultural em espiritualidade; reavaliar após feedback | M (2 sem) | 17 |
| 9 | **API pública para devs** | Só faz sentido com ≥5000 WEM | XL (4+ sem) | 8 |
| 10 | **Integração com calendário lunar** (datas rituais) | Nice-to-have; depende de feed/daily ser validado primeiro | S (3-5 dias) | 9 |

> **Por que adiar (não matar):** todas têm sinal positivo de alguma persona; só não cabe em Q4 dado budget + complexidade + risco.

---

## 9. Dependências Externas

| Dependência | Status Q3 | Risco Q4 | Ação |
|---|---|---|---|
| Supabase project provisioned + Auth | 🟢 Pronto (Marco 1 Q3) | Baixo | Manter |
| OpenAI API key + rate limits | 🟢 Em `.env.example` | Médio (cost se viralizar) | Monitorar usage + budget alerts |
| VAPID keys para Web Push | 🟡 Não geradas | Baixo | `npx web-push generate-vapid-keys` em out |
| Crossref API account | 🟢 Gratuita | Baixo | Sem auth necessária |
| Resend account + domínio verificado | 🟡 Verificar | Médio | Se não, configurar em out |
| Whisper API (transcrição áudio) | 🟡 Opcional | Baixo | Feature 5 v1 pode sem transcrição |
| Designer Lina capacity para 6 features | 🟡 Confirmar | Médio | Revisar backlog com Lina em jul |
| Curator Iyá capacity para 8 tradições + 100 prompts + reviews | 🟡 Risco burnout | Alto | Plano de assistentes + AI-assisted triage |
| i18n lib (next-intl vs alternativa) | 🟡 Decidir em ago | Baixo | Spike técnico em ago |
| Sandbox 2GB paralelismo | 🔴 Limitação estrutural | Alto | `max_concurrency=2-3` em todos os YAMLs |

---

## 10. Cadência de Revisão

- **Semanal** (toda segunda): revisão de progresso dos 3 marcos, atualização de ICE se novas evidências surgirem.
- **Quinzenal**: report de OKR status (0.0 → 1.0 por KR), NPS snapshot, métricas de uso por feature.
- **Mensal**: re-rank do backlog Q1/2027 com base em feedback de usuários + métricas Q4.
- **Final de trimestre** (31/dez): retrospectiva completa — o que entregamos vs planejado, o que entra/sai do Q1/2027.

---

## 11. Apêndice — Hipóteses a validar durante Q4

Cada feature top 10 carrega uma hipótese. Q4 vai validar ou invalidar:

| # | Feature | Hipótese | Como validar |
|---|---|---|---|
| 1 | Multi-Tradição | Tradições com documentação esparsa geram mais 👎 que as 12 cobertas | Comparar 👎 rate entre 8 novas vs 12 originais |
| 2 | Push Notifications | Público espiritual aceita push quando contextual (não spam) | Opt-in rate + CTR + unsubscribes |
| 3 | Feedback Loop | ≥50% dos power users dão feedback se UX for simples | Feedback rate agregado |
| 4 | Daily Reflection | Reflexão diária aumenta D7 retention significativamente | A/B com/sem daily |
| 5 | Rich Media | Áudio gera 2x engagement vs texto | Métricas comparativas |
| 6 | Threading + Mentions | Conversas threaded reduzem toxicity vs top-level | Report rate por profundidade |
| 7 | Conversation Persistence | Users voltam a ler conversas passadas | History access rate |
| 8 | Search v2 | Semantic > keyword para descobrimento cross-tradição | Click-through por tipo de busca |
| 9 | i18n EN | EN speakers têm padrões de uso similares a BR | Cohort analysis EN vs BR |
| 10 | Citation v2 | Acadêmicos usam BibTeX export | Export count + scholar visits |

> **Regra:** se hipótese invalidada em 60 dias, pivotar ou matar feature. Não acumular débitos técnicos em features que ninguém quer.

---

> **Última atualização:** 2026-06-27 | **Próxima revisão:** 2026-07-06 (segunda — após Q3 retrospectiva)
> **Mantido por:** Tomás (PM) | **Fonte de verdade para priorização:** este documento + feedback de usuários via PostHog
> **Documento-irmão:** [`docs/ROADMAP-Q3-2026.md`](docs/ROADMAP-Q3-2026.md) (predecessor)
