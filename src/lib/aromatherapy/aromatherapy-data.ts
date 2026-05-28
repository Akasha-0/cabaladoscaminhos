// Aromatherapy data for essential oils, blends, and their spiritual/healing properties

export interface OilProperties {
  id: string;
  nome: string;
  nomecientifico: string;
  familia: string;
  nota: 'topo' | 'meio' | 'base';
  intensidade: 1 | 2 | 3;
  elementos: string[];
  chakras: number[];
  propriedades: string[];
  humor: string[];
  usocontraindicado: string[];
}

export interface BlendProperties {
  id: string;
  nome: string;
  descricao: string;
  oleos: string[];
  proporcoes: string;
  propspiritual: string;
  usoterapeutico: string;
  momentos: string[];
  combinacoes: string[];
}

export interface AromatherapyData {
  oleos: OilProperties[];
  blends: BlendProperties[];
}

export const OLEOS_ESSENCIAIS: OilProperties[] = [
  {
    id: 'lavanda',
    nome: 'Lavanda',
    nomecientifico: 'Lavandula angustifolia',
    familia: 'Lamiaceae',
    nota: 'meio',
    intensidade: 2,
    elementos: ['terra', 'agua'],
    chakras: [1, 4, 6],
    propriedades: ['calmante', 'sedativo', 'analgesico', 'antidepressivo', 'cicatrizante'],
    humor: ['ansiedade', 'estresse', 'insonia', 'tensao'],
    usocontraindicado: ['hipotensao', 'cirurgia']
  },
  {
    id: 'rosa',
    nome: 'Rosa',
    nomecientifico: 'Rosa damascena',
    familia: 'Rosaceae',
    nota: 'base',
    intensidade: 2,
    elementos: ['agua', 'fogo'],
    chakras: [4, 5, 6],
    propriedades: ['harmonizador', 'cardiotonico', 'antiinflamatorio', 'afrodisiaco'],
    humor: ['tristeza', 'coracao partido', 'dores emocionais'],
    usocontraindicado: ['gravidez primeiro trimestre']
  },
  {
    id: 'sandia',
    nome: 'Sândalo',
    nomecientifico: 'Santalum album',
    familia: 'Santalaceae',
    nota: 'base',
    intensidade: 1,
    elementos: ['agua', 'ETER'],
    chakras: [4, 6, 7],
    propriedades: ['meditativo', 'grounding', 'antiseptico', 'anticancerigeno'],
    humor: ['ansiedade espiritual', 'confusao mental'],
    usocontraindicado: ['alergia a productos de madeira']
  },
  {
    id: 'incenso',
    nome: 'Incenso',
    nomecientifico: 'Boswellia carterii',
    familia: 'Burseraceae',
    nota: 'base',
    intensidade: 2,
    elementos: ['fogo', 'ETER'],
    chakras: [5, 6, 7],
    propriedades: ['purificador', 'meditativo', 'antiinflamatorio', 'expectorante'],
    humor: ['medo', 'ansiedade', 'conexao espiritual'],
    usocontraindicado: ['gravidez', 'pele sensivel']
  },
  {
    id: 'cidreira',
    nome: 'Cidreira',
    nomecientifico: 'Melissa officinalis',
    familia: 'Lamiaceae',
    nota: 'topo',
    intensidade: 3,
    elementos: ['agua', 'ar'],
    chakras: [3, 4, 6],
    propriedades: ['antidepressivo', 'sedativo', 'antiviral', 'cardiotonico'],
    humor: ['ansiedade', 'depressao', 'palpitacoes'],
    usocontraindicado: ['glaucoma', 'hipotensao']
  },
  {
    id: 'bergamota',
    nome: 'Bergamota',
    nomecientifico: 'Citrus bergamia',
    familia: 'Rutaceae',
    nota: 'topo',
    intensidade: 3,
    elementos: ['fogo', 'agua'],
    chakras: [3, 4, 5],
    propriedades: ['ansiolitico', 'antimicrobiano', 'analgesico', 'cicatrizante'],
    humor: ['estresse', 'ansiedade', 'fobias'],
    usocontraindicado: ['uso fotosensibilizante ao sol']
  },
  {
    id: 'mirra',
    nome: 'Mirra',
    nomecientifico: 'Commiphora myrrha',
    familia: 'Burseraceae',
    nota: 'base',
    intensidade: 2,
    elementos: ['fogo', 'terra'],
    chakras: [1, 4, 7],
    propriedades: ['antisseptico', 'antiinflamatorio', 'cicatrizante', 'immunomodulador'],
    humor: ['tristeza profunda', 'meditacao'],
    usocontraindicado: ['gravidez', 'interacoes com anticoagulantes']
  },
  {
    id: 'patchouli',
    nome: 'Patchouli',
    nomecientifico: 'Pogostemon cablin',
    familia: 'Lamiaceae',
    nota: 'base',
    intensidade: 2,
    elementos: ['terra', 'agua'],
    chakras: [1, 2, 4],
    propriedades: ['grounding', 'afrodisiaco', 'antiinflamatorio', 'antidepressivo'],
    humor: ['inseguranca', 'confusao', 'apatia'],
    usocontraindicado: ['pequenas aplicacoes em piel sensible']
  },
  {
    id: 'jazmin',
    nome: 'Jasmim',
    nomecientifico: 'Jasminum officinale',
    familia: 'Oleaceae',
    nota: 'base',
    intensidade: 3,
    elementos: ['agua', 'ETER'],
    chakras: [4, 5, 6],
    propriedades: ['afrodisiaco', 'antidepressivo', 'analgesico', 'anticancerigeno'],
    humor: ['depressao', 'frustracao', 'baixa autoestima'],
    usocontraindicado: ['usar com moderacao en piel sensible']
  },
  {
    id: 'ylang-ylang',
    nome: 'Ylang-Ylang',
    nomecientifico: 'Cananga odorata',
    familia: 'Annonaceae',
    nota: 'base',
    intensidade: 3,
    elementos: ['agua', 'fogo'],
    chakras: [2, 4, 6],
    propriedades: ['afrodisiaco', 'antidepressivo', 'sedativo', 'antihipertensivo'],
    humor: ['stress', 'raiva', 'jealousia'],
    usocontraindicado: ['hipotensao', 'dores de cabeca frecuentes']
  },
  {
    id: 'limao',
    nome: 'Limão Siciliano',
    nomecientifico: 'Citrus limon',
    familia: 'Rutaceae',
    nota: 'topo',
    intensidade: 3,
    elementos: ['ar', 'fogo'],
    chakras: [3, 6],
    propriedades: ['energizante', 'clarificador', 'antimicrobiano', 'antidepressivo'],
    humor: ['fadiga mental', 'confusao', 'negatividade'],
    usocontraindicado: ['fotossensibilidade']
  },
  {
    id: 'peppermint',
    nome: 'Hortelã-Pimenta',
    nomecientifico: 'Mentha piperita',
    familia: 'Lamiaceae',
    nota: 'topo',
    intensidade: 3,
    elementos: ['ar', 'fogo'],
    chakras: [5, 6],
    propriedades: ['estimulante mental', 'analgesico', 'antisseptico', 'antiemetico'],
    humor: ['confusao mental', 'fadiga', 'dores de cabeca'],
    usocontraindicado: ['bebes', 'coracao']
  },
  {
    id: 'frankincense',
    nome: 'Olibano',
    nomecientifico: 'Boswellia sacra',
    familia: 'Burseraceae',
    nota: 'base',
    intensidade: 2,
    elementos: ['ETER', 'fogo'],
    chakras: [6, 7],
    propriedades: ['meditativo', 'anticancerigeno', 'antiinflamatorio', 'immunomodulador'],
    humor: ['conexao espiritual', 'medo existencial'],
    usocontraindicado: ['gravidez']
  },
  {
    id: 'cedro',
    nome: 'Cedro do Atlas',
    nomecientifico: 'Cedrus atlantica',
    familia: 'Pinaceae',
    nota: 'base',
    intensidade: 2,
    elementos: ['terra', 'agua'],
    chakras: [1, 2, 4],
    propriedades: ['grounding', 'anticancerigeno', 'antisseptico', 'diuretico'],
    humor: ['ansiedade', 'stress', 'confusao'],
    usocontraindicado: ['epilessia', 'gravidez']
  },
  {
    id: 'palmarosa',
    nome: 'Palmarosa',
    nomecientifico: 'Cymbopogon martini',
    familia: 'Poaceae',
    nota: 'meio',
    intensidade: 2,
    elementos: ['agua', 'terra'],
    chakras: [2, 4],
    propriedades: ['hidratante', 'antibacteriano', 'antiviral', 'regulador emocional'],
    humor: ['instabilidade emocional', 'stress'],
    usocontraindicado: ['usar diluido']
  },
  {
    id: 'vetiver',
    nome: 'Vetiver',
    nomecientifico: 'Vetiveria zizanoides',
    familia: 'Poaceae',
    nota: 'base',
    intensidade: 1,
    elementos: ['terra', 'agua'],
    chakras: [1, 2, 4],
    propriedades: ['grounding profundo', 'antisseptico', 'cicatrizante', 'calmante nervioso'],
    humor: ['trauma', 'pânico', 'stress severo'],
    usocontraindicado: ['usar com moderacao']
  },
  {
    id: 'geranio',
    nome: 'Gerânio',
    nomecientifico: 'Pelargonium graveolens',
    familia: 'Geraniaceae',
    nota: 'meio',
    intensidade: 2,
    elementos: ['agua', 'terra'],
    chakras: [4, 6],
    propriedades: ['harmonizador hormonal', 'adstringente', 'antiinflamatorio', 'antidepressivo'],
    humor: ['desequilibrio hormonal', 'irritabilidade'],
    usocontraindicado: ['cancer hormono-dependente']
  },
  {
    id: 'romero',
    nome: 'Alecrim',
    nomecientifico: 'Rosmarinus officinalis',
    familia: 'Lamiaceae',
    nota: 'topo',
    intensidade: 3,
    elementos: ['fogo', 'ar'],
    chakras: [3, 5, 6],
    propriedades: ['estimulante mental', 'analgesico', 'antiviral', 'anticancerigeno'],
    humor: ['fadiga mental', 'apatia', 'memoria fraca'],
    usocontraindicado: ['epilessia', 'hipertensao', 'gravidez']
  }
];

