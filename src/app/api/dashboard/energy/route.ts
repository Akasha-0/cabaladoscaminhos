import { NextResponse } from 'next/server';

const PORTALS = {
  domingo: { orixa: 'Xangô', planeta: 'Sol', chakra: '3º Plexo Solar' },
  segunda: { orixa: 'Iemanjá', planeta: 'Lua', chakra: '6º Frontal' },
  terca: { orixa: 'Iansã', planeta: 'Marte', chakra: '2º Sacro' },
  quarta: { orixa: 'Xangô', planeta: 'Mercúrio', chakra: '3º Plexo Solar' },
  quinta: { orixa: 'Oxóssi', planeta: 'Júpiter', chakra: '4º Cardíaco' },
  sexta: { orixa: 'Oxalá', planeta: 'Vênus', chakra: '7º Coronário' },
  sabado: { orixa: 'Oxum', planeta: 'Saturno', chakra: '4º Cardíaco' },
};

export async function GET() {
  const days = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const dayName = days[new Date().getDay()];
  const portal = PORTALS[dayName as keyof typeof PORTALS];

  return NextResponse.json({
    success: true,
    energy: {
      day: dayName,
      ...portal,
      lunarPhase: 'Lua Crescente',
      lunarIllumination: 45,
    },
  });
}
