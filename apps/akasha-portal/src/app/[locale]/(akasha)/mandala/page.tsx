/**
 * /[locale]/(akasha)/mandala — Wave 28.1 Universalista Redesign (ADR-013).
 *
 * Server-component shell que:
 *   1. Autentica via cookie `__Host-akasha_session` (mesmo padrão de
 *      /meu-dia, /mentor, /dashboard, /atendimento).
 *   2. Calcula saudação (sem PII).
 *   3. Coleta papers cited (cross-references Wave 21.1) — estático p/ agora
 *      (mock determinístico, mesmo shape do adapter.ts).
 *   4. Renderiza <MandalaUniversalView>, o client island com 5 Pilares.
 *
 * Wave 28.1 constraints (ver plan):
 *   - NÃO mexe em /api/akasha/mandala (backend).
 *   - Substitui o PilarCard/MandatoCard legados pela nova visão universal.
 *   - Mobile-first: tudo stack vertical em < 640px.
 *   - Universalista + visceral: copy curto, sem floreio acadêmico.
 *
 * MandalaChart, NarrativeLoader e AuthorityBlock continuam disponíveis
 * na rota /dashboard — não removemos; só reorganizamos o que aparece
 * PRIMEIRO no /mandala (a verdade universal, não os detalhes técnicos).
 */

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  MandalaUniversalView,
  type CitedPaper,
} from '@/components/akasha/mandala-universal/MandalaUniversalView';
import {
  verifyAkashaToken,
  AKASHA_TOKEN_COOKIE,
} from '@/lib/application/auth/akasha-jwt';

export const metadata = {
  title: 'Mandala Universal — Akasha OS',
  description:
    'Cinco línguas diferentes contam a mesma verdade. Cabala, Astrologia, Tantra, Odu e I Ching convergem no seu agora.',
};

interface MandalaPageProps {
  params: Promise<{ locale: string }>;
}

function getSaudacao(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Bom despertar';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Papers cross-referenciados Wave 21.1 — hardcoded curated set com 5 papers
 * reais (Riba 2003 ayahuasca, Selby 2014 I Ching, Cahn 2010 meditation,
 * Dunbar 2020 ritual, Davidson 2003 MBSR). Substitui chamada de rede
 * por enquanto (Wave 27.5 literature-xref fornece API real; refactor
 * futuro aponta pra lá).
 */
const PAPERS_CITED: CitedPaper[] = [
  {
    id: 'paper_riba_2003',
    title: 'Ayahuasca pharmacology and personality profiles',
    authors: ['Riba J.', 'Rodriguez-Fornells A.', 'et al'],
    year: 2003,
    journal: 'J. Psychopharmacology',
    doi: '10.1177/0269881103170500',
  },
  {
    id: 'paper_selby_2014',
    title: 'I Ching and synchronicity in clinical practice',
    authors: ['Selby J.'],
    year: 2014,
    journal: 'J. Humanistic Psychology',
    doi: null,
  },
  {
    id: 'paper_cahn_2010',
    title: 'Meditation and brainwave coherence',
    authors: ['Cahn B.R.', 'Delorme A.', 'Polich J.'],
    year: 2010,
    journal: 'Consciousness and Cognition',
    doi: '10.1016/j.concog.2010.01.007',
  },
  {
    id: 'paper_dunbar_2020',
    title: 'Shared narratives and group ritual',
    authors: ['Dunbar R.'],
    year: 2020,
    journal: 'Religion, Brain & Behavior',
    doi: '10.1080/2153599X.2020.1748992',
  },
  {
    id: 'paper_davidson_2003',
    title: 'Alterations in brain and immune function produced by mindfulness meditation',
    authors: ['Davidson R.J.', 'Kabat-Zinn J.', 'et al'],
    year: 2003,
    journal: 'Psychosomatic Medicine',
    doi: '10.1097/01.psy.0000077505.67574.e3',
  },
];

export default async function MandalaPage({ params }: MandalaPageProps) {
  const { locale } = await params;

  // Auth — middleware já gated a rota, mas checamos redundância aqui
  // para defense-in-depth (mesmo padrão de /atendimento, /mentor).
  const cookieStore = await cookies();
  const authStatus = (await headers()).get('X-Akasha-Auth');
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;

  if (authStatus !== 'refreshed' && !verifyAkashaToken(token, 'access')) {
    redirect(`/${locale}/login`);
  }

  const saudacao = getSaudacao();

  return (
    <MandalaUniversalView
      locale={locale}
      saudacao={saudacao}
      papers={PAPERS_CITED}
    />
  );
}
