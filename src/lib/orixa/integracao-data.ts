export interface IntegracaoData {
  provider: string;
  endpoint: string;
  active: boolean;
  methods: string[];
  retryAttempts: number;
  timeout: number;
}

export function getData(): IntegracaoData[] {
  return [
    {
      provider: "astrologia",
      endpoint: "/api/v1/astrologia",
      active: true,
      methods: ["GET", "POST"],
      retryAttempts: 3,
      timeout: 5000,
    },
    {
      provider: "numerologia",
      endpoint: "/api/v1/numerologia",
      active: true,
      methods: ["GET", "POST"],
      retryAttempts: 3,
      timeout: 5000,
    },
    {
      provider: "pagamento",
      endpoint: "/api/v1/pagamento",
      active: true,
      methods: ["POST"],
      retryAttempts: 5,
      timeout: 10000,
    },
    {
      provider: "assinatura",
      endpoint: "/api/v1/assinatura",
      active: true,
      methods: ["GET", "POST", "DELETE"],
      retryAttempts: 3,
      timeout: 5000,
    },
    {
      provider: "profacia",
      endpoint: "/api/v1/profacia",
      active: true,
      methods: ["GET"],
      retryAttempts: 2,
      timeout: 8000,
    },
  ];
}
