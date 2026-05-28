export interface Empresa {
  id?: string;
  usuarioId: string;
  nome: string;
  nomeFantasia: string;
  razaoSocial: string;
  cnpj?: string;
  dataAbertura?: Date;
  atividadePrincipal?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  numeroFuncionarios?: number;
 createdAt?: Date;
  updatedAt?: Date;
}

export interface NumerologiaEmpresarial {
  empresaId: string;
  numeroNomeFantasia: number;
  numeroRazaoSocial: number;
  numeroAtividade: number;
  numeroDataAbertura: number;
  diaFavoravel: number;
  vibracaoTotal: number;
  interpretacao: string;
  forca: 'forte' | 'media' | 'fraca';
  tendencias: string[];
  recomendacoes: string[];
}

export interface AnaliseEmpresarial {
  numeroDestino: number;
  numeroMotivador: number;
  numeroImpressao: number;
  numeroRealizacao: number;
  numeroPoder: number;
  numeroExpressao: number;
}

export const NUMEROS_INTERPRETACAO: Record<number, { significado: string; forca: string; areas: string[] }> = {
  1: {
    significado: 'Iniciativa, Liderança, Independência, Originalidade',
    forca: 'forte',
    areas: ['Empreendedorismo', 'Inovação', 'Pioneirismo'],
  },
  2: {
    significado: 'Parcerias, Cooperação, Diplomacia, Equilíbrio',
    forca: 'media',
    areas: ['Consultoria', 'Mediação', 'Colaboração'],
  },
  3: {
    significado: 'Comunicação, Criatividade, Sociabilidade, Otimismo',
    forca: 'forte',
    areas: ['Marketing', 'Entretenimento', 'Artes'],
  },
  4: {
    significado: 'Estabilidade, Organização, Esforço, Disciplina',
    forca: 'forte',
    areas: ['Construção', 'Finanças', 'Administração'],
  },
  5: {
    significado: 'Liberdade, Mudança, Progresso, Versatilidade',
    forca: 'media',
    areas: ['Comércio', 'Viagens', 'Comunicação'],
  },
  6: {
    significado: 'Responsabilidade, Harmonia, Família, Serviço',
    forca: 'media',
    areas: ['Saúde', 'Educação', 'Serviços sociais'],
  },
  7: {
    significado: 'Análise, Perfection, Conhecimento, Espiritualidade',
    forca: 'media',
    areas: ['Pesquisa', 'Tecnologia', 'Filosofia'],
  },
  8: {
    significado: 'Poder, Abundância, Materialismo, Autoridade',
    forca: 'forte',
    areas: ['Finanças', 'Imobiliária', 'Executivo'],
  },
  9: {
    significado: 'Humanitarismo, Compaixão, Globalidade, Conclusão',
    forca: 'media',
    areas: ['ONGs', 'Saúde', 'Educação'],
  },
  11: {
    significado: 'Intuição, Inspiração, Idealismo, Visão',
    forca: 'forte',
    areas: ['Liderança espiritual', 'Inovação social', 'Arte'],
  },
  22: {
    significado: 'Maestria, Organização em grande escala, Praticidade',
    forca: 'forte',
    areas: ['Grandes projetos', 'Construção', 'Empreendimentos'],
  },
  33: {
    significado: 'Mestria espiritual, Serviço humanitarian, Iluminação',
    forca: 'forte',
    areas: ['Ensino espiritual', 'Healing', 'Advocacia'],
  },
};

export function calcularNumeroEmpresarial(texto: string): number {
  const numeros = texto.toUpperCase().replace(/[^A-Z]/g, '');
  
  const valores: Record<string, number> = {
    A: 1, J: 1, S: 1,
    B: 2, K: 2, T: 2,
    C: 3, L: 3, U: 3,
    D: 4, M: 4, V: 4,
    E: 5, N: 5, W: 5,
    F: 6, O: 6, X: 6,
    G: 7, P: 7, Y: 7,
    H: 8, Q: 8, Z: 8,
    I: 9, R: 9,
  };

  let soma = 0;
  for (const char of numeros) {
    soma += valores[char] || 0;
  }

  while (soma > 11 && ![11, 22, 33].includes(soma)) {
    soma = soma.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }

  return soma;
}

