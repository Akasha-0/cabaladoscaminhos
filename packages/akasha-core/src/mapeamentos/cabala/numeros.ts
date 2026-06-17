/**
 * Cabala Numerológica — Mapeamentos Ricos
 *
 * Dados curados para números cabalísticos (1-9, 11, 22, 33).
 * Cada entrada inclui: séfira regente, caminho no Tree of Life,
 * elemento, frequência vibracional, tema arquetípico e fonte tradicional.
 *
 * Seguindo o padrão de mapeamentos/iching.ts — dados versionados,
 * auditáveis, com fonte justificativa para cada correspondência.
 *
 * @version 1.0.0
 */

import type { Primitivo } from '../types';

// ─── Sefirot do Tree of Life (para referência) ─────────────────────────────────
export type Sefira =
  | 'keter'      // 1 — Coroa: vontade divina, propósito
  | 'chochmah'   // 2 — Sabedoria: archetype pai, insight
  | 'binah'      // 3 — Compreensão: archetype mãe, limitação
  | 'chesed'     // 4 — Misericórdia: expansão, bondade
  | 'gevurah'    // 5 — Julgamento: contração, limites
  | 'tiferet'    // 6 — Beleza: harmonia, redenção
  | 'netzach'    // 7 — Vitória: resistência, emoção
  | 'hod'        // 8 — Glória: esplendor, intelecto
  | 'yesod'      // 9 — Fundação: vínculo, sexualidade
  | 'malkuth';   // 10 — Reino: soberania, manifestação

export type Elemento = 'fogo' | 'água' | 'ar' | 'terra' | 'étero';

// ─── Entrada principal ──────────────────────────────────────────────────────────
export interface NumeroCabala {
  numero: number;
  nome: string;
  /** Séfira regente no Tree of Life */
  sefira: Sefira;
  /** Caminho no Tree of Life (para números 1-9) */
  caminhoTreeOfLife: number | null;
  /** Número mestre (11, 22, 33) ou null */
  mestre: number | null;
  /** Elemento primário */
  elemento: Elemento;
  /** Frequência vibracional (1-9 escala linear, mestres 11/22/33= frequência superior) */
  frequencia: number;
  /** Primário do sistema Akáshico */
  primitivo: Primitivo;
  /** Polaridade no contexto da Cabala */
  polaridade: 'luz' | 'sombra' | 'ambas';
  /** Descrição arquetípica breve */
  descricao: string;
  /** Título do archetype */
  arquetipo: string;
  /** Palavras-chave */
  palavrasChave: string[];
  /** Número redux para números de 2 dígitos */
  redux?: number;
  /** fonte: justificativa da correspondência tradicional */
  fonte: string;
}

