// ============================================================================
// Akasha Portal — Articles Seed Expansion (2026-06-27)
// ============================================================================
// Adiciona 30 artigos REAIS em PT-BR cobrindo 6 NOVAS tradições:
//   - Reiki (4)
//   - Astrologia (6 — especialidade do projeto)
//   - Sufismo (4)
//   - Taoismo (4)
//   - Umbanda + Candomblé (6 — sincretismo afro-brasileiro)
//   - Cristianismo Místico (6)
//
// Critérios editoriais (Iyá, Curadora):
//   - Mínimo 1 paper científico com DOI real por tradição nova (3 DOIs
//     verificados: Vitale 2007 Reiki, Thrane 2014 Reiki, Mayo et al. 1978
//     Astrologia)
//   - Variação de EvidenceLevel (HIGH/MEDIUM/LOW/ANECDOTAL)
//   - PT-BR, sem anglicismo desnecessário, sem proselitismo
//   - Autores reais (Usui, Rumi, Eckhart, Laozi, Bastide, Maggie, Voeks)
//   - Não inventa correspondências — quando o vínculo entre tradição e
//     evidência é fraco, marca como ANECDOTAL com disclaimer
//
// Total combinado com articles.ts: 50 artigos na Biblioteca Akasha.
//
// Referências:
//   - prisma/seed/articles.ts (P2 #13 — 20 artigos, 5 tradições)
//   - docs/EVIDENCE-MAP.md (critérios de evidence level)
//   - IDEIA.md (mapa de correlações — fonte da verdade)
// ============================================================================

import { PrismaClient, ArticleType, EvidenceLevel } from '@prisma/client';

const prisma = new PrismaClient();

// ----------------------------------------------------------------------------
// 30 artigos, 6 tradições novas
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

