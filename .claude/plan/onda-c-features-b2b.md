# Plano Onda C — Features B2B (5 entregáveis)

> **Tipo:** Plano de implementação. **Data:** 2026-06-02. **Branch:** `claude/docs-refactor-alignment-FOUqN`.
> **Pré-requisito:** Ondas 0+A+B já commitadas em `9b9b5999` (Fase 14b) — cockpit alinhado a Ramiro v2, docs reconciliados.
> **Análise:** Doc 16 já mapeou prioridades (AD-06, AD-11, AD-12). Wrapper multi-modelo indisponível — síntese direta a partir de Doc 16 + Doc 05 §3-§9 + Doc 12 + Doc 13 + estado real das APIs.

---

## 0. TL;DR — 5 entregáveis, 3-4 dias

| # | Entregável | Rota | Esforço | Risco | Pré-requisito |
|---|---|---|---|---|---|
| **C.5** | **Navegação B2B única** (4 itens) | `app/cockpit/layout.tsx` | 0.5d | 🟢 Baixo | nenhum — fazer PRIMEIRO para fixar nav |
| **C.1** | **Dashboard B2B** (métricas Prisma) | `app/cockpit/dashboard/page.tsx` | 0.75d | 🟡 Médio | C.5 (nav) |
| **C.4** | **ClientForm** (cadastro com 3 grupos) | `app/cockpit/consulentes/novo/page.tsx` | 0.75d | 🟡 Médio | C.5 (nav) |
| **C.2** | **DossierViewer** (streaming SSE) | `app/cockpit/leituras/[id]/page.tsx` | 1.25d | 🔴 Alto | C.1 (precisa listar leituras); refactor generate→SSE |
| **C.3** | **Q&A Chat UI** (streaming) | `app/cockpit/leituras/[id]/consulta/page.tsx` | 0.75d | 🔴 Alto | C.2; refactor consult→SSE |

**Ordem de execução recomendada:** C.5 → C.1 → C.4 → C.2 → C.3.

---

## 1. Estado Atual (verificado nesta sessão)

| Item | Estado | Implicação para a Onda |
|---|---|---|
| `/api/mesa-real/generate` | **JSON** (per-house, recebe `casaNumero`) | C.2 precisa refactor → SSE ou criar novo endpoint "full dossier" |
| `/api/consult` | **JSON** (resposta única) | C.3 precisa refactor → SSE |
| `/api/mesa-real/save` | ✅ Existe, `requireOperator`, cria `Reading` PENDING | C.1 + C.2 reusam para listar/criar |
| `/api/mesa-real/readings` | ✅ Existe, `createReading`, `getReadingsByClient`, `getReadingsByUser` | C.1 consome; **drift**: schema aceita `userId` (não `operatorId`) — corrigir para AD-03 |
| `/api/mesa-real/clients` | ✅ Existe, `requireOperator` (hardened) | C.4 consome/POST |
| `react-markdown` | ❌ **NÃO instalado** | C.2 precisa `pnpm add react-markdown remark-gfm rehype-raw` |
| `Tabs` (shadcn) | ✅ `@base-ui/react/tabs` | C.2 usa para "Dossiê | Consulta" |
| `Button variant="spiritual"` | ✅ Existe em `ui/spiritual-button.tsx` | Reusar em C.1, C.4 |
| `cockpit` route group | ✅ Existe `/cockpit` + `/cockpit/login` | C.1-C.5 adicionam sub-rotas |
| `middleware.ts` | ✅ Quarentena B2C + auth gate via `getOperatorFromServerContext` | Reusar em todos |
| `CockpitSidebar` (já Ramiro) | ✅ Migrado Onda B | C.5 evolui para `B2BNav` |
| `requireOperator` (helper) | ✅ `src/lib/auth/operator-session.ts` | Reusar em todas as Server Actions/páginas |

---

## 2. C.5 — Navegação B2B Única (Doc 05 §2 / Doc 16 AD-11) 🟢

**Objetivo:** sidebar de navegação canônica com 4 itens: Nova Consulta · Consulentes · Dashboard · Leituras.

### 2.1 Arquivos

