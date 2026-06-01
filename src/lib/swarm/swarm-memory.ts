// ============================================================
// SWARM MEMORY - Memória persistente com indexação
// ============================================================
// Memória de longo prazo que:
// - Indexa entradas por domínio, agente, tags
// - Faz recall por similaridade semântica (keyword-based)
// - Persiste em arquivo JSON
// - Mantém curva de aprendizado
// ============================================================

import type { MemoryEntry, SwarmMemory } from './swarm-types';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================
// IN-MEMORY + FILE BACKED
// ============================================================

const MEMORY_DIR = path.join(process.cwd(), '.swarm', 'memory');
const MEMORY_FILE = path.join(MEMORY_DIR, 'swarm-memory.json');

class InMemoryBacked implements SwarmMemory {
  public entries: MemoryEntry[] = [];
  private indexByDomain = new Map<string, Set<string>>();
  private indexByAgent = new Map<string, Set<string>>();
  private indexByTag = new Map<string, Set<string>>();

  async initialize(): Promise<void> {
    // Cria diretório
    if (!fs.existsSync(MEMORY_DIR)) {
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }

    // Carrega memória persistente
    if (fs.existsSync(MEMORY_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
        this.entries = data.entries || [];
        this.rebuildIndexes();
        console.log(`[Swarm Memory] Carregado: ${this.entries.length} entradas`);
      } catch (err) {
        console.error('[Swarm Memory] Erro ao carregar:', err);
      }
    }
  }

  async recall(query: {
    query: string;
    domains?: string[];
    maxResults?: number;
  }): Promise<{ entries: MemoryEntry[] }> {
    const queryWords = this.tokenize(query.query);
    const max = query.maxResults || 5;

    const scored = this.entries.map(entry => ({
      entry,
      score: this.scoreEntry(entry, queryWords, query.domains),
    }));

    return {
      entries: scored
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, max)
        .map(s => s.entry),
    };
  }

  async remember(entry: Omit<MemoryEntry, 'id' | 'tags'>): Promise<void> {
    const id = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const tags = this.extractTags(entry.result, entry.insights, entry.task);

    const newEntry: MemoryEntry = {
      ...entry,
      id,
      tags,
    };

    this.entries.push(newEntry);
    this.indexEntry(newEntry);

    // Auto-persist a cada 5 entradas
    if (this.entries.length % 5 === 0) {
      await this.persist();
    }
  }

  async persist(): Promise<void> {
    try {
      fs.writeFileSync(
        MEMORY_FILE,
        JSON.stringify({ entries: this.entries, updatedAt: new Date().toISOString() }, null, 2)
      );
    } catch (err) {
      console.error('[Swarm Memory] Erro ao persistir:', err);
    }
  }

  stats(): { entries: number; byAgent: Record<string, number> } {
    const byAgent: Record<string, number> = {};
    for (const entry of this.entries) {
      byAgent[entry.agent] = (byAgent[entry.agent] || 0) + 1;
    }
    return { entries: this.entries.length, byAgent };
  }

  // ============================================================
  // SEARCH & INDEX
  // ============================================================

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  private scoreEntry(entry: MemoryEntry, queryWords: string[], domains?: string[]): number {
    let score = 0;
    const textWords = this.tokenize(`${entry.task} ${entry.result} ${entry.insights.join(' ')}`);

    // Match em palavras-chave
    for (const qWord of queryWords) {
      if (textWords.includes(qWord)) score += 2;
      if (entry.tags.includes(qWord)) score += 3;
    }

    // Boost por recência (curva de aprendizado)
    const ageInDays = (Date.now() - new Date(entry.timestamp).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 1) score *= 1.5;
    else if (ageInDays < 7) score *= 1.2;

    return score;
  }

  private extractTags(text: string, insights: string[], task: string): string[] {
    const allText = `${text} ${insights.join(' ')} ${task}`;
    const words = this.tokenize(allText);

    // Stop words (palavras comuns)
    const stopWords = new Set([
      'para', 'como', 'mais', 'menos', 'com', 'sem', 'por', 'sobre', 'entre',
      'todos', 'todas', 'esse', 'essa', 'isso', 'aqui', 'ali', 'la', 'cá',
    ]);

    const tags = new Set<string>();
    for (const word of words) {
      if (!stopWords.has(word) && word.length > 3) {
        tags.add(word);
      }
    }

    return Array.from(tags).slice(0, 15);
  }

  private rebuildIndexes(): void {
    this.indexByDomain.clear();
    this.indexByAgent.clear();
    this.indexByTag.clear();
    for (const entry of this.entries) {
      this.indexEntry(entry);
    }
  }

  private indexEntry(entry: MemoryEntry): void {
    for (const tag of entry.tags) {
      if (!this.indexByTag.has(tag)) this.indexByTag.set(tag, new Set());
      this.indexByTag.get(tag)!.add(entry.id);
    }
    if (!this.indexByAgent.has(entry.agent)) this.indexByAgent.set(entry.agent, new Set());
    this.indexByAgent.get(entry.agent)!.add(entry.id);
  }
}

// ============================================================
// SINGLETON
// ============================================================

let memoryInstance: InMemoryBacked | null = null;

export function getSwarmMemory(): SwarmMemory {
  if (!memoryInstance) {
    memoryInstance = new InMemoryBacked();
  }
  return memoryInstance;
}
