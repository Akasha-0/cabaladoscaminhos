/**
 * Deep Correlation Engine - Cross-System Spiritual Correlations
 * Based on IDEIA.md - Complete unified correlation matrix
 */

export type CorrelationType =
  | 'day-orixa' | 'day-chakra' | 'day-planet'
  | 'planet-orixa' | 'planet-chakra'
  | 'odu-orixa' | 'odu-element'
  | 'orixa-colors' | 'orixa-day' | 'orixa-chakra' | 'orixa-herbs'
  | 'chakra-element' | 'chakra-planet'
  | 'tarot-deck' | 'solfeggio-chakra'
  | 'numerology-odú';

export type StrengthLevel = 'weak' | 'medium' | 'strong' | 'perfect';

export interface CorrelationResult {
  source: string;
  target: string;
  type: CorrelationType;
  score: number;
  description: string;
  strength: StrengthLevel;
}

export interface DayCorrelations {
  dia: string;
  chakras: string[];
  planetas: string[];
  orixas: string[];
  sephirot: string[];
  arcanos: string[];
  faseLua: string;
  oduRegentes: string[];
  cores: string[];
  mistério: string;
}

export interface OrixaCorrelations {
  orixa: string;
  dia: string;
  chakras: string[];
  planetas: string[];
  cores: string[];
  ervas: string[];
  quizilas: string[];
  saudacao: string;
  sephirah: string[];
  mistério: string;
}

export interface OduCorrelations {
  odu: string;
  numero: number;
  significado: string;
  elementos: string[];
  orixas: string[];
  quizilas: string[];
  preceptos: string[];
  ebó: string;
}

export interface SpiritualProfileInput {
  birthDate?: string;
  dayOfBirth?: number;
  monthOfBirth?: number;
  yearOfBirth?: number;
  lifePathNumber?: number;
  oduBirth?: number;
  oduName?: string;
  sunSign?: string;
  dominantOrixa?: string;
  dominantChakra?: string;
  dominantPlanet?: string;
}

export interface ConvergenceResult {
  overallScore: number;
  strength: StrengthLevel;
  breakdown: { type: string; score: number; description: string }[];
  patterns: string[];
  dominantAxis: string;
  warnings: string[];
  recommendations: string[];
}

export interface CorrelationMatrix {
  systems: string[];
  matrix: number[][];
  labels: string[];
}

// Day Portal Data
const DAY_PORTAL_DATA: Record<string, DayCorrelations> = {
  "segunda-feira": { dia: "Segunda-feira", chakras: ["1º Básico", "6º Frontal"], planetas: ["Lua", "Saturno"], orixas: ["Omolu", "Exu"], sephirot: ["Malkuth", "Yesod"], arcanos: ["A Sacerdotisa", "O Mundo"], faseLua: "Lua Minguante / Nova", oduRegentes: ["Okaran (1)", "Obará (6)"], cores: ["Vermelho", "Branco", "Preto"], mistério: "Dia de aterramento, limpeza espiritual, transmutação." },
  "terça-feira": { dia: "Terça-feira", chakras: ["2º Sacro"], planetas: ["Marte", "Plutão"], orixas: ["Iansã", "Ogum"], sephirot: ["Geburah"], arcanos: ["A Torre", "O Carro"], faseLua: "Lua Nova / Crescente", oduRegentes: ["Odi (7)", "Ejilsebora (12)"], cores: ["Laranja", "Vermelho"], mistério: "Dia de força, movimento, coragem." },
  "quarta-feira": { dia: "Quarta-feira", chakras: ["3º Plexo Solar"], planetas: ["Mercúrio"], orixas: ["Xangô", "Iansã"], sephirot: ["Hod"], arcanos: ["O Mago", "O Eremita"], faseLua: "Lua Crescente", oduRegentes: ["Obará (6)", "Ejilsebora (12)"], cores: ["Amarelo"], mistério: "Dia da justiça divina, estudos, verdade." },
  "quinta-feira": { dia: "Quinta-feira", chakras: ["4º Cardíaco"], planetas: ["Júpiter"], orixas: ["Oxóssi"], sephirot: ["Chesed"], arcanos: ["O Hierofante"], faseLua: "Lua Crescente / Cheia", oduRegentes: ["Irosun (4)", "Oxé (5)"], cores: ["Verde"], mistério: "Dia da fartura, conhecimento, expansão." },
  "sexta-feira": { dia: "Sexta-feira", chakras: ["7º Coronário"], planetas: ["Vênus"], orixas: ["Oxalá"], sephirot: ["Kether"], arcanos: ["O Imperador", "O Louco"], faseLua: "Lua Cheia", oduRegentes: ["EjiOníle (8)", "Alafia (16)"], cores: ["Branco", "Violeta"], mistério: "Dia da paz, pureza, conexão divina." },
  "sábado": { dia: "Sábado", chakras: ["4º Cardíaco", "6º Frontal"], planetas: ["Saturno", "Urano"], orixas: ["Oxum", "Iemanjá"], sephirot: ["Binah", "Tiphereth"], arcanos: ["A Imperatriz", "A Estrela"], faseLua: "Lua Cheia", oduRegentes: ["Oxé (5)", "Ossá (9)"], cores: ["Rosa", "Azul Escuro"], mistério: "Dia das Grandes Mães, amor, intuição." },
  "domingo": { dia: "Domingo", chakras: ["3º Plexo Solar"], planetas: ["Sol"], orixas: ["Xangô"], sephirot: ["Tiphereth"], arcanos: ["O Sol"], faseLua: "Lua Cheia / Crescente", oduRegentes: ["Obará (6)", "EjiOníle (8)"], cores: ["Amarelo", "Dourado"], mistério: "Dia de recarregar energia vital." }
};

