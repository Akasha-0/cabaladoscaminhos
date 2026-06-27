# 📈 Evolution Log — Akasha Portal

> Caderno de bordo do cron `akasha-evolution-daily`
> Cada entrada adicionada pelo agente após análise de gaps

---

## 2026-06-27 (quarta) — entrada inicial

### Status atual
- 16+ commits na branch `feat/community-platform`
- Documentação estratégica completa (VISION, ARCHITECTURE, STRATEGY, MARKET, UX, EVIDENCE, AI-PROMPT, VALIDATION)
- UI da comunidade implementada com mocks (feed, explore, library, notifications, profile, groups)
- Landing `/validacao` capturando emails
- Plano de pesquisa 10-tracks em execução

### Gaps identificados

| Gap | Prioridade | Esforço | Pra quê |
|---|---|---|---|
| Auth Supabase funcional | **P0** | M (3-5 dias) | Sem login, não tem como salvar dados do usuário |
| Onboarding espiritual (gera mapa) | **P0** | M (3-5 dias) | Diferencial único do produto |
| API real substituindo mocks | **P0** | G (1-2 sem) | Feed/library/notifications com dados reais |
| Moderação básica (report, hide) | **P1** | M (2-3 dias) | Comunidade sem moderação = problema |
| Sistema de follows + likes + comments | **P1** | M (3-5 dias) | Engagement mínimo viável |
| Upload de mídia (avatares, imagens) | **P2** | M (2-3 dias) | Posts vazios perdem engagement |
| Notificações funcionais | **P2** | P (1-2 dias) | Retenção cai sem |
| Search full-text | **P2** | M (2-3 dias) | Fundamental pra descoberta |

### Tarefas priorizadas pra próxima sprint

1. **[P0] Setup auth Supabase** — signup/login/logout, middleware de proteção, integração com schema
2. **[P0] Onboarding espiritual 5 passos** — nome, tradições de interesse, nascimento (opcional), gera mapa básico
3. **[P1] CRUD de posts** — criar, listar, deletar; substituir mocks
4. **[P1] Follow + like + comment** — básico de engagement
5. **[P2] Moderação (report + hide)** — botão report, fila de mods

### Métricas de validação

- Conversion rate landing /validacao → >5%
- Signups via Supabase funcionando
- Primeiro post persiste e aparece no feed
- D7 retention dos primeiros 50 usuários

---

## 2026-06-27 (quarta) — gap analysis rigoroso (entrada do agente de evolução)

**Branch auditada:** `feat/community-platform`
**Janela:** últimos 7 dias (14 commits)
**Lidos nesta análise:** `VISION.md` (v3.0, 2026-06-26), `ARCHITECTURE.md` (v3.0, 2026-06-26), `docs/STRATEGY-chain-of-thought.md` (2026-06-26)
**Método:** leitura de docs → `git log --since="7 days ago"` → `find`/`grep` no código para cruzar "declarado vs real"

### Estado real vs declarado

A entrada inicial deste log listou itens como "feitos" que, ao cruzar com o código, estão **parcialmente** ou **só na forma de schema/página estática**:

