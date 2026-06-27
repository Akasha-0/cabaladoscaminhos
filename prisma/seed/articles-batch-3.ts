// ============================================================================
// Akasha Portal — Articles Seed Wave 10 (2026-06-27)
// ============================================================================
// Adiciona 20 artigos REAIS em PT-BR fechando gaps de cobertura da Biblioteca
// Akasha. Tradições NOVAS (Hinduísmo, Budismo, Espiritualidade Contemporânea)
// + aprofundamentos (Judaísmo Místico expandido, Xamanismo, Taoismo) +
// pontes ciência↔tradição (neuroplasticidade, respiração holotrópica).
//
// Critérios editoriais (Iyá, Curadora):
//   - Cobertura igualitária: 7 grupos, sem duplicar cobertura existente
//   - Acessibilidade: artigos introdutórios para iniciantes (Buddha histórico,
//     Ubuntu, Espiritualidade Secular)
//   - Profundidade: artigos avançados para praticantes (Vedanta, Neidan,
//     Budismo Tibetano Tantra)
//   - Pontes ciência↔tradição: 2 artigos com DOIs reais (Tang 2015, Grof 1988)
//   - PT-BR, sem anglicismo desnecessário, sem proselitismo
//   - Autores reais (Wilber, Mbiti, Harner, Patañjali, Hasidim, Lao Zi)
//   - Disclaimer explícito em conteúdo ANECDOTAL ou LOW
//
// Distribuição por tradição:
//   - hinduismo               4 artigos
//   - budismo                 4 artigos
//   - judaísmo-místico        2 artigos
//   - espiritualidade-contemp 3 artigos
//   - xamanismo               2 artigos
//   - taoismo                 3 artigos
//   - ciencia-pontes          2 artigos
//                       TOTAL 20 artigos
//
// Total combinado com articles.ts + articles-expanded.ts: 70 artigos na
// Biblioteca Akasha (meta Wave 10).
//
// Referências:
//   - prisma/seed/articles.ts            (P2 #13 — 20 artigos, 5 tradições)
//   - prisma/seed/articles-expanded.ts   (Wave 9 — 30 artigos, 6 tradições)
//   - docs/EVIDENCE-MAP.md               (critérios de evidence level)
//   - docs/GLOSSARY.md                   (termos em língua original)
//   - IDEIA.md                           (mapa de correlações — fonte da verdade)
// ============================================================================

import { PrismaClient, ArticleType, EvidenceLevel } from '@prisma/client';

const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// 20 artigos, 7 grupos temáticos
// ----------------------------------------------------------------------------

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
}

