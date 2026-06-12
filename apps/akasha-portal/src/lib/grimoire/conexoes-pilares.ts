/**
 * Conexões entre Pilares — F-232
 *
 * Gap crítico mapeado: o Significado do Pilar (F-221) mostra cada Pilar
 * isolado. O Insight do Pilar diz "Pilar X fala com Pilar Y" em 1 linha
 * dentro de cada Significado. Mas o usuário não VÊ como os 5 Pilares
 * se FALAM entre si.
 *
 * Esta camada fecha esse gap com uma matriz 5×5 = 25 conexões curadas.
 * Cada `ConexaoPilar` mostra COMO Pilar A fala com Pilar B — em 1-2
 * frases que entrelaçam os dois saberes.
 *
 * Matriz é DIRECIONADA: Cabala→Astrologia ≠ Astrologia→Cabala. A Cabala
 * ilumina a Astrologia com a geometria numerológica; a Astrologia ilumina
 * a Cabala com o céu. Quem fala primeiro importa.
 *
 * A diagonal (mesmo Pilar consigo mesmo) é sempre vazia — não incluída
 * na matriz; o consumidor deve lidar com isso.
 *
 * Pilar 4 (Odu) carrega `requer_terreiro: true` em toda conexão, R-022.
 *
 * Princípios:
 *   - 1-2 frases diretas, 2ª pessoa
 *   - SEM jargão sem tradução
 *   - A frase ENTRELAÇA os dois Pilares (não explica cada um isolado)
 */

import type { Pilar } from './significados-curados';

export interface ConexaoPilar {
  /** Pilar que fala. */
  origem: Pilar;
  /** Pilar que é falado (recebe a luz). */
  destino: Pilar;
  /** Frase que ENTRELAÇA os dois saberes. */
  frase: string;
  /** Pilar 4 → qualquer destino sempre true (R-022 §4.4). */
  requer_terreiro?: boolean;
  /** Fonte curada. */
  fonte: string;
}

const C: Array<[Pilar, Pilar, string, string, boolean?]> = [
  // ─── Cabala fala com ... ─────────────────────────────────────────────
  [
    'cabala', 'astrologia',
    'Sua numerologia pede signos, não o contrário. O número 11 não "tem signo" — ele BUSCA signos onde a iluminação acontece. Olhe o céu pelos olhos do seu número.',
    'Mispar Hechrachi + Brennan 2017',
  ],
  [
    'cabala', 'tantrica',
    'O número e o corpo são a mesma verdade, em camadas. Se o seu 11 pede canal entre planos, o corpo 11 (Mente Divina) É esse canal. Numerologia sem corpo é teoria; corpo sem número é movimento sem mapa.',
    'Mispar Hechrachi + KRI 2007',
  ],
  [
    'cabala', 'odu',
    'O número nasce antes do Odu, o Odu nasce antes da pessoa. Seu Odu já sabia o seu número. A consulta com babalaô/yaô ilumina o que o número apenas indica.',
    'Verger 1973 + Mispar Hechrachi',
    true,
  ],
  [
    'cabala', 'iching',
    'Seu número é o tema; o hexagrama é o movimento HOJE. O 11 ilumina quando ele ATERRISA no I Ching — a mutação concreta do dia. Sem o hexagrama do dia, o 11 fica abstrato.',
    'Mispar Hechrachi + Wilhelm/Baynes 1950',
  ],

  // ─── Astrologia fala com ... ──────────────────────────────────────────
  [
    'astrologia', 'cabala',
    'O céu do seu nascimento ilumina a geometria do seu número. Sol em Escorpião + 11 = iluminação que atravessa profundeza. Olhe o seu número a partir do signo, não o contrário.',
    'Brennan 2017 + Mispar Hechrachi',
  ],
  [
    'astrologia', 'tantrica',
    'O Sol mostra a identidade, o corpo 10 (Radiante) é onde a identidade se mostra. Sol em Leão com Corpo 10 forte = brilho natural. Sol em Peixes com Corpo 7 (Aura) ativo = canal místico. Sol e Corpo andam juntos.',
    'Brennan 2017 + KRI 2007',
  ],
  [
    'astrologia', 'odu',
    'O céu do nascimento e o Odu se confirmam. Sol em Escorpião com Odu Ogunda = fogo de forja. Raro não confirmar; o que parece conflito é complementação. A leitura cruzada pede babalaô.',
    'Brennan 2017 + Verger 1973',
    true,
  ],
  [
    'astrologia', 'iching',
    'O céu muda por dia; o hexagrama muda por dia. A Astrologia dá o CÉU, o I Ching dá a LEITURA do céu HOJE. Junte os dois: leia o trânsito do dia e o hexagrama do dia. Os dois não se contradizem; se completam.',
    'Brennan 2017 + Wilhelm/Baynes 1950',
  ],

  // ─── Tantrica fala com ... ────────────────────────────────────────────
  [
    'tantrica', 'cabala',
    'O corpo pede um número, o número pede um corpo. Se sua Alma é 7 (KRI), busque o Cabala 7 (Buscador): investigar antes de responder. Os 11 corpos têm ressonância com os 11 sefirot — viva isso, não apenas leia.',
    'KRI 2007 + Mispar Hechrachi',
  ],
  [
    'tantrica', 'astrologia',
    'O corpo 1 (Alma) é como o Sol: o centro. Os outros 10 corpos orbitam. Se seu Corpo da Alma está fraco, seu Sol também parece fraco — o trabalho é fortalecer o centro, não as órbitas.',
    'KRI 2007 + Brennan 2017',
  ],
  [
    'tantrica', 'odu',
    'Os 11 corpos tântricos e os 16 Odu se entrelaçam: cada corpo pede um Odu específico para ancorar. A leitura do seu Ori pelo terreiro ilumina QUAL corpo é o seu ancora ancestral.',
    'KRI 2007 + Verger 1973',
    true,
  ],
  [
    'tantrica', 'iching',
    'O corpo 8 (Prana) e o hexagrama do dia andam juntos: o prana flui de acordo com a mutação. Quando o hexagrama pede movimento, o prana sobe. Quando pede quietude, desce. Sinta o corpo + leia o hexagrama = sabedoria encarnada.',
    'KRI 2007 + Wilhelm/Baynes 1950',
  ],

  // ─── Odu fala com ... (todos requerem terreiro) ───────────────────────
  [
    'odu', 'cabala',
    'O Odu precede a numerologia. Quando o Odu diz Ogbe (clareza), a Cabala ilumina COMO essa clareza se manifesta numericamente — qual o Life Path, qual o Ano Pessoal, qual a sequência de 9 anos. Sem terreiro, apenas indicamos.',
    'Verger 1973 + Mispar Hechrachi',
    true,
  ],
  [
    'odu', 'astrologia',
    'O Odu e o céu do nascimento se confirmam. A tradição iorubá tem seu próprio céu (orixás regentes), e o cruzamento com signos ocidentais é delicado. Procure babalaô/yaô para o cruzamento — não faça em app.',
    'Verger 1973 + Brennan 2017',
    true,
  ],
  [
    'odu', 'tantrica',
    'O Odu mostra o caminho ancestral, os 11 corpos mostram a anatomia sutil. O cruzamento entre eles é profundo: cada Odu tem 1 corpo predominante. Sem terreiro, não indicamos qual — isso pede bênção.',
    'Verger 1973 + KRI 2007',
    true,
  ],
  [
    'odu', 'iching',
    'O Odu e o I Ching caminham paralelos: 16 Odu (1) × 64 hexagramas = 1024 cruzamentos possíveis. A tradição resolve isso com terreiro + I Ching. Aqui só lembramos: o Odu é FIXO (nascimento), o hexagrama MUTA (dia).',
    'Verger 1973 + Wilhelm/Baynes 1950',
    true,
  ],

  // ─── I Ching fala com ... ─────────────────────────────────────────────
  [
    'iching', 'cabala',
    'O hexagrama do dia ilumina o número de hoje. Cabala 11 + I Ching hex 51 (Trovão) = 11 manifestando em forma de despertar. Cada combinação número × hexagrama é um portal único. Medite os dois juntos.',
    'Wilhelm/Baynes 1950 + Mispar Hechrachi',
  ],
  [
    'iching', 'astrologia',
    'O hexagrama e o trânsito do dia andam juntos. Leia os dois no Diario: o céu dá o TOM, o hexagrama dá o MOVIMENTO. Quando o céu pede recolhimento e o hexagrama pede Trovão (51), siga o hexagrama — o céu se move mais lento.',
    'Wilhelm/Baynes 1950 + Brennan 2017',
  ],
  [
    'iching', 'tantrica',
    'O hexagrama e o corpo do dia se entrelaçam. Hexagrama 52 (Quietivo) + corpo 1 (Alma) ativo = dia perfeito para meditação longa. Hexagrama 51 (Trovão) + corpo 8 (Prana) ativo = dia de iniciar. A sabedoria está no par.',
    'Wilhelm/Baynes 1950 + KRI 2007',
  ],
  [
    'iching', 'odu',
    'O hexagrama e o Odu se confirmam. O Odu é o tema ancestral; o hexagrama do dia é o movimento. Quando o Odu pede trabalho (Ogunda) e o hexagrama pede início (Trovão 51), o dia pede TRABALHO QUE COMEÇA. A confirmação aqui é visível.',
    'Wilhelm/Baynes 1950 + Verger 1973',
    true,
  ],
];

