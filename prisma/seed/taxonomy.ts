// ============================================================================
// Akasha Portal — Taxonomy (Wave 11, 2026-06-27)
// ============================================================================
// Hierarquia estruturada usada pela curadoria para classificar artigos.
//
// Dimensões:
//   1. Tradição (12 níveis — espelha + amplia os slugs de Group)
//   2. Tema (categorias transversais por tipo de conteúdo)
//   3. Nível de profundidade (intro / intermediário / avançado)
//   4. Formato (artigo / prática / reflexão / estudo de caso)
//
// Filosofia editorial (Iyá, 2026-06-27):
//   - Tradições são VIVAS, não bancos de dados. Cada entrada inclui nota
//     de origem, contexto cultural e nível de confiança.
//   - Temas permitem navegação transversal (ex: "meditação" aparece em
//     tantra, budismo, sufismo, cabala — todos precisam do mesmo descritor).
//   - Nível usa 3 camadas (não 5) para reduzir ansiedade no leitor.
//   - Formato sinaliza intenção editorial — prática ≠ ensaio.
//
// Esta taxonomia é usada por:
//   - Artigos (cada artigo declara tradition + temas + level + format)
//   - Busca facetada na UI
//   - Recomendações semânticas (embeddings agrupam por formato)
//   - Auditoria de cobertura (gap analysis)
//
// Mudanças desde Wave 10:
//   + Inclusão de 5 tradições NOVAS (ayurveda, numerologia, gnosticismo,
//     xintoismo, wicca-paganismo)
//   + Tema novo: "etica" (vinha diluído em "filosofia")
//   + Tema novo: "neurociencia" (wave 11 prioriza diálogo ciência↔tradição)
//
// Refs:
//   - docs/GLOSSARY.md (termos sensíveis PT-BR)
//   - docs/DIVERGENCES.md (divergências entre tradições)
//   - docs/EVIDENCE-MAP.md (mapeamento de níveis de evidência)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. TRADIÇÕES (12+)
// ----------------------------------------------------------------------------
// Critério de inclusão:
//   - Tradição com prática viva documentada OU
//   - Sistema simbólico com linhagem rastreável OU
//   - Corpo teórico organizado em textos fundacionais
// Exclui: sistemas do "neo-esoterismo" sem linhagem (New Age genérico)

