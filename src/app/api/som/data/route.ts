import { NextResponse } from 'next/server';
import { getHealing } from '@/lib/energy/energy-healing';

const SOM_DATA = {
  id: 'som',
  name: 'Terapia Sonara',
  description: 'Uso de bowls tibetanos, diapasões e sons harmônicos para dissolver bloqueios energéticos.',
  applications: ['Dissolução de bloqueios', 'Ressonância celular', 'Profundo relaxamento'],
  recommendation: 'Exposição aos sons harmônicos por 40-50 minutos em estado de relaxamento profundo.',
  duration: '40-50 minutos',
  techniques: [
    {
      id: 'bowl-tibetano',
      name: 'Bowl Tibetano',
      description: 'Cuenca de sonido que produce frecuencias armónicas para meditación y sanación.',
      benefits: ['Relajación profunda', 'armonizacion energetica', 'reduccion de estres'],
      usage: ['Meditacion guiada', 'Reiki', 'Yoga Nidra'],
    },
    {
      id: 'diapasones',
      name: 'Diapasones',
      description: 'Varillas metalicas afinadas a frecuencias especificas para equilibrar centros energeticos.',
      benefits: ['precision en frecuencias', 'trabajo localizada', 'activacion de chakras'],
      usage: ['Chakras', 'Meridianos', 'Puntos de dolor'],
    },
    {
      id: 'gong',
      name: 'Gong',
      description: 'Instrumento de percusion que genera frecuencias profundas para expansion de conciencia.',
      benefits: ['Liberacion de emociones', 'Limpieza aurica', 'Conexion espiritual'],
      usage: ['Sesiones de grupo', 'Meditacion profunda', 'Terapia de sonido'],
    },
    {
      id: 'tingsha',
      name: 'Tingsha',
      description: 'Campanas pequeñas que producen tonos cristalinos para sanacion y purification.',
      benefits: ['Purificacion', 'Elevacion vibracional', 'Anclaje espiritual'],
      usage: ['Rituales', 'Transiciones', 'Finalizacion de meditacion'],
    },
    {
      id: 'mantras-sonoros',
      name: 'Mantras Sonoros',
      description: 'Vocalizaciones sagradas que crean patrones de sonido para transformacion energetica.',
      benefits: ['Reprogramacion mental', 'Apertura de canales', 'Elevacion de conciencia'],
      usage: ['Practica diaria', 'Ceremonias', 'Sanacion vocal'],
    },
  ],
  instruments: [
    { id: 'bowl', name: 'Bowls Tibetanos', quantity: 'Set de 7' },
    { id: 'tuning', name: 'Diapasones', quantity: 'Set de 9' },
    { id: 'gong', name: 'Gong', quantity: '2-3' },
    { id: 'tingsha', name: 'Tingsha', quantity: '1 par' },
    { id: 'rainstick', name: 'Rainstick', quantity: '1' },
  ],
  protocols: [
    {
      name: 'Sesion Basica',
      duration: '40 minutos',
      steps: [
        'Preparacion del espacio con aromaterapia',
        'Relajacion guiada inicial (5 min)',
        'Aplicacion de bowls en puntos energeticos (25 min)',
        'Silencio integrador (5 min)',
        'Cierre con tingsha (5 min)',
      ],
    },
    {
      name: 'Sesion Profunda',
      duration: '60 minutos',
      steps: [
        ' Limpieza energetica previa',
        'Meditacion de anclaje (10 min)',
        'Trabajo con diapasones en chakras (30 min)',
        'Resonancia con gong (15 min)',
        'Integracion y agua filtrada (5 min)',
      ],
    },
  ],
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type');

  switch (type) {
    case 'techniques':
      return NextResponse.json({ data: SOM_DATA.techniques });

    case 'instruments':
      return NextResponse.json({ data: SOM_DATA.instruments });

    case 'protocols':
      return NextResponse.json({ data: SOM_DATA.protocols });

    case 'healing':
      return NextResponse.json({ data: getHealing('som') });

    case 'all':
      return NextResponse.json({
        data: {
          ...SOM_DATA,
          healingInfo: getHealing('som'),
        },
      });

    default:
      return NextResponse.json({
        data: SOM_DATA,
        meta: {
          types: ['techniques', 'instruments', 'protocols', 'healing', 'all'],
        },
      });
  }
}