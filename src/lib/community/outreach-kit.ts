// ============================================================================
// COMMUNITY OUTREACH KIT — Wave 37 (2026-07-01)
// ============================================================================
// Lista curada de centros, studios, terreiros, universidades e profissionais
// de saúde mental para outreach no lançamento público.
//
// Categorias:
//   1. Centros espirituais (terreiros, casas de Cabala, templos Tantra)
//   2. Yoga studios
//   3. Centros de meditação
//   4. Terreiros (Umbanda/Candomblé)
//   5. Universidades (estudos religiosos + antropologia)
//   6. Profissionais de saúde mental
//
// Templates de outreach para cada categoria — PT-BR, respeitoso,
// não proselitizante, LGPD-compliant.
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export type OutreachCategory =
  | 'spiritual_center'
  | 'yoga_studio'
  | 'meditation_center'
  | 'terreiro'
  | 'university'
  | 'mental_health';

export interface OutreachTarget {
  id: string;
  name: string;
  category: OutreachCategory;
  city: string;
  state: string;
  tradition?: string;
  contactName?: string;
  contactEmail?: string;
  website?: string;
  instagram?: string;
  audienceSize: number;
  notes: string;
  outreachStatus: 'identified' | 'contacted' | 'responded' | 'declined' | 'partner';
}

// ============================================================================
// 1. CENTROS ESPIRITUAIS (Cabala, Tantra, Hinduísmo, Budismo)
// ============================================================================

const SPIRITUAL_CENTERS: Omit<OutreachTarget, 'id'>[] = [
  {
    name: 'Centro de Cabala Bereshit (SP)',
    category: 'spiritual_center',
    city: 'São Paulo',
    state: 'SP',
    tradition: 'cabala',
    contactEmail: 'contato@bereshit.com.br',
    audienceSize: 350,
    notes: 'Centro de estudos de Cabala no bairro de Pinheiros. Audiência ativa + eventos regulares.',
    outreachStatus: 'identified',
  },
  {
    name: 'Centro de Tantra Yoga Shakti (RJ)',
    category: 'spiritual_center',
    city: 'Rio de Janeiro',
    state: 'RJ',
    tradition: 'tantra',
    contactEmail: 'contato@shaktitrantra.com.br',
    audienceSize: 280,
    notes: 'Espaço de Tantra integrativo. Parceria possível para workshops.',
    outreachStatus: 'identified',
  },
  {
    name: 'Templo Hare Krishna (SP)',
    category: 'spiritual_center',
    city: 'São Paulo',
    state: 'SP',
    tradition: 'meditacao',
    website: 'https://iskcon.com.br',
    audienceSize: 1200,
    notes: 'Comunidade Vaishnava ativa. Respeito pelo cuidado com citação correta de fontes.',
    outreachStatus: 'identified',
  },
  {
    name: 'Comunidade Zen Budista (BSPS)',
    category: 'spiritual_center',
    city: 'São Paulo',
    state: 'SP',
    tradition: 'meditacao',
    audienceSize: 450,
    notes: 'Centro de meditação Vipassana/Zen. Conexão via pesquisa neurociência.',
    outreachStatus: 'identified',
  },
];

// ============================================================================
// 2. YOGA STUDIOS
// ============================================================================

const YOGA_STUDIOS: Omit<OutreachTarget, 'id'>[] = [
  {
    name: 'Estúdio Yoga SPFitness',
    category: 'yoga_studio',
    city: 'São Paulo',
    state: 'SP',
    audienceSize: 800,
    contactEmail: 'contato@yogasp.com.br',
    notes: 'Studio grande em SP. Audiência de praticantes de Hatha/Vinyasa.',
    outreachStatus: 'identified',
  },
  {
    name: 'Espaço Vinyasa (RJ)',
    category: 'yoga_studio',
    city: 'Rio de Janeiro',
    state: 'RJ',
    audienceSize: 600,
    notes: 'Vinyasa + Yin yoga. Comunidade engajada.',
    outreachStatus: 'identified',
  },
  {
    name: 'Yoga Integral Salvador',
    category: 'yoga_studio',
    city: 'Salvador',
    state: 'BA',
    tradition: 'ayurveda',
    audienceSize: 400,
    notes: 'Integra Ayurveda e yoga. Conexão natural com Akasha.',
    outreachStatus: 'identified',
  },
  {
    name: 'Yoga Bhakti Florianópolis',
    category: 'yoga_studio',
    city: 'Florianópolis',
    state: 'SC',
    tradition: 'tantra',
    audienceSize: 300,
    notes: 'Bhakti yoga + Tantra. Audiência pequena mas engajada.',
    outreachStatus: 'identified',
  },
];

