// src/components/cockpit/clients/ClientMapPreview.tsx
// Exibe os 4 mapas calculados (astrologia, cabala, tantrica, odu) como cards.
// Tokens Ramiro: cada mapa em card bg-card com border-border, badges internas:
//   Astrologia, Cabala, Odu = secondary (royal)
//   Tântrica = primary (laranja)
import { Crown, Sparkles, Flame, Sun } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ClientMapPreviewProps {
  astrology: unknown;
  kabalistic: unknown;
  tantric: unknown;
  odu: unknown;
}

function safeObj(v: unknown): Record<string, unknown> {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return {};
}

function stringifyValue(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>).filter(([, val]) => val != null);
    if (entries.length === 0) return '—';
    return entries.map(([k, val]) => `${k}: ${stringifyValue(val)}`).join(' · ');
  }
  return String(v);
}

function MapCard({
  title,
  icon: Icon,
  map,
  accent,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  map: unknown;
  accent: 'royal' | 'laranja';
}) {
  const obj = safeObj(map);
  const entries = Object.entries(obj).filter(([, v]) => v != null);

  const accentClass = accent === 'laranja' ? 'border-primary/30' : 'border-secondary/30';

  const titleClass = accent === 'laranja' ? 'text-primary' : 'text-secondary';
  const iconClass = accent === 'laranja' ? 'text-primary' : 'text-secondary';

  return (
    <Card className={`bg-card/60 ${accentClass} p-4 space-y-3`}>
      <header className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconClass}`} />
        <h3 className={`font-cinzel text-sm uppercase tracking-widest ${titleClass}`}>{title}</h3>
      </header>
      {entries.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 italic">Mapa ainda não calculado.</p>
      ) : (
        <dl className="space-y-1.5 text-sm">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-start gap-2">
              <dt className="text-muted-foreground/70 text-xs uppercase tracking-wider min-w-[80px]">
                {k}
              </dt>
              <dd className="text-foreground/90 flex-1">{stringifyValue(v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </Card>
  );
}

export function ClientMapPreview({ astrology, kabalistic, tantric, odu }: ClientMapPreviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MapCard title="Astrologia" icon={Sun} map={astrology} accent="royal" />
      <MapCard title="Numerologia Cabalística" icon={Crown} map={kabalistic} accent="royal" />
      <MapCard title="Numerologia Tântrica" icon={Flame} map={tantric} accent="laranja" />
      <MapCard title="Odu de Nascimento" icon={Sparkles} map={odu} accent="royal" />
    </div>
  );
}
