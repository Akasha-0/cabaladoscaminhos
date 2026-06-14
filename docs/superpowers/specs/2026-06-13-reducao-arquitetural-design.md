# Spec — Reducao Arquitetural e Consolidacao de Documentacao

Data: 2026-06-13
Status: Draft para revisao

## Objetivo

Melhorar a arquitetura do projeto para uma estrutura mais limpa, funcional e
com menos volume estrutural, sem alterar comportamento, contratos externos ou
funcionalidades do sistema.

O foco desta mudanca e:

- reduzir duplicacao de codigo, arquivos e pastas;
- tornar as fronteiras entre app, packages, conhecimento e operacao mais claras;
- reaproveitar melhor componentes, utilitarios e contratos existentes;
- consolidar documentacao duravel em `docs/`;
- atualizar a documentacao arquitetural para refletir o estado real do monorepo.

## Criterios de sucesso

- Nenhuma funcionalidade do produto muda.
- Nenhum contrato externo muda sem necessidade explicita.
- O numero de arquivos, pastas e linhas cai por remocao de duplicacao e camadas
  sem valor.
- A documentacao duravel fica centralizada em `docs/`.
- A arquitetura resultante fica mais facil de entender e navegar.

## Escopo

### Incluido

- Reorganizacao estrutural de codigo sem mudanca de comportamento.
- Consolidacao de arquivos e pastas redundantes.
- Reducao de wrappers, barrels e utilitarios duplicados.
- Reaproveitamento de componentes e elementos existentes.
- Consolidacao de documentacao em `docs/`.
- Atualizacao dos documentos de arquitetura para o estado atual do projeto.
- Atualizacao da hierarquia DOX quando a nova organizacao alterar fronteiras ou
  contratos duraveis.

### Fora de escopo

- Criar funcionalidades novas.
- Alterar regras de negocio.
- Mudar UX, fluxos de usuario ou contratos de API por iniciativa arquitetural.
- Reescrever motores deterministicos sem necessidade.
- Misturar conteudo-base do produto com documentacao de engenharia.

## Estado atual observado

### Monorepo real

O repositorio ja esta organizado como monorepo `pnpm` + `turborepo`, com eixo
principal em:

- `apps/`
- `packages/`
- `docs/`
- `tests/`
- `grimoire/`
- `.autonomous/`
- `deploy/`
- `scripts/`

### Problemas principais

- `apps/akasha-portal/src/lib` concentra responsabilidades demais e funciona
  como deposito generico.
- Existem sinais de duplicacao de utilitarios e adaptadores, incluindo modulos
  com nomes e responsabilidades muito proximos.
- Ha configuracoes duplicadas ou concorrentes, como arquivos de config do Next.
- Ha acoplamento alto entre `apps/akasha-portal`, `packages/akasha-core` e
  `packages/mentor`.
- A documentacao arquitetural canonica nao reflete integralmente o estado atual
  do repositorio.
- A hierarquia DOX ainda esta incompleta em relacao ao que o `AGENTS.md` raiz
  exige.

## Principios de reorganizacao

- Remover apenas o que for redundante.
- Juntar apenas responsabilidades com o mesmo ciclo de mudanca.
- Subir para `packages/` somente o que for reutilizavel de fato.
- Manter no app apenas codigo especifico do portal.
- Manter `core-*` como motores puros e agnosticos.
- Tratar `docs/` como casa unica da documentacao duravel.
- Preservar runtime, importacao publica e comportamento observavel durante a
  migracao.

## Arquitetura alvo

### Estrutura de topo

```text
/
├── apps/
│   └── akasha-portal/
├── packages/
│   ├── akasha-core/
│   ├── mentor/
│   ├── akasha-cli/
│   ├── types/
│   ├── core-astrology/
│   ├── core-cabala/
│   ├── core-iching/
│   ├── core-odus/
│   └── core-tantra/
├── docs/
│   ├── architecture/
│   ├── adrs/
│   ├── product/
│   ├── operations/
│   ├── research/
│   └── audits/
├── tests/
├── grimoire/
├── scripts/
├── deploy/
└── .github/
```

### Papel de cada area

- `apps/akasha-portal`: composition root do produto, com rotas, paginas, API
  routes, middleware, providers, wiring e componentes de tela.
- `packages/core-*`: calculo puro e deterministico.
- `packages/akasha-core`: orquestracao de dominio entre motores e contratos de
  mais alto nivel.
- `packages/mentor`: sintese, RAG e mecanismos de mentoria, desacoplados de
  ciclos com `akasha-core`.
- `packages/types`: contratos transversais compartilhados.
- `docs/`: documentacao duravel centralizada.
- `tests/`: protecao transversal de comportamento e fronteiras.
- `grimoire/`: base de conhecimento do sistema, distinta de documentacao de
  engenharia.

## Estrutura alvo do portal

`apps/akasha-portal/src/` deve ser reorganizado para poucas zonas claras:

