// ============================================================
// ORUNMILA DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Orunmila data
// - Retrieve Orunmila configurations
// - Retrieve Odu and their meanings
// - Retrieve divination practices
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface OrunmilaConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface OduMeaning {
  odu: string;
  descricao: string;
  energia: string;
  significado: string;
}

interface DivinationPractice {
  tipo: string;
  descricao: string;
  freq: number;
}

// GET /api/orunmila/data - Get Orunmila data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: OrunmilaConfig[] = [
        { name: 'orunmila-primary', description: 'Configuracao principal de Orunmila', enabled: true },
        { name: 'orunmila-wisdom', description: 'Configuracao para sabedoria e destino', enabled: true },
        { name: 'orunmila-divination', description: 'Configuracao para pratica divinatoria', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return Odu and their meanings
    if (type === 'odu') {
      const odus: OduMeaning[] = [
        { odu: 'Ogbe', descricao: 'Primeiro Odu - Inicio e criacao', energia: 'Luz e possibilidade', significado: 'Representa o inicio de tudo, a semente divine' },
        { odu: 'Oyeku', descricao: 'Segundo Odu - Encerramento e morte', energia: 'Transformacao e fim', significado: 'Simboliza o ciclo de encerramento e renovacao' },
        { odu: 'Iwori', descricao: 'Terceiro Odu - Sabedoria e experiencia', energia: 'Conhecimento ancestral', significado: 'Carrega a sabedoria dos ancestrais' },
        { odu: 'Odi', descricao: 'Quarto Odu - Retencao e prisao', energia: 'Protecao e contencao', significado: 'Representa guardar e proteger o conhecimento' },
        { odu: 'Irosun', descricao: 'Quinto Odu - Sacrificio e oferenda', energia: 'Devocao e entrega', significado: 'Ensina sobre sacrificio espiritual' },
        { odu: 'Owonrin', descricao: 'Sexto Odu - Tempestade e mudancas', energia: 'Turbulencia e renovacao', significado: 'Anuncia mudancas e transformacoes' },
        { odu: 'Obara', descricao: 'Setimo Odu - Lei e ordem', energia: 'Justica e verdade', significado: 'Representa a lei divina e a ordem cosnica' },
        { odu: 'Okanran', descricao: 'Oitavo Odu - Separacao e clinica', energia: 'Cura e separacao', significado: 'Ensina sobre cura e diagnostico espiritual' },
      ];
      return NextResponse.json({ success: true, data: odus });
    }

    // Return divination practices
    if (type === 'divination') {
      const practices: DivinationPractice[] = [
        { tipo: 'opele', descricao: 'Coroa de Ifa - ferramenta principal de adivinhacao', freq: 1 },
        { tipo: 'ikin', descricao: 'Nozes de dendem sagrado', freq: 2 },
        { tipo: 'merindilogun', descricao: 'Buzios para consulta', freq: 3 },
        { tipo: 'divination-reading', descricao: 'Leitura adivinhatria completa', freq: 4 },
        { tipo: 'obi', descricao: 'Nozes de obi para perguntas simples', freq: 1 },
      ];
      return NextResponse.json({ success: true, data: practices });
    }

    // Default - return all Orunmila data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'orunmila-primary', description: 'Configuracao principal de Orunmila', enabled: true },
          { name: 'orunmila-wisdom', description: 'Configuracao para sabedoria e destino', enabled: true },
          { name: 'orunmila-divination', description: 'Configuracao para pratica divinatoria', enabled: true },
        ] as OrunmilaConfig[],
        odus: [
          { odu: 'Ogbe', descricao: 'Primeiro Odu - Inicio e criacao', energia: 'Luz e possibilidade', significado: 'Representa o inicio de tudo, a semente divine' },
          { odu: 'Oyeku', descricao: 'Segundo Odu - Encerramento e morte', energia: 'Transformacao e fim', significado: 'Simboliza o ciclo de encerramento e renovacao' },
          { odu: 'Iwori', descricao: 'Terceiro Odu - Sabedoria e experiencia', energia: 'Conhecimento ancestral', significado: 'Carrega a sabedoria dos ancestrais' },
          { odu: 'Odi', descricao: 'Quarto Odu - Retencao e prisao', energia: 'Protecao e contencao', significado: 'Representa guardar e proteger o conhecimento' },
          { odu: 'Irosun', descricao: 'Quinto Odu - Sacrificio e oferenda', energia: 'Devocao e entrega', significado: 'Ensina sobre sacrificio espiritual' },
          { odu: 'Owonrin', descricao: 'Sexto Odu - Tempestade e mudancas', energia: 'Turbulencia e renovacao', significado: 'Anuncia mudancas e transformacoes' },
          { odu: 'Obara', descricao: 'Setimo Odu - Lei e ordem', energia: 'Justica e verdade', significado: 'Representa a lei divina e a ordem cosnica' },
          { odu: 'Okanran', descricao: 'Oitavo Odu - Separacao e clinica', energia: 'Cura e separacao', significado: 'Ensina sobre cura e diagnostico espiritual' },
        ] as OduMeaning[],
        divination: [
          { tipo: 'opele', descricao: 'Coroa de Ifa - ferramenta principal de adivinhacao', freq: 1 },
          { tipo: 'ikin', descricao: 'Nozes de dendem sagrado', freq: 2 },
          { tipo: 'merindilogun', descricao: 'Buzios para consulta', freq: 3 },
          { tipo: 'divination-reading', descricao: 'Leitura adivinhatria completa', freq: 4 },
          { tipo: 'obi', descricao: 'Nozes de obi para perguntas simples', freq: 1 },
        ] as DivinationPractice[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Orunmila data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}