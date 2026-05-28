export type DivinationMethod = {
  id: string;
  name: string;
  description: string;
};

const methods: DivinationMethod[] = [
  { id: 'tarot', name: 'Tarô', description: 'Cartas para insight espiritual' },
  { id: 'i-ching', name: 'I Ching', description: 'Hexagramas do Livro das Mutações' },
  { id: 'astrologia', name: 'Astrologia', description: 'Análise dos corpos celestes' },
  { id: 'numerologia', name: 'Numerologia', description: 'Poder dos números' },
  { id: 'oraculo', name: 'Oráculo', description: 'Respostas divinas' },
];

export function getMethods(): DivinationMethod[] {
  return methods;
}