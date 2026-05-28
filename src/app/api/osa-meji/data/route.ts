// Osa Meji API - Cabala Dos Caminhos
// GET endpoints for Osa Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Osa Meji data structure based on Ifá lore
interface OsaMejiData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  symbol: string;
  yoruba: string;
  meaning: string;
  meaningPt: string;
  meaningEn: string;
  spiritualGuidance: string[];
  keywords: string[];
  elements: string[];
  colors: string[];
  dayOfWeek: string;
  rulingOrishas: string[];
  sacredNumbers: number[];
  greeting: string;
  rituals: string[];
  offerings: string[];
  affirmations: string[];
}

// Osa Meji primary data
const osaMejiData: OsaMejiData = {
  id: 'osa-meji-001',
  name: 'Osa Meji',
  namePt: 'Osa Meji - As Aguas da Transformacao',
  nameEn: 'Osa Meji - The Waters of Transformation',
  symbol: '☵☵',
  yoruba: 'Òsá Méjì',
  meaning: 'Osa Meji',
  meaningPt: 'Osa Meji representa as aguas, a transformacao, a dualidade, o fluxo emocional e a profundidade espiritual. E o Odu das correntes de vida e da renovacao interior.',
  meaningEn: 'Osa Meji represents the waters, transformation, duality, emotional flow, and spiritual depth. It is the Odu of life currents and inner renewal.',
  spiritualGuidance: [
    'Accept the flow of life with grace and surrender',
    'Navigate emotional depths with wisdom and patience',
    'Honor the sacred waters within and around you',
    'Trust in the transformative power of letting go',
    'Embrace duality as a path to wholeness',
    'Cultivate adaptability like water flowing around obstacles',
  ],
  keywords: ['agua', 'transformacao', 'dualidade', 'fluxo', 'renovacao', 'sagrado', 'profundidade', 'emocao'],
  elements: ['Agua Sagrada', 'Rio', 'Mar'],
  colors: ['#1E90FF', '#00CED1', '#40E0D0'],
  dayOfWeek: 'Quarta-feira',
  rulingOrishas: ['Oxum', 'Olokun', 'Olódùmarè'],
  sacredNumbers: [2, 8, 16, 32],
  greeting: 'As waters flow!',
  rituals: [
    'Ablucao matinal com agua deflussente',
    'Oferecimento de melao e aguas parfumadas a Oxum',
    'Mergulho ritual em aguas correntes naturais',
    'Meditacao a beira de rio ao amanhecer',
  ],
  offerings: [
    'Melancias e frutas aquaticas',
    'Agua de flor de laranjeira',
    'Ostra e frutos do mar',
    'Perfume de ylang-ylang',
  ],
  affirmations: [
    'I flow with the currents of life',
    'I embrace transformation with grace',
    'I honor the sacred waters within me',
    'I release what no longer serves my highest good',
  ],
};

