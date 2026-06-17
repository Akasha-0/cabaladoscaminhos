# Documento 03 - Arquitetura Tecnica

> Fonte canonica da arquitetura tecnica do Akasha.
> A visao de produto vem de `docs/25_visao-akasha.md`.

## 1. Objetivo

A arquitetura do projeto separa calculo deterministico, sintese Akasha, experiencia de produto, mentor e base curada de conhecimento, mantendo o monorepo navegavel e com contratos claros entre pacotes.

## 2. Estrutura Canonica do Monorepo

```text
.
|-- apps/
|   `-- akasha-portal/     # app principal, rotas, UI, APIs e PWA
|-- packages/
|   |-- akasha-core/       # sintese Akasha, correlacoes e recomendacoes
|   |-- core-astrology/    # astrologia e transitos
|   |-- core-cabala/       # numerologia cabalistica
|   |-- core-iching/       # hexagramas, asas e praticas
|   |-- core-odus/         # Odu de nascimento e correlacoes
|   |-- core-tantra/       # corpos e dinamicas tantricas
|   |-- mentor/            # mentor, RAG, chat e memoria
|   |-- akasha-cli/        # interface de linha de comando
|   `-- types/             # tipos compartilhados do workspace
|-- grimoire/              # corpus curado e materiais simbolicos
|-- docs/                  # documentacao canonica
`-- .autonomous/           # trilha research-first e design de sintese
```

## 3. Camadas de Responsabilidade

### 3.1 Motores Deterministicos

- `packages/core-*` concentram calculo e contratos de dominio por tradicao.
- Esses pacotes nao devem depender de UI, rotas HTTP ou detalhes de armazenamento do app.
- O papel deles e receber entrada estruturada e devolver resultados confiaveis para consumo do restante do sistema.

### 3.2 Sintese Akasha

- `packages/akasha-core` cruza as saidas dos pilares e produz correlacoes, perfis, rituais e recomendacoes.
- A sintese deve respeitar a visao de 5 pilares e a experiencia unificada descrita em `docs/25_visao-akasha.md`.
- O contrato navegavel da sintese fica em `docs/` e seus resumos de pesquisa ficam em `docs/pesquisa/`.

#### Contrato de Sintese

- O motor de sintese recebe cinco pilares como entrada e devolve uma leitura unificada, nao listas paralelas por tradicao.
- Cada narrativa relevante deve responder tres perguntas: quem e a pessoa, por que esse padrao importa e qual a proxima acao pratica.
- O pipeline nao deve truncar conteudo curado que carrega profundidade interpretativa; a sintese precisa preservar contexto antes de resumir.
- As saidas estruturais duraveis da sintese sao: perfil Akasha, narrativas por area de vida e decisao diaria acionavel.

### 3.3 Produto e Interfaces

- `apps/akasha-portal` hospeda as rotas do produto, a interface de mandala, o onboarding, dashboard, manifesto, diario, oraculo e fluxo de pagamento.
- O app orquestra os pacotes do workspace e integra infraestrutura como autenticacao, persistencia, pagamentos e push.

### 3.4 Mentor e Conhecimento Curado

- `packages/mentor` implementa chat, memoria, RAG e adaptadores de LLM.
- `grimoire/` e a base curada de conteudo simbolico e ritualistico.
- O mentor redige e sintetiza, mas a base curada continua sendo a ancora de conhecimento do sistema.

## 4. Componentes Operacionais

- Aplicacao web e PWA: `apps/akasha-portal`
- Persistencia principal: PostgreSQL via Prisma
- Busca e enriquecimento: RAG em `packages/mentor`
- Pagamentos: Stripe
- Push e engajamento: rotas do portal + service worker do app
- Conteudo ritualistico e simbolico: `grimoire/`

## 5. Principios Arquiteturais

- Fonte unica por responsabilidade: cada pacote deve ter escopo nitido.
- Sintese acima de listagem: o produto nao deve apresentar os pilares como cinco apps separados.
- Pesquisa separada de implementacao: `docs/` registra o contrato estabilizado e `.autonomous/` guarda a trilha research-first quando ela ainda for necessaria.
- Documentacao canonica curta: `docs/` concentra a referencia humana duravel, incluindo a camada de ponte em `docs/pesquisa/`.
- Tipos compartilhados em pacote explicito: `packages/types` evita duplicacao casual de contratos.

## 6. Relacao Com a Visao

A arquitetura existe para suportar quatro saidas de produto:

1. Mandala pessoal
2. Mandato diario
3. Mentor com base citada
4. Leitura sintetica acionavel

Se uma decisao tecnica enfraquecer essa experiencia unificada, ela conflita com a arquitetura desejada.

## 7. Verificacao

```bash
pnpm typecheck
pnpm test:run
pnpm lint
pnpm quality
```
