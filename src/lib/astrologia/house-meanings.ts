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
    name: "Ascendente",
    element: "Cardinal",
    modality: "Yang",
    themes: ["identidade", "aparência", "início", "autopercepção", "corpo físico"],
    description:
      "A casa do eu. Rege a forma como o mundo te vê, seu corpo físico, sua máscara social e o ponto de partida de toda a jornada astrológica.",
  },
  {
    number: 2,
    name: "Fortuna",
    element: "Fixed",
    modality: "Yin",
    themes: ["recursos", "valores", "possessões", "dinheiro", "autoestima"],
    description:
      "Casa dos valores materiais e emocionais. Refere-se às finanças, possessões, ao que você valoriza e considera seu.",
  },
  {
    number: 3,
    name: "Comunicação",
    element: "Mutable",
    modality: "Yang",
    themes: ["comunicação", "irmãos", "vizinhos", "aprendizado", "curiosidade"],
    description:
      "Casa da mente e da troca. Rege os estudos, irmãos, vizinhos, comunicações cotidianas e a forma como você processa informações.",
  },
  {
    number: 4,
    name: "Fundo do Céu",
    element: "Cardinal",
    modality: "Yin",
    themes: ["lar", "família", "raízes", "pai", "herança emocional"],
    description:
      "A base da vida. Casa do lar, da família, das origens, da figura paterna e do que está por trás — suas raízes inconscientes.",
  },
  {
    number: 5,
    name: "Criação",
    element: "Fixed",
    modality: "Yang",
    themes: ["amor", "crianças", "criatividade", "jogo", "autoexpressão"],
    description:
      "Casa da expressão e do prazer. Rege romances, filhos, criatividade, hobbies e tudo que traz alegria e reconhecimento.",
  },
  {
    number: 6,
    name: "Serviço",
    element: "Mutable",
    modality: "Yin",
    themes: ["trabalho", "saúde", "rotina", "dever", "animais"],
    description:
      "Casa da saúde e do serviço. Rege o trabalho diário, a saúde física, a disciplina, os animais de estimação e a仆",
  },
  {
    number: 7,
    name: "Descendente",
    element: "Cardinal",
    modality: "Yang",
    themes: ["parceiros", "casamento", "contratos", "inimizades", "relacionamentos"],
    description:
      "A casa das relações. Rege casamentos, parcerias, contratos, inimigos declarados e o que está fora — o outro.",
  },
  {
    number: 8,
    name: "Transformação",
    element: "Fixed",
    modality: "Yin",
    themes: ["morte", "regeneração", "sexo", "herança", "tabu"],
    description:
      "Casa dos ciclos profundos. Rege morte, renovação, sexualidade, heranças, mistérios e tudo que é oculto ou transformador.",
  },
  {
    number: 9,
    name: "Filosofia",
    element: "Mutable",
    modality: "Yang",
    themes: ["viagens", "filosofia", "fé", "jurisprudência", "expansão"],
    description:
      "Casa da expansão e da sabedoria. Rege viagens longas, estudos superiores, espiritualidade, religião e busca de sentido.",
  },
  {
    number: 10,
    name: "Meio do Céu",
    element: "Cardinal",
    modality: "Yang",
    themes: ["carreira", "mãe", "status", "poder", "vocação"],
    description:
      "A casa da missão de vida. Rege a carreira, a figura materna, o status social, a autoridade e o que você constrói para o mundo.",
  },
  {
    number: 11,
    name: "Humanidade",
    element: "Fixed",
    modality: "Yin",
    themes: ["amizades", "coletivos", "esperanças", "ideais", "tecnologia"],
    description:
      "Casa dos grupos e das aspirações. Rege amizades, comunidades, projetos coletivos, ideais sociais e esperanças futuras.",
  },
  {
    number: 12,
    name: "Perdição",
    element: "Mutable",
    modality: "Yin",
    themes: ["prisão", "hospitais", "vício", "exílio", "inconsciente"],
    description:
      "A casa da alma. Rege prisões, hospitais, instituições, vícios, inimigos ocultos e o inconsciente — o que precisa ser dissolvido.",
  },
];

export function getHouseMeaning(houseNumber: number): HouseMeaning | null {
  return houses.find((h) => h.number === houseNumber) ?? null;
}

export function getAllHouseMeanings(): HouseMeaning[] {
  return houses;
}
