/**
 * Diário Energético — F-235 (Evolution v2).
 *
 * Refatorado de 5 snap-screens (677→~200 linhas) para scroll contínuo
 * com seções colapsáveis.
 *
 * Estrutura:
 *   <DiarioScrollContainer>
 *     <MandatoUnificado />       <- tela 1+2 fundidas
 *     <RitualSection />          <- tela 3
 *     <DiarioAuthorityBlock />   <- autoridade
 *     <SignificadoSection />     <- tela 4
 *     <AreasSection />           <- tela 5
 *   </DiarioScrollContainer>
 *
 * DailyResponse fields wired (Iteration 6 — Clarity + Content):
 *   climate  -> DiarioScrollContainer header badge
 *   alert   -> MandatoUnificado alert card
 *   ritual  -> RitualSection (pre-existing)
 *   tensionPoint -> DiarioAuthorityBlock tension callout
 *
 * Intentionally unused (documented):
 *   hexagram / hexagramLines — I Ching natal data; shown in Mandala, not diario
 *   synthesis — rendered by DiarioAuthorityBlock via deriveAkashaAuthority
 *   cycle — complex personal timing data; out of scope for this iteration
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import { getTranslations } from '@/lib/i18n';
import {
  significadosEspecificos,
  type Pilar,
  type PilaresDados,
} from '@/lib/grimoire/significados-curados';
import { deriveAkashaAuthority } from '@/lib/grimoire/synthesis/synthesizer';
import { praticaAuthorityDiaria } from '@/lib/grimoire/akasha-authority';

import { C } from '@/components/akasha/diario/types';
import type { MandatoDoDiaResponse, DailyResponse, DailyRitualUI } from '@/components/akasha/diario/types';
import { DiarioScrollContainer } from '@/components/akasha/diario/DiarioScrollContainer';
import { MandatoUnificado } from '@/components/akasha/diario/MandatoUnificado';
import { RitualSection } from '@/components/akasha/diario/RitualSection';
import { DiarioAuthorityBlock } from '@/components/akasha/diario/DiarioAuthorityBlock';
import { SignificadoSection } from '@/components/akasha/diario/SignificadoSection';
import { AreasSection } from '@/components/akasha/diario/AreasSection';
import { DiarioErrorBoundary } from '@/components/akasha/shared/DiarioErrorBoundary';

export const metadata = {
  title: 'Diário Energético — Akasha',
  description:
    'Mandato do dia, pergunta akáshica, micro-ritual e significado dos 5 Pilares traduzido para suas 8 áreas de vida.',
  openGraph: {
    title: 'Diário Energético — Akasha',
    description: 'Sua síntese energética diária segundo os 5 Pilares da Cabala.',
    type: 'website',
  },
};

export default async function DiarioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ intencao?: string }>;
}) {
  const { locale } = await params;
  const { intencao } = await searchParams;

  // Auth guard
  const cookieStore = await cookies();
  const token = cookieStore.get(AKASHA_TOKEN_COOKIE)?.value;
  const authStatus = (await headers()).get('X-Akasha-Auth');
  if (authStatus !== 'refreshed' && !verifyAkashaToken(token, 'access'))
    redirect(`/${locale}/login`);

  // Parallel fetch: /mandato-do-dia (pilares + autoridade synthesis) + /daily (ritual)
  const qs = intencao?.trim() ? `?intencao=${encodeURIComponent(intencao.trim())}` : '';
  const [mandatoRes, dailyRes] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/mandato-do-dia${qs}`,
      { method: 'GET', headers: { Cookie: `${AKASHA_TOKEN_COOKIE}=${token}` }, cache: 'no-store' }
    ),
    fetch(
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/daily`,
      { method: 'GET', headers: { Cookie: `${AKASHA_TOKEN_COOKIE}=${token}` }, cache: 'no-store' }
    ),
  ]);

  if (mandatoRes.status === 401 || mandatoRes.status === 404) redirect(`/${locale}/login`);

  const t = getTranslations(locale);

  if (!mandatoRes.ok) {
    return (
      <div className="min-h-dvh bg-[#06070F] flex items-center justify-center p-6">
        <div className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-[#FB5781]/40 border-l-4 border-l-[#FB5781] rounded-2xl p-6 max-w-md w-full">
          <span className="block text-[0.7rem] font-cinzel tracking-[0.2em] uppercase text-[#FB5781] mb-3">
            {t('diario.mandato.indisponivel')}
          </span>
          <p className="text-[0.9rem] leading-relaxed text-[#A7AECF]">
            {t('diario.mandato.indisponivelDesc', { status: String(mandatoRes.status) })}
          </p>
        </div>
      </div>
    );
  }

  const payload: MandatoDoDiaResponse = await mandatoRes.json();
  const { date, mandato, pilares, mentor_hook } = payload;

  const pilarPrincipal = (mandato.pilares_relevantes[0] ?? 'cabala') as Pilar;
  const pilarInfo = { nome: pilarPrincipal, cor: C.violeta };
  const crise = mentor_hook.crise_detectada;
  const lua_fase = pilares.astrologia?.lua_fase;

  // ── Derive real Akasha Authority from pilares (F-227 synthesis engine) ──
  const pilaresParciais: Partial<PilaresDados> = pilares as Partial<PilaresDados>;
  const authorityRaw = deriveAkashaAuthority(pilaresParciais);
  const authority = {
    ...authorityRaw,
    praticaDiaria: praticaAuthorityDiaria(pilaresParciais),
  };

  // ── Ritual + unused fields from /daily API ─────────────────────────────
  // §DailyResponse fields — all extracted here; each wired to its UI slot
  let ritual: DailyRitualUI;
  let climate: string | undefined;
  let alert: string | undefined;
  let tensionPoint: { theme: string } | undefined;

  if (dailyRes.ok) {
    const dailyPayload: DailyResponse = await dailyRes.json();

    // ritual — pre-existing wiring
    if (dailyPayload.ritual && typeof dailyPayload.ritual === 'object') {
      const r = dailyPayload.ritual as {
        titulo?: string;
        instrucao?: string;
        cor?: string;
        elemento?: string;
        herbs?: string[];
      };
      if (r.titulo && r.instrucao) {
        ritual = {
          titulo: r.titulo,
          instrucao: r.instrucao,
          elemento: r.elemento,
          cor: r.cor ?? pilarInfo.cor,
        };
      } else {
        ritual = buildRitualFallback(pilarPrincipal);
      }
    } else {
      ritual = buildRitualFallback(pilarPrincipal);
    }

    // §DailyResponse: climate — wired to DiarioScrollContainer header badge
    climate = typeof dailyPayload.climate === 'string' ? dailyPayload.climate : undefined;

    // §DailyResponse: alert — wired to MandatoUnificado alert card
    alert = typeof dailyPayload.alert === 'string' ? dailyPayload.alert : undefined;

    // §DailyResponse: tensionPoint — wired to DiarioAuthorityBlock tension callout
    if (
      dailyPayload.tensionPoint &&
      typeof dailyPayload.tensionPoint === 'object' &&
      'theme' in dailyPayload.tensionPoint
    ) {
      tensionPoint = { theme: String(dailyPayload.tensionPoint.theme) };
    }

    // Intentionally not wired in this iteration:
    //   hexagram / hexagramLines — I Ching natal/day data; belongs in Mandala or IchingInfoPanel
    //   synthesis — rendered via deriveAkashaAuthority + praticaAuthorityDiaria above
    //   cycle — complex personal timing data (personalDay/Month/Year, exercises, modulation)
    //     out of scope for Iteration 6; consider AreasSection integration in a future iteration
  } else {
    ritual = buildRitualFallback(pilarPrincipal);
  }

  const significados = significadosEspecificos(pilares as unknown as PilaresDados);

  return (
    <DiarioErrorBoundary locale={locale}>
      <DiarioScrollContainer
        date={date}
        pilarInfo={pilarInfo}
        pilarPrincipal={pilarPrincipal}
        lua_fase={lua_fase}
        totalSections={5}
        locale={locale}
        climate={climate}
      >
      <div data-section-index="1" className="max-w-xl mx-auto w-full px-5 pt-8 pb-4">
        <MandatoUnificado
          date={date}
          mandato={mandato}
          mentor_hook={mentor_hook}
          frases={[]}
          pilarInfo={pilarInfo}
          locale={locale}
          alert={alert}
        />
      </div>

      <div data-section-index="2" className="max-w-xl mx-auto w-full px-5 py-4">
        {ritual ? (
          <RitualSection ritual={ritual} pilarInfo={pilarInfo} locale={locale} />
        ) : null}
      </div>

      <div data-section-index="3" className="max-w-xl mx-auto w-full px-5 py-4">
        <DiarioAuthorityBlock
          authority={authority}
          pilares={pilaresParciais}
          locale={locale}
          tensionPoint={tensionPoint}
        />
      </div>

      <div data-section-index="4" className="max-w-xl mx-auto w-full px-5 py-4">
        <SignificadoSection
          pilares={pilares}
          pilarPrincipal={pilarPrincipal}
          significados={significados}
          locale={locale}
        />
      </div>

      <div data-section-index="5" className="max-w-xl mx-auto w-full px-5 py-4 pb-16">
        <AreasSection pilarPrincipal={pilarPrincipal} pilarInfo={pilarInfo} locale={locale} />
      </div>
    </DiarioScrollContainer>
    </DiarioErrorBoundary>
  );
}

/** Per-pilar ritual fallback — used when /daily API is unavailable. */
function buildRitualFallback(pilarPrincipal: string): DailyRitualUI {
  const mapa: Record<string, { titulo: string; instrucao: string }> = {
    cabala: {
      titulo: 'Conta-Cantiga',
      instrucao: 'Some os números do seu dia de nascimento e medite 3 minutos sobre o que esse número quer dizer na sua jornada.',
    },
    astrologia: {
      titulo: 'Respiração do Céu',
      instrucao: 'Respire 4-4-4-4 olhando o horizonte. Deixe a Lua e o signo do dia embalarem o silêncio.',
    },
    tantrica: {
      titulo: 'Varredura dos 11',
      instrucao: 'Passe 11 respirações por cada corpo sutil (alma -> mente -> corpo -> aura). Anote o que pulsou.',
    },
    odu: {
      titulo: 'Oração ao Ori',
      instrucao: 'Sente-se em terreiro (real ou mental). Agradeça ao seu Odu e peça uma orientação simples para o dia.',
    },
    iching: {
      titulo: 'Mutação em 3 Linhas',
      instrucao: 'Abra o hexagrama do dia. Leia as 3 linhas mutáveis. Escreva 1 palavra para cada.',
    },
  };
  return (
    mapa[pilarPrincipal] ?? {
      titulo: 'Silêncio de 3 min',
      instrucao: 'Sente-se, respire e anote o primeiro pensamento que surgir.',
    }
  );
}
