export type Intencao = 'cura' | 'proteção' | 'amor' | 'prosperidade';

export interface Cristal {
  nome: string;
  tipo: string;
  posicao: { x: number; y: number };
  significado: string;
  sefirot: string;
  chakra: number;
}

export interface CristalGrid {
  intencao: Intencao;
  cristais: Cristal[];
  formaGeometrica: string;
  descricao: string;
}

const CRISTAIS_POR_INTENCAO: Record<Intencao, Omit<Cristal, 'posicao'>[]> = {
  cura: [
    { nome: 'Quartzo Rosa', tipo: 'quartzo-rosa', significado: 'Abre o coração, promove autocuidado e amor próprio', sefirot: 'Tiferet', chakra: 4 },
    { nome: 'Esmeralda', tipo: 'esmeralda', significado: 'Harmoniza emoções, facilita cura física e emocional', sefirot: 'Chesed', chakra: 4 },
    { nome: 'Pedra de Lua', tipo: 'pedra-de-lua', significado: 'Equilibra ciclos femininos, purifica emoções', sefirot: 'Yesod', chakra: 6 },
    { nome: 'Crisocola', tipo: 'crisocola', significado: 'Comunica wisdom, acalma a mente ansiosa', sefirot: 'Geburah', chakra: 5 },
    { nome: 'Jade', tipo: 'jade', significado: 'Promove longevidade, proteção e prosperidade', sefirot: 'Netzach', chakra: 4 },
    { nome: 'Amazonita', tipo: 'amazonita', significado: 'Harmoniza coração e garganta, alivia担忧', sefirot: 'Hod', chakra: 4 },
  ],
  proteção: [
    { nome: 'Obsidiana Negra', tipo: 'obsidiana', significado: 'Escudo protetor, absorve negativity', sefirot: 'Malkuth', chakra: 1 },
    { nome: 'Turmalina Negra', tipo: 'turmalina-negra', significado: 'Bloqueia energias negativas, aterramento', sefirot: 'Yesod', chakra: 1 },
    { nome: 'Labradorita', tipo: 'labradorita', significado: 'Protector do campo áurico, intuição', sefirot: 'Daat', chakra: 6 },
    { nome: 'Hematita', tipo: 'hematita', significado: 'Proteção física, fortalece aura', sefirot: 'Malkuth', chakra: 1 },
    { nome: 'Shungite', tipo: 'shungite', significado: 'Proteção contra EMF, purificação', sefirot: 'Malkuth', chakra: 1 },
    { nome: 'Pirita', tipo: 'pirita', significado: 'Escudo energético, atrae abundance', sefirot: 'Netzach', chakra: 3 },
  ],
  amor: [
    { nome: 'Quartzo Rosa', tipo: 'quartzo-rosa', significado: 'Amor unconditional, compaixão', sefirot: 'Tiferet', chakra: 4 },
    { nome: 'Rodocrosita', tipo: 'rodocrosita', significado: 'Amor próprio, cura corações feridos', sefirot: 'Chesed', chakra: 4 },
    { nome: 'Malaia', tipo: 'malaia', significado: 'Harmonia em relações, conexões espirituais', sefirot: 'Netzach', chakra: 4 },
    { nome: 'Rosa do Deserto', tipo: 'rosa-do-deserto', significado: 'Fertilidade, novos começos amorosos', sefirot: 'Geburah', chakra: 2 },
    { nome: 'Kunzita', tipo: 'kunzita', significado: 'Abre coração, pacific relationhips', sefirot: 'Tiferet', chakra: 4 },
    { nome: 'Morganita', tipo: 'morganita', significado: 'Amor divino, autoamor', sefirot: 'Chesed', chakra: 4 },
  ],
  prosperidade: [
    { nome: 'Pirita', tipo: 'pirita', significado: 'Abundância material, manifestation', sefirot: 'Chesed', chakra: 3 },
    { nome: 'Citrino', tipo: 'citrino', significado: 'Sucesso, creatividad, wealth', sefirot: 'Netzach', chakra: 3 },
    { nome: 'Jade', tipo: 'jade', significado: 'Prosperidade, sabedoria, longEvity', sefirot: 'Malkuth', chakra: 3 },
    { nome: 'Olho de Tigre', tipo: 'olho-de-tigre', significado: 'Foco, determinação, protección financiera', sefirot: 'Geburah', chakra: 3 },
    { nome: 'Turmalina Verde', tipo: 'turmalina-verde', significado: 'Crescimento, equilíbrio financeiro', sefirot: 'Chesed', chakra: 4 },
    { nome: 'Ágata Fortuna', tipo: 'agata-fortuna', significado: 'Boa sorte, oportunidades', sefirot: 'Yesod', chakra: 2 },
  ],
};