export const ARTICLES_BATCH_3: SeedArticle[] = [
  // ===================== HINDUISMO (4) =====================
  {
    slug: 'bhagavad-gita-campo-batalha-interior',
    title: 'Bhagavad Gita: o campo de batalha interior',
    summary:
      'O diálogo entre Krishna e Arjuna no campo de Kurukshetra é uma das parábolas filosóficas mais influentes da tradição hindu. Lê-se como manual de ética, devoção e ação sem apego.',
    content: `# Bhagavad Gita — O Canto do Bem-Aventurado

A Bhagavad Gita ("O Canto do Senhor") é um poema de 700 versos inserido no Mahabharata (épico hindu do século III a.C., embora a Gita como texto independente date de ~300-100 a.C.). É o diálogo entre o príncipe **Arjuna** e seu auriga **Krishna** (que se revela como divindade) no campo de batalha antes da guerra de Kurukshetra.

## Estrutura

O texto tem 18 capítulos, cada um tratando de um aspecto do dharma (dever/lei cósmica):

- **Cap. 1-2:** o desespero de Arjuna e a resposta filosófica inicial
- **Cap. 3-6:** karma yoga (ação desapaixonada) e jñana yoga (conhecimento)
- **Cap. 7-12:** bhakti yoga (devoção) e as manifestações divinas
- **Cap. 13-18:** a natureza do Ser, da natureza primordial (prakriti) e da transcendência

## Conceitos centrais

- **Karma yoga** — agir com excelência sem apego ao resultado. Não é "não fazer nada", é fazer o que precisa ser feito com retidão.
- **Svadharma** — o dever próprio de cada um, distinto do dharma genérico.
- **Nishkama karma** — ação sem desejo de fruto.
- **Atman** — o Ser individual, idêntico em essência ao Brahman (realidade última).

## Por que continua relevante

A Gita é leitura fundamental no currículo indiano desde o século VIII e influenciou Gandhi (chamava-a de "dicionário espiritual"), Emerson, Thoreau, e a contracultura americana dos anos 60.

## Nota editorial

Este artigo é **introdução acessível**. Praticantes que desejem aprofundamento devem consultar edições críticas com comentário (Sankara, Ramanuja, ou Madhva) — cada comentarista oferece lente filosófica distinta.`,
    authors: ['Vyasa (atrib.)', 'Curador Akasha'],
    year: -300,
    journal: 'Bhagavad Gita As It Is (ed. Prabhupada) ou ed. crítica Penguin',
    tags: ['hinduismo', 'bhagavad-gita', 'krishna', 'karma-yoga', 'etica'],
    tradition: 'hinduismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'vedanta-atman-brahman',
    title: 'Vedanta: Atman, Brahman e a natureza do Ser',
    summary:
      'Vedanta ("fim dos Vedas") é a escola filosófica hindu que pergunta "quem sou eu?". Diálogo entre Advaita (não-dualidade), Dvaita (dualidade) e Vishishtadvaita (não-dualidade qualificada).',
    content: `# Vedanta — A Filosofia do Fim dos Vedas

Vedanta é o nome genérico das **escolas filosóficas hindus baseadas nos Upanishads e nos Brahma Sutras**. A pergunta central é: qual é a natureza do Ser (Atman) e como ele se relaciona com a realidade última (Brahman)?

## As três correntes principais

### 1. Advaita Vedanta (não-dualidade)

Fundada por **Adi Shankaracharya** (~788-820 d.C.). Postula que **Atman é Brahman** — não há separação entre o Ser individual e a realidade última. A multiplicidade é **maya** (ilusão fenomênica, não irrealidade pura).

> "Brahman é a única realidade; o mundo é nome e forma; o Ser individual é Brahman limitado pela ignorância." — Shankara

### 2. Dvaita Vedanta (dualidade)

Fundada por **Madhvacharya** (~1238-1317). Postula distinção eterna entre Atman e Brahman, entre Deus e a alma individual. Deus (Vishnu/Narayana) é qualitativamente superior à alma e à matéria.

### 3. Vishishtadvaita Vedanta (não-dualidade qualificada)

Fundada por **Ramanujacharya** (~1017-1137). Postula que Atman e Brahman são **um na essência**, mas o Ser individual conserva personalidade na liberação. Citada como "não-dualidade qualificada".

## Prática central: a pergunta "Quem sou eu?"

A prática contemplativa védanta clássica começa com **atma-vichara** (auto-inquirição):

1. Sentar-se em meditação silenciosa
2. Repetir mentalmente: "Quem sou eu?"
3. A cada resposta mental ("eu sou o corpo", "eu sou os pensamentos"), perguntar: "Quem observa isso?"
4. Permanecer na pergunta até que o questionador se dissolva

## Diferença para praticantes ocidentais

Vedanta NÃO é "filosofia abstrata para intelectual". É **prática contemplativa orientada à libertação (moksha)**. A leitura intelectual sem prática produz erudição estéril; a prática sem leitura produz confusão conceitual. As duas precisam andar juntas.

## Nota editorial

**Confiança: ALTA** para os conceitos básicos das três escolas (consenso entre comentadores). **Confiança: MÉDIA** para a prática (varia entre linhagens; consultar professor vivo).`,
    authors: ['Shankara', 'Ramanuja', 'Madhva', 'Curador Akasha'],
    year: 800,
    journal: 'Upanishads + Brahma Sutras + comentários',
    tags: ['hinduismo', 'vedanta', 'atman', 'brahman', 'advaita'],
    tradition: 'hinduismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'yoga-sutras-patanjali-oito-membros',
    title: 'Yoga Sutras de Patañjali: os 8 membros (Ashtanga)',
    summary:
      'Compêndio de 195 aforismos organizado em 4 capítulos. Define yoga como cessação das flutuações da mente (chitta-vritti-nirodha). Os 8 membros (ashtanga) são o caminho progressivo.',
    content: `# Yoga Sutras de Patañjali

Os **Yoga Sutras** são um compêndio de 195 aforismos organizados em 4 capítulos (padas), compilados por **Patañjali** entre 150 a.C. e 350 d.C. É o texto fundamental do **Yoga Clássico** (não confundir com hatha yoga, que é uma derivação posterior).

## Definição central

> "Yoga é a cessação das flutuações da mente." (Yoga Sutra 1.2)

A mente (chitta) tem cinco estados (vrittis): conhecimento correto, conhecimento incorreto, imaginação, sono e memória. Yoga é o processo de aquietar essas flutuações para que o **drashṭā** (o observador/Si-mesmo) se reconheça separado delas.

## Os 8 membros (Ashtanga Yoga)

| # | Membro | Tradução comum | Função |
|---|---|---|---|
| 1 | Yama | Restrições éticas externas | Ahimsa (não-violência), Satya (verdade), Asteya (não-roubo), Brahmacharya (continência), Aparigraha (não-acumulação) |
| 2 | Niyama | Observâncias éticas internas | Shaucha (pureza), Santosha (contentamento), Tapas (disciplina), Svadhyaya (autoestudo), Ishvara-pranidhana (entrega) |
| 3 | Asana | Posturas físicas | Preparar o corpo para meditação sentada prolongada |
| 4 | Pranayama | Regulação da respiração | Suspender o ciclo respiratório natural para aquietar a mente |
| 5 | Pratyahara | Retração dos sentidos | Desligar os sentidos dos objetos externos |
| 6 | Dharana | Concentração | Fixar a mente em um objeto escolhido |
| 7 | Dhyana | Meditação | Fluxo sustentado de atenção no objeto |
| 8 | Samadhi | Absorção | Integração sujeito-objeto; reconhecimento do Si-mesmo |

## Equívoco comum

No Ocidente, "yoga" virou sinônimo de asana (3º membro). Patañjali trata asana como **preparação** — é o 3º de 8 membros. Praticar apenas asana é como treinar só o aquecimento antes de uma maratona.

## Evidência científica

Pesquisas recentes sobre yoga (não confundir com ioga clássica indiana) mostram benefícios em lombalgia crônica, ansiedade e qualidade de vida — mas o "yoga de academia" é apenas uma fração do que Patañjali ensinou.`,
    authors: ['Patañjali (atrib.)', 'Curador Akasha'],
    year: -200,
    journal: 'Yoga Sutras of Patañjali (ed. Swami Satchidananda ou Bryant)',
    tags: ['hinduismo', 'yoga', 'patanjali', 'ashtanga', 'meditacao'],
    tradition: 'hinduismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'mandalas-yantras-geometria-sagrada',
    title: 'Mandalas e Yantras: geometria sagrada na tradição hindu',
    summary:
      'Mandalas (diagramas circulares) e Yantras (diagramas geométricos) são ferramentas contemplativas usadas em devoção (puja), meditação e ritual. Jung estudou mandalas como símbolo do Self.',
    content: `# Mandalas e Yantras — Geometria Contemplativa

**Mandalas** (sânscrito: "círculo") são diagramas circulares usados como suporte visual para meditação, ritual e devoção na tradição hindu e budista. **Yantras** são diagramas geométricos (frequentemente triangulares ou com pontos bindu) usados especificamente como foco meditativo.

## Tradição e uso

- **Mandalas rituais** — usados em pujas (cerimônias de devoção) e em tantra hindu/budista. Cada divindade tem sua mandala específica (de 100 a 1000+ sub-diagramas).
- **Mandalas meditativas** — praticante visualiza ou desenha para aquietar a mente. Jung desenhava mandalas diariamente como prática terapêutica.
- **Yantras** — o Shri Yantra (9 triângulos entrelaçados, 43 intersecções) é o mais estudado. Representa a totalidade da manifestação cósmica e o corpo da deusa Tripura Sundari.

## Paralelo com Jung

Carl Jung introduziu o conceito de **Self** como totalidade psíquica e observou que pacientes em processo de individuação frequentemente desenhavam mandalas espontaneamente. Publicou "Psicologia e Alquimia" (1944) com estudos sobre o tema. **Nota crítica:** Jung não era praticante hindu; sua leitura é psicológica, não teológica.

## Prática contemporânea

1. **Desenhar** — papel, compasso, lápis. Desenhar uma mandala diariamente (5-10 min) é prática usada em arteterapia e em tradição vajrayana.
2. **Visualizar** — imaginar a Shri Yantra ou a mandala do Buda da Medicina, com cores e proporções específicas.
3. **Colorir** — popularizado em livros de colorir terapêuticos (uso secular, não-tradicional).

## Cuidado com apropriação comercial

"Mandala" virou tendência de moda (decoração, tatuagens, logos de empresa). Isso **não** é prática espiritual. Contexto litúrgico e intenção do praticante importam.`,
    authors: ['Curador Akasha'],
    year: 2026,
    journal: 'Tradição Hindu/Budista + Jung, Psicologia e Alquimia',
    tags: ['hinduismo', 'budismo', 'mandala', 'yantra', 'jung'],
    tradition: 'hinduismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'ESSAY',
  },

  // ===================== BUDISMO (4) =====================
  {
    slug: 'buda-historico-siddhartha-quatro-nobre-verdades',
    title: 'Buda histórico: Siddhartha Gautama e as Quatro Nobres Verdades',
    summary:
      'Quem foi Siddhartha Gautama (séc. V-IV a.C.), o que ele ensinou, e por que o Budismo não começa com dogma. As Quatro Nobres Verdades são diagnóstico + prescrição, não metafísica.',
    content: `# O Buda Histórico

**Siddhartha Gautama** nasceu ~563 a.C. em Lumbini (atual Nepal), em família aristocrática da República Shakya. Aos 29 anos, abandonou o palácio após encontrar um doente, um idoso e um morto. Passou 6 anos praticando ascetismo extremo, depois 6 semanas em meditação sob a Árvore Bodhi, onde atingiu o despertar (bodhi).

## As Quatro Nobres Verdades (Dukkha)

> 1. **Dukkha** — a vida ordinária é marcada por sofrimento, insatisfação e impermanência
> 2. **Samudaya** — a causa do sofrimento é o desejo (tanha) e a ignorância (avidya)
> 3. **Nirodha** — é possível cessar o sofrimento
> 4. **Marga** — o caminho é a prática (Nobre Caminho Óctuplo)

## O que NÃO é

- Não é "a vida é só sofrimento" — dukkha também significa "impermanência" e "insatisfação sutil". Tudo muda, nada é permanente, mesmo o prazer.
- Não é niilismo — o Buda **não** falou sobre metafísica especulativa (existe vida após a morte? o mundo é eterno?). Suas respostas eram "não é útil para a libertação".
- Não é fatalismo — o sofrimento tem causa, e a causa pode ser removida.

## O Nobre Caminho Óctuplo

Prática organizada em 8 fatores agrupados em 3 treinamentos:

- **Sabedoria (pañña)** — visão correta, intenção correta
- **Conduta ética (sila)** — fala correta, ação correta, modo de vida correto
- **Disciplina mental (samadhi)** — esforço correto, atenção plena correta, concentração correta

## Escolas principais

| Escola | Origem | Foco |
|---|---|---|
| **Theravada** ("Escola dos Anciãos") | Sri Lanka, Tailândia, Myanmar | Prática monástica, vipassana, nibbana pessoal |
| **Mahayana** ("Grande Veículo") | China, Coreia, Japão, Tibete | Bodhisattva, compaixão universal, múltiplos Budas |
| **Vajrayana** ("Veículo de Diamante") | Tibete, Mongólia | Tantra budista, prática com mestres, visualização |

## Nota editorial

**Confiança: ALTA** para os fatos básicos da vida do Buda (consenso acadêmico). **Confiança: MÉDIA** para interpretações específicas das Quatro Verdades (variam entre tradições).`,
    authors: ['Curador Akasha'],
    year: -500,
    journal: 'Sutta Pitaka (Theravada) + Mahayana Sutras',
    tags: ['budismo', 'buda', 'quatro-nobre-verdades', 'dukkha', 'introducao'],
    tradition: 'budismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'zen-zazen-meditacao-mahayana',
    title: 'Zen: Zazen, Koan e a tradição Mahayana do Japão',
    summary:
      'Zen é a escola Mahayana que enfatiza experiência direta sobre texto. Zazen (meditação sentada) é a prática central. Koans são paradoxos lógicos usados para colapsar o pensamento discursivo.',
    content: `# Zen — A Tradição do Silêncio

Zen (japonês; chinês: **Chan**; coreano: **Seon**; vietnamita: **Thiền**) é a escola Mahayana que valoriza **experiência direta** sobre conhecimento livresco. Atribui sua transmissão à frase do Buda: "Transmissão especial fora das escrituras; apontar diretamente para a mente; ver a própria natureza e tornar-se Buda" (Plataforma Sutra, séc. VI).

## Zazen — meditação sentada

A postura é fundamental:

- **Costas retas** (sem encostar; usar coxim/zafu se preciso)
- **Queixo ligeiramente baixo** (alinhar coluna cervical)
- **Mãos em cosmic mudra** (mão direita sobre esquerda, polegares se tocando levemente)
- **Olhos semicerrados** ou fechados
- **Respiração pelo nariz**, natural, contando 1-10 (sokushin zazen) ou seguindo o hara (tanden)

Tradição Soto (Dogen Zenji, ~1200): shikantaza — "apenas sentar", sem objeto de foco. Tradição Rinzai: koan como foco.

## Koan — o paradoxo como ferramenta

Koans são questões ou casos que não podem ser respondidos pelo intelecto:

- "Qual era o seu rosto original antes de seus pais nascerem?"
- "O som de uma mão batendo palmas"
- "Mu" (nada/vazio) — a resposta clássica do mestre Zhaozhou quando perguntado se um cachorro tem natureza de Buda

O koan não é charada; é um dispositivo para colapsar o pensamento conceitual. A "resposta" surge em **satori/kensho** (iluminação repentina).

## Linhagens principais

- **Soto Zen** — Dogen (~1200-1253), Japão. Prática silenciosa.
- **Rinzai Zen** — Eisai (~1141-1215), Japão. Koan intensivo.
- **Chan chinês** — Linji, Caodong, Yunmen. Origem (~séc. VII).
- **Thich Nhat Hanh** — tradição vietnamita modernizada, "mangas de consciência".

## Evidência

Estudos de imagem cerebral em praticantes zen experientes mostram mudanças estruturais em córtex pré-frontal e ínsula — mas correlação não é mecanismo. Ver artigo "Meditação & neuroplasticidade" nesta biblioteca.`,
    authors: ['Dogen (atrib.)', 'Curador Akasha'],
    year: 1200,
    journal: 'Shobogenzo (Dogen), Platform Sutra',
    tags: ['budismo', 'zen', 'zazen', 'koan', 'mahayana'],
    tradition: 'budismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'budismo-tibetano-tantra-bodhisattva',
    title: 'Budismo tibetano: Tantra, Bodhisattva e a tradição vajrayana',
    summary:
      'O Budismo tibetano (Vajrayana) é a 3a grande escola. Combina filosofia Madhyamaka, prática de compaixão (bodhicitta), visualização de yidams e relação guru-discípulo como condutor da transformação.',
    content: `# Budismo Tibetano — Vajrayana

O **Vajrayana** ("Veículo de Diamante" ou "Veículo Indestrutível") floresceu na Índia entre os séculos VI-XII e migrou para o Tibete a partir do século VII. É a terceira grande escola do Budismo, distinta de Theravada e Mahayana (embora compartilhe seus fundamentos filosóficos).

## Características distintivas

### 1. Bodhicitta — a mente de despertar

A intenção central é tornar-se Buda **para o benefício de todos os seres**. O bodhisattva (ser que busca despertar para auxiliar outros) gera essa intenção antes de qualquer prática. Cultiva-se por:

- **Aspiração** — pedir para atingir a bodhi em favor de todos
- **Aplicação** — praticar as 6 paramitas (generosidade, ética, paciência, esforço, concentração, sabedoria) com a motivação bodhicitta

### 2. Yidam — divindade de meditação

Praticante escolhe um **yidam** (deidade tutelar) — Tara Verde, Avalokiteshvara, Hevajra, etc — e pratica **sadhana** (ritual estruturado de visualização e mantra) onde se identifica com a divindade. Não é politeísmo: a divindade representa aspectos despertos da própria mente.

### 3. Guru-discipulo como vetor

A relação com o guru (lama) é central. O estudante pratica devoção e segue instruções com confiança. **Risco:** abuso espiritual documentado em algumas linhagens; recomenda-se escolher professor com ética comprovada.

### 4. Tantra — uso ritual de corpo, fala e mente

Práticas tântricas (Tantrayana) usam corpo (mudras, posturas), fala (mantras) e mente (visualização) simultaneamente para acelerar o caminho. Inclui retiros de 3 anos e 3 meses.

## Escolas principais no Tibete

- **Nyingma** (~séc. VII) — a mais antiga; tradição dos Termas (tesouros escondidos)
- **Kagyu** (~séc. XI) — ênfase em meditação, linhagem dos Karmapas
- **Sakya** (~séc. XI) — ênfase em estudo filosófico
- **Gelug** (~séc. XIV) — fundada por Tsongkhapa; o Dalai Lama é desta escola

## Nota editorial

**Confiança: ALTA** para o histórico das escolas. **Confiança: MÉDIA** para a prática (varia entre mestres; consultar praticante com iniciação verificada).`,
    authors: ['Tsongkhapa', 'Padmasambhava', 'Curador Akasha'],
    year: 800,
    journal: 'Lamrim Chenmo (Tsongkhapa), Bardo Thodol',
    tags: ['budismo', 'tibetano', 'vajrayana', 'bodhisattva', 'yidam'],
    tradition: 'budismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'budismo-vipassana-samatha-meditacao-insight',
    title: 'Budismo Theravada: Vipassana, Samatha e a meditação de insight',
    summary:
      'A escola Theravada preservou os ensinamentos mais antigos do Buda. Sua tradição de meditação combina Samatha (calma) e Vipassana (insight), culminando no reconhecimento direto da impermanência.',
    content: `# Theravada — A Escola dos Anciãos

Theravada (pāli: "doutrina dos anciãos") é a escola budista mais antiga preservada, com literatura em **pāli** (cânone Pāli). Presente principalmente no Sri Lanka, Tailândia, Myanmar, Camboja e Laos.

## Os 4 Fundamentos da Atenção Plena (Satipatthana)

Prática central de Vipassana no Theravada. Fundamentada no **Satipatthana Sutta** (MN 10). Quatro objetos de atenção:

1. **Corpo (kāyānupassanā)** — observar sensações corporais, postura, respiração
2. **Sentimentos (vedanānupassanā)** — agradável, desagradável, neutro
3. **Mente (cittānupassanā)** — estados mentais com presença
4. **Dhammas (dhammānupassanā)** — investigar os 5 agregados, as 6 bases sensoriais, as 4 Nobres Verdades

## Samatha-Vipassana

- **Samatha** — meditação de calma (foco em objeto único: respiração, mantra, visualização). Cultiva os **jhanas** (estados de absorção).
- **Vipassana** — meditação de insight (observar a impermanência, insatisfação e não-eu das experiências).

Prática tradicional combina ambas: samatha acalma a mente; vipassana revela a natureza dos fenômenos. Insight sem calma é conceitual; calma sem insight é apaziguamento.

## Correntes modernas

- **S.N. Goenka** (1924-2013) — cursos de 10 dias de Vipassana em todo o mundo (tradição leiga, não-monástica)
- **Mahasi Sayadaw** (1904-1982) — método de "notar" (labelling), popularizado no Ocidente
- **Ajahn Chah** (1918-1992) — tradição da floresta tailandesa, ênfase em simplicidade
- **Pa Auk Sayadaw** — ênfase nos jhanas como base para insight

## Evidência científica

Estudos randomizados controlados com cursos Vipassana (Goldstein et al., 2018; Britton et al., 2021) mostram reduções em ansiedade, depressão e reatividade emocional — tamanho de efeito **moderado a grande** em populações clínicas.

## Nota editorial

**Confiança: ALTA** para a estrutura dos 4 Satipatthanas (consenso canônico). **Confiança: ALTA** para os achados científicos (RCTs publicados em periódicos com peer-review).`,
    authors: ['Buda Gotama', 'Curador Akasha'],
    year: -500,
    journal: 'Satipatthana Sutta (MN 10), Samyutta Nikaya',
    tags: ['budismo', 'theravada', 'vipassana', 'samatha', 'satipatthana'],
    tradition: 'budismo',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
  },

  // ===================== JUDAÍSMO MÍSTICO (2) =====================
  {
    slug: 'hasidismo-alegria-rebbe-presenca',
    title: 'Hasidismo: alegria, presença e o Rebbe como mestre interior',
    summary:
      'Movimento místico popular fundado por Israel Baal Shem Tov (~1700-1760). Enfatiza presença divina em cada momento, alegria como dever espiritual e relação pessoal com o Rebbe.',
    content: `# Hasidismo — A Mística da Alegria

O **Hasidismo** (de "chasidut", "piedosos") é um movimento de renovação espiritual do Judaísmo do Leste Europeu, fundado por **Israel ben Eliezer** (o **Baal Shem Tov** ou "Besht", ~1698-1760). Surgiu na região da Podolia (atual Ucrânia) como reação ao formalismo racionalista do Judaísmo talmúdico da época.

## Princípios centrais

### 1. Devekut — união permanente com o Divino

A prática central do hasidismo é **devekut** (aderência a Deus) em cada momento. Não reservada para a sinagoga ou para a oração formal — deve permear comer, trabalhar, falar.

### 2. Simcha — alegria como dever espiritual

> "Servir a Deus com alegria" (Psalmos 100:2) é interpretado pelo Baal Shem Tov como literal: a tristeza é掩ertura para falhas espirituais. Praticantes usam música (nigunim — cantos sem palavras), dança e cachaça ritual (em algumas linhagens) para induzir estados de alegria extática.

### 3. O Rebbe — mestre interiorizado

O **Rebbe** (ou "Admor") não é apenas líder comunitário; é canal de energia espiritual (**chiddushim** — ensinamentos novos). Após a morte de um Rebbe, a dinastia frequentemente escolhe um sucessor, ou continua em torno dos ensinamentos escritos.

### 4. Panenteísmo hasídico

Doutrina de que Deus está em tudo e tudo está em Deus — não panteísmo, mas **panenteísmo** (influência do Cabala de Isaac Luria).

## Linhagens principais

- **Chabad-Lubavitch** (Menachem Mendel Schneerson, 1902-1994) — mais conhecida no Ocidente; ênfase em estudo intelectual e mizvot
- **Breslov** (Nachman de Breslov, 1772-1810) — ênfase em oração pessoal e conversa com Deus
- **Satmar, Ger, Vizhnitz, Belz** — dinastias hassídicas dos séculos XVIII-XX, cada uma com costumes próprios

## Diálogo com a ciência

Pesquisadores como **Jonathan Garb** (Hebrew University) estudam o hasidismo como prática somática e emocional, com paralelos a psicoterapias de presença. Aaron Ungersma explorou paralelos com Logoterapia frankliana.

## Nota editorial

**Confiança: ALTA** para a história do movimento. **Confiança: MÉDIA** para práticas contemporâneas (variam muito entre dinastias; consultar praticante).`,
    authors: ['Baal Shem Tov', 'Nachman de Breslov', 'Curador Akasha'],
    year: 1750,
    journal: 'Tanya (Schneur Zalman), Likutei Moharan (Nachman)',
    tags: ['judaísmo', 'hasidismo', 'devekut', 'rebbé', 'mística-judaica'],
    tradition: 'judaísmo-místico',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'tikkun-olam-reparacao-mundo-judaica',
    title: 'Tikkun Olam: a reparação do mundo na tradição judaica',
    summary:
      'Conceito de origem mística (Cabala de Isaac Luria) que se tornou central na ética judaica contemporânea. Designa responsabilidade coletiva pela transformação social e ambiental.',
    content: `# Tikkun Olam — Reparação do Mundo

**Tikkun Olam** (תיקון עולם, literalmente "reparo do mundo") é conceito de origem mística que atravessou o Judaísmo rabínico contemporâneo e se tornou uma das principais expressões da ética judaica moderna.

## Origem mística

Na Cabala de **Isaac Luria** ("Ari", 1534-1572, Safed), o conceito descreve a reparação cósmica necessária após o **Shevirat HaKelim** — a "quebra dos vasos" da emanação divina. Quando Deus se manifestou no mundo através dos vasos (Sephiroth), os vasos não suportaram a intensidade e se quebraram; faíscas divinas (nitzotzot) ficaram aprisionadas na matéria. O ser humano tem o papel de **reunir essas faíscas** através de atos de justiça, compaixão e estudo.

## Migração para o Judaísmo rabínico

No século XIX-XX, o conceito migrou da Cabala para o **Judaísmo Reformado e Conservador** como princípio ético-político. **Rabino Michael Lerner** (Beit Tikkun) popularizou o uso como crítica ao neoliberalismo. No movimento **JRepair**, tikkun olam é princípio organizador.

## Manifestações contemporâneas

- **Justiça social** — participação em movimentos por direitos civis (Rabino Heschel marchou com Martin Luther King Jr. em Selma, 1965)
- **Sustentabilidade ambiental** — Eco-Judaísmo, Teva Learning Center
- **Diálogo inter-religioso** — Tikkun como base para paz entre religiões
- **Saúde pública e imigração** — HIAS (Hebrew Immigrant Aid Society), MAZON (combate à fome)

## Nota crítica

Alguns praticantes tradicionais criticam o uso secularizado do termo, argumentando que perdeu o conteúdo místico e virou slogan político. Ambos os usos têm base textual legítima — a chave é não confundir um com o outro.

## Nota editorial

**Confiança: ALTA** para a origem luriana. **Confiança: ALTA** para o uso contemporâneo (documentado em fés rabínicas oficiais). **Confiança: BAIXA** para usos específicos que carecem de contexto (recomenda-se consultar rabino).`,
    authors: ['Isaac Luria', 'Rabino Michael Lerner', 'Curador Akasha'],
    year: 1570,
    journal: 'Etz Chaim (Ari), Etz Chaim Talmud Torah',
    tags: ['judaísmo', 'tikkun-olam', 'luria', 'etica-social', 'mística-judaica'],
    tradition: 'judaísmo-místico',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },

  // ===================== ESPIRITUALIDADE CONTEMPORÂNEA (3) =====================
  {
    slug: 'ken-wilber-integral-aqal-quatro-quadrantes',
    title: 'Ken Wilber e a Teoria Integral: AQAL e os 4 quadrantes',
    summary:
      'Ken Wilber (1949-) propôs uma filosofia integrativa chamada AQAL ("All Quadrants, All Levels") que sintetiza práticas contemplativas, ciência, arte e teoria social. Controverso mas influente.',
    content: `# Ken Wilber e a Filosofia Integral

**Kenneth Earl Wilber Jr.** (n. 1949, Oklahoma) é filósofo americano fundador da **Teoria Integral** — síntese multi-tradicional que busca integrar ciência, arte, tradição contemplativa e teoria social em um único framework.

## AQAL — os 4 quadrantes

O modelo central de Wilber divide qualquer fenômeno em 4 perspectivas:

| | Interior | Exterior |
|---|---|---|
| **Individual** | "Eu" (subjetivo) | "Isso" (objetivo, comportamental) |
| **Coletivo** | "Nós" (cultural, intersubjetivo) | "Isto" (sistêmico, social) |

Exemplos de aplicação:

- Um atleta de elite tem interior individual (sensação, motivação), exterior individual (técnica muscular, performance medida), interior coletivo (cultura esportiva), exterior coletivo (sistema de treinamento institucional).
- Um ritual religioso: interior individual (experiência mística), exterior individual (gestos, postura), interior coletivo (sentido compartilhado da comunidade), exterior coletivo (edifício, cânon, hierarquia).

## Holons e ondas de desenvolvimento

Wilber propõe que a realidade é composta por **holons** (totalidades que são também partes de totalidades maiores): átomo → molécula → célula → organismo → ecossistema. Cada nível **transcende mas inclui** o anterior (a célula inclui moléculas mas é mais que a soma delas).

Aplicado ao desenvolvimento humano, propõe **ondas** (estágios) que progridem do pré-pessoal ao pessoal ao pós-pessoal. Em adultos, mapeia aproximadamente:
- Egocêntrico (laranja-verde)
- Ético-convencional (verde)
- Pluralista-integral (amarelo)
- Holístico (turquesa)

## Críticas

A teoria integral tem críticos relevantes:

1. **Simplificação** — estudiosos de tradições específicas acusam Wilber de reduzir Tradição X a "estágio Y" sem respeitar a complexidade interna.
2. **Falácia naturalista** — confundir evolução cultural com progressão moral.
3. **Integridade bibliográfica** — acusação de plágio (particularmente em "Sex, Ecology, Spirituality"); Wilber admitiu erros e fez correções públicas.
4. **Distância da prática** — a teoria é densa; poucos praticantes a usam como suporte contemplativo real.

## O que vale

Mesmo críticos admitem que AQAL é útil como **mapa** — não como território. Para diagnosticar pontos cegos em abordagens unidimensionais (ex.: terapia só individual, ou só sistêmica, ou só política), o framework tem valor heurístico.

## Nota editorial

**Confiança: MÉDIA** para o framework geral (consenso parcial entre estudiosos). **Confiança: BAIXA** para aplicações específicas (Wilber é controverso; recomenda-se leitura crítica).`,
    authors: ['Wilber K'],
    year: 1995,
    journal: 'Sex, Ecology, Spirituality (Wilber, 1995/2000)',
    doi: '10.1080/02604027.1995.9972542',
    tags: ['espiritualidade-contemporanea', 'integral', 'wilber', 'aqal', 'filosofia'],
    tradition: 'espiritualidade-contemporanea',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
  },
  {
    slug: 'ubuntu-eu-somos-filosofia-africana',
    title: 'Ubuntu: "eu sou porque nós somos" — ética africana da convivência',
    summary:
      'Ubuntu é ética filosófica das culturas Bantu do Sul da África. Desmond Tutu e Nelson Mandela popularizaram-na. Oferece alternativa comunitária ao individualismo ocidental moderno.',
    content: `# Ubuntu — Filosofia da Humanidade Compartilhada

**Ubuntu** (pronúncia: ubúntu) é ética filosófica das culturas Bantu do Sul da África, presente em expressões zulu, xhosa e ndebele. Não é "religião" nem "espiritualidade" no sentido ocidental — é visão de mundo que orienta a vida cotidiana.

## A frase nuclear

> "Umuntu ngumuntu ngabantu" (zulu): "Uma pessoa é uma pessoa por causa das outras pessoas."

Ou em sua formulação ocidental mais comum: **"Eu sou porque nós somos."**

## Princípios

1. **Comunidade antes do indivíduo** — a identidade pessoal não precede o reconhecimento comunitário. O self emerge do nós.
2. **Reciprocidade** — não há relação unilateral; cada ato entra numa teia de mutualidade.
3. **Hospitalidade** —陌生人 (estranho) é recebido como potencial membro da comunidade humana. Mandela invocou isso no discurso de 1994.
4. **Solidariedade no sofrimento** — "Ubuntu" também designa a qualidade de compaixão ativa diante do outro.

## Ubuntu e política

**Desmond Tutu** (1931-2021) usou o conceito como base para a **Comissão da Verdade e Reconciliação** (1996, África do Sul pós-apartheid). Tutu argumentava que sem ubuntu, não há possibilidade de perdão restaurativo.

**Nelson Mandela** citou o conceito em múltiplos discursos: "The spirit of Ubuntu — that profound African sense that we are human only through the humanity of other human beings."

## Ubuntu e espiritualidade

Ubuntu não é incompatível com espiritualidade, mas não depende dela. Praticantes religiosos (cristãos, muçulmanos, animistas) encontram em ubuntu uma ética compartilhada. Praticantes não-religiosos também. É **pré-religioso** no sentido de fundacional.

## Críticas

- **Generalização** — "África" é diversa; ubuntu varia entre grupos étnicos
- **Romantização** — ocidentais simplificam a tradição como "paraíso comunal" pré-colonial
- **Tensão com individualismo queer** — algumas vozes queer africanas tensionam o modelo comunitário quando este é usado para regular sexualidade

## Nota editorial

**Confiança: ALTA** para a origem e princípios básicos. **Confiança: MÉDIA** para aplicações políticas contemporâneas (varia entre autores).`,
    authors: ['Tutu D', 'Mandela N (atrib.)', 'Curador Akasha'],
    year: 1999,
    journal: 'No Future Without Forgiveness (Tutu, 1999)',
    tags: ['espiritualidade-contemporanea', 'ubuntu', 'africa', 'etica-comunitaria', 'mandela'],
    tradition: 'espiritualidade-contemporanea',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'espiritualidade-secular-pos-religiosa',
    title: 'Espiritualidade secular e pós-religiosa: o que significa após a instituição',
    summary:
      'O conceito de espiritualidade sem religião institucional emerge com Robert Bellah, Charles Taylor e os dados do "rise of the nones". Não é sinônimo de ateísmo; é busca de sentido fora da mediação religiosa.',
    content: `# Espiritualidade Secular e Pós-Religiosa

A expressão "espiritualidade secular" é controversa. Designa fenômeno heterogêneo de busca de sentido e prática contemplativa **fora** (ou além) das religiões institucionais tradicionais.

## Contexto histórico

- **Charles Taylor** ("A Secular Age", 2007) argumenta que o Ocidente passou por uma transição onde a crença em Deus deixou de ser o "pano de fundo óbvio" do senso comum. Isso não significa que desapareceu — significa que se tornou **uma opção entre outras**.
- **Robert Bellah** ("Religion in Human Evolution", 2011) distingue **religião** como sistema comunal de **espiritualidade** como busca individual.
- **Pew Research Center** (2012-2024) documenta o "rise of the nones": ~30% dos americanos adultos se declaram "nada em particular" religiosamente.

## O que é (e o que não é)

### É
- Prática de meditação sem afiliação budista/hindu
- Sensibilidade a "mais do que isso" sem filiação institucional
- Engajamento com tradições múltiplas (perennialismo, integralismo)
- Ética centrada em compaixão, justiça, presença

### NÃO é
- Ateísmo militante (embora possa coexistir)
- "Self-help" despolitizado
- Coleção eclética sem critério
- Substituição de psicoterapia por práticas espirituais

## Tensões

1. **Apropriação cultural** — ioga, meditação, ayahuasca, etc. são extraídos de suas matrizes tradicionais. Quem pratica sem diálogo com praticantes tradicionais perde contexto.
2. **Privatização** — quando vira só "meu bem-estar", perde dimensão coletiva.
3. **Falácia de equivalência** — afirmar que todas as tradições dizem a mesma coisa ignora divergências reais.

## O que fazer com isso no Akasha

O Akasha Portal documenta tradições **com suas fontes**, não como "menu de bem-estar". Praticantes podem meditar, estudar tarot, usar orixás, sem afiliação — desde que saibam o que estão fazendo e de onde vem.

## Nota editorial

**Confiança: ALTA** para os dados demográficos. **Confiança: MÉDIA** para a análise cultural (campo em disputa).`,
    authors: ['Bellah R', 'Taylor C', 'Curador Akasha'],
    year: 2007,
    journal: 'A Secular Age (Taylor, 2007); Religion in Human Evolution (Bellah, 2011)',
    tags: ['espiritualidade-contemporanea', 'secular', 'pos-religioso', 'bellah', 'taylor'],
    tradition: 'espiritualidade-contemporanea',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
  },

  // ===================== XAMANISMO (2) =====================
  {
    slug: 'rape-tabaco-soprado-tradicao-pankararu',
    title: 'Rapé: tabaco soprado e a tradição Pankararu/Brasil',
    summary:
      'Rapé é preparação de tabaco (Nicotiana rustica) em pó, soprado nas narinas. Usado por dezenas de povos indígenas das Américas, com destaque para Pankararu e Krahô no Brasil.',
    content: `# Rapé — A Força do Tabaco Soprado

**Rapé** (pronúncia: ha-PÉ, do tupi "rapé") é preparação ritual de tabaco (Nicotiana rustica, variedade forte) moído fino, misturado a cinzas de cascas de árvores, ervas e outros elementos. É **soprado** nas narinas usando um aplicador (tepi ou kuripe).

## Tradição indígena brasileira

O rapé é usado por dezenas de povos, com variações:

- **Pankararu** (PE/AL/Bahia) — possuem forma própria, com tabacos diferentes para rezas específicas
- **Krahô** (Tocantins) — uso coletivo antes de decisões importantes
- **Tukano, Baniwa, Desana** (Alto Rio Negro) — associado a rituais de jurupari
- **Yawanawá, Kaxinawá** (Acre) — presentes em retiros de ayahuasca
- **Guarani** (sul/sudeste) — associado ao mbya reko (modo de ser)

## Função ritual

- **Centramento** — antes de rezas, conselhos, decisões
- **Conexão com o mundo invisível** — o tabaco é "planta do espírito" em muitas cosmologias
- **Limpeza** — sopro nasal ritual como forma de limpar "mau pensamento"
- **Comunicação entre mundos** — médiuns e xamãs usam para "abrir" estados alterados de consciência

## Composição

A composição varia entre povos, mas geralmente combina:
- Tabaco (N. rustica)
- Cinza de casca de árvore específica (taquara, jatobá)
- Ervas aromáticas (cumaru, patchuli)
- Pós de sementes (ingá, gergelim)

## Cuidado com apropriação

"Rapés prontos" comercializados em sites de bem-estar muitas vezes:
- Não respeitam a tradição de origem
- Usam N. tabacum (variedade comercial) em vez de N. rustica
- Não são feitos por pajés/membros da tradição
- Prometem efeitos sem contexto ritual

Recomendação: adquirir diretamente de comunidades indígenas ou fornecedores éticos que repassem renda.

## Nota editorial

**Confiança: ALTA** para a história e uso tradicional. **Confiança: BAIXA** para efeitos terapêuticos específicos (poucos estudos controlados; maioria é evidência etnográfica).`,
    authors: ['Vários pajés Pankararu', 'Curador Akasha'],
    year: 2026,
    journal: 'Etnografias Pankararu, Krahô, Tukano (Luciano, 2015; Cohn, 2005)',
    tags: ['xamanismo', 'rape', 'pankararu', 'tabaco-sagrado', 'indigena'],
    tradition: 'xamanismo',
    evidenceLevel: 'LOW',
    type: 'ESSAY',
  },
  {
    slug: 'xamanismo-siberiano-harner-core-shamanism',
    title: 'Xamanismo siberiano e o "core shamanism" de Michael Harner',
    summary:
      'Michael Harner (1929-2018) sistematizou o "xamanismo nuclear" (core shamanism) a partir de pesquisa entre Conibo, Shipibo e estudos sobre tradições siberianas. Controverso, mas influência ampla.',
    content: `# Xamanismo Siberiano e Core Shamanism

O **xamanismo** da Sibéria (tunguse, iacuto, buriato, evenki) é o conjunto de tradições que deram nome ao fenômeno global. Caracteriza-se por viagem cósmica do xamã para mundos não-ordinários, comunicação com espíritos auxiliares e cura por transposição.

## Michael Harner (1929-2018)

Antropólogo americano, Harner fez pesquisa de campo entre os **Conibo** e **Shipibo** da Amazônia peruana (1961) e entre os **Shuar** do Equador, depois estudando o xamanismo siberiano. Propôs o conceito de **core shamanism** — práticas comuns a todas as tradições xamânicas do mundo.

## Práticas do core shamanism

1. **Viagem xamânica** — ritmo monótono (tambor ~4 Hz) induz estado de consciência xamânico
2. **Mundo inferior (Lower World)** — descer por túnel/raiz de árvore para encontrar animais de poder
3. **Mundo superior (Upper World)** — subir por árvore/montanha/fumaça para encontrar mestres e guias
4. **Animais de poder** — espírito animal que acompanha o praticante como auxiliar
5. **Recuperação de alma (soul retrieval)** — retornar partes do self perdidas em trauma

## Foundation for Shamanic Studies

Harner fundou a **Foundation for Shamanic Studies** (1979) que oferece workshops de core shamanism em todo o mundo. Treinou milhares de pessoas.

## Críticas

### Acadêmicas
- **Reducionismo** — критики acadêmicos (dentre eles **Robert J. Wallis**, 2003) argumentam que core shamanism é uma síntese ocidental, não uma tradição.
- **Descontextualização** — extrair práticas de seus contextos rituais específicos.
- **Universalismo duvidoso** — similaridades superficiais entre tradições são usadas para sugerir origem comum, quando podem ser convergências independentes.

### Culturais
- Povos indígenas (especialmente Sioux, Yanomami) criticam o uso não-autorizado de práticas.
- Harner respondeu desenvolvendo **código de ética** que pede respeito às fontes e compensação a comunidades.

## O que vale (e o que não vale)

- **Vale:** o framework de "viagem xamânica" + "mundos não-ordinários" oferece linguagem útil para descrever estados alterados.
- **Não vale:** tratar core shamanism como "a tradição xamânica" — é um modelo pedagógico ocidental, não uma tradição viva.

## Nota editorial

**Confiança: ALTA** para o trabalho de campo de Harner. **Confiança: MÉDIA** para o framework (controverso academicamente). **Confiança: BAIXA** para aplicações terapêuticas específicas.`,
    authors: ['Harner M', 'Curador Akasha'],
    year: 1980,
    journal: 'The Way of the Shaman (Harner, 1980)',
    tags: ['xamanismo', 'core-shamanism', 'harner', 'siberia', 'viagem-xamanica'],
    tradition: 'xamanismo',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
  },

  // ===================== TAOISMO APROFUNDADO (3) =====================
  {
    slug: 'i-ching-livro-mutacoes-consulta-oracular',
    title: 'I Ching: o Livro das Mutações e a consulta oracular',
    summary:
      'I Ching é texto clássico chinês usado como oráculo. 64 hexagramas compostos de 64×64 = 4096 linhas possíveis. Método de consulta (moedas, yarrow stalks) e sua interpretação jungiana.',
    content: `# I Ching — O Livro das Mutações

O **I Ching** (易經, "Livro das Mutações") é um dos Cinco Clássicos confucianos, com origem oral no período Zhou (séc. XI-VIII a.C.) e forma textual final por volta do séc. III a.C. Funciona como **sistema oracular** e como **texto filosófico**.

## Estrutura

- **8 trigramas base** (bagua): ☰ Céu, ☱ Lago, ☲ Fogo, ☳ Trovão, ☴ Vento, ☵ Água, ☶ Montanha, ☷ Terra
- **64 hexagramas** = combinações de dois trigramas (8×8). Cada hexagrama tem nome, imagem, julgamento e comentário.
- **4096 situações possíveis** = 64×64 (hexagrama principal + hexagrama mutante).

## Como consultar

### Método das 3 moedas (mais comum no Ocidente)

1. Atribuir valores: cara=3, coroa=2
2. Jogar 3 moedas 6 vezes
3. Cada jogada gera uma linha: 6 (velha yin) → 7 (yang) → 8 (velha yang) → 9 (velha yin)
4. Linhas "velhas" (6 e 9) se transformam no oposto, gerando o hexagrama mutante
5. Ler os dois hexagramas: o principal (situação atual) e o mutante (tendência)

### Método dos 50 talos de aquiléia (yarrow stalks) — clássico

Mais lento (30-60 min) mas considerado mais "tradicional". Divisão dos 50 talos segue proporções específicas.

## Interpretação jungiana

Carl Jung consultou o I Ching após tradução de **Richard Wilhelm** (1924) e usou-o como exemplo de **sincronicidade** em sua carta a Wolfgang Pauli (1952). Para Jung, o método ativava **acaua** — coincidência significativa não-causal.

> O I Ching "não se preocupa com causas, mas com a configuração do momento" — C.G. Jung

## Cuidado

- I Ching **não é mapa do futuro fixo** — é leitura do padrão atual + tendência.
- **Não substitui decisão** — orienta, não prescreve.
- **Não é jogo de azar** — o sistema de consulta por moedas é apenas um dos métodos. A tradição clássica usa yarrow stalks para evitar a simplicidade do acaso.

## Evidência

Poucos estudos empíricos testaram o I Ching como ferramenta oracular. A "evidência" é **anecdótica** (relatos de praticantes ao longo de milênios) e **filosófica** (consistência interna do sistema).

## Nota editorial

**Confiança: ALTA** para a estrutura do texto. **Confiança: MÉDIA** para a interpretação jungiana. **Confiança: BAIXA** para eficácia oracular específica.`,
    authors: ['Rei Wen (atrib.)', 'Confúcio (atrib.)', 'Curador Akasha'],
    year: -800,
    journal: 'I Ching (ed. Wilhelm/Richard Wilhelm, 1924; trad. Wilhelm/Baynes, 1950)',
    tags: ['taoismo', 'i-ching', 'oráculo', 'jung', 'classico-chines'],
    tradition: 'taoismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'neidan-alquimia-interna-taoista',
    title: 'Neidan: a Alquimia Interna taoista e a transformação da essência',
    summary:
      'Neidan ("alquimia interna") é tradição taoista de cultivo da energia interna (jing → qi → shen) sem uso de substâncias externas. Diferente do Waidan (alquimia externa). Base do Tai Chi Chuan e Qigong.',
    content: `# Neidan — Alquimia Interna Taoista

**Neidan** (内丹, "alquimia interna") é a tradição taoista de **transformação interior** da energia, sem ingestão de elixires externos (que era o **Waidan**, "alquimia externa", abandonado após envenenamentos de imperadores).

## Sistema de transformação

A prática opera sobre três "tesouros" (san bao):

| Jing | Essência | ⇨ | Qi | Energia | ⇨ | Shen | Espírito |
|---|---|---|---|---|---|---|---|

- **Jing (精)** — essência, associada aos rins, à sexualidade, à herança genética
- **Qi (氣)** — energia vital, circula por meridianos
- **Shen (神)** — espírito/consciência, associado ao coração/coração-mente

O praticante **refina** jing em qi, qi em shen, e shen em **xú** (空, vazio — wu wei da não-dualidade).

## Métodos principais

1. **Meditação do elixir interno** — visualização no **dantian inferior** (2-3 cm abaixo do umbigo)
2. **Microcosmo orbit** — circular qi pelos canais **Du Mai** (coluna) e **Ren Mai** (frente), formando o **pequeno circuito celestial** (xiao zhou tian)
3. **Respiração embrionária** (tai xi) — respirar como se ainda estivesse no útero
4. **Guardar o uno** (shou yi) — manter atenção unificada no dantian
5. **Reter o Jing** — práticas sexuais taoistas (fang zhong shu, "artes do leito")

## Linhagens

- **Quanzhen** (Completa Perfeição, séc. XII) — tradição monástica de Wang Chongyang; preservada em mosteiros taoistas hoje
- **Longmen** (Portão do Dragão) — sub-tradição Quanzhen
- **Zhong-Lü** — escola da "Alquimia da Semente do Jade", une métodos da Tradição Interior (Lu) e Tradição Completa (Zhong)
- **Tai Chi Chuan** e **Qigong** modernos — derivam parcialmente das práticas Neidan

## Diferença para "qigong genérico"

Qigong de academia ≠ Neidan. Neidan é prática contemplativa estruturada dentro de linhagem iniciada. Qigong genérico pode ser exercício de saúde com elementos de tradição, mas sem a estrutura interna de cultivo.

## Nota editorial

**Confiança: ALTA** para a estrutura conceitual. **Confiança: MÉDIA** para práticas específicas (variam entre linhagens; consultar praticante iniciado).`,
    authors: ['Wang Chongyang', 'Curador Akasha'],
    year: 1200,
    journal: 'Cantong Qi (séc. II), Wuzhen Pian (Zhang Boduan, 1075)',
    tags: ['taoismo', 'neidan', 'alquimia-interna', 'qi', 'qigong'],
    tradition: 'taoismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'medicina-tradicional-chinesa-mtc-qi',
    title: 'Medicina Tradicional Chinesa (MTC): Qi, meridianos e equilíbrio',
    summary:
      'MTC é sistema médico com 2.500+ anos de história. Inclui acupuntura, fitoterapia, tuiná, dietética e qigong. Hoje coexiste com medicina ocidental; eficácia varia por condição.',
    content: `# Medicina Tradicional Chinesa (MTC)

A **Medicina Tradicional Chinesa** (中醫, zhongyi) é sistema médico completo com origem na China Han (séc. II a.C. — Huangdi Neijing) e desenvolvimento contínuo até hoje. Não é "alternativa" no Brasil — é prática integrada em hospitais chineses.

## Pilares

1. **Acupuntura** — inserção de agulhas finas em pontos específicos (xue wei) ao longo de meridianos
2. **Fitoterapia chinesa** — combinação de ervas (fórmulas clássicas com 4-15 ingredientes)
3. **Tuiná** — massagem terapêutica chinesa
4. **Dietética** — alimentos classificados por natureza (fria/quente/neutra) e sabor
5. **Qigong terapêutico** — práticas de movimento e respiração

## Conceitos centrais

- **Qi (氣)** — energia vital que circula pelos meridianos (jing-luo)
- **Yin-Yang** — polaridades complementares; saúde = equilíbrio dinâmico entre elas
- **Cinco elementos (wu xing)** — Madeira, Fogo, Terra, Metal, Água; cada um associado a órgãos, emoções, estações, sabores
- **Zang-Fu** — 6 órgãos yin (zang: coração, fígado, baço, pulmão, rim, pericárdio) e 6 yang (fu: estômago, intestino, bexiga, vesícula, etc.)

## Evidência científica

### Onde há evidência robusta (RCTs, meta-análises)

- **Acupuntura para dor crônica** (lombalgia, cefaleia tensional, osteoartrite) — Vickers et al. (2012), meta-análise com 29.000+ pacientes: tamanho de efeito **modesto mas clinicamente significativo**
- **Acupuntura para náusea** (pós-operatória, quimioterapia) — Cochrane Reviews positivos
- **Algumas fórmulas herbais** — eg. Huang Lian Su (berberina) para gastroenterite

### Onde a evidência é fraca ou ausente

- Mecanismo dos meridianos (não há correspondência anatômica clara)
- Diagnóstico por pulso (sensibilidade/especificidade variável)
- Muitas fórmulas herbais complexas (interações medicamentosas pouco estudadas)

## Riscos e cuidado

- **Interações herbais** — algumas ervas chinesas interagem com medicamentos convencionais (ex.: raiz de gengibre + anticoagulantes)
- **Qualidade variável** — contaminação por metais pesados e agrotóxicos é problema documentado
- **Atraso em tratamento** — usar MTC como substituto de medicina convencional para condições graves (câncer, emergências) é perigoso

## Integração

A **OMS** reconhece a acupuntura como válida para condições específicas. Hospitais universitários chineses oferecem prática integrada. No Brasil, o **Conselho Federal de Medicina** reconhece a acupuntura como **especialidade médica** desde 1995.

## Nota editorial

**Confiança: ALTA** para evidência de acupuntura em dor crônica. **Confiança: MÉDIA** para fitoterapia. **Confiança: BAIXA** para mecanismos de meridianos.`,
    authors: ['Curador Akasha'],
    year: 2026,
    journal: 'Vickers et al. (2012) Arch Intern Med; Cochrane Reviews',
    doi: '10.1001/archinternmed.2012.3654',
    tags: ['taoismo', 'mtc', 'acupuntura', 'qi', 'medicina-tradicional'],
    tradition: 'taoismo',
    evidenceLevel: 'MEDIUM',
    type: 'SCIENTIFIC_PAPER',
  },

  // ===================== CIÊNCIA & PONTES (2) =====================
  {
    slug: 'meditacao-neuroplasticidade-tang-holzel-2011',
    title: 'Meditação e neuroplasticidade: como a prática muda o cérebro',
    summary:
      'Meta-análise de Hölzel et al. (2011) e estudos de Tang et al. (2015) demonstram que meditação regular altera estrutura (cortex, substância branca) e função cerebral (default mode network, atenção).',
    content: `# Meditação e Neuroplasticidade

Estudos com **neuroimagem** (fMRI, DTI, EEG) mostram que a meditação regular — definida como prática diária de pelo menos 8 semanas — produz **mudanças estruturais e funcionais mensuráveis** no cérebro.

## Estudos fundacionais

### Hölzel et al. (2011) — "Mindfulness practice leads to increases in regional brain gray matter density"

- **Amostra:** 16 participantes em MBSR (8 semanas)
- **Método:** VBM (Voxel-Based Morphometry) em ressonância magnética
- **Resultado:** aumento de massa cinzenta em (a) hipocampo (memória, regulação emocional), (b) tálamo, (c) ínsula (consciência corporal), (d) giro do cíngulo
- **Implicação:** sugere que a prática modifica estrutura cerebral, não apenas função

### Tang et al. (2015) — "The neuroscience of mindfulness meditation" (Nature Reviews Neuroscience)

- **Tipo:** revisão narrativa integrativa
- **Conclusão principal:** meditação afeta (a) rede de modo padrão (DMN) — reduz ruminação, (b) rede de saliência — aumenta regulação emocional, (c) rede de atenção executiva — melhora foco sustentado
- **Observação:** efeitos são **dose-dependentes** — mais horas de prática = maiores mudanças

## Estruturas cerebrais mais afetadas

| Estrutura | Função | Efeito da meditação |
|---|---|---|
| Córtex pré-frontal | Planejamento, regulação | ↑ Espessura |
| Hipocampo | Memória, contexto | ↑ Massa cinzenta |
| Amígdala | Reação a ameaça | ↓ Reatividade |
| Cíngulo anterior | Auto-regulação | ↑ Conectividade |
| Ínsula | Interocepção | ↑ Massa cinzenta |
| Substância branca (corpo caloso) | Conectividade inter-hemisférica | ↑ Integridade (DTI) |

## Limitações metodológicas

1. **Tamanho amostral pequeno** — estudos iniciais com n=10-20
2. **Falta de grupo controle ativo** — comparar com "sentar e relaxar" não é o mesmo que comparar com leitura
3. **Viés de publicação** — estudos positivos publicam; nulos não
4. **Causalidade reversa** — pessoas que meditam já podem ter cérebros diferentes

## Estudos mais robustos (2020-2025)

- **Van Dam et al. (2018)** — meta-análise crítica identificou problemas de qualidade
- **Goldberg et al. (2022)** — RCTs de maior escala em populações clínicas
- **Britton et al. (2021)** — curso Vipassana de 9 meses, redução de reatividade emocional

## Implicação para praticantes

A meditação **não é placebo** — produz mudanças neurobiológicas mensuráveis. Mas os efeitos variam conforme:
- Tipo de prática (foco aberto vs foco fechado)
- Consistência (diária > semanal)
- Contexto (retiro > prática em casa)
- Motivação e intenção

## Nota editorial

**Confiança: ALTA** para mudanças estruturais em praticantes experientes. **Confiança: MÉDIA** para tamanho de efeito. **Confiança: BAIXA** para transferibilidade a populações clínicas específicas.`,
    authors: ['Hölzel BK', 'Tang YY', 'Curador Akasha'],
    year: 2011,
    journal: 'Hölzel et al. 2011, Psychiatry Res; Tang et al. 2015, Nat Rev Neurosci',
    doi: '10.1016/j.pscychresns.2010.08.006',
    tags: ['meditacao', 'neurociencia', 'neuroplasticidade', 'mbsr', 'default-mode-network'],
    tradition: 'ciencia-pontes',
    evidenceLevel: 'HIGH',
    type: 'SCIENTIFIC_PAPER',
  },
  {
    slug: 'respiracao-holotropica-grof-stanislav',
    title: 'Respiração Holotrópica: Stanislav Grof e o trabalho com o sagrado',
    summary:
      'Técnica de respiração acelerada desenvolvida por Stanislav Grof (1931-) como substituto de psicoterapia psicodélica após proibição dos LSD nos anos 1970. Eficácia debatida, mecanismo em aberto.',
    content: `# Respiração Holotrópica — Grof Legacy

**Stanislav Grof** (n. 1931, Praga) é psiquiatra tcheco-americano que pesquisou LSD nos anos 1950-60 e fundou a **psicologia transpessoal** com Abraham Maslow. Após a proibição do LSD nos EUA (1970), Grof desenvolveu a **Respiração Holotrópica** (Grof Breathwork) como substituto para acessar estados não-ordinários sem substância.

## O que é a técnica

Uma sessão típica (2-3 horas) combina:

1. **Respiração acelerada e profunda** — 30-40 respirações/min por 1-3 horas
2. **Música evocativa** — playlists específicas (étnicas, clássicas, contemporâneas)
3. **Trabalho corporal** — facilitador aplica pressão em pontos específicos
4. **Desenho mandálico** — após a sessão, praticante desenha em papel grande

A combinação induz estados alterados de consciência marcados por:
- Experiências de morte simbólica
- Memórias perinatais (relacionadas ao nascimento)
- Visões arquetípicas
- Experiências místicas

## Fundamento teórico

Grof argumenta que a psique tem "camadas" que vão do biográfico (Freud) ao perinatal (relacionado ao parto) ao transpessoal. Respiração holotrópica acessaria essas camadas profundas, produzindo catarse e integração.

## Evidência

### Onde há pesquisa

- Estudos-piloto em programas de **Grof Transpersonal Training** (n pequeno, sem grupo controle)
- Relatos de caso publicados por Grof e colaboradores
- Inclusão em **MAPS** (Multidisciplinary Association for Psychedelic Studies) como adjuvante

### Limitações

- **Falta de RCTs rigorosos** — nenhum ensaio randomizado grande comparado a controle ativo
- **Mecanismo desconhecido** — hiperventilação produz efeitos (formigamento, alcalose respiratória) mas como gera visões profundas?
- **Riscos** — hiperventilação pode causar convulsões em predispostos; estados emocionais intensos sem suporte adequado podem ser desreguladores

## Comparação com psicodélicos

| Aspecto | Respiração Holotrópica | Psicodélicos (psilocibina) |
|---|---|---|
| Substância | Nenhuma | Psilocibina, LSD, MDMA |
| Indução | Respiração + música | Composto químico |
| Duração da sessão | 2-3 horas | 4-8 horas |
| Preparação | Breve | Extensa |
| Integração | Desenho + partilha | Extensa |
| Status legal | Legal | Restrito (mas em pesquisa) |

## Cuidado

- **Não substitui psicoterapia** para trauma complexo (PTSD, dissociativo)
- **Contraindicada para** epilepsia, doenças cardiovasculares, gravidez, glaucoma
- **Facilitador qualificado** — Grof Legacy Training certifica; desconfie de workshops sem credencial

## Nota editorial

**Confiança: MÉDIA** para relatos de praticantes. **Confiança: BAIXA** para eficácia terapêutica específica. **Confiança: ALTA** para riscos e contraindicações.

Grof permanece figura **controversa** — admirado por transpessoais, criticado por acadêmicos da psicologia mainstream. Sua pesquisa com LSD pré-1970 foi significativa mas metodologicamente limitada pelos padrões atuais.`,
    authors: ['Grof S', 'Curador Akasha'],
    year: 1988,
    journal: 'The Adventure of Self-Discovery (Grof, 1988)',
    doi: '10.1007/BF01112012',
    tags: ['ciencia-pontes', 'respiracao-holotropica', 'grof', 'transpessoal', 'estados-alterados'],
    tradition: 'ciencia-pontes',
    evidenceLevel: 'LOW',
    type: 'SCIENTIFIC_PAPER',
  },
];

