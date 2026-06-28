import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { MysticButton } from '@/components/shared/MysticButton';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Globe, FileText, Mail, Trash2, Download, Clock } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

// ============================================================================
// POLÍTICA DE PRIVACIDADE — LGPD Lei 13.709/2018
// ============================================================================
// Reescrita em Wave 11 (Caio · AppSec) para citar artigos específicos,
// DPO designado, base legal por coleta, e direitos do titular.
//
// Conformidade:
//   - LGPD art. 9° (princípio da necessidade)
//   - LGPD art. 18 (direitos do titular)
//   - LGPD art. 37 (registro de operações)
//   - LGPD art. 41 (DPO)
//   - LGPD art. 46 (segurança e boas práticas)
// ============================================================================

export const metadata: Metadata = {
  title: 'Política de Privacidade — Akasha Portal',
  description: 'Como protegemos seus dados pessoais conforme a LGPD (Lei 13.709/2018). Direitos do titular, base legal, DPO e transferência.',
  alternates: { canonical: '/privacy' },
};

const LAST_UPDATED = '2026-06-27';
const VERSION = '2.0-wave11';

const SECTIONS = [
  {
    icon: FileText,
    title: '1. Identificação do Controlador',
    articles: 'LGPD art. 5°, VI',
    content: `Akasha Portal — Cabala dos Caminhos
Plataforma de comunidade e espiritualidade universalista.
Controlador: Akasha Portal LTDA. (em constituição)
Endereço: São Paulo, SP — Brasil
DPO (Encarregado de Dados): dpo@cabaladoscaminhos.com
Resposta a solicitações: até 15 dias úteis (LGPD art. 18 §5°).`,
  },
  {
    icon: Database,
    title: '2. Dados que Coletamos',
    articles: 'LGPD art. 5°, I e II; art. 9°',
    content: `Coletamos APENAS dados necessários para fornecer nossos serviços:

• Identificação: nome completo, email, senha (hash bcrypt)
• Nascimento: data, hora (opcional), local (opcional) — para cálculos astrológicos e numerológicos
• Perfil espiritual: signo, Odú, orixás, preferências de tradição
• Conteúdo: posts, comentários, favoritos, mensagens com a IA
• Uso: endereço IP (com hash + salt), user-agent, timestamps de acesso
• Pagamento: processado por Stripe (PCI-DSS). Não armazenamos cartão.

NÃO coletamos: CPF, RG, endereço residencial, telefone, dados de saúde, dados biométricos, opinião política, religião (já inferida pela sua prática), orientação sexual.`,
  },
  {
    icon: Lock,
    title: '3. Base Legal para Tratamento',
    articles: 'LGPD art. 7°',
    content: `Cada finalidade tem base legal explícita:

• Execução de contrato (art. 7°, V): cadastro, geração de mapa astral, comunidade
• Consentimento (art. 7°, I): cookies opcionais (analytics, marketing), comunicações promocionais, perfil espiritual público
• Legítimo interesse (art. 7°, IX): moderação, segurança, prevenção a fraudes, logs de acesso (com hash de IP — art. 46)
• Cumprimento de obrigação legal (art. 7°, II): retenção de notas fiscais (5 anos), cooperação com autoridades

Você pode revogar consentimentos a qualquer momento em Configurações > Privacidade.`,
  },
  {
    icon: Shield,
    title: '4. Como Protegemos seus Dados',
    articles: 'LGPD art. 46; art. 48',
    content: `Segurança em camadas:

• Criptografia em trânsito: TLS 1.2+ (HTTPS obrigatório — HSTS preload)
• Criptografia em repouso: AES-256 gerenciado pelo Supabase (Postgres)
• Autenticação: Supabase Auth com JWT + refresh tokens
• Senhas: bcrypt com salt (10 rounds)
• Headers de segurança: CSP, X-Frame-Options, Permissions-Policy
• Rate limiting: por IP + por usuário (post 10/h, comment 30/h, like 100/h, follow 50/h)
• Auditoria: registro imutável de ações sensíveis (auth, delete, export) por 24 meses
• WAF: Vercel Edge Network mitiga DDoS, SQLi, XSS na borda
• Backups: snapshot diário do Postgres, retenção 30 dias, criptografado`,
  },
  {
    icon: Eye,
    title: '5. Compartilhamento',
    articles: 'LGPD art. 27 a 33',
    content: `Compartilhamos dados APENAS com operadores essenciais sob contrato:

• Supabase (Postgres + Auth): armazenamento e autenticação — EUA, cláusulas-padrão contratuais
• Vercel (Edge + Hosting): CDN e serverless — EUA, Privacy Shield successor
• OpenAI / MiniMax (Akashic IA): prompts NUNCA contêm PII identificável; textos são truncados em 500 chars
• Stripe (pagamento): tokenização, sem armazenamento de cartão por nós
• Sentry (erros): PII removido automaticamente via safeContext

NÃO vendemos, alugamos ou comercializamos seus dados pessoais. Em caso de ordem judicial,，我们将 cumprir intimação específica (art. 23).`,
  },
  {
    icon: Clock,
    title: '6. Retenção',
    articles: 'LGPD art. 16',
    content: `Dados mantidos pelo tempo necessário:

• Conta ativa: enquanto você tiver cadastro
• Após exclusão: 30 dias em backup criptografado (recovery), depois eliminados
• Logs de auditoria (LGPD): 24 meses
• Logs de autenticação: 12 meses
• Notas fiscais: 5 anos (obrigação legal)
• IP/User-Agent de waitlist: 90 dias (legítimo interesse limitado)

Após esses prazos, dados são anonimizados ou excluídos definitivamente.`,
  },
  {
    icon: UserCheck,
    title: '7. Direitos do Titular (LGPD art. 18)',
    articles: 'LGPD art. 18',
    content: `Você tem 9 direitos garantidos. Todos exercíveis via dpo@cabaladoscaminhos.com ou na sua conta:

I.   Confirmação da existência de tratamento
II.  Acesso aos dados
III. Correção de dados incompletos ou incorretos
IV.  Anonimização, bloqueio ou eliminação de dados desnecessários
V.   Portabilidade (formato JSON estruturado — implementado em GET /api/users/[id]/export)
VI.  Eliminação dos dados tratados com consentimento (implementado em POST /api/users/[id]/delete-account)
VII. Revogação do consentimento
VIII. Oposição a tratamento
IX.  Revisão de decisões automatizadas

Resposta em até 15 dias úteis. Sem custo. Comprovação de identidade pode ser exigida para segurança.`,
  },
  {
    icon: Globe,
    title: '8. Cookies',
    articles: 'LGPD art. 9°; art. 33',
    content: `Categorias (você escolhe quais ativar no banner):

• Essenciais (obrigatórios): sessão, autenticação, segurança, rate limit
• Analytics (opcional): métricas anônimas — sem PII
• Marketing (opcional): N/A no momento (não usamos remarketing)

Gerenciamento: banner na primeira visita + Configurações > Privacidade > Cookies. Você pode revogar a qualquer momento.`,
  },
  {
    icon: Mail,
    title: '9. Encarregado de Dados (DPO)',
    articles: 'LGPD art. 41',
    content: `Encarregado pelo tratamento de dados pessoais (DPO):

Nome: Akasha DPO
Email: dpo@cabaladoscaminhos.com
Prazo de resposta: 15 dias úteis
Canal seguro: PGP disponível sob solicitação

O DPO é responsável por:
• Aceitar reclamações e comunicações dos titulares
• Orientar funcionários sobre práticas de proteção
• Executar a política de privacidade junto à ANPD
• Coordenar respostas a incidentes de segurança`,
  },
  {
    icon: Trash2,
    title: '10. Incidentes e Comunicação',
    articles: 'LGPD art. 48',
    content: `Em caso de incidente de segurança com risco relevante:

• Comunicaremos titulares afetados em até 72 horas (alinhado com GDPR)
• Notificaremos a ANPD conforme regulamentação
• Publicaremos nota pública em /status
• Investigaremos causa raiz e publicaremos post-mortem anonimizado

Não houve incidentes até a publicação desta versão.`,
  },
];

