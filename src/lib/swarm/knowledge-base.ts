// ============================================================
// KNOWLEDGE BASE
// ============================================================
// Base de conhecimento estruturada que:
// - Armazena sabedoria de cada tradição
// - Indexa por domínio (orixa, odu, chakra, etc)
// - Valida coerência entre entries
// - Persiste em arquivo JSON
// - Permite queries complexas
// ============================================================

import type { KnowledgeEntry, KnowledgeBase, KnowledgeDomain } from './swarm-types';
import * as fs from 'fs';
import * as path from 'path';

const KB_DIR = path.join(process.cwd(), '.swarm', 'knowledge');
const KB_FILE = path.join(KB_DIR, 'knowledge-base.json');

// ============================================================
// SEED DATA - Conhecimento inicial curado
// ============================================================

const SEED_KNOWLEDGE: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // ============================================================
  // QUIZILAS POR ORIXÁ (15+ Orixás com quizilas completas)
  // ============================================================
  {
    domain: 'quizilas',
    key: 'oxala.quizilas',
    data: {
      orixa: 'Oxalá',
      proibicoes: ['Não come mel (algo de Oxalá é o mel, então não pode comer é interpretação controversa — versão: NÃO come carne de porco)'],
      restricoes: ['Cor branco é sagrado — só usa com bori'],
      permitidos: ['Carneiro', 'Frango', 'Peixe branco', 'Frutas claras', 'Arroz'],
      palavrasChave: ['pureza', 'paz', 'iniciador', 'criador'],
      dias: ['Segunda-feira', 'Sexta-feira'],
      fundamentos: 'Oxalá é o pai maior, criador. Representa paz, pureza, velhice sábia.',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'quizilas',
    key: 'oxum.quizilas',
    data: {
      orixa: 'Oxum',
      proibicoes: ['Não come carne de porco', 'Evita ir à praia (em algumas casas)'],
      restricoes: ['Não usar perfume com corante vermelho', 'Cuidado com espelho quebrado'],
      permitidos: ['Galinha', 'Feijão fradinho', 'Milho', 'Mel', 'Doce', 'Frutas amarelas'],
      dias: ['Sábado'],
      elementos: ['Água doce', 'Rios', 'Cachoeiras'],
      fundamentos: 'Oxum é a senhora do amor, beleza, fertilidade, ouro, águas doces.',
    },
    source: 'tradition',
    confidence: 98,
    validated: true,
  },
  {
    domain: 'quizilas',
    key: 'ogum.quizilas',
    data: {
      orixa: 'Ogum',
      proibicoes: ['Não come mel (em algumas casas)', 'Evita dendê em excesso'],
      restricoes: ['Cuidado com ferramentas enferrujadas', 'Não deixar objetos cortantes virados para a porta'],
      permitidos: ['Feijão preto', 'Farinha', 'Carne de boi', 'Frutas vermelhas'],
      dias: ['Terça-feira'],
      elementos: ['Ferro', 'Metais', 'Estradas'],
      fundamentos: 'Ogum abre caminhos, é o guerreiro, patrono do trabalho, ferramentas, tecnologia.',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'quizilas',
    key: 'iansa.quizilas',
    data: {
      orixa: 'Iansã',
      proibicoes: ['Não come dendê (em algumas casas)', 'Evita carne de bode'],
      restricoes: ['Cuidado com ventanias', 'Não andar em tempestades'],
      permitidos: ['Carne de bode', 'Feijão fradinho', 'Inhame', 'Vermelho e branco (cores)'],
      dias: ['Quarta-feira'],
      elementos: ['Vento', 'Raios', 'Tempestades'],
      fundamentos: 'Iansã é a senhora dos raios, ventos, tempestades. Guerreira, justiceira.',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'quizilas',
    key: 'xango.quizilas',
    data: {
      orixa: 'Xangô',
      proibicoes: ['Não come jaca', 'Não come carne de porco'],
      restricoes: ['Não manipular pedra sem propósito', 'Evitar fofoca'],
      permitidos: ['Carneiro', 'Bode', 'Inhame', 'Milho', 'Vermelho e marrom'],
      dias: ['Quarta-feira'],
      elementos: ['Pedras', 'Raio', 'Fogo', 'Justiça'],
      fundamentos: 'Xangô é o senhor da justiça, raios, pedreiras, verdade.',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'quizilas',
    key: 'oxossi.quizilas',
    data: {
      orixa: 'Oxóssi',
      proibicoes: ['Não come carne de porco', 'Não come dendê (em algumas casas)'],
      restricoes: ['Não caçar fora de propósito', 'Respeitar animais'],
      permitidos: ['Carne de caça (bode, veado)', 'Feijão fradinho', 'Milho', 'Verde'],
      dias: ['Quinta-feira'],
      elementos: ['Floresta', 'Mata', 'Caça', 'Animais'],
      fundamentos: 'Oxóssi é o caçador, rei das matas, provedor, conhecimento das folhas.',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'quizilas',
    key: 'iemanja.quizilas',
    data: {
      orixa: 'Iemanjá',
      proibicoes: ['Não come carne de porco', 'Não come jaca'],
      restricoes: ['Não jogar oferenda no lixo (entregar à natureza)', 'Respeitar o mar'],
      permitidos: ['Peixe', 'Frutos do mar', 'Arroz', 'Doce branco', 'Azul e branco'],
      dias: ['Sábado'],
      elementos: ['Mar', 'Sal', 'Conchas', 'Mares'],
      fundamentos: 'Iemanjá é a grande mãe, rainha do mar, protetora das crianças e famílias.',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'quizilas',
    key: 'omolu.quizilas',
    data: {
      orixa: 'Omolu (Obaluaê)',
      proibicoes: ['Não come carne de porco', 'Evita multidões em algumas fases'],
      restricoes: ['Cuidado com palha de côco (deve estar inteira)', 'Respeitar a terra'],
      permitidos: ['Milho', 'Pipoca', 'Feijão preto', 'Farinha', 'Cachorro-quente'],
      dias: ['Segunda-feira'],
      elementos: ['Terra', 'Cura', 'Doenças', 'Palha'],
      fundamentos: 'Omolu é o senhor da cura, doenças, transformação. Representa o ciclo morte-vida.',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'quizilas',
    key: 'nana.quizilas',
    data: {
      orixa: 'Nanã',
      proibicoes: ['Não come carne de porco', 'Não come dendê'],
      restricoes: ['Respeitar a lama, a terra', 'Evitararrogar autoridade sobre ancestrais'],
      permitidos: ['Peixe', 'Farinha', 'Feijão', 'Velho (como ela)'],
      dias: ['Segunda-feira'],
      elementos: ['Lama', 'Terra', 'Ancestralidade', 'Velhice'],
      fundamentos: 'Nanã é a mais anciã, senhora da lama primordial, da morte e renascimento.',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'quizilas',
    key: 'exu.quizilas',
    data: {
      orixa: 'Exu (Elegguá)',
      proibicoes: ['Não come carne de porco (em algumas casas)', 'Evitar brincadeiras com fogo'],
      restricoes: ['Sempre saudar primeiro', 'Cuidado com calúnias (Exu é justiceiro)'],
      permitidos: ['Farinha', 'Cachaça', 'Pimenta', 'Milho torrado', 'Vermelho e preto'],
      dias: ['Segunda-feira', 'Terça-feira'],
      elementos: ['Encruzilhadas', 'Portas', 'Movimento', 'Comunicação'],
      fundamentos: 'Exu é o mensageiro, guardião das encruzilhadas, princípio do movimento.',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'quizilas',
    key: 'pomba-gira.quizilas',
    data: {
      orixa: 'Pomba-Gira',
      proibicoes: ['Não come carne de porco', 'Evitar roupas brancas em giras'],
      restricoes: ['Respeitar seu espaço', 'Não debochar'],
      permitidos: ['Champanhe', 'Cigarro', 'Perfume forte', 'Vermelho e preto'],
      dias: ['Sexta-feira', 'Terça-feira'],
      elementos: ['Encruzilhadas', 'Paixão', 'Sedução', 'Força feminina'],
      fundamentos: 'Pomba-Gira é a senhora da sedução, paixões, força feminina, esquerda.',
    },
    source: 'tradition',
    confidence: 90,
    validated: true,
  },

  // ============================================================
  // CORPOS PRÂNICOS (TANTRA)
  // ============================================================
  {
    domain: 'corpos-pranicos',
    key: 'anamaya-kosha',
    data: {
      nome: 'Annamaya Kosha',
      sanscrito: 'अन्नमय कोष',
      descricao: 'Corpo Físico — corpo material, alimento, sustentação',
      funcao: 'Sustentação material, veículo da alma no plano físico',
      desequilibrio: 'Doenças, fraqueza, apego ao corpo',
      equilibrar: ['Alimentação consciente', 'Exercício físico', 'Hatha Yoga', 'Ayurveda'],
      chakras: ['1º Muladhara', '2º Svadhisthana'],
    },
    source: 'tradition',
    confidence: 90,
    validated: true,
  },
  {
    domain: 'corpos-pranicos',
    key: 'pranamaya-kosha',
    data: {
      nome: 'Pranamaya Kosha',
      sanscrito: 'प्राणमय कोष',
      descricao: 'Corpo Energético/Vital — onde flui o prana (força vital)',
      funcao: 'Distribuição de energia vital, respiração, circulação',
      desequilibrio: 'Fadiga crônica, ansiedade, baixa imunidade',
      equilibrar: ['Pranayama', 'Respiração consciente', 'Reiki', 'Acupuntura'],
      chakras: ['3º Manipura', '4º Anahata'],
      pranas: ['Prana', 'Apana', 'Samana', 'Udana', 'Vyana'],
    },
    source: 'tradition',
    confidence: 92,
    validated: true,
  },
  {
    domain: 'corpos-pranicos',
    key: 'manomaya-kosha',
    data: {
      nome: 'Manomaya Kosha',
      sanscrito: 'मनोमय कोष',
      descricao: 'Corpo Mental — pensamentos, emoções, processamento',
      funcao: 'Pensamento, memória, processamento emocional',
      desequilibrio: 'Ansiedade, depressão, insônia, ruminação',
      equilibrar: ['Meditação', 'Mindfulness', 'Terapia', 'Journaling'],
      chakras: ['5º Vishuddha', '6º Ajna'],
    },
    source: 'tradition',
    confidence: 90,
    validated: true,
  },
  {
    domain: 'corpos-pranicos',
    key: 'vijnanamaya-kosha',
    data: {
      nome: 'Vijnanamaya Kosha',
      sanscrito: 'विज्ञानमय कोष',
      descricao: 'Corpo Intelectual/Intuitivo — sabedoria, discernimento',
      funcao: 'Discernimento, intuição elevada, sabedoria',
      desequilibrio: 'Confusão, falta de propósito, decisões erradas',
      equilibrar: ['Estudo filosófico', 'Contemplação', 'Meditação profunda', 'Mentoria'],
      chakras: ['6º Ajna'],
    },
    source: 'tradition',
    confidence: 88,
    validated: true,
  },
  {
    domain: 'corpos-pranicos',
    key: 'anandamaya-kosha',
    data: {
      nome: 'Anandamaya Kosha',
      sanscrito: 'आनन्दमय कोष',
      descricao: 'Corpo de Bem-Aventurança — conexão com a felicidade pura',
      funcao: 'Prazer transcendental, beatitude, conexão divina',
      desequilibrio: 'Vazio existencial, busca por prazeres externos',
      equilibrar: ['Bhakti Yoga', 'Devoção', 'Meditação no coração', 'Gratidão'],
      chakras: ['7º Sahasrara'],
    },
    source: 'tradition',
    confidence: 88,
    validated: true,
  },

  // ============================================================
  // CHAKRAS SECUNDÁRIOS (3 secundários por chakra principal)
  // ============================================================
  {
    domain: 'chakras-secundarios',
    key: 'muladhara-bija',
    data: {
      nome: 'Muladhara Biju',
      chakra: '1º Muladhara',
      posicao: 'Períneo',
      funcao: 'Semente do chakra raiz, poder primal',
      mantra: 'LAM (4 sílabas internas)',
      cor: 'Vermelho intenso',
      elemento: 'Terra',
    },
    source: 'tradition',
    confidence: 85,
    validated: true,
  },
  {
    domain: 'chakras-secundarios',
    key: 'svadhisthana-lalana',
    data: {
      nome: 'Lalana',
      chakra: '2º Svadhisthana',
      posicao: 'Palato mole',
      funcao: 'Chakra secundário da comunicação e paladar',
      mantra: 'VAM',
      cor: 'Laranja',
      elemento: 'Água',
    },
    source: 'tradition',
    confidence: 80,
    validated: true,
  },

  // ============================================================
  // FLORA SAGRADA - Banhos, chás, defumações
  // ============================================================
  {
    domain: 'flora-sagrada',
    key: 'arruda.banho',
    data: {
      planta: 'Arruda (Ruta graveolens)',
      uso: 'Banho de limpeza e proteção',
      indicacao: ['Quebra de olho gordo', 'Limpeza energética', 'Proteção', 'Antes de giras'],
      preparacao: 'Ferver folhas em água, coar, tomar banho do pescoço para baixo',
      contraindicacoes: ['Gestantes (pode ser abortiva)', 'Crianças pequenas'],
      orixasAssociados: ['Oxalá', 'Omolu', 'Exu'],
      elemento: 'Fogo',
      planeta: 'Marte',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'flora-sagrada',
    key: 'alfazema.banho',
    data: {
      planta: 'Alfazema (Lavandula)',
      uso: 'Banho de paz e serenidade',
      indicacao: ['Insônia', 'Ansiedade', 'Atratividade', 'Calmaria'],
      preparacao: 'Infusão de flores secas, adicionar à água do banho',
      contraindicacoes: [],
      orixasAssociados: ['Oxalá', 'Oxum'],
      elemento: 'Ar',
      planeta: 'Mercúrio',
    },
    source: 'tradition',
    confidence: 92,
    validated: true,
  },
  {
    domain: 'flora-sagrada',
    key: 'guine.ervas',
    data: {
      planta: 'Guiné (Petiveria alliacea)',
      uso: 'Banho de descarrego forte',
      indicacao: ['Demanda espiritual', 'Quebra de magia', 'Limpeza pesada'],
      preparacao: 'Maceração ou decocção das folhas e raízes',
      contraindicacoes: ['Gestantes', 'Pessoas com pressão baixa'],
      orixasAssociados: ['Exu', 'Omolu'],
      elemento: 'Terra',
      planeta: 'Saturno',
    },
    source: 'tradition',
    confidence: 90,
    validated: true,
  },
  {
    domain: 'flora-sagrada',
    key: 'camomila.cha',
    data: {
      planta: 'Camomila (Matricaria chamomilla)',
      uso: 'Chá calmante, ansiedade, sono',
      indicacao: ['Insônia', 'Ansiedade', 'Digestão', 'Paz interior'],
      preparacao: 'Infusão das flores secas, 5-10 min, tomar morno',
      contraindicacoes: ['Alergia a plantas da família Asteraceae'],
      orixasAssociados: ['Oxalá', 'Oxum'],
      elemento: 'Água',
      planeta: 'Lua',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'flora-sagrada',
    key: 'erva-cidreira.cha',
    data: {
      planta: 'Erva-cidreira (Melissa officinalis)',
      uso: 'Chá calmante, coração, ansiedade',
      indicacao: ['Ansiedade', 'Insônia', 'Taquicardia', 'Tensão nervosa'],
      preparacao: 'Infusão das folhas frescas ou secas',
      contraindicacoes: ['Hipotireoidismo (uso prolongado)'],
      orixasAssociados: ['Oxum', 'Iemanjá'],
      elemento: 'Água',
      planeta: 'Vênus',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },

  // ============================================================
  // SEXUALIDADE - Lilith, Casa 5, Casa 8
  // ============================================================
  {
    domain: 'lilith-casa8-sexo',
    key: 'lilith.significado',
    data: {
      nome: 'Lilith (Lua Negra)',
      tipo: 'Ponto sensível do mapa',
      descricao: 'Representa a parte selvagem, instintiva, sexual e não-conformada da psique',
      areas: ['Sexualidade autêntica', 'Prazer proibido', 'Sombra feminina', 'Rebeldia'],
      casasAfetadas: ['Casa 5 (prazer)', 'Casa 8 (sexualidade profunda, tabu)'],
      signosAfetados: ['Escorpião (intensifica)', 'Touro (prazer sensorial)', 'Leão (drama erótico)'],
      recomendacao: 'Integrar com consciência — não reprimir, não perder-se',
    },
    source: 'tradition',
    confidence: 90,
    validated: true,
  },
  {
    domain: 'lilith-casa8-sexo',
    key: 'casa-5.sexualidade',
    data: {
      nome: 'Casa 5 — Prazer e Criatividade',
      descricao: 'Casa da sexualidade lúdica, prazer, romance, criação',
      rege: ['Prazer', 'Paixão', 'Romance', 'Criatividade', 'Filhos', 'Jogos'],
      equilibrio: 'Cultivar o prazer sem culpa, criar, jogar, apaixonar-se',
      desequilibrio: 'Busca excessiva por prazer, infantilidade, dependência de validação',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'lilith-casa8-sexo',
    key: 'casa-8.sexualidade',
    data: {
      nome: 'Casa 8 — Sexualidade Profunda e Transformação',
      descricao: 'Casa do sexo profundo, tabu, morte simbólica, transformação',
      rege: ['Sexo transformador', 'Tabu', 'Intimidade extrema', 'Recursos compartilhados', 'Morte-renascimento'],
      signos: 'Escorpião (regente natural)',
      planetas: ['Plutão (regente moderno)', 'Marte (regente tradicional)'],
      equilibrio: 'Permitir-se ser transformado, abraçar o tabu consciente, profundidade',
      desequilibrio: 'Repressão, obsessão, manipulação, medo da vulnerabilidade',
    },
    source: 'tradition',
    confidence: 95,
    validated: true,
  },

  // ============================================================
  // XING (mapa complementar)
  // ============================================================
  {
    domain: 'xing-mapa',
    key: 'xing.introducao',
    data: {
      nome: 'Mapa de Xing',
      origem: 'Sistema de correlação energética complementar',
      descricao: 'Sistema integrativo que cruza elementos da Numerologia Cabalística com Kabbalah, Astrologia, I Ching e Tradições Orientais',
      aplicacao: ['Auto-conhecimento profundo', 'Ciclos energéticos', 'Decisões alinhadas'],
      elementosChave: ['8 trigramas do I Ching', '22 caminhos da Árvore da Vida', '9 números do Caminho de Vida'],
    },
    source: 'research',
    confidence: 75,
    validated: false,
  },
];

// ============================================================
// KNOWLEDGE BASE CLASS
// ============================================================

class FileBackedKB implements KnowledgeBase {
  public entries: KnowledgeEntry[] = [];
  private indexByDomain = new Map<KnowledgeDomain, Set<string>>();
  private indexByKey = new Map<string, KnowledgeEntry>();

  async load(): Promise<void> {
    if (!fs.existsSync(KB_DIR)) {
      fs.mkdirSync(KB_DIR, { recursive: true });
    }

    if (fs.existsSync(KB_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(KB_FILE, 'utf-8'));
        this.entries = data.entries || [];
        this.rebuildIndexes();
        console.log(`[KB] Carregado: ${this.entries.length} entradas`);
        return;
      } catch (err) {
        console.error('[KB] Erro ao carregar:', err);
      }
    }

    // Carrega seed data
    console.log(`[KB] Carregando seed data: ${SEED_KNOWLEDGE.length} entradas curadas`);
    for (const seed of SEED_KNOWLEDGE) {
      await this.add(seed);
    }
    await this.persist();
  }

  async add(entry: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<KnowledgeEntry> {
    const id = `kb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const now = new Date().toISOString();
    const newEntry: KnowledgeEntry = {
      ...entry,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.entries.push(newEntry);
    this.indexEntry(newEntry);
    return newEntry;
  }

  query(domain: KnowledgeDomain, key?: string): KnowledgeEntry[] {
    if (key) {
      const entry = this.indexByKey.get(`${domain}.${key}`);
      return entry ? [entry] : [];
    }
    const ids = this.indexByDomain.get(domain);
    if (!ids) return [];
    return Array.from(ids)
      .map(id => this.entries.find(e => e.id === id))
      .filter((e): e is KnowledgeEntry => Boolean(e));
  }

  getRelevant(domains: string[]): { entries: KnowledgeEntry[] } {
    const relevant: KnowledgeEntry[] = [];
    for (const domain of domains) {
      const d = domain as KnowledgeDomain;
      relevant.push(...this.query(d));
    }
    return { entries: relevant };
  }

  async validate(): Promise<{ valid: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Validação 1: Confidence mínimo
    for (const entry of this.entries) {
      if (entry.confidence < 50 && entry.validated) {
        issues.push(`${entry.domain}.${entry.key} - confiança baixa (${entry.confidence}%)`);
      }
    }

    // Validação 2: Orixás precisam ter quizilas
    const quizilasByOrixa = this.entries.filter(e => e.domain === 'quizilas');
    const orixasWithQuizila = new Set(quizilasByOrixa.map(e => e.key.split('.')[0]));
    if (orixasWithQuizila.size < 12) {
      issues.push(`Apenas ${orixasWithQuizila.size} Orixás com quizilas — esperado 12+`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }

  stats(): { entries: number; domains: number; byDomain: Record<string, number> } {
    const byDomain: Record<string, number> = {};
    for (const entry of this.entries) {
      byDomain[entry.domain] = (byDomain[entry.domain] || 0) + 1;
    }
    return {
      entries: this.entries.length,
      domains: Object.keys(byDomain).length,
      byDomain,
    };
  }

  async persist(): Promise<void> {
    try {
      fs.writeFileSync(
        KB_FILE,
        JSON.stringify({ entries: this.entries, updatedAt: new Date().toISOString() }, null, 2)
      );
    } catch (err) {
      console.error('[KB] Erro ao persistir:', err);
    }
  }

  private rebuildIndexes(): void {
    this.indexByDomain.clear();
    this.indexByKey.clear();
    for (const entry of this.entries) {
      this.indexEntry(entry);
    }
  }

  private indexEntry(entry: KnowledgeEntry): void {
    if (!this.indexByDomain.has(entry.domain)) {
      this.indexByDomain.set(entry.domain, new Set());
    }
    this.indexByDomain.get(entry.domain)!.add(entry.id);
    this.indexByKey.set(`${entry.domain}.${entry.key}`, entry);
  }
}

// ============================================================
// SINGLETON
// ============================================================

let kbInstance: FileBackedKB | null = null;

export function getKnowledgeBase(): KnowledgeBase {
  if (!kbInstance) {
    kbInstance = new FileBackedKB();
  }
  return kbInstance;
}
