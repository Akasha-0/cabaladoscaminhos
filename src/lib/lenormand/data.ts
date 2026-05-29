// Lenormand data module - Cabala Dos Caminhos
// Based on IDEIA.md pp.124-136

export interface LenormandCard {
  numero: number;
  nome: string;
  palavrasChave: string[];
  significado: string;
  significadoCentral: string;
  areaVida: string;
  comoInterpretar: string;
  tipo: 'natureza' | 'humano' | 'evento' | 'lugar' | 'acao';
}

export const LENORMAND_CARDS: LenormandCard[] = [
  { numero: 1, nome: 'Cavaleiro', palavrasChave: ['mensagem', 'chegada', 'notícia'], significado: 'Movimento rápido, decisão', significadoCentral: 'Chegada de notícias ou mensagens. Movimento rápido.', areaVida: 'Comunicação, novos contatos, movimento.', comoInterpretar: 'Indica chegada de alguém ou notícia importante. Pode significar viagem ou decisão a ser tomada.', tipo: 'humano' },
  { numero: 2, nome: 'Trevo', palavrasChave: ['sorte', 'oportunidade', 'azar'], significado: 'Pequena sorte, oportunidade', significadoCentral: 'Boa sorte inesperada, oportunidade favorável.', areaVida: 'Finanças, oportunidades, sort duvidoso.', comoInterpretar: 'Momento de sorte短暂. Pode indicar azar também - atenção ao contexto.', tipo: 'natureza' },
  { numero: 3, nome: 'Navio', palavrasChave: ['viagem', 'mudança', 'distância'], significado: 'Viagem, mudança', significadoCentral: 'Viagem, navegação, mudança de cenário.', areaVida: 'Transportes, mudanças, comércio.', comoInterpretar: 'Indica mudança de cenário ou situação. Pode ser positivo ou desafiador.', tipo: 'lugar' },
  { numero: 4, nome: 'Casa', palavrasChave: ['lar', 'família', 'estabilidade'], significado: 'Lar, família, estabilidade', significadoCentral: 'Lar, família, raízes, segurança.', areaVida: 'Família, lar, imóvel, herança.', comoInterpretar: 'Estabilidade doméstica. Podem indicar mudanças na família ou casa.', tipo: 'lugar' },
  { numero: 5, nome: 'Árvore', palavrasChave: ['saúde', 'família', 'crescimento'], significado: 'Saúde, família, crescimento', significadoCentral: 'Saúde, vitalidade, família, crescimento.', areaVida: 'Saúde física e emocional, família.', comoInterpretar: 'Refere-se à saúde e vitalidade. Bom desenvolvimento familiar ou de projetos.', tipo: 'natureza' },
  { numero: 6, nome: 'Nuvens', palavrasChave: ['incerteza', 'confusão', 'nebulosidade'], significado: 'Confusão, incerteza', significadoCentral: 'Confusão mental, nebulosidade, problemas.', areaVida: 'Planejamento, saúde, claridade mental.', comoInterpretar: 'Período de incerteza. Não tomar decisões importantes agora.', tipo: 'natureza' },
  { numero: 7, nome: 'Cobra', palavrasChave: ['engano', 'astúcia', 'perigo'], significado: 'Engano, manipulação', significadoCentral: 'Engano, manipulação, perigo escondido.', areaVida: 'Relacionamentos, negócios, traição.', comoInterpretar: 'Alerta para engano ou manipulação. Cuidado com falsos amigos ou negócios.', tipo: 'natureza' },
  { numero: 8, nome: 'Caixão', palavrasChave: ['fim', 'mudança', 'morte'], significado: 'Fim, encerramento', significadoCentral: 'Fim de ciclo, inúmer, morte.', areaVida: 'Negócios, relacionamentos, projetos.', comoInterpretar: 'Encerramento de capítulo. Pode ser transformador se aceito.', tipo: 'evento' },
  { numero: 9, nome: 'Flores', palavrasChave: ['felicidade', 'saúde', 'amor'], significado: 'Felicidade, sucesso', significadoCentral: 'Felicidade, saúde, sucesso, flores.', areaVida: 'Amor, saúde, felicidade geral.', comoInterpretar: 'Período favorável. Alegria, sucesso em projetos.', tipo: 'natureza' },
  { numero: 10, nome: 'Foice', palavrasChave: ['corte', 'destruição', 'separação'], significado: 'Corte, separação', significadoCentral: 'Corte brusco, separação, destruição.', areaVida: 'Relacionamentos, finanças, decisões.', comoInterpretar: 'Corte dramático ou separação. Geralmente inevitável.', tipo: 'acao' },
  { numero: 11, nome: 'Chicote', palavrasChave: ['disputa', 'conflito', 'disciplina'], significado: 'Conflito, disciplina', significadoCentral: 'Conflito, disciplina, discussão.', areaVida: 'Relacionamentos, trabalho, autoridade.', comoInterpretar: 'Tensão ou conflito. Pode indicar disciplina ou violência.', tipo: 'acao' },
  { numero: 12, nome: 'Pássaros', palavrasChave: ['comunicação', 'preocupação', 'notícias'], significado: 'Preocupações, comunicação', significadoCentral: 'Preocupações, ansiedades, comunicação.', areaVida: 'Comunicação, viagens curtas, mentalidade.', comoInterpretar: 'Período de inquietação. Muita comunicação mas incerteza.', tipo: 'natureza' },
  { numero: 13, nome: 'Criança', palavrasChave: ['inocência', 'novo começo', 'infância'], significado: 'Novo começo, inocência', significadoCentral: 'Novo começo, inocência, início.', areaVida: 'Projetos novos, crianças, pureza.', comoInterpretar: 'Início de novo ciclo. Representa pureza ou imaturidade.', tipo: 'humano' },
  { numero: 14, nome: 'Raposa', palavrasChave: ['astúcia', 'engano', 'oportunismo'], significado: 'Astúcia, engano', significadoCentral: 'Astúcia, engano, manipulação.', areaVida: 'Negócios, trabalho, falsos amigos.', comoInterpretar: 'Alerta para falsidade. Não confiar appearances.', tipo: 'humano' },
  { numero: 15, nome: 'Urso', palavrasChave: ['força', 'poder', 'autoridade'], significado: 'Força, poder', significadoCentral: 'Força, poder, proteção, figura de autoridade.', areaVida: 'Negócios, saúde, autoridade.', comoInterpretar: 'Influência de alguém poderoso. Força física ou mental.', tipo: 'humano' },
  { numero: 16, nome: 'Estrela', palavrasChave: ['esperança', 'inspiração', 'cura'], significado: 'Esperança, estrela', significadoCentral: 'Esperança, inspiração, estrela guia.', areaVida: 'Espiritualidade, carreira, esperança.', comoInterpretar: 'Luz no fim do túnel. Inspiração e cura disponíveis.', tipo: 'natureza' },
  { numero: 17, nome: 'Cegonha', palavrasChave: ['mudança', 'movimento', 'natalidade'], significado: 'Mudança, natalidade', significadoCentral: 'Mudança, chegada de novo (bebê),搬家.', areaVida: 'Casa nova, nascimento, mudança grande.', comoInterpretar: 'Grande mudança iminente. Pode indicar inúmer ou inúmer.', tipo: 'natureza' },
  { numero: 18, nome: 'Cachorro', palavrasChave: ['lealdade', 'amizade', 'fidelidade'], significado: 'Lealdade, amizade', significadoCentral: 'Amizade fiel, lealdade, confiança.', areaVida: 'Amigos, relacionamentos, fidelidade.', comoInterpretar: 'Amigo fiel presente. Ou alguém sendo leal a você.', tipo: 'humano' },
  { numero: 19, nome: 'Torre', palavrasChave: ['ascensão', 'isolamento', 'autoridade'], significado: 'Ascensão, torre', significadoCentral: 'Ascensão social, torre, isolamento.', areaVida: 'Carreira, status, solidão.', comoInterpretar: 'Subida ou queda dramáticas. Isolamento voluntario ou involuntário.', tipo: 'lugar' },
  { numero: 20, nome: 'Jardim', palavrasChave: ['socialização', 'festa', 'comunidade'], significado: 'Festa, socialização', significadoCentral: 'Festa, jardim, اجتماع, comunidade.', areaVida: 'Eventos sociais, comunidade, diversão.', comoInterpretar: 'Período social ativo. Novas conexões e eventos.', tipo: 'lugar' },
  { numero: 21, nome: 'Montanha', palavrasChave: ['obstáculo', 'desafio', 'superação'], significado: 'Obstáculo, desafio', significadoCentral: 'Obstáculo, dificuldade, montanha a subir.', areaVida: 'Carreira, objetivos, desafios.', comoInterpretar: 'Barreira a ser superada. Determinação necessária.', tipo: 'natureza' },
  { numero: 22, nome: 'Caminhos', palavrasChave: ['escolha', 'decisão', '十字路口'], significado: 'Escolha, decisão', significadoCentral: 'Escolha difícil, encruzilhada.', areaVida: 'Decisões importantes, crossroads.', comoInterpretar: 'Momento de escolha crucial. Avaliar prós e contras.', tipo: 'evento' },
  { numero: 23, nome: 'Rato', palavrasChave: ['perda', 'consumo', 'preocupação'], significado: 'Perda, preocupação', significadoCentral: 'Perda, consumo, preocupações.', areaVida: 'Finanças, perdas, consumismo.', comoInterpretar: 'Atenção a gastos excessivos. Podem haver perdas.', tipo: 'natureza' },
  { numero: 24, nome: 'Coração', palavrasChave: ['amor', 'emoção', 'paixão'], significado: 'Amor, coração', significadoCentral: 'Amor, emoção, paixão.', areaVida: 'Relacionamentos, emoções, coração.', comoInterpretar: 'Assunto amoroso em destaque. Paixão ou vulnerabilidade.', tipo: 'natureza' },
  { numero: 25, nome: 'Anel', palavrasChave: ['compromisso', 'união', 'promessa'], significado: 'Compromisso, promessa', significadoCentral: 'Compromisso, contrato, união.', areaVida: 'Relacionamentos, negócios, promessas.', comoInterpretar: 'Compromisso ou contrato. União ou promessa séria.', tipo: 'acao' },
  { numero: 26, nome: 'Livro', palavrasChave: ['conhecimento', 'segredo', 'educação'], significado: 'Conhecimento, segredo', significadoCentral: 'Conhecimento, segredo, educação.', areaVida: 'Estudos, negócios secretos, conhecimento.', comoInterpretar: 'Segredo revelado ou conhecimento gained. Estudos.', tipo: 'lugar' },
  { numero: 27, nome: 'Carta', palavrasChave: ['comunicação', 'mensagem', 'notícia'], significado: 'Mensagem, comunicação', significadoCentral: 'Mensagem, carta, comunicação.', areaVida: 'Comunicação, documentos, notícias.', comoInterpretar: 'Mensagem importante a caminho. Comunicação chegando.', tipo: 'acao' },
  { numero: 28, nome: 'Cigano', palavrasChave: ['consulta', 'viagem', 'movimento'], significado: 'Homem cigano, movimento', significadoCentral: 'Homem cigano, konsultasi, perjalanan.', areaVida: 'Viagem, consulta, negócios.', comoInterpretar: 'Consulta ou conselho. Homem cigano como figura.', tipo: 'humano' },
  { numero: 29, nome: 'Cigana', palavrasChave: ['consulta', 'intuição', 'mulher'], significado: 'Mulher cigana, intuição', significadoCentral: 'Mulher cigana, intuição, sabedoria.', areaVida: 'Conselho, intuição, questões femininas.', comoInterpretar: 'Mulher com sabedoria ou conselho intuitivo.', tipo: 'humano' },
  { numero: 30, nome: 'Lírios', palavrasChave: ['paz', 'harmonia', 'pureza'], significado: 'Paz, harmonia', significadoCentral: 'Paz, harmonia, pureza, lis.',
    areaVida: 'Relacionamentos, paz, pureza.', comoInterpretar: 'Período de paz e harmonia. Pureza de intenções.', tipo: 'natureza' },
  { numero: 31, nome: 'Sol', palavrasChave: ['sucesso', 'alegria', 'clareza'], significado: 'Sucesso, clareza', significadoCentral: 'Sucesso, claridade, sol brilhando.', areaVida: 'Sucesso, alegria, reconhecimento.', comoInterpretar: 'Período de muito sucesso e alegria. Clarez mentally.', tipo: 'natureza' },
  { numero: 32, nome: 'Lua', palavrasChave: ['intuição', 'emoção', 'subconsciente'], significado: 'Intuição, emoções', significadoCentral: 'Lua, intuição, emoções profundas.', areaVida: 'Intuição, inconsciente, emocional.',
    comoInterpretar: 'Período de sensibilidade. Seguir a intuição.', tipo: 'natureza' },
  { numero: 33, nome: 'Coroa', palavrasChave: ['sucesso', 'vitória', 'liderança'], significado: 'Sucesso, vitória', significadoCentral: 'Vitória, coroa, sucesso supremo.', areaVida: 'Sucesso, liderança, reconhecimento.',
    comoInterpretar: 'Sucesso e vitória alcançados. Reconhecimento público.', tipo: 'acao' },
  { numero: 34, nome: 'Destino', palavrasChave: ['futuro', 'transformação', 'morte'], significado: 'Destino, transformação', significadoCentral: 'Destino, transformação radical.', areaVida: 'Transformação, futuro, morte e renascimento.', comoInterpretar: 'Mudança profunda de vida. Destino calling.', tipo: 'evento' },
  { numero: 35, nome: 'Firmeza', palavrasChave: ['estabilidade', 'força', 'determinação'], significado: 'Estabilidade, firmeza', significadoCentral: 'Estabilidade, ancora, força interior.',
    areaVida: 'Estabilidade, segurança, fundament.', comoInterpretar: 'Período de ancoragem. Resistência a mudanças.', tipo: 'acao' },
  { numero: 36, nome: 'Prova', palavrasChave: ['teste', 'tentação', 'juízo'], significado: 'Teste, tentação', significadoCentral: 'Prova final, tentação, julgamento.',
    areaVida: 'Teste, tentação, decisão moral.', comoInterpretar: 'Teste importante. Resistência à tentação necessária.', tipo: 'evento' },
];

export function getCardByNumero(numero: number): LenormandCard | undefined {
  return LENORMAND_CARDS.find(card => card.numero === numero);
}

export const CASAS_TEMATICAS = {
  DINHEIRO: [33, 34, 25, 2, 35, 10, 11, 16, 21, 23],
  AMOR: [24, 25, 27, 29, 31, 32, 4, 5, 9, 18],
  TRABALHO: [14, 35, 1, 3, 7, 11, 19, 26, 28, 33],
  SAUDE: [5, 6, 8, 16, 31, 32, 34, 35],
};