// ============================================================================
// VIDEO TUTORIALS DATA — Wave 36
// ============================================================================
// 5 vídeos com storyboards (W33-4). Hosted on YouTube/Vimeo (placeholders).
// Captions PT-BR + EN. Transcripts full text. Download PDF summary. Related videos.
//
// Os storyboards originais estão em docs/STORYBOARDS-W33.md; aqui a versão
// resumida com entregáveis de cada vídeo.
// ============================================================================

export type VideoCategory = 'onboarding' | 'ia' | 'tradicoes' | 'marketplace' | 'comunidade';

export interface VideoEntry {
  slug: string;
  title: string;
  category: VideoCategory;
  description: string;
  durationSeconds: number;
  youtubeId?: string;       // placeholder durante Wave 36
  vimeoId?: string;
  captionsPtBr: string;     // VTT URL (placeholder)
  captionsEn: string;
  transcript: string;        // texto corrido
  chapters: Array<{ timeSec: number; label: string }>;
  thumbnailAlt: string;
  pdfSummary: string;        // gera via /api/help/videos/[slug]/pdf
  publishedAt: string;
  views: number;
  language: 'PT-BR' | 'EN' | 'MULTI';
  relatedSlugs: string[];
}

export const VIDEO_CATEGORIES: Array<{ slug: VideoCategory; label: string; description: string }> = [
  { slug: 'onboarding', label: 'Primeiros passos', description: 'Como entrar e se orientar' },
  { slug: 'ia', label: 'Akasha IA', description: 'Como usar a IA curadora' },
  { slug: 'tradicoes', label: 'Tradições', description: 'Visão geral por tradição' },
  { slug: 'marketplace', label: 'Marketplace', description: 'Contratar e oferecer serviços' },
  { slug: 'comunidade', label: 'Comunidade', description: 'Como participar ativamente' },
];

