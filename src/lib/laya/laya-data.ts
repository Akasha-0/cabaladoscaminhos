// Laya data

export interface LayaData extends Record<string, unknown> {
  [key: string]: unknown;
}

export function getData(): LayaData {
  return {};
}