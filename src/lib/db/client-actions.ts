// ============================================================
// CLIENT ACTIONS - Cabala Dos Caminhos
// Cockpit Oracular - Client Management
// ============================================================
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Schema for creating a client
// Sem `userId`: o modelo Client não armazena dono por-operador (Doc 16 §2.2);
// a autorização vem do Operator autenticado na rota, não de um campo no corpo.
const createClientSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  birthDate: z.string().datetime({ message: 'Data de nascimento inválida' }),
  birthTime: z.string().optional(),
  birthCity: z.string().optional(),
  birthState: z.string().optional(),
  birthCountry: z.string().optional(),
});

// Schema for updating a client
const updateClientSchema = z.object({
  fullName: z.string().min(1).optional(),
  birthDate: z.string().datetime().optional(),
  birthTime: z.string().optional(),
  birthCity: z.string().optional(),
  birthState: z.string().optional(),
  birthCountry: z.string().optional(),
});

// Schema for saving calculation maps
const saveClientMapsSchema = z.object({
  astrologyMap: z.record(z.unknown()).optional(),
  kabalisticMap: z.record(z.unknown()).optional(),
  tantricMap: z.record(z.unknown()).optional(),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type SaveClientMapsInput = z.infer<typeof saveClientMapsSchema>;

// ============================================================
// CLIENT CRUD OPERATIONS
// ============================================================

/**
 * Creates a new client with optional calculation maps
 */
export async function createClient(input: CreateClientInput) {
  const data = createClientSchema.parse(input);

  return prisma.client.create({
    data: {
      fullName: data.fullName,
      birthDate: new Date(data.birthDate),
      birthTime: data.birthTime,
      birthCity: data.birthCity,
      birthState: data.birthState,
      birthCountry: data.birthCountry,
    },
  });
}

/**
 * Server action (Onda C.4): cria cliente + calcula 4 mapas (Doc 16 §2 + Doc 11).
 * Retorna { ok: true, id } | { ok: false, error }.
 *
 * Os 4 mapas são cacheados no Client (astrologyMap, kabalisticMap, tantricMap, oduBirth)
 * conforme Doc 04 §1: cálculo único no cadastro, reusado em todas as leituras futuras.
 *
 * Mapas:
 *   - Astrologia: getBirthChart (lib/astrologia) — requer lat/lng/timezone.
 *     Se ausentes, devolve mapa simplificado (sun/moon/asc estimados por default).
 *   - Cabala: buildKabalisticMap (lib/calculators/numerology-kabalah) — fullName + birthDate.
 *   - Tântrica: buildTantricMap (lib/calculators/numerology-tantric) — birthDate.
 *   - Odu: calculateBirthOdu (lib/calculators/odu-birth) — birthDate.
 */
export type CreateClientWithMapsInput = {
  fullName: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthState: string;
  birthCountry: string;
  birthLatitude?: number;
  birthLongitude?: number;
  birthTimezone?: string;
  notes?: string;
};

export type CreateClientResult = { ok: true; id: string } | { ok: false; error: string };

export async function createClientWithMaps(
  input: CreateClientWithMapsInput
): Promise<CreateClientResult> {
  try {
    // Lazy imports para evitar custo de boot no módulo (estes arquivos não são leves)
    const { buildKabalisticMap } = await import('@/lib/calculators/numerology-kabalah');
    const { buildTantricMap } = await import('@/lib/calculators/numerology-tantric');
    const { calculateBirthOdu } = await import('@/lib/calculators/odu-birth');
    const { getBirthChart } = await import('@/lib/astrologia/birth-chart');

    // Cálculo dos 4 mapas
    let astrologyMap: unknown = null;
    try {
      if (input.birthLatitude != null && input.birthLongitude != null) {
        astrologyMap = getBirthChart({
          date: input.birthDate,
          time: input.birthTime,
          latitude: input.birthLatitude,
          longitude: input.birthLongitude,
          timezone: input.birthTimezone ?? 'UTC',
        });
      } else {
        astrologyMap = {
          note: 'Coordenadas ausentes; mapa simplificado. Preencha lat/lng para refinar.',
          sun: '—',
          moon: '—',
          ascendant: '—',
        };
      }
    } catch (err) {
      astrologyMap = { error: 'Falha ao calcular mapa astral', detail: String(err) };
    }

    let kabalisticMap: unknown;
    let tantricMap: unknown;
    let oduMap: unknown;
    try {
      kabalisticMap = buildKabalisticMap(input.fullName, input.birthDate);
    } catch (err) {
      kabalisticMap = { error: 'Falha ao calcular mapa cabalístico', detail: String(err) };
    }
    try {
      tantricMap = buildTantricMap(input.birthDate);
    } catch (err) {
      tantricMap = { error: 'Falha ao calcular mapa tântrico', detail: String(err) };
    }
    try {
      oduMap = calculateBirthOdu(input.birthDate);
    } catch (err) {
      oduMap = { error: 'Falha ao calcular Odu de Nascimento', detail: String(err) };
    }

    const created = await prisma.client.create({
      data: {
        fullName: input.fullName,
        birthDate: new Date(input.birthDate),
        birthTime: input.birthTime,
        birthCity: input.birthCity,
        birthState: input.birthState,
        birthCountry: input.birthCountry,
        birthLatitude: input.birthLatitude ?? null,
        birthLongitude: input.birthLongitude ?? null,
        birthTimezone: input.birthTimezone ?? null,
        notes: input.notes ?? null,
        astrologyMap: (astrologyMap ?? null) as object | null,
        kabalisticMap: (kabalisticMap ?? null) as object | null,
        tantricMap: (tantricMap ?? null) as object | null,
        oduBirth: (oduMap ?? null) as object | null,
      },
      select: { id: true },
    });

    return { ok: true, id: created.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Erro desconhecido' };
  }
}

/**
 * Gets a client by ID
 */
export async function getClient(clientId: string) {
  return prisma.client.findUnique({
    where: { id: clientId },
    include: {
      readings: {
        include: {
          report: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

/**
 * Lists all clients (for oraculista dashboard)
 * @deprecated use getClientsByOperator (Doc 16 AD-03)
 */
export async function listClients() {
  return prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Lista os consulentes que o Operator autenticado atendeu (Doc 16 AD-03).
 * O modelo Client não tem operatorId direto; filtra via readings.distinct(clientId).
 */
export async function getClientsByOperator(operatorId: string) {
  const readings = await prisma.reading.findMany({
    where: { operatorId },
    select: {
      clientId: true,
      client: { select: { id: true, fullName: true, birthDate: true } },
    },
    distinct: ['clientId'],
    orderBy: { date: 'desc' },
  });
  return readings.map((r) => r.client);
}

/**
 * Updates a client
 */
export async function updateClient(clientId: string, input: UpdateClientInput) {
  const data = updateClientSchema.parse(input);

  return prisma.client.update({
    where: { id: clientId },
    data: {
      ...(data.fullName && { fullName: data.fullName }),
      ...(data.birthDate && { birthDate: new Date(data.birthDate) }),
      ...(data.birthTime !== undefined && { birthTime: data.birthTime }),
      ...(data.birthCity !== undefined && { birthCity: data.birthCity }),
      ...(data.birthState !== undefined && { birthState: data.birthState }),
      ...(data.birthCountry !== undefined && { birthCountry: data.birthCountry }),
    },
  });
}

/**
 * Saves calculation maps for a client (Numerologia, Astrologia, Tântrica)
 */
export async function saveClientMaps(clientId: string, maps: SaveClientMapsInput) {
  const data = saveClientMapsSchema.parse(maps);

  return prisma.client.update({
    where: { id: clientId },
    data: {
      ...(data.astrologyMap && { astrologyMap: data.astrologyMap as object }),
      ...(data.kabalisticMap && { kabalisticMap: data.kabalisticMap as object }),
      ...(data.tantricMap && { tantricMap: data.tantricMap as object }),
    },
  });
}

/**
 * Deletes a client and all related readings
 */
export async function deleteClient(clientId: string) {
  return prisma.client.delete({
    where: { id: clientId },
  });
}

/**
 * Searches clients by name
 */
export async function searchClients(query: string) {
  return prisma.client.findMany({
    where: {
      fullName: {
        contains: query,
        mode: 'insensitive',
      },
    },
    orderBy: { fullName: 'asc' },
  });
}
