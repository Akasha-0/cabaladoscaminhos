export interface PadraoResonancia {
  id: string;
  nome: string;
  descricao: string;
  tipo: 'armonica' | 'planetaria' | 'numerica' | 'cabalistica';
  frequencias: number[];
  sefirot: string[];
  chakra: number[];
  elemento: string | null;
  qualidade: string;
  aplicacao: string;
  mantras: string[];
  cor: string;
  nivel: number;
}

export const DADOS_RESSONANCIA: PadraoResonancia[] = [
  {
    id: 'res-1-aterramento',
    nome: 'Ressonância de Aterramento',
    descricao: 'Padrão resonante que conecta o ser ao centro da Terra, garantindo estabilidade e proteção energética.',
    tipo: 'cabalistica',
    frequencias: [174, 285],
    sefirot: ['Malkuth', 'Yesod'],
    chakra: [1, 2],
    elemento: 'Terra',
    qualidade: 'Estabilidade e segurança',
    aplicacao: 'Meditação de aterramento, proteção contra energias negativas, fortalecimento da aura física',
    mantras: ['Om', 'Ram'],
    cor: '#8B0000',
    nivel: 1,
  },
  {
    id: 'res-2-agua',
    nome: 'Ressonância das Águas',
    descricao: 'Padrão resonante que flui através das águas emocionais, purificando e hidratando o campo aurico.',
    tipo: 'planetaria',
    frequencias: [285, 396],
    sefirot: ['Yesod', 'Hod'],
    chakra: [2, 3],
    elemento: 'Água',
    qualidade: 'Purificação e Fluidez',
    aplicacao: 'Limpeza emocional, trabalho com água estruturada, harmonização de traumas',
    mantras: ['Ram', 'Gam'],
    cor: '#0000CD',
    nivel: 2,
  },
  {
    id: 'res-3-libertacao',
    nome: 'Ressonância da Libertação',
    descricao: 'Padrão resonante que libera padrões kármicos e abre caminhos para novas possibilidades.',
    tipo: 'armonica',
    frequencias: [396, 417],
    sefirot: ['Hod', 'Netzach'],
    chakra: [3, 4],
    elemento: 'Fogo',
    qualidade: 'Libertação e transformação',
    aplicacao: 'Soltura de traumas, perdão profundo, abertura para mudanças',
    mantras: ['Gam', 'Vau'],
    cor: '#FF4500',
    nivel: 3,
  },
  {
    id: 'res-4-coracao',
    nome: 'Ressonância do Coração',
    descricao: 'Padrão resonante que abre o chakra cardíaco para o amor incondicional e a compaixão.',
    tipo: 'armonica',
    frequencias: [417, 528],
    sefirot: ['Netzach', 'Tiphereth'],
    chakra: [4, 5],
    elemento: 'Ar',
    qualidade: 'Amor e compaixão',
    aplicacao: 'Expansão do amor próprio, cura de feridas emocionais, ativação do coração',
    mantras: ['Vau', 'Yod'],
    cor: '#FF69B4',
    nivel: 4,
  },
  {
    id: 'res-5-unidade',
    nome: 'Ressonância da Unidade',
    descricao: 'Padrão resonante que integra todas as partes do ser em harmonia e perfeição.',
    tipo: 'cabalistica',
    frequencias: [528, 639],
    sefirot: ['Tiphereth', 'Geburah'],
    chakra: [5, 6],
    elemento: 'Éter',
    qualidade: 'Integridade e wholeness',
    aplicacao: 'Integração do self, cura de doenças crônicas, alinhamento dos corpos sutis',
    mantras: ['Yod', 'He'],
    cor: '#22C55E',
    nivel: 5,
  },
  {
    id: 'res-6-visao',
    nome: 'Ressonância da Visão Clara',
    descricao: 'Padrão resonante que desperta a intuição e permite ver além do véu da ilusão.',
    tipo: 'planetaria',
    frequencias: [639, 741],
    sefirot: ['Geburah', 'Chesed'],
    chakra: [6, 7],
    elemento: 'Luz',
    qualidade: 'Clareza e percepção',
    aplicacao: 'Desenvolvimento da intuição, leitura de auras, percepção extrasensorial',
    mantras: ['He', 'Zain'],
    cor: '#9400D3',
    nivel: 6,
  },
  {
    id: 'res-7-mestria',
    nome: 'Ressonância da Mestria',
    descricao: 'Padrão resonante que ativa o comando da vontade sobre os elementos e energias.',
    tipo: 'cabalistica',
    frequencias: [741, 852],
    sefirot: ['Chesed', 'Binah'],
    chakra: [7, 1],
    elemento: 'Fogo',
    qualidade: 'Domínio e autoridade',
    aplicacao: 'Comando de energia, rituals de proteção, ativação de habilidadespsi',
    mantras: ['Zain', 'Cheth'],
    cor: '#FFD700',
    nivel: 7,
  },
  {
    id: 'res-8-conexao-divina',
    nome: 'Ressonância da Conexão Divina',
    descricao: 'Padrão resonante que abre o canal direto com a consciência divina e os mestres ascensionados.',
    tipo: 'cabalistica',
    frequencias: [852, 963],
    sefirot: ['Binah', 'Chokhmah'],
    chakra: [7, 8],
    elemento: 'Luz',
    qualidade: 'Transcendência e iluminação',
    aplicacao: 'Comunhão com guías, ativação da glândula pineal, expansão da consciência',
    mantras: ['Cheth', 'Teth'],
    cor: '#FFFFFF',
    nivel: 8,
  },
  {
    id: 'res-9-cura-profunda',
    nome: 'Ressonância de Cura Profunda',
    descricao: 'Padrão resonante de alta frequência para regeneração celular e reparação de sistemas.',
    tipo: 'numerica',
    frequencias: [528, 639, 741],
    sefirot: ['Tiphereth', 'Geburah', 'Chesed'],
    chakra: [4, 5, 6],
    elemento: 'Éter',
    qualidade: 'Regeneração e restauração',
    aplicacao: 'Cura de doenças, reparação de DNA, recuperação de trauma profundo',
    mantras: ['Yod', 'He', 'Zain'],
    cor: '#00CED1',
    nivel: 5,
  },
  {
    id: 'res-10-protecao',
    nome: 'Ressonância de Proteção',
    descricao: 'Padrão resonante que cria uma barreira energética impenetrable contra influências negativas.',
    tipo: 'cabalistica',
    frequencias: [174, 285, 396],
    sefirot: ['Malkuth', 'Yesod', 'Hod'],
    chakra: [1, 2, 3],
    elemento: 'Terra',
    qualidade: 'Proteção e segurança',
    aplicacao: 'Escudo energético, limpeza de entidades, proteção de espaços',
    mantras: ['Om', 'Ram', 'Gam'],
    cor: '#4B0082',
    nivel: 2,
  },
  {
    id: 'res-11-manifestacao',
    nome: 'Ressonância da Manifestação',
    descricao: 'Padrão resonante que potencializa a capacidade de materializar intenções no plano físico.',
    tipo: 'armonica',
    frequencias: [417, 528, 639],
    sefirot: ['Netzach', 'Tiphereth', 'Geburah'],
    chakra: [4, 5, 6],
    elemento: 'Fogo',
    qualidade: 'Criação e abundância',
    aplicacao: 'Manifestação de objetivos, attract de oportunidades, trabalho com a lei do retorno',
    mantras: ['Vau', 'Yod', 'He'],
    cor: '#FFD700',
    nivel: 4,
  },
  {
    id: 'res-12-equilibrio',
    nome: 'Ressonância do Equilíbrio',
    descricao: 'Padrão resonante que harmoniza os opostos e traz paz aos conflitos internos.',
    tipo: 'numerica',
    frequencias: [174, 396, 528, 741],
    sefirot: ['Malkuth', 'Hod', 'Tiphereth', 'Chesed'],
    chakra: [1, 3, 5, 7],
    elemento: 'Ar',
    qualidade: 'Harmonia e balance',
    aplicacao: 'Equilíbrio emocional, reconciliação de opostos, integração de sombras',
    mantras: ['Om', 'Gam', 'Yod', 'Zain'],
    cor: '#E6E6FA',
    nivel: 3,
  },
  {
    id: 'res-13-ascensao',
    nome: 'Ressonância da Ascensão',
    descricao: 'Padrão resonante que acelera a evolução espiritual e a elevação vibracional.',
    tipo: 'cabalistica',
    frequencias: [396, 528, 639, 741, 852, 963],
    sefirot: ['Hod', 'Tiphereth', 'Geburah', 'Chesed', 'Binah', 'Chokhmah'],
    chakra: [3, 4, 5, 6, 7, 8],
    elemento: 'Luz',
    qualidade: 'Ascensão e evolução',
    aplicacao: 'Processos de ascensão, ativação de corpos superiores, integração com o Eu Superior',
    mantras: ['Gam', 'Yod', 'He', 'Zain', 'Cheth', 'Teth'],
    cor: '#F0F8FF',
    nivel: 7,
  },
  {
    id: 'res-14-chakras-ligado',
    nome: 'Ressonância dos Chakras Ligados',
    descricao: 'Padrão resonante que ativa a cadeia completa de chakras para flujo energético contínuo.',
    tipo: 'numerica',
    frequencias: [174, 285, 396, 417, 528, 639, 741, 852],
    sefirot: ['Malkuth', 'Yesod', 'Hod', 'Netzach', 'Tiphereth', 'Geburah', 'Chesed', 'Binah'],
    chakra: [1, 2, 3, 4, 5, 6, 7],
    elemento: 'Éter',
    qualidade: 'Fluxo e expansão',
    aplicacao: 'Abertura de canales energéticos, ativação da kundalini, meditação profunda',
    mantras: ['Om', 'Ram', 'Gam', 'Vau', 'Yod', 'He', 'Zain', 'Cheth'],
    cor: '#7B68EE',
    nivel: 6,
  },
  {
    id: 'res-15-solfeggio-completo',
    nome: 'Ressonância Solfeggio Completa',
    descricao: 'Padrão resonante que utiliza todas as 12 frequências Solfeggio para cura holística.',
    tipo: 'armonica',
    frequencias: [174, 285, 396, 417, 528, 639, 741, 852, 963],
    sefirot: ['Malkuth', 'Yesod', 'Hod', 'Netzach', 'Tiphereth', 'Geburah', 'Chesed', 'Binah', 'Chokhmah'],
    chakra: [1, 2, 3, 4, 5, 6, 7, 8],
    elemento: 'Luz',
    qualidade: 'Perfeição e completude',
    aplicacao: 'Sessões de cura completas, alinhamento multidimensional, expansão de consciência',
    mantras: ['Om', 'Ram', 'Gam', 'Vau', 'Yod', 'He', 'Zain', 'Cheth', 'Teth'],
    cor: '#FFFFFF',
    nivel: 9,
  },
];

