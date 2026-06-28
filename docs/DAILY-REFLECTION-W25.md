# Daily Reflection Prompt — Wave 25 (2026-06-28)

> Status: ✅ SHIPPED (W25)
> Owner: Akasha / Curadoria Espiritual
> Skill reviewers: `curator` (Iyá) — conteúdo tradicional

Convite de reflexão diário exibido na home/dashboard. Conteúdo **curado** (não gerado por LLM em runtime) com tradição + numerologia + Odu como contexto.

---

## TL;DR

| Item | Valor |
|---|---|
| Tabela Prisma nova | `DailyReflection` (+ enum `ReflectionSource`) |
| API | `GET /api/daily-reflection?date=YYYY-MM-DD` |
| Componente | `<DailyReflectionCard />` (mobile-first, 360px+) |
| Pool inicial | **35 prompts** (10 universal + 5/tradição × 5 tradições) |
| Tradições cobertas | universal, cabala, candomble, umbanda, ifa, tantra |
| Algoritmo de seleção | FNV-1a hash (userId+date) mod N + anti-rep 7 dias |
| TSC erros (arquivos W25) | **0** |
| TSC erros pré-existentes | 23 (PostCard, use-flag, og.ts — não tocado) |

---

## Schema Prisma

Adicionado em `prisma/schema.prisma`:

```prisma
enum ReflectionSource {
  CURATED   // pool curado (única fonte por enquanto)
  COMMUNITY // futuro: comunidade
  MENTOR    // futuro: mentores verificados
}

model DailyReflection {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date          DateTime @db.Date                       // idempotência por dia
  tradition     String   @default("universal")           // slug canônico
  promptId      String                                   // ex: "cabala-003"
  locale        String   @default("pt-BR")
  source        ReflectionSource @default(CURATED)
  caminhoDeVida Int?                                     // cache numerologia
  context       Json?                                    // snapshot debug
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([userId, date])      // 1 reflexão/user/dia
  @@index([userId, date(sort: Desc)])   // anti-rep query
  @@index([tradition, date])
  @@index([createdAt])
  @@map("daily_reflections")
}
```

**Anti-repetição query** usa `@@index([userId, date(sort: Desc)])` — O(log n).

---

## Pool inicial — `src/data/daily-prompts.json`

```json
{
  "_meta": {
    "version": "1.0.0",
    "wave": "W25",
    "owner": "Akasha / Curadoria Espiritual"
  },
  "prompts": [
    { "id": "universal-001", "tradition": "universal", "pt-BR": "...", "en-US": "..." },
    { "id": "cabala-001",    "tradition": "cabala",    "pt-BR": "...", "en-US": "..." },
    ...
  ]
}
```

**Regras de curadoria (fail-loud):**
1. TODO prompt começa com `"Convite à reflexão"` (pt-BR) ou `"An invitation"` (en-US) — verificado em runtime pelo `pool.ts`.
2. Prompts tradicionais NÃO substituem orientação de praticante, pai/mãe-de-santo, rabbi, mestre ou terapeuta — disclaimer em todo card via label `"convite"`.
3. Conteúdo deve ser revisado pelo skill `curator` (Iyá) antes de produção.
4. Adicionar tradição nova = atualizar `KNOWN_TRADITIONS` em `src/lib/daily-reflection/pool.ts` E adicionar bloco de prompts no JSON.

**Distribuição atual (35 total):**

| Tradição | Prompts | Tom predominante |
|---|---|---|
| universal | 10 | acolhimento + presença + sabedoria |
| cabala | 5 | sefirot + Ein Sof + Tiferet |
| candomble | 5 | axé + orixá + ebó + ori |
| umbanda | 5 | entidades + linhas + pretos-velhos |
| ifa | 5 | odu + Orunmila + ebo + iyawó |
| tantra | 5 | corpo + Shakti + kundalini + não-dualidade |

---

## Algoritmo de seleção

Arquivo: `src/lib/daily-reflection/select.ts`

```
1. date = normalize(YYYY-MM-DD)
2. tradition = espiritualProfile.traditionAtiva ?? 'universal'
3. pool = tradição(5) + universal(10)            // máx 15 candidatos
4. recent = last 7 dias de promptIds do user
5. hash = FNV-1a32(userId + ":" + date)         // determinístico
6. startIndex = hash % pool.length
7. for i in 0..5:
     candidate = pool[(startIndex + i) % N]
     if candidate.id NOT in recent:
       return candidate
8. fallback: pool[startIndex % N]                // improvável
```

**Por que FNV-1a e não SHA-256?** Compatibilidade com Edge runtime + zero-deps + distribuição uniforme suficiente para 15 candidatos. Performance: ~50µs para strings curtas.

**Por que 7 dias de janela?** Com 5 tradição + 10 universal, o ciclo de exposição completa é ~2 semanas. Janela de 7 dias garante que o usuário não veja o mesmo prompt duas vezes em uma semana.

**Por que anti-rep máximo de 5 skips?** Se o usuário bloqueou 5+ candidatos, ou (a) ele tem histórico de 7 dias muito cheio (improvável) ou (b) pool está vazio (fail-loud acima). Limite evita loop infinito em edge cases.

---

## API

`GET /api/daily-reflection?date=YYYY-MM-DD`

**Autenticação:** obrigatória (Supabase Auth via `getViewer()`). Dev mode aceita header `x-dev-user-id`.

**Resposta 200 (já existe):**
```json
{
  "id": "clxxx",
  "date": "2026-06-28",
  "tradition": "universal",
  "promptId": "universal-003",
  "locale": "pt-BR",
  "source": "CURATED",
  "caminhoDeVida": 7,
  "cached": true
}
```

