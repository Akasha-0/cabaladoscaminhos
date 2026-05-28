// Ritual guides — step-by-step guidance for spiritual rituals

import { RitualCategory } from './ritual-types';

export interface RitualStep {
  ordem: number;
  titulo: string;
  descricao: string;
  duracaoMinutos?: number;
}

export interface RitualGuide {
  categoria: RitualCategory;
  nome: string;
  proposito: string;
  passos: RitualStep[];
  elementos: string[];
  cuidados: string[];
  horarios: string[];
}

/**
 * Get all ritual guides
 */
export function getGuides(): RitualGuide[] {
  return [
    {
      categoria: 'protection',
      nome: 'Ritual de Protecao',
      proposito: 'Criar escudo energetico, afastar influencias negativas e purificar o espaco sagrado.',
      passos: [
        {
          ordem: 1,
          titulo: 'Preparacao do Espaco',
          descricao: 'Limpe o ambiente fisicamente e energeticamente. Acenda incenso de alecrim ou lavanda.',
          duracaoMinutos: 10,
        },
        {
          ordem: 2,
          titulo: 'Definir Intencao',
          descricao: 'Estabeleca claramente sua intencao de protecao. Visualize um escudo de luz ao redor.',
          duracaoMinutos: 5,
        },
        {
          ordem: 3,
          titulo: 'Circulo de Protecao',
          descricao: 'Trace um circulo no chao com sal ou marque com velas nos pontos cardeais.',
          duracaoMinutos: 10,
        },
        {
          ordem: 4,
          titulo: 'Invocacao',
          descricao: 'Recite uma oracao ou mantra de protecao. Pode ser personalizado.',
          duracaoMinutos: 5,
        },
        {
          ordem: 5,
          titulo: 'Fechamento',
          descricao: 'Agradeza aos elementos e desfaça o circulo no sentido anti-horario.',
          duracaoMinutos: 5,
        },
      ],
      elementos: ['incenso', 'sal', 'velas brancas', 'agua salgada', 'quartzo transparente'],
      cuidados: [
        'Evite realizar durante a lua cheia para rituais de protecao',
        'Nao interrompa o ritual apos inicia-lo',
        'Mantenha celular desligado durante a pratica',
      ],
      horarios: ['anoitecer', 'meia-noite', 'aurora'],
    },
    {
      categoria: 'prosperity',
      nome: 'Ritual de Prosperidade',
      proposito: 'Atrair abundancia, oportunidades e prosperidade em todas as areas da vida.',
      passos: [
        {
          ordem: 1,
          titulo: 'Preparacao',
          descricao: 'Escolha um local bem iluminado. Tenha uma vela verde ou dourada.',
          duracaoMinutos: 5,
        },
        {
          ordem: 2,
          titulo: 'Definir Abundancia',
          descricao: 'Escreva em papel o que deseja manifestar em termos de prosperidade.',
          duracaoMinutos: 10,
        },
        {
          ordem: 3,
          titulo: 'Abertura Energetica',
          descricao: 'Acenda a vela e visualize luz verde entrando no seu espaco.',
          duracaoMinutos: 10,
        },
        {
          ordem: 4,
          titulo: 'Ancoragem',
          descricao: 'Coloque moedas ou cristal de citrino no centro. Recite affirmations de abundancia.',
          duracaoMinutos: 10,
        },
        {
          ordem: 5,
          titulo: 'Fechamento',
          descricao: 'Agradeca pela abundancia que ja esta a caminho. Apague a vela com consentimento.',
          duracaoMinutos: 5,
        },
      ],
      elementos: ['vela verde', 'moedas', 'citrino', 'canela', 'mel'],
      cuidados: [
        'Evite duvidar do processo durante o ritual',
        'Nao enterre velas她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们她们',
        'Apos o ritual, tome atitude em direcao aos seus objetivos',
      ],
      horarios: ['nascer do sol', 'meio-dia', 'quarta-feira'],
    },
    {
      categoria: 'love',
      nome: 'Ritual de Amor',
      proposito: 'Fortalecer relacionamentos, cultivar autoamor e promover curacao emocional.',
      passos: [
        {
          ordem: 1,
          titulo: 'Preparacao Interior',
          descricao: 'Tome um banho de ervas com rosas e alecrim. Vista-se com cores que representem amor.',
          duracaoMinutos: 15,
        },
        {
          ordem: 2,
          titulo: 'Espaco Sagrado',
          descricao: 'Organize um espaco com duas velas cor-de-rosa, flores naturais e agua.',
          duracaoMinutos: 10,
        },
        {
          ordem: 3,
          titulo: 'Meditacao de Amor',
          descricao: 'Sente-se confortavelmente. Visualize amor proprio emanando do seu coracao.',
          duracaoMinutos: 15,
        },
        {
          ordem: 4,
          titulo: 'Escrita Terapêutica',
          descricao: 'Escreva uma carta para si mesmo sobre amor, ou para quem deseja enviar amor.',
          duracaoMinutos: 15,
        },
        {
          ordem: 5,
          titulo: 'Energetizacao',
          descricao: 'Segure uma rosa vermelha enquanto recita palavras de amor e aceitaçao.',
          duracaoMinutos: 10,
        },
      ],
      elementos: ['velas cor-de-rosa', 'rosas vermelhas', 'quartzo rosa', 'agua de rosas', 'perfume de jasmin'],
      cuidados: [
        'Ritual de amor nao deve forçar vontade de terceiros',
        'Foque primeiramente no amor proprio',
        'Evite realizar em momentos de raiva ou tristeza profunda',
      ],
      horarios: ['sexta-feira a noite', 'lua crescente', 'amanhecer'],
    },
    {
      categoria: 'healing',
      nome: 'Ritual de Cura',
      proposito: 'Promover cura fisica, emocional e espiritual, liberando bloqueios energeticos.',
      passos: [
        {
          ordem: 1,
          titulo: 'Purificacao',
          descricao: 'Realize smudging com sage ou palo santo. Permita que a fumaça purify o ambiente.',
          duracaoMinutos: 10,
        },
        {
          ordem: 2,
          titulo: 'Conexao',
          descricao: 'Deite-se confortavelmente. Respire profundamente e solicite cura superior.',
          duracaoMinutos: 10,
        },
        {
          ordem: 3,
          titulo: 'Visualizacao Curativa',
          descricao: 'Visualize luz dourada ou esverdeada tocando a area que deseja curar.',
          duracaoMinutos: 15,
        },
        {
          ordem: 4,
          titulo: 'Afirmações',
          descricao: 'Repita affirmations de cura: "Eu sou inteiro", "Minha energia flui livremente".',
          duracaoMinutos: 10,
        },
        {
          ordem: 5,
          titulo: 'Aterramento',
          descricao: 'Coloque as maos no chao. Sinta a conexao com a terra. Agradeça pela cura.',
          duracaoMinutos: 10,
        },
      ],
      elementos: ['sage', 'palo santo', 'velas verdes', 'agua salgada', 'amatista'],
      cuidados: [
        'Rituais de cura complementam mas nao substituem tratamento médico',
        'Beba agua limpa apos o ritual',
        'Descanse bem apos sessões curativas intensas',
      ],
      horarios: ['lua cheia', 'amanhecer', 'por do sol'],
    },
    {
      categoria: 'clarity',
      nome: 'Ritual de Clareza',
      proposito: 'Ampliar a visao espiritual, desenvolver intuicao e conectar-se com a sabedoria interior.',
      passos: [
        {
          ordem: 1,
          titulo: 'Ambiente',
          descricao: 'Escureça o ambiente. Acenda velas azuis ou roxas. Use cristais clarificadores.',
          duracaoMinutos: 5,
        },
        {
          ordem: 2,
          titulo: 'Meditacao Silenciosa',
          descricao: 'Permaneça em silencia por 20 minutos. Observe pensamentos sem apego.',
          duracaoMinutos: 20,
        },
        {
          ordem: 3,
          titulo: 'Perguntas',
          descricao: 'Formule perguntas claras sobre a area que busca clareza. Anote mentalmente.',
          duracaoMinutos: 5,
        },
        {
          ordem: 4,
          titulo: 'Abertura Intuitiva',
          descricao: 'Feche os olhos. Aguarde respostas que venham como sensacoes, imagens ou palavras.',
          duracaoMinutos: 15,
        },
        {
          ordem: 5,
          titulo: 'Registro',
          descricao: 'Anote tudo que surgiu, mesmo que pareca nao fazer sentido inicialmente.',
          duracaoMinutos: 10,
        },
      ],
      elementos: ['lapis lazuli', 'quartzo cristal', 'vela azul', 'incenso de sálvia branca', 'espelho pequeno'],
      cuidados: [
        'Evite forçar interpretacoes imediatas',
        'Permita que insights cheguem naturalmente',
        'Anote até mesmo sonhos dos dias seguintes',
      ],
      horarios: ['lua nova', 'madrugada', 'quinta-feira'],
    },
    {
      categoria: 'transformation',
      nome: 'Ritual de Transformacao',
      proposito: 'Facilitar mudancas profundas, renovacao interior e evolucao da consciencia.',
      passos: [
        {
          ordem: 1,
          titulo: 'Ruptura',
          descricao: 'Escreva em papel o que deseja deixar para tras. Queime com intencao de libertacao.',
          duracaoMinutos: 15,
        },
        {
          ordem: 2,
          titulo: 'Purificacao Profunda',
          descricao: 'Tome um banho ritual com sal grosso, alecrim e flores escuras.',
          duracaoMinutos: 20,
        },
        {
          ordem: 3,
          titulo: 'Metamorfose',
          descricao: 'Visualize-se como a pessoa que deseja se tornar. Sinta essa realidade.',
          duracaoMinutos: 15,
        },
        {
          ordem: 4,
          titulo: 'Compromisso',
          descricao: 'Escreva um novo pacto consigo mesmo. Assine com seu nome e data.',
          duracaoMinutos: 10,
        },
        {
          ordem: 5,
          titulo: 'Renascimento',
          descricao: 'Acenda uma vela laranja ou fênix. Celebre sua disposicao para mudar.',
          duracaoMinutos: 10,
        },
      ],
      elementos: ['velas alaranjadas', 'pena', 'incenso de mirra', 'obsidiana', 'agua corrente'],
      cuidados: [
        'Transformaçao requer paciencia e repeticao',
        'Nao se force a mudar tudo de uma vez',
        'Celebre pequenas victorias no caminho',
      ],
      horarios: ['lua minguante', 'anoitecer', 'domingo'],
    },
    {
      categoria: 'manifestation',
      nome: 'Ritual de Manifestacao',
      proposito: 'Materializar intencoes, concretizar desejos e alinhar com propositos de vida.',
      passos: [
        {
          ordem: 1,
          titulo: 'Alinhamento',
          descricao: 'Defina com precisao o que deseja manifestar. Seja especifico e detalhado.',
          duracaoMinutos: 10,
        },
        {
          ordem: 2,
          titulo: 'Visualizacao Viva',
          descricao: 'Crie na sua mente a experiencia de ja possuir o que deseja. Use todos os sentidos.',
          duracaoMinutos: 15,
        },
        {
          ordem: 3,
          titulo: 'Scripting',
          descricao: 'Escreva no tempo presente como se ja fosse realidade. Leia em voz alta.',
          duracaoMinutos: 15,
        },
        {
          ordem: 4,
          titulo: 'Acao Alignhada',
          descricao: 'Identifique um passo concreto que pode tomar hoje em direcao ao objetivo.',
          duracaoMinutos: 5,
        },
        {
          ordem: 5,
          titulo: 'Gratidao',
          descricao: 'Agradeça como se o desejo ja estivesse realizado. Sinta a emoçao da realizaçao.',
          duracaoMinutos: 10,
        },
      ],
      elementos: ['caderno de manifestacao', 'caneta dourada', 'vela dourada', 'pirita', 'cristal'],
      cuidados: [
        'Mantenha o desejo em sua mente sem apego ao resultado',
        'Observe sinais e oportunidades que surgem',
        'Açao配合 visualizacao para melhores resultados',
      ],
      horarios: ['lua crescente', 'nascer do sol', 'terca-feira'],
    },
    {
      categoria: 'release',
      nome: 'Ritual de Liberacao',
      proposito: 'Soltar o que nao serve mais, perdoar, libertar-se e encontrar paz interior.',
      passos: [
        {
          ordem: 1,
          titulo: 'Identificacao',
          descricao: 'Reconheça claramente o que precisa ser libertado. Nomeie sem julgamento.',
          duracaoMinutos: 10,
        },
        {
          ordem: 2,
          titulo: 'Escrita Liberadora',
          descricao: 'Escreva uma carta para a pessoa ousituaçao. Diga tudo que precisa ser dito.',
          duracaoMinutos: 15,
        },
        {
          ordem: 3,
          titulo: 'Perdao',
          descricao: 'Se for sobre perdao, repita: "Eu perdoo ___ e me liberto dessa carga."',
          duracaoMinutos: 10,
        },
        {
          ordem: 4,
          titulo: 'Libertacao Fisica',
          descricao: 'Enterre o papel, queime com seguranca, ou deixe levar pela agua.',
          duracaoMinutos: 10,
        },
        {
          ordem: 5,
          titulo: 'Novo Começo',
          descricao: 'Respire fundo e visualize espaco vazio sendo preenchido com paz.',
          duracaoMinutos: 10,
        },
      ],
      elementos: ['papel e caneta', 'terra ou agua', 'vela preta', 'sal preto', 'flores secas'],
      cuidados: [
        'Nao rush o processo de liberaçao emocional',
        'Permita-se sentir durante o ritual',
        'Descanse bastante apos sessoes intensas',
      ],
      horarios: ['lua cheia', 'por do sol', 'sabado'],
    },
  ];
}

/**
 * Get guide by ritual category
 */
export function getGuideByCategory(categoria: RitualCategory): RitualGuide | undefined {
  return getGuides().find((g) => g.categoria === categoria);
}