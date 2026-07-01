// ============================================================================
// /(info)/legal/cookies — Cookies Policy v3.0 (Wave 37)
// ============================================================================

import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { MysticButton } from '@/components/shared/MysticButton';
import { ArrowLeft, Cookie, Shield, Eye, Settings, Trash2 } from 'lucide-react';
import Link from 'next/link';

const LAST_UPDATED = '2026-07-01';
const VERSION = '3.0-wave37';

export const metadata = {
  title: 'Política de Cookies — Akasha Portal v3.0',
  description:
    'Como Akasha Portal usa cookies: essenciais, funcionais, analytics e marketing. LGPD-compliant com opt-in explícito.',
  alternates: { canonical: '/legal/cookies' },
};

const SECTIONS = [
  {
    icon: Cookie,
    title: '1. O que são cookies',
    content: `Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. Eles permitem que o site "lembre" suas ações e preferências por um período de tempo.

Akasha Portal usa cookies para (1) manter você logado, (2) lembrar suas preferências (idioma, tema), (3) medir como o site é usado, (4) personalizar conteúdo.

Você pode desabilitar cookies a qualquer momento nas configurações do seu navegador — mas isso pode quebrar funcionalidades (login, preferências).`,
  },
  {
    icon: Shield,
    title: '2. Tipos de cookies que usamos',
    content: `🔒 ESSENCIAIS (não podem ser desabilitados)
• Sessão de login (supabase-auth-token)
• Preferências de tema (dark/light)
• CSRF protection
• Balanceamento de carga

⚙️ FUNCIONAIS (opcionais, ajudam na experiência)
• Idioma preferido
• Última tradição visitada
• Filtros de comunidade salvos
• Onboarding em progresso

📊 ANALYTICS (opcionais, anônimos quando possível)
• PostHog (eventos de uso agregados, sem PII por padrão)
• Métricas de performance (Lighthouse, Core Web Vitals)

📢 MARKETING (opcionais, opt-in explícito)
• Rastreamento de campanhas (UTM parameters)
• Pixel do Facebook/Meta (apenas se você consentir marketing cookies)
• Google Ads conversion tracking (apenas se você consentir)`,
  },
  {
    icon: Eye,
    title: '3. Cookies de terceiros',
    content: `Alguns cookies vêm de serviços terceiros que usamos:

• Supabase (autenticação) — cookies essenciais
• PostHog (analytics) — cookies opcionais
• Stripe (pagamento) — cookies essenciais durante checkout
• Resend (email tracking) — cookies opcionais (open/click tracking)
• Meta Pixel (se você consentir) — cookies opcionais de marketing
• Google Ads (se você consentir) — cookies opcionais de marketing

Cada provedor tem sua própria política de privacidade. Akasha Portal NÃO vende seus dados para terceiros.`,
  },
  {
    icon: Settings,
    title: '4. Como gerenciar cookies',
    content: `Você tem 3 formas de gerenciar cookies:

1. **Banner de consentimento** (primeira visita) — escolha quais categorias aceitar
2. **Configurações da conta** (/conta/configuracoes/cookies) — altere a qualquer momento
3. **Configurações do navegador** — bloqueie ou delete todos os cookies

Nota: bloquear cookies ESSENCIAIS pode quebrar login + segurança. Não recomendamos.

Links úteis:
• Chrome: support.google.com/chrome/answer/95647
• Firefox: support.mozilla.org/kb/clear-cookies-and-site-data-firefox
• Safari: support.apple.com/guide/safari/manage-cookies-and-website-data`,
  },
  {
    icon: Trash2,
    title: '5. Retenção e exclusão',
    content: `Retenção por tipo:

• Cookies essenciais: até você deslogar ou fechar o navegador
• Cookies funcionais: até 1 ano
• Cookies analytics: até 13 meses (Google Analytics padrão)
• Cookies marketing: até 90 dias

Para limpar cookies agora:
• Use o banner de consentimento para recusar categorias
• Ou limpe dados do navegador nas configurações

Akasha Portal respeita o sinal "Global Privacy Control" (GPC) do seu navegador — se ativo, desabilitamos analytics + marketing automaticamente.`,
  },
];

export default function CookiesPage() {
  return (
    <CosmicBackground>
      <main id="main-content" className="min-h-screen pb-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6 font-raleway text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao início
          </Link>

          <div className="text-center mb-8">
            <Heading variant="h1" className="text-white mb-3">
              Política de Cookies
            </Heading>
            <p className="text-slate-400 font-raleway">
              Versão {VERSION} · Atualizado em {LAST_UPDATED}
            </p>
          </div>

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