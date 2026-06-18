/**
 * @akasha/core — Mapeamentos: I Ching → Primitivos Akáshicos
 *
 * Mapeamento canônico dos 64 hexagramas do I Ching (Wilhelm/Baynes 1976)
 * para contribuições de primitivos do sistema Akáshico.
 *
 * Cada hexagrama recebe 1–3 PrimitiveContributions baseadas na sua
 * geometria trigramática (trigrama superior × inferior) e no seu
 * significado arquetípico Wilhelm/Baynes.
 *
 * A intensidade e polaridade são ajustadas em runtime por getIChingContribution()
 * consoante o nível de expressão (shadow | gift | siddhi).
 */
import type { Polaridade, PrimitiveContribution, Primitivo } from './types';

// ─── Tabela raiz: intensidade base 9, polaridade luz ────────────────────────
// Cada entrada é a contribuição "neutra" (nível gift) antes do ajuste de nível.

type HexagramaBase = {
  /** Primitivos ativados por este hexagrama. */
  primitivos: Array<{
    primitivo: Primitivo;
    intensidade: number;
    polaridade: Polaridade;
    fonte: string;
  }>;
};

const BASE: Record<number, HexagramaBase> = {
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
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 13 — Comunhão (Tóngrén): abertura ao outro, expressão partilhada',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 14 — Dàyòu (Abundância / Great Possession)
  // Trigrama: ☱ Lake (☰ Heaven baixo) — Lago sob céu, prosperidade
  // ═══════════════════════════════════════════════════════════════
  14: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 14 (Dàyòu/Abundância): grande possuir, riqueza interior e exterior, abundância partilhada',
      },
      {
        primitivo: 'Expansao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 14 — Abundância (Dàyòu): expansão da generosidade, fluxo contínuo',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 15 — Qián (Humildade / Modesty)
  // Trigrama: ☶ Mountain (☷ Earth baixo) — Monte sobre terra, simplicidade
  // ═══════════════════════════════════════════════════════════════
  15: {
    primitivos: [
      {
        primitivo: 'Sabedoria',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 15 — Humildade (Qián): moderação, sabedoria quietista, conhecimento de si',
      },
      {
        primitivo: 'Servico',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 15 — Humildade (Qián): serviço discreto,放下 ego para servir',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 16 — Yù (Entusiasmo / Enthusiasm)
  // Trigrama: ☳ Thunder (☷ Earth baixo) — Trovão sobre terra, excitación
  // ═══════════════════════════════════════════════════════════════
  16: {
    primitivos: [
      {
        primitivo: 'Expressao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 16 — Entusiasmo (Yù): inspiração, alegria expressiva, impulso criativo',
      },
      {
        primitivo: 'Movimento',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 16 — Entusiasmo (Yù): dinamismo vital, energia em fluxo',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 17 — Suí (Seguimento / Following)
  // Trigrama: ☱ Lake (☳ Thunder baixo) — Lago sobre trovão, adaptação
  // ═══════════════════════════════════════════════════════════════
  17: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 17 — Seguimento (Suí): adaptação, seguir a corrente, synergia',
      },
      {
        primitivo: 'Transformacao',
        intensidade: 7,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 17 — Seguimento (Suí): mutação através da adequação, flexibilidade transformadora',
      },
    ],
  },

  // // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 18 — Gǔ (Empreendimento / Work on the Decayed)
  // Trigrama: ☶ Mountain (☴ Wind baixo) — Monte sobre vento, reparação
  // ═══════════════════════════════════════════════════════════════
  18: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 9,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 18 — Empreendimento (Gǔ): restauração do corrompido, trabalho sobre a decomposição',
      },
      {
        primitivo: 'Ordem',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 18 — Empreendimento (Gǔ): esforço corretivo, disciplinar o que se deteriorou',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 19 — Lín (Aproximação / Approach)
  // Trigrama: ☱ Lake (☷ Earth baixo) — Lago sobre terra, proximidade
  // ═══════════════════════════════════════════════════════════════
  19: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 19 — Aproximação (Lín): aproximação do poder, avanço gradual',
      },
      {
        primitivo: 'Expansao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 19 — Aproximação (Lín): expansão territorial, avanço methodical',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 20 — Guān (Contemplação / Contemplation)
  // Trigrama: ☴ Wind (☷ Earth baixo) — Vento sobre terra, observação
  // ═══════════════════════════════════════════════════════════════
  20: {
    primitivos: [
      {
        primitivo: 'Intuicao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 20 — Contemplação (Guān): visão clara através da stillness, observação sagrada',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 20 — Contemplação (Guān): contemplação meditativa, discernimento profundo',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 21 — Shìkè (Mordida / Biting Through)
  // Trigrama: ☳ Thunder (☶ Mountain baixo) — Trovão sobre monte, perforação
  // ═══════════════════════════════════════════════════════════════
  21: {
    primitivos: [
      {
        primitivo: 'Poder',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 21 — Mordida (Shìkè): ação decisiva, romper obstáculos com autoridade',
      },
      {
        primitivo: 'Transformacao',
        intensidade: 7,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 21 — Mordida (Shìkè): fragmentação do véu, verdade que atravessa',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 22 — Bì (Graça / Grace)
  // Trigrama: ☶ Mountain (☱ Lake baixo) — Monte sobre lago, embellishment
  // ═══════════════════════════════════════════════════════════════
  22: {
    primitivos: [
      {
        primitivo: 'Expressao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 22 — Graça (Bì): adornar, beleza como caminho espiritual, estética sagrada',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 22 — Graça (Bì): refinamento interior, simplicidade elegante',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 23 — Bō (Desintegração / Splitting Apart)
  // Trigrama: ☷ Earth (☶ Mountain baixo) — Terra sobre monte, erosão
  // ═══════════════════════════════════════════════════════════════
  23: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 23 — Desintegração (Bō): dissolução do agarrar, soltura forçada',
      },
      {
        primitivo: 'Intuicao',
        intensidade: 6,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 23 — Desintegração (Bō): noite escura da alma, queda interior antes da ressurreição',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 24 — Fù (Retorno / Return)
  // Trigrama: ☳ Thunder (☷ Earth baixo) — Trovão sobre terra, inverno profundo
  // ═══════════════════════════════════════════════════════════════
  24: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 24 — Retorno (Fù): renovação, solstício de inverno, renascimento cíclico',
      },
      {
        primitivo: 'Movimento',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 24 — Retorno (Fù): virada interior, movimento de retorno ao源',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 25 — Wúwàng (Inocência / Innocence)
  // Trigrama: ☰ Heaven (☳ Thunder baixo) — Céu sobre trovão, ação natural
  // ═══════════════════════════════════════════════════════════════
  25: {
    primitivos: [
      {
        primitivo: 'Intuicao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 25 — Inocência (Wúwàng): ação espontânea,integridade,天真',
      },
      {
        primitivo: 'Poder',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 25 — Inocência (Wúwàng): poder do que age sem ego, força natural',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 26 — Dàxù (Grande Força / Great Taming)
  // Trigrama: ☶ Mountain (☰ Heaven baixo) — Monte sobre céu, domesticación
  // ═══════════════════════════════════════════════════════════════
  26: {
    primitivos: [
      {
        primitivo: 'Poder',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 26 — Grande Força (Dàxù): contenção do poder bruto, disciplina superior',
      },
      {
        primitivo: 'Ordem',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 26 — Grande Força (Dàxù): restrição do impulso, ordem como poder',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 27 — Yí (Nutrição / Nourishment)
  // Trigrama: ☶ Mountain (☳ Thunder baixo) — Monte sobre trovão, boca
  // ═══════════════════════════════════════════════════════════════
  27: {
    primitivos: [
      {
        primitivo: 'Materializacao',
        intensidade: 9,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 27 — Nutrição (Yí): sustentation, cuidado, input que sustenta',
      },
      {
        primitivo: 'Conexao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 27 — Nutrição (Yí): vínculo entre sustento e receptor, relação de cuidado',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 28 — Dàguò (Grande Excesso / Great Preponderance)
  // Trigrama: ☴ Wind (☱ Lake baixo) — Vento sobre lago, correnteza
  // ═══════════════════════════════════════════════════════════════
  28: {
    primitivos: [
      {
        primitivo: 'Expansao',
        intensidade: 10,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 28 — Grande Excesso (Dàguò): exuberância, overflow, criatividade desbordante',
      },
      {
        primitivo: 'Expressao',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 28 — Grande Excesso (Dàguò): expressão máxima,孩子在危险中',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 29 — Kǎn (Abismo / The Abysmal)
  // Trigrama: ☵ Water × ☵ Water (duplo água)
  // ═══════════════════════════════════════════════════════════════
  29: {
    primitivos: [
      {
        primitivo: 'Intuicao',
        intensidade: 9,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 29 — Abismo (Kǎn): água em poço, profundidade do inconsciente, abismo como guru',
      },
      {
        primitivo: 'Transformacao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 29 — Abismo (Kǎn): mergulho no深处, morte e renascimento interiores',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 30 — Lí (Aderência / Fire)
  // Trigrama: ☲ Fire × ☲ Fire (duplo fogo)
  // ═══════════════════════════════════════════════════════════════
  30: {
    primitivos: [
      {
        primitivo: 'Expressao',
        intensidade: 10,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 30 — Aderência (Lí): luz, clareza, discernimento ígneo, a chama da consciência',
      },
      {
        primitivo: 'Intuicao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 30 — Aderência (Lí): claridade mental, visão interior iluminada',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 31 — Xián (Mutual Influence / Wooing)
  // Trigrama: ☶ Mountain (☱ Lake baixo) — Monte sobre lago, atraçcão
  // ═══════════════════════════════════════════════════════════════
  31: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 31 — Influência Mútua (Xián): troca, casamento, relação de poder entre iguais',
      },
      {
        primitivo: 'Amor',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 31 — Influência Mútua (Xián): atrativo, sensibilidade receptiva no relacionamento',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 32 — Héng (Duração / Duration)
  // Trigrama: ☳ Thunder (☶ Mountain baixo) — Trovão sobre monte, constancia
  // ═══════════════════════════════════════════════════════════════
  32: {
    primitivos: [
      {
        primitivo: 'Ordem',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 32 — Duração (Héng): permanência, ritmo constante, tempo como estrutura',
      },
      {
        primitivo: 'Movimento',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 32 — Duração (Héng): continuidade do movimento, constância no fluxo',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 33 — Dùn (Retirada / Retreat)
  // Trigrama: ☶ Mountain (☰ Heaven baixo) — Monte sobre céu, retirada
  // ═══════════════════════════════════════════════════════════════
  33: {
    primitivos: [
      {
        primitivo: 'Sabedoria',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 33 — Retirada (Dùn): estratégica, sabedoria da proteção, saber quando recuar',
      },
      {
        primitivo: 'Intuicao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 33 — Retirada (Dùn): recolhimento intuitivo, proteção da luz interior',
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
          'Wilhelm/Baynes 1976, hexagrama 34 — Grande Força (Dàzhuàng): poderio raw, força criativa destruidora, rugido do trovão',
      },
      {
        primitivo: 'Movimento',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 34 — Grande Força (Dàzhuàng): impulso irresistível, dinamismo de poder',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 35 — Jìn (Progresso / Progress)
  // Trigrama: ☲ Fire ( ☷ Earth baixo) — Fogo sobre terra, iluminamiento
  // ═══════════════════════════════════════════════════════════════
  35: {
    primitivos: [
      {
        primitivo: 'Expansao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 35 — Progresso (Jìn): avanço da luz, expansão da claridade, reconhecimento público',
      },
      {
        primitivo: 'Expressao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 35 — Progresso (Jìn): manifestação exterior, claridade que se mostra',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 36 — Míngí (Ocultamento da Luz / Darkening of the Light)
  // Trigrama: ☷ Earth (☲ Fire baixo) — Terra sob fogo, eclipse
  // ═══════════════════════════════════════════════════════════════
  36: {
    primitivos: [
      {
        primitivo: 'Intuicao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 36 — Ocultamento da Luz (Míngí): eclipse, sabedoria na escuridão, recolhimento forçado',
      },
      {
        primitivo: 'Transformacao',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 36 — Ocultamento da Luz (Míngí): integração da sombra, transformação através da provação',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 37 — Jiārén (Família / The Family)
  // Trigrama: ☴ Wind (☲ Fire baixo) — Vento sobre fogo, lar
  // ═══════════════════════════════════════════════════════════════
  37: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 37 — Família (Jiārén): estrutura do lar, vínculo de sangue e alma, pertença',
      },
      {
        primitivo: 'Amor',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 37 — Família (Jiārén): amor familiar, cuidado, nutrição emocional',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 38 — Kuí (Oposição / Opposition)
  // Trigrama: ☲ Fire (☱ Lake baixo) — Fogo sobre lago, divergência
  // ═══════════════════════════════════════════════════════════════
  38: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 38 — Oposição (Kuíl): tensão entre polos, perspectiva divergent, catalyst para mudança',
      },
      {
        primitivo: 'Intuicao',
        intensidade: 7,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 38 — Oposição (Kuíl): ver através do conflito, discernimento atraves da diferença',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 39 — Jiǎn (Obstrução / Obstruction)
  // Trigrama: ☶ Mountain (☵ Water baixo) — Monte sobre água, bloqueio
  // ═══════════════════════════════════════════════════════════════
  39: {
    primitivos: [
      {
        primitivo: 'Intuicao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 39 — Obstrução (Jiǎn): busca interior forçada pelo bloqueio, peregrinação interna',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 39 — Obstrução (Jiǎn): conhecimento através da limitação, sapere através do não-poder',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 40 — Xiè (Liberação / Deliverance)
  // Trigrama: ☵ Water (☳ Thunder baixo) — Água sobre trovão, descarga
  // ═══════════════════════════════════════════════════════════════
  40: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 40 — Liberação (Xiè): desbloqueio, soltura, purificação pela tormenta',
      },
      {
        primitivo: 'Movimento',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 40 — Liberação (Xiè): resolução do nó, movimento restabelecido',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 41 — Sǔn (Diminuição / Decrease)
  // Trigrama: ☱ Lake (☶ Mountain baixo) — Lago sobre monte, sacrificio
  // ═══════════════════════════════════════════════════════════════
  41: {
    primitivos: [
      {
        primitivo: 'Servico',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 41 — Diminuição (Sǔn): sacrifício voluntário, servicio que diminue o ego',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 41 — Diminuição (Sǔn): sabedoria da renunciación, menos como mais',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 42 — Yì (Aumento / Increase)
  // Trigrama: ☳ Thunder (☴ Wind baixo) — Trovão sobre vento, fluxo
  // ═══════════════════════════════════════════════════════════════
  42: {
    primitivos: [
      {
        primitivo: 'Expansao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 42 — Aumento (Yì): crescimento orgânico, fluxo de energia crescente',
      },
      {
        primitivo: 'Movimento',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 42 — Aumento (Yì): impulso ascendente, momentum de criação',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 43 — Guài (Irrupção / Breakthrough)
  // Trigrama: ☱ Lake (☰ Heaven baixo) — Lago sobre céu, ruptura
  // ═══════════════════════════════════════════════════════════════
  43: {
    primitivos: [
      {
        primitivo: 'Poder',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 43 — Irrupção (Guài): decisão firme, ruptura com o antigo,果断',
      },
      {
        primitivo: 'Expressao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 43 — Irrupção (Guài): proclamação da verdade, fala que corta',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 44 — Gòu (Encontro / Coming to Meet)
  // Trigrama: ☰ Heaven (☴ Wind baixo) — Céu sobre vento, visitante
  // ═══════════════════════════════════════════════════════════════
  44: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 44 — Encontro (Gòu): advérso inesperado, encontro perigoso, tentaçcão',
      },
      {
        primitivo: 'Poder',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 44 — Encontro (Gòu): poder de resistir à sedução, fortaleza interior',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 45 — Cuì (Congregação / Gathering)
  // Trigrama: ☱ Lake (☷ Earth baixo) — Lago sobre terra, clustered
  // ═══════════════════════════════════════════════════════════════
  45: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 45 — Congregação (Cuì): reunião de pessoas, comunidade, alma em gather',
      },
      {
        primitivo: 'Servico',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 45 — Congregação (Cuì): serviço ao grupo, liderança servidor',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 46 — Shēng (Ascensão / Pushing Upward)
  // Trigrama: ☷ Earth (☶ Mountain baixo) — Terra sobre monte, crescimento vertical
  // ═══════════════════════════════════════════════════════════════
  46: {
    primitivos: [
      {
        primitivo: 'Expansao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 46 — Ascensão (Shēng): elevamento interior, crescimento orgânico ascendente',
      },
      {
        primitivo: 'Ordem',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 46 — Ascensão (Shēng): disciplina do crescendo, ordem em desenvolvimento vertical',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 47 — Kùn (Exaustão / Oppression)
  // Trigrama: ☱ Lake (☵ Water baixo) — Lago sobre água, esgotamento
  // ═══════════════════════════════════════════════════════════════
  47: {
    primitivos: [
      {
        primitivo: 'Intuicao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 47 — Exaustão (Kùn): provação, истощение, visão através do limite extremo',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 47 — Exaustão (Kùn): sapere no fundo do poço, conocimiento na privação',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 48 — Jǐng (O Poço / The Well)
  // Trigrama: ☴ Wind (☵ Water baixo) — Vento sobre água, manancial
  // ═══════════════════════════════════════════════════════════════
  48: {
    primitivos: [
      {
        primitivo: 'Materializacao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 48 — O Poço (Jǐng): água da vida,源 eterno, recurso inesgotável',
      },
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 48 — O Poço (Jǐng): vínculo com o源, acesso à água subterrânea da alma',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 49 — Gé (Revolução / Revolution)
  // Trigrama: ☲ Fire (☱ Lake baixo) — Fogo sobre lago, mudança de pele
  // ═══════════════════════════════════════════════════════════════
  49: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 10,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 49 — Revolução (Gé): mudança de pele, mutação total, fuego que purifica',
      },
      {
        primitivo: 'Poder',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 49 — Revolução (Gé): coragem de romper, poder de atravessar o velho',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 50 — Dǐng (O Caldeirão / The Cauldron)
  // Trigrama: ☴ Wind (☲ Fire baixo) — Vento sobre fogo, alquimia
  // ═══════════════════════════════════════════════════════════════
  50: {
    primitivos: [
      {
        primitivo: 'Materializacao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 50 — O Caldeirão (Dǐng): transmutação alquímica,.cozimento interior, sustento ritual',
      },
      {
        primitivo: 'Transformacao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 50 — O Caldeirão (Dǐng): cocção transformadora, digestão espiritual',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 51 — Zhèn (O Trovão / Thunder)
  // Trigrama: ☳ Thunder × ☳ Thunder (duplo trovão)
  // ═══════════════════════════════════════════════════════════════
  51: {
    primitivos: [
      {
        primitivo: 'Movimento',
        intensidade: 10,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 51 — O Trovão (Zhèn): choque, despertar súbito, rayo que sacode',
      },
      {
        primitivo: 'Poder',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 51 — O Trovão (Zhèn): força destrutiva criadora, poder de limpar pelo medo',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 52 — Gèn (Quietude / Keeping Still)
  // Trigrama: ☶ Mountain × ☶ Mountain (duplo monte)
  // ═══════════════════════════════════════════════════════════════
  52: {
    primitivos: [
      {
        primitivo: 'Sabedoria',
        intensidade: 10,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 52 — Quietude (Gèn): quietude interior, meditação, estabilidade inabalável',
      },
      {
        primitivo: 'Intuicao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 52 — Quietude (Gèn): observação sem movimento, acesso ao silêncio',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 53 — Jiàn (Desenvolvimento / gradual Progress)
  // Trigrama: ☴ Wind (☶ Mountain baixo) — Vento sobre monte, infiltração
  // ═══════════════════════════════════════════════════════════════
  53: {
    primitivos: [
      {
        primitivo: 'Movimento',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 53 — Desenvolvimento (Jiàn): progresso gradual, infiltração paciente,军队 em marcha',
      },
      {
        primitivo: 'Ordem',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 53 — Desenvolvimento (Jiàn): estrutura da sequência, orden progressivo',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 54 — Guīmèi (A Donzela / The Marrying Maiden)
  // Trigrama: ☱ Lake (☳ Thunder baixo) — Lago sobre trovão, entrega
  // ═══════════════════════════════════════════════════════════════
  54: {
    primitivos: [
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 54 — A Donzela (Guīmèi): entrega, sacrifício involuntário, subordinação perigosa',
      },
      {
        primitivo: 'Amor',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 54 — A Donzela (Guīmèi): amor que se entrega sem boundaries, coração vulnerável',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 55 — Fēng (Abundância / Abundance)
  // Trigrama: ☳ Thunder (☲ Fire baixo) — Trovão sobre fogo, plenitude
  // ═══════════════════════════════════════════════════════════════
  55: {
    primitivos: [
      {
        primitivo: 'Expansao',
        intensidade: 10,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 55 — Abundância (Fēng): plenitude, momento de máximo brilho, cénit',
      },
      {
        primitivo: 'Poder',
        intensidade: 8,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 55 — Abundância (Fēng): poder em auge, responsabilidade do que está em cima',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 56 — Lǚ (Viagem / The Wanderer)
  // Trigrama: ☲ Fire (☶ Mountain baixo) — Fogo sobre monte, странник
  // ═══════════════════════════════════════════════════════════════
  56: {
    primitivos: [
      {
        primitivo: 'Movimento',
        intensidade: 9,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 56 — Viagem (Lǚ): errância, aprendizado pelo deslocamento, peregrinação',
      },
      {
        primitivo: 'Expressao',
        intensidade: 7,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 56 — Viagem (Lǚ): adapting expression, performance exterior, papel do estrangeiro',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 57 — Xùn (Suavidade / Wind)
  // Trigrama: ☴ Wind × ☴ Wind (duplo vento)
  // ═══════════════════════════════════════════════════════════════
  57: {
    primitivos: [
      {
        primitivo: 'Intuicao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 57 — Suavidade (Xùn): penetração suave, influência sutil, sopro do espírito',
      },
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 57 — Suavidade (Xùn): comunicação穿透, vínculo que flui sem força',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 58 — Duì (Alegria / The Joyful)
  // Trigrama: ☱ Lake × ☱ Lake (duplo lago)
  // ═══════════════════════════════════════════════════════════════
  58: {
    primitivos: [
      {
        primitivo: 'Expressao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 58 — Alegria (Duì): contentamento, lake como satisfação, deleite',
      },
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 58 — Alegria (Duì): alegria compartilhada, vínculo que alegra',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 59 — Huàn (Dispersão / Dispersion)
  // Trigrama: ☵ Water (☴ Wind baixo) — Água sobre vento, diluição
  // ═══════════════════════════════════════════════════════════════
  59: {
    primitivos: [
      {
        primitivo: 'Transformacao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 59 — Dispersão (Huàn): dissolução de barreiras,看不清, libertação massiva',
      },
      {
        primitivo: 'Conexao',
        intensidade: 7,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 59 — Dispersão (Huàn): unificação pelo rito, comunidade dissolvente',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 60 — Jié (Limitação / Limitation)
  // Trigrama: ☵ Water (☱ Lake baixo) — Água sobre lago, contenção
  // ═══════════════════════════════════════════════════════════════
  60: {
    primitivos: [
      {
        primitivo: 'Ordem',
        intensidade: 9,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 60 — Limitação (Jié): contenção produtiva, limite como estrutura,纪律',
      },
      {
        primitivo: 'Sabedoria',
        intensidade: 7,
        polaridade: 'ambas',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 60 — Limitação (Jié): sabedoria do limite, conocer el confine',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 61 — Zhōngfú (Verdade Interior / Inner Truth)
  // Trigrama: ☱ Lake (☴ Wind baixo) — Lago sobre vento, confiança
  // ═══════════════════════════════════════════════════════════════
  61: {
    primitivos: [
      {
        primitivo: 'Intuicao',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 61 — Verdade Interior (Zhōngfú): fé íntima, verdade no coração,信',
      },
      {
        primitivo: 'Conexao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 61 — Verdade Interior (Zhōngfú): vínculo com o源 interior, confiança no源',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 62 — Xiáoguò ( Pequeno excesso / Small Excess)
  // Trigrama: ☳ Thunder (☶ Mountain baixo) — Trovão sobre monte, detalhe
  // ═══════════════════════════════════════════════════════════════
  62: {
    primitivos: [
      {
        primitivo: 'Ordem',
        intensidade: 8,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 62 — Pequeno Excesso (Xiáoguò): perfeição no detalhe, excesso de forma, cuidado excesivo',
      },
      {
        primitivo: 'Expressao',
        intensidade: 7,
        polaridade: 'sombra',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 62 — Pequeno Excesso (Xiáoguò): forma sobre essência, expressão esculpida em demasia',
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // HEXAGRAMA 63 — Jìjǐ (Antes da Consumnação / After Completion)
  // Trigrama: ☵ Water (☲ Fire baixo) — Água sobre fogo, almost there
  // ═══════════════════════════════════════════════════════════════
  63: {
    primitivos: [
      {
        primitivo: 'Sabedoria',
        intensidade: 9,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 63 — Antes da Consumnação (Jìjǐ): paz após a obra, mas vigília da结尾',
      },
      {
        primitivo: 'Intuicao',
        intensidade: 8,
        polaridade: 'luz',
        fonte:
          'Wilhelm/Baynes 1976, hexagrama 63 — Antes da Consumnação (Jìjǐ): discernment at the end, visão que distingue',
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
export const ICHING_PRIMITIVES: Record<number, PrimitiveContribution[]> = Object.fromEntries(
  Object.entries(BASE).map(([num, data]) => [
    Number(num),
    data.primitivos.map(({ primitivo, intensidade, polaridade, fonte }) => ({
      primitivo: primitivo as PrimitiveContribution['primitivo'],
      intensidade,
      polaridade: polaridade as Polaridade,
      fonte,
    })),
  ])
) as Record<number, PrimitiveContribution[]>;

// ─── Re-export da API de síntese ─────────────────────────────────────────────
export { getIChingContribution } from './iching-contribution';
