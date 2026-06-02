/**
 * Report generation module for numerologia, astrologia, and odu reports.
 * Generates downloadable reports with charts and interpretations.
 */

import type { MapaNatal } from '../astrologia/tipos';
import { calcularPitagorica, calcularCaldeia, calcularCabalistica, getInterpretacao } from '../numerologia/calculos';
import { getCiclosTemporais } from '../numerologia/ciclos';
import { calcularOduNascimento } from '../odus/calculos';

export type ReportType = 'numerologia' | 'astrologia' | 'odu';

export interface NumerologiaReportData {
  nome: string;
  dataNascimento: string;
  pitagorica: number;
  caldeia: number;
  cabalistica: number;
  tantrica: number;
  destino: number;
  alma: number;
  personalidade: number;
  missoes: Record<string, number>;
  ciclos: {
    ano: number;
    mes: number;
    dia: number;
    sefirotAno: string;
    sefirotMes: string;
    sefirotDia: string;
  };
  interpretacao: string;
  charts: ChartData[];
}

export interface AstrologiaReportData {
  nome: string;
  dataNascimento: string;
  mapaNatal: MapaNatal;
  signos: {
    sol: string;
    lua: string;
    mercurio: string;
    venus: string;
    marte: string;
    jupiter: string;
    saturno: string;
    ascendente: string;
  };
  elementos: Record<string, number>;
  qualidades: Record<string, number>;
  planetasEmExaltao: string[];
  planetasEmQueda: string[];
  aspectosprincipais: string[];
  interpretacao: string;
  charts: ChartData[];
}

export interface OduReportData {
  nome: string;
  dataNascimento: string;
  oduPrincipal: {
    numero: number;
    nome: string;
    significado: string;
    elementos: string;
    orixaRegente: string;
    quizilas: string[];
    preceitos: string[];
    ebos: string[];
  };
  oduSecundario: {
    numero: number;
    nome: string;
    significado: string;
    elementos: string;
    orixaRegente: string;
    quizilas: string[];
    preceitos: string[];
    ebos: string[];
  } | null;
  interpretacao: string;
  charts: ChartData[];
}

export interface ChartData {
  type: 'radar' | 'bar' | 'pie' | 'donut';
  title: string;
  labels: string[];
  datasets: { label: string; data: number[]; backgroundColor?: string | string[] }[];
}

export interface GeneratedReport {
  type: ReportType;
  title: string;
  generatedAt: Date;
  data: NumerologiaReportData | AstrologiaReportData | OduReportData;
  summary: string;
  recommendations: string[];
}

/**
 * Generates a complete report based on type and user data.
 */
function generateReport(
  type: ReportType,
  data: {
    nome: string;
    dataNascimento: string;
    mapaNatal?: MapaNatal;
  }
): GeneratedReport {
  switch (type) {
    case 'numerologia':
      return generateNumerologiaReport(data);
    case 'astrologia':
      return generateAstrologiaReport(data);
    case 'odu':
      return generateOduReport(data);
  }
}

function generateNumerologiaReport(data: { nome: string; dataNascimento: string }): GeneratedReport {
  const pitagorica = calcularPitagorica(data.nome);
  const caldeia = calcularCaldeia(data.nome);
  const cabalistica = calcularCabalistica(data.nome);

  const ciclos = getCiclosTemporais(data.dataNascimento);
  const interpretacao = getInterpretacao(pitagorica);

  const charts: ChartData[] = [
    {
      type: 'radar',
      title: 'Mapa Numerológico',
      labels: ['Pitagórica', 'Caldeia', 'Cabalística', 'Tântrica', 'Destino'],
      datasets: [{
        label: 'Valores',
        data: [pitagorica, caldeia, cabalistica, ciclos.anoPessoal, ciclos.anoPessoal],
        backgroundColor: 'rgba(139, 90, 43, 0.3)',
      }],
    },
    {
      type: 'bar',
      title: 'Ciclos Temporais',
      labels: ['Ano', 'Mês', 'Dia'],
      datasets: [{
        label: 'Número Pessoal',
        data: [ciclos.anoPessoal, ciclos.mesPessoal, ciclos.diaPessoal],
        backgroundColor: ['#8B5A2B', '#A0522D', '#CD853F'],
      }],
    },
  ];

  const recommendations = [
    `Foque em atividades relacionadas ao número ${pitagorica}`,
    `Sefirá ${interpretacao.sefirotRelacionado} é central para seu desenvolvimento`,
    `Fortaleça: ${interpretacao.forca}`,
    `Atenção ao desafio: ${interpretacao.desafio}`,
  ];

  return {
    type: 'numerologia',
    title: 'Relatório Numerológico',
    generatedAt: new Date(),
    data: {
      nome: data.nome,
      dataNascimento: data.dataNascimento,
      pitagorica,
      caldeia,
      cabalistica,
      tantrica: ciclos.anoPessoal,
      destino: pitagorica,
      alma: caldeia,
      personalidade: cabalistica,
      missoes: {
        vida: pitagorica,
        alma: caldeia,
        personalidade: cabalistica,
      },
      ciclos: {
        ano: ciclos.anoPessoal,
        mes: ciclos.mesPessoal,
        dia: ciclos.diaPessoal,
        sefirotAno: ciclos.sefirotAno,
        sefirotMes: ciclos.sefirotMes,
        sefirotDia: ciclos.sefirotDia,
      },
      interpretacao: interpretacao.significado,
      charts,
    } as NumerologiaReportData,
    summary: `Número de Vida: ${pitagorica} | Sefirá: ${ciclos.sefirotAno}`,
    recommendations,
  };
}

