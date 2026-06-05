const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '../grimoire');
const subDirs = ['botanica', 'vibracional', 'ancestral', 'diagnostico'];

// Create directories
subDirs.forEach(dir => {
  const dirPath = path.join(baseDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
});

const odus = [
  {
    numero: 1,
    nome: "Ogbe",
    orixas: "Oxalá",
    essencia: "Luz, origem, criação, renovação",
    quizila: "Não pular etapas; não desprezar o começo.",
    conselho: "Recomece com fé; a luz já apontou o caminho."
  },
  {
    numero: 2,
    nome: "Ejiokô",
    orixas: "Ibeji, Ogum",
    essencia: "Dualidade, movimento, parcerias",
    quizila: "Evitar decisões sozinho; não duplicar conflitos.",
    conselho: "Busque o par certo; a força está na união."
  },
  {
    numero: 3,
    nome: "Etogundá",
    orixas: "Ogum, Ogun",
    essencia: "Batalha, conquista, abertura de caminhos",
    quizila: "Não recuar na luta justa; evitar violência fútil.",
    conselho: "Avance com coragem; abra o caminho à força."
  },
  {
    numero: 4,
    nome: "Irosun",
    orixas: "Oxum, Iemanjá",
    essencia: "Atenção, sangue, cuidado com traições",
    quizila: "Cuidado com o que se come e com falsos amigos.",
    conselho: "Atenção redobrada; proteja o que é seu."
  },
  {
    numero: 5,
    nome: "Oxê",
    orixas: "Oxum, Iemanjá",
    essencia: "Beleza, amor, fertilidade, magnetismo",
    quizila: "Não usar o charme para enganar; evitar vaidade.",
    conselho: "Ame e crie; sua doçura atrai a bênção."
  },
  {
    numero: 6,
    nome: "Obará",
    orixas: "Xangô, Oxóssi",
    essencia: "Riqueza, glória, abundância, fartura",
    quizila: "Não desperdiçar; evitar ganância e ostentação.",
    conselho: "Aartura chega; administre com sabedoria."
  },
  {
    numero: 7,
    nome: "Odi",
    orixas: "Exu, Omolu",
    essencia: "Segredos, transformação, cautela, limpeza",
    quizila: "Guardar segredos; evitar lugares e companhias densas.",
    conselho: "Limpe-se e transforme; o oculto se resolve."
  },
  {
    numero: 8,
    nome: "Ejionile",
    orixas: "Xangô, Oxalá",
    essencia: "Justiça, liderança, força, vitória",
    quizila: "Não ser injusto; evitar arrogância no poder.",
    conselho: "Lidere com retidão; a justiça é seu trono."
  },
  {
    numero: 9,
    nome: "Ossá",
    orixas: "Iemanjá, Oyá",
    essencia: "Proteção feminina, sabedoria, turbulência",
    quizila: "Cuidado com tempestades emocionais; evitar fofoca.",
    conselho: "Acolha a proteção; a sabedoria acalma o vento."
  },
  {
    numero: 10,
    nome: "Ofun",
    orixas: "Oxalufan, Oxalá",
    essencia: "Espiritualidade profunda, equilíbrio mental",
    quizila: "Não negligenciar o espírito; evitar excesso mental.",
    conselho: "Aquiete a mente; o equilíbrio é seu remédio."
  },
  {
    numero: 11,
    nome: "Owarin",
    orixas: "Exu, Oyá",
    essencia: "Dinâmica, perigo, astúcia, movimento rápido",
    quizila: "Cuidado com a pressa e o risco; evitar atalhos.",
    conselho: "Mova-se com astúcia, mas não corra cego."
  },
  {
    numero: 12,
    nome: "Ejilaxebô",
    orixas: "Ogum, Oxum",
    essencia: "Honra, proteção, caminho aberto",
    quizila: "Honrar a palavra; evitar deslealdade.",
    conselho: "O caminho está aberto; siga com honra."
  },
  {
    numero: 13,
    nome: "Oturupon",
    orixas: "Omolu, Nanã",
    essencia: "Cura, purificação, ancestralidade",
    quizila: "Cuidar da saúde e dos ancestrais; evitar negligência.",
    conselho: "Cure as raízes; a ancestralidade te sustenta."
  },
  {
    numero: 14,
    nome: "Oturá",
    orixas: "Oxalá, Iemanjá",
    essencia: "Paz, benevolência, proteção divina",
    quizila: "Não romper a paz; evitar conflito desnecessário.",
    conselho: "Mantenha a paz; a proteção divina te cobre."
  },
  {
    numero: 15,
    nome: "Iká",
    orixas: "Xangô, Oxum",
    essencia: "Poder, estratégia, responsabilidade",
    quizila: "Não abusar do poder; evitar irresponsabilidade.",
    conselho: "Use o poder com estratégia e responsabilidade."
  },
  {
    numero: 16,
    nome: "Ofurufu",
    orixas: "Oxalá, Todos os Orixás",
    essencia: "Completude, totalidade, bênção universal",
    quizila: "Não desperdiçar a graça; manter humildade.",
    conselho: "A bênção é plena; agradeça e partilhe."
  }
];

// Write Odu files
odus.forEach(odu => {
  const filename = `odu-${String(odu.numero).padStart(2, '0')}-${odu.nome.toLowerCase()}.md`;
  const filePath = path.join(baseDir, 'diagnostico', filename);
  
  const content = `---
id: "odu-${odu.numero}"
title: "${odu.nome}"
category: "diagnostico"
type: "odu"
number: ${odu.numero}
orixas: "${odu.orixas}"
essencia: "${odu.essencia}"
quizila: "${odu.quizila}"
conselho: "${odu.conselho}"
---

# Odú ${odu.nome} (${odu.numero})

Este documento contém a verdade canônica e esotérica para o Odú **${odu.nome}**, regido por **${odu.orixas}**.

## Essência e Energia Principal
${odu.essencia}

## Quizila e Preceitos
${odu.quizila}

## Conselho Oracular
${odu.conselho}
`;

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Generated: ${filePath}`);
});

console.log('Grimoire initialization complete.');
