import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
// ─── Zod Schemas ───────────────────────────────────────────────────────────
const ArcanoSchema = z.enum(['maior', 'menor']);
const TarotLibraryQuerySchema = z.object({
  arcano: ArcanoSchema.optional(),
  search: z.string().optional(),
  numero: z.coerce.number().int().min(0).max(21).optional(),
  limit: z.coerce.number().int().positive().max(78).optional(),
// Tarot cards complete data
const tarotCards = [
  // Major Arcana
  { numero: 0, nome: 'O Louco', arcano: 'Maior', significadoUpright: 'Novos começos, liberdade, espontaneidade, inocência', significadoReversed: 'Irresponsabilidade, impulsividade, loucura, presa de riscos desnecessários', keywords: ['liberdade', 'aventura', 'espontaneidade'] },
  { numero: 1, nome: 'O Mago', arcano: 'Maior', significadoUpright: 'Manifestação, recursos, habilidade, propósito', significadoReversed: 'Manipulação, influências negativas, falta de direção', keywords: ['manifestação', 'poder', 'ação'] },
  { numero: 2, nome: 'A Sacerdotisa', arcano: 'Maior', significadoUpright: 'Intuição, sabedoria interior, profundezas do inconsciente', significadoReversed: 'Segredos, mistérios não revelados, superficialidade', keywords: ['intuição', 'mistério', 'conhecimento'] },
  { numero: 3, nome: 'A Imperadora', arcano: 'Maior', significadoUpright: 'Fertilidade, abundância, natureza, nutrição', significadoReversed: 'Bloqueio criativo, dependência de outros, negligência', keywords: ['abundância', 'maturidade', 'criação'] },
  { numero: 4, nome: 'O Imperador', arcano: 'Maior', significadoUpright: 'Autoridade, estrutura, controle, liderança', significadoReversed: 'Rigidez, domínio excessivo, fragilidade', keywords: ['estrutura', 'liderança', 'estabilidade'] },
  { numero: 5, nome: 'O Hierofante', arcano: 'Maior', significadoUpright: 'Tradição, espiritualidade, conformidade, ética', significadoReversed: 'Rebeldia, novos caminhos, falta de tradição', keywords: ['tradição', 'espiritualidade', 'educação'] },
  { numero: 6, nome: 'Os Enamorados', arcano: 'Maior', significadoUpright: 'Amor, harmonia, relacionamentos, escolha', significadoReversed: 'Disharmonia, desequilíbrio, má escolha', keywords: ['amor', 'união', 'decisão'] },
  { numero: 7, nome: 'O Carro', arcano: 'Maior', significadoUpright: 'Vitória, conquista, controle, vontade', significadoReversed: 'Falta de direção, agressividade, obstáculos', keywords: ['conquista', 'vitória', 'determinação'] },
  { numero: 8, nome: 'A Força', arcano: 'Maior', significadoUpright: 'Coragem, persuasão, influência, compaixão', significadoReversed: 'Interior fraco, autodúvida, manipulação', keywords: ['força', 'coragem', 'compaixão'] },
  { numero: 9, nome: 'O Eremita', arcano: 'Maior', significadoUpright: 'Introspecção, solidão, busca interior, autoconhecimento', significadoReversed: 'Isolamento extremo, timidez, solidão', keywords: ['introspecção', 'sabedoria', 'iluminação'] },
  { numero: 10, nome: 'A Roda da Fortuna', arcano: 'Maior', significadoUpright: 'Ciclos, destino, mudança, sorte', significadoReversed: 'Má sorte, procrastinação, ciclo vicioso', keywords: ['destino', 'sorte', 'transformação'] },
  { numero: 11, nome: 'A Justiça', arcano: 'Maior', significadoUpright: 'Justiça, verdade, lei, equidade', significadoReversed: 'Injustiça, falta de responsabilidade, desonestidade', keywords: ['equidade', 'verdade', 'justiça'] },
  { numero: 12, nome: 'O Enforcado', arcano: 'Maior', significadoUpright: 'Pausa, sacrifício, nova perspectiva, rendição', significadoReversed: 'Resistência, estagnação, indolência', keywords: ['sacrifício', 'renovação', 'perspectiva'] },
  { numero: 13, nome: 'A Morte', arcano: 'Maior', significadoUpright: 'Fim de ciclo, transição, transformação, renascimento', significadoReversed: 'Medo de mudança, estagnação, decomposição', keywords: ['transformação', 'metamorfose', 'renascimento'] },
  { numero: 14, nome: 'A Temperança', arcano: 'Maior', significadoUpright: 'Equilíbrio, paciência, propósito, harmonia', significadoReversed: 'Desequilíbrio, excesso, falta de propósito', keywords: ['harmonia', 'equilíbrio', 'moderação'] },
  { numero: 15, nome: 'O Diabo', arcano: 'Maior', significadoUpright: 'Escravidão, vício, ilusão, materialismo', significadoReversed: 'Libertação, renúncia, recuperação do poder', keywords: ['ilusão', 'vício', 'libertação'] },
  { numero: 16, nome: 'A Torre', arcano: 'Maior', significadoUpright: 'Mudança repentina, catastrofe, revelação, upheaval', significadoReversed: 'Mudança evitada, medo de transformação, catastrofe adiada', keywords: ['catástrofe', 'revelação', 'libertação'] },
  { numero: 17, nome: 'A Estrela', arcano: 'Maior', significadoUpright: 'Esperança, fé, propósito, serenidade', significadoReversed: 'Desesperança, descrença, desespero', keywords: ['esperança', 'inspiração', 'paz'] },
  { numero: 18, nome: 'A Lua', arcano: 'Maior', significadoUpright: 'Ilusão, medo, ansiedade, inconsciente', significadoReversed: 'Medo, confusão, esclarecimento', keywords: ['ilusão', 'intuição', 'inconsciente'] },
  { numero: 19, nome: 'O Sol', arcano: 'Maior', significadoUpright: 'Alegria, sucesso, celebração, vitalidade', significadoReversed: 'Excesso de confiança, otimismo exagerado', keywords: ['alegria', 'sucesso', 'vitalidade'] },
  { numero: 20, nome: 'O Julgamento', arcano: 'Maior', significadoUpright: 'Julgamento, redenção, prova, despertar', significadoReversed: 'Autocondenação, reflexão tardia, julgamentos errôneos', keywords: ['redenção', 'renascimento', 'julgamento'] },
  { numero: 21, nome: 'O Mundo', arcano: 'Maior', significadoUpright: 'Realização, completude, integração, viagens', significadoReversed: 'Falta de progresso, sentimento de incompletude', keywords: ['realização', 'completude', 'integração'] },
];
interface TarotCard {
  numero: number;
  nome: string;
  arcano: string;
  significadoUpright: string;
  significadoReversed: string;
  keywords: string[];
}
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const parseResult = TarotLibraryQuerySchema.safeParse({
      arcano: searchParams.get('arcano'),
      search: searchParams.get('search'),
      numero: searchParams.get('numero'),
      limit: searchParams.get('limit'),
    });
    if (!parseResult.success) {
      return NextResponse.json({
        error: 'Parâmetros inválidos',
        details: parseResult.error.flatten().fieldErrors,
      }, { status: 400 });
    }
    const { arcano, search, numero, limit } = parseResult.data;
    let cards = tarotCards;
    // Filter by arcano (Maior/Menor)
    if (arcano) {
      cards = cards.filter(card => card.arcano.toLowerCase() === arcano.toLowerCase());
    }
    // Filter by card number
    if (numero !== undefined) {
      cards = cards.filter(card => card.numero === numero);
    }
    // Search by name or keywords
    if (search) {
      const searchLower = search.toLowerCase();
      cards = cards.filter(card =>
        card.nome.toLowerCase().includes(searchLower) ||
        card.keywords.some(k => k.toLowerCase().includes(searchLower)) ||
        card.significadoUpright.toLowerCase().includes(searchLower)
      );
    }
    // Apply limit
    if (limit && limit < cards.length) {
      cards = cards.slice(0, limit);
    }
    // Transform cards to include full data
    const result = cards.map(card => ({
      numero: card.numero,
      nome: card.nome,
      arcano: card.arcano,
      significadoUpright: card.significadoUpright,
      significadoReversed: card.significadoReversed,
      keywords: card.keywords,
    }));
    return NextResponse.json({
      cards: result,
      meta: {
        total: result.length,
        arcano: arcano || 'all',
        search: search || null,
        filters: {
          arcano: arcano || null,
          search: search || null,
          numero: numero !== undefined ? numero : null,
        },
      },
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao processar tarot' }, { status: 500 });
  }
}