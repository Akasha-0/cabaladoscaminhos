// fallow-ignore-file unused-file
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

// fallow-ignore-next-line unused-type
export interface InsightCacheEntry {
  data: InsightData;
  expiresAt: number;
  createdAt: number;
}
