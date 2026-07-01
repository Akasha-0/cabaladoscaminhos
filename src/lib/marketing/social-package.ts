// ============================================================================
// SOCIAL MEDIA PACKAGE — 7 platforms (Wave 37, 2026-07-01)
// ============================================================================
// Conteúdo pronto para publicar em:
//   - Twitter/X (12 tweets)
//   - Instagram (10 slides)
//   - LinkedIn (long-form post)
//   - Facebook (post)
//   - YouTube Community (post)
//   - TikTok (video script)
//   - Threads (Meta) (post)
//
// Brand voice: acolhedor, curioso, respeitoso, claro. PT-BR.
// Não proselitizante. Não ofensivo a nenhuma tradição.
// ============================================================================

export interface SocialPost {
  platform: 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'youtube' | 'tiktok' | 'threads';
  content: string;
  hashtags: string[];
  mediaUrls: string[];
  scheduledFor?: string; // ISO datetime
  ctaUrl?: string;
}

// ============================================================================
// TWITTER / X — Thread de 12 tweets
// ============================================================================

export const TWITTER_THREAD: SocialPost[] = [
  {
    platform: 'twitter',
    content: '1/12 🧵\n\nA espiritualidade brasileira é múltipla.\n\nCabala e Candomblé. Tantra e Vipassana. Terreiro e universidade.\n\nSão linguagens diferentes da mesma busca. E hoje abrimos um espaço onde elas se encontram com respeito.\n\nConheça Akasha Portal ↓',
    hashtags: ['#AkashaPortal', '#EspiritualidadeUniversalista'],
    mediaUrls: ['https://akashaportal.com.br/og-launch.png'],
    ctaUrl: 'https://akashaportal.com.br/launch',
  },
  {
    platform: 'twitter',
    content: '2/12\n\nO que é Akasha Portal?\n\n• Comunidade online de espiritualidade\n• IA curadora que traduz entre tradições\n• 7 caminhos: Cabala, Ifá, Tantra, Umbanda, Xamanismo, Ayurveda, Meditação\n• Sem hierarquia. Sem proselitismo.',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'twitter',
    content: '3/12\n\nPor que uma IA?\n\nPorque o mundo acumulou conhecimento demais para qualquer ser humano guardar sozinho.\n\nAkasha aprende com:\n→ Livros das tradições (Cabala, Ifá, Tantra...)\n→ Papers peer-reviewed de neurociência\n→ Conversas da própria comunidade',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'twitter',
    content: '4/12\n\nMas Akasha NÃO:\n\n❌ Prescreve práticas\n❌ Faz previsões\n❌ Substitui terapeutas humanos\n❌ Diz "este é o caminho certo"\n\nEla SUGERE leituras, CONECTA conceitos, CITA fontes com origem.',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'twitter',
    content: '5/12\n\nExemplo real:\n\n"Pode me explicar o que é meditação Vipassana?"\n\nAkasha responde:\n→ Origem: Budismo Theravada, ~2.500 anos\n→ Prática: observação dos fenômenos corporais e mentais\n→ Pesquisa: Brewer et al. (Yale, 2011) — DMN reduction\n→ Correlação: práticas ocidentais de mindfulness',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'twitter',
    content: '6/12\n\nOutro exemplo:\n\n"O que é Odu de Ifá?"\n\nAkasha responde citando os 16 Odus principais (Oyeku, Iwonrin, Ogunda, etc), explica o jogo de búzios, e conecta com a tradição Iorubá — sem inventar, sem misturar com Cabala de forma forçada.',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'twitter',
    content: '7/12\n\nA beta fechou com 50 pessoas.\n\nMétricas:\n• NPS = 62 (excelente)\n• D7 retention = 71%\n• 89% das respostas da Akasha citam fontes\n• 0 incidentes de toxicidade em 5 meses',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'twitter',
    content: '8/12\n\nO que a comunidade está dizendo (anonimizado):\n\n"Pela primeira vez encontrei um espaço onde posso falar de Cabala e Candomblé sem que ninguém me diga que são coisas incompatíveis. Akasha entende as duas."\n\n— Beta tester, 38, SP',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'twitter',
    content: '9/12\n\nPricing:\n\n🆓 Comunitário (free)\n→ Leitura + 5 conversas/mês com Akasha\n→ Biblioteca básica\n\n💎 Pro (R$29/mês)\n→ Conversas ilimitadas\n→ Biblioteca completa (150+ artigos)\n→ Mentoria com curadores',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'twitter',
    content: '10/12\n\nLGPD-compliant desde o dia 1.\n\n→ DPO designado\n→ Base legal explícita por coleta\n→ Direito de exclusão a qualquer momento\n→ Dados hospedados em data centers no Brasil\n\nPrivacidade não é feature. É fundação.',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'twitter',
    content: '11/12\n\nPor que isso importa agora?\n\nPorque o Brasil tem a maior comunidade afro-brasileira do mundo, terreiros abertos, praticantes de Cabala e Tantra, meditadores Vipassana — e nenhum espaço digital que acolha todos com o mesmo respeito.\n\nAté hoje.',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'twitter',
    content: '12/12\n\n🔗 akashaportal.com.br/launch\n\nAberta ao público a partir de hoje.\n\nBeta gratuita. Sem paywall na comunidade. Universalista.\n\nVamos caminhar juntos?\n\n#AkashaPortal #Espiritualidade #IA',
    hashtags: ['#AkashaPortal', '#Espiritualidade', '#IA'],
    mediaUrls: [],
    ctaUrl: 'https://akashaportal.com.br/launch',
  },
];

