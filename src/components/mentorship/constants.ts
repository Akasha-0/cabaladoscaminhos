// constants.ts — 7-tradição catalog, 12 sample mentors, slots
// All read-only. Object.freeze on every record.

import type { Mentor, Slot, Tradicao } from './types.ts';
import { TRADICOES } from './types.ts';

export const TRADICAO_LABELS: Readonly<Record<Tradicao, string>> = Object.freeze({
  cigano: 'Cigano',
  orixas: 'Orixás',
  astrologia: 'Astrologia',
  cabala: 'Cabala',
  numerologia: 'Numerologia',
  tantra: 'Tantra',
  tarot: 'Tarot',
});

export const TRADICAO_DESCRICOES: Readonly<Record<Tradicao, string>> = Object.freeze({
  cigano: 'Mesa Real, Cruzamento por Casa, Odu — método Cigano Ramiro',
  orixas: 'Odu de Nascimento, Ifá, Bori, fundamentos do Candomblé e Umbanda',
  astrologia: 'Carta Natal, Trânsitos, Sinastria, Astrologia Médica',
  cabala: 'Árvore da Vida, Sefirot, Gematria, Meditação Cabalística',
  numerologia: 'Mapa Numerológico, Ano Pessoal, Ciclos e Pico',
  tantra: 'Práticas Tântricas, Respiração, Energia, Consciência',
  tarot: 'Tarot Marselha, Rider, Cruz Celta, Mandala Astrológica',
});

export const TRADICAO_BADGE_COLORS: Readonly<Record<Tradicao, string>> = Object.freeze({
  cigano: '#C9A227',
  orixas: '#0F8B5F',
  astrologia: '#3B2F8C',
  cabala: '#6B2FA0',
  numerologia: '#A0470F',
  tantra: '#B0226F',
  tarot: '#1F4E79',
});

