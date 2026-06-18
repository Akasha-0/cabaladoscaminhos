// Odu Data - Ifa Divination System - Cabala Dos Caminhos
// Odus do Merindilogun with traditional information

/**
 * Odu data interface
 */
export interface OduInfo {
  numero: number;
  nome: string;
  significado: string;
  elementos: string;
  orixas: string[];
  quizilas: string[];
  preceitos: string;
  ebo: string;
}

/**
 * Complete Odu data
 */
export const oduData: OduInfo[] = [
  {
    numero: 1,
    nome: 'Okaran',
    significado:
      'O começo, a dúvida, a insubordinação. Caminho difícil, mas de grande aprendizado.',
    elementos: 'Terra / Fogo',
    orixas: ['Exu', 'Omolu'],
    quizilas: ['Carne de porco', 'Cachaça em excesso', 'Andar na rua ao meio-dia ou meia-noite'],
    preceitos:
      'Cultivar a paciência; não agir por impulso; cuidar rigorosamente de Exu e dos antepassados.',
    ebo: 'Ebó de Caminho/Limpeza: Despachos em encruzilhadas, moedas, pipoca e panos escuros para abrir caminhos.',
  },
  {
    numero: 2,
    nome: 'Ejiokô',
    significado: 'A dualidade, os caminhos duplos, união e disputa. Vitória após grandes lutas.',
    elementos: 'Ar / Terra',
    orixas: ['Ibeji', 'Ogum'],
    quizilas: ['Comer ovos', 'Rã', 'Mentir ou trair a confiança dos outros'],
    preceitos: 'Manter a alegria interna; cuidar da criança interior; buscar sociedades justas.',
    ebo: 'Ebó de Prosperidade: Doces, frutas para Ibeji, e comidas leves em praças ou jardins.',
  },
  {
    numero: 3,
    nome: 'Etaogundá',
    significado: 'A revolta, a força física, a criação de ferramentas. O corte e a separação.',
    elementos: 'Fogo / Terra',
    orixas: ['Ogum', 'Obaluaê'],
    quizilas: [
      'Usar facas ou objetos cortantes sem necessidade',
      'Carne de galo',
      'Violência verbal',
    ],
    preceitos:
      'Evitar brigas e discussões; manter o foco no trabalho e na justiça; não demandar contra os outros.',
    ebo: 'Ebó de Defesa: Inhames assados, paliteiros de Ogum, limpeza com folhas de mariô e limpeza com ferro.',
  },
  {
    numero: 4,
    nome: 'Irosun',
    significado: 'O aviso, o sangue que corre nas veias, a visão espiritual. Olhar para o futuro.',
    elementos: 'Fogo / Terra',
    orixas: ['Iemanjá', 'Oxóssi', 'Egum'],
    quizilas: [
      'Olhar para buracos vazios',
      'Usar roupas muito vermelhas em momentos de crise',
      'Mentira',
    ],
    preceitos:
      'Desenvolver a intuição; não ignorar avisos e sonhos; cuidar da saúde do sangue e dos olhos.',
    ebo: 'Ebó de Proteção: Alimentos brancos, canjica na beira mar para Iemanjá, banhos de folhas frias (colônia, saião).',
  },
  {
    numero: 5,
    nome: 'Oxé',
    significado: 'O ouro, a doçura, a feitiçaria, a vaidade e a lágrima. Sangue menstrual.',
    elementos: 'Água',
    orixas: ['Oxum', 'Logun Edé'],
    quizilas: [
      'Comer ovos',
      'Comidas muito salgadas ou azedas',
      'Chorar miséria ou reclamar da vida',
    ],
    preceitos:
      'Cuidar da autoestima; usar perfumes; manter a higiene espiritual; buscar a diplomacia.',
    ebo: 'Ebó de Atração/Ouro: Banhos de mel, caldas de frutas, oferendas com girassóis e moedas douradas em águas doces.',
  },
  {
    numero: 6,
    nome: 'Obará',
    significado: 'A riqueza, a fartura, a sabedoria e a surpresa. O rei que se veste de mendigo.',
    elementos: 'Ar / Fogo',
    orixas: ['Xangô', 'Oxóssi', 'Logun Edé'],
    quizilas: ['Inveja', 'Contar planos antes de realizá-los', 'Comer abóbora', 'Teimosia extrema'],
    preceitos:
      'Ser generoso; estudar; manter a cabeça erguida; praticar a gratidão para atrair a riqueza.',
    ebo: 'Ebó de Fartura: Oferecer seis tipos de frutas, amalá para Xangô, dar comida à terra e partilhar banquetes.',
  },
  {
    numero: 7,
    nome: 'Odi',
    significado: 'A teimosia, o renascimento, as coisas ocultas, o poço profundo.',
    elementos: 'Terra / Água',
    orixas: ['Omolu', 'Oxumaré', 'Exu'],
    quizilas: [
      'Dormir no escuro absoluto se estiver com medo',
      'Comer carne de caça',
      'Persistir no erro',
    ],
    preceitos:
      'Praticar o desapego; aceitar as mudanças da vida; não cavar o próprio buraco com mágoas.',
    ebo: 'Ebó de Transmutação: Pipoca (Deburu) para Omolu, banhos de lama ou argila, defumações pesadas com resinas.',
  },
  {
    numero: 8,
    nome: 'EjiOníle',
    significado: 'A cabeça (Ori), a liderança, o topo do mundo, o sangue branco.',
    elementos: 'Ar / Água',
    orixas: ['Oxalá', 'Jagun'],
    quizilas: [
      'Usar roupas pretas ou escuras',
      'Comer carne de sangue (carne vermelha) em dias de preceito',
    ],
    preceitos:
      'Cuidar muito bem do próprio Ori (cabeça); buscar a paz; evitar o orgulho e a arrogância.',
    ebo: 'Ebó de Alinhamento (Bori): Oferendas de canjica branca, algodão, banhos de boldo (tapete de Oxalá) e velas brancas.',
  },
  {
    numero: 9,
    nome: 'Ossá',
    significado: 'O vento, as transformações rápidas, o reino das Iyami (as bruxas ancestrais).',
    elementos: 'Ar / Água',
    orixas: ['Iansã', 'Iemanjá'],
    quizilas: [
      'Espalhar fofocas',
      'Ventanias fortes na praia (evitar banho de mar nesses dias)',
      'Usar roupas rasgadas',
    ],
    preceitos:
      'Respeitar o poder feminino; controlar a impulsividade e as palavras; fluir com as mudanças.',
    ebo: 'Ebó de Limpeza Astral: Sacudimentos com folhas de fumo ou pinhão roxo, oferendas de acarajé para Iansã no vento.',
  },
  {
    numero: 10,
    nome: 'Ofun',
    significado: 'O mistério, a velhice, a cura, o sopro divino. O Odú mais velho da criação.',
    elementos: 'Ar / Água',
    orixas: ['Oxalá (Suficiente)', 'Obá'],
    quizilas: [
      'Usar roupas pretas',
      'Comer comida amanhecida',
      'Faltar com o respeito aos mais velhos',
    ],
    preceitos:
      'Vestir-se de branco; manter o silêncio e a quietude; estudar a espiritualidade profunda.',
    ebo: 'Ebó de Alívio/Saúde: Tudo neste Odú pede rezas mansas, frutas brancas, banhos de leite de cabra ou ervas calmas.',
  },
  {
    numero: 11,
    nome: 'Owarin',
    significado: 'A pressa, a ansiedade, a mudança de rumo rápida. O vento que espalha as folhas.',
    elementos: 'Fogo / Ar',
    orixas: ['Iansã', 'Exu', 'Ogum'],
    quizilas: [
      'Guardar objetos quebrados ou velhos em casa',
      'Procrastinar',
      'Roupas muito escuras',
    ],
    preceitos:
      'Organizar a mente e a rotina; canalizar a ansiedade em atividades físicas ou artísticas.',
    ebo: 'Ebó de Movimento: Rodar chaves, acender velas nas esquinas, banhos de ervas quentes (guiné, arruda).',
  },
  {
    numero: 12,
    nome: 'Ejilsebora',
    significado: 'A justiça, o fogo purificador, a guerra justa, os terremotos.',
    elementos: 'Fogo',
    orixas: ['Xangô', 'Obá'],
    quizilas: [
      'Praticar a injustiça',
      'Acobertar mentiras',
      'Comer abóbora ou quiabo em excesso nas crises',
    ],
    preceitos:
      'Manter a integridade a todo custo; não julgar os outros sem provas; equilibrar a razão e a emoção.',
    ebo: 'Ebó de Justiça: Firmezas com pedras de raio (meteoritos/quartzo marrom), amalá bem quente com folhas de fumo.',
  },
  {
    numero: 13,
    nome: 'Olobón',
    significado: 'A doença, as transformações físicas, o fim de ciclos. O recolhimento.',
    elementos: 'Terra / Água',
    orixas: ['Nanã', 'Omolu'],
    quizilas: [
      'Ambientes sujos ou bagunçados',
      'Comer carne de rã ou tartaruga',
      'Reclamar da velhice',
    ],
    preceitos:
      'Respeitar o tempo das coisas; buscar a sabedoria dos mais velhos; cuidar da saúde das articulações.',
    ebo: 'Ebó de Evolução: Oferendas na lama ou no mangue para Nanã, ebó com feijão preto, velas lilases.',
  },
  {
    numero: 14,
    nome: 'Iká',
    significado: 'A traição, a cobra que morde, a sabedoria oculta e a renovação da pele.',
    elementos: 'Água / Terra',
    orixas: ['Oxumaré', 'Ossain'],
    quizilas: [
      'Falsidade',
      'Maltratar animais (especialmente répteis)',
      'Revelar segredos confiados a você',
    ],
    preceitos:
      'Manter a discrição absoluta sobre sua vida pessoal; cultivar a flexibilidade perante os obstáculos.',
    ebo: 'Ebó de Renovação: Banhos com folhas de fortuna e dinheiro-em-penca, amarrar fitas coloridas (7 cores).',
  },
  {
    numero: 15,
    nome: 'Ogbogbé',
    significado: 'A feitiçaria, o corte pesado, as disputas por espaço ou poder.',
    elementos: 'Fogo / Terra',
    orixas: ['Obá', 'Ewá', 'Ogum'],
    quizilas: [
      'Invejar o espaço alheio',
      'Comer comidas muito apimentadas perto de dormir',
      'Brigas domésticas',
    ],
    preceitos:
      'Buscar a paz no lar; proteger a própria energia contra feitiçarias e inveja; focar no amor próprio.',
    ebo: 'Ebó de Defesa: Oferendas com acarajés recheados, banhos de erva-de-bicho ou espada-de-santa-bárbara.',
  },
  {
    numero: 16,
    nome: 'Alafia',
    significado: 'A paz absoluta, a luz total, a confirmação dos Deuses. Tudo está bem.',
    elementos: 'Ar / Luz',
    orixas: ['Orunmilá', 'Oxalá'],
    quizilas: [
      'Duvidar da própria espiritualidade',
      'Orgulho',
      'Arrogância',
      'Não ouvir conselhos',
    ],
    preceitos:
      'Manter as práticas espirituais em dia; compartilhar a sabedoria com quem precisa; ser grato.',
    ebo: 'Ebó de Agradecimento: Flores brancas, oferendas de frutas doces e claras, acender lâmpadas ou muitas velas brancas.',
  },
];

/**
 * Get all Odus
 */
export function getOdus(): OduInfo[] {
  return oduData;
}

/**
 * Get Odu by number
 */
export function getOduByNumero(numero: number): OduInfo | undefined {
  return oduData.find((o) => o.numero === numero);
}

/**
 * Get Odu by name
 */
export function getOduByNome(nome: string): OduInfo | undefined {
  return oduData.find((o) => o.nome.toLowerCase() === nome.toLowerCase());
}

/**
 * Get all Quizilas across all Odus
 */
export function getAllQuizilas(): string[] {
  return oduData.flatMap((o) => o.quizilas);
}

/**
 * Get all Ebos across all Odus
 */
export function getAllEbós(): string[] {
  return oduData.map((o) => o.ebo);
}

/**
 * Get Orixas that appear across all Odus
 */
export function getAllOrixas(): string[] {
  const orixas = oduData.flatMap((o) => o.orixas);
  return [...new Set(orixas)].sort();
}
