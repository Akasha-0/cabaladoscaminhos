/**
 * Tarot-Chakra Spiritual Correlation Module
 * Maps Tarot Major Arcana cards to their corresponding chakras, elements, and spiritual meanings
 * Based on Cabala dos Caminhos vibrational healing traditions
 */

import type { ChakraName, Elemento } from './chakra-element';

/**
 * Represents the correlation between a Tarot Major Arcana card and its chakra correspondence
 */
export interface TarotChakraMapping {
  /** The Major Arcana arcano name */
  arcano: string;
  /** Card number in the Major Arcana sequence (0-21) */
  numero_carta: number;
  /** Primary chakra alignment */
  chakra: ChakraName;
  /** Chakra number description */
  chakra_numero: string;
  /** Elemental association */
  elemento: Elemento;
  /** Full spiritual meaning and symbolism */
  significado_espiritual: string;
  /** Archetype represented by this card */
  arquétipo: string;
  /** Associated Orixá from Candomblé tradition */
  orixá: string;
  /** Associated Kabbalistic Sephirah */
  sephirah: string;
  /** Key spiritual lesson */
  lição_espiritual: string;
  /** Affirmation for meditation */
  afirmação: string;
}

// ─── Major Arcana to Chakra Mapping ─────────────────────────────────────────

/**
 * Complete mapping of Major Arcana cards (0-21) to their chakra correspondences.
 * Each card represents a spiritual journey through the energy centers.
 */