// ─── Tabela de números 1-9 ─────────────────────────────────────────────────────
const NUMEROS_BASICOS: Record<number, Omit<NumeroCabala, 'numero' | 'mestre'>> = {
  1: {
    nome: 'Ehyeh (Eu Sou)',
    sefira: 'keter',
    caminhoTreeOfLife: 32, // Keter → Chochmah — o primeiro sopro
    elemento: 'étero',
    frequencia: 1,
    primitivo: 'Transformacao',
    polaridade: 'ambas',
    descricao: 'O número do Sol — consciência de si separada, vontade, pioneirismo. O Um que se reconhece como uno. Primeira consciência que olha para si mesma.',
    arquetipo: 'O Pionheiro / O Arquiteto',
    palavrasChave: ['iniciativa', 'independência', 'coragem', 'liderança', 'vontade'],
    fonte: 'Sepher Yetzirah — "Um: o espírito do Deus vivo" (Haye Sarah). Keter (Coroa) na Cabala = identidade antes da divisão. Primitivo Transformação porque o 1 é o impulso de separar-se do Todo.',
  },
  2: {
    nome: 'Yechidá (Único)',
    sefira: 'chochmah',
    caminhoTreeOfLife: 23, // Keter → Binah — a tensão entre vontade e limitação
    elemento: 'água',
    frequencia: 2,
    primitivo: 'Expansao',
    polaridade: 'ambas',
    descricao: 'O número da Lua — dualidade, receptividade, integração do feminino. O Um que encontra o outro e cria tensão criativa. Polaridade pura.',
    arquetipo: 'O Diplomatador / A Alma Gemela',
    palavrasChave: ['cooperação', 'paciência', 'parceria', 'intuição', 'receptividade'],
    fonte: 'Sepher Yetzirah — "Dois: espírito do ar criado". Chochmah (Sabedoria) = o insight que nasce da tensão entre pares opostos. Primitivo Expansão porque o 2 é o espaço onde o 1 se expande para encontrar o outro.',
  },
  3: {
    nome: 'Emet (Verdade)',
    sefira: 'binah',
    caminhoTreeOfLife: 31, // Entre Chesed e Gevurah — a tríade superior
    elemento: 'fogo',
    frequencia: 3,
    primitivo: 'Ordem',
    polaridade: 'ambas',
    descricao: 'O número de Júpiter — expressão, criatividade, expansão social. O 1 e o 2 em relação criativa. A primeira completeza (trindade).',
    arquetipo: 'O Comunicador / O Artista',
    palavrasChave: ['expressão', 'criatividade', 'comunicação', 'alegria', 'sociabilidade'],
    fonte: 'Sepher Yetzirah — "Três: água criada pelo espírito". Binah (Compreensão) = a limitação que dá forma ao caos. Primitivo Ordem porque o 3 é a primeira estrutura que emerge do conflito entre 1 e 2.',
  },
  4: {
    nome: 'Emuná (Fé)',
    sefira: 'chesed',
    caminhoTreeOfLife: 14, // Chesed → Gevurah — ordem entre misericórdia e julgamento
    elemento: 'terra',
    frequencia: 4,
    primitivo: 'Expressao',
    polaridade: 'ambas',
    descricao: 'O número de Urano/Raiz — estruturação, trabalho, segurança. A primeira forma estável. O número que transforma intuição em matéria.',
    arquetipo: 'O Construtor / O Trabalhador',
    palavrasChave: ['disciplina', 'estrutura', 'trabalho', 'estabilidade', 'raízes'],
    fonte: 'Sepher Yetzirah — "Quatro: fogo selado". Chesed (Misericórdia) = expansão que estrutura. Primitivo Expressão porque o 4 é a expressão concreta da intenção (1) que passou pela relação (2) e tomou forma (3).',
  },
  5: {
    nome: 'Gevurá (Poder)',
    sefira: 'gevurah',
    caminhoTreeOfLife: 19, // Gevurah → Tiferet — julgamento que recorta o excesso
    elemento: 'ar',
    frequencia: 5,
    primitivo: 'Amor',
    polaridade: 'ambas',
    descricao: 'O número de Mercúrio — mudança, liberdade, comunicação. O número da inteligência aplicada à matéria. A energia que rompe estruturas quando se tornam rígidas.',
    arquetipo: 'O Liberal / O Vibrante',
    palavrasChave: ['liberdade', 'mudança', 'adaptação', 'versatilidade', 'comunicação'],
    fonte: 'Sepher Yetzirah — "Cinco: fuego que se escapa". Gevurah (Julgamento) = o poder de limitar, selecionar, discernir. Primitivo Amor porque a escolha consciente (5) é a expressão mais elevada do amor — escolher o que serve à evolução.',
  },
  6: {
    nome: 'Tiferet (Beleza)',
    sefira: 'tiferet',
    caminhoTreeOfLife: 25, // Netzach ↔ Hod — equilíbrio entre emoção e intelecto
    elemento: 'água',
    frequencia: 6,
    primitivo: 'Poder',
    polaridade: 'ambas',
    descricao: 'O número de Vênus — harmonia, amor, serviço, estética. O centro do Tree of Life (Tiferet = Sol). A criança que integra os opostos em harmonia.',
    arquetipo: 'O Harmonizador / O Prestativo',
    palavrasChave: ['harmonia', 'beleza', 'amor', 'justiça', 'arte'],
    fonte: 'Sepher Yetzirah — "Seis: água que flui". Tiferet (Beleza) = o ponto central que harmoniza Chesed e Gevurah, Netzach e Hod. Primitivo Poder porque Tiferet é o rei — o poder que governa pelo exemplo, não pela força.',
  },
  7: {
    nome: 'Netsach (Vitória)',
    sefira: 'netzach',
    caminhoTreeOfLife: 27, // Tiferet → Hod — vitória da mente sobre a emoção
    elemento: 'fogo',
    frequencia: 7,
    primitivo: 'Sabedoria',
    polaridade: 'ambas',
    descricao: 'O número de Netuno/Selene — introspecção, fé, sabedoria interior. O número que se volta para dentro quando o mundo não tem mais respostas.',
    arquetipo: 'O Místico / O Sábio Interior',
    palavrasChave: ['introspecção', 'sabedoria', ' fé', 'filosofia', 'percepção'],
    fonte: 'Sepher Yetzirah — "Sete: fogo que se eleva". Netzach (Vitória) = a emoção que vence pela persistência. Primitivo Sabedoria porque a verdadeira vitória do 7 é sobre a ignorância — a sabedoria que vem do silêncio interior.',
  },
  8: {
    nome: 'Hod (Glória)',
    sefira: 'hod',
    caminhoTreeOfLife: 26, // Tiferet → Netzach — glória da inteligência sobre a paixão
    elemento: 'terra',
    frequencia: 8,
    primitivo: 'Movimento',
    polaridade: 'ambas',
    descricao: 'O número de Saturno — abundância material, poder, autoridade. O número da manifestação concreta. A eternidade medida em ciclos finitos.',
    arquetipo: 'O Executor / O Abundante',
    palavrasChave: ['abundância', 'poder', 'autoridade', 'manifestação', 'karma'],
    fonte: 'Sepher Yetzirah — "Oito: água que escorre". Hod (Glória) = o intelecto que traz reconhecimento. Primitivo Movimento porque Saturno/Hod governa o tempo e os ciclos — o movimento que dá forma à eternidade.',
  },
  9: {
    nome: 'Yesod (Fundação)',
    sefira: 'yesod',
    caminhoTreeOfLife: 28, // Hod → Yesod — a fundação que conecta céu e terra
    elemento: 'ar',
    frequencia: 9,
    primitivo: 'Servico',
    polaridade: 'ambas',
    descricao: 'O número de Marte — compaixão, encerramento, completude. O último número antes da volta ao Um. O número do servidor que já não precisa de nada para si.',
    arquetipo: 'O Humanitário / O Completo',
    palavrasChave: ['compaixão', 'encerramento', 'serviço', 'generosidade', 'perdão'],
    fonte: 'Sepher Yetzirah — "Nove: fogo que queima". Yesod (Fundação) = o vínculo que conecta Tiferet (céu) a Malkuth (terra). Primitivo Serviço porque o 9 é o número de quem já completou seu ciclo e serve sem apego.',
  },
};