export const TRADITIONS = [
  {
    slug: 'cabala',
    name: 'Cabala & Árvore da Vida',
    family: 'misticismo-judaico',
    origin: 'Misticismo judaico medieval (Sefarad, Provença, século XII)',
    confidence: 'high' as const,
    notes:
      'Tradição textual sólida (Zohar, Etz Chaim). Curadoria respeita distinção entre Cabala teórica e Cabala prática/meditativa. Artigos sempre citam fonte primária quando disponível.',
    groupSlug: 'cabala',
  },
  {
    slug: 'ifa',
    name: 'Ifá & Tradição Iorubá',
    family: 'yoruba-tradicional',
    origin: 'Iorubá (Nigeria/Benin), mantido por babalaôs iniciados',
    confidence: 'high' as const,
    notes:
      'Sistema de 16 Odus (+ 240 secundários) com Ifá-literature oral. Co-autoria com babalaôs é mandatória para conteúdo sensível (Odu Iwori, Odi, etc). Akasha NÃO substitui consulta com babalaô.',
    groupSlug: 'ifa',
  },
  {
    slug: 'umbanda-candomble',
    name: 'Umbanda & Candomblé',
    family: 'religioes-afro-brasileiras',
    origin: 'Brasil, séculos XIX-XX, raízes iorubá, banto, jeje, ameríndias, cristãs',
    confidence: 'high' as const,
    notes:
      'Distinção crítica: Umbanda (sincrética, múltiplas linhas) ≠ Candomblé (nação, linhagem iorubá). Curadoria nunca trata como "sinônimos" ou variações da "mesma coisa".',
    groupSlug: 'umbanda',
  },
  {
    slug: 'astrologia',
    name: 'Astrologia Ocidental & Tropical',
    family: 'tradições-simbolicas-ocidentais',
    origin: 'Mesopotâmia, helenizada, sistematizada no Renascimento',
    confidence: 'medium' as const,
    notes:
      'Curadoria reconhece uso simbólico/contemplativo. Posição institucional: NÃO afirma correspondências causais (não é astronomia). Wave 9 adicionou artigos sobre ceticismo empírico (Mayo et al.).',
    groupSlug: 'astrologia',
  },
  {
    slug: 'tantra',
    name: 'Tantra & Yoga',
    family: 'tradições-indias',
    origin: 'Índia, séculos V-XII; inclui Kashmir Shaivismo, Shakta, Vajrayana',
    confidence: 'high' as const,
    notes:
      'Tantra NÃO é sinônimo de sexo sagrado. Termo abrange ritual, filosofia, meditação, yoga. Sexo tântrico é UMA prática (Tantra Kaula), não a totalidade.',
    groupSlug: 'tantra',
  },
  {
    slug: 'reiki',
    name: 'Reiki (Sistema Usui)',
    family: 'cura-energetica-moderna',
    origin: 'Japão, Mikao Usui, 1922',
    confidence: 'medium' as const,
    notes:
      'Sistema moderno (séc. XX) com linhagem rastreável (Usui → Hayashi → Takata →分校). Não confundir com "cura energética genérica". Evidência científica limitada mas não nula.',
    groupSlug: 'reiki',
  },
  {
    slug: 'meditacao',
    name: 'Meditação & Mindfulness',
    family: 'praticas-contemplativas',
    origin: 'Múltipla (Vipassana indiana, Zazen japonês, oração cristã, dhikr islâmico)',
    confidence: 'high' as const,
    notes:
      'Categoria transversal — aparece como subprática em várias tradições. Curadoria marca SEMPRE a tradição de origem (Vipassana ≠ mindfulness secular).',
    groupSlug: 'meditacao',
  },
  {
    slug: 'xamanismo',
    name: 'Xamanismo & Plantas Sagradas',
    family: 'tradições-indigenas-globais',
    origin: 'Praticado em culturas distintas (Siberia, Américas, África, Ásia)',
    confidence: 'high' as const,
    notes:
      'Categoria guarda-chuva. Akasha distingue: xamanismo indígena (com transmissão) vs. neo-xamanismo ocidental (praticado sem linhagem). Plantas sagradas sempre com contexto ritual.',
    groupSlug: 'xamanismo',
  },
  {
    slug: 'cristianismo-mistico',
    name: 'Cristianismo Místico',
    family: 'misticismo-cristao',
    origin: 'Cristianismo, séculos IV-XX (Deserto, Renânia, Carmelo)',
    confidence: 'high' as const,
    notes:
      'Mística cristã institucional tem textos fundacionais (Eckhart, Pseudo-Dionísio, João da Cruz, Teresa). Curadoria respeita distinção entre mística e Teologia da Libertação (não são sinônimos).',
    groupSlug: 'cristianismo-mistico',
  },
  {
    slug: 'sufismo',
    name: 'Sufismo — Caminho do Coração',
    family: 'mistica-islamica',
    origin: 'Islam, séculos VIII-XX (Rumi, Ibn Arabi, ordens Mevlevi, Qadiriyya)',
    confidence: 'high' as const,
    notes:
      'Mística islâmica com linhagens sufis (tariqas). NÃO confundir com islã mainstream (que pode ser crítica). Curadoria respeita distinção entre sufismo popular vs. esotérico.',
    groupSlug: 'sufismo',
  },
  {
    slug: 'taoismo',
    name: 'Taoísmo & Filosofia Oriental',
    family: 'tradições-chinesas',
    origin: 'China, século VI a.C. (Laozi) → séc. XX (Yijing, Neidan)',
    confidence: 'high' as const,
    notes:
      'Taoísmo religioso (quanzhen, zhengyi) ≠ taoísmo filosófico (Tao Te Ching) ≠ alquimia interna (Neidan). Curadoria marca qual vertente.',
    groupSlug: 'taoismo',
  },
  // ===================== TRADIÇÕES NOVAS (Wave 11) =====================
  {
    slug: 'hinduismo',
    name: 'Hinduísmo & Tradições Védicas',
    family: 'tradições-indias',
    origin: 'Índia, Vedic → Upanishadic → Bhakti → Tantra (4.000+ anos)',
    confidence: 'high' as const,
    notes:
      'Tradução como "hinduísmo" é convenção ocidental. Sistema inclui 6 darshanas (escolas filosóficas), Bhagavad Gita, Upanishads, Puranas, Tantra. Wave 11 marca início da cobertura.',
    groupSlug: 'hinduismo',
  },
  {
    slug: 'budismo',
    name: 'Budismo (Theravada, Mahayana, Vajrayana)',
    family: 'tradições-indias',
    origin: 'Índia, séc. V a.C. (Buda histórico)',
    confidence: 'high' as const,
    notes:
      '3 veículos principais. Akasha marca SEMPRE o veículo (Theravada ≠ Mahayana ≠ Vajrayana em liturgia, soterologia, ética). Cobertura Wave 11.',
    groupSlug: 'budismo',
  },
  {
    slug: 'judaísmo-místico',
    name: 'Judaísmo Místico (Hasidismo, Merkavah, Gematria)',
    family: 'misticismo-judaico',
    origin: 'Merkavah (Talmud, séc. III) → Cabala provençal (séc. XII) → Luria (séc. XVI) → Hasidismo (séc. XVIII)',
    confidence: 'high' as const,
    notes:
      'Distingue de Cabala "pura" (que é uma vertente). Inclui Merkavah, Shiur Komah, Hasidismo de Baal Shem Tov, Gematria. Wave 11 expande de 2 → 5 artigos.',
    groupSlug: null, // ainda sem grupo dedicado — TBD em wave futura
  },
  {
    slug: 'espiritualidade-contemporanea',
    name: 'Espiritualidade Contemporânea (Integral, Ubuntu, pós-religioso)',
    family: 'pensamento-contemporaneo',
    origin: 'Séculos XX-XXI (Wilber, Gebser, Taylor, Tutu)',
    confidence: 'medium' as const,
    notes:
      'Categoria híbrida para filosofias não-religiosas que dialogam com tradições. Curadoria marca SEMPRE autor/corrente (Wilber ≠ Gebser ≠ Ubuntu). Wave 11.',
    groupSlug: null,
  },
  {
    slug: 'ciencia-pontes',
    name: 'Pontes Ciência ↔ Tradição',
    family: 'epistemologia-integrativa',
    origin: 'Séc. XX-XXI (neurociência contemplativa, psicologia transpessoal, etnobotânica)',
    confidence: 'high' as const,
    notes:
      'Categoria editorial (não tradição religiosa). Artigos com DOIs verificados. Distingue: HIGH (RCTs, meta-análise) / MEDIUM (estudos abertos, séries de casos) / LOW (relatos, hipóteses).',
    groupSlug: null,
  },
  {
    slug: 'ayurveda',
    name: 'Ayurveda — Medicina Tradicional Indiana',
    family: 'sistemas-medicos-tradicionais',
    origin: 'Índia, Vedic → Charaka Samhita (séc. II a.C. - II d.C.)',
    confidence: 'high' as const,
    notes:
      'Sistema médico com textos fundacionais (Charaka, Sushruta). NÃO é "medicina alternativa genérica". Tem epistemologia própria (tridosha, prakriti, ojas). Wave 11 NOVA.',
    groupSlug: null,
  },
  {
    slug: 'numerologia',
    name: 'Numerologia (Cabalística, Pitagórica, Tântrica)',
    family: 'sistemas-simbolicos-numericos',
    origin: 'Múltipla (Pitágoras séc. VI a.C., Gematria hebraica, tradições tântricas indianas)',
    confidence: 'medium' as const,
    notes:
      'Curadoria distingue 3 escolas: Pitagórica (ocidental), Cabalística (hebraica, método Cigano Ramiro), Tântrica (indiana, chakras). NÃO confundir com "numerologia de horóscopo". Wave 11 NOVA.',
    groupSlug: null,
  },
  {
    slug: 'gnosticismo',
    name: 'Gnosticismo & Tradições Cristãs Primitivas',
    family: 'cristianismo-primitivo',
    origin: 'Séc. I-III d.C. (Nag Hammadi, Ofitas, Setianos, Valentinianos)',
    confidence: 'high' as const,
    notes:
      'Movimento diverso (Valentiniano ≠ Ofita ≠ Setiano). Curadoria distingue: Gnosticismo cristão (séc. I-III) vs. Gnosticismo ocidental moderno (Blavatsky, Hodgson). Wave 11 NOVA.',
    groupSlug: null,
  },
  {
    slug: 'xintoismo',
    name: 'Xintō — Caminho dos Kami',
    family: 'religiao-japonesa-nativa',
    origin: 'Japão, pré-histórico → kodai (séc. VIII)',
    confidence: 'high' as const,
    notes:
      'Religião nativa japonesa, politeísta, sincrética com Budismo (Shinbutsu-shūgō). NÃO é "animismo genérico". Tem literatura (Kojiki, Nihon Shoki), prática ritual (matsuri), e xintoísmo estatal (Jinja Honcho). Wave 11 NOVA.',
    groupSlug: null,
  },
  {
    slug: 'wicca-paganismo',
    name: 'Wicca & Paganismo Moderno',
    family: 'neopaganismo-ocidental',
    origin: 'Inglaterra, séc. XX (Gerald Gardner, 1954) → Doreen Valiente → Starhawk',
    confidence: 'medium' as const,
    notes:
      'Movimento neopagão do séc. XX, inspirado em folclore europeu pré-cristão. Curadoria distingue: Wicca Gardneriana (linhagem iniciática) vs. Wicca Eclectica (sem linhagem) vs. Paganismo genérico. Wave 11 NOVA.',
    groupSlug: null,
  },
] as const;

