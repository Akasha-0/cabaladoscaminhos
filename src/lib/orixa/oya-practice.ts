 
/* prettier-ignore */

// @ts-nocheck

/**
 * Oya Practice Module
 * Práticas ritualísticas e sagradas para Oya, Orixá dos ventos, tempestades e transformações.
 */

export interface OyaPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): OyaPracticeResult {
  return {
    orixa: "Oya",
    offering: [
      "Pano marrom",
      "Pano verde",
      "Dendê",
      "Palha de carnaúba",
      "Ekó de obi",
      "Milho torrado",
      "Amendoim torrado",
      "Velas verdes e marrons",
      "Fumo de rolo",
      "Inhame",
    ],
    ebó: [
      "Para proteção contra mudanças súbitas: pano verde na porta com dendê",
      "Para controlar ventos: palha de carnaúba no quintal com milho torrado",
      "Para transformação: acender velas verdes e marrons em seu altar"
    ],
    pontos_cantados: [
      "Oya ê ê ô! Rainha das tempestades",
      "Tempestade que varre, tempestade que limpa",
      "Oya no vento, Oya na chuva",
      "Inhame de Oya, dono do raio",
    ],
    fundamentos: [
      "Oya é a Orixá dos ventos, tempestades, raios e transformações rápidas",
      "É identificada com o dendê e a palha de carnaúba, representando a força da natureza",
      "É o nordeste - dendê, palha e fumo são seus elementos",
      "Para abrir seu caminho: use dendê, fumo de rolo e pano verde",
      "Inhame é sua comida sagrada",
      "É a guardiã dos cemitérios e das transformações",
      "Conhecida como Oya-Iansã, a esposa de Xangô",
    ],
  };
}
