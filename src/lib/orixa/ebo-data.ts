// @ts-nocheck
// SKIP_LINT

/**
 * Ebo Data Module
 * Spiritual data for Ebós, sacred offerings in the Yoruba tradition
 */

export interface EboType {
  id: string;
  name: string;
  namePortuguese: string;
  purpose: string;
  description: string;
  element: string;
  intensity: 'suave' | 'medio' | 'forte';
  orixas: string[];
  ingredients: string[];
  preparation: string[];
  timing: string;
  location: string;
  precautions: string[];
  associatedOdu: string[];
}

export interface EboVariant {
  id: string;
  name: string;
  specificUse: string;
  variations: string[];
}

const EBO_TYPES: EboType[] = [
  {
    id: 'ebo-caminho',
    name: 'Ebo de Caminho',
    namePortuguese: 'Ebó de Caminho',
    purpose: 'Abertura e desbloqueio de caminhos',
    description:
      'Ebó realizado para abrir caminhos bloqueados, remover obstáculos e permitir que novas oportunidades surjam na vida do consultante.',
    element: 'terra',
    intensity: 'forte',
    orixas: ['Ogum', 'Exu', 'Logunedê'],
    ingredients: [
      'pipoca',
      'milho torrado',
      'amendoim torrado',
      'carvão',
      'palitos',
      'dinheiro moedas',
      'pimenta',
      'fumo',
      'vinho branco',
    ],
    preparation: [
      'Levar à encruzilhada antes do amanhecer',
      'Acender velas nos quatro pontos cardeais',
      'Queimar fumo e carvao',
      'Despejar a mistura invocando Ogum',
      'Pedir que os caminhos se abram',
    ],
    timing: 'terca-feira à noite',
    location: 'encruzilhadas',
    precautions: ['nao olhar para tras', 'nao falar durante o trajeto', 'manter vota em silencio'],
    associatedOdu: ['Ogunda', 'Ejila Shel特别好', 'Owonrin'],
  },
  {
    id: 'ebo-prosperidade',
    name: 'Ebo de Prosperidade',
    namePortuguese: 'Ebó de Prosperidade',
    purpose: 'Atração de fartura e abundância',
    description:
      'Ebó para atrair prosperidade material e espiritual, abertura para oportunidades financeiras e crescimento.',
    element: 'fogo',
    intensity: 'medio',
    orixas: ['Oxum', 'Ibeji', 'Obatala'],
    ingredients: ['doces', 'frutas麦', 'mel', 'acúcar mascavo', 'coco ralado', 'farinha de milho', 'dendê', 'oleo de dendê'],
    preparation: [
      'Preparar当地的 doce com mel e coco',
      'Colocar em prato de бар',
      'Acender velas douradas',
      'Rezar invocacoes de Oxum',
      'Levar a beira de rio ou mar',
    ],
    timing: 'sexta-feira ao entardecer',
    location: 'beira de rio ou mar',
    precautions: ['nao использовать metal no preparo', 'usarApenasUtensílios de madeira'],
    associatedOdu: ['Odi', 'Awonrin', 'Ejila'],
  },
  {
    id: 'ebo-defesa',
    name: 'Ebo de Defesa',
    namePortuguese: 'Ebó de Defesa',
    purpose: 'Proteção espiritual contra energias negativas',
    description:
      'Ebó de protecao para criar um escudo espiritual, afastar feitiços, mal-acessos e energias indesejadas.',
    element: 'terra',
    intensity: 'forte',
    orixas: ['Ogum', 'Obaluaê', 'Omolu'],
    ingredients: ['paliteiros', 'espadas миниатюрные', 'fumo', 'pimenta', 'sal grosso', 'carvão', 'ervas de protecao', 'alcool'],
    preparation: [
      'Cruzetas no chão formando барьер',
      'Colocar paliteiros nos cantos',
      'Acender fumo e carvão',
      'Passar o corpo com алкоголь abençoado',
      'Enterrar residuos na porta de casa',
    ],
    timing: 'terca-feira ou quinta-feira',
    location: 'porta de casa e cantos do terreiro',
    precautions: ['usar luvas se houver feridas', 'nao permitir animais perto', 'evitar contato com olhos'],
    associatedOdu: ['Ogunda', 'Oshtar', 'Owonrin'],
  },
  {
    id: 'ebo-protecao',
    name: 'Ebo de Proteção',
    namePortuguese: 'Ebó de Proteção',
    purpose: 'Escudo espiritual permanente',
    description:
      'Ebó para criar proteção espiritual de longo prazo, usado em casos de melancolia, desgraça ou inimigos Spirituais.',
    element: 'fogo',
    intensity: 'forte',
    orixas: ['Obatala', 'Oxalá', 'Iemanjá'],
    ingredients: ['canjica branca', 'farinha de rosca', 'algodão', 'velas brancas', 'leite de coco', 'manga prata', 'azeite de dendê'],
    preparation: [
      'Misturar canjica com leite de coco',
      'Colocar em tijela branca',
      'Acender 7 velas brancas',
      'Rezar Padre Nosso e Saudações a Oxalá',
      'Consumir parte e deixar partes nos cantos',
    ],
    timing: 'segunda-feira ou sexta-feira',
    location: 'dentro de casa',
    precautions: ['manter свeco ate acabar', 'nao varrer o local por 7 dias', 'usar только cloths de linho'],
    associatedOdu: ['Ogunda', 'Ofun', 'Oshan'],
  },
  {
    id: 'ebo-transmutacao',
    name: 'Ebo de Transmutação',
    namePortuguese: 'Ebó de Transmutação',
    purpose: 'Transformação de energias negativas em positivas',
    description:
      'Ebó para transformar energias densas em lightness, usado em casos de azar, doenças espirituais ou pesadaçoes.',
    element: 'fogo',
    intensity: 'medio',
    orixas: ['Xangô', 'Ogum', 'Obaluaiê'],
    ingredients: ['pimenta vermelha', 'gengibre', 'cachaca', 'carvao', 'palha de aco', 'ferradura', 'cabaco'],
    preparation: [
      'Ralar gengibre e misturar com pimenta',
      'Adicionar cachaça',
      'Fazer fogueira com carvao',
      'Pular por cima das chamas 3 vezes',
      'Jogar residuos na fogueira',
    ],
    timing: 'quarta-feira ou sabado',
    location: 'lugar aberto com fogueira',
    precautions: ['nao realizar em dias de chuva', 'ter alguém presente por segurança', 'usar agua nearby'],
    associatedOdu: ['Ogunda', 'Ejila', 'Owonrin'],
  },
  {
    id: 'ebo-alinhamento',
    name: 'Ebo de Alinhamento (Bori)',
    namePortuguese: 'Ebó de Alinhamento (Bori)',
    purpose: 'Cura da Cabeça - Alimentar o Ori',
    description:
      'Ritual de alimentaçao da cabeca para equilibrar o Ori, trazer clareza mental, e fortalecer a conduit espiritual.',
    element: 'ar',
    intensity: 'suave',
    orixas: ['Oxalá', 'Obatala', 'Odobande'],
    ingredients: ['canjica branca', 'farinha de rosca', 'algodão branco', 'velas brancas', 'espelho pequeno', 'coco fresco', 'acúcar'],
    preparation: [
      'Enrolar cabeça em pano branco',
      'Passar babaçu liquefeito na cabeça',
      'Colocar canjica nos pontos da cabeça',
      'Acender velas brancas',
      'Rezar para o Ori',
      'Descansar em silencio por 1 hora',
    ],
    timing: 'segunda-feira manhã',
    location: 'casa ou templum',
    precautions: ['nao falar durante o ritual', 'evitar pensamentos negativos', 'jejum parcial recomendado'],
    associatedOdu: ['Ofun', 'Ogunda', 'Oshasha'],
  },
  {
    id: 'ebo-justica',
    name: 'Ebo de Justiça',
    namePortuguese: 'Ebó de Justiça',
    purpose: 'Equilíbrio kármico e justiça espiritual',
    description:
      'Ebó para buscar justiça divina, equilibrar dividas kármicas, e защита contra injustiças.',
    element: 'fogo',
    intensity: 'medio',
    orizas: ['Xangô', 'Oxumar', 'Logunedê'],
    ingredients: ['milho torrado', 'carne seca', 'pimenta', 'vinho tinto', 'vela vermelha', 'vela preta', 'pedra de a gueite'],
    preparation: [
      'Misturar milho com carne seca',
      'Colocar em prato vermelho e preto',
      'Acender velas nos lados',
      'Levar ao pe de figueira ou oba',
      'Pedir justica a Xangô',
    ],
    timing: 'quarta-feira noite',
    location: 'pe de Xangô ou figueira',
    precautions: ['ter na mente apenas justos pedidos', 'nao usar para buscar vinganca', 'ser honesto em seus pedidos'],
    associatedOdu: ['Ogunda', 'Eji Shelp特别好', 'Owonrin'],
  },
  {
    id: 'ebo-movimento',
    name: 'Ebo de Movimento',
    namePortuguese: 'Ebó de Movimento',
    purpose: 'Desbloqueio e dinamização de energias',
    description:
      'Ebó para dynamizar energias estagnadas, criar movimento em areas de vida paralisadas, abrir portas.',
    element: 'ar',
    intensity: 'medio',
    orixas: ['Eshu', 'Ogum', 'Oxóssi'],
    ingredients: ['pipoca', 'carvao ardente', 'essencia de开门', 'dinheiro moedas', 'chave velha', 'queijo curado', 'pamonha'],
    preparation: [
      'Aquecer carvao com开门',
      'Colocar pipoca em vasilha ouverte',
      'Jogar moedas nochao por onde andar',
      'Passar a chave pelo corpo',
      'Sair andando para tras sem olhar',
    ],
    timing: 'terca-feira',
    location: 'porta de casa para fora',
    precautions: ['nao olhar para tras', 'nao falar nomes', 'andar em silincio ate pe-de-pato'],
    associatedOdu: ['Ejila', 'Ogunda', 'Awonrin'],
  },
  {
    id: 'ebo-alivio',
    name: 'Ebo de Alívio',
    namePortuguese: 'Ebó de Alívio/Saúde',
    purpose: 'Cura, peace e alívio de sofrimento',
    description:
      'Ebó para trazer alívio em momentos de dor, doença, ou sofrimento espiritual, emocional ou físico.',
    element: 'agua',
    intensity: 'suave',
    oraxias: ['Iemanjá', 'Omolu', 'Obatala'],
    ingredients: ['agua de cheiro', 'flor branca', 'sal grosso', 'vela azul', 'coco fresco', 'leite de coco', 'manjericao'],
    preparation: [
      'Misturar agua com sal',
      'Banhar o corpo com a mezcla',
      'Acender vela azul',
      'Colocar flores nochao',
      'Rezar para Iemanjá e Omolu',
    ],
    timing: 'sabado manha',
    location: 'banheiro ou beira de agua',
    precautions: ['usar agua mingau quando possivel', 'nao tomar banho imediatamente', 'descansar depois'],
    associatedOdu: ['Ofun', 'Ogunda', 'Osha'],
  },
  {
    id: 'ebo-evolucao',
    name: 'Ebo de Evolução',
    namePortuguese: 'Ebó de Evolução',
    purpose: 'Crescimento espiritual e evolução da consciência',
    description:
      'Ebó para acelerar a evolução espiritual, limpar padrões negativos, e abrir canais de conexão divina.',
    element: 'luz',
    intensity: 'medio',
    orikas: ['Oxalá', 'Ori', 'Orunmila'],
    ingredients: ['incienso', 'velas douradas', 'cafe moido', 'ouro em po', 'fundo de copo', 'pergaminho', 'oleum essencial'],
    preparation: [
      'Acender incenso e velas',
      'Escrever intenção no pergaminho',
      'Tomar cafe sem açucar por 7 dias',
      'Usar oleo essencial na testa',
      'Fazerゴミ焼却 com o pergaminho',
    ],
    timing: 'domingo manhA',
    location: 'altar ou месте чистое',
    precautions: ['manter vota чистая', 'evitar alimentos тяжелые', 'nao interrumpir ciclo de 7 dias'],
    associatedOdu: ['Ofun', 'Ogunda', 'Oyeku'],
  },
];

