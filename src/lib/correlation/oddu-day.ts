/**
 * Odú Ifá - Day Correlation Module
 * Maps the 16 Odú Ifá (Merindilogun) to days of the week with spiritual meanings
 * Based on Afro-Brazilian spiritual traditions and Cabala dos Caminhos framework
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
  { odu_numero: 1, odu_nome: 'Okaran', odu_nome_yoruba: 'Okànràn', dia: 'Segunda-feira', elemento: 'éter', significado_espiritual: 'Coragem, recomeço, liberdade. Odu da fé que move montanhas e do pioneiro que abre caminhos. Dia propício para novos projetos e decisões importantes.' },
  { odu_numero: 1, odu_nome: 'Okaran', odu_nome_yoruba: 'Okànràn', dia: 'Domingo', elemento: 'éter', significado_espiritual: 'Coragem, recomeço, liberdade. A energia solar amplifica a coragem e os novos inícios. Momento de renovação espiritual e confiança.' },
  { odu_numero: 2, odu_nome: 'Ejiokô', odu_nome_yoruba: 'Ejìokò', dia: 'Sábado', elemento: 'água', significado_espiritual: 'Dualidade, escolha, equilíbrio. Revela que toda decisão importante exige intuição e harmonização de opostos. As águas de Oxum trazem clareza.' },
  { odu_numero: 3, odu_nome: 'Etaogundá', odu_nome_yoruba: 'Ẹtaọgúndá', dia: 'Segunda-feira', elemento: 'fogo', significado_espiritual: 'Força transformadora, criação,Tool-making. Poder de transformar matéria e criar vida através da vontade. Conexão com Omolu para cura e transformação.' },
  { odu_numero: 3, odu_nome: 'Etaogundá', odu_nome_yoruba: 'Ẹtaọgúndá', dia: 'Domingo', elemento: 'fogo', significado_espiritual: 'Força transformadora sob energia solar. Criação eTool-making são amplificados. Iemanjá e o Sol juntos trazem proteção maternal e poder de manifestação.' },
  { odu_numero: 4, odu_nome: 'Irosun', odu_nome_yoruba: 'Ìrosùn', dia: 'Sábado', elemento: 'água', significado_espiritual: 'Intuição lunar, mensagens ocultas, segredos. Revela verdades escondidas e a visão além das ilusões. As águas de Oxum auxiliam na clarividência.' },
  { odu_numero: 5, odu_nome: 'Oxé', odu_nome_yoruba: 'Ọ̀sà', dia: 'Terça-feira', elemento: 'fogo', significado_espiritual: 'Lei divina, justiça cósmica, julgamento. Traz responsabilidade espiritual e decisões que afetam destinos. Ogum protege e fortalece.' },
  { odu_numero: 6, odu_nome: 'Obará', odu_nome_yoruba: 'Ọbàlúayé', dia: 'Segunda-feira', elemento: 'terra', significado_espiritual: 'Terra, mortalidade, transformação física. Conexão entre espiritual e material, doença e cura. Purificação traz restauração.' },
  { odu_numero: 6, odu_nome: 'Obará', odu_nome_yoruba: 'Ọbàlúayé', dia: 'Domingo', elemento: 'terra', significado_espiritual: 'Terra sob energia solar. Transformação física amplificada. Oxalá abre o caminho entre vida e morte com proteção do Sol.' },
  { odu_numero: 7, odu_nome: 'Odi', odu_nome_yoruba: 'Òdí', dia: 'Segunda-feira', elemento: 'água', significado_espiritual: 'Destino, forças ocultas, inconsciente. Revela padrões ocultos que direcionam a vida. Iemanjá traz compreensão dos mistérios do destino.' },
  { odu_numero: 7, odu_nome: 'Odi', odu_nome_yoruba: 'Òdí', dia: 'Domingo', elemento: 'água', significado_espiritual: 'Destino sob luz solar. Os mistérios se revelam com clareza. Momento de reconhecer padrões e aceitar o destino com sabedoria.' },
  { odu_numero: 8, odu_nome: 'Ejionlá', odu_nome_yoruba: 'Ejìọnlá', dia: 'Sábado', elemento: 'água', significado_espiritual: 'Abundância infinita, prosperidade cósmica. Transformação da escassez em riqueza espiritual e material. Logun Ede abençoa a prosperidade.' },
  { odu_numero: 9, odu_nome: 'Oshe', odu_nome_yoruba: 'Ọ̀shẹ́', dia: 'Segunda-feira', elemento: 'água', significado_espiritual: 'Alegría, celebração divina, comunidade. Rituais de agradecimento e conexão com a diversidade cultural. Iemanjá abençoa a comunidade.' },
  { odu_numero: 9, odu_nome: 'Oshe', odu_nome_yoruba: 'Ọ̀shẹ́', dia: 'Domingo', elemento: 'água', significado_espiritual: 'Alegría sob energia solar. Celebração e gratidão são multiplicadas. Momento de alegria coletiva e bênçãos compartilhadas.' },
  { odu_numero: 10, odu_nome: 'Ofun', odu_nome_yoruba: 'Ọ̀fún', dia: 'Segunda-feira', elemento: 'éter', significado_espiritual: 'Silêncio, paciência, contemplação. Sabedoria que vem do silêncio e verdade que se revela no tempo certo. Oxalá traz paz através da espera sagrada.' },
  { odu_numero: 10, odu_nome: 'Ofun', odu_nome_yoruba: 'Ọ̀fún', dia: 'Domingo', elemento: 'éter', significado_espiritual: 'Silêncio contemplativo sob luz solar. A verdade se revela com clareza. Meditação e reflexão são especialmente poderosas.' },
  { odu_numero: 11, odu_nome: 'Eyonla', odu_nome_yoruba: 'Èyọ́nlá', dia: 'Terça-feira', elemento: 'terra', significado_espiritual: 'Sabedoria anciã, tecnologias espirituais. Conhecimento que transcende gerações e exige humildade. Nanã Buruku guarda os segredos primordiais.' },
  { odu_numero: 12, odu_nome: 'Merinla', odu_nome_yoruba: 'Mẹ̀rìnlá', dia: 'Terça-feira', elemento: 'terra', significado_espiritual: 'Mistério, segredos sagrados, incognoscível. Reverência ao sagrado e aceitação do que não pode ser explicado. Respeite o mistério com Nanã.' },
  { odu_numero: 13, odu_nome: 'Mero', odu_nome_yoruba: 'Mẹ̀rọ̀', dia: 'Sábado', elemento: 'água', significado_espiritual: 'Riqueza escondida, tesouros ocultos, descobertas inesperadas. Prosperidade que surge do inesperado. Oxum revela a riqueza oculta.' },
  { odu_numero: 14, odu_nome: 'Jinza', odu_nome_yoruba: 'Jìnza', dia: 'Terça-feira', elemento: 'fogo', significado_espiritual: 'Guerra espiritual, batalha luz versus escuridão. Proteção contra forças negativas e vitória da luz. A espada de Ogum corta energias hostis.' },
  { odu_numero: 15, odu_nome: 'Jotagbe', odu_nome_yoruba: 'Jọ́tágbè', dia: 'Segunda-feira', elemento: 'éter', significado_espiritual: 'Comunicação ancestral, linhagem espiritual. Conexão com antepassados e herança espiritual. Oxalá conecta passado e presente.' },
  { odu_numero: 15, odu_nome: 'Jotagbe', odu_nome_yoruba: 'Jọ́tágbè', dia: 'Domingo', elemento: 'éter', significado_espiritual: 'Ancestralidade sob energia solar. Os ancestrais se manifestam com clareza. Dia poderoso para rituals de conexão com a linhagem.' },
  { odu_numero: 16, odu_nome: 'Otura', odu_nome_yoruba: 'Òtúrá', dia: 'Terça-feira', elemento: 'terra', significado_espiritual: 'Caminho, jornada, destino revelado. O destino se forma sob os pés, construindo-se a cada passo. Nanã Buruku orienta a jornada.' },
  { odu_numero: 16, odu_nome: 'Otura', odu_nome_yoruba: 'Òtúrá', dia: 'Segunda-feira', elemento: 'terra', significado_espiritual: 'Destino sob energia lunar. A jornada se torna clara com reflexão. Conexão entre o caminho terreno e o destino espiritual.' },
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

export function getDayOdu(dia: string): OduDay[] {
  return ODDU_DAY_BY_DAY[dia] ?? [];
}

export function getAllOduDays(): OduDay[] {
  return [...ODDU_DAY_DATA];
}

export function getAllDaysWithOdus(): string[] {
  return Object.keys(ODDU_DAY_BY_DAY);
}

export function getAllOduNumbers(): number[] {
  return Object.keys(ODDU_DAY_BY_ODU).map(Number).sort((a, b) => a - b);
}

export function getAllOduNames(): string[] {
  return Array.from(new Set(ODDU_DAY_DATA.map(m => m.odu_nome)));
}

export function getOduDaysByElement(elemento: ElementType): OduDay[] {
  return ODDU_DAY_DATA.filter(m => m.elemento === elemento);
}

export function hasOduDay(oduNumero: number): boolean {
  return oduNumero in ODDU_DAY_BY_ODU;
}

export function hasDayOdu(dia: string): boolean {
  return dia in ODDU_DAY_BY_DAY;
}

export function getPrimaryDayForOdu(oduNumero: number): string | null {
  return ODDU_DAY_BY_ODU[oduNumero]?.[0]?.dia ?? null;
}

export function getOduElement(oduNumero: number): ElementType | null {
  return ODDU_DAY_BY_ODU[oduNumero]?.[0]?.elemento ?? null;
}

export default { getOduDay, getDayOdu, getAllOduDays, getAllDaysWithOdus, getAllOduNumbers, getAllOduNames, getOduDaysByElement, hasOduDay, hasDayOdu, getPrimaryDayForOdu, getOduElement };
