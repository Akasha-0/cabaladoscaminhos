/**
 * Mesa Real (Cartas Ciganas) - Dados Estáticos
 * 36 Casas, 36 Cartas e 16 Odús
 */

import type { CasaCigana, CartaCigana, OduInfo } from './mesa-real-types';

// ============================================================================
// 36 CASAS DA MESA REAL (9x4 = 36 posições)
// ============================================================================
// Leitura: esquerda para direita, linha por linha
// Linha 1: posições 1-9 (cima)
// Linha 2: posições 10-18
// ...
// Linha 4: posições 28-36 (baixo)

export const CASAS_MESA_REAL: CasaCigana[] = [
  // LINHA 1 (1-9)
  {
    houseNumber: 1,
    name: 'O MENSAGEIRO',
    meaning: 'O mensageiro - comunicação, viagens curtas, mudanças, movimento. Abre e fecha a mesa.',
    element: 'ar',
    archetype: 'mensageiro',
    astrologyHouse: 3,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Caminho de Vida (vibração inicial)', 'Número de Expressão'],
    oduAspects: ['Ogunda (comunicação)', 'Ejionle (movimento)'],
  },
  {
    houseNumber: 2,
    name: 'A VARINHA',
    meaning: 'A varinha - decisões, escolhas, bifurcações, crossroads. Futuro próximo.',
    element: 'éter',
    archetype: 'transformação',
    astrologyHouse: 1,
    associatedPlanet: 'Plutão',
    numerologyAspects: ['Número de Motivação (alma)', 'Desafio Cármico'],
    oduAspects: ['Ogunda (escolhas)', 'Okanran (decisões)'],
  },
  {
    houseNumber: 3,
    name: 'A NUVEM',
    meaning: 'A nuvem - confusão, incerteza, mistério, o que está velado.',
    element: 'água',
    archetype: 'nuvens',
    astrologyHouse: 12,
    associatedPlanet: 'Netuno',
    numerologyAspects: ['Número de Personalidade (máscara)', 'Pinnacle Cycle'],
    oduAspects: ['Owonrin (segredos)', 'Ogunda (mistérios)'],
  },
  {
    houseNumber: 4,
    name: 'A CASA',
    meaning: 'A casa - lar, família, raízes, base, patrimônio. O fundo do céu.',
    element: 'terra',
    archetype: 'lar',
    astrologyHouse: 4,
    associatedPlanet: 'Saturno',
    numerologyAspects: ['Número de Destino (Motivação cármica)', 'Lições Cármicas'],
    oduAspects: ['Ose (família)', 'Oturuponu (raízes)'],
  },
  {
    houseNumber: 5,
    name: 'A SERPE',
    meaning: 'A serpente - sabedoria ancestral, cura, transformação, sabedoria oculta.',
    element: 'fogo',
    archetype: 'serpente',
    astrologyHouse: 8,
    associatedPlanet: 'Marte',
    numerologyAspects: ['Número de Expressão (força vital)', 'Karma余额'],
    oduAspects: ['Okparanran (sabedoria)', 'Ogunda (cura)'],
  },
  {
    houseNumber: 6,
    name: 'A FLOR',
    meaning: 'A flor - amor, beleza, romance, energia criativa, sensualidade.',
    element: 'água',
    archetype: 'flor',
    astrologyHouse: 5,
    associatedPlanet: 'Vênus',
    numerologyAspects: ['Número de Realização', 'Dias Pessoais'],
    oduAspects: ['Oi (amor)', 'Oshe (beleza)'],
  },
  {
    houseNumber: 7,
    name: 'A ÁRVORE',
    meaning: 'A árvore - saúde, crescimento, estabilidade, conexões passadas.',
    element: 'terra',
    archetype: 'natureza',
    astrologyHouse: 6,
    associatedPlanet: 'Terra',
    numerologyAspects: ['Caminho de Vida (crescimento)', 'Ano Pessoal'],
    oduAspects: ['Otura (saúde)', 'Iroso (estabilidade)'],
  },
  {
    houseNumber: 8,
    name: 'A CAIXA',
    meaning: 'A caixa - segredos, tesouros escondidos, o que está protegido.',
    element: 'terra',
    archetype: 'caixa',
    astrologyHouse: 8,
    associatedPlanet: 'Plutão',
    numerologyAspects: ['Desafio Principal', 'Maturity Number'],
    oduAspects: ['Ogunda (segredos)', 'Odi (proteção)'],
  },
  {
    houseNumber: 9,
    name: 'O CORVO',
    meaning: 'O corvo - mensagem importante, aviso, presságio, mudança iminente.',
    element: 'ar',
    archetype: 'mensageiro',
    astrologyHouse: 3,
    associatedPlanet: 'Marte',
    numerologyAspects: ['Karmic Debt', 'Alerta Cármico'],
    oduAspects: ['Ogunda (mensagens)', 'Owonrin (presságios)'],
  },

  // LINHA 2 (10-18)
  {
    houseNumber: 10,
    name: 'A CRIANÇA',
    meaning: 'A criança - pureza, novos começos, inocência, projetos novos.',
    element: 'água',
    archetype: 'criança',
    astrologyHouse: 5,
    associatedPlanet: 'Lua',
    numerologyAspects: ['Ciclo de Aprendizado', 'Inner Dream'],
    oduAspects: ['Iwori (inocência)', 'Obara (novos projetos)'],
  },
  {
    houseNumber: 11,
    name: 'A NAVARRA',
    meaning: 'A Navarra (casa dos ciganos) - comunidade, pertencimento, proteção do grupo.',
    element: 'fogo',
    archetype: 'lar',
    astrologyHouse: 11,
    associatedPlanet: 'Urano',
    numerologyAspects: ['Lições Cármicas', 'Agrupamento'],
    oduAspects: ['Otruponu (comunidade)', 'Ogunda (proteção)'],
  },
  {
    houseNumber: 12,
    name: 'OS PÁSSAROS',
    meaning: 'Os pássaros - comunicação, pensamentos, vizinhança, Irmãos/Casa 3.',
    element: 'ar',
    archetype: 'pássaro',
    astrologyHouse: 3,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Número de Expressão', 'Dom Divino (Tântrica)'],
    oduAspects: ['Ejionle (comunicação)', 'Ogunda (pensamentos)'],
  },
  {
    houseNumber: 13,
    name: 'A RENA',
    meaning: 'A rena (ou cavalo) - viagem, movimento rápido, mudança de status.',
    element: 'fogo',
    archetype: 'transformação',
    astrologyHouse: 9,
    associatedPlanet: 'Júpiter',
    numerologyAspects: ['Expansion Number', 'Viagem Cármica'],
    oduAspects: ['Ogunda (viagens)', 'Ose (movimento)'],
  },
  {
    houseNumber: 14,
    name: 'O CÃO',
    meaning: 'O cão - amizade, lealdade, proteção, aliados fiéis.',
    element: 'água',
    archetype: 'natureza',
    astrologyHouse: 11,
    associatedPlanet: 'Lua',
    numerologyAspects: ['Social Debt', 'Friend Number'],
    oduAspects: ['Okanran (amizade)', 'Otura (proteção)'],
  },
  {
    houseNumber: 15,
    name: 'O URSO',
    meaning: 'O urso - força, poder, autoridade, mentores e figuras paternas.',
    element: 'terra',
    archetype: 'urso',
    astrologyHouse: 1,
    associatedPlanet: 'Marte',
    numerologyAspects: ['Power Number', 'Lição de Poder'],
    oduAspects: ['Ogunda (força)', 'Ose (autoridade)'],
  },
  {
    houseNumber: 16,
    name: 'AS ESTRELAS',
    meaning: 'As estrelas - esperança, inspiração, espiritualidade, destino.',
    element: 'éter',
    archetype: 'estrelas',
    astrologyHouse: 9,
    associatedPlanet: 'Júpiter',
    numerologyAspects: ['Life Purpose', 'Espiritualidade'],
    oduAspects: ['Oturuponu (esperança)', 'Oi (inspiração)'],
  },
  {
    houseNumber: 17,
    name: 'A CEGONHA',
    meaning: 'A cegonha - mudança de lar, evolução, nascimentos, transformação.',
    element: 'ar',
    archetype: 'transformação',
    astrologyHouse: 3,
    associatedPlanet: 'Sartuno',
    numerologyAspects: ['Transition Number', 'Mudança de Ciclo'],
    oduAspects: ['Ogunda (evolução)', 'Iwori (nascimentos)'],
  },
  {
    houseNumber: 18,
    name: 'A RAPOSA',
    meaning: 'A raposa - astúcia, engano, necessidade de cautela, negócios.',
    element: 'terra',
    archetype: 'raposa',
    astrologyHouse: 6,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Hidden Agenda', 'Business Number'],
    oduAspects: ['Odi (cautela)', 'Ogunda (astúcia)'],
  },

  // LINHA 3 (19-27)
  {
    houseNumber: 19,
    name: 'O MACACO',
    meaning: 'O macaco - inteligência, jogos, diversão, mentiras piadosas.',
    element: 'fogo',
    archetype: 'transformação',
    astrologyHouse: 5,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Playful Energy', 'Creative Number'],
    oduAspects: ['Ogunda (jogos)', 'Oshe (diversão)'],
  },
  {
    houseNumber: 20,
    name: 'O PORCO',
    meaning: 'O porco - prosperidade, fartura, sensualidade, prazeres.',
    element: 'terra',
    archetype: 'natureza',
    astrologyHouse: 2,
    associatedPlanet: 'Vênus',
    numerologyAspects: ['Abundance Number', 'Prazer Cármico'],
    oduAspects: ['Ose (prosperidade)', 'Oi (sensualidade)'],
  },
  {
    houseNumber: 21,
    name: 'O CAMINHO',
    meaning: 'O caminho - jornada, destino, direção, propósito de vida.',
    element: 'fogo',
    archetype: 'caminho',
    astrologyHouse: 1,
    associatedPlanet: 'Marte',
    numerologyAspects: ['Life Path', 'Destino Cármico'],
    oduAspects: ['Ogunda (jornada)', 'Oturuponu (destino)'],
  },
  {
    houseNumber: 22,
    name: 'A TORRE',
    meaning: 'A torre - elevação, sucesso material, reconhecimento público.',
    element: 'fogo',
    archetype: 'torre',
    astrologyHouse: 10,
    associatedPlanet: 'Saturno',
    numerologyAspects: ['Achievement Number', 'Career Path'],
    oduAspects: ['Ose (sucesso)', 'Ogunda (reconhecimento)'],
  },
  {
    houseNumber: 23,
    name: 'O LIXO',
    meaning: 'O lixo (ou monturo) - acúmulo, rotina, o que precisa ser liberado.',
    element: 'terra',
    archetype: 'natureza',
    astrologyHouse: 6,
    associatedPlanet: 'Saturno',
    numerologyAspects: ['Release Number', 'Purificação'],
    oduAspects: ['Owonrin (liberação)', 'Odi (rotina)'],
  },
  {
    houseNumber: 24,
    name: 'O RATINHO',
    meaning: 'O ratinho - destruição sutil, perda, pragas, preocupações.',
    element: 'terra',
    archetype: 'ratos',
    astrologyHouse: 6,
    associatedPlanet: 'Marte',
    numerologyAspects: ['Destruction Cycle', 'Worry Number'],
    oduAspects: ['Ogunda (destruição)', 'Okanran (perdas)'],
  },
  {
    houseNumber: 25,
    name: 'O ANEL',
    meaning: 'O anel - compromisso, casamento, contratos, parcerias.',
    element: 'terra',
    archetype: 'anel',
    astrologyHouse: 7,
    associatedPlanet: 'Vênus',
    numerologyAspects: ['Partnership Number', 'Union Energy'],
    oduAspects: ['Oi (compromisso)', 'Oshe (casamento)'],
  },
  {
    houseNumber: 26,
    name: 'A ESTANTES',
    meaning: 'A estantes (ou livro) - conhecimento, estudos, segredos revelados.',
    element: 'ar',
    archetype: 'livro',
    astrologyHouse: 9,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Knowledge Number', 'Study Debt'],
    oduAspects: ['Ogunda (conhecimento)', 'Iwori (estudos)'],
  },
  {
    houseNumber: 27,
    name: 'O LÍRIO',
    meaning: 'O lírio - paz, harmonia familiar, maturidade espiritual.',
    element: 'água',
    archetype: 'lírio',
    astrologyHouse: 4,
    associatedPlanet: 'Lua',
    numerologyAspects: ['Peace Number', 'Maturity Cycle'],
    oduAspects: ['Otura (paz)', 'Owonrin (harmonia)'],
  },

  // LINHA 4 (28-36)
  {
    houseNumber: 28,
    name: 'A CARTA',
    meaning: 'A carta - mensagem, notícia, comunicação escrita, convite.',
    element: 'ar',
    archetype: 'carta',
    astrologyHouse: 3,
    associatedPlanet: 'Mercúrio',
    numerologyAspects: ['Message Number', 'Communication'],
    oduAspects: ['Ogunda (mensagens)', 'Ejionle (notícias)'],
  },
  {
    houseNumber: 29,
    name: 'O CAVALEIRO',
    meaning: 'O cavaleiro - visita, chegada iminente, mensageiro veloz.',
    element: 'fogo',
    archetype: 'mensageiro',
    astrologyHouse: 1,
    associatedPlanet: 'Marte',
    numerologyAspects: ['Arrival Number', 'Iminent Event'],
    oduAspects: ['Ogunda (chegadas)', 'Ose (visitas)'],
  },
  {
    houseNumber: 30,
    name: 'A DAMA',
    meaning: 'A dama (ou mulher) - a consulente ou mulher presente, amor.',
    element: 'água',
    archetype: 'flor',
    astrologyHouse: 5,
    associatedPlanet: 'Vênus',
    numerologyAspects: ['Feminine Energy', 'Love Interest'],
    oduAspects: ['Oi (feminino)', 'Oshe (mulher)'],
  },
  {
    houseNumber: 31,
    name: 'O BARÃO',
    meaning: 'O barão (ou homem) - o consulente ou homem presente, ação.',
    element: 'fogo',
    archetype: 'caminho',
    astrologyHouse: 1,
    associatedPlanet: 'Marte',
    numerologyAspects: ['Masculine Energy', 'Action Required'],
    oduAspects: ['Ogunda (masculino)', 'Ose (ação)'],
  },
  {
    houseNumber: 32,
    name: 'A TREVO',
    meaning: 'O trevo - sorte, oportunidade, golpe de sorte, esperança.',
    element: 'ar',
    archetype: 'estrelas',
    astrologyHouse: 5,
    associatedPlanet: 'Júpiter',
    numerologyAspects: ['Lucky Number', 'Opportunity Window'],
    oduAspects: ['Oturuponu (sorte)', 'Okanran (oportunidade)'],
  },
  {
    houseNumber: 33,
    name: 'A LUA',
    meaning: 'A lua - intuição, inconsciente, emoções, o que está oculto.',
    element: 'água',
    archetype: 'pássaro',
    astrologyHouse: 4,
    associatedPlanet: 'Lua',
    numerologyAspects: ['Intuition Number', 'Subconscious'],
    oduAspects: ['Iwori (intuição)', 'Owonrin (inconsciente)'],
  },
  {
    houseNumber: 34,
    name: 'OS PEIXES',
    meaning: 'Os peixes - finanças, herdados, bens materiais, casa 2.',
    element: 'água',
    archetype: 'caixa',
    astrologyHouse: 2,
    associatedPlanet: 'Netuno',
    numerologyAspects: ['Finance Number', 'Número de Karma (Tântrica)'],
    oduAspects: ['Ose (finanças)', 'Ogunda (bens)'],
  },
  {
    houseNumber: 35,
    name: 'O TIMONEIRO',
    meaning: 'O timoneiro - guia, mentor, aquele que dirige, direção.',
    element: 'fogo',
    archetype: 'mensageiro',
    astrologyHouse: 9,
    associatedPlanet: 'Júpiter',
    numerologyAspects: ['Guide Number', 'Mentorship'],
    oduAspects: ['Oturuponu (guia)', 'Ogunda (mentor)'],
  },
  {
    houseNumber: 36,
    name: 'A URNA',
    meaning: 'A urna (ou taça) - destino, fim de ciclo, resultado final.',
    element: 'água',
    archetype: 'caixa',
    astrologyHouse: 12,
    associatedPlanet: 'Saturno',
    numerologyAspects: ['Destiny Number', 'Final Cycle'],
    oduAspects: ['Oturuponu (destino)', 'Owonrin (resultado)'],
  },
];

