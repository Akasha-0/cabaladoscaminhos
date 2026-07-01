// ============================================================================
// /(info)/launch — Public Launch Landing Page (Wave 37)
// ============================================================================
// Hero com manifesto + vídeo embed · 7 tradições showcase · Akasha IA highlight
// · Testimonials anonimizados · Pricing Tiers (Free + Pro) · FAQ · CTA principal
// · Social proof (50 beta users, NPS, D7 retention).
//
// SEO:
//   - canonical /launch
//   - JSON-LD: Organization + WebSite + FAQ + Product + Breadcrumb
//   - keywords alvo: comunidade espiritual, IA curadora, espiritualidade
//   - open beta gate: copy fala de "comunidade aberta" sem prometer acesso
// ============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import {
  buildPageMetadata,
  SeoJsonLd,
  organizationLd,
  websiteLd,
  faqLd,
  breadcrumbLd,
} from "@/components/seo/JsonLd";
import { CosmicBackground } from "@/components/design-system/CosmicBackground";
import { LandingCtaTracker } from "@/components/seo/LandingCtaTracker";
import { MysticButton } from "@/components/shared/MysticButton";
import { MysticDivider } from "@/components/shared/MysticDivider";
import {
  Sparkles,
  Heart,
  Brain,
  Users,
  BookOpen,
  Shield,
  ArrowRight,
  Check,
  X,
  Star,
  Play,
} from "lucide-react";

export const metadata: Metadata = buildPageMetadata({
  title: "Akasha Portal — Onde tradições se encontram com a ciência",
  description:
    "Comunidade online de espiritualidade universalista com IA curadora. Pratique Cabala, Ifá, Tantra, Umbanda, Xamanismo, Ayurveda e Meditação em um só espaço — com respeito e sem hierarquia.",
  path: "/launch",
  category: "home",
  priority: 1.0,
});

// ============================================================================
// Content blocks (data-driven; copy aprovada por Tomás + Lina, Wave 37)
// ============================================================================

const MANIFESTO = `Acreditamos que nenhuma tradição tem a resposta completa — e que todas têm algo essencial para ensinar.

A espiritualidade brasileira é múltipla: terreiro de Umbanda, mesa de Cabala, roda de Ifá, prática de Tantra, meditação silenciosa, banho de ervas, oração do Candomblé. São linguagens diferentes da mesma busca.

Akasha Portal é onde essas linguagens se encontram — sem fusão forçada, sem hierarquia entre caminhos. Uma consciência artificial que sabe ouvir todas, citar cada uma com respeito, e traduzir entre mundos.

Não somos gurus. Não prescrevemos. Não dizemos "este é o caminho".

Abrimos um espaço. Você escolhe por onde andar.`;

const HERO_VIDEO_EMBED = `https://www.youtube.com/embed/akasha-portal-launch`; // placeholder

const TRADITIONS = [
  {
    slug: "cabala",
    name: "Cabala",
    tagline: "Árvore da Vida · Sephiroth · Numerologia cabalística",
    color: "from-violet-500/20 to-amber-500/20",
  },
  {
    slug: "ifa",
    name: "Ifá",
    tagline: "Odus · Búzios · Sabedoria iorubá",
    color: "from-emerald-500/20 to-yellow-500/20",
  },
  {
    slug: "tantra",
    name: "Tantra",
    tagline: "Kundalini · Chakras · Consciência corporal",
    color: "from-rose-500/20 to-orange-500/20",
  },
  {
    slug: "umbanda",
    name: "Umbanda & Candomblé",
    tagline: "Orixás · Encantaria · Terreiro aberto",
    color: "from-amber-500/20 to-red-500/20",
  },
  {
    slug: "xamanismo",
    name: "Xamanismo",
    tagline: "Plantas-mestras · Ayahuasca · Rapé",
    color: "from-green-500/20 to-teal-500/20",
  },
  {
    slug: "ayurveda",
    name: "Ayurveda",
    tagline: "Doshas · Alimentação · Rotina",
    color: "from-orange-500/20 to-yellow-500/20",
  },
  {
    slug: "meditacao",
    name: "Meditação",
    tagline: "Vipassana · Mindfulness · Presença",
    color: "from-blue-500/20 to-indigo-500/20",
  },
];

