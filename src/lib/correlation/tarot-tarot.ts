/**
 * Tarot-Tarot Spiritual Correlation Module
 * Maps relationships between Major Arcana cards based on spiritual journey progression,
 * elemental correspondences, and initiatory paths in the Cabala dos Caminhos system.
 */

export type PathType = 
  | 'tree_path'     
  | 'elemental'     
  | 'numerological' 
  | 'archetypal'    
  | 'sequential';   

export interface TarotTarotMapping {
  arcano: string;
  numero_carta: number;
  related_arcano: string;
  related_numero: number;
  path_type: PathType;
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

export const TOTAL_PATH_TYPES = 5;

export const TOTAL_MAPPINGS = 62;

const TAROT_TAROT_MAP: TarotTarotMapping[] = [
  // Tree Path connections
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mago', related_numero: 1, path_type: 'tree_path', spiritual_meaning: 'Inicia\u00e7\u00e3o e disposi\u00e7\u00e3o para novos come\u00e7os. O Louco abre o caminho que O Mago ir\u00e1 manifestar.', energy_flow: 'bidirectional' },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'A Sacerdotisa', related_numero: 2, path_type: 'tree_path', spiritual_meaning: 'Manifesta\u00e7\u00e3o e mist\u00e9rio. O Mago domina ferramentas externas enquanto a Sacerdotisa guarda sabedorias internas.', energy_flow: 'bidirectional' },
  { arcano: 'A Sacerdotisa', numero_carta: 2, related_arcano: 'A Imperatriz', related_numero: 3, path_type: 'tree_path', spiritual_meaning: 'Conhecimento intuitivo e manifesta\u00e7\u00e3o criativa. A Sacerdotisa guarda saber silencioso enquanto A Imperatriz manifesta vida.', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'O Imperador', related_numero: 4, path_type: 'tree_path', spiritual_meaning: 'Fertilidade e estrutura. A Imperatriz cria vida enquanto O Imperador governa com ordem.', energy_flow: 'bidirectional' },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'tree_path', spiritual_meaning: 'Autoridade e tradi\u00e7\u00e3o. O Imperador governa com lei externa enquanto O Hierofante transmite sabedoria interna.', energy_flow: 'bidirectional' },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'Os Enamorados', related_numero: 6, path_type: 'tree_path', spiritual_meaning: 'Tradi\u00e7\u00e3o e escolha. O Hierofante guarda ensinamentos sagrados enquanto Os Enamorados revelam decis\u00f5es do cora\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'O Carro', related_numero: 7, path_type: 'tree_path', spiritual_meaning: 'Uni\u00e3o e conquista. A escolha dos Enamorados \u00e9 seguida pela determina\u00e7\u00e3o do Carro.', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'A Justi\u00e7a', related_numero: 8, path_type: 'tree_path', spiritual_meaning: 'Conquista e verdade. O Carro vence com vontade enquanto A Justi\u00e7a traz equil\u00edbrio e honestidade.', energy_flow: 'bidirectional' },
  { arcano: 'A Justi\u00e7a', numero_carta: 8, related_arcano: 'O Eremita', related_numero: 9, path_type: 'tree_path', spiritual_meaning: 'Verdade exterior e sabedoria interior. A Justi\u00e7a ilumina enquanto O Eremita busca luz na solid\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Roda da Fortuna', related_numero: 10, path_type: 'tree_path', spiritual_meaning: 'Ilumina\u00e7\u00e3o solit\u00e1ria e destino. O Eremita busca sabedoria enquanto a Roda revela os ciclos do destino.', energy_flow: 'bidirectional' },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A For\u00e7a', related_numero: 11, path_type: 'tree_path', spiritual_meaning: 'Destino e for\u00e7a interior. A Roda governa ciclos enquanto A For\u00e7a doma instintos.', energy_flow: 'bidirectional' },
  { arcano: 'A For\u00e7a', numero_carta: 11, related_arcano: 'O Enforcado', related_numero: 12, path_type: 'tree_path', spiritual_meaning: 'Coragem e sacrif\u00edcio. A For\u00e7a doma o le\u00e3o enquanto O Enforcado realiza sacrif\u00edcio volunt\u00e1rio.', energy_flow: 'bidirectional' },
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'A Morte', related_numero: 13, path_type: 'tree_path', spiritual_meaning: 'Sacrif\u00edcio e transforma\u00e7\u00e3o. O Enforcado entrega-se enquanto A Morte traz fim e renascimento.', energy_flow: 'bidirectional' },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'A Temperan\u00e7a', related_numero: 14, path_type: 'tree_path', spiritual_meaning: 'Transformidade e equil\u00edbrio. A Morte transforma enquanto A Temperan\u00e7a busca harmonia.', energy_flow: 'bidirectional' },
  { arcano: 'A Temperan\u00e7a', numero_carta: 14, related_arcano: 'O Diabo', related_numero: 15, path_type: 'tree_path', spiritual_meaning: 'Modera\u00e7\u00e3o e tenta\u00e7\u00e3o. A Temperan\u00e7a busca harmonia entre extremos enquanto O Diabo representa extremismo material.', energy_flow: 'bidirectional' },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'A Torre', related_numero: 16, path_type: 'tree_path', spiritual_meaning: 'Escravid\u00e3o e liberta\u00e7\u00e3o. O Diabo prende enquanto A Torre destr\u00f3i para libertar.', energy_flow: 'bidirectional' },
  { arcano: 'A Torre', numero_carta: 16, related_arcano: 'A Estrela', related_numero: 17, path_type: 'tree_path', spiritual_meaning: 'Destrui\u00e7\u00e3o e esperan\u00e7a. A Torre abala enquanto A Estrela traz esperan\u00e7a renovadora.', energy_flow: 'bidirectional' },
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'A Lua', related_numero: 18, path_type: 'tree_path', spiritual_meaning: 'Esperan\u00e7a e ilus\u00e3o. A Estrela brilha enquanto A Lua revela o inconsciente.', energy_flow: 'bidirectional' },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Sol', related_numero: 19, path_type: 'tree_path', spiritual_meaning: 'Ilus\u00e3o e verdade. A Lua ilumina medos enquanto O Sol traz claridade absoluta.', energy_flow: 'bidirectional' },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'tree_path', spiritual_meaning: 'Alegria e despertar. O Sol brilha enquanto O Julgamento desperta para renova\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'O Julgamento', numero_carta: 20, related_arcano: 'O Mundo', related_numero: 21, path_type: 'tree_path', spiritual_meaning: 'Renova\u00e7\u00e3o e conclus\u00e3o. O Julgamento desperta enquanto O Mundo representa integra\u00e7\u00e3o completa.', energy_flow: 'bidirectional' },

  // Sequential connections
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Mundo', related_numero: 21, path_type: 'sequential', spiritual_meaning: 'In\u00edcio e fim do ciclo. O Louco inicia a jornada que O Mundo completa.', energy_flow: 'bidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'sequential', spiritual_meaning: 'Manifesta\u00e7\u00e3o e destino. O Mago inicia processos que a Roda ciclos.', energy_flow: 'bidirectional' },
  { arcano: 'II - A Sacerdotisa', numero_carta: 2, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'sequential', spiritual_meaning: 'Mist\u00e9rio e ciclos. A Sacerdotisa guarda segredos que a Roda revela.', energy_flow: 'bidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'sequential', spiritual_meaning: 'Fertilidade e destino. A Imperatriz gera vida sujeita aos ciclos da Roda.', energy_flow: 'bidirectional' },

  // Elemental connections
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'A Sacerdotisa', related_numero: 2, path_type: 'elemental', spiritual_meaning: 'Ar e \u00e1gua. Inoc\u00eancia e intui\u00e7\u00e3o se encontram.', energy_flow: 'bidirectional' },
  { arcano: 'O Mago', numero_carta: 1, related_arcano: 'O Hierofante', related_numero: 5, path_type: 'elemental', spiritual_meaning: 'Ar e Terra. Vontade individual e tradi\u00e7\u00e3o coletiva.', energy_flow: 'bidirectional' },
  { arcano: 'A Imperatriz', numero_carta: 3, related_arcano: 'A Morte', related_numero: 13, path_type: 'elemental', spiritual_meaning: 'Terra e \u00e1gua. Cria\u00e7\u00e3o e transforma\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'O Imperador', numero_carta: 4, related_arcano: 'O Carro', related_numero: 7, path_type: 'elemental', spiritual_meaning: 'Fogo e \u00e1gua. Estrutura\u00e7\u00e3o e a\u00e7\u00e3o din\u00e2mica.', energy_flow: 'bidirectional' },
  { arcano: 'O Hierofante', numero_carta: 5, related_arcano: 'A Temperan\u00e7a', related_numero: 14, path_type: 'elemental', spiritual_meaning: 'Terra e Fogo. Tradi\u00e7\u00e3o e modera\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'Os Enamorados', numero_carta: 6, related_arcano: 'A Estrela', related_numero: 17, path_type: 'elemental', spiritual_meaning: 'Ar e Ar. Uni\u00e3o e esperan\u00e7a.', energy_flow: 'bidirectional' },
  { arcano: 'O Carro', numero_carta: 7, related_arcano: 'O Sol', related_numero: 19, path_type: 'elemental', spiritual_meaning: '\u00c1gua e Fogo. Emotion e vitalidade.', energy_flow: 'bidirectional' },
  { arcano: 'A Justi\u00e7a', numero_carta: 8, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'elemental', spiritual_meaning: 'Ar e Fogo. Verdade e reden\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'O Eremita', numero_carta: 9, related_arcano: 'A Lua', related_numero: 18, path_type: 'elemental', spiritual_meaning: 'Terra e \u00e1gua. Sabedoria e inconsciente.', energy_flow: 'bidirectional' },
  { arcano: 'A Roda da Fortuna', numero_carta: 10, related_arcano: 'A Torre', related_numero: 16, path_type: 'elemental', spiritual_meaning: 'Fogo e Fogo. Destino e revelo\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'A For\u00e7a', numero_carta: 11, related_arcano: 'O Diabo', related_numero: 15, path_type: 'elemental', spiritual_meaning: 'Terra e Terra. Courage and tenta\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'O Enforcado', numero_carta: 12, related_arcano: 'O Eremita', related_numero: 9, path_type: 'elemental', spiritual_meaning: '\u00c1gua e Terra. Sacrif\u00edcio e busca interior.', energy_flow: 'bidirectional' },
  { arcano: 'A Morte', numero_carta: 13, related_arcano: 'O Sol', related_numero: 19, path_type: 'elemental', spiritual_meaning: '\u00c1gua e Fogo. Transformidade e alegria.', energy_flow: 'bidirectional' },
  { arcano: 'A Temperan\u00e7a', numero_carta: 14, related_arcano: 'A Justi\u00e7a', related_numero: 8, path_type: 'elemental', spiritual_meaning: 'Fogo e Ar. Modera\u00e7\u00e3o e verdade.', energy_flow: 'bidirectional' },
  { arcano: 'O Diabo', numero_carta: 15, related_arcano: 'A Torre', related_numero: 16, path_type: 'elemental', spiritual_meaning: 'Terra e Fogo. Escravid\u00e3o e liberta\u00e7\u00e3o for\u00e7ada.', energy_flow: 'bidirectional' },
  { arcano: 'A Estrela', numero_carta: 17, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'elemental', spiritual_meaning: 'Ar e Fogo. Esperan\u00e7a e desperto final.', energy_flow: 'bidirectional' },
  { arcano: 'A Lua', numero_carta: 18, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'elemental', spiritual_meaning: '\u00c1gua e Fogo. Ilus\u00e3o e Verdade.', energy_flow: 'bidirectional' },
  { arcano: 'O Sol', numero_carta: 19, related_arcano: 'A Estrela', related_numero: 17, path_type: 'elemental', spiritual_meaning: 'Fogo e Ar. Vitalidade e esperan\u00e7a.', energy_flow: 'bidirectional' },
  { arcano: 'O Mundo', numero_carta: 21, related_arcano: 'A Roda da Fortuna', related_numero: 10, path_type: 'elemental', spiritual_meaning: 'Terra e Fogo. Realiza\u00e7\u00e3o e destino.', energy_flow: 'bidirectional' },

  // Numerological connections
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'A Justi\u00e7a', related_numero: 8, path_type: 'numerological', spiritual_meaning: '0 e 8. Infinito e equil\u00edbrio k\u00e1rmico.', energy_flow: 'bidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'numerological', spiritual_meaning: '1 e 10. Unidade e ciclo completo.', energy_flow: 'bidirectional' },
  { arcano: 'II - A Sacerdotisa', numero_carta: 2, related_arcano: 'XX - O Julgamento', related_numero: 20, path_type: 'numerological', spiritual_meaning: '2 e 20. Dualidade e renova\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'XV - O Diabo', related_numero: 15, path_type: 'numerological', spiritual_meaning: '3 e 15. Cria\u00e7\u00e3o e sombra (3+12=15).', energy_flow: 'bidirectional' },
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'XIX - O Sol', related_numero: 19, path_type: 'numerological', spiritual_meaning: '4 e 19. Estrutura e vit\u00f3ria (4+15=19).', energy_flow: 'bidirectional' },
  { arcano: 'V - O Hierofante', numero_carta: 5, related_arcano: 'XVII - A Estrela', related_numero: 17, path_type: 'numerological', spiritual_meaning: '5 e 17. Tradi\u00e7\u00e3o e esperan\u00e7a (5+12=17).', energy_flow: 'bidirectional' },
  { arcano: 'VI - Os Enamorados', numero_carta: 6, related_arcano: 'XV - O Diabo', related_numero: 15, path_type: 'numerological', spiritual_meaning: '6 e 15. Amor e atra\u00e7\u00e3o (6+9=15).', energy_flow: 'bidirectional' },
  { arcano: 'VII - O Carro', numero_carta: 7, related_arcano: 'XVI - A Torre', related_numero: 16, path_type: 'numerological', spiritual_meaning: '7 e 16. Conquista e mudan\u00e7a (7+9=16).', energy_flow: 'bidirectional' },
  { arcano: 'VIII - A Justi\u00e7a', numero_carta: 8, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'numerological', spiritual_meaning: '8 e 10. Equil\u00edbrio e destino (8+2=10).', energy_flow: 'bidirectional' },
  { arcano: 'IX - O Eremita', numero_carta: 9, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'numerological', spiritual_meaning: '9 e 12. Busca e sacrif\u00edcio.', energy_flow: 'bidirectional' },

  // Archetypal connections
  { arcano: 'O Louco', numero_carta: 0, related_arcano: 'O Eremita', related_numero: 9, path_type: 'archetypal', spiritual_meaning: 'Inoc\u00eancia e sabedoria. Loucura sagrada e busca solit\u00e1ria.', energy_flow: 'bidirectional' },
  { arcano: 'I - O Mago', numero_carta: 1, related_arcano: 'O Diabo', related_numero: 15, path_type: 'archetypal', spiritual_meaning: 'Poder e corrup\u00e7\u00e3o. O神通 e o shadow worker.', energy_flow: 'bidirectional' },
  { arcano: 'II - A Sacerdotisa', numero_carta: 2, related_arcano: 'A Lua', related_numero: 18, path_type: 'archetypal', spiritual_meaning: 'Lua feminina e lua obscura. Intui\u00e7\u00e3o e ilus\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'III - A Imperatriz', numero_carta: 3, related_arcano: 'A Estrela', related_numero: 17, path_type: 'archetypal', spiritual_meaning: 'M\u00e3e terra e filha das estrelas. Fertilidade e esperan\u00e7a.', energy_flow: 'bidirectional' },
  { arcano: 'IV - O Imperador', numero_carta: 4, related_arcano: 'A For\u00e7a', related_numero: 11, path_type: 'archetypal', spiritual_meaning: 'Pai e curandeira. Autoridade e for\u00e7a interior.', energy_flow: 'bidirectional' },
  { arcano: 'V - O Hierofante', numero_carta: 5, related_arcano: 'O Eremita', related_numero: 9, path_type: 'archetypal', spiritual_meaning: 'Guru externo e guru interno. Tradi\u00e7\u00e3o e busca.', energy_flow: 'bidirectional' },
  { arcano: 'VI - Os Enamorados', numero_carta: 6, related_arcano: 'XIII - A Morte', related_numero: 13, path_type: 'archetypal', spiritual_meaning: 'Amor e transforma\u00e7\u00e3o. Uni\u00e3o que transforma.', energy_flow: 'bidirectional' },
  { arcano: 'VII - O Carro', numero_carta: 7, related_arcano: 'A Torre', related_numero: 16, path_type: 'archetypal', spiritual_meaning: 'Vit\u00f3ria e derrota. Conquista e destrui\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'VIII - A Justi\u00e7a', numero_carta: 8, related_arcano: 'O Julgamento', related_numero: 20, path_type: 'archetypal', spiritual_meaning: ' Julga e julga. Verdade e reden\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'IX - O Eremita', numero_carta: 9, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'archetypal', spiritual_meaning: 'Busca e encontro. solid\u00e3o e realiza\u00e7\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'X - A Roda da Fortuna', numero_carta: 10, related_arcano: 'XX - O Julgamento', related_numero: 20, path_type: 'archetypal', spiritual_meaning: 'Destino e escolha. Roda do karma e desperto.', energy_flow: 'bidirectional' },
  { arcano: 'XI - A For\u00e7a', numero_carta: 11, related_arcano: 'X - A Roda da Fortuna', related_numero: 10, path_type: 'archetypal', spiritual_meaning: 'For\u00e7a interior e for\u00e7a exterior. Dom\u00e1stica\u00e7\u00e3o e destino.', energy_flow: 'bidirectional' },
  { arcano: 'XII - O Enforcado', numero_carta: 12, related_arcano: 'XIV - A Temperan\u00e7a', related_numero: 14, path_type: 'archetypal', spiritual_meaning: 'Sacrif\u00edcio e equilibrio. Entrega e harmonia.', energy_flow: 'bidirectional' },
  { arcano: 'XIII - A Morte', numero_carta: 13, related_arcano: 'XII - O Enforcado', related_numero: 12, path_type: 'archetypal', spiritual_meaning: 'Transformidade e sacrif\u00edcio. Fim e entrega.', energy_flow: 'bidirectional' },
  { arcano: 'XIV - A Temperan\u00e7a', numero_carta: 14, related_arcano: 'A Estrela', related_numero: 17, path_type: 'archetypal', spiritual_meaning: 'Equil\u00edbrio e esperan\u00e7a. Harmonia e luz.', energy_flow: 'bidirectional' },
  { arcano: 'XV - O Diabo', numero_carta: 15, related_arcano: 'XVI - A Torre', related_numero: 16, path_type: 'archetypal', spiritual_meaning: 'Pris\u00e3o e liberta\u00e7\u00e3o. Tent\u00e1culo e despertar for\u00e7ado.', energy_flow: 'bidirectional' },
  { arcano: 'XVI - A Torre', numero_carta: 16, related_arcano: 'O Sol', related_numero: 19, path_type: 'archetypal', spiritual_meaning: 'Destrui\u00e7\u00e3o e claridade. Colapso e vit\u00f3ria.', energy_flow: 'bidirectional' },
  { arcano: 'XVII - A Estrela', numero_carta: 17, related_arcano: 'O Sol', related_numero: 19, path_type: 'archetypal', spiritual_meaning: 'Esperan\u00e7a e Alegria. Guia e brilho.', energy_flow: 'bidirectional' },
  { arcano: 'XVIII - A Lua', numero_carta: 18, related_arcano: 'O Sol', related_numero: 19, path_type: 'archetypal', spiritual_meaning: 'Noite e dia. Ilus\u00e3o e verdade.', energy_flow: 'bidirectional' },
  { arcano: 'XIX - O Sol', numero_carta: 19, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'archetypal', spiritual_meaning: 'Vitalidade e realiza\u00e7\u00e3o. Alegria e conclus\u00e3o.', energy_flow: 'bidirectional' },
  { arcano: 'XX - O Julgamento', numero_carta: 20, related_arcano: 'XXI - O Mundo', related_numero: 21, path_type: 'archetypal', spiritual_meaning: 'Desperto e realiza\u00e7\u00e3o. Renova\u00e7\u00e3o e completude.', energy_flow: 'bidirectional' },
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
export function getAllPathTypes(): PathType[] {
  const types = new Set<PathType>();
  TAROT_TAROT_MAP.forEach((m) => { types.add(m.path_type); });
  return Array.from(types);
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
export function getRelationsByPathType(type: PathType): TarotTarotMapping[] {
  return TAROT_TAROT_MAP.filter((m) => m.path_type === type);
}

/**
 * Returns the path type between two arcano cards.
 */
export function getPathTypeBetween(arcano1: string, arcano2: string): PathType | null {
  const mapping = getTarotTarot(arcano1, arcano2);
  return mapping ? mapping.path_type : null;
}

/**
 * Returns the spiritual meaning between two arcano cards.
 */
export function getSpiritualMeaningBetween(arcano1: string, arcano2: string): string | null {
  const mapping = getTarotTarot(arcano1, arcano2);
  return mapping ? mapping.spiritual_meaning : null;
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
