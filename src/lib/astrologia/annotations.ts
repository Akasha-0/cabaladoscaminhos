// fallow-ignore-file unused-file
export type AnnotationType =
  | 'highlight'
  | 'note'
  | 'aspectLine'
  | 'freeForm';

export interface Annotation {
  id: string;
  type: AnnotationType;
  target?: {
    planet?: string;
    sign?: string;
    house?: number;
    degree?: number;
  };
  content: string;
  color?: string;
  createdAt?: Date;
}