// ============================================================================
// 36 CARTAS CIGANAS (Cartas do Baralho)
// ============================================================================

export const CARTAS_CIGANAS: CartaCigana[] = [
  { number: 1, name: 'O MENSAGEIRO', meaning: 'Comunicação, mudanças, viagens curtas. O portador de notícias.' },
  { number: 2, name: 'A VARINHA', meaning: 'Decisões, escolhas, crossroads. O poder de decidir.' },
  { number: 3, name: 'A NUVEM', meaning: 'Confusão, incerteza, o que está velado.' },
  { number: 4, name: 'A CASA', meaning: 'Lar, família, raízes, base.' },
  { number: 5, name: 'A SERPE', meaning: 'Sabedoria, cura, transformação, conhecimento oculto.' },
  { number: 6, name: 'A FLOR', meaning: 'Amor, beleza, romance, energia criativa.' },
  { number: 7, name: 'A ÁRVORE', meaning: 'Saúde, crescimento, estabilidade, vida.' },
  { number: 8, name: 'A CAIXA', meaning: 'Segredos, tesouros escondidos, o que está protegido.' },
  { number: 9, name: 'O CORVO', meaning: 'Mensagem importante, aviso, mudança iminente.' },
  { number: 10, name: 'A CRIANÇA', meaning: 'Pureza, novos começos, projetos, inocência.' },
  { number: 11, name: 'A NAVARRA', meaning: 'Comunidade cigana, pertencimento, proteção do grupo.' },
  { number: 12, name: 'OS PÁSSAROS', meaning: 'Comunicação, pensamentos, vizinhança, Irmãos.' },
  { number: 13, name: 'A RENA', meaning: 'Viagem, movimento, mudança de status, status social.' },
  { number: 14, name: 'O CÃO', meaning: 'Amizade, lealdade, proteção, aliados.' },
  { number: 15, name: 'O URSO', meaning: 'Força, poder, autoridade, mentores.' },
  { number: 16, name: 'AS ESTRELAS', meaning: 'Esperança, inspiração, espiritualidade, destino.' },
  { number: 17, name: 'A CEGONHA', meaning: 'Mudança de lar, evolução, nascimentos, transformação.' },
  { number: 18, name: 'A RAPOSA', meaning: 'Astúcia, engano, cautela, negócios.' },
  { number: 19, name: 'O MACACO', meaning: 'Inteligência, jogos, diversão, mentiras.' },
  { number: 20, name: 'O PORCO', meaning: 'Prosperidade, fartura, sensualidade, prazeres.' },
  { number: 21, name: 'O CAMINHO', meaning: 'Jornada, destino, direção, propósito.' },
  { number: 22, name: 'A TORRE', meaning: 'Elevação, sucesso, reconhecimento público.' },
  { number: 23, name: 'O LIXO', meaning: 'Acúmulo, rotina, o que precisa ser liberado.' },
  { number: 24, name: 'O RATINHO', meaning: 'Destruição sutil, perda, preocupações.' },
  { number: 25, name: 'O ANEL', meaning: 'Compromisso, casamento, contratos, parcerias.' },
  { number: 26, name: 'A ESTANTES', meaning: 'Conhecimento, estudos, segredos revelados.' },
  { number: 27, name: 'O LÍRIO', meaning: 'Paz, harmonia, maturidade espiritual.' },
  { number: 28, name: 'A CARTA', meaning: 'Mensagem, notícia, comunicação, convite.' },
  { number: 29, name: 'O CAVALEIRO', meaning: 'Visita, chegada, mensageiro veloz.' },
  { number: 30, name: 'A DAMA', meaning: 'A mulher, amor, energia feminina.' },
  { number: 31, name: 'O BARÃO', meaning: 'O homem, ação, energia masculina.' },
  { number: 32, name: 'A TREVO', meaning: 'Sorte, oportunidade, golpe de sorte.' },
  { number: 33, name: 'A LUA', meaning: 'Intuição, inconsciente, emoções, o oculto.' },
  { number: 34, name: 'OS PEIXES', meaning: 'Finanças, bens, prosperidade material.' },
  { number: 35, name: 'O TIMONEIRO', meaning: 'Guia, mentor, aquele que dirige.' },
  { number: 36, name: 'A URNA', meaning: 'Destino, fim de ciclo, resultado final.' },
];

