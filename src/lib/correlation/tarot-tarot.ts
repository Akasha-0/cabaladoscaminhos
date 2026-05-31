export type TarotPathType = 'Sequência' | 'Ancestral';
export interface TarotTarotMapping { arcano: string; related_arcano: string; path_type: TarotPathType; spiritual_meaning: { significado: string; crescimento: string; desafio: string; }; }
export const ALL_MAJOR_ARCANOS = ['0 - O Louco','I - O Mago','II - A Sacerdotisa','III - A Imperatriz','IV - O Imperador','V - O Hierofante','VI - Os Enamorados','VII - O Carro','VIII - A Justiça','IX - O Eremita','X - A Roda da Fortuna','XI - A Força','XII - O Enforcado','XIII - A Morte','XIV - A Temperança','XV - O Diabo','XVI - A Torre','XVII - A Estrela','XVIII - A Lua','XIX - O Sol','XX - O Julgamento','XXI - O Mundo'] as const;
export const TOTAL_PATH_TYPES = 2;
export const TOTAL_MAPPINGS = 22;
const M: readonly TarotTarotMapping[] = [
  {arcano:'0 - O Louco',related_arcano:'I - O Mago',path_type:'Sequência',spiritual_meaning:{significado:'Início',crescimento:'Despertar',desafio:'Superar medos'}},
  {arcano:'I - O Mago',related_arcano:'II - A Sacerdotisa',path_type:'Sequência',spiritual_meaning:{significado:'Manifestação',crescimento:'Poderes',desafio:'Equilíbrio'}},
  {arcano:'II - A Sacerdotisa',related_arcano:'III - A Imperatriz',path_type:'Sequência',spiritual_meaning:{significado:'Intuição',crescimento:'Confiar',desafio:'Processo'}},
  {arcano:'III - A Imperatriz',related_arcano:'IV - O Imperador',path_type:'Sequência',spiritual_meaning:{significado:'Abundância',crescimento:'Criar',desafio:'Controle'}},
  {arcano:'IV - O Imperador',related_arcano:'V - O Hierofante',path_type:'Sequência',spiritual_meaning:{significado:'Ordem',crescimento:'Autoridade',desafio:'Orientação'}},
  {arcano:'V - O Hierofante',related_arcano:'VI - Os Enamorados',path_type:'Sequência',spiritual_meaning:{significado:'Tradição',crescimento:'Escolha',desafio:'Coração'}},
  {arcano:'VI - Os Enamorados',related_arcano:'VII - O Carro',path_type:'Sequência',spiritual_meaning:{significado:'Amor',crescimento:'Propósito',desafio:'Direção'}},
  {arcano:'VII - O Carro',related_arcano:'VIII - A Justiça',path_type:'Sequência',spiritual_meaning:{significado:'Conquista',crescimento:'Integridade',desafio:'Opostos'}},
  {arcano:'VIII - A Justiça',related_arcano:'IX - O Eremita',path_type:'Sequência',spiritual_meaning:{significado:'Verdade',crescimento:'Sabedoria',desafio:'Aparência'}},
  {arcano:'IX - O Eremita',related_arcano:'X - A Roda da Fortuna',path_type:'Sequência',spiritual_meaning:{significado:'Iluminação',crescimento:'Ciclos',desafio:'Confiar'}},
  {arcano:'X - A Roda da Fortuna',related_arcano:'XI - A Força',path_type:'Sequência',spiritual_meaning:{significado:'Destino',crescimento:'Instintos',desafio:'Sombra'}},
  {arcano:'XI - A Força',related_arcano:'XII - O Enforcado',path_type:'Sequência',spiritual_meaning:{significado:'Coragem',crescimento:'Sacrifício',desafio:'Perspectiva'}},
  {arcano:'XII - O Enforcado',related_arcano:'XIII - A Morte',path_type:'Sequência',spiritual_meaning:{significado:'Sacrifício',crescimento:'Mudança',desafio:'Passado'}},
  {arcano:'XIII - A Morte',related_arcano:'XIV - A Temperança',path_type:'Sequência',spiritual_meaning:{significado:'Transformação',crescimento:'Equilíbrio',desafio:'Extremos'}},
  {arcano:'XIV - A Temperança',related_arcano:'XV - O Diabo',path_type:'Sequência',spiritual_meaning:{significado:'Moderação',crescimento:'Discernimento',desafio:'Armadilhas'}},
  {arcano:'XV - O Diabo',related_arcano:'XVI - A Torre',path_type:'Sequência',spiritual_meaning:{significado:'Tentação',crescimento:'Libertação',desafio:'Ilusões'}},
  {arcano:'XVI - A Torre',related_arcano:'XVII - A Estrela',path_type:'Sequência',spiritual_meaning:{significado:'Destruição',crescimento:'Renovação',desafio:'Esperança'}},
  {arcano:'XVII - A Estrela',related_arcano:'XVIII - A Lua',path_type:'Sequência',spiritual_meaning:{significado:'Esperança',crescimento:'Discernimento',desafio:'Integração'}},
  {arcano:'XVIII - A Lua',related_arcano:'XIX - O Sol',path_type:'Sequência',spiritual_meaning:{significado:'Ilusão',crescimento:'Verdade',desafio:'Medos'}},
  {arcano:'XIX - O Sol',related_arcano:'XX - O Julgamento',path_type:'Sequência',spiritual_meaning:{significado:'Clareza',crescimento:'Vitórias',desafio:'Perdão'}},
  {arcano:'XX - O Julgamento',related_arcano:'XXI - O Mundo',path_type:'Sequência',spiritual_meaning:{significado:'Despertar',crescimento:'Integração',desafio:'Completude'}},
  {arcano:'0 - O Louco',related_arcano:'XXI - O Mundo',path_type:'Ancestral',spiritual_meaning:{significado:'Início e fim',crescimento:'Ciclo',desafio:'Retorno'}},
];
Object.freeze(M);
export { M as TAROT_TAROT_MAPPINGS };
export function getTarotTarot(a: string) { return M.filter(m => m.arcano === a || m.related_arcano === a); }
export function getAllTarotPaths() { return M; }
export function getAllPathTypes(): TarotPathType[] { return ['Sequência','Ancestral']; }
export function getAllMappedArcanos() { return [...new Set([...M.map(m=>m.arcano),...M.map(m=>m.related_arcano)]; }
export function hasRelation(a1: string, a2: string) { return M.some(m => m.arcano===a1&&m.related_arcano===a2 || m.arcano===a2&&m.related_arcano===a1); }
export function getArcanoByNumber(n: number) { return n>=0&&n<=21?ALL_MAJOR_ARCANOS[n]:null; }
export default { getTarotTarot, getAllTarotPaths, getAllPathTypes, getAllMappedArcanos, hasRelation, getArcanoByNumber, ALL_MAJOR_ARCANOS, TAROT_TAROT_MAPPINGS, TOTAL_MAPPINGS, TOTAL_PATH_TYPES };
