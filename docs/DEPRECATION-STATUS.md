# 🗑️ Deprecation Status — Documentação v1.0 (B2B legacy)

> Snapshot criado em 2026-06-27 (UTC) pelo ciclo perpétuo v2
> Status de cada doc legado da era B2B Cockpit Oracular

| # | Doc | Status | Ação recomendada | Substituído por |
|---|---|---|---|---|
| 00 | `00_README.md` | 🟡 **DEPRECATED** | Adicionar banner de redirecionamento | `README.md` (raiz) |
| 01 | `01_product-brief.md` | 🔴 **DEPRECATED** | Mover para `docs/archive/v1/` | `docs/MARKET-VALIDATION.md` |
| 02 | `02_prd.md` | 🔴 **DEPRECATED** | Mover para `docs/archive/v1/` | `docs/STRATEGY-chain-of-thought.md` |
| 03 | `03_architecture-spec.md` | 🔴 **DEPRECATED** | Mover para `docs/archive/v1/` | `docs/ARCHITECTURE.md` (v3.0) |
| 04 | `04_data-model.md` | 🟡 **DEPRECATED** | Atualizar para `prisma/community.prisma` | `prisma/community.prisma` + schema |
| 05 | `05_uiux-spec.md` | 🔴 **DEPRECATED** | Mover para `docs/archive/v1/` | `docs/DESIGN-SYSTEM.md` + `MOBILE-DESIGN-GUIDE.md` |
| 06 | `06_ai-engine-spec.md` | 🔴 **DEPRECATED** | Mover para `docs/archive/v1/` | `docs/AI-PROMPT-base.md` |
| 07 | `07_epics-stories.md` | 🟡 **PARTIAL** | Migrar epics ainda válidos | `docs/ARCHITECTURE.md` (seção epics) |
| 08 | `08_roadmap.md` | 🟡 **PARTIAL** | Itens Q3-Q4 ainda relevantes | `docs/ARCHITECTURE.md` (roadmap) |
| 09 | `09_master-agent-prompt.md` | 🔴 **DEPRECATED** | Mover para `docs/archive/v1/` | `docs/AI-PROMPT-base.md` |

## Legenda

- 🟡 **DEPRECATED/PARTIAL** = Tem valor histórico, pode ser aproveitado
- 🔴 **DEPRECATED** = Substituído completamente, mover para archive
- 🟢 **CURRENT** = Vigente

## Ação imediata (P0)

1. Adicionar banner no topo de cada doc deprecated:

```markdown
> ⚠️ **DEPRECATED** — Esta documentação se refere ao Akasha Portal **v1.0 (B2B Cockpit)**.
> A visão atual é **v3.0 (comunidade universalista)**.
> Veja: [VISION.md](../VISION.md) | [ARCHITECTURE.md](../ARCHITECTURE.md) | [README.md](../../README.md)
```

2. Não deletar imediatamente (pode quebrar referências cruzadas em PRs antigos).
3. Mover para `docs/archive/v1/` quando VISION/ARCHITECTURE forem totalmente integrados.

## Por que isso importa

A visão do projeto pivotou em 2026-06-26 de "B2B Cockpit Oracular" para **"comunidade universalista + Akasha IA como consciousness translator"**. Os 9 docs acima foram escritos para a visão antiga. Manter eles sem banner confunde novos contribuidores e reviewers.

## Próximo passo

- [ ] **P0**: Adicionar banner nos 9 docs (1 task Coder, ~30min)
- [ ] **P1**: Migrar epics válidos de 07 e roadmap de 08 para ARCHITECTURE.md
- [ ] **P2**: Mover tudo deprecated para `docs/archive/v1/` (1 task General, ~15min)
- [ ] **P3**: Atualizar `.gitignore` para ignorar `docs/archive/` (futuro)
