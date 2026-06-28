// w27/daily-reflection.ts — daily reflection prompt feature stub
// Feature: prompt diário personalizado (numerologia + oráculo + journaling)
// Status: STUB — geração de prompt pendente, integração com cron de notificações pendente

export interface DailyReflectionPrompt {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  text: string;
  trilha: 'numerologia' | 'astrologia' | 'cigano' | 'tarot' | 'geral';
  source: 'algoritmo' | 'curadoria' | 'hibrido';
  metadata: {
    numeroDoDia?: number;
    signo?: string;
    cartaCigana?: number;
    odu?: string;
  };
  createdAt: string;
}

export interface ReflectionEntry {
  id: string;
  promptId: string;
  userId: string;
  text: string;
  mood: number; // 1-5
  shared: boolean;
  createdAt: string;
}

export function pickPromptForUser(
  user: { id: string; birthDate: string },
  today: Date = new Date()
): Omit<DailyReflectionPrompt, 'id' | 'createdAt'> {
  // Stub: usar número do dia como base
  const numeroDoDia = today.getDate();
  return {
    userId: user.id,
    date: today.toISOString().slice(0, 10),
    text: ,
    trilha: 'numerologia',
    source: 'algoritmo',
    metadata: { numeroDoDia },
  };
}