export type TraditionSlug = (typeof TRADITIONS)[number]['slug'];

// ----------------------------------------------------------------------------
// 2. TEMAS (transversais às tradições)
// ----------------------------------------------------------------------------
// Critério: tema deve ser identificável em 3+ tradições diferentes.
// Cada tema tem slug canônico + descrição + exemplos.

export const THEMES = [
  {
    slug: 'meditacao',
    name: 'Meditação',
    description: 'Práticas de atenção plena, visualização, contemplação.',
    examples: ['vipassana', 'zazen', 'kavanah', 'yoganidra', 'oratio', 'smrti'],
    traditions: ['cabala', 'budismo', 'hinduismo', 'tantra', 'sufismo', 'cristianismo-mistico'],
  },
  {
    slug: 'ritual',
    name: 'Ritual & Cerimônia',
    description: 'Práticas cerimoniais estruturadas (sacramento, ebó, matsuri, puja, gira).',
    examples: ['matsuri', 'puja', 'ebó', 'sacramento', 'gira'],
    traditions: ['ifa', 'umbanda-candomble', 'xintoismo', 'cristianismo-mistico', 'hinduismo'],
  },
  {
    slug: 'etica',
    name: 'Ética & Comportamento',
    description: 'Códigos de conduta, virtues, ética situacional.',
    examples: ['dharma', 'mitzvot', 'shariah', 'ubuntu', 'yamas-niyamas'],
    traditions: ['hinduismo', 'budismo', 'judaísmo-místico', 'sufismo', 'cristianismo-mistico', 'espiritualidade-contemporanea'],
  },
  {
    slug: 'filosofia',
    name: 'Filosofia & Metafísica',
    description: 'Sistemas de pensamento sobre realidade, consciência, ser.',
    examples: ['advaita', 'wahdat-al-wujud', 'apofatismo', 'trikaya'],
    traditions: ['hinduismo', 'budismo', 'sufismo', 'cabala', 'cristianismo-mistico', 'taoismo'],
  },
  {
    slug: 'pratica',
    name: 'Prática & Técnica',
    description: 'Exercícios, técnicas, instruções reproduzíveis.',
    examples: ['asana', 'pranayama', 'kirtan', 'dhikr', 'kundalini'],
    traditions: ['tantra', 'hinduismo', 'sufismo', 'cabala', 'meditacao'],
  },
  {
    slug: 'historia',
    name: 'História da Tradição',
    description: 'Origens, desenvolvimento, figuras-chave, contexto.',
    examples: ['origens', 'reforma', 'expansao', 'repressao'],
    traditions: ['cabala', 'ifa', 'cristianismo-mistico', 'sufismo', 'xintoismo', 'hinduismo', 'budismo'],
  },
  {
    slug: 'neurociencia',
    name: 'Neurociência & Diálogo Científico',
    description: 'Estudos de neuroimagem, RCTs, revisões sistemáticas em práticas tradicionais.',
    examples: ['neuroimagem', 'rct', 'meta-analise', 'psicodelico'],
    traditions: ['meditacao', 'xamanismo', 'reiki', 'ciencia-pontes', 'tantra'],
  },
  {
    slug: 'psicologia',
    name: 'Psicologia & Desenvolvimento Humano',
    description: 'Interfaces entre prática contemplativa e saúde mental.',
    examples: ['trauma', 'ansiedade', 'depressao', 'apego'],
    traditions: ['meditacao', 'budismo', 'cristianismo-mistico', 'psicologia-analitica'],
  },
  {
    slug: 'relatos',
    name: 'Relatos & Experiências',
    description: 'Experiências pessoais, transformações, integração.',
    examples: ['awakening', 'crise-xamanica', 'dark-night', 'revelacao'],
    traditions: ['xamanismo', 'cristianismo-mistico', 'sufismo', 'tantra'],
  },
  {
    slug: 'simbolismo',
    name: 'Simbolismo & Iconografia',
    description: 'Símbolos, mandalas, yantras, selos, correspondências.',
    examples: ['mandala', 'yantra', 'selo', 'arcanjo', 'liturgia'],
    traditions: ['cabala', 'hinduismo', 'budismo', 'cristianismo-mistico', 'numerologia'],
  },
  {
    slug: 'cura',
    name: 'Cura & Medicina Tradicional',
    description: 'Sistemas médicos tradicionais, plantas, práticas terapêuticas.',
    examples: ['ayurveda', 'mtc', 'fitoterapia', 'reiki'],
    traditions: ['ayurveda', 'xamanismo', 'reiki', 'taoismo', 'hinduismo'],
  },
  {
    slug: 'estudo-caso',
    name: 'Estudo de Caso & Aplicação',
    description: 'Aplicações específicas em contextos práticos.',
    examples: ['hospital', 'clinica', 'comunidade', 'escola'],
    traditions: ['reiki', 'meditacao', 'xamanismo', 'espiritualidade-contemporanea'],
  },
] as const;