// ─── Números mestres ───────────────────────────────────────────────────────────
const NUMEROS_MESTRES: Record<number, Omit<NumeroCabala, 'numero' | 'mestre' | 'redux'>> = {
  11: {
    nome: 'Keter (Coroa) — Mestre',
    sefira: 'keter',
    caminhoTreeOfLife: null, // Não é caminho — é a própria Coroa
    elemento: 'étero',
    frequencia: 11,
    primitivo: 'Intuicao',
    polaridade: 'ambas',
    descricao: 'O Mestre Illuminator — intuição superior, inspiração, capacidade de ser canal para verdades universais. O despertar da consciência antes da forma.',
    arquetipo: 'O Iluminado / O Canal',
    palavrasChave: ['intuição', 'inspiração', 'revelação', 'iluminação', 'canalização'],
    fonte: 'Cabalá — Keter (Coroa) é a séfira mais alta, acima da compreensão. 11 = 1+1 = 2 (dualidade) mas vibrando no nível do 1 (Keter). Intuição como recebimento direto da vontade divina, sem intermediação da lógica.',
  },
  22: {
    nome: 'Chochmah + Binah (Pai + Mãe) — Mestre',
    sefira: 'tiferet',
    caminhoTreeOfLife: null, // Não é caminho — é obuilder completo
    elemento: 'étero',
    frequencia: 22,
    primitivo: 'Conexao',
    polaridade: 'ambas',
    descricao: 'O Mestre Builder — a capacidade de manifestar os sonhos mais grandiosos em forma concreta. Obuilder do Templo Interior. Sonho + Forma num único número.',
    arquetipo: 'O Construtor Mestre / O Builder',
    palavrasChave: ['manifestação', 'visão', 'construção', 'legado', 'disciplina master'],
    fonte: 'Cabalá — 22 = 2+2 = 4 (elementos, estrutura) mas vibrando como 22. Obuilder que usa 22 caminhos do Tree of Life como ferramentas. O único que pode construir sem destruir — porque a forma que cria serve ao Todo.',
  },
  33: {
    nome: 'Keter + Malkuth (Coroa + Reino) — Mestre',
    sefira: 'malkuth',
    caminhoTreeOfLife: null,
    elemento: 'étero',
    frequencia: 33,
    primitivo: 'Materializacao',
    polaridade: 'ambas',
    descricao: 'O Mestre Curador — o amor que se materializa como serviço. A frequência mais alta disponível num ser humano encarnado. Ensinar pelo ser, não pelo dizer.',
    arquetipo: 'O Mestre Curador / O Teacher',
    palavrasChave: ['cura', 'ensino', 'compassão', 'sacrifício', 'materialização espiritual'],
    fonte: 'Cabalá — 33 = 3+3 = 6 (harmonia, Tiferet) mas vibrando como duplo 3. O дух que ensina pelo exemplo. Obuilder que constrói pontes entre o que é e o que deveria ser —materializando o divino em forma acessível.',
  },
};

