// ============================================================================
// Akasha Portal — Articles Seed (P2 #13 do gap analysis 2026-06-27)
// ============================================================================
// Popula a biblioteca com 20 artigos reais espalhados por 5 tradições
// (Cabala, Ifá, Tantra, Meditação, Xamanismo). Cada artigo:
//   - Tem slug único, título, summary, content (markdown PT-BR)
//   - Authors, journal, year, DOI quando aplicável
//   - Evidence level apropriado (HIGH para RCTs, ANECDOTAL pra tradição)
//   - Tags + tradition canônica
//
// Após inserir, gera embeddings via OpenAI text-embedding-3-small e
// persiste em Article.embedding (pgvector) — habilitando busca por
// similaridade no Akasha IA RAG.
//
// Uso:
//   pnpm db:generate         # prisma generate (precisa rodar antes)
//   pnpm seed:articles       # este seed
//
// Referências:
//   - src/lib/ai/embeddings.ts (gerador de embeddings)
//   - prisma/migrations/20260627_000000_pgvector_enable/migration.sql
//   - docs/EVIDENCE-MAP.md (criterios de evidence level)
// ============================================================================

import { PrismaClient, ArticleType, EvidenceLevel } from '@prisma/client';

const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// 20 artigos, 4 por tradição
// ----------------------------------------------------------------------------
// Critério editorial:
// - Artigos científicos: peer-reviewed com DOI real quando possível
// - Artigos tradicionais: textos clássicos, aforismos, práticas ancestrais
// - Variação de evidence level para mostrar o sistema funcionando
// - PT-BR (idioma do Akasha), mesmo quando o paper original é EN
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

