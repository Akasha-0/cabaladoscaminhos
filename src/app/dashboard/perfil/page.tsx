'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/SupabaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { getInterpretacao } from '@/lib/numerologia';
import { useNumerologia, useCiclos, useOdus } from '@/lib/hooks';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Clock,
  Save,
  RefreshCw,
  Sparkles,
  Star,
  Moon,
  Sun,
  Zap,
  AlertCircle,
  Shield,
  CheckCircle
} from 'lucide-react';

// Default values for development/fallback form data
const {
  NOME_PADRAO,
  EMAIL_PADRAO,
  DATA_NASCIMENTO_PADRAO,
  HORA_NASCIMENTO_PADRAO,
  LOCAL_NASCIMENTO_PADRAO,
  SALVAR_SIMULADO_DURATION,
} = {
  NOME_PADRAO: 'Maria da Luz',
  EMAIL_PADRAO: 'maria.luz@exemplo.com',
  DATA_NASCIMENTO_PADRAO: '1990-06-15',
  HORA_NASCIMENTO_PADRAO: '14:30',
  LOCAL_NASCIMENTO_PADRAO: 'Rio de Janeiro, RJ',
  SALVAR_SIMULADO_DURATION: 1000,
};

const formDataInicial = {
  nomeCompleto: NOME_PADRAO,
  email: EMAIL_PADRAO,
  dataNascimento: DATA_NASCIMENTO_PADRAO,
  horaNascimento: HORA_NASCIMENTO_PADRAO,
  localNascimento: LOCAL_NASCIMENTO_PADRAO,
};

// fallow-ignore-next-line complexity
export default function PerfilPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(formDataInicial);
  const { user } = useAuth();
