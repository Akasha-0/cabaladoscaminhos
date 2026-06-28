// ============================================================================
// /beta — Landing page de inscrição para o beta privado (Wave 28)
// ============================================================================
// Página white-glove para os 50 vagas do beta fechado. Substitui o "Em
// breve" do /validacao Variants A-D por uma landing dedicada, com copy
// alinhada ao `docs/BETA-LAUNCH-PLAYBOOK.md` (Wave 16) e ao WAVE-28-PLAN.md.
//
// Estrutura:
//   1. Hero (badge "Beta Pioneer" + deadline + social proof)
//   2. "Como funciona" (4 fases + 3 ondas)
//   3. "O que espera o beta user" (white-glove + 1-on-1 + feedback)
//   4. "Quem está por trás" (bio operador + link VISION)
//   5. "Princípios" (8 princípios do playbook — constrói confiança)
//   6. Form de signup (BetaSignupForm, magic-link-aware)
//
// SEO: Metadata completa (title, description, OG image, twitter card,
// robots). Canonical = /beta.
//
// Magic link flow: ?token=<uuid>&wave=1|2|3 → form pré-marca como "Convite
// pessoal" + tracking source='beta-magic-link'.
//
// Tracking: page_viewed com query.token (se houver) + funnel via
// BetaSignupForm (page_viewed em /beta-signup-success).
//
// Status: ✅ Scaffold completo, dry-run em preview.
// Pendências: ver DELIVERABLE-BETA-SCAFFOLD-W28.md (criar
// /api/beta/invite/route.ts + validar magic-link tokens, schema
// estendido /api/waitlist).
// ============================================================================

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles, Users, Brain, BookOpen, MessageCircle,
  ArrowRight, Gift, Clock, ShieldCheck, Lock, Mic, Compass,
  Mail, ChevronRight, Star,
} from 'lucide-react';
import { BetaSignupForm } from '@/components/beta/BetaSignupForm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Beta Akasha · 50 vagas em 3 ondas · Co-evolução comunidade × IA',
  description:
    'A primeira comunidade universalista de espiritualidade do Brasil. Cabala, Ifá, Tantra, Astrologia, Xamanismo — e a ciência por trás de tudo. White-glove onboarding, 1-on-1 com o fundador, acesso early a features. 50 vagas em 3 ondas de 10+20+20.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/beta' },
  openGraph: {
    title: 'Beta Akasha · 50 vagas em 3 ondas',
    description:
      'Comunidade universalista de espiritualidade com IA tradutora. White-glove onboarding. Inscrição aberta.',
    type: 'website',
    url: '/beta',
    images: [{ url: '/og/beta.png', width: 1200, height: 630, alt: 'Beta Akasha · 50 vagas' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Beta Akasha · 50 vagas em 3 ondas',
    description:
      'Comunidade universalista de espiritualidade com IA tradutora. White-glove onboarding.',
    images: ['/og/beta.png'],
  },
};

interface PageProps {
  searchParams?: Promise<{ token?: string; wave?: string; ref?: string }>;
}

export default async function BetaPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const inviteToken = typeof params.token === 'string' && params.token.length > 0 ? params.token : undefined;
  const waveParam = params.wave;
  const wave: '1' | '2' | '3' | undefined =
    waveParam === '1' || waveParam === '2' || waveParam === '3' ? waveParam : undefined;
  const ref = typeof params.ref === 'string' ? params.ref : undefined;

  return (
    <div className="min-h-screen">
      {/* ================================================================== */}
      {/* HERO                                                               */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-pink-500/10" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.18), transparent 60%)',
          }}
        />

        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-caps mb-6">
            <Sparkles className="w-3 h-3" />
            Beta privado · Onda {wave ?? '?'} · 50 vagas
          </div>

          <h1 className="text-display-6xl md:text-display-7xl mb-4 leading-[1.05]">
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Akasha
            </span>
          </h1>

          <h2 className="text-3xl md:text-4xl text-slate-100 mb-6 font-serif">
            A primeira comunidade{' '}
            <span className="bg-gradient-to-r from-violet-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              universalista
            </span>{' '}
            de espiritualidade do Brasil
          </h2>

          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Cabala, Ifá, Tantra, Astrologia, Xamanismo — e a ciência por trás de tudo.
            Uma IA curadora aprende com você, e a comunidade{' '}
            <span className="text-amber-300 font-medium">co-evolui</span> com a IA.
          </p>

          {/* Social proof — 3 stats */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-tiny text-slate-400 mb-8">
            <Stat icon={<Users className="w-3 h-3" />} label="1.200+ na lista de espera" />
            <Stat icon={<BookOpen className="w-3 h-3" />} label="50+ artigos curados" />
            <Stat icon={<Star className="w-3 h-3" />} label="8 tradições representadas" />
          </div>

          {/* CTA principal → scroll suave para form */}
          <a
            href="#inscricao"
            className="inline-flex items-center gap-2 px-6 h-12 rounded-lg bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white font-semibold text-base transition shadow-lg shadow-amber-500/20"
          >
            {inviteToken ? 'Confirmar meu convite' : 'Inscrever-se na lista'}
            <ArrowRight className="w-4 h-4" />
          </a>

          <p className="text-tiny text-slate-500 mt-4">
            100% gratuito durante a beta · Sem spam · LGPD
          </p>
        </div>
      </section>

      {/* ================================================================== */}
      {/* COMO FUNCIONA — 4 fases + 3 ondas                                  */}
      {/* ================================================================== */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-caps text-amber-300 mb-3">Como funciona</p>
          <h2 className="text-display-5xl text-slate-100 mb-3">
            4 fases · 3 ondas · 50 pessoas
          </h2>
          <p className="text-body text-slate-400 max-w-2xl mx-auto">
            White-glove do início ao fim. Cada beta user recebe atenção
            pessoal do fundador — não é self-serve.
          </p>
        </div>

        {/* Ondas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <WaveCard
            wave="1"
            size="10"
            label="Pioneiros"
            description="Validação operacional: funciona? Quais problemas invisíveis aparecem?"
            active={wave === '1'}
          />
          <WaveCard
            wave="2"
            size="20"
            label="Expansão"
            description="Validação de mix: perfis diversos convivem bem? Feed lida com múltiplas tradições?"
            active={wave === '2'}
          />
          <WaveCard
            wave="3"
            size="20"
            label="Comunidade"
            description="Validação social: cross-tradition engagement acontece? Efeito-rede começa?"
            active={wave === '3'}
          />
        </div>

        {/* Fases */}
        <div className="space-y-3">
          <Phase
            num="1"
            title="Pre-launch"
            timeline="T-30 a T-7"
            description="Você recebe emails de aquecimento com conteúdo conceitual — sem hype, só provocação intelectual."
          />
          <Phase
            num="2"
            title="Convite personalizado"
            timeline="T-7"
            description="O fundador escolhe manualmente quem entra, com base no seu perfil + tradição + disponibilidade."
          />
          <Phase
            num="3"
            title="Onboarding white-glove"
            timeline="T+0 a T+14"
            description="1-on-1 de 30min com o fundador. Tour pelo app. Configuração do mapa espiritual pessoal."
          />
          <Phase
            num="4"
            title="Co-evolução"
            timeline="T+0 a T+30"
            description="Você usa, dá feedback semanal, e a IA aprende com você. Office hours diários com o time."
          />
        </div>
      </section>

      {/* ================================================================== */}
      {/* O QUE VOCÊ RECEBE                                                  */}
      {/* ================================================================== */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-caps text-violet-300 mb-3">O que você recebe</p>
          <h2 className="text-display-5xl text-slate-100 mb-3">
            Acesso direto ao fundador + IA que aprende com você
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <BenefitCard
            icon={<Mic className="w-5 h-5" />}
            color="amber"
            title="1-on-1 de 30min"
            description="Conversa particular com o fundador. Conte sua motivação, alinhe expectativas, tire dúvidas sobre o método."
          />
          <BenefitCard
            icon={<MessageCircle className="w-5 h-5" />}
            color="violet"
            title="Canal direto #feedback"
            description="Sem filtro. Bug, sugestão, crítica — você fala, fundador responde em menos de 24h úteis."
          />
          <BenefitCard
            icon={<Compass className="w-5 h-5" />}
            color="emerald"
            title="Mapa espiritual pessoal"
            description="Cruzamento dos 4 mapas (Numerologia Cabalística + Tântrica + Astrologia + Odu de Ifá) interpretado pela IA."
          />
          <BenefitCard
            icon={<Brain className="w-5 h-5" />}
            color="pink"
            title="IA tradutora"
            description="Pergunte qualquer coisa — tradição ↔ ciência ↔ experiência. Ela cita papers, ouve entidades, lembra limites."
          />
          <BenefitCard
            icon={<Users className="w-5 h-5" />}
            color="amber"
            title="Comunidade curada"
            description="49 outras pessoas selecionadas a dedo. Sem trolls, sem gurus, sem proselitismo. Universalismo radical."
          />
          <BenefitCard
            icon={<Gift className="w-5 h-5" />}
            color="violet"
            title="Badge Beta Pioneer"
            description="Você entra na história como um dos 50 primeiros. List pública em /beta/thanks + advisory board (top 5)."
          />
        </div>
      </section>

      {/* ================================================================== */}
      {/* QUEM ESTÁ POR TRÁS                                                 */}
      {/* ================================================================== */}
      <section className="max-w-4xl mx-auto px-4 py-16 md:py-20">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-900/80 border border-slate-800 p-8 md:p-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-violet-500 flex items-center justify-center text-2xl flex-shrink-0">
              🜂
            </div>
            <div>
              <p className="text-caps text-amber-300 mb-1">Quem está por trás</p>
              <h3 className="text-2xl text-slate-100">
                Fundador-operator, não CEO
              </h3>
            </div>
          </div>

          <p className="text-body text-slate-300 mb-4 leading-relaxed">
            Akasha é um projeto pessoal, não uma startup. O operador combina{' '}
            <span className="text-amber-300">tradição cigana Ramiro</span> com{' '}
            <span className="text-violet-300">engenharia de software</span>, e está
            construindo a plataforma que ele mesmo queria existir — uma onde Cabala
            conversa com neurociência, Ifá conversa com astrologia, e a IA aprende
            com a comunidade em vez de ensinar de cima pra baixo.
          </p>

          <p className="text-body text-slate-300 mb-6 leading-relaxed">
            Sem investidores, sem B2B, sem fins lucrativos. A beta é para validar a
            tese de <em>co-evolução comunidade × IA</em> antes da abertura pública.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/manifesto"
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-200 text-sm transition"
            >
              Ler manifesto
              <ChevronRight className="w-3 h-3" />
            </Link>
            <Link
              href="/vision"
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700 text-slate-200 text-sm transition"
            >
              Ver VISION.md
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PRINCÍPIOS (8 do BETA-LAUNCH-PLAYBOOK)                              */}
      {/* ================================================================== */}
      <section className="max-w-5xl mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-10">
          <p className="text-caps text-emerald-300 mb-3">Princípios do beta</p>
          <h2 className="text-display-5xl text-slate-100 mb-3">
            Como a gente opera
          </h2>
          <p className="text-body text-slate-400 max-w-2xl mx-auto">
            Estes 8 princípios guiam toda decisão durante a beta. Se uma ação
            viola um princípio, ela não acontece.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.title}
              className="flex items-start gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800/50"
            >
              <span className="text-amber-300 font-mono text-tiny mt-0.5 w-6 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h4 className="text-slate-100 font-medium mb-1">{p.title}</h4>
                <p className="text-caption text-slate-400 leading-relaxed">
                  {p.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================== */}
      {/* FORMULÁRIO DE INSCRIÇÃO                                            */}
      {/* ================================================================== */}
      <section id="inscricao" className="max-w-2xl mx-auto px-4 py-16 md:py-20 scroll-mt-20">
        <div className="text-center mb-8">
          <p className="text-caps text-amber-300 mb-3">
            {inviteToken ? 'Confirme seu convite' : 'Inscreva-se na lista'}
          </p>
          <h2 className="text-display-5xl text-slate-100 mb-3">
            {inviteToken ? 'Bem-vindo(a) à beta' : 'Entre na fila'}
          </h2>
          <p className="text-body text-slate-400">
            {inviteToken
              ? `Você foi convidado(a) pessoalmente para a Onda ${wave ?? '?'}. Confirme abaixo.`
              : 'Sem compromisso. Você recebe um email quando uma vaga abrir (estimativa: 7 dias).'}
          </p>
        </div>

        <BetaSignupForm
          inviteToken={inviteToken}
          wave={wave}
          source={inviteToken ? 'beta-magic-link' : 'beta-landing'}
        />

        {ref && (
          <p className="text-tiny text-slate-500 text-center mt-4">
            Indicado por: <span className="text-slate-400">{ref}</span>
          </p>
        )}
      </section>

      {/* ================================================================== */}
      {/* CTA FINAL + FOOTER MÍNIMO                                          */}
      {/* ================================================================== */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/40 border border-slate-800/50">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <p className="text-body text-slate-300 mb-2">
            <Lock className="w-3 h-3 inline mr-1 -mt-0.5" />
            <strong className="text-slate-100">Privacidade & LGPD:</strong> seus dados ficam no nosso
            servidor. Usamos só para o beta — sem spam, sem venda, sem compartilhamento.
          </p>
          <p className="text-tiny text-slate-500">
            Dúvidas? <Mail className="w-3 h-3 inline mr-0.5 -mt-0.5" />
            <a href="mailto:beta@akasha.portal" className="text-amber-300 hover:underline">
              beta@akasha.portal
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {icon}
      {label}
    </span>
  );
}

function WaveCard({
  wave, size, label, description, active,
}: {
  wave: string;
  size: string;
  label: string;
  description: string;
  active?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-2xl border ${
        active
          ? 'bg-amber-500/10 border-amber-400/50 ring-2 ring-amber-400/30'
          : 'bg-slate-900/50 border-slate-800/50'
      }`}
    >
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-caps ${active ? 'text-amber-300' : 'text-slate-500'}`}>
          Onda {wave}
        </span>
        <span className={`text-3xl ${active ? 'text-amber-200' : 'text-slate-200'}`}>
          {size}
        </span>
        <span className="text-caption text-slate-500">pessoas</span>
      </div>
      <h3 className={`text-lg mb-1 ${active ? 'text-amber-100' : 'text-slate-100'}`}>
        {label}
      </h3>
      <p className="text-caption text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

function Phase({
  num, title, timeline, description,
}: {
  num: string;
  title: string;
  timeline: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/50">
      <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 font-mono flex-shrink-0">
        {num}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-1">
          <h3 className="text-slate-100">{title}</h3>
          <span className="text-tiny text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeline}
          </span>
        </div>
        <p className="text-caption text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function BenefitCard({
  icon, title, description, color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'amber' | 'violet' | 'emerald' | 'pink';
}) {
  const colorClasses = {
    amber: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400',
    violet: 'from-violet-500/10 to-violet-500/5 border-violet-500/20 text-violet-400',
    emerald: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400',
    pink: 'from-pink-500/10 to-pink-500/5 border-pink-500/20 text-pink-400',
  };

  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm`}>
      <div className="w-10 h-10 rounded-lg bg-slate-900/50 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-slate-100 mb-1.5">{title}</h3>
      <p className="text-caption text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}

// ============================================================================
// Data — 8 princípios do BETA-LAUNCH-PLAYBOOK.md
// ============================================================================

const PRINCIPLES = [
  {
    title: 'Escassez honesta',
    description: '50 vagas porque é o que cabe num beta white-glove — não como growth hack.',
  },
  {
    title: 'White-glove sempre',
    description: 'Todo beta user recebe atenção pessoal. 1-on-1 de 30min com o fundador.',
  },
  {
    title: 'Diversidade de público',
    description: 'Os 4 perfis do VISION representados: Buscador, Praticante, Acadêmico, Curador.',
  },
  {
    title: 'Co-evolução desde o dia 1',
    description: 'Feedback dos beta users molda a IA. Loop semanal, não mensal.',
  },
  {
    title: 'Sem guru, sem seita',
    description: 'A IA não prescreve, não promete cura, lembra limitações.',
  },
  {
    title: 'Mobile-first',
    description: 'Uso cotidiano, consulta rápida. Toda comunicação é desenhada mobile.',
  },
  {
    title: 'Transparência radical',
    description: 'Números de retenção, decisões, problemas são públicos internamente.',
  },
  {
    title: 'Respeito às tradições',
    description: 'Nenhuma tradição é dominante. Curadoria protege pluralismo.',
  },
] as const;
