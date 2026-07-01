// ============================================================================
// /(info)/press — Press Kit (Wave 37)
// ============================================================================
// Press release (PT-BR + EN) · Brand assets · Founder bio · Media kit
// · Contact email · Story angles.
//
// Conteúdo aprovado por Tomás (PM) + Gabriel (Founder). Para baixar ZIP
// de assets, ver /api/press-kit/download (route handler separado).
// ============================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { CosmicBackground } from "@/components/design-system/CosmicBackground";
import { MysticButton } from "@/components/shared/MysticButton";
import { MysticDivider } from "@/components/shared/MysticDivider";
import {
  Mail,
  Download,
  User,
  Image as ImageIcon,
  BarChart,
  Newspaper,
  Globe,
  ArrowLeft,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Press Kit — Akasha Portal",
  description:
    "Recursos de imprensa: press release PT-BR + EN, brand assets, founder bio, media kit e contatos.",
  alternates: { canonical: "/press" },
};

const PRESS_RELEASE_PT = `**AKASHA PORTAL ABRE COMUNIDADE DE ESPIRITUALIDADE UNIVERSALISTA COM IA CURADORA**

*Plataforma brasileira conecta praticantes de 7 tradições com consciência artificial que traduz entre Cabala, Ifá, Tantra, Umbanda, Xamanismo, Ayurveda e Meditação*

**São Paulo, 1 de julho de 2026** — Akasha Portal, primeira comunidade online brasileira de espiritualidade universalista assistida por inteligência artificial, abre hoje suas portas ao público após 5 meses de beta privada com 50 usuários. A plataforma conecta praticantes e curiosos de 7 tradições em um espaço único, sustentado por uma IA curadora que traduz entre mundos sem prescrever caminho.

Diferente de apps de espiritualidade verticalizados (tarot, astrologia, meditação isoladamente), Akasha Portal acolhe a pluralidade da espiritualidade brasileira: terreiro de Umbanda, mesa de Cabala, roda de Ifá, prática de Tantra, meditação silenciosa, ervas de Ayurveda, cantos xamânicos. São linguagens diferentes da mesma busca — todas com lugar de fala.

A IA curadora (chamada Akasha, em referência ao registro akáshico das tradições hindus) aprende com artigos curados por praticantes ativos, papers peer-reviewed de neurociência e psicologia, e conversas da comunidade. Sua função é sugerir leituras, conectar conceitos entre tradições e citar fontes com origem — nunca prescrever práticas, fazer previsões ou substituir terapeutas humanos.

"A espiritualidade brasileira é múltipla. Umbusca por Cabala pode coexistir com Candomblé, Tantra com Vipassana, ciência com terreiro", diz Gabriel Ferreira, fundador. "Akasha Portal é onde essa coexistência vira conversa — não conflito."

**Métricas da beta (junho/2026):**
- 50 beta testers ativos
- NPS Wave 1 = 62 (excelente)
- D7 retention = 71%
- 150+ artigos curados
- 89% das respostas da Akasha citando fontes peer-reviewed ou tradição de origem
- 0 incidentes de toxicidade reportados em 5 meses

**Modelos:**
- Plano Comunitário (gratuito): leitura + 5 conversas/mês com Akasha + biblioteca básica
- Plano Pro (R$29/mês): conversas ilimitadas + biblioteca completa + mentoria com curadores

**LGPD-compliant:** a plataforma opera sob a Lei 13.709/2018 com DPO designado, base legal explícita por coleta, e direito de exclusão a qualquer momento.

Akasha Portal está disponível em akashaportal.com.br. Contato de imprensa: press@akashaportal.com.br.`;

