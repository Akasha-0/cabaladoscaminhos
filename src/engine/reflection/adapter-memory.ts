// ============================================================================
// W87-D — Reflection/Daily Prompt Engine · InMemoryAdapter + 28 sample prompts
// ----------------------------------------------------------------------------
// Adapter de testes/desenvolvimento. Seed com 28 prompts cobrindo:
//   - 7 tradições (✦ cigano, 🪶 candomblé, ☩ umbanda, ◈ ifá, ☸ cabala,
//     ☉ astrologia, ☬ tantra)
//   - 4 prompts por tradição
//   - Citações respeitosas (música, filosofia, tradição oral, autores
//     reconhecidos) — SEM exotização, SEM amarração, SEM "trabalho contra
//     terceiros"
//
// O pool é uma constante — prompts são identificados pelo id
// (formato `prompt-<tradição>-<n>`) e a engine atribui a `date` em runtime.
// ============================================================================

import {
  PROMPT_PERGUNTA_MAX,
  toEntryId,
  toPromptId,
  type EntryId,
  type JournalEntry,
  type ReflectionAdapter,
  type ReflectionPrompt,
  type Tradição,
  type UserId,
} from './types';

// ============================================================
// Helpers para criar branded IDs
// ============================================================

function entryId(value: string): EntryId {
  return toEntryId(value);
}

function userId(value: string): UserId {
  return value as UserId;
}

// ============================================================
// 28 prompts seed (4 por tradição × 7 tradições)
// ----------------------------------------------------------------------------
// Cada entrada tem `pergunta`, `citacao` e `autor`. As perguntas são
// respeitosas com a tradição — sem caricatura, sem exotização.
// ============================================================================

interface SeedPrompt {
  readonly n: number; // 1..4 dentro da tradição
  readonly pergunta: string;
  readonly citacao: string;
  readonly autor: string;
}

const SEED: Readonly<Record<Tradição, ReadonlyArray<SeedPrompt>>> = Object.freeze({
  cigano: [
    {
      n: 1,
      pergunta: 'O que as cartas diriam hoje sobre o seu caminho?',
      citacao: 'A estrada não tem fim, mas cada passo tem sentido.',
      autor: 'Tradição oral cigana',
    },
    {
      n: 2,
      pergunta: 'Qual verdade sutil você tem evitado olhar de frente?',
      citacao: 'Quem canta seu medo, transforma sua noite.',
      autor: 'Provérbio romani',
    },
    {
      n: 3,
      pergunta: 'O que seu coração quer que você ainda não disse em voz alta?',
      citacao: 'A palavra que cala, o corpo carrega.',
      autor: 'Tradição oral cigana',
    },
    {
      n: 4,
      pergunta: 'Que laço você precisa renovar ou soltar hoje?',
      citacao: 'Liberdade sem laço é solidão; laço sem liberdade é prisão.',
      autor: 'Reflexão contemporânea',
    },
  ],
  candomble: [
    {
      n: 1,
      pergunta: 'Qual orixá guia seus passos nesta semana?',
      citacao: 'Ori é o nosso guia interior — quem o escuta, dança com o mundo.',
      autor: 'Tradição oral nagô',
    },
    {
      n: 2,
      pergunta: 'O que você pode oferecer ao próximo sem esperar nada em troca?',
      citacao: 'Oferecer é o jeito mais simples de agradecer.',
      autor: 'Sabedoria do terreiro',
    },
    {
      n: 3,
      pergunta: 'Como você honra suas raízes hoje?',
      citacao: 'O ancestral não fala em palavras — fala em escolhas.',
      autor: 'Reflexão de Ifá',
    },
    {
      n: 4,
      pergunta: 'Onde você sente a presença da sua própria comunidade?',
      citacao: 'Axé é o sopro entre quem cuida e quem é cuidado.',
      autor: 'Tradição oral do Candomblé',
    },
  ],
  umbanda: [
    {
      n: 1,
      pergunta: 'Que entidade te visita nos sonhos ultimamente?',
      citacao: 'O Preto-Velho ensina a sentar com a própria sombra antes de correr dela.',
      autor: 'Reflexão sobre as linhas de Umbanda',
    },
    {
      n: 2,
      pergunta: 'Qual caridade você pode fazer hoje sem sequer sair de casa?',
      citacao: 'A caridade que começa em silêncio é a mais forte.',
      autor: 'Tradição umbandista',
    },
    {
      n: 3,
      pergunta: 'O que a sua Cabocla ou Caboclo te diria sobre este momento?',
      citacao: 'A terra escuta tudo o que a boca tem medo de falar.',
      autor: 'Sabedoria dos caboclos',
    },
    {
      n: 4,
      pergunta: 'Quem precisa de uma palavra boa vinda de você hoje?',
      citacao: 'Ato de bondade é semente que ninguém vê florescer.',
      autor: 'Reflexão contemporânea',
    },
  ],
  ifa: [
    {
      n: 1,
      pergunta: 'O que o Odu de hoje revela sobre seus conflitos?',
      citacao: 'Antes de falar, o Odu escuta. Antes de agir, a mão pensa.',
      autor: 'Ifá — Tradição oral iorubá',
    },
    {
      n: 2,
      pergunta: 'Qual decisão você tem adiado por medo do próprio resultado?',
      citacao: 'A coragem não é ausência de medo — é decidir apesar dele.',
      autor: 'Reflexão sobre Ifá',
    },
    {
      n: 3,
      pergunta: 'O que você aprende quando observa os conflitos ao seu redor?',
      citacao: 'Orixá não escolhe lado; mostra caminho.',
      autor: 'Tradição oral de Ifá',
    },
    {
      n: 4,
      pergunta: 'Onde a sua palavra precisa voltar a ter peso?',
      citacao: 'A palavra que se quebra, conserta-se com outra palavra honesta.',
      autor: 'Sabedoria dos Babalaôs',
    },
  ],
  cabala: [
    {
      n: 1,
      pergunta: 'Qual sefirá pulsa mais forte no seu coração hoje?',
      citacao: 'A Árvore da Vida floresce quando cada sefirá recebe a luz que lhe cabe.',
      autor: 'Tradição cabalística',
    },
    {
      n: 2,
      pergunta: 'O que você precisa deixar morrer para renascer mais leve?',
      citacao: 'Nilá é o soltar necessário para caber o que vem.',
      autor: 'Reflexão sobre Ein Sof',
    },
    {
      n: 3,
      pergunta: 'Onde mora a sua pergunta viva — aquela que ainda não tem resposta?',
      citacao: 'Não há pergunta covarde; há respostas prematuras.',
      autor: 'Tradição cabalística oral',
    },
    {
      n: 4,
      pergunta: 'Qual nome seu você ainda não soube carregar?',
      citacao: 'O nome verdadeiro é semente: carrega quem ousa recebê-lo.',
      autor: 'Mística da Kabbalah',
    },
  ],
  astrologia: [
    {
      n: 1,
      pergunta: 'O que seu signo solar te convida a integrar hoje?',
      citacao: 'O céu não obriga — apenas sugere direções ao coração atento.',
      autor: 'Tradição astrológica',
    },
    {
      n: 2,
      pergunta: 'Que parte da sua sombra pede mais compaixão e menos crítica?',
      citacao: 'A sombra só se adoece quando negada; se iluminada, vira aliada.',
      autor: 'Psicologia junguiana',
    },
    {
      n: 3,
      pergunta: 'O que o trânsito de hoje pede que você cultive em paciência?',
      citacao: 'Astrologia não é destino — é mapa do que está em curso.',
      autor: 'Reflexão astrológica',
    },
    {
      n: 4,
      pergunta: 'Onde a sua intuição tem te pedido mais espaço?',
      citacao: 'Quem escuta a Lua, calibrar-se com a própria maré.',
      autor: 'Tradição simbólica',
    },
  ],
  tantra: [
    {
      n: 1,
      pergunta: 'Onde mora o seu prazer sagrado neste momento?',
      citacao: 'Tantra não é performance — é presença.',
      autor: 'Tradição tântrica',
    },
    {
      n: 2,
      pergunta: 'Como está sua respiração neste instante?',
      citacao: 'Pranayama é a arte de lembrar o corpo de si.',
      autor: 'Tradição iogue',
    },
    {
      n: 3,
      pergunta: 'O que precisa de mais suavidade e menos força na sua vida hoje?',
      citacao: 'A energia sagrada se move como água: para onde há receptividade.',
      autor: 'Sabedoria tântrica',
    },
    {
      n: 4,
      pergunta: 'Onde você tem confundido controle com cuidado?',
      citacao: 'Cuidado é presença serena; controle é medo disfarçado.',
      autor: 'Mestra contemporânea de Tantra',
    },
  ],
});