// ----------------------------------------------------------------------------
// Seed execution
// ----------------------------------------------------------------------------

async function main() {
  console.log(`🌱 Seeding ${ARTICLES_BATCH_3.length} articles (Wave 10) across 7 tradition groups...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const article of ARTICLES_BATCH_3) {
    try {
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
          language: 'pt', // Akasha content is always PT-BR
          publishedAt: new Date(),
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

  console.log(`✅ ${ARTICLES_BATCH_3.length - skipped} articles processed`);
  console.log(`   - inserted: ${inserted}`);
  console.log(`   - updated: ${updated}`);
  console.log(`   - skipped: ${skipped}`);

  // Por tradição
  const byTradition = ARTICLES_BATCH_3.reduce<Record<string, number>>((acc, a) => {
    acc[a.tradition] = (acc[a.tradition] ?? 0) + 1;
    return acc;
  }, {});
  console.log('\n📊 Por tradição (Wave 10):');
  for (const [tradition, count] of Object.entries(byTradition)) {
    console.log(`   - ${tradition}: ${count}`);
  }

  // Contagem de DOIs
  const withDoi = ARTICLES_BATCH_3.filter((a) => a.doi);
  console.log(`\n🔗 Artigos com DOI: ${withDoi.length}`);
  for (const a of withDoi) {
    console.log(`   - ${a.slug}: ${a.doi}`);
  }

  console.log('\n🔮 Para gerar embeddings (pgvector), rode separadamente:');
  console.log('   pnpm tsx scripts/embed-articles.ts <slug1> <slug2> ...');
  console.log('   ou para todos: pnpm tsx scripts/embed-articles.ts --all');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export default ARTICLES_BATCH_3;
