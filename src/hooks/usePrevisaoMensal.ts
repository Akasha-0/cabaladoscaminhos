// fallow-ignore-file unused-file
'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LunarPhase {
  fase: 'nova' | 'crescente' | 'cheia' | 'minguante';
  data: string;
  energia: string;
  recomendacao: string;
}

export interface KeyDate {
  data: string;
  tipo: 'ritual' | 'astrologico' | 'sazonal' | 'espiritual';
  titulo: string;
  descricao: string;
  energia: string;
}

export interface MonthTheme {
  titulo: string;
  foco: string[];
  mensagens: string[];
}

export interface PrevisaoMensal {
  mes: number;
  ano: number;
  signosFavoraveis: string[];
  desafios: string[];
  oportunidades: string[];
}

export interface usePrevisaoMensalReturn {
  data: PrevisaoMensal | null;
  temas: MonthTheme | null;
  datasChave: KeyDate[];
  fasesLua: LunarPhase[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

function calcularFasesLua(ano: number, mes: number): LunarPhase[] {
  const fases: LunarPhase[] = [];
  const fasesOrdem: Array<{ fase: LunarPhase['fase']; energia: string; recomendacao: string }> = [
    { fase: 'nova', energia: ' introspecção, novos começos, intenções', recomendacao: 'Defina intenções para o mês. Pratique meditação e reflexão.' },
    { fase: 'crescente', energia: ' crescimento, ação,manifestação', recomendacao: 'Tome ações concretas em direção aos seus objetivos. Comece projetos.' },
    { fase: 'cheia', energia: ' iluminação, culminação, revelação', recomendacao: 'Celebre conquistas. Solte o que não serve mais. Ritual de gratidão.' },
    { fase: 'minguante', energia: ' release, perdão, purificação', recomendacao: 'Pratique o perdão. Desapegue de padrões antigos. Descanse mais.' },
  ];

  // Simplified lunar phase calculation (synodic month ~29.53 days)
  const synodicMonth = 29.53058867;
  const baseDate = new Date(2000, 0, 6, 18, 14); // Known new moon
  const startOfMonth = new Date(ano, mes - 1, 1);
  const daysFromBase = Math.floor((startOfMonth.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));

  let currentPhase = Math.floor(daysFromBase / synodicMonth) % 4;

  for (let day = 1; day <= 31; day++) {
    const date = new Date(ano, mes - 1, day);
    if (date.getMonth() !== mes - 1) break;

    const phaseIndex = Math.floor((daysFromBase + day) / synodicMonth) % 4;
    if (phaseIndex !== currentPhase) {
      currentPhase = phaseIndex;
      const phaseInfo = fasesOrdem[phaseIndex];
      fases.push({
        fase: phaseInfo.fase,
        data: date.toISOString().split('T')[0],
        energia: phaseInfo.energia,
        recomendacao: phaseInfo.recomendacao,
      });
    }
  }

  return fases;
}

function getMonthThemes(mes: number, ano: number): MonthTheme[] {
  const themes: Record<number, MonthTheme> = {
    1: {
      titulo: 'Renovação e Propósitos',
      foco: ['Novoscomeços', 'Limpeza energetic', 'Metas para o ano'],
      mensagens: ['O ano começa com energia de renovação.', 'Tiempo de plantar sementes para o futuro.'],
    },
    2: {
      titulo: 'Amor e Conexão',
      foco: ['Relacionamentos', 'Autoamor', 'Expressão emocional'],
      mensagens: ['Febrero invita a abrir el corazón.', 'Las connections son fundamentales.'],
    },
    3: {
      titulo: 'Novo Ciclo',
      foco: ['Ação e movimento', 'Comunicação', 'Iniciativas'],
      mensagens: ['Marzo trae energía de ação.', 'Es momento de dar visibilidad a tus ideias.'],
    },
    4: {
      titulo: 'Fundação e Abundância',
      foco: ['Estabilidade', 'Prosperidade', 'Trabalho duro'],
      mensagens: ['Abril foca em construir bases sólidas.', 'El trabajo dedicado trae recompensas.'],
    },
    5: {
      titulo: 'Transformação Interior',
      foco: ['Autoconhecimento', 'Libertação', 'Crescimento pessoal'],
      mensagens: ['Maio favorece a introspecção.', 'Tiempo de soltar old patrones.'],
    },
    6: {
      titulo: 'Luz e Clareza',
      foco: ['Expansão', 'Visão clara', 'Celebração'],
      mensagens: ['Junho trae luz y claridad.', 'Es momento de brillar con autenticidad.'],
    },
    7: {
      titulo: 'Introspecção Profunda',
      foco: ['Reflexão', 'Espiritualidade', 'Descanso'],
      mensagens: ['Julho invita a volver hacia adentro.', 'La quietud es fuente de sabiduría.'],
    },
    8: {
      titulo: 'Renovação e Força',
      foco: ['Coragem', 'Transformación', 'Determinação'],
      mensagens: ['Agosto fortalece tu determinación.', 'Es tiempo de enfrentar miedos.'],
    },
    9: {
      titulo: 'Retorno e Avaliação',
      foco: ['Reorganização', 'Planejamento', 'Preparación'],
      mensagens: ['Setembro marca un retorno reflexivo.', 'Preparate para cerrar el año con fuerza.'],
    },
    10: {
      titulo: 'Transmutação',
      foco: ['Purificação', 'Metamorfose', 'Alquimia interior'],
      mensagens: ['Outubro transforma lo que ya no sirve.', 'La magia está en la liberación.'],
    },
    11: {
      titulo: 'Gratidão e Agradecimento',
      foco: ['Agradecimento', 'Abundância', 'Conexão espiritual'],
      mensagens: ['Noviembre es mes de gratitud.', 'Agradece y recibirás más.'],
    },
    12: {
      titulo: 'Culminação e Solitude',
      foco: ['Reflexão anual', 'Solitude', 'Preparação para o novo ciclo'],
      mensagens: ['Diciembre cierra ciclos importantes.', 'Tiempo de introspection y paz.'],
    },
  };

  return themes[mes] ? [themes[mes]] : [themes[1]];
}

function getKeyDates(mes: number, ano: number): KeyDate[] {
  const dates: KeyDate[] = [];

  // Equinoxes and solstices (approximate)
  if (mes === 3) {
    dates.push({
      data: `${ano}-03-20`,
      tipo: 'sazonal',
      titulo: 'Equinócio de Outono',
      descricao: 'Momento de equilíbrio entre luz e escuridão.',
      energia: 'Equilíbrio e renovação de ciclos.',
    });
  }
  if (mes === 6) {
    dates.push({
      data: `${ano}-06-21`,
      tipo: 'sazonal',
      titulo: 'Solstício de Inverno',
      descricao: 'Noite mais longa do ano. Momento de introspecção.',
      energia: 'Interiorização e planejamento do novo ciclo.',
    });
  }
  if (mes === 9) {
    dates.push({
      data: `${ano}-09-22`,
      tipo: 'sazonal',
      titulo: 'Equinócio de Primavera',
      descricao: 'Equilíbrio e início de novos ciclos de crescimento.',
      energia: 'Renovação e对称.',
    });
  }
  if (mes === 12) {
    dates.push({
      data: `${ano}-12-21`,
      tipo: 'sazonal',
      titulo: 'Solstício de Verão',
      descricao: 'Dia mais longo. Máximo de energia solar.',
      energia: 'Celebração e plenitude.',
    });
  }

  return dates;
}

export function usePrevisaoMensal(): usePrevisaoMensalReturn {
  const [data, setData] = useState<PrevisaoMensal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

// fallow-ignore-next-line complexity
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const mes = now.getMonth() + 1;
      const ano = now.getFullYear();

      // Fetch from API
      const response = await fetch('/api/astrologia/previsao-mensal');
      if (!response.ok) {
        throw new Error('Erro ao carregar previsão mensal');
      }

      const resultado = await response.json();

      setData({
        mes: resultado.mes || mes,
        ano: resultado.ano || ano,
        signosFavoraveis: resultado.signosFavoraveis || [],
        desafios: resultado.desafios || [],
        oportunidades: resultado.oportunidades || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  return {
    data,
    temas: getMonthThemes(mes, ano)[0] || null,
    datasChave: getKeyDates(mes, ano),
    fasesLua: calcularFasesLua(ano, mes),
    loading,
    error,
    refetch: fetchData,
  };
}