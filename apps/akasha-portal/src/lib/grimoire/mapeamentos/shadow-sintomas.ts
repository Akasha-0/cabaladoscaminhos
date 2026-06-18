/**
 * mapeamentos/shadow-sintomas.ts
 *
 * Curated shadow symptom translations for buildShadowSymptoms().
 * Each entry is 2-3 sentences, 2nd person, specific, with one actionable awareness cue.
 * Source: traditional astrology, Kabbalah, Ifá.
 *
 * Used by: area-builders.ts :: buildShadowSymptoms()
 */
import type { SynthesizedPrimitivo } from '@akasha/core';

// ─── Saturn shadow by sign ─────────────────────────────────────────────────

/**
 * Saturn = limit, structure, patience, karma. Cada signo colore
 * o modo específico como a lição de Saturno se manifesta na sombra.
 * Fonte: astrologia tradicional (Brennan 2017; Carter Encyc. 1973)
 */
export const SHADOW_BY_SATURNO_SIGN: Record<string, string> = {
  Touro:
    'Você resiste a mudanças estruturais mesmo quando são necessárias — o conforto do familiar se torna prisão. A sombra de Saturno em Touro é a teimosia que parece disciplina mas é medo de perder o que foi construído.',
  Carneiro:
    'Você impõe limites de forma abrupta ou os ignora completamente — não há meio termo visível. A sombra de Saturno em Carneiro é o tirano interno que ou controla tudo ou entrega o controle a outros.',
  Gêmeos:
    'Você cristaliza a comunicação em dogma ou a dispersa em superfície — ninguém entende onde você realmente está. A sombra de Saturno em Gêmeos é a mente que ou se fecha em certezas ou foge em ideias sem profundidade.',
  Cancer:
    'Você protege tanto que isola, ou abre tanto que se esvazia — o guardião vira carcereiro emocional. A sombra de Saturno em Cancer é a família como chains: devoção que sufoca ou medo de intimidade que paralisa.',
  Leão: 'Você exige reconhecimento mas teme o palco — o brilho que busca vira fardo. A sombra de Saturno em Leão é o orgulho que precisa de platéia e colapsa quando sozinho.',
  Virgem:
    'Você critica até a excelência ou se perde em detalhes que substituem a decisão — a mente vira inimiga. A sombra de Saturno em Virgem é a autocrítica que se passa por precisão mas destrói antes de criar.',
  Libra:
    'Você adia decisões por medo de injustiça ou as toma por medo de conflito — a balança nunca equilibra. A sombra de Saturno em Libra é a indecisão crônica que se disfarça de ponderação.',
  Escorpião:
    'Você transforma intimidade em controle ou a evita por medo de manipulação — a profundidade vira campo de guerra. A sombra de Saturno em Escorpião é o controle que se passa por intensidade mas destrói o que toca.',
  Sagitário:
    'Você dogmatiza crenças ou abandona toda estrutura de significado — a filosofia vira fuga. A sombra de Saturno em Sagitário é o guru interno que ou prega demais ou abandona toda crença por medo de estar errado.',
  Capricórnio:
    'Você escala por medo de fracasso ou desiste antes de começar por medo de sucesso — a ambição congela. A sombra de Saturno em Capricórnio é o sucesso que parece conquista mas é compulsão de provar valor próprio.',
  Aquário:
    'Você se distancia emocionalmente em nome da liberdade ou se perde na rebeldia sem causa — o individualismo vira isolamento. A sombra de Saturno em Aquário é o originals que se destaca do grupo mas não sabe existir sozinho.',
  Peixes:
    'Você dissolve limites por compaixão ou se fecha em fantasia por medo da realidade — o transcendente vira escape. A sombra de Saturno em Peixes é o sacrifício que se passa por espiritualidade mas é medo de habitar o mundo.',
};

// ─── Pluto shadow by sign ─────────────────────────────────────────────────

/**
 * Pluto = transformation, power, control, rebirth. Cada signo indica
 * o domínio específico onde a transformação forçada opera na sombra.
 * Fonte: astrologia arquetípica (Tarnas 2006; Brennan 2017)
 */
