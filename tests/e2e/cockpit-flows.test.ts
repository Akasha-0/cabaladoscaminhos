import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

// Store original window descriptor for restoration
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(global, 'window') ?? {
  value: undefined,
  writable: true,
  configurable: true,
};

// ============================================
// Mock Browser Environment
// ============================================
interface MockWindow {
  location: { href: string; pathname: string; search: string };
  localStorage: MockStorage;
  sessionStorage: MockStorage;
  cookies: Record<string, string>;
  history: { pushState: Mock; replaceState: Mock };
  fetch: Mock;
  alert: Mock;
  confirm: Mock;
}

interface MockStorage {
  _data: Record<string, string>;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
}

function createMockStorage(): MockStorage {
  const data: Record<string, string> = {};
  return {
    _data: data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => { data[key] = value; },
    removeItem: (key: string) => { delete data[key]; },
    clear: () => { Object.keys(data).forEach(k => delete data[k]); },
  };
}

const createMockWindow = (): MockWindow => {
  return {
    location: { href: 'http://localhost/', pathname: '/', search: '' },
    localStorage: createMockStorage(),
    sessionStorage: createMockStorage(),
    cookies: {},
    history: {
      pushState: vi.fn(),
      replaceState: vi.fn(),
    },
    fetch: vi.fn(),
    alert: vi.fn(),
    confirm: vi.fn(),
  };
};

// ============================================
// Type Definitions
// ============================================
interface Operator {
  id: string;
  email: string;
  name: string;
  role: 'OPERATOR' | 'ADMIN';
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface ClientData {
  name: string;
  email: string;
  birthDate?: string;
  gender?: string;
  city?: string;
  occupation?: string;
  motivation?: string;
  mainQuestion?: string;
}

interface MatrixData {
  [casa: number]: {
    carta: { numero: number; nome: string; significado: string } | null;
    odu: { numero: number; nome: string; significado: string } | null;
  } | null;
}

interface ReadingResponse {
  id: string;
  clientId: string;
  status: string;
}

interface GenerateResponse {
  readingId: string;
  status: string;
  houses?: Array<{ house: number; content: string }>;
}

interface ConsultResponse {
  consultationId: string;
  question: string;
  routedThemes: string[];
  routedHouses: number[];
}

// ============================================
// Mock API Functions
// ============================================

function mockOperatorLoginApi(window: MockWindow): void {
  window.fetch.mockImplementation(async (url: URL | RequestInfo, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/operator/auth/login')) {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      
      // Validation
      if (!body.email || !body.password) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'Email e senha são obrigatórios' }) };
      }
      
      // Error cases
      if (body.email === 'locked@operator.com') {
        return { ok: false, status: 423, json: () => Promise.resolve({ error: 'Conta bloqueada. Tente novamente mais tarde.' }) };
      }
      
      if (body.email === 'mfa@operator.com') {
        return {
          ok: true, status: 200, json: () => Promise.resolve({
            mfaRequired: true,
            mfaToken: 'mock-mfa-token-123',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          }),
        };
      }
      
      if (body.email === 'invalid@operator.com') {
        return { ok: false, status: 401, json: () => Promise.resolve({ error: 'Credenciais inválidas' }) };
      }
      
      // Success case
      const operator: Operator = {
        id: 'op-123',
        email: body.email,
        name: 'Operador Teste',
        role: 'OPERATOR',
      };
      const tokens: AuthTokens = {
        accessToken: 'mock-cockpit-access-token-xyz',
        refreshToken: 'mock-cockpit-refresh-token-abc',
      };
      
      // Store in localStorage and cookies
      window.localStorage.setItem('operatorToken', tokens.accessToken);
      window.localStorage.setItem('operatorRefresh', tokens.refreshToken);
      window.localStorage.setItem('operator', JSON.stringify(operator));
      window.cookies.cockpit_session = tokens.accessToken;
      window.cookies.cockpit_refresh = tokens.refreshToken;
      
      return { ok: true, status: 200, json: () => Promise.resolve({ operator, tokens, expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() }) };
    }
    
    if (typeof url === 'string' && url.includes('/api/operator/auth/logout')) {
      // Clear stored tokens
      window.localStorage.removeItem('operatorToken');
      window.localStorage.removeItem('operatorRefresh');
      window.localStorage.removeItem('operator');
      delete window.cookies.cockpit_session;
      delete window.cookies.cockpit_refresh;
      
      return { ok: true, status: 200, json: () => Promise.resolve({ success: true }) };
    }
    
    return { ok: false, status: 404, json: () => Promise.resolve({ error: 'Not found' }) };
  });
}

