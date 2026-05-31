/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps relationships between Major Arcana cards based on spiritual journey progression,
 * elemental correspondences, and initiatory paths in the Cabala dos Caminhos system.
 */

export type TarotPathType =
  | 'Trino'
  | 'Sextil'
  | 'Quadratura'
  | 'Oposi\u00e7\u00e3o'
  | 'Sequ\u00eancia'
  | 'Complementar'
  | 'Ancestral';

export interface TarotTarotMapping {
  arcano: string;
  numero_carta: number;
  related_arcano: string;
  related_numero: number;
  path_type: TarotPathType;
  spiritual_meaning: string;
  energy_flow: 'bidirectional';
}

export const ALL_MAJOR_ARCANOS: readonly string[] = [
  '0 - O Louco', 'I - O Mago', 'II - A Sacerdotisa', 'III - A Imperatriz',
  'IV - O Imperador', 'V - O Hierofante', 'VI - Os Enamorados', 'VII - O Carro',
  'VIII - A Justi\u00e7a', 'IX - O Eremita', 'X - A Roda da Fortuna', 'XI - A For\u00e7a',
  'XII - O Enforcado', 'XIII - A Morte', 'XIV - A Temperan\u00e7a', 'XV - O Diabo',
  'XVI - A Torre', 'XVII - A Estrela', 'XVIII - A Lua', 'XIX - O Sol',
  'XX - O Julgamento', 'XXI - O Mundo',
];

export const TOTAL_PATH_TYPES: number = 7;

export const TOTAL_MAPPINGS: number = 66;

