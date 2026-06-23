# Schema Migration Proposal: D-045-Caminhada-Jogo-Oraculo-MandalaSnapshot

> **Status**: PROPOSAL ONLY — awaiting human approval.
> **Origem**: sessão de `/grilling` + `/domain-modeling` em 2026-06-22
> (9 decisões cristalizadas, registradas abaixo).
> **Mandato**: alinha com `CONTEXT.md` §Mandala, §Jogo, §Oráculo, §Caminhada.
> **Escopo**: 6 modelos novos (Caminhante, Caminhada, Jogo, Oraculo,
> OraculoInterpretacao, MandalaSnapshot) + enum `TipoJogo` + enum
> `StatusCaminhada` + enum `MetodoOraculo` + enum `MomentoSnapshot`.
> **Migration rule (prisma/AGENTS.md §Work Guidance)**:
> PROPOSAL ONLY. Humano revisa + aplica `pnpm exec prisma migrate dev --name 045`
> manualmente após aprovação. **Nada** deste doc é aplicado automaticamente.

---

## 1. Decisões cristalizadas (sessão 2026-06-22, `/grilling` + `/domain-modeling`)

| # | Pergunta | Decisão | Por quê |
|---|---|---|---|
| Q1 | Forma do oráculo no schema | `Oraculo` separado, FK → `Jogo` | §Oráculo: "Pode haver mais de um Oráculo no mesmo Jogo" → 1:N natural. |
| Q2 | Ownership do `Oraculo` | `jogoId` FK obrigatória + `caminhadaId` desnormalizado indexado | §Oráculo define Oráculo pelo contexto do Jogo. Cross-jogo queries via `(caminhadaId, metodo, lancadoEm)`. |
| Q3 | `Oraculo` modela cast ou também synthesis? | Cast em `Oraculo`; interpretação em `OraculoInterpretacao` (1:N) | §Oráculo: "lançado pelo Zelador" e "interpretado pelo Mentor" são eventos distintos em actors e tempos. Append-only na interpretação casa com tradição universalista. |
| Q4 | `MandalaSnapshot` antes ou depois do Jogo? | **Ambos**: `pre` (lente para interpretação) + `post` (resultado do refinamento) | §Mandato: "Refinador da Mandala". Sem comparar pre vs post, o loop não mede se refinou ou regrediu. |
| Q5 | `Caminhante` global ou per-Zelador? | **Per-Zelador** com `zeladorId` FK | §Caminhada: "a relação que entre eles se tece". LGPD: consentimento é ao Zelador, não ao sistema. |
| Q6 | `Jogo` único gordo ou polimorfismo? | **Único gordo** + discriminated union no app-layer | Campos obrigatórios por tipo são poucos (3-4); polimorfismo Prisma vira 5 JOINs. Pilar 4 ethics já é app-layer. |
| Q7 | Diferença comportamental entre `aberta` e `em_encerramento`? | **Puramente narrativa**; única restrição: `encerrada` exige `motivoEncerramento` + `encerradaEm` | §Status: "simplicidade é proposital... tradição universalista descobre, não categoriza rigidamente". |
| Q8 | Onde vivem os campos da anamnese mínima? | **Split**: `Caminhante` (pessoa + consents imutáveis) + `Caminhada` (anamnese volátil) | LGPD: sujeito dos dados é o Caminhante. Identidade vs contexto. |
| Q9 | Quando mesmo Caminhante retorna para nova Caminhada? | Mesmo `Caminhante`, nova `Caminhada`, `caminhadaAnteriorId?` FK opcional | Continuidade simbólica honrada sem herança de dados. Loop mede retenção. |

---

## 2. Schema Diff (Prisma)

