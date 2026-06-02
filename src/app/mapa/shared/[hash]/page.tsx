'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skull, Sparkles, Star, Sun, Moon, Zap, AlertCircle } from 'lucide-react';
import MapaNatal from '@/components/dashboard/MapaNatal';

interface MapaData {
  id: string;
  created_at: string;
  numerologia: {
    numero_vida: number;
    numero_destino: number;
    numero_alma: number;
    numero_personalidade: number;
  };
  odu: {
    nome: string;
    numero: number;
    orixas: string[];
    quizilas: string[];
    preceitos: string;
  };
  astrologia: {
    signo: string;
    ascendente: string;
    planetas: Record<string, string>;
    planeta?: Record<string, { planeta: string; longitude: number; latitude: number; distancia: number; velocidade: number; signo: string; casa: number; grauNoSigno: number }>;
    casas?: Array<{ numero: number; signo: string; grauNoSigno: number }>;
    ascendenteDegree?: number;
    mediumCoeli?: number;
  };
  tarot: {
    carta_nascimento: number;
    carta_ano_pessoal: number;
  };
  orixas: string[];
  sefirot: string[];
  convergencias?: Array<{
    energia: string;
    forca: 'simples' | 'dupla' | 'tripla';
    descricao: string;
  }>;
}

const ARCANOS_MAIORES = [
  'O Mago', 'A Sacerdotisa', 'A Imperatriz', 'O Imperador', 'O Hierofante',
  'Os Enamorados', 'O Carro', 'A Força', 'O Eremita', 'A Roda da Fortuna',
  'A Justiça', 'O Louco', 'O Enforcado', 'A Morte', 'A Temperança',
  'O Diabo', 'A Torre', 'A Estrela', 'A Lua', 'O Sol',
  'O Julgamento', 'O Mundo'
];

function getForcaColor(forca: string): string {
  switch (forca) {
    case 'tripla': return 'bg-purple-500';
    case 'dupla': return 'bg-blue-500';
    default: return 'bg-emerald-500';
  }
}

export default function SharedMapaPage({ params }: { params: { hash: string } }) {
  const [mapa, setMapa] = useState<MapaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSharedMapa() {
      try {
        const response = await fetch(`/api/mapa/share?hash=${params.hash}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Link de compartilhamento não encontrado ou expirado.');
          } else if (response.status === 410) {
            setError('Este link de compartilhamento expirou.');
          } else {
            setError('Erro ao carregar Mapa Compartilhado.');
          }
          setLoading(false);
          return;
        }

        const result = await response.json();

        if (result.data) {
          // Data is stored directly in share entry
          setMapa(result.data);
        } else if (result.mapaId) {
          // Need to fetch mapa by ID (not implemented in MVP)
          setError('Dados do Mapa não disponíveis. Por favor, gere um novo Mapa.');
        }
      } catch (err) {
        setError('Erro ao conectar com o servidor.');
      } finally {
        setLoading(false);
      }
    }

    fetchSharedMapa();
  }, [params.hash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Carregando Mapa Compartilhado...</p>
        </div>
      </div>
    );
  }

  if (error || !mapa) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <Card className="bg-slate-900 border-slate-800 max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-6 h-6" />
              Erro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{error || 'Não foi possível carregar o Mapa.'}</p>
            <p className="text-slate-500 text-sm mt-4">
              Solicite um novo link de compartilhamento ao proprietário do Mapa.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cartaNascimento = ARCANOS_MAIORES[mapa.tarot.carta_nascimento] || 'Desconhecido';
  const cartaAnoPessoal = ARCANOS_MAIORES[mapa.tarot.carta_ano_pessoal] || 'Desconhecido';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Mapa da Alma Compartilhado
          </h1>
          <p className="text-slate-400 text-sm">
            Visualização apenas para leitura
          </p>
        </div>

        {/* Mapa Natal */}
        {mapa.astrologia.planeta && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Mapa Natal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MapaNatal mapaNatal={mapa.astrologia.planeta || {}} />
            </CardContent>
          </Card>
         )}

        {/* Numerologia */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Numerologia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">Número da Vida</p>
                <p className="text-3xl font-bold text-purple-400">{mapa.numerologia.numero_vida}</p>
              </div>
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">Destino</p>
                <p className="text-3xl font-bold text-pink-400">{mapa.numerologia.numero_destino}</p>
              </div>
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">Alma</p>
                <p className="text-3xl font-bold text-blue-400">{mapa.numerologia.numero_alma}</p>
              </div>
              <div className="text-center p-4 bg-slate-800 rounded-lg">
                <p className="text-slate-400 text-sm mb-1">Personalidade</p>
                <p className="text-3xl font-bold text-emerald-400">{mapa.numerologia.numero_personalidade}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Odu */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Skull className="w-5 h-5 text-orange-400" />
              Odu - {mapa.odu.nome} ({mapa.odu.numero})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-slate-400 text-sm mb-2">Orixás</p>
              <div className="flex flex-wrap gap-2">
                {mapa.odu.orixas.map((orixa, i) => (
                  <Badge key={i} variant="outline" className="border-orange-500 text-orange-400">
                    {orixa}
                  </Badge>
                ))}
              </div>
            </div>
            {mapa.odu.quizilas.length > 0 && (
              <div>
                <p className="text-slate-400 text-sm mb-2">Quizilas</p>
                <div className="flex flex-wrap gap-2">
                  {mapa.odu.quizilas.map((quizila, i) => (
                    <Badge key={i} variant="outline" className="border-red-500/50 text-red-400/70">
                      {quizila}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="p-3 bg-slate-800/50 rounded-lg">
              <p className="text-slate-300 text-sm">{mapa.odu.preceitos}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tarot */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              Tarot
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Carta de Nascimento</p>
              <p className="text-xl font-semibold text-yellow-400">{cartaNascimento}</p>
              <p className="text-slate-500 text-sm">#{mapa.tarot.carta_nascimento + 1}</p>
            </div>
            <div className="p-4 bg-slate-800 rounded-lg">
              <p className="text-slate-400 text-sm mb-1">Carta do Ano Pessoal</p>
              <p className="text-xl font-semibold text-amber-400">{cartaAnoPessoal}</p>
              <p className="text-slate-500 text-sm">#{mapa.tarot.carta_ano_pessoal + 1}</p>
            </div>
          </CardContent>
        </Card>

        {/* Orixás e Sefirot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                Orixás
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mapa.orixas.map((orixa, i) => (
                  <Badge key={i} className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    {orixa}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-400" />
                Sefirot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {mapa.sefirot.map((sefira, i) => (
                  <Badge key={i} className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30">
                    {sefira}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Convergências */}
        {mapa.convergencias && mapa.convergencias.length > 0 && (
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Convergências
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mapa.convergencias.map((conv, i) => (
                <div key={i} className="p-3 bg-slate-800/50 rounded-lg flex items-start gap-3">
                  <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${getForcaColor(conv.forca)}`} />
                  <div>
                    <p className="font-medium text-emerald-400">{conv.energia}</p>
                    <p className="text-slate-300 text-sm">{conv.descricao}</p>
                    <Badge variant="outline" className="mt-1 border-slate-600 text-slate-400 text-xs">
                      {conv.forca === 'tripla' ? 'Tripla' : conv.forca === 'dupla' ? 'Dupla' : 'Simples'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-slate-500 text-sm py-4">
          <p>Mapa da Alma - Cabala dos Caminhos</p>
        </div>
      </div>
    </div>
  );
}
