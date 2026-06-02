/**
 * Notification Templates System
 * Centralized notification templates for the Cabala dos Caminhos platform
 */

import type { TemplateCategory } from '@/lib/notifications/templates';

// ============================================================================
// TYPES
// ============================================================================

export interface NotificationTemplate {
  id: string;
  category: TemplateCategory;
  name: string;
  content: string;
  variables: string[];
  priority: 'high' | 'medium' | 'low';
  active: boolean;
}

export type { TemplateCategory };

// ============================================================================
// TEMPLATE DATA
// ============================================================================

const TEMPLATES: NotificationTemplate[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // CONSULTATION TEMPLATES (6)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'consult-reservation-confirmed',
    category: 'consultation',
    name: 'Reserva de Consulta Confirmada',
    content: 'Olá {{nome}}, sua consulta foi confirmada para {{data}} às {{hora}}. Profissão: {{profissao}}. Prepare suas perguntas sobre {{tema_consulta}}.',
    variables: ['nome', 'data', 'hora', 'profissao', 'tema_consulta'],
    priority: 'high',
    active: true,
  },
  {
    id: 'consult-reminder-24h',
    category: 'consultation',
    name: 'Lembrete de Consulta (24h)',
    content: 'Lembrete: Sua consulta com {{profissional}} acontece amanhã, {{data}} às {{hora}}. Não se esqueça de preparar seu mapa astral!',
    variables: ['profissional', 'data', 'hora'],
    priority: 'high',
    active: true,
  },
  {
    id: 'consult-reminder-1h',
    category: 'consultation',
    name: 'Lembrete de Consulta (1h)',
    content: 'Atenção {{nome}}! Sua consulta começa em 1 hora. Acesse sua sala virtual pelo link: {{link_sala}}',
    variables: ['nome', 'link_sala'],
    priority: 'high',
    active: true,
  },
  {
    id: 'consult-completed',
    category: 'consultation',
    name: 'Consulta Finalizada',
    content: '{{nome}}, sua consulta foi finalizada. O relatório estará disponível em até 48 horas na aba "Minhas Leituras". Profissão: {{profissao}}.',
    variables: ['nome', 'profissao'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'consult-report-ready',
    category: 'consultation',
    name: 'Relatório de Consulta Disponível',
    content: 'Seu relatório de {{tipo_relatorio}} está pronto, {{nome}}! Acesse: {{link_relatorio}}. Este documento estará disponível por 30 dias.',
    variables: ['tipo_relatorio', 'nome', 'link_relatorio'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'consult-cancelled',
    category: 'consultation',
    name: 'Consulta Cancelada',
    content: 'Sua consulta de {{data}} foi cancelada. Para remarcar, acesse: {{link_remarcar}}. Reembolso processado em até 5 dias úteis.',
    variables: ['data', 'link_remarcar'],
    priority: 'high',
    active: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RITUAL TEMPLATES (6)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'ritual-daily-reminder',
    category: 'ritual',
    name: 'Lembrete de Ritual Diário',
    content: 'Bom dia, {{nome}}! O Orixá regente de hoje é {{orixa}}. Ritual sugerido: {{ritual}}. Duração: {{duracao}}. abençoe-se!',
    variables: ['nome', 'orixa', 'ritual', 'duracao'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'ritual-ebo-reminder',
    category: 'ritual',
    name: 'Lembrete de Ebó',
    content: 'É hora do Ebó de {{tipo_ebo}}, {{nome}}! Ingredientes necessários: {{ingredientes}}. Orientações: {{orientacoes}}.',
    variables: ['tipo_ebo', 'nome', 'ingredientes', 'orientacoes'],
    priority: 'high',
    active: true,
  },
  {
    id: 'ritual- ancestor-connection',
    category: 'ritual',
    name: 'Conexão Ancestral',
    content: 'Dia de honoring seus ancestrais, {{nome}}. O Orixá {{orixa}} rege este momento. Ritual: {{ritual}}. A energia está favorável.',
    variables: ['nome', 'orixa', 'ritual'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'ritual-new-moon',
    category: 'ritual',
    name: 'Ritual de Lua Nova',
    content: 'Lua Nova em {{signo}}! Momento de intenciones e novos começos. Ritual indicado: {{ritual}}. Orixá favorável: {{orixa}}.',
    variables: ['signo', 'ritual', 'orixa'],
    priority: 'high',
    active: true,
  },
  {
    id: 'ritual-full-moon',
    category: 'ritual',
    name: 'Ritual de Lua Cheia',
    content: 'Lua Cheia em {{signo}}! Energia intensificada para ritual de {{intencao}}. Orixá {{orixa}} está em destaque. Aproveite a energia!',
    variables: ['signo', 'intencao', 'orixa'],
    priority: 'high',
    active: true,
  },
  {
    id: 'ritual-openu-need',
    category: 'ritual',
    name: 'Necessidade de Ritual Urgente',
    content: 'ATENÇÃO {{nome}}! O Orixá {{orixa}} indica necessidade de ritual urgente: {{ritual}}. Procure orientação de seu sacerdócio.',
    variables: ['nome', 'orixa', 'ritual'],
    priority: 'high',
    active: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PAYMENT TEMPLATES (6)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'payment-success',
    category: 'payment',
    name: 'Pagamento Confirmado',
    content: 'Pagamento de R$ {{valor}} confirmado, {{nome}}! Referência: {{referencia}}. Sua consultoria está agendada.',
    variables: ['valor', 'nome', 'referencia'],
    priority: 'high',
    active: true,
  },
  {
    id: 'payment-failed',
    category: 'payment',
    name: 'Pagamento Recusado',
    content: 'Pagamento de R$ {{valor}} foi recusado, {{nome}}. Motivo: {{motivo}}. Tente novamente: {{link_pagamento}}.',
    variables: ['valor', 'nome', 'motivo', 'link_pagamento'],
    priority: 'high',
    active: true,
  },
  {
    id: 'payment-refund',
    category: 'payment',
    name: 'Reembolso Processado',
    content: 'Reembolso de R$ {{valor}} foi processado, {{nome}}. Prazo de crédito: {{prazo}}. Referência: {{referencia}}.',
    variables: ['valor', 'nome', 'prazo', 'referencia'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'payment-subscription-renewed',
    category: 'payment',
    name: 'Assinatura Renovada',
    content: 'Assinatura {{plano}} renovada com sucesso! Próxima cobrança: {{data_proxima}}. Valor: R$ {{valor}}.',
    variables: ['plano', 'data_proxima', 'valor'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'payment-subscription-cancelled',
    category: 'payment',
    name: 'Assinatura Cancelada',
    content: 'Sua assinatura {{plano}} foi cancelada, {{nome}}. Acesso até: {{data_acesso}}. Sentiremos sua falta!',
    variables: ['plano', 'nome', 'data_acesso'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'payment-credits-low',
    category: 'payment',
    name: 'Créditos Baixos',
    content: 'Você possui apenas {{quantidade}} créditos restantes, {{nome}}. Recarregue para continuar consultando: {{link_recarga}}.',
    variables: ['quantidade', 'nome', 'link_recarga'],
    priority: 'high',
    active: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MARKETING TEMPLATES (6)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'marketing-welcome',
    category: 'marketing',
    name: 'Boas-vindas',
    content: 'Bem-vindo(a) à Cabala dos Caminhos, {{nome}}! Seu mapa indica perfil em {{perfil_tropical}}. Explore nossos recursos e descubra seus Orixás.',
    variables: ['nome', 'perfil_tropical'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'marketing-promo-new-year',
    category: 'marketing',
    name: 'Promoção Ano Novo',
    content: 'Feliz Ano Novo, {{nome}}! Aproveite 30% OFF em consultas até {{data_validade}}. Código: {{codigo}}. abençoe-se!',
    variables: ['nome', 'data_validade', 'codigo'],
    priority: 'high',
    active: true,
  },
  {
    id: 'marketing-new-feature',
    category: 'marketing',
    name: 'Novo Recurso Disponível',
    content: '{{nome}}, lançamos {{nome_recurso}}! Descubra como pode ajudar em sua jornada espiritual: {{link_recurso}}.',
    variables: ['nome', 'nome_recurso', 'link_recurso'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'marketing-webinar',
    category: 'marketing',
    name: 'Convite para Webinar',
    content: 'Participe do webinar "{{titulo}}" com {{palestrante}}, {{data}} às {{hora}}. Tema: {{tema}}. Inscreva-se: {{link_inscricao}}.',
    variables: ['titulo', 'palestrante', 'data', 'hora', 'tema', 'link_inscricao'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'marketing-referral',
    category: 'marketing',
    name: 'Programa de Indicação',
    content: '{{nome}}, indique amigos e ganhe R$ {{credito}} em cada novo membro que se inscrever! Seu link: {{link_referral}}.',
    variables: ['nome', 'credito', 'link_referral'],
    priority: 'low',
    active: true,
  },
  {
    id: 'marketing-seasonal-ritual',
    category: 'marketing',
    name: 'Ritual Sazonal Especial',
    content: 'Período de {{estacao}}! Orixá {{orixa}} está em destaque. Ritual especial: {{ritual}}. A energia está favorável para {{intencao}}.',
    variables: ['estacao', 'orixa', 'ritual', 'intencao'],
    priority: 'medium',
    active: true,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SYSTEM TEMPLATES (6)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'system-password-reset',
    category: 'system',
    name: 'Redefinição de Senha',
    content: 'Você solicitou redefinição de senha, {{nome}}. Clique no link: {{link_reset}}. Este link expira em {{tempo_expiracao}}.',
    variables: ['nome', 'link_reset', 'tempo_expiracao'],
    priority: 'high',
    active: true,
  },
  {
    id: 'system-email-verification',
    category: 'system',
    name: 'Verificação de Email',
    content: 'Bem-vindo(a), {{nome}}! Confirme seu email: {{link_verificacao}}. Código: {{codigo}}.',
    variables: ['nome', 'link_verificacao', 'codigo'],
    priority: 'high',
    active: true,
  },
  {
    id: 'system-maintenance',
    category: 'system',
    name: 'Manutenção Programada',
    content: 'Manutenção programada em {{data}} das {{hora_inicio}} às {{hora_fim}}. Alguns serviços podem estar temporariamente indisponíveis.',
    variables: ['data', 'hora_inicio', 'hora_fim'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'system-data-export',
    category: 'system',
    name: 'Exportação de Dados Pronta',
    content: 'Seus dados estão prontos para download, {{nome}}! Acesse: {{link_download}}. O arquivo estará disponível por {{tempo_disponivel}}.',
    variables: ['nome', 'link_download', 'tempo_disponivel'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'system-account-updated',
    category: 'system',
    name: 'Conta Atualizada',
    content: 'Sua conta foi atualizada, {{nome}}. Campo alterado: {{campo}}. Se você não solicitou esta alteração, entre em contato: {{link_suporte}}.',
    variables: ['nome', 'campo', 'link_suporte'],
    priority: 'medium',
    active: true,
  },
  {
    id: 'system-session-expired',
    category: 'system',
    name: 'Sessão Expirada',
    content: 'Sua sessão expirou, {{nome}}! Faça login novamente: {{link_login}}.',
    variables: ['nome', 'link_login'],
    priority: 'low',
    active: true,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Returns all active notification templates
 */
export function getTemplates(): NotificationTemplate[] {
  return TEMPLATES.filter((t) => t.active);
}

/**
 * Returns a template by its ID
 */
export function getTemplateById(id: string): NotificationTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/**
 * Returns all active templates filtered by category
 */
export function getTemplatesByCategory(category: TemplateCategory): NotificationTemplate[] {
  return TEMPLATES.filter((t) => t.category === category && t.active);
}

/**
 * Returns all high-priority active templates
 */
export function getHighPriorityTemplates(): NotificationTemplate[] {
  return TEMPLATES.filter((t) => t.priority === 'high' && t.active);
}

/**
 * Formats a template string by replacing variables with provided values
 * @param templateId - The template ID to format
 * @param variables - Key-value pairs for variable substitution
 * @returns Formatted string with variables replaced
 */
export function formatTemplate(
  templateId: string,
  variables: Record<string, string>
): string | null {
  const template = getTemplateById(templateId);
  if (!template) return null;

  let content = template.content;
  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return content;
}

// Default export for convenience
export default getTemplates;