/**
 * Orixá Planet Correlations
 * 
 * STUB: Implementação real virá do Grimório
 */

export interface OrixaPlanet {
  orixa: string;
  planet: string;
  house: number;
  aspects: string[];
}

/**
 * Retorna a correlação planetária de um orixá
 */
export function getOrixaPlanet(orixa: string): OrixaPlanet {
  return {
    orixa,
    planet: 'Sol',
    house: 1,
    aspects: [],
  };
}