export type ThemeSlug = (typeof THEMES)[number]['slug'];

// ----------------------------------------------------------------------------
// 3. NÍVEIS DE PROFUNDIDADE (3 camadas)
// ----------------------------------------------------------------------------

export const LEVELS = [
  {
    slug: 'intro',
    name: 'Introdução',
    description: 'Visão geral, sem pré-requisitos. Para quem chega agora.',
    audience: 'Iniciantes absolutos na tradição. PT-BR coloquial, sem jargão.',
    color: '#10B981', // verde
    order: 1,
  },
  {
    slug: 'intermediario',
    name: 'Intermediário',
    description: 'Aprofundamento temático. Pressupõe alguma familiaridade.',
    audience: 'Praticantes iniciantes ou estudiosos. Terminologia técnica com explicação.',
    color: '#3B82F6', // azul
    order: 2,
  },
  {
    slug: 'avancado',
    name: 'Avançado',
    description: 'Nível especializado, com fontes primárias e debates internos.',
    audience: 'Praticantes com formação ou estudiosos avançados. Cita textos na língua original.',
    color: '#8B5CF6', // roxo
    order: 3,
  },
] as const;

export type LevelSlug = (typeof LEVELS)[number]['slug'];

// ----------------------------------------------------------------------------
// 4. FORMATOS (intenção editorial)
// ----------------------------------------------------------------------------