| Declarado como "feito" | Realidade no código |
|---|---|
| Schema Prisma + 13 modelos | 13 modelos existem em `prisma/community.prisma` — **NÃO** mesclados em `schema.prisma`. Zero migrations SQL aplicadas (`prisma/migrations/` tem só `README.md`). |
| Feed com 5 filtros | Tem 4 (`Tudo`/`Seguindo`/`Grupos`/`Tendências`). Falta **"Para você"** (5º racional do STRATEGY §6.2). |
| Páginas: feed, explore, library, notifications, u/[handle], groups/[slug] | Existem, mas **alimentadas por MOCKS** (vide `src/app/(community)/feed/page.tsx:63` `// MOCK DATA (substituir por API real)`). |
| Landing `/validacao` | ✅ Existe `/api/waitlist` persistindo em `data/waitlist.json` local (não em Prisma). |
| Onboarding espiritual 5 passos | Existe page de 521 linhas, 5 passos `Welcome → Nome → Data → Hora → Confirmar`. **Divergente** do VISION §8 (que pede "tradições de interesse" como passo). |
| Auth Supabase funcional | APIs existem (`/api/auth/{login,register,logout,status}`), mas integração com `User` Prisma não verificada no código. |
| Schema refatorado (sem B2B) | `prisma/schema.prisma` AINDA contém 12 modelos B2B/Zelador: `Operator, Client, Reading, Report, Assinatura, Credito, TransacaoCredito, Empresa, Reminder, BirthChart, SynastryResult, LeituraHistorico`. |
| Deps removidas | `package.json` AINDA contém: `stripe, @stripe/stripe-js, web-push, bcryptjs, jsonwebtoken, qrcode, jspdf` e seus `@types`. |
| Mesa Real removida | `src/components/mesa-real/` (CasaModal, MesaRealGrid) + `src/app/(personal)/dashboard/mesa-real/page.tsx` AINDA existem. |
| Citation/Ritual/Tag/Repost | Modelos existem em `community.prisma` mas **ZERO** UI/API/teste. |
| Testes community | **0 testes** em `src/components/community/__tests__` é a única coisa (sem posts/groups/articles/follows). Total de 609 testes não cobre nada da camada social. |

### Tarefas priorizadas

Cada item: **O QUE** / **POR QUE** (link ao doc) / **CRITÉRIO DE PRONTO** / **ESFORÇO** (P=pontual <½ dia, M=médio 1-3 dias, G=grande >3 dias).

#### P0 — Bloqueio absoluto do MVP (sem isso a Fase 1 não roda)

1. **Mesclar `community.prisma` em `schema.prisma` + remover 12 modelos B2B**
   - O QUE: copiar 13 modelos da comunidade para o schema principal; deletar `Operator, Client, Reading, Report, Assinatura, Credito, TransacaoCredito, Empresa, Reminder, BirthChart, SynastryResult, LeituraHistorico`; rodar `prisma migrate dev --name init_community_platform`
   - POR QUE: ARCHITECTURE §3 diz "Remover (B2B / Zelador / Ferramentas pessoais)"; sem migration, nenhuma API da comunidade consegue ler/escrever
   - CRITÉRIO: `prisma migrate dev` cria migration limpa, `prisma db push` aplica, `prisma studio` mostra 13 modelos novos e ZERO B2B
   - ESFORÇO: M (1-2 dias)

2. **Remover deps B2B do `package.json`**
   - O QUE: `npm uninstall stripe @stripe/stripe-js @types/stripe web-push @types/web-push bcryptjs @types/bcryptjs jsonwebtoken @types/jsonwebtoken qrcode @types/qrcode jspdf @types/jspdf`
   - POR QUE: ARCHITECTURE §2 "❌ Remove (não faz sentido pra comunidade)"
   - CRITÉRIO: `pnpm install` limpo, build passa, `grep -E "stripe|web-push|bcrypt|jsonwebtoken|qrcode|jspdf" package.json` retorna 0
   - ESFORÇO: P (½ dia)

3. **Criar `.env.example`**
   - O WHAT: documentar `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL` (já que o gitignore exclui `.env`)
   - POR QUE: ARCHITECTURE §6 lista as env vars; sem `.env.example` o onboarding de novos devs é cego
   - CRITÉRIO: `cp .env.example .env` + `pnpm dev` funciona com Supabase mockado OU apontando para projeto real
   - ESFORÇO: P (½ dia)

4. **Substituir MOCKS do feed por API real (`/api/posts`)**
   - O QUE: criar `POST/GET /api/posts` (criar + listar feed paginado), `GET /api/posts/[id]`, `DELETE /api/posts/[id]`; trocar `MOCK_POSTS` em `feed/page.tsx` por `useEffect` + fetch
   - POR QUE: ARCHITECTURE §5 "Manter" lista `/api/posts`; VISION §8 Fase 1 tem "API real (substituir mocks)"
   - CRITÉRIO: criar post via UI → aparece no feed depois de refresh; reload sobrevive; sem `// MOCK DATA` no arquivo
   - ESFORÇO: M (2-3 dias)

#### P1 — Bloqueio de "100 usuários ativos" (Definition of Done Fase 1)

