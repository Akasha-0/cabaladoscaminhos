export interface PlantMeaning {
  name: string;
  botanical: string;
  meaning: string;
  element: string;
  chakra: number | null;
  properties: string[];
  folklore: string;
}

const PLANT_MEANINGS: PlantMeaning[] = [
  {
    name: "Alecrim",
    botanical: "Rosmarinus officinalis",
    meaning: "Lembra-me",
    element: "Fogo",
    chakra: 6,
    properties: ["Memória", "Purificação", "Proteção", "Clareza mental"],
    folklore: "Na Grécia antiga, os estudantesgreck wear coroa de alecrim antes dos exames. Na tradição cristã, protege contra maus espíritos.",
  },
  {
    name: "Lavanda",
    botanical: "Lavandula angustifolia",
    meaning: "Devoção",
    element: "Água",
    chakra: 7,
    properties: ["Calma", "Meditação", "Sono", "Amor limpo"],
    folklore: "Na Provença era usada para consagrar roupas. Os egípcios a colocavam nos túmulos para proteção na vida após a morte.",
  },
  {
    name: "Salvia",
    botanical: "Salvia officinalis",
    meaning: "Sabedoria",
    element: "Fogo",
    chakra: 5,
    properties: ["Sabedoria", "Purificação", "Abundância", "Longevidade"],
    folklore: "O nome vem do latim 'salvare' (curar). Os nativos americanos usam para limpeza de espaços de ceremony.",
  },
  {
    name: "Alcachofra",
    botanical: "Cynara cardunculus",
    meaning: "Paciência e previsão",
    element: "Terra",
    chakra: 3,
    properties: ["Fertilidade", "Prosperidade", "Determinação"],
    folklore: "Na Roma antiga simbolizava fertilidade e era oferecida às deusas da Terra.",
  },
  {
    name: "Artemísia",
    botanical: "Artemisia vulgaris",
    meaning: "Coragem no amor",
    element: "Fogo",
    chakra: 1,
    properties: ["Proteção", "Sonhos proféticos", "Cura", "Equilíbrio Yin-Yang"],
    folklore: "Nomeada após a deusa Artemis. Usada em amuletos contra mau-olhado e no dia de São João para proteção.",
  },
  {
    name: "Arruda",
    botanical: "Ruta graveolens",
    meaning: "Graça, pedir desculpas",
    element: "Fogo",
    chakra: 4,
    properties: ["Proteção", "Purificação", "Visão clara", "Afastar inveja"],
    folklore: "Considerada poderosa contra feitiços. Na tradição judaica, cantada no Cântico dos Cânticos. Usada em rituais de proteção em toda a bacia mediterrânea.",
  },
  {
    name: "Manjericão",
    botanical: "Ocimum basilicum",
    meaning: "Amor, boa sorte",
    element: "Fogo",
    chakra: 4,
    properties: ["Amor", "Prosperidade", "Proteção", "Harmonia doméstica"],
    folklore: "Na Índia é sagrado de Vishnu. Na África, protege contra maldições. Na Europa, oferecido aos recém-nascidos para lhes dar boa vida.",
  },
  {
    name: "Alecrim (daagy)",
    botanical: "Rosmarinus officinalis",
    meaning: "Lembra-me",
    element: "Fogo",
    chakra: 6,
    properties: ["Memória", "Fidelidade", "Força", "Proteção"],
    folklore: "Os estudiantes gregos trançavam ramo na cabeça. Na tradição cristã, protege contra maus espíritos.",
  },
  {
    name: "Hortelã",
    botanical: "Mentha spicata",
    meaning: "Hospitalidade, virtude",
    element: "Água",
    chakra: 4,
    properties: ["Energia", "Curación", "Clareza", "Boa saúde"],
    folklore: "Na tradição hebraica, referenced no Cântico dos Cânticos. Os gregos a consideravam sagrada de Hades. Usada para purificar mesas e ambientes.",
  },
  {
    name: "Funcho",
    botanical: "Foeniculum vulgare",
    meaning: "Força, elogio",
    element: "Fogo",
    chakra: 3,
    properties: ["Proteção", "Longevidade", "Abundância", "Fertilidade"],
    folklore: "Na edad média, hangs sobre a porta para afastar maus espíritos. Simbolizava exercícios e força.",
  },
  {
    name: "Tomilho",
    botanical: "Thymus vulgaris",
    meaning: "Coragem, atividade",
    element: "Fogo",
    chakra: 4,
    properties: ["Coragem", "Proteção", "Energia vital", "Purificação"],
    folklore: "Os cavaleiros medievais levavam tomilho ao campo de batalha. Na Grécia, associado a Afrodite e coragem.",
  },
  {
    name: "Losna",
    botanical: "Artemisia absinthium",
    meaning: "Absinto, purificação",
    element: "Fogo",
    chakra: 2,
    properties: ["Proteção", "Sono lúcido", "Visão interior", "Amor verdadeiro"],
    folklore: "Ingredient key da beverage que levou o nome. Usada em rituais de adivinhação. Protege do mau-olhado.",
  },
  {
    name: "Erva-cidreira",
    botanical: "Melissa officinalis",
    meaning: "Compassão, renovação",
    element: "Água",
    chakra: 4,
    properties: ["Calma", "Alívio do stress", "Harmonia", "Amor maternal"],
    folklore: "Considerada a 'elixir da vida' na tradição mágica medieval. Atrai-abelhas, simbolizando a presença de espíritos benignos.",
  },
  {
    name: "Cebolinha",
    botanical: "Allium schoenoprasum",
    meaning: "Resiliencia, adaptação",
    element: "Terra",
    chakra: 1,
    properties: ["Força", "Vitalidade", "Proteção elemental"],
    folklore: "Usada em pequeños rituais de protección en diverses culturas.",
  },
  {
    name: "Orégano",
    botanical: "Origanum vulgare",
    meaning: "Alegria, tranquilidade",
    element: "Fogo",
    chakra: 5,
    properties: ["Paz interior", "Sorte", "Proteção do lar", "Boa saúde"],
    folklore: "Na tradição grega, asociada a Afrodite. Simbolizava alegria e era usada em guirnaldas de casamento.",
  },
  {
    name: "Poejo",
    botanical: "Mentha pulegium",
    meaning: "Proteção, hospitalidade",
    element: "Água",
    chakra: 5,
    properties: ["Proteção", "Sorte", "Descanso", "Recuperação"],
    folklore: "Na ancien Egyipt, colocado sob pillows para proteção contra pesadelos. Na tradição celta, usado para purificar.",
  },
  {
    name: "Cravagem",
    botanical: "Claviceps purpurea",
    meaning: "Mistério, metamorfose",
    element: "Terra",
    chakra: 7,
    properties: ["Transformação", "Transição", "Renovação"],
    folklore: "Utilizada em pequenos scop nas tradições nórdicas para estados modificações de consciência.",
  },
  {
    name: "Folhas de louro",
    botanical: "Laurus nobilis",
    meaning: "Glória, vitória",
    element: "Fogo",
    chakra: 5,
    properties: ["Proteção", "Sabedoria", "Força", "Sucesso"],
    folklore: "Guerreros romanos coronados com laureles após victorias. O oráculo de Delfos masticaba folhas de louro para profecia.",
  },
  {
    name: "Cebolinha francesa",
    botanical: "Allium fistulosum",
    meaning: "Persistência, discernimento",
    element: "Fogo",
    chakra: 3,
    properties: ["Discernimento", "Determinação", "Energia Yang"],
    folklore: "Usada em pequenos rituais de discernimento nas tradições populares.",
  },
  {
    name: "Cebola",
    botanical: "Allium cepa",
    meaning: "Percepção, introspecção",
    element: "Terra",
    chakra: 6,
    properties: ["Visão interior", "Introspecção", "Resistência", "Purificação"],
    folklore: "Na Índia, oferecida a Ganesha. Na antiga Roma, consumida para fortificar. Usada em rituais de proteção contra energias negativas.",
  },
  {
    name: "Loureiro-cerezo (grosa)",
    botanical: "Prunus laurocerasus",
    meaning: "Proteção, eternidade",
    element: "Água",
    chakra: 4,
    properties: ["Proteção", "Amor dedicado", "Força emocional"],
    folklore: "Associado a rituais de proteção nas tradiçãos do Cáucaso.",
  },
  {
    name: "Dente-de-leão",
    botanical: "Taraxacum officinale",
    meaning: "Esperança, renascimento",
    element: "Terra",
    chakra: 1,
    properties: ["Renovação", "Desejos", "Superação", "Luz na escuridão"],
    folklore: "Associado ao sol e à luz por suas flores douradas. Soprar as sementes era considerado um ritual para enviar pedidos ao universo.",
  },
];

export function getMeanings(plantName?: string): PlantMeaning[] {
  if (!plantName) return PLANT_MEANINGS;
  const normalized = plantName.toLowerCase().trim();
  return PLANT_MEANINGS.filter(
    (p) =>
      p.name.toLowerCase() === normalized ||
      p.botanical.toLowerCase().includes(normalized)
  );
}

export function getByElement(element: string): PlantMeaning[] {
  return PLANT_MEANINGS.filter(
    (p) => p.element.toLowerCase() === element.toLowerCase()
  );
}

export function getByChakra(chakra: number): PlantMeaning[] {
  return PLANT_MEANINGS.filter((p) => p.chakra === chakra);
}
