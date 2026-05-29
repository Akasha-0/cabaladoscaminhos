// @ts-nocheck
// SKIP_LINT

/**
 * Ritual Data Module
 * Spiritual data for rituals, sacred practices, and ceremonial traditions of Ifá
 */

export interface RitualStep {
  order: number;
  action: string;
  duration?: string;
  offerings?: string[];
  chants?: string[];
  intention?: string;
}

export interface RitualElement {
  name: string;
  meaning: string;
  placement: string;
}

export interface TimingInfo {
  phase: string;
  hours: string;
  significance: string;
}

export interface ContraIndication {
  type: string;
  description: string;
}

export interface RitualData {
  id: string;
  name: string;
  namePortuguese: string;
  category: string;
  purpose: string;
  orixa: string[];
  sacredObjects: string[];
  elements: RitualElement[];
  steps: RitualStep[];
  timing: TimingInfo;
  precautions: string[];
  contraindications: ContraIndication[];
  completionRitual: string;
  origin: string;
  energy: string;
  warnings: string[];
}

const RITUAL_DATA: RitualData[] = [
  {
    id: "itutura",
    name: "Itutura",
    namePortuguese: "Purificação Sagrada",
    category: "purificacao",
    purpose: "Purificação do corpo, mente e espírito antes de qualquer trabalho espiritual",
    orixa: ["Olodumare", "Obatala"],
    sacredObjects: ["água de sources", "flores brancas", "carvão", "sal grosso", "alecrim"],
    elements: [
      { name: "Água de sources", meaning: "Elemento purificador por excelência, conexão com os Ori", placement: "Centro do ritual" },
      { name: "Sal grosso", meaning: "Absorve energias negativas e limpa o campo vibracional", placement: "Dispersado em torno do espaço" },
      { name: "Alecrim", meaning: "Erva de purificação e proteção, eleva a consciência", placement: "Queimado como incenso" }
    ],
    steps: [
      { order: 1, action: "Preparar o espaço com carvão e alecrim", duration: "15 minutos", intention: "Criar barreira protetora" },
      { order: 2, action: "Dissolver sal grosso na água de sources", intention: "Potencializar efeito purificador" },
      { order: 3, action: "Aspersão do corpo da direita para esquerda", chants: ["Olofi O...", "Ori mi o..."], intention: "Limpeza energética pessoal" },
      { order: 4, action: "Mergulhar as mãos e visualizar luz branca", duration: "3 minutos", intention: "Sincronização mente-corpo-espírito" },
      { order: 5, action: "Banho de chuva ou aspersão manual", intention: "Libertação de blokês e energias densas" }
    ],
    timing: { phase: "Amanhecer ou entardecer", hours: "Entre 5h-7h ou 17h-19h", significance: "Momentos de transição dimensional" },
    precautions: ["Não deve ser realizado durante a lua cheia em dias de Ejo", "Evitar em períodos de doença declarada"],
    contraindications: [
      { type: "temporal", description: "Durante tempestades ou raios, a energia pode ser destabilizada" },
      { type: "espiritual", description: "Pessoas em processo de伊ба não devem realizar sem supervisão de babalawo" }
    ],
    completionRitual: "Oferecer obi ao chão e agradecer a Olodumare pela proteção recebida",
    origin: "Tradição Yoruba古老, ensinamentos de Oduduwa transmitidos através dos ages",
    energy: "purificadora",
    warnings: ["Manter intenção pura durante todo o processo", "Não interromper o ritual uma vez iniciado"]
  },
  {
    id: "ebo",
    name: "Ebo",
    namePortuguese: "Sacrifício Votivo",
    category: "sacrificio",
    purpose: "Oferecimento solene para aplacar ou solicitar a intervenção dos Orixás",
    orixa: ["Todos os Orixás conforme necessidade"],
    sacredObjects: ["alimentos específicos", "objetos simbólicos", "kola nuts", "dinheiro", "tecido"],
    elements: [
      { name: "Obi (noz de kola)", meaning: "Primeira oferenda, símbolo de vida e fraternidade", placement: "Ao centro do家电" },
      { name: "Amala", meaning: "Alimento de obrigação para Orixás específicos", placement: "Em pratos rituais" },
      { name: "Epo (óleo de dendê)", meaning: "Lubrificante espiritual, atrai prosperidade", placement: "Aplicado nos objetos" }
    ],
    steps: [
      { order: 1, action: "Identificar o Orixá destinatário através de divinação", intention: "Alinhamento com a vontade divina" },
      { order: 2, action: "Preparar os alimentos e objetos específicos", duration: "2-3 horas", intention: "Honra e reverência" },
      { order: 3, action: "Recitar osOdus correspondentes", chants: ["Ogbe Meji...", "Ogbona..."], intention: "Invocação cerimonial" },
      { order: 4, action: "Colocar a oferenda no Ile (santo) ou local sagrado", intention: "Entrega da oferenda" },
      { order: 5, action: "Partilhar comida com a comunidade presentes", intention: "Fortalecimento dos laços sociais" },
      { order: 6, action: "Enterrar ou jogar no mar os restos não consumidos", intention: "Devolução à natureza" }
    ],
    timing: { phase: "Conforme Odus", hours: "Manhã cedo para Orixás de Terra, noite para Orixás de Água", significance: "O tempo é determinado pela Consulta de Ifá" },
    precautions: ["Deve ser realizado por quem tem obrigação ou por sacerdote designado", "Respeitar_tabus alimentares específicos"],
    contraindications: [
      { type: "social", description: "Não realizar em luto público sem autorizaçãos dos ancianos" },
      { type: "karmico", description: "Promessas não cumpridas previamente invalidam o ritual" }
    ],
    completionRitual: "Ibadé - Saudação em círculo com cantos de agradecimento, passando a mão pelo rosto em sinal de bênção recebida",
    origin: "Pacto original entre os homens e os Orishas desde osprimórdios, segundo a tradição oral de Ilé-Ifè",
    energy: "sacrificial",
    warnings: ["Nunca fazer Ebo com intenção de prejudicar outrem", "As oferendas devem ser feitas com coração limpo"]
  },
  {
    id: "oriki",
    name: "Oriki",
    namePortuguese: "Saudação Cerimonial",
    category: "saudacao",
    purpose: "Homenagear os Orixás, ancestres e a própria Ori através de versos sagrados",
    orixa: ["Todos os Orixás"],
    sacredObjects: ["kola nuts", "água", " пальна листьев"],
    elements: [
      { name: "Versos recitados", meaning: "Poemas sagrados que contêm a história e atributos do ser saudado", placement: "Oração central" },
      { name: "Длань на голове", meaning: "Contato físico para canalizar energia durante a saudação", placement: "Sobre a coroa" }
    ],
    steps: [
      { order: 1, action: "Sentarse em posição de respeito ou ajoelhar", intention: "Humildade diante do divino" },
      { order: 2, action: "Recitar oOríkì próprio ou do Orixá", duration: "Variável", chants: ["Ori má lo...", "Ọlọ́run..."], intention: "Estabelecer conexão energética" },
      { order: 3, action: "Tocar a cabeça com as palmas", intention: "Sincronização da consciência" },
      { order: 4, action: "Repetir mantra pessoal", intention: "Afirmação da identidade espiritual" }
    ],
    timing: { phase: "Qualquer momento", hours: "Manhã ao acordar, noite antes de dormir", significance: "Mantém a chama espiritual acesa" },
    precautions: ["Cada família tem seus próprios Orikis, respeitar a tradição oral local"],
    contraindications: [
      { type: "pronunciacao", description: "Erros na pronúncia podem alterar a energia do mantra" }
    ],
    completionRitual: "Silêncio meditativo de 1 minuto absorvendo a energia invocada",
    origin: "Tradição oral Yoruba preservada por famílias e guilds de cantores desde tempos imemoriais",
    energy: "reverente",
    warnings: ["Não misturar Orikis de Orixás diferentes sem conhecimento", "O Oriki pessoal deve ser aprendido com um Babalawo"]
  },
  {
    id: "awure",
    name: "Awure",
    namePortuguese: "Proteção Espiritual",
    category: "protecao",
    purpose: "Criar escudo energético contra influências negativas e energias hostis",
    orixa: ["Eleggua", "Obatala", "Shango"],
    sacredObjects: ["eleke (contas)", "awo (marcadores)", "ewo (pós rituais)", "garrafas ritualísticas"],
    elements: [
      { name: "Eleke", meaning: "Colares de contas sagradas que funcionam como antenas energéticas", placement: "No corpo - pescoço, pulso, tornozelo" },
      { name: "Oogun", meaning: "Medicina ritual que combina folhas, raízes e elementos protectores", placement: "Em torno da residência" }
    ],
    steps: [
      { order: 1, action: "Preparar Oogun com folhas específicas conforme Odu", duration: "1 hora", intention: "Confecção da medicina protetora" },
      { order: 2, action: "RecitarOdus de proteção (Ogbe, Oyeku)", chants: ["E ji o...", "E ma ja..."], intention: "Carregar spiritualmente o preparado" },
      { order: 3, action: "Aplicar nos pontos de entrada da residência", intention: "Selar portaisdimensionais" },
      { order: 4, action: "Colocar Eleke ou preparar água ritual", intention: "Proteger o corpo" },
      { order: 5, action: "Kickedar (marcar) com ocucuy para selar", intention: "Fechar o círculo de proteção" }
    ],
    timing: { phase: "Fase da Lua", hours: "Varia conforme o Odu revelado", significance: "Determinado pela Consulta de Ifá" },
    precautions: ["Awure negativo (para causar mal) é considered feitiçaria e punishable pelos Orishas"],
    contraindications: [
      { type: "moral", description: "Intenções de prejudicar retornam triplicadas ao remetente" }
    ],
    completionRitual: "Colocar água de sources nos umbrais das portas e pedir a Eleggua para guardar todos os portais",
    origin: "Conhecimento secreto dos Babalawo, ensinado apenas a iniziandos dignos",
    energy: "protetora",
    warnings: ["Não compartilhar os componentes com pessoas não autorizadas", "Renovar a proteção conforme orientação de Ifá"]
  },
  {
    id: "iro",
    name: "Iro",
    namePortuguese: "Sorte e Boa Ventura",
    category: "fortuna",
    purpose: "Invocar boa sorte, abrir caminhos e atrair prosperidade material e espiritual",
    orixa: ["Orunmila", "Osain", "Olokun"],
    sacredObjects: ["Opon Ifa (tabuleiro)", "Ekun (noz de coco)", "Adimu (farinha de milho)", "Obi"],
    elements: [
      { name: "Ekun", meaning: "Noz de coco sagrada usada para confirmar или negar mensagens dos Odus", placement: "No tabuleiro de Ifá" },
      { name: "Ikin", meaning: "Nozes de dendezei que caenforman los Odus", placement: "Mão do Babalawo durante Consulta" }
    ],
    steps: [
      { order: 1, action: "Preparar o tabuleiro e os Ikin", intention: "Limpeza ritual do espaço divinatório" },
      { order: 2, action: "Recitar a oração de abertura da Consulta", duration: "15 minutos", chants: ["Orunmila ma sun...", "A 格reator of future..."], intention: "Estabelecer conexão com o Deus da Divinação" },
      { order: 3, action: "Lançar os Ikin e interpretar os padrões", intention: "Decodificar a mensaje divine" },
      { order: 4, action: "OferecerObi ao Odu revelado", intention: "Reconhecimento da autoridade do Odu" },
      { order: 5, action: "Receber orientação e fazer perguntas específicas", intention: "Clareza sobre o caminho a seguir" },
      { order: 6, action: "Registrar o Odu em caderno sagrado (Awon Odu Meji)", intention: "Preservação da memória espiritual" }
    ],
    timing: { phase: "Dias específicos", hours: "Dia 4, 8, 12, 16, 20, 24 do ciclo lunar", significance: "Dias conectados à sabiduria de Orunmila" },
    precautions: ["Não consultar Ifá em dias proibidos pelo próprio Odu", "Jejum pode ser requerido antes da Consulta"],
    contraindications: [
      { type: "desacato", description: "Questionar a autoridade do Babalawo ou duvidar公开amente do Odu" },
      { type: "timing", description: "Consultas feitas em estado de embriagues invalidam a mensagem" }
    ],
    completionRitual: "Agradecer Orunmila com palavras de gratidão e prometer cumprir as orientações",
    origin: "ciencia sagrada de Ifá, revelado por Orunmila aos primeiros Babalawo em Ilé-Ifè",
    energy: "reveladora",
    warnings: ["O Odu é lei - suas orientações devem ser seguidas com fé", "Mentir ao Babalawo sobre circunstâncias pollui a leitura"]
  },
  {
    id: "kekere",
    name: "Kekere",
    namePortuguese: "Ritual de Infância Espiritual",
    category: "iniciacao",
    purpose: "Celebrar e proteger crianças, fortalecendo sua conexão com o Orun e orientando seus passos",
    orixa: ["Yemoja", "Obatala", "Orunmila"],
    sacredObjects: ["brinquedos rituais", "agua de sources", "farinha", "kola nuts", "tecido branco"],
    elements: [
      { name: "Brinquedos", meaning: "Simbolizam a alegria da infância e convidam Osan to bless the child", placement: "Ao redor da criança" },
      { name: "Etagi", meaning: "Conjunto de tecidos coloridos representing as muitas possibilidades do futuro", placement: "Roupa da criança" }
    ],
    steps: [
      { order: 1, action: "Preparar espaço sagrado com tecidos brancos no chão", intention: "Criar berço espiritual" },
      { order: 2, action: "Lavar a criança com água de sources e ervas", intention: "Purificação e proteção" },
      { order: 3, action: "Colocar pequeno Colar de contasProtectoras", intention: "Ativar escudo espiritual" },
      { order: 4, action: "Recitar Orikis especiais para crianças", duration: "10 minutos", chants: ["Omo ti o de...", "Ologo tayoo..."], intention: "Invocar bênçãos celestiais" },
      { order: 5, action: "Dar presentes e doces como oferenda aos Orixás", intention: "Celebrar a vida recebida" },
      { order: 6, action: "Abraçar a criança e transmitr energia positiva", intention: "Estabelecer vínculo protetor" }
    ],
    timing: { phase: "Primeiros anos de vida", hours: "Manhã cedo para receber as bênçãos do sol", significance: "Período fundamental para o desenvolvimento espiritual" },
    precautions: ["Respeitar a fase lunar adequada conforme orientação de Ifá"],
    contraindications: [
      { type: "energetico", description: "Bebês prematuros ou em situação de saúde frágil requerem cuidados especiais" }
    ],
    completionRitual: "Pai e mãe fazem orações pessoais pedindo orientação divina para criar o filho",
    origin: "Tradición de proteção da infância enseñada por Yemoja, mãe de todos os niños",
    energy: "nutridora",
    warnings: ["Não forçar crianças a participar de rituais intensos", "Observar sinais de desconforto e respeitar limites"]
  },
  {
    id: "ire",
    name: "Ire",
    namePortuguese: "Busca da Boa Sorte",
    category: "fortuna",
    purpose: "Atrair boa sorte, prosperidade, saúde e harmonia nas diversas dimensões da vida",
    orixa: ["Olokun", "Orunmila", "Oxum"],
    sacredObjects: ["dinheiro", "ouro", "frutas", "flores", "perfume", "espelhos"],
    elements: [
      { name: "Espelho", meaning: "Simboliza a capacidade de ver além do véu, refletir verdades ocultas", placement: "Centro do ritual de busca" },
      { name: "Orogun", meaning: "Cosmético sagrado que atrai prosperidade sexual e abundância", placement: "Aplicado nos pulsos e pescoço" }
    ],
    steps: [
      { order: 1, action: "Preparar local com espelho e alimentos representing prosperidade", intention: "Estabelecer receptáculo para o Ire" },
      { order: 2, action: "Recitar Odus de boa sorte (Oxexi, Ejila)", duration: "20 minutos", chants: ["Ire o...", "Ogo le..."], intention: "Pedir aos céus que abram as portas da abundância" },
      { order: 3, action: "Colocar ouro e dinheiro no espelho", intention: "Simbolizar e atraír prosperidade material" },
      { order: 4, action: "Despejar perfume sobre os objetos", intention: "Tornar o ambiente irresistível para a boa sorte" },
      { order: 5, action: "Visualizar intensely a realidade desejada", intention: "Alinhar pensamento com a manifestação" },
      { order: 6, action: "Guardar alguns objetos na carteira ou bolsa", intention: "Carregar a energia consigo" }
    ],
    timing: { phase: "Lua crescente", hours: "Manhã ou tarde, evitando noite", significance: "Energia de crescimento e expansão" },
    precautions: ["Não realizar quando já existe prosperidade abundante - pode generar excesso nocivo"],
    contraindications: [
      { type: "excesso", description: "Pessoas já abundantemente favorecidas devem buscar apenas manutenção" }
    ],
    completionRitual: "Agradecer em voz alta pela prosperidade que está chegando, como se já tivesse llegado",
    origin: "Ensinamentos de Olokun sobre a arte de attract abundance, transmitidos por babalawo antiguos",
    energy: "prosperadora",
    warnings: ["Não pedir prosperidade derived from daño a outros", "Gratidão antecipada abre mais os canais da abundância"]
  },
  {
    id: "osi",
    name: "Osi",
    namePortuguese: "Proteção Contra Inveja",
    category: "protecao",
    purpose: "Neutralizar olhares invejosos, fofocas e energia negativa direcionada por terceiros",
    orixa: ["Eleggua", "Ogun", "Shango"],
    sacredObjects: ["pedraspretas", "alecrim", "velaspretas", "sal", "carbón"],
    elements: [
      { name: "Vela negra", meaning: "Absorve e transforma energias negativas em luz", placement: "No centro do espaço ritual" },
      { name: "Sal", meaning: "Cria barreira invisible contra envidia", placement: "Formando círculo ao redor da pessoa" }
    ],
    steps: [
      { order: 1, action: "Acender vela negra e visualizar chama escura e protetora", intention: "Criar escudo de transformação" },
      { order: 2, action: "Misturar sal com alcool e alfazema", intention: "Preparar spray de proteção" },
      { order: 3, action: "RecitarOdus contra mal de ojo (Ogberi)", duration: "15 minutos", chants: ["E jo jo...", "Ofoifo tayoo..."], intention: "Dissolver intentos de daño" },
      { order: 4, action: "Aspersar solução ao redor do corpo", intention: "Criar barreira energetica pessoal" },
      { order: 5, action: "Picar pequeño espejo y mezclar com sal y pimienta", intention: "Devolver negativity ao remetente" },
      { order: 6, action: "Largar mistura em lugar onde enemigo possa pasar sin saber", intention: "Neutralizar fonte de energia negativa" }
    ],
    timing: { phase: "Noite de lua nueva", hours: "23h-1h", significance: "Momento de maximum oscuridad, ideal para proteção" },
    precautions: ["Não usar com intenção de dañar - isso crea karma negativo"],
    contraindications: [
      { type: "moral", description: "O intento de dañar a outros genera consecuencias inevitables" }
    ],
    completionRitual: "Pedir a Eleggua que abra los caminos y cierre las bocas de los enemigos",
    origin: "Conhecimento iniciático dos Babalawo, ensinarado apenas a quienes demuestran responsabilidad",
    energy: "defensiva",
    warnings: ["Usar apenas para protección, jamas para ataque", "Sempre buscar resolver conflictos de forma pacífica primero"]
  },
  {
    id: "afoseun",
    name: "Afoséun",
    namePortuguese: "Lançamento de Princípios",
    category: "iniciacao",
    purpose: "Estabelecer princípios sagrados, criar ordem e harmonia em espaços e situações",
    orixa: ["Obatala", "Oludumare"],
    sacredObjects: ["karah", "tecidos blancos", "coco seco", "farinha de цветастое"],
    elements: [
      { name: "Karah (concha)", meaning: "Instrumento de mesure et de distribución sagrada", placement: "Mão do officiante" },
      { name: "Ekun (coco)", meaning: "Usado para confirmar ou negar a validade do lançamento", placement: "Sobre o espaço consagrado" }
    ],
    steps: [
      { order: 1, action: "Purificar espaço com agua y sal", intention: "Limpiar el terreno dimensional" },
      { order: 2, action: "Colocar tecidos blancos no chãoforming patrón geométrico", intention: "Criar площадь sagrada" },
      { order: 3, action: "Recitar oración de abertura a Oludumare", duration: "10 minutos", chants: ["Olodumare oo...", "Ayo ti o se..."], intention: "Pedir licença para establecer ordem" },
      { order: 4, action: "Usar karah para dispersar farinha en patrones sagrados", intention: "Definir límites y espacios" },
      { order: 5, action: "Lanzar ekun (coco) para confirmar lanzamiento", intention: "Validación celestial del proceso" },
      { order: 6, action: "Sellar puntos cardinals con objetos rituales", intention: "Completar la estructura energética" }
    ],
    timing: { phase: "Qualquer momento, preferindo dias de estabilidad", hours: "Manhã ou tarde, evitandotransiciones", significance: "Quando se necesita ordem establecyer" },
    precautions: ["No debe realizarse en espacios contaminados sin previa limpieza"],
    contraindications: [
      { type: "espacial", description: "Terrenos onde houve morte violenta requieren rituals especiales previos" }
    ],
    completionRitual: "Pedir a Obatalá que族长 sobre todo lo creado y garantice estabilidad por generations",
    origin: "Tradição de Oduduwa ao fundar Ilé-Ifè, establecimiento do primeiro espaço sagrado",
    energy: "ordenadora",
    warnings: ["No improvisar - este ritual requiere conocimiento profundo de символов"]
  },
  {
    id: "itutu",
    name: "Itutu",
    namePortuguese: "Consagração de Objetos",
    category: "sacramento",
    purpose: "Sacarização e energização de objetos para uso espiritual ou medicinal",
    orixa: ["Orunmila", "Osain", "Todos os Orixás"],
    sacredObjects: ["objeto a consagrar", "alecrim", "ewo", "oin", "karah"],
    elements: [
      { name: "Oin (graxa)", meaning: "Elemento que fixa y сохраняет la energía espiritual en el objeto", placement: "Aplicada no objeto" },
      { name: "Ewo (pó ritual)", meaning: "Mezcla de elementos que передает энергию específica al objeto", placement: "Envoltório do objeto" }
    ],
    steps: [
      { order: 1, action: "Identificar propósito do objeto e seleccionar elementos correspondientes", intention: "Alineamiento energético" },
      { order: 2, action: "Limpiar objeto com agua y sal", duration: "1 hora", intention: "Remover energias previas" },
      { order: 3, action: "RecitarOdus appropriados al propósito", chants: ["Osain oo...", "Orunmila ma..."], intention: "Invocar fuerza transformadora" },
      { order: 4, action: "Aplicar oin y ewo en el objeto mientras recita", intention: "Transferir energía" },
      { order: 5, action: "Exponer objeto a luz lunar ou solar según el propósito", intention: "Cargar con energía cósmica" },
      { order: 6, action: "Guardar em lugar sagrado por 7 dias antes de usar", intention: "Estabilización de la energía" }
    ],
    timing: { phase: "Según propósito", hours: "Luz solar para objetosativos, lunar para objetos de sabedoria", significance: "Determinado pela natureza do objeto e intención" },
    precautions: ["No consagrar objetos para dañar - retorna al usuario"],
    contraindications: [
      { type: "intencion", description: "Objetos consagrados con mala intención se vuelven contra el usuario" }
    ],
    completionRitual: "Pedir al Orixá appropriate que bendiga el objeto y le dê propósito específico",
    origin: "Conocimiento de Osain, maestro de ervas y secretos de la naturaleza, ensinado a inicia2",
    energy: "transformadora",
    warnings: ["Respetar el tabú de cada objeto - algunos no pueden ser tocados por certos personas"]
  },
  {
    id: "iwure",
    name: "Iwure",
    namePortuguese: "Ritual de Reconciliação",
    category: "harmonia",
    purpose: "Restaurar relaciones rotas, curar feridas emocionales y reunificar famílias",
    orixa: ["Obatala", "Yemoja", "Orunmila"],
    sacredObjects: ["kola nuts", "agua", "flores blancas", "dinero pequeno", "tecido"],
    elements: [
      { name: "Kola nuts", meaning: "Símbolo de vida compartida y deseo de reconciliación", placement: "Entre as partes" },
      { name: "Agua", meaning: "Elemento purificador que lava rencores y permite новый beginnings", placement: "Compartilhado entre as partes" }
    ],
    steps: [
      { order: 1, action: "Reunir as partes em espacio neutral y sagrado", intention: "Disposición para receber" },
      { order: 2, action: "Purificar el espacio y a las personas com agua y sal", duration: "15 minutos", intention: "Limpiar campo de conflito" },
      { order: 3, action: "Recitar oración de reconciliation (Owonrin meji)", chants: ["E wa jo...", "Aje wa..."], intention: "Invocar energía de unificación" },
      { order: 4, action: "Compartir kola nuts entre todos", intention: "Simbólico de nueva vida compartida" },
      { order: 5, action: "Cada parte expresa sus heridas y pide perdón", intention: "Limpieza emocional" },
      { order: 6, action: "Abrazo colectivo y誓言 de nueva relación", intention: "Sellado del acordo" }
    ],
    timing: { phase: "Luna nueva o llena", hours: "Cualquier momento del día", significance: "Nuevos comienzos o culmination de ciclos" },
    precautions: ["No debe haber presión ni coerción - la reconciliación debe ser genuina"],
    contraindications: [
      { type: "trauma", description: "Casos de violencia requieren trabajo terapéutico previo al ritual" }
    ],
    completionRitual: "Ofrecer oraciones a Yemoja pidiendo que ла dado example de amor incondicional en reconciliación",
    origin: "Ensinamento de Obatalá sobre el poder del perdón, ensinado a quienes buscan armonía",
    energy: "curadora",
    warnings: ["No forzar reconciliación - cada pessoa deve estar pronta", "Rencores guardados invalidan el proceso"]
  }
];