export const TAROT_CHAKRA_MAP: Record<number, TarotChakraMapping> = {
  0: {
    arcano: 'O Louco',
    numero_carta: 0,
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Éter',
    significado_espiritual: 'O salto de fé, a liberdade absoluta, o início de uma nova jornada espiritual. Representa a alma em sua pureza original, antes de entrar no mundo das formas. O louco caminha sem medo hacia lo desconocido, confiando na direção divina.',
    arquétipo: 'O Louco / A Alma Livre',
    orixá: 'Oxumaré / Oxalá',
    sephirah: 'Kether',
    lição_espiritual: 'Confie na jornada. Seu destino está garantizado quando você segue sua verdade interior.',
    afirmação: 'Eu abraço a liberdade de ser quem realmente sou.',
  },
  1: {
    arcano: 'O Mago',
    numero_carta: 1,
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    significado_espiritual: 'O poder de manifestar através da vontade e intenção. Acentelha divina que conecta o céu e a terra. O princípio ativo que transforma o potencial em realidade. Representa a mestria das ferramentas sagradas e a capacidade de canalizar a energia universal.',
    arquétipo: 'O Mago / O Mestre',
    orixá: 'Exu / Okaran',
    sephirah: 'Kether',
    lição_espiritual: 'Você possui todo o poder necessário para manifestar seus desejos. A ferramenta está em suas mãos.',
    afirmação: 'Eu canalizo a energia divina para manifestar minha realidade.',
  },
  2: {
    arcano: 'A Sacerdotisa',
    numero_carta: 2,
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Éter',
    significado_espiritual: 'A sabedoria interior, a intuição profunda, o conhecimento dos mistérios ocultos. A sacerdotisa guarda os segredos do inconsciente e conecta o mundo visível com o invisível. Ela representa a voz da sabedoria que fala através do silêncio interior.',
    arquétipo: 'A Sacerdotisa / A Guardiã dos Mistérios',
    orixá: 'Yemanjá / Oxum',
    sephirah: 'Chokhmah',
    lição_espiritual: 'Ouça sua voz interior. A verdade está dentro de você, esperando para ser descoberta.',
    afirmação: 'Eu acesso minha sabedoria interior e meus dons intuitivos.',
  },
  3: {
    arcano: 'A Imperatriz',
    numero_carta: 3,
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Ar',
    significado_espiritual: 'A abundância criativa, o amor fertil, a expressão artística e a conexão com a natureza. A Imperatriz representa a mãe divina em sua expressão mais pura, nutridor e geradora de vida. Ela é a abundância manifestada em todas as formas.',
    arquétipo: 'A Imperatriz / A Mãe Divina',
    orixá: 'Oxum / Yemanjá',
    sephirah: 'Binah',
    lição_espiritual: 'Você merece abundância em todas as áreas da sua vida. Permita-se receber.',
    afirmação: 'Eu abenhoço minha vida com abundância, criatividade e amor.',
  },
  4: {
    arcano: 'O Imperador',
    numero_carta: 4,
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    significado_espiritual: 'A autoridade, a estrutura, a disciplina e o poder pessoal. O Imperador representa a força de vontade conquistada e a capacidade de criar ordem no caos. Ele ensina que a verdadeira liderança vem do domínio de si mesmo.',
    arquétipo: 'O Imperador / O Líder',
    orixá: 'Ogum / Xangô',
    sephirah: 'Chesed',
    lição_espiritual: 'Você tem o poder de criar estrutura e ordem em sua vida. Seja seu próprio líder.',
    afirmação: 'Eu crio estrutura e ordem na minha vida com força e sabedoria.',
  },
  5: {
    arcano: 'O Hierofante',
    numero_carta: 5,
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento: 'Ar',
    significado_espiritual: 'A tradição espiritual, a sabedoria convencional, os ensinamentos sagrados. O Hierofante representa a conexão com as tradições espirituais e a transmissão de conhecimento de guru para discípulo. Ele é o mestre que guia pela luz da tradição.',
    arquétipo: 'O Hierofante / O Mestre',
    orixá: 'Oxalá / Nanã',
    sephirah: 'Gevurah',
    lição_espiritual: 'Honre as tradições que alimentam sua alma. Busque sabedoria nos mestres.',
    afirmação: 'Eu absorvo a sabedoria espiritual e a transmito com integridade.',
  },
  6: {
    arcano: 'Os Enamorados',
    numero_carta: 6,
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Ar',
    significado_espiritual: 'O amor, a união, a escolha do coração e a dualidade da existência. Os Enamorados representam o momento de escolha entre dois caminhos e a força do amor que transcende as polaridades. É o casamento sagrado entre o masculino e o feminino.',
    arquétipo: 'Os Enamorados / A União',
    orixá: 'Oxum / Oshosi',
    sephirah: 'Tiferet',
    lição_espiritual: 'Siga seu coração na escolha. O amor é a força mais poderosa do universo.',
    afirmação: 'Eu escolho o amor em todas as situações e me abenhoço com uniões sagradas.',
  },
  7: {
    arcano: 'O Carro',
    numero_carta: 7,
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    significado_espiritual: 'A vitória, a determinação, o controle da vontade sobre a matéria. O Carro representa a jornada da alma através do mundo material, conquistando obstáculos pela força de vontade. É o triumpho da disciplina sobre o caos.',
    arquétipo: 'O Carro / O Guerreiro',
    orixá: 'Ogum / Exu',
    sephirah: 'Netzach',
    lição_espiritual: 'Você é capaz de conquistar seus objetivos. Mantenha o foco e a determinação.',
    afirmação: 'Eu conquisto meus objetivos com força, determinação e graça.',
  },
  8: {
    arcano: 'A Força',
    numero_carta: 8,
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Ar',
    significado_espiritual: 'A força interior, a coragem, a compaixão e o amor que vence o medo. A Força representa o poder do amor em sua expressão mais pura, domando as feras interiores pela suavidade da compaixão. É a força do coração que supera toda adversidade.',
    arquétipo: 'A Força / A Guerreira do Amor',
    orixá: 'Oxum / Yemanjá',
    sephirah: 'Hod',
    lição_espiritual: 'Sua verdadeira força está em seu coração. O amor é mais poderoso que qualquer medo.',
    afirmação: 'Eu canalizo a força do amor para superar todos os obstáculos.',
  },
  9: {
    arcano: 'O Eremita',
    numero_carta: 9,
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Éter',
    significado_espiritual: 'A busca interior, a solidão sagrada, a iluminação interior. O Eremita representa a jornada solitária em busca da verdade interior. Ele é o sábio que encontrou a luz dentro de si mesmo e caminha sozinho pelo caminho da sabedoria.',
    arquétipo: 'O Eremita / O Sábio',
    orixá: 'Oxalá / Nanã',
    sephirah: 'Yesod',
    lição_espiritual: 'A luz que você busca está dentro de você. Vá em paz em sua solidão sagrada.',
    afirmação: 'Eu encontro a luz interior na solidão e compartilho minha sabedoria.',
  },
  10: {
    arcano: 'A Roda da Fortuna',
    numero_carta: 10,
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'Água',
    significado_espiritual: 'O destino, a transformação cíclica, a lei cósmica de causa e efeito. A Roda representa os ciclos da vida que giram entre ascensão e queda, sorte e azar. Ela ensina que tudo é transitório e que o destino pode ser transformado pela sabedoria.',
    arquétipo: 'A Roda / O Destino',
    orixá: 'Oxumaré / Logun-Edé',
    sephirah: 'Malkuth',
    lição_espiritual: 'Aceita os ciclos da vida. O que sobe, desce; o que desce, sobe. Confie no destino.',
    afirmação: 'Eu aceito os ciclos da vida e transformo meu destino com sabedoria.',
  },
  11: {
    arcano: 'A Justiça',
    numero_carta: 11,
    chakra: 'Vishuddha',
    chakra_numero: '5º Laríngeo',
    elemento: 'Ar',
    significado_espiritual: 'A verdade, a lei cósmica, o karma e a causa e efeito. A Justiça representa o equilíbrio entre ação e consequência, a verdade que liberta e a lei divina que governa o universo. Ela é a balança que mede todas as ações.',
    arquétipo: 'A Justiça / A Lei Divina',
    orixá: 'Oxalá / Nanã',
    sephirah: 'Din',
    lição_espiritual: 'A verdade liberta. Você colherá o que plantar. Seja justo em suas ações.',
    afirmação: 'Eu ajo com justiça e integridade, sabendo que cada ação tem uma consequência.',
  },
  12: {
    arcano: 'O Enforcado',
    numero_carta: 12,
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Água',
    significado_espiritual: 'A entrega, o sacrifício, a nova perspectiva que vem pela aceitação. O Enforcado representa o momento de pausa e entrega, quando a alma escolhe sacrificar o ego para ganhar uma nova perspectiva. É o dom da entrega que traz enlightenment.',
    arquétipo: 'O Enforcado / O Mártir Sagrado',
    orixá: 'Omolu / Oxumaré',
    sephirah: 'Tiferet',
    lição_espiritual: 'Às vezes a entrega é o caminho. Quando você solta, você recebe.',
    afirmação: 'Eu entrego o que precisa ser sacrificado e aceito uma nova perspectiva.',
  },
  13: {
    arcano: 'A Morte',
    numero_carta: 13,
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Terra',
    significado_espiritual: 'A transformação, o fim de um ciclo, a morte e renovação. A Morte representa a transformação inevitável que vem para todos os seres. Ela não é destruição, mas sim a morte do velho para o nascimento do novo. É a metamorfose da alma.',
    arquétipo: 'A Morte / A Transformadora',
    orixá: 'Omolu / Xapanã',
    sephirah: 'Hod',
    lição_espiritual: 'A morte do velho é o nascimento do novo. Abraça a transformação com coragem.',
    afirmação: 'Eu libero o que precisa morrer para que o novo possa nascer em mim.',
  },
  14: {
    arcano: 'A Temperança',
    numero_carta: 14,
    chakra: 'Anahata',
    chakra_numero: '4º Cardíaco',
    elemento: 'Água',
    significado_espiritual: 'O equilíbrio, a moderação, a cura e a paciência. A Temperança representa a arte de encontrar o ponto médio entre os extremos, goarmonizando opostos. Ela é a curandeira que traz equilíbrio entre corpo, mente e espírito.',
    arquétipo: 'A Temperança / A Curandeira',
    orixá: 'Oxum / Oshosi',
    sephirah: 'Tiferet',
    lição_espiritual: 'Encontre o equilíbrio em todas as coisas. A moderação traz paz interior.',
    afirmação: 'Eu busco o equilíbrio e a harmonia em todas as áreas da minha vida.',
  },
  15: {
    arcano: 'O Diabo',
    numero_carta: 15,
    chakra: 'Muladhara',
    chakra_numero: '1º Básico',
    elemento: 'Terra',
    significado_espiritual: 'A ilusão, a materialidade excessiva, os vícios e a sombra. O Diabo representa as correntes que prendem a alma ao mundo material, os vícios que dominam a vontade livre. Ele é o espelho da sombra que deve ser integrada.',
    arquétipo: 'O Diabo / A Sombra',
    orixá: 'Exu / Pomba-Gá',
    sephirah: 'Gevurah',
    lição_espiritual: 'Reconheça suas correntes. Você tem o poder de libertar-se da ilusão.',
    afirmação: 'Eu me liberto de todas as correntes que me prendem e escolho minha liberdade.',
  },
  16: {
    arcano: 'A Torre',
    numero_carta: 16,
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    significado_espiritual: 'A destruição do falso, a revelação súbita, a purificação pelo caos. A Torre representa a queda das estruturas falsas que impedem o crescimento espiritual. Ela é a purificação que vem pela destruição do castelo de areia.',
    arquétipo: 'A Torre / O Dilúvio',
    orixá: 'Xangô / Ogum',
    sephirah: 'Din',
    lição_espiritual: 'A destruição do falso abre espaço para o verdadeiro. Aceite as mudanças radicais.',
    afirmação: 'Eu permito que a verdade me liberte das estruturas que não servem mais.',
  },
  17: {
    arcano: 'A Estrela',
    numero_carta: 17,
    chakra: 'Ajna',
    chakra_numero: '6º Frontal',
    elemento: 'Éter',
    significado_espiritual: 'A esperança, a inspiração, a luz que guia e a cura. A Estrela representa a luz que brilha nas trevas, a esperança que renasce após a tempestade. Ela é aestream de luz que cura e restaura a alma cansada.',
    arquétipo: 'A Estrela / A Esperança',
    orixá: 'Oxum / Yemanjá',
    sephirah: 'Chesed',
    lição_espiritual: 'Mantenha a esperança. Após a tempestade, a estrela sempre reaparece.',
    afirmação: 'Eu brilho minha luz interior e permito que a esperança me guie.',
  },
  18: {
    arcano: 'A Lua',
    numero_carta: 18,
    chakra: 'Svadhisthana',
    chakra_numero: '2º Sacro',
    elemento: 'Água',
    significado_espiritual: 'A ilusão, o inconsciente, os medos ocultos e os sonhos. A Lua representa o mundo da ilusão e do inconsciente, onde os medos se manifestam como sombras. Ela ensina que nem tudo é o que parece e que a verdade está além das aparências.',
    arquétipo: 'A Lua / O Inconsciente',
    orixá: 'Yemanjá / Oxumaré',
    sephirah: 'Yesod',
    lição_espiritual: 'Navigate pelos seus medos com coragem. A luz da verdade dissipará as sombras.',
    afirmação: 'Eu ilumino os cantos escuros da minha mente e supero meus medos.',
  },
  19: {
    arcano: 'O Sol',
    numero_carta: 19,
    chakra: 'Manipura',
    chakra_numero: '3º Plexo Solar',
    elemento: 'Fogo',
    significado_espiritual: 'A alegria, a vitalidade, o sucesso e a verdade. O Sol representa a luz que ilumina todas as coisas, a alegria de viver e o sucesso conquistado. Ele é o brilho interior que irradia saúde, felicidade e vitalidade.',
    arquétipo: 'O Sol / A Alegria',
    orixá: 'Oxalá / Oxum',
    sephirah: 'Kether',
    lição_espiritual: 'Você é a luz do mundo. Brilhe com alegria e compartilhe sua vitalidade.',
    afirmação: 'Eu brilho com alegria, vitalidade e sucesso em todas as áreas da minha vida.',
  },
  20: {
    arcano: 'O Julgamento',
    numero_carta: 20,
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Éter',
    significado_espiritual: 'O despertar, a redenção, o juíz final e o renascimento. O Julgamento representa o momento de despertar da alma, quando reconhece sua verdadeira natureza e é chamada ao renascimento. É a trombeta que desperta os mortos para uma nova vida.',
    arquétipo: 'O Julgamento / O Renascimento',
    orixá: 'Oxalá / Nanã',
    sephirah: 'Malkuth',
    lição_espiritual: 'Desperte para sua verdadeira natureza. Você é mais do que pensa ser.',
    afirmação: 'Eu desperto para minha verdadeira essência e me renasço em luz.',
  },
  21: {
    arcano: 'O Mundo',
    numero_carta: 21,
    chakra: 'Sahasrara',
    chakra_numero: '7º Coronário',
    elemento: 'Éter',
    significado_espiritual: 'A completude, a integração, a realização del yo y la conexión con lo divino. O Mundo representa a culminación del viaje, la integración de todas las experiencias y la conexión con lo divino. Es el abrazo del universo que dice: você completou sua jornada.',
    arquétipo: 'O Mundo / A Completude',
    orixá: 'Oxalá / Oxum',
    sephirah: 'Kether',
    lição_espiritual: 'Você completou sua jornada. A integração de todas as experiências traz a completude.',
    afirmação: 'Eu me integro com o universo e celebro a completude da minha jornada.',
  },
};