```prisma
// === ENUMS (canônicos conforme CONTEXT.md) ===

enum TipoJogo {
  Apresentacao       // §Apresentação: anamnese completa, consentimentos, snapshot inaugural
  Leitura            // §Leitura: oráculo sorteado, síntese, diário
  Ritual             // §Ritual: diário do rito, elementos usados
  Aconselhamento     // §Aconselhamento: diário, encaminhamentos
  Integracao         // §Integração: diário, ancoragem somática, encaminhamentos
}

enum StatusCaminhada {
  aberta
  em_encerramento
  encerrada
}

enum MetodoOraculo {
  Alafia             // polaridade 0-4 búzios abertos
  Odus               // 16 Odus (Búzios / Merindilogun)
  BaralhoCigano      // 36 cartas
  IChing             // hexagrama King Wen (1-64)
}

enum MomentoSnapshot {
  pre                // estado no momento da abertura do Jogo (lente para interpretação)
  post               // estado ao final do Jogo (resultado do refinamento)
}

// === MODELS ===

// Q5: Caminhante per-Zelador. Q8: pessoa + consents imutáveis (LGPD by design).
model Caminhante {
  id                  String    @id @default(cuid())
  zeladorId           String    // FK → User.id (que é o Zelador). Q5.
  nome                String    // como prefere ser chamado
  nomeCompleto        String?
  contato             String?
  dataNascimento      DateTime
  horaNascimento      String?   // "HH:mm" ou null (CONTEXT.md aceita "desconhecida")
  localNascimento     String    // "cidade, estado, país"
  saudeRelevante      String?   // crítico para Integração Ayahuasca
  caminhadaEspiritualPrevia String?  // tradição, linha, mestre anterior
  observacoes         String?   // markdown livre

  // === LGPD-by-design (Q8: consents imutáveis pertencem à pessoa) ===
  // Revogação aqui cascateia: bloqueia abertura de novas Caminhadas.
  // Caminhadas existentes com motivo legítimo permanecem até `encerradaEm`.
  consentimentoPilar4 ConsentimentoPilar4
  consentimentoLGPD   ConsentimentoLGPD

  criadoEm            DateTime  @default(now())
  atualizadoEm        DateTime  @updatedAt

  caminhadas          Caminhada[]

  @@index([zeladorId, nome])
  @@map("caminhantes")
}

// Embedded types (Prisma não suporta nativamente; modelar como scalars
// ou usar JSON. Para LGPD-clarity, preferir scalars nomeados).
type ConsentimentoPilar4 {
  consentiuEm         DateTime
  revogadoEm          DateTime?
}

type ConsentimentoLGPD {
  consentiuEm         DateTime
  finalidade          String    // texto livre: "atendimento espiritual via Mandala"
}

// Q8: relação duradoura. Anamnese rica + intenção + status.
model Caminhada {
  id                  String    @id @default(cuid())
  zeladorId           String    // FK → User.id (denormalizado para index-friendly)
  caminhanteId        String    // FK → Caminhante.id

  // Q9: retorno do mesmo Caminhante cria nova Caminhada com linkage opcional.
  caminhadaAnteriorId String?   // FK → Caminhada.id (self-relation, opcional)

  // === §Intenção de Longo Prazo ===
  // "Não muda ao longo da Caminhada" (CONTEXT.md). Capturada no Apresentação.
  intencaoInicial     String

  // §Ethics Invariant do Pilar 4 (CONTEXT.md). Prova da linhagem na relação.
  zeladorLinhagem     String    // linha/terreiro do Zelador no momento da abertura
  pilar4Consentimento ConsentimentoPilar4  // consentimento do Caminhante PARA ESTA Caminhada

  // §Status da Caminhada (enum de 3 estados)
  status              StatusCaminhada  @default(aberta)
  motivoEncerramento  String?          // obrigatório se status == encerrada
  encerradaEm         DateTime?        // obrigatório se status == encerrada

  criadoEm            DateTime  @default(now())
  atualizadoEm        DateTime  @updatedAt

  // Q8: anamnese volátil da relação (vs identidade em Caminhante)
  anamnese Json?       // snapshot da anamnese rica — campos opcionais (saúde, espiritual prévia)

  caminhante          Caminhante @relation(fields: [caminhanteId], references: [id], onDelete: Restrict)
  caminhadaAnterior   Caminhada? @relation("CaminhadaParaCaminhada", fields: [caminhadaAnteriorId], references: [id])
  caminhadasPosteriores Caminhada[] @relation("CaminhadaParaCaminhada")
  jogos               Jogo[]

  @@index([zeladorId, status])
  @@index([caminhanteId, criadoEm])
  @@map("caminhadas")
}

// Q6: tabela gorda + discriminated union no app-layer por `tipo`.
model Jogo {
  id                  String    @id @default(cuid())
  zeladorId           String    // FK → User.id (denormalizado)
  caminhadaId         String    // FK → Caminhada.id
  tipo                TipoJogo

  // === Campos por tipo (Q6: nullable; app-layer discrimina) ===
  // Apresentacao: anamneseCompleta obrigatório (mas já vive em Caminhada.anamnese)
  //               → aqui só carimbo de captura
  // Leitura: oraculos via relation (1:N)
  // Ritual: elementosUsados obrigatório
  // Aconselhamento: encaminhamentos obrigatório
  // Integracao: ancoragemSomatica obrigatório

  // §Apresentação: registro imutável do que foi declarado naquele momento
  // (auditável se consentimento for revogado depois)
  apresentacaoConsentimentosEm DateTime?
  apresentacaoIntencaoInicial  String?  // carimbo do que foi dito na Apresentação

  // §Ritual
  elementosUsados     Json?     // lista estruturada (material, ferramentas, oferendas)

  // §Integração
  ancoragemSomatica   Json?     // corpo, sensação, localização, intensidade

  // §Aconselhamento + §Integração (compartilhado)
  encaminhamentos     Json?     // lista de ações recomendadas

  // Comum a todos: diário livre do Zelador
  diario              String?

  // §Tipo de Jogo: "Todo Jogo tem exatamente um tipo" (CONTEXT.md)
  criadoEm            DateTime  @default(now())
  encerradoEm         DateTime?

  caminhada           Caminhada @relation(fields: [caminhadaId], references: [id], onDelete: Restrict)
  oraculos            Oraculo[]
  snapshots           MandalaSnapshot[]

  @@index([caminhadaId, criadoEm])
  @@index([zeladorId, tipo, criadoEm])
  @@map("jogos")
}

// Q1+Q2: cast do Oráculo. FK ao Jogo + denormalização indexada.
model Oraculo {
  id                  String    @id @default(cuid())
  jogoId              String    // FK obrigatória (Q2)
  zeladorId           String    // FK → User.id (denormalizado)
  caminhadaId         String    // FK → Caminhada.id (Q2: denormalizado + indexado)

  metodo              MetodoOraculo

  // §Oráculo: payload por método. App-layer valida shape (Pilar 4 ethics app-layer).
  // - Alafia: { polaridade: 0-4, buziosAbertos: number }
  // - Odus: { oduId: 1-16, buzios: number[] }
  // - BaralhoCigano: { cartaId: 1-36, orientacao: 'normal'|'invertida' }
  // - IChing: { hexagrama: 1-64, linhas: number[6] (0=mudança, 6/7/8/9=estável) }
  payload             Json

  // §Oráculo: "lançado pelo Zelador (não pela IA)"
  lancadoPorId        String    // FK → User.id (Zelador que sorteou)
  lancadoEm           DateTime  @default(now())

  jogo                Jogo      @relation(fields: [jogoId], references: [id], onDelete: Restrict)
  interpretacoes      OraculoInterpretacao[]

  @@index([caminhadaId, metodo, lancadoEm])   // Q2: cross-jogo queries
  @@index([jogoId, metodo])
  @@map("oraculos")
}

// Q3: interpretação do Mentor (e iteração do Zelador). Append-only.
model OraculoInterpretacao {
  id                  String    @id @default(cuid())
  oraculoId           String    // FK → Oraculo.id

  autor               String    // 'mentor' | 'zelador' (app-layer enum)
  texto               String

  // Contexto da síntese
  mandalaSnapshotId   String?   // FK → MandalaSnapshot.id (qual Mandala foi a lente)
  versaoMentor        String?   // ex.: 'gpt-4o-2024-08' / 'claude-3-5-sonnet'
  citacoesPilares     Json?     // quais Pilares foram cruzados (1-5)

  geradoEm            DateTime  @default(now())

  oraculo             Oraculo   @relation(fields: [oraculoId], references: [id], onDelete: Restrict)

  @@index([oraculoId, geradoEm])
  @@map("oraculo_interpretacoes")
}

// Q4: snapshot da Mandala Viva. Sempre `pre` e `post` por Jogo (§Mandato).
model MandalaSnapshot {
  id                  String    @id @default(cuid())
  jogoId              String    // FK → Jogo.id (1:1 com momento)
  zeladorId           String    // FK → User.id (denormalizado)
  caminhadaId         String    // FK → Caminhada.id (denormalizado)
  momento             MomentoSnapshot

  // §Mandala: 4 elementos canônicos (CONTEXT.md §Mandala)
  akashaType          Int       // 1-9
  caminhoVida         Int       // 1-9 (mestre 11/22/33 em campo separado)
  caminhoMestre       Int?      // 11 | 22 | 33 (null se não é mestre)
  mandalaSetores      Json      // 9 dimensões de vida com intensidade (0-100)
  autoridade          String    // modo de decisão (enum app-layer)

  // Metadados do refinamento
  fontes              Json?     // quais regras de tradução produziram este snapshot
  versaoRefinador     String?   // versão do `synthesis-engine` que gerou
  geradoEm            DateTime  @default(now())

  jogo                Jogo      @relation(fields: [jogoId], references: [id], onDelete: Restrict)

  @@unique([jogoId, momento])  // garante 1 pre + 1 post por Jogo (Q4)
  @@index([caminhadaId, geradoEm])
  @@map("mandala_snapshots")
}
```