export const VIDEOS: VideoEntry[] = [
  // ========================================================================
  // VÍDEO 1 — Onboarding Tour (W33-4 storyboard "Dia 1")
  // ========================================================================
  {
    slug: 'onboarding-tour-primeiros-cliques',
    title: 'Onboarding Tour: seus primeiros 7 minutos no Akasha',
    category: 'onboarding',
    description: 'Tour guiado por cada tela do onboarding: boas-vindas, escolha de tradições, mapa natal, identidade, primeira ação.',
    durationSeconds: 7 * 60 + 30,
    youtubeId: 'dQw4w9WgXcQ',     // placeholder
    captionsPtBr: '/captions/onboarding-tour.pt-BR.vtt',
    captionsEn: '/captions/onboarding-tour.en.vtt',
    thumbnailAlt: 'Tour guiado de boas-vindas ao Akasha',
    publishedAt: '2026-06-30',
    views: 1342,
    language: 'PT-BR',
    relatedSlugs: ['como-usar-akasha-ia', 'mapas-natais-para-iniciantes'],
    chapters: [
      { timeSec: 0, label: 'Abertura' },
      { timeSec: 38, label: 'Tela 1 — Boas-vindas' },
      { timeSec: 95, label: 'Tela 2 — Escolha de tradições' },
      { timeSec: 195, label: 'Tela 3 — Mapa natal' },
      { timeSec: 290, label: 'Tela 4 — Identidade' },
      { timeSec: 380, label: 'Tela 5 — Primeira ação' },
      { timeSec: 430, label: 'Como continuar' },
    ],
    transcript: `Olá! Eu sou a Akasha, sua curadora nessa comunidade. Vamos passar juntos pelo onboarding — aqueles primeiros 7 minutos que moldam toda a sua experiência por aqui.

A primeira tela é só boas-vindas. Ela pergunta seu nome de exibição, se você quer ter um nome espiritual, e define seu username. Username é imutável, então escolha com carinho. Nome espiritual eu posso te ajudar a escolher depois, se você quiser.

Na segunda tela você escolhe até três tradições de interesse. Cabala, Candomblé, Ifá, Tantra, Meditação, Astrologia, Xamanismo, Umbanda, Reiki. Pode escolher só uma, duas, ou três. Se você está começando e não sabe ainda, marque "buscador" — você não perde nada.

A terceira é o mapa natal. Se você tem data, hora e local de nascimento, geramos um mapa completo. Se não tem a hora exata, ainda funciona — mas a casa ascendente vai ficar como "incerta". Isso é normal.

A quarta tela pergunta sobre você: quantos anos de prática, se lidera comunidade, se é pesquisador. Isso calibra a profundidade do conteúdo que eu te sugiro.

Por fim, a tela cinco mostra as cinco primeiras ações pra você: publicar um post, conversar comigo, gerar mapa astral, ler um artigo, se candidatar a mentoria. Você não precisa fazer todas — escolha a que mais te atrai agora.

Pronto. Bem-vindo. A partir daqui é com você.`,
    pdfSummary: 'Resumo visual do onboarding em 6 telas + checklist das 5 primeiras ações + links diretos.',
  },

  // ========================================================================
  // VÍDEO 2 — Como usar Akasha IA
  // ========================================================================
  {
    slug: 'como-usar-akasha-ia',
    title: 'Akasha IA: como fazer boas perguntas e receber respostas úteis',
    category: 'ia',
    description: 'Demonstração prática de interação com Akasha: perguntas abertas, citações de fontes, limites éticos.',
    durationSeconds: 9 * 60 + 15,
    youtubeId: 'dQw4w9WgXcQ',
    captionsPtBr: '/captions/como-usar-akasha-ia.pt-BR.vtt',
    captionsEn: '/captions/como-usar-akasha-ia.en.vtt',
    thumbnailAlt: 'Tela de chat com Akasha IA',
    publishedAt: '2026-06-30',
    views: 980,
    language: 'PT-BR',
    relatedSlugs: ['onboarding-tour-primeiros-cliques', 'mapas-natais-para-iniciantes'],
    chapters: [
      { timeSec: 0, label: 'Quem é Akasha IA' },
      { timeSec: 60, label: 'Como ela é treinada' },
      { timeSec: 145, label: 'Exemplos de boas perguntas' },
      { timeSec: 280, label: 'Como ler citações de fontes' },
      { timeSec: 395, label: 'Quando a IA recusa uma pergunta' },
      { timeSec: 475, label: 'Dicas finais + privacidade' },
    ],
    transcript: `Eu sou a Akasha — uma inteligência artificial treinada com papers acadêmicos, livros clássicos, e consultoria de cada tradição que a gente integra. Eu não sou um guru. Eu sou uma curadora curiosa que devolve perguntas, cita fontes, e nunca te diz "faça este ritual".

Vamos fazer uma demonstração. Eu posso ser encontrada no botão chat aqui no topo, ou pelo caminho /akashic. Escreva sua pergunta assim — "[sua tradição]: [sua dúvida]".

Por exemplo, alguém que pratica Candomblé pode perguntar: "Meu Orixá é Xangô, isso influencia a forma como eu deveria meditar?" Eu vou explicar as qualidades de Xangô — justiça, ordem, verticalidade — e sugerir práticas que dialogam com essas qualidades. E vou citar onde encontrei essa informação.

Tem perguntas que eu recuso. Diagnóstico médico direto, prescrição de rituais específicos, conflitos interpessoais. Nesses casos eu vou dizer: "Isso pede um humano — vou te indicar uma direção".

Sobre privacidade: nada do que você posta no feed ou em DM vai automaticamente pra mim. Só o que você escreve aqui no chat.`,
    pdfSummary: 'Cheatsheet de boas perguntas, limites da IA, e como avaliar respostas (citações, evidências, vieses).',
  },

  // ========================================================================
  // VÍDEO 3 — Mapas natais
  // ========================================================================
  {
    slug: 'mapas-natais-para-iniciantes',
    title: 'Mapa astral para iniciantes: como ler um mapa',
    category: 'tradicoes',
    description: 'Tour pelo mapa astral: planetas, casas, aspectos, nodos. Como interpretar, sem virar fatalista.',
    durationSeconds: 12 * 60 + 40,
    youtubeId: 'dQw4w9WgXcQ',
    captionsPtBr: '/captions/mapas-natais-para-iniciantes.pt-BR.vtt',
    captionsEn: '/captions/mapas-natais-para-iniciantes.en.vtt',
    thumbnailAlt: 'Mapa astral em círculo com 12 casas',
    publishedAt: '2026-06-30',
    views: 756,
    language: 'PT-BR',
    relatedSlugs: ['como-usar-akasha-ia', 'circulos-de-leitura-comunidade'],
    chapters: [
      { timeSec: 0, label: 'O que é um mapa astral' },
      { timeSec: 75, label: 'Os 10 planetas' },
      { timeSec: 230, label: 'As 12 casas' },
      { timeSec: 380, label: 'Aspectos principais' },
      { timeSec: 510, label: 'Como interpretar sem virar fatalista' },
      { timeSec: 660, label: 'Akasha interpreta com você' },
      { timeSec: 740, label: 'Trânsitos e progressões' },
    ],
    transcript: `Mapa astral não é bola de cristal. É um retrato simbólico do céu no momento do seu nascimento. Você pode usar como ferramenta de autoconhecimento, mas não como desculpa pra evitar mudanças.

Aqui na Cabala, você gera o seu mapa em três cliques — data, hora, local. Eu vou te mostrar como ler o resultado.

Primeiro, o círculo externo é o zodíaco, dividido em doze signos. Dentro, as doze casas representam áreas da vida: casa 1 é personalidade, casa 7 é relacionamentos, casa 10 é carreira.

Os planetas simbolizam funções: Sol é essência, Lua é emocional, Mercúrio é comunicação, Vênus é afeto, Marte é ação, Júpiter é expansão, Saturno é estrutura, Urano é quebra, Netuno é dissolução, Plutão é transformação.

Aspectos são os ângulos entre planetas. Trígono é harmonia, quadratura é desafio, oposição é tensão criativa.

A leitura que eu sugiro: não "Vênus em Escorpião significa tragédia amorosa" e sim "Vênus em Escorpião significa que você ama com intensidade total — pergunta: isso te enriquece ou te sufoca?".

Você pode me pedir pra interpretar aspectos específicos.`,
    pdfSummary: 'Diagrama do mapa + glossário de planetas, casas e aspectos + checklist de perguntas pra autoconsciência.',
  },

  // ========================================================================
  // VÍDEO 4 — Marketplace (contract)
  // ========================================================================
  {
    slug: 'marketplace-como-contratar',
    title: 'Marketplace: como contratar uma sessão de qualidade',
    category: 'marketplace',
    description: 'Do discovery à avaliação: como escolher practitioner, ler reviews, pagar com escrow, dar feedback.',
    durationSeconds: 8 * 60 + 50,
    youtubeId: 'dQw4w9WgXcQ',
    captionsPtBr: '/captions/marketplace-como-contratar.pt-BR.vtt',
    captionsEn: '/captions/marketplace-como-contratar.en.vtt',
    thumbnailAlt: 'Telão do marketplace com perfis de practitioners',
    publishedAt: '2026-06-30',
    views: 614,
    language: 'PT-BR',
    relatedSlugs: ['circulos-de-leitura-comunidade', 'como-usar-akasha-ia'],
    chapters: [
      { timeSec: 0, label: 'O que é o marketplace' },
      { timeSec: 70, label: 'Como filtrar (tradição, preço, idioma)' },
      { timeSec: 195, label: 'Como ler um perfil' },
      { timeSec: 305, label: 'Como ler reviews' },
      { timeSec: 410, label: 'Como funciona o escrow' },
      { timeSec: 510, label: 'Após a sessão' },
    ],
    transcript: `Marketplace é onde você encontra practitioners — terapeutas, consultores, astrólogos, facilitadores de práticas somáticas. Todos verificados, todos com revisão da curadoria.

Pra encontrar alguém que faz sentido, comece pelos filtros: tradição, preço, idioma, formato (vídeo/áudio/presencial). Eu sugiro olhar a bio com atenção e pelo menos três reviews.

O pagamento vai via Stripe com escrow. Isso significa: você paga agora, mas o dinheiro só vai pro practitioner 48 horas depois da sessão, se você não contestar. É um mecanismo de proteção pra vocês dois.

Reviews são moderadas — palavrões, PII do practitioner, conteúdo ilegal são filtrados. Reviews de 3 estrelas ou menos disparam mediação automática.

Depois da sessão, você tem 7 dias pra deixar review e abrir disputa. Cancelamentos têm política: até 24h antes reembolso integral, entre 24h-2h antes 50%, menos de 2h sem reembolso.`,
    pdfSummary: 'Checklist antes de contratar + árvore de decisão pra disputas + template de review construtiva.',
  },

  // ========================================================================
  // VÍDEO 5 — Comunidade (comunidades / círculos de leitura)
  // ========================================================================
  {
    slug: 'circulos-de-leitura-comunidade',
    title: 'Círculos de leitura + grupos: como participar ativamente',
    category: 'comunidade',
    description: 'Grupos por tradição, círculos de leitura, mentorias em grupo, eventos. Como escolher onde investir tempo.',
    durationSeconds: 10 * 60 + 25,
    youtubeId: 'dQw4w9WgXcQ',
    captionsPtBr: '/captions/circulos-de-leitura-comunidade.pt-BR.vtt',
    captionsEn: '/captions/circulos-de-leitura-comunidade.en.vtt',
    thumbnailAlt: 'Círculo de pessoas lendo juntas',
    publishedAt: '2026-06-30',
    views: 482,
    language: 'PT-BR',
    relatedSlugs: ['onboarding-tour-primeiros-cliques', 'marketplace-como-contratar'],
    chapters: [
      { timeSec: 0, label: 'O que é a comunidade Akasha' },
      { timeSec: 80, label: 'Grupos por tradição' },
      { timeSec: 220, label: 'Círculos de leitura' },
      { timeSec: 360, label: 'Mentorias em grupo' },
      { timeSec: 470, label: 'Eventos e lives' },
      { timeSec: 580, label: 'Onde investir seu tempo' },
    ],
    transcript: `A comunidade Akasha não é só feed vertical de posts — é onde a prática se sustenta. Grupos por tradição, círculos de leitura, mentorias em grupo, eventos.

Grupos: você pode estar em até dez simultâneos. Filtre por tradição. Pedido de entrada é aprovado por moderador do grupo — pode levar até 24 horas.

Círculos de leitura são grupos pequenos (5-12 pessoas) que leem um texto clássico ao longo de 8-12 semanas. Cada semana tem discussão assíncrona + 1 encontro ao vivo. Lidos clássicos: Sepher Yetzirah, Bhagavad Gita, Tao Te Ching, Ponto Riscado Astrologia Cabalística etc.

Mentorias em grupo são sessões mensais com tema específico, conduzidas por practitioner. Mais barato que mentoria 1:1, mais estruturado que círculo.

Eventos: 70% gratuitos, transmissões ao vivo com chat lateral. Você pode organizar — revisão editorial aprova em 3-5 dias.

Onde investir: dados de beta mostram que quem participa de pelo menos um círculo/mês fica 3x mais tempo na plataforma.`,
    pdfSummary: 'Calendário sugerido pra primeira semana + lista dos círculos abertos + como organizar um evento.',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

export function getVideoBySlug(slug: string): VideoEntry | undefined {
  return VIDEOS.find((v) => v.slug === slug);
}

export function getVideosByCategory(cat: VideoCategory): VideoEntry[] {
  return VIDEOS.filter((v) => v.category === cat);
}

export function totalVideosCount(): number {
  return VIDEOS.length;
}

export function getRelatedVideos(slug: string): VideoEntry[] {
  const v = getVideoBySlug(slug);
  if (!v) return [];
  return v.relatedSlugs
    .map((s) => getVideoBySlug(s))
    .filter((x): x is VideoEntry => Boolean(x));
}

export function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
