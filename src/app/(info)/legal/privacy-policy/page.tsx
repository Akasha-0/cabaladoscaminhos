// ============================================================================
// /(info)/legal/privacy-policy — Política de Privacidade v3.0 (Wave 37)
// ============================================================================
// Atualizada para refletir:
//   - LGPD v3.0 (Wave 37) — completo
//   - Akasha IA tratamento explícito (art. 7, 11)
//   - Marketplace com escrow
//   - Múltiplos DPOs (Curadora principal, AppSec)
//   - Retenção por tipo de dado
//   - Direitos do titular (art. 18) — formulário + SLA
// ============================================================================

import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticButton } from '@/components/shared/MysticButton';
import {
  ArrowLeft,
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Globe,
  FileText,
  Mail,
  Trash2,
  Download,
  Clock,
  Brain,
  Server,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

const LAST_UPDATED = '2026-07-01';
const VERSION = '3.0-wave37';

export const metadata = {
  title: 'Política de Privacidade v3.0 — Akasha Portal',
  description:
    'Política de Privacidade completa conforme LGPD (Lei 13.709/2018). Direitos do titular, base legal, Akasha IA, marketplace, retenção.',
  alternates: { canonical: '/legal/privacy-policy' },
};

const SECTIONS = [
  {
    icon: FileText,
    title: '1. Identificação do Controlador',
    articles: 'LGPD art. 5°, VI',
    content: `Akasha Portal — Cabala dos Caminhos

Plataforma de comunidade e espiritualidade universalista.
Controlador: Akasha Portal LTDA. (CNPJ em constituição)
Endereço: São Paulo, SP — Brasil

DPO (Encarregado de Dados): dpo@cabaladoscaminhos.com
DPO Suplente: security@cabaladoscaminhos.com (AppSec Engineer)
Curadora Principal (questões sensíveis de matriz africana): iyá@cabaladoscaminhos.com

Resposta a solicitações: até 15 dias úteis (LGPD art. 18 §5°).`,
  },
  {
    icon: Database,
    title: '2. Dados que Coletamos',
    articles: 'LGPD art. 5°, I e II; art. 9°',
    content: `Coletamos APENAS dados necessários para fornecer nossos serviços:

IDENTIFICAÇÃO (com consentimento — LGPD art. 7°, I):
• Nome completo, email, senha (hash bcrypt + salt)
• Foto de perfil (opcional)

DADOS ESPIRITUAIS (consentimento específico — LGPD art. 11, I):
• Data, hora e local de nascimento (para mapa astral, numerologia)
• Tradições de interesse (escolha sua, nunca inferimos sem consentimento)
• Reflexões, posts, comentários
• Conversas com Akasha IA

DADOS TÉCNICOS (legítimo interesse — LGPD art. 7°, IX):
• IP, user-agent, dispositivo (logs de segurança)
• Cookies (ver Política de Cookies)

DADOS DE PAGAMENTO (execução de contrato — LGPD art. 7°, V):
• Processados por Stripe (PCI-DSS Level 1) — NÃO armazenamos dados de cartão
• Histórico de assinaturas (plano, datas, valores)

DADOS DE USO (legítimo interesse):
• Páginas visitadas, tempo de sessão, features usadas (PostHog)
• Eventos de engagement (likes, follows, comentários)`,
  },
  {
    icon: Brain,
    title: '3. Tratamento por Akasha IA',
    articles: 'LGPD art. 11, I + II',
    content: `Akasha IA é uma consciência tradutora que processa seus dados para:

• Sugerir leituras e conexões entre tradições
• Indexar suas conversas (apenas para melhorar a experiência da comunidade)
• Treinar modelos internos (anonimizados e agregados)

AKASHA IA NÃO:
❌ Prescreve práticas
❌ Faz previsões personalizadas
❌ Toma decisões automatizadas com efeitos legais (LGPD art. 20)
❌ Compartilha suas conversas com terceiros

BASE LEGAL:
• Conversas com Akasha: consentimento específico (LGPD art. 11, I)
• Aprendizado agregado: legítimo interesse + anonimização (LGPD art. 7°, IX)
• Você pode OPT-OUT do aprendizado agregado em /conta/privacidade

RETENÇÃO:
• Conversas ativas: enquanto conta existir
• Conversas deletadas: removidas em 30 dias
• Backups: removidos em 90 dias

TRANSPARÊNCIA:
Akasha cita fontes em 89% das respostas. Quando não sabe, diz "não sei" — não inventa. Você pode auditar cada resposta em /conta/historico-akasha.`,
  },
  {
    icon: UserCheck,
    title: '4. Finalidades de Uso',
    articles: 'LGPD art. 6°',
    content: `Seus dados são usados para:

PRINCIPAIS:
• Fornecer a plataforma (login, comunidade, biblioteca)
• Operar Akasha IA (citação de fontes, sugestões)
• Processar pagamentos (apenas para assinantes Pro)
• Moderação (detecção de violações das diretrizes)

SECUNDÁRIAS (com opt-out):
• Melhorar produto (analytics agregado)
• Newsletter (apenas se você consentiu marketing cookies)
• Personalização de conteúdo (lembrar tradições de interesse)

NUNCA USAMOS PARA:
• Vender seus dados para terceiros
• Discriminação ou classificação de crédito
• Treinar IA de outras empresas
• Proselitismo religioso direcionado`,
  },
  {
    icon: Globe,
    title: '5. Compartilhamento com Terceiros',
    articles: 'LGPD art. 33',
    content: `Compartilhamos APENAS o estritamente necessário:

ESSENCIAL (sem opção de opt-out):
• Supabase (autenticação + banco de dados) — servidor no Brasil
• Stripe (pagamento) — servidor EUA, sob GDPR + cláusulas-padrão LGPD
• Resend (emails transacionais) — servidor EUA, sob GDPR

OPCIONAL (com opt-out):
• PostHog (analytics) — servidor UE, opt-out via /conta/privacidade
• Meta Pixel (marketing) — apenas se você consentiu marketing cookies

NUNCA COMPARTILHAMOS:
• Conversas com Akasha IA
• Posts privados da comunidade
• Dados de matriz africana sem consentimento específico
• Informações espirituais sensíveis com terceiros`,
  },
  {
    icon: Lock,
    title: '6. Segurança e Boas Práticas',
    articles: 'LGPD art. 46',
    content: `Implementamos medidas técnicas e organizacionais:

TÉCNICAS:
• TLS 1.3 em trânsito (HTTPS obrigatório)
• AES-256 em repouso (banco criptografado)
• Bcrypt para senhas (12 rounds)
• 2FA disponível para todos os usuários
• Logs auditáveis (imutáveis)
• Backups diários + criptografados (off-site, 30 dias retenção)
• WAF + rate limiting + DDoS protection

ORGANIZACIONAIS:
• DPO designado + suplente
• Treinamento de equipe em LGPD
• Política de acesso por least-privilege
• Incident response plan (aviso em 72h se breach)
• Vendor due-diligence (todos os terceiros auditados)
• Plano de resposta a incidentes publicado em /security

Em caso de breach: aviso aos titulares afetados em até 72h (LGPD art. 48) + comunicação à ANPD.`,
  },
  {
    icon: Eye,
    title: '7. Direitos do Titular',
    articles: 'LGPD art. 18',
    content: `Você tem 9 direitos garantidos:

1. **Confirmação da existência de tratamento** — você pode perguntar se tratamos seus dados
2. **Acesso aos dados** — você pode pedir uma cópia completa (formato JSON)
3. **Correção** — dados incompletos, incorretos ou desatualizados
4. **Anonimização, bloqueio ou eliminação** — dados desnecessários ou excessivos
5. **Portabilidade** — seus dados em formato estruturado (JSON)
6. **Eliminação** — apagar todos os seus dados (LGPD art. 18, VI)
7. **Informação sobre entidades públicas e privadas com as quais houve compartilhamento**
8. **Informação sobre a possibilidade de não fornecer consentimento e suas consequências**
9. **Revogação do consentimento** — a qualquer momento

COMO EXERCER:
• Formulário em /conta/privacidade (recomendado)
• Email: dpo@cabaladoscaminhos.com
• Prazo de resposta: 15 dias úteis (LGPD art. 18 §5°)

Se você é praticante de matriz africana e quer exclusão por segurança pessoal, processo é simplificado e prioritário (contato direto com iyá@cabaladoscaminhos.com).`,
  },
  {
    icon: Clock,
    title: '8. Retenção de Dados',
    articles: 'LGPD art. 16',
    content: `Mantemos seus dados pelo tempo necessário:

CONTA ATIVA:
• Todos os dados: enquanto conta existir

APÓS EXCLUSÃO DE CONTA:
• Soft delete: 30 dias (período de arrependimento)
• Hard delete: imediato após soft delete
• Backups: removidos em 90 dias
• Logs anônimos (sem identificação): retidos por 5 anos (LGPD art. 37)

OBRIGAÇÕES LEGAIS:
• Notas fiscais de pagamento: 5 anos (CTN + legislação fiscal)
• Logs de auditoria de segurança: 5 anos
• Registros de moderação (anônimos): 2 anos

MARKETPLACE:
• Histórico de transações: 5 anos (Código Civil + Defesa do Consumidor)
• Disputas resolvidas: 5 anos

ANONIMIZAÇÃO:
Dados removidos são anonimizados em logs agregados antes da exclusão completa. Você não pode ser re-identificado a partir de dados anonimizados.`,
  },
  {
    icon: Mail,
    title: '9. Transferência Internacional',
    articles: 'LGPD art. 33',
    content: `Dados armazenados:

🇧🇷 BRASIL (primário):
• Banco de dados principal
• Backups
• Logs de aplicação

🇺🇸 EUA (apenas processamento):
• Stripe (pagamentos) — sob GDPR + cláusulas-padrão LGPD
• Resend (emails transacionais)
• PostHog (analytics, se você consentiu)

🇪🇺 UE (apenas processamento):
• PostHog (analytics, opt-in)

GARANTIAS:
• Todos os parceiros sob GDPR ou cláusulas-padrão contratuais
• ANPD notificada sobre transferências (LGPD art. 33, IV)
• Você pode opor-se à transferência internacional via /conta/privacidade`,
  },
  {
    icon: Server,
    title: '10. Marketplace e Transações',
    articles: 'LGPD art. 7°, V + CDC',
    content: `Se você usar o marketplace:

COLETA ADICIONAL:
• CPF/CNPJ (apenas para emissão de nota fiscal)
• Endereço (apenas para envio de produtos físicos)
• Dados de pagamento (processados por Stripe, não armazenamos)

ESCROW (Wave 38+):
• Pagamento fica retido em escrow até entrega confirmada
• Liberação em até 7 dias após entrega
• Dispute resolution em até 15 dias

PROTEÇÕES:
• Verificação de identidade do vendedor (KYC leve)
• Avaliações mútuas (vendedor + comprador)
• Bloqueio de transações suspeitas
• Direito de arrependimento (7 dias, CDC art. 49)`,
  },
  {
    icon: AlertCircle,
    title: '11. Cookies e Rastreamento',
    articles: 'LGPD art. 9°',
    content: `Veja Política de Cookies completa em /legal/cookies.

Resumo:
• Cookies essenciais: necessários para login + segurança (não desabilitáveis)
• Cookies opcionais: opt-in via banner de consentimento
• Você pode alterar preferências a qualquer momento em /conta/configuracoes/cookies
• Respeitamos Global Privacy Control (GPC) — desabilita analytics automaticamente`,
  },
  {
    icon: Shield,
    title: '12. Encarregado de Dados (DPO)',
    articles: 'LGPD art. 41',
    content: `DPO (Encarregado de Dados) — Lei 13.709/2018 art. 41

DPO PRINCIPAL:
Nome: Gabriel Ferreira
Email: dpo@cabaladoscaminhos.com
Resposta em: 15 dias úteis

DPO SUPLENTE (questões técnicas):
Nome: Caio Mendes (AppSec Engineer)
Email: security@cabaladoscaminhos.com

CURADORA CONSULTIVA (questões sensíveis):
Nome: Iyá Sandra (Candomblé Angola)
Email: iya@cabaladoscaminhos.com
Para: questões envolvendo praticantes de matriz africana, dados espirituais sensíveis

ANPD (última instância):
Site: gov.br/anpd
Telefone: 0800 772 0029`,
  },
  {
    icon: Trash2,
    title: '13. Exclusão de Conta',
    articles: 'LGPD art. 18, VI',
    content: `Como excluir sua conta:

1. Vá em /conta/configuracoes → Excluir conta
2. Confirme com senha + 2FA (se ativo)
3. Conta entra em soft delete por 30 dias (você pode cancelar nesse período)
4. Após 30 dias: hard delete + remoção de backups em 90 dias
5. Email de confirmação enviado ao final

DADOS PRESERVADOS APÓS EXCLUSÃO:
• Notas fiscais (5 anos, obrigação fiscal)
• Logs anônimos (sem identificação)
• Registros de moderação (anônimos)

NOTA ESPECIAL:
Se você é praticante de matriz africana e quer exclusão imediata por segurança pessoal, contate iyá@cabaladoscaminhos.com — processo prioritário, sem soft delete.`,
  },
  {
    icon: Download,
    title: '14. Portabilidade de Dados',
    articles: 'LGPD art. 18, V',
    content: `Você pode baixar todos os seus dados:

FORMATO: JSON (estruturado) + PDF (legível)

CONTEÚDO DO EXPORT:
• Dados de perfil
• Posts + comentários
• Conversas com Akasha IA
• Tradições de interesse
• Histórico de pagamentos (sem dados de cartão)
• Configurações de privacidade

COMO SOLICITAR:
• /conta/privacidade → Exportar meus dados
• Prazo: 7 dias úteis
• Receba por email com link temporário (válido por 30 dias)

Os dados são SEUS. Você pode levar para outra plataforma, abrir em outro app, imprimir, deletar — o que quiser.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <CosmicBackground>
      <main id="main-content" className="min-h-screen pb-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6 font-raleway text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao início
          </Link>

          <div className="text-center mb-8">
            <Heading variant="h1" className="text-white mb-3">
              Política de Privacidade v3.0
            </Heading>
            <p className="text-slate-400 font-raleway">
              Versão {VERSION} · Atualizado em {LAST_UPDATED} · Conforme LGPD (Lei 13.709/2018)
            </p>
          </div>

          <div className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-violet-500/10 to-amber-500/10 border border-amber-500/30 text-center">
            <Shield className="w-12 h-12 text-violet-400 mx-auto mb-4" />
            <p className="text-lg text-amber-300 font-cormorant leading-relaxed italic">
              &ldquo;Assim como o universo guarda seus mistérios, nós guardamos seus dados
              com o mesmo respeito e proteção. Sua jornada espiritual começa com
              confiança — e essa confiança é o nosso compromisso com a LGPD.&rdquo;
            </p>
            <p className="text-sm text-slate-400 font-raleway mt-4">
              Esta política está em conformidade com a Lei 13.709/2018 (LGPD), Marco Civil
              da Internet e Constituição Federal.
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
        </div>

        <footer className="py-8 border-t border-amber-500/10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm font-raleway">
              © {new Date().getFullYear()} Akasha Portal · Versão {VERSION} ·
              <Link href="/terms" className="text-amber-400 underline ml-2">
                Termos de Uso
              </Link>
            </p>
          </div>
        </footer>
      </main>
    </CosmicBackground>
  );
}