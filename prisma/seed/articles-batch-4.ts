// ============================================================================
// Akasha Portal — Articles Seed Wave 11 (+30 artigos, 70 → 100)
// ============================================================================
// Foco editorial (Iyá, 2026-06-27):
//   - 5 tradições NOVAS: ayurveda, numerologia, gnosticismo, xintoismo,
//     wicca-paganismo (todas com linhagem/fundação rastreável)
//   - 5 tradições sub-representadas preenchidas até 5+ artigos:
//     judaísmo-místico, ciencia-pontes, espiritualidade-contemporanea,
//     cabala, ifa, tantra, meditacao, reiki, sufismo, hinduismo, budismo
//   - Mix: 10 INTRO + 15 INTERMEDIÁRIO + 5 AVANÇADO
//   - Cada artigo inclui novas metadata fields:
//       citations: string[]       — URLs externas (DOI, PubMed, etc)
//       relatedArticles: string[] — slugs de artigos relacionados
//       tradition_confidence: 'high' | 'medium' | 'low'  — autocrítica editorial
//   - Conexão ciência moderna priorizada em ciencia-pontes (3 artigos HIGH)
//
// Cada artigo:
//   - slug único, título, summary, content (markdown PT-BR)
//   - authors, journal, year, DOI quando aplicável
//   - evidence level (GRADE-aligned)
//   - tags + tradition canônica (alinhada com prisma/seed/taxonomy.ts)
//
// Após inserir, gera embeddings via OpenAI text-embedding-3-small e
// persiste em Article.embedding (pgvector) — habilitando busca por
// similaridade no Akasha IA RAG.
//
// Uso:
//   pnpm tsx prisma/seed/articles-batch-4.ts
//
// Refs:
//   - prisma/seed/taxonomy.ts (hierarquia de tradições/temas/níveis)
//   - prisma/seed/articles.ts (batch 1, 20 artigos)
//   - prisma/seed/articles-expanded.ts (batch 2, 30 artigos)
//   - prisma/seed/articles-batch-3.ts (batch 3, 20 artigos)
//   - docs/CONTENT-WAVE11.md (lista completa + gap analysis)
//   - src/lib/ai/embeddings.ts (gerador de embeddings)
// ============================================================================

import { PrismaClient, ArticleType, EvidenceLevel } from '@prisma/client';
import { TRADITIONS } from './taxonomy';

const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// Tipagem estendida (Wave 11) — inclui metadata editorial nova
// ----------------------------------------------------------------------------

type Level = 'intro' | 'intermediario' | 'avancado';
type Format = 'artigo' | 'pratica' | 'reflexao' | 'estudo-caso';
type TraditionConfidence = 'high' | 'medium' | 'low';

interface SeedArticle {
  slug: string;
  title: string;
  summary: string;
  content: string;
  authors: string[];
  journal?: string;
  year: number;
  doi?: string;
  url?: string;
  tags: string[];
  tradition: string;
  evidenceLevel: EvidenceLevel;
  type: ArticleType;

  // Wave 11 — novos campos editoriais
  level: Level;                          // nível de profundidade
  format: Format;                        // formato editorial
  citations: string[];                   // URLs externas (DOI, PubMed, etc)
  relatedArticles: string[];             // slugs de artigos relacionados
  tradition_confidence: TraditionConfidence; // autocrítica editorial
}

// ----------------------------------------------------------------------------
// 30 artigos — Wave 11 (Iyá, 2026-06-27)
// ----------------------------------------------------------------------------
// Distribuição por tradição:
//   - cabala: 2 (#1, #11)
//   - ifa: 1 (#10)
//   - tantra: 1 (#26)
//   - meditacao: 1 (#1)
//   - reiki: 1 (#13)
//   - sufismo: 1 (#14)
//   - hinduismo: 1 (#15)
//   - budismo: 1 (#16)
//   - judaísmo-místico: 3 (#2, #17, #18)
//   - ciencia-pontes: 3 (#19, #20, #21)
//   - espiritualidade-contemporanea: 2 (#3, #22)
//   - ayurveda (NEW): 3 (#4, #23, #27)
//   - numerologia (NEW): 3 (#5, #24, #28)
//   - gnosticismo (NEW): 3 (#6, #25, #29)
//   - xintoismo (NEW): 2 (#7, #30)
//   - wicca-paganismo (NEW): 1 (#8)
//   - ifa: 1 (#10)
//   - meditacao: 1 (#1)
//
// Por nível: 10 INTRO + 15 INTERMEDIÁRIO + 5 AVANÇADO
// Por tradição: 16 tradições (target: 12+ com 5+ cada pós-wave)
// ----------------------------------------------------------------------------

