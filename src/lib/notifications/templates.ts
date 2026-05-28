// ============================================================
// NOTIFICATION TEMPLATES - CABALA DOS CAMINHOS
// ============================================================
// Pre-built notification templates for spiritual practices
// ============================================================

import type { ReminderType } from './reminders';

// ============================================================
// TYPES
// ============================================================

export type TemplateCategory =
  | 'ritual'
  | 'oracao'
  | 'meditacao'
  | 'ebó'
  | 'cabala'
  | 'lua'
  | 'caminho'
  | 'general';

export interface NotificationTemplate {
  id: string;
  category: TemplateCategory;
  title: string;
  message: string;
  icon?: string;
  priority?: 'low' | 'normal' | 'high';
  tags?: string[];
}

export interface TemplateOptions {
  userName?: string;
  date?: Date;
  customMessage?: string;
  includeGreeting?: boolean;
}

// ============================================================
// TEMPLATE REGISTRY
// ============================================================

const TEMPLATES: NotificationTemplate[] = [
  // Ritual templates
  {
    id: 'ritual-manha',
    category: 'ritual',
    title: '☀️ Ritual Matinal',
    message: 'Bom dia! Hora de iniciar sua prática espiritual. A luz da manhã traz energias renovadas para seu caminho na Cabala.',
    icon: 'sun',
    priority: 'high',
    tags: ['ritual', 'manha', 'energia'],
  },
  {
    id: 'ritual-noite',
    category: 'ritual',
    title: '🌙 Ritual Noturno',
    message: 'A noite chegou - momento de reflexão e conexão espiritual. Que seus pensamentos encontrem paz.',
    icon: 'moon',
    priority: 'high',
    tags: ['ritual', 'noite', 'reflexao'],
  },
  {
    id: 'ritual-vespertino',
    category: 'ritual',
    title: '✨ Ritual Vespertino',
    message: 'O sol começa a decline. Este é um momento propício para práticas de gratidão e cierre do dia.',
    icon: 'sunset',
    priority: 'normal',
    tags: ['ritual', 'vespertino', 'gratidao'],
  },
  {
    id: 'ritual-domingo',
    category: 'ritual',
    title: '🙏 Domingo Espiritual',
    message: 'Hoje é domingo - dia de renovação. Dedique tempo para sua prática mais profunda.',
    icon: 'star',
    priority: 'high',
    tags: ['ritual', 'domingo', 'renovacao'],
  },

  // Oração templates
  {
    id: 'oracao-manha',
    category: 'oracao',
    title: '📿 Oração Matinal',
    message: 'Inicie seu dia com uma oração. Peça luz e proteção para seu caminho.',
    icon: 'pray',
    priority: 'normal',
    tags: ['oracao', 'manha', 'luz'],
  },
  {
    id: 'oracao-sagrada',
    category: 'oracao',
    title: '✨ Oração Sagrada',
    message: 'Sua oração diária aguarda. Conecte-se com a energia divina que guia seus passos.',
    icon: 'sparkles',
    priority: 'high',
    tags: ['oracao', 'sagrada', 'divina'],
  },
  {
    id: 'oracao-protecao',
    category: 'oracao',
    title: '🛡️ Oração de Proteção',
    message: 'Momento de invocar proteção divina. Permita que energias positivas envolvam seu ser.',
    icon: 'shield',
    priority: 'high',
    tags: ['oracao', 'protecao', 'divina'],
  },
  {
    id: 'oracao-gratidao',
    category: 'oracao',
    title: '🙏 Oração de Gratidão',
    message: 'Expresse sua gratidão. Cada agradecimento abre portas para novas bênçãos.',
    icon: 'heart',
    priority: 'normal',
    tags: ['oracao', 'gratidao', 'bencos'],
  },

  // Meditação templates
  {
    id: 'meditacao-alba',
    category: 'meditacao',
    title: '🌅 Meditação ao Nascer do Sol',
    message: 'O sol nasce - syncrinize sua energia com o ciclo natural. Um momento perfeito para meditação.',
    icon: 'sunrise',
    priority: 'high',
    tags: ['meditacao', 'alba', 'energia'],
  },
  {
    id: 'meditacao-kundalini',
    category: 'meditacao',
    title: '🔥 Meditação Kundalini',
    message: 'Desperte a energia que habita em você. A prática de Kundalini aguarda.',
    icon: 'flame',
    priority: 'high',
    tags: ['meditacao', 'kundalini', 'energia'],
  },
  {
    id: 'meditacao-sopro',
    category: 'meditacao',
    title: '💨 Meditação do Sopro',
    message: 'Respire profundamente. O sopro vital é a ponte entre corpo e espírito.',
    icon: 'wind',
    priority: 'normal',
    tags: ['meditacao', 'respiracao', 'presenca'],
  },
  {
    id: 'meditacao-caminho',
    category: 'meditacao',
    title: '🛤️ Meditação do Caminho',
    message: 'Reflita sobre seu caminho. Cada passo na Cabala dos Caminhos te aproxima da verdade.',
    icon: 'compass',
    priority: 'high',
    tags: ['meditacao', 'caminho', 'reflexao'],
  },

  // Ebó templates
  {
    id: 'ebo-limpieza',
    category: 'ebó',
    title: '🧹 Ebó de Limpeza',
    message: 'Momento de limpeza energética. Libere o que não serve mais ao seu espírito.',
    icon: 'broom',
    priority: 'high',
    tags: ['ebo', 'limpeza', 'liberacao'],
  },
  {
    id: 'ebo-protecao',
    category: 'ebó',
    title: '🛡️ Ebó de Proteção',
    message: 'Fortaleça suas barreiras espirituais. Um ebó de proteção aguarda sua prática.',
    icon: 'shield',
    priority: 'high',
    tags: ['ebo', 'protecao', 'defesa'],
  },
  {
    id: 'ebo-abundancia',
    category: 'ebó',
    title: '🌾 Ebó de Abundância',
    message: 'Chame prosperidade para sua vida. O universo responde à sua intenção.',
    icon: 'wheat',
    priority: 'normal',
    tags: ['ebo', 'abundancia', 'prosperidade'],
  },
  {
    id: 'ebo-harmonia',
    category: 'ebó',
    title: '⚖️ Ebó de Harmonia',
    message: 'Restaure o equilíbrio em sua vida. A harmonia entre os elementos é a chave.',
    icon: 'balance',
    priority: 'normal',
    tags: ['ebo', 'harmonia', 'equilibrio'],
  },

  // Cabala templates
  {
    id: 'cabala-arvore',
    category: 'cabala',
    title: '🌳 Estudo da Árvore da Vida',
    message: 'Explore os 10 Sephiroth. Cada caminho na Árvore revela um segredo do universo.',
    icon: 'tree',
    priority: 'high',
    tags: ['cabala', 'sephirot', 'estudo'],
  },
  {
    id: 'cabala-sephira',
    category: 'cabala',
    title: '✨ Meditação Sephirótica',
    message: 'Conecte-se com as emanções divinas. Cada Sephira guarda uma verdade eterna.',
    icon: 'star',
    priority: 'high',
    tags: ['cabala', 'sephira', 'meditacao'],
  },
  {
    id: 'cabala-tarot',
    category: 'cabala',
    title: '🃏 Estudo Cabalístico do Tarot',
    message: 'Os Arcanos revelam mapas da consciência. Mergulhe nos mistérios do Tarot.',
    icon: 'cards',
    priority: 'normal',
    tags: ['cabala', 'tarot', 'estudo'],
  },
  {
    id: 'cabala-alfabeto',
    category: 'cabala',
    title: 'א Compreensão do Alfabeto Sagrada',
    message: 'As 22 letras guardam poderes vibrationais. Estude a essência das letras hebraicas.',
    icon: 'alphabet',
    priority: 'normal',
    tags: ['cabala', 'hebraico', 'letras'],
  },

  // Lua templates
  {
    id: 'lua-nova',
    category: 'lua',
    title: '🌑 Lua Nova - Novas Intenções',
    message: 'A Lua Nova é silêncio - momento de plantar sementes intencionais. O que você manifestará?',
    icon: 'new-moon',
    priority: 'high',
    tags: ['lua', 'nova', 'manifestacao'],
  },
  {
    id: 'lua-cheia',
    category: 'lua',
    title: '🌕 Lua Cheia - Iluminação',
    message: 'A Lua Cheia desperta a sabedoria interior. Permita que a luz revele sua verdade.',
    icon: 'full-moon',
    priority: 'high',
    tags: ['lua', 'cheia', 'iluminacao'],
  },
  {
    id: 'lua-crescente',
    category: 'lua',
    title: '🌓 Lua Crescente - Crescimento',
    message: 'Lua crescente - energia de crescimento. Foque em seus projetos e aspirações.',
    icon: 'waxing-moon',
    priority: 'normal',
    tags: ['lua', 'crescente', 'crescimento'],
  },
  {
    id: 'lua-minguante',
    category: 'lua',
    title: '🌗 Lua Minguante - Liberação',
    message: 'Lua minguante - momento de soltar. Liberte o que precisa partir para que o novo chegue.',
    icon: 'waning-moon',
    priority: 'normal',
    tags: ['lua', 'minguante', 'liberacao'],
  },

  // Caminho templates
  {
    id: 'caminho-mapa',
    category: 'caminho',
    title: '🗺️ Mapa Natal do Dia',
    message: 'Consulte seu mapa natal. Os astros revelam caminhos hoje.',
    icon: 'map',
    priority: 'normal',
    tags: ['caminho', 'mapa', 'astrologia'],
  },
  {
    id: 'caminho-numerologia',
    category: 'caminho',
    title: '🔢 Número do Dia',
    message: 'Descubra o número vibrational do dia. Sua energia pessoal está conectada aos ciclos.',
    icon: 'hash',
    priority: 'normal',
    tags: ['caminho', 'numerologia', 'ciclos'],
  },
  {
    id: 'caminho-ciclos',
    category: 'caminho',
    title: '⏳ Ciclos Temporais',
    message: 'Os ciclos cósmicos movem sua energia. Entender os ritmos é trilhar com consciência.',
    icon: 'cycle',
    priority: 'low',
    tags: ['caminho', 'ciclos', 'cosmico'],
  },

  // General templates
  {
    id: 'general-boas-vindas',
    category: 'general',
    title: '🌟 Bem-vindo ao seu caminho',
    message: 'Você chegou à Cabala dos Caminhos. Seu despertar espiritual começa agora.',
    icon: 'sparkles',
    priority: 'high',
    tags: ['bem-vindo', 'inicio'],
  },
  {
    id: 'general-motivacao',
    category: 'general',
    title: '✨ Pensamento do Dia',
    message: '"O caminho se revela a quem caminha com presença e propósito."',
    icon: 'lightbulb',
    priority: 'low',
    tags: ['motivacao', 'pensamento'],
  },
  {
    id: 'general-paz',
    category: 'general',
    title: '🕊️ Paz Interior',
    message: 'Que a paz habite em seu coração. Você é parte de algo maior.',
    icon: 'peace',
    priority: 'normal',
    tags: ['paz', 'tranquilidade'],
  },
];

