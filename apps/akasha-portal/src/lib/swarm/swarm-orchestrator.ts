// ============================================================
// SWARM ORCHESTRATOR
// ============================================================
// Sistema de orquestração de múltiplos agentes especializados
// que trabalham em paralelo para construir a inteligência
// espiritual da plataforma.
//
// Inspirado em swarm intelligence - cada agente tem função
// específica e se comunica via memória compartilhada.
// ============================================================

import {
  type AgentRole,
  type AgentTask,
  type AgentResult,
  type SwarmMemory,
  type KnowledgeBase,
  type ChainOfThought,
  AGENT_REGISTRY,
} from './swarm-types';
import { getSwarmMemory } from './swarm-memory';
import { getKnowledgeBase } from './knowledge-base';
import * as Agents from './agents';

// ============================================================
// SWARM STATE
// ============================================================

interface SwarmConfig {
  branchName: string;
  cycleNumber: number;
  startTime: string;
  activeAgents: string[];
  completedTasks: number;
  failedTasks: number;
  knowledgeAdded: number;
}

class SwarmOrchestrator {
  private config: SwarmConfig;
  private memory: SwarmMemory;
  private knowledge: KnowledgeBase;
  private isRunning = false;
  private cycleInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.config = {
      branchName: 'autoresearch/agents-v2',
      cycleNumber: 0,
      startTime: new Date().toISOString(),
      activeAgents: [],
      completedTasks: 0,
      failedTasks: 0,
      knowledgeAdded: 0,
    };
    this.memory = getSwarmMemory();
    this.knowledge = getKnowledgeBase();
  }

  // ============================================================
  // LIFECYCLE
  // ============================================================

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('[Swarm] Já está rodando');
      return;
    }

    this.isRunning = true;
    this.config.cycleNumber++;
    console.log(`[Swarm] 🚀 Iniciando ciclo ${this.config.cycleNumber}`);

    // Bootstrap inicial
    await this.bootstrap();

    // Inicia loop de auto-p improvement
    this.startAutoImprovement();
  }

  stop(): void {
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
    this.isRunning = false;
    console.log('[Swarm] 🛑 Parado');
  }

  // ============================================================
  // BOOTSTRAP - Inicializa knowledge base e memória
  // ============================================================

  private async bootstrap(): Promise<void> {
    console.log('[Swarm] 📚 Inicializando knowledge base...');
    await this.knowledge.load();

    console.log('[Swarm] 🧠 Inicializando memória...');
    await this.memory.initialize();

    // Carrega o que já existe
    const stats = this.knowledge.stats();
    console.log(`[Swarm] ✅ Knowledge base: ${stats.entries} entradas em ${stats.domains} domínios`);

    // Injeta conhecimento histórico no context window
    const memStats = this.memory.stats();
    console.log(`[Swarm] ✅ Memória: ${memStats.entries} entradas de contexto`);
  }

  // ============================================================
  // AGENT EXECUTION
  // ============================================================

  async executeAgent(
    role: AgentRole,
    task: AgentTask
  ): Promise<AgentResult> {
    const agentInfo = AGENT_REGISTRY[role];
    if (!agentInfo) {
      throw new Error(`Agente desconhecido: ${role}`);
    }

    console.log(`[Swarm:${role}] 🎯 Iniciando task: ${task.name}`);

    // 1. Carrega contexto relevante da memória
    const context = await this.memory.recall({
      query: task.name,
      domains: task.domains,
      maxResults: 5,
    });

    // 2. Carrega knowledge base relevante
    const kb = await this.knowledge.getRelevant(task.domains);

    // 3. Constrói Chain of Thought
    const cot = this.buildChainOfThought(task, context, kb);

    // 4. Executa o agente (chamada real aqui)
    const result = await this.runAgentLogic(role, task, context, kb, cot);

    // 5. Persiste o resultado na memória
    await this.memory.remember({
      agent: role,
      task: task.name,
      result: result.summary,
      insights: result.insights,
      timestamp: new Date().toISOString(),
      cycleNumber: this.config.cycleNumber,
    });

    // 6. Se gerou knowledge, adiciona à base
    if (result.knowledgeEntries) {
      for (const entry of result.knowledgeEntries) {
        await this.knowledge.add(entry);
        this.config.knowledgeAdded++;
      }
    }

    this.config.completedTasks++;
    console.log(`[Swarm:${role}] ✅ Concluído: ${result.summary}`);

    return result;
  }

  // ============================================================
  // CHAIN OF THOUGHT BUILDER
  // ============================================================

  private buildChainOfThought(
    task: AgentTask,
    context: any,
    kb: any
  ): ChainOfThought {
    return {
      task: task.name,
      steps: [
        {
          step: 1,
          thought: `Analisar tarefa: ${task.name}`,
          action: 'Decompor em sub-tarefas',
        },
        {
          step: 2,
          thought: `Carregar contexto: ${context.entries.length} entradas relevantes`,
          action: 'Integrar contexto histórico',
        },
        {
          step: 3,
          thought: `Validar contra knowledge base: ${kb.entries.length} entries`,
          action: 'Cruzar com sabedoria estabelecida',
        },
        {
          step: 4,
          thought: 'Identificar gaps e oportunidades',
          action: 'Mapear o que falta',
        },
        {
          step: 5,
          thought: 'Gerar saída estruturada',
          action: 'Produzir artefato final',
        },
      ],
      reasoning: `Para "${task.name}", precisamos: ${task.description}`,
      conclusion: '',
    };
  }

  // ============================================================
  // AGENT LOGIC - Aqui é onde cada agente faz seu trabalho
  // ============================================================

  private async runAgentLogic(
    role: AgentRole,
    task: AgentTask,
    context: any,
    kb: any,
    cot: ChainOfThought
  ): Promise<AgentResult> {
    // Implementação delegada para cada agente específico
    const handler = this.getAgentHandler(role);
    return handler(task, context, kb, cot);
  }

  private getAgentHandler(role: AgentRole): (task: AgentTask, context: any, kb: any, cot: ChainOfThought) => Promise<AgentResult> {
    const handlers: Record<AgentRole, any> = {
      'orixa-specialist': Agents.orixaSpecialist,
      'odu-specialist': Agents.oduSpecialist,
      'tantra-specialist': Agents.tantraSpecialist,
      'chakra-specialist': Agents.chakraSpecialist,
      'numerology-specialist': Agents.numerologySpecialist,
      'astrology-specialist': Agents.astrologySpecialist,
      'wicca-specialist': Agents.wiccaSpecialist,
      'flora-specialist': Agents.floraSpecialist,
      'xing-specialist': Agents.xingSpecialist,
      'sexuality-specialist': Agents.sexualitySpecialist,
      'coherence-validator': Agents.coherenceValidator,
      'prompt-engineer': Agents.promptEngineer,
    };
    return handlers[role] || (() => Promise.resolve({
      summary: 'Handler não implementado',
      insights: [],
      knowledgeEntries: [],
    }));
  }

  // ============================================================
  // AUTO-IMPROVEMENT LOOP
  // ============================================================

  private startAutoImprovement(): void {
    // A cada 5 minutos, executa um ciclo de auto-análise
    this.cycleInterval = setInterval(async () => {
      try {
        await this.runSelfImprovementCycle();
      } catch (err) {
        console.error('[Swarm] Erro no auto-improvement:', err);
      }
    }, 5 * 60 * 1000); // 5 min
  }

  private async runSelfImprovementCycle(): Promise<void> {
    this.config.cycleNumber++;
    console.log(`[Swarm] 🔄 Ciclo de auto-improvement #${this.config.cycleNumber}`);

    // 1. Validar coerência
    const validation = await this.knowledge.validate();

    // 2. Identificar gaps
    const gaps = await this.identifyGaps();

    // 3. Para cada gap, enfileirar task
    for (const gap of gaps) {
      console.log(`[Swarm] 📋 Gap identificado: ${gap}`);
    }

    // 4. Persistir estado
    await this.persistState();
  }

  private async identifyGaps(): Promise<string[]> {
    const gaps: string[] = [];
    const stats = this.knowledge.stats();

    // Verifica domínios com poucas entradas
    if (stats.byDomain['quizilas'] < 16) {
      gaps.push('Quizilas incompletas para todos os 16+ Orixás');
    }
    if (stats.byDomain['odu-fundamentos'] < 16) {
      gaps.push('Fundamentos dos 16 Odus não mapeados');
    }
    if (stats.byDomain['chakras-secundarios'] < 21) {
      gaps.push('21 Chakras secundários incompletos');
    }
    if (stats.byDomain['corpos-pranicos'] < 5) {
      gaps.push('5 Corpos prânicos não documentados');
    }
    if (stats.byDomain['flora-sagrada'] < 30) {
      gaps.push('Flora sagrada (ervas, banhos) incompleta');
    }
    if (stats.byDomain['xing-mapa'] < 1) {
      gaps.push('Mapa de Xing não implementado');
    }
    if (stats.byDomain['lilith-casa8-sexo'] < 10) {
      gaps.push('Sexualidade (Lilith, Casa 5/8) sem correlações');
    }

    return gaps;
  }

  private async persistState(): Promise<void> {
    await this.memory.persist();
    await this.knowledge.persist();
  }

  // ============================================================
  // GETTERS
  // ============================================================

  getState(): SwarmConfig {
    return { ...this.config };
  }

  isActive(): boolean {
    return this.isRunning;
  }
}

// ============================================================
// SINGLETON
// ============================================================

let swarmInstance: SwarmOrchestrator | null = null;

export function getSwarm(): SwarmOrchestrator {
  if (!swarmInstance) {
    swarmInstance = new SwarmOrchestrator();
  }
  return swarmInstance;
}
// fallow-ignore-next-line unused-type
export type { SwarmConfig };
