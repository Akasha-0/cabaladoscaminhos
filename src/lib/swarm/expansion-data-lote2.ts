// fallow-ignore-file unused-file
// ============================================================
// KNOWLEDGE BASE - Auto-Expansão Contínua
// ============================================================
// Função que adiciona conhecimento expandido
// Roda a cada ciclo do self-improvement loop
// ============================================================

import { getKnowledgeBase } from './knowledge-base';
import type { KnowledgeEntry } from './swarm-types';

const LOTE_2: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Chás medicinais expandidos
  {
    domain: 'flora-sagrada',
    key: 'cha.boldo',
    data: {
      planta: 'Boldo (Peumus boldus)',
      uso: 'Chá digestivo e hepático',
      indicacao: ['Digestão difícil', 'Fígado', 'Mal-estar'],
      preparo: '1 colher de folhas secas em 200ml de água fervente, 10 min',
      contraindicacoes: ['Gestantes', 'Pessoas com obstrução biliar'],
      planeta: 'Mercúrio',
    },
    source: 'agent:flora-specialist',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'flora-sagrada',
    key: 'cha.hortela',
    data: {
      planta: 'Hortelã (Mentha spicata)',
      uso: 'Chá digestivo, refrescante',
      indicacao: ['Digestão', 'Gases', 'Frescor mental'],
      preparo: 'Infusão de folhas frescas, 5 min',
      contraindicacoes: ['Refluxo grave'],
      planeta: 'Mercúrio',
    },
    source: 'agent:flora-specialist',
    confidence: 95,
    validated: true,
  },
  {
    domain: 'flora-sagrada',
    key: 'cha.gengibre',
    data: {
      planta: 'Gengibre (Zingiber officinale)',
      uso: 'Chá termogênico, imunoestimulante',
      indicacao: ['Resfriados', 'Imunidade', 'Libido', 'Digestão'],
      preparo: 'Decocção da raiz fresca, 10 min, pode adicionar mel e limão',
      contraindicacoes: ['Pressão alta', 'Gestantes (dose alta)'],
      planeta: 'Sol',
    },
    source: 'agent:flora-specialist',
    confidence: 95,
    validated: true,
  },

  // Banhos de ervas expandidos
  {
    domain: 'flora-sagrada',
    key: 'banho.cabaca-de-ovo',
    data: {
      tipo: 'Banho de prosperidade e liderança',
      ingredientes: ['Cascas de cebola', 'Cascas de ovo', 'Mel', 'Vela branca'],
      preparo: 'Colocar cascas de cebola e ovo na água, ferver, abençoar com mel',
      indicacao: ['Prosperidade', 'Comando', 'Liderança'],
      orixas: ['Ogum', 'Oxalá', 'Xangô'],
    },
    source: 'agent:flora-specialist',
    confidence: 85,
    validated: true,
  },
  {
    domain: 'flora-sagrada',
    key: 'banho.sete-ervas',
    data: {
      tipo: 'Banho de limpeza profunda (7 ervas)',
      ingredientes: ['Arruda', 'Guiné', 'Manjericão', 'Hortelã', 'Alecrim', 'Espada-de-São-Jorge', 'Comigo-ninguém-pode'],
      preparo: 'Decocção de todas, tomar banho do pescoço para baixo',
      indicacao: ['Limpeza anual', 'Renovação', 'Quebra de demandas'],
      contraindicacoes: ['Gestantes'],
      poder: 'Muito forte, fazer apenas em momentos de necessidade',
    },
    source: 'agent:flora-specialist',
    confidence: 95,
    validated: true,
  },

  // Defumações
  {
    domain: 'flora-sagrada',
    key: 'defumacao.arruda-alecrim',
    data: {
      tipo: 'Defumação de proteção',
      ingredientes: ['Arruda', 'Alecrim', 'Benção'],
      preparo: 'Queimar em braseiro, abençoar o ambiente',
      indicacao: ['Limpar ambiente', 'Espantar energias negativas'],
      orixas: ['Oxalá', 'Exu', 'Omolu'],
    },
    source: 'agent:flora-specialist',
    confidence: 92,
    validated: true,
  },
  {
    domain: 'flora-sagrada',
    key: 'defumacao.benjoeiro',
    data: {
      tipo: 'Defumação de abertura',
      ingredientes: ['Resina de benjoeiro'],
      preparo: 'Queimar em braseiro',
      indicacao: ['Abertura de caminhos', 'Força', 'Encantamento'],
      orixas: ['Exu', 'Iansã'],
    },
    source: 'agent:flora-specialist',
    confidence: 90,
    validated: true,
  },

  // Rituais de cura
  {
    domain: 'corpos-pranicos',
    key: 'cura.pranamaya',
    data: {
      corpo: 'Pranamaya Kosha',
      pranas: ['Prana (entrada)', 'Apana (saída)'],
      praticas: {
        pranayama: {
          nome: 'Nadi Shodhana',
          descricao: 'Respiração alternada pelas narinas',
          duracao: '5-10 minutos',
          efeito: 'Equilibra Ida e Pingala, acalma o sistema nervoso',
        },
        asana: {
          nome: 'Tadasana + Savasana',
          efeito: 'Aterrar e expandir a respiração',
        },
      },
      desequilibrios: {
        baixaEnergia: 'Prana (respiração mais profunda)',
        ansiedade: 'Apana (raiz, aterrar)',
        digestao: 'Samana (fogo interno)',
      },
    },
    source: 'agent:tantra-specialist',
    confidence: 92,
    validated: true,
  },
  {
    domain: 'corpos-pranicos',
    key: 'cura.manomaya',
    data: {
      corpo: 'Manomaya Kosha',
      praticas: {
        meditacao: {
          nome: 'Meditação Vipassana',
          descricao: 'Observar pensamentos sem julgamento',
          duracao: '20 min',
        },
        journaling: 'Escrever 3 páginas toda manhã (Julia Cameron)',
        mindfulness: 'Presente contínuo',
      },
      desequilibrios: {
        ansiedade: 'Meditação, respiração',
        depressao: 'Terapia + práticas corporais',
        insonia: 'Ritual noturno, tela desligada 1h antes',
      },
    },
    source: 'agent:tantra-specialist',
    confidence: 90,
    validated: true,
  },

  // Sexualidade expandida - posições de tantra, práticas
  {
    domain: 'lilith-casa8-sexo',
    key: 'pratica.tantra',
    data: {
      nome: 'Tantra Sexual',
      origem: 'Tradição tântrica hindu',
      principios: ['Presença total', 'Respiração sincronizada', 'Sem objetivo final', 'Conexão divina'],
      praticas: [
        {
          nome: 'Respiração Conjunta',
          descricao: 'Respirar em sincronia com o parceiro(a) por 5 min',
          efeito: 'Conexão, sincronia energética',
        },
        {
          nome: 'Olhar Profundo',
          descricao: 'Olhar nos olhos por 5-10 min',
          efeito: 'Conexão anímica, vulnerabilidade',
        },
        {
          nome: 'Toque Consciente',
          descricao: 'Toque lento, sem objetivo, presente',
          efeito: 'Sensibilização do corpo, mindfulness',
        },
      ],
      contraindicacoes: 'Nenhuma - é para todos',
    },
    source: 'agent:sexuality-specialist',
    confidence: 90,
    validated: true,
  },
  {
    domain: 'lilith-casa8-sexo',
    key: 'pratica.kundalini-sexual',
    data: {
      nome: 'Kundalini e Sexualidade',
      descricao: 'A Kundalini desperta pelo sexo sagrado, transformando energia em consciência',
      praticas: [
        'Maithuna (união tântrica)',
        'Kumbhaka durante o ato',
        'Bandhas durante o clímax (transformação em vez de perda)',
      ],
      chakras: ['Muladhara (raiz)', 'Svadhisthana (prazer)', 'Sahasrara (iluminação)'],
      beneficios: ['Expansão da consciência', 'Prazer sem perda', 'União sagrada'],
    },
    source: 'agent:tantra-specialist',
    confidence: 85,
    validated: true,
  },

  // Odu compostos - exemplos selecionados
  {
    domain: 'odu',
    key: 'composto.ogbe-oyeku',
    data: {
      nome: 'Ogbe-Oyeku',
      composicao: 'Ogbe + Oyeku',
      significado: 'Cegueira espiritual + luz',
      fundamento: 'Momento de clarear a visão, sair da escuridão, ver a verdade',
      ebó: 'Galinha preta, abará',
      orixasAssociados: ['Oxalá', 'Omolu'],
      recomendacao: 'Buscar autoconhecimento, terapia, rituais de luz',
    },
    source: 'agent:odu-specialist',
    confidence: 80,
    validated: true,
  },
  {
    domain: 'odu',
    key: 'composto.iwori-odi',
    data: {
      nome: 'Iwori-Odi',
      composicao: 'Iwori + Odi',
      significado: 'Reconciliação profunda',
      fundamento: 'Momento de cura, perdão, reconexão',
      ebó: 'Pomba, arroz-doce',
      orixasAssociados: ['Oxum', 'Iemanjá'],
      recomendacao: 'Perdoar, reconciliar, fortalecer laços',
    },
    source: 'agent:odu-specialist',
    confidence: 82,
    validated: true,
  },
];

export async function expandKnowledgeBaseLote2(): Promise<{ added: number; total: number }> {
  const kb = getKnowledgeBase();
  await kb.load();

  let added = 0;
  for (const entry of LOTE_2) {
    const existing = kb.query(entry.domain, entry.key);
    if (existing.length === 0) {
      await kb.add(entry);
      added++;
    }
  }

  await kb.persist();
  const stats = kb.stats();
  return { added, total: stats.entries };
}
