import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  // Monthly astrological patterns based on solar transits
  const monthlyPatterns: Record<number, {
    signosFavoraveis: string[];
    desafios: string[];
    oportunidades: string[];
  }> = {
    1: {
      signosFavoraveis: ['Capricórnio', 'Touro', 'Virgem'],
      desafios: ['Tensão entre inovação e tradição', 'Impaciência com processos lentos'],
      oportunidades: ['Novos projetos com fundamento sólido', 'Conexões profissionais duradouras'],
    },
    2: {
      signosFavoraveis: ['Aquário', 'Gêmeos', 'Libra'],
      desafios: ['Desordem emocional', 'Comunicação mal interpretada'],
      oportunidades: ['Colaborações criativas', 'Amizades que transformam perspectivas'],
    },
    3: {
      signosFavoraveis: ['Peixes', 'Áries', 'Escorpião'],
      desafios: ['Procrastinação', 'Sensibilidade excessiva'],
      oportunidades: ['Iniciações espirituais', 'Coragem para mudanças necessárias'],
    },
    4: {
      signosFavoraveis: ['Áries', 'Leão', 'Sagitário'],
      desafios: ['Impulsividade', 'Conflitos de ego'],
      oportunidades: ['Liderança emergente', 'Projetos ambiciosos ganham impulso'],
    },
    5: {
      signosFavoraveis: ['Touro', 'Virgem', 'Capricórnio'],
      desafios: ['Rigidez emocional', 'Medo de mudanças'],
      oportunidades: ['Estabilidade financeira', 'Relacionamentos amadurecem'],
    },
    6: {
      signosFavoraveis: ['Gêmeos', 'Libra', 'Aquário'],
      desafios: ['Indecisão', 'Dispersão de energia'],
      oportunidades: ['Comunicação clara', 'Parcerias equilibradas'],
    },
    7: {
      signosFavoraveis: ['Câncer', 'Escorpião', 'Peixes'],
      desafios: ['Vulnerabilidade emocional', 'Memórias que limitam'],
      oportunidades: ['Transformação interior', 'Conexões profundas e autênticas'],
    },
    8: {
      signosFavoraveis: ['Leão', 'Áries', 'Sagitário'],
      desafios: ['Arrogância', 'Excesso de confiança'],
      oportunidades: ['Reconhecimento merecido', 'Criatividade em destaque'],
    },
    9: {
      signosFavoraveis: ['Virgem', 'Touro', 'Capricórnio'],
      desafios: ['Perfeccionismo paralisante', 'Críticas destrutivas'],
      oportunidades: ['Planejamento preciso', 'Resultados tangíveis'],
    },
    10: {
      signosFavoraveis: ['Libra', 'Gêmeos', 'Aquário'],
      desafios: ['Conflitos de valores', 'Superficialidade em relações'],
      oportunidades: ['Harmonia conquistada', 'Decisões importantíssimas'],
    },
    11: {
      signosFavoraveis: ['Escorpião', 'Câncer', 'Peixes'],
      desafios: ['Obsessões', 'Segredos que emergem'],
      oportunidades: ['Revolução interior', 'Profundidade emocional transformadora'],
    },
    12: {
      signosFavoraveis: ['Sagitário', 'Leão', 'Áries'],
      desafios: ['Excesso de expansão', 'Fuga de responsabilidades'],
      oportunidades: ['Visão de longo prazo', 'Sabedoria acumulada'],
    },
  };

  const currentMonthData = monthlyPatterns[mes] || monthlyPatterns[1];

  return NextResponse.json({
    mes,
    ano,
    signosFavoraveis: currentMonthData.signosFavoraveis,
    desafios: currentMonthData.desafios,
    oportunidades: currentMonthData.oportunidades,
  });
}