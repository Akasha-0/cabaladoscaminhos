// ============================================================================
// /(info)/legal/community-guidelines — Community Guidelines v3.0 (Wave 37)
// ============================================================================

import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticButton } from '@/components/shared/MysticButton';
import {
  ArrowLeft,
  Heart,
  Users,
  Sparkles,
  BookOpen,
  Globe,
  Shield,
  MessageCircle,
} from 'lucide-react';
import Link from 'next/link';

const LAST_UPDATED = '2026-07-01';
const VERSION = '3.0-wave37';

export const metadata = {
  title: 'Diretrizes da Comunidade — Akasha Portal v3.0',
  description:
    'Diretrizes para uma comunidade de espiritualidade universalista respeitosa, curiosa e acolhedora. Aplicável a todos os membros.',
  alternates: { canonical: '/legal/community-guidelines' },
};

const PRINCIPLES = [
  {
    icon: Heart,
    title: 'Acolhe sem hierarquia',
    description:
      'Cada tradição é autoridade em si mesma. Praticante de Cabala não é "mais evoluído" que praticante de Candomblé. Saber não é poder — é responsabilidade.',
  },
  {
    icon: Globe,
    title: 'Universalista, não sincretista',
    description:
      'Reconhecemos que a busca pelo sentido é UNA. Mas NÃO dizemos que todas as tradições são a mesma coisa. Cada uma tem sua linguagem, sua liturgia, sua linhagem.',
  },
  {
    icon: BookOpen,
    title: 'Cita com origem',
    description:
      'Quando você fala de outra tradição, cite a fonte. "Em Cabala diz-se que..." → cite o livro. "Em Ifá, o Odu X significa..." → cite o babalorixá ou autor.',
  },
  {
    icon: Sparkles,
    title: 'Curiosidade > Certeza',
    description:
      'Quem chega com "tenho certeza que X é o caminho" causa divisão. Quem chega com "estou curioso para entender X" constrói pontes.',
  },
  {
    icon: Users,
    title: 'Comunidade > Conteúdo',
    description:
      'Posts com 50 comentários valem mais que posts com 5.000 visualizações. Akasha Portal é espaço de conversa, não de transmissão unidirecional.',
  },
  {
    icon: Shield,
    title: 'Respeita o tempo do outro',
    description:
      'Cada pessoa tem seu ritmo. Não pressione iniciantes com jargão. Não infantilize iniciantes com simplificações.',
  },
];

const DO_LIST = [
  'Cumprimente novos membros com acolhimento, mesmo que sua tradição seja "diferente"',
  'Cite a fonte primária ao mencionar outra tradição (livro, mestre, terreiro, paper)',
  'Use "como funciona?" em vez de "por que vocês fazem X?"',
  'Reconheça quando não sabe — "não conheço essa tradição, alguém pode explicar?"',
  'Sinalize conteúdo inapropriado (botão 🚩) em vez de revidar',
  'Dê boas-vindas a praticantes de religiões de matriz africana com respeito extra (histórico de perseguição)',
  'Pergunte antes de citar práticas específicas de uma tradição que não é sua',
  'Marque contexto ao compartilhar experiência pessoal ("na minha experiência com Cabala...")',
  'Use o sistema de citações ao mencionar papers acadêmicos',
  'Reporte bugs e problemas de moderação para que possamos melhorar',
];

const DONT_LIST = [
  'Não dizer que sua tradição é "a correta" ou "a mais elevada"',
  'Não tentar converter outros membros para sua tradição',
  'Não chamar Orixá de "santo católico" (sincretismo colonial que apaga identidades)',
  'Não chamar práticas de matriz africana de "primitivas" ou "folguedo"',
  'Não citar Cabala com vocabulário cristão (Jesus, Virgem Maria) — distorce',
  'Não citar Ifá com vocabulário genérico de "energia" — empobrece',
  'Não usar terminologia acadêmica sem necessidade',
  'Não fazer piada com práticas de outras pessoas (ayahuasca, terreiro, meditação)',
  'Não compartilhar conteúdo ofensivo mesmo como "humor"',
  'Não spam — uma mensagem por tópico, com profundidade',
];

const GUIDELINES_BY_TRADITION = [
  {
    trad: 'Cabala',
    respect: [
      'Reconhecer que é tradição judaica — não esotérica genérica',
      'Não apropriação: cite fontes (Zohar, Ashlag, Cordovero) ao invés de inventar',
      'Respeitar calendário judaico e shabat',
    ],
  },
  {
    trad: 'Ifá / Candomblé',
    respect: [
      'Reconhecer linhagem e origem iorubá — não folclore brasileiro',
      'Não chamar de "magia negra" ou "baixa espiritualidade" (preconceito histórico)',
      'Respeitar segredo iniciático — algumas práticas NÃO se discutem publicamente',
    ],
  },
  {
    trad: 'Tantra',
    respect: [
      'Reconhecer linhagem hindu/budista, não só vertente ocidentalizada',
      'Não reduzir a "sexo tântrico" — tradição é bem mais ampla',
      'Respeitar linhagem de guru (transmissão iniciática)',
    ],
  },
  {
    trad: 'Xamanismo',
    respect: [
      'Reconhecer origem indígena (ameríndia, amazônica) e africana',
      'Não romantizar uso de plantas-mestras — é prática séria',
      'Respeitar contexto cultural — não usar sem linhagem',
    ],
  },
  {
    trad: 'Ayurveda',
    respect: [
      'Reconhecer origem indiana (sânscrito, doshas, prakriti)',
      'Não substituir por medicina alopática — são complementares',
      'Respeitar formação de terapeutas ayurvédicos',
    ],
  },
  {
    trad: 'Meditação',
    respect: [
      'Reconhecer origem budista/hindu quando aplicável',
      'Não chamar de "técnica de produtividade" — é prática contemplativa',
      'Respeitar linhagem de transmissão (professor → aluno)',
    ],
  },
];