export const BLENDS_AROMATERAPIA: BlendProperties[] = [
  {
    id: 'calma-sagrada',
    nome: 'Calma Sagrada',
    descricao: 'Blend para meditação profunda e conexão espiritual',
    oleos: ['lavanda', 'sandia', 'incenso'],
    proporcoes: '4:2:1',
    propspiritual: 'Abre canais de comunicação com o divino, purifica a aura e promove estado meditativo',
    usoterapeutico: 'Ansiedade, insônia, tensão muscular',
    momentos: ['meditacao', 'yoga', 'ritual'],
    combinacoes: ['chakra-coroa', 'sagrado-feminino']
  },
  {
    id: 'protecao-energetica',
    nome: 'Proteção Energética',
    descricao: 'Escudo de proteção contra energias negativas',
    oleos: ['incenso', 'mirra', 'cedro'],
    proporcoes: '3:2:2',
    propspiritual: 'Cria barreira protetora, purifica espaços e afasta energias densas',
    usoterapeutico: 'Medo, vulnerabilidade, purificação de ambiente',
    momentos: ['limpeza-espaco', 'ritual-de-protecao'],
    combinacoes: ['protecao-aura']
  },
  {
    id: 'cura-coracao',
    nome: 'Cura do Coração',
    descricao: 'Blend para cura emocional e abertura do coração',
    oleos: ['rosa', 'bergamota', 'ylang-ylang'],
    proporcoes: '3:2:1',
    propspiritual: 'Liberta dores antigas, abre o chakra cardíaco, atrai amor e compaixão',
    usoterapeutico: 'Tristeza, coração partido, dificuldades em amar',
    momentos: ['autocura', 'trabalho-de-inner-child'],
    combinacoes: ['chakra-cardiaco', 'amor-proprio']
  },
  {
    id: 'grounding-terra',
    nome: 'Grounding Terrestre',
    descricao: 'Conexão com a energia da Terra para estabilidade',
    oleos: ['patchouli', 'vetiver', 'cedro'],
    proporcoes: '2:3:1',
    propspiritual: 'Ancora a energia ao plano físico, traz estabilidade e segurança interior',
    usoterapeutico: 'Ansiedade, desorientação, sensação de estar fora do corpo',
    momentos: ['daily-grounding', 'trabalho-com-raizes'],
    combinacoes: ['chakra-raiz', 'terra-mae']
  },
  {
    id: 'claridade-mental',
    nome: 'Clareza Mental',
    descricao: 'Blend para foco, concentração e clareza mental',
    oleos: ['romero', 'limao', 'peppermint'],
    proporcoes: '2:3:1',
    propspiritual: 'Abre o terceiro olho, melhora a percepção e fortalece a mente',
    usoterapeutico: 'Confusão mental, falta de foco, baixa produtividade',
    momentos: ['trabalho', 'estudo', 'decisoes-importantes'],
    combinacoes: ['chakra-terceiro-olho', 'sabedoria']
  },
  {
    id: 'amor-sagrado',
    nome: 'Amor Sagrado',
    descricao: 'Blend para aprofundar conexões amorosas e espiritualidade',
    oleos: ['jazmin', 'rosa', 'ylang-ylang', 'sandia'],
    proporcoes: '2:2:1:1',
    propspiritual: 'Eleva a energia amorosa ao plano divino, fortalece laços sagrados',
    usoterapeutico: 'Relacionamentos, autocompaixão, energia receptiva',
    momentos: ['ritual-de-amor', 'meditacao-cardiaca'],
    combinacoes: ['chakra-cardiaco', 'amor-divino']
  },
  {
    id: 'sono-sagrado',
    nome: 'Sono Sagrado',
    descricao: 'Blend para noite de sono reparador e proteção enquanto dorme',
    oleos: ['lavanda', 'sandia', 'vetiver'],
    proporcoes: '3:2:1',
    propspiritual: 'Promove sonhos lúcidos, proteção noturna, integração celular',
    usoterapeutico: 'Insônia, pesadelos, sono inquieto',
    momentos: ['antes-de-dormir', 'noite'],
    combinacoes: ['sonhos-lucidos', 'protecao-noturna']
  },
  {
    id: 'ascensao-espiritual',
    nome: 'Ascensão Espiritual',
    descricao: 'Blend para expansão da consciência e ascensão',
    oleos: ['frankincense', 'sandia', 'incenso'],
    proporcoes: '2:1:1',
    propspiritual: 'Eleva a vibração, acelera ascensão, abre portais dimensionais',
    usoterapeutico: 'Expansão de consciência, estados alterados',
    momentos: ['meditacao-elevada', 'trabalho-kundalini'],
    combinacoes: ['ascensao', 'luz-corpo']
  },
  {
    id: 'equilibrio-feminino',
    nome: 'Equilíbrio Feminino',
    descricao: 'Blend para harmonização hormonal e energia Yin',
    oleos: ['geranio', 'lavanda', 'palmarosa'],
    proporcoes: '2:2:1',
    propspiritual: 'Harmoniza a energia feminina, conecta com a Deusa',
    usoterapeutico: 'Desequilibrios hormonais, tensão pré-menstrual',
    momentos: ['ciclos-mensais', 'ritual-feminino'],
    combinacoes: ['energia-feminina', 'deusa']
  },
  {
    id: 'libertacao-emocional',
    nome: 'Liberação Emocional',
    descricao: 'Blend para libertação de padrões emocionais repetitivos',
    oleos: ['cidreira', 'bergamota', 'patchouli'],
    proporcoes: '2:2:1',
    propspiritual: 'Liberta traumas emocionais, transforma padrões negativos',
    usoterapeutico: 'Raiva, ressentimento, trauma emocional',
    momentos: ['terapia', 'trabalho-emocional'],
    combinacoes: ['libertacao-karmica']
  }
];

