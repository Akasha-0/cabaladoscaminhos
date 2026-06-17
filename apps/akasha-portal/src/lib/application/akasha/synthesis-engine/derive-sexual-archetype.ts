/**
 * synthesis-engine/derive-sexual-archetype.ts
 *
 * F-225: Perfil sexual profundo baseado em corpo tântrico, Lilith, Vênus,
 * Marte, Casa 8 e Odu. Split de synthesis-engine.ts.
 */

import type { AstrologyMap, KabalisticMap, TantricMap, OduBirth } from '@akasha/types';
import type { SexualArchetype, SexualFetish, SexualHiddenDesire } from './synthesis-types';

const TANTRA_SEXUAL_ARCHETYPES: Record<number, { name: string; base: string; desirePattern: string }> = {
  1:  { name: 'Alma Primordial', base: 'Puramente instintivo, busca fusão total com a energia', desirePattern: 'Busca reconectar com a essência — sente falta de profundidade em tudo' },
  2:  { name: 'Criador Sagrado', base: 'Sexualidade como criação — fogo interno intenso de gerar', desirePattern: 'Deseja criar, construir, plantar — frustra-se quando não pode gerar' },
  3:  { name: 'Mente Quádrupla', base: 'Variação constante, curiosidade erótica ilimitada', desirePattern: 'Busca novidade, estímulos — teme o tédio acima de tudo' },
  4:  { name: 'Estabilidade Terrestre', base: 'Poder de atração gravitacional, conexão profunda com o corpo', desirePattern: 'Quer posse, segurança, marcar território — teme perder o que conquistou' },
  5:  { name: 'Intelecto Sagrado', base: 'Sedução mental, palavras como afrodisíaco', desirePattern: 'Sente que se não entender não se entrega — precisa decifrar para sentir' },
  6:  { name: 'Harmonia dos Opostos', base: 'Busca equilíbrio entre dar e receber no corpo a corpo', desirePattern: 'Oscila entre sacrifício e exigência — não sabe receber sem sentir culpa' },
  7:  { name: 'Mente Invertida', base: 'Sexualidade como transcendência, corpo como veículo', desirePattern: 'Transmuta desejo em espiritualidade — teme a matéria e a carne' },
  8:  { name: 'Poder do Abismo', base: 'Intensidade máxima, limites como território sagrado', desirePattern: 'Quer posse total, controle, profundidade — teme ser dominada' },
  9:  { name: 'Amor Universal', base: 'Compromisso total, sexualidade como oferenda', desirePattern: 'Deseja fundir-se, pertencer, servir — frustra-se com a superficialidade' },
  10: { name: 'Vontade Inabalável', base: 'Sexualidade como afirmação de poder e presença', desirePattern: 'Quer ser reconhecido, admirado, seguido — teme a invisibilidade' },
  11: { name: 'Luz da Renovação', base: 'Transformação permanente, sexualidade como renascimento', desirePattern: 'Liberta-se de padrões, busca o novo — teme ficar presa ao velho' },
};