// Freeze the mapping object to prevent modifications
Object.freeze(TAROT_CHAKRA_MAP);
// Freeze nested objects
Object.values(TAROT_CHAKRA_MAP).forEach((mapping) => Object.freeze(mapping));

/**
 * Returns the tarot-chakra correlation mapping for a given arcano number (0-21)
 * @param numero - Arcano number (0-21)
 * @returns The correlation mapping or null if not found
 */
export function getTarotChakra(numero: number): TarotChakraMapping | null {
  if (numero < 0 || numero > 21) return null;
  return TAROT_CHAKRA_MAP[numero] ?? null;
}

/**
 * Get the arcano number corresponding to a Tarot arcano name
 * @param arcano - The arcano name (e.g., 'O Mago', 'A Imperatriz')
 * @returns The arcano number or null if not found
 */
export function getArcanoNumber(arcano: string): number | null {
  const entry = Object.values(TAROT_CHAKRA_MAP).find(
    (m) => m.arcano.toLowerCase() === arcano.toLowerCase()
  );
  return entry ? entry.numero_carta : null;
}

/**
 * Get all tarot-chakra mappings
 * @returns Array of all TarotChakraMapping objects (0-21)
 */
export function getAllTarotChakras(): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAP).sort((a, b) => a.numero_carta - b.numero_carta);
}

