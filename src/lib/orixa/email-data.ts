// @ts-nocheck
// SKIP_LINT

/**
 * Email Data Module
 * Email templates and configurations for the Cabala dos Caminhos system
 */

export interface EmailTemplate {
  id: string;
  tipo: 'boas_vindas' | 'recuperacao_senha' | 'confirmacao_email' | 'notificacao_ritual' | 'notificacao_orixa' | 'previsao_diaria' | 'previsao_mensal' | 'newsletter' | 'suporte' | 'sistema';
  assunto: string;
  corpo: string;
  ativo: boolean;
  variaveis: string[];
  categoria: string;
}

export interface EmailConfig {
  id: string;
  tipo: 'smtp' | 'api' | 'local';
  host?: string;
  porta?: number;
  secure?: boolean;
  usuario?: string;
  senha?: string;
  emailRemetente: string;
  nomeRemetente: string;
  limiteDiario?: number;
  taxaEnvio?: number;
  ativo: boolean;
}

const EMAIL_DATA = {
  config: {
    id: 'email_config_principal',
    tipo: 'api' as const,
    emailRemetente: 'naoresponda@cabaladoscaminhos.com.br',
    nomeRemetente: 'Cabala dos Caminhos',
    limiteDiario: 100,
    taxaEnvio: 10,
    ativo: true,
  },
  templates: [
    {
      id: 'boas_vindas_1',
      tipo: 'boas_vindas' as const,
      assunto: 'Bem-vindo à Cabala dos Caminhos - Sua jornada espiritual começa agora',
      corpo: `
        <h1>Olá, {{nome}}!</h1>
        <p>Bem-vindo(a) à Cabala dos Caminhos, sua jornada espiritual única e personalizada.</p>
        <p>Seu Orixá guia é <strong>{{orixa_principal}}</strong>, que ilumina seu caminho com sabedoria ancestral.</p>
        <p>Seu número de vida é <strong>{{numero_vida}}</strong>, revelando as características da sua jornada soul.</p>
        <h2>Próximos passos:</h2>
        <ul>
          <li>Complete seu mapa astral personalizado</li>
          <li>Descubra seus ciclos de energia</li>
          <li>Acesse rituais e meditações do seu Orixá</li>
        </ul>
        <p>Que a luz dos Orixás ilumine seu caminho!</p>
      `,
      ativo: true,
      variaveis: ['nome', 'orixa_principal', 'numero_vida'],
      categoria: 'onboarding',
    },
    {
      id: 'confirmacao_email_1',
      tipo: 'confirmacao_email' as const,
      assunto: 'Confirme seu email - Cabala dos Caminhos',
      corpo: `
        <h1>Confirme seu email</h1>
        <p>Olá, {{nome}}!</p>
        <p>Para ativar sua conta, clique no botão abaixo:</p>
        <p><a href="{{link_confirmacao}}" style="background:#8B4513;color:#FFF;padding:12px 24px;text-decoration:none;border-radius:4px;">Confirmar Email</a></p>
        <p>Ou copie este link: {{link_confirmacao}}</p>
        <p>Este link expira em 24 horas.</p>
      `,
      ativo: true,
      variaveis: ['nome', 'link_confirmacao'],
      categoria: 'autenticacao',
    },
    {
      id: 'recuperacao_senha_1',
      tipo: 'recuperacao_senha' as const,
      assunto: 'Recuperação de senha - Cabala dos Caminhos',
      corpo: `
        <h1>Recuperação de Senha</h1>
        <p>Olá, {{nome}}!</p>
        <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
        <p><a href="{{link_redefinicao}}" style="background:#8B4513;color:#FFF;padding:12px 24px;text-decoration:none;border-radius:4px;">Redefinir Senha</a></p>
        <p>Ou copie este link: {{link_redefinicao}}</p>
        <p>Este link expira em 1 hora. Se você não solicitou esta recuperação, ignore este email.</p>
      `,
      ativo: true,
      variaveis: ['nome', 'link_redefinicao'],
      categoria: 'autenticacao',
    },
    {
      id: 'notificacao_ritual_1',
      tipo: 'notificacao_ritual' as const,
      assunto: 'Lembrete de Ritual - {{nome_ritual}}',
      corpo: `
        <h1>🌟 Lembrete de Ritual</h1>
        <p>Olá, {{nome}}!</p>
        <p>Hoje é dia de praticar o ritual: <strong>{{nome_ritual}}</strong></p>
        <p>Associado ao Orixá: <strong>{{orixa}}</strong></p>
        <p>Horário recomendado: {{horario}}</p>
        <p>Materials necessários:</p>
        <ul>{{materiais}}</ul>
        <p><a href="{{link_ritual}}" style="background:#8B4513;color:#FFF;padding:12px 24px;text-decoration:none;border-radius:4px;">Acessar Ritual</a></p>
      `,
      ativo: true,
      variaveis: ['nome', 'nome_ritual', 'orixa', 'horario', 'materiais', 'link_ritual'],
      categoria: 'rituais',
    },
    {
      id: 'notificacao_orixa_1',
      tipo: 'notificacao_orixa' as const,
      assunto: 'Energia do seu Orixá - {{dia_semana}}',
      corpo: `
        <h1>🌙 A energia do seu Orixá hoje</h1>
        <p>Olá, {{nome}}!</p>
        <p>Orixá regente: <strong>{{orixa}}</strong></p>
        <p>Energia do dia: <strong>{{energia}}</strong></p>
        <p>{{mensagem}}</p>
        <h2>Afirmação do dia:</h2>
        <blockquote>"{{afirmacao}}"</blockquote>
        <p><a href="{{link_detalhes}}" style="background:#8B4513;color:#FFF;padding:12px 24px;text-decoration:none;border-radius:4px;">Ver mais detalhes</a></p>
      `,
      ativo: true,
      variaveis: ['nome', 'orixa', 'dia_semana', 'energia', 'mensagem', 'afirmacao', 'link_detalhes'],
      categoria: 'orixas',
    },
    {
      id: 'previsao_diaria_1',
      tipo: 'previsao_diaria' as const,
      assunto: 'Sua previsão diária - {{data}}',
      corpo: `
        <h1>🔮 Previsão Diária</h1>
        <p>Olá, {{nome}}!</p>
        <p>Data: <strong>{{data}}</strong></p>
        <h2>Seus Orixás hoje:</h2>
        <p>Principal: <strong>{{orixa_principal}}</strong></p>
        <p>Secundário: <strong>{{orixa_secundario}}</strong></p>
        <h2>Energia do dia:</h2>
        <p>{{energia}}</p>
        <h2>Conselho espiritual:</h2>
        <p>{{conselho}}</p>
        <p><a href="{{link_completo}}" style="background:#8B4513;color:#FFF;padding:12px 24px;text-decoration:none;border-radius:4px;">Ver previsão completa</a></p>
      `,
      ativo: true,
      variaveis: ['nome', 'data', 'orixa_principal', 'orixa_secundario', 'energia', 'conselho', 'link_completo'],
      categoria: 'previsoes',
    },
    {
      id: 'previsao_mensal_1',
      tipo: 'previsao_mensal' as const,
      assunto: 'Previsão Mensal - {{mes_ano}}',
      corpo: `
        <h1>🌟 Previsão Mensal</h1>
        <p>Olá, {{nome}}!</p>
        <p>Seu mapa astral aponta para o mês de <strong>{{mes_ano}}</strong></p>
        <h2>Tema do mês:</h2>
        <p>{{tema_mes}}</p>
        <h2>Ciclos de energia:</h2>
        <ul>{{ciclos}}</ul>
        <h2>Ritual indicado:</h2>
        <p>{{ritual_indicado}}</p>
        <h2>Cuidados:</h2>
        <p>{{cuidados}}</p>
        <p><a href="{{link_mapa}}" style="background:#8B4513;color:#FFF;padding:12px 24px;text-decoration:none;border-radius:4px;">Ver mapa completo</a></p>
      `,
      ativo: true,
      variaveis: ['nome', 'mes_ano', 'tema_mes', 'ciclos', 'ritual_indicado', 'cuidados', 'link_mapa'],
      categoria: 'previsoes',
    },
    {
      id: 'newsletter_1',
      tipo: 'newsletter' as const,
      assunto: '{{titulo}} - Cabala dos Caminhos',
      corpo: `
        <h1>{{titulo}}</h1>
        <p>{{introducao}}</p>
        <div>{{conteudo}}</div>
        <h2>Ritual da semana:</h2>
        <p>{{ritual_semana}}</p>
        <h2>Energia do mês:</h2>
        <p>{{energia_mes}}</p>
        <p style="margin-top:20px;"><a href="{{link_noticias}}" style="background:#8B4513;color:#FFF;padding:12px 24px;text-decoration:none;border-radius:4px;">Leia mais</a></p>
        <hr style="border:1px solid #ddd;margin:20px 0;">
        <p style="color:#666;font-size:12px;">Você está recebendo este email porque se cadastrou na Cabala dos Caminhos.</p>
        <p style="color:#666;font-size:12px;"><a href="{{link_cancelar}}">Cancelar inscrição</a></p>
      `,
      ativo: true,
      variaveis: ['titulo', 'introducao', 'conteudo', 'ritual_semana', 'energia_mes', 'link_noticias', 'link_cancelar'],
      categoria: 'marketing',
    },
    {
      id: 'suporte_1',
      tipo: 'suporte' as const,
      assunto: 'Ticket #{{numero_ticket}} - {{assunto}}',
      corpo: `
        <h1>Recebemos seu chamado</h1>
        <p>Olá, {{nome}}!</p>
        <p>Seu ticket foi registrado com sucesso.</p>
        <p><strong>Número:</strong> #{{numero_ticket}}</p>
        <p><strong>Assunto:</strong> {{assunto}}</p>
        <p><strong>Status:</strong> {{status}}</p>
        <p><strong>Descrição:</strong></p>
        <p>{{descricao}}</p>
        <p>Nosso tempo médio de resposta é de 24 horas. Agradecemos sua paciência.</p>
        <p>Equipe Cabala dos Caminhos</p>
      `,
      ativo: true,
      variaveis: ['nome', 'numero_ticket', 'assunto', 'status', 'descricao'],
      categoria: 'suporte',
    },
    {
      id: 'sistema_1',
      tipo: 'sistema' as const,
      assunto: 'Notificação do sistema - {{titulo}}',
      corpo: `
        <h1>{{titulo}}</h1>
        <p>Olá, {{nome}}!</p>
        <p>{{mensagem}}</p>
        <p>{{detalhes}}</p>
        <p>Atenciosamente,<br>Equipe Cabala dos Caminhos</p>
      `,
      ativo: true,
      variaveis: ['nome', 'titulo', 'mensagem', 'detalhes'],
      categoria: 'sistema',
    },
  ],
};

export function getData() {
  return EMAIL_DATA;
}

function getConfig(): EmailConfig {
  return EMAIL_DATA.config;
}

function getTemplates(): EmailTemplate[] {
  return EMAIL_DATA.templates;
}

function getActiveTemplates(): EmailTemplate[] {
  return EMAIL_DATA.templates.filter(t => t.ativo);
}

function getTemplatesByType(tipo: EmailTemplate['tipo']): EmailTemplate[] {
  return EMAIL_DATA.templates.filter(t => t.tipo === tipo);
}

function getTemplatesByCategory(categoria: string): EmailTemplate[] {
  return EMAIL_DATA.templates.filter(t => t.categoria === categoria);
}

export default getData;