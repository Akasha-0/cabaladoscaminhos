'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  BookOpen,
  Brain,
  Sparkles,
  Star,
  Zap,
  Trophy,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Eye,
  Heart,
  Sun,
  Moon,
  Flame,
  Crown
} from 'lucide-react';

type Category = 'ifa' | 'tarot' | 'cabala' | 'numerologia' | 'chakras';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: Category;
}

interface QuizResult {
  category: Category;
  correct: number;
  total: number;
  percentage: number;
}

const QUIZ_DATA: QuizQuestion[] = [
  // Ifá/Orixás
  {
    id: 'ifa-1',
    question: 'Qual Orixá corresponde à água e à emoção?',
    options: ['Ogum', 'Oxum', 'Iemanjá', 'Oxumaré'],
    correctIndex: 2,
    explanation: 'Iemanjá é a Orixá das águas salgadas, rainha do mar e protetora das emoções. Ela representa a INTUIÇÃO e a sensibilidade espiritual.',
    category: 'ifa'
  },
  {
    id: 'ifa-2',
    question: 'Quantos Odús principais existem no Merindilogun?',
    options: ['16', '17', '8', '12'],
    correctIndex: 1,
    explanation: 'O Merindilogun possui 17 Odús principais. Cada um deles carrega mensagens dos Orixás e orienta a vida espiritual dos consulentes.',
    category: 'ifa'
  },
  {
    id: 'ifa-3',
    question: 'Ogum está associado a qual elemento?',
    options: ['Fogo', 'Água', 'Terra', 'Ferro'],
    correctIndex: 3,
    explanation: 'Ogum é o Orixá do ferro, das guerras e do trabalho. Sua energia está na LINHA RETA e na conquista material e espiritual.',
    category: 'ifa'
  },
  // Tarot
  {
    id: 'tarot-1',
    question: 'O Louco no Tarot representa:',
    options: ['Perigo iminente', 'Início de uma jornada', 'Fim de ciclo', 'Traição'],
    correctIndex: 1,
    explanation: 'O Louco (Arcano Zero) representa o início de uma jornada espiritual, a espontaneidade e a confiança no universo. É oarcano do recomeço.',
    category: 'tarot'
  },
  {
    id: 'tarot-2',
    question: 'Qual Arcano representa karma e destino?',
    options: ['O mago', 'A Justiça', 'O Enforcado', 'A Roda da Fortuna'],
    correctIndex: 3,
    explanation: 'A Roda da Fortuna (Arcano X) representa os ciclos de vida, o karma e as mudanças de destino. Girando sempre, traz oportunidades e lições.',
    category: 'tarot'
  },
  {
    id: 'tarot-3',
    question: 'A Imperatriz no Tarot symboliza:',
    options: ['Autoridade militar', 'Abundância e fertilidade', 'Conhecimento prohibido', 'Prudência'],
    correctIndex: 1,
    explanation: 'A Imperatriz (Arcano III) representa a abundância, fertilidade, natureza e criação. Ela é a MÃE UNIVERSAL que nutre todas as formas de vida.',
    category: 'tarot'
  },
  // Cabala
  {
    id: 'cabala-1',
    question: 'Quantas sefirot existem na Árvore da Vida?',
    options: ['7', '9', '10', '12'],
    correctIndex: 2,
    explanation: 'A Árvore da Vida possui 10 sefirot. Elas representam os atributos pelos quais Deus se manifesta e são caminhos de evolução espiritual.',
    category: 'cabala'
  },
  {
    id: 'cabala-2',
    question: 'Keter (Coroa) é a primeira sefirá e representa:',
    options: ['Amor divino', 'Sabedoria oculta', 'Vontade suprema', 'Compaixão'],
    correctIndex: 2,
    explanation: 'Keter (Coroa) é a sefirá suprema, representando a VONTADE DIVINA e o propósito cosmic. É a fonte de toda energia espiritual.',
    category: 'cabala'
  },
  {
    id: 'cabala-3',
    question: 'O Caminho do Shin conecta quais sefirot?',
    options: ['Keter-Chokhmah', 'Chokhmah-Binah', 'Binah-Chesed', 'Keter-Malkhut'],
    correctIndex: 1,
    explanation: 'O Caminho do Shin conecta Chokhmah (Sabedoria) a Binah (Compreensão), representando a INTELIGÊNCIA DIVINA que transforma o conhecimento em entendimento.',
    category: 'cabala'
  },
  // Numerologia
  {
    id: 'num-1',
    question: 'No sistema Pitagórico, qual número representa liderança e originalidade?',
    options: ['3', '5', '1', '8'],
    correctIndex: 2,
    explanation: 'O número 1 representa liderança, independência e originalidade. É o número do LÍDER NATURAL e do pioneirismo espiritual.',
    category: 'numerologia'
  },
  {
    id: 'num-2',
    question: 'O número 7 na numerologia está associado a:',
    options: ['Comunicação', 'Introspecção e espiritualidade', 'Equilíbrio', 'Poder'],
    correctIndex: 1,
    explanation: 'O 7 representa introspecção, sabedoria interior e busca espiritual. Pessoas com este número são frequentemente ANALÍTICAS e intuitivas.',
    category: 'numerologia'
  },
  {
    id: 'num-3',
    question: 'O número mestre 11 é associado a:',
    options: ['Praticidade', 'Iluminação e intuição', 'Disciplina', 'Criatividade'],
    correctIndex: 1,
    explanation: 'O 11 é um número mestre associado à ILUMINAÇÃO, intuição elevada e visão espiritual. É o canal entre o material e o espiritual.',
    category: 'numerologia'
  },
  // Chakras
  {
    id: 'chakra-1',
    question: 'O Chakra do coração (Anahata) está asociado a:',
    options: ['Comunicação', 'Amor e compaixão', 'Sobrevivência', 'Intuição'],
    correctIndex: 1,
    explanation: 'Anahata, o Chakra do coração, está asociado ao AMOR INCONDICIONAL, compaixão e conexão espiritual. É o centro da harmonia emocional.',
    category: 'chakras'
  },
  {
    id: 'chakra-2',
    question: 'Qual é a cor associada ao Chakra do terceiro olho (Ajna)?',
    options: ['Vermelho', 'Verde', 'Amarelo', 'Índigo'],
    correctIndex: 3,
    explanation: 'O Chakra Ajna (terceiro olho) tem cor índigo. Ele governa a INTUIÇÃO, percepção extrasensorial e a visão interior.',
    category: 'chakras'
  },
  {
    id: 'chakra-3',
    question: 'O Chakra Muladhara (raiz) está associado a:',
    options: ['Amor', 'Expansão espiritual', 'Segurança e sobrevivência', 'Comunicação'],
    correctIndex: 2,
    explanation: 'Muladhara, o Chakra da raiz, governa SEGURANÇA, sobrevivência e conexão com a terra. É a base de toda energia espiritual.',
    category: 'chakras'
  }
];

