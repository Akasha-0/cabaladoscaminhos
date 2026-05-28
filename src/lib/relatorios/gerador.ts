import type { MapaNatal } from '@/lib/astrologia/tipos';
import { calcularTrânsitosAtivos, type Transito } from '@/lib/astrologia/trânsitos/calculator';

export interface RelatorioSemanal {
  dataGeracao: Date;
  periodo: {
    inicio: Date;
    fim: Date;
  };
  resumo: {
    energiaGeral: string;
    temaSemana: string;
    diasFavoraveis: string[];
    diasDesafio: string[];
  };
  ciclos: {
    anoPessoal: number;
    mesPessoal: number;
    diaPessoal: number;
  };
  transitos: {
    planeta: string;
    aspecto: string;
    planetaNatal: string;
    impacto: string;
    descricao: string;
  }[];
  orientacoes: {
    dia: string;
    energia: string;
    ritual: string;
    evitar: string[];
    orixa: string;
  }[];
  cronograma: {
    dia: string;
    atividade: string;
    hora: string;
    duracao: string;
  }[];
}

export function gerarRelatorioSemanal(
  mapaNatal: MapaNatal | null,
  dataInicio: Date = new Date()
): RelatorioSemanal {
  const inicio = new Date(dataInicio);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 6);

  const nomesDias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const transitos: Transito[] = mapaNatal
    ? calcularTrânsitosAtivos(mapaNatal)
    : [];

  const ciclos = {
    anoPessoal: calcularNumeroPessoal(inicio, 'ano'),
    mesPessoal: calcularNumeroPessoal(inicio, 'mes'),
    diaPessoal: calcularNumeroPessoal(inicio, 'dia'),
  };

  const orientacoes = Array.from({ length: 7 }, (_, i) => {
    const data = new Date(inicio);
    data.setDate(data.getDate() + i);
    const dia = data.getDay();

    return {
      dia: nomesDias[dia],
      energia: getEnergiaDoDia(dia),
      ritual: getRitualDoDia(dia),
      evitar: getEvitarDoDia(dia),
      orixa: getOrixaDoDia(dia),
    };
  });

  const cronograma = gerarCronogramaRituais(orientacoes);

  return {
    dataGeracao: new Date(),
    periodo: {
      inicio,
      fim,
    },
    resumo: {
      energiaGeral: 'Período de transformação e alinhamento espiritual',
      temaSemana: getTemaSemana(inicio),
      diasFavoraveis: ['Quarta', 'Sexta', 'Domingo'],
      diasDesafio: ['Terça', 'Sábado'],
    },
    ciclos,
    transitos: transitos.slice(0, 5).map(t => ({
      planeta: t.planeta,
      aspecto: t.aspecto,
      planetaNatal: t.planetaNatal,
      impacto: t.impacto,
      descricao: t.descricao,
    })),
    orientacoes,
    cronograma,
  };
}

function calcularNumeroPessoal(data: Date, tipo: 'ano' | 'mes' | 'dia'): number {
  const ano = data.getFullYear();
  const mes = data.getMonth() + 1;
  const dia = data.getDate();

  let soma = 0;
  if (tipo === 'ano') {
    soma = somarDigitos(ano);
  } else if (tipo === 'mes') {
    soma = somarDigitos(ano) + somarDigitos(mes);
  } else {
    soma = somarDigitos(ano) + somarDigitos(mes) + somarDigitos(dia);
  }

  while (soma > 9 && soma !== 11 && soma !== 22 && soma !== 33) {
    soma = somarDigitos(soma);
  }

  return soma;
}

function somarDigitos(n: number): number {
  return String(n).split('').reduce((acc, d) => acc + parseInt(d), 0);
}

function getEnergiaDoDia(dia: number): string {
  const energias = [
    'Dia de restauração e encerramento de ciclos',
    'Dia de fundação e novos começos',
    'Dia de ação e coragem',
    'Dia de comunicação e expressão',
    'Dia de expansão e abundância',
    'Dia de harmonia e relações',
    'Dia de poder pessoal e vitalidade',
  ];
  return energias[dia];
}

function getRitualDoDia(dia: number): string {
  const rituais = [
    'Descanso e reflexão, oração aos Orixás superiores',
    'Banho de limpeza, defumação com ervas',
    'Trabalho físico, oferendas para Ogum',
    'Estudos, leitura, oferendas para Xangô',
    'Gratidão, oferendas para Oxóssi',
    'Reconciliação, oferendas para Oxalá',
    'Manifestação deintentions, oferendas para Xangô',
  ];
  return rituais[dia];
}

function getEvitarDoDia(dia: number): string[] {
  const evitar = [
    ['Conflitos', 'Decisões importantes'],
    ['Procrastinação', 'Confrontos'],
    ['Impaciência', 'Agressividade'],
    ['Mentiras', 'Superficialidade'],
    ['Avareza', 'Pessimismo'],
    ['Óleo de dendê', 'Pólvora'],
    ['Conflitos', 'Decisões precipitadas'],
  ];
  return evitar[dia];
}

function getOrixaDoDia(dia: number): string {
  const orixas = ['Oxalá', 'Omolu', 'Ogum', 'Xangô', 'Oxóssi', 'Oxum', 'Iemanjá'];
  return orixas[dia];
}

function getTemaSemana(data: Date): string {
  const semana = Math.ceil(data.getDate() / 7);
  const temas = [
    'Semana do recomeço - novas intentions',
    'Semana da transformação - purificação',
    'Semana da expansão - abundância',
    'Semana da comunicação - expressão criativa',
  ];
  return temas[(semana - 1) % 4];
}

function gerarCronogramaRituais(orientacoes: { dia: string; ritual: string }[]): {
  dia: string;
  atividade: string;
  hora: string;
  duracao: string;
}[] {
  return orientacoes.map((o) => ({
    dia: o.dia,
    atividade: o.ritual,
    hora: '06:00',
    duracao: '30 min',
  }));
}