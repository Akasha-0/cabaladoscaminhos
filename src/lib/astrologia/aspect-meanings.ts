 
import type { AspectoTipo } from './tipos';

export interface AspectoMeaning {
  nome: string;
  simbolo: string;
  natureza: string;
  descricao: string;
}

const MEANINGS: Record<AspectoTipo, AspectoMeaning> = {
  'conjunção': {
    nome: 'Conjunção',
    simbolo: '☌',
    natureza: 'Energia focada, integração',
    descricao:
      'A conjunção representa a fusão de duas energias planetárias. É o aspecto mais intenso, onde as forças se unem para potencializar-se mutuamente. Traz foco, clareza de propósito e início de ciclos. Quando benéfica, confere força e determinação; quando desafiadora, pode indicar concentração de tensões ou übers identification com o tema do aspecto.',
  },
  sextil: {
    nome: 'Sextil',
    simbolo: '⚹',
    natureza: 'Oportunidade, comunicação facilitada',
    descricao:
      'O sextil é um aspecto harmonioso que oferece oportunidades naturais para crescimento e criatividade. Liga signos de elementos compatíveis, facilitando a ação e a comunicação. Traz facilidade em aplicar energias de forma construtiva, mas requer iniciativa para ser ativado — não apresenta resistência, apenas potencial a ser aproveitado.',
  },
  quadratura: {
    nome: 'Quadratura',
    simbolo: '□',
    natureza: 'Tensão, desafio, ação necessária',
    descricao:
      'A quadratura gera tensão entre signos do mesmo modo (cardinal, fixo ou mutável), creando uma energia de fermentação que exige ação. Não é destrutiva, mas confronta o nativo com obstáculos que precisam ser enfrentados para que haja desenvolvimento real. O estágio é提供的challenge gera crescimento — se for trabalhada conscientemente, a tensão se transforma em força motriz. Se ignorada, manifesta-se como frustração ou crise.',
  },
  trino: {
    nome: 'Trino',
    simbolo: '△',
    natureza: 'Harmonia, fluidez, facilidade natural',
    descricao:
      'O trino é o aspecto de maior fluidez, conectando signos do mesmo elemento em harmonia natural. Traz facilidade para tudo que toca — talento inato, sorte circunstancial, conexões suaves. Porém,太过-harmonia pode levar à preguiça ou complacência, já que não há tensão a ser superada. É o tipo de aspecto que o nativo nem percebe que possui, exceto quando falta.',
  },
  'oposição': {
    nome: 'Oposição',
    simbolo: '☍',
    natureza: 'Polaridade, confronto, integração demandada',
    descricao:
      'A oposição conecta signos opostos do zodíaco, apresentando duas forças em tensão dialética. Traz consciência de полярности, a capacidade de ver ambos os lados de qualquer questão. O desafio é a indecisão ou a projeção — jogar fora o que não se quer reconhecer em si mesmo. Quando conscientemente integrada, oferece maturidade attravers útil e amplitude de perspectiva; quando não, manifesta-se como conflito, relacionamentos em espelho, ouパターn de ação-reação.',
  },
};

export function getAspectMeaning(tipo: AspectoTipo): AspectoMeaning {
  return MEANINGS[tipo];
}
