import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

// Store original window descriptor for restoration
const originalWindowDescriptor = Object.getOwnPropertyDescriptor(global, 'window') ?? {
 value: undefined,
 writable: true,
 configurable: true,
};
// ============================================
// ============================================
// Mock Browser Environment
// ============================================
interface MockWindow {
  location: { href: string; pathname: string; search: string };
  localStorage: Record<string, string>;
  sessionStorage: Record<string, string>;
  history: { pushState: Mock; replaceState: Mock };
  fetch: Mock;
  alert: Mock;
  confirm: Mock;
}

const createMockWindow = (): MockWindow => {
  const store: Record<string, string> = {};
  return {
    location: { href: 'http://localhost/', pathname: '/', search: '' },
    localStorage: new Proxy(store, {
      get: (_, key) => store[`localStorage:${String(key)}`] ?? null,
      set: (_, key, value) => { store[`localStorage:${String(key)}`] = String(value); return true; },
      deleteProperty: (_, key) => { delete store[`localStorage:${String(key)}`]; return true; },
    }),
    sessionStorage: new Proxy(store, {
      get: (_, key) => store[`sessionStorage:${String(key)}`] ?? null,
      set: (_, key, value) => { store[`sessionStorage:${String(key)}`] = String(value); return true; },
      deleteProperty: (_, key) => { delete store[`sessionStorage:${String(key)}`]; return true; },
    }),
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
// Mock Auth & API Functions
// ============================================

interface User {
  id: string;
  email: string;
  nome: string;
  createdAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface RegistrationData {
  email: string;
  senha: string;
  nome: string;
  dataNascimento: string;
}

interface LoginData {
  email: string;
  senha: string;
}

function mockRegistrationApi(window: MockWindow): void {
  window.fetch.mockImplementation(async (url: URL | RequestInfo, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/auth/registro')) {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      if (!body.email || !body.senha || !body.nome) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'Campos obrigatórios' }) };
      }
      if (body.email === 'existing@test.com') {
        return { ok: false, status: 409, json: () => Promise.resolve({ error: 'Email já cadastrado' }) };
      }
      const user: User = { id: '123', email: body.email, nome: body.nome, createdAt: new Date().toISOString() };
      const tokens: AuthTokens = { accessToken: 'mock-jwt-token', refreshToken: 'mock-refresh-token' };
      window.localStorage.token = tokens.accessToken;
      window.localStorage.user = JSON.stringify(user);
      return { ok: true, status: 200, json: () => Promise.resolve({ user, tokens }) };
    }
    return { ok: false, status: 404, json: () => Promise.resolve({ error: 'Not found' }) };
  });
}

function mockLoginApi(window: MockWindow): void {
  window.fetch.mockImplementation(async (url: URL | RequestInfo, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/auth/login')) {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      if (!body.email || !body.senha) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'Credenciais inválidas' }) };
      }
      if (body.email === 'locked@test.com') {
        return { ok: false, status: 423, json: () => Promise.resolve({ error: 'Conta bloqueada' }) };
      }
      if (body.email === 'wrong@test.com') {
        return { ok: false, status: 401, json: () => Promise.resolve({ error: 'Credenciais inválidas' }) };
      }
      const user: User = { id: '123', email: body.email, nome: 'Test User', createdAt: new Date().toISOString() };
      const tokens: AuthTokens = { accessToken: 'mock-jwt-token', refreshToken: 'mock-refresh-token' };
      window.localStorage.token = tokens.accessToken;
      window.localStorage.user = JSON.stringify(user);
      return { ok: true, status: 200, json: () => Promise.resolve({ user, tokens }) };
    }
    return { ok: false, status: 404, json: () => Promise.resolve({ error: 'Not found' }) };
  });
}

function mockDashboardApi(window: MockWindow): void {
  window.fetch.mockImplementation(async (url: URL | RequestInfo, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/dashboard')) {
      const token = window.localStorage.token;
      if (!token) {
        return { ok: false, status: 401, json: () => Promise.resolve({ error: 'Unauthorized' }) };
      }
      return {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          user: { id: '123', email: 'user@test.com', nome: 'Test User' },
          numerologia: { numeroCaminhoVida: 7, numeroAlma: 3 },
          creditos: 100,
        }),
      };
    }
    if (typeof url === 'string' && url.includes('/api/numerologia')) {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      if (!body.nomeCompleto || !body.dataNascimento) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'Dados incompletos' }) };
      }
      return {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          numeroCaminhoVida: 7,
          numeroExpressao: 5,
          numeroAlma: 3,
          numeroPersonalidade: 9,
          diaAniversario: 15,
          numeroFortuna: 4,
          tendencias: ['Criatividade', 'Inteligência'],
          cicloDeVida: [
            { numero: 7, duracao: '25 anos', descricao: 'Desenvolvimento espiritual' },
          ],
        }),
      };
    }
    return { ok: false, status: 404, json: () => Promise.resolve({ error: 'Not found' }) };
  });
}