export const FORMATS = [
  {
    slug: 'artigo',
    name: 'Artigo',
    description: 'Ensaio informativo sobre tema da tradição. Cita fontes.',
    use: 'Visão geral, história, filosofia, contexto.',
  },
  {
    slug: 'pratica',
    name: 'Prática Guiada',
    description: 'Instrução passo-a-passo de técnica.',
    use: 'Meditações, rituais, exercícios reproduzíveis. Inclui duração, materiais, cuidados.',
  },
  {
    slug: 'reflexao',
    name: 'Reflexão',
    description: 'Texto pessoal/poético, sem pretensão acadêmica.',
    use: 'Compartilhar insights, integrar experiência, honrar o caminho.',
  },
  {
    slug: 'estudo-caso',
    name: 'Estudo de Caso',
    description: 'Análise de caso específico (pessoa, evento, contexto).',
    use: 'Aplicação concreta, antes/depois, decisão ética.',
  },
] as const;

export type FormatSlug = (typeof FORMATS)[number]['slug'];

// ----------------------------------------------------------------------------
// 5. EVIDENCE LEVEL (GRADE-aligned) — complementar ao schema Prisma
// ----------------------------------------------------------------------------

export const EVIDENCE_LEVELS = [
  {
    slug: 'HIGH',
    name: 'Alta Evidência',
    description: 'Meta-análise ou RCTs replicados. Recomendação clínica possível.',
    examples: 'MBSR, psilocibina (depressão resistente), mindfulness para crianças.',
  },
  {
    slug: 'MEDIUM',
    name: 'Evidência Média',
    description: 'Estudos abertos, séries de casos, RCTs únicos. Sugere benefício.',
    examples: 'Reiki em dor crônica, ayahuasca em ansiedade social.',
  },
  {
    slug: 'LOW',
    name: 'Evidência Baixa',
    description: 'Relatos, hipóteses, tradição oral. Não generalizável mas válido.',
    examples: 'Tantra para despertar espiritual, Odu Iwori como diagnóstico oracular.',
  },
  {
    slug: 'ANECDOTAL',
    name: 'Anedótico/Tradicional',
    description: 'Tradição oral ou textual. Validade cultural, não científica.',
    examples: 'Práticas tradicionais, textos fundacionais, relatos de praticantes.',
  },
] as const;

