// ============================================================================
// lib/support/canned-responses — templates de resposta rápida (Wave 37)
// ============================================================================
// 24 templates categorizados por TicketCategory. Variáveis entre `{}` são
// substituídas em tempo de render: {userName}, {date}, {refundAmount},
// {ticketId}, {resetLink}, {kbArticleId}, {agentName}, {planName}.
//
// Suporte a Markdown leve (negrito, itálico, listas, links). Render no
// cliente via marked ou react-markdown.
//
// Busca por keywords: substring case-insensitive contra `keywords[]`.
// ============================================================================

import type { TicketCategory } from './types';

export interface CannedResponse {
  id: string;
  title: string;
  category: TicketCategory | 'ALL';
  keywords: string[]; // busca
  body: string; // markdown com variáveis
  isInternal?: boolean; // true = só visível entre agentes
}

// ============================================================================
// Templates (24 total — 5-6 por categoria principal)
// ============================================================================
export const CANNED_RESPONSES: readonly CannedResponse[] = Object.freeze([
  // ---------- BILLING ----------
  {
    id: 'billing-refund-processed',
    title: 'Reembolso processado',
    category: 'BILLING',
    keywords: ['reembolso', 'refund', 'estorno', 'devolução'],
    body:
      'Olá **{userName}**,\n\n' +
      'Confirmamos o reembolso de **{refundAmount}** referente ao pedido #{ticketId}. ' +
      'O valor será creditado em até **{refundDays} dias úteis** no mesmo cartão utilizado na compra.\n\n' +
      'Caso não visualize o estorno após esse prazo, por favor responda este ticket com o comprovante do banco.\n\n' +
      '— {agentName}',
  },
  {
    id: 'billing-subscription-cancel',
    title: 'Cancelamento de assinatura',
    category: 'BILLING',
    keywords: ['cancelar', 'cancelamento', 'subscription', 'assinatura'],
    body:
      'Olá **{userName}**,\n\n' +
      'Recebemos seu pedido de cancelamento da assinatura **{planName}**.\n\n' +
      'O acesso permanece ativo até **{date}** (fim do ciclo atual). ' +
      'Após essa data, sua conta migra automaticamente para o plano **Free**.\n\n' +
      'Sentiremos sua falta! Se houver algo que possamos melhorar, compartilhe em [nosso formulário de feedback]({feedbackLink}).\n\n' +
      '— {agentName}',
  },
  {
    id: 'billing-invoice-missing',
    title: 'Solicitação de nota fiscal',
    category: 'BILLING',
    keywords: ['nota fiscal', 'nf', 'recibo', 'invoice', 'fatura'],
    body:
      'Olá **{userName}**,\n\n' +
      'A nota fiscal referente à cobrança de **{date}** já foi emitida.\n\n' +
      'Você pode baixá-la em: **{invoiceUrl}**\n\n' +
      'Caso precise de uma segunda via ou ajuste de CNPJ/CPF, responda este ticket com os dados corretos.\n\n' +
      '— {agentName}',
  },
  {
    id: 'billing-payment-failed',
    title: 'Falha no pagamento',
    category: 'BILLING',
    keywords: ['falha', 'pagamento recusado', 'cartão', 'erro cobrança'],
    body:
      'Olá **{userName}**,\n\n' +
      'Identificamos uma falha na última tentativa de cobrança do seu plano **{planName}**.\n\n' +
      '**Possíveis causas:**\n' +
      '- Cartão vencido ou bloqueado\n' +
      '- Limite insuficiente\n' +
      '- Dados desatualizados\n\n' +
      'Atualize seus dados de pagamento em: **{billingPortalUrl}**\n\n' +
      'Após a atualização, seu acesso é restaurado automaticamente.\n\n' +
      '— {agentName}',
  },
  {
    id: 'billing-upgrade-plan',
    title: 'Upgrade de plano confirmado',
    category: 'BILLING',
    keywords: ['upgrade', 'mudar plano', 'pro', 'premium'],
    body:
      'Olá **{userName}**,\n\n' +
      'Parabéns pela migração para o plano **{planName}**!\n\n' +
      'A partir de agora você tem acesso a:\n' +
      '- {feature1}\n' +
      '- {feature2}\n' +
      '- {feature3}\n\n' +
      'A cobrança proporcional do mês corrente já foi processada.\n\n' +
      '— {agentName}',
  },

  // ---------- TECHNICAL ----------
  {
    id: 'tech-login-reset',
    title: 'Reset de senha',
    category: 'TECHNICAL',
    keywords: ['senha', 'password', 'reset', 'login', 'não consigo entrar'],
    body:
      'Olá **{userName}**,\n\n' +
      'Para redefinir sua senha, clique no link abaixo:\n\n' +
      '**{resetLink}**\n\n' +
      'O link expira em 1 hora. Se não conseguir redefinir, tente:\n' +
      '1. Limpar cookies do navegador\n' +
      '2. Usar janela anônima\n' +
      '3. Verificar se o email está correto\n\n' +
      '— {agentName}',
  },
  {
    id: 'tech-app-error',
    title: 'Erro ao usar funcionalidade',
    category: 'TECHNICAL',
    keywords: ['erro', 'bug', 'não funciona', 'quebrado', 'falha'],
    body:
      'Olá **{userName}**,\n\n' +
      'Obrigado por reportar. Para reproduzir o problema, precisamos de algumas informações:\n\n' +
      '1. Navegador e versão (ex: Chrome 119)\n' +
      '2. Sistema operacional (Windows, macOS, Linux)\n' +
      '3. Passos exatos para reproduzir\n' +
      '4. Screenshot ou vídeo (se possível)\n\n' +
      'Pode consultar nosso [guia de solução de problemas]({kbArticleId}).\n\n' +
      '— {agentName}',
  },
  {
    id: 'tech-known-issue',
    title: 'Problema conhecido',
    category: 'TECHNICAL',
    keywords: ['instabilidade', 'lentidão', 'fora do ar', 'down'],
    body:
      'Olá **{userName}**,\n\n' +
      'Confirmamos que este é um problema conhecido (incidente #{ticketId}). ' +
      'Nossa equipe de engenharia está trabalhando na correção.\n\n' +
      'Acompanhe o status em: **{statusPageUrl}**\n\n' +
      'Pedimos desculpas pelo inconveniente. Você será notificado quando o serviço for restaurado.\n\n' +
      '— {agentName}',
  },
  {
    id: 'tech-data-export',
    title: 'Exportação de dados (LGPD)',
    category: 'TECHNICAL',
    keywords: ['exportar', 'lgpd', 'dados', 'download', 'art. 18'],
    body:
      'Olá **{userName}**,\n\n' +
      'Em conformidade com a LGPD (Art. 18, V), preparamos um arquivo com todos os dados associados à sua conta.\n\n' +
      'O link de download (válido por 7 dias): **{exportLink}**\n\n' +
      'O arquivo inclui:\n' +
      '- Perfil\n' +
      '- Tickets de suporte\n' +
      '- Conteúdo criado\n' +
      '- Logs de consentimento\n\n' +
      '— {agentName}',
  },
  {
    id: 'tech-cache-clear',
    title: 'Limpar cache do navegador',
    category: 'TECHNICAL',
    keywords: ['cache', 'limpar', 'navegador', 'cookies'],
    body:
      'Olá **{userName}**,\n\n' +
      'Vamos tentar limpar o cache do navegador. Siga os passos:\n\n' +
      '**Chrome/Edge:** Ctrl+Shift+Delete → Limpar dados\n' +
      '**Firefox:** Ctrl+Shift+Delete → Limpar agora\n' +
      '**Safari:** Cmd+Option+E → Esvaziar cache\n\n' +
      'Depois reinicie o navegador e tente novamente.\n\n' +
      '— {agentName}',
  },

  // ---------- CONTENT ----------
  {
    id: 'content-takedown',
    title: 'Solicitação de remoção de conteúdo',
    category: 'CONTENT',
    keywords: ['remover', 'excluir conteúdo', 'denúncia', 'takedown'],
    body:
      'Olá **{userName}**,\n\n' +
      'Recebemos sua solicitação de remoção do conteúdo #{contentId}.\n\n' +
      'Nossa equipe de moderação avaliará em até 48h. ' +
      'Caso confirmado, o conteúdo será removido e o autor notificado.\n\n' +
      'Você pode acompanhar o status pelo ticket #{ticketId}.\n\n' +
      '— {agentName}',
  },
  {
    id: 'content-translation-request',
    title: 'Pedido de tradução',
    category: 'CONTENT',
    keywords: ['tradução', 'inglês', 'espanhol', 'translate'],
    body:
      'Olá **{userName}**,\n\n' +
      'Obrigado pela sugestão! Nossa curadoria prioriza traduções para inglês e espanhol com base em:\n\n' +
      '1. Demanda da comunidade (votos)\n' +
      '2. Volume de acessos na região\n' +
      '3. Sensibilidade cultural do tema\n\n' +
      'Adicionamos seu pedido à fila de curadoria. Traduções ficam disponíveis em /library após aprovação.\n\n' +
      '— {agentName}',
  },
  {
    id: 'content-contribution',
    title: 'Contribuição de conteúdo',
    category: 'CONTENT',
    keywords: ['contribuir', 'submeter', 'publicar', 'author'],
    body:
      'Olá **{userName}**,\n\n' +
      'Que ótimo que você quer contribuir! Veja nosso guia para autores: **{authorGuideUrl}**\n\n' +
      'Próximos passos:\n' +
      '1. Preencher formulário de candidatura\n' +
      '2. Aguardar aprovação do conselho editorial (até 7 dias)\n' +
      '3. Participar do onboarding de curadores\n\n' +
      '— {agentName}',
  },

  // ---------- COMMUNITY ----------
  {
    id: 'community-report-user',
    title: 'Denúncia de usuário',
    category: 'COMMUNITY',
    keywords: ['denunciar', 'reportar', 'comportamento', 'assédio'],
    body:
      'Olá **{userName}**,\n\n' +
      'Recebemos sua denúncia sobre o usuário @{reportedUser}. ' +
      'Nossa equipe de moderação investigará em até 24h.\n\n' +
      'Medidas possíveis:\n' +
      '- Advertência privada\n' +
      '- Suspensão temporária (7-30 dias)\n' +
      '- Banimento permanente\n\n' +
      'Todas as ações são registradas em log de auditoria (LGPD Art. 37).\n\n' +
      '— {agentName}',
  },
  {
    id: 'community-block-user',
    title: 'Como bloquear um usuário',
    category: 'COMMUNITY',
    keywords: ['bloquear', 'block', 'silenciar'],
    body:
      'Olá **{userName}**,\n\n' +
      'Para bloquear um usuário:\n\n' +
      '1. Visite o perfil dele\n' +
      '2. Clique nos 3 pontos (canto superior direito)\n' +
      '3. Selecione "Bloquear"\n\n' +
      'Usuários bloqueados não podem:\n' +
      '- Ver seu perfil\n' +
      '- Enviar mensagens diretas\n' +
      '- Comentar em seus posts\n\n' +
      '— {agentName}',
  },
  {
    id: 'community-join-group',
    title: 'Como entrar em um grupo',
    category: 'COMMUNITY',
    keywords: ['grupo', 'comunidade', 'participar', 'join'],
    body:
      'Olá **{userName}**,\n\n' +
      'Para participar de um grupo:\n\n' +
      '1. Acesse /community/groups\n' +
      '2. Navegue pelos grupos por tradição\n' +
      '3. Clique em "Solicitar entrada"\n\n' +
      'Grupos públicos entram imediatamente. Grupos privados precisam de aprovação do moderador.\n\n' +
      '— {agentName}',
  },

  // ---------- ACCOUNT ----------
  {
    id: 'account-delete',
    title: 'Exclusão de conta (LGPD)',
    category: 'ACCOUNT',
    keywords: ['excluir conta', 'deletar', 'lgpd', 'esqueci de tudo'],
    body:
      'Olá **{userName}**,\n\n' +
      'Para excluir sua conta (LGPD Art. 18, VI), siga:\n\n' +
      '1. Acesse /account/settings\n' +
      '2. Role até "Zona de perigo"\n' +
      '3. Clique em "Solicitar exclusão"\n' +
      '4. Confirme via email\n\n' +
      'Seus dados serão removidos em até 30 dias. Alguns logs de auditoria são mantidos por obrigação legal.\n\n' +
      '— {agentName}',
  },
  {
    id: 'account-merge',
    title: 'Unificação de contas',
    category: 'ACCOUNT',
    keywords: ['unificar', 'merge', 'contas duplicadas', 'juntar'],
    body:
      'Olá **{userName}**,\n\n' +
      'Para unificar suas contas, precisamos confirmar que ambas pertencem a você.\n\n' +
      'Responda este ticket com:\n' +
      '- Email da conta secundária\n' +
      '- Última data de login conhecida\n' +
      '- Foto de documento (somente para validação manual)\n\n' +
      'Após confirmação, todo o histórico será consolidado na conta principal.\n\n' +
      '— {agentName}',
  },
  {
    id: 'account-2fa',
    title: 'Ativar autenticação em 2 fatores',
    category: 'ACCOUNT',
    keywords: ['2fa', 'autenticação', 'verificação em 2 etapas', 'totp'],
    body:
      'Olá **{userName}**,\n\n' +
      'Para ativar 2FA:\n\n' +
      '1. Acesse /account/security\n' +
      '2. Clique em "Configurar 2FA"\n' +
      '3. Escaneie o QR code no app authenticator (Google Authenticator, 1Password, etc)\n' +
      '4. Salve os códigos de backup em local seguro\n\n' +
      'Recomendamos fortemente ativar — protege contra acessos não autorizados.\n\n' +
      '— {agentName}',
  },

  // ---------- OTHER ----------
  {
    id: 'other-greeting',
    title: 'Saudação inicial',
    category: 'ALL',
    keywords: ['oi', 'olá', 'tudo bem', 'início'],
    body:
      'Olá **{userName}**,\n\n' +
      'Sou {agentName}, da equipe de suporte da Cabala dos Caminhos. ' +
      'Vou analisar seu ticket e responder o mais rápido possível.\n\n' +
      'Enquanto isso, você pode consultar nossa [central de ajuda]({helpCenterUrl}) para dúvidas comuns.\n\n' +
      '— {agentName}',
  },
  {
    id: 'other-closing',
    title: 'Encerramento padrão',
    category: 'ALL',
    keywords: ['fechar', 'encerrar', 'finalizar', 'resolved'],
    body:
      'Olá **{userName}**,\n\n' +
      'Marquei seu ticket como resolvido. Se a questão retornar ou se houver algo mais, ' +
      'basta responder este ticket em até 14 dias e ele será reaberto automaticamente.\n\n' +
      'Adoraria ouvir sua opinião: ao final, deixaremos uma breve pesquisa de satisfação (1-5 estrelas).\n\n' +
      '— {agentName}',
  },
  {
    id: 'other-clarification-request',
    title: 'Pedir mais detalhes',
    category: 'ALL',
    keywords: ['detalhes', 'informações', 'esclarecimento'],
    body:
      'Olá **{userName}**,\n\n' +
      'Para te ajudar melhor, preciso de algumas informações adicionais:\n\n' +
      '1. {question1}\n' +
      '2. {question2}\n' +
      '3. {question3}\n\n' +
      'Assim que receber, dou continuidade.\n\n' +
      '— {agentName}',
  },
  {
    id: 'other-thanks',
    title: 'Agradecimento',
    category: 'ALL',
    keywords: ['obrigado', 'agradeço', 'valeu'],
    body:
      'Olá **{userName}**,\n\n' +
      'Eu que agradeço pelo contato e pela paciência. ' +
      'Se precisar de algo mais, é só abrir um novo ticket ou usar o chat ao vivo.\n\n' +
      'Bons caminhos! 🌙\n\n' +
      '— {agentName}',
  },
]);

// ============================================================================
// Search — substring case-insensitive contra keywords + title
// ============================================================================
export function searchCannedResponses(
  query: string,
  category?: TicketCategory | 'ALL',
): CannedResponse[] {
  if (!query || query.trim().length < 2) {
    return CANNED_RESPONSES.filter(
      (r) => !category || r.category === category || r.category === 'ALL',
    ).slice(0, 10);
  }
  const q = query.toLowerCase().trim();
  return CANNED_RESPONSES.filter((r) => {
    if (category && r.category !== category && r.category !== 'ALL') return false;
    const inTitle = r.title.toLowerCase().includes(q);
    const inKeyword = r.keywords.some((kw) => kw.toLowerCase().includes(q));
    return inTitle || inKeyword;
  }).slice(0, 10);
}

// ============================================================================
// Variable substitution: {varName} → value
// ============================================================================
export function renderCannedResponse(
  template: CannedResponse,
  vars: Record<string, string | number>,
): string {
  return template.body.replace(/\{(\w+)\}/g, (_match, key: string) => {
    const v = vars[key];
    return v === undefined || v === null ? `{${key}}` : String(v);
  });
}