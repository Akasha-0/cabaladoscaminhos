import type { UserSpiritualData, ChatMessage } from './types';
import { generateMinimaxResponse } from './minimax';

// ============================================================
// TYPE DEFINITIONS
// ============================================================

/**
 * Cross-tradition archetype pattern
 */
export interface ArchetypePattern {
  id: string;
  name: string;
  traditions: string[];
  energy_signature: string;
  manifestations: {
    kabbalah?: string;
    ifa?: string;
    candomble?: string;
    tarot?: string;
    astrology?: string;
    numerology?: string;
  };
  growth_areas: string[];
}

/**
 * How an archetype manifests across different traditions
 */
export interface ArchetypeManifestation {
  tradition: string;
  name: string;
  description: string;
  keywords: string[];
  symbols: string[];
  practices: string[];
}

// ============================================================
// ARCHETYPE DATABASE
// ============================================================

const ARCHETYPE_DATABASE: ArchetypePattern[] = [
  {
    id: 'warrior',
    name: 'Guerreiro',
    traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
    energy_signature: 'força, coragem, ação',
    manifestations: {
      kabbalah: 'Chesed (Keter) - Misericordia/Dizima',
      ifa: 'Ogbe - Primeiro Odu da criação',
      candomble: 'Ogun - O ferro e os guerreiros',
      tarot: 'A Torre - Transformação pela ação',
      astrology: 'Marte - Energia martial, vontade',
      numerology: '9 - Completude, força mental',
    },
    growth_areas: ['impaciência', 'agressividade', 'rigidez'],
  },
  {
    id: 'lover',
    name: 'Amante',
    traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
    energy_signature: 'harmonia, conexao, beleza',
    manifestations: {
      kabbalah: 'Gevurah (Hod) - Julgamento/Gratidão',
      ifa: 'Oxum - freshwater and love',
      candomble: 'Oxum - The beautiful one',
      tarot: 'Os Enamorados - União e escolha',
      astrology: 'Vênus - Amor, beleza, arte',
      numerology: '6 - Harmonia, família, serviço',
    },
    growth_areas: ['dependência', 'ciúmes', 'superficialidade'],
  },
  {
    id: 'magician',
    name: 'Mago',
    traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
    energy_signature: 'manifestação, poder, transformação',
    manifestations: {
      kabbalah: 'Tiferet - Beleza/Harmonia',
      ifa: 'Oxumar - Wealth manifestation',
      candomble: 'Oxumare - Snake wisdom',
      tarot: 'O Mago - Recursos e intencionalidade',
      astrology: 'Mercúrio - Comunicação, magia mental',
      numerology: '1 - Liderança, inovação, início',
    },
    growth_areas: ['manipulação', 'orgulho', 'superficialidade'],
  },
  {
    id: 'hermit',
    name: 'Eremita',
    traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
    energy_signature: 'iluminação, solitude, sabedoria',
    manifestations: {
      kabbalah: 'Biná (Hokhmá) - Sabedoria/Intuição',
      ifa: 'Ori - Head/will/destiny',
      candomble: 'Orunmilá - Ifá oracle wisdom',
      tarot: 'O Eremita - Busca interior',
      astrology: 'Saturno - Limites, maturidade, tempo',
      numerology: '8 - Abundância material e espiritual',
    },
    growth_areas: ['isolamento', 'melancolia', 'rigidez'],
  },
  {
    id: 'sage',
    name: 'Sábio',
    traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
    energy_signature: 'conhecimento, verdade, expansão',
    manifestations: {
      kabbalah: 'Daat - Conhecimento',
      ifa: 'Owonrin - Deep wisdom',
      candomble: 'Exu - Communication and crossroads',
      tarot: 'O Louco - Pureza e verdade interior',
      astrology: 'Júpiter - Expansão, filosofia, sorte',
      numerology: '3 - Expressão criativa, comunicação',
    },
    growth_areas: ['imobilismo intelectual', 'dogmatismo', 'crítica excessiva'],
  },
  {
    id: 'transformer',
    name: 'Transformador',
    traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
    energy_signature: 'morte e renascimento, metamorfose',
    manifestations: {
      kabbalah: 'Yesod - Fundação/Imaginação',
      ifa: 'Ose - Spirit force and transformation',
      candomble: 'Shakpana - Plague and transformation',
      tarot: 'A Morte - Transformação inevitável',
      astrology: 'Plutão - Regeneração, poder, transformação',
      numerology: '5 - Mudança, liberdade, adaptabilidade',
    },
    growth_areas: ['medo da mudança', 'resistência', 'teimosia'],
  },
  {
    id: 'creator',
    name: 'Criador',
    traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
    energy_signature: 'criação, fertilidade, expressão',
    manifestations: {
      kabbalah: 'Malkut - Realeza/Mundane',
      ifa: 'Irosun - Children and creativity',
      candomble: 'Iemanja - Sea, motherhood, creativity',
      tarot: 'A Imperatriz - Fertilidade e natureza',
      astrology: 'Sol - Identidade, propósito, vitalidade',
      numerology: '2 - Parceria, sensibilidade, diplomacy',
    },
    growth_areas: ['procrastinação', 'perfeccionismo', 'bloqueio criativo'],
  },
  {
    id: 'innocent',
    name: 'Inocente',
    traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
    energy_signature: 'pureza, confiança, renovação',
    manifestations: {
      kabbalah: 'Keter - Coroa/Pureza',
      ifa: 'Odi - Healing and innocence',
      candomble: 'Omulu - Disease prevention and healing',
      tarot: 'O Louco - Pureza, novo começo',
      astrology: 'Lua - Nutrição, emoções, lar',
      numerology: '7 - Espiritualidade, introspecção, perfection',
    },
    growth_areas: ['ingenuidade', 'fuga de responsabilidade', 'naividade'],
  },
  {
    id: 'explorer',
    name: 'Explorador',
    traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
    energy_signature: 'liberdade, aventura, descoberta',
    manifestations: {
      kabbalah: 'Hesed - Misericórdia',
      ifa: 'Ofun - Journey and travel',
      candomble: 'Oxosse - Hunter, forest, freedom',
      tarot: 'A Roda da Fortuna - Ciclos e destino',
      astrology: 'Urano - Inovação, liberdade, originalidade',
      numerology: '4 - Estabilidade, fundamento, trabalho',
    },
    growth_areas: ['inquietação', 'fuga de compromisso', 'superficialidade'],
  },
  {
    id: 'ruler',
    name: 'Regente',
    traditions: ['kabbalah', 'ifa', 'candomble', 'tarot', 'astrology', 'numerology'],
    energy_signature: 'autoridade, estrutura, liderança',
    manifestations: {
      kabbalah: 'Malchut - Realeza',
      ifa: 'Owonrin - Leadership and authority',
      candomble: 'Oxala - Peace, fatherhood, authority',
      tarot: 'O Imperador - Autoridade e estrutura',
      astrology: 'Sol - Liderança e propósito',
      numerology: '1 - Liderança, individualidade, iniciativa',
    },
    growth_areas: ['controle', 'rigidez', 'medo de perder poder'],
  },
];

