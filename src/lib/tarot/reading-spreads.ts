// fallow-ignore-file unused-file
export interface ReadingSpreadPosition {
  index: number;
  name: string;
  namePt: string;
  meaning: string;
  meaningPt: string;
  question?: string;
  questionPt?: string;
}

export interface ReadingSpread {
  id: string;
  name: string;
  namePt: string;
  description: string;
  descriptionPt: string;
  category: 'quick' | 'general' | 'love' | 'career' | 'spiritual' | 'detailed';
  positions: ReadingSpreadPosition[];
  totalCards: number;
}

const SINGLE_CARD: ReadingSpread = {
  id: 'single-card',
  name: 'Single Card',
  namePt: 'Carta Única',
  description: 'A quick insight from one card for immediate guidance.',
  descriptionPt: 'Uma visão rápida de uma carta para orientação imediata.',
  category: 'quick',
  totalCards: 1,
  positions: [
    { index: 0, name: 'The Card', namePt: 'A Carta', meaning: 'Your guidance for the moment.', meaningPt: 'Sua orientação para o momento.', question: 'What do I need to know right now?', questionPt: 'O que preciso saber agora?' },
  ],
};

const THREE_CARD: ReadingSpread = {
  id: 'three-card',
  name: 'Three Card',
  namePt: 'Três Cartas',
  description: 'Past, present, and future — a fundamental reading.',
  descriptionPt: 'Passado, presente e futuro — uma leitura fundamental.',
  category: 'general',
  totalCards: 3,
  positions: [
    { index: 0, name: 'Past', namePt: 'Passado', meaning: 'What has led to this moment.', meaningPt: 'O que levou a este momento.', question: 'What from my past influences this situation?', questionPt: 'O que do meu passado influencia esta situação?' },
    { index: 1, name: 'Present', namePt: 'Presente', meaning: 'Current energies at play.', meaningPt: 'Energias atuais em jogo.', question: 'What is happening now?', questionPt: 'O que está acontecendo agora?' },
    { index: 2, name: 'Future', namePt: 'Futuro', meaning: 'What is developing ahead.', meaningPt: 'O que está se desenvolvendo à frente.', question: 'What is unfolding for me?', questionPt: 'O que está se desdobrando para mim?' },
  ],
};

const YES_NO: ReadingSpread = {
  id: 'yes-no',
  name: 'Yes or No',
  namePt: 'Sim ou Não',
  description: 'A direct answer for clear-cut questions.',
  descriptionPt: 'Uma resposta direta para perguntas claras.',
  category: 'quick',
  totalCards: 1,
  positions: [
    { index: 0, name: 'Answer', namePt: 'Resposta', meaning: 'Clear yes or no guidance.', meaningPt: 'Orientação clara de sim ou não.' },
  ],
};

const LOVE_SPREAD: ReadingSpread = {
  id: 'love-spread',
  name: 'Love Spread',
  namePt: 'Distribuição do Amor',
  description: 'Seven cards exploring love, relationships, and connection.',
  descriptionPt: 'Sete cartas explorando amor, relacionamentos e conexão.',
  category: 'love',
  totalCards: 7,
  positions: [
    { index: 0, name: 'You', namePt: 'Você', meaning: 'Your heart and current state.', meaningPt: 'Seu coração e estado atual.' },
    { index: 1, name: 'Them', namePt: 'Ele/Ela', meaning: 'The other person\'s heart.', meaningPt: 'O coração da outra pessoa.' },
    { index: 2, name: 'The Bond', namePt: 'O Vínculo', meaning: 'The connection between you.', meaningPt: 'A conexão entre vocês.' },
    { index: 3, name: 'Strengths', namePt: 'Pontos Fortes', meaning: 'What strengthens this relationship.', meaningPt: 'O que fortalece este relacionamento.' },
    { index: 4, name: 'Challenges', namePt: 'Desafios', meaning: 'Obstacles to overcome together.', meaningPt: 'Obstáculos a vencer juntos.' },
    { index: 5, name: 'Hidden', namePt: 'Oculto', meaning: 'What lies beneath the surface.', meaningPt: 'O que está por baixo da superfície.' },
    { index: 6, name: 'Outcome', namePt: 'Resultado', meaning: 'Where this is heading.', meaningPt: 'Para onde isso está indo.' },
  ],
};

const CAREER_SPREAD: ReadingSpread = {
  id: 'career-spread',
  name: 'Career Spread',
  namePt: 'Distribuição de Carreira',
  description: 'Five cards for professional guidance and work decisions.',
  descriptionPt: 'Cinco cartas para orientação profissional e decisões de trabalho.',
  category: 'career',
  totalCards: 5,
  positions: [
    { index: 0, name: 'Current Situation', namePt: 'Situação Atual', meaning: 'Your professional standing now.', meaningPt: 'Sua posição profissional agora.' },
    { index: 1, name: 'Challenge', namePt: 'Desafio', meaning: 'What blocks your progress.', meaningPt: 'O que bloqueia seu progresso.' },
    { index: 2, name: 'Hidden Factor', namePt: 'Fator Oculto', meaning: 'What you may not see.', meaningPt: 'O que você pode não estar vendo.' },
    { index: 3, name: 'Advice', namePt: 'Conselho', meaning: 'What you should do.', meaningPt: 'O que você deveria fazer.' },
    { index: 4, name: 'Potential Outcome', namePt: 'Resultado Potencial', meaning: 'What awaits if you follow guidance.', meaningPt: 'O que aguarda se seguir a orientação.' },
  ],
};

