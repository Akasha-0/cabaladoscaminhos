# Documento 25 - Visao Akasha

> Norte canonico de produto.
> Em conflito de visao, este documento prevalece sobre os demais documentos operacionais.

## Mudanca de Visao (2026-06-23 — vision realignment)

Ate 2026-06-23, o Akasha era tratado como **produto SaaS para usuario final** (Mandala pessoal + Mandato diario + autoatendimento). Apos sessao de realignment, a visao canonica foi **redefinida**:

**Akasha = ferramenta de trabalho do Zelador** (terapeuta/zelador espiritual) para uso em atendimentos com **consulentes** (pessoas atendidas, sem login proprio). O sistema e um **"livro vivo inteligente"** que o Zelador consulta durante sessoes, com:

- **Grafo de conhecimento** cruzando os 5 Pilares canonicos + Human Design + Gene Keys
- **IA estilo chat** (unica interface, sem dashboards) com persona de **Mestre/Sacerdote/Terapeuta** (chain-of-thought, psicanalise, perguntas socraticas)
- **Cadeia de pensamento** que correlaciona todos os mapas automaticamente (sem o Zelador ter que ler cada mapa)
- **Consultas cirurgicas**: ervas (Ewe), caminhos, prescricoes de acao ("o que fazer agora")
- **Memoria por consulente** (isolamento multi-tenant, RAG isolado por pessoa)
- **Consulente como MCP** (clica no cliente, vira ferramenta pro chat carregar aquela base de conhecimento)

**Publico primario:** Zelador (usuario interno, tu) + consulentes (dados gerenciados pelo Zelador). **Publico secundario** (usuario comum autoatendido) vira secundario ou e descontinuado.

**Influencias teologicas** (ancoras da nova visao): Alexandre Cumino (espiritualidade visceral), Rubens Saraceni e Adriano Camargo (teologia dos Orixas, desmistificacao da esquerda), Cigano Ramiro (guia da linhagem do Zelador — nao persona do sistema). **Nao confundir Mentor com Cigano Ramiro**: o Mentor e Akashico com treinamento teologico dos autores acima.

## 1. Definicao

O Akasha e a **ferramenta de diagnostico integral do Zelador**. `Cabala dos Caminhos` e a matriz, o laboratorio e o monorepo que tornam a ferramenta possivel.

O Akasha nao e a soma de leituras independentes. Ele e uma sintese intencional que transforma **7 sistemas canonicos** (Cabala, Astrologia, Tantra/Ayurveda, Odu, I Ching, Human Design, Gene Keys) em uma experiencia unica, coerente, cirurgica e **orientada a cura/transformation** — nao a descricao de mapa.

## 2. Os 7 Pilares Canonicos (versao revisada)

| Pilar | Sistema | Dominio | Camada SVG |
|-------|---------|---------|-----------|
| 1 | Numerologia Cabalistica | Arvore da Vida, Sefirot, Numeros de vida | Camada 2 |
| 2 | Astrologia Ocidental | Signos, planetas, aspectos | Camada 4 |
| 3 | Numerologia Tantrica + Ayurveda | 11 corpos, koshas, doshas | Camada 3 |
| 4 | Odu de Nascimento (Merindilogun) | Ifa/Candomble, Alafia, preceitos, quizilas | Camada 1 |
| 5 | I Ching | Hexagrama, trigramas | Camada 5 |
| **6** | **Human Design (traduzido)** | **Mapa energetico integrado (nao copia literal)** | **Nova camada** |
| **7** | **Gene Keys (traduzido)** | **Sombra/dom/siddhi (universalist)** | **Nova camada** |

**Pilares 6 e 7 (Human Design + Gene Keys)** sao **traduzidos** (nao copias literais) para alinhamento com a visao universalista. Trade-offs de copyright/licensing serao resolvidos via ADR 0002 (ver secoes 9 e 10).

## 3. O Que o Produto Entrega (revisado)

- **Chat MCP-style** como interface unica (sem dashboards, sem Mandala visual obrigatoria; dados alimentam backend via MCP por consulente).
- **Mentor Akashico evoluido** (chain-of-thought + psicanalise + perguntas socraticas) que integra os 7 Pilares via grafo de conhecimento.
- **Memoria por consulente** (RAG isolado, grimorios pessoais, historico de sessoes).
- **Prescricoes cirurgicas** (ervas Ewe, caminhos de acao, "o que fazer agora") em vez de relatorios descritivos.
- **Interface minima** (estilo ChatGPT/Gemini): input do Zelador + resposta sintetica da IA.

## 4. Principios da Sintese (revisado)