// ============================================================
// TRADITION MAPPING HELPERS
// ============================================================

const TRADITION_WEIGHTS: Record<string, number> = {
  kabbalah: 3,
  ifa: 3,
  candomble: 3,
  tarot: 2,
  astrology: 2,
  numerology: 1,
};

function calculateTraditionAffinity(
  userData: UserSpiritualData
): Record<string, number> {
  const affinities: Record<string, number> = {
    kabbalah: 0,
    ifa: 0,
    candomble: 0,
    tarot: 0,
    astrology: 0,
    numerology: 0,
  };

  if (userData.numeroPessoal) {
    affinities.numerology += userData.numeroPessoal * 2;
  }

  if (userData.sign) {
    affinities.astrology += 3;
  }
  if (userData.sefirotDominante && userData.sefirotDominante.length > 0) {
    affinities.kabbalah += userData.sefirotDominante.length * 2;
  }
  if (userData.arcoMaior && userData.arcoMaior.length > 0) {
    affinities.kabbalah += userData.arcoMaior.length;
  }

  if (userData.odu) {
    affinities.ifa += 4;
    affinities.candomble += 4;
  }
  if (userData.orixaRegente) {
    affinities.candomble += 5;
  }

  if (userData.arcoPessoal) {
    affinities.tarot += userData.arcoPessoal;
  }

  return affinities;
}

// ============================================================
// NUMEROLOGY ARCHETYPE MAPPING
// ============================================================

const NUMEROLOGY_ARCHETYPE_MAP: Record<number, string[]> = {
  1: ['magician', 'ruler', 'explorer'],
  2: ['creator', 'innocent'],
  3: ['sage', 'lover'],
  4: ['hermit', 'explorer'],
  5: ['transformer', 'explorer'],
  6: ['lover', 'creator'],
  7: ['hermit', 'innocent', 'sage'],
  8: ['hermit', 'ruler'],
  9: ['warrior', 'sage', 'transformer'],
};

// ============================================================
// ASTROLOGY SIGN ARCHETYPE MAPPING
// ============================================================

const ASTROLOGY_SIGN_ARCHETYPE_MAP: Record<string, string[]> = {
  aries: ['warrior', 'explorer'],
  touro: ['creator', 'ruler'],
  gemeos: ['magician', 'explorer'],
  cancer: ['innocent', 'lover'],
  leao: ['ruler', 'creator'],
  virgem: ['hermit', 'magician'],
  libra: ['lover', 'sage'],
  escorpiao: ['transformer', 'magician'],
  sagitario: ['explorer', 'sage'],
  capricornio: ['ruler', 'hermit'],
  aquario: ['magician', 'explorer'],
  peixes: ['sage', 'innocent', 'transformer'],
};

// ============================================================
// TAROT ARC ARCHETYPE MAPPING
// ============================================================

const TAROT_ARC_ARCHETYPE_MAP: Record<number, string[]> = {
  0: ['innocent', 'explorer'],
  1: ['magician'],
  2: ['lover'],
  3: ['sage'],
  4: ['ruler'],
  5: ['hermit'],
  6: ['lover'],
  7: ['explorer'],
  8: ['ruler'],
  9: ['innocent', 'hermit'],
  10: ['transformer', 'ruler'],
  11: ['lover', 'innocent'],
  12: ['sage', 'hermit'],
  13: ['transformer'],
  14: ['creator', 'lover'],
  15: ['warrior', 'transformer'],
  16: ['warrior', 'transformer'],
  17: ['innocent', 'sage'],
  18: ['transformer', 'innocent'],
  19: ['creator'],
  20: ['transformer', 'sage'],
  21: ['ruler', 'magician'],
};

// ============================================================
// TRADITION DESCRIPTIONS, KEYWORDS, SYMBOLS, PRACTICES
// ============================================================