// Orixá Data
const ORIXA_DATA: Record<string, OrixaCorrelations> = {
  "Oxalá": { orixa: "Oxalá", dia: "Sexta-feira", chakras: ["7º Coronário"], planetas: ["Sol", "Júpiter"], cores: ["Branco", "Marfim", "Opala"], ervas: ["Boldo", "Saião", "Manjericão Branco", "Algodoeiro", "Colônia"], quizilas: ["Bebidas alcoólicas", "Azeite de dendê", "Sal", "Roupas escuras"], saudacao: "Epà Babá!", sephirah: ["Kether"], mistério: "Fé, paz, pureza, equilíbrio espiritual." },
  "Iemanjá": { orixa: "Iemanjá", dia: "Sábado", chakras: ["6º Frontal"], planetas: ["Lua", "Netuno"], cores: ["Azul Escuro", "Branco", "Transparente"], ervas: ["Colônia", "Alcaparra"], quizilas: ["Poeira", "Lama", "Caranguejo", "Carne de porco"], saudacao: "Odoyá!", sephirah: ["Binah", "Tiphereth"], mistério: "Maternidade, geração, equilíbrio mental." },
  "Oxum": { orixa: "Oxum", dia: "Sábado", chakras: ["4º Cardíaco"], planetas: ["Vênus"], cores: ["Rosa", "Amarelo-ouro", "Azul-celeste"], ervas: ["Erva-doce", "Calêndula", "Camomila"], quizilas: ["Ovos", "Abóbora", "Caranguejo"], saudacao: "Ora Yê Yê Ô!", sephirah: ["Tiphereth"], mistério: "Amor incondicional, doçura, ouro." },
  "Ogum": { orixa: "Ogum", dia: "Terça-feira", chakras: ["5º Laríngeo"], planetas: ["Marte"], cores: ["Azul Claro", "Vermelho", "Verde"], ervas: ["Espada-de-são-jorge", "Quebra-demanda", "Guiné"], quizilas: ["Quiabo", "Galo", "Mentira", "Traição"], saudacao: "Patakori Ogum! / Ogunhê!", sephirah: ["Geburah"], mistério: "Lei, ordenação, caminhos abertos." },
  "Oxóssi": { orixa: "Oxóssi", dia: "Quinta-feira", chakras: ["4º Cardíaco"], planetas: ["Júpiter"], cores: ["Verde", "Azul-turquesa"], ervas: ["Guiné", "Alecrim", "Samambaia"], quizilas: ["Carne de caça", "Mel"], saudacao: "Okê Arô!", sephirah: ["Chesed"], mistério: "Fartura, conhecimento, busca." },
  "Xangô": { orixa: "Xangô", dia: "Quarta-feira / Domingo", chakras: ["3º Plexo Solar"], planetas: ["Sol"], cores: ["Amarelo", "Marrom", "Vermelho", "Branco"], ervas: ["Quebra-pedra", "Erva-de-são-joão"], quizilas: ["Abóbora", "Caranguejo", "Injustiça"], saudacao: "Kaô Kabecilé!", sephirah: ["Hod", "Tiphereth"], mistério: "Justiça divina, razão, firmeza." },
  "Iansã": { orixa: "Iansã", dia: "Terça-feira / Quarta-feira", chakras: ["2º Sacro"], planetas: ["Urano", "Plutão"], cores: ["Laranja", "Amarelo", "Vermelho", "Coral"], ervas: ["Pinhão Roxo", "Espada-de-santa-bárbara"], quizilas: ["Abóbora", "Carne de carneiro"], saudacao: "Eparrei Iansã! / Eparrei Oyá!", sephirah: ["Geburah", "Hod"], mistério: "Movimento, transformação, ventos." },
  "Omolu": { orixa: "Omolu", dia: "Segunda-feira", chakras: ["1º Básico"], planetas: ["Saturno"], cores: ["Preto e Branco", "Vermelho e Preto", "Violeta"], ervas: ["Canela-de-velho", "Assa-peixe"], quizilas: ["Carne de porco", "Pipoca queimada"], saudacao: "Atotô!", sephirah: ["Malkuth"], mistério: "Cura física, transmutação, terra." },
  "Nanã": { orixa: "Nanã", dia: "Terça-feira / Sábado", chakras: ["1º Básico"], planetas: ["Saturno", "Lua"], cores: ["Lilás", "Roxo", "Azul-violeta"], ervas: ["Manjericão Roxo", "Assa-peixe"], quizilas: ["Objetos de metal cortantes", "Velocidade excessiva"], saudacao: "Saluba Nanã!", sephirah: ["Malkuth", "Yesod"], mistério: "Sabedoria ancestral, paciência." },
  "Oxumaré": { orixa: "Oxumaré", dia: "Terça-feira", chakras: ["2º Sacro"], planetas: ["Mercúrio", "Vênus"], cores: ["Arco-íris", "Amarelo", "Verde"], ervas: ["Dinheiro-em-penca"], quizilas: ["Monotonia", "Ingratidão"], saudacao: "Arroboboi Oxumaré!", sephirah: ["Hod"], mistério: "Ciclos, renovação, dualidade." },
  "Exu": { orixa: "Exu", dia: "Segunda-feira", chakras: ["1º Básico"], planetas: ["Plutão"], cores: ["Preto e Vermelho", "Preto"], ervas: ["Pinhão Roxo", "Arruda", "Guiné"], quizilas: ["Sal puro", "Água fria sobre firmeza"], saudacao: "Laroyé Exu! / Exu Mojubá!", sephirah: ["Malkuth"], mistério: "Comunicação, dinamismo, início de tudo." }
};

