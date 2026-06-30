// ============================================================================
// Reading Detail — `/leitura/[id]` — Wave 93 i18n rollout
// ============================================================================
// Renderiza uma leitura espiritual baseada no Odu sorteado (id 1..16).
// Página server-side: lê locale do cookie via resolveServerLocale() e renderiza
// em PT-BR/EN/ES com termos sagrados preservados verbatim.
//
// USO:
//   /leitura/1  → leitura do Odu Ogbe (1)
//   /leitura/11 → leitura do Odu Owarin (11)
//
// ============================================================================

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LocaleSwitcher } from '@/components/i18n/LocaleSwitcher';
import { LocaleAwareImage } from '@/components/i18n/LocaleAwareImage';
import { PluralText } from '@/components/i18n/PluralText';
import { resolveServerLocale, getServerDict } from '@/lib/w93/i18n-rollout-routing';
import {
  asTranslationKeyW93,
  formatDate,
  isSupportedLocaleW93,
} from '@/lib/w93/i18n-rollout-engine';
import { getOduById, ODUS, type Odu } from '@/lib/constants/odus';
import type { SupportedLocaleW93 } from '@/lib/w93/i18n-rollout-strings';

interface LeituraPageProps {
  params: { id: string };
}

// Impede pre-render estático: precisa ler cookie do request.
export const dynamic = 'force-dynamic';

/**
 * Mapa estático de imagens por Odu (placeholder até assets reais serem criados).
 * Estrutura segue o pattern: /images/odus/{slug}.webp
 */
const ODU_IMAGE_SLUG: Readonly<Record<number, string>> = Object.freeze({
  1: 'ogbe',
  2: 'ejioko',
  3: 'etogunda',
  4: 'irosun',
  5: 'oxe',
  6: 'obara',
  7: 'odi',
  8: 'ejionile',
  9: 'ossa',
  10: 'ofun',
  11: 'owarin',
  12: 'ejilaxebo',
  13: 'oturupon',
  14: 'otura',
  15: 'ika',
  16: 'ofurufu',
});

/**
 * Helper para resolver uma chave de tradução server-side.
 * (Wrapper sobre t() com fallback pt-BR automático via getServerDict.)
 */
function t(
  key: string,
  dict: ReturnType<typeof getServerDict>['dict'],
  fallback: ReturnType<typeof getServerDict>['fallback'],
  vars?: Record<string, string | number>,
): string {
  const tk = asTranslationKeyW93(key);
  let template = dict[tk];
  if (template === undefined && fallback) {
    template = fallback[tk];
  }
  if (template === undefined) return key;
  if (!vars) return template;
  return template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, name: string) => {
    if (Object.prototype.hasOwnProperty.call(vars, name)) {
      const v = vars[name];
      return v === undefined ? match : String(v);
    }
    return match;
  });
}

export async function generateMetadata({ params }: LeituraPageProps) {
  const idNum = parseInt(params.id, 10);
  const odu = getOduById(idNum);
  if (!odu) {
    return { title: 'Leitura não encontrada · Akasha' };
  }
  return {
    title: `${odu.name} · Akasha`,
    description: `Interpretação do Odu ${odu.name} — ${odu.essence}`,
  };
}

export default function LeituraPage({ params }: LeituraPageProps) {
  const idNum = parseInt(params.id, 10);
  const odu = getOduById(idNum);
  if (!odu) {
    notFound();
  }

  const locale = resolveServerLocale();
  const { dict, fallback } = getServerDict(locale);

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header com LocaleSwitcher */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-lg font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
            Akasha
          </Link>
          <LocaleSwitcher />
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-8">
        <LeituraHeader odu={odu} locale={locale} dict={dict} fallback={fallback} tFn={t} />
        <LeituraBody odu={odu} locale={locale} dict={dict} fallback={fallback} tFn={t} />
        <LeituraFooter odu={odu} locale={locale} dict={dict} fallback={fallback} tFn={t} />
      </article>
    </main>
  );
}

type TFunction = (
  key: string,
  dict: ReturnType<typeof getServerDict>['dict'],
  fallback: ReturnType<typeof getServerDict>['fallback'],
  vars?: Record<string, string | number>,
) => string;

