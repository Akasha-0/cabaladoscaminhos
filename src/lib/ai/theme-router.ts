// ============================================================
// THEME ROUTER — Roteador de Temática (inverso da Matriz)
// ============================================================
// Implementa o Doc 12 §4: classifica uma pergunta aberta em 1..3 temas
// e mapeia cada tema para casas primárias/secundárias + aspectos natais.
//
// A Matriz de Correlação vai de casa -> aspectos; este roteador vai de
// tema -> casa(s) -> aspectos. A classificação é DETERMINÍSTICA: a mesma
// pergunta sobre a mesma leitura sempre produz as mesmas casas.

export type ThemeId =
  | 'amor'
  | 'sexualidade'
  | 'dinheiro'
  | 'trabalho'
  | 'carreira_sucesso'
  | 'familia'
  | 'saude'
  | 'decisao'
  | 'espiritualidade'
  | 'obstaculos'
  | 'relacionamentos_sociais'
  | 'comunicacao'
  | 'mudancas'
  | 'karma_destino'
  | 'geral';

export interface ThemeEntry {
  id: ThemeId;
  /** Casas primárias da Mesa Real associadas ao tema. */
  primaryHouses: number[];
  /** Casas secundárias. */
  secondaryHouses: number[];
  /** Aspectos natais-chave (rótulos legíveis para o prompt). */
  natalAspects: string[];
  /** Palavras-gatilho (lematizadas/sem acento) para a classificação determinística. */
  keywords: string[];
}

// Taxonomia canônica (Doc 12 §4). O tema `geral` não tem keywords —
// é o fallback quando nenhum outro tema casa.
// fallow-ignore-next-line unused-export
export const THEME_TAXONOMY: Record<Exclude<ThemeId, 'geral'>, ThemeEntry> = {
  amor: {
    id: 'amor', primaryHouses: [24], secondaryHouses: [25, 29],
    natalAspects: ['Vênus', 'Lua', '5ª Casa'],
    keywords: ['amor', 'amar', 'paixao', 'romance', 'namoro', 'relacionamento', 'coracao', 'afeto', 'casamento', 'parceiro', 'parceira', 'conjuge', 'crush'],
  },
  sexualidade: {
    id: 'sexualidade', primaryHouses: [7], secondaryHouses: [30, 8],
    natalAspects: ['Lilith', 'Plutão', '8ª Casa'],
    keywords: ['sexo', 'sexual', 'sexualidade', 'desejo', 'intimidade', 'prazer', 'libido', 'tesao'],
  },
  dinheiro: {
    id: 'dinheiro', primaryHouses: [34], secondaryHouses: [15, 2],
    natalAspects: ['2ª Casa', 'Vênus', 'Karma (mês)'],
    keywords: ['dinheiro', 'grana', 'financeiro', 'financa', 'financas', 'renda', 'salario', 'divida', 'dividas', 'investimento', 'abundancia', 'prosperidade', 'pagar', 'ganhar'],
  },
  trabalho: {
    id: 'trabalho', primaryHouses: [35], secondaryHouses: [31, 15],
    natalAspects: ['6ª Casa', '10ª Casa', 'Saturno', 'Missão'],
    keywords: ['trabalho', 'emprego', 'job', 'profissao', 'profissional', 'estabilidade', 'firmar', 'concurso', 'contratacao'],
  },
  carreira_sucesso: {
    id: 'carreira_sucesso', primaryHouses: [31], secondaryHouses: [15, 33],
    natalAspects: ['10ª Casa (MC)', 'Sol'],
    keywords: ['carreira', 'sucesso', 'vitoria', 'conquista', 'reconhecimento', 'promocao', 'crescer', 'ascensao', 'realizacao'],
  },
  familia: {
    id: 'familia', primaryHouses: [4], secondaryHouses: [5],
    natalAspects: ['4ª Casa', 'Lua', 'Karma (mês)'],
    keywords: ['familia', 'casa', 'lar', 'mae', 'pai', 'filho', 'filha', 'filhos', 'parente', 'moradia', 'raizes', 'domestico'],
  },
  saude: {
    id: 'saude', primaryHouses: [5], secondaryHouses: [23],
    natalAspects: ['6ª Casa', 'Sol', 'Corpo Prânico'],
    keywords: ['saude', 'doenca', 'corpo', 'energia', 'vitalidade', 'cansaco', 'cura', 'fisico', 'cansada', 'cansado'],
  },
  decisao: {
    id: 'decisao', primaryHouses: [22], secondaryHouses: [10, 33],
    natalAspects: ['Nodos Norte/Sul', 'Caminho de Vida'],
    keywords: ['decisao', 'decidir', 'escolha', 'escolher', 'caminho', 'rumo', 'direcao', 'opcao', 'devo', 'aceitar', 'mudar de'],
  },
  espiritualidade: {
    id: 'espiritualidade', primaryHouses: [16], secondaryHouses: [26, 36],
    natalAspects: ['Netuno', '9ª/12ª Casa', 'números mestres'],
    keywords: ['espiritual', 'espiritualidade', 'fe', 'deus', 'proposito', 'missao', 'alma', 'sonho', 'sonhos', 'meditacao', 'oracao'],
  },
  obstaculos: {
    id: 'obstaculos', primaryHouses: [21], secondaryHouses: [6, 19],
    natalAspects: ['Saturno (tenso)', 'Desafios', 'Dívidas'],
    keywords: ['obstaculo', 'bloqueio', 'dificuldade', 'problema', 'barreira', 'atraso', 'travado', 'travada', 'inimigo', 'empecilho'],
  },
  relacionamentos_sociais: {
    id: 'relacionamentos_sociais', primaryHouses: [20], secondaryHouses: [18],
    natalAspects: ['11ª/7ª Casa', 'Vênus'],
    keywords: ['amizade', 'amigo', 'amigos', 'social', 'grupo', 'rede', 'comunidade', 'aliado', 'aliados', 'festa', 'publico'],
  },
  comunicacao: {
    id: 'comunicacao', primaryHouses: [12], secondaryHouses: [27, 14],
    natalAspects: ['Mercúrio', '3ª Casa', 'Expressão'],
    keywords: ['comunicacao', 'conversa', 'falar', 'mensagem', 'dialogo', 'expressao', 'contrato', 'documento', 'negociar', 'escrever'],
  },
  mudancas: {
    id: 'mudancas', primaryHouses: [17], secondaryHouses: [8, 13],
    natalAspects: ['Nodo Norte', 'Urano', 'Destino'],
    keywords: ['mudanca', 'mudar', 'transicao', 'renovacao', 'recomeco', 'novo', 'nova fase', 'transformacao', 'gestacao', 'nascer'],
  },
  karma_destino: {
    id: 'karma_destino', primaryHouses: [36], secondaryHouses: [22, 8],
    natalAspects: ['Nodo Sul', 'Dívidas Kármicas', 'Karma'],
    keywords: ['karma', 'destino', 'fardo', 'licao', 'proposito de vida', 'passado', 'ancestral', 'teste', 'cruz'],
  },
};

