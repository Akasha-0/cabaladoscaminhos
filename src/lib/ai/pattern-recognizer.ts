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
      kabbalah: 'Chesed (Keter) - Misericórdia/Dízima',
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

  // Numerology affinity - based on personal number
  if (userData.numeroPessoal) {
    affinities.numerology += userData.numeroPessoal * 2;
  }

  // Astrology affinity - based on sign and houses
  if (userData.sign) {
    affinities.astrology += 3;
  }
  if (userData.houses && Object.keys(userData.houses).length > 0) {
    affinities.astrology += Object.keys(userData.houses).length;
  }
  if (userData.planetPositions && Object.keys(userData.planetPositions).length > 0) {
    affinities.astrology += Object.keys(userData.planetPositions).length;
  }

  // Kabbalah affinity - based on sefirot
  if (userData.sefirotDominante && userData.sefirotDominante.length > 0) {
    affinities.kabbalah += userData.sefirotDominante.length * 2;
  }
  if (userData.arcoMaior && userData.arcoMaior.length > 0) {
    affinities.kabbalah += userData.arcoMaior.length;
  }

  // IFA/Candomblé affinity - based on odu and orixa
  if (userData.odu) {
    affinities.ifa += 4;
    affinities.candomble += 4;
  }
  if (userData.orixaRegente) {
    affinities.candomble += 5;
  }

  // Tarot affinity - based on arco pessoal
  if (userData.arcoPessoal) {
    affinities.tarot += userData.arcoPessoal;
  }

  return affinities;
}

// ============================================================
// PATTERN RECOGNIZER CLASS
// ============================================================

class PatternRecognizer {
  private archetypes = ARCHETYPE_DATABASE;

