// meji-ile-data.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any

/**
 * Meji-Ile Data Module
 * Odu Ifá data for Meji-Ile (EjiOkô) - The duality, the double paths, union and dispute
 * Meji represents the concept of two/double; Ile means earth/home
 */

export interface MejiIleData {
  id: string;
  oduNumero: number;
  oduNome: string;
  oduNomeYoruba: string;
  significado: string;
  elementos: string;
  orixas: string[];
  quizilas: string[];
  preceitos: string[];
  ebo: string;
  keywords: string[];
  timestamp: number;
}

export const mejiIleData: MejiIleData[] = [
  {
    id: 'meji-ile-001',
    oduNumero: 2,
    oduNome: 'Meji-Ile',
    oduNomeYoruba: 'EjiOkô',
    significado: 'A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas.',
    elementos: 'Ar / Terra',
    orixas: ['Ibeji', 'Ogum'],
    quizilas: [
      'Comer ovos',
      'Rã',
      'Mentir ou trair a confiança dos outros',
      'Manipular situações para beneficio próprio',
      'Ignorar as necessidades dos gêmeos ou parceiros',
    ],
    preceitos: [
      'Manter a alegria interna',
      'Cuidar da criança interior',
      'Buscar sociedades justas',
      'Honrar compromissos e tratados',
      'Cultivar a paciência em momentos de conflito',
    ],
    ebo: 'Ebó de Prosperidade: Doces, frutas para Ibeji, e comidas leves em praças ou jardins.',
    keywords: ['dualidade', 'caminhos', 'união', 'disputa', 'vitória', 'lutas', 'parceria', 'gêmeos', 'aliança'],
    timestamp: Date.now(),
  },
  {
    id: 'meji-ile-002',
    oduNumero: 2,
    oduNome: 'Meji-Ile',
    oduNomeYoruba: 'EjiOkô',
    significado: 'O espelho que reflete duas faces. A verdade e a mentira habitam o mesmo espaço.',
    elementos: 'Ar / Terra',
    orixas: ['Ibeji', 'Ogum'],
    quizilas: [
      'Relações desonestas',
      'Promessas não cumpridas',
      'Dualidade moral',
    ],
    preceitos: [
      'Ser honesto consigo mesmo e com os outros',
      'Escolher consistentemente o caminho da verdade',
      'Buscar harmonic relationships',
    ],
    ebo: 'Ebó de Harmonia: Duas velas acesas juntas, oferendas duplas, alimentos balanceados.',
    keywords: ['espelho', 'reflexo', 'verdade', 'mentira', 'harmonia', 'justiça', 'equilíbrio'],
    timestamp: Date.now() + 1,
  },
  {
    id: 'meji-ile-003',
    oduNumero: 2,
    oduNome: 'Meji-Ile',
    oduNomeYoruba: 'EjiOkô',
    significado: 'A necessidade de escolher entre dois caminhos. Um leva à união, outro à separação.',
    elementos: 'Ar / Terra',
    orixas: ['Ibeji', 'Ogum'],
    quizilas: [
      'Indecisão crônica',
      'Seguir ambos os caminhos ao mesmo tempo',
      'Trair a confiança',
    ],
    preceitos: [
      'Tomar decisões com clareza',
      'Honrar acordos firmados',
      'Reconhecer quando é hora de avançar ou recuar',
    ],
    ebo: 'Ebó de Decisão: Duas moedas, escolhas em cruzamentos, oferendas de equilibrio.',
    keywords: ['escolha', 'decisão', 'caminho', 'separação', 'união', 'destino'],
    timestamp: Date.now() + 2,
  },
];

/**
 * Get all Meji-Ile data entries
 */
export function getData(): MejiIleData[] {
  return mejiIleData;
}

/**
 * Get Meji-Ile data entry by id
 */
export function getDataById(id: string): MejiIleData | undefined {
  return mejiIleData.find((d) => d.id === id);
}

/**
 * Get Meji-Ile primary data (first entry)
 */
export function getPrimaryData(): MejiIleData | undefined {
  return mejiIleData[0];
}

/**
 * Get Meji-Ile data by Orixá
 */
export function getDataByOrixa(orixa: string): MejiIleData[] {
  return mejiIleData.filter((d) =>
    d.orixas.some((o) => o.toLowerCase() === orixa.toLowerCase())
  );
}

/**
 * Get all quizilas for Meji-Ile
 */
export function getQuizilas(): string[] {
  return mejiIleData.flatMap((d) => d.quizilas);
}

/**
 * Get all preceitos for Meji-Ile
 */
export function getPreceitos(): string[] {
  return mejiIleData.flatMap((d) => d.preceitos);
}