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
  CheckCircle,
} from 'lucide-react';
// ─── Default values ─────────────────────────────────────────────────────────
const NOME_PADRAO = 'Maria da Luz';
const EMAIL_PADRAO = 'maria.luz@exemplo.com';
const DATA_NASCIMENTO_PADRAO = '1990-06-15';
const HORA_NASCIMENTO_PADRAO = '14:30';
const LOCAL_NASCIMENTO_PADRAO = 'Rio de Janeiro, RJ';
const SALVAR_SIMULADO_DURATION = 1000;
const FORM_DATA_INICIAL = {
  nomeCompleto: NOME_PADRAO,
  email: EMAIL_PADRAO,
  dataNascimento: DATA_NASCIMENTO_PADRAO,
  horaNascimento: HORA_NASCIMENTO_PADRAO,
  localNascimento: LOCAL_NASCIMENTO_PADRAO,
} as const;
// ─── Types ───────────────────────────────────────────────────────────────────
interface FormData {
  nomeCompleto: string;
  email: string;
  dataNascimento: string;
  horaNascimento: string;
  localNascimento: string;
}
// ─── Helper functions ────────────────────────────────────────────────────────
function buildFormDataFromUser(user: { email?: string; user_metadata?: Record<string, string> } | null, prev: FormData): FormData {
  if (!user) return prev;
  const meta = user.user_metadata ?? {};
  return {
    nomeCompleto: meta.nomeCompleto || meta.full_name || user.email?.split('@')[0] || prev.nomeCompleto,
    email: user.email || prev.email,
    dataNascimento: meta.dataNascimento || meta.data_nascimento || prev.dataNascimento,
    horaNascimento: meta.horaNascimento || prev.horaNascimento || '',
    localNascimento: meta.localNascimento || prev.localNascimento || '',
  };
}
// ─── Sub-components ──────────────────────────────────────────────────────────
function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-destructive" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
function LoadingSkeletons({ cols = 3, height = 'h-20' }: { cols?: number; height?: string }) {
  return (
    <div className={`grid grid-cols-${cols} gap-3`}>
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={`${height} rounded-lg`} />
      ))}
    </div>
  );
}
// ─── Card: Dados Pessoais ───────────────────────────────────────────────────
interface DadosPessoaisCardProps {
  formData: FormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
function DadosPessoaisCard({ formData, onChange }: DadosPessoaisCardProps) {
  return (
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
        <FormField
          id="nomeCompleto"
          label="Nome Completo"
          name="nomeCompleto"
          value={formData.nomeCompleto}
          onChange={onChange}
          icon={<User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
        />
        <FormField
          id="email"
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={onChange}
          icon={<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="dataNascimento"
            label="Data de Nascimento"
            name="dataNascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={onChange}
            icon={<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
          />
          <FormField
            id="horaNascimento"
            label="Hora (opcional)"
            name="horaNascimento"
            type="time"
            value={formData.horaNascimento}
            onChange={onChange}
            icon={<Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
          />
        </div>
        <FormField
          id="localNascimento"
          label="Local de Nascimento"
          name="localNascimento"
          value={formData.localNascimento}
          onChange={onChange}
          icon={<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />}
        />
      </CardContent>
    </Card>
  );
}
interface FormFieldProps {
  id: string;
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
}
function FormField({ id, label, name, type = 'text', value, onChange, icon }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-raleway">{label}</Label>
      <div className="relative">
        {icon}
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          className="pl-10 font-raleway"
        />
      </div>
    </div>
  );
}
// ─── Card: Números do Destino ────────────────────────────────────────────────
interface NumerosDestinoCardProps {
  pitagorica: number | null;
  cabalistica: number | null;
  tantrica: number | null;
  interpretacaoPitagorica: ReturnType<typeof getInterpretacao> | null;
  loading: boolean;
}
function NumerosDestinoCard({ pitagorica, cabalistica, tantrica, interpretacaoPitagorica, loading }: NumerosDestinoCardProps) {
  return (
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
        {loading ? (
          <LoadingSkeletons cols={3} height="h-20" />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <NumberBox label="Pitagórico" value={pitagorica} />
            <NumberBox label="Cabalístico" value={cabalistica} />
            <NumberBox label="Tântrico" value={tantrica} />
          </div>
        )}
        <Separator className="bg-border/30" />
        <InterpretacaoSection interpretacao={interpretacaoPitagorica} loading={loading} />
      </CardContent>
    </Card>
  );
}
function NumberBox({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="text-center p-3 rounded-lg bg-background/50 border border-border/30">
      <div className="text-2xl font-cinzel text-primary">{value ?? '-'}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
interface InterpretacaoSectionProps {
  interpretacao: ReturnType<typeof getInterpretacao> | null;
  loading: boolean;
}
function InterpretacaoSection({ interpretacao, loading }: InterpretacaoSectionProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-primary">Interpretação do Número Principal</h4>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse bg-muted rounded" />
          <div className="h-3 w-[80%] animate-pulse bg-muted rounded" />
        </div>
      ) : interpretacao ? (
        <>
          <p className="text-xs text-muted-foreground font-raleway">
            {interpretacao.significado}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              Sefirot: {interpretacao.sefirotRelacionado}
            </Badge>
          </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground">Preencha os dados para ver a interpretação</p>
      )}
    </div>
  );
}
// ─── Card: Ciclos Temporais Atuais ─────────────────────────────────────────
interface CiclosTemporaisCardProps {
  ano: number | null;
  mes: number | null;
  dia: number | null;
  loading: boolean;
  error: string | null;
}
function CiclosTemporaisCard({ ano, mes, dia, loading, error }: CiclosTemporaisCardProps) {
  return (
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
        {loading ? (
          <LoadingSkeletons cols={3} height="h-36" />
        ) : error ? (
          <ErrorAlert message={error} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CicloBox
              icon={<Sun className="w-5 h-5 text-amber-400" />}
              title="Ano Pessoal"
              colorClass="from-amber-900/20 to-amber-950/50"
              borderClass="border-amber-500/30"
              numero={ano}
            />
            <CicloBox
              icon={<Moon className="w-5 h-5 text-blue-400" />}
              title="Mês Pessoal"
              colorClass="from-blue-900/20 to-blue-950/50"
              borderClass="border-blue-500/30"
              numero={mes}
            />
            <CicloBox
              icon={<Sparkles className="w-5 h-5 text-purple-400" />}
              title="Dia Pessoal"
              colorClass="from-purple-900/20 to-purple-950/50"
              borderClass="border-purple-500/30"
              numero={dia}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
interface CicloBoxProps {
  icon: React.ReactNode;
  title: string;
  colorClass: string;
  borderClass: string;
  numero: number | null;
  sefirot?: string;
  nome?: string;
  color?: string;
}
function CicloBox({ icon, title, colorClass, borderClass, numero, sefirot, nome, color = 'amber' }: CicloBoxProps) {
  return (
    <div className={`p-4 rounded-lg bg-gradient-to-br ${colorClass} border ${borderClass}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm font-medium text-amber-400">{title}</span>
      </div>
      <div className={`text-4xl font-cinzel text-${color}-400 mb-2`}>{numero ?? '-'}</div>
      <div className={`text-sm font-raleway text-${color}-400/70`}>{sefirot ?? '---'}</div>
      <p className="text-xs text-muted-foreground mt-2">
        {nome ?? '---'}
      </p>
    </div>
  );
}
// ─── Card: Mapa Astral Simplificado ─────────────────────────────────────────
interface MapaAstralCardProps {
  odu: { numero?: number; nome?: string; significado?: string; sefirot?: string; elementos?: string; orixaRegente?: string; orixaRegenteSignificado?: string; preceitos?: string[] } | null;
  loading: boolean;
  error: string | null;
}
function MapaAstralCard({ odu, loading, error }: MapaAstralCardProps) {
  return (
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
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        ) : error ? (
          <ErrorAlert message={error} />
        ) : odu ? (
          <MapaAstralContent odu={odu} />
        ) : (
          <p className="text-muted-foreground">Preencha sua data de nascimento para ver o mapa astral</p>
        )}
      </CardContent>
    </Card>
  );
}
interface MapaAstralContentProps {
  odu: { numero?: number; nome?: string; significado?: string; sefirot?: string; elementos?: string; orixaRegente?: string; orixaRegenteSignificado?: string; preceitos?: string[] };
}
function MapaAstralContent({ odu }: MapaAstralContentProps) {
  const preceitos = odu.preceitos ?? [];
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <OduCard odu={odu} />
        <OrixaCard odu={odu} />
      </div>
      <Separator className="bg-border/30" />
      <PreceitosSection preceitos={preceitos} />
      <div className="flex items-center justify-between p-3 rounded-lg bg-green-900/20 border border-green-500/30">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">Perfil Iorubá válido</span>
        </div>
      </div>
    </div>
  );
}
function OduCard({ odu }: { odu: MapaAstralContentProps['odu'] }) {
  return (
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
          <span className="text-indigo-300">{odu.sefirot}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Elementos: </span>
          <span className="text-indigo-300">{odu.elementos}</span>
        </div>
      </div>
    </div>
  );
}
function OrixaCard({ odu }: { odu: MapaAstralContentProps['odu'] }) {
  return (
    <div className="flex-1 p-4 rounded-lg bg-gradient-to-br from-amber-900/20 to-amber-950/50 border border-amber-500/30">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-5 h-5 text-amber-400" />
        <span className="text-sm font-medium text-amber-400">Orixá Regente</span>
      </div>
      <div className="text-3xl font-cinzel text-amber-400 mb-2">
        {odu.orixaRegente || 'Não definido'}
      </div>
      <div className="text-sm text-amber-400/70">
        {odu.orixaRegenteSignificado || 'Aguardando dados de mapa astral completo'}
      </div>
    </div>
  );
}
function PreceitosSection({ preceitos }: { preceitos: string[] }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-primary">Preceitos Cerimoniais</h4>
      {preceitos.length === 0 ? (
        <p className="text-sm text-muted-foreground">Preencha data de nascimento para ver preceitos</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {preceitos.map((preceito, index) => (
            <Badge key={index} variant="outline" className="text-xs border-amber-500/30 text-amber-400">
              {preceito}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── Page header ─────────────────────────────────────────────────────────────
interface PageHeaderProps {
  isSaving: boolean;
  onSalvar: () => void;
}
function PageHeader({ isSaving, onSalvar }: PageHeaderProps) {
  return (
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
        <Button onClick={onSalvar} disabled={isSaving}>
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
}
// ─── Main page ───────────────────────────────────────────────────────────────
export default function PerfilPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<FormData>(FORM_DATA_INICIAL);
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      setFormData(prev => buildFormDataFromUser(user, prev));
    }
  }, [user]);
  const { pitagorica, cabalistica, tantrica, loading: loadingNumerologia, error: errorNumerologia } = useNumerologia(
    formData.nomeCompleto,
    formData.dataNascimento
  );
  const { ano, mes, dia, loading: loadingCiclos, error: errorCiclos } = useCiclos(formData.dataNascimento);
  const { loading: loadingOdus, error: errorOdus } = useOdus(formData.dataNascimento);
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
        <PageHeader isSaving={isSaving} onSalvar={handleSalvar} />
        {errorNumerologia && <ErrorAlert message={errorNumerologia} />}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DadosPessoaisCard formData={formData} onChange={handleChange} />
          <NumerosDestinoCard
            pitagorica={pitagorica}
            cabalistica={cabalistica}
            tantrica={tantrica}
            interpretacaoPitagorica={interpretacaoPitagorica}
            loading={loadingNumerologia}
          />
        </div>
        <CiclosTemporaisCard
          ano={ano}
          mes={mes}
          dia={dia}
          loading={loadingCiclos}
          error={errorCiclos}
        />
        <MapaAstralCard
          odu={null}
          loading={loadingOdus}
          error={errorOdus}
        />
      </div>
    </div>
  );
}