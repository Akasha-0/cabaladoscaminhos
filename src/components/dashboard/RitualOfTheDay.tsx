'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles,
  Flame,
  Droplets,
  Wind,
  Leaf,
  Heart,
  Moon,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ScrollText
} from 'lucide-react';

// ============================================================
// Ritual data structure
// ============================================================
interface RitualStep {
  ordem: number;
  texto: string;
  duracao?: string;
}

interface EbóData {
  tipo: string;
  itens: string[];
  orixa: string;
}

interface RitualData {
  titulo: string;
  subtitulo: string;
  orixa: string;
  faseLua: string;
  ebó: EbóData;
  passos: RitualStep[];
  cuidados: string[];
  beneficios: string[];
}

// ============================================================
// Daily ritual based on current date
// ============================================================
function getRitualDoDia(): RitualData {
  const hoje = new Date();
  const diaDoAno = Math.floor((hoje.getTime() - new Date(hoje.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const odus = [
    { nome: 'Ogbe', orixa: 'Oxalá', fase: 'Lua Nova' },
    { nome: 'Oyekun', orixa: 'Omolu', fase: 'Lua Minguante' },
    { nome: 'Iwori', orixa: 'Oxalá/Oxum', fase: 'Lua Cheia' },
    { nome: 'Idí', orixa: 'Oxóssi', fase: 'Lua Crescente' },
    { nome: 'Oxé', orixa: 'Oxum', fase: 'Lua Nova' },
    { nome: 'Obará', orixa: 'Xangô', fase: 'Lua Minguante' },
    { nome: 'Odi', orixa: 'Omolu', fase: 'Lua Cheia' },
  ];
  
  const ritualIndex = diaDoAno % odus.length;
  const odu = odus[ritualIndex];
  
  const ebós: Record<string, EbóData> = {
    'Ogbe': {
      tipo: 'Ebó de Iluminação',
      itens: ['Canjica branca', 'Velas brancas', 'Algodão', 'Leite de coco'],
      orixa: 'Oxalá'
    },
    'Oyekun': {
      tipo: 'Ebó de Renascimento',
      itens: ['Pipoca (Deburu)', 'Banho de lama', 'Folhas de eucalipto', 'Velas pretas'],
      orixa: 'Omolu'
    },
    'Iwori': {
      tipo: 'Ebó de Harmonia',
      itens: ['Duas frutas amarela', 'Mel', 'Velas douradas', 'Flores'],
      orixa: 'Oxalá/Oxum'
    },
    'Idí': {
      tipo: 'Ebó de Prosperidade',
      itens: ['Amendoim', 'Milho', 'Velas verdes', 'Fio verde'],
      orixa: 'Oxóssi'
    },
    'Oxé': {
      tipo: 'Ebó de Atração',
      itens: ['Banho de mel', 'Calda de frutas', 'Girassóis', 'Moedas douradas'],
      orixa: 'Oxum'
    },
    'Obará': {
      tipo: 'Ebó de Fartura',
      itens: ['Seis tipos de frutas', 'Amalá', 'Velas vermelhas', 'Pimenta'],
      orixa: 'Xangô'
    },
    'Odi': {
      tipo: 'Ebó de Transmutação',
      itens: ['Pipoca', 'Argila', 'Defumação de alecrim', 'Velas roxas'],
      orixa: 'Omolu'
    },
  };

  const passosPadrao: RitualStep[] = [
    { ordem: 1, texto: 'Limpe o ambiente com defumação de ervas sagradas (alecrim, patchouli ou palmatória)', duracao: '10 min' },
    { ordem: 2, texto: 'Acenda as velas correspondentes à energia do Orixá do dia', duracao: '5 min' },
    { ordem: 3, texto: 'Faça uma oração de abertura conectando-se com seu Ori (cabeça)', duracao: '5 min' },
    { ordem: 4, texto: 'Prepare e ofereça o ebó segundo as instruções específicas', duracao: '15 min' },
    { ordem: 5, texto: 'Agradeça aos Orixás pela energia do dia e peça proteção', duracao: '5 min' },
    { ordem: 6, texto: 'Descanse em silêncio absorvendo a energia do ritual', duracao: '10 min' },
  ];

  return {
    titulo: `Ritual de ${odu.nome}`,
    subtitulo: 'Ritual do Dia - Cabala dos Caminhos',
    orixa: odu.orixa,
    faseLua: odu.fase,
    ebó: ebós[odu.nome] || ebós['Ogbe'],
    passos: passosPadrao,
    cuidados: [
      'Evite alimentos prohibitedos pelo Orixá do dia',
      'Mantenha pensamentos puros durante o ritual',
      'Não interrompa o ritual para atender chamadas',
      'Respeite o horário da janela energética',
      'Evite discussion sobre assuntos negativos'
    ],
    beneficios: [
      'Limpeza energética do campo áurico',
      'Abertura de caminhos espirituais',
      'Fortificação do Ori (cabeça)',
      'Conexão mais profunda com os Orixás',
      'Harmonização das energias do dia'
    ]
  };
}

// ============================================================
// Icon mapping
// ============================================================
function getOrixaIcon(orixa: string) {
  const normalized = orixa.toLowerCase();
  if (normalized.includes('oxalá')) return <Star className="w-5 h-5" />;
  if (normalized.includes('omolu')) return <AlertTriangle className="w-5 h-5" />;
  if (normalized.includes('oxum')) return <Droplets className="w-5 h-5" />;
  if (normalized.includes('xangô')) return <Flame className="w-5 h-5" />;
  if (normalized.includes('oxóssi')) return <Leaf className="w-5 h-5" />;
  if (normalized.includes('iansã')) return <Wind className="w-5 h-5" />;
  if (normalized.includes('ogum')) return <Sparkles className="w-5 h-5" />;
  if (normalized.includes('iemanjá')) return <Moon className="w-5 h-5" />;
  return <Heart className="w-5 h-5" />;
}

function getEbóIcon(tipo: string) {
  const normalized = tipo.toLowerCase();
  if (normalized.includes('iluminação')) return <Star className="w-4 h-4" />;
  if (normalized.includes('renascimento') || normalized.includes('transmutação')) return <Leaf className="w-4 h-4" />;
  if (normalized.includes('prosperidade') || normalized.includes('fartura')) return <Sparkles className="w-4 h-4" />;
  if (normalized.includes('atração')) return <Heart className="w-4 h-4" />;
  if (normalized.includes('defesa')) return <AlertTriangle className="w-4 h-4" />;
  return <Moon className="w-4 h-4" />;
}

// ============================================================
// Main Component
// ============================================================
export function RitualOfTheDay() {
  const [ritual, setRitual] = useState<RitualData | null>(null);

  useEffect(() => {
    setRitual(getRitualDoDia());
  }, []);

  if (!ritual) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/80">
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Sparkles className="w-8 h-8 animate-pulse text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-br from-amber-950/50 via-card to-orange-950/30 border-amber-500/30">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20">
                {getOrixaIcon(ritual.orixa)}
              </div>
              <div>
                <CardTitle className="text-2xl font-serif">{ritual.titulo}</CardTitle>
                <CardDescription className="text-amber-200/70">{ritual.subtitulo}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                <Moon className="w-3 h-3 mr-1" />
                {ritual.faseLua}
              </Badge>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {getOrixaIcon(ritual.orixa)}
                <span className="ml-1">{ritual.orixa}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Ebó Card */}
      <Card className="bg-gradient-to-br from-emerald-950/50 to-card border-emerald-500/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20">
              {getEbóIcon(ritual.ebó.tipo)}
            </div>
            <div>
              <CardTitle className="text-lg">Ebó do Dia</CardTitle>
              <CardDescription>{ritual.ebó.tipo}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Itens Necessários
              </h4>
              <ul className="space-y-1">
                {ritual.ebó.itens.map((item, idx) => (
                  <li key={idx} className="text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Orixá Responsável
              </h4>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10">
                {getOrixaIcon(ritual.ebó.orixa)}
                <span className="font-medium">{ritual.ebó.orixa}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions Tabs */}
      <Tabs defaultValue="passos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="passos" className="gap-2">
            <ScrollText className="w-4 h-4" />
            Passos
          </TabsTrigger>
          <TabsTrigger value="cuidados" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Cuidados
          </TabsTrigger>
          <TabsTrigger value="beneficios" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Benefícios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="passos">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {ritual.passos.map((passo) => (
                  <div 
                    key={passo.ordem} 
                    className="flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                      {passo.ordem}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{passo.texto}</p>
                      {passo.duracao && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {passo.duracao}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cuidados">
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {ritual.cuidados.map((cuidado, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                    <span className="text-sm">{cuidado}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beneficios">
          <Card>
            <CardContent className="pt-6">
              <ul className="space-y-3">
                {ritual.beneficios.map((beneficio, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">{beneficio}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}