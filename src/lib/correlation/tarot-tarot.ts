/**
 * Element type for spiritual correlations
 */
export type Elemento = 'Fogo' | 'Água' | 'Ar' | 'Terra' | 'Éter';

/**
 * Tarot-Tarot Arcana Spiritual Correlation
 * Maps Tarot Major Arcana cards (0-21) to related cards within the Major Arcana
 * based on elemental, numerological, and archetypal relationships.
 */

export interface TarotTarotMapping {
  arcano: string;
  numero_carta: number;
  elemento: Elemento;
  energia_oposta: { arcano: string; numero_carta: number; razão: string };
  energia_amplificada: { arcano: string; numero_carta: number; razão: string };
  sombra_integrada: { arcano: string; numero_carta: number; razão: string };
  significado_espiritual: string;
  arquétipo: string;
  orixá: string;
  sephirah: string;
  chakra: string;
  lição_espiritual: string;
  afirmação: string;
  palavras_chave: string[];
}

export const TAROT_TAROT_MAP: Record<number, TarotTarotMapping> = {
  0: {
    arcano: 'O Louco', numero_carta: 0, elemento: 'Ar',
    energia_oposta: { arcano: 'O Mundo', numero_carta: 21, razão: 'O Louco inicia a jornada espiritual enquanto O Mundo a completa.' },
    energia_amplificada: { arcano: 'O Mago', numero_carta: 1, razão: 'O Louco carrega a energia potencial; O Mago canaliza essa energia.' },
    sombra_integrada: { arcano: 'A Torre', numero_carta: 16, razão: 'O Louco personifica a disposição para mudança.' },
    significado_espiritual: 'O início selvagem da jornada espiritual.',
    arquétipo: 'O Louco / O Aventureiro Espiritual',
    orixá: 'Nanã / Omolu / Olobón', sephirah: 'Malkuth', chakra: '7º Coronário',
    lição_espiritual: 'Às vezes você precisa saltar sem olhar para trás.',
    afirmação: 'Eu abraço a aventura da vida com coração aberto.',
    palavras_chave: ['liberdade', 'início', 'salto', 'fé'],
  },
  1: {
    arcano: 'O Mago', numero_carta: 1, elemento: 'Água',
    energia_oposta: { arcano: 'A Alta Sacerdotisa', numero_carta: 2, razão: 'O Mago representa a vontade consciente; a Alta Sacerdotisa representa a sabedoria oculta.' },
    energia_amplificada: { arcano: 'A Imperatriz', numero_carta: 2, razão: 'O Mago canaliza recursos; a Imperatriz cria com eles.' },
    sombra_integrada: { arcano: 'O Diabo', numero_carta: 15, razão: 'O Mago pode usar seus dons para manipulação.' },
    significado_espiritual: 'A vontade consciente e a capacidade de manifestar realidade.',
    arquétipo: 'O Mago / O Manipulador de Energias',
    orixá: 'Oxum / Logun-Edé', sephirah: 'Chokmah', chakra: '6º Frontal',
    lição_espiritual: 'Você tem todas as ferramentas que precisa.',
    afirmação: 'Eu canalizo minha vontade com propósito.',
    palavras_chave: ['vontade', 'manifestação', 'mestria'],
  },
  2: {
    arcano: 'A Alta Sacerdotisa', numero_carta: 2, elemento: 'Água',
    energia_oposta: { arcano: 'A Sacerdotisa', numero_carta: 2, razão: 'A Alta Sacerdotisa é a sabedoria oculta.' },
    energia_amplificada: { arcano: 'A Lua', numero_carta: 18, razão: 'A Lua amplifica a energia intuitiva.' },
    sombra_integrada: { arcano: 'O Hierofante', numero_carta: 5, razão: 'O Hierofante dogmatiza o conhecimento.' },
    significado_espiritual: 'A sabedoria intuitiva que habita no silêncio.',
    arquétipo: 'A Sacerdotisa / A Guardiã dos Mistérios',
    orixá: 'Ibeji / Ejiokô', sephirah: 'Chokmah', chakra: '6º Frontal',
    lição_espiritual: 'Confie na sua intuição e na sabedoria que vem do silêncio interior.',
    afirmação: 'Eu escuto a voz da minha alma e confio nos mistérios do universo.',
    palavras_chave: ['intuição', 'mistério', 'sabedoria'],
  },
  3: {
    arcano: 'A Imperatriz', numero_carta: 3, elemento: 'Terra',
    energia_oposta: { arcano: 'O Imperador', numero_carta: 4, razão: 'A Imperatriz representa a energia criativa; o Imperador representa a ordem.' },
    energia_amplificada: { arcano: 'A Estrela', numero_carta: 17, razão: 'A Imperatriz é a terra fertilizada; a Estrela é a esperança.' },
    sombra_integrada: { arcano: 'A Torre', numero_carta: 16, razão: 'A Torre representa a destruição do que é estagnado.' },
    significado_espiritual: 'A fertilidade criativa em todas as suas formas.',
    arquétipo: 'A Mãe Divina / A Criadora',
    orixá: 'Iemanjá / Irosun', sephirah: 'Binah', chakra: '4º Cardíaco',
    lição_espiritual: 'A abundância é seu direito de nascença.',
    afirmação: 'Eu nutro minha essência criativa e permito que a abundância flua.',
    palavras_chave: ['fertilidade', 'criação', 'abundância'],
  },
  4: {
    arcano: 'O Imperador', numero_carta: 4, elemento: 'Fogo',
    energia_oposta: { arcano: 'A Imperatriz', numero_carta: 3, razão: 'O Imperador traz ordem; a Imperatriz traz criação.' },
    energia_amplificada: { arcano: 'O Carro', numero_carta: 7, razão: 'O Imperador estabelece a estrutura; o Carro a utiliza.' },
    sombra_integrada: { arcano: 'O Mago', numero_carta: 1, razão: 'O Mago lembra que a vontade pode criar ou destruir.' },
    significado_espiritual: 'A autoridade sagrada que estabelece ordem no caos.',
    arquétipo: 'O Pai / O Governante',
    orixá: 'Ogum / Etaogundá', sephirah: 'Chesed', chakra: '3º Plexo Solar',
    lição_espiritual: 'A verdadeira autoridade vem de princípios.',
    afirmação: 'Eu estabeleço estruturas com sabedoria e lidero com princípios firmes.',
    palavras_chave: ['autoridade', 'estrutura', 'disciplina'],
  },
  5: {
    arcano: 'O Hierofante', numero_carta: 5, elemento: 'Terra',
    energia_oposta: { arcano: 'Os Enamorados', numero_carta: 6, razão: 'O Hierofante representa tradição; os Enamorados representam escolha pessoal.' },
    energia_amplificada: { arcano: 'A Justiça', numero_carta: 8, razão: 'A Justiça aplica a moralidade com equilíbrio.' },
    sombra_integrada: { arcano: 'A Morte', numero_carta: 13, razão: 'A Morte representa a transformação das velhas crenças.' },
    significado_espiritual: 'O guardião da sabedoria sagrada e dos ensinamentos tradicionais.',
    arquétipo: 'O Guia Espiritual / O Sacerdote',
    orixá: 'Xangô / Iansã', sephirah: 'Tiphereth', chakra: '5º Laríngeo',
    lição_espiritual: 'A tradição tem valor, mas a sabedoria viva transcende fórmulas.',
    afirmação: 'Eu busco a verdade sagrada através de práticas tradicionais.',
    palavras_chave: ['tradição', 'sabedoria', 'fé'],
  },
  6: {
    arcano: 'Os Enamorados', numero_carta: 6, elemento: 'Ar',
    energia_oposta: { arcano: 'O Hierofante', numero_carta: 5, razão: 'Os Enamorados representam escolha livre.' },
    energia_amplificada: { arcano: 'A Temperança', numero_carta: 14, razão: 'A Temperança é o amor maduro que emerge.' },
    sombra_integrada: { arcano: 'A Torre', numero_carta: 16, razão: 'A Torre é a libertação forçada de apegos.' },
    significado_espiritual: 'A escolha que define o caminho. A união de opostos complementares.',
    arquétipo: 'O Escolhedor / O Amante',
    orixá: 'Oxumaré / Logun-Edé', sephirah: 'Tiphereth', chakra: '4º Cardíaco',
    lição_espiritual: 'Escolher com o coração aberto é sempre melhor que escolher pelo medo.',
    afirmação: 'Eu faço escolhas com o coração aberto e confio no caminho do amor.',
    palavras_chave: ['escolha', 'amor', 'união'],
  },
  7: {
    arcano: 'O Carro', numero_carta: 7, elemento: 'Água',
    energia_oposta: { arcano: 'A Paz', numero_carta: 10, razão: 'O Carro é conquista através de esforço; a Paz é realização através de rendição.' },
    energia_amplificada: { arcano: 'A Força', numero_carta: 8, razão: 'A Força conquista através da compaixão.' },
    sombra_integrada: { arcano: 'O Louco', numero_carta: 0, razão: 'O Louco lembra que nem tudo pode ser controlado.' },
    significado_espiritual: 'A vitória conquistada através do equilíbrio de forças opostas.',
    arquétipo: 'O Conquistador / O Guerreiro',
    orixá: 'Ogum / Oxóssi', sephirah: 'Geburah', chakra: '3º Plexo Solar',
    lição_espiritual: 'A verdadeira vitória vem do equilíbrio entre ação e paciência.',
    afirmação: 'Eu avanço com propósito e integridade.',
    palavras_chave: ['conquista', 'vitória', 'avanço'],
  },
  8: {
    arcano: 'A Justiça', numero_carta: 8, elemento: 'Ar',
    energia_oposta: { arcano: 'A Inversão', numero_carta: 16, razão: 'A Justiça representa equilíbrio e verdade.' },
    energia_amplificada: { arcano: 'O Julgamento', numero_carta: 20, razão: 'O Julgamento é a resolução da Justiça.' },
    sombra_integrada: { arcano: 'O Diabo', numero_carta: 15, razão: 'O Diabo representa a injustiça e manipulação.' },
    significado_espiritual: 'O equilíbrio divino entre ações e consequências.',
    arquétipo: 'O Juiz / A Lei Cósmica',
    orixá: 'Obatalá / Oxalá', sephirah: 'Geburah', chakra: '6º Frontal',
    lição_espiritual: 'A verdadeira justiça vem do equilíbrio entre lei e compaixão.',
    afirmação: 'Eu atuo com integridade e reconheço que cada ação tem consequências.',
    palavras_chave: ['justiça', 'verdade', 'equilíbrio'],
  },
  9: {
    arcano: 'O Eremita', numero_carta: 9, elemento: 'Terra',
    energia_oposta: { arcano: 'O Sol', numero_carta: 19, razão: 'O Eremita busca no escuro; o Sol brilha na claridade.' },
    energia_amplificada: { arcano: 'A Lua', numero_carta: 18, razão: 'A Lua é o território que o Eremita explora.' },
    sombra_integrada: { arcano: 'O Carro', numero_carta: 7, razão: 'O Carro lembra que a luz deve ser compartilhada.' },
    significado_espiritual: 'A busca interior pela luz que guia.',
    arquétipo: 'O Sábio / O Iluminado',
    orixá: 'Nanã / Ossain', sephirah: 'Hod', chakra: '7º Coronário',
    lição_espiritual: 'A verdadeira luz que você busca está dentro de você.',
    afirmação: 'Eu busco a sabedoria interior e permito que minha luz guie os outros.',
    palavras_chave: ['iluminação', 'sabedoria', 'solidão'],
  },
  10: {
    arcano: 'A Roda da Fortuna', numero_carta: 10, elemento: 'Fogo',
    energia_oposta: { arcano: 'O Destino', numero_carta: 10, razão: 'A Roda representa o movimento constante entre ascensão e queda.' },
    energia_amplificada: { arcano: 'O Mundo', numero_carta: 21, razão: 'O Mundo é o ponto culminante do ciclo da Roda.' },
    sombra_integrada: { arcano: 'A Justiça', numero_carta: 8, razão: 'A Justiça representa a ordem por trás do aparente caos.' },
    significado_espiritual: 'O ciclo eterno de destino e mudança.',
    arquétipo: 'O Destino / O Ciclo',
    orixá: 'Ibeji / Exu', sephirah: 'Netzach', chakra: '3º Plexo Solar',
    lição_espiritual: 'Aceitar a mudança é aceitar a vida.',
    afirmação: 'Eu abraço os ciclos da vida e confio no movimento do destino.',
    palavras_chave: ['destino', 'mudança', 'ciclo'],
  },
  11: {
    arcano: 'A Força', numero_carta: 11, elemento: 'Fogo',
    energia_oposta: { arcano: 'A Justiça', numero_carta: 8, razão: 'A Força representa compaixão; a Justiça representa equilíbrio.' },
    energia_amplificada: { arcano: 'O Carro', numero_carta: 7, razão: 'O Carro é o conquistador que a Força refina.' },
    sombra_integrada: { arcano: 'A Imperatriz', numero_carta: 3, razão: 'A Imperatriz lembra do poder da criação.' },
    significado_espiritual: 'O poder da compaixão sobre a força bruta.',
    arquétipo: 'A Guerreira Gentil / O Protetor',
    orixá: 'Iemanjá / Oxum', sephirah: 'Tiphereth', chakra: '4º Cardíaco',
    lição_espiritual: 'A verdadeira força está na gentileza e na coragem de ser vulnerável.',
    afirmação: 'Eu conquisto com compaixão e minha gentileza é minha maior força.',
    palavras_chave: ['força', 'compaixão', 'coragem'],
  },
  12: {
    arcano: 'O Enforcado', numero_carta: 12, elemento: 'Água',
    energia_oposta: { arcano: 'O Mago', numero_carta: 1, razão: 'O Enforcado representa sacrifício; o Mago representa ação.' },
    energia_amplificada: { arcano: 'A Morte', numero_carta: 13, razão: 'A Morte é a transformação completa.' },
    sombra_integrada: { arcano: 'O Imperador', numero_carta: 4, razão: 'O Imperador lembra do poder de agir.' },
    significado_espiritual: 'O sacrifício que traz nova perspectiva.',
    arquétipo: 'O Sacrificador / O Martir',
    orixá: 'Omolu / Obaluaiê', sephirah: 'Daath', chakra: '6º Frontal',
    lição_espiritual: 'Às vezes você precisa deixar ir para avançar.',
    afirmação: 'Eu entrego o que não serve mais e abraço nova perspectiva.',
    palavras_chave: ['sacrifício', 'perspectiva', 'pausa'],
  },
  13: {
    arcano: 'A Morte', numero_carta: 13, elemento: 'Água',
    energia_oposta: { arcano: 'O Sol', numero_carta: 19, razão: 'A Morte representa transformação; o Sol representa renovação.' },
    energia_amplificada: { arcano: 'O Mundo', numero_carta: 21, razão: 'A Morte é o portal para o Mundo.' },
    sombra_integrada: { arcano: 'O Hierofante', numero_carta: 5, razão: 'O Hierofante oferece esperança através da tradição.' },
    significado_espiritual: 'A transformação necessária que permite renascimento.',
    arquétipo: 'O Transformador / O Metamorfose',
    orixá: 'Omolu / Obaluaiê', sephirah: 'Netzach', chakra: '2º Sacral',
    lição_espiritual: 'A morte é apenas outro começo.',
    afirmação: 'Eu aceito a transformação como parte natural da vida.',
    palavras_chave: ['transformação', 'morte', 'renascimento'],
  },
  14: {
    arcano: 'A Temperança', numero_carta: 14, elemento: 'Fogo',
    energia_oposta: { arcano: 'O Diabo', numero_carta: 15, razão: 'A Temperança integra opostos; o Diabo prende nos extremos.' },
    energia_amplificada: { arcano: 'O Mundo', numero_carta: 21, razão: 'O Mundo é a harmonização final.' },
    sombra_integrada: { arcano: 'Os Enamorados', numero_carta: 6, razão: 'Os Enamorados lembram da intensidade.' },
    significado_espiritual: 'A integração sagrada de opostos.',
    arquétipo: 'O Integrador / O Equilibrador',
    orixá: 'Oxum / Ibeji', sephirah: 'Tiphereth', chakra: '4º Cardíaco',
    lição_espiritual: 'O equilíbrio não é mediocridade.',
    afirmação: 'Eu integro os opostos dentro de mim e encontro harmonia.',
    palavras_chave: ['equilíbrio', 'harmonia', 'integração'],
  },
  15: {
    arcano: 'O Diabo', numero_carta: 15, elemento: 'Terra',
    energia_oposta: { arcano: 'O Anjo', numero_carta: 20, razão: 'O Diabo representa escravidão; o Anjo representa libertação.' },
    energia_amplificada: { arcano: 'A Torre', numero_carta: 16, razão: 'A Torre liberta através de destruição.' },
    sombra_integrada: { arcano: 'O Mago', numero_carta: 1, razão: 'O Diabo é o Mago corrompido.' },
    significado_espiritual: 'A sombra que prende e a libertação que liberta.',
    arquétipo: 'O Prisioneiro / O Shadow Self',
    orixá: 'Exu / Pomba Gira', sephirah: 'Yesod', chakra: '1º Raiz',
    lição_espiritual: 'Os grilhões que você carrega são feitos por você mesmo.',
    afirmação: 'Eu reconheço minhas sombras e transformo cadeias em asas.',
    palavras_chave: ['sombra', 'tentação', 'libertação'],
  },
  16: {
    arcano: 'A Torre', numero_carta: 16, elemento: 'Fogo',
    energia_oposta: { arcano: 'A Estrela', numero_carta: 17, razão: 'A Torre é destruição; a Estrela é esperança.' },
    energia_amplificada: { arcano: 'O Sol', numero_carta: 19, razão: 'O Sol é a iluminação que segue a Torre.' },
    sombra_integrada: { arcano: 'A Imperatriz', numero_carta: 3, razão: 'A Imperatriz lembra do valor da estabilidade.' },
    significado_espiritual: 'A destruição do falso para revelar a verdade.',
    arquétipo: 'O Destruidor / O Libertador',
    orixá: 'Xangô / Iansã', sephirah: 'Hod', chakra: '3º Plexo Solar',
    lição_espiritual: 'Às vezes o prédio precisa cair para que a luz entre.',
    afirmação: 'Eu permito que velha estrutura colapse e abra espaço para nova verdade.',
    palavras_chave: ['destruição', 'revelação', 'libertação'],
  },
  17: {
    arcano: 'A Estrela', numero_carta: 17, elemento: 'Ar',
    energia_oposta: { arcano: 'A Lua', numero_carta: 18, razão: 'A Estrela traz esperança; a Lua traz ilusão.' },
    energia_amplificada: { arcano: 'O Sol', numero_carta: 19, razão: 'O Sol é a concretização da esperança.' },
    sombra_integrada: { arcano: 'A Justiça', numero_carta: 8, razão: 'A Justiça traz realidade.' },
    significado_espiritual: 'A esperança que brilha mesmo após a destruição.',
    arquétipo: 'A Esperança / O Farol',
    orixá: 'Oxum / Iemanjá', sephirah: 'Chesed', chakra: '5º Laríngeo',
    lição_espiritual: 'Quando tudo parece perdido, uma estrela aparece para guiar.',
    afirmação: 'Eu sou a estrela que guia através da escuridão.',
    palavras_chave: ['esperança', 'luz', 'guia'],
  },
  18: {
    arcano: 'A Lua', numero_carta: 18, elemento: 'Água',
    energia_oposta: { arcano: 'O Sol', numero_carta: 19, razão: 'A Lua governa o inconsciente; o Sol governa a consciência.' },
    energia_amplificada: { arcano: 'O Sonhador', numero_carta: 18, razão: 'A Lua amplia os mistérios do inconsciente.' },
    sombra_integrada: { arcano: 'A Alta Sacerdotisa', numero_carta: 2, razão: 'A Alta Sacerdotisa revela verdade.' },
    significado_espiritual: 'O reino do inconsciente e dos sonhos.',
    arquétipo: 'O Sonhador / O Iludido',
    orixá: 'Iemanjá / Nanã', sephirah: 'Yesod', chakra: '6º Frontal',
    lição_espiritual: 'Nem tudo é o que parece. Navegue com sabedoria.',
    afirmação: 'Eu navego pelas águas do inconsciente com sabedoria.',
    palavras_chave: ['lua', 'sonhos', 'inconsciente'],
  },
  19: {
    arcano: 'O Sol', numero_carta: 19, elemento: 'Fogo',
    energia_oposta: { arcano: 'A Lua', numero_carta: 18, razão: 'O Sol é clareza; a Lua é mistério.' },
    energia_amplificada: { arcano: 'O Mundo', numero_carta: 21, razão: 'O Mundo é a síntese completa.' },
    sombra_integrada: { arcano: 'O Eremita', numero_carta: 9, razão: 'O Eremita busca a luz interior.' },
    significado_espiritual: 'A iluminação e vitalidade que aquece e sustenta.',
    arquétipo: 'O Iluminado / O Radiante',
    orixá: 'Oxalá / Obatalá', sephirah: 'Kether', chakra: '7º Coronário',
    lição_espiritual: 'A luz que você busca está ao seu redor.',
    afirmação: 'Eu brilho com minha própria luz e aqueço a todos.',
    palavras_chave: ['sol', 'luz', 'alegria'],
  },
  20: {
    arcano: 'O Julgamento', numero_carta: 20, elemento: 'Fogo',
    energia_oposta: { arcano: 'O Mundo', numero_carta: 21, razão: 'O Julgamento é a avaliação final; o Mundo é a conclusão.' },
    energia_amplificada: { arcano: 'O Louco', numero_carta: 0, razão: 'O Louco é o novo início que o Julgamento chama.' },
    sombra_integrada: { arcano: 'A Justiça', numero_carta: 8, razão: 'A Justiça traz equilíbrio ao julgamento.' },
    significado_espiritual: 'O despertar da consciência e o julgamento final.',
    arquétipo: 'O Julgador / O Desperto',
    orixá: 'Obatalá / Oxalá', sephirah: 'Malkuth', chakra: '7º Coronário',
    lição_espiritual: 'O despertar acontece quando você responde ao chamado da sua alma.',
    afirmação: 'Eu respondo ao chamado da minha alma e abraço meu novo propósito.',
    palavras_chave: ['julgamento', 'despertar', 'renascimento'],
  },
  21: {
    arcano: 'O Mundo', numero_carta: 21, elemento: 'Terra',
    energia_oposta: { arcano: 'O Louco', numero_carta: 0, razão: 'O Mundo completa a jornada; o Louco a inicia.' },
    energia_amplificada: { arcano: 'A Roda da Fortuna', numero_carta: 10, razão: 'A Roda leva ao Mundo.' },
    sombra_integrada: { arcano: 'O Eremita', numero_carta: 9, razão: 'O Eremita busca sempre mais sabedoria.' },
    significado_espiritual: 'A realização completa da jornada espiritual.',
    arquétipo: 'O Realizado / O Todo',
    orixá: 'Oxalá / Iemanjá', sephirah: 'Kether', chakra: '7º Coronário',
    lição_espiritual: 'Você já é completo.',
    afirmação: 'Eu me realizo na completude do meu ser.',
    palavras_chave: ['realização', 'completude', 'unidade'],
  },
};

