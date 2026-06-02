// fallow-ignore-file unused-file
import type { InsightData } from './types';

// fallow-ignore-next-line complexity
export function parseInsightResponse(conteudo: string): InsightData {
  const linhas = conteudo.split('\n');

  const titulo = extrairValor(linhas, 'TÍTULO:') || 'Insight do Dia';
  const descricao = extrairValor(linhas, 'DESCRIÇÃO:') || extrairValor(linhas, 'DESCRICAO:') || '';
  const acao = extrairValor(linhas, 'AÇÃO:') || extrairValor(linhas, 'ACAO:') || '';
  const afirmacao = extrairValor(linhas, 'AFIRMAÇÃO:') || extrairValor(linhas, 'AFIRMACAO:') || '';
  const cores = extrairItems(linhas, 'CORES:') || ['Branco'];
  const ervas = extrairItems(linhas, 'ERVAS:') || [];
  const ritual = extrairValor(linhas, 'RITUAL:') || '';
  const sefirot = extrairValor(linhas, 'SEFIROT:') || '';

  return {
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    acaoRecomendada: acao.trim(),
    afirmacao: afirmacao.trim(),
    cores,
    ervas,
    ritus: ritual.trim(),
    sefirotAlinhado: sefirot.trim()
  };
}

function extrairValor(linhas: string[], chave: string): string | null {
  const linha = linhas.find(l =>
    l.toUpperCase().startsWith(chave.toUpperCase())
  );

  if (!linha) return null;

  const separator = linha.indexOf(':');
  if (separator === -1) return null;

  return linha.substring(separator + 1).trim();
}

export function extrairItems(linhas: string[], chave: string): string[] {
  const valor = extrairValor(linhas, chave);

  if (!valor) return [];

  return valor
    .split(',')
    .map(item => item.trim())
    .filter(item => item.length > 0);
}

export function criarInsightFallback(): InsightData {
  return {
    titulo: 'Guia do Momento Presente',
    descricao: 'O momento convida à introspecção e à escuta interior. Permita que a sabedoria ancestral guide seus passos.',
    acaoRecomendada: 'Reserve um momento de silêncio para conectar-se com sua essência.',
    afirmacao: 'Akó querubyn, eu sou luz. Eu sou paz. Eu sou caminho.',
    cores: ['Branco', 'Azul', 'Dourado'],
    ervas: ['Boldo', 'Colônia', 'Alecrim'],
    ritus: 'Acenda uma vela branca e respire profundamente, pedindo clareza.',
    sefirotAlinhado: 'Tiphereth'
  };
}