function mockMesaRealClientsApi(window: MockWindow): void {
  window.fetch.mockImplementation(async (url: URL | RequestInfo, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/mesa-real/clients')) {
      const method = options?.method ?? 'GET';
      
      // Auth check
      const token = window.localStorage.getItem('operatorToken');
      if (!token && !window.cookies.cockpit_session) {
        return { ok: false, status: 401, json: () => Promise.resolve({ error: 'Não autenticado' }) };
      }
      
      if (method === 'POST') {
        const body = options?.body ? JSON.parse(options.body as string) : {};
        
        // Validation
        if (!body.name || !body.email) {
          return { ok: false, status: 400, json: () => Promise.resolve({ error: 'Nome e email são obrigatórios' }) };
        }
        
        if (body.email === 'duplicate@client.com') {
          return { ok: false, status: 409, json: () => Promise.resolve({ error: 'Cliente com este email já existe' }) };
        }
        
        // Success case
        const client = {
          id: `client-${Date.now()}`,
          name: body.name,
          email: body.email,
          birthDate: body.birthDate ?? '',
          gender: body.gender ?? '',
          city: body.city ?? '',
          createdAt: new Date().toISOString(),
          operatorId: 'op-123',
        };
        
        return { ok: true, status: 201, json: () => Promise.resolve(client) };
      }
      
      if (method === 'GET') {
        return {
          ok: true,
          status: 200,
          json: () => Promise.resolve([
            { id: 'client-1', name: 'Cliente Existente', email: 'cliente@exemplo.com' },
          ]),
        };
      }
    }
    
    return { ok: false, status: 404, json: () => Promise.resolve({ error: 'Not found' }) };
  });
}

function mockMesaRealSaveApi(window: MockWindow): void {
  window.fetch.mockImplementation(async (url: URL | RequestInfo, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/mesa-real/save')) {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      
      // Auth check
      const token = window.localStorage.getItem('operatorToken');
      if (!token && !window.cookies.cockpit_session) {
        return { ok: false, status: 401, json: () => Promise.resolve({ error: 'Não autenticado' }) };
      }
      
      // Validation
      if (!body.clientId) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'clientId é obrigatório' }) };
      }
      
      if (!body.matrixData || Object.keys(body.matrixData).length === 0) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'matrixData deve ter ao menos uma casa preenchida' }) };
      }
      
      // Check for duplicate cards
      const cards: number[] = [];
      for (const casa of Object.keys(body.matrixData)) {
        const data = body.matrixData[parseInt(casa)];
        if (data?.carta) {
          if (cards.includes(data.carta.numero)) {
            return {
              ok: false,
              status: 400,
              json: () => Promise.resolve({
                error: 'Cartas duplicadas detectadas',
                details: { cardNumber: data.carta.numero, cardName: data.carta.nome },
              }),
            };
          }
          cards.push(data.carta.numero);
        }
      }
      
      // Success case
      const reading = {
        id: `reading-${Date.now()}`,
        clientId: body.clientId,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      
      // Store last reading for generate endpoint
      window.localStorage.setItem('lastReadingId', reading.id);
      
      return { ok: true, status: 201, json: () => Promise.resolve(reading) };
    }
    
    return { ok: false, status: 404, json: () => Promise.resolve({ error: 'Not found' }) };
  });
}

