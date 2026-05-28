export interface CrystalMeaning {
  name: string;
  namePt: string;
  color: string;
  chakra: string[];
  elements: string[];
  planets: string[];
  keywords: string[];
  healing: {
    physical: string[];
    emotional: string[];
    spiritual: string[];
  };
  zodiac: string[];
}

const crystalMeanings: CrystalMeaning[] = [
  {
    name: "Quartz",
    namePt: "Quartzo",
    color: "Transparente/Branco",
    chakra: ["Coroa", "Todos os chakras"],
    elements: ["Terra", "Água", "Fogo", "Ar", "Espírito"],
    planets: ["Sol", "Lua"],
    keywords: ["Clareza", "Amplificação", "Energia", "Purificação", "Equilíbrio"],
    healing: {
      physical: ["Fortalece o sistema imunológico", "Alivia dores de cabeça", "Melhora a memória", "Equilibra os meridianos"],
      emotional: ["Remove bloqueios emocionais", "Promove clareza mental", "Harmoniza emoções", "Auxilia na meditação"],
      spiritual: ["Conexão espiritual", "Amplifica intenções", "Alinha chakras", "Proteção energética"]
    },
    zodiac: ["Leão", "Libra", "Capricórnio"]
  },
  {
    name: "Amethyst",
    namePt: "Ametista",
    color: "Roxo",
    chakra: ["Terceiro Olho", "Coroa"],
    elements: ["Água", "Ar"],
    planets: ["Saturno", "Netuno", "Júpiter"],
    keywords: ["Calma", "Proteção", "Espiritualidade", "Intuição", "Sono tranquilo"],
    healing: {
      physical: ["Alivia insônia", "Reduz dores de cabeça", "Fortalece o sistema nervoso", "Auxilia na desintoxicação"],
      emotional: ["Alivia estresse e ansiedade", "Promove paz interior", "Auxilia superação de traumas", "Favorece原谅"],
      spiritual: ["Desenvolvimento espiritual", "Intuição", "Conexão com planos superiores", "Proteção espiritual"]
    },
    zodiac: ["Peixes", "Sagitário", "Aquário"]
  },
  {
    name: "Rose Quartz",
    namePt: "Quartzo Rosa",
    color: "Rosa",
    chakra: ["Coração"],
    elements: ["Água", "Terra"],
    planets: ["Vênus", "Lua"],
    keywords: ["Amor", "Compaixão", "Fertilidade", "Harmonia", "Perdão"],
    healing: {
      physical: ["Auxilia problemas cardíacos", "Fertilidade", "Sistema circulatório", "Cicatrização"],
      emotional: ["Autoamor", "Perdão", "Harmonia em relacionamentos", "Liberta mágoas", "Abre o coração"],
      spiritual: ["Energia amorosa", "Conexão com o Eu Superior", "Harmonia emocional", " Paz interior"]
    },
    zodiac: ["Touro", "Libra"]
  },
  {
    name: "Citrine",
    namePt: "Citrino",
    color: "Amarelo/Dourado",
    chakra: ["Plexo Solar", "Sacro"],
    elements: ["Fogo", "Terra"],
    planets: ["Sol", "Júpiter"],
    keywords: ["Abundância", "Prosperidade", "Energia", "Criatividade", "Confiança"],
    healing: {
      physical: ["Estimula digestão", "Tonifica o sistema nervoso", "Auxilia na metabolização", "Energia vital"],
      emotional: ["Afasta negativismo", "Promove alegria", "Estimula criatividade", "Fortalece autoestima"],
      spiritual: ["Manifestação de desejos", "Abundância", "Proteção contra energia negativa", "Prosperidade"]
    },
    zodiac: ["Áries", "Leão", "Gêmeos"]
  },
  {
    name: "Obsidian",
    namePt: "Obsidiana",
    color: "Preto",
    chakra: ["Raiz"],
    elements: ["Fogo", "Terra"],
    planets: ["Plutão", "Saturno"],
    keywords: ["Proteção", "Ancoramento", "Verdade", "Purificação", "Escudo"],
    healing: {
      physical: ["Circulação sanguínea", "Dores musculares", "Detoxificação", "Aquecimento corporal"],
      emotional: ["Liberta traumas", "Revela verdades ocultas", "Remove negatividade", "Força interior"],
      spiritual: ["Proteção máxima", "Bloqueia energias negativas", "Aterra excesso espiritual", "Purificação profunda"]
    },
    zodiac: ["Escorpião", "Sagitário"]
  },
  {
    name: "Tiger's Eye",
    namePt: "Olho de Tigre",
    color: "Marrom/Dourado",
    chakra: ["Plexo Solar", "Sacro"],
    elements: ["Terra", "Fogo"],
    planets: ["Sol", "Marte"],
    keywords: ["Coragem", "Força", "Determinação", "Equilíbrio", "Proteção"],
    healing: {
      physical: ["Fortalece ossos e articulações", "Auxilia visão", "Sistema digestivo", "Energia física"],
      emotional: ["Superar medos", "Promove confiança", "Determinação", "Equilibra emoções", "Coragem"],
      spiritual: ["Proteção durante meditação", "Foco mental", "Clareza de pensamento", "Sintonização com recursos"]
    },
    zodiac: ["Leão", "Capricórnio"]
  },
  {
    name: "Lapis Lazuli",
    namePt: "Lápis Lazúli",
    color: "Azul Escuro com Pirita",
    chakra: ["Terceiro Olho", "Garganta"],
    elements: ["Água", "Ar"],
    planets: ["Saturno", "Vênus"],
    keywords: ["Verdade", "Sabedoria", "Comunicação", "Intuição", "Honestidade"],
    healing: {
      physical: ["Alivia dores de garganta", "Frequência vocal", "Sistema nervoso", "Glândula pineal"],
      emotional: ["Expressão verdadeira", "Comunicação clara", "Liberdade emocional", "Autoexpressão"],
      spiritual: ["Desenvolvimento da intuição", "Sabedoria interior", "Conexão espiritual", "Verdade interior"]
    },
    zodiac: ["Sagitário", "Aquário"]
  },
  {
    name: "Turquoise",
    namePt: "Turquesa",
    color: "Azul-Verde",
    chakra: ["Garganta", "Coração"],
    elements: ["Água", "Terra", "Ar"],
    planets: ["Saturno", "Vênus", "Júpiter"],
    keywords: ["Comunicação", "Proteção", "Curação", "Equilíbrio", "Sincronicidade"],
    healing: {
      physical: ["Fortalece sistema imunológico", "Alivia inflamações", "Detoxificação", "Problemas respiratórios"],
      emotional: ["Promove comunicação verdadeira", "Harmoniza relacionamentos", "Liberta culpas", "Equilíbrio emocional"],
      spiritual: ["Proteção energética", "Alinha corpo espiritual", "Sincronicidades", "Conexão com a natureza"]
    },
    zodiac: ["Escorpião", "Sagitário", "Peixes"]
  },
  {
    name: "Malachite",
    namePt: "Malaquita",
    color: "Verde com veios",
    chakra: ["Coração", "Plexo Solar"],
    elements: ["Terra", "Água"],
    planets: ["Vênus", "Plutão"],
    keywords: ["Transformação", "Proteção", "Healing", "Equilíbrio", "Mudança"],
    healing: {
      physical: ["Fortalece sistema imunológico", "Auxilia coração", "Protege órgãos", "Alívio de cólicas"],
      emotional: ["Absorve negativity", "Promove transformação", "Liberta mágoas", "Integração de experiências"],
      spiritual: ["Transformação espiritual", "Purificação auricul", "Proteção de ataques", "Desenvolvimento kármico"]
    },
    zodiac: ["Libra", "Escorpião", "Capricórnio"]
  },
  {
    name: "Moonstone",
    namePt: "Pedra da Lua",
    color: "Branco/Leite com reflexos azuis",
    chakra: ["Sacro", "Coração", "Terceiro Olho"],
    elements: ["Água"],
    planets: ["Lua"],
    keywords: ["Intuição", "Feminilidade", "Equilíbrio", "Novas beginnings", " Ciclos"],
    healing: {
      physical: ["Regula ciclos femininos", "Sistema hormonal", "Fertilidade", "Sistema digestivo"],
      emotional: ["Intuição emocional", "Aceitação", "Novas beginnings", "Equilíbrio hormonal emocional"],
      spiritual: ["Conexão lunar", "Intuição espiritual", " Ciclos de vida", "Proteção feminina"]
    },
    zodiac: ["Câncer", "Libra", "Escorpião"]
  },
  {
    name: "Sunstone",
    namePt: "Pedra do Sol",
    color: "Laranja/Dourado",
    chakra: ["Sacro", "Plexo Solar"],
    elements: ["Fogo"],
    planets: ["Sol"],
    keywords: ["Energia", "Alegria", "Prosperidade", "Sucesso", "Vitalidade"],
    healing: {
      physical: ["Estimula metabolismo", "Energia vital", "Sistema digestivo", "Aquecimento corporal"],
      emotional: ["Dissipa melancholy", "Promove otimismo", "Energia positiva", "Autoestima", "Liberdade"],
      spiritual: ["Abundância solar", "Sucesso em empreendimentos", "Luz interior", "Prosperidade"]
    },
    zodiac: ["Leão", "Áries", "Libra"]
  },
  {
    name: "Labradorite",
    namePt: "Labradorita",
    color: "Cinza/Escuro com reflexos",
    chakra: ["Terceiro Olho", "Coroa"],
    elements: ["Água", "Fogo"],
    planets: ["Lua", "Sol"],
    keywords: ["Intuição", "Magia", "Proteção", "Transformação", "Descoberta"],
    healing: {
      physical: ["Fortalece sistema imunológico", "Auxilia metabolismo", "Regula pressão arterial", "Desintoxicação"],
      emotional: ["Desperta intuição", "Protege aura", "Dissipa negatividade", "Estimula imaginação"],
      spiritual: ["Conexão espiritual profunda", "Desenvolvimento psychic", "Barreira protetora", "Descoberta de propósito"]
    },
    zodiac: ["Escorpião", "Sagitário", "Leão"]
  },
  {
    name: "Black Tourmaline",
    namePt: "Turmalina Negra",
    color: "Preto",
    chakra: ["Raiz"],
    elements: ["Terra"],
    planets: ["Saturno", "Marte"],
    keywords: ["Proteção", "Ancoramento", "Purificação", "Escudo", "Força"],
    healing: {
      physical: ["Ancoramento físico", "Proteção contra radiação", "Fortalece sistema imunológico", "Circulação"],
      emotional: ["Purifica negativity", "Proteção psychic", "Ancoramento emocional", "Dissipa medos"],
      spiritual: ["Escudo protetor máximo", "Aterra energies", "Purificação auricul", "Proteção de ataques"]
    },
    zodiac: ["Capricórnio", "Escorpião"]
  },
  {
    name: "Selenite",
    namePt: "Selenita",
    color: "Branco/Transparente",
    chakra: ["Coroa", "Terceiro Olho"],
    elements: ["Água", "Luz"],
    planets: ["Lua"],
    keywords: ["Clareza", "Paz", "Purificação", "Conexão", "Alinhamento"],
    healing: {
      physical: ["Limpa campo energético", "Relaxamento profundo", "Alívio de tensões", "Promove sono reparador"],
      emotional: ["Paz interior", "Limpeza emocional", "Harmonia", "Liberta padrões negativos"],
      spiritual: ["Alinhamento de chakras", "Conexão superior", "Purificação de outros cristais", "Elevação espiritual"]
    },
    zodiac: ["Touro", "Câncer", "Libra"]
  },
  {
    name: "Garnet",
    namePt: "Granada",
    color: "Vermelho/Bordô",
    chakra: ["Raiz", "Coração"],
    elements: ["Terra", "Fogo"],
    planets: ["Marte", "Plutão"],
    keywords: ["Amor", "Paixão", "Energia", "Criatividade", "Ancoramento"],
    healing: {
      physical: ["Circulação sanguínea", "Sistema reprodutivo", "Energia vital", "Fortalece sistema imunológico"],
      emotional: ["Amor e paixão", "Confiança", "Força interior", "Motivação", "Compromisso"],
      spiritual: ["Energia criativa", "Ancoramento espiritual", "Proteção kármica", "Desbloqueio energetic"]
    },
    zodiac: ["Áries", "Escorpião", "Leão"]
  },
  {
    name: "Amazonite",
    namePt: "Amazonita",
    color: "Verde-Turquesa com Branco",
    chakra: ["Coração", "Garganta"],
    elements: ["Água", "Terra"],
    planets: ["Vênus"],
    keywords: ["Equilíbrio", "Comunicação", "Harmonia", "Coragem", "Esperança"],
    healing: {
      physical: ["Auxilia metabolismo", "Sistema nervoso", "Alivia dores de cabeça", "Equilibra glândulas"],
      emotional: ["Comunicação honesta", "Harmoniza emoções", "Promove coragem", "Liberta medos de falar"],
      spiritual: ["Filtro de negativity", "Equilíbrio entre Yin e Yang", "Conexão com a natureza", "Esperança renovada"]
    },
    zodiac: ["Touro", "Libra"]
  },
  {
    name: "Pyrite",
    namePt: "Pirita",
    color: "Dourado/Metálico",
    chakra: ["Plexo Solar", "Raiz"],
    elements: ["Terra", "Fogo"],
    planets: ["Sol", "Marte"],
    keywords: ["Prosperidade", "Abundância", "Proteção", "Força", "Manifestação"],
    healing: {
      physical: ["Fortalece corpo físico", "Auxilia sistema digestivo", "Energia vital", "Proteção energética"],
      emotional: ["Afasta negativity", "Promove autopreservação", "Fortalece vontade", "Confiança"],
      spiritual: ["Manifestação de abundância", "Escudo contra negativity", "Prosperidade", "Foco mental"]
    },
    zodiac: ["Leão", "Áries"]
  },
  {
    name: "Jade",
    namePt: "Jade",
    color: "Verde (variedades em branco, lavanda, amarelo)",
    chakra: ["Coração", "Rim"],
    elements: ["Terra"],
    planets: ["Vênus", "Saturno"],
    keywords: ["Harmonia", "Sorte", "Equilíbrio", "Sabedoria", "Amor"],
    healing: {
      physical: ["Harmoniza órgãos internos", "Sistema renal", "Fertilidade", "Sistema nervoso"],
      emotional: ["Harmonia emocional", "Calma interior", "Promove原谅", "Equilíbrio entre mente e coração"],
      spiritual: ["Sorte e prosperidade", "Sabedoria interior", "Amor incondicional", "Proteção em viagens"]
    },
    zodiac: ["Touro", "Libra", "Gêmeos"]
  },
  {
    name: "Agate",
    namePt: "Ágata",
    color: "Variadas (instantâneos, listrada)",
    chakra: ["Var conforme tipo"],
    elements: ["Terra"],
    planets: ["Lua", "Saturno"],
    keywords: ["Equilíbrio", "Proteção", "Harmonia", "Força", "Conexão"],
    healing: {
      physical: ["Harmoniza cuerpo físico", "Fortalece sistema imunológico", "Alivia dores", "Equilibra Yin/Yang"],
      emotional: ["Estabilidade emocional", "Harmonia", "Ancoramento", "Confiança", "Proteção psicológica"],
      spiritual: ["Proteção energética", "Equilíbrio espiritual", "Conexão com a Terra", "Harmonização de chakras"]
    },
    zodiac: ["Gêmeos", "Ciência"]
  },
  {
    name: "Opal",
    namePt: "Opala",
    color: "Variado com jogo de cores",
    chakra: ["Todos os chakras"],
    elements: ["Água"],
    planets: ["Vênus", "Netuno"],
    keywords: ["Inspiração", "Criatividade", "Imaginação", "Amor", "Emotional healing"],
    healing: {
      physical: ["Fortalece memória", "Sistema nervoso", "Frequência emocional", "Pele"],
      emotional: ["Liberta inhibições", "Estimula emoções", "Promoveautoexpressão", "Amplifica sentimentos"],
      spiritual: ["Inspiração espiritual", "Desperta psychic abilities", "Conexão com o Eu Superior", "Transformação"]
    },
    zodiac: ["Câncer", "Libra", "Peixes", "Escorpião"]
  },
  {
    name: "Aquamarine",
    namePt: "Água-Marinha",
    color: "Azul-mar",
    chakra: ["Garganta", "Terceiro Olho"],
    elements: ["Água"],
    planets: ["Marte", "Netuno"],
    keywords: ["Calma", "Comunicação", "Coragem", "Purificação", "Claridade"],
    healing: {
      physical: ["Alivia alergias", "Problemas de garganta", "Sistema imunológico", "Glândulas"],
      emotional: ["Comunicação calma", "Dissipa medo", "Promove tolerancia", "Serenidade"],
      spiritual: ["Purificação energética", "Proteção em viagens marítimas", "Clareza mental", "Conexão com o mar"]
    },
    zodiac: ["Peixes", "Aquário", "Gêmeos"]
  },
  {
    name: "Rhodonite",
    namePt: "Rodonita",
    color: "Rosa com veios negros",
    chakra: ["Coração"],
    elements: ["Terra", "Fogo"],
    planets: ["Marte", "Vênus"],
    keywords: ["Amor", "Perdão", "Compensação", "Healing emocional", "Equilíbrio"],
    healing: {
      physical: ["Auxilia sistema cardíaco", "Glândulas", "Sistema nervoso", "Cicatrização"],
      emotional: ["Perdão profundo", "Liberta mágoas", "Compensação emocional", "Abre coração ao amor"],
      spiritual: ["Healing de traumas kármicos", "Harmonia relacional", "Libertação de apegos", "Amor incondicional"]
    },
    zodiac: ["Touro", "Libra"]
  },
  {
    name: "Carnelian",
    namePt: "Cornalina",
    color: "Laranja/Vermelho",
    chakra: ["Sacro", "Plexo Solar"],
    elements: ["Fogo"],
    planets: ["Marte", "Sol"],
    keywords: ["Energia", "Motivação", "Coragem", "Criatividade", "Vitalidade"],
    healing: {
      physical: ["Estimula metabolism", "Sistema reprodutivo", "Energia vital", "Circulação"],
      emotional: ["Motivação", "Coragem para agir", "Superación del miedo", "Impulso criativo"],
      spiritual: ["Proteção durante viagens", "Energia vital", "Conexão com o lower chakras", "Manifestação de ações"]
    },
    zodiac: ["Áries", "Leão", "Virgem"]
  },
  {
    name: "Onyx",
    namePt: "Ônix",
    color: "Preto",
    chakra: ["Raiz"],
    elements: ["Terra"],
    planets: ["Saturno", "Marte"],
    keywords: ["Força", "Resiliência", "Proteção", "Ancoramento", "Auto-controle"],
    healing: {
      physical: ["Fortalece ossos", "Sistema nervoso", "Ancoramento físico", "Dentes"],
      emotional: ["Auto-disciplina", "Resiliência", "Foco", "Proteção contra negativity", "Força interior"],
      spiritual: ["Proteção máxima", "Ancoramento espiritual", "Libertação de adicções", "Fortalecimento do ego saudável"]
    },
    zodiac: ["Leão", "Capricórnio", "Escorpião"]
  },
  {
    name: "Aventurine",
    namePt: "Aventurina",
    color: "Verde (variedades em dourado, azul, vermelho)",
    chakra: ["Coração", "Plexo Solar"],
    elements: ["Terra", "Fogo"],
    planets: ["Vênus"],
    keywords: ["Sorte", "Prosperidade", "Calma", "Equilíbrio", "Healing"],
    healing: {
      physical: ["Sistema cardíaco", "Pressão arterial", "Sistema imunológico", "Visão"],
      emotional: ["Calma emocional", "Equilíbrio", "Promove prosperidade", "Harmoniza ambientes"],
      spiritual: ["Sorte e oportunidades", "Harmonia espiritual", "Conexão com a natureza", "Prosperidade"]
    },
    zodiac: ["Touro", "Ciência"]
  },
  {
    name: "Bloodstone",
    namePt: "Heliotropo/Pedra de Sangue",
    color: "Verde escuro com manchas vermelhas",
    chakra: ["Raiz", "Coração"],
    elements: ["Terra", "Fogo"],
    planets: ["Marte", "Júpiter"],
    keywords: ["Purificação", "Proteção", "Vitalidade", "Coragem", "Healing"],
    healing: {
      physical: ["Purificação do sangue", "Circulação", "Sistema imunológico", "Energia vital"],
      emotional: ["Purificação emocional", "Coragem em momentos difíceis", "Renovação", "Força"],
      spiritual: ["Purificação energética", "Proteção em batalhas", "Vitalidade espiritual", "Martírio transformed"]
    },
    zodiac: ["Áries", "Escorpião", "Peixes"]
  },
  {
    name: "Celestite",
    namePt: "Celestita",
    color: "Azul claro",
    chakra: ["Terceiro Olho", "Coroa"],
    elements: ["Luz", "Ar"],
    planets: ["Lua", "Netuno"],
    keywords: ["Paz", "Harmonia", "Comunicação angelical", "Desenvolvimento espiritual", "Clareza"],
    healing: {
      physical: ["Alivia tensão", "Relaxamento profundo", "Limpa energias densas", "Promove sono tranquilo"],
      emotional: ["Paz interior profunda", "Harmonia emocional", "Alívio da preocupação", "Aceitação"],
      spiritual: ["Conexão angelical", "Desenvolvimento psychic", "Clareza espiritual", "Elevação da consciência"]
    },
    zodiac: ["Libra", "Aquário"]
  },
  {
    name: "Chrysocolla",
    namePt: "Crisocola",
    color: "Azul-verde a verde",
    chakra: ["Garganta", "Coração", "Plexo Solar"],
    elements: ["Água", "Terra"],
    planets: ["Vênus", "Terra"],
    keywords: ["Comunicação", "Tranquilidade", "Healing", "Sabedoria", "Equilíbrio"],
    healing: {
      physical: ["Healing do sistema respiratório", "Tireoide", "Articulações", "Músculos"],
      emotional: ["Comunicação não-violenta", "Tranquilidade emocional", "Liberta tensão", "Equilíbrio hormonal"],
      spiritual: ["Sabedoria da Terra", "Conexão com a natureza", "Guia em meditação", "Purificação"]
    },
    zodiac: ["Virgem", "Gêmeos", "Touro"]
  },
  {
    name: "Dumortierite",
    namePt: "Dumortierita",
    color: "Azul a azul-violeta",
    chakra: ["Terceiro Olho", "Garganta"],
    elements: ["Ar"],
    planets: ["Saturno"],
    keywords: ["Ordem", "Paciência", "Comunicação", "Desenvolvimento mental", "Disciplina"],
    healing: {
      physical: ["Sistema nervoso", "Cérebro", "Relaxamento muscular", "Alívio de espasmos"],
      emotional: ["Promove paciência", "Ordem emocional", "Disciplina", "Calma em situações difíceis"],
      spiritual: ["Desenvolvimento de dons mentais", "Conexão com a sabedoria", "Expansão da consciência", "Foco em meditação"]
    },
    zodiac: ["Leão", "Aquário"]
  },
  {
    name: "Fluorite",
    namePt: "Fluorita",
    color: "Variada (verde, roxo, azul, transparente, amarelo)",
    chakra: ["Todos os chakras"],
    elements: ["Ar"],
    planets: ["Mercúrio", "Netuno"],
    keywords: ["Ordem", "Clareza", "Concentração", "Proteção", "Equilíbrio"],
    healing: {
      physical: ["Limpa campo energético", "Fortalece dentes e ossos", "Sistema imunológico", "Alivia gripes e resfriados"],
      emotional: ["Ordem emocional", "Clareza mental", "Concentração", "Auxilia tomada de decisões"],
      spiritual: ["Proteção psíquica", "Alinhamento dos chakras", "Absorção de energias negativas", "Desenvolvimento espiritual"]
    },
    zodiac: ["Gêmeos", "Capricórnio", "Peixes"]
  },
  {
    name: "Hematite",
    namePt: "Hematita",
    color: "Cinza metálico/Preto",
    chakra: ["Raiz"],
    elements: ["Terra"],
    planets: ["Saturno", "Marte"],
    keywords: ["Ancoramento", "Proteção", "Força", "Concentração", "Equilíbrio"],
    healing: {
      physical: ["Fortalece sistema circulatório", "Anemia", "Dores de cabeça", "Energia física"],
      emotional: ["Ancoramento emocional", "Foco mental", "Disciplina", "Proteção contra negativity"],
      spiritual: ["Escudo protetor", "Aterra energies", "Absorve negativity", "Fortalecimento da vontade"]
    },
    zodiac: ["Áries", "Aquário", "Capricórnio"]
  },
  {
    name: "Howlite",
    namePt: "Howlita",
    color: "Branco com veios cinza ou preto",
    chakra: ["Coroa", "Plexo Solar"],
    elements: ["Terra"],
    planets: ["Lua"],
    keywords: ["Calma", "Paciência", "Sonhos", "Amor", "Liberdade emocional"],
    healing: {
      physical: ["Alivia dores", "Relaxamento muscular", "Melhora qualidade do sono", "Alivia insônia"],
      emotional: ["Calma emocional", "Paciência", "Liberta preocupações", "Amor e compaixão"],
      spiritual: ["Sonhos lúcidos", "Lembrete de sonhos", "Despertar espiritual", "Conexão com sabedoria superior"]
    },
    zodiac: ["Gêmeos", "Virgem"]
  },
  {
    name: "Iolite",
    namePt: "Iolita",
    color: "Azul-violeta",
    chakra: ["Terceiro Olho", "Garganta"],
    elements: ["Água", "Luz"],
    planets: ["Saturno", "Netuno"],
    keywords: ["Visão interior", "Orientação", "Descoberta", "Liberdade", "Intuição"],
    healing: {
      physical: ["Auxilia visão noturna", "Sistema nervoso", "Limpa o sangue", "Alivia enxaquecas"],
      emotional: ["Liberta dependências", "Orientação interior", "Descoberta de verdades", "Liberdade emocional"],
      spiritual: ["Desenvolvimento da visão interior", "Viagens astrais", "Conexão com os guias", "Descoberta de propósito"]
    },
    zodiac: ["Sagitário", "Libra", "Touro"]
  },
  {
    name: "Jasper",
    namePt: "Jaspe",
    color: "Variado (vermelho, amarelo, verde, azul, marrom)",
    chakra: ["Var conforme tipo"],
    elements: ["Terra"],
    planets: ["Terra"],
    keywords: ["Proteção", "Ancoramento", "Força", "Nurturing", "Conexão com a Terra"],
    healing: {
      physical: ["Fortalece cuerpo físico", "Sistema imunológico", "Energia vital", "Órgãos internos"],
      emotional: ["Proteção emocional", "Ancoramento", "Nurturing", "Estabilidade", "Calma"],
      spiritual: ["Conexão com a Terra", "Proteção espiritual", "Harmonia com a natureza", "Força em momentos difíceis"]
    },
    zodiac: ["Leão", "Virgem"]
  },
  {
    name: "Kyanite",
    namePt: "Cianita",
    color: "Azul (variedades em preto, verde, laranja)",
    chakra: ["Todos os chakras (especialmente Terceiro Olho, Garganta)"],
    elements: ["Água", "Ar"],
    planets: ["Netuno"],
    keywords: ["Alinhamento", "Comunicação", "Intuição", "Equilíbrio", "Meditação"],
    healing: {
      physical: ["Alinha coluna vertebral", "Auxilia sistema nervoso", "Melhora memória", "Alivia dores crônicas"],
      emotional: ["Comunicação clara", "Intuição emocional", "Equilíbrio emocional", "Liberta bloqueios"],
      spiritual: ["Alinhamento dos chakras", "Conexão espiritual", "Meditação profunda", "Transporte de energia"]
    },
    zodiac: ["Áries", "Touro", "Libra"]
  },
  {
    name: "Lepidolite",
    namePt: "Lepidolita",
    color: "Lilás/Roxo com pontos cinza",
    chakra: ["Coração", "Coroa"],
    elements: ["Água", "Terra"],
    planets: ["Lua", "Saturno"],
    keywords: ["Calma", "Paz", "Equilíbrio", "Healing emocional", "Transição"],
    healing: {
      physical: ["Alivia estresse", "Sistema nervoso", "Alívio de dores", "Equilibra glândulas"],
      emotional: ["Calma emocional", "Liberta ansiedade", "Equilíbrio emocional", "Transição suave em mudanças"],
      spiritual: ["Conexão com guias", "Libertação de padrões negativos", "Desenvolvimento espiritual", "Amor incondicional"]
    },
    zodiac: ["Libra", "Escorpião", "Sagitário"]
  },
  {
    name: "Peridot",
    namePt: "Perídoto",
    color: "Verde-oliva",
    chakra: ["Coração", "Plexo Solar"],
    elements: ["Terra", "Fogo"],
    planets: ["Sol", "Vênus"],
    keywords: ["Prosperidade", "Abundância", "Healing", "Proteção", "Renovação"],
    healing: {
      physical: ["Healing do coração", "Sistema digestivo", "Fortalecimento do fígado", "Auxilia intestino"],
      emotional: ["Liberta ressentimentos", "Renovação emocional", "Prosperidade mental", "Felicidade"],
      spiritual: ["Manifestação de abundância", "Proteção energética", "Prosperidade espiritual", "Conexão com a natureza"]
    },
    zodiac: ["Câncer", "Virgem", "Libra"]
  },
  {
    name: "Sapphire",
    namePt: "Safira",
    color: "Azul (variedades em todas as cores)",
    chakra: ["Terceiro Olho", "Garganta"],
    elements: ["Terra", "Água"],
    planets: ["Saturno", "Júpiter"],
    keywords: ["Sabedoria", "Proteção", "Intuição", "Verdade", "Nobreza"],
    healing: {
      physical: ["Sistema nervoso", "Glândulas", "Alivia febre", "Sangramento", "Articulações"],
      emotional: ["Sabedoria emocional", "Verdade interior", "Proteção emocional", "Nobreza de espírito"],
      spiritual: ["Intuição profunda", "Proteção espiritual", "Sabedoria divina", "Foco em meditação"]
    },
    zodiac: ["Touro", "Libra", "Sagitário"]
  },
  {
    name: "Sodalite",
    namePt: "Sodalita",
    color: "Azul com veios brancos",
    chakra: ["Terceiro Olho", "Garganta"],
    elements: ["Água", "Ar"],
    planets: ["Lua", "Saturno"],
    keywords: ["Intuição", "Comunicação", "Ordem", "Verdade", "Calma"],
    healing: {
      physical: ["Sistema imunológico", "Glândulas", "Sistema digestivo", "Alívio de insônia"],
      emotional: ["Comunicação honesta", "Ordem emocional", "Confiança", "Liberta medos de julgamento"],
      spiritual: ["Intuição", "Desenvolvimento psychic", "Verdade interior", "Conexão com o Eu Superior"]
    },
    zodiac: ["Gêmeos", "Sagitário", "Aquário"]
  },
  {
    name: "Unakite",
    namePt: "Unakita",
    color: "Verde com laranja/rosa",
    chakra: ["Coração"],
    elements: ["Terra"],
    planets: ["Terra"],
    keywords: ["Equilíbrio", "Healing", "Grounding", "Crescimento", "Expectativa paciente"],
    healing: {
      physical: ["Auxilia recuperação de doenças", "Sistema reprodutivo", "Crescimento celular", "Sistema circulatório"],
      emotional: ["Equilíbrio emocional", "Liberta frustrações", "Aceitação do presente", "Expectativa paciente"],
      spiritual: ["Grounding espiritual", "Conexão com ciclos da Terra", "Healing de traumas passados", "Crescimento espiritual gradual"]
    },
    zodiac: ["Escorpião", "Sagitário"]
  },
  {
    name: "Zircon",
    namePt: "Zircão",
    color: "Variado (incolor, azul, amarelo, vermelho, verde)",
    chakra: ["Coroa", "Plexo Solar"],
    elements: ["Fogo", "Terra"],
    planets: ["Sol", "Marte"],
    keywords: ["Proteção", "Prosperidade", "Pureza", "Força", "Honra"],
    healing: {
      physical: ["Auxilia sistema circulatório", "Sistema nervoso", "Metabolismo", "Energia vital"],
      emotional: ["Pureza emocional", "Honra pessoal", "Proteção contra negativity", "Fortalecimento interior"],
      spiritual: ["Prosperidade espiritual", "Proteção de ataques", "Conexão com a luz", "Elevação da consciência"]
    },
    zodiac: ["Sagitário", "Leo"]
  },
  {
    name: "Apatite",
    namePt: "Apatita",
    color: "Azul, Verde, Amarelo, Incolor, Roxo",
    chakra: ["Garganta", "Terceiro Olho", "Coração"],
    elements: ["Terra", "Água"],
    planets: ["Vênus", "Mercúrio"],
    keywords: ["Motivação", "Criatividade", "Comunicação", "Intuição", "Claridade"],
    healing: {
      physical: ["Apetite saudável", "Metabolismo", "Sistema imunológico", "Articulações", "Cabelo e unhas"],
      emotional: ["Motivação para alcançar metas", "Criatividade", "Superar bloqueios", "Expressão pessoal"],
      spiritual: ["Intuição aguçada", "Despertar psychic", "Conexão espiritual", "Clareza de propósito"]
    },
    zodiac: ["Gêmeos", "Libra"]
  },
  {
    name: " Aragonite",
    namePt: " Aragonita",
    color: "Branco, Cinza, Marrom, Verde, Vermelho, Amarelo",
    chakra: ["Raiz", "Coração"],
    elements: ["Terra"],
    planets: ["Terra"],
    keywords: ["Stability", "Ancoramento", "Conexão Terra", "Calma", "Paciência"],
    healing: {
      physical: ["Fortalece ossos e dentes", "Sistema imunológico", "Articulações", "Absorção de cálcio"],
      emotional: ["Ancoramento emocional", "Calma em momentos de estresse", "Paciência", "Foco"],
      spiritual: ["Conexão profunda com a Terra", "Ordem cósmica", "Stability espiritual", "Canal de energia terrestre"]
    },
    zodiac: ["Capricórnio", "Touro"]
  },
  {
    name: "Bismuth",
    namePt: "Bismuto",
    color: "Arco-íris metálico",
    chakra: ["Todos os chakras", "Coração"],
    elements: ["Terra", "Fogo"],
    planets: ["Vênus", "Marte"],
    keywords: ["Transição", "Transformação", "Alívio de solidão", "Ordem", "Progresso"],
    healing: {
      physical: ["Alivia sintomas de gripe", "Sistema digestivo", "Energia física", "Recuperação pós-cirúrgica"],
      emotional: ["Alívio da solidão", "Transições emocionais suaves", "Ordem em momentos caóticos", "Amor próprio"],
      spiritual: ["Progresso espiritual", "Conexão com escalas cósmicas", "Transformação pessoal", "Libertação de padrões"]
    },
    zodiac: ["Leão", "Aquário"]
  },
  {
    name: "Calcite",
    namePt: "Calcita",
    color: "Variado (incolor, branco, amarelo, laranja, vermelho, verde, azul)",
    chakra: ["Var conforme tipo"],
    elements: ["Terra"],
    planets: ["Lua", "Mercúrio"],
    keywords: ["Amplificação", "Clareza", "Memória", "Calma", "Purificação"],
    healing: {
      physical: ["Fortalece ossos e dentes", "Sistema imunológico", "Absorção de cálcio", "Regeneração celular"],
      emotional: ["Clareza mental", "Calma emocional", "Memória", "Dissipa medos e ansiedades"],
      spiritual: ["Amplificação de energia", "Purificação de chakras", "Memória celular", "Conexão com dimensões superiores"]
    },
    zodiac: ["Câncer", "Caranguejo"]
  },
  {
    name: "Charoite",
    namePt: "Charoíta",
    color: "Roxo com veios e padrões",
    chakra: ["Coração", "Terceiro Olho", "Coroa"],
    elements: ["Água", "Luz"],
    planets: ["Netuno", "Lua"],
    keywords: ["Transformação", "Healing", "Intuição", "Expansão", "Inspiração"],
    healing: {
      physical: ["Alivia dores crônicas", "Sistema nervoso", "Músculos", "Cefaleias", "Insônia"],
      emotional: ["Transformação emocional", "Healing de traumas", "Libertação de padrões viciosos", "Expansão da consciência"],
      spiritual: ["Despertar espiritual", "Conexão com o Eu Superior", "Integração de experiências de vida", "Transformação da consciência"]
    },
    zodiac: ["Sagitário", "Escorpião"]
  },
  {
    name: "Chrysoprase",
    namePt: "Crisoprase",
    color: "Verde-maçã",
    chakra: ["Coração"],
    elements: ["Terra", "Água"],
    planets: ["Vênus"],
    keywords: ["Prosperidade", "Healing", "Fertilidade", "Perdão", "Esperança"],
    healing: {
      physical: ["Fortalece sistema imunológico", "Coração", "Fertilidade", "Sistema digestivo", "Visão"],
      emotional: ["Perdão profundo", "Liberta ressentimentos", "Esperança renovada", "Promoveautoestima"],
      spiritual: ["Prosperidade spiritual", "Healing kármico", "Conexão com a natureza", "Amor universal"]
    },
    zodiac: ["Touro", "Libra", "Câncer"]
  },
  {
    name: "Dioptase",
    namePt: "Dioptase",
    color: "Verde-esmeralda intenso",
    chakra: ["Coração"],
    elements: ["Terra", "Água"],
    planets: ["Vênus"],
    keywords: ["Healing emocional", "Perdão", "Amor", "Compassão", "Liberdade"],
    healing: {
      physical: ["Fortalece coração", "Sistema circulatório", "Fígado", "Órgãos internos"],
      emotional: ["Healing profundo de feridas emocionais", "Perdão", "Compassão", "Libertação de mágoas antigas"],
      spiritual: ["Amor incondicional", "Abertura do coração espiritual", "Transformação emocional", "Libertação de crenças limitantes"]
    },
    zodiac: ["Touro", "Libra", "Escorpião"]
  },
  {
    name: "Dolomite",
    namePt: "Dolomita",
    color: "Branco, Rosa, Marrom, Incolor",
    chakra: ["Coração", "Coroa"],
    elements: ["Terra"],
    planets: ["Terra"],
    keywords: ["Compassão", "Healing", "Tolerância", "Relaxamento", "Generosidade"],
    healing: {
      physical: ["Fortalece ossos", "Sistema muscular", "Relaxamento corporal", "Alívio de cãibras"],
      emotional: ["Compassão emocional", "Tolerância com os outros", "Healing de relacionamentos", "Generosidade"],
      spiritual: ["Conexão com a Terra", "Relaxamento espiritual", "Harmonia interior", "Abertura para curar"]
    },
    zodiac: ["Câncer", "Virgem"]
  },
  {
    name: "Eudialyte",
    namePt: "Eudialita",
    color: "Vermelho, Rosa, Amarelo, Marrom, Roxo",
    chakra: ["Coração", "Sacro", "Plexo Solar"],
    elements: ["Terra", "Fogo"],
    planets: ["Vênus", "Marte", "Sol"],
    keywords: ["Amor", "Paixão", "Criatividade", "Desbloqueio", "Manifestação"],
    healing: {
      physical: ["Sistema cardíaco", "Circulação", "Energia vital", "Sistema reprodutivo"],
      emotional: ["Liberta bloqueios emocionais", "Desperta paixão pela vida", "Criatividade emocional", "Conexão com o corpo"],
      spiritual: ["Desbloqueio do coração", "Manifestação do propósito de vida", "Integração da sombra", "Amor próprio"]
    },
    zodiac: ["Leão", "Escorpião", "Touro"]
  },
  {
    name: "Galena",
    namePt: "Galena",
    color: "Cinza prateado metálico",
    chakra: ["Raiz", "Terceiro Olho"],
    elements: ["Terra"],
    planets: ["Saturno"],
    keywords: ["Ancoramento", "Proteção", "Organização", "Liberdade", "Realidade"],
    healing: {
      physical: ["Ancoramento físico", "Alinhamento da coluna", "Sistema nervoso", "Alívio de dores"],
      emotional: ["Organização emocional", "Enfrentar a realidade", "Proteção contra negativity", "Libertação de ilusões"],
      spiritual: ["Conexão com a realidade terrena", "Proteção espiritual", "Grounding durante trabalhos psíquicos", "Honestidade interior"]
    },
    zodiac: ["Capricórnio", "Escorpião"]
  }
];

