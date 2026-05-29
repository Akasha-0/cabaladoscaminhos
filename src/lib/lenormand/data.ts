/**
 * Lenormand Mesa Real Data
 * Based on IDEIA.md pp.85-136
 */

export interface LenormandCard {
  numero: number;
  nome: string;
  significadoCentral: string;
  areaVida: string;
  tipo: 'favoravel' | 'desafio' | 'neutro' | 'alerta';
}

export const LENORMAND_CARDS: LenormandCard[] = [
  { numero: 1, nome: 'O Cavaleiro', significadoCentral: 'Início, velocidade, notícias', areaVida: 'Ações imediatas', tipo: 'favoravel' },
  { numero: 2, nome: 'O Trevo', significadoCentral: 'Pequenos obstáculos, imprevistos', areaVida: 'Desafios diários', tipo: 'neutro' },
  { numero: 3, nome: 'O Navio', significadoCentral: 'Viagens, mudanças profundas', areaVida: 'Mudanças geográficas', tipo: 'favoravel' },
  { numero: 4, nome: 'A Casa', significadoCentral: 'Família, base estrutural', areaVida: 'Assuntos domésticos', tipo: 'neutro' },
  { numero: 5, nome: 'A Árvore', significadoCentral: 'Saúde, ancestralidade', areaVida: 'Saúde física/espiritual', tipo: 'neutro' },
  { numero: 6, nome: 'As Nuvens', significadoCentral: 'Dúvidas, confusão mental', areaVida: 'Estado psicológico', tipo: 'desafio' },
  { numero: 7, nome: 'A Cobra', significadoCentral: 'Traição, autossabotagem', areaVida: 'Alertas, inveja', tipo: 'alerta' },
  { numero: 8, nome: 'O Caixão', significadoCentral: 'Fim de ciclo, transformações', areaVida: 'Rupturas, regeneração', tipo: 'desafio' },
  { numero: 9, nome: 'As Flores', significadoCentral: 'Felicidade, cura', areaVida: 'Bem-estar, alegria', tipo: 'favoravel' },
  { numero: 10, nome: 'A Foice', significadoCentral: 'Cortes abruptos, decisões', areaVida: 'Decisões definitivas', tipo: 'desafio' },
  { numero: 11, nome: 'O Chicote', significadoCentral: 'Conflitos, estresse', areaVida: 'Brigas, desgaste', tipo: 'desafio' },
  { numero: 12, nome: 'Os Pássaros', significadoCentral: 'Comunicação, conversas', areaVida: 'Vida social', tipo: 'neutro' },
  { numero: 13, nome: 'A Criança', significadoCentral: 'Novos começos, pureza', areaVida: 'Início de projetos', tipo: 'favoravel' },
  { numero: 14, nome: 'A Raposa', significadoCentral: 'Estratégia, armadilhas', areaVida: 'Cautela necessária', tipo: 'alerta' },
  { numero: 15, nome: 'A Urso', significadoCentral: 'Poder, autoridade', areaVida: 'Finanças, proteção', tipo: 'neutro' },
  { numero: 16, nome: 'A Estrela', significadoCentral: 'Sucesso, brilho pessoal', areaVida: 'Espiritualidade alta', tipo: 'favoravel' },
  { numero: 17, nome: 'A Cegonha', significadoCentral: 'Novidades, mudanças positivas', areaVida: 'Viagens, novos ciclos', tipo: 'favoravel' },
  { numero: 18, nome: 'A Cachorro', significadoCentral: 'Fidelidade, amizade', areaVida: 'Relações próximas', tipo: 'favoravel' },
  { numero: 19, nome: 'A Torre', significadoCentral: 'Isolamento, autoconhecimento', areaVida: 'Burocracia, solidão', tipo: 'neutro' },
  { numero: 20, nome: 'O Jardim', significadoCentral: 'Vida pública, sociedade', areaVida: 'Impacto no coletivo', tipo: 'neutro' },
  { numero: 21, nome: 'A Montanha', significadoCentral: 'Grandes bloqueios', areaVida: 'Obstáculos', tipo: 'desafio' },
  { numero: 22, nome: 'Os Caminhos', significadoCentral: 'Escolhas, livre-arbítrio', areaVida: 'Decisões de vida', tipo: 'neutro' },
  { numero: 23, nome: 'O Rato', significadoCentral: 'Desgaste, perdas', areaVida: 'Preocupações', tipo: 'desafio' },
  { numero: 24, nome: 'O Coração', significadoCentral: 'Amor, paixão', areaVida: 'Relacionamentos', tipo: 'favoravel' },
  { numero: 25, nome: 'O Anel', significadoCentral: 'Contratos, parcerias', areaVida: 'Compromissos', tipo: 'neutro' },
  { numero: 26, nome: 'O Livro', significadoCentral: 'Segredos, estudos', areaVida: 'Mistérios', tipo: 'neutro' },
  { numero: 27, nome: 'A Carta', significadoCentral: 'Documentos, mensagens', areaVida: 'Burocracia', tipo: 'neutro' },
  { numero: 28, nome: 'O Cigano', significadoCentral: 'Energia masculina', areaVida: 'Consulente (homem)', tipo: 'neutro' },
  { numero: 29, nome: 'A Cigana', significadoCentral: 'Energia feminina', areaVida: 'Consulente (mulher)', tipo: 'neutro' },
  { numero: 30, nome: 'Os Lírios', significadoCentral: 'Paz, maturidade', areaVida: 'Harmonia', tipo: 'favoravel' },
  { numero: 31, nome: 'O Sol', significadoCentral: 'Sucesso absoluto', areaVida: 'Sucesso, verdade', tipo: 'favoravel' },
  { numero: 32, nome: 'A Lua', significadoCentral: 'Reconhecimento, intuição', areaVida: 'Carreira, psique', tipo: 'neutro' },
  { numero: 33, nome: 'A Chave', significadoCentral: 'Soluções, respostas', areaVida: 'Resolução', tipo: 'favoravel' },
  { numero: 34, nome: 'Os Peixes', significadoCentral: 'Dinheiro, fluxo', areaVida: 'Finanças', tipo: 'favoravel' },
  { numero: 35, nome: 'A Âncora', significadoCentral: 'Estabilidade, segurança', areaVida: 'Carreira estável', tipo: 'neutro' },
  { numero: 36, nome: 'A Cruz', significadoCentral: 'Destino, provações', areaVida: 'Lições kármicas', tipo: 'desafio' },
];

export function getCardByNumero(numero: number): LenormandCard | undefined {
  return LENORMAND_CARDS.find((card) => card.numero === numero);
}

export const CASAS_TEMATICAS = {
  DINHEIRO: [34, 15, 14],
  AMOR: [24, 25, 29],
  TRABALHO: [14, 35, 5],
  SAUDE: [5, 8],
  DESTINO: [33, 34, 35, 36],
} as const;