// ============================================================================
// INSTAGRAM — Carousel de 10 slides
// ============================================================================

export const INSTAGRAM_CAROUSEL: SocialPost[] = [
  {
    platform: 'instagram',
    content: '🌌 Akasha Portal está aberta.\n\nOnde tradições se encontram com a ciência.\n\n7 caminhos. 1 espaço. Sem hierarquia.\n\n→ Cadastre-se: link na bio',
    hashtags: ['#AkashaPortal', '#Espiritualidade', '#Cabala', '#Ifa', '#Tantra', '#Umbanda', '#Xamanismo', '#Meditação', '#IA'],
    mediaUrls: [],
    ctaUrl: 'https://akashaportal.com.br/launch',
  },
  {
    platform: 'instagram',
    content: 'O que é Akasha Portal?\n\nUma comunidade online de espiritualidade universalista com IA curadora.\n\nPratique Cabala, Ifá, Tantra, Umbanda, Xamanismo, Ayurveda e Meditação em um só espaço.',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'instagram',
    content: 'Por que "universalista"?\n\nPorque a espiritualidade brasileira é múltipla.\n\nTerreiro de Umbanda + mesa de Cabala + roda de Ifá + prática de Tantra = linguagens diferentes da MESMA busca.\n\nAqui, todas têm lugar de fala.',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'instagram',
    content: 'O que Akasha IA faz?\n\n✓ Sugere leituras\n✓ Conecta conceitos entre tradições\n✓ Cita fontes com origem\n\nO que ela NÃO faz:\n✗ Prescreve práticas\n✗ Faz previsões\n✗ Substitui terapeutas',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'instagram',
    content: 'Akasha aprende com:\n\n📚 Livros das tradições (Cabala, Ifá, Tantra, Umbanda...)\n🔬 Papers peer-reviewed de neurociência e psicologia\n💬 Conversas da própria comunidade\n\nCo-evolução real, não metáfora.',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'instagram',
    content: 'Exemplo:\n\n"Pode me explicar o que é Odu de Ifá?"\n\nAkasha cita os 16 Odus, explica o jogo de búzios, conecta com a tradição Iorubá — sem inventar, sem misturar com Cabala de forma forçada.',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'instagram',
    content: 'Beta em números (junho/2026):\n\n👥 50 beta testers ativos\n⭐ NPS = 62\n📊 D7 retention = 71%\n📚 150+ artigos curados\n🔗 89% respostas com citação de fonte\n🚫 0 incidentes de toxicidade em 5 meses',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'instagram',
    content: 'O que a comunidade diz:\n\n"Pela primeira vez encontrei um espaço onde posso falar de Cabala e Candomblé sem que ninguém me diga que são coisas incompatíveis. Akasha entende as duas."\n\n— Beta tester, 38, SP',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'instagram',
    content: 'Planos:\n\n🆓 Comunitário (free)\n→ Leitura + 5 conversas/mês com Akasha\n→ Biblioteca básica\n\n💎 Pro (R$29/mês)\n→ Conversas ilimitadas\n→ Biblioteca completa\n→ Mentoria com curadores',
    hashtags: [],
    mediaUrls: [],
  },
  {
    platform: 'instagram',
    content: '🔗 akashaportal.com.br/launch\n\nBeta gratuita. Sem paywall na comunidade. LGPD-compliant.\n\nVamos caminhar juntos?\n\n#AkashaPortal #Espiritualidade #IA #Cabala #Ifa #Tantra #Umbanda #Xamanismo #Meditação',
    hashtags: ['#AkashaPortal', '#Espiritualidade', '#IA'],
    mediaUrls: [],
    ctaUrl: 'https://akashaportal.com.br/launch',
  },
];

