// @ts-nocheck
// SKIP_LINT

/**
 * Energias Data Module
 * Spiritual energy data for guiding personal transformation and divine connection
 */

export interface EnergiaData {
  id: string;
  name: string;
  namePortuguese: string;
  element: string;
  quality: string;
  colors: string[];
  dayOfWeek: string;
  numbersSacred: number[];
  greeting: string;
  archetype: string;
  qualities: string[];
  challenges: string[];
  rulingPlanet: string;
  sacredAnimals: string[];
  plants: string[];
  offerings: string[];
  chants: string[];
  symbols: string[];
  mythology: string;
  spiritualLesson: string;
  affirmation: string;
  meditation: string;
  applications: string[];
}

const ENERGIAS_DATA: EnergiaData[] = [
  {
    id: 'energia- ancestral',
    name: 'Energia Ancestral',
    namePortuguese: 'Força dos Ancestrais',
    element: 'Terra',
    quality: 'Proteção e Sabedoria',
    colors: ['#8B4513', '#D2691E', '#F5DEB3'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 13],
    greeting: 'Ewo aiya!',
    archetype: 'O Guardião da Memória Sagrada',
    qualities: ['Conexão ancestral', 'Proteção familiar', 'Sabedoria herdada', 'Honra aos mortos', 'Continuidade', 'Raízes profundas'],
    challenges: ['Medo do passado', 'Fixação em velhos padrões', 'Culpa ancestral', 'Resistência à mudança'],
    rulingPlanet: 'Saturno',
    sacredAnimals: ['Coruja', 'Serpente', 'Cavalo antigo'],
    plants: ['Raízes antigas', 'Árvore de Iroko', 'Ervas guardiãs', 'Palmeira'],
    offerings: ['Água de obí', 'Kolanut', 'Velas marrons', 'Farinha de milho', 'Terra sagrada', 'Flores silvestres'],
    chants: ['Ewo aiya', 'Baba wa n lo', 'Ori mi o pa'],
    symbols: ['Raízes', 'Caveira', 'Bastão ancestral', 'Círculo de proteção'],
    mythology:
      'A Energia Ancestral representa a conexão sagrada com aqueles que vieram antes de nós. Esta energia traz a sabedoria acumulada de gerações, a proteção dos ancestrais benevolentos, e a continuidade da linhagem espiritual. Os ancestors são visto como guias invisibles que iluminam nosso caminho, corrigem nossos erros, e nos protegem de perigos invisíveis. Esta energia ensina que não estamos sozinhos - somos parte de uma corrente sagrada que transcende o tempo e o espaço.',
    spiritualLesson: 'Honramos nossos ancestrais para que possamos também ser honrados pelas gerações futuras',
    affirmation: 'Eu me conecto com a sabedoria dos meus ancestrais, permitindo que sua bênção guie meus passos',
    meditation: 'Visualize raízes profundas descendo de seus pés, conectando-o com todos os que vieram antes de você',
    applications: ['Rituais de proteção', 'Conexão com ancestrais', 'Pedidos de sabedoria', 'Cura de linhagens familiares'],
  },
  {
    id: 'energia-criacao',
    name: 'Energia da Criação',
    namePortuguese: 'Poder Criador Divino',
    element: 'Fogo e Água',
    quality: 'Iniciação e Expansão',
    colors: ['#FFD700', '#FF4500', '#FFFFFF'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [1, 4, 8],
    greeting: 'Ase o!',
    archetype: 'O Originador do Novo',
    qualities: ['Criatividade', 'Expansão', 'Novo começo', 'Fortuna', 'Potencial infinito', 'Manifestação'],
    challenges: ['Impaciência', 'Excesso de energia', 'Dispersão', 'Superficialidade'],
    rulingPlanet: 'Sol',
    sacredAnimals: ['Cavalo', 'Papagaio', 'Águia'],
    plants: ['Obí', 'Semente dourada', 'Milho', 'Frutas amarelas'],
    offerings: ['Kolanut', 'Milho', 'Velas douradas', 'Água de obí', 'Frutas amarelas', 'Farinha de mandioca'],
    chants: ['Ase lo fun', 'Ogbe ni o', 'Okan lo pa'],
    symbols: ['Semente', 'Sol', 'Círculo irradiante', 'Água corrente'],
    mythology:
      'A Energia da Criação é o princípio divino que transforma pensamento em realidade. Esta energia representa o momento sagrado quando o cosmos decidiu criar vida, consciência, e propósito. Ogbe, como primeiro Odu, embody esta energia em sua forma mais pura - o poder de fazer algo existir onde antes havia vazio. Esta energia está presente em todo novo começo, toda inovação, e toda transformação que emerge do nada.',
    spiritualLesson: 'Somos co-criadores com o divino; nossa intenção shapeia a realidade que habitamos',
    affirmation: 'Eu abraço meu poder criativo, permitindo que bênçãos se expandam em todas as direções da minha vida',
    meditation: 'Visualize uma semente de luz dourada no centro do seu ser, expandindo-se em luz e possibilidade',
    applications: ['Iniciações', 'Novos projetos', 'Rituais de fortuna', 'Pedidos de bênção'],
  },
  {
    id: 'energia-protecao',
    name: 'Energia de Proteção',
    namePortuguese: 'Escudo Sagrado Divino',
    element: 'Terra e Fogo',
    quality: 'Defesa e Purificação',
    colors: ['#FF0000', '#FFFFFF', '#000000'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 21],
    greeting: 'Eshu!',
    archetype: 'O Guardião dos Portais',
    qualities: ['Proteção', 'Purificação', 'Barreira sagrada', 'Desvio de males', 'Purificação', 'Ancoragem'],
    challenges: ['Paranoia', 'Excesso de proteção', 'Medo', 'Rigidez'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cão', 'Cavalo negro', 'Coruja'],
    plants: ['Pau-brasil', 'Obí vermelho', 'Arruda', 'Alho'],
    offerings: ['Velas vermelhas e pretas', 'Pimenta', 'Kolanut', 'Água de obí', 'Farinha', 'O利亚'],
    chants: ['Eshu baraka', 'Oju lo ri', 'Ogun me lo'],
    symbols: ['Portão', 'Círculo vermelho', 'Mão protetora', 'Chave'],
    mythology:
      'A Energia de Proteção é personificada por Eshu e Ogun, os orixás que guardam os portais entre mundos. Eshu representa a energia de proteção que caminha à frente, desviando perigo antes que chegue. Ogun representa a proteção que corta obstáculos e abre caminho. Juntos, eles formam o escudo invisível que protege oDevoto de influências negativas, ataques espirituais, e acidentes. Esta energia é invocada antes de qualquer jornada ou trabalho espiritual.',
    spiritualLesson: 'A verdadeira proteção vem da conexão com o divino; somos guardados quando caminhamos na luz',
    affirmation: 'Eu sou envolver por proteção divina, cortado todo mal e permitindo apenas luz em minha vida',
    meditation: 'Visualize um escudo de luz vermelha e branca ao seu redor, emanando calor e segurança',
    applications: ['Rituais de proteção', 'Descarrego', 'Pedidos de segurança', 'Proteção de viagem'],
  },
  {
    id: 'energia-cura',
    name: 'Energia de Cura',
    namePortuguese: 'Poder Curativo Sagrado',
    element: 'Água',
    quality: 'Restaurção e Purificação',
    colors: ['#00CED1', '#FFFFFF', '#40E0D0'],
    dayOfWeek: 'Sábado',
    numbersSacred: [5, 7, 15],
    greeting: 'Oxum me ji!',
    archetype: 'A Mãe das Águas',
    qualities: ['Cura', 'Beleza', 'Fertilidade', 'Amor', 'Purificação', 'Suavidade'],
    challenges: ['Jealousy', 'Exigência', 'Materialismo', 'Instabilidade emocional'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Peixe', 'Borboleta', 'Pavão'],
    plants: ['Rosa', 'Lótus', 'Ervas aquáticas', 'Flor de laranjeira'],
    offerings: ['Mel', 'Água de flor', 'Velas douradas', 'Perfume', 'Frutas tropicais', 'Pentes dourados'],
    chants: ['Oxum o dabo', 'Iemoja', 'Oba ti o ri'],
    symbols: ['Espelho', 'Pente', 'Água corrente', 'Arco-íris'],
    mythology:
      'A Energia de Cura é embodied por Oxum, a mãe das águas doces e do amor sagrado. Oxum representa o princípio curativo que flui através da água, trazendo restauração física, emocional e espiritual. Ela é invocada para cura de doenças, reconciliação de relacionamentos, e purificação de karma negativo. A água de Oxum carrega o poder de lavar dores antigas, limpar feridas não cicatrizadas, e devolver a pessoa à harmonia original.',
    spiritualLesson: 'A cura verdadeira vem quando permitimos que o amor sagrado flua através de nós sem resistência',
    affirmation: 'Eu permito que a energia curativa de Oxum flua através de mim, restaurando minha paz e harmonia',
    meditation: 'Sinta água morna lavando seu corpo, levando embora toda dor e deixando apenas suavidade',
    applications: ['Rituais de cura', 'Banhos sagrados', 'Pedidos de reconciliação', 'Purificação'],
  },
  {
    id: 'energia-sabedoria',
    name: 'Energia da Sabedoria',
    namePortuguese: 'Olho que Tudo Vê',
    element: 'Ar e Fogo',
    quality: 'Iluminação e Conhecimento',
    colors: ['#9400D3', '#FFFFFF', '#FFD700'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [4, 8, 16],
    greeting: 'Orunmila!',
    archetype: 'O Sábio dos Segredos',
    qualities: ['Sabedoria', 'Conhecimento', 'Previsão', 'Memória', 'Discernimento', 'Compaixão'],
    challenges: ['Inação', 'Paralisia por análise', 'Perfeccionismo', 'Arrogância intelectual'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Coruja', 'Elefante', 'Tartaruga'],
    plants: ['Ervas sagradas', 'Obí', 'Cola', 'Raízes de proteção'],
    offerings: ['Kolanut', 'Velas verdes', 'Água de obí', 'Dinhe', 'Frutas', 'Seda branca'],
    chants: ['Orunmila o', 'Awon ona ti o', 'Oro ti o ni'],
    symbols: ['Olho', 'Livro', 'Colares de opele', 'Mãos em oração'],
    mythology:
      'A Energia da Sabedoria é governada por Orunmila, o orixá da adivinhação e do conhecimento secreto. Orunmila conoce todos os caminhos do destino, todas as escolhas que conduzem a結果 positiva, e todas as armadilhas que o ignorante não vê. Esta energia representa a capacidade de ver além do visível, de compreender padrões ocultos, e de tomar decisões que alinham com o propósito divino. Orunmila ensina que verdadeira sabedoria é saber o que não sabemos.',
    spiritualLesson: 'A verdadeira sabedoria começa quando reconhecemos nossa própria ignorância',
    affirmation: 'Eu abro meu olho interior para a sabedoria divina, permitindo que luz ilumine meu caminho',
    meditation: 'Visualize um olho dourado abrindo no centro da sua testa, vendo além das ilusões do mundo',
    applications: ['Consulta de Ifá', 'Decisões importantes', 'Pedidos de orientação', 'Estudos espirituais'],
  },
  {
    id: 'energia-guerra',
    name: 'Energia da Guerra',
    namePortuguese: 'Força Invencível',
    element: 'Fogo e Ferro',
    quality: 'Coragem e Vitória',
    colors: ['#FF4500', '#000000', '#8B0000'],
    dayOfWeek: 'Terça-feira',
    numbersSacred: [3, 7, 17],
    greeting: 'Ogun jẹ́ o!',
    archetype: 'O Senhor do Ferro',
    qualities: ['Coragem', 'Determinação', 'Vitória', 'Justiça', 'Força', 'Proteção'],
    challenges: ['Violência', 'Agressividade', 'Impaciência', 'Destruição descontrolada'],
    rulingPlanet: 'Marte',
    sacredAnimals: ['Cavalo', 'Cão', 'Galho'],
    plants: ['Figo', 'Palmeira', 'Ervas fortes', 'Ferro de Proteção'],
    offerings: ['Velas pretas', 'Velas vermelhas', 'Kolanut', 'Fio de contas', 'Faca ritual', 'Pinga'],
    chants: ['Ogun ti o ni', 'Ogun me lo', 'Aja o'],
    symbols: ['Espada', 'Ferramenta', 'Ferro', 'Caminho aberto'],
    mythology:
      'A Energia da Guerra é personificada por Ogun, o orixá do ferro e da invencibililidade. Ogun representa a força que corta obstáculos, abre caminhos bloqueados, e vence inimigos invisíveis. Antes de qualquer trabalho espiritual, Ogun é invocado para limpar o caminho e garantir que o trabalho alcance seu destino. Ogun é também o patrón dos ferreiros, daqueles que trabalham com metal, e de todos que enfrentam desafios que parecem impossíveis.',
    spiritualLesson: 'A verdadeira coragem não é ausência de medo, mas ação apesar dele',
    affirmation: 'Eu invoque a força de Ogun para abrir caminho em minha vida, cortando todo obstáculo que se apresenta',
    meditation: 'Sinta o poder do ferro fluindo através de você, cortando correntes e abrindo portas',
    applications: ['Rituais de proteção', 'Abertura de caminhos', 'Vitória em conflitos', 'Trabalho com ferramentas'],
  },
  {
    id: 'energia- amor',
    name: 'Energia do Amor',
    namePortuguese: 'Fogo Sagrado do Coração',
    element: 'Fogo',
    quality: 'Paixão e Devoção',
    colors: ['#FF69B4', '#FF1493', '#FFFFFF'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [6, 9, 12],
    greeting: 'Eshu ti o fẹ́!',
    archetype: 'O Senhor da Paixão',
    qualities: ['Amor', 'Paixão', 'Desejo', 'Conexão', 'Devoção', 'Romance'],
    challenges: ['Ciúme', 'Dependência', 'Manipulação', 'Obsessão'],
    rulingPlanet: 'Vênus',
    sacredAnimals: ['Cavalo branco', 'Pavão', 'Coração'],
    plants: ['Rosa vermelha', 'Jasmim', 'Flores brancas', 'Ervas de amor'],
    offerings: ['Velas rosas', 'Perfume', 'Flores', 'Mel', 'Vinho', 'Pétalas'],
    chants: ['Eshu ti o fẹ́', 'Oba ti o ri', 'Ire o'],
    symbols: ['Coração', 'Rosa', 'Fogo', 'Cúpido'],
    mythology:
      'A Energia do Amor é frequentemente associada a Eshu na sua forma de senhor da paixão e do desejo. Esta energia representa o fogo sagrado que queima dentro do coração humano, a força que puxa pessoas umas para as outras, e a devoção que sustenta relacionamentos. Eshu na sua forma jovem representa o desejo que conecta, enquanto outras manifestações representam a energia de transformar desejo em amor verdadeiro. Esta energia é invocada para atrair amor, fortalecer relacionamentos, e despertar paixão adormecida.',
    spiritualLesson: 'O amor verdadeiro transforma tanto quem ama quanto quem é amado',
    affirmation: 'Eu abraço a energia do amor sagrado, permitindo que meu coração se abra para conexões verdadeiras',
    meditation: 'Visualize um fogo rosa no centro do seu peito, aquecendo todos que se aproximam de você',
    applications: ['Amor próprio', 'Atração de parceiros', 'Fortalecimento de relacionamentos', 'Pedidos passionais'],
  },
  {
    id: 'energia-transformacao',
    name: 'Energia da Transformação',
    namePortuguese: 'Fogo que Purifica',
    element: 'Fogo e Terra',
    quality: 'Metamorfose e Renascimento',
    colors: ['#8B0000', '#FFD700', '#000000'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 8, 13],
    greeting: 'Oyeku!',
    archetype: 'O Senhor da Morte e Renascimento',
    qualities: ['Transformação', 'Desapego', 'Renascimento', 'Libertação', 'Purificação', 'Mistério'],
    challenges: ['Medo de perda', 'Ressentimento', 'Aversão', 'Trauma não processado'],
    rulingPlanet: 'Plutão',
    sacredAnimals: ['Coruja negra', 'Serpente', 'Cavalo escuro'],
    plants: ['Palmeira', 'Ervas secas', 'Raízes escuras', 'Obí negro'],
    offerings: ['Velas pretas', 'Velas douradas', 'Kolanut escuro', 'Terra', 'Pinga', 'Frutas secas'],
    chants: ['Oyeku lo pa', 'Ori kosi', 'Ewu la n lo'],
    symbols: ['Trovao', 'Raiz', 'Moeda invertida', 'Fogo escuro'],
    mythology:
      'A Energia da Transformação é governed por Oyeku, o Odu que representa morte e renascimento. Oyeku ensina que nada pode ser criado sem que algo seja destruído, e que a verdadeira transformação requer o sacrifício do velho eu. Esta energia é invoked para deixar ir o que não serve mais, para transformar dor em sabedoria, e para renascer das cinzas como a ave fênix. Oyeku não é destruição Maldição - é a transformação necessária para o crescimento espiritual.',
    spiritualLesson: 'Devemos morrer para o que somos para nos tornar no que devemos ser',
    affirmation: 'Eu libero com gratidão tudo o que não serve mais, confiando que o divino me transformará',
    meditation: 'Visualize себя sentado diante de uma fogueira, oferecendo seus medos e mágoas às chamas purificadoras',
    applications: ['Rituais de passagem', 'Desapego', 'Processamento de luto', 'Renovação'],
  },
  {
    id: 'energia-equilibrio',
    name: 'Energia do Equilíbrio',
    namePortuguese: 'Justiça Divina',
    element: 'Ar e Terra',
    quality: 'Harmonia e Direito',
    colors: ['#FFFFFF', '#FFD700', '#000080'],
    dayOfWeek: 'Sexta-feira',
    numbersSacred: [2, 7, 11],
    greeting: 'Obatala!',
    archetype: 'O Senhor da Pureza',
    qualities: ['Equilíbrio', 'Justiça', 'Pureza', 'Sabedoria', 'Ordem', 'Discernimento'],
    challenges: ['Rigidez', 'Juízo severo', 'Perfeccionismo', 'Falta de flexibilidade'],
    rulingPlanet: 'Lua',
    sacredAnimals: ['Cavalo branco', 'Elefante', 'Coruja branca'],
    plants: ['Alface', 'Algodão', 'Flores brancas', 'Ervas purificadoras'],
    offerings: ['Velas brancas', 'Leite', 'Farinha branca', 'Kolanut', 'Água de obí', 'Algodão'],
    chants: ['Obatala o', 'Oba aladin', 'Ile aiya'],
    symbols: ['Coroa', 'Trono', 'Balança', 'Mão aberta'],
    mythology:
      'A Energia do Equilíbrio é governed por Obatalá, o mais velho dos orixás e senhor da criação e pureidade. Obatalá representa a energia que mantém o cosmos em ordem, que julga com justiça, e que oferece pureza de intenção. Ele foi o primeiro orixá a descer do céu para criar a terra, e por isso representa o princípio da ordem e do equilíbrio. Obatalá ensina que a verdadeira justiça não é apenas punir o errado, mas restaurar o equilíbrio perdido.',
    spiritualLesson: 'A verdadeira justiça busca restaurar a harmonia, não apenas castigar',
    affirmation: 'Eu busco equilíbrio em todas as áreas da minha vida, permitindo que ordem e pureza guiem minhas ações',
    meditation: 'Visualize uma balança dourada diante de você, encontrando o ponto perfeito de harmonia',
    applications: ['Rituais de justiça', 'Decisões importantes', 'Pedidos de pureza', 'Harmonia familiar'],
  },
  {
    id: 'energia-movimento',
    name: 'Energia do Movimento',
    namePortuguese: 'Vento que Transforma',
    element: 'Ar',
    quality: 'Mudança e Progresso',
    colors: ['#4169E1', '#00CED1', '#E0FFFF'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [3, 5, 9],
    greeting: 'Ogun ti n lo!',
    archetype: 'O Viajante Infinito',
    qualities: ['Mudança', 'Progresso', 'Adaptação', 'Liberdade', 'Exploração', 'Novas direções'],
    challenges: ['Instabilidade', 'Fuga de responsabilidades', 'Superficialidade', 'Inquietude'],
    rulingPlanet: 'Urano',
    sacredAnimals: ['Cavalo veloz', 'Golfinho', 'Andorinha'],
    plants: ['Plantas ao vento', 'Sementes voadoras', 'Bambú', 'Ervas silvestres'],
    offerings: ['Velas azuis', 'Água corrente', 'Pássaros', 'Sementes', 'Frutas frescas', 'Kolanut'],
    chants: ['Oko ti n lo', 'Ossai lo', 'Ajeje'],
    symbols: ['Vento', 'Rodas', 'Asa', 'Caminho aberto'],
    mythology:
      'A Energia do Movimento é associada aos orixás que governam viajes e transformação - Ossai, Ogun em sua forma de viajante, e os Odus que indicam mudança. Esta energia representa o princípio de que nada permanece estático, que tudo está em constante transformação, e que a vida é uma jornada contínua. Esta energia é invocada para cuando se necesita mudança de residência, nuevos trabajos, o quando se necesita quebrar padrões estáticos que não servem mais.',
    spiritualLesson: 'A vida é uma jornada, não um destino; cada passo nos transforma',
    affirmation: 'Eu abraço a energia do movimento divino, permitindo que mudanças fluam naturalmente em minha vida',
    meditation: 'Sinta-se como uma folha carregada pelo vento, confiando no divino para guia-lo',
    applications: ['Mudanças de vida', 'Viagens', 'Novos começos', 'Quebra de padrões'],
  },
  {
    id: 'energia-abundancia',
    name: 'Energia da Abundância',
    namePortuguese: 'Chuva de Bênçãos',
    element: 'Água e Terra',
    quality: 'Prosperidade e Manifestação',
    colors: ['#228B22', '#FFD700', '#32CD32'],
    dayOfWeek: 'Segunda-feira',
    numbersSacred: [4, 7, 12],
    greeting: 'Owonrin!',
    archetype: 'O Senhor das Tempestades',
    qualities: ['Abundância', 'Prosperidade', 'Fertilidade', 'Nascimento', 'Crescimento', 'Riqueza'],
    challenges: ['Excesso', 'Prodigalidade', 'Gulodice', 'Avidez'],
    rulingPlanet: 'Júpiter',
    sacredAnimals: ['Touro', 'Cavalo', 'Elefante'],
    plants: ['Kolá', 'Milho', 'Frutas da estação', 'Ervas de prosperidade'],
    offerings: ['Velas verdes', 'Velas douradas', 'Milho', 'Kolanut', 'Dinheiro', 'Frutas'],
    chants: ['Owonrin lo', 'Oja ti n wo', 'Ire ti n wo'],
    symbols: ['Trovao', 'Chuva', 'Milho', 'Corno de abundância'],
    mythology:
      'A Energia da Abundância é governada por vários orixás - Oxum em sua forma de abundância, Oxossi como senhor da caça e provisão, e Shango que traz a chuva que fecunda a terra. Esta energia representa o princípio de que o universo é abundante e que todos nós temos direito a prosperidade. É invocada para atraer dinero, trabajo, oportunidades, y para remover bloqueos que impiden la manifestación de la abundancia en la vida delDevoto.',
    spiritualLesson: 'A abundância é nosso direito divino; somos dignos de prosperidade em todas as áreas da vida',
    affirmation: 'Eu abro espaço para a abundância divina fluir em minha vida, permitindo que prosperidade se manifeste',
    meditation: 'Visualize chuva caindo sobre sua vida, trazendo crescimento, prosperidade e tudo o que necesita',
    applications: ['Rituais de prosperidade', 'Pedidos de abundancia', 'Fertilidade', 'Trabalho e dinero'],
  },
  {
    id: 'energia-conexao',
    name: 'Energia da Conexão',
    namePortuguese: 'Linha que Une',
    element: 'Ar e Fogo',
    quality: 'União e Comunicação',
    colors: ['#9932CC', '#FFD700', '#FFFFFF'],
    dayOfWeek: 'Quarta-feira',
    numbersSacred: [3, 6, 9],
    greeting: 'Eleggua!',
    archetype: 'O Senhor dos Caminhos',
    qualities: ['Conexão', 'Comunicação', 'Relacionamentos', 'Pontos de encontro', 'Negócios', 'Acordos'],
    challenges: ['Manipulação', 'Engano', 'Falsidade', 'Traição'],
    rulingPlanet: 'Mercúrio',
    sacredAnimals: ['Cão', 'Cavalo', 'Macaco'],
    plants: ['Obí', 'Kolanut', 'Pimenta', 'Ervas de proteção'],
    offerings: ['Kolanut', 'Pimenta', 'Dinheiro', 'Velas vermelhas e pretas', 'Fio de contas', 'Pinga'],
    chants: ['Eleggua o', 'Eshu ti o lo', 'Ona ti n lo'],
    symbols: ['Chave', 'Portão', 'Caminho', 'Ponte'],
    mythology:
      'A Energia da Conexão é governada por Elegua, o orixá que abre todos os caminhos e governa os pontos de encontro entre pessoas. Elegua representa a energia que conecta - seja a conexão entre pessoas, entre ideias, ou entre mundos. Sem Elegua, nada pode acontecer; ele é sempre o primeiro a ser invocado em qualquer ritual. Esta energia é invocada para abrir caminhos bloqueados, para mejorar negócios e relacionamentos, e para garantir que mensagens sejam entregadas.',
    spiritualLesson: 'Todos os caminhos levam ao mesmo destino; cada encontro é uma oportunidade de crescimento',
    affirmation: 'Eu invoque a energia de Elegua para abrir todos os caminhos em minha vida, permitindo conexões sagradas',
    meditation: 'Visualize portas se abrindo em sua vida, conectando-o com as pessoas e oportunidades certas',
    applications: ['Abertura de caminhos', 'Negócios', 'Relacionamentos', 'Comunicação'],
  },
];

export function getData(): EnergiaData[] {
  return ENERGIAS_DATA;
}

function getDataById(id: string): EnergiaData | undefined {
  return ENERGIAS_DATA.find((e) => e.id === id);
}

function searchData(query: string): EnergiaData[] {
  const lowerQuery = query.toLowerCase();
  return ENERGIAS_DATA.filter(
    (e) =>
      e.name.toLowerCase().includes(lowerQuery) ||
      e.namePortuguese.toLowerCase().includes(lowerQuery) ||
      e.element.toLowerCase().includes(lowerQuery) ||
      e.quality.toLowerCase().includes(lowerQuery) ||
      e.qualities.some((q) => q.toLowerCase().includes(lowerQuery))
  );
}

function getEnergiasByElement(element: string): EnergiaData[] {
  return ENERGIAS_DATA.filter((e) => e.element.toLowerCase().includes(element.toLowerCase()));
}

function getEnergiasByQuality(quality: string): EnergiaData[] {
  return ENERGIAS_DATA.filter((e) => e.quality.toLowerCase().includes(quality.toLowerCase()));
}