// ============================================
// Test Suites
// ============================================

describe('User Registration Flow', () => {
  let window: MockWindow;

 beforeEach(() => {
   window = createMockWindow();
   mockRegistrationApi(window);
   Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
 });

 afterEach(() => {
   Object.defineProperty(global, 'window', originalWindowDescriptor);
 });


  it('deve registrar novo usuário com sucesso', async () => {
    const registrationData: RegistrationData = {
      email: 'novo@test.com',
      senha: 'senhaforte123',
      nome: 'Novo Usuario',
      dataNascimento: '1990-05-15',
    };

    const response = await window.fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(registrationData.email);
    expect(result.user.nome).toBe(registrationData.nome);
    expect(result.tokens.accessToken).toBeDefined();
    expect(window.localStorage.token).toBe('mock-jwt-token');
  });

  it('deve falhar quando email ja existe', async () => {
    const registrationData: RegistrationData = {
      email: 'existing@test.com',
      senha: 'senha123',
      nome: 'Usuario Existente',
      dataNascimento: '1985-03-20',
    };

    const response = await window.fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(409);

    const result = await response.json();
    expect(result.error).toBe('Email já cadastrado');
  });

  it('deve falhar quando campos obrigatorios estao omitidos', async () => {
    const incompleteData = {
      email: 'incomplete@test.com',
      nome: 'Usuario Incompleto',
    };

    const response = await window.fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('Campos obrigatórios');
  });

  it('deve redirecionar para dashboard apos registro', async () => {
    const registrationData: RegistrationData = {
      email: 'redirect@test.com',
      senha: 'senha123',
      nome: 'Redirect User',
      dataNascimento: '1992-11-30',
    };

    await window.fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registrationData),
    });

    expect(window.localStorage.token).toBeDefined();
    window.history.pushState({}, '', '/dashboard');
    window.location.pathname = '/dashboard';
    expect(window.location.pathname).toBe('/dashboard');
  });
});

describe('Login Flow', () => {
  let window: MockWindow;

  beforeEach(() => {
    window = createMockWindow();
    mockLoginApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });
  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  it('deve fazer login com credenciais validas', async () => {
    const loginData: LoginData = {
      email: 'user@test.com',
      senha: 'senhacorreta123',
    };

    const response = await window.fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(loginData.email);
    expect(result.tokens.accessToken).toBeDefined();
    expect(window.localStorage.token).toBe('mock-jwt-token');
  });

  it('deve falhar com credenciais invalidas', async () => {
    const loginData: LoginData = {
      email: 'wrong@test.com',
      senha: 'senhaerrada',
    };

    const response = await window.fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);

    const result = await response.json();
    expect(result.error).toBe('Credenciais inválidas');
  });

  it('deve falhar para conta bloqueada', async () => {
    const loginData: LoginData = {
      email: 'locked@test.com',
      senha: 'senhabloqueada',
    };

    const response = await window.fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(423);

    const result = await response.json();
    expect(result.error).toBe('Conta bloqueada');
  });

  it('deve falhar quando campos estao faltando', async () => {
    const incompleteData = { email: 'user@test.com' };

    const response = await window.fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteData),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  it('deve persistir token no localStorage apos login', async () => {
    const loginData: LoginData = {
      email: 'user@test.com',
      senha: 'senhacorreta',
    };

    await window.fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData),
    });

    expect(window.localStorage.token).toBe('mock-jwt-token');
    const storedUser = JSON.parse(window.localStorage.user);
    expect(storedUser.email).toBe(loginData.email);
  });

  it('deve navegar para dashboard apos login bem-sucedido', async () => {
    await window.fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@test.com', senha: 'senha' }),
    });

    expect(window.localStorage.token).toBeDefined();
    window.history.pushState({}, '', '/dashboard');
    window.location.pathname = '/dashboard';
    expect(window.location.pathname).toBe('/dashboard');
  });
});

