/**
 * Banco de Folhas Sagradas Ewé
 *
 * Conteúdo de Grimoire (referência para o Zelador). Ver CONTEXT.md §Mandato:
 * nunca prescrever diretamente ao Caminhante. Classificadas por Orixá e
 * elemento; base em tradição oral iorubá e Verger.
 */

import type { EweLeaf } from './types';

export const EWE_DATABASE: EweLeaf[] = [
  {
    id: 'ewe-akak',
    name: 'Akakissé',
    scientificName: 'Myrsine guianensis',
    orixa: 'Ogum',
    element: 'Terra',
    thermalNature: 'quente',
    uses: ['Proteção', 'Corte de feitiçaria', 'Abertura de caminho'],
    preparation: 'Banho de descarrego com folhas frescas amassadas',
    fuente: 'Verger · tradições orais iorubás',
  },
  {
    id: 'ewe-ewon',
    name: 'Ewon Arroz',
    scientificName: 'Oryza sativa',
    orixa: 'Oxum',
    element: 'Agua',
    thermalNature: 'frio',
    uses: ['Amor', 'Doçura', 'Prosperidade', 'Beleza'],
    preparation: 'Água de arroz com mel para beber; banho com folhas maceradas',
    contraindication: 'Não combine com banhos quentes simultâneos',
    fuente: 'Tradição iorubá · Saraceni',
  },
  {
    id: 'ewe-etroke',
    name: 'Etroké',
    scientificName: 'Corchorus capsularis',
    orixa: 'Oxum',
    element: 'Vegetacao',
    thermalNature: 'quente',
    uses: ['Amor', 'Fidelidade', 'Alegria'],
    preparation: 'Mastigado com obi e patuá — ritual de Ifá',
    fuente: 'Ifá · tradições iorubás',
  },
  {
    id: 'ewe-ogum',
    name: 'Espada de Ogum',
    scientificName: 'Smilax brasiliensis',
    orixa: 'Ogum',
    element: 'Ferro',
    thermalNature: 'quente',
    uses: ['Proteção', 'Vitória', 'Corte de demandas'],
    preparation: 'Banho de folhas com ferro enferrujado — manhã de quinta-feira',
    fuente: 'Tradição iorubá · Saraceni',
  },
  {
    id: 'ewe-alecrim',
    name: 'Alecrim',
    scientificName: 'Rosmarinus officinalis',
    orixa: 'Obatalá',
    element: 'Ar',
    thermalNature: 'quente',
    uses: ['Purificação', 'Memória', 'Clareza mental', 'Proteção'],
    preparation: 'Queimar como incense; banho com alecrim e sal grosso',
    fuente: 'Tradição oral · Saraceni',
  },
  {
    id: 'ewe-arruda',
    name: 'Arruda',
    scientificName: 'Ruta graveolens',
    orixa: 'Oxumaré',
    element: 'TerraAgua',
    thermalNature: 'quente',
    uses: ['Proteção', 'Descarrego', 'Limpeza de olhos'],
    preparation: 'Banho de arruda com sal grosso — 7 leaves por litro',
    contraindication: 'Gestantes não devem usar arruda internamente',
    fuente: 'Tradição iorubá · Saraceni',
  },
  {
    id: 'ewe-quiabo',
    name: 'Quíabo',
    scientificName: 'Abelmoschus esculentus',
    orixa: 'Oxum',
    element: 'Agua',
    thermalNature: 'frio',
    uses: ['Amor', 'Fortaleza', 'Saúde intestinal'],
    preparation: 'Suco de quíabo com mel; banho com leaves cozidas',
    fuente: 'Tradição iorubá',
  },
  {
    id: 'ewe-pau-brasil',
    name: 'Pau Brasil',
    scientificName: 'Caesalpinia echinata',
    orixa: 'Ogum',
    element: 'Fogo',
    thermalNature: 'quente',
    uses: ['Dinheiro', 'Proteção de territorio', 'Magia de guerra'],
    preparation: 'Defumação com pau brasil queimado; água de cocção para limpeza',
    fuente: 'Tradição afro-brasileira · Saraceni',
  },
  {
    id: 'ewe-canha',
    name: 'Canna edulis',
    scientificName: 'Canna edulis',
    orixa: 'Nanã',
    element: 'Terra',
    thermalNature: 'neutro',
    uses: ['Ancestralidade', 'Memória', 'Purificação por água'],
    preparation: 'Água de cocção para banho de limpeza; raiz mascada',
    fuente: 'Tradição iorubá',
  },
  {
    id: 'ewe-manjericao',
    name: 'Manjericão',
    scientificName: 'Ocimum basilicum',
    orixa: 'Iemanjá',
    element: 'Agua',
    thermalNature: 'frio',
    uses: ['Amor', 'Harmonia', 'Purificação leve', 'Proteção de casa'],
    preparation: 'Infusão para beber; banho com leaves frescas',
    fuente: 'Tradição iorubá · Saraceni',
  },
  {
    id: 'ewe-dende',
    name: 'Dendê',
    scientificName: 'Elaeis guineensis',
    orixa: 'Oxum',
    element: 'FogoAgua',
    thermalNature: 'quente',
    uses: ['Poderos', 'Sorte', 'Amor feroz', 'Proteção forte'],
    preparation: 'Óleo puro para Unção; mistura com folhas para firmezas',
    contraindication: 'Não usar puro na pele sensível — diluir',
    fuente: 'Tradição iorubá · Saraceni',
  },
  {
    id: 'ewe-aniz',
    name: 'Erva-doce',
    scientificName: 'Pimpinella anisum',
    orixa: 'Yemanjá',
    element: 'Agua',
    thermalNature: 'frio',
    uses: ['Amor', 'Boas notícias', 'Suavidade'],
    preparation: 'Chá para beber; água de banhos com leaves',
    fuente: 'Tradição oral',
  },
  {
    id: 'ewe-guinar',
    name: 'Guinar',
    scientificName: 'Bidens pilosa',
    orixa: 'Oxóssi',
    element: 'Terra',
    thermalNature: 'neutro',
    uses: ['Caça', 'Sorte na busca', 'Abundância'],
    preparation: 'Banho de folhas com mel; defumação antes de trabalho',
    fuente: 'Tradição iorubá',
  },
  {
    id: 'ewe-oxal',
    name: 'Folha de Oxalá',
    scientificName: 'Ficus religiosa',
    orixa: 'Obatalá',
    element: 'Ar',
    thermalNature: 'frio',
    uses: ['Paz', 'Saúde', 'Pureza', 'Sabedoria'],
    preparation: 'Infusão para bebida; banho com leaves em água de chuva',
    fuente: 'Tradição iorubá · Saraceni',
  },
  {
    id: 'ewe-preguica',
    name: 'Folha-preguiça',
    scientificName: 'Sideroxylon_oblongifolium',
    orixa: 'Oxum',
    element: 'Vegetacao',
    thermalNature: 'frio',
    uses: ['Amor manso', 'Calma', 'Conquistar sem forçar'],
    preparation: 'Banho de folhas para harmonizar ambiente',
    fuente: 'Tradição oral',
  },
];

/**
 * Returns all Ewé leaves for a given Orixá.
 */
export function getByOrixa(orixa: string): EweLeaf[] {
  return EWE_DATABASE.filter((e) => e.orixa.toLowerCase() === orixa.toLowerCase());
}

/**
 * Returns leaves for "descarrego" (hot/cleansing) or "harmonizar" (cold/calming).
 */
export function getByNature(nature: 'quente' | 'frio'): EweLeaf[] {
  return EWE_DATABASE.filter((e) => e.thermalNature === nature);
}

/**
 * Search Ewé by keyword in name or uses.
 */
export function searchEwe(query: string): EweLeaf[] {
  const q = query.toLowerCase();
  return EWE_DATABASE.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.orixa.toLowerCase().includes(q) ||
      e.uses.some((u) => u.toLowerCase().includes(q)),
  );
}
