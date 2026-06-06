import { calcularPosicao, calcularCasas, normalizeDegrees } from '../swiss-ephemeris';
import type { MapaNatal, PosicaoPlaneta, Planeta } from '../tipos';
const PLANETAS_PRINCIPAIS: Planeta[] = [
  'sol', 'lua', 'mercurio', 'venus', 'marte',
  'jupiter', 'saturno', 'urano', 'netuno', 'plutao'
];

export function calcularMapaNatal(
  dataNascimento: Date,
  horaNascimento: string,
  latitude: number,
  longitude: number
): MapaNatal {
  const [horas, minutos] = horaNascimento.split(':').map(Number);
  const dataHora = new Date(dataNascimento);
  dataHora.setHours(horas, minutos, 0, 0);

  const { casas, ascendente, mediumCoeli } = calcularCasas(dataHora, latitude, longitude);

  const posicoes: Partial<Record<keyof MapaNatal['planeta'], PosicaoPlaneta>> = {};

  for (const planeta of PLANETAS_PRINCIPAIS) {
    const posicao = calcularPosicao(planeta, dataHora);
    posicao.casa = determinarCasa(posicao.longitude, casas);
    posicoes[planeta] = posicao;
  }

  const luaPosicao = posicoes['lua'];
  if (!luaPosicao) {
    throw new Error('Lua position not calculated');
  }

  const nodeNorte = calcularPosicao('node_norte', dataHora);
  nodeNorte.planeta = 'node_norte';
  nodeNorte.longitude = luaPosicao.longitude;

  const nodeSul = calcularPosicao('node_sul', dataHora);
  nodeSul.planeta = 'node_sul';
  nodeSul.longitude = normalizeDegrees(nodeNorte.longitude + 180);

  const planetasCompleto: MapaNatal['planeta'] = {
    sol: posicoes['sol']!,
    lua: posicoes['lua']!,
    mercurio: posicoes['mercurio']!,
    venus: posicoes['venus']!,
    marte: posicoes['marte']!,
    jupiter: posicoes['jupiter']!,
    saturno: posicoes['saturno']!,
    urano: posicoes['urano']!,
    netuno: posicoes['netuno']!,
    plutao: posicoes['plutao']!,
  };

  return {
    usuarioId: '',
    dataCalculo: new Date(),
    planeta: planetasCompleto,
    casas,
    ascendente,
    mediumCoeli,
    nodes: {
      norte: nodeNorte,
      sul: nodeSul,
    },
  };
}

function determinarCasa(longitude: number, casas: { grauNoSigno: number }[]): number {
  for (let i = 0; i < 12; i++) {
    const casaStart = casas[i].grauNoSigno;
    const casaEnd = casas[(i + 1) % 12].grauNoSigno;

    if (casaEnd > casaStart) {
      if (longitude >= casaStart && longitude < casaEnd) return i + 1;
    } else {
      if (longitude >= casaStart || longitude < casaEnd) return i + 1;
    }
  }
  return 1;
}