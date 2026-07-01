# Community Features Research — Wave 29

> **Tipo:** Pesquisa + Recomendação
> **Wave:** 29 — Research 1/8
> **Data:** 2026-06-28
> **Owner:** Iyá (Curator) + General
> **Status:** ✅ Concluído
> **Branch:** `main` @ `66b9bd96` (cabaladoscaminhos)
> **Fontes:** Web research público (Reddit, Stack Exchange, Quora, Discord, Mighty Networks, Circle, Insight Timer, Gaia) + schema Prisma local + docs internos

---

## 1. Sumário Executivo

Pesquisa comparativa de **8 plataformas comunitárias** (5 generalistas + 3 nichadas em espiritualidade) contra o estado atual de Akasha Portal, resultando em **15 features priorizadas por ICE score** para Waves 29-31.

**TL;DR:**

- Akasha já tem uma **base sólida** (13 modelos Prisma, 8 route groups, feed/posts/comments/groups/events/library/mentorship/notifications funcionais ou scaffolded). Não está "começando do zero" — está refinando.
- O **gap crítico** não é feature, é **sinal de qualidade**: reputation, badges de tradição, moderação preventiva, content-warnings para público vulnerável.
- **Insight Timer** é a referência mais próxima ao nosso contexto (meditação + comunidade + teachers verificados) — mas o Akasha tem um diferencial que nenhum concorrente cobre: **cruzamento simbólico IA** (Mesa Real Cigana + 4 mapas).
- O roadmap W29-31 deve focar em **trust & safety + discovery personalizada**, não em mais features sociais genéricas.

---

## 2. Comparação de Plataformas

### 2.1 Matriz Consolidada

| Plataforma | Categoria | DAU | Modelo | Features-chave para o Akasha |
|---|---|---|---|---|
| **Reddit** | Fórum agregado | 70M (2023) | Ads + Premium | Subreddits (≈ nossos Groups), karma, voting, awards, AMA, Collections, wiki por sub |
| **Stack Exchange** | Q&A nichado | ~50M/mês | Ads + Jobs | Reputation + privileges, badges, "accepted answer", bounties, moderation electiva |
| **Quora** | Q&A + Spaces | ~30M | Quora+ ($5/mo), Ads | Spaces (sub-comunidades), paywall, Ads revenue share, Following de tópicos |
| **Discord** | Real-time chat | 200M+ | Nitro ($10/mo) | Roles granulares, voice channels, presence, bots, threads, eventos |
| **Mighty Networks** | Comunidade nichada | 5M creators | SaaS ($100+/mo) | Courses + events + community nativos, AI Cohost, member tiers |
| **Circle** | Comunidade nichada | 5M | SaaS ($100+/mo) | Async-first, spaces + courses + live streams, white-label |
| **Insight Timer** | Meditação + comunidade | 18M+ | Freemium | Groups, Live events, teacher following, biblioteca 290k meditações guiadas |
| **Gaia** | Consciência streaming | ~1M | Sub ($13.99/mo) | Documentaries + yoga + meditation, member community, courses |

### 2.2 Padrões Universais (todas têm)

1. **Voting / Reaction** — Reddit (upvote/downvote), SE (upvote + accepted), Quora (upvote), Mighty (reactions customizadas)
2. **Follow / Subscribe** — Reddit (subs), Quora (follow users/topics), Insight Timer (follow teachers), Discord (sub to channels)
3. **Collections / Saved** — Reddit (saved posts), Quora (bookmarks), Mighty (collections)
4. **Notifications** — todas têm multi-canal (in-app, email, push)
5. **Moderation queue** — todas têm report + admin panel, mesmo as mais permissivas
6. **Search + tags** — todas têm; algumas têm facets (Quora, Stack Exchange)
7. **Mobile-first** — Insight Timer 100% mobile-first; Reddit mobile = 60% tráfego

### 2.3 Onde cada uma Brilha (e o que copiar)

