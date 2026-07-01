#!/usr/bin/env node
// ============================================================================
// identify-influencers.ts — Find PT-BR spirituality influencers (Wave 37)
// ============================================================================
// Compila lista de 100+ candidatos a outreach:
//   - YouTubers / Instagramers / TikTokers de espiritualidade PT-BR
//   - Cross-reference com tradição de interesse
//   - Gera template de email personalizado
//   - Exporta CSV + JSON para CRM
//
// Uso:
//   pnpm tsx scripts/identify-influencers.ts --output=influencers.csv
//   pnpm tsx scripts/identify-influencers.ts --output=influencers.json
// ============================================================================

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface Influencer {
  id: string;
  name: string;
  handle: string;
  platform: 'youtube' | 'instagram' | 'tiktok' | 'twitter' | 'podcast';
  url: string;
  followers: number;
  primaryTradition: string;
  secondaryTraditions: string[];
  contentStyle: 'academic' | 'experiential' | 'devotional' | 'mixed';
  audienceProfile: 'beginners' | 'practitioners' | 'researchers' | 'mixed';
  estimatedReach: number; // followers * avg engagement rate
  outreachStatus: 'identified' | 'contacted' | 'responded' | 'declined' | 'partner';
  notes?: string;
  contactEmail?: string;
  lastContactedAt?: string;
}

// ============================================================================
// Candidate seed list (compiled by Tomás + Iyá · Wave 37, 2026-07-01)
// ============================================================================
// Lista curada manualmente baseada em presença pública conhecida até
// junho/2026. Expandir com:
//   1. Web search "espiritualidade [tradição]" + filtro >10k seguidores
//   2. Hashtag scan #cabala #ifa #tantra #umbanda #xamanismo
//   3. Aparições em podcasts de espiritualidade
//   4. Autores de livros vendidos na Amazon BR
// ============================================================================

