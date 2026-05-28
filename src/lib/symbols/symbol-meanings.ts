// @ts-nocheck
 

export interface SymbolMeaning {
  id: number;
  name: string;
  centralMeaning: string;
  lifeArea: string;
  thematicCard: string;
  mesaRealInterpretation: string;
}

const meanings: SymbolMeaning[] = [
  {
    id: 1,
    name: "O Cavaleiro",
    centralMeaning: "Início, velocidade, notícias que chegam, movimentos rápidos.",
    lifeArea: "Ações imediatas, projetos novos, novos caminhos.",
    thematicCard: "1. O Cavaleiro",
    mesaRealInterpretation: "Mostra o que está entrando na vida do consulente logo no início do jogo.",
  },
  {
    id: 2,
    name: "O Trevo",
    centralMeaning: "Pequenos obstáculos, imprevistos, sorte rápida ou testes cotidianos.",
    lifeArea: "Desafios diários, sorte, pequenas dificuldades de percurso.",
    thematicCard: "2. O Trevo",
    mesaRealInterpretation: "Indica as pequenas pedras no caminho ou golpes de sorte momentâneos.",
  },
  {
    id: 3,
    name: "O Navio",
    centralMeaning: "Viagens, transições de longo prazo, mudanças profundas, horizontes.",
    lifeArea: "Mudanças geográficas ou de estado civil/emocional, comércio exterior.",
    thematicCard: "3. O Navio",
    mesaRealInterpretation: "Revela para onde a vida do consulente está navegando e o ritmo dessa mudança.",
  },
  {
    id: 4,
    name: "A Casa",
    centralMeaning: "Família, base estrutural, estabilidade, o corpo físico.",
    lifeArea: "Assuntos domésticos, imóveis, o lar, antepassados.",
    thematicCard: "4. A Casa",
    mesaRealInterpretation: "Mostra a segurança íntima, a relação com parentes e a saúde do corpo/lar.",
  },
  {
    id: 5,
    name: "A Árvore",
    centralMeaning: "Saúde, crescimento lento, ancestralidade, colheita duradoura.",
    lifeArea: "Saúde física/espiritual, projetos de longo prazo, evolução vital.",
    thematicCard: "5. A Árvore",
    mesaRealInterpretation: "Indica a vitalidade do consulente e a firmeza de suas raízes e planos.",
  },
  {
    id: 6,
    name: "As Nuvens",
    centralMeaning: "Dúvidas, confusão mental, instabilidade, clareza que falta.",
    lifeArea: "Estado psicológico, incertezas temporárias, tempestades emocionais.",
    thematicCard: "6. As Nuvens",
    mesaRealInterpretation: "Revela onde o consulente está cego ou confuso na vida atual.",
  },
  {
    id: 7,
    name: "A Cobra",
    centralMeaning: "Traição, autossabotagem, astúcia, energia sexual, rivalidades.",
    lifeArea: "Alertas, pessoas mal-intencionadas, desejos ocultos, magnetismo.",
    thematicCard: "7. A Cobra",
    mesaRealInterpretation: "Alerta sobre perigos ocultos, inveja ou a necessidade de ser esperto.",
  },
  {
    id: 8,
    name: "O Caixão",
    centralMeaning: "Fim de ciclo, transformações radicais, perdas necessárias, renascimento.",
    lifeArea: "Rupturas, luto (literal ou figurado), encerramentos, regeneração.",
    thematicCard: "8. O Caixão",
    mesaRealInterpretation: "Mostra o que precisa morrer ou ser enterrado na vida do consulente.",
  },
  {
    id: 9,
    name: "As Flores",
    centralMeaning: "Felicidade, presentes do destino, cura, celebração, convites.",
    lifeArea: "Bem-estar, reconciliações, vida social, surpresas positivas.",
    thematicCard: "9. As Flores",
    mesaRealInterpretation: "É a casa da alegria; mostra onde o consulente receberá um 'mimo' da vida.",
  },
  {
    id: 10,
    name: "A Foice",
    centralMeaning: "Cortes abruptos, decisões radicais, colheita rápida, cirurgias.",
    lifeArea: "Decisões definitivas, encerramentos drásticos, o resultado do plantio.",
    thematicCard: "10. A Foice",
    mesaRealInterpretation: "Indica onde o consulente sofrerá ou provocará um corte drástico e sem volta.",
  },
  {
    id: 11,
    name: "O Chicote",
    centralMeaning: "Conflitos, estresse, demandas espirituais, repetição de padrões, abuso.",
    lifeArea: "Brigas, discussões, força de vontade, desgaste físico/emocional.",
    thematicCard: "11. O Chicote",
    mesaRealInterpretation: "Mostra onde há atrito constante, punição ou necessidade de impor limites.",
  },
  {
    id: 12,
    name: "Os Pássaros",
    centralMeaning: "Comunicação, conversas cotidianas, flertes, agitação, estresse leve.",
    lifeArea: "Vida social, conversas fiadas, reuniões, parcerias dinâmicas.",
    thematicCard: "12. Os Pássaros",
    mesaRealInterpretation: "Revela o movimento do dia a dia, a comunicação e o estado de ansiedade.",
  },
  {
    id: 13,
    name: "A Criança",
    centralMeaning: "Novos começos, pureza, imaturidade, filhos, espontaneidade.",
    lifeArea: "Início de projetos, infância, vulnerabilidade, novidades puras.",
    thematicCard: "13. A Criança",
    mesaRealInterpretation: "Indica o que está nascendo ou onde o consulente está agindo de forma ingênua.",
  },
  {
    id: 14,
    name: "A Raposa",
    centralMeaning: "Estratégia, armadilhas, falsidade, inteligência voltada ao ganho.",
    lifeArea: "Trabalho assalariado, cautela necessária, emboscadas, concorrência.",
    thematicCard: "14. A Raposa",
    mesaRealInterpretation: "Alerta sobre onde é preciso ser extremamente estratégico para não ser passado para trás.",
  },
  {
    id: 15,
    name: "O Urso",
    centralMeaning: "Poder, autoridade, proteção excessiva, ciúmes, finanças pesadas.",
    lifeArea: "Figuras de autoridade (chefes, pais), finanças, proteção, opressão.",
    thematicCard: "15. O Urso",
    mesaRealInterpretation: "Mostra onde o consulente exerce poder ou onde está sendo sufocado/protegido.",
  },
  {
    id: 16,
    name: "A Estrela",
    centralMeaning: "Sucesso, brilho pessoal, proteção espiritual, destino, esperança.",
    lifeArea: "Espiritualidade alta, rumo de vida, fama, reconhecimento, sonhos.",
    thematicCard: "16. A Estrela",
    mesaRealInterpretation: "É a casa do norte espiritual; indica onde há bênçãos e boa estrela guiando.",
  },
  {
    id: 17,
    name: "A Cegonha",
    centralMeaning: "Novidades, mudanças positivas, gravidez, renovação de ares.",
    lifeArea: "Viagens rápidas, quebra de rotina, novos ciclos favoráveis.",
    thematicCard: "17. A Cegonha",
    mesaRealInterpretation: "Revela o que trará uma lufada de ar fresco e novidade para o consulente.",
  },
  {
    id: 18,
    name: "O Cachorro",
    centralMeaning: "Fidelidade, amizade verdadeira, aliados, proteção, lealdade.",
    lifeArea: "Relações sociais próximas, amigos, mentores, fidelidade a si mesmo.",
    thematicCard: "18. O Cachorro",
    mesaRealInterpretation: "Mostra em quem ou em que o consulente pode confiar de olhos fechados.",
  },
  {
    id: 19,
    name: "A Torre",
    centralMeaning: "Isolamento, instituições governamentais, o mundo interior, o Eu espiritual.",
    lifeArea: "Edifícios públicos, bancos, hospitais, solidão, autoconhecimento.",
    thematicCard: "19. A Torre",
    mesaRealInterpretation: "Indica processos burocráticos, isolamento necessário ou o estado da alma.",
  },
  {
    id: 20,
    name: "O Jardim",
    centralMeaning: "Vida pública, sociedade, festas, o impacto das suas ações no coletivo.",
    lifeArea: "Redes sociais, eventos, reuniões públicas, colheita do que foi exposto.",
    thematicCard: "20. O Jardim",
    mesaRealInterpretation: "Mostra como a sociedade enxerga o consulente e a sua vida social externa.",
  },
  {
    id: 21,
    name: "A Montanha",
    centralMeaning: "Grandes bloqueios, justiça terrena, desafios rígidos, resiliência.",
    lifeArea: "Obstáculos difíceis de mover, processos judiciais, barreiras.",
    thematicCard: "21. A Montanha",
    mesaRealInterpretation: "Indica onde a vida do consulente está travada ou exige paciência monumental.",
  },
  {
    id: 22,
    name: "Os Caminhos",
    centralMeaning: "Escolhas, livre-arbítrio, bifurcações na vida, direções a tomar.",
    lifeArea: "Decisões de vida, caminhos alternativos, independência.",
    thematicCard: "22. Os Caminhos",
    mesaRealInterpretation: "Mostra o momento em que o consulente terá que escolher entre duas opções.",
  },
  {
    id: 23,
    name: "O Rato",
    centralMeaning: "Desgaste, roubo de energia ou material, estresse crônico, perdas.",
    lifeArea: "Preocupações financeiras, vampirismo energético, perdas graduais.",
    thematicCard: "23. O Rato",
    mesaRealInterpretation: "Alerta sobre o que está roendo a paz, a saúde ou as finanças do consulente.",
  },
  {
    id: 24,
    name: "O Coração",
    centralMeaning: "Amor, paixão, entrega emocional, sentimentos profundos.",
    lifeArea: "Relacionamentos amorosos, o que o consulente ama fazer, afeto.",
    thematicCard: "24. O Coração",
    mesaRealInterpretation: "Central para o amor; mostra o estado emocional e o que move o sentimento.",
  },
  {
    id: 25,
    name: "O Anel",
    centralMeaning: "Contratos, parcerias, casamentos, alianças comerciais ou afetivas.",
    lifeArea: "Compromissos firmados, sociedades de negócios, uniões.",
    thematicCard: "25. O Anel",
    mesaRealInterpretation: "Revela a qualidade das alianças e pactos que o consulente possui ou fará.",
  },
  {
    id: 26,
    name: "O Livro",
    centralMeaning: "Segredos, estudos, trabalho intelectual, o que ainda não foi revelado.",
    lifeArea: "Vida acadêmica, carreira profunda, mistérios, arquivos ocultos.",
    thematicCard: "26. O Livro",
    mesaRealInterpretation: "Indica o que está escondido do consulente ou a necessidade de estudar mais.",
  },
  {
    id: 27,
    name: "A Carta",
    centralMeaning: "Documentos oficiais, mensagens escritas, e-mails, notícias formais.",
    lifeArea: "Burocracia, avisos, papéis de contratos, exames médicos escritos.",
    thematicCard: "27. A Carta",
    mesaRealInterpretation: "Mostra a chegada de papéis importantes ou comunicações formais e diretas.",
  },
  {
    id: 28,
    name: "O Cigano",
    centralMeaning: "A energia masculina, a ação, a razão, o próprio consulente (homem).",
    lifeArea: "O Consulente (se homem) ou o parceiro/homem importante (se mulher).",
    thematicCard: "28. O Cigano",
    mesaRealInterpretation: "Analisa a mente racional, o foco e as ações do homem central do jogo.",
  },
  {
    id: 29,
    name: "A Cigana",
    centralMeaning: "A energia feminina, a intuição, a emoção, a própria consulente (mulher).",
    lifeArea: "A Consulente (se mulher) ou a parceira/mulher importante (se homem).",
    thematicCard: "29. A Cigana",
    mesaRealInterpretation: "Analisa a intuição, a receptividade e as emoções da mulher central do jogo.",
  },
  {
    id: 30,
    name: "Os Lírios",
    centralMeaning: "Paz, maturidade, velhice, pureza, sexualidade fria ou madura.",
    lifeArea: "Harmonia familiar, paz de espírito, aposentadoria, virtudes.",
    thematicCard: "30. Os Lírios",
    mesaRealInterpretation: "Mostra onde o consulente encontrará paz de espírito ou a proteção de idosos.",
  },
  {
    id: 31,
    name: "O Sol",
    centralMeaning: "Sucesso absoluto, clareza, energia vital, ego positivo, verdade.",
    lifeArea: "Sucesso financeiro, cura de doenças, exposição positiva, energia.",
    thematicCard: "31. O Sol",
    mesaRealInterpretation: "É a casa do ouro e da verdade; onde ela estiver, haverá luz e triunfo total.",
  },
  {
    id: 32,
    name: "A Lua",
    centralMeaning: "Reconhecimento, honras, intuição, ilusões, flutuação emocional.",
    lifeArea: "Carreira (sucesso público), a psique, o misticismo, a reputação.",
    thematicCard: "32. A Lua",
    mesaRealInterpretation: "Revela os desejos profundos da alma e o reconhecimento que receberá.",
  },
  {
    id: 33,
    name: "A Chave",
    centralMeaning: "Soluções, abertura de portas, respostas definitivas, saída de crises.",
    lifeArea: "Resolução de problemas, saídas estratégicas, o poder de decidir.",
    thematicCard: "33. A Chave",
    mesaRealInterpretation: "Mostra onde o consulente tem o controle absoluto e a resposta nas mãos.",
  },
  {
    id: 34,
    name: "Os Peixes",
    centralMeaning: "Dinheiro, bens materiais, fluxo financeiro, comércio, fertilidade.",
    lifeArea: "Finanças, negócios, lucros, investimentos, multiplicação.",
    thematicCard: "34. Os Peixes",
    mesaRealInterpretation: "A casa do dinheiro por excelência; indica como anda o fluxo financeiro.",
  },
  {
    id: 35,
    name: "A Âncora",
    centralMeaning: "Estabilidade, segurança a longo prazo, trabalho fixo, apego excessivo.",
    lifeArea: "Carreira estável, porto seguro, contratos de longo prazo, rigidez.",
    thematicCard: "35. A Âncora",
    mesaRealInterpretation: "Mostra o que sustenta o consulente ou onde ele está preso por comodismo.",
  },
  {
    id: 36,
    name: "A Cruz",
    centralMeaning: "O destino, provações necessárias, karma, vitória após o sacrifício.",
    lifeArea: "Lições espirituais profundas, fardos, final do caminho, fé testada.",
    thematicCard: "36. A Cruz",
    mesaRealInterpretation: "Indica o maior fardo atual do consulente, mas também o seu ponto de vitória final.",
  },
];

export function getMeanings(): SymbolMeaning[] {
  return meanings;
}

export function getMeaningById(id: number): SymbolMeaning | undefined {
  return meanings.find((m) => m.id === id);
}

export function getMeaningByName(name: string): SymbolMeaning | undefined {
  return meanings.find((m) => m.name.toLowerCase() === name.toLowerCase());
}