| Arquivo | Operação |
|---|---|
| `src/components/cockpit/navigation/B2BNav.tsx` | **CRIAR** (substitui `CockpitSidebar` como nav principal) |
| `src/app/cockpit/layout.tsx` | **CRIAR** (Server Component, aplica `<B2BNav />` + `<main>` para todos os filhos de `/cockpit/*`) |
| `src/app/cockpit/page.tsx` | **MODIFICAR** (remover `<main>` wrapper se houver; layout já cobre) |
| `src/components/cockpit/CockpitSidebar.tsx` | **MANTER** (lado a lado com a nav, em `/cockpit` mostra o form de cliente; em outras rotas, oculta) |

### 2.2 Estrutura `<B2BNav>`

```tsx
// Tokens Ramiro v2: item ativo = border-l-primary (laranja), bg-secondary/15
<aside className="w-72 h-screen sticky top-0 bg-card/80 border-r border-border flex flex-col">
  <header className="p-4 border-b border-border/50">
    <Sparkles className="text-primary" />
    <span className="font-cinzel text-lg">Cabala dos Caminhos</span>
  </header>
  <nav className="flex-1 p-3 space-y-1">
    {items.map(item => (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          isActive && 'bg-secondary/15 text-primary border-l-2 border-primary font-medium'
        )}
      >
        <item.icon className="w-4 h-4" />
        {item.label}
      </Link>
    ))}
  </nav>
  <footer className="p-4 border-t border-border/50">
    {/* Perfil do operador + Sair (reaproveita handleLogout do CockpitHeader) */}
  </footer>
</aside>
```

### 2.3 Itens de nav

| Label | Ícone (lucide) | Rota | Match |
|---|---|---|---|
| Nova Consulta | `Sparkles` | `/cockpit` | exato |
| Consulentes | `Users` | `/cockpit/consulentes` | prefixo |
| Dashboard | `LayoutDashboard` | `/cockpit/dashboard` | exato |
| Leituras | `FileText` | `/cockpit/leituras` | prefixo |

**Detecção de ativo** via `usePathname()` (Next 16 hook).

### 2.4 Critérios de aceitação

- [ ] `/cockpit` exibe a nav com 4 itens
- [ ] Item ativo destacado com `border-l-2 border-primary` (laranja)
- [ ] Clicar navega sem flash/loading estranho
- [ ] Sem itens B2C (mapa, rituais, onboarding)
- [ ] Sair funciona (já há implementação no `CockpitHeader:31-38`)

---

## 3. C.1 — Dashboard B2B (Doc 05 §3 / Doc 16 AD-06.4) 🟡

**Objetivo:** `/cockpit/dashboard` com métricas reais do Prisma + tabela de últimas leituras.

### 3.1 Arquivos

| Arquivo | Operação |
|---|---|
| `src/app/cockpit/dashboard/page.tsx` | **CRIAR** (Server Component) |
| `src/components/cockpit/dashboard/MetricsCards.tsx` | **CRIAR** (Client, 3 cards) |
| `src/components/cockpit/dashboard/RecentReadings.tsx` | **CRIAR** (Client, tabela) |
| `src/lib/db/reading-actions.ts` | **MODIFICAR** (adicionar `getReadingsByOperator` que filtra por `operatorId`, não `userId`) |
| `src/lib/db/client-actions.ts` | **MODIFICAR** (adicionar `getClientsByOperator`) |

### 3.2 Server Component — `dashboard/page.tsx`

```tsx
// Padrão igual a /cockpit/page.tsx
import { redirect } from 'next/navigation';
import { getOperatorFromServerContext } from '@/lib/auth/operator-session';
import { getReadingsByOperator } from '@/lib/db/reading-actions';
import { getClientsByOperator } from '@/lib/db/client-actions';
import { MetricsCards } from '@/components/cockpit/dashboard/MetricsCards';
import { RecentReadings } from '@/components/cockpit/dashboard/RecentReadings';

export default async function DashboardPage() {
  const operator = await getOperatorFromServerContext();
  if (!operator) redirect('/cockpit/login');

  const [consultasMes, totalConsulentes, leiturasRecentes, pendentesHoje] = await Promise.all([
    countReadingsThisMonth(operator.id),
    getClientsByOperator(operator.id).then(c => c.length),
    getReadingsByOperator(operator.id, { limit: 10 }),
    countPendingToday(operator.id),
  ]);

  return (
    <div className="ramiro p-8 space-y-8">
      <header>
        <h1 className="font-cinzel text-2xl text-primary">Painel Principal</h1>
        <p className="text-muted-foreground">Visão geral do seu trabalho como terapeuta.</p>
      </header>
      <MetricsCards
        consultasMes={consultasMes}
        totalConsulentes={totalConsulentes}
        pendentesHoje={pendentesHoje}
      />
      <RecentReadings readings={leiturasRecentes} />
    </div>
  );
}
```

