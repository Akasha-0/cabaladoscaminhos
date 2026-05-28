export interface TransformationState {
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

export interface Reflection {
  id: string;
  timestamp: string;
  content: string;
  tags?: string[];
}

export interface Transformation {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  states: TransformationState;
  reflections: Reflection[];
  completed: boolean;
  metadata?: Record<string, unknown>;
}

const transformations: Map<string, Transformation> = new Map();

export function trackTransformation(
  name: string,
  category: string,
  beforeState: Record<string, unknown>,
  afterState: Record<string, unknown>,
  initialReflection?: string,
  metadata?: Record<string, unknown>
): Transformation {
  const id = `transformation-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const transformation: Transformation = {
    id,
    name,
    category,
    createdAt: new Date().toISOString(),
    states: { before: beforeState, after: afterState },
    reflections: initialReflection
      ? [{ id: `refl-${Date.now()}`, timestamp: new Date().toISOString(), content: initialReflection }]
      : [],
    completed: false,
    metadata,
  };
  transformations.set(id, transformation);
  return transformation;
}

export function getTransformations(
  category?: string,
  includeCompleted = true
): Transformation[] {
  const all = Array.from(transformations.values());
  return all.filter((t) => {
    const matchCategory = category ? t.category === category : true;
    const matchCompleted = includeCompleted ? true : !t.completed;
    return matchCategory && matchCompleted;
  });
}

export function addReflection(
  transformationId: string,
  content: string,
  tags?: string[]
): Reflection | null {
  const transformation = transformations.get(transformationId);
  if (!transformation) return null;
  const reflection: Reflection = {
    id: `refl-${Date.now()}`,
    timestamp: new Date().toISOString(),
    content,
    tags,
  };
  transformation.reflections.push(reflection);
  return reflection;
}

export function updateTransformationState(
  transformationId: string,
  newAfterState: Record<string, unknown>
): Transformation | null {
  const transformation = transformations.get(transformationId);
  if (!transformation) return null;
  transformation.states.after = newAfterState;
  return transformation;
}

export function completeTransformation(transformationId: string): Transformation | null {
  const transformation = transformations.get(transformationId);
  if (!transformation) return null;
  transformation.completed = true;
  return transformation;
}

export function getTransformation(transformationId: string): Transformation | undefined {
  return transformations.get(transformationId);
}

export function deleteTransformation(transformationId: string): boolean {
  return transformations.delete(transformationId);
}