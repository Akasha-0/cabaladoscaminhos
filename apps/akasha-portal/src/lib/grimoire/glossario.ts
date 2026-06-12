/**
 * Glossário Vivo — F-243
 *
 * O sistema Akasha usa termos técnicos das 5 tradições (Sefirot, Odu,
 * Hexagrama, Tantra, Nodo, etc.). Para o usuário final, esses termos
 * precisam ser traduzidos em linguagem acessível, sem perder a
 * precisão simbólica.
 *
 * Esta camada fecha esse gap. Cada entrada tem:
 *   - termo: nome canônico (PT-BR)
 *   - definicao: 1-2 frases diretas, 2ª pessoa, sem jargão
 *   - sistema: de qual sistema vem (Cabala, I Ching, Odu, Tantra, Astrologia, Geral)
 *   - fonte: onde buscar profundidade
 *   - sinonimos: termos parecidos (vindos de outros sistemas)
 *
 * Princípios editoriais:
 *   - Linguagem acessível (sem jargão sem tradução)
 *   - 2ª pessoa ("você", "hoje")
 *   - Cada termo tem FONTE (axioma 4 VISION)
 *   - Cross-references entre termos (ex: Sefirot ↔ Chakra ↔ Corpo sutil)
 */

export type SistemaGlossario =
  | 'cabala'
  | 'astrologia'
  | 'tantrica'
  | 'odu'
  | 'iching'
  | 'geral';

export interface EntradaGlossario {
  termo: string;
  definicao: string;
  sistema: SistemaGlossario;
  fonte: string;
  sinonimos: string[];
}

