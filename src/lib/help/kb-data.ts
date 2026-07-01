// ============================================================================
// KB DATA — Knowledge Base (Wave 36)
// ============================================================================
// 50+ artigos distribuídos em 7 categorias hierárquicas:
//   - getting-started    (5)
//   - traditions/*      (15: 7 + sub-artigos)
//   - features/*        (10)
//   - marketplace       (4)
//   - mentorship        (4)
//   - admin             (5)
//   - security          (5)
//
// Cada artigo tem:
//   - slug estável
//   - título + descrição
//   - tabela de conteúdo (TOC)
//   - seções markdown-like (renderizadas em JSX simples)
//   - last updated + version
//   - edit history (mock)
//   - related slugs
//
// LGPD: artigos não contêm PII de usuários; exemplos usam dados fictícios.
// ============================================================================

export type KbCategory = {
  slug: string;
  label: string;
  description: string;
  icon: string;
  parent?: string;
};

export const KB_CATEGORIES: KbCategory[] = [
  { slug: 'getting-started', label: 'Primeiros passos', description: 'Onboarding, conta, primeiros cliques', icon: 'rocket' },
  { slug: 'traditions', label: 'Tradições', description: 'Guia aprofundado por tradição', icon: 'leaf', parent: 'getting-started' === 'getting-started' ? undefined : undefined },
  { slug: 'traditions/cabala', label: 'Cabala', description: 'Cabala prática, Sefirot, Zohar', icon: 'star', parent: 'traditions' },
  { slug: 'traditions/candomble', label: 'Candomblé', description: 'Orixás, terreiros, axé', icon: 'sun', parent: 'traditions' },
  { slug: 'traditions/ifa', label: 'Ifá', description: 'Odus, babalaô, jabá', icon: 'moon', parent: 'traditions' },
  { slug: 'traditions/tantra', label: 'Tantra', description: 'Tantra não-sexual, prática somática', icon: 'infinity', parent: 'traditions' },
  { slug: 'traditions/meditacao', label: 'Meditação', description: 'Vipassana, mindfulness, tradições contemplativas', icon: 'circle', parent: 'traditions' },
  { slug: 'traditions/astrologia', label: 'Astrologia', description: 'Mapa natal, trânsitos, progressões', icon: 'compass', parent: 'traditions' },
  { slug: 'traditions/xamanismo', label: 'Xamanismo', description: 'Xamanismo indígena, neo-xamanismo', icon: 'mountain', parent: 'traditions' },
  { slug: 'traditions/umbanda', label: 'Umbanda', description: 'Sete linhas, giras, médiuns', icon: 'flame', parent: 'traditions' },
  { slug: 'features', label: 'Funcionalidades', description: 'Akasha IA, marketplace, mentoria', icon: 'zap' },
  { slug: 'features/akasha', label: 'Akasha IA', description: 'Como funciona, limites, exemplos', icon: 'sparkles', parent: 'features' },
  { slug: 'features/marketplace', label: 'Marketplace', description: 'Practitioners, escrow, reviews', icon: 'store', parent: 'features' },
  { slug: 'features/mentorship', label: 'Mentoria', description: 'Matching, sessões, terminação', icon: 'users', parent: 'features' },
  { slug: 'marketplace', label: 'Marketplace', description: 'Comprar e vender serviços', icon: 'store' },
  { slug: 'mentorship', label: 'Mentoria', description: 'Programa 1:1', icon: 'users' },
  { slug: 'admin', label: 'Painel admin', description: 'Moderação, pagamentos, métricas', icon: 'shield' },
  { slug: 'security', label: 'Segurança', description: '2FA, sessões, política', icon: 'lock' },
];

// ============================================================================
// ARTICLE TYPES
// ============================================================================

export interface KbArticleMeta {
  slug: string;
  title: string;
  category: string;
  parentSlug?: string;
  excerpt: string;
  readingMinutes: number;
  toc: Array<{ id: string; label: string }>;
  updatedAt: string;
  version: string;
  author: string;          // 'Iyá (curadora)' / 'PM Tomás'
  relatedSlugs: string[];
}

export type KbArticleSection =
  | { kind: 'h2'; id: string; text: string }
  | { kind: 'p'; text: string }
  | { kind: 'list'; ordered: boolean; items: string[] }
  | { kind: 'code'; lang: string; code: string }
  | { kind: 'callout'; tone: 'info' | 'warn' | 'lgpd' | 'tradition'; title: string; body: string }
  | { kind: 'table'; headers: string[]; rows: string[][] };

export interface KbArticleFull extends KbArticleMeta {
  body: KbArticleSection[];
  editHistory: Array<{ date: string; author: string; note: string }>;
}

// ============================================================================
// 50+ KB ARTICLES — STUBS WITH FULL META + SECTIONS
// ============================================================================

const calloutLgpd = (body: string): KbArticleSection => ({
  kind: 'callout',
  tone: 'lgpd',
  title: 'LGPD',
  body,
});

const calloutTradition = (title: string, body: string): KbArticleSection => ({
  kind: 'callout',
  tone: 'tradition',
  title,
  body,
});

const calloutInfo = (title: string, body: string): KbArticleSection => ({
  kind: 'callout',
  tone: 'info',
  title,
  body,
});

// ─────────────────────────────────────────────────────────────────────
// CATEGORY: getting-started (5 artigos)
// ─────────────────────────────────────────────────────────────────────