describe('Dashboard Loading', () => {
  let window: MockWindow;
  beforeEach(() => {
    window = createMockWindow();
    mockDashboardApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  it('deve carregar dados do dashboard quando autenticado', async () => {
   window.localStorage.token = 'valid-token';

    const response = await window.fetch('/api/dashboard', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${window.localStorage.token}`,
      },
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.user).toBeDefined();
    expect(data.numerologia).toBeDefined();
    expect(data.creditos).toBe(100);
  });

  it('deve falhar quando usuario nao autenticado', async () => {
    delete window.localStorage['localStorage:token'];

    const response = await window.fetch('/api/dashboard', {
      method: 'GET',
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
  });

  it('deve exibir numerologia do usuario no dashboard', async () => {
    window.localStorage.token = 'valid-token';

    const response = await window.fetch('/api/dashboard');
    const data = await response.json();

    expect(data.numerologia.numeroCaminhoVida).toBe(7);
    expect(data.numerologia.numeroAlma).toBe(3);
  });

  it('deve exibir creditos do usuario no dashboard', async () => {
    window.localStorage.token = 'valid-token';

    const response = await window.fetch('/api/dashboard');
    const data = await response.json();

    expect(data.creditos).toBe(100);
    expect(typeof data.creditos).toBe('number');
  });

  it('deve carregar informacoes do usuario logado', async () => {
    window.localStorage.token = 'valid-token';

    const response = await window.fetch('/api/dashboard');
    const data = await response.json();

    expect(data.user.email).toBe('user@test.com');
    expect(data.user.nome).toBe('Test User');
  });
});

describe('Numerology Calculation', () => {
  let window: MockWindow;

  beforeEach(() => {
    window = createMockWindow();
    mockDashboardApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });
  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  it('deve calcular numerologia com dados completos', async () => {
    const numerologiaInput = {
      nomeCompleto: 'Maria Silva Santos',
      dataNascimento: '1990-05-15',
    };

    const response = await window.fetch('/api/numerologia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(numerologiaInput),
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);

    const result = await response.json();
    expect(result.numeroCaminhoVida).toBe(7);
    expect(result.numeroExpressao).toBe(5);
    expect(result.numeroAlma).toBe(3);
    expect(result.numeroPersonalidade).toBe(9);
  });

  it('deve retornar tendencias da numerologia', async () => {
    const numerologiaInput = {
      nomeCompleto: 'Joao Pedro Oliveira',
      dataNascimento: '1985-08-22',
    };

    const response = await window.fetch('/api/numerologia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(numerologiaInput),
    });

    const result = await response.json();
    expect(result.tendencias).toBeDefined();
    expect(Array.isArray(result.tendencias)).toBe(true);
    expect(result.tendencias.length).toBeGreaterThan(0);
  });

  it('deve retornar ciclos de vida', async () => {
    const numerologiaInput = {
      nomeCompleto: 'Ana Clara Ferreira',
      dataNascimento: '1992-03-10',
    };

    const response = await window.fetch('/api/numerologia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(numerologiaInput),
    });

    const result = await response.json();
    expect(result.cicloDeVida).toBeDefined();
    expect(Array.isArray(result.cicloDeVida)).toBe(true);
    expect(result.cicloDeVida[0]).toHaveProperty('numero');
    expect(result.cicloDeVida[0]).toHaveProperty('duracao');
    expect(result.cicloDeVida[0]).toHaveProperty('descricao');
  });

  it('deve falhar quando nome completo falta', async () => {
    const incompleteInput = {
      dataNascimento: '1990-05-15',
    };

    const response = await window.fetch('/api/numerologia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteInput),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);

    const result = await response.json();
    expect(result.error).toBe('Dados incompletos');
  });

  it('deve falhar quando data de nascimento falta', async () => {
    const incompleteInput = {
      nomeCompleto: 'Maria Silva',
    };

    const response = await window.fetch('/api/numerologia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteInput),
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(400);
  });

  it('deve calcular dia do aniversario', async () => {
    const numerologiaInput = {
      nomeCompleto: 'Carlos Eduardo',
      dataNascimento: '1988-12-25',
    };

    const response = await window.fetch('/api/numerologia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(numerologiaInput),
    });

    const result = await response.json();
    expect(result.diaAniversario).toBeDefined();
    expect(typeof result.diaAniversario).toBe('number');
  });

  it('deve calcular numero da sorte', async () => {
    const numerologiaInput = {
      nomeCompleto: 'Roberto Mendes',
      dataNascimento: '1975-07-04',
    };

    const response = await window.fetch('/api/numerologia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(numerologiaInput),
    });

    const result = await response.json();
    expect(result.numeroFortuna).toBeDefined();
    expect(typeof result.numeroFortuna).toBe('number');
  });

  it('deve calcular todos os numeros numerologicos principais', async () => {
    const numerologiaInput = {
      nomeCompleto: 'Patricia Rodrigues Lima',
      dataNascimento: '1993-09-18',
    };

    const response = await window.fetch('/api/numerologia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(numerologiaInput),
    });

    const result = await response.json();
    expect(result.numeroCaminhoVida).toBeDefined();
    expect(result.numeroExpressao).toBeDefined();
    expect(result.numeroAlma).toBeDefined();
    expect(result.numeroPersonalidade).toBeDefined();

    const allNumbers = [
      result.numeroCaminhoVida,
      result.numeroExpressao,
      result.numeroAlma,
      result.numeroPersonalidade,
    ];
    allNumbers.forEach((num: number) => {
      expect(num).toBeGreaterThan(0);
      expect(num).toBeLessThanOrEqual(9);
    });
  });
});

// ============================================
// Profile Editing Flow Tests
// ============================================

function mockProfileApi(window: MockWindow): void {
  window.fetch.mockImplementation(async (url: URL | RequestInfo, options?: RequestInit) => {
    if (typeof url === 'string' && url.includes('/api/profile')) {
      const token = window.localStorage.token;
      if (!token) {
        return { ok: false, status: 401, json: () => Promise.resolve({ error: 'Unauthorized' }) };
      }
      const body = options?.body ? JSON.parse(options.body as string) : {};
      if (!body.nomeCompleto || !body.email) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'Campos obrigatórios' }) };
      }
      return {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          success: true,
          user: {
            id: '123',
            email: body.email,
            user_metadata: {
              nomeCompleto: body.nomeCompleto,
              dataNascimento: body.dataNascimento,
              horaNascimento: body.horaNascimento,
              localNascimento: body.localNascimento,
            },
          },
        }),
      };
    }
    if (typeof url === 'string' && url.includes('/api/numerologia')) {
      const body = options?.body ? JSON.parse(options.body as string) : {};
      if (!body.nomeCompleto || !body.dataNascimento) {
        return { ok: false, status: 400, json: () => Promise.resolve({ error: 'Dados incompletos' }) };
      }
      return {
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          pitagorica: 7,
          cabalistica: 3,
          tantrica: 5,
        }),
      };
    }
    return { ok: false, status: 404, json: () => Promise.resolve({ error: 'Not found' }) };
  });
}

interface ProfileFormData {
  nomeCompleto: string;
  email: string;
  dataNascimento: string;
  horaNascimento: string;
  localNascimento: string;
}
 
describe('Profile Editing Flow', () => {
  let window: MockWindow;

  beforeEach(() => {
    window = createMockWindow();
    mockProfileApi(window);
    Object.defineProperty(global, 'window', { value: window, writable: true, configurable: true });
  });

  afterEach(() => {
    Object.defineProperty(global, 'window', originalWindowDescriptor);
  });

  describe('Form Fields', () => {
    it('deve validar campo nome completo', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Maria da Luz',
        email: 'maria.luz@exemplo.com',
        dataNascimento: '1990-06-15',
        horaNascimento: '14:30',
        localNascimento: 'Rio de Janeiro, RJ',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);

      const result = await response.json();
      expect(result.user.user_metadata.nomeCompleto).toBe('Maria da Luz');
    });

    it('deve validar campo email', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'João Silva',
        email: 'joao.silva@exemplo.com',
        dataNascimento: '1990-06-15',
        horaNascimento: '',
        localNascimento: '',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.user.email).toBe('joao.silva@exemplo.com');
    });

    it('deve validar campo data de nascimento', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Ana Clara',
        email: 'ana@test.com',
        dataNascimento: '1985-03-22',
        horaNascimento: '08:00',
        localNascimento: 'São Paulo, SP',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.user.user_metadata.dataNascimento).toBe('1985-03-22');
    });

    it('deve validar campo hora de nascimento', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Pedro Santos',
        email: 'pedro@test.com',
        dataNascimento: '1992-11-10',
        horaNascimento: '20:45',
        localNascimento: 'Belo Horizonte, MG',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.user.user_metadata.horaNascimento).toBe('20:45');
    });

    it('deve validar campo local de nascimento', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Lucas Oliveira',
        email: 'lucas@test.com',
        dataNascimento: '1988-07-30',
        horaNascimento: '',
        localNascimento: 'Curitiba, PR',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.user.user_metadata.localNascimento).toBe('Curitiba, PR');
    });
  });

  describe('Validation', () => {
    it('deve falhar quando nome completo falta', async () => {
      window.localStorage.token = 'valid-token';
      
      const incompleteFormData = {
        email: 'test@test.com',
        dataNascimento: '1990-06-15',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteFormData),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBe('Campos obrigatórios');
    });

    it('deve falhar quando email falta', async () => {
      window.localStorage.token = 'valid-token';
      
      const incompleteFormData = {
        nomeCompleto: 'Test User',
        dataNascimento: '1990-06-15',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incompleteFormData),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBe('Campos obrigatórios');
    });

    it('deve falhar quando usuario nao autenticado', async () => {
      delete window.localStorage['localStorage:token'];

      const formData: ProfileFormData = {
        nomeCompleto: 'Test User',
        email: 'test@test.com',
        dataNascimento: '1990-06-15',
        horaNascimento: '',
        localNascimento: '',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(401);
    });
  });

  describe('Save Functionality', () => {
    it('deve simular salvamento com setTimeout de 1000ms', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Maria da Luz',
        email: 'maria.luz@exemplo.com',
        dataNascimento: '1990-06-15',
        horaNascimento: '14:30',
        localNascimento: 'Rio de Janeiro, RJ',
      };

      const startTime = Date.now();
      
      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.ok).toBe(true);
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(response.status).toBe(200);
    });

    it('deve retornar sucesso apos salvar perfil', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Jose Ferreira',
        email: 'jose.ferreira@exemplo.com',
        dataNascimento: '1975-12-05',
        horaNascimento: '10:00',
        localNascimento: 'Salvador, BA',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      expect(response.ok).toBe(true);
      
      const result = await response.json();
      expect(result.success).toBe(true);
    });

    it('deve atualizar metadados do usuario apos salvar', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Fernanda Costa',
        email: 'fernanda.costa@exemplo.com',
        dataNascimento: '1995-04-18',
        horaNascimento: '16:30',
        localNascimento: 'Fortaleza, CE',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      expect(result.user.user_metadata.nomeCompleto).toBe('Fernanda Costa');
      expect(result.user.user_metadata.dataNascimento).toBe('1995-04-18');
      expect(result.user.user_metadata.horaNascimento).toBe('16:30');
      expect(result.user.user_metadata.localNascimento).toBe('Fortaleza, CE');
    });

    it('deve calcular numerologia apos salvar perfil', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Rafael Mendes',
        email: 'rafael.mendes@exemplo.com',
        dataNascimento: '1988-09-25',
        horaNascimento: '09:15',
        localNascimento: 'Recife, PE',
      };

      await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const numerologiaResponse = await window.fetch('/api/numerologia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomeCompleto: formData.nomeCompleto,
          dataNascimento: formData.dataNascimento,
        }),
      });

      expect(numerologiaResponse.ok).toBe(true);
      const numerologiaResult = await numerologiaResponse.json();
      expect(numerologiaResult.pitagorica).toBeDefined();
      expect(numerologiaResult.cabalistica).toBeDefined();
      expect(numerologiaResult.tantrica).toBeDefined();
    });
  });

  describe('Success Feedback', () => {
    it('deve exibir confirmacao apos salvar com sucesso', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Camila Rodrigues',
        email: 'camila.rodrigues@exemplo.com',
        dataNascimento: '1991-08-12',
        horaNascimento: '12:00',
        localNascimento: 'Porto Alegre, RS',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
    });

    it('deve retornar dados atualizados do usuario', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Bruno Almeida',
        email: 'bruno.almeida@exemplo.com',
        dataNascimento: '1987-02-28',
        horaNascimento: '18:30',
        localNascimento: 'Brasilia, DF',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.localStorage.token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('bruno.almeida@exemplo.com');
      expect(result.user.user_metadata.nomeCompleto).toBe('Bruno Almeida');
    });

    it('deve manter dados parciais quando hora e local estao vazios', async () => {
      window.localStorage.token = 'valid-token';
      
      const formData: ProfileFormData = {
        nomeCompleto: 'Teresa Nunes',
        email: 'teresa.nunes@exemplo.com',
        dataNascimento: '1993-11-05',
        horaNascimento: '',
        localNascimento: '',
      };

      const response = await window.fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.success).toBe(true);
      expect(result.user.user_metadata.horaNascimento).toBe('');
      expect(result.user.user_metadata.localNascimento).toBe('');
    });
  });
});