const KABBALAH_DATA: Record<string, { description: string; keywords: string[]; symbols: string[]; practices: string[] }> = {
  warrior: {
    description: 'Chesed representa a energia do amor ativo e compassivo, extendendo misericórdia ao próximo.',
    keywords: ['misericordia', 'amor', 'expansão', 'generosidade'],
    symbols: ['Coluna da Misericordia', 'Triangulo ascendendo'],
    practices: ['Meditação de Chesed', 'Ações de caridade'],
  },
  lover: {
    description: 'Gevurah ensina o uso discernido do poder, canalizando a energia de amor através do julgamento sagrado.',
    keywords: ['julgamento', 'limite', 'força', 'restrição'],
    symbols: ['Coluna do Julgamento', 'Esfera escarlate'],
    practices: ['Restrição sacrificial', 'Ayurveda diets'],
  },
  magician: {
    description: 'Tiferet é o ponto de equilíbrio onde a luz superior se cristaliza em forma-manifestação.',
    keywords: ['beleza', 'harmonia', 'mediador', 'equilíbrio'],
    symbols: ['Hexagrama central', 'Lótus flamejante'],
    practices: ['Retiro em Tiferet', 'Unificação de opostos'],
  },
  hermit: {
    description: 'Biná manifesta a sabedoria primordial que surge da escuridão Fertile e iluminação.',
    keywords: ['sabedoria', 'intuição', 'separação', 'juizo'],
    symbols: ['Lâmpada de Biná', 'Foice de intelectual'],
    practices: ['Noite de Biná', 'Estudo de Sepher Yetzirah'],
  },
  sage: {
    description: 'Daat conecta todos os sefirot, representando o conhecimento oculto da tradição.',
    keywords: ['conhecimento', 'verdade', 'oculto', 'mistico'],
    symbols: ['Livro oculto', 'Olho de Providence'],
    practices: ['Via meditationis', 'Estudo de Kabbalah'],
  },
  transformer: {
    description: 'Yesod é a base de toda a realidade materialize, onde a imaginação cria o mundo.',
    keywords: ['fundação', 'imaginação', 'profecia', 'sonho'],
    symbols: ['Círculo de Yesod', 'Formas hexagonais'],
    practices: ['Visualização de Yesod', 'Trabalho com sonho'],
  },
  creator: {
    description: 'Malkut é a realezamundana, onde a energia divina se torna tangível.',
    keywords: ['realeza', 'manifestação', 'presença', 'divindade'],
    symbols: ['Palacio_real', 'Trono'],
    practices: ['Reinos de Malkut', 'Rituais de manifestação'],
  },
  innocent: {
    description: 'Keter é a coroa da consciência pura, antes da divisão sujeito-objeto.',
    keywords: ['coroa', 'pureza', 'vontade', 'propósito'],
    symbols: ['Coroa de luz', 'Halo solar'],
    practices: ['Devoção de Keter', 'Oração pura'],
  },
  explorer: {
    description: 'Hesed é a expansão infinita da graça que preceda toda forma.',
    keywords: ['bondade', 'graça', 'expansão', 'luz'],
    symbols: ['Cálice derramando', 'Árvore em flor'],
    practices: ['Gemilut Hasadim', 'Expansão de consciência'],
  },
  ruler: {
    description: 'Malchut é o reino onde a vontade divina se expressa através da autoridade.',
    keywords: ['autoridade', 'liderança', 'estrutura', 'ordem'],
    symbols: ['Trono de marfim', 'Cetro_real'],
    practices: ['Hierarquia celestial', 'Ordem ritual'],
  },
};

const IFA_DATA: Record<string, { description: string; keywords: string[]; symbols: string[]; practices: string[] }> = {
  warrior: {
    description: 'Ogbe representa o poder masculino da criação e a força vital que inicia todo movimento.',
    keywords: ['poder', 'força', 'iniciação', 'Ogbe'],
    symbols: ['Ikin', 'Opone', 'Ojub'],
    practices: ['Ebo de Ogbe', 'initiation rites'],
  },
  lover: {
    description: 'Oxum simboliza a essência do amor, da fertilidade e das águas doces que nutrem a vida.',
    keywords: ['amor', 'fertilidade', 'Oxum', 'água doce'],
    symbols: ['espelho', 'pente', 'ouro'],
    practices: ['Oferecimentos a Oxum', 'water rituals'],
  },
  magician: {
    description: 'Oxumar carrega o mistério da abundância e da sabedoria serpentina ancestral.',
    keywords: ['abundancia', 'serpente', 'oxumar', 'misterio'],
    symbols: ['serpente', 'ouro', 'maraca'],
    practices: ['Oxumar ceremonies', 'wealth rituals'],
  },
  hermit: {
    description: 'Ori é a consciência individual que busca seu destino através da intuição mais profunda.',
    keywords: ['Ori', 'cabeça', 'destino', 'intuição'],
    symbols: ['cabeça', 'coroa', 'Opa'],
    practices: ['Ori workings', 'head ceremonies'],
  },
  sage: {
    description: 'Owonrin traz a sabedoria dos anciões e o conhecimento dos mistérios do universo.',
    keywords: ['Owonrin', 'ancião', 'sabedoria', 'mistro'],
    symbols: ['livro de Ifá', 'palm wine', 'Eshu'],
    practices: ['Ifá divination', 'study of Odu'],
  },
  transformer: {
    description: 'Ose representa a força espiritual que transforma obstáculos em oportunidades.',
    keywords: ['Ose', 'transformação', 'espírito', 'força'],
    symbols: ['Ose', 'mysterious marks', 'fire'],
    practices: ['Ose rituals', 'spiritual cleansing'],
  },
  creator: {
    description: 'Irosun Manifesta a energia criativa que traz filhos e prosperidade.',
    keywords: ['Irosun', 'filhos', 'criatividade', 'prosperidade'],
    symbols: ['crianças', 'colares', 'dolls'],
    practices: ['Child dedication', 'fertility rites'],
  },
  innocent: {
    description: 'Odi oferece proteção e cura através da pureza do coração.',
    keywords: ['Odi', 'cura', 'proteção', 'inocência'],
    symbols: ['folhas', 'cabaça', 'limpeza'],
    practices: ['Healing offerings', 'purification'],
  },
  explorer: {
    description: 'Ofun abre os caminhos da jornada e protege o viajante.',
    keywords: ['Ofun', 'jornada', 'caminho', 'viajem'],
    symbols: ['road', 'travel items', 'staff'],
    practices: ['Travel protection', 'road rituals'],
  },
  ruler: {
    description: 'Owonrin também governa a autoridade e o comando sobre os elementos.',
    keywords: ['Owonrin', 'autoridade', 'comando', 'lider'],
    symbols: ['staff of office', 'crown', 'Eshu'],
    practices: ['Leadership ceremonies', 'authority rites'],
  },
};

