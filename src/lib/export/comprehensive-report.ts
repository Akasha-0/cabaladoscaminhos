/**
 * Módulo de geração de relatórios abrangentes.
 * Integra dados de múltiplas disciplinas esotéricas em um relatório unificado.
 */

import type { NumerologiaReportData } from './reports';
import type { AstrologiaReportData } from './reports';
import type { OduReportData } from './reports';
import type { GeneratedReport } from './reports';

export type ComprehensiveReportType = 'completo' | 'analitico' | 'sintetico';

export interface ComprehensiveReportData {
  nome: string;
  dataNascimento: string;
  email?: string;
  numerologia?: NumerologiaReportData;
  astrologia?: AstrologiaReportData;
  odu?: OduReportData;
  tipo?: ComprehensiveReportType;
}

export interface ComprehensiveReportSection {
  titulo: string;
  subtitulo?: string;
  conteudo: string;
  subsecoes?: { titulo: string; conteudo: string }[];
}

export interface ComprehensiveTimelineItem {
  fase: string;
  periodo: string;
  descricao: string;
  orientacao: string;
}

export interface ComprehensiveRecommendation {
  area: string;
  prioridade: 'alta' | 'media' | 'baixa';
  recomendacao: string;
  justificativa: string;
}

export interface GeneratedComprehensiveReport {
  meta: {
    geradoEm: string;
    tipo: ComprehensiveReportType;
    versao: string;
  };
  intro: {
    titulo: string;
    saudacao: string;
    contexto: string;
  };
  conteudoPrincipal: ComprehensiveReportSection[];
  recomendacoes: ComprehensiveRecommendation[];
  timeline: ComprehensiveTimelineItem[];
  fechamento: {
    mensagemFinal: string;
    disclaimer: string;
  };
}

/**
 * Gera um relatório abrangente combinando múltiplas leituras esotéricas.
 */
export function generateComprehensiveReport(
  type: ComprehensiveReportType,
  data: ComprehensiveReportData
): GeneratedComprehensiveReport {
  const dataWithType = { ...data, tipo: type };
  const intro = gerarIntro(dataWithType);
  const conteudoPrincipal = gerarConteudoPrincipal(dataWithType);
  const recomendacoes = gerarRecomendacoes(dataWithType);
  const timeline = gerarTimeline(dataWithType);
  const fechamento = gerarFechamento(dataWithType);
  return {
    meta: {
      geradoEm: new Date().toISOString(),
      tipo: type,
      versao: '1.0.0',
    },
    intro,
    conteudoPrincipal,
    recomendacoes,
    timeline,
    fechamento,
  };
}

/**
 * Gera a seção de introdução do relatório.
 */
function gerarIntro(data: ComprehensiveReportData): GeneratedComprehensiveReport['intro'] {
  const nome = data.nome || 'Anônimo';
  const dataFormatada = formatarData(data.dataNascimento);

  return {
    titulo: 'Relatório Abrangente de Leituras Esotéricas',
    saudacao: `Prezado(a) ${nome},`,
    contexto: `Com base em sua data de nascimento (${dataFormatada}) e nas análises realizadas através ` +
      `da Numerologia, Astrologia e Ifá/Cabala, apresentamos este relatório detalhado que busca ` +
      `fornecer uma visão completa e integrada do seu caminho evolutivo, tendências de personalidade ` +
      `e orientações para seu desenvolvimento espiritual e material.`,
  };
}

/**
 * Gera o conteúdo principal do relatório com todas as seções.
 */
function gerarConteudoPrincipal(data: ComprehensiveReportData): ComprehensiveReportSection[] {
  const secoes: ComprehensiveReportSection[] = [];

  // Seção de Numerologia
  if (data.numerologia) {
    secoes.push(gerarSecaoNumerologia(data.numerologia));
  }

  // Seção de Astrologia
  if (data.astrologia) {
    secoes.push(gerarSecaoAstrologia(data.astrologia));
  }

  // Seção de Odu/Ifá
  if (data.odu) {
    secoes.push(gerarSecaoOdu(data.odu));
  }

  // Seção Integrativa se tivermos múltiplas fontes
  const fontesDisponiveis = [data.numerologia, data.astrologia, data.odu].filter(Boolean).length;
  if (fontesDisponiveis > 1) {
    secoes.push(gerarSecaoIntegrativa(data));
  }

  return secoes;
}

