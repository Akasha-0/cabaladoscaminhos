/**
 * @akasha/core — Akasha Core Algorithm v1 (R-030 prototype)
 *
 * Orquestrador puro (sem persistência, sem LLM).
 * Recebe 1 pessoa → emite 5 saídas de Pilar + 1 Mandala (resumo)
 * + 1 Mandato diário (esqueleto) + 1 hook de Mentor.
 *
 * Referência: .autonomous/research/synthesis/synthesis_v1.md §5
 */

import { z } from 'zod';

// ─── Schemas Zod (R-030 spec) ───────────────────────────────────────────────

export const AkashaInputSchema = z.object({
  nome: z.string().min(1, 'nome obrigatório'),
  data_nascimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'ISO YYYY-MM-DD'),
  hora_nascimento: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'ISO HH:MM')
    .optional(),
  local_nascimento: z.string().min(1, 'local obrigatório'),
  intencao_inicial: z.string().min(1, 'intenção obrigatória'),
});

export type AkashaInput = z.infer<typeof AkashaInputSchema>;

// ─── Tipos de saída por Pilar ────────────────────────────────────────────────

export interface PilarCabala {
  life_path: number;
  birthday: number;
  expression: number;
  ano_pessoal: number;
}

export interface PilarAstrologia {
  sol_signo: string;
  asc_signo: string | null;
  lua_signo: string;
  lua_fase: 'nova' | 'crescente' | 'cheia' | 'minguante';
  hora_desconhecida: boolean;
}

export interface PilarTantrica {
  corpo_predominante: number;
  trigemeo: 'fisico' | 'astral' | 'mental';
  ciclo_anos: number;
}

export interface PilarOdu {
  odu_principal: string;
  odu_secundario: string | null;
  fonte: 'Ifá' | 'Candomblé';
  aviso: 'requer consentimento + terreiro';
}

export interface PilarIChing {
  hexagrama_natal: number;
  hexagrama_dia: number;
  level: 'shadow' | 'gift' | 'siddhi';
}

export interface MandalaResumo {
  pilares_presentes: string[];
  pilares_ausentes: string[];
  camadas_temporais: ('D' | 'S' | 'Z' | 'V')[];
}

export interface MandatoEsqueleto {
  escala: 'D' | 'S' | 'Z' | 'V';
  pilares_relevantes: string[];
  redacao_bruta: string;
  cita_fontes: string[];
}

export interface AkashaLeitura {
  input_normalizado: AkashaInput;
  pilares: {
    cabala: PilarCabala;
    astrologia: PilarAstrologia;
    tantrica: PilarTantrica;
    odu: PilarOdu;
    iching: PilarIChing;
  };
  mandala: MandalaResumo;
  mandato: MandatoEsqueleto;
  mentor_hook: {
    intencao: string;
    crise_detectada: boolean;
    recurso: 'CVV-188' | 'mentor_normal' | null;
  };
}

// ─── Limites éticos (R-022 §5.5-5.6) ─────────────────────────────────────────

const CRISE_REGEX = /\b(suicid|morrer|matar|automutil|desesper[oa]|não aguento|não quero mais viver)\b/i;

function detectarCrise(intencao: string): boolean {
  return CRISE_REGEX.test(intencao);
}

// ─── Engines reais (lazy import, Fase 6 integra) ────────────────────────────

async function loadEngines() {
  // Fase 6 integra engines reais; Fase 5 só valida o shape.
  const cabala = await import('@akasha/core-cabala').catch(() => null);
  const astro = await import('@akasha/core-astrology').catch(() => null);
  const tantra = await import('@akasha/core-tantra').catch(() => null);
  const odu = await import('@akasha/core-odus').catch(() => null);
  const iching = await import('@akasha/core-iching').catch(() => null);
  return { cabala, astro, tantra, odu, iching };
}

// ─── Stubs determinísticos (Fase 5; reais na Fase 6) ────────────────────────

function stubPilar1Cabala(input: AkashaInput): PilarCabala {
  const [y, m, d] = input.data_nascimento.split('-').map(Number);
  const reduzir = (n: number): number => {
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce((a, c) => a + Number(c), 0);
    }
    return n;
  };
  const anoBase = new Date().getFullYear();
  const aniversario = new Date(input.data_nascimento);
  const anoPessoalBase = anoBase + aniversario.getMonth() + aniversario.getDate();
  return {
    life_path: reduzir(y + m + d),
    birthday: reduzir(d),
    expression: reduzir(input.nome.replace(/\s/g, '').length),
    ano_pessoal: reduzir(anoPessoalBase),
  };
}

function stubPilar2Astrologia(input: AkashaInput): PilarAstrologia {
  const [, m, d] = input.data_nascimento.split('-').map(Number);
  const signos = [
    'capricornio', 'aquario', 'peixes', 'aries', 'touro', 'gemeos',
    'cancer', 'leao', 'virgem', 'libra', 'escorpiao', 'sagitario',
  ];
  const sol = signos[(m - 1) % 12];
  const base = new Date('2000-01-06').getTime();
  const dias = (new Date(input.data_nascimento).getTime() - base) / 86400000;
  const faseIdx = ((dias % 29.53) / 29.53) * 4;
  const fases: PilarAstrologia['lua_fase'][] = ['nova', 'crescente', 'cheia', 'minguante'];
  return {
    sol_signo: sol,
    asc_signo: input.hora_nascimento ? signos[(d - 1) % 12] : null,
    lua_signo: signos[Math.floor((d + 7) % 12)],
    lua_fase: fases[Math.floor(faseIdx) % 4],
    hora_desconhecida: !input.hora_nascimento,
  };
}