### 3.3 `MetricsCards.tsx`

```tsx
// 3 cards, 1 grande + 2 pequenos ou 3 iguais
// Tokens Ramiro: número grande em text-primary (laranja), label em text-muted-foreground
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <MetricCard label="Consultas este mês" value={consultasMes} icon={Calendar} />
  <MetricCard label="Consulentes cadastrados" value={totalConsulentes} icon={Users} />
  <MetricCard label="Pendentes hoje" value={pendentesHoje} icon={Clock} accent={pendentesHoje > 0 ? 'destructive' : 'muted'} />
</div>
```

### 3.4 `RecentReadings.tsx`

```tsx
// Tabela 10 últimas leituras: Nome | Data | Status | Ação
// Status: COMPLETED → bg-secondary/15 (royal); PENDING → bg-primary/15 (laranja); ERROR → bg-destructive/15
// Ação: Link para /cockpit/leituras/[id]
<table className="w-full">
  <thead><tr className="border-b border-border">
    <th className="text-left text-xs uppercase text-muted-foreground py-2">Nome</th>
    <th className="text-left text-xs uppercase text-muted-foreground py-2">Data</th>
    <th className="text-left text-xs uppercase text-muted-foreground py-2">Status</th>
    <th className="text-right text-xs uppercase text-muted-foreground py-2">Ação</th>
  </tr></thead>
  <tbody>
    {readings.map(r => (
      <tr key={r.id} className="border-b border-border/30">
        <td>{r.client.fullName}</td>
        <td>{formatDate(r.date)}</td>
        <td><StatusBadge status={r.status} /></td>
        <td><Link href={`/cockpit/leituras/${r.id}`}>Ver</Link></td>
      </tr>
    ))}
  </tbody>
</table>
```

### 3.5 Helpers Prisma (em `reading-actions.ts`)

```ts
// AD-03: usar operatorId, não userId
export async function getReadingsByOperator(
  operatorId: string,
  opts?: { limit?: number; status?: ReadingStatus }
) {
  return prisma.reading.findMany({
    where: {
      operatorId,
      ...(opts?.status ? { status: opts.status } : {}),
    },
    include: { client: { select: { fullName: true } } },
    orderBy: { date: 'desc' },
    take: opts?.limit ?? 10,
  });
}

export async function countReadingsThisMonth(operatorId: string) {
  const start = new Date(); start.setDate(1); start.setHours(0, 0, 0, 0);
  return prisma.reading.count({
    where: { operatorId, date: { gte: start } },
  });
}

export async function countPendingToday(operatorId: string) {
  const start = new Date(); start.setHours(0, 0, 0, 0);
  return prisma.reading.count({
    where: { operatorId, status: 'PENDING', date: { gte: start } },
  });
}
```

### 3.6 Critérios de aceitação

- [ ] `/cockpit/dashboard` carrega em < 2s com Prisma
- [ ] 3 cards exibem valores reais do banco
- [ ] Tabela mostra últimas 10 leituras do operador autenticado
- [ ] Status com cores Ramiro (PENDING=laranja, COMPLETED=royal, ERROR=rose)
- [ ] Click em "Ver" navega para `/cockpit/leituras/[id]` (C.2)

---

## 4. C.4 — ClientForm (Doc 05 §6) 🟡

**Objetivo:** `/cockpit/consulentes/novo` com 3 grupos (Identificação, Local, Anotações) + cálculo de mapas.

### 4.1 Arquivos

