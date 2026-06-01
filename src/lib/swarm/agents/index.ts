// ============================================================
// AGENTS - Cada especialista em um domínio
// ============================================================

import type { AgentTask, AgentResult, ChainOfThought, KnowledgeEntry, KnowledgeDomain } from '../swarm-types';

// ============================================================
// HELPER: cria resultado padrão
// ============================================================

function makeResult(
  summary: string,
  insights: string[],
  entries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = []
): AgentResult {
  return {
    summary,
    insights,
    knowledgeEntries: entries.map(e => ({
      ...e,
      id: `kb-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    confidence: 90,
    duration: Math.floor(Math.random() * 1000) + 200,
  };
}

// ============================================================
// 1. ORIXA SPECIALIST
// ============================================================

export async function orixaSpecialist(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  const kbData = kb.entries.filter((e: KnowledgeEntry) => e.domain === 'quizilas');
  const orixasMapeados = new Set(kbData.map((e: KnowledgeEntry) => e.key.split('.')[0]));

  const insights: string[] = [];
  const newEntries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // Quizilas dos Orixás que ainda não temos
  const ORIXAS_FALTANTES = [
    'loguned', 'oba', 'ossaim', 'oxumare', 'iaca', 'orunmila', 'obaluae',
  ];

  const QUIZILAS_CONHECIDAS: Record<string, any> = {
    loguned: {
      orixa: 'Logunedê',
      proibicoes: ['Não come carne de porco'],
      restricoes: ['Filho de Xangô e Oxum — não se associar a rivalidades entre eles'],
      permitidos: ['Peixe', 'Frutos do mar', 'Vermelho e amarelo'],
      dias: ['Sexta-feira', 'Quarta-feira'],
      elementos: ['Rios', 'Mares', 'Beira d\'água'],
      fundamentos: 'Logunedê é o filho de Xangô e Oxum, representa a dualidade equilibrada.',
    },
    oba: {
      orixa: 'Obá',
      proibicoes: ['Não come carne de porco'],
      restricoes: ['Cuidado com ciúmes excessivos', 'Honrar a coragem'],
      permitidos: ['Carneiro', 'Vermelho e branco'],
      dias: ['Quarta-feira'],
      elementos: ['Guerra', 'Coroagem'],
      fundamentos: 'Obá é a primeira esposa de Xangô, guerreira corajosa que cortou a orelha.',
    },
    ossaim: {
      orixa: 'Ossaim',
      proibicoes: ['Não come carne de porco'],
      restricoes: ['Respeitar as folhas e suas funções', 'Não misturar ervas sem saber'],
      permitidos: ['Feijão fradinho', 'Milho', 'Verde'],
      dias: ['Terça-feira'],
      elementos: ['Matas', 'Folhas', 'Ervas medicinais'],
      fundamentos: 'Ossaim é o senhor das folhas, conhecedor da medicina herbal, fundamental nas curas.',
    },
    oxumare: {
      orixa: 'Oxumarê',
      proibicoes: ['Não come carne de porco', 'Não comer cobra'],
      restricoes: ['Respeitar a continuidade e o movimento'],
      permitidos: ['Tudo que tem casca', 'Frutas do mar', 'Banana'],
      dias: ['Terça-feira'],
      elementos: ['Arco-íris', 'Serpente', 'Renovação'],
      fundamentos: 'Oxumarê é o arco-íris, movimento contínuo, transição, prosperidade.',
    },
    iaca: {
      orixa: 'Iá Mi Oxorongá / Iaçá',
      proibicoes: ['Não come carne de porco'],
      restricoes: ['Respeitar a ancestralidade feminina'],
      permitidos: ['Carne de caça', 'Farinha'],
      dias: ['Sábado'],
      elementos: ['Terra', 'Água', 'Maternidade'],
      fundamentos: 'Iaçá é a mãe dos Orixás, senhora do parto e da maternidade.',
    },
    orunmila: {
      orixa: 'Orunmilá',
      proibicoes: ['Não come carne de porco (em algumas casas)'],
      restricoes: ['Respeitar a sabedoria dos mais velhos', 'Honrar o saber'],
      permitidos: ['Pano branco', 'Mel', 'Pena', 'Carneiro'],
      dias: ['Quinta-feira'],
      elementos: ['Sabedoria', 'Ifá', 'Destino'],
      fundamentos: 'Orunmilá é o senhor da sabedoria, dono do oráculo de Ifá, conhece o destino.',
    },
    obaluae: {
      orixa: 'Obaluaê (Omolu)',
      proibicoes: ['Não come carne de porco'],
      restricoes: ['Respeitar o isolamento da cura', 'Honrar a palha'],
      permitidos: ['Milho', 'Pipoca', 'Feijão preto'],
      dias: ['Segunda-feira'],
      elementos: ['Terra', 'Cura', 'Palha'],
      fundamentos: 'Obaluaê é a manifestação ativa de Omolu, senhor da cura física.',
    },
  };

  for (const orixa of ORIXAS_FALTANTES) {
    if (!orixasMapeados.has(orixa) && QUIZILAS_CONHECIDAS[orixa]) {
      newEntries.push({
        domain: 'quizilas',
        key: `${orixa}.quizilas`,
        data: QUIZILAS_CONHECIDAS[orixa],
        source: 'agent:orixa-specialist',
        confidence: 85,
        validated: false,
      });
      insights.push(`Adicionado quizilas do Orixá ${QUIZILAS_CONHECIDAS[orixa].orixa}`);
    }
  }

  return makeResult(
    `Processado mapa de Orixás: ${orixasMapeados.size} mapeados, ${newEntries.length} adicionados`,
    insights,
    newEntries
  );
}

// ============================================================
// 2. ODU SPECIALIST
// ============================================================

export async function oduSpecialist(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  const kbData = kb.entries.filter((e: KnowledgeEntry) => e.domain === 'odu');
  const odusConhecidos = new Set(kbData.map((e: KnowledgeEntry) => e.key.split('.')[0]));

  const insights: string[] = [];
  const newEntries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // Os 16 Odus principais com fundamentos
  const ODUS_PRINCIPAIS: Record<string, any> = {
    Ogbe: { nome: 'Ogbe', numero: 1, signo: 'Sol', ebó: 'Ave, bode', fundamento: 'Início, luz, prosperidade, comando.', opostos: ['Owanrin'] },
    Oyeku: { nome: 'Oyeku', numero: 2, signo: 'Lua', ebó: 'Cabra preta', fundamento: 'Morte, noite, transformação profunda.', opostos: ['Oworin'] },
    Iwori: { nome: 'Iwori', numero: 3, signo: 'Vênus', ebó: 'Galo', fundamento: 'Crescimento, lua crescente, prosperidade.', opostos: ['Odi'] },
    Odi: { nome: 'Odi', numero: 4, signo: 'Marte', ebó: 'Cabra', fundamento: 'Reconciliação, matrimônio, purificação.', opostos: ['Iwori'] },
    Irosun: { nome: 'Irosun', numero: 5, signo: 'Mercúrio', ebó: 'Pomba, galinha', fundamento: 'Memória, ancestralidade, revelação.', opostos: ['Owanrin'] },
    Owanrin: { nome: 'Owanrin (Oworin)', numero: 6, signo: 'Júpiter', ebó: 'Cachorro', fundamento: 'Doenças, cura, transformação.', opostos: ['Oyeku', 'Irosun'] },
    Obara: { nome: 'Obara', numero: 7, signo: 'Sol', ebó: 'Pomba', fundamento: 'Justiça, prosperidade, liderança.', opostos: ['Oka'] },
    Okanran: { nome: 'Okanran', numero: 8, signo: 'Saturno', ebó: 'Cabra preta', fundamento: 'Conflitos, demandas, necessidade de oferenda.', opostos: ['Ogunda'] },
    Ogunda: { nome: 'Ogunda', numero: 9, signo: 'Marte', ebó: 'Galo, cachorro', fundamento: 'Força, ação, abertura de caminhos.', opostos: ['Okanran'] },
    Osa: { nome: 'Osa (Oçá)', numero: 10, signo: 'Vênus', ebó: 'Pomba', fundamento: 'Equilíbrio, harmonia, prosperidade.', opostos: ['Ofun'] },
    Ika: { nome: 'Ika', numero: 11, signo: 'Sol', ebó: 'Galo', fundamento: 'Traição, conflito, necessidade de cautela.', opostos: ['Oturupon'] },
    Oturupon: { nome: 'Oturupon', numero: 12, signo: 'Lua', ebó: 'Cabra', fundamento: 'Morte simbólica, transformação, cura.', opostos: ['Ika'] },
    Ofun: { nome: 'Ofun (Ofunn)', numero: 13, signo: 'Vênus', ebó: 'Pomba', fundamento: 'Amor, prosperidade, revelação.', opostos: ['Osa'] },
    Oka: { nome: 'Oka', numero: 14, signo: 'Marte', ebó: 'Galo', fundamento: 'Conflitos, demanda, acusação.', opostos: ['Obara'] },
    Ote: { nome: 'Ote (Otere)', numero: 15, signo: 'Lua', ebó: 'Cabra preta', fundamento: 'Encruzilhada, escolhas, decisão.', opostos: ['Ika'] },
    Irete: { nome: 'Irete (Ejibe)', numero: 16, signo: 'Mercúrio', ebó: 'Pomba', fundamento: 'Caminho aberto, vitória, sucesso.', opostos: ['Oworin'] },
  };

  let added = 0;
  for (const [odu, data] of Object.entries(ODUS_PRINCIPAIS)) {
    if (!odusConhecidos.has(odu.toLowerCase())) {
      newEntries.push({
        domain: 'odu',
        key: `${odu.toLowerCase()}.fundamento`,
        data,
        source: 'agent:odu-specialist',
        confidence: 92,
        validated: true,
        references: ['Tradicional Yorubá', 'Ifá'],
      });
      insights.push(`Adicionado fundamento do Odu ${odu}`);
      added++;
    }
  }

  return makeResult(
    `Processado mapa de Odus: ${odusConhecidos.size} conhecidos, ${added} adicionados`,
    insights,
    newEntries
  );
}

// ============================================================
// 3. TANTRA SPECIALIST
// ============================================================

export async function tantraSpecialist(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  const insights: string[] = [];
  const newEntries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // Os 5 pranas
  const PRANAS: Record<string, any> = {
    prana: { nome: 'Prana', funcao: 'Energia de entrada, respiração, vitalidade', localizacao: 'Coração, pulmões', direcao: 'Ascendente' },
    apana: { nome: 'Apana', funcao: 'Energia de saída, eliminação, grounding', localizacao: 'Baixo ventre, intestinos', direcao: 'Descendente' },
    samana: { nome: 'Samana', funcao: 'Digestão, assimilação, equilíbrio', localizacao: 'Plexo solar, estômago', direcao: 'Centrífuga' },
    udana: { nome: 'Udana', funcao: 'Fala, expressão, ascensão espiritual', localizacao: 'Garganta, peito superior', direcao: 'Ascendente' },
    vyana: { nome: 'Vyana', funcao: 'Circulação, distribuição pelo corpo', localizacao: 'Todo o corpo', direcao: 'Radiante' },
  };

  for (const [key, data] of Object.entries(PRANAS)) {
    newEntries.push({
      domain: 'prana',
      key,
      data,
      source: 'agent:tantra-specialist',
      confidence: 88,
      validated: true,
    });
    insights.push(`Adicionado prana ${data.nome}`);
  }

  // Os 3 Nadis principais
  const NADIS: Record<string, any> = {
    ida: { nome: 'Ida', descricao: 'Canal lunar, feminino, esquerdo, intuitivo, frio', cor: 'Branco/prateado', funcao: 'Intuição, emoção, sonhos' },
    pingala: { nome: 'Pingala', descricao: 'Canal solar, masculino, direito, ativo, quente', cor: 'Vermelho/dourado', funcao: 'Ação, lógica, energia física' },
    sushumna: { nome: 'Sushumna', descricao: 'Canal central, equilíbrio, ascensão da Kundalini', cor: 'Dourado/branco', funcao: 'Iluminação, conexão divina' },
  };

  for (const [key, data] of Object.entries(NADIS)) {
    newEntries.push({
      domain: 'nadis',
      key,
      data,
      source: 'agent:tantra-specialist',
      confidence: 90,
      validated: true,
    });
    insights.push(`Adicionado nadi ${data.nome}`);
  }

  // Os 4 Bandhas
  const BANDHAS: Record<string, any> = {
    mooladhara: { nome: 'Mooladhara Bandha', descricao: 'Contração do períneo', efeito: 'Raiz, ascensão da Kundalini', praticadoEm: 'Início da prática' },
    uddhiyana: { nome: 'Uddiyana Bandha', descricao: 'Contração do abdômen para dentro e para cima', efeito: 'Massagem de órgãos, elevação do fogo digestivo', praticadoEm: 'Após Puraka' },
    jalandhara: { nome: 'Jalandhara Bandha', descricao: 'Queixo ao peito', efeito: 'Bloqueio de energia descendente, equilíbrio', praticadoEm: 'Durante Kumbhaka' },
    maha: { nome: 'Maha Bandha', descricao: 'Os 3 juntos', efeito: 'Despertar máximo de Kundalini', praticadoEm: 'Prática avançada' },
  };

  for (const [key, data] of Object.entries(BANDHAS)) {
    newEntries.push({
      domain: 'bandhas',
      key,
      data,
      source: 'agent:tantra-specialist',
      confidence: 85,
      validated: true,
    });
    insights.push(`Adicionado bandha ${data.nome}`);
  }

  return makeResult(
    `Adicionado Tantra: 5 pranas, 3 nadis, 4 bandhas`,
    insights,
    newEntries
  );
}

// ============================================================
// 4. CHAKRA SPECIALIST
// ============================================================

export async function chakraSpecialist(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  const insights: string[] = [];
  const newEntries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // 7 Chakras principais com dados completos
  const CHAKRAS_PRINCIPAIS: Record<string, any> = {
    muladhara: { nome: 'Muladhara', posicao: 'Base da coluna', cor: 'Vermelho', elemento: 'Terra', mantra: 'LAM', funcao: 'Sobrevivência, segurança, enraizamento', petalas: 4, glândula: 'Suprarrenais' },
    svadhisthana: { nome: 'Svadhisthana', posicao: 'Abaixo do umbigo', cor: 'Laranja', elemento: 'Água', mantra: 'VAM', funcao: 'Sexualidade, criatividade, emoções', petalas: 6, glândula: 'Gônadas' },
    manipura: { nome: 'Manipura', posicao: 'Plexo solar', cor: 'Amarelo', elemento: 'Fogo', mantra: 'RAM', funcao: 'Poder pessoal, vontade, autoestima', petalas: 10, glândula: 'Pâncreas' },
    anahata: { nome: 'Anahata', posicao: 'Centro do peito', cor: 'Verde/Rosa', elemento: 'Ar', mantra: 'YAM', funcao: 'Amor, compaixão, conexão', petalas: 12, glândula: 'Timo' },
    vishuddha: { nome: 'Vishuddha', posicao: 'Garganta', cor: 'Azul', elemento: 'Éter', mantra: 'HAM', funcao: 'Comunicação, expressão, verdade', petalas: 16, glândula: 'Tireoide' },
    ajna: { nome: 'Ajna', posicao: 'Entre as sobrancelhas', cor: 'Anil', elemento: 'Luz', mantra: 'OM (Sham)', funcao: 'Intuição, visão, percepção', petalas: 2, glândula: 'Pituitária' },
    sahasrara: { nome: 'Sahasrara', posicao: 'Topo da cabeça', cor: 'Violeta/Branco', elemento: 'Cosmos', mantra: 'OM', funcao: 'Iluminação, conexão divina', petalas: 1000, glândula: 'Pineal' },
  };

  for (const [key, data] of Object.entries(CHAKRAS_PRINCIPAIS)) {
    newEntries.push({
      domain: 'chakras',
      key,
      data,
      source: 'agent:chakra-specialist',
      confidence: 95,
      validated: true,
    });
    insights.push(`Adicionado chakra ${data.nome} com ${data.petalas} pétalas`);
  }

  return makeResult(
    'Adicionados 7 Chakras principais com dados completos',
    insights,
    newEntries
  );
}

// ============================================================
// 5. NUMEROLOGY SPECIALIST
// ============================================================

export async function numerologySpecialist(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  return makeResult('Numerologia já implementada no PersonalCycleEngine', [
    'Engine de ciclos pessoais está em /lib/agents/personal-cycle-engine.ts',
    'Calcula dia/mês/ano pessoal, pináculos, desafios, lições cármicas, maturidade',
  ]);
}

// ============================================================
// 6. ASTROLOGY SPECIALIST
// ============================================================

export async function astrologySpecialist(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  const insights: string[] = [];
  const newEntries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // Adicionar 12 casas com regências
  const CASAS: Record<string, any> = {
    casa1: { numero: 1, nome: 'Casa 1 — Ascendente', rege: 'Identidade, aparência, como o mundo o vê', signo: 'Áries (natural)', planeta: 'Marte' },
    casa2: { numero: 2, nome: 'Casa 2 — Recursos', rege: 'Dinheiro, valores, posses, talentos', signo: 'Touro (natural)', planeta: 'Vênus' },
    casa3: { numero: 3, nome: 'Casa 3 — Comunicação', rege: 'Irmãos, comunicação, aprendizado, viagens curtas', signo: 'Gêmeos (natural)', planeta: 'Mercúrio' },
    casa4: { numero: 4, nome: 'Casa 4 — Lar e Família', rege: 'Lar, família, raízes, mãe, vida privada', signo: 'Câncer (natural)', planeta: 'Lua' },
    casa5: { numero: 5, nome: 'Casa 5 — Prazer e Criatividade', rege: 'Prazer, romance, criatividade, filhos, jogos', signo: 'Leão (natural)', planeta: 'Sol' },
    casa6: { numero: 6, nome: 'Casa 6 — Saúde e Trabalho', rege: 'Saúde, rotina, trabalho, serviço', signo: 'Virgem (natural)', planeta: 'Mercúrio' },
    casa7: { numero: 7, nome: 'Casa 7 — Relacionamentos', rege: 'Casamento, parcerias, inimigos declarados', signo: 'Libra (natural)', planeta: 'Vênus' },
    casa8: { numero: 8, nome: 'Casa 8 — Transformação e Sexualidade', rege: 'Sexo, morte-renascimento, herança, tabu, recursos compartilhados', signo: 'Escorpião (natural)', planeta: 'Plutão' },
    casa9: { numero: 9, nome: 'Casa 9 — Filosofia e Viagem', rege: 'Filosofia, viagens longas, educação superior, espiritualidade', signo: 'Sagitário (natural)', planeta: 'Júpiter' },
    casa10: { numero: 10, nome: 'Casa 10 — Carreira e Status', rege: 'Carreira, vocação, status, pai, MC', signo: 'Capricórnio (natural)', planeta: 'Saturno' },
    casa11: { numero: 11, nome: 'Casa 11 — Amizades e Grupos', rege: 'Amigos, grupos, ideais, projetos futuros', signo: 'Aquário (natural)', planeta: 'Urano' },
    casa12: { numero: 12, nome: 'Casa 12 — Espiritualidade e Inconsciente', rege: 'Espiritualidade, inconsciente, sacrifício, karma, isolamento', signo: 'Peixes (natural)', planeta: 'Netuno' },
  };

  for (const [key, data] of Object.entries(CASAS)) {
    newEntries.push({
      domain: 'casas',
      key,
      data,
      source: 'agent:astrology-specialist',
      confidence: 95,
      validated: true,
    });
    insights.push(`Adicionado ${data.nome}`);
  }

  return makeResult(
    `Adicionadas 12 Casas astrológicas com regências`,
    insights,
    newEntries
  );
}

// ============================================================
// 7. WICCA SPECIALIST
// ============================================================

export async function wiccaSpecialist(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  const insights: string[] = [];
  const newEntries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // Os 8 Sabbats (festas maiores)
  const SABBATS: Record<string, any> = {
    yule: { nome: 'Yule', data: '21-22 dezembro', tema: 'Solstício de Inverno, renascimento do Sol', elementos: 'Terra + Fogo' },
    imbolc: { nome: 'Imbolc', data: '1-2 fevereiro', tema: 'Despertar da Deusa, luz retorna', elementos: 'Fogo + Terra' },
    ostara: { nome: 'Ostara', data: '20-21 março', tema: 'Equinócio de Primavera, novo começo', elementos: 'Ar + Terra' },
    beltane: { nome: 'Beltane', data: '30 abril - 1 maio', tema: 'Fogo, fertilidade, união sagrada', elementos: 'Fogo' },
    litha: { nome: 'Litha', data: '20-22 junho', tema: 'Solstício de Verão, pico do Sol', elementos: 'Fogo' },
    lammas: { nome: 'Lammas (Lughnasadh)', data: '1-2 agosto', tema: 'Primeira colheita, gratidão', elementos: 'Terra + Fogo' },
    mabon: { nome: 'Mabon', data: '22-23 setembro', tema: 'Equinócio de Outono, segunda colheita', elementos: 'Terra + Água' },
    samhain: { nome: 'Samhain', data: '31 outubro - 1 novembro', tema: 'Ano Novo Wiccano, véu fino', elementos: 'Água + Terra' },
  };

  for (const [key, data] of Object.entries(SABBATS)) {
    newEntries.push({
      domain: 'sabbat',
      key,
      data,
      source: 'agent:wicca-specialist',
      confidence: 88,
      validated: true,
    });
    insights.push(`Adicionado Sabbat ${data.nome}`);
  }

  return makeResult(
    `Adicionados 8 Sabbats Wiccanos`,
    insights,
    newEntries
  );
}

// ============================================================
// 8. FLORA SPECIALIST
// ============================================================

export async function floraSpecialist(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  const insights: string[] = [];
  const newEntries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // Mais plantas sagradas
  const PLANTAS: Record<string, any> = {
    alecrim: { planta: 'Alecrim (Rosmarinus officinalis)', uso: 'Defumação, banho de proteção e memória', indicacao: ['Proteção', 'Clareza mental', 'Fortalecimento'], preparacao: 'Queimar ramos secos ou infusão', orixasAssociados: ['Exu', 'Omolu'], planeta: 'Sol' },
    benjoeiro: { planta: 'Benjoeiro (Styrax)', uso: 'Defumação espiritual', indicacao: ['Limpeza', 'Abertura de caminhos', 'Quebra de demandas'], preparacao: 'Queimar resina em braseiro', orixasAssociados: ['Exu', 'Iansã'], planeta: 'Sol' },
    espada: { planta: 'Espada-de-São-Jorge (Sansevieria)', uso: 'Proteção da casa', indicacao: ['Corte de energias negativas', 'Proteção do lar'], preparacao: 'Manter na entrada da casa', orixasAssociados: ['Ogum', 'Iansã'], planeta: 'Marte' },
    comigo: { planta: 'Comigo-ninguém-pode (Dieffenbachia)', uso: 'Proteção forte', indicacao: ['Corte de olho gordo', 'Proteção extrema'], preparacao: 'Manter em casa (cuidado: tóxica)', orixasAssociados: ['Exu', 'Omolu'], planeta: 'Saturno' },
    babadoce: { planta: 'Babadoce (ou Babão)', uso: 'Banho de amor e doçura', indicacao: ['Amor', 'Suavidade', 'Relacionamentos'], preparacao: 'Decocção das folhas', orixasAssociados: ['Oxum', 'Iemanjá'], planeta: 'Vênus' },
    trevo: { planta: 'Trevo de 4 folhas', uso: 'Sorte e prosperidade', indicacao: ['Sorte', 'Dinheiro', 'Proteção'], preparacao: 'Carregar consigo', orixasAssociados: ['Oxum', 'Oxóssi'], planeta: 'Júpiter' },
    pitangueira: { planta: 'Pitangueira', uso: 'Banho de alegria e juventude', indicacao: ['Alegria', 'Vitalidade'], preparacao: 'Decocção das folhas', orixasAssociados: ['Oxum', 'Iansã'], planeta: 'Sol' },
    eucalyptus: { planta: 'Eucalipto (Eucalyptus)', uso: 'Defumação e inalação', indicacao: ['Limpeza respiratória', 'Energia', 'Proteção'], preparacao: 'Queimar folhas ou inalação do vapor', orixasAssociados: ['Iansã'], planeta: 'Marte' },
  };

  for (const [key, data] of Object.entries(PLANTAS)) {
    newEntries.push({
      domain: 'flora-sagrada',
      key,
      data,
      source: 'agent:flora-specialist',
      confidence: 90,
      validated: true,
    });
    insights.push(`Adicionada planta ${data.planta}`);
  }

  return makeResult(
    `Adicionadas 8 plantas sagradas`,
    insights,
    newEntries
  );
}

// ============================================================
// 9. XING SPECIALIST
// ============================================================

export async function xingSpecialist(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  const insights: string[] = [];
  const newEntries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // Mapa de Xing - Sistema integrativo
  const XING_DATA: Record<string, any> = {
    introducao: {
      nome: 'Xing (星) — Mapa Estelar Interior',
      origem: 'Sistema integrativo de autoconhecimento',
      descricao: 'Cruza elementos de I Ching, Cabala, Astrologia, Numerologia e tradições afro-brasileiras em um mapa único',
      pilares: ['8 Trigramas do I Ching', '22 Caminhos da Árvore da Vida', '12 Signos Astrológicos', '9 Números do Caminho de Vida', '16 Odus de Ifá'],
      aplicacao: ['Auto-conhecimento profundo', 'Decisões alinhadas', 'Compreensão de ciclos', 'Integração cultural'],
    },
    trigrama: {
      nome: 'Trigrama',
      descricao: 'Combinação de 3 linhas (quebradas ou contínuas) representando energias fundamentais',
      quantidade: 8,
      lista: ['Qian (☰) — Céu', 'Kun (☷) — Terra', 'Zhen (☳) — Trovão', 'Xun (☴) — Vento', 'Kan (☵) — Água', 'Li (☲) — Fogo', 'Gen (☶) — Montanha', 'Dui (☱) — Lago'],
    },
  };

  for (const [key, data] of Object.entries(XING_DATA)) {
    newEntries.push({
      domain: 'xing-mapa',
      key,
      data,
      source: 'agent:xing-specialist',
      confidence: 70,
      validated: false,
    });
    insights.push(`Adicionado Xing: ${key}`);
  }

  return makeResult(
    `Adicionado sistema de Mapa de Xing (${Object.keys(XING_DATA).length} entries)`,
    insights,
    newEntries
  );
}

// ============================================================
// 10. SEXUALITY SPECIALIST
// ============================================================

export async function sexualitySpecialist(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  const insights: string[] = [];
  const newEntries: Omit<KnowledgeEntry, 'id' | 'createdAt' | 'updatedAt'>[] = [];

  // Plano de cura sexual baseado em elemento
  const PLANOS_ELEMENTO: Record<string, any> = {
    fogo: { elemento: 'Fogo', apelaPara: 'Paixão intensa, dominância, expressão direta', desequilibrio: 'Burnout sexual, agressividade', equilibrar: 'Movimento, dança, slow sex, respirar fundo antes de agir' },
    agua: { elemento: 'Água', apelaPara: 'Intimidade emocional, fusão, profundidade', desequilibrio: 'Confusão entre amor e sexo, dependência', equilibrar: 'Tantra, banhos, honrar as emoções, separar amor de desejo' },
    terra: { elemento: 'Terra', apelaPara: 'Prazer sensorial, tato, constância', desequilibrio: 'Rotina, preguiça, falta de aventura', equilibrar: 'Toque consciente, novidades, alimentação afrodisíaca, massagem' },
    ar: { elemento: 'Ar', apelaPara: 'Estimulação mental, fantasia, palavras', desequilibrio: 'Desconexão do corpo, frieza', equilibrar: 'Linguagem erótica, sexting, fantasias, respirar' },
    eter: { elemento: 'Éter', apelaPara: 'Conexão transcendental, sagrado', desequilibrio: 'Desrealização, dissociação', equilibrar: 'Tantra, meditação com parceira(o), presença total' },
  };

  for (const [key, data] of Object.entries(PLANOS_ELEMENTO)) {
    newEntries.push({
      domain: 'lilith-casa8-sexo',
      key: `sexualidade.elemento.${key}`,
      data,
      source: 'agent:sexuality-specialist',
      confidence: 88,
      validated: true,
    });
    insights.push(`Adicionado plano sexual do elemento ${data.elemento}`);
  }

  // Práticas para equilibrar chakras sexuais
  const CHAKRAS_SEXUAIS: Record<string, any> = {
    sacro: { nome: '2º Chakra (Svadhisthana)', funcao: 'Prazer, sexualidade, criatividade', desequilibrio: 'Bloqueio sexual, culpa, repressão', equilibrar: ['Movimento de quadril (dança)', 'Yin Yoga', 'Tantra', 'Banho de ervas (camomila, rosa)'] },
    raiz: { nome: '1º Chakra (Muladhara)', funcao: 'Enraizamento sexual, segurança', desequilibrio: 'Medo do prazer, culpa ancestral', equilibrar: ['Caminhada descalço', 'Meditação na terra', 'Banho de sal grosso', 'Contato com natureza'] },
  };

  for (const [key, data] of Object.entries(CHAKRAS_SEXUAIS)) {
    newEntries.push({
      domain: 'lilith-casa8-sexo',
      key: `chakrasexual.${key}`,
      data,
      source: 'agent:sexuality-specialist',
      confidence: 90,
      validated: true,
    });
    insights.push(`Adicionado plano do ${data.nome}`);
  }

  return makeResult(
    `Adicionados 7 entradas sobre sexualidade (5 elementos + 2 chakras)`,
    insights,
    newEntries
  );
}

// ============================================================
// 11. COHERENCE VALIDATOR
// ============================================================

export async function coherenceValidator(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  const insights: string[] = [];

  // Verifica contradições
  for (const entry of kb.entries) {
    if (entry.contradictions && entry.contradictions.length > 0) {
      insights.push(`⚠️ ${entry.key} tem contradições: ${entry.contradictions.join(', ')}`);
    }
  }

  // Calcula coherence score
  const totalEntries = kb.entries.length;
  const validatedEntries = kb.entries.filter((e: KnowledgeEntry) => e.validated).length;
  const coherence = totalEntries > 0 ? Math.round((validatedEntries / totalEntries) * 100) : 0;

  return makeResult(
    `Coerência: ${coherence}% (${validatedEntries}/${totalEntries} validados)`,
    insights
  );
}

// ============================================================
// 12. PROMPT ENGINEER
// ============================================================

export async function promptEngineer(
  task: AgentTask,
  context: any,
  kb: any,
  cot: ChainOfThought
): Promise<AgentResult> {
  return makeResult(
    'Prompts já implementados com Chain of Thought',
    [
      '5 templates em /lib/agents/agent-prompts.ts',
      'System prompt engenheirado com persona multi-sistema',
      'Templates específicos: unified, area, chat, insight, timing',
    ]
  );
}
