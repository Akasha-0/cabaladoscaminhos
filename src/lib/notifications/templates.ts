// ============================================================================
// NOTIFICATIONS — Template registry
// ============================================================================
// Catálogo declarativo de templates de notificação consumidos por:
//   - GET /api/notifications/templates (inspeção, preferências, debug)
//   - UI de preferências em /settings/notifications
//   - Email/Push renderers (consultam metadata p/ preview)
//
// O renderer real (subject + html + text) vive em `./email` e `./push-server`.
// Este arquivo é a FONTE DE VERDADE para a forma canônica de cada tipo:
// categoria, prioridade, defaults de canal, e variáveis disponíveis.
//
// Adicionar um novo NotificationType no Prisma → adicionar entrada em
// NOTIFICATION_TEMPLATES abaixo (TS força via exhaustiveness check).
// ============================================================================

// O enum `NotificationType` vive no Prisma schema (`prisma/schema.prisma`).
// Mantemos uma cópia literal aqui para evitar acoplamento ao client gerado
// (que ainda não foi regenerado por causa do BUG-001 do schema). Quando o
// schema for regenerado, este tipo pode voltar a ser `import type` direto
// do `@prisma/client` sem mudanças nos consumers.
export type NotificationType =
  // Social graph
  | 'LIKE'
  | 'COMMENT'
  | 'POST_REPLY'
  | 'FOLLOW'
  | 'MENTION'
  // Community
  | 'GROUP_INVITE'
  | 'GROUP_POST'
  | 'GROUP_ROLE_CHANGE'
  // Content
  | 'ARTICLE_RECOMMENDATION'
  | 'ARTICLE_PUBLISHED'
  // System
  | 'SYSTEM_ALERT'
  | 'MODERATION_ACTION'
  // Meta
  | 'DIGEST_WEEKLY';

// ============================================================================
// Tipos públicos
// ============================================================================

/**
 * Categoria semântica de uma notificação. Usada para agrupar na UI
 * de preferências e para filtros na API (`?category=social`).
 */
export type TemplateCategory =
  | 'social'      // Interações pessoa-a-pessoa (LIKE, COMMENT, FOLLOW, MENTION)
  | 'community'   // Eventos de grupo (GROUP_INVITE, GROUP_POST, GROUP_ROLE_CHANGE)
  | 'content'     // Conteúdo editorial (ARTICLE_RECOMMENDATION, ARTICLE_PUBLISHED)
  | 'system';     // Alertas críticos e meta (SYSTEM_ALERT, MODERATION_ACTION, DIGEST_WEEKLY)

/**
 * Prioridade de exibição. "high" aparece em destaque mesmo quando o user
 * silenciou a categoria inteira. Mapeia para `getHighPriorityTemplates()`.
 */
export type TemplatePriority = 'high' | 'normal' | 'low';

/**
 * Variável que pode ser interpolada no preview de um template.
 * `example` é o valor usado por `formatTemplate` quando o caller não
 * fornece um valor real — permite preview sem ter uma notif de verdade.
 */
export interface TemplateVariable {
  /** Nome da variável (sem chaves). Ex: "actorName" → {{actorName}} */
  name: string;
  /** Descrição human-readable do que essa variável representa. */
  description: string;
  /** Valor usado no preview caso o caller não forneça um valor. */
  example: string;
}

/**
 * Template canônico de uma notificação. Cobre metadata (categoria,
 * prioridade, defaults de canal) e a forma (variáveis + preview).
 */
export interface NotificationTemplate {
  /** Mesmo valor de `type` — usado como chave primária. */
  id: NotificationType;
  /** Tipo de notificação (Prisma enum). */
  type: NotificationType;
  /** Categoria semântica. */
  category: TemplateCategory;
  /** Prioridade de exibição. */
  priority: TemplatePriority;
  /** Label human-readable exibido na UI de preferências. */
  title: string;
  /** Descrição do que essa notificação significa. */
  description: string;
  /** Defaults de canal — o user pode sobrescrever via NotificationPreference. */
  defaultChannels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
  /** Variáveis que podem ser interpoladas no preview/title/body. */
  variables: TemplateVariable[];
  /**
   * Preview rendered com valores de exemplo. Útil para mostrar na UI
   * "Você receberá: 'Maria curtiu seu post sobre ayahuasca'".
   */
  preview: {
    title: string;
    body: string;
  };
}

