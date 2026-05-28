/**
 * Daily Reading Module
 * Provides spiritual daily readings for the Cabbalah of the Paths application.
 */

// Daily readings indexed by day of year (0-364)
const dailyReadings = [
  {
    title: "O Caminho da Sabedoria",
    content: "A Sabedoria é a base de todas as virtudes. Sem ela, a alma permanece obscura, incapaz de discernir entre o essencial e o transitório. Busque a luz da compreensão em cada momento do seu caminho.",
    sephirah: "Chokhmah",
    meditation: "Permita que a sabedoria flua através de você como uma corrente de luz Divina."
  },
  {
    title: "A Árvore da Vida",
    content: "As Dez Sephiroth formam a estrutura invisível que conecta o finito ao infinito. Cada esfera representa um aspecto da Divindade manifestada em nosso universo.",
    sephirah: "Kether",
    meditation: "Visualize a Árvore da Vida em sua totalidade, permitindo que suas energias o harmonizem."
  },
  {
    title: "O Poder da Coroa",
    content: "Kether é a coroa suprema, o ponto onde tudo começa e termina. Ela representa a vontade Divina original, a causa primeira de toda existência.",
    sephirah: "Kether",
    meditation: "Conecte-se com sua vontade interior, alinhando-a com seu propósito mais elevado."
  },
  {
    title: "A Sabedoria Revelada",
    content: "Chokhmah é a sabedoria primordial, o princípio masculino ativo. Ela traz a compreensão intuitiva que transcende a lógica comum.",
    sephirah: "Chokhmah",
    meditation: "Abra sua mente para revelações que vão além do pensamento ordinário."
  },
  {
    title: "O Entendimento Profundo",
    content: "Binah é o entendimento, o princípio feminino receptivo. Ela transforma a sabedoria em compreensão aplicável, dando forma às ideias abstratas.",
    sephirah: "Binah",
    meditation: "Permita que a compreensão amadureça dentro de você, nutrida pela paciência."
  },
  {
    title: "A Misericórdia Divina",
    content: "Chesed é a Misericórdia, a expansão benigna da energia Divina. Ela representa a bondade incondicional que sustenta toda a criação.",
    sephirah: "Chesed",
    meditation: "Estenda sua compaixão a todos os seres, sem julgamento ou expectativa."
  },
  {
    title: "A Força Interior",
    content: "Gevurah é a força, o julgamento e a disciplina. Ela define limites saudáveis e nos ajuda a resistir ao que não serve ao nosso crescimento.",
    sephirah: "Gevurah",
    meditation: "Fortaleça sua capacidade de discernimento e mantenha-se firme em seu caminho."
  },
  {
    title: "A Beleza Harmônica",
    content: "Tiferet é a beleza, o centro dourado da Árvore. Ela representa a harmonia entre Chesed e Gevurah, o equilíbrio entre compaixão e força.",
    sephirah: "Tiferet",
    meditation: "Busque o equilíbrio interno, permitindo que sua essência brilhe em sua forma mais pura."
  },
  {
    title: "A Vitória da Esplendor",
    content: "Netzach é a vitória e o esplendor. Ela representa a perseverança e a energia de realizar seus sonhos e aspirações mais elevadas.",
    sephirah: "Netzach",
    meditation: "Persista em seus objetivos mais nobres, sabendo que cada passo o aproxima da sua realização."
  },
  {
    title: "A Fundação Eterna",
    content: "Hod é a glória, a estrutura e a fundamentação. Ela traz ordem ao caos e nos conecta com tradições e conhecimento acumulado.",
    sephirah: "Hod",
    meditation: "Estabeleça bases sólidas para seus projetos, respeitando a sabedoria dos que vieram antes."
  },
  {
    title: "A Esplendidez Divina",
    content: "Yesod é a fundação, o receptáculo das energias superiores. Ela transmite a luz Divina para o mundo material e para nosso ser.",
    sephirah: "Yesod",
    meditation: "Purifique suas intenções, permitindo que a luz Divina o atravesse sem obstrução."
  },
  {
    title: "A Realidade Manifestada",
    content: "Malkuth é o reino, a manifestação física de todo o sistema Sephiroth. Ela representa a terra, o corpo físico e o mundo material que habitamos.",
    sephirah: "Malkuth",
    meditation: "Honre seu corpo e o mundo ao seu redor como sagrado, reconhecendo o Divino em cada forma."
  },
  {
    title: "A Alma do Mundo",
    content: "A alma humana é uma centelha da luz Divina, uma parte do todo que busca retornar à sua fonte original de origem.",
    sephirah: "Netsah",
    meditation: "Sinta sua conexão com toda a criação, lembrando que cada alma carrega a luz do Criador."
  },
  {
    title: "O Fogo Transformador",
    content: "O fogo da transformação queima o que não é essencial, revelando a essência pura que habita em cada ser.",
    sephirah: "Gevurah",
    meditation: "Permita que processos de purificação removam o que já não serve ao seu crescimento."
  },
  {
    title: "A Águia da Sabedoria",
    content: "Assim como a águia voa acima das nuvens, a alma pode elevar-se acima das preocupações terrenas para contemplar verdades eternas.",
    sephirah: "Chokhmah",
    meditation: "Eleve seus pensamentos além do mundano, buscando perspectivas mais elevadas."
  },
  {
    title: "O Rio da Vida",
    content: "A energia vital flui através de todas as coisas como um rio eterno, conectando passado, presente e futuro em um fluxo contínuo.",
    sephirah: "Yesod",
    meditation: "Permita que a energia vital o atravesse, nutrindo cada célula do seu ser."
  },
  {
    title: "A Ponte Entre os Mundos",
    content: "Entre o mundo físico e o espiritual existe uma ponte feita de consciência desperta. Atravessar esta ponte é o propósito da jornada.",
    sephirah: "Tiferet",
    meditation: "Trabalhe diariamente para ampliar sua consciência, aproximando-se do divino."
  },
  {
    title: "O Silêncio Sagrado",
    content: "No silêncio do interior encontra-se a voz do divino. Antes de buscar respostas fora, volte-se para dentro, onde toda verdade reside.",
    sephirah: "Binah",
    meditation: "Reserve momentos de silêncio profundo para ouvir a sabedoria que emerge do interior."
  },
  {
    title: "A Jornada Interior",
    content: "Todo caminho externo é um reflexo de uma jornada interior. As aventuras do mundo são sombras das batalhas travadas dentro da alma.",
    sephirah: "Tiferet",
    meditation: "Observe como suas experiências externas espelham seu mundo interno."
  },
  {
    title: "A Chama da Aspiração",
    content: "A chama da aspiração nunca deve se apagar em nossos corações. Ela é a estrela-guia que nos conduz através das escuridões da vida.",
    sephirah: "Netzach",
    meditation: "Alimente sua chama interior com práticas diárias de elevação espiritual."
  },
  {
    title: "A Paz do Ser",
    content: "A verdadeira paz não vem de fora, mas da harmonia interna alcançada quando todas as partes do ser estão unidas em propósito.",
    sephirah: "Tiferet",
    meditation: "Cultive a paz interior independentemente das circunstâncias externas."
  },
  {
    title: "O Dom da Presença",
    content: "Estar presente é o maior presente que podemos nos dar. O agora é onde o divino se manifesta de forma mais clara.",
    sephirah: "Kether",
    meditation: "Traga sua consciência completamente para o momento presente, saboreando cada instante."
  },
  {
    title: "A Luz nas Trevas",
    content: "Mesmo na escuridão mais densa, a luz divina está presente. Ela espera apenas que nossos olhos se adaptem para ser vista.",
    sephirah: "Kether",
    meditation: "Confie que há propósito mesmo nos momentos de trevas - a luz sempre retorna."
  },
  {
    title: "O Crepúsculo da Alma",
    content: "Nos momentos de transição entre luz e escuridão, a alma encontra sua verdadeira natureza, além das dualidades.",
    sephirah: "Tiferet",
    meditation: "Aceite as polaridades da vida como aspectos complementares de uma verdade maior."
  },
  {
    title: "A Terra Prometida",
    content: "A terra prometida não é um lugar distante, mas um estado de consciência. Ela está dentro de nós, aguardando ser descoberta.",
    sephirah: "Malkuth",
    meditation: "Explore o território interior onde a promessa de plenitude se realiza."
  },
  {
    title: "O Sopro da Vida",
    content: "Cada respiração é um sopro divino infiltrando-se no corpo. A vida é a presença do Criador manifestada em cada instante.",
    sephirah: "Yesod",
    meditation: "Respire conscientemente, reconhecendo a vida divina em cada inspiração e expiração."
  },
  {
    title: "O Fruto do Espírito",
    content: "O amor, a alegria e a paz são frutos que crescem da árvore do espírito bem cultivado. Eles são a essência da vida bem vivida.",
    sephirah: "Chesed",
    meditation: "Cultive os frutos do espírito em seu jardim interior através de práticas diárias."
  },
  {
    title: "A Dança Cósmica",
    content: "O universo dança em uma coreografia eterna de criação e destruição. Participar desta dança é viver em harmonia com o fluxo natural.",
    sephirah: "Netzach",
    meditation: "Permita-se fluir com os ritmos naturais da vida, abandonando resistências desnecessárias."
  },
  {
    title: "O Espelho da Alma",
    content: "O mundo exterior reflete o mundo interior. Para mudar sua realidade, mude primeiro suas percepções e crenças.",
    sephirah: "Hod",
    meditation: "Observe como suas relações e experiências espelham seu estado interior."
  },
  {
    title: "A Estrela Polar",
    content: "Como a estrela polar guia os navegantes, nossa essência verdadeira guia nossa jornada. Confie nesta luz interior.",
    sephirah: "Kether",
    meditation: "Conecte-se com sua estrela interior, o ponto fixo de verdade em meio às mudanças."
  },
  {
    title: "O Manto da Proteção",
    content: "Há um manto de luz divina que envolve todos os seres. Este véu protetor é mais forte do que qualquer escuridão.",
    sephirah: "Yesod",
    meditation: "Visualize o manto de luz envolvendo você, protegendo e sustentando sua essência."
  }
];

/**
 * Gets the day of year (0-364) accounting for leap years
 */
function getDayOfYear(date: Date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const day = Math.floor(diff / oneDay);
  return (day - 1) % dailyReadings.length; // Convert to 0-indexed
}

/**
 * Gets the reading for today
 */
export function getTodayReading(date: Date = new Date()) {
  const dayOfYear = getDayOfYear(date);
  const reading = dailyReadings[dayOfYear];
  
  const dateStr = date.toISOString().split('T')[0];
  const start = new Date(date.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
  
  return {
    ...reading,
    date: dateStr,
    dayOfYear: dayOfYear + 1,
    weekOfYear: weekNumber
  };
}