# Auto-Moderation + Safety W36

> **Wave 36 · MODERATION 5/8** · Auto-mod pipeline + multi-language + safety at scale

## 1. Propósito

Estabelecer o pipeline automatizado de moderação para o Akasha Portal — substituindo
triagem 100% manual por uma decisão automatizada em 5 estágios, com revisão humana
nos casos limítrofes. O sistema é desenhado sob três princípios:

1. **Universalismo** — o pipeline NÃO julga tradições religiosas; apenas bloqueia
   discurso de ódio, golpes, spam, e mercantilização de termos sagrados.
2. **LGPD by-design** — toda decisão é registrada como metadados agregados (Art. 7),
   expõe apenas dados anonimizados no relatório público (Art. 18), e remove EXIF
   de geolocalização em uploads (Art. 37).
3. **Escala responsável** — sistema in-memory para MVP; troca planejada por Redis
   (já instalado: `ioredis`) sem mudança de API pública.

---

## 2. Arquitetura geral

```
┌──────────────────────────────────────────────────────────────────┐
│                    POST /api/moderation/check                     │
└────────────────────┬─────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   runAutoMod(input)        │
        │   (auto-mod-pipeline.ts)   │
        └────────┬───────────────────┘
                 │
   ┌─────────────┼─────────────────────────────┐
   ▼             ▼             ▼             ▼   ▼
┌──────┐    ┌──────┐     ┌──────┐     ┌──────┐  ┌──────┐
│Stage1│    │Stage2│     │Stage3│     │Stage4│  │Stage5│
│keyword   │toxic.│     │spam  │     │sacred│  │ rate │
│filter    │score │     │detect│     │check │  │anom. │
└──────┘    └──────┘     └──────┘     └──────┘  └──────┘
   │             │             │             │       │
   └─────────────┴─────────────┴─────────────┴───────┘
                          │
                          ▼
              ┌──────────────────────┐
              │  aggregateDecision   │
              └──────────┬───────────┘
                         ▼
              APPROVE / FLAG / HIDE / REMOVE
                         │
                         ▼
              ┌──────────────────────┐
              │  recordAuditLog      │  → AuditLog table
              └──────────────────────┘
```

---

## 3. Os 5 estágios

### 3.1 Stage 1 — Keyword filter

**Arquivo:** `src/lib/moderation/banned-content.ts`

Compara o texto contra 4 catálogos:

| Categoria | Exemplos | Severidade |
|-----------|----------|------------|
| `spam` | "compre agora", "click here", "free money" | 0.20 |
| `scam` | "bitcoin doubler", "100% garantido", "ganhe dinheiro" | 0.35 |
| `sacred` | "level up espiritual", "amarração amorosa", "regressão kármica paga" | 0.15 |
| `hate` | "viado", "macumbeiro", "faggot", "nigger" | 0.45 |

Também aplica regex patterns (10+ padrões):
- Garantias absolutas (`garanto que`, `100% garantido`)
- Endereços de cripto wallet (`0x[a-fA-F0-9]{40}`, `bitcoin doubler`)
- URL shorteners (`bit.ly`, `tinyurl.com`)
- Shouting (caps lock + exclamações)

**Universalismo:** palavras sagradas isoladas ("orixá", "kundalini") NÃO bloqueiam.
Apenas padrões mercantilizados (sagrado + R$/pix na mesma frase) disparam sinal.

### 3.2 Stage 2 — Toxicity score

**Lexicon próprio + amplificadores/negação.** Não usa Perspective API (evita custo
+ transferência para Google).

```ts
score = toxic * 0.15 + amplified * 0.05
score -= negated * 0.10   // "não sou burro" anula toxic
score += 0.15 if shouting + toxic
```

| Faixa | Ação |
|-------|------|
| < 0.5 | passa |
| 0.5–0.9 | FLAG |
| >= 0.9 | REMOVE |

### 3.3 Stage 3 — Spam detection

