'use client';

import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { MysticButton } from '@/components/shared/MysticButton';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Globe } from 'lucide-react';
import Link from 'next/link';

const sections = [
  {
    icon: Shield,
    title: "Coleta de Informações",
    content: `Coletamos apenas as informações necessárias para fornecer nossos serviços espirituais:
    
• Dados de nascimento (data, hora, local) para cálculos astrológicos e numerológicos
• Informações de conta (email, nome) para autenticação
• Dados de uso para melhoria da experiência
• Preferências espirituais para personalização de insights

Não coletamos informações financeiras sensíveis — pagamentos são processados via Stripe.`,
  },
  {
    icon: Lock,
    title: "Proteção de Dados",
    content: `Implementamos múltiplas camadas de proteção:

• Criptografia SSL/TLS em todas as comunicações
• Armazenamento seguro em servidores protegidos
• Autenticação via Supabase com tokens JWT
• Práticas de segurança seguindo GDPR

Seus dados são seus. Você pode solicitar exclusão a qualquer momento.`,
  },
  {
    icon: Eye,
    title: "Uso das Informações",
    content: `Seus dados são utilizados para:

• Gerar seu mapa da alma personalizado
• Fornecer insights e recomendações espirituais
• Melhorar nossos algoritmos e serviços
• Comunicar atualizações importantes (com seu consentimento)

Nunca vendemos, alugamos ou compartilhamos seus dados com terceiros para fins publicitários.`,
  },
  {
    icon: Database,
    title: "Armazenamento",
    content: `Seus dados são armazenados de forma segura:

• Banco de dados PostgreSQL via Supabase
• Cache Redis para performance
• Retenção mínima necessária para serviços
• backup regulares automatizados

Período de retenção: duração da sua conta + 30 dias após exclusão.`,
  },
  {
    icon: UserCheck,
    title: "Seus Direitos",
    content: `Você possui direitos completos sobre seus dados:

• Acesso: solicitar cópia dos seus dados
• Correção: atualizar informações incorretas
• Exclusão: remover todos os dados (direito ao esquecimento)
• Portabilidade: receber seus dados em formato legível
• Oposição: cancelar processamento específico

Para exercer seus direitos, entre em contato via email.`,
  },
  {
    icon: Globe,
    title: "Cookies",
    content: `Utilizamos cookies essenciais para:

• Manter sessão de usuário autenticada
• Salvar preferências de interface
• Analytics anonimizados para melhoria
• Funcionalidade de carrinho/pagamento

Cookies de terceiros (Stripe, Supabase) são gerenciados por seus próprios termos.`,
  },
];

export default function PrivacyPage() {
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
                Última atualização: 30 de Maio de 2026
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Title */}
          <div className="text-center mb-12">
            <Heading variant="display" glow="gold" className="mb-4">
              Política de Privacidade
            </Heading>
            <MysticDivider variant="subtle" className="max-w-xs mx-auto mb-6" />
            <p className="text-slate-400 font-raleway max-w-2xl mx-auto">
              Sua privacidade é sagrada para nós. Esta política descreve como protegemos e gerenciamos seus dados pessoais.
            </p>
          </div>

          {/* Intro card */}
          <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <p className="text-lg text-amber-300 font-cormorant leading-relaxed">
              &ldquo;Assim como o universo guarda seus mistérios, nós guardamos seus dados com o mesmo respeito e proteção. 
              Sua jornada espiritual começa com confiança.&rdquo;
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

          {/* Contact card */}
          <div className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20">
            <h3 className="text-xl font-playfair text-white mb-4 text-center">
              Precisa de ajuda com seus dados?
            </h3>
            <p className="text-slate-400 font-raleway text-center mb-6">
              Nossa equipe está disponível para responder suas dúvidas sobre privacidade.
            </p>
            <div className="flex justify-center">
              <a href="mailto:privacidade@cabaladoscaminhos.com">
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