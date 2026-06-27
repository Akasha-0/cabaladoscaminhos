# Cabala dos Caminhos — Documentação Oficial do Projeto

> ⚠️ **DEPRECATED** — Esta documentação se refere ao Akasha Portal **v1.0 (B2B Cockpit Oracular)**.
> A visão atual é **v3.0 (comunidade universalista + Akasha IA como consciousness translator)**.
> Veja: [VISION.md](../VISION.md) | [ARCHITECTURE.md](../ARCHITECTURE.md) | [README.md](../../README.md)
> Use esta versão apenas para referência histórica.

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

---

## Resumo Executivo

**Cabala dos Caminhos** é um SaaS privado B2B destinado a terapeutas oraculistas. O sistema digitaliza o processo de leitura da **Mesa Real** (Baralho Cigano — 36 casas em matriz 9×4), cruzando os inputs dinâmicos de cada consulta com cálculos estáticos do mapa natal do consulente (Astrologia, Numerologia Cabalística, Numerologia Tântrica e Odu de Nascimento), utilizando um agente de Inteligência Artificial para gerar um **Dossiê interpretativo personalizado** casa por casa.

---

## Como Usar Esta Documentação

- **Para o Agente de Orquestração (Hermes):** Leia os documentos 01, 02 e 07 para entender o escopo e dividir as tarefas em subtarefas atômicas para o swarm.
- **Para o Agente de Codificação (Minimax/Claude Code):** Leia os documentos 03, 04, 05 e 06 para implementar os módulos. Siga a ordem dos épicos no documento 07.
- **Para o Desenvolvedor (Gabriel):** Use o documento 08 para monitorar o progresso e o 02 para validar se o que foi construído atende ao requisito.