---

## 3. Decisões NÃO cobertas por este schema (ficam no app-layer)

Conforme `prisma/AGENTS.md` §Pilar 4 + LGPD:

- **Pilar 4 ethics invariant** (consentimento + terreiro/linhagem): validado em
  `Mentor hook` + API routes. DB apenas guarda consentimentos como dados.
- **Discriminated union por `Jogo.tipo`**: implementação via Zod schemas no
  app-layer (`zod.discriminatedUnion('tipo', [jogoApresentacaoSchema, ...])`).
  DB aceita campos nullable; app-layer rejeita Leitura sem Oraculo, Integração
  sem AncoragemSomatica, etc.
- **Enum `OraculoInterpretacao.autor`**: 'mentor' | 'zelador' é enum app-layer
  (Prisma aceita String + check no app-layer para não bloquear iteração).
- **Mandala 4-elementos shape validation**: `mandalaSetores` Json validado em
  zod (9 chaves, cada 0-100).
- **Apresentação uniqueness**: enforce app-layer — só pode haver 1 Jogo de
  Apresentação por Caminhada (a Apresentação ABRE a Caminhada, então
  conceitualmente elas nascem juntas; ordem: criar Apresentação + Caminhada
  em transaction atômica).
- **LGPD revogação**: `consentimentoLGPD.revogadoEm` quando setado, app-layer
  bloqueia abertura de novas Caminhadas para aquele Caminhante.