  /**
   * Recognize dominant archetype patterns from user spiritual data
   */
  recognizeArchetypePatterns(userData: UserSpiritualData): ArchetypePattern[] {
    const affinities = calculateTraditionAffinity(userData);
    const scores: Array<{ pattern: ArchetypePattern; score: number }> = [];

    for (const archetype of this.archetypes) {
      let score = 0;

      // Score based on tradition affinities
      for (const tradition of archetype.traditions) {
        if (affinities[tradition]) {
          score += affinities[tradition] * (TRADITION_WEIGHTS[tradition] || 1);
        }
      }

      // Score based on archetype-specific manifestations matching user data
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

    // Sort by score descending and return top patterns
    scores.sort((a, b) => b.score - a.score);

    // Return top 3 archetypes with significant scores
    return scores
      .filter((s) => s.score > 5)
      .slice(0, 3)
      .map((s) => s.pattern);
  }

  /**
   * Match numerology number to archetype
   */
  private matchNumerologyArchetype(numero: number, archetypeId: string): number {
    const numMap: Record<number, string[]> = {
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

    const archetypes = numMap[numero] || [];
    return archetypes.includes(archetypeId) ? 1 : 0;
  }

  /**
   * Match astrology sign to archetype
   */
  private matchAstrologyArchetype(sign: string, archetypeId: string): number {
    const signMap: Record<string, string[]> = {
      'aries': ['warrior', 'explorer'],
      'touro': ['creator', 'ruler'],
      'gemeos': ['magician', 'explorer'],
      'cancer': ['innocent', 'lover'],
      'leao': ['ruler', 'creator'],
      'virgem': ['hermit', 'magician'],
      'libra': ['lover', 'sage'],
      'escorpiao': ['transformer', 'magician'],
      'sagitario': ['explorer', 'sage'],
      'capricornio': ['ruler', 'hermit'],
      'aquario': ['magician', 'explorer'],
      'peixes': ['sage', 'innocent', 'transformer'],
    };

    const normalizedSign = sign.toLowerCase();
    const archetypes = signMap[normalizedSign] || [];
    return archetypes.includes(archetypeId) ? 1 : 0;
  }

  /**
   * Match tarot card to archetype
   */
  private matchTarotArchetype(arcoPessoal: number, archetypeId: string): number {
    const tarotMap: Record<number, string[]> = {
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

    const archetypes = tarotMap[arcoPessoal] || [];
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
      manifestations.push({
        tradition: 'kabbalah',
        name: m.kabbalah,
        description: this.getKabbalahDescription(archetype.id),
        keywords: this.getKabbalahKeywords(archetype.id),
        symbols: this.getKabbalahSymbols(archetype.id),
        practices: this.getKabbalahPractices(archetype.id),
      });
    }

    if (m.ifa) {
      manifestations.push({
        tradition: 'ifa',
        name: m.ifa,
        description: this.getIfaDescription(archetype.id),
        keywords: this.getIfaKeywords(archetype.id),
        symbols: this.getIfaSymbols(archetype.id),
        practices: this.getIfaPractices(archetype.id),
      });
    }

    if (m.candomble) {
      manifestations.push({
        tradition: 'candomble',
        name: m.candomble,
        description: this.getCandombleDescription(archetype.id),
        keywords: this.getCandombleKeywords(archetype.id),
        symbols: this.getCandombleSymbols(archetype.id),
        practices: this.getCandomblePractices(archetype.id),
      });
    }

    if (m.tarot) {
      manifestations.push({
        tradition: 'tarot',
        name: m.tarot,
        description: this.getTarotDescription(archetype.id),
        keywords: this.getTarotKeywords(archetype.id),
        symbols: this.getTarotSymbols(archetype.id),
        practices: this.getTarotPractices(archetype.id),
      });
    }

    if (m.astrology) {
      manifestations.push({
        tradition: 'astrology',
        name: m.astrology,
        description: this.getAstrologyDescription(archetype.id),
        keywords: this.getAstrologyKeywords(archetype.id),
        symbols: this.getAstrologySymbols(archetype.id),
        practices: this.getAstrologyPractices(archetype.id),
      });
    }

    if (m.numerology) {
      manifestations.push({
        tradition: 'numerology',
        name: m.numerology,
        description: this.getNumerologyDescription(archetype.id),
        keywords: this.getNumerologyKeywords(archetype.id),
        symbols: this.getNumerologySymbols(archetype.id),
        practices: this.getNumerologyPractices(archetype.id),
      });
    }

    return manifestations;
  }

  private getKabbalahDescription(archetypeId: string): string {
    const descriptions: Record<string, string> = {
      warrior: 'Chesed representa a energia do amor ativo e compassivo, extendendo misericórdia ao próximo.',
      lover: 'Gevurah ensina o uso discernido do poder, canalizando a energia de amor através do julgamento sagrado.',
      magician: 'Tiferet é o ponto de equilíbrio onde a luz superior se cristaliza em forma-manifestação.',
      hermit: 'Biná manifesta a sabedoria primordial que surge da escuridão Fertile e iluminação.',
      sage: 'Daat conecta todos os sefirot, representando o conhecimento oculto da tradição.',
      transformer: 'Yesod é a base de toda a realidade materialize, onde a imaginação cria o mundo.',
      creator: 'Malkut é a realezamundana, onde a energia divina se torna tangível.',
      innocent: 'Keter é a coroa da consciência pura, antes da divisão sujeito-objeto.',
      explorer: 'Hesed é a expansão infinita da graça que preceda toda forma.',
      ruler: 'Malchut é o reino onde a vontade divina se expressa através da autoridade.',
    };
    return descriptions[archetypeId] || '';
  }

  private getKabbalahKeywords(archetypeId: string): string[] {
    const keywords: Record<string, string[]> = {
      warrior: ['misericordia', 'amor', 'expansão', 'generosidade'],
      lover: ['julgamento', 'limite', 'força', 'restrição'],
      magician: ['beleza', 'harmonia', 'mediador', 'equilíbrio'],
      hermit: ['sabedoria', 'intuição', 'separação', 'juizo'],
      sage: ['conhecimento', 'verdade', 'oculto', 'mistico'],
      transformer: ['fundação', 'imaginação', 'profecia', 'sonho'],
      creator: ['realeza', 'manifestação', 'presença', 'divindade'],
      innocent: ['coroa', 'pureza', 'vontade', 'propósito'],
      explorer: ['bondade', 'graça', 'expansão', 'luz'],
      ruler: ['autoridade', 'liderança', 'estrutura', 'ordem'],
    };
    return keywords[archetypeId] || [];
  }

  private getKabbalahSymbols(archetypeId: string): string[] {
    const symbols: Record<string, string[]> = {
      warrior: ['Coluna da Misericordia', 'Triangulo ascendendo'],
      lover: ['Coluna do Julgamento', 'Esfera escarlate'],
      magician: ['Hexagrama central', 'Lótus flamejante'],
      hermit: ['Lâmpada de Biná', 'Foice de intelectual'],
      sage: ['Livro oculto', 'Olho de Providence'],
      transformer: ['Círculo de Yesod', 'Formas hexagonais'],
      creator: ['Palacio_real', 'Trono'],
      innocent: ['Coroa de luz', ' Halo solar'],
      explorer: ['Cálice derramando', 'Árvore em flor'],
      ruler: ['Trono de marfim', 'Cetro_real'],
    };
    return symbols[archetypeId] || [];
  }

  private getKabbalahPractices(archetypeId: string): string[] {
    const practices: Record<string, string[]> = {
      warrior: ['Meditação de Chesed', 'Ações de caridade'],
      lover: ['Restrição sacrificial', 'Ayurveda diets'],
      magician: ['Retiro em Tiferet', 'Unificação de opostos'],
      hermit: ['Noite de Biná', 'Estudo de Sepher Yetzirah'],
      sage: ['Via meditationis', 'Estudo de Kabbalah'],
      transformer: ['Visualização de Yesod', 'Trabalho com sonho'],
      creator: ['Reinos de Malkut', 'Rituais de manifestação'],
      innocent: ['Devoção de Keter', 'Oração pura'],
      explorer: ['Gemilut Hasadim', 'Expansão de consciência'],
      ruler: ['Hierarquia celestial', 'Ordem ritual'],
    };
    return practices[archetypeId] || [];
  }

  private getIfaDescription(archetypeId: string): string {
    const descriptions: Record<string, string> = {
      warrior: 'Ogbe representa o poder masculino da criação e a força vital que inicia todo movimento.',
      lover: 'Oxum simboliza a essência do amor, da fertilidade e das águas doces que nutrem a vida.',
      magician: 'Oxumar carrega o mistério da abundância e da sabedoria serpentina ancestral.',
      hermit: 'Ori é a consciência individual que busca seu destino através da intuição mais profunda.',
      sage: 'Owonrin traz a sabedoria dos anciões e o conhecimento dos mistérios do universo.',
      transformer: 'Ose representa a força espiritual que transforma obstáculos em oportunidades.',
      creator: 'Irosun Manifesta a energia criativa que traz filhos e prosperidade.',
      innocent: 'Odi oferece proteção e cura através da pureza do coração.',
      explorer: 'Ofun abre os caminhos da jornada e protege o viajante.',
      ruler: 'Owonrin também governa a autoridade e o comando sobre os elementos.',
    };
    return descriptions[archetypeId] || '';
  }

  private getIfaKeywords(archetypeId: string): string[] {
    const keywords: Record<string, string[]> = {
      warrior: ['poder', 'força', 'iniciação', 'Ogbe'],
      lover: ['amor', 'fertilidade', ' Oxum', 'água doce'],
      magician: ['abundancia', 'serpente', 'oxumar', 'misterio'],
      hermit: ['Ori', 'cabeça', 'destino', 'intuição'],
      sage: ['Owonrin', 'ancião', 'sabedoria', 'mistro'],
      transformer: ['Ose', 'transformação', 'espírito', 'força'],
      creator: ['Irosun', 'filhos', 'criatividade', 'prosperidade'],
      innocent: ['Odi', 'cura', 'proteção', 'inocência'],
      explorer: ['Ofun', 'jornada', 'caminho', 'viajem'],
      ruler: ['Owonrin', 'autoridade', 'comando', 'lider'],
    };
    return keywords[archetypeId] || [];
  }

  private getIfaSymbols(archetypeId: string): string[] {
    const symbols: Record<string, string[]> = {
      warrior: ['Ikin', 'Opone', 'Ojub'],
      lover: ['espelho', 'pente', 'oxum'],
      magician: ['serpente', 'ouro', 'maraca'],
      hermit: ['cabeça', 'coroa', 'Opa'],
      sage: ['livro de Ifá', 'palm wine', 'Eshu'],
      transformer: ['Ose', 'mysterious marks', 'fire'],
      creator: ['crianças', 'colares', 'dolls'],
      innocent: ['folhas', 'cabaça', 'limpeza'],
      explorer: ['road', 'travel items', 'staff'],
      ruler: ['staff of office', 'crown', 'Eshu'],
    };
    return symbols[archetypeId] || [];
  }

  private getIfaPractices(archetypeId: string): string[] {
    const practices: Record<string, string[]> = {
      warrior: ['Ebo de Ogbe', 'initiation rites'],
      lover: ['Offerings to Oxum', 'water rituals'],
      magician: ['Oxumar ceremonies', 'wealth rituals'],
      hermit: ['Ori workings', 'head ceremonies'],
      sage: ['Ifá divination', 'study of Odu'],
      transformer: ['Ose rituals', 'spiritual cleansing'],
      creator: ['Child dedication', 'fertility rites'],
      innocent: ['Healing offerings', 'purification'],
      explorer: ['Travel protection', 'road rituals'],
      ruler: ['Leadership ceremonies', 'authority rites'],
    };
    return practices[archetypeId] || [];
  }

  private getCandombleDescription(archetypeId: string): string {
    const descriptions: Record<string, string> = {
      warrior: 'Ogun é o orixá do ferro, dos guerreiros e da justiça, senhor de todos os metais e ferramentas.',
      lover: 'Oxum é a deusa do amor, da beleza e das águas doces, rappresentando a essência feminina.',
      magician: 'Oxumare é a serpente cósmica que guarda os mistérios da transformação e da eternidade.',
      hermit: 'Orunmilá é o guardião da wisdom e do destino, o orixá que conhece os segredos do Ifá.',
      sage: 'Exu é o mensageiro dos caminhos, o orixá da comunicação e dos cruzamentos.',
      transformer: 'Shakpana é o orixá das doenças e transformações, que traz renovação através do sofrimento.',
      creator: 'Iemanja é a mãe do mar, dos peixes e de todos os seres aquatic, fonte de vida e nutrição.',
      innocent: 'Omulu é o jovem orixá da doença e da cura, que protege contra pestes e pragas.',
      explorer: 'Oxosse é o caçador do mato, senhor das matas e da liberdade selvagem.',
      ruler: 'Oxalá é o pai da paz, o mais velho dos orixás, senhor da criação e da ordem.',
    };
    return descriptions[archetypeId] || '';
  }

  private getCandombleKeywords(archetypeId: string): string[] {
    const keywords: Record<string, string[]> = {
      warrior: ['ferro', 'guerreiro', 'Ogun', 'metal'],
      lover: ['amor', 'beleza', 'Oxum', 'água doce'],
      magician: ['serpente', 'eternidade', 'Oxumare', 'mistério'],
      hermit: ['sabedoria', 'destino', 'Orunmilá', 'Ifá'],
      sage: ['mensagem', 'cruzamento', 'Exu', 'comunicação'],
      transformer: ['doença', 'transformação', 'Shakpana', 'renovação'],
      creator: ['mar', 'maternidade', 'Iemanja', 'criação'],
      innocent: ['doença', 'cura', 'Omulu', 'proteção'],
      explorer: ['caça', 'mato', 'Oxosse', 'liberdade'],
      ruler: ['paz', 'paternidade', 'Oxalá', 'ordem'],
    };
    return keywords[archetypeId] || [];
  }

  private getCandombleSymbols(archetypeId: string): string[] {
    const symbols: Record<string, string[]> = {
      warrior: ['ferro', 'facão', 'engrenagem', 'Ogun'],
      lover: ['espelho', 'pente', 'ouro', 'Oxum'],
      magician: ['serpente', 'ouro', 'maraca', 'Oxumare'],
      hermit: ['cabeça', 'coroa', 'pá', 'Orunmilá'],
      sage: ['rueda', 'cruz', 'Exu', 'pombe'],
      transformer: ['cobre', 'ferro', 'Shakpana', 'espanta'],
      creator: ['estrela', 'mar', 'azulejo', 'Iemanja'],
      innocent: ['máscara', 'barrete', 'Omulu', 'pano'],
      explorer: ['arco', 'flecha', 'Oxosse', 'folhas'],
      ruler: ['bastão', 'turbante', 'Oxalá', 'marfim'],
    };
    return symbols[archetypeId] || [];
  }

  private getCandomblePractices(archetypeId: string): string[] {
    const practices: Record<string, string[]> = {
      warrior: ['Feitura de Ogun', 'ritual de ferro'],
      lover: ['Oferecimentos a Oxum', 'banho de Oxum'],
      magician: ['Rituais de Oxumare', '祭司 serpent'],
      hermit: ['Consultas de Ifá', 'Cerimônias de Orunmilá'],
      sage: ['Rituais de Exu', 'comunikação ritual'],
      transformer: [' ebó de Shakpana', 'cura de doenças'],
      creator: ['Rituais de Iemanja', 'oferecimentos ao mar'],
      innocent: ['Proteção de Omulu', 'limpeza de doenças'],
      explorer: ['Rituais de Oxosse', 'caça ritual'],
      ruler: ['Rituais de Oxalá', 'paz e ordem'],
    };
    return practices[archetypeId] || [];
  }

  private getTarotDescription(archetypeId: string): string {
    const descriptions: Record<string, string> = {
      warrior: 'A Torre representa a destruição das estruturas falsas para dar lugar a uma renovação heroica.',
      lover: 'Os Enamorados simboliza a união das dualidades e a escolha consciente entre caminhos.',
      magician: 'O Mago é o simbolo da manifestação através do uso consciente de recursos e habilidades.',
      hermit: 'O Eremita representa a busca interior, a solitude necessária para a iluminação.',
      sage: 'O Louco carrega a sabedoria do天真 e a verdade que transcende a lógica convencional.',
      transformer: 'A Morte não é destruição, mas a transformação inevitável que precede o renascimento.',
      creator: 'A Imperatriz simboliza a fertilidade criativa, a natureza abundante e a expressão artística.',
      innocent: 'O Louco na sua essência mais pura representa a confiança absoluta no universo.',
      explorer: 'A Roda da Fortuna indica os ciclos da vida e a necessidade de fluir com as mudanças.',
      ruler: 'O Imperador representa a autoridade, a disciplina e a capacidade de criar ordem.',
    };
    return descriptions[archetypeId] || '';
  }

  private getTarotKeywords(archetypeId: string): string[] {
    const keywords: Record<string, string[]> = {
      warrior: ['transformação', 'destruição', 'renovação', 'choque'],
      lover: ['escolha', 'união', 'dualidade', 'amor'],
      magician: ['manifestação', 'poder', 'recurso', 'habilidade'],
      hermit: ['busca', 'interior', 'solitude', 'iluminação'],
      sage: ['pureza', 'verdade', 'spontaneidade', 'inocência'],
      transformer: ['morte', 'renascimento', 'transformação', 'mudança'],
      creator: ['fertilidade', 'natureza', 'abundância', 'arte'],
      innocent: ['confiança', 'novo', 'início', 'liberdade'],
      explorer: ['ciclo', 'destino', 'mudança', 'sorte'],
      ruler: ['autoridade', 'estrutura', 'disciplina', 'liderança'],
    };
    return keywords[archetypeId] || [];
  }

  private getTarotSymbols(archetypeId: string): string[] {
    const symbols: Record<string, string[]> = {
      warrior: ['torre', 'raio', 'coroa', 'fogo'],
      lover: ['anjo', 'homem', 'mulher', 'árvore'],
      magician: ['mesa', 'taça', 'espada', 'pentalfa'],
      hermit: ['lanterna', 'figura encapuzada', ' cajado'],
      sage: ['figure', 'cliffs', 'sun', ' path'],
      transformer: ['esm骨架', 'rei morto', 'ceoeiro', ' Lua'],
      creator: ['fig tree', 'heart', ' shield', 'vineyard'],
      innocent: ['bag', ' dog', 'cliffs', 'sun'],
      explorer: ['roda', 'esfinge', 'serpente', 'destino'],
      ruler: ['tetra', 'arma', 'coroa', 'águia'],
    };
    return symbols[archetypeId] || [];
  }

  private getTarotPractices(archetypeId: string): string[] {
    const practices: Record<string, string[]> = {
      warrior: ['Meditação na Torre', 'Ritual de soltura'],
      lover: ['Escolha consciente', 'Unificação de opostos'],
      magician: ['Manifestação criativa', 'Trabalho com recursos'],
      hermit: ['Retiro em silêncio', 'Auto-observação'],
      sage: ['Prática doLouco', 'Confiança no universo'],
      transformer: ['Ritual de morte e renascimento', 'Desapego'],
      creator: ['Criação artística', 'Conexão com natureza'],
      innocent: ['Confiança plena', 'Entrega ao fluxo'],
      explorer: ['Aceitação dos ciclos', 'Fluidez com mudanças'],
      ruler: ['Estruturação pessoal', 'Disciplina consciente'],
    };
    return practices[archetypeId] || [];
  }

  private getAstrologyDescription(archetypeId: string): string {
    const descriptions: Record<string, string> = {
      warrior: 'Marte representa a energia de ação, competição e determinação que impulsa a vontade.',
      lover: 'Vênus expressa a energia do amor, da harmonia e da apreciação estética e sensual.',
      magician: 'Mercúrio é o mensageiro mental que governa a comunicação, a magia e a adaptabilidade.',
      hermit: 'Saturno ensina através de limites, karma e a sabedoria que vem com a paciência.',
      sage: 'Júpiter expande a consciência através da filosofia, espiritualidade e optimism.',
      transformer: 'Plutão é o agente da transformação radical, regeneração e poder oculto.',
      creator: 'Sol é a luz do ego, o propósito de vida e a vitalidade criativa individual.',
      innocent: 'Lua nurture o emocional, o intuítivo e a necessidade de segurança e lar.',
      explorer: 'Urano quebra convenções com inovação, liberdade e revelações súbitas.',
      ruler: 'Sol também representa o brilho real e a liderança que vem com o autoconhecimento.',
    };
    return descriptions[archetypeId] || '';
  }

  private getAstrologyKeywords(archetypeId: string): string[] {
    const keywords: Record<string, string[]> = {
      warrior: ['ação', 'competição', 'determinação', 'vontade'],
      lover: ['amor', 'harmonia', 'beleza', 'arte'],
      magician: ['comunicação', 'mental', 'adaptabilidade', 'curiosidade'],
      hermit: ['limite', 'karma', 'maturidade', 'sabedoria'],
      sage: ['expansão', 'filosofia', 'espiritualidade', 'otimismo'],
      transformer: ['transformação', 'regeneração', 'poder', 'oculto'],
      creator: ['identidade', 'propósito', 'vitalidade', 'criatividade'],
      innocent: ['emoção', 'intuição', 'lar', 'nutrição'],
      explorer: ['inovação', 'liberdade', 'originalidade', 'revelação'],
      ruler: ['liderança', 'autoridade', 'realização', 'poder'],
    };
    return keywords[archetypeId] || [];
  }

  private getAstrologySymbols(archetypeId: string): string[] {
    const symbols: Record<string, string[]> = {
      warrior: ['♂', 'carneiro', 'espada', 'escudo'],
      lover: ['♀', 'touro', 'balança', 'coração'],
      magician: ['☿', 'gêmeos', 'virgem', 'asas'],
      hermit: ['♄', 'capricornio', 'carrasco', 'tempo'],
      sage: ['♃', 'sagitário', 'peixe', 'expansão'],
      transformer: ['♇', 'escorpião', 'fogo', 'regeneração'],
      creator: ['☉', 'leão', 'rei', 'luz'],
      innocent: ['☽', 'câncer', 'taça', 'lua'],
      explorer: ['♅', 'aquário', 'relâmpago', 'novidade'],
      ruler: ['☉', 'leão', 'coroa', 'trono'],
    };
    return symbols[archetypeId] || [];
  }

  private getAstrologyPractices(archetypeId: string): string[] {
    const practices: Record<string, string[]> = {
      warrior: ['Exercício de vontade', 'Competição honrada'],
      lover: ['Arte e estética', 'Rituais de amor'],
      magician: ['Estudo mental', 'Comunicação criativa'],
      hermit: ['Rituais de saturno', 'Trabalho com limites'],
      sage: ['Expansão de consciência', 'Filosofia de vida'],
      transformer: ['Trabalho com Plutão', 'Rituais de regeneração'],
      creator: ['Expressão criativa', ' autoconhecimento'],
      innocent: ['Auto-cuidado', 'Rituais lunares'],
      explorer: ['Innovação pessoal', 'Abertura a mudanças'],
      ruler: ['Liderança autêntica', 'Realização de propósito'],
    };
    return practices[archetypeId] || [];
  }

  private getNumerologyDescription(archetypeId: string): string {
    const descriptions: Record<string, string> = {
      warrior: 'O 9 representa o guerreiro espiritual que completou sua jornada e retornou para servir.',
      lover: 'O 6 é o harmonizador que cria equilíbrio entre o individual e o coletivo através do amor.',
      magician: 'O 1 é o criador indivdual que manifesta através da vontade e da determinação.',
      hermit: 'O 8 é o mago do mundo material que compreende as leis da energia e da abundância.',
      sage: 'O 3 é o professor espiritual que expressa através da comunicação e da criatividade.',
      transformer: 'O 5 é o transformador que abraça a mudança e ensina a liberdade através da adaptação.',
      creator: 'O 2 é o parceiro divino que manifesta através da sensibilidade e da cooperação.',
      innocent: 'O 7 é o buscador espiritual que se retira do mundo para encontrar a verdade interior.',
      explorer: 'O 4 é o construtor que estabelece fundamentos sólidos para a expressão criativa.',
      ruler: 'O 1 também representa o líder que inicia novos ciclos e comandas com visão.',
    };
    return descriptions[archetypeId] || '';
  }

  private getNumerologyKeywords(archetypeId: string): string[] {
    const keywords: Record<string, string[]> = {
      warrior: ['força mental', 'completude', 'serviço', 'sabedoria'],
      lover: ['harmonia', 'família', 'responsabilidade', 'beleza'],
      magician: ['liderança', 'iniciativa', 'inovação', 'vontade'],
      hermit: ['abundância', 'poder', ' autoride', 'realização'],
      sage: ['expressão', 'comunicação', 'criatividade', 'alegria'],
      transformer: ['mudança', 'liberdade', 'adaptabilidade', 'experiência'],
      creator: ['parceria', 'sensibilidade', 'diplomacia', 'cooperação'],
      innocent: ['espiritualidade', 'introspecção', 'perfeicção', 'sabedoria'],
      explorer: ['estabilidade', 'fundamento', 'trabalho', 'dedicação'],
      ruler: ['liderança', 'individualidade', 'iniciativa', 'independência'],
    };
    return keywords[archetypeId] || [];
  }

  private getNumerologySymbols(archetypeId: string): string[] {
    const symbols: Record<string, string[]> = {
      warrior: ['estrella de 9 puntas', 'no周期的'],
      lover: ['hexágono', 'coraão', 'balança'],
      magician: ['círculo', 'ponto central', 'unidade'],
      hermit: ['infinito', 'serpent', 'loop'],
      sage: ['triángulo', 'comunicación', 'flor'],
      transformer: ['pentagrama', 'liberación', 'cambio'],
      creator: ['par', 'dualidad', 'unión'],
      innocent: ['loto', 'espada', 'búsqueda'],
      explorer: ['cuadrado', 'fundamento', 'estructura'],
      ruler: ['corona', 'sol', 'lider'],
    };
    return symbols[archetypeId] || [];
  }

  private getNumerologyPractices(archetypeId: string): string[] {
    const practices: Record<string, string[]> = {
      warrior: ['Serviço altruísta', 'Mentoramento'],
      lover: ['Rituais domésticos', 'Cuidado familiar'],
      magician: ['Exercício de vontade', 'Iniciação de projetos'],
      hermit: ['Trabalho com dinheiro', 'Entendimento do poder'],
      sage: ['Expressão criativa', 'Ensino e compartilhamento'],
      transformer: ['Abraçar mudanças', 'Prática da liberdade'],
      creator: ['Cooperção', 'trabalho em equipe'],
      innocent: ['Retiro espiritual', 'Meditação profunda'],
      explorer: ['Construção de fundamentos', 'Disciplina'],
      ruler: ['Liderança autêntica', 'Iniciativa pessoal'],
    };
    return practices[archetypeId] || [];
  }

  /**
   * Calculate harmony score between archetypes (0-100)
   */
  calculateArchetypeHarmony(patterns: ArchetypePattern[]): number {
    if (patterns.length <= 1) {
      return 100;
    }

    const archetypeEnergies: Record<string, string[]> = {
      warrior: ['ação', 'força', 'competição', 'determinação'],
      lover: ['amor', 'harmonia', 'beleza', 'relacionamento'],
      magician: ['manifestação', 'mental', 'recurso', 'habilidade'],
      hermit: ['interior', 'sabedoria', 'limite', 'paciência'],
      sage: ['expansão', 'conhecimento', 'filosofia', 'comunicação'],
      transformer: ['mudança', 'renovação', 'regeneração', 'transição'],
      creator: ['fertilidade', 'natureza', 'expressão', 'nutrição'],
      innocent: ['pureza', 'confiança', 'espontaneidade', 'novidade'],
      explorer: ['liberdade', 'aventura', 'descoberta', 'innovação'],
      ruler: ['autoridade', 'estrutura', 'liderança', 'organização'],
    };

    const archetypeConflicts: Record<string, string[]> = {
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

    let harmonyScore = 100;
    const archetypeIds = patterns.map((p) => p.id);

    for (let i = 0; i < archetypeIds.length; i++) {
      for (let j = i + 1; j < archetypeIds.length; j++) {
        const conflicts = archetypeConflicts[archetypeIds[i]] || [];
        if (conflicts.includes(archetypeIds[j])) {
          harmonyScore -= 15;
        }

        // Check energy overlap for synergy bonus
        const energiesA = archetypeEnergies[archetypeIds[i]] || [];
        const energiesB = archetypeEnergies[archetypeIds[j]] || [];
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
        content: `Analise este arquétipo e forneça insights sobre sua energia:

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
}

// ============================================================
// DEFAULT EXPORT
// ============================================================

export const patternRecognizer = new PatternRecognizer();

export default PatternRecognizer;