export const SHADOW_BY_PLUTO_SIGN: Record<string, string> = {
  Touro:
    'Você se agarra a posses e valores materiais por medo de perda total — o que possui começa a possuí-lo. A sombra de Plutão em Touro é a obsessão por segurança que rouba a capacidade de participar da vida.',
  Carneiro:
    'Você força a passagem sem preparar o terreno ou paralisa diante da resistência — a energia de Touro queima sem direção. A sombra de Plutão em Carneiro é a impulsão que se passa por coragem mas é medo de reflexão.',
  Gêmeos:
    'Você distorce informação para controlar narrativas ou se perde em teorias sem chão — o conhecimento vira arma. A sombra de Plutão em Gêmeos é a manipulação intelectual que se passa por astúcia mas é medo de vulnerabilidade.',
  Cancer:
    'Você manipula através de culpa emocional ou se desintegra diante do poder alheio — o passado vira prisão. A sombra de Plutão em Cancer é a maternagem que sufoca ou o abandono que se disfarça de proteção.',
  Leão: 'Você exige ser tratado como especial ou se sente destruído por qualquer crítica — o ego vira campo de batalha. A sombra de Plutão em Leão é a necessidade de ser visto que destrói a capacidade de existir sem platéia.',
  Virgem:
    'Você destrói pela crítica do detalhe ou se perde em análise que substitui a ação — a perfeição vira paralisia. A sombra de Plutão em Virgem é o diagnóstico que se passa por precisão mas é medo de participar do mundo.',
  Libra:
    'Você destrói através da indecisão forçada ou se submete a poderes desiguais — a parceria vira guerra fria. A sombra de Plutão em Libra é a chantagem emocional que se passa por equilíbrio mas é medo de conflito.',
  Escorpião:
    'Você destrói para reconstruir ou destrói sem propósito — a intensidade vira autodestruição. A sombra de Plutão em Escorpião é o controle que se passa por profundidade mas é medo de ser superado.',
  Sagitário:
    'Você impõe sua verdade como dogma ou abandona toda crença por medo de estar errado — o significado vira prisão. A sombra de Plutão em Sagitário é o proselitismo que se passa por expansão mas é medo de não ter razão.',
  Capricórnio:
    'Você escala a qualquer custo ou desiste da ambição por medo de queda — o poder vira tirania. A sombra de Plutão em Capricórnio é a ambição que se passa por visão mas é medo de ser comum.',
  Aquário:
    'Você destrói tradições por shock value ou se aliena do grupo por medo de conformismo — o originals vira isolamento. A sombra de Plutão em Aquário é a rebelião sem causa que se passa por liberdade mas é medo de pertencer.',
  Peixes:
    'Você dissolve a si mesmo em grupos ou se perde em fantasia — o transcendente vira fuga. A sombra de Plutão em Peixes é a dissolução que se passa por espiritualidade mas é medo de existir como indivíduo.',
};

// ─── Karmic debt shadow by number ─────────────────────────────────────────

/**
 * Dívida kármica = padrão não resolvido em vidas anteriores.
 * Número indica a área de vida onde o padrão se manifesta.
 * Fonte: numerologia cabalística (Bailey 1928; Castillo 1995)
 */
export const SHADOW_BY_KARMIC_DEBT: Record<number, string> = {
  0: 'Você carrega uma dívida kármica indeterminada — o padrão exato não é legível pelos mapas numéricos. A única via é observar onde a vida insiste em repetir situações sem razão aparente.',
  1: 'Você carrega a dívida de não ter assertado sua vontade própria — repete o padrão de se diminuirem diante de outros. Quando você fala o que quer, sente culpa desproporcional.',
  2: 'Você carrega a dívida de ter usado relações para manipulação emocional — repete o padrão de criar dependência nos outros. A intimidade verdadeira assusta porque no passado foi usada como arma.',
  3: 'Você carrega a dívida de ter calado sua expressão criativa por medo de ridículo — repete o padrão de guardar sua voz. Quando tenta criar, a crítica interna paralisa antes de começar.',
  4: 'Você carrega a dívida de ter construído sobre fundações falsas — repete o padrão de apressar a estrutura por medo de escassez. O trabalho nunca parece seguro o suficiente para parar.',
  5: 'Você carrega a dívida de ter perseguido liberdade às custas de outros — repete o padrão de desaparecer antes do compromisso. A mudança constante se passa por crescimento mas é fuga de profundidade.',
  6: 'Você carrega a dívida de ter assumido responsabilidades que não eram suas — repete o padrão de se sacrificar por obrigação. A culpa de dizer não é desproporcional porque no passado a recusa teve consequências severas.',
  7: 'Você carrega a dívida de ter ensino superficial que afastou outros da verdade — repete o padrão de ensinar antes de viver. A sabedoria é intelectual mas não toca a vida — você sabe muito e vive pouco.',
  8: 'Você carrega a dívida de ter usado poder para dominação — repete o padrão de ou dominar ou se submeter. A autoridade assusta porque no passado foi usada como arma contra você.',
  9: 'Você carrega a dívida de ter ignorado o chamado ao serviço — repete o padrão de usar sua inteligência para fins egoístas. A compaixão é seletiva porque dar sem receber parece perda.',
};