export type EvidenceLevelSlug = (typeof EVIDENCE_LEVELS)[number]['slug'];

// ----------------------------------------------------------------------------
// 6. TRADITION_CONFIDENCE (autocrítica editorial)
// ----------------------------------------------------------------------------
// Campo novo (Wave 11). Marca quanto a curadora confia na precisão do artigo
// DENTRO da tradição citada. Diferente de evidence level (que é sobre
// eficácia clínica).

export const CONFIDENCE = [
  {
    slug: 'high',
    name: 'Confiança Alta',
    description: '3+ fontes primárias concordam OU 1 primária + revisão de praticante.',
    use: 'Conteúdo factual de tradições bem documentadas (Cabala, Budismo, Ifá).',
  },
  {
    slug: 'medium',
    name: 'Confiança Média',
    description: '1-2 fontes secundárias reconhecidas, sem primária localizada.',
    use: 'Interpretações de práticas (Tantra, Gnosticismo), onde a fonte primária é escassa.',
  },
  {
    slug: 'low',
    name: 'Confiança Baixa',
    description: 'Interpretação pessoal do curador OU 1 fonte secundária não-canônica.',
    use: 'Artigos especulativos, neo-tradições (Wicca contemporânea), hipóteses.',
  },
] as const;

export type ConfidenceSlug = (typeof CONFIDENCE)[number]['slug'];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------

export function getTradition(slug: string) {
  return TRADITIONS.find((t) => t.slug === slug);
}

export function getTheme(slug: string) {
  return THEMES.find((t) => t.slug === slug);
}

export function getLevel(slug: string) {
  return LEVELS.find((l) => l.slug === slug);
}

export function getFormat(slug: string) {
  return FORMATS.find((f) => f.slug === slug);
}

export function getEvidenceLevel(slug: string) {
  return EVIDENCE_LEVELS.find((e) => e.slug === slug);
}

export function getConfidence(slug: string) {
  return CONFIDENCE.find((c) => c.slug === slug);
}

// Lista de slugs válidos para validação de schema
export const VALID_TRADITIONS = TRADITIONS.map((t) => t.slug);
export const VALID_THEMES = THEMES.map((t) => t.slug);
export const VALID_LEVELS = LEVELS.map((l) => l.slug);
export const VALID_FORMATS = FORMATS.map((f) => f.slug);
export const VALID_CONFIDENCE = CONFIDENCE.map((c) => c.slug);