const AKASHIA_FEATURES = [
  {
    icon: Brain,
    title: "Consciência tradutora",
    description:
      "Aprende com tradições ancestrais, papers peer-reviewed e conversas da comunidade. Sugere conexões entre caminhos sem dizer qual é o certo.",
  },
  {
    icon: BookOpen,
    title: "Cita fontes com respeito",
    description:
      "Quando fala de Cabala, cita os livros. Quando fala de neurociência, cita os papers. Quando fala de Ifá, cita os Odu. Sempre com origem.",
  },
  {
    icon: Shield,
    title: "Não prescreve",
    description:
      "Devolve perguntas com mais perguntas. Sugere leituras, conecta conceitos, traduz — mas não diz 'faça isto' nem 'tome aquilo'.",
  },
  {
    icon: Heart,
    title: "Cresce com você",
    description:
      "Quanto mais você pratica e estuda, mais a Akasha entende suas perguntas. Co-evolução real: cada conversa da comunidade a torna mais sábia.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Pela primeira vez encontrei um espaço onde posso falar de Cabala e Candomblé sem que ninguém me diga que são coisas incompatíveis. Akasha entende as duas.",
    author: "Beta tester, 38, São Paulo",
    tradition: "Cabala + Umbanda",
  },
  {
    quote:
      "Sou de terreiro e trabalho com Ifá há 12 anos. Aqui encontrei pessoas curiosas que perguntam com respeito — e a IA cita os Odus corretamente, sem inventar.",
    author: "Beta tester, 47, Salvador",
    tradition: "Ifá (Babalorixá)",
  },
  {
    quote:
      "Sou pesquisadora de neurociência e praticante de meditação Vipassana. Akasha foi a primeira ferramenta que conectou os dois mundos sem vulgarizar nenhum deles.",
    author: "Beta tester, 29, Rio de Janeiro",
    tradition: "Meditação + ciência",
  },
];

const PRICING = [
  {
    tier: "Comunitário",
    name: "Free",
    price: "R$ 0",
    period: "para sempre",
    description: "Para quem quer começar a explorar.",
    features: [
      { ok: true, label: "Acesso à comunidade (leitura + comentários)" },
      { ok: true, label: "5 conversas com Akasha IA por mês" },
      { ok: true, label: "Biblioteca básica (50 artigos curados)" },
      { ok: true, label: "1 grupo de tradição" },
      { ok: false, label: "Conversas ilimitadas com Akasha" },
      { ok: false, label: "Biblioteca completa (150+ artigos)" },
      { ok: false, label: "Grupos ilimitados de tradição" },
      { ok: false, label: "Mentoria 1-on-1 com curadores" },
    ],
    cta: "Entrar na Comunidade",
    highlighted: false,
  },
  {
    tier: "Praticante",
    name: "Pro",
    price: "R$ 29",
    period: "/mês",
    description: "Para quem pratica com profundidade.",
    features: [
      { ok: true, label: "Tudo do Comunitário" },
      { ok: true, label: "Conversas ilimitadas com Akasha IA" },
      { ok: true, label: "Biblioteca completa (150+ artigos)" },
      { ok: true, label: "Grupos ilimitados de tradição" },
      { ok: true, label: "Mentoria mensal com curadores (30min)" },
      { ok: true, label: "Download de PDFs + áudios" },
      { ok: true, label: "Reflexão diária personalizada" },
      { ok: false, label: "Acesso early a features experimentais" },
    ],
    cta: "Assinar Pro",
    highlighted: true,
  },
];