/**
 * Gera a seção de Numerologia.
 */
function gerarSecaoNumerologia(data: NumerologiaReportData): ComprehensiveReportSection {
  const interpretacao = data.interpretacao || 'Análise numerológica em elaboração.';
  const ciclos = data.ciclos;

  return {
    titulo: 'Numerologia',
    subtitulo: 'A ciência dos números e sua influência na sua jornada de vida',
    conteudo: interpretacao,
    subsecoes: [
      {
        titulo: 'Números de Vibração',
        conteudo: `Pitagórica: ${data.pitagorica} | Caldeia: ${data.caldeia} | Cabalística: ${data.cabalistica}`,
      },
      {
        titulo: 'Número de Destino',
        conteudo: `${data.destino} - Representa a missão de vida e os desafios a serem superados.`,
      },
      {
        titulo: 'Ciclos de Vida',
        conteudo: ciclos
          ? `Ano: ${ciclos.ano} (${ciclos.sefirotAno}) | Mês: ${ciclos.mes} (${ciclos.sefirotMes}) | Dia: ${ciclos.dia} (${ciclos.sefirotDia})`
          : 'Ciclos em análise.',
      },
    ],
  };
}

/**
 * Gera a seção de Astrologia.
 */
function gerarSecaoAstrologia(data: AstrologiaReportData): ComprehensiveReportSection {
  const signo = data.signos?.sol || 'Não especificado';
  const ascendente = data.signos?.ascendente || 'Não especificado';
  const lua = data.signos?.lua || 'Não especificada';

  return {
    titulo: 'Astrologia',
    subtitulo: 'O mapa celestial do momento do seu nascimento',
    conteudo: `Sua carta astral revela um indivíduo nascido sob o signo de ${signo}, ` +
      `com ascendente em ${ascendente} e lua em ${lua}. ` +
      `Esta configuração celestial oferece insights profundos sobre sua personalidade, ` +
      `relações interpessoais e destino cósmico.`,
    subsecoes: [
      {
        titulo: 'Posições Planetárias',
        conteudo: `Signo Solar: ${signo} | Lua: ${lua}`,
      },
      {
        titulo: 'Casas Astrológicas',
        conteudo: `Ascendente: ${ascendente}`,
      },
      {
        titulo: 'Análise Detalhada',
        conteudo: data.interpretacao || 'Análise astrológica em elaboração.',
      },
    ],
  };
}

/**
 * Gera a seção de Odu/Ifá.
 */
function gerarSecaoOdu(data: OduReportData): ComprehensiveReportSection {
  const odu = data.oduPrincipal?.nome || 'Não identificado';
  const quizilas = data.oduPrincipal?.quizilas?.slice(0, 3).join(', ') || 'Em análise';
  const preceitos = data.oduPrincipal?.preceitos?.slice(0, 3).join(', ') || 'A serem definidos';

  return {
    titulo: 'Tradição de Ifá e Odu',
    subtitulo: 'Sabedoria ancestral africana na sua jornada',
    conteudo: `O Odu identificado para sua jornada é ${odu}. Esta conexão com a tradição de Ifá ` +
      `oferece orientação espiritual profunda, baseada em milhares de anos de sabedoria ancestral. ` +
      `${data.interpretacao || 'A interpretação detalhada está sendo preparada.'}`,
    subsecoes: [
      {
        titulo: 'Odu Principal',
        conteudo: odu,
      },
      {
        titulo: 'Quizilas (Proibições)',
        conteudo: quizilas,
      },
      {
        titulo: 'Preceitos',
        conteudo: preceitos,
      },
    ],
  };
}

/**
 * Gera a seção integrativa que conecta todas as disciplinas.
 */
