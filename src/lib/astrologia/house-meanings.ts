// fallow-ignore-file unused-file
export interface HouseMeaning {
  number: number;
  name: string;
  element: string;
  modality: string;
  themes: string[];
  description: string;
}

const houses: HouseMeaning[] = [
  {
    number: 1,
    name: "O Cavaleiro",
    element: "Cardinal",
    modality: "Yang",
    themes: ["início", "velocidade", "notícias", "movimentos rápidos", "corpo físico"],
    description:
      "A casa do início. Rege a velocidade com que as notícias chegam, os movimentos rápidos e o ponto de partida de toda a jornada.",
  },
  {
    number: 2,
    name: "O Trevo",
    element: "Fixed",
    modality: "Yin",
    themes: ["obstáculos", "imprevistos", "sorte", "testes cotidianos"],
    description:
      "Casa dos pequenos obstáculos. Refere-se a imprevistos, testes cotidianos, sorte rápida e pequenas dificuldades de percurso.",
  },
  {
    number: 3,
    name: "O Navio",
    element: "Mutable",
    modality: "Yang",
    themes: ["viagens", "transições", "mudanças profundas", "horizontes"],
    description:
      "Casa das viagens e transições. Rege mudanças de longo prazo, transições profundas e horizontes — mudanças geográficas ou de estado.",
  },
  {
    number: 4,
    name: "A Casa",
    element: "Cardinal",
    modality: "Yin",
    themes: ["família", "base", "estabilidade", "corpo físico", "raízes"],
    description:
      "A base da vida. Casa do lar, da família, das raízes, da estabilidade e do corpo físico — suas origens inconscientes.",
  },
  {
    number: 5,
    name: "A Árvore",
    element: "Fixed",
    modality: "Yang",
    themes: ["saúde", "crescimento", "ancestralidade", "colheita duradoura"],
    description:
      "Casa da saúde e do crescimento. Rege a saúde física e espiritual, o crescimento lento, a ancestralidade e a colheita duradoura.",
  },
  {
    number: 6,
    name: "As Nuvens",
    element: "Mutable",
    modality: "Yin",
    themes: ["dúvidas", "confusão", "instabilidade", "clareza que falta"],
    description:
      "Casa das dúvidas. Rege a confusão mental, instabilidade, incertezas temporárias e a clareza que falta no momento.",
  },
  {
    number: 7,
    name: "A Cobra",
    element: "Cardinal",
    modality: "Yang",
    themes: ["traição", "autossabotagem", "astúcia", "rivalidades", "desejos ocultos"],
    description:
      "A casa dos alertas. Rege traição, autossabotagem, astúcia, rivalidades, desejos ocultos e magnetismo — o perigo oculto.",
  },
  {
    number: 8,
    name: "O Caixão",
    element: "Fixed",
    modality: "Yin",
    themes: ["fim de ciclo", "transformações radicais", "perdas necessárias", "renascimento"],
    description:
      "Casa dos ciclos profundos. Rege o fim de ciclo, transformações radicais, perdas necessárias e o renascimento.",
  },
  {
    number: 9,
    name: "As Flores",
    element: "Mutable",
    modality: "Yang",
    themes: ["felicidade", "presentes do destino", "cura", "celebração", "convites"],
    description:
      "Casa da felicidade. Rege os presentes do destino, a cura, a celebração, os convites e o bem-estar — a casa da alegria.",
  },
  {
    number: 10,
    name: "A Foice",
    element: "Cardinal",
    modality: "Yang",
    themes: ["cortes abruptos", "decisões radicais", "colheita rápida", "cirurgias"],
    description:
      "Casa dos cortes. Rege decisões radicais, cortes abruptos sem volta, a colheita rápida e o resultado do plantio.",
  },
  {
    number: 11,
    name: "O Chicote",
    element: "Fixed",
    modality: "Yin",
    themes: ["conflitos", "estresse", "demandas espirituais", "repetição de padrões"],
    description:
      "Casa dos conflitos. Rege brigas, discussões, estresse, demandas espirituais, repetição de padrões e o desgaste.",
  },
  {
    number: 12,
    name: "Os Pássaros",
    element: "Mutable",
    modality: "Yin",
    themes: ["comunicação", "conversas", "flertes", "agitação", "estresse leve"],
    description:
      "Casa da comunicação. Rege conversas cotidianas, flertes, agitação, reuniões, parcerias dinâmicas e o estado de ansiedade.",
  },
];

export function getHouseMeaning(houseNumber: number): HouseMeaning | null {
  return houses.find((h) => h.number === houseNumber) ?? null;
}

export function getAllHouseMeanings(): HouseMeaning[] {
  return houses;
}