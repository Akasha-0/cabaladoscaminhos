/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* prettier-ignore */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface DailyReading {
  id: string;
  data: string;
  tipo: 'tarot' | 'cabala' | 'numerologia' | 'orixa';
  carta?: {
    id: number;
    nome: string;
    arcano: 'major' | 'minor';
    significado: string;
    invertido: boolean;
  };
  mensagem: string;
  reflexao: string;
  oracao?: string;
  affirmation?: string;
}

interface CabalaDaily {
  sephirah: string;
  caminho: string;
  tema: string;
  licao: string;
}

interface NumerologiaDaily {
  numero: number;
  vibracao: string;
  desafio: string;
  oportunidade: string;
}

function getDayKey(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay).toString();
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getTarotCardOfDay(seed: number): any {
  const majorArcana = [
    { id: 0, nome: 'O Louco', significado: 'Novos começos, liberdade, espontaneidade' },
    { id: 1, nome: 'O Mago', significado: 'Manifestação, habilidade, poder' },
    { id: 2, nome: 'A Sacerdotisa', significado: 'Intuição, sabedoria interior, mistérios' },
    { id: 3, nome: 'A Imperatriz', significado: 'Abundância, fertilidade, criatividade' },
    { id: 4, nome: 'O Imperador', significado: 'Autoridade, estrutura, liderança' },
    { id: 5, nome: 'O Papa', significado: 'Orientação espiritual, tradição, bondade' },
    { id: 6, nome: 'Os Enamorados', significado: 'Amor, união, escolhas' },
    { id: 7, nome: 'O Carro', significado: 'Vitória, determinação, controle' },
    { id: 8, nome: 'A Força', significado: 'Coragem, perseverança, compaixão' },
    { id: 9, nome: 'O Eremita', significado: 'Introspecção, solidão, iluminação' },
    { id: 10, nome: 'A Roda da Fortuna', significado: 'Ciclos, destino, mudança' },
    { id: 11, nome: 'A Justiça', significado: 'Equilíbrio, verdade, lei' },
    { id: 12, nome: 'O Enforcado', significado: 'Sacrifício, nova perspectiva, sacrifício' },
    { id: 13, nome: 'A Morte', significado: 'Transformação, fim de ciclo, renovação' },
    { id: 14, nome: 'A Temperança', significado: 'Equilíbrio, paciência, harmonia' },
    { id: 15, nome: 'O Diabo', significado: 'Tentação, materialismo,解放' },
    { id: 16, nome: 'A Torre', significado: 'Destruição, revelação, despertar' },
    { id: 17, nome: 'A Estrela', significado: 'Esperança, fé, renovação' },
    { id: 18, nome: 'A Lua', significado: 'Ilusão, intuição, inconsciência' },
    { id: 19, nome: 'O Sol', significado: 'Alegria, sucesso, vitalidade' },
    { id: 20, nome: 'O Julgamento', significado: 'Renascimento, julgamento, redenção' },
    { id: 21, nome: 'O Mundo', significado: 'Completude, realização, integração' },
  ];

  const cardIndex = seed % majorArcana.length;
  const card = majorArcana[cardIndex];
  const invertido = (seed % 2) === 1;

  return {
    ...card,
    arcano: 'major' as const,
    invertido,
    significado: invertido ? `Invertido: ${card.significado}` : card.significado,
  };
}

