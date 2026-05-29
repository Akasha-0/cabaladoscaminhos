import { useState, useEffect } from 'react';

const DAYS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

const PORTALS: Record<string, {
  orixa: string;
  planeta: string;
  chakra: string;
  cor: string;
  activities: string[];
}> = {
  domingo: { orixa: 'Xangô', planeta: 'Sol', chakra: '3º Plexo Solar', cor: '#D4A843', activities: ['Poder pessoal', 'Vitalidade'] },
  segunda: { orixa: 'Iemanjá', planeta: 'Lua', chakra: '6º Frontal', cor: '#1E3A5F', activities: ['Limpeza', 'Ancestralidade'] },
  terca: { orixa: 'Iansã', planeta: 'Marte', chakra: '2º Sacro', cor: '#C45C26', activities: ['Corte', 'Movimento'] },
  quarta: { orixa: 'Xangô', planeta: 'Mercúrio', chakra: '3º Plexo Solar', cor: '#F0B429', activities: ['Estudos', 'Justiça'] },
  quinta: { orixa: 'Oxóssi', planeta: 'Júpiter', chakra: '4º Cardíaco', cor: '#2D6A4F', activities: ['Fartura', 'Conhecimento'] },
  sexta: { orixa: 'Oxalá', planeta: 'Vênus', chakra: '7º Coronário', cor: '#7C6EB3', activities: ['Paz', 'Conexão divina'] },
  sabado: { orixa: 'Oxum', planeta: 'Saturno', chakra: '4º Cardíaco', cor: '#D4728C', activities: ['Amor', 'Intuição'] },
};

export interface SpiritualEnergy {
  day: string;
  orixa: string;
  planeta: string;
  chakra: string;
  cor: string;
  activities: string[];
  lunarPhase: string;
  lunarIllumination: number;
}

export function useSpiritualEnergy(): SpiritualEnergy {
  const [energy, setEnergy] = useState<SpiritualEnergy>(() => {
    const day = DAYS[new Date().getDay()];
    const portal = PORTALS[day];
    return {
      day,
      ...portal,
      lunarPhase: 'Lua Crescente',
      lunarIllumination: 45,
    };
  });

  useEffect(() => {
    const update = () => {
      const day = DAYS[new Date().getDay()];
      const portal = PORTALS[day];
      setEnergy({
        day,
        ...portal,
        lunarPhase: 'Lua Crescente',
        lunarIllumination: 45,
      });
    };
    
    // Update at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeout = setTimeout(update, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, []);

  return energy;
}