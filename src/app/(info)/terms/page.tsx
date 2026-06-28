'use client';

import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { MysticButton } from '@/components/shared/MysticButton';
import { ArrowLeft, Scale, Heart, MessageSquare, AlertTriangle, Users, FileText, Zap } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    icon: Scale,
    title: "Aceitação dos Termos",
    content: `Ao acessar e utilizar a Cabala dos Caminhos, você concorda com estes Termos de Uso em sua totalidade.

Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.

Ao criar uma conta, você declara ter 18 anos ou mais, ou ter permissão de um responsável legal.`,
  },
  {
    icon: Heart,
    title: "Descrição dos Serviços",
    content: `A Cabala dos Caminhos oferece:

• Plataforma de autoconhecimento espiritual
• Análises de mapa astral, numerologia, Ifá e outros sistemas
• Insights personalizados baseados em dados de nascimento
• Calendário energético e ferramentas de acompanhamento

Os serviços são fornecidos para fins de desenvolvimento pessoal e espiritual, não constituindo aconselhamento médico, jurídico ou profissional.`,
  },
  {
    icon: Zap,
    title: "Conta e Responsabilidades",
    content: `Você é responsável por:

• Manter suas credenciais de acesso em segurança
• Todas as atividades realizadas em sua conta
• Fornecer informações precisas de nascimento
• Notificar imediatamente sobre uso não autorizado

Você deve manter suas informações atualizadas. Não somos responsáveis por perdas decorrentes de informações incorretas.`,
  },
  {
    icon: MessageSquare,
    title: "Uso Adequado",
    content: `Você concorda em:

✅ Utilizar os serviços para fins pessoais e espirituais
✅ Respeitar outros usuários e comunidade
✅ Manter conteúdo apropriado e respeitoso
✅ Cumprir todas as leis aplicáveis

Você concorda em NÃO:

❌ Utilizar para fins comerciais não autorizados
❌ Reproduzir ou redistribuir conteúdo pago
❌ Tentar acessar contas de outros usuários
❌ Interferir com o funcionamento dos serviços
❌ Utilizar bots ou automatização não autorizada`,
  },
  {
    icon: AlertTriangle,
    title: "Isenção de Responsabilidade",
    content: `IMPORTANTE:

Os serviços da Cabala dos Caminhos são fornecer informativos e ferramentas de autoconhecimento.

NÃO GARANTIMOS:

• Precisão absoluta das interpretações
• Resultados específicos de qualquer ritual ou prática
• Eficácia de qualquer método espiritual

Os insights são gerados por algoritmos e inteligência artificial, não constituindo verdades absolutas. Use sua própria discernment.`,
  },
  {
    icon: FileText,
    title: "Propriedade Intelectual",
    content: `Todo conteúdo da plataforma é protegido:

• Design, layout e elementos visuais
• Textos, algoritmos e código
• Marcadores e identidade visual
• Conteúdo gerado (exceto pelo usuário)

Você mantém propriedade sobre conteúdo que cria, mas nos concede licença para utilizar conteúdo feedback para melhoria dos serviços.`,
  },
  {
    icon: Users,
    title: "Modificações dos Serviços",
    content: `Reservamo-nos o direito de:

• Modificar, suspender ou descontinuar serviços
• Alterar preços com aviso prévio de 30 dias
• Atualizar estes termos periodicamente
• Remover conteúdo inadequado

Alterações significativas serão comunicadas por email. Uso contínuo após alterações constitui aceitação.`,
  },
];

export default function TermsPage() {
  return (
    <CosmicBackground variant="subtle">
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-black/40 backdrop-blur-xl border-b border-amber-500/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-raleway">Voltar</span>
              </Link>
              <span className="text-slate-400 text-sm font-raleway">
                Versão 1.0 — 30 de Maio de 2026
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main id="main-content" tabIndex={-1} className="focus:outline-none container mx-auto px-4 py-12 max-w-4xl">
          {/* Title */}
          <div className="text-center mb-12">
            <Heading variant="display" glow="gold" className="mb-4">
              Termos de Uso
            </Heading>
            <MysticDivider variant="subtle" className="max-w-xs mx-auto mb-6" />
            <p className="text-slate-400 font-raleway max-w-2xl mx-auto">
              Estes termos regem o uso da plataforma Cabala dos Caminhos. Leia com atenção antes de utilizar nossos serviços.
            </p>
          </div>

          {/* Intro card */}
          <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <p className="text-lg text-amber-300 font-cormorant leading-relaxed">
              &ldquo;O caminho espiritual é uma jornada de crescimento pessoal. 
              Nossos serviços são ferramentas de suporte, não certezas absolutas. 
              A verdadeira transformação vem de dentro de você.&rdquo;
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div 
                key={index}
                className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10 hover:border-amber-500/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-playfair text-white mb-3">
                      {section.title}
                    </h2>
                    <p className="text-slate-400 font-raleway leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Agreement card */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
            <h3 className="text-xl font-playfair text-white mb-4 text-center">
              Ao utilizar nossos serviços, você confirma que:
            </h3>
            <ul className="space-y-3 text-slate-400 font-raleway max-w-lg mx-auto">
              <li className="flex items-start gap-3">
                <span className="text-amber-400">✓</span>
                <span>Leu e compreendeu estes termos</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400">✓</span>
                <span>Concorda com todas as condições</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400">✓</span>
                <span>Utiliza os serviços por vontade própria</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-amber-400">✓</span>
                <span>Assume responsabilidade por seu uso</span>
              </li>
            </ul>
          </div>

          {/* Contact card */}
          <div className="mt-12 p-8 rounded-2xl bg-white/[0.02] border border-amber-500/10">
            <h3 className="text-xl font-playfair text-white mb-4 text-center">
              Dúvidas sobre os termos?
            </h3>
            <p className="text-slate-400 font-raleway text-center mb-6">
              Nossa equipe está disponível para esclarecer qualquer questão.
            </p>
            <div className="flex justify-center">
              <a href="mailto:termos@cabaladoscaminhos.com">
                <MysticButton variant="outline">
                  Contactar Suporte
                </MysticButton>
              </a>
            </div>
          </div>

          {/* Back to home */}
          <div className="mt-12 text-center">
            <Link href="/">
              <MysticButton variant="golden">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </MysticButton>
            </Link>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-8 border-t border-amber-500/10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm font-raleway">
              © {new Date().getFullYear()} Cabala dos Caminhos. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </CosmicBackground>
  );
}