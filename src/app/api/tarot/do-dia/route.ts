import { NextRequest, NextResponse } from 'next/server';

// Tarot cards data - major arcana with upright/reversed meanings
const tarotCards = [
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

interface TarotCardResult {
  numero: number;
  nome: string;
  arcano: string;
  significado: string;
  isReversed: boolean;
  keywords: string[];
}

// Deterministic selection based on date
function getDailyCard(): TarotCardResult {
  const now = new Date();
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const cardIndex = seed % tarotCards.length;
  const reversed = (seed * 7) % 2 === 1;

  const card = tarotCards[cardIndex];

  return {
    numero: card.numero,
    nome: card.nome,
    arcano: card.arcano,
    significado: reversed ? card.significadoReversed : card.significadoUpright,
    isReversed: reversed,
    keywords: card.keywords,
  };
}

export async function GET(request: NextRequest) {
  const dailyCard = getDailyCard();
  const now = new Date();
  const dataISO = now.toISOString().split('T')[0];

  return NextResponse.json({
    card: dailyCard,
    meta: {
      data: dataISO,
      arcano: dailyCard.arcano,
    },
  });
}