/**
 * Lenormand Mesa Real Data
 * Based on IDEIA.md pp.85-136
 * 36-card Gypsy deck with Portuguese interpretations
 */

export interface LenormandCard {
  numero: number;
  nome: string;
  significadoCentral: string;
  areaVida: string;
  cartaTematica: string;
  comoInterpretar: string;
  elementos?: string[];
  cores?: string[];
  tipo: 'favoravel' | 'desafio' | 'neutro' | 'alerta';
}

export const LENORMAND_CARDS: LenormandCard[] = [
  {
    numero: 1,
    nome: 'O Cavaleiro',
    significadoCentral: 'Início, velocidade, notícias que chegam, movimentos rápidos.',
    areaVida: 'Ações imediatas, projetos novos, novos caminhos.',
    cartaTematica: '1. O Cavaleiro',
    comoInterpretar: 'Mostra o que está entrando na vida do consulente logo no início do jogo.',
    tipo: 'favoravel',
  },
  {
    numero: 2,
    nome: 'O Trevo',
    significadoCentral: 'Pequenos obstáculos, imprevistos, sorte rápida ou testes cotidianos.',
    areaVida: 'Desafios diários, sorte, pequenas dificuldades de percurso.',
    cartaTematica: '2. O Trevo',
    comoInterpretar: 'Indica as pequenas pedras no caminho ou golpes de sorte momentâneos.',
    tipo: 'neutro',
  },
  {
    numero: 3,
    nome: 'O Navio',
    significadoCentral: 'Viagens, transições de longo prazo, mudanças profundas, horizontes.',
    areaVida: 'Mudanças geográficas ou de estado civil/emocional, comércio exterior.',
    cartaTematica: '3. O Navio',
    comoInterpretar: 'Revela para onde a vida do consulente está navegando e o ritmo dessa mudança.',
    tipo: 'favoravel',
  },
  {
    numero: 4,
    nome: 'A Casa',
    significadoCentral: 'Família, base estrutural, estabilidade, o corpo físico.',
    areaVida: 'Assuntos domésticos, imóveis, o lar, antepassados.',
    cartaTematica: '4. A Casa',
    comoInterpretar: 'Mostra a segurança íntima, a relação com parentes e a saúde do corpo/lar.',
    tipo: 'neutro',
  },
  {
    numero: 5,
    nome: 'A Árvore',
    significadoCentral: 'Saúde, crescimento lento, ancestralidade, colheita duradoura.',
    areaVida: 'Saúde física/espiritual, projetos de longo prazo, evolução vital.',
    cartaTematica: '5. A Árvore',
    comoInterpretar: 'Indica a vitalidade do consulente e a firmeza de suas raízes e planos.',
    tipo: 'neutro',
  },
  {
    numero: 6,
    nome: 'As Nuvens',
    significadoCentral: 'Dúvidas, confusão mental, instabilidade, clareza que falta.',
    areaVida: 'Estado psicológico, incertezas temporárias, tempestades emocionais.',
    cartaTematica: '6. As Nuvens',
    comoInterpretar: 'Revela onde o consulente está cego ou confuso na vida atual.',
    tipo: 'desafio',
  },
  {
    numero: 7,
    nome: 'A Cobra',
    significadoCentral: 'Traição, autossabotagem, astúcia, energia sexual, rivalidades.',
    areaVida: 'Alertas, pessoas mal-intencionadas, desejos ocultos, magnetismo.',
    cartaTematica: '7. A Cobra',
    comoInterpretar: 'Alerta sobre perigos ocultos, inveja ou a necessidade de ser esperto.',
    tipo: 'alerta',
  },
  {
    numero: 8,
    nome: 'O Caixão',
    significadoCentral: 'Fim de ciclo, transformações radicais, perdas necessárias, renascimento.',
    areaVida: 'Rupturas, luto (literal ou figurado), encerramentos, regeneração.',
    cartaTematica: '8. O Caixão',
    comoInterpretar: 'Mostra o que precisa morrer ou ser enterrado na vida do consulente.',
    tipo: 'desafio',
  },
  {
    numero: 9,
    nome: 'As Flores',
    significadoCentral: 'Felicidade, presentes do destino, cura, celebração, convites.',
    areaVida: 'Bem-estar, reconciliações, vida social, surpresas positivas.',
    cartaTematica: '9. As Flores',
    comoInterpretar: 'É a casa da alegria; mostra onde o consulente receberá um "mimo" da vida.',
    tipo: 'favoravel',
  },
  {
    numero: 10,
    nome: 'A Foice',
    significadoCentral: 'Cortes abruptos, decisões radicais, colheita rápida, cirurgias.',
    areaVida: 'Decisões definitivas, encerramentos drásticos, o resultado do plantio.',
    cartaTematica: '10. A Foice',
    comoInterpretar: 'Indica onde o consulente sofrerá ou provocará um corte drástico e sem volta.',
    tipo: 'desafio',
  },
  {
    numero: 11,
    nome: 'O Chicote',
    significadoCentral: 'Conflitos, estresse, demandas espirituais, repetição de padrões, abuso.',
    areaVida: 'Brigas, discussões, força de vontade, desgaste físico/emocional.',
    cartaTematica: '11. O Chicote',
    comoInterpretar: 'Mostra onde há atrito constante, punição ou necessidade de impor limites.',
    tipo: 'desafio',
  },
  {
    numero: 12,
    nome: 'Os Pássaros',
    significadoCentral: 'Comunicação, conversas cotidianas, flertes, agitação, estresse leve.',
    areaVida: 'Vida social, conversas fiadas, reuniões, parcerias dinâmicas.',
    cartaTematica: '12. Os Pássaros',
    comoInterpretar: 'Revela o movimento do dia a dia, a comunicação e o estado de ansiedade.',
    tipo: 'neutro',
  },
  {
    numero: 13,
    nome: 'A Criança',
    significadoCentral: 'Novos começos, pureza, imaturidade, filhos, espontaneidade.',
    areaVida: 'Início de projetos, infância, vulnerabilidade, novidades puras.',
    cartaTematica: '13. A Criança',
    comoInterpretar: 'Indica o que está nascendo ou onde o consulente está agindo de forma ingênua.',
    tipo: 'favoravel',
  },
  {
    numero: 14,
    nome: 'A Raposa',
    significadoCentral: 'Estratégia, armadilhas, falsidade, inteligência voltada ao ganho.',
    areaVida: 'Trabalho assalariado, cautela necessária, emboscadas, concorrência.',
    cartaTematica: '14. A Raposa',
    comoInterpretar: 'Alerta sobre onde é preciso ser extremamente estratégico para não ser passado para trás.',
    tipo: 'alerta',
  },
  {
    numero: 15,
    nome: 'A Urso',
    significadoCentral: 'Poder, autoridade, proteção excessiva, ciúmes, finanças pesadas.',
    areaVida: 'Figuras de autoridade (chefes, pais), finanças, proteção, opressão.',
    cartaTematica: '15. O Urso',
    comoInterpretar: 'Mostra onde o consulente exerce poder ou onde está sendo sufocado/protegido.',
    tipo: 'neutro',
  },
  {
    numero: 16,
    nome: 'A Estrela',
    significadoCentral: 'Sucesso, brilho pessoal, proteção espiritual, destino, esperança.',
    areaVida: 'Espiritualidade alta, rumo de vida, fama, reconhecimento, sonhos.',
    cartaTematica: '16. A Estrela',
    comoInterpretar: 'É a casa do norte espiritual; indica onde há bênçãos e boa estrela guiando.',
    tipo: 'favoravel',
  },
  {
    numero: 17,
    nome: 'A Cegonha',
    significadoCentral: 'Novidades, mudanças positivas, gravidez, renovação de ares.',
    areaVida: 'Viagens rápidas, quebra de rotina, novos ciclos favoráveis.',
    cartaTematica: '17. A Cegonha',
    comoInterpretar: 'Revela o que trará uma lufada de ar fresco e novidade para o consulente.',
    tipo: 'favoravel',
  },
  {
    numero: 18,
    nome: 'A Cachorro',
    significadoCentral: 'Fidelidade, amizade verdadeira, aliados, proteção, lealdade.',
    areaVida: 'Relações sociais próximas, amigos, mentores, fidelidade a si mesmo.',
    cartaTematica: '18. O Cachorro',
    comoInterpretar: 'Mostra em quem ou em que o consulente pode confiar de olhos fechados.',
    tipo: 'favoravel',
  },
  {
    numero: 19,
    nome: 'A Torre',
    significadoCentral: 'Isolamento, instituições governamentais, o mundo interior, o Eu espiritual.',
    areaVida: 'Edifícios públicos, bancos, hospitais, solidão, autoconhecimento.',
    cartaTematica: '19. A Torre',
    comoInterpretar: 'Indica processos burocráticos, isolamento necessário ou o estado da alma.',
    tipo: 'neutro',
  },
  {
    numero: 20,
    nome: 'O Jardim',
    significadoCentral: 'Vida pública, sociedade, festas, o impacto das suas ações no coletivo.',
    areaVida: 'Redes sociais, eventos, reuniões públicas, colheita do que foi exposto.',
    cartaTematica: '20. O Jardim',
    comoInterpretar: 'Mostra como a sociedade enxerga o consulente e a sua vida social externa.',
    tipo: 'neutro',
  },
  {
    numero: 21,
    nome: 'A Montanha',
    significadoCentral: 'Grandes bloqueios, justiça terrena, desafios rígidos, resiliência.',
    areaVida: 'Obstáculos difíceis de mover, processos judiciais, barreiras.',
    cartaTematica: '21. A Montanha',
    comoInterpretar: 'Indica onde a vida do consulente está travada ou exige paciência monumental.',
    tipo: 'desafio',
  },
  {
    numero: 22,
    nome: 'Os Caminhos',
    significadoCentral: 'Escolhas, livre-arbítrio, bifurcações na vida, direções a tomar.',
    areaVida: 'Decisões de vida, caminhos alternativos, independência.',
    cartaTematica: '22. Os Caminhos',
    comoInterpretar: 'Mostra o momento em que o consulente terá que escolher entre duas opções.',
    tipo: 'neutro',
  },
  {
    numero: 23,
    nome: 'O Rato',
    significadoCentral: 'Desgaste, roubo de energia ou material, estresse crônico, perdas.',
    areaVida: 'Preocupações financeiras, vampirismo energético, perdas graduais.',
    cartaTematica: '23. O Rato',
    comoInterpretar: 'Alerta sobre o que está roendo a paz, a saúde ou as finanças do consulente.',
    tipo: 'desafio',
  },
  {
    numero: 24,
    nome: 'O Coração',
    significadoCentral: 'Amor, paixão, entrega emocional, sentimentos profundos.',
    areaVida: 'Relacionamentos amorosos, o que o consulente ama fazer, afeto.',
    cartaTematica: '24. O Coração',
    comoInterpretar: 'Central para o amor; mostra o estado emocional e o que move o sentimento.',
    tipo: 'favoravel',
  },
  {
    numero: 25,
    nome: 'O Anel',
    significadoCentral: 'Contratos, parcerias, casamentos, alianças comerciais ou afetivas.',
    areaVida: 'Compromissos firmados, sociedades de negócios, uniões.',
    cartaTematica: '25. O Anel',
    comoInterpretar: 'Revela a qualidade das alianças e pactos que o consulente possui ou fará.',
    tipo: 'neutro',
  },
  {
    numero: 26,
    nome: 'O Livro',
    significadoCentral: 'Segredos, estudos, trabalho intelectual, o que ainda não foi revelado.',
    areaVida: 'Vida acadêmica, carreira profunda, mistérios, arquivos ocultos.',
    cartaTematica: '26. O Livro',
    comoInterpretar: 'Indica o que está escondido do consulente ou a necessidade de estudar mais.',
    tipo: 'neutro',
  },
  {
    numero: 27,
    nome: 'A Carta',
    significadoCentral: 'Documentos oficiais, mensagens escritas, e-mails, notícias formais.',
    areaVida: 'Burocracia, avisos, papéis de contratos, exames médicos escritos.',
    cartaTematica: '27. A Carta',
    comoInterpretar: 'Mostra a chegada de papéis importantes ou comunicações formais e diretas.',
    tipo: 'neutro',
  },
  {
    numero: 28,
    nome: 'O Cigano',
    significadoCentral: 'A energia masculina, a ação, a razão, o próprio consulente (homem).',
    areaVida: 'O Consulente (se homem) ou o parceiro/homem importante (se mulher).',
    cartaTematica: '28. O Cigano',
    comoInterpretar: 'Analisa a mente racional, o foco e as ações do homem central do jogo.',
    tipo: 'neutro',
  },
  {
    numero: 29,
    nome: 'A Cigana',
    significadoCentral: 'A energia feminina, a intuição, a emoção, a própria consulente (mulher).',
    areaVida: 'A Consulente (se mulher) ou a parceira/mulher importante (se homem).',
    cartaTematica: '29. A Cigana',
    comoInterpretar: 'Analisa a intuição, a receptividade e as emoções da mulher central do jogo.',
    tipo: 'neutro',
  },
  {
    numero: 30,
    nome: 'Os Lírios',
    significadoCentral: 'Paz, maturidade, velhice, pureza, sexualidade fria ou madura.',
    areaVida: 'Harmonia familiar, paz de espírito, aposentadoria, virtudes.',
    cartaTematica: '30. Os Lírios',
    comoInterpretar: 'Mostra onde o consulente encontrará paz de espírito ou a proteção de idosos.',
    tipo: 'favoravel',
  },
  {
    numero: 31,
    nome: 'O Sol',
    significadoCentral: 'Sucesso absoluto, clareza, energia vital, ego positivo, verdade.',
    areaVida: 'Sucesso financeiro, cura de doenças, exposição positiva, energia.',
    cartaTematica: '31. O Sol',
    comoInterpretar: 'É a casa do ouro e da verdade; onde ela estiver, haverá luz e triunfo total.',
    tipo: 'favoravel',
  },
  {
    numero: 32,
    nome: 'A Lua',
    significadoCentral: 'Reconhecimento, honras, intuição, ilusões, flutuação emocional.',
    areaVida: 'Carreira (sucesso público), a psique, o misticismo, a reputação.',
    cartaTematica: '32. A Lua',
    comoInterpretar: 'Revela os desejos profundos da alma e o reconhecimento que receberá.',
    tipo: 'neutro',
  },
  {
    numero: 33,
    nome: 'A Chave',
    significadoCentral: 'Soluções, abertura de portas, respostas definitivas, saída de crises.',
    areaVida: 'Resolução de problemas, saídas estratégicas, o poder de decidir.',
    cartaTematica: '33. A Chave',
    comoInterpretar: 'Mostra onde o consulente tem o controle absoluto e a resposta nas mãos.',
    tipo: 'favoravel',
  },
  {
    numero: 34,
    nome: 'Os Peixes',
    significadoCentral: 'Dinheiro, bens materiais, fluxo financeiro, comércio, fertilidade.',
    areaVida: 'Finanças, negócios, lucros, investimentos, multiplicação.',
    cartaTematica: '34. Os Peixes',
    comoInterpretar: 'A casa do dinheiro por excelência; indica como anda o fluxo financeiro.',
    tipo: 'favoravel',
  },
  {
    numero: 35,
    nome: 'A Âncora',
    significadoCentral: 'Estabilidade, segurança a longo prazo, trabalho fixo, apego excessivo.',
    areaVida: 'Carreira estável, porto seguro, contratos de longo prazo, rigidez.',
    cartaTematica: '35. A Âncora',
    comoInterpretar: 'Mostra o que sustenta o consulente ou onde ele está preso por comodismo.',
    tipo: 'neutro',
  },
  {
    numero: 36,
    nome: 'A Cruz',
    significadoCentral: 'O destino, provações necessárias, karma, vitória após o sacrifício.',
    areaVida: 'Lições espirituais profundas, fardos, final do caminho, fé testada.',
    cartaTematica: '36. A Cruz',
    comoInterpretar: 'Indica o maior fardo atual do consulente, mas também o seu ponto de vitória final.',
    tipo: 'desafio',
  },
];