// ============================================================================
// 16 ODÚS DO SISTEMA DE IFÁ
// ============================================================================

export const ODUS_IFA: OduInfo[] = [
  { numero: 1, nome: 'OKANRAN', significado: 'Comunicação, mudanças rápidas, nervosismo. O mensageiro veloz.', shortMeaning: 'Mensagens e mudanças' },
  { numero: 2, nome: 'EJONG', significado: 'Sabedoria, conhecimento profundo, aposentadoria. A mente superior.', shortMeaning: 'Sabedoria e reflexão' },
  { numero: 3, nome: 'OJURU', significado: 'Destino, o que está para vir, presságios. O futuro que chega.', shortMeaning: 'Destino e presságios' },
  { numero: 4, nome: 'OBARA', significado: 'Justiça, retidão, moral, casamento. A lei moral.', shortMeaning: 'Justiça e retidão' },
  { numero: 5, nome: 'EJEUNLE', significado: 'Sorte, prosperidade, fartura. A abundância divina.', shortMeaning: 'Sorte e prosperidade' },
  { numero: 6, nome: 'OGUNDA', significado: 'Sorte no jogo, oportunidade, trabalho. O esforço recompensado.', shortMeaning: 'Oportunidade e jogo' },
  { numero: 7, nome: 'OSI', significado: 'Feitiçaria, poderes ocultos, proteção. Os mistérios.', shortMeaning: 'Mistérios e proteção' },
  { numero: 8, nome: 'GBO', significado: 'Viagem, movimento, transformação. A jornada espiritual.', shortMeaning: 'Viagem e transformação' },
  { numero: 9, nome: 'IWORI', significado: 'Amargura, tristeza, sofrimento. O que pesa na alma.', shortMeaning: 'Sofrimento e lição' },
  { numero: 10, nome: 'ODI', significado: 'Lei, ordem, correção, disciplina. A justiça cósmica.', shortMeaning: 'Ordem e disciplina' },
  { numero: 11, nome: 'EJIONLE', significado: 'Erros, fracassos, dificuldades. Aprendizado pelo erro.', shortMeaning: 'Erros e dificuldades' },
  { numero: 12, nome: 'OTURA', significado: 'Saúde, paz, remédios, cura. A harmonia restaurada.', shortMeaning: 'Saúde e cura' },
  { numero: 13, nome: 'OTURUPONU', significado: 'Conhecimento, iniciação, sabedoria oculta. Os mistérios divinos.', shortMeaning: 'Iniciação e conhecimento' },
  { numero: 14, nome: 'IRETE', significado: 'Paz, amor, harmonia, reconciliação. A harmonia retorno.', shortMeaning: 'Paz e reconciliação' },
  { numero: 15, nome: 'OSE', significado: 'Poder, força, vitória, conquista. A energia da vitória.', shortMeaning: 'Vitória e poder' },
  { numero: 16, nome: 'OWONRIN', significado: 'Segredos, mistérios, o que está oculto. O véu se levanta.', shortMeaning: 'Segredos revelados' },
];

