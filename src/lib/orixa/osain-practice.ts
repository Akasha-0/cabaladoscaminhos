/* eslint-disable @typescript-eslint/no-unused-vars */
/* prettier-ignore */

// @ts-nocheck

/**
 * Osain Practice — ORIXÁ OSAIN
 * Práticas ritualísticas e sagradas para Osain, Orixá das Ervas e da Medicina.
 */

export interface OsainPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): OsainPracticeResult {
  return {
    orixa: "Osain",
    offering: [
      "Ervas frescas variadas",
      "Água de oxy",
      "Ekó de obi",
      "Fumo de charuto",
      "Farinha de mandioca",
      "Akpá (farinha de milho)",
      "Alujá",
      "Duas galinhas brancas",
      "Efun (giz branco)",
      "Goma de mascar",
    ],
    ebó: [
      "Para cura de doenças: cozinhar folhas de eucalipto com água de oxy e banhar o paciente ao amanhecer",
      "Para proteção espiritual: fazer defumação com ervas de Osain e fumo na entrada da casa",
      "Para abrir caminho: colocar prato branco com farinha de mandioca, ervas e ekó no chão de Oxum",
    ],
    pontos_cantados: [
      "E sourcei! Osain yê yêô",
      "Iá Osain! Iá Osain mojubá",
      "Osain na floresta, Osain no mato",
      "Osain saravá!",
      "Oxum mi dá oquê!",
    ],
    fundamentos: [
      "Osain é o Orixá das ervas, da medicina e dos segredos naturais",
      "Conhece todas as folhas e raízes do mundo, sendo o mestre da fitoterapia sagrada",
      "É identificado com o osso de ovelha como ferramenta de cura e pagamento de ebó",
      "Trabalha em conjunto com Oxum para equilibrar a cura espiritual e física",
      "Para abrir seu caminho: use ervas frescas, água de oxy e ekó de obi",
      "Osain é o sudoeste - sudo/leste, associado às matas e ao conhecimento das plantas medicinais",
    ],
  };
}