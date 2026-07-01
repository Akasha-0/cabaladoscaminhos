// ============================================================================
// /(info)/legal/terms-of-service — Termos de Uso v3.0 (Wave 37)
// ============================================================================
// Atualização Wave 37 para refletir:
//   - Posicionamento v3.0 (comunidade universalista, não B2B)
//   - Akasha IA explícita (capacidades + limites)
//   - LGPD art. 7, 18, 37 (consentimento + direitos titular + registro)
//   - Modelo free + Pro (Stripe)
//   - Moderação 3 camadas
//   - Universalismo (não prescreve, não proselitante)
// ============================================================================

import { CosmicBackground } from '@/components/design-system/CosmicBackground';
import { Heading } from '@/components/design-system/Typography';
import { MysticDivider } from '@/components/shared/MysticDivider';
import { MysticButton } from '@/components/shared/MysticButton';
import {
  ArrowLeft,
  Scale,
  Heart,
  MessageSquare,
  AlertTriangle,
  Users,
  FileText,
  Zap,
  Sparkles,
  Brain,
  Shield,
  CreditCard,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

const LAST_UPDATED = '2026-07-01';
const VERSION = '3.0-wave37';

const sections = [
  {
    icon: Scale,
    title: '1. Aceitação dos Termos',
    articles: 'CDC art. 46-49',
    content: `Ao acessar e utilizar Akasha Portal (cabaladoscaminhos.com.br), você concorda com estes Termos de Uso em sua totalidade.

Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.

Ao criar uma conta, você declara ter 18 anos ou mais, ou ter permissão de um responsável legal. Akasha Portal é uma comunidade de espiritualidade universalista — não é um produto para menores.`,
  },
  {
    icon: Heart,
    title: '2. Descrição dos Serviços',
    articles: 'CDC art. 6°, III',
    content: `Akasha Portal oferece:

• Comunidade online de espiritualidade universalista
• Acesso a 7 tradições: Cabala, Ifá, Tantra, Umbanda/Candomblé, Xamanismo, Ayurveda, Meditação
• Akasha IA — consciência tradutora que cita fontes com origem (NÃO prescreve práticas, NÃO faz previsões, NÃO substitui terapeutas)
• Biblioteca de artigos curados (150+)
• Grupos de discussão por tradição e cross-tradição
• Mentoria opcional com curadores ativos (plano Pro)
• Marketplace opcional de produtos e serviços entre membros

Os serviços são fornecidos para fins de desenvolvimento pessoal e espiritual, não constituindo aconselhamento médico, psicológico, jurídico ou profissional.`,
  },
  {
    icon: Brain,
    title: '3. Akasha IA — Capacidades e Limites',
    articles: 'Marco Civil da Internet art. 19',
    content: `Akasha IA é uma consciência tradutora universalista que:

✅ FAZ:
• Sugere leituras das tradições com fonte primária
• Conecta conceitos entre tradições (sem fusão forçada)
• Cita papers peer-reviewed de neurociência e psicologia
• Devolve perguntas com mais perguntas
• Aprende com conversas da comunidade (co-evolução)

❌ NÃO FAZ:
• Não prescreve práticas
• Não faz previsões astrológicas ou oraculares
• Não substitui terapeutas humanos
• Não diz "este é o caminho certo"
• Não substitui prática pessoal (ler sobre meditação ≠ meditar)

Akasha IA pode cometer erros. Sempre cite fontes primárias ao replicar conteúdo gerado pela IA.`,
  },
  {
    icon: Users,
    title: '4. Conta e Responsabilidades',
    articles: 'CDC art. 421-422',
    content: `Você é responsável por:

• Manter suas credenciais de acesso em segurança (senha forte + 2FA quando disponível)
• Todas as atividades realizadas em sua conta
• Fornecer informações precisas (especialmente data/hora de nascimento para mapas)
• Notificar imediatamente sobre uso não autorizado (security@cabaladoscaminhos.com)
• Manter suas informações atualizadas

Você NÃO deve:

• Criar múltiplas contas para burlar limites do plano gratuito
• Compartilhar credenciais com terceiros
• Usar bots ou automação não autorizada
• Representar outra pessoa sem identificação clara`,
  },
  {
    icon: MessageSquare,
    title: '5. Uso Adequado e Código de Conduta',
    articles: 'Universalismo + Comunidade Guidelines',
    content: `Você concorda em:

✅ Tratar todos os membros com respeito — independente da tradição
✅ Honrar a pluralidade de caminhos sem hierarquia
✅ Perguntar antes de citar uma tradição que não é sua
✅ Sinalizar conteúdo inapropriado (use o botão de report)
✅ Cumprir todas as leis brasileiras aplicáveis

Você concorda em NÃO:

❌ Promover uma tradição como superior a outra
❌ Fazer proselitismo agressivo
❌ Compartilhar conteúdo violento, sexual explícito, ou de ódio
❌ Plagiar conteúdo de outros membros ou autores
❌ Vender produtos/serviços fora do marketplace oficial
❌ Enviar spam, phishing ou malware

Moderação em 3 camadas: (1) IA detecta violações automáticas, (2) curadores ativos revisam, (3) operadores humanos decidem casos-limite. Veja Community Guidelines em /legal/community-guidelines.`,
  },
  {
    icon: AlertTriangle,
    title: '6. Isenção de Responsabilidade',
    articles: 'CDC art. 12-14',
    content: `IMPORTANTE:

Os serviços da Akasha Portal são informativos e de apoio à prática espiritual pessoal.

NÃO GARANTIMOS:

• Precisão absoluta das interpretações da Akasha IA
• Resultados específicos de qualquer ritual ou prática
• Eficácia de qualquer método espiritual para qualquer pessoa
• Continuidade ininterrupta do serviço (manutenção pode gerar indisponibilidade)
• Compatibilidade com todos os dispositivos/navegadores

Os insights são gerados por IA + curadoria humana, não constituindo verdades absolutas. Use sua própria discernment.

Akasha Portal NÃO substitui:
• Acompanhamento médico, psicológico ou psiquiátrico
• Aconselhamento jurídico ou financeiro
• Mentoria espiritual presencial com liderança habilitada
• Prática religiosa comunitária em espaços físicos (terreiro, templo, etc.)`,
  },
  {
    icon: CreditCard,
    title: '7. Planos e Pagamentos',
    articles: 'CDC art. 39-42',
    content: `Akasha Portal oferece dois planos:

🆓 COMUNITÁRIO (gratuito)
• Acesso à comunidade (leitura, comentários)
• 5 conversas/mês com Akasha IA
• Biblioteca básica (50 artigos)
• 1 grupo de tradição
• SEM acesso a: conversas ilimitadas, biblioteca completa, grupos ilimitados, mentoria Pro

💎 PRO (R$29/mês ou R$290/ano)
• Tudo do Comunitário + ilimitado
• Biblioteca completa (150+ artigos)
• Grupos ilimitados
• Mentoria mensal 30min com curadores
• Download de PDFs + áudios
• Reflexão diária personalizada

Pagamento processado por Stripe (PCI-DSS Level 1). NÃO armazenamos dados de cartão.

Cancelamento:
• A qualquer momento via /conta/assinatura
• Sem fidelidade, sem multa
• Reembolso proporcional em até 7 dias após cobrança

Reajuste de preço:
• Avisado com 30 dias de antecedência
• Sem reajuste retroativo
• Você pode cancelar antes do novo preço entrar em vigor`,
  },
  {
    icon: Shield,
    title: '8. Propriedade Intelectual',
    articles: 'Lei 9.610/98',
    content: `Todo conteúdo da plataforma é protegido:

👑 NOSSO (Akasha Portal):
• Código-fonte da plataforma
• Design system + identidade visual
• Algoritmo da Akasha IA + prompts
• Artigos curados por nossa equipe (Creative Commons BY-NC-SA 4.0)
• Marca "Akasha Portal" + logos

👤 SEU (você):
• Posts, comentários, conteúdo que você cria
• Conversas com Akasha IA são SUAS (exportáveis a qualquer momento)

🔄 CONTEÚDO DE TERCEIROS:
• Tradições ancestrais: pertencem ao patrimônio cultural imaterial (não reivindicamos propriedade)
• Papers científicos: citamos com referência completa, link para o original
• Conteúdo de outros membros: pertence ao autor, licenciado à plataforma com permissão de exibição

Você nos concede licença mundial não-exclusiva para exibir, distribuir e processar (incluindo indexação para Akasha IA) o conteúdo que você publica na plataforma. Esta licença termina quando você deleta o conteúdo.`,
  },
  {
    icon: Trash2,
    title: '9. Suspensão e Encerramento',
    articles: 'CDC art. 44-46',
    content: `Akasha Portal pode suspender ou encerrar contas que:

• Violam estes Termos de Uso
• Violam o Community Guidelines
• São usadas para fins ilegais
• Apresentam risco à segurança da comunidade

Processo:
1. Aviso por email (exceto violações graves como ameaça à vida)
2. 7 dias para recurso (exceto violações graves)
3. Decisão final em 15 dias úteis
4. Dados deletados conforme LGPD art. 16

Você pode encerrar sua conta a qualquer momento:
• Via /conta/configuracoes → Excluir conta
• Dados deletados em 30 dias (período de retenção técnica)
• Backup removido em 90 dias
• Logs anônimos retidos por 5 anos (LGPD art. 37 — obrigações legais)`,
  },
  {
    icon: FileText,
    title: '10. Disposições Finais',
    articles: 'CDC + CF88 art. 5°',
    content: `Foro: Comarca de São Paulo/SP, Brasil.

Lei aplicável: Lei brasileira, incluindo:
• CDC (Lei 8.078/90)
• LGPD (Lei 13.709/2018)
• Marco Civil da Internet (Lei 12.965/14)
• Constituição Federal art. 5° (liberdade religiosa + privacidade)

Estes Termos podem ser atualizados:
• Mudanças materiais: avisadas com 30 dias de antecedência
• Mudanças editoriais: atualizadas sem aviso prévio
• Versão atual: ${VERSION} (atualizado em ${LAST_UPDATED})
• Histórico de versões: /legal/terms-changelog

Em caso de conflito entre Termos e Política de Privacidade, prevalece a Política para matérias de dados pessoais.

Dúvidas: legal@cabaladoscaminhos.com
DPO: dpo@cabaladoscaminhos.com`,
  },
];

export const metadata = {
  title: 'Termos de Uso — Akasha Portal v3.0',
  description:
    'Termos de Uso atualizados (julho 2026) para Akasha Portal v3.0 — comunidade de espiritualidade universalista com IA curadora.',
  alternates: { canonical: '/legal/terms-of-service' },
};

export default function TermsOfServicePage() {
  return (
    <CosmicBackground>
      <main id="main-content" className="min-h-screen pb-20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6 font-raleway text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar ao início
          </Link>

          <div className="text-center mb-8">
            <Heading variant="h1" className="text-white mb-3">
              Termos de Uso
            </Heading>
            <p className="text-slate-400 font-raleway">
              Versão {VERSION} · Atualizado em {LAST_UPDATED}
            </p>
          </div>

          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20">
            <p className="text-lg text-amber-300 font-cormorant leading-relaxed text-center">
              &ldquo;Estes Termos existem para proteger praticantes de todas as tradições —
              Cabala, Ifá, Tantra, Umbanda, Xamanismo, Ayurveda, Meditação — e para garantir
              que o espaço permaneça seguro, respeitoso e LGPD-compliant.&rdquo;
            </p>
          </div>

          <div className="space-y-6">
            {sections.map((section, index) => (
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
              <Link href="/privacy" className="text-amber-400 underline ml-2">
                Política de Privacidade
              </Link>
            </p>
          </div>
        </footer>
      </main>
    </CosmicBackground>
  );
}