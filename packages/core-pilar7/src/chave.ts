/**
 * @akasha/core-pilar7 — 64 Chaves de Transformacao
 *
 * Pilar 7 (Espectro de Transformacao) opera sobre 64 chaves, que
 * correspondem 1:1 aos 64 hexagramas King Wen do Pilar 5 (I Ching).
 *
 * SINERGIA COM PILAR 5 (I Ching):
 * - Pilar 5 calcula o hexagrama natal do consulente.
 * - Pilar 7 atribui Sombra/Dom/Siddhi baseado nesse mesmo hexagrama.
 * - A numeracao e identica (1-64, King Wen).
 *
 * NOMENCLATURA UNIVERSALISTA (Guardrail 1 — ADR 0002):
 * - O campo `nome` de cada chave e ORIGINAL Pilar 7, nao uma copia
 *   da nomenclatura proprietaria. Inspirado em I Ching (texto livre)
 *   + principios universais (Cumino, Saraceni, Camargo).
 * - `hexagramaOrigem` preserva o nome do hexagrama Pilar 5 para
 *   referencia (e o que aparece em `ichingMap.name`).
 *
 * Textos detalhados (Sombra/Dom/Siddhi) vivem em `src/textos/*.md`
 * como placeholders Wave 4 (Guardrail 2).
 */
import type { ChaveNatal, IChingData } from './types';

/**
 * Tabela canônica das 64 chaves (1-64).
 *
 * Cada entrada combina:
 * - O nome universalista (original Pilar 7)
 * - O glifo (caractere chines do hexagrama de origem)
 * - O nome do hexagrama I Ching (Pilar 5) de origem
 * - O nome chines do hexagrama
 *
 * ATENCAO: estes nomes sao INSPIRADOS nos hexagramas King Wen e em
 * principios universais. NAO sao copias literais de qualquer fonte
 * comercial. Ver AGENTS.md §"Naming Akasha vs Tradicao".
 */
