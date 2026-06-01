// ============================================================
// TABELA DE DELEGAÇÃO DAS 36 CASAS DO BARALHO CIGANO
// ============================================================
// Esta é a peça central do sistema. Cada uma das 36 casas tem
// uma definição que DELEGA quais pontos astrológicos e números
// numerológicos devem ser cruzados durante a interpretação.
//
// REGRA DE OURO: A IA NUNCA pode misturar assuntos.
// Casa 24 (Amor) só pode falar de amor. Casa 34 (Dinheiro)
// só pode falar de dinheiro. A delegação existe para isso.
//
// Estrutura da fórmula:
//   Interpretação da Casa X = f(Propósito da Casa X +
//                                Carta Cigana sorteada +
//                                Odu de Búzios sorteado +
//                                Aspecto do Mapa Fixo delegado)

import type { HouseDefinition } from './house-types';

/**
 * TABELA MESTRA — 36 Casas
 */
export const HOUSES_36: HouseDefinition[] = [
  // =========================================================
  // BLOCO A — O Eu, a Vitalidade e o Começo da Vida (1-9)
  // =========================================================
  {
    number: 1,
    cartaCigana: 'O Mensageiro',
    keyword: 'início',
    bloco: 'A',
    tema: 'O Início, A Apresentação, A Raiz',
    significado:
      'Representa o começo de tudo. Como o consulente se apresenta ao mundo, sua primeira impressão, sua essência em estado puro. É a porta de entrada da jornada.',
    astrologia: ['ascendente'],
    numerologia: ['numero_alma'],
    corPrimaria: '#fbbf24', // amber
    corSecundaria: '#f59e0b',
    icone: 'Sun',
  },
  {
    number: 2,
    cartaCigana: 'A Trevo',
    keyword: 'trabalho',
    bloco: 'A',
    tema: 'O Trabalho, Os Obstáculos do Dia a Dia',
    significado:
      'A rotina de trabalho, os pequenos obstáculos que surgem no cotidiano, o esforço diário. Onde a pessoa gasta a maior parte do seu tempo.',
    astrologia: ['casa_6'],
    numerologia: ['numero_motivacao'],
    corPrimaria: '#10b981', // emerald
    corSecundaria: '#059669',
    icone: 'Briefcase',
  },
  {
    number: 3,
    cartaCigana: 'O Navio',
    keyword: 'mente',
    bloco: 'A',
    tema: 'A Mente, Viagens e Comunicação',
    significado:
      'A mente em movimento, as viagens físicas e mentais, a forma como a pessoa se comunica, os estudos iniciais e a curiosidade intelectual.',
    astrologia: ['casa_3', 'mercurio_natal'],
    numerologia: ['numero_expressao'],
    corPrimaria: '#06b6d4', // cyan
    corSecundaria: '#0891b2',
    icone: 'Ship',
  },
  {
    number: 4,
    cartaCigana: 'A Casa',
    keyword: 'lar',
    bloco: 'A',
    tema: 'O Lar, A Família, As Raízes',
    significado:
      'O ninho, a base emocional, a família de origem, a casa física e simbólica. Tudo que dá sustentação e segurança interna.',
    astrologia: ['casa_4', 'lua_natal'],
    numerologia: [],
    corPrimaria: '#a855f7', // purple
    corSecundaria: '#9333ea',
    icone: 'Home',
  },
  {
    number: 5,
    cartaCigana: 'A Árvore',
    keyword: 'saúde',
    bloco: 'A',
    tema: 'A Saúde, A Estrutura Vital, A Genética',
    significado:
      'A estrutura física e energética da pessoa, a saúde herdada, a vitalidade. O que precisa ser nutrido para crescer forte como uma árvore.',
    astrologia: [],
    numerologia: ['numero_destino'],
    corPrimaria: '#16a34a', // green
    corSecundaria: '#15803d',
    icone: 'TreePine',
  },
  {
    number: 6,
    cartaCigana: 'As Nuvens',
    keyword: 'dúvidas',
    bloco: 'A',
    tema: 'As Dúvidas, Os Desafios da Mente',
    significado:
      'A névoa mental, as dúvidas que confundem o caminho, a ansiedade, as preocupações que obscurecem a visão clara. Indica a necessidade de discernimento.',
    astrologia: [],
    numerologia: ['desafios_carmicos'],
    corPrimaria: '#64748b', // slate
    corSecundaria: '#475569',
    icone: 'Cloud',
  },
  {
    number: 7,
    cartaCigana: 'A Serpente',
    keyword: 'inveja',
    bloco: 'A',
    tema: 'A Inveja, O Alerta, O Ponto Cego',
    significado:
      'As forças ocultas, as sabotagens inconscientes, o que a pessoa não quer ver em si mesma. Alerta sobre energias externas e internas que precisam ser enfrentadas.',
    astrologia: ['lilith', 'plutao_natal'],
    numerologia: [],
    corPrimaria: '#dc2626', // red
    corSecundaria: '#b91c1c',
    icone: 'AlertTriangle',
  },
  {
    number: 8,
    cartaCigana: 'O Caixão',
    keyword: 'transformação',
    bloco: 'A',
    tema: 'A Transformação, A Morte do Ego',
    significado:
      'O fim de um ciclo, a morte simbólica do que precisa ser deixado para trás. Renascimento só vem depois da transformação radical.',
    astrologia: ['casa_8'],
    numerologia: ['numero_karma_tantrico'],
    corPrimaria: '#1e293b', // slate dark
    corSecundaria: '#0f172a',
    icone: 'Skull',
  },
  {
    number: 9,
    cartaCigana: 'O Buquê',
    keyword: 'surpresas',
    bloco: 'A',
    tema: 'As Surpresas, Os Dons, A Beleza',
    significado:
      'Os dons naturais que a pessoa trouxe para esta vida, as surpresas agradáveis, o que há de mais belo e delicado em sua essência.',
    astrologia: ['venus_natal'],
    numerologia: ['dons_divinos'],
    corPrimaria: '#ec4899', // pink
    corSecundaria: '#db2777',
    icone: 'Flower',
  },

  // =========================================================
  // BLOCO B — O Trabalho, Desafios Materiais e Sociedade (10-18)
  // =========================================================
  {
    number: 10,
    cartaCigana: 'A Foice',
    keyword: 'cortes',
    bloco: 'B',
    tema: 'Os Cortes do Destino, Maturidade',
    significado:
      'Onde o destino exige corte firme. Fim de ciclos, decisões drásticas necessárias, colheita após semeadura. Saturno como mestre.',
    astrologia: ['saturno_natal'],
    numerologia: [],
    corPrimaria: '#475569', // slate
    corSecundaria: '#334155',
    icone: 'Scissors',
  },
  {
    number: 11,
    cartaCigana: 'O Chicote',
    keyword: 'conflitos',
    bloco: 'B',
    tema: 'Os Conflitos, A Raiva, As Brigas',
    significado:
      'A reação instintiva, a raiva como defesa, os conflitos que surgem quando a pessoa se sente atacada. Marte como força motriz.',
    astrologia: ['marte_natal'],
    numerologia: [],
    corPrimaria: '#b91c1c', // dark red
    corSecundaria: '#991b1b',
    icone: 'Zap',
  },
  {
    number: 12,
    cartaCigana: 'Os Pássaros',
    keyword: 'parcerias',
    bloco: 'B',
    tema: 'As Parcerias Livres, A Comunicação',
    significado:
      'As conversas leves, os acordos informais, a comunicação que vem e vai, as parcerias não-vinculantes. Dom de se comunicar.',
    astrologia: [],
    numerologia: ['dominio_tantrico'],
    corPrimaria: '#3b82f6', // blue
    corSecundaria: '#2563eb',
    icone: 'Bird',
  },
  {
    number: 13,
    cartaCigana: 'A Criança',
    keyword: 'novos_começos',
    bloco: 'B',
    tema: 'Os Novos Começos, A Inovação',
    significado:
      'O nascimento de novos projetos, a energia da criança interior, a inovação e a criatividade que rompe padrões.',
    astrologia: [],
    numerologia: ['numero_missao'],
    corPrimaria: '#fbbf24', // amber
    corSecundaria: '#f59e0b',
    icone: 'Baby',
  },
  {
    number: 14,
    cartaCigana: 'A Raposa',
    keyword: 'estratégia',
    bloco: 'B',
    tema: 'A Estratégia, A Astúcia, A Sobrevivência',
    significado:
      'A inteligência afiada, a capacidade de adaptação, a estratégia de sobrevivência. Onde a pessoa é esperta além da conta.',
    astrologia: ['mercurio_natal', 'urano_natal'],
    numerologia: [],
    corPrimaria: '#f97316', // orange
    corSecundaria: '#ea580c',
    icone: 'Cat',
  },
  {
    number: 15,
    cartaCigana: 'O Urso',
    keyword: 'poder',
    bloco: 'B',
    tema: 'O Poder, As Autoridades, Os Inimigos',
    significado:
      'O poder pessoal, a figura do pai, a relação com autoridades, os adversários que precisam ser respeitados como mestres.',
    astrologia: ['sol_natal'],
    numerologia: [],
    corPrimaria: '#92400e', // brown
    corSecundaria: '#78350f',
    icone: 'Crown',
  },
  {
    number: 16,
    cartaCigana: 'A Estrela',
    keyword: 'espiritualidade',
    bloco: 'B',
    tema: 'A Espiritualidade, O Brilho Interior',
    significado:
      'O caminho da elevação, a conexão com o divino, os números mestres (7, 11, 22) que indicam missão espiritual. Onde a pessoa brilha.',
    astrologia: ['netuno_natal'],
    numerologia: ['caminho_de_vida'],
    corPrimaria: '#a78bfa', // violet
    corSecundaria: '#8b5cf6',
    icone: 'Star',
  },
  {
    number: 17,
    cartaCigana: 'A Cegonha',
    keyword: 'mudanças',
    bloco: 'B',
    tema: 'As Mudanças, A Migração, O Nodo',
    significado:
      'As grandes mudanças de vida, a migração, o deslocamento, o ponto nodal onde o destino muda de direção. Norte/Sul lunar.',
    astrologia: ['nodos_lunares'],
    numerologia: [],
    corPrimaria: '#0891b2', // cyan dark
    corSecundaria: '#0e7490',
    icone: 'Plane',
  },
  {
    number: 18,
    cartaCigana: 'O Cachorro',
    keyword: 'aliados',
    bloco: 'B',
    tema: 'Os Aliados, Os Amigos, Os Protetores',
    significado:
      'Os amigos verdadeiros, os aliados leais, os grupos de apoio, a proteção que vem de quem ama. Casa 11 astrológica.',
    astrologia: ['casa_11'],
    numerologia: [],
    corPrimaria: '#7c3aed', // violet
    corSecundaria: '#6d28d9',
    icone: 'Dog',
  },

  // =========================================================
  // BLOCO C — O Social, Documentos e Relacionamentos (19-27)
  // =========================================================
  {
    number: 19,
    cartaCigana: 'A Torre',
    keyword: 'introspecção',
    bloco: 'C',
    tema: 'A Introspecção, O Inconsciente',
    significado:
      'O retiro espiritual, a introspecção profunda, o inconsciente, os sonhos, a vida contemplativa. Casa 12 astrológica.',
    astrologia: ['casa_12'],
    numerologia: [],
    corPrimaria: '#6366f1', // indigo
    corSecundaria: '#4f46e5',
    icone: 'Castle',
  },
  {
    number: 20,
    cartaCigana: 'O Jardim',
    keyword: 'público',
    bloco: 'C',
    tema: 'O Público, A Vida Social, A Popularidade',
    significado:
      'A vida pública, o meio social, a forma como a pessoa é vista pela coletividade, os eventos e a vida ao ar livre.',
    astrologia: [],
    numerologia: [],
    corPrimaria: '#84cc16', // lime
    corSecundaria: '#65a30d',
    icone: 'Trees',
  },
  {
    number: 21,
    cartaCigana: 'A Montanha',
    keyword: 'bloqueios',
    bloco: 'C',
    tema: 'Os Bloqueios, A Justiça, A Lei',
    significado:
      'Os grandes bloqueios, os processos legais, a justiça que tarda mas não falha, a montanha que precisa ser escalada. Xangô como Orixá.',
    astrologia: [],
    numerologia: [],
    corPrimaria: '#78716c', // stone
    corSecundaria: '#57534e',
    icone: 'Mountain',
  },
  {
    number: 22,
    cartaCigana: 'Os Caminhos',
    keyword: 'escolhas',
    bloco: 'C',
    tema: 'As Escolhas, Os Cruzamentos',
    significado:
      'Os caminhos que se abrem, as encruzilhadas, as escolhas que mudam tudo. Cruzamentos de destino da Numerologia.',
    astrologia: [],
    numerologia: ['cruzamentosDestino'],
    corPrimaria: '#0d9488', // teal
    corSecundaria: '#0f766e',
    icone: 'GitFork',
  },
  {
    number: 23,
    cartaCigana: 'O Rato',
    keyword: 'desgaste',
    bloco: 'C',
    tema: 'O Desgaste, A Vulnerabilidade',
    significado:
      'O vazamento lento, o que drena a energia da pessoa sem que ela perceba, as pequenas perdas que viram grandes problemas.',
    astrologia: [],
    numerologia: ['ponto_vulnerabilidade'],
    corPrimaria: '#7c2d12', // dark orange
    corSecundaria: '#9a3412',
    icone: 'Bug',
  },
  {
    number: 24,
    cartaCigana: 'O Coração',
    keyword: 'sentimentos',
    bloco: 'C',
    tema: 'Os Sentimentos, A Forma de Amar',
    significado:
      'O coração, os sentimentos profundos, a forma como a pessoa ama, a capacidade de se conectar emocionalmente. Lua e Vênus.',
    astrologia: ['lua_natal', 'venus_natal'],
    numerologia: [],
    corPrimaria: '#f43f5e', // rose
    corSecundaria: '#e11d48',
    icone: 'Heart',
  },
  {
    number: 25,
    cartaCigana: 'O Anel',
    keyword: 'contratos',
    bloco: 'C',
    tema: 'Os Contratos, O Casamento, As Sociedades',
    significado:
      'Os contratos formais, o casamento, as sociedades, os acordos assinados. Tudo que vincula juridicamente ou emocionalmente. Casa 7.',
    astrologia: ['casa_7', 'descendente'],
    numerologia: [],
    corPrimaria: '#fbbf24', // gold
    corSecundaria: '#f59e0b',
    icone: 'Ring',
  },
  {
    number: 26,
    cartaCigana: 'O Livro',
    keyword: 'segredos',
    bloco: 'C',
    tema: 'Os Segredos, O Conhecimento Oculto',
    significado:
      'Os segredos que precisam ser revelados, o conhecimento oculto, os estudos profundos da Cabala, a sabedoria guardada.',
    astrologia: [],
    numerologia: [],
    corPrimaria: '#581c87', // dark purple
    corSecundaria: '#6b21a8',
    icone: 'Book',
  },
  {
    number: 27,
    cartaCigana: 'A Carta',
    keyword: 'notícias',
    bloco: 'C',
    tema: 'As Notícias, Os Documentos, As Mensagens',
    significado:
      'As notícias que chegam, os documentos importantes, as mensagens que mudam rumos. Tudo que vem por escrito.',
    astrologia: [],
    numerologia: [],
    corPrimaria: '#0284c7', // sky
    corSecundaria: '#0369a1',
    icone: 'Mail',
  },

  // =========================================================
  // BLOCO D — O Destino Final e a Consagração (28-36)
  // =========================================================
  {
    number: 28,
    cartaCigana: 'O Cigano',
    keyword: 'ação_masculina',
    bloco: 'D',
    tema: 'A Ação, A Força Masculina, A Iniciativa',
    significado:
      'A energia ativa, o princípio masculino, a capacidade de iniciar e agir. Marte e Sol do consulente. A vontade em movimento.',
    astrologia: ['marte_natal', 'sol_natal'],
    numerologia: [],
    corPrimaria: '#dc2626', // red
    corSecundaria: '#b91c1c',
    icone: 'Flame',
  },
  {
    number: 29,
    cartaCigana: 'A Cigana',
    keyword: 'intuição_feminina',
    bloco: 'D',
    tema: 'A Intuição, A Energia Feminina, A Recepção',
    significado:
      'A energia receptiva, o princípio feminino, a intuição profunda, o psiquismo. Lua e Netuno do consulente.',
    astrologia: ['lua_natal', 'netuno_natal'],
    numerologia: [],
    corPrimaria: '#c026d3', // fuchsia
    corSecundaria: '#a21caf',
    icone: 'Sparkles',
  },
  {
    number: 30,
    cartaCigana: 'Os Lírios',
    keyword: 'paz',
    bloco: 'D',
    tema: 'A Paz, A Maturidade, A Colheita',
    significado:
      'A maturidade serena, a paz conquistada com o tempo, a colheita de uma vida bem vivida, a sabedoria dos mais velhos.',
    astrologia: [],
    numerologia: ['numero_personalidade'],
    corPrimaria: '#fef3c7', // light amber
    corSecundaria: '#fde68a',
    icone: 'Flower2',
  },
  {
    number: 31,
    cartaCigana: 'O Sol',
    keyword: 'sucesso',
    bloco: 'D',
    tema: 'O Sucesso Máximo, O Ápice da Carreira',
    significado:
      'O auge da vida pública, o reconhecimento máximo, a consagração profissional. Casa 10 astrológica (Meio do Céu).',
    astrologia: ['casa_10', 'meio_do_ceu'],
    numerologia: [],
    corPrimaria: '#facc15', // yellow
    corSecundaria: '#eab308',
    icone: 'Sun',
  },
  {
    number: 32,
    cartaCigana: 'A Lua',
    keyword: 'honrarias',
    bloco: 'D',
    tema: 'As Honrarias, O Reconhecimento, A Mística',
    significado:
      'O reconhecimento social, a intuição mística que se torna pública, as honrarias que vêm do trabalho silencioso.',
    astrologia: [],
    numerologia: [],
    corPrimaria: '#bae6fd', // light blue
    corSecundaria: '#7dd3fc',
    icone: 'Moon',
  },
  {
    number: 33,
    cartaCigana: 'A Chave',
    keyword: 'soluções',
    bloco: 'D',
    tema: 'As Soluções, O Propósito Final',
    significado:
      'A chave que abre todas as portas, o propósito de vida que faz sentido, a solução para o quebra-cabeça existencial. Número de Missão.',
    astrologia: [],
    numerologia: ['numero_missao'],
    corPrimaria: '#fbbf24', // gold
    corSecundaria: '#d97706',
    icone: 'Key',
  },
  {
    number: 34,
    cartaCigana: 'Os Peixes',
    keyword: 'dinheiro',
    bloco: 'D',
    tema: 'O Dinheiro, As Finanças, O Bolso',
    significado:
      'O bolso, as finanças pessoais, como a pessoa ganha dinheiro, a relação material com o mundo. Casa 2 astrológica.',
    astrologia: ['casa_2'],
    numerologia: [],
    corPrimaria: '#10b981', // emerald
    corSecundaria: '#059669',
    icone: 'Coins',
  },
  {
    number: 35,
    cartaCigana: 'A Âncora',
    keyword: 'trabalho_fixo',
    bloco: 'D',
    tema: 'O Trabalho Fixo, A Estabilidade',
    significado:
      'A estabilidade profissional de longo prazo, o trabalho que dura, a âncora que mantém a pessoa firme no mundo material.',
    astrologia: [],
    numerologia: [],
    corPrimaria: '#0f766e', // dark teal
    corSecundaria: '#115e59',
    icone: 'Anchor',
  },
  {
    number: 36,
    cartaCigana: 'A Cruz',
    keyword: 'vitória_cármica',
    bloco: 'D',
    tema: 'A Vitória Cármica, A Superação Final',
    significado:
      'O veredito do destino, a cruz que cada um carrega, a superação final de todos os desafios. O ponto culminante de toda a jornada.',
    astrologia: [],
    numerologia: ['veredito_tantrico'],
    corPrimaria: '#7f1d1d', // deep red
    corSecundaria: '#991b1b',
    icone: 'Cross',
  },
];

/**
 * Busca casa por número
 */
export function getHouse(numero: number): HouseDefinition | undefined {
  return HOUSES_36.find((h) => h.number === numero);
}

/**
 * Casas por bloco
 */
export function getHousesByBlock(bloco: 'A' | 'B' | 'C' | 'D'): HouseDefinition[] {
  return HOUSES_36.filter((h) => h.bloco === bloco);
}

/**
 * Casas por pilar de síntese
 */
export function getHousesByPillar(
  pilar: 'trabalho_dinheiro' | 'lar_familia' | 'amor_relacionamentos' | 'conselho_espiritual'
): number[] {
  switch (pilar) {
    case 'trabalho_dinheiro':
      return [2, 8, 10, 12, 31, 34, 35];
    case 'lar_familia':
      return [4, 18, 30];
    case 'amor_relacionamentos':
      return [24, 25];
    case 'conselho_espiritual':
      return [1, 16, 33, 36];
  }
}