- **Mandala `pre` snapshot da Apresentação**: é o snapshot inaugural (§Mandala
  Viva). Como Apresentação + Caminhada nascem juntas, o `pre` da Apresentação
  é o snapshot da Mandala constitucional (sem Jogos anteriores).

---

## 4. Justification

### 4.1 Por que 6 modelos novos (e não estender `User`)

`User` (modelo atual) é o operador do sistema, com `birthChart`, `subscription`,
`manifesto`, etc. Misturar operador e pessoa-atendida viola §Caminhante
("Não tem login") e §Caminhada ("a relação que entre eles se tece"). A
separação também prepara o terreno para multi-Zelador (um Zelador atende
N Caminhantes, sem duplicar identidade do operador em cada Caminhada).

### 4.2 Por que `Oraculo` separado (e não JSON embutido em `Jogo`)

§Oráculo: "Pode haver mais de um Oráculo no mesmo Jogo (ex.: Aláfia + 16
Odus, padrão de confirmação)". 1:N natural. Cross-jogo queries
("qual Odu mais saiu pro Caminhante X?") são métrica do loop; indexado em
`(caminhadaId, metodo, lancadoEm)`.

### 4.3 Por que `MandalaSnapshot` pre + post (e não só post)

§Mandato do loop: "Refinador da Mandala". A métrica de sucesso é
"especificidade aumenta". Sem comparar pre vs post, o loop não tem como
medir se refinou ou regrediu. Único custo: 2x linhas (aceitável; não é hot
table — Jogos são eventos raros, não streams).

