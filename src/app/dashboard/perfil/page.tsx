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
import { WidgetStat, WidgetProgress } from '@/components/dashboard/SpiritualWidgetSystem';
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
  CheckCircle,
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

export default function PerfilPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(formDataInicial);
  const { user } = useAuth();

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
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-cinzel bg-gradient-to-r from-amber-400 via-violet-400 to-amber-400 bg-clip-text text-transparent tracking-wide">
              Seu Perfil Espiritual
            </h1>
            <p className="text-slate-400 font-raleway mt-1">
              Dados pessoais e Mapa Natal Calculado
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => window.location.reload()} className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Recalcular
            </Button>
            <Button onClick={handleSalvar} disabled={isSaving} className="bg-gradient-to-r from-amber-500 to-violet-500 hover:from-amber-600 hover:to-violet-600 text-white border-0">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>

        {errorNumerologia && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-sm text-red-400">{errorNumerologia}</p>
          </div>
        )}

        {/* Row 1: Personal Data + Destiny Numbers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Data */}
          <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800/50">
              <CardTitle className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-amber-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-base font-semibold bg-gradient-to-r from-amber-400 to-violet-400 bg-clip-text text-transparent">
                  Dados Pessoais
                </span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Suas informações de cadastro
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nomeCompleto" className="text-sm text-slate-300">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="nomeCompleto"
                    name="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={handleChange}
                    className="pl-10 bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-slate-300">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataNascimento" className="text-sm text-slate-300">Data de Nascimento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="dataNascimento"
                      name="dataNascimento"
                      type="date"
                      value={formData.dataNascimento}
                      onChange={handleChange}
                      className="pl-10 bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaNascimento" className="text-sm text-slate-300">Hora (opcional)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <Input
                      id="horaNascimento"
                      name="horaNascimento"
                      type="time"
                      value={formData.horaNascimento}
                      onChange={handleChange}
                      className="pl-10 bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="localNascimento" className="text-sm text-slate-300">Local de Nascimento</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="localNascimento"
                    name="localNascimento"
                    value={formData.localNascimento}
                    onChange={handleChange}
                    className="pl-10 bg-slate-800/50 border-slate-700/50 focus:border-amber-500/50"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destiny Numbers */}
          <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-800/50">
              <CardTitle className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Star className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-base font-semibold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
                  Números do Destino
                </span>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Calculados a partir de seu nome e data de nascimento
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {loadingNumerologia ? (
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-24 rounded-xl bg-slate-800/50" />
                  <Skeleton className="h-24 rounded-xl bg-slate-800/50" />
                  <Skeleton className="h-24 rounded-xl bg-slate-800/50" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
                    <div className="text-3xl font-cinzel text-amber-400">{pitagorica ?? '-'}</div>
                    <div className="text-xs text-amber-400/70 mt-1">Pitagórico</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20">
                    <div className="text-3xl font-cinzel text-violet-400">{cabalistica ?? '-'}</div>
                    <div className="text-xs text-violet-400/70 mt-1">Cabalístico</div>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-500/5 border border-pink-500/20">
                    <div className="text-3xl font-cinzel text-pink-400">{tantrica ?? '-'}</div>
                    <div className="text-xs text-pink-400/70 mt-1">Tântrico</div>
                  </div>
                </div>
              )}

              <Separator className="bg-slate-800/50" />

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-300">Interpretação do Número Principal</h4>
                {loadingNumerologia ? (
                  <div className="space-y-2">
                    <div className="h-3 w-full animate-pulse bg-slate-800 rounded" />
                    <div className="h-3 w-[80%] animate-pulse bg-slate-800 rounded" />
                  </div>
                ) : interpretacaoPitagorica ? (
                  <>
                    <p className="text-xs text-slate-400">
                      {interpretacaoPitagorica.significado}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs border-violet-500/30 text-violet-400">
                        Sefirot: {interpretacaoPitagorica.sefirotRelacionado}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">Preencha os dados para ver a interpretação</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Row 2: Cycles */}
        <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/10 to-amber-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-base font-semibold bg-gradient-to-r from-cyan-400 to-amber-400 bg-clip-text text-transparent">
                Ciclos Temporais Atuais
              </span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sua energia para o momento presente
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingCiclos ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Skeleton className="h-40 rounded-xl bg-slate-800/50" />
                <Skeleton className="h-40 rounded-xl bg-slate-800/50" />
                <Skeleton className="h-40 rounded-xl bg-slate-800/50" />
              </div>
            ) : errorCiclos ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-400">{errorCiclos}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-950/30 border border-amber-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <Sun className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-sm font-medium text-amber-400">Ano Pessoal</span>
                  </div>
                  <div className="text-5xl font-cinzel text-amber-400 mb-2">{ano?.numero ?? '-'}</div>
                  <div className="text-sm text-amber-400/70">{ano?.sefirot ?? '---'}</div>
                  <p className="text-xs text-slate-400 mt-2">
                    {ano?.descricao?.nome ?? '---'}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-950/30 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-blue-400">Mês Pessoal</span>
                  </div>
                  <div className="text-5xl font-cinzel text-blue-400 mb-2">{mes?.numero ?? '-'}</div>
                  <div className="text-sm text-blue-400/70">{mes?.sefirot ?? '---'}</div>
                  <p className="text-xs text-slate-400 mt-2">
                    {mes?.descricao?.nome ?? '---'}
                  </p>
                </div>

                <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-950/30 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-purple-400">Dia Pessoal</span>
                  </div>
                  <div className="text-5xl font-cinzel text-purple-400 mb-2">{dia?.numero ?? '-'}</div>
                  <div className="text-sm text-purple-400/70">{dia?.sefirot ?? '---'}</div>
                  <p className="text-xs text-slate-400 mt-2">
                    {dia?.descricao?.nome ?? '---'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Row 3: Astrological Map */}
        <Card className="card-spiritual bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-sm border-slate-800/50 overflow-hidden">
          <CardHeader className="pb-3 border-b border-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Moon className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-base font-semibold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Mapa Astral Simplificado
              </span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              Visão integrada dos seus dados esotéricos
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingOdus ? (
              <div className="space-y-4">
                <Skeleton className="h-24 rounded-xl bg-slate-800/50" />
                <Skeleton className="h-24 rounded-xl bg-slate-800/50" />
                <Skeleton className="h-16 rounded-xl bg-slate-800/50" />
              </div>
            ) : errorOdus ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-sm text-red-400">{errorOdus}</p>
              </div>
            ) : odu ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-950/30 border border-indigo-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <Moon className="w-4 h-4 text-indigo-400" />
                      </div>
                      <span className="text-sm font-medium text-indigo-400">Odú Iorubá</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-4xl font-cinzel text-indigo-400">{odu.numero}</div>
                      <div>
                        <div className="text-xl font-medium text-indigo-300">{odu.nome}</div>
                        <div className="text-sm text-indigo-400/70">{odu.significado}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-slate-500">Sefirot: </span>
                        <span className="text-indigo-300">{(odu as any).sefirot}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Elementos: </span>
                        <span className="text-indigo-300">{odu.elementos}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-950/30 border border-amber-500/30">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-amber-400" />
                      </div>
                      <span className="text-sm font-medium text-amber-400">Orixá Regente</span>
                    </div>
                    <div className="text-4xl font-cinzel text-amber-400 mb-2">
                      {odu.orixaRegente || 'Não definido'}
                    </div>
                    <div className="text-sm text-amber-400/70">
                      {(odu as any).orixaRegenteSignificado || 'Aguardando dados de mapa astral completo'}
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-800/50" />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-300">Preceitos Cerimoniais</h4>
                  {!odu.preceitos || odu.preceitos.length === 0 ? (
                    <p className="text-sm text-slate-400">Preencha data de nascimento para ver preceitos</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {odu.preceitos.map((preceito: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-500/5">
                          {preceito}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Perfil Iorubá válido</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">Preencha sua data de nascimento para ver o mapa astral</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}