export function getData(): PadraoResonancia[] {
  return DADOS_RESSONANCIA;
}

export function getPorTipo(tipo: PadraoResonancia['tipo']): PadraoResonancia[] {
  return DADOS_RESSONANCIA.filter(r => r.tipo === tipo);
}

export function getPorChakra(chakra: number): PadraoResonancia[] {
  return DADOS_RESSONANCIA.filter(r => r.chakra.includes(chakra));
}

export function getPorSefira(sefira: string): PadraoResonancia[] {
  return DADOS_RESSONANCIA.filter(r => r.sefirot.includes(sefira));
}

export function getPorNivel(nivel: number): PadraoResonancia[] {
  return DADOS_RESSONANCIA.filter(r => r.nivel === nivel);
}

export function getPorFrequencia(hz: number): PadraoResonancia[] {
  return DADOS_RESSONANCIA.filter(r => r.frequencias.includes(hz));
}

export function getResonanciaMaisAlta(): PadraoResonancia {
  return DADOS_RESSONANCIA.reduce((maior, atual) =>
    atual.frequencias[atual.frequencias.length - 1] > maior.frequencias[maior.frequencias.length - 1]
      ? atual
      : maior
  );
}

export function getResonanciaMaisComplexa(): PadraoResonancia {
  return DADOS_RESSONANCIA.reduce((complexa, atual) =>
    atual.frequencias.length > complexa.frequencias.length ? atual : complexa
  );
}

export function getResonanciaPorElemento(elemento: string): PadraoResonancia[] {
  return DADOS_RESSONANCIA.filter(r => r.elemento === elemento);
}