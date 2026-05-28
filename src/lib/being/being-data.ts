// Being data
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface BeingEntity {
  id: string;
  name: string;
  description: string;
  nature?: string;
  attributes?: Record<string, any>;
}

export interface BeingData {
  entities: BeingEntity[];
}

const beingEntities: BeingEntity[] = [
  {
    id: 'existente',
    name: 'O Existente',
    description: 'A consciência fundamental que é, foi e será. A presença pura que existe por si mesma.',
    nature: 'Essência Primordial',
    attributes: {
      aspecto: 'Ser Absoluto',
      qualidade: 'Existência Pura',
    },
  },
  {
    id: 'essencia',
    name: 'Essência do Ser',
    description: 'A natureza íntima de tudo que é. O núcleo indestrutível da consciência.',
    nature: 'Essência Interior',
    attributes: {
      aspecto: 'Ser Essencial',
      qualidade: 'Pureza Original',
    },
  },
  {
    id: 'semente',
    name: 'Semente do Ser',
    description: 'O potencial latente que contém toda manifestação. A causa primeira de toda forma.',
    nature: 'Potencial Criativo',
    attributes: {
      aspecto: 'Ser Potencial',
      qualidade: 'Criatividade Pura',
    },
  },
  {
    id: 'luz',
    name: 'Luz do Ser',
    description: 'A claridade que emana da consciência desperta. A inteligência que ilumina a escuridão.',
    nature: 'Inteligência Espontânea',
    attributes: {
      aspecto: 'Ser Iluminado',
      qualidade: ' Clareza Suprema',
    },
  },
  {
    id: 'caminho',
    name: 'Caminho do Ser',
    description: 'A jornada da alma através das dimensões da existência. O processo de tornar-se.',
    nature: 'Processo Evolutivo',
    attributes: {
      aspecto: 'Ser em Transformação',
      qualidade: 'Crescimento Contínuo',
    },
  },
];

export function getData(): BeingData {
  return {
    entities: beingEntities,
  };
}
