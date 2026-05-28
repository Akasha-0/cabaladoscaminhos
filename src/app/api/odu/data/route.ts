// src/app/api/odu/data/route.ts
// Odu API - skip linting

import { NextRequest, NextResponse } from 'next/server';
import {
  oduData,
  getOdus,
  getOduByNumero,
  getOduByNome,
  getAllQuizilas,
  getAllEbós,
  getAllOrixas
} from '@/lib/ifa/odu-data';

// ============================================================
// TYPES
// ============================================================

export type OduQuery = {
  numero?: number;
  nome?: string;
  orixa?: string;
  elemento?: string;
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function filterOdus(query: OduQuery) {
  let results = [...oduData];

  if (query.numero !== undefined) {
    results = results.filter(o => o.numero === query.numero);
  }

  if (query.nome) {
    const nomeLower = query.nome.toLowerCase();
    results = results.filter(o => o.nome.toLowerCase().includes(nomeLower));
  }

  if (query.orixa) {
    const orixaLower = query.orixa.toLowerCase();
    results = results.filter(o =>
      o.orixas.some(orixa => orixa.toLowerCase().includes(orixaLower))
    );
  }

  if (query.elemento) {
    const elementoLower = query.elemento.toLowerCase();
    results = results.filter(o =>
      o.elementos.toLowerCase().includes(elementoLower)
    );
  }

  return results;
}

function getOrixas(): { orixa: string; oduCount: number }[] {
  const orixaMap = new Map<string, number>();

  oduData.forEach(odu => {
    odu.orixas.forEach(orixa => {
      orixaMap.set(orixa, (orixaMap.get(orixa) || 0) + 1);
    });
  });

  return Array.from(orixaMap.entries())
    .map(([orixa, oduCount]) => ({ orixa, oduCount }))
    .sort((a, b) => b.oduCount - a.oduCount);
}

function getElementos(): { elemento: string; oduCount: number }[] {
  const elementoMap = new Map<string, number>();

  oduData.forEach(odu => {
    odu.elementos.split('/').forEach(el => {
      const trimmed = el.trim();
      elementoMap.set(trimmed, (elementoMap.get(trimmed) || 0) + 1);
    });
  });

  return Array.from(elementoMap.entries())
    .map(([elemento, oduCount]) => ({ elemento, oduCount }))
    .sort((a, b) => b.oduCount - a.oduCount);
}

// ============================================================
// API ROUTE HANDLERS
// ============================================================

/**
 * GET /api/odu/data
 * Retrieve odu data with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tipo = searchParams.get('tipo');
  const numero = searchParams.get('numero');
  const nome = searchParams.get('nome');
  const orixa = searchParams.get('orixa');
  const elemento = searchParams.get('elemento');

  try {
    // Return all odus
    if (tipo === 'todos') {
      return NextResponse.json({
        odus: getOdus(),
        total: oduData.length,
        timestamp: new Date().toISOString()
      });
    }

    // Return single odu by numero
    if (numero) {
      const num = parseInt(numero, 10);
      const odu = getOduByNumero(num);
      if (!odu) {
        return NextResponse.json(
          { error: `Odú com número ${num} não encontrado` },
          { status: 404 }
        );
      }
      return NextResponse.json({ odu });
    }

    // Return single odu by nome
    if (nome) {
      const odu = getOduByNome(nome);
      if (!odu) {
        return NextResponse.json(
          { error: `Odú com nome "${nome}" não encontrado` },
          { status: 404 }
        );
      }
      return NextResponse.json({ odu });
    }

    // Return all quizilas
    if (tipo === 'quizilas') {
      return NextResponse.json({
        quizilas: getAllQuizilas(),
        total: getAllQuizilas().length,
        timestamp: new Date().toISOString()
      });
    }

    // Return all ebos
    if (tipo === 'ebos') {
      return NextResponse.json({
        ebos: getAllEbós(),
        total: oduData.length,
        timestamp: new Date().toISOString()
      });
    }

    // Return all orixas
    if (tipo === 'orixas') {
      return NextResponse.json({
        orixas: getOrixas(),
        total: getOrixas().length,
        timestamp: new Date().toISOString()
      });
    }

    // Return all elementos
    if (tipo === 'elementos') {
      return NextResponse.json({
        elementos: getElementos(),
        total: getElementos().length,
        timestamp: new Date().toISOString()
      });
    }

    // Filter odus by query params
    const query: OduQuery = {};
    if (orixa) query.orixa = orixa;
    if (elemento) query.elemento = elemento;

    if (orixa || elemento) {
      const filtered = filterOdus(query);
      return NextResponse.json({
        odus: filtered,
        total: filtered.length,
        timestamp: new Date().toISOString()
      });
    }

    // Default: return all odus
    return NextResponse.json({
      odus: getOdus(),
      total: oduData.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao processar Odú:', error);
    return NextResponse.json(
      { error: 'Erro ao processar dados de Odú' },
      { status: 500 }
    );
  }
}