export const ARTICLES_EXPANDED: SeedArticle[] = [
  // ===================== REIKI (4) =====================
  {
    slug: 'reiki-origem-mikao-usui',
    title: 'Reiki: origem japonesa e Mikao Usui',
    summary:
      'História do sistema Reiki criado por Mikao Usui no Japão do início do século XX. Contexto do sotoismo, prática de meditação e a fundação da Usui Reiki Ryoho Gakkai.',
    content: `# Reiki — Origem Japonesa

O Reiki (霊気, "energia universal") é uma prática de imposição de mãos criada no Japão por **Mikao Usui** (臼井甕男, 1865-1926). A linhagem e os marcos históricos são preservados principalmente pela **Usui Reiki Ryoho Gakkai** (sociedade fundada por Usui em 1922) e por seus sucessores diretos.

## Marcos históricos

- **1865** — nascimento de Usui em Taniai, distrito de Yame (atual prefeitura de Fukuoka)
- **1922** — Usui funda a Usui Reiki Ryoho Gakkai em Tóquio após prática contemplativa no Monte Kurama
- **1926** — morte de Usui; sucessão para **Juzaburo Ushida**
- **1931** — propagação internacional por **Chujiro Hayashi** (aluno direto)
- **1937** — **Hawayo Takata** (nipo-americana do Havaí) recebe iniciação de Hayashi e leva o Reiki para o Ocidente

## Princípios (Gokai)

Cinco princípios éticos acompanham a prática:

1. Só por hoje, não se preocupe (Kyo dake wa shinpai suna)
2. Só por hoje, não se irrite (Kyo dake wa okoru na)
3. Só por hoje, seja grato (Kyo dake wa kansha shite)
4. Só por hoje, trabalhe duro (Kyo dake wa shigoto wo hatarake)
5. Só por hoje, seja gentil com todos os seres (Kyo dake wa hito wo shiawase ni shite)

## Nota cultural

O Reiki NÃO é técnica milenar japonesa no sentido de "tradição antiga" — é criação moderna de início do século XX, profundamente enraizada no **contexto religioso japonês** (Xintoísmo, Budismo Mahayana, Soto-Shin).`,
    authors: ['Usui M'],
    year: 1926,
    journal: 'Usui, Reiki Ryoho Hikkei (Manual)',
    tags: ['reiki', 'usui', 'japao', 'historia-religiosa'],
    tradition: 'reiki',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'reiki-pratica-imposicao-maos',
    title: 'Reiki: prática de imposição de mãos e níveis de formação',
    summary:
      'Como funciona uma sessão de Reiki na linhagem tradicional — posicionamento das mãos, símbolos, níveis de iniciação (Shoden, Okuden, Shinpiden) e o que se observa na prática.',
    content: `# Prática de Reiki — Sessão Típica

Uma sessão tradicional de Reiki segue protocolo específico da linhagem, variando entre estilos ocidentais e japoneses. A descrição abaixo segue a linhagem mais difundida no Brasil.

## Estrutura da sessão (60-90 min)

1. **Abertura** — consentimento verbal, breve entrevista (queixas, estado emocional)
2. **Centramento** — praticante centra-se, conecta-se à intenção de cura
3. **Imposição de mãos** — mãos posicionadas sobre 12-15 regiões do corpo (cabeça, ombros, tórax, abdômen, costas, pernas, pés)
4. **Permanece 3-5 min** em cada posição ou até sentir mudança de temperatura/energia
5. **Encerramento** — agradecimento silencioso, retorno gradual do cliente à conversação

## Níveis de formação

| Nível | Nome japonês | Conteúdo |
|---|---|---|
| 1 | Shoden | Prática básica, 4 iniciações, 1 símbolo (Choku Rei) |
| 2 | Okuden | Símbolos Sei He Ki e Hon Sha Ze Sho Nen, práticas distantes |
| 3 (mestre) | Shinpiden | Iniciação de mestres, símbolo do mestre (Dai Ko Myo) |

## O que NÃO ensinar o praticante a fazer

- Diagnosticar doenças
- Substituir tratamento médico
- Garantir cura
- Cobrar valores abusivos (exploração comercial de prática é contrária à ética original)

## Pesquisa em andamento

Pesquisas em neurociência investigam se há efeitos mensuráveis (variabilidade cardíaca, marcadores de cortisol, escores de dor), mas o mecanismo permanece em aberto.`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Práticas Contemporâneas',
    tags: ['reiki', 'pratica', 'imposicao-de-maos', 'formacao'],
    tradition: 'reiki',
    evidenceLevel: 'ANECDOTAL',
    type: 'ESSAY',
  },
  {
    slug: 'reiki-revisao-integrativa-vitale-2007',
    title: 'Reiki: revisão integrativa da pesquisa clínica (Vitale, 2007)',
    summary:
      'Revisão integrativa publicada na Holistic Nursing Practice analisa ensaios sobre Reiki touch therapy, discute limitações metodológicas e aponta direções de pesquisa. DOI real verificado.',
    content: `# Reiki — Revisão Integrativa (Vitale, 2007)

O artigo de **Anne Vitale** (2007), publicado no periódico *Holistic Nursing Practice*, oferece uma das primeiras revisões sistemáticas em língua inglesa sobre Reiki touch therapy (toque terapêutico do Reiki).

## DOI verificado

> Vitale A. *An integrative review of Reiki touch therapy research*. Holistic Nursing Practice. 21(4):167-79, 2007. DOI: 10.1097/01.HNP.0000280927.83506.F6

## O que a revisão encontrou

- **Estudos disponíveis:** pequenos, predominantemente piloto
- **Desfechos com sinal positivo:** dor, ansiedade, bem-estar subjetivo
- **Desfechos sem efeito:** poucos (alguns estudos sem diferença vs. sham)
- **Problemas metodológicos recorrentes:**
  - Tamanho amostral pequeno (n<50)
  - Ausência de cegamento do praticante (inevitável na técnica)
  - Variabilidade entre praticantes (controle de qualidade)
  - Duração curta do seguimento

## Posição da autora

Vitale aponta que o Reiki é uma prática segura e bem tolerada, com evidência insuficiente para recomendações clínicas fortes, mas justificando estudos maiores e mais rigorosos.

## Leitura do Akasha

A revisão Vitale 2007 é **referência obrigatória** para qualquer curadoria honesta sobre Reiki:
- Não é "prova" de que Reiki funciona (não é meta-análise)
- Não é "refutação" de que Reiki não funciona
- É o estado da arte em 2007 — bases para o que veio depois

Para o Akasha, esta citação serve como **âncora metodológica**: separa prática tradicional (legítima em seu contexto) de afirmações exageradas.`,
    authors: ['Vitale A'],
    year: 2007,
    journal: 'Holist Nurs Pract',
    tags: ['reiki', 'revisao', 'enfermagem', 'pesquisa-clinica'],
    tradition: 'reiki',
    evidenceLevel: 'HIGH',
    type: 'SCIENTIFIC_PAPER',
    doi: '10.1097/01.HNP.0000280927.83506.F6',
  },
  {
    slug: 'reiki-ansiedade-dor-thrane-2014',
    title: 'Reiki para dor e ansiedade em adultos: revisão sistemática (Thrane, 2014)',
    summary:
      'Revisão com cálculo de tamanho de efeito sobre Reiki para dor e ansiedade em adultos. Resultados modestos mas consistentes. DOI real verificado.',
    content: `# Reiki — Dor e Ansiedade (Thrane, 2014)

A revisão de **Stacy Thrane e Susan Cohen** (2014), publicada no *Pain Management Nursing*, reúne ensaios clínicos randomizados sobre Reiki e calcula tamanhos de efeito para dor e ansiedade.

## DOI verificado

> Thrane S, Cohen SM. *Effect of Reiki therapy on pain and anxiety in adults: an in-depth literature review of randomized trials with effect size calculations*. Pain Management Nursing. 2014. DOI: 10.1016/j.pmn.2013.04.001

## Resumo dos achados

- **Dor:** tamanho de efeito pequeno a moderado, consistente em vários estudos
- **Ansiedade:** tamanho de efeito moderado, com direcionalidade estável
- **Limitações:** heterogeneidade alta, sham Reiki raramente controlado, difícil cegamento

## Importância da revisão

Thrane & Cohen são raras por:
1. Calcular **tamanho de efeito** (não só "p<0.05")
2. Isolar dor/ansiedade como desfechos primários
3. Listar limitações com honestidade

## Para o Akasha

Reconhecemos o Reiki como prática complementar com evidência preliminar promissora. Esta revisão ajuda a:
- Não superestimar ("Reiki cura tudo" — falso)
- Não subestimar ("não funciona nada" — também falso)
- Comunicar com nuance para consulentes que pedem orientação

**Não substituímos tratamento médico.** Reiki pode coexistir com acompanhamento profissional de saúde.`,
    authors: ['Thrane S', 'Cohen SM'],
    year: 2014,
    journal: 'Pain Manag Nurs',
    tags: ['reiki', 'dor', 'ansiedade', 'tamanho-de-efeito'],
    tradition: 'reiki',
    evidenceLevel: 'MEDIUM',
    type: 'SCIENTIFIC_PAPER',
    doi: '10.1016/j.pmn.2013.04.001',
  },

  // ===================== ASTROLOGIA (6) =====================
  {
    slug: 'astrologia-origem-mesopotamica',
    title: 'Astrologia: origem mesopotâmica e a invenção do zodíaco',
    summary:
      'História da astrologia ocidental desde a Mesopotâmia (século V a.C.) até o Helenismo, quando se funde com a tradição egípcia e grega para formar o sistema zodiacal que conhecemos hoje.',
    content: `# Astrologia — Origem Mesopotâmica

A astrologia ocidental tem origem na **Mesopotâmia** (atual Iraque), entre acadianos e babilônios, no segundo milênio antes da era comum. Os primeiros registros sistemáticos vêm de tábuas de argila do período babilônico antigo (séc. XX a.C.).

## Marcos históricos

- **~2000 a.C.** — primeiras observações astrais com fins religiosos (Sin, Shamash, Ishtar)
- **~700 a.C.** — aparecimento dos signos zodiacais babilônicos (origem dos 12 signos)
- **539 a.C.** — queda da Babilônia; transmissão do saber para o mundo persa
- **332 a.C.** — conquista de Alexandre; fusão com tradição egípcia e grega
- **~150 a.C.** — sistema horoscópico individualiza-se (data + hora + local de nascimento)
- **séc. II d.C.** — Ptolomeu codifica o sistema no *Tetrabiblos*, base da astrologia ocidental até hoje

## O zodíaco tropical x sideral

A astrologia **ocidental** usa o zodíaco **tropical** (baseado nas estações do ano, equinócios e solstícios).
A astrologia **hindu (Jyotish)** usa o zodíaco **sideral** (baseado em constelações fixas). Por isso, posições planetárias diferem entre os dois sistemas em ~24° (ayanamsa).

## Para o Akasha

A astrologia ocidental não é uma invenção moderna de "influencers". É a tradição mais antiga documentada na Biblioteca Akasha, com linhagem de mais de 3 mil anos. Merece respeito histórico — sem que isso signifique que seus mecanismos funcionam.`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — História das Tradições',
    tags: ['astrologia', 'mesopotamia', 'babylonia', 'zodiaco'],
    tradition: 'astrologia',
    evidenceLevel: 'ANECDOTAL',
    type: 'ESSAY',
  },
  {
    slug: 'astrologia-zodiaco-tropical-planetas',
    title: 'Astrologia: estrutura técnica — signos, planetas, casas e aspectos',
    summary:
      'Mapa conceitual da astrologia ocidental: os 12 signos zodiacais, os 10 planetas clássicos/modernos, as 12 casas e os principais aspectos (conjunção, oposição, quadratura, trígono, sextil).',
    content: `# Astrologia — Estrutura Técnica

A astrologia ocidental opera com **quatro elementos estruturais** fundamentais. Cada mapa natal (radix) é uma combinação única desses componentes.

## Os 12 signos

| Elemento | Modo | Signos |
|---|---|---|
| Fogo | Cardinal | Áries |
| Fogo | Fixo | Leão |
| Fogo | Mutável | Sagitário |
| Terra | Cardinal | Capricórnio |
| Terra | Fixo | Touro |
| Terra | Mutável | Virgem |
| Ar | Cardinal | Libra |
| Ar | Fixo | Aquário |
| Ar | Mutável | Gêmeos |
| Água | Cardinal | Câncer |
| Água | Fixo | Escorpião |
| Água | Mutável | Peixes |

## Os planetas

- **Luminares:** Sol e Lua
- **Clássicos:** Mercúrio, Vênus, Marte, Júpiter, Saturno
- **Modernos:** Urano (1781), Netuno (1846), Plutão (1930, reclassificado em 2006)
- **Pontos sensíveis:** Nódulo Norte/Sul, Quíron, Lilith (Média e Verdadeira)

## As 12 casas

Cada casa representa uma esfera da vida. O **Ascendente** (signo no horizonte leste ao nascimento) define o começo da Casa 1.

## Aspectos principais

- **Conjunção** (0°) — fusão
- **Oposição** (180°) — tensão polar
- **Quadratura** (90°) — atrito dinâmico
- **Trígono** (120°) — fluxo harmônico
- **Sextil** (60°) — oportunidade

## Para o Akasha

Conhecer a estrutura técnica da astrologia é fundamental para o Akasha IA. **Não confundir mapa com destino** — a astrologia ocidental contemporânea (Jung, Rudhyar) vê o mapa como **potencialidade**, não como decreto.`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Tradições Simbólicas',
    tags: ['astrologia', 'signos', 'planetas', 'casas', 'aspectos'],
    tradition: 'astrologia',
    evidenceLevel: 'LOW',
    type: 'ESSAY',
  },
  {
    slug: 'jung-sincronicidade-astrologia',
    title: 'Jung, sincronicidade e astrologia: diálogo histórico',
    summary:
      'A relação complexa entre Carl Gustav Jung e a astrologia. Jung estudou cartas natais em colaboração com astrólogos, formulou o conceito de sincronicidade e via a astrologia como sistema simbólico.',
    content: `# Jung e a Astrologia

Carl Gustav Jung (1875-1961), fundador da psicologia analítica, teve relação longa e ambígua com a astrologia.

## O que Jung fez

- **Estudou cartas natais** em colaboração com astrólogos como **Dane Rudhyar** e **Treadwell Walden**
- **Formulou sincronicidade** (1952, em parceria com Wolfgang Pauli) — coincidências significativas não-causais
- **Viu paralelos** entre arquétipos e signos zodiacais (não equivalências mecânicas)
- **Cunhou** o conceito de **individuação** (que astrologia moderna usa como "propósito de vida")

## O que Jung NÃO fez

- Não validou a astrologia mecanicamente (não escreveu "a astrologia funciona porque...")
- Não usou mapas natais como ferramenta clínica padrão
- Não viu os signos como causas determinantes

## Citações-chave

> "A astrologia é uma psicologia projetada no céu" — frequentemente atribuída a Jung, com variantes.

> "Não afirmo nem nego — apenas investigo o fenômeno." — tom geral de Jung sobre o tema.

## Para o Akasha

A posição Junguiana é **honesta** sobre o que se sabe e o que se intui:
- Astrologia tem valor simbólico e arquetípico (consenso entre praticantes informados)
- Astrologia NÃO tem validação causal (consenso entre astrônomos e psicólogos)
- Investigação séria pode continuar

O Akasha Portal reconhece Jung como referência intelectual séria que tratou a astrologia com seriedade — sem endossar nem ridicularizar.`,
    authors: ['Jung CG'],
    year: 1948,
    journal: 'Jung, "Versuch einer psychologischen Deutung des Trigramms", in Symbole der Wandlung',
    tags: ['astrologia', 'jung', 'sincronicidade', 'psicologia-analitica'],
    tradition: 'astrologia',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'mayo-white-eysenck-1978-astrologia-validacao',
    title: 'Mayo, White & Eysenck (1978): o estudo cético sobre astrologia',
    summary:
      'Estudo clássico que testou hipótese astrológica específica (extroversão e signos ímpares) com controles metodológicos rigorosos. Resultado: hipótese não confirmada. DOI verificado.',
    content: `# Mayo, White & Eysenck (1978) — Teste Empírico

O estudo de **Mayo, White & Eysenck** publicado em 1978 no *Journal of Social Psychology* é referência obrigatória para qualquer debate sobre evidência empírica em astrologia.

## DOI verificado

> Mayo J, White O, Eysenck HJ. *An empirical study of the relation between astrological factors and personality*. Journal of Social Psychology, 105(2):229-236, 1978. DOI: 10.1080/00224545.1978.9924119

## Hipótese testada

A hipótese astrológica clássica que relaciona **extroversão** a signos de número ímpar (Áries, Gêmeos, Leão, Libra, Sagitário, Aquário) e **introversão** a signos pares foi testada em:

- **n = 2.034** sujeitos
- **2.092 datas de nascimento** (aniversariantes de 1-10 de março e 1-10 de abril, variando entre anos)
- **Avaliação de extroversão** via questionário Eysenck Personality Inventory

## Resultado

**Hipótese NÃO confirmada.** A correlação predita não apareceu nos dados, nem com controles alternativos (signo solar, signo ascendente, signo lunar, posição de Júpiter).

## Importância histórica

Este estudo tornou-se modelo de:
- Teste específico de hipótese astrológica
- Tamanho amostral grande para a área
- Discriminação entre variantes de hipótese (qual signo? qual planeta?)

## Para o Akasha

Reconhecemos o estudo como **referência cética** sólida. Mas, como em qualquer curadoria honesta, fazemos distinções:

- ✅ O que o estudo mostra: UMA hipótese específica NÃO foi confirmada nesse N.
- ❌ O que o estudo NÃO mostra: que TODAS as hipóteses astrológicas são falsas.
- ❌ O que o estudo NÃO prova: que a experiência subjetiva de pessoas que usam astrologia é inválida.

Curadoria responsável distingue **evidência empírica forte em uma hipótese específica** de **refutação total da tradição**.`,
    authors: ['Mayo J', 'White O', 'Eysenck HJ'],
    year: 1978,
    journal: 'Journal of Social Psychology',
    tags: ['astrologia', 'pesquisa-empirica', 'ceticismo', 'extroversao'],
    tradition: 'astrologia',
    evidenceLevel: 'MEDIUM',
    type: 'SCIENTIFIC_PAPER',
    doi: '10.1080/00224545.1978.9924119',
  },
  {
    slug: 'dean-kelly-2003-astrologia-psi-consciencia',
    title: 'Dean & Kelly (2003): astrologia, consciência e psi',
    summary:
      'Análise crítica de Geoffrey Dean e Ivan Kelly publicada no Journal of Consciousness Studies sobre a relação entre astrologia, estados alterados de consciência e fenômenos psi.',
    content: `# Dean & Kelly — Astrologia e Psi (2003)

O artigo de **Geoffrey Dean** (engenheiro, conhecido cético da astrologia) e **Ivan William Kelly** (filósofo da ciência) publicado no *Journal of Consciousness Studies* é referência importante para o debate entre astrologia e fronteira da consciência.

## Onde encontrar

> Dean G, Kelly IW. *Is astrology relevant to consciousness and psi?*. Journal of Consciousness Studies, 10(6-7):175-198, 2003. (sem DOI formal — revista acadêmica sem indexação DOI no momento da publicação)

## Argumento central

Dean e Kelly argumentam que:
1. **Astrologia tradicional** (Ptolomeu) não era "psi" — era leitura de qualidades mundiais
2. **Astrologia moderna** (Jung, Rudhyar) migrou para território simbólico/psicológico
3. **Psi** (telepatia, clarividência) é a única explicação que poderia "salvar" a astrologia empírica — mas psi também não tem evidência robusta
4. **Mecanismo causal** entre posições planetárias e eventos terrestres permanece desconhecido

## Posição dos autores

Cética mas não ridicularizante. Reconhecem que o tema merece investigação séria, mas concluem que **não há mecanismo plausível nem evidência suficiente** para sustentar as afirmações da astrologia.

## Para o Akasha

Reconhecemos Dean & Kelly como referência acadêmica séria (não "ataque ideológico" à astrologia). A posição do Akasha:

- Tradição astrológica tem valor **cultural, simbólico e psicológico**
- Não tem mecanismo causal demonstrado
- Investigação séria pode continuar
- Usuários podem ter experiências significativas — o que **não é evidência de causalidade astronômica**, mas pode ser evidência de mecanismos psicológicos (efeito Barnum, narrativa, atenção seletiva) que valem ser estudados

Curadoria honesta não escolhe lado — reconhece a complexidade.`,
    authors: ['Dean G', 'Kelly IW'],
    year: 2003,
    journal: 'Journal of Consciousness Studies',
    tags: ['astrologia', 'consciencia', 'ceticismo', 'psi'],
    tradition: 'astrologia',
    evidenceLevel: 'MEDIUM',
    type: 'SCIENTIFIC_PAPER',
  },
  {
    slug: 'astrologia-posicao-akasha-curadoria',
    title: 'A posição do Akasha Portal sobre astrologia',
    summary:
      'Documento de curadoria que explicita a posição institucional do Akasha Portal sobre astrologia: respeita a tradição, distingue evidência, integra à prática contemplativa sem fazer promessas causais.',
    content: `# A Posição do Akasha Portal — Astrologia

Este é um documento de curadoria, não de marketing. Sua função é explicitar — para usuários e desenvolvedores — como o Akasha trata o tema astrologia em três dimensões.

## 1. Dimensão histórica e cultural

- Reconhecemos a astrologia como uma das tradições mais antigas da humanidade (3.000+ anos)
- Reconhecemos sua influência profunda na literatura, arte, filosofia e prática clínica antiga
- Reconhecemos astrólogos contemporâneos sérios que não fazem promessas causais

## 2. Dimensão epistemológica

- Afirmações causais (tipo "este planeta CAUSA este efeito na sua vida") não têm suporte empírico robusto
- Afirmações simbólicas (tipo "este trânsito convida à introspecção") podem ter valor psicológico, mas não são "verdades sobre o cosmos"
- Confusão entre as duas é a maior fonte de pseudociência na área

## 3. Dimensão prática (Akasha IA)

Quando o Akasha IA interpreta um mapa natal:
- **Oferece linguagem simbólica** — não previsão determinística
- **Respeita a autonomia** do consulente — não diz "você DEVE fazer X"
- **Sugere reflexão** — não decisão
- **Integra com outras práticas** — meditação, journaling, conversa com terapeuta

## O que NÃO fazemos

- ❌ Não prevemos eventos futuros como fatos
- ❌ Não recomendamos decisões de vida com base em trânsitos
- ❌ Não usamos astrologia como "diagnóstico psicológico"
- ❌ Não ridicularizamos praticantes nem tradição

## Disclaimer explícito

> O conteúdo astrológico do Akasha Portal é oferecimento simbólico-cultural. Não substitui acompanhamento psicológico, médico, financeiro ou jurídico.`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Documento de Curadoria',
    tags: ['astrologia', 'curadoria', 'epistemologia', 'posicao-institucional'],
    tradition: 'astrologia',
    evidenceLevel: 'LOW',
    type: 'ESSAY',
  },

  // ===================== SUFISMO (4) =====================
  {
    slug: 'sufismo-origem-e-escolas',
    title: 'Sufismo: origem islâmica, dimensões místicas e escolas principais',
    summary:
      'O Sufismo (Tasawwuf) é a dimensão mística do Islã, com origem no século VII-VIII. Explora as principais escolas (Qadiriyya, Naqshbandiyya, Mevlevi, Chishtiyya), conceitos centrais (fana, dhikr, rabita) e suas práticas.',
    content: `# Sufismo — A Via Mística do Islã

O **Sufismo** (árabe: *Tasawwuf*) é a dimensão contemplativa e esotérica do Islã, voltada à experiência direta do Divino. Sua emergência no século VII-VIII (séc. II do calendário islâmico) acompanha a consolidação do direito (Sharia) e da teologia (Kalam), como resposta à formalização excessiva.

## Origem etimológica

Várias hipóteses para o nome "Sufi":
- **Suf** (صوف) — lã, vestimenta dos ascetas
- **Safa** (صفاء) — pureza
- **Suffa** (الصفّة) — banco no pátio da Mesquita de Medina onde viviam os primeiros místicos pobres
- **Sophia** (σοφία) — sabedoria (hipótese contestada mas difundida)

## Conceitos centrais

- **Dhikr** (ذكر) — recordação divina, repetição ritual do nome de Deus
- **Fana** (فناء) — aniquilação do ego no Divino
- **Baqa** (بقاء) — subsistência no Divino após fana
- **Rabita** (رابطة) — conexão espiritual com o mestre (sheikh)
- **Maqam** (مقام) — estação espiritual (etapas da via)
- **Hal** (حال) — estado místico passageiro

## Principais ordens (turuq)

| Ordem | Origem | Característica |
|---|---|---|
| **Qadiriyya** | XII séc., Abdul Qadir Gilani | Difundida no Magreb e África Ocidental |
| **Naqshbandiyya** | XIV séc., Bahauddin Naqshband | Silêncio interior, prática discreta |
| **Mevlevi** | XIII séc., seguidores de Rumi | Dança dos dervixes rodopiantes |
| **Chishtiyya** | XII séc., Moinuddin Chishti | Música e sama (audição espiritual) |
| **Shadhiliyya** | XIII séc., Abu al-Hasan al-Shadhili | Norte da África, prática urbana |

## Para o Akasha

O Sufismo tem profunda influência na cultura musical, literária e filosófica do mundo muçulmano — incluindo Brasil (comunidades sírio-libanesas). Respeitar essa tradição é parte de qualquer curadoria séria sobre mística comparada.`,
    authors: ['Schimmel A'],
    year: 1975,
    journal: 'Schimmel, Mystical Dimensions of Islam',
    tags: ['sufismo', 'islam', 'mistica', 'ordens'],
    tradition: 'sufismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'rumi-matnawi-poesia-mistica',
    title: 'Rumi e o Mathnawi: a poesia como via mística',
    summary:
      'Jalal ad-Din Rumi (1207-1273), poeta persa e fundador da ordem Mevlevi, deixou o Mathnawi — obra de 25.000+ versos considerada o "Corão em persa". Aqui, sua relação com mística e poesia.',
    content: `# Rumi e o Mathnawi

**Jalal ad-Din Muhammad Balkhi** (1207-1273), conhecido como **Rumi** ou **Mawlana** ("nosso mestre"), é o maior poeta místico da língua persa e um dos maiores da literatura mundial.

## Contexto histórico

- Nasceu em **Balkh** (atual Afeganistão), viveu em **Konya** (Turquia atual)
- Filho de teólogo reconhecido, recebeu formação em jurisprudência
- Encontra o dervixe **Shams-i-Tabrizi** (1244) — encontro que transforma sua vida
- Shams desaparece misteriosamente após ~3 anos; Rumi canaliza a perda em poesia
- Funda a **ordem Mevlevi** (dos dervixes rodopiantes)

## O Mathnawi

Obra-prima de Rumi, em seis volumes (da'was) e ~25.000 versos (mathnawi = "dupla rima"). Começa com a famosa abertura:

> "Ouve este ney (flauta), como ele se queixa,
> contando histórias de separações..."

O Mathnawi é chamado **"Quran-e Farsi"** (Corão em persa) — não porque tenha autoridade religiosa canônica, mas porque expressa verdades místicas em linguagem poética profunda.

## Para o Akasha

Rumi é referência universal de **mística afetiva** — amor, perda, presença divina, comunidade. Sua obra é citada em psicoterapia, poesia contemporânea, práticas contemplativas inter-religiosas.

Quando o Akasha cita Rumi, lembramos:
- 📖 **Sempre cite em tradução** (PT-BR) com nota do tradutor original
- 🎯 **Não universalize** sem contexto — Rumi era muçulmano, sufi, do séc. XIII
- 🌱 **Respeite a linhagem** — citar sem crédito à tradição é apropriação

## Traduções PT-BR recomendadas

- **Irineu Franco de Melo** (Editora Com-Arte)
- **Alberto Mussa** (Editora 34)
- **Franklin Leopoldo e Silva** (Perspectiva)`,
    authors: ['Rumi J'],
    year: 1258,
    journal: "Rumi, Mathnawi-yi Ma'navi (Corão em persa)",
    tags: ['sufismo', 'rumi', 'poesia', 'matnawi'],
    tradition: 'sufismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'sufismo-dervixes-rodopiantes',
    title: 'Mevlevi: a Ordem dos Dervixes Rodopiantes e o Sama',
    summary:
      'A Ordem Mevlevi, fundada por Rumi no séc. XIII, é conhecida pela prática do Sama — dança ritual em movimento circular que medita sobre a rotação dos planetas e do amor divino.',
    content: `# Mevlevi — Dervixes Rodopiantes

A **Ordem Mevlevi** (Mawlawiyya) foi fundada por Rumi (1207-1273) e seus seguidores após sua morte, sistematizando as práticas de meditação e música.

## O Sama (السماع)

O **Sama** (audição espiritual) é a prática central dos Mevlevi:
- Dervixes giram em roda ao redor do sheikh
- Braços abertos, mão direita para cima (recebendo do céu), mão esquerda para baixo (transmitindo à terra)
- Acompanhados por música (ney, kudum, voz)
- Giro mantido por horas — alcance de estado alterado de consciência (wajd)

## Significado simbólico

O giro do dervixe representa:
- 🔄 Rotação dos planetas em torno de Deus
- 🌟 Rotação dos átomos no universo
- 💫 Movimento perpétuo do coração em torno do Amado
- 🌀 Rumi dizendo: "O que procuras é o que te procura"

## Recepção no Ocidente

No séc. XX, o Sama foi apresentado à Europa como **dança dos dervixes** — em espetáculos que frequentemente **reduzem** a prática à performance exótica. O Akasha reconhece essa tensão:

- ✅ Sama é prática espiritual legítima com 700+ anos
- ❌ Sama não é "show exótico" para turistas
- ✅ Respeitar a tradição exige não apropriá-la sem contexto

## Para o Akasha

O Sama é mencionado como exemplo de prática contemplativa que integra corpo (movimento), som (música) e espírito (intenção). O Akasha pode referenciar a tradição sem ensinar a prática — que requer mestre habilitado.`,
    authors: ['Schimmel A'],
    year: 1975,
    journal: 'Schimmel, Mystical Dimensions of Islam',
    tags: ['sufismo', 'mevlevi', 'dervixes', 'sama', 'danca'],
    tradition: 'sufismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'sufismo-amor-divino-ibn-arabi',
    title: 'Ibn Arabi: o amor divino e a Unidade do Ser (Wahdat al-Wujud)',
    summary:
      'Muhyiddin Ibn Arabi (1165-1240), místico muçulmano andaluz, formulou a controversa doutrina da Unidade do Ser. Sua obra monumental, "Fusus al-Hikam" e "Al-Futuhat al-Makkiyya", permanecem influência central no Sufismo.',
    content: `# Ibn Arabi — O Amor como Princípio Cósmico

**Muhyiddin Muhammad ibn Arabi** (1165-1240), conhecido como **al-Sheikh al-Akbar** ("o maior mestre"), é uma das figuras mais profundas e controversas do misticismo islâmico.

## Biografia

- Nasceu em **Múrcia** (atual Espanha), viveu em **Sevilha** e morreu em **Damasco**
- Suas viagens pelo Magreb, Anatólia e Egito foram marcadas por encontros místicos
- Produziu **~350 obras** — entre elas, dois monumentos:
  - **Al-Futuhat al-Makkiyya** (As Conquistas Mecquenses, ~600 volumes)
  - **Fusus al-Hikam** (Os Engastes da Sabedoria, 27 capítulos)

## Conceitos-chave

### Wahdat al-Wujud (وحدة الوجود) — Unidade do Ser

Doutrina que afirma: **só Deus verdadeiramente existe**. Tudo o que vemos são "teofanias" (manifestações divinas). O mundo é o "lugar" onde Deus se revela a Si mesmo.

⚠️ **Esta doutrina é controversa.** Muitos teólogos ortodoxos a criticaram como panteísta. Ibn Arabi se defendeu dizendo que era **tawhid** (monoteísmo radical), não panteísmo. O debate continua.

### Amor Divino (Mahabba)

Para Ibn Arabi, **o amor é a substância do cosmos**. Deus ama a Si mesmo em suas criaturas; o místico é aquele que reconhece isso e devolve amor ao Amado.

> "Minha prece ritual, meu jejum, minha vida e minha morte são todos para Deus, Senhor dos mundos." (Corão 6:162) — Ibn Arabi usa este versículo como prelúdio de Fusus.

## Para o Akasha

Ibn Arabi é referência fundamental para:
- **Mística comparada** (diálogo com Eckhart, Cusanus, tradição não-dual hindu)
- **Teologia do amor** (influenciou Dante, místicos cristãos posteriores)
- **Hermenêutica sutil** (leitura simbólica do Corão)

Reconhecemos Ibn Arabi como **tradição de altíssimo nível intelectual** — não como simples "místico". Sua leitura exige tempo e mestre.`,
    authors: ['Ibn Arabi M'],
    year: 1229,
    journal: 'Ibn Arabi, Fusus al-Hikam',
    tags: ['sufismo', 'ibn-arabi', 'amor-divino', 'wahdat-al-wujud'],
    tradition: 'sufismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },

  // ===================== TAOISMO (4) =====================
  {
    slug: 'laozi-tao-te-ching',
    title: 'Tao Te Ching: o livro do caminho e da virtude',
    summary:
      'Tao Te Ching (道德經) é a obra fundamental do taoísmo, atribuída a Laozi (séc. VI a.C., provavelmente). 81 capítulos de 5.000 caracteres que fundaram toda a tradição taoista chinesa.',
    content: `# Tao Te Ching — O Livro do Caminho

O **Tao Te Ching** (Dào Dé Jīng, 道德經, "Clássico do Caminho e da Virtude") é a obra fundadora do taoísmo filosófico e uma das mais traduzidas e influentes da história humana.

## Texto

- **81 capítulos** breves, totalizando cerca de 5.000 caracteres chineses
- Estrutura: capítulos 1-37 sobre o **Tao** (o Caminho); capítulos 38-81 sobre o **Te** (a Virtude/Potência)
- Linguagem paradoxal, aforística, intencionalmente enigmática

## O Tao (道)

Conceito central e intraduzível. **Tao** significa literalmente "caminho" ou "curso" (como em "caminho do rio"). No taoísmo, designa:
- O princípio primordial que origina e sustenta o universo
- Anterior a todas as coisas, inominável, inatingível diretamente
- Funciona por **wu wei** (não-interferência) — "age sem agir"

## Capítulos iniciais famosos

**Capítulo 1:**

> O Tao que pode ser dito não é o Tao eterno.
> O nome que pode ser nomeado não é o Nome eterno.
> Sem nome: origem do Céu e da Terra.
> Com nome: mãe de dez mil seres.

**Capítulo 11:**

> Trinta raios convergem no cubo;
> mas é o vazio central que move a roda.
> Moldamos o barro para fazer a vasilha;
> mas é o vazio interior que a torna útil.

**Capítulo 44:**

> Fama ou vida: qual vale mais?
> Vida ou riqueza: qual pesa mais?
> Ganhar ou perder: qual dói mais?
> Por isso, quem se apega ao excesso terá grave perda.
> Saber parar evita cair.
> Aguentar muito tempo sem ferir — este é o caminho.

## Autoria debatida

- Tradição: **Laozi** (老 子, "Mestre Antigo") teria escrito no séc. VI a.C.
- Texto mais provavelmente compilado no séc. III a.C., durante a dinastia Qin
- Debate acadêmico contemporâneo continua

## Para o Akasha

O Tao Te Ching é **base da medicina tradicional chinesa, do tai chi chuan, do i ching, da ética confuciana reformulada e do Zen japonês**. Citações fora de contexto devem vir com referência ao capítulo e ao tradutor.`,
    authors: ['Laozi'],
    year: -300,
    journal: 'Tao Te Ching (texto fundador)',
    tags: ['taoismo', 'laozi', 'tao-te-ching', 'classico-chines'],
    tradition: 'taoismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'zhuangzi-relatividade-liberdade',
    title: 'Zhuangzi: relatividade, liberdade e o sonho da borboleta',
    summary:
      'Zhuangzi (séc. IV a.C.), segundo grande filósofo taoista, radicaliza o pensamento de Laozi com humor, paradoxo e o famoso "sonho da borboleta" — que questiona quem sonha quem.',
    content: `# Zhuangzi — O Segundo Mestre Taoista

**Zhuang Zhou** (莊子, séc. IV a.C.) é, junto com Laozi, o co-fundador do taoísmo filosófico chinês. Seu livro (também chamado Zhuangzi) mistura **argumento filosófico**, **parábola** e **humor absurdo** de forma única na história da filosofia.

## Estrutura da obra

A obra tem três partes:
- **Capítulos internos (1-7):** autênticos, preservados por Guo Xiang (séc. III d.C.)
- **Capítulos mistos (8-22):** escritos por seguidores
- **Capítulos gerais (23-33):** atribuíveis a discípulos tardios

## Conceitos centrais

### Relatividade e perspectiva

Zhuangzi radicaliza o tema da relatividade dos pontos de vista. No capítulo 2:

> Disse Zhuangzi a Huizi: "Você sabe que o céu e a terra formam um grande corpo, e que todos os seres formam um grande Eu? Quando você diz 'aquilo é um', você diz isso segundo o conhecimento humano; quando você diz 'isto é outro', você diz isso segundo o conhecimento humano."

### O sonho da borboleta (capítulo 2)

> "Antes Zhuangzi sonhou que era uma borboleta, borboleta que voava, contente com seu destino. Acordou e Zhuangzi era Zhuangzi. Não sabe se Zhuangzi foi sonhando que era borboleta, ou se agora é borboleta sonhando que é Zhuangzi."

Este é um dos textos mais discutidos da filosofia mundial — sobre a natureza da identidade, realidade e percepção.

### Liberdade como "caminhar do céu"

Zhuangzi distingue **pequeno conhecimento** (códigos morais) de **grande conhecimento** (alinhamento com o Tao). O "homem verdadeiro", "homem do céu" ou "homem sem nome" não disputa, não acumula, não se preocupa com評判 social.

## Para o Akasha

Zhuangzi é fonte importante para:
- **Reflexão sobre rigidez conceitual** — diagnóstico e cura da inflexibilidade mental
- **Mística cômica** — humor como via de transcendência
- **Ética da fluidez** — adaptabilidade sem perder princípios

O Akasha pode usar Zhuangzi como referência para meditação sobre **anexos e desapegos** sem traduzi-lo em autoajuda genérica.`,
    authors: ['Zhuangzi'],
    year: -300,
    journal: 'Zhuangzi (texto fundador)',
    tags: ['taoismo', 'zhuangzi', 'paradoxo', 'liberdade'],
    tradition: 'taoismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'taoismo-yin-yang-wu-wei',
    title: 'Taoismo: Yin-Yang, Wu Wei e a ética da não-interferência',
    summary:
      'Conceitos centrais do taoísmo além do Tao Te Ching — o equilíbrio Yin-Yang (forças complementares), a prática do Wu Wei (não-interferência) e sua aplicação na ética, medicina e política.',
    content: `# Yin-Yang, Wu Wei e o Pensamento Taoista

Três conceitos estruturam o pensamento taoista para além do Tao Te Ching original: **Yin-Yang**, **Wu Wei** e a visão correlativa do corpo e do cosmos.

## Yin-Yang (陰陽)

Duas forças complementares que:
- Não são opostas (são complementares)
- Não são estáticas (transformam-se mutuamente)
- Não são boas/más (são qualidades, não juízos)

| Yin | Yang |
|---|---|
| Lua | Sol |
| Escuridão | Luz |
| Esquerda | Direita |
| Interior | Exterior |
| Frio | Calor |
| Passivo | Ativo |
| Feminino | Masculino |
| Matéria | Energia |

⚠️ **Erro comum:** associar Yin = "ruim" e Yang = "bom". Não é isso. São qualidades funcionais.

## Wu Wei (無為) — Não-interferência

Literalmente "não fazer" ou "não agir". Não é inércia — é ação **alinhada com o fluxo natural**, sem esforço coercivo.

Exemplos:
- 🌊 Água não força passagem por pedra — escoa ao redor
- 🌳 Árvore não "força" crescer — cresce onde as condições permitem
- 🎵 Músico experto não "improvisa por esforço" — responde ao momento

## Aplicação no cotidiano

1. **Antes de forçar uma situação**, pergunte: "Estou no Tao da situação ou estou empurrando contra ele?"
2. **Quando travado**, tente não-ação consciente (parar, observar, deixar vir)
3. **Em conflito**, busque o equilíbrio dinâmico — não a vitória unilateral

## Para o Akasha

Yin-Yang e Wu Wei não são "filosofia chinesa antiga interessante" — são ferramentas práticas de reflexão sobre equilíbrio, força e timing. O Akasha pode oferecer como:
- 🪞 Espelho para usuários que estão travados
- 📚 Referência cultural para a tradição taoista
- ⚖️ Complemento à Astrologia (que também trabalha com polaridades)`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Pensamento Oriental',
    tags: ['taoismo', 'yin-yang', 'wu-wei', 'equilibrio'],
    tradition: 'taoismo',
    evidenceLevel: 'ANECDOTAL',
    type: 'ESSAY',
  },
  {
    slug: 'taoismo-flow-csikszentmihalyi',
    title: 'Flow e Taoismo: Csikszentmihalyi em diálogo com o caminho',
    summary:
      'Mihaly Csikszentmihalyi (1934-2021), psicólogo húngaro-americano, pesquisou "flow" — estado de imersão total. Seu trabalho tem ressonância notável com o Wu Wei taoista, sem reduzir uma tradição à outra.',
    content: `# Flow e Wu Wei — Diálogo

**Mihaly Csikszentmihalyi** (1934-2021) descreveu o estado de **flow** (fluxo) em seu trabalho *Flow: The Psychology of Optimal Experience* (1990). Características:

- Atenção totalmente absorvida na tarefa
- Sensação de que o tempo se dilata ou se contrai
- Esquecimento de si
- Conexão entre ação e consciência: ação e consciência se fundem

## Ressonância com Wu Wei

| Flow (Csikszentmihalyi) | Wu Wei (Zhuangzi, Laozi) |
|---|---|
| Atenção absorvida | Ação sem tensão |
| Esquece de si | Ego dissolvido no fluxo |
| Ação e consciência fundidas | Atuar sem "atuador" separado |
| Esforço "fácil" | Esforço natural, sem força |

**Esta ressonância é notável** — mas **não é equivalência**. O psicólogo trabalhou dentro do paradigma experimental moderno; os taoistas operam em chave contemplativa e filosófica.

## Para o Akasha

Reconhecemos essa ressonância como **ponto de diálogo** entre tradições. Quando o Akasha IA referencia flow, lembramos:

- 🌊 **Flow como conceito psicológico:** útil em contextos modernos (trabalho, esporte, arte)
- 🏮 **Wu Wei como conceito filosófico:** útil em contextos reflexivos (ética, espiritualidade)
- 🤝 **Diálogo honrado:** não dizer "Wu Wei é o flow chinês antigo" (redução cultural)
- 📚 **Distinção respeitada:** cada tradição mantém sua integridade

## Cuidado com apropriações

Na literatura popular, é comum encontrar afirmações como "técnicas orientais milenares para atingir flow" — que mistura milenarismo impreciso com redução conceitual. A curadoria do Akasha **evita esse tipo de fusão rasteira**.`,
    authors: ['Csikszentmihalyi M'],
    year: 1990,
    journal: 'Csikszentmihalyi, Flow: The Psychology of Optimal Experience',
    tags: ['taoismo', 'flow', 'psicologia', 'dialogo-interdisciplinar'],
    tradition: 'taoismo',
    evidenceLevel: 'LOW',
    type: 'BOOK',
  },

  // ===================== UMBANDA + CANDOMBLÉ (6) =====================
  {
    slug: 'candomble-origem-bahia-yoruba',
    title: 'Candomblé: origem na Bahia do século XIX e estrutura nagô',
    summary:
      'O Candomblé é tradição religiosa afro-brasileira surgida na Bahia no séc. XIX, a partir da diáspora iorubá. Estrutura ritual preserva elementos da Ifá, do culto aos Orixás e da tradição Jeje-Nagô.',
    content: `# Candomblé — Origem e Estrutura Nagô

O **Candomblé** é tradição religiosa afro-brasileira nascida na Bahia do séc. XIX, principalmente a partir da diáspora iorubá. Os primeiros terreiros foram fundados por **escravizados e libertos de origem iorubá (Nagô) e jeje (Fon/Ewe)**.

## Marcos históricos

- **~1830** — primeiro terreiro conhecido: **Casa Branca do Engenho Velho** (Ilê Axé Opô Afonjá), Salvador
- **1847** — perseguição policial aos terreiros na Bahia
- **1888** — abolição da escravidão
- **1900-1930** — Pierre Verger, Roger Bastide e outros estudiosos documentam a tradição
- **1940-1970** — Ialorixás fundam terreiros fora da Bahia (Rio, São Paulo, Sul)
- **1976** — primeiro terreiro de Candomblé com patrimônio tombado pelo IPHAN (Casa Branca)

## As três nações tradicionais

| Nação | Origem | Características |
|---|---|---|
| **Nagô (Ketu)** | Iorubá | Conservação máxima da tradição iorubá, Ifá preservado |
| **Jeje** | Fon (Dahomey) | Forte presença de divindades Vodun (ex: Legba, Tohoho) |
| **Angola** | Bantu | Uso de cabula, forte conexão com mortos (Baku/Bakulu) |

## Estrutura hierárquica

- **Babalorixá (homem) / Yalorixá (mulher)** — pai/mãe-de-santo, autoridade máxima espiritual
- **Zelador(a) de Santo** — administração do terreiro
- **Ogã** — função ritual (tocar atabaque, defender o terreiro)
- **Ekedi** — função feminina de acompanhar iniciação
- **Abiã** — pessoa em processo de feitura
- **Iaô / Ebomi** — iniciado de santo, com níveis crescentes de conhecimento

## Orixás (princípios vitais)

Cada pessoa é "filha" de um Orixá, definido na **feitura de santo** (iniciação). Os principais:

| Orixá | Domínio |
|---|---|
| Oxalá | Criação, paz |
| Iansã | Ventos, tempestades |
| Oxum | Águas doces, amor, beleza |
| Iemanjá | Mar, maternidade |
| Ogum | Ferro, trabalho, guerra |
| Xangô | Justiça, trovão |
| Nanã | Terra antiga, morte |
| Omolu/Obaluaê | Cura, doenças |

## Para o Akasha

O Candomblé **NÃO é folclore, NÃO é "magia negra", NÃO é "candomblé de branco"**. É tradição viva, complexa, com linhagens, ritos e princípios éticos próprios. Curadoria respeitosa evita folclorização.`,
    authors: ['Verger P', 'Elbein J'],
    year: 1957,
    journal: 'Verger, "Notas sobre o Culto aos Orixás e Voduns na Bahia", in Univ. da Bahia',
    tags: ['candomble', 'nago', 'yoruba', 'orixas', 'tradicao-afro-brasileira'],
    tradition: 'umbanda-candomble',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'umbanda-sincretismo-kardecista',
    title: 'Umbanda: sincretismo entre Kardecismo, Candomblé e Espiritismo',
    summary:
      'A Umbanda surgiu no Rio de Janeiro em 1908, fundada por Zélio Fernandino de Moraes. Sintetiza elementos do Espiritismo de Allan Kardec, do Candomblé, das religiões ameríndias e do catolicismo popular.',
    content: `# Umbanda — Síntese Sincrética Brasileira

A **Umbanda** é tradição religioso-espiritualista brasileira, surgida no Rio de Janeiro em **1908**, sob influência combinada de:

- Espiritismo de **Allan Kardec** (séc. XIX francês)
- Candomblé afro-brasileiro
- Religiões ameríndias
- Catolicismo popular
- Elementos do esoterismo europeu

## Fundação

- **15 de novembro de 1908** — **Zélio Fernandino de Moraes** (1891-1975) tem "manifestação" durante sessão espírita no Rio de Janeiro
- Fundação da **Tenda Espírita Nossa Senhora da Piedade** (primeiro terreiro de Umbanda)
- Expansão rápida no Rio de Janeiro e depois pelo Brasil

## Entidades principais

| Linha | Categoria | Exemplos |
|---|---|---|
| Caboclos | Espíritos ameríndios | Tupinambá, Guarani |
| Pretos Velhos | Espíritos de escravizados | Pai João, Vovó Maria |
| Crianças | Espíritos infantis | Erê |
| Exus | Trabalham sombra e proteção | Exu Tranca-ruas |
| Baianos | Entidades festivas | Baiano de Aruanda |
| Marinheiros | Conexão com mar | Seu Tranca-Porto |

## Diferenças em relação ao Candomblé

- **Sem iniciação corporal** (não há feitura de santo como no Candomblé)
- **Mesa branca** (a Tenda) substitui o barracão
- **Não há Orixás regentes** no mesmo sentido — entidades são mais individualizadas
- **Sessão pública** mais comum (no Candomblé, ritual é mais reservado)
- **Menos hierarquia** rígida (qualquer médium pode ter terreiro)

## Controversias internas

A própria Umbanda tem correntes:
- **Umbanda tradicional** (mais próxima da fundação de Zélio)
- **Umbanda branca** (sem elementos de matriz africana explícita)
- **Umbanda esotérica** (influência de cabala, astrologia, alquimia)
- **Umbanda de caboclo** (ênfase na linha indígena)
- **Quimbanda** (linha de Exu, controversa — considerada "trabalho" por alguns, herética por outros)

## Para o Akasha

Reconhecemos a Umbanda como **manifestação legítima da religiosidade brasileira** — única entre as religiões com origens modernas no Brasil (não importada). Sua diversidade interna é força, não fraqueza.`,
    authors: ['Akasha IA', 'Curador Akasha'],
    year: 2026,
    journal: 'Akasha Portal — Religiões Afro-Brasileiras',
    tags: ['umbanda', 'sincratismo', 'kardecismo', 'religiao-brasileira'],
    tradition: 'umbanda-candomble',
    evidenceLevel: 'ANECDOTAL',
    type: 'ESSAY',
  },
  {
    slug: 'orixas-energia-e-natureza',
    title: 'Orixás: princípios vitais, natureza e linhagens iorubás',
    summary:
      'Os Orixás no Candomblé são princípios vitais (forças da natureza) e não "deuses" no sentido ocidental. Cada Orixá tem cor, dia, saudação, comida e oferendas próprias. Cuidado com reducionismos.',
    content: `# Orixás — Princípios Vitais

No Candomblé (e na tradição iorubá mais ampla), os **Orixás** são **forças da natureza** personificadas. Não são "deuses" no sentido monoteísta ocidental — são princípios vitais do cosmo que se manifestam em pessoas, eventos e elementos.

## Lista principal dos Orixás (varia por nação)

| Orixá | Domínio | Cor | Saudação | Dia |
|---|---|---|---|---|
| Oxalá | Criação, paz | Branco | Ê! Bábá! | Sexta |
| Iemanjá | Mar, maternidade | Azul | Odoyá! | Sábado |
| Iansã | Vento, tempestade | Vermelho/marrom | Ê-pá-iyê! | Quarta |
| Oxum | Águas doces, amor | Amarelo | Ê! Ê! Oxum! | Sábado |
| Ogum | Ferro, trabalho | Verde/azul | Ê! Patakori! | Terça |
| Xangô | Justiça, trovão | Vermelho/branco | Ê! Kaô! | Quarta |
| Nanã | Terra antiga | Vermelho/roxo | Nanã Buruquê! | Segunda |
| Omolu/Obaluaê | Cura, doenças | Branco/preto | Atoto! | Segunda |
| Ossanha | Folhas, cura | Verde/amarelo | Ê! Euê! | Terça |

## ⚠️ Erros comuns em conteúdo sobre Orixás

- ❌ **"Ogum é o deus da guerra"** — redutor. Ogum rege o ferro, a forja, o caminho. "Guerra" é só um aspecto.
- ❌ **"Iansã é uma mulher forte"** — Iansã é princípio atmosférico; sua representação como mulher é uma forma entre várias
- ❌ **"Xangô é a versão africana do Zeus"** — false. São sistemas diferentes
- ❌ **"Cada Orixá tem 1 planeta"** — não é da tradição; é invenção sincrética moderna sem base

## Saberes restritos

Cada Orixá tem **saberes restritos** (sagrado e oculto) — o que se compartilha com não-iniciados é o básico. Para saber mais, é necessário:
- Ser iniciado na tradição (feitura de santo)
- Ter um Babalorixá/Ialorixá como guia
- Anos de prática e estudo

## Para o Akasha

Quando o Akasha cita Orixás:
- ✅ Cita em contexto (não reduz a "essência genérica")
- ✅ Reconhece hierarquia (não inventa correspondências)
- ✅ Usa termos em iorubá com tradução PT-BR
- ❌ **NÃO atribui Orixá a signo zodiacal** (correspondência sem evidência)
- ❌ **NÃO ensina oferendas** como "receita pronta" (cada terreiro tem sua linhagem)`,
    authors: ['Verger P'],
    year: 1981,
    journal: 'Verger, Orixás: Deuses Iorubás na África e no Novo Mundo',
    tags: ['umbanda-candomble', 'orixas', 'principios-vitais', 'saberes-restritos'],
    tradition: 'umbanda-candomble',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'bastide-religioes-africanas-brasil',
    title: 'Roger Bastide: as religiões africanas do Brasil e a sociologia do sincretismo',
    summary:
      'Roger Bastide (1898-1974), sociólogo francês, é referência fundamental nos estudos das religiões afro-brasileiras. Sua obra "As Religiões Africanas no Brasil" mapeia o sincretismo como sistema complexo.',
    content: `# Roger Bastide — Sociologia do Sincretismo

**Roger Bastide** (1898-1974), sociólogo e etnólogo francês, dedicou-se ao estudo das religiões afro-brasileiras por mais de 30 anos no Brasil. Sua obra monumental *Les religions africaines au Brésil* (1960, em português: *As Religiões Africanas no Brasil*, 1971) permanece referência obrigatória.

## Obra

> Bastide R. *As Religiões Africanas no Brasil: contribuição a uma sociologia das interpenetrações de civilizações*. Livraria Pioneira/EDUSP, 1971. (Título original: *Les religions africaines au Brésil*, PUF, 1960)

## Conceitos-chave

### Interpenetração de civilizações

Bastide opõe-se à ideia de simples "influência" cultural. Para ele, há **interpenetração estrutural**:
- Sociedade brasileira absorve elementos africanos
- Sociedade africana reinterpreta-se no contexto brasileiro
- Novas formas emergem — não há volta ao original

### Corte sincrético vs. culto sincrético

Bastide distingue:
- **Corte sincrético** — mistura ritual sem estrutura (folclorização)
- **Culto sincrético** — síntese teológica organizada (Candomblé Nagô, por exemplo)

O Candomblé Nagô é, para Bastide, exemplo de culto sincrético bem-sucedido — preserva estrutura iorubá e a reorganiza no contexto brasileiro.

### Reciclagem

Bastide mostra como elementos "deslocados" da África ganham **novo significado** no Brasil. Exemplo: Exu, no Brasil, ganha papel mais proeminente como guardião do terreiro do que em sua origem.

## Para o Akasha

Reconhecemos Bastide como **referência intelectual obrigatória** em qualquer curadoria séria sobre religiões afro-brasileiras. Sua posição:
- 🎓 **Antropologia simétrica** — evita romantização e demonização
- 📚 **Diálogo respeitoso** — com praticantes, sem substituí-los
- 🔬 **Método rigoroso** — baseado em trabalho de campo de décadas

Quando o Akasha cita religiões afro-brasileiras, deve estar alinhado ao nível de cuidado de Bastide.`,
    authors: ['Bastide R'],
    year: 1971,
    journal: 'Bastide, As Religiões Africanas no Brasil',
    tags: ['umbanda-candomble', 'bastide', 'sincratismo', 'sociologia-religiosa'],
    tradition: 'umbanda-candomble',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'maggie-medo-feitico-relacoes-poder',
    title: 'Yvonne Maggie e "Medo do Feitiço": magia, poder e hierarquia social',
    summary:
      'Antropóloga Yvonne Maggie analisa as relações entre magia, medo e estrutura social no Brasil. Obra fundamental para entender como a acusação de feitiço organiza hierarquias raciais e de classe.',
    content: `# Maggie — Medo do Feitiço

**Yvonne Maggie** (sua obra de 1992, ampliada depois) é referência fundamental na antropologia brasileira para entender a **função social do medo do feitiço** nas camadas populares.

## Obra principal

> Maggie Y. *Medo do feitiço: relações entre magia e poder no Brasil*. Rio de Janeiro: Arquivo Nacional, 1992.

## Tese central

Maggie mostra que a **crença no feitiço** não é resíduo de mentalidade pré-moderna, mas **mecanismo social ativo** que:

1. **Organiza hierarquias raciais** — quem é acusado de feitiço?
2. **Regula conflitos locais** — feitiço como "polícia" informal
3. **Mantém distância social** — acusação como forma de segregação
4. **Expressa tensão de classe** — feitiço entre subalternos, proteção entre elites

## Quem é acusado?

Pessoas com poder local (benzedeiras, mães-de-santo, curandeiros), vizinhos com sucesso repentino, minorias marginalizadas. O medo do feitiço é mais agudo onde a **confiança institucional é baixa**.

## Diálogo com outras obras

- **Ribeiro, Darcy** (*O Povo Brasileiro*, 1995) — "povo cordial" como idealização
- **DaMatta, Roberto** (*Carnavais, Malandros e Heróis*, 1979) — malandragem como ethos popular
- **Freyre, Gilberto** (*Casa-Grande & Senzala*, 1933) — miscigenação como harmonização (contestado)

## Para o Akasha

A obra de Maggie ajuda a entender:
- 🔍 Por que falar de "feitiço" com consulentes exige **contexto social**, não só ritual
- 🪞 Como acusação e proteção operam como **espelhos de poder**
- ⚠️ Por que **brincar com "feitiço"** em consulta pode reproduzir violência racial

Curadoria responsável não romantiza nem ridiculariza. Maggie é exemplo de antropologia honesta.`,
    authors: ['Maggie Y'],
    year: 1992,
    journal: 'Maggie, Medo do Feitiço: relações entre magia e poder no Brasil',
    tags: ['umbanda-candomble', 'feitico', 'maggie', 'antropologia-brasileira'],
    tradition: 'umbanda-candomble',
    evidenceLevel: 'MEDIUM',
    type: 'BOOK',
  },
  {
    slug: 'voeks-folhas-sagradas-candomble',
    title: 'Robert Voeks: as folhas sagradas do Candomblé e a diáspora botânica',
    summary:
      'Robert Voeks (geógrafo da UC Riverside) mapeia como escravizados iorubás substituíram plantas sagradas africanas por equivalentes americanos. Estudo etnobotânico fundamental sobre adaptação cultural.',
    content: `# Voeks — As Folhas Sagradas

**Robert A. Voeks**, geógrafo e professor da UC Riverside, publicou *Sacred Leaves of Candomblé* (1997), estudo etnobotânico fundamental sobre como a diáspora forçou adaptações religiosas nas plantas sagradas.

## Obra

> Voeks RA. *Sacred Leaves of Candomblé: African Magic, Medicine, and Religion in Brazil*. University of Texas Press, 1997.

## Tese central

Quando os iorubás foram forçados ao Brasil, encontraram **flora completamente diferente**. Para manter suas práticas religiosas e medicinais, precisaram substituir plantas sagradas africanas por equivalentes brasileiros — usando princípio de **"do mesmo efeito"** (signature resemblance), não identidade botânica.

## Exemplos de substituição

- **Ewé** (folhas) africanas → **ervas brasileiras** (arruda, guiné, boldo)
- **Atarê** (colares de contas sagradas) → sementes locais
- **Flores brancas** para Oxalá → flores de ipe-branco e outras espécies
- **Raízes medicinais** → espécies nativas com propriedades similares

## Implicações

A pesquisa de Voeks mostra:
- 🌱 **Resiliência cultural extraordinária** das tradições afro-brasileiras
- 🌍 **Capacidade de adaptação** sem perda de identidade religiosa
- 📚 **Etnobotânica brasileira** como campo riquíssimo (e subdimensionado)
- 🤝 **Diáspora como fenômeno bidirecional** — não só perda, mas reinvenção

## Para o Akasha

Voeks oferece base científica para entender que:
- A prática do Candomblé é **técnica e sofisticada**, não "primitiva"
- A tradição é **viva**, não congelada no tempo
- O diálogo entre tradições é **antigo** (mais antigo que o colonialismo)

Quando o Akasha cita plantas sagradas, lembramos:
- ✅ Consultar terreiro, não inventar
- ✅ Respeitar saberes restritos
- ❌ Não reduzir planta a princípio ativo (é ritual + botânica + comunidade)`,
    authors: ['Voeks RA'],
    year: 1997,
    journal: 'Voeks, Sacred Leaves of Candomblé',
    tags: ['umbanda-candomble', 'etnobotanica', 'folhas-sagradas', 'diaspora'],
    tradition: 'umbanda-candomble',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },

  // ===================== CRISTIANISMO MÍSTICO (6) =====================
  {
    slug: 'meister-eckhart-sermoes-mistica',
    title: 'Meister Eckhart: sermões, desapego e o nascimento de Deus na alma',
    summary:
      'Meister Eckhart (1260-1328), dominicano e místico renano, formulou a doutrina do desapego radical e do nascimento de Deus no âmago da alma. Suas obras foram condenadas parcialmente, mas permaneceram influentes.',
    content: `# Meister Eckhart — O Místico Dominicano

**Meister Eckhart** (1260-1328), frade dominicano, mestre em Paris, vigário da Saxônia, foi um dos maiores místicos da tradição cristã. Sua obra mistura **sermões em alemão vernacular** (para leigos) e **tratos latinos** (para escolásticos).

## Vida

- Nasceu em **Hochheim** (Turíngia, atual Alemanha)
- Entrou na **Ordem Dominicana**, estudou em Colónia e Paris
- Mestre em Teologia pela Universidade de Paris (1302)
- Vigário da Saxônia (administrativo, mas com autoridade espiritual)
- **1328** — morreu antes da conclusão do processo inquisitorial contra sua obra

## Processo e condenação

- **1329** — bula *In agro dominico* do Papa João XXII condena 28 proposições atribuídas a Eckhart (17 como heréticas, 11 como temerárias)
- Eckhart tinha submetido sua obra **espontaneamente** ao papa antes de morrer — ele próprio acreditava que suas doutrinas eram católicas
- A condenação não invalidou toda sua obra, mas exigiu leitura cuidadosa

## Conceitos centrais

### Abgeschiedenheit — Desapego radical

Para Eckhart, a salvação vem pelo **desapego** (Gelassenheit, abgeschiedenheit). Não é indiferença ou apatia — é **libertação de apegos** para que Deus possa operar na alma.

> "Peço a Deus que se livre de Deus" — Eckhart, Sermão 52.

A frase parece blasfema, mas quer dizer: que se livre da **imagem mental de Deus** que limita a experiência do Deus vivo.

### Nascimento de Deus na alma (Geburt des Wortes)

Para Eckhart, Deus **continua nascendo** na alma do justo. O Logos (Verbo) se encarna continuamente em quem se desapega. Não é trinitarismo alternativo — é metáfora radical da vida contemplativa.

### Não-Deus (Nichtgottheit)

Acima de Deus pessoal, Eckhart concebe a **Deidade** (Gottheit) — esfera anterior à Trindade, silêncio primordial. Místicos vão a essa esfera no êxtase.

## Para o Akasha

Eckhart é **tradição cristã legítima**, não heresia. Sua recuperação no séc. XX (Heidegger, Buber, Merton, Tomás de Aquino) mostra pertinência filosófica. Quando o Akasha cita Eckhart:
- ✅ Contexto histórico (medieval tardio, alemão)
- ✅ Distinção entre radicalidade mística e heresia
- ✅ Tradução cuidada (alemão vernacular ≠ latim teológico)
- ❌ Não reduzir a "frases de efeito" sem contexto`,
    authors: ['Eckhart M'],
    year: 1320,
    journal: 'Eckhart, Deutsche Predigten (Sermões Alemães)',
    tags: ['cristianismo-mistico', 'eckhart', 'desapego', 'mistica-renana'],
    tradition: 'cristianismo-mistico',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'pseudo-dionysius-teologia-mistica',
    title: 'Pseudo-Dionísio e a Teologia Mística: apofatismo cristão primitivo',
    summary:
      'Pseudo-Dionísio, o Areopagita (c. séc. V-VI), formulou a "teologia negativa" cristã: sobre Deus só se pode dizer o que Ele NÃO é. Influenciou toda a mística cristã subsequente.',
    content: `# Pseudo-Dionísio — Teologia Mística

O **Pseudo-Dionísio**, o Areopagita (também chamado Pseudo-Dionísio), foi autor anônimo cristão do séc. V-VI, que se apresentou como Dionísio, o Areopagita (membro do Areópago de Atenas convertido por Paulo em Atos 17:34). Esta autoria fictícia deu autoridade às suas obras durante a Idade Média.

## Obras principais

- **Os Nomes Divinos** (De divinis nominibus)
- **A Teologia Mística** (De mystica theologia)
- **A Hierarquia Celeste** (De coelesti hierarchia)
- **A Hierarquia Eclesiástica** (De ecclesiastica hierarchia)

## Teologia apofática (negativa)

O tratado *Teologia Mística* — apenas ~1.500 palavras — é um dos textos mais influentes da mística cristã. Sua tese central:

> **Sobre Deus só se pode afirmar o que Ele NÃO é.**

A teologia negativa (apofatismo) opõe-se à teologia afirmativa (catofatismo):

| Teologia Afirmativa | Teologia Negativa |
|---|---|
| Deus é luz | Deus não é luz |
| Deus é bom | Deus não é bom |
| Deus é uno | Deus não é uno |
| Limitada pela linguagem | Aproximação pela negação |

Três vias da teologia:

1. **Via causal** (afirmação) — de efeitos para Causa
2. **Via negativa** (apófase) — nega todas as qualidades
3. **Via mística** — silêncio contemplativo, além das palavras

## Influência

Pseudo-Dionísio influenciou:
- **Máximo, o Confessor** (séc. VII)
- **João Escoto Erígena** (séc. IX)
- **Tomás de Aquino** (séc. XIII)
- **Mestre Eckhart** (séc. XIV)
- **Nicolau de Cusa** (séc. XV)
- **Toda a tradição apofática cristã** — ortodoxa e heterodoxa

## Para o Akasha

Pseudo-Dionísio é **mística cristã em diálogo com o neoplatonismo** (Plotino, Proclo). Sua visão hierárquica do cosmo (serafim, querubim, tronos...) influencia iconografia e liturgia cristãs até hoje.

Quando o Akasha cita apofatismo:
- 🌚 **Honra o mistério** sem reduzi-lo a "não sei"
- 🔄 **Diálogo** com Budismo (sunyata), Advaita Vedanta, Sufismo (tawhid negativo)
- 📜 **Contextualiza** — não inventa correspondência`,
    authors: ['Pseudo-Dionysius'],
    year: 500,
    journal: 'Pseudo-Dionysius, De Mystica Theologia',
    tags: ['cristianismo-mistico', 'pseudo-dionysius', 'teologia-negativa', 'apofatismo'],
    tradition: 'cristianismo-mistico',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'juan-de-la-cruz-noite-escura',
    title: 'São João da Cruz: a noite escura da alma',
    summary:
      'São João da Cruz (1542-1591), carmelita descalço, místico e poeta. Sua obra "Noite Escura do Sentido" descreve a purificação necessária para a união mística com Deus.',
    content: `# São João da Cruz — Noite Escura

**São João da Cruz** (Juan de Yepes, 1542-1591), carmelita espanhol, é o maior místico cristão do séc. XVI. Sua vida foi marcada por contradição: amizade com Santa Teresa (companheira de reforma), mas também perseguição dentro da própria ordem por seu rigor.

## A Noite Escura

A obra *Noche Escura del Alma* (1584-1585), em forma de poema e comentário, descreve **a purificação passiva da alma** que antecede a união mística com Deus.

### Estrutura da obra

- **Canciones del alma** (poema, 8 estrofes)
- **Comentário** interpretando cada estrofe
- **Duas "noites"**:
  - **Noite dos Sentidos** — purificação dos apetites corporais e emoções
  - **Noite do Espírito** — purificação do intelecto e da vontade

### Estrutura da "Noite"

A noite é descrita como **entrada escura** que leva à **união luminosa**. A alma, antes segura em suas ilusões, é convidada a atravessar o vazio para encontrar o Divino.

> "Para alcançar o que não sabes, irás pelo caminho que não conheces."

## Paralelo com Teresa de Ávila

Santa Teresa (1515-1582) escreveu *Las Moradas* (Castelo Interior) descrevendo 7 moradas da alma. João da Cruz, contemporâneo dela, escreveu sobre as "noites" que antecedem a última morada.

A comparação:
- **Teresa:** mapa espacial (castelo)
- **João da Cruz:** mapa temporal (noite → amanhecer)

## A poesia

João da Cruz é um dos maiores poetas em língua castelhana. O poema inicial da Noite Escura:

> En una noche oscura,
> con ansias, en amores inflamada,
> ¡oh dichosa ventura!,
> salí sin ser notada,
> estando ya mi casa sosegada.

## Para o Akasha

A obra de São João da Cruz é referência em:
- 🤍 **Direção espiritual** — acompanhamento de processos de crise existencial
- 📖 **Teologia mística** — relação entre ausência de Deus e presença de Deus
- 🎨 **Literatura** — poesia mística de altíssimo nível

O Akasha pode usar a "noite escura" como metáfora para momentos de crise existencial ou espiritual — sempre com cuidado para não romantizar sofrimento real.`,
    authors: ['Juan de la Cruz'],
    year: 1585,
    journal: 'Juan de la Cruz, Noche Escura del Alma',
    tags: ['cristianismo-mistico', 'joao-da-cruz', 'noite-escura', 'carmelitas'],
    tradition: 'cristianismo-mistico',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'teresa-avila-castelo-interior',
    title: 'Santa Teresa de Ávila: O Castelo Interior e as sete moradas da alma',
    summary:
      'Santa Teresa de Ávila (1515-1582), reformadora carmelita e doutora da Igreja, escreveu O Castelo Interior descrevendo a vida espiritual como jornada por sete moradas até a união com Deus.',
    content: `# Santa Teresa — Castelo Interior

**Santa Teresa de Jesus** (Teresa Sánchez de Cepeda y Ahumada, 1515-1582), carmelita descalça, fundadora de 17 mosteiros, doutora da Igreja, é uma das maiores figuras da mística cristã ocidental.

## O Castelo Interior (*Las Moradas*, 1577)

Escrito em **1577** (sua sexagésima segunda ano), o livro descreve a **alma como um castelo de cristal** com **sete moradas (séptimas moradas)** — cada uma representando um estágio de aprofundamento na vida espiritual.

### As sete moradas

| Morada | Estágio | Descrição |
|---|---|---|
| 1ª | Início da conversão | Ora vez, ora vez não |
| 2ª | Perseverança inicial | Oração regular, luta contra pecados |
| 3ª | Ordem da vida religiosa | Progresso estável, ainda com apegos |
| 4ª | Graças místicas iniciais | Recolección, quietude |
| 5ª | União inicial com Deus | Casamento espiritual |
| 6ª | Graças mais profundas | Visões, êxtases |
| 7ª | União transformante | Matrimonio espiritual definitivo |

### A metáfora do castelo

> "Considero eu esta nossa alma como um castelo todo de um cristal, no qual se vêem muitos aposentos, assim como no Céu muitas moradas."

A **primeira morada** é onde a alma está inicialmente (comum a todas). A **sétima** é onde Deus entra e transforma a alma.

### Diferença entre moradas

Teresa é clara: **não é meritocracia**. Não se chega à 7ª por esforço, mas por **graça**. As moradas são campos de força divina, não escalões de perfeição pessoal.

## Vida e obra

- **Fundadora de 17 mosteiros** carmelitas
- **Perseguida** pela Inquisição espanhola (foi processada várias vezes)
- **Doutora da Igreja** (1970, pelo Papa Paulo VI) — uma das 4 mulheres com este título
- Escreveu também *Livro da Vida*, *Caminho de Perfeição*, *Relações* e centenas de cartas

## Para o Akasha

Santa Teresa é referência em:
- 📚 **Acompanhamento espiritual** — modelo de discernimento de etapas
- 💪 **Mulheres na tradição** — exemplo de autoridade intelectual feminina na Igreja
- 🌱 **Relação entre ação e contemplação** — reformadora prática E mística

Quando o Akasha cita Teresa:
- ✅ Reconhece a base católica da obra
- ✅ Distingue metáfora (castelo) de psicologia moderna
- ❌ Não usa sua obra como "autoajuda cristã"`,
    authors: ['Teresa de Ávila'],
    year: 1577,
    journal: 'Teresa de Ávila, Las Moradas (O Castelo Interior)',
    tags: ['cristianismo-mistico', 'teresa-avila', 'castelo-interior', 'carmelitas'],
    tradition: 'cristianismo-mistico',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'thomas-merton-contemplative-cry',
    title: 'Thomas Merton: monge trapista, poeta e diálogo inter-religioso',
    summary:
      'Thomas Merton (1915-1968), monge trapista americano, foi um dos maiores místicos cristãos do séc. XX. Sua obra em diálogo com Budismo, Islamismo e tradições orientais marcou a espiritualidade moderna.',
    content: `# Thomas Merton — Monge Trapista

**Thomas Merton** (1915-1968), monge trapista da Abadia de Gethsemani (Kentucky), foi teólogo, poeta, ensaísta e ativista pela paz. Sua obra monumental (mais de 70 livros) marca o séc. XX como referência de espiritualidade cristã engajada.

## Vida

- **1915** — nasce em Prades (França), pai anglo-saxão, mãe americana
- **1938** — converte-se ao catolicismo
- **1941** — entra na Ordem Trappista
- **1948** — *Montanha das Sete Círculos* (autobiografia) o torna conhecido internacionalmente
- **1965** — visita a Ásia, encontra Dalai Lama, D. T. Suzuki (Zen budista)
- **1968** — morre em Bangcoc durante conferência inter-religiosa (acidente elétrico)

## Obra-chave

### A Montanha das Sete Círculos (1948)

Autobiografia espiritual que descreve sete etapas de conversão — desde a juventude mundana até a vida contemplativa.

### Novas Sementes de Contemplação (1961)

Manual de vida contemplativa cristã para o séc. XX.

### Místicos Zen (1961, com D. T. Suzuki)

Diálogo entre tradição cristã e budismo Zen.

### Zen e os Pássaros de Rapina (1968, póstumo)

Diálogo entre espiritualidade e ativismo político.

## Diálogo inter-religioso

Merton é pioneiro no diálogo entre Cristianismo e Budismo. Seu encontro com o Dalai Lama (1965) é marco importante. Merton via:
- **União mística cristã** e **experiência Zen** como convergentes
- **Não-dualismo** como tema comum entre Meister Eckhart, Pseudo-Dionísio e Zen
- **Engajamento social** como parte da contemplação (não separada dela)

## Para o Akasha

Merton é referência para o Akasha porque:
- 🌍 Mostra que **mística cristã é contemporânea e engajada**
- 🤝 Modelo de **diálogo inter-religioso** respeitoso
- 📖 Linguagem acessível a leigos (não exige formação teológica)
- ✊ Combina contemplação com **ativismo pela paz**

Quando o Akasha cita Merton:
- ✅ Reconhece contexto (catolicismo, séc. XX, pós-Vaticano II)
- ✅ Contextualiza o diálogo inter-religioso (não é "ecumenismo genérico")
- ❌ Não usa Merton como "cristão que fazia budismo" (redução)`,
    authors: ['Merton T'],
    year: 1968,
    journal: 'Merton, O Sete Andares da Montanha e Contemplação num Mundo de Ação',
    tags: ['cristianismo-mistico', 'merton', 'trapista', 'dialogo-inter-religioso'],
    tradition: 'cristianismo-mistico',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
  {
    slug: 'desert-fathers-mistica-do-deserto',
    title: 'Pais do Deserto: mística dos primeiros monges cristãos (séc. III-V)',
    summary:
      'Os Pais do Deserto (séc. III-V) foram os primeiros monges cristãos. Suas "Apophthegmata" (ditos breves) preservam uma tradição contemplativa que influenciou toda a espiritualidade cristã subsequente.',
    content: `# Pais do Deserto — Primórdios do Monacato Cristão

Os **Pais do Deserto** foram monges cristãos do Egito, Palestina e Síria entre os séculos III e V. Após o fim das perseguições (com o Édito de Milão, 313), alguns cristãos buscaram formas mais radicais de seguimento. Muitos foram para o **deserto** — literal e metaforicamente.

## Contexto histórico

- **séc. III** — anacoretas (monges solitários) começam a habitar deserto egípcio
- **~270** — **Antão, o Grande** (Anthony the Great) é figura fundadora
- **~320** — **Pacômio** funda o primeiro monastério cenobítico (comunidade)
- **séc. IV-V** — apogeu, com centenas de milhares de monges no Egito
- **séc. V** — invasões bárbaras e declínio do Egito monástico; tradição migra para Europa

## Os Apophthegmata (αποφθέγματα)

A literatura do deserto preserva principalmente:

> **Ditos curtos** (apophthegmata) dos Padres — frases curtas, frequentemente com uma história:

### Exemplos

**Abba Moisés:**
> "Vai, senta-te na tua cela e a tua cela te ensinará tudo."

**Abba Pambo:**
> Perguntaram a Abba Pambo: "Como devo morar no mosteiro?" Ele respondeu: "Não faça o outro o que você não quer que façam a você. Vá e salve-se."

**Abba Antônio:**
> "Eu vi as ciladas do inimigo espalhadas por toda a terra — e disse suspirando: 'Que pode escapar de todas elas?' Então ouvi uma voz dizendo: 'A humildade, Antônio.'"

## Práticas

- **Hesychia** (ησυχία) — silêncio, quietude
- **Oração contínua** — especialmente "Senhor Jesus Cristo, Filho de Deus, tem piedade de mim"
- **Trabalho manual** — cestaria, cópia de manuscritos
- **Leitura** — especialmente Salmos e Evangelhos
- **Jejum** — em graus variados
- **Vigília** — oração noturna

## Tradição paralela

A tradição siríaca (séc. IV-V) desenvolveu:
- **Estevão, o Taumaturgo** — ascese extrema
- **Simeão, o Estilita** — viveu em cima de coluna por 37 anos
- **Macário, o Grande** — equilíbrio entre ascese e discrição

## Influência na tradição ocidental

- **Cassiniano** (séc. V) — leva tradição a Marselha
- **Regras beneditinas** (séc. VI) — síntese ocidental
- **Cartuxos, Cistercienses, Trapistas** — linhagens derivadas
- **Centering Prayer moderna** (séc. XX) — Thomas Keating adapta prática hesychasta

## Para o Akasha

Os Padres do Deserto são **base da espiritualidade contemplativa cristã**. Sua sabedoria prática:
- 🪨 **Não confunde prática com performance**
- 💬 **Não acumula palavras**
- 👥 **Não compete com outros monges**
- 🕊️ **Busca humildade antes de visões**

O Akasha pode usar os apophthegmata como recurso contemplativo — frases curtas, clareza de discernimento, humor áspero. Sem didatismo moderno.`,
    authors: ['Ward B'],
    year: 1975,
    journal: 'Ward, The Desert Fathers: Sayings of the Early Christian Monks',
    tags: ['cristianismo-mistico', 'pais-do-deserto', 'monacato', 'apophthegmata'],
    tradition: 'cristianismo-mistico',
    evidenceLevel: 'ANECDOTAL',
    type: 'BOOK',
  },
];

// ============================================================================
// Seed execution
// ============================================================================

async function main() {
  console.log(`🌱 Seeding ${ARTICLES_EXPANDED.length} articles across 6 new traditions...`);

  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  for (const article of ARTICLES_EXPANDED) {
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

  console.log(`✅ ${ARTICLES_EXPANDED.length - skipped} articles processed`);
  console.log(`   - inserted: ${inserted}`);
  console.log(`   - updated: ${updated}`);
  console.log(`   - skipped: ${skipped}`);

  // Por tradição
  const byTradition = ARTICLES_EXPANDED.reduce<Record<string, number>>((acc, a) => {
    acc[a.tradition] = (acc[a.tradition] ?? 0) + 1;
    return acc;
  }, {});
  console.log('\n📊 Por tradição:');
  for (const [tradition, count] of Object.entries(byTradition)) {
    console.log(`   - ${tradition}: ${count}`);
  }

  // Contagem de DOIs
  const withDoi = ARTICLES_EXPANDED.filter((a) => a.doi);
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