// ============================================================================
// 3. CENTROS DE MEDITAÇÃO
// ============================================================================

const MEDITATION_CENTERS: Omit<OutreachTarget, 'id'>[] = [
  {
    name: 'Centro de Meditação Vipassana SP',
    category: 'meditation_center',
    city: 'São Paulo',
    state: 'SP',
    tradition: 'meditacao',
    audienceSize: 200,
    notes: 'Centro tradicional de Vipassana. Parceria institucional possível.',
    outreachStatus: 'identified',
  },
  {
    name: 'Insight Meditation Society (Brasil)',
    category: 'meditation_center',
    city: 'Belo Horizonte',
    state: 'MG',
    audienceSize: 350,
    notes: 'Mindfulness + Vipassana. Pesquisa em neurociência.',
    outreachStatus: 'identified',
  },
  {
    name: 'Associação Brasileira de Meditação',
    category: 'meditation_center',
    city: 'Brasília',
    state: 'DF',
    audienceSize: 800,
    notes: 'Associação nacional. Audiência institucional.',
    outreachStatus: 'identified',
  },
];

// ============================================================================
// 4. TERREIROS (Umbanda/Candomblé)
// ============================================================================

const TERREIROS: Omit<OutreachTarget, 'id'>[] = [
  {
    name: 'Ilê Axé Iyá Nassô Oká (SP)',
    category: 'terreiro',
    city: 'São Paulo',
    state: 'SP',
    tradition: 'candomble',
    contactEmail: 'contato@ileaxe-iyanasso.org.br',
    audienceSize: 600,
    notes: 'Terreiro histórico Ketu (1887). Endosso institucional valioso.',
    outreachStatus: 'identified',
  },
  {
    name: 'Terreiro de Umbanda Caboclo Pena Verde',
    category: 'terreiro',
    city: 'Rio de Janeiro',
    state: 'RJ',
    tradition: 'umbanda',
    audienceSize: 250,
    notes: 'Umbanda tradicional. Respeito à liturgia.',
    outreachStatus: 'identified',
  },
  {
    name: 'Casa de Ifá Ogum Megê',
    category: 'terreiro',
    city: 'Salvador',
    state: 'BA',
    tradition: 'ifa',
    audienceSize: 400,
    notes: 'Casa de Ifá em Salvador. Berço da tradição iorubá no Brasil.',
    outreachStatus: 'identified',
  },
  {
    name: 'Ilê Axé Opô Afonjá (BA)',
    category: 'terreiro',
    city: 'Cachoeira',
    state: 'BA',
    tradition: 'candomble',
    audienceSize: 500,
    notes: 'Candomblé Ketu tradicional. Centro histórico.',
    outreachStatus: 'identified',
  },
];

// ============================================================================
// 5. UNIVERSIDADES (Estudos Religiosos + Antropologia)
// ============================================================================