// Odú Data
const ODÚ_DATA: Record<string, OduCorrelations> = {
  "Okaran": { odu: "Okaran", numero: 1, significado: "O começo, a dúvida.", elementos: ["Terra", "Fogo"], orixas: ["Exu", "Omolu"], quizilas: ["Carne de porco", "Cachaça em excesso"], preceptos: ["Cultivar a paciência"], ebó: "Despachos em encruzilhadas." },
  "Ejiokô": { odu: "Ejiokô", numero: 2, significado: "A dualidade.", elementos: ["Ar", "Terra"], orixas: ["Ibeji", "Ogum"], quizilas: ["Comer ovos", "Rã"], preceptos: ["Manter a alegria interna"], ebó: "Doces, frutas." },
  "Etaogundá": { odu: "Etaogundá", numero: 3, significado: "A revolta.", elementos: ["Fogo", "Terra"], orixas: ["Ogum", "Obaluaê"], quizilas: ["Usar facas sem necessidade"], preceptos: ["Evitar brigas"], ebó: "Inhames assados." },
  "Irosun": { odu: "Irosun", numero: 4, significado: "O aviso.", elementos: ["Fogo", "Terra"], orixas: ["Iemanjá", "Oxóssi", "Egum"], quizilas: ["Olhar para buracos vazios"], preceptos: ["Desenvolver a intuição"], ebó: "Alimentos brancos." },
  "Oxé": { odu: "Oxé", numero: 5, significado: "O ouro.", elementos: ["Água"], orixas: ["Oxum", "Logun Edé"], quizilas: ["Comer ovos"], preceptos: ["Cuidar da autoestima"], ebó: "Banhos de mel." },
  "Obará": { odu: "Obará", numero: 6, significado: "A riqueza.", elementos: ["Ar", "Fogo"], orixas: ["Xangô", "Oxóssi", "Logun Edé"], quizilas: ["Inveja", "Abóbora"], preceptos: ["Ser generoso"], ebó: "Seis tipos de frutas." },
  "Odi": { odu: "Odi", numero: 7, significado: "A teimosia.", elementos: ["Terra", "Água"], orixas: ["Omolu", "Oxumaré", "Exu"], quizilas: ["Dormir no escuro"], preceptos: ["Praticar o desapego"], ebó: "Pipoca para Omolu." },
  "EjiOníle": { odu: "EjiOníle", numero: 8, significado: "A cabeça.", elementos: ["Ar", "Água"], orixas: ["Oxalá", "Jagun"], quizilas: ["Roupas pretas"], preceptos: ["Cuidar do Ori"], ebó: "Canjica branca." },
  "Ossá": { odu: "Ossá", numero: 9, significado: "O vento.", elementos: ["Ar", "Água"], orixas: ["Iansã", "Iemanjá"], quizilas: ["Espalhar fofocas"], preceptos: ["Respeitar o poder feminino"], ebó: "Sacudimentos." },
  "Ofun": { odu: "Ofun", numero: 10, significado: "O mistério.", elementos: ["Ar", "Água"], orixas: ["Oxalá", "Obá"], quizilas: ["Roupas pretas"], preceptos: ["Vestir-se de branco"], ebó: "Frutas brancas." },
  "Owarin": { odu: "Owarin", numero: 11, significado: "A pressa.", elementos: ["Fogo", "Ar"], orixas: ["Iansã", "Exu", "Ogum"], quizilas: ["Procrastinar"], preceptos: ["Organizar a mente"], ebó: "Rodar chaves." },
  "Ejilsebora": { odu: "Ejilsebora", numero: 12, significado: "A justiça.", elementos: ["Fogo"], orixas: ["Xangô", "Obá"], quizilas: ["Praticar a injustiça"], preceptos: ["Manter a integridade"], ebó: "Pedras de raio." },
  "Olobón": { odu: "Olobón", numero: 13, significado: "A doença.", elementos: ["Terra", "Água"], orixas: ["Nanã", "Omolu"], quizilas: ["Ambientes sujos"], preceptos: ["Respeitar o tempo"], ebó: "Ebó na lama." },
  "Iká": { odu: "Iká", numero: 14, significado: "A traição.", elementos: ["Água", "Terra"], orixas: ["Oxumaré", "Ossain"], quizilas: ["Falsidade"], preceptos: ["Manter a discrição"], ebó: "Fitas coloridas." },
  "Ogbogbé": { odu: "Ogbogbé", numero: 15, significado: "A feitiçaria.", elementos: ["Fogo", "Terra"], orixas: ["Obá", "Ewá", "Ogum"], quizilas: ["Invejar o espaço alheio"], preceptos: ["Buscar a paz no lar"], ebó: "Acarajés." },
  "Alafia": { odu: "Alafia", numero: 16, significado: "A paz absoluta.", elementos: ["Ar", "Luz"], orixas: ["Orunmilá", "Oxalá"], quizilas: ["Duvidar da espiritualidade"], preceptos: ["Manter as práticas"], ebó: "Flores brancas." }
};

