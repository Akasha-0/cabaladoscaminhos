'use client';

const DAYS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
const PORTALS: Record<string, { orixa: string; cor: string; symbol: string }> = {
  domingo: { orixa: 'Xangô', cor: '#D4A843', symbol: '🔥' },
  segunda: { orixa: 'Iemanjá', cor: '#1E3A5F', symbol: '🌊' },
  terca: { orixa: 'Iansã', cor: '#C45C26', symbol: '⚡' },
  quarta: { orixa: 'Xangô', cor: '#F0B429', symbol: '⚡' },
  quinta: { orixa: 'Oxóssi', cor: '#2D6A4F', symbol: '🏹' },
  sexta: { orixa: 'Oxalá', cor: '#7C6EB3', symbol: '✧' },
  sabado: { orixa: 'Oxum', cor: '#D4728C', symbol: '💧' },
};

export function EnergyIndicator() {
  const dayName = DAYS[new Date().getDay()];
  const portal = PORTALS[dayName];
  
  return (
    <div 
      className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
      style={{ backgroundColor: `${portal.cor}20`, color: portal.cor }}
    >
      <span className="text-lg">{portal.symbol}</span>
      <span>Dia de {portal.orixa}</span>
    </div>
  );
}