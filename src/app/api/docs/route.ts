// Skip linting and formatting for this file
 
import { NextRequest } from 'next/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
// fallow-ignore-next-line complexity
export async function GET(request: NextRequest) {
  const spec = {
    openapi: '3.0.3',
    info: {
      title: 'Cabala dos Caminhos API',
      description: 'API para aplicativo de astrologia, tarot, numerologia e serviços esotéricos',
      version: '1.0.0',
    },
    servers: [
      {
        url: '/api',
        description: 'Servidor principal',
      },
    ],
    paths: {
      '/afirmacoes': {
        get: {
          operationId: 'getAfirmacoes',
          summary: 'Listar afirmações',
          parameters: [
            {
              name: 'categoria',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['amor', 'prosperidade', 'saude', 'protecao', 'sabedoria'],
              },
            },
          ],
          responses: {
            '200': {
              description: 'Lista de afirmações',
            },
          },
        },
      },
      '/astrologia/mapa-natal': {
        get: {
          operationId: 'getMapaNatal',
          summary: 'Calcular mapa natal',
          parameters: [
            {
              name: 'dataNascimento',
              in: 'query',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'horaNascimento',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'latitude',
              in: 'query',
              schema: { type: 'number' },
            },
            {
              name: 'longitude',
              in: 'query',
              schema: { type: 'number' },
            },
          ],
          responses: {
            '200': { description: 'Mapa natal calculado' },
            '400': { description: 'Parâmetros inválidos' },
          },
        },
      },
      '/astrologia/transitos': {
        get: {
          operationId: 'getTransitos',
          summary: 'Obter trânsitos planetários',
          parameters: [
            {
              name: 'dataNascimento',
              in: 'query',
              required: true,
              schema: { type: 'string' },
            },
            {
              name: 'dataAtual',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Trânsitos planetários' },
            '400': { description: 'Parâmetros inválidos' },
          },
        },
      },
      '/auth/login': {
        post: {
          operationId: 'login',
          summary: 'Autenticar usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Login realizado com sucesso' },
            '401': { description: 'Credenciais inválidas' },
          },
        },
      },
      '/auth/logout': {
        post: {
          operationId: 'logout',
          summary: 'Deslogar usuário',
          responses: {
            '200': { description: 'Logout realizado' },
          },
        },
      },
      '/chat/historico': {
        get: {
          operationId: 'getChatHistorico',
          summary: 'Obter histórico de chat',
          responses: {
            '200': { description: 'Histórico de mensagens' },
          },
        },
        post: {
          operationId: 'createChatHistorico',
          summary: 'Criar entrada no histórico de chat',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: { type: 'string' },
                    tipo: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Histórico criado' },
          },
        },
      },
      '/chat/mensagem': {
        post: {
          operationId: 'sendMensagem',
          summary: 'Enviar mensagem de chat',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mensagem: { type: 'string' },
                    contexto: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Mensagem enviada' },
          },
        },
      },
      '/ciclos': {
        get: {
          operationId: 'getCiclos',
          summary: 'Obter ciclos cósmicos',
          parameters: [
            {
              name: 'tipo',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'data',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Ciclos cósmicos' },
          },
        },
      },
      '/creditos': {
        get: {
          operationId: 'getCreditos',
          summary: 'Obter saldo de créditos',
          responses: {
            '200': { description: 'Saldo de créditos' },
          },
        },
      },
      '/creditos/adicionar': {
        post: {
          operationId: 'adicionarCreditos',
          summary: 'Adicionar créditos',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantidade'],
                  properties: {
                    quantidade: { type: 'integer', minimum: 1 },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Créditos adicionados' },
          },
        },
      },
      '/creditos/debitar': {
        post: {
          operationId: 'debitarCreditos',
          summary: 'Debitar créditos',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['quantidade'],
                  properties: {
                    quantidade: { type: 'integer', minimum: 1 },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Créditos debitados' },
          },
        },
      },
      '/favoritos': {
        get: {
          operationId: 'getFavoritos',
          summary: 'Listar favoritos',
          responses: {
            '200': { description: 'Lista de favoritos' },
          },
        },
        post: {
          operationId: 'createFavorito',
          summary: 'Criar favorito',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['tipo', 'itemId'],
                  properties: {
                    tipo: { type: 'string' },
                    itemId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Favorito criado' },
          },
        },
        delete: {
          operationId: 'deleteFavorito',
          summary: 'Remover favorito',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['id'],
                  properties: {
                    id: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Favorito removido' },
          },
        },
      },
      '/health': {
        get: {
          operationId: 'healthCheck',
          summary: 'Verificar saúde da API',
          responses: {
            '200': { description: 'API healthy' },
          },
        },
      },
      '/historico': {
        get: {
          operationId: 'getHistorico',
          summary: 'Obter histórico geral',
          parameters: [
            {
              name: 'tipo',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Histórico geral' },
          },
        },
        post: {
          operationId: 'createHistorico',
          summary: 'Criar entrada no histórico',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    tipo: { type: 'string' },
                    itemId: { type: 'string' },
                    dados: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Histórico criado' },
          },
        },
      },
      '/ifa/consulta': {
        post: {
          operationId: 'consultaIfa',
          summary: 'Realizar consulta a Ifá',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    pergunta: { type: 'string' },
                    orixa: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Consulta realizada' },
          },
        },
      },
      '/insights/diario': {
        get: {
          operationId: 'getInsightsDiario',
          summary: 'Obter insights diário',
          parameters: [
            {
              name: 'data',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Insights diário' },
          },
        },
      },
      '/meditacao': {
        post: {
          operationId: 'createMeditacao',
          summary: 'Criar sessão de meditação guiada',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    duration: { type: 'number' },
                    theme: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Meditação criada' },
          },
        },
      },
      '/notifications/stream': {
        get: {
          operationId: 'getNotificationsStream',
          summary: 'Stream de notificações em tempo real',
          responses: {
            '200': {
              description: 'Stream de notificações',
              content: {
                'text/event-stream': {
                  schema: { type: 'string' },
                },
              },
            },
          },
        },
      },
      '/notifications/preferences': {
        get: {
          operationId: 'getNotificationPreferences',
          summary: 'Obter preferências de notificação',
          responses: {
            '200': { description: 'Preferências obtidas' },
          },
        },
        put: {
          operationId: 'updateNotificationPreferences',
          summary: 'Atualizar preferências de notificação',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'boolean' },
                    push: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Preferências atualizadas' },
          },
        },
      },
      '/numerologia': {
        get: {
          operationId: 'getNumerologia',
          summary: 'Calcular numerologia',
          parameters: [
            {
              name: 'nome',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'dataNascimento',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Cálculo numerológico' },
          },
        },
        post: {
          operationId: 'createNumerologiaProfile',
          summary: 'Criar perfil numerológico',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nome: { type: 'string' },
                    dataNascimento: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Perfil criado' },
          },
        },
      },
      '/odus': {
        get: {
          operationId: 'getOdus',
          summary: 'Obter Odus de Ifá',
          parameters: [
            {
              name: 'data',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'tipo',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Odus de Ifá' },
          },
        },
      },
      '/oraculo': {
        post: {
          operationId: 'consultaOraculo',
          summary: 'Consultar oráculo',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['pergunta'],
                  properties: {
                    pergunta: { type: 'string' },
                    contexto: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Resposta do oráculo' },
          },
        },
      },
      '/payments/checkout': {
        post: {
          operationId: 'createCheckout',
          summary: 'Criar sessão de checkout',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId', 'planoId'],
                  properties: {
                    userId: { type: 'string' },
                    planoId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Checkout criado' },
          },
        },
      },
      '/payments/portal': {
        post: {
          operationId: 'createBillingPortal',
          summary: 'Criar portal de cobrança',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId'],
                  properties: {
                    userId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Portal criado' },
          },
        },
      },
      '/profile': {
        get: {
          operationId: 'getProfile',
          summary: 'Obter perfil do usuário',
          responses: {
            '200': { description: 'Perfil do usuário' },
          },
        },
        put: {
          operationId: 'updateProfile',
          summary: 'Atualizar perfil do usuário',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nome: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Perfil atualizado' },
          },
        },
      },
      '/rituais': {
        get: {
          operationId: 'getRituais',
          summary: 'Listar rituais',
          parameters: [
            {
              name: 'categoria',
              in: 'query',
              schema: { type: 'string' },
            },
            {
              name: 'intencao',
              in: 'query',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Lista de rituais' },
          },
        },
        post: {
          operationId: 'createRitual',
          summary: 'Criar ritual personalizado',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    nome: { type: 'string' },
                    categoria: { type: 'string' },
                    intencao: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Ritual criado' },
          },
        },
      },
      '/rituais/historico': {
        get: {
          operationId: 'getRituaisHistorico',
          summary: 'Obter histórico de rituais',
          responses: {
            '200': { description: 'Histórico de rituais' },
          },
        },
        post: {
          operationId: 'createRitualHistorico',
          summary: 'Criar entrada no histórico de rituais',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ritualId: { type: 'string' },
                    dataRealizacao: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Histórico criado' },
          },
        },
      },
      '/subscription/cancel': {
        post: {
          operationId: 'cancelSubscription',
          summary: 'Cancelar assinatura',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['userId'],
                  properties: {
                    userId: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Assinatura cancelada' },
          },
        },
      },
      '/subscription/status': {
        get: {
          operationId: 'getSubscriptionStatus',
          summary: 'Obter status da assinatura',
          parameters: [
            {
              name: 'userId',
              in: 'query',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': { description: 'Status da assinatura' },
          },
        },
      },
      '/synastry': {
        post: {
          operationId: 'calculateSynastry',
          summary: 'Calcular sinastria entre dois mapas',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    mapa1: { type: 'object' },
                    mapa2: { type: 'object' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Sinastria calculada' },
          },
        },
      },
      '/tarot/consulta': {
        get: {
          operationId: 'getTarotSpreads',
          summary: 'Listar tipos de spreads de tarot',
          responses: {
            '200': { description: 'Tipos de spreads' },
          },
        },
        post: {
          operationId: 'consultaTarot',
          summary: 'Realizar consulta de tarot',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    spread: { type: 'string' },
                    pergunta: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Consulta de tarot' },
          },
        },
      },
      '/tarot/do-dia': {
        get: {
          operationId: 'getTarotDoDia',
          summary: 'Obter carta do dia',
          responses: {
            '200': { description: 'Carta do dia' },
          },
        },
      },
      '/webhooks/stripe': {
        post: {
          operationId: 'handleStripeWebhook',
          summary: 'Processar webhook do Stripe',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { type: 'object' },
              },
            },
          },
          responses: {
            '200': { description: 'Webhook processado' },
          },
        },
      },
    },
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  };

  return new Response(JSON.stringify(spec), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}