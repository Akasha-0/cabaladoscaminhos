'use client';

/**
 * StepLocal — Passo 4 do Onboarding Espiritual
 * ----------------------------------------------------------------------------
 * Local de nascimento: cidade + estado (UF) + país.
 * Cidade tem autocomplete simples (lista estática curada — sem Google Maps API).
 *
 * Validação client: Zod (StepLocalSchema em lib/schemas/onboarding.ts).
 */

import { useId, useMemo, useRef, useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BRAZILIAN_STATES, suggestCities } from '@/lib/constants/brazilian-states';

export interface StepLocalValues {
  city: string;
  state: string;
  country: string;
}

export interface StepLocalProps {
  value: StepLocalValues;
  onChange: (next: StepLocalValues) => void;
  errors?: Partial<Record<keyof StepLocalValues, string>>;
  autoFocus?: boolean;
}

export function StepLocal({ value, onChange, errors, autoFocus = true }: StepLocalProps) {
  const cityId = useId();
  const stateId = useId();
  const countryId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => suggestCities(value.city, 6), [value.city]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleCityChange = (next: string) => {
    onChange({ ...value, city: next });
    setShowSuggestions(next.length >= 2);
  };

  return (
    <div className="space-y-3" data-testid="step-local">
      <div className="flex items-center gap-2 text-spiritual-gold">
        <MapPin className="w-5 h-5" aria-hidden />
        <span className="font-cinzel uppercase text-xs tracking-widest">
          Local de nascimento
        </span>
      </div>

      <p className="text-sm text-muted-foreground font-serif italic">
        Onde sua alma escolheu encarnar. Coordenadas geográficas afinam a
        Carta do Céu (ascendente e casas).
      </p>

      {/* Cidade com autocomplete simples */}
      <div ref={wrapperRef} className="space-y-1.5 relative">
        <Label htmlFor={cityId} className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
          Cidade
        </Label>
        <Input
          id={cityId}
          type="text"
          autoComplete="address-level2"
          placeholder="Ex: Salvador"
          value={value.city}
          onChange={(e) => handleCityChange(e.target.value)}
          onFocus={() => value.city.length >= 2 && setShowSuggestions(true)}
          className={cn('h-12 text-lg', errors?.city && 'border-red-500')}
          aria-invalid={Boolean(errors?.city)}
          aria-autocomplete="list"
          aria-expanded={showSuggestions && suggestions.length > 0}
          aria-controls={`${cityId}-listbox`}
          autoFocus={autoFocus}
          data-testid="input-birthCity"
        />
        {errors?.city && (
          <p role="alert" className="text-red-400 text-sm">
            {errors.city}
          </p>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <ul
            id={`${cityId}-listbox`}
            role="listbox"
            data-testid="city-suggestions"
            className="absolute z-20 top-full mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-spiritual-gold/40 bg-slate-900/95 backdrop-blur shadow-xl"
          >
            {suggestions.map((s) => (
              <li
                key={s}
                role="option"
                aria-selected={false}
                onClick={() => {
                  onChange({ ...value, city: s });
                  setShowSuggestions(false);
                }}
                className="px-3 py-2 text-sm text-foreground cursor-pointer hover:bg-spiritual-gold/15 hover:text-spiritual-gold"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Estado (UF) */}
      <div className="space-y-1.5">
        <Label htmlFor={stateId} className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
          Estado
        </Label>
        <Select
          value={value.state || ''}
          onValueChange={(v) => onChange({ ...value, state: v ?? '' })}
        >
          <SelectTrigger
            id={stateId}
            className={cn('h-12 text-lg', errors?.state && 'border-red-500')}
            aria-label="Estado de nascimento"
            data-testid="select-birthState"
          >
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent>
            {BRAZILIAN_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors?.state && (
          <p role="alert" className="text-red-400 text-sm">
            {errors.state}
          </p>
        )}
      </div>

      {/* País */}
      <div className="space-y-1.5">
        <Label htmlFor={countryId} className="font-cinzel uppercase text-xs tracking-widest text-spiritual-gold">
          País
        </Label>
        <Input
          id={countryId}
          type="text"
          autoComplete="country-name"
          value={value.country}
          onChange={(e) => onChange({ ...value, country: e.target.value })}
          className={cn('h-12 text-lg', errors?.country && 'border-red-500')}
          aria-invalid={Boolean(errors?.country)}
          data-testid="input-birthCountry"
        />
        {errors?.country && (
          <p role="alert" className="text-red-400 text-sm">
            {errors.country}
          </p>
        )}
      </div>
    </div>
  );
}