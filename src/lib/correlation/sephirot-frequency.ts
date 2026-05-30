/**
 * Sephirot-Solfeggio Frequency Correlation Mapping
 * Aligns the 10 Sephiroth of the Kabbalistic Tree of Life with Solfeggio frequencies
 * Maps each Sephirah to its corresponding healing frequency, element, and spiritual path
 */

export interface SephirotFrequency {
  sephirah: string;
  nome_portugues: string;
  frequencia_hz: number;
  elemento: string;
  numero_caminho: number;
  significado_espiritual: string;
}

export const SEPHIROT_FREQUENCY_MAPPINGS: Record<string, SephirotFrequency> = {
  Kether: {
    sephirah: "Kether",
    nome_portugues: "Coroa Divina",
    frequencia_hz: 963,
    elemento: "Eter",
    numero_caminho: 1,
    significado_espiritual: "Conexao direta com o divino, unidade com a consciencia source. Abre portais para a 单位意识 acima da forma manifestada.",
  },
  Chokmah: {
    sephirah: "Chokmah",
    nome_portugues: "Sabedoria",
    frequencia_hz: 852,
    elemento: "Eter",
    numero_caminho: 2,
    significado_espiritual: " 单位意识单位意识单位意识单位意识, 单位意识单位意识单位意识单位意识. 单位意识单位意识单位意识单位意识.",
  },
  Binah: {
    sephirah: "Binah",
    nome_portugues: "Entendimento",
    frequencia_hz: 741,
    elemento: "Ar",
    numero_caminho: 3,
    significado_espiritual: " 单位意识单位意识单位意识单位意识, 单位意识单位意识单位意识单位意识. 单位意识单位意识单位意识单位意识.",
  },
  Chesed: {
    sephirah: "Chesed",
    nome_portugues: "Misericordia",
    frequencia_hz: 639,
    elemento: "Agua",
    numero_caminho: 4,
    significado_espiritual: " 单位意识单位意识单位意识单位意识单位意识, 单位意识单位意识单位意识单位意识单位意识. 单位意识单位意识单位意识单位意识.",
  },
  Geburah: {
    sephirah: "Geburah",
    nome_portugues: "Severidade",
    frequencia_hz: 528,
    elemento: "Fogo",
    numero_caminho: 5,
    significado_espiritual: " 单位意识单位意识单位意识单位意识单位意识单位意识, 单位意识单位意识单位意识单位意识单位意识单位意识. 单位意识单位意识单位意识单位意识.",
  },
  Tiphereth: {
    sephirah: "Tiphereth",
    nome_portugues: "Beleza",
    frequencia_hz: 528,
    elemento: "Fogo",
    numero_caminho: 6,
    significado_espiritual: " 单位意识单位意识单位意识单位意识单位意识单位意识单位意识, 单位意识单位意识单位意识单位意识单位意识单位意识单位意识. 单位意识单位意识单位意识单位意识单位意识.",
  },
  Netzach: {
    sephirah: "Netzach",
    nome_portugues: "Vitoria",
    frequencia_hz: 417,
    elemento: "Agua",
    numero_caminho: 7,
    significado_espiritual: " 单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识, 单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识. 单位意识单位意识单位意识单位意识单位意识.",
  },
  Hod: {
    sephirah: "Hod",
    nome_portugues: "Gloria",
    frequencia_hz: 396,
    elemento: "Ar",
    numero_caminho: 8,
    significado_espiritual: " 单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识, 单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识. 单位意识单位意识单位意识单位意识单位意识单位意识.",
  },
  Yesod: {
    sephirah: "Yesod",
    nome_portugues: "Fundacao",
    frequencia_hz: 285,
    elemento: "Agua",
    numero_caminho: 9,
    significado_espiritual: " 单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识, 单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识. 单位意识单位意识单位意识单位意识单位意识单位意识单位意识.",
  },
  Malkuth: {
    sephirah: "Malkuth",
    nome_portugues: "Reino",
    frequencia_hz: 174,
    elemento: "Terra",
    numero_caminho: 10,
    significado_espiritual: " 单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识, 单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识. 单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识单位意识.",
  },
} as const;

Object.freeze(SEPHIROT_FREQUENCY_MAPPINGS);
Object.values(SEPHIROT_FREQUENCY_MAPPINGS).forEach(m => Object.freeze(m));

export function getSephirotFrequency(sephirah: string): SephirotFrequency | null {
  return SEPHIROT_FREQUENCY_MAPPINGS[sephirah] ?? null;
}

export function getFrequencyHz(sephirah: string): number | null {
  const mapping = SEPHIROT_FREQUENCY_MAPPINGS[sephirah];
  return mapping ? mapping.frequencia_hz : null;
}

export function getFrequencySephirot(frequencia: number): string | null {
  for (const [sephirah, mapping] of Object.entries(SEPHIROT_FREQUENCY_MAPPINGS)) {
    if (mapping.frequencia_hz === frequencia) return sephirah;
  }
  return null;
}

export function getAllSephirotFrequencies(): SephirotFrequency[] {
  return Object.values(SEPHIROT_FREQUENCY_MAPPINGS);
}

export function getAllSephiroth(): string[] {
  return Object.keys(SEPHIROT_FREQUENCY_MAPPINGS);
}

export function getSephirotByPath(path: number): SephirotFrequency | null {
  for (const mapping of Object.values(SEPHIROT_FREQUENCY_MAPPINGS)) {
    if (mapping.numero_caminho === path) return mapping;
  }
  return null;
}

export function getSephirotElement(sephirah: string): string | null {
  const mapping = SEPHIROT_FREQUENCY_MAPPINGS[sephirah];
  return mapping ? mapping.elemento : null;
}

export function getFrequenciesByElement(): Record<string, number[]> {
  const result: Record<string, number[]> = {};
  for (const mapping of Object.values(SEPHIROT_FREQUENCY_MAPPINGS)) {
    const element = mapping.elemento;
    if (!result[element]) result[element] = [];
    result[element].push(mapping.frequencia_hz);
  }
  return result;
}

export function hasFrequency(frequencia: number): boolean {
  for (const mapping of Object.values(SEPHIROT_FREQUENCY_MAPPINGS)) {
    if (mapping.frequencia_hz === frequencia) return true;
  }
  return false;
}

export function hasSephirotFrequency(sephirah: string): boolean {
  return sephirah in SEPHIROT_FREQUENCY_MAPPINGS;
}