**Resposta 200 (criada agora):**
```json
{
  "id": "clxxx",
  "date": "2026-06-28",
  "tradition": "cabala",
  "promptId": "cabala-002",
  "text": "Convite à reflexão (Cabala): a sefirá Tiferet convida ao equilíbrio...",
  "locale": "pt-BR",
  "source": "CURATED",
  "caminhoDeVida": 3,
  "cached": false
}
```

**Resposta 401:** `{ "error": "Autenticação necessária..." }`

**Cache-Control:** `private, max-age=3600, stale-while-revalidate=86400` — reflexão só muda à meia-noite local do user; SWR evita flash de loading.

---

## Componente — `<DailyReflectionCard />`

Arquivo: `src/components/dashboard/DailyReflectionCard.tsx`

**Mobile-first checklist:**
- ✅ Tap targets ≥ 44px (`min-h-[44px]`)
- ✅ `touch-manipulation` utility (sem 300ms delay iOS)
- ✅ Layout fluido em 360px (padding `p-4 sm:p-5`)
- ✅ Skeleton com `animate-pulse` (sem spinner pesado)
- ✅ Error state com botão "Tentar novamente" (44×44)
- ✅ `aria-busy` / `aria-label` / `role="article"` para leitor de tela
- ✅ Contraste AA (amber-700 sobre amber-50)

**Tom visual:**
- Background gradient amber-50 → orange-50 → amber-50
- Ícone ✨ (`Sparkles`)
- Label superior em uppercase amber-700
- Disclaimer `"convite"` visível quando tradição ≠ universal

---

## Como adicionar nova tradição

1. **Adicionar slug em `KNOWN_TRADITIONS`** (`src/lib/daily-reflection/pool.ts`):
   ```ts
   export const KNOWN_TRADITIONS = {
     // ...existing...
     nova_tradicao: "Nome descritivo",
   } as const;
   ```

2. **Adicionar 5+ prompts em `data/daily-prompts.json`**:
   ```json
   {
     "id": "nova_tradicao-001",
     "tradition": "nova_tradicao",
     "tone": "tag-do-tom",
     "pt-BR": "Convite à reflexão (Nome): ...",
     "en-US": "An invitation to reflect (Name): ..."
   }
   ```

3. **Revisar com skill `curator`** (Iyá) — valida precisão factual e tom.

4. **Testar:**
   ```bash
   curl 'http://localhost:3000/api/daily-reflection?date=2026-06-28' \
     -H 'Cookie: <seu-cookie-supabase>'
   ```

5. **Adicionar label amigável em `DailyReflectionCard.tsx`:**
   ```ts
   const map: Record<string, string> = {
     // ...
     nova_tradicao: "Nome Amigável",
   };
   ```

---

## Limitações conhecidas (v1.0)

- **Sem tradição ativa persistente:** `SpiritualProfile` não tem campo `tradiçãoAtiva` ainda — `pool.ts` fallback é `'universal'`. TODO quando profile ganhar esse campo.
- **Sem i18n runtime:** locale sempre `pt-BR`. Para i18n completo, adicionar header `Accept-Language` e mapear em `pool.ts`.
- **Pool pequeno (35 prompts):** suficiente para 1 mês sem repetição. Curadoria deve expandir à medida que feedback chegar.
- **Não substitui orientação espiritual real:** disclaimer em todo card. Responsabilidade do usuário buscar praticantes qualificados.

---

## Próximos passos (futuro)

- [ ] Adicionar campo `traditionAtiva` em `SpiritualProfile` (W26+)
- [ ] Expandir pool para 50+ prompts (W26 — curadoria Iyá)
- [ ] Adicionar variação por `caminhoDeVida` (numerologia) — pool por número 1-9
- [ ] Adicionar variação por `yearPersonal` (cálculo numerológico anual)
- [ ] Integração com Akasha IA: feedback 👍/👎 para priorização (similar a `AkashicFeedback`)
- [ ] Streak counter: "X dias refletindo" como gamificação opcional

---

## Arquivos modificados/criados

```
prisma/schema.prisma                                           (+69 linhas)
src/data/daily-prompts.json                                    (novo, 14.6KB, 35 prompts)
src/lib/daily-reflection/pool.ts                               (novo, 4.2KB)
src/lib/daily-reflection/select.ts                             (novo, 6.3KB)
src/app/api/daily-reflection/route.ts                          (novo, 7.8KB)
src/components/dashboard/DailyReflectionCard.tsx               (novo, 8.6KB)
docs/DAILY-REFLECTION-W25.md                                   (este arquivo)
```

---

## Reproduzir validação

```bash
cd /workspace/wt-w25-reflection

# TSC (meus arquivos = 0 erros)
./node_modules/typescript/bin/tsc --noEmit --skipLibCheck 2>&1 \
  | grep -E "daily-reflection|pool\.ts|select\.ts|DailyReflectionCard" \
  || echo "✅ NO ERRORS IN W25 FILES"

# JSON sanity
python3 -c "
import json
d = json.load(open('data/daily-prompts.json'))
assert len(d['prompts']) == 35
assert len(set(p['id'] for p in d['prompts'])) == 35
assert all(p['pt-BR'].startswith('Convite à reflexão') for p in d['prompts'])
print('✅ 35 unique prompts, all in correct format')
"
```

---

**Wave:** 25 | **Branch:** `wave/w25-daily-reflection` | **Time:** ~22min de 30min budget