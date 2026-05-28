'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  GraduationCap,
  ChevronRight,
  CheckCircle2,
  Circle,
  Play,
  SkipForward,
  Clock,
  Flame,
  Brain,
  Star,
  Zap,
} from 'lucide-react';

// Types
type PathType = 'cabala' | 'astrologia' | 'numerologia' | 'tarot' | 'ifa';
type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed';

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  lessons: number;
  status: ModuleStatus;
  progress: number; // 0-100
  lastAccessed?: string;
}

interface LearningPath {
  id: PathType;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  modules: Module[];
  totalProgress: number;
  currentModule?: string;
}

// Path configurations
const PATH_CONFIGS: Record<PathType, { title: string; description: string; icon: React.ElementType; color: string }> = {
  cabala: {
    title: 'Caminho da Cabala',
    description: 'Misticismo hebraico e árvores da vida',
    icon: Star,
    color: 'text-amber-400',
  },
  astrologia: {
    title: 'Astrologia Espiritual',
    description: 'Movimentos celestiais e sua influência',
    icon: Zap,
    color: 'text-purple-400',
  },
  numerologia: {
    title: 'Numerologia Sagrada',
    description: 'Números e suas vibrações espirituais',
    icon: Brain,
    color: 'text-blue-400',
  },
  tarot: {
    title: 'Tarô Iniciático',
    description: 'Arcanos maiores e menores',
    icon: BookOpen,
    color: 'text-rose-400',
  },
  ifa: {
    title: 'Tradição Ifá',
    description: 'Sabedoria iorubá e orixás',
    icon: Flame,
    color: 'text-orange-400',
  },
};

// Module templates per path
const MODULE_TEMPLATES: Record<PathType, Omit<Module, 'status' | 'progress' | 'lastAccessed'>[]> = {
  cabala: [
    { id: 'cabala-1', title: 'Fundamentos da Cabala', description: 'Origens e princípios básicos', duration: 45, lessons: 8 },
    { id: 'cabala-2', title: 'Árvore da Vida', description: 'Os dez sefirot e suas conexões', duration: 60, lessons: 12 },
    { id: 'cabala-3', title: 'Caminhos de Luz', description: 'As 22 letras hebraicas', duration: 55, lessons: 10 },
    { id: 'cabala-4', title: 'Mundos Espirituais', description: 'Assiyah, Yetzirah, Briah, Atzilut', duration: 50, lessons: 9 },
  ],
  astrologia: [
    { id: 'astro-1', title: 'Zodíaco e Signos', description: 'Os doze signos e suas características', duration: 40, lessons: 7 },
    { id: 'astro-2', title: 'Planetas e Casas', description: 'Influência planetária nas casas astrais', duration: 65, lessons: 11 },
    { id: 'astro-3', title: 'Aspectos Astrológicos', description: 'Conjuções, oposições e trânsitos', duration: 45, lessons: 8 },
  ],
  numerologia: [
    { id: 'num-1', title: 'Algarismos e Significado', description: 'Cálculo e interpretação dos números', duration: 35, lessons: 6 },
    { id: 'num-2', title: 'Número de Vida', description: 'Sua missão e propósito de vida', duration: 40, lessons: 7 },
    { id: 'num-3', title: 'Ciclos Numéricos', description: 'Anos pessoais e ciclos de vida', duration: 50, lessons: 9 },
  ],
  tarot: [
    { id: 'tarot-1', title: 'Arcanos Maiores', description: 'As 22 lâminas maiores', duration: 70, lessons: 14 },
    { id: 'tarot-2', title: 'Arcanos Menores', description: 'Paus, Copas, Espadas, Ouros', duration: 55, lessons: 10 },
    { id: 'tarot-3', title: 'Leituras Práticas', description: 'Métodos de espalhamento', duration: 45, lessons: 8 },
  ],
  ifa: [
    { id: 'ifa-1', title: 'Odu e Ori', description: 'Fundamentos da tradição Ifá', duration: 50, lessons: 9 },
    { id: 'ifa-2', title: 'Orixás e Ebós', description: 'Sacramentos e oferendas', duration: 60, lessons: 11 },
    { id: 'ifa-3', title: 'Makuto e Kefir', description: 'Desbloqueio espiritual', duration: 45, lessons: 8 },
  ],
};

