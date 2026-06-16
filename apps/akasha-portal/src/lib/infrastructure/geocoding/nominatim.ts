// src/lib/geocoding/nominatim.ts
// Geocoding client via Nominatim (OpenStreetMap). API pública, sem chave
// necessária, rate-limit de 1 req/s (header User-Agent obrigatório).
//
// Docs: https://nominatim.org/release-docs/develop/api/Search/
//
// Por que existe: o cadastro de cliente precisa de birthLatitude/
// birthLongitude/birthTimezone para o motor astrológico calcular
// o mapa completo. Sem coordenadas, o backend cai no fallback
// "mapa simplificado" (sol/lua/ascendente = "—"). Fase 44 prometeu
// este helper mas nunca implementou — corrigido em Fase 510.

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'CabalaDosCaminhos/1.0 (dev-local)';

export interface GeocodedLocation {
  latitude: number;
  longitude: number;
  displayName: string;
}

/**
 * Geocodifica um nome de cidade para coordenadas. Retorna null se
 * nenhum resultado for encontrado. Timeout de 5s.
 *
 * `countryCodes` (opcional): filtro ISO-3166 alpha-2, ex: 'br' para
 * limitar busca ao Brasil. Evita ambiguidades (ex: "São Paulo" no
 * Brasil vs. Angola).
 */
export async function geocodeCity(
  city: string,
  options: { countryCodes?: string; signal?: AbortSignal } = {}
): Promise<GeocodedLocation | null> {
  const trimmed = city.trim();
  if (trimmed.length < 2) return null;

  const params = new URLSearchParams({
    q: trimmed,
    format: 'json',
    limit: '1',
    addressdetails: '0',
  });
  if (options.countryCodes) {
    params.set('countrycodes', options.countryCodes);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  // Encadeia signal externo (ex: React cleanup) com o timeout
  options.signal?.addEventListener('abort', () => controller.abort());

  try {
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;
    if (data.length === 0) return null;
    const first = data[0];
    return {
      latitude: parseFloat(first.lat),
      longitude: parseFloat(first.lon),
      displayName: first.display_name,
    };
  } catch (err) {
    if (controller.signal.aborted) return null;
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Mapeia coordenadas rough para um timezone IANA via timezoneapi.io-style
 * heurística. Para dev local, aceitamos um set pequeno; em prod, ideal
 * é integrar com Google Timezone API ou similar. Aqui retornamos o
 * timezone do browser se disponível, senão null.
 */
export function guessTimezoneFromBrowser(): string | null {
  if (typeof Intl === 'undefined') return null;
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}