const LILITH_DESIRES: Record<string, { fantasy: string; trigger: string; description: string }> = {
  aries:       { fantasy: 'Guerreira Sexual', trigger: 'Confronto, resistência, adrenalina', description: 'Você é ativada quando sente oposição — quanto mais resistem, mais quer. Seu desejo é ser conquistada à força de um guerreiro.' },
  touro:       { fantasy: 'Sacrário da Carne', trigger: 'Texturas, aromas, presença física dominante', description: 'Você é ativada pela matéria — precisa sentir o corpo inteiro. Seu desejo é ser devorada com paciência e fome.' },
  gemeos:      { fantasy: 'Mente Erótica', trigger: 'Conversas proibidas, palavras cruzadas com duplo sentido', description: 'Você é ativada pela mente — precisa de história, mistério. Seu desejo é ser decifrada.' },
  cancer:      { fantasy: 'Útero Cósmico', trigger: 'Proteção, cuidado prévio, segurança emocional', description: 'Você é ativada quando se sente em casa — antes de qualquer coisa. Seu desejo é ser acolhida antes de ser desejada.' },
  leo:         { fantasy: 'Espetáculo Sagrado', trigger: 'Admiração, plateia, ser o centro do desejo do outro', description: 'Você é ativada pela adoração — precisa ser vista como extraordinária. Seu desejo é ser a fantasia de alguém.' },
  virgem:      { fantasy: 'Serva Mestra', trigger: 'Dedicação, atenção ao detalhe, ordem como prélúdio', description: 'Você é ativada pelo cuidado meticuloso — precisa de limpeza, preparo. Seu desejo é ser servida com perfeição.' },
  libra:       { fantasy: 'Juíza dos Prazeres', trigger: 'Beleza, harmonia, atmosfera, préludio longo', description: 'Você é ativada pela estética — precisa de atmosfera, ritmo. Seu desejo é ser a experiência mais refinada.' },
  escorpiao:   { fantasy: 'Senhora do Abismo', trigger: 'Profundidade, segredos, destruição como prélúdio', description: 'Você é ativada pelo que é proibido — precisa de mistério e intensidade. Seu desejo é ser conhecedora absoluta do outro.' },
  sagitario:   { fantasy: 'Sacerdotisa Viajante', trigger: 'Viagem, aventura, diálogo filosófico, expansão', description: 'Você é ativada pela perspectiva ampla — precisa de sentido. Seu desejo é ser levada para novos mundos.' },
  capricornio: { fantasy: 'Imperatriz do Poder', trigger: 'Status, controle, reconhecimento de posição', description: 'Você é ativada pelo poder — precisa de alguém que também é alguém. Seu desejo é ser a consorte do rei.' },
  aquario:     { fantasy: 'Alquimista do Coletivo', trigger: 'Ideias inovadoras, causa social, rebeldia compartilhada', description: 'Você é ativada pela causa — precisa de propósito compartilhado. Seu desejo é transcender o pessoal.' },
  peixes:      { fantasy: 'Oceano Vermelho', trigger: 'Dissolução de limites, música, estado alterado', description: 'Você é ativada pela dissolução — precisa de estado alterado para gozar. Seu desejo é fundir-se no infinito.' },
};

const VENUS_VALUES: Record<string, string> = {
  aries: 'atuação direta, conquista, pioneirismo',
  touro: 'prazer sensorial, estabilidade, posse',
  gemeos: 'comunicação, variação, intelectual',
  cancer: 'segurança emocional, família, intimidade',
  leo: 'adoração, criação, reconhecimento',
  virgem: 'qualidade, saúde, utilidade',
  libra: 'harmonia, beleza, parceria',
  escorpiao: 'profundidade, intensidade, mistério',
  sagitario: 'liberdade, expansão, aventuras',
  capricornio: 'status, ambição, compromisso',
  aquario: 'originalidade, liberdade, amizade',
  peixes: 'completo, romantismo, transcendência',
};

const MARS_STYLES: Record<string, string> = {
  aries: 'direto, impaciente, conquista rápida',
  touro: 'persistente, cálido, possessivo',
  gemeos: 'versátil, curioso, sedução verbal',
  cancer: 'indireto, emocional, proteção como prélúdio',
  leo: 'dramático, generoso, teatral',
  virgem: 'preciso, crítico, preparo como prélúdio',
  libra: 'indireto, encantador, evita confronto',
  escorpiao: 'intenso, demorado, obsessivo',
  sagitario: 'aventureiro, honesto, direto',
  capricornio: 'estratégico, focado, paciente',
  aquario: 'imprevisível, intelectual, distante',
  peixes: 'difuso, emocional, difícil de localizar',
};

