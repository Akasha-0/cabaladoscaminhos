 

export interface SpiritualMeaning {
  name: string;
  category: string;
  themes: string[];
  description: string;
  keywords: string[];
}

const MEANINGS: SpiritualMeaning[] = [
  // Fundamentos Espirituais
  {
    name: "Alma",
    category: "fundamento",
    themes: ["essência", "eternidade", "identidade sagrada", "reencarnação"],
    description:
      "A alma é a essência imortal que encarna para experimentar a evolução espiritual. Cada jornada terrena é uma oportunidade de aprendizado, onde experiências e escolhas constroem a compreensão profunda da natureza divina. A alma carrega memórias de vidas passadas, impressões kármicas e potenciais latentes aguardando desenvolvimento.",
    keywords: ["essência", "imortalidade", "evolução", "identidade", "sagrado"],
  },
  {
    name: "Espírito",
    category: "fundamento",
    themes: ["consciência", "luz", "expansão", "conexão divina"],
    description:
      "O espírito é a centelha divina que conecta cada ser à fonte primordial do universo. Ele transcende o corpo e a mente, buscando sempre expansão, conhecimento e libertação das limitações terrenas. A comunicação espiritual acontece através deintuições, sincronicidades e experiências de unidade que revelam nossa verdadeira natureza.",
    keywords: ["consciência", "luz", "expansão", "divino", "liberdade"],
  },
  {
    name: "Unidade",
    category: "fundamento",
    themes: ["interconexão", "holismo", "amor incondicional", "tudo é um"],
    description:
      "A unidade é a verdade fundamental de que tudo no universo está conectado. Não existe separação real — apenas ilusão de divisão que a consciência precisa transcender. Cada ser, cada átomo, cada estrela participa da mesma corrente de existência. Reconhecer essa verdade transforma relacionamentos, resolves conflitos e desperta compaixão infinita.",
    keywords: ["conexão", "holismo", "amor", "integração", "cosmico"],
  },
  {
    name: "Ciclicidade",
    category: "fundamento",
    themes: ["tempo espiral", "renovação", "fases", "padrões cósmicos"],
    description:
      "A vida funciona em ciclos que se repetem em espirais ascendentes. Cada ciclo oferece uma oportunidade de revisar lições, integrar experiências e subir um degrau na escada evolutiva. Compreender os ciclos — lunares, solares, kármicos — permite navegar as ondas da existência com sabedoria e paciência.",
    keywords: ["ciclos", "espiral", "renovação", "tempo", "ritmo"],
  },

  // Planetas e Arquétipos
  {
    name: "Sol",
    category: "planeta",
    themes: ["essência", "vitalidade", "propósito", "autoexpressão"],
    description:
      "O Sol representa a essência sagrada de cada ser — seu fogo interior, sua verdade mais profunda. Ele é a fonte de vida, a luz que ilumina o caminho e o centro ao redor do qual orbitam todas as其他partes da personalidade. Quando o Sol brilha plenamente, o ser irradia propósito autêntico, criatividade e a capacidade de inspirar outros.",
    keywords: ["essência", "luz", "propósito", "vitalidade", "verdade"],
  },
  {
    name: "Lua",
    category: "planeta",
    themes: ["emoções", "inconsciente", "intuição", "casa interior"],
    description:
      "A Lua é o símbolo do mundo emocional e da psique profunda. Ela governa os sentimentos, as memórias, os instintos e a capacidade de nutrir a si mesmo e aos outros. Cada fase lunar reflete um aspecto diferente da experiência humana — da novos-inícios à culminação, da escuridão à luz renovada.",
    keywords: ["emoções", "intuição", "inconsciente", "nutrição", "memória"],
  },
  {
    name: "Mercúrio",
    category: "planeta",
    themes: ["comunicação", "inteligência", "adaptabilidade", "aprendizado"],
    description:
      "Mercúrio é o mensageiro que conecta o consciente ao inconsciente, o individuo ao coletivo. Ele governa a comunicação em todas suas formas — verbal, escrita, gestual, telepática — e o processamento de informações. Na esfera espiritual, representa a mente que busca, questiona e eventualmente transcende os limites do pensamento linear.",
    keywords: ["comunicação", "mente", "adaptação", "aprendizado", "versatilidade"],
  },
  {
    name: "Vênus",
    category: "planeta",
    themes: ["amor", "beleza", "harmonia", "valores"],
    description:
      "Vênus é o princípio do amor e da beleza que permeia o universo. Ela revela o que valorizamos — não apenas em relacionamentos, mas em arte, natureza e espiritualidade. Vênus ensina que o amor verdadeiro é simultaneamente entrega e liberdade, e que a beleza reside na imperfeição que completa o todo.",
    keywords: ["amor", "beleza", "harmonia", "valores", "arte"],
  },
  {
    name: "Marte",
    category: "planeta",
    themes: ["ação", "coragem", "vontade", "assertividade"],
    description:
      "Marte representa a energia de ação que transforma desejo em realidade. Ele é o guerreiro interior, a vontade que superar obstáculos e a coragem de defender o que é precioso. Na espiritualidade, Marte ensina que a verdadeira força está no equilíbrio entre ação e paciência, entre assertividade e sabedoria.",
    keywords: ["ação", "coragem", "força", "vontade", "determinação"],
  },
  {
    name: "Júpiter",
    category: "planeta",
    themes: ["expansão", "sabedoria", "abundância", "fé"],
    description:
      "Júpiter é o planeta da expansão e da busca por significado. Ele representa a sabedoria que vem da experiência, a fé que sustenta nas tempestades e a abundância que flui para quem está alinhado com seu propósito maior. Júpiter ensina que a vida recompensa a generosidade, a visão ampla e a disposição de crescer.",
    keywords: ["expansão", "sabedoria", "abundância", "fé", "otimismo"],
  },
  {
    name: "Saturno",
    category: "planeta",
    themes: ["disciplina", "responsabilidade", "maturidade", "limites"],
    description:
      "Saturno é o mestre que traz lições através de desafios e restrições. Ele ensina que a verdadeira liberdade nasce da disciplina, que a maturidade vem pela aceitação de limites e que a карма se resolve através de trabalho honesto. Saturno não é punição — é o professor que exige excelência para que o aluno cresça.",
    keywords: ["disciplina", "responsabilidade", "maturidade", "limite", "estrutura"],
  },
  {
    name: "Quíron",
    category: "planeta",
    themes: ["ferida", "cura", "sabedoria", "transmutação"],
    description:
      "Quíron representa a ferida sagrada que se torna fonte de cura para si e para outros. Cada marca carregada contém um ensinamento profundo — a dor que não foi em vão, a experiência que transforma em sabedoria. A jornada quironiana é a de aceitar a própria vulnerabilidade como门户 para a compaixão infinita.",
    keywords: ["ferida", "cura", "vulnerabilidade", "sabedoria", "transmutação"],
  },
  {
    name: "Netuno",
    category: "planeta",
    themes: ["sonho", "intuição", "transcendência", "iluminação"],
    description:
      "Netuno dissolve as fronteiras entre o eu e o todo, abrindo portais para dimensões mais sutis da consciência. Ele governa os sonhos, a música, a espiritualidade profunda e a capacidade de perceber verdades além do véu da realidade material. Netuno é o convite para transcender a ilusão de separação e tocar o infinito.",
    keywords: ["sonho", "intuição", "transcendência", "espelho", "infinito"],
  },
  {
    name: "Plutão",
    category: "planeta",
    themes: ["transformação", "regeneração", "poder", "renascimento"],
    description:
      "Plutão é o princípio de morte e renascimento que governa as transformações mais profundas. Ele leva ao centro da terra para que novas versões possam emergir. Plutão não perguntifica — ele purifica. O que não pode ser destruído é o eu essencial; o que pode ser libertado é tudo o mais.",
    keywords: ["transformação", "regeneração", "poder", "morte", "renascimento"],
  },

  // Signos do Zodíaco
  {
    name: "Áries",
    category: "signo",
    themes: ["iniciação", "coragem", "pioneirismo", "impulso vital"],
    description:
      "Áries é o signo do primeiro fogo, da energia que começa tudo. Ele representa o impulso de existência, a coragem de ser o primeiro a agir, o pioneiro que abre caminhos onde não existiam. Áries ensina que a vida recompensa a audácia e que cada momento presente é uma oportunidade de recomeçar.",
    keywords: ["iniciação", "coragem", "pioneirismo", "ação", "início"],
  },
  {
    name: "Touro",
    category: "signo",
    themes: ["estabilidade", "prazer", "recursos", "persistência"],
    description:
      "Touro é o signo da terra fértil, da estabilidade que sustenta a vida. Ele representa o valor das coisas materiais e imateriais — os recursos que nos alimentam, a beleza que nos ancora, a persistência que transforma esforço em abundância. Touro ensina que a verdadeira riqueza vem da apreciação consciente do que temos.",
    keywords: ["estabilidade", "prazer", "recursos", "persistência", "valor"],
  },
  {
    name: "Gêmeos",
    category: "signo",
    themes: ["versatilidade", "comunicação", "dualidade", "curiosidade"],
    description:
      "Gêmeos é o signo da mente inquieta, da curiosidade que explora tudo. Ele representa a natureza dual da existência — razão e emoção, céu e terra, eu e outro. Gêmeos ensina que a sabedoria vem da comunicação, da troca de perspectivas e da aceitação de que somos muitos em um.",
    keywords: ["versatilidade", "comunicação", "dualidade", "curiosidade", "mente"],
  },
  {
    name: "Câncer",
    category: "signo",
    themes: ["emoção", "proteção", "lar", "intuição lunar"],
    description:
      "Câncer é o signo do coração que pulsa na escuridão do mar. Ele representa o mundo emocional — a capacidade de sentir profundamente, de proteger o que é sagrado, de criar laços que transcendem o tempo. Câncer ensina que a verdadeira força está na vulnerabilidade do coração aberto.",
    keywords: ["emoção", "proteção", "lar", "intuição", "sentimento"],
  },
  {
    name: "Leão",
    category: "signo",
    themes: ["expressão criativa", "orgulho", "generosidade", "luz"],
    description:
      "Leão é o signo do sol que irradia luz própria. Ele representa a expressão criativa, a generosidade do coração nobre, o orgulho saudável que reconhece o próprio valor. Leão ensina que cada ser é único e que a autenticidade é a forma mais brilhante de brilho.",
    keywords: ["criatividade", "orgulho", "generosidade", "luz", "autenticidade"],
  },
  {
    name: "Virgem",
    category: "signo",
    themes: ["discriminação", "serviço", "análise", "perfeição"],
    description:
      "Virgem é o signo da discriminação sagrada que secciona o grão do joio. Ele representa a mente analítica que busca a perfeição, o serviço humble que cuidar dos detalhes, a saúde que vem do equilíbrio. Virgem ensina que a perfeição está no caminho, não no destino — e que a simplicidade é a sofisticação máxima.",
    keywords: ["discriminação", "serviço", "análise", "perfeição", "saúde"],
  },
  {
    name: "Libra",
    category: "signo",
    themes: ["relacionamento", "harmonia", "beleza", "diplomacia"],
    description:
      "Libra é o signo da balança que busca o ponto de equilíbrio. Ele representa o mundo dos relacionamentos — os outros que nos refletem, a harmonia que sustenta a paz, a beleza que eleva o espírito. Libra ensina que as decisões mais sábias vêm da consideração de todos os lados, e que o amor maduro é escolha diária.",
    keywords: ["relacionamento", "harmonia", "beleza", "diplomacia", "equilíbrio"],
  },
  {
    name: "Escorpião",
    category: "signo",
    themes: ["transformação", "intensidade", "segredo", "regeneração"],
    description:
      "Escorpião é o signo do escorpião que morre para renascer. Ele representa a intensidade que vai às profundezas, o segredo que guarda tesouros ocultos, a regeneração que emerge da destruição. Escorpião ensina que a transformação verdadeira exige encontrar o próprio veneno — e aprender a usá-lo como medicina.",
    keywords: ["transformação", "intensidade", "segredo", "poder", "morte"],
  },
  {
    name: "Sagitário",
    category: "signo",
    themes: ["exploração", "filosofia", "otimismo", "expansão"],
    description:
      "Sagitário é o signo do arqueiro que mira o horizonte infinito. Ele representa a busca por significado, a expansão da consciência, o otimismo que vê oportunidades onde outros veem obstáculos. Sagitário ensina que a verdadeira sabedoria vem da jornada — não do destino — e que cada experiência é uma lição disfarçada.",
    keywords: ["exploração", "filosofia", "otimismo", "expansão", "aventura"],
  },
  {
    name: "Capricórnio",
    category: "signo",
    themes: ["ambição", "disciplina", "responsabilidade", "maturidade"],
    description:
      "Capricórnio é o signo da montanha que se ergue através do tempo. Ele representa a ambição que transforma obstáculos em degraus, a disciplina que constrói impérios, a responsabilidade que sustenta civilizations. Capricórnio ensina que a verdadeira honra vem do trabalho honesto e que os picos mais altos são alcançados por aqueles que não desistem.",
    keywords: ["ambição", "disciplina", "responsabilidade", "maturidade", "estrutura"],
  },
  {
    name: "Aquário",
    category: "signo",
    themes: ["inovaçao", "humanitarismo", "independência", "futuro"],
    description:
      "Aquário é o signo do água celestial que lava o velho para dar lugar ao novo. Ele representa a inovação que quebra paradigmas, o humanitarismo que vê além das fronteiras, a independência que Liberta-se das correntes do passado. Aquário ensina que o futuro pertence aos que ousam ser diferentes e que a verdadeira comunidade começa na aceitação das individualidades.",
    keywords: ["inovação", "humanitarismo", "independência", "futuro", "liberdade"],
  },
  {
    name: "Peixes",
    category: "signo",
    themes: ["transcendência", "compaixão", "sonho", "união"],
    description:
      "Peixes é o signo dos dois peixes nadando em direções opostas mas conectados. Ele representa a transcendência dos opostos, a compaixão que vê Cristo em cada ser, o sonho que dissolve os limites do eu. Peixes ensina que a iluminação está na dissolução do ego, na entrega ao fluxo universal, na certeza de que todos somos um.",
    keywords: ["transcendência", "compaixão", "sonho", "união", "sacral"],
  },

  // Elementos
  {
    name: "Fogo",
    category: "elemento",
    themes: ["energia", "inspiração", "transformação", "vitalidade"],
    description:
      "O fogo é o elemento da energia primordial que transforma e transcende. Ele representa a chama interior que impulsiona a existência, a inspiração que acende a criatividade, a transformação que queima o irrelevante. O fogo ensinando que cada ser carrega uma centelha do divino — e que quando essa chama é alimentada, nada pode detê-la.",
    keywords: ["energia", "inspiração", "transformação", "vitalidade", "paixão"],
  },
  {
    name: "Terra",
    category: "elemento",
    themes: ["estabilidade", "nutrição", "crescimento", "realização"],
    description:
      "A terra é o elemento que sustenta toda vida. Ele representa a estabilidade que permite o crescimento, a nutrição que alimenta o desenvolvimento, a concretude que transforma visão em realidade. A terra ensinando que a verdadeira riqueza é a capacidade de criar, dar e manter — não acumular.",
    keywords: ["estabilidade", "nutrição", "crescimento", "realização", "abundância"],
  },
  {
    name: "Ar",
    category: "elemento",
    themes: ["pensamento", "comunicação", "liberdade", "inspiração"],
    description:
      "O ar é o elemento da mente que conecta tudo. Ele representa o pensamento que percebe conexões invisíveis, a comunicação que compartilha verdades, a liberdade que expande horizontes. O ar ensinando que a mente é um portal para dimensões superiores — e que quando alimentada com oxígeno de novas ideias, ela pode voar.",
    keywords: ["pensamento", "comunicação", "liberdade", "inspiração", "mente"],
  },
  {
    name: "Água",
    category: "elemento",
    themes: ["emoção", "intuição", "adaptação", "fluxo"],
    description:
      "A água é o elemento que flui através de tudo. Ela representa a emoção que percebe verdades ocultas, a intuição que conhece sem raciocinar, a adaptação que encontra caminhos onde não existem. A água ensinando que a verdadeira sabedoria está em fluir com a vida — não contra ela — e que a suavidade supera a dureza.",
    keywords: ["emoção", "intuição", "adaptação", "fluxo", "sensibilidade"],
  },

  // Chakras
  {
    name: "Raiz",
    category: "chakra",
    themes: ["sobrevivência", "segurança", "fundação", "ancoragem"],
    description:
      "O chakra raiz é a fundação sobre a qual tudo se ergue. Ele conecta o ser à terra, à família, à tribo — aos recursos que garantem a sobrevivência. Quando equilibrado, traz segurança, confiança e a sensação de pertencer ao mundo. Quando perturbado, manifesta-se como medo, ansiedade ou instabilidade. O trabalho com o chakra raiz é a base de toda espiritualidade.",
    keywords: ["sobrevivência", "segurança", "fundação", "ancoragem", "terra"],
  },
  {
    name: "Sacro",
    category: "chakra",
    themes: ["emoção", "sexualidade", "criatividade", "prazer"],
    description:
      "O chakra sacro é o centro da emoção e da criatividade. Ele governa a sexualidade, os prazeres da vida, a capacidade de criar — não apenas filhos, mas arte, ideias, projetos. Quando equilibrado, traz fluxo emocional, expressão criativa e a capacidade de viver plenamente. Quando bloqueado, manifesta-se como inibição, apatia ou isolamento.",
    keywords: ["emoção", "sexualidade", "criatividade", "prazer", "fluxo"],
  },
  {
    name: "Plexo Solar",
    category: "chakra",
    themes: ["poder pessoal", "vontade", "autonomia", "confiança"],
    description:
      "O chakra do plexo solar é o centro do poder pessoal. Ele governa a vontade, a autonomia, a capacidade de agir no mundo com confiança. Quando equilibrado, traz auto-estima saudável, assertividade e a capacidade de manifestar objetivos. Quando perturbado, manifesta-se como manipulação, subserviência ou raiva.",
    keywords: ["poder", "vontade", "autonomia", "confiança", "ação"],
  },
  {
    name: "Cardíaco",
    category: "chakra",
    themes: ["amor", "compassão", "perdão", "conexão"],
    description:
      "O chakra cardíaco é o centro do amor infinito. Ele governa a capacidade de dar e receber amor, de ter compaixão por si e pelos outros, de perdoar as mágoas do passado. Quando aberto, traz paz interior, conexões profundas e a sensação de pertencer ao coração do universo. Quando fechado, manifesta-se como isolamento, rancor ou medo de amar.",
    keywords: ["amor", "compassão", "perdão", "conexão", "paz"],
  },
  {
    name: "Laríngeo",
    category: "chakra",
    themes: ["comunicação", "expressão", "verdade", "escuta"],
    description:
      "O chakra laríngeo é o centro da comunicação e da expressão. Ele governa a capacidade de falar verdades, de ouvir profundamente, de se expressar autenticamente. Quando equilibrado, traz comunicação clara, escuta ativa e a capacidade de se fazer compreender. Quando bloqueado, manifesta-se como silêncio, medo de falar ou uso destrutivo da palavra.",
    keywords: ["comunicação", "expressão", "verdade", "escuta", "som"],
  },
  {
    name: "Terceiro Olho",
    category: "chakra",
    themes: ["visão", "intuição", "discernimento", "sabedoria"],
    description:
      "O terceiro olho é o centro da visão interior. Ele governa a intuição, o discernimento entre verdade e ilusão, a capacidade de perceber além dos sentidos. Quando aberto, traz clareza mental, insight profundo e a capacidade de ver o padrão por trás do caos. Quando bloqueado, manifesta-se como confusão, dogmatismo ou ilusão.",
    keywords: ["visão", "intuição", "discernimento", "sabedoria", "percepção"],
  },
  {
    name: "Coroa",
    category: "chakra",
    themes: ["iluminação", "união", "transcendência", "propósito"],
    description:
      "O chakra da coroa é o portal para o infinito. Ele conecta o ser à fonte divina, à consciência cósmica, à certeza de que somos parte de algo maior. Quando aberto, traz iluminação, paz absoluta e a experiência da unidade com tudo que existe. Quando bloqueado, manifesta-se como Materialismo, desesperança ou desconexão espiritual.",
    keywords: ["iluminação", "união", "transcendência", "propósito", "divino"],
  },

  // Caminhos Espirituais
  {
    name: "Meditação",
    category: "prática",
    themes: ["presença", "silêncio", "observação", "expansão"],
    description:
      "A meditação é a prática do retorno ao silêncio interior. Ela é o caminho de observar os pensamentos sem se identificar, de encontrar a quietude que sempre existiu sob o ruído da mente. Através da meditação, o praticante aprende que não é seus pensamentos, que existe um espaço de paz infinita dentro de si — e que esse espaço é a porta para a iluminação.",
    keywords: ["presença", "silêncio", "observação", "quietude", "consciência"],
  },
  {
    name: "Oração",
    category: "prática",
    themes: ["conexão", "devoção", "gratidão", "comunhão"],
    description:
      "A oração é o diálogo com o divino. Ela é o caminho da devoção, da gratidão, da entrega a algo maior que o eu. Através da oração, o fiel não apenas pede — reconhece sua pequena parte no plano maior, agradece pelas bênçãos recebidas e encontra forças para continuar. A oração é a ponte entre o humano e o sagrado.",
    keywords: ["conexão", "devoção", "gratidão", "comunhão", "entrega"],
  },
  {
    name: "Yoga",
    category: "prática",
    themes: ["união", "corpo", "respiração", "equilíbrio"],
    description:
      "O yoga é o caminho da união através do corpo. Ele é a prática que conecta mente, corpo e espírito através de posturas, respiração e meditação. O yoga ensinando que o corpo é um templo, não uma prisão — e que quando corpo e mente trabalham juntos, o espírito pode florescer. Cada postura é uma oração, cada respiração um mantra.",
    keywords: ["união", "corpo", "respiração", "equilíbrio", "presença"],
  },
  {
    name: "Tarot",
    category: "ferramenta",
    themes: ["simbologia", "intuição", "reflexão", "orientação"],
    description:
      "O tarot é um sistema de símbolos que espelha a psique humana. Ele não prevê o futuro — ilumina o presente, revelando padrões inconscientes e caminhos possíveis. Cada carta é um espelho que reflete o que precisa ser visto, perguntado ou integrado. O tarot é uma ferramenta de autoconhecimento que transforma intuição em sabedoria.",
    keywords: ["simbologia", "intuição", "reflexão", "orientação", "autoconhecimento"],
  },
  {
    name: "Astrologia",
    category: "ferramenta",
    themes: ["ciclos", "arquétipos", "destino", "liberdade"],
    description:
      "A astrologia é a linguagem dos céus que revela a alma. Ela lê os movimentos planetários como símbolos que refletem a experiência humana — não determinando, mas iluminando tendências, lições e potenciais. A astrologia ensinando que o universo é um organismo vivo, que cada ser participa dos mesmos ciclos cósmicos, e que conhecer o próprio mapa é o primeiro passo para transformar destino em destino.",
    keywords: ["ciclos", "arquétipos", "destino", "liberdade", "cosmos"],
  },
  {
    name: "Numerologia",
    category: "ferramenta",
    themes: ["vibração", "padrões", "ciclos", "essência"],
    description:
      "A numerologia é a ciência dos números que revela a essência de coisas e seres. Cada número carrega uma vibração específica que influencia a personalidade, os caminhos e os destinos. A numerologia ensinando que por trás da aparente complexidade do mundo existem padrões simples, elegant e profundos — e que conhecer esses padrões é decodificar a linguagem do universo.",
    keywords: ["vibração", "padrões", "ciclos", "essência", "matemática"],
  },
  {
    name: "Quiromancia",
    category: "ferramenta",
    themes: ["linhas", "mapa", "destino", "karma"],
    description:
      "A quiromancia é a leitura das mãos como mapa da alma. As linhas das mãos contam a história da consciência — suas linhações, habilidades, desafios e potenciais. A mão direita revela o destino, a esquerda revela o karma herdado; juntas, elas contam a história completa. A quiromancia ensinando que o destino não está escrito — mas o caminho está mapeado.",
    keywords: ["linhas", "mapa", "destino", "karma", "mão"],
  },
  {
    name: "Geomancia",
    category: "ferramenta",
    themes: ["terra", "energia", "feng-shui", "harmonia"],
    description:
      "A geomancia é a arte de ler as energias da terra. Ela estuda como os lugares afetam os seres — as correntes subterrâneas, as influências cósmicas, as linhas de força que moldam a sorte dos habitantes. Feng shui, geomancia tradicional, radiestesia — todas são manifestações de um conhecimento ancestral: que o espaço onde vivemos é tão importante quanto o que vivemos dentro de nós.",
    keywords: ["terra", "energia", "feng-shui", "harmonia", "espaco"],
  },
  {
    name: "Ayurveda",
    category: "sistema",
    themes: ["doshas", "equilíbrio", "saúde", "harmonia"],
    description:
      "Ayurveda é o sistema de saúde indiano que busca o equilíbrio entre corpo, mente e espírito. Ele classifica os seres em doshas — constitutions únicas que determinam como cada umprocessa energia, alimentos e experiências. A ayurveda ensinando que a verdadeira saúde não é ausência de doença, mas harmonia entre os elementos internos e externos, entre o eu e o cosmos.",
    keywords: ["doshas", "equilíbrio", "saúde", "harmonia", "medicina"],
  },
  {
    name: "Alquimia",
    category: "sistema",
    themes: ["transmutação", "ouro", "pedra filosofal", "transformação"],
    description:
      "A alquimia é a arte da transmutação — não apenas de metais em ouro, mas do ser humano em luz. Os símbolos alquímicos representam processos psicológicos profundos: a calcinação do ego, a dissolução das ilusões, a coagulação da sabedoria. A alquimia ensinando que cada ser tem o potencial de transformar seu chumbo em ouro — suas sombras em luz.",
    keywords: ["transmutação", "ouro", "pedra", "transformação", "metáfora"],
  },
  {
    name: "Cabala",
    category: "sistema",
    themes: ["árvore da vida", "caminhos", "sephiroth", "luz"],
    description:
      "A Cabala é o sistema místico judaico que mapeia a jornada da alma em direção à luz divina. A árvore da vida com seus dez sephiroth representa os níveis de consciência, os canais através dos quais a energia flui do infinito para o finito. A Cabala ensinando que cada ser é um universo, e que decodificar os mistérios da árvore é desbloquear os mistérios de si mesmo.",
    keywords: ["árvore", "caminhos", "sephiroth", "luz", "mistério"],
  },
  {
    name: "I Ching",
    category: "sistema",
    themes: ["hexagramas", "mudança", "oráculo", "sabedoria taoísta"],
    description:
      "O I Ching é o clássico oráculo chinês dos mutáveis. Seus 64 hexagramas representam todas as situações possíveis na vida — os movimentos do yin e yang, as mudanças do céu e da terra. O I Ching não prediz — guia, oferecendo sabedoria através de símbolos que o consulente interpreta com coração aberto. Ele ensinando que a vida é um fluxo constante, e que a sabedoria está em acompanhar esse fluxo.",
    keywords: ["hexagramas", "mudança", "oráculo", "sabedoria", "fluxo"],
  },

  // Conceitos Transcendentais
  {
    name: "Karma",
    category: "conceito",
    themes: ["ação", "consequência", "lei", "evolução"],
    description:
      "Karma é a lei de causa e efeito que governa a existência. Cada ação gera uma consequência proporcional — não como punição, mas como ensinamento. O karma não é destino; é oportunidade. Cada vida oferece uma nova chance de entender as lições pendentes, de criar causas mais harmoniosas, de quebrar ciclos que não servem mais.",
    keywords: ["ação", "consequência", "lei", "evolução", "justiça"],
  },
  {
    name: "Dharma",
    category: "conceito",
    themes: ["propósito", "dever", "retidão", "missão"],
    description:
      "Dharma é o propósito de vida — o papel único que cada ser veio desempenhar no drama do universo. Ele não é o que queremos fazer, mas o que devemos fazer; não o prazer, mas a missão. Cumprir o dharma traz realização profunda; ignorá-lo traz vazio existencial. Encontrar e viver o dharma é o propósito mais elevado da existência.",
    keywords: ["propósito", "dever", "retidão", "missão", "responsabilidade"],
  },
  {
    name: "Moksha",
    category: "conceito",
    themes: ["libertação", "iluminação", "nirvana", "fusão com o divino"],
    description:
      "Moksha é a libertação final — a dissolução do ego que permite a fusão com o divino. Não é um estado a ser alcançado, mas uma verdade a ser recordada: que o eu individual é uma ilusão, e o eu divino é infinito. Moksha é o fim do sofrimento, o fim do ciclo de reencarnações, o fim da separação. É a volta para casa.",
    keywords: ["libertação", "iluminação", "nirvana", "divino", "unidade"],
  },
  {
    name: "Samsara",
    category: "conceito",
    themes: ["ciclo", "sofrimento", "roda", "ilusão"],
    description:
      "Samsara é o ciclo de nascimento, morte e renascimento — a roda do sofrimento que mantém a alma presa à existência material. Ela é sustentada pelo apego, pela ignorância, pelo desejo. Reconhecer samsara é o primeiro passo para transcender — não por negar a vida, mas por viver com consciência acima das ilusões que perpetuam o ciclo.",
    keywords: ["ciclo", "sofrimento", "roda", "ilusão", "renascimento"],
  },
  {
    name: "Renascimento",
    category: "conceito",
    themes: ["reencarnação", "alma", "viagens", "progressão"],
    description:
      "O renascimento é a teoria de que a alma retorna à carne repetidamente, cada vez aprendendo novas lições e evoluindo hacia a perfeição. Cada vida é uma escola, cada corpo um uniforme, cada experiência um professor. A alma não renasce aleatoriamente — há um padrão, uma progressão, uma lógica nos retornos. Entender esse padrão é entender o próprio caminho.",
    keywords: ["reencarnação", "alma", "viagens", "progressão", "escola"],
  },
  {
    name: "Sagrado",
    category: "conceito",
    themes: ["divino", "santidade", "reverência", "transcendência"],
    description:
      "O sagrado é tudo aquilo que evoca reverência — o divino que transcende a compreensão, o santo que inspira devoção, o mistério que convida à exploração. O sagrado não está apenas nos templos; está em toda parte, para quem tem olhos para ver. Reconhecer o sagrado em cada momento, em cada ser, em cada coisa — esse é o caminho da espiritualidade autêntica.",
    keywords: ["divino", "santidade", "reverência", "transcendência", "mistério"],
  },
  {
    name: "Mediunidade",
    category: "conceito",
    themes: ["canal", "espírito", "comunicação", "intuição"],
    description:
      "A mediunidade é a capacidade de servir como canal entre o mundo físico e o mundo espiritual. O médium não é possuído — é um instrumento; não escolhe as mensagens, mas as recebe com discernimento. A mediunidade é uma vocação de serviço: ajudar os vivos a se reconciliar com os mortos, ajudar os mortos a encontrar paz.",
    keywords: ["canal", "espírito", "comunicação", "intuição", "serviço"],
  },
  {
    name: "Proteção",
    category: "conceito",
    themes: ["escudo", "ausência", "energia", "sagrado"],
    description:
      "A proteção espiritual é o escudo que preserva a integridade da alma contra influências negativas. Ela pode vir de orações, mantras, cristais, pactos ou simplesmente da intenção clara de permanecer inteiro. A verdadeira proteção não depende de símbolos externos — ela nasce da convicção interior de que somos filhos da luz, e que nenhuma escuridão pode nos dominar.",
    keywords: ["escudo", "ausência", "energia", "luz", "integridade"],
  },
  {
    name: "Sincronicidade",
    category: "conceito",
    themes: ["coincidência", "significado", "campo", "orientação"],
    description:
      "A sincronicidade é a coincidência significativa — eventos que se alinham de forma que não podem ser explicados pelo acaso, mas que carregam mensagens para quem está pronto para ouvir. O universo fala em símbolos; as sincronicidades são sua linguagem. Quando começamos a notar os padrões, descobrimos que o universo está em constante comunicação — e que sempre esteve.",
    keywords: ["coincidência", "significado", "campo", "orientação", "comunicação"],
  },
  {
    name: "Cristal",
    category: "objeto",
    themes: ["energia", "cura", "vibração", "proteção"],
    description:
      "Os cristais são estruturas geométricas que armazenam e transmitem energia. Cada mineral tem propriedades específicas — alguns curam, outros protegem, outros ancora, outros elevam. Os cristais não são magia — são ferramentas de harmonização vibrational. Trabalhar com cristais é trabalhar com a energia sutil do mundo, aprendendo a canalizá-la para fins de cura e crescimento.",
    keywords: ["energia", "cura", "vibração", "proteção", "geometria"],
  },
  {
    name: "Sagrada",
    category: "objeto",
    themes: ["geomância", "forma", "frequência", "cura"],
    description:
      "A geometria sagrada são as formas primordiais que estruturam o universo — da flor da vida ao cubo de Metatron, da espiral dourada à estrela de David. Cada forma carrega uma frequência específica que pode ser usada para cura, elevação ou proteção. A geometria sagrada é a linguagem matemática do divino — a prova de que o universo foi projetado com intenção e beleza.",
    keywords: ["geomância", "forma", "frequência", "cura", "matemática"],
  },
];

export function getMeanings(): SpiritualMeaning[] {
  return MEANINGS;
}

export function getMeaningByCategory(category: string): SpiritualMeaning[] {
  return MEANINGS.filter((m) => m.category === category);
}

export function getMeaningByName(name: string): SpiritualMeaning | undefined {
  return MEANINGS.find(
    (m) => m.name.toLowerCase() === name.toLowerCase()
  );
}

export function searchMeanings(query: string): SpiritualMeaning[] {
  const lower = query.toLowerCase();
  return MEANINGS.filter(
    (m) =>
      m.name.toLowerCase().includes(lower) ||
      m.themes.some((t) => t.toLowerCase().includes(lower)) ||
      m.keywords.some((k) => k.toLowerCase().includes(lower))
  );
}