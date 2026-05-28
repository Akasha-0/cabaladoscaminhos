// @ts-nocheck
// SKIP_LINT

/**
 * Oxosse Practice — ORIXÁ OXOSSE
 * Práticas ritualísticas e sagradas para Oxosse, Orixá da Caça e da Virilidade.
 */

export interface PracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): PracticeResult {
  return {
    orixa: "Oxosse",
    offering: [
      "Alecrim fresco",
      "Fumo de charuto",
      "Goma de mascar",
      "Fatia de fumo",
      "Pá de madeira",
      "Prato branco com acaçá",
      "Oguedé (cabrito ou galo)",
      "Alujá",
      "Amendoim torrado",
      "Ekó de obi",
    ],
    ebó: [
      "Para abrir negocio: colocar sobre a porta da rua um prato branco com acaçá, alecrim e fumo",
      "Para proteção:ipefar com a cabeça de um cabrito seco e alecrim na porta de entrada",
    ],
    pontos_cantados: [
      "E sourcei! Oxosse yê yêô",
      "Iá Ossaim! Iá Ossaim!",
      "Oxosse mojubá",
      "Oxosse na mata, Oxosse no mato",
    ],
    fundamentos: [
      "Oxosse é o Orixá das matas, da caça e do lukumi (poder masculino/espiritual)",
      "É identificado com o arco e flecha, representando a firmeza e a caça",
      "É o sudoeste - sudo/leste, pemba branca, fumo e alecrim são suas folhas",
      "Para abrir seu caminho: use alecrim, goma de mascar e charuto",
      "Oguedé é seu animal consagrado: galo ou cabrito branco",
    ],
  };
}
