/* prettier-ignore */

// @ts-nocheck

/**
 * Loguned Practice — ORIXÁ LOGUNED
 * Práticas ritualísticas e sagradas para Loguned, o caçador guerreiro e orixá da comunicação.
 */

export interface LogunedPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): LogunedPracticeResult {
  return {
    orixa: "Loguned",
    offering: [
      "Milho torrado",
      "Amendoim torrado",
      "Mel",
      "Farinha de mandioca",
      "Água de obi",
      "Ekó de obi",
      "Duas pombas brancas",
      "Fumo de charuto",
      "Ervas verdes frescas",
      "Alujá",
    ],
    ebó: [
      "Para proteção espiritual: defumar com ervas sagradas na entrada do quarto de iniciados",
      "Para abrir caminhos na comunicação: colocar prato branco com milho, amendoim e ekó no chão de Oxum",
      "Para fortalecimento da sabedoria: cozinhar folhas de eucalipto com água de oxy e banhar ao amanhecer",
    ],
    pontos_cantados: [
      "Orokum Logunedê, Logunedê yê yêô",
      "Iá Logunedê! Iá Logunedê mojubá",
      "Logunedê me dá ouvidos, Logunedê abre meu caminho",
      "Logunedê saravá!",
      "Oxumambi mi dá oquê!",
      "E sourcei! Logunedê no mato, Logunedê na aldeia",
    ],
    fundamentos: [
      "Loguned é o Orixá da intelectualidade, da comunicação e da sabedoria",
      "É filho de Oxumambi e Obaluayé, patrono dos iyawós e iniciados",
      "Conhecido como o caçador guerreiro, protege contra feitiços e mau-olhado",
      "Trabalha em conjunto com Oxum para equilíbrio espiritual dos iniciados",
      "Para abrir seu caminho: use milho torrado, amendoim, mel e ekó de obi",
      "Loguned é associado ao sudoeste, às matas e ao conhecimento ancestral",
    ],
  };
}