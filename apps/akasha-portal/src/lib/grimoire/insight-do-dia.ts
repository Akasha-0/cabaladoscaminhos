/**
 * Insight do Dia — F-230
 *
 * Síntese integrada dos 5 Pilares em 1 insight curto + 1 prática.
 * Gera, a partir dos Pilares do dia, UM TÍTULO + UMA SÍNTESE + UMA PRÁTICA.
 * Determinístico: 2 usuários com mesmo mapa recebem mesmo insight.
 *
 * F-234 (futuro): usar este esqueleto como RAG para LLM Mentor redigir
 * versão mais rica mantendo a estrutura.
 */

import type {
  PilarDadosCabala,
  PilarDadosAstrologia,
  PilarDadosTantrica,
  PilarDadosOdu,
  PilarDadosIChing,
} from './significados-curados';

export interface PilaresCompletos {
  cabala: PilarDadosCabala;
  astrologia: PilarDadosAstrologia;
  tantrica: PilarDadosTantrica;
  odu: PilarDadosOdu;
  iching: PilarDadosIChing;
}

export interface InsightDoDia {
  titulo_curto: string;
  sintese: string;
  pratica_do_dia: string;
  pilares_destacados: ReadonlyArray<'cabala' | 'astrologia' | 'tantrica' | 'odu' | 'iching'>;
}

const TITULOS: ReadonlyArray<string> = [
  'Plantar com raiz',
  'Soltar com leveza',
  'Mover com ritmo',
  'Ver antes de falar',
  'Confiar no escuro',
  'Construir o invisível',
  'Colher o que cresce',
  'Acender o que serve',
];

const PRATICAS: Record<string, string> = {
  plantar:
    'Acenda 1 vela hoje. Escreva em 1 frase o que quer plantar nos próximos 14 dias. Olhe a vela 1 vez até o fim do dia.',
  agir: 'Faça 1 ato que você vem adiando. Pequeno. 5 min. Comece HOJE, não segunda.',
  colher:
    'Liste 3 coisas que deram certo nas últimas 2 semanas. Agradeça em voz alta. Solte 1 tensão específica.',
  soltar: 'Jogue fora 1 objeto hoje. 1 só. Sinta o espaço que abre. O soltar é tão importante quanto o plantar.',
};

const PRATICA_NEUTRA =
  'Sente 5 min em silêncio. Apenas sinta qual Pilar está mais vivo HOJE. Não force nada — apenas note.';

/** Hash determinístico dos Pilares (sempre mesmo mapa → mesmo insight). */
function pilarHash(p: PilaresCompletos): number {
  return (
    p.cabala.life_path +
    p.astrologia.lua_fase.length * 2 +
    (p.iching.hexagrama_dia ?? 0) * 3 +
    (typeof p.odu.odu_principal === 'string' ? p.odu.odu_principal.length : 0) * 5 +
    p.tantrica.corpo_predominante * 7
  );
}

function temaDoDia(p: PilaresCompletos): { tom: string; icone: string } {
  const lua = p.astrologia.lua_fase;
  if (lua === 'nova') return { tom: 'plantar', icone: '🌑' };
  if (lua === 'crescente') return { tom: 'agir', icone: '🌒' };
  if (lua === 'cheia') return { tom: 'colher', icone: '🌕' };
  return { tom: 'soltar', icone: '🌘' };
}

export function gerarInsightDoDia(p: PilaresCompletos): InsightDoDia {
  const hash = pilarHash(p);
  const tema = temaDoDia(p);
  const cabala = p.cabala;
  const astro = p.astrologia;
  const tantrica = p.tantrica;
  const odu = p.odu;
  const iching = p.iching;

  const titulo_curto = TITULOS[hash % TITULOS.length];

  const sintese =
    `Sua Cabala (Vida ${cabala.life_path}) pede ${tema.tom}, e o céu (${astro.sol_signo}, Lua ${astro.lua_fase}) confirma: ${tema.tom} é o movimento certo. ` +
    `O Odu ${odu.odu_principal} abre caminho; o hexagrama do dia (${iching.hexagrama_dia ?? '—'}) mostra o passo concreto. ` +
    `Seu Corpo ${tantrica.corpo_predominante} ancorará o que vier.`;

  const pratica_do_dia = PRATICAS[tema.tom] ?? PRATICA_NEUTRA;

  const pilares_destacados: InsightDoDia['pilares_destacados'] = ['cabala', 'astrologia', 'iching'];

  return {
    titulo_curto,
    sintese,
    pratica_do_dia,
    pilares_destacados,
  };
}