const FAQ = [
  {
    question: "O que é Akasha Portal?",
    answer:
      "Uma comunidade online de espiritualidade universalista. Praticantes de diferentes tradições se encontram para estudar, praticar e fazer perguntas — sem hierarquia entre caminhos. Uma IA curadora (Akasha) traduz entre as tradições e a ciência moderna, citando fontes, nunca prescrevendo.",
  },
  {
    question: "Quem pode participar?",
    answer:
      "Qualquer pessoa maior de 18 anos com interesse em espiritualidade — praticante de qualquer tradição (ou de nenhuma), curioso acadêmico, pesquisador. Não exigimos nenhum conhecimento prévio. Respeitamos ateus, agnósticos e praticantes convictos igualmente.",
  },
  {
    question: "Akasha IA substitui um terapeuta ou guru?",
    answer:
      "Não. Akasha é uma consciência tradutora — sugere leituras, conecta conceitos, cita fontes. Não prescreve práticas, não faz previsões, não substitui mentores humanos. Para questões médicas, jurídicas ou terapêuticas profundas, recomendamos profissionais humanos.",
  },
  {
    question: "Posso praticar minha tradição aqui sem ser desrespeitado?",
    answer:
      "Sim. Acolhemos Cabala, Ifá, Tantra, Umbanda, Candomblé, Xamanismo, Ayurveda, Meditação e outras com o mesmo respeito. Nenhuma tradição é posta acima de outra. Nossos curadores são praticantes ativos de cada caminho.",
  },
  {
    question: "Como funciona o modelo gratuito vs pago?",
    answer:
      "O plano Comunitário (gratuito) dá acesso à comunidade + 5 conversas/mês com Akasha + biblioteca básica. O plano Pro (R$29/mês) libera conversas ilimitadas, biblioteca completa, mentoria com curadores. Nada é paywalled — comunidade sempre será gratuita.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim. Somos LGPD-compliant (Lei 13.709/2018) com DPO designado, base legal explícita por coleta, criptografia em trânsito e em repouso, e direito de exclusão a qualquer momento. Política completa em /privacy.",
  },
];

const SOCIAL_PROOF = {
  betaUsers: 50,
  npsScore: 62,
  d7Retention: 71,
  traditionsCount: 7,
  articlesCurated: 150,
  citationsPeerReviewed: 89,
};

