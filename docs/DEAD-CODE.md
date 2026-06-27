# 🪦 Dead Code Snapshot

> Snapshot criado em 2026-06-27 (UTC) pelo ciclo perpétuo v2
> Identificação read-only de código potencialmente morto

## ⚠️ Contexto

A visão do projeto pivotou de **B2B Cockpit Oracular** (com `clientes`, `mesa-real`, `oraculo`, `calendario`) para **comunidade universalista**. Os arquivos abaixo podem estar parcialmente orfanados — análise via grep necessário para confirmar.

## Áreas suspeitas

### 1. `src/app/(personal)/dashboard/clientes/`

- **Arquivo**: `page.tsx` (365 linhas)
- **Risco**: ALTO
- **Razão**: "Clientes" era conceito B2B (Zelador gerenciando consulentes). Nova visão é peer-to-peer community, sem "clientes".
- **Ação**: Verificar se ainda é referenciado em:
  - Sidebar/navigation
  - Links de outros componentes
  - Server actions
- **Recomendação**: P1 — confirmar uso e migrar lógica de "clientes" para "conexões/grupos" ou arquivar.

### 2. `src/app/(personal)/dashboard/oraculo/`

- **Arquivo**: `page.tsx` (70 linhas) + componente `AIOracleChat`
- **Risco**: MÉDIO
- **Razão**: Chat de IA já está planejado como feature de "Akasha IA" na nova visão. Pode estar duplicado com futura implementação.
- **Ação**: Verificar se `AIOracleChat` será o backbone do chat MVP ou se vai ser substituído.
- **Recomendação**: P2 — preservar como prova de conceito até Akasha IA MVP ser implementada.

### 3. `src/app/(personal)/dashboard/mesa-real/`

- **Pasta**: caminho completo (não listado)
- **Risco**: ALTO
- **Razão**: "Mesa Real" é prática pessoal do operador (não feature de comunidade). Provavelmente não pertence ao produto comunidade.
- **Ação**: Verificar se ainda é parte do roadmap comunidade ou se é mantida por nostalgia pessoal.
- **Recomendação**: P0 — mover para `archive/` ou repositório separado se for pessoal.

### 4. `src/app/(personal)/dashboard/calendario/`

- **Pasta**: caminho completo (não listado)
- **Risco**: MÉDIO
- **Razão**: Calendário pode estar relacionado a "agendamento de consultas" B2B.
- **Ação**: Verificar funcionalidade e se pode ser reaproveitado como "eventos da comunidade".
- **Recomendação**: P1 — investigar.

### 5. Componentes em `src/components/dashboard/`

- **Risco**: MÉDIO
- **Razão**: Alguns componentes B2B (ClientCard, ReadingHistory, etc) podem ter perdido propósito.
- **Ação**: Verificar quais são usados na nova visão (comunidade tem `CommunityNav`, `PostCard`, `GroupCard`, etc).
- **Recomendação**: P2 — auditoria focada pós-migração.

## Schema Prisma

### Modelos B2B potencialmente mortos

- `Operator` — era o Zelador/empresa. Provavelmente morto na nova visão (peer-to-peer).
- `Client` — era o consulente. Agora seria `User` apenas.
- `Reading` — leituras oraculares individuais. Não pertence a comunidade.
- `Report` — relatórios do operador. B2B.
- `Assinatura` — assinatura SaaS. B2B.
- `Credito` / `TransacaoCredito` — sistema de créditos. B2B.
- `Empresa` — multi-tenancy. B2B.
- `Reminder` — lembretes individuais. Manter?
- `BirthChart` — mapa astral individual. Manter (Akasha IA precisa).
- `SynastryResult` — sinastria. B2B (era relatorio pago).
- `LeituraHistorico` — histórico de leituras. B2B.

**Recomendação:** P0 — marcar como DEPRECATED no schema, manter no banco até migração validada. Não remover fisicamente ainda.

## Constantes / Lib

### `src/lib/constants/lenormand-cards.ts`

- **Risco**: MÉDIO
- **Razão**: Decisão de 2026-06-04 foi usar **baralho Cigano**, NÃO Lenormand. Cartas 28 e 29 devem ser renomeadas (28=O Cigano, 29=A Cigana no Cigano).
- **Ação**: Renomear arquivo para `cartas-ciganas.ts` ou criar alias.
- **Recomendação**: P1 — corrigir nomenclatura.

## Próximos passos

- [ ] **P0**: Investigar `mesa-real/` e confirmar se é pessoal ou produto
- [ ] **P0**: Marcar modelos B2B no Prisma como `@@deprecated` (não deletar)
- [ ] **P1**: Auditar referências a `clientes/` e decidir destino
- [ ] **P1**: Renomear `lenormand-cards.ts` → `cartas-ciganas.ts`
- [ ] **P2**: Auditar componentes em `src/components/dashboard/`
- [ ] **P3**: Estatísticas de imports para encontrar dead code definitivo (`madge` ou `ts-prune`)

## Ferramentas recomendadas

- `ts-prune` — encontra exports não usados
- `knip` — análise de deps + dead code
- `madge` — grafo de dependências
- `next-bundle-analyzer` — tamanho do bundle