/**
 * Check if an arcano number exists in the mapping
 * @param numero - Number to check (0-21)
 * @returns True if number exists in mapping
 */
export function hasTarotChakra(numero: number): boolean {
  return numero in TAROT_CHAKRA_MAP;
}

/**
 * Get mapping by arcano name
 * @param arcano - The arcano name
 * @returns The correlation mapping or null if not found
 */
export function getMappingByArcano(arcano: string): TarotChakraMapping | null {
  return (
    Object.values(TAROT_CHAKRA_MAP).find(
      (m) => m.arcano.toLowerCase() === arcano.toLowerCase()
    ) ?? null
  );
}

/**
 * Get mappings filtered by chakra
 * @param chakra - Chakra name to search for
 * @returns Array of TarotChakraMapping objects matching the chakra
 */
export function getTarotByChakra(chakra: string): TarotChakraMapping[] {
  const normalizedChakra = chakra.charAt(0).toUpperCase() + chakra.slice(1).toLowerCase();
  return Object.values(TAROT_CHAKRA_MAP).filter(
    (m) => m.chakra.toLowerCase() === normalizedChakra.toLowerCase()
  );
}

/**
 * Get mappings filtered by element
 * @param elemento - Element to filter by (Fogo, Água, Terra, Ar, Éter)
 * @returns Array of TarotChakraMapping objects matching the element
 */
