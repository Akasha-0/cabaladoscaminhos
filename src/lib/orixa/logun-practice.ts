// @ts-nocheck
// SKIP_LINT

/**
 * Logun Practice — ORIXÁ LOGUN
 * Práticas ritualísticas e sagradas para Logun, o mensageiro e orixá das águas e da comunicação.
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
    orixa: "Logun",
    offering: [
      "Milho torrado",
      "Amendoim torrado",
      "Mel",
      "Farinha de mandioca",
      "Ekó de obi",
      "Duas pombas brancas",
      "Fumo de charuto",
      "Ervas verdes frescas",
      "Alujá",
      "Dente de animal",
    ],
    ebó: [
      "Para proteção espiritual: defumar com ervas sagradas na entrada do terreiro",
      "Para abrir caminhos na comunicação: colocar prato branco com milho e ekó no chão",
      "Para fortalecimento espiritual: cozinhar folhas de eucalipto com água de oxy e banhar ao amanhecer",
    ],
    pontos_cantados: [
      "Logunê, Logunê yê yêô",
      "Iá Logunê! Iá Logunê mojubá",
      "Logunê me dá ouvidos, Logunê abre meu caminho",
      "Logunê saravá!",
      "E sourcei! Logunê na água, Logunê na terra",
    ],
    fundamentos: [
      "Logun é o Orixá da comunicação, da sabedoria e das águas",
      "É filho de Oxum e Obaluayé, mensageiro entre o céu e a terra",
      "Conhecido como o guerreiro caçador, protege contra feitiços e mau-olhado",
      "Trabalha em conjunto com Oxum para equilíbrio espiritual dos iniciados",
      "Para abrir seu caminho: use milho torrado, amendoim, mel e ekó de obi",
      "Logun é associado às águas correntes, às matas e ao conhecimento ancestral",
    ],
  };
}