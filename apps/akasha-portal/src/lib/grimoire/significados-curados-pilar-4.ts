/**
 * Significados Curados — Pilar 4 · Odu (F-219, F-220)
 *
 * 16 Odu principais (Ifá/Candomblé) com `requer_terreiro: true`.
 *
 * ⚠️ R-022 §4.4: interpretação profunda requer terreiro + consentimento.
 * Aqui oferecemos APENAS o nome e a essência geral, com `requer_terreiro:true`.
 *
 * IDs sincronizados com ODUS_IFA em @akasha/core-odus/odus-ifa-data.ts
 * (fonte canônica retornada por `calculateBirthOdu`).
 *
 * Fontes (axioma 4 VISION §3):
 * - Verger, *Orixás* (1973).
 * - Mbiti, *African Religions and Philosophy* (1969).
 *
 * Princípios editoriais:
 * - PT-BR primeiro (Axioma 8).
 * - Cada `essencia` ≤22 palavras. Cada `pratica` 1 linha de UI.
 * - Citação obrigatória (Axioma 4).
 * - Ética Ifá: jamais substituir terreiro/babalaô (R-022 §4.4).
 */
import type { SignificadoCurado } from './significados-curados';

const PILAR_4: SignificadoCurado[] = [
  {
    id: 'Ogbe',
    pilar: 'odu',
    titulo: 'Odu Ogbe (Oxé)',
    essencia: 'Luz, origem, criação, renovação. Odu da abertura — clareza que já mora em você.',
    missao: 'Comece com verdade. Recomece com fé; a luz já apontou o caminho.',
    sombra: 'Vaidade, autossuficiência, desprezar o começo.',
    pratica: 'Agradeça ao sol ao amanhecer. 1 minuto de silêncio voltado ao leste.',
    conexao: 'Ogbe fala com Sol em Leão (P2) e Pioneiro (P1·1).',
    fonte: 'Verger 1973; Mbiti 1969',
    requer_terreiro: true,
  },
  {
    id: 'Ejiokô',
    pilar: 'odu',
    titulo: 'Odu Ejiokô',
    essencia: 'Dualidade, parceria, movimento. O início da jornada em par.',
    missao: 'Busque o par certo. A força está na união — não duplique conflitos.',
    sombra: 'Decisões tomadas sozinho, fusão que perde a si.',
    pratica: 'Antes de uma decisão hoje, ouça 1 pessoa de confiança. Não ceda — apenas ouça.',
    conexao: 'Ejiokô fala com Ibeji/Ogum (P2) e Diplomata (P1·2).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Etogundá',
    pilar: 'odu',
    titulo: 'Odu Etogundá',
    essencia: 'Batalha, conquista, abertura de caminhos. Força com ética.',
    missao: 'Avance com coragem. Abra o caminho à força — mas sem violência fútil.',
    sombra: 'Recuar na luta justa, agressividade sem propósito.',
    pratica: 'Identifique 1 batalha sua atual. Pergunte: é justa? avance.',
    conexao: 'Etogundá fala com Ogum (P2) e Pioneiro (P1·1).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Irosun',
    pilar: 'odu',
    titulo: 'Odu Irosun',
    essencia: 'Atenção, cuidado, alerta. O Odu do aviso — intuição e pressentimento.',
    missao: 'Mantenha vigilância. Confie na intuição; proteja o que é seu.',
    sombra: 'Desconfiança crônica, ver traição onde há só movimento.',
    pratica: 'Hoje, antes de aceitar 1 convite, sinta o corpo. Se apertar, recuse.',
    conexao: 'Irosun fala com Lua Minguante (P2) e Mente Negativa (P3·2).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Oxê',
    pilar: 'odu',
    titulo: 'Odu Oxê',
    essencia: 'Beleza, amor, fertilidade, magnetismo. A doçura que atrai a bênção.',
    missao: 'Ame e crie. Sua doçura atrai a bênção — não use o charme para enganar.',
    sombra: 'Vaidade, dependência afetiva, beleza como máscara.',
    pratica: 'Cultive amor próprio 5 min. Banho, espelho, frase: "mereço cuidado porque sim".',
    conexao: 'Oxê fala com Oxum (P2), Corpo Radiante (P3·10) e Realizador (P1·8).',
    fonte: 'Verger 1973; ODUS_IFA',
    requer_terreiro: true,
  },
  {
    id: 'Obará',
    pilar: 'odu',
    titulo: 'Odu Obará',
    essencia: 'Riqueza, glória, fartura. A abundância que chega quando se sabe administrar.',
    missao: 'A fartura chega. Administre com sabedoria — sem desperdiçar nem ostentar.',
    sombra: 'Ganância, ostentação, riqueza como identidade.',
    pratica: 'Separe 1 min para agradecer o que já tem. Liste 3 farturas atuais.',
    conexao: 'Obará fala com Xangô/Oxóssi (P2) e Realizador (P1·8).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Odi',
    pilar: 'odu',
    titulo: 'Odu Odi',
    essencia: 'Segredos, transformação, limpeza. O Odu do mistério e do renascimento.',
    missao: 'Limpe-se. O oculto se resolve; o segredo guardado apodrece.',
    sombra: 'Magnetizar conflito, vitimização, fugir da luz.',
    pratica: 'Guarde 1 segredo seu por escrito. Depois queime ou enterre o papel.',
    conexao: 'Odi fala com Escorpião (P2) e Corpo Sutil (P3·9).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Ejionile',
    pilar: 'odu',
    titulo: 'Odu Ejionile',
    essencia: 'Justiça, liderança, vitória. O Odu do trono e da força que protege.',
    missao: 'Lidere com retidão. A justiça é seu trono — sem arrogância.',
    sombra: 'Injustiça, autoritarismo, força que oprime.',
    pratica: 'Use sua autoridade 1 vez hoje para proteger, não para punir.',
    conexao: 'Ejionile fala com Xangô/Oxalá (P2) e Guardião (P1·6).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Ossá',
    pilar: 'odu',
    titulo: 'Odu Ossá',
    essencia: 'Proteção feminina, sabedoria, turbulência. O Odu do vento e da tempestade.',
    missao: 'Acolha a proteção; a sabedoria acalma o vento.',
    sombra: 'Tempestade emocional, fofoca, drama sem centro.',
    pratica: 'Respire 4-7-8 três vezes quando a tempestade subir hoje.',
    conexao: 'Ossá fala com Iemanjá/Oyá (P2) e Mente Neutra (P3·4).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Ofun',
    pilar: 'odu',
    titulo: 'Odu Ofun',
    essencia: 'Espiritualidade profunda, equilíbrio mental. O Odu do silêncio que cura.',
    missao: 'Aquiete a mente. O equilíbrio é seu remédio — não negligencie o espírito.',
    sombra: 'Excesso mental, frieza espiritual, espiritualidade como fuga.',
    pratica: 'Reserve 30 min em silêncio total. Sem música, sem tela, sem palavras.',
    conexao: 'Ofun fala com Oxalufan/Oxalá (P2) e Buscador (P1·7).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Owonrin',
    pilar: 'odu',
    titulo: 'Odu Owonrin',
    essencia: 'Encruzilhada, decisão, transição. O Odu do caminho estreito.',
    missao: 'Escolha. O caminho se faz ao caminhar — não há mapa sem movimento.',
    sombra: 'Indecisão, medo de errar, paralisia na encruzilhada.',
    pratica: 'Tome 1 decisão que você vem adiando. Em 5 minutos, decida.',
    conexao: 'Owonrin fala com Libertador (P1·5) e Sagitário (P2).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Ejilaxebô',
    pilar: 'odu',
    titulo: 'Odu Ejilaxebô',
    essencia: 'Honra, proteção, caminho aberto. O Odu da palavra que vale.',
    missao: 'O caminho está aberto. Siga com honra — sem deslealdade.',
    sombra: 'Deslealdade, palavra quebrada, honra como fachada.',
    pratica: 'Cumpra 1 promessa hoje, mesmo que pequena. Palavra honrada abre caminhos.',
    conexao: 'Ejilaxebô fala com Ogum/Oxum (P2) e Guardião (P1·6).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Oturupon',
    pilar: 'odu',
    titulo: 'Odu Oturupon',
    essencia: 'Cura, purificação, ancestralidade. O Odu do que precisa ser atravessado.',
    missao: 'Atravesse. A prova é a cura. A travessia, o remédio.',
    sombra: 'Vitimismo, identificação com a dor, recusar o movimento.',
    pratica: 'Identifique 1 prova sua atual. Pergunte: o que ela quer me ensinar?',
    conexao: 'Oturupon fala com Omolu/Nanã (P2) e Mente Neutra (P3·4).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Oturá',
    pilar: 'odu',
    titulo: 'Odu Oturá',
    essencia: 'Paz, benevolência, proteção divina. O Odu da paz que cobre.',
    missao: 'Mantenha a paz. A proteção divina te cobre — não rompa o que está protegido.',
    sombra: 'Conflito desnecessário, paz como covardia, passividade.',
    pratica: 'Hoje, escolha 1 conflito menor: encerre com paz, mesmo que doa.',
    conexao: 'Oturá fala com Oxalá/Iemanjá (P2) e Humanista (P1·9).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Iká',
    pilar: 'odu',
    titulo: 'Odu Iká',
    essencia: 'Poder, estratégia, responsabilidade. O Odu da espada que corta com justiça.',
    missao: 'Use o poder com estratégia. O poder é sagrado — não abuse nem fuja dele.',
    sombra: 'Irresponsabilidade, abuso de poder, estratégia sem ética.',
    pratica: 'Liste 3 poderes seus. Para cada um, escreva 1 uso responsável desta semana.',
    conexao: 'Iká fala com Xangô/Oxum (P2) e Realizador (P1·8).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
  {
    id: 'Ofurufu',
    pilar: 'odu',
    titulo: 'Odu Ofurufu',
    essencia: 'Completude, totalidade, bênção universal. O Odu do ciclo fechado.',
    missao: 'A bênção é plena. Agradeça e partilhe — não desperdice a graça.',
    sombra: 'Presunção, desperdício da graça, fechar-se ao novo.',
    pratica: 'Em 3 frases, complete: "Recebi a bênção de… e ofereço…".',
    conexao: 'Ofurufu fala com Oxalá/Todos (P2) e Humanista (P1·9).',
    fonte: 'Verger 1973',
    requer_terreiro: true,
  },
];

export const PILAR_4_SERIES: SignificadoCurado[] = PILAR_4;
