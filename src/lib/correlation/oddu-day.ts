/**
 * Odú Ifá - Day Correlation Module
 */
export type ElementType = 'fogo' | 'água' | 'ar' | 'terra' | 'éter';
export interface OduDay {
  odu_numero: number;
  odu_nome: string;
  odu_nome_yoruba: string;
  dia: string;
  elemento: ElementType;
  significado_espiritual: string;
}
const ODDU_DAY_DATA: OduDay[] = [
  { odu_numero: 1, odu_nome: 'Okaran', odu_nome_yoruba: 'Okànràn', dia: 'Segunda-feira', elemento: 'éter', significado_espiritual: 'Coragem.' },
  { odu_numero: 1, odu_nome: 'Okaran', odu_nome_yoruba: 'Okànràn', dia: 'Domingo', elemento: 'éter', significado_espiritual: 'Coragem solar.' },
  { odu_numero: 2, odu_nome: 'Ejiokô', odu_nome_yoruba: 'Ejìokò', dia: 'Sábado', elemento: 'água', significado_espiritual: 'Equilíbrio.' },
  { odu_numero: 3, odu_nome: 'Etaogundá', odu_nome_yoruba: 'Ẹtaọgúndá', dia: 'Segunda-feira', elemento: 'fogo', significado_espiritual: 'Transformação.' },
  { odu_numero: 3, odu_nome: 'Etaogundá', odu_nome_yoruba: 'Ẹtaọgúndá', dia: 'Domingo', elemento: 'fogo', significado_espiritual: 'Transformação solar.' },
  { odu_numero: 4, odu_nome: 'Irosun', odu_nome_yoruba: 'Ìrosùn', dia: 'Sábado', elemento: 'água', significado_espiritual: 'Intuição.' },
  { odu_numero: 5, odu_nome: 'Oxé', odu_nome_yoruba: 'Ọ̀sà', dia: 'Terça-feira', elemento: 'fogo', significado_espiritual: 'Justiça.' },
  { odu_numero: 6, odu_nome: 'Obará', odu_nome_yoruba: 'Ọbàlúayé', dia: 'Segunda-feira', elemento: 'terra', significado_espiritual: 'Terra.' },
  { odu_numero: 6, odu_nome: 'Obará', odu_nome_yoruba: 'Ọbàlúayé', dia: 'Domingo', elemento: 'terra', significado_espiritual: 'Terra solar.' },
  { odu_numero: 7, odu_nome: 'Odi', odu_nome_yoruba: 'Òdí', dia: 'Segunda-feira', elemento: 'água', significado_espiritual: 'Destino.' },
  { odu_numero: 7, odu_nome: 'Odi', odu_nome_yoruba: 'Òdí', dia: 'Domingo', elemento: 'água', significado_espiritual: 'Destino solar.' },
  { odu_numero: 8, odu_nome: 'Ejionlá', odu_nome_yoruba: 'Ejìọnlá', dia: 'Sábado', elemento: 'água', significado_espiritual: 'Abundância.' },
  { odu_numero: 9, odu_nome: 'Oshe', odu_nome_yoruba: 'Ọ̀shẹ́', dia: 'Segunda-feira', elemento: 'água', significado_espiritual: 'Alegría.' },
  { odu_numero: 9, odu_nome: 'Oshe', odu_nome_yoruba: 'Ọ̀shẹ́', dia: 'Domingo', elemento: 'água', significado_espiritual: 'Alegría solar.' },
  { odu_numero: 10, odu_nome: 'Ofun', odu_nome_yoruba: 'Ọ̀fún', dia: 'Segunda-feira', elemento: 'éter', significado_espiritual: 'Silêncio.' },
  { odu_numero: 10, odu_nome: 'Ofun', odu_nome_yoruba: 'Ọ̀fún', dia: 'Domingo', elemento: 'éter', significado_espiritual: 'Silêncio solar.' },
  { odu_numero: 11, odu_nome: 'Eyonla', odu_nome_yoruba: 'Èyọ́nlá', dia: 'Terça-feira', elemento: 'terra', significado_espiritual: 'Sabedoria.' },
  { odu_numero: 12, odu_nome: 'Merinla', odu_nome_yoruba: 'Mẹ̀rìnlá', dia: 'Terça-feira', elemento: 'terra', significado_espiritual: 'Mistério.' },
  { odu_numero: 13, odu_nome: 'Mero', odu_nome_yoruba: 'Mẹ̀rọ̀', dia: 'Sábado', elemento: 'água', significado_espiritual: 'Riqueza.' },
  { odu_numero: 14, odu_nome: 'Jinza', odu_nome_yoruba: 'Jìnza', dia: 'Terça-feira', elemento: 'fogo', significado_espiritual: 'Guerra.' },
  { odu_numero: 15, odu_nome: 'Jotagbe', odu_nome_yoruba: 'Jọ́tágbè', dia: 'Segunda-feira', elemento: 'éter', significado_espiritual: 'Ancestralidade.' },
  { odu_numero: 15, odu_nome: 'Jotagbe', odu_nome_yoruba: 'Jọ́tágbè', dia: 'Domingo', elemento: 'éter', significado_espiritual: 'Ancestralidade solar.' },
  { odu_numero: 16, odu_nome: 'Otura', odu_nome_yoruba: 'Òtúrá', dia: 'Terça-feira', elemento: 'terra', significado_espiritual: 'Caminho.' },
  { odu_numero: 16, odu_nome: 'Otura', odu_nome_yoruba: 'Òtúrá', dia: 'Segunda-feira', elemento: 'terra', significado_espiritual: 'Destino.' },
];
const ODDU_DAY_BY_ODU: Record<number, OduDay[]> = {};
const ODDU_DAY_BY_DAY: Record<string, OduDay[]> = {};
for (const mapping of ODDU_DAY_DATA) {
  if (!ODDU_DAY_BY_ODU[mapping.odu_numero]) ODDU_DAY_BY_ODU[mapping.odu_numero] = [];
  ODDU_DAY_BY_ODU[mapping.odu_numero].push(mapping);
  if (!ODDU_DAY_BY_DAY[mapping.dia]) ODDU_DAY_BY_DAY[mapping.dia] = [];
  ODDU_DAY_BY_DAY[mapping.dia].push(mapping);
}
export function getOduDay(odu: number | string): OduDay[] {
  if (typeof odu === 'number') return ODDU_DAY_BY_ODU[odu] ?? [];
  const normalized = odu.toLowerCase().trim();
  const byNum = ODDU_DAY_BY_ODU[Number(normalized)];
  if (byNum) return byNum;
  return ODDU_DAY_DATA.filter(m => m.odu_nome.toLowerCase() === normalized);
}
export function getDayOdu(dia: string): OduDay[] { return ODDU_DAY_BY_DAY[dia] ?? []; }
export function getAllOduDays(): OduDay[] { return [...ODDU_DAY_DATA]; }
export function getAllDaysWithOdus(): string[] { return Object.keys(ODDU_DAY_BY_DAY); }
export function getAllOduNumbers(): number[] { return Object.keys(ODDU_DAY_BY_ODU).map(Number).sort((a, b) => a - b); }
function getAllOduNames(): string[] { return Array.from(new Set(ODDU_DAY_DATA.map(m => m.odu_nome))); }
export function getOduDaysByElement(elemento: ElementType): OduDay[] { return ODDU_DAY_DATA.filter(m => m.elemento === elemento); }
export function hasOduDay(oduNumero: number): boolean { return oduNumero in ODDU_DAY_BY_ODU; }
export function hasDayOdu(dia: string): boolean { return dia in ODDU_DAY_BY_DAY; }
export function getPrimaryDayForOdu(oduNumero: number): string | null { return ODDU_DAY_BY_ODU[oduNumero]?.[0]?.dia ?? null; }
export function getOduElement(oduNumero: number): ElementType | null { return ODDU_DAY_BY_ODU[oduNumero]?.[0]?.elemento ?? null; }
// fallow-ignore-next-line unused-export
export default { getOduDay, getDayOdu, getAllOduDays, getAllDaysWithOdus, getAllOduNumbers, getAllOduNames, getOduDaysByElement, hasOduDay, hasDayOdu, getPrimaryDayForOdu, getOduElement };