const TAROT_TAROT_MAP: TarotTarotMapping[] = [
  // Sequ\u00eancia - Journey progression (0 -> 21)
  { arcano: '0 - O Louco', numero_carta: 0, related_arcano: 'I - O Mago', related_numero: 1, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Inicia\u00e7\u00e3o e disposi\u00e7\u00e3o para novos come\u00e7os. O Louco abre o caminho que O Mago ir\u00e1 manifestar.', energy_flow: 'bidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'II - A Sacerdotisa', related_numero: 2, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Manifesta\u00e7\u00e3o e mist\u00e9rio. O Mago domina ferramentas externas enquanto a Sacerdotisa guarda sabedorias internas.', energy_flow: 'bidirectional' },
  { arcano: 'II - A Sacerdotisa', numero_carta: 2, related_arcano: 'III - A Imperatriz', related_numero: 3, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Conhecimento intuitivo e manifesta\u00e7\u00e3o criativa. A Sacerdotisa guarda saber silencioso enquanto A Imperatriz manifesta vida.', energy_flow: 'bidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'IV - O Imperador', related_numero: 4, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Fertilidade e estrutura. A Imperatriz cria vida enquanto O Imperador governa com ordem.', energy_flow: 'bidirectional' },
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'V - O Hierofante', related_numero: 5, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Autoridade e tradi\u00e7\u00e3o. O Imperador governa com lei externa enquanto O Hierofante transmite sabedoria interna.', energy_flow: 'bidirectional' },
  { arcano: 'V - O Hierofante', numero_carta: 5, related_arcano: 'VI - Os Enamorados', related_numero: 6, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Tradi\u00e7\u00e3o e escolha. O Hierofante guarda ensinamentos sagrados enquanto Os Enamorados revelam decis\u00f5es do cora\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'VI - Os Enamorados', numero_carta: 6, related_arcano: 'VII - O Carro', related_numero: 7, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Uni\u00e3o e conquista. A escolha dos Enamorados \u00e9 seguida pela determina\u00e7\u00e3o do Carro.', energy_flow: 'bidirectional' },
  { arcano: 'VII - O Carro', numero_carta: 7, related_arcano: 'VIII - A Justi\u00e7a', related_numero: 8, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Conquista e verdade. O Carro vence com vontade enquanto A Justi\u00e7a traz equil\u00edbrio e honestidade.', energy_flow: 'bidirectional' },
  { arcano: 'VIII - A Justi\u00e7a', numero_carta: 8, related_arcano: 'IX - O Eremita', related_numero: 9, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Verdade exterior e sabedoria interior. A Justi\u00e7a ilumina enquanto O Eremita busca luz na solid\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'IX - O Eremita', numero_carta: 9, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Ilumina\u00e7\u00e3o solit\u00e1ria e destino. O Eremita busca sabedoria enquanto a Roda revela os ciclos do destino.', energy_flow: 'bidirectional' },
  { arcano: 'X - A Roda da Fortuna', numero_carta: 10, related_arcano: 'XI - A For\u00e7a', related_numero: 11, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Destino e for\u00e7a interior. A Roda governa ciclos enquanto A For\u00e7a doma instintos.', energy_flow: 'bidirectional' },
  { arcano: 'XI - A For\u00e7a', numero_carta: 11, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Coragem e sacrif\u00edcio. A For\u00e7a doma o le\u00e3o enquanto O Enforcado realiza sacrif\u00edcio volunt\u00e1rio.', energy_flow: 'bidirectional' },
  { arcano: 'XII - O Enforcado', numero_carta: 12, related_arcano: 'XIII - A Morte', related_numero: 13, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Sacrif\u00edcio e transforma\u00e7\u00e3o. O Enforcado entrega-se enquanto A Morte traz fim e renascimento.', energy_flow: 'bidirectional' },
  { arcano: 'XIII - A Morte', numero_carta: 13, related_arcano: 'XIV - A Temperan\u00e7a', related_numero: 14, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Transformidade e equil\u00edbrio. A Morte transforma enquanto A Temperan\u00e7a busca harmonia.', energy_flow: 'bidirectional' },
  { arcano: 'XIV - A Temperan\u00e7a', numero_carta: 14, related_arcano: 'XV - O Diabo', related_numero: 15, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Modera\u00e7\u00e3o e tenta\u00e7\u00e3o. A Temperan\u00e7a busca harmonia enquanto O Diabo representa extremismo material.', energy_flow: 'bidirectional' },
  { arcano: 'XV - O Diabo', numero_carta: 15, related_arcano: 'XVI - A Torre', related_numero: 16, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Escravid\u00e3o e liberta\u00e7\u00e3o. O Diabo prende enquanto A Torre destr\u00f3i para libertar.', energy_flow: 'bidirectional' },
  { arcano: 'XVI - A Torre', numero_carta: 16, related_arcano: 'XVII - A Estrela', related_numero: 17, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Destrui\u00e7\u00e3o e esperan\u00e7a. A Torre abala enquanto A Estrela traz esperan\u00e7a renovadora.', energy_flow: 'bidirectional' },
  { arcano: 'XVII - A Estrela', numero_carta: 17, related_arcano: 'XVIII - A Lua', related_numero: 18, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Esperan\u00e7a e ilus\u00e3o. A Estrela brilha enquanto A Lua revela o inconsciente.', energy_flow: 'bidirectional' },
  { arcano: 'XVIII - A Lua', numero_carta: 18, related_arcano: 'XIX - O Sol', related_numero: 19, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Ilus\u00e3o e verdade. A Lua ilumina medos enquanto O Sol traz claridade absoluta.', energy_flow: 'bidirectional' },
  { arcano: 'XIX - O Sol', numero_carta: 19, related_arcano: 'XX - O Julgamento', related_numero: 20, path_type: 'Sequ\u00eancia', spiritual_meaning: 'Alegria e despertar. O Sol brilha enquanto O Julgamento desperta para renova\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'XX - O Julgamento', numero_carta: 20, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'Sequ\u00eanica', spiritual_meaning: 'Renova\u00e7\u00e3o e conclus\u00e3o. O Julgamento desperta enquanto O Mundo representa integra\u00e7\u00e3o completa.', energy_flow: 'bidirectional' },

  // Trino - 120\u00b0 aspects (creative harmony)
  { arcano: '0 - O Louco', numero_carta: 0, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Trino', spiritual_meaning: 'Liberdade e destino se encontram. O Louco dan\u00e7a livre enquanto a Roda tece o destino.', energy_flow: 'bidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'V - O Hierofante', related_numero: 5, path_type: 'Trino', spiritual_meaning: 'Vontade criativa e tradi\u00e7\u00e3o sagrada. O Mago manifesta o que O Hierofante ensina.', energy_flow: 'bidirectional' },
  { arcano: 'II - A Sacerdotisa', numero_carta: 2, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Trino', spiritual_meaning: 'Mist\u00e9rio e ciclos. A Sacerdotisa guarda segredos que a Roda revela.', energy_flow: 'bidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'VII - O Carro', related_numero: 7, path_type: 'Trino', spiritual_meaning: 'Cria\u00e7\u00e3o e conquista. A Imperatriz gera vida que O Carro leva \u00e0 vit\u00f3ria.', energy_flow: 'bidirectional' },
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'VIII - A Justi\u00e7a', related_numero: 8, path_type: 'Trino', spiritual_meaning: 'Estrutura e verdade. O Imperador cria leis que A Justi\u00e7a aplica.', energy_flow: 'bidirectional' },
  { arcano: 'VI - Os Enamorados', numero_carta: 6, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'Trino', spiritual_meaning: 'Amor e entrega. Os Enamorados escolhem entrega que O Enforcado realiza.', energy_flow: 'bidirectional' },
  { arcano: 'IX - O Eremita', numero_carta: 9, related_arcano: 'XVII - A Estrela', related_numero: 17, path_type: 'Trino', spiritual_meaning: 'Busca interior e esperan\u00e7a. O Eremita busca luz que A Estrela simboliza.', energy_flow: 'bidirectional' },
  { arcano: 'XI - A For\u00e7a', numero_carta: 11, related_arcano: 'XIX - O Sol', related_numero: 19, path_type: 'Trino', spiritual_meaning: 'For\u00e7a e vitalidade. A For\u00e7a \u00e9 o le\u00e3o domesticado que O Sol ilumina.', energy_flow: 'bidirectional' },
  { arcano: 'XIII - A Morte', numero_carta: 13, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'Trino', spiritual_meaning: 'Transformidade e conclus\u00e3o. A Morte \u00e9 portal para a realiza\u00e7\u00e3o do Mundo.', energy_flow: 'bidirectional' },

  // Sextil - 60\u00b0 aspects (opportunity)
  { arcano: '0 - O Louco', numero_carta: 0, related_arcano: 'III - A Imperatriz', related_numero: 3, path_type: 'Sextil', spiritual_meaning: 'Inoc\u00eancia e fertility. O Louco inicia enquanto A Imperatriz manifesta.', energy_flow: 'bidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'VI - Os Enamorados', related_numero: 6, path_type: 'Sextil', spiritual_meaning: 'Manifesta\u00e7\u00e3o e uni\u00e3o. O Mago manifesta escolhas que Os Enamorados vivem.', energy_flow: 'bidirectional' },
  { arcano: 'II - A Sacerdotisa', numero_carta: 2, related_arcano: 'VII - O Carro', related_numero: 7, path_type: 'Sextil', spiritual_meaning: 'Mist\u00e9rio e a\u00e7\u00e3o. A Sacerdotisa conhece enquanto O Carro age.', energy_flow: 'bidirectional' },
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Sextil', spiritual_meaning: 'Ordem e destino. O Imperador estrutura o que a Roda ciclos.', energy_flow: 'bidirectional' },
  { arcano: 'V - O Hierofante', numero_carta: 5, related_arcano: 'XI - A For\u00e7a', related_numero: 11, path_type: 'Sextil', spiritual_meaning: 'Ensinamento e coragem. O Hierofante inspira for\u00e7a que A For\u00e7a encarna.', energy_flow: 'bidirectional' },
  { arcano: 'VIII - A Justi\u00e7a', numero_carta: 8, related_arcano: 'XIV - A Temperan\u00e7a', related_numero: 14, path_type: 'Sextil', spiritual_meaning: 'Verdade e harmonia. A Justi\u00e7a corrige enquanto A Temperan\u00e7a equilibra.', energy_flow: 'bidirectional' },
  { arcano: 'XII - O Enforcado', numero_carta: 12, related_arcano: 'XVIII - A Lua', related_numero: 18, path_type: 'Sextil', spiritual_meaning: 'Entrega e intu\u00ed\u00e7\u00e3o. O Enforcado sacrifica ilus\u00f5es que A Lua alimenta.', energy_flow: 'bidirectional' },
  { arcano: 'XIII - A Morte', numero_carta: 13, related_arcano: 'XIX - O Sol', related_numero: 19, path_type: 'Sextil', spiritual_meaning: 'Transformidade e alegria. A Morte limpa caminho para O Sol brilhar.', energy_flow: 'bidirectional' },
  { arcano: 'XVI - A Torre', numero_carta: 16, related_arcano: 'XX - O Julgamento', related_numero: 20, path_type: 'Sextil', spiritual_meaning: 'Destrui\u00e7\u00e3o e renova\u00e7\u00e3o. A Torre abala estruturas que O Julgamento julga.', energy_flow: 'bidirectional' },

  // Quadratura - 90\u00b0 aspects (challenge)
  { arcano: '0 - O Louco', numero_carta: 0, related_arcano: 'VI - Os Enamorados', related_numero: 6, path_type: 'Quadratura', spiritual_meaning: 'Liberdade versus uni\u00e3o. O Louco busca liberdade enquanto Os Enamorados se entregam.', energy_flow: 'bidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'IV - O Imperador', related_numero: 4, path_type: 'Quadratura', spiritual_meaning: 'Vontade versus ordem. O Mago cria livremente enquanto O Imperador imp\u00f5e regras.', energy_flow: 'bidirectional' },
  { arcano: 'II - A Sacerdotisa', numero_carta: 2, related_arcano: 'V - O Hierofante', related_numero: 5, path_type: 'Quadratura', spiritual_meaning: 'Mist\u00e9rio versus tradi\u00e7\u00e3o. A Sacerdotisa guarda segredos que O Hierofante revela.', energy_flow: 'bidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'Quadratura', spiritual_meaning: 'Cria\u00e7\u00e3o versus sacrif\u00edcio. A Imperatriz gera vida enquanto O Enforcado a entrega.', energy_flow: 'bidirectional' },
  { arcano: 'VII - O Carro', numero_carta: 7, related_arcano: 'XI - A For\u00e7a', related_numero: 11, path_type: 'Quadratura', spiritual_meaning: 'Conquista versus for\u00e7a interior. O Carro conquista exteriormente enquanto A For\u00e7a domina interiormente.', energy_flow: 'bidirectional' },
  { arcano: 'VIII - A Justi\u00e7a', numero_carta: 8, related_arcano: 'XVI - A Torre', related_numero: 16, path_type: 'Quadratura', spiritual_meaning: 'Verdade versus revela\u00e7\u00e3o. A Justi\u00e7a pondera enquanto A Torre revela verdades ocultas.', energy_flow: 'bidirectional' },
  { arcano: 'IX - O Eremita', numero_carta: 9, related_arcano: 'XIII - A Morte', related_numero: 13, path_type: 'Quadratura', spiritual_meaning: 'Busca versus transforma\u00e7\u00e3o. O Eremita busca sentido enquanto A Morte transforma.', energy_flow: 'bidirectional' },
  { arcano: 'X - A Roda da Fortuna', numero_carta: 10, related_arcano: 'XIV - A Temperan\u00e7a', related_numero: 14, path_type: 'Quadratura', spiritual_meaning: 'Destino versus modera\u00e7\u00e3o. A Roda gira ciclos enquanto A Temperan\u00e7a equilibra excessos.', energy_flow: 'bidirectional' },

  // Oposi\u00e7\u00e3o - 180\u00b0 aspects (polarity)
  { arcano: '0 - O Louco', numero_carta: 0, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'In\u00edcio e fim. O Louco inicia o ciclo que O Mundo completa.', energy_flow: 'bidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'XV - O Diabo', related_numero: 15, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'Manifesta\u00e7\u00e3o e pris\u00e3o. O Mago domina ferramentas enquanto O Diabo prende.', energy_flow: 'bidirectional' },
  { arcano: 'II - A Sacerdotisa', numero_carta: 2, related_arcano: 'XIX - O Sol', related_numero: 19, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'Mist\u00e9rio e claridade. A Sacerdotisa guarda lua enquanto O Sol revela.', energy_flow: 'bidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'XVI - A Torre', related_numero: 16, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'Cria\u00e7\u00e3o e destrui\u00e7\u00e3o. A Imperatriz gera vida que A Torre destr\u00f3i.', energy_flow: 'bidirectional' },
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'XV - O Diabo', related_numero: 15, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'Ordem e caos. O Imperador governa com lei enquanto O Diabo corrompe.', energy_flow: 'bidirectional' },
  { arcano: 'V - O Hierofante', numero_carta: 5, related_arcano: 'XIV - A Temperan\u00e7a', related_numero: 14, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'Tradi\u00e7\u00e3o e modera\u00e7\u00e3o. O Hierofante preserva enquanto A Temperan\u00e7a equilibra.', energy_flow: 'bidirectional' },
  { arcano: 'VI - Os Enamorados', numero_carta: 6, related_arcano: 'XVIII - A Lua', related_numero: 18, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'Amor e ilus\u00e3o. Os Enamorados escolhem com clareza enquanto A Lua obscurece.', energy_flow: 'bidirectional' },
  { arcano: 'VII - O Carro', numero_carta: 7, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'Vontade e destino. O Carro controla dire\u00e7\u00e3o enquanto a Roda escolhe destino.', energy_flow: 'bidirectional' },
  { arcano: 'VIII - A Justi\u00e7a', numero_carta: 8, related_arcano: 'XVII - A Estrela', related_numero: 17, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'Verdade e esperan\u00e7a. A Justi\u00e7a julga com rigor enquanto A Estrela oferece esperan\u00e7a.', energy_flow: 'bidirectional' },
  { arcano: 'IX - O Eremita', numero_carta: 9, related_arcano: 'XX - O Julgamento', related_numero: 20, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'Busca e despertar. O Eremita busca em solid\u00e3o enquanto O Julgamento desperta em comunidade.', energy_flow: 'bidirectional' },
  { arcano: 'XI - A For\u00e7a', numero_carta: 11, related_arcano: 'XIII - A Morte', related_numero: 13, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'For\u00e7a e rendi\u00e7\u00e3o. A For\u00e7a domina instintos enquanto A Morte transforma atrav\u00e9s de rendi\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'XII - O Enforcado', numero_carta: 12, related_arcano: 'XIV - A Temperan\u00e7a', related_numero: 14, path_type: 'Oposi\u00e7\u00e3o', spiritual_meaning: 'Sacrif\u00edcio e equil\u00edbrio. O Enforcado entrega-se atrav\u00e9s de sacrif\u00edcio enquanto A Temperan\u00e7a busca harm\u00f4nia.', energy_flow: 'bidirectional' },

  // Complementar - duality and completion
  { arcano: '0 - O Louco', numero_carta: 0, related_arcano: 'XIX - O Sol', related_numero: 19, path_type: 'Complementar', spiritual_meaning: 'Liberdade e alegri\u00e1. O Louco busca liberdade que O Sol irradia.', energy_flow: 'bidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Complementar', spiritual_meaning: 'Poder e destino. O Mago manifesta vontade que a Roda determina.', energy_flow: 'bidirectional' },
  { arcano: 'II - A Sacerdotisa', numero_carta: 2, related_arcano: 'XVII - A Estrela', related_numero: 17, path_type: 'Complementar', spiritual_meaning: 'Mist\u00e9rio e esperan\u00e7a. A Sacerdotisa guarda mist\u00e9rio que A Estrela ilumina.', energy_flow: 'bidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'XI - A For\u00e7a', related_numero: 11, path_type: 'Complementar', spiritual_meaning: 'Cria\u00e7\u00e3o e for\u00e7a. A Imperatriz gera vida que A For\u00e7a protege.', energy_flow: 'bidirectional' },
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'VIII - A Justi\u00e7a', related_numero: 8, path_type: 'Complementar', spiritual_meaning: 'Autoridade e equidade. O Imperador governa com for\u00e7a que A Justi\u00e7a balanceia.', energy_flow: 'bidirectional' },
  { arcano: 'V - O Hierofante', numero_carta: 5, related_arcano: 'XVI - A Torre', related_numero: 16, path_type: 'Complementar', spiritual_meaning: 'Tradi\u00e7\u00e3o e mudan\u00e7a. O Hierofante preserva estruturas que A Torre destr\u00f3i.', energy_flow: 'bidirectional' },
  { arcano: 'VI - Os Enamorados', numero_carta: 6, related_arcano: 'XIII - A Morte', related_numero: 13, path_type: 'Complementar', spiritual_meaning: 'Uni\u00e3o e transforma\u00e7\u00e3o. Os Enamorados elegem caminho que A Morte transforma.', energy_flow: 'bidirectional' },
  { arcano: 'VII - O Carro', numero_carta: 7, related_arcano: 'IX - O Eremita', related_numero: 9, path_type: 'Complementar', spiritual_meaning: 'A\u00e7\u00e3o e reflex\u00e3o. O Carro age que O Eremita contempla.', energy_flow: 'bidirectional' },
  { arcano: 'VIII - A Justi\u00e7a', numero_carta: 8, related_arcano: 'XX - O Julgamento', related_numero: 20, path_type: 'Complementar', spiritual_meaning: 'Verdade e reden\u00e7\u00e3o. A Justi\u00e7a julga enquanto O Julgamento oferece absolvi\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'X - A Roda da Fortuna', numero_carta: 10, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'Complementar', spiritual_meaning: 'Destino e realiza\u00e7\u00e3o. A Roda tece destino que O Mundo completa.', energy_flow: 'bidirectional' },

  // Ancestral - Karmic connections
  { arcano: '0 - O Louco', numero_carta: 0, related_arcano: 'XV - O Diabo', related_numero: 15, path_type: 'Ancestral', spiritual_meaning: 'Liberdade e pris\u00e3o. O Louco transcende pris\u00f5es que O Diabo cria.', energy_flow: 'bidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'XVI - A Torre', related_numero: 16, path_type: 'Ancestral', spiritual_meaning: 'Poder e transforma\u00e7\u00e3o. O Mago possui poder que A Torre libertadora destr\u00f3i.', energy_flow: 'bidirectional' },
  { arcano: 'II - A Sacerdotisa', numero_carta: 2, related_arcano: 'XV - O Diabo', related_numero: 15, path_type: 'Ancestral', spiritual_meaning: 'Mist\u00e9rio e ilus\u00e3o. A Sacerdotisa guarda conhecimento que O Diabo corrompe.', energy_flow: 'bidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'Ancestral', spiritual_meaning: 'Cria\u00e7\u00e3o e destino. A Imperatriz gera vida sujeta aos ciclos da Roda.', energy_flow: 'bidirectional' },
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'IX - O Eremita', related_numero: 9, path_type: 'Ancestral', spiritual_meaning: 'Estrutura e busca. O Imperador imp\u00f5e ordem que O Eremita questiona.', energy_flow: 'bidirectional' },
  { arcano: 'V - O Hierofante', numero_carta: 5, related_arcano: 'XIII - A Morte', related_numero: 13, path_type: 'Ancestral', spiritual_meaning: 'Ensinamento e transforma\u00e7\u00e3o. O Hierofante transmite tradi\u00e7\u00e3o que A Morte renova.', energy_flow: 'bidirectional' },
  { arcano: 'VI - Os Enamorados', numero_carta: 6, related_arcano: 'XIV - A Temperan\u00e7a', related_numero: 14, path_type: 'Ancestral', spiritual_meaning: 'Escolha e harmonia. Os Enamorados escolhem que A Temperan\u00e7a equilibra.', energy_flow: 'bidirectional' },
  { arcano: 'VII - O Carro', numero_carta: 7, related_arcano: 'XIII - A Morte', related_numero: 13, path_type: 'Ancestral', spiritual_meaning: 'Vit\u00f3ria e transforma\u00e7\u00e3o. O Carro conquista que A Morte transforma.', energy_flow: 'bidirectional' },
  { arcano: 'VIII - A Justi\u00e7a', numero_carta: 8, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'Ancestral', spiritual_meaning: 'Verdade e sacrif\u00edcio. A Justi\u00e7a revela verdade que O Enforcado encarna.', energy_flow: 'bidirectional' },
  { arcano: 'IX - O Eremita', numero_carta: 9, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'Ancestral', spiritual_meaning: 'Busca e realiza\u00e7\u00e3o. O Eremita busca ilumina\u00e7\u00e3o que O Mundo simboliza.', energy_flow: 'bidirectional' },
  { arcano: 'X - A Roda da Fortuna', numero_carta: 10, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'Ancestral', spiritual_meaning: 'Destino e entrega. A Roda determina destino que O Enforcado aceita.', energy_flow: 'bidirectional' },
  { arcano: 'XI - A For\u00e7a', numero_carta: 11, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'Ancestral', spiritual_meaning: 'For\u00e7a e integra\u00e7\u00e3o. A For\u00e7a \u00e9 caminho para realiza\u00e7\u00e3o do Mundo.', energy_flow: 'bidirectional' },
  { arcano: 'XII - O Enforcado', numero_carta: 12, related_arcano: 'XX - O Julgamento', related_numero: 20, path_type: 'Ancestral', spiritual_meaning: 'Sacrif\u00edcio e reden\u00e7\u00e3o. O Enforcado sacrifica que O Julgamento redime.', energy_flow: 'bidirectional' },
  { arcano: 'XIII - A Morte', numero_carta: 13, related_arcano: 'XVII - A Estrela', related_numero: 17, path_type: 'Ancestral', spiritual_meaning: 'Transformidade e esperan\u00e7a. A Morte transforma para que A Estrela brilhe.', energy_flow: 'bidirectional' },
  { arcano: 'XIV - A Temperan\u00e7a', numero_carta: 14, related_arcano: 'XV - O Diabo', related_numero: 15, path_type: 'Ancestral', spiritual_meaning: 'Modera\u00e7\u00e3o e tenta\u00e7\u00e3o. A Temperan\u00e7a equilibra que O Diabo desestabiliza.', energy_flow: 'bidirectional' },
  { arcano: 'XVI - A Torre', numero_carta: 16, related_arcano: 'XIX - O Sol', related_numero: 19, path_type: 'Ancestral', spiritual_meaning: 'Destrui\u00e7\u00e3o e Alegria. A Torre destr\u00f3i para que O Sol purifique.', energy_flow: 'bidirectional' },
  { arcano: 'XVII - A Estrela', numero_carta: 17, related_arcano: 'XIX - O Sol', related_numero: 19, path_type: 'Ancestral', spiritual_meaning: 'Esperan\u00e7a e Alegria. A Estrela guia para O Sol radiante.', energy_flow: 'bidirectional' },
  { arcano: 'XVIII - A Lua', numero_carta: 18, related_arcano: 'XX - O Julgamento', related_numero: 20, path_type: 'Ancestral', spiritual_meaning: 'Ilus\u00e3o e Verdade. A Lua obscurece que O Julgamento revela.', energy_flow: 'bidirectional' },
  { arcano: 'XIX - O Sol', numero_carta: 19, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'Ancestral', spiritual_meaning: 'Vit\u00f3ria e Conclus\u00e3o. O Sol brilha antes da completa realiza\u00e7\u00e3o do Mundo.', energy_flow: 'bidirectional' },
];

Object.freeze(TAROT_TAROT_MAP);
TAROT_TAROT_MAP.forEach((m) => Object.freeze(m));

export const TAROT_TAROT_MAPPINGS: readonly TarotTarotMapping[] = TAROT_TAROT_MAP;

/**
 * Returns the tarot-tarot mapping for a given arcano pair.
 * Returns null if no mapping exists.
 */
export function getTarotTarot(arcano: string, relatedArcano: string): TarotTarotMapping | null {
  const a1 = arcano.trim().toLowerCase();
  const a2 = relatedArcano.trim().toLowerCase();
  return TAROT_TAROT_MAP.find(
    (m) => m.arcano.toLowerCase() === a1 && m.related_arcano.toLowerCase() === a2
  ) || null;
}

/**
 * Returns all tarot-tarot mappings.
 */
export function getAllTarotPaths(): readonly TarotTarotMapping[] {
  return TAROT_TAROT_MAPPINGS;
}

/**
 * Returns all unique path types used in tarot-tarot mappings.
 */
export function getAllPathTypes(): TarotPathType[] {
  return Array.from(new Set(TAROT_TAROT_MAP.map((m) => m.path_type))) as TarotPathType[];
}

/**
 * Returns all unique arcano names that have mappings.
 */
export function getAllMappedArcanos(): string[] {
  const set = new Set<string>();
  TAROT_TAROT_MAP.forEach((m) => { set.add(m.arcano); set.add(m.related_arcano); });
  return Array.from(set);
}

/**
 * Returns all relations for a given arcano.
 */
export function getRelationsForArcano(arcano: string): TarotTarotMapping[] {
  const a = arcano.trim().toLowerCase();
  return TAROT_TAROT_MAP.filter(
    (m) => m.arcano.toLowerCase() === a || m.related_arcano.toLowerCase() === a
  );
}

/**
 * Returns all relations for a given arcano and path type.
 */
export function getRelationsByPathType(type: TarotPathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.path_type === type);
}

/**
 * Returns the path type between two arcano cards.
 */
export function getPathTypeBetween(arcano1: string, arcano2: string): TarotPathType | null {
  const mapping = getTarotTarot(arcano1, arcano2);
  return mapping ? mapping.path_type : null;
}

/**
 * Returns the spiritual meaning between two arcano cards.
 */
export function getSpiritualMeaningBetween(arcano1: string, arcano2: string): TarotTarotMapping | null {
  return getTarotTarot(arcano1, arcano2);
}

/**
 * Checks if two arcano cards have a direct mapping.
 */
export function hasRelation(arcano1: string, arcano2: string): boolean {
  return getTarotTarot(arcano1, arcano2) !== null;
}

/**
 * Returns the arcano name by its number (0-21).
 */
export function getArcanoByNumber(numero: number): string | null {
  if (numero < 0 || numero > 21) return null;
  return ALL_MAJOR_ARCANOS[numero] || null;
}

export default {
  getTarotTarot,
  getAllTarotPaths,
  getAllPathTypes,
  getAllMappedArcanos,
  getRelationsForArcano,
  getRelationsByPathType,
  getPathTypeBetween,
  getSpiritualMeaningBetween,
  hasRelation,
  getArcanoByNumber,
  ALL_MAJOR_ARCANOS,
  TAROT_TAROT_MAPPINGS,
  TOTAL_MAPPINGS,
  TOTAL_PATH_TYPES,
};
