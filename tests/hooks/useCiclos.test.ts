import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCiclos } from '@/lib/hooks/useCiclos';
import { mockFetch, setupFetchMock, clearFetchMock } from '../mocks/handlers';

describe('useCiclos', () => {
  beforeEach(() => {
    setupFetchMock();
    clearFetchMock();
  });

  it('deve iniciar com estado de loading', () => {
    const { result } = renderHook(() => useCiclos('1990-06-15'));
    expect(result.current.loading).toBe(true);
  });

  it('deve carregar ciclos corretamente', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch({
        ciclos: {
          anoPessoal: 7,
          mesPessoal: 3,
          diaPessoal: 5,
          sefirotAno: 'Tiphereth',
          sefirotMes: 'Hod',
          sefirotDia: 'Netzach',
          descricao: {
            ano: { nome: 'Expressão' },
            mes: { nome: 'Comunicação' },
            dia: { nome: 'Vitória' }
          }
        }
      })
    );

    const { result } = renderHook(() => useCiclos('1990-06-15'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ano?.numero).toBe(7);
    expect(result.current.ano?.sefirot).toBe('Tiphereth');
    expect(result.current.mes?.numero).toBe(3);
    expect(result.current.dia?.numero).toBe(5);
    expect(result.current.error).toBeNull();
  });

  it('deve mostrar erro quando fetch falha', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce(
      mockFetch({ error: 'Erro' }, false)
    );

    const { result } = renderHook(() => useCiclos('1990-06-15'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('deve lidar com dados incompletos', async () => {
    const { result } = renderHook(() => useCiclos(''));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Data de nascimento não fornecida');
  });
});