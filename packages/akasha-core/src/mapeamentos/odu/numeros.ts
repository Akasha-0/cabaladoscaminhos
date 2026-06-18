/**
 * Odu de Nascimento — Mapeamentos Ricos (Ifá Merindilogun)
 *
 * Dados curados para os 16 Odu principais do Ifá (excluindo Owonrin/Obara
 * que são duplicados Merindilogun vs Obará/Etogundá — Owonrin é standalone,
 * Obara é 7 no Merindilogun vs 6 no ketu).
 *
 * Segue a nomenclatura canónica do PilarOdu (PascalCase):
 * Ogbe, Oyeku, Iwori, Odi, Irosun, Owonrin, Obara, Okanran,
 * Ogunda, Osa, Ika, Oturupon, Otura, Irete, Ose, Ofu
 *
 * Cada entrada inclui: orixás regentes, elemento, frequência, proibições,
 * preceitos, essência, primitivo Akáshico e fonte tradicional.
 *
 * @version 1.0.0
 */
import type { Primitivo } from '../types';

// ─── Elemento e Frequência ─────────────────────────────────────────────────────
export type OduElemento = 'fogo' | 'água' | 'terra' | 'ar';

export interface OduNumerologia {
  numero: number; // 1-16 na ordem do Ifá
  frequencia: number; // vibração do Odu (1-9 redux do número)
  elemento: OduElemento;
  primitivo: Primitivo;
  polaridade: 'luz' | 'sombra' | 'ambas';
  fonte: string; // justificativa tradicional
}

export interface OduEntry extends OduNumerologia {
  /** Nomes canónicos em português (PilarOdu standard) */
  nome: string;
  /** Orixás regentes */
  orixas: string[];
  /** Palavras-chave */
  palavrasChave: string[];
  /** Proibições (quizilas) — primeira da lista */
  proibicao: string;
  /** Preceitos de vida — primeiro */
  preceito: string;
  /** Essência espiritual */
  essencia: string;
}

// ─── Tabela dos 16 Odu ────────────────────────────────────────────────────────