const MATRIZ: ConexaoPilar[] = C.map(([origem, destino, frase, fonte, requer_terreiro]) => ({
  origem, destino, frase, fonte, ...(requer_terreiro !== undefined ? { requer_terreiro } : {}),
}));

const PILARES: readonly Pilar[] = ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'] as const;

/** Devolve a frase da conexão Pilar A → Pilar B. */
export function conexao(origem: Pilar, destino: Pilar): ConexaoPilar | undefined {
  if (origem === destino) return undefined;
  return MATRIZ.find((c) => c.origem === origem && c.destino === destino);
}

/** Devolve todas as conexões que SAEM de um Pilar (5 entradas × Pilar). */
export function conexoesDe(origem: Pilar): ConexaoPilar[] {
  return MATRIZ.filter((c) => c.origem === origem);
}

/** Devolve todas as conexões que CHEGAM a um Pilar (5 entradas × Pilar). */
export function conexoesPara(destino: Pilar): ConexaoPilar[] {
  return MATRIZ.filter((c) => c.destino === destino);
}

/** Devolve a matriz completa (20 conexões, sem diagonal). */
export function matrizConexoes(): ConexaoPilar[] {
  return [...MATRIZ];
}

/** Estatísticas para curadores. */
export function coberturaConexoes(): {
  origens: number;
  destinos: number;
  total: number;
  com_terreiro: number;
} {
  return {
    origens: new Set(MATRIZ.map((c) => c.origem)).size,
    destinos: new Set(MATRIZ.map((c) => c.destino)).size,
    total: MATRIZ.length,
    com_terreiro: MATRIZ.filter((c) => c.requer_terreiro).length,
  };
}

/** Pares de Pilares (sem diagonal) — usado em tests para validar cobertura. */
export const PARES_PILARES: Array<[Pilar, Pilar]> = PILARES.flatMap((o) =>
  PILARES.filter((d) => d !== o).map((d) => [o, d] as [Pilar, Pilar]),
);