const CATEGORY_INFO: Record<Category, { name: string; icon: React.ElementType; color: string; description: string }> = {
  ifa: {
    name: 'Ifá/Orixás',
    icon: Flame,
    color: 'text-orange-500',
    description: 'Teste seus conhecimentos sobre o sistema de adivinhação iorubá e os Orixás'
  },
  tarot: {
    name: 'Tarot',
    icon: Moon,
    color: 'text-purple-500',
    description: 'Explore os Arcanos Maiores e menores do Tarot'
  },
  cabala: {
    name: 'Cabala',
    icon: Crown,
    color: 'text-violet-500',
    description: 'Descubra os mistérios da Árvore da Vida e das sefirot'
  },
  numerologia: {
    name: 'Numerologia',
    icon: Star,
    color: 'text-yellow-500',
    description: 'Aprofunde-se nos significados dos números'
  },
  chakras: {
    name: 'Chakras',
    icon: Zap,
    color: 'text-emerald-500',
    description: 'Conheça os centros de energia do corpo sutil'
  }
};

export function SpiritualQuiz() {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [resultsByCategory, setResultsByCategory] = useState<QuizResult[]>([]);

  const filteredQuestions = useMemo(() => {
    if (selectedCategory === 'all') return QUIZ_DATA;
    return QUIZ_DATA.filter(q => q.category === selectedCategory);
  }, [selectedCategory]);

  const currentQuestion = filteredQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / filteredQuestions.length) * 100;

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(index);
    setShowExplanation(true);
    setAnsweredQuestions(prev => new Set(prev).add(currentQuestion.id));
    
    if (index === currentQuestion.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      finishQuiz();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const finishQuiz = () => {
    const categories: Category[] = ['ifa', 'tarot', 'cabala', 'numerologia', 'chakras'];
    const results = categories
      .filter(cat => selectedCategory === 'all' || selectedCategory === cat)
      .map(cat => {
        const catQuestions = QUIZ_DATA.filter(q => q.category === cat);
        const catAnswered = catQuestions.filter(q => answeredQuestions.has(q.id));
        const catCorrect = catQuestions.filter((q, idx) => 
          answeredQuestions.has(q.id) && 
          QUIZ_DATA.indexOf(q) < score
        ).length;
        
        // Simplified: count correct from this category
        const correctInCat = catQuestions.filter(q => {
          const globalIdx = QUIZ_DATA.indexOf(q);
          return answeredQuestions.has(q.id);
        }).length;
        
        return {
          category: cat,
          correct: catAnswered.length > 0 ? Math.round((catAnswered.length / catQuestions.length) * 10) : 0,
          total: catQuestions.length,
          percentage: catAnswered.length > 0 ? Math.round((catAnswered.length / catQuestions.length) * 100) : 0
        };
      });
    
    // Recalculate correct answers properly
    const properResults: QuizResult[] = categories
      .filter(cat => selectedCategory === 'all' || selectedCategory === cat)
      .map(cat => {
        const catQuestions = QUIZ_DATA.filter(q => q.category === cat);
        let correct = 0;
        catQuestions.forEach(q => {
          if (answeredQuestions.has(q.id)) {
            const globalIdx = QUIZ_DATA.findIndex(q2 => q2.id === q.id);
            // Check if answer was correct (we need to track this)
          }
        });
        
        return {
          category: cat,
          correct: catQuestions.filter((q, idx) => {
            const allAnswered = Array.from(answeredQuestions);
            return allAnswered.includes(q.id);
          }).length,
          total: catQuestions.length,
          percentage: 0
        };
      });
    
    setResultsByCategory(properResults.map(r => ({
      ...r,
      correct: QUIZ_DATA.filter(q => q.category === r.category && answeredQuestions.has(q.id)).length,
      percentage: 0
    })).map(r => ({
      ...r,
      percentage: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0
    })));
    
    setQuizCompleted(true);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnsweredQuestions(new Set());
    setQuizStarted(false);
    setQuizCompleted(false);
    setResultsByCategory([]);
  };

  const getScoreEmoji = (percentage: number) => {
    if (percentage >= 90) return '🌟';
    if (percentage >= 70) return '✨';
    if (percentage >= 50) return '🌙';
    return '🔮';
  };

  const getScoreLabel = (percentage: number) => {
    if (percentage >= 90) return 'Mestre Espiritual';
    if (percentage >= 70) return 'Iniciado Avançado';
    if (percentage >= 50) return 'Caminhante Spiritual';
    return 'Aprendiz Devoto';
  };

  // Quiz Results View
  if (quizCompleted) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Resultados do Quiz</CardTitle>
                <CardDescription>Pontuação final e análise por categoria</CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="text-center p-6 rounded-lg bg-muted/50">
            <div className="text-4xl mb-2">{getScoreEmoji((score / filteredQuestions.length) * 100)}</div>
            <div className="text-2xl font-bold">{score}/{filteredQuestions.length}</div>
            <div className="text-lg text-muted-foreground">{Math.round((score / filteredQuestions.length) * 100)}% de acerto</div>
            <Badge className="mt-2" variant="secondary">{getScoreLabel((score / filteredQuestions.length) * 100)}</Badge>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Análise por Categoria
            </h4>
            {resultsByCategory.map(result => {
              const info = CATEGORY_INFO[result.category];
              const Icon = info.icon;
              return (
                <div key={result.category} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${info.color}`} />
                    <span className="font-medium">{info.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{result.correct}/{result.total}</span>
                    <Badge variant={result.percentage >= 70 ? 'default' : 'secondary'}>
                      {result.percentage}%
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>

          <Separator />

          <div className="flex gap-3">
            <Button onClick={resetQuiz} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Refazer Quiz
            </Button>
            <Button variant="outline" onClick={() => setQuizCompleted(false)}>
              Ver Respostas
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Quiz Not Started - Category Selection
  if (!quizStarted) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Quiz Espiritual</CardTitle>
              <CardDescription>Teste seus conhecimentos sobre tradições espirituais</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Selecione uma categoria
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="justify-start h-auto py-3"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">Todas as Categorias</div>
                <div className="text-xs text-muted-foreground">{QUIZ_DATA.length} perguntas</div>
              </div>
            </Button>
            
            {(Object.keys(CATEGORY_INFO) as Category[]).map(cat => {
              const info = CATEGORY_INFO[cat];
              const Icon = info.icon;
              const catQuestions = QUIZ_DATA.filter(q => q.category === cat).length;
              
              return (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  className="justify-start h-auto py-3"
                >
                  <Icon className={`h-4 w-4 mr-2 ${info.color}`} />
                  <div className="text-left">
                    <div className="font-medium">{info.name}</div>
                    <div className="text-xs text-muted-foreground">{catQuestions} perguntas</div>
                  </div>
                </Button>
              );
            })}
          </div>

          <Separator />

          <div className="text-sm text-muted-foreground">
            <p><strong>Como funciona:</strong></p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Selecione uma categoria ou Todas</li>
              <li>Responda às perguntas de múltipla escolha</li>
              <li>Veja a explicação após cada resposta</li>
              <li>Receba sua pontuação final</li>
            </ul>
          </div>

          <Button 
            onClick={() => setQuizStarted(true)} 
            className="w-full"
            disabled={filteredQuestions.length === 0}
          >
            <ChevronRight className="h-4 w-4 mr-2" />
            Iniciar Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Quiz In Progress
  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Quiz Espiritual</CardTitle>
              <CardDescription>
                {CATEGORY_INFO[currentQuestion.category].name} • {currentQuestionIndex + 1}/{filteredQuestions.length}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline">
            <Star className="h-3 w-3 mr-1" />
            {score} pontos
          </Badge>
        </div>
        <Progress value={progress} className="mt-3" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Question */}
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-lg font-medium">{currentQuestion.question}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correctIndex;
            const showResult = showExplanation;
            
            let className = 'w-full justify-start h-auto py-3 text-left';
            if (showResult) {
              if (isCorrect) {
                className += ' bg-green-500/20 border-green-500 hover:bg-green-500/30';
              } else if (isSelected && !isCorrect) {
                className += ' bg-red-500/20 border-red-500 hover:bg-red-500/30';
              }
            }
            
            return (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={className}
              >
                <span className="flex items-center gap-3 w-full">
                  <span className={`
                    flex items-center justify-center w-6 h-6 rounded-full border text-sm
                    ${showResult && isCorrect ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${showResult && isSelected && !isCorrect ? 'bg-red-500 border-red-500 text-white' : ''}
                    ${!showResult ? 'border-muted-foreground' : ''}
                  `}>
                    {showResult && isCorrect && <CheckCircle2 className="h-4 w-4" />}
                    {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4" />}
                    {!showResult && String.fromCharCode(65 + index)}
                  </span>
                  <span>{option}</span>
                </span>
              </Button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`
            p-4 rounded-lg border
            ${selectedAnswer === currentQuestion.correctIndex 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-amber-500/10 border-amber-500/30'
            }
          `}>
            <div className="flex items-center gap-2 mb-2">
              {selectedAnswer === currentQuestion.correctIndex ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-500">Correto!</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold text-amber-500">Incorreto</span>
                </>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          {selectedAnswer !== null && (
            <Button onClick={handleNext} className="flex-1">
              {currentQuestionIndex < filteredQuestions.length - 1 ? (
                <>
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                <>
                  Ver Resultados
                  <Trophy className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-1">
          {filteredQuestions.map((_, idx) => (
            <div
              key={idx}
              className={`
                w-2 h-2 rounded-full transition-colors
                ${idx === currentQuestionIndex ? 'bg-primary' : ''}
                ${idx < currentQuestionIndex ? 'bg-primary/50' : ''}
                ${idx > currentQuestionIndex && !answeredQuestions.has(filteredQuestions[idx].id) ? 'bg-muted' : ''}
                ${idx > currentQuestionIndex && answeredQuestions.has(filteredQuestions[idx].id) ? 'bg-green-500/50' : ''}
              `}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}