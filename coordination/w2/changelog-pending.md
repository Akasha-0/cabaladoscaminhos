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

### Ciclo 107 (2026-06-13)
- **fix(w2): component warnings cleanup and exports**:
  - Removido parâmetro não utilizado `index` de `StreakCalendar.tsx`.
  - Removida variável não utilizada `error` de `DashboardStats.tsx`.
  - Exportado `ErrorBoundary` de `ErrorState.tsx`, `CardFooter` de `card.tsx`, `DialogTrigger` de `dialog.tsx`, e `ProgressLabel` / `ProgressValue` de `progress.tsx`.
  - Removidas variáveis não utilizadas `stateRaw` e `getCityLabel` em `city-autocomplete.tsx`.
  - Aplicados os tipos corretos `AuthChangeEvent` e `Session` de `@supabase/supabase-js` em `SupabaseProvider.tsx` para remover `any` sem violar implicit-any.
- **Impacto para o usuário**: Deixa a pasta de componentes UI 100% livre de warnings e erros do linter, aumentando a estabilidade e limpeza do código.
