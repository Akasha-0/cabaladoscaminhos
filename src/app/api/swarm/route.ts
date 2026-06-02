import { NextRequest, NextResponse } from 'next/server';
import { getSwarm, type AgentRole, type AgentTask } from '@/lib/swarm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SwarmRequest {
  action: 'start' | 'stop' | 'run' | 'status' | 'identify-gaps';
  agent?: AgentRole;
  task?: AgentTask;
}

// fallow-ignore-next-line complexity
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SwarmRequest;
    const swarm = getSwarm();

    switch (body.action) {
      case 'start': {
        await swarm.start();
        return NextResponse.json({ status: 'started', state: swarm.getState() });
      }

      case 'stop': {
        swarm.stop();
        return NextResponse.json({ status: 'stopped', state: swarm.getState() });
      }

      case 'run': {
        if (!body.agent || !body.task) {
          return NextResponse.json({ error: 'agent e task são obrigatórios' }, { status: 400 });
        }
        const result = await swarm.executeAgent(body.agent, body.task);
        return NextResponse.json({ result, state: swarm.getState() });
      }

      case 'status': {
        return NextResponse.json({ state: swarm.getState() });
      }

      case 'identify-gaps': {
        // Returns knowledge gaps
        return NextResponse.json({ message: 'Verificar via /api/swarm/knowledge' });
      }

      default:
        return NextResponse.json({ error: 'action inválida' }, { status: 400 });
    }
  } catch (error) {
    console.error('[API /swarm] Error:', error);
    return NextResponse.json(
      { error: 'Erro no swarm', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  const swarm = getSwarm();
  return NextResponse.json({
    name: 'Swarm API',
    version: '1.0',
    description: 'Controla o swarm de 12 agentes especialistas',
    state: swarm.getState(),
    endpoints: {
      'POST /api/swarm': {
        body: {
          action: "'start' | 'stop' | 'run' | 'status'",
          agent: 'AgentRole (quando action=run)',
          task: 'AgentTask (quando action=run)',
        },
      },
    },
    agents: [
      'orixa-specialist',
      'odu-specialist',
      'tantra-specialist',
      'chakra-specialist',
      'numerology-specialist',
      'astrology-specialist',
      'wicca-specialist',
      'flora-specialist',
      'xing-specialist',
      'sexuality-specialist',
      'coherence-validator',
      'prompt-engineer',
    ],
  });
}