export function calcularNumeroData(data: Date): number {
  const dia = data.getDate();
  const mes = data.getMonth() + 1;
  const ano = data.getFullYear();
  
  const soma = dia + mes + ano;
  
  let resultado = soma;
  while (resultado > 9 && ![11, 22, 33].includes(resultado)) {
    resultado = resultado.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  
  return resultado;
}

export function getDiaFavoravel(): { dia: number; nome: string; orixa: string } {
  const diasFavoraveis = [
    { dia: 1, nome: 'Domingo', orixa: 'Xangô' },
    { dia: 2, nome: 'Segunda', orixa: 'Omolu' },
    { dia: 4, nome: 'Quarta', orixa: 'Xangô' },
    { dia: 5, nome: 'Quinta', orixa: 'Oxóssi' },
    { dia: 8, nome: 'Domingo', orixa: 'Xangô' },
  ];
  
  return diasFavoraveis[Math.floor(Math.random() * diasFavoraveis.length)];
}

export function analisarNomeEmpresarial(nome: string): AnaliseEmpresarial {
  const palavras = nome.split(' ').filter(w => w.length > 0);
  
  const primeiraPalavra = palavras[0] || '';
  const ultimaPalavra = palavras[palavras.length - 1] || '';
  const todasPalavras = palavras.join('');
  
  const numeroDestino = calcularNumeroEmpresarial(todasPalavras);
  const numeroMotivador = calcularNumeroEmpresarial(primeiraPalavra);
  const numeroImpressao = calcularNumeroEmpresarial(ultimaPalavra);
  
  const primeiraLetra = nome.charAt(0);
  const numeroRealizacao = primeiraLetra ? 
    (primeiraLetra.charCodeAt(0) - 64) % 9 + 1 : 1;
  
  const numeroPoder = Math.max(numeroMotivador, numeroDestino);
  const numeroExpressao = (numeroDestino + numeroMotivador + numeroImpressao) % 9 + 1;

  return {
    numeroDestino,
    numeroMotivador,
    numeroImpressao,
    numeroRealizacao,
    numeroPoder,
    numeroExpressao,
  };
}

export function getForcaVibracional(numeros: number[]): 'forte' | 'media' | 'fraca' {
  const forcas = numeros.map(n => NUMEROS_INTERPRETACAO[n]?.forca || 'media');
  const forteCount = forcas.filter(f => f === 'forte').length;
  const fracaCount = forcas.filter(f => f === 'fraca').length;
  
  if (forteCount >= 3) return 'forte';
  if (fracaCount >= 3) return 'fraca';
  return 'media';
}

export function gerarRecomendacoes(numeros: AnaliseEmpresarial): string[] {
  const recomendacoes: string[] = [];
  
  if (numeros.numeroDestino === 1) {
    recomendacoes.push('Evite negócios que exijam muita colaboração inicial');
    recomendacoes.push('Busque oportunidades de liderança e inovação');
  }
  
  if (numeros.numeroDestino === 2) {
    recomendacoes.push('Parcerias estratégicas são altamente favoráveis');
    recomendacoes.push('Trabalhe em equipe para melhores resultados');
  }
  
  if (numeros.numeroDestino === 3) {
    recomendacoes.push('Invista em marketing e comunicação');
    recomendacoes.push('Cultive networking e relacionamentos públicos');
  }
  
  if (numeros.numeroDestino === 4) {
    recomendacoes.push('Foco em organização e processos estruturados');
    recomendacoes.push('Planejamento de longo prazo é essencial');
  }
  
  if (numeros.numeroDestino === 5) {
    recomendacoes.push('Adapte-se rapidamente a mudanças');
    recomendacoes.push('Explore mercados diversos e internacionais');
  }
  
  if (numeros.numeroDestino === 6) {
    recomendacoes.push('Priorize responsabilidade social e ambiental');
    recomendacoes.push('Construa equipe como família');
  }
  
  if (numeros.numeroDestino === 7) {
    recomendacoes.push('Invista em pesquisa e desenvolvimento');
    recomendacoes.push('Evite decisões precipitadas - análise profunda é sua força');
  }
  
  if (numeros.numeroDestino === 8) {
    recomendacoes.push('Foque em acumulação de recursos e poder');
    recomendacoes.push('Não tenha medo de ambição');
  }
  
  if (numeros.numeroDestino === 9) {
    recomendacoes.push('Trabalho humanitarian traz maiores retornos');
    recomendacoes.push('Olhe para o quadro geral, não detalhes');
  }
  
  if (numeros.numeroDestino === 11) {
    recomendacoes.push('Você tem visão além do comum -use com sabedoria');
    recomendacoes.push('Evite se perder em ideais irreais');
  }
  
  if (numeros.numeroDestino === 22) {
    recomendacoes.push('Grandes projetos são seu destino');
    recomendacoes.push('Combine visão com execução prática');
  }
  
  return recomendacoes;
}