const BODY_FETISHES: Record<number, SexualFetish[]> = {
  1:  [{ type: 'Fusão Energética', description: 'Desaparecer o ego no outro — ser possuída pela energia, não pelo corpo', chakraRelated: 'Sahasrara (coroa)' }],
  2:  [{ type: 'Poder Criativo', description: 'Sexualidade como criação — precisa gerar algo, alguém, uma experiência nova', chakraRelated: 'Svadhisthana (sacro)' }],
  3:  [{ type: 'Variedade Divina', description: 'Colecionar experiências — cada parceiro é um capítulo diferente', chakraRelated: 'Manipura (plexo)' }],
  4:  [{ type: 'Templo Terrestre', description: 'O corpo como altar — exige devoção ao corpo e à matéria', chakraRelated: 'Muladhara (raiz)' }],
  5:  [{ type: 'Jogo Mental', description: 'Dominação intelectual — precisa ganhar do outro mentalmente primeiro', chakraRelated: 'Vishuddha (garganta)' }],
  6:  [{ type: 'Ordem como Prelúdio', description: 'Ambiente perfeito, ritual prévio, controle como linguagem', chakraRelated: 'Ajna (terceiro olho)' }],
  7:  [{ type: 'Transcendência', description: 'Transmutar o sexual em espiritual — o corpo como veículo de sagrado', chakraRelated: 'Sahasrara (coroa)' }],
  8:  [{ type: 'Poder Total', description: 'Conhecer o outro até o osso — intimidade como investigação', chakraRelated: 'Svadhisthana (sacro)' }],
  9:  [{ type: 'Entrega Total', description: 'Abandono completo — entrega sem reserva, totalidade da fusão', chakraRelated: 'Anahata (coração)' }],
  10: [{ type: 'Reconhecimento', description: 'Ser desejada pelo que representa, não só pelo que faz — status como afrodisíaco', chakraRelated: 'Manipura (plexo)' }],
  11: [{ type: 'Renovação', description: 'Destruição criativa — precisa queimar o padrão anterior a cada encontro', chakraRelated: 'Sahasrara (coroa)' }],
};

