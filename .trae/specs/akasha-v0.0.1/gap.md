# Gap list — Prisma x Doc 04 (§1–5) + superfícies B2B

## 0) Escopo auditado
- Doc de referência: [04_data-model.md §1–5](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md#L9-L379)
- Prisma atual: [schema.prisma](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma)
- Superfícies B2B/legado ainda presentes no repo (inventário inicial):
  - Middleware com allowlist explícita de prefixos B2B (`/cockpit`, `/api/mesa-real`, `/api/consult`, `/api/operator`): [middleware.ts](file:///home/skynet/cabala-dos-caminhos/middleware.ts#L91-L111)
  - Rotas API B2B (App Router):
    - `/api/operator/*`: [src/app/api/operator](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator)
    - `/api/admin/operators/*` (admin de Operators): [unlock route](file:///home/skynet/cabala-dos-caminhos/src/app/api/admin/operators/%5Bid%5D/unlock/route.ts)
  - Libs B2B (auth/db/domínio Mesa Real):
    - Auth Operator: [src/lib/auth](file:///home/skynet/cabala-dos-caminhos/src/lib/auth) (ex.: [operator-guard.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/auth/operator-guard.ts))
    - Ações DB B2B (`Client/Reading/Consultation`): [src/lib/db](file:///home/skynet/cabala-dos-caminhos/src/lib/db) (ex.: [client-actions.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/db/client-actions.ts))
    - Mesa Real/Lenormand: [src/lib/lenormand/mesa-real.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/lenormand/mesa-real.ts)
    - PDF “dossiê” (Mesa Real): [src/lib/pdf/dossier-pdf.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/pdf/dossier-pdf.ts)
    - UI de “client search” (provável B2B): [client-search-combobox.tsx](file:///home/skynet/cabala-dos-caminhos/src/components/ui/client-search-combobox.tsx)
  - Scripts B2B: [scripts/find-operators.ts](file:///home/skynet/cabala-dos-caminhos/scripts/find-operators.ts)
  - Testes B2B/legado:
    - Operator auth/MFA/sessions: [tests/api/operator-auth.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/operator-auth.test.ts) (e correlatos `operator-auth-*.test.ts`)
    - Mesa Real: [tests/api/mesa-real-generate.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/mesa-real-generate.test.ts) (e correlatos `mesa-real-*.test.ts`)
    - Cockpit/flows (sem páginas correspondentes no `src/app` hoje): [tests/e2e/cockpit-flows.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/e2e/cockpit-flows.test.ts)

---

## 1) Prisma: divergências críticas vs Doc 04 (§1–5)

### 1.1 Conflito de “fonte canônica” no próprio schema
O Doc 04 define o núcleo B2C (Akasha) como `User`, `BirthChart`, `Subscription`, `CreditEntry`, `Manifesto`, `DailyReading`, `RitualCompletion`, `Consultation`, `ChatMessage`, `GrimoireEntry` (sem prefixos) com `@@map(...)` para tabelas canônicas (ex.: `"users"`, `"birth_charts"`, `"subscriptions"`, `"credit_entries"`, `"manifestos"`, `"daily_readings"`, `"ritual_completions"`, `"consultations"`, `"chat_messages"`, `"grimoire"`). Referência: [04_data-model.md §1](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md#L9-L203)

No schema atual coexistem 3 “linhas” B2C diferentes + legado B2B:
- **B2B (Operator/Client/Reading/Report/Consultation/ChatMessage)** ainda presente e detalhado como “canônico” em comentários do schema: [schema.prisma:L68-L411](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L68-L411) e [schema.prisma:L263-L395](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L263-L395)
- **B2C legado em PT-BR (User/MapaNatal/Assinatura/Credito/Empresa/etc)** ocupando `@@map("users")` e portanto colidindo semanticamente com o Doc 04: [schema.prisma:L416-L517](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L416-L517)
- **B2C “Akasha*” prefixado (AkashaUser/AkashaBirthChart/AkashaSubscription/...)** que se aproxima do Doc 04, mas usa tabelas `akasha_*` e mantém modelagem paralela: [schema.prisma:L976-L1144](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L976-L1144)
- **BirthChart (não-Akasha) “graphics/storage”** em `birth_charts` com estrutura incompatível com Doc 04 (guarda `chartData` genérico e não os 4 mapas JSON): [schema.prisma:L858-L875](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L858-L875)

**Gap:** hoje não existe “um” núcleo B2C alinhado ao Doc 04; há múltiplos núcleos concorrentes, alguns compartilhando nomes/tabelas, outros duplicando entidades via prefixo.

### 1.2 `User` canônico do Doc 04 não existe como tal no schema atual
Doc 04 `User` (campos: `emailVerified`, `name`, `locale`, `role`, coords/timezone, `intentionProfile`, relations para subscription/ledger/manifesto/daily/consultations/ritualLog): [04_data-model.md:L19-L53](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md#L19-L53)

No schema atual:
- `User` (PT-BR) tem outro shape (ex.: `nomeCompleto`, `dataNascimento`, `supabaseUserId`, `empresas`, `favoritos` etc.): [schema.prisma:L416-L451](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L416-L451)
- `AkashaUser` é mais parecido, mas:
  - usa `fullName` (Doc pede `name`)
  - exige `birthDate/birthTime/birthCity/birthState/birthCountry` como obrigatórios (Doc permite `birthDate?` e outros opcionais + `incomplete`)
  - mapeia para `@@map("akasha_users")` (Doc pede `@@map("users")`)
  - duplica cache Stripe em user (Doc coloca Stripe em `Subscription` e permite IDs em `Subscription`, não pede cache em User)
  - inclui `consentGiven/consentAt` (isso também existe no `Client` B2B; Doc 04 não lista consentimento no `User`, mas pode ser decisão válida—precisa alinhar doc x implementação)
  Referência: [schema.prisma:L976-L1016](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L976-L1016)

**Gap:** falta implementar o `User` do Doc 04 (ou atualizar o Doc 04) e remover/encerrar os modelos concorrentes (`User` PT-BR e/ou `AkashaUser` prefixado).

### 1.3 `BirthChart` do Doc 04 (4 mapas JSON + 1:1 + `incomplete`) está divergente/duplicado
Doc 04 `BirthChart`: [04_data-model.md:L60-L74](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md#L60-L74)

No schema atual:
- `AkashaBirthChart` bate bem nos 4 mapas + `incomplete`, mas vai para `akasha_birth_charts`: [schema.prisma:L1018-L1033](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L1018-L1033)
- `BirthChart` (graphics/storage) usa `chartData` e obrigatoriedade diferente: [schema.prisma:L858-L875](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L858-L875)

**Gap:** consolidar em um único `BirthChart` canônico (Doc 04) e decidir destino do `BirthChart` “graphics/storage” (renomear/migrar/remover).

### 1.4 `Subscription`/`CreditEntry`/`Manifesto`/`DailyReading`/`RitualCompletion` existem apenas como `Akasha*`
Doc 04 define nomes sem prefixo e `@@map` sem `akasha_`: [04_data-model.md:L79-L181](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md#L79-L181)

No schema atual esses modelos existem como:
- `AkashaSubscription`, `AkashaCreditEntry`, `AkashaManifesto`, `AkashaDailyReading`, `AkashaRitualCompletion`: [schema.prisma:L1048-L1116](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L1048-L1116)

**Gap:** alinhar naming e mapeamento de tabelas ao Doc 04 (ou atualizar doc). Hoje o Doc 04 não descreve `akasha_*` e o schema não implementa as tabelas `subscriptions`, `credit_entries`, `manifestos`, `daily_readings`, `ritual_completions` como canônicas do Akasha v2.

### 1.5 `Consultation`/`ChatMessage` do Doc 04 (B2C, crédito, rastreabilidade de pilares/grimório) existem apenas como `Akasha*`
Doc 04: [04_data-model.md:L157-L181](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md#L157-L181)

No schema atual:
- `AkashaConsultation`/`AkashaChatMessage` têm os campos esperados (`routedPillars`, `grimoireRefs`, `creditCost`): [schema.prisma:L1118-L1144](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L1118-L1144)
- Porém existe também **Consultation/ChatMessage B2B** (ancorada em `Reading` e com `routedThemes`/`routedHouses`), com o mesmo nome `ChatMessage` e `@@map("chat_messages")`: [schema.prisma:L348-L389](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L348-L389)

**Gap:** colisão conceitual e possível colisão física de tabelas (`chat_messages`) entre B2B e B2C, a depender de migrações/estado do banco.

### 1.6 `GrimoireEntry` diverge em nome de tabela e índices
Doc 04 `GrimoireEntry`:
- `@@map("grimoire")`
- sem `createdAt` (apenas `updatedAt`), e `sourcePath` obrigatório
- `metadata Json` (não opcional no doc)
Ref: [04_data-model.md:L188-L201](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md#L188-L201)

No schema atual:
- `GrimoireEntry` mapeia para `grimoire_entries`, `metadata` e `sourcePath` opcionais, inclui `createdAt` e `embedding` opcional: [schema.prisma:L958-L974](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L958-L974)

**Gap:** alinhar contrato (nome da tabela + obrigatoriedade + campos) com Doc 04 (ou atualizar Doc 04 para refletir o design real).

### 1.7 Doc 04 §2–5 (Auth & Conta; contratos JSON; payloads) — impacto no schema
- Doc 04 §2 (“Auth & Conta”) descreve comportamento/fluxos, não adiciona tabelas além do §1: [04_data-model.md §2](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md#L210-L214).
- Doc 04 §3–5 define contratos JSON (4 mapas, `ManifestoContent`, e payload do `DailyReading`). No schema, isso aparece como `Json` em:
  - `BirthChart.astrologyMap/kabalisticMap/tantricMap/oduBirth`
  - `Manifesto.content`
  - `DailyReading.ritual/tensionPoint`
  Referência: [04_data-model.md §3](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md#L217-L220) e [04_data-model.md §4–5](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md).

**Gap (Task 4/6):** o alinhamento real de §2–5 depende de refatorar rotas/libs (ex.: auth e onboarding) e atualizar docs após consolidar o schema (Doc 04 §1).

---

## 2) Inventário — models/enums extras no Prisma (fora Doc 04 §1–5)

### 2.1 Models esperados pelo Doc 04 (§1) e situação no schema atual
Doc 04 define como canônicos (sem prefixos) e com `@@map(...)`: `User`, `BirthChart`, `Subscription`, `CreditEntry`, `Manifesto`, `DailyReading`, `RitualCompletion`, `Consultation`, `ChatMessage`, `GrimoireEntry` + enums `UserRole`, `Plan`, `SubStatus`, `ChatRole`: [04_data-model.md §1](file:///home/skynet/cabala-dos-caminhos/docs/04_data-model.md#L19-L201)

No schema atual, há 3 conjuntos concorrentes:
- **B2C legado PT-BR** usa `User @@map("users")` e ocupa os nomes “canônicos” de tabela: [schema.prisma:L416-L606](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L416-L606)
- **Akasha prefixado** cobre quase todo o Doc 04, mas em tabelas `akasha_*` e com enums `Akasha*`: [schema.prisma:L976-L1144](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L976-L1144)
- **BirthChart graphics/storage** também mapeia `birth_charts` (colisão com Doc 04): [schema.prisma:L858-L875](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L858-L875)

### 2.2 Models extras (não listados no Doc 04 §1–5)
Lista objetiva de models existentes no Prisma atual que **não** pertencem ao núcleo do Doc 04:

- **B2B Operator/Mesa Real**: `Operator`, `OperatorMfa`, `OperatorSession`, `SecurityEvent`, `Client`, `Reading`, `Report` (+ `Consultation`/`ChatMessage` B2B): [schema.prisma:L69-L389](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L69-L389)
- **B2C legado PT-BR** (domínios e “base de conhecimento”): `UserLlmSetting`, `MapaNatal`, `Assinatura`, `WebhookEvent`, `Credito`, `TransacaoCredito`, `Empresa`, `DiaSemana`, `Orixa`, `Chakra`, `Sefirot`, `Odú`, `Erva`, `FaseLua`, `Elemento`, `Insight`, `Conversa`, `Mensagem`, `Reminder`, `SynastryResult`, `Favorito`, `LeituraHistorico`, `JournalEntry`: [schema.prisma:L453-L974](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L453-L974)
- **Akasha prefixado (extra vs Doc 04)**: `AkashaRefreshToken` (Doc 04 não descreve refresh tokens em DB): [schema.prisma:L1035-L1046](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L1035-L1046)

### 2.3 Enums extras (não listados no Doc 04 §1–5)
- **B2B/legado**: `TipoTransacao`, `OperatorRole`, `OperatorSessionType`, `SecurityEventType`, `ReadingStatus`: [schema.prisma:L15-L62](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L15-L62)
- **Akasha prefixado**: `AkashaPlan`, `AkashaSubStatus`, `AkashaChatRole`: [schema.prisma:L396-L410](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L396-L410)

### 2.4 Relacionamentos (mapa rápido do schema atual)
- **B2B (Operator/Mesa Real):**
  - `Operator` 1→N `OperatorSession`, 1→N `SecurityEvent`, 1→1 `OperatorMfa?`, 1→N `Reading`, 1→N `Consultation` (B2B). [schema.prisma:L69-L97](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L69-L97)
  - `Client` 1→N `Reading`. [schema.prisma:L265-L298](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L265-L298)
  - `Reading` N→1 `Client`, N→1 `Operator`, 1→1 `Report?`, 1→N `Consultation`. [schema.prisma:L301-L326](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L301-L326)
  - `Consultation` N→1 `Reading`, N→1 `Operator`, 1→N `ChatMessage`. [schema.prisma:L350-L367](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L350-L367)
  - `ChatMessage` N→1 `Consultation` (B2B) e usa `@@map("chat_messages")` (risco de colisão com Doc 04). [schema.prisma:L370-L389](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L370-L389)
- **B2C legado PT-BR:** `User` 1→1 `MapaNatal?`, 1→1 `Assinatura?`, 1→1 `Credito?`, 1→N `Empresa`, etc. [schema.prisma:L416-L451](file:///home/skynet/cabala-dos-caminhos/prisma/schema.prisma#L416-L451)

**Gap:** para cumprir a spec do refactor, o schema final precisa conter **apenas** o núcleo do Doc 04 §1–5, ou seja, todos os models/enums acima viram “remover” (ou a documentação precisa ser atualizada para reconhecer explicitamente um subset diferente).

---

## 3) Superfícies B2B/legado (rotas/páginas/libs/scripts/testes/middleware)

### 3.1 APIs B2B realmente existentes hoje
Rotas presentes em `src/app/api/operator/**/route.ts` (inventário completo):
- `/api/operator/auth/login`: [login/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/login/route.ts)
- `/api/operator/auth/logout`: [logout/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/logout/route.ts)
- `/api/operator/auth/me`: [me/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/me/route.ts)
- `/api/operator/auth/register`: [register/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/register/route.ts)
- `/api/operator/auth/refresh`: [refresh/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/refresh/route.ts)
- `/api/operator/auth/forgot-password`: [forgot-password/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/forgot-password/route.ts)
- `/api/operator/auth/reset-password`: [reset-password/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/reset-password/route.ts)
- `/api/operator/auth/sessions`: [sessions/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/sessions/route.ts)
- `/api/operator/auth/sessions/revoke-all`: [revoke-all/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/sessions/revoke-all/route.ts)
- `/api/operator/auth/sessions/[id]`: [sessions/[id]/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/sessions/%5Bid%5D/route.ts)
- `/api/operator/auth/mfa/setup`: [mfa/setup/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/mfa/setup/route.ts)
- `/api/operator/auth/mfa/verify-setup`: [mfa/verify-setup/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/mfa/verify-setup/route.ts)
- `/api/operator/auth/mfa/verify`: [mfa/verify/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/mfa/verify/route.ts)
- `/api/operator/auth/mfa/disable`: [mfa/disable/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/mfa/disable/route.ts)
- `/api/operator/auth/mfa/recovery-code`: [mfa/recovery-code/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/mfa/recovery-code/route.ts)
- `/api/operator/auth/mfa/status`: [mfa/status/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/auth/mfa/status/route.ts)
- `/api/operator/dashboard`: [dashboard/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/dashboard/route.ts)
- `/api/operator/interpret-aspect`: [interpret-aspect/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/interpret-aspect/route.ts)
- `/api/operator/rate-limit-status`: [rate-limit-status/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/rate-limit-status/route.ts)
- `/api/operator/dev/bypass-status`: [dev/bypass-status/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/dev/bypass-status/route.ts)
- `/api/operator/dev/bypass-set`: [dev/bypass-set/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/operator/dev/bypass-set/route.ts)

**Gap vs “Akasha v2”:** essas superfícies continuam expostas e ancoradas no schema B2B (`Operator`, `OperatorSession`, `SecurityEvent` etc.), enquanto o Doc 04 posiciona B2C como núcleo e trata B2B como legado (§6 do Doc 04).

### 3.2 APIs B2B adicionais (admin)
- `/api/admin/operators/[id]/unlock`: [unlock/route.ts](file:///home/skynet/cabala-dos-caminhos/src/app/api/admin/operators/%5Bid%5D/unlock/route.ts)

### 3.3 APIs B2B esperadas por docs/testes legados mas ausentes no App Router
Há múltiplos testes e referências a `/api/mesa-real/*` no repo, mas não há handlers correspondentes em `src/app/api` hoje.
Ex.: presença de testes `tests/api/mesa-real-*.test.ts` (referências) sem rotas encontradas no App Router.

**Decisão (alinhada à spec refactor-akasha-v2):** remover/arquivar as referências do Mesa Real (código + testes), sem restauração e sem app separado.

### 3.4 Páginas B2B (`/cockpit/*`)
- Não há páginas `src/app/cockpit/**` no repo (zero matches).
- Mesmo assim, o middleware ainda redireciona para `/cockpit` e allowlista `/cockpit*` como superfície “válida”. [middleware.ts](file:///home/skynet/cabala-dos-caminhos/middleware.ts#L91-L145)

### 3.5 Middleware e “allowlist” do produto B2B
O middleware hoje:
- Mantém allowlist de prefixos B2B (`/cockpit`, `/api/mesa-real`, `/api/consult`, `/api/operator`) e redireciona páginas “fora” para `/cockpit`: [middleware.ts:L91-L145](file:///home/skynet/cabala-dos-caminhos/middleware.ts#L91-L145)
- Referencia rotas/páginas que não existem no App Router atual (ex.: `/cockpit`, `/api/mesa-real`, `/api/consult`), criando divergência entre “política de roteamento” e “superfícies realmente implementadas”.

### 3.6 Libs/scripts/testes que ancoram o domínio B2B
- **Libs de auth B2B (Operator):**
  - [operator-guard.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/auth/operator-guard.ts)
  - [operator-jwt.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/auth/operator-jwt.ts)
  - [operator-session.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/auth/operator-session.ts)
  - [operator-sessions.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/auth/operator-sessions.ts)
  - [operator-mfa.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/auth/operator-mfa.ts)
  - [operator-totp.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/auth/operator-totp.ts)
- **DB/actions B2B (Client/Reading/Consultation):** [src/lib/db](file:///home/skynet/cabala-dos-caminhos/src/lib/db) (ex.: [client-actions.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/db/client-actions.ts))
- **Mesa Real/Lenormand:** [src/lib/lenormand](file:///home/skynet/cabala-dos-caminhos/src/lib/lenormand) (ex.: [mesa-real.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/lenormand/mesa-real.ts))
- **PDF (Mesa Real):** [dossier-pdf.ts](file:///home/skynet/cabala-dos-caminhos/src/lib/pdf/dossier-pdf.ts)
- **Scripts (B2B):**
  - [find-operators.ts](file:///home/skynet/cabala-dos-caminhos/scripts/find-operators.ts)
- **Testes B2B (Operator):**
  - [tests/api/operator-auth.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/operator-auth.test.ts)
  - [tests/api/operator-auth-lockout.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/operator-auth-lockout.test.ts)
  - [tests/api/operator-auth-forgot-password.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/operator-auth-forgot-password.test.ts)
  - [tests/api/operator-auth-reset-password.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/operator-auth-reset-password.test.ts)
  - [tests/api/operator-auth-mfa.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/operator-auth-mfa.test.ts)
  - [tests/api/operator-auth-misc.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/operator-auth-misc.test.ts)
  - [tests/api/operator-auth-sessions.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/operator-auth-sessions.test.ts)
  - [tests/api/operator-auth-sessions-list.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/operator-auth-sessions-list.test.ts)
  - [tests/lib/auth/operator-guard.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/lib/auth/operator-guard.test.ts)
  - [tests/lib/auth/operator-jwt.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/lib/auth/operator-jwt.test.ts)
  - [tests/lib/auth/operator-mfa.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/lib/auth/operator-mfa.test.ts)
  - [tests/lib/auth/operator-session.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/lib/auth/operator-session.test.ts)
  - [tests/lib/auth/operator-sessions.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/lib/auth/operator-sessions.test.ts)
  - [tests/lib/auth/operator-totp.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/lib/auth/operator-totp.test.ts)
  - [tests/lib/auth/operator-server-context.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/lib/auth/operator-server-context.test.ts)
- **Testes B2B (Mesa Real):**
  - [tests/api/mesa-real-clients.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/mesa-real-clients.test.ts)
  - [tests/api/mesa-real-clients-crud.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/mesa-real-clients-crud.test.ts)
  - [tests/api/mesa-real-save.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/mesa-real-save.test.ts)
  - [tests/api/mesa-real-generate.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/mesa-real-generate.test.ts)
  - [tests/api/mesa-real-pdf.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/api/mesa-real-pdf.test.ts)
  - [tests/integration/mesa-real-auth.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/integration/mesa-real-auth.test.ts)
  - [tests/lib/lenormand/mesa-real.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/lib/lenormand/mesa-real.test.ts)
  - [tests/lib/mesa-real/mesa-real-duplicate-cards.test.ts](file:///home/skynet/cabala-dos-caminhos/tests/lib/mesa-real/mesa-real-duplicate-cards.test.ts)

---

## 4) Decisão — migração destrutiva (drop/recriar)

### 4.1 Decisão registrada (conforme spec do refactor-akasha-v2)
- A migração será **destrutiva**: alinhar o banco ao núcleo canônico do Doc 04 §1–5, **sem preservar** dados/estruturas do B2B e do B2C legado.
- Implicação: qualquer ambiente persistente precisa ser tratado como “reset” (backup opcional antes do drop, se houver auditoria/forense interna).

### 4.2 Alternativas consideradas
- **Opção A (baseline novo; reset de migrations)**: apagar histórico de migrations e criar um baseline único do novo núcleo (mais simples, coerente com “DB é descartável”).
- **Opção B (migration “drop legado + create canônico”)**: manter histórico e adicionar uma migration que faz drop/rename do legado e cria o canônico (mais complexa e com maior risco de drift, apesar de manter continuidade).

### 4.3 Escolha para este refactor
Escolher **Opção A** como default do projeto (baseline novo), porque:
- o refactor declara “remoção completa do B2B” e “migração destrutiva” como requisito;
- o schema atual tem múltiplos núcleos concorrentes (risco alto de colisões em tabelas como `users`/`birth_charts`/`chat_messages`), o que torna “drop controlado” mais frágil que “recriar do zero”.

### 4.4 Critérios de sucesso (verificáveis)
- Em DB vazio, `prisma migrate deploy` cria apenas as tabelas do núcleo Doc 04 §1–5 (e os artefatos necessários de pgvector conforme MIGRATIONS).
- Não existe nenhuma tabela B2B (`operators`, `clients`, `readings`, `reports` etc.) nem tabelas do B2C legado (ex.: `mapa_natal`, `creditos`, `orixas`).

---

## 5) Lista objetiva de gaps (para refactor-akasha-v2)

### Prioridade P0 (bloqueia consistência do modelo)
- Unificar para **um** conjunto canônico B2C conforme Doc 04 §1–5 (ou atualizar o Doc 04 para refletir o schema real).
- Resolver a coexistência de `User` (PT-BR) vs `AkashaUser` vs `User` do Doc 04, e seus `@@map("users")`/`@@map("akasha_users")`.
- Resolver duplicidade/conflito de `BirthChart` (graphics/storage) vs `AkashaBirthChart` vs `BirthChart` do Doc 04.
- Resolver colisão conceitual de `ChatMessage` B2B (tabela `chat_messages`) vs `AkashaChatMessage` (tabela `akasha_chat_messages`) vs Doc 04.

### Prioridade P1 (contratos e migração)
- Ajustar `GrimoireEntry` para bater com Doc 04 (ou atualizar Doc 04): `@@map`, obrigatoriedade de `metadata/sourcePath`, política de timestamps, embedding.
- Renomear/remapear `AkashaSubscription/CreditEntry/Manifesto/DailyReading/RitualCompletion/Consultation/ChatMessage` para os nomes do Doc 04 (sem prefixo) e tabelas canônicas (sem `akasha_*`), se a intenção do refactor for “Akasha v2 = Doc 04”.

### Prioridade P2 (superfícies B2B)
- Remover rotas `/api/operator/*` e `/api/admin/operators/*` (qualquer chamada vira 404).
- Remover Mesa Real do repo executável: libs `src/lib/lenormand/*`, PDF de dossiê, e testes `tests/**/mesa-real-*`.

---
