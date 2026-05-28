// ============================================================
// OLUDUMARE DATA API - CABALA DOS CAMINHOS
// ============================================================
// GET endpoints for Oludumare data
// - Retrieve divine configurations
// - Retrieve cosmic attributes
// - Retrieve creation symbolism
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

interface OludumareConfig {
  name: string;
  description: string;
  enabled: boolean;
}

interface CosmicAttribute {
  tipo: string;
  descricao: string;
  peso: number;
}

interface CreationSymbolism {
  aspecto: string;
  energia: string;
  significado: string;
}

// GET /api/oludumare/data - Get Oludumare data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    // Return single config by type
    if (type === 'config') {
      const configs: OludumareConfig[] = [
        { name: 'oludumare-cosmic', description: 'Configuracao suprema de Oludumare', enabled: true },
        { name: 'oludumare-creation', description: 'Configuracao para simbolismo da criacao', enabled: true },
        { name: 'oludumare-divine', description: 'Configuracao para energia divina', enabled: true },
      ];
      return NextResponse.json({ success: true, data: configs });
    }

    // Return cosmic attributes
    if (type === 'attributes') {
      const attributes: CosmicAttribute[] = [
        { tipo: 'supremo', descricao: 'O poder supremo e criador', peso: 1 },
        { tipo: 'transcendente', descricao: ' Alem de toda compreensao mortal', peso: 1 },
        { tipo: 'omnipotente', descricao: 'Todo-poderoso, fonte de toda existencia', peso: 1 },
      ];
      return NextResponse.json({ success: true, data: attributes });
    }

    // Return creation symbolism
    if (type === 'creation') {
      const aspects: CreationSymbolism[] = [
        { aspecto: 'origem', energia: 'Inicio de toda existencia', significado: 'Fonte primordial de vida' },
        { aspecto: 'ordem', energia: 'Organizacao do cosmos', significado: 'Harmonia universal' },
        { aspecto: 'providencia', energia: 'Cuidado divino', significado: 'Visao suprema do destino' },
        { aspecto: 'eternidade', energia: 'Tempo infinito', significado: 'Transcendência alem do tempo' },
      ];
      return NextResponse.json({ success: true, data: aspects });
    }

    // Default — return all Oludumare data
    return NextResponse.json({
      success: true,
      data: {
        configs: [
          { name: 'oludumare-cosmic', description: 'Configuracao suprema de Oludumare', enabled: true },
          { name: 'oludumare-creation', description: 'Configuracao para simbolismo da criacao', enabled: true },
          { name: 'oludumare-divine', description: 'Configuracao para energia divina', enabled: true },
        ] as OludumareConfig[],
        attributes: [
          { tipo: 'supremo', descricao: 'O poder supremo e criador', peso: 1 },
          { tipo: 'transcendente', descricao: ' Arom de toda compreensao mortal', peso: 1 },
          { tipo: 'omnipotente', descricao: 'Todo-poderoso, fonte de toda existencia', peso: 1 },
        ] as CosmicAttribute[],
        creation: [
          { aspecto: 'origem', energia: 'Inicio de toda existencia', significado: 'Fonte primordial de vida' },
          { aspecto: 'ordem', energia: 'Organizacao do cosmos', significado: 'Harmonia universal' },
          { aspecto: 'providencia', energia: 'Cuidado divino', significado: 'Visao suprema do destino' },
          { aspecto: 'eternidade', energia: 'Tempo infinito', significado: 'Transcendência alem do tempo' },
        ] as CreationSymbolism[],
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch Oludumare data',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
