'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Star, Moon, Sun } from 'lucide-react';
import MapaNatal from '@/components/dashboard/MapaNatal';
import ChakraBalanceWidget from '@/components/dashboard/ChakraBalanceWidget';
import { NumerologiaCard } from '@/components/mapa/NumerologiaCard';
import { OduCardFull } from '@/components/mapa/OduCardFull';
import { ConvergenciasCard } from '@/components/mapa/ConvergenciasCard';
import type { MapaAlmaCompleto } from '@/lib/engines/types/mapa-alma';

// ============================================================
// TYPES
// ============================================================

interface BirthProfile {
  nomeCompleto: string;
  dataNascimento: string;
  hora?: string;
  cidade?: string;
  estado?: string;
  pais?: string;
}

// ============================================================
// TAROT ARCANOS
// ============================================================

const TAROT_ARCANOS: Record<number, { nome: string; simbolo: string }> = {
  0: { nome: 'O Louco', simbolo: '⚪' },
  1: { nome: 'O Mago', simbolo: '🪄' },
  2: { nome: 'A Sacerdotisa', simbolo: '🌙' },
  3: { nome: 'A Imperatriz', simbolo: '🌸' },
  4: { nome: 'O Imperador', simbolo: '👑' },
  5: { nome: 'O Papa', simbolo: '📿' },
  6: { nome: 'Os Enamorados', simbolo: '💕' },
  7: { nome: 'O Carro', simbolo: '⚔️' },
  8: { nome: 'A Justiça', simbolo: '⚖️' },
  9: { nome: 'O Eremita', simbolo: '🕯️' },
  10: { nome: 'A Roda da Fortuna', simbolo: '🎡' },
  11: { nome: 'A Força', simbolo: '🦁' },
  12: { nome: 'O Enforcado', simbolo: '🔄' },
  13: { nome: 'A Morte', simbolo: '💀' },
  14: { nome: 'A Temperança', simbolo: '🌊' },
  15: { nome: 'O Diabo', simbolo: '🔥' },
  16: { nome: 'A Torre', simbolo: '🗼' },
  17: { nome: 'A Estrela', simbolo: '⭐' },
  18: { nome: 'A Lua', simbolo: '🌕' },
  19: { nome: 'O Sol', simbolo: '☀️' },
  20: { nome: 'O Julgamento', simbolo: '🎺' },
  21: { nome: 'O Mundo', simbolo: '🌍' },
  22: { nome: 'O Aleph', simbolo: '✡️' },
};

function getArcanaInfo(numero: number) {
  return TAROT_ARCANOS[numero] || { nome: `Arcana ${numero}`, simbolo: '✦' };
}

// ============================================================
// ZODIAC SIGN HELPERS
// ============================================================

const SIGNOS_PORTUGUES: Record<string, string> = {
  aries: 'Áries',
  touro: 'Touro',
  gemeos: 'Gêmeos',
  cancer: 'Câncer',
  leao: 'Leão',
  virgem: 'Virgem',
  libra: 'Libra',
  escorpiao: 'Escorpião',
  sagitario: 'Sagitário',
  capricornio: 'Capricórnio',
  aquario: 'Aquário',
  peixes: 'Peixes',
};

function formatSigno(signo: string | undefined): string {
  if (!signo) return '—';
  return SIGNOS_PORTUGUES[signo.toLowerCase()] || signo;
}

// ============================================================
// ASTROLOGIA SECTION
// ============================================================