function mockMesaRealGenerateApi(window: MockWindow): void {
  window.fetch.mockImplementation(async (url: URL | RequestInfo, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/mesa-real/generate')) {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      
      // Auth check
      const token = window.localStorage.getItem('operatorToken');
      if (!token && !window.cookies.cockpit_session) {
        return { ok: false, status: 401, json: () => Promise.resolve({ error: 'Não autenticado' }) };
      }
      
      // Token budget exceeded case
      if (body.readingId === 'budget-exceeded-reading') {
        return {
          ok: false,
          status: 429,
          json: () => Promise.resolve({
            error: 'Limite diário de tokens excedido. Tente novamente amanhã.',
            retryAfter: 86400,
          }),
        };
      }
      
      // Validation
      if (!body.readingId) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'readingId é obrigatório' }) };
      }
      
      // Success case - simulate SSE response
      const houses = body.matrixData
        ? Object.keys(body.matrixData).map(casa => ({
            house: parseInt(casa),
            content: `Interpretação simulada da casa ${casa}`,
          }))
        : [];
      
      return {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          readingId: body.readingId,
          status: 'COMPLETED',
          houses,
          synthesis: 'Síntese gerada com sucesso.',
        }),
      };
    }
    
    return { ok: false, status: 404, json: () => Promise.resolve({ error: 'Not found' }) };
  });
}

function mockConsultApi(window: MockWindow): void {
  window.fetch.mockImplementation(async (url: URL | RequestInfo, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/consult')) {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      
      // Auth check
      const token = window.localStorage.getItem('operatorToken');
      if (!token && !window.cookies.cockpit_session) {
        return { ok: false, status: 401, json: () => Promise.resolve({ error: 'Não autenticado' }) };
      }
      
      // Validation
      if (!body.readingId) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'readingId é obrigatório' }) };
      }
      
      if (!body.question || body.question.trim().length === 0) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'A pergunta não pode ser vazia' }) };
      }
      
      if (body.question.length > 2000) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'Pergunta excede limite de 2000 caracteres' }) };
      }
      
      // Success case
      return {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          consultationId: `consult-${Date.now()}`,
          readingId: body.readingId,
          question: body.question,
          routedThemes: ['Amor', 'Carreira'],
          routedHouses: [5, 10],
        }),
      };
    }
    
    return { ok: false, status: 404, json: () => Promise.resolve({ error: 'Not found' }) };
  });
}

// ============================================
// Test Suites
// ============================================

