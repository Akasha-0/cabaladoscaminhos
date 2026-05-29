'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Feather,
  BookOpen,
  Heart,
  Sparkles,
  Sun,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save,
  Check,
} from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface SpiritualJournalWidgetProps {
  userId?: string;
  userOrixa?: string;
}

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: string;
  gratitudeEntries: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// CONSTANTS
// ============================================================

const STORAGE_KEY = 'cabala_journal_entries';

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Alegre', color: 'text-yellow-500' },
  { emoji: '😌', label: 'Sereno', color: 'text-emerald-500' },
  { emoji: '🙏', label: 'Espiritual', color: 'text-purple-500' },
  { emoji: '😔', label: 'Melancólico', color: 'text-blue-500' },
  { emoji: '😤', label: 'Irritado', color: 'text-red-500' },
  { emoji: '😰', label: 'Ansioso', color: 'text-orange-500' },
  { emoji: '💪', label: 'Energizado', color: 'text-amber-500' },
  { emoji: '😴', label: 'Cansado', color: 'text-gray-500' },
];

const ORIXA_PROMPTS: Record<string, string[]> = {
  default: [
    'O que gratidão posso expressar hoje?',
    'Qual lição espiritual estou aprendendo?',
    'Como posso honrar minha essência divina?',
    'O que meu coração está tentando me dizer?',
    'Que oportunidade de crescimento se apresenta?',
  ],
  'Oxum': [
    'Como posso honrar Oxum hoje?',
    'Que lição de amor próprio Oxum quer me ensinar?',
    'Como posso cultivar minha beleza interior?',
    'Que fluxo emocional preciso acolher?',
    'Como posso nutrir minhas relações com sabedoria?',
  ],
  'Xangô': [
    'O que Xangô quer me ensinar hoje?',
    'Como posso encontrar equilíbrio entre força e justiça?',
    'Que decisão difícil preciso enfrentar com coragem?',
    'Como posso manifestar minha verdade com integridade?',
    'Que tempestade interior preciso transformar em luz?',
  ],
  'Iemanjá': [
    'Como posso honrar Iemanjá hoje?',
    'Que emoções profundas pedem minha atenção?',
    'Como posso cultivar minha intuição e sabedoria?',
    'Que nutrição espiritual preciso receber?',
    'Como posso honrar minha mãe interior?',
  ],
  'Ogum': [
    'Que batalha interior preciso vencer?',
    'Como posso canalizar minha energia para propósitos elevados?',
    'Que obstáculo posso transformar em oportunidade?',
    'Como posso usar minha força para proteger quem amo?',
    'Que pioneirismo espiritual me aguarda?',
  ],
  'Oxalá': [
    'Como posso honrar Oxalá hoje?',
    'Que paz posso cultivar em meu coração?',
    'Como posso ser mensageiro de luz e esperança?',
    'Que criação espiritual posso iniciar?',
    'Como posso encontrar clareza em meio à confusão?',
  ],
  'Iansã': [
    'Que transformação está pedindo para nascer?',
    'Como posso canalizar minha energia de mudança?',
    'Que velhos padrões preciso deixar partir?',
    'Como posso honrar minha coragem e independência?',
    'Que vento de renovação quer atravessar minha vida?',
  ],
  'Oxóssi': [
    'Que conhecimento novo posso buscar?',
    'Como posso expandir minha perspectiva?',
    'Que caça espiritual me aguarda?',
    'Como posso honrar minha busca por verdade?',
    'Que aventuras de crescimento me esperam?',
  ],
  'Omolu': [
    'Que ferida antiga precisa de cura?',
    'Como posso transformar sofrimento em sabedoria?',
    'Que segredos de regeneração preciso conhecer?',
    'Como posso honrar meus processos de cura?',
    'Que renovação está nascendo do escuro?',
  ],
  'Obá': [
    'Que tradição posso honrar?',
    'Como posso cultivar lealdade e compromisso?',
    'Que aspecto de minha feminilidade preciso valorizar?',
    'Como posso proteger o que é sagrado para mim?',
    'Que força interior preciso reclamar?',
  ],
  'Logun': [
    'Como posso integrar extremos em minha vida?',
    'Que harmonização entre sagrado e profano preciso fazer?',
    'Como posso usar minha inteligência para o bem?',
    'Que reconciliação interior se faz necessária?',
    'Como posso navegar entre terra e céu?',
  ],
  'Nanã': [
    'Que aspecto de minha sabedoria ancestral preciso acessar?',
    'Como posso honrar meus ancestrais?',
    'Que pureza interior preciso cultivar?',
    'Como posso encontrar paz nos ciclos da vida?',
    'Que lição de humildade o universo me oferece?',
  ],
  'Eshu': [
    'Que mensagens inesperadas o universo me envia?',
    'Como posso integrar minha sombra com compaixão?',
    'Que limites preciso estabelecer com sabedoria?',
    'Como posso navegar entre ordem e caos?',
    'Que liberdade espiritual estou evitando?',
  ],
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function generateId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

function loadEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load journal entries:', e);
  }
  return [];
}

