// ============================================================
// MESA REAL API - Cabala Dos Caminhos
// Cockpit Oracular - Client Management Routes
// ============================================================
import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { requireOperator } from '@/lib/auth/operator-session';
import {
  createClientWithMaps,
  getClient,
  listClients,
  updateClient,
  deleteClient,
  searchClients,
  saveClientMaps,
} from '@/lib/db/client-actions';
import { createLogger, generateRequestId } from '@/lib/logging';

// ============================================================
// CLIENT CRUD ROUTES
// Todas exigem um Operator autenticado (Doc 16 AD-03 / Doc 09 §5.2):
// dados de consulente são confidenciais e nunca devem ser acessíveis
// sem sessão. O operador vem da sessão — nunca do corpo da requisição.
// ============================================================

// Schema for client creation (sem userId: a identidade vem da sessão, e o
// modelo Client não é dono por-operador — Doc 16 §2.2 / AD-03).
const createClientSchema = z.object({
  fullName: z.string().min(1),
  birthDate: z.string().datetime(),
  birthTime: z.string().optional(),
  birthCity: z.string().optional(),
  birthState: z.string().optional(),
  birthCountry: z.string().optional(),
  birthLatitude: z.number().optional(),
  birthLongitude: z.number().optional(),
  birthTimezone: z.string().optional(),
  notes: z.string().optional(),
  consentGiven: z.boolean().optional(),
});

// ============================================================
// GET /api/mesa-real/clients - List all clients
// ============================================================
export async function GET(request: NextRequest) {
  try {
    const auth = await requireOperator(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const clientId = searchParams.get('clientId');

    // Search by name
    if (query) {
      const results = await searchClients(query);
      return NextResponse.json({ clients: results });
    }

    // Get single client
    if (clientId) {
      const client = await getClient(clientId);
      if (!client) {
        return NextResponse.json({ error: 'Cliente não encontrado' }, { status: 404 });
      }
      return NextResponse.json({ client });
    }

    // List all clients
    const clients = await listClients();
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('GET /api/mesa-real/clients error:', error);
    return NextResponse.json({ error: 'Erro ao buscar clientes' }, { status: 500 });
  }
}

// ============================================================
// POST /api/mesa-real/clients - Create a new client
// ============================================================
export async function POST(request: NextRequest) {
  try {
    const auth = await requireOperator(request);
    if (auth instanceof NextResponse) return auth;
    const operator = auth;
    const requestId = generateRequestId();
    const log = createLogger(requestId, '/api/mesa-real/clients');
    const body = await request.json();
    const data = createClientSchema.parse(body);

    // Calcular 4 mapas automaticamente no cadastro (Onda D - Wire 4 Mapas)
    const result = await createClientWithMaps({
      fullName: data.fullName,
      birthDate: data.birthDate,
      birthTime: data.birthTime ?? '',
      birthCity: data.birthCity ?? '',
      birthState: data.birthState ?? '',
      birthCountry: data.birthCountry ?? '',
      birthLatitude: data.birthLatitude,
      birthLongitude: data.birthLongitude,
      birthTimezone: data.birthTimezone,
      notes: data.notes,
      consentGiven: data.consentGiven,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: 'Erro ao criar cliente com mapas', detail: result.error },
        { status: 500 }
      );
    }
    const client = await getClient(result.id);
    if (!client)
      return NextResponse.json({ error: 'Cliente não encontrado após criação' }, { status: 500 });
    log.info('client.created', { operatorId: operator.id, clientId: client.id });
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    console.error('POST /api/mesa-real/clients error:', error);
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 });
  }
}

// ============================================================
// PATCH /api/mesa-real/clients - Update client maps
// ============================================================
export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireOperator(request);
    if (auth instanceof NextResponse) return auth;
    const operator = auth;
    const requestId = generateRequestId();
    const log = createLogger(requestId, '/api/mesa-real/clients');

    const body = await request.json();
    const { action, clientId, ...data } = body;

    if (!clientId) {
      return NextResponse.json({ error: 'clientId é obrigatório' }, { status: 400 });
    }

    switch (action) {
      case 'updateMaps': {
        const mapsData = await saveClientMaps(clientId, {
          astrologyMap: data.astrologyMap,
          kabalisticMap: data.kabalisticMap,
          tantricMap: data.tantricMap,
        });
        return NextResponse.json({ client: mapsData });
      }

      case 'update': {
        const client = await updateClient(clientId, data);
        log.info('client.updated', { operatorId: operator.id, clientId });
        return NextResponse.json({ client });
      }

      default:
        return NextResponse.json({ error: 'Ação desconhecida' }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      );
    }
    console.error('PATCH /api/mesa-real/clients error:', error);
    return NextResponse.json({ error: 'Erro ao atualizar cliente' }, { status: 500 });
  }
}

// ============================================================
// DELETE /api/mesa-real/clients - Delete a client
// ============================================================
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireOperator(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json({ error: 'clientId é obrigatório' }, { status: 400 });
    }

    await deleteClient(clientId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/mesa-real/clients error:', error);
    return NextResponse.json({ error: 'Erro ao deletar cliente' }, { status: 500 });
  }
}