export interface RoutingResult {
  themes: ThemeId[];
  /** Casas roteadas (primárias + secundárias dos temas), únicas e ordenadas. */
  houses: number[];
  /** Aspectos natais agregados dos temas roteados. */
  natalAspects: string[];
}

/** Normaliza texto: minúsculas, sem acento, só letras/espaços. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Classifica uma pergunta aberta em 1..3 temas (determinístico, por keywords).
 * Sem correspondência → tema `geral`.
 *
 * @param question      pergunta do consulente
 * @param filledHouses  casas efetivamente tiradas na leitura (para `geral` e filtro)
 */
export function routeQuestion(question: string, filledHouses: number[] = []): RoutingResult {
  const normalized = normalize(question);

  // pontua cada tema pelo nº de keywords presentes
  const scored: Array<{ id: ThemeId; score: number; entry: ThemeEntry }> = [];
  for (const entry of Object.values(THEME_TAXONOMY)) {
    let score = 0;
    for (const kw of entry.keywords) {
      // match por palavra/substring com fronteira simples
      if (normalized.includes(normalize(kw))) score += 1;
    }
    if (score > 0) scored.push({ id: entry.id, score, entry });
  }

  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
  const top = scored.slice(0, 3);

  if (top.length === 0) {
    // fallback: tema geral usa as casas tiradas na leitura
    return {
      themes: ['geral'],
      houses: [...new Set(filledHouses)].sort((a, b) => a - b),
      natalAspects: ['síntese completa do dossiê'],
    };
  }

  const houseSet = new Set<number>();
  const aspectSet = new Set<string>();
  for (const { entry } of top) {
    for (const h of entry.primaryHouses) houseSet.add(h);
    for (const h of entry.secondaryHouses) houseSet.add(h);
    for (const a of entry.natalAspects) aspectSet.add(a);
  }

  return {
    themes: top.map((t) => t.id),
    houses: [...houseSet].sort((a, b) => a - b),
    natalAspects: [...aspectSet],
  };
}
