/**
 * Oddu-Ifá Cabala Sephirot Correlation Module
 * Maps the 16 Odú Ifá (Merindilogun) to their corresponding Sephiroth
 */

export type ElementType = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';

export interface OdduSephirot {
  oddu_numero: number;
  oddu_nome: string;
  sephirah: string;
  elemento: ElementType;
  significado_espiritual: string;
  conexoes_caminho: {
    numero_caminho: number;
    letra_hebraica: string;
    posicao: string;
    sephirot_relacionadas: string[];
  };
  dia_semana: string;
}

export const ODDU_SEPHIROT_MAPPINGS: Record<number, OdduSephirot> = {
  1: { oddu_numero: 1, oddu_nome: 'Okaran', sephirah: 'Malkuth', elemento: 'éter', significado_espiritual: 'O começo.', conexoes_caminho: { numero_caminho: 21, letra_hebraica: 'ת', posicao: 'Base', sephirot_relacionadas: ['Kether'] }, dia_semana: 'Segunda-feira' },
  2: { oddu_numero: 2, oddu_nome: 'Ejiokô', sephirah: 'Binah', elemento: 'água', significado_espiritual: 'A dualidade.', conexoes_caminho: { numero_caminho: 3, letra_hebraica: 'ג', posicao: 'Pilar', sephirot_relacionadas: ['Kether'] }, dia_semana: 'Segunda-feira' },
  3: { oddu_numero: 3, oddu_nome: 'Etaogundá', sephirah: 'Geburah', elemento: 'fogo', significado_espiritual: 'A revolta.', conexoes_caminho: { numero_caminho: 5, letra_hebraica: 'ה', posicao: 'Pilar', sephirot_relacionadas: ['Chesed'] }, dia_semana: 'Terça-feira' },
  4: { oddu_numero: 4, oddu_nome: 'Irosun', sephirah: 'Chesed', elemento: 'água', significado_espiritual: 'O aviso.', conexoes_caminho: { numero_caminho: 4, letra_hebraica: 'ד', posicao: 'Pilar', sephirot_relacionadas: ['Binah'] }, dia_semana: 'Quinta-feira' },
  5: { oddu_numero: 5, oddu_nome: 'Oxé', sephirah: 'Tiphereth', elemento: 'fogo', significado_espiritual: 'O ouro.', conexoes_caminho: { numero_caminho: 6, letra_hebraica: 'ו', posicao: 'Centro', sephirot_relacionadas: ['Kether'] }, dia_semana: 'Quinta-feira' },
  6: { oddu_numero: 6, oddu_nome: 'Obará', sephirah: 'Netzach', elemento: 'fogo', significado_espiritual: 'A riqueza.', conexoes_caminho: { numero_caminho: 7, letra_hebraica: 'ז', posicao: 'Pilar', sephirot_relacionadas: ['Chesed'] }, dia_semana: 'Segunda-feira' },
  7: { oddu_numero: 7, oddu_nome: 'Odi', sephirah: 'Hod', elemento: 'fogo', significado_espiritual: 'A teimosia.', conexoes_caminho: { numero_caminho: 8, letra_hebraica: 'ח', posicao: 'Pilar', sephirot_relacionadas: ['Geburah'] }, dia_semana: 'Terça-feira' },
  8: { oddu_numero: 8, oddu_nome: 'EjiOníle', sephirah: 'Yesod', elemento: 'água', significado_espiritual: 'A cabeça.', conexoes_caminho: { numero_caminho: 9, letra_hebraica: 'ט', posicao: 'Fundação', sephirot_relacionadas: ['Tiphereth'] }, dia_semana: 'Sexta-feira' },
  9: { oddu_numero: 9, oddu_nome: 'Ossá', sephirah: 'Binah', elemento: 'ar', significado_espiritual: 'O vento.', conexoes_caminho: { numero_caminho: 3, letra_hebraica: 'ג', posicao: 'Pilar', sephirot_relacionadas: ['Kether'] }, dia_semana: 'Sábado' },
  10: { oddu_numero: 10, oddu_nome: 'Ofun', sephirah: 'Malkuth', elemento: 'éter', significado_espiritual: 'O mistério.', conexoes_caminho: { numero_caminho: 21, letra_hebraica: 'ת', posicao: 'Base', sephirot_relacionadas: ['Yesod'] }, dia_semana: 'Segunda-feira' },
  11: { oddu_numero: 11, oddu_nome: 'Owarin', sephirah: 'Geburah', elemento: 'fogo', significado_espiritual: 'A pressa.', conexoes_caminho: { numero_caminho: 5, letra_hebraica: 'ה', posicao: 'Pilar', sephirot_relacionadas: ['Hod'] }, dia_semana: 'Terça-feira' },
  12: { oddu_numero: 12, oddu_nome: 'Ejilsebora', sephirah: 'Hod', elemento: 'fogo', significado_espiritual: 'A justiça.', conexoes_caminho: { numero_caminho: 8, letra_hebraica: 'ח', posicao: 'Pilar', sephirot_relacionadas: ['Geburah'] }, dia_semana: 'Terça-feira' },
  13: { oddu_numero: 13, oddu_nome: 'Olobón', sephirah: 'Yesod', elemento: 'terra', significado_espiritual: 'A doença.', conexoes_caminho: { numero_caminho: 9, letra_hebraica: 'ט', posicao: 'Fundação', sephirot_relacionadas: ['Malkuth'] }, dia_semana: 'Segunda-feira' },
  14: { oddu_numero: 14, oddu_nome: 'Iká', sephirah: 'Netzach', elemento: 'água', significado_espiritual: 'A traição.', conexoes_caminho: { numero_caminho: 7, letra_hebraica: 'ז', posicao: 'Pilar', sephirot_relacionadas: ['Hod'] }, dia_semana: 'Quinta-feira' },
  15: { oddu_numero: 15, oddu_nome: 'Ogbogbé', sephirah: 'Geburah', elemento: 'fogo', significado_espiritual: 'A feitiçaria.', conexoes_caminho: { numero_caminho: 5, letra_hebraica: 'ה', posicao: 'Pilar', sephirot_relacionadas: ['Binah'] }, dia_semana: 'Terça-feira' },
  16: { oddu_numero: 16, oddu_nome: 'Alafia', sephirah: 'Kether', elemento: 'éter', significado_espiritual: 'A paz absoluta.', conexoes_caminho: { numero_caminho: 11, letra_hebraica: 'א', posicao: 'Coroa', sephirot_relacionadas: ['Chokmah'] }, dia_semana: 'Sexta-feira' },
};

