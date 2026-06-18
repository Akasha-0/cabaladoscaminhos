/**
 * Significados Específicos por Pilar (F-222)
 *
 * Recebe os 5 Pilares (shape do core) e devolve 5 SignificadoCurado,
 * cada um referente ao SÍMBOLO ESPECÍFICO do Pilar (não visão genérica).
 * Ex.: life_path=11 → Significado "Iluminador"; sol_signo="Escorpião" →
 * "Sol em Escorpião". Fallback para visão genérica se símbolo ausente.
 *
 * Helper extraído de `significados-curados.ts` (F-222) para manter o
 * arquivo principal focado em dados curados.
 */
import type { Pilar, SignificadoCurado } from './significados-curados';
import { significadoGenericoDoPilar, significadoPorPilar } from './significados-curados';

// Shape mínimo dos 5 Pilares que o helper consome. Definido localmente
// para evitar acoplamento ao core — só precisa dos campos de id.
export interface PilarDadosCabala {
  life_path: number;
  birthday: number;
  expression: number;
  ano_pessoal: number;
}
export interface PilarDadosAstrologia {
  sol_signo: string;
  asc_signo: string | null;
  lua_signo: string;
  lua_fase: 'nova' | 'crescente' | 'cheia' | 'minguante';
  trinity: { sombra: number; dom: number; graca: number };
  trinity_dominante: 'sombra' | 'dom' | 'graca';
  // F-235 — Sexualidade (Lilith + Casa 8). Derivado do mapa astral real;
  // null quando a hora é desconhecida ou o stub é usado.
  lilith_signo: string | null;
  casa_8_signo: string | null;
}
export interface PilarDadosTantrica {
  corpo_predominante: number;
  trigemeo: 'fisico' | 'astral' | 'mental';
  temperamento_atual: 'sanguineo' | 'colerico' | 'melancolico' | 'fleumatico';
}
export interface PilarDadosOdu {
  odu_principal: string;
  odu_secundario: string | null;
  fonte: 'Ifá' | 'Candomblé';
}
export interface PilarDadosIChing {
  hexagrama_natal: number;
  hexagrama_dia: number;
  level: 'shadow' | 'gift' | 'siddhi';
}
export interface PilaresDados {
  cabala: PilarDadosCabala;
  astrologia: PilarDadosAstrologia;
  tantrica: PilarDadosTantrica;
  odu: PilarDadosOdu;
  iching: PilarDadosIChing;
}

/** Resolve 1 SignificadoCurado específico OU a visão genérica do Pilar. */
function resolverSignificado(pilar: Pilar, id: string | number): SignificadoCurado {
  return significadoPorPilar(pilar, id) ?? significadoGenericoDoPilar(pilar);
}

/** Devolve os 5 Significados específicos (1 por Pilar) para um mapa. */
export function significadosEspecificos(pilares: PilaresDados): {
  cabala: SignificadoCurado;
  astrologia: SignificadoCurado;
  tantrica: SignificadoCurado;
  odu: SignificadoCurado;
  iching: SignificadoCurado;
} {
  return {
    cabala: resolverSignificado('cabala', pilares.cabala.life_path),
    astrologia: resolverSignificado('astrologia', pilares.astrologia.sol_signo),
    tantrica: resolverSignificado('tantrica', pilares.tantrica.corpo_predominante),
    odu: resolverSignificado('odu', pilares.odu.odu_principal),
    iching: resolverSignificado('iching', pilares.iching.hexagrama_dia),
  };
}
