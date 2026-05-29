// ============================================================
// BIORRITMO DATA API - Cabala Dos Caminhos
// ============================================================
// GET endpoints for biorhythm data access
// - Retrieve user biorhythm cycles
// - Get biorhythm calculations
// - Get biorhythm insights and recommendations
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface BiorhythmCycle {
  name: string;
  value: number;
  phase: 'high' | 'low' | 'critical';
  description: string;
}

interface BiorhythmData {
  date: string;
  cycles: BiorhythmCycle[];
  overallStatus: string;
  recommendations: string[];
}

// Biorhythm calculation constants
// 28-day cycles for emotional and intuitive
// 33-day cycles for intellectual and mental
// 23-day cycles for physical and stamina
const EMOTIONAL_CYCLE = 28;
const INTELLECTUAL_CYCLE = 33;
const PHYSICAL_CYCLE = 23;

function calculateBiorhythm(birthDate: Date, targetDate: Date, cycleLength: number): number {
  const diffTime = Math.abs(targetDate.getTime() - birthDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const position = diffDays % cycleLength;
  const radians = (2 * Math.PI * position) / cycleLength;
  return Math.round(Math.sin(radians) * 100);
}

function getPhase(value: number): 'high' | 'low' | 'critical' {
  if (Math.abs(value) >= 90) return 'high';
  if (Math.abs(value) <= 10) return 'critical';
  return 'low';
}

function getPhysicalDescription(value: number, phase: string): string {
  if (phase === 'high') return 'Alta energia física e resistência. Ideal para atividades esportivas e esforço físico intenso.';
  if (phase === 'critical') return 'Dia crítico para o corpo. Evite atividades de alto impacto e cuide da saúde.';
  return 'Energia física moderada. Bom para atividades leves e manutenção da saúde.';
}

function getEmotionalDescription(value: number, phase: string): string {
  if (phase === 'high') return 'Pico emocional com excelente intuição e sensibilidade. Momento propício para conexões e expressões criativas.';
  if (phase === 'critical') return 'Instabilidade emocional significativa. Pratique autoconhecimento e evite decisões importantes.';
  return 'Equilíbrio emocional. Bom momento para reflexão e planejamento.';
}

function getIntellectualDescription(value: number, phase: string): string {
  if (phase === 'high') return 'Capacidade mental em alta. Ideal para estudos complexos, resolução de problemas e tarefas criativas.';
  if (phase === 'critical') return 'Confusão mental e dificuldade de concentração. Evite tomar decisões complexas.';
  return 'Clareza mental moderada. Bom para tarefas rotineiras e planejamento.';
}

function getOverallStatus(cycles: BiorhythmCycle[]): string {
  const avgValue = cycles.reduce((sum, c) => sum + Math.abs(c.value), 0) / cycles.length;
  
  if (avgValue >= 70) return 'Excelente';
  if (avgValue >= 40) return 'Bom';
  if (avgValue >= 20) return 'Moderado';
  return 'Desafiante';
}

function getRecommendations(cycles: BiorhythmCycle[]): string[] {
  const recommendations: string[] = [];
  
  const physicalCycle = cycles.find(c => c.name === 'Físico');
  const emotionalCycle = cycles.find(c => c.name === 'Emocional');
  const intellectualCycle = cycles.find(c => c.name === 'Intelectual');
  
  if (physicalCycle?.phase === 'high') {
    recommendations.push('Excelente dia para atividades físicas e esportivas.');
  }
  if (physicalCycle?.phase === 'critical') {
    recommendations.push('Descanse mais e evite esforço físico excessivo.');
  }
  
  if (emotionalCycle?.phase === 'high') {
    recommendations.push('Momento propício para meditação, práticas espirituais e conexões profundas.');
  }
  if (emotionalCycle?.phase === 'critical') {
    recommendations.push('Pratique autocuidado e evite conflitos emocionais.');
  }
  
  if (intellectualCycle?.phase === 'high') {
    recommendations.push('Dia ideal para estudos, planejamento estratégico e tarefas complexas.');
  }
  if (intellectualCycle?.phase === 'critical') {
    recommendations.push('Evite decisões importantes e concentre-se em tarefas simples.');
  }
  
  // General recommendations based on overall balance
  const allHigh = cycles.every(c => c.phase === 'high');
  const allCritical = cycles.every(c => c.phase === 'critical');
  
  if (allHigh) {
    recommendations.push('Dia excepcional! Aproveite para atividades importantes e novos projetos.');
  }
  if (allCritical) {
    recommendations.push('Dia de baixa energia total. Priorize descanso e atividades simples.');
  }
  
  return recommendations;
}

// GET /api/biorritmo/data - Get biorhythm data
export async function GET(request: NextRequest) {
  try {
    // Optional user ID for personalized data
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const dateParam = searchParams.get('date');
    
    let birthDate: Date;
    const targetDate = dateParam ? new Date(dateParam) : new Date();
    
    if (userId) {
      // Get user's birth date from database
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { dataNascimento: true }
      });
      
      if (!user) {
        return NextResponse.json(
          { error: 'Usuário não encontrado.' },
          { status: 404 }
        );
      }
      
      birthDate = user.dataNascimento;
    } else if (dateParam) {
      // Use provided date as target, calculate biorhythm from there
      // For demo purposes, use a default date
      birthDate = new Date('1990-01-01');
    } else {
      // Default birth date for demo
      birthDate = new Date('1990-01-01');
    }
    
    // Calculate all three biorhythm cycles
    const physicalValue = calculateBiorhythm(birthDate, targetDate, PHYSICAL_CYCLE);
    const emotionalValue = calculateBiorhythm(birthDate, targetDate, EMOTIONAL_CYCLE);
    const intellectualValue = calculateBiorhythm(birthDate, targetDate, INTELLECTUAL_CYCLE);
    
    const physicalPhase = getPhase(physicalValue);
    const emotionalPhase = getPhase(emotionalValue);
    const intellectualPhase = getPhase(intellectualValue);
    
    const cycles: BiorhythmCycle[] = [
      {
        name: 'Físico',
        value: physicalValue,
        phase: physicalPhase,
        description: getPhysicalDescription(physicalValue, physicalPhase)
      },
      {
        name: 'Emocional',
        value: emotionalValue,
        phase: emotionalPhase,
        description: getEmotionalDescription(emotionalValue, emotionalPhase)
      },
      {
        name: 'Intelectual',
        value: intellectualValue,
        phase: intellectualPhase,
        description: getIntellectualDescription(intellectualValue, intellectualPhase)
      }
    ];
    
    const biorhythmData: BiorhythmData = {
      date: targetDate.toISOString().split('T')[0],
      cycles,
      overallStatus: getOverallStatus(cycles),
      recommendations: getRecommendations(cycles)
    };
    
    return NextResponse.json(biorhythmData, { status: 200 });
    
  } catch (error) {
    console.error('Biorhythm data error:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular biorritmo.' },
      { status: 500 }
    );
  }
}