const CANDOMBLE_DATA: Record<string, { description: string; keywords: string[]; symbols: string[]; practices: string[] }> = {
  warrior: {
    description: 'Ogun é o orixá do ferro, dos guerreiros e da justiça, senhor de todos os metais e ferramentas.',
    keywords: ['ferro', 'guerreiro', 'Ogun', 'metal'],
    symbols: ['ferro', 'facão', 'engrenagem'],
    practices: ['Feitura de Ogun', 'ritual de ferro'],
  },
  lover: {
    description: 'Oxum é a deusa do amor, da beleza e das águas doces, representando a essência feminina.',
    keywords: ['amor', 'beleza', 'Oxum', 'água doce'],
    symbols: ['espelho', 'pente', 'ouro'],
    practices: ['Oferecimentos a Oxum', 'banho de Oxum'],
  },
  magician: {
    description: 'Oxumare é a serpente cósmica que guarda os mistérios da transformação e da eternidade.',
    keywords: ['serpente', 'eternidade', 'Oxumare', 'mistério'],
    symbols: ['serpente', 'ouro', 'maraca'],
    practices: ['Rituais de Oxumare', 'serpent ceremonies'],
  },
  hermit: {
    description: 'Orunmilá é o guardião da sabedoria e do destino, o orixá que conhece os segredos do Ifá.',
    keywords: ['sabedoria', 'destino', 'Orunmilá', 'Ifá'],
    symbols: ['cabeça', 'coroa', 'pá'],
    practices: ['Consultas de Ifá', 'Cerimônias de Orunmilá'],
  },
  sage: {
    description: 'Exu é o mensageiro dos caminhos, o orixá da comunicação e dos cruzamentos.',
    keywords: ['mensagem', 'cruzamento', 'Exu', 'comunicação'],
    symbols: ['rueda', 'cruz', 'pomba'],
    practices: ['Rituais de Exu', 'comunicação ritual'],
  },
  transformer: {
    description: 'Shakpana é o orixá das doenças e transformações, que traz renovação através do sofrimento.',
    keywords: ['doença', 'transformação', 'Shakpana', 'renovação'],
    symbols: ['cobre', 'ferro', 'espanta'],
    practices: ['ebo de Shakpana', 'cura de doenças'],
  },
  creator: {
    description: 'Iemanja é a mãe do mar, dos peixes e de todos os seres aquatic, fonte de vida e nutrição.',
    keywords: ['mar', 'maternidade', 'Iemanja', 'criação'],
    symbols: ['estrela', 'mar', 'azulejo'],
    practices: ['Rituais de Iemanja', 'oferecimentos ao mau00'],
  },
  innocent: {
    description: 'Omulu é o jovem orixá da doença e da cura, que protege contra pestes e pragas.',
    keywords: ['doença', 'cura', 'Omulu', 'proteção'],
    symbols: ['máscara', 'barrete', 'pano'],
    practices: ['Proteção de Omulu', 'limpeza de doenças'],
  },
  explorer: {
    description: 'Oxosse é o caçador do mato, senhor das matas e da liberdade selvagem.',
    keywords: ['caça', 'mato', 'Oxosse', 'liberdade'],
    symbols: ['arco', 'flecha', 'folhas'],
    practices: ['Rituais de Oxosse', 'caça ritual'],
  },
  ruler: {
    description: 'Oxalá é o pai da paz, o mais velho dos orixás, senhor da criação e da ordem.',
    keywords: ['paz', 'paternidade', 'Oxalá', 'ordem'],
    symbols: ['bastão', 'turbante', 'marfim'],
    practices: ['Rituais de Oxalá', 'paz e ordem'],
  },
};

const TAROT_DATA: Record<string, { description: string; keywords: string[]; symbols: string[]; practices: string[] }> = {
  warrior: {
    description: 'A Torre representa a destruição das estruturas falsas para dar lugar a uma renovação heroica.',
    keywords: ['transformação', 'destruição', 'renovação', 'choque'],
    symbols: ['torre', 'raio', 'coroa', 'fogo'],
    practices: ['Meditação na Torre', 'Ritual de soltura'],
  },
  lover: {
    description: 'Os Enamorados simboliza a união das dualidades e a escolha consciente entre caminhos.',
    keywords: ['escolha', 'união', 'dualidade', 'amor'],
    symbols: ['anjo', 'homem', 'mulher', 'árvore'],
    practices: ['Escolha consciente', 'Unificação de opostos'],
  },
  magician: {
    description: 'O Mago é o simbolo da manifestação através do uso consciente de recursos e habilidades.',
    keywords: ['manifestação', 'poder', 'recurso', 'habilidade'],
    symbols: ['mesa', 'taça', 'espada', 'pentalfa'],
    practices: ['Manifestação criativa', 'Trabalho com recursos'],
  },
  hermit: {
    description: 'O Eremita representa a busca interior, a solitude necessária para a iluminação.',
    keywords: ['busca', 'interior', 'solitude', 'iluminação'],
    symbols: ['lanterna', 'figura encapuzada', 'cajado'],
    practices: ['Retiro em silêncio', 'Auto-observação'],
  },
  sage: {
    description: 'O Louco carrega a sabedoria da天真 e a verdade que transcende a lógica convencional.',
    keywords: ['pureza', 'verdade', 'spontaneidade', 'inocência'],
    symbols: ['figure', 'cliffs', 'sun', 'path'],
    practices: ['Prática do Louco', 'Confiança no universo'],
  },
  transformer: {
    description: 'A Morte não é destruição, mas a transformação inevitável que precede o renascimento.',
    keywords: ['morte', 'renascimento', 'transformação', 'mudança'],
    symbols: ['esqueleto', 'rei morto', 'ceoeiro', 'Lua'],
    practices: ['Ritual de morte e renascimento', 'Desapego'],
  },
  creator: {
    description: 'A Imperatriz simboliza a fertilidade criativa, a natureza abundante e a expressão artística.',
    keywords: ['fertilidade', 'natureza', 'abundância', 'arte'],
    symbols: ['fig tree', 'heart', 'shield', 'vineyard'],
    practices: ['Criação artística', 'Conexão com natureza'],
  },
  innocent: {
    description: 'O Louco na sua essência mais pura representa a confiança absoluta no universo.',
    keywords: ['confiança', 'novo', 'início', 'liberdade'],
    symbols: ['bag', 'dog', 'cliffs', 'sun'],
    practices: ['Confiança plena', 'Entrega ao fluxo'],
  },
  explorer: {
    description: 'A Roda da Fortuna indica os ciclos da vida e a necessidade de fluir com as mudanças.',
    keywords: ['ciclo', 'destino', 'mudança', 'sorte'],
    symbols: ['roda', 'esfinge', 'serpente', 'destino'],
    practices: ['Aceitação dos ciclos', 'Fluidez com mudanças'],
  },
  ruler: {
    description: 'O Imperador representa a autoridade, a disciplina e a capacidade de criar ordem.',
    keywords: ['autoridade', 'estrutura', 'disciplina', 'liderança'],
    symbols: ['tetra', 'arma', 'coroa', 'águia'],
    practices: ['Estruturação pessoal', 'Disciplina consciente'],
  },
};