const CHAVES_DATA: Record<number, Omit<ChaveNatal, 'numero'>> = {
  1: {
    nome: 'A Forca Criadora',
    glifo: '乾',
    hexagramaOrigem: 'O Criativo',
    hexagramaOrigemChines: 'Qian',
  },
  2: {
    nome: 'A Receptividade',
    glifo: '坤',
    hexagramaOrigem: 'O Receptivo',
    hexagramaOrigemChines: 'Kun',
  },
  3: {
    nome: 'O Despertar Inicial',
    glifo: '屯',
    hexagramaOrigem: 'Dificuldade no Inicio',
    hexagramaOrigemChines: 'Zhun',
  },
  4: {
    nome: 'A Busca do Mestre',
    glifo: '蒙',
    hexagramaOrigem: 'Insancia Juvenil',
    hexagramaOrigemChines: 'Meng',
  },
  5: {
    nome: 'A Espera Feunda',
    glifo: '需',
    hexagramaOrigem: 'A Espera',
    hexagramaOrigemChines: 'Xu',
  },
  6: {
    nome: 'O Litigio',
    glifo: '訟',
    hexagramaOrigem: 'O Conflito',
    hexagramaOrigemChines: 'Song',
  },
  7: {
    nome: 'A Disciplina Coletiva',
    glifo: '師',
    hexagramaOrigem: 'O Exercito',
    hexagramaOrigemChines: 'Shi',
  },
  8: {
    nome: 'A Alianca',
    glifo: '比',
    hexagramaOrigem: 'A Uniao',
    hexagramaOrigemChines: 'Bi',
  },
  9: {
    nome: 'O Refinamento',
    glifo: '小畜',
    hexagramaOrigem: 'Pequena Domesticacao',
    hexagramaOrigemChines: 'Xiao Chu',
  },
  10: {
    nome: 'A Conduta',
    glifo: '履',
    hexagramaOrigem: 'O Andar',
    hexagramaOrigemChines: 'Lu',
  },
  11: {
    nome: 'A Prosperidade',
    glifo: '泰',
    hexagramaOrigem: 'A Paz',
    hexagramaOrigemChines: 'Tai',
  },
  12: {
    nome: 'A Estagnacao',
    glifo: '否',
    hexagramaOrigem: 'A Estagnacao',
    hexagramaOrigemChines: 'Pi',
  },
  13: {
    nome: 'A Comunhao',
    glifo: '同人',
    hexagramaOrigem: 'Concordancia entre os Homens',
    hexagramaOrigemChines: 'Tong Ren',
  },
  14: {
    nome: 'A Grande Posse',
    glifo: '大有',
    hexagramaOrigem: 'Grande Posse',
    hexagramaOrigemChines: 'Da You',
  },
  15: {
    nome: 'A Modestia',
    glifo: '謙',
    hexagramaOrigem: 'A Modestia',
    hexagramaOrigemChines: 'Qian',
  },
  16: {
    nome: 'O Entusiasmo',
    glifo: '豫',
    hexagramaOrigem: 'O Entusiasmo',
    hexagramaOrigemChines: 'Yu',
  },
  17: {
    nome: 'O Seguimento',
    glifo: '隨',
    hexagramaOrigem: 'O Seguimento',
    hexagramaOrigemChines: 'Sui',
  },
  18: {
    nome: 'A Restauracao',
    glifo: '蠱',
    hexagramaOrigem: 'A Decadencia',
    hexagramaOrigemChines: 'Gu',
  },
  19: {
    nome: 'A Aproximacao',
    glifo: '臨',
    hexagramaOrigem: 'A Aproximacao',
    hexagramaOrigemChines: 'Lin',
  },
  20: {
    nome: 'A Contemplacao',
    glifo: '觀',
    hexagramaOrigem: 'A Contemplacao',
    hexagramaOrigemChines: 'Guan',
  },
  21: {
    nome: 'A Desobstrucao',
    glifo: '噬嗑',
    hexagramaOrigem: 'A Mordedura que Atravessa',
    hexagramaOrigemChines: 'Shi He',
  },
  22: {
    nome: 'A Beleza',
    glifo: '賁',
    hexagramaOrigem: 'A Graca',
    hexagramaOrigemChines: 'Bi',
  },
  23: {
    nome: 'A Desintegracao',
    glifo: '剝',
    hexagramaOrigem: 'A Desintegracao',
    hexagramaOrigemChines: 'Bo',
  },
  24: {
    nome: 'O Retorno',
    glifo: '復',
    hexagramaOrigem: 'O Retorno',
    hexagramaOrigemChines: 'Fu',
  },
  25: {
    nome: 'A Inocencia',
    glifo: '無妄',
    hexagramaOrigem: 'A Inocencia',
    hexagramaOrigemChines: 'Wu Wang',
  },
  26: {
    nome: 'A Contencao',
    glifo: '大畜',
    hexagramaOrigem: 'A Grande Acumulacao',
    hexagramaOrigemChines: 'Da Chu',
  },
  27: {
    nome: 'A Nutricao',
    glifo: '頤',
    hexagramaOrigem: 'A Boca',
    hexagramaOrigemChines: 'Yi',
  },
  28: {
    nome: 'A Excedencia',
    glifo: '大過',
    hexagramaOrigem: 'A Grande Excedencia',
    hexagramaOrigemChines: 'Da Guo',
  },
  29: {
    nome: 'O Abismo',
    glifo: '坎',
    hexagramaOrigem: 'O Abismal',
    hexagramaOrigemChines: 'Kan',
  },
  30: {
    nome: 'O Brilho',
    glifo: '離',
    hexagramaOrigem: 'O Luminoso',
    hexagramaOrigemChines: 'Li',
  },
  31: {
    nome: 'A Influencia',
    glifo: '咸',
    hexagramaOrigem: 'A Influencia',
    hexagramaOrigemChines: 'Xian',
  },
  32: {
    nome: 'A Duracao',
    glifo: '恆',
    hexagramaOrigem: 'A Duracao',
    hexagramaOrigemChines: 'Heng',
  },
  33: {
    nome: 'A Retirada',
    glifo: '遯',
    hexagramaOrigem: 'A Retirada',
    hexagramaOrigemChines: 'Dun',
  },
  34: {
    nome: 'O Grande Poder',
    glifo: '大壯',
    hexagramaOrigem: 'O Poder do Grande',
    hexagramaOrigemChines: 'Da Zhuang',
  },
  35: {
    nome: 'O Progresso',
    glifo: '晉',
    hexagramaOrigem: 'O Progresso',
    hexagramaOrigemChines: 'Jin',
  },
  36: {
    nome: 'A Luz Protegida',
    glifo: '明夷',
    hexagramaOrigem: 'O Escurecimento da Luz',
    hexagramaOrigemChines: 'Ming Yi',
  },
  37: {
    nome: 'A Familia',
    glifo: '家人',
    hexagramaOrigem: 'A Familia',
    hexagramaOrigemChines: 'Jia Ren',
  },
  38: {
    nome: 'A Oposicao',
    glifo: '睽',
    hexagramaOrigem: 'A Oposicao',
    hexagramaOrigemChines: 'Kui',
  },
  39: {
    nome: 'O Obstaculo',
    glifo: '蹇',
    hexagramaOrigem: 'O Obstaculo',
    hexagramaOrigemChines: 'Jian',
  },
  40: {
    nome: 'A Liberacao',
    glifo: '解',
    hexagramaOrigem: 'A Libertacao',
    hexagramaOrigemChines: 'Xie',
  },
  41: {
    nome: 'A Diminuicao',
    glifo: '損',
    hexagramaOrigem: 'A Diminuicao',
    hexagramaOrigemChines: 'Sun',
  },
  42: {
    nome: 'O Aumento',
    glifo: '益',
    hexagramaOrigem: 'O Aumento',
    hexagramaOrigemChines: 'Yi',
  },
  43: {
    nome: 'A Decisao',
    glifo: '夬',
    hexagramaOrigem: 'A Decisao',
    hexagramaOrigemChines: 'Guai',
  },
  44: {
    nome: 'O Encontro',
    glifo: '姤',
    hexagramaOrigem: 'O Encontrar',
    hexagramaOrigemChines: 'Gou',
  },
  45: {
    nome: 'A Reuniao',
    glifo: '萃',
    hexagramaOrigem: 'A Reuniao',
    hexagramaOrigemChines: 'Cui',
  },
  46: {
    nome: 'A Ascensao',
    glifo: '升',
    hexagramaOrigem: 'O Ascender',
    hexagramaOrigemChines: 'Sheng',
  },
  47: {
    nome: 'O Esgotamento',
    glifo: '困',
    hexagramaOrigem: 'O Esgotamento',
    hexagramaOrigemChines: 'Kun',
  },
  48: {
    nome: 'O Poco',
    glifo: '井',
    hexagramaOrigem: 'O Poco',
    hexagramaOrigemChines: 'Jing',
  },
  49: {
    nome: 'A Revisao',
    glifo: '革',
    hexagramaOrigem: 'A Revolucao',
    hexagramaOrigemChines: 'Ge',
  },
  50: {
    nome: 'O Caldeirao',
    glifo: '鼎',
    hexagramaOrigem: 'O Caldeirao',
    hexagramaOrigemChines: 'Ding',
  },
  51: {
    nome: 'O Trovão',
    glifo: '震',
    hexagramaOrigem: 'O Trovao',
    hexagramaOrigemChines: 'Zhen',
  },
  52: {
    nome: 'A Imobilidade',
    glifo: '艮',
    hexagramaOrigem: 'A Imobilidade',
    hexagramaOrigemChines: 'Gen',
  },
  53: {
    nome: 'O Desenvolvimento',
    glifo: '漸',
    hexagramaOrigem: 'O Desenvolvimento',
    hexagramaOrigemChines: 'Jian',
  },
  54: {
    nome: 'A Noiva',
    glifo: '歸妹',
    hexagramaOrigem: 'A Noiva',
    hexagramaOrigemChines: 'Gui Mei',
  },
  55: {
    nome: 'A Abundancia',
    glifo: '豐',
    hexagramaOrigem: 'A Abundancia',
    hexagramaOrigemChines: 'Feng',
  },
  56: {
    nome: 'O Andante',
    glifo: '旅',
    hexagramaOrigem: 'O Andante',
    hexagramaOrigemChines: 'Lu',
  },
  57: {
    nome: 'O Suave',
    glifo: '巽',
    hexagramaOrigem: 'O Suave',
    hexagramaOrigemChines: 'Xun',
  },
  58: {
    nome: 'A Alegria',
    glifo: '兌',
    hexagramaOrigem: 'O Alegre',
    hexagramaOrigemChines: 'Dui',
  },
  59: {
    nome: 'A Dispersao',
    glifo: '渙',
    hexagramaOrigem: 'A Dispersao',
    hexagramaOrigemChines: 'Huan',
  },
  60: {
    nome: 'A Limitacao',
    glifo: '節',
    hexagramaOrigem: 'A Limitacao',
    hexagramaOrigemChines: 'Jie',
  },
  61: {
    nome: 'A Verdade Interior',
    glifo: '中孚',
    hexagramaOrigem: 'A Verdade Interior',
    hexagramaOrigemChines: 'Zhong Fu',
  },
  62: {
    nome: 'A Pequena Excedencia',
    glifo: '小過',
    hexagramaOrigem: 'A Pequena Excedencia',
    hexagramaOrigemChines: 'Xiao Guo',
  },
  63: {
    nome: 'Apos a Conclusao',
    glifo: '既濟',
    hexagramaOrigem: 'Apos a Conclusao',
    hexagramaOrigemChines: 'Ji Ji',
  },
  64: {
    nome: 'Antes da Conclusao',
    glifo: '未濟',
    hexagramaOrigem: 'Antes da Conclusao',
    hexagramaOrigemChines: 'Wei Ji',
  },
};

