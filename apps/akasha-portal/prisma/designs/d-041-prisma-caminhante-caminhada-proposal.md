# Proposal: D-041 Schema Prisma — modelagem canônica de Caminhante e Caminhada

## Context

O glossário canônico (`CONTEXT.md`) define duas entidades que ainda não
existem no `schema.prisma`:

- **Caminhante** (linha 10) — pessoa atendida pelo Zelador; ficha manual
  cadastrada pelo Zelador; sem login; não acessa o app diretamente.
- **Caminhada** (linha 34) — arco de relação entre Zelador e Caminhante;
  container de longo prazo para Jogos, intenção, ethics invariant do
  Pilar 4 e Mandala Viva.

Hoje os 5 Pilares vivem em `BirthChart.astrologyMap/kabalisticMap/...`,
mas `BirthChart` é o **mapa do Zelador** (User) — não do Caminhante.
A lacuna impede:

- A UI de cadastrar Caminhantes (modelo A: ficha manual, sem login).
- Abrir uma Caminhada sem os campos descritos em `CONTEXT.md:26-51`.
- Renderizar a **Mandala do Caminhante** distinta do mapa do Zelador.

Este PROPOSAL adiciona 2 models novos + 1 enum + relações reversas no
`User`. **Sem mudanças destrutivas** nos 11 models existentes.
`MandalaSnapshot` (decisão #11 do handoff sessão 3) fica para D-042;
`Jogo` para D-043.

## Glossário de referência (ancoragem)

- **Caminhante** — `CONTEXT.md:10` (pessoa atendida, sem login).
- **Anamnese** — `CONTEXT.md:26-32` (mínimo absoluto, ricos, nunca-persistir).
- **Caminhada** — `CONTEXT.md:34` (relação, container de longo prazo).
- **Status da Caminhada** — `CONTEXT.md:42-51` (3 estados + grafo de
  transições manual pelo Zelador, sem skip `aberta → encerrada`).
- **Consent Pilar 4 Dados** — `CONTEXT.md:28` (escopo LGPD/processing).
- **Consent Pilar 4 Uso** — `CONTEXT.md:62` (escopo oracular, da relação).

## Proposed Changes

### 1. `schema.prisma` — 2 models novos

```prisma
model Caminhante {
  id                      String   @id @default(cuid())
  zeladorId               String
  zelador                 User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)

  // Identidade (ver ADR 0001)
  nome                    String   // como prefere ser chamado
  nomeLowercaseNormalized String   // trim() + NFKD-strip-accents + lowercase
  nomeCompleto            String?  // nome legal (opcional; metadata de documentos)

  // Nascimento
  dataNascimento          DateTime
  horaNascimento          String?  // 'desconhecida', 'circa', ou ISO 'HH:mm'
  localNascimentoCidade   String
  localNascimentoEstado   String
  localNascimentoPais     String
  timezone                String?  // IANA, ex.: 'America/Sao_Paulo'

  // Campos ricos (Anamnese)
  contato                 String?  // telefone/email — Zelador decide
  saudeRelevante          String?  // markdown livre; crítico p/ Integração Ayahuasca
  caminhadaEspiritualPrevia String? // tradição/linha/mestre anterior — Pilar 4 ethics
  observacoes             String?  // markdown livre

  // Consents (LGPD + Pilar 4 Dados) — Zod-validated app layer
  consentimentoPilar4Dados Json?   // { consentiuEm: ISO, revogadoEm?: ISO }
  consentimentoLGPD       Json?    // { consentiuEm: ISO, finalidade: string }

  caminhadas              Caminhada[]

  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  @@unique([zeladorId, dataNascimento, nomeLowercaseNormalized], name: "caminhante_identity_per_zelador")
  @@index([zeladorId])
  @@index([nomeLowercaseNormalized])
  @@map("caminhantes")
}

enum CaminhadaStatus {
  aberta
  em_encerramento
  encerrada
}

model Caminhada {
  id                String   @id @default(cuid())
  zeladorId         String
  zelador           User     @relation(fields: [zeladorId], references: [id], onDelete: Cascade)
  caminhanteId      String
  caminhante        Caminhante @relation(fields: [caminhanteId], references: [id], onDelete: Cascade)

  status            CaminhadaStatus @default(aberta)
  intencaoInicial   String   // pergunta-mãe / foco de cura
  zeladorLinhagem   String   // linha/terreiro do Zelador — Pilar 4 ethics invariant

  // Consent Pilar 4 Uso (escopo oracular — da relação, não do evento)
  consentimentoPilar4Uso Json?  // { consentiuEm: ISO, revogadoEm?: ISO }

  abertoEm          DateTime @default(now())
  dataEncerramento  DateTime? // obrigatório quando status = 'encerrada'
  motivo            String?  // obrigatório quando status = 'encerrada' (UI obriga)

  // MandalaSnapshot virá em D-042 — referenciado conceitualmente:
  // snapshots      MandalaSnapshot[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([zeladorId])
  @@index([caminhanteId])
  @@index([status])
  @@map("caminhadas")
}
```

### 2. `schema.prisma` — relações reversas no `User`

Adicionar ao model `User` (após `connections Connection[]`, linha 53):

```prisma
  caminhantes       Caminhante[]
  caminhadas        Caminhada[]
```

### 3. App layer — Zod schemas

Em `apps/akasha-portal/src/lib/application/caminhante/schemas.ts`:

```ts
import { z } from 'zod';

export const ConsentimentoPilar4DadosSchema = z.object({
  consentiuEm: z.string().datetime(),
  revogadoEm: z.string().datetime().optional(),
});
export const ConsentimentoLGPDSchema = z.object({
  consentiuEm: z.string().datetime(),
  finalidade: z.string().min(1),
});
export const ConsentimentoPilar4UsoSchema = z.object({
  consentiuEm: z.string().datetime(),
  revogadoEm: z.string().datetime().optional(),
});
```

Em `apps/akasha-portal/src/lib/application/caminhante/identity.ts`:

```ts
export function normalizeNomeForIdentity(nome: string): string {
  return nome.trim().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
```

### 4. API routes novos (escopo mínimo deste PROPOSAL)

- `POST /api/akasha/caminhantes` — criar Caminhante. UNIQUE colidida →
  **409 Conflict** com payload sugerindo apelidos. UI obriga Zelador a
  resolver antes de submeter.
- `GET /api/akasha/caminhantes` — listar Caminhantes do Zelador autenticado.
- `POST /api/akasha/caminhadas` — abrir Caminhada. Valida:
  `Caminhante.consentimentoPilar4Dados` E `consentimentoLGPD` presentes;
  consent `consentimentoPilar4Uso` registrado na criação da Caminhada.
- `PATCH /api/akasha/caminhadas/:id/status` — transição de status. App
  layer enforce o grafo de `CONTEXT.md:46-51` (sem skip `aberta → encerrada`).
- `GET /api/akasha/caminhadas/:id` — detalhe (Mandala snapshot history
  virá com D-042).

## Decisões registradas

| # | Decisão | ADR | Reversibilidade |
|---|---|---|---|
| 1 | 2 models separados (Caminhante + Caminhada) | — | Trade-off documentado aqui; reversível com migration (D-040 backward compat: 1 release deprecation). |
| 2 | `cuid` + UNIQUE(zeladorId, dataNascimento, nomeLowercaseNormalized) | `docs/adr/0001-caminhante-identity-strategy.md` | **Hard to reverse** (mudança de normalização exige re-scan de todos os Caminhantes). |
| 3 | `horaNascimento: String?` (não `DateTime?`) | — | Documentado. Reversível com migration (1 release deprecation). |
| 4 | `localNascimento` em 3 cols (não 1 string) | — | Documentado. Reversível. |
| 5 | lat/lng **não persistido** (geocoding lazy, em-memória) | — | Reversível (cache table opcional depois). |
| 6 | Caminhada: 2 FKs denormalizadas (`zeladorId` + `caminhanteId`) | — | Trade-off documentado; reversível. |
| 7 | `CaminhadaStatus` enum nativo Prisma | — | Trivialmente reversível. |
| 8 | Consents em `Json` único + Zod no app layer | — | Alinhado com Pilar 1-4 (`BirthChart.astrologyMap` é Json). Reversível. |

## Out of scope (D-042 ou depois)

- **`MandalaSnapshot`** — tabela para histórico de snapshots da Mandala
  Viva (decisão #11 do handoff sessão 3). Aguarda D-042.
- **`Jogo`** — model para registro de Jogo (sessão entre Zelador e
  Caminhante; produz snapshot). Aguarda D-043.
- **Auditoria / versionamento de edits do Caminhante** — fora do MVP.
  Pode ser Log table em versão futura.
- **PII redaction automatizada em exports** — LGPD by design manual
  por enquanto.

## Migration Plan

1. **Schema update** — adicionar `Caminhante`, `enum CaminhadaStatus`,
   `Caminhada`, e as 2 relações reversas no `User`.
2. **Migration** — após aprovação humana:
   `pnpm exec prisma migrate dev --name 041_caminhante_caminhada`
3. **Backfill** — nenhum (tabelas vazias; zero produção).
4. **App update** — Zod schemas + `normalizeNomeForIdentity` + 5 API
   routes novos + UI de cadastro (escopo separado, pós-approval).
5. **Ordem de rollout** — schema primeiro (idempotente, sem código
   dependente), app layer depois.

## Risk and Rollback

- **Risk:** migration aditiva. Sem mudança destrutiva em models existentes.
  Backward compat OK (D-040 D2 não violado).
- **Risk:** LGPD — `consentimentoPilar4Dados` e `consentimentoLGPD`
  devem ser **obrigatórios antes de qualquer Jogo**. Schema aceita null
  por flexibilidade (Caminhante pode existir sem consent para "rascunho");
  **regra de negócio** (app layer) obriga non-null no fluxo de criação
  de Caminhada. Validação Zod enforça.
- **Rollback:** `prisma migrate resolve --rolled-back` + revert manual
  do `schema.prisma`. Tabelas `caminhantes` e `caminhadas` ficam vazias
  no rollback inicial → rollback é trivial.

## Verification

- `pnpm exec prisma validate` passa.
- `pnpm db:generate` regenera client sem erro.
- `pnpm --filter akasha-portal typecheck` 0 errors.
- `pnpm test:run` passa.
- **Smoke test manual:**
  1. Criar Caminhante "Maria", 1970-01-01 → 201 Created.
  2. Tentar criar outro "Maria", 1970-01-01 (mesmo Zelador) → **409**
     com payload de resolução de homônimos.
  3. Criar Caminhada sem `consentimentoPilar4Uso` → **400** validation
     error.
  4. Tentar PATCH status `aberta → encerrada` (skip) → **409** transição
     inválida (grafo enforça).

## Approval Required

Aprovação humana antes de `pnpm exec prisma migrate dev --name 041`.

---

**Author:** sessão 4 (grilling + domain-modeling + grill-with-docs),
2026-06-22.
**Anchors:** `CONTEXT.md` linhas 10, 26-34, 37-51, 62. Handoff sessão 3
(decisões #6, #10-14). ADR 0001.