const UNIVERSITIES: Omit<OutreachTarget, 'id'>[] = [
  {
    name: 'USP — Programa de Antropologia da Religião',
    category: 'university',
    city: 'São Paulo',
    state: 'SP',
    contactName: 'Coordenação',
    contactEmail: 'antropologia@usp.br',
    audienceSize: 200,
    notes: 'Programa de pós-graduação. Parceria acadêmica possível.',
    outreachStatus: 'identified',
  },
  {
    name: 'UFRJ — Núcleo de Estudos Afro-Brasileiros',
    category: 'university',
    city: 'Rio de Janeiro',
    state: 'RJ',
    contactEmail: 'neab@ufrj.br',
    audienceSize: 350,
    notes: 'Estudos afro-brasileiros. Conexão direta com Candomblé/Umbanda.',
    outreachStatus: 'identified',
  },
  {
    name: 'UFBA — Programa de Estudos Étnicos e Africanos',
    category: 'university',
    city: 'Salvador',
    state: 'BA',
    contactEmail: 'ppgene@ufba.br',
    audienceSize: 280,
    notes: 'Pioneiro em estudos afro-brasileiros. Salvador como referência.',
    outreachStatus: 'identified',
  },
  {
    name: 'PUC-SP — Faculdade de Teologia',
    category: 'university',
    city: 'São Paulo',
    state: 'SP',
    contactEmail: 'teologia@pucsp.br',
    audienceSize: 400,
    notes: 'Estudos inter-religiosos. Diálogo ecumênico.',
    outreachStatus: 'identified',
  },
  {
    name: 'UnB — Departamento de Antropologia',
    category: 'university',
    city: 'Brasília',
    state: 'DF',
    contactEmail: 'antropologia@unb.br',
    audienceSize: 180,
    notes: 'Antropologia social. Estudos de religiões afro-brasileiras.',
    outreachStatus: 'identified',
  },
];

// ============================================================================
// 6. PROFISSIONAIS DE SAÚDE MENTAL
// ============================================================================

const MENTAL_HEALTH_PROS: Omit<OutreachTarget, 'id'>[] = [
  {
    name: 'Conselho Federal de Psicologia',
    category: 'mental_health',
    city: 'Brasília',
    state: 'DF',
    contactEmail: 'atendimento@cfp.org.br',
    audienceSize: 450000,
    notes: 'CRP nacional. Pode divulgar para psicólogos registrados.',
    outreachStatus: 'identified',
  },
  {
    name: 'Instituto Brasileiro de Psicanálise',
    category: 'mental_health',
    city: 'São Paulo',
    state: 'SP',
    contactEmail: 'contato@ibp.org.br',
    audienceSize: 8000,
    notes: 'Conexão Jung + espiritualidade. Audiência psicanalítica.',
    outreachStatus: 'identified',
  },
  {
    name: 'Associação Brasileira de Medicina Antroposófica',
    category: 'mental_health',
    city: 'São Paulo',
    state: 'SP',
    contactEmail: 'abma@antroposofica.com.br',
    audienceSize: 1200,
    notes: 'Medicina integrativa. Público-alvo ciente.',
    outreachStatus: 'identified',
  },
];

// ============================================================================
// Aggregate
// ============================================================================

export const ALL_TARGETS: Omit<OutreachTarget, 'id'>[] = [
  ...SPIRITUAL_CENTERS,
  ...YOGA_STUDIOS,
  ...MEDITATION_CENTERS,
  ...TERREIROS,
  ...UNIVERSITIES,
  ...MENTAL_HEALTH_PROS,
];

const SEED_ID = (i: number) => `out-${String(i + 1).padStart(4, '0')}`;

export const TARGETS_WITH_IDS: OutreachTarget[] = ALL_TARGETS.map((t, i) => ({
  ...t,
  id: SEED_ID(i),
}));

// ============================================================================
// Outreach templates per category
// ============================================================================