// Solfeggio Chakra Map
const SOLFEGGIO_CHAKRA_MAP: Record<string, { chakra: string; frequency: string; elemento: string }> = {
  "963Hz": { chakra: "7º Coronário", frequency: "963Hz", elemento: "Éter" },
  "852Hz": { chakra: "6º Frontal", frequency: "852Hz", elemento: "Éter/Ar" },
  "741Hz": { chakra: "5º Laríngeo", frequency: "741Hz", elemento: "Ar" },
  "639Hz": { chakra: "4º Cardíaco", frequency: "639Hz", elemento: "Ar/Água" },
  "528Hz": { chakra: "3º Plexo Solar", frequency: "528Hz", elemento: "Fogo" },
  "417Hz": { chakra: "2º Sacro", frequency: "417Hz", elemento: "Água" },
  "396Hz": { chakra: "1º Básico", frequency: "396Hz", elemento: "Terra" }
};

// Numerology Odú Map
const NUMEROLOGY_ODU_MAP: Record<number, { odu: string; numero: number; arcano: string; sephirahVector: string }> = {
  1: { odu: "Okaran", numero: 1, arcano: "O Mago / O Louco", sephirahVector: "Kether para Chokmah" },
  2: { odu: "Ejiokô", numero: 2, arcano: "A Sacerdotisa", sephirahVector: "Chokmah para Binah" },
  3: { odu: "Etaogundá", numero: 3, arcano: "A Imperatriz", sephirahVector: "Binah para Chesed" },
  4: { odu: "Irosun", numero: 4, arcano: "O Imperador", sephirahVector: "Chesed para Geburah" },
  5: { odu: "Oxé", numero: 5, arcano: "O Hierofante", sephirahVector: "Geburah para Tiphereth" },
  6: { odu: "Obará", numero: 6, arcano: "Os Enamorados", sephirahVector: "Tiphereth para Netzach" },
  7: { odu: "Odi", numero: 7, arcano: "O Carro", sephirahVector: "Tiphereth para Hod" },
  8: { odu: "EjiOníle", numero: 8, arcano: "A Justiça / A Força", sephirahVector: "Hod para Yesod" },
  9: { odu: "Ossá", numero: 9, arcano: "O Eremita", sephirahVector: "Yesod para Malkuth" },
  10: { odu: "Ofun", numero: 10, arcano: "A Roda da Fortuna", sephirahVector: "Malkuth" },
  11: { odu: "Alafia", numero: 16, arcano: "A Força / O Pendurado", sephirahVector: "Alinhamento Completo" }
};

