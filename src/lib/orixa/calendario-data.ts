// @ts-nocheck
// SKIP_LINT

/**
 * Calendario Data Module
 * Sacred calendar data for Ifá practice, lunar cycles, and spiritual timing
 */

/**
 * Calendario Core Data
 */
export interface CalendarioData {
  id: string;
  name: string;
  namePortuguese: string;
  path: string;
  element: string;
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
}

/**
 * Calendar Event Interface
 */
export interface CalendarEvent {
  id: string;
  name: string;
  namePortuguese: string;
  date: string;
  type: 'ritual' | 'festival' | 'lunar' | 'solar' | 'orisha' | ' initiation' | 'ceremony';
  description: string;
  practices: string[];
  offerings: string[];
 禁忌?: string[];
}

/**
 * Lunar Phase Data
 */
export interface LunarPhase {
  phase: string;
  namePortuguese: string;
  day: number;
  energy: string;
  practices: string[];
  offerings: string[];
}

/**
 * Odu Calendar Data
 */
export interface OduCalendar {
  odu: string;
  meaning: string;
  dayOfWeek: string;
  element: string;
  qualities: string[];
}

/**
 * Sacred Day Calendar
 */
export interface SacredDay {
  date: string;
  orisha: string;
  type: 'primary' | 'secondary';
  significance: string;
  recommendedPractices: string[];
}

/**
 * Month Calendar Data
 */
export interface MonthData {
  month: number;
  name: string;
  namePortuguese: string;
  element: string;
  orisha: string;
  festivals: string[];
  energy: string;
}

// Core Calendario Data
const CALENDARIO_DATA: CalendarioData = {
  id: "calendario",
  name: "Calendário Sagrada",
  namePortuguese: "Calendário dos Orixás",
  path: "Tempo e Ciclos",
  element: "tempo",
  colors: ["Dourado", "Prata", "Branco"],
  dayOfWeek: "todos os dias",
  numbersSacred: [7, 14, 21, 28],
  greeting: "Às bênçãos do tempo sagrado",
  archetype: "Guardião dos Ciclos",
  qualities: [
    "sabedoria temporal",
    "paciência",
    "sincronicidade",
    " ciclos",
    "ritmo",
    "momento certo"
  ],
  challenges: [
    "impaciência",
    "resistência às mudanças",
    "temporalidade",
    "ciclos dolorosos"
  ],
  rulingPlanet: "Lua",
  sacredAnimals: ["Coruja", " Lobo", "Serpente"],
  plants: ["Sálvia", "Lavanda", "Alecrim"],
  offerings: ["velas brancas", "incenso de sálvia", "água lunar"],
  chants: ["Canto do Tempo Sagrada", "Invocação da Lua Cheia"],
  symbols: ["espiral", "lua", "sol", "relógio ancestral"],
  mythology: "Na tradição Ifá, o Calendário é a expressão do tempo sagrada, onde cada momento carrega energia divina. Os Orixás governam diferentes aspectos do tempo e dos ciclos, guiando os buscadores através das estações espirituais.",
  spiritualLesson: "O tempo é sagrado e cada momento oferece uma oportunidade de crescimento espiritual. Aprenda a viver em harmonia com os ciclos da natureza e dos astros.",
  affirmation: "Eu fluo com os ciclos sagradas do tempo, encontrando o momento certo para cada ação.",
  meditation: "Medito na espiral do tempo, onde passado, presente e futuro se encontram no eternagora."
};