export function getData(): RitualData[] {
  return RITUAL_DATA;
}

export function getDataById(id: string): RitualData | undefined {
  return RITUAL_DATA.find((r) => r.id === id);
}

export function searchData(query: string): RitualData[] {
  const lowercaseQuery = query.toLowerCase();
  return RITUAL_DATA.filter(
    (r) =>
      r.name.toLowerCase().includes(lowercaseQuery) ||
      r.namePortuguese.toLowerCase().includes(lowercaseQuery) ||
      r.purpose.toLowerCase().includes(lowercaseQuery) ||
      r.category.toLowerCase().includes(lowercaseQuery) ||
      r.orixa.some((o) => o.toLowerCase().includes(lowercaseQuery))
  );
}

export function getRitualsByCategory(category: string): RitualData[] {
  return RITUAL_DATA.filter((r) => r.category === category);
}

export function getRitualsByOrixa(orixa: string): RitualData[] {
  return RITUAL_DATA.filter((r) => r.orixa.includes(orixa));
}

export function getRitualsByEnergy(energy: string): RitualData[] {
  return RITUAL_DATA.filter((r) => r.energy.toLowerCase() === energy.toLowerCase());
}

export function getRitualCategories(): string[] {
  const categories = new Set(RITUAL_DATA.map((r) => r.category));
  return Array.from(categories).sort();
}

export function getRitualByPurpose(purpose: string): RitualData[] {
  const lowercasePurpose = purpose.toLowerCase();
  return RITUAL_DATA.filter(
    (r) =>
      r.purpose.toLowerCase().includes(lowercasePurpose) ||
      r.warnings.some((w) => w.toLowerCase().includes(lowercasePurpose))
  );
}