/**
 * Constroi um literal `1..64` a partir de um numero validado.
 * Usado internamente para garantir o tipo exato.
 */
function toChaveNumber(n: number): ChaveNatal['numero'] {
  if (!Number.isInteger(n) || n < 1 || n > 64) {
    throw new RangeError(`Numero de chave invalido: ${n}. Esperado 1-64.`);
  }
  return n as ChaveNatal['numero'];
}

/**
 * Mapa canonico das 64 chaves (1-64). Source of truth do Pilar 7.
 *
 * Cada chave inclui:
 * - `numero` (1-64)
 * - `nome` (universalista, original Pilar 7)
 * - `glifo` (caractere chines do hexagrama de origem)
 * - `hexagramaOrigem` (nome PT-BR do hexagrama I Ching — Pilar 5)
 * - `hexagramaOrigemChines` (nome chines do hexagrama)
 *
 * Verificado por `chave.test.ts`:
 * - Total = 64
 * - Numeros sao exatamente 1..64
 * - Cada chave referencia um hexagrama Pilar 5 existente
 */
export const CHAVES: Record<number, ChaveNatal> = Object.fromEntries(
  Object.entries(CHAVES_DATA).map(([numStr, def]) => {
    const numero = toChaveNumber(Number(numStr));
    return [
      numero,
      {
        numero,
        nome: def.nome,
        glifo: def.glifo,
        hexagramaOrigem: def.hexagramaOrigem,
        hexagramaOrigemChines: def.hexagramaOrigemChines,
      },
    ];
  })
);

