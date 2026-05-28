/* prettier-ignore */
// @ts-nocheck
// SKIP_LINT

/**
 * Eru Practice — ERU
 * Práticas ritualísticas e sagradas para Eru, substância sagrada de purificação e transmissão.
 */

export interface EruPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): EruPracticeResult {
  return {
    orixa: "Eru",
    offering: [
      "Eru em pó",
      "Mel",
      "Fumo",
      "Azeite de dendê",
      "Farinha de mandioca",
      "Obi",
      "Galo branco",
      "Milho torrado",
      "Amendoim torrado",
      "Akásà",
    ],
    ebó: [
      "Para purificação: akásà preparado com eru em pó ao amanhecer",
      "Para proteção espiritual: ekó de obi no altar com duas velas brancas",
      "Para abrir caminhos: Ossaim fresco na entrada com milho torrado",
    ],
    pontos_cantados: [
      "Eru, Eru!",
      "Eru mojubá",
      "Eru na purificação",
      "Eru que purifica o caminho",
    ],
    fundamentos: [
      "Eru é uma substância sagrada utilizada em rituais de purificação e proteção",
      "É relacionado à limpeza espiritual e à transmissão de energia sagrada",
      "Eru em pó é preparado ao amanhecer para maximum potência espiritual",
      "É frequentemente combinado com obi e mel nos ebós",
      "Utilizado em OFÉ e OFUN em Okitise para proteção e purificação",
      "A limpeza de Erun precede os rituais de Ifá",
    ],
  };
}