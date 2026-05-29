import { ORIXA_CHAKRA_MAP } from './correlation-types';
import { LUNAR_PHASES } from './lunar-phase-analyzer';

// Chakra to symptom mapping from IDEIA.md
const CHAKRA_MISALIGNMENT_DIAGNOSIS: Record<string, {
  symptoms: string[];
  oduNegativado: string[];
  physicalManifestation: string[];
  mesaRealAlerta: string;
  acaoCorretiva: string;
  herbs: string[];
  frequency: string;
}> = {
  "7º Coronário": {
    symptoms: ["Seticismo absoluto", "Fanatismo religioso", "Vazio existencial severo"],
    oduNegativado: ["Ofun (10)", "Alafia (16)"],
    physicalManifestation: ["Dores de cabeça crônicas", "Insônia", "Confusão mental generalizada"],
    mesaRealAlerta: "6. As Nuvens",
    acaoCorretiva: "Silêncio absoluto, banho de boldo gelado (Ori) e meditação na frequência 963 Hz",
    herbs: ["Boldo", "Manjericão Branco", "Colônia"],
    frequency: "963 Hz",
  },
  "6º Frontal": {
    symptoms: ["Desorientação mental", "Pesadelos constantes", "Incapacidade de focar ou intuir"],
    oduNegativado: ["Irosun (4)", "Ossá (9)"],
    physicalManifestation: ["Sinusite", "Problemas de visão", "Fadiga psicológica extrema"],
    mesaRealAlerta: "26. O Livro (Fechado)",
    acaoCorretiva: "Abafado de alfazema com saião, reza firme para Mãe Iemanjá, uso da cor azul escura",
    herbs: ["Alfazema", "Saião", "Rosa Branca"],
    frequency: "852 Hz",
  },
  "5º Laríngeo": {
    symptoms: ["Fofoca", "Engolir sapos", "Agressividade verbal", "Timidez paralisante"],
    oduNegativado: ["Okaran (1)", "Etaogundá (3)"],
    physicalManifestation: ["Inflamações de garganta", "Problemas na tireoide", "Rouquidão"],
    mesaRealAlerta: "11. O Chicote",
    acaoCorretiva: "Defumação com alecrim, mantra HAM, verbalizar limites claros com firmeza de Ogum",
    herbs: ["Alecrim", "Louro", "Espada-de-são-jorge"],
    frequency: "741 Hz",
  },
  "4º Cardíaco": {
    symptoms: ["Mágoa profunda", "Dependência emocional", "Incapacidade de perdoar a si mesmo"],
    oduNegativado: ["Oxé (5)", "Odi (7)"],
    physicalManifestation: ["Taquicardia por ansiedade", "Aperto no peito", "Imunidade baixa"],
    mesaRealAlerta: "24. O Coração + 23. O Rato",
    acaoCorretiva: "Banho de rosas, mel e calêndula às quintas ou sábados na força de Oxum e Oxóssi",
    herbs: ["Rosa Branca", "Calêndula", "Camomila", "Mel"],
    frequency: "639 Hz",
  },
  "3º Plexo Solar": {
    symptoms: ["Complexo de inferioridade", "Acessos de raiva", "Ganância", "Necessidade de controle"],
    oduNegativado: ["Obará (6)", "Ejilsebora (12)"],
    physicalManifestation: ["Problemas estomacais crônicos", "Azia", "Má digestão", "Refluxo"],
    mesaRealAlerta: "15. O Urso",
    acaoCorretiva: "Comer alimentos amarelos, firmar uma pedra de raio, acender vela dourada para Xangô no Sol",
    herbs: ["Canela", "Girassol", "Folha de Café"],
    frequency: "528 Hz",
  },
  "2º Sacro": {
    symptoms: ["Bloqueio criativo severo", "Impotência/frigidez", "Vícios em prazeres rápidos"],
    oduNegativado: ["Ejiokô (2)", "Owarin (11)"],
    physicalManifestation: ["Problemas renais", "Cólicas intensas", "Dores na região pélvica"],
    mesaRealAlerta: "7. A Cobra",
    acaoCorretiva: "Banho fervido de pinhão roxo e guiné do pescoço para baixo (descarrego de Iansã)",
    herbs: ["Pinhão Roxo", "Guiné", "Bambú"],
    frequency: "417 Hz",
  },
  "1º Básico": {
    symptoms: ["Medo crônico da escassez", "Preguiça paralisante", "Desorganização material total"],
    oduNegativado: ["Okaran (1)", "Olobón (13)"],
    physicalManifestation: ["Dores nas articulações", "Problemas nas pernas/pés", "Descalcificação"],
    mesaRealAlerta: "21. O Montanha + 36. O Cruz",
    acaoCorretiva: "Sacudimento com pipoca (Deburu), banho de canela-de-velho, andar descalço na terra",
    herbs: ["Canela-de-velho", "Assa-peixe", "Arruda"],
    frequency: "396 Hz",
  },
};

export interface DiagnosisResult {
  chakra: string;
  alignment: 'aligned' | 'slightly_misaligned' | 'misaligned' | 'severely_misaligned';
  diagnosis: {
    symptoms: string[];
    oduNegativado: string[];
    physicalManifestation: string[];
    mesaRealAlerta: string;
  };
  correctiveActions: {
    ritual: string;
    herbs: string[];
    frequency: string;
    affirmation: string;
    lunarPhase: string;
  };
  severity: number; // 0-100
}

/**
 * Analyze symptoms and determine chakra alignment
 */
