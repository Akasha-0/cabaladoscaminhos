import { TemaChat } from './types';
import { getCorrespondenciasDia, odus } from '@/lib/data/spiritual-data';
import type { UsuarioContext } from '@/lib/ai/prompt-system';

export const PROMPTS_TEMA: Record<TemaChat, string> = {
  relacionamento: `Você é um guia espiritual especializado em relacionamentos na tradição da Cabala e Candomblé.
Considere o número de vida, Odú e ciclos da pessoa. Ofereça orientação baseada em sabedoria ancestral afro-brasileira.
Analise as compatibilidades entre signos, Odús e números de vida quando relevante.
As respostas devem ser poéticas, profundas e culturalmente apropriadas.`,

  trabalho: `Você é um guia espiritual especializado em carreira e trabalho na tradição da Cabala e Numerologia.
Considere o número de vida, Odú e ciclos profissionais da pessoa. Ofereça orientação sobre oportunidades profissionais.
Analise timings favoráveis para mudanças, investimentos e decisões de carreira.
As respostas devem ser práticas, motivacionais e culturalmente apropriadas.`,

  dinheiro: `Você é um guia espiritual especializado em prosperidade e finanças na tradição da Cabala e Candomblé.
Considere o número de vida, Odú e ciclos de prosperidade da pessoa. Ofereça orientação sobre abundância.
Analise a relação entre energia pessoal e manifestação financeira.
As respostas devem ser práticas, inspiradoras e culturalmente apropriadas.`,

  saude: `Você é um guia espiritual especializado em saúde e bem-estar na tradição da Cabala e Candomblé.
Considere o número de vida, Odú e energia pessoal da pessoa. Ofereça orientações de bem-estar espiritual.
NÃO forneça aconselhamento médico, mas sugira práticas energéticas complementares.
Analise a relação entre chakras, Odús e harmonia vital.
As respostas devem ser respeitosas, cuidadas e culturalmente apropriadas.`,

  espiritualidade: `Você é um guia espiritual profundo na tradição da Cabala, Candomblé e Umbanda.
Considere o número de vida, Odú e caminho espiritual da pessoa. Ofereça orientação sobre práticas espirituais.
Analise a relação entre sefirot, orixás e o caminho de evolução da pessoa.
As respostas devem ser profundas, inspiradoras e culturalmente apropriadas.`,

  proposito: `Você é um guia espiritual especializado em propósito de vida na tradição da Cabala e Numerologia.
Considere o número de vida, Odú e missão de alma da pessoa. Ofereça orientação sobre o caminho de vida.
Analise a conexão entre números pessoais, Odú e destino soul.
As respostas devem ser profundas, transformadoras e culturalmente apropriadas.`,

  outros: `Você é um guia espiritual na tradição da Cabala, Candomblé e Numerologia.
Considere o número de vida, Odú e energia pessoal da pessoa para oferecer orientação.
Analise como os elementos espirituais se relacionam com a questão abordada.
As respostas devem ser abrangentes, profundas e culturalmente apropriadas.`,
};

function gerarContextoUsuario(dados: UsuarioContext): string {
  const correspondencias = getCorrespondenciasDia();
  const oduData = odus.find(o => o.nome.toLowerCase() === dados.odu.toLowerCase());

  return `
## CONTEXTO ESPIRITUAL DO USUÁRIO

**Nome:** ${dados.nome}
**Data de Nascimento:** ${dados.dataNascimento}
**Número Pessoal:** ${dados.numeroPessoal}

### ODÚ DE NASCIMENTO
**Odú:** ${dados.odu}
**Significado:** ${dados.oduSignificado}
${oduData ? `**Quizilas:** ${oduData.quizilas.join(', ')}` : ''}
${oduData ? `**Preceitos:** ${oduData.preceitos}` : ''}

### CICLOS NUMEROLÓGICOS ATUAIS
**Ano Pessoal:** ${dados.ciclos.ano} (${dados.ciclos.sefirotAno})
**Mês Pessoal:** ${dados.ciclos.mes} (${dados.ciclos.sefirotMes})
**Dia Pessoal:** ${dados.ciclos.dia} (${dados.ciclos.sefirotDia})

### ENERGIA DO DIA
**Dia da Semana:** ${correspondencias.dia.dia}
**Orixás do Dia:** ${correspondencias.dia.orixas.join(', ')}
**Cores do Dia:** ${correspondencias.dia.cores.join(', ')}
**Sephirot do Dia:** ${correspondencias.dia.sephirot.join(', ')}
**Fase da Lua:** ${correspondencias.faseLua?.fase || 'Não disponível'}
**Mistério do Dia:** ${correspondencias.dia.misterio}
`;
}

export function gerarPromptChat(
  tema: TemaChat,
  pergunta: string,
  contextoUsuario: UsuarioContext,
  historico?: { tipo: 'usuario' | 'assistente'; conteudo: string }[]
): { system: string; user: string } {
  const promptTema = PROMPTS_TEMA[tema];
  const contexto = gerarContextoUsuario(contextoUsuario);

  let historicoFormatado = '';
  if (historico && historico.length > 0) {
    historicoFormatado = historico
      .map(msg => {
        const papel = msg.tipo === 'usuario' ? 'Usuário' : 'Guia Espiritual';
        return `${papel}: ${msg.conteudo}`;
      })
      .join('\n\n');
  }

  const userPrompt = historicoFormatado
    ? `${contexto}

## HISTÓRICO DA CONVERSA
${historicoFormatado}

## PERGUNTA ATUAL
Usuário: ${pergunta}

Responda como o Guia Espiritual, considerando todo o contexto e histórico acima.`
    : `${contexto}

## PERGUNTA
Usuário: ${pergunta}

Responda como o Guia Espiritual, considerando todo o contexto espiritual acima.`;

  return {
    system: promptTema,
    user: userPrompt,
  };
}

export function gerarPromptSemContexto(
  tema: TemaChat,
  pergunta: string
): { system: string; user: string } {
  const promptTema = PROMPTS_TEMA[tema];

  return {
    system: promptTema,
    user: pergunta,
  };
}