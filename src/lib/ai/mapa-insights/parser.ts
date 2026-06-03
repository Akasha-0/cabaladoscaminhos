import type { InsightData } from './types';
import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

const REQUIRED_FIELDS = ['resumo', 'proposito', 'dons', 'desafios'] as const;

// AI response may contain these fields in addition to POI format
interface AIResponseFields {
  resumo?: string;
  proposito?: string;
  dons?: InsightData['dons'];
  desafios?: InsightData['desafios'];
  preceitos?: InsightData['preceitos'];
  praticas?: InsightData['praticas'];
  orixas?: InsightData['orixas'];
  ciclos?: InsightData['ciclos'];
  mensagemSemanal?: string;
  titulo?: string;
  overview?: string;
}

/**
 * Parse AI JSON response into InsightData
 * Returns partial data on parse error with error field filled
 */
export function parseInsightResponse(raw: string): InsightData {
  const json = extractJson(raw);
  const data = JSON.parse(json) as AIResponseFields;

  // Validate required fields
  for (const field of REQUIRED_FIELDS) {
    if (!data[field as keyof AIResponseFields]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Add id and timestamp
  const result = {
    id: crypto.randomUUID(),
    dataGeracao: new Date().toISOString(),
    titulo: data.titulo || data.overview || 'Mapa da Alma',
    overview: data.overview || '',
    resumo: data.resumo!,
    proposito: data.proposito!,
    coração: { tema: '', descricao: '', sistemas: [] },
    mente: { tema: '', descricao: '', sistemas: [] },
    corpo: { tema: '', descricao: '', sistemas: [] },
    caminho: { tema: '', descricao: '', sistemas: [] },
    retorno: { tema: '', descricao: '', sistemas: [] },
    convergencias: { triplices: [], duplas: [] },
    dons: data.dons ?? [],
    desafios: data.desafios ?? [],
  } as unknown as InsightData;
  // Default optional fields to empty arrays
  if (!result.preceitos) result.preceitos = [];
  if (!result.praticas) result.praticas = [];
  if (!result.orixas) result.orixas = [];
  if (!result.ciclos) result.ciclos = [];
  if (!result.mensagemSemanal) result.mensagemSemanal = '';
  return result;
}

/**
 * Extract JSON from AI response that may contain markdown code blocks
 */
export function extractJson(raw: string): string {
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) return jsonMatch[1].trim();

  const firstBrace = raw.indexOf('{');
  if (firstBrace !== -1) {
    const candidate = raw.slice(firstBrace);
    // Try to find matching closing brace
    let depth = 0;
    for (let i = 0; i < candidate.length; i++) {
      if (candidate[i] === '{') depth++;
      else if (candidate[i] === '}') {
        depth--;
        if (depth === 0) return candidate.slice(0, i + 1);
      }
    }
  }

  // Last resort: return raw
  return raw.trim();
}

/**
 * Create fallback InsightData when AI generation fails
 */
export function criarInsightFallback(mapa: MapaAlmaCompleto): InsightData {
  const odu = mapa.odu.regente;
  const numerologia = mapa.numerologia;

  // Fallback uses legacy format — generate valid POI fields too
  const titulo = `Mapa da Alma de ${mapa.perfil.nomeCompleto}`;

  return {
    id: crypto.randomUUID(),
    dataGeracao: new Date().toISOString(),
    titulo,
    overview: `Regência de ${odu.nome} (${odu.numero}) com Número de Vida ${numerologia.lifePath}.`,
    resumo: `Mapa da Alma de ${mapa.perfil.nomeCompleto} — Regência de ${odu.nome} (${odu.numero}) com Número de Vida ${numerologia.lifePath}. ${mapa.convergencias.length > 0 ? `Identificadas ${mapa.convergencias.length} convergências espirituais.` : 'Análise em profundidade disponível via IA.'}`,
    proposito: `Alinhar-se com a energia de ${odu.nome} através dos preceitos e práticas do seu Odú de nascimento.`,
    coração: { tema: odu.nome, descricao: '', sistemas: ['Ifá'] },
    mente: { tema: '', descricao: '', sistemas: [] },
    corpo: { tema: '', descricao: '', sistemas: [] },
    caminho: { tema: '', descricao: '', sistemas: [] },
    retorno: { tema: '', descricao: '', sistemas: [] },
    convergencias: { triplices: [], duplas: [] },
    dons: [],
    desafios: [],
    preceitos: [{
      odu: odu.nome,
      quizilas: mapa.odu.quizilas,
      preceitos: mapa.odu.preceitos,
      ebos: mapa.odu.ebos,
      orientacao: 'Siga rigorosamente os preceitos do seu Odú para manter o axé alinhado.',
    }],
    praticas: [],
    orixas: (mapa.orixasDominantes ?? []).map(nome => ({
      nome,
      caminho: mapa.odu.caminhoSephirah,
      saudacao: '',
      cores: [],
      dia: '',
      pratica: '',
      conexao: '',
    })),
    ciclos: [{
      tipo: 'ano',
      valor: numerologia.anoPessoal,
      descricao: `Ano pessoal ${numerologia.anoPessoal}`,
      sephirah: '',
    }],
    mensagemSemanal: `Você é um ser em evolução contínua. Seu caminho de ${odu.nome} aguarda sua entrega.`,
  } as InsightData;
}