// ============================================================
// DASHBOARD WORKFLOW API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const WorkflowCategorySchema = z.enum(['ritual', 'divinatory', 'calculation', 'analysis', 'manifestation', 'healing']);
const WorkflowQuerySchema = z.object({
  categoria: WorkflowCategorySchema.optional(),
  ativo: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  includeSteps: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
});

const TriggerWorkflowSchema = z.object({
  workflowId: z.string().min(1, 'workflowId é obrigatório'),
  parametros: z.record(z.any()).optional(),
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
});

// ─── Type Definitions ───────────────────────────────────────────────────────
interface WorkflowStep {
  id: string;
  nome: string;
  tipo: 'input' | 'processing' | 'output';
  status: 'pending' | 'running' | 'completed' | 'failed';
  duracaoMs?: number;
  sefirot?: string[];
  chakra?: string;
}

interface Workflow {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  ativo: boolean;
  ultimaExecucao: string | null;
  passos: WorkflowStep[];
  sefirot: string[];
  orixa?: string;
  chakra?: string;
  duration?: string;
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

export const dynamic = 'force-dynamic';

// ─── Mock Data Store ───────────────────────────────────────────────────────
const mockWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    nome: 'Ritual de Manifestação Completo',
    descricao: 'Workflow completo para ritual de manifestação com visualização e gratidão.',
    categoria: 'ritual',
    ativo: true,
    ultimaExecucao: '2026-05-29T10:30:00Z',
    passos: [
      { id: 'step-1', nome: 'Preparar ambiente', tipo: 'input', status: 'completed', duracaoMs: 5000, sefirot: ['Malkuth'], chakra: 'Muladhara (1º)' },
      { id: 'step-2', nome: 'Meditação guiada', tipo: 'processing', status: 'completed', duracaoMs: 300000, sefirot: ['Tipheret'], chakra: 'Anahata (4º)' },
      { id: 'step-3', nome: 'Visualização criativa', tipo: 'processing', status: 'completed', duracaoMs: 180000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
      { id: 'step-4', nome: 'Afirmações', tipo: 'output', status: 'completed', duracaoMs: 60000, sefirot: ['Netzach'], chakra: 'Vishuddha (5º)' },
      { id: 'step-5', nome: 'Registro de gratidão', tipo: 'output', status: 'completed', duracaoMs: 30000, sefirot: ['Chesed'], chakra: 'Anahata (4º)' },
    ],
    sefirot: ['Chokhmah', 'Chesed', 'Tipheret', 'Netzach', 'Malkuth'],
    orixa: 'Oxum',
    chakra: 'Sete chakras',
    duration: '60 minutos',
  },
  {
    id: 'wf-002',
    nome: 'Leitura Tarot Profissional',
    descricao: 'Análise completa de tarot com spreads personalizados e interpretação IA.',
    categoria: 'divinatory',
    ativo: true,
    ultimaExecucao: '2026-05-28T15:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Shuffle e corte', tipo: 'input', status: 'completed', duracaoMs: 10000, sefirot: ['Yesod'], chakra: 'Svadhisthana (2º)' },
      { id: 'step-2', nome: 'Spread layout', tipo: 'processing', status: 'completed', duracaoMs: 15000, sefirot: ['Tipheret'], chakra: 'Ajna (6º)' },
      { id: 'step-3', nome: 'Análise cards', tipo: 'processing', status: 'completed', duracaoMs: 45000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
      { id: 'step-4', nome: 'Interpretação narrativa', tipo: 'output', status: 'completed', duracaoMs: 60000, sefirot: ['Binah'], chakra: 'Sahasrara (7º)' },
    ],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Tipheret', 'Yesod', 'Malkuth'],
    chakra: 'Ajna (6º)',
    duration: '20 minutos',
  },
  {
    id: 'wf-003',
    nome: 'Cálculo Mapa Natal',
    descricao: 'Geração completa de mapa astral com posições planetárias e aspectos.',
    categoria: 'calculation',
    ativo: true,
    ultimaExecucao: '2026-05-27T09:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Validação dados', tipo: 'input', status: 'completed', duracaoMs: 2000, sefirot: ['Malkuth'], chakra: 'Muladhara (1º)' },
      { id: 'step-2', nome: 'Cálculo casas', tipo: 'processing', status: 'completed', duracaoMs: 5000, sefirot: ['Chesed'], chakra: 'Manipura (3º)' },
      { id: 'step-3', nome: 'Posições planetárias', tipo: 'processing', status: 'completed', duracaoMs: 8000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
      { id: 'step-4', nome: 'Aspectos solares', tipo: 'processing', status: 'completed', duracaoMs: 10000, sefirot: ['Tipheret'], chakra: 'Anahata (4º)' },
      { id: 'step-5', nome: 'Geração relatório', tipo: 'output', status: 'completed', duracaoMs: 15000, sefirot: ['Kether'], chakra: 'Sahasrara (7º)' },
    ],
    sefirot: ['Kether', 'Chokhmah', 'Chesed', 'Tipheret', 'Malkuth'],
    chakra: 'Sete chakras',
    duration: '15 minutos',
  },
  {
    id: 'wf-004',
    nome: 'Análise Odu Ifá',
    descricao: 'Leitura completa de Odu Ifá com祭祀 e orientações.',
    categoria: 'divinatory',
    ativo: true,
    ultimaExecucao: '2026-05-26T14:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Preparar ekuele', tipo: 'input', status: 'completed', duracaoMs: 3000, sefirot: ['Yesod'], chakra: 'Svadhisthana (2º)' },
      { id: 'step-2', nome: 'Lançamento/opinões', tipo: 'processing', status: 'completed', duracaoMs: 10000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
      { id: 'step-3', nome: 'Interpretação Odu', tipo: 'processing', status: 'completed', duracaoMs: 60000, sefirot: ['Binah'], chakra: 'Anahata (4º)' },
      { id: 'step-4', nome: 'Quizilas e preceitos', tipo: 'output', status: 'completed', duracaoMs: 30000, sefirot: ['Gevurah'], chakra: 'Manipura (3º)' },
      { id: 'step-5', nome: 'Orientações finais', tipo: 'output', status: 'completed', duracaoMs: 20000, sefirot: ['Chesed'], chakra: 'Anahata (4º)' },
    ],
    sefirot: ['Chokhmah', 'Binah', 'Chesed', 'Gevurah', 'Yesod'],
    chakra: 'Anahata (4º)',
    duration: '25 minutos',
  },
  {
    id: 'wf-005',
    nome: 'Ritual de Cura Ancestral',
    descricao: 'Workflow para cura de padrões familiares eancestrais.',
    categoria: 'healing',
    ativo: true,
    ultimaExecucao: '2026-05-25T19:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Conexão ancestral', tipo: 'input', status: 'completed', duracaoMs: 10000, sefirot: ['Yesod', 'Malkuth'], chakra: 'Muladhara (1º)' },
      { id: 'step-2', nome: 'Identificação de padrões', tipo: 'processing', status: 'completed', duracaoMs: 90000, sefirot: ['Tipheret'], chakra: 'Anahata (4º)' },
      { id: 'step-3', nome: 'Ritual de libertação', tipo: 'processing', status: 'completed', duracaoMs: 120000, sefirot: ['Gevurah'], chakra: 'Manipura (3º)' },
      { id: 'step-4', nome: 'Integração energética', tipo: 'output', status: 'completed', duracaoMs: 60000, sefirot: ['Chesed'], chakra: 'Anahata (4º)' },
    ],
    sefirot: ['Yesod', 'Malkuth', 'Chesed', 'Gevurah', 'Tipheret'],
    orixa: 'Omolu',
    chakra: 'Muladhara (1º)',
    duration: '45 minutos',
  },
  {
    id: 'wf-006',
    nome: 'Meditação dos Chakras',
    descricao: 'Ativação e harmonização dos sete chakras principais.',
    categoria: 'manifestation',
    ativo: true,
    ultimaExecucao: '2026-05-24T08:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Ancoramento', tipo: 'input', status: 'completed', duracaoMs: 5000, sefirot: ['Malkuth'], chakra: 'Muladhara (1º)' },
      { id: 'step-2', nome: 'Ativação Muladhara', tipo: 'processing', status: 'completed', duracaoMs: 30000, sefirot: ['Malkuth'], chakra: 'Muladhara (1º)' },
      { id: 'step-3', nome: 'Ativação Svadhisthana', tipo: 'processing', status: 'completed', duracaoMs: 30000, sefirot: ['Yesod'], chakra: 'Svadhisthana (2º)' },
      { id: 'step-4', nome: 'Ativação Manipura', tipo: 'processing', status: 'completed', duracaoMs: 30000, sefirot: ['Gevurah'], chakra: 'Manipura (3º)' },
      { id: 'step-5', nome: 'Ativação Anahata', tipo: 'processing', status: 'completed', duracaoMs: 30000, sefirot: ['Tipheret'], chakra: 'Anahata (4º)' },
      { id: 'step-6', nome: 'Ativação Vishuddha', tipo: 'processing', status: 'completed', duracaoMs: 30000, sefirot: ['Netzach'], chakra: 'Vishuddha (5º)' },
      { id: 'step-7', nome: 'Ativação Ajna', tipo: 'processing', status: 'completed', duracaoMs: 30000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
      { id: 'step-8', nome: 'Iluminação Sahasrara', tipo: 'output', status: 'completed', duracaoMs: 60000, sefirot: ['Kether'], chakra: 'Sahasrara (7º)' },
    ],
    sefirot: ['Kether', 'Chokhmah', 'Gevurah', 'Tipheret', 'Netzach', 'Yesod', 'Malkuth'],
    chakra: 'Sete chakras',
    duration: '35 minutos',
  },
  {
    id: 'wf-007',
    nome: 'Análise Correlação Cruzada',
    descricao: 'Análise de correlações entre numerologia, astrologia e Orixás.',
    categoria: 'analysis',
    ativo: true,
    ultimaExecucao: '2026-05-23T11:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Extração dados numerológicos', tipo: 'input', status: 'completed', duracaoMs: 5000, sefirot: ['Malkuth'], chakra: 'Sahasrara (7º)' },
      { id: 'step-2', nome: 'Extração dados astrológicos', tipo: 'input', status: 'completed', duracaoMs: 5000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
      { id: 'step-3', nome: 'Identificação Orixá', tipo: 'processing', status: 'completed', duracaoMs: 15000, sefirot: ['Binah'], chakra: 'Anahata (4º)' },
      { id: 'step-4', nome: 'Análise convergências', tipo: 'processing', status: 'completed', duracaoMs: 30000, sefirot: ['Tipheret'], chakra: 'Anahata (4º)' },
      { id: 'step-5', nome: 'Geração relatório', tipo: 'output', status: 'completed', duracaoMs: 20000, sefirot: ['Kether'], chakra: 'Sahasrara (7º)' },
    ],
    sefirot: ['Kether', 'Chokhmah', 'Binah', 'Tipheret', 'Malkuth'],
    chakra: 'Sete chakras',
    duration: '12 minutos',
  },
];