function getCabalaSephirah(seed: number): CabalaDaily {
  const sephirot = [
    { sephirah: 'Keter', caminho: 'Coroa', tema: 'Propósito divino e vontade superior', licao: 'Reconhecer o plano maior além do ego' },
    { sephirah: 'Chokhmah', caminho: 'Sabedoria', tema: 'Visão intuitiva e novas ideias', licao: 'Abrir-se à inspiração sem julgamento' },
    { sephirah: 'Binah', caminho: 'Compreensão', tema: 'Análise e discernimento profundo', licao: 'Desenvolver paciência para compreender' },
    { sephirah: 'Chesed', caminho: 'Misericórdia', tema: 'Compaixão, generosidade e ordem', licao: 'Estender a mão sem esperar retorno' },
    { sephirah: 'Gevurah', caminho: 'Força', tema: 'Coragem, limitação e julgamento', licao: 'Saber quando limitar e quando avançar' },
    { sephirah: 'Tiferet', caminho: 'Beleza', tema: 'Harmonia, integração e equilíbrio', licao: 'Unir forças opostas em harmonia' },
    { sephirah: 'Netzach', caminho: 'Vitória', tema: 'Paixão, persistência e emoção', licao: 'Perseverar com coração ardente' },
    { sephirah: 'Hod', caminho: 'Glória', tema: 'Humildade, lógica e comunicação', licao: 'Expressar com clareza e humildade' },
    { sephirah: 'Yesod', caminho: 'Fundação', tema: 'Imaginação, conexão e purificação', licao: 'Purificar a intenção antes de agir' },
    { sephirah: 'Malkut', caminho: 'Reino', tema: 'Mundo físico, natureza e soberania', licao: 'Manifestar a luz nos detalhes diários' },
  ];

  const index = seed % sephirot.length;
  return sephirot[index];
}

function getNumerologiaDiária(seed: number): NumerologiaDaily {
  const numeros = [
    { numero: 1, vibracao: 'Iniciação e liderança', desafio: 'Evitar o egoísmo e a impaciência', oportunidade: 'Tirar ideias do papel com determinação' },
    { numero: 2, vibracao: 'Parceria e cooperação', desafio: 'Superar a indecisão e a baixa autoestima', oportunidade: 'Construir pontes e unir pessoas' },
    { numero: 3, vibracao: 'Expressão e criatividade', desafio: 'Combater a dispersão e a superficialidade', oportunidade: 'Comunicar ideias com alegria e arte' },
    { numero: 4, vibracao: 'Estabilidade e trabalho', desafio: 'Não se perder em detalhes ou rigidez', oportunidade: 'Construir bases sólidas e duradouras' },
    { numero: 5, vibracao: 'Liberdade e mudança', desafio: 'Evitar a inquietude e a irresponsabilidade', oportunidade: 'Adaptar-se com flexibilidade e expansão' },
    { numero: 6, vibracao: 'Responsabilidade e amor', desafio: 'Não se sacrificar em excesso', oportunidade: 'Criar laços de cuidado genuíno' },
    { numero: 7, vibracao: 'Reflexão e espiritualidade', desafio: 'Não se isolar ou cair no ceticismo', oportunidade: 'Buscar sabedoria interior com paz' },
    { numero: 8, vibracao: 'Poder e abundância', desafio: 'Evitar o materialismo e o controle', oportunidade: 'Manifestar prosperidade com ética' },
    { numero: 9, vibracao: 'Completude e compaixão', desafio: 'Libertar-se do apego ao passado', oportunidade: 'Servir com coração universal' },
    { numero: 11, vibracao: 'Iluminação e intuição', desafio: 'Equilibrar idealismo com praticidade', oportunidade: 'Inspirar outros com clareza visionária' },
    { numero: 22, vibracao: 'Maestria e construção', desafio: 'Integrar visão grandiosa com ação', oportunidade: 'Transformar o mundo com propósito concreto' },
  ];

  const index = seed % numeros.length;
  return numeros[index];
}

