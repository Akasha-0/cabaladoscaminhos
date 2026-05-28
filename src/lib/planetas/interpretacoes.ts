import type { Planeta, Signo } from '@/lib/astrologia/tipos';
import { PLANETAS } from './dados';

const SIGNOS_NOMES: Record<Signo, string> = {
  aries: 'Áries',
  touro: 'Touro',
  gemeos: 'Gêmeos',
  cancer: 'Câncer',
  leao: 'Leão',
  virgem: 'Virgem',
  libra: 'Libra',
  escorpio: 'Escorpião',
  sagitario: 'Sagitário',
  capricornio: 'Capricórnio',
  aquario: 'Aquário',
  peixes: 'Peixes',
};

const INTERPRETACOES_PLANETA_SIGNO: Record<string, Record<string, string>> = {
  sol: {
    aries: 'Liderança assertiva, pioneirismo, energia vital direcionada para novos começos',
    touro: 'Força de vontade estável, determinação, foco em valores materiais e sensoriais',
    gemeos: 'Mente curiosa, comunicação expressiva, múltiplos interesses',
    cancer: 'Intuição emocional profunda, proteção do lar e da família',
    leao: 'Criatividade magnética, autoexpressão autoritativa, orgulho legitimate',
    virgem: 'Análise crítica precisa, perfeccionismo, serviço prático',
    libra: 'Diplomacia, busca por parcerias, harmonia em relações',
    escorpio: 'Transformação intensa, poder pessoal, investigação profunda',
    sagitario: 'Expansão filosófica, otimismo, busca por meaning superior',
    capricornio: 'Ambição estruturada, disciplina, meta de longo prazo',
    aquario: 'Individualismo inovador, humanitarismo, originalidade',
    peixes: 'Transcendência espiritual, compaixão, dissolução de limites',
  },
  lua: {
    aries: 'Impulsividade emocional, necessidades imediatas, segurança através da ação',
    touro: 'Estabilidade emocional, conforto material, necessidades sensoriais',
    gemeos: 'Curiosidade intelectual, comunicação emocional, mudança de humor',
    cancer: 'Intuição profunda, conexão com o passado, necessidades de proteção',
    leao: 'Drama emocional, necessidade de reconhecimento, criatividade expressiva',
    virgem: 'Análise emocional, necessidade de organização, crítica sutil',
    libra: 'Harmonia relacional, indecisão emocional, sensibilidade artística',
    escorpio: 'Transformação emocional profunda, intensidade,Segredos',
    sagitario: 'Entusiasmo emocional, otimismo, busca por experiências',
    capricornio: 'Controle emocional, ambição, responsabilidade',
    aquario: 'Detachment emocional, originalidade, fraternidade',
    peixes: 'Sensibilidade espiritual, empatia, dissolução emocional',
  },
  mercurio: {
    aries: 'Comunicação direta, mentalidade pioneira, impaciência intelectual',
    touro: 'Pensamento prático, persistência mental, resistência à mudança',
    gemeos: 'Versatilidade intelectual, curiosidade, comunicação versátil',
    cancer: 'Memória emocional, pensamento intuitivo, comunicação sensitiva',
    leao: 'Expressão criativa, pensamento dramático, orgulho intelectual',
    virgem: 'Análise meticulosa, crítica, pragmatismo intelectual',
    libra: 'Deliberação, equilíbrio de perspectivas, diplomacia mental',
    escorpio: 'Investigação profunda, pensamento penetrante, intensidade',
    sagitario: 'Pensamento filosófico, otimismo intelectual, busca por kebenaran',
    capricornio: 'Mente estratégica, ambição intelectual, disciplina',
    aquario: 'Pensamento original, ideias inovadoras, objetividade',
    peixes: 'Intuição criativa, sensitividade, percepção extrasensorial',
  },
  venus: {
    aries: 'Passionate expressão de afeto, competitivo em relações',
    touro: 'Prazer sensorial, lealdade, attached aos valores materiais',
    gemeos: 'Variedade romântica, intelectualidade em relaciones',
    cancer: 'Conexão emocional profunda, nurturance, seguridad sentimental',
    libra: 'Romance idealizado, diplomacy relationelle, besoin dharmonie',
    leao: 'Expressão dramática de amor, generosidade, orgulho em relaciones',
    virgem: 'Serviço como expressão de amor, crítico em relaciones',
    escorpio: 'Transformação através do amor, intensidade, profundidad',
    sagitario: 'Aventura em relaciones, philosophical romance, liberdade',
    capricornio: 'Amor prático, ambition, estrutura em relations',
    aquario: 'Amizade profunda, separação entre amor e compromiso',
    peixes: 'Romance espiritual, compaixão, dissolução de límites',
  },
  marte: {
    aries: 'Energia assertiva, pioneirismo, liderança agressiva',
    touro: 'Persistência determinada, sensualidade ativa, teimosia',
    gemeos: 'Verbalização enérgica, multitarefa, debater',
    cancer: 'Proteção emocional ativa, humor defensivo, intensidade',
    leao: 'Expressão criativa enérgica, orgulho, dinâmica dramática',
    virgem: 'Energia analítica, trabalho meticuloso, perfeccionismo',
    libra: 'Assertividade relacional, diplomatic warfare, manipulação sutil',
    escorpio: 'Transformação através da ação, intensidade profunda, poder',
    sagitario: 'Energia expansiva, aventura, otimismo ativo',
    capricornio: 'Ambição disciplinada, energia paciente, determinação',
    aquario: 'Rebeldia enérgica, inovação, ação anticonformista',
    peixes: 'Energia espiritual, sacrifício, dissolução de límites行動',
  },
  jupiter: {
    aries: 'Expansão pioneira, otimismo enérgico, liderança visionária',
    touro: 'Abundância material, crescimento através de valores práticos',
    gemeos: 'Expansão intelectual, múltiplos interesses, versátil sorte',
    cancer: 'Crescimento emocional, expansão do lar, intuição Jupiteriana',
    leao: 'Expansão criativa, generosidade, expressão de orgulho',
    virgem: 'Expansão através do serviço, detalhes afortunados, cura',
    libra: 'Expansão através de relaciones, justiça, harmonies social',
    escorpio: 'Expansão transformadora, profundidade, investigação mística',
    sagitario: 'Filosofia, travels, sabedoria expansiva, otimismo',
    capricornio: 'Ambición estruturada, sucesso através de disciplina',
    aquario: 'Expansão humanitária, inovação, pensamiento original',
    peixes: 'Expansão espiritual, compassion, transcendência mística',
  },
  saturno: {
    aries: 'Estrutura autodirigida, liderança com responsabilidade',
    touro: 'Estrutura financeira, resistência, material persistence',
    gemeos: 'Restrições mentais, aprendizado disciplinado, comunicação estruturada',
    cancer: 'Estrutura emocional, responsabilidade familiar, proteção',
    leao: 'Restrições criativas, orgulho estruturado, disciplina expressiva',
    virgem: 'Perfeccionismo, análise estruturada, serviço com limites',
    libra: 'Restrições em relaciones, responsabilidad social, justicia',
    escorpio: 'Transformação estruturada, poder através de disciplina, profundidade',
    sagitario: 'Filosofia disciplinada, límites em expansión, sabedoria estruturada',
    capricornio: 'Ambição, estructura, responsabilidad, éxito através de esfuerzo',
    aquario: 'Estrutura inovadora, disciplina anticonformista, originales',
    peixes: 'Estrutura espiritual, límites transcendentes, sacrifício estruturado',
  },
  urano: {
    aries: 'Revolução individual, inovação radikal, ruptura com tradições',
    touro: 'Mudança de valores, inovação material, resistência à mudança',
    gemeos: 'Genialidade versátil, ideias revolucionárias, comunicação original',
    cancer: 'Mudança emocional inesperada, inovação familiar, rupturas domésticas',
    leao: 'Criatividade revolucionária, autoexpressão original, genialidade',
    virgem: 'Reforma analítica, perfeccionismo unik, inovação prática',
    libra: 'Revolução em relaciones, justiça unique, cambios inesperados',
    escorpio: 'Transformação revolucionária, poder意外s, renovación profunda',
    sagitario: 'Expansión Libre, filosofía original, libertad de pensamiento',
    capricornio: 'Mudanças estruturais, ambición no convencional, éxito diferente',
    aquario: 'Inovação pura, gênio humanitário, originalidade máxima',
    peixes: 'Inspiração transcendental, dissolução de estructuras, misticismo único',
  },
  netuno: {
    aries: 'Idealismo pioneiro, sonho visionário, fé enérgica',
    touro: 'Idealização material, sensibilidade sensorial, attached a ilusões',
    gemeos: 'Mentalspiritualidade, comunicação Inspirada, ideias trascendentales',
    cancer: 'Intuição profond, sensibilidade emocional, conexões passadas',
    leao: 'Criatividade Idealizada, fantasia, idealismo expressivo',
    virgem: 'Percepção sutil,service transcendente, sonho prático',
    libra: 'Idealismo relacional, ilusões em relaciones, armonía幻想',
    escorpio: 'Transformação espiritual, poder místico, profundidad',
    sagitario: 'Filosofia espiritual, búsqueda de verdad trascendente, fe',
    capricornio: 'Ambiguedad, estructura idealizada, espiritual material integration',
    aquario: 'Inspiração humanitária, sonho coletivo, transcendência social',
    peixes: 'Transcendência máxima, compaixão universal, dissolução de ego',
  },
  plutao: {
    aries: 'Revolução pessoal, regeneração energética, transformação de identidade',
    touro: 'Transformação de valores, poder material, renovação de recursos',
    gemeos: 'Regeneração intelectual, investigação penetrante, transformação de comunicação',
    cancer: 'Transformação emocional, renovação familiar, profundeza do inconsciente',
    leao: 'Transformação criativa, poder expressivo, regeneração do ego',
    virgem: 'Transformação saudável, serviço profundo, renovação prática',
    libra: 'Transformação relacional, parcerias transformadoras, justiça profunda',
    escorpio: 'Transformação máxima, poder penetrante, regeneração profunda',
    sagitario: 'Transformação filosófica, renewal através de wisdom, expansão transformadora',
    capricornio: 'Transformação estrutural, poder através de estruturas, renovação de poder',
    aquario: 'Transformação coletiva, renovação social, revolução regenerativa',
    peixes: 'Transformação espiritual, transcendência, dissolução regenerativa',
  },
};

