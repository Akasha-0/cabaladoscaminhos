# ADRs DOX

## Purpose
Architecture Decision Records (ADRs) — log imutável de decisões
arquiteturais significativas do projeto Akasha. Cada ADR documenta
contexto, alternativas consideradas, decisão tomada, e consequências.

## Ownership
- `ADR-NNN-slug.md`: 1 ADR por arquivo. Numeração sequencial.
- `README.md`: índice de ADRs (status: Accepted/Deprecated/Superseded)

## Local Contracts
- Formato padrão: Contexto → Decisão → Consequências
- ADR-001+ Accepted; ADR-### em draft
- Mudanças de decisão: criar novo ADR que supersede o anterior
- White paper anual referencia todos os ADRs ativos

## Work Guidance
- Criar ADR para: mudança de stack, novo pilar, novo partner,
  breaking change em API pública, pivot arquitetural
- NÃO criar ADR para: bug fix, refactor mecânico, dependency bump
- Discussão em RFC pública 30 dias antes de ADR-###-accepted
  (R-022b Pilar 4: Aprovações governança)

## Verification
- Cada ADR cita fonte canônica (R-022, synthesis_v1, ethics_charter)
- 4 aprovações necessárias: Pilar + Curador + Comitê + Usuário
  (R-022b Pilar 8)

## Child DOX Index
(Nenhum subdiretório com AGENTS.md dedicado no momento)
