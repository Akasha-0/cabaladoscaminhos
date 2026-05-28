// Orixá Profiles API
// GET /api/orixa/profiles - Get all orixa profiles
// GET /api/orixa/profiles?orixa=Name - Get specific orixa profile
// GET /api/orixa/profiles?element=Fogo - Filter by element
// GET /api/orixa/profiles?chakra=7 - Filter by chakra

import { NextRequest, NextResponse } from 'next/server';
import { orixas } from '@/lib/data/spiritual-data';

export interface OrixaProfile {
  id: string;
  nome: string;
  saudacao: string;
  elementos: string[];
  cores: string[];
  dia: string;
  chakra: string;
  planeta: string;
  ervas: string[];
  quizilas: string[];
  misterio: string;
  ebos: string[];
  numerologia: {
    caminhoVida: number;
    destino: number;
    alma: number;
  };
  sefirot: string[];
  tarot: string[];
  elemento: string;
  qualidade: string[];
  desafios: string[];
  oracao: string;
}

const ORIXA_PROFILES: OrixaProfile[] = [
  {
    id: 'oxala',
    nome: 'Oxalá',
    saudacao: 'Epa!',
    elementos: ['Luz', 'Ar'],
    cores: ['Branco', 'Azul claro', 'Dourado'],
    dia: 'Sexta-feira',
    chakra: '7 - Coronário',
    planeta: 'Sol',
    ervas: ['Algodão', 'Cipó de死不', 'Mana'],
    quizilas: ['Não pode comer camarão', 'Não pode dormir até tarde', 'Não pode usar roupas的色彩鲜艳'],
    misterio: 'Pai Supremo, Criador de tudo',
    ebos: ['Bori - Oferta à cabeça', 'Xorire - Saudação aos Orixás', 'Oferenda de canjica branca'],
    numerologia: { caminhoVida: 1, destino: 1, alma: 1 },
    sefirot: ['Keter', 'Chokhmah', 'Binah'],
    tarot: ['O Sol', 'O Mundo', 'A Estrela'],
    elemento: 'Luz',
    qualidade: ['Sabedoria', 'Paz', 'Pureza', 'Criação', 'Iluminação'],
    desafios: ['Indecisão', 'Perfeccionismo', 'Rigidez mental'],
    oracao: 'Oxalá, dai-me a luz da sabedoria e a paz do coração. Que eu possa criar com amor e pureza.',
  },
  {
    id: 'iemanja',
    nome: 'Iemanjá',
    saudacao: 'Odoyewê!',
    elementos: ['Água', 'Mar'],
    cores: ['Azul', 'Branco', 'Azul-marinho'],
    dia: 'Segunda-feira',
    chakra: '2 - Sacral',
    planeta: 'Lua',
    ervas: ['Manjericão', 'Arruda', 'Alecrim'],
    quizilas: ['Não pode comer caranguejo', 'Não pode se banhar de maiô', 'Não pode ficar sozinha à noite'],
    misterio: 'Rainha do Mar, Mãe de todos os orixás',
    ebos: ['Oferenda de mar', 'Água de flor', 'Velas azuis e brancas'],
    numerologia: { caminhoVida: 2, destino: 2, alma: 2 },
    sefirot: ['Binah', 'Yesod', 'Malkuth'],
    tarot: ['A Lua', 'A Imperatriz', 'O Mundo'],
    elemento: 'Água',
    qualidade: ['Maternidade', 'Proteção', 'Intuição', 'Emoções', 'Devoção'],
    desafios: ['Vulnerabilidade excessiva', 'Mimovariância', 'Co-dependência'],
    oracao: 'Iemanjá, mãe do mar, abraça-me com sua proteção. Que suas águas lavem minhas preocupações.',
  },
  {
    id: 'ogum',
    nome: 'Ogum',
    saudacao: 'Saluba!',
    elementos: ['Fogo', 'Ferro'],
    cores: ['Vermelho', 'Verde', 'Azul'],
    dia: 'Terça-feira',
    chakra: '1 - Raiz',
    planeta: 'Marte',
    ervas: ['Guiné', 'Pau-brasil', 'Espada-de-são-jorge'],
    quizilas: ['Não pode comer porco', 'Não pode se envolver em brigas', 'Não pode desistir de seus objetivos'],
    misterio: 'Senhor das Guerras e do Ferro',
    ebos: ['Paliteiro', 'Ebó de abertura de caminhos', 'Sangue de ferreiro'],
    numerologia: { caminhoVida: 3, destino: 3, alma: 3 },
    sefirot: ['Gevurah', 'Hod'],
    tarot: ['O Carro', 'A Torre', 'Os Enamorados'],
    elemento: 'Fogo',
    qualidade: ['Coragem', 'Determinação', 'Proteção', 'Trabalho', 'Vitória'],
    desafios: ['Impaciência', 'Agressividade', 'Teimosia'],
    oracao: 'Ogum, senhor da guerra, abre meus caminhos e dá-me força para superar todos os obstáculos.',
  },
  {
    id: 'xango',
    nome: 'Xangô',
    saudacao: 'Epa! Kawô!',
    elementos: ['Fogo', 'Pedra'],
    cores: ['Vermelho', 'Preto', 'Laranja'],
    dia: 'Quarta-feira',
    chakra: '3 - Plexo Solar',
    planeta: 'Júpiter',
    ervas: ['Pimenta', 'Cola', 'Eucalyptus'],
    quizilas: ['Não pode comer amalá', 'Não pode ser desonesto', 'Não pode jurar falsamente'],
    misterio: 'Rei da Justiça e do Trovão',
    ebos: ['Amalá', 'Velas vermelha e preta', 'Pirão de dendê'],
    numerologia: { caminhoVida: 4, destino: 4, alma: 4 },
    sefirot: ['Chesed', 'Hod'],
    tarot: ['A Justiça', 'O Carro', 'A Torre'],
    elemento: 'Fogo',
    qualidade: ['Justiça', 'Equilíbrio', 'Autoridade', 'Sabedoria política', 'Força'],
    desafios: ['Rigidez', 'Orgulho', 'Vingança'],
    oracao: 'Xangô, rei justo, dá-me a sabedoria da justiça e a força do equilíbrio em todas as decisões.',
  },
  {
    id: 'oxum',
    nome: 'Oxum',
    saudacao: 'Oê Oxum!',
    elementos: ['Água', 'Rios'],
    cores: ['Dourado', 'Amarelo', 'Azul claro'],
    dia: 'Sábado',
    chakra: '4 - Cardíaco',
    planeta: 'Vênus',
    ervas: ['Calêndula', 'Rosa', 'Malva'],
    quizilas: ['Não pode comer abóbora', 'Não pode ser avarenta', 'Não pode deixar de se embelezar'],
    misterio: 'Rainha dos Rios, Deusa da Beleza e Amor',
    ebos: ['Mel', 'Velas douradas', 'Perfume de flor'],
    numerologia: { caminhoVida: 5, destino: 5, alma: 5 },
    sefirot: ['Netzach', 'Tiferet'],
    tarot: ['A Imperatriz', 'A Estrela', 'O Hierofante'],
    elemento: 'Água',
    qualidade: ['Beleza', 'Amor', 'Prosperidade', 'Charme', 'Sensualidade'],
    desafios: ['Vaidade', 'Materialismo', 'Inveja'],
    oracao: 'Oxum, beleza divina, concede-me o amor verdadeiro e a prosperidade que vem da alma.',
  },
  {
    id: 'iansa',
    nome: 'Iansã',
    saudacao: 'Oiê-Yá!',
    elementos: ['Fogo', 'Ar'],
    cores: ['Vermelho', 'Laranja', 'Amarelo'],
    dia: 'Quarta-feira',
    chakra: '2 - Sacral',
    planeta: 'Marte',
    ervas: ['Pimenta vermelha', 'Gengibre', 'Arruda'],
    quizilas: ['Não pode comer quiabo', 'Não pode guardar segredos', 'Não pode ter medo'],
    misterio: 'Rainha das Tormentas e da Transformação',
    ebos: ['Galinha preta', 'Pimenta', 'Velas vermelhas e laranja'],
    numerologia: { caminhoVida: 6, destino: 6, alma: 6 },
    sefirot: ['Gevurah', 'Netzach'],
    tarot: ['O Louco', 'A Força', 'A Torre'],
    elemento: 'Fogo',
    qualidade: ['Coragem', 'Transformação', 'Rebeldia', 'Liberdade', 'Paixão'],
    desafios: ['Impulsividade', 'Irritabilidade', 'Rebeldia excessiva'],
    oracao: 'Iansã, senhora das tempestades, dá-me coragem para transformar minha vida e vencer medos.',
  },
  {
    id: 'obatala',
    nome: 'Obatalá',
    saudacao: 'Olofi!',
    elementos: ['Luz', 'Terra'],
    cores: ['Branco', 'Cinza', 'Prata'],
    dia: 'Sexta-feira',
    chakra: '6 - Frontal',
    planeta: 'Sol',
    ervas: ['Algodão', 'Girassol', 'Cravo'],
    quizilas: ['Não pode comer sal em excesso', 'Não pode dormir de dia', 'Não pode usar roupas pretas'],
    misterio: 'Rei da Criação, Senhor da Pureza',
    ebos: ['Canjica branca', 'Velas brancas', 'Farinha de milho'],
    numerologia: { caminhoVida: 7, destino: 7, alma: 7 },
    sefirot: ['Keter', 'Chokhmah'],
    tarot: ['O Hierofante', 'O Eremita', 'A Lua'],
    elemento: 'Luz',
    qualidade: ['Pureza', 'Sabedoria', ' Misericórdia', 'Criação', 'Altruísmo'],
    desafios: ['Tolerância excessiva', 'Procrastinação', 'Isolamento'],
    oracao: 'Obatalá, criador puro, dai-me a sabedoria para criar com equilíbrio e a misericórdia para ajudar.',
  },
  {
    id: 'omolu',
    nome: 'Omolu',
    saudacao: 'Aro!',
    elementos: ['Terra', 'Cinza'],
    cores: ['Preto', 'Vermelho', 'Marrom'],
    dia: 'Segunda-feira',
    chakra: '1 - Raiz',
    planeta: 'Saturno',
    ervas: ['Pau-cardeiro', 'Boldo', 'Sálvia'],
    quizilas: ['Não pode comer quiabo', 'Não pode fumar', 'Não pode ser ingrato'],
    misterio: 'Senhor das Doenças e da Cura',
    ebos: ['Pipoca', 'Velas pretas e vermelhas', 'Ervas de cura'],
    numerologia: { caminhoVida: 8, destino: 8, alma: 8 },
    sefirot: ['Binah', 'Malkuth'],
    tarot: ['A Morte', 'O Julgamento', 'A Torre'],
    elemento: 'Terra',
    qualidade: ['Cura', 'Transformação', 'Renovação', 'Resistência', 'Sabedoria'],
    desafios: ['Pessimismo', 'Medo', 'Rigidez'],
    oracao: 'Omolu, senhor da cura, purifica meu corpo e espírito de todas as doenças e malefícios.',
  },
  {
    id: 'oxossi',
    nome: 'Oxóssi',
    saudacao: 'Epa!',
    elementos: ['Ar', 'Floresta'],
    cores: ['Verde', 'Azul', 'Marrom'],
    dia: 'Terça-feira',
    chakra: '6 - Frontal',
    planeta: 'Mercúrio',
    ervas: ['Alecrim', 'Hortelã', 'Louro'],
    quizilas: ['Não pode comer lesma', 'Não pode ser preguiçoso', 'Não pode caçar com intenção má'],
    misterio: 'Senhor das Matas e da Caça',
    ebos: ['Velas verdes', 'Frutas', 'Cornos de animal'],
    numerologia: { caminhoVida: 9, destino: 9, alma: 9 },
    sefirot: ['Netzach', 'Hod'],
    tarot: ['O Hierofante', 'O Carro', 'A Estrela'],
    elemento: 'Ar',
    qualidade: ['Conhecimento', 'Sabedoria', 'Caça', 'Liberdade', 'Justiça'],
    desafios: ['Inveja', 'Vanglória', 'Avidez'],
    oracao: 'Oxóssi, senhor das matas, guia-me pelo caminho do conhecimento e da sabedoria verdadeira.',
  },
  {
    id: 'logunedede',
    nome: 'Logun-Edé',
    saudacao: 'Oê- ê!',
    elementos: ['Água', 'Fogo'],
    cores: ['Verde', 'Amarelo', 'Vermelho'],
    dia: 'Quinta-feira',
    chakra: '3 - Plexo Solar',
    planeta: 'Vênus',
    ervas: ['Manga', 'Cajú', 'Girassol'],
    quizilas: ['Não pode comer inhame', 'Não pode ser invejoso', 'Não pode ser parcial'],
    misterio: 'Orixá da Fertilidade e da Dança',
    ebos: ['Velas verde e amarela', 'Milho', 'Frutas tropicais'],
    numerologia: { caminhoVida: 11, destino: 11, alma: 11 },
    sefirot: ['Tiferet', 'Netzach'],
    tarot: ['A Imperatriz', 'O Carro', 'A Estrela'],
    elemento: 'Água',
    qualidade: ['Fertilidade', 'Dança', 'Juventude', 'Abundância', 'Versatilidade'],
    desafios: ['Imaturidade', 'Instabilidade', 'superficialidade'],
    oracao: 'Logun-Edé, senhor da fertilidade, abençoa minha vida com abundância e alegria dançante.',
  },
  {
    id: 'exu',
    nome: 'Exu',
    saudacao: 'Pai-Publicano!',
    elementos: ['Fogo', 'Ar'],
    cores: ['Preto', 'Vermelho', 'Marrom'],
    dia: 'Todo dia',
    chakra: '5 - Laríngeo',
    planeta: 'Mercúrio',
    ervas: ['Pimenta', 'Gengibre', 'Alho'],
    quizilas: ['Não pode ser ingrato', 'Não pode trapacear', 'Não pode omitir a verdade'],
    misterio: 'Mensageiro dos Orixás, Senhor dos Caminhos',
    ebos: ['Cachaça', 'Pirão de milho', 'Pimenta'],
    numerologia: { caminhoVida: 3, destino: 3, alma: 3 },
    sefirot: ['Hod'],
    tarot: ['O Louco', 'O Mago', 'Os Enamorados'],
    elemento: 'Fogo',
    qualidade: ['Comunicação', 'Liberdade', 'Pragmatismo', 'Flexibilidade', 'Energia'],
    desafios: ['Manipulação', 'Travessura', 'Irritação'],
    oracao: 'Exu, mensageiro divino, abre meus caminhos e permite que minhas mensagens sejam ouvidas.',
  },
  {
    id: 'nanaburuku',
    nome: 'Nanã Buruku',
    saudacao: 'Epa! Saluba!',
    elementos: ['Água', 'Lama'],
    cores: ['Azul', 'Branco', 'Roxo'],
    dia: 'Segunda-feira',
    chakra: '7 - Coronário',
    planeta: 'Saturno',
    ervas: ['Lama', 'Barro', 'Musgo'],
    quizilas: ['Não pode comer banana', 'Não pode ser soberbo', 'Não pode desrespeitar os antigos'],
    misterio: 'Ancientã dos Orixás, Senhora da Lama e da Morte',
    ebos: ['Lama sagrada', 'Velas azuis e roxas', 'Água de chuva'],
    numerologia: { caminhoVida: 11, destino: 11, alma: 11 },
    sefirot: ['Binah', 'Keter'],
    tarot: ['O Mundo', 'O Julgamento', 'A Lua'],
    elemento: 'Água',
    qualidade: ['Sabedoria ancestral', 'Morte e renascimento', 'Paciência', ' Humildade', 'Sustento'],
    desafios: ['Tristeza', 'Rigidez', 'Medo da mudança'],
    oracao: 'Nanã Buruku, anciã sagrada, ensina-me a sabedoria dos antigos e a aceitar a transformação.',
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const orixa = searchParams.get('orixa');
  const element = searchParams.get('element');
  const chakra = searchParams.get('chakra');
  const dia = searchParams.get('dia');

  let profiles = ORIXA_PROFILES;

  if (orixa) {
    const orixaLower = orixa.toLowerCase();
    const matched = profiles.find(
      (p) =>
        p.nome.toLowerCase() === orixaLower ||
        p.nome.toLowerCase().includes(orixaLower) ||
        p.id === orixaLower
    );

    if (!matched) {
      const suggestions = profiles
        .filter((p) => p.nome.toLowerCase().includes(orixaLower))
        .map((p) => p.nome);

      return NextResponse.json(
        {
          profile: null,
          error: 'Orixá não encontrado',
          suggestions: suggestions.length > 0 ? suggestions : profiles.map((p) => p.nome),
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile: matched });
  }

  if (element) {
    const elementLower = element.toLowerCase();
    profiles = profiles.filter((p) =>
      p.elementos.some((e) => e.toLowerCase().includes(elementLower)) ||
      p.elemento.toLowerCase().includes(elementLower)
    );
  }

  if (chakra) {
    const chakraMatch = chakra.replace(/[^0-9]/g, '');
    profiles = profiles.filter((p) => p.chakra.includes(chakraMatch));
  }

  if (dia) {
    const diaLower = dia.toLowerCase();
    profiles = profiles.filter((p) => p.dia.toLowerCase().includes(diaLower));
  }

  return NextResponse.json({
    profiles,
    meta: {
      total: profiles.length,
      filters: {
        element: element || null,
        chakra: chakra || null,
        dia: dia || null,
      },
    },
  });
}