import { NextRequest, NextResponse } from 'next/server';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';
import { calcularAspectos } from '@/lib/astrologia/planetas/aspectos';
import type { MapaNatal, Aspecto, Planeta } from '@/lib/astrologia/tipos';

interface AnaliseStrength {
  categoria: string;
  descricao: string;
  planetasEnvolvidos: Planeta[];
}

interface AnaliseChallenge {
  categoria: string;
  descricao: string;
  planetasEnvolvidos: Planeta[];
}

interface InterpretacaoPlaneta {
  planeta: Planeta;
  signo: string;
  casa: number;
  energia: 'positiva' | 'desafiadora' | 'neutra';
  descricao: string;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataNascimento = searchParams.get('dataNascimento');
    const horaNascimento = searchParams.get('horaNascimento') || '12:00';
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    
    if (!dataNascimento || !latitude || !longitude) {
      return NextResponse.json({ 
        error: 'Dados incompletos para análise' 
      }, { status: 400 });
    }
    
    const mapaNatal = calcularMapaNatal(
      new Date(dataNascimento),
      horaNascimento,
      parseFloat(latitude),
      parseFloat(longitude)
    );
    
    const posicoes = Object.values(mapaNatal.planeta);
    const aspectos = calcularAspectos(posicoes);
    
    const strengths = analyzeStrengths(mapaNatal, aspectos);
    const challenges = analyzeChallenges(mapaNatal, aspectos);
    const interpretacao = generateInterpretation(mapaNatal, aspectos);
    
    return NextResponse.json({
      mapaNatal,
      aspectos,
      strengths,
      challenges,
      interpretacao,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=259200, stale-while-revalidate=604800',
      },
    });
  } catch (_error) {
    console.error('Erro na análise astrológica:', _error);
    return NextResponse.json({ 
      error: 'Erro ao realizar análise astrológica' 
    }, { status: 500 });
  }
}
function analyzeStrengths(mapaNatal: MapaNatal, aspectos: Aspecto[]): AnaliseStrength[] {
  const strengths: AnaliseStrength[] = [];
  const planetas = mapaNatal.planeta;
  
  // Analyze trines (positive aspects)
  const trinos = aspectos.filter(a => a.tipo === 'trino');
  trinos.forEach(trino => {
    strengths.push({
      categoria: 'Harmonia Planetária',
      descricao: `${capitalize(trino.planeta1)} em trino com ${capitalize(trino.planeta2)} indica facilidade e fluidez nestas áreas da vida.`,
      planetasEnvolvidos: [trino.planeta1, trino.planeta2],
    });
  });
  
  // Analyze sextiles (opportunity aspects)
  const sextils = aspectos.filter(a => a.tipo === 'sextil');
  sextils.forEach(sextil => {
    strengths.push({
      categoria: 'Potencial de Crescimento',
      descricao: `${capitalize(sextil.planeta1)} em sextil com ${capitalize(sextil.planeta2)} representa habilidades naturais que podem ser desenvolvidas.`,
      planetasEnvolvidos: [sextil.planeta1, sextil.planeta2],
    });
  });
  
  // Single planets in domicile (dignified)
  const signosRegentes: Record<string, Planeta> = {
    aries: 'marte',
    touro: 'venus',
    gemeos: 'mercurio',
    cancer: 'lua',
    leao: 'sol',
    virgem: 'mercurio',
    libra: 'venus',
    escorpiao: 'plutao',
    sagitario: 'jupiter',
    capricornio: 'saturno',
    aquario: 'saturno',
    peixes: 'jupiter',
  };
  
  Object.entries(planetas).forEach(([planeta, posicao]) => {
    const signoRegente = Object.entries(signosRegentes).find(
      ([signo, plan]) => signo === posicao.signo && plan === planeta
    );
    if (signoRegente) {
      strengths.push({
        categoria: 'Dignidade Planetária',
        descricao: `${capitalize(planeta)} em seu signo regente (${capitalize(posicao.signo)}) indica força natural e domínio nestas energias.`,
        planetasEnvolvidos: [planeta as Planeta],
      });
    }
  });
  
  // Strong aspects to Sun
  const aspectosSol = aspectos.filter(
    a => (a.planeta1 === 'sol' || a.planeta2 === 'sol') && (a.tipo === 'trino' || a.tipo === 'sextil')
  );
  if (aspectosSol.length >= 2) {
    strengths.push({
      categoria: 'Vitalidade Essencial',
      descricao: 'Múltiplos aspectos positivos ao Sol indicam brilho pessoal, autoconfiança e propósito claro.',
      planetasEnvolvidos: ['sol'],
    });
  }
  
  return strengths;
}

