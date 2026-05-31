// ============================================================
// DASHBOARD WORKFLOW API - CABALA DOS CAMINHOS
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const SefirotSchema = z.enum([
  'Kether', 'Chokhmah', 'Binah', 'Chesed', 'Gevurah',
  'Tipheret', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
]);
const ChakraSchema = z.coerce.number().int().min(1).max(7);
const ElementSchema = z.enum(['Fogo', 'Água', 'Terra', 'Ar', 'Éter']);

const WorkflowCategorySchema = z.enum(['ritual', 'divinatory', 'calculation', 'analysis', 'manifestation', 'healing']);
const WorkflowQuerySchema = z.object({
  categoria: WorkflowCategorySchema.optional(),
  ativo: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  includeSteps: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  sefirot: SefirotSchema.optional(),
  chakra: ChakraSchema.optional(),
  element: ElementSchema.optional(),
  orixa: z.string().optional(),
});

const TriggerWorkflowSchema = z.object({
  workflowId: z.string().min(1, 'workflowId é obrigatório'),
  parametros: z.record(z.any()).optional(),
  sefirot: z.array(z.string()).optional(),
  orixa: z.string().optional(),
});

// ─── Spiritual Correlations for Workflow Categories ──────────────────────────────────────────
const WORKFLOW_SPIRITUAL_CORRELATIONS: Record<string, {
  sefirot: string[];
  chakra: number;
  element: string;
  orixa: string;
  affirmation: string;
  frequency: string;
}> = {
  ritual: {
    sefirot: ['Gevurah', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Ogum',
    affirmation: 'O ritual transforma minha energia',
    frequency: '528 Hz',
  },
  divinatory: {
    sefirot: ['Binah', 'Chokhmah'],
    chakra: 6,
    element: 'Água',
    orixa: 'Orunmilá',
    affirmation: 'A divincação revela verdades ocultas',
    frequency: '639 Hz',
  },
  calculation: {
    sefirot: ['Hod', 'Malkuth'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Orunmilá',
    affirmation: 'Os cálculos revelam padrões cósmicos',
    frequency: '741 Hz',
  },
  analysis: {
    sefirot: ['Binah', 'Hod'],
    chakra: 5,
    element: 'Ar',
    orixa: 'Oxalá',
    affirmation: 'A análise traz clareza',
    frequency: '741 Hz',
  },
  manifestation: {
    sefirot: ['Chokhmah', 'Chesed'],
    chakra: 6,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A manifestação cria minha realidade',
    frequency: '528 Hz',
  },
  healing: {
    sefirot: ['Chesed', 'Tipheret'],
    chakra: 4,
    element: 'Fogo',
    orixa: 'Oxum',
    affirmation: 'A cura flui através de mim',
    frequency: '528 Hz',
  },
};

// ─── Type Definitions ───────────────────────────────────────────────────────
interface WorkflowStep {
  id: string;
  nome: string;
  tipo: 'input' | 'processing' | 'output';
  status: 'pending' | 'running' | 'completed' | 'failed';
  duracaoMs?: number;
  sefirot?: string[];
  chakra?: string;
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
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
  spiritualCorrelations?: {
    sefirot: string[];
    chakra: number;
    element: string;
    orixa: string;
    affirmation: string;
    frequency: string;
  };
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
      { id: 'step-1', nome: 'Preparar ambiente', tipo: 'input', status: 'completed', duracaoMs: 5000, sefirot: ['Malkuth'], chakra: 'Muladhara (1º)', spiritualCorrelations: { sefirot: ['Malkuth'], chakra: 1, element: 'Terra', orixa: 'Ogum', affirmation: 'O ambiente está preparado', frequency: '174 Hz' } },
      { id: 'step-2', nome: 'Meditação guiada', tipo: 'processing', status: 'completed', duracaoMs: 300000, sefirot: ['Tipheret'], chakra: 'Anahata (4º)', spiritualCorrelations: { sefirot: ['Tipheret'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'A meditação me conecta', frequency: '528 Hz' } },
      { id: 'step-3', nome: 'Visualização criativa', tipo: 'processing', status: 'completed', duracaoMs: 180000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)', spiritualCorrelations: { sefirot: ['Chokhmah'], chakra: 6, element: 'Ar', orixa: 'Oxalá', affirmation: 'Visualizo minha realidade', frequency: '741 Hz' } },
      { id: 'step-4', nome: 'Afirmações', tipo: 'output', status: 'completed', duracaoMs: 60000, sefirot: ['Netzach'], chakra: 'Vishuddha (5º)', spiritualCorrelations: { sefirot: ['Netzach'], chakra: 5, element: 'Fogo', orixa: 'Oxum', affirmation: 'Minhas afirmações têm poder', frequency: '528 Hz' } },
      { id: 'step-5', nome: 'Registro de gratidão', tipo: 'output', status: 'completed', duracaoMs: 30000, sefirot: ['Chesed'], chakra: 'Anahata (4º)', spiritualCorrelations: { sefirot: ['Chesed'], chakra: 4, element: 'Fogo', orixa: 'Oxum', affirmation: 'Gratidão abre portas', frequency: '528 Hz' } },
    ],
    sefirot: ['Chokhmah', 'Chesed', 'Tipheret', 'Netzach', 'Malkuth'],
    orixa: 'Oxum',
    chakra: 'Sete chakras',
    duration: '60 minutos',
    spiritualCorrelations: WORKFLOW_SPIRITUAL_CORRELATIONS['ritual'],
  },
  {
    id: 'wf-002',
    nome: 'Análise de Mapa Natal',
    descricao: 'Workflow para análise completa do mapa astral com correlações cabalísticas.',
    categoria: 'analysis',
    ativo: true,
    ultimaExecucao: '2026-05-29T09:15:00Z',
    passos: [
      { id: 'step-1', nome: 'Coleta de dados', tipo: 'input', status: 'completed', duracaoMs: 2000, sefirot: ['Malkuth'], chakra: 'Muladhara (1º)' },
      { id: 'step-2', nome: 'Cálculo planetário', tipo: 'processing', status: 'completed', duracaoMs: 5000, sefirot: ['Hod'], chakra: 'Vishuddha (5º)' },
      { id: 'step-3', nome: 'Correlações Sefirot', tipo: 'processing', status: 'completed', duracaoMs: 10000, sefirot: ['Binah'], chakra: 'Ajna (6º)' },
      { id: 'step-4', nome: 'Geração de relatório', tipo: 'output', status: 'completed', duracaoMs: 3000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
    ],
    sefirot: ['Malkuth', 'Hod', 'Binah', 'Chokhmah'],
    chakra: 'Multiplos chakras',
    duration: '20 minutos',
    spiritualCorrelations: WORKFLOW_SPIRITUAL_CORRELATIONS['analysis'],
  },
  {
    id: 'wf-003',
    nome: 'Leitura de Tarot Oracle',
    descricao: 'Workflow para leitura de tarot com integração oracular.',
    categoria: 'divinatory',
    ativo: true,
    ultimaExecucao: '2026-05-29T08:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Definição da pergunta', tipo: 'input', status: 'completed', duracaoMs: 1000, sefirot: ['Hod'], chakra: 'Vishuddha (5º)' },
      { id: 'step-2', nome: 'Seleção das cartas', tipo: 'processing', status: 'completed', duracaoMs: 2000, sefirot: ['Binah'], chakra: 'Ajna (6º)' },
      { id: 'step-3', nome: 'Interpretação oracular', tipo: 'processing', status: 'completed', duracaoMs: 15000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
      { id: 'step-4', nome: 'Insights espirituais', tipo: 'output', status: 'completed', duracaoMs: 5000, sefirot: ['Kether'], chakra: 'Sahasrara (7º)' },
    ],
    sefirot: ['Hod', 'Binah', 'Chokhmah', 'Kether'],
    orixa: 'Orunmilá',
    chakra: 'Ajna (6º)',
    duration: '25 minutos',
    spiritualCorrelations: WORKFLOW_SPIRITUAL_CORRELATIONS['divinatory'],
  },
  {
    id: 'wf-004',
    nome: 'Cálculo Numerológico',
    descricao: 'Workflow para cálculo completo de numerologia cabalística.',
    categoria: 'calculation',
    ativo: true,
    ultimaExecucao: '2026-05-28T14:30:00Z',
    passos: [
      { id: 'step-1', nome: 'Coleta de nome e data', tipo: 'input', status: 'completed', duracaoMs: 1000, sefirot: ['Malkuth'], chakra: 'Muladhara (1º)' },
      { id: 'step-2', nome: 'Cálculo Pitagórico', tipo: 'processing', status: 'completed', duracaoMs: 3000, sefirot: ['Hod'], chakra: 'Vishuddha (5º)' },
      { id: 'step-3', nome: 'Cálculo Caldeu', tipo: 'processing', status: 'completed', duracaoMs: 3000, sefirot: ['Hod'], chakra: 'Vishuddha (5º)' },
      { id: 'step-4', nome: 'Correlações espirituais', tipo: 'output', status: 'completed', duracaoMs: 5000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
    ],
    sefirot: ['Malkuth', 'Hod', 'Chokhmah'],
    chakra: 'Vishuddha (5º)',
    duration: '12 minutos',
    spiritualCorrelations: WORKFLOW_SPIRITUAL_CORRELATIONS['calculation'],
  },
  {
    id: 'wf-005',
    nome: 'Ritual de Cura Energética',
    descricao: 'Workflow para ritual de cura com alinhamento de chakras.',
    categoria: 'healing',
    ativo: true,
    ultimaExecucao: '2026-05-28T10:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Diagnóstico energético', tipo: 'input', status: 'completed', duracaoMs: 10000, sefirot: ['Binah'], chakra: 'Ajna (6º)' },
      { id: 'step-2', nome: 'Limpeza de chakras', tipo: 'processing', status: 'completed', duracaoMs: 300000, sefirot: ['Gevurah'], chakra: 'Manipura (3º)' },
      { id: 'step-3', nome: 'Harmonização', tipo: 'processing', status: 'completed', duracaoMs: 300000, sefirot: ['Tipheret'], chakra: 'Anahata (4º)' },
      { id: 'step-4', nome: 'Fortalecimento do campo', tipo: 'output', status: 'completed', duracaoMs: 120000, sefirot: ['Chesed'], chakra: 'Anahata (4º)' },
    ],
    sefirot: ['Binah', 'Gevurah', 'Tipheret', 'Chesed'],
    orixa: 'Oxum',
    chakra: 'Sete chakras',
    duration: '90 minutos',
    spiritualCorrelations: WORKFLOW_SPIRITUAL_CORRELATIONS['healing'],
  },
 {
    id: 'wf-006',
    nome: 'Manifestação de Intenção',
    descricao: 'Workflow para ritual de manifestação com técnica de visualização avançada.',
    categoria: 'manifestation',
    ativo: true,
    ultimaExecucao: '2026-05-27T20:00:00Z',
    passos: [
      { id: 'step-1', nome: 'Definição de intenção', tipo: 'input', status: 'completed', duracaoMs: 5000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
      { id: 'step-2', nome: 'Visualização detalhada', tipo: 'processing', status: 'completed', duracaoMs: 600000, sefirot: ['Chokhmah'], chakra: 'Ajna (6º)' },
      { id: 'step-3', nome: 'Afirmações programadas', tipo: 'processing', status: 'completed', duracaoMs: 300000, sefirot: ['Netzach'], chakra: 'Vishuddha (5º)' },
      { id: 'step-4', nome: 'Gratidão antecipada', tipo: 'output', status: 'completed', duracaoMs: 180000, sefirot: ['Chesed'], chakra: 'Anahata (4º)' },
    ],
    sefirot: ['Chokhmah', 'Netzach', 'Chesed'],
    orixa: 'Oxum',
    chakra: 'Anahata (4º)',
    duration: '120 minutos',
    spiritualCorrelations: WORKFLOW_SPIRITUAL_CORRELATIONS['manifestation'],
  },
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = WorkflowQuerySchema.safeParse({
      categoria: searchParams.get('categoria'),
      ativo: searchParams.get('ativo'),
      includeSteps: searchParams.get('includeSteps'),
      limit: searchParams.get('limit'),
      sefirot: searchParams.get('sefirot'),
      chakra: searchParams.get('chakra'),
      element: searchParams.get('element'),
      orixa: searchParams.get('orixa'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { categoria, ativo, includeSteps, limit, sefirot, chakra, element, orixa } = parseResult.data;

    let workflows = [...mockWorkflows];

    if (categoria) {
      workflows = workflows.filter(w => w.categoria === categoria);
    }

    if (ativo !== undefined) {
      workflows = workflows.filter(w => w.ativo === ativo);
    }

    if (sefirot) {
      workflows = workflows.filter(w => w.spiritualCorrelations?.sefirot.includes(sefirot));
    }

    if (chakra) {
      workflows = workflows.filter(w => w.spiritualCorrelations?.chakra === chakra);
    }

    if (element) {
      workflows = workflows.filter(w => w.spiritualCorrelations?.element === element);
    }

    if (orixa) {
      workflows = workflows.filter(w => w.spiritualCorrelations?.orixa === orixa);
    }

    if (limit && workflows.length > limit) {
      workflows = workflows.slice(0, limit);
    }

    // Calculate spiritual stats
    const spiritualStats = {
      byCategoria: workflows.reduce((acc, w) => {
        acc[w.categoria] = (acc[w.categoria] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySefirot: workflows.reduce((acc, w) => {
        w.spiritualCorrelations?.sefirot.forEach(s => {
          acc[s] = (acc[s] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      byChakra: workflows.reduce((acc, w) => {
        const c = w.spiritualCorrelations?.chakra;
        if (c) acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byElement: workflows.reduce((acc, w) => {
        const e = w.spiritualCorrelations?.element;
        if (e) acc[e] = (acc[e] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      byOrixa: workflows.reduce((acc, w) => {
        const o = w.spiritualCorrelations?.orixa;
        if (o) acc[o] = (acc[o] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return NextResponse.json({
      success: true,
      workflows: includeSteps ? workflows : workflows.map(w => ({ ...w, passos: undefined })),
      total: workflows.length,
      activos: workflows.filter(w => w.ativo).length,
      spiritualCorrelations: WORKFLOW_SPIRITUAL_CORRELATIONS,
      spiritualStats,
      meta: {
        filters: { categoria, ativo, includeSteps, limit, sefirot, chakra, element, orixa },
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno',
    }, { status: 500 });
  }
}