// ============================================================================
// MAPA DE CORRELAÇÕES ASTROLÓGICAS (para cada casa)
// ============================================================================

/**
 * Retorna a casa astrológica correlacionada para cada casa da Mesa Real
 */
export const ASTROLOGY_HOUSE_MAP: Record<number, { house: number; planet: string; sign: string }> = {
  1: { house: 1, planet: 'Marte', sign: 'Áries' },
  2: { house: 2, planet: 'Vênus', sign: 'Touro' },
  3: { house: 3, planet: 'Mercúrio', sign: 'Gêmeos' },
  4: { house: 4, planet: 'Lua', sign: 'Câncer' },
  5: { house: 5, planet: 'Sol', sign: 'Leão' },
  6: { house: 6, planet: 'Mercúrio', sign: 'Virgem' },
  7: { house: 7, planet: 'Vênus', sign: 'Libra' },
  8: { house: 8, planet: 'Plutão', sign: 'Escorpião' },
  9: { house: 9, planet: 'Júpiter', sign: 'Sagitário' },
  10: { house: 10, planet: 'Saturno', sign: 'Capricórnio' },
  11: { house: 11, planet: 'Urano', sign: 'Aquário' },
  12: { house: 12, planet: 'Netuno', sign: 'Peixes' },
};

// ============================================================================
// MAPEAMENTO DE CORRELAÇÕES ESPECIAIS (para construir dossiê)
// ============================================================================

