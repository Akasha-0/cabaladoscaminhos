// Otura-Meji API - Cabala Dos Caminhos
// GET endpoints for Otura-Meji Odu spiritual data

import { NextResponse } from 'next/server';

// Otura-Meji data structure based on Ifá lore
interface OturaMejiData {
  id: string;
  name: string;
  namePt: string;
  nameEn: string;
  symbol: string;
  yoruba: string;
  meaning: string;
  meaningPt: string;
  meaningEn: string;
  spiritualGuidance: string[];
  keywords: string[];
  elements: string[];
  colors: string[];
  dayOfWeek: string;
  rulingOrishas: string[];
  sacredNumbers: number[];
  greeting: string;
  rituals: string[];
  offerings: string[];
  affirmations: string[];
}

const oturaMejiData: OturaMejiData = {
  id: 'otura-meji-001',
  name: 'Otura-Meji',
  namePt: 'Otura-Meji - O Nódulo Duplicado',
  nameEn: 'Otura-Meji - The Knot Duplicated',
  symbol: '☴☴',
  yoruba: 'Ọ̀túrá Méjì',
  meaning: 'Otura-Meji',
  meaningPt: 'Otura-Meji representa o nó duplicado, a proteção sagradamanifestada em força múltipla. É o Odu da Sabedoria Oculta em par, dos segredos ancestrais revelados, da magia multiplicada e do poder de proteção em todas as direções.',
  meaningEn: 'Otura-Meji represents the duplicated knot, sacred protection manifested in multiplied force. It is the Odu of Hidden Wisdom in pair, revealed ancestral secrets, and multiplied magical power.',
  spiritualGuidance: [
    'Seek protection in sacred spaces and ancestral connections',
    'Practice daily rituals of spiritual cleansing and purification',
    'Honor your ancestors through offerings and prayers',
    'Meditate on the mysteries between worlds',
    'Trust in the protective power of the sacred knots',
    'Embrace the dual nature of hidden wisdom',
    'Use sacred numbers as guides in your spiritual practice',
  ],
  keywords: ['proteção', 'mistério', 'duplicação', 'ancestralidade', 'segredos', 'magia', 'força múltipla', 'sabedoria oculta'],
  elements: ['Terra', 'Água', 'Êxtase', 'Vento Ancestral'],
  colors: ['#800080', '#4B0082', '#9932CC', '#301934'],
  dayOfWeek: 'Quarta-feira',
  rulingOrishas: ['Olódùmarè', 'Orunmila', 'Osanyin', 'Olokun'],
  sacredNumbers: [3, 7, 12, 16, 30],
  greeting: 'The knot doubles!',
  rituals: [
    'Tie sacred knots during meditation to bind protection',
    'Offer honey and gin to ancestral spirits',
    'Light purple candles while chanting ancestral prayers',
    'Perform spiritual cleansing with herbs on Wednesdays',
    'Create a protection circle using sacred earth',
    'Honor Osanyin with green medicinal offerings',
    'Practice the ritual of the doubled knot for amplified protection',
  ],
  offerings: [
    'Honey mixed with gin (opa)',
    'Purple candles (for wisdom and mystery)',
    'Green herbs and leaves (for Osanyin)',
    'Sacred earth and soil from your homeland',
    'Fresh water offered at crossroads',
    'Tobacco (spiritual tobacco for ancestors)',
    'Coconut meat and oil',
  ],
  affirmations: [
    'I am wrapped in the doubled protection of the sacred knot',
    'My ancestral wisdom flows through me with multiplied power',
    'The mysteries of the universe reveal themselves to me',
    'I honor my ancestors and they guide my path',
    'I am protected from all directions by sacred light',
    'The knot of my destiny is tied with divine purpose',
    'I embrace the hidden wisdom that awakens within',
  ],
};

