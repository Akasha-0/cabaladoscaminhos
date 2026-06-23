'use client';

import { Info } from 'lucide-react';
import { CityAutocomplete } from '@/components/ui/city-autocomplete';
import type { CityResult } from '@/components/ui/city-autocomplete';
import type { RawBirthData } from '../ConexoesClient';

interface Props {
  rawData: RawBirthData;
  onRawDataChange: (data: RawBirthData) => void;
  onCoordsChange: (coords: {
    latitude: number;
    longitude: number;
    timezone?: string;
  } | null) => void;
  error: React.ReactNode;
}

export function ConexaoPartnerForm({
  rawData,
  onRawDataChange,
  onCoordsChange,
  error,
}: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
      <div className="flex items-center gap-2 text-sm text-white/60">
        <Info size={14} />
        Dados da outra pessoa
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs text-white/50 mb-1.5">Nome</label>
          <input
            type="text"
            value={rawData.name}
            onChange={(e) => onRawDataChange({ ...rawData, name: e.target.value })}
            placeholder="Nome completo"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#6350E0]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Data de nascimento</label>
            <input
              type="date"
              value={rawData.birthDate}
              onChange={(e) => onRawDataChange({ ...rawData, birthDate: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6350E0]"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5">Hora (opcional)</label>
            <input
              type="time"
              value={rawData.birthTime ?? ''}
              onChange={(e) => onRawDataChange({ ...rawData, birthTime: e.target.value })}
              aria-describedby="birth-time-hint"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6350E0]"
            />
            *{' '}
            <p id="birth-time-hint" className="text-xs text-white/60 mt-1">
              Necessária para Ascendente e Casas — sem ela, Síncronia perde precisão
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs text-white/50 mb-1.5">Cidade de nascimento</label>
          <CityAutocomplete
            value={rawData.birthCity}
            onChange={(val) => onRawDataChange({ ...rawData, birthCity: val })}
            onSelect={(city: CityResult) => {
              onRawDataChange({ ...rawData, birthCity: city.name });
              onCoordsChange({
                latitude: parseFloat(city.latitude),
                longitude: parseFloat(city.longitude),
                timezone: city.timezone,
              });
            }}
            placeholder="São Paulo, BR"
          />
        </div>
      </div>

      {error && <div className="text-sm text-[#f87171]">{error}</div>}
    </div>
  );
}
