// ============================================================
// TYPES — Sistema de Delegação das 36 Casas do Baralho Cigano
// ============================================================
// Este arquivo define a tipagem central do sistema.
// Cada "casa" é uma posição interpretativa que combina:
//   - Carta Cigana (sorteada)
//   - Odu de Búzios (sorteado)
//   - Aspectos do Mapa Fixo (Astrologia + Numerologia + Tântrica)
//
// A IA usa essa tipagem para DELEGAR conteúdo certo para cada casa,
// sem misturar assuntos.

/**
 * Sistema de origem (qual mapa alimenta a casa)
 */
export type SourceSystem =
  | 'astrologia'
  | 'numerologia_cabalistica'
  | 'numerologia_tantrica'
  | 'odu'
  | 'carta_cigana'
  | 'sintese';

/**
 * Ponto astrológico delegado
 */
export type AstrologyPoint =
  | 'ascendente'
  | 'meio_do_ceu'
  | 'descendente'
  | 'fundo_do_ceu'
  | 'lua_natal'
  | 'sol_natal'
  | 'venus_natal'
  | 'marte_natal'
  | 'mercurio_natal'
  | 'saturno_natal'
  | 'netuno_natal'
  | 'plutao_natal'
  | 'urano_natal'
  | 'jupiter_natal'
  | 'lilith'
  | 'nodos_lunares'
  | 'casa_2'
  | 'casa_3'
  | 'casa_4'
  | 'casa_6'
  | 'casa_7'
  | 'casa_8'
  | 'casa_10'
  | 'casa_11'
  | 'casa_12';

/**
 * Número numerológico delegado
 */
export type NumerologyNumber =
  | 'caminho_de_vida'
  | 'numero_alma'
  | 'numero_personalidade'
  | 'numero_expressao'
  | 'numero_motivacao'
  | 'numero_destino'
  | 'numero_missao'
  | 'desafios_carmicos'
  | 'dons_divinos'
  | 'dominio_tantrico'
  | 'numero_karma_tantrico'
  | 'veredito_tantrico'
  | 'ponto_vulnerabilidade';

/**
 * Bloco temático (A, B, C, D)
 */
export type HouseBlock = 'A' | 'B' | 'C' | 'D';

/**
 * Pilar de síntese final
 */
export type SynthesisPillar =
  | 'trabalho_dinheiro'
  | 'lar_familia'
  | 'amor_relacionamentos'
  | 'conselho_espiritual';

/**
 * Definição de uma Casa (1-36)
 */
export interface HouseDefinition {
  /** Número da casa (1-36) */
  number: number;
  /** Nome da carta cigana */
  cartaCigana: string;
  /** Palavra-chave primária */
  keyword: string;
  /** Bloco temático (A, B, C ou D) */
  bloco: HouseBlock;
  /** Tema/título da casa */
  tema: string;
  /** Significado sagrado original da casa */
  significado: string;
  /** Pontos astrológicos delegados */
  astrologia: AstrologyPoint[];
  /** Números numerológicos delegados */
  numerologia: NumerologyNumber[];
  /** Cores temáticas para a UI */
  corPrimaria: string;
  corSecundaria: string;
  /** Ícone lucide-react sugerido */
  icone: string;
}

/**
 * Carta Cigana sorteada (input do Gabriel)
 */
export interface CartaCiganaSorteada {
  /** ID da carta (1-36) */
  casaId: number;
  /** Nome da carta (opcional, sobrescreve o default) */
  nome?: string;
  /** Invertida ou não */
  invertida?: boolean;
  /** Observação adicional do Gabriel */
  observacao?: string;
}

/**
 * Odu sorteado pelos búzios (input do Gabriel)
 */
export interface OduSorteado {
  /** Nome do Odu (ex: "Ogbe", "Oyeku", "Ejiogbe") */
  nome: string;
  /** Tipo: "principal" ou "complementar" */
  tipo: 'principal' | 'complementar';
  /** Refrão / Ifa de boca */
  refrao?: string;
  /** Observação do Gabriel */
  observacao?: string;
}