Heurística adicional independente de keywords:
- URL shorteners (bit.ly, tinyurl.com, etc.)
- Repositórios de marketplace (shopee, aliexpress, amazon/dp)
- Repetição de caractere (`!!!!!????`)
- Emoji overload (> 30% do texto)
- CTA + link (`saiba mais` + URL)
- Caps block (>= 20 chars só A-Z + pontuação)

### 3.4 Stage 4 — Sacred-cultural check

**Onde a curadoria Iyá atua como guardiã.**

Detecta 4 padrões problemáticos:

1. **Mercantilização**: termo sagrado (`orixá`, `kundalini`, `sefirot`) + marcador
   comercial (`R$`, `pix`, `comprar`, `pagamento`) na mesma frase.
2. **Cura não-verificável**: `(cura|tratamento) definitivo`, `garanto X% de cura`.
3. **Falsa autoridade comercial**: `(eu sou mestre/bruxo/pai-de-santo) + (aceito/clientes)`.
4. **Mismatch tradição declarada vs conteúdo**: usuário declara `cabala` mas escreve
   sobre `preto-velho` sem contexto.

A decisão é "FLAG → curador humano". Auto-mod não tem competência cultural.

### 3.5 Stage 5 — Rate anomaly

**Estado in-memory** por autor:

```ts
Map<authorId, timestamps: number[]>
```

Janela: 60s. Threshold: 5 publicações/min. Limpeza periódica a cada 5min
(com `unref()` para não segurar processo).

Padrões:
- **Burst normal**: 3 posts em 60s = OK.
- **Burst suspeito**: 6+ posts = FLAG (possível spam coordenado).
- **Cross-posting**: hash de conteúdo normalizado (FNV-1a) detecta duplicatas
  entre autores → sinaliza coordinated inauthentic behavior.

---

## 4. Decisões e limiares

```
Hate detection → REMOVE (confiança 0.95)
Severe toxicity (>= 0.9) → REMOVE (confiança 0.90)
Crypto + garantia absoluta → REMOVE (confiança 0.95)
Spam score >= 0.7 → HIDE
Sacred mercantilism >= 0.6 → FLAG
Rate anomaly >= 0.7 → FLAG
Toxicity >= 0.5 → FLAG
Somatório ponderado >= 0.6 → FLAG
Somatório 0.3–0.6 → APPROVE com ressalva
< 0.3 → APPROVE
```

| Decisão | Comportamento |
|---------|---------------|
| **APPROVE** | Conteúdo público imediatamente. Audit log registrado. |
| **FLAG** | Conteúdo vai para fila `/admin/moderation/queue` (SLA 24h). Autor recebe hint. |
| **HIDE** | Conteúdo some do feed público. Visível apenas ao autor e moderadores. |
| **REMOVE** | Conteúdo bloqueado. Autor notificado. Pode apelar em 30 dias. |

---

## 5. Banned content — catálogos completos

### 5.1 Spam (PT-BR + EN + ES)

`compre agora`, `clique aqui`, `oferta imperdível`, `promoção limitada`, `desconto exclusivo`, `frete grátis`, `dinheiro fácil`, `renda extra garantida`, `trabalhe de casa`, `seja nosso parceiro`, `invista agora`, `ganhe dinheiro`, `multiplique seus ganhos`, `saiu na mídia`, `vagas abertas`, `cadastre seu email`, `saiba mais`, `click here`, `buy now`, `free money`, `limited time offer`, `exclusive deal`, `make money fast`, `work from home`, `sign up now`, `join thousands`, `compra ahora`, `oferta limitada`, `dinero fácil`, `trabaja desde casa`.

### 5.2 Scam

`bitcoin doubler`, `dobrador de bitcoin`, `esquema ponzi`, `pirâmide financeira`, `fique rico rápido`, `empréstimo sem consulta`, `cpf negativado`, `nome limpo`, `aposta garantida`, `palpite certeiro`, `certeza absoluta`, `sem risco nenhum`, `100% garantido`, `retorno garantido`, `em 24 horas`, `do dia pra noite`, `criptomoeda garantida`, `lucre com`, `satoshi nakamoto me contatou`, `ganhe bitcoin grátis`, `airdrop grátis`, `giveaway cripto`, `envie bitcoin para`.