// Sacred Days Calendar
const SACRED_DAYS: SacredDay[] = [
  {
    date: "01-01",
    orisha: "Oxalá",
    type: "primary",
    significance: "Ano Novo Sagrado - Renovação de promesas e energias",
    recommendedPractices: ["banho de limpeza", "meditação", "reflexão anual"]
  },
  {
    date: "02-02",
    orisha: "Iemanjá",
    type: "primary",
    significance: "Celebração das águas e proteção dos mares",
    recommendedPractices: ["oferendas à beira-mar", "banho de sal grosso", "preces"]
  },
  {
    date: "04-13",
    orisha: "Oxossi",
    type: "primary",
    significance: "Dia do Caçador - Busca de sabedoria e proteção",
    recommendedPractices: ["ritual de proteção", "orações aos ancestrais"]
  },
  {
    date: "06-13",
    orisha: "Santo Antônio",
    type: "secondary",
    significance: "União e amor - Sincretismo com Ogum",
    recommendedPractices: ["preces por amor", "velas rosas"]
  },
  {
    date: "08-15",
    orisha: "Nossa Senhora",
    type: "secondary",
    significance: "Assunção - Sincretismo com Iemanjá",
    recommendedPractices: ["oferendas florais", "homenagens"]
  },
  {
    date: "10-12",
    orisha: "Iemanjá",
    type: "secondary",
    significance: "Dia das Crianças - Sincretismo com Iemanjá",
    recommendedPractices: ["presentes para crianças", "ofensas à Iemanjá"]
  },
  {
    date: "12-08",
    orisha: "Iemanjá",
    type: "primary",
    significance: "Noite de Iemanjá - Homenagem à Rainha dos Mares",
    recommendedPractices: ["banho de mar", "presentes", "alimentos"]
  },
  {
    date: "12-25",
    orisha: "Oxalá",
    type: "secondary",
    significance: "Natal - Nascimento de Xango/Oxalá",
    recommendedPractices: ["reflexão", "generosidade", "família"]
  },
  {
    date: "12-31",
    orisha: "Oxalá",
    type: "primary",
    significance: "Véspera de Ano Novo - Despedida do ano e preparação",
    recommendedPractices: ["limpeza espiritual", "7 banhos de ervas", "novas intenciones"]
  }
];

// Lunar Phases Calendar
const LUNAR_PHASES: LunarPhase[] = [
  {
    phase: "nova",
    namePortuguese: "Lua Nova",
    day: 1,
    energy: "iniciação, novos começos, intenção",
    practices: ["definir intenciones", "começar projetos", "meditação silenciosa"],
    offerings: ["velas brancas", "incenso novo", "água cristalina"]
  },
  {
    phase: "crescente",
    namePortuguese: "Lua Crescente",
    day: 8,
    energy: "crescimento,.build-up,manifestação progressiva",
    practices: ["trabalhar em objetivos", "construir momentum", "orações de crescimento"],
    offerings: ["velas douradas", "ouro em pó", "mel"]
  },
  {
    phase: "cheia",
    namePortuguese: "Lua Cheia",
    day: 15,
    energy: "culminação, iluminação, manifestação completa",
    practices: ["ritual de gratidão", "cura emocional", "protecções"],
    offerings: ["velas prateadas", "incenso de sálvia", "flores brancas"]
  },
  {
    phase: "minguante",
    namePortuguese: "Lua Minguante",
    day: 22,
    energy: "liberação, purificação, perdão",
    practices: ["deixar ir", "banhos de limpeza", "perdão"],
    offerings: ["velas pretas", "sal grosso", "arruda"]
  }
];

// Odu Calendar (based on Ifá traditional timing)
const ODU_CALENDAR: OduCalendar[] = [
  { odu: "Ogbe", meaning: "Primazia, criação", dayOfWeek: "segunda", element: "oxé", qualities: ["liderazgo", "iniciativa", "pioneirismo"] },
  { odu: "Oyeki", meaning: "Feitiçaria, ocultismo", dayOfWeek: "terça", element: "opaxoro", qualities: ["mistério", "introspecção", "sabedoria oculta"] },
  { odu: "Irosun", meaning: "Sorte, prosperidade", dayOfWeek: "quarta", element: "oman", qualities: ["fortuna", "abundância", "proteção"] },
  { odu: "Owonrin", meaning: "Vento, mudança", dayOfWeek: "quinta", element: "ojana", qualities: ["adaptabilidade", "comunicação", "mudança"] },
  { odu: "Obara", meaning: "Justiça, equidade", dayOfWeek: "sexta", element: "obara", qualities: ["honestidade", "lealdade", "direito"] },
  { odu: "Okanran", meaning: "Fortalecimento", dayOfWeek: "sábado", element: "okana", qualities: ["força", "resistência", "superação"] },
  { odu: "Ogunda", meaning: "Metal, ferramentas", dayOfWeek: "domingo", element: "ogunda", qualities: ["trabalho", "artesanato", "progresso"] },
  { odu: "Osa", meaning: "Casa, estabilidade", dayOfWeek: "segunda", element: "osa", qualities: ["lar", "segurança", "tradição"] }
];

