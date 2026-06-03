import { NextResponse } from 'next/server';
import { diagnoseSpiritualMisalignment, getSpiritualPrescription } from '@/lib/correlation/spiritual-diagnosis';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { symptoms } = body;

    if (!symptoms || !Array.isArray(symptoms)) {
      return NextResponse.json({
        success: false,
        error: 'Symptoms array is required',
      }, { status: 400 });
    }

    const diagnosis = diagnoseSpiritualMisalignment(symptoms);
    const prescription = getSpiritualPrescription(diagnosis);

    return NextResponse.json({
      success: true,
      data: {
        diagnosis,
        prescription,
        summary: diagnosis.length > 0
          ? `${diagnosis.length} chakra(s) necessitando de atenção`
          : 'Nenhum desalinhamento significativo detectado',
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  const symptomCategories = {
    coronario: ["Seticismo", "Fanatismo", "Vazio existencial", "Dores de cabeça", "Insônia"],
    frontal: ["Desorientação mental", "Pesadelos", "Confusão", "Sinusite", "Problemas de visão"],
    laringeo: ["Fofoca", "Agressividade", "Timidez", "Rouquidão", "Garganta inflamada"],
    cardiaco: ["Mágoa", "Dependência", "Incapacidade de perdoar", "Taquicardia", "Imunidade baixa"],
    plexoSolar: ["Raiva", "Ganância", "Complexo de inferioridade", "Azia", "Refluxo"],
    sacro: ["Bloqueio criativo", "Impotência", "Vícios", "Cólicas", "Dores pélvicas"],
    basico: ["Medo de escassez", "Preguiça", "Desorganização", "Dores nas articulações"],
  };

  return NextResponse.json({
    success: true,
    data: {
      categories: symptomCategories,
      usage: 'POST symptoms array to receive spiritual diagnosis',
    },
  });
}
