/**
 * @akasha/core-iching — Cálculo do Mapa Natal de I-Ching
 *
 * Algoritmo determinístico de hexagrama natal (akasha.v0.0.4.trigramas-mod8):
 * - Trigrama superior = ((ano % 8) + (mês % 8)) % 8, com mapping 0→8.
 * - Trigrama inferior = ((dia % 8) + (bloco_horário % 8)) % 8, com mapping 0→8.
 * - Bloco horário I-Ching: 12 períodos de 2h (23-01=Rato, 01-03=Boi, ...).
 *   bloco = floor((hora + 1) / 2) % 12  →  bloco % 8 + 1.
 * - O hexagrama é então derivado de (upper × lower) via tabela King Wen.
 *
 * Importante (Doc 14 §2): o algoritmo é DETERMINÍSTICO, não historicamente
 * fiel a uma escola de I-Ching específica. O que importa é a estabilidade
 * da saída (mesma data → mesmo hexagrama) e a coerência interna entre
 * trigramas, linhas e numeração King Wen. A tradição oriental possui
 * múltiplas escolas; a Akasha escolhe uma forma simples e auditável.
 */
import { TRIGRAMS, getTrigram } from './bagua';
import { getHexagram } from './hexagrams';
import type { BuildIchingMapArgs, IChingMap, TrigramId } from './types';

const ALGO_TAG = 'akasha.v0.0.4.trigramas-mod8';

/** Mapeia um valor 0..N (após mod 8) para TrigramId 1..8 (0→8). */
function mod8ToTrigramId(n: number): TrigramId {
  const v = ((n % 8) + 8) % 8; // garante 0..7
  return (v === 0 ? 8 : v) as TrigramId;
}

/**
 * Bloco horário chinês (Shi Chen) — 12 períodos de 2 horas.
 * 23:00–01:00 = Rato (0), 01:00–03:00 = Boi (1), ... 21:00–23:00 = Porco (11).
 * Retorna 0..11. Para null/ausente, retorna -1.
 */
function chineseHourBlock(hour: number | null | undefined): number {
  if (hour == null || !Number.isInteger(hour) || hour < 0 || hour > 23) {
    return -1;
  }
  return Math.floor((hour + 1) / 2) % 12;
}

/** Tenta interpretar YYYY-MM-DD ou ISO datetime. Retorna Date ou null. */
function parseBirthDate(input: string | Date): Date | null {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input;
  }
  if (typeof input !== 'string') return null;
  // Aceita 'YYYY-MM-DD' ou prefixo ISO ('YYYY-MM-DDTHH:MM:SS')
  const m = input.match(/^(\d{4})-(\d{2})-(\d{2})(?:T.*)?$/);
  if (!m) return null;
  const year = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  const d = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Interpreta HH:MM e retorna a hora inteira 0-23, ou null. */
function parseBirthHour(input: string | null | undefined): number | null {
  if (!input) return null;
  const m = input.match(/^(\d{1,2})(?::\d{2})?$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  if (h < 0 || h > 23) return null;
  return h;
}

/**
 * Calcula o mapa natal de I-Ching. Cacheado no cadastro (Doc 09 §5.3).
 *
 * @example
 *   buildIchingMap({ birthDate: '1980-05-15', birthTime: '14:30' })
 */
export function buildIchingMap(args: BuildIchingMapArgs): IChingMap {
  const dt = parseBirthDate(args.birthDate);
  if (!dt) {
    // Retorna mapa "vazio" com hexagramNumber: null em vez de throwar —
    // permite que camadas superiores tratem a falha sem try/catch.
    return {
      hexagramNumber: null,
      hexagramName: null,
      hexagramChineseName: null,
      upperTrigram: null,
      lowerTrigram: null,
      upperTrigramName: null,
      lowerTrigramName: null,
      lines: [],
      aspects: [],
      birthDate: null,
      birthTime: null,
      algorithm: ALGO_TAG,
      provisional: true,
      error: `birthDate inválida: ${String(args.birthDate)}`,
    } as IChingMap;
  }
  const year = dt.getUTCFullYear();
  const month = dt.getUTCMonth() + 1; // 1-12
  const day = dt.getUTCDate(); // 1-31

  const hour = parseBirthHour(args.birthTime ?? null);
  const provisional = hour == null;

  // Algoritmo determinístico (mod 8 com mapping 0→8):
  const upperRaw = (year % 8) + (month % 8);
  const dayPart = day % 8;
  const hourBlock = hour == null ? 0 : chineseHourBlock(hour);
  const lowerRaw = dayPart + hourBlock;

  const upperId: TrigramId = mod8ToTrigramId(upperRaw);
  const lowerId: TrigramId = mod8ToTrigramId(lowerRaw);

  // Mapeamento direto upper×lower → 1..64 (cobre todas as 64 combinações).
  // A tabela King Wen é a SEQUÊNCIA; aqui derivamos o número pelo par
  // (upper, lower) — único para cada combinação possível.
  const hexNumber = ((upperId - 1) * 8 + lowerId) as
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12
    | 13
    | 14
    | 15
    | 16
    | 17
    | 18
    | 19
    | 20
    | 21
    | 22
    | 23
    | 24
    | 25
    | 26
    | 27
    | 28
    | 29
    | 30
    | 31
    | 32
    | 33
    | 34
    | 35
    | 36
    | 37
    | 38
    | 39
    | 40
    | 41
    | 42
    | 43
    | 44
    | 45
    | 46
    | 47
    | 48
    | 49
    | 50
    | 51
    | 52
    | 53
    | 54
    | 55
    | 56
    | 57
    | 58
    | 59
    | 60
    | 61
    | 62
    | 63
    | 64;
  const hex = getHexagram(hexNumber);

  const upperTri = getTrigram(upperId);
  const lowerTri = getTrigram(lowerId);

  return {
    hexagramNumber: hex.number,
    hexagramName: hex.name,
    hexagramChineseName: hex.chineseName,
    upperTrigram: upperId,
    lowerTrigram: lowerId,
    upperTrigramName: upperTri.name,
    lowerTrigramName: lowerTri.name,
    lines: [...hex.lines],
    aspects: [...hex.aspects],
    birthDate: `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    birthTime: hour == null ? null : `${hour.toString().padStart(2, '0')}:00`,
    algorithm: ALGO_TAG,
    provisional,
  };
}

/** Re-exporta utilitários de bagua e hexagramas para conveniência. */
export { TRIGRAMS, getTrigram };
export { HEXAGRAMS, getHexagram, getAllHexagrams } from './hexagrams';