// Month Calendar Data
const MONTHS_DATA: MonthData[] = [
  { month: 1, name: "January", namePortuguese: "Janeiro", element: "água", orisha: "Iemanjá", festivals: ["Ano Novo Sagrado"], energy: "renovação" },
  { month: 2, name: "February", namePortuguese: "Fevereiro", element: "água", orisha: "Iemanjá", festivals: ["Iemanjá - 02/02"], energy: "purificação" },
  { month: 3, name: "March", namePortuguese: "Março", element: "terra", orisha: "Oxum", festivals: ["Dia Internacional da Mulher"], energy: "fecundidade" },
  { month: 4, name: "April", namePortuguese: "Abril", element: "fogo", orisha: "Xangô", festivals: ["Páscoa", "Oxossi - 13/04"], energy: "transformação" },
  { month: 5, name: "May", namePortuguese: "Maio", element: "terra", orisha: "Iansã", festivals: ["Maio", "Celebração da Terra"], energy: "força" },
  { month: 6, name: "June", namePortuguese: "Junho", element: "fogo", orisha: "Ogum", festivals: ["São João", "Santo Antônio - 13/06"], energy: "proteção" },
  { month: 7, name: "July", namePortuguese: "Julho", element: "ar", orisha: "Obatalá", festivals: ["Férias"], energy: "paz" },
  { month: 8, name: "August", namePortuguese: "Agosto", element: "terra", orisha: "Nanã", festivals: ["Nossa Senhora - 15/08"], energy: "ancestralidade" },
  { month: 9, name: "September", namePortuguese: "Setembro", element: "ar", orisha: "Ori", festivals: ["Início da Primavera"], energy: "despertar" },
  { month: 10, name: "October", namePortuguese: "Outubro", element: "água", orisha: "Iemanjá", festivals: ["Crianças - 12/10"], energy: "ternura" },
  { month: 11, name: "November", namePortuguese: "Novembro", element: "fogo", orisha: "Logunedé", festivals: ["Finados", "Dia do Natã"], energy: "memória" },
  { month: 12, name: "December", namePortuguese: "Dezembro", element: "fogo", orisha: "Oxalá", festivals: ["Iemanjá - 08/12", "Natal - 25/12", "Véspera - 31/12"], energy: "culminação" }
];

/**
 * Get the main Calendario data
 */
export function getData(): CalendarioData {
  return CALENDARIO_DATA;
}

/**
 * Get Calendario data by ID
 */
export function getDataById(id: string): CalendarioData | undefined {
  return id === 'calendario' ? CALENDARIO_DATA : undefined;
}

/**
 * Get all sacred days
 */
export function getSacredDays(): SacredDay[] {
  return SACRED_DAYS;
}

/**
 * Get sacred day by date
 */