### 5.3 Sacred (mercantilização)

- **Gamificação anti-respeito**: `level up espiritual`, `achievement espiritual`, `pontuação mística`, `streak de oração`, `ranking de médiuns`, `score kármico`, `desbloqueie o próximo nível`, `suba de nível espiritual`, `XP sagrado`, `moeda espiritual`, `energia comprada`, `crédito espiritual`.
- **Moderação punitiva visível**: `você levou strike`, `você foi mutado`, `você foi banido`, `aviso formal`, `penalidade de karma`, `castigo espiritual`.
- **Mercado de manipulação**: `amarre de amor`, `amarração amorosa`, `vinculação amorosa`, `amarre forte`, `amarração definitiva`, `regressão kármica paga`, `limpeza espiritual cobrada`, `feitiço sob encomenda`, `trabalho espiritual garantido`.

### 5.4 Hate

- **Orientação**: `viado`, `sapatão`, `bicha`, `gay de`, `lésbica de`.
- **Religião**: `macumbeiro`, `crente fanático`, `ateu desgraçado`, `judeu avarento`, `muçulmano terrorista`, `evangélico burro`, `católico hipócrita`.
- **Raça/etnia**: `preto de`, `negro de`, `favelado`, `macaco`, `branquelo`, `índio preguiçoso`.
- **Outros**: `deficiente inútil`, `velho inútil`, `gorda nojenta`.
- **EN**: `faggot`, `nigger`, `kike`, `spic`, `chink`, `tranny`, `retard`.

---

## 6. Multi-language detection

**Arquivo:** `src/lib/moderation/language-detect.ts`

Implementação própria sem `franc` (200KB a menos). Combina:

1. **Stopwords density** (peso 0.65) — palavras funcionais PT/EN/ES/FR/IT.
2. **Accent density** (peso 0.25) — diacríticos únicos (ã, õ, ç, ñ, ç, è, é, ê).
3. **Verb density** (peso 0.10) — verbos curtos conjugados.

### 6.1 Resultado

```ts
{
  primary: { code: 'pt', name: 'Português', confidence: 0.72 },
  secondary: { code: 'en', name: 'English', confidence: 0.21 },
  isMultilingual: true,
  scores: { pt: 0.72, en: 0.21, es: 0.04, fr: 0.02, it: 0.01 },
  recommendation: {
    needsTranslation: true,
    targetLanguage: 'en',
    reason: 'Texto multilíngue — sugerir tradução do trecho secundário.',
  }
}
```

### 6.2 Mix-language handling

Quando `secondary.confidence >= 0.20` (>= 20% relativo), marca como `isMultilingual=true`
e sugere tradução. Threshold mais baixo que padrão porque posts bilíngues
(PT-EN sobre Cabala hermética, PT-ES sobre Candomblé afro-latino) são comuns.

### 6.3 Confiança baixa

Se `primary.confidence < 0.40`, retorna `und` (undetermined). O auto-mod pede
ao usuário que confirme o idioma antes de publicar — implementável em Wave 37+
via UI banner.

---

## 7. Image moderation

**Arquivo:** `src/lib/moderation/image-mod.ts`

### 7.1 NSFW detection

Heurística em duas camadas:

**Camada 1 — Filename/URL patterns** (sem abrir bytes):
```ts
NSFW_FILENAME_PATTERNS = [
  /\bnsfw\b/i, /\bnude\b/i, /\bnaked\b/i, /\bporn\b/i, /\bxxx\b/i,
  /\bdesnud[oa]\b/i, /\bnudez\b/i, /\bgore\b/i, /\bsangue\b/i,
];
```

**Camada 2 — Provider integration** (em produção):
- **Cloudflare Images moderation** — integrado via W34 security
- **AWS Rekognition** — fallback opcional
- Pesos: `nsfwScore > 0.5 = BLUR`, `> 0.9 = REMOVE`