function gerarSecaoIntegrativa(data: ComprehensiveReportData): ComprehensiveReportSection {
  const pontosComuns: string[] = [];
  const conselhos: string[] = [];

  // Analisar correlações entre Numerologia e Astrologia
  if (data.numerologia && data.astrologia) {
    pontosComuns.push('A energia do seu número de destino ressoa com as qualidades do seu signo solar.');
    conselhos.push('Use a energia numérica para potencializar os trânsitos astrológicos favoráveis.');
  }

  // Analisar correlações com Odu
  if (data.odu && (data.numerologia || data.astrologia)) {
    pontosComuns.push('O Odu identificado oferece proteção e orientação para sua jornada espiritual.');
    conselhos.push('Siga os preceitos do seu Odu para harmonizar suas energias vibracionais.');
  }

  return {
    titulo: 'Análise Integrativa',
    subtitulo: 'Conexões entre as tradições esotéricas',
    conteudo: `Ao integrar as diferentes perspectivas esotéricas, identificamos padrões e sincronicidades ` +
      `que fortalecem a compreensão do seu caminho de vida. As correlações entre a Numerologia, ` +
      `Astrologia e a Tradição de Ifá oferecem uma visão holística e completa.`,
    subsecoes: [
      {
        titulo: 'Pontos de Conexão',
        conteudo: pontosComuns.length > 0 ? pontosComuns.join(' | ') : 'Análise em progresso.',
      },
      {
        titulo: 'Orientações Integrativas',
        conteudo: conselhos.length > 0 ? conselhos.join(' | ') : 'Conselhos em elaboração.',
      },
    ],
  };
}

/**
 * Gera as recomendações baseadas em todas as análises.
 */
function gerarRecomendacoes(data: ComprehensiveReportData): ComprehensiveRecommendation[] {
  const recomendacoes: ComprehensiveRecommendation[] = [];

  // Recomendações da Numerologia
  if (data.numerologia) {
    if (data.numerologia.destino) {
      recomendacoes.push({
        area: 'Numerologia',
        prioridade: 'alta',
        recomendacao: `Desenvolva as qualidades associadas ao número ${data.numerologia.destino}`,
        justificativa: 'O número de destino indica sua missão de vida e os aprendizados necessários para sua evolução.',
      });
    }
    if (data.numerologia.ciclos) {
      recomendacoes.push({
        area: 'Numerologia',
        prioridade: 'media',
        recomendacao: `Atente-se ao ciclo de ${data.numerologia.ciclos.sefirotAno} este ano`,
        justificativa: 'O ciclo anual atual traz oportunidades específicas que devem ser aproveitadas.',
      });
    }
  }

  // Recomendações da Astrologia
  if (data.astrologia) {
    recomendacoes.push({
      area: 'Astrologia',
      prioridade: 'alta',
      recomendacao: `Foque no autoconhecimento através do signo de ${data.astrologia.signos?.sol}`,
      justificativa: 'Conhecer profundamente seu signo permite utilizar suas energias de forma consciente.',
    });
  }

  // Recomendações do Odu
  if (data.odu) {
    if (data.odu.oduPrincipal?.preceitos && data.odu.oduPrincipal.preceitos.length > 0) {
      recomendacoes.push({
        area: 'Tradição de Ifá',
        prioridade: 'alta',
        recomendacao: 'Siga rigorosamente os preceitos do seu Odu',
        justificativa: 'Os preceitos são orientações sagradas para sua proteção e evolução espiritual.',
      });
    }
    if (data.odu.oduPrincipal?.ebos && data.odu.oduPrincipal.ebos.length > 0) {
      recomendacoes.push({
        area: 'Tradição de Ifá',
        prioridade: 'media',
        recomendacao: `Considere realizar os ebós recomendados: ${data.odu.oduPrincipal.ebos.slice(0, 2).join(', ')}`,
        justificativa: 'Os ebós são ferramentas espirituais para harmonização e proteção.',
      });
    }
  }

  // Adicionar recomendações gerais se não houver dados suficientes
  if (recomendacoes.length === 0) {
    recomendacoes.push({
      area: 'Geral',
      prioridade: 'alta',
      recomendacao: 'Mantenha práticas regulares de autoconhecimento',
      justificativa: 'O desenvolvimento pessoal contínuo é a base para uma vida equilibrada e realizada.',
    });
  }

  return recomendacoes;
}

