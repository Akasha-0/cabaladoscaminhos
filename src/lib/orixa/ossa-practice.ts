// @ts-nocheck
// SKIP_LINT

/**
 * Ossa Practice — ORIXÁ OSSAIM
 * Práticas ritualísticas e sagradas para Ossa/Ossaim, Orixá do Ferro e das Armas.
 */

export interface OssaPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): OssaPracticeResult {
  return {
    orixa: "Ossaim",
    offering: [
      "Ogum",
      "Ferrão de abelha",
      "Prego enferrujado",
      "Faca velha",
      "Alfinete",
      "Metal enferrujado",
      "Cabaça com mel",
      "Pinhão torrado",
      "Ekó de obi",
    ],
    ebó: [
      "Para proteção contra inimigos: enterrar um ogum debaixo da porta com sal e fumo",
      "Para abrir caminho: passar prego enferrujado na soleira da porta com azeite dendê",
    ],
    pontos_cantados: [
      "E sourcei! Ossaim yê yêô",
      "Iá Ossaim! Iá Ossaim!",
      "Ossaim mojubá",
      "Ossaim ferra, Ossaim corta",
    ],
    fundamentos: [
      "Ossaim é o Orixá do ferro, das armas e do trabalho",
      "É identificado com o alfange (faca cerimonial), representando o corte e a proteção",
      "É o sudoeste - sudo/leste, pemba branca, ogum e ferrugem são seus elementos",
      "Para abrir seu caminho: use prego enferrujado, ogum e mel",
      "O ferão de abelha é seu símbolo: representando a defesa e a ordem",
    ],
  };
}