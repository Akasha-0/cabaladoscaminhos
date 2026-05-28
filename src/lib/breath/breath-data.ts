// Breath data
export interface BreathExercise {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  cycles: number;
}

export const breathData: BreathExercise[] = [
  {
    id: "relaxing",
    name: "Relaxing Breath",
    description: "Calming 4-7-8 technique for relaxation",
    inhale: 4,
    hold1: 7,
    exhale: 8,
    hold2: 0,
    cycles: 4,
  },
  {
    id: "energizing",
    name: "Energizing Breath",
    description: "Quick rhythmic breathing for energy",
    inhale: 2,
    hold1: 0,
    exhale: 2,
    hold2: 0,
    cycles: 10,
  },
  {
    id: "balancing",
    name: "Balancing Breath",
    description: "Equal timing for centered calm",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 6,
  },
  {
    id: "deep-calm",
    name: "Deep Calm",
    description: "Extended exhale for deep relaxation",
    inhale: 4,
    hold1: 2,
    exhale: 8,
    hold2: 2,
    cycles: 5,
  },
  {
    id: "clarity",
    name: "Clarity Breath",
    description: "Box breathing for focus and clarity",
    inhale: 4,
    hold1: 4,
    exhale: 4,
    hold2: 4,
    cycles: 8,
  },
];

export function getData(): BreathExercise[] {
  return breathData;
}