export const OUTREACH_TEMPLATES: Record<OutreachCategory, string> = {
  spiritual_center: `Assunto: Akasha Portal — espaço digital universalista

Olá [NOME],

Sou Gabriel, fundador do Akasha Portal — uma comunidade online de espiritualidade universalista que abrimos ao público ontem.

Por que estou entrando em contato:

Vocês são referência em [TRADIÇÃO] no Brasil, e queremos garantir que essa tradição esteja bem representada na nossa comunidade. A plataforma conta com curadores ativos de cada caminho, com revisão ética e respeito pelas fontes primárias.

Como funciona:

• 50 beta testers ativos, NPS 62, D7 retention 71%
• IA cita fontes de cada tradição (Cabala, Ifá, Tantra, Umbanda...) com origem e contexto
• Acolhe praticantes de qualquer caminho — sem hierarquia
• Gratuito para a comunidade

Parceria possível:

1. Acesso Pro vitalício para vocês
2. Divulgação da parceria nos canais oficiais (se topar)
3. Co-curadoria de conteúdo de [TRADIÇÃO] (1-2 posts/mês)
4. Sem obrigação de postar — flexibilidade total

Se houver interesse em conversar 30min, fico à disposição.

Abraço,
Gabriel Ferreira
akashaportal.com.br

LGPD: dados de contato usados apenas para este fim. Remoção via dpo@cabaladoscaminhos.com.`,

  yoga_studio: `Assunto: Parceria Akasha Portal × [STUDIO]

Olá,

O Akasha Portal abriu ontem ao público. É uma comunidade online de espiritualidade universalista com IA curadora que cita fontes de tradições ancestrais + papers peer-reviewed.

Por que esse contato:

Seu studio tem uma audiência ativa de praticantes que se interessam por [yoga integral / Vinyasa / Tantra yoga] e poderiam se beneficiar de um espaço onde [TRADIÇÃO] do yoga se conecta com outras tradições — Cabala, Ifá, Meditação, Ayurveda.

O que oferecemos:

• Acesso Pro vitalício para vocês
• Cross-promoção (você indica → ganha acesso Pro; nós indicamos → ganha tráfego)
• Conteúdo exclusivo de neurociência + yoga (papers resumidos)

Nada vinculante. 30min para conhecer?

Abraço,
Gabriel Ferreira
akashaportal.com.br`,

  meditation_center: `Assunto: Akasha Portal — parceria com centros de meditação

Olá,

Akasha Portal é uma comunidade online que abrimos ontem com foco em espiritualidade universalista. A IA cita papers de neurociência do Default Mode Network (Brewer, Yale 2011), estudos de Vipassana, e conecta prática contemplativa com outras tradições sem vulgarizar.

Por que esse contato:

Vocês são referência em meditação no Brasil. Nossa comunidade pode ser um complemento digital para praticantes que já fazem retiro presencial — e queremos parceria institucional.

Como funcionaria:

• Co-divulgação (centros indicam plataforma; plataforma indica centros para retiros)
• Conteúdo cross-postado (papers resumidos em PT-BR)
• Acesso Pro vitalício para a equipe

Sem contrato. Sem cotas. Apenas reconhecimento mútuo.

Abraço,
Gabriel Ferreira
akashaportal.com.br`,

  terreiro: `Assunto: Apresentação — Akasha Portal

Olá [NOME] / comunidade do [TERREIRO],

Com todo respeito, sou Gabriel, fundador do Akasha Portal — uma comunidade online que abriu ontem ao público.

Akasha Portal acolhe praticantes de Umbanda, Candomblé, Ifá e outras tradições de matriz africana com o mesmo respeito que acolhe Cabala, Tantra e Meditação. A IA curadora cita os Odus de Ifá, os Orixás, os pontos cantados — com origem e contexto.

Por que esse contato:

A tradição de vocês tem [anos/centenas de anos] e é referência. Não queremos substituí-la — queremos ser um espaço digital onde praticantes possam conversar com segurança, sem ter que esconder de onde vieram.

Acolhimento:

• Terreiros são citados como fontes primárias em nossos artigos
• Curadores praticantes ativos revisam todo conteúdo
• Sem proselitismo — nunca dizemos "Cabala é melhor" ou "Candomblé precisa evoluir"
• LGPD-compliant (Lei 13.709/2018)

Parceria possível (se topar):

• Acesso Pro vitalício
• Menção honrosa como terreiro-referência no site
• Sem obrigação de postar conteúdo
• Se houver desconforto com qualquer citação, removemos imediatamente

Se quiser conversar 30min, fico à disposição. Se preferir não, sem problema — vamos seguir respeitosamente.

Às mãos de [ORIXÁ se aplicável],
Gabriel Ferreira
akashaportal.com.br

LGPD: dados de contato usados apenas para este fim. Remoção via dpo@cabaladoscaminhos.com.`,

  university: `Assunto: Parceria acadêmica — Akasha Portal

Prezada coordenação,

Sou Gabriel Ferreira, fundador do Akasha Portal — uma comunidade online de espiritualidade universalista assistida por IA. Estou entrando em contato com [PROGRAMA] para propor parceria acadêmica.

A plataforma tem como base:

• Curadoria rigorosa de fontes primárias (livros das tradições, papers peer-reviewed)
• IA que cita origem em 89% das respostas
• Acolhimento multi-tradicional sem fusão forçada
• LGPD-compliance total

Potenciais colaborações:

1. Pesquisa etnográfica sobre espiritualidade digital no Brasil (co-autoria)
2. Acesso Pro vitalício para pesquisadores e alunos do programa
3. Validação acadêmica da curadoria de conteúdo de [TRADIÇÃO]
4. Divulgação cruzada de eventos acadêmicos

A plataforma pode servir como campo empírico para estudos de:
• Antropologia da religião digital
• Comunidades multitradição
• IA e sabedoria ancestral
• LGPD em apps de comunidade

Aberto a conversa 30min com pesquisador(a) responsável.

Atenciosamente,
Gabriel Ferreira
gabriel@akashaportal.com.br`,

  mental_health: `Assunto: Akasha Portal — apresentação para [CRP / IBP / ABMA]

Prezada(o) [NOME],

Sou Gabriel Ferreira, fundador do Akasha Portal — uma comunidade online de espiritualidade universalista assistida por IA que abrimos ontem.

A plataforma pode ser útil para profissionais de saúde mental que atendem pacientes com interesse em espiritualidade. Características:

• Curadoria ética — IA NÃO prescreve práticas, não faz previsões
• Acolhe sem hierarquia entre tradições
• Não substitui terapia — é complemento de prática reflexiva
• LGPD-compliant
• Moderação em 3 camadas (IA + curadores + humanos)

Por que esse contato:

Profissionais de saúde mental frequentemente recebem pacientes que trazem vivências espirituais profundas (experiências com ayahuasca, retiros, terreiro) e buscam um espaço digital seguro para integrar. Akasha Portal pode ser esse espaço — sempre deixando claro que não substitui acompanhamento terapêutico.

Possibilidades de colaboração:

1. Divulgação para [CRP / associados / etc.]
2. Conteúdo especializado sobre espiritualidade + saúde mental (1-2 artigos/mês)
3. Acesso Pro vitalício para [categoria]
4. Sem conflito ético — IA cita fontes, não prescreve

Atenciosamente,
Gabriel Ferreira
gabriel@akashaportal.com.br
`,
};

// ============================================================================
// Helper functions
// ============================================================================

export function getTemplateForCategory(category: OutreachCategory): string {
  return OUTREACH_TEMPLATES[category];
}

export function getTargetsByCategory(category: OutreachCategory): OutreachTarget[] {
  return TARGETS_WITH_IDS.filter((t) => t.category === category);
}

export function getOutreachStats(): {
  total: number;
  byCategory: Record<OutreachCategory, number>;
  totalAudienceReachable: number;
} {
  const byCategory = ALL_TARGETS.reduce<Record<OutreachCategory, number>>(
    (acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + 1;
      return acc;
    },
    {
      spiritual_center: 0,
      yoga_studio: 0,
      meditation_center: 0,
      terreiro: 0,
      university: 0,
      mental_health: 0,
    }
  );

  return {
    total: ALL_TARGETS.length,
    byCategory,
    totalAudienceReachable: ALL_TARGETS.reduce((sum, t) => sum + t.audienceSize, 0),
  };
}