function LeituraHeader({
  odu, locale, dict, fallback, tFn,
}: {
  odu: Odu;
  locale: SupportedLocaleW93;
  dict: ReturnType<typeof getServerDict>['dict'];
  fallback: ReturnType<typeof getServerDict>['fallback'];
  tFn: TFunction;
}) {
  const slug = ODU_IMAGE_SLUG[odu.id] ?? 'ogbe';
  const orixasStr = odu.orixas.join(', ');

  return (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        <LocaleAwareImage
          src={`/images/odus/${slug}.webp`}
          width={180}
          height={180}
          alt={{
            'pt-BR': `Odu ${odu.name}`,
            en: `Odu ${odu.name}`,
            es: `Odu ${odu.name}`,
          }}
          altPrefix={{
            'pt-BR': tFn('aria.odu.image', dict, fallback, { name: odu.name }),
            en: tFn('aria.odu.image', dict, fallback, { name: odu.name }),
            es: tFn('aria.odu.image', dict, fallback, { name: odu.name }),
          }}
          className="rounded-2xl border border-amber-500/30 shadow-lg shadow-amber-500/10"
        />

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            {odu.name}
          </h1>
          <p className="text-sm text-muted-foreground mb-3">
            {tFn('odu.label.header', dict, fallback, { name: odu.name })}
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs">
              ✦ {tFn('odu.label.essence', dict, fallback)}: {odu.essence}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
              🌿 {tFn('odu.label.orixas', dict, fallback)}: {orixasStr}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LeituraBody({
  odu, locale, dict, fallback, tFn,
}: {
  odu: Odu;
  locale: SupportedLocaleW93;
  dict: ReturnType<typeof getServerDict>['dict'];
  fallback: ReturnType<typeof getServerDict>['fallback'];
  tFn: TFunction;
}) {
  const orixasStr = odu.orixas.join(', ');
  const consultDate = formatDate(new Date(), locale, { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-3 text-slate-100">
          {tFn('reading.section.summary', dict, fallback)}
        </h2>
        <p className="text-base text-slate-300 leading-relaxed">
          {tFn('odu.interpretation.intro', dict, fallback, { name: odu.name, essence: odu.essence, orixas: orixasStr })}
        </p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3 text-slate-100">
          {tFn('reading.section.interpretation', dict, fallback)}
        </h2>
        <ul className="space-y-3 text-slate-300">
          <li className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm">
              {tFn('odu.interpretation.opening', dict, fallback, { essence: odu.essence })}
            </p>
          </li>
          <li className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm">
              {tFn('odu.interpretation.advice', dict, fallback, { essence: odu.essence, n: 3 })}
            </p>
          </li>
          <li className="p-4 rounded-lg bg-card border border-border">
            <p className="text-sm">
              {tFn('odu.interpretation.caution', dict, fallback, { name: odu.name })}
            </p>
          </li>
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-3 text-slate-100">
          {tFn('reading.section.recommendations', dict, fallback)}
        </h2>
        <div className="rounded-lg bg-card border border-border p-4 space-y-2">
          <p className="text-sm text-slate-300">
            <PluralTextServer
              singularKey="odu.cross.house.label"
              pluralKey="odu.cross.house.label"
              n={odu.id}
              locale={locale}
              vars={{ name: odu.name }}
            />
          </p>
          <p className="text-xs text-muted-foreground italic">
            {tFn('reading.disclaimer', dict, fallback)}
          </p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        {tFn('reading.subtitle.consult', dict, fallback, { date: consultDate })}
      </div>
    </section>
  );
}

/**
 * PluralText server-rendered (sem hook). Usa Intl.PluralRules + lookup direto
 * no dicionário. Hidrata no client quando LocaleSwitcher muda.
 */
function PluralTextServer({
  singularKey,
  pluralKey,
  n,
  locale,
  vars,
}: {
  singularKey: string;
  pluralKey: string;
  n: number;
  locale: SupportedLocaleW93;
  vars?: Record<string, string | number>;
}) {
  const dict = getServerDict(locale).dict;
  // CLDR via W93 engine — import lazily para evitar bundle no server
  const { pluralRules } = require('@/lib/w93/i18n-rollout-engine') as typeof import('@/lib/w93/i18n-rollout-engine');
  const category = pluralRules.select(n, locale);
  const key = category === 'one' || category === 'zero' ? singularKey : pluralKey;
  const template = dict[asTranslationKeyW93(key)];
  if (template === undefined) return <span>{n}</span>;
  const merged: Record<string, string | number> = vars ? { ...vars, n } : { n };
  const rendered = template.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, (match, name: string) => {
    if (Object.prototype.hasOwnProperty.call(merged, name)) {
      const v = merged[name];
      return v === undefined ? match : String(v);
    }
    return match;
  });
  return <span>{rendered}</span>;
}

function LeituraFooter({
  odu, locale, dict, fallback, tFn,
}: {
  odu: Odu;
  locale: SupportedLocaleW93;
  dict: ReturnType<typeof getServerDict>['dict'];
  fallback: ReturnType<typeof getServerDict>['fallback'];
  tFn: TFunction;
}) {
  return (
    <footer className="mt-12 pt-6 border-t border-border space-y-4">
      <p className="text-xs text-muted-foreground italic text-center">
        {tFn('reading.disclaimer', dict, fallback)}
      </p>
      <p className="text-xs text-center text-muted-foreground">
        {tFn('tradition.oduMethodNote', dict, fallback)}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Button variant="outline" className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10">
          {tFn('reading.cta.save', dict, fallback)}
        </Button>
        <Button variant="outline" className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10">
          {tFn('reading.cta.share', dict, fallback)}
        </Button>
        <Link href="/leitura">
          <Button className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0">
            {tFn('reading.cta.newReading', dict, fallback)}
          </Button>
        </Link>
      </div>
    </footer>
  );
}