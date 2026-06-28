// ============================================================================
// Variant A — Waitlist simples (baseline)
// ============================================================================
// Hipótese: CTA único + benefícios = menor fricção. Baseline para comparar
// com B/C/D. Conteúdo praticamente idêntico ao legado — só ganhou
// props tipadas e o tracking de funil.
//
// Métricas: visitor → waitlist signup. CR esperado: 3-5%.
// ============================================================================

import { Sparkles, Users, Brain, BookOpen, Mail, ShieldCheck } from 'lucide-react';
import { WaitlistForm } from '@/components/validation/WaitlistForm';
import { ExitIntentModal } from '@/components/conversion/ExitIntentModal';
import { MobileCaptureBar } from '@/components/conversion/MobileCaptureBar';
import { LandingTracker } from '@/components/conversion/LandingTracker';
import { SocialShareButtons } from '@/components/conversion/SocialShareButtons';

interface Props {
  userId?: string;
  referrer?: string;
  source?: string;
  referralCode?: string;
}

const BENEFITS = [
  {
    icon: Users,
    title: 'Comunidade multi-tradição',
    description:
      'Conecte-se com praticantes de Cabala, Ifá, Xamanismo, Tantra, Reiki, Astrologia e mais — sem proselitismo, sem gurus.',
    accent: 'amber' as const,
  },
  {
    icon: Brain,
    title: 'IA curadora',
    description:
      'Uma consciência que correlaciona tradição e ciência. Sugere leituras, encontra padrões, conecta saberes — sem prescrever nada.',
    accent: 'violet' as const,
  },
  {
    icon: BookOpen,
    title: 'Evidência científica',
    description:
      'Papers, níveis de evidência, sem charlatanismo. Cada artigo curado com a fonte e o rigor que sua prática merece.',
    accent: 'emerald' as const,
  },
];

const TRUST_SIGNALS = [
  'Beta privado com 50 vagas',
  'Sem spam, sem compartilhar seus dados',
  'Cancele a qualquer momento com 1 clique',
];

export function VariantAPage({ userId, source, referralCode }: Props) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <LandingTracker variant="A" userId={userId} />

      <section className="relative overflow-hidden">
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-pink-500/10" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.18), transparent 60%)',
          }}
        />

        <div className="relative max-w-3xl mx-auto px-5 pt-16 pb-12 md:pt-24 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Beta privado • 50 vagas
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-cinzel font-bold leading-[1.1] mb-5">
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              A maior comunidade de espiritualidade universalista
            </span>
            <br />
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              do Brasil está chegando
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            <span className="text-amber-300">Cabala, Ifá, Xamanismo, Tantra, Reiki</span>{' '}
            — e a ciência por trás de tudo. Junte-se ao beta privado.
          </p>

          <WaitlistForm source={source ?? 'validacao-A'} />

          <ul className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
            {TRUST_SIGNALS.map((signal) => (
              <li key={signal} className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                {signal}
              </li>
            ))}
          </ul>

          {referralCode && (
            <p className="mt-3 text-xs text-violet-300">
              ✨ Indicado por <code className="font-mono">{referralCode}</code> —
              ambos ganham prioridade na fila.
            </p>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-5 py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-cinzel bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent mb-2">
            Por que entrar agora
          </h2>
          <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto">
            Estamos abrindo as portas para 50 praticantes que querem
            co-construir a primeira comunidade verdadeiramente multi-tradição do Brasil.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {BENEFITS.map((b) => {
            const accentClasses = {
              amber:
                'from-amber-500/10 to-amber-500/5 border-amber-500/25 text-amber-400',
              violet:
                'from-violet-500/10 to-violet-500/5 border-violet-500/25 text-violet-400',
              emerald:
                'from-emerald-500/10 to-emerald-500/5 border-emerald-500/25 text-emerald-400',
            }[b.accent];

            const Icon = b.icon;
            return (
              <article
                key={b.title}
                className={`p-6 rounded-2xl bg-gradient-to-br ${accentClasses} border backdrop-blur-sm`}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900/60 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                  {b.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {b.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 py-10">
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-center">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-3">
            Validação inicial
          </p>
          <p className="text-base md:text-lg text-slate-300 italic leading-relaxed">
            &ldquo;Sempre quis um espaço onde eu pudesse estudar Cabala sem abrir mão
            do Candomblé — e onde alguém me apontasse os papers quando eu pedisse
            evidência.&rdquo;
          </p>
          <p className="mt-3 text-xs text-slate-500">
            — Depoimento representativo do público-alvo (placeholder)
          </p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-5 pb-20 text-center">
        <div className="p-8 md:p-10 rounded-3xl bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-pink-500/10 border border-amber-500/25">
          <Mail className="w-8 h-8 mx-auto text-amber-400 mb-3" />
          <h2 className="text-2xl md:text-3xl font-cinzel text-slate-100 mb-3">
            Só 50 vagas neste beta
          </h2>
          <p className="text-slate-400 mb-6 text-sm md:text-base">
            Quando as vagas encherem, abrimos lista de espera para a próxima turma.
            Entre agora para garantir sua posição.
          </p>
          <WaitlistForm source={source ?? 'validacao-A-cta-final'} />
          <p className="mt-5 text-xs text-slate-500">
            Sem cartão de crédito. Acesso gratuito durante o beta.
          </p>
        </div>

        <SocialShareButtons
          url="https://akashaportal.com/validacao"
          title="Entrei na lista de espera do Akasha Portal — espiritualidade universalista com rigor científico"
          variant="A"
        />
      </section>

      <footer className="border-t border-slate-800/50 py-6 text-center text-xs text-slate-500">
        <p>
          Akasha Portal — projeto comunitário sem fins lucrativos.
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> · </span>
          Dúvidas?{' '}
          <a
            href="mailto:contato@akashaportal.com"
            className="text-amber-400 hover:text-amber-300 underline underline-offset-2"
          >
            contato@akashaportal.com
          </a>
        </p>
      </footer>

      <ExitIntentModal variant="A" />
      <MobileCaptureBar variant="A" />
    </main>
  );
}
