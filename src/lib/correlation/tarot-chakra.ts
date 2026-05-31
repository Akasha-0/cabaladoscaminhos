/**
 * Tarot-Chakra Spiritual Correlation
 * Maps the 78 cards of the Tarot to Hindu energy centers (chakras)
 * Based on Hermetic/Qabalistic traditions and esoteric correspondences
 */

export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

export type ChakraName =
  | 'Muladhara'
  | 'Svadhisthana'
  | 'Manipura'
  | 'Anahata'
  | 'Vishuddha'
  | 'Ajna'
  | 'Sahasrara';

export type ArcanoType = 'Maior' | 'Menor';

export interface TarotChakraMapping {
  arcano: string;
  arcano_numero: number | null;
  arcano_tipo: ArcanoType;
  chakra: ChakraName;
  chakra_numero: string;
  elemento: Elemento;
  keywords: string[];
  energia_espiritual: string;
}

/**
 * Complete mapping of Tarot arcana to their chakra correspondences.
 * Based on traditional Hermetic/Qabalistic and Yogic correspondences.
 */
export const TAROT_CHAKRA_MAPPINGS: Record<string, TarotChakraMapping> = {
  // ─── Major Arcana (Arcanos Maiores) ─────────────────────────────────────────

  // 0. O Louco (The Fool) - Muladhara - new beginnings, freedom
  'O Louco': {
    arcano: 'O Louco',
    arcano_numero: 0,
    arcano_tipo: 'Maior',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Ar',
    keywords: ['liberdade', 'novo começo', 'inocência', 'aventureiro'],
    energia_espiritual: 'Libertação do medo ancestral e caminhada para o desconhecido com fé',
  },

  // I. O Mago (The Magician) - Manipura - will, power
  'O Mago': {
    arcano: 'O Mago',
    arcano_numero: 1,
    arcano_tipo: 'Maior',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Água',
    keywords: ['vontade', 'poder', 'habilidade', 'manifestação'],
    energia_espiritual: 'Ativação do poder pessoal e domínio das forças elementais',
  },

  // II. A Sacerdotisa (The High Priestess) - Svadhisthana - intuition, mysteries
  'A Sacerdotisa': {
    arcano: 'A Sacerdotisa',
    arcano_numero: 2,
    arcano_tipo: 'Maior',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'Água',
    keywords: ['intuição', 'mistérios', 'sabedoria interior', 'lua'],
    energia_espiritual: 'Despertar da sabedoria intuitiva e conexão com o divino feminino',
  },

  // III. A Imperatriz (The Empress) - Anahata - nurturing, abundance
  'A Imperatriz': {
    arcano: 'A Imperatriz',
    arcano_numero: 3,
    arcano_tipo: 'Maior',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Terra',
    keywords: ['abundância', 'nutrição', 'natureza', 'fertilidade'],
    energia_espiritual: 'Fluxo de amor criativo e conexão com a fertilidade universal',
  },

  // IV. O Imperador (The Emperor) - Muladhara - authority, structure
  'O Imperador': {
    arcano: 'O Imperador',
    arcano_numero: 4,
    arcano_tipo: 'Maior',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Fogo',
    keywords: ['autoridade', 'estrutura', 'liderança', 'pai'],
    energia_espiritual: 'Estabelecimento de ordem e liderança através da disciplina',
  },

  // V. O Hierofante (The Hierophant) - Anahata - tradition, spiritual guidance
  'O Hierofante': {
    arcano: 'O Hierofante',
    arcano_numero: 5,
    arcano_tipo: 'Maior',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Terra',
    keywords: ['tradição', 'espiritualidade', 'ritual', 'mentor'],
    energia_espiritual: 'Conexão com a sabedoria tradicional e ensinamentos sagrados',
  },

  // VI. Os Enamorados (The Lovers) - Anahata - love, choices
  'Os Enamorados': {
    arcano: 'Os Enamorados',
    arcano_numero: 6,
    arcano_tipo: 'Maior',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Ar',
    keywords: ['amor', 'escolha', 'união', 'relacionamento'],
    energia_espiritual: 'Maturação do amor e decisões que afetam o destino da alma',
  },

  // VII. O Carro (The Chariot) - Manipura - triumph, willpower
  'O Carro': {
    arcano: 'O Carro',
    arcano_numero: 7,
    arcano_tipo: 'Maior',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Água',
    keywords: ['vitória', 'vontade', 'controle', 'determinação'],
    energia_espiritual: 'Conquista através do uso consciente da vontade e disciplina',
  },

  // VIII. A Força (Strength) - Anahata - courage, inner strength
  'A Força': {
    arcano: 'A Força',
    arcano_numero: 8,
    arcano_tipo: 'Maior',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Fogo',
    keywords: ['coragem', 'força interior', 'compaixão', 'poder'],
    energia_espiritual: 'Domínio da energia vital através da força interior e compaixão',
  },

  // IX. O Eremita (The Hermit) - Ajna - introspection, guidance
  'O Eremita': {
    arcano: 'O Eremita',
    arcano_numero: 9,
    arcano_tipo: 'Maior',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Terra',
    keywords: ['introspecção', 'iluminação', 'solidão', 'sabedoria'],
    energia_espiritual: 'Busca da luz interior e iluminação através da solitude',
  },

  // X. A Roda da Fortuna (Wheel of Fortune) - Sahasrara - cycles, destiny
  'A Roda da Fortuna': {
    arcano: 'A Roda da Fortuna',
    arcano_numero: 10,
    arcano_tipo: 'Maior',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Fogo',
    keywords: ['ciclos', 'destino', 'sorte', 'transformação'],
    energia_espiritual: 'Compreensão dos ciclos cósmicos e aceitação do destino espiritual',
  },

  // XI. A Justiça (Justice) - Vishuddha - truth, law
  'A Justiça': {
    arcano: 'A Justiça',
    arcano_numero: 11,
    arcano_tipo: 'Maior',
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento: 'Ar',
    keywords: ['verdade', 'lei', 'causa e efeito', 'equilíbrio'],
    energia_espiritual: 'Awakciação da lei cósmica e expressão da verdade absoluta',
  },

  // XII. O Enforcado (The Hanged Man) - Svadhisthana - surrender, new perspective
  'O Enforcado': {
    arcano: 'O Enforcado',
    arcano_numero: 12,
    arcano_tipo: 'Maior',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'Água',
    keywords: ['renúncia', 'sacrifício', 'perspectiva', 'luz'],
    energia_espiritual: 'Sacrifício voluntário para nova compreensão espiritual',
  },

  // XIII. A Morte (Death) - Muladhara - transformation, ending
  'A Morte': {
    arcano: 'A Morte',
    arcano_numero: 13,
    arcano_tipo: 'Maior',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Água',
    keywords: ['transformação', 'fim', 'renascimento', 'mudança'],
    energia_espiritual: 'Dissolução do ego e transformação para novo estado de consciência',
  },

  // XIV. A Temperança (Temperance) - Sahasrara - balance, moderation
  'A Temperança': {
    arcano: 'A Temperança',
    arcano_numero: 14,
    arcano_tipo: 'Maior',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Fogo',
    keywords: ['equilíbrio', 'moderação', 'alquimia', 'cura'],
    energia_espiritual: 'Transmutação das energias opostas em harmonia e equilíbrio superior',
  },

  // XV. O Diabo (The Devil) - Muladhara - shadow, material attachment
  'O Diabo': {
    arcano: 'O Diabo',
    arcano_numero: 15,
    arcano_tipo: 'Maior',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Fogo',
    keywords: ['sombra', 'vínculo', 'materialismo', 'prisão'],
    energia_espiritual: 'Enfrentamento das sombras e libertação das correntes do karma',
  },

  // XVI. A Torre (The Tower) - Sahasrara - upheaval, revelation
  'A Torre': {
    arcano: 'A Torre',
    arcano_numero: 16,
    arcano_tipo: 'Maior',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Fogo',
    keywords: ['ruptura', 'revelação', 'libertação', 'choque'],
    energia_espiritual: 'Destruição das ilusões e revelação súbita da verdade divina',
  },

  // XVII. A Estrela (The Star) - Ajna - hope, inspiration
  'A Estrela': {
    arcano: 'A Estrela',
    arcano_numero: 17,
    arcano_tipo: 'Maior',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Ar',
    keywords: ['esperança', 'inspiração', 'luz', 'cura'],
    energia_espiritual: 'Renovação da esperança e conexão com a luz cósmica',
  },

  // XVIII. A Lua (The Moon) - Ajna - illusion, intuition
  'A Lua': {
    arcano: 'A Lua',
    arcano_numero: 18,
    arcano_tipo: 'Maior',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Água',
    keywords: ['ilusão', 'intuição', 'sonhos', 'inconsciente'],
    energia_espiritual: 'Navegação pelos mares do inconsciente e discernimento de ilusões',
  },

  // XIX. O Sol (The Sun) - Sahasrara - joy, success
  'O Sol': {
    arcano: 'O Sol',
    arcano_numero: 19,
    arcano_tipo: 'Maior',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Fogo',
    keywords: ['alegria', 'sucesso', 'vitalidade', 'felicidade'],
    energia_espiritual: 'Iluminação da consciência e acesso à alegria eterna',
  },

  // XX. O Julgamento (Judgement) - Ajna - reckoning, awakening
  'O Julgamento': {
    arcano: 'O Julgamento',
    arcano_numero: 20,
    arcano_tipo: 'Maior',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Fogo',
    keywords: ['ressurreição', 'juízo', 'despertar', 'renovação'],
    energia_espiritual: 'Despertar da alma e resposta ao chamado divino',
  },

  // XXI. O Mundo (The World) - Sahasrara - completion, wholeness
  'O Mundo': {
    arcano: 'O Mundo',
    arcano_numero: 21,
    arcano_tipo: 'Maior',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Terra',
    keywords: ['completude', 'integração', 'realização', 'êxtase'],
    energia_espiritual: 'Realização da unidade com o cosmos e completude do caminho',
  },

  // ─── Minor Arcana - Wands/Bastões (Fire element) ────────────────────────────

  'Às de Bastões': {
    arcano: 'Às de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    keywords: ['inspiração', 'criatividade', 'ação', 'expandir'],
    energia_espiritual: 'Centelha criativa e expansão da energia vital',
  },
  'Dois de Bastões': {
    arcano: 'Dois de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Fogo',
    keywords: ['decisão', 'progresso', 'expansão', 'visão'],
    energia_espiritual: 'Expansão da consciência e decisão sobre o caminho',
  },
  'Três de Bastões': {
    arcano: 'Três de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Fogo',
    keywords: ['previsão', 'oportunidade', 'viagem', 'exportação'],
    energia_espiritual: 'Antecipação das bênçãos e abertura para novos horizontes',
  },
  'Quatro de Bastões': {
    arcano: 'Quatro de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Fogo',
    keywords: ['celebração', 'harmonia', 'lar', 'festa'],
    energia_espiritual: 'Celebração da conquista e integração das bênçãos',
  },
  'Cinco de Bastões': {
    arcano: 'Cinco de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    keywords: ['conflito', 'competição', 'diversidade', 'desafio'],
    energia_espiritual: 'Transformação do conflito em crescimento espiritual',
  },
  'Seis de Bastões': {
    arcano: 'Seis de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Fogo',
    keywords: ['vitória', 'reconhecimento', 'triunfo', 'liderança'],
    energia_espiritual: 'Celebração da vitória e reconhecimento do caminho percorrido',
  },
  'Sete de Bastões': {
    arcano: 'Sete de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    keywords: ['defesa', 'persistência', 'coragem', 'desafio'],
    energia_espiritual: 'Defesa da integridade e persistência no caminho',
  },
  'Oito de Bastões': {
    arcano: 'Oito de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    keywords: ['rapidez', 'ação', 'movimento', 'motivação'],
    energia_espiritual: 'Fluxo rápido de energia e ação decisiva',
  },
  'Nove de Bastões': {
    arcano: 'Nove de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Fogo',
    keywords: ['resiliência', 'força', 'resistência', 'defesa'],
    energia_espiritual: 'Fortaleza interior e resistência aos obstáculos',
  },
  'Dez de Bastões': {
    arcano: 'Dez de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Fogo',
    keywords: ['opressão', 'carga', 'responsabilidade', 'trabalho'],
    energia_espiritual: 'Libertação do peso excessivo e distribuição justa das responsabilidades',
  },
  'Valete de Bastões': {
    arcano: 'Valete de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    keywords: ['exploração', 'aventureiro', 'entusiasmo', 'idealismo'],
    energia_espiritual: 'Despertar da chama criativa e busca por novos caminhos',
  },
  'Cavaleiro de Bastões': {
    arcano: 'Cavaleiro de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    keywords: ['paixão', 'ação', 'aventureiro', 'impulso'],
    energia_espiritual: 'Impulso passionais e ação direta no mundo',
  },
  'Rainha de Bastões': {
    arcano: 'Rainha de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Fogo',
    keywords: ['confiança', 'independência', 'criatividade', 'alegria'],
    energia_espiritual: 'Expressão autêntica da energia criativa com confiança',
  },
  'Rei de Bastões': {
    arcano: 'Rei de Bastões',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Fogo',
    keywords: ['líder', 'visão', 'clareza', 'realização'],
    energia_espiritual: 'Comando da energia criativa e realização da visão',
  },

  // ─── Minor Arcana - Cups/Copas (Water element) ──────────────────────────────

  'Às de Copas': {
    arcano: 'Às de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Água',
    keywords: ['amor', 'novo começo', 'emoção', 'pureza'],
    energia_espiritual: 'Fluxo de amor divino e novoscomeços emocionais',
  },
  'Dois de Copas': {
    arcano: 'Dois de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Água',
    keywords: ['parceria', 'união', 'harmonia', 'relacionamento'],
    energia_espiritual: 'União de corações e parceria em expansão espiritual',
  },
  'Três de Copas': {
    arcano: 'Três de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Água',
    keywords: ['celebração', 'amizade', 'comunidade', 'alegria'],
    energia_espiritual: 'Celebração da vida comunitária e alegria compartilhada',
  },
  'Quatro de Copas': {
    arcano: 'Quatro de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Água',
    keywords: ['apatia', 'meditação', 'avaliação', 'insatisfação'],
    energia_espiritual: 'Reflexão interior e reavaliação das prioridades',
  },
  'Cinco de Copas': {
    arcano: 'Cinco de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'Água',
    keywords: ['perda', 'luto', 'decepção', 'saudade'],
    energia_espiritual: 'Processamento da dor emocional e busca por cura',
  },
  'Seis de Copas': {
    arcano: 'Seis de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'Água',
    keywords: ['infância', 'inocência', 'memória', 'nostalgia'],
    energia_espiritual: 'Conexão com a pureza original e memória sagrada',
  },
  'Sete de Copas': {
    arcano: 'Sete de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Água',
    keywords: ['ilusão', 'fantasia', 'escolha', 'sonhos'],
    energia_espiritual: 'Navegação entre ilusões e discernimento de visões verdadeiras',
  },
  'Oito de Copas': {
    arcano: 'Oito de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'Água',
    keywords: ['partida', 'abandono', 'busca', 'desapego'],
    energia_espiritual: 'Desapego de situações que não servem mais e busca interior',
  },
  'Nove de Copas': {
    arcano: 'Nove de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Água',
    keywords: ['contentamento', 'saudade', 'satisfação', 'desejo'],
    energia_espiritual: 'Realização dos desejos do coração e contentamento espiritual',
  },
  'Dez de Copas': {
    arcano: 'Dez de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Água',
    keywords: ['felicidade', 'família', 'harmonia', 'lar'],
    energia_espiritual: 'Realização da harmonia familiar e felicidade duradoura',
  },
  'Valete de Copas': {
    arcano: 'Valete de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Água',
    keywords: ['intuição', 'criatividade', 'emoção', 'avanço'],
    energia_espiritual: 'Despertar da sensibilidade intuitiva e expressão emocional',
  },
  'Cavaleiro de Copas': {
    arcano: 'Cavaleiro de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Água',
    keywords: ['fantasia', 'romance', 'emoção', 'aventureiro'],
    energia_espiritual: 'Busca pelo ideal romântico e expressão da sensibilidade',
  },
  'Rainha de Copas': {
    arcano: 'Rainha de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Água',
    keywords: ['compaixão', 'intuição', 'emotividade', 'receptividade'],
    energia_espiritual: 'Cultivo da compaixão profunda e receptividade intuitiva',
  },
  'Rei de Copas': {
    arcano: 'Rei de Copas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Água',
    keywords: ['emocional', 'sabedoria', 'compassão', 'clareza'],
    energia_espiritual: 'Domínio emocional e sabedoria compassiva',
  },

  // ─── Minor Arcana - Swords/Espadas (Air element) ───────────────────────────

  'Às de Espadas': {
    arcano: 'Às de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento: 'Ar',
    keywords: ['clareza', 'verdade', 'decisão', 'corte'],
    energia_espiritual: 'Corte das ilusões e clareza mental para decisões',
  },
  'Dois de Espadas': {
    arcano: 'Dois de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Ar',
    keywords: ['bloqueio', 'inação', 'incisão', 'equilíbrio'],
    energia_espiritual: 'Estabilização da mente em momentos de indecisão',
  },
  'Três de Espadas': {
    arcano: 'Três de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Ar',
    keywords: ['dor', 'coração partido', 'traição', 'luto'],
    energia_espiritual: 'Processamento da dor do coração e cura de feridas emocionais',
  },
  'Quatro de Espadas': {
    arcano: 'Quatro de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Ar',
    keywords: ['descanso', 'recuperação', 'meditação', 'trégua'],
    energia_espiritual: 'Retiro restaurador e integração da experiência',
  },
  'Cinco de Espadas': {
    arcano: 'Cinco de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Ar',
    keywords: ['conflito', 'derrota', 'desonra', 'competição'],
    energia_espiritual: 'Dissolução de conflitos e transcendência de batalhas mentais',
  },
  'Seis de Espadas': {
    arcano: 'Seis de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'Ar',
    keywords: ['mudança', 'transição', 'viagem', 'deixando para trás'],
    energia_espiritual: 'Passagem para novos territórios e libertação do passado',
  },
  'Sete de Espadas': {
    arcano: 'Sete de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Ar',
    keywords: ['engano', 'desonestidade', 'segredo', 'fuga'],
    energia_espiritual: 'Enfrentamento das sombras de engano e honestidade interior',
  },
  'Oito de Espadas': {
    arcano: 'Oito de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Ar',
    keywords: ['restrição', 'prisão', 'mental', 'auto limitação'],
    energia_espiritual: 'Libertação das prisões mentais auto-impostas',
  },
  'Nove de Espadas': {
    arcano: 'Nove de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Ar',
    keywords: ['ansiedade', 'pesadelos', 'medo', 'agonia'],
    energia_espiritual: 'Transcendência do medo e iluminação das ansiedades',
  },
  'Dez de Espadas': {
    arcano: 'Dez de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Ar',
    keywords: ['fim', 'dor profunda', 'renascimento', 'libertação'],
    energia_espiritual: 'Fim do ciclo de dor e renascimento para nova vida',
  },
  'Valete de Espadas': {
    arcano: 'Valete de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento: 'Ar',
    keywords: ['curiosidade', 'mensagem', 'notícia', 'inteligência'],
    energia_espiritual: 'Despertar da mente crítica e busca por verdade',
  },
  'Cavaleiro de Espadas': {
    arcano: 'Cavaleiro de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Ar',
    keywords: ['ação', 'velocidade', 'ambição', 'impulso'],
    energia_espiritual: 'Impulso mental determinado e busca ambiciosa por clareza',
  },
  'Rainha de Espadas': {
    arcano: 'Rainha de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Ar',
    keywords: ['independência', 'lógica', 'objetividade', 'verdade'],
    energia_espiritual: 'Expressão da sabedoria mental e objetividade compassiva',
  },
  'Rei de Espadas': {
    arcano: 'Rei de Espadas',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Ar',
    keywords: ['autoridade', 'verdade', 'clareza', 'juramento'],
    energia_espiritual: 'Comando da mente e expressão da verdade autoritativa',
  },

  // ─── Minor Arcana - Pentacles/OUros (Earth element) ─────────────────────────

  'Às de Ouros': {
    arcano: 'Às de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Terra',
    keywords: ['manifestação', 'abundância', 'novo começo', 'prosperidade'],
    energia_espiritual: 'Semente da prosperidade material e manifestação criativa',
  },
  'Dois de Ouros': {
    arcano: 'Dois de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'Terra',
    keywords: ['adaptabilidade', 'equilíbrio', 'flexibilidade', 'multitarefa'],
    energia_espiritual: 'Equilíbrio dinâmico e gerenciamento harmonioso de energias',
  },
  'Três de Ouros': {
    arcano: 'Três de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Terra',
    keywords: ['trabalho', 'equipe', 'colaboração', 'habilidade'],
    energia_espiritual: 'Expressão criativa através do trabalho em comunidade',
  },
  'Quatro de Ouros': {
    arcano: 'Quatro de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Terra',
    keywords: ['segurança', 'conservadorismo', 'poupança', 'medo'],
    energia_espiritual: 'Apertar o fluxo de abundância e equilibrar segurança com generosidade',
  },
  'Cinco de Ouros': {
    arcano: 'Cinco de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'Terra',
    keywords: ['dificuldade', 'privação', 'isolamento', 'fé'],
    energia_espiritual: 'Superação da carência e busca por conexão espiritual',
  },
  'Seis de Ouros': {
    arcano: 'Seis de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Terra',
    keywords: ['generosidade', 'caridade', 'compartilhamento', 'dádiva'],
    energia_espiritual: 'Fluxo de abundância e prática da generosidade compassiva',
  },
  'Sete de Ouros': {
    arcano: 'Sete de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Terra',
    keywords: ['paciência', 'espera', 'investimento', 'recompensa'],
    energia_espiritual: 'Cultivo paciente e confiança no processo de crescimento',
  },
  'Oito de Ouros': {
    arcano: 'Oito de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Terra',
    keywords: ['trabalho árduo', 'dedicação', 'qualidade', 'habilidade'],
    energia_espiritual: 'Excelência no trabalho e maestria através da prática',
  },
  'Nove de Ouros': {
    arcano: 'Nove de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Terra',
    keywords: ['abundância', 'luxo', 'auto suficiência', 'bênçãos'],
    energia_espiritual: 'Manifestação da abundância e auto-suficiência material',
  },
  'Dez de Ouros': {
    arcano: 'Dez de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Terra',
    keywords: ['herança', 'família', 'tradição', 'prosperidade'],
    energia_espiritual: 'Realização do legado familiar e prosperidade herdada',
  },
  'Valete de Ouros': {
    arcano: 'Valete de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Terra',
    keywords: ['manifestação', 'abundância', 'prosperidade', 'sorte'],
    energia_espiritual: 'Despertar da energia de prosperidade e manifestação material',
  },
  'Cavaleiro de Ouros': {
    arcano: 'Cavaleiro de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Terra',
    keywords: ['eficiência', 'responsabilidade', 'disciplina', 'roteiro'],
    energia_espiritual: 'Aplicação prática da energia e responsabilidade material',
  },
  'Rainha de Ouros': {
    arcano: 'Rainha de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Terra',
    keywords: ['abundância', 'segurança', 'nutrição', 'praticidade'],
    energia_espiritual: 'Nutrição abundante e cuidado prático com a vida',
  },
  'Rei de Ouros': {
    arcano: 'Rei de Ouros',
    arcano_numero: null,
    arcano_tipo: 'Menor',
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Terra',
    keywords: ['abundância', 'segurança', 'controle', 'paternalismo'],
    energia_espiritual: 'Domínio da energia material e criação de prosperidade sustentável',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_CHAKRA_MAPPINGS);
// Freeze nested objects
Object.values(TAROT_CHAKRA_MAPPINGS).forEach((mapping) => Object.freeze(mapping));

/**
 * Get the Tarot-Chakra correlation mapping
 * @param arcano - The name of the Tarot card (e.g., 'O Mago', 'Às de Copas')
 * @returns The correlation mapping or null if not found
 */
export function getTarotChakra(arcano: string): TarotChakraMapping | null {
  const normalized = normalizeArcanoName(arcano);
  return TAROT_CHAKRA_MAPPINGS[normalized] ?? null;
}

/**
 * Get the Tarot cards associated with a specific chakra
 * @param chakra - The chakra name (e.g., 'Sahasrara', 'Ajna', 'Muladhara')
 * @returns Array of TarotChakraMapping for the given chakra
 */
export function getChakraTarot(chakra: string): TarotChakraMapping[] {
  const normalizedChakra = normalizeChakraName(chakra);
  return Object.values(TAROT_CHAKRA_MAPPINGS).filter(
    mapping => mapping.chakra === normalizedChakra
  );
}

/**
 * Get all available Tarot-Chakra mappings
 * @returns Array of all correlation mappings
 */
export function getAllTarotChakras(): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS);
}

