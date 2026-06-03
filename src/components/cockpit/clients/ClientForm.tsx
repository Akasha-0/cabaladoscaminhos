// src/components/cockpit/clients/ClientForm.tsx
// Formulário de cadastro de consulente (Doc 05 §6).
// 3 grupos: Identificação · Local · Anotações.
// Estado nativo (sem RHF — não instalado; consistente com o cockpit que usa Zustand).
// Tokens Ramiro v2: inputs com bg-muted, focus border-primary, botão submit "spiritual" (laranja).

'use client';

 import {
   User,
   Calendar,
   Clock,
   MapPin,
   FileText,
   Sparkles,
   AlertCircle,
   Check,
   ShieldCheck,
 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CityAutocomplete, type CityResult } from '@/components/ui/city-autocomplete';
import { createClientWithMaps } from '@/lib/db/client-actions';
 interface FormState {
   fullName: string;
   birthDate: string;
   birthTime: string;
   birthCity: string;
   birthState: string;
   birthCountry: string;
   birthLatitude: string;
   birthLongitude: string;
   birthTimezone: string;
   notes: string;
   consentGiven: boolean;
 }
const INITIAL: FormState = {
  fullName: '',
  birthDate: '',
  birthTime: '',
  birthCity: '',
  birthState: '',
  birthCountry: 'Brasil',
  birthLatitude: '',
  birthLongitude: '',
  birthTimezone: '',
   notes: '',
   consentGiven: false,
};

type FieldErrors = Partial<Record<keyof FormState, string>>;
function validate(state: FormState): FieldErrors {
  const errs: FieldErrors = {};
  if (state.fullName.trim().length < 3) errs.fullName = 'Nome deve ter ao menos 3 caracteres';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(state.birthDate))
    errs.birthDate = 'Data inválida (use o date picker)';
  if (!/^\d{2}:\d{2}$/.test(state.birthTime)) errs.birthTime = 'Hora inválida (HH:MM)';
  if (state.birthCity.trim().length < 2) errs.birthCity = 'Cidade obrigatória';
  if (state.birthState.trim().length < 2) errs.birthState = 'Estado obrigatório';
  if (state.birthCountry.trim().length < 2) errs.birthCountry = 'País obrigatório';
  return errs;
}

