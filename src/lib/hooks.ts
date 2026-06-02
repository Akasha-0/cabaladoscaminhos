// Re-export useToast from VisualFeedback

// ============================================================================
// Hook stubs - These need proper implementations
// Currently imported by src/app/dashboard/perfil/page.tsx
// ============================================================================

/**
 * Hook para cálculos numerológicos
 * @deprecated Needs proper implementation
 */
export function useNumerologia(nomeCompleto: string, dataNascimento: string) {
  return {
    pitagorica: null as number | null,
    cabalistica: null as number | null,
    tantrica: null as number | null,
    loading: false,
    error: null as string | null,
  };
}

/**
 * Hook para ciclos de vida
 * @deprecated Needs proper implementation
 */
export function useCiclos(dataNascimento: string) {
  return {
    ano: null as number | null,
    mes: null as number | null,
    dia: null as number | null,
    loading: false,
    error: null as string | null,
  };
}

/**
 * Hook para odus
 * @deprecated Needs proper implementation
 */
export function useOdus(dataNascimento: string) {
  return {
    principal: null as string | null,
    loading: false,
    error: null as string | null,
  };
}