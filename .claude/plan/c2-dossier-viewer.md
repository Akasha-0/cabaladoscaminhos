# Plano C.2 — DossierViewer (SSE streaming) · Plano executável

> **Tipo:** Plano focado e executável. **Pré-requisito:** C.5+C.1+C.4 já commitados (branch `claude/docs-refactor-alignment-FOUqN`).
> **Achados críticos desta sessão (que simplificam o plano):**
> 1. **`createSSEStream` helper já existe** em `src/lib/sse.ts` (com heartbeat de 30s). Reutilizar.
> 2. **`/api/mesa-real/generate` já tem toda a lógica** de chamar `buildHousePayload` + LLM + persistir em `Report.content`. O SSE é só um wrapper que faz isso em loop 36×.
> 3. **`buildHousePayload(house, entry, client)`** está pronto, com `ClientMaps` que aceita o JSON do Prisma.
> 4. **`react-markdown` NÃO instalado** — precisa `pnpm add react-markdown remark-gfm` antes.

---

## 0. TL;DR — 5 entregáveis, 1 ciclo (1-1.5d)

| # | Arquivo | Operação | Linhas aprox |
|---|---|---|---|
| 1 | `package.json` | `pnpm add react-markdown remark-gfm` | — |
| 2 | `src/app/api/mesa-real/dossier/[id]/route.ts` | **CRIAR** (SSE) | ~120 |
| 3 | `src/app/cockpit/leituras/[id]/page.tsx` | **CRIAR** (Server Component) | ~30 |
| 4 | `src/components/cockpit/dossier/DossierViewer.tsx` | **CRIAR** (Client) | ~140 |
| 5 | `src/components/cockpit/dossier/DossierIndex.tsx` | **CRIAR** (sticky) | ~70 |
| 6 | `src/components/cockpit/dossier/LoadingOrbital.tsx` | **CRIAR** | ~50 |

**Total:** 1-1.5d. TypeScript estrito, sem nova dependência de UI (reutiliza `card`, `button`, `separator` existentes).

---

## 1. Setup de Dependência

```bash
cd /home/skynet/cabala-dos-caminhos
pnpm add react-markdown remark-gfm
# (rehype-raw NÃO necessário por enquanto — Doc 06 não usa HTML cru nos dossies)
```

**Verificação:** `grep -E "react-markdown|remark" package.json` → 2 entradas.

---

## 2. SSE Endpoint — `src/app/api/mesa-real/dossier/[id]/route.ts`

### 2.1 Comportamento

`GET /api/mesa-real/dossier/[id]` → `Content-Type: text/event-stream` com 4 tipos de evento:

| Evento | Payload | Quando |
|---|---|---|
| `progress` | `{ casa: number, total: 36 }` | Antes de cada chamada LLM |
| `house` | `{ casa: number, houseName: string, dossie: string, generatedAt: string, cached?: boolean }` | Depois que a casa é gerada |
| `error` | `{ casa: number, message: string }` | Se a chamada LLM falhar (casa específica) |
| `done` | `{ ok: true, total: 36, errors: N, elapsed: number }` | Quando todas as 36 casas terminam |

### 2.2 Pseudo-código

