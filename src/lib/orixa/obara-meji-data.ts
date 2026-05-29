// @ts-nocheck
// SKIP_LINT

/**
 * Obara Meji Data
 * Odu of peaceful crossroads, balance, and harmonious partnerships
 * Represents the twin aspects of Obara's wind bringing balance and stability
 */

// Obara Meji represents the double manifestation of peaceful crossroads
// where harmony and balance create stable foundations
// Governed by the wind of communication and the earth of grounded partnerships
// Element: Wind and Earth
// Represents communication, partnerships, balance, and harmony

export interface ObaraMejiOdu {
  id: string;
  name: string;
  portugueseName: string;
  order: number;
  polarity: 'masculine' | 'feminine';
  element: string;
  planets: string[];
  sephirot: string[];
  sign: string;
  dayOfWeek: string;
  direction: string;
  colors: string[];
  offerings: string[];
  ebos: string[];
  taboos: string[];
  strengths: string[];
  weaknesses: string[];
  health: string[];
  meanings: string[];
  ifaMessage: string;
}

const OBARA_MEJI_DATA: ObaraMejiOdu[] = [
  {
    id: 'obara-ros',
    name: 'Obara Ros',
    portugueseName: 'Obara Ros',
    order: 1,
    polarity: 'feminine',
    element: 'Vento Suave',
    planets: ['Mercurio', 'Venus'],
    sephirot: ['Hod', 'Netzach'],
    sign: 'Gemeos, Libra',
    dayOfWeek: 'Quarta-feira',
    direction: 'Norte',
    colors: ['Verde claro', 'Rosa', 'Branco'],
    offerings: ['Folhas verdes', 'Flores suaves', 'Azeite doce', 'Milho'],
    ebos: ['Ebo de harmonia', 'Ebo de comunicacao pacifica'],
    taboos: ['Nao conflitar unnecessarily', 'Nao suprimir a voz'],
    strengths: ['Comunicacao', 'Harmonia', 'Diplomacia'],
    weaknesses: ['Indecisao', 'Evasao de conflitos'],
    health: ['Pulmoes', 'Bracos', 'Sistema nervoso'],
    meanings: ['Harmonia suave', 'Comunicacao pacifica', 'Equilibrio', 'Diplomacia'],
    ifaMessage: 'Obara Ros sopra como brisa suave que traz harmonia, revelando que a verdadeira paz se constroi com palavras gentis e gestos equilibrada.',
  },
  {
    id: 'obara-da',
    name: 'Obara Da',
    portugueseName: 'Obara Da',
    order: 2,
    polarity: 'masculine',
    element: 'Terra Estavel',
    planets: ['Saturno', 'Terra'],
    sephirot: ['Malkuth', 'Yesod'],
    sign: 'Touro, Capricornio',
    dayOfWeek: 'Quarta-feira',
    direction: 'Sul',
    colors: ['Marrom', 'Verde', 'Amarelo'],
    offerings: ['Raizes', 'Terra', 'Milho', 'Folhas secas'],
    ebos: ['Ebo de ancoragem', 'Ebo de坚固基础'],
    taboos: ['Nao abandonar compromissos', 'Nao perder o centro'],
    strengths: ['Estabilidade', 'Confiabilidade', 'Fundamento'],
    weaknesses: ['Rigidez', 'Teimosia'],
    health: ['Pernas', 'Pés', 'Ossos'],
    meanings: ['Estabilidade', 'Confiabilidade', 'Fundamento solido', 'Compromisso'],
    ifaMessage: 'Obara Da crava razes profundas na terra firme, revelando que a verdadeira forca vem da constancia e do compromisso com a verdade.',
  },
  {
    id: 'obara-se',
    name: 'Obara Se',
    portugueseName: 'Obara Se',
    order: 3,
    polarity: 'feminine',
    element: 'Ar de Comunicacao',
    planets: ['Mercurio', 'Lua'],
    sephirot: ['Hod', 'Yesod'],
    sign: 'Gemeos, Virgem',
    dayOfWeek: 'Quarta-feira',
    direction: 'Leste',
    colors: ['Amarelo', 'Branco', 'Verde claro'],
    offerings: ['Folhas', 'Sementes', 'Azeite', 'Milho verde'],
    ebos: ['Ebo de clareza', 'Ebo de expressao verdadeira'],
    taboos: ['Nao mentir', 'Nao calar verdades'],
    strengths: ['Clareza', 'Expressao', 'Verdade'],
    weaknesses: ['Crudeza', 'Falta de tato'],
    health: ['Maos', 'Ombros', 'Laringe'],
    meanings: ['Clareza', 'Verdade', 'Expressao autêntica', 'Comunicacao honesta'],
    ifaMessage: 'Obara Se eleva como vento que carrega a verdade, revelando que a verdadeira comunicacao nasce da honestidade com amor.',
  },
  {
    id: 'obara-kan',
    name: 'Obara Kan',
    portugueseName: 'Obara Kan',
    order: 4,
    polarity: 'masculine',
    element: 'Metal de Protecao',
    planets: ['Marte', 'Saturno'],
    sephirot: ['Geburah', 'Malkuth'],
    sign: 'Escorpiao, Capricornio',
    dayOfWeek: 'Terca-feira',
    direction: 'Noroeste',
    colors: ['Cinza', 'Verde escuro', 'Marrom'],
    offerings: ['Ferro', 'Palmeira', 'Azeite de dendê', 'Folhas protegidas'],
    ebos: ['Ebo de protecao', 'Ebo de limites saudáveis'],
    taboos: ['Nao permitir invasoes', 'Nao violar fronteiras'],
    strengths: ['Protecao', 'Limites', 'Forca defensiva'],
    weaknesses: ['Paranoia', 'Excesso de controle'],
    health: ['Articulacoes', 'Joelhos', 'Quadris'],
    meanings: ['Protecao', 'Limites', 'Defesa', 'Seguranca'],
    ifaMessage: 'Obara Kan ergue barreiras de ferro para proteger o sagrado, revelando que limites saudaveis sao actos de amor proprio e alheio.',
  },
  {
    id: 'obara-rosi',
    name: 'Obara Rosi',
    portugueseName: 'Obara Rosi',
    order: 5,
    polarity: 'feminine',
    element: 'Agua Serena',
    planets: ['Lua', 'Venus'],
    sephirot: ['Yesod', 'Netzach'],
    sign: 'Cancer, Libra',
    dayOfWeek: 'Segunda-feira',
    direction: 'Oeste',
    colors: ['Azul claro', 'Rosa', 'Verde agua'],
    offerings: ['Agua fresca', 'Flores suaves', 'Azeite', 'Leite'],
    ebos: ['Ebo de serenidade', 'Ebo de relacionamentos harmoniosos'],
    taboos: ['Nao criar turbulentas', 'Nao reter aguas calmas'],
    strengths: ['Serenidade', 'Flexibilidade', 'Equilibrio emocional'],
    weaknesses: ['Supressao', 'Passividade excessiva'],
    health: ['Rins', 'Bexiga', 'Sistema linfatico'],
    meanings: ['Serenidade', 'Flexibilidade', 'Equilibrio', 'Harmonia emocional'],
    ifaMessage: 'Obara Rosi flui como aguas serenas que equilibram, revelando que a verdadeira forca esta na capacidade de manter a paz em tempestades.',
  },
  {
    id: 'obara-oni',
    name: 'Obara Oni',
    portugueseName: 'Obara Oni',
    order: 6,
    polarity: 'masculine',
    element: 'Fogo de Justicia',
    planets: ['Sol', 'Marte'],
    sephirot: ['Tiphareth', 'Geburah'],
    sign: 'Leao, Aries',
    dayOfWeek: 'Domingo',
    direction: 'Sul',
    colors: ['Vermelho', 'Verde', 'Laranja'],
    offerings: ['Pimenta', 'Azeite', 'Folhas de Palmeira', 'Milho assado'],
    ebos: ['Ebo de justica', 'Ebo de coragem moral'],
    taboos: ['Nao tolerar injustica', 'Nao desistir do certo'],
    strengths: ['Justica', 'Coragem', 'Integridade'],
    weaknesses: ['Impaciencia', 'Rigidez moral'],
    health: ['Coracao', 'Musculos', 'Sangue'],
    meanings: ['Justica', 'Coragem', 'Integridade', 'Defesa do certo'],
    ifaMessage: 'Obara Oni flameja com o fogo da justica que purifica, revelando que a verdadeira forca esta em defender a verdade com coragem.',
  },
  {
    id: 'obara-te',
    name: 'Obara Te',
    portugueseName: 'Obara Te',
    order: 7,
    polarity: 'feminine',
    element: 'Terra Fertil',
    planets: ['Venus', 'Terra'],
    sephirot: ['Netzach', 'Malkuth'],
    sign: 'Touro, Virgem',
    dayOfWeek: 'Sexta-feira',
    direction: 'Norte',
    colors: ['Verde', 'Marrom claro', 'Amarelo terra'],
    offerings: ['Frutas da terra', 'Folhas frescas', 'Raizes', 'Mel'],
    ebos: ['Ebo de fertilidade', 'Ebo de crescimento harmonioso'],
    taboos: ['Nao desperdicAR recursos', 'Nao bloquear crescimento'],
    strengths: ['Fertilidade', 'Crescimento', 'Nutricao'],
    weaknesses: ['Apego material', 'Superproteccao'],
    health: ['Estomago', 'Intestinos', 'Pele'],
    meanings: ['Fertilidade', 'Crescimento', 'Nutricao', 'Abundancia harmoniosa'],
    ifaMessage: 'Obara Te germina como semente em terra fertil, revelando que o verdadeiro crescimento acontece quando ha equilibrio entre dar e receber.',
  },
  {
    id: 'obara-tura',
    name: 'Obara Tura',
    portugueseName: 'Obara Tura',
    order: 8,
    polarity: 'masculine',
    element: 'Metal Forjado',
    planets: ['Marte', 'Ferro'],
    sephirot: ['Geburah', 'Hod'],
    sign: 'Aries, Escorpiao',
    dayOfWeek: 'Terca-feira',
    direction: 'Nordeste',
    colors: ['Cinza', 'Preto', 'Vermelho escuro'],
    offerings: ['Ferro forjado', 'Carvao', 'Azeite', 'Pimenta'],
    ebos: ['Ebo de forja', 'Ebo de transformacao'],
    taboos: ['Nao desistir no fogo', 'Nao abandonar a forja'],
    strengths: ['Forja', 'Transformacao', 'Resiliencia'],
    weaknesses: ['Dureza', 'Inflexibilidade'],
    health: ['Dentes', 'Ossos', 'Musculos'],
    meanings: ['Forja', 'Transformacao', 'Resiliencia', 'Rejuvenescimento'],
    ifaMessage: 'Obara Tura suporta o fogo da forja que fortalece, revelando que a verdadeira resiliencia se forja nos desafios que enfrentamos.',
  },
  {
    id: 'obara-rin',
    name: 'Obara Rin',
    portugueseName: 'Obara Rin',
    order: 9,
    polarity: 'feminine',
    element: 'Vento de Mudanca',
    planets: ['Mercurio', 'Jupiter'],
    sephirot: ['Hod', 'Chesed'],
    sign: 'Gemeos, Sagitario',
    dayOfWeek: 'Quinta-feira',
    direction: 'Norte',
    colors: ['Amarelo', 'Laranja', 'Verde vibrante'],
    offerings: ['Folhas novas', 'Frutas frescas', 'Azeite', 'Sementes'],
    ebos: ['Ebo de renovacao', 'Ebo de abertura'],
    taboos: ['Nao resistir mudanca', 'Nao fechar portas'],
    strengths: ['Adaptacao', 'Abertura', 'Renovacao'],
    weaknesses: ['Inconstancia', 'Superficialidade'],
    health: ['Ombros', 'Bracos', 'Pulmoes'],
    meanings: ['Adaptacao', 'Renovacao', 'Abertura', 'Flexibilidade'],
    ifaMessage: 'Obara Rin muda como vento que traz novos aromas, revelando que a verdadeira sabedoria esta em aceitar a impermanencia com graia.',
  },
  {
    id: 'obara-fun',
    name: 'Obara Fun',
    portugueseName: 'Obara Fun',
    order: 10,
    polarity: 'masculine',
    element: 'Terra Profunda',
    planets: ['Saturno', 'Netuno'],
    sephirot: ['Binah', 'Malkuth'],
    sign: 'Capricornio, Peixes',
    dayOfWeek: 'Quarta-feira',
    direction: 'Sul',
    colors: ['Roxo', 'Marrom escuro', 'Verde profundo'],
    offerings: ['Terra escura', 'Raizes profundas', 'Azeite', 'Folhas secas'],
    ebos: ['Ebo de profundeza', 'Ebo de conexao espiritual'],
    taboos: ['Nao ignorar a sabedoria interior', 'Nao perder raizes'],
    strengths: ['Profundidade', 'Sabedoria', 'Conexao'],
    weaknesses: ['Melancolia', 'Isolamento'],
    health: ['Pernas', 'Pes', 'Articulacoes'],
    meanings: ['Profundidade', 'Sabedoria interior', 'Conexao sagrada', 'Enraizamento'],
    ifaMessage: 'Obara Fun desce as raizes ate as aguas subterraneas, revelando que a verdadeira sabedoria habita nas profundezas silenciosas da alma.',
  },
  {
    id: 'obara-je',
    name: 'Obara Je',
    portugueseName: 'Obara Je',
    order: 11,
    polarity: 'feminine',
    element: 'Agua de Vida',
    planets: ['Lua', 'Sol'],
    sephirot: ['Yesod', 'Tiphareth'],
    sign: 'Cancer, Leao',
    dayOfWeek: 'Segunda-feira',
    direction: 'Oeste',
    colors: ['Azul', 'Dourado', 'Verde claro'],
    offerings: ['Agua pura', 'Mel', 'Flores', 'Azeite'],
    ebos: ['Ebo de vida', 'Ebo de renovacao interior'],
    taboos: ['Nao contaminar fontes', 'Nao bloquear fluxo'],
    strengths: ['Vida', 'Renovacao', 'Fluidez'],
    weaknesses: ['Emocionalismo', 'Dependencia'],
    health: ['Seios', 'Utero', 'Sistema imunologico'],
    meanings: ['Vida', 'Renovacao', 'Fluidez', 'Ciclo continuo'],
    ifaMessage: 'Obara Je flui como fonte de vida que renova, revelando que a verdadeira vitalidade vem do fluxo constante de dar e receber.',
  },
  {
    id: 'obara-roshi',
    name: 'Obara Roshi',
    portugueseName: 'Obara Roshi',
    order: 12,
    polarity: 'masculine',
    element: 'Ar Condensado',
    planets: ['Saturno', 'Mercurio'],
    sephirot: ['Binah', 'Hod'],
    sign: 'Aquario, Gêmeos',
    dayOfWeek: 'Quarta-feira',
    direction: 'Nordeste',
    colors: ['Azul escuro', 'Cinza', 'Branco'],
    offerings: ['Pedras', 'Ferro frio', 'Azeite espesso', 'Folhas resistentes'],
    ebos: ['Ebo de concentracao', 'Ebo de foco'],
    taboos: ['Nao dispersar energia', 'Nao abandonar proposito'],
    strengths: ['Concentracao', 'Foco', 'Determinacao'],
    weaknesses: ['Obsessao', 'Rigidez mental'],
    health: ['Joelhos', 'Cotovelos', 'Sistema nervoso'],
    meanings: ['Concentracao', 'Foco', 'Determinacao', 'Forca de vontade'],
    ifaMessage: 'Obara Roshi condensa o vento em feixe de forca, revelando que a verdadeira mestria vem da concentracao do proposito atraves do tempo.',
  },
];

export function getData(): ObaraMejiOdu[] {
  return OBARA_MEJI_DATA;
}

export function getDataById(id: string): ObaraMejiOdu | undefined {
  return OBARA_MEJI_DATA.find((o) => o.id === id);
}

export function searchData(query: string): ObaraMejiOdu[] {
  const q = query.toLowerCase();
  return OBARA_MEJI_DATA.filter(
    (o) =>
      o.name.toLowerCase().includes(q) ||
      o.portugueseName.toLowerCase().includes(q) ||
      o.element.toLowerCase().includes(q) ||
      o.meanings.some((m) => m.toLowerCase().includes(q))
  );
}

export function getObaraMejiByElement(element: string): ObaraMejiOdu[] {
  return OBARA_MEJI_DATA.filter((o) =>
    o.element.toLowerCase().includes(element.toLowerCase())
  );
}

export function getObaraMejiByPolarity(polarity: 'masculine' | 'feminine'): ObaraMejiOdu[] {
  return OBARA_MEJI_DATA.filter((o) => o.polarity === polarity);
}