// fallow-ignore-next-line complexity
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        nomeCompleto: user.user_metadata?.nomeCompleto || user.user_metadata?.full_name || user.email?.split('@')[0] || prev.nomeCompleto,
        email: user.email || prev.email,
        dataNascimento: user.user_metadata?.dataNascimento || user.user_metadata?.data_nascimento || prev.dataNascimento,
        horaNascimento: user.user_metadata?.horaNascimento || prev.horaNascimento || '',
        localNascimento: user.user_metadata?.localNascimento || prev.localNascimento || '',
      }));
    }
  }, [user]);

  const { pitagorica, cabalistica, tantrica, loading: loadingNumerologia, error: errorNumerologia } = useNumerologia(
    formData.nomeCompleto,
    formData.dataNascimento
  );

  const { ano, mes, dia, loading: loadingCiclos, error: errorCiclos } = useCiclos(formData.dataNascimento);
  const { principal: odu, loading: loadingOdus, error: errorOdus } = useOdus(formData.dataNascimento);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSalvar = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, SALVAR_SIMULADO_DURATION));
    setIsSaving(false);
  };

  const interpretacaoPitagorica = pitagorica !== null ? getInterpretacao(pitagorica) : null;

  return (
    <div className="min-h-screen p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-cinzel text-primary tracking-wide">
              Seu Perfil Espiritual
            </h1>
            <p className="text-muted-foreground font-raleway mt-1">
              Dados pessoais e Mapa Natal Calculado
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalcular
            </Button>
            <Button onClick={handleSalvar} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {errorNumerologia && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">{errorNumerologia}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-cinzel text-primary flex items-center gap-2">
                <User className="w-5 h-5" />
                Dados Pessoais
              </CardTitle>
              <CardDescription className="font-raleway">
                Suas informações de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeCompleto" className="text-sm font-raleway">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="nomeCompleto"
                    name="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={handleChange}
                    className="pl-10 font-raleway"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-raleway">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 font-raleway"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento" className="text-sm font-raleway">Data de Nascimento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="dataNascimento"
                      name="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={handleChange}
                      className="pl-10 font-raleway"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaNascimento" className="text-sm font-raleway">Hora (opcional)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="horaNascimento"
                      name="horaNascimento"
                      type="time"
                      value={formData.horaNascimento}
                      onChange={handleChange}
                      className="pl-10 font-raleway"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="localNascimento" className="text-sm font-raleway">Local de Nascimento</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="localNascimento"
                    name="localNascimento"
                    value={formData.localNascimento}
                    onChange={handleChange}
                    className="pl-10 font-raleway"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg font-cinzel text-primary flex items-center gap-2">
                <Star className="w-5 h-5" />
                Números do Destino
              </CardTitle>
              <CardDescription className="font-raleway">
                Calculados a partir de seu nome e data de nascimento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingNumerologia ? (
             <div className="grid grid-cols-3 gap-3">
               <Skeleton className="h-20 rounded-lg" />
               <Skeleton className="h-20 rounded-lg" />
               <Skeleton className="h-20 rounded-lg" />
             </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className="text-2xl font-cinzel text-primary">{pitagorica ?? '-'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Pitagórico</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className="text-2xl font-cinzel text-primary">{cabalistica ?? '-'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Cabalístico</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
                    <div className="text-2xl font-cinzel text-primary">{tantrica ?? '-'}</div>
                    <div className="text-xs text-muted-foreground mt-1">Tântrico</div>
                  </div>
                </div>
              )}

              <Separator className="bg-border/30" />

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-primary">Interpretação do Número Principal</h4>
                {loadingNumerologia ? (
                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse bg-muted rounded" />
                    <div className="h-3 w-[80%] animate-pulse bg-muted rounded" />
                  </div>
                ) : interpretacaoPitagorica ? (
                  <>
                    <p className="text-xs text-muted-foreground font-raleway">
                      {interpretacaoPitagorica.significado}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        Sefirot: {interpretacaoPitagorica.sefirotRelacionado}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">Preencha os dados para ver a interpretação</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-cinzel text-primary flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Ciclos Temporais Atuais
            </CardTitle>
            <CardDescription className="font-raleway">
              Sua energia para o momento presente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingCiclos ? (
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Skeleton className="h-36 rounded-lg" />
               <Skeleton className="h-36 rounded-lg" />
               <Skeleton className="h-36 rounded-lg" />
             </div>
            ) : errorCiclos ? (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{errorCiclos}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-900/20 to-amber-950/50 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-medium text-amber-400">Ano Pessoal</span>
                  </div>
                  <div className="text-4xl font-cinzel text-amber-400 mb-2">{ano?.numero ?? '-'}</div>
                  <div className="text-sm font-raleway text-amber-400/70">{ano?.sefirot ?? '---'}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ano?.descricao?.nome ?? '---'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/20 to-blue-950/50 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Moon className="w-5 h-5 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">Mês Pessoal</span>
                  </div>
                  <div className="text-4xl font-cinzel text-blue-400 mb-2">{mes?.numero ?? '-'}</div>
                  <div className="text-sm font-raleway text-blue-400/70">{mes?.sefirot ?? '---'}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {mes?.descricao?.nome ?? '---'}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-900/20 to-purple-950/50 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-sm font-medium text-purple-400">Dia Pessoal</span>
                  </div>
                  <div className="text-4xl font-cinzel text-purple-400 mb-2">{dia?.numero ?? '-'}</div>
                  <div className="text-sm font-raleway text-purple-400/70">{dia?.sefirot ?? '---'}</div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {dia?.descricao?.nome ?? '---'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg font-cinzel text-primary flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Mapa Astral Simplificado
            </CardTitle>
            <CardDescription className="font-raleway">
              Visão integrada dos seus dados esotéricos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOdus ? (
              <div className="space-y-4">
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
                <Skeleton className="h-20 rounded-lg" />
              </div>
            ) : errorOdus ? (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{errorOdus}</p>
              </div>
            ) : odu ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 p-4 rounded-lg bg-gradient-to-br from-indigo-900/20 to-indigo-950/50 border border-indigo-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <span className="text-sm font-medium text-indigo-400">Odú Iorubá</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl font-cinzel text-indigo-400">{odu.numero}</div>
                      <div>
                        <div className="text-xl font-medium text-indigo-300">{odu.nome}</div>
                        <div className="text-sm text-indigo-400/70"> {odu.significado}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Sefirot: </span>
                        <span className="text-indigo-300">{(odu as any).sefirot}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Elementos: </span>
                        <span className="text-indigo-300">{odu.elementos}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 p-4 rounded-lg bg-gradient-to-br from-amber-900/20 to-amber-950/50 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-5 h-5 text-amber-400" />
                      <span className="text-sm font-medium text-amber-400">Orixá Regente</span>
                    </div>
                    <div className="text-3xl font-cinzel text-amber-400 mb-2">
                      {odu.orixaRegente || 'Não definido'}
                    </div>
                    <div className="text-sm text-amber-400/70">
                      {(odu as any).orixaRegenteSignificado || 'Aguardando dados de mapa astral completo'}
                    </div>
                  </div>
                </div>

                <Separator className="bg-border/30" />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-primary">Preceitos Cerimoniais</h4>
                  {!odu.preceitos || odu.preceitos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Preencha data de nascimento para ver preceitos</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {odu.preceitos.map((preceito: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                          {preceito}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-green-900/20 border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm text-green-400">Perfil Iorubá válido</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Preencha sua data de nascimento para ver o mapa astral</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
