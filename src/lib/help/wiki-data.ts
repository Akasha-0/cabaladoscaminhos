// ============================================================================
// WIKI DATA — community-curated articles (Wave 36)
// ============================================================================
// User-contributed articles. NO anonymous edits — only authenticated users.
// Curated by Iyá (curadora editorial). Edit proposals workflow.
//
// LGPD Art. 7 + 18: wiki content é público; edits logados em AuditLog (Art. 37).
// PII scrubbing: contributors podem escrever o que quiserem sobre si próprios,
// mas a equipe de curadoria revisa antes de publicar para evitar vazamento
// de dados de terceiros.
// ============================================================================

export interface WikiArticle {
  slug: string;
  title: string;
  excerpt: string;
  authorId: string;          // pseudônimo "Yu-yó" etc.
  authorName: string;
  authorTradition?: string;
  category: WikiCategory;
  contentMarkdown: string;   // markdown source
  status: 'draft' | 'in_review' | 'published' | 'archived';
  version: number;
  editHistory: Array<{
    version: number;
    authorName: string;
    date: string;
    note: string;
  }>;
  proposals: Array<{
    id: string;
    authorName: string;
    date: string;
    summary: string;
    diff: string;  // pseudo diff
    status: 'pending' | 'accepted' | 'rejected';
  }>;
  featured: boolean;
  views: number;
  upvotes: number;
  tags: string[];
  publishedAt?: string;
  lastUpdated: string;
  reviewNote?: string;
}

export type WikiCategory =
  | 'praticas'
  | 'tradições'
  | 'livros'
  | 'pessoas'
  | 'recursos'
  | 'experiencias';

export const WIKI_CATEGORIES: Array<{
  slug: WikiCategory;
  label: string;
  description: string;
}> = [
  { slug: 'praticas', label: 'Práticas', description: 'Como meditar, ritualizar, exercitar' },
  { slug: 'tradições', label: 'Tradições', description: 'Visão pessoal de cada tradição' },
  { slug: 'livros', label: 'Livros & leituras', description: 'Recomendações + críticas' },
  { slug: 'pessoas', label: 'Pessoas & linhagens', description: 'Quem são os practitioners' },
  { slug: 'recursos', label: 'Recursos externos', description: 'Podcasts, sites, eventos offline' },
  { slug: 'experiencias', label: 'Experiências', description: 'Relatos de transformações' },
];