function generateReflexao(tipo: string, seed: number): string {
  const reflexoes: Record<string, string[]> = {
    tarot: [
      'O universo conspira a seu favor quando você confia no fluxo natural das coisas.',
      'Cada carta é um espelho da sua alma - olhe dentro de você para encontrar as respostas.',
      'A jornada é tão importante quanto o destino. Abrace cada passo com gratidão.',
      'Suas forças interiores são mais poderosas do que você imagina.',
      'Permita-se ser guiado pela sabedoria antiga que habita em você.',
    ],
    cabala: [
      'A árvore da vida conecta todas as partes do seu ser em harmonia.',
      'Cada Sephirah é um aspecto de você esperando para ser integrado.',
      'Desça as escadas para ascender mais alto.',
      'O vazio é o espaço onde novas possibilidades nascem.',
      'Você é parte de um plano divino maior do que pode compreender.',
    ],
    numerologia: [
      'Seus números não determinam seu destino - eles iluminam seu caminho.',
      'Cada dígito carrega sabedoria para guiá-lo nesta jornada.',
      'A vibração correta está alinhando você com seu propósito.',
      'Você carrega dentro de si a energia de todos os números que já existiram.',
      'Seu número de hoje é uma mensagem do universo para você.',
    ],
    orixa: [
      'Os orixás são forças da natureza que habitam em você e ao seu redor.',
      'A ancestralidade chama você para honoring suas raízes.',
      'Cada elemento da natureza é um mestre esperando para ensinar.',
      'O sagrado habita no cotidiano quando você abre seu coração.',
      'A tradição oral guarda segredos que a mente não pode alcançar.',
    ],
  };

  const tipoReflexoes = reflexoes[tipo] || reflexoes.tarot;
  return tipoReflexoes[seed % tipoReflexoes.length];
}

function generateOração(tipo: string): string | undefined {
  const oracoes: Record<string, string> = {
    cabala: 'Kadosh, kadosh, kadosh Adonai Tsevaot - Santo, santo, santo é o Senhor dos Exércitos.',
    orixa: 'Ori oba ki o gbe o - Que a cabeça que me foi dada seja protected e iluminada.',
  };

  return oracoes[tipo];
}

export async function GET(request: NextRequest) {
  try {
    const hoje = new Date();
    const dayKey = getDayKey(hoje);
    const seed = hashString(dayKey);

    const tipos: Array<'tarot' | 'cabala' | 'numerologia' | 'orixa'> = ['tarot', 'cabala', 'numerologia', 'orixa'];
    const tipoIndex = seed % tipos.length;
    const tipo = tipos[tipoIndex];

    const leitura: DailyReading = {
      id: `daily_${dayKey}_${tipo}`,
      data: hoje.toISOString().split('T')[0],
      tipo,
      mensagem: '',
      reflexao: generateReflexao(tipo, seed),
    };

    switch (tipo) {
      case 'tarot': {
        const carta = getTarotCardOfDay(seed);
        leitura.carta = carta;
        leitura.mensagem = `A carta do dia é ${carta.nome}${carta.invertido ? ' (invertida)' : ''}. ${carta.significado}.`;
        break;
      }
      case 'cabala': {
        const sephirah = getCabalaSephirah(seed);
        leitura.mensagem = `Hoje você está conectado ao ${sephirah.sephirah} (${sephirah.caminho}). Tema: ${sephirah.tema}. Lição: ${sephirah.licao}.`;
        leitura.oracao = generateOração('cabala');
        break;
      }
      case 'numerologia': {
        const num = getNumerologiaDiária(seed);
        leitura.mensagem = `A vibração do dia é o número ${num.numero}. ${num.vibracao}. Desafio: ${num.desafio}. Oportunidade: ${num.oportunidade}.`;
        break;
      }
      case 'orixa': {
        const orixas = ['Oxum', 'Ogum', 'Iemanjá', 'Xangô', 'Oxalá', 'Iansã', 'Omulu', 'Nanã'];
        const orixaIndex = seed % orixas.length;
        const orixa = orixas[orixaIndex];
        leitura.mensagem = `${orixa} guia seus passos hoje. Permita que a energia deste orixá ilumine seu caminho com proteção e sabedoria.`;
        leitura.oracao = generateOração('orixa');
        break;
      }
    }

    return NextResponse.json({
      success: true,
      reading: leitura,
      meta: {
        tipo,
        data: leitura.data,
        gerado_em: new Date().toISOString(),
      },
    });
  } catch (_error) {
    console.error('Erro ao gerar leitura diária:', _error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar leitura diária' },
      { status: 500 }
    );
  }
}