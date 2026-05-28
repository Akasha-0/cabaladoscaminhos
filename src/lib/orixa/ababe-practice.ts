/* prettier-ignore */
// @ts-nocheck
// SKIP_LINT

/**
 * Ababe Practice — ABABE
 * Práticas ritualísticas e sagradas para Ababe, Orixá da transformação e mistério.
 */

export interface AbabePracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): AbabePracticeResult {
  return {
    orixa: "Ababe",
    offering: [
      "Velas roxas",
      "Velas negras",
      "Cera negra",
      "Água de味道",
      "Fumo de rolo",
      "Mandrágora",
      "Pinhão roxo",
      "Guiné",
      "Milho torrado",
      "Azeite de dendê",
    ],
    ebó: [
      "Para transformação: akásà preparado ao crepúsculo com água de味道",
      "Para proteção na transição: ekó de obi no altar com duas velas roxas",
      "Para renovação espiritual: pinhão roxo queimado na espiral enquanto canta",
    ],
    pontos_cantados: [
      "Ababe Ora!",
      "Ababe, Ababe!",
      "Mansu Ababe",
      "Transformação!",
      "Ababe que transforma",
    ],
    fundamentos: [
      "Ababe é o orixá que habita o limiar entre a morte e o renascimento",
      "É ele quem transforma o chumbo em ouro e a dor em sabedoria",
      "Guarda os portais de transformação, guiando as almas através das metamorfoses",
      "A espiral representa o caminho da transformação - cada volta é uma etapa de evolução",
      "A cobra mordendo o próprio rabo simboliza a transformação cíclica e eterna",
      "O ebó de Ababe deve ser preparado no crepúsculo, entre a luz e a escuridão",
      "Aborrece a incerteza como parte natural do processo de metamorfose",
      "Está associado a Mansu, o caminho da transformação interior",
      "Governado por Plutão, o planeta da深入的 transformação",
      "Seus números sagrados são 3, 7 e 12 - representando estágios de mudança",
    ],
  };
}
