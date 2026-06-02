export interface InsightData {
  titulo: string;
  descricao: string;
  acaoRecomendada: string;
  afirmacao: string;
  cores: string[];
  ervas: string[];
  ritus: string;
  sefirotAlinhado: string;
}

export interface InsightCacheEntry {
  data: InsightData;
  expiresAt: number;
  createdAt: number;
}
