/**
 * Os 16 Odus de Ifá (Merindilogun)
 * Constantes imutáveis do sistema Cabala dos Caminhos.
 *
 * @see docs/04_data-model.md §5.2
 *
 * Cada Odu possui:
 * - `id`      — número fixo de 1 a 16
 * - `name`    — nome do Odu
 * - `orixas`  — Orixás regentes
 * - `essence` — essência / palavra-força
 */

export interface Odu {
  /** Identificador numérico fixo (1..16) */
  id: number;
  /** Nome do Odu (grafia adotada pelo terapeuta) */
  name: string;
  /** Orixás regentes do Odu */
  orixas: ReadonlyArray<string>;
  /** Essência — palavra-força / significado central */
  essence: string;
}

export const ODUS: ReadonlyArray<Odu> = [
  { id: 1,  name: 'Ogbe',      orixas: ['Oxalá'],                          essence: 'Luz, origem, criação, renovação' },
  { id: 2,  name: 'Ejiokô',    orixas: ['Ibeji', 'Ogum'],                  essence: 'Dualidade, movimento, parcerias' },
  { id: 3,  name: 'Etogundá',  orixas: ['Ogum', 'Ogun'],                   essence: 'Batalha, conquista, abertura de caminhos' },
  { id: 4,  name: 'Irosun',    orixas: ['Oxum', 'Iemanjá'],                essence: 'Atenção, sangue, cuidado com traições' },
  { id: 5,  name: 'Oxê',       orixas: ['Oxum', 'Iemanjá'],                essence: 'Beleza, amor, fertilidade, magnetismo' },
  { id: 6,  name: 'Obará',     orixas: ['Xangô', 'Oxóssi'],                essence: 'Riqueza, glória, abundância, fartura' },
  { id: 7,  name: 'Odi',       orixas: ['Exu', 'Omolu'],                   essence: 'Segredos, transformação, cautela, limpeza' },
  { id: 8,  name: 'Ejionile',  orixas: ['Xangô', 'Oxalá'],                 essence: 'Justiça, liderança, força, vitória' },
  { id: 9,  name: 'Ossá',      orixas: ['Iemanjá', 'Oyá'],                 essence: 'Proteção feminina, sabedoria, turbulência' },
  { id: 10, name: 'Ofun',      orixas: ['Oxalufan', 'Oxalá'],              essence: 'Espiritualidade profunda, equilíbrio mental' },
  { id: 11, name: 'Owarin',    orixas: ['Exu', 'Oyá'],                     essence: 'Dinâmica, perigo, astúcia, movimento rápido' },
  { id: 12, name: 'Ejilaxebô', orixas: ['Ogum', 'Oxum'],                   essence: 'Honra, proteção, caminho aberto' },
  { id: 13, name: 'Oturupon',  orixas: ['Omolu', 'Nanã'],                  essence: 'Cura, purificação, ancestralidade' },
  { id: 14, name: 'Oturá',     orixas: ['Oxalá', 'Iemanjá'],               essence: 'Paz, benevolência, proteção divina' },
  { id: 15, name: 'Iká',       orixas: ['Xangô', 'Oxum'],                  essence: 'Poder, estratégia, responsabilidade' },
  { id: 16, name: 'Ofurufu',   orixas: ['Oxalá', 'Todos os Orixás'],       essence: 'Completude, totalidade, bênção universal' },
] as const;

/**
 * Helper — busca um Odu por id (1..16). Retorna `undefined` se inválido.
 */
export function getOduById(id: number): Odu | undefined {
  if (id < 1 || id > 16) return undefined;
  return ODUS[id - 1];
}