5. **Implementar `/api/groups` (CRUD + join/leave)**
   - O QUE: `GET /api/groups`, `GET /api/groups/[slug]`, `POST/DELETE /api/groups/[slug]/join`; ligar à `groups/[slug]/page.tsx`
   - POR QUE: ARCHITECTURE §5 "Criar (Fase 1)"; STRATEGY §10 Fase 1 tem "Grupos funcionais"
   - CRITÉCIO: clicar "Entrar" em `/groups/cabala` persiste `GroupMember` e renderiza feed do grupo
   - ESFORÇO: M (2-3 dias)

6. **Implementar `/api/users/[handle]/follow` + `POST /api/posts/[id]/likes` + `POST /api/posts/[id]/comments`**
   - O QUE: 3 endpoints (follow, like, comment) com mutações idempotentes
   - POR QUE: STRATEGY §10 Fase 1 "Sistema de posts/comments/likes/follows"
   - CRITÉRIO: botões funcionam, contadores batem, sem duplicar like do mesmo user
   - ESFORÇO: M (3-4 dias)

7. **Onboarding: incluir passo "tradições de interesse" (alinhado com VISION §8)**
   - O QUE: inserir passo 3 ("Quais tradições te interessam?") entre Nascimento e Hora, salvar em `SpiritualProfile.traditions` (campo novo no schema)
   - POR QUE: VISION §8 "Onboarding espiritual (gera mapa)"; STRATEGY §5 Persona 1 cita esse passo
   - CRITÉRIO: 3-5 tradições selecionáveis (multi-select), persistem, alimentam feed "Para você" depois
   - ESFORÇO: P-M (1-2 dias)

8. **Auth: integrar Supabase auth com `User` Prisma**
   - O QUE: ao registrar via Supabase, criar `User` Prisma com `supabaseUserId`; middleware `middleware.ts` valida sessão e injeta `userId` no request
   - POR QUE: ARCHITECTURE §3 define `User.supabaseUserId String? @unique`; sem isso, Auth e Prisma ficam desconectados
   - CRITÉRIO: signup → login → `prisma.user.findUnique({where: {supabaseUserId}})` retorna o user; rota protegida redireciona pra login
   - ESFORÇO: M (2-3 dias)

9. **Remover Mesa Real + cockpit morto**
   - O QUE: `rm -rf src/components/mesa-real src/app/(personal)/dashboard/mesa-real src/app/(personal)/dashboard/clientes src/app/(personal)/dashboard/relatorios src/components/cockpit` (se existir)
   - POR QUE: ARCHITECTURE §1 Fase 1 "Remover componentes mortos — `cockpit/`, `mesa-real/`"; VISION §1 marca como "NÃO é ferramenta de zelador/terapeuta"
   - CRITÉRIO: `grep -r "mesa-real\|cockpit" src/` retorna 0 (ou apenas referências em docs históricos)
   - ESFORÇO: P (½ dia)

#### P2 — Fase 2 (Biblioteca + Grupos ativos)

10. **Sistema de Citations (referências estruturadas)**
    - O QUE: UI inline para anexar Citation a Post/Comment/Article; validação Zod; verificação por moderador
    - POR QUE: STRATEGY §9.3 define `model Citation`; VISION §9 "SEMPRE cita"
    - CRITÉRIO: post pode ter 1-N citations com DOI/url; renderiza link clicável
    - ESFORÇO: M (2-3 dias)

11. **Biblioteca: 5 artigos curados com nível de evidência (MVP do conteúdo)**
    - O QUE: seed de 5 artigos (ex: ayahuasca + DMN, psilocibina + depressão, meditação Vipassana + ansiedade, rapé + nervoso vago, Reiki + cortisol) com `evidenceLevel` em `Article`
    - POR QUE: STRATEGY §10 Fase 2 "50+ artigos curados com nível de evidência" — começar com 5 pra validar schema
    - CRITÉRIO: `/library` lista 5 artigos com badge "Revisado por pares" / "Estudo clínico" / "Anecdótico"
    - ESFORÇO: M (2-3 dias)