```ts
// src/app/api/mesa-real/dossier/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';
import { buildHousePayload, buildSystemPrompt, type ClientMaps } from '@/lib/ai/dossier/oracle-prompt-builder';
import { createSSEStream } from '@/lib/sse';

type MatrixEntry = { carta: number; cartaName?: string; odu: number; oduName?: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1) Auth
  const op = await requireOperator(request);
  if (op instanceof NextResponse) return op;
  const { id: readingId } = await params;

  // 2) Carrega reading + client + report
  const reading = await prisma.reading.findUnique({
    where: { id: readingId },
    include: { client: true, report: true },
  });
  if (!reading) return new Response('Not found', { status: 404 });
  if (reading.operatorId !== op.id) return new Response('Forbidden', { status: 403 });

  const matrixData = reading.matrixData as Record<string, MatrixEntry | null | undefined>;
  const existingReport = (reading.report?.content as { houses?: Record<string, unknown> } | null) ?? null;

  // 3) Setup SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const { send, close } = createSSEStream(controller, encoder);
      const startMs = Date.now();
      let errors = 0;

      const clientMaps: ClientMaps = {
        fullName: reading.client.fullName,
        birthDate: reading.client.birthDate,
        birthCity: reading.client.birthCity ?? undefined,
        birthCountry: reading.client.birthCountry ?? undefined,
        astrologyMap: reading.client.astrologyMap as Record<string, unknown> | null,
        kabalisticMap: reading.client.kabalisticMap as Record<string, unknown> | null,
        tantricMap: reading.client.tantricMap as Record<string, unknown> | null,
        oduBirth: reading.client.oduBirth as Record<string, unknown> | null,
      };

      const systemPrompt = buildSystemPrompt();
      const apiKey = process.env.OPENAI_API_KEY;
      const llmModel = process.env.OPENAI_MODEL ?? 'gpt-4o';

      // Persistência cumulativa (igual ao /generate)
      let cumContent: Record<string, unknown> = {
        ...(existingReport?.houses ? { houses: { ...existingReport.houses } } : {}),
      };

      for (let casa = 1; casa <= 36; casa++) {
        const entry = matrixData[String(casa)] ?? matrixData[casa];
        send({ event: 'progress', data: { casa, total: 36 } });

        if (!entry || !entry.carta || !entry.odu) {
          continue; // casa vazia — pula
        }

        // Idempotência: pula casas já geradas
        if (existingReport?.houses?.[String(casa)]) {
          const cached = existingReport.houses[String(casa)] as { interpretation: string; generatedAt?: string };
          send({
            event: 'house',
            data: {
              casa,
              houseName: `Casa ${casa}`,
              dossie: cached.interpretation,
              generatedAt: cached.generatedAt ?? new Date().toISOString(),
              cached: true,
            },
          });
          continue;
        }

        try {
          const userPayload = buildHousePayload(casa, entry as MatrixEntry, clientMaps);
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: llmModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(userPayload) },
              ],
              temperature: 0.7,
            }),
          });
          if (!res.ok) throw new Error(`LLM ${res.status}: ${await res.text()}`);
          const llmData = await res.json();
          const dossie = llmData.choices?.[0]?.message?.content ?? '';
          const tokensUsed = llmData.usage?.total_tokens ?? null;
          const generatedAt = new Date().toISOString();

          cumContent = {
            ...cumContent,
            houses: {
              ...(cumContent.houses as Record<string, unknown> | undefined),
              [String(casa)]: { interpretation: dossie, generatedAt, tokensUsed },
            },
          };
          await prisma.report.upsert({
            where: { readingId },
            create: { readingId, content: cumContent as object, llmModel, tokensUsed: tokensUsed ?? undefined },
            update: { content: cumContent as object, llmModel },
          });

          send({ event: 'house', data: { casa, houseName: `Casa ${casa}`, dossie, generatedAt } });
        } catch (err) {
          errors++;
          send({ event: 'error', data: { casa, message: err instanceof Error ? err.message : 'erro' } });
        }
      }

      send({ event: 'done', data: { ok: true, total: 36, errors, elapsed: Date.now() - startMs } });
      close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
```

### 2.3 Critérios de aceitação do endpoint

- [ ] Auth via `requireOperator` (rejeita 401/403)
- [ ] Stream começa em < 2s
- [ ] Cada casa válida recebe 1 `progress` + 1 `house` (ou 1 `error`)
- [ ] Casas vazias (sem carta+Odu) são puladas silenciosamente
- [ ] Reload da página retoma do ponto (idempotência via `existingReport.houses`)
- [ ] Após `done`, o `Report.content.houses` tem todas as casas geradas persistidas
- [ ] Headers de SSE: `text/event-stream`, `no-cache`, `keep-alive`

---

## 3. Server Component — `src/app/cockpit/leituras/[id]/page.tsx`

