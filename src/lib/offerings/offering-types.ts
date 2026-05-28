export type OfferingType = {
  id: string;
  name: string;
  description: string;
};

export function getTypes(): OfferingType[] {
  return [
    {
      id: "vela",
      name: "Velas",
      description: "Oferendas de luz e devoção",
    },
    {
      id: "incenso",
      name: "Incenso",
      description: "Purificação e elevação espiritual",
    },
    {
      id: "flor",
      name: "Flores",
      description: "Oferendas naturais e gratidão",
    },
    {
      id: "comida",
      name: "Comidas",
      description: "Alimentos dedicados às entidades",
    },
    {
      id: "agua",
      name: "Água",
      description: "Purificação e fluidez espiritual",
    },
    {
      id: "moedas",
      name: "Moedas e Dendê",
      description: "Oferendas de prosperidade",
    },
  ];
}