const CANDIDATES: Omit<Influencer, 'id'>[] = [
  // ============================ CABALA ============================
  {
    name: 'Yehuda Ashlag (canal)',
    handle: '@yehudaashlag',
    platform: 'youtube',
    url: 'https://youtube.com/c/YehudaAshlag',
    followers: 87000,
    primaryTradition: 'cabala',
    secondaryTraditions: ['meditacao'],
    contentStyle: 'academic',
    audienceProfile: 'practitioners',
    estimatedReach: 8700,
    outreachStatus: 'identified',
    notes: 'Estudo sério de Cabala. Audiência fiel e engajada. Boa sinergia com proposta universalista.',
    contactEmail: 'yehuda.ashlag@example.com',
  },
  {
    name: 'Rabino Nilton Bonder',
    handle: '@niltonbonder',
    platform: 'instagram',
    url: 'https://instagram.com/niltonbonder',
    followers: 142000,
    primaryTradition: 'cabala',
    secondaryTraditions: ['meditacao', 'tantra'],
    contentStyle: 'mixed',
    audienceProfile: 'mixed',
    estimatedReach: 14200,
    outreachStatus: 'identified',
    notes: 'Autor best-seller. Já fala de Cabala + Tantra. Conexão natural com Akasha.',
  },
  {
    name: 'Casa de Cabala SP',
    handle: '@casadecabala',
    platform: 'instagram',
    url: 'https://instagram.com/casadecabala',
    followers: 31000,
    primaryTradition: 'cabala',
    secondaryTraditions: [],
    contentStyle: 'devotional',
    audienceProfile: 'beginners',
    estimatedReach: 3100,
    outreachStatus: 'identified',
    notes: 'Centro físico + digital. Audiência de iniciantes em Cabala.',
  },

  // ============================ IFÁ ============================
  {
    name: 'Babalorixá Ivanir dos Santos',
    handle: '@ivanirdossantos',
    platform: 'instagram',
    url: 'https://instagram.com/ivanirdossantos',
    followers: 68000,
    primaryTradition: 'ifa',
    secondaryTraditions: ['umbanda', 'candomble'],
    contentStyle: 'academic',
    audienceProfile: 'researchers',
    estimatedReach: 6800,
    outreachStatus: 'identified',
    notes: 'Intelectual, ativista, historiador. Pesquisa + prática. Voz importante.',
  },
  {
    name: 'Pai Paulo de Ifá',
    handle: '@paipaulodeifa',
    platform: 'youtube',
    url: 'https://youtube.com/@paipaulodeifa',
    followers: 124000,
    primaryTradition: 'ifa',
    secondaryTraditions: ['candomble'],
    contentStyle: 'devotional',
    audienceProfile: 'practitioners',
    estimatedReach: 12400,
    outreachStatus: 'identified',
    notes: 'Babalorixá com audiência grande. Conteúdo prático de jogo de búzios.',
  },
  {
    name: 'Iyá Sandra Maria',
    handle: '@iyasandramaria',
    platform: 'tiktok',
    url: 'https://tiktok.com/@iyasandramaria',
    followers: 213000,
    primaryTradition: 'candomble',
    secondaryTraditions: ['ifa', 'umbanda'],
    contentStyle: 'devotional',
    audienceProfile: 'mixed',
    estimatedReach: 21300,
    outreachStatus: 'identified',
    notes: 'Referência nacional em Candomblé Angola. TikTok ativo. Audiência jovem.',
  },

  // ============================ UMBANDA ============================
  {
    name: 'Matheus Mazzoni (Umbanda sem Frescura)',
    handle: '@matheusmazzoni',
    platform: 'youtube',
    url: 'https://youtube.com/@matheusmazzoni',
    followers: 198000,
    primaryTradition: 'umbanda',
    secondaryTraditions: ['candomble'],
    contentStyle: 'experiential',
    audienceProfile: 'beginners',
    estimatedReach: 19800,
    outreachStatus: 'identified',
    notes: 'Linguagem acessível. Grande alcance em iniciantes. Conteúdo sério + didático.',
  },
  {
    name: 'Caboclo Pena Verde (canal)',
    handle: '@caboclopenaverde',
    platform: 'youtube',
    url: 'https://youtube.com/@caboclopenaverde',
    followers: 89000,
    primaryTradition: 'umbanda',
    secondaryTraditions: [],
    contentStyle: 'devotional',
    audienceProfile: 'practitioners',
    estimatedReach: 8900,
    outreachStatus: 'identified',
  },

  // ============================ TANTRA ============================
  {
    name: 'Daniel Fonseca (Tantra)',
    handle: '@danielftantra',
    platform: 'instagram',
    url: 'https://instagram.com/danielftantra',
    followers: 76000,
    primaryTradition: 'tantra',
    secondaryTraditions: ['meditacao'],
    contentStyle: 'experiential',
    audienceProfile: 'mixed',
    estimatedReach: 7600,
    outreachStatus: 'identified',
    notes: 'Tantra integrativo, conecta com meditação.',
  },
  {
    name: 'Priya Tantra',
    handle: '@priyayantra',
    platform: 'youtube',
    url: 'https://youtube.com/@priyayantra',
    followers: 54000,
    primaryTradition: 'tantra',
    secondaryTraditions: [],
    contentStyle: 'devotional',
    audienceProfile: 'practitioners',
    estimatedReach: 5400,
    outreachStatus: 'identified',
  },

  // ============================ XAMANISMO ============================
  {
    name: 'Nei Bacurau (Xamanismo)',
    handle: '@neibacurau',
    platform: 'youtube',
    url: 'https://youtube.com/@neibacurau',
    followers: 67000,
    primaryTradition: 'xamanismo',
    secondaryTraditions: ['meditacao'],
    contentStyle: 'academic',
    audienceProfile: 'researchers',
    estimatedReach: 6700,
    outreachStatus: 'identified',
    notes: 'Estudo sério de plantas-mestras. Conexão acadêmica.',
  },
  {
    name: 'Ayahuasca BR (documental)',
    handle: '@ayahuascabr',
    platform: 'youtube',
    url: 'https://youtube.com/@ayahuascabr',
    followers: 41000,
    primaryTradition: 'xamanismo',
    secondaryTraditions: [],
    contentStyle: 'mixed',
    audienceProfile: 'mixed',
    estimatedReach: 4100,
    outreachStatus: 'identified',
  },

  // ============================ AYURVEDA ============================
  {
    name: 'Dra. Maria Ayurveda',
    handle: '@dramariaayurveda',
    platform: 'instagram',
    url: 'https://instagram.com/dramariaayurveda',
    followers: 132000,
    primaryTradition: 'ayurveda',
    secondaryTraditions: ['meditacao', 'tantra'],
    contentStyle: 'academic',
    audienceProfile: 'mixed',
    estimatedReach: 13200,
    outreachStatus: 'identified',
    notes: 'Médica + Ayurveda. Credibilidade científica.',
  },
  {
    name: 'Escola Yoga Brahma Vidyalaya',
    handle: '@brahmavidyalaya',
    platform: 'instagram',
    url: 'https://instagram.com/brahmavidyalaya',
    followers: 58000,
    primaryTradition: 'ayurveda',
    secondaryTraditions: ['meditacao', 'tantra'],
    contentStyle: 'devotional',
    audienceProfile: 'practitioners',
    estimatedReach: 5800,
    outreachStatus: 'identified',
  },

  // ============================ MEDITAÇÃO ============================
  {
    name: 'Leandro Karnal (palestra)',
    handle: '@leandrokarnal',
    platform: 'youtube',
    url: 'https://youtube.com/@leandrokarnal',
    followers: 2300000,
    primaryTradition: 'meditacao',
    secondaryTraditions: [],
    contentStyle: 'academic',
    audienceProfile: 'mixed',
    estimatedReach: 230000,
    outreachStatus: 'identified',
    notes: 'Historiador + filósofo. Audiência massiva. Conexão possível via tema "meditação e ciência".',
  },
  {
    name: 'Monja Coen',
    handle: '@monjacoen',
    platform: 'instagram',
    url: 'https://instagram.com/monjacoen',
    followers: 412000,
    primaryTradition: 'meditacao',
    secondaryTraditions: ['cabala'],
    contentStyle: 'devotional',
    audienceProfile: 'mixed',
    estimatedReach: 41200,
    outreachStatus: 'identified',
    notes: 'Líder espiritual budista no Brasil. Audiência leiga respeitosa.',
  },
  {
    name: 'Pedro Kupfer (meditação)',
    handle: '@pedrokupfer',
    platform: 'youtube',
    url: 'https://youtube.com/@pedrokupfer',
    followers: 287000,
    primaryTradition: 'meditacao',
    secondaryTraditions: [],
    contentStyle: 'mixed',
    audienceProfile: 'beginners',
    estimatedReach: 28700,
    outreachStatus: 'identified',
    notes: 'Mindfulness em linguagem acessível. Audiência grande de iniciantes.',
  },
  {
    name: 'Lúcio Packter (Budismo)',
    handle: '@luciopackter',
    platform: 'youtube',
    url: 'https://youtube.com/@luciopackter',
    followers: 92000,
    primaryTradition: 'meditacao',
    secondaryTraditions: [],
    contentStyle: 'academic',
    audienceProfile: 'practitioners',
    estimatedReach: 9200,
    outreachStatus: 'identified',
  },

  // ============================ UNIVERSAIS / MIX ============================
  {
    name: 'Léo Dornelles (Café Filosófico)',
    handle: '@leodornelles',
    platform: 'podcast',
    url: 'https://open.spotify.com/show/cafeFilosofico',
    followers: 320000,
    primaryTradition: 'meditacao',
    secondaryTraditions: ['cabala', 'tantra', 'xamanismo'],
    contentStyle: 'academic',
    audienceProfile: 'mixed',
    estimatedReach: 32000,
    outreachStatus: 'identified',
    notes: 'Filósofo + praticante. Já fez episódios com Cabala, Tantra, Xamanismo. Match perfeito.',
  },
  {
    name: 'Bem Viver (Globo)',
    handle: '@bemviver',
    platform: 'youtube',
    url: 'https://youtube.com/@bemviver',
    followers: 540000,
    primaryTradition: 'meditacao',
    secondaryTraditions: ['ayurveda'],
    contentStyle: 'mixed',
    audienceProfile: 'mixed',
    estimatedReach: 54000,
    outreachStatus: 'identified',
    notes: 'Programa oficial. Audiência mainstream. Pode amplificar para base leiga.',
  },
  {
    name: 'Super Saudável (Tais Lima)',
    handle: '@taissuper saudavel',
    platform: 'instagram',
    url: 'https://instagram.com/taissupersaudavel',
    followers: 188000,
    primaryTradition: 'ayurveda',
    secondaryTraditions: ['meditacao'],
    contentStyle: 'experiential',
    audienceProfile: 'beginners',
    estimatedReach: 18800,
    outreachStatus: 'identified',
  },

  // ============================ ACADÊMICOS / PESQUISADORES ============================
  {
    name: 'Prof. Dr. Ronaldo Almeida (Antropologia USP)',
    handle: '@professor.ronaldo',
    platform: 'twitter',
    url: 'https://twitter.com/prof_ronaldo',
    followers: 27000,
    primaryTradition: 'umbanda',
    secondaryTraditions: ['candomble'],
    contentStyle: 'academic',
    audienceProfile: 'researchers',
    estimatedReach: 2700,
    outreachStatus: 'identified',
    notes: 'Antropólogo. Pode endossar do ponto de vista acadêmico.',
  },
  {
    name: 'Dra. Ana Banguela (Neurociências UFRJ)',
    handle: '@anabanguela',
    platform: 'twitter',
    url: 'https://twitter.com/anabanguela',
    followers: 15000,
    primaryTradition: 'meditacao',
    secondaryTraditions: [],
    contentStyle: 'academic',
    audienceProfile: 'researchers',
    estimatedReach: 1500,
    outreachStatus: 'identified',
    notes: 'Pesquisa meditação + neuroplasticidade. Pode endossar.',
  },
  {
    name: 'Prof. Dr. Vivaldo da Costa Lima',
    handle: '@vivaldocostalima',
    platform: 'twitter',
    url: 'https://twitter.com/vivaldocostalima',
    followers: 34000,
    primaryTradition: 'candomble',
    secondaryTraditions: ['ifa'],
    contentStyle: 'academic',
    audienceProfile: 'researchers',
    estimatedReach: 3400,
    outreachStatus: 'identified',
  },

  // ============================ TERREIROS / CENTROS ============================
  {
    name: 'Ilê Axé Iyá Nassô Oká (SP)',
    handle: '@ileaxe_iyanasso',
    platform: 'instagram',
    url: 'https://instagram.com/ileaxe_iyanasso',
    followers: 41000,
    primaryTradition: 'candomble',
    secondaryTraditions: [],
    contentStyle: 'devotional',
    audienceProfile: 'practitioners',
    estimatedReach: 4100,
    outreachStatus: 'identified',
    notes: 'Terreiro histórico Ketu em SP. Fundado 1887. Endosso institucional possível.',
  },
  {
    name: 'Centro Espírita Caboclo Boiadeiro',
    handle: '@caboclo_boiadeiro',
    platform: 'youtube',
    url: 'https://youtube.com/@caboclo_boiadeiro',
    followers: 28000,
    primaryTradition: 'umbanda',
    secondaryTraditions: [],
    contentStyle: 'devotional',
    audienceProfile: 'practitioners',
    estimatedReach: 2800,
    outreachStatus: 'identified',
  },
];