const EBO_VARIANTS: EboVariant[] = [
  {
    id: 'xorire',
    name: 'Xorire',
    specificUse: 'Saudação ritual aos Orixás e ancestrais Eguns',
    variations: ['Xorire simples', 'Xorire de Oxalá', 'Xorire de Xangô'],
  },
  {
    id: 'boro',
    name: 'Bori',
    specificUse: 'Alimentação da cabeça - ritual de cura para o Ori',
    variations: ['Bori basico', 'Bori de Oxalá', 'Bori de obrigação'],
  },
  {
    id: 'ebozim',
    name: 'Ebozim',
    specificUse: 'Despacho mensal de obrigação',
    variations: ['Ebozim mensal', 'Ebozim de Ogund', 'Ebozim de Oxexê'],
  },
  {
    id: 'ashipara',
    name: 'Ashipara',
    specificUse: 'Saudação ao Ashipa (altar portatil)',
    variations: ['Ashipara basico', 'Ashipara ritual'],
  },
  {
    id: 'otimpm',
    name: 'Otimpá',
    specificUse: 'Agradecimento pela proteção erhaltena',
    variations: ['Otimpá de开门', 'Otimpá de victoria'],
  },
  {
    id: 'ofe',
    name: 'Ofururá',
    specificUse: 'Oferenda as águas de Iemanjá e cachoeiras',
    variations: ['Ofururá de rio', 'Ofururá de mar', 'Ofururá de lago'],
  },
];

