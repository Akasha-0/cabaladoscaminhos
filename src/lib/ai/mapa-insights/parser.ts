import type { InsightData } from './types';
import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

const REQUIRED_FIELDS = ['resumo', 'proposito', 'dons', 'desafios'] as const;

/**
 * Parse AI JSON response into InsightData
 * Returns partial data on parse error with error field filled
 */
export function parseInsightResponse(raw: string): InsightData {
  const json = extractJson(raw);
  const data = JSON.parse(json) as Partial<InsightData>;

  // Validate required fields
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Add id and timestamp
  const result = {
    id: crypto.randomUUID(),
    dataGeracao: new Date().toISOString(),
    ...data,
  } as InsightData;
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
  // Try direct parse first
  try {
    JSON.parse(raw);
    return raw;
  } catch {
    // not direct JSON, try alternatives below
  }

  // Try markdown code block
  const codeBlock = raw.match(/```json\n?([\s\S]*?)```/);
  if (codeBlock) return codeBlock[1].trim();

  // Try raw JSON object in text
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  // Last resort: return raw
  return raw.trim();
}

/**
 * Create fallback InsightData when AI generation fails
 */
export function criarInsightFallback(mapa: MapaAlmaCompleto): InsightData {
  const odu = mapa.odu.regente;
  const numerologia = mapa.numerologia;

  return {
    id: crypto.randomUUID(),
    dataGeracao: new Date().toISOString(),
    resumo: `Mapa da Alma de ${mapa.perfil.nomeCompleto} — Regência de ${odu.nome} (${odu.numero}) com Número de Vida ${numerologia.vida}. ${mapa.convergencias.length > 0 ? `Identificadas ${mapa.convergencias.length} convergências espirituais.` : 'Análise em profundidade disponível via IA.'}`,
    proposito: `Alinhar-se com a energia de ${odu.nome} através dos preceitos e práticas do seu Odú de nascimento.`,
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
      saudacao: '',
      caminho: mapa.odu.caminhoSephirah,
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
  };
}
