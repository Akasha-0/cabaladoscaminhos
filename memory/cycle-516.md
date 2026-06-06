# Cycle 516 — Grimório & B2C Database (Fase B)

**Date:** 2026-06-05
**Type:** Feature / Database
**Branch:** claude/docs-refactor-alignment-FOUqN

## Contexto

Este ciclo representa a conclusão da **Fase B — Grimório & pgvector** do blueprint do **Sistema Akasha**. O objetivo foi preparar o banco de dados PostgreSQL com as extensões vetoriais, registrar os modelos de dados B2C (AkashaUser e GrimoireEntry) no schema Prisma, e construir a estrutura do Grimório Digital com os primeiros 16 arquivos Markdown de Odus e seus scripts/webhooks de sincronização vetorial (RAG).

## Mudanças

### Prisma Schema & Database (pgvector)
* **pgvector Extension**: Ativada a extensão `postgresqlExtensions` no client generator do Prisma, registrando `pgvector` no datasource do Postgres.
* **`AkashaUser` Model**: Criado o modelo de usuário B2C, otimizado para persistência de dados de nascimento geolocalizados, consentimento explícito LGPD, cache de mapas astrológicos/cabala/tantra/odus, credenciais, e saldo de créditos.
* **`GrimoireEntry` Model**: Criado o modelo contendo id, categoria, metadados, conteúdo e vetor de embedding de 768 dimensões (`Unsupported("vector(768)")`).
* **Database Alignment**: Executado `prisma db push --force-reset` no banco de dados hospedado no Supabase, aplicando todas as alterações do schema com sucesso.

### Grimório & Odus
* **Estrutura**: Criado o diretório `grimoire/` com subdiretórios `botanica/`, `vibracional/`, `ancestral/` e `diagnostico/`.
* **Conteúdo**: Gerados os 16 arquivos Markdown correspondentes aos 16 Odus baseados inteiramente no ledger canônico esotérico de `IDEIA.md`.
* **Sync Helper**: Desenvolvido `src/lib/grimoire/sync.ts` para ler os Markdowns, extrair frontmatter YAML, gerar embeddings (via Ollama `nomic-embed-text` com fallback para `null` caso offline) e persistir usando upsert SQL bruto para vetor no banco de dados.
* **CLI script**: `npm run grimoire:sync` adicionado ao `package.json` carregando dotenv.
* **Webhook de Sincronização**: Criada a rota de API admin `POST /api/admin/webhooks/grimoire-sync` permitindo acionamento por portadores do token ou operador `ADMIN`.

## Validação

* `npx tsc --noEmit` → **0 erros**
* `npm run test:run` → **8784 testes passando** (29 skipped) - incluindo testes do webhook e do sincronizador do grimório.
* `npm run build` → Next.js build de produção concluído com sucesso.

## Lições

* **Integração de pgvector com Prisma**: Usar `Unsupported("vector(dim)")` em conjunto com `$executeRaw` permite manter o Prisma como ORM principal sem perder a velocidade e praticidade de salvar e consultar embeddings diretamente na base PostgreSQL.
* **Resiliência a Falhas de LLM Local em CI/CD**: O sincronizador de RAG local deve sempre prever que serviços de embedding (como Ollama) possam estar indisponíveis fora do ambiente local, fornecendo degradação suave e fallback seguro para continuar executando sem quebras catastróficas.