export const DADOS_AROMATERAPIA: AromatherapyData = {
  oleos: OLEOS_ESSENCIAIS,
  blends: BLENDS_AROMATERAPIA
};

export function getData(): AromatherapyData {
  return DADOS_AROMATERAPIA;
}

export function getOleo(id: string): OilProperties | undefined {
  return OLEOS_ESSENCIAIS.find(o => o.id === id);
}

export function getBlend(id: string): BlendProperties | undefined {
  return BLENDS_AROMATERAPIA.find(b => b.id === id);
}

export function getOleosPorNota(nota: OilProperties['nota']): OilProperties[] {
  return OLEOS_ESSENCIAIS.filter(o => o.nota === nota);
}

export function getOleosPorElemento(elemento: string): OilProperties[] {
  return OLEOS_ESSENCIAIS.filter(o => o.elementos.includes(elemento));
}

export function getOleosPorChakra(chakra: number): OilProperties[] {
  return OLEOS_ESSENCIAIS.filter(o => o.chakras.includes(chakra));
}

export function getOleosPorHumor(humor: string): OilProperties[] {
  return OLEOS_ESSENCIAIS.filter(o => o.humor.includes(humor));
}

export function getBlendsPorTempo(momento: string): BlendProperties[] {
  return BLENDS_AROMATERAPIA.filter(b => b.momentos.includes(momento));
}

export function getBlendsPorCombinacao(combinacao: string): BlendProperties[] {
  return BLENDS_AROMATERAPIA.filter(b => b.combinacoes.includes(combinacao));
}

export function getTodosOleos(): OilProperties[] {
  return OLEOS_ESSENCIAIS;
}

export function getTodosBlends(): BlendProperties[] {
  return BLENDS_AROMATERAPIA;
}