export function getInterpretaçãoBase(planeta: Planeta, signo: Signo): string {
  const key = `${planeta}_${signo}`;
  return INTERPRETACOES_PLANETA_SIGNO[planeta]?.[signo] ?? 
    `${PLANETAS[planeta]?.nome || planeta} em ${SIGNOS_NOMES[signo] || signo}.`;
}

export function getDescricaoSigno(signo: Signo): string {
  const descricoes: Record<Signo, string> = {
    aries: 'Cardinal, Fogo. Pioneiro, assertivo, impulsivo',
    touro: 'Fixo, Terra. Prudente, paciente, possessivo',
    gemeos: 'Mutável, Ar. versátil, curioso, indeciso',
    cancer: 'Cardinal, Água. emocional, protetor, sensitiva',
    leao: 'Fixo, Fogo. criativo, seguro, dramático',
    virgem: 'Mutável, Terra. analítico, perfeccionista, prestativo',
    libra: 'Cardinal, Ar. diplomático, justo, indeciso',
    escorpio: 'Fixo, Água. intenso,investigador, transformador',
    sagitario: 'Mutável, Fogo. filosófico, otimista, aventureiro',
    capricornio: 'Cardinal, Terra. ambicioso, disciplinado, cauteloso',
    aquario: 'Fixo, Ar. original, humanitário, excêntrico',
    peixes: 'Mutável, Água. intuitivo, espiritual, sonhador',
  };
  return descricoes[signo] || '';
}

export function getForcaPlanetaria(
  planeta: Planeta,
  signo: Signo,
  exaltação: string,
  queda: string,
  regente: string
): 'forte' | 'neutro' | 'fraco' {
  const signoCapitalized = SIGNOS_NOMES[signo];
  
  if (signoCapitalized === exaltação) return 'forte';
  if (signoCapitalized === queda) return 'fraco';
  if (signoCapitalized === regente) return 'forte';
  
  return 'neutro';
}

export function interpretarVelocidade(velocidade: number): string {
  if (velocidade > 10) return 'Movimento muito rápido - energia dinâmica e mutável';
  if (velocidade > 5) return 'Movimento rápido - expressão enérgica';
  if (velocidade > 1) return 'Movimento moderado - expressão estável';
  if (velocidade > 0.5) return 'Movimento lento - influência profunda e duradoura';
  if (velocidade > 0.1) return 'Movimento muito lento - transformação profunda e gradual';
  return 'Estacionário - energia concentrada e intensa';
}