interface AstrologiaSectionProps {
  astrologia: MapaAlmaCompleto['astrologia'];
}
function AstrologiaSection({ astrologia }: AstrologiaSectionProps) {
  const mapaNatal = astrologia.raw;
  const ascendente = mapaNatal?.ascendente;
  return (
    <Card className="bg-slate-900 border-slate-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-amber-400 flex items-center gap-2">
          <Sun className="w-5 h-5" />
          Mapa Natal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mapa Natal Wheel */}
        {mapaNatal && (
          <div className="flex justify-center py-4">
            <MapaNatal mapaNatal={mapaNatal} size={360} />
          </div>
        )}
        {/* Key positions */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Sol</div>
            <div className="text-lg font-semibold text-amber-400">
              {formatSigno(mapaNatal?.planeta?.sol?.signo)}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Ascendente</div>
            <div className="text-lg font-semibold text-cyan-400">
              {ascendente !== undefined ? `${Math.round(ascendente)}°` : '—'}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Lua</div>
            <div className="text-lg font-semibold text-violet-400">
              {formatSigno(mapaNatal?.planeta?.lua?.signo)}
            </div>
          </div>
        </div>
        {/* Aspects summary */}
        {astrologia.aspectos && astrologia.aspectos.length > 0 && (
          <div>
            <div className="text-sm text-slate-400 uppercase tracking-wide mb-2">Aspectos Principais</div>
            <div className="flex flex-wrap gap-2">
              {astrologia.aspectos.slice(0, 6).map((aspecto, i) => (
                <Badge
                  key={i}
                  variant="outline"
                  className="bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                >
                  {aspecto.tipo}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
// ============================================================
// TAROT BIRTH CARD SECTION
// ============================================================

// ============================================================
// TAROT BIRTH CARD SECTION
// ============================================================

interface TarotCardDisplayProps {
  carta: number;
  tipo: string;
}

function TarotCardDisplay({ carta, tipo }: TarotCardDisplayProps) {
  const arcano = getArcanaInfo(carta);
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 text-center border border-amber-400/20">
      <div className="text-4xl mb-2">{arcano.simbolo}</div>
      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">{tipo}</div>
      <div className="text-lg font-bold text-amber-400">{arcano.nome}</div>
      <div className="text-sm text-slate-500">#{carta}</div>
    </div>
  );
}

// ============================================================
// CHAKRAS SECTION
// ============================================================

function ChakrasSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChakraBalanceWidget />
    </div>
  );
}

// ============================================================
// ORIXÁS DOMINANTES SECTION
// ============================================================

interface OrixasSectionProps {
  orixas: string[];
}

function OrixasSection({ orixas }: OrixasSectionProps) {
  if (!orixas || orixas.length === 0) return null;

  return (
    <Card className="bg-slate-900 border-slate-700/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-amber-400 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Orixás Dominantes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 justify-center">
          {orixas.map((orixa) => (
            <Badge
              key={orixa}
              variant="outline"
              className="bg-emerald-400/10 border-emerald-400/30 text-emerald-400 px-4 py-2 text-lg"
            >
              <Star className="w-4 h-4 mr-2" />
              {orixa}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export default function MapaPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [mapaData, setMapaData] = useState<MapaAlmaCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('mapa_perfil');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile) as BirthProfile);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error('[MapaPage] Failed to parse profile:', e);
      setLoading(false);
    }
  }, []);

  // Fetch Mapa data when profile is available
  useEffect(() => {
    if (!profile) return;

    const fetchMapa = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/mapa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nomeCompleto: profile.nomeCompleto,
            dataNascimento: profile.dataNascimento,
            hora: profile.hora,
            cidade: profile.cidade,
            estado: profile.estado,
            pais: profile.pais,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.error || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setMapaData(data as MapaAlmaCompleto);
      } catch (err) {
        console.error('[MapaPage] Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar Mapa da Alma');
      } finally {
        setLoading(false);
      }
    };

    fetchMapa();
  }, [profile]);

  // ============================================================
  // NO PROFILE — SHOW ONBOARDING PROMPT
  // ============================================================

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900 border-amber-500/20 max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-2xl font-bold text-amber-400 mb-4">Complete seu perfil primeiro</h1>
            <p className="text-slate-400 mb-6">
              Para acessar seu Mapa da Alma, precisamos das suas informações básicas de nascimento.
            </p>
            <Button
              onClick={() => router.push('/onboarding')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              Ir para Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-400 animate-spin" />
          </div>
          <Sparkles className="w-10 h-10 mx-auto text-amber-400 animate-pulse mb-4" />
          <p className="text-amber-400 text-lg font-medium">Gerando seu Mapa da Alma...</p>
          <p className="text-slate-500 text-sm mt-2">Isso pode levar alguns segundos</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Card className="bg-slate-900 border-red-500/20 max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <span className="text-3xl">⚠</span>
            </div>
            <h1 className="text-xl font-bold text-red-400 mb-4">Erro ao carregar Mapa</h1>
            <p className="text-slate-400 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-slate-600"
              >
                Tentar novamente
              </Button>
              <Button
                onClick={() => router.push('/onboarding')}
                className="bg-gradient-to-r from-amber-500 to-orange-500"
              >
                Refazer perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================================
  // MAIN CONTENT — MAPA DATA DISPLAY
  // ============================================================

  if (!mapaData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              ✦ Mapa da Alma ✦
            </h1>
            <p className="text-sm text-slate-400">{profile.nomeCompleto}</p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>Calculado em</p>
            <p>{new Date(mapaData.dataCalculo).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Profile Summary */}
        <div className="text-center py-4">
          <p className="text-sm text-slate-400">
            {profile.dataNascimento}
            {profile.cidade ? ` • ${profile.cidade}` : ''}
          </p>
        </div>

        {/* Numerologia */}
        <NumerologiaCard numerologia={mapaData.numerologia} />

        {/* Odú Ifá */}
        <OduCardFull odu={mapaData.odu} />

        {/* Mapa Natal Wheel + Tarot Birth Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AstrologiaSection astrologia={mapaData.astrologia} />

          {/* Tarot Birth Card */}
          <Card className="bg-slate-900 border-slate-700/50">
            <CardHeader className="pb-4">
              <CardTitle className="text-amber-400 flex items-center gap-2">
                <Moon className="w-5 h-5" />
                Carta de Nascimento — Tarot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <TarotCardDisplay carta={mapaData.tarot.cartaNascimento} tipo="Nascimento" />
                <TarotCardDisplay carta={mapaData.tarot.cartaAnoPessoal} tipo="Ano Pessoal" />
                <TarotCardDisplay carta={mapaData.tarot.cartaAlma} tipo="Alma" />
              </div>
              {mapaData.tarot.interpretacao && (
                <div className="mt-4 pt-4 border-t border-slate-700/50">
                  <div className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                    Interpretação
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {mapaData.tarot.interpretacao.name || 'Carta de Tarot'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chakras */}
        <ChakrasSection />

        {/* Convergências */}
        {mapaData.convergencias.length > 0 && (
          <ConvergenciasCard
            convergencias={mapaData.convergencias}
            orixasDominantes={mapaData.orixasDominantes}
          />
        )}

        {/* Orixás Dominantes */}
        <OrixasSection orixas={mapaData.orixasDominantes} />

        {/* Footer */}
        <footer className="text-center py-8 border-t border-slate-800">
          <p className="text-xs text-slate-500">
            Mapa da Alma Completo v{mapaData.versao} • Cabala dos Caminhos
          </p>
        </footer>
      </main>
    </div>
  );
}