/**
 * Get card by number (1-36)
 */
export function getCardByNumero(numero: number): LenormandCard | undefined {
  return LENORMAND_CARDS.find((card) => card.numero === numero);
}

/**
 * Get card by name (case-insensitive)
 */
export function getCardByNome(nome: string): LenormandCard | undefined {
  const normalizedNome = nome.toLowerCase().trim();
  return LENORMAND_CARDS.find(
    (card) => card.nome.toLowerCase() === normalizedNome
  );
}

/**
 * Get cards by type
 */
export function getCardsByTipo(tipo: LenormandCard['tipo']): LenormandCard[] {
  return LENORMAND_CARDS.filter((card) => card.tipo === tipo);
}

/**
 * Get all favoravel cards
 */
export function getFavoravelCards(): LenormandCard[] {
  return getCardsByTipo('favoravel');
}

/**
 * Get all desafio cards
 */
export function getDesafioCards(): LenormandCard[] {
  return getCardsByTipo('desafio');
}

/**
 * Casa temática analysis based on IDEIA.md pp.130-131
 * These are the critical houses for specific themes
 */
export const CASAS_TEMATICAS = {
  DINHEIRO: [34, 15, 14], // Peixes, Urso, Raposa
  AMOR: [24, 25, 29], // Coração, Anel, Cigana
  TRABALHO: [14, 35, 5], // Raposa, Âncora, Árvore
  SAUDE: [5, 8], // Árvore, Caixão
  DESTINO: [33, 34, 35, 36], // Chave, Peixes, Âncora, Cruz (future houses)
} as const;

/**
 * Get theme analysis from drawn cards
 */
export function analyzeTheme(
  drawnCards: number[],
  theme: keyof typeof CASAS_TEMATICAS
): { cards: number[]; analysis: string } {
  const themeHouses = CASAS_TEMATICAS[theme];
  const matchedCards = drawnCards.filter((card) =>
    themeHouses.includes(card)
  );

  return {
    cards: matchedCards,
    analysis:
      matchedCards.length > 0
        ? `Encontradas ${matchedCards.length} carta(s) relacionada(s) a ${theme.toLowerCase()}: ${matchedCards.map((n) => getCardByNumero(n)?.nome).join(', ')}`
        : `Nenhuma carta significativa para ${theme.toLowerCase()} nesta leitura.`,
  };
}