function saveEntries(entries: JournalEntry[]): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (e) {
    console.error('Failed to save journal entries:', e);
  }
}

function calculateStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0;
  
  const sortedDates = entries
    .map((e) => e.date)
    .filter((d) => d.length > 0)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  if (sortedDates.length === 0) return 0;
  
  const today = getDateString(new Date());
  const yesterday = getDateString(new Date(Date.now() - 86400000));
  
  if (sortedDates[0] !== today && sortedDates[0] !== yesterday) {
    return 0;
  }
  
  let streak = 0;
  let currentDate = new Date(sortedDates[0]);
  
  for (const dateStr of sortedDates) {
    const entryDate = new Date(dateStr);
    const diffDays = Math.floor(
      (currentDate.getTime() - entryDate.getTime()) / 86400000
    );
    
    if (diffDays <= 1) {
      streak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }
  
  return streak;
}

function getDailyPrompts(orixa?: string): string[] {
  if (!orixa) return ORIXA_PROMPTS.default;
  
  const normalizedOrixa = orixa.trim();
  return ORIXA_PROMPTS[normalizedOrixa] || ORIXA_PROMPTS.default;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface MoodSelectorProps {
  selected: string;
  onSelect: (mood: string) => void;
}

function MoodSelector({ selected, onSelect }: MoodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOOD_OPTIONS.map((option) => (
        <button
          key={option.emoji}
          onClick={() => onSelect(option.emoji)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-sm transition-all',
            'border border-transparent hover:border-violet-500/30',
            selected === option.emoji
              ? 'bg-violet-500/20 border-violet-500/50 scale-105'
              : 'bg-slate-800/50 hover:bg-slate-700/50'
          )}
          title={option.label}
        >
          <span className="text-base">{option.emoji}</span>
          <span className={cn('hidden sm:inline text-xs', option.color)}>
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}

interface PromptCardProps {
  prompt: string;
  onClick: () => void;
}

function PromptCard({ prompt, onClick }: PromptCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'text-left p-3 rounded-lg transition-all',
        'bg-violet-500/5 border border-violet-500/20',
        'hover:bg-violet-500/10 hover:border-violet-500/30',
        'text-sm text-slate-300 hover:text-violet-200'
      )}
    >
      <Sparkles className="w-3.5 h-3.5 text-violet-400 mb-1.5" />
      <span className="leading-relaxed">{prompt}</span>
    </button>
  );
}

interface GratitudeItemProps {
  text: string;
  index: number;
  onRemove: () => void;
}

