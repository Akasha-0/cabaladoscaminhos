/**
 * Prayer Timing
 * Optimal timing calculations for prayer practice
 */

/**
 * Get optimal time for prayer based on time of day and spiritual context
 */
// fallow-ignore-next-line complexity
export function getBestTiming(hour?: number, dayOfWeek?: number): {
  time: string;
  period: string;
  quality: 'otimo' | 'bom' | 'neutro';
  description: string;
} {
  const now = hour ?? new Date().getHours();
  const day = dayOfWeek ?? new Date().getDay();

  // Dawn prayers (before sunrise energy)
  if (now >= 4 && now < 7) {
    return {
      time: 'Alvorada',
      period: 'antes do amanhecer',
      quality: 'otimo',
      description: 'Saudação da luz nascente. Momento de pureza e conexão interior.',
    };
  }

  // Morning prayers
  if (now >= 7 && now < 10) {
    return {
      time: 'Manhã',
      period: 'manhã',
      quality: 'bom',
      description: 'Energia ascendente. Ideal para gratidão e pedidos matinais.',
    };
  }

  // Midday prayers (peak solar energy)
  if (now >= 10 && now < 14) {
    return {
      time: 'Meio-dia',
      period: 'meio-dia',
      quality: day === 0 || day === 6 ? 'otimo' : 'neutro',
      description: 'Pico de luz solar. Momento de máxima claridade espiritual.',
    };
  }

  // Afternoon prayers
  if (now >= 14 && now < 18) {
    return {
      time: 'Tarde',
      period: 'tarde',
      quality: 'bom',
      description: 'Momento de reflexão interior. Transição para o período noturno.',
    };
  }

  // Evening prayers (transition energy)
  if (now >= 18 && now < 21) {
    return {
      time: 'Entardecer',
      period: 'entardecer',
      quality: 'bom',
      description: 'Porta entre dia e noite. Ideal para agradecimento e paz.',
    };
  }

  // Night prayers
  return {
    time: 'Noite',
    period: 'noite',
    quality: 'neutro',
    description: 'Momento de introspecção e silêncio interior.',
  };
}