### 4.4 Por que `Caminhante` per-Zelador (e não global)

§Caminhada: "a relação que entre eles se tece". A relação Zelador↔Caminhante
é constitutiva, não acessória. LGPD: consentimento é ao Zelador, não ao
sistema. Se o Caminhante muda de Zelador, simbolicamente está começando nova
Caminhada — não é continuity grátis.

### 4.5 Por que `Jogo` único (e não polimórfico)

Campos obrigatórios por tipo são 3-4 cada; sobreposição é parcial (todos
têm `diario`, vários têm `encaminhamentos`). Polimorfismo Prisma vira 5
JOINs toda vez que listamos últimos Jogos do Caminhante. Tabela gorda +
zod discriminated union é o padrão consistente com "Pilar 4 ethics
app-layer".

---

## 5. Risks

### 5.1 Migration (D2 backward-compat policy)

- **6 modelos novos** são add-only. Zero impacto em modelos existentes.
- **Zero dados existentes** nos novos modelos — começar vazio, popular via
  Apresentação.
- Forward-compat: `Caminhante.zeladorId` aponta para `User.id` existente
  (que é o Zelador). Não precisa migrar `User`.

### 5.2 Application code (downstream)

- `src/lib/application/akasha/synthesis-engine.ts` precisa conhecer o
  novo shape de `MandalaSnapshot.pre` para interpretar Oraculos.
- `src/lib/application/akasha/narrative-generator.ts` precisa ler
  `Jogo.apresentacaoIntencaoInicial` (vs anamnese volátil atual).
- 15 typecheck errors pré-existentes NÃO são causados por este schema
  (verificados via `git checkout HEAD~2 -- .` + `pnpm typecheck`); alguns
  podem ser **endereçados** por este schema (ex.: `hexagramLines` Json em
  `Oraculo.payload` discriminated union por `metodo`).

### 5.3 LGPD

- `consentimentoPilar4` e `consentimentoLGPD` ficam no `Caminhante`
  (pessoa, imutável). Revogação cascateia para bloqueio de novas Caminhadas.
- Caminhadas encerradas antes da revogação: permanecem no histórico com
  anonimização parcial (manter `intencaoInicial` agregada, remover
  `nomeCompleto`, `contato`, `saudeRelevante`).

### 5.4 Performance

- `MandalaSnapshot` cresce ~2x Jogos. Estimativa: 100 Jogos/Caminhada/ano
  → 200 snapshots/Caminhada/ano. Para 1000 Caminhantes ativas = 200k
  rows/ano. Trivial para Postgres; índice `(caminhadaId, geradoEm)`
  cobre queries de história.

### 5.5 Loop coupling

- `synthesis-engine.ts` (canônico, Pilar 5 + Mandala) é quem materializa
  `MandalaSnapshot.pre` na abertura do Jogo e `post` no encerramento.
- Se a estrutura de Mandala 4-elementos mudar no futuro (§Mandala do
  CONTEXT.md é estável, mas versão schema `versaoRefinador` rastreia),
  `mandalaSetores` Json absorve sem migration.

---

## 6. Migration Plan (high-level)

1. **Approval humana** deste PROPOSAL (regra §Work Guidance do prisma/AGENTS.md).
2. Após approval, humano roda manualmente:
   ```bash
   cd apps/akasha-portal
   pnpm exec prisma migrate dev --name 045_caminhada_jogo_oraculo_mandala
   ```