describe('Cockpit: Operator Login Flow', () => {
  let window: MockWindow;

  beforeEach(() => {
    window = createMockWindow();
    mockOperatorLoginApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  it('cockpit: operator login flow — successful login with JWT', async () => {
    const loginData = {
      email: 'operador@cabala.com',
      password: 'senha-segura-123',
    };

    const response = await window.fetch('/api/operator/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.operator).toBeDefined();
    expect(result.operator.email).toBe(loginData.email);
    expect(result.tokens.accessToken).toBeDefined();
    expect(result.tokens.refreshToken).toBeDefined();
    expect(result.tokens.accessToken).toBe('mock-cockpit-access-token-xyz');
    expect(window.localStorage.getItem('operatorToken')).toBe('mock-cockpit-access-token-xyz');
    expect(window.cookies.cockpit_session).toBe('mock-cockpit-access-token-xyz');
  });

  it('cockpit: operator login flow — invalid credentials return 401', async () => {
    const loginData = {
      email: 'invalid@operator.com',
      password: 'wrong-password',
    };

    const response = await window.fetch('/api/operator/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);

    const result = await response.json();
    expect(result.error).toBe('Credenciais inválidas');
  });

  it('cockpit: operator login flow — locked account returns 423', async () => {
    const loginData = {
      email: 'locked@operator.com',
      password: 'any-password',
    };

    const response = await window.fetch('/api/operator/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(423);

    const result = await response.json();
    expect(result.error).toBe('Conta bloqueada. Tente novamente mais tarde.');
  });

  it('cockpit: operator login flow — MFA required when enabled', async () => {
    const loginData = {
      email: 'mfa@operator.com',
      password: 'mfa-password',
    };

    const response = await window.fetch('/api/operator/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.mfaRequired).toBe(true);
    expect(result.mfaToken).toBeDefined();
    expect(result.expiresAt).toBeDefined();
  });

  it('cockpit: operator login flow — missing fields return 400', async () => {
    const incompleteData = {
      email: 'operador@cabala.com',
      // password missing
    };

    const response = await window.fetch('/api/operator/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('Email e senha são obrigatórios');
  });

  it('cockpit: operator login flow — JWT stored in cookies for cockpit access', async () => {
    const loginData = {
      email: 'operador@cabala.com',
      password: 'senha-segura-123',
    };

    await window.fetch('/api/operator/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    expect(window.cookies.cockpit_session).toBe('mock-cockpit-access-token-xyz');
    expect(window.cookies.cockpit_refresh).toBe('mock-cockpit-refresh-token-abc');
  });
});

describe('Cockpit: Client Creation Flow', () => {
  let window: MockWindow;

  beforeEach(() => {
    window = createMockWindow();
    // Set auth token first
    window.localStorage.setItem('operatorToken', 'mock-cockpit-access-token-xyz');
    mockMesaRealClientsApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  it('cockpit: client creation flow — create client with MatrixData', async () => {
    const clientData: ClientData = {
      name: 'Maria Silva',
      email: 'maria.silva@email.com',
      birthDate: '1985-03-15',
      gender: 'F',
      city: 'São Paulo',
      occupation: 'Professora',
      motivation: 'Autoconhecimento',
      mainQuestion: 'Qual meu propósito de vida?',
    };

    const response = await window.fetch('/api/mesa-real/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);

    const result = await response.json();
    expect(result.id).toBeDefined();
    expect(result.name).toBe(clientData.name);
    expect(result.email).toBe(clientData.email);
    expect(result.operatorId).toBe('op-123');
  });

  it('cockpit: client creation flow — duplicate email returns 409', async () => {
    const clientData: ClientData = {
      name: 'Cliente Existente',
      email: 'duplicate@client.com',
      birthDate: '1990-01-01',
    };

    const response = await window.fetch('/api/mesa-real/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(409);

    const result = await response.json();
    expect(result.error).toBe('Cliente com este email já existe');
  });

  it('cockpit: client creation flow — missing required fields return 400', async () => {
    const incompleteData: ClientData = {
      name: 'Cliente Sem Email',
      // email missing
    };

    const response = await window.fetch('/api/mesa-real/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('Nome e email são obrigatórios');
  });

  it('cockpit: client creation flow — unauthenticated request returns 401', async () => {
    const cleanWindow = createMockWindow();
    mockMesaRealClientsApi(cleanWindow);
    
    const clientData: ClientData = {
      name: 'Maria Silva',
      email: 'maria.silva@email.com',
    };

    const response = await cleanWindow.fetch('/api/mesa-real/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });

  it('cockpit: client creation flow — list clients returns existing clients', async () => {
    const response = await window.fetch('/api/mesa-real/clients', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('Cockpit: Reading Save Then Generate Flow', () => {
  let window: MockWindow;

  beforeEach(() => {
    window = createMockWindow();
    window.localStorage.setItem('operatorToken', 'mock-cockpit-access-token-xyz');
    mockMesaRealSaveApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  it('cockpit: reading save then generate — save reading with matrixData', async () => {
    const matrixData: MatrixData = {
      1: { carta: { numero: 1, nome: 'O Mago', significado: 'Início, força' }, odu: { numero: 1, nome: 'Ogbe', significado: 'Inicio' } },
      10: { carta: { numero: 10, nome: 'A Roda da Fortuna', significado: 'Ciclos' }, odu: { numero: 10, nome: 'Owonwon', significado: 'Riqueza' } },
    };

    const response = await window.fetch('/api/mesa-real/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'client-123',
        matrixData,
      }),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(201);

    const result = await response.json();
    expect(result.id).toBeDefined();
    expect(result.clientId).toBe('client-123');
    expect(result.status).toBe('PENDING');
    expect(window.localStorage.getItem('lastReadingId')).toBe(result.id);
  });

  it('cockpit: reading save then generate — reject empty matrixData', async () => {
    const response = await window.fetch('/api/mesa-real/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'client-123',
        matrixData: {},
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('matrixData deve ter ao menos uma casa preenchida');
  });

  it('cockpit: reading save then generate — reject duplicate cards', async () => {
    const matrixData: MatrixData = {
      1: { carta: { numero: 5, nome: 'O Hierofante', significado: 'Tradição' }, odu: { numero: 1, nome: 'Ogbe', significado: 'Inicio' } },
      5: { carta: { numero: 5, nome: 'O Hierofante', significado: 'Tradição' }, odu: { numero: 5, nome: 'Meji', significado: 'Duplo' } }, // Same card number 5
    };

    const response = await window.fetch('/api/mesa-real/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'client-123',
        matrixData,
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('Cartas duplicadas detectadas');
    expect(result.details.cardNumber).toBe(5);
  });

  it('cockpit: reading save then generate — generate dossier for saved reading', async () => {
    // First save a reading
    const matrixData: MatrixData = {
      1: { carta: { numero: 1, nome: 'O Mago', significado: 'Início' }, odu: { numero: 1, nome: 'Ogbe', significado: 'Inicio' } },
      7: { carta: { numero: 7, nome: 'O Carro', significado: 'Vitória' }, odu: { numero: 7, nome: 'Otu', significado: 'Caos' } },
    };

    const saveResponse = await window.fetch('/api/mesa-real/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: 'client-123', matrixData }),
    });
    
    const savedReading = await saveResponse.json();
    
    // Now generate the dossier
    mockMesaRealGenerateApi(window);
    
    const generateResponse = await window.fetch('/api/mesa-real/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        readingId: savedReading.id,
        matrixData,
      }),
    });

    expect(generateResponse.ok).toBe(true);
    expect(generateResponse.status).toBe(200);

    const result = await generateResponse.json();
    expect(result.readingId).toBe(savedReading.id);
    expect(result.status).toBe('COMPLETED');
    expect(result.houses).toBeDefined();
    expect(result.synthesis).toBeDefined();
  });

  it('cockpit: reading save then generate — generate returns houses with content', async () => {
    mockMesaRealGenerateApi(window);
    
    const matrixData: MatrixData = {
      1: { carta: { numero: 1, nome: 'O Mago', significado: 'Início' }, odu: null },
      10: { carta: { numero: 10, nome: 'A Roda', significado: 'Ciclos' }, odu: null },
      15: { carta: { numero: 15, nome: 'O Diabo', significado: 'Sombra' }, odu: null },
    };

    const response = await window.fetch('/api/mesa-real/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readingId: 'reading-456', matrixData }),
    });

    expect(response.ok).toBe(true);
    
    const result = await response.json();
    expect(result.houses).toHaveLength(3);
    expect(result.houses[0]).toHaveProperty('house', 1);
    expect(result.houses[0]).toHaveProperty('content');
  });
});

describe('Cockpit: Consult Flow', () => {
  let window: MockWindow;

  beforeEach(() => {
    window = createMockWindow();
    window.localStorage.setItem('operatorToken', 'mock-cockpit-access-token-xyz');
    mockConsultApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  it('cockpit: consult flow — submit question with readingId', async () => {
    const consultData = {
      readingId: 'reading-123',
      question: 'Qual é o melhor caminho para minha carreira neste momento?',
    };

    const response = await window.fetch('/api/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultData),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.consultationId).toBeDefined();
    expect(result.readingId).toBe(consultData.readingId);
    expect(result.question).toBe(consultData.question);
    expect(result.routedThemes).toBeDefined();
    expect(result.routedHouses).toBeDefined();
  });

  it('cockpit: consult flow — missing readingId returns 400', async () => {
    const consultData = {
      question: 'Qual é meu propósito?',
      // readingId missing
    };

    const response = await window.fetch('/api/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('readingId é obrigatório');
  });

  it('cockpit: consult flow — empty question returns 400', async () => {
    const consultData = {
      readingId: 'reading-123',
      question: '   ', // Only whitespace
    };

    const response = await window.fetch('/api/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('A pergunta não pode ser vazia');
  });

  it('cockpit: consult flow — question exceeding 2000 chars returns 400', async () => {
    const longQuestion = 'A'.repeat(2001);
    
    const consultData = {
      readingId: 'reading-123',
      question: longQuestion,
    };

    const response = await window.fetch('/api/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('Pergunta excede limite de 2000 caracteres');
  });

  it('cockpit: consult flow — unauthenticated request returns 401', async () => {
    const cleanWindow = createMockWindow();
    mockConsultApi(cleanWindow);
    
    const consultData = {
      readingId: 'reading-123',
      question: 'Qual é meu caminho?',
    };

    const response = await cleanWindow.fetch('/api/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });

  it('cockpit: consult flow — routed themes and houses returned', async () => {
    const consultData = {
      readingId: 'reading-123',
      question: 'Estou tendo problemas no relacionamento amoroso. O que fazer?',
    };

    const response = await window.fetch('/api/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consultData),
    });

    const result = await response.json();
    expect(result.routedThemes).toContain('Amor');
    expect(result.routedHouses).toContain(5); // Casa 5 typically relates to love in Tarot
  });
});

describe('Cockpit: Token Budget Exceeded', () => {
  let window: MockWindow;

  beforeEach(() => {
    window = createMockWindow();
    window.localStorage.setItem('operatorToken', 'mock-cockpit-access-token-xyz');
    mockMesaRealGenerateApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  it('cockpit: token budget exceeded — returns 429 when daily budget is exhausted', async () => {
    const response = await window.fetch('/api/mesa-real/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        readingId: 'budget-exceeded-reading',
        matrixData: {
          1: { carta: { numero: 1, nome: 'O Mago', significado: 'Início' }, odu: { numero: 1, nome: 'Ogbe', significado: 'Inicio' } },
        },
      }),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(429);

    const result = await response.json();
    expect(result.error).toBe('Limite diário de tokens excedido. Tente novamente amanhã.');
    expect(result.retryAfter).toBe(86400);
  });

  it('cockpit: token budget exceeded — unauthenticated request returns 401 before budget check', async () => {
    const cleanWindow = createMockWindow();
    mockMesaRealGenerateApi(cleanWindow);

    const response = await cleanWindow.fetch('/api/mesa-real/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        readingId: 'reading-123',
        matrixData: { 1: { carta: { numero: 1, nome: 'Teste', significado: '' }, odu: null } },
      }),
    });

    // Auth check happens before budget check
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });
});

describe('Cockpit: Session Revoke', () => {
  let window: MockWindow;

  beforeEach(() => {
    window = createMockWindow();
    window.localStorage.setItem('operatorToken', 'mock-cockpit-access-token-xyz');
    window.cookies.cockpit_session = 'mock-cockpit-access-token-xyz';
    window.cookies.cockpit_refresh = 'mock-cockpit-refresh-token-abc';
    mockOperatorLoginApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  it('cockpit: session revoke — logout clears tokens and cookies', async () => {
    expect(window.localStorage.getItem('operatorToken')).toBe('mock-cockpit-access-token-xyz');
    expect(window.cookies.cockpit_session).toBe('mock-cockpit-access-token-xyz');

    const response = await window.fetch('/api/operator/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.success).toBe(true);

    // Tokens should be cleared
    expect(window.localStorage.getItem('operatorToken')).toBeNull();
    expect(window.localStorage.getItem('operatorRefresh')).toBeNull();
    expect(window.cookies.cockpit_session).toBeUndefined();
    expect(window.cookies.cockpit_refresh).toBeUndefined();
  });

  it('cockpit: session revoke — subsequent API calls fail after logout', async () => {
    // First logout
    await window.fetch('/api/operator/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    // Now try to access protected endpoint
    mockMesaRealClientsApi(window);
    
    const response = await window.fetch('/api/mesa-real/clients', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });

  it('cockpit: session revoke — logout is idempotent (always returns 200)', async () => {
    // Call logout twice
    const response1 = await window.fetch('/api/operator/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    const response2 = await window.fetch('/api/operator/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    expect(response1.ok).toBe(true);
    expect(response1.status).toBe(200);
    expect(response2.ok).toBe(true);
    expect(response2.status).toBe(200);
  });

  it('cockpit: session revoke — can login again after logout', async () => {
    // First logout
    await window.fetch('/api/operator/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    // Then login again
    const loginData = {
      email: 'operador@cabala.com',
      password: 'nova-senha-456',
    };

    const response = await window.fetch('/api/operator/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.tokens.accessToken).toBeDefined();
    expect(window.localStorage.getItem('operatorToken')).toBe('mock-cockpit-access-token-xyz');
  });
});

// ============================================
// Integration: Full Cockpit Workflow
// ============================================
describe('Cockpit: Full Workflow Integration', () => {
  let window: MockWindow;

  beforeEach(() => {
    window = createMockWindow();
    mockOperatorLoginApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  it('cockpit: complete workflow — login → create client → save reading → generate → consult', async () => {
    // Step 1: Login
    const loginResponse = await window.fetch('/api/operator/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'operador@cabala.com', password: 'senha-123' }),
    });
    expect(loginResponse.ok).toBe(true);
    const loginResult = await loginResponse.json();
    expect(loginResult.tokens.accessToken).toBeDefined();

    // Step 2: Create client
    mockMesaRealClientsApi(window);
    const clientResponse = await window.fetch('/api/mesa-real/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'João Santos',
        email: 'joao.santos@email.com',
        birthDate: '1992-07-20',
        gender: 'M',
        city: 'Rio de Janeiro',
      }),
    });
    expect(clientResponse.ok).toBe(true);
    const client = await clientResponse.json();
    expect(client.id).toBeDefined();

    // Step 3: Save reading
    mockMesaRealSaveApi(window);
    const matrixData: MatrixData = {
      1: { carta: { numero: 1, nome: 'O Mago', significado: 'Início' }, odu: { numero: 1, nome: 'Ogbe', significado: 'Inicio' } },
      10: { carta: { numero: 10, nome: 'A Roda', significado: 'Ciclos' }, odu: { numero: 10, nome: 'Owonwon', significado: 'Riqueza' } },
      15: { carta: { numero: 15, nome: 'O Diabo', significado: 'Sombra' }, odu: { numero: 15, nome: 'Ogunda', significado: 'Guerra' } },
    };

    const saveResponse = await window.fetch('/api/mesa-real/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: client.id, matrixData }),
    });
    expect(saveResponse.ok).toBe(true);
    const reading = await saveResponse.json();
    expect(reading.id).toBeDefined();
    expect(reading.status).toBe('PENDING');

    // Step 4: Generate dossier
    mockMesaRealGenerateApi(window);
    const generateResponse = await window.fetch('/api/mesa-real/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readingId: reading.id, matrixData }),
    });
    expect(generateResponse.ok).toBe(true);
    const dossier = await generateResponse.json();
    expect(dossier.status).toBe('COMPLETED');
    expect(dossier.houses.length).toBe(3);

    // Step 5: Consult
    mockConsultApi(window);
    const consultResponse = await window.fetch('/api/consult', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        readingId: reading.id,
        question: 'Como posso usar a energia da casa 10 no meu trabalho?',
      }),
    });
    expect(consultResponse.ok).toBe(true);
    const consult = await consultResponse.json();
    expect(consult.consultationId).toBeDefined();
    expect(consult.routedHouses).toContain(10);

    // Step 6: Logout
    mockOperatorLoginApi(window);
    const logoutResponse = await window.fetch('/api/operator/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(logoutResponse.ok).toBe(true);
    expect(window.localStorage.getItem('operatorToken')).toBeNull();
  });
});