function stubPilar3Tantrica(input: AkashaInput): PilarTantrica {
  const [y, m, d] = input.data_nascimento.split('-').map(Number);
  const corpo = (((y + m + d) % 11) + 1);
  const trigemeo: PilarTantrica['trigemeo'] =
    corpo <= 4 ? 'fisico' : corpo <= 8 ? 'astral' : 'mental';
  const idade = new Date().getFullYear() - y;
  const proximoCiclo = Math.ceil(idade / 7) * 7;
  return { corpo_predominante: corpo, trigemeo, ciclo_anos: proximoCiclo };
}

function stubPilar4Odu(input: AkashaInput): PilarOdu {
  const odus16 = [
    'Ogbe', 'Oyeku', 'Iwori', 'Odi', 'Irosun', 'Owonrin',
    'Obara', 'Okanran', 'Ogunda', 'Osa', 'Ika', 'Oturupon',
    'Otura', 'Irete', 'Ofun', 'Ose',
  ];
  const [y, m, d] = input.data_nascimento.split('-').map(Number);
  const idx = (y + m + d) % 16;
  return {
    odu_principal: odus16[idx],
    odu_secundario: null,
    fonte: 'Ifá',
    aviso: 'requer consentimento + terreiro',
  };
}

function stubPilar5IChing(_input: AkashaInput): PilarIChing {
  const hoje = new Date();
  const start = new Date(hoje.getFullYear(), 0, 0);
  const dia = Math.floor((hoje.getTime() - start.getTime()) / 86400000);
  return {
    hexagrama_natal: ((dia % 64) + 1),
    hexagrama_dia: (((dia + 1) % 64) + 1),
    level: 'gift',
  };
}

// ─── Detectar escala temporal (D/S/Z/V) ─────────────────────────────────────

function detectarEscala(agora: Date): 'D' | 'S' | 'Z' | 'V' {
  const hora = agora.getHours();
  const dia = agora.getDay();
  const m = agora.getMonth() + 1;
  const d = agora.getDate();
  if ((m === 3 && d >= 19 && d <= 22) || (m === 6 && d >= 20 && d <= 23) ||
      (m === 9 && d >= 21 && d <= 24) || (m === 12 && d >= 20 && d <= 23)) {
    return 'Z';
  }
  if (dia === 1 && hora < 8) return 'S';
  return 'D';
}

// ─── Função pura principal: akasha.calcular() ────────────────────────────────

export async function calcular(input: AkashaInput): Promise<AkashaLeitura> {
  const parsed = AkashaInputSchema.parse(input);
  await loadEngines();
  const cabala = stubPilar1Cabala(parsed);
  const astrologia = stubPilar2Astrologia(parsed);
  const tantrica = stubPilar3Tantrica(parsed);
  const odu = stubPilar4Odu(parsed);
  const iching = stubPilar5IChing(parsed);
  const mandala: MandalaResumo = {
    pilares_presentes: ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'],
    pilares_ausentes: [],
    camadas_temporais: ['D', 'S', 'Z', 'V'],
  };
  const escala = detectarEscala(new Date());
  const relevantesPorEscala: Record<typeof escala, string[]> = {
    D: ['astrologia', 'iching', 'cabala'],
    S: ['astrologia', 'odu', 'tantrica'],
    Z: ['astrologia', 'tantrica', 'cabala'],
    V: ['cabala', 'astrologia', 'tantrica', 'odu', 'iching'],
  };
  const relevantes = relevantesPorEscala[escala];
  const citaFontes: Record<string, string> = {
    cabala: 'Pilar 1, Gematria (Sefer Yetzirah)',
    astrologia: 'Pilar 2, Astrologia (Whole Sign, Brennan 2017)',
    tantrica: 'Pilar 3, Tantra (tradição hindu, 11 corpos)',
    odu: 'Pilar 4, Ifá (axé/terreiro, 16 Odu)',
    iching: 'Pilar 5, I Ching (Wilhelm/Baynes 1950)',
  };
  const mandato: MandatoEsqueleto = {
    escala,
    pilares_relevantes: relevantes,
    redacao_bruta: `[${escala}] Pilares: ${relevantes.join(', ')}. ` +
      `Lua ${astrologia.lua_fase}, hex ${iching.hexagrama_dia}, ` +
      `vida ${cabala.life_path}. (LLM redige 3 frases + 1 pergunta + 1 micro-ritual.)`,
    cita_fontes: relevantes.map((p) => citaFontes[p] ?? p),
  };
  const crise = detectarCrise(parsed.intencao_inicial);
  return {
    input_normalizado: parsed,
    pilares: { cabala, astrologia, tantrica, odu, iching },
    mandala,
    mandato,
    mentor_hook: {
      intencao: parsed.intencao_inicial,
      crise_detectada: crise,
      recurso: crise ? 'CVV-188' : null,
    },
  };
}
