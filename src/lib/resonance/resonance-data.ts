// Stub for @/lib/resonance/resonance-data
// Module does not exist - stub implementation for test compatibility

export interface PadraoResonancia {
  id: string;
  nome: string;
  tipo: 'armonica' | 'planetaria' | 'numerica' | 'cabalistica';
  frequencias: number[];
  chakra: number[];
  sefirot: string[];
  nivel: number;
  elemento: string;
}

const sampleData: PadraoResonancia[] = [
  {
    id: 'res-1',
    nome: 'Harmonia Planetária',
    tipo: 'planetaria',
    frequencias: [396, 417, 528],
    chakra: [1, 3],
    sefirot: ['Kether', 'Chokhmah'],
    nivel: 1,
    elemento: 'Fogo',
  },
  {
    id: 'res-2',
    nome: 'Ressonância Numérica',
    tipo: 'numerica',
    frequencias: [432, 528],
    chakra: [4],
    sefirot: ['Tiferet'],
    nivel: 2,
    elemento: 'Ar',
  },
];

export function getData(): PadraoResonancia[] {
  return sampleData;
}

export function getPorTipo(tipo: string): PadraoResonancia[] {
  return sampleData.filter((r) => r.tipo === tipo);
}

export function getPorChakra(chakra: number): PadraoResonancia[] {
  return sampleData.filter((r) => r.chakra.includes(chakra));
}

export function getPorSefira(sefira: string): PadraoResonancia[] {
  return sampleData.filter((r) => r.sefirot.includes(sefira));
}

export function getPorNivel(nivel: number): PadraoResonancia[] {
  return sampleData.filter((r) => r.nivel === nivel);
}

export function getPorFrequencia(frequencia: number): PadraoResonancia[] {
  return sampleData.filter((r) => r.frequencias.includes(frequencia));
}

export function getResonanciaMaisAlta(): PadraoResonancia {
  return sampleData.reduce((prev, curr) => (curr.nivel > prev.nivel ? curr : prev));
}

export function getResonanciaMaisComplexa(): PadraoResonancia {
  return sampleData.reduce((prev, curr) =>
    (curr.frequencias.length > prev.frequencias.length ? curr : prev)
  );
}

export function getResonanciaPorElemento(elemento: string): PadraoResonancia[] {
  return sampleData.filter((r) => r.elemento === elemento);
}