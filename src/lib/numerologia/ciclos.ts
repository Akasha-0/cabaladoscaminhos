export interface CicloTemporais {
  anoPessoal: number;
  mesPessoal: number;
  diaPessoal: number;
  sefirotAno: string;
  sefirotMes: string;
  sefirotDia: string;
  descricao: {
    ano: DescricaoCiclo | null;
    mes: DescricaoCiclo | null;
    dia: DescricaoCiclo | null;
  };
}

interface DescricaoCiclo {
  nome: string;
  descricao: string;
  oraculo: string;
  cor: string;
  elemento: string;
}

const nomesSefirots = [
  '', 'Kether', 'Chokmah', 'Binah', 'Chesed', 'Geburah',
  'Tiphereth', 'Netzach', 'Hod', 'Yesod', 'Malkuth'
];

const descricoesCiclos: Record<number, DescricaoCiclo> = {
  1: { nome: 'Início e Liderança', descricao: 'Momento de plantar novas sementes.', oraculo: 'O-sol', cor: '#D97706', elemento: 'Fogo' },
  2: { nome: 'Parceria e Diplomacia', descricao: 'Período de cooperação e união.', oraculo: 'A-Sacerdotisa', cor: '#6366F1', elemento: 'Água' },
  3: { nome: 'Expressão e Criatividade', descricao: 'Tempo de expansão criativa.', oraculo: 'A-Imperatriz', cor: '#EC4899', elemento: 'Água' },
  4: { nome: 'Estrutura e Disciplina', descricao: 'Período de construção sólida.', oraculo: 'O-Imperador', cor: '#0EA5E9', elemento: 'Terra' },
  5: { nome: 'Mudança e Liberdade', descricao: 'Tempo de transformação e aventura.', oraculo: 'O-Papa', cor: '#8B5CF6', elemento: 'Ar' },
  6: { nome: 'Harmonia e Responsabilidade', descricao: 'Período focado em lar e família.', oraculo: 'Os-Enamorados', cor: '#22C55E', elemento: 'Ar' },
  7: { nome: 'Reflexão e Sabedoria', descricao: 'Tempo de introspecção e espiritualidade.', oraculo: 'O-Carros', cor: '#EF4444', elemento: 'Fogo' },
  8: { nome: 'Poder e Abundância', descricao: 'Período de poder pessoal e realizações.', oraculo: 'A-Justiça', cor: '#F59E0B', elemento: 'Terra' },
  9: { nome: 'Completude e Transição', descricao: 'Tempo de encerramento de ciclos.', oraculo: 'O-Eremita', cor: '#A855F7', elemento: 'Terra' },
};

function sefirotName(numero: number): string {
  const index = { 11: 2, 22: 4, 33: 6 }[numero] ?? numero;
  return nomesSefirots[index] ?? '';
}

export function calcularAnoPessoal(dataNascimento: string): { numero: number; sefirot: string; descricao: DescricaoCiclo | null } {
  const anoAtual = new Date().getFullYear();
  const numeros = (dataNascimento + anoAtual.toString()).replace(/\D/g, '');
  let soma = 0;
  for (const digito of numeros) soma += parseInt(digito);
  while (soma > 9 && soma !== 11 && soma !== 22 && soma !== 33) {
    soma = soma.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return { numero: soma, sefirot: sefirotName(soma), descricao: descricoesCiclos[soma] ?? null };
}

export function calcularMesPessoal(anoPessoal: number): { numero: number; sefirot: string; descricao: DescricaoCiclo | null } {
  const mesAtual = new Date().getMonth() + 1;
  let numero = anoPessoal + mesAtual;
  while (numero > 9 && numero !== 11 && numero !== 22 && numero !== 33) {
    numero = numero.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return { numero, sefirot: sefirotName(numero), descricao: descricoesCiclos[numero] ?? null };
}

export function calcularDiaPessoal(dataNascimento: string, anoPessoal: number): { numero: number; sefirot: string; descricao: DescricaoCiclo | null } {
  const hoje = new Date();
  const diaAtual = hoje.getDate();
  const mesAtual = hoje.getMonth() + 1;
  let numero = anoPessoal + mesAtual + diaAtual;
  while (numero > 9 && numero !== 11 && numero !== 22 && numero !== 33) {
    numero = numero.toString().split('').reduce((acc, d) => acc + parseInt(d), 0);
  }
  return { numero, sefirot: sefirotName(numero), descricao: descricoesCiclos[numero] ?? null };
}

export function getCiclosTemporais(dataNascimento: string): CicloTemporais {
  const ano = calcularAnoPessoal(dataNascimento);
  const mes = calcularMesPessoal(ano.numero);
  const dia = calcularDiaPessoal(dataNascimento, ano.numero);
  return {
    anoPessoal: ano.numero,
    mesPessoal: mes.numero,
    diaPessoal: dia.numero,
    sefirotAno: ano.sefirot,
    sefirotMes: mes.sefirot,
    sefirotDia: dia.sefirot,
    descricao: { ano: ano.descricao, mes: mes.descricao, dia: dia.descricao },
  };
}
