# TODO - Dashboard Pages

## Summary
Reviewed dashboard pages for TODO comments and hardcoded values. No literal TODO comments were found in the codebase. The following items were identified as cleanup/refactoring opportunities:

---

## Cleanup Items (No Behavior Changes)

### 1. `src/app/dashboard/page.tsx`
- **Hardcoded Fallback Values → Constants**: Configured `NOME_FALLBACK` and `DATA_NASCIMENTO_FALLBACK` at module level. The pattern `user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário'` still exists inline for email parsing — this could be refactored further but preserves existing behavior.

### 2. `src/app/dashboard/perfil/page.tsx`
- **Hardcoded Demo Data → Constants**: Form default values extracted to `NOME_PADRAO`, `EMAIL_PADRAO`, `DATA_NASCIMENTO_PADRAO`, `HORA_NASCIMENTO_PADRAO`, `LOCAL_NASCIMENTO_PADRAO`, and `SALVAR_SIMULADO_DURATION`.
- **Simulated Save Delay**: The `setTimeout(resolve, 1000)` pattern is now driven by `SALVAR_SIMULADO_DURATION`. When real backend integration occurs, this should be replaced with actual API call.

### 3. `src/app/dashboard/chat/page.tsx`
- **Hardcoded Cost Value → Constant**: `CUSTO_MENSAGEM = 2` defined at module level.
- **Hardcoded Demo Delay → Constant**: `DEMO_MODE_RESPONSE_DELAY_MS = 1500` defined at module level.
- **Interface Declaration**: `Mensagem` interface moved above `temas` constant for better code organization.

### 4. `src/app/dashboard/relatorios/page.tsx`
- **Hardcoded User Data → Constants**: `NOME_PADRAO` and `DATA_NASCIMENTO_PADRAO` defined for fallback scenario.

---

## Future Improvements

1. **Centralized Configuration**: Consider moving all hardcoded defaults to a central configuration file (e.g., `src/lib/config/defaults.ts`) for easier maintenance across the application.

2. **Environment Variables**: When deploying to production, these fallback defaults should be configurable via environment variables rather than hardcoded in source code.

3. **Real Backend Integration**: The simulated save in perfil page and demo mode in chat page should be replaced with real API calls when backend services are available.

4. **Type Safety**: All constants now follow the `CONSTANT_CASE` naming convention for clarity.

---

## Files Modified
- `src/app/dashboard/page.tsx` - Added `NOME_FALLBACK`, `DATA_NASCIMENTO_FALLBACK`
- `src/app/dashboard/perfil/page.tsx` - Added 6 constants for form defaults and simulation delay
- `src/app/dashboard/chat/page.tsx` - Added `CUSTO_MENSAGEM`, `DEMO_MODE_RESPONSE_DELAY_MS`
- `src/app/dashboard/relatorios/page.tsx` - Added `NOME_PADRAO`, `DATA_NASCIMENTO_PADRAO`