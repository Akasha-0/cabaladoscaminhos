/* prettier-ignore */
// @ts-nocheck
// SKIP_LINT

/**
 * Sorte Data Module
 * Spiritual data for Sorte, the orixá of fortune, chance, and destiny paths
 */

export interface HerbData {
  id: string;
  name: string;
  orixa: string;
  element: string;
  usedIn: string[];
}

export interface RitualData {
  name: string;
  description: string;
  frequency: string;
  offerings: string[];
}

export interface SorteData {
  id: string;
  nome: string;
  misterio: string;
  elementos: string[];
  caminho: number;
  idade: number;
  qualidade: string;
  defeito: string;
  cor: string;
  saudacao: string;
  dia: string;
  numero: number;
  pedra: string;
  metal: string;
  ferramentas: string[];
  ebos: string[];
  banhos: string[];
  pontos: string[];
  hierbas: HerbData[];
  rituales: RitualData[];
  historia: string;
  caminhoes: string[];
  conselhos: string[];
  perigo: string[];
  forca: string[];
}

const SORTE_DATA: SorteData = {
  id: 'sorte',
  nome: 'Sorte',
  misterio: 'Fortuna e Destino',
  elementos: ['Ar', 'Fogo'],
  caminho: 5,
  idade: 7,
  qualidade: 'felicidade',
  defeito: 'inveja',
  cor: '#DAA520',
  saudacao: 'Oluorum!',
  dia: 'Segunda-feira',
  numero: 5,
  pedra: 'Ágata',
  metal: 'Ouro',
  ferramentas: ['Jogo de búzios', 'Ervas sagradas', 'Velas douradas'],
  ebos: ['Ebo de Oxum', 'Oferenda de mel', 'Vela dourada'],
  banhos: ['Banho de água de flor', 'Infusão de manjericão'],
  pontos: ['Oxum', 'Logun Edé'],
  hierbas: [
    { id: 'manjericao', name: 'Manjericão', orixa: 'Oxum', element: 'Ar', usedIn: ['banho-de-limpeza', 'ebos-de-prosperidade'] },
    { id: 'alecrim', name: 'Alecrim', orixa: 'Oxum', element: 'Fogo', usedIn: ['ritual-de-protecao', 'ebos-de-sorte'] },
  ],
  rituales: [
    { name: 'Ritual de Sorte', description: 'Invocar a energia da fortuna para abrir caminhos', frequency: 'Diário', offerings: ['Mel', 'Flores amarelas', 'Velas douradas'] },
  ],
  historia: 'Sorte é a personificação da fortuna e do destino nos caminhos de Oxum. Ela traz felicidade, abundância e boas oportunidades para aqueles que a cultuam.',
  caminhoes: ['Abrir caminhos', 'Trazer sorte', 'Proteger contra inveja'],
  conselhos: ['Cultive gratidão', 'Mantenha a mente positiva', 'Agradeça pelas pequenas vitórias'],
  perigo: ['Inveja alheia', 'Excesso de arrogância'],
  forca: ['Alegria', 'Esperança', 'Prosperidade'],
};

export function getData(): SorteData {
  return SORTE_DATA;
}

export function getDataById(id: string): SorteData | undefined {
  return id === 'sorte' ? SORTE_DATA : undefined;
}

export function getHerbs(): HerbData[] {
  return SORTE_DATA.hierbas;
}

export function getRituals(): RitualData[] {
  return SORTE_DATA.rituales;
}

export function getSorteByElement(element: string): SorteData | undefined {
  return SORTE_DATA.elementos.some(e => e.toLowerCase().includes(element.toLowerCase())) ? SORTE_DATA : undefined;
}

export default { getData, getDataById, getHerbs, getRituals, getSorteByElement };