// Storage helpers
const STORAGE_KEY = 'learning_progress';

interface StoredProgress {
  [pathId: string]: {
    [moduleId: string]: {
      status: ModuleStatus;
      progress: number;
      lastAccessed?: string;
    };
  };
}

function getStoredProgress(): StoredProgress {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveProgress(pathId: string, moduleId: string, data: { status: ModuleStatus; progress: number }) {
  try {
    const stored = getStoredProgress();
    if (!stored[pathId]) stored[pathId] = {};
    stored[pathId][moduleId] = {
      ...stored[pathId][moduleId],
      ...data,
      lastAccessed: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // Storage unavailable
  }
}

// Initialize paths with progress data
function initializePaths(): LearningPath[] {
  const stored = getStoredProgress();
  
  return (Object.keys(PATH_CONFIGS) as PathType[]).map((pathId) => {
    const config = PATH_CONFIGS[pathId];
    const templates = MODULE_TEMPLATES[pathId];
    
    const modules: Module[] = templates.map((template, index) => {
      const storedModule = stored[pathId]?.[template.id];
      
      let status: ModuleStatus;
      if (storedModule) {
        status = storedModule.status;
      } else if (index === 0) {
        status = 'available';
      } else {
        status = 'locked';
      }
      
      return {
        ...template,
        status,
        progress: storedModule?.progress ?? 0,
        lastAccessed: storedModule?.lastAccessed,
      };
    });
    
    const completedModules = modules.filter(m => m.status === 'completed').length;
    const inProgressModules = modules.filter(m => m.status === 'in_progress');
    const totalProgress = modules.length > 0 
      ? Math.round((completedModules / modules.length) * 100) 
      : 0;
    
    return {
      id: pathId,
      title: config.title,
      description: config.description,
      icon: config.icon,
      color: config.color,
      modules,
      totalProgress,
      currentModule: inProgressModules[0]?.id,
    };
  });
}

export function LearningDashboard() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<PathType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setPaths(initializePaths());
    setIsLoading(false);
  }, []);

  const handleStartModule = useCallback((pathId: PathType, moduleId: string) => {
    setPaths(prev => prev.map(path => {
      if (path.id !== pathId) return path;
      
      const updatedModules = path.modules.map((mod, index) => {
        if (mod.id === moduleId) {
          saveProgress(pathId, moduleId, { status: 'in_progress', progress: mod.progress || 10 });
          return { ...mod, status: 'in_progress' as ModuleStatus, progress: mod.progress || 10, lastAccessed: new Date().toISOString() };
        }
        return mod;
      });
      
      return { ...path, modules: updatedModules, currentModule: moduleId };
    }));
    setSelectedPath(pathId);
  }, []);

  const handleContinueModule = useCallback((pathId: PathType, moduleId: string) => {
    const path = paths.find(p => p.id === pathId);
    const module = path?.modules.find(m => m.id === moduleId);
    if (!module) return;
    
    const newProgress = Math.min(100, (module.progress || 0) + 15);
    const isCompleted = newProgress >= 100;
    
    saveProgress(pathId, moduleId, { 
      status: isCompleted ? 'completed' : 'in_progress', 
      progress: newProgress 
    });
    
    setPaths(prev => prev.map(p => {
      if (p.id !== pathId) return p;
      
      const updatedModules = p.modules.map((mod, index) => {
        if (mod.id === moduleId) {
          return { ...mod, status: isCompleted ? 'completed' as ModuleStatus : 'in_progress' as ModuleStatus, progress: newProgress };
        }
        // Unlock next module if completed
        if (isCompleted && index === p.modules.findIndex(m => m.id === moduleId) + 1) {
          saveProgress(pathId, mod.id, { status: 'available', progress: 0 });
          return { ...mod, status: 'available' as ModuleStatus };
        }
        return mod;
      });
      
      const completedCount = updatedModules.filter(m => m.status === 'completed').length;
      return { 
        ...p, 
        modules: updatedModules, 
        totalProgress: Math.round((completedCount / updatedModules.length) * 100),
        currentModule: isCompleted ? undefined : moduleId
      };
    }));
  }, [paths]);

  const handleSkipModule = useCallback((pathId: PathType, moduleId: string) => {
    const path = paths.find(p => p.id === pathId);
    const moduleIndex = path?.modules.findIndex(m => m.id === moduleId) ?? -1;
    if (!path || moduleIndex === -1) return;
    
    saveProgress(pathId, moduleId, { status: 'completed', progress: 100 });
    
    setPaths(prev => prev.map(p => {
      if (p.id !== pathId) return p;
      
      const updatedModules = p.modules.map((mod, index) => {
        if (mod.id === moduleId) {
          return { ...mod, status: 'completed' as ModuleStatus, progress: 100 };
        }
        if (index === moduleIndex + 1) {
          saveProgress(pathId, mod.id, { status: 'available', progress: 0 });
          return { ...mod, status: 'available' as ModuleStatus };
        }
        return mod;
      });
      
      const completedCount = updatedModules.filter(m => m.status === 'completed').length;
      return { 
        ...p, 
        modules: updatedModules, 
        totalProgress: Math.round((completedCount / updatedModules.length) * 100),
        currentModule: undefined
      };
    }));
  }, [paths]);

  const getStatusIcon = (status: ModuleStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'in_progress':
        return <Circle className="w-5 h-5 text-amber-400 fill-amber-400/30" />;
      case 'available':
        return <Circle className="w-5 h-5 text-slate-400" />;
      case 'locked':
        return <Circle className="w-5 h-5 text-slate-600" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Carregando...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const selectedPathData = selectedPath ? paths.find(p => p.id === selectedPath) : null;
  const selectedPathConfig = selectedPath ? PATH_CONFIGS[selectedPath] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            Painel de Aprendizagem
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Continue sua jornada espiritual
          </p>
        </div>
        <Badge variant="outline" className="bg-indigo-900/30 text-indigo-300 border-indigo-700">
          {paths.filter(p => p.totalProgress > 0).length} Caminhos em Progresso
        </Badge>
      </div>

      <Separator className="bg-slate-700/50" />

      {/* Path Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paths.map((path) => {
          const Icon = path.icon;
          const hasProgress = path.totalProgress > 0;
          
          return (
            <Card 
              key={path.id}
              className={cn(
                'bg-slate-900/50 border-slate-700/50 cursor-pointer transition-all hover:border-indigo-500/50',
                selectedPath === path.id && 'ring-2 ring-indigo-500 border-indigo-500'
              )}
              onClick={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg bg-slate-800', selectedPath === path.id && 'bg-indigo-900/50')}>
                      <Icon className={cn('w-5 h-5', path.color)} />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold text-slate-100">
                        {path.title}
                      </CardTitle>
                      <p className="text-xs text-slate-400">
                        {path.description}
                      </p>
                    </div>
                  </div>
                  {getStatusIcon(
                    hasProgress 
                      ? path.modules.some(m => m.status === 'in_progress') 
                        ? 'in_progress' 
                        : 'completed' 
                      : 'available'
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Progresso</span>
                    <span className="text-slate-200 font-medium">{path.totalProgress}%</span>
                  </div>
                  <Progress 
                    value={path.totalProgress} 
                    className="h-2 bg-slate-800"
                  />
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{path.modules.filter(m => m.status === 'completed').length}/{path.modules.length} módulos</span>
                    {path.currentModule && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Circle className="w-2 h-2 fill-amber-400" />
                        Em andamento
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Path Detail */}
      {selectedPathData && selectedPathConfig && (
        <Card className="bg-slate-900/70 border-indigo-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-900/50">
                  {(() => {
                    const Icon = selectedPathData.icon;
                    return <Icon className={cn('w-6 h-6', selectedPathData.color)} />;
                  })()}
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-100">
                    {selectedPathData.title}
                  </CardTitle>
                  <p className="text-sm text-slate-400">
                    {selectedPathData.description}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedPath(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedPathData.modules.map((module, index) => {
              const isLocked = module.status === 'locked';
              const isCompleted = module.status === 'completed';
              const isInProgress = module.status === 'in_progress';
              const isAvailable = module.status === 'available';
              
              return (
                <div
                  key={module.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    isLocked && 'bg-slate-800/30 border-slate-700/30 opacity-60',
                    isCompleted && 'bg-emerald-900/20 border-emerald-700/30',
                    isInProgress && 'bg-amber-900/20 border-amber-700/50',
                    isAvailable && 'bg-slate-800/50 border-slate-600/50 hover:border-indigo-500/50 cursor-pointer'
                  )}
                  onClick={() => isAvailable && handleStartModule(selectedPath!, module.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getStatusIcon(module.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={cn(
                          'font-medium',
                          isLocked ? 'text-slate-500' : 'text-slate-200'
                        )}>
                          {index + 1}. {module.title}
                        </h4>
                        {isInProgress && (
                          <Badge variant="outline" className="text-xs bg-amber-900/50 text-amber-300 border-amber-700">
                            Em Andamento
                          </Badge>
                        )}
                      </div>
                      <p className={cn(
                        'text-sm mt-1',
                        isLocked ? 'text-slate-600' : 'text-slate-400'
                      )}>
                        {module.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {module.lessons} lições
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(module.duration)}
                        </span>
                        {module.lastAccessed && !isLocked && (
                          <span className="text-slate-600">
                            Último acesso: {new Date(module.lastAccessed).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      
                      {(isInProgress || (isAvailable && module.progress > 0)) && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-400">Progresso</span>
                            <span className="text-slate-300">{module.progress}%</span>
                          </div>
                          <Progress 
                            value={module.progress} 
                            className="h-1.5 bg-slate-700"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {isLocked && (
                        <span className="text-slate-600 text-xs">Bloqueado</span>
                      )}
                      {isCompleted && (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      )}
                      {(isInProgress || (isAvailable && module.progress > 0)) && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleContinueModule(selectedPath!, module.id);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Continuar
                        </Button>
                      )}
                      {isAvailable && module.progress === 0 && (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartModule(selectedPath!, module.id);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Iniciar
                        </Button>
                      )}
                      {(isInProgress || (isAvailable && module.progress > 0)) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSkipModule(selectedPath!, module.id);
                          }}
                          className="text-slate-400 hover:text-slate-200"
                        >
                          <SkipForward className="w-4 h-4 mr-1" />
                          Pular
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-slate-100">
              {paths.reduce((acc, p) => acc + p.modules.filter(m => m.status === 'completed').length, 0)}
            </div>
            <p className="text-xs text-slate-400">Módulos Completos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-400">
              {paths.reduce((acc, p) => acc + p.modules.filter(m => m.status === 'in_progress').length, 0)}
            </div>
            <p className="text-xs text-slate-400">Em Andamento</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-emerald-400">
              {Math.round(paths.reduce((acc, p) => acc + p.totalProgress, 0) / paths.length)}%
            </div>
            <p className="text-xs text-slate-400">Progresso Médio</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900/50 border-slate-700/50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-slate-100">
              {paths.reduce((acc, p) => acc + p.modules.filter(m => m.status !== 'locked').length, 0)}
            </div>
            <p className="text-xs text-slate-400">Acessíveis</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LearningDashboard;
