import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  diasSemana,
  orixas,
  odus,
  cartasLenormand,
  chakras,
  fasesLua,
  getDiaSemanaAtual,
  getOrixasDoDia,
  getFaseLuaAtual,
  getCorrespondenciasDia,
} from '@/lib/data/spiritual-data';

// ─── Zod Schemas ───────────────────────────────────────────────────────────
const CategorySchema = z.enum([
  'dias', 'orixas', 'odus', 'lenormand', 'chakras', 'tarot', 'hoje', 'all'
]);

const SpiritualDataQuerySchema = z.object({
  category: CategorySchema.optional(),
  filter: z.string().optional(),
  element: z.string().optional(),
  chakra: z.coerce.number().int().min(1).max(7).optional(),
});

export const dynamic = 'force-dynamic';

// ─── API Route Handlers ──────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const parseResult = SpiritualDataQuerySchema.safeParse({
      category: searchParams.get('category'),
      filter: searchParams.get('filter'),
      element: searchParams.get('element'),
      chakra: searchParams.get('chakra'),
    });

    if (!parseResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }

    const { category, filter, element, chakra } = parseResult.data;

    // If no category, return available endpoints
    if (!category) {
      return NextResponse.json({
        success: true,
        endpoints: ['dias', 'orixas', 'odus', 'lenormand', 'chakras', 'tarot', 'hoje', 'all'],
        categories: {
          dias: '/api/spiritual-data?category=dias',
          orixas: '/api/spiritual-data?category=orixas',
          odus: '/api/spiritual-data?category=odus',
          lenormand: '/api/spiritual-data?category=lenormand',
          chakras: '/api/spiritual-data?category=chakras',
          tarot: '/api/spiritual-data?category=tarot',
          hoje: '/api/spiritual-data?category=hoje',
          all: '/api/spiritual-data?category=all',
        },
      });
    }

    // Handle 'all' category - return all spiritual data
    if (category === 'all') {
      return NextResponse.json({
        success: true,
        data: {
          diasSemana,
          orixas,
          odus,
          lenormand: cartasLenormand,
          chakras,
          fasesLua,
        },
        meta: {
          counts: {
            diasSemana: diasSemana.length,
            orixas: orixas.length,
            odus: odus.length,
            lenormand: cartasLenormand.length,
            chakras: chakras.length,
            fasesLua: fasesLua.length,
          },
        },
      });
    }

    switch (category) {
      case 'dias': {
        let data = diasSemana;
        
        if (filter) {
          data = data.filter(d => 
            d.dia.toLowerCase().includes(filter.toLowerCase()) ||
            d.orixá.toLowerCase().includes(filter.toLowerCase())
          );
        }
        
        return NextResponse.json({
          success: true,
          data,
          meta: { total: data.length },
        });
      }
      
      case 'orixas': {
        let data = getOrixasDoDia();
        
        if (filter) {
          data = data.filter(o => 
            o.nome.toLowerCase().includes(filter.toLowerCase()) ||
            o.elemento.toLowerCase().includes(filter.toLowerCase())
          );
        }
        
        if (element) {
          data = data.filter(o => o.elemento.toLowerCase() === element.toLowerCase());
        }
        
        return NextResponse.json({
          success: true,
          data,
          meta: { total: data.length, filter, element },
        });
      }
      
      case 'odus': {
        let data = odus;
        
        if (filter) {
          data = data.filter(o => 
            o.nome.toLowerCase().includes(filter.toLowerCase()) ||
            o.significado.toLowerCase().includes(filter.toLowerCase())
          );
        }
        
        if (element) {
          data = data.filter(o => o.elementos.toLowerCase().includes(element.toLowerCase()));
        }
        
        return NextResponse.json({
          success: true,
          data,
          meta: { total: data.length, filter, element },
        });
      }
      
      case 'lenormand': {
        let data = cartasLenormand;
        
        if (filter) {
          data = data.filter(c => 
            c.nome.toLowerCase().includes(filter.toLowerCase()) ||
            c.significado.toLowerCase().includes(filter.toLowerCase())
          );
        }
        
        return NextResponse.json({
          success: true,
          data,
          meta: { total: data.length, filter },
        });
      }
      
      case 'chakras': {
        let data = chakras;
        
        if (chakra) {
          data = data.filter(c => c.numero === chakra);
        }
        
        if (filter) {
          data = data.filter(c => 
            c.nome.toLowerCase().includes(filter.toLowerCase()) ||
            c.localizacao.toLowerCase().includes(filter.toLowerCase())
          );
        }
        
        return NextResponse.json({
          success: true,
          data,
          meta: { total: data.length, chakra, filter },
        });
      }
      
      case 'tarot': {
        // Import tarot data dynamically to avoid circular dependencies
        const { TAROT_DECK } = await import('@/lib/tarot/cards');
        let data = TAROT_DECK.cards;
        
        if (filter) {
          data = data.filter(c => 
            c.name.toLowerCase().includes(filter.toLowerCase()) ||
            c.arcana.toLowerCase().includes(filter.toLowerCase())
          );
        }
        
        return NextResponse.json({
          success: true,
          data,
          meta: { total: data.length, filter },
        });
      }
      
      case 'hoje':
        return NextResponse.json({
          success: true,
          data: {
            dia: getDiaSemanaAtual(),
            orixas: getOrixasDoDia(),
            fase: getFaseLuaAtual(),
            correspondencias: getCorrespondenciasDia(),
          },
        });
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Categoria inválida',
          validCategories: ['dias', 'orixas', 'odus', 'lenormand', 'chakras', 'tarot', 'hoje', 'all'],
        }, { status: 400 });
    }
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({
      success: false,
      error: `Erro interno: ${err.message}`,
    }, { status: 500 });
  }
}