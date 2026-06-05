export interface SefiraMeaning {
  name: string;
  divineName: string;
  angelicOrder: string;
  color: string;
  quality: string;
  essence: string;
  path: string;
  letter: string;
  element: string;
}

export type SefiraName =
  | 'keter'
  | 'chokhmah'
  | 'binah'
  | 'chesed'
  | 'gevurah'
  | 'tiferet'
  | 'netzach'
  | 'hod'
  | 'yesod'
  | 'malkhut';

const sefirotMeanings: Record<SefiraName, SefiraMeaning> = {
  keter: {
    name: 'Keter (Coroa)',
    divineName: 'Ein Sof',
    angelicOrder: 'Chayot HaKodesh',
    color: 'Branco Dourado',
    quality: 'Vontade Divina',
    essence: 'A coroa suprema, o primeiro impulso da vontade divina de se revelar.',
    path: 'Coroa – ponto de origem antes da forma.',
    letter: 'א (Alef)',
    element: 'Primordial',
  },
  chokhmah: {
    name: 'Chokhmah (Sabedoria)',
    divineName: 'Yah',
    angelicOrder: 'Ofanim',
    color: 'Cinza Azulado',
    quality: 'Impulso Criativo',
    essence: 'A centelha da criação, o primeiro pensamento que rompe o vazio.',
    path: 'Sabedoria – movimento dinâmico da primeira ideia.',
    letter: 'ב (Bet)',
    element: 'Fogo Primordial',
  },
  binah: {
    name: 'Binah (Compreensão)',
    divineName: 'YHWH',
    angelicOrder: 'Aralot',
    color: 'Preto',
    quality: 'Formação Estruturante',
    essence: 'O recipiente que dá forma e limite ao impulso criativo.',
    path: 'Compreensão – receptividade que transforma ideia em estrutura.',
    letter: 'ג (Gimel)',
    element: 'Águas Superiores',
  },
  chesed: {
    name: 'Chesed (Misericórdia)',
    divineName: 'El',
    angelicOrder: 'Chasmalim',
    color: 'Branco Puro',
    quality: 'Expansão Generosa',
    essence: 'O fluxo ilimitado da graça divina, bondade sem medida.',
    path: 'Misericórdia – o braço que se estende para dar.',
    letter: 'ד (Dalet)',
    element: 'Água',
  },
  gevurah: {
    name: 'Gevurah (Força/Julgamento)',
    divineName: 'Elohim',
    angelicOrder: 'Seraphim',
    color: 'Vermelho',
    quality: 'Contenção e Limite',
    essence: 'O poder que restringe, julga e estabelece a lei.',
    path: 'Força – o braço que se fecha para proteger.',
    letter: 'ה (He)',
    element: 'Fogo',
  },
  tiferet: {
    name: 'Tiferet (Beleza/Harmonia)',
    divineName: 'Adonai',
    angelicOrder: 'Malakhim',
    color: 'Amarelo-Dourado',
    quality: 'Equilíbrio e Mediação',
    essence: 'O eixo central que harmoniza misericórdia e julgamento.',
    path: 'Beleza – o ponto onde todos os opostos se encontram.',
    letter: 'ו (Vav)',
    element: 'Ar',
  },
  netzach: {
    name: 'Netzach (Vitória/Eternidade)',
    divineName: 'Tzevaot',
    angelicOrder: 'Serafim',
    color: 'Verde-Esmeralda',
    quality: 'Persistência e Ardência',
    essence: 'A chama que não se extingue, a perseverança do espírito.',
    path: 'Vitória – o impulso que vence o tempo.',
    letter: 'ז (Zayin)',
    element: 'Fogo',
  },
  hod: {
    name: 'Hod (Glória/Submissão)',
    divineName: 'Elohim Tzevaot',
    angelicOrder: 'Hashmallim',
    color: 'Laranja-Amarelado',
    quality: 'Humildade e Confiança',
    essence: 'O reconhecimento da grandeza divina na própria limitação.',
    path: 'Glória – a luz que irradia da rendição.',
    letter: 'ח (Chet)',
    element: 'Éter',
  },
  yesod: {
    name: 'Yesod (Fundação)',
    divineName: 'El Chai',
    angelicOrder: 'Cherubim',
    color: 'Violeta',
    quality: 'Conexão e Transmissão',
    essence: 'O canal através do qual a energia divina flui para o mundo.',
    path: 'Fundação – o pilar que sustenta toda a estrutura.',
    letter: 'ט (Tet)',
    element: 'Terra',
  },
  malkhut: {
    name: 'Malkhut (Reino)',
    divineName: 'Adonai HaAretz',
    angelicOrder: 'Issim',
    color: 'Preto com Reflexos',
    quality: 'Manifestação e Presença',
    essence: 'O ponto onde o divino se torna visível e tangível no mundo material.',
    path: 'Reino – o espelho que reflete a vontade celestial.',
    letter: 'י (Yud)',
    element: 'Terra/Metal',
  },
};

export function getMeanings(): Record<SefiraName, SefiraMeaning> {
  return sefirotMeanings;
}