const SPIRITUAL_SPREAD: ReadingSpread = {
  id: 'spiritual-spread',
  name: 'Spiritual Path',
  namePt: 'Caminho Espiritual',
  description: 'Seven cards for spiritual guidance and inner journey.',
  descriptionPt: 'Sete cartas para orientação espiritual e jornada interior.',
  category: 'spiritual',
  totalCards: 7,
  positions: [
    { index: 0, name: 'Current Path', namePt: 'Caminho Atual', meaning: 'Where you are on your journey.', meaningPt: 'Onde você está em sua jornada.' },
    { index: 1, name: 'Root Issue', namePt: 'Questão Central', meaning: 'The core spiritual lesson.', meaningPt: 'A lição espiritual central.' },
    { index: 2, name: 'Shadow Aspect', namePt: 'Aspecto Sombra', meaning: 'What you need to integrate.', meaningPt: 'O que você precisa integrar.' },
    { index: 3, name: 'Divine Support', namePt: 'Apoio Divino', meaning: 'Spiritual allies helping you.', meaningPt: 'Aliados espirituais te ajudando.' },
    { index: 4, name: 'Challenge', namePt: 'Prova', meaning: 'The test on your path.', meaningPt: 'A prova no seu caminho.' },
    { index: 5, name: 'Gift', namePt: 'Dom', meaning: 'The gift you will receive.', meaningPt: 'O dom que você receberá.' },
    { index: 6, name: 'Destiny', namePt: 'Destino', meaning: 'Your spiritual purpose.', meaningPt: 'Seu propósito espiritual.' },
  ],
};

const YEAR_SPREAD: ReadingSpread = {
  id: 'year-spread',
  name: 'Year Spread',
  namePt: 'Distribuição do Ano',
  description: 'Twelve cards representing each month for annual guidance.',
  descriptionPt: 'Doze cartas representando cada mês para orientação anual.',
  category: 'detailed',
  totalCards: 12,
  positions: [
    { index: 0, name: 'January', namePt: 'Janeiro', meaning: 'Energy and theme for January.', meaningPt: 'Energia e tema para janeiro.' },
    { index: 1, name: 'February', namePt: 'Fevereiro', meaning: 'Energy and theme for February.', meaningPt: 'Energia e tema para fevereiro.' },
    { index: 2, name: 'March', namePt: 'Março', meaning: 'Energy and theme for March.', meaningPt: 'Energia e tema para março.' },
    { index: 3, name: 'April', namePt: 'Abril', meaning: 'Energy and theme for April.', meaningPt: 'Energia e tema para abril.' },
    { index: 4, name: 'May', namePt: 'Maio', meaning: 'Energy and theme for May.', meaningPt: 'Energia e tema para maio.' },
    { index: 5, name: 'June', namePt: 'Junho', meaning: 'Energy and theme for June.', meaningPt: 'Energia e tema para junho.' },
    { index: 6, name: 'July', namePt: 'Julho', meaning: 'Energy and theme for July.', meaningPt: 'Energia e tema para julho.' },
    { index: 7, name: 'August', namePt: 'Agosto', meaning: 'Energy and theme for August.', meaningPt: 'Energia e tema para agosto.' },
    { index: 8, name: 'September', namePt: 'Setembro', meaning: 'Energy and theme for September.', meaningPt: 'Energia e tema para setembro.' },
    { index: 9, name: 'October', namePt: 'Outubro', meaning: 'Energy and theme for October.', meaningPt: 'Energia e tema para outubro.' },
    { index: 10, name: 'November', namePt: 'Novembro', meaning: 'Energy and theme for November.', meaningPt: 'Energia e tema para novembro.' },
    { index: 11, name: 'December', namePt: 'Dezembro', meaning: 'Energy and theme for December.', meaningPt: 'Energia e tema para dezembro.' },
  ],
};

const CROSS_CHOICE: ReadingSpread = {
  id: 'cross-choice',
  name: 'Cross of Choice',
  namePt: 'Cruz de Escolha',
  description: 'Four cards forming a cross to compare options.',
  descriptionPt: 'Quatro cartas formando uma cruz para comparar opções.',
  category: 'general',
  totalCards: 4,
  positions: [
    { index: 0, name: 'Option A', namePt: 'Opção A', meaning: 'Characteristics of choice A.', meaningPt: 'Características da opção A.' },
    { index: 1, name: 'Option B', namePt: 'Opção B', meaning: 'Characteristics of choice B.', meaningPt: 'Características da opção B.' },
    { index: 2, name: 'Foundation', namePt: 'Fundação', meaning: 'The context affecting both choices.', meaningPt: 'O contexto afetando ambas as escolhas.' },
    { index: 3, name: 'Advice', namePt: 'Conselho', meaning: 'Which path to choose.', meaningPt: 'Qual caminho seguir.' },
  ],
};

