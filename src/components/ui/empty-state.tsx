'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Moon, 
  Star, 
  Sparkles,
  Compass,
  AlertCircle,
  Search,
  FileQuestion
} from 'lucide-react';

type EmptyStateVariant = 
  | 'no-data'
  | 'no-results'
  | 'not-found'
  | 'error'
  | 'no-content'
  | 'onboarding';

interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
  className?: string;
}

// Mapa de variantes para valores padrão
const VARIANT_DEFAULTS: Record<EmptyStateVariant, { icon: React.ReactNode; description: string }> = {
  'no-data': {
    icon: <Sparkles className="w-12 h-12" />,
    description: 'Os astros ainda não revelaram informações para este momento. Tente novamente mais tarde.',
  },
  'no-results': {
    icon: <Search className="w-12 h-12" />,
    description: 'Sua busca não encontrou correspondências. Experimente outros termos.',
  },
  'not-found': {
    icon: <Compass className="w-12 h-12" />,
    description: 'O caminho que procura não foi encontrado. Verifique a rota.',
  },
  'error': {
    icon: <AlertCircle className="w-12 h-12" />,
    description: 'Uma interrupção cósmica ocorreu. Tente novamente em alguns instantes.',
  },
  'no-content': {
    icon: <FileQuestion className="w-12 h-12" />,
    description: 'Este espaço ainda está em construção. Novas revelações em breve.',
  },
  'onboarding': {
    icon: <Moon className="w-12 h-12" />,
    description: 'Bem-vindo à sua jornada! Complete as etapas abaixo para começar.',
  },
};

export function EmptyState({
  variant = 'no-data',
  title,
  description,
  action,
  icon,
  className = '',
}: EmptyStateProps) {
  const defaults = VARIANT_DEFAULTS[variant];
  const displayIcon = icon || defaults.icon;
  const displayDescription = description || defaults.description;

  return (
    <Card 
      className={`
        bg-gradient-to-br from-card/50 to-card/30 
        border-dashed border-2 border-muted-foreground/20
        ${className}
      `}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {/* Ícone decorativo */}
        <div className="mb-6 text-muted-foreground/40">
          {displayIcon}
        </div>

        {/* Título */}
        <h3 className="font-cinzel text-lg text-primary mb-2">
          {title}
        </h3>

        {/* Descrição */}
        <p className="text-sm text-muted-foreground font-raleway max-w-sm mb-6">
          {displayDescription}
        </p>

        {/* Ação opcional */}
        {action && (
          <Button
            onClick={action.onClick}
            variant="outline"
            className="gap-2 font-raleway"
          >
            {action.label}
          </Button>
        )}

        {/* Decoração espiritual */}
        <div className="mt-8 flex justify-center gap-1 text-muted-foreground/20">
          {[...Array(7)].map((_, i) => (
            <Star key={i} className="w-2 h-2" fill="currentColor" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente para estados de carregamento específicos
interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = 'Consultando os astros...',
  description = 'Aguarde enquanto preparamos suas informações cósmicas.',
}: LoadingStateProps) {
  return (
    <Card className="bg-gradient-to-br from-card/50 to-card/30 border-border/50">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {/* Animação de loading com símbolos espirituais */}
        <div className="mb-6 flex items-center gap-1 text-primary">
          {[...Array(5)].map((_, i) => (
            <Sparkles 
              key={i} 
              className="w-6 h-6 animate-pulse" 
              style={{ 
                animationDelay: `${i * 0.1}s`,
                opacity: 0.3 + (i * 0.15)
              }} 
            />
          ))}
        </div>

        <h3 className="font-cinzel text-lg text-primary mb-2">
          {title}
        </h3>

        <p className="text-sm text-muted-foreground font-raleway">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export default EmptyState;