const ASTROLOGY_DATA: Record<string, { description: string; keywords: string[]; symbols: string[]; practices: string[] }> = {
  warrior: {
    description: 'Marte representa a energia de ação, competição e determinação que impulsa a vontade.',
    keywords: ['ação', 'competição', 'determinação', 'vontade'],
    symbols: ['♂', 'carneiro', 'espada', 'escudo'],
    practices: ['Exercício de vontade', 'Competição honrada'],
  },
  lover: {
    description: 'Vênus expressa a energia do amor, da harmonia e da appreciação estética e sensual.',
    keywords: ['amor', 'harmonia', 'beleza', 'arte'],
    symbols: ['♀', 'touro', 'balança', 'coração'],
    practices: ['Arte e estética', 'Rituais de amor'],
  },
  magician: {
    description: 'Mercúrio é o mensageiro mental que governa a comunicação, a magia e a adaptabilidade.',
    keywords: ['comunicação', 'mental', 'adaptabilidade', 'curiosidade'],
    symbols: ['☿', 'gêmeos', 'virgem', 'asas'],
    practices: ['Estudo mental', 'Comunicação criativa'],
  },
  hermit: {
    description: 'Saturno ensina através de limites, karma e a sabedoria que vem com a paciência.',
    keywords: ['limite', 'karma', 'maturidade', 'sabedoria'],
    symbols: ['♄', 'capricornio', 'carrasco', 'tempo'],
    practices: ['Rituais de Saturno', 'Trabalho com limites'],
  },
  sage: {
    description: 'Júpiter expande a consciência através da filosofia, espiritualidade e optimism.',
    keywords: ['expansão', 'filosofia', 'espiritualidade', 'otimismo'],
    symbols: ['♃', 'sagitário', 'peixe', 'expansão'],
    practices: ['Expansão de consciência', 'Filosofia de vida'],
  },
  transformer: {
    description: 'Plutão é o agente da transformação radical, regeneração e poder oculto.',
    keywords: ['transformação', 'regeneração', 'poder', 'oculto'],
    symbols: ['♇', 'escorpião', 'fogo', 'regeneração'],
    practices: ['Trabalho com Plutão', 'Rituais de regeneração'],
  },
  creator: {
    description: 'Sol é a luz do ego, o propósito de vida e a vitalidade criativa individual.',
    keywords: ['identidade', 'propósito', 'vitalidade', 'criatividade'],
    symbols: ['☉', 'leão', 'rei', 'luz'],
    practices: ['Expressão criativa', ' autoconhecimento'],
  },
  innocent: {
    description: 'Lua nurture o emocional, o intuitivo e a necessidade de segurança e lar.',
    keywords: ['emoção', 'intuição', 'lar', 'nutrição'],
    symbols: ['☽', 'câncer', 'taça', 'lua'],
    practices: ['Auto-cuidado', 'Rituais lunares'],
  },
  explorer: {
    description: 'Urano quebra convenções com inovação, liberdade e revelações súbitas.',
    keywords: ['inovação', 'liberdade', 'originalidade', 'revelação'],
    symbols: ['♅', 'aquário', 'relâmpago', 'novidade'],
    practices: ['Inovação pessoal', 'Abertura a mudanças'],
  },
  ruler: {
    description: 'Sol também representa o brilho real e a liderança que vem com o autoconhecimento.',
    keywords: ['liderança', 'autoridade', 'realização', 'poder'],
    symbols: ['☉', 'leão', 'coroa', 'trono'],
    practices: ['Liderança autêntica', 'Realização de propósito'],
  },
};