// ─── Challenge number shadow ─────────────────────────────────────────────

/**
 * Desafio principal =弱点 que se repete até ser integrado conscientemente.
 * Fonte: numerologia (Parker 2000; Castillo 1995)
 */
export const SHADOW_BY_CHALLENGE: Record<number, string> = {
  0: 'O desafio principal não está claramente definido — o número indica um caminho de integração completa que ainda não emergiu. Observe onde a vida exige que você seja maior do que сейчас você acredita ser.',
  1: 'O desafio de ser demasiado independente — você ou faz tudo sozinho (exaustão) ou rejeita toda ajuda (isolamento). O meio-termo de pedir colaboração consciente ainda não foi aprendido.',
  2: 'O desafio de oscilação entre extremos — você ou se funde no outro ou recusa toda conexão. A interdependência madura exige que você exista como separado e conectado ao mesmo tempo.',
  3: 'O desafio de dispersão criativa — você ou não começa por medo de crítica ou começa muitos projetos sem terminar nenhum. A autoexpressão autêntica ainda provoca vergonha desproporcional.',
  4: 'O desafio de rigidez disfarçada de disciplina — você ou se prende a estruturas que não funcionam ou as destrói prematuramente. A flexibilidade estrutural ainda se confunde com ausência de princípios.',
  5: 'O desafio de liberdade como fuga — você ou muda constantemente para não enfrentar a raiz ou se prende ao que conhece por medo do novo. A liberdade responsável ainda não foi integrada.',
  6: 'O desafio de responsabilidade excessiva — você ou assume o que não é seu (exaustão) ou rejeita toda responsabilidade (infantilismo). O cuidado maduro exige saber o que é seu e o que é dos outros.',
  7: 'O desafio de mente contra coração — você ou pensa demais sem agir ou age sem pensar. A fé que integra mente e intuição ainda se confunde com racionalismo ou superstição.',
  8: 'O desafio de medo de poder — você ou abusa do poder que tem ou abre mão dele antes de ser ameaçado. A autoridade que serve ainda se confunde com dominação ou submissão.',
  9: 'O desafio de detachment forçado — você ou se desliga antes de ser ferido (friagem) ou se entrega ao ponto de se perder. O altruísmo que preserva o self ainda não foi aprendido.',
};

// ─── Odu prohibition shadow ───────────────────────────────────────────────

/**
 * Proibições do Odu de nascimento geram tensão quando transgredidas
 * ou quando obedecidas sem compreensão.
 * Fonte: Ifá tradicional (Verger 1973; Badaru 2019)
 */