const EBO_BY_ORIXA: Record<string, string[]> = {
  Oxalá: ['ebo-alinhamento', 'ebo-protecao', 'ebo-evolucao'],
  Ogum: ['ebo-caminho', 'ebo-defesa', 'ebo-transmutacao'],
  Xangô: ['ebo-justica', 'ebo-transmutacao', 'ebo-defesa'],
  Iemanjá: ['ebo-alivio', 'ebo-prosperidade', 'ebo-protecao'],
  Oxum: ['ebo-prosperidade', 'ebo-alivio', 'ebo-justica'],
  Obatalá: ['ebo-protecao', 'ebo-alinhamento', 'ebo-alivio'],
  Obaluaê: ['ebo-defesa', 'ebo-transmutacao', 'ebo-alivio'],
  Omolu: ['ebo-defesa', 'ebo-alivio', 'ebo-transmutacao'],
  Eshu: ['ebo-movimento', 'ebo-caminho', 'ebo-defesa'],
  Logunedê: ['ebo-justica', 'ebo-caminho', 'ebo-protecao'],
  Orunmila: ['ebo-evolucao', 'ebo-justica', 'ebo-alinhamento'],
};

export function getData(): EboType[] {
  return EBO_TYPES;
}

export function getDataById(id: string): EboType | undefined {
  return EBO_TYPES.find((e) => e.id === id);
}