export function getTarotByElement(elemento: string): TarotChakraMapping[] {
  const normalizedElemento = elemento.charAt(0).toUpperCase() + elemento.slice(1).toLowerCase();
  return Object.values(TAROT_CHAKRA_MAP).filter(
    (m) => m.elemento.toLowerCase() === normalizedElemento.toLowerCase()
  );
}

/**
 * Get mappings filtered by Orixá
 * @param orixá - Orixá name to search for
 * @returns Array of TarotChakraMapping objects associated with the Orixá
 */
export function getTarotByOrixa(orixá: string): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAP).filter((m) =>
    m.orixá.toLowerCase().includes(orixá.toLowerCase())
  );
}

/**
 * Get mappings filtered by Sephirah
 * @param sephirah - Sephirah name to search for
 * @returns Array of TarotChakraMapping objects with the matching Sephirah
 */
export function getTarotBySephirah(sephirah: string): TarotChakraMapping[] {
  return Object.values(TAROT_CHAKRA_MAP).filter(
    (m) => m.sephirah.toLowerCase() === sephirah.toLowerCase()
  );
}

export default {
  getTarotChakra,
  getArcanoNumber,
  getAllTarotChakras,
  hasTarotChakra,
  getMappingByArcano,
  getTarotByChakra,
  getTarotByElement,
  getTarotByOrixa,
  getTarotBySephirah,
  TAROT_CHAKRA_MAP,
};