export function ClientForm() {
  const router = useRouter();
  const [state, setState] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);
    const errs = validate(state);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    startTransition(async () => {
      const result = await createClientWithMaps({
        fullName: state.fullName.trim(),
        birthDate: state.birthDate,
        birthTime: state.birthTime,
        birthCity: state.birthCity.trim(),
        birthState: state.birthState.trim(),
        birthCountry: state.birthCountry.trim(),
        birthLatitude: state.birthLatitude ? Number(state.birthLatitude) : undefined,
        birthLongitude: state.birthLongitude ? Number(state.birthLongitude) : undefined,
        birthTimezone: state.birthTimezone.trim() || undefined,
       notes: state.notes.trim() || undefined,
       consentGiven: state.consentGiven,
      });
      if (!result.ok) {
        setServerError(result.error);
        return;
      }
      router.push(`/cockpit/consulentes/${result.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-3xl">
      {/* Grupo 1 — Identificação */}
      <section className="space-y-4">
        <header>
          <h2 className="font-cinzel text-lg text-primary flex items-center gap-2">
            <User className="w-4 h-4" />
            Identificação
          </h2>
        </header>
        <div className="space-y-2">
          <Label
            htmlFor="fullName"
            className="text-xs text-muted-foreground uppercase tracking-wider"
          >
            Nome Completo
          </Label>
          <Input
            id="fullName"
            placeholder="Ex: Maria da Silva"
            value={state.fullName}
            onChange={(e) => setField('fullName', e.target.value)}
            aria-invalid={!!errors.fullName}
            className="bg-muted/50 border-border/50 focus:border-primary/50"
          />
          {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="birthDate"
              className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" /> Data de Nascimento
            </Label>
            <Input
              id="birthDate"
              type="date"
              value={state.birthDate}
              onChange={(e) => setField('birthDate', e.target.value)}
              aria-invalid={!!errors.birthDate}
              className="bg-muted/50 border-border/50 focus:border-primary/50"
            />
            {errors.birthDate && <p className="text-xs text-destructive">{errors.birthDate}</p>}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="birthTime"
              className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1"
            >
              <Clock className="w-3 h-3" /> Hora
            </Label>
            <Input
              id="birthTime"
              type="time"
              value={state.birthTime}
              onChange={(e) => setField('birthTime', e.target.value)}
              aria-invalid={!!errors.birthTime}
              className="bg-muted/50 border-border/50 focus:border-primary/50"
            />
            {errors.birthTime && <p className="text-xs text-destructive">{errors.birthTime}</p>}
          </div>
        </div>
      </section>

      {/* Grupo 2 — Local */}
      <section className="space-y-4">
        <header>
          <h2 className="font-cinzel text-lg text-primary flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Local de Nascimento
          </h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-2">
            <Label
              htmlFor="birthCity"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Cidade
            </Label>
            <CityAutocomplete
              value={state.birthCity}
              onChange={(v) => setField('birthCity', v)}
              onSelect={(city: CityResult) => {
                setField('birthCity', city.name);
                setField('birthState', city.state || state.birthState);
                setField('birthCountry', city.country || state.birthCountry);
                if (city.latitude) setField('birthLatitude', city.latitude);
                if (city.longitude) setField('birthLongitude', city.longitude);
              }}
              placeholder="Ex: São Paulo"
              error={errors.birthCity}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="birthState"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              Estado
            </Label>
            <Input
              id="birthState"
              placeholder="Ex: SP"
              value={state.birthState}
              onChange={(e) => setField('birthState', e.target.value)}
              aria-invalid={!!errors.birthState}
              className="bg-muted/50 border-border/50 focus:border-primary/50"
            />
            {errors.birthState && <p className="text-xs text-destructive">{errors.birthState}</p>}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="birthCountry"
              className="text-xs text-muted-foreground uppercase tracking-wider"
            >
              País
            </Label>
            <Input
              id="birthCountry"
              value={state.birthCountry}
              onChange={(e) => setField('birthCountry', e.target.value)}
              aria-invalid={!!errors.birthCountry}
              className="bg-muted/50 border-border/50 focus:border-primary/50"
            />
            {errors.birthCountry && (
              <p className="text-xs text-destructive">{errors.birthCountry}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground/60">
          Coordenadas geográficas (latitude/longitude) são preenchidas automaticamente ao selecionar uma cidade.
        </p>
      </section>
      <section className="space-y-4">
        <header>
          <h2 className="font-cinzel text-lg text-primary flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Anotações do Terapeuta
          </h2>
        </header>
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs text-muted-foreground uppercase tracking-wider">
            Observações livres (opcional)
          </Label>
          <textarea
            id="notes"
            rows={4}
            placeholder="Ex: Consulente já atendido em 2024-03; sensível a temas familiares..."
            value={state.notes}
            onChange={(e) => setField('notes', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-muted/50 border border-border/50 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
          />
         </div>
       </section>

       {/* LGPD Consent */}
       <section className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border/50">
         <div className="flex items-start gap-3">
           <input
             id="consentGiven"
             type="checkbox"
             checked={state.consentGiven}
             onChange={(e) => setField('consentGiven', e.target.checked)}
             className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary/50"
           />
           <div className="space-y-1">
             <label
               htmlFor="consentGiven"
               className="text-sm font-medium leading-none cursor-pointer flex items-center gap-1.5"
             >
               <ShieldCheck className="w-3.5 h-3.5 text-primary" />
               Consentimento para Tratamento de Dados (LGPD)
             </label>
             <p className="text-xs text-muted-foreground leading-relaxed">
               O consulente foi devidamente informado sobre o tratamento de seus dados pessoais
               (nome, data e local de nascimento, conteúdo das consultas) e consentiu expressamente,
               nos termos da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
             </p>
           </div>
         </div>
       </section>

       {/* Erro de servidor */}
       {serverError && (
         <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
           <AlertCircle className="w-4 h-4" />
           {serverError}
         </div>
       )}

      {/* Ações */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground/70">
          Ao salvar, calculamos os 4 mapas: Astrologia, Numerologia Cabalística, Numerologia
          Tântrica e Odu de Nascimento.
        </p>
        <Button
          type="submit"
          variant="spiritual"
          size="lg"
          disabled={isPending}
          className="shadow-[0_0_20px_var(--accent-orange-glow)]"
        >
          {isPending ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
              Calculando mapas…
            </>
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              Salvar Consulente
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