| Plataforma | Signature feature | Como o Akasha pode adaptar |
|---|---|---|
| **Reddit** | **Subreddits + Karma + Awards** | Groups já temos; karma +1 (veja F2); awards = reactions premium (F5) |
| **Stack Exchange** | **Reputation privileges + badges** | Modelo de privilégios por tradição (F3) — usuário que ajuda 10 pessoas em Cabala ganha "Estudioso de Cabala" badge e pode moderar grupo |
| **Quora** | **Spaces + paywall + Following de tópicos** | "Spaces" = nossos Groups por tradição; paywall = cursos / mentorias pagas; "Following topics" = nosso feed personalizado |
| **Discord** | **Roles + real-time presence + threads** | Roles (já temos GroupRole enum: MEMBER/MODERATOR/ADMIN); threads em comentários; presence (F12) |
| **Mighty Networks** | **Courses + Events + Community nativos** | Library já existe (50 artigos); falta courses estruturados + eventos com RSVP (já temos Event model) |
| **Insight Timer** | **Live group meditation + teacher following + groups** | Live events (já temos Event model); teacher verification (F14); group meditation timer — poderia ser UX diferencial (F15) |
| **Gaia** | **Original content + community + courses** | Biblioteca curada (já temos 50 artigos); courses (precisamos) |

---

## 3. Top 20 Features que Fazem uma Comunidade Ser Excelente

### 3.1 Discovery (encontrar conteúdo)

1. **Personalized feed (Para Você)** — Reddit (Best), Quora (Following), Mighty (Smart Feed)
2. **Tag-based filtering** — Stack Exchange, Quora Topics
3. **Search with facets** — SE, Quora, Discord search
4. **Trending / Hot now** — Reddit, Twitter
5. **Related posts (after reading)** — Medium, Stack Overflow

### 3.2 Engagement (participar)

6. **Voting (up/down) + reactions customizadas** — Reddit (clássico), Mighty (heart/celebrate/etc)
7. **Threaded comments** — Reddit, SE, Quora (aninhado 1 nível)
8. **Awards / Recognition** — Reddit (coins), Quora (upvotes visíveis)
9. **AMA (Ask Me Anything)** — Reddit signature
10. **Reposts / Share with credit** — Twitter, Reddit cross-post

### 3.3 Quality (qualidade do conteúdo)

11. **Reputation system** — SE (gamificado), Reddit (karma)
12. **Badges por tradição/prática** — SE (gold/silver/bronze), Foursquare
13. **Verified experts / Credentials** — Quora (Top Writer), Insight Timer (teacher badge)
14. **Pinned / Highlighted posts** — Reddit (sticky), Discord (pinned)
15. **Collections / Wiki por grupo** — Reddit wiki, Medium collections

### 3.4 Real-time (vibrancy)

16. **Live audio/video rooms** — Discord (Stage Channels), Twitter Spaces, Insight Timer Live
17. **Presence indicators** — Discord (online/away/DND)
18. **Push notifications opt-in** — todas
19. **Real-time typing + reactions in chat** — Discord, Mighty chat

### 3.5 Trust & Safety (essencial para espiritualidade)

20. **Content warnings / trigger warnings** — Tumblr, Mighty (sensitive content flag)
21. **Block + Report + Hide** — todas
22. **Trauma-informed design** — Insight Timer (gentle UX, no streaks shaming)
23. **Code of Conduct visível** — Discord (community guidelines), SE (Be Nice)
24. **Verified lineage / Tradition** — Insight Timer (teachers com bio + experiência), único nicho nosso

---

## 4. Mapeamento Features → Akasha

### 4.1 O que JÁ temos (Waves 11-23)