export default function CommunityGuidelinesPage() {
  return (
    <CosmicBackground>
      <main id="main-content" className="min-h-screen pb-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6 font-raleway text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao início
          </Link>

          <div className="text-center mb-8">
            <Heading variant="h1" className="text-white mb-3">
              Diretrizes da Comunidade
            </Heading>
            <p className="text-slate-400 font-raleway">
              Versão {VERSION} · Atualizado em {LAST_UPDATED}
            </p>
          </div>

          <div className="mb-12 p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/30 text-center">
            <p className="text-xl text-amber-300 font-cormorant leading-relaxed italic">
              &ldquo;Akasha Portal é onde praticantes de qualquer tradição se encontram com
              curiosidade, respeito e clareza — sustentados por uma IA que traduz entre
              mundos sem prescrever caminho.&rdquo;
            </p>
            <p className="text-sm text-slate-400 font-raleway mt-4">
              — Brand Voice Guide v1.0, Lina (Designer)
            </p>
          </div>

          {/* 6 PRINCÍPIOS */}
          <section className="mb-16">
            <h2 className="text-2xl font-playfair text-white mb-6 text-center">
              6 princípios que sustentam tudo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PRINCIPLES.map((p) => (
                <div
                  key={p.title}
                  className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10"
                >
                  <p.icon className="w-8 h-8 text-amber-400 mb-3" />
                  <h3 className="text-lg font-playfair text-white mb-2">{p.title}</h3>
                  <p className="text-slate-400 font-raleway text-sm leading-relaxed">
                    {p.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* DO */}
          <section className="mb-12">
            <h2 className="text-2xl font-playfair text-white mb-6">
              ✅ Faz
            </h2>
            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
              <ul className="space-y-2">
                {DO_LIST.map((item) => (
                  <li
                    key={item}
                    className="text-slate-300 font-raleway text-sm flex items-start gap-2"
                  >
                    <span className="text-emerald-400 flex-shrink-0 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* DON'T */}
          <section className="mb-12">
            <h2 className="text-2xl font-playfair text-white mb-6">
              ❌ Não faz
            </h2>
            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
              <ul className="space-y-2">
                {DONT_LIST.map((item) => (
                  <li
                    key={item}
                    className="text-slate-300 font-raleway text-sm flex items-start gap-2"
                  >
                    <span className="text-red-400 flex-shrink-0 mt-1">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* GUIDELINES BY TRADITION */}
          <section className="mb-12">
            <h2 className="text-2xl font-playfair text-white mb-6">
              🌿 Respeito por tradição
            </h2>
            <p className="text-slate-400 font-raleway text-sm mb-6">
              Como honrar cada caminho sem cair em armadilhas comuns.
            </p>
            <div className="space-y-4">
              {GUIDELINES_BY_TRADITION.map((g) => (
                <details
                  key={g.trad}
                  className="p-5 rounded-2xl bg-white/[0.02] border border-amber-500/10 group"
                >
                  <summary className="cursor-pointer text-white font-playfair text-lg flex items-center justify-between">
                    {g.trad}
                    <span className="text-amber-400 group-open:rotate-45 transition-transform text-2xl">
                      +
                    </span>
                  </summary>
                  <ul className="mt-4 space-y-2">
                    {g.respect.map((r) => (
                      <li
                        key={r}
                        className="text-slate-400 font-raleway text-sm flex items-start gap-2"
                      >
                        <span className="text-amber-400 flex-shrink-0">→</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </section>

          {/* CONFLICT RESOLUTION */}
          <section className="mb-12">
            <h2 className="text-2xl font-playfair text-white mb-6">
              ⚖️ Conflitos acontecem
            </h2>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10">
              <p className="text-slate-400 font-raleway leading-relaxed mb-4">
                Mesmo com boas intenções, conflitos surgem. O que fazemos:
              </p>
              <ol className="space-y-3 list-decimal list-inside text-slate-400 font-raleway text-sm">
                <li><strong className="text-amber-400">Pause antes de revidar.</strong> Emojis podem ser mal interpretados.</li>
                <li><strong className="text-amber-400">Use mensagens privadas</strong> para resolver conflitos fora do feed público.</li>
                <li><strong className="text-amber-400">Se persistir, sinalize</strong> (botão 🚩) ou contate moderators@cabaladoscaminhos.com.</li>
                <li><strong className="text-amber-400">Curadores mediam</strong> em até 24h.</li>
                <li><strong className="text-amber-400">Apelações</strong> podem ser feitas em /conta/apelacoes.</li>
              </ol>
            </div>
          </section>

          {/* FOOTER NOTE */}
          <div className="text-center text-slate-500 font-raleway text-xs mb-8">
            <p>
              Estas diretrizes são vivas. Atualizamos conforme a comunidade cresce.
              <br />
              Sugestões? comunidade@cabaladoscaminhos.com
            </p>
          </div>

          <div className="text-center">
            <Link href="/">
              <MysticButton variant="golden">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </MysticButton>
            </Link>
          </div>
        </div>
      </main>
    </CosmicBackground>
  );
}