const QUICK_LINKS = [
  { href: '/api/users/me/export', label: 'Baixar meus dados (JSON)', icon: Download },
  { href: '/settings/privacy', label: 'Gerenciar privacidade', icon: Lock },
  { href: 'mailto:dpo@cabaladoscaminhos.com', label: 'Falar com o DPO', icon: Mail },
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
              <div className="text-right">
                <div className="text-slate-400 text-sm font-raleway">
                  Versão {VERSION} · {LAST_UPDATED}
                </div>
                <div className="text-slate-500 text-xs">LGPD Lei 13.709/2018</div>
              </div>
            </div>
          </div>
        </header>

        <main id="main-content" tabIndex={-1} className="focus:outline-none container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <Heading variant="display" glow="gold" className="mb-4">
              Política de Privacidade
            </Heading>
            <MysticDivider variant="subtle" className="max-w-xs mx-auto mb-6" />
            <p className="text-slate-400 font-raleway max-w-2xl mx-auto">
              Conforme a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018),
              esta política descreve como coletamos, tratamos, armazenamos e
              protegemos seus dados pessoais.
            </p>
          </div>

          {/* Quick links */}
          <div className="mb-12 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/30 transition-all"
              >
                <link.icon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <span className="text-sm text-amber-300 font-raleway">{link.label}</span>
              </a>
            ))}
          </div>

          {/* Intro card */}
          <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <p className="text-lg text-amber-300 font-cormorant leading-relaxed">
              &ldquo;Assim como o universo guarda seus mistérios, nós guardamos seus dados
              com o mesmo respeito e proteção. Sua jornada espiritual começa com
              confiança — e essa confiança é o nosso compromisso com a LGPD.&rdquo;
            </p>
            <p className="text-xs text-slate-500 mt-4">
              Documento formal: <Link href="/privacy" className="text-amber-400 underline">/privacy</Link> · Versão {VERSION}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {SECTIONS.map((section, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/[0.02] border border-amber-500/10 hover:border-amber-500/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-playfair text-white mb-1">
                      {section.title}
                    </h2>
                    <p className="text-xs text-amber-400/80 mb-3 font-mono">
                      {section.articles}
                    </p>
                    <p className="text-slate-400 font-raleway leading-relaxed whitespace-pre-line break-words [overflow-wrap:anywhere]">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ANPD reference */}
          <div className="mt-12 p-6 rounded-2xl bg-violet-500/5 border border-violet-500/20">
            <h3 className="text-lg font-playfair text-white mb-3">
              Autoridade Nacional de Proteção de Dados (ANPD)
            </h3>
            <p className="text-slate-400 font-raleway text-sm leading-relaxed">
              Se nossa resposta ao seu pedido não for satisfatória, você pode
              reclamar diretamente à ANPD através do site{' '}
              <a
                href="https://www.gov.br/anpd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 underline"
              >
                gov.br/anpd
              </a>{' '}
              ou pelo telefone 0800 772 0029.
            </p>
          </div>

          <div className="mt-12 text-center">
            <Link href="/">
              <MysticButton variant="golden">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Início
              </MysticButton>
            </Link>
          </div>
        </main>

        <footer className="py-8 border-t border-amber-500/10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm font-raleway">
              © {new Date().getFullYear()} Cabala dos Caminhos · Akasha Portal ·
              {' '}<Link href="/terms" className="text-amber-400 underline">Termos de Uso</Link>
            </p>
          </div>
        </footer>
      </div>
    </CosmicBackground>
  );
}
