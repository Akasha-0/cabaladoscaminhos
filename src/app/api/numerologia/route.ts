import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// NUMEROLOGIA API - Cabala dos Caminhos
// ============================================================
// Endpoint for calculating numerology numbers
// ============================================================

// Pitagorean numerology: A=1, B=2, ... I=9, J=1, K=2, ...
const PITAGOREAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
  á: 1, à: 1, â: 1, ã: 1,
  é: 5, è: 5, ê: 5,
  í: 9, ì: 9, î: 9,
  ó: 6, ò: 6, ô: 6, õ: 6,
  ú: 3, ù: 3, û: 3,
  ç: 3,
  ' ': 0,
};

// Chaldean numerology: Different values
const CHALDEAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 1,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 3, t: 4, u: 6, v: 6, w: 6, x: 5, y: 1, z: 7,
  á: 1, à: 1, â: 1, ã: 1,
  é: 5, è: 5, ê: 5,
  í: 1, ì: 1, î: 1,
  ó: 6, ò: 6, ô: 6, õ: 6,
  ú: 6, ù: 6, û: 6,
  ç: 3,
  ' ': 0,
};

function reduzirNumero(num: number): number {
  while (num > 9 && ![11, 22, 33].includes(num)) {
    num = String(num).split('').reduce((a, b) => a + Number(b), 0);
  }
  return num;
}

function calcularPitagorica(nome: string): number {
  const valor = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split('')
    .reduce((acc, char) => acc + (PITAGOREAN_MAP[char] ?? 0), 0);
  return reduzirNumero(valor);
}

function calcularCabalistica(nome: string): number {
  const valor = nome
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split('')
    .reduce((acc, char) => acc + (CHALDEAN_MAP[char] ?? 0), 0);
  return reduzirNumero(valor);
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');
  const nome = searchParams.get('nome');

  const headers = new Headers();
  headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200');

  if (!nome) {
    return NextResponse.json(
      { error: 'Parâmetro "nome" é obrigatório' },
      { status: 400, headers }
    );
  }

  try {
    switch (tipo?.toLowerCase()) {
      case 'pitagorica':
        return NextResponse.json({
          tipo: 'pitagorica',
          numero: calcularPitagorica(nome),
          timestamp: new Date().toISOString()
        }, { headers });

      case 'cabalistica':
        return NextResponse.json({
          tipo: 'cabalistica',
          numero: calcularCabalistica(nome),
          timestamp: new Date().toISOString()
        }, { headers });

      case null:
      case 'todos':
        return NextResponse.json({
          tipo: 'todos',
          pitagorica: calcularPitagorica(nome),
          cabalistica: calcularCabalistica(nome),
          timestamp: new Date().toISOString()
        }, { headers });

      default:
        return NextResponse.json(
          { error: `Tipo "${tipo}" não reconhecido. Tipos disponíveis: pitagorica, cabalistica, todos` },
          { status: 400, headers }
        );
    }
  } catch (error) {
    console.error('Erro no cálculo de numerologia:', error);
    return NextResponse.json(
      { error: 'Erro ao processar cálculo numerológico' },
      { status: 500, headers }
    );
  }
}