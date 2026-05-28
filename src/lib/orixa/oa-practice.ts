/* prettier-ignore */

// @ts-nocheck
// SKIP_LINT

/**
 * Oa Practice Module
 * Práticas ritualísticas e sagradas para Oa, Orixá da sabedoria cósmica e iluminação.
 */

export interface OaPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): OaPracticeResult {
  return {
    orixa: "Oa",
    offering: [
      "Azeite de oliva",
      "Mel",
      "Velas douradas",
      "Livros sagrados",
      "Incenso de sálvia",
      "Alecrim",
      "Lavanda",
      "Ouro",
      "Âmbar",
      "Pão integral",
    ],
    ebó: [
      "Para abrir a mente: acenda vela dourada com azeite de oliva e mel no altar",
      "Para buscar sabedoria: incenso de sálvia com alecrim e um livro aberto",
      "Para iluminação interior: visualize uma estrela dourada acima da cabeça",
      "Para proteção do conhecimento: unte a testa com azeite de oliva misturado com mel"
    ],
    pontos_cantados: [
      "Oa Ori! Oa Ori! Senhor da sabedoria",
      "Luz que ilumina, luz que guia",
      "Oa no cosmos, Oa na mente",
      "Sabedoria de Oa, luz sem fim",
    ],
    fundamentos: [
      "Oa é o Orixá da sabedoria cósmica e da iluminação interior",
      "É identificado com o azeite de oliva e o mel, representando a pureza e a doçura do conhecimento",
      "É o dourado e o âmbar - luz, sol e clareza são seus elementos",
      "Para abrir sua mente: use azeite de oliva, mel e velas douradas",
      "Livros e incenso de sálvia são suas oferendas sagradas",
      "É o guardião dos segredos do universo",
      "Conhecido como o Senhor da Sabedoria Cósmica",
      "Ressoa com Mercúrio, o planeta da comunicação e do conhecimento",
      "A coruja e o falcão são seus animais sagrados",
      "O número 7 é sagrado para Oa, representando a perfeição espiritual",
    ],
  };
}