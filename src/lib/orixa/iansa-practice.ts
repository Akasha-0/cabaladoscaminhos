/* eslint-disable @typescript-eslint/no-unused-vars */
/* prettier-ignore */

// @ts-nocheck

/**
 * Iansã Practice Module
 * Práticas ritualísticas e sagradas para Iansã, Orixá dos ventos, tempestades e mudanças súbitas.
 */

export interface IansaPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): IansaPracticeResult {
  return {
    orixa: "Iansã",
    offering: [
      "Palha de dendê",
      "Estrutura feita com cipó e madeira",
      "Pano branco",
      "Pano vermelho",
      "Galinha amarela",
      "Cachimbo de barro",
      "Fumo de rolo",
      "Velas vermelhas e brancas",
      "Ekó de obi",
      "Amendoim torrado",
    ],
    ebó: [
      "Para proteção contra mau-olhado: palha de dendê na entrada da casa com fumo de rolo",
      "Para abrir caminho: estrutura de cipó na encruzilhada com galinha amarela",
      "Para sorte: acender velas vermelhas e brancas em seu altar"
    ],
    pontos_cantados: [
      "E sourcei! Iansã yê yêô",
      "Tempestade vem, tempestade vai",
      "Iansã na feira, Iansã no mercado",
      "Ogbe! Iansã okê",
    ],
    fundamentos: [
      "Iansã é a Orixá dos ventos, tempestades, raios e mudanças súbitas",
      "É identificada com o dendê e a palha, representando a força da natureza",
      "É o nordeste - pemba vermelha, palha de dendê e fumo são seus elementos",
      "Para abrir seu caminho: use palha de dendê, fumo de rolo e pano vermelho",
      "Galinha amarela e vermelha são suas consagradas",
      "É a rainha das encruzilhadas e das mudanças",
      "Conhecida como Iansã-Aiaba, a dona do raio",
    ],
  };
}