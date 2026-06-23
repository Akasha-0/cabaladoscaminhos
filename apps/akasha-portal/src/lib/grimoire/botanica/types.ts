/**
 * Tipos para Botanica — Ewé e Ayahuasca
 *
 * Pilar 6: Raiz & Esquerda · Forest Alchemy
 */

export interface EweLeaf {
  id: string;
  name: string;
  scientificName: string;
  /** Orixá vibration frequency */
  orixa: string;
  element: 'Agua' | 'Fogo' | 'Terra' | 'Ar' | 'Vegetacao' | 'Ferro' | 'TerraAgua' | 'FogoAgua';
  /** Hot (descarrregar) or cold (harmonizar) */
  thermalNature: 'quente' | 'frio' | 'neutro';
  uses: string[];
  /** Traditional preparation */
  preparation: string;
  contraindication?: string;
  fuente: string;
}

export interface AyahuascaProtocol {
  stage: 'PreAnamnesis' | 'PostCeremony' | 'ActiveIntegration';
  recommendations: {
    eweBaths?: string[];     // leaf IDs
    somaticRoutines?: string[];
    reikiPlacements?: string[];
    dietaryNotes?: string[];
    integrationNotes?: string[];
  };
  sombraAreas?: string[];  // Lilith/house 8 related shadow areas to watch
}
