'use client';

// ============================================================================
// INPUT FORM — Wave 29
// ============================================================================
// Form mobile-first (44px touch targets, WCAG AA) para entrada de dados
// do consulente: nome completo (conforme certidão), data, hora, local + flags.
// Usado por todas as 3 páginas (astrologia, numerologia, mapa-completo).
//
// Universalismo: respeita acentos, capitalização variável, múltiplas tradições.
// ============================================================================

import { useState } from 'react';
import { Sparkles, MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface OraculoFormData {
  nomeCompleto: string;
  dataNascimento: string;
  horaNascimento: string;
  localNascimento: string;
  latitude?: string;
  longitude?: string;
  tradiçãoPreferida?: 'cigano' | 'astrologia-ocidental' | 'astrologia-védica' | 'numerologia-pitagorica' | 'tantra' | 'cabala';
  sistemaNumerologia?: 'pitagorica' | 'caldeia' | 'cabalistica-estrutural';
  tradiçãoAstrologia?: 'ocidental-tropical' | 'védica-sidereal' | 'chinesa';
}

interface InputFormProps {
  /** 'astrologia' | 'numerologia' | 'completo' — controla quais campos exibir */
  modo: 'astrologia' | 'numerologia' | 'completo';
  /** Callback quando user submete */
  onSubmit: (data: OraculoFormData) => void | Promise<void>;
  /** Loading state (botão fica disabled) */
  loading?: boolean;
  /** Optional error display */
  error?: string | null;
}

const TRADIÇÕES = [
  { value: 'cigano', label: 'Cigano (Ramiro)' },
  { value: 'astrologia-ocidental', label: 'Astrologia Ocidental' },
  { value: 'astrologia-védica', label: 'Astrologia Védica' },
  { value: 'numerologia-pitagorica', label: 'Numerologia Pitagórica' },
  { value: 'tantra', label: 'Tantra' },
  { value: 'cabala', label: 'Cabala' },
];

const SISTEMAS_NUM = [
  { value: 'pitagorica', label: 'Pitagórica (clássica)' },
  { value: 'caldeia', label: 'Caldeia (mesopotâmica)' },
  { value: 'cabalistica-estrutural', label: 'Cabalística (estrutura)' },
];

const TRADIÇÕES_ASTRO = [
  { value: 'ocidental-tropical', label: 'Ocidental Tropical' },
  { value: 'védica-sidereal', label: 'Védica Sideral (⚠️ simplificada)' },
  { value: 'chinesa', label: 'Chinesa (⚠️ não implementada)' },
];

export function InputForm({ modo, onSubmit, loading, error }: InputFormProps) {
  const [data, setData] = useState<OraculoFormData>({
    nomeCompleto: '',
    dataNascimento: '',
    horaNascimento: '',
    localNascimento: '',
    latitude: '',
    longitude: '',
    tradiçãoPreferida: 'cigano',
    sistemaNumerologia: 'pitagorica',
    tradiçãoAstrologia: 'ocidental-tropical',
  });

  const requiresAstroFields = modo === 'astrologia' || modo === 'completo';
  const requiresNumFields = modo === 'numerologia' || modo === 'completo';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    onSubmit(data);
  };

  const baseInputClass =
    'min-h-[44px] w-full text-base bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30';

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 md:p-6"
      aria-label="Formulário para cálculo de mapa"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 via-amber-400/10 to-amber-300/20 ring-1 ring-amber-400/30">
          <Sparkles className="h-5 w-5 text-amber-300" aria-hidden />
        </div>
        <div>
          <h2 className="font-heading text-base font-semibold text-slate-50">
            Seus dados de nascimento
          </h2>
          <p className="text-xs text-slate-400">
            Conforme certidão de nascimento — para precisão.
          </p>
        </div>
      </div>

      {/* Nome completo (sempre) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="nome" className="text-xs font-medium text-slate-300">
          Nome completo <span className="text-amber-300">*</span>
        </label>
        <Input
          id="nome"
          type="text"
          value={data.nomeCompleto}
          onChange={(e) => setData({ ...data, nomeCompleto: e.target.value })}
          required
          minLength={2}
          maxLength={200}
          placeholder="Ex: Maria da Silva Santos"
          className={baseInputClass}
          aria-required="true"
        />
      </div>

      {/* Data nascimento (sempre) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="data" className="text-xs font-medium text-slate-300">
          Data de nascimento <span className="text-amber-300">*</span>
        </label>
        <Input
          id="data"
          type="date"
          value={data.dataNascimento}
          onChange={(e) => setData({ ...data, dataNascimento: e.target.value })}
          required
          max={new Date().toISOString().slice(0, 10)}
          className={baseInputClass}
          aria-required="true"
        />
      </div>

      {/* Hora nascimento (astrologia + completo) */}
      {requiresAstroFields && (
        <div className="flex flex-col gap-1">
          <label htmlFor="hora" className="text-xs font-medium text-slate-300">
            Hora de nascimento (local)
          </label>
          <Input
            id="hora"
            type="time"
            value={data.horaNascimento}
            onChange={(e) => setData({ ...data, horaNascimento: e.target.value })}
            className={baseInputClass}
            aria-describedby="hora-help"
          />
          <p id="hora-help" className="text-[10px] text-slate-500">
            Se não souber a hora exata, deixe em branco (sem ascendente).
          </p>
        </div>
      )}

      {/* Local nascimento (astrologia + completo) */}
      {requiresAstroFields && (
        <>
          <div className="flex flex-col gap-1">
            <label htmlFor="local" className="text-xs font-medium text-slate-300">
              Local de nascimento
            </label>
            <Input
              id="local"
              type="text"
              value={data.localNascimento}
              onChange={(e) => setData({ ...data, localNascimento: e.target.value })}
              placeholder="Ex: São Paulo, SP, Brasil"
              className={baseInputClass}
            />
          </div>

          <details className="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
            <summary className="cursor-pointer text-xs font-medium text-amber-300">
              <MapPin className="mr-1 inline h-3 w-3" aria-hidden />
              Adicionar coordenadas (opcional, para ascendente preciso)
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="lat" className="text-[10px] text-slate-400">
                  Latitude
                </label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  value={data.latitude ?? ''}
                  onChange={(e) => setData({ ...data, latitude: e.target.value })}
                  placeholder="-23.5505"
                  className={baseInputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="lon" className="text-[10px] text-slate-400">
                  Longitude
                </label>
                <Input
                  id="lon"
                  type="number"
                  step="0.0001"
                  value={data.longitude ?? ''}
                  onChange={(e) => setData({ ...data, longitude: e.target.value })}
                  placeholder="-46.6333"
                  className={baseInputClass}
                />
              </div>
            </div>
          </details>
        </>
      )}

      {/* Tradição preferida (universalismo) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="tradição" className="text-xs font-medium text-slate-300">
          Tradição preferida para interpretação
        </label>
        <select
          id="tradição"
          value={data.tradiçãoPreferida ?? 'cigano'}
          onChange={(e) =>
            setData({
              ...data,
              tradiçãoPreferida: e.target.value as OraculoFormData['tradiçãoPreferida'],
            })
          }
          className={baseInputClass}
        >
          {TRADIÇÕES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-slate-500">
          Akashic IA respeitará esta tradição como filtro interpretativo. Não é imposto.
        </p>
      </div>

      {/* Sistema numerologia (só numerologia + completo) */}
      {requiresNumFields && (
        <div className="flex flex-col gap-1">
          <label htmlFor="sistema" className="text-xs font-medium text-slate-300">
            Sistema numerológico
          </label>
          <select
            id="sistema"
            value={data.sistemaNumerologia ?? 'pitagorica'}
            onChange={(e) =>
              setData({
                ...data,
                sistemaNumerologia: e.target.value as OraculoFormData['sistemaNumerologia'],
              })
            }
            className={baseInputClass}
          >
            {SISTEMAS_NUM.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tradição astrologia (só astrologia + completo) */}
      {requiresAstroFields && (
        <div className="flex flex-col gap-1">
          <label htmlFor="tradição-astro" className="text-xs font-medium text-slate-300">
            Sistema astrológico
          </label>
          <select
            id="tradição-astro"
            value={data.tradiçãoAstrologia ?? 'ocidental-tropical'}
            onChange={(e) =>
              setData({
                ...data,
                tradiçãoAstrologia: e.target.value as OraculoFormData['tradiçãoAstrologia'],
              })
            }
            className={baseInputClass}
          >
            {TRADIÇÕES_ASTRO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-800/50 bg-red-950/40 p-3 text-xs text-red-200"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="golden"
        size="lg"
        disabled={loading}
        className="min-h-[44px] w-full"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Calculando...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Calcular mapa
          </>
        )}
      </Button>
    </form>
  );
}