function GratitudeItem({ text, index, onRemove }: GratitudeItemProps) {
  return (
    <div className="flex items-center gap-2 group">
      <Heart className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
      <span className="text-sm text-slate-300 flex-1">{text}</span>
      <button
        onClick={onRemove}
        className={cn(
          'opacity-0 group-hover:opacity-100 transition-opacity',
          'text-slate-500 hover:text-red-400'
        )}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function SpiritualJournalWidget({
  userId,
  userOrixa,
}: SpiritualJournalWidgetProps) {
  const today = getDateString(new Date());
  
  const [entries, setEntries] = React.useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = React.useState<JournalEntry>({
    id: '',
    date: today,
    content: '',
    mood: '',
    gratitudeEntries: [],
    createdAt: '',
    updatedAt: '',
  });
  
  const [gratitudeInput, setGratitudeInput] = React.useState('');
  const [showPrompts, setShowPrompts] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [showAllEntries, setShowAllEntries] = React.useState(false);
  
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  React.useEffect(() => {
    const stored = loadEntries();
    setEntries(stored);
    
    const todayEntry = stored.find((e) => e.date === today);
    if (todayEntry) {
      setCurrentEntry(todayEntry);
    } else {
      const newEntry: JournalEntry = {
        id: generateId(),
        date: today,
        content: '',
        mood: '',
        gratitudeEntries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setCurrentEntry(newEntry);
    }
  }, [today]);
  
  const streak = calculateStreak(entries);
  const prompts = getDailyPrompts(userOrixa);
  
  const saveEntry = React.useCallback(() => {
    const entryToSave = {
      ...currentEntry,
      updatedAt: new Date().toISOString(),
    };
    
    const updatedEntries = entries.filter((e) => e.date !== today);
    updatedEntries.push(entryToSave);
    
    saveEntries(updatedEntries);
    setEntries(updatedEntries);
    setIsSaved(true);
    
    setTimeout(() => setIsSaved(false), 2000);
  }, [currentEntry, entries, today]);


  
  React.useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (currentEntry.id && (currentEntry.content !== '' || currentEntry.mood || currentEntry.gratitudeEntries.length > 0)) {
        saveEntry();
      }
    }, 1500);
    
    return () => clearTimeout(saveTimeout);
  }, [currentEntry.content, currentEntry.mood, currentEntry.gratitudeEntries]);
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentEntry((prev) => ({
      ...prev,
      content: e.target.value,
    }));
    setIsSaved(false);
  };
  
  const handleMoodSelect = (mood: string) => {
    setCurrentEntry((prev) => ({
      ...prev,
      mood: prev.mood === mood ? '' : mood,
    }));
    setIsSaved(false);
  };
  
  const handlePromptClick = (prompt: string) => {
    setCurrentEntry((prev) => {
      const newContent = prev.content
        ? `${prev.content}\n\n${prompt}\n`
        : `${prompt}\n`;
      return { ...prev, content: newContent };
    });
    setShowPrompts(false);
    textareaRef.current?.focus();
  };
  
  const handleAddGratitude = () => {
    if (!gratitudeInput.trim()) return;
    
    setCurrentEntry((prev) => ({
      ...prev,
      gratitudeEntries: [...prev.gratitudeEntries, gratitudeInput.trim()],
    }));
    setGratitudeInput('');
  };
  
  const handleRemoveGratitude = (index: number) => {
    setCurrentEntry((prev) => ({
      ...prev,
      gratitudeEntries: prev.gratitudeEntries.filter((_, i) => i !== index),
    }));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGratitude();
    }
  };
  
  const characterCount = currentEntry.content.length;
  const maxCharacters = 5000;
  
  return (
    <Card className="card-spiritual overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Feather className="w-4 h-4 text-violet-400" />
            </div>
            Diário Espiritual
          </CardTitle>
          
          <div className="flex items-center gap-3">
            {streak > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-amber-400">
                <Sun className="w-4 h-4" />
                <span className="font-medium">{streak} dias</span>
              </div>
            )}
            
            {isSaved && (
              <div className="flex items-center gap-1.5 text-sm text-emerald-400">
                <Check className="w-4 h-4" />
                <span>Salvo</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs text-slate-400 mb-2 block">
            Como você está se sentindo?
          </label>
          <MoodSelector
            selected={currentEntry.mood}
            onSelect={handleMoodSelect}
          />
        </div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Reflexão do dia
            </label>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPrompts(!showPrompts)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
                  showPrompts
                    ? 'bg-violet-500/20 text-violet-300'
                    : 'bg-slate-800/50 text-slate-400 hover:text-violet-300'
                )}
              >
                <Sparkles className="w-3 h-3" />
                Prompts
                {showPrompts ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              
              <span
                className={cn(
                  'text-xs',
                  characterCount > maxCharacters * 0.9
                    ? 'text-amber-400'
                    : 'text-slate-500'
                )}
              >
                {characterCount}/{maxCharacters}
              </span>
            </div>
          </div>
          
          {showPrompts && (
            <div className="mb-3 grid gap-2">
              {prompts.map((prompt, index) => (
                <PromptCard
                  key={`${prompt.substring(0, 20)}-${index}`}
                  prompt={prompt}
                  onClick={() => handlePromptClick(prompt)}
                />
              ))}
            </div>
          )}
          
          <textarea
            ref={textareaRef}
            value={currentEntry.content}
            onChange={handleContentChange}
            placeholder="Escreva aqui seus pensamentos, reflexões e insights espirituais..."
            className={cn(
              'w-full h-40 p-3 rounded-lg resize-none transition-colors',
              'bg-slate-800/50 border border-slate-700',
              'text-slate-200 placeholder:text-slate-500',
              'focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20',
              'focus:outline-none'
            )}
            maxLength={maxCharacters}
          />
        </div>
        
        <div>
          <label className="text-xs text-slate-400 mb-2 block flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400" />
            Gratidão ({currentEntry.gratitudeEntries.length})
          </label>
          
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={gratitudeInput}
              onChange={(e) => setGratitudeInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Do que você é grato hoje?"
              className={cn(
                'flex-1 px-3 py-2 rounded-lg text-sm transition-colors',
                'bg-slate-800/50 border border-slate-700',
                'text-slate-200 placeholder:text-slate-500',
                'focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20',
                'focus:outline-none'
              )}
            />
            <button
              onClick={handleAddGratitude}
              disabled={!gratitudeInput.trim()}
              className={cn(
                'p-2 rounded-lg transition-colors',
                'bg-violet-500 hover:bg-violet-600',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'text-white'
              )}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          {currentEntry.gratitudeEntries.length > 0 && (
            <div className="space-y-1.5">
              {currentEntry.gratitudeEntries.map((item, index) => (
                <GratitudeItem
                  key={index}
                  text={item}
                  index={index}
                  onRemove={() => handleRemoveGratitude(index)}
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={saveEntry}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors',
              'bg-violet-600 hover:bg-violet-500',
              'text-white'
            )}
          >
            <Save className="w-4 h-4" />
            Salvar entrada
          </button>
        </div>
        
        {entries.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => setShowAllEntries(!showAllEntries)}
              className={cn(
                'flex items-center gap-2 text-sm transition-colors',
                'text-slate-400 hover:text-violet-300'
              )}
            >
              <BookOpen className="w-4 h-4" />
              {showAllEntries ? 'Ocultar' : 'Ver'} entradas anteriores ({entries.length})
              {showAllEntries ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            
            {showAllEntries && (
              <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                {entries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .filter((e) => e.date !== today)
                  .slice(0, 10)
                  .map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 rounded-lg bg-slate-800/30 border border-slate-800"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-violet-400">
                          {new Date(entry.date).toLocaleDateString('pt-BR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </span>
                        {entry.mood && (
                          <span className="text-lg">{entry.mood}</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 line-clamp-2">
                        {entry.content || 'Sem conteúdo'}
                      </p>
                      {entry.gratitudeEntries.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {entry.gratitudeEntries.slice(0, 3).map((g, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400"
                            >
                              {g}
                            </span>
                          ))}
                          {entry.gratitudeEntries.length > 3 && (
                            <span className="text-xs text-slate-500">
                              +{entry.gratitudeEntries.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SpiritualJournalWidget;