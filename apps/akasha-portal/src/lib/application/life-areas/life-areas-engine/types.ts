// ============================================================
// LIFE AREAS ENGINE - Type Definitions
// ============================================================
// Tipos centrais para o sistema de Áreas da Vida.
// Extraídos de life-areas-engine/index.ts para manter o arquivo
// principal focado nos dados.
// ============================================================

export type LifeAreaId =
  | 'proposito' // Propósito de vida / Missão
  | 'carreira' // Trabalho / Carreira / Vocação
  | 'financas' // Dinheiro / Recursos / Abundância
  | 'saude' // Saúde / Corpo / Vitalidade
  | 'relacionamentos' // Amor / Casamento / Parcerias
  | 'sexualidade' // Prazer / Intimidade / Libido
  | 'familia' // Família / Raízes / Ancestralidade
  | 'espiritualidade' // Conexão divina / Fé / Transcendência
  | 'criatividade' // Expressão / Arte / Criação
  | 'amizades' // Grupos / Comunidades / Rede social
  | 'conhecimento' // Estudos / Sabedoria / Filosofia
  | 'autoconhecimento'; // Interior / Sombras / Cura

export interface AstrologicalMapping {
  planets: string[]; // Planetas regentes
  houses: number[]; // Casas astrológicas
  signs: string[]; // Signos do zodíaco
  points: string[]; // Pontos especiais (Lilith, Nodos, etc)
  aspects: string[]; // Aspectos importantes
  keywords: string[]; // Palavras-chave
}

export interface NumerologyMapping {
  lifePath: number[]; // Caminhos de vida
  masterNumbers: number[]; // Números mestres
  personalYear: number[]; // Anos pessoais favoráveis
  expression: number[]; // Números de expressão
  keywords: string[];
}

export interface OduMapping {
  primaryOdus: string[]; // Odus principais
  favorableOdus: string[]; // Odus favoráveis
  avoidOdus: string[]; // Odus de atenção
  eboSuggestions: string[]; // Ebós sugeridos
  keywords: string[];
}

export interface OrixaMapping {
  primary: string[]; // Orixás regentes
  secondary: string[]; // Orixás auxiliares
  offerings: string[]; // Oferendas
  days: string[]; // Dias da semana
  elements: string[]; // Elementos
}

export interface ChakraMapping {
  primary: string[]; // Chakras principais
  balance: 'high' | 'medium' | 'low';
  color: string;
  mantra: string;
}

export interface ElementMapping {
  primary: string;
  secondary: string[];
  favorable: string[];
  avoid: string[];
}

export interface LifeArea {
  id: LifeAreaId;
  name: string; // Nome em PT
  nameEnglish: string;
  description: string;
  emoji: string;
  color: string; // Cor primária
  gradient: string; // Gradiente
  icon: string; // Nome do ícone Lucide
  astrology: AstrologicalMapping;
  numerology: NumerologyMapping;
  odu: OduMapping;
  orixa: OrixaMapping;
  chakra: ChakraMapping;
  element: ElementMapping;
  questions: string[]; // Perguntas para auto-reflexão
  practices: string[]; // Práticas recomendadas
  challenges: string[]; // Desafios/cuidados
  crystals: string[]; // Cristais
  affirmations: string[]; // Afirmações
}
