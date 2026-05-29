/**
 * Lenormand Cards Data - Cabala Dos Caminhos
 */
export interface LenormandCard { numero: number; nome: string; significadoCentral: string; areaVida: string; cartaTematica: string; comoInterpretar: string; tipo: 'favoravel' | 'desafio' | 'neutro' | 'alerta'; }
export const LENORMAND_CARDS: LenormandCard[] = [
  { numero: 1, nome: 'O Cavaleiro', significadoCentral: 'Início, velocidade, notícias.', areaVida: 'Ações imediatas.', cartaTematica: '1. O Cavaleiro', comoInterpretar: 'Mostra entrada na vida.', tipo: 'favoravel' },
  { numero: 2, nome: 'O Trevo', significadoCentral: 'Pequenos obstáculos.', areaVida: 'Desafios diários.', cartaTematica: '2. O Trevo', comoInterpretar: 'Pedras no caminho.', tipo: 'neutro' },
  { numero: 3, nome: 'O Navio', significadoCentral: 'Viagens, transições.', areaVida: 'Mudanças geográficas.', cartaTematica: '3. O Navio', comoInterpretar: 'Vida navega.', tipo: 'favoravel' },
  { numero: 4, nome: 'A Casa', significadoCentral: 'Família, estabilidade.', areaVida: 'Assuntos domésticos.', cartaTematica: '4. A Casa', comoInterpretar: 'Segurança íntima.', tipo: 'neutro' },
  { numero: 5, nome: 'A Árvore', significadoCentral: 'Saúde, crescimento.', areaVida: 'Saúde física.', cartaTematica: '5. A Árvore', comoInterpretar: 'Vitalidade.', tipo: 'neutro' },
  { numero: 6, nome: 'As Nuvens', significadoCentral: 'Dúvidas, confusão.', areaVida: 'Estado psicológico.', cartaTematica: '6. As Nuvens', comoInterpretar: 'Confusão.', tipo: 'desafio' },
  { numero: 7, nome: 'A Cobra', significadoCentral: 'Traição, autossabotagem.', areaVida: 'Alertas.', cartaTematica: '7. A Cobra', comoInterpretar: 'Perigos ocultos.', tipo: 'alerta' },
  { numero: 8, nome: 'O Caixão', significadoCentral: 'Fim de ciclo.', areaVida: 'Rupturas.', cartaTematica: '8. O Caixão', comoInterpretar: 'O que precisa morrer.', tipo: 'desafio' },
  { numero: 9, nome: 'As Flores', significadoCentral: 'Felicidade.', areaVida: 'Bem-estar.', cartaTematica: '9. As Flores', comoInterpretar: 'Casa da alegria.', tipo: 'favoravel' },
  { numero: 10, nome: 'A Foice', significadoCentral: 'Cortes abruptos.', areaVida: 'Decisões definitivas.', cartaTematica: '10. A Foice', comoInterpretar: 'Cortes drásticos.', tipo: 'desafio' },
  { numero: 11, nome: 'O Chicote', significadoCentral: 'Conflitos.', areaVida: 'Brigas.', cartaTematica: '11. O Chicote', comoInterpretar: 'Atrito constante.', tipo: 'desafio' },
  { numero: 12, nome: 'Os Pássaros', significadoCentral: 'Comunicação.', areaVida: 'Vida social.', cartaTematica: '12. Os Pássaros', comoInterpretar: 'Movimento diário.', tipo: 'neutro' },
  { numero: 13, nome: 'A Criança', significadoCentral: 'Novos começos.', areaVida: 'Início de projetos.', cartaTematica: '13. A Criança', comoInterpretar: 'O que está nascendo.', tipo: 'favoravel' },
  { numero: 14, nome: 'A Raposa', significadoCentral: 'Estratégia.', areaVida: 'Trabalho.', cartaTematica: '14. A Raposa', comoInterpretar: 'Ser estratégico.', tipo: 'alerta' },
  { numero: 15, nome: 'O Urso', significadoCentral: 'Poder.', areaVida: 'Finanças.', cartaTematica: '15. O Urso', comoInterpretar: 'Onde há poder.', tipo: 'neutro' },
  { numero: 16, nome: 'A Estrela', significadoCentral: 'Sucesso.', areaVida: 'Espiritualidade.', cartaTematica: '16. A Estrela', comoInterpretar: 'Norte espiritual.', tipo: 'favoravel' },
  { numero: 17, nome: 'A Cegonha', significadoCentral: 'Novidades.', areaVida: 'Novos ciclos.', cartaTematica: '17. A Cegonha', comoInterpretar: 'Novidades.', tipo: 'favoravel' },
  { numero: 18, nome: 'O Cachorro', significadoCentral: 'Fidelidade.', areaVida: 'Amigos.', cartaTematica: '18. O Cachorro', comoInterpretar: 'Confiança.', tipo: 'favoravel' },
  { numero: 19, nome: 'A Torre', significadoCentral: 'Isolamento.', areaVida: 'Bancos.', cartaTematica: '19. A Torre', comoInterpretar: 'Isolamento.', tipo: 'neutro' },
  { numero: 20, nome: 'O Jardim', significadoCentral: 'Vida pública.', areaVida: 'Redes sociais.', cartaTematica: '20. O Jardim', comoInterpretar: 'Como sociedade vê.', tipo: 'neutro' },
  { numero: 21, nome: 'A Montanha', significadoCentral: 'Bloqueios.', areaVida: 'Processos.', cartaTematica: '21. A Montanha', comoInterpretar: 'Travas.', tipo: 'desafio' },
  { numero: 22, nome: 'Os Caminhos', significadoCentral: 'Escolhas.', areaVida: 'Decisões.', cartaTematica: '22. Os Caminhos', comoInterpretar: 'Escolhas.', tipo: 'neutro' },
  { numero: 23, nome: 'O Rato', significadoCentral: 'Desgaste.', areaVida: 'Preocupações.', cartaTematica: '23. O Rato', comoInterpretar: 'Desgaste.', tipo: 'desafio' },
  { numero: 24, nome: 'O Coração', significadoCentral: 'Amor.', areaVida: 'Relacionamentos.', cartaTematica: '24. O Coração', comoInterpretar: 'Central para amor.', tipo: 'favoravel' },
  { numero: 25, nome: 'O Anel', significadoCentral: 'Contratos.', areaVida: 'Compromissos.', cartaTematica: '25. O Anel', comoInterpretar: 'Alianças.', tipo: 'neutro' },
  { numero: 26, nome: 'O Livro', significadoCentral: 'Segredos.', areaVida: 'Vida acadêmica.', cartaTematica: '26. O Livro', comoInterpretar: 'O escondido.', tipo: 'neutro' },
  { numero: 27, nome: 'A Carta', significadoCentral: 'Documentos.', areaVida: 'Burocracia.', cartaTematica: '27. A Carta', comoInterpretar: 'Papéis.', tipo: 'neutro' },
  { numero: 28, nome: 'O Cigano', significadoCentral: 'Energia masculina.', areaVida: 'Consulente homem.', cartaTematica: '28. O Cigano', comoInterpretar: 'Mente racional.', tipo: 'neutro' },
  { numero: 29, nome: 'A Cigana', significadoCentral: 'Energia feminina.', areaVida: 'Consulente mulher.', cartaTematica: '29. A Cigana', comoInterpretar: 'Emoções.', tipo: 'neutro' },
  { numero: 30, nome: 'Os Lírios', significadoCentral: 'Paz.', areaVida: 'Harmonia.', cartaTematica: '30. Os Lírios', comoInterpretar: 'Paz.', tipo: 'favoravel' },
  { numero: 31, nome: 'O Sol', significadoCentral: 'Sucesso.', areaVida: 'Sucesso financeiro.', cartaTematica: '31. O Sol', comoInterpretar: 'Ouro e verdade.', tipo: 'favoravel' },
  { numero: 32, nome: 'A Lua', significadoCentral: 'Reconhecimento.', areaVida: 'Carreira.', cartaTematica: '32. A Lua', comoInterpretar: 'Desejos da alma.', tipo: 'neutro' },
  { numero: 33, nome: 'A Chave', significadoCentral: 'Soluções.', areaVida: 'Resolução.', cartaTematica: '33. A Chave', comoInterpretar: 'Controle.', tipo: 'favoravel' },
  { numero: 34, nome: 'Os Peixes', significadoCentral: 'Dinheiro.', areaVida: 'Finanças.', cartaTematica: '34. Os Peixes', comoInterpretar: 'Casa do dinheiro.', tipo: 'favoravel' },
  { numero: 35, nome: 'A Âncora', significadoCentral: 'Estabilidade.', areaVida: 'Carreira.', cartaTematica: '35. A Âncora', comoInterpretar: 'Sustentação.', tipo: 'neutro' },
  { numero: 36, nome: 'A Cruz', significadoCentral: 'Destino.', areaVida: 'Lições.', cartaTematica: '36. A Cruz', comoInterpretar: 'Maior fardo.', tipo: 'desafio' },
];
export function getCardByNumero(numero: number): LenormandCard | undefined { return LENORMAND_CARDS.find(c => c.numero === numero); }
export function getCardsByTipo(tipo: LenormandCard['tipo']): LenormandCard[] { return LENORMAND_CARDS.filter(c => c.tipo === tipo); }
export const CASAS_TEMATICAS = { DINHEIRO: [34, 15] as const, AMOR: [24, 25] as const, TRABALHO: [35, 14] as const, SAUDE: [5, 8] as const } as const;
