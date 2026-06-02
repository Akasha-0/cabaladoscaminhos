// fallow-ignore-next-line complexity
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  MessageCircle,
  Send,
  User,
  Bot,
  Sparkles,
  Heart,
  Moon,
  Sun,
  Star,
  Loader2,
  X,
  ChevronDown,
  TrendingUp,
  Zap,
  Clock,
} from 'lucide-react';

// ============================================================
// CHAT THEME TYPES
// ============================================================

export type ChatTheme = 'espiritualidade' | 'rituais' | 'relacionamentos' | 'saude' | 'carreira' | 'crescimento';

interface ChatThemeOption {
  id: ChatTheme;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const CHAT_THEMES: ChatThemeOption[] = [
  {
    id: 'espiritualidade',
    label: 'Espiritualidade',
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-purple-400',
    description: 'Caminho espiritual e práticas',
  },
  {
    id: 'rituais',
    label: 'Rituais',
    icon: <Moon className="w-4 h-4" />,
    color: 'text-blue-400',
    description: 'Rituais e celebrações',
  },
  {
    id: 'relacionamentos',
    label: 'Relacionamentos',
    icon: <Heart className="w-4 h-4" />,
    color: 'text-rose-400',
    description: 'Amor e conexões',
  },
  {
    id: 'saude',
    label: 'Saúde',
    icon: <Star className="w-4 h-4" />,
    color: 'text-emerald-400',
    description: 'Bem-estar e energia vital',
  },
  {
    id: 'carreira',
    label: 'Carreira',
    icon: <Sun className="w-4 h-4" />,
    color: 'text-amber-400',
    description: 'Propósito e sucesso',
  },
  {
    id: 'crescimento',
    label: 'Crescimento',
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-orange-400',
    description: 'Evolução pessoal',
  },
];

// Extended prompt types
interface ExtendedPrompt {
  label: string;
  prompt: string;
  category: 'prayer' | 'meditation' | 'advice' | 'affirmation';
  theme?: ChatTheme;
}

const EXTENDED_GUIDANCE_PROMPTS: ExtendedPrompt[] = [
  {
    label: 'Oração do Dia',
    prompt: 'Preciso de uma oração para hoje',
    category: 'prayer',
    theme: 'espiritualidade',
  },
  {
    label: 'Meditação Guiada',
    prompt: 'Me dê uma meditação para calma',
    category: 'meditation',
    theme: 'espiritualidade',
  },
  {
    label: 'Orientação Espiritual',
    prompt: 'Preciso de orientação para uma decisão',
    category: 'advice',
    theme: 'espiritualidade',
  },
  {
    label: 'Afirmação Positiva',
    prompt: 'Desejo uma afirmação fortalecedora',
    category: 'affirmation',
    theme: 'crescimento',
  },
  {
    label: 'Ritual de Proteção',
    prompt: 'Preciso de um ritual de proteção',
    category: 'prayer',
    theme: 'rituais',
  },
  {
    label: 'Harmonização Energética',
    prompt: 'Ajude-me a harmonizar minha energia',
    category: 'meditation',
    theme: 'saude',
  },
  {
    label: 'Amor e Conexão',
    prompt: 'Preciso de orientação sobre relacionamentos',
    category: 'advice',
    theme: 'relacionamentos',
  },
  {
    label: 'Propósito de Vida',
    prompt: 'Estou buscando meu propósito de vida',
    category: 'advice',
    theme: 'carreira',
  },
];

// ============================================================
// TYPES
// ============================================================

export interface SpiritualGuidanceChatProps {
  userData?: {
    id?: string;
    nome?: string;
    odu?: string;
    orixaRegente?: string;
  };
  className?: string;
  onSendMessage?: (message: string, theme?: ChatTheme) => Promise<string>;
  lunarPhase?: string;
}

export interface GuidanceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  category?: 'prayer' | 'meditation' | 'advice' | 'affirmation';
  theme?: ChatTheme;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateMessageId(): string {
  return `guidance-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// fallow-ignore-next-line complexity
function generateStreamingResponse(prompt: string, userData?: SpiritualGuidanceChatProps['userData'], theme?: ChatTheme): string {
  const lowerPrompt = prompt.toLowerCase();
  
  // Theme-specific responses
  if (theme === 'relacionamentos') {
    return `**Orientação para Relacionamentos** 💕

O universo conspira para seu crescimento emocional. ${userData?.orixaRegente ? `Seu ${userData.orixaRegente} oferece proteção especial neste momento de coração.` : ''}

1. **Honre seus sentimentos** - eles são mensageiros da verdade interior
2. **Cultive a paciência** - o amor verdadeiro não apressa
3. **Pratique a comunicação** - diga o que sente com amor e honestidade

Permita que seu coração seja seu guia, mas use a sabedoria acumulada de suas experiências para navegar relacionamentos com maturidade e respeito.`;
  }
  
  if (theme === 'rituais') {
    return `**Preparação Ritual** 🌙

Os rituais são pontes entre o mundo material e espiritual. ${userData?.odu ? `Seu Odu ${userData.odu} traz sabedoria específica para suas práticas.` : ''}

Para um ritual eficaz:

1. **Purificação** - Banho com ervas sagradas (alecrim, arruda)
2. **Intento** - Defina claramente seu propósito
3. **Elementos** - Incenso, velas, água abençoada
4. **Gratidão** - Agradeça antes de pedir

O momento mais propício é ao amanhecer ou entardecer.`;
  }
  
  if (theme === 'crescimento') {
    return `**Caminho de Crescimento** 🌱

${userData?.nome ? `${userData.nome},` : 'Caminhante,'} sua jornada de evolução é única e sagrada.

Orixá ${userData?.orixaRegente || 'Ancestral'} guia seus passos neste caminho de crescimento.

**Práticas Recomendadas:**
- 🧘 Meditação diária com foco no chakra do coração
- 📝 Journaling espiritual ao amanhecer
- 🙏 Orações de agradecimento
- 🌿 Conexão com natureza

Cada dia traz oportunidade de renovação. Confie no processo.`;
  }
  
  if (lowerPrompt.includes('oração') || lowerPrompt.includes('rezar')) {
    return `**Oração para o Dia** 🙏

*Oxalá, fonte de toda luz,*
*Concede-me sabedoria e paz.*
*Que tuas bênçãos me guiem*
*E em meu coração habitam.*

*Assim seja, com fé e amor.*

${userData?.orixaRegente ? `Esta oração é especialmente poderosa para quem é protegido por ${userData.orixaRegente}.` : 'Repita esta oração três vezes ao amanhecer.'}`;
  }
  
  if (lowerPrompt.includes('meditação') || lowerPrompt.includes('calma')) {
    return `**Meditação de Paz** 🧘

*Sente-se em silêncio*
*Feche os olhos suavemente*
*Respire profundo...*

*Imagine uma luz dourada*
*Descendo sobre sua cabeça*
*Penetrando cada célula*
*Dissolvendo tensões e worries*

*Permaneça neste estado*
*Por cinco minutos minimum*
*Deixando a luz preencher*

*Quando pronto, abra os olhos*
*Lentamente, com gratidão.*

${userData?.odu ? `Esta prática alinha-se com seu Odu ${userData.odu}.` : ''}`;
  }
  
  if (lowerPrompt.includes('orientação') || lowerPrompt.includes('decisão')) {
    return `**Orientações para Decisões** 🌟

Quando enfrentando escolhas importantes:

1. **Consulte seu interior** — sua intuição é seu orixá falando
2. **Observe os sinais** — o universo sempre envia mensagens
3. **Busque serenidade** — decisões tomadas em paz têm melhores resultados
4. **Confie no processo** — cada escolha é uma oportunidade de crescimento

${userData?.orixaRegente ? `Votre ${userData.orixaRegente} oferece proteção especial neste momento. Peça orientação em oração.` : 'Encontre um momento de silêncio para consultar sua sabedoria interior.'}`;
  }
  
  if (lowerPrompt.includes('afirmação') || lowerPrompt.includes('fortalec')) {
    return `**Afirmação do Poder Interior** ✨

*EU SOU luz emanating do divino*
*EU SOU conectado à sabedoria ancestral*
*EU SOU protegido por forças superiores*
*EU SOU capaz de criar minha realidade*
*EU SOU grato por cada momento de vida*

*EU SOU...*

(Repita esta afirmação 21 vezes diárias)`;
  }
  
  return `**Mensagem Espiritual** 🌙

*O silêncio é onde encontramos nossas respostas.*

Neste momento, permita-se estar presente.
Feche os olhos.
Respire.
O universo está falando, você só precisa escutar.

${userData?.nome ? `${userData.nome}, você tem todo o poder que precisa dentro de si.` : 'Você tem todo o poder que precisa dentro de si.'}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function getCategoryIcon(category?: string): React.ReactNode {
  switch (category) {
    case 'prayer':
      return <Moon className="w-4 h-4" />;
    case 'meditation':
      return <Star className="w-4 h-4" />;
    case 'affirmation':
      return <Heart className="w-4 h-4" />;
    default:
      return <Sparkles className="w-4 h-4" />;
  }
}

function getDayEnergy(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Manhã - energia de renovação';
  if (hour >= 12 && hour < 18) return 'Tarde - energia de ação';
  return 'Noite - energia de reflexão';
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface ThemeSelectorProps {
  selectedTheme: ChatTheme | null;
  onSelectTheme: (theme: ChatTheme) => void;
}

function ThemeSelector({ selectedTheme, onSelectTheme }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-lg text-sm transition-colors"
      >
        {selectedTheme ? (
          <>
            {CHAT_THEMES.find(t => t.id === selectedTheme)?.icon}
            <span className="text-slate-300">
              {CHAT_THEMES.find(t => t.id === selectedTheme)?.label}
            </span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Tema</span>
          </>
        )}
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', isOpen && 'rotate-180')} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
          <div className="p-2 space-y-1">
            {CHAT_THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => {
                  onSelectTheme(theme.id);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                  selectedTheme === theme.id
                    ? 'bg-slate-700/50'
                    : 'hover:bg-slate-700/30'
                )}
              >
                <span className={theme.color}>{theme.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-white">{theme.label}</p>
                  <p className="text-xs text-slate-400">{theme.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface QuickActionButtonsProps {
  prompts: ExtendedPrompt[];
  selectedTheme: ChatTheme | null;
  onQuickAction: (prompt: string, theme?: ChatTheme) => void;
}

function QuickActionButtons({ prompts, selectedTheme, onQuickAction }: QuickActionButtonsProps) {
  const filteredPrompts = selectedTheme
    ? prompts.filter(p => p.theme === selectedTheme)
    : prompts.slice(0, 4);
  
  return (
    <div className="flex flex-wrap gap-2">
      {filteredPrompts.map(({ label, prompt, theme }) => (
        <button
          key={label}
          onClick={() => onQuickAction(prompt)}
          className="px-3 py-1.5 text-xs bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-full transition-colors flex items-center gap-1.5"
        >
          {getCategoryIcon(prompts.find(p => p.label === label)?.category)}
          {label}
        </button>
      ))}
    </div>
  );
}

interface StreamingIndicatorProps {
  isStreaming: boolean;
}

function StreamingIndicator({ isStreaming }: StreamingIndicatorProps) {
  return isStreaming ? (
    <div className="flex items-center gap-2 text-slate-400 animate-pulse">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm">Recebendo orientação...</span>
    </div>
  ) : null;
}

interface ContextInfoProps {
  lunarPhase?: string;
  orixaRegente?: string;
}

function ContextInfo({ lunarPhase, orixaRegente }: ContextInfoProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
      <div className="flex items-center gap-2">
        <Moon className="w-4 h-4 text-blue-400" />
        <span className="text-xs text-slate-400">{lunarPhase || 'Lua em transição'}</span>
      </div>
      {orixaRegente && (
        <div className="flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-400">{orixaRegente}</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-emerald-400" />
        <span className="text-xs text-slate-400">{getDayEnergy()}</span>
      </div>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualGuidanceChat({
  userData,
  className = '',
  onSendMessage,
  lunarPhase,
}: SpiritualGuidanceChatProps) {
  const [messages, setMessages] = useState<GuidanceMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<ChatTheme | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const simulateStreaming = useCallback(async (fullText: string): Promise<string> => {
    setIsStreaming(true);
    
    // Simulate streaming by gradually revealing text
    const words = fullText.split(' ');
    let displayedText = '';
    
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
      displayedText += (displayedText ? ' ' : '') + words[i];
      
      // Update message with streaming content
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
          updated[lastIndex] = { ...updated[lastIndex], content: displayedText };
        }
        return updated;
      });
    }
    
    setIsStreaming(false);
    return fullText;
  }, []);

  const handleSendMessage = async (content: string, theme?: ChatTheme) => {
    if (!content.trim() || isLoading) return;

    const userMessage: GuidanceMessage = {
      id: generateMessageId(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      theme,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create placeholder for streaming response
      const assistantMessage: GuidanceMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        theme,
      };
      setMessages(prev => [...prev, assistantMessage]);

      let responseText = '';
      
      if (onSendMessage) {
        responseText = await onSendMessage(content, theme);
      } else {
        responseText = generateStreamingResponse(content, userData, theme);
      }

      // Use streaming simulation
      await simulateStreaming(responseText);
      
    } catch (error) {
      // Update last message with error
      setMessages(prev => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === 'assistant') {
          updated[lastIndex] = { 
            ...updated[lastIndex], 
            content: 'Desculpe, ocorreu um erro. Tente novamente mais tarde.' 
          };
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string, theme?: ChatTheme) => {
    handleSendMessage(prompt, theme);
  };

  return (
    <div className={cn('bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden', className)}>
      {/* Header */}
      <div
        className="p-4 border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-lg">
              <MessageCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Orientação Espiritual</h3>
              <p className="text-slate-400 text-xs">
                {userData?.orixaRegente ? `Guiado por ${userData.orixaRegente}` : 'Chat espiritual'}
              </p>
            </div>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 rotate-180" />
          )}
        </div>
      </div>

      {/* Chat Content */}
      {isExpanded && (
        <>
          {/* Context Info */}
          <div className="px-4 pt-4">
            <ContextInfo lunarPhase={lunarPhase} orixaRegente={userData?.orixaRegente} />
          </div>
          
          {/* Theme Selector */}
          <div className="px-4 py-3 flex items-center justify-between">
            <ThemeSelector selectedTheme={selectedTheme} onSelectTheme={setSelectedTheme} />
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Zap className="w-3 h-3" />
              <span>AI Contextual</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="h-72 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Sparkles className="w-12 h-12 text-slate-600 mb-4" />
                <p className="text-slate-400 text-sm mb-2">
                  Como posso guiá-lo hoje?
                </p>
                <p className="text-slate-500 text-xs mb-4">
                  Selecione um tema para orientações mais precisas
                </p>
                <QuickActionButtons
                  prompts={EXTENDED_GUIDANCE_PROMPTS}
                  selectedTheme={selectedTheme}
                  onQuickAction={handleQuickPrompt}
                />
              </div>
            )}
            
            {messages.map(message => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn(
                  'max-w-[85%] rounded-xl p-4',
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-amber-600/20 to-amber-500/10 border border-amber-500/30'
                    : 'bg-slate-700/50 border border-slate-600/30'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-xs text-slate-400">
                      {message.role === 'user' ? 'Você' : 'Orientação'}
                    </span>
                    {message.theme && (
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        CHAT_THEMES.find(t => t.id === message.theme)?.color,
                        'bg-slate-700/50'
                      )}>
                        {CHAT_THEMES.find(t => t.id === message.theme)?.label}
                      </span>
                    )}
                    <span className="text-xs text-slate-500 ml-auto">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                  
                  <div
                    className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{
                      __html: message.content
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }}
                  />
                </div>
              </div>
            ))}

            <StreamingIndicator isStreaming={isStreaming} />

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-700/50">
            <div className="flex items-end gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue, selectedTheme || undefined);
                  }
                }}
                placeholder="Peça orientação espiritual..."
                className="flex-1 bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-400 resize-none focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                rows={1}
              />
              <button
                onClick={() => handleSendMessage(inputValue, selectedTheme || undefined)}
                disabled={!inputValue.trim() || isLoading}
                className="p-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-lg hover:from-amber-500 hover:to-orange-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                ) : (
                  <Send className="w-5 h-5 text-white" />
                )}
              </button>
            </div>
            {selectedTheme && (
              <p className="text-xs text-slate-500 mt-2">
                Tema ativo: <span className="text-amber-400">{CHAT_THEMES.find(t => t.id === selectedTheme)?.label}</span>
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default SpiritualGuidanceChat;