// 12 sample mentors covering all 7 tradições
export const SAMPLE_MENTORES: ReadonlyArray<Mentor> = Object.freeze([
  {
    id: 'm-1',
    nome: 'Cigano Ramiro',
    tradicaoPrincipal: 'cigano',
    specialties: ['Mesa Real', 'Cruzamento por Casa', 'Odu de Nascimento'],
    bio: 'Fundador do método Cruzamento por Casa. Une Cigano, Astrologia, Numerologia e Orixás em uma única consulta.',
    rating: 4.9,
    sessoesCompletas: 1247,
    precoBRL: 250,
    cidade: 'São Paulo, SP',
    atendeOnline: true,
    linguas: ['pt-BR'],
  },
  {
    id: 'm-2',
    nome: 'Mãe Iyá Omim',
    tradicaoPrincipal: 'orixas',
    specialties: ['Odu de Nascimento', 'Ifá', 'Bori', 'Fundamentos do Candomblé'],
    bio: 'Yalorixá há 32 anos. Iniciação em Ifá, especialista em Odu de Nascimento e Bori.',
    rating: 5.0,
    sessoesCompletas: 892,
    precoBRL: 280,
    cidade: 'Salvador, BA',
    atendeOnline: true,
    linguas: ['pt-BR'],
  },
  {
    id: 'm-3',
    nome: 'Astróloga Stella Vega',
    tradicaoPrincipal: 'astrologia',
    specialties: ['Carta Natal', 'Trânsitos', 'Sinastria', 'Astrologia Médica'],
    bio: 'Astróloga clínica, 18 anos de experiência. Foco em ciclos de Saturno, Netuno e Plutao.',
    rating: 4.8,
    sessoesCompletas: 534,
    precoBRL: 200,
    cidade: 'Rio de Janeiro, RJ',
    atendeOnline: true,
    linguas: ['pt-BR', 'en', 'es'],
  },
  {
    id: 'm-4',
    nome: 'Rabino Moshe Ben David',
    tradicaoPrincipal: 'cabala',
    specialties: ['Árvore da Vida', 'Sefirot', 'Gematria', 'Meditação Cabalística'],
    bio: 'Estudioso da Cabala há 25 anos. Une tradição mística e abordagem prática para autoconhecimento.',
    rating: 4.7,
    sessoesCompletas: 312,
    precoBRL: 320,
    cidade: 'São Paulo, SP',
    atendeOnline: true,
    linguas: ['pt-BR', 'en'],
  },
  {
    id: 'm-5',
    nome: 'Numeróloga Beatriz Luz',
    tradicaoPrincipal: 'numerologia',
    specialties: ['Mapa Numerológico', 'Ano Pessoal', 'Ciclos', 'Pico de Realização'],
    bio: 'Numeróloga cabalística — une numerologia pitagórica e Cabala. 12 anos de consultório.',
    rating: 4.9,
    sessoesCompletas: 678,
    precoBRL: 180,
    cidade: 'Belo Horizonte, MG',
    atendeOnline: true,
    linguas: ['pt-BR'],
  },
  {
    id: 'm-6',
    nome: 'Swami Ananda Devi',
    tradicaoPrincipal: 'tantra',
    specialties: ['Práticas Tântricas', 'Respiração Holotrópica', 'Energia Kundalini', 'Meditação'],
    bio: 'Iniciada na linhagem Kashmir Shaivismo. Ensina tantra como caminho de consciência.',
    rating: 4.6,
    sessoesCompletas: 245,
    precoBRL: 350,
    cidade: 'Florianópolis, SC',
    atendeOnline: true,
    linguas: ['pt-BR', 'en'],
  },
  {
    id: 'm-7',
    nome: 'Taróloga Luna Salles',
    tradicaoPrincipal: 'tarot',
    specialties: ['Tarot Marselha', 'Cruz Celta', 'Mandala Astrológica', 'Tarot Terapêutico'],
    bio: 'Taróloga há 15 anos. Une Tarot, Astrologia e Numerologia para diagnóstico espiritual.',
    rating: 4.8,
    sessoesCompletas: 891,
    precoBRL: 150,
    cidade: 'Curitiba, PR',
    atendeOnline: true,
    linguas: ['pt-BR'],
  },
  {
    id: 'm-8',
    nome: 'Pai Ogum de Iansã',
    tradicaoPrincipal: 'orixas',
    specialties: ['Umbanda', 'Giras', 'Fundamentos Espíritas', 'Ebó'],
    bio: 'Dirigente de terreiro de Umbanda. Trabalha com Caboclos, Pretos-Velhos e Exus.',
    rating: 4.9,
    sessoesCompletas: 1124,
    precoBRL: 200,
    cidade: 'Rio de Janeiro, RJ',
    atendeOnline: false,
    linguas: ['pt-BR'],
  },
  {
    id: 'm-9',
    nome: 'Caboclo Tupinambá',
    tradicaoPrincipal: 'cigano',
    specialties: ['Cruzamento Cigano', 'Búzios', 'Preces Ciganas', 'Mesa de Oxalá'],
    bio: 'Cigano tradicional da Nação Romani Brasil. Método Ramiro com linhagem antiga.',
    rating: 4.7,
    sessoesCompletas: 412,
    precoBRL: 220,
    cidade: 'São Paulo, SP',
    atendeOnline: true,
    linguas: ['pt-BR'],
  },
  {
    id: 'm-10',
    nome: 'Mestra Zahara',
    tradicaoPrincipal: 'cabala',
    specialties: ['Kabbalah Pratica', 'Sefirot Aplicados', 'Meditação Mística'],
    bio: 'Iniciada na linhagem sefardita. Une Cabala e Astrologia cabalística para ciclos de vida.',
    rating: 4.8,
    sessoesCompletas: 287,
    precoBRL: 290,
    cidade: 'Lisboa, PT',
    atendeOnline: true,
    linguas: ['pt-BR', 'en', 'es'],
  },
  {
    id: 'm-11',
    nome: 'Numerólogo Kabbalístico Ariel',
    tradicaoPrincipal: 'numerologia',
    specialties: ['Gematria', 'Numerologia Cabalística', 'Mapa Astral Numerológico'],
    bio: 'Une Gematria hebraica e Numerologia Pitagórica. 8 anos de consultório.',
    rating: 4.6,
    sessoesCompletas: 198,
    precoBRL: 200,
    cidade: 'Porto Alegre, RS',
    atendeOnline: true,
    linguas: ['pt-BR', 'en'],
  },
  {
    id: 'm-12',
    nome: 'Tantrika Shakti Ma',
    tradicaoPrincipal: 'tantra',
    specialties: ['Tantra Yogue', 'Kundalini', 'Cura Sexual', 'Círculo Feminino'],
    bio: 'Linhagem Kaula Tantra. Trabalha com mulheres em ciclos de cura e empoderamento.',
    rating: 4.9,
    sessoesCompletas: 367,
    precoBRL: 380,
    cidade: 'São Paulo, SP',
    atendeOnline: true,
    linguas: ['pt-BR', 'en', 'es'],
  },
]);

// 30 sample slots covering mentors
function makeSlots(): ReadonlyArray<Slot> {
  const slots: Slot[] = [];
  const baseDate = new Date();
  baseDate.setHours(9, 0, 0, 0);
  let i = 0;
  for (const mentor of SAMPLE_MENTORES) {
    // each mentor gets 2-3 future slots (avg 2.5 → 30 slots for 12 mentors)
    const slotsPerMentor = i % 2 === 0 ? 3 : 2;
    for (let j = 0; j < slotsPerMentor; j++) {
      const dayOffset = i + j * 3;
      const inicio = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const fim = new Date(inicio.getTime() + 60 * 60 * 1000); // 1h
      slots.push({
        id: 's-' + (i + 1) + '-' + (j + 1),
        mentorId: mentor.id,
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
        duracaoMin: 60,
      });
    }
    i++;
  }
  return Object.freeze(slots);
}

export const SAMPLE_SLOTS: ReadonlyArray<Slot> = makeSlots();

// Get all unique specialties across mentors
export const ALL_SPECIALTIES: ReadonlyArray<string> = Object.freeze(
  Array.from(
    new Set(SAMPLE_MENTORES.flatMap((m) => m.specialties))
  ).sort()
);

// Helper: get mentors by tradition
export function mentorsPorTradicao(
  tradicao: Tradicao
): ReadonlyArray<Mentor> {
  return SAMPLE_MENTORES.filter((m) => m.tradicaoPrincipal === tradicao);
}
