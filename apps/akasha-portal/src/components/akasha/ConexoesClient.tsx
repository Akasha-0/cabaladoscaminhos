'use client';

/**
 * ConexoesClient — Análise de Compatibilidade Akasha
 * Wired to POST /api/akasha/conexoes and GET /api/akasha/conexoes
 */

import { useState } from 'react';
import { Heart, ArrowLeft, Loader, Bookmark, Info, Edit3, X, Loader2 } from 'lucide-react';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';
import type { CityResult } from '@/components/ui/city-autocomplete';

// ─── Types ────────────────────────────────────────────────────────────────

type Stage = 'selection' | 'confirm' | 'results' | 'details' | 'saved';

interface UserProfile {
  name: string;
  birthDate: string | null;
  birthTime: string | null;
  birthCity: string | null;
  birthLatitude: number | null;
  birthLongitude: number | null;
  birthTimezone: string | null;
}

interface RawBirthData {
  name: string;
  birthDate: string;
  birthTime?: string;
  birthCity: string;
}

interface ConexaoResult {
  romantic: number;
  partnership: number;
  dominantType: 'romantic' | 'partnership' | 'both' | 'challenging';
  authorityMatch: 'aligned' | 'complementary' | 'conflict';
  dimensions: ConnectionDimension[];
  oduSync: OduSync;
  bodySync: BodySync;
  narrative: string;
  recommendations: string[];
}

interface ConnectionDimension {
  dimension: string;
  score: number;
  description: string;
  tip: string;
}

interface OduSync {
  score: number;
  sharedOdu: boolean;
  complementaryOdu: boolean;
  description: string;
}

interface BodySync {
  score: number;
  description: string;
}

interface SavedConnection {
  id: string;
  otherName: string;
  otherBirthDate: string;
  romanticScore: number;
  partnershipScore: number;
  dominantType: 'romantic' | 'partnership' | 'both' | 'challenging';
  authorityMatch: 'aligned' | 'complementary' | 'conflict';
  createdAt: string;
}

// ─── Sub-components ────────────────────────────────────────────────────────

function DimensionBar({ dimension }: { dimension: ConnectionDimension }) {
  const color = dimension.score >= 75 ? '#34d399' : dimension.score >= 50 ? '#fbbf24' : '#f87171';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-white/80">{dimension.dimension}</span>
        <span className="font-bold" style={{ color }}>{dimension.score}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10">
        <div
          className="h-2 rounded-full transition-all duration-700"
          style={{ width: `${dimension.score}%`, backgroundColor: color }}
        />
      </div>
      <p className="text-xs text-white/50">{dimension.description}</p>
    </div>
  );
}