// ─── API Routes ─────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const parseResult = WorkflowQuerySchema.safeParse({
      categoria: searchParams.get('categoria'),
      ativo: searchParams.get('ativo'),
      includeSteps: searchParams.get('includeSteps'),
      limit: searchParams.get('limit'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { categoria, ativo, includeSteps, limit } = parseResult.data;
    let workflows = [...mockWorkflows];

    // Apply filters
    if (categoria) {
      workflows = workflows.filter(w => w.categoria === categoria);
    }

    if (ativo !== undefined) {
      workflows = workflows.filter(w => w.ativo === ativo);
    }

    if (limit) {
      workflows = workflows.slice(0, limit);
    }

    // Filter steps if not requested
    const response = workflows.map(w => {
      if (!includeSteps) {
        const { passos, ...rest } = w;
        return rest;
      }
      return w;
    });

    return NextResponse.json({
      success: true,
      workflows: response,
      count: response.length,
      total: mockWorkflows.length,
      categories: {
        ritual: mockWorkflows.filter(w => w.categoria === 'ritual').length,
        divinatory: mockWorkflows.filter(w => w.categoria === 'divinatory').length,
        calculation: mockWorkflows.filter(w => w.categoria === 'calculation').length,
        analysis: mockWorkflows.filter(w => w.categoria === 'analysis').length,
        manifestation: mockWorkflows.filter(w => w.categoria === 'manifestation').length,
        healing: mockWorkflows.filter(w => w.categoria === 'healing').length,
      },
    });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao buscar workflows',
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = TriggerWorkflowSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Payload inválido',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const workflow = mockWorkflows.find(w => w.id === parseResult.data.workflowId);

    if (!workflow) {
      return NextResponse.json({
        success: false,
        error: 'Workflow não encontrado',
        validIds: mockWorkflows.map(w => w.id),
      }, { status: 404 });
    }

    // Simulate workflow execution
    const execution: WorkflowExecution = {
      id: `exec-${Date.now()}`,
      workflowId: workflow.id,
      status: 'queued',
      startedAt: new Date().toISOString(),
      completedAt: null,
      resultado: {
        workflow,
        parametros: parseResult.data.parametros,
        sefirot: parseResult.data.sefirot || workflow.sefirot,
        orixa: parseResult.data.orixa || workflow.orixa,
      },
    };

    return NextResponse.json({
      success: true,
      execution,
      message: 'Workflow acionado com sucesso',
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Erro ao acionar workflow',
    }, { status: 500 });
  }
}