/**
 * Mapa fixo do cliente (dados de nascimento + mapa astral)
 */
export interface MapaFixo {
  // Dados básicos
  nomeCompleto: string;
  dataNascimento: string; // ISO 8601
  horaNascimento?: string; // HH:MM
  localNascimento?: string;

  // Astrologia
  ascendente?: string;
  solSigno?: string;
  luaSigno?: string;
  venusSigno?: string;
  marteSigno?: string;
  mercurioSigno?: string;
  jupiterSigno?: string;
  saturnoSigno?: string;
  uranoSigno?: string;
  netunoSigno?: string;
  plutaoSigno?: string;
  lilithSigno?: string;
  noduloNorteSigno?: string;
  meioDoCeuSigno?: string;

  // Numerologia Cabalística
  caminhoDeVida?: number;
  numeroAlma?: number;
  numeroPersonalidade?: number;
  numeroExpressao?: number;
  numeroMotivacao?: number;
  numeroDestino?: number;
  numeroMissao?: number;
  desafiosCarmicos?: number[];
  donsDivinos?: number[];

  // Numerologia Tântrica
  dominioTantrico?: string;
  numeroKarmaTantrico?: number;
  vereditoTantrico?: string;

  // Cruzamentos
  cruzamentosDestino?: string[];
  ponto_vulnerabilidade?: string;

  // Orixá regente
  orixaRegente?: string;
}

/**
 * Input completo de uma consulta (o que Gabriel digita no painel)
 */
export interface ConsultaInput {
  /** Identificador único da consulta */
  consultaId: string;
  /** Dados do cliente */
  cliente: MapaFixo;
  /** Cartas ciganas sorteadas (pode ser 1 ou várias conforme o spread) */
  cartasCiganas: CartaCiganaSorteada[];
  /** Odus sorteados pelos búzios */
  odus: OduSorteado[];
  /** Spread utilizado */
  spreadTipo: 'casa_unica' | 'cruz_cigana' | 'grande_consulta';
  /** Pergunta do cliente (opcional) */
  perguntaCliente?: string;
  /** Notas livres do Gabriel */
  notasGabriel?: string;
}

/**
 * Interpretação gerada para uma casa específica
 */
export interface InterpretacaoCasa {
  casaId: number;
  cartaCigana: string;
  oduPrincipal: string;
  aspectosUsados: {
    astrologia: AstrologyPoint[];
    numerologia: NumerologyNumber[];
  };
  conteudo: {
    significado: string;       // Significado sagrado da casa
    cruzamentoCarta: string;   // Carta cigana cruzada com odu
    cruzamentoMapa: string;    // Cruzamento com o aspecto do mapa fixo
    direcaoPratica: string;    // Conselho prático para o cliente
    alerta: string;            // Alerta místico (opcional)
  };
  tom: 'revelador' | 'protetor' | 'transformador' | 'celebrativo';
  geradoEm: string;
}

/**
 * Síntese final dos 4 pilares
 */
export interface SinteseFinal {
  pilares: {
    trabalhoDinheiro: PilarResumo;
    larFamilia: PilarResumo;
    amorRelacionamentos: PilarResumo;
    conselhoEspiritual: PilarResumo;
  };
  vereditoCarmico: string;
  geradoEm: string;
}

export interface PilarResumo {
  titulo: string;
  casasUsadas: number[];
  resumoExecutivo: string;
  pontosChave: string[];
  orientacaoPratica: string;
  periodoFavoravel?: string;
}

/**
 * Status de geração de uma casa
 */
export type CasaStatus = 'pendente' | 'gerando' | 'pronta' | 'erro';

/**
 * Estado de uma casa no sistema
 */
export interface CasaState {
  casaId: number;
  status: CasaStatus;
  interpretacao?: InterpretacaoCasa;
  erro?: string;
  geradoEm?: string;
}
