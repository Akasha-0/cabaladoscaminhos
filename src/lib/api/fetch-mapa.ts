import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

/**
 * Fetch a full Mapa da Alma (MapaAlmaCompleto) from the spiritual engine API.
 *
 * Thin wrapper around POST `/api/mapa` that:
 *  - serializes the birth profile to JSON,
 *  - throws an Error with the API `error` message (or `HTTP <status>` fallback) on !ok,
 *  - returns the parsed JSON typed as `MapaAlmaCompleto`.
 *
 * @param nome               Full birth name.
 * @param dataNascimento     ISO date string (YYYY-MM-DD).
 * @param horaNascimento     Optional birth time (HH:MM or similar).
 * @param localNascimento    Birth city.
 * @param nomeMae            Mother's full name (used by correlational systems).
 * @param nomePai            Father's full name (used by correlational systems).
 */
export async function fetchMapa(
  nome: string,
  dataNascimento: string,
  horaNascimento: string | undefined,
  localNascimento: string | undefined,
  nomeMae: string | undefined,
  nomePai: string | undefined
): Promise<MapaAlmaCompleto> {
  const response = await fetch('/api/mapa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nomeCompleto: nome,
      dataNascimento,
      hora: horaNascimento,
      cidade: localNascimento,
      estado: nomeMae,
      pais: nomePai,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}) as { error?: string });
    throw new Error((data as { error?: string }).error || `HTTP ${response.status}`);
  }

  return (await response.json()) as MapaAlmaCompleto;
}