### 7.2 Copyright check

Domínios livres (`pixabay`, `unsplash`, `pexels`, `wikimedia`) recebem flag
`isFreeDomain`. Wikimedia exige atribuição explícita. Outras URLs externas
exigem `MANUAL_REVIEW`.

### 7.3 EXIF stripping (LGPD Art. 37)

Cada imagem uploaded passa por `checkExif`:

| EXIF | Risco LGPD | Ação |
|------|-----------|------|
| GPS presente | `high` | STRIP_EXIF + warning autor |
| Camera info | `low` | STRIP_EXIF |
| Timestamp | `low` | STRIP_EXIF |
| Desconhecido | `medium` | STRIP_EXIF (default-seguro) |

Stripping real acontece no servidor de upload (Supabase Storage
+ image transform), não no client. Aqui apenas sinalizamos o requisito.

### 7.4 Religious symbols (auto-tag)

33+ padrões reconhecidos por filename + alt-text + URL path:

**Candomblé/Umbanda/Ifá**: `orixá`, `ogum`, `oxum`, `iemanja`, `xango`, `obaluaê`,
`exu`, `preto-velho`, `caboclo`, `ponto-riscado`, `pomba-gira`.

**Cabala**: `árvore-da-vida`, `tetragrammaton`, `menorah`, `estrela-de-davi`,
`kipá`, `torah`.

**Cristianismo**: `cruz`, `cristograma`, `rosário`, `ícone-cristão`.

**Islamismo**: `crescente`, `kalma`.

**Hinduísmo/Budismo/Tantra**: `om`, `lótus`, `mandala`, `sri-yantra`, `buda`.

**Astrologia**: `símbolo-zodiacal`.

**Geral**: `incenso`, `vela-ritual`.

Auto-tag enriquece o post para recomendação de conteúdo similar na Akasha IA.
Não bloqueia — apenas adiciona metadata.

---

## 8. Trending + viral detection

**Arquivo:** `src/lib/community/trending.ts`

### 8.1 Engagement velocity

Cada evento (`view`, `reaction`, `comment`, `share`, `bookmark`) é registrado
em estado in-memory com timestamp.

**Score:**
```ts
score = (
  views * 0.1 +
  reactions * 2 +
  comments * 5 +
  shares * 8 +
  bookmarks * 3
) * exp(-ageMin / 60)
```

Decay temporal = ~63% a cada hora. Posts com 5min de idade e 50 engajamentos
pesados (>5 pontos cada) já chegam a `trending` bucket.

### 8.2 Anomaly detection (4 tipos)

| Tipo | Trigger | Confiança |
|------|---------|-----------|
| `viral_spike` | 60% do engajamento no último minuto, com base > 30 | share of recent |
| `cross_posting` | Hash de conteúdo duplicado em 3+ posts de 2+ autores | 3 dupes = 0.30; 10 dupes = 1.0 |
| `coordinated_reactions` | 10+ reações de 8+ atores em 60s | 10 = 0.33; 30 = 1.0 |
| `view_bombing` | 50+ views com < 3 engajamentos em 5min | 50 = 0.25; 200 = 1.0 |

### 8.3 Ação sugerida

- `MONITOR` → aparece em `/admin/moderation/queue` com badge amarelo.
- `FLAG` → vai para fila prioritária + autor recebe hint de "viral detectado".
- `HIDE` → reservado para casos extremos (não usado ainda — futuro).

---

## 9. Report flow refinado

**Página:** `/report/[postId]`
**API:** `POST /api/report`

### 9.1 Categorias expandidas (W36)

| Categoria | Legacy enum | Roteamento |
|-----------|------------|-----------|
| SPAM | SPAM | community-team |
| HARASSMENT | HARASSMENT | community-team |
| MISINFO | MISINFO | curator-team |
| **SACRED_OFFENSE** (novo) | OTHER + `[reason_w36: SACRED_OFFENSE]` | curator-team (Iyá) |
| **COPYRIGHT** (novo) | OTHER + `[reason_w36: COPYRIGHT]` | security-team (Caio) |
| **NSFW** (novo) | OTHER + `[reason_w36: NSFW]` | security-team |
| OTHER | OTHER | community-team |