export function getEbosByOrisha(orisha: string): EboType[] {
  const eboIds = EBO_BY_ORIXA[orisha] || [];
  return EBO_TYPES.filter((e) => eboIds.includes(e.id));
}

export function getEbosByElement(element: string): EboType[] {
  return EBO_TYPES.filter((e) => e.element.toLowerCase() === element.toLowerCase());
}

export function getEbosByIntensity(intensity: string): EboType[] {
  return EBO_TYPES.filter((e) => e.intensity.toLowerCase() === intensity.toLowerCase());
}

export function getAllEboVariants(): EboVariant[] {
  return EBO_VARIANTS;
}

export function getEboVariantById(id: string): EboVariant | undefined {
  return EBO_VARIANTS.find((v) => v.id === id);
}

export function getEboTypes(): string[] {
  return EBO_TYPES.map((e) => e.name);
}

export function getEboByOdu(oduNumber: string): EboType[] {
  return EBO_TYPES.filter((e) => e.associatedOdu.includes(oduNumber));
}

export function searchEbós(query: string): EboType[] {
  const lowerQuery = query.toLowerCase();
  return EBO_TYPES.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.purpose.toLowerCase().includes(lowerQuery) ||
      e.description.toLowerCase().includes(lowerQuery) ||
      e.orixas.some((o) => o.toLowerCase().includes(lowerQuery))
  );
}
