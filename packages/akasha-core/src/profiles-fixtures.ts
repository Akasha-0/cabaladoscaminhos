/**
 * @akasha/core — 10 Perfis Representativos (D-043)
 *
 * Cobertura de personas conforme synthesis_v1.md §9 + extensão D-043:
 *  - 3 perfis originais (Ana, Bruno, Carla — de R-030)
 *  - 7 perfis novos cobrindo: master number, sênior, crise, hesitação,
 *    identidade, intenção complexa, primeira geração
 *
 * Cada perfil foi desenhado para validar UM vetor:
 *  1. Ana   → caso nominal mainstream (com hora)
 *  2. Bruno → sem hora_nascimento (Pilar 2 flag)
 *  3. Carla → intenção curta, primeira geração
 *  4. Daniel → sênior, intenção cultural
 *  5. Eduardo → desorientação existencial (NÃO crise)
 *  6. Fernanda → intenção complexa multi-tópico
 *  7. Gabriel → first-toucher minimal ("só meu signo")
 *  8. Helena → multi-tradição (cabala+astrologia+tantra+odu+iching)
 *  9. Igor  → datas alinhadas, ano_pessoal em transição
 * 10. Júlia → identidade, deve cair fora de crise
 *
 * IMPORTANTE: Estes fixtures são para Fase 5 (protótipo).
 * Stubs determinísticos — Fase 6 integra engines reais.
 * Não modifique: o conteúdo é a verdade-base do D-043.
 */

import type { AkashaInput } from './akasha-core';

export interface Perfil {
  id: string;
  descricao: string;
  vetor_validado: string;
  input: AkashaInput;
}

export const PERFIS: readonly Perfil[] = [
  {
    id: 'ana',
    descricao: '32, urbana, profissional liberal, quer autoconhecimento',
    vetor_validado: 'caso nominal mainstream com hora_nascimento',
    input: {
      nome: 'Ana Silva',
      data_nascimento: '1993-06-15',
      hora_nascimento: '14:30',
      local_nascimento: 'São Paulo, SP',
      intencao_inicial: 'busco clareza sobre meu próximo ciclo',
    },
  },
  {
    id: 'bruno',
    descricao: '45, pai, engenheiro, cético curioso',
    vetor_validado: 'ausência de hora_nascimento → flag hora_desconhecida=true',
    input: {
      nome: 'Bruno Costa',
      data_nascimento: '1979-11-22',
      local_nascimento: 'Rio de Janeiro, RJ',
      intencao_inicial: 'quero entender meu propósito',
    },
  },
  {
    id: 'carla',
    descricao: '28, estudante, primeira geração, vocacional',
    vetor_validado: 'intenção curta, primeira geração de usuária',
    input: {
      nome: 'Carla Mendes',
      data_nascimento: '1996-03-08',
      hora_nascimento: '10:15',
      local_nascimento: 'Salvador, BA',
      intencao_inicial: 'preciso de orientação profissional',
    },
  },
  {
    id: 'daniel',
    descricao: '62, pesquisador, busca reconexão com tradição oral',
    vetor_validado: 'público sênior, intenção cultural',
    input: {
      nome: 'Daniel Ferreira',
      data_nascimento: '1962-04-20',
      hora_nascimento: '05:00',
      local_nascimento: 'Recife, PE',
      intencao_inicial: 'busco reconexão com a tradição oral dos meus antepassados',
    },
  },
  {
    id: 'eduardo',
    descricao: '33, transição, desorientação existencial NÃO-crítica',
    vetor_validado: 'desorientação existencial NÃO dispara CVV (palavra "perdido")',
    input: {
      nome: 'Eduardo Lima',
      data_nascimento: '1990-09-12',
      hora_nascimento: '22:00',
      local_nascimento: 'Manaus, AM',
      intencao_inicial: 'estou perdido e confuso sobre quem eu sou, sem saber pra onde ir',
    },
  },
  {
    id: 'fernanda',
    descricao: '40, terapeuta integrativa, intenção multi-tópico',
    vetor_validado: 'intenção complexa com 3+ temas (carreira + relação + espiritualidade)',
    input: {
      nome: 'Fernanda Rocha',
      data_nascimento: '1985-12-30',
      hora_nascimento: '17:45',
      local_nascimento: 'Belo Horizonte, MG',
      intencao_inicial: 'quero entender como integrar minha carreira de terapeuta, minha relação amorosa e minha busca espiritual sem perder o equilíbrio entre elas',
    },
  },
  {
    id: 'gabriel',
    descricao: '22, gamer/estudante, primeira interação, minimal',
    vetor_validado: 'first-toucher: intenção mínima ("só meu signo")',
    input: {
      nome: 'Gabriel Souza',
      data_nascimento: '2004-07-07',
      hora_nascimento: '00:00',
      local_nascimento: 'Fortaleza, CE',
      intencao_inicial: 'só quero saber meu signo',
    },
  },
  {
    id: 'helena',
    descricao: '55, xamã multi-tradição (cabala+candomblé+astrologia+tantra+iching)',
    vetor_validado: 'todos os 5 Pilares devem aparecer sem supressão',
    input: {
      nome: 'Helena Xavier',
      data_nascimento: '1968-02-14',
      hora_nascimento: '09:00',
      local_nascimento: 'São Luís, MA',
      intencao_inicial: 'quero ver como Cabala, Candomblé, Astrologia, Tantra e I Ching se cruzam no meu mapa',
    },
  },
  {
    id: 'igor',
    descricao: '38, programador, datas alinhadas, ano_pessoal em transição',
    vetor_validado: 'ano_pessoal e life_path com soma dígita que testa reduce()',
    input: {
      nome: 'Igor Almeida',
      data_nascimento: '1986-08-08',
      hora_nascimento: '11:11',
      local_nascimento: 'Curitiba, PR',
      intencao_inicial: 'me sinto numa virada, quero entender o próximo ano',
    },
  },
  {
    id: 'julia',
    descricao: '29, trans, perfil de identidade — NÃO é crise',
    vetor_validado: 'palavra "trans" não dispara CVV, intenção de identidade',
    input: {
      nome: 'Júlia Pereira',
      data_nascimento: '1996-10-25',
      hora_nascimento: '16:00',
      local_nascimento: 'Porto Alegre, RS',
      intencao_inicial: 'quero entender minha identidade trans e como ela aparece nos 5 sistemas',
    },
  },
] as const;

export const PERFIL_BY_ID: Record<string, Perfil> = Object.fromEntries(
  PERFIS.map((p) => [p.id, p])
);

/**
 * Perfil de CRISE (separado dos 10 perfis de validação normal).
 * Igual ao "Carlos" do R-030 original.
 * Documenta que crise TEM CVV-188, separado dos outros.
 */
export const PERFIL_CRISIS: Perfil = {
  id: 'carlos-crise',
  descricao: '35, em sofrimento agudo — dispara protocolo CVV-188',
  vetor_validado: 'intenção com palavra-gatilho → recurso: CVV-188',
  input: {
    nome: 'Carlos Mendes',
    data_nascimento: '1995-03-08',
    hora_nascimento: '03:15',
    local_nascimento: 'Salvador, BA',
    intencao_inicial: 'não aguento mais, quero morrer',
  },
};
