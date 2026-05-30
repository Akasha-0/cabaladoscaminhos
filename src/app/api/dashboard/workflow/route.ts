// ============================================================
// DASHBOARD WORKFLOW API - CABALA DOS CAMINHOS
// ============================================================
// Workflow management
// - GET: List available workflows
// - POST: Trigger a workflow execution
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface WorkflowStep {
  id: string;
  nome: string;
  tipo: 'input' | 'processing' | 'output';
  status: 'pending' | 'running' | 'completed' | 'failed';
  duracaoMs?: number;
}

interface Workflow {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'ritual' | 'divinatory' | 'calculation' | 'analysis';
  ativo: boolean;
  ultimaExecucao: string | null;
  passos: WorkflowStep[];
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt: string | null;
  resultado: Record<string, unknown> | null;
}

interface TriggerRequest {
  workflowId: string;
  parametros?: Record<string, unknown>;
}

const mockWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    nome: 'Ritual de Manifestacao Completo',
    descricao: 'Workflow completo para ritual de manifestacao com visualizacao e gratitude.',
    categoria: 'ritual',
    ativo: true,
    ultimaExecucao: '2026-05-29T10:30:00Z',
    passos: [
      { id: 'step-1', nome: 'Preparar ambiente', tipo: 'input', status: 'completed', duracaoMs: 5000 },
      { id: 'step-2', nome: 'Meditacao guiada', tipo: 'processing', status: 'completed', duracaoMs: 300000 },
      { id: 'step-3', nome: 'Visualizacao criativa', tipo: 'processing', status: 'completed', duracaoMs: 180000 },
      { id: 'step-4', nome: 'Afirmacoes', tipo: 'output', status: 'completed', duracaoMs: 60000 },
      { id: 'step-5', nome: 'Registro de gratidao', tipo: 'output', status: 'completed', duracaoMs: 30000 },
    ],
  },
  {
    id: 'wf-002',
    nome: 'Leitura Tarot Profissional',
    descricao: 'Analise completa de tarot com spreads personalizados e interpretacao IA.',
    categoria: 'divinatory',
    ativo: true,
    ultimaExecucao: '2026-05-28T15:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Shuffle e corte', tipo: 'input', status: 'completed', duracaoMs: 10000 },
      { id: 'step-2', nome: 'Spread layout', tipo: 'processing', status: 'completed', duracaoMs: 15000 },
      { id: 'step-3', nome: 'Analise cards', tipo: 'processing', status: 'completed', duracaoMs: 45000 },
      { id: 'step-4', nome: 'Interpretacao narrativa', tipo: 'output', status: 'completed', duracaoMs: 60000 },
    ],
  },
  {
    id: 'wf-003',
    nome: 'Calculo Mapa Natal',
    descricao: 'Geracao completa de mapa astral com posicoes planetarias e aspectos.',
    categoria: 'calculation',
    ativo: true,
    ultimaExecucao: '2026-05-27T09:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Validacao dados', tipo: 'input', status: 'completed', duracaoMs: 2000 },
      { id: 'step-2', nome: 'Calculo casas', tipo: 'processing', status: 'completed', duracaoMs: 5000 },
      { id: 'step-3', nome: 'Posicoes planetarias', tipo: 'processing', status: 'completed', duracaoMs: 8000 },
      { id: 'step-4', nome: 'Aspectos astrais', tipo: 'processing', status: 'completed', duracaoMs: 12000 },
      { id: 'step-5', nome: 'Geracao SVG', tipo: 'output', status: 'completed', duracaoMs: 3000 },
    ],
  },
  {
    id: 'wf-004',
    nome: 'Analise Vibracional Odu',
    descricao: 'Analise spiritual profunda de Odu com correlacoes cabalisticas.',
    categoria: 'analysis',
    ativo: false,
    ultimaExecucao: '2026-05-20T14:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Identificacao Odu', tipo: 'input', status: 'completed', duracaoMs: 1000 },
      { id: 'step-2', nome: 'Analise tradicional', tipo: 'processing', status: 'completed', duracaoMs: 30000 },
      { id: 'step-3', nome: 'Correlacoes cabalisticas', tipo: 'processing', status: 'completed', duracaoMs: 45000 },
      { id: 'step-4', nome: 'Relatorio final', tipo: 'output', status: 'completed', duracaoMs: 15000 },
    ],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoria = searchParams.get('categoria');
  const ativo = searchParams.get('ativo');

  let workflows = [...mockWorkflows];

  if (categoria) {
    workflows = workflows.filter(wf => wf.categoria === categoria);
  }

  if (ativo === 'true') {
    workflows = workflows.filter(wf => wf.ativo);
  } else if (ativo === 'false') {
    workflows = workflows.filter(wf => !wf.ativo);
  }

  return NextResponse.json({
    workflows,
    total: workflows.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: TriggerRequest = await request.json();

    if (!body.workflowId) {
      return NextResponse.json(
        { error: 'workflowId is required' },
        { status: 400 }
      );
    }

    const workflow = mockWorkflows.find(wf => wf.id === body.workflowId);
    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    if (!workflow.ativo) {
      return NextResponse.json(
        { error: 'Workflow is not active' },
        { status: 400 }
      );
    }

    const execution: WorkflowExecution = {
      id: 'exec-' + Date.now(),
      workflowId: body.workflowId,
      status: 'queued',
      startedAt: new Date().toISOString(),
      completedAt: null,
      resultado: null,
    };

    return NextResponse.json({
      success: true,
      execution,
      message: 'Workflow triggered successfully',
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