```tsx
// Server Component: auth + carrega reading mínimo + renderiza DossierViewer
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { prisma } from '@/lib/prisma';
import { DossierViewer } from '@/components/cockpit/dossier/DossierViewer';

export const dynamic = 'force-dynamic';

export default async function LeituraPage({ params }: { params: Promise<{ id: string }> }) {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');
  const { id } = await params;

  const reading = await prisma.reading.findUnique({
    where: { id },
    include: { client: { select: { fullName: true } } },
  });
  if (!reading || reading.operatorId !== operator.id) notFound();

  return (
    <div className="ramiro flex flex-col h-screen">
      <header className="flex items-center justify-between px-6 py-3 border-b border-border/50 bg-background/50">
        <div className="flex items-center gap-3">
          <Link href="/cockpit/dashboard" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" /> Voltar
          </Link>
          <div>
            <h1 className="font-cinzel text-lg text-primary">Dossiê Cabalístico</h1>
            <p className="text-xs text-muted-foreground">
              {reading.client.fullName} · {new Date(reading.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </header>
      <DossierViewer readingId={reading.id} />
    </div>
  );
}
```

---

## 4. DossierViewer (Client) — `src/components/cockpit/dossier/DossierViewer.tsx`

### 4.1 Comportamento

- Conecta `EventSource('/api/mesa-real/dossier/' + readingId)` ao montar
- Acumula `markdown: Record<number, { houseName, dossie, generatedAt }>`
- Mostra `<DossierIndex />` (sticky) + `<LoadingOrbital />` enquanto processa
- Layout 2 painéis: índice à esquerda (sticky), conteúdo à direita (scroll)
- Renderiza cada casa com `react-markdown` (Lora, h2 laranja, em royal)

### 4.2 Pseudo-código

```tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DossierIndex } from './DossierIndex';
import { LoadingOrbital } from './LoadingOrbital';
import { cn } from '@/lib/utils';

interface CasaData { houseName: string; dossie: string; generatedAt: string; cached?: boolean }

export function DossierViewer({ readingId }: { readingId: string }) {
  const [houses, setHouses] = useState<Record<number, CasaData>>({});
  const [progress, setProgress] = useState({ current: 0, total: 36 });
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<number[]>([]);
  const [activeCasa, setActiveCasa] = useState<number | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const es = new EventSource(`/api/mesa-real/dossier/${readingId}`);

    es.addEventListener('progress', (e) => {
      const { casa, total } = JSON.parse((e as MessageEvent).data);
      setProgress({ current: casa, total });
    });
    es.addEventListener('house', (e) => {
      const data = JSON.parse((e as MessageEvent).data);
      setHouses((h) => ({ ...h, [data.casa]: data }));
      setProgress((p) => ({ current: Math.max(p.current, data.casa), total: p.total }));
    });
    es.addEventListener('error', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data);
        setErrors((arr) => [...arr, data.casa]);
      } catch { /* heartbeat — ignorar */ }
    });
    es.addEventListener('done', () => {
      setDone(true);
      es.close();
    });

    es.onerror = () => {
      setDone(true);
      es.close();
    };

    return () => es.close();
  }, [readingId]);

  const casaNumbers = Object.keys(houses).map(Number).sort((a, b) => a - b);

  return (
    <div className="flex flex-1 min-h-0">
      <DossierIndex
        casas={casaNumbers}
        activeCasa={activeCasa}
        onSelect={(c) => {
          setActiveCasa(c);
          document.getElementById(`casa-${c}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
        progress={progress}
        errors={errors}
      />

      <div ref={articleRef} className="flex-1 overflow-y-auto p-8">
        {!done && <LoadingOrbital progress={progress} errors={errors} />}

        {done && casaNumbers.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            Nenhuma casa foi gerada. Verifique se a mesa tem cartas+Odu preenchidos.
          </div>
        )}

        <article className="dossier font-dossier max-w-[720px] mx-auto text-foreground/90 leading-[1.8] text-[15px]">
          {casaNumbers.map((casa) => {
            const h = houses[casa];
            return (
              <section
                key={casa}
                id={`casa-${casa}`}
                className={cn('mt-9 pb-4 border-b border-border scroll-mt-20', activeCasa === casa && 'border-primary/50')}
              >
                <h2 className="font-cinzel text-primary text-lg">
                  Casa {casa} — {h.houseName}
                </h2>
                <p className="text-xs text-muted-foreground/60 font-mono mb-3">
                  {new Date(h.generatedAt).toLocaleString('pt-BR')} {h.cached && '· (cache)'}
                </p>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{h.dossie}</ReactMarkdown>
              </section>
            );
          })}
        </article>
      </div>
    </div>
  );
}
```

### 4.3 CSS do Markdown (estilo Ramiro, Doc 13 §6.2)

Adicionar em `src/app/globals.css` (dentro do escopo `.ramiro`):

```css
.ramiro .dossier h2 {
  @apply font-cinzel text-primary text-lg border-b border-border pb-2 mt-9;
}
.ramiro .dossier em {
  @apply text-secondary not-italic text-xs font-medium;
}
.ramiro .dossier blockquote {
  @apply border-l-2 border-secondary pl-4 italic text-muted-foreground my-4;
}
.ramiro .dossier p { @apply mb-4; }
.ramiro .dossier strong { @apply text-foreground; }
.ramiro .dossier ul { @apply list-disc list-inside mb-4; }
.ramiro .dossier ol { @apply list-decimal list-inside mb-4; }
.ramiro .dossier code { @apply font-mono text-xs bg-muted/50 px-1.5 py-0.5 rounded; }
```

### 4.4 Critérios de aceitação

- [ ] SSE conecta em < 2s
- [ ] Cada casa aparece progressivamente
- [ ] `h2` em Cinzel laranja; `em` em royal; `blockquote` com border-l royal
- [ ] `DossierIndex` mostra 36 casas com check/pendente
- [ ] Click no índice faz scroll suave até a casa
- [ ] Erro em uma casa não aborta o stream (continue + emit `error` event)
- [ ] Reload retoma do ponto (idempotência)

---

## 5. DossierIndex — `src/components/cockpit/dossier/DossierIndex.tsx`

```tsx
'use client';