| Arquivo | Operação |
|---|---|
| `src/app/cockpit/consulentes/novo/page.tsx` | **CRIAR** (Server Component) |
| `src/app/cockpit/consulentes/[id]/page.tsx` | **CRIAR** (perfil do consulente) |
| `src/app/cockpit/consulentes/page.tsx` | **CRIAR** (listagem) |
| `src/components/cockpit/clients/ClientForm.tsx` | **CRIAR** (Client, RHF + Zod) |
| `src/components/cockpit/clients/ClientMapPreview.tsx` | **CRIAR** (Client, mostra os 4 mapas calculados) |
| `src/lib/db/client-actions.ts` | **MODIFICAR** (validar `createClient` server action) |

### 4.2 Server Action `createClient` (Zod + Prisma)

```ts
// src/lib/db/client-actions.ts
const createClientSchema = z.object({
  fullName: z.string().min(3),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/),
  birthCity: z.string().min(2),
  birthState: z.string().min(2),
  birthCountry: z.string().min(2),
  birthLatitude: z.number().optional(),
  birthLongitude: z.number().optional(),
  birthTimezone: z.string().optional(),
  notes: z.string().optional(),
});

export async function createClient(input: z.infer<typeof createClientSchema>) {
  // 1. Validar
  // 2. Calcular 4 mapas (chamar lib/calculators/* — pode ser parcial se Doc 11 não estiver completo)
  // 3. Prisma: client.create com mapas em JSON
  // 4. Revalidate path /cockpit/consulentes
  // 5. Return { id }
}
```

### 4.3 `<ClientForm>` (Client, RHF + Zod + ZodResolver)

```tsx
// Estado: form (RHF), isSubmitting, progress ('calculating' | 'saving' | 'done')
// 3 grupos com Card/Section (Doc 05 §6):
// 1. Identificação: fullName, birthDate, birthTime
// 2. Local: birthCity (Combobox Google Places se NEXT_PUBLIC_GOOGLE_PLACES_KEY), birthState, birthCountry (auto)
// 3. Anotações: notes (Textarea)
// Botão Salvar → submit → server action → redirect /cockpit/consulentes/[id]
```

### 4.4 `<ClientMapPreview>` (após salvar)

```tsx
// Mostra os 4 mapas como cards com badges Ramiro
// Astrologia (royal), Cabala (royal), Tântrica (laranja), Odu (royal)
// Reusa variants de Badge já criadas em CockpitSidebar
```

### 4.5 Critérios de aceitação

- [ ] Form valida com Zod antes de submeter
- [ ] Submit chama server action que calcula 4 mapas
- [ ] Indicador de progresso ("Calculando mapa astral..." → "Salvando...")
- [ ] Após sucesso, redirect para `/cockpit/consulentes/[id]`
- [ ] Erros de validação aparecem inline em cada campo

---

## 5. C.2 — DossierViewer (Doc 05 §5 / Doc 16 AD-12 §5) 🔴

**Objetivo:** consumir stream de `/api/mesa-real/generate` (36 chamadas ou refactor para SSE full) e renderizar dossiê em 2 painéis.

### 5.1 Decisão arquitetural — CRÍTICA

**Problema atual:** `/api/mesa-real/generate` é por-casa (recebe `casaNumero`) e retorna JSON. Para UX de streaming "uma casa de cada vez com progresso X/36", há 2 caminhos:

| Opção | Prós | Contras |
|---|---|---|
| **(A) Loop client-side**: 36 fetch paralelos/sequenciais ao endpoint existente | Zero refactor; usa rota já cabeada e testada | Não é "stream" verdadeiro; UX pior; latência 36x maior; cliente orquestra |
| **(B) Novo endpoint SSE**: `/api/mesa-real/dossier/[id]` que faz stream de 36 casas | UX nativa streaming; 1 request; backpressure natural | Refactor; precisa testar SSE; mais código novo |

**Recomendação: (B)** — o Doc 05 §5 mostra explicitamente "streaming token a token" como requisito, e C.3 (Q&A) também vai precisar de SSE. Construir uma vez, reusar.

### 5.2 Arquivos

