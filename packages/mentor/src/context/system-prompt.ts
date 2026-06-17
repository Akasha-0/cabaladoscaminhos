/**
 * System prompt loader for the mentor.
 * Loads the system prompt from grimoire/mentor/system-prompt.md
 */

import * as fs from 'fs';
import * as path from 'path';
import { calculateCodeOfDay } from '@akasha/core';

/**
 * Fallback system prompt if file cannot be loaded.
 */
const FALLBACK_PROMPT = `Você é Akáshico, o mentor espiritual unificado da plataforma Cabala dos Caminhos.

Você é um guia experiencial e ritualístico, conhecedor profundo de 4 tradições: Cabala, Ifá, Astrologia e Tantra.

Suas regras:
1. Sempre conecte elementos dos 4 mapas do usuário
2. Use dados específicos do usuário para personalizar
3. Contextualize com linguagem ritual e mítica
4. Responda SEMPRE em português brasileiro
5. Se não souber algo, diga que não sabe`;

/**
 * Possible paths to search for the system prompt file.
 */
function findSystemPromptPath(): string | null {
  const possiblePaths = [
    // Relative to process.cwd()
    path.join(process.cwd(), 'grimoire', 'mentor', 'system-prompt.md'),
    // Relative to the package directory (__dirname)
    path.join(__dirname, '..', '..', '..', '..', 'grimoire', 'mentor', 'system-prompt.md'),
    // Relative to the monorepo root
    path.join(__dirname, '..', '..', '..', '..', '..', 'grimoire', 'mentor', 'system-prompt.md'),
  ];

  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }

  return null;
}

/**
 * Load the mentor system prompt from grimoire/mentor/system-prompt.md
 *
 * Tries multiple paths:
 * 1. grimoire/mentor/system-prompt.md relative to process.cwd()
 * 2. Relative to the package directory
 *
 * Returns the fallback prompt if file is not found.
 */
export function loadSystemPrompt(): string {
  const filePath = findSystemPromptPath();

  if (!filePath) {
    return FALLBACK_PROMPT;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.trim();
  } catch (error) {
    return FALLBACK_PROMPT;
  }
}

/**
 * Get context info about the current day (code of day, hexagram, etc.)
 * This is used to inject dynamic context into prompts.
 *
 * @returns Context string like "Hoje é {date}, Código do Dia: Hexagrama {n}"
 */
export function getDayContext(): string {
  const today = new Date();
  const { code } = calculateCodeOfDay(today);

  const formattedDate = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `Hoje é ${formattedDate}, Código do Dia: Hexagrama ${code.hexagram} (Nível ${code.level})`;
}