Object.freeze(ODDU_SEPHIROT_MAPPINGS);

export function getOduSephirot(oddu: number | string): OdduSephirot | null {
  if (typeof oddu === 'number') return ODDU_SEPHIROT_MAPPINGS[oddu] ?? null;
  const nameLower = oddu.toLowerCase();
  return Object.values(ODDU_SEPHIROT_MAPPINGS).find(m => m.oddu_nome.toLowerCase() === nameLower) ?? null;
}

export function getSephirotOdu(): Record<string, { oddu_numero: number; oddu_nome: string }> {
  const result: Record<string, { oddu_numero: number; oddu_nome: string }> = {};
  for (const mapping of Object.values(ODDU_SEPHIROT_MAPPINGS)) {
    if (!result[mapping.sephirah]) result[mapping.sephirah] = { oddu_numero: mapping.oddu_numero, oddu_nome: mapping.oddu_nome };
  }
  return result;
}

export function getAllOduSephiroths(): OdduSephirot[] {
  return Object.values(ODDU_SEPHIROT_MAPPINGS).sort((a, b) => a.oddu_numero - b.oddu_numero);
}

export function getAllOdduNumbers(): number[] {
  return Object.keys(ODDU_SEPHIROT_MAPPINGS).map(Number).sort((a, b) => a - b);
}

export function getAllOdduNames(): string[] {
  return getAllOduSephiroths().map(m => m.oddu_nome);
}

export function getAllSephirotNames(): string[] {
  const seen = new Set<string>();
  for (const mapping of Object.values(ODDU_SEPHIROT_MAPPINGS)) seen.add(mapping.sephirah);
  return Array.from(seen).sort();
}

export function getOdduByElement(elemento: ElementType): OdduSephirot[] {
  return Object.values(ODDU_SEPHIROT_MAPPINGS).filter(m => m.elemento === elemento).sort((a, b) => a.oddu_numero - b.oddu_numero);
}

export function getOdduBySephirah(sephirah: string): OdduSephirot[] {
  const nameLower = sephirah.toLowerCase();
  return Object.values(ODDU_SEPHIROT_MAPPINGS).filter(m => m.sephirah.toLowerCase() === nameLower).sort((a, b) => a.oddu_numero - b.oddu_numero);
}

export function hasOdduSephirot(odduNumero: number): boolean {
  return odduNumero in ODDU_SEPHIROT_MAPPINGS;
}

export function getOdduElement(odduNumero: number): ElementType | null {
  return ODDU_SEPHIROT_MAPPINGS[odduNumero]?.elemento ?? null;
}

export function getOdduMessage(odduNumero: number): string | null {
  return ODDU_SEPHIROT_MAPPINGS[odduNumero]?.significado_espiritual ?? null;
}

export function getSephirotByOdduNumber(odduNumero: number): string | null {
  return ODDU_SEPHIROT_MAPPINGS[odduNumero]?.sephirah ?? null;
}

export default { getOduSephirot, getSephirotOdu, getAllOduSephiroths, getAllOdduNumbers, getAllOdduNames, getAllSephirotNames, getOdduByElement, getOdduBySephirah, hasOdduSephirot, getOdduElement, getOdduMessage, getSephirotByOdduNumber, ODDU_SEPHIROT_MAPPINGS };
