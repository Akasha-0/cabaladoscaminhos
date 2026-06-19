export type TrigramaId =
  | 'Heaven'   // ☰ — pure yang, creativity, heaven
  | 'Earth'    // ☷ — pure yin, receptivity, earth
  | 'Thunder'  // ☳ — yang over yin, arousal, thunder
  | 'Wind'     // ☴ — yin over yang, infiltration, wind
  | 'Water'    // ☵ — yin over yang, abyss, water
  | 'Fire'     // ☲ — yang over yin, clinging, fire
  | 'Mountain' // ☶ — yin over yang, stillness, mountain
  | 'Lake';    // ☱ — yang over yin, joy, lake

export type TrigramaMeta = {
  id: TrigramaId;
  nome: string;
  natureza: 'yang' | 'yin' | 'mixed';
  significado: string;
};

/** Lower (inner) and upper (outer) trigrama for each hexagram 1–64. */
export type HexagramaTrigramas = {
  lower: TrigramaId;
  upper: TrigramaId;
};

/** Map of hexagrama number → its two trigrama composition. */
export const HEXAGRAMA_TRIGRAMAS: Record<number, HexagramaTrigramas> = {
  1:  { lower: 'Heaven',  upper: 'Heaven'  },
  2:  { lower: 'Earth',  upper: 'Earth'   },
  3:  { lower: 'Wind',   upper: 'Thunder'  },
  4:  { lower: 'Wind',   upper: 'Mountain' },
  5:  { lower: 'Heaven', upper: 'Water'    },
  6:  { lower: 'Earth',  upper: 'Heaven'   },
  7:  { lower: 'Earth',  upper: 'Thunder'  },
  8:  { lower: 'Thunder', upper: 'Earth'   },
  9:  { lower: 'Heaven', upper: 'Wind'     },
  10: { lower: 'Lake',   upper: 'Heaven'   },
  11: { lower: 'Heaven', upper: 'Earth'    },
  12: { lower: 'Earth',  upper: 'Heaven'   },
  13: { lower: 'Heaven', upper: 'Thunder'  },
  14: { lower: 'Fire',   upper: 'Heaven'   },
  15: { lower: 'Earth',  upper: 'Mountain' },
  16: { lower: 'Thunder', upper: 'Lake'     },
  17: { lower: 'Lake',   upper: 'Thunder'  },
  18: { lower: 'Mountain', upper: 'Wind'   },
  19: { lower: 'Earth',  upper: 'Lake'     },
  20: { lower: 'Lake',   upper: 'Earth'    },
  21: { lower: 'Thunder', upper: 'Fire'    },
  22: { lower: 'Fire',   upper: 'Mountain' },
  23: { lower: 'Mountain', upper: 'Earth' },
  24: { lower: 'Earth',  upper: 'Thunder'  },
  25: { lower: 'Heaven', upper: 'Thunder'  },
  26: { lower: 'Mountain', upper: 'Heaven'},
  27: { lower: 'Thunder', upper: 'Mountain'},
  28: { lower: 'Lake',   upper: 'Heaven'  },
  29: { lower: 'Water',  upper: 'Water'   },
  31: { lower: 'Lake',   upper: 'Mountain' },
  32: { lower: 'Thunder', upper: 'Fire'    },
  33: { lower: 'Mountain', upper: 'Heaven'},
  34: { lower: 'Thunder', upper: 'Heaven'  },
  35: { lower: 'Earth',  upper: 'Fire'     },
  36: { lower: 'Fire',   upper: 'Earth'    },
  37: { lower: 'Wind',   upper: 'Fire'     },
  38: { lower: 'Fire',   upper: 'Lake'     },
  39: { lower: 'Water',  upper: 'Mountain' },
  40: { lower: 'Thunder', upper: 'Water'   },
  41: { lower: 'Mountain', upper: 'Lake'  },
  42: { lower: 'Wind',   upper: 'Thunder' },
  43: { lower: 'Lake',   upper: 'Heaven'   },
  44: { lower: 'Heaven', upper: 'Wind'    },
  45: { lower: 'Lake',   upper: 'Earth'    },
  46: { lower: 'Earth',  upper: 'Wind'     },
  47: { lower: 'Lake',   upper: 'Water'    },
  48: { lower: 'Water',  upper: 'Wind'     },
  49: { lower: 'Fire',   upper: 'Lake'     },
  50: { lower: 'Fire',   upper: 'Wind'     },
  51: { lower: 'Thunder', upper: 'Thunder' },
  52: { lower: 'Mountain', upper: 'Mountain'},
  53: { lower: 'Wind',   upper: 'Mountain' },
  54: { lower: 'Lake',   upper: 'Thunder' },
  55: { lower: 'Thunder', upper: 'Fire'    },
  56: { lower: 'Fire',   upper: 'Mountain' },
  57: { lower: 'Wind',   upper: 'Wind'     },
  58: { lower: 'Lake',   upper: 'Lake'     },
  59: { lower: 'Water',  upper: 'Wind'     },
  60: { lower: 'Water',  upper: 'Lake'     },
  61: { lower: 'Wind',   upper: 'Lake'     },
  62: { lower: 'Thunder', upper: 'Mountain'},
  63: { lower: 'Water',  upper: 'Fire'     },
  64: { lower: 'Fire',   upper: 'Water'    },
};

/** Metadata for each of the 8 trigramas. */
export const TRIGRAMAS: Record<TrigramaId, TrigramaMeta> = {
  Heaven:    { id: 'Heaven',    nome: 'Qián',       natureza: 'yang',   significado: 'Criação, força criativa pura' },
  Earth:     { id: 'Earth',     nome: 'Kūn',        natureza: 'yin',   significado: 'Receptivo, nutrição terrestre' },
  Thunder:   { id: 'Thunder',   nome: 'Zhèn',       natureza: 'mixed', significado: 'Arousal, dinamismo, trovão' },
  Wind:      { id: 'Wind',      nome: 'Xùn',        natureza: 'mixed', significado: 'Infiltrar, gentileza, vento' },
  Water:     { id: 'Water',     nome: 'Kǎn',        natureza: 'mixed', significado: 'Abismo, perigo, água' },
  Fire:      { id: 'Fire',      nome: 'Lí',         natureza: 'mixed', significado: 'Aderir, claridade, fogo' },
  Mountain:  { id: 'Mountain',  nome: 'Gèn',        natureza: 'yin',   significado: 'Quietude, pausa, monte' },
  Lake:      { id: 'Lake',      nome: 'Duì',        natureza: 'yang',   significado: 'Alegria, satisfação, lago' },
};

/** Returns the trigrama composition for a given hexagrama (1-64). */
export function getHexagramaTrigramas(n: number): HexagramaTrigramas | undefined {
  return HEXAGRAMA_TRIGRAMAS[n];
}

/** Returns metadata for a given trigrama id. */
export function getTrigramaMeta(id: TrigramaId): TrigramaMeta | undefined {
  return TRIGRAMAS[id];
}