/**
 * Returns all crystal meanings
 */
export function getMeanings(): CrystalMeaning[] {
  return crystalMeanings;
}

/**
 * Returns crystal meaning by name (supports English and Portuguese)
 */
export function getCrystalByName(name: string): CrystalMeaning | undefined {
  const lowerName = name.toLowerCase();
  return crystalMeanings.find(
    c => 
      c.name.toLowerCase() === lowerName || 
      c.namePt.toLowerCase() === lowerName
  );
}

/**
 * Returns crystals filtered by chakra
 */
export function getCrystalsByChakra(chakra: string): CrystalMeaning[] {
  const lowerChakra = chakra.toLowerCase();
  return crystalMeanings.filter(c => 
    c.chakra.some(ch => ch.toLowerCase().includes(lowerChakra))
  );
}

/**
 * Returns crystals filtered by zodiac sign
 */
export function getCrystalsByZodiac(sign: string): CrystalMeaning[] {
  const lowerSign = sign.toLowerCase();
  return crystalMeanings.filter(c => 
    c.zodiac.some(z => z.toLowerCase().includes(lowerSign))
  );
}

/**
 * Returns crystals by healing property keyword
 */
export function getCrystalsByHealingKeyword(keyword: string): CrystalMeaning[] {
  const lowerKeyword = keyword.toLowerCase();
  return crystalMeanings.filter(c => {
    const allHealing = [
      ...c.healing.physical,
      ...c.healing.emotional,
      ...c.healing.spiritual,
      ...c.keywords
    ];
    return allHealing.some(h => h.toLowerCase().includes(lowerKeyword));
  });
}