### 9.2 Schema migration strategy

**Sem migration nova.** Reusamos `FlagReason` legado (`SPAM|HARASSMENT|MISINFO|OTHER`)
e discriminamos a categoria W36 via `description` (campo text já existente).

Trade-off: enum semanticamente "frouxo", mas economiza migration. Quando volume
justificar (Wave 38+), promove-se para `FlagReason` nativo.

### 9.3 Evidence + routing

- Até 10 evidências (links, imagens, citações) por denúncia.
- Routing automático por categoria garante que o especialista certo vê primeiro.
- Audit log separado (`REPORT_SUBMITTED`) preserva razão W36 original.

---

## 10. Mod queue admin refinada

**Página:** `/admin/moderation/queue`
**API:** `GET /api/admin/moderation/queue`, `PATCH /api/admin/moderation/[id]/decision`

### 10.1 Filtros

| Filtro | Valores |
|--------|---------|
| `status` | PENDING, REVIEWED, ACTIONED, DISMISSED |
| `reason` | SPAM, HARASSMENT, MISINFO, OTHER (legado) |
| `decision` | APPROVE, FLAG, HIDE, REMOVE |
| `sla` | `all`, `urgent` (1-6h), `overdue` (>24h) |
| cursor | paginação por id |

### 10.2 SLA histogram

A página admin mostra 4 buckets:
- `< 1h` (verde) — fresh
- `< 6h` (âmbar) — atenção
- `< 24h` (laranja) — limite
- `> 24h` (vermelho) — SLA quebrado

### 10.3 Bulk actions

Seleção múltipla + 5 decisões em lote:
- `APPROVE` → `REVIEWED`
- `FLAG` → mantém PENDING com reviewer atribuído
- `HIDE` → `ACTIONED` + `actionTaken=hide`
- `REMOVE` → `ACTIONED` + `actionTaken=delete`
- `DISMISS` → `DISMISSED` + `actionTaken=dismiss`

PATCH endpoint aceita `ids: string[]` para batch + idempotência por id.

### 10.4 Appeals workflow (futuro W37+)

Flag revertida (`status: DISMISSED` após ter sido `ACTIONED`) conta como appeal.
Taxa de reversão exibida no transparency report.

---

## 11. Transparency report

**Página:** `/transparency/moderation`
**API:** `GET /api/transparency/moderation?month=YYYY-MM`

### 11.1 Dados agregados

```json
{
  "month": "2026-07",
  "total": 142,
  "byReason": { "SPAM": 64, "HARASSMENT": 21, "MISINFO": 18, "OTHER": 39 },
  "byStatus": { "PENDING": 12, "REVIEWED": 80, "ACTIONED": 38, "DISMISSED": 12 },
  "byAction": { "dismiss": 12, "hide": 28, "delete": 10, "reviewed": 80 },
  "sla": {
    "p50Hours": 4.2,
    "p95Hours": 21.5,
    "reviewedCount": 130,
    "over24hCount": 8
  },
  "appeals": {
    "total": 12,
    "rate": 0.105,
    "reverseRate": 0.105
  }
}
```

### 11.2 LGPD Art. 7, 18, 37

- Nenhum PII exposto (apenas contagens).
- `robots: index=true` — público e encontrável.
- Auto-mod coverage: `manualOverrides` rastreia quantas decisões humanas
  sobrescreveram o auto-mod (futuro Wave 38+).

### 11.3 Universalismo no relatório

Footer lembra: "o pipeline NÃO julga tradições religiosas; apenas bloqueia
discursos de ódio, golpes, spam, e mercantilização de termos sagrados."

---

## 12. API endpoints