Object.freeze(TAROT_TAROT_MAP);
Object.values(TAROT_TAROT_MAP).forEach((mapping) => Object.freeze(mapping));

export function getTarotTarotByNumber(numeroCarta: number): TarotTarotMapping {
  if (numeroCarta < 0 || numeroCarta > 21 || !Number.isInteger(numeroCarta)) {
    throw new Error('Número do arcano fora do intervalo válido (0-21)');
  }
  return TAROT_TAROT_MAP[numeroCarta];
}

export function getTarotTarotByArcano(arcano: string): TarotTarotMapping | null {
  const found = Object.values(TAROT_TAROT_MAP).find(
    (m) => m.arcano.toLowerCase() === arcano.toLowerCase()
  );
  return found || null;
}

export function getAllTarotTarots(): TarotTarotMapping[] {
  return Object.values(TAROT_TAROT_MAP).sort((a, b) => a.numero_carta - b.numero_carta);
}

export function hasTarotTarot(numeroCarta: number): boolean {
  return numeroCarta in TAROT_TAROT_MAP;
}

export function getTarotTarotByElement(elemento: string): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) => m.elemento === elemento);
}

export function getTarotTarotByOrixa(orixá: string): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) => m.orixá.toLowerCase().includes(orixá.toLowerCase()));
}