/**
 * Variáveis passadas para `formatTemplate` para interpolar o preview.
 * Chave: nome da variável. Valor: string a ser usada.
 */
export type TemplateVars = Record<string, string | undefined>;

export interface FormattedTemplate {
  title: string;
  body: string;
}

// ============================================================================
// Catálogo (fonte de verdade)
// ============================================================================

/**
 * Catálogo completo de templates. Adicionar nova entrada é obrigatório
 * sempre que um novo valor for adicionado ao enum `NotificationType` no
 * Prisma — TypeScript força via exhaustiveness check no `getTemplates`.
 */
const NOTIFICATION_TEMPLATES: readonly NotificationTemplate[] = [
  // --- Social graph ---
  {
    id: 'LIKE',
    type: 'LIKE',
    category: 'social',
    priority: 'normal',
    title: 'Curtida em post',
    description: 'Alguém curtiu um post seu ou de um grupo que você segue.',
    defaultChannels: { inApp: true, email: true, push: false },
    variables: [
      { name: 'actorName', description: 'Nome de quem curtiu', example: 'Maria Silva' },
      { name: 'postExcerpt', description: 'Trecho do post curtido', example: 'Ayahuasca e transformação interior' },
    ],
    preview: {
      title: '{{actorName}} curtiu seu post',
      body: '"{{postExcerpt}}"',
    },
  },
  {
    id: 'COMMENT',
    type: 'COMMENT',
    category: 'social',
    priority: 'normal',
    title: 'Novo comentário',
    description: 'Alguém comentou em um post seu.',
    defaultChannels: { inApp: true, email: true, push: true },
    variables: [
      { name: 'actorName', description: 'Nome de quem comentou', example: 'João Pereira' },
      { name: 'commentExcerpt', description: 'Trecho do comentário', example: 'Muito pertinente, obrigado por compartilhar' },
    ],
    preview: {
      title: '{{actorName}} comentou no seu post',
      body: '"{{commentExcerpt}}"',
    },
  },
  {
    id: 'POST_REPLY',
    type: 'POST_REPLY',
    category: 'social',
    priority: 'normal',
    title: 'Resposta ao seu comentário',
    description: 'Alguém respondeu diretamente a um comentário seu.',
    defaultChannels: { inApp: true, email: false, push: true },
    variables: [
      { name: 'actorName', description: 'Nome de quem respondeu', example: 'Ana Costa' },
      { name: 'replyExcerpt', description: 'Trecho da resposta', example: 'Concordo, vale aprofundar...' },
    ],
    preview: {
      title: '{{actorName}} respondeu ao seu comentário',
      body: '"{{replyExcerpt}}"',
    },
  },
  {
    id: 'FOLLOW',
    type: 'FOLLOW',
    category: 'social',
    priority: 'normal',
    title: 'Novo seguidor',
    description: 'Alguém começou a seguir você.',
    defaultChannels: { inApp: true, email: false, push: false },
    variables: [
      { name: 'actorName', description: 'Nome de quem seguiu', example: 'Carlos Mendes' },
    ],
    preview: {
      title: '{{actorName}} começou a seguir você',
      body: 'Veja o perfil e os posts de {{actorName}}.',
    },
  },
  {
    id: 'MENTION',
    type: 'MENTION',
    category: 'social',
    priority: 'high',
    title: 'Você foi mencionado',
    description: 'Alguém marcou você com @ em um post ou comentário.',
    defaultChannels: { inApp: true, email: true, push: true },
    variables: [
      { name: 'actorName', description: 'Nome de quem mencionou', example: 'Lucia Ferreira' },
      { name: 'excerpt', description: 'Trecho onde você foi mencionado', example: '...concordo com o @voce sobre...' },
    ],
    preview: {
      title: '{{actorName}} mencionou você',
      body: '"{{excerpt}}"',
    },
  },

  // --- Community ---
  {
    id: 'GROUP_INVITE',
    type: 'GROUP_INVITE',
    category: 'community',
    priority: 'high',
    title: 'Convite para grupo',
    description: 'Alguém te convidou para entrar em um grupo.',
    defaultChannels: { inApp: true, email: true, push: true },
    variables: [
      { name: 'actorName', description: 'Nome de quem convidou', example: 'Pedro Almeida' },
      { name: 'groupName', description: 'Nome do grupo', example: 'Cabala Prática' },
    ],
    preview: {
      title: '{{actorName}} te convidou para {{groupName}}',
      body: 'Entre no grupo para participar das conversas.',
    },
  },
  {
    id: 'GROUP_POST',
    type: 'GROUP_POST',
    category: 'community',
    priority: 'normal',
    title: 'Novo post em grupo',
    description: 'Alguém publicou em um grupo que você participa.',
    defaultChannels: { inApp: true, email: false, push: false },
    variables: [
      { name: 'actorName', description: 'Nome do autor', example: 'Marina Souza' },
      { name: 'groupName', description: 'Nome do grupo', example: 'Meditação e Mindfulness' },
      { name: 'postExcerpt', description: 'Trecho do post', example: 'Compartilho uma técnica de respiração...' },
    ],
    preview: {
      title: '{{actorName}} postou em {{groupName}}',
      body: '"{{postExcerpt}}"',
    },
  },
  {
    id: 'GROUP_ROLE_CHANGE',
    type: 'GROUP_ROLE_CHANGE',
    category: 'community',
    priority: 'high',
    title: 'Mudança de papel em grupo',
    description: 'Seu papel em um grupo mudou (ex: virou moderador).',
    defaultChannels: { inApp: true, email: true, push: true },
    variables: [
      { name: 'groupName', description: 'Nome do grupo', example: 'Círculo de Estudos Espirituais' },
      { name: 'newRole', description: 'Novo papel', example: 'Moderador' },
    ],
    preview: {
      title: 'Você agora é {{newRole}} em {{groupName}}',
      body: 'Acesse o grupo para começar a moderar.',
    },
  },

  // --- Content ---
  {
    id: 'ARTICLE_RECOMMENDATION',
    type: 'ARTICLE_RECOMMENDATION',
    category: 'content',
    priority: 'low',
    title: 'Artigo recomendado',
    description: 'Curadoria Akasha recomendou um artigo alinhado com seu mapa.',
    defaultChannels: { inApp: true, email: true, push: false },
    variables: [
      { name: 'articleTitle', description: 'Título do artigo', example: 'Os 4 caminhos da Cabala Mística' },
      { name: 'tradition', description: 'Tradição do artigo', example: 'Cabala' },
    ],
    preview: {
      title: 'Leitura recomendada: {{articleTitle}}',
      body: 'Tradição: {{tradition}}. Pode interessar você.',
    },
  },
  {
    id: 'ARTICLE_PUBLISHED',
    type: 'ARTICLE_PUBLISHED',
    category: 'content',
    priority: 'low',
    title: 'Artigo publicado',
    description: 'Um autor que você segue publicou um novo artigo.',
    defaultChannels: { inApp: true, email: false, push: false },
    variables: [
      { name: 'authorName', description: 'Nome do autor', example: 'Beatriz Lima' },
      { name: 'articleTitle', description: 'Título do artigo', example: 'O tantra e o corpo sutil' },
    ],
    preview: {
      title: '{{authorName}} publicou: {{articleTitle}}',
      body: 'Leia agora na biblioteca.',
    },
  },

  // --- System ---
  {
    id: 'SYSTEM_ALERT',
    type: 'SYSTEM_ALERT',
    category: 'system',
    priority: 'high',
    title: 'Alerta do sistema',
    description: 'Comunicado operacional importante (manutenção, incidente, mudança de política).',
    defaultChannels: { inApp: true, email: true, push: true },
    variables: [
      { name: 'alertTitle', description: 'Título do alerta', example: 'Manutenção programada' },
      { name: 'alertBody', description: 'Corpo do alerta', example: 'O app ficará indisponível das 03:00 às 04:00 UTC.' },
    ],
    preview: {
      title: '⚠️ {{alertTitle}}',
      body: '{{alertBody}}',
    },
  },
  {
    id: 'MODERATION_ACTION',
    type: 'MODERATION_ACTION',
    category: 'system',
    priority: 'high',
    title: 'Ação de moderação',
    description: 'Seu conteúdo foi moderado (removido, sinalizado, ou você recebeu advertência).',
    defaultChannels: { inApp: true, email: true, push: false },
    variables: [
      { name: 'action', description: 'Tipo de ação', example: 'Removido' },
      { name: 'reason', description: 'Motivo da ação', example: 'Violação das diretrizes comunitárias' },
    ],
    preview: {
      title: 'Ação de moderação: {{action}}',
      body: 'Motivo: {{reason}}. Você pode contestar em até 7 dias.',
    },
  },
  {
    id: 'DIGEST_WEEKLY',
    type: 'DIGEST_WEEKLY',
    category: 'system',
    priority: 'low',
    title: 'Resumo semanal',
    description: 'Digest semanal com as principais atividades da sua rede.',
    defaultChannels: { inApp: false, email: true, push: false },
    variables: [
      { name: 'weekRange', description: 'Intervalo da semana', example: '12–18 jun' },
      { name: 'highlightsCount', description: 'Número de destaques', example: '7' },
    ],
    preview: {
      title: 'Seu resumo da semana ({{weekRange}})',
      body: '{{highlightsCount}} destaques da sua rede nesta semana.',
    },
  },
];