// ============================================================
// CACHE
// ============================================================

const templateCache = new Map<string, NotificationTemplate>();
const categoryCache = new Map<TemplateCategory, NotificationTemplate[]>();

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function buildCache(): void {
  for (const template of TEMPLATES) {
    templateCache.set(template.id, template);
    const existing = categoryCache.get(template.category) || [];
    existing.push(template);
    categoryCache.set(template.category, existing);
  }
}

function interpolateMessage(
  message: string,
  options: TemplateOptions
): string {
  let result = message;

  if (options.userName) {
    result = result.replace(/\{userName\}/g, options.userName);
  }

  if (options.date) {
    const formattedDate = options.date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    result = result.replace(/\{date\}/g, formattedDate);
  }

  if (options.customMessage) {
    result = result.replace(/\{custom\}/g, options.customMessage);
  }

  return result;
}

// ============================================================
// PUBLIC API
// ============================================================

/**
 * Get all notification templates
 */
export function getTemplates(): NotificationTemplate[] {
  return TEMPLATES;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): NotificationTemplate | undefined {
  if (templateCache.size === 0) {
    buildCache();
  }
  return templateCache.get(id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: TemplateCategory
): NotificationTemplate[] {
  if (categoryCache.size === 0) {
    buildCache();
  }
  return categoryCache.get(category) || [];
}

/**
 * Get templates by tag
 */
export function getTemplatesByTag(tag: string): NotificationTemplate[] {
  return TEMPLATES.filter((t) => t.tags?.includes(tag));
}

/**
 * Get templates by reminder type
 */
export function getTemplatesForReminderType(
  type: ReminderType
): NotificationTemplate[] {
  const categoryMap: Partial<Record<ReminderType, TemplateCategory>> = {
    ritual: 'ritual',
    ebó: 'ebó',
    oração: 'oracao',
    meditação: 'meditacao',
    meditacao: 'meditacao',
    cábala: 'cabala',
    leitura: 'cabala',
    gratidão: 'oracao',
  };

  const category = categoryMap[type];
  if (!category) {
    return [];
  }

  return getTemplatesByCategory(category);
}

/**
 * Get high priority templates
 */
export function getHighPriorityTemplates(): NotificationTemplate[] {
  return TEMPLATES.filter((t) => t.priority === 'high');
}

/**
 * Get random template by category
 */
export function getRandomTemplate(category: TemplateCategory): NotificationTemplate | undefined {
  const templates = getTemplatesByCategory(category);
  if (templates.length === 0) return undefined;
  const index = Math.floor(Math.random() * templates.length);
  return templates[index];
}

/**
 * Format template with options
 */
export function formatTemplate(
  template: NotificationTemplate,
  options: TemplateOptions = {}
): { title: string; message: string } {
  let title = template.title;
  const message = interpolateMessage(template.message, options);

  if (options.includeGreeting && options.userName) {
    title = `Olá, ${options.userName}! ${title}`;
  }

  return { title, message };
}

/**
 * Search templates by query
 */
export function searchTemplates(query: string): NotificationTemplate[] {
  const lowerQuery = query.toLowerCase();
  return TEMPLATES.filter(
    (t) =>
      t.title.toLowerCase().includes(lowerQuery) ||
      t.message.toLowerCase().includes(lowerQuery) ||
      t.tags?.some((tag) => tag.includes(lowerQuery)) ||
      t.category.includes(lowerQuery)
  );
}

// ============================================================
// EXPORTS
// ============================================================

export {
  TEMPLATES,
  buildCache,
  interpolateMessage,
};

export default {
  getTemplates,
  getTemplateById,
  getTemplatesByCategory,
  getTemplatesByTag,
  getTemplatesForReminderType,
  getHighPriorityTemplates,
  getRandomTemplate,
  formatTemplate,
  searchTemplates,
};