```text
src/
├── app/
├── features/
├── components/
├── server/
├── hooks/
├── providers/
├── styles/
└── types/
```

### Regras

- `app/`: App Router, layouts, pages, route handlers.
- `features/`: organizacao por dominio funcional real, como `mentor`,
  `consulta`, `rituais`, `auth`, `billing`, `dashboard`.
- `components/`: componentes visuais compartilhados.
- `server/`: Prisma, auth, cache, rate limit, integracoes externas e
  composicao local do app.
- `hooks/`, `providers/`, `styles/`, `types/`: apenas o que for exclusivo do
  portal.
- `lib/` deixa de existir como pasta generica. O que for reutilizavel sobe para
  `packages/`; o que for exclusivo desce para uma zona explicita.

## Reducoes previstas

### Codigo

- Unificar utilitarios duplicados, como variantes de `rate-limit`, storages e
  wrappers equivalentes.
- Consolidar tipos compartilhados em uma unica fonte.
- Remover camadas de reexportacao sem valor real.
- Reaproveitar componentes existentes antes de manter variantes paralelas.
- Colapsar modulos pequenos demais quando nao houver fronteira real.

### Pastas e arquivos

- Reduzir subpastas artificiais com 1 arquivo e sem ganho de navegacao.
- Remover estruturas que so existem por historico e nao por responsabilidade.
- Mover apenas o que tenha destino arquitetural claro.

### Documentacao

- Centralizar documentacao duravel em `docs/`.
- Consolidar documentos redundantes por tema, sem perder rastreabilidade.
- Criar um indice claro em `docs/` para navegacao.
- Atualizar documentos canonicos para refletir a estrutura real do repositorio.

## Estrutura alvo da documentacao

```text
docs/
├── architecture/
│   ├── monorepo.md
│   ├── boundaries.md
│   ├── portal.md
│   └── packages.md
├── adrs/
├── product/
├── operations/
├── research/
├── audits/
└── README.md
```

### Regras de consolidacao

- Arquitetura tecnica e convencoes vao para `docs/architecture/`.
- Decisoes formais vao para `docs/adrs/`.
- Fluxos e contexto de produto vao para `docs/product/`.
- Deploy, ambiente, CI/CD e runbooks vao para `docs/operations/`.
- Pesquisa validada e duravel vai para `docs/research/`.
- Relatorios e snapshots de auditoria vao para `docs/audits/`.

### O que nao deve ir para `docs/`

- `deploy/`, `.github/` e `scripts/`, porque sao consumidos por ferramentas.
- `grimoire/`, porque e base de conteudo do produto, nao documentacao tecnica.
- `tests/`, porque e suite executavel.

## Fronteiras e dependencias

- `apps` dependem de `packages`.
- `packages/core-*` nao dependem de `apps`.
- `akasha-core` pode depender de `core-*` e `types`, mas nao deve fechar ciclo
  com `mentor`.
- `mentor` deve consumir contratos estaveis, nao importar de volta o orquestrador
  para obter dependencias que podem ser invertidas.
- `docs`, `.autonomous`, `memory` e `coordination` devem ficar fora do fluxo de
  runtime da aplicacao.

## Ordem recomendada de execucao

1. Inventariar duplicacoes, wrappers sem valor, barrels e estruturas redundantes.
2. Definir mapa de fusao por responsabilidade.
3. Consolidar documentacao em `docs/`.
4. Atualizar documentos arquiteturais canonicos.
5. Reorganizar `apps/akasha-portal/src/` em zonas claras.
6. Mover reutilizacao real para `packages/`.
7. Eliminar ciclos, duplicacoes e configuracoes concorrentes.
8. Atualizar DOX nas fronteiras afetadas.
9. Rodar verificacoes.

## Riscos e mitigacoes

### Riscos

- Fundir arquivos sem respeitar responsabilidade aumenta acoplamento.
- Reduzir pastas de forma cosmetica pode piorar navegacao.
- Consolidar docs sem indice pode esconder contexto historico importante.
- Mover codigo sem criterio claro pode quebrar imports e testes.

### Mitigacoes

- Cada fusao deve ter uma justificativa unica de responsabilidade.
- Cada movimento deve preservar API publica interna ou atualizar os consumidores
  no mesmo passo.
- Documentos consolidados devem manter referencias aos contratos antigos quando
  necessario.
- Testes de arquitetura, typecheck, lint e testes automatizados devem rodar ao
  final das fases relevantes.

## Verificacao

- `pnpm typecheck`
- `pnpm test:run`
- `pnpm lint`
- `pnpm test:run tests/architecture/`

## Resultado esperado

- Menos duplicacao estrutural.
- Menos arquivos e pastas sem responsabilidade clara.
- Menos linhas de codigo por remocao de repeticao e camadas sem valor.
- Melhor reaproveitamento de componentes e contratos.
- Documentacao centralizada e navegavel em `docs/`.
- Arquitetura mais alinhada com o estado real do monorepo.