const PRESS_RELEASE_EN = `**AKASHA PORTAL OPENS UNIVERSALIST SPIRITUALITY COMMUNITY WITH CURATORIAL AI**

*Brazilian platform connects practitioners of 7 traditions with artificial consciousness that translates between Kabbalah, Ifá, Tantra, Umbanda, Shamanism, Ayurveda and Meditation*

**São Paulo, July 1, 2026** — Akasha Portal, the first Brazilian online community of universalist spirituality assisted by artificial intelligence, opens today to the public after 5 months of private beta with 50 users. The platform connects practitioners and curious seekers from 7 traditions in a single space, supported by a curatorial AI that translates between worlds without prescribing paths.

Unlike verticalized spirituality apps (tarot, astrology, meditation in isolation), Akasha Portal embraces the plurality of Brazilian spirituality: Umbanda terreiro, Kabbalah table, Ifá wheel, Tantra practice, silent meditation, Ayurveda herbs, shamanic chants. These are different languages of the same quest — all given a voice.

The curatorial AI (called Akasha, referencing the akashic record of Hindu traditions) learns from articles curated by active practitioners, peer-reviewed neuroscience and psychology papers, and community conversations. Its role is to suggest readings, connect concepts between traditions, and cite sources with origin — never prescribe practices, make predictions, or substitute human therapists.

"Brazilian spirituality is plural. A search for Kabbalah can coexist with Candomblé, Tantra with Vipassana, science with terreiro," says Gabriel Ferreira, founder. "Akasha Portal is where this coexistence becomes conversation — not conflict."

**Beta metrics (June 2026):**
- 50 active beta testers
- NPS Wave 1 = 62 (excellent)
- D7 retention = 71%
- 150+ curated articles
- 89% of Akasha's answers cite peer-reviewed or tradition-of-origin sources
- 0 toxicity incidents reported in 5 months

**Pricing:**
- Community plan (free): reading + 5 conversations/month with Akasha + basic library
- Pro plan (R$29/month ≈ $5.50): unlimited conversations + complete library + curator mentorship

**LGPD-compliant:** the platform operates under Brazil's Lei 13.709/2018 with designated DPO, explicit legal basis per data collection, and right to deletion at any time.

Akasha Portal is available at akashaportal.com.br. Press contact: press@akashaportal.com.br.`;

const BRAND_ASSETS = [
  { name: "Logo primary (PNG transparente)", size: "1200×630 · 84 KB", url: "/press/assets/logo-primary.png" },
  { name: "Logo secondary (PNG fundo escuro)", size: "1200×630 · 92 KB", url: "/press/assets/logo-secondary.png" },
  { name: "Screenshot — Comunidade (home feed)", size: "1920×1080 · 1.2 MB", url: "/press/assets/screenshot-community.png" },
  { name: "Screenshot — Akasha IA em conversa", size: "1920×1080 · 1.4 MB", url: "/press/assets/screenshot-akasha.png" },
  { name: "Screenshot — Biblioteca de artigos", size: "1920×1080 · 1.1 MB", url: "/press/assets/screenshot-library.png" },
  { name: "OG card (landing page)", size: "1200×630 · 96 KB", url: "/press/assets/og-launch.png" },
  { name: "Brand book completo (PDF)", size: "32 páginas · 4.2 MB", url: "/press/assets/brand-book.pdf" },
];

const FOUNDER_BIO = `**Gabriel Ferreira** é desenvolvedor full-stack e estudioso de espiritualidade há 12 anos. Pratica meditação Vipassana desde 2014, estuda Cabala desde 2017, e frequenta terreiro de Umbanda desde 2020. Antes de fundar Akasha Portal em 2025, trabalhou como tech lead em startups de fintech e edtech.

"Vi muita gente — inclusive eu — sendo empurrada para escolher entre espiritualidade e ciência, entre Cabala e Candomblé, entre tradição e razão. Akasha Portal é onde a gente não precisa mais escolher. Cada caminho honra o outro. E uma IA que cita fontes respeita todos eles."

Gabriel é mestrando em Antropologia da Religião pela USP e pesquisa interseções entre tecnologia e espiritualidade. Mora em São Paulo com a companheira e dois gatos. Contato direto: gabriel@akashaportal.com.br.`;