| Arquivo | Operação |
|---|---|
| `src/app/api/mesa-real/dossier/[id]/route.ts` | **CRIAR** (SSE endpoint, loop 36 casas chamando lógica do generate existente) |
| `src/app/api/mesa-real/generate/route.ts` | **MANTER** (back-compat) |
| `src/app/cockpit/leituras/[id]/page.tsx` | **CRIAR** (Server Component) |
| `src/components/cockpit/dossier/DossierViewer.tsx` | **CRIAR** (Client, consome SSE, renderiza) |
| `src/components/cockpit/dossier/DossierIndex.tsx` | **CRIAR** (índice sticky) |
| `src/components/cockpit/dossier/DossierHeader.tsx` | **CRIAR** (header com Voltar, título, ações) |
| `src/components/cockpit/dossier/LoadingOrbital.tsx` | **CRIAR** (loader laranja) |
| `package.json` | **MODIFICAR** (adicionar `react-markdown`, `remark-gfm`, `rehype-raw`) |

### 5.3 SSE Endpoint — `/api/mesa-real/dossier/[id]/route.ts`

```ts
import { prisma } from '@/lib/prisma';
import { requireOperator } from '@/lib/auth/operator-session';
import { buildHousePayload, buildSystemPrompt, type ClientMaps } from '@/lib/ai/dossier/oracle-prompt-builder';
import { callLLM } from '@/lib/ai/llm-client';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const operatorOrResponse = await requireOperator(request);
  if (operatorOrResponse instanceof NextResponse) return operatorOrResponse;
  const operator = operatorOrResponse;
  const { id: readingId } = await params;

  // 1. Carregar reading + client + report
  const reading = await prisma.reading.findUnique({
    where: { id: readingId },
    include: { client: true, report: true },
  });
  if (!reading || reading.operatorId !== operator.id) {
    return new Response('Not found', { status: 404 });
  }

  const matrixData = reading.matrixData as Record<string, CasaData>;
  const clientMaps = {
    astrology: reading.client.astrologyMap as ClientMaps['astrology'] | null,
    kabala: reading.client.kabalisticMap as ClientMaps['kabala'] | null,
    tantric: reading.client.tantricMap as ClientMaps['tantric'] | null,
    odu: reading.client.oduBirth as ClientMaps['odu'] | null,
  };

  // 2. SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for (let i = 1; i <= 36; i++) {
        const house = matrixData[i];
        if (!house || !house.carta || !house.odu) {
          controller.enqueue(encoder.encode(`event: skip\ndata: ${JSON.stringify({ casa: i })}\n\n`));
          continue;
        }

        controller.enqueue(encoder.encode(`event: progress\ndata: ${JSON.stringify({ casa: i, total: 36 })}\n\n`));

        const payload = buildHousePayload({
          casa: { numero: i, ...house.carta, ...house.odu },
          client: clientMaps,
        });
        const system = buildSystemPrompt({ persona: 'ramiro' });
        const { content: dossie } = await callLLM({ system, user: payload, temperature: 0.7 });

        // Persistir cumulativamente
        await prisma.report.upsert({ ... });

        controller.enqueue(encoder.encode(`event: house\ndata: ${JSON.stringify({ casa: i, dossie })}\n\n`));
      }
      controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

### 5.4 Server Component — `leituras/[id]/page.tsx`

```tsx
// Igual padrão: requireOperator → load reading → render <DossierViewer readingId={id} />
```

### 5.5 `<DossierViewer>` (Client, consome SSE)

```tsx
// Hook useDossierStream(readingId):
//   - abre EventSource('/api/mesa-real/dossier/' + readingId)
//   - parse 'event: house' → append ao state.markdown[casa]
//   - parse 'event: progress' → setProgress(casa/36)
//   - parse 'event: done' → close
//   - parse 'event: skip' → marca como pulado

const [stream, setStream] = useState({ markdown: {}, progress: 0, done: false });

