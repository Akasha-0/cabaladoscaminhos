/**
 * Mantra data module
 * Provides sacred mantras and their properties for the Cabala dos Caminhos system
 */

// @ts-nocheck

export interface MantraProperties {
  name: string;
  namePt: string;
  origin: string;
  pronunciation: string;
  meaning: string;
  translation: string;
  syllables: string[];
  benefits: string[];
  practice: string[];
}

export interface MantraData {
  [key: string]: MantraProperties;
}

const mantras: MantraData = {
  "om": {
    name: "Om",
    namePt: "Om",
    origin: "Sânscrito / Hindu",
    pronunciation: "AUM",
    meaning: "O som primordial do universo",
    translation: "O som primordial; a vibração fundamental da criação",
    syllables: ["A", "U", "M"],
    benefits: ["Conexão transcendental", "Paz interior", "Harmonização energética", "Expansão da consciência"],
    practice: ["Repetir 108 vezes ao amanhecer", "Meditar em silêncio após a entonação", "Combinar com respiração abdominal"]
  },
  "om-mani-padme-hum": {
    name: "Om Mani Padme Hum",
    namePt: "Om Mani Padme Hum",
    origin: "Tibetano / Budismo",
    pronunciation: "Om mani peme hung",
    meaning: "A joia no lótus",
    translation: "A joia no coração do lótus; compaixão universal",
    syllables: ["Om", "Ma", "Ni", "Pad", "Me", "Hum"],
    benefits: ["Despertar da compaixão", "Purificação de负面情绪", "Proteção espiritual", "Desenvolvimento bodhisattva"],
    practice: ["Prática de recitação contínua", "Combinar com visualização do lótus", "Meditar sobre境地 de compaixão"]
  },
  "gayatri": {
    name: "Gayatri Mantra",
    namePt: "Mantra Gayatri",
    origin: "Védico / Hindu",
    pronunciation: "Om bhur bhuvah svah",
    meaning: "A luz divina que guia",
    translation: "Iluminação suprema que existe além dos três mundos",
    syllables: ["Om", "Bhu", "r", "Bhu", "vah", "Svah", "Tat", "Savitur", "Varen-yam"],
    benefits: ["Iluminação mental", "Sabedoria superior", "Despertar do terceiro olho", "Proteção contra négative energies"],
    practice: ["Recitar ao amanhecer (Brahmamuhurta)", "3 vezes ao amanhecer, meio-dia e anoitecer", "Visualizar lumière dourada"]
  },
  "mahamrityunjaya": {
    name: "Mahamrityunjaya Mantra",
    namePt: "Mantra Mahamrityunjaya",
    origin: "Védico / Hindu",
    pronunciation: "Om tryambakam yajamahe",
    meaning: "Nos libertamos da morte",
    translation: "Nós oferecemos sacrifícios a Aquele de três olhos; que possamos ser libertados da morte",
    syllables: ["Om", "Try", "am", "ba", "kam", "Yaj", "ma", "he"],
    benefits: ["Healing físico e espiritual", "Amortalidade", "Proteção contra acidentes", "Conexão com Shiva"],
    practice: ["Repetir 11, 21 ou 108 vezes", "Combine com jejum opcional", "Visualizar energias curativas"]
  },
  "lokah-samastah": {
    name: "Lokah Samastah Sukhino Bhavantu",
    namePt: "Lokah Samastah",
    origin: "Sânscrito / Yoga",
    pronunciation: "Lokah samastah sukhino bhavantu",
    meaning: "Que todos sejam felizes",
    translation: "Que todos os seres em todos os lugares sejam felizes e livres",
    syllables: ["Lo", "kah", "Sa", "mas", "tah", "Su", "khi", "no", "Bha", "van", "tu"],
    benefits: ["Compassão universal", "Harmonia global", "Remoção de sofrimento", "Paz mundial"],
    practice: ["Recitar يومياً ao amanhecer e anoitecer", "Combinar com intenção positiva", "Visualizar paz global"]
  },
  "so-ham": {
    name: "So Hum",
    namePt: "So Hum",
    origin: "Sânscrito / Yoga",
    pronunciation: "So Hum",
    meaning: "Eu sou isso / Isso sou eu",
    translation: "Eu sou Aquele / A respiração do universo é meu ser",
    syllables: ["So", "Hum"],
    benefits: ["Auto-realização", "Unificação com o cosmos", "Respirační consciousness", "Meditação profunda"],
    practice: ["Repetir continuamente durante o dia", "Sincronizar com a respiração", "Meditar na identidade com o universo"]
  },
  "_seed": {
    name: "Bija Mantra",
    namePt: "Mantra Semente",
    origin: "Sânscrito / Tantra",
    pronunciation: "Lam Vam Ram Yam Ham",
    meaning: "Os sons raiz dos chakras",
    translation: "Os sons primordiais associados a cada chakra",
    syllables: ["Lam", "Vam", "Ram", "Yam", "Ham", "Om (ou silence)"],
    benefits: ["Activação dos chakras", "Equilíbrio energético", "Despertar kundalini", "Harmonização corporal"],
    practice: ["Repetir cada bija asociado a seu chakra", "Visualizar a cor do chakra", "Combinar com meditação guided"]
  },
  "hare-rama": {
    name: "Hare Rama Hare Krishna",
    namePt: "Hare Rama Hare Krishna",
    origin: "Gaudiya Vaishnavismo / Hindu",
    pronunciation: "Hare Rama Hare Krishna",
    meaning: "Ó Senhor, ó energia divina",
    translation: "Ó energia do Senhor, ó Senhor Rama, ó energia do Senhor, ó Senhor Krishna",
    syllables: ["Ha", "re", "Ra", "ma", "Ha", "re", "Krish", "na"],
    benefits: ["Libertação do apego material", "Devoção espiritual", "Purificação do coração", "Elevação da consciência"],
    practice: ["Japa mala de 108 contas", "Cantar em grupo (kirtan)", "Dançar devocionalmente"]
  },
  "nam-myoho-renge-kyo": {
    name: "Nam Myoho Renge Kyo",
    namePt: "Nam Myoho Renge Kyo",
    origin: "Nichiren Budismo / Japonês",
    pronunciation: "Nam mioho nenguechio",
    meaning: "Devoção à Lei Maravilhosa",
    translation: "Eu me inclino perante a Lei Maravilhosa do Sutra do Lótus",
    syllables: ["Nam", "Myo", "ho", "Ren", "ge", "Kyo"],
    benefits: ["Despertar da sabedoria interior", "Harmonização com a Lei cósmica", "Transformação de负面 em positivo", "Iluminação terreno"],
    practice: ["Repetir com sincerity e faith", "Visualizar o lótus florescendo", "Aplicar a desafios cotidianos"]
  },
  "allah-hu": {
    name: "Allah Hu",
    namePt: "Allah Hu",
    origin: "Sufismo / Islâmico",
    pronunciation: "Allah Hu",
    meaning: "Deus é Ele",
    translation: "Deus é; Deus é a Verdade; Ele é suficiente",
    syllables: ["Al", "lah", "Hu"],
    benefits: ["União com o Divino", "Paz interior profunda", "Dissolução do ego", "Realização da unidade"],
    practice: ["Repetir continuamente (dhikr)", "Meditar na presenção divina", "俗彩ar com coração puro"]
  },
  "om-namah-shivaya": {
    name: "Om Namah Shivaya",
    namePt: "Om Namah Shivaya",
    origin: "Sânscrito / Shaivismo",
    pronunciation: "Om namah shivaya",
    meaning: "Eu me inclino perante Shiva",
    translation: "Reverência a Shiva, a consciência pura",
    syllables: ["Om", "Na", "ma", "Shi", "va", "ya"],
    benefits: ["Purificação dos 5 elementos", "Transformação interior", "Devoção a Shiva", "Libertação do samsara"],
    practice: ["Repetir 108 vezes", "Visualizar Shiva em meditação", "Jejum em dias de lua cheia"]
  },
  "amin": {
    name: "Amin",
    namePt: "Amém",
    origin: "Semítico / Abraâmico",
    pronunciation: "Amin",
    meaning: "Assim seja / Verdadeiramente",
    translation: "Que assim seja; assim é a verdade",
    syllables: ["A", "min"],
    benefits: ["Confirmação de oração", "Conexão divina", "Intensão selada", "Abertura espiritual"],
    practice: ["Usar ao final de orações", "Combinar com gratidão", "Respirar profundamente após"]
  },
  "namaste": {
    name: "Namaste",
    namePt: "Namastê",
    origin: "Sânscrito / Hindu",
    pronunciation: "Namaste",
    meaning: "Eu saúdo em ti",
    translation: "A divindade em mim saúda a divindade em ti",
    syllables: ["Na", "ma", "ste"],
    benefits: ["Reconhecimento da divindade", "Harmonia interpessoal", "Ummidade", "Dissolução de barreiras"],
    practice: ["Oferecer com as mãos em prayer pose", "Inclinar a cabeça respetuosamente", "Manter olhar gentil"]
  },
  "shanti": {
    name: "Shanti",
    namePt: "Shanti",
    origin: "Sânscrito / Védico",
    pronunciation: "Shanti",
    meaning: "Paz",
    translation: "Paz, paz, paz (em todas as dimensões)",
    syllables: ["Shan", "ti"],
    benefits: ["Paz interior e exterior", "Harmonia universal", "Dissolução de conflitos", "Calma espiritual"],
    practice: ["Repetir três vezes por dimensão", "Associar com visualization de lumière blanche", "Enviar paz a inimigos"]
  },
  "om-shanti": {
    name: "Om Shanti",
    namePt: "Om Shanti",
    origin: "Sânscrito / Yoga",
    pronunciation: "Om shanti",
    meaning: "Paz eterna",
    translation: "A paz que transcende; a paz cósmica",
    syllables: ["Om", "Shan", "ti"],
    benefits: ["Paz trascendental", "Activação da consciência superior", "Sanctificação do espaço", "proteção energética"],
    practice: ["Entôar ao final de práticas", "Combinar com Om de 3 a 7 vezes", "Meditar na paz absoluta"]
  },
  " OM ": {
    name: "Om Aim Klim Sauh",
    namePt: "Mantra de Saraswati",
    origin: "Tântrico / Hindu",
    pronunciation: "Om aim klim sauh",
    meaning: "Saudação a Saraswati",
    translation: "Eu invoco a deusa do conhecimento e das artes",
    syllables: ["Om", "Aim", "Klim", "Sauh"],
    benefits: ["Conhecimento e sabedoria", "Criatividade amplificada", "Eloqüência", "Desbloqueio de aprêndizagem"],
    practice: ["Recitar antes de estudos", "Combinar com oferendas a Saraswati", "Visualizar energia azul"]
  }
};

export function getData(): MantraData {
  return mantras;
}

export default mantras;
