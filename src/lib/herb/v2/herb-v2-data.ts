// herb-v2-data.ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export interface HerbV2Properties {
  name: string;
  namePt: string;
  nameEn: string;
  scientificName: string;
  family: string;
  category: 'cleansing' | 'healing' | 'protection' | 'manifestation' | 'sacred';
  flavor: string[];
  planet: string;
  element: string;
  chakra: string[];
  uses: string[];
  properties: string[];
  ritualUses: string[];
  contraindications: string[];
  energySignature: string;
  meditationTechnique: string;
}

export interface HerbV2Data {
  [key: string]: HerbV2Properties;
}

const herbsV2: HerbV2Data = {
  "alecrim": {
    name: "Alecrim",
    namePt: "Alecrim",
    nameEn: "Rosemary",
    scientificName: "Salvia rosmarinus",
    family: "Lamiaceae",
    category: "protection",
    flavor: ["pungent", "bitter", "woody"],
    planet: "Sol",
    element: "Fogo",
    chakra: ["coroa", "terceiro olho"],
    uses: ["mental clarity", "memory enhancement", "respiratory support"],
    properties: ["antioxidant", "anti-inflammatory", "antimicrobial"],
    ritualUses: ["purificação de espaços", "proteção contra energias negativas", "limpeza aurica", "amarrar com fita vermelha para proteção"],
    contraindications: ["gravidez", "epilepsia", "hipertensão"],
    energySignature: "Yang, quente e seco - eleva a consciência e dissipa energias densas",
    meditationTechnique: "Inalar o aroma durante meditação focalizada; visualizar luz dourada emanando da planta"
  },
  "manjericão": {
    name: "Manjericão",
    namePt: "Manjericão",
    nameEn: "Basil",
    scientificName: "Ocimum basilicum",
    family: "Lamiaceae",
    category: "sacred",
    flavor: ["sweet", "pungent", "clove-like"],
    planet: "Vênus",
    element: "Fogo",
    chakra: ["cardíaco", "coroa"],
    uses: ["stress relief", "anxiety reduction", "digestive support"],
    properties: ["adaptogen", "antioxidant", "anti-anxiety"],
    ritualUses: ["proteção sagrada de lares", "harmonização de relacionamentos", "abertura de portais rituais", "consagração de altares"],
    contraindications: ["uso excessivo pode irritar"],
    energySignature: "Yang luminoso - expande o coração e abre channels de comunicação divina",
    meditationTechnique: "Colocar folhas no altar; meditar com foco no coração; visualizar uma barreira luminosa"
  },
  "lavanda": {
    name: "Lavanda",
    namePt: "Lavanda",
    nameEn: "Lavender",
    scientificName: "Lavandula angustifolia",
    family: "Lamiaceae",
    category: "cleansing",
    flavor: ["floral", "sweet", "herbaceous"],
    planet: "Mercury",
    element: "Água",
    chakra: ["terceiro olho", "cardíaco"],
    uses: ["calming", "sleep support", "anxiety relief"],
    properties: ["calming", "sedative", "nervine"],
    ritualUses: ["banhos de limpeza energética", "sonhos protetores", "amaciamento de ambientes densos", "purificação before ritual"],
    contraindications: ["alergia a óleos essenciais", "uso tópico direto"],
    energySignature: "Yin fresco - acalma, suaviza e dissolve bloqueios emocionais acumados",
    meditationTechnique: " Aplicar óleo de lavanda nas têmporas; meditar em silêncio; deixar a mente derivar suavemente"
  },
  "sálvia": {
    name: "Sálvia",
    namePt: "Sálvia",
    nameEn: "Sage",
    scientificName: "Salvia officinalis",
    family: "Lamiaceae",
    category: "cleansing",
    flavor: ["earthy", "pungent", "bitter"],
    planet: "Júpiter",
    element: "Fogo/Ar",
    chakra: ["coroa", "garganta"],
    uses: ["smudging", "purification", "cognitive function"],
    properties: ["antimicrobial", "antioxidant", "cognitive enhancer"],
    ritualUses: ["defumação de espaços", "limpeza de ferramentas rituais", "rituals de passagem", "abertura de círculos sagrados"],
    contraindications: ["epilepsia", "renal conditions"],
    energySignature: "Yang seco - queima negative energies; poderosa para banimentos e purificação profunda",
    meditationTechnique: "Queimar sálvia seca; respirar a fumaça com intenção clara; visualizar a fumaça carregando negatividades"
  },
  "camomila": {
    name: "Camomila",
    namePt: "Camomila",
    nameEn: "Chamomile",
    scientificName: "Matricaria chamomilla",
    family: "Asteraceae",
    category: "healing",
    flavor: ["sweet", "apple-like", "soothing"],
    planet: "Sol",
    element: "Água",
    chakra: ["coração", "terceiro olho"],
    uses: ["sleep induction", "digestive calm", "skin healing"],
    properties: ["calming", "anti-inflammatory", "mild sedative"],
    ritualUses: ["chás para meditação tranquila", "banhos para paz interior", "amaciamento de ambientes conflituados"],
    contraindications: ["alergia a margaridas", "anticoagulantes"],
    energySignature: "Yin suave - traz paz, serenidade e restauração after perdas emocionais",
    meditationTechnique: "Preparar chá antes de meditar; beber lentamente visualizing calm flowing through body"
  },
  "hortelã": {
    name: "Hortelã",
    namePt: "Hortelã",
    nameEn: "Mint",
    scientificName: "Mentha spp.",
    family: "Lamiaceae",
    category: "cleansing",
    flavor: ["cool", "sweet", "peppery"],
    planet: "Vênus",
    element: "Água",
    chakra: ["garganta", "terceiro olho"],
    uses: ["digestive aid", "mental clarity", "respiratory support"],
    properties: ["carminative", "stimulant", "antispasmodic"],
    ritualUses: ["clareza mental para divinação", "abertura de comunicação", "renovação after esgotamento"],
    contraindications: ["refluxo gástrico", "crianças pequenas"],
    energySignature: "Yang fresco - stimulant, clears mental fog e.refreshes energies estagnadas",
    meditationTechnique: "Mastigar folhas frescas durante prática; focar em clareza e processamento de informações"
  },
  "tomilho": {
    name: "Tomilho",
    namePt: "Tomilho",
    nameEn: "Thyme",
    scientificName: "Thymus vulgaris",
    family: "Lamiaceae",
    category: "protection",
    flavor: ["earthy", "pungent", "slightly bitter"],
    planet: "Marte",
    element: "Fogo",
    chakra: ["raiz", "baço"],
    uses: ["immune support", "respiratory health", "courage"],
    properties: ["antimicrobial", "antioxidant", "immunostimulant"],
    ritualUses: ["flechas de proteção pessoal", "aumento da coragem before rituals desafiadores", "purificação de espaços contaminados"],
    contraindications: ["gravidez", "pressão alta"],
    energySignature: "Yang ardente - fortifica, защищает and infunde bravery",
    meditationTechnique: "Carregar ramo seco no bolso; meditar sobre coragem e força interior; visualizar um escudo de fogo"
  },
  "orégano": {
    name: "Orégano",
    namePt: "Orégano",
    nameEn: "Oregano",
    scientificName: "Origanum vulgare",
    family: "Lamiaceae",
    category: "manifestation",
    flavor: ["pungent", "warm", "aromatic"],
    planet: "Marte",
    element: "Fogo",
    chakra: ["plexo solar", "garganta"],
    uses: ["abundance attraction", "prosperity", "creative force"],
    properties: ["antimicrobial", "antioxidant", "digestive stimulant"],
    ritualUses: ["rituals de abundância", "atrair prosperidade", "manifestar intenções", "desbloquear creatividad"],
    contraindications: ["gravidez", "alergias"],
    energySignature: "Yang vibrante - catalyst for manifestation, ativa o fogo criativo interior",
    meditationTechnique: "Colocar próximo a velas durante estudos de visualizations; afirmaciones enquanto segura ramos"
  },
  "lavanda-verdadeira": {
    name: "Lavanda Verde",
    namePt: "Alfazema",
    nameEn: "True Lavender",
    scientificName: "Lavandula angustifolia",
    family: "Lamiaceae",
    category: "healing",
    flavor: ["floral", "cool", "calming"],
    planet: "Mercury",
    element: "Água",
    chakra: ["terceiro olho", "cardíaco", "coroa"],
    uses: ["emotional healing", "deep relaxation", "spiritual connection"],
    properties: ["nervine", "calming", "harmonizing"],
    ritualUses: ["cura emocional profunda", "reconexão espiritual", "integração de experiências de vida"],
    contraindications: ["sensibilidade a perfumes"],
    energySignature: "Yin harmonizador - une head com heart; facilita a reconciliação de opostos",
    meditationTechnique: "oleum no terceiro olho; meditar sobre integração de aspectros fragmentados da alma"
  },
  "artemísia": {
    name: "Artemísia",
    namePt: "Artemísia",
    nameEn: "Mugwort",
    scientificName: "Artemisia vulgaris",
    family: "Asteraceae",
    category: "sacred",
    flavor: ["bitter", "pungent", "earthy"],
    planet: "Lua",
    element: "Água",
    chakra: ["terceiro olho", "coroa"],
    uses: ["dream enhancement", "intuition", "menstrual support"],
    properties: ["nervine", "emmenagogue", "bitter tonic"],
    ritualUses: ["amplificação de sonhos proféticos", "proteção de viandas", "adivinhação", "rituals lunitas"],
    contraindications: ["gravidez", "epilepsia"],
    energySignature: "Yin lunar - conecta with the unconscious, amplifica visões e sonhos",
    meditationTechnique: "Colocar under travesseiro para sonhos lúcidos; queimar antes de práticas divinatórias; chá para sadboxes"
  },
  "verbena": {
    name: "Verbena",
    namePt: "Verbena",
    nameEn: "Vervain",
    scientificName: "Verbena officinalis",
    family: "Verbenaceae",
    category: "sacred",
    flavor: ["bitter", "astringent"],
    planet: "Vênus",
    element: "Água",
    chakra: ["cardíaco", "coroa"],
    uses: ["spiritual purification", "protection", "fertility"],
    properties: ["nervine", "antispasmodic", "galactagogue"],
    ritualUses: ["consagração de altares", "rituals de fertilidade", "purificação de espacios sagrados", "proteção decasas"],
    contraindications: ["evitar durante gravidez"],
    energySignature: "Yang luminoso - eleva qualquer espaço a um estado de graça",
    meditationTechnique: "Criar água de verbena; borrifar no espaço de meditação; visualizar proteção dourada"
  },
  "misplaced": {
    name: "Erva-cidreira",
    namePt: "Melissa",
    nameEn: "Lemon Balm",
    scientificName: "Melissa officinalis",
    family: "Lamiaceae",
    category: "healing",
    flavor: ["lemon", "sweet", "soothing"],
    planet: "Lua",
    element: "Água",
    chakra: ["cardíaco", "terceiro olho"],
    uses: ["stress reduction", "joy restoration", "sleep support"],
    properties: ["antidepressant", "antivíral", "calming"],
    ritualUses: ["cura de corações partidos", "restauração da alegria", "proteção emocional soft", "harmonización del hogar"],
    contraindications: ["hipotensão", "glândula tiróide"],
    energySignature: "Yin luminoso - alegria suave; dissolve melancolia e atrae felicidad",
    meditationTechnique: "Preparar infusión antes de meditar; visualizar light amarela preenchendo espaços vazios do coração"
  },
  "zimbro": {
    name: "Zimbro",
    namePt: "Junípero",
    nameEn: "Juniper",
    scientificName: "Juniperus communis",
    family: "Cupressaceae",
    category: "protection",
    flavor: ["piney", "sharp", "bitter"],
    planet: "Marte",
    element: "Fogo",
    chakra: ["raiz", "plexo solar"],
    uses: ["purification", "protection", "grounding"],
    properties: ["antimicrobial", "diuretic", "warming"],
    ritualUses: ["fumação de proteção", "limpieza de energías oscuras", "rituals de renacimiento", "despedidas"],
    contraindications: ["rim disease", "gravidez"],
    energySignature: "Yang cortante - dissipa negativity instantly; excelente para banimento e proteção strong",
    meditationTechnique: "Queimar bagas ou galhos; respirar fumaça purificadora; construir visualizing alrededor de si"
  },
  "boldo": {
    name: "Boldo",
    namePt: "Boldo",
    nameEn: "Boldo",
    scientificName: "Peumus boldus",
    family: "Monimiaceae",
    category: "healing",
    flavor: ["bitter", "penetrating", "camphoraceous"],
    planet: "Marte",
    element: "Fogo",
    chakra: ["fígado", "plexo solar"],
    uses: ["liver detoxification", "digestive support", "gallbladder function"],
    properties: ["hepatoprotective", "digestive stimulant", "choleretic"],
    ritualUses: ["desintoxicação after rituals intensos", "liberação de traumas存储", "purificação de energias pesadas"],
    contraindications: ["obstrução biliar", "doença hepática grave"],
    energySignature: "Yang quente - pembersih; dissipa energias densas acumuladas no fígado emocional",
    meditationTechnique: "Chá antes de meditar em tempos difíceis; visualizar organs luminosos sendo limpa"
  },
  "ipê-roxo": {
    name: "Ipê-roxo",
    namePt: "Ipê roxo",
    nameEn: "Purple Lapacho",
    scientificName: "Handroanthus impetiginosus",
    family: "Bignoniaceae",
    category: "sacred",
    flavor: ["bitter", "earthy", "medicinal"],
    planet: "Saturno",
    element: "Terra",
    chakra: ["raiz", "cardíaco"],
    uses: ["immune strength", "inflammation reduction", "spiritual grounding"],
    properties: ["antimicrobial", "anti-inflammatory", "immune modulator"],
    ritualUses: ["ancoramento espiritual profundo", "rituals de transformação", "proteção ancestral", "cura de feridas da alma"],
    contraindications: ["anticoagulantes", "cirurgia imminent"],
    energySignature: "Yang terroso - fuertemente anionizante; conecta com sabedoria antiga da terra",
    meditationTechnique: "Trabalhar com a madeira; visualizar raízes se aprofundando na terra mother; silêncio meditativo"
  }
};

export function getData(): HerbV2Data {
  return herbsV2;
}

export default herbsV2;
