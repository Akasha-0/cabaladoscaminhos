/**
 * Obaxoxe Practice — ORIXÁ OBAXOXE
 * Práticas ritualísticas e sagradas para Obaxoxe, Orixá da Sabedoria Ancestral e dos Mistérios.
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
    orixa: "Obaxoxe",
    offering: [
      "Pepitas de dendê",
      "Fumo de charuto",
      "Velas amarelas",
      "Frutos silvestres",
      "Folhas de eubalés",
      "Água de cheiro",
      "Farinha deuba",
      "Ogã de marfim",
      "Akará (beiju de feijão)",
    ],
    ebó: [
      "Para proteção contra feitiçaria: colocar pepitas de dendê e fumo em um prato amarelo na encruzilhada",
      "Para sabedoria: queimar velas amarelas e oferecer frutos silvestres ao amanhecer",
    ],
    pontos_cantados: [
      "Obaxoxe e! Obaxoxe yê yêô",
      "Iá Obaxoxe! Iá Obaxoxe!",
      "Obaxoxe mojubá",
      "Obaxoxe sabe, Obaxoxe conhece",
    ],
    fundamentos: [
      "Obaxoxe é o Orixá da sabedoria ancestral, dos segredos e dos mistérios divinos",
      "É identificado com o cajado e a autoridade sobre os conhecimentos ocultos",
      "É o leste - leste/norte, velas amarelas, dendê e fumo são suas folhas",
      "Para abrir seu caminho: use pepitas de dendê, fumo e velas amarelas",
      "Ogã de marfim é seu instrumento sagrado: usado para invocar sua sabedoria",
    ],
  };
}