function analyzeChallenges(mapaNatal: MapaNatal, aspectos: Aspecto[]): AnaliseChallenge[] {
  const challenges: AnaliseChallenge[] = [];
  
  // Analyze squares (challenging aspects)
  const quadraturas = aspectos.filter(a => a.tipo === 'quadratura');
  quadraturas.forEach(quad => {
    challenges.push({
      categoria: 'Tensão Criativa',
      descricao: `${capitalize(quad.planeta1)} em quadratura com ${capitalize(quad.planeta2)} gera tensão que pode ser canalizada para crescimento.`,
      planetasEnvolvidos: [quad.planeta1, quad.planeta2],
    });
  });
  
  // Analyze oppositions
  const oposicoes = aspectos.filter(a => a.tipo === 'oposição');
  oposicoes.forEach(opos => {
    challenges.push({
      categoria: 'Polaridade e Integração',
      descricao: `${capitalize(opos.planeta1)} em oposição com ${capitalize(opos.planeta2)} destaca áreas que precisam de integração consciente.`,
      planetasEnvolvidos: [opos.planeta1, opos.planeta2],
    });
  });
  
  // Planets in fall or detriment
  const signosExilados: Record<string, Planeta[]> = {
    aries: ['saturno'],
    touro: ['marte'],
    gemeos: ['jupiter'],
    cancer: ['plutao'],
    leao: ['saturno'],
    virgem: ['venus'],
    libra: ['marte'],
    escorpiao: ['venus'],
    sagitario: ['mercurio'],
    capricornio: ['lua'],
    aquario: ['lua'],
    peixes: ['mercurio'],
  };
  
  Object.entries(mapaNatal.planeta).forEach(([planeta, posicao]) => {
    const exilados = signosExilados[posicao.signo];
    if (exilados && exilados.includes(planeta as Planeta)) {
      challenges.push({
        categoria: 'Exílio Planetário',
        descricao: `${capitalize(planeta)} em ${capitalize(posicao.signo)} (exílio) indica energias que requerem esforço consciente para integrar.`,
        planetasEnvolvidos: [planeta as Planeta],
      });
    }
  });
  
  // Saturn challenging squares
  const saturnoDesafios = aspectos.filter(
    a => (a.planeta1 === 'saturno' || a.planeta2 === 'saturno') &&
         (a.tipo === 'quadratura' || a.tipo === 'oposição')
  );
  if (saturnoDesafios.length >= 2) {
    challenges.push({
      categoria: 'Disciplina e Responsabilidade',
      descricao: 'Múltiplos aspectos desafiadores de Saturno indicam necessidade de estrutura e superação de obstáculos para crescimento.',
      planetasEnvolvidos: ['saturno'],
    });
  }
  
  return challenges;
}

function generateInterpretation(mapaNatal: MapaNatal, aspectos: Aspecto[]): InterpretacaoPlaneta[] {
  const interpretacao: InterpretacaoPlaneta[] = [];
  const signosNomes: Record<string, string> = {
    aries: 'pioneiro, assertivo e direto',
    touro: 'prático, persistente e apreciador',
    gemeos: 'versátil, comunicativo e curioso',
    cancer: 'intuitivo, emocional e protetor',
    leao: 'criativo, generoso e carismático',
    virgem: 'analítico, detalhista e útil',
    libra: 'diplomático, harmonioso e social',
    escorpiao: 'intenso, transformador e profundo',
    sagitario: 'otimista, aventureiro e filosófico',
    capricornio: 'ambicioso, disciplinado e responsável',
    aquario: 'inovador, original e humanitário',
    peixes: 'compassivo, espiritual e sonhador',
  };
  
  const planetasNomes: Record<string, string> = {
    sol: 'identidade e propósito de vida',
    lua: 'emoções e necessidades emocionais',
    mercurio: 'comunicação e capacidade mental',
    venus: 'amor, beleza e valores',
    marte: 'energia, ação e desejo',
    jupiter: 'expansão, sorte e sabedoria',
    saturno: 'responsabilidade, limites e estrutura',
    urano: 'mudança, liberdade e originalidade',
    netuno: 'intuição, espiritualidade e transcendência',
    plutao: 'transformação, poder e renovação',
  };
  
  Object.entries(mapaNatal.planeta).forEach(([planeta, posicao]) => {
    const aspectosDoPlaneta = aspectos.filter(
      a => a.planeta1 === planeta || a.planeta2 === planeta
    );
    const energiaPositiva = aspectosDoPlaneta.filter(
      a => a.tipo === 'trino' || a.tipo === 'sextil'
    ).length;
    const energiaDesafiadora = aspectosDoPlaneta.filter(
      a => a.tipo === 'quadratura' || a.tipo === 'oposição'
    ).length;
    
    let energia: 'positiva' | 'desafiadora' | 'neutra' = 'neutra';
    if (energiaPositiva > energiaDesafiadora) energia = 'positiva';
    else if (energiaDesafiadora > energiaPositiva) energia = 'desafiadora';
    
    const signoDesc = signosNomes[posicao.signo] || 'desconhecido';
    const planetaDesc = planetasNomes[planeta] || 'energia desconhecida';
    
    interpretacao.push({
      planeta: planeta as Planeta,
      signo: posicao.signo,
      casa: posicao.casa,
      energia,
      descricao: `${capitalize(planeta)} em ${capitalize(posicao.signo)} na Casa ${posicao.casa}: representa o ${planetaDesc} em modo ${signoDesc}.`,
    });
  });
  
  return interpretacao;
}