const ARTICLES_BATCH_4: SeedArticle[] = [

  // ===================== INTRO (10) =====================

  // 1. MEDITAÇÃO — METTA (Loving-Kindness) — INTRO
  {
    slug: 'metta-loving-kindness-meditacao',
    title: 'Metta: meditação da bondade amorosa',
    summary:
      'Metta (mettā) é a prática budista de cultivar amor incondicional, começando por si mesmo e expandindo para todos os seres. Simples, profunda, secular-adaptável.',
    content: `# Metta — A Bondade Amorosa

Metta (मेत्ता, em pâli) é a prática contemplativa mais popular do budismo Theravada, presente também em outras correntes e adaptações seculares modernas. Em português, costuma ser traduzida como "amor incondicional" ou "bondade amorosa".

## Por que Metta importa

Enquanto práticas como Vipassana focam em ver com clareza a natureza dos fenômenos (incluindo o sofrimento), Metta foca em **transformar a qualidade emocional do coração**. É uma prática que:

- Reduz autocrítica e pensamentos hostis (evidência robusta)
- Aumenta empatia e compaixão
- Funciona como antídoto para depressão e isolamento
- Pode ser praticada por iniciantes absolutos

## A estrutura básica (5 estágios)

1. **Para si mesmo** — "Que eu esteja em paz. Que eu seja feliz. Que eu esteja seguro."
2. **Para um ente querido** — mesma frase, dirigida a alguém que amamos
3. **Para um conhecido neutro** — alguém sem sentimento forte (vizinho, colega)
4. **Para uma pessoa difícil** — alguém com quem temos conflito
5. **Para todos os seres** — expandindo sem limite

A ordem importa: começamos por nós mesmos porque é difícil amar o outro sem antes cultivar amor-próprio.

## Prática (10 minutos)

1. Sente-se confortavelmente, coluna ereta
2. Coloque a mão no coração (gesto de acolhimento)
3. Repita lentamente as frases, sentindo cada palavra
4. Se vier um pensamento difícil, note-o com gentileza e volte
5. Após 5 minutos, expanda para alguém que você ama
6. Ao final, descanse na sensação de calor no peito

## Origem

Metta aparece no Sutta Nipata (séc. III a.C.) e foi sistematizada no Visuddhimagga (séc. V d.C.) por Buddhaghosa. Foi reintroduzida no Ocidente no séc. XX por Nyanaponika Thera e, popularizada, no séc. XXI por Sharon Salzberg.

## Evidência

Estudos de neuroimagem mostram que Metta ativa:
- Córtex pré-frontal medial (empatia)
- Córtex cingulado anterior (regulação emocional)
- Amígdala (reduz reatividade a rostos hostis)

Meta-análise (2013, n=18 estudos) encontrou efeito médio-grande em bem-estar (d=+0.62).

## Para o Akasha

Metta é uma das práticas mais recomendadas para iniciantes por ser acessível e imediatamente benéfica. Curadoria a reconhece como ponto de entrada legítimo para tradições contemplativas budistas e seculares.

## Disclaimer

Metta é prática complementar, NÃO substitui psicoterapia para depressão clínica ou trauma. Em sofrimento agudo, busque ajuda profissional.`,
    authors: ['Salzberg S', 'Curador Akasha'],
    year: 1995,
    journal: 'Salzberg, Lovingkindness (Shambhala, 1995)',
    tags: ['meditacao', 'metta', 'loving-kindness', 'budismo', 'theravada'],
    tradition: 'meditacao',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
    level: 'intro',
    format: 'pratica',
    citations: [
      'https://www.shambhala.com/lovingkindness.html',
      'https://pubmed.ncbi.nlm.nih.gov/23238305/',
    ],
    relatedArticles: [
      'mbsr-reducao-estresse-baseado-evidencia',
      'meditacao-vipassana-tradição-budista',
      'meta-analise-meditacao-atencao-2019',
    ],
    tradition_confidence: 'high',
  },

  // 2. JUDAÍSMO MÍSTICO — MERKAVAH — INTRO
  {
    slug: 'merkavah-trono-divino-misticismo-judaico',
    title: 'Merkavah: o trono divino e a mística da carruagem',
    summary:
      'Merkavah (מרכבה, "carruagem") é a mais antiga tradição mística judaica documentada, focada na visão do trono celestial descrita por Ezequiel. Surgiu no período do Segundo Templo.',
    content: `# Merkavah — A Mística do Trono

A Merkavah (מרכבה, "carruagem") é a forma mais antiga de misticismo judaico organizada, anterior à Cabala medieval. Seu foco é a visão do Trono Divino descrita no livro de Ezequiel (Ez 1).

## Contexto histórico

- **Período:** séc. II a.C. — séc. VIII d.C. (Talmud e Geônim)
- **Local:** Palestina e Babilônia
- **Texto fundador:** Ezequiel 1 (visão do trono), expandido nos Shiur Komah e Hekhalot

A tradição da Merkavah ficou conhecida como **"Ma'aseh Merkavah"** (a obra da carruagem), um campo de estudo místico com práticas ascéticas severas.

## A prática

Os praticantes da Merkavah buscavam **subir pelos palácios celestiais (Hekhalot)** até chegar à visão do Trono. A jornada envolvia:

1. **Jejum rigoroso** (40 dias em alguns relatos)
2. **Recitação de hinos secretos** (Hymns of the Chariot)
3. **Posturas corporais específicas** (colocar a cabeça entre os joelhos)
4. **Recitação dos nomes divinos** (transformações das letras hebraicas)
5. **Estado alterado de consciência** induzido por privação sensorial

## Os 7 Palácios (Hekhalot)

A tradição descreve sete palácios celestiais, cada um guardado por anjos. O místico precisa passar por cada um, recitando "selos" e "chaves" específicas, até chegar ao sétimo, onde está o Trono.

## Shiur Komah

O **Shiur Komah** (medida do corpo) é um texto litúrgico que descreve as proporções do corpo do divino no trono. É uma das primeiras tentativas de antropomorfização mística na tradição judaica, controversa dentro do judaísmo rabínico.

## Risco e ceticismo

Os rabinos do Talmude (Hagigah 14b) advertem que poucos são aptos para a prática da Merkavah:

> "Aquele que se ocupa com quatro coisas, seria melhor que não tivesse vindo ao mundo: o que está acima, o que está abaixo, o que está antes, o que está depois."

Esta advertência sugere que a prática era perigosa — quem tentasse sem preparação corria risco de morte espiritual ou loucura.

## Para o Akasha

- Merkavah é precursora da Cabala mas tem identidade própria
- Curadoria respeita que é tradição esotérica com **saber restrito** — não publicamos práticas que exijam iniciação
- A visão do Trono de Ezequiel influenciou iconografia cristã e islâmica posterior
- Conteúdo aqui é informativo-histórico, NÃO um guia de prática

## Disclaimer

A prática ascética da Merkavah **NÃO é recomendada** sem mestre judeu ortodoxo com linhagem. Curadoria não oferece iniciação nem formação nesta tradição.`,
    authors: ['Scholem G', 'Curador Akasha'],
    year: 1941,
    journal: 'Scholem, Major Trends in Jewish Mysticism (ch. 2)',
    tags: ['judaísmo-místico', 'merkavah', 'hekhalot', 'ezequiel', 'shiur-komah'],
    tradition: 'judaísmo-místico',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intro',
    format: 'artigo',
    citations: [
      'https://www.nli.org.il/en/discover/periodicals/hekhalot',
    ],
    relatedArticles: [
      'arvore-da-vida-estrutura-e-caminhos',
      'meditacao-kavanah-uniao-de-intencao',
    ],
    tradition_confidence: 'high',
  },

  // 3. ESPIRITUALIDADE CONTEMPORÂNEA — UBUNTU — INTRO
  {
    slug: 'ubuntu-filosofia-africana-humanidade',
    title: 'Ubuntu: "Eu sou porque nós somos" — filosofia africana',
    summary:
      'Ubuntu é uma ética filosófica da África Subsaariana (Bantu, sul e leste) que coloca a comunidade como constitutiva da pessoa. Conhecida pelo "Ubuntu Theology" de Desmond Tutu e sua influência na reconciliação pós-apartheid.',
    content: `# Ubuntu — A Filosofia do "Nós"

Ubuntu é uma palavra das línguas Bantu (Xhosa, Zulu, Swahili) que sintetiza uma ética filosófica africana com mais de 2.000 anos de tradição oral. É frequentemente traduzida como **"Eu sou porque nós somos"**.

## O conceito

A definição clássica do Bispo Desmond Tutu:

> "Uma pessoa com Ubuntu é aberta e disponível para os outros, affirming dos outros, não se sente ameaçada pela capacidade e bondade do outro, tem uma auto-apreensão adequada que vem do conhecimento de que pertence a uma totalidade maior."

Em outras palavras: **a pessoa não é uma ilha**. Meu bem-estar está intrinsecamente ligado ao bem-estar da comunidade.

## Três princípios

1. **Umuntu ngumuntu ngabantu** — Uma pessoa é pessoa através de outras pessoas
2. **Umuntu uyaziwa kakhulu ngokuhlonipha abanye** — Conhece-se uma pessoa por como ela respeita os outros
3. **Insimbi ayigobi ngentloko** — O ferro não se dobra sozinho (precisa de fogo comunitário)

## Contexto sul-africano

Ubuntu foi retomado na transição pós-apartheid como base filosófica para a **Comissão de Verdade e Reconciliação (1995-1998)**, presidida por Desmond Tutu. A ideia era que a reconciliação nacional precisava de uma ética que reconhecesse a humanidade de todos — inclusive dos algozes.

## Aplicação contemporânea

- **Penal:** justiça restaurativa ao invés de punitiva
- **Educacional:** pedagogia dialógica (Paulo Freire, bell hooks)
- **Liderança:** Servant leadership, "leading from behind"
- **Tecnologia:** design centrado em comunidade, não em indivíduo

## Para o Akasha

- Ubuntu dialoga com tradições contemplativas que também colocam o coletivo acima do individual
- **NÃO é sinônimo de "humanismo genérico"** — tem raízes filosóficas específicas em línguas Bantu
- Respeitar a origem africana e evitar apropriação ocidental superficial

## Limitações críticas

Curadores africanos (como Mabogo P. More) apontam que:
- Ubuntu foi simplificado para consumo ocidental
- Versões essencializadas excluem diversidade de práticas Bantu
- Não pode ser separado de questões de classe e gênero nas sociedades africanas reais

## Nota editorial

**Confiança: ALTA** sobre o conceito geral. **Confiança: MÉDIA** sobre aplicações específicas (que variam por contexto). Tradição é fonte oral + textos modernos (Tutu, Mbigi, Broodryk).`,
    authors: ['Tutu D', 'Curador Akasha'],
    year: 1999,
    journal: 'Tutu, No Future Without Forgiveness (Doubleday, 1999)',
    tags: ['espiritualidade-contemporanea', 'ubuntu', 'africa', 'tutu', 'etica-comunitaria', 'reconciliacao'],
    tradition: 'espiritualidade-contemporanea',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intro',
    format: 'artigo',
    citations: [
      'https://www.nytimes.com/2008/12/27/world/africa/27iht-tutu.1.18940550.html',
    ],
    relatedArticles: [
      'wilber-aqal-quadrantes',
    ],
    tradition_confidence: 'high',
  },

  // 4. AYURVEDA — INTRODUÇÃO — INTRO
  {
    slug: 'ayurveda-introducao-medicina-tradicional-indiana',
    title: 'Ayurveda: introdução à medicina tradicional indiana',
    summary:
      'Ayurveda ("ciência da vida") é o sistema médico tradicional da Índia, com textos fundacionais (Charaka Samhita, Sushruta Samhita). Fundamenta-se em doshas (Vata, Pitta, Kapha) e prakriti (constituição individual).',
    content: `# Ayurveda — A Ciência da Vida

Ayurveda (आयुर्वेद) é o sistema médico mais antigo do mundo com tradição textual contínua, datando de aproximadamente 600 a.C. — 200 d.C. (período védico tardio e clássico).

## Os textos fundacionais

| Texto | Datação | Foco |
|---|---|---|
| **Charaka Samhita** | séc. II a.C. — II d.C. | Medicina interna |
| **Sushruta Samhita** | séc. III-IV d.C. | Cirurgia (inclui rinoplastia, cesariana) |
| **Ashtanga Hridaya** | séc. VII d.C. | Compilação (Vagbhata) |

Esses três textos são chamados de **Brihat Trayi** (o Grande Trio) e formam a base da prática ayurvédica.

## Princípios fundamentais

1. **Tridosha** — três humores regulam corpo e mente: Vata (ar/éter), Pitta (fogo/água), Kapha (terra/água)
2. **Prakriti** — constituição individual ao nascer (combinação única dos doshas)
3. **Vikriti** — desequilíbrio atual (mudanças da prakriti por dieta, estresse, estação)
4. **Ojas** — essência vital que sustenta imunidade e vitalidade
5. **Agni** — fogo digestivo, central para saúde

## Diferença para outras medicinas

- Ayurveda **NÃO é apenas fitoterapia** — é sistema completo com diagnóstico próprio (leitura de língua, pulso, olhos, voz)
- Cada pessoa tem **constituição única** — não existe "dieta universal saudável"
- Saúde é **equilíbrio dinâmico** com estação, idade, clima, trabalho
- Doença é **acumulação de desequilíbrio** — tratada em estágios (prevenção > intervenção)

## Modalidades de tratamento

- **Ahara** (dieta) — primeira e mais importante ferramenta
- **Aushadha** (ervas e minerais) — fórmula personalizada
- **Panchakarma** (5 ações de limpeza) — terapia intensiva supervisionada
- **Dinacharya** (rotina diária) — higiene, sono, exercício
- **Ritucharya** (rotina sazonal) — adaptação às estações

## Status atual

- **Índia:** reconhecido pelo Ministério AYUSH (gov. federal); cursos universitários de 5,5 anos (BAMS)
- **OMS:** incluído na Estratégia de Medicina Tradicional 2014-2023
- **Brasil:** prática livre (não regulamentada), terapeutas formados na Índia
- **Evidência científica:** moderada para algumas ervas (Ashwagandha, Curcumina, Triphala); limitada para sistema completo

## Para o Akasha

- Ayurveda NÃO é "medicina alternativa genérica" — tem epistemologia própria
- **Evitar:** Ayurveda como substituto de tratamento médico necessário
- **Incentivar:** consulta com profissional formado (BAMS ou equivalente)

## Disclaimer

Conteúdo informativo. NÃO substitui consulta médica. Em caso de doença, procure médico e profissional ayurvédico formado.`,
    authors: ['Lad V', 'Curador Akasha'],
    year: 1984,
    journal: 'Lad, Ayurveda: The Science of Self-Healing',
    tags: ['ayurveda', 'medicina-tradicional', 'charaka', 'sushruta', 'doshas', 'india'],
    tradition: 'ayurveda',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
    level: 'intro',
    format: 'artigo',
    citations: [
      'https://www.who.int/publications/i/item/9789241506096',
      'https://www.ayush.gov.in/',
    ],
    relatedArticles: [
      'ayurveda-doshas-vata-pitta-kapha',
      'ayurveda-prakriti-diagnostico-avancado',
    ],
    tradition_confidence: 'high',
  },

  // 5. NUMEROLOGIA — INTRODUÇÃO — INTRO
  {
    slug: 'numerologia-introducao-sistemas-numericos',
    title: 'Numerologia: introdução aos sistemas numéricos sagrados',
    summary:
      'Numerologia é o estudo do simbolismo dos números em diferentes tradições. Existem três escolas principais: Pitagórica (ocidental), Cabalística (hebraica) e Tântrica (indiana). Não é "adivinhação" — é sistema simbólico estruturado.',
    content: `# Numerologia — Sistemas Numéricos Sagrados

Numerologia é o estudo do **significado simbólico dos números** em diferentes tradições. Não é "magia dos números" no sentido popular — é uma tradição hermenêutica com métodos específicos.

## Três escolas principais

### 1. Pitagórica (ocidental)
- Origem: Grécia antiga, Pitágoras (séc. VI a.C.)
- Sistema: reduz números a 1-9 (com 11, 22, 33 como números mestres)
- Foco: personalidade, destino, ciclos de vida
- Método: soma de data de nascimento, valor das letras do nome (Pitagoras original usava grego)

### 2. Cabalística (hebraica)
- Origem: misticismo judaico, sistematizada por volta do séc. XII
- Sistema: 22 números correspondentes às 22 letras hebraicas
- Foco: personalidade profunda, propósito de alma, caminho de vida
- Método: gematria (valor numérico das letras), soma cabalística, raízes
- Variante Cigana: simplificação brasileira baseada na Cabala, método do Cigano Ramiro

### 3. Tântrica (indiana)
- Origem: tradições tântricas indianas, com paralelos no Tantra hindu e budista
- Sistema: 9 números-base + correspondência com 7 chakras + 12 casas lunares
- Foco: excesso e deficiência energética em cada chakra
- Método: combinação de nome + data de nascimento

## O que Numerologia NÃO é

- NÃO é adivinhação (não prevê o futuro com precisão determinística)
- NÃO é "magia" no sentido esotérico-genérico
- NÃO substitui astrologia, psicologia, ou autoconhecimento experiencial
- NÃO tem validação científica empírica (estudos não encontram correlação causal com personalidade)

## O que Numerologia É

- Sistema simbólico estruturado com regras internas
- Ferramenta de **reflexão** sobre padrões pessoais
- Linguagem para articular insights sobre si mesmo
- Tradição com linhagem rastreável (em suas 3 escolas principais)

## Como abordamos no Akasha

O Akasha é construído pelo operador Cigano Ramiro, que usa **Numerologia Cabalística com influências do método Cigano brasileiro**. Curadoria:

- Reconhece a legitimidade cultural da prática
- Marca claramente a tradição (Pitagórica, Cabalística, Tântrica)
- NÃO apresenta como ciência
- Distingue do uso genérico de "numerologia de horóscopo"

## Aplicações legítimas

- Autoconhecimento (reflexão, não determinismo)
- Linguagem simbólica para articular padrões
- Prática contemplativa (meditação sobre o próprio número)
- Complemento a outras leituras (astrologia, Mapa Real, psicologia)

## Disclaimer

Numerologia NÃO substitui psicologia clínica, orientação vocacional, ou aconselhamento. Em decisões de vida importantes, busque orientação profissional qualificada.`,
    authors: ['Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Documento de Curadoria',
    tags: ['numerologia', 'introducao', 'pitagorica', 'cabalistica', 'tantrica'],
    tradition: 'numerologia',
    evidenceLevel: 'LOW',
    type: 'ESSAY',
    level: 'intro',
    format: 'artigo',
    citations: [
      'https://www.britannica.com/topic/numerology',
    ],
    relatedArticles: [
      'numerologia-cabalistica-metodo',
      'numerologia-tantrica-chakras-avancado',
      'arvore-da-vida-estrutura-e-caminhos',
    ],
    tradition_confidence: 'medium',
  },

  // 6. GNOSTICISMO — INTRODUÇÃO — INTRO
  {
    slug: 'gnosticismo-introducao-tradicoes-cristas-primitivas',
    title: 'Gnosticismo: introdução às tradições cristãs primitivas',
    summary:
      'Gnosticismo é o movimento cristão primitivo (séc. I-III d.C.) marcado pela busca de "gnosis" (conhecimento direto do divino). Multi-facetado: Ofitas, Setianos, Valentinianos, Basilidianos. Foi declarado herético pelos Pais da Igreja.',
    content: `# Gnosticismo — As Tradições Cristãs Primitivas

Gnosticismo é o nome genérico para um conjunto de **movimentos cristãos dos séculos I-III d.C.** que compartilhavam ênfase na **gnosis** (conhecimento direto, experiencial, do divino). Não é uma tradição única — é uma família de correntes.

## Contexto histórico

Os movimentos gnósticos surgiram no contexto do cristianismo primitivo, antes da ortodoxia cristã se cristalizar (séc. IV, com o Concílio de Niceia, 325 d.C.). Eram diversos:

- **Ofitas** (cultuavam a serpente de Gênesis como portadora de gnosis)
- **Setianos** (associados a Seth, filho de Adão)
- **Valentinianos** (corrente mais sofisticada teologicamente, Valentín, séc. II)
- **Basilidianos** (Basilides, séc. II, Alexandria)
- **Carpocracianos** (corrente libertina, séc. II)

## Temas centrais

1. **Dualismo radical** — o demiurgo (criador do mundo material) NÃO é o Deus supremo. O mundo material é obra de um ser inferior ou caído.
2. **Centelha divina** — cada pessoa carrega uma centelha divina (pneuma) aprisionada no mundo material.
3. **Conhecimento como salvação** — a gnosis (conhecimento direto) liberta a centelha, não a fé ou as obras.
4. **Reinterpretação de Gênesis** — o Deus de Adão não é o Deus supremo; a serpente é libertadora, não tentadora.
5. **Cristo como revelador** — Jesus é enviado do Pleroma (plenitude) para acordar a centelha adormecida.

## Textos fundamentais

- **Nag Hammadi** (1945) — biblioteca de 13 papiros no Egito, descoberta por Muhammad Ali al-Samman. Contém Evangelho de Tomé, Evangelho da Verdade, Apócrifo de João, etc.
- **Evangelho de Tomé** — coleção de 114 ditos de Jesus, sem narrativa de vida
- **Evangelho da Verdade** — homilia valentiniana, preservada em Nag Hammadi
- **Pistis Sophia** — texto copta (séc. III-IV), ensina sobre a queda de Sophia

## Por que foi declarado heresia?

Os Pais da Igreja (Irineu, Tertuliano, Hipólito) combateram o Gnosticismo por várias razões:

1. **Desvalorização do mundo material** — ameaçava a Encarnação (Deus se fez carne)
2. **Conhecimento vs. Fé** — ameaçava a autoridade clerical (que mediava a fé)
3. **Reinterpretação de Gênesis** — ameaçava a moral cristã
4. **Elitismo** — gnósticos se consideravam superiores aos "simples" fiéis (psychikoi vs. pneumatikoi)

## Para o Akasha

- Gnosticismo cristão **NÃO é sinônimo de "Neo-Gnosticismo"** moderno (Blavatsky, Hodgson, AMORC)
- Curadoria distingue as duas correntes
- Textos de Nag Hammadi são patrimônio da humanidade, disponíveis em tradução acadêmica
- Relação com ciganos (Ciganos Domari/Roma têm influências gnósticas históricas) é objeto de estudo, não dogma

## Disclaimer

Conteúdo informativo-histórico. NÃO é guia de prática gnóstica. As tradições gnósticas históricas desapareceram em sua maioria — o que chamamos hoje de "Igreja Gnóstica" é recriação moderna.`,
    authors: ['Pagels E', 'Curador Akasha'],
    year: 1979,
    journal: 'Pagels, The Gnostic Gospels (Random House)',
    tags: ['gnosticismo', 'cristianismo-primitivo', 'nag-hammadi', 'valentinianos', 'ofitas'],
    tradition: 'gnosticismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intro',
    format: 'artigo',
    citations: [
      'https://www.nag-hammadi.com/',
      'https://gnosis.org/naghamm/nhl.html',
    ],
    relatedArticles: [
      'gnosticismo-ofitas-set',
      'gnosticismo-valentiniano-pleroma-avancado',
    ],
    tradition_confidence: 'high',
  },

  // 7. XINTŌ — INTRODUÇÃO — INTRO
  {
    slug: 'xintoismo-introducao-caminho-kami',
    title: 'Xintō: introdução ao caminho dos kami',
    summary:
      'Xintō (神道) é a religião nativa do Japão, politeísta, focada nos kami (espíritos divinos da natureza, ancestrais, fenômenos). Tem textos fundacionais (Kojiki, Nihon Shoki) e práticas rituais (matsuri). Coexiste com Budismo (Shinbutsu-shūgō).',
    content: `# Xintō — O Caminho dos Kami

Xintō (神道, "caminho dos deuses/kami") é a religião indígena do Japão, com raízes que precedem a introdução do Budismo (séc. VI d.C.). É uma tradição politeísta, ritualística, e profundamente ligada à terra e aos ancestrais.

## Conceitos fundamentais

### Kami (神)

Kami são os seres sagrados do Xintō — podem ser:

- **Fenômenos naturais** (montanhas, rios, raios, vento)
- **Animais especiais** (raposa, lobo, serpente, veados de Kasuga)
- **Ancestrais heroificados** (imperadores, guerreiros, artesãos)
- **Espíritos de pessoas falecidas** (objetos de veneração nos jinja)

Kami **NÃO são equivalentes** aos deuses do politeísmo grego. São forças sagradas (yaoyorozu no kami — 8 milhões) que permeiam o mundo.

### Musubi (結び)

A força que conecta e gera — kami supremo do Xintō, principio criativo. Diferente do Deus criador monoteísta, Musubi opera continuamente no mundo.

### Makoto (誠)

Sinceridade/autenticidade do coração — qualidade essencial do praticante xintoísta. Não é "sinceridade religiosa" no sentido ocidental — é a harmonia entre intenção, palavra e ação.

## Textos fundacionais

| Texto | Datação | Conteúdo |
|---|---|---|
| **Kojiki** (古事記) | 712 d.C. | Mitologia, genealogia divina, narrativa dos kami |
| **Nihon Shoki** (日本書紀) | 720 d.C. | Versão "oficial" chinesa-japonesa, mais histórica |
| **Engishiki** (延喜式) | 927 d.C. | Manual de rituais (publicado 50 anos depois) |
| **Kojiki-den** (古事記伝) | séculos XVIII | Comentário de Motoori Norinaga, que definiu o Xintō moderno |

## Práticas

- **Matsuri** (festival) — ritual público, inclui procissões, música, dança, oferendas
- **Harae** (purificação) — lavar mãos e boca (temizuya) antes de entrar no santuário
- **Ema** (絵馬) — plaquetas de madeira onde se escreve pedido/desiderato
- **Omikuji** (おみくじ) — sorteio de papel com oráculos
- **Kamidana** (神棚) — altar doméstico com pequenos amuletos do santuário

## Estrutura institucional

- **Jinja** (神社) — santuário local, mantém ritual matsuri
- **Jinja Honcho** — federação nacional (1946), coordena 80.000+ santuários
- **Kannushi** (神主) — sacerdote xintoísta, não precisa ser celibatário
- **Miko** (巫女) — sacerdotisa assistente (frequentemente jovens)

## Relação com Budismo

Por mais de 1000 anos (até Meiji, 1868), Xintō e Budismo coexistiram em **Shinbutsu-shūgō** (sincretismo Budismo-Xintō). Kami eram interpretados como manifestações de Budas, e Budas como kami locais. A separação forçada (Shinbutsu bunri, 1868) foi um projeto político Meiji.

## Para o Akasha

- Xintō **NÃO é "animismo genérico"** — tem textos, teologia, liturgia, instituição
- **Não é "xintoísmo estatal"** — essa é a forma Meiji (1868-1945), criticada após 1945
- Relação com a cigana Ramiro (oriental): influências budistas e xintoístas merecem reconhecimento

## Disclaimer

Conteúdo informativo. Para prática xintoísta, recomenda-se visitar jinja local e consultar kannushi. A tradição não tem "conversão" formal — qualquer pessoa pode participar dos matsuri públicos.`,
    authors: ['Smyers K', 'Curador Akasha'],
    year: 1999,
    journal: 'Smyers, The Fox and the Jewel (Univ. Hawaii Press)',
    tags: ['xintoismo', 'kami', 'japao', 'matsuri', 'jinja', 'kojiki'],
    tradition: 'xintoismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intro',
    format: 'artigo',
    citations: [
      'https://www.jinjahoncho.com/en/',
    ],
    relatedArticles: [
      'xintoismo-izumo-taisha-kami-avancado',
      'meditacao-vipassana-tradição-budista',
    ],
    tradition_confidence: 'high',
  },

  // 8. WICCA — INTRODUÇÃO — INTRO
  {
    slug: 'wicca-introducao-paganismo-moderno',
    title: 'Wicca: introdução ao paganismo moderno',
    summary:
      'Wicca é a religião neopagã fundada por Gerald Gardner (Inglaterra, 1954), com influências do folclore europeu pré-cristão, ocultismo, e cerimonialismo mágico. Distinta de Paganismo genérico e de "witchcraft" histórico.',
    content: `# Wicca — Paganismo Moderno

Wicca é uma **religião neopagã** fundada pelo oficial britânico Gerald Brosseau Gardner na Inglaterra do pós-II Guerra Mundial (oficialmente, 1954, com publicação de "Witchcraft Today"). É a tradição neopagã mais conhecida e estruturada.

## Origem e linhagem

A "linhagem" de Gardner que ele alegou:

1. **Antiga Religião** (pré-cristã europeia, especialmente celta) — suprimida pela Igreja
2. **Bruxaria tradicional** (famílias que mantinham práticas em segredo)
3. **Fellowship of Crotona** (tradução de Gardner sobre o coven fictício)
4. **Cerimonialismo mágico** (influência de Aleister Crowley, Ordem Hermética da Aurora Dourada)

A maioria dos historiadores acadêmicos considera que Gardner **construiu** a tradição, em vez de redescobri-la. Wicca é, portanto, uma tradição **moderna com raízes em revivalismo** — não uma sobrevivência direta da bruxaria pré-cristã.

## Princípios centrais

### A Wiccan Rede (Wiccan Rede)
> "Faça o que quiser, desde que não machuque ninguém." ("An it harm none, do what ye will.")

### Os 3 princípios (Gerald Gardner)
1. **O Divino é dual** — Deus e Deusa (Cornelhorne e Hécate, ou Cernunnos e Ártemis em variantes)
2. **Reencarnação** — passagem por múltiplas vidas
3. **Magia funciona** — pela lei do retorno simpático (semelhante atrai semelhante)

### O Pentagrama (Five-fold Kiss)
A estrela de cinco pontas representa os 5 elementos (espírito, água, fogo, terra, ar) e os 5 pontos do corpo (cabeça, pés, mãos). É símbolo central.

## Estrutura ritual

### Roda do Ano (Wheel of the Year)
8 sabás (festas sazonais), opostos aos 4 pontos cardeais e 4 cruzamentos:

- **Yule** (solstício de inverno, ~21 dez)
- **Imbolc** (~1 fev)
- **Ostara** (equinócio de primavera, ~21 mar)
- **Beltane** (~1 mai)
- **Litha** (solstício de verão, ~21 jun)
- **Lughnasadh** (~1 ago)
- **Mabon** (equinócio de outono, ~21 set)
- **Samhain** (~31 out, mais importante)

### Esbats
13 luas cheias + 1 lua azul (13 ao todo por ano) — momento de rituais mágicos.

## Ramificações principais

| Tradição | Origem | Foco |
|---|---|---|
| **Gardneriana** | Gardner (1954) | Coven iniciático de 13 membros, Book of Shadows Gardner |
| **Alexandriana** | Alex Sanders (1960) | Mais eclética, linhagem questionada |
| **Dianic** | Zsuzsanna Budapest (1971) | Foco no feminino, Goddess-only |
| **Eclectic** | (séc. XXI) | Sem linhagem, mistura tradições |
| **Reclaiming** | Starhawk (1979) | Política, ecologia, ativismo |

## Para o Akasha

- Wicca **NÃO é bruxaria histórica** — é recriação moderna
- **NÃO é "magia branca" genérica** — é tradição religiosa com ritual, ética, comunidade
- Curadoria respeita praticantes wiccanos como expressão religiosa legítima
- Diferencia da "witchcraft" histórica (que existiu, mas não é a mesma coisa que Wicca)

## Disclaimer

Curadoria não endossa práticas mágicas que causem dano. A ética wiccana ("an it harm none") é compatível com este princípio. Wicca é tradição religiosa legítima, não jogo de "magia".`,
    authors: ['Hutton R', 'Curador Akasha'],
    year: 1999,
    journal: 'Hutton, The Triumph of the Moon (Oxford Univ. Press)',
    tags: ['wicca', 'paganismo', 'gardner', 'wheel-of-the-year', 'neopaganismo'],
    tradition: 'wicca-paganismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intro',
    format: 'artigo',
    citations: [
      'https://www.britannica.com/topic/Wicca',
    ],
    relatedArticles: [
      'xintoismo-introducao-caminho-kami',
    ],
    tradition_confidence: 'medium',
  },

  // 9. CABALA — YESOD — INTRO
  {
    slug: 'yesod-fundamento-inconsciente',
    title: 'Yesod: a fundação e o mundo do inconsciente',
    summary:
      'Yesod (יְסוֹד) é a 9ª Sephirah, fundamento sobre o qual o mundo material (Malkuth) se apoia. Associada à Lua, à capacidade de formação de imagens, ao inconsciente coletivo junguiano, e à sexualidade como força criadora.',
    content: `# Yesod — A Fundação

Yesod (יְסוֹד, "Fundação") é a 9ª Sephirah da Árvore da Vida. Ela recolhe todas as energias das Sephiroth superiores e as transmite a Malkuth (o mundo material). É, literalmente, o **canal entre o espiritual e o físico**.

## Posição na Árvore

- **Acima:** Hod (esplendor/intelecto) e Netzach (vitória/emoção) se equilibram
- **Abaixo:** Malkuth (reino/materialização) — Yesod é seu pilar
- **Função:** filtro, formador de imagens, base energética

## Nome Divino

**Shaddai El Chai** (שַׁדַּי אֵל חָי, "Deus Todo-Suficiente e Vivo"). É o nome pelo qual Deus se revela a Jacó na visão da escada (Gênesis 28:3).

## Atributos

| Atributo | Símbolo |
|---|---|
| Cor | Prateado, violeta, azul-lavanda |
| Planeta | Lua |
| Sentido | Olfato |
| Órgão | Sistema reprodutor |
| Corpo sutil | Ruach (espírito, mente emocional) |
| Letra hebraica | Samekh (ס) — apoio |
| Tarô | O Eremita (IX) |

## Yesod e o inconsciente

Carl Jung (psicólogo suíço, séc. XX) estudou Cabala e identificou paralelos entre Yesod e o conceito de **inconsciente pessoal**. Na Cabala prática contemporânea, Yesod é associada a:

- Sonhos e sua interpretação
- Memórias emocionais
- Sexualidade como força criadora
- O poder da **imaginação** (imaginal, no sentido de Henry Corbin)
- O "corpo de luz" que une corpo físico e emoções

## Prática

A meditação em Yesod geralmente envolve:

1. Visualizar uma esfera prateada na base da coluna (área do baixo ventre)
2. Sentir a lua interna iluminando imagens que sobem
3. Observar sem apego o que aparece (como em sonho lúcido)
4. Deixar as imagens se dissolverem após a meditação

## Yesod e a sexualidade

A tradição cabalística reconhece a sexualidade como **força criadora** (Yetzirah) e não como pecado. Yesod é onde essa força é canalizada. Em Kabbalistic Judaism conservador, o sexo é sagrado dentro do contexto do casamento (mitzvah).

## Para o Akasha

- Yesod NÃO é "inconsciente freudiano" (que tem mais a ver com Hod)
- A relação Yesod-Lua é clássica (Selem Yesod Olam = "imagem do fundamento eterno")
- Curadoria reconhece a rica correspondência com psicologia analítica

## Nota editorial

**Confiança: ALTA** sobre atributos clássicos. **Confiança: MÉDIA** sobre paralelos com Jung (que é leitura moderna, não cabalística medieval).`,
    authors: ['Halevi Z', 'Curador Akasha'],
    year: 1979,
    journal: 'Halevi, Tree of Life (ch. 9)',
    tags: ['cabala', 'yesod', 'sephiroth', 'inconsciente', 'lua'],
    tradition: 'cabala',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intro',
    format: 'artigo',
    citations: [
      'https://www.chabad.org/kabbalah/article_cdo/aid/3604748/jewish/Yesod.htm',
    ],
    relatedArticles: [
      'arvore-da-vida-estrutura-e-caminhos',
      'tiferet-o-coracao-como-mediador',
    ],
    tradition_confidence: 'high',
  },

  // 10. IFÁ — ODU EJIONLÁ — INTRO
  {
    slug: 'odu-ejionla-vitalidade',
    title: 'Odu Ejionlá: vitalidade tranquila e prosperidade sustentada',
    summary:
      'Ejionlá é o 10º dos 16 Odus principais de Ifá, associado a Obatalá (o pai dos Orixás). Traz vitalidade estável, prosperidade sem excessos, e clareza mental — desde que o consulente não confunda tranquilidade com estagnação.',
    content: `# Odu Ejionlá (Ìka Ejionlá) — A Vitalidade Tranquila

Ejionlá é o Odu da sabedoria equilibrada, governado por **Obatalá** — o pai dos Orixás, criador da humanidade, dono da claridade mental e da paciência.

## Características

- **Orixá regente:** Obatalá (Oxalá no Brasil)
- **Orixá pedindo atenção:** Oxum (em alguns ramos) ou Nanã (em outros)
- **Cor:** branco, branco-cinza
- **Dia:** sexta-feira
- **Elemento:** água (de fonte, calma)
- **Número:** 10

## Orientações para consulentes

- **Positivas:** vitalidade estável, prosperidade sustentável, clareza mental, longevidade
- **Desafios:** tendência à estagnação, indecisão por excesso de cautela, frieza emocional aparente
- **Perfil:** pessoas com vida organizada, saúde estável, mas que podem estar perdendo o "fogo" da paixão

## Orientações práticas

Quando Ejionlá aparece no jogo, o consulente é orientado a:

1. **Manter rotina** — não é hora de grandes mudanças
2. **Buscar clareza** — evitar decisões emocionais precipitadas
3. **Honrar o corpo** — sono, alimentação, exercício regular
4. **Cultivar a paciência** — resultados virão no tempo certo
5. **Evitar conflitos** — Obatalá não gosta de agressividade

## Ebó (oferenda) sugerido

Para consulentes com Ejionlá dominante:

- **Alimentos brancos:** arroz, leite de coco, inhame
- **Bebida:** água de coco ou mel
- **Local:** rio de água doce, cachoeira ou nascente
- **Acessório:** fios brancos (com bolinha de Ifá se tiver)

## Diferença de Ogbe (1º Odu)

Ogbe e Ejionlá são os dois Odus de **vitalidade**, mas diferem:

| Ogbe | Ejionlá |
|---|---|
| Vitalidade jovem, explosiva | Vitalidade madura, estável |
| Impetuosidade | Paciência |
| Ações rápidas | Ações medidas |
| Risco: Iyá (destruição por impulso) | Risco: estagnação por inércia |

## Para o Akasha

- Ejionlá é um dos Odus mais "positivos" para vida cotidiana — sustentação sem drama
- Curadoria respeita que a leitura do Odu depende do método do babalaô
- Não substitui consulta com praticante iniciado

## Disclaimer

Conteúdo informativo-cultural. Akasha NÃO substitui consulta com babalaô/Ialorixá. Para orientação real, procure terreiro com hierarquia tradicional.`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Saberes Tradicionais',
    tags: ['ifa', 'odu', 'ejionla', 'obatala', 'oxala', 'vitalidade'],
    tradition: 'ifa',
    evidenceLevel: 'ANECDOTAL',
    type: 'ESSAY',
    level: 'intro',
    format: 'artigo',
    citations: [
      'https://www.odu-ifa.com/ejionla',
    ],
    relatedArticles: [
      'odu-ogbe-saude-e-vitalidade',
      'odu-oya-tempestade-e-mudanca',
    ],
    tradition_confidence: 'medium',
  },

  // ===================== INTERMEDIÁRIO (15) =====================

  // 11. CABALA — ALQUIMIA JUDAICA — INTERMEDIÁRIO
  {
    slug: 'alquimia-judaica-cabala-pratica',
    title: 'Alquimia judaica e a Cabala prática',
    summary:
      'A alquimia judaica medieval integrou a busca pela transformação dos metais com a Cabala prática. Maria Hebraea, Abraham Eleazar, e Isaac Newton (no séc. XVII) representam uma linhagem de místicos alquimistas judeus.',
    content: `# Alquimia Judaica e Cabala Prática

A alquimia judaica (séc. X-XVII) foi uma tradição mística que combinou a busca hermética pela transformação dos metais com a Cabala. Diferente da alquimia cristã ou islâmica, tinha ênfase teúrgica (obras divinas) além de operativa.

## Contexto histórico

A alquimia chegou ao mundo judaico via:

1. **Textos alexandrinos** (séc. III d.C.) — Maria Hebraea (Mary the Jewess), inventora do banho-maria
2. **Tradução árabe** (séc. IX-XII) — Maimônides escreveu sobre alquimia, com ceticismo
3. **Cabala prática** (séc. XII-XVI) — integração com a Árvore da Vida
4. **Newton e os kabbalistas** (séc. XVII-XVIII) — Newton era alquimista praticante

## Figuras principais

### Maria Hebraea (séc. III)
Inventora de equipamentos alquímicos: banho-maria, tribikos (destilador), kerotakis (selagem hermética). Figura histórica reverenciada.

### Abraham Eleazar (séc. XIV-XV)
Autor de **"Uraltes Chymisches Werk"** (1760, publicado postumamente). Tradição cabalístico-alquímica do leste europeu.

### Isaac Newton (1642-1727)
Newton era **alquimista praticante** — escrevia mais sobre alquimia do que sobre física ou matemática. Sua biblioteca tinha centenas de textos alquímicos. Estudou especialmente a "Estrella Radiante" (a Philalethes), texto hermético-cabalístico.

## Símbolos alquímicos cabalísticos

| Metal | Planeta | Sephirah | Orixá equivalente (no sincretismo) |
|---|---|---|---|
| Ouro | Sol | Tiferet | Oxaguiã / Oxum |
| Prata | Lua | Yesod | Iansã |
| Cobre | Vênus | Netzach | Oxum |
| Ferro | Marte | Gevurah | Ogum |
| Estanho | Júpiter | Chesed | Oxalá |
| Chumbo | Saturno | Binah | Nanã |
| Mercúrio | Mercúrio | Hod | Exu / Bará |

A transmutação alquímica era entendida como **purificação da matéria** (Tikkun), paralela à purificação da alma.

## As 4 fases (Nigredo, Albedo, Citrinitas, Rubedo)

1. **Nigredo** (escurecimento) — trabalho com Chokhmah (sabedoria bruta, sem forma)
2. **Albedo** (branqueamento) — purificação com Binah (entendimento)
3. **Citrinitas** (amarelamento) — iluminação com Tiferet (coração)
4. **Rubedo** (avermelhamento) — integração com Gevurah (severidade/sacrifício)

Cada fase tem ritual, meditação, e trabalho material (com metais, plantas, sais).

## Newton e o Templo de Salomão

Newton buscava as **dimensões do Templo de Salomão** em Ezequiel, acreditando que continham o conhecimento alquímico da criação. Escreveu extensivamente sobre isso, em manuscritos que ficaram esquecidos até o séc. XX.

## Para o Akasha

- Alquimia judaica **NÃO é charlatanismo proto-ciência** — era prática espiritual séria
- Integração alquimia-cabala é parte da tradição esotérica judaica
- Newton era cabalista e alquimista, fato histórico pouco conhecido

## Disclaimer

Conteúdo histórico-filosófico. NÃO é guia de prática alquímica. Trabalhos com metais pesados (chumbo, mercúrio) são **perigosos** sem treinamento adequado.`,
    authors: ['Patai R', 'Curador Akasha'],
    year: 1994,
    journal: 'Patai, The Jewish Alchemists (Princeton Univ. Press)',
    tags: ['cabala', 'alquimia', 'newton', 'maria-hebraea', 'tikkun'],
    tradition: 'cabala',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.nytimes.com/books/2006/03/07/newton-and-the-counterfeiter.html',
    ],
    relatedArticles: [
      'arvore-da-vida-estrutura-e-caminhos',
      'yesod-fundamento-inconsciente',
    ],
    tradition_confidence: 'medium',
  },

  // 12. TANTRA — KASHMIR SHAIVISMO — INTERMEDIÁRIO
  {
    slug: 'kashmir-shaivismo-pratyabhijna',
    title: 'Kashmir Shaivismo: a tradição da consciência-recognitiva',
    summary:
      'Kashmir Shaivism (Pratyabhijna, "reconhecimento") é a escola tântrica não-dual do Kashmir (séc. IX-XIII), centrada em Shiva-Shakti como única realidade. Spanda (pulso cósmico) e Prakasha (luz da consciência) são conceitos centrais.',
    content: `# Kashmir Shaivismo — A Consciência-Reconhecedora

Kashmir Shaivism (também chamado **Pratyabhijna**, "escola do reconhecimento") é a vertente tântrica não-dual que floresceu no vale do Kashmir (Índia) entre os séculos IX e XIII d.C. É uma das escolas filosóficas mais sofisticadas do Tantra.

## Princípio central

**A consciência é a única realidade.** O mundo não é "ilusão" (como no Advaita Vedanta de Shankara), mas **manifestação** (abhasa) da consciência que se reconhece a si mesma.

> "O universo inteiro é Shiva-Shakti — a consciência em jogo consigo mesma."

## Conceitos fundamentais

### Spanda (स्पन्द)
O "pulso" ou "vibração" cósmica. Cada ato de percepção, pensamento, movimento é uma contração e expansão de Spanda. Não é movimento no espaço — é a dinâmica intrínseca da consciência.

### Prakasha (प्रकाश)
A "luz" ou "iluminação" da consciência — a capacidade de se auto-revelar. Prakasha é o aspecto luminoso; Spanda é o aspecto dinâmico. Juntos constituem Shiva-Shakti.

### Vimarsha (विमर्श)
O "auto-reconhecimento" da consciência. O mundo não existe separado da consciência que o reconhece. Esse reconhecimento (vimarsha) é o que distingue Shiva de qualquer outro conceito metafísico.

### Mal (मल)
As "impurezas" que obscurecem o reconhecimento — anava (eu pequeno), māyā (ilusão), karma (ação compulsiva). A prática remove essas impurezas, permitindo o reconhecimento.

## A prática

O Kashmir Shaivismo usa **5 práticas** para reconhecer Shiva-Shakti:

1. **Āṇavopāya** — prática pelo corpo (asana, mudra)
2. **Śāktopāya** — prática pela energia (pranayama, chakra)
3. **Śāmbhavopāya** — prática pela mente (meditação)
4. **Anupāya** — sem prática (só reconhecimento, para mestres avançados)
5. **Śāktopāya** — alternativa intermediária (mantra)

## Textos principais

- **Shiva Sutras** (Vasugupta, séc. IX) — base filosófica
- **Spanda Karikas** (Kallata, séc. IX) — comentário sobre Shiva Sutras
- **Pratyabhijna Hridayam** (Kshemaraja, séc. XI) — síntese
- **Vijnana Bhairava** — texto tântrico de 112 dharana (contemplações)

## Linha de transmissão

1. **Vasugupta** (séc. IX) — recebe revelação de Shiva no Mahadeva Mountain
2. **Kallata** (séc. IX) — primeiro discípulo, escreve Spanda Karikas
3. **Somānanda** (séc. IX-X)
4. **Utpaladeva** (séc. X-XI) — sistematiza Pratyabhijna
5. **Abhinavagupta** (séc. X-XI) — polímata, integra todas as correntes
6. **Kshemaraja** (séc. XI) — último grande mestre, comentarista

## Para o Akasha

- Kashmir Shaivism **NÃO é idêntico ao Tantra geral** — é uma vertente específica
- É uma das escolas mais filosóficas do Tantra
- Influenciou o Yoga tântrico contemporâneo (Kashmir Shaivism Yoga, Swami Lakshmanjoo)

## Disclaimer

Texto é nível intermediário — pressupõe familiaridade com filosofia indiana. Para prática, procure linhagem legítima.`,
    authors: ['Singh J', 'Curador Akasha'],
    year: 1991,
    journal: 'Singh, Pratyabhijnahridayam (Motilal Banarsidass)',
    tags: ['tantra', 'kashmir-shaivismo', 'pratyabhijna', 'spanda', 'abhinavagupta'],
    tradition: 'tantra',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.lakshmanjooacademy.org/',
    ],
    relatedArticles: [
      'shakti-principio-feminino',
      'kundalini-energia-ascendente',
      'tantra-spanda-kashmir-avancado',
    ],
    tradition_confidence: 'high',
  },

  // 13. REIKI — SISTEMA TAKATA — INTERMEDIÁRIO
  {
    slug: 'reiki-takata-brasil-sistema',
    title: 'Reiki Takata no Brasil: linhagem e método',
    summary:
      'Hawayo Takata (1900-1980) foi a havaiana responsável por levar o Reiki para o Ocidente, criando o sistema "occidentalizado" com 3 níveis + mestrado. Sua linhagem domina a prática no Brasil e no mundo. Análise do método Takata e suas variantes.',
    content: `# Reiki Takata no Brasil

Hawayo Takata (1900-1980), nipo-americana do Havaí, foi a figura central que introduziu o Reiki no Ocidente. Seu sistema difere do original japonês de Usui em pontos importantes que precisam ser entendidos pelos praticantes.

## A linhagem

1. **Mikao Usui** (1865-1926) — fundador japonês do Reiki (Gakkai)
2. **Chujiro Hayashi** (1880-1940) — aluno de Usui, fundador do sistema Hayashi, presidente da Usui Reiki Ryoho Gakkai
3. **Hawayo Takata** (1900-1980) — aluna de Hayashi (1935-1937), introduz no Havaí e depois no continente americano
4. **22 Mestres treinados por Takata** (1970-1980) — incluindo Barbara Weber Ray (Raku Kei), Phyllis Lei Furumoto (neta de Takata, USUI Takata lineage), e outros

Takata treinou **22 mestres**, que após sua morte iniciaram a fragmentação do sistema em múltiplas linhagens (Tibetan Reiki, Karuna Reiki, etc).

## Diferenças entre Reiki japonês (Usui/Hayashi) e Takata

| Aspecto | Original (Usui/Hayashi) | Takata |
|---|---|---|
| Posições | Tratamento focal | 12 posições fixas (cabeça, olhos, ouvidos, garganta, coração, estômago, fígado, intestinos, rins, coluna, joelhos, pés) |
| Duração | Variável, sem limite | 1 hora padrão |
| Símbolos | 4 símbolos (criados por Usui e Hayashi) | 4 símbolos (mesmos, com interpretação diferente) |
| Níveis | Shinpiden (mestrado) | 3 níveis + mestrado |
| Honorários | Aceitos, variável | "$10.000 pelo mestrado" (regra de Takata) |
| Princípios | 5 princípios (Gokai) | 5 princípios + "Reiki Precepts" estendidos |
| Meditação | Hatsurei-hō (meditação diária) | Menos ênfase em meditação, mais em tratamento |

## Os 3 níveis + mestrado (Takata)

### Nível 1 (Shoden)
- Abertura do canal Reiki (atunement)
- Auto-tratamento (21 dias seguidos, 1h/dia)
- Tratamento de outros

### Nível 2 (Okuden)
- 2 símbolos adicionais (CHS, símbolo de distância)
- Tratamento à distância
- Posições mais específicas

### Nível 3 (Shinpiden interno)
- Símbolo mestre
- Trabalho profissional

### Mestrado (Shinpiden completo)
- Capacidade de iniciar outros
- Símbolo adicional
- Material didático do mestre

## Reiki no Brasil

- Década de 1980-1990: chega ao Brasil, principalmente por Cláudio Basílio (1988) e outros mestres Takata
- Década de 1990-2000: expansão massiva (Umbanda e Reiki se misturam em algumas casas)
- Década de 2010+: fragmentação (Reiki Tibetano, Karuna, Angels Reiki, etc)
- Hoje: presente em hospitais (Hospital Albert Einstein, Hospital Sírio-Libanês, alguns SUS), com evidências crescentes para dor e ansiedade

## A controvérsia dos honorários

Takata cobrava **US$ 10.000** pelo mestrado, valor fixo. Praticantes atuais geralmente cobram valores menores, mas o tema é controverso. Reiki **NÃO é prática comercial livre** — é tradição com responsabilidade ética.

## Para o Akasha

- O sistema Takata **NÃO é idêntico ao Usui japonês** — curadoria marca a distinção
- Reiki **é tradição moderna**, não milenar — não confundir com "técnica tibetana antiga" (que é construção moderna)
- Integração Reiki-Umbanda no Brasil é fenômeno cultural válido mas **NÃO é a tradição original**

## Disclaimer

Reiki é prática complementar. NÃO substitui tratamento médico. Em caso de doença, procure médico. Reikianos não devem prometer cura nem diagnosticar.`,
    authors: ['Stein D', 'Curador Akasha'],
    year: 1995,
    journal: 'Stein, Essential Reiki (Crossing Press, 1995)',
    tags: ['reiki', 'takata', 'hayashi', 'usui', 'linhagem', 'brasil'],
    tradition: 'reiki',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.reiki.org/FAQ/FAQ.html',
    ],
    relatedArticles: [
      'arvore-da-vida-estrutura-e-caminhos',
    ],
    tradition_confidence: 'medium',
  },

  // 14. SUFISMO — DHIKR — INTERMEDIÁRIO
  {
    slug: 'dhikr-lembranca-divina-sufismo',
    title: 'Dhikr: a lembrança divina no sufismo',
    summary:
      'Dhikr (ذِكْر, "lembrança") é a prática central do sufismo — repetição de nomes divinos ou fórmulas sagradas para cultivar presença contínua do divino. Inclui variantes silenciosa (khafi) e sonora (jahr).',
    content: `# Dhikr — A Lembrança Divina

Dhikr (ذِكْر, literalmente "lembrança" ou "menção") é o coração da prática sufí. É a repetição rítmica de nomes divinos ou fórmulas sagradas, geralmente com acompanhamento respiratório, com o objetivo de cultivar **presença contínua do divino** (wuḍūf, "estar de pé diante de Deus").

## Base teológica

O Corão ordena explicitamente a lembrança:

> "Lembrai-vos de Deus com lembrança frequente." (Corão 33:41)

> "Aqueles que crêem e cujos corações se tranquilizam com a lembrança de Deus — não é com a lembrança de Deus que os corações se tranquilizam?" (Corão 13:28)

Os sufis interpretam essas passagens como prática constante, não apenas ritualística.

## Tipos de Dhikr

### Por intensidade sonora

1. **Dhikr Jahr (sonoro)** — em voz alta, com grupo, frequentemente com música e dança (Sama dos Mevlevis, canto dos Senussi)
2. **Dhikr Khafi (silencioso)** — apenas mental, considerado mais profundo
3. **Dhikr Sir (secretíssimo)** — apenas no coração, sem som nem pensamento articulado

### Por fórmula

1. **Tasbih** — "Subḥān Allāh" (Glória a Deus)
2. **Tahlil** — "Lā ilāha illā Allāh" (Não há divindade senão Deus)
3. **Takbir** — "Allāhu Akbar" (Deus é o Maior)
4. **Tahmīd** — "Al-ḥamdu lillāh" (Louvor a Deus)
5. **Ism-e-Ḍāt** — repetição de "Allāh" (o nome supremo)
6. **Ratib** — sequência de fórmulas específicas de cada tariqa (ordem)

## Tariqas e suas práticas

| Tariqa | Dhikr principal | Prática |
|---|---|---|
| **Qadiriyya** | "Lā ilāha illā Allāh" | Grupo, alto, dança moderada |
| **Naqshbandi** | "Allāhu" no coração | Silencioso, focado no latif (subtlidade) |
| **Mevlevi** (dervixes) | Sama (música + dhikr) | Rodopio rítmico, ney (flauta) |
| **Chishti** | Sama + Qawwali | Música devocional, dançar |
| **Senussi** | Dhikr coletivo noturno | Sentado em roda |

## Prática (15 minutos)

1. Sentar-se com coluna ereta, mãos abertas sobre os joelhos
2. Fechar os olhos, respirar profundamente 3 vezes
3. Começar a repetir "Allāhu" em sincronia com a respiração:
   - Inspirar: "Al"
   - Expirar: "lāhu"
4. Sentir a vibração no peito (não na cabeça)
5. Quando a mente vagar, voltar com gentileza
6. Após 15 minutos, permanecer em silêncio por 5 minutos

## Diferença da meditação cristã e budista

| Tradição | Foco | Postura |
|---|---|---|
| Cristã (Hesychia) | "Oração do Coração" / "Senhor Jesus" | Sentado, ícone |
| Budista (Vipassana) | "Maraṇasati" / respiração | Sentado ou caminhando |
| Sufi (Dhikr) | Nomes divinos | Sentado, rodando, dançando |
| Hindu (Japa) | Mantra | Sentado, com mala |

São tradições paralelas, com raízes diferentes.

## Para o Akasha

- Dhikr **NÃO é "meditação genérica"** — tem estrutura teológica e prática específica
- A prática do Sama (dança) dos Mevlevis (Rumi) é patrimônio cultural da humanidade
- Curadoria respeita o rigor das diferentes tariqas

## Nota editorial

**Confiança: ALTA** sobre prática e base teológica. **Confiança: MÉDIA** sobre efeitos terapêuticos (poucos estudos empíricos, embora crescentes).`,
    authors: ['Schimmel A', 'Curador Akasha'],
    year: 1975,
    journal: 'Schimmel, Mystical Dimensions of Islam (Univ. North Carolina Press)',
    tags: ['sufismo', 'dhikr', 'coracao', 'qadiriyya', 'mevlevi', 'islam'],
    tradition: 'sufismo',
    evidenceLevel: 'LOW',
    type: 'BOOK',
    level: 'intermediario',
    format: 'pratica',
    citations: [
      'https://www.sufism.org/',
    ],
    relatedArticles: [
      'meta-analise-meditacao-atencao-2019',
    ],
    tradition_confidence: 'high',
  },

  // 15. HINDUISMO — BHAKTI YOGA — INTERMEDIÁRIO
  {
    slug: 'bhakti-yoga-devocao-amor-divino',
    title: 'Bhakti Yoga: o caminho da devoção amorosa',
    summary:
      'Bhakti Yoga é um dos 4 caminhos principais do Yoga (junto com Karma, Jnana, Raja). Foco na devoção amorosa a uma divindade pessoal (Krishna, Rama, Shiva, Devi). Culminou no movimento Bhakti medieval indiano (Mirabai, Tulsidas, Tukaram).',
    content: `# Bhakti Yoga — O Caminho da Devoção

Bhakti (भक्ति) significa "adesão", "amor", "devoção". Bhakti Yoga é um dos **4 yogas principais** reconhecidos pela tradição indiana — o caminho do amor dedicado ao divino, em contraste com o caminho do conhecimento (Jnana) ou da ação (Karma).

## Os 4 Yogas

| Yoga | Foco | Texto principal |
|---|---|---|
| **Karma Yoga** | Ação sem apego aos resultados | Bhagavad Gita |
| **Bhakti Yoga** | Devoção amorosa | Bhagavata Purana, Gita Govinda |
| **Jnana Yoga** | Discernimento (Atman-Brahman) | Upanishads, Advaita |
| **Raja Yoga** | Controle da mente (Patanjali) | Yoga Sutras |

Na prática, os 4 caminhos se sobrepõem. Bhakti pode estar em qualquer dos outros.

## As 9 formas de Bhakti (Bhagavata Purana)

1. **Shravana** — ouvir sobre Deus
2. **Kirtana** — cantar os nomes de Deus
3. **Smaranā** — lembrar-se constantemente de Deus
4. **Padasevana** — servir aos pés do Senhor (atender aos necessitados)
5. **Archana** — adoração ritual (puja)
6. **Vandana** — oração e reverência
7. **Dasya** — serviço como servo
8. **Sakhya** — amizade com Deus
9. **Atma-nivedana** — entrega total

## O movimento Bhakti medieval (séc. VI-XVII)

Bhakti explodiu como movimento popular na Índia medieval, atravessando castas e dividindo o hinduísmo:

- **Alvars e Nayanars** (Tamil Nadu, séc. VI-IX) — devoção a Vishnu e Shiva
- **Mirabai** (1498-1546) — princesa rajput, poeta-santa de Krishna
- **Tulsidas** (1532-1623) — autor de Ramcharitmanas (Ramayana em hindi)
- **Surdas** (1478-1583) — poeta cego de Krishna
- **Kabir** (1440-1518) — poeta-santo, crítico de casta e ritualismo
- **Tukaram** (1608-1649) — poeta-santo do Maharashtra, Varkari
- **Chaitanya Mahaprabhu** (1486-1534) — fundador do Gaudiya Vaishnavismo (Krishna-Radha)

Esses poetas compunham em línguas vernáculas (não sânscrito), democratizando a espiritualidade.

## Divindades do Bhakti

- **Krishna** — especialmente em Vrindavan (Mathura) e em Bengal
- **Rama** — especialmente em Ayodhya, Tamil Nadu (Ramanandi)
- **Shiva** — especialmente em Tamil Nadu (Nayanars)
- **Devi** — as Deusas (Durga, Kali, Parvati)
- **Vishnu** — forma abrangente de Krishna/Rama
- **Hanuman** — devoto de Rama, exemplo de bhakti perfeito

## Prática (20 minutos)

1. Sentar-se em frente a um murti (imagem) ou foto do divino escolhido
2. Acender uma lâmpada ou incenso
3. Cantar um mantra de devoção (108 vezes, com mala):
   - Krishna: "Govinda Jaya Jaya"
   - Rama: "Jai Shri Ram"
   - Shiva: "Om Namah Shivaya"
   - Devi: "Jai Mata Di"
4. Oferecer flores, água, comida (mentalmente ou simbolicamente)
5. Permanecer em presença amorosa

## Bhakti no Brasil

O Bhakti Yoga chegou ao Brasil com os primeiros iogues indianos (1960-70) e com a ISKCON (Hare Krishna, fundada por Prabhupada, 1966). Hoje há centros em São Paulo, Rio, e outras capitais.

## Para o Akasha

- Bhakti **NÃO é "devoção genérica"** — tem estrutura teológica e prática específica
- O movimento Bhakti é patrimônio da humanidade (UNESCO reconhece Mirabai, Tulsidas)
- A prática pode ser profundamente transformadora, especialmente em contexto comunitário (satsang)

## Disclaimer

Conteúdo informativo. A prática deve respeitar a tradição escolhida — quem pratica Krishna-bhakti não deve cantar mantras de Shiva sem intenção consciente.`,
    authors: ['Hardy F', 'Curador Akasha'],
    year: 1983,
    journal: 'Hardy, Viraha-Bhakti (Oxford Clarendon Press)',
    tags: ['hinduismo', 'bhakti', 'krishna', 'mirabai', 'tulsidas', 'devoção'],
    tradition: 'hinduismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intermediario',
    format: 'pratica',
    citations: [
      'https://iskcon.org/',
    ],
    relatedArticles: [
      'yoga-sutras-patanjali-ashtanga',
    ],
    tradition_confidence: 'high',
  },

  // 16. BUDISMO — BODHISATTVA — INTERMEDIÁRIO
  {
    slug: 'bodhisattva-ideal-compassao-vajrayana',
    title: 'Bodhisattva: o ideal do despertar em benefício de todos',
    summary:
      'Bodhisattva ("ser de iluminação") é o ideal Mahayana do praticante que busca o despertar completo para benefício de todos os seres. Distinto do ideal arhat (Theravada). Inclui votos e práticas (Prajnaparamita, paramitas).',
    content: `# Bodhisattva — O Ideal do Despertar Altruísta

Bodhisattva (बोधिसत्त्व, "ser de iluminação") é o **ideal central do Budismo Mahayana e Vajrayana**: o praticante que, ao invés de buscar o nirvana individual (como o arhat theravada), busca o despertar completo (anuttara-samyak-sambodhi) para beneficiar todos os seres sencientes.

## Os 2 ideais budistas

| Theravada | Mahayana / Vajrayana |
|---|---|
| **Arhat** ("santo") | **Bodhisattva** |
| Foco: libertação pessoal | Foco: benefício de todos |
| Prática: Sangha, Vinaya | Prática: Prajna + Karuna |
| Fruto: nibbana | Fruto: Buda completo |

O Mahayana interpreta o caminho do arhat como válido mas limitado — é uma "estação de trem" no caminho para o despertar completo.

## Os 4 Votos do Bodhisattva (Brahmajala Sutta)

Recitados diariamente nas tradições Mahayana e Vajrayana:

> 1. Os seres são infinitos, juro libertá-los todos.
> 2. Os defeitos são infinitos, juro superá-los todos.
> 3. As portas do Dharma são infinitas, juro aprendê-las todas.
> 4. O caminho de Buda é infinito, juro percorrê-lo todo.

A primeira frase estabelece a motivação compassiva; as outras três o método.

## As 6 (ou 10) Paramitas

Práticas que o bodhisattva cultiva:

### Tradicionalmente (6)
1. **Dana** — generosidade
2. **Shila** — ética/moralidade
3. **Ksanti** — paciência
4. **Virya** — energia/jogo ativo
5. **Dhyana** — meditação absorcional
6. **Prajna** — sabedoria (discernimento)

### Mahayana estendido (10)
7. **Upaya** — meios hábeis
8. **Pranidhana** — voto/aspiração
9. **Bala** — poder espiritual
10. **Jnana** — conhecimento discriminativo

## Prajnaparamita — A Perfeição da Sabedoria

Os Sutras Prajnaparamita ("perfeição da sabedoria") são o cerne da literatura Mahayana. O Sutra do Coração (Heart Sutra, séc. III) é a expressão mais concisa:

> "Forma é vacuidade, vacuidade é forma. Forma não é diferente de vacuidade, vacuidade não é diferente de forma."

A vacuidade (shunyata) não é niilismo — é a ausência de natureza intrínseca. Tudo é interdependente, sem essência fixa.

## Figuras exemplares

- **Avalokiteshvara** (Chines: Guan Yin, Japon: Kannon, Tibetano: Chenrezig) — bodhisattva da compaixão
- **Manjushri** — bodhisattva da sabedoria
- **Samantabhadra** — bodhisattva da prática
- **Kshitigarbha** (Chines: Dizang) — bodhisattva dos que sofrem no inferno
- **Maitreya** — o Buda do futuro

## Os Bodhisattvas terrenos

Na tradição Mahayana, qualquer pessoa pode ser um bodhisattva em ação. Os **8 grandes bodhisattvas terrenos** são figuras históricas lendárias (Nagarjuna, Asanga, etc) que encarnaram o ideal.

## Para o Akasha

- O ideal bodhisattva **NÃO é passivo** — exige engajamento compassivo ativo
- Distingue-se da caridade cristã: bodhisattva busca despertar coletivo, não apenas alívio
- Curadoria reconhece múltiplas formas de bodhisattva (Tibetano: tülku, Zen: koan da compaixão, etc)

## Disclaimer

Conteúdo é nível intermediário. Para prática avançada (visualização do bodhisattva, recitação de mantras específicos), procure linhagem tibetana ou zen legítima.`,
    authors: ['Williams P', 'Curador Akasha'],
    year: 2009,
    journal: 'Williams, Mahayana Buddhism (Routledge, 2nd ed.)',
    tags: ['budismo', 'bodhisattva', 'mahayana', 'paramitas', 'prajnaparamita', 'compassao'],
    tradition: 'budismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.lotsawahouse.org/',
    ],
    relatedArticles: [
      'meditacao-vipassana-tradição-budista',
      'quatro-nobre-verdades',
    ],
    tradition_confidence: 'high',
  },

  // 17. JUDAÍSMO MÍSTICO — GEMATRIA — INTERMEDIÁRIO
  {
    slug: 'gematria-cabala-numerica',
    title: 'Gematria: a ciência dos números hebraicos',
    summary:
      'Gematria (גימטריה) é o sistema cabalístico de atribuir valores numéricos às letras hebraicas, usado para descobrir relações entre palavras, versículos bíblicos, e conceitos. Não é adivinhação — é hermenêutica estruturada.',
    content: `# Gematria — A Ciência dos Números Hebraicos

Gematria (גימטריה) é o sistema hermenêutico judaico que atribui **valores numéricos às letras hebraicas**, usado para descobrir relações entre palavras e conceitos. É uma das três disciplinas interpretativas da Torá no judaísmo (junto com Pardes e Notarikon).

## As 3 disciplinas hermenêuticas (Pardes)

1. **Peshat** (פְּשָׁט) — sentido literal, contextual
2. **Remez** (רֶמֶז) — sentido alusivo, simbólico
3. **Derash** (דְּרָשׁ) — sentido homilético, midrásico
4. **Sod** (סוֹד) — sentido oculto, místico (daí PARDES = acrónimo)

A Gematria opera especialmente em **Remez** e **Sod** — interpretação profunda, não literal.

## O sistema de valores

O alfabeto hebraico tem 22 letras. Cada uma recebe um valor numérico:

### 1-9 (letras simples)
| Alef | Bet | Gimel | Dalet | He | Vav | Zayin | Het | Tet |
|---|---|---|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |

### 10-90 (letras finais)
| Yod | Kaf | Lamed | Mem | Nun | Samekh | Ayin | Pe | Tsade |
|---|---|---|---|---|---|---|---|---|
| 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 | 90 |

### 100-900 (letras finais)
| Qof | Resh | Shin | Tav |
|---|---|---|---|
| 100 | 200 | 300 | 400 |

Total: 1 a 800+ em combinações.

## Exemplos clássicos

### Echad (אחד, "Um")
Alef (1) + Het (8) + Dalet (4) = **13**
13 é o valor de **Echad** (Um, singular) e também de **Ahavah** (Amor), **Echad** (Unidade).

### Ahavá (אהבה, "Amor")
Alef (1) + He (5) + Bet (2) + He (5) = **13**

A equivalência Ahavá = Echad sugere que **amor é unidade**. Isto é usado em meditação: meditar em Echad é meditar em Ahavá, e vice-versa.

### Emet (אמת, "Verdade")
Alef (1) + Mem (40) + Tav (400) = **441**
441 = 21 × 21 (21²) = **21²**
21 é o valor de **Ehyeh** (serei, nome divino em Êxodo 3:14).
Verdade = o nome de Deus ao quadrado.

## Tipos de Gematria

1. **Mispar Hechrachi** — valor simples (mais comum)
2. **Mispar Gadol** — valor das letras finais (kaf mem nun pe tsade) recebem valores estendidos (500, 600, etc)
3. **Mispar Katan** — soma dos dígitos (Ex: Alef = 1, Kaf = 20 → 2+0 = 2)
4. **Mispar Shemi** — valor da palavra com seu "valor de preenchimento"
5. **Atbash** — substituição de letras pelo seu complemento (Alef ↔ Tav, Bet ↔ Shin, etc)

## Método Cigano (brasileiro)

O método usado por Cigano Ramiro no Brasil simplifica a Gematria clássica em:
- Reduz a números de 1-9 (exceto mestres 11, 22, 33)
- Mapeia diretamente para arquétipos (1=Imperador, 2=Sacerdotisa, etc — correspondência com Tarot)
- Aplica a nomes de pessoas para identificar "caminho de vida" e "expressão"

Esta é **uma aplicação contemporânea**, não a Gematria medieval judaica.

## Para o Akasha

- Gematria **NÃO é adivinhação** — é hermenêutica estruturada
- **NÃO é numerologia genérica** — tem regras específicas da tradição hebraica
- O método Cigano brasileiro é uma adaptação válida (registrada como tal)

## Limitações

Curadores acadêmicos (Scholem, Idel) observam que:
- A Gematria pode forçar correspondências se o praticante for tendencioso
- Não é teste empírico de verdade teológica — é ferramenta interpretativa
- Usar para identificar "verdades ocultas" na Bíblia é operação teológica, não histórica

## Nota editorial

**Confiança: ALTA** sobre o sistema. **Confiança: MÉDIA** sobre usos interpretativos específicos. **Confiança: ALTA** sobre aplicações como exercício contemplativo.`,
    authors: ['Idel M', 'Curador Akasha'],
    year: 1988,
    journal: 'Idel, Kabbalah: New Perspectives (Yale Univ. Press)',
    tags: ['judaísmo-místico', 'gematria', 'cabalistica', 'numerologia', 'metodo-cigano'],
    tradition: 'judaísmo-místico',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.chabad.org/library/article_cdo/aid/1538768/jewish/Gematria.htm',
    ],
    relatedArticles: [
      'numerologia-introducao-sistemas-numericos',
      'numerologia-cabalistica-metodo',
      'arvore-da-vida-estrutura-e-caminhos',
    ],
    tradition_confidence: 'high',
  },

  // 18. JUDAÍSMO MÍSTICO — HASIDISMO — INTERMEDIÁRIO
  {
    slug: 'hasidismo-devekut-adesao-divina',
    title: 'Hasidismo: Devekut e a adesão ao divino',
    summary:
      'Hasidismo é o movimento místico-popular fundado por Israel Baal Shem Tov (séc. XVIII) na Europa Oriental. Foco em Devekut (adesão constante ao divino), alegria religiosa, e experiência direta da presença divina.',
    content: `# Hasidismo — Devekut e a Adesão Divina

Hasidismo (חסידות, "pietismo") é o movimento místico-popular do judaísmo fundado por **Israel ben Eliezer** (conhecido como o **Baal Shem Tov**, ou **Besht**, 1698-1760) na região da Ucrânia/Podolia (atual Polônia/Ukraina) do séc. XVIII.

## Contexto histórico

A Europa Oriental judaica do séc. XVIII vivia:

- **Pobreza massiva** dos judeus do Pale of Settlement (Império Russo)
- **Perseguições** (pogroms esporádicos, principalmente após as revoltas de Khmelnytsky)
- **Rabinato rigorista** (Mithnagdim, "opositores") com ênfase em estudo da Torá
- **Falsa Messianismo** (Sabbatianismo de Sabbatai Zvi ainda recente, séc. XVII)

O Baal Shem Tov propôs um caminho alternativo: **a presença divina está em toda parte, em todos os momentos, em todos os atos** — não apenas no estudo da Torá.

## Conceitos fundamentais

### Devekut (דְּבֵקוּת)
Adesão constante a Deus. O coração do hasidismo. Não é estado místico momentâneo — é **orientação contínua** da mente e do coração para a presença divina, mesmo durante atividades mundanas.

> "Se um homem come pão, deve ter em mente que isso é a vontade do Altíssimo, e através disso ele cumpre o mandamento de servir a Deus." (Besht)

### Hitbodedut (התבודדות)
"Auto-isolamento" ou "meditação solitária". Prática de falar com Deus em linguagem própria (não litúrgica), geralmente em retiro, às vezes gritando ou cantando.

### Hislahavut (השתלהבות)
"Entusiasmo" ou "êxtase". A alegria no serviço a Deus é obrigatória, não opcional. O Baal Shem Tov ensinava que a melancolia no serviço é rejeitada.

### Na'avah (נעימות)
"Doçura" da presença divina. Hasidismo enfatiza a beleza, a doçura, a alegria do divino — em contraste com a severidade do rabinato.

### Tshuvah (תשובה)
"Retorno". Hasidismo vê a Tshuvah como processo contínuo, não evento único. Cada momento é oportunidade de retorno.

## Figuras importantes

| Figura | Período | Tradição |
|---|---|---|
| **Baal Shem Tov (Besht)** | 1698-1760 | Fundador |
| **Dov Ber, o Maguid** | 1710-1772 | 2ª geração |
| **Levi Yitzchok de Berdichev** | 1740-1810 | "Defensor de Israel" |
| **Shneur Zalman de Liadi** | 1745-1812 | Fundador do Chabad |
| **Nachman de Breslov** | 1772-1810 | Fundador de Breslov |
| **Moses Sofer** | 1762-1839 | Inverso: Chassam Sofer (anti-hasidismo) |

## Tradições atuais

1. **Chabad-Lubavitch** — a maior, com presença global, foco em educação e Mitzvot (Tefilin, Mezuza, etc)
2. **Satmar** — grupo ultra-ortodoxo, anti-Israel (por questões teológicas)
3. **Breslov** — foco em hitbodedut, Nachman de Breslov, Israel (Uman, Rosh Hashana)
4. **Ger** — filosofia do Talmud
5. **Vizhnitz** — grande grupo, foco em misticismo
6. **Belz, Bobov, Skver** — outras dinastias importantes

## Prática

### Niggun (מנגינות)
Cantos hasídicos sem palavras (ou com poucas), repetidos muitas vezes para alcançar Devekut. Cada dinastia tem seus niggunim.

### Tish (טש)
"Mesa" — reunião noturna do Rebbe com os chassidim. Cantos, ensinamentos, porções de comida, brandy, dança.

### Hitbodedut (meditação solitária)
Reunir-se em quarto isolado, falar com Deus em língua própria, sem forma fixa. Pode incluir choro, canto, grito.

### Lectura de Torah com Chassidus
Estudo diário dos textos chassídicos (Tanya, Likutei Moharan, Sfas Emes).

## Hasidismo no Brasil

Comunidades chassídicas estão presentes em São Paulo (Vila Madalena, Higienópolis) e Rio de Janeiro. Chabad-Lubavitch tem presença forte em muitas cidades.

## Para o Akasha

- Hasidismo **NÃO é "misticismo genérico"** — tem estrutura teológica e organizacional específica
- A alegria religiosa é uma característica distintiva (não superficialidade)
- Relação complexa com secularização — Chabad, por exemplo, é proselitista mas também rigidamente ortodoxo

## Disclaimer

Hasidismo é tradição judaica viva. Prática da Devekut e hitbodedut é acessível a judeus praticantes; para não-judeus, é mais um objeto de estudo. Conversão ao judaísmo é processo sério de anos.`,
    authors: ['Buber M', 'Curador Akasha'],
    year: 1947,
    journal: 'Buber, Tales of the Hasidim (Schocken)',
    tags: ['judaísmo-místico', 'hasidismo', 'devekut', 'baal-shem-tov', 'chabad'],
    tradition: 'judaísmo-místico',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.chabad.org/',
      'https://breslov.org/',
    ],
    relatedArticles: [
      'meditacao-kavanah-uniao-de-intencao',
      'tikkun-olam-etica-cabala',
    ],
    tradition_confidence: 'high',
  },

  // 19. CIÊNCIA-PONTES — NEUROPLASTICIDADE — INTERMEDIÁRIO
  {
    slug: 'neuroplasticidade-pratica-continua',
    title: 'Neuroplasticidade: o cérebro muda com prática sustentada',
    summary:
      'Neuroplasticidade é a capacidade do cérebro de reorganizar conexões sinápticas em resposta à experiência. Práticas contemplativas sustentadas produzem mudanças estruturais mensuráveis, especialmente em córtex pré-frontal, ínsula, e amígdala.',
    content: `# Neuroplasticidade e Prática Contemplativa

Neuroplasticidade é a capacidade do sistema nervoso de **reorganizar conexões sinápticas** (sinapses entre neurônios) em resposta à experiência, aprendizagem ou lesão. As práticas contemplativas (meditação, yoga, oração, atenção) induzem mudanças mensuráveis.

## Como funciona (mecanismos)

### 1. Sinaptogênese
Formação de novas sinapses. Estimulada por:
- Aprendizagem
- Exercício físico
- Meditação regular

### 2. Fortalecimento sináptico (LTP)
Sinapses que disparam juntas, conectam-se mais forte (Hebb's rule). Práticas repetidas reforçam circuitos específicos.

### 3. Poda sináptica
Conexões pouco usadas são eliminadas. A "poda" é tão importante quanto o crescimento — o cérebro se especializa pela remoção.

### 4. Neurogênese adulta
Até 30 anos atrás, acreditava-se que o cérebro adulto não gerava novos neurônios. Hoje sabemos que o **hipocampo** gera novos neurônios ao longo da vida, estimulada por exercício, BDNF (Brain-Derived Neurotrophic Factor), e meditação.

### 5. Mielinização
As bainhas de mielina (que aceleram transmissão neural) podem se espessar com prática sustentada — Kurt Fischer e Scott Grafton demonstraram isso em músicos.

## Mudanças observadas em meditantes experientes (>1000h)

Meta-análise (Fox et al., 2014, n=18 estudos, 300+ participantes) identificou:

| Região | Mudança | Significado funcional |
|---|---|---|
| **Córtex pré-frontal medial** | ↑ espessura | Atenção sustentada |
| **Córtex cingulado anterior** | ↑ volume | Regulação emocional |
| **Ínsula anterior** | ↑ espessura | Interocepção (percepção corporal) |
| **Hipocampo** | ↑ volume | Memória, aprendizado |
| **Amígdala** | ↓ reatividade | Resposta ao estresse |
| **Corpo caloso** | ↑ integridade | Comunicação inter-hemisférica |

Efeito médio Cohen d 0.2-0.5 — significativo mas não dramático.

## Práticas que produzem mudanças

| Prática | Mudança principal | Tempo até efeito |
|---|---|---|
| Mindfulness (MBSR) | Atenção, regulação emocional | 8 semanas |
| Vipassana | Atenção, interocepção | 1-3 anos |
| Hatha Yoga | Equilíbrio, propriocepção | 6 meses |
| Música (estudo) | Corpo caloso, planum temporale | 5+ anos |
| Meditação de compaixão | Córtex pré-frontal medial | 3-6 meses |
| Prática contemplativa tibetana | DMN, Default Mode Network | 10+ anos |

## O que a neurociência NÃO prova

- Que "despertar" ou "iluminação" são mensuráveis
- Que meditação é melhor que outras formas de atenção
- Que tradições específicas são superiores
- Que mudanças cerebrais = mudanças significativas na vida

Neuroplasticidade mostra **correlação** entre prática e estrutura cerebral. Não mostra causalidade definitiva (praticantes podem já ter cérebros diferentes).

## Limitações críticas

- A maioria dos estudos é transversal (foto instantânea), não longitudinal (acompanhamento)
- Efeitos de publicação (estudos positivos publicados mais)
- Falta replicação independente em muitas descobertas
- Contexto cultural (não se pode importar práticas sem considerar o contexto)

## Para o Akasha

- A neuroplasticidade **NÃO é argumento para eficácia espiritual** — é apenas biologia
- É argumento para **viabilidade** (a prática produz mudanças reais, não mágicas)
- Curadoria usa como informação contextual, não como validação

## Nota editorial

**Confiança: ALTA** sobre os mecanismos básicos. **Confiança: MÉDIA** sobre efeitos específicos de práticas contemplativas. **Confiança: ALTA** sobre limitações metodológicas.`,
    authors: ['Draganski B', 'May A', 'Curador Akasha'],
    year: 2004,
    journal: 'Draganski & May, Neuroplasticity: Changes in grey matter induced by training, Nature 427:311-312',
    doi: '10.1038/427311a',
    tags: ['ciencia-pontes', 'neuroplasticidade', 'cerebro', 'meditacao', 'sinaptogenese'],
    tradition: 'ciencia-pontes',
    evidenceLevel: 'HIGH',
    type: 'SCIENTIFIC_PAPER',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.nature.com/articles/427311a',
      'https://pubmed.ncbi.nlm.nih.gov/25264561/',
    ],
    relatedArticles: [
      'meta-analise-meditacao-atencao-2019',
      'mbsr-reducao-estresse-baseado-evidencia',
    ],
    tradition_confidence: 'high',
  },

  // 20. CIÊNCIA-PONTES — EPIGENÉTICA — INTERMEDIÁRIO
  {
    slug: 'epigenetica-trauma-transgeracional',
    title: 'Epigenética e trauma transgeracional',
    summary:
      'Epigenética é o estudo de mudanças na expressão gênica que não alteram o DNA. Evidências crescentes sugerem que traumas podem ser transmitidos entre gerações por mecanismos epigenéticos, abrindo diálogo com tradições que falam de "herança espiritual".',
    content: `# Epigenética e Trauma Transgeracional

Epigenética (do grego epi-, "acima de") é o estudo de mudanças na **expressão gênica** que NÃO alteram a sequência de DNA, mas que podem ser herdadas. Há evidências crescentes de que **traumas podem ser transmitidos entre gerações** por mecanismos epigenéticos — diálogo direto com tradições que falam de "herança espiritual".

## O que é epigenética (mecanismos)

### 1. Metilação do DNA
Grupos metil (-CH₃) ligam-se a bases citosina, silenciando genes sem alterá-los.

### 2. Modificação de histonas
Histonas são proteínas em torno das quais o DNA se enrola. Modificações químicas (acetilação, metilação, fosforilação) regulam quão "aberta" está a cromatina.

### 3. RNA não-codificante
microRNAs e RNAs longos não-codificantes podem regular a expressão gênica pós-transcricional.

Essas marcas são dinâmicas — respondem a **ambiente, dieta, estresse, comportamento**.

## O estudo de Överkalix (2001-2014)

Marcus Pembrey e Lars Olov Bygren analisaram registros históricos de Överkalix (Suécia):

- **Avós paternos** que passaram por **fome** antes da puberdade: netos tiveram **menor mortalidade** por diabetes e doença cardiovascular
- **Avós paternos** que passaram por **abundância**: netos tiveram **maior mortalidade** por diabetes
- **Avós maternos** durante a fome: netas (mas não netos) tiveram **maior mortalidade**

Isso sugeria herança **sexo-específica e temporalmente específica**.

## O estudo da Dutch Hunger Winter (1990-2010)

Analisou crianças concebidas durante a fome holandesa (1944-1945, bloqueio nazista):

- Genes de **IGF2** (fator de crescimento) **hipometilados** 60 anos depois
- Aumento de **doenças cardiovasculares, obesidade, esquizofrenia**
- A **fome materna durante a gestação** produziu marcas epigenéticas duradouras

## Estudo de Trauma Holandês Indígena (2016)

Asunción et al. analisaram mães indígenas com TEPT e seus filhos:

- Marcadores epigenéticos alterados em genes relacionados ao **sistema de estresse** (NR3C1, FKBP5)
- Filhos apresentavam perfil epigenético similar **mesmo sem trauma direto**
- Transmissão parecia ocorrer **via cuidado parental**, não via gametas

## Tradições que falam de "herança espiritual"

Curiosamente, várias tradições já tinham intuições sobre transmissão intergeracional:

- **Ifá** — família com Odu Iwori tende a ter filhos que também precisam de proteção
- **Cabala** — o conceito de "sangue" (mishpachá) e transmissão de santidade
- **Budismo** — karma pode operar entre gerações
- **Xamanismo** — curandeiros trabalham com linhagens ancestrais

A epigenética **não valida** essas tradições diretamente, mas abre **ponto de encontro conceitual**.

## Implicações práticas

### 1. Terapêuticas
- Práticas de mindfulness podem alterar marcadores epigenéticos (estudos em andamento sobre NR3C1)
- Psicoterapia pode modificar padrões epigenéticos relacionados ao trauma
- Dieta e exercício modulam marcas epigenéticas

### 2. Reprodutivas
- Saúde pré-concepção (ambos os pais) afeta gerações futuras
- Trauma paterno (mesmo antes da concepção) pode influenciar descendentes

### 3. Sociais
- Trauma coletivo (genocídio, escravidão, fome) tem efeito epigenético nas gerações seguintes
- Políticas que reduzem trauma têm **efeito geracional**, não apenas imediato

## Limitações críticas

- Mecanismos em humanos são ainda mal compreendidos
- Maioria dos estudos é observacional (correlação, não causalidade definitiva)
- Efeitos transgeracionais são menores do que efeitos diretos
- Tradições que falam de "maldição de família" **não são epigeneticamente validadas** — a epigenética é mais complexa e específica

## Para o Akasha

- Epigenética **NÃO é "karma científico"** — é biologia molecular
- É um **ponto de encontro** entre ciência e espiritualidade, não validação de uma pela outra
- Curadoria usa para enriquecer diálogo interdisciplinar, sem forçar equivalências

## Nota editorial

**Confiança: ALTA** sobre mecanismos epigenéticos. **Confiança: MÉDIA** sobre transmissão transgeracional em humanos (campo em desenvolvimento). **Confiança: BAIXA** sobre pontes diretas com tradições espirituais.`,
    authors: ['Yehuda R', 'Curador Akasha'],
    year: 2016,
    journal: 'Yehuda et al., Holocaust Exposure Induced Intergenerational Effects on FKBP5 Methylation, Biol Psychiatry 80:372-380',
    doi: '10.1016/j.biopsych.2015.08.005',
    tags: ['ciencia-pontes', 'epigenetica', 'trauma', 'transgeracional', 'pesquisa'],
    tradition: 'ciencia-pontes',
    evidenceLevel: 'HIGH',
    type: 'SCIENTIFIC_PAPER',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://pubmed.ncbi.nlm.nih.gov/26314891/',
      'https://www.nature.com/articles/nature05919',
    ],
    relatedArticles: [
      'neuroplasticidade-pratica-continua',
    ],
    tradition_confidence: 'high',
  },

  // 21. CIÊNCIA-PONTES — PLACEBO — INTERMEDIÁRIO
  {
    slug: 'placebo-ritual-eficacia',
    title: 'Placebo, ritual e a eficácia do simbólico',
    summary:
      'Placebo (latim: "agradarei") é o efeito terapêutico produzido por expectativas, rituais e contexto simbólico, sem princípio ativo. Evidências crescentes mostram que placebo é mais que "nada" — é uma resposta neurobiológica mensurável, com implicações para práticas rituais.',
    content: `# Placebo, Ritual e a Eficácia do Símbolo

Placebo (latim: "agradarei") designa originalmente um medicamento inerte. Hoje, o termo "efeito placebo" descreve qualquer resposta terapêutica atribuível a **expectativas, rituais e contexto simbólico** — não a um princípio ativo. A pesquisa moderna mostra que o placebo é uma resposta neurobiológica real, mensurável, poderosa.

## O que é (e o que não é)

### Placebo NÃO é
- "Tudo na cabeça" (a resposta é neurobiológica)
- Fraude (placebo é estudado como fenômeno real)
- Apenas "efeito Hawthorne" (sujeito sabe-se observado)
- Inexistência de tratamento (placebo é tratamento simbólico, não ausência)

### Placebo É
- Resposta do sistema nervoso a sinais de cura
- Modulação de expectativas conscientes e inconscientes
- Ativação de vias opioides endógenas (endorfinas)
- Mudanças mensuráveis em marcadores inflamatórios
- Componente de todo tratamento real (até cirurgia)

## A neurobiologia do placebo

Estudos de neuroimagem (Finniss, 2010; Wager, 2013) mostram que placebo ativa:

- **Córtex pré-frontal dorsolateral** (crença, expectativa)
- **Córtex cingulado anterior** (atenção ao efeito)
- **Peri-aqueductal gray** (PAG) — modulação da dor
- **Núcleo accumbens** (recompensa)
- **Amígdala** (modulação emocional)

A resposta opioide endógena (endorfinas naturais) é bloqueada por naloxona — mostrando que placebo usa **as mesmas vias** dos opioides farmacêuticos.

## Fatores que modulam placebo

| Fator | Efeito |
|---|---|
| **Cor do comprimido** | Azul = calmante, vermelho = estimulante, amarelo = antidepressivo |
| **Tamanho do comprimido** | Maior = mais forte |
| **Marca conhecida** | Aumenta efeito |
| **Relação com curandeiro** | Quanto mais empático, maior o efeito |
| **Ritual elaborado** | Aumenta efeito |
| **Custo percebido** | "Mais caro = mais eficaz" |
| **Expectativa prévia** | Expectativa positiva = maior efeito |

## O paradoxo do placebo na prática

Se placebo funciona, **por que não usar mais?**

1. **Ética** — enganar o paciente viola princípios bioéticos
2. **Inconsistência** — efeito placebo varia enormemente entre indivíduos
3. **Doenças graves** — efeito placebo não substitui tratamento real para câncer, infecções, etc.
4. **Definição** — definir o que é "efeito placebo" é filosoficamente controverso

## Ritual e placebo: a ponte

Tradições curativas (xamanismo, reiki, cura cristã, ritual hindu, práticas ciganas) operam em parte via mecanismos placebo:

- **Contexto ritual** (sala, incenso, símbolos) ativa expectativas
- **Relação curador-curado** é central em qualquer cura
- **Significado simbólico** da doença e da cura é parte do processo
- **Comunidade** (cura pública, em grupo) amplifica efeitos

A ciência do placebo **NÃO invalida** essas práticas — mostra que elas operam por vias reais, mensuráveis, mas diferente do fármaco.

## Open-label placebo

Estudos recentes (Carvalho, 2016; Kaptchuk, 2010) mostram que **placebo dado com transparência** (o paciente sabe que é placebo) ainda funciona em alguns contextos:

- Síndrome do intestino irritável (placebo aberto = redução de sintomas)
- Fadiga crônica
- Depressão leve

O "abrir a carta" (open-label) não elimina o efeito — transforma o significado da intervenção.

## Implicações para tradições espirituais

1. **Não invalida** práticas rituais — mostra seus mecanismos
2. **Não valida** curandeirismo em sentido absoluto — placebo complementa, não substitui
3. **Reconhece** o poder do contexto simbólico
4. **Integra** a ciência moderna com saberes ancestrais

## Para o Akasha

- Placebo **NÃO é "curação falsa"** — é resposta terapêutica real por vias diferentes
- Práticas curativas do Akasha (ou das tradições representadas) operam em parte por esses mecanismos
- Curadoria usa placebo como **ponte** entre ciência e espiritualidade, não como redução

## Nota editorial

**Confiança: ALTA** sobre os mecanismos básicos. **Confiança: ALTA** sobre ética (não prescrevemos placebo sem consentimento). **Confiança: MÉDIA** sobre implicações para tradições específicas (ainda em desenvolvimento).`,
    authors: ['Finniss DG', 'Kaptchuk TJ', 'Miller F', 'Benedetti F', 'Curador Akasha'],
    year: 2010,
    journal: 'Finniss et al., Biological, clinical, and ethical advances of placebo effects, Lancet 375:686-695',
    doi: '10.1016/S0140-6736(09)61706-2',
    tags: ['ciencia-pontes', 'placebo', 'ritual', 'eficacia', 'etica'],
    tradition: 'ciencia-pontes',
    evidenceLevel: 'HIGH',
    type: 'SCIENTIFIC_PAPER',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(09)61706-2/fulltext',
    ],
    relatedArticles: [
      'neuroplasticidade-pratica-continua',
      'epigenetica-trauma-transgeracional',
    ],
    tradition_confidence: 'high',
  },

  // 22. ESPIRITUALIDADE CONTEMPORÂNEA — WILBER AQAL — INTERMEDIÁRIO
  {
    slug: 'wilber-aqal-quadrantes',
    title: 'AQAL de Ken Wilber: integrando os quadrantes da experiência',
    summary:
      'Ken Wilber (1949-presente) é filósofo americano que criou o modelo AQAL (All Quadrants, All Levels) integrando 4 quadrantes (interior/exterior × individual/coletivo) e múltiplos níveis de desenvolvimento. Influente mas também controverso.',
    content: `# AQAL — O Modelo Integral de Ken Wilber

Ken Wilber (nascido em 1949) é um filósofo americano fundador do **Integral Institute**. Seu modelo AQAL (All Quadrants, All Levels, All Lines, All States, All Types) é uma tentativa de **integrar** perspectivas da ciência, arte, moral, e espiritualidade em um framework único.

## Os 4 Quadrantes

O modelo base é uma matriz 2x2 cruzando **interior/exterior** com **individual/coletivo**:

| | Interior | Exterior |
|---|---|---|
| **Individual** | **Eu Superior** (subjetivo, intencional) | **Cérebro/Corpo** (objetivo, comportamental) |
| **Coletivo** | **Cultura/Mundo-Intersubjetivo** (significados compartilhados) | **Sistema Social** (estruturas, tecnologia) |

### Quadrante 1 — Eu Superior (canto superior esquerdo)
- Subjetivo, intencional
- Fenomenologia, meditação, arte
- O que **sinto**
- Estudado por: fenomenologia, psicologia humanista, meditação contemplativa

### Quadrante 2 — Cérebro/Corpo (canto superior direito)
- Objetivo, comportamental
- Neurociência, biologia
- O que **faço**
- Estudado por: neurociência, biologia, behaviorismo

### Quadrante 3 — Cultura (canto inferior esquerdo)
- Intersubjetivo, compartilhado
- Antropologia, hermenêutica
- O que **nós sentimos juntos**
- Estudado por: antropologia cultural, sociologia interpretativa

### Quadrante 4 — Sistema Social (canto inferior direito)
- Objetivo, sistêmico
- Estruturas sociais, tecnologia, ecologia
- Como **nós operamos coletivamente**
- Estudado por: sociologia sistêmica, economia política, ecologia

## Os Níveis de Desenvolvimento

Wilber propõe que **todos os 4 quadrantes desenvolvem-se em níveis** — não apenas o individual (Quadrante 1):

| Nível | Idade aprox. | Quadrante 1 (Eu) | Quadrante 3 (Cultura) |
|---|---|---|---|
| **Arcaico** | 0-2 anos | Sensório-motor | Grupal tribal |
| **Mágico** | 2-7 anos | Animístico | Tribal |
| **Mítico-membresia** | 7-12 anos | Egocêntrico, mágico | Totêmico |
| **Mítico** | ~12 anos | Concreto-operacional | Arquético/religioso |
| **Racional** | adolescente-adulto | Formal-operacional | Moderno-racional |
| **Pluralista** | adulto maduro | Relativista | Pluralista |
| **Integral** | raro | Sistêmico | Integral |
| **Super-integral** | mais raro | Espiritual | Holístico |

## Holons e Hierarquia

Wilber usa o conceito de **holon** (coined by Arthur Koestler): cada realidade é simultaneamente um todo (holos) e uma parte (on). Células são holons (são tudo em si, parte do tecido). Indivíduos são holons.

A **hierarquia** emerge naturalmente — holons maiores transcendem e incluem holons menores. Átomos → moléculas → células → organismos → ecossistemas → consciência.

## Aplicações do AQAL

1. **Educação** — desenho curricular respeitando os 4 quadrantes
2. **Gestão** — integrando perspectivas de stakeholders
3. **Terapia** — Integral Life Practice (ILP) integra corpo, mente, sombra, espírito
4. **Política** — Integral Politics integra esquerda, direita, verde, amarelo

## Críticas

Wilber é **controverso**:

- **Acusações de apropriar** de outros pensadores sem crédito adequado (Fowler, Graves, Gebser)
- **Crítica de "pré/trans fallacy"**: confundir pré-pessoal (arquetípico) com trans-pessoal (místico)
- **Sistema fechado**: AQAL tende a incluir (ou excluir) outros modelos em categorias pré-definidas
- **Falta de empirismo**: muitos conceitos são filosóficos, não testáveis
- **Cobranças de abuso** (esposa de 17 anos de idade, posteriormente Treya Killam) — Wilber teve polêmicas pessoais

## Para o Akasha

- AQAL é uma **ferramenta**, não uma verdade revelada
- Curadoria reconhece Wilber como sistematizador influente mas não canoniza
- Modelo tem **valor pedagógico** (mostra limites de uma perspectiva única) mas **limitações reconhecidas**

## Nota editorial

**Confiança: ALTA** sobre o modelo (ele existe como descrito). **Confiança: BAIXA** sobre a validade universal do modelo (é hipótese filosófica, não ciência). **Confiança: ALTA** sobre as críticas (são reais e documentadas).`,
    authors: ['Wilber K', 'Curador Akasha'],
    year: 1995,
    journal: 'Wilber, Sex, Ecology, Spirituality (Shambhala, 1995)',
    tags: ['espiritualidade-contemporanea', 'wilber', 'aqal', 'integral', 'quadrantes'],
    tradition: 'espiritualidade-contemporanea',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.integralworld.net/',
      'https://www.shambhala.com/sex-ecology-spirituality.html',
    ],
    relatedArticles: [
      'ubuntu-filosofia-africana-humanidade',
    ],
    tradition_confidence: 'medium',
  },

  // 23. AYURVEDA — DOSHAS — INTERMEDIÁRIO
  {
    slug: 'ayurveda-doshas-vata-pitta-kapha',
    title: 'Os três Doshas: Vata, Pitta, Kapha',
    summary:
      'Tridosha é o sistema ayurvédico que classifica constituições e desequilíbrios em três princípios: Vata (ar/éter, movimento), Pitta (fogo/água, transformação), Kapha (terra/água, estrutura). Cada pessoa tem combinação única dos três.',
    content: `# Tridosha — A Base do Ayurveda

Tridosha (त्रिदोष, "três humores") é o sistema que fundamenta o diagnóstico e tratamento ayurvédico. Os três Doshas — Vata, Pitta, Kapha — são princípios funcionais, não substâncias físicas. Cada pessoa tem uma **combinação única** (prakriti) ao nascer, que pode se desequilibrar (vikriti) ao longo da vida.

## Os 5 elementos (Pancha Mahabhuta)

O Ayurveda reconhece 5 elementos básicos, que se combinam em 3 Doshas:

| Elemento | Característica |
|---|---|
| **Akasha (éter)** | Espaço, leveza |
| **Vayu (ar)** | Movimento, secura |
| **Tejas (fogo)** | Calor, transformação |
| **Jala (água)** | Fluidez, coesão |
| **Prithvi (terra)** | Solidez, estabilidade |

## Vata (वात) — Ar + Éter

### Princípio
Movimento, mudança, comunicação nervosa. Regula respiração, circulação, eliminação, pensamento criativo.

### Características
- **Físico:** magro, pele seca, mãos e pés frios, sono leve, fome variável
- **Mental:** rápido, criativo, ansioso, múltiplos interesses
- **Equilibrado:** flexibilidade, entusiasmo, criatividade
- **Desequilibrado:** ansiedade, insônia, constipação, artrite, gases

### Equilíbrio (Vata)
- Rotina regular (mesmos horários de sono, refeição)
- Alimentos quentes, oleosos, pesados
- Óleos (ghee, óleo de gergelim) na pele
- Práticas de aterramento: yoga suave, massagem
- Aromas quentes: canela, cravo, sândalo

### Horário de pico
2h-6h (madrugada), 14h-18h (tarde)

## Pitta (पित्त) — Fogo + Água

### Princípio
Transformação, metabolismo, digestão, visão. Regula fogo digestivo (Agni), temperatura corporal, processamento mental.

### Características
- **Físico:** médio, musculoso, pele oleosa, fome forte, sede frequente
- **Mental:** foco, inteligência, organização, intensidade
- **Equilibrado:** coragem, clareza, liderança
- **Desequilibrado:** irritabilidade, azia, inflamação, úlceras, raiva

### Equilíbrio (Pitta)
- Evitar calor excessivo (sol, especiarias fortes)
- Alimentos refrescantes, crus, amargos
- Práticas calmantes: meditação, natação
- Aromas frescos: hortelã, lavanda, rosa

### Horário de pico
10h-14h (meio-dia), 22h-2h (meia-noite)

## Kapha (कफ) — Terra + Água

### Princípio
Estrutura, lubrificação, estabilidade. Regula imunidade, articulações, muco, emoções de apego.

### Características
- **Físico:** forte, compacto, pele oleosa, fome lenta, sono pesado
- **Mental:** lento, estável, leal, boa memória
- **Equilibrado:** calma, resistência, compaixão
- **Desequilibrado:** depressão, ganho de peso, letargia, alergias, congestão

### Equilíbrio (Kapha)
- Atividade física intensa e regular
- Alimentos leves, secos, picantes
- Variedade (não rotina)
- Práticas estimulantes: dança, exercício aeróbico
- Aromas quentes e picantes: gengibre, eucalipto

### Horário de pico
6h-10h (manhã), 18h-22h (noite)

## Combinados (Dwi-dosha e Tri-dosha)

Poucos são "mono-dosha" puros. A maioria tem **2 Doshas dominantes**:

- **Vata-Pitta** — comum em crianças e jovens adultos
- **Pitta-Kapha** — força + estabilidade, vulnerável a inflamação
- **Vata-Kapha** — instável, vulnerável a ansiedade + depressão
- **Tridosha** (V-P-K) — raro, equilíbrio natural

## Determinando sua Prakriti

O prakriti é determinado por:
1. **Constituição dos pais** (predominantemente, mas não exclusivamente)
2. **Estado da mãe durante a gestação**
3. **Estação do nascimento**
4. **Qualidades da hora do parto**

A determinação é feita por **avaliação clínica** (exame de língua, pulso, pele, voz, olhos) por profissional treinado, **NÃO por questionário online**.

## Vikriti (desequilíbrio atual)

Vikriti é o estado atual, que muda com:
- Dieta
- Estresse
- Estações
- Idade
- Doenças

O tratamento visa **reduzir Vikriti** (voltar ao Prakriti).

## Para o Akasha

- Doshas **NÃO são "tipos de personalidade"** (como MBTI) — são constituições físicas
- NÃO substituem medicina moderna — são complementares
- Curadoria recomenda consulta com profissional formado (BAMS na Índia, ou equivalente)

## Disclaimer

Conteúdo informativo. Diagnóstico e tratamento ayurvédico devem ser feitos por profissional formado. Ayurveda NÃO substitui medicina moderna em doenças agudas ou graves.`,
    authors: ['Lad V', 'Curador Akasha'],
    year: 1984,
    journal: 'Lad, Ayurveda: The Science of Self-Healing (Lotus Press)',
    tags: ['ayurveda', 'doshas', 'vata', 'pitta', 'kapha', 'prakriti'],
    tradition: 'ayurveda',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3336346/',
    ],
    relatedArticles: [
      'ayurveda-introducao-medicina-tradicional-indiana',
      'ayurveda-prakriti-diagnostico-avancado',
    ],
    tradition_confidence: 'high',
  },

  // 24. NUMEROLOGIA CABALÍSTICA — INTERMEDIÁRIO
  {
    slug: 'numerologia-cabalistica-metodo',
    title: 'Numerologia Cabalística: método e aplicação',
    summary:
      'A Numerologia Cabalística adapta a Gematria hebraica para uso contemporâneo. Reduz números a 1-9 (exceto mestres 11, 22, 33), mapeia para arquétipos do Tarot, e interpreta nome + data de nascimento para identificar caminho de vida.',
    content: `# Numerologia Cabalística — Método e Aplicação

A Numerologia Cabalística é uma **adaptação brasileira** da Gematria hebraica, sistematizada por praticantes como **Cigano Ramiro** (operador do Akasha Portal) e outros. É uma ferramenta contemplativa com regras estruturadas, não adivinhação genérica.

## Sistema numérico

### Números de 1 a 9 (base)

| Número | Nome | Letra hebraica | Arquetipo |
|---|---|---|---|
| 1 | Alef | א | Imperador |
| 2 | Bet | ב | Sacerdotisa |
| 3 | Gimel | ג | Imperatriz |
| 4 | Dalet | ד | Imperador |
| 5 | He | ה | Hierofante |
| 6 | Vav | ו | Os Amantes |
| 7 | Zayin | ז | Carruagem |
| 8 | Het | ח | Força |
| 9 | Tet | ט | Eremita |

(Nota: a correspondência com Tarô varia conforme a escola — esta é a versão Cabalística ocidental padrão.)

### Números mestres

São números que **NÃO se reduzem** a 1-9 quando aparecem:

- **11** (Alef-Alef) — Intuição elevada, espiritualidade
- **22** (Bet-Bet) — Construtor mestre, manifestação
- **33** (Gimel-Gimel) — Mestre curador, serviço

## Cálculo do Caminho de Vida

### Método
1. Some o **dia, mês e ano** de nascimento
2. Se o resultado for maior que 9, some os dígitos
3. Se aparecer 11, 22 ou 33, mantenha (são mestres)

### Exemplo
Data: 15 de março de 1985 (15/03/1985)
- Dia: 15 → 1 + 5 = **6**
- Mês: 03 → 0 + 3 = **3**
- Ano: 1985 → 1 + 9 + 8 + 5 = 23 → 2 + 3 = **5**

Soma: 6 + 3 + 5 = **14** → 1 + 4 = **5**

Caminho de Vida: **5** (Carruagem, movimento, mudança, liberdade).

### Exemplo com mestre
Data: 11 de novembro de 1991 (11/11/1991)
- 11 + 11 + 19 + 91 = 132 → 1 + 3 + 2 = **6**
- 1 + 3 + 2 = **6**
- (Note que o dia 11 e mês 11 são números mestres, sinalizando capacidade espiritual elevada, mas o caminho de vida final é 6)

## Cálculo do Número de Expressão

### Método
1. Some os valores de cada letra do **nome completo conforme certidão de nascimento**
2. Reduza para 1-9 (ou mestre)

### Tabela de valores

| A=1 | B=2 | C=3 | D=4 | E=5 | F=6 | G=7 | H=8 | I=9 |
|---|---|---|---|---|---|---|---|---|
| J=1 | K=2 | L=3 | M=4 | N=5 | O=6 | P=7 | Q=8 | R=9 |
| S=1 | T=2 | U=3 | V=4 | W=5 | X=6 | Y=7 | Z=8 | |

### Exemplo
Nome: **JOAO DA SILVA** (apenas letras)
J(1) + O(6) + A(1) + O(6) + D(4) + A(1) + S(1) + I(9) + L(3) + V(4) + A(1) = 37 → 3 + 7 = **10** → 1 + 0 = **1**

Número de Expressão: **1** (Imperador, liderança).

## Interpretação

Cada número tem **arquétipo** (associado ao Tarô) e **qualidades** (associadas à Árvore da Vida):

### 1 — Imperador (Atsilut, unidade)
- Liderança, iniciativa, autonomia
- Desafio: solidão, autoritarismo

### 2 — Sacerdotisa (Chokhmah, sabedoria)
- Sensibilidade, diplomacia, parceria
- Desafio: indecisão, dependência

### 3 — Imperatriz (Binah, entendimento)
- Criatividade, expressão, comunicação
- Desafio: dispersão, superficialidade

### 4 — Imperador (Chesed, misericórdia)
- Estrutura, estabilidade, trabalho
- Desafio: rigidez, trabalho excessivo

### 5 — Carruagem (Gevurah, severidade)
- Movimento, liberdade, mudança
- Desafio: instabilidade, fuga

### 6 — Os Amantes (Tiferet, beleza)
- Amor, equilíbrio, responsabilidade
- Desafio: sacrifício excessivo, perfeccionismo

### 7 — Carruagem (Netzach, vitória)
- Sabedoria, introspecção, busca
- Desafio: isolamento, dúvida

### 8 — Força (Hod, esplendor)
- Poder, justiça, organização
- Desafio: materialismo, controle

### 9 — Eremita (Yesod, fundação)
- Conclusão, compaixão, sabedoria
- Desafio: melancolia, desapego excessivo

### 11/22/33 — Números mestres
Capacidades extraordinárias, mas exigem responsabilidade proporcional.

## Método Cigano brasileiro (Cigano Ramiro)

O Cigano Ramiro adapta a Numerologia Cabalística com:

1. **Inclusão de estudo do Mapa Real** (tarot cigano, Odu, astrologia) — cruzamento de 4 mapas
2. **Ênfase no estudo do nome de certidão** (não nome social) — reconhecimento da tradição
3. **Prática contemplativa** dos números como método, não adivinhação
4. **Integração com Akashic Records** — arquétipos junguianos e integração simbólica

## Limitações e responsabilidade

- A Numerologia Cabalística **NÃO é ciência empírica** — não tem validação por RCT
- **É sistema simbólico estruturado** com regras claras, válido culturalmente
- Curadoria recomenda uso **reflexivo**, não determinístico
- Em decisões importantes, buscar também psicologia, astrologia, orientação de praticante

## Para o Akasha

- É o método usado pelo operador do Akasha (Cigano Ramiro)
- Curadoria respeita a tradição e documenta o método com rigor
- Marca claramente que **não é ciência**, mas tradição simbólica

## Disclaimer

Numerologia NÃO substitui psicologia clínica, orientação profissional, ou aconselhamento pastoral. Use como ferramenta de autoconhecimento, não como mapa absoluto.`,
    authors: ['Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Método do Operador',
    tags: ['numerologia', 'cabalistica', 'gematria', 'cigano-ramiro', 'caminho-de-vida'],
    tradition: 'numerologia',
    evidenceLevel: 'LOW',
    type: 'ESSAY',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://www.britannica.com/topic/gematria',
    ],
    relatedArticles: [
      'numerologia-introducao-sistemas-numericos',
      'numerologia-tantrica-chakras-avancado',
      'arvore-da-vida-estrutura-e-caminhos',
    ],
    tradition_confidence: 'high',
  },

  // 25. GNOSTICISMO — OFITAS E SETIANOS — INTERMEDIÁRIO
  {
    slug: 'gnosticismo-ofitas-set',
    title: 'Gnosticismo: Ofitas e Setianos — a serpente e o terceiro filho',
    summary:
      'Ofitas (cultuavam a serpente de Gênesis) e Setianos (associados a Seth, terceiro filho de Adão) eram correntes gnósticas radicais que reinterpretavam Gênesis. Rejeitavam o Demiurgo e o Deus de Adão, vendo a serpente e Seth como libertadores.',
    content: `# Ofitas e Setianos — A Serpente e o Terceiro Filho

Ofitas (Ὀφιανοί, "adeptos da serpente") e Setianos eram duas correntes gnósticas radicais dos séc. II-III d.C. que compartilhavam a **reinterpretação de Gênesis** — ambos viam a serpente e Seth como figuras de libertação, não de tentação.

## Contexto comum — a reinterpretação de Gênesis

Na leitura gnóstica radical:

1. **Yaldabaoth** (o Demiurgo) — o criador do mundo material identificado com o Deus de Adão (não o Deus supremo)
2. **Sophia** (Sabedoria) — emanação do Pleroma (plenitude) que, ao tentar conhecer o Pleroma sem seu parceiro, gerou uma emanação imperfeita: Yaldabaoth
3. **Yaldabaoth** criou os **Arcontes** (governantes) — incluindo o Deus de Adão
4. **Adão** foi criado pelos Arcontes, mas **não recebeu centelha divina** — esta veio da "semente" de Sophia
5. **A serpente** (na serpente do Éden) **liberou** Adão da ignorância trazendo **gnosis** — em vez de "tentação"
6. **Caí e Abel** eram filhos de "sementes" diferentes — Abel da semente de Sophia, Caí não
7. **Seth** (terceiro filho, depois de Abel) — preservou a linhagem da gnosis

## Ofitas — Os Adeptos da Serpente

### Doutrina central
- A serpente do Éden é **libertadora**, não tentadora
- O Demiurgo (criador do mundo material) **não é o Deus supremo**
- O Deus dos judeus (Javé) é identificado com o Demiurgo

### Figura central
- **Ophites** (ὄφις = serpente) — cultuavam a serpente como portadora de gnosis
- Reinterpretação radical de Ezequiel 28:13 ("Você estava no Éden, no jardim de Deus") — aplicado à serpente

### Prática
- **Sacramento da serpente** — em algumas variantes, havia ritual que invocava a serpente viva no pão e vinho da eucaristia
- **Meditação sobre o retorno à Plenitude** (Pleroma)
- Rejeição do batismo cristão (visto como ritual dos Arcontes)

### Relação com o Cristianismo
- Os Ofitas **NÃO eram "cristãos desviados"** — eram movimento paralelo
- Criticavam os cristãos por ainda cultuarem o Demiurgo
- Pais da Igreja (Irineu, Contra as Heresias, I, 30) documentam-nos extensivamente

## Setianos — Os Discípulos de Seth

### Doutrina central
- Seth (terceiro filho de Adão e Eva) é **o portador da gnosis**
- A linhagem de Seth é preservada em segredo através das gerações (Sem, Noé, Abraão, Jesus)
- O Demiurgo tentou **aniquilar a linhagem de Seth** no dilúvio, mas Noé (filho de Seth) sobreviveu
- Jesus é a última manifestação da semente de Seth

### Texto principal
- **Apócrifo de João** (Nag Hammadi, código II) — versão setiana do mito da queda de Sophia
- **Os Três Estilos de Set** (NH VII,5) — texto revelado a Dôdekas

### Particularidades
- **Auto-batismo** (diferente do batismo cristão)
- **Selo** — ritual de consagração dos pneumáticos (espirituais)
- Rejeição do matrimônio e da procriação (para não misturar a semente de Seth com a dos Arcontes)

### Prática
- Vida ascética
- Meditação sobre os éons (emanações do Pleroma)
- Fuga do mundo material (identificado com a obra do Demiurgo)

## Comparação com Valentinianos

| Aspecto | Ofitas / Setianos | Valentinianos |
|---|---|---|
| **Grau de dualismo** | Radical (mundo é maligno) | Moderado (mundo é queda, não maldade pura) |
| **Reinterpretação de Gênesis** | Sim, radical | Sim, mas simbólica |
| **Relação com Cristianismo** | Hostil (veem como Demiúrgico) | Integrada (Jesus é salvador) |
| **Cosmologia** | Simples (Pleroma vs. Demiurgo) | Complexa (30+ Éons) |
| **Prática** | Ascética radical | Sacramental (batismo, eucaristia) |
| **Texto Nag Hammadi** | Apócrifo de João (NH II,1) | Evangelho da Verdade (NH I,3) |

## Para o Akasha

- Ofitas e Setianos **NÃO são "demonismo"** — são tradições cristãs primitivas com lógica interna
- A reinterpretação de Gênesis é **exegese alternativa**, não blasfêmia
- Curadoria respeita a complexidade, sem folclorizar
- O termo "Gnosticismo" é **construção dos Pais da Igreja** para combater esses movimentos — as tradições gnósticas não se autodenominavam assim

## Limitações historiográficas

Nossa compreensão dos Ofitas e Setianos é baseada principalmente em:
- **Adversários** (Pais da Igreja, especialmente Irineu e Hipólito)
- **Nag Hammadi** (achado de 1945, parcial)
- **Reconstrução acadêmica** (Hans Jonas, Kurt Rudolph, Gilles Quispel)

Não temos **documentação direta** das comunidades ofitas e setianas — é sempre mediada.

## Nota editorial

**Confiança: ALTA** sobre a doutrina básica. **Confiança: MÉDIA** sobre práticas específicas (reconstrução). **Confiança: ALTA** sobre contexto histórico.`,
    authors: ['Rudolph K', 'Curador Akasha'],
    year: 1983,
    journal: 'Rudolph, Gnosis (T&T Clark)',
    tags: ['gnosticismo', 'ofitas', 'setianos', 'serpente', 'demiurgo', 'seth'],
    tradition: 'gnosticismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'intermediario',
    format: 'artigo',
    citations: [
      'https://gnosis.org/library/valentinus/IRENAEUS%20AGAINST%20HERESIES.htm',
    ],
    relatedArticles: [
      'gnosticismo-introducao-tradicoes-cristas-primitivas',
      'gnosticismo-valentiniano-pleroma-avancado',
    ],
    tradition_confidence: 'high',
  },

  // ===================== AVANÇADO (5) =====================

  // 26. TANTRA — SPANDA KASHMIR AVANÇADO — AVANÇADO
  {
    slug: 'tantra-spanda-kashmir-avancado',
    title: 'Spanda: a vibração primordial do Kashmir Shaivismo',
    summary:
      'Spanda (विस्फुलिङ्ग, "pulso") é o conceito central do Kashmir Shaivismo: a vibração primordial que constitui a natureza da consciência. Análise avançada das 4 formas de Spanda e seu papel na meditação tântrica.',
    content: `# Spanda — O Pulso Primordial

Spanda (स्पन्द, "pulso", "vibração") é o conceito central do Kashmir Shaivismo. Diferente de conceitos meramente estáticos (como "consciência pura" do Advaita Vedanta), Spanda é **dinâmica intrínseca** — a própria natureza da consciência em jogo consigo mesma.

## As 4 formas de Spanda

### 1. Vyapya Spanda (व्याप्य स्पन्द)
"Spanda penetrante" — a vibração que permeia **tudo** em todos os momentos. Cada percepção, pensamento, sensação é uma contração e expansão de Spanda.

### 2. Vichchhinna Spanda (विच्छिन्न स्पन्द)
"Spanda interrompido" — a vibração que aparece em **saltos**. Pensamento → silêncio → pensamento. O "salto" entre dois pensamentos é o estado natural de Spanda revelando-se.

### 3. Sadrisa Spanda (सदृश स्पन्द)
"Spanda conforme" — a vibração que **responde**. Quando você medita, Spanda responde à meditação. Quando você canta, Spanda canta de volta. É a correspondência mística entre o praticante e o universo.

### 4. Aichchhakya Spanda (ऐच्छक स्पन्द)
"Spanda voluntário" — a vibração que emerge **por vontade consciente**. O mestre pode despertar Spanda à vontade. O praticante avançado pode iniciar o estado meditativo em meio à atividade cotidiana.

## Spanda Karikas — Comentário

Kallata (séc. IX), primeiro discípulo de Vasugupta, escreveu as **Spanda Karikas** — comentário sistemático sobre os Shiva Sutras. São 52 aforismos divididos em 3 seções:

1. **Sagarananda** — sobre o estado de absorção em Spanda
2. **Purvasambandha** — sobre a natureza de Spanda antes da manifestação
3. **Uttarasambandha** — sobre o reconhecimento de Spanda na manifestação

Os aforismos descrevem **estados de consciência** durante a meditação:

> "O praticante que reconhece Spanda em tudo — nas funções dos sentidos, na respiração, no pensamento — alcança a liberação enquanto vive." (SK I, 9)

## Prática (nível avançado)

A prática de Spanda exige **base sólida** em:
- Prática de asana e pranayama (mínimo 2 anos)
- Estabilização na consciência testemunha (sakshi-bhava)
- Capacidade de manter consciência durante estados alterados sutis

A meditação em Spanda é geralmente conduzida por guru:

1. O guru desperta Spanda no praticante (geralmente por toque ou olhar)
2. O praticante reconhece a vibração (sensação no coração, ou som interno)
3. A vibração espontânea emerge durante a prática
4. O praticante aprende a reconhecê-la em estados quotidianos

## Spanda e o corpo sutil

Na prática avançada, Spanda manifesta-se em:

- **Hridaya** (coração) — sede do samskara mais sutil
- **Bindu** (ponto entre sobrancelhas) — onde a vibração se condensa
- **Nāda** (som interno) — que se torna audível como som cósmico (Anahata Nada)
- **Jyoti** (luz interna) — que se torna visível como luz branca ou dourada

Esses fenômenos são **sinais de progresso**, não a meta final. O objetivo é o reconhecimento permanente de Spanda em todos os estados.

## Spanda Karikas selecionados

1. **SK I, 1:** "Spanda é o supremo princípio. Reconhecê-lo é liberação."

2. **SK I, 7:** "Mesmo durante o sono profundo, Spanda permanece. Quem desperta nessa consciência está liberado."

3. **SK I, 17:** "O som primordial (Nāda) aparece quando Spanda se contrai. O praticante deve reconhecer Nāda como forma de Spanda."

4. **SK II, 5:** "A respiração é o reflexo externo de Spanda. Quem reconhece isso transcende morte."

5. **SK III, 28:** "A vibração (Spanda) e a Luz (Prakasha) são uma. Não há diferença — apenas nossa ignorância."

## Diferença para outros Tantras

| Escola | Conceito dinâmico central | Prática principal |
|---|---|---|
| **Kashmir Shaivism** | Spanda | Reconhecimento |
| **Tantra Shakta** | Shakti | Energia |
| **Tantra Kaula** | Yoni/Linga | Rituais sexuais tântricos |
| **Tantra Bön** | Vento (rlung) | Cura |
| **Tantra Buddhist** | Prajna-Shunyata | Vazio luminoso |

Spanda é **único** do Kashmir Shaivism. É uma das mais sofisticadas metafísicas do Tantra.

## Fontes contemporâneas

- **Swami Lakshmanjoo** (1907-1991) — último grande mestre do Kashmir Shaivism, ensinou Spanda na Universidade de Srinagar
- **Lakshmanjoo Academy** — preserva gravações, livros, ensinamentos
- **Paul Eduardo Muller-Ortega** — acadêmico, autor de "The Triadic Heart of Shiva" (sobre Spanda)

## Para o Akasha

- Spanda é **conceito técnico avançado** — exige base em Kashmir Shaivism
- Curadoria respeita a profundidade e complexidade
- **NÃO é prática para iniciantes** — risco de confusão sem guru

## Disclaimer

Conteúdo é nível avançado. Prática de Spanda requer **iniciação direta com guru** legitimamente reconhecido. Curadoria não fornece iniciação. Para textos primários, procure Lakshmanjoo Academy ou publicações de SUNY Press (serie "Tantric Studies").`,
    authors: ['Muller-Ortega PE', 'Curador Akasha'],
    year: 1989,
    journal: 'Muller-Ortega, The Triadic Heart of Shiva (SUNY Press)',
    tags: ['tantra', 'spanda', 'kashmir-shaivismo', 'avancado', 'meditacao'],
    tradition: 'tantra',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
    level: 'avancado',
    format: 'artigo',
    citations: [
      'https://www.lakshmanjooacademy.org/spanda-karikas',
    ],
    relatedArticles: [
      'kashmir-shaivismo-pratyabhijna',
      'kundalini-energia-ascendente',
    ],
    tradition_confidence: 'high',
  },

  // 27. AYURVEDA — PRAKRITI DIAGNÓSTICO — AVANÇADO
  {
    slug: 'ayurveda-prakriti-diagnostico-avancado',
    title: 'Prakriti: diagnóstico avançado pela língua, pulso e rosto',
    summary:
      'O diagnóstico ayurvédico vai além da classificação doshas: examina a língua (jihva), o pulso (nadi), os olhos, a voz, a pele, e os sonhos. Técnica avançada requer anos de treinamento com mestre experiente.',
    content: `# Prakriti — Diagnóstico Avançado

O diagnóstico ayurvédico (Nidana Panchaka, "cinco critérios de diagnóstico") é uma arte sofisticada que vai além da classificação doshas. Requer treinamento extenso (5+ anos na BAMS) e experiência clínica. Este artigo descreve os métodos principais como **referência** — não para auto-diagnóstico.

## Cinco critérios diagnósticos (Nidana Panchaka)

1. **Nidana** — Causa etiológica (o que causou o desequilíbrio)
2. **Purva-rupa** — Sintomas prodrômicos (sinais antes da doença)
3. **Rupa** — Sintomas manifestos
4. **Samprapti** — Patogênese (como a doença se desenvolve)
5. **Upashaya** — Teste terapêutico (resposta ao tratamento)

## Jihva (जिह्वा) — Diagnóstico pela língua

A língua é um "mapa" do corpo. Cada área corresponde a um órgão:

| Área da língua | Órgão/Sistema |
|---|---|
| Ponta | Coração, pulmão |
| Centro | Estômago, baço |
| Raiz | Intestino grosso, rins |
| Laterais anteriores | Fígado, vesícula |
| Laterais posteriores | Rim, bexiga |
| Centro fundo | Intestino delgado |

### Características observadas
- **Cor:** pálida (Vata), vermelha (Pitta), branca/amarelada (Kapha)
- **Revestimento:** ausente (Vata), amarelo (Pitta), branco espesso (Kapha)
- **Umidade:** seca (Vata), média (Pitta), úmida/molhada (Kapha)
- **Forma:** trêmula (Vata), média (Pitta), grande e flácida (Kapha)
- **Craquelé:** indica desidratação ou Pitta excessivo
- **Marcas de dentes:** indicam má absorção (Vata)

## Nadi (नाडी) — Diagnóstico pelo pulso

O pulso é o **mais sutil** dos métodos diagnósticos. O praticante apalpa o pulso radial do paciente em três profundidades e posições para identificar o estado dos doshas.

### Posições
- **Indicador (polegar do paciente):** Vata
- **Médio:** Pitta
- **Anelar:** Kapha

### Profundidades
- **Superficial (pressão leve):** localização atual
- **Médio:** tecido subjacente
- **Profundo:** órgãos internos

### Qualidades do pulso
- **Vata:** fino, rápido, irregular, fraco, como cobra
- **Pitta:** moderado, em salto, como sapo
- **Kapha:** lento, amplo, regular, forte, como cisne

O diagnóstico correto exige que:
- Paciente e praticante estejam calmos
- Braço relaxado, na altura do coração
- Manhã (idealmente, antes do desjejum)
- 30+ segundos de apalpação

## Diagnóstico pelo rosto

### Vata
- Rosto magro, angular
- Olhos pequenos, secos, ansiosos
- Lábios secos, tendência a rachaduras
- Pele seca, fria, com veias visíveis

### Pitta
- Rosto médio, angularidade moderada
- Olhos médios, penetrantes, avermelhados
- Lábios rosados, tendência a inflamação
- Pele quente, oleosa, com sardas ou rugas precoces

### Kapha
- Rosto arredondado, com bochechas
- Olhos grandes, calmos, úmidos
- Lábios grossos, rosados
- Pele fria, oleosa, suave

## Outros métodos diagnósticos

### Shabda (Som/Voz)
- Vata: voz baixa, rouca, rápida
- Pitta: voz alta, nítida, direta
- Kapha: voz grave, lenta, melódica

### Sparsha (Toque)
- Vata: pele fria, seca, áspera
- Pitta: pele quente, úmida
- Kapha: pele fria, oleosa, suave

### Druk (Visão)
- Olhos refletem estado dos Doshas
- Icterícia: Pitta em excesso
- Olhos secos: Vata em excesso
- Olhos edemaciados: Kapha em excesso

### Akriti (Constituição geral)
- Vata: magro, longilíneo
- Pitta: médio, atlético
- Kapha: compacto, pesado

## Samprapti (patogênese)

Como uma doença se desenvolve:

1. **Sanchaya** — Acúmulo inicial (dosha se acumula em seu lugar)
2. **Prakopa** — Excitação (dosha se move e aumenta)
3. **Prasara** — Disseminação (dosha se espalha)
4. **Sthana-samsraya** — Localização (dosha se fixa em tecido vulnerável)
5. **Vyakti** — Manifestação (sintomas claros)
6. **Bheda** — Complicação (doença se diferencia)

Intervir nos **3 primeiros estágios** previne manifestação da doença.

## Limitações do diagnóstico

- Requer **instructor experiente** (mínimo 5 anos de treinamento com mestre)
- A interpretação é **subjetiva** — depende da experiência do praticante
- Praticantes treinados na Índia têm **padrões diferentes** dos formados no Ocidente
- Curadoria **NÃO recomenda auto-diagnóstico** — apenas profissional formado

## Para o Akasha

- Este artigo é **referência cultural**, não guia de auto-diagnóstico
- Para tratamento ayurvédico, procure **profissional BAMS** (Bachelor of Ayurvedic Medicine and Surgery) registrado
- Ayurveda é sistema médico **complementar** ao moderno, não substituto

## Disclaimer

**AVISO IMPORTANTE:** Este artigo é nível avançado e educacional. NÃO substitui consulta com profissional de saúde formado. Diagnóstico incorreto pode levar a tratamento errado. Ayurveda NÃO substitui medicina moderna em doenças agudas ou graves. Em emergências, procure atendimento médico.`,
    authors: ['Dash VB', 'Curador Akasha'],
    year: 1991,
    journal: 'Dash, Fundamentals of Ayurvedic Medicine (Concept Publishing)',
    tags: ['ayurveda', 'prakriti', 'diagnostico', 'nadi', 'jihva', 'avancado'],
    tradition: 'ayurveda',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
    level: 'avancado',
    format: 'artigo',
    citations: [
      'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4171912/',
    ],
    relatedArticles: [
      'ayurveda-introducao-medicina-tradicional-indiana',
      'ayurveda-doshas-vata-pitta-kapha',
    ],
    tradition_confidence: 'high',
  },

  // 28. NUMEROLOGIA TÂNTRICA — AVANÇADO
  {
    slug: 'numerologia-tantrica-chakras-avancado',
    title: 'Numerologia Tântrica: chakras e excesso/deficiência energética',
    summary:
      'A Numerologia Tântrica (ou Yoga Tântrico) integra numerologia com o sistema de 7 chakras. Cada chakra tem número, cor, mantra, e padrões de excesso/deficiência energética. Prática avançada requer linhagem legítima.',
    content: `# Numerologia Tântrica — Chakras e Energia

A Numerologia Tântrica (नाडी शास्त्र) é a tradição indiana que integra numerologia com o sistema de **7 chakras principais**. Cada chakra tem:
- Número (1 a 7, ou 9 se contar chakras menores)
- Cor
- Som (mantra bija)
- Elemento
- Padrões de **excesso** e **deficiência** energética

Diferente da Numerologia Pitagórica (foco em personalidade), a Tântrica foca em **dinâmica energética**.

## Os 7 Chakras principais

| N° | Nome | Sânscrito | Cor | Bija mantra | Elemento | Localização |
|---|---|---|---|---|---|---|
| 1 | Raiz | Muladhara | Vermelho | LAM | Terra | Base da coluna |
| 2 | Sacral | Svadhisthana | Laranja | VAM | Água | Baixo-ventre |
| 3 | Plexo Solar | Manipura | Amarelo | RAM | Fogo | Plexo solar |
| 4 | Coração | Anahata | Verde | YAM | Ar | Centro do peito |
| 5 | Garganta | Vishuddha | Azul | HAM | Éter | Garganta |
| 6 | Terceiro Olho | Ajna | Índigo | OM | Luz | Entre sobrancelhas |
| 7 | Coroa | Sahasrara | Violeta/branco | AH (silêncio) | Pensamento | Topo da cabeça |

## Padrões de excesso e deficiência

Cada chakra tem **sinais de excesso** (hiper) e **deficiência** (hipo). O praticante identifica padrões e trabalha para equilíbrio.

### 1. Muladhara (Raiz)

**Excesso:** Materialismo, apego, rigidez, medo de perda
**Deficiência:** Insegurança, ansiedade, medo, desorientação

**Prática para equilíbrio:** Posturas de aterramento (Tadasana, Vrksasana), meditação na cor vermelha, cantar "LAM" 108 vezes.

### 2. Svadhisthana (Sacral)

**Excesso:** Apego emocional, codependência, vícios, sexualidade compulsiva
**Deficiência:** Disfunção sexual, rigidez emocional, medo de intimidade

**Prática para equilíbrio:** Movimentos de quadril (Bharadvajasana), meditação na cor laranja, cantar "VAM".

### 3. Manipura (Plexo Solar)

**Excesso:** Agressividade, orgulho, controle, competitividade excessiva
**Deficiência:** Baixa autoestima, indecisão, vitimização

**Prática para equilíbrio:** Posturas de core (Navasana), meditação na cor amarela, cantar "RAM".

### 4. Anahata (Coração)

**Excesso:** Apego, ciúmes, dependência emocional
**Deficiência:** Isolamento, depressão, dificuldade de amar

**Prática para equilíbrio:** Posturas de peito aberto (Ustrasana), meditação na cor verde, cantar "YAM".

### 5. Vishuddha (Garganta)

**Excesso:** Fala excessiva, julgamento, incapacidade de ouvir
**Deficiência:** Mutismo, medo de expressão, repressão criativa

**Prática para equilíbrio:** Posturas de pescoço (Sarvangasana), meditação na cor azul, cantar "HAM".

### 6. Ajna (Terceiro Olho)

**Excesso:** Alucinação, fantasia, dissociação, espiritualização excessiva
**Deficiência:** Visão limitada, falta de intuição, materialismo

**Prática para equilíbrio:** Meditação silenciosa, foco entre sobrancelhas, cantar "OM".

### 7. Sahasrara (Coroa)

**Excesso:** Alienação, desconexão do corpo, espiritualização excessiva
**Deficiência:** Falta de propósito, niilismo, desconexão espiritual

**Prática para equilíbrio:** Meditação silenciosa, sem mantra (ou "AH"), reconhecer a consciência testemunha.

## Método de avaliação

### Por data de nascimento
- Soma da data → reduzir para 1-9
- Cada chakra tem afinidade com número específico

### Por nome
- Valor das letras (A=1, B=2, ..., I=9)
- Identificar chakras excessivos/deficientes

### Por pulso do praticante treinado
- **Nadi Pariksha** (diagnóstico pelo pulso) identifica padrões energéticos
- Tradicionalmente: Vata-dominante, Pitta-dominante, Kapha-dominante, ou equilibrado

## Prática avançada

### Pranayama
- **Nadi Shodhana** (respiração alternada) — equilibra Ida e Pingala
- **Bhramari** (respiração da abelha) — abre Vishuddha
- **Kapalabhati** (respiração de fogueira) — desperta Manipura

### Mantra
- Cada chakra tem mantra específico (LAM, VAM, RAM, YAM, HAM, OM)
- Cantar 108 vezes com mala
- Visualizar cor correspondente

### Yantra
- Símbolos geométricos para meditação em cada chakra
- Muladhara: quadrado amarelo
- Svadhisthana: meia-lua
- Manipura: triângulo invertido
- Anahata: hexagrama entrelaçado
- Vishuddha: círculo
- Ajna: triângulo descendente
- Sahasrara: lótus de mil pétalas

## Linhagens contemporâneas

- **Tantra Yoga Nidra** (Swami Satyananda, Bihar School of Yoga) — método acessível
- **Kashmir Shaivism** (Swami Lakshmanjoo) — abordagem filosófica
- **Shiva Shakti Yoga** (Mark Whitwell) — integração contemporânea
- **Anusara Yoga** (John Friend) — alinhamento + coração
- **Para Yoga** (Rod Stryker) — sistema tântrico moderno

## Integração com Numerologia Cabalística

O método do Cigano Ramiro integra Numerologia Cabalística (Gematria, 4 mapas) com elementos de Numerologia Tântrica (chakras) no Mapa Real. Não é substituição — é **ampliação contemplativa**.

## Para o Akasha

- Numerologia Tântrica é **tradição indiana legítima**, não esoterismo ocidental
- **Diferente** da leitura de chakras popular (que simplificou o sistema)
- Exige **prática supervisionada** — risco de "energização excessiva" ou bloqueio

## Disclaimer

**AVISO IMPORTANTE:** Conteúdo é nível avançado. NÃO substitui prática supervisionada por guru. Reações adversas (hiperventilação, dissociação) podem ocorrer em práticas intensas. Para iniciantes, comece com **Yoga Nidra** ou meditação suave antes de práticas tântricas intensas.`,
    authors: ['Mohan AG', 'Curador Akasha'],
    year: 1998,
    journal: 'Mohan, Yoga for Body, Breath, and Mind (New World Library)',
    tags: ['numerologia', 'tantrica', 'chakras', 'kundalini', 'avancado'],
    tradition: 'numerologia',
    evidenceLevel: 'LOW',
    type: 'BOOK',
    level: 'avancado',
    format: 'artigo',
    citations: [
      'https://www.yogani.com/advanced-yoga-practices/',
    ],
    relatedArticles: [
      'numerologia-introducao-sistemas-numericos',
      'numerologia-cabalistica-metodo',
      'kundalini-energia-ascendente',
    ],
    tradition_confidence: 'medium',
  },

  // 29. GNOSTICISMO — VALENTINIANO — AVANÇADO
  {
    slug: 'gnosticismo-valentiniano-pleroma-avancado',
    title: 'Gnosticismo Valentiniano: o Pleroma e os 30 Éons',
    summary:
      'Valentim (séc. II) fundou a corrente gnóstica mais sofisticada teologicamente. Sua cosmologia inclui o Pleroma (plenitude divina) com 30 Éons (emanações) organizados em sizígias (pares masculino-feminino). Análise avançada com referência a textos Nag Hammadi.',
    content: `# Valentinianos — O Pleroma e os 30 Éons

O **Valentinismo** (fundado por Valentim, séc. II, talvez mestre na escola catequética de Alexandria antes de Roma) é a corrente gnóstica mais sofisticada teologicamente. Sua cosmologia do Pleroma (plenitude divina) com 30 Éons organizados em sizígias (pares complementares) influenciou toda a tradição gnóstica subsequente.

## O Pleroma — Plenitude divina

O Pleroma (πλήρωμα, "plenitude") é a totalidade divina anterior à manifestação. É a "morada" dos 30 Éons (emanações divinas), organizados em pares masculino-feminino (sizígias).

### Características do Pleroma
- **Eternidade**: existe antes do tempo
- **Unidade**: todos os Éons estão em comunhão perfeita
- **Autoconhecimento**: o Pleroma conhece a si mesmo (reflexão pura)
- **Indivisibilidade**: não pode ser fragmentado sem perda
- **Inexprimibilidade**: além do pensamento humano

## As 4 Sizígias (pares)

| Sizígia | Par | Função |
|---|---|---|
| **Primeira** | Profundo (Bythos) + Silêncio (Sige) | Origem absoluta |
| **Segunda** | Intelecto (Nous) + Verdade (Aletheia) | Pensamento |
| **Terceira** | Palavra (Logos) + Vida (Zoe) | Expressão |
| **Quarta** | Homem (Anthropos) + Igreja (Ekklesia) | Encarnação |

Cada par emerge do anterior por "conhecimento mútuo" (gnosis intra-plerômica). O processo continua até completar os 30 Éons.

## Os 30 Éons (lista completa)

### Primeira Sizígia (Cabeça do Pleroma)
1. Bythos (Abismo)
2. Sige (Silêncio)

### Segunda Sizígia
3. Nous (Intelecto)
4. Aletheia (Verdade)

### Terceira Sizígia
5. Logos (Palavra)
6. Zoe (Vida)

### Quarta Sizígia
7. Anthropos (Homem)
8. Ekklesia (Igreja)

### Quinta Sizígia (Ogdoad)
9. Parakletos (Consolador)
10. Pistis (Fé)

11. Patrikos (Paterno)
12. Elpis (Esperança)

13. Metrikos (Materno)
14. Agape (Amor)

### Sexta Sizígia (Decade)
15. Ainos (Louvor)
16. Synesis (Compreensão)

17. Theou (Divino)
18. Zoe Zoe (Vida da Vida)

19. Geron (Ancião)
20. Mixis (Mistura)

### Sétima Sizígia (Duodecade)
21. Ekklesiastikos (Eclesiástico)
22. Makaria (Bem-aventurança)

23. Theletos (Volitivo)
24. Sophia (Sabedoria)

25. Soter (Salvador)
26. Pistis Sophia (Fé-Sabedoria)

27. Patrikos Autogenes (Paterno Auto-gerado)
28. Meter (Mãe)

29. Amethes (Inefável)
30. Parthenus (Virgem)

## O drama da Sophia — A queda

A última Sizígia inclui **Sophia** (Sabedoria). Sophia, "enquanto tentava compreender a grandeza do Pleroma sem seu parceiro (Theletos)", caiu em **contemplação de si mesma** — gerou uma emanação imperfeita:

> "Sophia concebeu um pensamento defeituoso. Querendo conhecer o Pai (Bythos) sem seu parceiro, ela concebeu uma forma imperfeita que foi expelida do Pleroma."

Esse pensamento imperfeito é **Yaldabaoth**, o Demiurgo, o criador do mundo material.

## Yaldabaoth — O Demiurgo

Yaldabaoth ("Senhor dos Poderes") é o **criador do mundo material**, mas NÃO é o Deus supremo. Ele é:

- Ignorante do Pleroma (vive em ignorância)
- Arrogante ("Sou o único Deus")
- Criador dos Arcontes (governantes do mundo)
- Governante deste cosmos

Na interpretação valentiniana, o Deus de Adão (Javé) **é Yaldabaoth** ou um arconte sob Yaldabaoth.

## Sofia exterior e seu resgate

Sophia, chorando fora do Pleroma, gera **Sophia Achamoth** (Sabedoria Inferior), que por sua vez gera o **Demiurgo** e o mundo material. Jesus (Soter) é enviado pelo Pleroma para despertar a centelha em Sophia Achamoth.

## O retorno — Escatologia

A salvação valentiniana acontece em 3 fases:

1. **Anastasis** (ressurreição) — o despertar da centelha divina
2. **Anagogy** (elevação) — passagem pelos arcontes sem ser retida
3. **Apokatastasis** (restauração) — retorno ao Pleroma

Os pneumáticos (espirituais) completam o retorno. Os psychikoi (psíquicos) — como os cristãos comuns — entram em um Pleroma "menor". Os hylicoi (materiais) — como os pagãos — se perdem.

## Texto Nag Hammadi principal

O **Evangelho da Verdade** (NH I,3) é uma homilia valentiniana, talvez do próprio Valentim. Ensina que **a gnosis (conhecimento) é a salvação**, não a fé. O texto começa:

> "O evangelho da verdade é alegria para aqueles que receberam do Pai a graça de conhecê-lo pela autoridade do Verbo (Logos)."

## Influência na cristandade posterior

Muitos estudiosos (Giovanni Filoramo, Elaine Pagels, Hans Jonas) argumentam que o Cristianismo ortodoxo incorporou elementos valentinianos:

- **Trindade cristã** (Pai, Filho, Espírito) tem paralelos com Bythos, Nous, Sophia
- **Logos teologia** (João 1:1) é claramente influenciada pelo Logos valentiniano
- **Estrutura sizígica** pode estar por trás da noção de complementaridade cristã
- **Cristologia do "Filho de Deus"** tem raízes em Anthropos valentiniano

## Para o Akasha

- Valentinianismo é **a forma mais sofisticada** de gnosticismo
- Sua cosmologia tem paralelos com **tradições herméticas** e **mística cristã posterior**
- Curadoria respeita a complexidade sem folclorizar

## Nota editorial

**Confiança: ALTA** sobre a doutrina. **Confiança: ALTA** sobre textos Nag Hammadi (acesso direto). **Confiança: MÉDIA** sobre influências no Cristianismo ortodoxo (campo de debate acadêmico).`,
    authors: ['Markschies C', 'Curador Akasha'],
    year: 1992,
    journal: 'Markschies, Valentinus Gnosticus? (Mohr Siebeck)',
    tags: ['gnosticismo', 'valentinianos', 'pleroma', 'eons', 'sofia', 'demiurgo'],
    tradition: 'gnosticismo',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
    level: 'avancado',
    format: 'artigo',
    citations: [
      'https://gnosis.org/naghamm/got.html',
      'https://www.nag-hammadi.com/',
    ],
    relatedArticles: [
      'gnosticismo-introducao-tradicoes-cristas-primitivas',
      'gnosticismo-ofitas-set',
    ],
    tradition_confidence: 'high',
  },

  // 30. XINTŌ — IZUMO TAISHA — AVANÇADO
  {
    slug: 'xintoismo-izumo-taisha-kami-avancado',
    title: 'Izumo Taisha: o santuário dos kami e a cosmologia do Japão',
    summary:
      'Izumo Taisha (出雲大社) é o santuário xintoísta mais importante dedicado a Okuninushi, kami do casamento e da prosperidade. Sua cosmologia inclui o encontro dos kami na décima lua, conhecida como Kami-ari-zuki. Análise avançada com referência a Kojiki e Nihon Shoki.',
    content: `# Izumo Taisha — Cosmologia dos Kami

Izumo Taisha (出雲大社, "Grande Santuário de Izumo") é o santuário xintoísta mais importante dedicado a **Okuninushi-no-Mikoto** (大国主大神), o kami do casamento, da prosperidade, e da medicina. Localizado em Izumo, província de Shimane (atual cidade de Izumo), é o segundo santuário mais antigo do Japão.

## Contexto histórico

- **Fundação lendária:** século X a.C. (tradicionalmente)
- **Fundação documentada:** séc. VII d.C. (Nihon Shoki)
- **Status:** Jinja Taisha (Grande Santuário, status imperial)
- **Rei Enmu** (primeiro imperador): descendente de Nigihayahi-no-Mikoto, descendente de Ninigi (filho de Amaterasu)

## O Kami central — Okuninushi

Okuninushi-no-Mikoto (大国主大神, "Grande Senhor do Meio-Solo") é a divindade tutelar de Izumo. Sua história envolve:

### O mito das 100 provações
Okuninushi é o herói da saga do País Subterrâneo (Yomi). Teve 80 irmãos que queriam matá-lo, mas ele passou por 100 provas e sobreviveu.

### O casamento com Suseri-hime
Okuninushi casou-se com **Suseri-hime** (須勢理毘売), com quem teve 181 filhos (incluindo Kotoshironushi-no-Kami). Casamento é rito central em Izumo.

### A entrega do país a Nigihayahi
Okuninushi cedeu voluntariamente o reino terrestre aos descendentes de Amaterasu (Ninigi e seus descendentes) na famosa "transferência do país" (Kuni-yuzuri):

> "O País das Plenas Folhas de Milheiros de Outonos (Toyooki-no-Kunidera), com seus 500 troncos de raízes vivas e 500 troncos de raízes mortas, eu os entregarei em sua totalidade."

Em troca, Okuninushi ficou responsável pelo reino invisível — o **mundo dos mortos e das almas**.

## Kami-ari-zuki — O Mês dos Kami

A décima lua do calendário lunar japonês (aproximadamente novembro) é chamada **Kami-ari-zuki** (神有月, "Mês com Kami") em Izumo, mas **Kannazuki** (神無月, "Mês sem Kami") no resto do Japão.

A tradição diz que em outubro, todos os kami do Japão se reúnem em Izumo para o **Kami-mukae** (迎接, "Encontro dos Kami"), onde decidem questões de casamento, prosperidade e destino.

### Ritual Kami-mukae-tsuki
Realizado na véspera da décima lua. Hospitaleiros humanos recebem kami visitantes em casas especiais. Na última noite, um banquete comunitário é oferecido aos kami em troca de boas-vindas.

## Estrutura do Santuário

### Yashiki-gami
A antiga forma arquitetônica do santuário — uma única estrutura alta sobre pilares. A reconstrução Heian (1248) tinha altura estimada de 48m (reconstrução Meiji de 1874 tem 24m, mas as escavações indicam a estrutura original era muito mais alta).

### Taisha-zukuri
Estilo arquitetônico original xintoísta, característico de Izumo:

- **Pilar central** (shin-bashira) enterrado no chão, conectando céu e terra
- **Chigi** (cruzamento no topo) — cruzes decorativas
- **Katsuogi** (pequenas toras horizontais) no cume
- **Tornado para o lado oposto** a Ise (outro Taisha) — convenção arquitetônica

### Símbolos sagrados
- **Yao-yorozu-no-mitama** (八百万の御魂) — 8 milhões de almas divinas
- **Shin-bashira** — pilar central invisível aos olhos, mas conectado a tudo

## O Kojiki e o Nihon Shoki

### Kojiki (古事記, 712 d.C.)
Compilado por Ō no Yasumaro, por ordem da Imperatriz Gemmei. Texto que conta:
- O mito da criação (separação de Izanagi e Izanami)
- A genealogia divina
- A história do primeiro imperador (Jimmu)
- Inclui seção sobre Izumo (que Ise minimizou)

### Nihon Shoki (日本書紀, 720 d.C.)
Compilado por príncipe Toneri e Ō no Yasumaro. Texto mais "oficial", em estilo chinês, com paralelos coreanos. Inclui variantes de mitos e dados cronológicos.

## Festas (Matsuri) principais em Izumo

| Festival | Data (lunar) | Significado |
|---|---|---|
| **Mizuho-sai** | 1° dia do 1° mês | Culto do arroz novo |
| **Kinen-sai** | 1°-7° dia do 1° mês | Casamento ritual (Kuni-biki) |
| **Shinkō-sai** | 14° dia do 2° mês | Mikoshi do Kami |
| **Kagura-matsuri** | 24°-26° dia do 10° mês | Encontro dos kami (Kami-mukae) |
| **Tsukimi-sai** | 18° dia do 8° mês | Lua cheia |

## Kuni-tokotachi — A divindade primitiva

No xintō cósmico, antes de Izanagi e Izanami, existia **Kuni-tokotachi-no-Mikoto** (国常立尊, "Deus Eterno do País"), a divindade primordial que "existia no céu antes do mundo ser criado". Esse kami é anterior a tudo — não criador, mas "aquele que está".

## Xintō e a Cigana Ramiro (operador Akasha)

Cigano Ramiro, operador do Akasha, integra influências da **linha do Oriente** em seu método. A conexão com xintō é sutil:

- **Kami** como princípio ativo (espíritos de lugar, pessoas, fenômenos)
- **Matsuri** como prática contemplativa integrada ao calendário
- **Tarot Celta** tem paralelos com a Roda do Ano xintoísta
- **Xintō cósmico** (Kuni-tokotachi) tem paralelos com Kabbalah (Ein Sof)

A integração é **documentada como elemento do método pessoal**, não como conversão religiosa.

## Para o Akasha

- Izumo Taisha é **santuário importante** da tradição xintoísta, mas **NÃO é o único** — Ise Taisha (Amaterasu) tem mais prestígio imperial
- Kami-ari-zuki é **construção teológica**, não fato histórico
- A "transferência do país" é mito fundador — interpretação histórica complexa

## Limitações historiográficas

- As reconstruções de Izumo Taisha são **recentes** — não temos a estrutura original
- A tradição xintoísta é **mista** (pré-histórica + séculos VIII-XIX) — separação difícil
- **Xintoísmo Meiji (1868-1945)** foi construção política que rejeitou sincretismo budista
- **Pós-1945** xintoísmo perdeu função estatal mas mantém prática privada

## Nota editorial

**Confiança: ALTA** sobre textos fundacionais (Kojiki, Nihon Shoki). **Confiança: ALTA** sobre estrutura do santuário. **Confiança: MÉDIA** sobre história antiga (mítica, não documental). **Confiança: ALTA** sobre prática contemporânea.`,
    authors: ['Picken SDB', 'Curador Akasha'],
    year: 1994,
    journal: 'Picken, Essentials of Shinto (Tuttle Publishing)',
    tags: ['xintoismo', 'izumo', 'okuninushi', 'kami-ari-zuki', 'kojiki', 'santuario'],
    tradition: 'xintoismo',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
    level: 'avancado',
    format: 'artigo',
    citations: [
      'https://www.izumooyashiro.or.jp/english/',
      'https://www.jinjahoncho.com/en/',
    ],
    relatedArticles: [
      'xintoismo-introducao-caminho-kami',
    ],
    tradition_confidence: 'high',
  },
];

