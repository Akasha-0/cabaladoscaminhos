/**
 * Life Path Number Calculation Module
 * Based on Pythagorean/Tantric numerology using birth date
 */

// @ts-nocheck

import { getInterpretacao } from './calculos';

export interface LifePathResult {
  numero: number;
  interpretacao: {
    nome: string;
    significado: string;
    forca: string;
    desafio: string;
    sefirotRelacionado: string;
    sefirot: string;
    arco: string;
    elemento: string;
  };
  calculo: {
    dataOriginal: string;
    digitosOriginais: number[];
    passos: {
      soma: number;
      resultado: number;
      operacao: string;
    }[];
    resultadoFinal: number;
  };
}

export function calcularCaminhoVida(dataNascimento: string): number {
  const digitos = dataNascimento.replace(/\D/g, '').split('').map(Number);
  let soma = digitos.reduce((acc, d) => acc + d, 0);
  
  while (soma > 9 && ![11, 22, 33].includes(soma)) {
    soma = String(soma).split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
  }
  
  return soma;
}

export function calculate(dataNascimento: string): LifePathResult {
  const dataOriginal = dataNascimento;
  const digitosOriginais = dataOriginal.replace(/\D/g, '').split('').map(Number);
  
  let soma = digitosOriginais.reduce((acc, d) => acc + d, 0);
  const passos: LifePathResult['calculo']['passos'] = [
    {
      soma: soma,
      resultado: soma,
      operacao: `Soma dos dígitos: ${digitosOriginais.join(' + ')}`
    }
  ];
  
  while (soma > 9 && ![11, 22, 33].includes(soma)) {
    const digitosAtuais = String(soma).split('').map(Number);
    const novaSoma = digitosAtuais.reduce((acc, d) => acc + d, 0);
    passos.push({
      soma: soma,
      resultado: novaSoma,
      operacao: `Redução: ${digitosAtuais.join(' + ')} = ${novaSoma}`
    });
    soma = novaSoma;
  }
  
  const resultadoFinal = soma;
  const interpretacao = getInterpretacao(resultadoFinal);
  
  const sefirotMap: Record<number, string> = {
    1: 'Kether', 2: 'Chokmah', 3: 'Binah', 4: 'Chesed', 5: 'Geburah',
    6: 'Tiphereth', 7: 'Netzach', 8: 'Hod', 9: 'Yesod', 11: 'Malkuth',
    22: 'Daath', 33: 'Chesed'
  };
  
  const elementoMap: Record<number, string> = {
    1: 'Fogo', 2: 'Terra', 3: 'Ar', 4: 'Fogo', 5: 'Terra',
    6: 'Ar', 7: 'Água', 8: 'Terra', 9: 'Água', 11: 'Água',
    22: 'Fogo', 33: 'Fogo'
  };
  
  return {
    numero: resultadoFinal,
    interpretacao: {
      nome: interpretacao?.nome || `Caminho ${resultadoFinal}`,
      significado: interpretacao?.significado || '',
      forca: interpretacao?.forca || '',
      desafio: interpretacao?.desafio || '',
      sefirotRelacionado: interpretacao?.sefirotRelacionado || sefirotMap[resultadoFinal] || 'Yesod',
      sefirot: sefirotMap[resultadoFinal] || 'Yesod',
      arco: elementoMap[resultadoFinal] || 'Ar',
      elemento: elementoMap[resultadoFinal] || 'Ar'
    },
    calculo: {
      dataOriginal,
      digitosOriginais,
      passos,
      resultadoFinal
    }
  };
}

export default calculate;