// Lenormand Critical Houses
const LENORMAND_CRITICAL_HOUSES: Record<number, { carta: string; significado: string; area: string }> = {
  24: { carta: "O Coração", significado: "Amor, paixão", area: "Amor" },
  34: { carta: "Os Peixes", significado: "Dinheiro, fluxo financeiro", area: "Dinheiro" },
  14: { carta: "A Raposa", significado: "Trabalho, estratégia", area: "Trabalho" },
  5: { carta: "A Árvore", significado: "Saúde", area: "Saúde" },
  8: { carta: "O Caixão", significado: "Transformação", area: "Transformação" },
  13: { carta: "A Criança", significado: "Novos projetos", area: "Novos Projetos" },
  16: { carta: "A Estrela", significado: "Destino", area: "Destino" },
  33: { carta: "A Chave", significado: "Resultado final", area: "Resultado Final" }
};

// Chakra Planet Map
const CHAKRA_PLANET_MAP: Record<string, string[]> = {
  "1º Básico": ["Saturno"], "2º Sacro": ["Marte", "Plutão", "Mercúrio", "Vênus"],
  "3º Plexo Solar": ["Sol", "Mercúrio"], "4º Cardíaco": ["Vênus", "Júpiter"],
  "5º Laríngeo": ["Marte", "Mercúrio"], "6º Frontal": ["Lua", "Netuno"],
  "7º Coronário": ["Sol", "Júpiter"]
};

// Element Hierarchy
const ELEMENT_HIERARCHY: Record<string, Record<string, number>> = {
  "Terra": { "Terra": 100, "Água": 60, "Fogo": 40, "Ar": 50 },
  "Água": { "Terra": 60, "Água": 100, "Fogo": 40, "Ar": 70 },
  "Fogo": { "Terra": 40, "Água": 40, "Fogo": 100, "Ar": 70 },
  "Ar": { "Terra": 50, "Água": 70, "Fogo": 70, "Ar": 100 }
};

// Correlation Weights
const CORRELATION_WEIGHTS: Record<CorrelationType, number> = {
  'day-orixa': 1.0, 'day-chakra': 1.0, 'day-planet': 0.8,
  'planet-orixa': 1.2, 'planet-chakra': 1.1,
  'odu-orixa': 1.5, 'odu-element': 1.3,
  'orixa-colors': 0.8, 'orixa-day': 0.9, 'orixa-chakra': 1.4, 'orixa-herbs': 0.7,
  'chakra-element': 1.2, 'chakra-planet': 1.1,
  'tarot-deck': 0.9, 'solfeggio-chakra': 1.0, 'numerology-odú': 1.2
};

