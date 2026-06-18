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
 */
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { verifyAkashaToken, AKASHA_TOKEN_COOKIE } from '@/lib/application/auth/akasha-jwt';
import {
  significadosEspecificos,
  type SignificadoCurado,
  type Pilar,
} from '@/lib/grimoire/significados-curados';

import { C } from '@/components/akasha/diario/types';
import type { MandatoDoDiaResponse, DailyRitualUI } from '@/components/akasha/diario/types';
import { DiarioScrollContainer } from '@/components/akasha/diario/DiarioScrollContainer';
import { MandatoUnificado } from '@/components/akasha/diario/MandatoUnificado';
import { RitualSection } from '@/components/akasha/diario/RitualSection';
import { DiarioAuthorityBlock } from '@/components/akasha/diario/DiarioAuthorityBlock';
import { SignificadoSection } from '@/components/akasha/diario/SignificadoSection';
import { AreasSection } from '@/components/akasha/diario/AreasSection';

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

type SignificadosPorPilar = {
  cabala: SignificadoCurado;
  astrologia: SignificadoCurado;
  tantrica: SignificadoCurado;
  odu: SignificadoCurado;
  iching: SignificadoCurado;
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

  // Data fetch
  const qs = intencao?.trim() ? `?intencao=${encodeURIComponent(intencao.trim())}` : '';
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/akasha/mandato-do-dia${qs}`,
    {
      method: 'GET',
      headers: { Cookie: `${AKASHA_TOKEN_COOKIE}=${token}` },
      cache: 'no-store',
    }
  );

  if (res.status === 401 || res.status === 404) redirect(`/${locale}/login`);

  if (!res.ok) {
    return (
      <div className="min-h-dvh bg-[#06070F] flex items-center justify-center p-6">
        <div className="bg-[rgba(11,14,28,0.72)] backdrop-blur-xl border border-[#FB5781]/40 border-l-4 border-l-[#FB5781] rounded-2xl p-6 max-w-md w-full">
          <span className="block text-[0.7rem] font-cinzel tracking-[0.2em] uppercase text-[#FB5781] mb-3">
            Mandato indisponível
          </span>
          <p className="text-[0.9rem] leading-relaxed text-[#A7AECF]">
            Não conseguimos calcular o Mandato de hoje ({res.status}). Tente novamente em alguns instantes.
          </p>
        </div>
      </div>
    );
  }

  const payload: MandatoDoDiaResponse = await res.json();
  const { date, mandato, pilares, mentor_hook } = payload;

  const pilarPrincipal = (mandato.pilares_relevantes[0] ?? 'cabala') as Pilar;
  const pilarInfo = { nome: pilarPrincipal, cor: C.violeta };
  const crise = mentor_hook.crise_detectada;

  const frases = crise ? [] : extractFrasesFallback(mandato.redacao_bruta);
  const ritual = buildRitual(pilarPrincipal);
  const authority = buildAuthority();

  const significados = significadosEspecificos(
    pilares as unknown as Parameters<typeof significadosEspecificos>[0]
  );

  return (
    <DiarioScrollContainer
      date={date}
      pilarInfo={pilarInfo}
      pilarPrincipal={pilarPrincipal}
      totalSections={5}
      locale={locale}
    >
      <div className="max-w-xl mx-auto w-full px-5 pt-8 pb-4">
        <MandatoUnificado
          date={date}
          mandato={mandato}
          mentor_hook={mentor_hook}
          frases={frases}
          pilarInfo={pilarInfo}
        />
      </div>

      <div className="max-w-xl mx-auto w-full px-5 py-4">
        <RitualSection ritual={ritual} pilarInfo={pilarInfo} locale={locale} />
      </div>

      <div className="max-w-xl mx-auto w-full px-5 py-4">
        <DiarioAuthorityBlock
          authority={authority}
          pilares={pilares as unknown as never}
          locale={locale}
        />
      </div>

      <div className="max-w-xl mx-auto w-full px-5 py-4">
        <SignificadoSection
          pilares={pilares}
          pilarPrincipal={pilarPrincipal}
          significados={significados}
        />
      </div>

      <div className="max-w-xl mx-auto w-full px-5 py-4 pb-16">
        <AreasSection pilarPrincipal={pilarPrincipal} pilarInfo={pilarInfo} />
      </div>
    </DiarioScrollContainer>
  );
}

function extractFrasesFallback(redacao: string): string[] {
  const cleaned = redacao.replace(/\s*\(LLM redige.*?\)\.?\s*$/i, '').trim();
  const raw = cleaned
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (raw.length >= 3) return raw.slice(0, 3);
  return raw.length > 0 ? [cleaned] : ['(Mandato vazio — tente novamente)'];
}

function buildRitual(pilarPrincipal: string): DailyRitualUI {
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

function buildAuthority(): {
  estrategia: 'act' | 'wait' | 'observe' | 'surrender';
  autoridade: 'emocional' | 'sagrada' | 'esplénica' | 'mental';
  explicacao: string;
  regra: { condicao: string; accao: string };
  timing: { melhor: string; pior: string };
  decisaoHoje: string;
  praticaDiaria: string;
} {
  return {
    estrategia: 'observe',
    autoridade: 'mental',
    explicacao: 'Observe antes de agir.',
    regra: { condicao: 'Quando há incerteza', accao: 'Observe sem julgue' },
    timing: { melhor: 'Manhã', pior: 'Noite' },
    decisaoHoje: 'Aguarde clareza',
    praticaDiaria: 'Respire antes de decidir',
  };
}
