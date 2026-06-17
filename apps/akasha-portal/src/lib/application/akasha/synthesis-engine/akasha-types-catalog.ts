/**
 * synthesis-engine/akasha-types-catalog.ts
 *
 * Catálogo dos 9 tipos derivados do Odu familiar + corpo tântrico.
 * Split de synthesis-engine.ts para separar dados de lógica.
 */

import type { AkashaTypeProfile } from './synthesis-types';

/**
 * Base type metadata — sem campos derivados (authority, authorityPractice,
 * dailyDirective, oneLiner) que são calculados em runtime.
 */
const AKASHA_TYPES: Record<string, Omit<AkashaTypeProfile, 'authority' | 'authorityPractice' | 'dailyDirective' | 'oneLiner'>> = {
  catalisador: {
    type: 'catalisador',
    typeName: 'O Catalisador',
    typeIcon: '🔥',
    corePattern: 'Energia de criação e início — você ativa processos apenas pelo fato de estar presente.',
    strategy: 'Inicie antes de estar pronto.',
    strategyDetail: 'Você tem a rara capacidade de pôr fogo em situações estagnadas. Não espere o momento perfeito — o momento perfeito é agora. Sua presença sozinha catalyza reação, mesmo em sistemas resistentes.',
    /** @internal Origem dimensional que contribui mais para este tipo */
    dimensionOrigin: 'Movimento Celeste',
    growthEdge: 'Aprenda a descansar no vazio entre iniciativas. Não tudo precisa ser acelerado.',
    shadowTrap: 'Confundir frenesi com propósito. Agir por medo de ser irrelevante.',
  },
  receptor: {
    type: 'receptor',
    typeName: 'O Receptor',
    typeIcon: '🌊',
    corePattern: 'Energia de receptividade profunda — você capta o que outros emitem sem filtro.',
    strategy: 'Aguarde a resposta antes de agir.',
    strategyDetail: 'Seu poder está em recibir, processar e responder — não em iniciar. Permita que a informação chegue antes de reagir. Você ouve o que ninguém disse.',
    /** @internal Origem dimensional que contribui mais para este tipo */
    dimensionOrigin: 'Resposta Sensorial',
    growthEdge: 'Confie na sua percepção mesmo quando não tem provas concretas. Sua recepção é dados.',
    shadowTrap: 'Aguardar eternamente. Paralisia por excesso de informação não processada.',
  },
  construtor: {
    type: 'construtor',
    typeName: 'O Construtor',
    typeIcon: '🌱',
    corePattern: 'Energia de plantação e cultivo — você transforma esforço diário em estruturas duradouras.',
    strategy: 'Plante sementes; colha amanhã.',
    strategyDetail: 'Grandes resultados vêm de pequenos gestos consistentes. Você não precisa de urgência — precisa de persistência. Cada ação que parece pequena é um tijolo no edificio que ninguém mais consegue ver.',
    /** @internal Origem dimensional que contribui mais para este tipo */
    dimensionOrigin: 'Estrutura Numérica',
    growthEdge: 'Honre o processo visível. Resultados invisíveis ainda são resultados.',
    shadowTrap: 'Comparar sua colheita com a do vizinho. Desistir antes do primeiro broto.',
  },
  transformador: {
    type: 'transformador',
    typeName: 'O Transformador',
    typeIcon: '⚡',
    corePattern: 'Energia de dissolução e renascimento — você dissolve o que não serve para criar espaço ao novo.',
    strategy: 'Destrua o que não serve; renasça.',
    strategyDetail: 'Você vive nos ciclos de fim-e-início. O que precisa morrer não é um fracasso — é libertação. Cada transformação exige que você solte algo que amava, mesmo que só um pouco.',
    /** @internal Origem dimensional que contribui mais para este tipo */
    dimensionOrigin: 'Mutação e Renascimento',
    growthEdge: 'Honre o luto da destruição antes de celebrar o novo. Ambas são sagradas.',
    shadowTrap: 'Destruir por hábito ou por medo de amar. Confundir transformação com fuga.',
  },
  guardiao: {
    type: 'guardiao',
    typeName: 'O Guardião',
    typeIcon: '🛡️',
    corePattern: 'Energia de preservação e sustentabilidade — você mantém vivo o que outros abandonam.',
    strategy: 'Preserve o que importa; proteja sem sufocar.',
    strategyDetail: 'Sua função é sustentar — não permitir que o que foi construído se dissolva. Você é o guardião da memória viva, do elo que não se rompe, da chama que não se apaga. Preservar não é parar de evoluir.',
    /** @internal Origem dimensional que contribui mais para este tipo */
    dimensionOrigin: 'Sustentação Vital',
    growthEdge: 'Proteger é também saber soltar. A preservação que vira prisão não é guardiã.',
    shadowTrap: 'Proteger por medo de perda. Confundir guarda com controle.',
  },
  curador: {
    type: 'curador',
    typeName: 'O Curador',
    typeIcon: '💚',
    corePattern: 'Energia de ponte entre matéria e essência — você traduz o invisível em visível.',
    strategy: 'Conecte essência à matéria.',
    strategyDetail: 'Você tem a capacidade rara de perceber o que algo ou alguém realmente é e tornar isso palpável para os outros. Suas mãos curam porque suas palavras curam. Você é ponte entre o que se sente e o que se diz.',
    /** @internal Origem dimensional que contribui mais para este tipo */
    dimensionOrigin: 'Ponte Matéria-Essência',
    growthEdge: 'Cuide de si antes de cuidar dos outros. A ponte não pode estar deteriorada.',
    shadowTrap: 'Curar os outros para evitar a própria dor. Esquecer que a ponte também precisa de维修.',
  },
  canal: {
    type: 'canal',
    typeName: 'O Canal',
    typeIcon: '📡',
    corePattern: 'Energia de transmissão e escuta cósmica — você conecta frequências acima e abaixo.',
    strategy: 'Transmita; escute antes de falar.',
    strategyDetail: 'Você existe na fronteira entre o que se diz e o que se cala, entre o que é humano e o que é maior. Sua voz é um instrumento de precisão — afine antes de tocar. Quando falar sem escutar primeiro, perde a frequência.',
    /** @internal Origem dimensional que contribui mais para este tipo */
    dimensionOrigin: 'Frequência Akáshica',
    growthEdge: 'Use a escuta como ferramenta, não como refúgio. Falar também é seu trabalho.',
    shadowTrap: 'Falar demais por medo do silêncio. Escutar sem filtrar vaza energia vital.',
  },
  alquimista: {
    type: 'alquimista',
    typeName: 'O Alquimista',
    typeIcon: '⚗️',
    corePattern: 'Energia de transmutação da resistência — você transforma dificuldade em sabedoria pelo simples ato de não resistir.',
    strategy: 'Transforme resistência em ouro.',
    strategyDetail: 'Sua matéria-prima é a dificuldade. Onde outros veem problema, você vê ingrediente. A arte está em não forçar a transformação — em deixar que o calor faça o trabalho. O que te queima é o que te purifica.',
    /** @internal Origem dimensional que contribui mais para este tipo */
    dimensionOrigin: 'Transmutação Consciência',
    growthEdge: 'A resistência que você transmutou precisa ser integrada, não abandonada. O ouro fica.',
    shadowTrap: 'Buscar resistência desnecessária. Criar problemas para sentir que se transforma.',
  },
  arquiteto: {
    type: 'arquiteto',
    typeName: 'O Arquiteto',
    typeIcon: '🏛️',
    corePattern: 'Energia de desenho de sistemas — você cria estruturas que permitem que outros floresçam.',
    strategy: 'Desenhe sistemas que duram.',
    strategyDetail: 'Você não faz o trabalho dos outros — cria o sistema em que o trabalho acontece. Pense em regras, padrões e fundações. O que você desenha hoje será a casa de gerações futuras. Desenhe com humildade — a ruína mais rápida é o orgulho do arquiteto.',
    /** @internal Origem dimensional que contribui mais para este tipo */
    dimensionOrigin: 'Desenho de Sistemas',
    growthEdge: 'Um arquiteto que não habita sua própria criação perde a conexão com o que desenha.',
    shadowTrap: 'Desenhar sem consultar a terra. Sistemas perfeitos para pessoas impossíveis.',
  },
};

export default AKASHA_TYPES;