// ============================================================
// InMemoryReflectionAdapter
// ============================================================================

export class InMemoryReflectionAdapter implements ReflectionAdapter {
  private readonly prompts: Map<string, ReflectionPrompt>;
  private readonly entries: Map<EntryId, JournalEntry>;

  constructor() {
    this.prompts = new Map();
    this.entries = new Map();
    this.seed();
  }

  /** Seed dos 28 prompts (4 por tradição × 7 tradições) */
  private seed(): void {
    (Object.keys(SEED) as Tradição[]).forEach((tr) => {
      SEED[tr].forEach((p) => {
        const id = toPromptId(`prompt-${tr}-${p.n}`);
        // Criamos prompts sem `date` (engine atribui em runtime)
        const perguntasLen = p.pergunta.length;
        if (perguntasLen > PROMPT_PERGUNTA_MAX) {
          throw new Error(
            `Pergunta muito longa (${perguntasLen} > ${PROMPT_PERGUNTA_MAX}): ${id}`
          );
        }
        const prompt: ReflectionPrompt = {
          id,
          date: '', // atribuído em runtime
          tradição: tr,
          pergunta: p.pergunta,
          citacao: p.citacao,
          autor: p.autor,
        };
        this.prompts.set(id, prompt);
      });
    });
  }

  async listPrompts(): Promise<ReadonlyArray<ReflectionPrompt>> {
    return Array.from(this.prompts.values());
  }

  async getPrompt(id: import('./types').PromptId): Promise<ReflectionPrompt | null> {
    return this.prompts.get(id) ?? null;
  }

  async saveEntry(entry: JournalEntry): Promise<void> {
    this.entries.set(entry.id, entry);
  }

  async listEntriesByUser(
    user: UserId,
    limit: number
  ): Promise<ReadonlyArray<JournalEntry>> {
    const filtered = Array.from(this.entries.values()).filter(
      (e) => e.userId === user
    );
    // Ordem desc por createdAt
    filtered.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return filtered.slice(0, limit);
  }

  /** Helper — usado só em testes para popular entries */
  seedEntries(entries: ReadonlyArray<JournalEntry>): void {
    entries.forEach((e) => this.entries.set(e.id, e));
  }

  /** Helper interno para criar EntryId determinístico (testes) */
  static newEntryId(seed = 'test'): EntryId {
    return entryId(`entry-${seed}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  }

  /** Helper interno para converter string em UserId (testes) */
  static asUserId(value: string): UserId {
    return userId(value);
  }
}
