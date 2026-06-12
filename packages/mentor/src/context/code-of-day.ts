import { calculateCodeOfDay } from '@akasha/core';

export interface CodeOfDayInfo {
  hexagram: number;
  name: string;
  date: Date;
  formatted: string;
}

/**
 * Get the I Ching hexagram code for today
 */
export function getCodeOfDay(): CodeOfDayInfo {
  const today = new Date();
  return calculateHexagramForDate(today);
}

/**
 * Get a formatted context string for the mentor prompt
 */
export function getCodeOfDayContext(): string {
  const info = getCodeOfDay();
  return info.formatted;
}

/**
 * Calculate hexagram for a specific date
 */
export function calculateHexagramForDate(date: Date): CodeOfDayInfo {
  const { code } = calculateCodeOfDay(date);
  
  const formattedDate = date.toLocaleDateString('pt-BR');
  
  const name = `Hexagrama ${code.hexagram}`;
  
  const formatted = `[Data: ${formattedDate}]\n[Código do Dia: ${name} - Nível ${code.level}]`;
  
  return {
    hexagram: code.hexagram,
    name,
    date,
    formatted,
  };
}
