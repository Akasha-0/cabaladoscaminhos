export interface OnenessData {
  name: string;
  description: string;
  aspects: string[];
}

export function getData(): OnenessData {
  return {
    name: 'Unidade',
    description: 'A experiência de unidade com o divino, onde o véu entre o eu e o todo se dissolve.',
    aspects: [
      'Conexão universal',
      'Dissolução do ego',
      'Consciência una',
      'Amor incondicional',
      'Presença plena',
    ],
  };
}
