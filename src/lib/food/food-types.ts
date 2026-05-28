export interface Food {
  id: string;
  name: string;
  description?: string;
  energy?: 'yang' | 'yin' | 'neutral';
  element?: string;
  category: string;
  [key: string]: unknown;
}
