'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SkeletonNumeros, SkeletonCiclos, Skeleton } from '@/components/ui/skeleton';
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

export default function PerfilPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    nomeCompleto: 'Maria da Luz',
    email: 'maria.luz@exemplo.com',
    dataNascimento: '1990-06-15',
    horaNascimento: '14:30',
    localNascimento: 'Rio de Janeiro, RJ'
  });

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
    await new Promise(resolve => setTimeout(resolve, 1000));
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
                <SkeletonNumeros />
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
              <SkeletonCiclos />
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
              <Shield className="w-5 h-5" />
              Seu Odú de Nascimento
            </CardTitle>
            <CardDescription className="font-raleway">
              Preceitos e quizilas do seu caminho espiritual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loadingOdus ? (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
              </div>
            ) : errorOdus ? (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <p className="text-sm text-destructive">{errorOdus}</p>
              </div>
            ) : odu ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-gradient-to-br from-amber-900/20 to-amber-950/50 border border-amber-500/30">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl font-cinzel text-amber-400">{odu.numero}</span>
                    <div>
                      <h3 className="font-cinzel text-amber-400 text-lg">{odu.nome}</h3>
                      <p className="text-sm text-amber-400/70">{odu.orixaRegente}</p>
                    </div>
                  </div>
                  <p className="text-sm font-raleway text-muted-foreground">
                    {odu.significado}
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Quizilas (Evitar)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {odu.quizilas.map((quizila, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {quizila}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Preceitos
                    </h4>
                    <div className="space-y-1">
                      {odu.preceitos.map((preceito, index) => (
                        <p key={index} className="text-sm font-raleway text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          {preceito}
                        </p>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-border/30" />

                  <div>
                    <h4 className="text-sm font-medium text-primary mb-2">
                      Ebós Recomendados
                    </h4>
                    <div className="space-y-1">
                      {odu.ebos.map((ebo, index) => (
                        <p key={index} className="text-sm font-raleway text-muted-foreground">
                          • {ebo}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Insira sua data de nascimento para ver seu Odú
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}