/**
 * Retorna a chave pelo numero (1-64).
 *
 * Lanca `RangeError` se o numero for invalido (padrao identico a
 * `getHexagram` em `@akasha/core-iching` — paridade de comportamento).
 */
export function getChave(numero: number): ChaveNatal {
  if (!Number.isInteger(numero) || numero < 1 || numero > 64) {
    throw new RangeError(`Numero de chave invalido: ${numero}. Esperado 1-64.`);
  }
  const chave = CHAVES[numero];
  if (!chave) {
    // Defensivo: nao deve acontecer (CHAVES_DATA cobre 1-64).
    throw new Error(`Chave ${numero} ausente no cadastro canonico.`);
  }
  return chave;
}

/**
 * Retorna todas as 64 chaves em ordem King Wen (1-64).
 */
export function getAllChaves(): ChaveNatal[] {
  return Object.values(CHAVES).sort((a, b) => a.numero - b.numero);
}

/**
 * Detecta a chave natal do consulente a partir do Pilar 5 (I Ching).
 *
 * Esta e a funcao central da sinergia Pilar 5 ↔ Pilar 7. A numeracao
 * e identica (King Wen, 1-64); o que muda e a nomenclatura (Pilar 7
 * usa nomes universalistas) e a interpretacao em 3 estagios.
 *
 * Quando Pilar 5 retorna `hexagramNumber: null` (opt-in nao ativado
 * ou erro), `detectarChave` propaga `null` para a camada superior
 * (graceful degradation — Pilar 7 NAO calcula sem Pilar 5).
 */
export function detectarChave(pilar5: IChingData): ChaveNatal | null {
  if (pilar5 == null) return null;
  const n = pilar5.hexagramNumber;
  if (n == null) return null;
  if (!Number.isInteger(n) || n < 1 || n > 64) return null;
  return getChave(n);
}
