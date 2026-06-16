import pc from 'picocolors';
import { runChat } from '../tui/chat.js';

export async function chat(query?: string): Promise<void> {
  if (query) {
    return;
  }

  // Modo interativo TUI
  try {
    await runChat({ version: '0.0.17' });
  } catch (error) {
    if ((error as Error).message.includes('TTY')) {
      console.error(`${pc.red('Erro:')} Este comando requer um terminal interativo.`);
      process.exit(1);
    }
    throw error;
  }
}