export function deriveSexualArchetype(
  astro: AstrologyMap | null,
  _kab: KabalisticMap | null,
  tantra: TantricMap | null,
  odu: OduBirth | null
): SexualArchetype {
  const bodyNum = tantra?.bodies?.fisico?.number ?? 5;
  const soulBody = tantra?.soulBody ?? 5;
  const bodyDesc = tantra?.bodies?.fisico?.description ?? '';
  const soulDesc = tantra?.soulDescription ?? '';

  const lilithSign = (astro as any)?.planets?.find((p: any) =>
    p.planet === 'Lilith' || p.planet === 'Asteroides'
  )?.sign ?? '';
  const venusSign = (astro as any)?.planets?.find((p: any) =>
    p.planet === 'Venus' || p.planet === 'Venus'
  )?.sign ?? '';
  const marsSign = (astro as any)?.planets?.find((p: any) =>
    p.planet === 'Mars' || p.planet === 'Marte'
  )?.sign ?? '';
  const casa8Sign = (astro as any)?.houses?.find((h: any) => h.house === 8)?.sign ?? '';
  const oduForce = odu?.elementalForce ?? odu?.oduName ?? String(odu?.oduNumber ?? '');

  const baseArchetype = TANTRA_SEXUAL_ARCHETYPES[bodyNum] ?? TANTRA_SEXUAL_ARCHETYPES[5];
  const lilithData = LILITH_DESIRES[lilithSign.toLowerCase()] ?? LILITH_DESIRES['escorpiao'];
  const baseFetishes = BODY_FETISHES[bodyNum] ?? BODY_FETISHES[5];
  const lilithFetish: SexualFetish = {
    type: `Escravidão do ${lilithData.fantasy}`,
    description: `Lilith em ${lilithSign || 'Escorpião'} ativa o desejo de ${lilithData.trigger.toLowerCase()} — ${lilithData.description.split('.')[0].toLowerCase()}.`,
    chakraRelated: 'Muladhara + Svadhisthana (raiz + sacro)',
  };

  const hiddenDesires: SexualHiddenDesire[] = [
    {
      desire: 'Ser completamente conhecida (não apenas desejada)',
      fear: 'De ser explorada se mostrar a verdade do desejo',
      healing: 'Quando aceita que ser conhecida é mais íntimo que ser possuída, sua sexualidade se transforma em poder de cura.',
    },
    {
      desire: `Aprofundar através de ${casa8Sign || 'intimidade transformadora'}`,
      fear: `A intensidade de ${casa8Sign || 'profundidade'} que emerge na intimidade`,
      healing: 'Quando para de temer a profundidade e aceita que o outro pode segurar sua intensidade, o sexo vira experiência de renascimento.',
    },
  ];

  const turnOn = [
    `Corpo tântrico ${soulBody}: ${soulDesc || baseArchetype.base}`,
    venusSign  ? `Venus em ${venusSign}: ${VENUS_VALUES[venusSign.toLowerCase()] || 'valoriza a profundidade'}` : '',
    marsSign   ? `Marte em ${marsSign}: age com ${MARS_STYLES[marsSign.toLowerCase()] || 'intensidade'}` : '',
    lilithSign ? `Lilith em ${lilithSign}: ativada por ${lilithData.trigger.toLowerCase()}` : '',
    oduForce   ? `Odu ${oduForce}: força elemental sexual` : '',
  ].filter(Boolean);

  const turnOff = [
    'Superficialidade — ser tratada como objeto sem profundidade',
    'Pressa — não ter tempo para aquecer e criar intimidade',
    'Comparação — ser medida contra outra pessoa',
    'Indiferença — parceiro que não demonstra interesse genuíno',
    bodyNum >= 7 ? 'Excesso de razão — parceiro que só quer entender, não sentir' : 'Excesso de matéria — parceiro que ignora a dimensão espiritual',
  ];

  const relationshipPattern = `No íntimo, você ${baseArchetype.desirePattern.split('—')[1]?.trim() || 'busca profundidade acima de tudo'}. Com Venus em ${venusSign || 'desconhecido'}: ${VENUS_VALUES[venusSign?.toLowerCase()] || 'busca conexão genuína'}. Com Marte em ${marsSign || 'desconhecido'}: ${MARS_STYLES[marsSign?.toLowerCase()] || 'age com intensidade'}.`;

  const transformationKey = `A chave da sua sexualidade é integrar o ${baseArchetype.name} com Lilith em ${lilithSign || 'Escorpião'}. Quando você para de usar a sexualidade para controlar ou preencher vazios, e começa a usá-la para ${soulBody >= 7 ? 'transcender o corpo e acessar a essência' : soulBody >= 4 ? 'criar vínculo e pertencimento' : 'reconectar com a energia primordial'}, você ativa o Dom (Gift) do seu corpo tântrico.`;

  return {
    name: `${baseArchetype.name}${lilithSign ? ` × Lilith em ${lilithSign}` : ''}`,
    description: `Você é ${baseArchetype.name.toLowerCase()}. ${baseArchetype.base}. Lilith em ${lilithSign || 'Escorpião'} ativa em você um padrão de desejo oculto: ${lilithData.description} No fundo, você busca ${hiddenDesires[0].desire.toLowerCase()}.`,
    bodyTantric: `Corpo ${bodyNum}/11: ${bodyDesc || baseArchetype.base}`,
    desirePattern: baseArchetype.desirePattern,
    fantasy: {
      archetype: lilithData.fantasy,
      description: lilithData.description,
      trigger: `Você é ativada quando ${lilithData.trigger.toLowerCase()}.`,
    },
    fetishes: [lilithFetish, ...baseFetishes],
    hiddenDesires,
    turnOn,
    turnOff,
    relationshipPattern,
    transformationKey,
  };
}