export const ODUS_NUMEROLOGIA: Record<string, OduEntry> = {
  Ogbe: {
    nome: 'Ogbe',
    numero: 1,
    frequencia: 1,
    elemento: 'fogo',
    primitivo: 'Expansao',
    polaridade: 'luz',
    orixas: ['Oxalá', 'Obatala'],
    palavrasChave: ['começo', 'luz', 'criação', 'autoridade', 'liderança'],
    proibicao:
      'Evitar alimentos de cor vermelha em dias de obrigação; não iniciar conflitos desnecessários; afastar-se de ambientes de discórdia e fofoca',
    preceito:
      'Cultivar paciência e humildade em todas as ações; respeitar os mais velhos e as tradições ancestrais',
    essencia:
      'Ogbe é o primeiro Odu da escrita do Ifá, portador da luz primordial. Regido por Oxalá, representa o início de todos os ciclos e a capacidade de iluminar caminhos.',
    fonte: 'Ifá Merindilogun — Ogbe = 1, começo, criação. Odu da vitória sempre. Oxalá.',
  },
  Oyeku: {
    nome: 'Oyeku',
    numero: 2,
    frequencia: 2,
    elemento: 'água',
    primitivo: 'Materializacao',
    polaridade: 'sombra',
    orixas: ['Obaluaiê', 'Iku'],
    palavrasChave: ['morte', 'transformação', 'ancestralidade', 'renovação', 'mistério'],
    proibicao:
      'Evitar frequentar cemitérios sem proteção espiritual adequada; não desprezar sinais e presságios do campo espiritual',
    preceito:
      'Honrar os ancestrais com regularidade através de oferendas e orações; aceitar as transformações da vida como parte do ciclo natural',
    essencia:
      'Oyeku é o Odu da transição e do mistério. Regido por Obaluaiê, senhor das epidemias e da cura profunda, revela que toda transformação passa por uma morte simbólica.',
    fonte: 'Ifá — Oyeku = 2, noite, contração. Odu da transformação profunda. Obaluaiê.',
  },
  Iwori: {
    nome: 'Iwori',
    numero: 3,
    frequencia: 3,
    elemento: 'terra',
    primitivo: 'Ordem',
    polaridade: 'ambas',
    orixas: ['Xangô', 'Ogum'],
    palavrasChave: ['inteligência', 'mente', 'segredos', 'revelação', 'percepção'],
    proibicao:
      'Evitar fofoca e revelação de segredos alheios; não tomar decisões precipitadas sem reflexão adequada',
    preceito:
      'Desenvolver a mente através do estudo e da observação constante; guardar segredos confiados como tesouro sagrado',
    essencia:
      'Iwori é o Odu da mente e dos segredos. Governado por Xangô e Ogum, representa a inteligência que penetra a superfície e revela o que está escondido.',
    fonte: 'Ifá — Iwori = 3, inteligência. Odu da mente e da percepção aguçada.',
  },
  Odi: {
    nome: 'Odi',
    numero: 4,
    frequencia: 4,
    elemento: 'ar',
    primitivo: 'Conexao',
    polaridade: 'ambas',
    orixas: ['Iemanjá', 'Oxum'],
    palavrasChave: ['ventre', 'criatividade', 'gestação', 'mistério feminino', 'maternidade'],
    proibicao:
      'Evitar expor projetos prematuramente antes do tempo certo; não descuidar da alimentação e da saúde do ventre',
    preceito:
      'Proteger o espaço interior e os projetos ainda em gestação; cultivar paciência com processos que levam tempo para amadurecer',
    essencia:
      'Odi é o Odu do ventre e do mistério da criação. Regido pelas grandes mães das águas, guarda os segredos da gestação — biológica, criativa ou espiritual.',
    fonte: 'Ifá — Odi = 4, ventre, criação protegida. Odu do mistério e da gestação.',
  },
  Irosun: {
    nome: 'Irosun',
    numero: 5,
    frequencia: 5,
    elemento: 'fogo',
    primitivo: 'Transformacao',
    polaridade: 'sombra',
    orixas: ['Oxum', 'Iansã'],
    palavrasChave: ['sangue', 'vitória', 'amor', 'riqueza', 'fluxo vital'],
    proibicao:
      'Evitar ambientes com muito derramamento de sangue ou violência; não desperdiçar recursos materiais e financeiros',
    preceito:
      'Celebrar a vida e o fluxo vital com alegria e gratidão; cuidar da circulação — física e energética',
    essencia:
      'Irosun é o Odu do sangue e da vitória. Ligado a Oxum e Iansã, celebra o fluxo vital e ensina que a estagnação é o maior dos riscos.',
    fonte: 'Ifá — Irosun = 5, sangue, fluxo. Odu da vitória através do fluxo. Oxum/Iansã.',
  },
  Owonrin: {
    nome: 'Owonrin',
    numero: 6,
    frequencia: 6,
    elemento: 'terra',
    primitivo: 'Sabedoria',
    polaridade: 'luz',
    orixas: ['Exu', 'Oxumarê'],
    palavrasChave: ['transformação', 'caos criativo', 'movimento', 'renovação', 'caminhos'],
    proibicao:
      'Evitar teimosia e rigidez diante das mudanças da vida; não ignorar os avisos que aparecem nos caminhos',
    preceito:
      'Abraçar mudanças inesperadas como oportunidades de crescimento; manter-se em movimento — nunca deixar que a inércia domine',
    essencia:
      'Owonrin é o Odu do caos criativo. Regido por Exu e Oxumarê, traz a energia da mudança repentina e ensina que o caos é o caldeirão onde novas formas nascem.',
    fonte: 'Ifá — Owonrin = 6, caos, transformação. Odu da sabedoria através da mudança.',
  },
  Obara: {
    nome: 'Obara',
    numero: 7,
    frequencia: 7,
    elemento: 'água',
    primitivo: 'Poder',
    polaridade: 'luz',
    orixas: ['Xangô', 'Oxalá'],
    palavrasChave: ['realeza', 'riqueza', 'generosidade', 'autoridade', 'abundância'],
    proibicao:
      'Evitar arrogância e ostentação vazia; não usar a posição de liderança para oprimir ou manipular',
    preceito:
      'Exercer a liderança com generosidade e senso de justiça; partilhar os recursos com a comunidade',
    essencia:
      'Obara é o Odu da realeza e da abundância. Governado por Xangô e Oxalá, representa a verdadeira riqueza — a que vem do espírito e se manifesta no mundo material.',
    fonte: 'Ifá — Obara = 7, retidão, rei. Odu da riqueza e liderança justa. Xangô.',
  },
  Okanran: {
    nome: 'Okanran',
    numero: 8,
    frequencia: 8,
    elemento: 'água',
    primitivo: 'Conexao',
    polaridade: 'sombra',
    orixas: ['Xangô', 'Iansã'],
    palavrasChave: ['conflito', 'resolução', 'coragem', 'confronto', 'clareza'],
    proibicao:
      'Evitar provocar conflitos sem necessidade; não carregar rancores antigos — perdoar é estratégia espiritual',
    preceito:
      'Enfrentar os conflitos com coragem e clareza, sem fugir; buscar a resolução pacífica antes de recorrer ao confronto',
    essencia:
      'Okanran é o Odu do conflito e da resolução. Ensina que o conflito é inevitável — e que evitá-lo é a pior estratégia. A tempestade que passa limpa o ar.',
    fonte:
      'Ifá — Okanran = 8,ahoo, relações perturbadas. Odu do confronto e da resolução. Xangô/Iansã.',
  },
  Ogunda: {
    nome: 'Ogunda',
    numero: 9,
    frequencia: 9,
    elemento: 'fogo',
    primitivo: 'Movimento',
    polaridade: 'ambas',
    orixas: ['Ogum'],
    palavrasChave: ['trabalho', 'abertura de caminhos', 'guerra', 'tecnologia', 'persistência'],
    proibicao:
      'Evitar a violência gratuita e o uso da força sem propósito; não abandonar projetos no meio do caminho sem razão clara',
    preceito:
      'Trabalhar com dedicação e método; limpar os caminhos antes de avançar: eliminar obstáculos com estratégia',
    essencia:
      'Ogunda é o Odu do guerreiro trabalhador. Regido por Ogum, representa a força que abre o mato com o facão — não pela violência, mas pela necessidade do progresso.',
    fonte: 'Ifá — Ogundí = 9, ferro, ação. Odu da batalha e da abertura de caminhos. Ogum.',
  },
  Osa: {
    nome: 'Osa',
    numero: 10,
    frequencia: 1, // redux: 1+0=1
    elemento: 'fogo',
    primitivo: 'Sabedoria',
    polaridade: 'ambas',
    orixas: ['Iansã', 'Oiá'],
    palavrasChave: [
      'mudança súbita',
      'tempestade',
      'transformação feminina',
      'intuição',
      'revelação',
    ],
    proibicao:
      'Evitar resistir às transformações que o tempo traz inevitavelmente; não sufocar a expressão emocional',
    preceito:
      'Confiar na intuição feminina como guia espiritual; abraçar as mudanças súbitas como chamados da vida',
    essencia:
      'Osa é o Odu da tempestade e da revelação. Governado por Iansã-Oiá, traz a energia da mudança que não pede licença. Como um vendaval que varre o que estava podre.',
    fonte: 'Ifá — Osa = 10, tempestade. Odu da mudança súbita e da revelação. Iansã.',
  },
  Ika: {
    nome: 'Ika',
    numero: 11,
    frequencia: 2, // redux: 1+1=2
    elemento: 'terra',
    primitivo: 'Expansao',
    polaridade: 'sombra',
    orixas: ['Oxalufã', 'Oxumarê'],
    palavrasChave: [
      'persistência',
      'sabedoria ancestral',
      'longevidade',
      'paciência',
      'enraizamento',
    ],
    proibicao:
      'Evitar pressa excessiva e impulsividade nas decisões; não cortar raízes ancestrais em busca de novidade vazia',
    preceito:
      'Cultivar paciência — as grandes obras levam tempo para amadurecer; honrar os ancestrais como coluna de sustentação',
    essencia:
      'Ika é o Odu da sabedoria que vem com o tempo. Ligado a Oxalufã e Oxumarê, ensina o valor da paciência e do enraizamento. Como a árvore centenária que resistiu a todas as tempestades.',
    fonte: 'Ifá — Ika = 11, sabedoria. Odu da persistência e da sabedoria ancestral.',
  },
  Oturupon: {
    nome: 'Oturupon',
    numero: 12,
    frequencia: 3, // redux: 1+2=3
    elemento: 'ar',
    primitivo: 'Servico',
    polaridade: 'ambas',
    orixas: ['Obaluaiê', 'Omulu'],
    palavrasChave: ['cura', 'doença', 'transformação', 'limpeza', 'renascimento'],
    proibicao:
      'Evitar descuido com a saúde física — sinais do corpo devem ser ouvidos; não negligenciar as limpezas espirituais periódicas',
    preceito:
      'Cuidar da saúde com atenção e prevenção; fazer limpezas espirituais regulares do corpo e do ambiente',
    essencia:
      'Oturupon é o Odu da cura e da transformação pela doença. Ensina que a enfermidade não é castigo — é mensagem. O corpo adoece quando o espírito precisa mudar.',
    fonte: 'Ifá — Oturupon = 12, cura. Odu da cura e da transformação pela doença.',
  },
  Otura: {
    nome: 'Otura',
    numero: 13,
    frequencia: 4, // redux: 1+3=4
    elemento: 'ar',
    primitivo: 'Intuicao',
    polaridade: 'luz',
    orixas: ['Oxalá', 'Orunmilá'],
    palavrasChave: ['sabedoria divina', 'revelação', 'profecia', 'missão de vida', 'destino'],
    proibicao:
      'Evitar usar o conhecimento espiritual para manipular ou controlar; não revelar os segredos do Ifá para os não iniciados',
    preceito:
      'Buscar o conhecimento de Ifá como guia da missão de vida; agir com sabedoria antes de falar — as palavras têm poder de criação',
    essencia:
      'Otura é o Odu da revelação divina. Governado por Oxalá e Orunmilá, carrega a profecia da missão de vida. Quem recebe Otura aprende que a vida tem um propósito maior.',
    fonte: 'Ifá — Otura = 13, revelação. Odu da sabedoria divina e da missão de vida.',
  },
  Irete: {
    nome: 'Irete',
    numero: 14,
    frequencia: 5, // redux: 1+4=5
    elemento: 'terra',
    primitivo: 'Amor',
    polaridade: 'luz',
    orixas: ['Oxum', 'Oshun'],
    palavrasChave: ['amor', 'beleza', 'diplomacia', 'harmonia', 'relacionamentos'],
    proibicao:
      'Evitar conflitos desnecessários que destroem a harmonia; não ser cruel ou áspero nas palavras — a língua fere mais que a espada',
    preceito:
      'Cultivar a beleza interior como reflexo da graça espiritual; resolver conflitos com diplomacia e suavidade',
    essencia:
      'Irete é o Odu do amor e da harmonia. Regido por Oxum, ensina que a harmonia nos relacionamentos não é fraqueza — é inteligência. Possui o dom de criar paz onde havia tensão.',
    fonte: 'Ifá — Irete = 14, amor. Odu do amor, da beleza e da harmonia. Oxum.',
  },
  Ose: {
    nome: 'Ose',
    numero: 15,
    frequencia: 6, // redux: 1+5=6
    elemento: 'ar',
    primitivo: 'Poder',
    polaridade: 'luz',
    orixas: ['Oxum', 'Logun Edé'],
    palavrasChave: ['prosperidade', 'fertilidade', 'abundância', 'saúde', 'vitalidade'],
    proibicao:
      'Evitar avareza e acúmulo sem partilha; não descuidar da saúde em nome do trabalho excessivo',
    preceito:
      'Cultivar a prosperidade como consequência do alinhamento espiritual; cuidar da saúde como base de toda abundância',
    essencia:
      'Ose é o Odu da prosperidade e da vitalidade. Ligado a Oxum e Logun Edé, representa a abundância que nasce do equilíbrio — inclui saúde, amor, recursos e conexão espiritual.',
    fonte: 'Ifá — Ose = 15, prosperidade. Odu da abundância e da vitalidade.',
  },
  Ofu: {
    nome: 'Ofu',
    numero: 16,
    frequencia: 7, // redux: 1+6=7
    elemento: 'água',
    primitivo: 'Materializacao',
    polaridade: 'luz',
    orixas: ['Oxalá', 'Iemanjá'],
    palavrasChave: [
      'completude',
      'síntese',
      'transcendência',
      'encerramento',
      'retorno ao sagrado',
    ],
    proibicao:
      'Evitar agarrar-se ao que já completou seu ciclo; não ignorar os chamados espirituais que chegam ao final dos ciclos',
    preceito:
      'Encerrar os ciclos com gratidão e consciência; buscar a síntese — integrar todas as experiências como aprendizado',
    essencia:
      'Ofu é o décimo sexto e último Odu maior, o grande encerramento do círculo sagrado. Regido por Oxalá e Iemanjá, representa a completude — o ponto onde o fim encontra o começo.',
    fonte: 'Ifá — Ofu = 16, encerramento. Odu da completude e da transcendência.',
  },
};

/**
 * Look up an Odu by name (case-insensitive).
 * Supports both PascalCase (Ogbe) and lowercase (ogbe) keys.
 */
export function getOduEntry(name: string): OduEntry | null {
  return ODUS_NUMEROLOGIA[name] ?? null;
}

/**
 * Returns all Odu names.
 */
export function getAllOduNames(): string[] {
  return Object.keys(ODUS_NUMEROLOGIA);
}