// Combined 16 Otura-Meji Odus
const oturaMejiOdusData: Record<number, OturaMejiData> = {
  1: { ...oturaMejiData, id: 'otura-meji-001', name: 'Otura-Meji' },
  2: { ...oturaMejiData, id: 'otura-meji-002', name: 'Otura-Meji Alafia', meaningPt: 'Otura-Meji Alafia representa a cura duplicada, a saúde multiplicada.', meaningEn: 'Duplicated healing and multiplied health' },
  3: { ...oturaMejiData, id: 'otura-meji-003', name: 'Otura-Meji Irosun', meaningPt: 'Otura-Meji Irosun é o Odu da percepção visionária multiplicada.', meaningEn: 'The Odu of multiplied visionary perception' },
  4: { ...oturaMejiData, id: 'otura-meji-004', name: 'Otura-Meji Ogbe', meaningPt: 'Otura-Meji Ogbe representa vitória segura em todas as direções.', meaningEn: 'Assured victory in all directions' },
  5: { ...oturaMejiData, id: 'otura-meji-005', name: 'Otura-Meji Oura', meaningPt: 'Otura-Meji Oura simboliza a luz interior duplicada.', meaningEn: 'The symbol of duplicated inner light' },
  6: { ...oturaMejiData, id: 'otura-meji-006', name: 'Otura-Meji Irosioni', meaningPt: 'Otura-Meji Irosioni representa a sabedoria oculta protegida.', meaningEn: 'Protected hidden wisdom' },
  7: { ...oturaMejiData, id: 'otura-meji-007', name: 'Otura-Meji Osa', meaningPt: 'Otura-Meji Osa é força e estabilidade em dobro.', meaningEn: 'Doubled strength and stability' },
  8: { ...oturaMejiData, id: 'otura-meji-008', name: 'Otura-Meji Odi', meaningPt: 'Otura-Meji Odi representa o destino protegido pelos deuses.', meaningEn: 'Destiny protected by the gods' },
  9: { ...oturaMejiData, id: 'otura-meji-009', name: 'Otura-Meji Oyeku', meaningPt: 'Otura-Meji Oyeku simboliza mistérios que se revelam em par.', meaningEn: 'Mysteries revealed in pairs' },
  10: { ...oturaMejiData, id: 'otura-meji-010', name: 'Otura-Meji Wonrin', meaningPt: 'Otura-Meji Wonrin representa ventos de mudança em duplicidade.', meaningEn: 'Winds of change in duplication' },
  11: { ...oturaMejiData, id: 'otura-meji-011', name: 'Otura-Meji Obu', meaningPt: 'Otura-Meji Obu é proteção aquatic sagrada multiplicada.', meaningEn: 'Multiplied sacred aquatic protection' },
  12: { ...oturaMejiData, id: 'otura-meji-012', name: 'Otura-Meji Trupon', meaningPt: 'Otura-Meji Trupon representa mistérios ancestrais revelados.', meaningEn: 'Ancestral mysteries revealed' },
  13: { ...oturaMejiData, id: 'otura-meji-013', name: 'Otura-Meji Oya', meaningPt: 'Otura-Meji Oya traz o poder dos ventos em par.', meaningEn: 'The power of winds in pair' },
  14: { ...oturaMejiData, id: 'otura-meji-014', name: 'Otura-Meji Obodu', meaningPt: 'Otura-Meji Obodu protege contra todo mal em dobro.', meaningEn: 'Doubled protection against all evil' },
  15: { ...oturaMejiData, id: 'otura-meji-015', name: 'Otura-Meji Yikini', meaningPt: 'Otura-Meji Yikini representa a riqueza multiplicada.', meaningEn: 'Multiplied wealth and prosperity' },
  16: { ...oturaMejiData, id: 'otura-meji-016', name: 'Otura-Meji Tiku', meaningPt: 'Tikura simboliza o nó cósmico da criação em duplicidade.', meaningEn: 'The cosmic knot of creation in duplication' },
};

/**
 * GET /api/otura-meji/data
 * Returns Otura-Meji-related data including Otura-Meji Odu and associated spiritual values
 * Supports query parameters: type, numero, nome
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const numero = searchParams.get('numero');
    const nome = searchParams.get('nome');

    // Default: return complete Otura-Meji data
    if (!type && !numero && !nome) {
      return NextResponse.json({
        status: 'success',
        data: oturaMejiData,
        totalOdus: 16,
      });
    }

    // By type parameter
    if (type) {
      switch (type.toLowerCase()) {
        case 'principal':
          return NextResponse.json({
            status: 'success',
            data: oturaMejiData,
          });
        case 'todos':
        case 'all':
          return NextResponse.json({
            status: 'success',
            data: oturaMejiOdusData,
            totalOdus: 16,
          });
        case 'odus':
          return NextResponse.json({
            status: 'success',
            data: Object.values(oturaMejiOdusData),
            totalOdus: 16,
          });
        case 'elementos':
        case 'elements':
          return NextResponse.json({
            status: 'success',
            data: {
              elements: oturaMejiData.elements,
              colors: oturaMejiData.colors,
              dayOfWeek: oturaMejiData.dayOfWeek,
              sacredNumbers: oturaMejiData.sacredNumbers,
            },
          });
        case 'rituais':
        case 'rituals':
          return NextResponse.json({
            status: 'success',
            data: {
              rituals: oturaMejiData.rituals,
              offerings: oturaMejiData.offerings,
            },
          });
        case 'afirmacoes':
        case 'affirmations':
          return NextResponse.json({
            status: 'success',
            data: oturaMejiData.affirmations,
          });
        case 'guia':
        case 'guidance':
          return NextResponse.json({
            status: 'success',
            data: {
              spiritualGuidance: oturaMejiData.spiritualGuidance,
              keywords: oturaMejiData.keywords,
            },
          });
        case 'simbolos':
        case 'symbols':
          return NextResponse.json({
            status: 'success',
            data: {
              symbol: oturaMejiData.symbol,
              greeting: oturaMejiData.greeting,
              name: oturaMejiData.name,
            },
          });
        default:
          return NextResponse.json(
            { status: 'error', message: 'Tipo inválido. Use: principal, todos, odus, elementos, rituais, afirmacoes, guia, simbolos' },
            { status: 400 }
          );
      }
    }

    // By numero parameter (1-16)
    if (numero) {
      const num = parseInt(numero, 10);
      if (isNaN(num) || num < 1 || num > 16) {
        return NextResponse.json(
          { status: 'error', message: 'Número inválido. Use valores de 1 a 16.' },
          { status: 400 }
        );
      }
      return NextResponse.json({
        status: 'success',
        data: oturaMejiOdusData[num],
      });
    }

    // By nome parameter
    if (nome) {
      const nomeLower = nome.toLowerCase();
      const match = Object.values(oturaMejiOdusData).find(
        (odu) =>
          odu.name.toLowerCase().includes(nomeLower) ||
          odu.namePt.toLowerCase().includes(nomeLower) ||
          odu.id.toLowerCase().includes(nomeLower)
      );
      if (!match) {
        return NextResponse.json(
          { status: 'error', message: `Odu com nome "${nome}" não encontrado.` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        status: 'success',
        data: match,
      });
    }

    return NextResponse.json({
      status: 'success',
      data: oturaMejiData,
    });
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