export const GLOSSARIO: EntradaGlossario[] = [
  // ── CABALA ──────────────────────────────────────────────────────
  {
    termo: 'Caminho de Vida (Life Path)',
    definicao: 'O número que resume sua missão nesta vida, calculado a partir da sua data de nascimento. Não é destino — é o tema central do seu contrato de encarnação.',
    sistema: 'cabala',
    fonte: 'Mispar Hechrachi; Sefer Yetzirah cap. 4',
    sinonimos: ['Life Path', 'Número de Destino', 'Caminho Cabalístico'],
  },
  {
    termo: 'Sefirot',
    definicao: 'As 10 esferas de manifestação divina na Cabala. Cada uma é uma qualidade de Deus em ação: Keter (Coroa), Chokhmah (Sabedoria), Binah (Compreensão)... No mapa pessoal, são níveis da sua jornada interior.',
    sistema: 'cabala',
    fonte: 'Sefer Yetzirah 1; Zohar',
    sinonimos: ['Emanations', 'Centros Cabalísticos'],
  },
  {
    termo: 'Árvore da Vida (Etz Chaim)',
    definicao: 'O diagrama das 10 Sefirot conectadas por 22 caminhos. É o mapa-mãe do misticismo judaico — onde Cabala, Astrologia e I Ching se cruzam.',
    sistema: 'cabala',
    fonte: 'Sefer Yetzirah; Zohar',
    sinonimos: ['Etz Chaim', 'Tree of Life'],
  },
  {
    termo: 'Número Mestre',
    definicao: 'Life Path 11, 22 ou 33. São versões "amplificadas" de números base (1-2, 2-2, 3-3). Carregam missão espiritual + sensibilidade maior + risco de autoquestionamento.',
    sistema: 'cabala',
    fonte: 'Mispar Hechrachi; numerologia mestre (Pinnock 2010)',
    sinonimos: ['Master Number', 'Número de Dom'],
  },
  {
    termo: 'Tikkun',
    definicao: 'Correção, reparo. Na Cabala Luriânica, cada alma tem um Tikkun — uma ferida original a ser curada nesta vida. Sua tarefa não é evitar a ferida, é curá-la.',
    sistema: 'cabala',
    fonte: 'Isaac Luria, 1570 (Zohar Ari)',
    sinonimos: ['Reparação'],
  },

  // ── ASTROLOGIA ──────────────────────────────────────────────────
  {
    termo: 'Sol',
    definicao: 'Quem você é. No mapa, mostra sua identidade essencial — não o que você faz, mas quem você É. Permanece o mesmo do nascimento à morte.',
    sistema: 'astrologia',
    fonte: 'Brennan 2017, cap. 8',
    sinonimos: ['Signo Solar'],
  },
  {
    termo: 'Ascendente',
    definicao: 'Como você se mostra ao mundo. A "máscara" que você veste no primeiro encontro. Muda a cada 2h, então exige hora EXATA de nascimento.',
    sistema: 'astrologia',
    fonte: 'Brennan 2017, cap. 6',
    sinonimos: ['ASC', 'Rising Sign', 'Signo Ascendente'],
  },
  {
    termo: 'Lua',
    definicao: 'Como você sente. Suas emoções, instintos, memórias. O "crescente" que você cuida. Mudança a cada 2.5 dias.',
    sistema: 'astrologia',
    fonte: 'Brennan 2017, cap. 9',
    sinonimos: ['Signo Lunar', 'Moon'],
  },
  {
    termo: 'Nodo Norte',
    definicao: 'A direção de evolução da alma. O que você veio aprender nesta vida. Muitas vezes desconfortável porque pede ir além do conhecido.',
    sistema: 'astrologia',
    fonte: 'Brennan 2017; Jyotish R-018',
    sinonimos: ['Rahu (Védica)', 'True Node'],
  },
  {
    termo: 'Lilith (Lua Negra)',
    definicao: 'A parte que você esconde. Não é "mal" — é o que você reprime, o que te excita em segredo, o que não admite nem para si. Honrá-la é integrar a sombra.',
    sistema: 'astrologia',
    fonte: 'Brennan 2017, cap. 17; Liz Greene',
    sinonimos: ['Black Moon Lilith', 'Lua Negra'],
  },
  {
    termo: 'Casa 8',
    definicao: 'Sexo, morte, dinheiro do outro, intimidade profunda, transformação. A casa que mostra o que você DESEJA perder o controle — o que te faz transbordar.',
    sistema: 'astrologia',
    fonte: 'Brennan 2017, cap. 6',
    sinonimos: ['Oitava Casa'],
  },

  // ── TÂNTRICA ──────────────────────────────────────────────────
  {
    termo: 'Corpo (kosa / corpo sutil)',
    definicao: 'Os 11 corpos são camadas da anatomia sutil no Tantra. Do físico (corpo 5) ao Divino (corpo 11). Cada corpo sente, vibra, fala — quando VOCÊ aprende a ouvi-los, a vida fica mais clara.',
    sistema: 'tantrica',
    fonte: 'KRI 2007, Aquarian Teacher (Yogi Bhajan); Taittiriya Upanishad (pancha kosha)',
    sinonimos: ['Kosa', 'Anatomia Sutil'],
  },
  {
    termo: 'Kundalini',
    definicao: 'A energia que dorme na base da coluna e sobe quando acordada. No Tantra, a Kundalini é a força que ilumina os 11 corpos em sequência — não é força bruta, é PRESENÇA.',
    sistema: 'tantrica',
    fonte: 'KRI 2007; Hatha Yoga Pradipika',
    sinonimos: ['Energia Kundalini'],
  },
  {
    termo: 'Trigêmeo',
    definicao: 'A tríade corpo/emoção/mente. Cada pessoa tem um trigêmeo predominante — o "como" você se move no mundo. Físico = presença. Astral = emoção. Mental = pensamento.',
    sistema: 'tantrica',
    fonte: 'KRI 2007',
    sinonimos: ['Triade Físico-Astral-Mental'],
  },
  {
    termo: 'Prana',
    definicao: 'A energia vital que anima o corpo. Não é sangue nem eletricidade — é o que faz a vida ser VIVA. Respiração e meditação o expandem.',
    sistema: 'tantrica',
    fonte: 'KRI 2007; Ayurveda',
    sinonimos: ['Qi (Chinês)', 'Ki (Jap.)', 'Pneuma (Grego)'],
  },
  {
    termo: 'Mente Divina',
    definicao: 'O 11º corpo — o mais sutil. É o canal entre VOCÊ e a fonte. Quando ele está ativo, você tem intuição clara, visão, conexão. Quando inativo, vida fica barulhenta.',
    sistema: 'tantrica',
    fonte: 'KRI 2007',
    sinonimos: ['Corpo 11', 'Buddhi'],
  },

  // ── ODU ──────────────────────────────────────────────────
  {
    termo: 'Odu',
    definicao: 'Os 16 signos fundamentais do sistema iorubá (Ifá/Candomblé). Cada Odu carrega uma qualidade de destino, preceitos, e conexões com orixás.',
    sistema: 'odu',
    fonte: 'Verger 1973; Mbiti 1969',
    sinonimos: ['Odus de Ifá', 'Signos Iorubás'],
  },
  {
    termo: 'Ori',
    definicao: 'A "cabeça divina" — sua essência espiritual, seu propósito de vida. Determinado pelo Odu de nascimento. O Ori é consultado pelo babalaô/yaô, NÃO por apps.',
    sistema: 'odu',
    fonte: 'Verger 1973; Mbiti 1969',
    sinonimos: ['Cabeça Divina'],
  },
  {
    termo: 'Orixá',
    definicao: 'Forças da natureza divinizadas. Cada pessoa tem 1 ou mais orixás regentes (definidos pelo Odu de nascimento). A relação com cada orixá é de FILIAÇÃO, não de obediência.',
    sistema: 'odu',
    fonte: 'Verger 1973; Mbiti 1969',
    sinonimos: ['Orixás', 'Divindades Iorubás'],
  },
  {
    termo: 'Babalaô / Yaô',
    definicao: 'Sacerdote/ sacerdotisa do candomblé/Ifá. Pessoa com INICIAÇÃO e AUTORIDADE ritual para interpretar Ori, conduzir ebós, abrir caminhos. SEM substituto em app.',
    sistema: 'odu',
    fonte: 'R-022 §4.4 (Ética Akasha)',
    sinonimos: ['Sacerdote Iorubá'],
  },
  {
    termo: 'Ebó',
    definicao: 'Oferenda ritual. Pode ser elemento (comida, planta, animal), ação (caminhar, jejuar, banhar) ou palavra (prece). O ebó libera caminhos; o Odu diz QUAL ebó, em QUAL momento.',
    sistema: 'odu',
    fonte: 'Verger 1973; Mbiti 1969',
    sinonimos: ['Oferenda Ritual'],
  },

  // ── I CHING ──────────────────────────────────────────────────
  {
    termo: 'Hexagrama',
    definicao: 'Figura de 6 linhas (cada uma yin ou yang) que representa um momento. 64 hexagramas cobrem todas as situações possíveis da vida. Não é previsão — é ESPELHO.',
    sistema: 'iching',
    fonte: 'Wilhelm/Baynes 1950, I Ching: O Livro das Mutações',
    sinonimos: ['Hexagrama King Wen'],
  },
  {
    termo: 'Yin / Yang',
    definicao: 'As duas forças fundamentais: Yin (receptivo, escuro, lunar) e Yang (ativo, claro, solar). Não são opostos — são complementares. 6 linhas yin/yang formam 1 hexagrama.',
    sistema: 'iching',
    fonte: 'Wilhelm/Baynes 1950; Tao Te Ching',
    sinonimos: ['Yin/Yang'],
  },
  {
    termo: 'Trigrama',
    definicao: 'Figura de 3 linhas (yin/yang). 8 trigramas básicos formam os 64 hexagramas. O trigrama SUPERIOR e INFERIOR juntos descrevem a fase do momento.',
    sistema: 'iching',
    fonte: 'Wilhelm/Baynes 1950',
    sinonimos: ['Ba Gua', 'Trigrama'],
  },
  {
    termo: 'Mutação',
    definicao: 'O I Ching é o livro das MUTAÇÕES. Cada linha yin pode virar yang e cada yang pode virar yin. A vida muda — o livro fala com quem ESCUTA a mudança.',
    sistema: 'iching',
    fonte: 'Wilhelm/Baynes 1950',
    sinonimos: ['Mudança'],
  },

  // ── GERAL ──────────────────────────────────────────────────
  {
    termo: 'Signo',
    definicao: '12 divisões do céu zodiacal (Áries, Touro, Gêmeos...). Cada planeta transita por 1 signo a cada período. Sol: ~30 dias. Lua: ~2.5 dias.',
    sistema: 'astrologia',
    fonte: 'Brennan 2017',
    sinonimos: ['Signo Zodiacal'],
  },
  {
    termo: 'Tríade Sombra/Dom/Graça',
    definicao: 'Gene Keys (Rudd) — 3 níveis de leitura de 1 Gene Key. Sombra: a tensão. Dom: o talento quando você domina a sombra. Graça: a iluminação quando o Dom se torna oferenda.',
    sistema: 'geral',
    fonte: 'R-015 (Gene Keys reverse-engineering)',
    sinonimos: ['Shadow/Gift/Siddhi', 'Tríade Gene Keys'],
  },
  {
    termo: 'Temperamento',
    definicao: 'A "tinta" básica da sua energia. 4 hipocráticos: Sanguíneo (social, aéreo), Colérico (decidido, fogo), Melancólico (profundo, terra), Fleumático (pacífico, água).',
    sistema: 'geral',
    fonte: 'Hipócrates, *Sobre a Natureza do Homem* c. 400 a.C.; Kant 1798',
    sinonimos: ['Humor', 'Constituição'],
  },
  {
    termo: 'Mandato do Dia',
    definicao: 'A leitura curada para HOJE — qual Pilar está mais ativo, qual Área pede atenção, qual é a Prática do dia. Muda a cada dia, baseado no trânsito lunar, hexagrama do dia, e Odu principal.',
    sistema: 'geral',
    fonte: 'VISION §4 (Akasha Mandato)',
    sinonimos: ['Mandato'],
  },
  {
    termo: 'Pilar',
    definicao: 'Cada uma das 5 tradições do Akasha: Cabala, Astrologia, Tântrica, Odu, I Ching. 5 Pilares convergem em 1 pessoa. Cada Pilar fala um aspecto da verdade; juntos, dão a foto completa.',
    sistema: 'geral',
    fonte: 'VISION §2 (5 Pilares)',
    sinonimos: ['Sistema', 'Tradição'],
  },
];

/** Devolve entradas por sistema. */
export function glossarioPorSistema(sistema: SistemaGlossario): EntradaGlossario[] {
  return GLOSSARIO.filter((e) => e.sistema === sistema);
}

/** Busca por termo (case-insensitive). */
export function buscarGlossario(termo: string): EntradaGlossario | undefined {
  const t = termo.toLowerCase();
  return GLOSSARIO.find(
    (e) =>
      e.termo.toLowerCase() === t ||
      e.sinonimos.some((s) => s.toLowerCase() === t),
  );
}

/** Estatísticas para curadores. */
export function coberturaGlossario(): { total: number; por_sistema: Record<SistemaGlossario, number> } {
  const por_sistema: Record<SistemaGlossario, number> = {
    cabala: 0, astrologia: 0, tantrica: 0, odu: 0, iching: 0, geral: 0,
  };
  GLOSSARIO.forEach((e) => {
    por_sistema[e.sistema] += 1;
  });
  return { total: GLOSSARIO.length, por_sistema };
}