12. **Implementar 5º feed racional "Para você" (algoritmo)**
    - O QUE: query com sinais do STRATEGY §6.3 (tradição do mapa +5, tópico dos salvos +3, autor útil +2, refs científicas +1, idade <48h +1; negativos simétricos); UI tab no feed
    - POR QUE: STRATEGY §6.2 explicitamente lista 5 racionais
    - CRITÉRIO: usuário com `SpiritualProfile` vê posts ranqueados diferentes do feed "Seguindo"
    - ESFORÇO: G (4-5 dias)

13. **Notificações funcionais (cruzando community + Supabase Realtime)**
    - O QUE: já existem `src/app/api/notifications/*`; falta ligar com `Notification` da `community.prisma` e disparar evento quando alguém curte/segue/comenta
    - POR QUE: STRATEGY §10 Fase 1 "Notificações básicas"
    - CRITÉRIO: like em post gera `Notification` pro autor, aparece em `/notifications` em <5s
    - ESFORÇO: M (2-3 dias)

#### P3 — Fase 3 (IA Curadora)

14. **pgvector + embeddings: preparar schema e index**
    - O QUE: `CREATE EXTENSION vector; ALTER TABLE Article ADD COLUMN embedding vector(1536);` via migration
    - POR QUE: ARCHITECTURE §7 Fase 3; VISION §8 Fase 3
    - CRITÉCIO: `prisma db push` aplica, query `SELECT id FROM article ORDER BY embedding <=> $1 LIMIT 5` funciona
    - ESFORÇO: M (1-2 dias)

15. **Chat curador RAG (MVP)**
    - O QUE: `POST /api/ai/curator` recebe pergunta → embed → top-5 artigos via pgvector → prompt ao LLM com 8 regras éticas do `AI-PROMPT-base.md`
    - POR QUE: VISION §2 + STRATEGY §7 + AI-PROMPT-base.md
    - CRITÉRIO: pergunta "ayahuasca ajuda em depressão?" retorna resposta citando Carhart-Harris + disclaimer "consulte profissional"
    - ESFORÇO: G (5-7 dias)

### Métricas de validação (para próxima revisão)

- **Schema**: `prisma migrate status` → 0 drift, 13 community models
- **B2B removido**: `grep -c "stripe\|web-push\|bcrypt\|jsonwebtoken\|qrcode\|jspdf" package.json` → 0
- **MOCKS removidos**: `grep -r "MOCK DATA" src/app/(community)/` → 0
- **APIs da comunidade**: `find src/app/api -name "route.ts" | grep -E "posts|groups|follow|like|comment|article"` → ≥10
- **Testes community**: `find tests -name "*community*" -o -name "*feed*" -o -name "*post*"` → ≥5 arquivos
- **Auth integrado**: signup E2E → prisma user existe
- **Conversão /validacao**: ≥5% (meta da entrada anterior)

### Decisões que ainda precisam do user (não inventar)

Reaproveitando §8 do ARCHITECTURE e §12 do STRATEGY, com prioridade pra esta semana:
1. **Dashboard pessoal** — manter (decisão do user em 2026-06-04 foi "MESA REAL é o widget principal") ou remover e focar 100% comunidade? O branch atual tem AMBOS.
2. **Mesa Real** — manter como jogo compartilhável na comunidade OU remover definitivamente? (item P1 #9 acima pressupõe remoção; ARCHITECTURE diz remover, mas perfil do user em 2026-06-04 valorizava a Mesa)
3. **Onboarding espiritual** — manter passo "tradições de interesse" no signup (VISION §8) ou tornar opcional (ARCHITECTURE §8 pergunta 3)?
4. **Análise**: 1.000 LOC + 14 commits no branch mas o MVP ainda não roda end-to-end. Acelerar P0 → P1 ou pivotar escopo?

### Próximo ciclo do agente (sugestão)

Re-rodar este gap analysis após P0 #1-#4 estarem merged, focar em medir:
- % de P0 fechado
- typecheck verde (`pnpm tsc --noEmit`)
- testes community passando (`pnpm test src/components/community`)
- build size de `/.next` (alvo: < 5MB na rota `/`)