export function getTarotTarotBySephirah(sephirah: string): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) => m.sephirah.toLowerCase() === sephirah.toLowerCase());
}

export function getTarotTarotByChakra(chakra: string): TarotTarotMapping[] {
  return getAllTarotTarots().filter((m) => m.chakra.toLowerCase().includes(chakra.toLowerCase()));
}

export function getComplementaryArcano(numeroCarta: number): TarotTarotMapping['energia_oposta'] {
  return getTarotTarotByNumber(numeroCarta).energia_oposta;
}

export function getAmplifiedArcano(numeroCarta: number): TarotTarotMapping['energia_amplificada'] {
  return getTarotTarotByNumber(numeroCarta).energia_amplificada;
}

export function getShadowArcano(numeroCarta: number): TarotTarotMapping['sombra_integrada'] {
  return getTarotTarotByNumber(numeroCarta).sombra_integrada;
}

export function getAllArcanos(): string[] {
  return Object.keys(TAROT_TAROT_MAP).map(Number).sort((a, b) => a - b).map((n) => TAROT_TAROT_MAP[n].arcano);
}

export function getAllArcanoNumbers(): number[] {
  return Object.keys(TAROT_TAROT_MAP).map(Number).sort((a, b) => a - b);
}

export default {
  getTarotTarotByNumber, getTarotTarotByArcano, getAllTarotTarots, hasTarotTarot,
  getTarotTarotByElement, getTarotTarotByOrixa, getTarotTarotBySephirah, getTarotTarotByChakra,
  getComplementaryArcano, getAmplifiedArcano, getShadowArcano,
  getAllArcanos, getAllArcanoNumbers, TAROT_TAROT_MAP,
};
