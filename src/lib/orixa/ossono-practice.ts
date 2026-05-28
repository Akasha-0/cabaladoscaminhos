/* prettier-ignore */

// @ts-nocheck

/**
 * Ossono Practice — ORIXÁ OSSONO (OXÓSSI)
 * Práticas ritualísticas e sagradas para Ossono, Orixá da Caça e das Florestas.
 */

export interface OssonoPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): OssonoPracticeResult {
  return {
    orixa: "Ossono",
    offering: [
      "Ekó de obi",
      "Farinha de mandioca",
      "Akpá (farinha de milho)",
      "Amendoim torrado",
      "Milho torrado",
      "Fumo de charuto",
      "Efun (giz branco)",
      "Água de oxy",
      "Flecha ornamentada",
      "Fio de contas azul e branco",
    ],
    ebó: [
      "Para sorte na caça: colocar ekó de obi e farinha de mandioca na entrada da mata ao amanhecer",
      "Para proteção na floresta: defumar com fumo de charuto e passar água de oxy nos pés antes de entrar",
      "Para abrir caminho: oferecer amendoim e milho torrado no pé de árvore grande com ekó",
    ],
    pontos_cantados: [
      "E sourcei! Ossono yê yêô",
      "Iá Ossono! Iá Ossono mojubá",
      "Ossono no mato, Ossono caçador",
      "Ossono saravá!",
      "Oxum mi dá oquê!",
    ],
    fundamentos: [
      "Ossono é o Orixá da caça, das florestas e dos animais selvagens",
      "É o guardião das matas e o mestre do arco e flecha sagrado",
      "Conhece todos os segredos da natureza selvagem e dos alimentos da terra",
      "É identificado com o arco e flecha como ferramentas de caça e símbolo de precisão",
      "Trabalha em conjunto com Ogum para proteção na mata e com Oxum para fartura",
      "Ossono é o leste - associated com o amanhecer e o despertar da natureza",
    ],
  };
}