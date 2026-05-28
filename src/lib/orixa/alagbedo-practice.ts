/* prettier-ignore */

// @ts-nocheck
// SKIP_LINT

/**
 * Alagbedo Practice Module
 * Práticas ritualísticas e sagradas para Alagbedo, Orixá protetor contra acidentes, doenças e todo mal.
 */

export interface AlagbedoPracticeResult {
  orixa: string;
  offering: string[];
  ebó: string[];
  pontos_cantados: string[];
  fundamentos: string[];
}

export function performPractice(): AlagbedoPracticeResult {
  return {
    orixa: "Alagbedo",
    offering: [
      "Azeite de dendê",
      "Galo",
      "Fio vermelho",
      "Pimenta",
      "Dinheiro",
      "Arruda",
      "Pau-brasil",
      "Alecrim",
      "Velas vermelhas",
      "Amuletos protetores",
    ],
    ebó: [
      "Para proteção contra acidentes: galo preto no terreiro com azeite de dendê",
      "Para prevenção de doenças: fio vermelho no pulso com arruda e alecrim",
      "Para afastar malefícios: pimenta vermelha no umbral da porta com dinheiro",
      "Para proteção de viagem: acender vela vermelha e pedir proteção de Alagbedo",
    ],
    pontos_cantados: [
      "Alagbedo! Alagbedo! O Protetor dos Males!",
      "Eo! Alagbedo me guarda de todo mal",
      "Que os males não cheguem perto de mim",
      "Alagbedo abre meu caminho com proteção",
    ],
    fundamentos: [
      "Alagbedo é o Orixá protetor contra acidentes, doenças e todo tipo de mal",
      "É identificado com o fio vermelho e os amuletos protetores",
      "É o nordeste - azeite de dendê e galo são seus elementos principais",
      "Para abrir proteção: use azeite de dendê, arruda e fio vermelho",
      "Arruda é sua planta sagrada para afastar negatividades",
      "É o guardião das encruzilhadas e protetor dos viajantes",
      "Conhecido como Alagbedo Omó, o protetor das crianças",
      "Galo preto é sua oferenda mais poderosa para proteção",
    ],
  };
}