useEffect(() => {
  const es = new EventSource(`/api/mesa-real/dossier/${readingId}`);
  es.addEventListener('progress', e => setProgress(JSON.parse(e.data)));
  es.addEventListener('house', e => {
    const { casa, dossie } = JSON.parse(e.data);
    setMarkdown(prev => ({ ...prev, [casa]: dossie }));
  });
  es.addEventListener('done', () => { es.close(); setDone(true); });
  return () => es.close();
}, [readingId]);
```

### 5.6 Layout 2 painéis (Doc 05 §5)

```tsx
<div className="ramiro flex h-screen">
  <DossierIndex casas={Object.keys(markdown).map(Number)} activeCasa={active} onClick={setActive} />
  <main className="flex-1 overflow-y-auto p-8">
    <DossierHeader title="Dossiê Cabalístico" date={date} client={name} totalHouses={36} />
    {!done && <LoadingOrbital progress={progress} />}
    <article className="font-dossier max-w-[720px] mx-auto text-foreground/90 leading-[1.8] text-[15px]">
      {Object.entries(markdown).map(([casa, text]) => (
        <section key={casa} className="mt-9 border-b border-border pb-4">
          <h2 className="font-cinzel text-primary text-lg">Casa {casa} — {HOUSE_NAMES[casa]}</h2>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </section>
      ))}
    </article>
  </main>