// Combined 16 Meji Odus with Osa Meji as Odu 8
const mejiOdusData: Record<number, OsaMejiData> = {
  1: { id: 'meji-ogbe-001', name: 'Meji-Ogbe', namePt: 'Meji-Ogbe - A Origem Sagrada', nameEn: 'Meji-Ogbe - The Sacred Origin', symbol: '☰☰', yoruba: 'Ògúndá Méjì', meaning: 'Creation and beginnings', meaningPt: 'Meji-Ogbe representa a criacao, a origem sagrada e o potencial infinito. E o Odu do nascer e do inicio de tudo.', meaningEn: 'Meji-Ogbe represents creation, the sacred origin, and infinite potential. It is the Odu of birth and the beginning of all things.', spiritualGuidance: ['Begin with reverence', 'Honor the source of all creation', 'Trust in new beginnings'], keywords: ['criacao', 'origem', 'potencial', 'inicio'], elements: ['Luz Primordial', 'Vazio', 'Semente'], colors: ['#FFD700', '#FFA500', '#FF8C00'], dayOfWeek: 'Domingo', rulingOrishas: ['Olódùmarè', 'Olurun'], sacredNumbers: [1, 10, 256], greeting: 'All begins here!', rituals: ['Invocacao ao criar novo', 'SEMENTE ritual de propsito'], offerings: ['Frutas frescas', 'Kolanuts', 'Palanca'], affirmations: ['I am connected to the source of all creation'] },
  2: { id: 'meji-oyeku-001', name: 'Meji-Oyeku', namePt: 'Meji-Oyeku - O Eclipse Divino', nameEn: 'Meji-Oyeku - The Divine Eclipse', symbol: '☱☱', yoruba: 'Òyèkú Méjì', meaning: 'Eclipse and transformation', meaningPt: 'Meji-Oyeku representa o eclipse, a transformacao e a passagem do tempo. E o Odu das sombras que revelam a luz.', meaningEn: 'Meji-Oyeku symbolizes eclipse, transformation, and the passage of time. It is the Odu of shadows that reveal the light.', spiritualGuidance: ['Embrace the darkness before the light', 'Transform through challenge', 'Honor the cycle of endings'], keywords: ['eclipse', 'transformacao', 'sombra', 'luz'], elements: ['Lua', 'Eclipse', 'Trevas'], colors: ['#191970', '#000080', '#000033'], dayOfWeek: 'Segunda-feira', rulingOrishas: ['Orunmila', 'Osanyin'], sacredNumbers: [2, 11, 88], greeting: 'Light follows darkness!', rituals: ['Ritual de passagem lunar', 'Celebracao do eclipse'], offerings: ['Nozes escuras', 'Sangue de pombo', 'Carvao'], affirmations: ['I trust the transformation that darkness brings'] },
  3: { id: 'meji-iwori-001', name: 'Meji-Iwori', namePt: 'Meji-Iwori - O Espelho Invertido', nameEn: 'Meji-Iwori - The Inverted Mirror', symbol: '☳☳', yoruba: 'Ìwòrí Méjì', meaning: 'Wisdom and reflection', meaningPt: 'Meji-Iwori representa a sabedoria, o espelho invertido e a visao verdadeira. E o Odu da introspection e da verdade revelada.', meaningEn: 'Meji-Iwori symbolizes wisdom, the inverted mirror, and true vision. It is the Odu of introspection and revealed truth.', spiritualGuidance: ['See yourself clearly', 'Reflect on your true nature', 'Seek wisdom in silence'], keywords: ['sabedoria', 'espelho', 'reflexao', 'verdade'], elements: ['Espelho', 'Prata', 'Caminho'], colors: ['#C0C0C0', '#A9A9A9', '#808080'], dayOfWeek: 'Terca-feira', rulingOrishas: ['Orunmila', 'Olodumare'], sacredNumbers: [3, 12, 48], greeting: 'Truth reflects back!', rituals: ['Meditacao diante do espelho', 'Ritual de autognose'], offerings: ['Espelhos antigos', 'Prata', 'Sonhos'], affirmations: ['I see my true self reflected in all things'] },
  4: { id: 'meji-odi-001', name: 'Meji-Odi', namePt: 'Meji-Odi - A Caminhada do Destino', nameEn: 'Meji-Odi - The Walk of Destiny', symbol: '☲☲', yoruba: 'Òdí Méjì', meaning: 'Destiny and path', meaningPt: 'Meji-Odi representa o destino, a caminhada sagrada e o caminho iluminado. E o Odu do proposito e da jornada espiritual.', meaningEn: 'Meji-Odi symbolizes destiny, the sacred walk, and the illuminated path. It is the Odu of purpose and the spiritual journey.', spiritualGuidance: ['Walk your destined path', 'Trust in your journey', 'Honor the journey within'], keywords: ['destino', 'caminho', 'jornada', 'proposito'], elements: ['Caminho', 'Senda', 'Estrada'], colors: ['#8B4513', '#A0522D', '#D2691E'], dayOfWeek: 'Quarta-feira', rulingOrishas: ['Ogun', 'Osanyin'], sacredNumbers: [4, 13, 64], greeting: 'Walk in truth!', rituals: ['Caminhada ritual', 'Ritual de purificacao do caminho'], offerings: ['Ferro', 'Facas pequenas', 'Alcool'], affirmations: ['I walk my destined path with courage and faith'] },
  5: { id: 'meji-irosun-001', name: 'Meji-Irosun', namePt: 'Meji-Irosun - A Bossa Vermelha', nameEn: 'Meji-Irosun - The Reddish Mark', symbol: '☴☴', yoruba: 'Ìrosùn Méjì', meaning: 'Blood and ancestry', meaningPt: 'Meji-Irosun representa o sangue, a ancestralidade e a conexao com os mortos. E o Odu do sagrado e do ancestral.', meaningEn: 'Meji-Irosun symbolizes blood, ancestry, and connection with the dead. It is the Odu of the sacred and the ancestral.', spiritualGuidance: ['Honor your ancestors', 'Connect with your bloodline', 'Respect the sacred blood'], keywords: ['sangue', 'ancestral', 'mortos', 'sagrado'], elements: ['Sangue', 'Terra', 'Cemiterio'], colors: ['#DC143C', '#B22222', '#8B0000'], dayOfWeek: 'Quinta-feira', rulingOrishas: ['Sango', 'Eshu'], sacredNumbers: [5, 14, 80], greeting: 'The ancestors call!', rituals: ['Ritual de libacao aos mortos', 'Ofrenda no cimiterio'], offerings: ['Sangue de galinha vermelha', 'Vinho de palma', 'Maiz vermelho'], affirmations: ['I honor my ancestors and their sacrifices'] },
  6: { id: 'meji-owonrin-001', name: 'Meji-Owonrin', namePt: 'Meji-Owonrin - O Furacao Divino', nameEn: 'Meji-Owonrin - The Divine Hurricane', symbol: '☶☶', yoruba: 'Òwónrín Méjì', meaning: 'Storm and upheaval', meaningPt: 'Meji-Owonrin representa a tempestade, a transformacao radical e o upheaval divino. E o Odu das mudancas e da forca da natureza.', meaningEn: 'Meji-Owonrin symbolizes the storm, radical transformation, and divine upheaval. It is the Odu of changes and the force of nature.', spiritualGuidance: ['Weather the storm', 'Transform through chaos', 'Find peace in upheaval'], keywords: ['tempestade', 'furacao', 'chaos', 'natureza'], elements: ['Vento', 'Tempestade', 'Raio'], colors: ['#4B0082', '#483D8B', '#2F4F4F'], dayOfWeek: 'Sexta-feira', rulingOrishas: ['Oya', 'Sango'], sacredNumbers: [6, 15, 96], greeting: 'Storm approaches!', rituals: ['Ritual de protecao contra tempestades', 'Danca de Oya'], offerings: ['Raio em garrafa', 'Lenha de ibirran', 'Vento'], affirmations: ['I stand strong through the storms of life'] },
  7: { id: 'meji-obi-001', name: 'Meji-Obi', namePt: 'Meji-Obi - O Olho da Verdade', nameEn: 'Meji-Obi - The Eye of Truth', symbol: '☱☰', yoruba: 'Òbí Méjì', meaning: 'Truth and clarity', meaningPt: 'Meji-Obi representa a verdade, a clareza mental e a visao sagrada. E o Odu da sabedoria e da purificacao.', meaningEn: 'Meji-Obi symbolizes truth, mental clarity, and sacred vision. It is the Odu of wisdom and purification.', spiritualGuidance: ['Seek truth above all', 'See clearly without illusion', 'Purify your mind'], keywords: ['verdade', 'clareza', 'sabedoria', 'purificacao'], elements: ['Olho', 'Sol', 'Clareza'], colors: ['#FFD700', '#FFA500', '#FF6347'], dayOfWeek: 'Sabado', rulingOrishas: ['Orunmila', 'Eleggua'], sacredNumbers: [7, 16, 112], greeting: 'Truth reveals!', rituals: ['Jogo de obi ritual', 'Purificacao mental'], offerings: ['Kolanuts', 'Pombos brancos', 'Agua'], affirmations: ['I see the truth and speak it with love'] },
  8: { id: 'meji-osa-001', name: 'Meji-Osa', namePt: 'Meji-Osa - As Aguas da Transformacao', nameEn: 'Meji-Osa - The Waters of Transformation', symbol: '☵☵', yoruba: 'Òsá Méjì', meaning: 'Waters and transformation', meaningPt: 'Meji-Osa representa as aguas, a transformacao, a dualidade, o fluxo emocional e a profundidade espiritual. E o Odu das correntes de vida e da renovacao interior.', meaningEn: 'Meji-Osa represents the waters, transformation, duality, emotional flow, and spiritual depth. It is the Odu of life currents and inner renewal.', spiritualGuidance: ['Accept the flow of life with grace and surrender', 'Navigate emotional depths with wisdom and patience', 'Honor the sacred waters within and around you'], keywords: ['agua', 'transformacao', 'dualidade', 'fluxo'], elements: ['Agua', 'Rio', 'Mar'], colors: ['#1E90FF', '#00CED1', '#40E0D0'], dayOfWeek: 'Quarta-feira', rulingOrishas: ['Oxum', 'Olokun'], sacredNumbers: [8, 17, 128], greeting: 'As waters flow!', rituals: ['Ablucao matinal', 'Oferecimento a Oxum'], offerings: ['Melancias', 'Agua de flor', 'Frutos aquaticos'], affirmations: ['I flow with the currents of life'] },
  9: { id: 'meji-ika-001', name: 'Meji-Ika', namePt: 'Meji-Ika - O Lagarto Sagrado', nameEn: 'Meji-Ika - The Sacred Lizard', symbol: '☵☴', yoruba: 'Ìká Méjì', meaning: 'The sacred lizard', meaningPt: 'Meji-Ika representa o lagarto sagrado, a adaptacao e a sobrevivencia. E o Odu da flexibilidade e da capacidade de mudanca.', meaningEn: 'Meji-Ika symbolizes the sacred lizard, adaptation, and survival. It is the Odu of flexibility and the ability to change.', spiritualGuidance: ['Adapt to survive', 'Embrace change', 'Find strength in flexibility'], keywords: ['lagarto', 'adaptacao', 'sobrevivencia', 'mudanca'], elements: ['Terra', 'Deserto', 'Oasis'], colors: ['#228B22', '#006400', '#556B2F'], dayOfWeek: 'Domingo', rulingOrishas: ['Eshu', 'Osanyin'], sacredNumbers: [9, 18, 144], greeting: 'Adapt and survive!', rituals: ['Ritual de adaptacao', 'Saudacao ao lagarto'], offerings: ['Lagartos pequenos', 'Terra vermelha', 'Seiva'], affirmations: ['I adapt and thrive through all changes'] },
  10: { id: 'meji-she-001', name: 'Meji-She', namePt: 'Meji-She - A Maozinha Divina', nameEn: 'Meji-She - The Divine Hand', symbol: '☲☴', yoruba: 'Ìshè Méjì', meaning: 'The divine hand', meaningPt: 'Meji-She representa a mao divina, a abundancia e a bencao sagrada. E o Odu da prosperidade e da intervencao divina.', meaningEn: 'Meji-She symbolizes the divine hand, abundance, and sacred blessing. It is the Odu of prosperity and divine intervention.', spiritualGuidance: ['Receive divine blessings', 'Open your hands to abundance', 'Trust in divine providence'], keywords: ['mao', 'abundancia', 'bencao', 'providencia'], elements: ['Maos', 'Abundancia', 'Divina'], colors: ['#32CD32', '#00FF00', '#7CFC00'], dayOfWeek: 'Quarta-feira', rulingOrishas: ['Oxum', 'Olodumare'], sacredNumbers: [10, 19, 160], greeting: 'Blessings flow!', rituals: ['Ritual de prosperidade', 'Ofrenda de abundancia'], offerings: ['Mel', 'Ouro', 'Frutas abundantes'], affirmations: ['I receive divine blessings with gratitude'] },
  11: { id: 'meji-fa-001', name: 'Meji-Fa', namePt: 'Meji-Fa - O Livro do Destino', nameEn: 'Meji-Fa - The Book of Destiny', symbol: '☱☲', yoruba: 'Fá Méjì', meaning: 'The book of destiny', meaningPt: 'Meji-Fa representa o livro do destino, o conhecimento sagrado e a sabedoriaprofetica. E o Odu da revelacao e da profecia.', meaningEn: 'Meji-Fa symbolizes the book of destiny, sacred knowledge, and prophetic wisdom. It is the Odu of revelation and prophecy.', spiritualGuidance: ['Read your destiny', 'Seek sacred knowledge', 'Trust in prophecy'], keywords: ['livro', 'destino', 'profecia', 'conhecimento'], elements: ['Pergaminho', 'Tinta', 'Livro'], colors: ['#8B4513', '#DEB887', '#D2B48C'], dayOfWeek: 'Quinta-feira', rulingOrishas: ['Orunmila', 'Ifa'], sacredNumbers: [11, 20, 176], greeting: 'Destiny reveals!', rituals: ['Leitura sagrada de Ifa', 'Consultacao ao livro'], offerings: ['Livros antigos', 'Tinta', 'Pergaminho'], affirmations: ['I read my destiny and write my future'] },
  12: { id: 'meji-yeku-001', name: 'Meji-Yeku', namePt: 'Meji-Yeku - A Encarnacao Divina', nameEn: 'Meji-Yeku - The Divine Incarnation', symbol: '☶☲', yoruba: 'Yèkú Méjì', meaning: 'Divine incarnation', meaningPt: 'Meji-Yeku representa a encarnacao divina, a manifestacao sagrada e a presenca do divino. E o Odu da manifestacao e da presencia.', meaningEn: 'Meji-Yeku symbolizes divine incarnation, sacred manifestation, and the presence of the divine. It is the Odu of manifestation and presence.', spiritualGuidance: ['Honor the divine within', 'Manifest your purpose', 'Recognize the sacred'], keywords: ['encarnacao', 'manifestacao', 'divino', 'presenca'], elements: ['Corpo', 'Templo', 'Presenca'], colors: ['#9370DB', '#BA55D3', '#9932CC'], dayOfWeek: 'Domingo', rulingOrishas: ['Olodumare', 'Todos Orixas'], sacredNumbers: [12, 21, 192], greeting: 'Divine presence!', rituals: ['Ritual de invocacao divina', 'Celebrao da encarnacao'], offerings: ['Velas de todas cores', 'Incenso universal', 'Ofrendas multiplas'], affirmations: ['I honor the divine within me and all beings'] },
  13: { id: 'meji-odedin-001', name: 'Meji-Odedin', namePt: 'Meji-Odedin - O Caminho do Meio', nameEn: 'Meji-Odedin - The Middle Path', symbol: '☴☱', yoruba: 'Òdédìn Méjì', meaning: 'The middle path', meaningPt: 'Meji-Odedin representa o caminho do meio, o equilibrio e a harmonia. E o Odu do balance e da serenidade.', meaningEn: 'Meji-Odedin symbolizes the middle path, balance, and harmony. It is the Odu of balance and serenity.', spiritualGuidance: ['Walk the middle path', 'Seek balance in all things', 'Find harmony in duality'], keywords: ['meio', 'equilibrio', 'harmonia', 'balance'], elements: ['Balança', 'Equilibrio', 'Harmonia'], colors: ['#FFD700', '#FFA500', '#FF4500'], dayOfWeek: 'Quinta-feira', rulingOrishas: ['Orunmila', 'Obatala'], sacredNumbers: [13, 22, 208], greeting: 'Balance reveals!', rituals: ['Ritual de equilibrio', 'Celebrao do caminho do meio'], offerings: ['Dois de cada', 'Balança', 'Pena'], affirmations: ['I walk the path of balance and harmony'] },
  14: { id: 'meji-ogunda-001', name: 'Meji-Ogunda', namePt: 'Meji-Ogunda - A Ferramenta Divina', nameEn: 'Meji-Ogunda - The Divine Tool', symbol: '☰☴', yoruba: 'Ògúndá Méjì', meaning: 'The divine tool', meaningPt: 'Meji-Ogunda representa a ferramenta divina, o trabalho sagrado e a habilidade. E o Odu da criao e da crafts.', meaningEn: 'Meji-Ogunda symbolizes the divine tool, sacred work, and skill. It is the Odu of creation and crafts.', spiritualGuidance: ['Work with divine tools', 'Create with purpose', 'Honor your skills'], keywords: ['ferramenta', 'trabalho', 'criacao', 'habilidade'], elements: ['Ferro', 'Ferramenta', 'Criacao'], colors: ['#A9A9A9', '#696969', '#808080'], dayOfWeek: 'Terca-feira', rulingOrishas: ['Ogun', 'Ososi'], sacredNumbers: [14, 23, 224], greeting: 'Work reveals!', rituals: ['Ritual do ferreiro', 'Celebrao do trabalho'], offerings: ['Ferramentas', 'Ferro', 'Facas'], affirmations: ['I work with divine purpose and skill'] },
  15: { id: 'meji-ikate-001', name: 'Meji-Ikate', namePt: 'Meji-Ikate - A Uniao Sagrada', nameEn: 'Meji-Ikate - The Sacred Union', symbol: '☲☳', yoruba: 'Ìkáté Méjì', meaning: 'The sacred union', meaningPt: 'Meji-Ikate representa a uniao sagrada, o casamento divino e a parceria. E o Odu da uniao e do relacionamento.', meaningEn: 'Meji-Ikate symbolizes the sacred union, divine marriage, and partnership. It is the Odu of union and relationship.', spiritualGuidance: ['Honor the sacred union', 'Work in partnership', 'Create through connection'], keywords: ['uniao', 'casamento', 'parceria', 'conexao'], elements: ['Dois', 'Uniao', 'Partilha'], colors: ['#FF69B4', '#FF1493', '#DB7093'], dayOfWeek: 'Sexta-feira', rulingOrishas: ['Oxum', 'Ogun'], sacredNumbers: [15, 24, 240], greeting: 'Union reveals!', rituals: ['Ritual de uniao', 'Celebrao do casamento'], offerings: ['Dois de tudo', 'Velas vermelhas', 'Nozes de cola'], affirmations: ['I honor the sacred union in all my relationships'] },
  16: { id: 'meji-iyonu-001', name: 'Meji-Iyonu', namePt: 'Meji-Iyonu - O Peito Sagrado', nameEn: 'Meji-Iyonu - The Sacred Chest', symbol: '☴☶', yoruba: 'Ìyónú Méjì', meaning: 'The sacred chest', meaningPt: 'Meji-Iyonu representa o peito sagrado, a coragem e a forca interior. E o Odu do coracao e da resistencia.', meaningEn: 'Meji-Iyonu symbolizes the sacred chest, courage, and inner strength. It is the Odu of the heart and resilience.', spiritualGuidance: ['Open your sacred chest', 'Find courage within', 'Stand with strength'], keywords: ['peito', 'coragem', 'forca', 'coracao'], elements: ['Peito', 'Coracao', 'Ossos'], colors: ['#8B0000', '#800000', '#A52A2A'], dayOfWeek: 'Quarta-feira', rulingOrishas: ['Ogun', 'Sango'], sacredNumbers: [16, 25, 256], greeting: 'Strength reveals!', rituals: ['Ritual do peito', 'Celebrao da coragem'], offerings: ['Ossos', 'Coracao de animal', 'Velas escuras'], affirmations: ['I open my sacred chest and find unshakeable courage'] },
  17: { id: 'meji-odedin-meji-001', name: 'Meji-Odedin-Meji', namePt: 'Meji-Odedin-Meji - O Duplo Caminho do Meio', nameEn: 'Meji-Odedin-Meji - The Double Middle Path', symbol: '☱☱', yoruba: 'Òdédìn Méjì Méjì', meaning: 'The double middle path', meaningPt: 'Meji-Odedin-Meji representa o dobro do caminho do meio, o equilibrio perfeito e a harmonia suprema. E o Odu do balance total.', meaningEn: 'Meji-Odedin-Meji symbolizes the double middle path, perfect balance, and supreme harmony. It is the Odu of total balance.', spiritualGuidance: ['Walk in perfect balance', 'Find supreme harmony', 'Embrace duality with grace'], keywords: ['duplo', 'equilibrio', 'harmonia', 'perfeito'], elements: ['Balança Dupla', 'Espelho Duplo', 'Duplicidade'], colors: ['#FFD700', '#FFA500', '#FFFF00'], dayOfWeek: 'Terca-feira', rulingOrishas: ['Orunmila', 'Olodumare'], sacredNumbers: [17, 26, 272], greeting: 'Perfect balance!', rituals: ['Ritual de equilibrio supremo', 'Celebrao da harmonia'], offerings: ['Duplo de tudo', 'Espelhos', 'Ouro'], affirmations: ['I walk in perfect balance and supreme harmony'] },
};