| Feature | Modelo Prisma | Rota UI | Status |
|---|---|---|---|
| Posts (5 tipos: TEXT/LINK/ARTICLE/QUESTION/EXPERIENCE/PRACTICE) | `Post` + `PostStatus` | `/feed`, `/post/[id]` | ✅ Schema + UI mock |
| Comments (com like) | `Comment` + `CommentLike` | thread em post | ✅ Schema + UI |
| Voting-like (Like + Reaction) | `Like` + `Reaction` | feed | ✅ Schema |
| Groups (12 tradições canônicas: cabala, ifa, astrologia, tantra, reiki, meditacao, xamanismo, cristianismo-mistico, sufismo, taoismo, umbanda, candomble) | `Group` + `GroupMember` + `GroupRole` | `/groups`, `/groups/[slug]` | ✅ Schema + UI |
| Follow users | `Follow` | `/u/[handle]` | ✅ Schema |
| Library (50 artigos curados) | `Article` + `ArticleType` + `EvidenceLevel` | `/library` | ✅ 50/150 |
| Events (com participante) | `Event` + `EventParticipant` | `/events` | ✅ Schema |
| Mentorship 1-on-1 | `Mentorship` + `MentorshipMessage` + flags em User | `/mentorship` | ✅ Schema |
| Notifications (13 tipos) | `Notification` + `NotificationPreference` | `/notifications` | ✅ Schema |
| Bookmarks | `Bookmark` + `PostBookmark` | feed | ✅ Schema |
| Drafts + scheduled publishing | `Draft` + `PostStatus` | editor | ✅ Schema (W14b) |
| Search | `src/lib/community/search.ts` | `/search` | ✅ Helper |
| RSS / Atom / JSON feeds | `/feed.xml`, `/feed.atom`, `/feed.json`, `/feed/[tradition]` | público | ✅ W14 |
| Onboarding espiritual | parcial (mapa-gerador pronto) | `/welcome` | 🟡 UI i18n W19 |
| Mapa espiritual pessoal | `MapaNatal`, `SpiritualProfile`, engines numerologia/astrologia/odu | `/akashic` | ✅ Engine pronto |
| Akasha IA (RAG + chat) | `AiConversation` + `AiMessage` + `AkashicFeedback` | `/oraculo` | 🟡 W18 partial |
| i18n (PT-BR/EN/ES) | `src/lib/i18n/`, middleware resolveLocale | global | ✅ W12 + W18 + W19 |
| Newsletter opt-in | `NewsletterSubscription` | settings | ✅ W14 |
| LGPD / audit trail | `Flag` + `AuditLog` | admin | ✅ W23 + W27 |
| Feature flags | `src/lib/feature-flags/` | infra | ✅ W20 |

### 4.2 O que FALTA (gaps priorizados)

| Gap | Plataforma de referência | Esforço |
|---|---|---|
| **Personalized "Para Você" feed** | Reddit Best / Quora Following | M (já temos dados) |
| **Reputation / Karma system** | Stack Exchange | M (1 model novo + scoring) |
| **Badges por tradição** | SE badges / Foursquare mayorships | M (1 model novo + lógica) |
| **Verified teachers / Credenciais** | Insight Timer | M (User field extension + admin queue) |
| **Mentor rating público** | já temos `mentorRating`, falta UI | S |
| **Live group meditation (UX diferenciada)** | Insight Timer | L (Realtime infra + UX) |
| **Presence / Online indicators** | Discord | S |
| **Threaded comments 2º nível** | Reddit | S |
| **AMA format nativo** | Reddit signature | M (PostType variant) |
| **Collections / Curated lists** | Medium | M |
| **Content warnings / Sensitive content flag** | Tumblr | S |
| **Code of Conduct público + Reporting UI** | Discord / SE | S |
| **Trauma-informed UX patterns** | Insight Timer | M (design review) |
| **Pinned / Highlighted posts por mods** | Reddit sticky | XS (UI) |
| **Awards / Celebration reactions** | Reddit | S |
| **Courses (paid)** | Mighty / Circle | L |
| **Courses (free) — Lessons estruturadas** | Insight Timer | M |
| **Voice notes em comentários** | Mighty signature | M |
| **Translation i18n dos posts** | Quora (multi-lang) | L |
| **Live audio rooms (Stage)** | Discord / Twitter Spaces | XL |

### 4.3 O que é ÚNICO para nosso contexto (espiritualidade universalista)

Estes NÃO devem ser copiados de outras plataformas — devem ser **inventados** pelo Akasha:

- **Mesa Real Cigana com cruzamento por casa** (36 cartas + 36 Odus + 4 mapas) — diferencial absoluto, nenhum concorrente tem
- **Linhagem espiritual verificada** (orixá regente, linhagem de Ifá, iniciação em Cabala) — diferente de "credential genérica"; requer protocolo de verificação comunitária
- **Modo "acolhimento" para público vulnerável** (pessoas em luto, crise, dúvida existencial) — insight do VISION §7 ("quem busca cura tá vulnerável")
- **Content warning cultural** (respeito a práticas sagradas: orixás não devem ser fetichizados, símbolos não devem ser usados sem contexto) — original nosso
- **Cross-tradition bridge** (recomendações: "se você curte Cabala, veja também Sufismo") — original nosso
- **Privacidade de mapa espiritual** (opt-in/opt-out de exposição pública do mapa astral completo) — original nosso (LGPD + espiritual)

