import { NextRequest, NextResponse } from 'next/server';
import { calcularTrânsitosAtivos } from '@/lib/astrologia/trânsitos/calculator';
import { calcularMapaNatal } from '@/lib/astrologia/planetas/posicoes';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dataNascimento = searchParams.get('dataNascimento');
    const horaNascimento = searchParams.get('horaNascimento') || '12:00';
    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const dataAtual = searchParams.get('dataAtual');
    
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
    
    const transitos = calcularTrânsitosAtivos(
      mapaNatal,
      dataAtual ? new Date(dataAtual) : new Date()
    );
    
    return NextResponse.json(
      { transitos },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
        },
      }
    );
  } catch (_error) {
    console.error('Erro calculando trânsitos:', _error);
    return NextResponse.json({ 
      error: 'Erro ao calcular trânsitos' 
    }, { status: 500 });
  }
}