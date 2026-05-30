'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Workflow, Play, Pause, Clock, CheckCircle, XCircle, RefreshCw, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// TYPES
// ============================================================

interface WorkflowStep {
  id: string;
  name: string;
  type: 'input' | 'processing' | 'output';
  status: 'pending' | 'running' | 'completed' | 'failed';
  durationMs?: number;
}

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: 'ritual' | 'divinatory' | 'calculation' | 'analysis';
  active: boolean;
  lastExecution: string | null;
  status: 'idle' | 'running' | 'completed' | 'failed';
  steps: WorkflowStep[];
}

interface WorkflowAutomationProps {
  className?: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const CATEGORY_COLORS: Record<string, { text: string; bg: string; icon: string }> = {
  ritual: { text: 'text-amber-400', bg: 'bg-amber-500/20', icon: '✨' },
  divinatory: { text: 'text-purple-400', bg: 'bg-purple-500/20', icon: '🔮' },
  calculation: { text: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: '🧮' },
  analysis: { text: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '📊' },
};

const MOCK_WORKFLOWS: Workflow[] = [
  { id: 'w1', name: 'Ritual de Purificação Lunar', description: 'Executa ritual completo de limpeza baseado na fase lunar atual', category: 'ritual', active: true, lastExecution: '2026-05-29T22:00:00Z', status: 'idle', steps: [{ id: 's1', name: 'Verificar fase lunar', type: 'input', status: 'completed' }, { id: 's2', name: 'Selecionar ervas', type: 'processing', status: 'pending' }, { id: 's3', name: 'Preparar defumação', type: 'processing', status: 'pending' }, { id: 's4', name: 'Gerar ritual', type: 'output', status: 'pending' }] },
  { id: 'w2', name: 'Leitura Tarot-Ifá Correlacionada', description: 'Combina leitura de tarot com Odu do Merindilogun para análise profunda', category: 'divinatory', active: true, lastExecution: '2026-05-30T10:30:00Z', status: 'completed', steps: [{ id: 's1', name: 'Selecionar spread', type: 'input', status: 'completed' }, { id: 's2', name: 'Sortear cartas', type: 'processing', status: 'completed' }, { id: 's3', name: 'Sortear Odu', type: 'processing', status: 'completed' }, { id: 's4', name: 'Gerar interpretação', type: 'output', status: 'completed', durationMs: 1250 }] },
  { id: 'w3', name: 'Cálculo Numerológico Completo', description: 'Calcula todos os números pessoais: caminho de vida, destino, alma', category: 'calculation', active: false, lastExecution: '2026-05-28T15:00:00Z', status: 'idle', steps: [{ id: 's1', name: 'Obter dados', type: 'input', status: 'pending' }, { id: 's2', name: 'Calcular números', type: 'processing', status: 'pending' }, { id: 's3', name: 'Gerar relatório', type: 'output', status: 'pending' }] },
  { id: 'w4', name: 'Análise Correlacional Multissistema', description: 'Analisa correlações entre numerologia, astrologia e cabala', category: 'analysis', active: true, lastExecution: '2026-05-30T08:00:00Z', status: 'running', steps: [{ id: 's1', name: 'Coletar dados', type: 'input', status: 'completed' }, { id: 's2', name: 'Processar correlações', type: 'processing', status: 'running' }, { id: 's3', name: 'Gerar visualização', type: 'output', status: 'pending' }] },
];

// ============================================================
// SUB-COMPONENTS
// ============================================================

function StepIndicator({ step }: { step: WorkflowStep }) {
  const statusConfig = {
    pending: { icon: <Clock className="w-3 h-3" />, color: 'text-slate-500', bg: 'bg-slate-700/30' },
    running: { icon: <RefreshCw className="w-3 h-3 animate-spin" />, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    completed: { icon: <CheckCircle className="w-3 h-3" />, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    failed: { icon: <XCircle className="w-3 h-3" />, color: 'text-rose-400', bg: 'bg-rose-500/20' },
  };
  const config = statusConfig[step.status];
  
  return (
    <div className={cn('flex items-center gap-2 px-2 py-1 rounded', config.bg)}>
      <span className={config.color}>{config.icon}</span>
      <span className="text-xs text-slate-300">{step.name}</span>
      {step.durationMs && <span className="text-xs text-slate-500 ml-auto">{step.durationMs}ms</span>}
    </div>
  );
}

function WorkflowCard({ workflow, onRun }: { workflow: Workflow; onRun: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const colors = CATEGORY_COLORS[workflow.category];
  
  const statusConfig = {
    idle: { text: 'Aguardando', color: 'text-slate-400', bg: 'bg-slate-500/20' },
    running: { text: 'Executando', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    completed: { text: 'Concluído', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    failed: { text: 'Falhou', color: 'text-rose-400', bg: 'bg-rose-500/20' },
  };
  const status = statusConfig[workflow.status];

  return (
    <Card className={cn('card-spiritual border-slate-700/50', !workflow.active && 'opacity-60')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{colors.icon}</span>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">{workflow.name}</CardTitle>
                {!workflow.active && (
                  <span className="px-1.5 py-0.5 rounded text-xs bg-slate-700/50 text-slate-500">Inativo</span>
                )}
              </div>
              <p className="text-xs text-slate-400">{workflow.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('px-2 py-0.5 rounded text-xs font-medium', status.color, status.bg)}>
              {status.text}
            </span>
            <button
              onClick={() => onRun(workflow.id)}
              disabled={!workflow.active || workflow.status === 'running'}
              className={cn(
                'p-2 rounded-lg transition-colors',
                workflow.active && workflow.status !== 'running'
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
              )}
            >
              {workflow.status === 'running' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span className={cn('px-2 py-0.5 rounded', colors.text, colors.bg)}>
            {workflow.category}
          </span>
          {workflow.lastExecution && (
            <span>Última execução: {new Date(workflow.lastExecution).toLocaleString('pt-BR')}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          {expanded ? 'Ocultar' : 'Mostrar'} etapas ({workflow.steps.length})
        </button>
        {expanded && (
          <div className="mt-3 space-y-2">
            {workflow.steps.map(step => (
              <StepIndicator key={step.id} step={step} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function WorkflowAutomation({ className = '' }: WorkflowAutomationProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>(MOCK_WORKFLOWS);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleRun = (id: string) => {
    setWorkflows(prev => prev.map(w => 
      w.id === id ? { ...w, status: 'running' as const, lastExecution: new Date().toISOString() } : w
    ));
    // Simulate completion after delay
    setTimeout(() => {
      setWorkflows(prev => prev.map(w => 
        w.id === id ? { ...w, status: 'completed' as const } : w
      ));
    }, 3000);
  };

  const filteredWorkflows = filterCategory === 'all' 
    ? workflows 
    : workflows.filter(w => w.category === filterCategory);

  const activeWorkflows = workflows.filter(w => w.active).length;

  return (
    <Card className={cn('card-spiritual', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5 text-emerald-400" />
            <CardTitle className="text-lg">Automação de Workflows</CardTitle>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
              {activeWorkflows}/{workflows.length} ativos
            </span>
          </div>
          <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          {(['all', 'ritual', 'divinatory', 'calculation', 'analysis'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                filterCategory === cat 
                  ? 'bg-primary text-white' 
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              )}
            >
              {cat === 'all' ? 'Todos' : cat === 'divinatory' ? 'Adivinhação' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredWorkflows.map(workflow => (
            <WorkflowCard key={workflow.id} workflow={workflow} onRun={handleRun} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default WorkflowAutomation;
