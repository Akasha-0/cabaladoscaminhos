export interface Lesson {
  id: string;
  title: string;
  description: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

export const learningPaths: LearningPath[] = [
  {
    id: "cabala",
    title: "Cabala",
    description: "Tradição mística judaica de crescimento espiritual através da Árvore da Vida",
    modules: [
      {
        id: "cabala-intro",
        title: "Fundamentos da Cabala",
        description: "Conceitos básicos e história da tradição cabalística",
        lessons: [
          { id: "cabala-origens", title: "Origens e História", description: "Raízes históricas da tradição cabalística" },
          { id: "cabala-mundo", title: "Mundo Invisível", description: "As quatro dimensões da realidade cabalística" },
          { id: "cabala-luz", title: "Luz e Recipiente", description: "Dinâmica entre luz infinita e recepção" },
        ],
      },
      {
        id: "cabala-arvore",
        title: "A Árvore da Vida",
        description: "Estrutura central da Cabala e seus dez sefirot",
        lessons: [
          { id: "cabala-sefirot-1", title: "Keter, Chokhmah e Binah", description: "Os três sefirot superiores" },
          { id: "cabala-sefirot-2", title: "Chesed, Gevurah e Tiferet", description: "A coluna central superior" },
          { id: "cabala-sefirot-3", title: "Netzach, Hod e Yesod", description: "A coluna central inferior" },
          { id: "cabala-malchut", title: "Malchut", description: "O Reino e a manifestação física" },
        ],
      },
      {
        id: "cabala-pratica",
        title: "Prática Cabalística",
        description: "Aplicações práticas do conhecimento cabalístico",
        lessons: [
          { id: "cabala-meditation", title: "Meditação nos Sefirot", description: "Técnicas de contemplação interior" },
          { id: "cabala-letras", title: "As 22 Letras", description: "Alfabeto hebraico e seu significado oculto" },
        ],
      },
    ],
  },
  {
    id: "numerologia",
    title: "Numerologia",
    description: "Arte e ciência dos números como linguagem universal da realidade",
    modules: [
      {
        id: "num-fundamentos",
        title: "Fundamentos da Numerologia",
        description: "Princípios básicos e sistemas numéricos",
        lessons: [
          { id: "num-historia", title: "História e Tradições", description: "De Pitágoras às tradições orientais" },
          { id: "num-calculos", title: "Métodos de Cálculo", description: "Redução teosófica e vibrações numéricas" },
        ],
      },
      {
        id: "num-caminho-vida",
        title: "Caminho de Vida",
        description: "O número que define o propósito da existência",
        lessons: [
          { id: "num-caminho-calc", title: "Cálculo do Caminho", description: "Como determinar o número pessoal" },
          { id: "num-caminho-interpret", title: "Interpretação", description: "Significado dos 12 números de vida" },
        ],
      },
      {
        id: "num-licoes",
        title: "Lições da Alma",
        description: "Desafios e oportunidades do mapa pessoal",
        lessons: [
          { id: "num-licoes-calc", title: "Lições Cármicas", description: "Números que indicam provações" },
          { id: "num-tendencias", title: "Tendências Ocultas", description: "O que a alma trouxe para aprender" },
        ],
      },
    ],
  },
  {
    id: "ifa",
    title: "Ifá",
    description: "Tradição oracular iorubá de sabedoria ancestral e destino",
    modules: [
      {
        id: "ifa-intro",
        title: "Fundamentos de Ifá",
        description: "Conceitos básicos da tradição Ifá",
        lessons: [
          { id: "ifa-orunmila", title: "Orunmila", description: "O orixá da sabedoria e destino" },
          { id: "ifa-odun", title: "Os 16 Odu", description: "Os princípios fundamentais de Ifá" },
        ],
      },
      {
        id: "ifa-sistema",
        title: "O Sistema de Ifá",
        description: "Estrutura e metodologia oracular",
        lessons: [
          { id: "ifa-opele", title: "Opele Ifá", description: "A cadeia oracular e seu uso" },
          { id: "ifa-ikin", title: "Ikín", description: "Nozes de dendê na tradição de Ifá" },
          { id: "ifa-ojubosse", title: "Ojuboṣe", description: "A sanção ritual para consultas" },
        ],
      },
      {
        id: "ifa-modu",
        title: "Modu e Ori",
        description: "Os princípios vitais na cosmovisão Ifá",
        lessons: [
          { id: "ifa-ori-conceito", title: "Ori: A Cabeça Interior", description: "O destino pessoal e sua importância" },
          { id: "ifa-efa", title: "Efa", description: "Os oito signos menores de Ifá" },
        ],
      },
    ],
  },
  {
    id: "astrologia",
    title: "Astrologia",
    description: "Linguagem simbólica dos astros para autoconhecimento e timing cósmico",
    modules: [
      {
        id: "astro-fundamentos",
        title: "Fundamentos da Astrologia",
        description: "Base teórica e histórica da astrologia ocidental",
        lessons: [
          { id: "astro-historia", title: "História da Astrologia", description: "Das tabletes babilônicas ao Renascimento" },
          { id: "astro-zodiaco", title: "O Zodíaco", description: "Os doze signos e sua geometria celestial" },
          { id: "astro-casas", title: "As Doze Casas", description: "As áreas da vida no mapa astral" },
        ],
      },
      {
        id: "astro-planetas",
        title: "Os Planetas",
        description: "Significado arquetípico dos corpos celestes",
        lessons: [
          { id: "astro-sol", title: "Sol: Identidade", description: "O princípio da consciência de si" },
          { id: "astro-lua", title: "Lua: Emoção", description: "O princípio da receptividade" },
          { id: "astro-mercurio", title: "Mercúrio: Mente", description: "O princípio da comunicação" },
          { id: "astro-venus", title: "Vênus: Afeto", description: "O princípio da valorização" },
          { id: "astro-marte", title: "Marte: Ação", description: "O princípio da força vital" },
          { id: "astro-jupiter", title: "Júpiter: Expansão", description: "O princípio do crescimento" },
          { id: "astro-saturno", title: "Saturno: Limite", description: "O princípio da estruturação" },
        ],
      },
      {
        id: "astro-aspectos",
        title: "Aspectos Planetários",
        description: "Relações angulares e seus significados",
        lessons: [
          { id: "astro-aspectos-basicos", title: "Aspectos Principais", description: "Conjunção, oposição, quadratura e trígono" },
          { id: "astro-aspectos-menores", title: "Aspectos Menores", description: "Sextil, semissExtil e as demais combinações" },
        ],
      },
      {
        id: "astro-mapa",
        title: "Leitura do Mapa",
        description: "Técnicas de interpretação e síntese",
        lessons: [
          { id: "astro-significado", title: "Significado vs Signo", description: "Diferença entre planeta e signo" },
          { id: "astro-sintese", title: "Síntese do Mapa", description: "Como integrar todos os elementos" },
        ],
      },
    ],
  },
];

export function getLearningPaths(): LearningPath[] {
  return learningPaths;
}

export function getLearningPath(id: string): LearningPath | undefined {
  return learningPaths.find((p) => p.id === id);
}

export function getModule(pathId: string, moduleId: string): Module | undefined {
  const path = getLearningPath(pathId);
  return path?.modules.find((m) => m.id === moduleId);
}

export function getLesson(pathId: string, moduleId: string, lessonId: string): Lesson | undefined {
  const mod = getModule(pathId, moduleId);
  return mod?.lessons.find((l) => l.id === lessonId);
}
