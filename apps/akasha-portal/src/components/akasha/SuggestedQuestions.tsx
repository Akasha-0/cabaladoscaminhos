'use client';

/**
 * SuggestedQuestions — F-XXX
 *
 * Mostra 3 sugestões de perguntas para o Oráculo baseadas no perfil do usuário.
 * Transforma o Oráculo de "空白" para "guiado".
 *
 * Problema resolvido:
 * - Usuário não sabe o que perguntar
 * - Perguntas genéricas não dão insights úteis
 * - Falta de CTAs claros na página do Oráculo
 */

import { Sparkles, MessageCircle, Heart, Zap, Target } from 'lucide-react';

interface SuggestedQuestionsProps {
  /** Perfil básico do usuário para gerar perguntas relevantes */
  sunSign?: string;
  lifeArea?: 'relacionamentos' | 'trabalho' | 'saude' | 'proposito' | 'financas' | 'espiritualidade';
  onSelectQuestion: (question: string) => void;
  /** Número de sugestões a mostrar (default 3) */
  maxQuestions?: number;
  /** Mostra estado de loading */
  isLoading?: boolean;
}

/**
 * Template de perguntas por área de vida + signo
 *这些问题是基于用户的星座和当前需求生成的
 */
const QUESTION_TEMPLATES: Record<string, {
  prefix: string;
  questions: string[];
}> = {
  relacionamentos: {
    prefix: 'Amor & Conexões',
    questions: [
      'O que devo cultivar no meu relacionamento neste momento?',
      'Como posso demonstrar affection de forma mais autêntica?',
      'Qual aspecto do meu vínculo preciso transformar?',
    ],
  },
  trabalho: {
    prefix: 'Propósito & Carreira',
    questions: [
      'Qual é a energia do dia para minhas decisões profissionais?',
      'Devo iniciar algo novo ou consolidar o que tenho?',
      'Como posso alinhar meu trabalho com meu propósito?',
    ],
  },
  saude: {
    prefix: 'Corpo & Energia',
    questions: [
      'Como está minha energia hoje? O que meu corpo precisa?',
      'Qual prática me ajudaria a sentir mais equilíbrio?',
      'Devo me preservar ou agir com mais intensidade?',
    ],
  },
  proposito: {
    prefix: 'Propósito & Direção',
    questions: [
      'Qual é a lição que o universo quer que eu aprenda agora?',
      'Estou no caminho certo ou preciso ajustar minha direção?',
      'O que está me impedindo de viver meu potencial?',
    ],
  },
  financas: {
    prefix: 'Recursos & Abundância',
    questions: [
      'Como posso abrir espaço para mais abundância hoje?',
      'Devo investir, poupar ou gastar com sabedoria?',
      'Qual crença está bloqueando minha prosperidade?',
    ],
  },
  espiritualidade: {
    prefix: 'Alma & Espiritualidade',
    questions: [
      'Que mensagem minha intuição tem para mim hoje?',
      'Como posso aprofundar minha conexão espiritual?',
      'O que minha alma precisa processar neste momento?',
    ],
  },
};

/** Fallback genérico quando não há perfil */
const GENERIC_QUESTIONS = [
  'O que eu preciso compreender sobre minha situação atual?',
  'Qual é a energia predominante no meu dia hoje?',
  'O que está tentando emergir da minha consciência?',
];

const AREA_ICONS = {
  relacionamentos: Heart,
  trabalho: Target,
  saude: Zap,
  proposito: Sparkles,
  financas: Target,
  espiritualidade: MessageCircle,
};
export function SuggestedQuestions({
  sunSign,
  lifeArea = 'proposito',
  onSelectQuestion,
  maxQuestions = 3,
  isLoading = false,
}: SuggestedQuestionsProps) {
  const template = QUESTION_TEMPLATES[lifeArea] ?? QUESTION_TEMPLATES.proposito;
  const Icon = AREA_ICONS[lifeArea] ?? Sparkles;

  // Se temos dados astrológicos, personalizamos as perguntas
  const questions = sunSign
    ? template.questions.slice(0, maxQuestions)
    : GENERIC_QUESTIONS.slice(0, maxQuestions);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <Icon size={16} style={{ color: '#7C5CFF' }} />
        <span
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: '#A7AECF',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {template.prefix}
        </span>
      </div>

      {/* Sugestões */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
        >
        {isLoading ? (
          [0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(124, 92, 255, 0.05)',
                border: '1px solid rgba(124, 92, 255, 0.1)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            >
              <div style={{ width: 20, height: 12, borderRadius: 4, background: 'rgba(124, 92, 255, 0.2)' }} />
              <div style={{ flex: 1, height: 12, borderRadius: 4, background: 'rgba(124, 92, 255, 0.15)' }} />
            </div>
          ))
        ) : (
        {questions.map((question, index) => (
          <button
            key={index}
            onClick={() => onSelectQuestion(question)}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 14px',
              background: 'rgba(124, 92, 255, 0.08)',
              border: '1px solid rgba(124, 92, 255, 0.2)',
              borderRadius: '10px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(124, 92, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(124, 92, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(124, 92, 255, 0.2)';
            }}
          >
            <span
              style={{
                fontSize: '0.75rem',
                color: '#7C5CFF',
                fontWeight: 600,
                minWidth: '20px',
              }}
            >
              {index + 1}.
            </span>
            <span
              style={{
                fontSize: '0.875rem',
                color: '#E8E0FF',
                lineHeight: 1.4,
                fontFamily: 'var(--font-lora, serif)',
              }}
            >
              {question}
            </span>
          </button>
        ))
        )}
      </div>

      {/* Contexto adicional se temos dados astrológicos */}
      {sunSign && (
        <p
          style={{
            fontSize: '0.7rem',
            color: 'rgba(167, 174, 207, 0.5)',
            fontStyle: 'italic',
            marginTop: '4px',
          }}
        >
          Perguntas personalizadas para {sunSign}
        </p>
      )}
    </div>
  );
}
