/* prettier-ignore */

// @ts-nocheck
// SKIP_LINT

/**
 * Opor Practice Module
 * Práticas ritualísticas e sagradas para Opor, Orixá da abundância e colheita.
 */

import { getDataById } from './opor-data';

export interface OporPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
  affirmations: string[];
  meditations: string[];
}

export function performPractice(): OporPracticeResult {
  const oporData = getDataById('opor');
  
  return {
    orixa: "Opor",
    offering: oporData?.offerings || [
      "Velas verdes",
      "Farinha de milho",
      "Mel",
      "Frutas maduras",
      "Milho",
      "Feijão",
      "Mandioca",
      "Cana-de-açúcar",
      "Azeite de dendê",
      "Flores silvestres",
    ],
    ebó: [
      "Para prosperidade: acenda vela verde com mel no altar de Opor",
      "Para gratidão: ofereça frutas maduras ao amanhecer",
      "Para abundância: cozinhe farinha de milho com mel e dedilhe o altar",
      "Para fartura: plante sementes de milho em terra fértil durante a lua crescente",
      "Para bênçãos da colheita: unte as mãos com azeite de dendê e abençoie sua mesa",
    ],
    pontos_cantados: [
      "Opor Ora! Opor Ora! Senhor da Abundância",
      "Ayo! Ayo! Colheita cheirosa",
      "Opor no campo, Opor no lar",
      "Abundância de Opor, bênçãos sem fim",
      "Gratidão e prosperidade, dons de Opor",
    ],
    fundamentos: [
      "Opor é o Orixá da abundância e da colheita, o doleiro generoso que distribui os dons da natureza",
      "Rege a terra e a água, garantindo que as plantações cresçam em abundância",
      "As cores sagradas são o verde e o laranja - representação da fertilidade e do sol maduro",
      "Vênus é seu planeta regente, trazendo amor e prosperidade",
      "Os números sagrados são 6, 8 e 12 - representando harmonia, abundância e completude",
      "O boi, o cavalo e a pomba são seus animais sagrados",
      "Milho, feijão, mandioca e cana-de-açúcar são suas plantas sagradas",
      "A gratidão é a chave para receber as bênçãos de Opor",
      "O ciclo de colheita inclui: Plantio, Crescimento, Floração e Colheita",
      "A verdadeira abundância está em compartilhar, não em acumular",
    ],
    affirmations: oporData?.affirmation ? [oporData.affirmation] : [
      "Eu sou digno de abundância",
      "Agradeço por todas as bênçãos que recebo",
      "Abro meu coração para compartilhar com outros",
      "A prosperidade flui em minha vida",
      "Sou grato pela fartura que Opor me concede",
    ],
    meditations: oporData?.meditation ? [oporData.meditation] : [
      "Visualize campos dourados se estendendo até o horizonte",
      "Sinta a leveza de ser abundante",
      "Permita que Opor encha seu coração com gratidão e generosidade",
    ],
  };
}