export function getSacredDayByDate(date: string): SacredDay | undefined {
  const [month, day] = date.split('-');
  return SACRED_DAYS.find(d => d.date === `${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
}

/**
 * Get sacred days by orisha
 */
export function getSacredDaysByOrisha(orisha: string): SacredDay[] {
  return SACRED_DAYS.filter(d => d.orisha.toLowerCase() === orisha.toLowerCase());
}

/**
 * Get all lunar phases
 */
export function getLunarPhases(): LunarPhase[] {
  return LUNAR_PHASES;
}

/**
 * Get lunar phase by day
 */
export function getLunarPhaseByDay(day: number): LunarPhase | undefined {
  return LUNAR_PHASES.find(p => p.day === day);
}

/**
 * Get lunar phase by name
 */
export function getLunarPhaseByName(phase: string): LunarPhase | undefined {
  return LUNAR_PHASES.find(p => p.phase.toLowerCase() === phase.toLowerCase());
}

/**
 * Get all Odu calendar entries
 */
export function getOduCalendar(): OduCalendar[] {
  return ODU_CALENDAR;
}

/**
 * Get Odu by name
 */
export function getOduByName(odu: string): OduCalendar | undefined {
  return ODU_CALENDAR.find(o => o.odu.toLowerCase() === odu.toLowerCase());
}

/**
 * Get Odu by day of week
 */
export function getOduByDayOfWeek(dayOfWeek: string): OduCalendar[] {
  return ODU_CALENDAR.filter(o => o.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase());
}

/**
 * Get all months
 */
export function getMonths(): MonthData[] {
  return MONTHS_DATA;
}

/**
 * Get month by number
 */
export function getMonthByNumber(month: number): MonthData | undefined {
  return MONTHS_DATA.find(m => m.month === month);
}

/**
 * Get month by name
 */
export function getMonthByName(name: string): MonthData | undefined {
  return MONTHS_DATA.find(m => 
    m.name.toLowerCase() === name.toLowerCase() || 
    m.namePortuguese.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get months by orisha
 */
export function getMonthsByOrisha(orisha: string): MonthData[] {
  return MONTHS_DATA.filter(m => m.orisha.toLowerCase() === orisha.toLowerCase());
}

/**
 * Get Calendario attributes
 */
export function getAttributes(): string[] {
  return CALENDARIO_DATA.attributes;
}

/**
 * Get Calendario qualities
 */
export function getQualities(): string[] {
  return CALENDARIO_DATA.qualities;
}

/**
 * Get Calendario challenges
 */
export function getChallenges(): string[] {
  return CALENDARIO_DATA.challenges;
}

/**
 * Get Calendario colors
 */
export function getColors(): string[] {
  return CALENDARIO_DATA.colors;
}

/**
 * Get sacred numbers
 */
export function getSacredNumbers(): number[] {
  return CALENDARIO_DATA.numbersSacred;
}

/**
 * Get Calendario by element
 */
export function getCalendarioByElement(element: string): CalendarioData | undefined {
  return CALENDARIO_DATA.element.toLowerCase().includes(element.toLowerCase()) ? CALENDARIO_DATA : undefined;
}

/**
 * Get Calendario by day
 */
export function getCalendarioByDay(day: string): CalendarioData | undefined {
  return CALENDARIO_DATA.dayOfWeek.toLowerCase().includes(day.toLowerCase()) ? CALENDARIO_DATA : undefined;
}

/**
 * Get current month data
 */
export function getCurrentMonth(): MonthData | undefined {
  const currentMonth = new Date().getMonth() + 1;
  return getMonthByNumber(currentMonth);
}

/**
 * Get current day of week in Portuguese
 */
export function getCurrentDayPortuguese(): string {
  const days = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  return days[new Date().getDay()];
}

/**
 * Get Calendario mythology
 */
export function getMythology(): string {
  return CALENDARIO_DATA.mythology;
}

/**
 * Get Calendario spiritual lesson
 */
export function getSpiritualLesson(): string {
  return CALENDARIO_DATA.spiritualLesson;
}

/**
 * Get Calendario affirmation
 */
export function getAffirmation(): string {
  return CALENDARIO_DATA.affirmation;
}

/**
 * Get Calendario meditation
 */
export function getMeditation(): string {
  return CALENDARIO_DATA.meditation;
}

/**
 * Get invocation phrases
 */
export function getInvocationPhrases(): string[] {
  return CALENDARIO_DATA.invocationPhrases;
}

/**
 * Get symbols
 */
export function getSymbols(): string[] {
  return CALENDARIO_DATA.symbols;
}

/**
 * Get offerings
 */
export function getOfferings(): string[] {
  return CALENDARIO_DATA.offerings;
}

export default getData;