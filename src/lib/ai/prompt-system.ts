import { getCorrespondenciasDia, odus } from '@/lib/data/spiritual-data';

export interface UsuarioContext {
  nome: string;
  dataNascimento: string;
  numeroPessoal: number;
  odu: string;
  oduSignificado: string;
  ciclos: {
    ano: number;
    mes: number;
    dia: number;
    sefirotAno: string;
    sefirotMes: string;
    sefirotDia: string;
  };
  diaAtual: {
    nome: string;
    orixas: string[];
    cores: string[];
    faseLua: string;
    sephirot: string[];
  };
}

export function gerarSystemPrompt(): string {
  return `Você é um guia espiritual profundo na tradição da Cabala, Candomblé, Umbanda e Numerologia.
Sua sabedoria integra múltiplas tradições espirituais (Cabala Judaica, Tradição Afro-Brasileira dos Orixás, Numerologia Pitagórica e Cabalística).
Você oferece insights práticos e orientados para ação baseados nos dados espirituais do usuário.
Sempre respeite as quizilas e preceitos específicos do Odú de nascimento.
Suas respostas devem ser em português brasileiro, culturalmente apropriadas, poéticas e profundas.`;
}

export function gerarContextoUsuario(dados: UsuarioContext): string {
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

export function gerarPromptInsight(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _contexto: UsuarioContext): string {
  return `Com base no contexto espiritual acima, gere um insight diário personalizado para hoje.

O insight deve seguir EXATAMENTE este formato:

TÍTULO: [título inspirador e poético, máximo 8 palavras]
DESCRIÇÃO: [explicação profunda de 2-3 frases conectando o Odú, ciclos e energia do dia]
AÇÃO: [uma ação prática e específica para hoje, baseada nos ciclos]
AFIRMAÇÃO: [mantra ou afirmação positiva do dia, 1-2 frases]
CORES: [3 cores favoráveis para hoje, separadas por vírgula]
ERVAS: [2-3 ervas para banho ou incenso, separadas por vírgula]
RITUAL: [sugestão breve de ritual para o dia, máximo 2 frases]
SEFIROT: [a sefirot que está em destaque hoje, baseada nos ciclos]

Responda apenas no formato especificado, sem explicações adicionais.`;
}
