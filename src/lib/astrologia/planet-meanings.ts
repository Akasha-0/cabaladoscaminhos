// fallow-ignore-file unused-file
import type { Planeta } from './tipos';

export interface PlanetMeaning {
  planeta: Planeta;
  nome: string;
  simbolo: string;
  dominio: string;
  keywords: string[];
  descrição: string;
  força: string;
  fraqueza: string;
  profissões: string[];
  arquétipo: string;
}

const significados: PlanetMeaning[] = [
  {
    planeta: 'sol',
    nome: 'Sol',
    simbolo: '☉',
    dominio: 'Essência e propósito de vida',
    keywords: ['identidade', 'vitalidade', 'ego', 'vontade', 'criatividade', 'pai', 'realeza', 'espírito', 'autoexpressão', 'projetando-se'],
    descrição: 'O Sol representa o núcleo da identidade, a essência vital e o propósito de vida. É a expressão do ego maduro e a vontade de se manifestar no mundo. Governa a criatividade, a vitalidade e a capacidade de brilhar autenticamente. Simboliza o princípio masculino consciente e a luz que ilumina o caminho.',
    força: 'Confiança, liderança, generosidade, vitalidade, autenticidade, coragem',
    fraqueza: 'Arrogância, narcisismo, egoísmo, vaidade, necessidade de reconhecimento',
    profissões: ['líder', 'gestor', 'ator', 'artista', 'político', 'empreendedor', 'professor'],
    arquétipo: 'Rei - o centro辐射光芒, aquele que lidera pelo exemplo e incarnação do propósito',
  },
  {
    planeta: 'lua',
    nome: 'Lua',
    simbolo: '☽',
    dominio: 'Mundo emocional e memória',
    keywords: ['emoções', 'intuição', 'mãe', 'lar', 'segurança', 'subconsciente', 'habitat', 'necessidades', 'ciclo', 'nutrição'],
    descrição: 'A Lua governa o mundo emocional, a intuição e o subconsciente. Representa a necessidade de segurança, o lar e a memória celular. Simboliza a relação com a figura materna e a capacidade de nutrição. Rege os hábitos, os ciclos e a capacidade de se adaptar às mudanças. É o receptáculo da experiência vivida.',
    força: 'Empatia, sensibilidade, intuição, adaptabilidade, carinho, imaginação, proteção',
    fraqueza: 'Sensibilidade excessiva, instabilidade emocional, melancolia, manipulação por sentimentos',
    profissões: ['cuidador', 'enfermeiro', 'psicólogo', 'nutricionista', 'chef', 'Writer', 'historiador'],
    arquétipo: 'Mãe - a fonte de nutrição emocional e guardiã do sagrado espaço interno',
  },
  {
    planeta: 'mercurio',
    nome: 'Mercúrio',
    simbolo: '☿',
    dominio: 'Comunicação e intelecto',
    keywords: ['comunicação', 'intelecto', 'lógica', 'informação', 'aprendizado', 'análise', 'palavras', 'comerciante', 'jovem', 'irmão'],
    descrição: 'Mercúrio governa a comunicação em todas as suas formas: verbal, escrita, gestual. Rege o intelecto, a lógica, a análise e a capacidade de processar informações. Simboliza o comerciante, o jovem, o irmão e a curiosidade inata. Rege também os deslocamentos curtos e a mídia.',
    força: 'Versatilidade, eloquência, curiosidade, agilidade mental, raciocínio rápido, flexibilidade',
    fraqueza: 'Nervosismo, superficialidade, indecisão, duplicidade, tendência à distração',
    profissões: ['escritor', 'jornalista', 'tradutor', 'professor', 'programador', 'comerciante', 'orador', 'advogado'],
    arquétipo: 'Mensageiro - aquele que conecta mundos através da palavra e do pensamento',
  },
  {
    planeta: 'venus',
    nome: 'Vênus',
    simbolo: '♀',
    dominio: 'Amor, beleza e valores',
    keywords: ['amor', 'beleza', 'arte', 'harmonia', 'prazer', 'valores', 'relacionamentos', 'feminilidade', 'luxo', 'diplomacia'],
    descrição: 'Vênus governa o amor nas suas diversas expressões: romântico, platônico e sensual. Rege a beleza, a arte e a estética. Simboliza os valores pessoais, os prazeres e a capacidade de apreciar a vida. Governa os relacionamentos, o namoro e o luxo. É o princípio feminino consciente da attraction.',
    força: 'Charme, harmonia, diplomacia, apreciação estética, capacidade de amar, generosidade',
    fraqueza: 'Vaidade, indolência, superficialidade nos afetos, possessividade, acomodação',
    profissões: ['artista', 'design', 'músico', 'terapeuta de casal', 'estilista', 'decorador', ' relações públicas'],
    arquétipo: 'Amante - aquele que busca a beleza e o prazer, conectando coração e estética',
  },
  {
    planeta: 'marte',
    nome: 'Marte',
    simbolo: '♂',
    dominio: 'Ação, energia e assertividade',
    keywords: ['ação', 'energia', 'assertividade', 'combate', 'coragem', 'iniciativa', 'sexualidade', 'ambição', 'impulso', 'competição'],
    descrição: 'Marte governa a energia vital, a ação direta e a assertividade. Simboliza a capacidade de lutar, competir e superar obstáculos. Rege a sexualidade, a ambição e a iniciativa. É o impulso de conquista e a disposição para defender o que é seu. Governa também acidentes e cirurgias.',
    força: 'Coragem, determinação, iniciativa, energia, liderança ativa, proteção, honestidade',
    fraqueza: 'Agressividade, impaciência, impulsividade, violência, tendência ao conflito',
    profissões: ['cirurgião', 'atleta', 'engenheiro', 'militar', 'bombeiro', 'empresário', 'esportista'],
    arquétipo: 'Guerreiro - aquele que age com coragem e determinação, enfrentando desafios de frente',
  },
  {
    planeta: 'jupiter',
    nome: 'Júpiter',
    simbolo: '♃',
    dominio: 'Expansão e sabedoria',
    keywords: ['expansão', 'sabedoria', 'otimismo', 'generosidade', 'abundância', 'religião', 'filosofia', 'justiça', 'cultura', 'visao'],
    descrição: 'Júpiter governa a expansão em todos os campos: conhecimento, experiência, possibilidade. Simboliza a sabedoria, o otimismo e a generosidade. Rege a religião, a filosofia e a busca por significado. É o planeta da abundância e da boa sorte, da justiça e da cultura. Traz a capacidade de acreditar em algo maior.',
    força: 'Otimismo, generosidade, sabedoria, visão de futuro, justiça, entusiasmo, proteção',
    fraqueza: 'Excesso, extravagância, dogmatismo, superficialidade, procrastinação',
    profissões: ['filósofo', 'professor', 'juiz', 'religioso', 'turismólogo', 'consultor', 'divulgador científico'],
    arquétipo: 'Sábio - aquele que busca conhecimento e expansão, guiando outros com sua visão',
  },
  {
    planeta: 'saturno',
    nome: 'Saturno',
    simbolo: '♄',
    dominio: 'Disciplina e estrutura',
    keywords: ['disciplina', 'estrutura', 'responsabilidade', 'limites', 'karma', 'tempo', 'maturidade', 'seriedade', 'autoridade', 'repressão'],
    descrição: 'Saturno governa a disciplina, a estrutura e a responsabilidade. Simboliza os limites necessários e a realidade concreta. É o planeta do karma, do tempo e das consequências. Rege a maturidade, a seriedade e a capacidade de trabalhar duro. Traz o peso da experiência e a necessidade de superar obstáculos.',
    força: 'Disciplina, paciência, responsabilidade, organização, humildade, perseverança, solidez',
    fraqueza: 'Rigidez, medo, repressão, pessimismo, tendencia à limitação excessiva',
    profissões: ['advogado', 'engenheiro', 'gerente', 'contador', 'político', 'arquiteto', 'agricultor'],
    arquétipo: 'Mestre - aquele que aprendeu através do sofrimento e ensina através da experiência',
  },
  {
    planeta: 'urano',
    nome: 'Urano',
    simbolo: '♅',
    dominio: 'Inovação e liberdade',
    keywords: ['inovação', 'liberdade', 'rebelião', 'originalidade', 'tecnologia', 'revolução', 'electricidade', 'genialidade', 'surpresa', 'despertar'],
    descrição: 'Urano governa a inovação, a rebelião e a liberdade individual. Simboliza o despertar repentino e a capacidade de ver além do convencional. Rege a tecnologia, a ciência e as revoluções sociais. Traz a genialidade excêntrica e a disposição para quebrar padrões estabelecidos.',
    força: 'Originalidade, genialidade, liberdade, visão progressista, humanitarianismo, inovação',
    fraqueza: 'Excentricidade, instabilidade, rebeldia destructiva, frieza emocional, imprevísibilidade',
    profissões: ['cientista', 'inventor', 'tecnólogo', 'ativista', 'astrônomo', 'engenheiro electrónico'],
    arquétipo: 'Gênio - aquele que vê além do tempo e traz a mudança radical ao mundo',
  },
  {
    planeta: 'netuno',
    nome: 'Netuno',
    simbolo: '♆',
    dominio: 'Espiritualidade e sonho',
    keywords: ['espiritualidade', 'sonho', 'ilusão', 'misticismo', 'arte', 'intuição', 'água', 'cósmico', 'sacrifício', 'transcendência'],
    descrição: 'Netuno governa a espiritualidade, os sonhos e a dimensão transendente. Simboliza a ilusão, o misticismo e a capacidade de se conectar com o divino. Rege a arte, a música e a sensibilidade à dimensões sutis. Traz a capacidade de dissolver fronteiras e acessar o inconsciente coletivo.',
    força: 'Imaginação, compaixão, espiritualidade, sensibilidade artística, intuição profunda, devoção',
    fraqueza: 'Ilusão, evasão, tendência ao vício, confusão, fragilidade emocional, idealização',
    profissões: ['artista', 'músico', 'pintor', 'escritor espiritual', 'místico', 'terapeuta holístico', 'pescador'],
    arquétipo: 'Místico - aquele que dissolve os limites do eu e se funde com o todo',
  },
  {
    planeta: 'plutao',
    nome: 'Plutão',
    simbolo: '♇',
    dominio: 'Transformação e poder',
    keywords: ['transformação', 'poder', 'regeneração', 'morte', 'renascimento', 'tabu', 'massa', 'intensidade', 'escuro', 'profundo'],
    descrição: 'Plutão governa a transformação radical, o poder e a regeneração. Simboliza a morte e o renascimento, os processos de dissolução e renovaçao profunda. Rege os tabus, o inconsciente coletivo e a intensidade emocional. Traz a capacidade de lidar com o escuro e com o poder invisível.',
    força: 'Intensidade, poder de regeneração, investigação profunda, magneticismo, coragem de enfrentar o escuro',
    fraqueza: 'Obsessão, manipulação, desejo de poder, tendência à destruição, segredos',
    profissões: ['detetive', 'psiquiatra', 'cirurgião', 'cientista nuclear', 'biólogo', 'investigador', 'psicólogo'],
    arquétipo: 'Mago - aquele que conhece os segredos da transformação e tem poder sobre os ciclos de vida e morte',
  },
  {
    planeta: 'node_norte',
    nome: 'Nodo Norte',
    simbolo: '☊',
    dominio: 'Propósito de vida e evolução',
    keywords: ['propósito', 'evolução', 'carreira', 'destino', 'alma', 'aprendizado', 'futuro', 'direção', 'missão', 'caminho'],
    descrição: 'O Nodo Norte representa o propósito de vida e a direção da alma. Indica onde estamos destinados a evoluir e desenvolver novas capacidades. Simboliza a carreira kármica e o caminho que a alma escolheu trilhar nesta vida. É o ponto de crescimento, o desafio que nos convida a ir além do familiar.',
    força: 'Visão clara do destino, coragem de seguir o caminho autêntico, crescimento acelerado, propósito definido',
    fraqueza: 'Resistência à mudança, nostalgia pelo passado, medo do novo, acomodação',
    profissões: ['visionário', 'líder espiritual', 'guia', 'coach', 'terapeuta', 'conselheiro'],
    arquétipo: 'Herói - aquele que aceita o chamado da aventura e embarca na jornada do destino',
  },
  {
    planeta: 'node_sul',
    nome: 'Nodo Sul',
    simbolo: '☋',
    dominio: 'Passado e dons inatos',
    keywords: ['passado', 'dons', 'talento natural', 'karma', 'memória', 'facilidade', 'conforto', 'herança', 'sabedoria passada', 'familiar'],
    descrição: 'O Nodo Sul representa o passado, os dons inatos e os padrões kármicos que já foram desenvolvidos. Simboliza onde temos facilidade natural e conforto, mas também onde podemos nos acomodar. É a herança da alma, o ponto de partida que traz consigo sabedoria e talento, porém também o risco de estagnação.',
    força: 'Talento natural, facilidade, experiência passada, sabedoria, conforto',
    fraqueza: 'Acomodação, resistência ao crescimento, apego ao passado, dependência',
    profissões: ['herdeiro', 'artista natural', 'professor de tradição', 'guardião de conhecimento'],
    arquétipo: 'Sábio Ancião - aquele que traz a sabedoria do passado, mas precisa integrar a novidade',
  },
  {
    planeta: 'quiron',
    nome: 'Quiron',
    simbolo: '⚷',
    dominio: 'Ferida e cura',
    keywords: ['ferida', 'cura', 'vulnerabilidade', 'sabedoria', 'chamane', 'integracao', 'sagrado', 'wounded healer', 'alquimia', 'humanitário'],
    descrição: 'Quiron representa a ferida sagrada e a capacidade de cura. Simboliza a vulnerabilidade que todos carregamos e a sabedoria que emerge do sofrimento. É o centauro ferido que se tornou curandeiro, o que transformou sua dor em instrumento de cura para outros. Rege a integração entre o humano e o divino, a alquimia interior.',
    força: 'Capacidade de cura profunda, compaixão especial, sabedoria da experiência, integração do oposto',
    fraqueza: 'Dor não integrada, tendência à vitimização, dificuldade de aceitar a própria vulnerabilidade',
    profissões: ['curandeiro', 'psicólogo', 'médium', 'alquimista', 'terapeuta', 'assistente social', 'sacerdote'],
    arquétipo: 'Curandeiro Ferido - aquele que transformou sua dor em sabedoria e oferece alívio aos outros',
  },
];

export function getMeanings(): PlanetMeaning[] {
  return significados;
}

export function getPlanetMeaning(planeta: Planeta): PlanetMeaning | null {
  return significados.find((p) => p.planeta === planeta) ?? null;
}