const NUMEROLOGY_DATA: Record<string, { description: string; keywords: string[]; symbols: string[]; practices: string[] }> = {
  warrior: {
    description: 'O 9 representa o guerreiro espiritual que completou sua jornada e retornou para servir.',
    keywords: ['força mental', 'completude', 'serviço', 'sabedoria'],
    symbols: ['estrella de 9 puntas', 'no cíclico'],
    practices: ['Serviço altruísta', 'Mentoramento'],
  },
  lover: {
    description: 'O 6 é o harmonizador que cria equilíbrio entre o individual e o coletivo através do amor.',
    keywords: ['harmonia', 'família', 'responsabilidade', 'beleza'],
    symbols: ['hexágono', 'coração', 'balança'],
    practices: ['Rituais domésticos', 'Cuidado familiar'],
  },
  magician: {
    description: 'O 1 é o criador individual que manifesta através da vontade e da determinação.',
    keywords: ['liderança', 'iniciativa', 'inovação', 'vontade'],
    symbols: ['círculo', 'ponto central', 'unidade'],
    practices: ['Exercício de vontade', 'Iniciação de projetos'],
  },
  hermit: {
    description: 'O 8 é o mago do mundo material que compreende as leis da energia e da abundância.',
    keywords: ['abundância', 'poder', 'autoride', 'realização'],
    symbols: ['infinito', 'serpent', 'loop'],
    practices: ['Trabalho com dinheiro', 'Entendimento do poder'],
  },
  sage: {
    description: 'O 3 é o professor espiritual que expressa através da comunicação e da criatividade.',
    keywords: ['expressão', 'comunicação', 'criatividade', 'alegria'],
    symbols: ['triángulo', 'comunicación', 'flor'],
    practices: ['Expressão criativa', 'Ensino e compartilhamento'],
  },
  transformer: {
    description: 'O 5 é o transformador que abraça a mudança e ensina a liberdade através da adaptação.',
    keywords: ['mudança', 'liberdade', 'adaptabilidade', 'experiência'],
    symbols: ['pentagrama',  'liberación', 'cambio'],
    practices: ['Abraçar mudanças', 'Prática da liberdade'],
  },
  creator: {
    description: 'O 2 é o parceiro divino que manifesta através da sensibilidade e da cooperação.',
    keywords: ['parceria', 'sensibilidade', 'diplomacia', 'cooperação'],
    symbols: ['par', 'dualidad', 'unión'],
    practices: ['Cooperação', 'trabalho em equipe'],
  },
  innocent: {
    description: 'O 7 é o buscador espiritual que se retira do mundo para encontrar a verdade interior.',
    keywords: ['espiritualidade', 'introspecção', 'perfeicção', 'sabedoria'],
    symbols: ['loto', 'espada', 'búsqueda'],
    practices: ['Retiro espiritual', 'Meditação profunda'],
  },
  explorer: {
    description: 'O 4 é o construtor que estabelece fundamentos sólidos para a expressão criativa.',
    keywords: ['estabilidade', 'fundamento', 'trabalho', 'dedicação'],
    symbols: ['cuadrado', 'fundamento', 'estructura'],
    practices: ['Construção de fundamentos', 'Disciplina'],
  },
  ruler: {
    description: 'O 1 também representa o líder que inicia novos ciclos e comandas com visão.',
    keywords: ['liderança', 'individualidade', 'iniciativa', 'independência'],
    symbols: ['corona', 'sol',  'lider'],
    practices: ['Liderança autêntica', 'Iniciativa pessoal'],
  },
};

// ============================================================
// ARCHETYPE CONFLICT/SYNERGY MAPPING
// ============================================================

const ARCHETYPE_CONFLICTS: Record<string, string[]> = {
  warrior: ['hermit', 'innocent'],
  lover: ['warrior', 'explorer'],
  magician: ['ruler', 'hermit'],
  hermit: ['explorer', 'ruler'],
  sage: ['ruler', 'creator'],
  transformer: ['innocent', 'ruler'],
  creator: ['sage', 'hermit'],
  innocent: ['warrior', 'transformer'],
  explorer: ['hermit', 'ruler'],
  ruler: ['magician', 'explorer'],
};

const ARCHETYPE_ENERGIES: Record<string, string[]> = {
  warrior: ['ação', 'força', 'competição', 'determinação'],
  lover: ['amor', 'harmonia', 'beleza', 'relacionamento'],
  magician: ['manifestação', 'mental', 'recurso', 'habilidade'],
  hermit: ['interior', 'sabedoria', 'limite', 'paciência'],
  sage: ['expansão', 'conhecimento', 'filosofia', 'comunicação'],
  transformer: ['mudança', 'renovação', 'regeneração', 'transição'],
  creator: ['fertilidade', 'natureza', 'expressão', 'nutrição'],
  innocent: ['pureza', 'confiança', 'espontaneidade', 'novidade'],
  explorer: ['liberdade', 'aventura', 'descoberta', 'inovação'],
  ruler: ['autoridade', 'estrutura', 'liderança', 'organização'],
};

// ============================================================
// PATTERN RECOGNIZER CLASS
// ============================================================

export class PatternRecognizer {
  private archetypes = ARCHETYPE_DATABASE;

  /**
   * Recognize dominant archetype patterns from user spiritual data
   */
  recognizeArchetypePatterns(userData: UserSpiritualData): ArchetypePattern[] {
    const affinities = calculateTraditionAffinity(userData);
    const scores: Array<{ pattern: ArchetypePattern; score: number }> = [];

    for (const archetype of this.archetypes) {
      let score = 0;

      for (const tradition of archetype.traditions) {
        if (affinities[tradition]) {
          score += affinities[tradition] * (TRADITION_WEIGHTS[tradition] || 1);
        }
      }

      const manifestations = archetype.manifestations;

      if (manifestations.numerology && userData.numeroPessoal) {
        const numMatch = this.matchNumerologyArchetype(
          userData.numeroPessoal,
          archetype.id
        );
        score += numMatch * 3;
      }

      if (manifestations.astrology && userData.sign) {
        const astroMatch = this.matchAstrologyArchetype(
          userData.sign,
          archetype.id
        );
        score += astroMatch * 2;
      }

      if (manifestations.ifa && userData.odu) {
        score += 2;
      }

      if (manifestations.candomble && userData.orixaRegente) {
        score += 3;
      }

      if (manifestations.kabbalah && userData.sefirotDominante?.length) {
        score += Math.min(userData.sefirotDominante.length, 5);
      }

      if (manifestations.tarot && userData.arcoPessoal) {
        const tarotMatch = this.matchTarotArchetype(
          userData.arcoPessoal,
          archetype.id
        );
        score += tarotMatch * 2;
      }

      scores.push({ pattern: archetype, score });
    }

    scores.sort((a, b) => b.score - a.score);

    return scores
      .filter((s) => s.score > 5)
      .slice(0, 3)
      .map((s) => s.pattern);
  }