/**
 * Gera a timeline/cronograma de influências.
 */
function gerarTimeline(data: ComprehensiveReportData): ComprehensiveTimelineItem[] {
  const timeline: ComprehensiveTimelineItem[] = [];
  const agora = new Date();

  // Timeline da Numerologia
  if (data.numerologia?.ciclos) {
    const ciclos = data.numerologia.ciclos;
    timeline.push({
      fase: 'Ciclo de Vida Atual',
      periodo: `${agora.getFullYear()} - ${agora.getFullYear() + 9}`,
      descricao: `Ciclo de ${ciclos.ano} (${ciclos.sefirotAno})`,
      orientacao: 'Este ciclo traz desafios relacionados à expressão pessoal e criatividade.',
    });

    if (ciclos.mes) {
      timeline.push({
        fase: 'Ciclo Mensal',
        periodo: `${agora.toLocaleDateString('pt-BR', { month: 'long' })}/${agora.getFullYear()}`,
        descricao: `Ciclo de ${ciclos.mes} (${ciclos.sefirotMes})`,
        orientacao: 'O foco deste mês está em questões emocionais e domesticas.',
      });
    }
  }

  // Timeline Astrológica (trânsitos)
  if (data.astrologia?.signos?.sol) {
    const signo = data.astrologia.signos.sol;
    timeline.push({
      fase: 'Trânsito Planetário Significativo',
      periodo: 'Próximos 6 meses',
      descricao: `Período de усиlenia para o signo de ${signo}`,
      orientacao: 'Momento propício para reflexões profundas e planejamento de longo prazo.',
    });
  }

  // Timeline do Odu
  if (data.odu?.oduPrincipal?.nome) {
    timeline.push({
      fase: 'Período de Odu',
      periodo: 'Jornada espiritual contínua',
      descricao: `Proteção e orientação de ${data.odu.oduPrincipal.nome}`,
      orientacao: 'Siga os preceitos e quizilas para manter a proteção espiritual ativa.',
    });
  }

  // Garantir pelo menos uma entrada
  if (timeline.length === 0) {
    timeline.push({
      fase: 'Ciclo de Integração',
      periodo: 'Mês atual',
      descricao: 'Período de harmonização geral',
      orientacao: 'Dedique tempo à meditação e autoconhecimento.',
    });
  }

  return timeline;
}

/**
 * Gera a seção de fechamento do relatório.
 */
function gerarFechamento(data: ComprehensiveReportData): GeneratedComprehensiveReport['fechamento'] {
  const nome = data.nome || 'Anônimo';

  return {
    mensagemFinal: `Prezado(a) ${nome}, este relatório foi elaborado com o objetivo de oferece-r-lhe ` +
      `uma visão integrada das diversas tradições esotéricas que podem auxiliar em seu ` +
      `desenvolvimento pessoal e espiritual. As orientações aqui presentes são ferramentas ` +
      `de reflexão e não determinam rigidmente seu destino, que permanece em suas próprias mãos.`,
    disclaimer: 'Este relatório tem caráter informativo e espiritual, não substituindo acompanhamento ' +
      'profissional nas áreas médica, psicológica ou jurídica. As interpretações são baseadas em ' +
      'tradições esotéricas milenares e devem ser utilizadas como auxiliares em sua jornada de autodescoberta.',
  };
}

/**
 * Formata a data de nascimento para exibição.
 */
function formatarData(data: string): string {
  if (!data) return 'Não informada';
  try {
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return data;
  }
}

export function exportComprehensiveToPDF(report: GeneratedComprehensiveReport): string {
  return JSON.stringify(report, null, 2);
}

export function exportComprehensiveToJSON(report: GeneratedComprehensiveReport): string {
  return JSON.stringify(report, null, 2);
}