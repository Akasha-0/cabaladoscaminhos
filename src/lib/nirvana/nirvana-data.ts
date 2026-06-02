// fallow-ignore-file unused-file
// Nirvana data - liberation and ultimate enlightenment

export interface NirvanaPath {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
}

export interface NirvanaData {
  name: string;
  description: string;
  paths: NirvanaPath[];
}

const nirvanaPaths: NirvanaPath[] = [
  {
    id: 'nirodha',
    name: 'Nirodha',
    description: 'Cessação completa - fim do sofrimento e do ciclo de existência.',
    characteristics: [
      'libertação total',
      'fim das rodas de existência',
      'paz absoluta',
      'cessação do apego',
    ],
  },
  {
    id: 'samadhi',
    name: 'Samadhi',
    description: 'Absorção meditativa profunda - integração da consciência com o todo.',
    characteristics: [
      'união com o divino',
      'consciência expandida',
      'dissolução do ego',
      'percepção clara',
    ],
  },
  {
    id: 'moksha',
    name: 'Moksha',
    description: 'Libertação da alma - rompimento das correntes do karma.',
    characteristics: [
      'libertação final',
      'fusão com Brahman',
      'fim das reencarnações',
      'realização do Self',
    ],
  },
  {
    id: 'kensho',
    name: 'Kensho',
    description: 'Visão da natureza de Buda - primeiro despertar.',
    characteristics: [
      ' clareza de mente',
      'percepção da vacuidade',
      'insight repentino',
      'transformação irreversível',
    ],
  },
  {
    id: 'bodhi',
    name: 'Bodhi',
    description: 'Despertar completo - iluminação total.',
    characteristics: [
      'sabedoria infinita',
      'compaixão universal',
      'ação espontânea correta',
      'libertação do sofrimento',
    ],
  },
];

export function getData(): NirvanaData {
  return {
    name: 'Nirvana',
    description: 'Estado supremo de libertação e iluminação - o fim do sofrimento e a dissolução no todo.',
    paths: nirvanaPaths,
  };
}