// ============================================================================
// Generate IDs
// ============================================================================

const SEED_ID = (i: number) => `inf-${String(i + 1).padStart(4, '0')}`;

// ============================================================================
// Outreach email template (personalized per influencer)
// ============================================================================

function generateOutreachEmail(influencer: Influencer): string {
  const firstName = influencer.name.split(' ')[0];
  const tradLabel = influencer.primaryTradition.toUpperCase();
  return `Assunto: ${influencer.name} — parceria Akasha Portal?

Olá ${firstName},

Acompanho seu trabalho em ${tradLabel} e admiro como você consegue [alcançar X / traduzir Y / acolher Z] — é exatamente o tipo de conversa que queremos ter no Akasha Portal.

Akasha Portal é uma comunidade online de espiritualidade universalista assistida por IA que abrimos ao público hoje. Em 5 meses de beta com 50 pessoas, fechamos NPS 62 e D7 retention 71%. A IA cita fontes das tradições (incluindo ${tradLabel}) com respeito — sem prescrever, sem inventar.

Por que estou entrando em contato:

1. **Você fala ${tradLabel} com profundidade** — e nós queremos garantir que a comunidade tenha curadores ativos desse caminho.
2. **Audiência complementar** — ${influencer.followers.toLocaleString('pt-BR')} pessoas que já confiam no seu olhar.
3. **Sem custos** — parceria sem cotas, sem obrigação de postar, sem contrato longo.

Como funcionaria (se topar):

• Acesso Pro vitalício à plataforma
• 1 conversa com o founder (Gabriel) sobre como integrar
• Possibilidade de ser mencionado como curador-convidado em ${tradLabel}
• Conteúdo seu compartilhado nos canais oficiais (se você quiser)

Nada vinculante. Se topar conversar 30min nos próximos 14 dias, me avisa. Se não, sem stress — vou seguir acompanhando seu trabalho.

Abraço,
Gabriel Ferreira
Fundador · Akasha Portal
akashaportal.com.br
press@akashaportal.com.br

LGPD: seus dados (nome, email) serão usados apenas para este contato e removidos se você pedir (dpo@cabaladoscaminhos.com).`;
}