3. **Build pipeline** regenera `@prisma/client` automaticamente.
4. **App-layer** (próximo sprint): implementar zod schemas, ajustar
   `synthesis-engine.ts`, `narrative-generator.ts`, e route handlers.
5. **Seed.ts**: adicionar 1 Caminhante + 1 Caminhada + 1 Jogo de Apresentação
   + 1 MandalaSnapshot pre para dev (idempotente).
6. **Documentar** no `apps/akasha-portal/prisma/AGENTS.md` §Schema invariants
   que os novos modelos existem e seus invariants.

---

## 7. Rollback Plan

- **Reverter** o commit da migration (`git revert HEAD -- schema.prisma migrations/`).
- **Re-rodar** `pnpm db:generate` para regenerar client.
- **App-layer**: código que referencia os novos modelos para de funcionar;
  feature flag `ENABLE_CAMINHADAS_V2` (a adicionar) permite desligar
  rotas novas sem remover tabelas.
- **Dados**: como tabelas são novas e vazias, rollback é instantâneo.

---

## 8. Open Questions (próximas iterações)

Estes NÃO estão neste proposal — ficam como follow-ups:

- **D-046+**: schema do `Oraculo.payload` discriminated union por `metodo`
  (zod schemas no app-layer; aqui é Json livre).
- **D-046+**: Mandala 4-elementos shape detail (9 chaves exatas de
  `mandalaSetores`, valores válidos de `autoridade`).
- **D-047+**: enum `Apresentacao` uniqueness enforcement (1 Apresentação
  por Caminhada — garantir via transaction atômica na criação).
- **D-048+**: LGPD `consentimentoLGPD.revogadoEm` cascata — quais
  campos do `Caminhante` anonimizar? Política de retenção de
  `Caminhada` encerrada após revogação.
- **D-049+**: Migração de dados existentes em `User.birthChart` para
  o novo modelo (se houver dados de Caminhada/Jogo implícitos).

---

## 9. Glossário cross-reference

Termos do schema referenciados em `CONTEXT.md`:

- **Caminhante**: §Caminhante (linhas 10-11).
- **Caminhada**: §Caminhada (linha 34) + §Status (linhas 37-43).
- **Jogo** + **Tipo de Jogo**: §Jogo (linha 13) + §Tipo (linhas 16-24).
- **Oráculo**: §Oráculo (linhas 62-66).
- **Sistema Oracular v1** (MetodoOraculo enum): §Mandato §Não faz
  (linha 91) — Aláfia, 16 Odus, Baralho Cigano, I Ching Oracular.
- **Mandala Viva** (MandalaSnapshot): §Mandala Viva (linha 47) +
  §Mandala (4 elementos, linha 57).
- **Ethics Invariant do Pilar 4**: §Ethics (linha 49).

---

## 10. Acceptance Checklist (para o humano revisor)

- [ ] Confirmar que os 9 decisões cristalizadas refletem a tradição
      universalista do Zelador (não foram invenções do loop).
- [ ] Validar que `User.id` é o Zelador (sem migration de identidade).
- [ ] Validar backward-compat policy (D2) — tudo add-only.
- [ ] Validar LGPD-by-design — `consentimentos` na pessoa, anamnese
      na relação, revogação em cascata.
- [ ] Decidir: Apresentação + Caminhada em transaction atômica (D-047
      fica como follow-up OU esta proposal cobre?).
- [ ] Após approval: humano roda `pnpm exec prisma migrate dev --name 045`.
- [ ] Após migration: regenerar `@prisma/client` via build pipeline.
- [ ] Atualizar `apps/akasha-portal/prisma/AGENTS.md` §Schema invariants
      com os novos modelos.

---

> **Migration rule reminder** (`prisma/AGENTS.md`): **NUNCA** rodar
> `pnpm exec prisma migrate dev` ou `pnpm db:push` sem aprovação humana.
> Este PROPOSAL fica no aguardo. Após approval, humano aplica manualmente.