import { Check, AlertCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DossierIndexProps {
  casas: number[];
  activeCasa: number | null;
  onSelect: (casa: number) => void;
  progress: { current: number; total: number };
  errors: number[];
}

const HOUSE_NAMES: Record<number, string> = {
  1: 'O Cavaleiro', 2: 'O Trevo', 3: 'O Navio', 4: 'A Casa', 5: 'A Árvore',
  6: 'As Nuvens', 7: 'A Serpente', 8: 'O Caixão', 9: 'Os Buquês', 10: 'A Foice',
  11: 'O Chicote', 12: 'Os Pássaros', 13: 'A Criança', 14: 'A Raposa', 15: 'O Urso',
  16: 'A Estrela', 17: 'A Cegonha', 18: 'O Cachorro', 19: 'A Torre', 20: 'O Jardim',
  21: 'A Montanha', 22: 'Os Caminhos', 23: 'O Rato', 24: 'O Coração', 25: 'O Anel',
  26: 'O Livro', 27: 'A Carta', 28: 'O Cigano', 29: 'A Cigana', 30: 'Os Lírios',
  31: 'O Sol', 32: 'A Lua', 33: 'A Chave', 34: 'Os Peixes', 35: 'A Âncora', 36: 'A Cruz',
};

export function DossierIndex({ casas, activeCasa, onSelect, progress, errors }: DossierIndexProps) {
  const generated = new Set(casas);
  const errored = new Set(errors);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border/50 bg-card/30 overflow-y-auto p-3">
      <div className="mb-3 px-2">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/70">Progresso</p>
        <p className="font-mono text-sm text-primary">{progress.current}/{progress.total}</p>
      </div>
      <nav className="space-y-0.5">
        {Array.from({ length: 36 }, (_, i) => i + 1).map((casa) => {
          const isGenerated = generated.has(casa);
          const isErrored = errored.has(casa);
          const isActive = activeCasa === casa;
          return (
            <button
              key={casa}
              onClick={() => isGenerated && onSelect(casa)}
              disabled={!isGenerated}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-colors',
                isActive && 'bg-secondary/15 text-primary border-l-2 border-primary',
                !isActive && isGenerated && 'hover:bg-muted text-foreground/80',
                !isGenerated && !isActive && 'text-muted-foreground/40 cursor-default'
              )}
            >
              {isErrored ? (
                <AlertCircle className="w-3 h-3 text-destructive flex-shrink-0" />
              ) : isGenerated ? (
                <Check className="w-3 h-3 text-primary flex-shrink-0" />
              ) : (
                <Circle className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
              )}
              <span className="font-mono w-5">{String(casa).padStart(2, '0')}</span>
              <span className="truncate">{HOUSE_NAMES[casa]}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
```

---

## 6. LoadingOrbital — `src/components/cockpit/dossier/LoadingOrbital.tsx`

Loader laranja com progresso "X/36" + lista de casas com erro. Visual simples (sem Framer Motion para evitar dep).

```tsx
'use client';

import { Sparkles } from 'lucide-react';

export function LoadingOrbital({ progress, errors }: { progress: { current: number; total: number }; errors: number[] }) {
  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  return (
    <div className="sticky top-0 z-10 mb-6 p-4 rounded-lg bg-card/80 border border-border/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative w-8 h-8">
          <Sparkles className="w-8 h-8 text-primary animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground/90">
            Cruzando os mapas das 36 casas…
          </p>
          <p className="text-xs text-muted-foreground">
            {progress.current} de {progress.total} casas processadas
            {errors.length > 0 && (
              <span className="text-destructive ml-2">· {errors.length} com erro</span>
            )}
          </p>
        </div>
        <div className="font-mono text-sm text-primary">{pct}%</div>
      </div>
      <div className="h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
```

---

## 7. Resumo de Verificação

| Etapa | Comando/ação | Esperado |
|---|---|---|
| **1. Install** | `pnpm add react-markdown remark-gfm` | 2 deps em `package.json` |
| **2. Type check** | `npx tsc --noEmit` | 0 erros |
| **3. Endpoint smoke** | `curl -N -b "cockpit_session=..." http://localhost:3000/api/mesa-real/dossier/<id>` | Stream SSE com eventos `progress` + `house` |
| **4. UI smoke** | Abrir `/cockpit/leituras/<id>` no browser | Loader + índice sticky + 2 painéis |
| **5. Idempotência** | Reload mid-stream | Retoma sem refazer casas já geradas |
| **6. Erro graceful** | Desconectar OpenAI mid-stream | `error` events + `done` final com `errors > 0` |

---

## 8. Riscos & Mitigações

| Risco | Mitigação |
|---|---|
| SSE desconecta no Vercel (timeout 30s em serverless) | `createSSEStream` já tem heartbeat de 30s ✅; Idempotência permite retomar |
| LLM demora > 5min para 36 casas | 36 chamadas sequenciais podem levar 3-6min; mostrar progresso claro; timeout cliente 10min |
| `react-markdown` v9 quebra Next 16 / Turbopack | Verificar compat na install; se quebrar, fallback `marked` + `dompurify` |
| OpenAI rate limit durante loop | Try/catch com backoff simples; exibir erro na casa + continuar |
| `Report.content` cresce demais | Cada `house` tem ~2-5KB; 36 × 4KB = ~150KB — OK para JSON no Postgres |

---

## 9. Dependências externas

- `react-markdown` (instalar)
- `remark-gfm` (instalar)
- Nenhuma outra.

---

## 10. Próximos passos

Após C.2 entregue:
- **C.3 (Q&A Chat UI)**: reusa mesmo padrão SSE + `createSSEStream`; refatorar `/api/consult` para emitir `routing` + `token` + `done`. Plano análogo pode ser gerado depois.
- **Onda D (Polish)**: micro-interações, responsividade (lista accordion no `sm`).

---

*Plano gerado em 2026-06-02 a partir do estado pós C.5+C.1+C.4 (commit Fase 14b + commit atual), `src/lib/sse.ts` (createSSEStream), `src/lib/ai/dossier/oracle-prompt-builder.ts` (buildHousePayload), `/api/mesa-real/generate/route.ts` (referência), `prisma/schema.prisma` (Report.content).*