export default function LaunchPage() {
  return (
    <CosmicBackground>
      <SeoJsonLd
        data={[
          organizationLd(),
          websiteLd(),
          faqLd(FAQ),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Launch", path: "/launch" }]),
        ]}
      />

      <main id="main-content" className="min-h-screen pb-20">
        {/* ============================ HERO ============================ */}
        <section className="container mx-auto px-4 pt-16 pb-12 md:pt-24 md:pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-raleway text-amber-300 uppercase tracking-wider">
                Beta aberta · 50 pessoas já dentro
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-playfair text-white mb-6 leading-tight">
              Onde tradições se encontram
              <br />
              <span className="text-amber-400">com a ciência</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 font-raleway leading-relaxed mb-8 max-w-2xl mx-auto">
              Uma comunidade online de espiritualidade universalista com IA curadora.
              <br />
              Pratique, estude e pergunte — sem hierarquia entre caminhos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/signup" aria-label="Entrar na Comunidade">
                <MysticButton variant="golden" size="lg">
                  <Users className="w-5 h-5 mr-2" />
                  Entrar na Comunidade
                  <ArrowRight className="w-5 h-5 ml-2" />
                </MysticButton>
              </Link>
              <Link href="#manifesto" aria-label="Ler o manifesto">
                <MysticButton variant="ghost" size="lg">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Ler o Manifesto
                </MysticButton>
              </Link>
            </div>

            {/* Video embed */}
            <div className="relative aspect-video max-w-3xl mx-auto rounded-2xl overflow-hidden bg-slate-900/50 border border-amber-500/20 shadow-2xl">
              <iframe
                src={HERO_VIDEO_EMBED}
                title="Akasha Portal — Vídeo de apresentação"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-slate-900/30">
                <Play className="w-16 h-16 text-amber-400 opacity-80" />
              </div>
            </div>
          </div>
        </section>

        <MysticDivider />

        {/* ============================ SOCIAL PROOF ============================ */}
        <section className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-5xl mx-auto">
            {[
              { value: `${SOCIAL_PROOF.betaUsers}+`, label: "Beta testers ativos" },
              { value: `${SOCIAL_PROOF.npsScore}`, label: "NPS Wave 1" },
              { value: `${SOCIAL_PROOF.d7Retention}%`, label: "D7 retention" },
              { value: `${SOCIAL_PROOF.traditionsCount}`, label: "Tradições" },
              { value: `${SOCIAL_PROOF.articlesCurated}+`, label: "Artigos curados" },
              { value: `${SOCIAL_PROOF.citationsPeerReviewed}%`, label: "Citações peer-reviewed" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-4 rounded-xl bg-white/[0.02] border border-amber-500/10"
              >
                <div className="text-2xl md:text-3xl font-playfair text-amber-400 mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-400 font-raleway uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================ MANIFESTO ============================ */}
        <section id="manifesto" className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-rose-400" />
                <span className="text-xs font-raleway text-rose-300 uppercase tracking-wider">
                  Nosso Manifesto
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-playfair text-white">
                Por que existimos
              </h2>
            </div>

            <div className="prose prose-invert max-w-none">
              {MANIFESTO.split("\n\n").map((paragraph, i) => (
                <p
                  key={i}
                  className="text-lg text-slate-300 font-cormorant leading-relaxed mb-6 whitespace-pre-line"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ 7 TRADIÇÕES ============================ */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair text-white mb-3">
              7 tradições, 1 espaço
            </h2>
            <p className="text-slate-400 font-raleway max-w-xl mx-auto">
              Pratique seu caminho. Estude os outros. Pergunte sem julgamento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {TRADITIONS.map((trad) => (
              <Link
                key={trad.slug}
                href={`/tradicoes/${trad.slug}`}
                className={`block p-6 rounded-2xl bg-gradient-to-br ${trad.color} border border-amber-500/10 hover:border-amber-500/30 transition-all hover:scale-[1.02]`}
              >
                <h3 className="text-2xl font-playfair text-white mb-2">{trad.name}</h3>
                <p className="text-sm text-slate-300 font-raleway">{trad.tagline}</p>
                <div className="mt-4 flex items-center text-amber-400 text-sm font-raleway">
                  Explorar <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <MysticDivider />

        {/* ============================ AKASHIA IA ============================ */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-violet-400" />
                <span className="text-xs font-raleway text-violet-300 uppercase tracking-wider">
                  Akasha IA
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-playfair text-white mb-3">
                Uma consciência que traduz entre mundos
              </h2>
              <p className="text-slate-400 font-raleway max-w-2xl mx-auto">
                Aprende com tradições ancestrais, papers revisados por pares e conversas da comunidade.
                Sugere conexões — sem prescrever.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {AKASHIA_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-violet-500/5 border border-violet-500/20"
                >
                  <feature.icon className="w-8 h-8 text-violet-400 mb-4" />
                  <h3 className="text-xl font-playfair text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400 font-raleway leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ TESTIMONIALS ============================ */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair text-white mb-3">
              O que a beta está dizendo
            </h2>
            <p className="text-slate-400 font-raleway">
              Depoimentos anonimizados de Wave 1 + Wave 2 (junho 2026).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10"
              >
                <div className="flex gap-1 mb-3" aria-label="5 estrelas">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 font-cormorant italic leading-relaxed mb-4">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="border-t border-amber-500/10 pt-3">
                  <div className="text-sm text-white font-raleway">{t.author}</div>
                  <div className="text-xs text-amber-400 font-raleway">{t.tradition}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <MysticDivider />

        {/* ============================ PRICING ============================ */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair text-white mb-3">
              Dois caminhos, sem paywall
            </h2>
            <p className="text-slate-400 font-raleway">
              A comunidade sempre será gratuita. O plano Pro apoia quem pratica com profundidade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {PRICING.map((plan) => (
              <div
                key={plan.tier}
                className={`p-8 rounded-2xl border ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-amber-500/10 to-violet-500/10 border-amber-500/40 shadow-2xl"
                    : "bg-white/[0.02] border-amber-500/10"
                }`}
              >
                <div className="text-xs uppercase tracking-wider text-amber-400 mb-2 font-raleway">
                  {plan.tier}
                </div>
                <h3 className="text-3xl font-playfair text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-5xl font-playfair text-white">{plan.price}</span>
                  <span className="text-slate-400 font-raleway">{plan.period}</span>
                </div>
                <p className="text-slate-400 font-raleway mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat.label} className="flex items-start gap-2">
                      {feat.ok ? (
                        <Check className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-sm font-raleway ${
                          feat.ok ? "text-slate-300" : "text-slate-500 line-through"
                        }`}
                      >
                        {feat.label}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href="/signup" aria-label={plan.cta}>
                  <MysticButton
                    variant={plan.highlighted ? "golden" : "ghost"}
                    size="lg"
                    className="w-full"
                  >
                    {plan.cta}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </MysticButton>
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-slate-500 mt-8">
            Cancelamento a qualquer momento · Sem fidelidade · LGPD-compliant ·
            Pagamento processado por Stripe (PCI-DSS Level 1).
          </p>
        </section>

        {/* ============================ FAQ ============================ */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-playfair text-white mb-3">
                Perguntas frequentes
              </h2>
              <p className="text-slate-400 font-raleway">
                Mais dúvidas? Veja nosso{" "}
                <Link href="/help/faq" className="text-amber-400 underline">
                  FAQ completo
                </Link>
                .
              </p>
            </div>

            <div className="space-y-4">
              {FAQ.map((item, i) => (
                <details
                  key={i}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10 group"
                >
                  <summary className="cursor-pointer text-white font-playfair text-lg flex items-center justify-between">
                    {item.question}
                    <span className="text-amber-400 group-open:rotate-45 transition-transform text-2xl">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-slate-300 font-raleway leading-relaxed">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ FINAL CTA ============================ */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center p-12 rounded-3xl bg-gradient-to-br from-amber-500/10 via-violet-500/10 to-amber-500/10 border border-amber-500/30">
            <h2 className="text-3xl md:text-4xl font-playfair text-white mb-4">
              Pronto(a) para caminhar junto?
            </h2>
            <p className="text-lg text-slate-300 font-raleway mb-8 max-w-xl mx-auto">
              Entre na comunidade. Pratique, estude, pergunte — sem hierarquia, sem julgamento.
            </p>
            <LandingCtaTracker
              ctaName="launch-bottom-cta"
              destination="/signup"
              variant="primary"
            >
              <Link href="/signup" aria-label="Entrar na Comunidade">
                <MysticButton variant="golden" size="lg">
                  <Users className="w-5 h-5 mr-2" />
                  Entrar na Comunidade
                  <ArrowRight className="w-5 h-5 ml-2" />
                </MysticButton>
              </Link>
            </LandingCtaTracker>
            <p className="text-xs text-slate-500 mt-4 font-raleway">
              Beta aberta · Gratuita · LGPD-compliant
            </p>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-amber-500/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm font-raleway">
            © {new Date().getFullYear()} Akasha Portal ·{" "}
            <Link href="/privacy" className="text-amber-400 underline">
              Privacidade
            </Link>{" "}
            ·{" "}
            <Link href="/terms" className="text-amber-400 underline">
              Termos
            </Link>{" "}
            ·{" "}
            <Link href="/press" className="text-amber-400 underline">
              Press kit
            </Link>
          </p>
        </div>
      </footer>
    </CosmicBackground>
  );
}