export interface OrunmilaData {
  name: string;
  nameSanskrit?: string;
  qualities: string[];
  domains: string[];
  symbols: string[];
  sacredNumbers: number[];
  colors: string[];
  dayOfWeek: string;
  offerings: string[];
  affirmations: string[];
  correspondences: Record<string, string>;
}

export function getData(): OrunmilaData {
  return {
    name: "Orunmila",
    nameSanskrit: "Vidya",
    qualities: [
      "Sabedoria Divinatória",
      "Conhecimento do Destino",
      "Mestria dos Odu",
      "Clareza Mental",
      "Capacidade de Decisão",
      "Memória Ancestral",
    ],
    domains: [
      "Divinação por Odu Ifá",
      "Leitura do destino",
      "Protocolos rituals de Ifá",
      "Resolução de conflitos",
      "Interpretação de presságios",
      "Manutenção dos segredos sagrados",
    ],
    symbols: [
      "Opon (tbaktaya)",
      "Opele (corrente de Ifá)",
      "Ikin (nozes de dendê)",
      "Erindinlogbon (caduceu)",
      "Sagrado Irocê",
    ],
    sacredNumbers: [4, 8, 16, 256],
    colors: ["Verde", "Amarelo", "Branco"],
    dayOfWeek: "Quinta-feira",
    offerings: [
      "Inhame cozido",
      "Água de obi (nozes de cola)",
      "Farinha de pili-pili",
      "Meli (mel)",
      "Eru com camarão seco",
    ],
    affirmations: [
      "Eu recebo a sabedoria de Orunmila para iluminar meu caminho",
      "Minha mente está clara e alinhada com o destino correto",
      "Eu leio os sinais com clareza e tomo decisões sábias",
      "Meu futuro é revelado pela luz da divinção sagrada",
    ],
    correspondences: {
      element: "Ar e Éter",
      planet: "Mercúrio",
      astrologicalSign: "Gêmeos / Virgem",
      chakra: "Ajna (Terceiro Olho)",
      deityType: "Orisha da Sabedoria",
      ritualTime: "Dawn",
      sacredDirection: "Leste",
      herbs: "Ewe Ogun (folhas sagradas), Acacia, Mirra",
      stones: "Ágata, Quartzo Claro, Turquesa",
    },
  };
}
