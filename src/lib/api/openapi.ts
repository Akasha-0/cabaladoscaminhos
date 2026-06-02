// fallow-ignore-file unused-file
// OpenAPI 3.0 specification generator for Cabala dos Caminhos API
 

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  paths: Record<string, PathItem>;
  components: {
    schemas: Record<string, Schema>;
    securitySchemes?: Record<string, SecurityScheme>;
  };
}

export interface PathItem {
  get?: Operation;
  post?: Operation;
  put?: Operation;
  delete?: Operation;
  patch?: Operation;
}

export interface Operation {
  summary: string;
  description?: string;
  tags?: string[];
  parameters?: Parameter[];
  requestBody?: RequestBody;
  responses: Record<string, Response>;
  security?: Array<Record<string, string[]>>;
  deprecated?: boolean;
}

export interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required?: boolean;
  description?: string;
  schema: Schema;
}

export interface RequestBody {
  required?: boolean;
  description?: string;
  content: Record<string, MediaType>;
}

export interface MediaType {
  schema?: Schema;
  example?: unknown;
}


export interface Response {
  description: string;
  content?: Record<string, MediaType>;
  schema?: Schema;
}


export interface Schema {
  type?: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
  enum?: (string | number)[];
  description?: string;
  example?: unknown;
  nullable?: boolean;
  $ref?: string;
  format?: string;
  minimum?: number;
  maximum?: number;
}
export interface SecurityScheme {
  type: string;
  scheme?: string;
  in?: string;
  name?: string;
  description?: string;
}
/**
 * Generates OpenAPI 3.0 specification for all API routes
 * @returns OpenAPI 3.0 compliant specification object
 */