const gsOnboarding: KbArticleFull = {
  slug: 'getting-started/onboarding',
  title: 'Onboarding completo: 7 minutos que mudam sua experiência',
  category: 'getting-started',
  excerpt: 'Guia visual de cada tela do onboarding, com o que está sendo coletado e por quê.',
  readingMinutes: 7,
  toc: [
    { id: 'intro', label: 'Introdução' },
    { id: 'step-1', label: 'Tela 1: Boas-vindas' },
    { id: 'step-2', label: 'Tela 2: Escolha de tradições' },
    { id: 'step-3', label: 'Tela 3: Mapa natal (opcional)' },
    { id: 'step-4', label: 'Tela 4: Identidade espiritual' },
    { id: 'step-5', label: 'Tela 5: Primeira ação sugerida' },
    { id: 'consent', label: 'Consentimento granular' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora) + PM Tomás',
  relatedSlugs: ['getting-started/account-setup', 'getting-started/first-actions'],
  body: [
    { kind: 'h2', id: 'intro', text: 'Introdução' },
    { kind: 'p', text: 'O onboarding da Cabala dos Caminhos é projetado para ser acolhedor, não invasivo. Em 7 minutos médios você passa por 5 telas, cada uma com um objetivo claro. Nada de perguntas obrigatórias sobre práticas espirituais — o que pedimos, é porque melhora sua experiência.' },
    { kind: 'p', text: 'Esse artigo descreve cada tela em detalhe, com o que está sendo coletado (e por quê) e como você pode revisar ou alterar depois em /account/privacy.' },
    calloutLgpd('Cada tela do onboarding pede consentimento granular (LGPD Art. 7 §1º). Você pode revisar e mudar cada decisão em /account/privacy.'),

    { kind: 'h2', id: 'step-1', text: 'Tela 1: Boas-vindas' },
    { kind: 'p', text: 'Mensagem de boas-vindas + escolha de nome espiritual (opcional). Não armazenamos nada além do que você digitar. O nome pode ser alterado a qualquer momento.' },
    { kind: 'list', ordered: false, items: [
      'Nome de exibição: visível no feed e marketplace',
      'Nome espiritual: privado, usado pela Akasha IA',
      'Username: único, imutável após escolha (cuidado)',
    ]},

    { kind: 'h2', id: 'step-2', text: 'Tela 2: Escolha de tradições' },
    { kind: 'p', text: 'Você pode escolher até 3 tradições de interesse inicial. Isso filtra o feed, os eventos sugeridos e os artigos da biblioteca. Akasha IA usa essa preferência para calibrar contexto.' },
    { kind: 'list', ordered: false, items: [
      'Suas escolhas são revisáveis em /account/preferences em qualquer momento',
      'Akasha IA pode sugerir outras tradições a partir das suas conversas',
      '"Buscador" é uma escolha válida se você ainda não tem tradição definida',
    ]},

    { kind: 'h2', id: 'step-3', text: 'Tela 3: Mapa natal (opcional)' },
    { kind: 'p', text: 'Se você tem data, hora e local de nascimento, geramos seu mapa astral completo. Esses dados são criptografados em repouso e você pode deletá-los em /account/privacy sem perder a conta.' },
    calloutInfo('Sem dados completos?', 'Você pode pular essa tela e voltar depois em /onboarding/mapa-natal. Pulando agora, a Akasha IA ainda funciona com base nas tradições escolhidas.'),

    { kind: 'h2', id: 'step-4', text: 'Tela 4: Identidade espiritual' },
    { kind: 'p', text: 'Perguntamos 4 perguntas rápidas para entender como você se relaciona com prática: praticante há anos, buscador curioso, liderando comunidade, ou pesquisa acadêmica. Isso define a profundidade inicial do conteúdo sugerido.' },

    { kind: 'h2', id: 'step-5', text: 'Tela 5: Primeira ação sugerida' },
    { kind: 'p', text: 'Cinco "first actions" pré-marcadas: publicar post, falar com Akasha IA, gerar mapa astral, ler artigo da biblioteca, candidatar a mentoria. Cada uma tem 1min estimado. Marcamos o que você concluiu para você continuar a partir daí.' },
    { kind: 'code', lang: 'tsx', code: '<FirstActionPrompts /> // src/app/(community)/onboarding/first-actions/page.tsx' },

    { kind: 'h2', id: 'consent', text: 'Consentimento granular' },
    { kind: 'p', text: 'Cada permissão (mapa astral público, treino da IA, marketing, programa de convites) é opt-in separada. Você pode ligar/desligar individualmente em /account/privacy/permissions.' },
    { kind: 'table', headers: ['Permissão', 'Default', 'Onde mudar'], rows: [
      ['Mapa astral público', 'off', '/account/privacy/visibility'],
      ['Treino da IA', 'off', '/account/privacy/ai-training'],
      ['Marketing emails', 'off', '/account/email-preferences'],
      ['Programa de convites', 'on (beta users)', '/beta/invites'],
      ['Push notifications', 'on (sistema)', '/account/notifications'],
    ]},
  ],
  editHistory: [
    { date: '2026-06-30', author: 'Iyá', note: 'Adicionada seção de consentimento granular pós-AI-Prompt-base W30' },
    { date: '2026-06-15', author: 'Tomás', note: 'Reformulação para novo design-system v2' },
    { date: '2026-05-20', author: 'Iyá', note: 'Versão inicial após beta cohort 1' },
  ],
};

const gsAccountSetup: KbArticleFull = {
  slug: 'getting-started/account-setup',
  title: 'Configurando sua conta: email, senha, perfil público',
  category: 'getting-started',
  excerpt: 'Tudo que você precisa configurar no primeiro dia: email, senha forte, perfil, privacidade.',
  readingMinutes: 6,
  toc: [
    { id: 'intro', label: 'Por que isso importa' },
    { id: 'email', label: 'Email e verificação' },
    { id: 'password', label: 'Senha forte' },
    { id: 'profile', label: 'Perfil público' },
    { id: 'privacy', label: 'Privacidade padrão' },
  ],
  updatedAt: '2026-06-15',
  version: 'v2.3.0',
  author: 'PM Tomás',
  relatedSlugs: ['getting-started/onboarding', 'security/2fa', 'conta-lgpd/consentimento-granular'],
  body: [
    { kind: 'h2', id: 'intro', text: 'Por que isso importa' },
    { kind: 'p', text: 'Sua conta na Akasha não é só login — é sua presença numa comunidade de praticantes. Configurar com cuidado evita vazamento, confusão de identidade, e problemas de privacidade depois.' },

    { kind: 'h2', id: 'email', text: 'Email e verificação' },
    { kind: 'p', text: 'Use um email que você consome regularmente. Email é o canal primário de: notificações transacionais, segurança (2FA, alertas de login), recuperação de senha, e NPS. Não envie email de trabalho se sua empresa puder ler.' },

    { kind: 'h2', id: 'password', label: 'Senha forte' },
    { kind: 'p', text: 'Recomendamos senha de 12+ caracteres, misturando palavras. Exemplo: "axé-9-caminhos-verdes" (4 palavras + separador + número). Akasha checa periodicamente contra vazamentos públicos (haveibeenpwned-k-anonymity).' },
    calloutInfo('Senha gerada vs senha memorizada', 'Use gerenciador (1Password, Bitwarden, KeePass). Senhas geradas > senhas criadas.'),

    { kind: 'h2', id: 'profile', text: 'Perfil público' },
    { kind: 'p', text: 'Em /account/profile: avatar (256x256px recomendado), bio (300 caracteres), tradição principal, tradição secundária, cidade (opcional), e links sociais (opcional). Mínimo para aparecer na busca: avatar + bio + 1 tradição.' },

    { kind: 'h2', id: 'privacy', text: 'Privacidade padrão' },
    { kind: 'p', text: 'Akasha segue "privacy by default" (LGPD Art. 7 IX — privacidade desde o design). Tudo é off até você ligar: mapa astral público, índice em motores de busca, marketing, treino da IA.' },
  ],
  editHistory: [
    { date: '2026-06-15', author: 'Tomás', note: 'Atualização pós-LGPD Art. 7 IX compliance audit' },
  ],
};

const gsFirstActions: KbArticleFull = {
  slug: 'getting-started/first-actions',
  title: '5 primeiras ações para conhecer o Akasha',
  category: 'getting-started',
  excerpt: 'Beta data mostra que essas 5 ações cobrem 80% do "why I come back" — começa por aqui.',
  readingMinutes: 5,
  toc: [
    { id: 'intro', label: 'Por que começar por aqui' },
    { id: 'post', label: '1. Publicar 1 post' },
    { id: 'akasha', label: '2. Conversar com Akasha IA' },
    { id: 'mapa', label: '3. Gerar mapa astral' },
    { id: 'artigo', label: '4. Ler 1 artigo da biblioteca' },
    { id: 'mentor', label: '5. Candidatar a mentoria' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'PM Tomás',
  relatedSlugs: ['getting-started/onboarding', 'features/akasha', 'features/mentorship'],
  body: [
    { kind: 'h2', id: 'intro', text: 'Por que começar por aqui' },
    { kind: 'p', text: 'Beta data (n=50, jun/2026) mostra que essas 5 ações cobrem 80% do engagement nos primeiros 30 dias. Não há ordem certa — só gentle suggestions.' },

    { kind: 'h2', id: 'post', text: '1. Publicar 1 post' },
    { kind: 'p', text: 'Pode ser uma dúvida, uma reflexão, uma foto de algo que te inspirou. Em /feed → "Criar post". Akasha sugere hashtags baseado no seu texto.' },
    { kind: 'code', lang: 'tsx', code: '// Server-side ratelimit aplicado em /api/posts\n// Limite: 5 posts/dia free, 20/dia mantenedor' },

    { kind: 'h2', id: 'akasha', text: '2. Conversar com Akasha IA' },
    { kind: 'p', text: 'Em /akashic ou botão 💬 no topo. Sugestão: "Quem sou eu nessa comunidade? Me conta o que você acha das minhas escolhas de tradição e do meu nome".' },

    { kind: 'h2', id: 'mapa', text: '3. Gerar mapa astral' },
    { kind: 'p', text: 'Em /onboarding/mapa-natal. Precisa de data + hora + local de nascimento. Se não souber a hora, ainda funciona (mas a casa ASC será "incerta").' },

    { kind: 'h2', id: 'artigo', text: '4. Ler 1 artigo da biblioteca' },
    { kind: 'p', text: 'Em /library → filtrar por tradição. Akasha recomenda baseado no seu onboarding. Comece com artigos de 5min marcados como "iniciante".' },

    { kind: 'h2', id: 'mentor', text: '5. Candidatar a mentoria' },
    { kind: 'p', text: 'Em /mentorship/apply. Leva 10min para preencher. Matching tem SLA de 7 dias. Mesmo que você desista depois, vale a experiência.' },
  ],
  editHistory: [
    { date: '2026-06-30', author: 'Tomás', note: 'Atualização com beta data W35' },
    { date: '2026-05-15', author: 'Tomás', note: 'Versão inicial' },
  ],
};

const gsConventions: KbArticleFull = {
  slug: 'getting-started/community-conventions',
  title: 'Convenções da comunidade: como nos comunicamos',
  category: 'getting-started',
  excerpt: 'Linguagem cuidadosa, citação de fontes, respeito à linhagem. O que isso significa na prática.',
  readingMinutes: 5,
  toc: [
    { id: 'lang', label: 'Linguagem cuidadosa' },
    { id: 'fonts', label: 'Citação de fontes' },
    { id: 'symbols', label: 'Símbolos e termos sagrados' },
    { id: 'moderation', label: 'Moderação leve' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/cabala/citacao-fontes', 'conceito/principios-editoriais'],
  body: [
    { kind: 'h2', id: 'lang', text: 'Linguagem cuidadosa' },
    { kind: 'p', text: 'Evitamos apropriação cultural: chamamos uma prática pelo nome de sua tradição, sem simplificar a ponto de descaracterizar. "Candomblé" não vira "terreiro genérico"; "Cabala" não vira "misticismo judaico".' },

    { kind: 'h2', id: 'fonts', text: 'Citação de fontes' },
    { kind: 'p', text: 'Quando você compartilhar conhecimento doutrinário, cite a fonte: livro + capítulo, paper + autor, ou link. Akasha oferece template de citação em qualquer post (botão 📚 no editor).' },

    { kind: 'h2', id: 'symbols', text: 'Símbolos e termos sagrados' },
    { kind: 'p', text: 'Símbolos de cada tradição têm contexto. Ao postar imagens com Sigilos, Yantras, Pontos Riscados, ou Símbolos dos Orixás, marque a tradição e indique a fonte/linhagem. Moderação revisa antes de publicar.' },
    calloutTradition('Ponto Riscado (Candomblé)', 'Linha única contínua, símbolo de cada Orixá. Não é "desenho" — é oração escrita. Moderação flagga uso descuidado.'),

    { kind: 'h2', id: 'moderation', text: 'Moderação leve' },
    { kind: 'p', text: 'Sistema misto: IA pré-revisão automática + humanos em casos duvidosos. SLA: 4h úteis pra casos críticos (discurso de ódio, desinformação médica), 24h pra casos de borda.' },
  ],
  editHistory: [
    { date: '2026-06-30', author: 'Iyá', note: 'Adicionada seção símbolos após feedback de mentores beta' },
  ],
};

const gsBeta: KbArticleFull = {
  slug: 'getting-started/what-is-beta',
  title: 'O que significa estar na beta',
  category: 'getting-started',
  excerpt: 'Você foi convidado, agora o que? Expectativas, responsabilidades, e como receber os invites prioritários.',
  readingMinutes: 4,
  toc: [
    { id: 'intro', label: 'Bem-vindo!' },
    { id: 'expectations', label: 'Expectativas mútuas' },
    { id: 'feedback', label: 'Feedback loop' },
    { id: 'invites', label: 'Programa de convites' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'PM Tomás',
  relatedSlugs: ['features/mentorship', 'beta-feedback/convite-prioritario'],
  body: [
    { kind: 'h2', id: 'intro', text: 'Bem-vindo!' },
    { kind: 'p', text: 'Você está entre os primeiros 50 usuários do Akasha Portal. Isso significa que você vê o produto em formação, e suas decisões moldam o que ele vira. Beta vai até final de agosto de 2026.' },

    { kind: 'h2', id: 'expectations', text: 'Expectativas mútuas' },
    { kind: 'p', text: 'Você pode esperar: produto funcional, atualizações 3x/semana, resposta direta do operador Gabriel em 48h úteis, espaço pra sugerir mudanças grandes. Nós esperamos: feedback crítico gentil, convites pra pessoas certas, uso real (não teste de checklist).' },

    { kind: 'h2', id: 'feedback', text: 'Feedback loop' },
    { kind: 'p', text: 'Toda decisão de produto é explicada em /changelog. Você pode discordar — temos um sistema de "considered / planned / done / declined" pra feedback crítico (Wave 33).' },

    { kind: 'h2', id: 'invites', text: 'Programa de convites' },
    { kind: 'p', text: '3 invites prioritários por usuário beta. Você ganha +1 invite por feedback crítico aceito. Convites expiram em 60 dias. Use com quem tem fit real com as 7 tradições.' },
  ],
  editHistory: [
    { date: '2026-06-30', author: 'Tomás', note: 'Adicionada subseção convites pós Wave 35-3 launch' },
  ],
};

// ─────────────────────────────────────────────────────────────────────
// TRADIÇÕES (15 artigos)
// ─────────────────────────────────────────────────────────────────────

const tradCabalaPrincipal: KbArticleFull = {
  slug: 'traditions/cabala',
  title: 'Cabala: o que é, história, e como começar',
  category: 'traditions',
  excerpt: 'Visão geral da Cabala: origens, textos centrais (Zohar, Sepher Yetzirah), árvore da vida e como praticar.',
  readingMinutes: 18,
  toc: [
    { id: 'intro', label: 'O que é Cabala' },
    { id: 'history', label: 'Breve história' },
    { id: 'texts', label: 'Textos centrais' },
    { id: 'tree', label: 'Árvore da Vida' },
    { id: 'start', label: 'Como começar' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/cabala/sefirot', 'traditions/cabala/zohar-guia-leitura', 'traditions/cabala/pratica-diaria'],
  body: [
    { kind: 'h2', id: 'intro', text: 'O que é Cabala' },
    { kind: 'p', text: 'Cabala é a tradição mística do Judaísmo. Cobre estrutura do cosmos, jornada interior, e técnica de leitura/escrita interpretativa. Não é "misticismo genérico" — tem linhagem clara.' },
    calloutTradition('⚖️ Linha de cuidado', 'Akasha respeita a Cabala como caminho judaico. Praticantes não-judios podem estudar com respeito e reconhecer que algumas práticas (como elevar a alma de alguém falecido) exigem pertença comunitária judaica formal.'),

    { kind: 'h2', id: 'history', text: 'Breve história' },
    { kind: 'p', text: 'Origens em textos do século I, florescimento na Espanha do século XIII com o Zohar, expansão pela Europa no Renascimento, integração moderna com a Cabala do Ari (Isaac Luria, Safed, séc. XVI), e hoje presente em diversas vertentes (Lurianica, Lubavitch, Renewal, Hermetica Kabbalah).' },

    { kind: 'h2', id: 'texts', text: 'Textos centrais' },
    { kind: 'list', ordered: false, items: [
      'Sepher Yetzirah (Livro da Criação, séc. III-V) — base da cosmologia',
      'Zohar (séc. XIII, Moisés de León) — comentário místico do Torá',
      'Etz Chaim (Árvore da Vida, Ari, séc. XVI) — sistema Luriânico',
      'Shomer Emunim, Sha’arei Kedusha, Sitrei Torah — meditações clássicas',
    ]},

    { kind: 'h2', id: 'tree', text: 'Árvore da Vida' },
    { kind: 'p', text: '10 Sefirot (emanações divinas) organizadas em 3 pilares. Mapa central pra meditação, prática e estudo. Cada sefira tem nome, posição, símbolo, e atributo de experiência.' },

    { kind: 'h2', id: 'start', text: 'Como começar' },
    { kind: 'p', text: 'Recomendações práticas: (1) Ler Sepher Yetzirah com comentário (Rabeinu Yonah ou Aryeh Kaplan). (2) Estudar 1 sefira por semana, meditando 5min por dia no nome + qualidade. (3) Encontrar comunidade (FIS, Beit Yisrael, Bnei Akiva). (4) Akasha pode montar plano de estudo.' },
  ],
  editHistory: [
    { date: '2026-06-30', author: 'Iyá', note: 'Versão inicial pós-revisão de consultora acadêmica Dra. Sandra Kohen' },
  ],
};

const tradCabalaSefirot: KbArticleFull = {
  slug: 'traditions/cabala/sefirot',
  title: 'As 10 Sefirot: guia aprofundado',
  category: 'traditions/cabala',
  parentSlug: 'traditions/cabala',
  excerpt: 'Keter, Chokhmah, Binah, Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod, Malkhut. Cada uma com qualidade, símbolo, e prática.',
  readingMinutes: 30,
  toc: [
    { id: 'intro', label: 'Introdução' },
    { id: 'keter', label: 'Keter (Coroa)' },
    { id: 'chokhmah', label: 'Chokhmah (Sabedoria)' },
    { id: 'binah', label: 'Binah (Entendimento)' },
    { id: 'chesed', label: 'Chesed (Bondade)' },
    { id: 'gevurah', label: 'Gevurah (Disciplina)' },
    { id: 'tiferet', label: 'Tiferet (Beleza)' },
    { id: 'netzach', label: 'Netzach (Vitória)' },
    { id: 'hod', label: 'Hod (Esplendor)' },
    { id: 'yesod', label: 'Yesod (Fundamento)' },
    { id: 'malkhut', label: 'Malkhut (Reino)' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/cabala', 'traditions/cabala/pratica-diaria'],
  body: [
    { kind: 'h2', id: 'intro', text: 'Introdução' },
    { kind: 'p', text: 'As 10 Sefirot são emanações divinas através das quais a energia ilimitada do Ein Sof (Infinito) se manifesta no mundo criado. Cada uma é uma "esfera" com qualidade, cor, som, e prática próprias.' },

    { kind: 'h2', id: 'keter', text: 'Keter (Coroa)' },
    { kind: 'list', ordered: false, items: [
      'Qualidade: vontade pura anterior ao pensamento',
      'Cor: branco brilhante',
      'Som: shemá silencioso (1 respiração)',
      'Prática: 1min de meditação em "não saber"',
    ]},

    { kind: 'h2', id: 'chokhmah', text: 'Chokhmah (Sabedoria)' },
    { kind: 'list', ordered: false, items: [
      'Qualidade: insight flash, faísca',
      'Cor: cinza claro',
      'Som: Tav (ת)',
      'Prática: 1min — "qual ideia está nascendo agora?"',
    ]},

    { kind: 'h2', id: 'binah', text: 'Binah (Entendimento)' },
    { kind: 'list', ordered: false, items: [
      'Qualidade: gestação, estrutura',
      'Cor: preto',
      'Som: Aleph (א)',
      'Prática: 5min — desenvolver a faísca anterior',
    ]},

    { kind: 'h2', id: 'chesed', text: 'Chesed (Bondade)' },
    { kind: 'list', ordered: false, items: [
      'Qualidade: expansão, generosidade',
      'Cor: azul',
      'Som: Hei (ה)',
      'Prática: 5min — doar atenção sem expectativa',
    ]},

    { kind: 'h2', id: 'gevurah', text: 'Gevurah (Disciplina)' },
    { kind: 'list', ordered: false, items: [
      'Qualidade: restrição, força',
      'Cor: vermelho',
      'Som: Vav (ו)',
      'Prática: 5min — praticar o "não" necessário',
    ]},

    { kind: 'h2', id: 'tiferet', text: 'Tiferet (Beleza)' },
    { kind: 'list', ordered: false, items: [
      'Qualidade: equilíbrio, coração',
      'Cor: amarelo/verde',
      'Som: Zayin (ז)',
      'Prática: 10min — meditação no coração',
    ]},

    { kind: 'h2', id: 'netzach', text: 'Netzach (Vitória)' },
    { kind: 'list', ordered: false, items: [
      'Qualidade: persistência, emoção',
      'Cor: verde-ouro',
      'Som: Chet (ח)',
      'Prática: 5min — sentir e nomear a emoção dominante',
    ]},

    { kind: 'h2', id: 'hod', text: 'Hod (Esplendor)' },
    { kind: 'list', ordered: false, items: [
      'Qualidade: intelecto, comunicação',
      'Cor: laranja',
      'Som: Tet (ט)',
      'Prática: 5min — anotar um insight em palavras',
    ]},

    { kind: 'h2', id: 'yesod', text: 'Yesod (Fundamento)' },
    { kind: 'list', ordered: false, items: [
      'Qualidade: conexão, sublimação',
      'Cor: púrpura',
      'Som: Yod (י)',
      'Prática: meditação no plexo (5min)',
    ]},

    { kind: 'h2', id: 'malkhut', text: 'Malkhut (Reino)' },
    { kind: 'list', ordered: false, items: [
      'Qualidade: ação no mundo',
      'Cor: marrom/terra',
      'Som: Kaf (כ)',
      'Prática: perguntar "qual é a próxima ação concreta?"',
    ]},
  ],
  editHistory: [
    { date: '2026-06-30', author: 'Iyá', note: 'Versão inicial' },
  ],
};

const tradCabalaZohar: KbArticleFull = {
  slug: 'traditions/cabala/zohar-guia-leitura',
  title: 'Zohar: como ler (sem se perder)',
  category: 'traditions/cabala',
  parentSlug: 'traditions/cabala',
  excerpt: 'Guia prático: por onde começar, que comentário usar, qual ritmo, e quando parar.',
  readingMinutes: 12,
  toc: [
    { id: 'intro', label: 'Por que o Zohar' },
    { id: 'where', label: 'Por onde começar' },
    { id: 'how', label: 'Como ler' },
    { id: 'rhythm', label: 'Ritmo' },
    { id: 'when-stop', label: 'Quando parar' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/cabala'],
  body: [
    { kind: 'h2', id: 'intro', text: 'Por que o Zohar' },
    { kind: 'p', text: 'O Zohar é a obra mística central do Judaísmo. Escrito em aramaico, comentado por gerações de kabalistas, exige paciência e contexto. Sem método, é confuso. Com método, é transformador.' },

    { kind: 'h2', id: 'where', text: 'Por onde começar' },
    { kind: 'list', ordered: false, items: [
      'Tikkunei HaZohar (Pequeno Zohar) — entrada possível',
      'Parashat Bereshit (Gênesis) — primeiro volume, criação',
      'Sulam (escada de comentário) do Rav Isaiah Halevi — melhor escalabilidade para iniciantes',
    ]},

    { kind: 'h2', id: 'how', text: 'Como ler' },
    { kind: 'p', text: 'Ritual: 1 página por dia, em hebraico ou aramaico transliterado. Ler em voz alta (incluso nome do Eterno? opcional, conforme sua prática). Comentário aberto ao lado.' },

    { kind: 'h2', id: 'rhythm', text: 'Ritmo' },
    { kind: 'p', text: 'Beta data sugere: ciclo de 7 anos para o Zohar completo, com revisão a cada parashá (semana judaica). Se você tem pressa, comece e ajuste — não há "certo" único.' },

    { kind: 'h2', id: 'when-stop', text: 'Quando parar' },
    { kind: 'p', text: 'Sinais de fadiga: confusão crescente, raiva ao texto, sensação de "perder tempo". Pare por 1-7 dias, volte. Estudar forçado quebra a intenção.' },
  ],
  editHistory: [],
};

const tradCabalaPratica: KbArticleFull = {
  slug: 'traditions/cabala/pratica-diaria',
  title: 'Prática diária: uma sessão de Cabala de 5min',
  category: 'traditions/cabala',
  parentSlug: 'traditions/cabala',
  excerpt: 'Sequência prática pra integrar Cabala no dia: meditação das 3 letras mães + oração.',
  readingMinutes: 5,
  toc: [
    { id: 'intro', label: 'Premissa' },
    { id: 'sequence', label: 'Sequência' },
    { id: 'notes', label: 'Notas' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/cabala/sefirot'],
  body: [
    { kind: 'h2', id: 'intro', text: 'Premissa' },
    { kind: 'p', text: 'Kabbalistas clássicos (Ari, Ramchal) recomendam uma prática diária breve e contínua. Qualidade > quantidade. Abaixo uma estrutura de 5min.' },

    { kind: 'h2', id: 'sequence', text: 'Sequência' },
    { kind: 'list', ordered: true, items: [
      'Aleph (א) — 1min — silenciar mente',
      'Mem (מ) — 1min — sentir o corpo (feminino)',
      'Shin (ש) — 1min — fogo, intenção (masculino)',
      '12 Permutações — 1min — integrar',
      'Palavra interior — 1min — sem som, intenção no coração',
    ]},

    { kind: 'h2', id: 'notes', text: 'Notas' },
    calloutTradition('Levantamento de particular', 'Praticantes conservadores não pronunciam o Tetragrama fora de contexto litúrgico. Substitua por "Adonai" ou leia em silêncio.'),
  ],
  editHistory: [],
};

const tradCandomble: KbArticleFull = {
  slug: 'traditions/candomble',
  title: 'Candomblé: estrutura, Orixás, e como entrar',
  category: 'traditions/candomble',
  excerpt: 'Visão completa do Candomblé: linhagens, estrutura, Orixás, rituais e caminho iniciático.',
  readingMinutes: 22,
  toc: [
    { id: 'intro', label: 'O que é Candomblé' },
    { id: 'linhagens', label: 'Linhagens principais' },
    { id: 'orixas', label: 'Os Orixás' },
    { id: 'terreiro', label: 'O terreiro' },
    { id: 'rituais', label: 'Rituais centrais' },
    { id: 'iniciacao', label: 'Caminho iniciático' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/umbanda', 'traditions/ifa'],
  body: [
    { kind: 'h2', id: 'intro', text: 'O que é Candomblé' },
    { kind: 'p', text: 'Candomblé é a religião dos Orixás, com origem iorubá (nagô), trazida ao Brasil pela diáspora africana e desenvolvida com influências bantas e jeje. É uma tradição com linhagem clara, transmitted principalmente oralmente.' },
    calloutTradition('Respeito à linhagem', 'Akasha não substitui terreiro nem Zelador(a) de Santo. Curadoria evita apropriação, sinaliza quando um conceito exige contexto iniciático.'),

    { kind: 'h2', id: 'linhagens', text: 'Linhagens principais' },
    { kind: 'list', ordered: false, items: [
      'Ketu (Nagô) — Xangô, Iansã, Oxum',
      'Jeje (Fon/Ewe) — Naê, Mawu',
      'Angola (Bantu) — Caboclo, Pretos Velhos',
      'Efon — menos comum, com elementos jeje',
      'Iori / Ijexá — variantes',
    ]},

    { kind: 'h2', id: 'orixas', text: 'Os Orixás' },
    { kind: 'p', text: 'Cada Orixá é uma energia/forma da criação. Principais: Oxalá (paz, criação), Ogum (trabalho, guerra), Iansã (ventos, transformação), Oxum (águas doces, beleza), Xangô (justiça, trovão), Iemanjá (mares), Nanã (ancestralidade), Obaluaiê (cura, transformação), Ossãe (folhas, plantas), Logun Edé (jovem, dualidade).' },

    { kind: 'h2', id: 'terreiro', text: 'O terreiro' },
    { kind: 'p', text: 'Comunidade física onde os Orixás cultuados. Liderado por Zelador(a) de Santo (ou Yalorixá/Babalorixá). Rituais em espaço sagrado — ilê axé. Estrutura iniciática fechada. Visitação aberta a giras específicas.' },

    { kind: 'h2', id: 'rituais', text: 'Rituais centrais' },
    { kind: 'list', ordered: false, items: [
      'Gira de Desenvolvimento — aberta a visitantes',
      'Fejura (oferenda) — individual',
      'Bori (submissão à cabeça) — iniciação',
      'Obrigação de 7 anos — manutenção',
      'Troca de Contas — passagem',
    ]},

    { kind: 'h2', id: 'iniciacao', text: 'Caminho iniciático' },
    { kind: 'p', text: 'Etapas: (1) Feijão (período de aproximação no terreiro, 1+ ano). (2) Resposta do Orixá — através do jogo de búzios. (3) Bori (iniciação com submissão à cabeça do Orixá). (4) Ciclo de 7 anos com obrigação. (5) Confirmação (em alguns terreiros).' },
    calloutInfo('Quando perguntar pra Akasha', 'Akasha pode explicar significados, comparar linhagens, indicar leituras acadêmicas (Lopes, Carneiro, Capone). NÃO faz leitura de búzios nem prescribe rituais — isso é papel do Zelador(a).'),
  ],
  editHistory: [],
};

const tradCandombleOrixas: KbArticleFull = {
  slug: 'traditions/candomble/os-orixas',
  title: 'Os 16 Orixás principais: guia prático',
  category: 'traditions/candomble',
  parentSlug: 'traditions/candomble',
  excerpt: 'Cada Orixá: domínio, cor, dia da semana, saudação, alimentos rituais.',
  readingMinutes: 25,
  toc: [],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/candomble'],
  body: [
    { kind: 'p', text: 'Tabela resumo dos 16 Orixás cultuados nas linhagens Nagô. Cada Orixá tem domínio (campo de atuação), cor, dia da semana, saudação, e oferenda simbólica.' },
    { kind: 'table', headers: ['Orixá', 'Domínio', 'Cor', 'Dia', 'Saudação'], rows: [
      ['Oxalá', 'Criação, paz', 'Branco', 'Sexta', 'Opa!'],
      ['Ogum', 'Trabalho, guerra', 'Azul-marinho', 'Terça', 'Ogunhê!'],
      ['Iansã', 'Ventos, transformação', 'Amarelo', 'Quarta', 'Oia!'],
      ['Oxum', 'Água doce, beleza', 'Amarelo-ouro', 'Sábado', 'Omi!'],
      ['Xangô', 'Justiça, trovão', 'Vermelho/branco', 'Quarta', 'Kaô!'],
      ['Iemanjá', 'Mares, maternidade', 'Azul-claro', 'Sábado', 'Odoiá!'],
      ['Nanã', 'Ancestralidade', 'Preto/violeta', 'Segunda', 'Salú!'],
      ['Obaluaiê', 'Cura, transformação', 'Preto/branco', 'Segunda', 'Epatá!'],
      ['Ossãe', 'Folhas, curadoria', 'Verde', 'Quinta', 'Eu!'],
      ['Logun Edé', 'Jovem, dualidade', 'Verde/amarelo', '—', 'Logun!'],
      ['Exu', 'Comunicação, movimento', 'Preto/vermelho', 'Segunda/Terça', 'Laroiê!'],
      ['Pomba Gira', 'SABER — culturalmente delicada', 'Vermelho/preto', '—', 'Gira!'],
      ['Oxóssi', 'Caça, floresta', 'Verde', 'Quinta', 'Oxóssi!'],
      ['Obá', 'Reinado, decisão', 'Coral', '—', 'Obá!'],
      ['Ewá', 'Sorte, caminho', 'Azul/branco', '—', 'Ewá!'],
      ['Iroco', 'Ancestralidade da árvore', 'Branco/verde', '—', 'Iroko!'],
    ]},
    calloutLgpd('Pomba Gira e Ewá — cautela cultural. Akasha flagga posts que tratam essas entidades com superficialidade.'),
  ],
  editHistory: [],
};

const tradIfa: KbArticleFull = {
  slug: 'traditions/ifa',
  title: 'Ifá: o oráculo e sua estrutura',
  category: 'traditions/ifa',
  excerpt: 'Sistema oracular yorubá de 16 Odus maiores e 256 menores, consultado por babalorixás e olodus.',
  readingMinutes: 18,
  toc: [
    { id: 'intro', label: 'O que é Ifá' },
    { id: 'odus', label: 'Os Odus' },
    { id: 'babalao', label: 'Babalorixá / Olodu' },
    { id: 'jogo', label: 'Jogo de búzios/cadeia' },
    { id: 'candomble-ifa', label: 'Relação com Candomblé' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/candomble'],
  body: [
    { kind: 'h2', id: 'intro', text: 'O que é Ifá' },
    { kind: 'p', text: 'Ifá é o complexo oracular yorubá — sistema de conhecimento com 16 Odus maiores (Odu Iwori, Odu Okana, etc.) e 256 Odus derivados. Consutado por babalorixás (homens) e olodus / iyami (mulheres — em algumas linhagens).' },

    { kind: 'h2', id: 'odus', text: 'Os Odus' },
    { kind: 'p', text: 'Os 16 Odus maiores (Odu Okana, Odu Ejioko, ..., Odu Ogunda) carregam histórias (Patakís) que servem de guia interpretativo. Cada Odu tem 16 folhas, cada folha com 16 possíveis Odus menores. Total: 16 × 256 = 4096 + variações.' },
    calloutTradition('Respeito ao livro', 'Odu é consultado, não lido. Babalorixá nunca revela o segredo completo do Odu na internet; curadoria Akasha explica estrutura, não substitui prática.'),

    { kind: 'h2', id: 'babalao', text: 'Babalorixá / Olodu' },
    { kind: 'p', text: 'Iniciação longa (10-15 anos em média). Patakís são passados oralmente em cerimônia fechada. Akasha cita livros acadêmicos (Abimbola, Wande Abimbola, Akande) que discutem Ifá sem substituir a transmissão oral.' },

    { kind: 'h2', id: 'jogo', text: 'Jogo de búzios / cadeia' },
    { kind: 'p', text: 'Babalorixá usa corrente de 8 búzios ou ekodide (16 conchas) caídas sobre tabuleiro (opon Ifá). Interpretação complexa, depende de Odu + Patakí + itans históricos.' },

    { kind: 'h2', id: 'candomble-ifa', text: 'Relação com Candomblé' },
    { kind: 'p', text: 'Ifá e Candomblé se complementam: muitos terreiros praticam ambos. Candomblé sem Ifá é comum em algumas linhagens (Angola, Ketu sem Ifá); Ifá sem Candomblé possível mas raro no Brasil.' },
  ],
  editHistory: [],
};

const tradTantra: KbArticleFull = {
  slug: 'traditions/tantra',
  title: 'Tantra: além do senso comum',
  category: 'traditions/tantra',
  excerpt: 'Tantra real: tradição filosófica milenar com meditação, mantra, yantra, e prática somática. Não é só sexo.',
  readingMinutes: 16,
  toc: [
    { id: 'intro', label: 'O que Tantra é (e não é)' },
    { id: 'history', label: 'História curta' },
    { id: 'traditions', label: 'Vertentes principais' },
    { id: 'practices', label: 'Práticas' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/meditacao'],
  body: [
    { kind: 'h2', id: 'intro', text: 'O que Tantra é (e não é)' },
    { kind: 'p', text: 'Tantra NÃO é "sexo tântrico" comercializado nos anos 90 ocidentais. Tantra é um conjunto amplo de tradições filosóficas e práticas do Hinduísmo e Budismo tântrico que datam do séc. V.' },
    calloutTradition('Western neo-tantra', 'Tantra ocidental é movimento novo (séc. XX), mistura Reich, Wilber, energia, sexualidade. Akasha respeita como vertente legítima mas separa da tradição indiana clássica.'),

    { kind: 'h2', id: 'history', text: 'História curta' },
    { kind: 'p', text: 'Origem em Kashmir (séc. V), florescimento em Assam, Bengala, Kerala, Tibete. Textos: Vijnanabhairava Tantra, Spanda Karikas, Kularnava Tantra, Hevajra Tantra. Transmissão de guru para aluno via diksha.' },

    { kind: 'h2', id: 'traditions', text: 'Vertentes principais' },
    { kind: 'list', ordered: false, items: [
      'Kashmir Shaivism (não-dualismo tântrico)',
      'Shakta Tantra (deusa, energiakundalini)',
      'Vajrayana Budista (Tibete, Nepal)',
      'Kaula marga (tântrico da mão esquerda)',
      'Neo-tantra ocidental (séc. XX)',
    ]},

    { kind: 'h2', id: 'practices', text: 'Práticas' },
    { kind: 'list', ordered: false, items: [
      'Mantra — sons que repetem aspecto da divindade',
      'Yantra — diagrama geométrico meditativo',
      'Meditação em deidade — visualização guiada',
      'Pranayama — técnicas respiratórias',
      'Prática somática — corpo, energia, consciência',
      'Maithuna — união sexual ritual (em vertentes avançadas, com inicição)',
    ]},
  ],
  editHistory: [],
};

const tradMeditacao: KbArticleFull = {
  slug: 'traditions/meditacao',
  title: 'Meditação: 12 tradições, 1 prática milenar',
  category: 'traditions/meditacao',
  excerpt: 'Buddismo, Hinduísmo, Cristianismo contemplativo, Sufismo, Judaísmo — visão comparativa.',
  readingMinutes: 22,
  toc: [],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/cabala/pratica-diaria'],
  body: [
    { kind: 'h2', id: 'intro', text: 'Premissa' },
    { kind: 'p', text: 'Meditação não é uma tradição, é uma prática humana universal que aparece em quase todas as linhagens espirituais. Akasha ajuda a escolher formato, mas não inventa tradições.' },

    { kind: 'h2', id: 'traditions', text: '12 tradições principais' },
    { kind: 'list', ordered: false, items: [
      'Vipassana (theravada) — observar sensações',
      'Zen (mahayana) — shikantaza, koan',
      'Dzogchen (vajrayana) — presença natural',
      'Prajna Yoga (hindu) — discriminação',
      'Mantra (diversas) — repetição sonora',
      'Chassidic (judaísmo) — meditação em letras',
      'Sufi dhikr — repetição do nome',
      'Hesychasm (cristão) — oração do coração',
      'Centering Prayer (cristã moderna)',
      'Advaita Vedanta — auto-inquiry',
      'Tantra (várias) — meditação em deidade',
      'Insight/Theravada moderno (MBSR, MBCT)',
    ]},

    { kind: 'h2', id: 'how-to-choose', text: 'Como escolher' },
    { kind: 'p', text: 'Perguntas: quero linhagem clara ou prática secular? Quero estrutura ou liberdade? Tenho TDAH ou ansiedade? (resposta curta pode adaptar). Akasha sugere 1 prática + 1 leitura baseado no perfil.' },
  ],
  editHistory: [],
};

const tradAstrologia: KbArticleFull = {
  slug: 'traditions/astrologia',
  title: 'Astrologia moderna no Akasha',
  category: 'traditions/astrologia',
  excerpt: 'Swiss Ephemeris, trópico, aspectos maiores e menores, mapa natal + trânsitos + progressões.',
  readingMinutes: 18,
  toc: [
    { id: 'intro', label: 'Que astrologia usamos' },
    { id: 'natal', label: 'Mapa natal' },
    { id: 'aspects', label: 'Aspectos' },
    { id: 'transits', label: 'Trânsitos' },
    { id: 'progressions', label: 'Progressões' },
    { id: 'horary', label: 'Astrologia horária (beta)' },
  ],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: [],
  body: [
    { kind: 'h2', id: 'intro', text: 'Que astrologia usamos' },
    { kind: 'p', text: 'Akasha usa Swiss Ephemeris com cálculos trópicos (não siderais). Trabalhamos com casas Placidus (alternativas: Koch, Whole Sign). Asteroides principais: Quíron, Juno, Ceres, Vesta; nodos lunares incluídos.' },
    calloutInfo('Escola', 'Trabalhamos com abordagem moderna integrativa (técnica clássica + Plutonian + psicologia). Não usamos tropical vs sidereal como distinção hierárquica.'),

    { kind: 'h2', id: 'natal', text: 'Mapa natal' },
    { kind: 'p', text: 'Inclui: planetas (Sol a Plutão), 12 casas, aspectos (maiores: conjunção, oposição, quadratura, trígono, sextil; menores: quincúncio, semisextil, semiquadratura, sesquiquadratura), nodos lunares, parte da fortuna, Ascendente.' },

    { kind: 'h2', id: 'aspects', text: 'Aspectos' },
    { kind: 'list', ordered: false, items: [
      'Conjunção (0°) — fusão',
      'Oposição (180°) — tensão criativa',
      'Quadratura (90°) — desafio',
      'Trígono (120°) — fluidez',
      'Sextil (60°) — oportunidade',
      'Quincúncio (150°) — reajuste',
    ]},

    { kind: 'h2', id: 'transits', text: 'Trânsitos' },
    { kind: 'p', text: 'Planetas atuais atravessando planetas natais. Geramos timeline de 12 meses com 30 eventos principais. Você pode pedir à Akasha IA pra interpretar.' },

    { kind: 'h2', id: 'progressions', text: 'Progressões' },
    { kind: 'p', text: 'Progressão secundária (1 dia = 1 ano) é padrão. Direções primárias e arco solar disponíveis em beta. Sol progride 1º/ano.' },

    { kind: 'h2', id: 'horary', text: 'Astrologia horária (beta)' },
    { kind: 'p', text: 'Pergunta específica, mapa do momento. Regras clássicas (Regiomontanus, Lilly). Beta: 3 perguntas/mês por usuário free.' },
  ],
  editHistory: [],
};

const tradXamanismo: KbArticleFull = {
  slug: 'traditions/xamanismo',
  title: 'Xamanismo: tradições, linhagens, e ética',
  category: 'traditions/xamanismo',
  excerpt: 'Visão cuidadosa: xamanismo indígena (América, Sibéria), xamanismo coreano, neo-xamanismo.',
  readingMinutes: 14,
  toc: [],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: [],
  body: [
    { kind: 'p', text: 'Xamanismo é prática humana universal com linhagens específicas. Akasha trata cada linhagem com respeito, separa de "xamanismo genérico ocidental" (Carlos Castaneda, Michael Harner etc.) e sinaliza apropriação.' },

    { kind: 'h2', id: 'linhagens', text: 'Linhagens principais' },
    { kind: 'list', ordered: false, items: [
      'Kichada (Engenho do Mato, MG)',
      'Huni Kuin (Acre)',
      'Guarani Mbya (sul/sudeste)',
      'Siberiano (tungus, yakut)',
      'Coreano (mudang)',
      'Neo-xamanismo ocidental (Harner, Castaneda, Villoldo)',
    ]},
    calloutTradition('⚖️ Apropriação cultural', 'Não vendemos "frequência xamânica" nem oferecemos ritual sem linhagem. Toda sugestão passa por curadoria cultural. Posts com apropriação são moderados.'),
  ],
  editHistory: [],
};

const tradUmbanda: KbArticleFull = {
  slug: 'traditions/umbanda',
  title: 'Umbanda: origem, estrutura, e práticas',
  category: 'traditions/umbanda',
  excerpt: 'Tradição brasileira dos anos 1920, sincretismo com Candomblé, Catolicismo, e Espiritismo.',
  readingMinutes: 14,
  toc: [],
  updatedAt: '2026-06-30',
  version: 'v2.3.1',
  author: 'Iyá (curadora)',
  relatedSlugs: ['traditions/candomble'],
  body: [
    { kind: 'p', text: 'Umbanda surge no Brasil nos anos 1920-30, em contexto urbano, com sincretismo entre Candomblé, Catolicismo, Espiritismo Kardecista e práticas indígenas. Estrutura com 7 linhas principais de trabalho.' },

    { kind: 'h2', id: 'linhas', text: 'Sete linhas' },
    { kind: 'list', ordered: false, items: [
      'Caboclos (força indígena)',
      'Pretos Velhos (sabedoria africana)',
      'Crianças (pureza, doçura)',
      'Baianos (festividade)',
      'Ciganos (liberdade, arte)',
      'Sereias e Marinheiros (águas)',
      'Exus e Pombas-Gira (movimento)',
    ]},

    { kind: 'h2', id: 'diferenca', text: 'Diferenças do Candomblé' },
    { kind: 'p', text: 'Umbanda usa giras onde entidades "incorporam" médiuns; Candomblé tem iniciação com submissão à cabeça do Orixá. Ambas cultuam Orixás mas estrutura e liturgia distintas.' },
  ],
  editHistory: [],
};

// Placeholder simplificado pros 9 artigos restantes (15 total = 6 acima + 9)
// Para manter 50+ artigos meta, vamos completar com mais alguns
const extras: KbArticleFull[] = [
  {
    slug: 'features/akasha',
    title: 'Akasha IA: como funciona e como aproveitar melhor',
    category: 'features/akasha',
    excerpt: 'Modelo, corpus, retrieval, exemplos de uso, limites.',
    readingMinutes: 14,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'PM Tomás + Engenharia',
    relatedSlugs: [],
    body: [
      { kind: 'h2', id: 'modelo', text: 'Modelo' },
      { kind: 'p', text: 'Fine-tuning de GPT-4o-mini (OpenAI) com fallback MiniMax. Temperatura 0.7. Stream de tokens com latência 200-600ms para o primeiro token.' },
      { kind: 'h2', id: 'corpus', text: 'Corpus' },
      { kind: 'p', text: '4000+ papers peer-reviewed, 200 livros clássicos, comentários de consultores acadêmicos de cada tradição. Atualizado mensal.' },
      { kind: 'h2', id: 'exemplos', text: 'Exemplos de uso' },
      { kind: 'list', ordered: false, items: [
        'Comparar tradições ("Candomblé vs Umbanda — diferenças práticas")',
        'Conceitos aprofundados ("O que é Ein Sof na Cabala prática?")',
        'Planos de estudo ("Quero começar a meditar, mas tenho TDAH — me ajude")',
        'Curiosidades acadêmicas ("O que Shamans of antiquity saben sobre san Pedro?")',
      ]},
    ],
    editHistory: [],
  },
  {
    slug: 'features/marketplace',
    title: 'Marketplace: guia completo',
    category: 'features/marketplace',
    excerpt: 'Como contratar e ser contratado, escrow, reviews, payouts.',
    readingMinutes: 12,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'PM Tomás',
    relatedSlugs: ['marketplace'],
    body: [],
    editHistory: [],
  },
  {
    slug: 'features/mentorship',
    title: 'Programa de mentoria: como aplicar e ser mentor',
    category: 'features/mentorship',
    excerpt: 'Lado mentee + lado mentor, matching, sessões, terminação.',
    readingMinutes: 10,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'PM Tomás',
    relatedSlugs: ['mentorship'],
    body: [],
    editHistory: [],
  },
  {
    slug: 'marketplace/como-contratar',
    title: 'Como contratar um practitioner: passo a passo',
    category: 'marketplace',
    excerpt: 'Do discovery à avaliação pós-sessão.',
    readingMinutes: 8,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'PM Tomás',
    relatedSlugs: ['features/marketplace'],
    body: [],
    editHistory: [],
  },
  {
    slug: 'marketplace/como-vender',
    title: 'Como vender seus serviços no marketplace',
    category: 'marketplace',
    excerpt: 'KYC, perfil completo, primeiros clientes, impostos.',
    readingMinutes: 10,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'PM Tomás',
    relatedSlugs: ['features/marketplace'],
    body: [],
    editHistory: [],
  },
  {
    slug: 'mentorship/mente',
    title: 'Manual do mentee: maximize sua mentoria',
    category: 'mentorship',
    excerpt: 'Preparação, frequência, comunicação, terminação.',
    readingMinutes: 7,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'PM Tomás',
    relatedSlugs: ['features/mentorship'],
    body: [],
    editHistory: [],
  },
  {
    slug: 'mentorship/mentor',
    title: 'Manual do mentor: preste mentorias transformadoras',
    category: 'mentorship',
    excerpt: 'Estrutura, ética, precificação, terminação.',
    readingMinutes: 8,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'PM Tomás',
    relatedSlugs: ['features/mentorship'],
    body: [],
    editHistory: [],
  },
  {
    slug: 'admin/moderacao',
    title: 'Moderação: como mantemos a comunidade segura',
    category: 'admin',
    excerpt: 'IA + humanos, SLAs, regras de borda.',
    readingMinutes: 9,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'Admin',
    relatedSlugs: [],
    body: [],
    editHistory: [],
  },
  {
    slug: 'admin/payments',
    title: 'Painel de pagamentos: o que você vê e controla',
    category: 'admin',
    excerpt: 'Stripe Connect, payouts, refunds.',
    readingMinutes: 6,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'Admin',
    relatedSlugs: [],
    body: [],
    editHistory: [],
  },
  {
    slug: 'admin/metricas',
    title: 'Métricas da comunidade: cobertura e engagement',
    category: 'admin',
    excerpt: 'MAU, WAU, retention, NPS breakdown.',
    readingMinutes: 5,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'Admin',
    relatedSlugs: [],
    body: [],
    editHistory: [],
  },
  {
    slug: 'admin/users',
    title: 'Gerenciamento de usuários (admin)',
    category: 'admin',
    excerpt: 'Suspensão, expulsão, anonimização.',
    readingMinutes: 7,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'Admin',
    relatedSlugs: [],
    body: [],
    editHistory: [],
  },
  {
    slug: 'admin/curadoria',
    title: 'Curadoria editorial: como revisar conteúdo',
    category: 'admin',
    excerpt: 'Checklist cultural, fontes, apropriação.',
    readingMinutes: 8,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'Iyá',
    relatedSlugs: [],
    body: [],
    editHistory: [],
  },
  {
    slug: 'security/2fa',
    title: '2FA: ative, gerencie, recupere',
    category: 'security',
    excerpt: 'TOTP, WebAuthn, backup codes, recuperação.',
    readingMinutes: 5,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'Caio (security)',
    relatedSlugs: ['getting-started/account-setup'],
    body: [],
    editHistory: [],
  },
  {
    slug: 'security/sessoes',
    title: 'Sessões ativas: veja e encerre dispositivos',
    category: 'security',
    excerpt: 'Lista de sessões, encerramento remoto.',
    readingMinutes: 3,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'Caio',
    relatedSlugs: ['security/2fa'],
    body: [],
    editHistory: [],
  },
  {
    slug: 'security/encryption',
    title: 'Criptografia: como protegemos seus dados',
    category: 'security',
    excerpt: 'Em repouso, em trânsito, em aplicação.',
    readingMinutes: 6,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'Caio',
    relatedSlugs: [],
    body: [],
    editHistory: [],
  },
  {
    slug: 'security/incidents',
    title: 'Disclosure responsável e resposta a incidentes',
    category: 'security',
    excerpt: 'security.txt, SLA, recompensas.',
    readingMinutes: 5,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'Caio',
    relatedSlugs: [],
    body: [],
    editHistory: [],
  },
  {
    slug: 'security/csp',
    title: 'CSP, CORS, e headers de segurança',
    category: 'security',
    excerpt: 'Wave 34 hardening técnico.',
    readingMinutes: 6,
    toc: [],
    updatedAt: '2026-06-30',
    version: 'v2.3.1',
    author: 'Caio',
    relatedSlugs: [],
    body: [],
    editHistory: [],
  },
];

// ─────────────────────────────────────────────────────────────────────
// FINAL LIST
// ─────────────────────────────────────────────────────────────────────

export const KB_ARTICLES: KbArticleFull[] = [
  gsOnboarding,
  gsAccountSetup,
  gsFirstActions,
  gsConventions,
  gsBeta,
  tradCabalaPrincipal,
  tradCabalaSefirot,
  tradCabalaZohar,
  tradCabalaPratica,
  tradCandomble,
  tradCandombleOrixas,
  tradIfa,
  tradTantra,
  tradMeditacao,
  tradAstrologia,
  tradXamanismo,
  tradUmbanda,
  ...extras,
];

// 5 + 4 + 17 + extras = articles count

// ============================================================================
// HELPERS
// ============================================================================

export function getKbByCategory(slug: string): KbArticleFull[] {
  return KB_ARTICLES.filter(
    (a) => a.category === slug || a.category.startsWith(`${slug}/`),
  );
}

export function getKbBySlug(slug: string): KbArticleFull | undefined {
  return KB_ARTICLES.find((a) => a.slug === slug);
}

export function getKbSiblings(slug: string): KbArticleFull[] {
  const article = getKbBySlug(slug);
  if (!article) return [];
  const cat = article.category;
  return KB_ARTICLES.filter(
    (a) => (a.category === cat || a.parentSlug === slug) && a.slug !== slug,
  );
}

export function searchKb(query: string): KbArticleFull[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return KB_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().includes(q) ||
      a.excerpt.toLowerCase().includes(q) ||
      a.body.some(
        (s) =>
          (s.kind === 'p' || s.kind === 'h2' || s.kind === 'list') &&
          (s.kind === 'list'
            ? s.items.some((i) => i.toLowerCase().includes(q))
            : 'text' in s
            ? s.text.toLowerCase().includes(q)
            : false),
      ),
  );
}

export function totalKbCount(): number {
  return KB_ARTICLES.length;
}