export function diagnoseSpiritualMisalignment(symptoms: string[]): DiagnosisResult[] {
  const results: DiagnosisResult[] = [];

  for (const [chakra, data] of Object.entries(CHAKRA_MISALIGNMENT_DIAGNOSIS)) {
    const matchedSymptoms = symptoms.filter(s =>
      data.symptoms.some(ds => ds.toLowerCase().includes(s.toLowerCase())) ||
      data.physicalManifestation.some(pm => pm.toLowerCase().includes(s.toLowerCase()))
    );

    if (matchedSymptoms.length > 0) {
      const severity = Math.min(100, (matchedSymptoms.length / data.symptoms.length) * 100);

      let alignment: DiagnosisResult['alignment'];
      if (severity >= 75) alignment = 'severely_misaligned';
      else if (severity >= 50) alignment = 'misaligned';
      else if (severity >= 25) alignment = 'slightly_misaligned';
      else alignment = 'aligned';

      results.push({
        chakra,
        alignment,
        diagnosis: {
          symptoms: matchedSymptoms,
          oduNegativado: data.oduNegativado,
          physicalManifestation: data.physicalManifestation,
          mesaRealAlerta: data.mesaRealAlerta,
        },
        correctiveActions: {
          ritual: data.acaoCorretiva,
          herbs: data.herbs,
          frequency: data.frequency,
          affirmation: getAffirmation(chakra),
          lunarPhase: getRecommendedLunarPhase(alignment),
        },
        severity,
      });
    }
  }

  return results.sort((a, b) => b.severity - a.severity);
}

function getAffirmation(chakra: string): string {
  const affirmations: Record<string, string> = {
    "7º Coronário": "Eu me conecto com a luz divina que tudo illumina. Meu espírito está em paz.",
    "6º Frontal": "Minha intuição é clara e meu terceiro olho vê a verdade. Confio em minha visão interior.",
    "5º Laríngeo": "Minha voz é clara e verdadeira. Eu expresso minha verdade com amor e firmeza.",
    "4º Cardíaco": "Eu abro meu coração ao amor incondicional. Perdoar é libertar a mim mesmo.",
    "3º Plexo Solar": "Eu tenho poder sobre minha vontade. Minha força interior move montanhas.",
    "2º Sacro": "Minha energia criativa flui livremente. Eu abraço minha sexualidade sagrada.",
    "1º Básico": "Eu estou ancorado na terra. Minha segurança vem da conexão com o universo.",
  };
  return affirmations[chakra] || "Eu aligno meu ser com a ordem do universo.";
}

function getRecommendedLunarPhase(alignment: DiagnosisResult['alignment']): string {
  switch (alignment) {
    case 'severely_misaligned':
    case 'misaligned':
      return "Lua Minguante";
    case 'slightly_misaligned':
      return "Lua Crescente";
    default:
      return "Lua Cheia";
  }
}

/**
 * Get personalized spiritual prescription based on diagnosis
 */
export function getSpiritualPrescription(diagnosis: DiagnosisResult[]): {
  primaryFocus: string;
  weeklyPractice: string[];
  herbs: string[];
  frequencies: string[];
  affirmations: string[];
  preferredDays: string[];
  warnings: string[];
} {
  if (diagnosis.length === 0) {
    return {
      primaryFocus: "Manter o equilíbrio atual com práticas de manutenção",
      weeklyPractice: ["Meditação diária", "Gratidão", "Conexão com a natureza"],
      herbs: ["Boldo", "Alecrim", "Rosa Branca"],
      frequencies: ["528 Hz", "639 Hz"],
      affirmations: ["Eu fluo em harmonia com o universo"],
      preferredDays: ["Quarta-feira", "Sexta-feira", "Domingo"],
      warnings: [],
    };
  }

  const mostSevere = diagnosis[0];

  return {
    primaryFocus: `Focar no ${mostSevere.chakra} para restabelecer o alinhamento`,
    weeklyPractice: [
      `Meditação com ${mostSevere.correctiveActions.frequency}`,
      mostSevere.correctiveActions.ritual,
      `Banho com ${mostSevere.correctiveActions.herbs.join(' e ')}`,
    ],
    herbs: diagnosis.flatMap(d => d.correctiveActions.herbs),
    frequencies: diagnosis.map(d => d.correctiveActions.frequency),
    affirmations: diagnosis.map(d => d.correctiveActions.affirmation),
    preferredDays: getPreferredDays(diagnosis),
    warnings: getWarnings(diagnosis),
  };
}

function getPreferredDays(diagnosis: DiagnosisResult[]): string[] {
  const dayMap: Record<string, string[]> = {
    "7º Coronário": ["Sexta-feira", "Domingo"],
    "6º Frontal": ["Sábado"],
    "5º Laríngeo": ["Terça-feira", "Quarta-feira"],
    "4º Cardíaco": ["Quinta-feira", "Sábado"],
    "3º Plexo Solar": ["Quarta-feira", "Domingo"],
    "2º Sacro": ["Terça-feira", "Quarta-feira"],
    "1º Básico": ["Segunda-feira"],
  };

  const days = diagnosis.flatMap(d => dayMap[d.chakra] || []);
  return [...new Set(days)];
}

function getWarnings(diagnosis: DiagnosisResult[]): string[] {
  return diagnosis
    .filter(d => d.alignment === 'severely_misaligned')
    .flatMap(d => [
      `Cuidado com ${d.diagnosis.mesaRealAlerta} - sinal de alerta no seu caminho`,
      `Evitar quizilas dos Odús: ${d.diagnosis.oduNegativado.join(', ')}`,
    ]);
}