// fallow-ignore-next-line complexity
export function generateOpenAPISpec(): OpenAPISpec {
  const spec: OpenAPISpec = {
    openapi: '3.0.0',
    info: {
      title: 'Cabala dos Caminhos API',
      version: '1.0.0',
      description:
        'API RESTful para a plataforma Cabala dos Caminhos. ' +
        'Fornece endpoints para numerologia, astrologia, ciclos temporais, ' +
        'Odús, chat espiritual, insights diários, autenticação, pagamentos e notificações.',
    },
    servers: [
      {
        url: 'https://cabala-dos-caminhos.vercel.app',
        description: 'Servidor de produção',
      },
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
    ],
    paths: {},
    components: {
      schemas: {},
    },
  };

  // ============================================================
  // AUTH PATHS
  // ============================================================

  spec.paths['/api/auth/login'] = {
    post: {
      summary: 'Autenticar usuário',
      description:
        'Autentica um usuário com email e senha. Retorna token JWT e define cookie de autenticação.',
      tags: ['Autenticação'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email', example: 'usuario@exemplo.com' },
                password: { type: 'string', format: 'password', example: 'senha123' },
              },
              required: ['email', 'password'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login realizado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string', example: 'usr_abc123' },
                      email: { type: 'string', example: 'usuario@exemplo.com' },
                      nomeCompleto: { type: 'string', example: 'Maria Silva' },
                    },
                  },
                },
              },
            },
          },
        },
        '400': { description: 'Email ou senha não fornecidos' },
        '401': { description: 'Credenciais inválidas' },
        '500': { description: 'Erro interno do servidor' },
      },
    },
  };

  spec.paths['/api/auth/logout'] = {
    post: {
      summary: 'Sair da conta',
      description: 'Encerra a sessão do usuário limpando o cookie de autenticação.',
      tags: ['Autenticação'],
      responses: {
        '200': {
          description: 'Logout realizado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
      },
    },
  };

  // ============================================================
  // HEALTH PATH
  // ============================================================

  spec.paths['/api/health'] = {
    get: {
      summary: 'Verificar saúde do sistema',
      description:
        'Verifica a saúde do banco de dados e serviços externos (OpenAI, Supabase). ' +
        'Retorna status consolidado e latência individual de cada serviço.',
      tags: ['Sistema'],
      responses: {
        '200': {
          description: 'Sistema operacional',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['ok', 'degraded', 'error'],
                    example: 'ok',
                  },
                  checks: {
                    type: 'object',
                    properties: {
                      database: {
                        type: 'object',
                        properties: {
                          status: { type: 'string' },
                          latencyMs: { type: 'number' },
                        },
                      },
                      externalServices: {
                        type: 'object',
                        properties: {
                          status: { type: 'string' },
                          openai: { type: 'object' },
                          supabase: { type: 'object' },
                        },
                      },
                    },
                  },
                  uptime: { type: 'integer', description: 'Tempo em segundos desde o início' },
                },
              },
            },
          },
        },
        '503': { description: 'Sistema com erros críticos' },
      },
    },
  };

  // ============================================================
  // NUMEROLOGIA PATH
  // ============================================================

  spec.paths['/api/numerologia'] = {
    get: {
      summary: 'Calcular numerologia',
      description:
        'Calcula números numerológicos usando diferentes sistemas: ' +
        'Pitagórica, Caldeia, Cabalística, Tântrica, Pitagórica por Data e Destino.',
      tags: ['Numerologia'],
      parameters: [
        {
          name: 'tipo',
          in: 'query',
          required: false,
          description: 'Tipo de cálculo: pitagorica, caldeia, cabalistica, tantrica, pitagorica-data, destino',
          schema: {
            type: 'string',
            enum: ['pitagorica', 'caldeia', 'cabalistica', 'tantrica', 'pitagorica-data', 'destino'],
          },
        },
        {
          name: 'nome',
          in: 'query',
          required: false,
          description: 'Nome completo para cálculo numerológico',
          schema: { type: 'string', example: 'João Carlos Silva' },
        },
        {
          name: 'data',
          in: 'query',
          required: false,
          description: 'Data no formato YYYY-MM-DD',
          schema: { type: 'string', format: 'date', example: '1990-05-15' },
        },
      ],
      responses: {
        '200': {
          description: 'Resultado do cálculo numerológico',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tipo: { type: 'string' },
                  numero: { type: 'integer', description: 'Número calculado (1-9 ou 11, 22, 33)' },
                  interpretacao: { type: 'string' },
                  detalhes: { type: 'object' },
                },
              },
            },
          },
        },
        '400': { description: 'Parâmetros inválidos' },
        '500': { description: 'Erro no cálculo' },
      },
    },
    post: {
      summary: 'Calcular numerologia com perfil salvo',
      description: 'Calcula múltiplos tipos numerológicos para um perfil salvo do usuário autenticado.',
      tags: ['Numerologia'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                tipo: {
                  type: 'string',
                  enum: ['pitagorica', 'caldeia', 'cabalistica', 'tantrica', 'todos'],
                  example: 'pitagorica',
                },
              },
              required: ['tipo'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Resultados dos cálculos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  perfil: { type: 'object' },
                  resultados: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
        '401': { description: 'Usuário não autenticado' },
        '500': { description: 'Erro interno' },
      },
    },
  };

  // ============================================================
  // CICLOS PATH
  // ============================================================

  spec.paths['/api/ciclos'] = {
    get: {
      summary: 'Calcular ciclos temporais',
      description:
        'Calcula ciclos pessoais baseados na data de nascimento: ' +
        'Ano Pessoal, Mês Pessoal, Dia Pessoal ou todos juntos.',
      tags: ['Numerologia'],
      parameters: [
        {
          name: 'tipo',
          in: 'query',
          required: false,
          description: 'Tipo de ciclo: ano, mes, dia, todos',
          schema: { type: 'string', enum: ['ano', 'mes', 'dia', 'todos'] },
        },
        {
          name: 'data',
          in: 'query',
          required: true,
          description: 'Data de nascimento no formato YYYY-MM-DD',
          schema: { type: 'string', format: 'date', example: '1990-05-15' },
        },
      ],
      responses: {
        '200': {
          description: 'Resultado do cálculo de ciclos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tipo: { type: 'string' },
                  ciclos: { type: 'object' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '400': { description: 'Parâmetros inválidos' },
        '500': { description: 'Erro no cálculo' },
      },
    },
  };

  // ============================================================
  // ODUS PATH
  // ============================================================

  spec.paths['/api/odus'] = {
    get: {
      summary: 'Calcular Odús',
      description:
        'Calcula os Odús de nascimento baseados na data. ' +
        'Retorna o Odú principal, secundário, ou todos os Odús.',
      tags: ['Ifá'],
      parameters: [
        {
          name: 'data',
          in: 'query',
          required: true,
          description: 'Data de nascimento no formato YYYY-MM-DD',
          schema: { type: 'string', format: 'date', example: '1990-05-15' },
        },
        {
          name: 'tipo',
          in: 'query',
          required: false,
          description: 'Tipo de retorno: cálculo individual ou todos',
          schema: { type: 'string', enum: ['todos'] },
        },
      ],
      responses: {
        '200': {
          description: 'Resultado do cálculo de Odú',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  principal: { type: 'object', description: 'Odú principal' },
                  secundario: { type: 'object', description: 'Odú secundário' },
                  odus: { type: 'array', description: 'Lista de todos os Odús (quando tipo=todos)' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '400': { description: 'Parâmetro data obrigatório' },
        '500': { description: 'Erro no cálculo' },
      },
    },
  };

  // ============================================================
  // ASTROLOGIA PATHS
  // ============================================================

  spec.paths['/api/astrologia/mapa-natal'] = {
    get: {
      summary: 'Calcular mapa natal',
      description:
        'Calcula o mapa astral de nascimento com posições planetárias, ' +
        'aspectos e ascendente baseado na data, hora e local de nascimento.',
      tags: ['Astrologia'],
      parameters: [
        {
          name: 'dataNascimento',
          in: 'query',
          required: true,
          description: 'Data de nascimento no formato YYYY-MM-DD',
          schema: { type: 'string', format: 'date', example: '1990-05-15' },
        },
        {
          name: 'horaNascimento',
          in: 'query',
          required: false,
          description: 'Hora de nascimento no formato HH:MM',
          schema: { type: 'string', example: '14:30' },
        },
        {
          name: 'latitude',
          in: 'query',
          required: true,
          description: 'Latitude do local de nascimento',
          schema: { type: 'number', format: 'float', example: -23.5505 },
        },
        {
          name: 'longitude',
          in: 'query',
          required: true,
          description: 'Longitude do local de nascimento',
          schema: { type: 'number', format: 'float', example: -46.6333 },
        },
      ],
      responses: {
        '200': {
          description: 'Mapa natal calculado com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  mapaNatal: {
                    type: 'object',
                    properties: {
                      planeta: { type: 'object' },
                      casas: { type: 'array', items: { type: 'object' } },
                      ascendente: { type: 'number' },
                    },
                  },
                  aspectos: { type: 'array', items: { type: 'object' } },
                  interpretacao: { type: 'string' },
                },
              },
            },
          },
        },
        '400': { description: 'Dados incompletos para cálculo' },
        '500': { description: 'Erro ao calcular mapa natal' },
      },
    },
  };

  spec.paths['/api/astrologia/transitos'] = {
    get: {
      summary: 'Calcular trânsitos planetários',
      description:
        'Calcula os trânsitos planetários ativos no momento ou em uma data específica, ' +
        'mostrando como influenciam o mapa natal.',
      tags: ['Astrologia'],
      parameters: [
        {
          name: 'dataNascimento',
          in: 'query',
          required: true,
          description: 'Data de nascimento no formato YYYY-MM-DD',
          schema: { type: 'string', format: 'date', example: '1990-05-15' },
        },
        {
          name: 'horaNascimento',
          in: 'query',
          required: false,
          description: 'Hora de nascimento no formato HH:MM',
          schema: { type: 'string', example: '14:30' },
        },
        {
          name: 'latitude',
          in: 'query',
          required: true,
          description: 'Latitude do local de nascimento',
          schema: { type: 'number', format: 'float', example: -23.5505 },
        },
        {
          name: 'longitude',
          in: 'query',
          required: true,
          description: 'Longitude do local de nascimento',
          schema: { type: 'number', format: 'float', example: -46.6333 },
        },
        {
          name: 'dataAtual',
          in: 'query',
          required: false,
          description: 'Data para calcular trânsitos (padrão: data atual)',
          schema: { type: 'string', format: 'date', example: '2024-06-15' },
        },
      ],
      responses: {
        '200': {
          description: 'Trânsitos planetários calculados',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  transitos: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        planeta: { type: 'string' },
                        signo: { type: 'string' },
                        grau: { type: 'number' },
                        aspecto: { type: 'string' },
                        planetaNatal: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '400': { description: 'Dados incompletos' },
        '500': { description: 'Erro ao calcular trânsitos' },
      },
    },
  };

  // ============================================================
  // INSIGHTS PATH
  // ============================================================

  spec.paths['/api/insights/diario'] = {
    get: {
      summary: 'Gerar insight diário',
      description:
        'Gera um insight personalizado baseado nos ciclos temporais, Odú do dia e mapa astral do usuário. ' +
        'Requer autenticação e consome 1 crédito.',
      tags: ['Insights'],
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'data',
          in: 'query',
          required: true,
          description: 'Data de nascimento no formato YYYY-MM-DD',
          schema: { type: 'string', format: 'date', example: '1990-05-15' },
        },
        {
          name: 'nome',
          in: 'query',
          required: true,
          description: 'Nome completo do usuário',
          schema: { type: 'string', example: 'Maria Silva' },
        },
        {
          name: 'odu',
          in: 'query',
          required: true,
          description: 'Odú de nascimento',
          schema: { type: 'string', example: 'Eji' },
        },
        {
          name: 'numero',
          in: 'query',
          required: false,
          description: 'Número pessoal do usuário',
          schema: { type: 'integer', example: 5 },
        },
      ],
      responses: {
        '200': {
          description: 'Insight diário gerado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  insight: { type: 'string' },
                  ciclos: { type: 'object' },
                  correspondencias: { type: 'object' },
                  creditosRestantes: { type: 'integer' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        '401': { description: 'Usuário não autenticado' },
        '400': { description: 'Dados insuficientes ou créditos insuficientes' },
        '429': { description: 'Rate limit excedido' },
        '500': { description: 'Erro interno' },
      },
    },
  };

  // ============================================================
  // CHAT PATHS
  // ============================================================

  spec.paths['/api/chat/historico'] = {
    get: {
      summary: 'Buscar histórico de conversas',
      description: 'Retorna todas as conversas salvas do usuário autenticado.',
      tags: ['Chat'],
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Lista de conversas',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  conversas: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        titulo: { type: 'string' },
                        tema: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        ultimaMensagem: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '401': { description: 'Usuário não autenticado' },
        '500': { description: 'Erro ao buscar histórico' },
      },
    },
    post: {
      summary: 'Salvar conversa',
      description: 'Salva uma nova conversa do usuário autenticado.',
      tags: ['Chat'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                titulo: { type: 'string', example: 'Dúvida sobre carreira' },
                tema: {
                  type: 'string',
                  enum: ['amor', 'carreira', 'espiritual', 'saude', 'financeiro', 'geral'],
                },
                mensagens: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      papel: { type: 'string', enum: ['usuario', 'assistente'] },
                      conteudo: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
              required: ['titulo', 'tema', 'mensagens'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Conversa salva com sucesso',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  success: { type: 'boolean' },
                },
              },
            },
          },
        },
        '401': { description: 'Usuário não autenticado' },
        '500': { description: 'Erro ao salvar conversa' },
      },
    },
  };

  spec.paths['/api/chat/mensagem'] = {
    post: {
      summary: 'Enviar mensagem de chat',
      description:
        'Envia uma mensagem e recebe resposta do assistente espiritual. ' +
        'Inclui contexto do mapa astral e ciclos do usuário. ' +
        'Requer autenticação e consome 2 créditos.',
      tags: ['Chat'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                mensagem: {
                  type: 'string',
                  example: 'Como está meu período profissional agora?',
                },
                tema: {
                  type: 'string',
                  enum: ['amor', 'carreira', 'espiritual', 'saude', 'financeiro', 'geral'],
                },
                conversaId: { type: 'string', nullable: true },
              },
              required: ['mensagem', 'tema'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Resposta do assistente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  resposta: { type: 'string' },
                  conversaId: { type: 'string' },
                  creditosRestantes: { type: 'integer' },
                  contexto: {
                    type: 'object',
                    properties: {
                      ciclos: { type: 'object' },
                      correspondencias: { type: 'object' },
                    },
                  },
                },
              },
            },
          },
        },
        '401': { description: 'Usuário não autenticado' },
        '400': { description: 'Créditos insuficientes' },
        '429': { description: 'Rate limit excedido' },
        '500': { description: 'Erro interno' },
      },
    },
  };

  // ============================================================
  // CREDITOS PATHS
  // ============================================================

  spec.paths['/api/creditos/adicionar'] = {
    post: {
      summary: 'Adicionar créditos',
      description: 'Adiciona créditos à conta do usuário autenticado (uso administrativo).',
      tags: ['Créditos'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                quantidade: {
                  type: 'integer',
                  minimum: 1,
                  example: 50,
                  description: 'Quantidade de créditos a adicionar',
                },
                descricao: {
                  type: 'string',
                  example: 'Recarga mensal',
                  description: 'Descrição da operação',
                },
              },
              required: ['quantidade', 'descricao'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Créditos adicionados',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  novoSaldo: { type: 'integer' },
                },
              },
            },
          },
        },
        '400': { description: 'Quantidade inválida ou descrição ausente' },
        '401': { description: 'Usuário não autenticado' },
        '500': { description: 'Erro interno' },
      },
    },
  };

  spec.paths['/api/creditos/debitar'] = {
    post: {
      summary: 'Debitar créditos',
      description: 'Debita créditos da conta do usuário autenticado para uma operação específica.',
      tags: ['Créditos'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                quantidade: {
                  type: 'integer',
                  minimum: 1,
                  example: 2,
                  description: 'Quantidade de créditos a debitar',
                },
                operacao: {
                  type: 'string',
                  example: 'chat_mensagem',
                  description: 'Identificador da operação',
                },
              },
              required: ['quantidade', 'operacao'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Dédito realizado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean' },
                  novoSaldo: { type: 'integer' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Créditos insuficientes ou parâmetros inválidos',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  error: { type: 'string' },
                  saldoAtual: { type: 'integer' },
                  saldoNecessario: { type: 'integer' },
                },
              },
            },
          },
        },
        '401': { description: 'Usuário não autenticado' },
        '500': { description: 'Erro interno' },
      },
    },
  };

  // ============================================================
  // PAYMENTS PATHS
  // ============================================================

  spec.paths['/api/payments/checkout'] = {
    post: {
      summary: 'Criar sessão de checkout',
      description: 'Inicia uma sessão de pagamento Stripe para compra de créditos ou assinatura.',
      tags: ['Pagamentos'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'ID do usuário' },
                planoId: { type: 'string', description: 'ID do plano de assinatura' },
              },
              required: ['userId', 'planoId'],
              example: {
                userId: 'usr_abc123',
                planoId: 'plano_mensal_basico',
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Sessão de checkout criada',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: { type: 'string' },
                  url: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        '400': { description: 'Plano inválido ou parâmetros ausentes' },
        '500': { description: 'Erro interno' },
      },
    },
  };

  spec.paths['/api/payments/portal'] = {
    post: {
      summary: 'Criar portal de gerenciamento',
      description: 'Cria uma sessão do Stripe Customer Portal para gerenciamento de assinatura.',
      tags: ['Pagamentos'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'ID do usuário' },
              },
              required: ['userId'],
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Portal criado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
        '400': { description: 'Erro ao criar sessão do portal' },
        '500': { description: 'Erro interno' },
      },
    },
  };

  spec.paths['/api/webhooks/stripe'] = {
    post: {
      summary: 'Webhook Stripe',
      description:
        'Endpoint para receber eventos Stripe: checkout.session.completed, ' +
        'customer.subscription.deleted, invoice.payment_failed, customer.subscription.updated.',
      tags: ['Webhooks'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { type: 'object', description: 'Evento Stripe' },
          },
        },
      },
      responses: {
        '200': { description: 'Webhook processado com sucesso' },
        '400': { description: 'Assinatura do webhook inválida' },
        '500': { description: 'Erro ao processar webhook' },
      },
    },
  };

  // ============================================================
  // NOTIFICATIONS PATHS
  // ============================================================

  spec.paths['/api/notifications/preferences'] = {
    get: {
      summary: 'Obter preferências de notificação',
      description: 'Retorna as preferências de notificação do usuário autenticado.',
      tags: ['Notificações'],
      security: [{ BearerAuth: [] }],
      responses: {
        '200': {
          description: 'Preferências de notificação',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'boolean', description: 'Notificações por email' },
                  push: { type: 'boolean', description: 'Notificações push' },
                  transitAlerts: {
                    type: 'boolean',
                    description: 'Alertas de trânsitos planetários importantes',
                  },
                  dailyInsights: {
                    type: 'boolean',
                    description: 'Insights diários automáticos',
                  },
                },
              },
            },
          },
        },
      },
    },
    put: {
      summary: 'Atualizar preferências de notificação',
      description: 'Atualiza as preferências de notificação do usuário autenticado.',
      tags: ['Notificações'],
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'boolean' },
                push: { type: 'boolean' },
                transitAlerts: { type: 'boolean' },
                dailyInsights: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Preferências atualizadas',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'boolean' },
                  push: { type: 'boolean' },
                  transitAlerts: { type: 'boolean' },
                  dailyInsights: { type: 'boolean' },
                },
              },
            },
          },
        },
        '400': { description: 'Payload inválido' },
      },
    },
  };

  // ============================================================
  // COMPONENTS - SCHEMAS
  // ============================================================

  spec.components.schemas['Error'] = {
    type: 'object',
    properties: {
      error: { type: 'string', description: 'Mensagem de erro' },
      code: { type: 'integer', description: 'Código de erro' },
    },
  };

  spec.components.schemas['PaginatedResponse'] = {
    type: 'object',
    properties: {
      data: { type: 'array', items: {} },
      total: { type: 'integer' },
      page: { type: 'integer' },
      limit: { type: 'integer' },
    },
  };

  spec.components.schemas['User'] = {
    type: 'object',
    properties: {
      id: { type: 'string' },
      email: { type: 'string', format: 'email' },
      nomeCompleto: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  };

  spec.components.schemas['Creditos'] = {
    type: 'object',
    properties: {
      saldo: { type: 'integer', description: 'Saldo atual de créditos' },
      ultimaAtualizacao: { type: 'string', format: 'date-time' },
    },
  };

  // ============================================================
  // COMPONENTS - SECURITY SCHEMES
  // ============================================================

  spec.components.securitySchemes = {
    BearerAuth: {
      type: 'http',
      scheme: 'bearer',
      description: 'Token JWT obtido através do endpoint de login',
    },
  };

  return spec;
}

/**
 * Get paths from a directory
/**
 * Get paths from a directory
 * @returns Array of route paths
 */
export function getAPIRoutesFromDirectory(_directory: string): string[] {
  const routes: string[] = [];
  // This would typically use fs.readdirSync to scan directories
  // For now, we return the known routes
  return routes;
}