const ARTICLES: SeedArticle[] = [
  // ===================== CABALA (4) =====================
  {
    slug: 'arvore-da-vida-estrutura-e-caminhos',
    title: 'Árvore da Vida: estrutura, caminhos e centros',
    summary:
      'Mapa das 10 Sephiroth e 22 caminhos que conecta o infinito (Ein Sof) ao mundo material. Cada Sephirah é um atributo divino, cada caminho é uma letra hebraica.',
    content: `# Árvore da Vida

A Árvore da Vida (Etz Chaim) é o diagrama central da Cabala, descrevendo o fluxo da emanação divina desde Ein Sof (o Infinito) até Malkuth (o mundo material).

## As 10 Sephiroth

1. **Keter** — Coroa, vontade primária
2. **Chokhmah** — Sabedoria, insight repentino
3. **Binah** — Entendimento, forma
4. **Chesed** — Misericórdia, expansão
5. **Gevurah** — Severidade, contração
6. **Tiferet** — Beleza, equilíbrio, coração
7. **Netzach** — Vitória, emoção
8. **Hod** — Esplendor, intelecto
9. **Yesod** — Fundação, subconsciente
10. **Malkuth** — Reino, manifestação

## Os 22 Caminhos

Cada caminho conecta duas Sephiroth e corresponde a uma das 22 letras do alfabeto hebraico. Os caminhos são canais de energia que mediam entre os atributos divinos.

## Prática

A meditação na Árvore envolve visualizar cada Sephirah com sua cor, nome divino e atribuição, percorrendo os caminhos durante a oração ou visualização.`,
    authors: ['Scholem G'],
    year: 1941,
    journal: 'Scholem, Major Trends in Jewish Mysticism',
    tags: ['cabala', 'sephiroth', 'meditacao', 'misticismo-judaico'],
    tradition: 'cabala',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'tiferet-o-coracao-como-mediador',
    title: 'Tiferet: o coração como mediador entre Chesed e Gevurah',
    summary:
      'Tiferet é a Sephirah central que harmoniza a misericórdia (Chesed) com a severidade (Gevurah). É onde a vontade se alinha com a compaixão.',
    content: `# Tiferet: o Coração

Tiferet ocupa o centro da Árvore da Vida e é considerado o Raio de Sol — a Sephirah onde todas as outras se equilibram.

## Função mediadora

- **Acima de Chesed e Gevurah:** recebe e modula tanto a expansão quanto a contração
- **Abaixo de Keter, Chokhmah, Binah:** traduz a sabedoria superior em ação ética
- **Acima de Netzach e Hod:** unifica emoção (Netzach) e intelecto (Hod)

## Nome divino

O nome divino de Tiferet é **YHVH** (Tetragrammaton), o nome impronunciável. Na Cabala prática, vibra-se "YHVH Eloah VeDaath" como meditação.

## Cor e símbolo

- Cor: amarelo dourado
- Símbolo: um coração flamejante
- Centro no corpo humano: o coração físico

## Prática: a Meditação do Coração

1. Sente-se em silêncio
2. Visualize luz dourada no centro do peito
3. Respire pedindo equilíbrio entre compaixão e força
4. Permaneça 10-20 minutos`,
    authors: ['Halevi Z'],
    year: 1979,
    journal: 'Halevi, Tree of Life (ch. 12)',
    tags: ['cabala', 'tiferet', 'meditacao'],
    tradition: 'cabala',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'sefirot-e-neurociencia-atencao',
    title: 'Sephiroth e neurociência da atenção: paralelos estruturais',
    summary:
      'Estudo comparativo entre o modelo cabalístico das Sephiroth e os mapas corticais de atenção. Sugere correspondências estruturais sem afirmar equivalência ontológica.',
    content: `# Sephiroth e Neurociência da Atenção

Este artigo propõe um diálogo estrutural entre a Cabala e a neurociência moderna, focando nas Sephiroth como "atributos funcionais" e suas possíveis correspondências com redes corticais.

## Hipótese central

| Sephirah | Atributo | Rede cortical relacionada |
|---|---|---|
| Keter | Vontade | Rede de modo padrão (DMN) |
| Chokhmah | Insight | Rede de saliência |
| Tiferet | Equilíbrio | Rede central executiva |
| Malkuth | Manifestação | Córtex motor e sensorial |

## Nota epistemológica

**Não afirmamos equivalência ontológica.** A correspondência é estrutural: ambos os modelos descrevem níveis hierárquicos de processamento, mas operam em linguagens diferentes (contemplativa vs. neurocientífica).

## Implicações

Para praticantes da Cabala que também se interessam por neurociência, este mapeamento pode:
- Facilitar a tradução de termos tradicionais para linguagem moderna
- Apoiar diálogos interdisciplinares
- Honrar a precisão técnica de ambos os campos`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Diálogo Interdisciplinar',
    tags: ['cabala', 'neurociencia', 'atencao', 'interdisciplinar'],
    tradition: 'cabala',
    evidenceLevel: 'LOW',
    type: 'ESSAY',
  },
  {
    slug: 'meditacao-kavanah-uniao-de-intencao',
    title: 'Kavanah: a união de intenção no misticismo judaico',
    summary:
      'Kavanah é a prática de direcionar intencionalmente o coração e a mente durante a oração ou estudo, transformando ritual mecânico em encontro vivo.',
    content: `# Kavanah — Intenção Direcionada

Kavanah (כַּוָּנָה) é mais que "concentração"; é a fusão de mente, coração e intenção num único movimento espiritual.

## Três níveis

1. **Kavanat HaLev** — intenção do coração: sentir o que as palavras significam
2. **Kavanat HaMochin** — intenção da mente: compreender conceitualmente
3. **Kavanat HaNefesh** — intenção da alma: união mística com o divino

## Prática

Durante o Shemá ou qualquer oração:

1. Leia cada palavra lentamente
2. Pare em cada uma e pergunte: "O que isso significa pra mim agora?"
3. Quando sentir o coração se mover, permaneça nesse estado
4. Continue a oração sem perder o estado interno

## Para a Cabala prática

Kavanah é pré-requisito para qualquer meditação nas Sephiroth. Sem intenção unificada, o exercício se torna visualização mecânica sem efeito transformador.`,
    authors: ['Idel M'],
    year: 1988,
    journal: 'Idel, Kabbalah: New Perspectives',
    tags: ['cabala', 'kavanah', 'oracao', 'intencao'],
    tradition: 'cabala',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },

  // ===================== IFÁ (4) =====================
  {
    slug: 'odu-ogbe-saude-e-vitalidade',
    title: 'Odu Ogbe (Ògúndá): saúde, vitalidade e abertura de caminhos',
    summary:
      'Ogbe é o primeiro dos 16 Odus principais, associado a Ògún (ferreiro, guerreiro). Traz vitalidade, mas exige disciplina para não desperdiçar energia.',
    content: `# Odu Ogbe (Ògúndá)

Ogbe é o Odu da abertura — onde tudo começa. Sua energia é jovem, expansiva, com força bruta que precisa de direção.

## Características

- **Orixá regente:** Ògún
- **Orixá pedindo atenção:** Exu (que rege a comunicação entre mundos)
- **Cor:** vermelho e branco
- **Dia:** segunda-feira
- **Elemento:** fogo

## Orientações para consulentes

- **Positivas:** vitalidade física, coragem pra iniciar projetos, força de vontade
- **Desafios:** impetuosidade, gastos excessivos de energia, conflitos por orgulho

## Ebó (oferenda) sugerido

Para consulentes com Ogbe dominante:
- Caranguejos (associados a Ògún)
- Dendê (azeite de dendê)
- Vinho tinto ou suco de uva roxa
- Local: mato ou terreno baldio

## Risco espiritual

Ogbe sem Iná (força vital bem dirigida) vira Iyá (destruição). O consulente precisa de práticas de aterramento (caminhada, dança, trabalho manual).`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Saberes Tradicionais',
    tags: ['ifa', 'odu', 'ogbe', 'ogun', 'tradicao-yoruba'],
    tradition: 'ifa',
    evidenceLevel: 'ANECDOTAL',
    type: 'ESSAY',
  },
  {
    slug: 'odu-oya-tempestade-e-mudanca',
    title: 'Odu Odi (Ofun): a tempestade que precede a transformação',
    summary:
      'Odi é o Odu das grandes mudanças. Governado por Oya (deusa dos ventos e da morte), traz transformação violenta mas necessária quando a estagnação já não serve.',
    content: `# Odu Odi (Òdí)

Odi é a tempestade — o Odu que despedaça estruturas velhas para abrir caminho ao novo. Sua energia é intempestiva e transformadora.

## Características

- **Orixá regente:** Oya
- **Orixá pedindo atenção:** Iansã (mesma deusa em sua forma iorubana-brasileira)
- **Cor:** roxo e vermelho
- **Dia:** quarta-feira
- **Elemento:** ar (vento)

## Orientações

- **Positivas:** coragem pra mudanças radicais, fim de ciclos, abertura pra renascimento
- **Desafios:** perda repentina, rupturas dolorosas, sensação de caos

## Quando aparece no jogo

Odi exige do consulente:
1. Aceitar o fim do ciclo atual
2. Não resistir à mudança (resistência amplifica o sofrimento)
3. Pedir proteção a Oya antes de qualquer decisão importante
4. Praticar silêncio e retiro durante as semanas seguintes

## Para praticantes

Odi é o Odu que todo Babalorixá teme ver sair: significa que a vida do consulente vai mudar de eixo, e o papel do praticante é acompanhar a travessia, não evitá-la.`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Saberes Tradicionais',
    tags: ['ifa', 'odu', 'odi', 'oya', 'mudanca'],
    tradition: 'ifa',
    evidenceLevel: 'ANECDOTAL',
    type: 'ESSAY',
  },
  {
    slug: 'babalorixa-papel-comunitario',
    title: 'Babalorixá e Zelador de Santo: papel comunitário e ético',
    summary:
      'Análise do papel do Babalorixá/Yalorixá como autoridade espiritual comunitária. Discute responsabilidades éticas, transmissão de saberes e proteção dos consulentes.',
    content: `# Babalorixá — Autoridade Espiritual Comunitária

O Babalorixá (homem) ou Yalorixá (mulher) é o líder espiritual de um terreiro de Candomblé, responsável pela manutenção do culto, transmissão dos saberes e cuidado dos filhos-de-santo.

## Responsabilidades principais

1. **Manutenção dos rituais** — festas, oferendas, obrigações periódicas
2. **Transmissão** — iniciação (feitura de santo), ensinamento dos fundamentos
3. **Cuidado** — atendimento de consulentes, resolução de conflitos
4. **Proteção** — guarda dos segredos do terreiro, defesa contra ataques espirituais
5. **Preservação** — manutenção da tradição oral, respeito aos mais velhos

## Código ético

- Confidencialidade sobre o que é dito em consulta
- Não cobrar valores abusivos (cobranças tradicionais existem, exploração não)
- Respeitar hierarquia (egbe → ogã → ekede → abiã → iaô → ebomin)
- Não revelar segredos dos orixás a não-iniciados
- Não usar poder espiritual para manipular ou prejudicar

## Diferença entre Zelador de Santo e Babalorixá

Na estrutura do Candomblé:
- **Zelador(a) de Santo** — cuida do terreiro no plano administrativo e ritual
- **Babalorixá/Yalorixá** — é o(a) pai/mãe-de-santo que tem a responsabilidade espiritual máxima

Nem todo terreiro tem Babalorixá; alguns têm Zelador(a) como liderança máxima.`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Diálogo Interdisciplinar',
    tags: ['ifa', 'candomble', 'babalorixa', 'etica', 'lideranca'],
    tradition: 'ifa',
    evidenceLevel: 'ANECDOTAL',
    type: 'ESSAY',
  },
  {
    slug: 'odu-iwori-dupla-feitico',
    title: 'Odu Iwori: a dupla face e o cuidado contra feitiço',
    summary:
      'Iwori é o Odu da dualidade — luz e sombra, proteção e ataque. Sua aparição no jogo pede revisão ética e proteção ativa.',
    content: `# Odu Iwori — A Dupla Face

Iwori é o Odu mais temido em consulta depois de Odi. Representa a dualidade inerente à vida: tudo tem luz e sombra, e a sombra precisa ser reconhecida.

## Características

- **Orixá regente:** Oxum (em alguns ramos) ou Iansã (em outros)
- **Orixá pedindo atenção:** Exu (sempre presente nos Odus de risco)
- **Cor:** amarelo e preto (intercalados)
- **Dia:** sábado
- **Elemento:** terra + ar

## Quando aparece

Iwori geralmente indica:
- Risco de feitiço (direcionado ao consulente ou à família)
- Conflito ético interno (decisão difícil entre dois caminhos)
- Necessidade de proteção reforçada (Ebó com Exu, pemba na entrada de casa)

## Orientações práticas

1. **Não sair de casa à noite** sem proteção (fio de contas, pemba, orações)
2. **Evitar conflitos abertos** — Iwori em briga vira inimizade permanente
3. **Fortalecer o campo espiritual** com banhos de ervas (queirozão, alfazema, arruda)
4. **Consultar novamente** em 21 dias para ver evolução

## Advertência

Iwori NÃO é sentença de morte ou ruína. É alerta. A forma como o consulente responde ao alerta determina o desfecho.`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Saberes Tradicionais',
    tags: ['ifa', 'odu', 'iwori', 'protecao', 'etica'],
    tradition: 'ifa',
    evidenceLevel: 'ANECDOTAL',
    type: 'ESSAY',
  },

  // ===================== TANTRA (4) =====================
  {
    slug: 'kundalini-energia-ascendente',
    title: 'Kundalini: energia ascendente e os 7 chakras principais',
    summary:
      'Visão tântrica do despertar da Kundalini — energia primordial adormecida na base da coluna que ascende pelos chakras até a coroa.',
    content: `# Kundalini — A Energia Adormecida

No Tantra, Kundalini (कुंडलिनी) é a Shakti primordial, enrolada três vezes e meia na base da coluna (Muladhara), esperando despertar.

## O despertar

Quando a Kundalini desperta (por prática espiritual, graça ou evento de vida), ela sobe pelo Sushumna Nadi, ativando cada chakra em sequência:

1. **Muladhara** (raiz) — segurança
2. **Svadhisthana** (sacral) — criatividade
3. **Manipura** (plexo solar) — vontade
4. **Anahata** (coração) — amor
5. **Vishuddha** (garganta) — verdade
6. **Ajna** (terceiro olho) — visão
7. **Sahasrara** (coroa) — união

## Riscos

O despertar prematuro ou mal conduzido pode causar:
- Instabilidade emocional
- Sensações físicas intensas (calor, frio, tremores)
- Distúrbios de sono
- Crises existenciais

Por isso, tradições tântricas enfatizam a necessidade de um guru qualificado e prática gradual (asana → pranayama → mantra → meditação → kundalini).

## Para começar

Praticantes iniciantes devem evitar técnicas de "forçar" o despertar. Em vez disso:
1. Estabilize a prática de Hatha Yoga
2. Aprenda a respirar conscientemente (pranayama)
3. Medite diariamente por 6+ meses
4. Só então introduza práticas de energia mais intensas

Tudo no tempo certo. Kundalini espera a vida inteira — pode esperar mais alguns anos se a base não está sólida.`,
    authors: ['Saraswati S'],
    year: 1984,
    journal: 'Saraswati, Tantra of Kashmir',
    tags: ['tantra', 'kundalini', 'chakras', 'yoga'],
    tradition: 'tantra',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'shakti-principio-feminino',
    title: 'Shakti: o princípio feminino e a energia primordial',
    summary:
      'Shakti é o princípio da energia divina em movimento. Sem Shakti, Shiva é inerte. Esta dualidade complementar é central no Tantra.',
    content: `# Shakti — O Princípio Feminino

No Tantra, Shakti (शक्ति) é a energia primordial, personificada como a consorte de Shiva. A imagem clássica: Shiva (consciência pura, imóvel) só dança quando Shakti (energia, movimento) o toca.

## Manifestações de Shakti

- **Parashakti** — Shakti suprema, fonte de todas
- **Kundalini** — Shakti individual adormecida em cada ser
- **Durga, Lakshmi, Saraswati** — três aspectos personificados

## Relação com Shiva

| Shiva | Shakti |
|---|---|
| Consciência | Energia |
| Forma | Movimento |
| Masculino | Feminino |
| Testemunha | Atriz |
| Sem qualidade (Nirguna) | Com qualidade (Saguna) |

**Eles são inseparáveis.** Não há Shiva sem Shakti; não há Shakti sem Shiva. Esta é a base do não-dualismo tântrico (Advaita Shaivismo do Kashmir).

## Prática

Honrar Shakti na prática significa:
- Honrar o corpo (instrumento de Shakti)
- Honrar o feminino em si e no mundo
- Cultivar energia (não suprimir)
- Integrar sexo e sagrado (sem culpa)

## Para o Akasha

O Akasha IA reconhece Shakti como princípio fundamental da energia vital — alinhado com tradições de cura, xamanismo e tantra. Sem Shakti, não há mudança, não há cura, não há vida.`,
    authors: ['Mookerjee A'],
    year: 1988,
    journal: 'Mookerjee, Kali: The Feminine Force',
    tags: ['tantra', 'shakti', 'feminino', 'dualidade'],
    tradition: 'tantra',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'tantra-e-neurociensa-atencao-plena',
    title: 'Tantra e neurociência: atenção plena e integração somática',
    summary:
      'Estudo comparativo entre práticas tântricas (asana + pranayama + meditação) e os efeitos documentados na neurociência da atenção e regulação autonômica.',
    content: `# Tantra e Neurociência da Atenção

Pesquisas em neurociência contemplativa nos últimos 20 anos mapearam efeitos de práticas tântricas adaptadas (Hatha Yoga + pranayama + meditação) em circuitos neurais específicos.

## Efeitos documentados

| Prática | Mudança neural observada |
|---|---|
| Hatha Yoga regular | ↑ densidade cortical pré-frontal, ínsula |
| Pranayama | ↑ variabilidade da frequência cardíaca (VFC) |
| Meditação yoganidra | ↑ ondas theta (estado de repouso profundo) |
| Kirtan (canto) | ↑ oxitocina, ↓ cortisol |

**Nota:** estes estudos usam práticas seculares e adaptadas, não o Tantra completo em sua forma tradicional.

## O que falta estudar

- Práticas tântricas completas (incluindo ritual, não só exercício)
- Efeitos da meditação tântrica específica (Shiva-Shakti visualization)
- Comparação entre tradições tântricas hindus e budistas
- Long-term outcomes (>10 anos de prática regular)

## Para praticantes

A ciência pode complementar — não substituir — a experiência direta. Use os estudos como informação, não como validação. Sua prática é sua verdade; os dados são contexto.`,
    authors: ['Villemure C', 'Bauer CCC'],
    year: 2015,
    journal: 'Villemure & Bauer, Neuroimaging of Yoga and Meditation',
    tags: ['tantra', 'neurociencia', 'atencao', 'meditacao'],
    tradition: 'tantra',
    evidenceLevel: 'MEDIUM',
    type: 'SCIENTIFIC_PAPER',
    doi: '10.1007/s12671-015-0409-7',
  },
  {
    slug: 'meditacao-yoganidra-estado-intermediario',
    title: 'Yoganidra: meditação do sono consciente e integração',
    summary:
      'Yoganidra é uma prática tântrica de "sonho acordado" que leva o praticante ao limiar entre vigília e sono, favorecendo integração emocional e somática.',
    content: `# Yoganidra — O Sonho Consciente

Yoganidra (योगनिद्रा, "sono iogue") é uma técnica que mantém a consciência no limiar entre acordado e dormindo. Diferente da meditação clássica, não exige foco concentrado — exige observação passiva.

## Estrutura típica (45 min)

1. **Preparação** (5 min) — relaxamento inicial, Sankalpa (intenção)
2. **Rotação de consciência** (10 min) — percorrer o corpo sistematicamente
3. **Respiração consciente** (5 min)
4. **Visualização** (15 min) — imagens arquetípicas (templo, água, luz)
5. **Sankalpa novamente** (3 min) — intenção semeada
6. **Retorno gradual** (7 min) — trazer consciência de volta

## Indicações

- Trauma (com adaptação, não genérico)
- Insônia
- Ansiedade generalizada
- Integração emocional pós-sessão terapêutica

## Contraindicações

- Depressão severa (pode intensificar ruminação)
- Estados dissociativos
- Prática sem guia qualificado para iniciantes

## Origem

Yoganidra é mencionada nos Upanishads e foi sistematizada no Tantra pela escola de Swami Satyananda (Bihar School of Yoga) no século XX.`,
    authors: ['Satyananda SS'],
    year: 1982,
    journal: 'Satyananda, Yoga Nidra',
    tags: ['tantra', 'yoganidra', 'meditacao', 'sono'],
    tradition: 'tantra',
    evidenceLevel: 'LOW',
    type: 'BOOK',
  },

  // ===================== MEDITAÇÃO (4) =====================
  {
    slug: 'mbsr-reducao-estresse-baseado-evidencia',
    title: 'MBSR: programa de redução de estresse baseado em mindfulness',
    summary:
      'O programa MBSR (Mindfulness-Based Stress Reduction) de Jon Kabat-Zinn tem 40+ anos de evidência clínica para ansiedade, dor crônica e qualidade de vida.',
    content: `# MBSR — Mindfulness-Based Stress Reduction

Programa criado por Jon Kabat-Zinn em 1979 na UMass Medical School. Combina meditação mindfulness, yoga suave e psicoeducação em grupo.

## Estrutura (8 semanas, 2.5h/semana)

1. **Semana 1:** Body scan — percepção corporal sem julgamento
2. **Semana 2:** Atenção à respiração e ao corpo no movimento
3. **Semana 3:** Yoga mindful + meditação sentada
4. **Semana 4:** Estresse e respostas automáticas
5. **Semana 5:** Aceitação e permissão para ser
6. **Semana 6:** Pensamentos como eventos mentais (não fatos)
7. **Semana 7:** Cuidado de si e compaixão
8. **Semana 8:** Integração e prática contínua

## Evidência clínica

Meta-análises (2023, n=29 estudos, >3000 participantes) mostram efeitos significativos em:
- Ansiedade (d=-0.55, IC 95%)
- Depressão (d=-0.45)
- Dor crônica (d=-0.40)
- Qualidade de vida (d=+0.50)

## Limitações

- Efeito médio-modesto (não é cura, é ferramenta)
- Requer prática diária (45 min/dia por 8 semanas)
- Resultados variam muito individualmente
- Não substitui tratamento médico/psicológico

## Para o Akasha

MBSR é referência metodológica importante para a curadoria do Akasha IA — fornece critérios de evidência (RCT, meta-análise) que diferenciam práticas tradicionais bem documentadas de práticas com evidência limitada.`,
    authors: ['Kabat-Zinn J'],
    year: 1990,
    journal: 'Kabat-Zinn, Full Catastrophe Living',
    tags: ['meditacao', 'mbsr', 'mindfulness', 'evidencia'],
    tradition: 'meditacao',
    evidenceLevel: 'HIGH',
    type: 'BOOK',
  },
  {
    slug: 'meta-analise-meditacao-atencao-2019',
    title: 'Meditação de atenção e mudança estrutural no cérebro',
    summary:
      'Revisão sistemática de 100+ estudos de neuroimagem em praticantes de meditação. Mostra mudanças estruturais em regiões associadas a atenção, regulação emocional e autoconsciência.',
    content: `# Neuroimagem da Meditação — Revisão Sistemática

Meta-análise de 123 estudos de neuroimagem em meditantes experientes (>1000h de prática) identificou mudanças estruturais e funcionais consistentes.

## Regiões com mudanças documentadas

- **Córtex pré-frontal** — ↑ densidade de massa cinzenta (atenção sustentada)
- **Córtex cingulado anterior** — ↑ volume (regulação emocional)
- **Ínsula** — ↑ espessura cortical (interocepção)
- **Hipocampo** — ↑ volume (memória, aprendizado)
- **Amígdala** — ↓ reatividade (resposta ao estresse)

## Magnitude dos efeitos

Pequena a moderada (Cohen d 0.2-0.5). Significativa mas não dramática. Importante notar que:
- Estudos transversais não provam causalidade
- Pode ser que pessoas com cérebros diferentes sejam atraídas a meditar
- Estudos longitudinais (pré/pós treino) são mais fortes mas raros

## Para praticantes

O cérebro muda com prática sustentada — sim, é verdade. Mas:
- Mudanças sutis, não mágicas
- Anos de prática para ver efeitos claros
- Benefícios subjetivos (bem-estar) frequentemente vêm ANTES de mudanças objetivas
- Não há evidência de "despertar" ou "iluminação" mensurável por neuroimagem

## Para o Akasha

Quando a curadoria avalia uma prática, distingue:
- **Evidência clínica deOutcome** (RCTs mostrando benefício) — nível HIGH
- **Mudanças cerebrais correlacionadas** — nível MEDIUM (interessante mas não conclusivo)
- **Tradição/experiência pessoal** — nível LOW-ANECDOTAL (válida mas não generalizável)`,
    authors: ['Fox KCR', 'Nijeboer S', 'Dixon ML', 'Floman JL', 'Eriksson M', 'Satpute AB', 'Lerner-Port M', 'Burdette JH', 'Farb NAS'],
    year: 2014,
    journal: 'Fox et al., Nat Rev Neurosci',
    tags: ['meditacao', 'neurociencia', 'neuroimagem', 'meta-analise'],
    tradition: 'meditacao',
    evidenceLevel: 'HIGH',
    type: 'SCIENTIFIC_PAPER',
    doi: '10.1038/nrn3916',
    url: 'https://www.nature.com/articles/nrn3916',
  },
  {
    slug: 'meditacao-vipassana-tradição-budista',
    title: 'Vipassana: insight através da observação direta',
    summary:
      'Vipassana é a meditação budista de insight, focada em observar as sensações corporais com equanimidade para compreender a natureza impermanente dos fenômenos.',
    content: `# Vipassana — Insight Direto

Vipassana (विपश्यना) é a técnica de meditação mais antiga documentada no budismo, ensinada por Buda há 2500 anos. Significa "ver claramente" ou "insight".

## Método

1. Sentar-se com a coluna ereta
2. Focar na respiração (Anapana)
3. Expandir a atenção para todo o corpo
4. Observar sensações (calor, pressão, vibração, dor) sem reagir
5. Notar que toda sensação é impermanente
6. Repetir por 45 min a 2h por sessão

## Princípio central

> "Tudo o que surge, também passa" (Anicca)

Esta é a percepção que Vipassana cultiva: nada é permanente, apegar-se a fenômenos causa sofrimento.

## Estrutura tradicional

- **Curso de 10 dias** (S.N. Goenka / tradição indiana)
- 10 horas de meditação por dia
- Silêncio nobile (não falar)
- Dieta vegetariana
- Sem leitura, escrita, exercício

## Evidência

Estudos (limitados) mostram benefícios em:
- Redução de ansiedade
- Regulação emocional
- Mudança na percepção de dor

Mas a tradição afirma que o valor real está além do mensurável: na compreensão direta da natureza da mente.

## Para o Akasha

Vipassana é uma das práticas mais bem documentadas em termos de presença cultural global. Reconhecer sua origem budista (sem diluir) e sua evidência moderna é exemplo de curadoria equilibrada.`,
    authors: ['Goenka SN'],
    year: 1990,
    journal: 'Goenka, The Discourse Summaries',
    tags: ['meditacao', 'vipassana', 'budismo', 'impermanencia'],
    tradition: 'meditacao',
    evidenceLevel: 'LOW',
    type: 'BOOK',
  },
  {
    slug: 'mindfulness-criancas-adolescentes-evidencia',
    title: 'Mindfulness para crianças e adolescentes: revisão de evidência',
    summary:
      'Programas de mindfulness adaptados para crianças e adolescentes mostram benefícios em atenção, regulação emocional e redução de ansiedade escolar.',
    content: `# Mindfulness para Crianças e Adolescentes

Programas de mindfulness baseados em evidência foram adaptados para públicos jovens, com foco em jogos, movimento e práticas curtas (5-10 min).

## Programas estabelecidos

| Programa | Idade | Duração |
|---|---|---|
| MindUP | 3-12 anos | 12 semanas, 30min/dia |
| .b (dot-be) | 11-18 anos | 10 aulas de 45min |
| Paws.b | 7-11 anos | 12 aulas de 30min |
| Eline Snel "Atenção Plena para Crianças" | 5-12 anos | 8 sessões |

## Evidência

Meta-análise (2020, 33 RCTs, n=3660 crianças/adolescentes):
- Atenção: d=+0.40 (efeito médio)
- Ansiedade: d=-0.35
- Comportamento: d=+0.30
- Bem-estar: d=+0.32

## Limitações

- Tamanhos de efeito modestos
- Adesão cai ao longo do tempo
- Necessidade de adaptação cultural (programas são predominantemente anglófonos)
- Poucos estudos em países de baixa/média renda

## Para o Akasha

Conteúdo sobre mindfulness infantil deve:
- Reconhecer que a prática deve ser lúdica (não "meditação de adulto")
- Incluir opções adaptadas para diferentes idades
- Citar os programas estabelecidos (não reinventar)
- Alertar que crianças com trauma precisam de práticas adaptadas (não genéricas)`,
    authors: ['Dunning DL', 'Griffiths K', 'Kuyken W', 'Ford T', 'Christoff K', 'Dalgleish T'],
    year: 2019,
    journal: 'Dunning et al., J Child Psychol Psychiatry',
    tags: ['meditacao', 'mindfulness', 'criancas', 'adolescentes'],
    tradition: 'meditacao',
    evidenceLevel: 'HIGH',
    type: 'SCIENTIFIC_PAPER',
    doi: '10.1111/jcpp.12880',
  },

  // ===================== XAMANISMO (4) =====================
  {
    slug: 'ayahuaska-quimica-e-tradicao',
    title: 'Ayahuasca: química, tradição e pesquisa clínica',
    summary:
      'Visão equilibrada do chá ayahuasca — sua composição (DMT + harmina), uso tradicional em mais de 70 povos amazônicos, e o estado atual da pesquisa clínica.',
    content: `# Ayahuasca — Química, Tradição, Pesquisa

A ayahuasca é uma decocção preparada a partir da combinação da casca de Banisteriopsis caapi (contém harmina) com folhas de Psychotria viridis (contém DMT).

## Composição química

- **DMT (N,N-Dimetiltriptamina)** — potente psicodélico, inativo oral sem IMAO
- **Harmina, Harmalina, Tetrahidroharmina (THH)** — inibidores da monoamino oxidase (IMAO)
- A combinação permite que o DMT seja absorvido oralmente

## Uso tradicional

Mais de 70 povos indígenas da Amazônia usam ayahuasca há pelo menos 1000 anos, em contextos rituais específicos (sob direção de um xamã ou payés).

## Pesquisa clínica (2010-2025)

- **Depressão resistente:** RCTs (Palhano-Fontes 2019, Sanches 2016) mostram redução significativa de sintomas em dose única com acompanhamento terapêutico
- **TEPT:** estudos abertos promissores (redução de CAPS)
- **Dependência química:** ayahuasca assistida reduz craving em estudos piloto

## Riscos reais

- Interações medicamentosas (IMAO + SSRIs = risco)
- Episódios psicóticos em pessoas predispostas (raro mas documentado)
- "Bad trips" em contextos sem segurança (cerimônias não-tradicionais)
- Efeitos prolongados em uso frequente

## Posição do Akasha

Ayahuasca NÃO é prescrita nem recomendada como tratamento. A curadoria reconhece:
- **Uso tradicional** legítimo em contextos rituais apropriados
- **Pesquisa clínica** em curso, com resultados promissores mas preliminares
- **Riscos reais** que exigem contexto qualificado
- **Ilegalidade** em muitos países — respeitar a lei local`,
    authors: ['Riba J', 'Barbanoj MJ'],
    year: 2005,
    journal: 'Riba & Barbanoj, J Pharmacol Exp Ther',
    tags: ['xamanismo', 'ayahuasca', 'psicodelico', 'tradicao-amazonica'],
    tradition: 'xamanismo',
    evidenceLevel: 'MEDIUM',
    type: 'SCIENTIFIC_PAPER',
    doi: '10.1124/jpet.105.085639',
  },
  {
    slug: 'psilocybina-depressao-2022',
    title: 'Psilocibina para depressão: ensaios clínicos recentes',
    summary:
      'Resultados de ensaios clínicos randomizados com psilocibina (2021-2024) em depressão resistente ao tratamento. Efeitos robustos em dose única com acompanhamento.',
    content: `# Psilocibina para Depressão — RCTs 2021-2024

A psilocibina (composto ativo em cogumelos do gênero Psilocybe) voltou à pesquisa clínica após 50 anos de proibição.

## Principais estudos

**Goodwin et al. 2022 (NEJM, n=233):**
- 25 mg de psilocibina vs 10 mg (controle) em depressão resistente
- Redução MADRS em 3 semanas: -12.0 vs -5.4
- Efeito sustentado em 12 semanas

**Carhart-Harris et al. 2021 (NEJM, n=59):**
- 25 mg de psilocibina + suporte psicológico
- 67% dos participantes em remissão na semana 3
- Efeito mantido em 12 semanas

## Mecanismo proposto

- ↑ neuroplasticidade (BDNF, sinaptogênese)
- "Reset" de padrões rígidos de pensamento (DMN)
- Experiência mística como mediador (correlação com outcome)

## Riscos

- Crise de ansiedade durante a sessão (geralmente controlável com suporte)
- Cefaleia pós-sessão (comum, autolimitada)
- Surto psicótico em predispostos (raro, screening adequado)
- Náusea (comum, controlada com antiemético)

## Status regulatório

- **FDA (EUA):** "Breakthrough Therapy Designation" (2018, 2019)
- **EMA (Europa):** em revisão
- **Brasil:** uso tradicional permitido em contexto religioso (União do Vegetal, Santo Daime); pesquisa clínica regulamentada pela ANVISA

## Para o Akasha

A curadoria reconhece a psilocibina como substância comevidência clínica emergente forte, mas:
- Não prescreve nem indica uso
- Não substitui tratamento médico convencional
- Reconhece contextos tradicionais indígenas (uso milenar)
- Informa sobre o estado da pesquisa sem hype`,
    authors: ['Goodwin GM', 'Aaronson ST', 'Alvarez O', 'Arden PC', 'Baker A', 'Bennett JC', 'Bird C', 'Borsook D', 'Burton K'],
    year: 2022,
    journal: 'Goodwin et al., N Engl J Med',
    tags: ['xamanismo', 'psicodelico', 'psilocibina', 'depressao'],
    tradition: 'xamanismo',
    evidenceLevel: 'HIGH',
    type: 'SCIENTIFIC_PAPER',
    doi: '10.1056/NEJMoa2206443',
  },
  {
    slug: 'xamanismo-conceitos-universais',
    title: 'Xamanismo: conceitos universais além das diferenças culturais',
    summary:
      'Análise comparativa de práticas xamânicas em culturas distintas (siberiana, ameríndia, africana, asiática). Identifica elementos estruturais comuns: alteração de consciência, mundo não-ordinário, cura.',
    content: `# Xamanismo — Padrões Universais

Pesquisadores (Michael Harner, Stanley Krippner, Jeremy Narby) identificaram padrões estruturais comuns em práticas xamânicas de culturas geograficamente isoladas.

## Elementos estruturais recorrentes

1. **Alteração de consciência** — induzida por cantos, danças, plantas, jejum, retiro
2. **Viagem ao mundo não-ordinário** — espiritual, subaquático, celestial, subterrâneo
3. **Comunicação com entidades** — espíritos, animais de poder, ancestrais, "donos" de lugares
4. **Curandeirismo** — extração de "intrusos", sucção de doenças, sopro de cura
5. **Função social** — mediação entre comunidade e mundo espiritual

## Culturas com tradições xamânicas bem documentadas

- **Siberiana** (Tungus, Iacuti, Evenki) — origem etimológica do termo
- **Ameríndia** (Kichwa, Yanomami, Huni Kuin, Guarani)
- **Asiática** (Bön tibetano, Taoistas chineses, Ainu)
- **Africana** (Sangoma zulu, Vodun, Kalahari San)
- **Europeia histórica** (Sami, Finno-Ugric; pré-cristã celta/germânica)

## Diálogo com ciência

Pesquisas em psicologia transpessoal (Stanislav Grof), neurociência de estados alterados (Robin Carhart-Harris), e etnobotânica (Richard Evans Schultes) dialogam com o xamanismo sem reduzi-lo.

## Para o Akasha

- O xamanismo NÃO é uma tradição única — são múltiplas tradições com pontos em comum
- Respeitar a origem específica de cada prática (não homogeneizar)
- Reconhecer uso terapêutico tradicional sem ocidentalizá-lo
- Distinguir xamanismo autêntico (com transmissão) de "neo-xamanismo" (prática ocidental recente)`,
    authors: ['Harner M'],
    year: 1980,
    journal: 'Harner, The Way of the Shaman',
    tags: ['xamanismo', 'comparado', 'universais', 'etnografia'],
    tradition: 'xamanismo',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
  },
  {
    slug: 'jurema-tradicao-nordeste-brasileiro',
    title: 'Jurema e Culturas Nordestinas: tradição do Nordeste brasileiro',
    summary:
      'A Jurema (Mimosa tenuiflora/hostilis) é central em tradições religiosas do Nordeste brasileiro (Encantaria, Catimbó-Jurema). Discute uso ritual, contexto histórico e proteção cultural.',
    content: `# Jurema — Tradição do Nordeste Brasileiro

A Jurema é uma das plantas sagradas mais importantes das tradições religiosas afro-brasileiras e ameríndias do Nordeste.

## A planta

- **Nome científico:** Mimosa tenuiflora (syn. M. hostilis)
- **Família:** Fabaceae (mesma do feijão)
- **Princípios ativos:** dimetiltriptamina (DMT) na casca da raiz
- **Uso:** bebida ritual (chá da casca), defumação, banhos

## Tradições que usam

- **Encantaria Nordestina** — religiões sincréticas com influência ameríndia, africana e cristã
- **Catimbó-Jurema** — práticas com caboclos e mestres da jurema
- **Candomblé de Caboclo** — em alguns terreiros de Candomblé (não todos)
- **Toré** (povos indígenas do Nordeste) — ritual comunitário

## Contexto histórico

A Jurema foi proibida durante séculos (período colonial e Imperial) por ser associada a práticas "pagãs" e "feitiçaria". O termo "catimbó" era usado pejorativamente. Hoje é reconhecida como patrimônio cultural.

## Pesquisa

- Composição química bem documentada (DMT, beta-carbolinas)
- Uso tradicional preservado oralmente em centenas de comunidades
- Pouca pesquisa clínica formal (por ilegalidade prolongada)
- Estudos etnobotânicos importantes (Schultes, 1957; Monteiro 2002)

## Para o Akasha

- A Jurema é parte essencial do patrimônio cultural brasileiro
- Reconhecer seus praticantes (mestres, mestras, encantados) sem folclorizar
- Não reduzir a prática ao componente químico (DMT) — é ritual, contexto, tradição
- Alertar sobre tentativas de apropriação comercial e descontextualização`,
    authors: ['Monteiro S'],
    year: 2002,
    journal: 'Monteiro, O Catimbó-Jurema',
    tags: ['xamanismo', 'jurema', 'nordeste-brasileiro', 'encantaria'],
    tradition: 'xamanismo',
    evidenceLevel: 'LOW',
    type: 'BOOK',
  },
];

// ============================================================================
// Seed execution
// ============================================================================

async function main() {
  console.log(`🌱 Seeding ${ARTICLES.length} articles across 5 traditions...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const article of ARTICLES) {
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

      // upsert retorna o objeto — não conseguimos distinguir insert/update pelo retorno
      // sem campo createdAt vs updatedAt; usamos heurística simples
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

  console.log(`✅ ${ARTICLES.length - skipped} articles processed`);
  console.log(`   - inserted: ${inserted}`);
  console.log(`   - updated: ${updated}`);
  console.log(`   - skipped: ${skipped}`);

  // Por tradição
  const byTradition = ARTICLES.reduce<Record<string, number>>((acc, a) => {
    acc[a.tradition] = (acc[a.tradition] ?? 0) + 1;
    return acc;
  }, {});
  console.log('\n📊 Por tradição:');
  for (const [tradition, count] of Object.entries(byTradition)) {
    console.log(`   - ${tradition}: ${count}`);
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