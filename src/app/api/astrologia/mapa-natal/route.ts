import { NextRequest, NextResponse } from 'next/server';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';
import { calcularAspectos } from '@/lib/astrologia/planetas/aspectos';
import type { MapaNatal } from '@/lib/astrologia/tipos';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataNascimento = searchParams.get('dataNascimento');
    const horaNascimento = searchParams.get('horaNascimento') || '12:00';
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    
    if (!dataNascimento || !latitude || !longitude) {
      return NextResponse.json({ 
        error: 'Dados incompletos para cálculo' 
      }, { status: 400 });
    }
    
    const mapaNatal = calcularMapaNatal(
      new Date(dataNascimento),
      horaNascimento,
      parseFloat(latitude),
      parseFloat(longitude)
    );
    
    const posicoes = Object.values(mapaNatal.planeta);
    const aspectos = calcularAspectos(posicoes);
    
    return NextResponse.json({
      mapaNatal,
      aspectos,
      interpretacao: gerarInterpretacaoBasica(mapaNatal),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=259200, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Erro calculando mapa natal:', error);
    return NextResponse.json({ 
      error: 'Erro ao calcular mapa natal' 
    }, { status: 500 });
  }
}

function gerarInterpretacaoBasica(mapaNatal: MapaNatal): string {
  const solSigno = mapaNatal.planeta.sol.signo;
  const ascendente = mapaNatal.ascendente;
  
  return `Sol em ${capitalize(solSigno)}, Ascendente em ${getSignoNome(ascendente)}. Mapa astral personalizado.`;
}

function getSignoNome(grau: number): string {
  const signos = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 
                  'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  return signos[Math.floor(grau / 30)];
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