  private matchNumerologyArchetype(numero: number, archetypeId: string): number {
    const archetypes = NUMEROLOGY_ARCHETYPE_MAP[numero] || [];
    return archetypes.includes(archetypeId) ? 1 : 0;
  }

  private matchAstrologyArchetype(sign: string, archetypeId: string): number {
    const normalizedSign = sign.toLowerCase();
    const archetypes = ASTROLOGY_SIGN_ARCHETYPE_MAP[normalizedSign] || [];
    return archetypes.includes(archetypeId) ? 1 : 0;
  }

  private matchTarotArchetype(arcoPessoal: number, archetypeId: string): number {
    const archetypes = TAROT_ARC_ARCHETYPE_MAP[arcoPessoal] || [];
    return archetypes.includes(archetypeId) ? 1 : 0;
  }

  /**
   * Find archetype manifestations across traditions
   */
  findArchetypeManifestations(archetypeId: string): ArchetypeManifestation[] {
    const archetype = this.archetypes.find((a) => a.id === archetypeId);
    if (!archetype) {
      return [];
    }

    const manifestations: ArchetypeManifestation[] = [];
    const m = archetype.manifestations;

    if (m.kabbalah) {
      const data = KABBALAH_DATA[archetypeId];
      if (data) {
        manifestations.push({
          tradition: 'kabbalah',
          name: m.kabbalah,
          description: data.description,
          keywords: data.keywords,
          symbols: data.symbols,
          practices: data.practices,
        });
      }
    }

    if (m.ifa) {
      const data = IFA_DATA[archetypeId];
      if (data) {
        manifestations.push({
          tradition: 'ifa',
          name: m.ifa,
          description: data.description,
          keywords: data.keywords,
          symbols: data.symbols,
          practices: data.practices,
        });
      }
    }

    if (m.candomble) {
      const data = CANDOMBLE_DATA[archetypeId];
      if (data) {
        manifestations.push({
          tradition: 'candomble',
          name: m.candomble,
          description: data.description,
          keywords: data.keywords,
          symbols: data.symbols,
          practices: data.practices,
        });
      }
    }

    if (m.tarot) {
      const data = TAROT_DATA[archetypeId];
      if (data) {
        manifestations.push({
          tradition: 'tarot',
          name: m.tarot,
          description: data.description,
          keywords: data.keywords,
          symbols: data.symbols,
          practices: data.practices,
        });
      }
    }

    if (m.astrology) {
      const data = ASTROLOGY_DATA[archetypeId];
      if (data) {
        manifestations.push({
          tradition: 'astrology',
          name: m.astrology,
          description: data.description,
          keywords: data.keywords,
          symbols: data.symbols,
          practices: data.practices,
        });
      }
    }

    if (m.numerology) {
      const data = NUMEROLOGY_DATA[archetypeId];
      if (data) {
        manifestations.push({
          tradition: 'numerology',
          name: m.numerology,
          description: data.description,
          keywords: data.keywords,
          symbols: data.symbols,
          practices: data.practices,
        });
      }
    }

    return manifestations;
  }

  /**
   * Calculate harmony score between archetypes (0-100)
   */
  calculateArchetypeHarmony(patterns: ArchetypePattern[]): number {
    if (patterns.length <= 1) {
      return 100;
    }

    let harmonyScore = 100;
    const archetypeIds = patterns.map((p) => p.id);

    for (let i = 0; i < archetypeIds.length; i++) {
      for (let j = i + 1; j < archetypeIds.length; j++) {
        const conflicts = ARCHETYPE_CONFLICTS[archetypeIds[i]] || [];
        if (conflicts.includes(archetypeIds[j])) {
          harmonyScore -= 15;
        }

        const energiesA = ARCHETYPE_ENERGIES[archetypeIds[i]] || [];
        const energiesB = ARCHETYPE_ENERGIES[archetypeIds[j]] || [];
        const overlap = energiesA.filter((e) => energiesB.includes(e)).length;
        if (overlap >= 2) {
          harmonyScore += 5;
        }
      }
    }

    return Math.max(0, Math.min(100, harmonyScore));
  }

  /**
   * Generate AI-powered archetype insights using Minimax
   */
  async generateArchetypeInsights(pattern: ArchetypePattern): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content:
          'Você é um guia espiritual especializado em análise arquetípica. Analise o arquétipo apresentado e forneça insights profundos sobre sua energia e manifestações.',
      },
      {
        role: 'user',
        content:
          `Analise este arquétipo e forneça insights sobre sua energia:

Arquétipo: ${pattern.name}
ID: ${pattern.id}
Energia: ${pattern.energy_signature}

Manifestações por tradição:
${Object.entries(pattern.manifestations)
  .map(([tradition, name]) => `- ${tradition}: ${name}`)
  .join('\n')}

Áreas de crescimento: ${pattern.growth_areas.join(', ')}

Forneça:
1. Uma interpretação profunda da energia deste arquétipo
2. Como integrar suas manifestações positivas
3. Como trabalhar com suas sombras
4. Uma prática espiritual recomendada para alinhamento
5. Uma affirmations para ativação
`,
      },
    ];

    try {
      const response = await generateMinimaxResponse(messages, {
        temperature: 0.8,
        max_tokens: 1500,
      });
      return response.content;
    } catch (error) {
      console.error('Error generating archetype insights:', error);
      throw error;
    }
  }

  detectPatterns(userData: UserSpiritualData): DetectedPattern[] {
    const patterns: DetectedPattern[] = [];
    patterns.push(...PATTERN_DETECTION.recurringNumber(userData));
    patterns.push(...PATTERN_DETECTION.elementalImbalance(userData));
    patterns.push(...PATTERN_DETECTION.karmicTheme(userData));
    patterns.push(...PATTERN_DETECTION.spiritualBlock(userData));
    return patterns.sort((a, b) => {
      const urgencyOrder = { high: 0, medium: 1, low: 2 };
      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    });
  }
}



// ============================================================
// DETECTED PATTERN TYPES
// ============================================================