- Sintese **cirurgica**, nao enciclopedica: o Zelador precisa de uma direcao clara, nao de todas as opcoes.
- **Correlacao antes de exibicao**: o grafo de conhecimento faz as conexoes, o Mentor apresenta a tese, nao os dados crus.
- **Acao antes de descricao**: cada sessao de atendimento produz 1-3 proximas acoes concretas.
- **Memoria por consulente** e o que diferencia "atendimento profissional" de "leitura generica".

## 5. Artefatos Centrais (revisado)

### 5.1 Chat MCP por Consulente

A interface central. Cada consulente cadastrado pelo Zelador e um "MCP server" logico: quando o Zelador clica naquele consulente, o chat carrega:
- Dados do consulente (anamnese, 7 Pilares calculados)
- Grimorios pessoais (notas do Zelador, observacoes de sessoes)
- Historico de sessoes anteriores
- Prescricoes previas

### 5.2 Mentor Akashico

Persona da IA: **Akashico universal**, com chain-of-thought, perguntas socraticas, tom de Mestre/Sacerdote/Terapeuta. Influencias teologicas de Cumino/Saraceni/Camargo por tras da voz (nao como persona).

### 5.3 Grafo de Conhecimento

Camada de dados que correlaciona os 7 Pilares automaticamente. Implementacao: **a definir via ADR 0005** (proximo design proposal). Candidatos: embeddings + vector store + knowledge graph (Neo4j, Memgraph, ou solucao em Postgres+pgvector).

## 6. Camadas Temporais (revisado)

O Akasha sustenta leitura em **3 escalas** (reduzido de 4):

1. **Imediata** ("o que faco agora?") — interface principal
2. **Sessao** ("o que fizemos nesta sessao?") — historico da consulta
3. **Vida** ("como evolui ao longo do tempo?") — timeline do consulente

A escala "semanal-lunar/sazonal" foi descontinuada (pouco usada no uso real).

## 7. Nao-Objetivos

- Nao ser app de autoatendimento para usuario final (publico secundario/zero).
- Nao ser horoscopo generico.
- Nao ser agregador de tradicoes sem criterio.
- Nao depender de uma unica tradicao para explicar tudo.
- Nao exigir que o Zelador leia todos os mapas manualmente.

## 8. Implicacoes Para o Repositorio

- `docs/03_architecture-spec.md` precisa ser **reescrito** pra refletir Zelador-tool.
- `docs/pesquisa/` concentra os resumos de pesquisa usados no sistema de RAG.
- `.autonomous/VISION.md` fica como ponteiro operacional desta visao (quando reativado).
- **ADRs pendentes**: 0002 (Pilares 6 e 7), 0003 (Mentor Mestre/Sacerdote), 0004 (multi-tenant consulente-MCP), 0005 (grafo de conhecimento).

## 9. ADRs a Produzir (2026-06-23+)

| # | Titulo | Status | Descricao |
|---|--------|--------|-----------|
| 0002 | Pilares 6 e 7 (Human Design + Gene Keys) | pending | Revalidacao da rejeicao anterior do Pilar 6 + decisao sobre licensing de sistemas comerciais |
| 0003 | Mentor Mestre/Sacerdote/Terapeuta | pending | Redefine persona do Mentor (canonico atual: Akashico unificado). Voz + chain-of-thought + psicanalise |
| 0004 | Multi-tenant consulente-MCP | pending | Arquitetura de isolamento por consulente + protocolo MCP interno. D-041 (Caminhante) e o modelo base |
| 0005 | Grafo de Conhecimento (Knowledge Graph) | pending | Implementacao da correlacao automatica entre os 7 Pilares. Decisao tech stack (vector store, graph store, ou hibrido) |

## 10. Decisoes Canonicas Preservadas (Nao Revisar Sem ADR)

- **Mentor = Akashico unificado** (Cigano Ramiro e guia da linhagem do Zelador, NAO persona do sistema — ver `CONTEXT.md:60`).
- **D-041 (Caminhante + Caminhada) e o modelo de consulente** ja foi aplicado (migration `20260622000000_041_caminhante_caminhada/`). A nova visao reusa D-041 — nao cria schema novo pra consulentes.
- **LGPD-by-design** se mantem (consulentes sao pessoas atendidas; revogacao + retencao conforme ADR 0002 LGPD).

Conversas exploratorias (`conversa-gemini.md`, `gemini-conversation-2.md`, etc) sao **historico de brainstorm**, nao spec ativa. Decisoes de codigo exigem:
1. Grill com o usuario (mattpocock skill `grilling`).
2. ADR formal (mattpocock skill `domain-modeling` — quando atende as 3 condicoes).
3. Proposta revisada antes de migracao (`prisma/AGENTS.md:69-82`).
4. Subagentes sob demanda via `delegate_task` (nao loop autonomo).