const ELEMENTAL_SPREAD: ReadingSpread = {
  id: 'elemental-spread',
  name: 'Elemental Spread',
  namePt: 'Distribuição Elemental',
  description: 'Five cards aligned with the elements for harmony.',
  descriptionPt: 'Cinco cartas alinhadas aos elementos para harmonia.',
  category: 'spiritual',
  totalCards: 5,
  positions: [
    { index: 0, name: 'Fire', namePt: 'Fogo', meaning: 'Passion, courage, and transformation.', meaningPt: 'Paixão, coragem e transformação.' },
    { index: 1, name: 'Water', namePt: 'Água', meaning: 'Emotion, intuition, and flow.', meaningPt: 'Emoção, intuição e fluidez.' },
    { index: 2, name: 'Air', namePt: 'Ar', meaning: 'Thought, communication, clarity.', meaningPt: 'Pensamento, comunicação e clareza.' },
    { index: 3, name: 'Earth', namePt: 'Terra', meaning: 'Stability, abundance, manifestation.', meaningPt: 'Estabilidade, abundância e manifestação.' },
    { index: 4, name: 'Spirit', namePt: 'Espírito', meaning: 'Connection to the divine.', meaningPt: 'Conexão com o divino.' },
  ],
};

const MINORITY_REMEDY: ReadingSpread = {
  id: 'minority-remedy',
  name: 'Minority Remedy',
  namePt: 'Remédio do Minoritário',
  description: 'Five cards from Orixá tradition for guidance.',
  descriptionPt: 'Cinco cartas da tradição dos Orixás para orientação.',
  category: 'spiritual',
  totalCards: 5,
  positions: [
    { index: 0, name: 'Current Situation', namePt: 'Situação Atual', meaning: 'The present state of affairs.', meaningPt: 'O estado atual das coisas.' },
    { index: 1, name: 'Root Cause', namePt: 'Causa Raiz', meaning: 'The underlying issue.', meaningPt: 'A questão subjacente.' },
    { index: 2, name: 'Guidance', namePt: 'Orientação', meaning: 'The spiritual guidance forward.', meaningPt: 'A orientação espiritual.' },
    { index: 3, name: 'Action', namePt: 'Ação', meaning: 'What should be taken or avoided.', meaningPt: 'O que deve ser feito ou evitado.' },
    { index: 4, name: 'Outcome', namePt: 'Resultado', meaning: 'The expected result.', meaningPt: 'O resultado esperado.' },
  ],
};

const MANIFESTATION_SPREAD: ReadingSpread = {
  id: 'manifestation-spread',
  name: 'Manifestation Spread',
  namePt: 'Distribuição de Manifestação',
  description: 'Seven cards to clarify and manifest intentions.',
  descriptionPt: 'Sete cartas para esclarecer e manifestar intenções.',
  category: 'spiritual',
  totalCards: 7,
  positions: [
    { index: 0, name: 'Intention', namePt: 'Intenção', meaning: 'What you truly desire.', meaningPt: 'O que você realmente deseja.' },
    { index: 1, name: 'Desire', namePt: 'Desejo', meaning: 'The emotional driving force.', meaningPt: 'A força emocional por trás.' },
    { index: 2, name: 'Belief', namePt: 'Crença', meaning: 'Current belief supporting or blocking.', meaningPt: 'Crença atual que apoia ou bloqueia.' },
    { index: 3, name: 'Action', namePt: 'Ação', meaning: 'Steps required to move forward.', meaningPt: 'Passos necessários para avançar.' },
    { index: 4, name: 'Obstacle', namePt: 'Obstáculo', meaning: 'What may stand in the way.', meaningPt: 'O que pode estar no caminho.' },
    { index: 5, name: 'Resource', namePt: 'Recurso', meaning: 'What you have to support you.', meaningPt: 'O que você tem para te apoiar.' },
    { index: 6, name: 'Fulfillment', namePt: 'Realização', meaning: 'The outcome when aligned.', meaningPt: 'O resultado quando alinhado.' },
  ],
};

const spreads: ReadingSpread[] = [
  SINGLE_CARD,
  YES_NO,
  THREE_CARD,
  CROSS_CHOICE,
  LOVE_SPREAD,
  CAREER_SPREAD,
  SPIRITUAL_SPREAD,
  MINORITY_REMEDY,
  ELEMENTAL_SPREAD,
  MANIFESTATION_SPREAD,
  YEAR_SPREAD,
];

export function getSpreads(): ReadingSpread[] {
  return spreads;
}

export function getSpreadById(id: string): ReadingSpread | undefined {
  return spreads.find((s) => s.id === id);
}

export function getSpreadsByCategory(category: ReadingSpread['category']): ReadingSpread[] {
  return spreads.filter((s) => s.category === category);
}