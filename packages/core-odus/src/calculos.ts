export interface OduInfo {
  numero: number;
  nome: string;
  significado: string;
  elementos: string;
  orixaRegente: string;
  quizilas: string[];
  preceitos: string[];
  ebos: string[];
}

export const odusData: Record<number, OduInfo> = {
  1: {
    numero: 1,
    nome: 'Okaran',
    significado:
      'O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado.',
    elementos: 'Terra/Fogo',
    orixaRegente: 'Exu',
    quizilas: ['Carne de porco', 'Cachaça em excesso', 'Andar na rua ao meio-dia'],
    preceitos: [
      'Cultivar a paciência',
      'Não agir por impulso',
      'Cuidar rigorosamente de Exu e dos antepassados',
    ],
    ebos: [
      'Ebó de Caminho/Limpeza: Despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos',
    ],
  },
  2: {
    numero: 2,
    nome: 'Ejiokô',
    significado: 'A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas.',
    elementos: 'Ar/Terra',
    orixaRegente: 'Ibeji',
    quizilas: ['Comer ovos', 'Rã', 'Mentir ou trair a confiança dos outros'],
    preceitos: [
      'Manter a alegria interna',
      'Cuidar da criança interior',
      'Buscar sociedades justas',
    ],
    ebos: ['Ebó de Prosperidade: Doces, frutas para Ibeji, e comidas leves em praças ou jardins'],
  },
  3: {
    numero: 3,
    nome: 'Etogundá',
    significado: 'A revolta, a força física, a criação de ferramentas. O corte e a separação.',
    elementos: 'Fogo/Terra',
    orixaRegente: 'Ogum',
    quizilas: [
      'Usar facas ou objetos cortantes sem necessidade',
      'Carne de galo',
      'Violência verbal',
    ],
    preceitos: [
      'Evitar brigas e discussões',
      'Manter o foco no trabalho e na justiça',
      'Não demandar contra os outros',
    ],
    ebos: [
      'Ebó de Defesa: Inhames assados, paliteiros de Ogum, limpeza com folhas de mariô e limpeza com ferro',
    ],
  },
  4: {
    numero: 4,
    nome: 'Irosun',
    significado: 'O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro.',
    elementos: 'Fogo/Terra',
    orixaRegente: 'Iemanjá',
    quizilas: [
      'Olhar para buracos vazios',
      'Usar roupas muito vermelhas em momentos de crise',
      'Mentira',
    ],
    preceitos: [
      'Desenvolver a intuição',
      'Não ignorar avisos e sonhos',
      'Cuidar da saúde do sangue e dos olhos',
    ],
    ebos: [
      'Ebó de Proteção: Alimentos brancos, canjica na beira-mar para Iemanjá, banhos de folhas frias',
    ],
  },
  5: {
    numero: 5,
    nome: 'Oxé',
    significado: 'O ouro, a doçura, a feitiçaria, a vaidade e a lágrima. Sangue menstrual.',
    elementos: 'Água',
    orixaRegente: 'Oxum',
    quizilas: [
      'Comer ovos',
      'Comidas muito salgadas ou azedas',
      'Chorar miséria ou reclamar da vida',
    ],
    preceitos: [
      'Cuidar da autoestima',
      'Usar perfumes',
      'Manter a higiene espiritual',
      'Buscar a diplomacia',
    ],
    ebos: [
      'Ebó de Atração/Ouro: Banhos de mel, caldas de frutas, oferendas com girassóis e moedas douradas em águas doces',
    ],
  },
  6: {
    numero: 6,
    nome: 'Obará',
    significado: 'A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo.',
    elementos: 'Ar/Fogo',
    orixaRegente: 'Xangô',
    quizilas: ['Inveja', 'Contar planos antes de realizá-los', 'Comer abóbora', 'Teimosia extrema'],
    preceitos: [
      'Ser generoso',
      'Estudar',
      'Manter a cabeça erguida',
      'Praticar a gratidão para atrair a riqueza',
    ],
    ebos: [
      'Ebó de Fartura: Oferecer seis tipos de frutas, amalá para Xangô, dar comida à terra e partilhar banquetes',
    ],
  },
  7: {
    numero: 7,
    nome: 'Odi',
    significado: 'A teimosia, o renascimento, as coisas ocultas, o poço profundo.',
    elementos: 'Terra/Água',
    orixaRegente: 'Omolu',
    quizilas: [
      'Dormir no escuro absoluto se estiver com medo',
      'Comer carne de caça',
      'Persistir no erro',
    ],
    preceitos: [
      'Praticar o desapego',
      'Aceitar as mudanças da vida',
      'Não cavar o próprio buraco com mágoas',
    ],
    ebos: [
      'Ebó de Transmutação: Pipoca (Deburu) para Omolu, banhos de lama ou argila, defumações pesadas com resinas',
    ],
  },
  8: {
    numero: 8,
    nome: 'EjiOníle',
    significado: 'A cabeça (Ori), a liderança, o topo do mundo, o sangue branco.',
    elementos: 'Ar/Água',
    orixaRegente: 'Oxalá',
    quizilas: ['Usar roupas pretas ou escuras', 'Comer carne vermelha em dias de preceito'],
    preceitos: [
      'Cuidar muito bem do próprio Ori (cabeça)',
      'Buscar a paz',
      'Evitar o orgulho e a arrogância',
    ],
    ebos: [
      'Ebó de Alinhamento (Bori): Oferendas de canjica branca, algodão, banhos de boldo (tapete de Oxalá) e velas brancas',
    ],
  },
  9: {
    numero: 9,
    nome: 'Ossá',
    significado: 'O vento, as transformações rápidas, o reino das Iyami (as bruxas ancestrais).',
    elementos: 'Ar/Água',
    orixaRegente: 'Iansã',
    quizilas: ['Espalhar fofocas', 'Ventanias fortes na praia', 'Usar roupas rasgadas'],
    preceitos: [
      'Respeitar o poder feminino',
      'Controlar a impulsividade e as palavras',
      'Fluir com as mudanças',
    ],
    ebos: [
      'Ebó de Limpeza Astral: Sacudimentos com folhas de fumo ou pinhão roxo, oferendas de acarajé para Iansã no vento',
    ],
  },
  10: {
    numero: 10,
    nome: 'Ofun',
    significado: 'O mistério, a velhice, a cura, o sopro divino. O Odú mais velho da criação.',
    elementos: 'Ar/Água',
    orixaRegente: 'Oxalá',
    quizilas: [
      'Usar roupas pretas',
      'Comer comida amanhecida',
      'Faltar com o respeito aos mais velhos',
    ],
    preceitos: [
      'Vestir-se de branco',
      'Manter o silêncio e a quietude',
      'Estudar a espiritualidade profunda',
    ],
    ebos: [
      'Ebó de Alívio/Saúde: Tudo neste Odú pede rezas mansas, frutas brancas, banhos de leite de cabra ou ervas calmas',
    ],
  },
  11: {
    numero: 11,
    nome: 'Owarin',
    significado: 'A pressa, a ansiedade, a mudança de rumo rápida. O vento que espalha as folhas.',
    elementos: 'Fogo/Ar',
    orixaRegente: 'Iansã',
    quizilas: [
      'Guardar objetos quebrados ou velhos em casa',
      'Procrastinar',
      'Roupas muito escuras',
    ],
    preceitos: [
      'Organizar a mente e a rotina',
      'Canalizar a ansiedade em atividades físicas ou artísticas',
    ],
    ebos: [
      'Ebó de Movimento: Rodar chaves, acender velas nas esquinas, banhos de ervas quentes (guiné, arruda)',
    ],
  },
  12: {
    numero: 12,
    nome: 'Ejilsebora',
    significado: 'A justiça, o fogo purificador, a guerra justa, os terremotos.',
    elementos: 'Fogo',
    orixaRegente: 'Xangô',
    quizilas: [
      'Praticar a injustiça',
      'Acobertar mentiras',
      'Comer abóbora ou quiabo em excesso nas crises',
    ],
    preceitos: [
      'Manter a integridade a todo custo',
      'Não julgar os outros sem provas',
      'Equilibrar a razão e a emoção',
    ],
    ebos: ['Ebó de Justiça: Firmezas com pedras de raio, amalá bem quente com folhas de fumo'],
  },
  13: {
    numero: 13,
    nome: 'Olobón',
    significado: 'A doença, as transformações físicas, o fim de ciclos. O recolhimento.',
    elementos: 'Terra/Água',
    orixaRegente: 'Nanã',
    quizilas: [
      'Ambientes sujos ou bagunçados',
      'Comer carne de rã ou tartaruga',
      'Reclamar da velhice',
    ],
    preceitos: [
      'Respeitar o tempo das coisas',
      'Buscar a sabedoria dos mais velhos',
      'Cuidar da saúde das articulações',
    ],
    ebos: [
      'Ebó de Evolução: Oferendas na lama ou no mangue para Nanã, ebó com feijão preto, velas lilases',
    ],
  },
  14: {
    numero: 14,
    nome: 'Iká',
    significado: 'A traição, a cobra que morde, a sabedoria oculta e a renovação da pele.',
    elementos: 'Água/Terra',
    orixaRegente: 'Oxumaré',
    quizilas: [
      'Falsidade',
      'Maltratar animais (especialmente répteis)',
      'Revelar segredos confiados',
    ],
    preceitos: [
      'Manter a discrição absoluta sobre sua vida pessoal',
      'Cultivar a flexibilidade perante os obstáculos',
    ],
    ebos: [
      'Ebó de Renovação: Banhos com folhas de fortuna e dinheiro-em-penca, amarrar fitas coloridas (7 cores)',
    ],
  },
  15: {
    numero: 15,
    nome: 'Ogbogbé',
    significado: 'A feitiçaria, o corte pesado, as disputas por espaço ou poder.',
    elementos: 'Fogo/Terra',
    orixaRegente: 'Obá',
    quizilas: [
      'Invejar o espaço alheio',
      'Comer comidas muito apimentadas perto de dormir',
      'Brigas domésticas',
    ],
    preceitos: [
      'Buscar a paz no lar',
      'Proteger a própria energia contra feitiçarias e inveja',
      'Focar no amor próprio',
    ],
    ebos: [
      'Ebó de Defesa: Oferendas com acarajés recheados, banhos de erva-de-bicho ou espada-de-santa-bárbara',
    ],
  },
  16: {
    numero: 16,
    nome: 'Alafia',
    significado: 'A paz absoluta, a luz total, a confirmação dos Deuses. Tudo está bem.',
    elementos: 'Ar/Luz',
    orixaRegente: 'Orunmilá',
    quizilas: [
      'Dúvidar da própria espiritualidade',
      'Orgulho',
      'Arrogância',
      'Não ouvir conselhos',
    ],
    preceitos: [
      'Manter as práticas espirituais em dia',
      'Compartilhar a sabedoria com quem precisa',
      'Ser grato',
    ],
    ebos: [
      'Ebó de Agradecimento: Flores brancas, oferendas de frutas doces e claras, acender lâmpadas ou muitas velas brancas',
    ],
  },
};

export function calcularOduNascimento(dataNascimento: string): {
  principal: OduInfo;
  secundario: OduInfo | null;
} {
  const numeros = dataNascimento.replace(/\D/g, '');

  let soma = 0;
  for (const digito of numeros) {
    soma += parseInt(digito);
  }

  while (soma > 16) {
    soma = soma
      .toString()
      .split('')
      .reduce((acc, d) => acc + parseInt(d), 0);
  }

  const principal = odusData[soma] || odusData[1];

  const somaSecundaria = numeros.split('').reduce((acc, d) => acc + parseInt(d) * 2, 0);
  const secundarioNum = ((somaSecundaria - 1) % 16) + 1;
  const secundario = odusData[secundarioNum] || null;

  return { principal, secundario };
}

export function getQuizilasPorOdu(oduNumero: number): string[] {
  return odusData[oduNumero]?.quizilas || [];
}

export function getPreceitosPorOdu(oduNumero: number): string[] {
  return odusData[oduNumero]?.preceitos || [];
}

export function getEbósPorOdu(oduNumero: number): string[] {
  return odusData[oduNumero]?.ebos || [];
}