export const SHADOW_BY_ODU_PROHIBITION: Record<string, string> = {
  alimentos:
    'Você repete padrões de relacionamento com consumo que não são seus — o corpo guarda memórias que a mente esqueceu. Observe qual comida ativa o ciclo de culpa e repetição.',
  carnear:
    'Você destrói o que poderia nutrir ou se impede de agir quando ação é necessária — a linha entre violência e assertividade ainda está turva.',
  bebidas:
    'Você ou abusa de escapes (álcool, drogas, tela) ou se nega qualquer prazer com rigor que paralisa. O caminho do meio ainda parece fraqueza.',
  viajar:
    'Você foge da estabilidade ou se prende a lugar e relações que já deveriam ter sido deixados para trás. A decisão de partir ou ficar ainda vem do medo, não da clareza.',
  conflito:
    'Você evita confrontos necessários ou os inicia quando já passou da hora — a assertividade que respeita o outro e a si mesmo ainda não foi aprendida.',
  casamento:
    'Você se entrega completamente antes de conhecer o outro ou se recusa a compromisso por medo de perda. A intimidade que permite duas pessoas inteiras ainda assusta.',
  noite:
    'Você inverte seu ciclo natural por medo de descansar ou se permite inação que vira paralisia. O descanso produtivo ainda se confunde com preguiça ou exaustão.',
  agua: 'Você se afoga em emoções que não processa ou se desidrata emocionalmente por medo de sentir. A capacidade de fluir com a emoção — sem ser奴 dela — ainda está sendo desenvolvida.',
  fogo: 'Você queima bridges antes de precisar atravessá-las ou permite que outros te queimem sem defesa. A capacidade de aqueimar quando necessário e proteger quando preciso ainda não está clara.',
  terra:
    'Você se prende ao que já morreu ou se desvia de tudo que tem raízes. A habilidade de estar enraizado sem estar preso ainda não foi integrada.',
  palavras:
    'Você fala sem pensar ou se cala quando a palavra certa poderia mudar tudo. A palavra que cura em vez de ferir ainda está sendo aprendida.',
  silencio:
    'Você preenche o silêncio por medo do vazio ou se cala quando falar seria libertador. O silêncio que comunica mais do que palavras ainda não foi dominado.',
  sexo: 'Você usa sexo para controlar ou se recusa a ele por medo de intimidade — a sexualidade criativa que une prazer e propósito ainda gera confusão.',
  morte:
    'Você foge de finais ou se agarra a eles quando já passaram. A capacidade de morrer para renascer — emocionalmente — ainda é a lição mais difícil.',
  initiacao:
    'Você teme compromissos profundos que exigem transformação ou se lança neles sem preparar o terreno. O rito de passagem que muda a estrutura sem destruir a essência ainda não foi feito.',
  comercio:
    'Você explora ou é explorado em trocas — a reciprocidade que honra seu valor e o do outro ainda não está clara.',
  jogo: 'Você arrisca sem cálculo ou se recusa a qualquer risco por medo de perder. A audácia calculada ainda se confunde com temeridade ou covardia.',
  fe: 'Você tem fé cega que desarma o discernimento ou nenhuma fé que desarma a capacidade de confiar. A fé que sustenta sem cegar ainda está sendo descoberta.',
};

// ─── Primitivo sombra → frase curada ─────────────────────────────────────

/**
 * Traduz um primitivo sombra (do synthesizePrimitives) em frase curada.
 * Fonte: mapeamentos/core + synthesizePrimitives (mapeamentos/index.ts)
 */
export function shadowPrimtivoFrase(s: SynthesizedPrimitivo): string {
  const m = s.magnitude;
  const nivel = m >= 8 ? 'intenso' : m >= 5 ? 'moderado' : 'leve';
  return (
    'Sombra ' +
    nivel +
    ' de ' +
    s.primitivo +
    ' — ' +
    (PRIMITIVO_SHADOW_INVESTIGATION[s.primitivo] ?? 'observe onde este eixo opera na distorção')
  );
}

const PRIMITIVO_SHADOW_INVESTIGATION: Record<string, string> = {
  Transformação:
    'você força mudanças antes da hora ou resiste quando a transformação é necessária — a única forma de romper é aceitar que o ciclo existe',
  Expansão:
    'você expande sem fundamento ou se contrai por medo de perder o que tem — a abundância real exige que você plante antes de colher',
  Ordem:
    'você organiza para controlar ou desorganiza por medo de estruturas — a ordem que serve em vez de aprisionar ainda está sendo aprendida',
  Expressão:
    'você se expressa para impressionar ou se cala por medo de exposição — a expressão que comunica sem precisar ser validado ainda não flui',
  Amor: 'você ama para possuir ou se retrai por medo de perda — o amor que liberta em vez de prender ainda provoca resistência',
  Poder:
    'você domina para não ser dominado ou abre mão de poder antes de ser ameaçado — o poder que serve em vez de controlar ainda é desafiador',
  Sabedoria:
    'você sabe demais e vive de menos ou vive sem reflexão por medo de descobrir algo que mude tudo — a sabedoria que integra mente e experiência ainda está sendo construída',
  Movimento:
    'você se move para fugir ou congela por medo de escolher a direção errada — o movimento que é escolha consciente ainda não é natural',
  Serviço:
    'você serve para ser necesitado ou se recusa a servir por medo de ser usado — o serviço que honra o outro e preserva o self ainda está sendo aprendido',
  Materialização:
    'você manifesta por angústia de carência ou se desliga da matéria por medo de materialismo — a manifestação que nasce do alinhamento em vez do medo ainda é rara',
  Intuição:
    'você confunde intuição com fantasia ou ignora a voz interior por medo de estar errado — a intelecção que honra a sabedoria sutil sem perder o discernimento ainda está sendo desenvolvida',
  Conexão:
    'você se conecta para depender ou se isola por medo de fusão — a conexão que permite dois inteiros ainda provoca a mesma resistência que a intimidade',
};