// ============================================================================
// LINKEDIN — Post long-form
// ============================================================================

export const LINKEDIN_POST: SocialPost = {
  platform: 'linkedin',
  content: `Acabamos de abrir Akasha Portal ao público.

É uma comunidade online de espiritualidade universalista assistida por IA — algo que eu procurava há anos e não encontrei em nenhum lugar.

O problema que ela resolve:

A espiritualidade brasileira é múltipla. Praticamos Cabala e Candomblé. Estudamos Tantra e Vipassana. Frequentamos terreiro e lemos papers de neurociência. Mas a maioria dos espaços digitais nos força a escolher um caminho — ou nos julga por misturar.

Akasha Portal foi construída com a tese de que **não existe hierarquia entre tradições**. Cabala não é "mais elevada" que Candomblé. Ciência não contradiz espiritualidade — complementa.

A IA curadora (Akasha) aprende com livros das tradições, papers peer-reviewed e conversas da comunidade. Sua função é sugerir leituras, conectar conceitos, citar fontes com origem. Nunca prescrever, fazer previsões ou substituir terapeutas humanos.

Beta em 5 meses, 50 usuários ativos, NPS 62, D7 retention 71%, 0 incidentes de toxicidade.

A comunidade sempre será gratuita. O plano Pro (R$29/mês) apoia quem pratica com profundidade.

LGPD-compliant desde o dia 1: DPO designado, base legal explícita por coleta, dados em data centers no Brasil.

Se você trabalha com espiritualidade, antropologia da religião, IA ética ou comunidades digitais — adoraria trocar ideias.

🔗 akashaportal.com.br/launch

#IA #Espiritualidade #Comunidade #LGPD #ProductManagement`,
  hashtags: ['#IA', '#Espiritualidade', '#Comunidade', '#LGPD', '#ProductManagement'],
  mediaUrls: ['https://akashaportal.com.br/og-launch.png'],
  ctaUrl: 'https://akashaportal.com.br/launch',
};

// ============================================================================
// FACEBOOK
// ============================================================================

export const FACEBOOK_POST: SocialPost = {
  platform: 'facebook',
  content: `🌌 Akasha Portal está no ar.

Uma comunidade online onde você pode praticar Cabala, Ifá, Tantra, Umbanda, Xamanismo, Ayurveda e Meditação — em um só espaço, sem hierarquia entre caminhos.

A IA curadora Akasha cita fontes das tradições, conecta com papers de neurociência, e ajuda na sua reflexão — sem prescrever, sem julgar.

✅ Beta gratuita
✅ LGPD-compliant
✅ 50 pessoas já dentro (NPS 62, D7 71%)

🔗 akashaportal.com.br/launch

Vamos caminhar juntos?`,
  hashtags: [],
  mediaUrls: ['https://akashaportal.com.br/og-launch.png'],
  ctaUrl: 'https://akashaportal.com.br/launch',
};

// ============================================================================
// YOUTUBE COMMUNITY
// ============================================================================

export const YOUTUBE_COMMUNITY_POST: SocialPost = {
  platform: 'youtube',
  content: `🎬 Novo vídeo em breve: "Por que criei Akasha Portal" — founder story.

Enquanto isso, a plataforma já está aberta para cadastro:

🔗 akashaportal.com.br/launch

O que é:
→ Comunidade de espiritualidade universalista
→ IA curadora que traduz entre 7 tradições
→ Sem hierarquia entre caminhos
→ LGPD-compliant

Inscritos no canal serão os primeiros a saber do lançamento oficial. 🚀`,
  hashtags: [],
  mediaUrls: [],
  ctaUrl: 'https://akashaportal.com.br/launch',
};

// ============================================================================
// TIKTOK — Video script (60s)
// ============================================================================

