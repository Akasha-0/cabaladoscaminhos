// src/app/cockpit/setup-perfil/page.tsx
// Onboarding B2C: Configuração de Perfil do Seeker/Buscador.
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, Calendar, Clock, MapPin, Loader2, ShieldCheck } from 'lucide-react';
import { geocodeCity, guessTimezoneFromBrowser } from '@/lib/geocoding/nominatim';

export default function SetupPerfilPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [birthCity, setBirthCity] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  
  const [geocoding, setGeocoding] = useState(false);
  const [geocoded, setGeocoded] = useState<{ latitude: number; longitude: number; displayName: string } | null>(null);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCityBlur = async () => {
    const city = birthCity.trim();
    if (city.length < 2) {
      setGeocoded(null);
      setGeocodeError(null);
      return;
    }
    setGeocoding(true);
    setGeocodeError(null);
    try {
      const result = await geocodeCity(city, { countryCodes: 'br' });
      setGeocoding(false);
      if (result) {
        setGeocoded(result);
      } else {
        setGeocoded(null);
        setGeocodeError('Cidade não encontrada. O fuso horário e mapa astral serão aproximados.');
      }
    } catch {
      setGeocoding(false);
      setGeocodeError('Erro de conexão ao buscar cidade.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !birthDate || !consentGiven) {
      setError('Por favor, preencha todos os campos obrigatórios e aceite os termos de consentimento.');
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        const birthDateISO = `${birthDate}T${birthTime}:00.000Z`;
        const res = await fetch('/api/mesa-real/clients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName,
            birthDate: birthDateISO,
            birthTime,
            birthCity,
            birthState: '',
            birthCountry: 'Brasil',
            consentGiven,
            ...(geocoded && {
              birthLatitude: geocoded.latitude,
              birthLongitude: geocoded.longitude,
              birthTimezone: guessTimezoneFromBrowser() ?? 'America/Sao_Paulo',
            }),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          setError(err.error || 'Erro ao salvar perfil.');
          return;
        }

        router.push('/cockpit');
        router.refresh();
      } catch {
        setError('Erro de conexão com o servidor.');
      }
    });
  };

  return (
    <main className="ramiro min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      {/* Aurora visual glow background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 flex items-center justify-center opacity-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 50%, oklch(0.55 0.18 260) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/20 mb-4 animate-glow-pulse">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold text-foreground">Prepare seu Templo</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            Insira seus dados natais exatos para abrirmos sua biblioteca akáshica e calcular seus alinhamentos espirituais.
          </p>
        </div>

        {/* Form Card */}
        <Card className="bg-card/85 backdrop-blur border border-border/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden card-spiritual">
          {error && (
            <div
              role="alert"
              className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-4"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Nome Completo */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs text-muted-foreground uppercase tracking-wider">
                Nome Completo (Conforme registro de nascimento)
              </Label>
              <Input
                id="fullName"
                placeholder="Ex: Eliane Simão de Almeida"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isPending}
                className="bg-muted/50 border-border/50 focus:border-primary/50"
              />
            </div>

            {/* Data e Hora de Nascimento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="birthDate" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Data de Nascimento
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                  disabled={isPending}
                  className="bg-muted/50 border-border/50 focus:border-primary/50 text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="birthTime" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Hora (Aproximada)
                </Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={birthTime}
                  onChange={(e) => setBirthTime(e.target.value)}
                  disabled={isPending}
                  className="bg-muted/50 border-border/50 focus:border-primary/50 text-foreground"
                />
              </div>
            </div>

            {/* Local de Nascimento */}
            <div className="space-y-1.5">
              <Label htmlFor="birthCity" className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Cidade de Nascimento
              </Label>
              <Input
                id="birthCity"
                placeholder="Ex: São Paulo"
                value={birthCity}
                onChange={(e) => setBirthCity(e.target.value)}
                onBlur={handleCityBlur}
                disabled={isPending}
                className="bg-muted/50 border-border/50 focus:border-primary/50"
              />
              {geocoding && (
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Loader2 className="w-3 h-3 animate-spin text-primary" /> Buscando coordenadas sagradas da cidade...
                </p>
              )}
              {geocoded && !geocoding && (
                <p className="text-[11px] text-emerald-400">
                  ✓ Coordenadas identificadas: {geocoded.displayName.split(',').slice(0, 2).join(',')}
                </p>
              )}
              {geocodeError && !geocoding && (
                <p className="text-[11px] text-amber-400">{geocodeError}</p>
              )}
            </div>

            {/* Consentimento LGPD */}
            <div className="flex items-start gap-3 bg-muted/30 p-3 rounded-lg border border-border/40">
              <input
                id="consent"
                type="checkbox"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                disabled={isPending}
                className="mt-1 accent-primary rounded cursor-pointer"
              />
              <Label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                <span className="font-semibold text-foreground flex items-center gap-1 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Consentimento de Dados Pessoais
                </span>
                Eu autorizo o Portal Akasha a processar meus dados de nascimento para gerar cálculos, mapas astrológicos, numerológicos e diagnósticos espirituais integrados.
              </Label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-cinzel tracking-wider uppercase"
              disabled={isPending || !fullName || !birthDate || !consentGiven}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Abrindo Portais...
                </>
              ) : (
                'Entrar no Templo'
              )}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