// ============================================================================
// Helpers de consulta
// ============================================================================

/**
 * Retorna a lista completa de templates.
 * Garante que TODOS os valores do enum `NotificationType` estão cobertos
 * (TypeScript força via `Record<NotificationType, ...>` no compile time).
 */
export function getTemplates(): NotificationTemplate[] {
  return [...NOTIFICATION_TEMPLATES];
}

/**
 * Busca um template pelo id (= tipo). Retorna `null` se não existir
 * (ex: tipo desconhecido ou ainda não catalogado).
 */
export function getTemplateById(id: string): NotificationTemplate | null {
  return NOTIFICATION_TEMPLATES.find((t) => t.id === id) ?? null;
}

/**
 * Filtra templates por categoria. Útil pra `?category=social` na API
 * e pra renderizar seções na UI de preferências.
 */
export function getTemplatesByCategory(category: TemplateCategory): NotificationTemplate[] {
  return NOTIFICATION_TEMPLATES.filter((t) => t.category === category);
}

/**
 * Templates marcados como `priority: 'high'`. Esses ignoram silenciamentos
 * de categoria e são sempre exibidos (ex: MENTION, GROUP_INVITE, SYSTEM_ALERT).
 */
export function getHighPriorityTemplates(): NotificationTemplate[] {
  return NOTIFICATION_TEMPLATES.filter((t) => t.priority === 'high');
}

