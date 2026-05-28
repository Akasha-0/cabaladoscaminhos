// Satori data - sudden enlightenment and awakening
export interface SatoriState {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
}

export interface SatoriData {
  name: string;
  description: string;
  states: SatoriState[];
}

const satoriStates: SatoriState[] = [
  {
    id: 'kensho',
    name: 'Kensho',
    description: 'Visão da natureza de Buda - experiência de despertar momentâneo.',
    characteristics: [
      'clareza profunda',
      'percepção além do eu',
      'insight repentino',
      'transformação existencial',
    ],
  },
  {
    id: 'satori',
    name: 'Satori',
    description: 'Despertar completo - compreensão intuitiva da realidade última.',
    characteristics: [
      'unidade com o universo',
      'libertação das ilusões',
      'paz interior absoluta',
      'compreensão não-dual',
    ],
  },
  {
    id: 'mu',
    name: 'Mu',
    description: 'O "não" cósmico - vacuidade que contém tudo.',
    characteristics: [
      'vacuidade plena',
      'potencial infinito',
      'ausência de obstinação',
      'abertura total',
    ],
  },
  {
    id: 'kensho-satori',
    name: 'Kensho-Satori',
    description: 'Despertar completo e contínuo - integração da iluminação.',
    characteristics: [
      'estabilidade no despertar',
      'sabedoria aplicada',
      'compaixão natural',
      'ação espontânea correta',
    ],
  },
];

export function getData(): SatoriData {
  return {
    name: 'Satori',
    description: 'Despertar súbito e compreensão intuitiva da natureza última da realidade.',
    states: satoriStates,
  };
}