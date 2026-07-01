// ============================================================================
// /(info)/legal/acceptable-use — Acceptable Use Policy v3.0 (Wave 37)
// ============================================================================

import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticButton } from '@/components/shared/MysticButton';
import { ArrowLeft, AlertTriangle, Shield, Users, MessageSquare, Ban } from 'lucide-react';
import Link from 'next/link';

const LAST_UPDATED = '2026-07-01';
const VERSION = '3.0-wave37';

export const metadata = {
  title: 'Política de Uso Aceitável — Akasha Portal v3.0',
  description:
    'O que é permitido e proibido na Akasha Portal. Universalismo, respeito, LGPD, moderação em 3 camadas.',
  alternates: { canonical: '/legal/acceptable-use' },
};

const PROHIBITED = [
  {
    icon: AlertTriangle,
    title: 'Proselitismo agressivo',
    examples: [
      'Mensagens repetidas convidando para sua tradição',
      'Dizer que uma tradição é "superior" ou "correta"',
      'Tentar converter outros membros',
      'Spam de conteúdo da sua tradição sem contexto',
    ],
  },
  {
    icon: Ban,
    title: 'Discurso de ódio',
    examples: [
      'Ataques a praticantes de qualquer tradição',
      'Xenofobia, racismo, lgbtqia+fobia',
      'Machismo, sexismo, capacitismo',
      'Ataques a religiões afro-brasileiras (histórico de perseguição)',
    ],
  },
  {
    icon: MessageSquare,
    title: 'Conteúdo violento ou sexual',
    examples: [
      'Ameaças ou incitação à violência',
      'Pornografia ou conteúdo sexual explícito',
      'Compartilhamento de imagens chocantes',
      'Assédio sexual a outros membros',
    ],
  },
  {
    icon: Shield,
    title: 'Spam, malware, fraude',
    examples: [
      'Bots ou scripts de automação',
      'Phishing ou tentativa de roubo de credenciais',
      'Links para malware ou sites maliciosos',
      'Venda de produtos fora do marketplace oficial',
    ],
  },
];

const ENCOURAGED = [
  {
    title: 'Curiosidade respeitosa',
    description: 'Pergunte sobre tradições que não são suas. Use "como funciona X?" em vez de "por que vocês fazem X?".',
  },
  {
    title: 'Citação com fonte',
    description: 'Ao mencionar outra tradição, cite a fonte (livro, mestre, terreiro, paper). Não invente.',
  },
  {
    title: 'Report de violações',
    description: 'Use o botão de report (🚩) em qualquer conteúdo inapropriado. Curadores revisam em <24h.',
  },
  {
    title: 'Diálogo cross-tradição',
    description: 'Crie pontes entre caminhos. "Em Cabala também temos..." ou "Em Ifá, equivalente seria..." são diálogos que honram.',
  },
];

export default function AcceptableUsePage() {
  return (
    <CosmicBackground>
      <main id="main-content" className="min-h-screen pb-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6 font-raleway text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao início
          </Link>

          <div className="text-center mb-8">
            <Heading variant="h1" className="text-white mb-3">
              Política de Uso Aceitável
            </Heading>
            <p className="text-slate-400 font-raleway">
              Versão {VERSION} · Atualizado em {LAST_UPDATED}
            </p>
          </div>

          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-amber-500/10 border border-amber-500/20">
            <p className="text-lg text-violet-300 font-cormorant leading-relaxed text-center">
              &ldquo;Akasha Portal é uma comunidade de espiritualidade universalista.
              Aqui todas as tradições têm o mesmo respeito. Não há hierarquia,
              não há proselitismo, não há discurso de ódio. Quem chega com curiosidade
              e respeito, fica. Quem chega para impor ou agredir, sai.&rdquo;
            </p>
          </div>

          {/* PROHIBITED */}
          <section className="mb-12">
            <h2 className="text-2xl font-playfair text-white mb-6">
              🚫 Comportamentos proibidos
            </h2>
            <div className="space-y-6">
              {PROHIBITED.map((cat) => (
                <div
                  key={cat.title}
                  className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <cat.icon className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <h3 className="text-lg font-playfair text-white">{cat.title}</h3>
                  </div>
                  <ul className="ml-9 space-y-2">
                    {cat.examples.map((example) => (
                      <li key={example} className="text-slate-400 font-raleway text-sm flex items-start gap-2">
                        <span className="text-red-400 flex-shrink-0">•</span>
                        <span>{example}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* ENCOURAGED */}
          <section className="mb-12">
            <h2 className="text-2xl font-playfair text-white mb-6">
              ✅ Comportamentos encorajados
            </h2>
            <div className="space-y-4">
              {ENCOURAGED.map((item) => (
                <div
                  key={item.title}
                  className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20"
                >
                  <h3 className="text-lg font-playfair text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 font-raleway leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* MODERATION */}
          <section className="mb-12">
            <h2 className="text-2xl font-playfair text-white mb-6">
              🛡️ Moderação em 3 camadas
            </h2>
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-amber-500/10">
                <h3 className="text-base font-playfair text-amber-400 mb-2">Camada 1 — IA</h3>
                <p className="text-slate-400 font-raleway text-sm">
                  Detecção automática de palavras-chave, padrões de assédio, links maliciosos.
                  Resposta: {'<'}1s para sinais óbvios.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-amber-500/10">
                <h3 className="text-base font-playfair text-amber-400 mb-2">Camada 2 — Curadores</h3>
                <p className="text-slate-400 font-raleway text-sm">
                  Praticantes ativos de cada tradição revisam casos sinalizados pela IA
                  ou reportados por usuários. SLA: {'<'}24h para P1, {'<'}12h para P2.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-amber-500/10">
                <h3 className="text-base font-playfair text-amber-400 mb-2">Camada 3 — Operador humano</h3>
                <p className="text-slate-400 font-raleway text-sm">
                  Decisões finais em casos-limite (liberdade de expressão vs. discurso de ódio,
                  ironia vs. assédio). Resposta: {'<'}72h para casos complexos.
                </p>
              </div>
            </div>
          </section>

          {/* CONSEQUENCES */}
          <section className="mb-12">
            <h2 className="text-2xl font-playfair text-white mb-6">
              ⚖️ Consequências
            </h2>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10">
              <ul className="space-y-3 text-slate-400 font-raleway">
                <li><strong className="text-amber-400">1ª violação leve:</strong> aviso + educação</li>
                <li><strong className="text-amber-400">2ª violação leve:</strong> mute temporário (7 dias)</li>
                <li><strong className="text-amber-400">Violação grave:</strong> suspensão imediata + análise</li>
                <li><strong className="text-amber-400">Violação muito grave:</strong> banimento permanente</li>
                <li><strong className="text-amber-400">Atividade ilegal:</strong> banimento + denúncia às autoridades</li>
              </ul>
              <p className="mt-4 text-sm text-slate-500 font-raleway">
                Você pode recorrer de qualquer decisão em até 7 dias via /conta/apelacoes.
              </p>
            </div>
          </section>

          <div className="mt-12 text-center">
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