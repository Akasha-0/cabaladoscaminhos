/**
 * @akasha/core — I Ching Base Data
 *
 * Tabela raiz dos 64 hexagramas do I Ching (Wilhelm/Baynes 1976).
 * Cada entrada contém os primitivos Akáshicos ativados pelo hexagrama
 * com intensidade base e polaridade "neutra" (nível gift).
 *
 * Este ficheiro contém apenas dados. A lógica de síntese (ajuste por nível
 * shadow|gift|siddhi) vive em iching-contribution.ts.
 *
 * Usar getIChingContribution() para PrimitiveContributions ajustadas.
 */
import type { Polaridade, Primitivo } from './types';
import type { PrimitiveContribution } from './types';

export type HexagramaBase = {
  /** Primitivos ativados por este hexagrama. */
  primitivos: Array<{
    primitivo: Primitivo;
    intensidade: number;
    polaridade: Polaridade;
    fonte: string;
  }>;
};

export const BASE: Record<number, HexagramaBase> = {
  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 1 — Qián (Criação / Céu)
  // Trigrama: ☰ Heaven × ☰ Heaven (yang puro)
  // ═══════════════════════════════════════════════════════════════
  1: {
    primitivos: [
      {
        primitivo: 'Poder',
        intensidade: 10,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 1 — Criação (Qián): força criativa pura, yang sem limites',
      },
      {
        primitivo: 'Expansao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 1 — Criação (Qián): princípio ativo de expansão universal',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 2 — Kūn (Receptivo / Terra)
  // Trigrama: ☷ Earth × ☷ Earth (yin puro)
  // ═══════════════════════════════════════════════════════════════
  2: {
    primitivos: [
      {
        primitivo: 'Materializacao',
        intensidade: 10,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 2 — Receptivo (Kūn): matéria primordial, gestação, nutrição terrestre',
      },
      {
        primitivo: 'Conexao',
        intensidade: 9,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 2 — Receptivo (Kūn): receptividade absoluta, vínculo com o源',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 3 — Zhūn (Dificuldade Inicial / Sprouting)
  // Trigrama: ☳ Thunder (☴ Wind baixo) — Turbulência da germinação
  // ═══════════════════════════════════════════════════════════════
  3: {
    primitivos: [
      {
        primitivo: 'Movimento',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 3 — Dificuldade Inicial (Zhūn): energia caótica inicial, arranque movimento',
      },
      {
        primitivo: 'Transformacao',
        intensidade: 7,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 3 — Dificuldade Inicial (Zhūn): transição do caos para ordem, metamorfose',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 4 — Méng (Inocência / Youth)
  // Trigrama: ☶ Mountain (☴ Wind alto) — Mineralidade jovem
  // ═══════════════════════════════════════════════════════════════
  4: {
    primitivos: [
      {
        primitivo: 'Intuicao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 4 — Inocência (Méng): sabedoria ingênua, visão pura pré-conceitos',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 4 — Inocência (Méng): tolice como porta para a iluminação',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 5 — Xū (Espera / Waiting)
  // Trigrama: ☰ Heaven (☷ Earth baixo) — Céu sobre terra, tensão suspensa
  // ═══════════════════════════════════════════════════════════════
  5: {
    primitivos: [
      {
        primitivo: 'Ordem',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 5 — Espera (Xū): paciência estruturante, ordem em formação',
      },
      {
        primitivo: 'Materializacao',
        intensidade: 7,
        polaridade: 'ambas',
        fonte: 'Wilhelm/Baynes 1976, hexagrama 5 — Espera (Xū): nutrição através da contenção,凝聚',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 6 — Sòng (Conflito / Conflict)
  // Trigrama: ☷ Earth (☰ Heaven alto) — Terra sob céu, litigío
  // ═══════════════════════════════════════════════════════════════
  6: {
    primitivos: [
      {
        primitivo: 'Poder',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 6 — Conflito (Sòng): disputa, tensão de vontade, exercício de poder',
      },
      {
        primitivo: 'Transformacao',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 6 — Conflito (Sòng): transformação forçada pela fricção adversarial',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 7 — Shī (Exército / Army)
  // Trigrama: ☷ Earth (☳ Thunder baixo) — Terra com trovão, disciplina
  // ═══════════════════════════════════════════════════════════════
  7: {
    primitivos: [
      {
        primitivo: 'Ordem',
        intensidade: 9,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 7 — Exército (Shī): ordem através da força, disciplina de grupo',
      },
      {
        primitivo: 'Poder',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 7 — Exército (Shī): poder colectivo, hierarquia militar',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 8 — Bǐ (União / Holding Together)
  // Trigrama: ☳ Thunder (☷ Earth alto) — Trovão sob terra, coesão
  // ═══════════════════════════════════════════════════════════════
  8: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 8 — União (Bǐ): congregação, afinidade, pertença grupal',
      },
      {
        primitivo: 'Servico',
        intensidade: 7,
        polaridade: 'luz',
        fonte: 'Wilhelm/Baynes 1976, hexagrama 8 — União (Bǐ): suporte mútuo, serviço comunitário',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 9 — Xiǎochǔ (Pequena Fervedura / Small Nurture)
  // Trigrama: ☰ Heaven (☴ Wind baixo) — Céu sobre vento, влага restrita
  // ═══════════════════════════════════════════════════════════════
  9: {
    primitivos: [
      {
        primitivo: 'Expansao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 9 — Pequena Fervedura (Xiǎochǔ): crescimento contido, acumulação gradual',
      },
      {
        primitivo: 'Materializacao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 9 — Pequena Fervedura (Xiǎochǔ): nutrição do potencial, cristalização progressiva',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 10 — Lǚ (Conduta / Treading)
  // Trigrama: ☱ Lake (☰ Heaven baixo) — Lago sobre céu, equilíbrio precário
  // ═══════════════════════════════════════════════════════════════
  10: {
    primitivos: [
      {
        primitivo: 'Expressao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 10 — Conduta (Lǚ): proceder com cautela, comportamento ético em movimento',
      },
      {
        primitivo: 'Ordem',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 10 — Conduta (Lǚ): caminhada sobre terreno delicado, decoro, protocolo',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 11 — Tài (Paz / Peace)
  // Trigrama: ☰ Heaven (☷ Earth baixo) — Céu sobre terra, harmonia universal
  // ═══════════════════════════════════════════════════════════════
  11: {
    primitivos: [
      {
        primitivo: 'Amor',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 11 — Paz (Tài): harmonia entre céu e terra, graça, bem-aventurança',
      },
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 11 — Paz (Tài): unicidade harmónica, pertença cósmica',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 12 — Pǐ (Estagnação / Standstill)
  // Trigrama: ☷ Earth (☰ Heaven baixo) — Terra sobre céu, obstrução
  // ═══════════════════════════════════════════════════════════════
  12: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 12 — Estagnação (Pǐ): bloqueio como preparação interior, retrocesso aparente',
      },
      {
        primitivo: 'Intuicao',
        intensidade: 6,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 12 — Estagnação (Pǐ): escuridão interior, recolhimento antes do amanhecer',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 13 — Tóngrén (Comunhão / Fellowship)
  // Trigrama: ☰ Heaven (☳ Thunder baixo) — Céu sobre trovão, encontro
  // ═══════════════════════════════════════════════════════════════
  13: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 13 — Comunhão (Tóngrén): fraternidade humana, diálogo entre iguais',
      },
      {
        primitivo: 'Expressao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 13 — Comunhão (Tóngrén): expressão autêntica em comunidade',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 14 — Dàyù (Possuir Grande / Great Possession)
  // Trigrama: ☲ Fire (☰ Heaven alto) — Fogo sobre céu, abundância
  // ═══════════════════════════════════════════════════════════════
  14: {
    primitivos: [
      {
        primitivo: 'Abundancia',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 14 — Possuir Grande (Dàyù): riqueza interior e exterior, fluência universal',
      },
      {
        primitivo: 'Poder',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 14 — Possuir Grande (Dàyù): poder partilhado, generosidade do governante',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 15 — Qiān (Modéstia / Modesty)
  // Trigrama: ☶ Mountain (☷ Earth baixo) — Terra sob monte, humildade
  // ═══════════════════════════════════════════════════════════════
  15: {
    primitivos: [
      {
        primitivo: 'Sabedoria',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 15 — Modéstia (Qiān): humildade como virtude cardinal, conhecimento do próprio limite',
      },
      {
        primitivo: 'Ordem',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 15 — Modéstia (Qiān): ordem natural, hierarquia sem arrogância',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 16 — Yǔ (Entusiasmo / Enthusiasm)
  // Trigrama: ☳ Thunder (☯ Pure Force baixo) — Trovão sob puro, vibração
  // ═══════════════════════════════════════════════════════════════
  16: {
    primitivos: [
      {
        primitivo: 'Movimento',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 16 — Entusiasmo (Yǔ): impulso vital, energia de baru',
      },
      {
        primitivo: 'Expressao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 16 — Entusiasmo (Yǔ): expressão joyful, comunicação radiante',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 17 — Suí (Seguimento / Following)
  // Trigrama: ☳ Thunder (☱ Lake baixo) — Trovão sobre lago, adaptação
  // ═══════════════════════════════════════════════════════════════
  17: {
    primitivos: [
      {
        primitivo: 'Adaptacao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 17 — Seguimento (Suí): flexibilidade adaptativa,跟着 energia',
      },
      {
        primitivo: 'Conexao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 17 — Seguimento (Suí): conexão com o ritmo natural, dançar com o Tao',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 18 — Gǔ (Corrupção / Work on What Has Been Spoiled)
  // Trigrama: ☱ Lake (☶ Mountain baixo) — Lago sobre monte, inspeção
  // ═══════════════════════════════════════════════════════════════
  18: {
    primitivos: [
      {
        primitivo: 'Discernimento',
        intensidade: 9,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 18 — Corrupção (Gǔ): análise destructiva, diagnóstico de padrões quebrados',
      },
      {
        primitivo: 'Transformacao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 18 — Corrupção (Gǔ): restauração, healing of ancestral patterns',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 19 — Lín (Aproximação / Approach)
  // Trigrama: ☷ Earth (☱ Lake baixo) — Terra sobre lago, inspeção soberana
  // ═══════════════════════════════════════════════════════════════
  19: {
    primitivos: [
      {
        primitivo: 'Ordem',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 19 — Aproximação (Lín): governo terreno, ordem política',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 19 — Aproximação (Lín): discernimento老年人, sabedoria prática',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 20 — Guān (Contemplação / Contemplation)
  // Trigrama: ☴ Wind (☷ Earth alto) — Vento sobre terra, observação
  // ═══════════════════════════════════════════════════════════════
  20: {
    primitivos: [
      {
        primitivo: 'Intuicao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 20 — Contemplação (Guān): visão clara, observação sem julgamento',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 20 — Contemplação (Guān): meditação profunda, testemunho da realidade',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 21 — Shìkè (Mordida Cruzada / Gnawing Bite)
  // Trigrama: ☶ Mountain (☳ Thunder baixo) — Monte sobre trovão, juicio
  // ═══════════════════════════════════════════════════════════════
  21: {
    primitivos: [
      {
        primitivo: 'Discernimento',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 21 — Mordida Cruzada (Shìkè): julgamento preciso, Disciplina de ferro',
      },
      {
        primitivo: 'Ordem',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 21 — Mordida Cruzada (Shìkè): ordem através da correção, Lei',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 22 — Bì (Graça / Grace)
  // Trigrama: ☲ Fire (☶ Mountain baixo) — Fogo sobre monte, refinamiento
  // ═══════════════════════════════════════════════════════════════
  22: {
    primitivos: [
      {
        primitivo: 'Beleza',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 22 — Graça (Bì): estética como caminho, forma como expressão do sagrado',
      },
      {
        primitivo: 'Expressao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 22 — Graça (Bì): ornamentação significativa, adornment as comunicação',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 23 — Bō (Desintegração / Splitting Apart)
  // Trigrama: ☷ Earth (☲ Fire baixo) — Terra sobre fogo, colapso
  // ═══════════════════════════════════════════════════════════════
  23: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 9,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 23 — Desintegração (Bō): dissolução do falso self, morte do ego',
      },
      {
        primitivo: 'Intuicao',
        intensidade: 6,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 23 — Desintegração (Bō): vulnerabilidade extrema, insight através da perda',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 24 — Fù (Retorno / Return)
  // Trigrama: ☳ Thunder (☷ Earth baixo) — Trovão sobre terra, aurora
  // ═══════════════════════════════════════════════════════════════
  24: {
    primitivos: [
      {
        primitivo: 'Renovacao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 24 — Retorno (Fù): reinício natural, turning point do ciclo',
      },
      {
        primitivo: 'Movimento',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 24 — Retorno (Fù): despertar interior, nova luz no horizonte',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 25 — Wúwàng (Inocência / Innocence)
  // Trigrama: ☰ Heaven (☳ Thunder baixo) — Céu sobre trovão, espontaneidade
  // ═══════════════════════════════════════════════════════════════
  25: {
    primitivos: [
      {
        primitivo: 'Pureza',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 25 — Inocência (Wúwàng): ação natural, ação do céu no homem',
      },
      {
        primitivo: 'Expansao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 25 — Inocência (Wúwàng): crescimento natural, virtude do grande homem',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 26 — Dàxù (Grande Fervedura / Great Nurture)
  // Trigrama: ☶ Mountain (☰ Heaven baixo) — Monte sobre céu, contenção
  // ═══════════════════════════════════════════════════════════════
  26: {
    primitivos: [
      {
        primitivo: 'Disciplina',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 26 — Grande Fervedura (Dàxù): contenção do poder, treinamento do dragón',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 26 — Grande Fervedura (Dàxù): acumulação de sabedoria, Grande Sustento',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 27 — Yí (Boquilha / Corners of the Mouth)
  // Trigrama: ☳ Thunder (☶ Mountain baixo) — Trovão sobre monte, nutrição
  // ═══════════════════════════════════════════════════════════════
  27: {
    primitivos: [
      {
        primitivo: 'Nutricao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 27 — Boquilha (Yí): nutrição física e espiritual, cuidado maternal',
      },
      {
        primitivo: 'Servico',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 27 — Boquilha (Yí): sustento e cuidado, providing for others',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 28 — Dàguò (Grande Excesso / Great Preponderance)
  // Trigrama: ☱ Lake (☰ Heaven baixo) — Lago sobre céu, exuberância
  // ═══════════════════════════════════════════════════════════════
  28: {
    primitivos: [
      {
        primitivo: 'Expansao',
        intensidade: 10,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 28 — Grande Excesso (Dàguò): excesso creativo, flexibilidade extrema',
      },
      {
        primitivo: 'Transformacao',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 28 — Grande Excesso (Dàguò): metamorfose radical, crossing the great threshold',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 29 — Kǎn (Abismo / Abysmal Water)
  // Trigrama: ☵ Water × ☵ Water (yin duplo, abismo)
  // ═══════════════════════════════════════════════════════════════
  29: {
    primitivos: [
      {
        primitivo: 'Abismo',
        intensidade: 9,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 29 — Abismo (Kǎn): perigo constante, água que tudo absorve',
      },
      {
        primitivo: 'Discernimento',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 29 — Abismo (Kǎn): visão nos extremos, profundidade de conocimiento',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 30 — Lì (Aderir / Fire)
  // Trigrama: ☲ Fire × ☲ Fire (yang duplo, clareza)
  // ═══════════════════════════════════════════════════════════════
  30: {
    primitivos: [
      {
        primitivo: 'Clareza',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 30 — Aderir (Lì): clareza perceptiva, luminosa dependência do sagrado',
      },
      {
        primitivo: 'Intuicao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 30 — Aderir (Lì): fuego do conhecimento, visão luminosa',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 31 — Xián (Influência / Influence)
  // Trigrama: ☶ Mountain (☱ Lake baixo) — Monte sobre lago, sedução
  // ═══════════════════════════════════════════════════════════════
  31: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 31 — Influência (Xián): atraimiento natural, casamento cósmico',
      },
      {
        primitivo: 'Amor',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 31 — Influência (Xián): feeling profundo, responsiveness',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 32 — Héng (Duração / Duration)
  // Trigrama: ☳ Thunder (☴ Wind baixo) — Trovão sobre vento, constancia
  // ═══════════════════════════════════════════════════════════════
  32: {
    primitivos: [
      {
        primitivo: 'Persistencia',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 32 — Duração (Héng): constância interior, firmeza de propósito',
      },
      {
        primitivo: 'Ordem',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 32 — Duração (Héng): ritmo estável, tempo como aliado',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 33 — Dùn (Retirada / Retreat)
  // Trigrama: ☶ Mountain (☰ Heaven alto) — Monte sobre céu, recolhimento
  // ═══════════════════════════════════════════════════════════════
  33: {
    primitivos: [
      {
        primitivo: 'Discernimento',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 33 — Retirada (Dùn): sabedoria estratégica, recolhimento consciente',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 33 — Retirada (Dùn): знание когда уйти, masteria do timing',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 34 — Dàzhuàng (Grande Força / Great Power)
  // Trigrama: ☳ Thunder (☰ Heaven baixo) — Trovão sobre céu, poderio
  // ═══════════════════════════════════════════════════════════════
  34: {
    primitivos: [
      {
        primitivo: 'Poder',
        intensidade: 10,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 34 — Grande Força (Dàzhuàng): poder natural do dragón, força criativa',
      },
      {
        primitivo: 'Expressao',
        intensidade: 7,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 34 — Grande Força (Dàzhuàng): expressão do poder, autenticidade强制性',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 35 — Jǐn (Progresso / Progress)
  // Trigrama: ☲ Fire (☷ Earth baixo) — Fogo sobre terra, clareza social
  // ═══════════════════════════════════════════════════════════════
  35: {
    primitivos: [
      {
        primitivo: 'Expansao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 35 — Progresso (Jǐn): avanço social, busca de reconhecimento',
      },
      {
        primitivo: 'Expressao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 35 — Progresso (Jǐn): manifestação exterior, visibilidade pública',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 36 — Míngyí (Ocultação da Luz / Darkening of the Light)
  // Trigrama: ☷ Earth (☲ Fire alto) — Terra sobre fogo, eclipse
  // ═══════════════════════════════════════════════════════════════
  36: {
    primitivos: [
      {
        primitivo: 'Discernimento',
        intensidade: 9,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 36 — Ocultação da Luz (Míngyí): luz interior escondida, sabedoria disfarçada',
      },
      {
        primitivo: 'Intuicao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 36 — Ocultação da Luz (Míngyí): insight no escuro, conocimiento na ocultação',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 37 — Jiārén (Pessoas da Casa / Family)
  // Trigrama: ☲ Fire (☴ Wind alto) — Fogo sobre vento, lar
  // ═══════════════════════════════════════════════════════════════
  37: {
    primitivos: [
      {
        primitivo: 'Amor',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 37 — Pessoas da Casa (Jiārén): amor familiar, harmonia doméstica',
      },
      {
        primitivo: 'Servico',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 37 — Pessoas da Casa (Jiārén): cuidado recíproco, nutritive presence',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 38 — Kuí (Opostos / Opposition)
  // Trigrama: ☱ Lake (☲ Fire baixo) — Lago sobre fogo, tensão
  // ═══════════════════════════════════════════════════════════════
  38: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 8,
        polaridade: 'ambas',
        fonte: 'Wilhelm/Baynes 1976, hexagrama 38 — Opostos (Kuíl): tensão entre opostos,催化剂',
      },
      {
        primitivo: 'Discernimento',
        intensidade: 7,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 38 — Opostos (Kuíl): ver através do conflito, perspectiva清明',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 39 — Jiǎn (Obstrução / Obstruction)
  // Trigrama: ☵ Water (☶ Mountain baixo) — Água sobre monte, bloqueio
  // ═══════════════════════════════════════════════════════════════
  39: {
    primitivos: [
      {
        primitivo: 'Persistencia',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 39 — Obstrução (Jiǎn):blocks como testes, resistencia para fortalecer',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 39 — Obstrução (Jiǎn): sábio no obstáculo, finding the way through',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 40 — Xiè (Liberação / Deliverance)
  // Trigrama: ☳ Thunder (☵ Water baixo) — Trovão sobre água, разрешение
  // ═══════════════════════════════════════════════════════════════
  40: {
    primitivos: [
      {
        primitivo: 'Liberacao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 40 — Liberação (Xiè): desbloqueio, liberation from obstruction',
      },
      {
        primitivo: 'Movimento',
        intensidade: 7,
        polaridade: 'luz',
        fonte: 'Wilhelm/Baynes 1976, hexagrama 40 — Liberação (Xiè): ação decisiva, descompresión',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 41 — Sǔn (Diminuição / Decrease)
  // Trigrama: ☱ Lake (☶ Mountain baixo) — Lago sobre monte, austeridade
  // ═══════════════════════════════════════════════════════════════
  41: {
    primitivos: [
      {
        primitivo: 'Sacrificio',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 41 — Diminuição (Sǔn): renúncia sacrificial, offer it up',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 41 — Diminuição (Sǔn): menos é mais, simplicidade voluntarily chosen',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 42 — Yì (Aumento / Increase)
  // Trigrama: ☴ Wind (☳ Thunder baixo) — Vento sobre trovão, crecimiento
  // ═══════════════════════════════════════════════════════════════
  42: {
    primitivos: [
      {
        primitivo: 'Expansao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 42 — Aumento (Yì): crescimento orgânico, developmental increase',
      },
      {
        primitivo: 'Movimento',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 42 — Aumento (Yì): ação multiplicadora, productivity',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 43 — Guài (Ruptura / Breakthrough)
  // Trigrama: ☰ Heaven (☱ Lake baixo) — Céu sobre lago, decisão
  // ═══════════════════════════════════════════════════════════════
  43: {
    primitivos: [
      {
        primitivo: 'Decisao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 43 — Ruptura (Guài): resoluteness, break through limitation',
      },
      {
        primitivo: 'Poder',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 43 — Ruptura (Guài): fuerza de voluntad, determinación absoluta',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 44 — Gòu (Encontro / Coming to Meet)
  // Trigrama: ☴ Wind (☰ Heaven baixo) — Vento sobre céu, предложение
  // ═══════════════════════════════════════════════════════════════
  44: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 44 — Encontro (Gòu): proposta inesperada, offer from the universe',
      },
      {
        primitivo: 'Discernimento',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 44 — Encontro (Gòu): screening impulse, knowing what to accept',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 45 — Cuī (Reunião / Gathering)
  // Trigrama: ☷ Earth (☱ Lake baixo) — Terra sobre lago, congregação
  // ═══════════════════════════════════════════════════════════════
  45: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 45 — Reunião (Cuī): coalescência, gathering of souls',
      },
      {
        primitivo: 'Servico',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 45 — Reunião (Cuī): propósito coletivo, mutual support',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 46 — Shēng (Subida / Pushing Upward)
  // Trigrama: ☷ Earth (☳ Thunder alto) — Terra sobre trovão, ascenção
  // ═══════════════════════════════════════════════════════════════
  46: {
    primitivos: [
      {
        primitivo: 'Ascensao',
        intensidade: 9,
        polaridade: 'luz',
        fonte: 'Wilhelm/Baynes 1976, hexagrama 46 — Subida (Shēng): elevação gradual, upward march',
      },
      {
        primitivo: 'Persistencia',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 46 — Subida (Shēng): esfuerzo sostenido, patience in rising',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 47 — Kùn (Exaustão / Oppression)
  // Trigrama: ☱ Lake (☵ Water baixo) — Lago sobre água, privação
  // ═══════════════════════════════════════════════════════════════
  47: {
    primitivos: [
      {
        primitivo: 'Resiliencia',
        intensidade: 9,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 47 — Exaustão (Kùn):被困, confinamento that forges character',
      },
      {
        primitivo: 'Discernimento',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 47 — Exaustão (Kùn): clarity in deprivation, wisdom through hardship',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 48 — Jǐng (Poço / The Well)
  // Trigrama: ☴ Wind (☵ Water baixo) — Vento sobre água, Poço
  // ═══════════════════════════════════════════════════════════════
  48: {
    primitivos: [
      {
        primitivo: 'Nutricao',
        intensidade: 9,
        polaridade: 'luz',
        fonte: 'Wilhelm/Baynes 1976, hexagrama 48 — Poço (Jǐng): fonte perene, wellspring of life',
      },
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 48 — Poço (Jǐng): profundidade partilhada, acesso ao源的',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 49 — Gé (Revolução / Revolution)
  // Trigrama: ☲ Fire (☱ Lake baixo) — Fogo sobre lago, mutação
  // ═══════════════════════════════════════════════════════════════
  49: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 10,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 49 — Revolução (Gé): mudança de pele, metamorfose radical',
      },
      {
        primitivo: 'Decisao',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 49 — Revolução (Gé): coragem da renovação, choosing transformation',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 50 — Dǐng (Caldeirão / Cauldron)
  // Trigrama: ☲ Fire (☴ Wind alto) — Fogo sobre vento, ritual
  // ═══════════════════════════════════════════════════════════════
  50: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 50 — Caldeirão (Dǐng): conteúdo transformador, ritual de renovação',
      },
      {
        primitivo: 'Nutricao',
        intensidade: 8,
        polaridade: 'luz',
        fonte: 'Wilhelm/Baynes 1976, hexagrama 50 — Caldeirão (Dǐng): nutrição sagrada,吃点仪式',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 51 — Zhèn (Trovejante / Arousal)
  // Trigrama: ☳ Thunder × ☳ Thunder (yang duplo, shock)
  // ═══════════════════════════════════════════════════════════════
  51: {
    primitivos: [
      {
        primitivo: 'Shock',
        intensidade: 9,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 51 — Trovejante (Zhèn): impacto, wake-up call cósmico',
      },
      {
        primitivo: 'Movimento',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 51 — Trovejante (Zhèn):震 post-shock, energia recém-libertada',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 52 — Gèn (Quietude / Keeping Still)
  // Trigrama: ☶ Mountain × ☶ Mountain (yin duplo, detenimiento)
  // ═══════════════════════════════════════════════════════════════
  52: {
    primitivos: [
      {
        primitivo: 'Quietude',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 52 — Quietude (Gèn): parar o corpo, meditação profunda',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 52 — Quietude (Gèn): contemplação sem movimento, insight quiet',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 53 — Jiàn (Desenvolvimento / Procession)
  // Trigrama: ☴ Wind (☶ Mountain baixo) — Vento sobre monte, progressão
  // ═══════════════════════════════════════════════════════════════
  53: {
    primitivos: [
      {
        primitivo: 'Progresso',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 53 — Desenvolvimento (Jiàn): avanço gradual, gradual development',
      },
      {
        primitivo: 'Persistencia',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 53 — Desenvolvimento (Jiàn): paciência produtiva, tempo como aliado',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 54 — Guàimèi (Noiva / Marrying Maiden)
  // Trigrama: ☱ Lake (☳ Thunder alto) — Lago sobre trovão, integração
  // ═══════════════════════════════════════════════════════════════
  54: {
    primitivos: [
      {
        primitivo: 'Integracao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 54 — Noiva (Guàimèi): entrega sagrada, integrating the anima/animus',
      },
      {
        primitivo: 'Transformacao',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 54 — Noiva (Guàimèi): becoming whole through union, sagrado casamento',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 55 — Fēng (Abundância / Abundance)
  // Trigrama: ☳ Thunder (☲ Fire alto) — Trovão sobre fogo, plenitude
  // ═══════════════════════════════════════════════════════════════
  55: {
    primitivos: [
      {
        primitivo: 'Abundancia',
        intensidade: 10,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 55 — Abundância (Fēng): plenitude criativa, fullness of the moment',
      },
      {
        primitivo: 'Clareza',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 55 — Abundância (Fēng): sabedoria no auge, discernimento no prosperity',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 56 — Lǚ (Viagem / Wanderer)
  // Trigrama: ☶ Mountain (☱ Lake baixo) — Monte sobre lago, errância
  // ═══════════════════════════════════════════════════════════════
  56: {
    primitivos: [
      {
        primitivo: 'Exploracao',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 56 — Viagem (Lǚ): wanderership, being the stranger with integrity',
      },
      {
        primitivo: 'Adaptacao',
        intensidade: 7,
        polaridade: 'ambas',
        fonte: 'Wilhelm/Baynes 1976, hexagrama 56 — Viagem (Lǚ):俊杰, adapting to foreign terrain',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 57 — Xùn (Suave / Ground)
  // Trigrama: ☴ Wind × ☴ Wind (yin duplo, penetração suave)
  // ═══════════════════════════════════════════════════════════════
  57: {
    primitivos: [
      {
        primitivo: 'Penetracao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 57 — Suave (Xùn): influência gentil, soft power that penetrates',
      },
      {
        primitivo: 'Adaptacao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 57 — Suave (Xùn): flexibilidade percolente, adaptability as strength',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 58 — Duì (Alegria / Joy)
  // Trigrama: ☱ Lake × ☱ Lake (yang duplo, satisfação)
  // ═══════════════════════════════════════════════════════════════
  58: {
    primitivos: [
      {
        primitivo: 'Alegria',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 58 — Alegria (Duì): satisfação interior, joy as estado natural',
      },
      {
        primitivo: 'Expressao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 58 — Alegria (Duì): comunicação joyful, delight in sharing',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 59 — Huàn (Dispersão / Dispersion)
  // Trigrama: ☵ Water (☴ Wind baixo) — Água sobre vento, dissolução
  // ═══════════════════════════════════════════════════════════════
  59: {
    primitivos: [
      {
        primitivo: 'Dissolucao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 59 — Dispersão (Huàn): dissolve barriers, melt钢筋混凝土',
      },
      {
        primitivo: 'Renovacao',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 59 — Dispersão (Huàn): dissolução de bloqueios, renewal through release',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 60 — Jiè (Limitação / Limitation)
  // Trigrama: ☵ Water (☱ Lake baixo) — Água sobre lago, contenção
  // ═══════════════════════════════════════════════════════════════
  60: {
    primitivos: [
      {
        primitivo: 'Ordem',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 60 — Limitação (Jiè): disciplina natural, medida como sabedoria',
      },
      {
        primitivo: 'Discernimento',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 60 — Limitação (Jiè): saber o suficiente, knowing the measure',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 61 — Zhōngfú (Verdade Interior / Inner Truth)
  // Trigrama: ☱ Lake (☳ Thunder baixo) — Lago sobre trovão, sinceridade
  // ═══════════════════════════════════════════════════════════════
  61: {
    primitivos: [
      {
        primitivo: 'Pureza',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 61 — Verdade Interior (Zhōngfú): sinceridade radical, truthfulness to self',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 61 — Verdade Interior (Zhōngfú): poder do centro, power from within',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 62 — Xiáoguò (Pequena Excessiva / Small Exceedance)
  // Trigrama: ☳ Thunder (☶ Mountain baixo) — Trovão sobre monte, excesso menor
  // ═══════════════════════════════════════════════════════════════
  62: {
    primitivos: [
      {
        primitivo: 'Expressao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 62 — Pequena Excessiva (Xiáoguò): micro-excêsso, atenção ao detalhe excepcional',
      },
      {
        primitivo: 'Persistencia',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 62 — Pequena Excessiva (Xiáoguò): perfeição nos pequenos actos, greatness in small things',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 63 — Jìjǐ (Após a Conclusão / After Completion)
  // Trigrama: ☵ Water (☲ Fire baixo) — Água sobre fogo, equilibrio frágil
  // ═══════════════════════════════════════════════════════════════
  63: {
    primitivos: [
      {
        primitivo: 'Integracao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 63 — Após a Conclusão (Jìjǐ): integração pós-sucesso, ordenamiento del caos',
      },
      {
        primitivo: 'Discernimento',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 63 — Após a Conclusão (Jìjǐ): vigilância pós-vitória,discernimiento en la cima',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 64 — Wèijǐ (Antes do Começo / Before Completion)
  // Trigrama: ☲ Fire (☵ Water baixo) — Fogo sobre água, transição final
  // ═══════════════════════════════════════════════════════════════
  64: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 9,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 64 — Antes do Começo (Wèijǐ): limiar final, metamorfose no umbral, cruzando a ponte',
      },
      {
        primitivo: 'Movimento',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 64 — Antes do Começo (Wèijǐ): transição máxima, movilidad del puente',
      },
    ],
  },
};
// ─── Tabela compilada: ICHING_PRIMITIVES ────────────────────────────────────
/**
 * Tabela de mapeamento de cada hexagrama I Ching (1–64) para as suas
 * contribuições de primitivos Akáshicos no nível gift (linha de base).
 *
 * Cada entrada é um array de 1–3 PrimitiveContribution com intensidade
 * base 7–10 e polaridade 'luz' ou 'ambas'.
 *
 * Usar getIChingContribution() para obter versões ajustadas por nível.
 */
import { compileIChingPrimitives } from './synthesis-engine/iching-primitives';

export const ICHING_PRIMITIVES: Record<number, PrimitiveContribution[]> =
  compileIChingPrimitives(BASE);