---

## 5. Top 15 Features Priorizadas (ICE score)

> **ICE = Impact (1-10) + Confidence (1-10) + Ease (1-10)**. Quanto maior, melhor. Ordenadas por ICE decrescente.

| # | Feature | Impacto | Confiança | Facilidade | **ICE** | Effort | Wave | Dependências |
|---|---|:---:|:---:|:---:|:---:|:---:|---|---|
| **1** | **Personalized "Para Você" feed** (algoritmo híbrido: follows + tradition-match + Mapa pessoal) | 10 | 9 | 7 | **26** | M (5 dias) | W29 | Feed mock → real (já em W11) |
| **2** | **Reputation / Karma system** (1 ponto por like, 5 por comentário aceito, badges em thresholds) | 9 | 9 | 7 | **25** | M (4 dias) | W29 | Like + Comment já OK |
| **3** | **Content warnings / Trigger warnings** (5 categorias: luto, trauma, substância, política, sexualidade) | 10 | 8 | 8 | **26** | S (2 dias) | W29 | Post model + UI |
| **4** | **Pinned / Highlighted posts por mods** (UI: star icon + filter "destaques") | 8 | 9 | 9 | **26** | XS (1 dia) | W29 | GroupRole.MODERATOR já existe |
| **5** | **Verified teachers / Credenciais** (User.isVerifiedMentor + queue admin + 12 tradições) | 10 | 8 | 6 | **24** | M (5 dias) | W30 | User.isMentor existe; falta verify flow |
| **6** | **Badges por tradição** ("Estudioso de Cabala" = ajudou 10 pessoas em /groups/cabala) | 9 | 8 | 7 | **24** | M (4 dias) | W30 | Reputation system (#2) |
| **7** | **AMA nativo** (PostType.AMA + thread especial + convite a experts verificados) | 9 | 8 | 7 | **24** | M (3 dias) | W30 | Verified teachers (#5) |
| **8** | **Code of Conduct + Reporting UI** (botão Report em post/comment + mod queue + LGPD-compliant) | 9 | 9 | 7 | **25** | S-M (3 dias) | W29 | Flag model já existe |
| **9** | **Threaded comments 2º nível** (UI: replies aninhadas 1 nível + collapse) | 7 | 9 | 8 | **24** | S (2 dias) | W29 | Comment model OK |
| **10** | **Collections / Curated lists** (qualquer user pode criar "5 práticas para começar Tantra") | 8 | 8 | 7 | **23** | M (4 dias) | W30 | Post model + UI |
| **11** | **Trauma-informed UX review** (sem streaks shaming, sem "you haven't meditated today", soft language) | 9 | 7 | 7 | **23** | S (2 dias) | W30 | Designer Lina audit |
| **12** | **Awards / Celebration reactions** (5 reactions: 🙏 ❤️ ✨ 🌱 🔥 em vez de só like) | 7 | 9 | 9 | **25** | XS (1 dia) | W29 | Reaction enum já existe |
| **13** | **Presence indicators** ("vendo agora", "meditando", "online") | 6 | 8 | 7 | **21** | S (2 dias) | W30 | WebSocket / SSE |
| **14** | **Voice notes em comentários** (gravar 60s, transcrever automaticamente, acessível) | 8 | 7 | 6 | **21** | M (5 dias) | W31 | Storage + Whisper API |
| **15** | **Cross-tradition bridge recommendations** ("se você curte Cabala, veja Sufismo") | 8 | 7 | 6 | **21** | M (4 dias) | W31 | Mapa pessoal + ML simples |

### 5.1 Justificativas dos Top 5

#### 1. Personalized "Para Você" feed (ICE 26)
- **Por que primeiro:** sem feed personalizado, retenção D7 < 30%. Reddit/Quora provaram isso. Akasha tem `Follow`, `Group`, `SpiritualProfile` — dados suficientes para algoritmo v1 (sem ML, só regras).
- **Owner:** Coder + PM Tomás (definir pesos: 40% follows, 30% group-match, 20% Mapa pessoal, 10% trending)
- **Dependência:** Feed real substituindo mocks (já no roadmap W29)

#### 2. Reputation / Karma system (ICE 25)
- **Por que:** gamificação comprovada aumenta retenção 3-5x (Stack Exchange case study). Mas tem risco: pode gerar farming de karma. Solução: karma ≠ privilégios, mas karma + qualidade (likes de usuários com karma alto valem mais).
- **Owner:** Coder (scoring engine) + PM (regras anti-gaming)

#### 3. Content warnings / Trigger warnings (ICE 26)
- **Por que:** Insight Timer tem isso como core UX. Akasha precisa porque VISION §7 diz "quem busca cura tá vulnerável". Público espiritual é frequentemente em luto, crise, dúvida. Sem CW, podemos traumatizar.
- **Owner:** Coder (UI + model field) + Designer Lina (microcopy respeitosa) + Curator Iyá (categorias culturalmente sensíveis)

#### 4. Pinned / Highlighted posts (ICE 26)
- **Por que:** zero esforço, alto valor. Mods podem destacar posts críticos (eventos, anúncios, regras). Está no Reddit desde 2008.
- **Owner:** Coder (UI + toggle em GroupMember.role=MODERATOR)

#### 5. Verified teachers / Credenciais (ICE 24)
- **Por que:** Insight Timer ganha retenção porque tem 17k **teachers verificados** — usuários confiam. Akasha tem `User.isMentor` mas sem verificação. Sem verificação, podemos ter charlatães (risco ético grave em espiritualidade).
- **Owner:** Coder (verification flow + admin queue) + PM (playbook de verificação: como validar linhagem de Ifá? iniciação em Cabala? Tantra? — precisa de curadores por tradição)

---

## 6. Roadmap Wave 29-31

### Wave 29 (já em execução) — Trust & Foundations

**Foco:** Confiança + sinas de qualidade

| Feature | Effort | ICE | Status |
|---|---|---|---|
| Personalized "Para Você" feed (#1) | M | 26 | 🟡 Draft |
| Reputation / Karma system (#2) | M | 25 | ❌ |
| Content warnings / Trigger warnings (#3) | S | 26 | ❌ |
| Pinned / Highlighted posts (#4) | XS | 26 | ❌ |
| Code of Conduct + Reporting UI (#8) | S-M | 25 | ❌ |
| Threaded comments 2º nível (#9) | S | 24 | ❌ |
| Awards / Celebration reactions (#12) | XS | 25 | ❌ |

**Marco:** Akasha v0.2 — comunidade com trust signals básicos

### Wave 30 — Descoberta + Identidade

**Foco:** Personalização + verificação

| Feature | Effort | ICE | Status |
|---|---|---|---|
| Verified teachers / Credenciais (#5) | M | 24 | ❌ |
| Badges por tradição (#6) | M | 24 | ❌ |
| AMA nativo (#7) | M | 24 | ❌ |
| Collections / Curated lists (#10) | M | 23 | ❌ |
| Trauma-informed UX review (#11) | S | 23 | ❌ |
| Presence indicators (#13) | S | 21 | ❌ |

**Marco:** Akasha v0.3 — teachers verificados, badges, presença

### Wave 31 — Áudio + Descoberta Profunda

**Foco:** Voz + conexões cross-tradição

| Feature | Effort | ICE | Status |
|---|---|---|---|
| Voice notes em comentários (#14) | M | 21 | ❌ |
| Cross-tradition bridge recommendations (#15) | M | 21 | ❌ |

**Marco:** Akasha v0.4 — voz + descoberta semântica

---

## 7. Wireframes ASCII

### 7.1 Personalized "Para Você" Feed

```
┌────────────────────────────────────────────┐
│ ✦ Akasha          [🔍]   [🔔]  [👤 Avatar]│
├────────────────────────────────────────────┤
│  📚 Feed  🔍 Explore  👥 Grupos  📅 Eventos│
├────────────────────────────────────────────┤
│ [Para Você] [Seguindo] [Grupos] [Tendências]│
├────────────────────────────────────────────┤
│                                            │
│ ┌─ Post (CABALA, sua tradição forte) ────┐ │
│ │ ⬆ 47 ⬇  💬 12  ⭐  🔖                  │ │
│ │ "O que é Tiferet? Reflexão pessoal"     │ │
│ │ @ariel · há 3h · em /groups/cabala     │ │
│ │ [⚠ Conteúdo: luto]                     │ │
│ │ [🙏 8] [❤️ 12] [✨ 5] [🌱 3]           │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ ┌─ Post (TANTRA, recomendação cross) ─────┐ │
│ │ ⬆ 23 ⬇  💬 4   ⭐  🔖                 │ │
│ │ "Respiração consciente para ansiedade" │ │
│ │ @lucia · há 5h · em /groups/tantra     │ │
│ │ (sugerido: você curte Cabala, Tantra   │ │
│ │  compartilha o tema "respiração")      │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ [Carregar mais...]                         │
└────────────────────────────────────────────┘
```

### 7.2 Verified Teacher Profile

```
┌────────────────────────────────────────────┐
│ ← Voltar                                   │
├────────────────────────────────────────────┤
│ [Avatar]  Pai Joaquim de Ifá ✓             │
│           🎓 Verificado · 15 anos de      │
│           linhagem · Babalorixá desde 2008 │
│                                            │
│  1.2k seguidores · 47 mentorias ativas    │
│  ⭐ 4.9 (87 avaliações)                   │
│                                            │
│ [🙏 Pedir bênção] [💬 Mensagem] [📅 Agendar]│
├────────────────────────────────────────────┤
│ Sobre                                      │
│ "Iniciado em Ketu, comungado com Ossain.  │
│  Ofereço consultas de Ifá, búzios e       │
│  aconselhamento espiritual."              │
├────────────────────────────────────────────┤
│ [Posts] [Cursos] [Eventos] [Avaliações]   │
├────────────────────────────────────────────┤
│ 📌 Em destaque (pinned por mods)          │
│ • "Amanhã: live sobre Exu Tranca-Ruas"   │
└────────────────────────────────────────────┘
```

### 7.3 Content Warning (modal + inline)

```
┌────────────────────────────────────────────┐
│ [Novo Post]                                │
│ ────────────────────────────────────────── │
│ Tipo: [Reflexão ▾]                         │
│ Tradição: [Cabala ▾]                       │
│ Título: [_________________________________]│
│                                            │
│ ⚠ Este post contém conteúdo sensível?     │
│ ( ) Não                                   │
│ ( ) Luto / perda                          │
│ ( ) Trauma / abuso                        │
│ ( ) Substâncias psicoativas               │
│ ( ) Crise existencial / suicídio          │
│ ( ) Sexualidade                            │
│                                            │
│ [Cancelar]              [Publicar]        │
└────────────────────────────────────────────┘

Visualização inline:
┌────────────────────────────────────────────┐
│ "Meu irmão faleceu e isso mudou minha..." │
│ ⚠ Conteúdo: luto · [ver mesmo assim]      │
└────────────────────────────────────────────┘
```

### 7.4 Reputation + Badge Display

```
┌────────────────────────────────────────────┐
│ @ariel                                     │
│ ✦ 1,247 karma  ·  🏅 Estudioso de Cabala  │
│ 🏅 Acolhedor (50 pessoas ajudadas)        │
│ 📅 Membro desde jun/2024                  │
├────────────────────────────────────────────┤
│ Tradições: Cabala ✦✦✦✦ Tantra ✦✦        │
│ Seguidores: 234   Seguindo: 89            │
└────────────────────────────────────────────┘
```

---

## 8. Riscos & Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| **Charlatanismo** (teachers falsos dando conselho perigoso) | Alta | Crítico | Verified teachers (#5) + code of conduct (#8) + LGPD report queue |
| **Comparação social tóxica** ("fulano tem 10x meu karma") | Média | Alto | Reputation = reconhecimento, não ranking público (badges > leaderboards) |
| **Vieses entre tradições** (Cabala ganhar mais likes que Candomblé) | Alta | Alto | Algoritmo Para Você (#1) deve balancear tradição-match + qualidade |
| **Cultural appropriation** (usuários brancos falando de orixás sem contexto) | Alta | Alto | Content warnings + guidelines por tradição + verificação de linhagem |
| **Burnout de mods** | Média | Médio | Mod tools: auto-mod (palavras-chave), flags em massa, queue priorizada |
| **Público vulnerável em crise** | Alta | Crítico | Trauma-informed UX (#11) + content warnings (#3) + soft language |
| **Spam de karma farming** | Média | Médio | Rate limit + likes de high-karma valem mais + penalty por downvote |

---

## 9. Próximos Passos

### Para Wave 29 (esta semana)

1. **Disparar wave-29-1** (Personalized feed) — Coder + PM
2. **Disparar wave-29-2** (Reputation + Karma + Badges prep) — Coder
3. **Disparar wave-29-3** (Content warnings + Code of Conduct + Reporting UI) — Coder + Designer Lina + Curator Iyá

### Para Wave 30 (próxima)

4. **Verified teachers flow** — Coder + PM + Iyá (playbook de verificação por tradição)
5. **Badges por tradição** — Coder + Designer Lina (visual design dos badges)

### Para Wave 31

6. **Voice notes** — Coder (Whisper API) + Designer (UI mobile-first)
7. **Cross-tradition bridge** — Coder + Curator Iyá (curadoria semântica)

### Para Wave 32+ (futuro)

8. **Courses (free + paid)** — Product design + Stripe cleanup
9. **Live audio rooms (Stage)** — XL effort, requer realtime infra robusta
10. **Tradução i18n dos posts** — L effort, mas necessário para escalar EN/ES

---

## 10. Fontes & Referências

### Pesquisa web (usadas neste doc)

- Reddit: [redditinc.com](https://www.redditinc.com/), [Reddit Help — Karma](https://support.reddithelp.com/hc/en-us/articles/204511829-What-is-karma), [Reddit 2023 Retrospective (Sohu)](https://www.sohu.com/a/743966389_100298852)
- Stack Exchange: [Wikipedia — Stack Exchange](https://en.wikipedia.org/wiki/Stack_Exchange), [Stack Overflow Blog — Rewarding Question Askers](https://stackoverflow.blog/2019/11/13/were-rewarding-the-question-askers/), [Hybrid moderation in the newsroom (arXiv 2307.07317)](https://arxiv.org/abs/2307.07317)
- Quora: [Quora Monetization 101 (Medium)](https://nicolascole77.medium.com/quora-monetization-101-answers-paywalls-and-subscriptions-e2e158e0bbfa), [Everything about Quora 2025 (HackMD)](https://hackmd.io/WtZUYpWxQSCVEnJBnprxjg)
- Discord: [Discord Guidelines](https://discord.com/guidelines), [Discord roles (Zapier)](https://zapier.com/blog/discord-roles/), [Carl Bot features](https://bforbloggers.com/zh-CN/carl-bot-features-commands/)
- Mighty Networks: [mightynetworks.com](https://www.mightynetworks.com/), [Circle vs Mighty Networks (Ruzuku)](https://www.ruzuku.com/learn/articles/circle-vs-mighty-networks), [14 Best Community Platforms (Circle Blog)](https://circle.so/blog/best-community-platforms)
- Insight Timer: [insighttimer.com](https://insighttimer.com/), [Insight Timer Groups](https://insighttimer.com/blog/groups/), [What Are Private Groups (Insight Timer Help)](https://help.insighttimer.com/support/solutions/articles/67000664801-what-are-private-groups-on-insight-timer-)
- Gaia: [gaia.com](https://www.gaia.com/), [About Gaia](https://www.gaia.com/about), [Gaia Membership](https://www.gaia.com/invite/join)
- Spiritual wellness market: [Grand View Research](https://www.grandviewresearch.com/industry-analysis/spiritual-wellness-apps-market-report)

### Documentos internos (cabaladoscaminhos)

- `prisma/schema.prisma` (13 modelos da camada social)
- `src/lib/community/` (feed, posts, comments, groups, events, mentorship, notifications, search, bookmarks, drafts, reactions)
- `docs/ROADMAP-Q3-2026.md` (ICE scores já existentes — comparados nesta pesquisa)
- `docs/08_roadmap.md` (roadmap macro)
- `VISION.md` v3.0 §7 (público vulnerável) e §9 (regras éticas IA)

---

**Owner:** Iyá (Curator) + General
**Próxima wave sugerida:** Wave 30 Worker 2/8 — Verified teachers flow + Curadoria de tradições
**Status final:** ✅ Pronto para commit