export interface PosicaoPlaneta {
  planeta: Planeta;
  longitude: number;
  latitude: number;
  distancia: number;
  velocidade: number;
  signo: Signo;
  casa: number;
  grauNoSigno: number;
}

export interface Casa {
  numero: number;
  signo: Signo;
  grauNoSigno: number;
  planetaRegente: Planeta | null;
}

export interface MapaNatal {
  usuarioId: string;
  dataCalculo: Date;
  planeta: {
    sol: PosicaoPlaneta;
    lua: PosicaoPlaneta;
    mercurio: PosicaoPlaneta;
    venus: PosicaoPlaneta;
    marte: PosicaoPlaneta;
    jupiter: PosicaoPlaneta;
    saturno: PosicaoPlaneta;
    urano: PosicaoPlaneta;
    netuno: PosicaoPlaneta;
    plutao: PosicaoPlaneta;
  };
  casas: Casa[];
  ascendente: number;
  mediumCoeli: number;
  nodes: {
    norte: PosicaoPlaneta;
    sul: PosicaoPlaneta;
  };
}

export type Planeta =
  | 'sol'
  | 'lua'
  | 'mercurio'
  | 'venus'
  | 'marte'
  | 'jupiter'
  | 'saturno'
  | 'urano'
  | 'netuno'
  | 'plutao'
  | 'node_norte'
  | 'node_sul'
  | 'quiron';

export type Signo =
  | 'aries'
  | 'touro'
  | 'gemeos'
  | 'cancer'
  | 'leao'
  | 'virgem'
  | 'libra'
  | 'escorpio'
  | 'sagitario'
  | 'capricornio'
  | 'aquario'
  | 'peixes';

export interface Aspecto {
  planeta1: Planeta;
  planeta2: Planeta;
  tipo: AspectoTipo;
  orb: number;
  aplicativo: boolean;
}

export type AspectoTipo =
  | 'conjunção'
  | 'oposição'
  | 'quadratura'
  | 'trino'
  | 'sextil';