function ProfileCard({
  label,
  name,
  birthDate,
  birthTime,
  birthCity,
  editable,
  onEdit,
}: {
  label: string;
  name: string;
  birthDate: string;
  birthTime?: string | null;
  birthCity: string;
  editable?: boolean;
  onEdit?: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-white/40 uppercase tracking-wider">{label}</span>
        {editable && onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-[#7C5CFF] hover:text-[#9d7fff] flex items-center gap-1 transition-colors"
          >
            <Edit3 size={11} /> Editar
          </button>
        )}
      </div>
      <p className="font-bold text-white text-sm">{name}</p>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-white/50">
        {birthDate && <span>{birthDate}</span>}
        {birthTime && <span>{birthTime}</span>}
        {birthCity && <span>{birthCity}</span>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────

interface Props {
  userProfile: UserProfile;
}

export default function ConexoesClient({ userProfile }: Props) {
  const [stage, setStage] = useState<Stage>('selection');
  const [rawData, setRawData] = useState<RawBirthData>({ name: '', birthDate: '', birthTime: '', birthCity: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConexaoResult | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [savedConnections, setSavedConnections] = useState<SavedConnection[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [partnerCoords, setPartnerCoords] = useState<{ latitude: number; longitude: number; timezone?: string } | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/akasha/conexoes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedConnections(prev => prev.filter(c => c.id !== id));
      }
    } catch { /* silent */ }
    finally { setDeletingId(null); }
  }

  // ── Step 1: validate partner data and go to confirm screen ──────────────
  function goToConfirm() {
    if (!rawData.name.trim()) {
      setError('Informe o nome da pessoa para analisar.');
      return;
    }
    if (!rawData.birthDate) {
      setError('Informe a data de nascimento.');
      return;
    }
    setError(null);
    setStage('confirm');
  }

  // ── Step 2: actually call the API ────────────────────────────────────────
  async function executeAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const body = {
        otherName: rawData.name,
        otherBirthDate: rawData.birthDate,
        otherBirthTime: rawData.birthTime || undefined,
        otherBirthCity: rawData.birthCity || undefined,
        otherBirthLatitude: partnerCoords?.latitude,
        otherBirthLongitude: partnerCoords?.longitude,
        otherBirthTimezone: partnerCoords?.timezone,
      };
      const res = await fetch('/api/akasha/conexoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.status === 400) {
        const data = await res.json().catch(() => ({}));
        const msg = (data as { error?: string }).error ?? '';
        if (msg.includes('Mapa natal não encontrado')) {
          setError(<>Complete seu mapa primeiro. <a href="/mapa" className="underline text-[#9D86FF]">Ir para Mapa →</a></>);
          setLoading(false);
          return;
        }
        throw new Error(msg);
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Erro ao analisar conexão.');
      }
      const data = await res.json();
      const conn = data.connection;
      if (conn?.resultData) {
        setResult(conn.resultData);
      } else {
        setResult({
          romantic: conn.romanticScore ?? 0,
          partnership: conn.partnershipScore ?? 0,
          dominantType: conn.dominantType ?? 'both',
          authorityMatch: conn.authorityMatch ?? 'aligned',
          dimensions: [],
          oduSync: { score: 0, sharedOdu: false, complementaryOdu: false, description: '' },
          bodySync: { score: 0, description: '' },
          narrative: '',
          recommendations: [],
        });
      }
      setStage('results');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao analisar conexão.');
    } finally {
      setLoading(false);
    }
  }

  async function loadSavedConnections() {
    setSavedLoading(true);
    try {
      const res = await fetch('/api/akasha/conexoes');
      if (!res.ok) throw new Error('Erro ao carregar conexões salvas.');
      const data = await res.json();
      setSavedConnections(data.connections ?? []);
      setStage('saved');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar conexões salvas.');
    } finally {
      setSavedLoading(false);
    }
  }

  const AUTHORITY_LABELS: Record<string, string> = {
    aligned: 'Alinhada',
    complementary: 'Complementar',
    conflict: 'Em Conflito',
  };

  const DOMINANT_LABELS: Record<string, string> = {
    romantic: 'Amorosa',
    partnership: 'Negócio/Parceria',
    both: 'Ambos',
    challenging: 'Desafiadora',
  };

  const authColor = result
    ? result.authorityMatch === 'aligned' ? '#34d399'
      : result.authorityMatch === 'complementary' ? '#fbbf24'
      : '#f87171'
    : '#fff';

  return (
    <div className="min-h-screen bg-[#0B0E1C] text-white px-4 py-8 max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        {(stage !== 'selection' && stage !== 'saved') && (
          <button
            onClick={() => setStage(stage === 'confirm' ? 'selection' : 'selection')}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        {stage === 'saved' && (
          <button
            onClick={() => setStage('selection')}
            className="p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Heart size={24} className="text-[#f87171]" />
            Conexões
          </h1>
          <p className="text-sm text-white/50">Descubra como dois mapas Akasha se relacionam</p>
        </div>
      </div>

      {/* Stage 1 — Enter partner data */}
      {stage === 'selection' && (
        <div className="space-y-6">
          {/* Saved connections button */}
          <button
            onClick={loadSavedConnections}
            disabled={savedLoading}
            className="w-full py-3 rounded-2xl border border-[#7C5CFF]/40 bg-[#7C5CFF]/10 text-sm text-[#7C5CFF] hover:bg-[#7C5CFF]/20 transition-all flex items-center justify-center gap-2"
          >
            {savedLoading ? (
              <><Loader size={16} className="animate-spin" /> Carregando…</>
            ) : (
              <><Bookmark size={16} /> Ver Conexões Salvas</>
            )}
          </button>

          {/* Your profile summary */}
          <ProfileCard
            label="Seu perfil"
            name={userProfile.name}
            birthDate={userProfile.birthDate ?? ''}
            birthTime={userProfile.birthTime}
            birthCity={userProfile.birthCity ?? ''}
            editable
            onEdit={() => {/* TODO: navigate to profile edit */}}
          />

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <Info size={14} />
              Dados da outra pessoa
            </div>

            {/* Partner birth data */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Nome</label>
                <input
                  type="text"
                  value={rawData.name}
                  onChange={(e) => setRawData({ ...rawData, name: e.target.value })}
                  placeholder="Nome completo"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C5CFF]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Data de nascimento</label>
                  <input
                    type="date"
                    value={rawData.birthDate}
                    onChange={(e) => setRawData({ ...rawData, birthDate: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7C5CFF]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Hora (opcional)</label>
                  <input
                    type="time"
                    value={rawData.birthTime ?? ''}
                    onChange={(e) => setRawData({ ...rawData, birthTime: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7C5CFF]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-white/50 mb-1.5">Cidade de nascimento</label>
                <CityAutocomplete
                  value={rawData.birthCity}
                  onChange={(val) => setRawData({ ...rawData, birthCity: val })}
                  onSelect={(city: CityResult) => {
                    setRawData({ ...rawData, birthCity: city.name });
                    setPartnerCoords({
                      latitude: parseFloat(city.latitude),
                      longitude: parseFloat(city.longitude),
                      timezone: city.timezone,
                    });
                  }}
                  placeholder="São Paulo, BR"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-[#f87171]">{error}</div>
          )}

          <button
            onClick={goToConfirm}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#2DD4BF] font-bold text-white flex items-center justify-center gap-2"
          >
            <Heart size={16} />
            Analisar Conexão
          </button>
        </div>
      )}

      {/* Stage 2 — Confirm both profiles */}
      {stage === 'confirm' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 p-4 text-center">
            <p className="text-xs text-[#7C5CFF]/70 mb-1">Revise os dados antes de analisar</p>
            <p className="text-sm text-white/60">Confirme que estão corretos para continuar</p>
          </div>

          <div className="space-y-3">
            <ProfileCard
              label="Seu perfil"
              name={userProfile.name}
              birthDate={userProfile.birthDate ?? ''}
              birthTime={userProfile.birthTime}
              birthCity={userProfile.birthCity ?? ''}
              editable
              onEdit={() => setStage('selection')}
            />

            <div className="flex justify-center">
              <div className="text-white/30 text-xl">✦</div>
            </div>

            <ProfileCard
              label="Pessoa analisada"
              name={rawData.name}
              birthDate={rawData.birthDate}
              birthTime={rawData.birthTime}
              birthCity={rawData.birthCity}
              editable
              onEdit={() => setStage('selection')}
            />
          </div>

          {error && (
            <div className="text-sm text-[#f87171]">{error}</div>
          )}

          <button
            onClick={executeAnalysis}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#7C5CFF] to-[#2DD4BF] font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader size={18} className="animate-spin" /> Analisando…</>
            ) : (
              <><Heart size={16} /> Confirmar e Analisar</>
            )}
          </button>

          <button
            onClick={() => setStage('selection')}
            className="w-full py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors"
          >
            Voltar e editar
          </button>
        </div>
      )}

      {/* Stage 3 — Results */}
      {stage === 'results' && result && (
        <div className="space-y-6">

          {/* Header — comparing names */}
          <div className="rounded-2xl border border-[#7C5CFF]/30 bg-[#7C5CFF]/10 p-4 text-center">
            <p className="text-xs text-[#7C5CFF]/70 mb-1">Comparando</p>
            <p className="text-sm font-bold text-white">
              <span className="text-white/90">{userProfile.name}</span>
              <span className="text-white/40 mx-2">✦</span>
              <span className="text-white/90">{rawData.name}</span>
            </p>
            {(rawData.birthDate || rawData.birthCity) && (
              <p className="text-xs text-white/40 mt-1">
                {rawData.birthDate
                  ? new Date(rawData.birthDate + 'T00:00:00').toLocaleDateString('pt-BR')
                  : '—'}
                {rawData.birthDate && rawData.birthCity ? ' · ' : ''}
                {rawData.birthCity || ''}
              </p>
            )}
            <button
              onClick={() => setStage('selection')}
              className="mt-2 text-xs text-[#7C5CFF]/60 hover:text-[#7C5CFF] underline transition-colors"
            >
              editar dados
            </button>
          </div>

          {/* Scores */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#f87171]/30 bg-[#f87171]/5 p-5 text-center">
              <p className="text-xs text-white/50 mb-1">Conexão Amorosa</p>
              <p className="text-4xl font-black text-[#f87171]">{result.romantic}%</p>
              <p className={`text-xs font-semibold mt-1 ${
                result.romantic >= 71 ? 'text-[#34d399]' :
                result.romantic >= 41 ? 'text-[#fbbf24]' :
                'text-[#f87171]'
              }`}>
                {result.romantic >= 71 ? '71–100: Forte' :
                 result.romantic >= 41 ? '41–70: Oscilante' :
                 '0–40: Desafio'}
              </p>
            </div>
            <div className="rounded-2xl border border-[#fbbf24]/30 bg-[#fbbf24]/5 p-5 text-center">
              <p className="text-xs text-white/50 mb-1">Conexão Negócio</p>
              <p className="text-4xl font-black text-[#fbbf24]">{result.partnership}</p>
              <p className={`text-xs font-semibold mt-1 ${
                result.partnership >= 71 ? 'text-[#34d399]' :
                result.partnership >= 41 ? 'text-[#fbbf24]' :
                'text-[#f87171]'
              }`}>
                {result.partnership >= 71 ? '71–100: Forte' :
                 result.partnership >= 41 ? '41–70: Oscilante' :
                 '0–40: Desafio'}
              </p>
            </div>
          </div>

          {/* Score scale legend */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#f87171]" />0–40: Desafio
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#fbbf24]" />41–70: Oscilante
            </span>
            <span className="text-white/20">•</span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#34d399]" />71–100: Forte
            </span>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">Tipo dominante</span>
              <span className="font-bold text-white">{DOMINANT_LABELS[result.dominantType]}</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50 flex items-center gap-1">
                  Sincronia Espiritual
                  <span aria-label="Como a autoridade espiritual dos dois mapas se relacionam." className="cursor-help text-white/30 hover:text-white/50 transition-colors">
                    <Info size={12} />
                  </span>
                </span>
                <span className="font-bold" style={{ color: authColor }}>
                  {AUTHORITY_LABELS[result.authorityMatch]}
                </span>
              </div>
              <p className="text-[10px] text-white/30 pl-0.5">
                {result.authorityMatch === 'high' ? 'alinhamento forte — autoridades compatíveis' :
                 result.authorityMatch === 'medium' ? 'autoridades complementares com diferenças' :
                 'contrastes entre os tipos de decisão'}
              </p>
            </div>
          </div>

          {/* Odu + Body sync */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs text-white/50 mb-1 flex items-center gap-1">
                Sincronia Corporal
                <span aria-label="Compatibilidade entre os corpos tântricos dos dois mapas." className="cursor-help text-white/30 hover:text-white/50 transition-colors">
                  <Info size={12} />
                </span>
              </p>
              <p className="text-lg font-black text-[#2DD4BF]">{result.bodySync.score}</p>
              <p className="text-xs text-white/40 mt-1">{result.bodySync.description}</p>
            </div>
          </div>

          {/* Narrative — split into sentences for readability */}
          {result.narrative && (
            <div className="rounded-2xl border border-[#7C5CFF]/20 bg-[#7C5CFF]/5 px-6 py-5">
              <p className="text-xs font-bold text-[#7C5CFF]/80 uppercase tracking-wider mb-2">Sua Conexão</p>
              <div className="space-y-2">
                {result.narrative.split(/(?<=[.!?])\s+(?=[A-ZÓÇÃÂÊÔ])/).filter(Boolean).map((sentence, i) => (
                  <p key={i} className="text-sm text-white/75 leading-relaxed border-l-2 border-[#7C5CFF]/40 pl-4">
                    {sentence.trim()}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="rounded-2xl border border-[#2DD4BF]/20 bg-[#2DD4BF]/5 p-5 space-y-3">
              <h3 className="font-bold text-sm text-[#2DD4BF]">Recomendação</h3>
              {result.recommendations.slice(0, 1).map((rec, i) => (
                <div key={i} className="rounded-xl border border-[#2DD4BF]/30 bg-[#2DD4BF]/10 px-4 py-3">
                  <p className="text-sm text-[#2DD4BF] font-semibold leading-relaxed">{rec}</p>
                </div>
              ))}
              {result.recommendations.length > 1 && (
                <ul className="space-y-1.5 pl-2">
                  {result.recommendations.slice(1).map((rec, i) => (
                    <li key={i} className="text-xs text-white/60 flex gap-2">
                      <span className="text-[#2DD4BF]/60 shrink-0 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Dimensions */}
          {result.dimensions.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white/60">Dimensões da Conexão</h3>
              {result.dimensions.map((dim, i) => (
                <DimensionBar key={i} dimension={dim} />
              ))}
            </div>
          )}

          {/* Save connection button */}
          <button
            onClick={async () => {
              if (!result) return;
              setLoading(true);
              try {
                const res = await fetch('/api/akasha/conexoes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    otherName: rawData.name,
                    otherBirthDate: rawData.birthDate,
                    otherBirthTime: rawData.birthTime || undefined,
                    otherBirthCity: rawData.birthCity || undefined,
                    otherBirthLatitude: partnerCoords?.latitude,
                    otherBirthLongitude: partnerCoords?.longitude,
                    otherBirthTimezone: partnerCoords?.timezone,
                  }),
                });
                if (res.ok) {
                  setSavedConnections((prev: SavedConnection[]) => [{
                    id: Date.now().toString(),
                    otherName: rawData.name,
                    otherBirthDate: rawData.birthDate,
                    dominantType: result.dominantType,
                    romanticScore: result.romantic,
                    partnershipScore: result.partnership,
                    authorityMatch: result.authorityMatch,
                    createdAt: new Date().toISOString(),
                  }, ...prev]);
                  setSavedNotification('Salvo ✓');
                  setTimeout(() => setSavedNotification(null), 3000);
                  setError(null);
                }
              } catch { /* silent */ }
              finally { setLoading(false); }
            }}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-[#2DD4BF] font-semibold text-sm text-white disabled:opacity-50"
          >
            {loading ? 'Salvando…' : savedNotification ?? '💾 Salvar conexão'}
          </button>

          {savedNotification === null && (
            <button
              onClick={loadSavedConnections}
              className="w-full py-3 rounded-xl border border-[#7C5CFF]/40 bg-[#7C5CFF]/10 text-sm text-[#7C5CFF] hover:bg-[#7C5CFF]/20 transition-all flex items-center justify-center gap-2"
            >
              <Bookmark size={16} /> Ver Conexões Salvas
            </button>
          )}

          {/* Back to selection */}
          <button
            onClick={() => { setStage('selection'); setResult(null); }}
            className="w-full py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors"
          >
            Nova análise
          </button>
        </div>
      )}

      {/* Stage 4 — Saved Connections */}
      {stage === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white/80">Conexões Salvas</h2>
            <button
              onClick={() => setStage('selection')}
              className="text-sm text-[#7C5CFF] hover:underline"
            >
              + Nova análise
            </button>
          </div>

          {savedConnections.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
              <Heart size={32} className="text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/50">Nenhuma conexão salva ainda.</p>
              <p className="text-xs text-white/30 mt-1">Faça uma análise e ela aparecerá aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedConnections.map((conn) => (
                <div key={conn.id} className="relative rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                  <button
                    onClick={() => handleDelete(conn.id)}
                    disabled={deletingId === conn.id}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors disabled:opacity-50"
                    title="Remover conexão"
                  >
                    {deletingId === conn.id ? (
                      <div className="w-4 h-4 border border-white/30 border-t-white/60 rounded-full animate-spin" />
                    ) : (
                      <X size={14} />
                    )}
                  </button>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-white">{conn.otherName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      conn.dominantType === 'romantic' ? 'bg-[#f87171]/20 text-[#f87171]' :
                      conn.dominantType === 'partnership' ? 'bg-[#fbbf24]/20 text-[#fbbf24]' :
                      conn.dominantType === 'challenging' ? 'bg-[#c084fc]/20 text-[#c084fc]' :
                      'bg-[#7C5CFF]/20 text-[#7C5CFF]'
                    }`}>
                      {DOMINANT_LABELS[conn.dominantType]}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-[#f87171]/5 border border-[#f87171]/20 p-2 text-center">
                      <p className="text-xs text-white/40">Amorosa</p>
                      <p className="text-lg font-black text-[#f87171]">{conn.romanticScore}</p>
                    </div>
                    <div className="rounded-xl bg-[#fbbf24]/5 border border-[#fbbf24]/20 p-2 text-center">
                      <p className="text-xs text-white/40">Negócio</p>
                      <p className="text-lg font-black text-[#fbbf24]">{conn.partnershipScore}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/30">
                    <span>{AUTHORITY_LABELS[conn.authorityMatch]}</span>
                    <span>{new Date(conn.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => setStage('selection')}
            className="w-full py-3 rounded-xl border border-white/10 text-sm text-white/60 hover:bg-white/10 transition-colors"
          >
            Voltar
          </button>
        </div>
      )}
    </div>
  );
}