/**
 * GET /api/osa-meji/data
 * Returns Osa Meji-related data including Osa Meji Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const numero = url.searchParams.get('numero');
  const nome = url.searchParams.get('nome');

  // Default: return Osa Meji primary data
  if (!type && !numero && !nome) {
    return NextResponse.json({
      success: true,
      data: osaMejiData,
      meta: {
        type: 'primary',
        description: 'Osa Meji primary spiritual data',
      },
    });
  }

  // Return all Meji Odus when type=all
  if (type === 'all') {
    return NextResponse.json({
      success: true,
      data: Object.values(mejiOdusData),
      meta: {
        type: 'all-meji',
        total: Object.keys(mejiOdusData).length,
      },
    });
  }

  // Return Meji by number
  if (numero) {
    const num = parseInt(numero, 10);
    const odu = mejiOdusData[num];
    if (!odu) {
      return NextResponse.json(
        { success: false, error: 'Meji Odu not found for number: ' + numero },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: odu,
      meta: {
        type: 'by-number',
        numero: num,
      },
    });
  }

  // Search by name
  if (nome) {
    const searchTerm = nome.toLowerCase();
    const results = Object.values(mejiOdusData).filter(
      (o) =>
        o.name.toLowerCase().includes(searchTerm) ||
        o.namePt.toLowerCase().includes(searchTerm) ||
        o.yoruba.toLowerCase().includes(searchTerm)
    );
    if (results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No Meji Odu found matching: ' + nome },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        type: 'by-name',
        query: nome,
        total: results.length,
      },
    });
  }

  // Fallback to primary Osa Meji
  return NextResponse.json({
    success: true,
    data: osaMejiData,
    meta: {
      type: 'primary',
      description: 'Osa Meji primary spiritual data',
    },
  });
}