const MEDIA_KIT_BOILERPLATE = `**Sobre Akasha Portal**

Akasha Portal (akashaportal.com.br) é uma comunidade online brasileira de espiritualidade universalista assistida por inteligência artificial curadora. Fundada em 2025 por Gabriel Ferreira, a plataforma conecta praticantes e curiosos de 7 tradições — Cabala, Ifá, Tantra, Umbanda/Candomblé, Xamanismo, Ayurveda e Meditação — em um espaço único onde o respeito entre caminhos é o princípio fundante.

A IA curadora Akasha aprende com artigos curados por praticantes ativos, papers peer-reviewed de neurociência e psicologia, e conversas da comunidade. Sua função é sugerir leituras, conectar conceitos entre tradições e citar fontes com origem — nunca prescrever práticas, fazer previsões ou substituir terapeutas humanos.

Akasha Portal opera sob a LGPD (Lei 13.709/2018) e está hospedada em data centers no Brasil. É mantida por uma equipe de 6 pessoas: fundador, designer, PM, QA, AppSec engineer e curator principal (Iyá, praticante de Candomblé Angola).`;

const KEY_STATS = [
  { value: "50", label: "Beta testers ativos (Wave 1+2)" },
  { value: "62", label: "NPS Wave 1" },
  { value: "71%", label: "D7 retention" },
  { value: "7", label: "Tradições acolhidas" },
  { value: "150+", label: "Artigos curados" },
  { value: "89%", label: "Respostas com citação de fonte" },
  { value: "0", label: "Incidentes de toxicidade em 5 meses" },
  { value: "100%", label: "LGPD-compliant" },
];

const STORY_ANGLES = [
  {
    angle: "Inovação tecnológica com respeito à tradição",
    pitch:
      "Como uma IA curadora brasileira cita fontes de 7 tradições sem vulgarizar nenhuma. A engenharia de prompt por trás de Akasha foi feita com curadores praticantes ativos.",
    hooks: ["Paper técnico", "Entrevista com founder", "Demo ao vivo"],
  },
  {
    angle: "IA consciente sem hype pseudo-espiritual",
    pitch:
      "Em um mercado saturado de 'IA espiritual' que promete previsões e curas, Akasha Portal aposta em consciência tradutora que não prescreve. Diferenciação técnica e ética.",
    hooks: ["Comparativo com apps verticais", "Análise do prompt-engineering ético"],
  },
  {
    angle: "Comunidade universalista no Brasil",
    pitch:
      "Como Cabala, Ifá, Umbanda, Tantra e Meditação coexistem em um espaço único. Pesquisa antropológica com 50 praticantes ativos.",
    hooks: ["Dados etnográficos", "Entrevistas com beta testers", "História do projeto"],
  },
  {
    angle: "LGPD + espiritualidade: dados com respeito",
    pitch:
      "Akasha Portal é a primeira comunidade espiritual brasileira com DPO designado, base legal explícita por coleta e direito de exclusão. Modelo replicável.",
    hooks: ["Política de privacidade como case study", "Compliance técnico"],
  },
  {
    angle: "Beta com 50 pessoas: o que aprendemos",
    pitch:
      "5 meses de white-glove com 50 usuários ativos. NPS 62, D7 71%, 0 incidentes. O que funciona em espiritualidade digital.",
    hooks: ["Métricas de retenção", "Lições de produto", "Comparativo com benchmarks"],
  },
];