| Método | Path | Descrição |
|--------|------|-----------|
| POST | `/api/moderation/check` | Avalia conteúdo via pipeline 5 estágios |
| POST | `/api/report` | Submete denúncia (7 categorias W36) |
| GET | `/api/admin/moderation/queue` | Lista fila com filtros + stats |
| PATCH | `/api/admin/moderation/[id]/decision` | Aplica decisão (suporta bulk) |
| GET | `/api/transparency/moderation?month=YYYY-MM` | Relatório público mensal |

### 12.1 POST /api/moderation/check

```bash
curl -X POST https://akasha.app/api/moderation/check \
  -H 'content-type: application/json' \
  -d '{
    "targetType": "POST",
    "authorId": "user_123",
    "text": "Amarre de amor por R$ 500, resultado garantido em 24h",
    "urls": [],
    "tradition": "candomble"
  }'
```

Resposta:
```json
{
  "data": {
    "decision": "FLAG",
    "confidence": 0.85,
    "primaryReason": "sacred",
    "reasonText": "Possível mercantilização de termo sagrado...",
    "stages": [
      { "stage": 1, "name": "keyword_filter", "score": 0.6, "signals": ["sacred:amarração amorosa"] },
      { "stage": 4, "name": "sacred_cultural", "score": 0.8, "signals": ["sacred_mercantilism:amarração amorosa"] }
    ],
    "needsHumanReview": true,
    "language": { "primary": { "code": "pt", "confidence": 0.95 } }
  }
}
```

### 12.2 POST /api/report

```bash
curl -X POST https://akasha.app/api/report \
  -H 'content-type: application/json' \
  -d '{
    "targetType": "POST",
    "targetId": "post_abc",
    "reason": "SACRED_OFFENSE",
    "description": "Uso mercantilista de Exu",
    "evidence": [{ "type": "link", "value": "https://..." }]
  }'
```

Resposta:
```json
{
  "data": {
    "flagId": "flag_xyz",
    "status": "PENDING",
    "routedTo": "curator-team",
    "message": "Denúncia registrada..."
  }
}
```

---

## 13. Auditoria e logs

Cada decisão de auto-mod gera entrada em `AuditLog`:

```ts
{
  action: 'AUTO_MOD_DECISION',
  metadata: {
    targetType: 'POST',
    targetId: 'post_abc',
    authorId: 'user_123',
    decision: 'FLAG',
    confidence: 0.85,
    primaryReason: 'sacred',
    stages: [...],
    language: 'pt',
    evaluatedAt: '2026-07-01T04:00:00Z',
  }
}
```

Falha de audit NÃO bloqueia publicação (resiliência > auditoria em runtime;
auditoria em si é registrada por serviço externo — Sentry/Datadog).

---

## 14. Limitações conhecidas

1. **In-memory state** — `rate-limit`, `trending` usam Map em memória.
   Restart do servidor = reset. Em produção, migrar para Redis sorted sets.

2. **Perspective API ausente** — usamos lexicon próprio para toxicidade.
   Trade-off: zero custo + LGPD-friendly, mas perde nuances de ironia/sarcasmo.

3. **Auto-mod sem visão computacional** — `image-mod` opera em metadata
   (filename, URL). Cloudflare Images moderation (já integrado em W34)
   complementa em produção.

4. **Tradução automática ausente** — `language-detect` recomenda tradução
   mas não a executa. Integração com DeepL/OpenAI fica para Wave 38+.

5. **Cross-tradition consistency** — `findSacredMercantilism` pode dar falso
   positivo em posts históricos/educacionais. Pipeline manda para curador
   humano (não bloqueia automaticamente).

---

## 15. Roadmap W37+

- [ ] DeepL integration para tradução real (não só recomendação)
- [ ] Cloudflare Images moderation hook (provider já integrado W34)
- [ ] Per-tenant thresholds (W38: cada curador Iyá pode ajustar Stage 4)
- [ ] ML toxicity model local (modelo treinado em PT-BR com tradição)
- [ ] Appeals workflow completo (link `/admin/moderation/[id]/appeal`)
- [ ] Bulk import de banned keywords (CSV via admin)
- [ ] Período de carência para novos usuários (7 dias sem Stage 5 burst)
- [ ] A/B test framework para limiares de decisão
- [ ] Sentry integration para falhas de audit
- [ ] Slack/email notifications para mods (reviewer assignment)