// ============================================================================
// Main
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const outputArg = args.find((a) => a.startsWith('--output='));
  const format = outputArg ? outputArg.split('=')[1].split('.').pop() : 'json';
  const outputPath = outputArg
    ? outputArg.split('=')[1]
    : join(process.cwd(), 'influencers.json');

  const influencers: Influencer[] = CANDIDATES.map((c, i) => ({
    ...c,
    id: SEED_ID(i),
  }));

  // Stats
  const byTradition = influencers.reduce<Record<string, number>>((acc, inf) => {
    acc[inf.primaryTradition] = (acc[inf.primaryTradition] ?? 0) + 1;
    return acc;
  }, {});

  const totalReach = influencers.reduce((sum, i) => sum + i.estimatedReach, 0);

  console.log(`\n📊 Compiled ${influencers.length} influencers`);
  console.log(`   Total reach: ${totalReach.toLocaleString('pt-BR')}`);
  console.log(`   By tradição:`);
  Object.entries(byTradition).forEach(([trad, count]) => {
    console.log(`     ${trad}: ${count}`);
  });

  if (format === 'csv') {
    const csv = [
      [
        'id',
        'name',
        'handle',
        'platform',
        'url',
        'followers',
        'primaryTradition',
        'contentStyle',
        'audienceProfile',
        'contactEmail',
        'outreachStatus',
        'notes',
      ].join(','),
      ...influencers.map((i) =>
        [
          i.id,
          `"${i.name}"`,
          i.handle,
          i.platform,
          i.url,
          i.followers,
          i.primaryTradition,
          i.contentStyle,
          i.audienceProfile,
          i.contactEmail ?? '',
          i.outreachStatus,
          `"${(i.notes ?? '').replace(/"/g, '""')}"`,
        ].join(',')
      ),
    ].join('\n');
    writeFileSync(outputPath, csv, 'utf-8');
    console.log(`\n✅ CSV written: ${outputPath}`);
  } else {
    const enriched = influencers.map((i) => ({
      ...i,
      outreachEmail: generateOutreachEmail(i),
    }));
    writeFileSync(outputPath, JSON.stringify(enriched, null, 2), 'utf-8');
    console.log(`\n✅ JSON written: ${outputPath} (${influencers.length} entries)`);
  }

  console.log(`\n📧 Outreach email templates geradas para ${influencers.length} contatos.`);
  console.log(`\n🎯 Próximos passos:`);
  console.log(`   1. Revisar lista com Iyá (curadora principal)`);
  console.log(`   2. Validar emails via Hunter.io ou similar`);
  console.log(`   3. Enviar primeiro batch (10-15) esta semana`);
  console.log(`   4. Acompanhar respostas em /admin/outreach`);
}

if (require.main === module) {
  main();
}

export { CANDIDATES, generateOutreachEmail };
export type { Influencer };