// Helper Functions
function normalizeDay(day: string): string {
  const dayLower = day.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const dayMap: Record<string, string> = {
    "segunda": "segunda-feira", "terca": "terça-feira", "terca-feira": "terça-feira", "quarta": "quarta-feira",
    "quinta": "quinta-feira", "sexta": "sexta-feira", "sabado": "sábado", "domingo": "domingo",
    "monday": "segunda-feira", "tuesday": "terça-feira", "wednesday": "quarta-feira",
    "thursday": "quinta-feira", "friday": "sexta-feira", "saturday": "sábado", "sunday": "domingo"
  };
  return dayMap[dayLower] || dayLower;
}

function normalizeOrixa(orixa: string): string {
  const orixaLower = orixa.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const orixaMap: Record<string, string> = {
    "oxala": "Oxalá", "iemanjá": "Iemanjá", "oxum": "Oxum", "ogum": "Ogum",
    "oxossi": "Oxóssi", "xangô": "Xangô", "iansã": "Iansã", "omolu": "Omolu",
    "nanã": "Nanã", "oxumaré": "Oxumaré", "exu": "Exu"
  };
  return orixaMap[orixaLower] || orixa;
}

function normalizeOdu(odu: string): string {
  const oduLower = odu.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const oduMap: Record<string, string> = {
    "okaran": "Okaran", "ejiokô": "Ejiokô", "etaogundá": "Etaogundá", "irosun": "Irosun",
    "oxé": "Oxé", "obará": "Obará", "odi": "Odi", "ejioníle": "EjiOníle",
    "ossá": "Ossá", "ofun": "Ofun", "owarin": "Owarin", "ejilsebora": "Ejilsebora",
    "olobón": "Olobón", "iká": "Iká", "ogbogbé": "Ogbogbé", "alafia": "Alafia"
  };
  return oduMap[oduLower] || odu;
}

function getStrengthFromScore(score: number): StrengthLevel {
  if (score >= 90) return 'perfect';
  if (score >= 70) return 'strong';
  if (score >= 50) return 'medium';
  return 'weak';
}

function calculateElementScore(el1: string, el2: string): number {
  const e1 = el1.split('/')[0].trim();
  const e2 = el2.split('/')[0].trim();
  return ELEMENT_HIERARCHY[e1]?.[e2] ?? 50;
}

// Main Functions
export function correlate(a: string, b: string): CorrelationResult[] {
  const results: CorrelationResult[] = [];
  const aNorm = normalizeOrixa(a) || normalizeOdu(a) || a;
  const bNorm = normalizeOrixa(b) || normalizeOdu(b) || b;

  for (const [odu, data] of Object.entries(ODÚ_DATA)) {
    if ((normalizeOdu(a) === odu || normalizeOdu(b) === odu)) {
      const other = normalizeOdu(a) === odu ? bNorm : aNorm;
      if (data.orixas.some(o => normalizeOrixa(o) === normalizeOrixa(other))) {
        results.push({
          source: a, target: b, type: 'odu-orixa', score: 100,
          description: `${odu} está associado a ${data.orixas.join(' e ')}`,
          strength: 'perfect'
        });
      }
    }
  }
  return results;
}

export function getDayCorrelations(dia: string): DayCorrelations | null {
  return DAY_PORTAL_DATA[normalizeDay(dia)] || null;
}

export function getOrixaCorrelations(orixa: string): OrixaCorrelations | null {
  return ORIXA_DATA[normalizeOrixa(orixa)] || null;
}

export function getOduCorrelations(odu: string | number): OduCorrelations | null {
  if (typeof odu === 'number') {
    for (const data of Object.values(ODÚ_DATA)) {
      if (data.numero === odu) return data;
    }
    return null;
  }
  return ODÚ_DATA[normalizeOdu(odu)] || null;
}

export function getSolfeggioChakra(frequency: string): { chakra: string; frequency: string; elemento: string } | null {
  const freq = frequency.replace('Hz', '') + 'Hz';
  return SOLFEGGIO_CHAKRA_MAP[freq] || null;
}

export function getNumerologyOdu(numero: number): { odu: string; numero: number; arcano: string; sephirahVector: string } | null {
  return NUMEROLOGY_ODU_MAP[numero] || null;
}