export interface DetectedPattern {
  patternType: 'recurring_number' | 'elemental_imbalance' | 'karmic_theme' | 'spiritual_block';
  systems: string[];
  description: string;
  recommendation: string;
  urgency: 'low' | 'medium' | 'high';
}

// Odu to Tarot correspondence
const ODU_TAROT_CORRESPONDENCE: Record<string, number[]> = {
  'Ogbe': [0], 'Oyeku': [1], 'Iwori': [2], 'Odi': [3],
  'Irosun': [4], 'Oxossi': [5], 'Obatala': [6], 'Ogun': [7],
  'Ogunda': [8], 'Osa': [9], 'Ofun': [10], 'Oni': [11],
  'Meji': [12], 'Ika': [13], 'Ikate': [14], 'Ikite': [15],
};

// Pattern detection functions
const PATTERN_DETECTION = {
  recurringNumber: (userData: UserSpiritualData) => {
    const patterns: DetectedPattern[] = [];
    if (userData.numeroPessoal) {
      const matchingCards = [];
      for (const [odu, arcana] of Object.entries(ODU_TAROT_CORRESPONDENCE)) {
        if (arcana.includes(userData.numeroPessoal)) {
          matchingCards.push(...arcana.filter(n => n === userData.numeroPessoal));
        }
      }
      if (matchingCards.length > 0) {
        patterns.push({
          patternType: 'recurring_number',
          systems: ['numerology', 'tarot'],
          description: `Seu número pessoal ${userData.numeroPessoal} ressoa com ${matchingCards.length} Arcanos. Este número carrega significado múltiplo em sua jornada.`,
          recommendation: `Medite sobre a energia do número ${userData.numeroPessoal} e como ela se manifesta em sua vida.`,
          urgency: 'medium',
        });
      }
    }
    return patterns;
  },

  elementalImbalance: (userData: UserSpiritualData) => {
    const patterns: DetectedPattern[] = [];
    const elements = [];
    
    if (userData.orixaRegente) {
      const orixaElements: Record<string, string> = {
        'Ogum': 'Fogo', 'Oxum': 'Água', 'Iemanjá': 'Água',
        'Oxossi': 'Ar', 'Obatalá': 'Terra', 'Omulu': 'Terra',
      };
      if (orixaElements[userData.orixaRegente]) {
        elements.push(orixaElements[userData.orixaRegente]);
      }
    }
    
    if (userData.sign) {
      const signElements: Record<string, string> = {
        'Aries': 'Fogo', 'Leo': 'Fogo', 'Sagittarius': 'Fogo',
        'Taurus': 'Terra', 'Virgo': 'Terra', 'Capricorn': 'Terra',
        'Gemini': 'Ar', 'Libra': 'Ar', 'Aquarius': 'Ar',
        'Cancer': 'Água', 'Scorpio': 'Água', 'Pisces': 'Água',
      };
      if (signElements[userData.sign]) {
        elements.push(signElements[userData.sign]);
      }
    }
    const counts: Record<string, number> = {};
    for (const e of elements) {
      counts[e] = (counts[e] || 0) + 1;
    }
    
    const entries = Object.entries(counts);
    if (entries.length >= 2) {
      const dominant = entries.sort((a, b) => b[1] - a[1])[0];
      if (dominant[1] >= 2) {
        const missing = ['Fogo', 'Terra', 'Água', 'Ar'].filter(e => !counts[e]);
        patterns.push({
          patternType: 'elemental_imbalance',
          systems: ['candomble', 'astrology'],
          description: `Energia fortemente focada no elemento ${dominant[0]} (${dominant[1]} manifestações). Elementos ausentes: ${missing.join(', ') || 'todos presentes'}.`,
          recommendation: missing.length > 0 
            ? `Incorporar práticas do elemento ${missing[0]} para harmonização espiritual.`
            : 'Continue equilibrando sua energia através de práticas diversas.',
          urgency: missing.length > 1 ? 'high' : 'medium',
        });
      }
    }
    return patterns;
  },

  karmicTheme: (userData: UserSpiritualData) => {
    const patterns: DetectedPattern[] = [];
    const systems = [];
    
    if (userData.numeroPessoal === 9 || userData.numeroPessoal === 11) {
      systems.push('numerology');
    }
    if (userData.arcoMaior?.includes(10) || userData.arcoMaior?.includes(21)) {
      systems.push('tarot');
    }
    if (userData.odu === 'Ofun' || userData.odu === 'Meji') {
      systems.push('ifa');
    }
    if (userData.sign === 'Scorpio') {
      systems.push('astrology');
    }
    
    if (systems.length >= 2) {
      patterns.push({
        patternType: 'karmic_theme',
        systems,
        description: `Múltiplos indicadores cármicos detectados: ${systems.join(', ')}. Você está em um caminho de evolução espiritual profunda.`,
        recommendation: 'Pratique perdão e gratidão diariamente. Rituais de ancestor podem auxiliar na limpeza cármica.',
        urgency: 'medium',
      });
    }
    return patterns;
  },

  spiritualBlock: (userData: UserSpiritualData) => {
    const patterns: DetectedPattern[] = [];
    const blocks = [];
    
    if (userData.sefirotDominante?.length === 1 && userData.numeroPessoal) {
      blocks.push('kabbalah');
    }
    if (!userData.arcoMaior?.length && userData.numeroPessoal) {
      blocks.push('tarot');
    }
    if (userData.orixaRegente && !userData.odu) {
      blocks.push('ifa');
    }
    
    if (blocks.length >= 2) {
      patterns.push({
        patternType: 'spiritual_block',
        systems: blocks,
        description: `Bloqueios identificados nos sistemas: ${blocks.join(', ')}. Estes gaps limitam sua evolução espiritual completa.`,
        recommendation: 'Estude os sistemas faltantes para integrar completamente sua jornada espiritual.',
        urgency: 'high',
      });
    }
    return patterns;
  }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

export const patternRecognizer = new PatternRecognizer();

export default PatternRecognizer;