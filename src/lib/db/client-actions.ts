// ============================================================
// CLIENT ACTIONS - Cabala Dos Caminhos
// Cockpit Oracular - Client Management
// ============================================================

import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for creating a client
const createClientSchema = z.object({
  fullName: z.string().min(1, 'Nome completo é obrigatório'),
  birthDate: z.string().datetime({ message: 'Data de nascimento inválida' }),
  birthTime: z.string().optional(),
  birthCity: z.string().optional(),
  birthState: z.string().optional(),
  birthCountry: z.string().optional(),
  userId: z.string().min(1, 'userId é obrigatório'),
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
 */
export async function listClients() {
  return prisma.client.findMany({
    orderBy: { createdAt: 'desc' },
  });
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
export async function saveClientMaps(
  clientId: string,
  maps: SaveClientMapsInput
) {
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