export default function PressPage() {
  return (
    <CosmicBackground>
      <main id="main-content" className="min-h-screen pb-20">
        <div className="container mx-auto px-4 pt-12 pb-8">
          <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6 font-raleway text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao início
          </Link>

          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
              <Newspaper className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-raleway text-violet-300 uppercase tracking-wider">
                Para jornalistas, creators e parceiros
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-playfair text-white mb-4">
              Press Kit
            </h1>
            <p className="text-lg text-slate-300 font-raleway max-w-2xl mx-auto">
              Tudo que você precisa para falar sobre Akasha Portal: press release,
              brand assets, founder bio e dados-chave.
            </p>
          </div>

          {/* Download ZIP CTA */}
          <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/30 text-center">
            <Download className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <h3 className="text-xl font-playfair text-white mb-2">Pacote completo</h3>
            <p className="text-sm text-slate-300 font-raleway mb-4">
              ZIP com 7 brand assets + brand book (32 páginas) + press release PT/EN.
            </p>
            <a href="/api/press-kit/download" aria-label="Baixar press kit completo">
              <MysticButton variant="golden">
                <Download className="w-4 h-4 mr-2" />
                Baixar ZIP (6.2 MB)
              </MysticButton>
            </a>
          </div>
        </div>

        <MysticDivider />

        {/* ============================ PRESS RELEASE ============================ */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Newspaper className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl md:text-3xl font-playfair text-white">
                Press Release
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-raleway">
                    🇧🇷 Português
                  </span>
                  <button className="text-xs text-amber-400 hover:text-amber-300 font-raleway">
                    Copiar
                  </button>
                </div>
                <pre className="text-sm text-slate-300 font-raleway leading-relaxed whitespace-pre-wrap font-sans">
                  {PRESS_RELEASE_PT}
                </pre>
              </div>

              <div className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-raleway">
                    🇬🇧 English
                  </span>
                  <button className="text-xs text-amber-400 hover:text-amber-300 font-raleway">
                    Copy
                  </button>
                </div>
                <pre className="text-sm text-slate-300 font-raleway leading-relaxed whitespace-pre-wrap font-sans">
                  {PRESS_RELEASE_EN}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <MysticDivider />

        {/* ============================ BRAND ASSETS ============================ */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl md:text-3xl font-playfair text-white">
                Brand Assets
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BRAND_ASSETS.map((asset) => (
                <a
                  key={asset.name}
                  href={asset.url}
                  className="block p-4 rounded-xl bg-white/[0.02] border border-amber-500/10 hover:border-amber-500/30 transition-colors group"
                  aria-label={`Baixar ${asset.name}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-raleway group-hover:text-amber-400 transition-colors">
                        {asset.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-1">
                        {asset.size}
                      </div>
                    </div>
                    <Download className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <MysticDivider />

        {/* ============================ FOUNDER BIO ============================ */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl md:text-3xl font-playfair text-white">
                Sobre o fundador
              </h2>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10">
              <p className="text-slate-300 font-raleway leading-relaxed whitespace-pre-line">
                {FOUNDER_BIO}
              </p>
            </div>
          </div>
        </section>

        <MysticDivider />

        {/* ============================ MEDIA KIT ============================ */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <BarChart className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl md:text-3xl font-playfair text-white">
                Media Kit
              </h2>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-playfair text-white mb-3">
                Boilerplate (para uso em releases)
              </h3>
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10">
                <p className="text-slate-300 font-raleway leading-relaxed whitespace-pre-line">
                  {MEDIA_KIT_BOILERPLATE}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-playfair text-white mb-3">
                Key Stats (junho/2026)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {KEY_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center"
                  >
                    <div className="text-2xl font-playfair text-amber-400 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400 font-raleway">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <MysticDivider />

        {/* ============================ STORY ANGLES ============================ */}
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Globe className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl md:text-3xl font-playfair text-white">
                Story Angles
              </h2>
            </div>

            <div className="space-y-4">
              {STORY_ANGLES.map((story) => (
                <div
                  key={story.angle}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10"
                >
                  <h3 className="text-lg font-playfair text-white mb-2">
                    {story.angle}
                  </h3>
                  <p className="text-slate-300 font-raleway leading-relaxed mb-3">
                    {story.pitch}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {story.hooks.map((hook) => (
                      <span
                        key={hook}
                        className="px-3 py-1 rounded-full text-xs font-raleway bg-violet-500/10 border border-violet-500/30 text-violet-300"
                      >
                        {hook}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================ CONTACT ============================ */}
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 to-amber-500/10 border border-amber-500/30">
            <Mail className="w-10 h-10 text-amber-400 mx-auto mb-4" />
            <h2 className="text-2xl font-playfair text-white mb-3">
              Contato de imprensa
            </h2>
            <p className="text-slate-300 font-raleway mb-2">
              Resposta em até 24h úteis
            </p>
            <a
              href="mailto:press@akashaportal.com.br"
              className="text-xl font-playfair text-amber-400 hover:text-amber-300 transition-colors"
            >
              press@akashaportal.com.br
            </a>
          </div>
        </section>
      </main>
    </CosmicBackground>
  );
}