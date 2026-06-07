import { describe, it, expect } from 'vitest';
import { calcularTrânsitosAtivos } from '@/lib/astrologia/trânsitos/calculator';
import type { MapaNatal } from '@/lib/astrologia/tipos';

describe('Trânsitos', () => {
  it('deve listar trânsitos ativos', () => {
    const mapaNatal: MapaNatal = {
      usuarioId: 'test',
      dataCalculo: new Date(),
      planeta: {
        sol: { planeta: 'sol', longitude: 100, latitude: 0, distancia: 1, velocidade: 1, signo: 'aries', casa: 1, grauNoSigno: 10 },
        lua: { planeta: 'lua', longitude: 200, latitude: 0, distancia: 1, velocidade: 12, signo: 'libra', casa: 7, grauNoSigno: 20 },
        mercurio: { planeta: 'mercurio', longitude: 50, latitude: 0, distancia: 1, velocidade: 2, signo: 'touro', casa: 2, grauNoSigno: 20 },
        venus: { planeta: 'venus', longitude: 150, latitude: 0, distancia: 1, velocidade: 1, signo: 'cancer', casa: 5, grauNoSigno: 10 },
        marte: { planeta: 'marte', longitude: 280, latitude: 0, distancia: 1, velocidade: 1.5, signo: 'sagitario', casa: 10, grauNoSigno: 10 },
        jupiter: { planeta: 'jupiter', longitude: 90, latitude: 0, distancia: 1, velocidade: 0.5, signo: 'cancer', casa: 4, grauNoSigno: 15 },
        saturno: { planeta: 'saturno', longitude: 180, latitude: 0, distancia: 1, velocidade: 0.3, signo: 'libra', casa: 7, grauNoSigno: 20 },
        urano: { planeta: 'urano', longitude: 270, latitude: 0, distancia: 1, velocidade: 0.4, signo: 'escorpio', casa: 9, grauNoSigno: 5 },
        netuno: { planeta: 'netuno', longitude: 30, latitude: 0, distancia: 1, velocidade: 0.2, signo: 'peixes', casa: 12, grauNoSigno: 15 },
        plutao: { planeta: 'plutao', longitude: 200, latitude: 0, distancia: 1, velocidade: 0.1, signo: 'escorpio', casa: 8, grauNoSigno: 25 },
      } as MapaNatal['planeta'],
      casas: [],
      ascendente: 45,
      mediumCoeli: 180,
      nodes: { 
        norte: { planeta: 'node_norte', longitude: 120, latitude: 0, distancia: 1, velocidade: 0, signo: 'leao', casa: 5, grauNoSigno: 0 },
        sul: { planeta: 'node_sul', longitude: 300, latitude: 0, distancia: 1, velocidade: 0, signo: 'aquario', casa: 11, grauNoSigno: 0 },
      },
    };
    
    const transitos = calcularTrânsitosAtivos(mapaNatal);
    expect(Array.isArray(transitos)).toBe(true);
  });
});
