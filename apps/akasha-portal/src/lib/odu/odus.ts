/**
 * Os 16 Odus do Merindilogun — Arquétipos e Interpretações
 *
 * Sistema Oracular v1 (canônico). Ver CONTEXT.md §Oráculo / §Sistema Oracular.
 * Fontes: Verger, Saraceni, Cumino. Pilar 4 (Odu natal) é distinto — vive em
 * User.oduBirth com ethics invariant (consentimento + terreiro do Zelador).
 */

import type { OduArchetype } from './types';
import { Odu } from './types';

export const ODUS: Record<Odu, OduArchetype> = {
  [Odu.OGUN]: {
    id: Odu.OGUN,
    name: 'Ogundá',
    orixas: ['Ogum', 'Oxóssi'],
    element: 'Ferro',
    archetype: 'O Guerreiro — força de ação e conquista',
    somaticAreas: ['Mãos', 'Braços', 'Coluna lombar'],
    esquerdaAlign: [],
    frase: 'Ogundá marca o caminho do guerreiro que corta obstáculos.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Ação — o ponto de partida de toda transformação',
  },

  [Odu.EJI]: {
    id: Odu.EJI,
    name: 'Ejioko',
    orixas: ['Eshu', 'Elegguá'],
    element: 'Mutável',
    archetype: 'O Trickster — mediação e crossroads',
    somaticAreas: ['Pescoço', 'Tireoide', 'Mãos'],
    esquerdaAlign: ['Eshu Crossroad'],
    frase: 'Ejioko abre portas e fecha caminhos — o oráculo do cruzamento.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Mediação — saber escolher no cruzamento',
  },

  [Odu.OGBE]: {
    id: Odu.OGBE,
    name: 'Ogbe',
    orixas: ['Obatalá'],
    element: 'Ar',
    archetype: 'O Fundador — ordem e criação',
    somaticAreas: ['Cabeça', 'Cérebro', 'Articulações'],
    esquerdaAlign: [],
    frase: 'Ogbe abre o caminho da criação e estabelece nova ordem.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Fundação — construir sobre terra firme',
  },

  [Odu.OYARON]: {
    id: Odu.OYARON,
    name: 'Oyaron',
    orixas: ['Yemanjá'],
    element: 'Água',
    archetype: 'A Mãe — nutrição e receptividade',
    somaticAreas: ['Seios', 'Útero', 'Quadris', 'Barriga'],
    esquerdaAlign: [],
    frase: 'Oyaron representa a água que nutre e purifica.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Nutrição — cuidado e ternura como força',
  },

  [Odu.IROSUN]: {
    id: Odu.IROSUN,
    name: 'Irossun',
    orixas: ['Oxum', 'Iemanjá'],
    element: 'Água Doce',
    archetype: 'A Dama — doçura, intuição e mistério',
    somaticAreas: ['Ovários', 'Seios', 'Garganta', 'Lábios'],
    esquerdaAlign: [],
    frase: 'Irossun carrega o segredo das águas doces e da intuição profunda.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Intuição — escutar o silêncio interior',
  },

  [Odu.OBARA]: {
    id: Odu.OBARA,
    name: 'Obará',
    orixas: ['Shangô', 'Obaluaiê'],
    element: 'Fogo',
    archetype: 'O Rei — prosperidade e poder pessoal',
    somaticAreas: ['Coração', 'Pulmões', 'Barriga', 'Figado'],
    esquerdaAlign: [],
    frase: 'Obará é o signo da prosperidade e do brilho pessoal — o rei que se coroa sozinho.',
    fonte: 'Verger 1973 · Ifá · Saraceni',
    karmicTheme: 'Prosperidade — o axé do brilho próprio (não depende de fora)',
  },

  [Odu.ODI]: {
    id: Odu.ODI,
    name: 'Odi',
    orixas: ['Oxumaré'],
    element: 'Terra/Água',
    archetype: 'O Isolado — resistência e guarda',
    somaticAreas: ['Rins', 'Coluna', 'Articulações'],
    esquerdaAlign: [],
    frase: 'Odi fecha portas para que outras se abram — o signo do isolamento protetor.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Isolamento — saber se proteger para não se perder',
  },

  [Odu.EJIONILE]: {
    id: Odu.EJIONILE,
    name: 'Ejionile',
    orixas: ['Ori', 'Todos'],
    element: 'Ar/Fogo',
    archetype: 'A Cabeça — destino e comando',
    somaticAreas: ['Cabeça', 'Coluna vertebral', 'Respiração'],
    esquerdaAlign: ['Exu Tranca Ruas'],
    frase: 'Ejionile rege a cabeça — o movimento e os novos começos. O axé de liderar.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Liderança — a coroa que nasce de dentro',
  },

  [Odu.BAFIFA]: {
    id: Odu.BAFIFA,
    name: 'Bafifa',
    orixas: ['Omulu', 'Omolu'],
    element: 'Terra',
    archetype: 'O Curador — doença e redenção',
    somaticAreas: ['Pele', 'Articulações', 'Ossos', 'Sistema imunológico'],
    esquerdaAlign: [],
    frase: 'Bafifa carrega a doença e a cura — o caminho de Omulu.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Transmutação — a doença que purifica',
  },

  [Odu.AIRA]: {
    id: Odu.AIRA,
    name: 'Aira',
    orixas: ['Oxumaré'],
    element: 'Arco-íris',
    archetype: 'O Arcanjo — expansão e contrato',
    somaticAreas: ['Pele', 'Ritmo circadiano'],
    esquerdaAlign: [],
    frase: 'Aira conecta céu e terra — o arco-íris que sela contratos.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Contrato — o que se planta agora, colhe depois',
  },

  [Odu.OLOFIN]: {
    id: Odu.OLOFIN,
    name: 'Olodumare',
    orixas: ['Olodumare', 'Olorum'],
    element: 'Luz',
    archetype: 'O Criador — propósito e destino',
    somaticAreas: ['Cabeça', 'Tronco superior'],
    esquerdaAlign: [],
    frase: 'Olodumare é o signo do Criador — destino selado antes do nascimento.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Destino — o propósito que antecede a escolha',
  },

  [Odu.EYEOLLA]: {
    id: Odu.EYEOLLA,
    name: 'Eyeolá',
    orixas: ['Yemanjá', 'Oxum'],
    element: 'Água salgada',
    archetype: 'A Rainha — maternidade e poder feminino',
    somaticAreas: ['Seios', 'Útero', 'Quadris'],
    esquerdaAlign: ['Maria Padilha'],
    frase: 'Eyeolá governa o poder feminino e a maternidade sagrada.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Poder feminino — a força que gera e protege',
  },

  [Odu.ATE]: {
    id: Odu.ATE,
    name: 'Ate',
    orixas: ['Ogum'],
    element: 'Fogo/Ferro',
    archetype: 'O Mestre — conhecimento e sacrifício',
    somaticAreas: ['Coração', 'Fígado', 'Músculos'],
    esquerdaAlign: [],
    frase: 'Ate representa o sacrifício consciente — a faca que corta para abrir.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Sacrifício — o que se entrega para crescer',
  },

  [Odu.REDE]: {
    id: Odu.REDE,
    name: 'Redé',
    orixas: ['Oxóssi', 'Obatalá'],
    element: 'Floresta',
    archetype: 'O Caçador — busca e propósito',
    somaticAreas: ['Pernas', 'Joelhos', 'Pés'],
    esquerdaAlign: [],
    frase: 'Redé é o signo da busca — o caçador que encontra o caminho.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Propósito — saber o que se busca',
  },

  [Odu.DIN]: {
    id: Odu.DIN,
    name: 'Din',
    orixas: ['Yemanjá', 'Shangô'],
    element: 'Fogo/Água',
    archetype: 'O Fogo Sagrado — transformação e paixão',
    somaticAreas: ['Coração', 'Sangue', 'Baço'],
    esquerdaAlign: ['Maria Padilha do Cabaré'],
    frase: 'Din é o fogo que transforma — a paixão que queima e ilumina.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Transformação — a chama que não apaga',
  },

  [Odu.KAUA]: {
    id: Odu.KAUA,
    name: 'Kaua',
    orixas: ['Nanã Buruque'],
    element: 'Lodo',
    archetype: 'O Ancestral — memória e tempo',
    somaticAreas: ['Pés', 'Tornozelos', 'Memória'],
    esquerdaAlign: [],
    frase: 'Kaua é o signo da idade e da sabedoria ancestral.',
    fonte: 'Verger 1973 · Ifá',
    karmicTheme: 'Ancestralidade — a memória que precede',
  },
};

export function getOdu(id: Odu): OduArchetype {
  const odu = ODUS[id];
  if (!odu) throw new Error(`Odu ${id} não existe — valores válidos: 1-16`);
  return odu;
}

/** Returns all Odus that have left-hand (Esquerda) alignment */
export function getEsquerdaOdus(): OduArchetype[] {
  return Object.values(ODUS).filter((o) => o.esquerdaAlign.length > 0);
}