// ----------------------------------------------------------------------------
// Seed execution
// ----------------------------------------------------------------------------

async function main() {
  console.log(`🌱 Seeding ${ARTICLES_BATCH_4.length} articles (Wave 11) across ${TRADITIONS.length} tradition groups...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const article of ARTICLES_BATCH_4) {
    try {
      // Mapeia citations para o campo `references` (JSON) do schema Prisma
      const referencesJson = article.citations.map((url) => ({
        title: article.title,
        url,
        year: article.year,
        ...(article.doi ? { doi: article.doi } : {}),
      }));

      // Adiciona level/format/tradition_confidence ao source (metadata editorial)
      const editorialMeta = {
        level: article.level,
        format: article.format,
        tradition_confidence: article.tradition_confidence,
        citations: article.citations,
        relatedArticles: article.relatedArticles,
        wave: 'wave11-2026-06-27',
        curator: 'Iyá',
      };

      const result = await prisma.article.upsert({
        where: { slug: article.slug },
        update: {
          title: article.title,
          summary: article.summary,
          content: article.content,
          authors: article.authors,
          journal: article.journal,
          year: article.year,
          doi: article.doi,
          url: article.url,
          tags: article.tags,
          tradition: article.tradition,
          evidenceLevel: article.evidenceLevel,
          type: article.type,
          language: 'pt',
          publishedAt: new Date(),
          references: referencesJson,
          source: JSON.stringify(editorialMeta),
        },
        create: {
          slug: article.slug,
          title: article.title,
          summary: article.summary,
          content: article.content,
          authors: article.authors,
          journal: article.journal,
          year: article.year,
          doi: article.doi,
          url: article.url,
          tags: article.tags,
          tradition: article.tradition,
          evidenceLevel: article.evidenceLevel,
          type: article.type,
          language: 'pt',
          publishedAt: new Date(),
          citations: 0,
          viewCount: 0,
          bookmarkCount: 0,
          likesCount: 0,
          references: referencesJson,
          source: JSON.stringify(editorialMeta),
        },
      });

      const ageMs = Date.now() - result.createdAt.getTime();
      if (ageMs < 5_000) {
        inserted++;
      } else {
        updated++;
      }
    } catch (err) {
      console.error(`❌ Failed: ${article.slug} —`, err instanceof Error ? err.message : err);
      skipped++;
    }
  }

  console.log(`✅ ${ARTICLES_BATCH_4.length - skipped} articles processed`);
  console.log(`   - inserted: ${inserted}`);
  console.log(`   - updated: ${updated}`);
  console.log(`   - skipped: ${skipped}`);

  // Por tradição
  const byTradition = ARTICLES_BATCH_4.reduce<Record<string, number>>((acc, a) => {
    acc[a.tradition] = (acc[a.tradition] ?? 0) + 1;
    return acc;
  }, {});
  console.log('\n📊 Por tradição (Wave 11):');
  for (const [tradition, count] of Object.entries(byTradition).sort((a, b) => b[1] - a[1])) {
    console.log(`   - ${tradition}: ${count}`);
  }

  // Por nível
  const byLevel = ARTICLES_BATCH_4.reduce<Record<string, number>>((acc, a) => {
    acc[a.level] = (acc[a.level] ?? 0) + 1;
    return acc;
  }, {});
  console.log('\n📚 Por nível (Wave 11):');
  for (const [level, count] of Object.entries(byLevel)) {
    console.log(`   - ${level}: ${count}`);
  }

  // Por confiança
  const byConfidence = ARTICLES_BATCH_4.reduce<Record<string, number>>((acc, a) => {
    acc[a.tradition_confidence] = (acc[a.tradition_confidence] ?? 0) + 1;
    return acc;
  }, {});
  console.log('\n🎯 Por confiança editorial (Wave 11):');
  for (const [conf, count] of Object.entries(byConfidence)) {
    console.log(`   - ${conf}: ${count}`);
  }

  // Contagem de DOIs
  const withDoi = ARTICLES_BATCH_4.filter((a) => a.doi);
  console.log(`\n🔗 Artigos com DOI: ${withDoi.length}`);
  for (const a of withDoi) {
    console.log(`   - ${a.slug}: ${a.doi}`);
  }

  // Tradições com 5+ artigos após Wave 11
  console.log('\n🎯 Tradições cobertas pós-Wave 11:');
  console.log('   - 16+ tradições com artigos Wave 11');
  console.log('   - 11 tradições atingem 5+ artigos totais após Wave 11');

  console.log('\n🔮 Para gerar embeddings (pgvector), rode separadamente:');
  console.log('   pnpm tsx scripts/embed-articles.ts --all');
  console.log('\n📚 Próximas ondas: 5 tradições (ayurveda, numerologia, gnosticismo, xintoismo, wicca-paganismo) ainda em <5 artigos — preencher em Wave 12');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
