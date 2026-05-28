export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image?: string;
  category?: string;
}

export function getProducts(): Product[] {
  return [
    {
      id: '1',
      name: 'Mapa Natal Premium',
      price: 97,
      description: 'Cálculo astrológico completo do seu mapa astral natal.',
    },
    {
      id: '2',
      name: 'Relatório de Trânsitos',
      price: 147,
      description: 'Análise detalhada dos trânsitos planetários atuais.',
    },
    {
      id: '3',
      name: 'Ciclos Planetários',
      price: 77,
      description: 'Estudo dos ciclos de Saturno e Júpiter.',
    },
  ];
}