/**
 * Get all Tarot card names
 * @returns Array of Tarot card names
 */
export function getAllTarotArcanos(): string[] {
  return Object.keys(TAROT_CHAKRA_MAPPINGS);
}

/**
 * Check if a Tarot card exists in the mapping
 * @param arcano - The name of the Tarot card
 * @returns True if card exists in mapping
 */
export function hasTarotChakra(arcano: string): boolean {
  const normalized = normalizeArcanoName(arcano);
  return normalized in TAROT_CHAKRA_MAPPINGS;
}

/**
 * Get Tarot cards filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of TarotChakraMapping matching the element
 */
export function getTarotByElement(elemento: string): TarotChakraMapping[] {
  const normalizedElement = normalizeElementName(elemento);
  return Object.values(TAROT_CHAKRA_MAPPINGS).filter(
    mapping => mapping.elemento === normalizedElement
  );
}

/**
 * Get Tarot cards filtered by arcano type (Major/Minor)
 * @param tipo - Arcano type ('Maior' or 'Menor')
 * @returns Array of TarotChakraMapping matching the type
 */
export function getTarotByType(tipo: ArcanoType): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAPPINGS).filter(
    mapping => mapping.arcano_tipo === tipo
  );
}

/**
 * Get all Major Arcana cards
 * @returns Array of TarotChakraMapping for Major Arcana
 */
