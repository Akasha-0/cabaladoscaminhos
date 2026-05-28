// Osha data
export function getData() {
  return {
    name: 'Osha',
    description: 'Caminho da Verdade e Justiça',
    values: [
      { id: 'verdade', label: 'Verdade', weight: 9 },
      { id: 'justica', label: 'Justiça', weight: 8 },
      { id: 'integridade', label: 'Integridade', weight: 7 },
      { id: 'coragem', label: 'Coragem', weight: 6 },
    ],
    colors: ['#FFFFFF', '#87CEEB', '#F0E68C', '#DDA0DD'],
    symbols: ['⚖', '☀', '✧', '◇'],
  };
}