</div>
```

### 5.7 CSS do Markdown (estilo Ramiro, Doc 13 §6.2)

```css
.dossier h2 { @apply font-cinzel text-primary text-lg border-b border-border pb-2 mt-9; }
.dossier em { @apply text-secondary not-italic text-xs font-medium; }
.dossier blockquote { @apply border-l-2 border-secondary pl-4 italic text-muted-foreground; }
.dossier p { @apply mb-4; }
.dossier strong { @apply text-foreground; }
```

### 5.8 Critérios de aceitação

- [ ] SSE começa em < 3s
- [ ] Cada casa aparece progressivamente (efeito "máquina de escrever")
- [ ] Loader orbital laranja enquanto processa
- [ ] Índice sticky à esquerda com 36 casas
- [ ] `h2` em Cinzel laranja; `em` em royal
- [ ] Reload da página retoma do ponto (state em Report)
- [ ] Erro LLM: renderiza card "Casa X falhou" + botão "Tentar novamente"

---

## 6. C.3 — Q&A Chat UI (Doc 05 §9 / Doc 12 §8 / Doc 16 AD-12 §9) 🔴

**Objetivo:** chat ancorado num Reading com bolhas royal/laranja + chips de roteamento + streaming.

### 6.1 Decisão arquitetural — refactor consult para SSE

**Problema atual:** `/api/consult` retorna JSON único. Para streaming token-a-token, refatorar.

| Opção | Prós | Contras |
|---|---|---|
| **(A) Loop client-side**: chama JSON, mostra typing indicator | Zero refactor | UX ruim; sem streaming real |
| **(B) Refactor consult para SSE** | Streaming nativo; reusa padrão de C.2 | Refactor do `consult/route.ts`; testar |

**Recomendação: (B)** — coerência com C.2.

### 6.2 Arquivos

| Arquivo | Operação |
|---|---|
| `src/app/api/consult/route.ts` | **MODIFICAR** (refactor para SSE) |
| `src/app/cockpit/leituras/[id]/consulta/page.tsx` | **CRIAR** (Server Component) |
| `src/components/cockpit/consultation/OraculoChat.tsx` | **CRIAR** (Client, orquestra) |
| `src/components/cockpit/consultation/UserBubble.tsx` | **CRIAR** |
| `src/components/cockpit/consultation/OracleBubble.tsx` | **CRIAR** (com Lora) |
| `src/components/cockpit/consultation/RoutingChips.tsx` | **CRIAR** |
| `src/components/cockpit/consultation/ConsultationInput.tsx` | **CRIAR** |

### 6.3 SSE Consult — `consult/route.ts`

```ts
export async function POST(request: NextRequest) {
  // ... mesma auth/validação ...
  // ... mesmo carregamento de contexto ...

  const stream = new ReadableStream({
    async start(controller) {
      // Persistir mensagem USER antes
      await addChatMessage({ consultationId, role: 'USER', content: question });

      controller.enqueue(encoder.encode(`event: routing\ndata: ${JSON.stringify({ themes: routing.themes, houses: routing.houses })}\n\n`));

      // Chamar LLM com stream
      const llmStream = await fetch(llmUrl, { /* stream: true */ });
      const reader = llmStream.body.getReader();

      let fullAnswer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        // Parse SSE do LLM → extrair delta.content
        const delta = parseDelta(chunk);
        fullAnswer += delta;
        controller.enqueue(encoder.encode(`event: token\ndata: ${JSON.stringify({ delta })}\n\n`));
      }

      // Persistir mensagem ORACLE
      await addChatMessage({ consultationId, role: 'ORACLE', content: fullAnswer, routedThemes, routedHouses });

      controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
}
```

### 6.4 Layout Chat (Doc 05 §9)

```
┌────────────────────────────────────────────────┐
│ Header: "Consultar o Oráculo" + nome cliente   │
├────────────────────────────────────────────────┤
│ Bolhas (scroll reverso):                        │
│   [user] laranja, dir — "E quanto ao amor?"     │
│   [oracle] royal, esq — Lora, chips [C24]       │
│     ─ sintaxe: italic, royal                    │
├────────────────────────────────────────────────┤
│ Input fixo: [textarea] [Enviar → (laranja)]      │
└────────────────────────────────────────────────┘
```

### 6.5 Tokens Ramiro nas bolhas

```tsx
// UserBubble: bg-primary/15 border-primary/30 text-primary, ml-auto
// OracleBubble: bg-secondary/12 border-secondary/30 text-foreground, font-dossier
// RoutingChips: bg-secondary/15 text-secondary border-secondary/40 rounded-full
// Input: bg-muted/50 border-border/50 focus:border-primary/50
// Send: variant="spiritual" (laranja)
```

### 6.6 Critérios de aceitação

- [ ] Pergunta "amor" roteia para Casa 24 (chip visível)
- [ ] Resposta nunca cita carta/Odu fora da matrixData
- [ ] Streaming token a token em < 3s
- [ ] Mensagens persistidas (USER + ORACLE com routedThemes/Houses)
- [ ] Recarregar a página retoma a conversa
- [ ] Enter envia; Shift+Enter quebra linha

---

## 7. Resumo de execução

### 7.1 Dependências entre entregáveis

```
C.5 (nav)  ──┬──> C.1 (dashboard)
             ├──> C.4 (clientes)
             └──> C.2 (dossiê) ──> C.3 (Q&A)
```

### 7.2 Pré-requisitos de package.json

```bash
pnpm add react-markdown remark-gfm rehype-raw
```

(Reativo a 3 packages — `react-markdown` para renderizar Markdown, `remark-gfm` para tabelas/listas, `rehype-raw` para HTML inline se necessário.)

### 7.3 Ciclos sugeridos

| Ciclo | Escopo | Verificação |
|---|---|---|
| C-N+13 | C.5 (Nav) | 4 itens, item ativo laranja, sem B2C |
| C-N+14 | C.1 (Dashboard) + helper `getReadingsByOperator` | Métricas reais do Prisma |
| C-N+15 | C.4 (ClientForm) | Validação Zod, server action, 4 mapas |
| C-N+16 | C.2 setup (SSE endpoint + react-markdown) | Stream emite eventos `progress` + `house` |
| C-N+17 | C.2 UI (DossierViewer + 2 painéis) | Render com Lora, índice sticky, h2 laranja |
| C-N+18 | C.3 (Q&A SSE + Chat UI) | Chat funcional, chips, streaming |

### 7.4 Riscos & Mitigações

| Risco | Mitigação |
|---|---|
| SSE não suportado em runtime Vercel | Vercel suporta SSE; testar local + deploy preview |
| Latência do LLM alta | Mostrar typing indicator; persistir após 1ª palavra |
| Race condition: 36 chamadas simultâneas ao LLM | Loop sequencial com pequeno delay; documentar limite |
| react-markdown v9+ vs Next 16 | Verificar compat; se quebrar, fallback para `marked` + DOMPurify |
| Build fail por `@base-ui/react/tabs` | Já existe e é usado; não há risco novo |
| Auth em SSE — cookie não flui | Next 16 envia cookies automaticamente; testar com auth real |

### 7.5 SESSION_ID

- CODEX_SESSION: N/A (wrapper não disponível; síntese via Doc 16 + código)
- GEMINI_SESSION: N/A (idem)

---

*Plano gerado em 2026-06-02 a partir do estado pós-commit `9b9b5999` (Fase 14b), Doc 16 ADRs (AD-06, AD-11, AD-12), Doc 05 §3-§9, Doc 12 §8, Doc 13 §4, e da inspeção direta das APIs (`/api/mesa-real/{generate,save,readings,clients}`, `/api/consult`).*
