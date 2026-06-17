// ============================================================
// LIFE AREAS ENGINE - Motor de Áreas da Vida
// ============================================================
// Sistema completo que correlaciona TODAS as áreas da vida com:
// - Astrologia (planetas, casas, signos, aspectos, Lilith, nodos)
// - Numerologia Cabalística
// - Odu de Ifá
// - Numerologia Tântrica (chakras)
// - Elementos
// - Orixás
// ============================================================

import type { LifeAreaId, LifeArea } from './types';

// ============================================================
// TYPES (re-exported from ./types)
// ============================================================
export type { LifeAreaId, LifeArea, AstrologicalMapping, NumerologyMapping, OduMapping, OrixaMapping, ChakraMapping, ElementMapping } from './types';

// ============================================================
// DEFINIÇÃO COMPLETA DAS 12 ÁREAS DA VIDA
// ============================================================

export const LIFE_AREAS: Record<LifeAreaId, LifeArea> = {
  // 1. PROPÓSITO DE VIDA
  proposito: {
    id: 'proposito',
    name: 'Propósito de Vida',
    nameEnglish: 'Life Purpose',
    description: 'Sua missão neste plano. O que você veio fazer e como contribuir para o coletivo.',
    emoji: '🌟',
    color: '#fbbf24',
    gradient: 'from-amber-500/20 to-yellow-500/10',
    icon: 'Compass',
    astrology: {
      planets: ['Sol', 'Júpiter', 'Netuno'],
      houses: [1, 9, 10, 12],
      signs: ['Leão', 'Sagitário', 'Peixes', 'Áries'],
      points: ['Nodo Norte', 'Meio do Céu (MC)', 'Sol'],
      aspects: ['Sol-MC', 'Sol-Netuno', 'Júpiter-Netuno'],
      keywords: ['missão', 'vocação', 'legado', 'sentido', 'chamado'],
    },
    numerology: {
      lifePath: [3, 7, 9, 11, 22, 33],
      masterNumbers: [11, 22, 33],
      personalYear: [1, 3, 9],
      expression: [7, 9, 11],
      keywords: ['expressão', 'chamado', 'missão'],
    },
    odu: {
      primaryOdus: ['Ogbe', 'Ofun', 'Oyeku'],
      favorableOdus: ['Irosun', 'Iwori', 'Odi'],
      avoidOdus: [],
      eboSuggestions: ['Akofá de Ori', 'Bori'],
      keywords: ['destino', 'Ori', 'caminho', 'cabeça'],
    },
    orixa: {
      primary: ['Oxalá', 'Oxaguiã'],
      secondary: ['Oxóssi', 'Oxum'],
      offerings: ['Alvos brancos', 'Mel', 'Velas brancas'],
      days: ['Segunda-feira', 'Sexta-feira'],
      elements: ['Ar', 'Éter'],
    },
    chakra: {
      primary: ['7º Coronário', '6º Frontal'],
      balance: 'high',
      color: '#9333ea',
      mantra: 'OM',
    },
    element: {
      primary: 'Éter',
      secondary: ['Fogo', 'Ar'],
      favorable: ['Ar', 'Fogo'],
      avoid: ['Terra'],
    },
    questions: [
      'O que te faz perder a noção do tempo?',
      'Que legado você quer deixar?',
      'Se dinheiro não fosse problema, o que você faria?',
    ],
    practices: ['Meditação silenciosa', 'Journaling', 'Retiros espirituais', 'Estudo de filosofia'],
    crystals: ['Ametista', 'Quartzo transparente', 'Sugilita'],
    challenges: [],
    affirmations: [
      'Eu confio no chamado da minha alma.',
      'Minha missão se revela a cada passo.',
      'Eu sou guiado pela luz divina.',
    ],
  },

  // 2. CARREIRA / TRABALHO
  carreira: {
    id: 'carreira',
    name: 'Carreira & Trabalho',
    nameEnglish: 'Career & Work',
    description: 'Sua vocação profissional, ambições e contribuição social através do trabalho.',
    emoji: '💼',
    color: '#3b82f6',
    gradient: 'from-blue-500/20 to-cyan-500/10',
    icon: 'Briefcase',
    astrology: {
      planets: ['Sol', 'Saturno', 'Marte', 'Júpiter'],
      houses: [6, 10, 2],
      signs: ['Capricórnio', 'Áries', 'Leão', 'Virgem'],
      points: ['Meio do Céu (MC)', 'Sol', 'Saturno'],
      aspects: ['Sol-Saturno', 'Sol-MC', 'Marte-Saturno'],
      keywords: ['vocação', 'profissão', 'autoridade', 'disciplina'],
    },
    numerology: {
      lifePath: [1, 4, 8, 22],
      masterNumbers: [22],
      personalYear: [1, 4, 8],
      expression: [8, 22],
      keywords: ['realização', 'autoridade', 'conquista'],
    },
    odu: {
      primaryOdus: ['Osa', 'Ogunda', 'Ofun'],
      favorableOdus: ['Ika', 'Irete', 'Odi'],
      avoidOdus: ['Owonrin'],
      eboSuggestions: ['Ebo de prosperidade', 'Oferenda de Ogum'],
      keywords: ['trabalho', 'conquista', 'autoridade'],
    },
    orixa: {
      primary: ['Ogum', 'Xangô'],
      secondary: ['Oxóssi', 'Oxum'],
      offerings: ['Ferramentas', 'Espada', 'Mel', 'Farinha'],
      days: ['Terça-feira', 'Quarta-feira'],
      elements: ['Fogo', 'Terra'],
    },
    chakra: {
      primary: ['3º Plexo Solar', '1º Básico'],
      balance: 'medium',
      color: '#f59e0b',
      mantra: 'RAM',
    },
    element: {
      primary: 'Terra',
      secondary: ['Fogo'],
      favorable: ['Terra', 'Fogo'],
      avoid: ['Água'],
    },
    questions: [
      'Que tipo de trabalho te faz sentir vivo?',
      'Onde você quer chegar profissionalmente em 5 anos?',
      'Quais são seus maiores talentos?',
    ],
    practices: ['Planejamento estratégico', 'Mentoria', 'Estudo contínuo', 'Networking'],
    crystals: ['Olho de Tigre', 'Cornalina', 'Citrino'],
    challenges: [],
    affirmations: [
      'Eu mereço sucesso e reconhecimento.',
      'Minha carreira está em perfeita expansão.',
      'Eu atraio oportunidades alinhadas com minha missão.',
    ],
  },

  // 3. FINANÇAS / DINHEIRO
  financas: {
    id: 'financas',
    name: 'Finanças & Abundância',
    nameEnglish: 'Finance & Abundance',
    description: 'Sua relação com dinheiro, prosperidade, recursos materiais e abundância.',
    emoji: '💰',
    color: '#10b981',
    gradient: 'from-emerald-500/20 to-green-500/10',
    icon: 'DollarSign',
    astrology: {
      planets: ['Vênus', 'Júpiter', 'Mercúrio'],
      houses: [2, 8, 11],
      signs: ['Touro', 'Libra', 'Sagitário', 'Capricórnio'],
      points: ['Vênus', 'Júpiter', 'Parte da Fortuna'],
      aspects: ['Vênus-Júpiter', 'Júpiter-Saturno', 'Sol-Parte da Fortuna'],
      keywords: ['prosperidade', 'recursos', 'valor próprio', 'fluxo'],
    },
    numerology: {
      lifePath: [4, 6, 8, 22, 33],
      masterNumbers: [22],
      personalYear: [4, 8],
      expression: [8, 22, 33],
      keywords: ['abundância', 'manifestação', 'valor'],
    },
    odu: {
      primaryOdus: ['Ofun', 'Irosun', 'Odi'],
      favorableOdus: ['Iwori', 'Osa', 'Osetura'],
      avoidOdus: ['Okanran', 'Owonrin'],
      eboSuggestions: ['Ebo de riqueza', 'Oferenda de Oxum'],
      keywords: ['riqueza', 'abundância', 'recursos'],
    },
    orixa: {
      primary: ['Oxum', 'Iemanjá', 'Oxóssi'],
      secondary: ['Oxalá', 'Xangô'],
      offerings: ['Mel', 'Espelho', 'Peixes', 'Doces'],
      days: ['Sexta-feira', 'Quinta-feira'],
      elements: ['Água', 'Terra'],
    },
    chakra: {
      primary: ['2º Sacro', '1º Básico'],
      balance: 'medium',
      color: '#eab308',
      mantra: 'VAM',
    },
    element: {
      primary: 'Terra',
      secondary: ['Água'],
      favorable: ['Terra', 'Água'],
      avoid: ['Fogo excessivo'],
    },
    questions: [
      'Qual é sua relação emocional com dinheiro?',
      'Você se sente merecedor de abundância?',
      'O que a prosperidade significa para você?',
    ],
    practices: ['Controle financeiro', 'Investimentos', 'Visualização criativa', 'Gratidão diária'],
    crystals: ['Citrino', 'Pirita', 'Esmeralda', 'Aventurina verde'],
    challenges: [],
    affirmations: [
      'Eu sou um imã para a abundância.',
      'O dinheiro flui para mim de fontes múltiplas.',
      'Eu uso a riqueza para servir ao bem maior.',
    ],
  },

  // 4. SAÚDE / CORPO / VITALIDADE
  saude: {
    id: 'saude',
    name: 'Saúde & Vitalidade',
    nameEnglish: 'Health & Vitality',
    description: 'Seu bem-estar físico, mental, emocional e energético. Sua relação com o corpo.',
    emoji: '🏥',
    color: '#ef4444',
    gradient: 'from-red-500/20 to-pink-500/10',
    icon: 'Heart',
    astrology: {
      planets: ['Sol', 'Marte', 'Lua'],
      houses: [1, 6, 8, 12],
      signs: ['Áries', 'Escorpião', 'Leão', 'Virgem'],
      points: ['Ascendente', 'Sol', 'Marte'],
      aspects: ['Sol-Ascendente', 'Sol-Lua', 'Marte-Ascendente'],
      keywords: ['vitalidade', 'energia', 'corpo', 'imunidade'],
    },
    numerology: {
      lifePath: [1, 3, 9],
      masterNumbers: [],
      personalYear: [1, 3],
      expression: [1, 3, 9],
      keywords: ['energia', 'vitalidade', 'movimento'],
    },
    odu: {
      primaryOdus: ['Obara', 'Okana', 'Ika'],
      favorableOdus: ['Ofun', 'Iwori', 'Irete'],
      avoidOdus: ['Okanran', 'Osa'],
      eboSuggestions: ['Ebo de cura', 'Oferenda a Omolu'],
      keywords: ['saúde', 'corpo', 'vitalidade'],
    },
    orixa: {
      primary: ['Omolu', 'Oxalá'],
      secondary: ['Iansã', 'Oxum'],
      offerings: ['Milho', 'Pipoca', 'Farinha', 'Alvos'],
      days: ['Segunda-feira', 'Terça-feira'],
      elements: ['Terra', 'Fogo'],
    },
    chakra: {
      primary: ['1º Básico', '3º Plexo Solar'],
      balance: 'high',
      color: '#dc2626',
      mantra: 'LAM',
    },
    element: {
      primary: 'Terra',
      secondary: ['Fogo'],
      favorable: ['Terra', 'Fogo'],
      avoid: ['Ar excessivo'],
    },
    questions: [
      'Como você se sente no seu corpo hoje?',
      'Qual é seu nível de energia?',
      'O que seu corpo está pedindo?',
    ],
    practices: ['Exercícios regulares', 'Alimentação consciente', 'Sono de qualidade', 'Cura energética'],
    crystals: ['Quartzo Verde', 'Cornalina', 'Granada', 'Olho de Tigre'],
    challenges: [],
    affirmations: [
      'Meu corpo é um templo sagrado.',
      'Eu tenho energia vital ilimitada.',
      'Cada célula do meu corpo irradia saúde.',
    ],
  },

  // 5. RELACIONAMENTOS / AMOR
  relacionamentos: {
    id: 'relacionamentos',
    name: 'Relacionamentos & Amor',
    nameEnglish: 'Relationships & Love',
    description: 'Sua capacidade de amar, parcerias, casamento e conexões afetivas profundas.',
    emoji: '💕',
    color: '#ec4899',
    gradient: 'from-pink-500/20 to-rose-500/10',
    icon: 'Heart',
    astrology: {
      planets: ['Vênus', 'Lua', 'Sol', 'Quíron'],
      houses: [4, 5, 7, 8],
      signs: ['Libra', 'Touro', 'Câncer', 'Peixes'],
      points: ['Descendente', 'Vênus', 'Lua', 'Quíron'],
      aspects: ['Vênus-Marte', 'Sol-Lua', 'Vênus-Descendente', 'Quíron-Vênus'],
      keywords: ['amor', 'parceria', 'intimidade', 'compaixão', 'cura emocional'],
    },
    numerology: {
      lifePath: [2, 6, 9],
      masterNumbers: [11],
      personalYear: [2, 6],
      expression: [2, 6, 9],
      keywords: ['união', 'harmonia', 'compaixão'],
    },
    odu: {
      primaryOdus: ['Irete', 'Odi', 'Ofun'],
      favorableOdus: ['Okana', 'Iwori', 'Obara'],
      avoidOdus: ['Owonrin', 'Okanran'],
      eboSuggestions: ['Ebo de amor', 'Oferenda a Oxum e Ogum juntos'],
      keywords: ['união', 'amor', 'parceria'],
    },
    orixa: {
      primary: ['Oxum', 'Iemanjá'],
      secondary: ['Xangô', 'Oxalá'],
      offerings: ['Mel', 'Perfume', 'Espelho', 'Doces'],
      days: ['Sexta-feira', 'Sábado'],
      elements: ['Água'],
    },
    chakra: {
      primary: ['4º Cardíaco', '2º Sacro'],
      balance: 'medium',
      color: '#10b981',
      mantra: 'YAM',
    },
    element: {
      primary: 'Água',
      secondary: ['Ar'],
      favorable: ['Água', 'Ar'],
      avoid: [],
    },
    questions: [
      'O que você busca em uma parceria?',
      'Você se sente completo(a) sozinho(a)?',
      'Qual padrão de relacionamento você quer quebrar?',
    ],
    practices: ['Comunicação consciente', 'Terapia de casal', 'Ritual de união', 'Ho oponopono'],
    crystals: ['Quartzo Rosa', 'Aventurina', 'Rodocrosita', 'Morganita'],
    challenges: [],
    affirmations: [
      'Eu me permito ser amado(a) plenamente.',
      'Mereço um amor que me honre e respeite.',
      'Eu atraio parcerias alinhadas com minha essência.',
    ],
  },

  // 6. SEXUALIDADE / INTIMIDADE
  sexualidade: {
    id: 'sexualidade',
    name: 'Sexualidade & Prazer',
    nameEnglish: 'Sexuality & Pleasure',
    description: 'Sua energia criativa, sensual, libidinal e capacidade de prazer profundo.',
    emoji: '🌹',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-fuchsia-500/10',
    icon: 'Flame',
    astrology: {
      planets: ['Marte', 'Plutão', 'Vênus', 'Lilith'],
      houses: [5, 8, 12],
      signs: ['Escorpião', 'Leão', 'Áries', 'Touro'],
      points: ['Lilith (Preta e Branca)', 'Plutão', 'Marte', 'Nodo Sul'],
      aspects: ['Marte-Plutão', 'Vênus-Marte', 'Lilith-Sol', 'Plutão-Vênus'],
      keywords: ['prazer', 'desejo', 'transformação', 'tabu', 'sombra', 'instinto'],
    },
    numerology: {
      lifePath: [1, 5, 8, 11],
      masterNumbers: [11],
      personalYear: [1, 5],
      expression: [5, 8, 11],
      keywords: ['prazer', 'instinto', 'transformação'],
    },
    odu: {
      primaryOdus: ['Irete', 'Owonrin', 'Osa'],
      favorableOdus: ['Ogbe', 'Ika', 'Obara'],
      avoidOdus: ['Okanran'],
      eboSuggestions: ['Ebo de reconciliação', 'Limpezas com ervas'],
      keywords: ['prazer', 'transformação', 'sombra'],
    },
    orixa: {
      primary: ['Iansã', 'Oxum', 'Pomba-Gira'],
      secondary: ['Ogum', 'Exu'],
      offerings: ['Vermelho e rosa', 'Velas', 'Perfume', 'Espelho'],
      days: ['Terça-feira', 'Sexta-feira'],
      elements: ['Fogo', 'Água'],
    },
    chakra: {
      primary: ['2º Sacro', '1º Básico'],
      balance: 'high',
      color: '#a855f7',
      mantra: 'VAM',
    },
    element: {
      primary: 'Fogo',
      secondary: ['Água'],
      favorable: ['Fogo', 'Água'],
      avoid: ['Terra excessiva'],
    },
    questions: [
      'Qual é sua relação com o prazer?',
      'Você se permite sentir desejo?',
      'Onde você reprime sua energia sexual?',
    ],
    practices: ['Movimento consciente', 'Tantra', 'Cura do chacra sacro', 'Dança'],
    crystals: ['Cornalina', 'Granada', 'Rubi', 'Crisocola'],
    challenges: [],
    affirmations: [
      'Eu honro minha energia sexual como sagrada.',
      'Eu mereço prazer e conexão profunda.',
      'Minha sensualidade é expressão da divindade.',
    ],
  },

  // 7. FAMÍLIA / RAÍZES
  familia: {
    id: 'familia',
    name: 'Família & Ancestrais',
    nameEnglish: 'Family & Roots',
    description: 'Sua linhagem, ancestralidade, base emocional e relações familiares.',
    emoji: '🏡',
    color: '#f97316',
    gradient: 'from-orange-500/20 to-amber-500/10',
    icon: 'Home',
    astrology: {
      planets: ['Lua', 'Saturno', 'Sol'],
      houses: [4, 10, 1],
      signs: ['Câncer', 'Capricórnio', 'Leão'],
      points: ['Fundo do Céu (IC)', 'Lua', 'Sol'],
      aspects: ['Sol-Lua', 'Sol-IC', 'Saturno-IC'],
      keywords: ['raízes', 'mãe', 'pai', 'ancestralidade', 'herança'],
    },
    numerology: {
      lifePath: [2, 4, 6, 9],
      masterNumbers: [],
      personalYear: [4, 6],
      expression: [4, 6],
      keywords: ['pertencimento', 'raiz', 'cuidado'],
    },
    odu: {
      primaryOdus: ['Okanran', 'Ofun', 'Irete'],
      favorableOdus: ['Obara', 'Okana', 'Ika'],
      avoidOdus: ['Owonrin'],
      eboSuggestions: ['Akofá de Egum', 'Ebo de sangue'],
      keywords: ['família', 'ancestralidade', 'raiz'],
    },
    orixa: {
      primary: ['Nanã', 'Iemanjá', 'Oxalá'],
      secondary: ['Omolu', 'Iansã'],
      offerings: ['Lama', 'Água do mar', 'Alvos'],
      days: ['Sábado', 'Segunda-feira'],
      elements: ['Terra', 'Água'],
    },
    chakra: {
      primary: ['1º Básico', '4º Cardíaco'],
      balance: 'medium',
      color: '#dc2626',
      mantra: 'LAM',
    },
    element: {
      primary: 'Terra',
      secondary: ['Água'],
      favorable: ['Terra', 'Água'],
      avoid: ['Ar'],
    },
    questions: [
      'Que padrões familiares você carrega?',
      'Como é sua relação com mãe/pai?',
      'Que herança você quer deixar?',
    ],
    practices: ['Reconexão familiar', 'Terapia sistêmica', 'Akofá', 'Ritual de Egum'],
    crystals: ['Quartzo Fumê', 'Pedra Mãe', 'Ágata', 'Jade'],
    challenges: [],
    affirmations: [
      'Eu honro minha família e meus ancestrais.',
      'Eu transformo padrões que não me servem.',
      'Sou grato(a) pelas minhas raízes.',
    ],
  },

  // 8. ESPIRITUALIDADE
  espiritualidade: {
    id: 'espiritualidade',
    name: 'Espiritualidade & Fé',
    nameEnglish: 'Spirituality & Faith',
    description: 'Sua conexão com o divino, fé, transcendência e propósito místico.',
    emoji: '🙏',
    color: '#8b5cf6',
    gradient: 'from-violet-500/20 to-indigo-500/10',
    icon: 'Sparkles',
    astrology: {
      planets: ['Netuno', 'Júpiter', 'Lua', 'Plutão'],
      houses: [9, 12, 4],
      signs: ['Peixes', 'Sagitário', 'Escorpião', 'Aquário'],
      points: ['Netuno', 'Júpiter', 'Nodo Sul', 'Lua'],
      aspects: ['Netuno-Plutão', 'Júpiter-Netuno', 'Sol-Netuno'],
      keywords: ['fé', 'transcendência', 'mística', 'devoção', 'intuição'],
    },
    numerology: {
      lifePath: [7, 9, 11, 22, 33],
      masterNumbers: [11, 22, 33],
      personalYear: [7, 11],
      expression: [7, 9, 11],
      keywords: ['intuição', 'sabedoria', 'mística'],
    },
    odu: {
      primaryOdus: ['Ofun', 'Oyeku', 'Irete'],
      favorableOdus: ['Irosun', 'Okana', 'Iwori'],
      avoidOdus: [],
      eboSuggestions: ['Bori', 'Akofá de Ori', 'Ritual de Ofá'],
      keywords: ['Ori', 'cabeça', 'destino espiritual'],
    },
    orixa: {
      primary: ['Oxalá', 'Olorum'],
      secondary: ['Oxum', 'Iemanjá', 'Nanã'],
      offerings: ['Alvos brancos', 'Alho', 'Velas brancas', 'Incenso'],
      days: ['Segunda-feira', 'Sexta-feira'],
      elements: ['Éter', 'Ar'],
    },
    chakra: {
      primary: ['7º Coronário', '6º Frontal'],
      balance: 'high',
      color: '#8b5cf6',
      mantra: 'OM',
    },
    element: {
      primary: 'Éter',
      secondary: ['Água'],
      favorable: ['Éter', 'Água', 'Ar'],
      avoid: [],
    },
    questions: [
      'O que a espiritualidade significa para você?',
      'Você sente conexão com algo maior?',
      'Qual é sua prática espiritual atual?',
    ],
    practices: ['Meditação', 'Oração', 'Contemplação', 'Jejum', 'Retiros'],
    crystals: ['Ametista', 'Selenita', 'Sugilita', 'Lapislázuli'],
    challenges: [],
    affirmations: [
      'Eu sou um ser espiritual vivendo uma experiência humana.',
      'Minha fé me guia nos momentos difíceis.',
      'Eu sou canal da luz divina.',
    ],
  },

  // 9. CRIATIVIDADE
  criatividade: {
    id: 'criatividade',
    name: 'Criatividade & Expressão',
    nameEnglish: 'Creativity & Expression',
    description: 'Sua capacidade criativa, expressão artística e originalidade.',
    emoji: '🎨',
    color: '#f59e0b',
    gradient: 'from-yellow-500/20 to-orange-500/10',
    icon: 'Palette',
    astrology: {
      planets: ['Sol', 'Vênus', 'Mercúrio', 'Urano'],
      houses: [3, 5, 11],
      signs: ['Leão', 'Aquário', 'Gêmeos', 'Libra'],
      points: ['Sol', 'Vênus', 'Mercúrio'],
      aspects: ['Sol-Urano', 'Vênus-Mercúrio', 'Sol-Mercúrio'],
      keywords: ['criação', 'arte', 'originalidade', 'expressão', 'talento'],
    },
    numerology: {
      lifePath: [3, 5, 7, 11],
      masterNumbers: [11],
      personalYear: [3, 5],
      expression: [3, 5, 11],
      keywords: ['inspiração', 'criação', 'talento'],
    },
    odu: {
      primaryOdus: ['Irosun', 'Ogbe', 'Iwori'],
      favorableOdus: ['Ika', 'Okana', 'Osa'],
      avoidOdus: ['Okanran'],
      eboSuggestions: ['Ebo de inspiração', 'Oferenda a Oxóssi'],
      keywords: ['criatividade', 'caça', 'inspiração'],
    },
    orixa: {
      primary: ['Oxóssi', 'Iansã'],
      secondary: ['Oxum', 'Oxalá'],
      offerings: ['Caça simbólica', 'Frutas', 'Mel'],
      days: ['Quinta-feira', 'Terça-feira'],
      elements: ['Ar', 'Fogo'],
    },
    chakra: {
      primary: ['2º Sacro', '5º Laríngeo'],
      balance: 'high',
      color: '#f59e0b',
      mantra: 'RAM',
    },
    element: {
      primary: 'Ar',
      secondary: ['Fogo'],
      favorable: ['Ar', 'Fogo'],
      avoid: ['Terra'],
    },
    questions: [
      'O que te inspira?',
      'Você se permite criar livremente?',
      'Como você expressa sua essência?',
    ],
    practices: ['Escrita criativa', 'Pintura', 'Música', 'Dança', 'Culinária'],
    crystals: ['Cornalina', 'Ágata de fogo', 'Topázio imperial'],
    challenges: [],
    affirmations: [
      'Eu sou um canal de criação divina.',
      'Minha expressão é única e necessária.',
      'A criatividade flui através de mim.',
    ],
  },

  // 10. AMIZADES / COMUNIDADE
  amizades: {
    id: 'amizades',
    name: 'Amizades & Comunidade',
    nameEnglish: 'Friendships & Community',
    description: 'Suas conexões sociais, grupos de pertencimento e círculos de amizade.',
    emoji: '🤝',
    color: '#06b6d4',
    gradient: 'from-cyan-500/20 to-blue-500/10',
    icon: 'Users',
    astrology: {
      planets: ['Urano', 'Mercúrio', 'Júpiter'],
      houses: [3, 7, 11],
      signs: ['Aquário', 'Gêmeos', 'Libra', 'Sagitário'],
      points: ['Urano', 'Mercúrio', 'Júpiter'],
      aspects: ['Mercúrio-Urano', 'Sol-Júpiter'],
      keywords: ['amizade', 'grupo', 'coletivo', 'rede', 'colaboração'],
    },
    numerology: {
      lifePath: [3, 5, 11],
      masterNumbers: [11],
      personalYear: [3, 11],
      expression: [3, 5, 11],
      keywords: ['sociabilidade', 'coletivo', 'troca'],
    },
    odu: {
      primaryOdus: ['Ika', 'Ofun', 'Osa'],
      favorableOdus: ['Ogbe', 'Irete', 'Odi'],
      avoidOdus: ['Owonrin', 'Okanran'],
      eboSuggestions: ['Ebo de amizades', 'Comemoração com oferenda'],
      keywords: ['amizade', 'coletivo', 'união'],
    },
    orixa: {
      primary: ['Exu', 'Oxalá'],
      secondary: ['Oxum', 'Iemanjá'],
      offerings: ['Vermelho e preto', 'Cachaça', 'Milho torrado'],
      days: ['Segunda-feira'],
      elements: ['Ar', 'Fogo'],
    },
    chakra: {
      primary: ['4º Cardíaco', '5º Laríngeo'],
      balance: 'medium',
      color: '#06b6d4',
      mantra: 'YAM',
    },
    element: {
      primary: 'Ar',
      secondary: ['Água'],
      favorable: ['Ar', 'Água'],
      avoid: [],
    },
    questions: [
      'Você se sente parte de uma comunidade?',
      'Quais amizades te nutrem?',
      'Como você contribui para o coletivo?',
    ],
    practices: ['Voluntariado', 'Grupos de interesse', 'Eventos sociais', 'Apoio mútuo'],
    crystals: ['Ágata azul', 'Fluorita', 'Aventurina'],
    challenges: [],
    affirmations: [
      'Eu atraio amizades verdadeiras e nutritivas.',
      'Pertenço a comunidades que me celebram.',
      'Sou grato(a) pelas minhas conexões.',
    ],
  },

  // 11. CONHECIMENTO / ESTUDOS
  conhecimento: {
    id: 'conhecimento',
    name: 'Conhecimento & Sabedoria',
    nameEnglish: 'Knowledge & Wisdom',
    description: 'Sua busca por sabedoria, estudos superiores e compreensão do mundo.',
    emoji: '📚',
    color: '#6366f1',
    gradient: 'from-indigo-500/20 to-blue-500/10',
    icon: 'BookOpen',
    astrology: {
      planets: ['Mercúrio', 'Júpiter', 'Saturno', 'Netuno'],
      houses: [3, 9, 12],
      signs: ['Gêmeos', 'Sagitário', 'Aquário', 'Peixes'],
      points: ['Mercúrio', 'Júpiter'],
      aspects: ['Mercúrio-Júpiter', 'Júpiter-Netuno', 'Mercúrio-Saturno'],
      keywords: ['aprendizado', 'filosofia', 'sabedoria', 'ensino', 'pesquisa'],
    },
    numerology: {
      lifePath: [7, 9, 11, 22],
      masterNumbers: [11, 22],
      personalYear: [7, 9],
      expression: [7, 9, 11, 22],
      keywords: ['estudo', 'sabedoria', 'pesquisa'],
    },
    odu: {
      primaryOdus: ['Irosun', 'Ika', 'Ofun'],
      favorableOdus: ['Iwori', 'Osa', 'Ofun'],
      avoidOdus: [],
      eboSuggestions: ['Ebo de Ifá', 'Oferenda a Orunmilá'],
      keywords: ['sabedoria', 'Ifá', 'conhecimento'],
    },
    orixa: {
      primary: ['Orunmilá', 'Oxóssi'],
      secondary: ['Oxalá', 'Iansã'],
      offerings: ['Pano branco', 'Mel', 'Pena'],
      days: ['Quinta-feira', 'Quarta-feira'],
      elements: ['Ar', 'Éter'],
    },
    chakra: {
      primary: ['6º Frontal', '5º Laríngeo'],
      balance: 'high',
      color: '#6366f1',
      mantra: 'OM',
    },
    element: {
      primary: 'Ar',
      secondary: ['Éter'],
      favorable: ['Ar', 'Éter'],
      avoid: ['Terra'],
    },
    questions: [
      'O que você quer aprender?',
      'Você se considera uma pessoa sábia?',
      'Como você busca conhecimento?',
    ],
    practices: ['Leitura', 'Cursos', 'Mentoria', 'Pesquisa', 'Escrita reflexiva'],
    crystals: ['Lapislázuli', 'Fluorita', 'Ametista'],
    challenges: [],
    affirmations: [
      'Eu sou um eterno aprendiz.',
      'A sabedoria flui para mim com facilidade.',
      'Eu transmito conhecimento com clareza.',
    ],
  },

  // 12. AUTOCONHECIMENTO
  autoconhecimento: {
    id: 'autoconhecimento',
    name: 'Autoconhecimento & Cura',
    nameEnglish: 'Self-Knowledge & Healing',
    description: 'Sua jornada interior, trabalho de sombra, cura e evolução pessoal.',
    emoji: '🪞',
    color: '#9333ea',
    gradient: 'from-purple-600/20 to-fuchsia-500/10',
    icon: 'Eye',
    astrology: {
      planets: ['Plutão', 'Quíron', 'Saturno', 'Netuno'],
      houses: [8, 12, 1, 4],
      signs: ['Escorpião', 'Peixes', 'Capricórnio', 'Virgem'],
      points: ['Quíron', 'Plutão', 'Lilith', 'Nodo Sul'],
      aspects: ['Sol-Plutão', 'Lua-Plutão', 'Quíron-Sol'],
      keywords: ['sombra', 'cura', 'transformação', 'integração', 'autenticidade'],
    },
    numerology: {
      lifePath: [4, 7, 9, 11, 22, 33],
      masterNumbers: [11, 22, 33],
      personalYear: [4, 7, 9],
      expression: [7, 9, 11],
      keywords: ['profundidade', 'cura', 'integração'],
    },
    odu: {
      primaryOdus: ['Owonrin', 'Irete', 'Oyeku'],
      favorableOdus: ['Ofun', 'Okana', 'Obara'],
      avoidOdus: [],
      eboSuggestions: ['Ebo de cabeça', 'Ritual de limpeza'],
      keywords: ['sombra', 'cura', 'Ori'],
    },
    orixa: {
      primary: ['Omolu', 'Nanã', 'Iansã'],
      secondary: ['Exu', 'Oxalá'],
      offerings: ['Milho', 'Pipoca', 'Lama', 'Defumação'],
      days: ['Segunda-feira', 'Terça-feira'],
      elements: ['Terra', 'Fogo'],
    },
    chakra: {
      primary: ['6º Frontal', '1º Básico'],
      balance: 'high',
      color: '#9333ea',
      mantra: 'AUM',
    },
    element: {
      primary: 'Fogo',
      secondary: ['Terra', 'Água'],
      favorable: ['Fogo', 'Água'],
      avoid: [],
    },
    questions: [
      'Que partes de si você ainda evita olhar?',
      'Como você se relaciona com suas sombras?',
      'O que seu corpo guarda de memórias antigas?',
    ],
    practices: ['Terapia', 'Journaling', 'Meditação profunda', 'Trabalho corporal', 'Astrologia terapêutica'],
    crystals: ['Obsidiana negra', 'Sugilita', 'Labradorita', 'Pedra Lua'],
    challenges: [],
    affirmations: [
      'Eu integro luz e sombra com amor.',
      'Cada ferida é uma porta para a cura.',
      'Eu me permito ser autêntico(a).',
    ],
  },
};

// ============================================================
// RE-EXPORTS from queries helper
// ============================================================
export { getLifeArea, getAllLifeAreas } from './queries';
export { getLifeAreasByPlanet, getLifeAreasByHouse, getLifeAreasByOdu, getLifeAreasByOrixa } from './queries';

// ============================================================
// RE-EXPORTS from order helper
// ============================================================
export { LIFE_AREA_ORDER, getLifeAreaOrderIndex, sortLifeAreasByOrder } from './life-areas-order';

// ============================================================
// RE-EXPORTS from transformations helper
// ============================================================
export {
  getAllKeywords,
  getKeywordsUnion,
  getQuestions,
  getPractices,
  getAffirmations,
  getCrystals,
  getAllPractices,
  getAllAffirmations,
  getAllCrystals,
  getLifeAreasSummary,
  isComplete,
  getMissingFields,
  getIncompleteAreas,
  searchContent,
} from './transformations';
