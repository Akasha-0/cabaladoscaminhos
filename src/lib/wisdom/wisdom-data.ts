/**
 * Wisdom data module
 * Provides spiritual wisdom data for the Cabala dos Caminhos system
 */

export interface WisdomData {
  id: string;
  name: string;
  description: string;
  source: string;
  category: 'cabala' | 'tarot' | 'orixa' | 'numerologia' | 'geometria-sagrada' | 'filosofia';
  keywords: string[];
  teaching: string;
  application: string;
}

export function getData(): WisdomData[] {
  return [
    {
      id: 'micro-macro',
      name: 'O Microcosmo e o Macrocosmo',
      description: 'O princípio hermético que estabelece a correspondência entre o ser humano e o universo',
      source: 'Tabua de Esmeralda - Hermetismo',
      category: 'filosofia',
      keywords: ['como acima assim abaixo', 'correspondência', 'unidade', 'macrocosmo', 'microcosmo'],
      teaching: 'Assim como é em cima, também é embaixo. O universo externo reflete o universo interno.',
      application: 'Reorganize seu mundo interior para harmonizar-se com a ordem cósmica',
    },
    {
      id: 'caos-ordem',
      name: 'Transformação do Caos em Ordem',
      description: 'A máxima central do sistema que orienta a transformação pessoal',
      source: 'Cabala dos Caminhos',
      category: 'cabala',
      keywords: ['transformação', 'ordem', 'disciplina', 'alinhamento', 'caos'],
      teaching: 'O objetivo do sistema é transformar o caos em ordem e a inconsciência em consciência.',
      application: 'Pratique a disciplina espiritual antes de qualquer operação ritual',
    },
    {
      id: 'alma-cosmos',
      name: 'Alma Reconhece o Cosmos',
      description: 'O processo de despertar para as correspondências invisíveis que conectam todas as coisas',
      source: 'Cabala dos Caminhos',
      category: 'cabala',
      keywords: ['alma', 'cosmos', 'correspondências', 'conexão', 'inteligência viva'],
      teaching: 'O universo é sustentado por uma inteligência viva na qual todas as coisas permanecem conectadas.',
      application: 'Desenvolva a percepção das correspondências invisíveis em sua prática diária',
    },
    {
      id: 'morte-simbolica',
      name: 'Morte Simbólica do Antigo Eu',
      description: 'O processo de transformação consciente que conduz ao verdadeiro propósito',
      source: 'Cabala dos Caminhos',
      category: 'filosofia',
      keywords: ['renascimento', 'transformação', 'egotismo', 'propósito', 'consciência'],
      teaching: 'O sistema deve conduzir por processos de disciplina espiritual antes de qualquer operação.',
      application: 'Permita que antigas formas de ser morram para dar espaço a uma consciência mais elevada',
    },
    {
      id: 'disciplina-responsabilidade',
      name: 'Disciplina e Responsabilidade Espiritual',
      description: 'Os pilares fundamentais de toda prática no sistema',
      source: 'Cabala dos Caminhos',
      category: 'filosofia',
      keywords: ['disciplina', 'responsabilidade', 'autoconhecimento', 'ética', 'compromisso'],
      teaching: 'O sistema deve sempre enfatizar disciplina, responsabilidade e autoconhecimento.',
      application: 'Mantenha práticas regulares de disciplina espiritual e responsabilize-se pelo seu caminho',
    },
    {
      id: 'quatro-elementos',
      name: 'Os Quatro Elementos e o Éter',
      description: 'A estrutura elemental que representa aspectos da consciência humana',
      source: 'Hermetismo Tradicional',
      category: 'filosofia',
      keywords: ['ar', 'terra', 'água', 'fogo', 'éter', 'elementos'],
      teaching: 'O sistema deve utilizar os quatro elementos e o quinto elemento (éter) como instrumentos.',
      application: 'Trabalhe com cada elemento para equilibrar aspectos específicos da sua consciência',
    },
    {
      id: 'sefirot-luz',
      name: 'As Dez Sephirot - Caminhos de Luz',
      description: 'Os dez atributos divino que conectam o无限 ao mundo material',
      source: 'Cabala Tradicional',
      category: 'cabala',
      keywords: ['sephirah', 'kether', 'chokmah', 'binah', 'caminhos', 'árvore da vida'],
      teaching: 'As Sephirot são emissores da energia divina, canais através dos quais a Luz Infinita se manifesta.',
      application: 'Medite sobre cada Sephirah para desenvolver suas qualidades correspondentes',
    },
    {
      id: 'arcanos-maiores',
      name: 'Os Arcanos Maiores do Tarot',
      description: 'As 22 cartas que representam a jornada da alma através das experiências de vida',
      source: 'Tradição Tarot',
      category: 'tarot',
      keywords: ['tarot', 'arcanos', 'jornada', 'alma', 'transformação', 'caminho'],
      teaching: 'Cada Arcano Mayor representa uma etapa no despertar da consciência.',
      application: 'Use os Arcanos como guias para entender os padrões de sua jornada espiritual',
    },
    {
      id: 'orixas-caminhos',
      name: 'Orixás - Caminhos de Axé',
      description: 'As forças da natureza que representam aspectos da consciência e auxiliam na evolução',
      source: 'Tradição Yorubá',
      category: 'orixa',
      keywords: ['orixá', 'axé', 'santo', 'candomblé', 'umbanda', 'forças naturais'],
      teaching: 'Cada Orixá governa aspectos específicos da natureza e da consciência humana.',
      application: 'Conecte-se com o Orixá correspondente ao seu dia e propósito para canalizar seu axé',
    },
    {
      id: 'numerologia-sagrada',
      name: 'A Matemática Sagrada',
      description: 'Os números como ferramentas geométricas exatas da nossa atual encarnação',
      source: 'Cabala Numérica',
      category: 'numerologia',
      keywords: ['número', 'geometria', 'destino', 'caminho', 'matemática sagrada'],
      teaching: 'Na Cabala dos Caminhos, o seu número de nascimento não é fatalidade, mas ferramenta de alinhamento.',
      application: 'Calcule e medite sobre seu número de caminho de vida para compreender sua jornada atual',
    },
    {
      id: 'geometria-sagrada',
      name: 'Formas que Contêm o Divino',
      description: 'Os poliedros de Platão e suas frequências como ferramentas de reorganização interior',
      source: 'Geometria Sagrada',
      category: 'geometria-sagrada',
      keywords: ['poliedros', 'platão', 'frequência', 'forma', 'proporção áurea', 'flor da vida'],
      teaching: 'A geometria sagrada conecta a consciência humana às estruturas matemáticas do cosmos.',
      application: 'Utilize formas geométricas específicas para ativar chakras e canalizar frequências',
    },
    {
      id: 'horarios-rituais',
      name: 'Horários Planetários e Janelas de Operação',
      description: 'A utilização de horários específicos como instrumentos de alinhamento cósmico',
      source: 'Magia Ritual',
      category: 'filosofia',
      keywords: ['horário', 'planeta', 'astro', 'janela', 'operação', 'mágia'],
      teaching: 'O sistema deve considerar o uso de horários específicos como instrumentos de reorganização interior.',
      application: 'Realize suas práticas nos horários correspondentes aos planetas e signos regentes',
    },
    {
      id: 'sonhos-estados',
      name: 'Estados de Consciência e Sonhos',
      description: 'O uso de diferentes estados de consciência como ferramentas de percepção espiritual',
      source: 'Tradição Onírica',
      category: 'filosofia',
      keywords: ['sonho', 'consciência', 'transe', 'meditação', 'percepção'],
      teaching: 'Estados alterados de consciência permitem o acesso a níveis mais profundos de percepção.',
      application: 'Pratique técnicas de indução onírica e estados meditativos para acessar a sabedoria interior',
    },
    {
      id: 'nomes-divinos',
      name: 'Os Nomes Divinos e Seu Poder',
      description: 'Os nomes de Deus na Cabala que contêm poder de criação e transformação',
      source: 'Cabala Hebraica',
      category: 'cabala',
      keywords: ['nomes', 'divino', 'shemhamphorash', 'pronúncia', 'poder'],
      teaching: 'Os nomes divinos contêm a essência da energia que nomeiam e podem transformar a realidade.',
      application: 'Aprenda as pronúncias corretas e use os nomes divinos com reverência e propósito',
    },
    {
      id: 'luz-som',
      name: 'A Luz e o Som como Instrumentos de Cura',
      description: 'O uso terapêutico da luz e do som para reorganizar a estrutura psíquica',
      source: 'Física Vibracional',
      category: 'filosofia',
      keywords: ['luz', 'som', 'frequência', 'cura', 'vibração', 'solfeggio'],
      teaching: 'A luz e o som são instrumentos de reorganização que atuam sobre a estrutura psíquica e espiritual.',
      application: 'Utilize frequências sonoras e cromoterapia para harmonizar chakras e estados emocionais',
    },
    {
      id: 'mandala-caminho',
      name: 'O Mandala como Mapa de Consciência',
      description: 'Diagramas sagrados que representam a totalidade da existência e auxiliam na meditação',
      source: 'Tradição Tântrica',
      category: 'geometria-sagrada',
      keywords: ['mandala', 'meditação', 'totalidade', 'círculo', 'sagrado'],
      teaching: 'O mandala representa a totalidade da consciência e serve como mapa para a jornada interior.',
      application: 'Use mandalas como ferramentas de meditação para expandir a consciência e encontrar o centro',
    },
  ];
}