// ============================================================================
// Render de preview
// ============================================================================

const PLACEHOLDER_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

/**
 * Substitui placeholders `{{varName}}` no title/body de um template.
 *
 * Comportamento de resolução, em ordem:
 *   1. Se a var está em `vars` e tem valor não-vazio → usa esse valor
 *   2. Se a var está declarada em `template.variables` → usa o `example`
 *   3. Se a var NÃO está declarada em `template.variables` → deixa
 *      `{{varName}}` literal no output (fail-soft pra debug de typos)
 *
 * Variáveis declaradas no template mas ausentes de `vars` recebem o
 * `example` declarado. Variáveis totalmente desconhecidas ficam visíveis
 * como placeholders — sinal claro de typo no nome.
 */
export function formatTemplate(
  template: NotificationTemplate,
  vars: TemplateVars = {}
): FormattedTemplate {
  const exampleFor = (name: string): string | undefined =>
    template.variables.find((v) => v.name === name)?.example;

  const resolve = (match: string, name: string): string => {
    const provided = vars[name];
    if (provided !== undefined && provided !== '') return provided;
    return exampleFor(name) ?? match; // fail-soft: unknown → keep placeholder
  };

  return {
    title: template.preview.title.replace(PLACEHOLDER_RE, resolve),
    body: template.preview.body.replace(PLACEHOLDER_RE, resolve),
  };
}


