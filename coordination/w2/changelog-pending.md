# coordination/w2/changelog-pending.md

## Entradas pendentes de changelog

_Tudo integrado em v0.1.6. Nenhuma entrada pendente._

Ciclos 32-104: auditoria hygiene. Zero impacto para usuario.

### Ciclo 105 (2026-06-13)
- **fix(w2): AkashaSignificadoCard header labels**: Corrigido mapeamento de cabeçalho para as abas `sexualidade` e `espiritualidade` na UI (que antes caíam incorretamente sob 'Relacionamentos').
- **docs(w2)**: Removido comentário obsoleto sobre mismatch de tipo do core, confirmando presença de `proposito` e `sexualidade` nos types canônicos.
- **Impacto para o usuário**: Correção visual na visualização de áreas no dashboard.

### Ciclo 106 (2026-06-13)
- **refactor(w2): remove unnecessary type casts**: Removidos casts `as LifeArea` na indexação do objeto `interp.aplicacao` em `AkashaSignificadoCard.tsx` ao tipar o array de áreas e o estado local diretamente como `LifeArea`.
- **Impacto para o usuário**: Melhora a integridade do código e a robustez do type-checking em tempo de compilação.