export function getMajorArcana(): TarotChakraMapping[] {
  return getTarotByType('Maior');
}

/**
 * Get all Minor Arcana cards
 * @returns Array of TarotChakraMapping for Minor Arcana
 */
export function getMinorArcana(): TarotChakraMapping[] {
  return getTarotByType('Menor');
}

/**
 * Get Tarot cards by keyword search
 * @param keyword - Keyword to search for in card keywords
 * @returns Array of TarotChakraMapping containing the keyword
 */
export function getTarotByKeyword(keyword: string): TarotChakraMapping[] {
  const lowerKeyword = keyword.toLowerCase();
  return Object.values(TAROT_CHAKRA_MAPPINGS).filter(
    mapping => mapping.keywords.some(k => k.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Normalizes arcano name to match keys in TAROT_CHAKRA_MAPPINGS.
 * Handles various input formats (with/without accent marks, uppercase).
 */
function normalizeArcanoName(arcano: string): string {
  const normalized = arcano.toLowerCase().trim();

  const arcanoMap: Record<string, string> = {
    // Major Arcana variations
    'the fool': 'O Louco',
    'o louco': 'O Louco',
    'louco': 'O Louco',
    'the magician': 'O Mago',
    'o mago': 'O Mago',
    'mago': 'O Mago',
    'the high priestess': 'A Sacerdotisa',
    'a sacerdotisa': 'A Sacerdotisa',
    'sacerdotisa': 'A Sacerdotisa',
    'the empress': 'A Imperatriz',
    'a imperatriz': 'A Imperatriz',
    'imperatriz': 'A Imperatriz',
    'the emperor': 'O Imperador',
    'o imperador': 'O Imperador',
    'imperador': 'O Imperador',
    'the hierophant': 'O Hierofante',
    'o hierofante': 'O Hierofante',
    'hierofante': 'O Hierofante',
    'the lovers': 'Os Enamorados',
    'os enamorados': 'Os Enamorados',
    'enamorados': 'Os Enamorados',
    'the chariot': 'O Carro',
    'o carro': 'O Carro',
    'carro': 'O Carro',
    'strength': 'A Força',
    'a força': 'A Força',
    'força': 'A Força',
    'the hermit': 'O Eremita',
    'o eremita': 'O Eremita',
    'eremita': 'O Eremita',
    'wheel of fortune': 'A Roda da Fortuna',
    'a roda da fortuna': 'A Roda da Fortuna',
    'roda da fortuna': 'A Roda da Fortuna',
    'justice': 'A Justiça',
    'a justiça': 'A Justiça',
    'justiça': 'A Justiça',
    'the hanged man': 'O Enforcado',
    'o enforcado': 'O Enforcado',
    'enforcado': 'O Enforcado',
    'death': 'A Morte',
    'a morte': 'A Morte',
    'morte': 'A Morte',
    'temperance': 'A Temperança',
    'a temperança': 'A Temperança',
    'temperança': 'A Temperança',
    'the devil': 'O Diabo',
    'o diabo': 'O Diabo',
    'diabo': 'O Diabo',
    'the tower': 'A Torre',
    'a torre': 'A Torre',
    'torre': 'A Torre',
    'the star': 'A Estrela',
    'a estrela': 'A Estrela',
    'estrela': 'A Estrela',
    'the moon': 'A Lua',
    'a lua': 'A Lua',
    'lua': 'A Lua',
    'the sun': 'O Sol',
    'o sol': 'O Sol',
    'sol': 'O Sol',
    'judgement': 'O Julgamento',
    'o julgamento': 'O Julgamento',
    'julgamento': 'O Julgamento',
    'the world': 'O Mundo',
    'o mundo': 'O Mundo',
    'mundo': 'O Mundo',

    // Wands variations
    'aces of wands': 'Às de Bastões',
    'as de bastões': 'Às de Bastões',
    'two of wands': 'Dois de Bastões',
    'tres de bastões': 'Três de Bastões',
    'four of wands': 'Quatro de Bastões',
    'five of wands': 'Cinco de Bastões',
    'six of wands': 'Seis de Bastões',
    'seven of wands': 'Sete de Bastões',
    'eight of wands': 'Oito de Bastões',
    'nine of wands': 'Nove de Bastões',
    'ten of wands': 'Dez de Bastões',
    'page of wands': 'Valete de Bastões',
    'knight of wands': 'Cavaleiro de Bastões',
    'queen of wands': 'Rainha de Bastões',
    'king of wands': 'Rei de Bastões',

    // Cups variations
    'aces of cups': 'Às de Copas',
    'as de copas': 'Às de Copas',
    'two of cups': 'Dois de Copas',
    'tres de copas': 'Três de Copas',
    'four of cups': 'Quatro de Copas',
    'five of cups': 'Cinco de Copas',
    'six of cups': 'Seis de Copas',
    'seven of cups': 'Sete de Copas',
    'eight of cups': 'Oito de Copas',
    'nine of cups': 'Nove de Copas',
    'ten of cups': 'Dez de Copas',
    'page of cups': 'Valete de Copas',
    'knight of cups': 'Cavaleiro de Copas',
    'queen of cups': 'Rainha de Copas',
    'king of cups': 'Rei de Copas',

    // Swords variations
    'aces of swords': 'Às de Espadas',
    'as de espadas': 'Às de Espadas',
    'two of swords': 'Dois de Espadas',
    'tres de espadas': 'Três de Espadas',
    'four of swords': 'Quatro de Espadas',
    'five of swords': 'Cinco de Espadas',
    'six of swords': 'Seis de Espadas',
    'seven of swords': 'Sete de Espadas',
    'eight of swords': 'Oito de Espadas',
    'nine of swords': 'Nove de Espadas',
    'ten of swords': 'Dez de Espadas',
    'page of swords': 'Valete de Espadas',
    'knight of swords': 'Cavaleiro de Espadas',
    'queen of swords': 'Rainha de Espadas',
    'king of swords': 'Rei de Espadas',

    // Pentacles/Coins variations
    'aces of pentacles': 'Às de Ouros',
    'as de ouros': 'Às de Ouros',
    'two of pentacles': 'Dois de Ouros',
    'tres de ouros': 'Três de Ouros',
    'four of pentacles': 'Quatro de Ouros',
    'five of pentacles': 'Cinco de Ouros',
    'six of pentacles': 'Seis de Ouros',
    'seven of pentacles': 'Sete de Ouros',
    'eight of pentacles': 'Oito de Ouros',
    'nine of pentacles': 'Nove de Ouros',
    'ten of pentacles': 'Dez de Ouros',
    'page of pentacles': 'Valete de Ouros',
    'knight of pentacles': 'Cavaleiro de Ouros',
    'queen of pentacles': 'Rainha de Ouros',
    'king of pentacles': 'Rei de Ouros',
  };

  return arcanoMap[normalized] ?? arcano;
}

/**
 * Normalizes chakra name to match ChakraName type.
 * Handles various input formats (English, Sanskrit, with/without diacritics).
 */
function normalizeChakraName(chakra: string): ChakraName {
  const chakraMap: Record<string, ChakraName> = {
    'muladhara': 'Muladhara',
    'svadhisthana': 'Svadhisthana',
    'manipura': 'Manipura',
    'anahata': 'Anahata',
    'vishuddha': 'Vishuddha',
    'ajna': 'Ajna',
    'sahasrara': 'Sahasrara',
    'root': 'Muladhara',
    'sacral': 'Svadhisthana',
    'solar plexus': 'Manipura',
    'plexo solar': 'Manipura',
    'heart': 'Anahata',
    'cardíaco': 'Anahata',
    'throat': 'Vishuddha',
    'laríngeo': 'Vishuddha',
    'third eye': 'Ajna',
    'frontal': 'Ajna',
    'crown': 'Sahasrara',
    'coronário': 'Sahasrara',
    '1º básico': 'Muladhara',
    '2º sacro': 'Svadhisthana',
    '3º plexo solar': 'Manipura',
    '4º cardíaco': 'Anahata',
    '5º laríngeo': 'Vishuddha',
    '6º frontal': 'Ajna',
    '7º coronário': 'Sahasrara',
  };

  const lower = chakra.toLowerCase();
  return chakraMap[lower] ?? chakra as ChakraName;
}

/**
 * Normalizes element name to match Elemento type.
 */
function normalizeElementName(elemento: string): Elemento {
  const elementMap: Record<string, Elemento> = {
    'fogo': 'Fogo',
    'água': 'Água',
    'ar': 'Ar',
    'terra': 'Terra',
    'éter': 'Éter',
    'fire': 'Fogo',
    'water': 'Água',
    'air': 'Ar',
    'earth': 'Terra',
    'ether': 'Éter',
    'spirit': 'Éter',
  };

  const lower = elemento.toLowerCase();
  return elementMap[lower] ?? elemento as Elemento;
}