export const WIKI_ARTICLES: WikiArticle[] = [
  {
    slug: 'meditacao-tdah-rotina-15min',
    title: 'Minha rotina de meditação com TDAH (15min por dia)',
    excerpt: 'Depois de 3 anos tentando, achei um formato que funciona pra mim. Quero compartilhar.',
    authorId: 'yu-yo-7c0',
    authorName: 'Yu-yó (beta user 7)',
    authorTradition: 'meditacao',
    category: 'praticas',
    status: 'published',
    version: 3,
    contentMarkdown: `# Minha rotina de meditação com TDAH (15min por dia)

> Primeiro, o disclaimer: sou beta user desde maio/2026, tenho TDAH diagnosticado, e passei os últimos 3 anos tentando encontrar uma rotina de meditação que funcionasse pra mim. Isso aqui não é prescrição — é o que eu faço.

## O setup

- **Horário:** 6h15 da manhã, antes de qualquer tela. Café fica esperando.
- **Lugar:** Cadeira firme (não de balanço) numa sala com cortina semi-fechada. Luz indireta.
- **Duração:** 15min cronometrados. Aplicativo Insight Timer.
- **Postura:** pés no chão, mãos no colo, coluna ereta mas não travada.

## A técnica

Dividi em 3 blocos de 5min:

1. **5min — Âncora corpo.** Respiração nasal, contar 1-4 inspire, 1-4 expire. Se a mente divagar (e vai), volta pra contagem sem briga.

2. **5min — Âncora som.** Mantra "ram" no inspirar, "sat" no expirar. Faz a parte verbal do cérebro ficar ocupada (TDAH-friendly).

3. **5min — Aberta.** Sem âncora. Só presencia o que aparecer. Pensamentos, emoções, sons do vizinho.

## O que não funcionou

- Sessão única longa (20-30min) — minha mente desiste.
- Meditação guiada longa (mais de 10min) — eu perco o fio.
- Sessões noturnas — eu durmo em 5min.

## O que me mantém voltando

- Pequeno o suficiente pra não exigir planejamento.
- Log no aplicativo mostra cadeia de dias.
- Comunidade de prática no /groups/meditacao-iniciantes.
- Sessão quinzenal 1:1 com mentora (R$ 80).

## Próximo passo

Quero entrar em prática contemplativa com texto — St. Ignatius ou Eckhart Tolle em outubro. Aceito sugestões no Akasha.

---

**Aviso:** este post é pessoal, não é orientação profissional. Para TDAH, busque acompanhamento de psicólogo/psiquiatra além de práticas integrativas.`,
    editHistory: [
      { version: 1, authorName: 'Yu-yó', date: '2026-05-10', note: 'Versão inicial' },
      { version: 2, authorName: 'Yu-yó', date: '2026-06-05', note: 'Adicionada seção "O que não funcionou"' },
      { version: 3, authorName: 'Yu-yó', date: '2026-06-22', note: 'Adicionado disclaimer médico' },
    ],
    proposals: [
      {
        id: 'pr-001',
        authorName: 'Marcelo F.',
        date: '2026-06-25',
        summary: 'Sugere adicionar seção sobre uso de féretro pós-prática',
        diff: '+ 1 linha sobre ritmé de volta à rotina',
        status: 'pending',
      },
      {
        id: 'pr-002',
        authorName: 'Iyá (curadora)',
        date: '2026-06-30',
        summary: 'Revisão editorial — adicionada disclaimer médica ✓',
        diff: '+ 2 linhas em Aviso:',
        status: 'accepted',
      },
    ],
    featured: true,
    views: 412,
    upvotes: 38,
    tags: ['meditacao', 'tdah', 'rotina', 'autocuidado'],
    publishedAt: '2026-05-12',
    lastUpdated: '2026-06-30',
  },
  {
    slug: 'cabala-na-pratica-cotidiana',
    title: 'Como eu trago a Cabala pra prática cotidiana (sem virar fanático)',
    excerpt: '3 anos de prática, ainda não me sinto pronto pra ser "mestre". Mas tem 3 coisas que faço todo dia que mudaram minha cabeça.',
    authorId: 'shlomo-ab',
    authorName: 'Shlomo (beta user 13)',
    authorTradition: 'cabala',
    category: 'tradições',
    status: 'published',
    version: 2,
    contentMarkdown: `# Como eu trago a Cabala pra prática cotidiana (sem virar fanático)

Depois de 3 anos estudando Cabala — primeiro sozinho com livros, depois com um rav na sinagoga, agora com mentoria daqui da Cabala dos Caminhos — eu posso dizer o que ficou e o que caiu fora.

## Ficou

### 1. Meditação das 3 letras mães (5min)

Aleph → Mem → Shin → silêncio.

Cinco minutos por dia, na hora do almoço. Telefone no outro cômodo. Isso eu mantenho há 2 anos.

### 2. Estudo semanal de uma Sefirá

Todo domingo, 30min. Leio o capítulo do Etz Chaim correspondente à Sefirá da semana (ciclo de 10 semanas). Anoto 1-2 frases que me tocaram.

### 3. Cumprimentar com a intenção da Sefirá

A ideia do Rav Baal Shem Tov: cada vez que você diz "bom dia", tenta desejar genuinamente o bem àquela pessoa, sem expectativa. Pequeno gesto. Vezes cumulativas.

## Caiu fora

- Vestir tzitzit em casa (achei performático pra mim).
- Comer kosher estrito em restaurante (custo de sanidade social).
- Caligrafia da letra hebraica (volta e meia tento, paro).

## O que não te contam

- Cabala não substitui psicoterapia. Se você tá num momento difícil, faça terapia primeiro.
- Tem muita picaretagem na internet. Autores que recomendo: Aryeh Kaplan, Rav Yitz Greenberg, Maggid Yisrael Ariel.
- O Zohar é denso e antigo. Ler sozinho sem comentário é receita pra frustração.

Se você quer começar, minha sugestão é: 5min por dia de meditação Aleph-Mem-Shin, ler um livro curto, e encontrar uma comunidade.`,
    editHistory: [
      { version: 1, authorName: 'Shlomo', date: '2026-04-12', note: 'Versão inicial' },
      { version: 2, authorName: 'Shlomo', date: '2026-06-15', note: 'Adicionada seção "O que não te contam"' },
    ],
    proposals: [],
    featured: true,
    views: 894,
    upvotes: 71,
    tags: ['cabala', 'pratica', 'iniciante', 'sefirot'],
    publishedAt: '2026-04-15',
    lastUpdated: '2026-06-15',
  },
  {
    slug: 'livros-iniciantes-tantra',
    title: '5 livros pra quem quer começar a estudar Tantra (sem propaganda)',
    excerpt: 'Selecionei 5 leituras que atravessam ocidentalização e Hinduísmo original. PT-BR/EN/ES.',
    authorId: 'anjali-m',
    authorName: 'Anjali (beta user 22)',
    authorTradition: 'tantra',
    category: 'livros',
    status: 'published',
    version: 1,
    contentMarkdown: `# 5 livros pra quem quer começar a estudar Tantra

Publiquei [outro post sobre o que Tantra não é](...). Esse aqui é sobre o que ler pra começar.

## Selecionados

1. **"Tantra: revelado. Misticismo, sexo e sexo-cosmologia" — Ben Williams (2023)**
   *Em português.* Livro brasileiro, sem erotização, escrito pra leigos. Ótimo ponto de entrada.

2. **"The Circle of Fire" — Andre Padoux (1990)**
   *Em inglês.* Acadêmico mas acessível. Foca em Kashmir Shaivism, vertente filosófica densa.

3. **"Tantra Illuminated" — Christopher Wallis (2012)**
   *Em inglês.* Kashmiri Shaivism traduzido pra modernidade. Boa se você já tem alguma base em meditação.

4. **"O Tao do Tantra" — David Deida (1997)**
   *Em português.* Western neo-tantra. Foco em prática, mas cuidadoso culturalmente. Boa porta de entrada pra ocidentais.

5. **"Hymns to the Goddess" — Devadatta Kali (2009)**
   *Em inglês.* Coletânea comentada de hinos tântricos ao Devi. Pra quem já quiser ir além da intro.

## Ordem sugerida

Se você nunca leu nada sobre Tantra: comece com #1. Se já tem base em meditação: comece com #3. Se quer ir direto pra raiz: comece com #2 (e leva tempo).

## O que evitar

- Livros escritos antes de 1990 (replicam viés da "revolução sexual").
- E-books com título "Tantra para casais" — marketing, não estudo.
- Autores que não citam fontes indianas.`,
    editHistory: [
      { version: 1, authorName: 'Anjali', date: '2026-05-20', note: 'Versão inicial' },
    ],
    proposals: [],
    featured: false,
    views: 1245,
    upvotes: 89,
    tags: ['tantra', 'livros', 'leitura', 'estudo'],
    publishedAt: '2026-05-20',
    lastUpdated: '2026-05-20',
  },
  {
    slug: 'candomble-tem-que-ir-presencial',
    title: 'Por que Candomblé só funciona presencial (e como achar terreiro)',
    excerpt: 'Tentei 8 meses aprender online. Não substitui o contato. Reflexão + caminhos práticos.',
    authorId: 'maria-luz',
    authorName: 'Maria Luz (beta user 41)',
    authorTradition: 'candomble',
    category: 'experiencias',
    status: 'published',
    version: 1,
    contentMarkdown: `# Por que Candomblé só funciona presencial

Vou ser direta: **8 meses tentando aprender Candomblé online não substitui 1 ano num terreiro**. Vou explicar por quê, sem prescrever nada.

## Minha jornada

- 2024-jul até 2025-fev: Youtube + cursos online. Achava que estava avançando.
- 2025-fev: entrei num terreiro Ketu perto de casa. Em 4 semanas vi a diferença.

## O que falta no online

- **Transmissão oral**: não é metáfora. O Zelador de Santo precisa te ver, te ouvir, te corrigir.
- **Calendário**: terreiro tem ritmo próprio — giras nos dias certos, oferendas sazonais. Calendário online é estático.
- **Iniciação**: Bori, feijão, obrigação de 7 anos — tudo presencial.
- **Comunidade**: você precisa do terreiro pra entender o ethos, não só a doutrina.

## Como achar terreiro

1. Visite mais de um. Mínimo 3 antes de escolher.
2. Participe da Gira de Desenvolvimento (aberta).
3. Converse com Zelador de Santo. Pergunte sobre linhagem, regras, frequência.
4. Casa Branca é a tradição mais antiga (Espanha, séc. XIX) — vale conhecer.
5. Se a sua cidade não tem terreiro Ketu, tente Jeje ou Angola — vertentes diferentes do mesmo tronco.

## Quando o Akasha ajuda

Akasha pode explicar conceitos, comparar linhagens, indicar leituras acadêmicas. Mas ela mesma avisa: **substituir terreiro não está no cardápio**.

Eu nunca escrevi aqui como "Zeladora de Santo" porque não sou. Sou aprendiz há 18 meses. Aprendo com minha Yalorixá. Esse post é pessoal.`,
    editHistory: [
      { version: 1, authorName: 'Maria Luz', date: '2026-06-01', note: 'Versão inicial' },
    ],
    proposals: [],
    featured: false,
    views: 612,
    upvotes: 47,
    tags: ['candomble', 'terreiro', 'presencial', 'iniciacao'],
    publishedAt: '2026-06-01',
    lastUpdated: '2026-06-01',
  },
  {
    slug: 'mapas-natais-app-vs-humano',
    title: 'Astrologia por app vs com astrólogo humano: comparativo real',
    excerpt: 'Testei 6 apps e fiz 4 sessões com astrólogos diferentes. Diferença crucial em como a leitura é feita.',
    authorId: 'jana-r',
    authorName: 'Jana R. (beta user 9)',
    authorTradition: 'astrologia',
    category: 'experiencias',
    status: 'published',
    version: 2,
    contentMarkdown: `# Astrologia por app vs com astrólogo humano

Eu sou rationally spiritual, trabalho com tech, e adoro um mapa astral. Comparativo sério, sem marketing.

## Apps testados (nota: 1-5)

- **Akasha Portal** — 5/5. Trópico, casas Placidus, aspectos maiores e menores. Akasha IA interpreta contexto pessoal.
- **TimePassages (iOS)** — 4/5. Clássico, robusto, exporta PDF. Caro ($25).
- **Co-Star** — 2/5. UX bonito, astrologia rasa, frases-feitas.
- **Astro.com** — 5/5 (grátis). Sem enfeite, técnico, cheio de opções.
- **Sanctuary** — 3/5. Voltado pra lifestyle, com horóscopo diário.
- **The Pattern** — 2/5. Não é astrologia, é psicologia disfarçada.

## Astrólogos humanos (4 sessões)

Astrologia honesta:

- Sessão 1: relatório genérico, fórmulas. 1.5h, R$ 200. ❌
- Sessão 2: leitura técnica de aspectos, mas pouca contextualização. 1h, R$ 150. ⚠️
- Sessão 3: leitura simbólica de trânsitos cruzados com minha narrativa. 1.5h, R$ 250. ✅
- Sessão 4: simbólica + escuta ativa. 1h, R$ 180. ✅✅

## Diferença crucial

App = ferramenta. Astrólogo humano = leitura interpretativa.

App te diz "Vênus em Escorpião, quadratura Plutão". Astrólogo te diz "isso aparece quando você precisa aprender a perder relações sem perder sua essência". A segunda exige contexto.

## Recomendação honesta

1. Use app pra se familiarizar (Akasha ou Astro.com)
2. Quando chegar num momento-chave (decisão grande, luto, transição), contrate uma sessão humana.
3. Você não precisa ir toda semana pra entender seu mapa. 1 sessão a cada 6 meses já traz insight.

Não acredite em quem promete "previsão". Astrologia é linguagem simbólica, não bola de cristal.`,
    editHistory: [
      { version: 1, authorName: 'Jana R.', date: '2026-03-15', note: 'Versão inicial' },
      { version: 2, authorName: 'Jana R.', date: '2026-05-22', note: 'Adicionada sessão 4' },
    ],
    proposals: [],
    featured: false,
    views: 1583,
    upvotes: 102,
    tags: ['astrologia', 'app', 'review', 'pratica'],
    publishedAt: '2026-03-16',
    lastUpdated: '2026-05-22',
  },
  {
    slug: 'recursos-podcasts-pt-br',
    title: 'Podcasts em PT-BR sobre espiritualidade: 7 que valem o tempo',
    excerpt: 'Eu sou podcast-aholic. Ouvi uns 50 pra escolher 7 que passam o filtro de qualidade.',
    authorId: 'rafa-t',
    authorName: 'Rafa T. (beta user 27)',
    category: 'recursos',
    status: 'published',
    version: 1,
    contentMarkdown: `# Podcasts em PT-BR sobre espiritualidade

Sou podcast-aholic. Filtro: prefiro quem cita fontes, admite limites, e tem postura humilde.

## Top 7

1. **Café com Akasha** — curadoria do nosso portal. Semanal, 30min.
2. **Mistagogia** — misticismo cristão (Padre Marcelo Rossi, teologia da libertação). 45min.
3. **Cabala Aberta** — Rabino Nilton Bonder. Curto, profundo.
4. **Nação Ketu** — Axé e cotidiano. Diálogo com Zeladores de Santo.
5. **Meditação Prática** — secular, budismo mahayana. Didático.
6. **Yoga Sutra por capítulo** — formato estudo, secular.
7. **Espiritismo Hoje** — diálogo com Allan Kardec, psicológico.

## Evite

- Podcasts que prometem "previsões mensais"
- Programas longos sem estrutura (acima de 90min sem índice)
- Hosts que citam Cabala + Candomblé sem diferenciar

Sugestão? Comenta ou me chama em /u/rafa-t.`,
    editHistory: [
      { version: 1, authorName: 'Rafa T.', date: '2026-04-28', note: 'Versão inicial' },
    ],
    proposals: [],
    featured: false,
    views: 982,
    upvotes: 76,
    tags: ['podcast', 'pt-br', 'recursos'],
    publishedAt: '2026-04-29',
    lastUpdated: '2026-04-29',
  },
  // Adicionando mais 4 stubs pra garantir 10+ artigos
  {
    slug: 'tantra-ocidental-vs-indiana',
    title: 'Neo-tantra ocidental vs Tantra indiana: o que separei',
    excerpt: '3 anos de neo-tantra + viagem pra Kerala. Reflexão prática.',
    authorId: 'anjali-m',
    authorName: 'Anjali (beta user 22)',
    authorTradition: 'tantra',
    category: 'experiencias',
    status: 'published',
    version: 1,
    contentMarkdown: `# Neo-tantra ocidental vs Tantra indiana

Vou ser honesta: eu fiz 3 anos de neo-tantra (workshops respiração, fim de semana em retiro). Depois fui pra Kerala estudar com um pandit por 1 mês. Foi revelador.

## Continua valendo (neo-tantra ocidental)

- Técnicas de respiração (coerência, holotrópica)
- Integração corpo-emoção
- Espaço seguro pra mulheres desabafarem
- Ritualística simples com parceira/o

## Não tem equivalente no indiano

- Falta de linhagem clara. Você faz com qualquer pessoa, sem iniciação.
- Conceitos "energia sexual" são vagos. Na tradição Kashmiri, é prana, kundalini, com estrutura.
- Falta contexto simbólico. Yantras e mantras têm propósito exato; em neo-tantra são decorativos.

## O que aprendi indo pra fonte

- Iniciação pessoal importa (não precisa ser guru, mas tem que ter alguém).
- Texto > técnica. Vijnanabhairava Tantra é monumental.
- Mantras não são "mantra do dia". São práticas seriadas.
- Yantras não são "geometria legal". São representações de princípios cósmicos.

## Recomendação

Não jogue fora o que aprendeu em neo-tantra. Mas vá além. 1 leitura técnica + 1 sessão com praticante indiano se possível.`,
    editHistory: [],
    proposals: [],
    featured: false,
    views: 821,
    upvotes: 63,
    tags: ['tantra', 'neo-tantra', 'india', 'pratica'],
    publishedAt: '2026-05-01',
    lastUpdated: '2026-05-01',
  },
  {
    slug: 'umbanda-minha-primeira-gira',
    title: 'Minha primeira gira de Umbanda (e o que ninguém me disse)',
    excerpt: 'Vou ao centro há 6 meses. Gosto, mas não é pra todo mundo. Relato honesto.',
    authorId: 'joao-v',
    authorName: 'João V. (beta user 34)',
    authorTradition: 'umbanda',
    category: 'experiencias',
    status: 'published',
    version: 1,
    contentMarkdown: `# Minha primeira gira de Umbanda

Eu tinha medo de ir. Toda minha família é católica. Anúncio "presenciei possessão" parecia coisa de filme. Mas depois de 6 meses acompanhando meus amigos pretos do terreiro, decidi ir.

## Como foi

- Centro espírita em São Paulo, periferia leste.
- Cerca de 30 pessoas.
- Começou 21h, terminou 1h.
- Médiuns incorporaram 4 Caboclos + 2 Pretos Velhos.
- Tive escolha: ficar no centro da gira, ou na "banda" (fora do círculo central, sem incorporação).

## O que ninguém me disse

- Gira tem **muito barulho**. Não é meditação silenciosa.
- Pode ter **muita emoção**. Eu chorei mesmo sem incorporar.
- Tem **muito** "atendimento" no final. Saí 1h depois porque 6 médiuns queriam conversar comigo.
- **Não é obrigatório incorporar**. Pode assistir a vida inteira sem incorporar.

## Por que continuo indo

- Comunidade. 30 pessoas velhas que se conhecem há 30 anos. Me adotaram.
- Cura. Não de mim — dos outros. Ver Preta Velha trazer alívio pra alguém é lindo.
- Ancestralidade. Sinto que toco algo maior que eu.

## Pra quem não recomendo

- Se você busca prática contemplativa silenciosa → Vipassana.
- Se você busca linhagem clara, discreta → Candomblé.
- Se você busca estrutura ritualística rígida → Candomblé Jeje.`,
    editHistory: [],
    proposals: [],
    featured: false,
    views: 562,
    upvotes: 41,
    tags: ['umbanda', 'gira', 'experiencia', 'presencial'],
    publishedAt: '2026-06-08',
    lastUpdated: '2026-06-08',
  },
  {
    slug: 'cabala-astrologia-relacao',
    title: 'Cabala e Astrologia: a relação profunda que ninguém te conta',
    excerpt: 'As 10 Sefirot + os 12 signos do Zodíaco mapeiam 1:1. Spoiler: não é coincidência.',
    authorId: 'shlomo-ab',
    authorName: 'Shlomo (beta user 13)',
    authorTradition: 'cabala',
    category: 'tradições',
    status: 'published',
    version: 1,
    contentMarkdown: `# Cabala e Astrologia: a relação profunda

A árvore da vida na Cabala tem 10 Sefirot. O Zodíaco tem 12 signos. Você pode pensar "são 2 sistemas diferentes", mas a tradição cabalística há séculos ensina: o Zodíaco é "decoração" da Árvore.

## O mapeamento

A correspondência clássica (Patriarca Abraham de Worms, séc. XIV):

| Sefirá | Planeta | Signo |
|--------|---------|--------|
| Keter | Plutão | — |
| Chokhmah | Urano | Áries |
| Binah | Saturno | Capricórnio |
| Chesed | Júpiter | Sagitário / Peixes |
| Gevurah | Marte | Áries / Escorpião |
| Tiferet | Sol | Leão |
| Netzach | Vênus | Touro / Libra |
| Hod | Mercúrio | Gêmeos / Virgem |
| Yesod | Lua | Câncer |
| Malkhut | Terra / Saturno | — |

(Schema simplificado; tradições diferentes organizam de modo diferente.)

## O que isso significa na prática

- Meditar na Sefirá do dia **e** ler o signo do dia → duas camadas.
- Estudar Cabala sem Astrologia → perde uma camada de simbolismo.
- Estudar Astrologia sem Cabala → fica raso, vira horóscopo.

## Atenção

Cabala tem linhagem judaica clara. Astrologia não. Algumas vertentes cristãs místicas (escola de Chartres) também leram o mesmo sistema. Você não precisa "escolher" — pode estudar ambos como linguagens complementares.`,
    editHistory: [],
    proposals: [],
    featured: false,
    views: 1305,
    upvotes: 88,
    tags: ['cabala', 'astrologia', 'sefirot', 'zodiaco'],
    publishedAt: '2026-05-30',
    lastUpdated: '2026-05-30',
  },
  {
    slug: 'reiki-e-o-que-nao-e',
    title: 'Reiki: o que é (e o que definitivamente NÃO é)',
    excerpt: 'Reiki tem linhagem japonesa clara. Limpar isso das fake therapies é importante.',
    authorId: 'tati-w',
    authorName: 'Tati W. (beta user 19)',
    authorTradition: 'reiki',
    category: 'tradições',
    status: 'published',
    version: 1,
    contentMarkdown: `# Reiki: o que é e o que NÃO é

Vou falar de uma coisa que mexe: **muita gente no Brasil oferece "Reiki" que não é Reiki**. Vamos separar.

## O que é Reiki

Reiki é prática de imposição de mãos, criada por Mikao Usui no Japão em 1922. Tem linhagem clara: Usui → Hayashi → Takata → 22 mestres americanos → mundo ocidental.

## O que NÃO é

- "Mão de cura" sem linhagem — não é Reiki.
- "Reiki de cristais" — não é Reiki. Cristais podem ser usados, mas a base tem que ter mestre certificado.
- "Energia canalizada" sem treinamento formal — é terapia energética genérica.
- "Reiki à distância" cobrado como prática única — versões existem, mas atenção à ética.

## Linha de cuidado

A linhagem foi preservada por 100 anos. Respeitar isso é manter o saber. Se você faz "Reiki" sem nunca ter passado por um mestre, **parabenize-se por praticar cura energética, mas não chame de Reiki**.

## Como se certificar (recomendações)

- International Center for Reiki Training
- Institut für Reiki (Alemanha, escola Takata)
- Aliança Brasileira de Reiki

Recomendo cuidado com "cursos online de 21 dias". São teoria, mas o espírito é presencial.`,
    editHistory: [],
    proposals: [],
    featured: false,
    views: 743,
    upvotes: 52,
    tags: ['reiki', 'linhagem', 'cuidado'],
    publishedAt: '2026-06-12',
    lastUpdated: '2026-06-12',
  },
  {
    slug: 'como-escolher-praticar-tantra',
    title: 'Como escolher por onde começar em práticas somáticas',
    excerpt: 'Tantra, yoga, holotropica, integrativa, Reich... Vai se perder. Mapa aqui.',
    authorId: 'anjali-m',
    authorName: 'Anjali (beta user 22)',
    category: 'praticas',
    status: 'published',
    version: 1,
    contentMarkdown: `# Como escolher por onde começar em práticas somáticas

Você quer começar algo que conecta corpo + emoção + espiritualidade. Tantra? Yoga? Respiração holotrópica? Método Feldenkrais? Análise Reichiana? Vipassana?

## Mapa rápido

**Quer liberar emoção travada → Respiração holotrópica (Stanislav Grof)**
- Retiros de 1-2 dias
- Prática intensa, supervisionada
- Pode evocar memórias, ter cuidado com trauma

**Quer trabalhar corpo físico → Yoga Integral (Aurobindo) ou Iyengar**
- Posturas sustentadas
- Atenção a alinhamento
- Atemporal, lento

**Quer trabalhar emoção + corpo → Tantra não-dual (Kashmir Shaivism)**
- Respiração + som + toque (com ou sem parceira)
- Filosofia de não-separação
- Linhagem clara

**Quer trabalho lento + contínuo → Vipassana ou Mindfulness**
- 5-15min por dia
- Aprende a observar
- Tom secular ou budista

**Quer trabalho profundo + árduo → Reich, bioenergética**
- Análise corporal
- Crítico da "linha suave"
- Indicação: faça com terapeuta formado

## Meu caminho

Comecei com yoga (corporal), fui pra Tantra (emoção), fiz holotrópica (liberação), voltei pra meditação (integração). Cada fase 4-6 meses. Sem pressa.`,
    editHistory: [],
    proposals: [],
    featured: true,
    views: 1102,
    upvotes: 79,
    tags: ['pratica', 'somatica', 'tantra', 'yoga', 'holotropica'],
    publishedAt: '2026-06-20',
    lastUpdated: '2026-06-20',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

export function getWikiBySlug(slug: string): WikiArticle | undefined {
  return WIKI_ARTICLES.find((a) => a.slug === slug);
}

export function getWikiByCategory(cat: WikiCategory): WikiArticle[] {
  return WIKI_ARTICLES.filter((a) => a.category === cat && a.status === 'published');
}

export function getFeaturedWiki(): WikiArticle[] {
  return WIKI_ARTICLES.filter((a) => a.featured && a.status === 'published');
}

export function getRecentWiki(limit = 8): WikiArticle[] {
  return [...WIKI_ARTICLES]
    .filter((a) => a.status === 'published')
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, limit);
}

export function getPopularWiki(limit = 8): WikiArticle[] {
  return [...WIKI_ARTICLES]
    .filter((a) => a.status === 'published')
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, limit);
}

export function getPendingProposals(): Array<{
  slug: string;
  title: string;
  proposal: WikiArticle['proposals'][number];
}> {
  return WIKI_ARTICLES.flatMap((a) =>
    a.proposals
      .filter((p) => p.status === 'pending')
      .map((p) => ({ slug: a.slug, title: a.title, proposal: p })),
  );
}

export function totalWikiCount(): number {
  return WIKI_ARTICLES.filter((a) => a.status === 'published').length;
}