export function calculateScore(a: string, b: string): number {
  const aNorm = a.split('/')[0].trim().toLowerCase();
  const bNorm = b.split('/')[0].trim().toLowerCase();
  if (aNorm === bNorm) return 100;
  if ((aNorm === 'fogo' && bNorm === 'água') || (aNorm === 'água' && bNorm === 'fogo')) return 40;
  return calculateElementScore(a, b);
}

export function calculateConvergence(profile: SpiritualProfileInput): ConvergenceResult {
  const breakdown: ConvergenceResult['breakdown'] = [];
  const patterns: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let totalScore = 0;
  let weightSum = 0;

  if (profile.lifePathNumber) {
    const numerologyData = getNumerologyOdu(profile.lifePathNumber);
    if (numerologyData) {
      if (profile.oduBirth && (profile.oduBirth === numerologyData.numero || 
          (profile.lifePathNumber === 11 && profile.oduBirth === 16))) {
        const score = 100;
        totalScore += score * CORRELATION_WEIGHTS['numerology-odú'];
        weightSum += CORRELATION_WEIGHTS['numerology-odú'];
        breakdown.push({ type: 'numerology-odú', score, description: `Life Path ${profile.lifePathNumber} alinha com ${numerologyData.odu}` });
        patterns.push("Alinhamento completo: Life Path e Odú de Nascimento convergem");
      } else {
        const score = 60;
        totalScore += score * CORRELATION_WEIGHTS['numerology-odú'];
        weightSum += CORRELATION_WEIGHTS['numerology-odú'];
        breakdown.push({ type: 'numerology-odú', score, description: `Life Path ${profile.lifePathNumber} → ${numerologyData.odu}` });
      }
    }
  }

  const normalizedScore = weightSum > 0 ? Math.round(totalScore / weightSum) : 0;
  return {
    overallScore: normalizedScore,
    strength: getStrengthFromScore(normalizedScore),
    breakdown, patterns,
    dominantAxis: patterns.length > 0 ? patterns[0].split(':')[0].trim() : "Sem eixo dominante detectado",
    warnings, recommendations
  };
}

export function buildCorrelationMatrix(_profile?: SpiritualProfileInput): CorrelationMatrix {
  const systems = ['Dias', 'Orixás', 'Chakras', 'Planetas', 'Odús', 'Elementos'];
  const labels: string[] = [];
  
  const dayLabels = Object.values(DAY_PORTAL_DATA).map(d => d.dia);
  const orixaLabels = Object.keys(ORIXA_DATA);
  const chakraLabels = [...new Set(Object.values(ORIXA_DATA).flatMap(o => o.chakras))];
  const planetLabels = [...new Set(Object.values(DAY_PORTAL_DATA).flatMap(d => d.planetas))];
  const oduLabels = Object.keys(ODÚ_DATA);
  const elementLabels = [...new Set(Object.values(ODÚ_DATA).flatMap(o => o.elementos))];

  labels.push(...dayLabels, ...orixaLabels, ...chakraLabels, ...planetLabels, ...oduLabels, ...elementLabels);
  const n = labels.length;
  const matrix: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) { matrix[i][j] = 100; continue; }
      const labelI = labels[i];
      const labelJ = labels[j];
      
      for (const [odu, oduData] of Object.entries(ODÚ_DATA)) {
        if (odu === labelI && oduData.orixas.some(o => normalizeOrixa(o) === normalizeOrixa(labelJ))) {
          matrix[i][j] = Math.max(matrix[i][j], 100);
        }
        if (odu === labelJ && oduData.orixas.some(o => normalizeOrixa(o) === normalizeOrixa(labelI))) {
          matrix[i][j] = Math.max(matrix[i][j], 100);
        }
      }
    }
  }
  return { systems, matrix, labels };
}

export function getMesaRealHouse(houseNumber: number): { carta: string; significado: string; area: string } | null {
  return LENORMAND_CRITICAL_HOUSES[houseNumber] || null;
}

export const CORRELATION_DATA = {
  DAY_PORTALS: DAY_PORTAL_DATA,
  ORIXA_DATA,
  ODÚ_DATA,
  SOLFEGGIO_CHAKRA_MAP,
  NUMEROLOGY_ODU_MAP,
  LENORMAND_CRITICAL_HOUSES,
  CHAKRA_PLANET_MAP,
  ELEMENT_HIERARCHY,
  CORRELATION_WEIGHTS
};