---

## 16. Referências

- **LGPD** — Lei 13.709/2018, Art. 7 (consentimento), Art. 18 (direitos do titular),
  Art. 37 (relatório de impacto).
- **Akasha Safety W36-2** — 8 guardrails éticos (precedente do pipeline).
- **Akasha Quality Gate W29-8** — `validateArticle` com 775 lines + 12 tradições
  (referência para Stage 4 sacred check).
- **Cultura de tradição** — `docs/CULTURAL-SENSITIVITY-W29.md` — cuidado
  por tradição.
- **W20 Moderation Queue** — `/admin/moderation` original (precedente).
- **W34 Security** — Cloudflare/AWS integrations já configuradas.

---

## 17. Métricas de sucesso (Wave 36)

- **Cobertura auto-mod**: ≥ 70% das flags resolvidas sem intervenção humana.
- **Falsos positivos**: ≤ 5% (medido via appeal rate).
- **Latência do pipeline**: P95 < 50ms por check.
- **SLA P50**: < 6h (humano) para casos que vão para fila.
- **SLA P95**: < 24h (humano) para casos complexos.
- **LGPD compliance**: 0 incidentes de exposição PII no relatório público.

---

## 18. Mudanças desde W20 → W36

| Aspecto | W20 | W36 |
|---------|-----|-----|
| Estágios | 1 (manual) | 5 (auto) |
| Categorias de report | 4 | 7 |
| Multi-language | não | 5 idiomas + mix |
| Image moderation | não | NSFW + copyright + EXIF + symbols |
| Trending detection | não | 4 tipos de anomalia |
| Transparency report | não | mensal público + LGPD-safe |
| Bulk actions | não | 5 decisões em lote |
| SLA tracking | não | histogram + alerts |

---

## 19. Glossário

- **Auto-mod** — Automated moderation. Pipeline que decide ação sem humano.
- **Cross-posting** — Mesmo conteúdo duplicado por múltiplos autores.
- **Cultural sensitivity** — Princípio Akasha: tradição é respeitada,
  mercantilização não.
- **EXIF stripping** — Remoção de metadados de imagem (geolocalização
  principal risco LGPD).
- **Hard veto** — Decisão automática que ignora o agregado (ex: hate).
- **Mercantilização** — Uso comercial de termo sagrado (anti-universalismo).
- **P95 SLA** — 95% das ações completadas dentro do tempo-alvo.
- **Universalismo** — Princípio Akasha de não-julgar tradições religiosas.

---

## 20. Contatos

- **Iyá (Curador-mor)** — revisão cultural + Stage 4 sacred check.
- **Caio (Security)** — copyright + NSFW + EXIF + Stage 2 toxicidade.
- **Moderadores community-team** — spam + assédio + Stage 1/3.
- **Coder** — manutenção do pipeline + thresholds.

---

## 21. Changelog

### 2026-07-01 — Wave 36 initial release

- Adicionado: 5-stage auto-mod pipeline
- Adicionado: banned-content catalog (200+ keywords, 10+ regex)
- Adicionado: language-detect (5 idiomas, mix-language)
- Adicionado: image-mod (NSFW, copyright, EXIF, 33+ symbols)
- Adicionado: trending + 4 anomaly detectors
- Adicionado: 5 API endpoints (`/api/moderation/*`, `/api/report`,
  `/api/transparency/moderation`)
- Adicionado: páginas admin (queue, report, transparency)
- Adicionado: ReportForm client component (7 categorias W36)
- Adicionado: ModerationQueueAdvanced (filtros, bulk, SLA)
- Schema: reuso de FlagReason legado + discriminator via metadata

---

**Status: ✅ Pronto para Wave 37.**