// ─── Mapa completo (1-9, 11, 22, 33) ──────────────────────────────────────────

/**
 * Tabela completa de números cabalísticos.
 * Key: número (1-9, 11, 22, 33)
 */
export const NUMEROS_CABALA: Record<number, NumeroCabala> = {};

// Preencher 1-9
for (let n = 1; n <= 9; n++) {
  const base = NUMEROS_BASICOS[n];
  NUMEROS_CABALA[n] = { numero: n, mestre: null, ...base };
}

// Preencher mestres
for (const n of [11, 22, 33] as const) {
  const mestre = NUMEROS_MESTRES[n];
  NUMEROS_CABALA[n] = { numero: n, mestre: n, redux: (n % 9) || 9, ...mestre };
}

/**
 * Look up a number by its Cabalistic entry.
 * Supports both base numbers (1-9) and master numbers (11, 22, 33).
 */
export function getNumeroCabala(n: number): NumeroCabala | null {
  return NUMEROS_CABALA[n] ?? null;
}

/**
 * Returns all numbers that share the same element.
 */
export function getNumerosPorElemento(elemento: Elemento): NumeroCabala[] {
  return Object.values(NUMEROS_CABALA).filter(n => n.elemento === elemento);
}

/**
 * Returns the redux (digital sum) for any number.
 * Masters (11, 22, 33) reduce to their base (2, 4, 6).
 */
export function reduxNumero(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n % 9 || 9;
  if (n < 10) return n;
  return reduxNumero(Math.floor(n / 10) + (n % 10));
}
