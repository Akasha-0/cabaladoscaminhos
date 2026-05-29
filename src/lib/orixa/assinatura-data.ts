// Assinatura data

export interface Assinatura {
  id: string;
  tipo: string;
  status: string;
  dataInicio: string;
  dataExpiracao?: string;
}

export interface AssinaturaData {
  assinaturas: Assinatura[];
}

export function getData(): AssinaturaData {
  return {
    assinaturas: [],
  };
}