const FORMAS_GRID: Record<Intencao, { forma: string; descricao: string }> = {
  cura: {
    forma: 'Hexágono',
    descricao: 'Grid em hexágono para cura — energia flui uniformemente em 6 direções, representando harmonia e equilíbrio perfeito.',
  },
  proteção: {
    forma: 'Pentágono',
    descricao: 'Grid em pentagrama para proteção — forma de defesa angular que cria barreiras energéticas contra influências negativas.',
  },
  amor: {
    forma: 'Círculo',
    descricao: 'Grid em círculo para amor — formato sem fim que representa amor incondicional, conexões eternas e unidade.',
  },
  prosperidade: {
    forma: 'Triângulo',
    descricao: 'Grid em triângulo para prosperidade — direciona energia para um ponto focal de manifestacão, amplificando abundance.',
  },
};

function calcularPosicoesGrid(quantidade: number): { x: number; y: number }[] {
  const posicoes: { x: number; y: number }[] = [];
  const raio = 100;

  if (quantidade === 1) {
    return [{ x: 0, y: 0 }];
  }

  if (quantidade <= 7) {
    // Centro + anel hexagonal
    posicoes.push({ x: 0, y: 0 });
    for (let i = 0; i < quantidade - 1; i++) {
      const angulo = (i * 2 * Math.PI) / (quantidade - 1) - Math.PI / 2;
      posicoes.push({
        x: Math.round(raio * Math.cos(angulo)),
        y: Math.round(raio * Math.sin(angulo)),
      });
    }
    return posicoes;
  }

  // Centro + dois anéis
  posicoes.push({ x: 0, y: 0 });
  const anel1 = Math.min(6, quantidade - 1);
  for (let i = 0; i < anel1; i++) {
    const angulo = (i * 2 * Math.PI) / anel1 - Math.PI / 2;
    posicoes.push({
      x: Math.round(raio * Math.cos(angulo)),
      y: Math.round(raio * Math.sin(angulo)),
    });
  }
  const anel2 = quantidade - 1 - anel1;
  for (let i = 0; i < anel2; i++) {
    const angulo = (i * 2 * Math.PI) / anel2 - Math.PI / 2 + Math.PI / anel2;
    posicoes.push({
      x: Math.round(raio * 2 * Math.cos(angulo)),
      y: Math.round(raio * 2 * Math.sin(angulo)),
    });
  }

  return posicoes;
}

/**
 * Gera um grid de cristais baseado na intenção especificada.
 * 
 * @param intencao - A intenção do grid: 'cura', 'proteção', 'amor' ou 'prosperidade'
 * @returns CristalGrid com cristais posicionados e suas informações
 */
export function generateCrystalGrid(intencao: Intencao): CristalGrid {
  const cristaisDisponiveis = CRISTAIS_POR_INTENCAO[intencao] ?? CRISTAIS_POR_INTENCAO.cura;
  const { forma, descricao } = FORMAS_GRID[intencao];
  const posicoes = calcularPosicoesGrid(cristaisDisponiveis.length);

  const cristais: Cristal[] = cristaisDisponiveis.map((cristal, index) => ({
    ...cristal,
    posicao: posicoes[index] ?? { x: 0, y: 0 },
  }));

  return {
    intencao,
    cristais,
    formaGeometrica: forma,
    descricao,
  };
}