/**
 * Correlações específicas para o sistema Cabala dos Caminhos
 * Cada casa pode ter correlações especiais com sistemas externos
 */
export const CORRELACOES_ESPECIAIS: Record<number, {
  numerologia: string[];
  tantrica: string[];
  cabalistica: string[];
}> = {
  1: {
    numerologia: ['Caminho de Vida', 'Número de Alma (Motivação)'],
    tantrica: ['Ascendente Cármico', 'Muladhara (Raiz)'],
    cabalistica: ['Aleph (פ)', 'Arquetípus: Ruach (Espírito)'],
  },
  4: {
    numerologia: ['Número de Destino', 'Número de Motivação Cármica'],
    tantrica: ['Fundo do Céu Astrológico', 'Svadhisthana (Sexual)'],
    cabalistica: ['Daleth (ד)', 'Arquetípus: Neschamah (Intuição)'],
  },
  12: {
    numerologia: ['Número de Expressão', 'Dom Divino (Tântrica)'],
    tantrica: ['Casa 3 Astrológica (Comunicação)', 'Vishuddha (Garganta)'],
    cabalistica: ['Ghimel (ג)', 'Arquetípus: Nephesch (Alma)'],
  },
  34: {
    numerologia: ['Número de Karma', 'Dívida Cármica'],
    tantrica: ['Casa 2 Astrológica (Finanças)', 'Manipura (Plexo Solar)'],
    cabalistica: ['Beth (ב)', 'Arquetípus: Guph (Corpo)'],
  },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtém casa pelo número (1-36)
 */
export function getCasaPorNumero(numero: number): CasaCigana | undefined {
  return CASAS_MESA_REAL.find(c => c.houseNumber === numero);
}

/**
 * Obtém carta pelo número (1-36)
 */
export function getCartaPorNumero(numero: number): CartaCigana | undefined {
  return CARTAS_CIGANAS.find(c => c.number === numero);
}

/**
 * Obtém odú pelo número (1-16)
 */
export function getOduPorNumero(numero: number): OduInfo | undefined {
  return ODUS_IFA.find(o => o.numero === numero);
}

/**
 * Valida se número de casa é válido (1-36)
 */
export function isCasaValida(numero: number): boolean {
  return numero >= 1 && numero <= 36;
}

/**
 * Valida se número de odú é válido (1-16)
 */
export function isOduValido(numero: number): boolean {
  return numero >= 1 && numero <= 16;
}

/**
 * Obtém posição na grade 9x4 a partir do número da casa
 */
export function getPosicaoGrid(casaNumero: number): { linha: number; coluna: number } {
  const linha = Math.ceil(casaNumero / 9);
  const coluna = ((casaNumero - 1) % 9) + 1;
  return { linha, coluna };
}
