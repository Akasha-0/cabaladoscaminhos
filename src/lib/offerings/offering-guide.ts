/**
 * Offering Guide
 * Provides preparation steps and guidance for spiritual offerings
 */

export type OfferingType = 'agua' | 'comida' | 'flor' | 'velas' | 'incenso' | 'dinheiro' | 'outro';

export interface PreparationStep {
  ordem: number;
  titulo: string;
  descricao: string;
  duracaoMinutos?: number;
}

export interface OfferingGuide {
  tipo: OfferingType;
  nome: string;
  preparar: PreparationStep[];
  cuidados: string[];
  horariostipicos: string[];
}

/**
 * Get the offering guide with all preparation steps
 */
export function getGuide(): OfferingGuide[] {
  return [
    {
      tipo: 'agua',
      nome: 'Oferenda de Água',
      preparar: [
        {
          ordem: 1,
          titulo: 'Escolha do Recipiente',
          descricao: 'Selecione um recipiente limpo, preferencialmente de vidro ou cerâmica. Não use plásticos.',
          duracaoMinutos: 5
        },
        {
          ordem: 2,
          titulo: 'Água Filtrada',
          descricao: 'Utilize água filtrada ou mineral. A água deve estar em temperatura ambiente.',
          duracaoMinutos: 2
        },
        {
          ordem: 3,
          titulo: 'Consagração',
          descricao: 'Coloque a água no recipiente e faça uma oração de consagração pedindo proteção e bênçãos.',
          duracaoMinutos: 10
        },
        {
          ordem: 4,
          titulo: 'Posicionamento',
          descricao: 'Coloque o recipiente em local limpo e sagrado, preferencialmente no altar ou próximo a fontes de luz.',
          duracaoMinutos: 2
        }
      ],
      cuidados: [
        'Não deixe a água exposta ao sol diretamente',
        'Renove a água a cada 3 dias',
        'Mantenha o recipiente sempre limpo'
      ],
      horariostipicos: ['amanhecer', 'meio-dia', 'anoitecer']
    },
    {
      tipo: 'comida',
      nome: 'Oferenda de Comida',
      preparar: [
        {
          ordem: 1,
          titulo: 'Alimentos Sagrados',
          descricao: 'Escolha alimentos naturais e frescos. Evite alimentos processados ou com conservantes.',
          duracaoMinutos: 10
        },
        {
          ordem: 2,
          titulo: 'Preparação',
          descricao: 'Prepare os alimentos com intenção pura e pensamentos elevados. Cozinhe com amor.',
          duracaoMinutos: 30
        },
        {
          ordem: 3,
          titulo: 'Apresentação',
          descricao: 'Sirva em pratos limpos e decorativos. A apresentação deve ser digna e respeitosa.',
          duracaoMinutos: 10
        },
        {
          ordem: 4,
          titulo: 'Oração de Consagração',
          descricao: 'Faça uma oração agradecendo e pedindo bênçãos sobre a oferta antes de posicionar.',
          duracaoMinutos: 15
        },
        {
          ordem: 5,
          titulo: 'Posicionamento',
          descricao: 'Coloque no altar em horário apropriado. Deixe pelo tempo recomendado e depois descarte com respeito.',
          duracaoMinutos: 5
        }
      ],
      cuidados: [
        'Evite alimentos com carne em oferendas para alguns orixás',
        'Não ofereça alimentos estragados ou fora da validade',
        'Descarte as sobras em local limpo, nunca no chão'
      ],
      horariostipicos: ['amanhecer', 'meio-dia', 'entardecer']
    },
    {
      tipo: 'flor',
      nome: 'Oferenda de Flores',
      preparar: [
        {
          ordem: 1,
          titulo: 'Seleção das Flores',
          descricao: 'Escolha flores frescas e sem defeitos. Cada orixá tem preferências específicas de cores e tipos.',
          duracaoMinutos: 15
        },
        {
          ordem: 2,
          titulo: 'Limpeza',
          descricao: 'Lave as flores em água filtrada para remover sujeiras e insetos. Seque delicadamente.',
          duracaoMinutos: 10
        },
        {
          ordem: 3,
          titulo: 'Arranjo',
          descricao: 'Organize as flores de forma harmoniosa. Use cores que correspondam ao orixá ou propósito.',
          duracaoMinutos: 10
        },
        {
          ordem: 4,
          titulo: 'Consagração',
          descricao: 'Agradeça e consagre as flores com uma oração de proteção.',
          duracaoMinutos: 5
        }
      ],
      cuidados: [
        'Flores murchas devem ser substituídas',
        'Evite flores com perfume muito forte para alguns orixás',
        'Não use flores artificiais em oferendas'
      ],
      horariostipicos: ['amanhecer', 'entardecer']
    },
    {
      tipo: 'velas',
      nome: 'Oferenda de Velas',
      preparar: [
        {
          ordem: 1,
          titulo: 'Escolha da Vela',
          descricao: 'Selecione velas de cera natural, preferencialmente beeswax ou soja. Cores conforme o orixá.',
          duracaoMinutos: 5
        },
        {
          ordem: 2,
          titulo: 'Preparação do Local',
          descricao: 'Limpe a superfície onde a vela será posicionada. Use um prato ou base para segurança.',
          duracaoMinutos: 5
        },
        {
          ordem: 3,
          titulo: 'Acendimento',
          descricao: 'Acenda a vela com fósforos, não isqueiro. Faça uma oração ao acender.',
          duracaoMinutos: 2
        },
        {
          ordem: 4,
          titulo: 'Posicionamento',
          descricao: 'Coloque no altar em local seguro, longe de materiais inflamáveis.',
          duracaoMinutos: 2
        }
      ],
      cuidados: [
        'Nunca deixe velas acesas sem supervisão',
        'Mantenha longe de correntes de ar',
        'Apague antes de dormir ou sair de casa'
      ],
      horariostipicos: ['amanhecer', 'anoitecer']
    },
    {
      tipo: 'incenso',
      nome: 'Oferenda de Incenso',
      preparar: [
        {
          ordem: 1,
          titulo: 'Seleção do Incenso',
          descricao: 'Escolha incensos naturais sem química. O tipo deve ser apropriado para o propósito espiritual.',
          duracaoMinutos: 5
        },
        {
          ordem: 2,
          titulo: 'Utensílios',
          descricao: 'Prepare um porta-incenso estável e à prova de fogo.',
          duracaoMinutos: 3
        },
        {
          ordem: 3,
          titulo: 'Preparação do Ambiente',
          descricao: 'Areje o ambiente antes de acender. Elimine的小孩 e energias negativas.',
          duracaoMinutos: 10
        },
        {
          ordem: 4,
          titulo: 'Acendimento',
          descricao: 'Acenda a ponta do incenso e sopre suavemente para apagar a chama, deixando apenas a brasa.',
          duracaoMinutos: 2
        }
      ],
      cuidados: [
        'Pessoas com problemas respiratórios devem evitar',
        'Mantenha em ambiente ventilado',
        'Não use em excesso'
      ],
      horariostipicos: ['qualquer horário com intenção']
    },
    {
      tipo: 'dinheiro',
      nome: 'Oferenda de Dinheiro',
      preparar: [
        {
          ordem: 1,
          titulo: 'Notas Limpas',
          descricao: 'Use notas limpas e sem rasgos. Dobradas de forma harmoniosa.',
          duracaoMinutos: 5
        },
        {
          ordem: 2,
          titulo: 'Preparação Espiritual',
          descricao: 'Lave as mãos antes de manusear. Faça uma oração de intenção.',
          duracaoMinutos: 10
        },
        {
          ordem: 3,
          titulo: 'Moeda ou Cédula',
          descricao: 'Escolha entre moedas ou cédulas conforme tradição e propósito.',
          duracaoMinutos: 2
        },
        {
          ordem: 4,
          titulo: 'Posicionamento',
          descricao: 'Coloque no altar em envelope limpo ou diretamente conforme tradição.',
          duracaoMinutos: 3
        }
      ],
      cuidados: [
        'Dinheiro de origem questionável não deve ser oferecido',
        'Mantenha com respeito e não misture com dinheiro comum',
        'O destino do dinheiro deve ser decidido com consciência'
      ],
      horariostipicos: ['início do mês', 'dia específico de devoção']
    }
  ];
}

/**
 * Get guide by offering type
 */
export function getGuideByType(tipo: OfferingType): OfferingGuide | undefined {
  return getGuide().find(g => g.tipo === tipo);
}