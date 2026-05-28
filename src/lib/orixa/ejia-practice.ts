/* prettier-ignore */
// SKIP_LINT

/**
 * Ejia Practice Module
 * Práticas ritualísticas e sagradas para Ejia, Orixá das águas doces, beleza e prosperidade.
 */

export interface EjiaPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

/**
 * Performs the Ejia practice ritual
 * Ejia governs fresh water, beauty, love, prosperity, and the gentle flow of life
 */
export function performPractice(): EjiaPracticeResult {
  return {
    orixa: "Ejia",
    offering: [
      "Mel",
      "Água de cheiro",
      "Flores amarelas",
      "Flores roses",
      "Fio de contas dourado",
      "Pente de prata",
      "Espelho pequeno",
      "Canela",
      "Cravo",
      "Coco ralado",
      "Amendoim doce",
      "Velas douradas",
      "Óleo de dendê",
    ],
    ebó: [
      "Para prosperidade: mel no centro do altar, velas douradas ao redor, água fresca em vaso de vidro",
      "Para beleza e auto-estima: banhar-se com água de flores roses e mel ao amanhecer",
      "Para atrair amor: água de cheiro no quarto, espelho sob o travesseiro com fio de contas",
      "Para proteção da saúde: acender velas douradas, oferecer coco ralado e canela",
    ],
    pontos_cantados: [
      "Ejia ô! Rainha das águas doces",
      "Água que corre, ouro que flui",
      "Ejia no espejo, Ejia na fonte",
      "Doce como mel, rica como ouro",
      "Ejia! EJIA! A Senhora das Riquezas!",
      "Oxum高高, Ejia é meu nome",
      "Água doce que lava, água doce que traz",
      "Ejia ê! Dona da beleza",
    ],
    fundamentos: [
      "Ejia é a Orixá das águas doces, da beleza, do amor e da prosperidade material",
      "É identificada com o ouro, espelhos, pentes e fios de contas, representando a luz interior e a abundancia",
      "É o leste - mel, flores e espelhos são seus elementos sagrados",
      "Para abrir seu caminho: use mel, ouro, espelhos e água de cheiro",
      "Ejia governa a fertilidade, a maternidade e a proteção das crianças",
      "É frequentemente confundida ou asociada com Oxum, sua irmã gemela nas águas",
      "Suas cores sagradas são o dourado e o amarelo, brilhando como o sol sobre as águas",
      "Ejia é a guardiã dos rios e das fontes, trazendo vida onde passa",
    ],
  };
}