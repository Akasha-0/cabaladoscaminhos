/**
 * /api/export/manifesto — testes
 *
 * Estratégia: mockar auth (requireAkashaApi) + prisma para isolar a
 * lógica de geração do PDF e a resposta HTTP.
 *
 * Cobre:
 *   - 401 sem auth
 *   - 200 com PDF válido quando autenticado
 *   - Conteúdo do PDF tem nome e email do user
 *   - Content-Disposition inclui filename
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockRequireAkashaApi = vi.fn();
const mockUserFindUnique = vi.fn();
const mockBirthChartFindUnique = vi.fn();
const mockDailyReadingFindFirst = vi.fn();

vi.mock('@/lib/application/auth/akasha-guard', () => ({
  requireAkashaApi: (...args: unknown[]) => mockRequireAkashaApi(...args),
}));

vi.mock('@/lib/infrastructure/prisma', () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockUserFindUnique(...args) },
    birthChart: {
      findUnique: (...args: unknown[]) => mockBirthChartFindUnique(...args),
    },
    dailyReading: {
      findFirst: (...args: unknown[]) => mockDailyReadingFindFirst(...args),
    },
  },
}));

function makeRequest() {
  return new NextRequest('http://localhost/api/export/manifesto');
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/export/manifesto', () => {
  it('retorna 401 quando requireAkashaApi devolve erro', async () => {
    const { NextResponse } = await import('next/server');
    mockRequireAkashaApi.mockResolvedValue(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    );

    const { GET } = await import('./route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('retorna PDF válido quando autenticado', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    });
    mockUserFindUnique.mockResolvedValue({
      id: 'user-123',
      name: 'Test User',
      email: 'test@example.com',
      birthDate: new Date('1990-05-15'),
      birthTime: '14:30',
      birthCity: 'São Paulo',
      ichingMap: null,
    });
    mockBirthChartFindUnique.mockResolvedValue({
      astrologyMap: { sun: 'Touro' },
      kabalisticMap: { resumo: 'Cabalista nato' },
      tantricMap: null,
      oduBirth: null,
      ichingMap: null,
    });
    mockDailyReadingFindFirst.mockResolvedValue({
      hexagram: '1',
      climate: 'Criativo',
      date: new Date('2026-06-24'),
    });

    const { GET } = await import('./route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('application/pdf');

    const disposition = res.headers.get('Content-Disposition') ?? '';
    expect(disposition).toMatch(/attachment/);
    expect(disposition).toMatch(/\.pdf/);

    const buf = Buffer.from(await res.arrayBuffer());
    // PDF magic number
    expect(buf.slice(0, 4).toString()).toBe('%PDF');
    // PDF contains user name as text (jsPDF embeds as plain text)
    expect(buf.toString('latin1')).toContain('Test User');
  });

  it('funciona sem BirthChart (mapa ainda não calculado)', async () => {
    mockRequireAkashaApi.mockResolvedValue({
      id: 'user-456',
      email: 'nochart@example.com',
      name: 'No Chart',
    });
    mockUserFindUnique.mockResolvedValue({
      id: 'user-456',
      name: 'No Chart',
      email: 'nochart@example.com',
      birthDate: null,
      birthTime: null,
      birthCity: null,
      ichingMap: null,
    });
    mockBirthChartFindUnique.mockResolvedValue(null);
    mockDailyReadingFindFirst.mockResolvedValue(null);

    const { GET } = await import('./route');
    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const buf = Buffer.from(await res.arrayBuffer());
    expect(buf.slice(0, 4).toString()).toBe('%PDF');
    expect(buf.toString('latin1')).toContain('No Chart');
    // Mensagem amigável para ausência de mapa
    expect(buf.toString('latin1')).toContain('mapa');
  });
});