export const TIKTOK_SCRIPT: SocialPost = {
  platform: 'tiktok',
  content: `[0-5s] HOOK
Você já sentiu que precisa escolher entre espiritualidade e ciência?

[5-15s] PROBLEMA
No Brasil, a gente pratica Cabala E Candomblé. Tantra E Vipassana. Terreiro E universidade. Mas todos os apps de espiritualidade nos forçam a escolher um caminho.

[15-35s] SOLUÇÃO
Por isso criamos Akasha Portal. Uma comunidade onde você pratica os 7 caminhos — Cabala, Ifá, Tantra, Umbanda, Xamanismo, Ayurveda, Meditação — em um só espaço. E tem uma IA que cita fontes de cada tradição sem inventar, sem julgar.

[35-50s] PROVA
5 meses de beta. 50 pessoas. NPS 62. D7 retention 71%. Zero toxicidade.

[50-60s] CTA
Link na bio. Beta gratuita. LGPD-compliant. Vamos caminhar juntos?`,
  hashtags: ['#AkashaPortal', '#Espiritualidade', '#Cabala', '#Ifa', '#Tantra', '#Umbanda', '#IA', '#Meditação'],
  mediaUrls: [],
  ctaUrl: 'https://akashaportal.com.br/launch',
};

// ============================================================================
// THREADS (META)
// ============================================================================

export const THREADS_POST: SocialPost = {
  platform: 'threads',
  content: `🌌 Akasha Portal está no ar.

Comunidade online de espiritualidade universalista com IA curadora.

7 tradições em 1 espaço. Sem hierarquia. Sem proselitismo.

Cabala + Ifá + Tantra + Umbanda + Xamanismo + Ayurveda + Meditação.

A IA cita fontes das tradições e conecta com ciência. Não prescreve. Não faz previsões. Não substitui terapeutas.

🔗 akashaportal.com.br/launch

Beta gratuita. LGPD-compliant. 50 pessoas já dentro.

Vamos caminhar juntos?`,
  hashtags: ['#AkashaPortal', '#Espiritualidade'],
  mediaUrls: [],
  ctaUrl: 'https://akashaportal.com.br/launch',
};

// ============================================================================
// Aggregate export
// ============================================================================

export const SOCIAL_PACKAGE = {
  twitter: TWITTER_THREAD,
  instagram: INSTAGRAM_CAROUSEL,
  linkedin: LINKEDIN_POST,
  facebook: FACEBOOK_POST,
  youtube: YOUTUBE_COMMUNITY_POST,
  tiktok: TIKTOK_SCRIPT,
  threads: THREADS_POST,
};

// ============================================================================
// Helpers — get content for platform
// ============================================================================

export function getSocialPostsForPlatform(platform: SocialPost['platform']): SocialPost[] | SocialPost {
  switch (platform) {
    case 'twitter':
      return TWITTER_THREAD;
    case 'instagram':
      return INSTAGRAM_CAROUSEL;
    case 'linkedin':
      return LINKEDIN_POST;
    case 'facebook':
      return FACEBOOK_POST;
    case 'youtube':
      return YOUTUBE_COMMUNITY_POST;
    case 'tiktok':
      return TIKTOK_SCRIPT;
    case 'threads':
      return THREADS_POST;
  }
}

export function getAllSocialPosts(): SocialPost[] {
  return [
    ...TWITTER_THREAD,
    ...INSTAGRAM_CAROUSEL,
    LINKEDIN_POST,
    FACEBOOK_POST,
    YOUTUBE_COMMUNITY_POST,
    TIKTOK_SCRIPT,
    THREADS_POST,
  ];
}

// ============================================================================
// Character count helpers (validation)
// ============================================================================

export const SOCIAL_PLATFORM_LIMITS: Record<SocialPost['platform'], number> = {
  twitter: 280, // per tweet
  instagram: 2200, // caption
  linkedin: 3000,
  facebook: 63206,
  youtube: 1000, // community post
  tiktok: 2200, // caption (script is separate)
  threads: 500,
};

export function validateSocialPost(post: SocialPost): {
  valid: boolean;
  overLimit?: number;
  errors: string[];
} {
  const errors: string[] = [];
  const limit = SOCIAL_PLATFORM_LIMITS[post.platform];

  if (post.content.length > limit) {
    errors.push(`Content exceeds ${post.platform} limit (${limit} chars)`);
    return { valid: false, overLimit: post.content.length - limit, errors };
  }

  return { valid: true, errors };
}