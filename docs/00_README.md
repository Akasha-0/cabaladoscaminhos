# Cabala dos Caminhos — Documentação Oficial do Projeto

> **Versão:** 1.0.0 | **Última atualização:** 2026  
> **Proprietário:** Gabriel (Operador e Desenvolvedor)  
> **Status:** Planejamento / Pré-Desenvolvimento

---

## Índice de Documentos

| # | Documento | Descrição |
|---|-----------|-----------|
| 01 | [Product Brief](./01_product-brief.md) | Visão, proposta de valor, público-alvo e contexto estratégico |
| 02 | [PRD — Product Requirements Document](./02_prd.md) | Módulos, funcionalidades, regras de negócio e critérios de aceitação |
| 03 | [Arquitetura Técnica](./03_architecture-spec.md) | Stack, infraestrutura, fluxo de dados e integrações externas |
| 04 | [Modelo de Dados](./04_data-model.md) | Prisma Schema, estruturas JSON, payloads de API |
| 05 | [Especificação UI/UX](./05_uiux-spec.md) | Design system, layout, componentes e comportamento da interface |
| 06 | [Motor de IA & Matriz de Correlação](./06_ai-engine-spec.md) | Prompt engineering, cadeia de raciocínio e mapeamento das 36 casas |
| 07 | [Épicos & User Stories](./07_epics-stories.md) | Backlog estruturado com critérios de aceitação técnicos |
| 08 | [Roadmap](./08_roadmap.md) | Fases de desenvolvimento, milestones e entregáveis |
| 09 | [Master Prompt para Agentes](./09_master-agent-prompt.md) | Contexto-mestre para o agente orquestrador/codificador |
| 10 | [Revisão & Gap Analysis](./10_revisao-gap-analysis.md) | Auditoria de prontidão mecânica da documentação 00–09 |
| 11 | [Cálculo Determinístico](./11_calculo-deterministico.md) | Tabelas alfanuméricas, fórmulas, números mestres, data→Odu |
| 12 | [Motor de Consulta Interativa (Q&A)](./12_motor-consulta-qa.md) | Roteador de temas, RAG fechado, persona e API de consulta |
| 13 | [Identidade Ramiro & Design System v2](./13_identidade-ramiro-design-v2.md) | Consagração ao Cigano Ramiro, paleta laranja+azul royal (canônica) |
| 14 | [Extensibilidade Oracular](./14_extensibilidade-oracular.md) | Contrato de plugin para I-Ching e novos sistemas |
| 15 | [Glossário Oracular Canônico](./15_glossario-oracular.md) | Significados-base das 36 cartas e 16 Odus (anti-alucinação) |
| 16 | [Revisão de Arquitetura & Plano de Decisões](./16_revisao-arquitetura-plano-decisoes.md) | Auditoria Visão × Implementação; ADRs de features e UI/UX; plano priorizado |
| 17 | [Arquitetura da Interface Única (Mesa Real)](./17_arquitetura-interface-unica.md) | A visão "uma só página": 36 casas em cards + Odus + 4 entradas natais; poda de componentes; camadas de inteligência |
| 18 | [Blueprint Técnico & Contratos](./18_blueprint-tecnico-contratos.md) | Contratos de dados/estado/API: `MatrixData` canônico, store Zustand, máquina de estados, sequências, decisões AD-18 |
| 19 | [Estratégia de Testes, Qualidade & CI](./19_estrategia-testes-qualidade.md) | Partição core/legado (Vitest projects), pirâmide de testes, testes-guardião de determinismo, gate de CI, orçamento de performance |
| 20 | [Governança de Conteúdo Oracular & Motor de Inteligência](./20_governanca-conteudo-oracular.md) | Proveniência das correspondências, ledger `IDEIA.md`, validação por fonte, crescimento governado das camadas de inteligência (AD-17.7) |

> **Identidade visual:** o **Doc 13** é a fonte canônica da paleta (laranja + azul royal, consagração ao Cigano Ramiro). Em qualquer divergência de cor, ele prevalece sobre os demais.
>
> **Arquitetura (Visão × Código):** o **Doc 16** é a fonte canônica das decisões de arquitetura. Onde um doc mais antigo divergir sobre stack, rotas ou estrutura de pastas, o Doc 16 prevalece.
>
> **Interface & navegação:** o **Doc 17** é a fonte canônica da **interface única** (a Mesa Real numa só página). Onde um doc mais antigo descrever múltiplas telas/rotas, o Doc 17 prevalece.
>
> **Contratos (dados/estado/API):** o **Doc 18** é a fonte canônica dos contratos técnicos (`MatrixData`, store, payloads de rota, orquestração da geração). Onde um doc mais antigo divergir sobre formato de dados ou payload, o Doc 18 prevalece — subordinado ao Doc 17 (visão) e ao Doc 06 (correlação).

---

## Resumo Executivo

**Cabala dos Caminhos** é um SaaS privado B2B destinado a terapeutas oraculistas. O sistema digitaliza o processo de leitura da **Mesa Real** (Baralho Cigano — 36 casas em matriz 9×4), cruzando os inputs dinâmicos de cada consulta com cálculos estáticos do mapa natal do consulente (Astrologia, Numerologia Cabalística, Numerologia Tântrica e Odu de Nascimento), utilizando um agente de Inteligência Artificial para gerar um **Dossiê interpretativo personalizado** casa por casa.

---

## Como Usar Esta Documentação

- **Para o Agente de Orquestração (Hermes):** Leia os documentos 01, 02, 07 e 10 para entender o escopo, as lacunas conhecidas e dividir as tarefas em subtarefas atômicas para o swarm.
- **Para o Agente de Codificação (Minimax/Claude Code):** Leia os documentos 03, 04, 05, 06, 09, 11, 12, 13 e 14 para implementar os módulos. Siga a ordem dos épicos no documento 07.
- **Para o Desenvolvedor (Gabriel):** Use o documento 08 para monitorar o progresso, o 02 para validar requisitos e o 10 §5 para as decisões de conteúdo pendentes (D1–D6) que só você pode definir.

> **Comece pelo Doc 10 (Gap Analysis).** Ele mapeia o estado de prontidão da documentação e aponta exatamente o que cada documento ganhou nesta refatoração.