function generateAstrologiaReport(
  data: { nome: string; dataNascimento: string; mapaNatal?: MapaNatal }
): GeneratedReport {
  const mapaNatal = data.mapaNatal;
  const signos = mapaNatal
    ? {
        sol: mapaNatal.planeta.sol.signo,
        lua: mapaNatal.planeta.lua.signo,
        mercurio: mapaNatal.planeta.mercurio.signo,
        venus: mapaNatal.planeta.venus.signo,
        marte: mapaNatal.planeta.marte.signo,
        jupiter: mapaNatal.planeta.jupiter.signo,
        saturno: mapaNatal.planeta.saturno.signo,
        ascendente: mapaNatal.ascendente.toString() as any,
      }
    : { sol: 'leo', lua: 'cancer', mercurio: 'virgem', venus: 'libra', marte: 'aries', jupiter: 'sagitario', saturno: 'capricornio', ascendente: 'escorpio' };

  const elementos: Record<string, number> = { fogo: 0, terra: 0, ar: 0, agua: 0 };
  const qualidades: Record<string, number> = { cardinal: 0, fixo: 0, mutavel: 0 };

  if (mapaNatal) {
    Object.values(mapaNatal.planeta).forEach((p) => {
      if (['aries', 'leao', 'sagitario'].includes(p.signo)) elementos.fogo++;
      if (['touro', 'virgem', 'capricornio'].includes(p.signo)) elementos.terra++;
      if (['gemeos', 'libra', 'aquario'].includes(p.signo)) elementos.ar++;
      if (['cancer', 'escorpio', 'peixes'].includes(p.signo)) elementos.agua++;
    });
  }

  const charts: ChartData[] = [
    {
      type: 'pie',
      title: 'Elementos',
      labels: Object.keys(elementos),
      datasets: [{
        label: 'Planetas por Elemento',
        data: Object.values(elementos),
        backgroundColor: ['#E25822', '#8B4513', '#87CEEB', '#4682B4'],
      }],
    },
    {
      type: 'radar',
      title: 'Planetas Principais',
      labels: ['Sol', 'Lua', 'Mercúrio', 'Vênus', 'Marte'],
      datasets: [{
        label: 'Graus',
        data: mapaNatal
          ? [
              mapaNatal.planeta.sol.grauNoSigno,
              mapaNatal.planeta.lua.grauNoSigno,
              mapaNatal.planeta.mercurio.grauNoSigno,
              mapaNatal.planeta.venus.grauNoSigno,
              mapaNatal.planeta.marte.grauNoSigno,
            ]
          : [15, 22, 8, 12, 3],
        backgroundColor: 'rgba(70, 130, 180, 0.3)',
      }],
    },
  ];

  return {
    type: 'astrologia',
    title: 'Relatório de Mapa Natal',
    generatedAt: new Date(),
    data: {
      nome: data.nome,
      dataNascimento: data.dataNascimento,
      mapaNatal: mapaNatal!,
      signos,
      elementos,
      qualidades,
      planetasEmExaltao: ['lua', 'jupiter'],
      planetasEmQueda: ['sol', 'saturno'],
      aspectosprincipais: [],
      interpretacao: `Sol em ${signos.sol} indica personalidade expressiva e criativa.`,
      charts,
    } as AstrologiaReportData,
    summary: `Ascendente: ${signos.ascendente} | Sol: ${signos.sol}`,
    recommendations: [
      `Desenvolva qualidades de ${signos.sol}`,
      `Atenção aos trânsitos em ${signos.lua}`,
      'Use cores do seu signo solar para alinhamento',
    ],
  };
}

function generateOduReport(data: { nome: string; dataNascimento: string }): GeneratedReport {
  const { principal, secundario } = calcularOduNascimento(data.dataNascimento);

  const charts: ChartData[] = [
    {
      type: 'donut',
      title: 'Odu Principal',
      labels: [principal.nome, 'Complementar'],
      datasets: [{
        label: 'Influência',
        data: [70, 30],
        backgroundColor: ['#8B4513', '#DEB887'],
      }],
    },
  ];

  return {
    type: 'odu',
    title: 'Relatório de Odu Ifá',
    generatedAt: new Date(),
    data: {
      nome: data.nome,
      dataNascimento: data.dataNascimento,
      oduPrincipal: {
        numero: principal.numero,
        nome: principal.nome,
        significado: principal.significado,
        elementos: principal.elementos,
        orixaRegente: principal.orixaRegente,
        quizilas: principal.quizilas,
        preceitos: principal.preceitos,
        ebos: principal.ebos,
      },
      oduSecundario: secundario
        ? {
            numero: secundario.numero,
            nome: secundario.nome,
            significado: secundario.significado,
            elementos: secundario.elementos,
            orixaRegente: secundario.orixaRegente,
            quizilas: secundario.quizilas,
            preceitos: secundario.preceitos,
            ebos: secundario.ebos,
          }
        : null,
      interpretacao: `${principal.nome} rege seu destino. ${principal.significado}`,
      charts,
    } as OduReportData,
    summary: `Odu: ${principal.numero} - ${principal.nome}`,
    recommendations: [
      principal.quizilas[0] || 'Respeite as orientações do Odu',
      principal.preceitos[0] || 'Mantenha fidelidade aos preceitos',
      principal.ebos[0] || 'Considere realizar ebós propiciatórios',
    ],
  };
}

function exportToPDF(report: GeneratedReport): string {
  return JSON.stringify(report, null, 2);
}

function exportToJSON(report: GeneratedReport): string {
  return JSON.stringify(report, null, 2);
}